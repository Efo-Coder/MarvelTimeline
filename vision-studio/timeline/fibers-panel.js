/* Die Regler des Faserfelds, mit laufender Vorschau daneben.

   Das Feld ist der Grund der ganzen Startseite und hat gut zwei Dutzend
   Stellschrauben, die alle in js/ghost-fibers-config.js stehen. Wer dort
   ohne Vorschau dreht, lädt nach jeder Zahl die Seite neu. Dieser Bereich
   zeigt die Seite und stellt die Schrauben daneben.

   Gezeigt wird dabei nichts Nachgebautes, sondern die Seite selbst: In
   der Bühne steht ein Rahmen mit index.html, geladen über /datei/ aus
   dem Repo. Was hier läuft, ist deshalb genau das, was ein Besucher
   sieht, samt Titel und Zeile darüber. Und genau darauf kommt es an: Ob
   die Fasern taugen, entscheidet sich daran, wie der Titel darauf steht,
   und nicht am Feld für sich allein. Gedreht wird über GhostFibers.set()
   im Rahmen, siehe den Kopf von js/ghost-fibers.js.

   Zwei Dinge stehen hier, die keine Regler sind: die Reihe der Phasen
   unter der Bühne und ihre Farben unten in der Spalte. Das Feld wechselt
   beim Rollen die Farbe, im Rahmen rollt aber niemand. Ohne die Reihe
   sähe man deshalb immer nur den Seitenanfang. Die Farben selbst stehen
   nicht bei den Reglern, sondern in js/data.js bei der Phase: Sie gehören
   der Phase und nicht dem Hintergrund.

   Er ist ein Reiter im Kopf wie die Plakatwand, keine Tafel über der
   Arbeitsfläche. Auf und zu geht er deshalb nicht von hier aus: Die
   Reiter gehören studio.js, und was dort umgeschaltet wird, kommt als
   Ereignis „bereichwechsel“ am Fenster an.

   Welche Regler es gibt, sagt der Server unter /api/fasern. Dieselbe
   Liste bestimmt dort auch, was beim Speichern durchgelassen wird, damit
   Oberfläche und Prüfung nicht auseinanderlaufen können.

   Diese Datei benutzt json() und melde() aus studio.js und wird deshalb
   nach ihr geladen. */

'use strict';

