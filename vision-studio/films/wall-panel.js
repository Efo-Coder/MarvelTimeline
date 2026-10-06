/* Die Regler der Plakatwand, mit laufender Vorschau daneben.

   Die Wand steht im Kopfband der Filmseite und hat gut zwei Dutzend
   Stellschrauben, die alle in js/drift-wall-config.js stehen. Wer dort
   ohne Vorschau dreht, lädt nach jeder Zahl die Seite neu. Dieser
   Bereich zeigt die Wand und stellt die Schrauben daneben.

   Gezeigt wird dabei nichts Nachgebautes, sondern die Seite selbst: In
   der Bühne steht ein Rahmen mit films.html, geladen über /datei/ aus
   dem Repo. Was hier läuft, ist deshalb genau das, was ein Besucher
   sieht, samt Titel, Zeile und Uhr darüber. Gedreht wird über
   DriftWall.set() im Rahmen, siehe den Fuß von js/drift-wall.js.

   Er ist ein Reiter im Kopf wie die Galaxie, keine Tafel über der
   Arbeitsfläche. Auf und zu geht er deshalb nicht von hier aus: Die
   Reiter gehören studio.js, und was dort umgeschaltet wird, kommt als
   Ereignis „bereichwechsel“ am Fenster an.

   Welche Regler es gibt, sagt der Server unter /api/wand. Dieselbe Liste
   bestimmt dort auch, was beim Speichern durchgelassen wird, damit
   Oberfläche und Prüfung nicht auseinanderlaufen können.

   Diese Datei benutzt json() und melde() aus studio.js und wird deshalb
   nach ihr geladen. */

'use strict';

