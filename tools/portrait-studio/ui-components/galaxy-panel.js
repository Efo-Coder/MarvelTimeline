/* Die Regler des Galaxie-Hintergrunds, mit laufender Vorschau daneben.

   Der Hintergrund der Seite ist kein Bild, sondern ein Shader mit gut
   zwanzig Stellschrauben, die alle in js/galaxy-config.js stehen. Wer
   dort ohne Vorschau dreht, lädt nach jeder Zahl die Seite neu. Diese
   Tafel zeigt dieselbe Galaxie, die auf der Seite läuft, und stellt die
   Schrauben daneben.

   Gezeichnet wird dabei nicht etwa nachgebaut: Der Dialog lädt die
   echten Dateien aus dem Repo (js/galaxy-config.js, js/galaxy.js und die
   Rückfallebene daneben) über /datei/ nach und lässt sie in seinem
   eigenen Canvas laufen. Was hier zu sehen ist, ist deshalb genau das,
   was die Seite zeigt, und nicht etwas Ähnliches.

   Welche Regler es gibt, sagt der Server unter /api/galaxie. Dieselbe
   Liste bestimmt dort auch, was beim Speichern durchgelassen wird, damit
   Oberfläche und Prüfung nicht auseinanderlaufen können.

   Diese Datei wird als einzige Komponente nach studio.js geladen, denn
   sie benutzt dessen json() und melde(). */

'use strict';