(() => {
  const bank = document.getElementById('fasern-bank');
  if (!bank) return;

  const $$ = (id) => document.getElementById(id);
  const rahmen = $$('fasern-rahmen');

  let stand = null;      // was zuletzt in den Dateien stand
  let entwurf = null;    // was gerade eingestellt ist
  let entwurfPhasen = [];
  let phaseNr = null;    // welche Phase die Vorschau zeigt, null = Seitenanfang
  let geholt = false;    // wurden die Regler schon geholt?

  /* Wie viele Nachkommastellen die Anzeige braucht, sagt die
     Schrittweite des Reglers: 0.05 sind zwei, 1 ist keine. */
  function zeige(wert, schritt) {
    if (typeof wert === 'boolean') return wert ? 'an' : 'aus';
    /* Eine Farbe trägt ihren Wert schon im Feld daneben. */
    if (typeof wert === 'string') return wert;
    const stellen = String(schritt).includes('.') ? String(schritt).split('.')[1].length : 0;
    return Number(wert).toFixed(stellen);
  }

  function schmutzig() {
    if (!stand) return false;
    for (const r of stand.regler) if (entwurf[r.name] !== stand.config[r.name]) return true;
    return stand.phasen.some((p, i) => {
      const e = entwurfPhasen[i];
      return e.accent !== p.accent
        || e.fibers[0] !== p.fibers[0]
        || e.fibers[1] !== p.fibers[1];
    });
  }

  function zeigeStand() {
    const offen = schmutzig();
    $$('fasern-offen').hidden = !offen;
    $$('fasern-sichern').disabled = !offen;
    $$('fasern-zurueck').disabled = !offen;
  }

  /* ---------- Die Vorschau ----------

     Der Rahmen zeigt die echte Seite. Bis sie steht, nimmt sie keine
     Anweisungen an, deshalb dieser kleine Umweg: Was vorher eingestellt
     wurde, wird beim Laden nachgereicht. */

  function feld() {
    try {
      return rahmen.contentWindow && rahmen.contentWindow.GhostFibers;
    } catch {
      return null;
    }
  }

  function setzeRegler(werte) {
    const F = feld();
    if (F && F.set) F.set(werte);
  }

  /* Die Farben der gewählten Phase in den Rahmen, ohne Überblendung: Wer
     hier eine Phase anklickt, will sie sehen und nicht auf sie warten.
     Am Seitenanfang steht null, dann gelten die Farben aus der Datei. */
  function setzePhaseImRahmen() {
    const F = feld();
    if (!F || !F.setPhase) return;
    const p = phaseNr === null ? null : entwurfPhasen[phaseNr];
    F.setPhase(p ? p.fibers.slice() : null, true);
  }

  /* Der Rahmen ist fest 1600 x 900 groß und wird verkleinert angezeigt,
     damit die Seite darin ein richtiges Fenster vorfindet und nicht ihre
     schmale Fassung baut. Wie stark, hängt an der Bühne: Sie steht im
     Seitenverhältnis 16:9 wie der Rahmen, ihre Breite geteilt durch 1600
     füllt sie also genau aus. Ohne das Nachmessen bliebe es bei den 0.5
     aus dem Stylesheet, und auf einem breiten Schirm läge um die
     Vorschau herum mehr Schwarz als Bild. */
  function passeZoomAn() {
    const buehne = rahmen.parentElement;
    const breite = buehne.clientWidth;
    if (!breite) return;
    buehne.style.setProperty('--wand-zoom', (breite / 1600).toFixed(4));
  }

  function starteVorschau() {
    if (rahmen.dataset.geladen) return;
    rahmen.dataset.geladen = 'ja';
    passeZoomAn();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(passeZoomAn).observe(rahmen.parentElement);
    }
    rahmen.addEventListener('load', () => {
      /* Die Seite im Rahmen soll sich wie eine Vorschau verhalten und
         nicht wie eine Seite: kein Rollen. Das Kopfband steht oben, und
         alles andere würde es nur aus dem Bild schieben. */
      try {
        const d = rahmen.contentDocument;
        d.documentElement.style.overflow = 'hidden';
        d.body.style.overflow = 'hidden';
      } catch { /* fremder Ursprung wäre ein Fehler weiter oben */ }
      if (entwurf) setzeRegler(entwurf);
      setzePhaseImRahmen();
    });
    rahmen.src = '/datei/index.html';
  }

  /* ---------- Die Regler ---------- */

  function baueRegler() {
    const behaelter = $$('fasern-regler');
    behaelter.textContent = '';
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
      behaelter.append(block);
    }
  }

  function baueZeile(r) {
    const zeile = document.createElement('label');
    zeile.className = 'galaxie-zeile';
    /* Was der Regler tut, sagt der Server mit. Sein Name in der Datei
       steht darunter, damit man ihn zum Nachschlagen in
       js/ghost-fibers-config.js parat hat. */
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
    } else if (r.art === 'farbe') {
      eingabe = document.createElement('input');
      eingabe.type = 'color';
      eingabe.value = entwurf[r.name];
      /* Ein Farbfeld meldet beim Ziehen fortwährend. Das ist gewollt,
         die Vorschau soll mitlaufen, und der Shader kostet nichts
         dabei. */
      eingabe.addEventListener('input', () => {
        /* Die beiden Grundfarben gelten nur, solange keine Phase im Bild
           steht. Sonst drehte man an einem Wert, von dem nichts zu sehen
           ist. */
        if (phaseNr !== null) waehlePhase(null);
        aendere(r, eingabe.value, wert);
      });
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

  /* ---------- Die Phasen ---------- */

  function bauePhasen() {
    const feldchen = $$('fasern-phasen');
    feldchen.textContent = '';
    const eintraege = [
      { titel: 'Die Farben aus js/ghost-fibers-config.js, wie im Kopfband' },
      ...entwurfPhasen,
    ];
    eintraege.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = i === 0 ? 'Seitenanfang' : 'Phase ' + p.num;
      b.title = i === 0 ? p.titel : p.titel + '\n\nZeigt diese Phase in der Vorschau.';
      b.classList.toggle('an', phaseNr === (i === 0 ? null : i - 1));
      b.addEventListener('click', () => waehlePhase(i === 0 ? null : i - 1));
      feldchen.append(b);
    });
  }

  function waehlePhase(nr) {
    phaseNr = nr;
    bauePhasen();
    setzePhaseImRahmen();
  }

  /* ---------- Farben der Phasen ----------

     Sie stehen nicht bei den Reglern, sondern in js/data.js bei der Phase
     selbst. Der Akzent färbt die ganze Oberfläche dieser Phase, davon ist
     in der Vorschau nur wenig zu sehen; die beiden Faserfarben sind das,
     was das Feld während der Phase trägt. */
  function farbfeld(wert, beiAenderung, hilfe) {
    const feldchen = document.createElement('input');
    feldchen.type = 'color';
    feldchen.value = wert;
    feldchen.title = hilfe;
    feldchen.addEventListener('input', () => beiAenderung(feldchen.value));
    return feldchen;
  }

  function bauePhasenFarben() {
    const behaelter = $$('fasern-phasenfarben');
    behaelter.textContent = '';
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
        zeigeStand();
      }, 'Der Akzent dieser Phase. Er färbt Ränder, Knöpfe und Marken der '
        + 'Seite, am Faserfeld hängt er nicht.'
        + '\n\nIn der Datei: PHASES[' + i + '].accent');

      const fasern = document.createElement('span');
      fasern.className = 'galaxie-faserfarben';
      ['Die Farbe der Fasern selbst', 'Die Farbe des Scheins in der Mitte und '
        + 'der ziehenden Wolke'].forEach((text, k) => {
        fasern.append(farbfeld(p.fibers[k], (hex) => {
          p.fibers[k] = hex;
          waehlePhase(i);
          zeigeStand();
        }, text + ', solange diese Phase im Bild steht.'
          + '\n\nIn der Datei: PHASES[' + i + '].fibers[' + k + ']'));
      });

      zeile.append(knopf, akzent, fasern);
      behaelter.append(zeile);
    });
  }

  /* ---------- Holen und Sichern ---------- */

  function uebernehmeStand() {
    entwurf = Object.assign({}, stand.config);
    entwurfPhasen = stand.phasen.map((p) => ({ ...p, fibers: p.fibers.slice() }));
  }

  async function hole() {
    if (geholt) return;
    geholt = true;
    try {
      stand = await json('/api/fasern');
      uebernehmeStand();
      baueRegler();
      bauePhasen();
      bauePhasenFarben();
      zeigeStand();
    } catch (e) {
      geholt = false;
      $$('fasern-warnung').textContent = 'Die Regler ließen sich nicht holen: ' + e.message;
      $$('fasern-warnung').hidden = false;
    }
  }

  async function sichere() {
    const knopf = $$('fasern-sichern');
    knopf.disabled = true;
    $$('fasern-warnung').hidden = true;
    try {
      const antwort = await json('/api/fasern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: entwurf, phasen: entwurfPhasen }),
      });
      stand.config = antwort.config;
      stand.phasen = antwort.phasen;
      uebernehmeStand();
      bauePhasenFarben();
      melde(antwort.geaendert ? 'Faserfeld gesichert' : 'Nichts zu sichern');
      zeigeStand();
    } catch (e) {
      $$('fasern-warnung').textContent = e.message;
      $$('fasern-warnung').hidden = false;
      melde('Nicht gesichert: ' + e.message, true);
      zeigeStand();
    }
  }

  /* Die Regler wieder auf den Stand der Datei stellen, ohne sie neu zu
     bauen: Jeder Steller trägt seinen Namen, der Rest ist Nachziehen.
     Die Farben der Phasen haben keine Steller mit Namen, ihre Reihe wird
     neu gebaut. */
  function stelleZurueck() {
    uebernehmeStand();
    for (const el of $$('fasern-regler').querySelectorAll('[data-regler]')) {
      const name = el.dataset.regler;
      const r = stand.regler.find((x) => x.name === name);
      if (el.type === 'checkbox') el.checked = !!entwurf[name];
      else el.value = entwurf[name];
      if (!r) continue;
      el.parentElement.querySelector('.galaxie-wert').textContent = zeige(entwurf[name], r.schritt);
    }
    bauePhasenFarben();
    setzeRegler(entwurf);
    setzePhaseImRahmen();
    zeigeStand();
  }

  $$('fasern-sichern').addEventListener('click', sichere);
  $$('fasern-zurueck').addEventListener('click', stelleZurueck);

  /* Gebaut wird erst, wenn der Bereich zum ersten Mal offen ist. Wer nur
     Porträts schneidet, soll dafür weder die Regler holen noch die halbe
     Startseite in einem Rahmen laufen lassen.

     Beim Verlassen hält das Feld an. Es rechnet sonst in einem Rahmen
     weiter, den niemand ansieht, und die Grafikkarte hat auf dieser
     Seite schon mit den Linien im Hintergrund zu tun. */
  window.addEventListener('bereichwechsel', (e) => {
    const F = feld();
    if (e.detail.bereich !== 'fasern') {
      if (F && F.pause) F.pause(true);
      return;
    }
    starteVorschau();
    hole();
    if (F && F.pause) F.pause(false);
  });
})();