(() => {
  const bank = document.getElementById('wand-bank');
  if (!bank) return;

  const $$ = (id) => document.getElementById(id);
  const rahmen = $$('wand-rahmen');
  const blick = RahmenAusschnitt(rahmen); // nur der Hero, siehe rahmeEin()

  let stand = null;      // was zuletzt in der Datei stand
  let entwurf = null;    // was gerade eingestellt ist
  let geholt = false;    // wurden die Regler schon geholt?
  let takt = 0;          // das laufende Nachmessen, solange der Bereich offen ist

  /* Wie viele Nachkommastellen die Anzeige braucht, sagt die
     Schrittweite des Reglers: 0.05 sind zwei, 1 ist keine. */
  function zeige(wert, schritt) {
    if (typeof wert === 'boolean') return wert ? 'an' : 'aus';
    /* Eine Auswahl und eine Farbe tragen ihren Wert schon im Feld,
       daneben stünde er nur ein zweites Mal. */
    if (typeof wert === 'string') return '';
    const stellen = String(schritt).includes('.') ? String(schritt).split('.')[1].length : 0;
    return Number(wert).toFixed(stellen);
  }

  function schmutzig() {
    if (!stand) return false;
    for (const r of stand.regler) if (entwurf[r.name] !== stand.config[r.name]) return true;
    return false;
  }

  function zeigeStand() {
    const offen = schmutzig();
    $$('wand-offen').hidden = !offen;
    $$('wand-sichern').disabled = !offen;
    $$('wand-zurueck').disabled = !offen;
  }

  /* ---------- Die Vorschau ----------

     Der Rahmen zeigt die echte Seite. Bis sie steht, nimmt sie keine
     Anweisungen an, deshalb dieser kleine Umweg: Was vorher eingestellt
     wurde, wird beim Laden nachgereicht. */

  function wand() {
    try {
      return rahmen.contentWindow && rahmen.contentWindow.DriftWall;
    } catch {
      return null;
    }
  }

  function setzeRegler(werte) {
    const W = wand();
    if (W) W.set(werte);
  }

  function starteVorschau() {
    if (rahmen.dataset.geladen) return;
    rahmen.dataset.geladen = 'ja';
    rahmen.addEventListener('load', () => {
      /* Die Seite im Rahmen soll sich wie eine Vorschau verhalten und
         nicht wie eine Seite: kein Rollen, kein Sprung zu einem Titel.
         Beides würde nur das Kopfband aus dem Bild schieben. */
      try {
        const d = rahmen.contentDocument;
        d.documentElement.style.overflow = 'hidden';
        d.body.style.overflow = 'hidden';
      } catch { /* fremder Ursprung wäre ein Fehler weiter oben */ }
      if (entwurf) setzeRegler(entwurf);
      rahmeEin();
    });
    rahmen.src = '/datei/films.html';
  }

  /* Der Rahmen ist fest 1600 x 900 groß, damit die Seite die Anordnung
     eines Schreibtischfensters baut und nicht die eines schmalen.
     Gezeigt wird davon nur der Hero, das Kopfband mit der Wand, siehe
     ui-components/frame-crop.js.

     Oben fehlt ihm ein Streifen: Dort liegt die feste Kopfleiste der
     Seite über ihm, und was darunter liegt, sieht auch kein Besucher.
     Der Ausschnitt beginnt deshalb an ihrer Unterkante. */
  function rahmeEin() {
    let d;
    try {
      d = rahmen.contentDocument;
    } catch {
      return;
    }
    const hero = d && d.querySelector('.chars-masthead');
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    const kopf = d.querySelector('.site-header');
    const oben = kopf ? Math.max(r.top, kopf.getBoundingClientRect().bottom) : r.top;
    blick.setze({ x: r.left, y: oben, breite: r.width, hoehe: r.bottom - oben });
  }

  function passeZoom() {
    if (rahmen.parentElement.clientWidth) rahmeEin();
  }

  /* Nachgemessen wird regelmäßig, solange der Bereich offen ist: Die
     Schrift lädt nach, und mit ihr kann der Hero höher werden. Das kostet
     eine Messung je Takt. */
  function starteTakt() {
    if (!takt) takt = setInterval(rahmeEin, 400);
  }

  function haltTakt() {
    clearInterval(takt);
    takt = 0;
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(passeZoom).observe(rahmen.parentElement);
  } else {
    window.addEventListener('resize', passeZoom);
  }

  /* ---------- Die Regler ---------- */

  function baueRegler() {
    const feld = $$('wand-regler');
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
       js/drift-wall-config.js parat hat. */
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
      eingabe.addEventListener('input', () => aendere(r, eingabe.value, wert));
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

  /* Die Regler wieder auf den Stand der Datei stellen, ohne sie neu zu
     bauen: Jeder Steller trägt seinen Namen, der Rest ist Nachziehen. */
  function stelleZurueck() {
    entwurf = Object.assign({}, stand.config);
    for (const el of $$('wand-regler').querySelectorAll('[data-regler]')) {
      const name = el.dataset.regler;
      const r = stand.regler.find((x) => x.name === name);
      if (el.type === 'checkbox') el.checked = !!entwurf[name];
      else el.value = entwurf[name];
      if (!r) continue;
      el.parentElement.querySelector('.galaxie-wert').textContent = zeige(entwurf[name], r.schritt);
    }
    setzeRegler(entwurf);
    zeigeStand();
  }

  /* ---------- Holen und Sichern ---------- */

  async function hole() {
    if (geholt) return;
    geholt = true;
    try {
      stand = await json('/api/wand');
      entwurf = Object.assign({}, stand.config);
      baueRegler();
      zeigeStand();
    } catch (e) {
      geholt = false;
      $$('wand-warnung').textContent = 'Die Regler ließen sich nicht holen: ' + e.message;
      $$('wand-warnung').hidden = false;
    }
  }

  async function sichere() {
    const knopf = $$('wand-sichern');
    knopf.disabled = true;
    try {
      const antwort = await json('/api/wand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: entwurf }),
      });
      stand.config = antwort.config;
      entwurf = Object.assign({}, antwort.config);
      melde(antwort.geaendert ? 'Plakatwand gesichert' : 'Nichts zu sichern');
      zeigeStand();
    } catch (e) {
      melde('Nicht gesichert: ' + e.message, true);
      zeigeStand();
    }
  }

  $$('wand-sichern').addEventListener('click', sichere);
  $$('wand-zurueck').addEventListener('click', stelleZurueck);

  /* Gebaut wird erst, wenn der Bereich zum ersten Mal offen ist. Wer nur
     Porträts schneidet, soll dafür weder die Regler holen noch die halbe
     Filmseite in einem Rahmen laufen lassen. */
  window.addEventListener('bereichwechsel', (e) => {
    if (e.detail.bereich !== 'wand') { haltTakt(); return; }
    starteVorschau();
    starteTakt();
    passeZoom();
    hole();
  });
})();