(() => {
  const knopf = document.getElementById('galaxie-knopf');
  const dialog = document.getElementById('galaxie-dialog');
  if (!knopf || !dialog) return;

  const $$ = (id) => document.getElementById(id);
  const leinwand = $$('galaxy');

  let stand = null;        // was zuletzt in den Dateien stand
  let entwurf = null;      // was gerade eingestellt ist
  let entwurfBereiche = null;
  let entwurfPhasen = null;
  let gestartet = false;   // läuft die Vorschau schon?
  let Gx = null;           // die Galaxy-Schnittstelle der Vorschau
  let phaseNr = null;      // gewählte Phase, null heißt Seitenanfang

  /* ---------- Kleinkram ---------- */

  function ladeSkript(pfad) {
    return new Promise((fertig, scheitern) => {
      const s = document.createElement('script');
      s.src = pfad;
      s.onload = () => fertig();
      s.onerror = () => scheitern(new Error('Lässt sich nicht laden: ' + pfad));
      document.head.appendChild(s);
    });
  }

  /* Wie viele Nachkommastellen die Anzeige braucht, sagt die Schrittweite
     des Reglers: 0.05 sind zwei, 1 ist keine. */
  function zeige(wert, schritt) {
    if (typeof wert === 'boolean') return wert ? 'an' : 'aus';
    /* Eine Auswahl trägt ihren Wert schon im Feld, daneben stünde er
       nur ein zweites Mal. */
    if (typeof wert === 'string') return '';
    const stellen = String(schritt).includes('.') ? String(schritt).split('.')[1].length : 0;
    return Number(wert).toFixed(stellen);
  }

  function alsHex(rgb) {
    return '#' + rgb.map((k) => Math.max(0, Math.min(255, Math.round(k)))
      .toString(16).padStart(2, '0')).join('');
  }

  function ausHex(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function schmutzig() {
    if (!stand) return false;
    for (const r of stand.regler) if (entwurf[r.name] !== stand.config[r.name]) return true;
    if (JSON.stringify(entwurfBereiche) !== JSON.stringify(stand.regions)) return true;
    return JSON.stringify(entwurfPhasen) !== JSON.stringify(stand.phasen);
  }

  /* Ein Farbfeld, wie es die Nebelbereiche und die Phasen brauchen. */
  function farbfeld(hex, beiAenderung, hilfe) {
    const feld = document.createElement('input');
    feld.type = 'color';
    feld.value = hex;
    feld.title = hilfe;
    feld.addEventListener('input', () => beiAenderung(feld.value));
    return feld;
  }

  function zeigeStand() {
    const offen = schmutzig();
    $$('galaxie-sichern').disabled = !offen;
    $$('galaxie-zurueck').disabled = !offen;
    $$('galaxie-offen').hidden = !offen;
  }

  /* ---------- Vorschau ---------- */

  /* Die WebGL2-Fassung nimmt Änderungen über Galaxy.set entgegen und zieht
     alles Nötige selbst nach. Die Rückfallebene kann das nicht, sie teilt
     sich mit ihr nur das GALAXY_CONFIG. Für sie steht hier von Hand, was
     nach welcher Änderung neu entstehen muss. */
  const BRAUCHT_NEBEL = ['nebFactor', 'nebOctaves', 'nebWarp', 'nebRoughness'];
  const BRAUCHT_STERNE = ['starDensity', 'faintDensity', 'brightDensity'];

  function setzeRegler(patch) {
    if (!Gx) return;
    if (Gx.set) { Gx.set(patch); return; }
    let nebel = false, sterne = false;
    for (const name of Object.keys(patch)) {
      window.GALAXY_CONFIG[name] = patch[name];
      if (BRAUCHT_NEBEL.includes(name)) nebel = true;
      if (BRAUCHT_STERNE.includes(name)) sterne = true;
    }
    if (nebel && Gx.rebake) Gx.rebake();
    if (sterne && Gx.rebuildStars) Gx.rebuildStars();
  }

  function setzeBereiche() {
    if (!Gx) return;
    if (Gx.setRegions) Gx.setRegions(entwurfBereiche);
    else if (Gx.rebake) {
      /* Ohne WebGL2 gibt es keine Schnittstelle für die Bereiche. Die
         Rückfallebene liest sie beim Backen direkt aus dem globalen
         Feld, also reicht es, das Feld zu setzen. */
      window.GALAXY_REGIONS.length = 0;
      entwurfBereiche.forEach((r) => window.GALAXY_REGIONS.push(r));
      Gx.rebake();
    }
  }

  /* Ohne Phase zeigt die Galaxie die Akzentfarben aller sechs
     nebeneinander, also das ganze Spektrum der Timeline. Genau so rechnet
     js/data.js sein DEFAULT_NEBULA aus, siehe dort. */
  function grundfarben() {
    return entwurfPhasen.map((p) => ausHex(p.accent));
  }

  function setzePalette() {
    if (!Gx) return;
    Gx.setPalette(phaseNr === null ? grundfarben() : entwurfPhasen[phaseNr].nebula);
    if (Gx.snapPalette) Gx.snapPalette();
  }

  function waehlePhase(nr) {
    phaseNr = nr;
    const feld = $$('galaxie-phasen');
    [...feld.children].forEach((b, i) => b.classList.toggle('an', i - 1 === nr || (nr === null && i === 0)));
    setzePalette();
  }

  async function starteVorschau() {
    if (gestartet) return;
    /* Das Studio läuft auf einem eigenen Server. Die Galaxie sucht ihr
       Grundbild unter assets/theme/, hier liegt es hinter /datei/. */
    window.GALAXY_BASE = '/datei/';
    /* Sonst greift der Renderer auf seine eingebauten Ersatzfarben
       zurück, denn js/data.js wird hier nicht geladen. */
    window.DEFAULT_NEBULA = grundfarben();
    for (const datei of ['galaxy-config.js', 'galaxy-canvas-2d.js', 'galaxy.js']) {
      await ladeSkript('/datei/js/' + datei);
    }
    Gx = window.Galaxy;
    gestartet = true;
    $$('galaxie-backend').textContent = Gx.backend === 'webgl2'
      ? 'WebGL2' : 'Canvas 2D, ohne WebGL2';
  }

  /* ---------- Regler bauen ---------- */

  function baueRegler() {
    const feld = $$('galaxie-regler');
    feld.textContent = '';
    const gruppen = new Map();
    for (const r of stand.regler) {
      if (!gruppen.has(r.gruppe)) gruppen.set(r.gruppe, []);
      gruppen.get(r.gruppe).push(r);
    }

    for (const [name, liste] of gruppen) {
      const block = document.createElement('div');
      block.className = 'galaxie-gruppe';
      const kopf = document.createElement('p');
      kopf.className = 'galaxie-gruppe-marke';
      kopf.textContent = name;
      block.append(kopf);

      for (const r of liste) block.append(baueZeile(r));
      feld.append(block);
    }
  }

  function baueZeile(r) {
    const zeile = document.createElement('label');
    zeile.className = 'galaxie-zeile';
    /* Was der Regler tut, sagt der Server mit. Sein Name in der Datei
       steht darunter, damit man ihn zum Nachschlagen in
       js/galaxy-config.js parat hat. */
    zeile.title = (r.hilfe ? r.hilfe + '\n\n' : '') + 'In der Datei: ' + r.name;

    const marke = document.createElement('span');
    marke.className = 'galaxie-marke';
    marke.textContent = r.titel;

    const wert = document.createElement('span');
    wert.className = 'galaxie-wert';

    let eingabe;
    if (r.art === 'schalter') {
      eingabe = document.createElement('input');
      eingabe.type = 'checkbox';
      eingabe.checked = !!entwurf[r.name];
      eingabe.addEventListener('change', () => aendere(r, eingabe.checked, wert));
    } else if (r.art === 'auswahl') {
      eingabe = document.createElement('select');
      for (const [w, text] of r.werte) {
        const o = document.createElement('option');
        o.value = w; o.textContent = text;
        eingabe.append(o);
      }
      eingabe.value = entwurf[r.name];
      eingabe.addEventListener('change', () => aendere(r, eingabe.value, wert));
    } else {
      eingabe = document.createElement('input');
      eingabe.type = 'range';
      eingabe.min = r.min; eingabe.max = r.max; eingabe.step = r.schritt;
      eingabe.value = entwurf[r.name];
      eingabe.addEventListener('input', () => aendere(r, Number(eingabe.value), wert));
    }
    eingabe.dataset.regler = r.name;
    wert.textContent = zeige(entwurf[r.name], r.schritt);
    zeile.append(marke, eingabe, wert);
    return zeile;
  }

  function aendere(r, neu, anzeige) {
    entwurf[r.name] = neu;
    anzeige.textContent = zeige(neu, r.schritt);
    setzeRegler({ [r.name]: neu });
    zeigeStand();
  }

  /* ---------- Nebelbereiche ---------- */

  /* Sechs Bereiche legen zusammen das Nebelbild. Farbe, Stärke und
     Feinheit stehen offen, die Lage steckt darunter: Sie verschiebt den
     ganzen Aufbau und will seltener angefasst werden. */
  const BEREICH_ZEILEN = [
    ['amp', 'Stärke', 0, 1.5, 0.02,
      'Wie kräftig dieser Bereich zum Nebelbild beiträgt. 0 nimmt ihn heraus, '
      + 'ohne die anderen fünf anzufassen.'],
    ['sc', 'Feinheit', 0.5, 10, 0.1,
      'Wie kleinteilig das Rauschen in diesem Bereich ist. Kleine Werte geben '
      + 'große, ruhige Schwaden, große geben viele feine Fäden.'],
  ];

  const BEREICH_LAGE = [
    ['x', 'Mitte quer', 0, 1.2, 0.01,
      'Wo die Mitte des Bereichs waagerecht sitzt. 0 ist der linke Rand des '
      + 'Nebelbilds, 1 der rechte.'],
    ['y', 'Mitte hoch', 0, 1.2, 0.01,
      'Wo die Mitte des Bereichs senkrecht sitzt. 0 ist oben, 1 ist unten.'],
    ['rx', 'Breite', 0, 1.2, 0.01,
      'Wie weit der Bereich von seiner Mitte aus nach links und rechts reicht. '
      + 'Nach außen hin wird er weich.'],
    ['ry', 'Höhe', 0, 1.2, 0.01,
      'Wie weit der Bereich von seiner Mitte aus nach oben und unten reicht.'],
  ];

  function baueBereiche() {
    const feld = $$('galaxie-bereiche');
    feld.textContent = '';
    entwurfBereiche.forEach((R, i) => {
      const kasten = document.createElement('div');
      kasten.className = 'galaxie-bereich';

      const kopf = document.createElement('div');
      kopf.className = 'galaxie-bereich-kopf';

      const farbe = document.createElement('input');
      farbe.type = 'color';
      farbe.value = alsHex(R.col);
      farbe.title = 'Die Farbe, die dieser Bereich zum Nebelbild beisteuert. '
        + 'Die Bereiche werden addiert, wo zwei sich überlappen, mischen sich '
        + 'ihre Farben also auf.';
      farbe.addEventListener('input', () => {
        R.col = ausHex(farbe.value);
        setzeBereiche();
        zeigeStand();
      });

      const nummer = document.createElement('span');
      nummer.className = 'galaxie-bereich-marke';
      nummer.textContent = 'Bereich ' + (i + 1);

      const grate = document.createElement('label');
      grate.className = 'galaxie-schalter';
      grate.title = 'Klappt das Rauschen an seiner Mitte nach oben. Aus weichen '
        + 'Hügeln werden dadurch scharfe Grate, und daraus entstehen die fasrigen '
        + 'Schlieren. Ohne Grate bleibt der Bereich eine runde Wolke.';
      const haken = document.createElement('input');
      haken.type = 'checkbox';
      haken.checked = !!R.ridged;
      haken.addEventListener('change', () => {
        R.ridged = haken.checked;
        setzeBereiche();
        zeigeStand();
      });
      grate.append(haken, document.createTextNode('Grate'));

      kopf.append(farbe, nummer, grate);
      kasten.append(kopf);

      for (const [schluessel, titel, min, max, schritt, hilfe] of BEREICH_ZEILEN) {
        kasten.append(baueBereichZeile(R, schluessel, titel, min, max, schritt, hilfe));
      }

      const lage = document.createElement('details');
      lage.className = 'galaxie-lage';
      const auf = document.createElement('summary');
      auf.textContent = 'Lage und Ausdehnung';
      auf.title = 'Wo der Bereich im Nebelbild sitzt und wie weit er reicht. '
        + 'Alle vier Werte sind Anteile des Bildes, 0.5 ist also die Mitte.';
      lage.append(auf);
      for (const [schluessel, titel, min, max, schritt, hilfe] of BEREICH_LAGE) {
        lage.append(baueBereichZeile(R, schluessel, titel, min, max, schritt, hilfe));
      }
      kasten.append(lage);

      feld.append(kasten);
    });
  }

  function baueBereichZeile(R, schluessel, titel, min, max, schritt, hilfe) {
    const zeile = document.createElement('label');
    zeile.className = 'galaxie-zeile';
    zeile.title = (hilfe ? hilfe + '\n\n' : '') + 'In der Datei: ' + schluessel;
    const marke = document.createElement('span');
    marke.className = 'galaxie-marke';
    marke.textContent = titel;
    const eingabe = document.createElement('input');
    eingabe.type = 'range';
    eingabe.min = min; eingabe.max = max; eingabe.step = schritt;
    eingabe.value = R[schluessel];
    const wert = document.createElement('span');
    wert.className = 'galaxie-wert';
    wert.textContent = zeige(R[schluessel], schritt);
    eingabe.addEventListener('input', () => {
      R[schluessel] = Number(eingabe.value);
      wert.textContent = zeige(R[schluessel], schritt);
      setzeBereiche();
      zeigeStand();
    });
    zeile.append(marke, eingabe, wert);
    return zeile;
  }

  /* ---------- Phasen ---------- */

  /* Der Schleier über dem Hintergrund trägt die Akzentfarben der gerade
     sichtbaren Phase. Ohne diese Reihe sähe man im Studio immer nur den
     Seitenanfang, auf dem alle sechs nebeneinander liegen. */
  function bauePhasen() {
    const feld = $$('galaxie-phasen');
    feld.textContent = '';
    const eintraege = [
      { titel: 'Alle sechs Akzente nebeneinander, wie am Seitenanfang' },
      ...entwurfPhasen,
    ];
    eintraege.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = i === 0 ? 'Seitenanfang' : 'Phase ' + p.num;
      b.title = p.titel;
      b.classList.toggle('an', phaseNr === (i === 0 ? null : i - 1));
      b.addEventListener('click', () => waehlePhase(i === 0 ? null : i - 1));
      feld.append(b);
    });
  }

  /* ---------- Farben der Phasen ---------- */

  /* Sie stehen nicht bei den Reglern, sondern in js/data.js bei der Phase
     selbst. Der Akzent färbt die ganze Oberfläche dieser Phase, hier ist
     davon nur seine Wirkung auf den Seitenanfang zu sehen. Die drei
     Nebelfarben sind das, was die Galaxie während der Phase zeigt. */
  function bauePhasenFarben() {
    const feld = $$('galaxie-phasenfarben');
    feld.textContent = '';
    entwurfPhasen.forEach((p, i) => {
      const zeile = document.createElement('div');
      zeile.className = 'galaxie-phasenfarbe';

      const knopf = document.createElement('button');
      knopf.type = 'button';
      knopf.className = 'galaxie-phasenname';
      knopf.textContent = 'Phase ' + p.num;
      knopf.title = p.titel + '\n\nZeigt diese Phase in der Vorschau.';
      knopf.addEventListener('click', () => waehlePhase(i));

      const akzent = farbfeld(p.accent, (hex) => {
        p.accent = hex;
        /* Der Akzent färbt Ränder, Knöpfe und Marken der Seite, davon ist
           hier nichts zu sehen. Was man sieht, ist seine zweite Aufgabe:
           Am Seitenanfang steuert jede Phase ihren Akzent zur Galaxie
           bei. Deshalb dorthin umschalten. */
        waehlePhase(null);
        zeigeStand();
      }, 'Der Akzent dieser Phase. Er färbt Ränder, Knöpfe und Marken der '
        + 'Seite, und am Seitenanfang steuert er zusätzlich eine der sechs '
        + 'Farben der Galaxie bei. In der Vorschau ist nur das Zweite zu sehen.'
        + '\n\nIn der Datei: PHASES[' + i + '].accent');

      const nebel = document.createElement('span');
      nebel.className = 'galaxie-nebelfarben';
      p.nebula.forEach((c, k) => {
        nebel.append(farbfeld(alsHex(c), (hex) => {
          p.nebula[k] = ausHex(hex);
          waehlePhase(i);
          zeigeStand();
        }, ['Erste', 'Zweite', 'Dritte'][k] + ' der drei Farben, die die Galaxie '
          + 'zeigt, solange diese Phase sichtbar ist. Sie liegen als Verlauf über '
          + 'der Bildschirmdiagonale, die erste links oben, die dritte rechts unten.'
          + '\n\nIn der Datei: PHASES[' + i + '].nebula[' + k + ']'));
      });

      zeile.append(knopf, akzent, nebel);
      feld.append(zeile);
    });
  }

  /* ---------- Laden, Speichern, Öffnen ---------- */

  function uebernehmeStand() {
    entwurf = { ...stand.config };
    entwurfBereiche = stand.regions.map((r) => ({ ...r, col: r.col.slice() }));
    entwurfPhasen = stand.phasen.map((p) => ({ ...p, nebula: p.nebula.map((c) => c.slice()) }));
  }

  async function oeffne() {
    dialog.showModal();
    $$('galaxie-warnung').hidden = true;
    try {
      if (!stand) {
        stand = await json('/api/galaxie');
        uebernehmeStand();
      }
      baueRegler();
      baueBereiche();
      bauePhasen();
      bauePhasenFarben();
      zeigeStand();
      await starteVorschau();
      if (Gx.pause) Gx.pause(false);
      /* Der frisch geladene Renderer steht auf den Werten aus der Datei.
         Ein Entwurf von vorhin muss danach wieder darüber. */
      setzeRegler(entwurf);
      setzeBereiche();
      setzePalette();
    } catch (fehler) {
      $$('galaxie-warnung').textContent = fehler.message;
      $$('galaxie-warnung').hidden = false;
    }
  }

  async function sichern() {
    const knopfS = $$('galaxie-sichern');
    knopfS.disabled = true;
    $$('galaxie-warnung').hidden = true;
    try {
      const antwort = await json('/api/galaxie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: entwurf, regions: entwurfBereiche, phasen: entwurfPhasen,
        }),
      });
      stand = {
        ...stand,
        config: antwort.config,
        regions: antwort.regions,
        phasen: antwort.phasen,
      };
      uebernehmeStand();
      melde(antwort.geaendert === false
        ? 'Es hat sich nichts geändert.'
        : 'Gesichert nach js/galaxy-config.js und js/data.js.');
      zeigeStand();
    } catch (fehler) {
      $$('galaxie-warnung').textContent = fehler.message;
      $$('galaxie-warnung').hidden = false;
      zeigeStand();
    }
  }

  function zuruecksetzen() {
    uebernehmeStand();
    baueRegler();
    baueBereiche();
    bauePhasenFarben();
    setzeRegler(entwurf);
    setzeBereiche();
    setzePalette();
    zeigeStand();
  }

  knopf.addEventListener('click', oeffne);
  $$('galaxie-sichern').addEventListener('click', sichern);
  $$('galaxie-zurueck').addEventListener('click', zuruecksetzen);
  $$('galaxie-zu').addEventListener('click', () => dialog.close());

  /* Ein geschlossener Dialog soll keine Grafikkarte beschäftigen. Der
     Entwurf bleibt dabei stehen, er lebt nur im Browser und hat die Datei
     nicht angefasst: Wer wieder aufmacht, findet seine Einstellung vor. */
  dialog.addEventListener('close', () => {
    if (Gx && Gx.pause) Gx.pause(true);
  });
})();
