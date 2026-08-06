/* Bild-Studio, Oberfläche.

   Zwei Bereiche, ein Werkzeug. Bei den **Porträts** ist der Ausschnitt ein
   Quadrat, aus dem die Seite einen Kreis maskiert. Bei den
   **Ganzkörperbildern** ist er ein freies Rechteck, und richtig ist er
   dann, wenn er randlos am sichtbaren Inhalt sitzt: Der Rahmen auf der
   Charakterseite rechnet damit, dass die Datei keine leere Fläche trägt,
   sonst steht die Figur zu klein darin und schwebt über der Bodenlinie.

   Der Ausschnitt ist immer { x, y, breite, hoehe } in Pixeln der Vorlage.
   Genau diese vier Zahlen gehen beim Speichern an den Server, der sie an
   bild.py weiterreicht. Die Bühne rechnet sie nur für die Anzeige um, es
   gibt keine zweite Wahrheit über den Zuschnitt. Im Porträt-Betrieb sind
   breite und hoehe immer gleich, das hält die ganze Bedienung zusammen. */

'use strict';

const $ = (id) => document.getElementById(id);

async function json(url, opt) {
  const antwort = await fetch(url, opt);
  let daten = null;
  try { daten = await antwort.json(); } catch { /* gleich unten */ }
  if (!antwort.ok || !daten || daten.fehler) {
    throw new Error((daten && daten.fehler) || `${antwort.status} ${antwort.statusText}`);
  }
  return daten;
}

let toastZeit = 0;
function melde(text, schlecht) {
  const t = $('toast');
  t.textContent = text;
  t.classList.toggle('schlecht', !!schlecht);
  t.hidden = false;
  clearTimeout(toastZeit);
  toastZeit = setTimeout(() => { t.hidden = true; }, schlecht ? 9000 : 5000);
}

/* ---------- Zustand ---------- */

const S = {
  bereich: 'portrait',   // 'portrait' oder 'ganzkoerper'
  figuren: [],
  zaehler: null,
  python: null,
  engine: null,        // Real-ESRGAN: { ok, pfad } oder { ok: false, grund }
  gesicht: null,       // Gesichtsmodelle: { ok, modelle } oder { ok: false, grund }
  gesichtModell: 'ohne',
  treue: 0.8,          // nur CodeFormer, siehe tools/gesicht/gesicht.py
  filter: 'alle',
  suche: '',
  figur: null,
  ziel: null,          // Eintrag aus figur.ziele bzw. figur.ganzkoerper
  quelle: null,        // { typ: 'fullsize', name } oder { typ: 'upload', id }
  upload: null,        // { id, name, url }
  bild: null,          // HTMLImageElement der Vorlage
  rect: null,          // { x, y, breite, hoehe } in Pixeln der Vorlage
  vorschlag: null,     // derselbe Aufbau, vom Server
  art: '',
  alpha: true,
  hilfslinien: true,
  rahmen: true,        // Rahmen der Charakterseite über der Bühne
  referenz: null,      // { datei, bild }: Schablone im Ausschnitt, nur Anhalt
  referenzAlpha: 0.45,
  kasten: null,        // Hülle des sichtbaren Inhalts, Quelle der Führungslinien
  eingerastet: { x: null, y: null },
  skala: 1,            // Körpergröße der Figur, so wie der Regler steht
  korrektur: 1,        // Feinkorrektur dieses Bildes, ebenso
  grund: 'dunkel',
  ansichtManuell: false,   // Nutzer führt Zoom und Lage des Bildes selbst
  verlauf: null,       // { zurueck, vor } vom Server
  frisch: new Map(),   // Datei -> Zeitstempel, bricht den Bildcache auf
};

const view = { k: 1, ox: 0, oy: 0 };

/* ---------- Farben der Bühne ----------

   Die Bühne wird auf eine Leinwand gezeichnet, ihre Farben stehen
   trotzdem in studio.css. Hier werden sie einmal abgelesen, damit das
   Aussehen des Studios an einer Stelle gepflegt wird. */
const FARBE = {};

function leseFarben() {
  const stil = getComputedStyle(document.documentElement);
  for (const name of ['buehne-bildrand', 'buehne-aussen', 'buehne-ecken',
    'buehne-hilfslinie', 'buehne-beschriftung', 'buehne-quadrat', 'buehne-kreis',
    'buehne-rahmen', 'buehne-rahmen-schwach', 'buehne-referenz',
    'buehne-griff', 'buehne-schrift', 'fuehrung-stark', 'fuehrung-schwach',
    'vorschau-dunkel', 'vorschau-hell', 'karo-hell', 'karo-dunkel']) {
    const kurz = name.replace(/-(.)/g, (_, z) => z.toUpperCase());
    FARBE[kurz] = stil.getPropertyValue('--' + name).trim();
  }
}

leseFarben();

/* Eine Führungslinie in der gewünschten Deckung. */
function fuehrungsfarbe(art, deckung) {
  const tripel = art === 'boden' || art === 'mitte'
    ? FARBE.fuehrungStark : FARBE.fuehrungSchwach;
  return `rgba(${tripel}, ${deckung})`;
}

/* Woher der vorgeschlagene Ausschnitt stammt, als Zeile unter den
   Werkzeugen. Die Schlüssel kommen aus bild.py und zuschnitt.py. Jeder
   Text folgt demselben Muster: erst die Herkunft, dann was das für die
   Verlässlichkeit heißt oder was zu tun ist. */
const AUSKUNFT = {
  'gesicht': 'Vorschlag: Das Gesicht wurde erkannt, die Kopfoberkante ist aus der Freistellung abgelesen. Dieser Vorschlag passt meistens.',
  'manuell': 'Vorschlag: Der Zuschnitt für diese Vorlage ist in manuell.json von Hand festgelegt und gilt als geprüft.',
  'maske': 'Vorschlag: Es wurde kein Gesicht erkannt, der Kopf ist aus der Umrissform geschätzt. Den Ausschnitt kurz prüfen.',
  'gesicht-ohne-alpha': 'Vorschlag: Das Gesicht wurde erkannt, die Vorlage ist aber nicht freigestellt. Die Kopfhöhe ist deshalb nur geschätzt.',
  'keine-erkennung': 'Kein Vorschlag: Es wurde weder ein Gesicht noch eine verwertbare Freistellung gefunden. Den Ausschnitt von Hand setzen.',
  'ohne-skill': 'Kein Vorschlag: Die Bilderkennung steht nicht bereit, siehe Hinweis oben im Kopf. Den Ausschnitt von Hand setzen.',
  'standard': 'Grober Startwert ohne Erkennung. Den Ausschnitt von Hand setzen oder „Automatisch zuschneiden“ drücken.',
  'rand': 'Randlos beschnitten: Der Ausschnitt umfasst genau die sichtbaren Pixel, so erwartet es der Rahmen der Charakterseite.',
  'ganzes-bild': 'Die Vorlage ist nicht freigestellt, darum gibt es keinen randlosen Zuschnitt. Den Ausschnitt von Hand setzen.',
  'ganzes': 'Der Ausschnitt umfasst die ganze Vorlage.',
};

/* Kurze Wege zu dem, was je Bereich gilt. */
const quadrat = () => S.bereich === 'portrait';
const zieleVon = (figur) => (quadrat() ? figur.ziele : figur.ganzkoerper);
const ordner = () => (quadrat() ? 'portraits' : 'fullsize');

function bildUrl(datei, welcher) {
  const wo = welcher || ordner();
  const frisch = S.frisch.get(wo + '/' + datei);
  return `/datei/assets/characters/${wo}/${datei}.webp` + (frisch ? `?v=${frisch}` : '');
}

/* ---------- Fortschritt ----------

   Der Server meldet über einen Ereignisstrom, was gerade läuft und wie
   weit es ist. Angezeigt wird die jüngste Arbeit, denn das ist die, die
   der Nutzer eben ausgelöst hat.

   Kurze Arbeiten sollen nicht aufblitzen: Der Kasten erscheint erst, wenn
   etwas länger als eine knappe halbe Sekunde dauert. Wer nur ein Porträt
   speichert, sieht deshalb meist gar nichts, und das ist richtig so. */
const ANZEIGE_AB = 400;          // Millisekunden, bevor der Kasten kommt
const ABSCHLUSS_STEHT = 550;     // so lange bleibt die volle Länge stehen

let anzeigeZeit = 0;
let ausblendZeit = 0;
let letzterLauf = null;
let letzterAnteil = 0;

function versteckeFortschritt() {
  clearTimeout(anzeigeZeit);
  clearTimeout(ausblendZeit);
  anzeigeZeit = 0;
  ausblendZeit = 0;
  letzterLauf = null;
  letzterAnteil = 0;
  $('fortschritt').hidden = true;
  $('fortschritt-balken').style.width = '0';
}

function zeigeFortschritt(lauf) {
  const kasten = $('fortschritt');

  if (!lauf) {
    /* Der Lauf ist weg. War er fertig, bleibt die volle Länge noch einen
       Moment stehen: Die Breite wandert dorthin über eine knappe
       Drittelsekunde, und ein Balken, der nie ankommt, wirkt hängen
       geblieben. Ein Abbruch dagegen verschwindet sofort, er hat die
       hundert Prozent ja nicht verdient. */
    if (kasten.hidden || letzterAnteil < 0.999 || ausblendZeit) {
      if (!ausblendZeit) versteckeFortschritt();
      return;
    }
    letzterLauf = null;
    $('fortschritt-zahl').textContent = '100 %';
    $('fortschritt-balken').style.width = '100%';
    ausblendZeit = setTimeout(versteckeFortschritt, ABSCHLUSS_STEHT);
    return;
  }

  /* Ein neuer Lauf während des Nachleuchtens übernimmt sofort. */
  if (ausblendZeit) {
    clearTimeout(ausblendZeit);
    ausblendZeit = 0;
  }

  const balken = $('fortschritt-balken');
  /* Löst eine neue Arbeit die eben fertige ab, fiele der Balken von voll
     auf leer und das Auge läse es als Rückschritt. Der Sprung nach unten
     geschieht deshalb ohne Übergang, nur das Wachsen wird animiert. */
  if (lauf.anteil < letzterAnteil) {
    balken.style.transition = 'none';
    balken.style.width = (lauf.anteil * 100).toFixed(1) + '%';
    void balken.offsetWidth;                 // erzwingt den Umbruch sofort
    balken.style.transition = '';
  }

  letzterLauf = lauf;
  letzterAnteil = lauf.anteil;
  $('fortschritt-titel').textContent = lauf.titel;
  $('fortschritt-zahl').textContent = Math.round(lauf.anteil * 100) + ' %';
  balken.style.width = (lauf.anteil * 100).toFixed(1) + '%';
  $('fortschritt-schritt').textContent = lauf.schritt || '';

  if (kasten.hidden && !anzeigeZeit) {
    const alter = Date.now() - lauf.seit;
    anzeigeZeit = setTimeout(() => {
      anzeigeZeit = 0;
      if (letzterLauf) kasten.hidden = false;
    }, Math.max(0, ANZEIGE_AB - alter));
  }
}

function hoereFortschritt() {
  const strom = new EventSource('/api/fortschritt');
  strom.addEventListener('message', (ev) => {
    let stand;
    try { stand = JSON.parse(ev.data); } catch { return; }
    zeigeFortschritt(stand.laeufe[0] || null);
  });
  /* Fällt die Verbindung, verbindet der Browser von allein neu. Die
     Anzeige geht dabei ohne Nachleuchten weg: Wie weit die Arbeit
     gekommen ist, weiß hier gerade niemand. */
  strom.addEventListener('error', versteckeFortschritt);
}

/* ---------- Start ---------- */

async function start() {
  hoereFortschritt();
  try {
    const daten = await json('/api/figuren');
    S.figuren = daten.figuren;
    S.zaehler = daten.zaehler;
    S.python = daten.python;
    S.engine = daten.engine;
    S.gesicht = daten.gesicht;
    richteGesichtEin();
    pruefeStand(daten.stand);
    frischerVerlauf(daten.verlauf);

    /* Die Adresse merkt sich Bereich und Figur, ein Neuladen landet wieder
       dort. So lässt sich auch von außen eine Figur aufschlagen. */
    let marke = decodeURIComponent(location.hash.slice(1));
    if (marke.startsWith('gk:')) {
      S.bereich = 'ganzkoerper';
      marke = marke.slice(3);
      for (const b of $('bereich').children) b.classList.toggle('an', b.dataset.bereich === 'ganzkoerper');
      richteBereichEin();
    }

    zeigeZaehler();
    baueListe();
    if (marke && S.figuren.some((f) => f.slug === marke)) waehleFigur(marke);

    if (!S.python.ok) {
      const p = $('python-hinweis');
      p.textContent = S.python.grund;
      p.hidden = false;
    } else if (!S.python.skill) {
      const p = $('python-hinweis');
      p.textContent = 'Der Porträt-Skill unter .claude liegt nicht vor. '
        + 'Zuschneiden und Speichern gehen, nur der Kopf-Vorschlag der Porträts fehlt.';
      p.hidden = false;
    }
  } catch (fehler) {
    melde('Die Figuren ließen sich nicht laden: ' + fehler.message, true);
  }
}

/* Läuft der Server noch mit dem Code von vorhin, oder ist dieser Tab
   älter als die Dateien auf der Platte? Beides sieht man dem Studio sonst
   nicht an: Es tut dann seelenruhig das, was es früher einmal tat. */
let seitenStand = null;

function pruefeStand(stand) {
  if (!stand) return;
  if (seitenStand === null) seitenStand = stand.seite;
  const zeilen = [];
  if (stand.serverAlt && stand.serverAlt.length) {
    zeilen.push(`${stand.serverAlt.join(' und ')} wurde geändert, seit dieser Server läuft. `
      + 'Er arbeitet weiter mit der alten Fassung, ein Neustart holt sie nach.');
  }
  if (stand.seite > seitenStand) {
    zeilen.push('Die Oberfläche ist älter als ihre Dateien. Seite neu laden.');
  }
  const p = $('stand-hinweis');
  p.textContent = zeilen.join(' ');
  p.hidden = !zeilen.length;
}

/* Der Stand im Kopf, als Reihe kurzer Anzeigen statt als Satz: erst die
   Zahl, darunter das Wort. So steht in jeder Spalte dasselbe an derselben
   Stelle und das Auge findet die gesuchte Zahl, ohne den Satz zu lesen.
   Die Art färbt die Zahl, dieselben Farben wie die Punkte in der Liste. */
function zeigeZaehler() {
  const z = S.zaehler;
  const teile = quadrat()
    ? [
        ['Figuren', S.figuren.length, ''],
        ['Porträts', z.gesamt, ''],
        ['Freigestellt', z.fertig, 'gut'],
        ['Noch alt', z.alt, 'warn'],
        ['Markiert', z.markiert, 'merk'],
        ['Ohne Datei', z.fehlt, 'fehlt'],
      ]
    : [
        ['Figuren', S.figuren.length, ''],
        ['Ganzkörper', z.gk.gesamt, ''],
        ['Fertig', z.gk.fertig, 'gut'],
        ['Markiert', z.gk.markiert, 'merk'],
        ['Ohne Datei', z.gk.fehlt, 'fehlt'],
      ];

  /* Was null ist, gibt es nicht, und was null zählt, lohnt die Spalte
     nicht. Die beiden ersten Anzeigen bleiben immer stehen, sie sind der
     Umfang der Arbeit und nicht ihr Ergebnis. */
  $('zaehler').innerHTML = teile
    .filter(([, zahl], i) => i < 2 || zahl)
    .map(([wort, zahl, art]) =>
      `<span class="stat"><b class="${art}">${zahl}</b><i>${wort}</i></span>`)
    .join('');
}

/* ---------- Bereich wechseln ---------- */

function richteBereichEin() {
  const gk = !quadrat();
  document.querySelector('.werkbank').classList.toggle('gk', gk);
  $('vorschau-portrait').hidden = gk;
  $('vorschau-ganzkoerper').hidden = !gk;
  $('merken-feld').hidden = gk;
  /* Der Rahmen gehört zum Ganzkörperbild. Beim Porträt gibt es ihn nicht,
     dort schneidet der Kreis. */
  $('rahmen-feld').hidden = !gk;
  $('speichern').title = gk
    ? 'Schneidet die Datei und schreibt Körpergröße und Bildkorrektur mit nach js/chars.js.'
    : '';
  $('ziel-titel').textContent = gk ? 'Ganzkörperbild' : 'Porträt';
  $('quell-titel').textContent = gk ? 'Anderes Bild' : 'Vorlage';
  $('auto').textContent = gk ? 'Randlos beschneiden' : 'Automatisch zuschneiden';
  $('auto').title = gk
    ? 'Schneidet auf die Hülle aller sichtbaren Pixel, wie tools/crop-fullsize.py'
    : 'Nimmt den Kopf-Vorschlag des Porträt-Skills';
}

function wechsleBereich(bereich) {
  if (bereich === S.bereich) return;
  S.bereich = bereich;
  for (const b of $('bereich').children) b.classList.toggle('an', b.dataset.bereich === bereich);
  richteBereichEin();
  zeigeZaehler();
  baueListe();
  if (S.figur) waehleFigur(S.figur.slug);
  else filtern();
}

/* ---------- Liste ---------- */

/* Ein- und ausklappen. Die Breite macht das Raster in studio.css, hier
   stehen nur der Zustand und die Beschriftung des Knopfes. */
function zeigeListe(offen) {
  const raster = document.querySelector('.raster');
  const knopf = $('liste-schalter');
  raster.classList.toggle('zu', !offen);
  knopf.textContent = offen ? '◀' : '▶';
  knopf.title = offen ? 'Figurenliste ausblenden' : 'Figurenliste einblenden';
  knopf.setAttribute('aria-expanded', String(offen));
  /* Eingeklappt ist die Liste auch für die Tabulatortaste weg. Sonst
     wanderte der Fokus in eine Spalte, die niemand sieht. */
  $('spalte-liste').inert = !offen;
}

/* „markiert“ ist der Handeingriff: Die Datei ist da, taugt dem Nutzer aber
   trotzdem noch nicht. Sie zählt damit als offen. */
function zielZustand(ziel) {
  if (ziel.zustand !== 'fertig') return ziel.zustand;
  return ziel.markiert ? 'markiert' : 'fertig';
}

/* Der Zustand einer Figur ist der schlechteste ihrer Bilder. */
function figurZustand(figur) {
  const ziele = zieleVon(figur);
  if (!ziele.length || ziele.some((z) => z.zustand === 'fehlt')) return 'fehlt';
  if (ziele.some((z) => z.zustand === 'alt')) return 'alt';
  if (ziele.some((z) => z.markiert)) return 'markiert';
  return 'fertig';
}

function listenBild(figur) {
  const ziele = zieleVon(figur);
  return bildUrl(ziele.length ? ziele[0].datei : figur.slug);
}

function baueListe() {
  const liste = $('liste');
  liste.textContent = '';
  for (const figur of S.figuren) {
    const li = document.createElement('li');
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'eintrag' + (quadrat() ? '' : ' gk');
    knopf.dataset.slug = figur.slug;

    const bild = document.createElement('img');
    bild.loading = 'lazy';
    bild.alt = '';
    bild.src = listenBild(figur);
    bild.addEventListener('error', () => { bild.style.visibility = 'hidden'; });

    const text = document.createElement('span');
    text.className = 'eintrag-text';
    const name = document.createElement('span');
    name.className = 'eintrag-name';
    name.textContent = figur.name;
    const unten = document.createElement('span');
    unten.className = 'eintrag-unten';
    unten.textContent = [figur.rolle, `${figur.auftritte} Auftritt${figur.auftritte === 1 ? '' : 'e'}`]
      .filter(Boolean).join(' · ');
    text.append(name, unten);

    knopf.append(bild, text);
    const ziele = zieleVon(figur);
    if (ziele.length > 1) {
      const marke = document.createElement('span');
      marke.className = 'marke';
      marke.textContent = ziele.length + ' Fassungen';
      knopf.append(marke);
    }
    const punkt = document.createElement('span');
    punkt.className = 'punkt ' + figurZustand(figur);
    knopf.append(punkt);

    knopf.addEventListener('click', () => waehleFigur(figur.slug));
    li.append(knopf);
    figur._knopf = knopf;
    figur._bild = bild;
    figur._punkt = punkt;
    liste.append(li);
  }
  filtern();
  if (S.figur) S.figur._knopf.classList.add('an');
}

function filtern() {
  const suche = S.suche.trim().toLowerCase();
  for (const figur of S.figuren) {
    const zustand = figurZustand(figur);
    let passt = S.filter === 'alle'
      || (S.filter === 'offen' && zustand !== 'fertig')
      || (S.filter === 'fertig' && zustand === 'fertig')
      || (S.filter === 'fehlt' && zustand === 'fehlt');
    if (passt && suche) {
      const heuhaufen = [figur.name, figur.rolle, figur.slug,
        ...zieleVon(figur).map((z) => z.datei), ...figur.filme].join(' ').toLowerCase();
      passt = heuhaufen.includes(suche);
    }
    figur._knopf.parentElement.hidden = !passt;
  }
}

function frischeListe(figur) {
  figur._punkt.className = 'punkt ' + figurZustand(figur);
  if (figur._bild && zieleVon(figur).length) {
    figur._bild.style.visibility = '';
    figur._bild.src = listenBild(figur);
  }
}

/* ---------- Figur, Ziel, Vorlage ---------- */

async function waehleFigur(slug) {
  const figur = S.figuren.find((f) => f.slug === slug);
  if (!figur) return;
  S.figur = figur;
  /* Ein hochgeladenes Bild gehört zu der Figur, für die es gedacht war.
     Beim Wechsel muss deshalb auch die Wahl der Vorlage fallen, sonst
     zeigt der Ausschnitt auf ein Bild, das es nicht mehr gibt. */
  if (S.upload) URL.revokeObjectURL(S.upload.url);
  S.upload = null;
  S.quelle = null;
  history.replaceState(null, '', '#' + (quadrat() ? '' : 'gk:') + figur.slug);
  for (const f of S.figuren) f._knopf.classList.toggle('an', f === figur);
  figur._knopf.scrollIntoView({ block: 'nearest' });

  $('leerzustand').hidden = true;
  $('arbeit').hidden = false;
  $('figur-name').textContent = figur.name;
  $('figur-rolle').textContent = figur.rolle;
  $('figur-filme').textContent = figur.filme.join(', ');
  $('figur-filme').title = figur.filme.join(', ');
  baueReferenzWahl();

  return waehleZiel(zieleVon(figur)[0] || null);
}

/* Zu einem Ziel die passende Vorlage.

   Beim Porträt ist das ein Ganzkörperbild: Trägt eines denselben Namen
   wie das Ziel, ist es die richtige Fassung, sonst das Standardbild.
   Beim Ganzkörperbild ist die Vorlage das Bild selbst, es wird ja neu
   beschnitten. Fehlt es noch, gibt es nichts vorzuschlagen und der Nutzer
   lädt eines hoch. */
function passendeQuelle(ziel) {
  if (!ziel) return null;
  const eigen = S.figur.quellen.find((q) => q.datei === ziel.datei);
  if (!quadrat()) return eigen ? { typ: 'fullsize', name: eigen.datei } : null;
  if (!S.figur.quellen.length) return null;
  return { typ: 'fullsize', name: (eigen || S.figur.quellen[0]).datei };
}

async function waehleZiel(ziel) {
  S.ziel = ziel;
  /* Die Regler stehen auf dem, was für diese Fassung in chars.js steht:
     die Körpergröße aus FULLSIZE_SCALE, die Feinkorrektur des Bildes aus
     FULLSIZE_FIT. Ohne Eintrag ist beides 1.0, also ein erwachsener
     Mensch in einem Bild, an dem nichts auszugleichen ist. */
  S.skala = (ziel && ziel.skala) || 1;
  S.korrektur = (ziel && ziel.korrektur) || 1;
  $('skala').value = String(S.skala);
  $('korrektur').value = String(S.korrektur);
  frischeSkalaFelder();
  zeichneChips();
  if (!ziel) {
    zeigeLeer('Diese Figur hat in diesem Bereich kein Bild in der Datenbank.');
    frischeDaten();
    return;
  }
  /* Jede Fassung bringt ihre eigene Vorlage mit. Ein hochgeladenes Bild
     bleibt deshalb nicht am Werkzeug hängen, wenn die Fassung wechselt,
     sonst zeigte die Vorschau überall dasselbe. Sein Chip bleibt stehen,
     ein Klick holt es zurück. */
  const quelle = passendeQuelle(ziel);
  if (!quelle) {
    S.quelle = null;
    zeichneChips();
    zeigeLeer(quadrat()
      ? 'Für diese Figur gibt es kein Ganzkörperbild. '
        + 'Ein eigenes Bild hochladen, dann geht es weiter.'
      : 'Für diese Fassung gibt es noch kein Bild. '
        + 'Ein eigenes Bild hochladen, dann geht es weiter.');
    frischeDaten();
    return;
  }
  return waehleQuelle(quelle);
}

function zeichneChips() {
  const figur = S.figur;
  const ziele = zieleVon(figur);
  const zieleFeld = $('ziele');
  zieleFeld.textContent = '';
  $('ziel-block').hidden = !ziele.length;
  for (const ziel of ziele) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (ziel === S.ziel ? ' an' : '');
    const punkt = document.createElement('span');
    punkt.className = 'punkt ' + zielZustand(ziel);
    const text = document.createElement('span');
    text.textContent = ziel.label;
    chip.append(punkt, text);
    chip.title = `${ziel.datei}.webp`
      + (ziel.filme ? ' · ' + ziel.filme.join(', ') : '')
      + (ziel.zustand === 'fehlt' ? ' · noch keine Datei' : '')
      + (ziel.markiert ? ' · von Hand als offen markiert' : '');
    chip.addEventListener('click', () => waehleZiel(ziel));
    zieleFeld.append(chip);
  }
  frischeFassungsleiste();

  const quellenFeld = $('quellen');
  for (const alt of [...quellenFeld.querySelectorAll('.chip:not(#upload-knopf)')]) alt.remove();
  const knopf = $('upload-knopf');
  /* Beim Porträt ist die Vorlage eine Wahl: Aus welchem Ganzkörperbild
     wird der Kopf geschnitten. Beim Ganzkörperbild gibt es nichts zu
     wählen, die Fassung ist ihre eigene Vorlage. Eine zweite Reihe mit
     denselben Beschriftungen führte dort nur in die Irre. */
  for (const quelle of quadrat() ? figur.quellen : []) {
    const chip = document.createElement('button');
    chip.type = 'button';
    const an = S.quelle && S.quelle.typ === 'fullsize' && S.quelle.name === quelle.datei;
    chip.className = 'chip' + (an ? ' an' : '');
    const bild = document.createElement('img');
    bild.src = bildUrl(quelle.datei, 'fullsize');
    bild.alt = '';
    const text = document.createElement('span');
    text.textContent = quelle.label;
    chip.append(bild, text);
    chip.title = quelle.datei + '.webp';
    chip.addEventListener('click', () => waehleQuelle({ typ: 'fullsize', name: quelle.datei }));
    quellenFeld.insertBefore(chip, knopf);
  }
  if (S.upload) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (S.quelle && S.quelle.typ === 'upload' ? ' an' : '');
    chip.textContent = S.upload.name;
    chip.title = 'Hochgeladen: ' + S.upload.name;
    chip.addEventListener('click', () => waehleQuelle({ typ: 'upload', id: S.upload.id }));
    quellenFeld.insertBefore(chip, knopf);
  }
}

function zeigeLeer(text) {
  /* Eine noch laufende Vorlage darf hier nicht mehr ankommen: Wer eine
     Fassung ohne Bild wählt, während die vorige noch lädt, bekäme sonst
     das alte Bild auf die leere Bühne gemalt. */
  lauf += 1;
  S.bild = null;
  S.rect = null;
  verwirfStapel();
  $('buehne-leer').textContent = text;
  $('buehne-leer').hidden = false;
  zeichne();
  vorschau();
}

function bildLaden(url) {
  return new Promise((fertig, scheitern) => {
    const bild = new Image();
    bild.onload = () => fertig(bild);
    bild.onerror = () => scheitern(new Error('Bild nicht lesbar: ' + url));
    bild.src = url;
  });
}

/* ---------- Führungslinien ----------

   Alle Linien kommen aus der Hülle des sichtbaren Inhalts: der Boden
   unter den Füßen, der Scheitel, die beiden Seiten und die Senkrechte
   durch die Mitte der Figur. Sie wird einmal je Vorlage im Browser
   ausgemessen, mit derselben Alphaschwelle wie bild.py. Ein Wert von 8
   statt 0, weil verlustbehaftetes WebP einen unsichtbaren Saum mit
   Alphawerten von 1 bis 7 über das ganze Bild legt. */
const ALPHA_MIN = 8;

function messeInhalt(bild) {
  const b = bild.naturalWidth;
  const h = bild.naturalHeight;
  try {
    const flaeche = document.createElement('canvas');
    flaeche.width = b;
    flaeche.height = h;
    const k = flaeche.getContext('2d', { willReadFrequently: true });
    k.drawImage(bild, 0, 0);
    const daten = k.getImageData(0, 0, b, h).data;
    let links = b;
    let rechts = -1;
    let oben = h;
    let unten = -1;
    let durchsichtig = 0;
    for (let y = 0; y < h; y++) {
      const zeile = y * b * 4;
      for (let x = 0; x < b; x++) {
        const a = daten[zeile + x * 4 + 3];
        if (a < 250) durchsichtig += 1;
        if (a <= ALPHA_MIN) continue;
        if (x < links) links = x;
        if (x > rechts) rechts = x;
        if (y < oben) oben = y;
        unten = y;
      }
    }
    if (rechts < links || unten < oben) return null;
    /* Dieselbe Faustregel wie in bild.py: Unter zwei Prozent
       durchsichtiger Fläche gilt die Vorlage als nicht freigestellt. */
    return {
      links, oben, rechts: rechts + 1, unten: unten + 1,
      alpha: durchsichtig / (b * h) >= 0.02,
    };
  } catch {
    return null;                 // etwa eine fremde Quelle ohne Freigabe
  }
}

/* Die Linien je Achse, mit Art für Farbe und Beschriftung. */
function fuehrungen() {
  const x = [];
  const y = [];
  if (!S.bild) return { x, y };
  x.push({ wert: 0, art: 'rand' }, { wert: S.bild.naturalWidth, art: 'rand' });
  y.push({ wert: 0, art: 'rand' }, { wert: S.bild.naturalHeight, art: 'rand' });
  const k = S.kasten;
  if (k) {
    x.push({ wert: k.links, art: 'inhalt' }, { wert: k.rechts, art: 'inhalt' });
    x.push({ wert: (k.links + k.rechts) / 2, art: 'mitte', name: 'Mitte' });
    y.push({ wert: k.oben, art: 'inhalt' });
    y.push({ wert: k.unten, art: 'boden', name: 'Boden' });
  }
  return { x, y };
}

/* Die nächstgelegene Linie innerhalb der Toleranz, sonst nichts. */
function naechste(wert, linien, toleranz) {
  let beste = null;
  let abstand = toleranz;
  for (const linie of linien) {
    const d = Math.abs(linie.wert - wert);
    if (d <= abstand) {
      abstand = d;
      beste = linie;
    }
  }
  return beste;
}

/* Sieben Bildschirmpunkte fühlen sich bei jedem Zoom gleich an. */
const toleranz = () => 7 / view.k;

/* Den verschobenen Ausschnitt einrasten: Für jede Achse zählen die beiden
   Kanten und die Mitte, die geringste Abweichung gewinnt. */
function rasteVerschieben(r) {
  S.eingerastet = { x: null, y: null };
  if (!S.hilfslinien) return;
  const f = fuehrungen();
  const tol = toleranz();
  for (const [achse, kante, mass, linien] of [
    ['x', 'x', 'breite', f.x], ['y', 'y', 'hoehe', f.y],
  ]) {
    let treffer = null;
    for (const versatz of [0, r[mass] / 2, r[mass]]) {
      const linie = naechste(r[kante] + versatz, linien, tol);
      if (!linie) continue;
      const d = Math.abs(linie.wert - (r[kante] + versatz));
      if (!treffer || d < treffer.d) treffer = { d, linie, versatz };
    }
    if (!treffer) continue;
    r[kante] = treffer.linie.wert - treffer.versatz;
    S.eingerastet[achse] = treffer.linie;
  }
}

/* Eine einzelne Kante beim Ziehen einrasten. Gibt den Wert zurück. */
function rasteKante(wert, achse) {
  if (!S.hilfslinien) return wert;
  const linie = naechste(wert, fuehrungen()[achse], toleranz());
  if (!linie) return wert;
  S.eingerastet[achse] = linie;
  return linie.wert;
}

/* Ohne Vorschlag vom Server: beim Porträt ein Quadrat oben in der
   Bildmitte, denn bei einem Ganzkörperbild ist der Kopf rund 13 Prozent
   der Höhe hoch und der Ausschnitt damit rund 22 Prozent. Beim
   Ganzkörperbild die ganze Vorlage, da ist nichts zu raten. */
function standardRect(breite, hoehe) {
  if (!quadrat()) return { x: 0, y: 0, breite, hoehe };
  const seite = Math.min(breite * 1.2, hoehe * 0.22);
  return { x: (breite - seite) / 2, y: 0, breite: seite, hoehe: seite };
}

/* Zählt jede Wahl einer Vorlage mit. Wer zweimal schnell klickt, wartet
   sonst auf zwei Bilder, und das langsamere käme zuletzt an. */
let lauf = 0;

async function waehleQuelle(quelle) {
  if (quelle.typ === 'upload' && !S.upload) return;
  const meiner = ++lauf;
  S.quelle = quelle;
  zeichneChips();
  $('buehne-leer').hidden = true;
  $('art').textContent = 'Vorlage wird geladen …';

  const url = quelle.typ === 'upload' ? S.upload.url : bildUrl(quelle.name, 'fullsize');
  let bild;
  try {
    bild = await bildLaden(url);
  } catch (fehler) {
    if (meiner !== lauf) return;
    S.bild = null;
    zeigeLeer(fehler.message);
    return;
  }
  if (meiner !== lauf) return;
  S.bild = bild;
  S.kasten = messeInhalt(bild);

  /* Ein Vorlagenwechsel ist kein Schritt am Ausschnitt, sondern ein
     neuer Zusammenhang. Was gerade in Arbeit war, gehört nicht dazu. */
  verwirfStapel();
  S.rect = standardRect(S.bild.naturalWidth, S.bild.naturalHeight);
  S.vorschlag = null;
  S.art = quadrat() ? 'standard' : 'ganzes';
  S.alpha = true;
  passeAnsichtAn(true);
  zeichne();
  vorschau();
  frischeDaten();

  /* Beim Ganzkörperbild steht der Vorschlag sofort, beim Porträt muss
     der Skill das Gesicht suchen. */
  if (!quadrat()) setzeRandlos(false);
  else if (S.python.ok) await holeVorschlag();
  else $('art').textContent = AUSKUNFT['ohne-skill'];
}

/* Der randlose Zuschnitt eines Ganzkörperbildes ist die Hülle des
   sichtbaren Inhalts, und die hat der Browser für die Führungslinien
   ohnehin schon gemessen. Dafür braucht es keinen Weg zum Server: Das
   Ergebnis steht sofort, statt nach einer knappen Sekunde. Gerechnet wird
   mit derselben Alphaschwelle wie in bild.py. */
function setzeRandlos(merken) {
  if (!S.bild) return;
  const vorher = merken && S.rect ? { ...S.rect } : null;
  const k = S.kasten;
  S.vorschlag = k
    ? { x: k.links, y: k.oben, breite: k.rechts - k.links, hoehe: k.unten - k.oben }
    : { x: 0, y: 0, breite: S.bild.naturalWidth, hoehe: S.bild.naturalHeight };
  S.alpha = !!(k && k.alpha);
  S.art = S.alpha ? 'rand' : 'ganzes-bild';
  S.rect = { ...S.vorschlag };
  passeAnsichtAn(true);
  zeichne();
  vorschau();
  frischeDaten();
  if (vorher) merkeAusschnitt('Randlos beschnitten', vorher);
}

/* Den Vorschlag holen und übernehmen: beim Porträt den Kopf aus dem
   Skill, beim Ganzkörperbild die Hülle des sichtbaren Inhalts. Beim
   Wechsel der Vorlage passiert das von allein, per Knopf auch später
   wieder. Der Vorschlag bleibt gespeichert, „Zurücksetzen“ kommt zu ihm
   zurück. */
async function holeVorschlag(merken) {
  const quelle = S.quelle;
  const vorher = merken && S.rect ? { ...S.rect } : null;
  $('art').textContent = quadrat()
    ? 'Die Erkennung sucht das Gesicht …'
    : 'Der sichtbare Rand wird gesucht …';
  try {
    const p = new URLSearchParams({ typ: quelle.typ, bereich: S.bereich });
    if (quelle.typ === 'fullsize') p.set('name', quelle.name); else p.set('id', quelle.id);
    const daten = await json('/api/auto?' + p);
    if (S.quelle !== quelle) return;           // inzwischen umgeschaltet
    S.vorschlag = quadrat()
      ? { x: daten.x, y: daten.y, breite: daten.seite, hoehe: daten.seite }
      : { x: daten.x, y: daten.y, breite: daten.b, hoehe: daten.h };
    S.art = daten.art;
    S.alpha = daten.alpha;
    S.rect = { ...S.vorschlag };
    passeAnsichtAn(true);
    zeichne();
    vorschau();
    frischeDaten();
    if (vorher) merkeAusschnitt('Automatisch zugeschnitten', vorher);
  } catch (fehler) {
    if (S.quelle !== quelle) return;
    $('art').textContent = 'Kein Vorschlag: ' + fehler.message;
  }
}

/* ---------- Referenz ----------

   Eine vorhandene Datei der Figur, halb durchsichtig über die Bühne
   gelegt: die andere Fassung als Schablone neben der neuen. Sie ist
   reiner Anhalt und bewusst nicht anfassbar, kein Griff, kein Ziehen,
   kein Speichern.

   Wie sie gezeichnet wird, hängt am Rahmen, und das sind zwei
   verschiedene Fragen:

   **Mit Rahmen** steht sie auf derselben Bodenlinie und ist so hoch, wie
   ihre eigenen Werte in chars.js es sagen. Sie wächst also nicht mit,
   wenn der Regler die Figur größer macht, und genau daran lässt sich die
   Bildkorrektur einstellen: Liegen beide Köpfe auf einer Höhe, stehen
   die Fassungen später gleich groß im Rahmen. Das ist der Zweck der
   ganzen Übung, denn dieselbe Figur soll in jeder Fassung dieselbe
   Körpergröße haben.

   **Ohne Rahmen** wird sie wie bisher höhengleich in den Ausschnitt
   gelegt. Dann geht es nicht um die Größe, sondern um die Pose: Steht
   die Figur in der Schablone, sitzt der Zuschnitt. */

let referenzLauf = 0;

function baueReferenzWahl() {
  const wahl = $('referenz');
  const vorher = S.referenz ? S.referenz.datei : '';
  wahl.textContent = '';
  wahl.append(new Option('Ohne', ''));
  const dateien = S.figur ? zieleVon(S.figur).filter((z) => z.zustand !== 'fehlt') : [];
  for (const z of dateien) wahl.append(new Option(z.label || z.datei, z.datei));
  wahl.disabled = !dateien.length;
  /* Beim Figuren- oder Bereichswechsel gibt es die Datei meist nicht
     mehr, dann fällt die Wahl zurück auf Ohne. Nach dem Speichern bleibt
     sie dagegen stehen. */
  const halten = dateien.some((z) => z.datei === vorher);
  wahl.value = halten ? vorher : '';
  if (!halten) setzeReferenz(null);
}

async function setzeReferenz(datei) {
  const meiner = ++referenzLauf;
  if (!datei) {
    S.referenz = null;
    $('referenz-alpha').disabled = true;
    zeichne();
    return;
  }
  try {
    const bild = await bildLaden(bildUrl(datei));
    if (meiner !== referenzLauf) return;
    S.referenz = { datei, bild };
    $('referenz-alpha').disabled = false;
  } catch (fehler) {
    if (meiner !== referenzLauf) return;
    S.referenz = null;
    $('referenz').value = '';
    $('referenz-alpha').disabled = true;
    melde('Referenz nicht lesbar: ' + fehler.message, true);
  }
  zeichne();
}

/* ---------- Bühne ---------- */

const buehne = $('buehne');
const ctx = buehne.getContext('2d');
let breite = 0;
let hoehe = 0;

function messen() {
  const feld = buehne.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const alteBreite = breite;
  const alteHoehe = hoehe;
  breite = Math.max(1, Math.round(feld.width));
  hoehe = Math.max(1, Math.round(feld.height));
  /* Ändert die Bühne ihre Größe, etwa beim Einklappen der Figurenliste,
     bleibt liegen, was in ihrer Mitte lag. Ohne das behielte das Bild
     seinen Abstand zur linken Kante und stünde in der breiter gewordenen
     Bühne links statt mittig. Beim allerersten Messen gibt es noch keine
     alte Mitte, und wird die Ansicht ohnehin gleich neu gesetzt, schadet
     die Verschiebung nicht. */
  if (S.bild && alteBreite > 1) {
    view.ox += (breite - alteBreite) / 2;
    view.oy += (hoehe - alteHoehe) / 2;
  }
  buehne.width = Math.round(breite * dpr);
  buehne.height = Math.round(hoehe * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* Die Ansicht rückt den Ausschnitt in die Bühne. Beim Porträt bleibt
   ringsum gut das Doppelte seiner Kante an Umgebung stehen, denn dort ist
   der Ausschnitt ein kleiner Teil der Vorlage. Beim Ganzkörperbild füllt
   er sie fast, da genügt ein schmaler Rand.

   Liegt der Rahmen über der Bühne, wird nicht der Ausschnitt eingepasst,
   sondern der Rahmen. Das dreht die Bewegung um: Der Rahmen steht dann
   fest und die Figur wächst und schrumpft darin, sobald die Regler sich
   bewegen. Genau so verhält sich die Vorschau rechts, nur eben in
   Arbeitsgröße und mit anfassbarem Ausschnitt.

   Ohne "erzwingen" bleibt die Ansicht, solange der Ausschnitt bequem
   sichtbar ist. Sonst würde sie nach jedem Loslassen der Maus springen.
   Hat der Nutzer das Bild selbst gezoomt oder geschoben, bleibt sie
   ohnehin stehen: Von da an führt er die Ansicht. */
function passeAnsichtAn(erzwingen) {
  if (!S.bild || !S.rect) return;
  messen();
  if (erzwingen) S.ansichtManuell = false;
  if (S.ansichtManuell && !erzwingen) return;
  const r = S.rect;
  /* Liegt der Rahmen über der Bühne, gehört er mit ins Bild: Sonst stünde
     seine Oberkante gerade bei den kleinen Figuren weit über dem oberen
     Bühnenrand, und das ist die Linie, um die es geht. */
  const rahmen = !quadrat() && S.rahmen ? rahmenMasse() : null;
  const zeigHoehe = rahmen ? rahmen.hoehe : r.hoehe;
  const unten = r.y + r.hoehe;
  if (!erzwingen) {
    const qx = vx(r.x);
    const qb = r.breite * view.k;
    const qh = r.hoehe * view.k;
    const oben = vy(unten - zeigHoehe);
    const drin = qx > 8 && oben > 8 && qx + qb < breite - 8 && vy(unten) < hoehe - 8;
    const gross = Math.max(qb, qh);
    const klein = Math.min(breite, hoehe);
    if (drin && gross > klein * 0.2 && gross < klein * 0.98) return;
  }
  const luft = quadrat() ? 1.9 : 1.12;
  view.k = Math.min(breite / (r.breite * luft), hoehe / (zeigHoehe * luft));
  view.ox = breite / 2 - (r.x + r.breite / 2) * view.k;
  view.oy = hoehe / 2 - (unten - zeigHoehe / 2) * view.k;
}

const vx = (px) => px * view.k + view.ox;
const vy = (py) => py * view.k + view.oy;

/* ---------- Zoom der Ansicht ----------

   Die Skala ist ehrlich gemeint: 100 Prozent heißt ein Bildschirmpunkt je
   Pixel der Vorlage. Nach unten begrenzt sie das eingepasste Bild, nach
   oben der Punkt, an dem einzelne Pixel handbreit werden. */
function einpassenSkala() {
  if (!S.bild) return 1;
  return Math.min(breite / S.bild.naturalWidth, hoehe / S.bild.naturalHeight) * 0.94;
}

function zeigeZoom() {
  $('ansicht-wert').textContent = Math.round(view.k * 100) + ' %';
}

/* Zoomen um einen festen Punkt der Bühne herum, angegeben in ihren
   eigenen Pixeln. Was dort liegt, bleibt liegen. */
function zoomeAnsicht(skala, fx, fy) {
  if (!S.bild) return;
  const neu = Math.min(24, Math.max(einpassenSkala() * 0.5, skala));
  const px = (fx - view.ox) / view.k;
  const py = (fy - view.oy) / view.k;
  view.k = neu;
  view.ox = fx - px * neu;
  view.oy = fy - py * neu;
  S.ansichtManuell = true;
  zeichne();
}

function einpassen() {
  if (!S.bild) return;
  messen();
  view.k = einpassenSkala();
  view.ox = (breite - S.bild.naturalWidth * view.k) / 2;
  view.oy = (hoehe - S.bild.naturalHeight * view.k) / 2;
  S.ansichtManuell = true;
  zeichne();
}

function zeichne() {
  if (!buehne.width) messen();
  ctx.clearRect(0, 0, breite, hoehe);
  zeigeZoom();
  if (!S.bild || !S.rect) return;

  const b = S.bild.naturalWidth;
  const h = S.bild.naturalHeight;
  const r = S.rect;

  // Vorlage
  ctx.drawImage(S.bild, vx(0), vy(0), b * view.k, h * view.k);
  ctx.strokeStyle = FARBE.buehneBildrand;
  ctx.lineWidth = 1;
  ctx.strokeRect(vx(0) + 0.5, vy(0) + 0.5, b * view.k - 1, h * view.k - 1);

  const qx = vx(r.x);
  const qy = vy(r.y);
  const qb = r.breite * view.k;
  const qh = r.hoehe * view.k;

  /* Ohne Rahmen liegt die Referenz höhengleich im Ausschnitt und
     waagerecht mittig, was seitlich übersteht, dunkelt gleich darauf mit
     dem Rest ab. Mit Rahmen steht sie in ihrer eigenen Größe und gehört
     damit über die Abdunklung, siehe maleReferenz(). */
  const imRahmen = !quadrat() && S.rahmen;
  if (S.referenz && !imRahmen) {
    const rb = S.referenz.bild;
    const rBreite = rb.naturalWidth * (qh / rb.naturalHeight);
    ctx.save();
    ctx.globalAlpha = S.referenzAlpha;
    ctx.drawImage(rb, qx + (qb - rBreite) / 2, qy, rBreite, qh);
    ctx.restore();
  }

  // Alles außerhalb des Ausschnitts stark abdunkeln
  ctx.fillStyle = FARBE.buehneAussen;
  ctx.beginPath();
  ctx.rect(0, 0, breite, hoehe);
  ctx.rect(qx, qy, qb, qh);
  ctx.fill('evenodd');

  if (quadrat()) {
    // Die Ecken des Quadrats werden gespeichert, aber vom runden Rahmen
    // verdeckt. Halb abgedunkelt zeigen sie genau das.
    ctx.fillStyle = FARBE.buehneEcken;
    ctx.beginPath();
    ctx.rect(qx, qy, qb, qh);
    ctx.arc(qx + qb / 2, qy + qh / 2, qb / 2, 0, Math.PI * 2);
    ctx.fill('evenodd');

    if (S.hilfslinien && qb > 60) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = FARBE.buehneHilfslinie;
      ctx.beginPath();
      ctx.moveTo(qx, qy + qh * 0.06); ctx.lineTo(qx + qb, qy + qh * 0.06);
      ctx.moveTo(qx, qy + qh * 0.66); ctx.lineTo(qx + qb, qy + qh * 0.66);
      ctx.moveTo(qx + qb / 2, qy); ctx.lineTo(qx + qb / 2, qy + qh);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = FARBE.buehneBeschriftung;
      ctx.font = FARBE.buehneSchrift;
      ctx.fillText('Scheitel', qx + 4, qy + qh * 0.06 - 4);
      ctx.fillText('Kinn', qx + 4, qy + qh * 0.66 - 4);
      ctx.restore();
    }
  }

  if (imRahmen) {
    const mass = rahmenMasse();
    maleReferenz(mass);
    maleRahmen(mass);
  }
  if (S.hilfslinien) maleFuehrungen();

  // Rahmen des Ausschnitts, beim Porträt dazu der Kreis der Seite
  ctx.strokeStyle = FARBE.buehneQuadrat;
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;
  ctx.strokeRect(qx, qy, qb, qh);
  ctx.setLineDash([]);
  ctx.strokeStyle = FARBE.buehneKreis;
  ctx.lineWidth = 2;
  if (quadrat()) {
    ctx.beginPath();
    ctx.arc(qx + qb / 2, qy + qh / 2, qb / 2, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeRect(qx, qy, qb, qh);
  }

  // Griffe
  ctx.fillStyle = FARBE.buehneGriff;
  for (const [ex, ey] of griffe(qx, qy, qb, qh)) ctx.fillRect(ex - 4, ey - 4, 8, 8);
}

/* ---------- Der Rahmen der Charakterseite auf der Bühne ----------

   Die Vorschau rechts zeigt das fertige Bild im Rahmen. Beim Zuschneiden
   schaut aber niemand nach rechts, deshalb liegt der Rahmen auch über der
   Bühne: unten die Bodenlinie an der Unterkante des Ausschnitts, oben die
   Oberkante des Rahmens. Dazwischen steht die Figur so hoch, wie
   Körpergröße mal Bildkorrektur es hergibt. Beide Regler verschieben
   damit die Linien, und zwar da, wo gearbeitet wird.

   Gerechnet wird rückwärts: Auf der Seite steht das Bild unten mittig im
   Rahmen und schöpft ihn nur bis zu diesem Anteil aus. Aus dem Ausschnitt
   folgt so der Rahmen, in dem er später steht. Beide Maße sind Pixel der
   Vorlage, die Bühne rechnet sie wie alles andere mit view.k um. */
const RAHMEN_SEITEN = 1349 / 546;   // Innenmaß des Rahmens, siehe css/style.css
const RAHMEN_LUFT = 0.82;           // ebenda: darüber bleibt Platz für den Kopf

function rahmenMasse() {
  if (!S.rect) return null;
  const anteil = wirkung(S.skala, S.korrektur) * RAHMEN_LUFT;
  const r = S.rect;
  /* Es zählt die Kante, die zuerst anstößt: Eine weit ausgebreitete
     Flugpose stößt an die Seiten, alles Stehende an die Höhe. */
  const hoehe = Math.max(r.hoehe, r.breite / RAHMEN_SEITEN) / anteil;
  return { hoehe, breite: hoehe * RAHMEN_SEITEN, anteil: r.hoehe / hoehe };
}

/* Die Referenz in diesem Rahmen, gerechnet wie auf der Seite: Ihre Höhe
   folgt ihren eigenen Werten, und wird sie dabei breiter als der Rahmen,
   begrenzt ihn die Breite. Dieselben beiden Schranken stehen als
   max-width und max-height in css/style.css. */
function referenzMasse(mass) {
  if (!S.referenz || !mass || !S.figur) return null;
  const eintrag = zieleVon(S.figur).find((z) => z.datei === S.referenz.datei);
  const wert = wirkung((eintrag && eintrag.skala) || 1, (eintrag && eintrag.korrektur) || 1);
  const rb = S.referenz.bild;
  const seiten = rb.naturalWidth / rb.naturalHeight;
  let hoehe = mass.hoehe * wert * RAHMEN_LUFT;
  let breite = hoehe * seiten;
  if (breite > mass.breite * wert * RAHMEN_LUFT) {
    breite = mass.breite * wert * RAHMEN_LUFT;
    hoehe = breite / seiten;
  }
  return { hoehe, breite, wert };
}

/* Die Schablone in Rahmengröße, dazu die Linie an ihrem Scheitel. Liegen
   beide Köpfe darauf, sind die Fassungen im Rahmen gleich groß. */
function maleReferenz(mass) {
  const ref = referenzMasse(mass);
  if (!ref) return;
  const r = S.rect;
  const boden = vy(r.y + r.hoehe);
  const mitte = vx(r.x + r.breite / 2);
  const rh = ref.hoehe * view.k;
  const rb = ref.breite * view.k;

  ctx.save();
  ctx.globalAlpha = S.referenzAlpha;
  ctx.drawImage(S.referenz.bild, mitte - rb / 2, boden - rh, rb, rh);
  ctx.restore();

  const kopf = Math.round(boden - rh) + 0.5;
  ctx.save();
  ctx.strokeStyle = FARBE.buehneReferenz;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(0, kopf);
  ctx.lineTo(breite, kopf);
  ctx.stroke();
  ctx.setLineDash([]);
  /* Die Beschriftung sitzt an der linken Schulter der Schablone. In der
     Mitte stünde sie auf dem Namen der Mittellinie. */
  ctx.fillStyle = FARBE.buehneReferenz;
  ctx.font = FARBE.buehneSchrift;
  ctx.textAlign = 'left';
  ctx.fillText(`Referenz: ${S.referenz.datei} · ${ref.wert.toFixed(2)}`,
    Math.max(6, mitte - rb / 2 + 4), kopf < 14 ? kopf + 13 : kopf - 5);
  ctx.restore();
}

function maleRahmen(mass) {
  if (!mass) return;
  const r = S.rect;
  const boden = vy(r.y + r.hoehe);
  const oben = boden - mass.hoehe * view.k;
  const mitte = vx(r.x + r.breite / 2);
  const halb = mass.breite * view.k / 2;

  ctx.save();
  ctx.lineWidth = 1;
  /* Die Seiten nur angedeutet: Der Rahmen ist zweieinhalbmal so breit wie
     hoch und liegt damit fast immer außerhalb der Bühne. */
  ctx.strokeStyle = FARBE.buehneRahmenSchwach;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  for (const x of [mitte - halb, mitte + halb]) {
    const p = Math.round(x) + 0.5;
    ctx.moveTo(p, oben);
    ctx.lineTo(p, boden);
  }
  ctx.stroke();

  /* Boden und Oberkante gehen über die ganze Bühne, sie sind die Aussage. */
  ctx.setLineDash([]);
  ctx.strokeStyle = FARBE.buehneRahmen;
  ctx.beginPath();
  for (const y of [oben, boden]) {
    const p = Math.round(y) + 0.5;
    ctx.moveTo(0, p);
    ctx.lineTo(breite, p);
  }
  ctx.stroke();

  /* Rechtsbündig: Am linken Rand stehen schon die Namen der
     Führungslinien, und „Boden“ liegt genau auf derselben Höhe. */
  ctx.fillStyle = FARBE.buehneRahmen;
  ctx.font = FARBE.buehneSchrift;
  ctx.textAlign = 'right';
  ctx.fillText('Bodenlinie des Rahmens', breite - 6, boden - 5);
  /* Oben rechts sitzt der Zoomkasten. Liegt die Oberkante in seiner Höhe,
     wechselt ihre Beschriftung unter die Linie und nach links. */
  const eng = oben < 46;
  ctx.textAlign = eng ? 'left' : 'right';
  ctx.fillText(`Rahmenoberkante, die Figur füllt ${Math.round(mass.anteil * 100)} %`,
    eng ? 6 : breite - 6, eng ? oben + 13 : oben - 5);
  ctx.restore();
}

/* Boden und Mitte kräftig, der Rest der Hülle schwächer, die Bildkanten
   nur angedeutet. Eine Linie, an der der Ausschnitt gerade eingerastet
   ist, leuchtet auf. Die beiden Farben stehen in studio.css. */
function maleFuehrungen() {
  const f = fuehrungen();
  ctx.save();
  ctx.font = FARBE.buehneSchrift;
  for (const [achse, linien] of [['x', f.x], ['y', f.y]]) {
    for (const linie of linien) {
      const aktiv = S.eingerastet[achse] === linie;
      const stark = linie.art === 'boden' || linie.art === 'mitte';
      ctx.strokeStyle = fuehrungsfarbe(linie.art,
        aktiv ? 0.95 : (stark ? 0.5 : 0.22));
      ctx.lineWidth = aktiv ? 2 : 1;
      ctx.setLineDash(aktiv ? [] : [6, 5]);
      const p = Math.round(achse === 'x' ? vx(linie.wert) : vy(linie.wert)) + 0.5;
      ctx.beginPath();
      if (achse === 'x') {
        ctx.moveTo(p, 0);
        ctx.lineTo(p, hoehe);
      } else {
        ctx.moveTo(0, p);
        ctx.lineTo(breite, p);
      }
      ctx.stroke();
      if (linie.name && (stark || aktiv)) {
        ctx.fillStyle = fuehrungsfarbe(linie.art, aktiv ? 0.95 : 0.6);
        if (achse === 'x') ctx.fillText(linie.name, p + 4, 14);
        else ctx.fillText(linie.name, 6, p - 5);
      }
    }
  }
  ctx.restore();
}

/* Die vier Ecken, beim freien Rechteck dazu die vier Kantenmitten. Die
   Reihenfolge zählt: Ecke i hat ihren Anker in Ecke 3 - i. */
function ecken(qx, qy, qb, qh) {
  return [[qx, qy], [qx + qb, qy], [qx, qy + qh], [qx + qb, qy + qh]];
}

function kanten(qx, qy, qb, qh) {
  return [[qx + qb / 2, qy], [qx + qb / 2, qy + qh], [qx, qy + qh / 2], [qx + qb, qy + qh / 2]];
}

function griffe(qx, qy, qb, qh) {
  const punkte = ecken(qx, qy, qb, qh);
  return quadrat() ? punkte : punkte.concat(kanten(qx, qy, qb, qh));
}

/* ---------- Maus und Tasten ---------- */

let griff = null;

function zeigerPunkt(ev) {
  const feld = buehne.getBoundingClientRect();
  return { x: ev.clientX - feld.left, y: ev.clientY - feld.top };
}

buehne.addEventListener('pointerdown', (ev) => {
  if (!S.rect || !S.bild) return;
  try { buehne.setPointerCapture(ev.pointerId); } catch { /* Stift abgezogen */ }
  buehne.focus();
  const p = zeigerPunkt(ev);
  const r = S.rect;
  const qx = vx(r.x);
  const qy = vy(r.y);
  const qb = r.breite * view.k;
  const qh = r.hoehe * view.k;

  const punkte = ecken(qx, qy, qb, qh);
  for (let i = 0; i < 4; i++) {
    if (Math.hypot(p.x - punkte[i][0], p.y - punkte[i][1]) < 11) {
      // Gegenüberliegende Ecke bleibt stehen
      const anker = punkte[3 - i];
      griff = { art: 'ecke', anker: { x: (anker[0] - view.ox) / view.k, y: (anker[1] - view.oy) / view.k } };
      schliesseStapel();
      beginneStapel('Ausschnitt an der Ecke gezogen', false);
      return;
    }
  }
  if (!quadrat()) {
    const mitten = kanten(qx, qy, qb, qh);
    const seiten = ['oben', 'unten', 'links', 'rechts'];
    for (let i = 0; i < 4; i++) {
      if (Math.hypot(p.x - mitten[i][0], p.y - mitten[i][1]) < 11) {
        griff = { art: 'kante', seite: seiten[i] };
        schliesseStapel();
        beginneStapel('Kante gezogen', false);
        return;
      }
    }
  }
  /* Im Ausschnitt zieht die Maus den Ausschnitt, daneben das Bild. Die
     mittlere Taste schiebt das Bild überall. */
  const drin = p.x >= qx && p.x <= qx + qb && p.y >= qy && p.y <= qy + qh;
  if (ev.button === 1 || !drin) {
    ev.preventDefault();
    griff = { art: 'ansicht', px: p.x, py: p.y };
    return;
  }
  griff = { art: 'schieben', dx: (p.x - qx) / view.k, dy: (p.y - qy) / view.k };
  schliesseStapel();
  beginneStapel('Ausschnitt verschoben', false);
});

buehne.addEventListener('pointermove', (ev) => {
  if (!griff || !S.rect) return;
  const p = zeigerPunkt(ev);
  if (griff.art === 'ansicht') {
    view.ox += p.x - griff.px;
    view.oy += p.y - griff.py;
    griff.px = p.x;
    griff.py = p.y;
    S.ansichtManuell = true;
    zeichne();
    return;
  }
  let qx = (p.x - view.ox) / view.k;
  let qy = (p.y - view.oy) / view.k;
  const r = S.rect;
  /* Alt hält das Einrasten an, wenn ein Wert dicht neben einer Linie
     gewollt ist. */
  const rasten = S.hilfslinien && !ev.altKey;
  S.eingerastet = { x: null, y: null };
  if (griff.art === 'schieben') {
    r.x = qx - griff.dx;
    r.y = qy - griff.dy;
    if (rasten) rasteVerschieben(r);
  } else if (griff.art === 'ecke') {
    const a = griff.anker;
    if (rasten) {
      qx = rasteKante(qx, 'x');
      qy = rasteKante(qy, 'y');
    }
    if (quadrat()) {
      /* Das Quadrat folgt der längeren Kante. Rastet nur die kürzere
         ein, bliebe die Linie ohne Wirkung, deshalb zählt hier die
         Achse, die den Ausschlag gibt. */
      const db = Math.abs(qx - a.x);
      const dh = Math.abs(qy - a.y);
      const seite = Math.max(16, Math.max(db, dh));
      if (db < dh) S.eingerastet.x = null; else S.eingerastet.y = null;
      r.breite = seite;
      r.hoehe = seite;
      r.x = qx < a.x ? a.x - seite : a.x;
      r.y = qy < a.y ? a.y - seite : a.y;
    } else {
      r.breite = Math.max(8, Math.abs(qx - a.x));
      r.hoehe = Math.max(8, Math.abs(qy - a.y));
      r.x = Math.min(qx, a.x);
      r.y = Math.min(qy, a.y);
    }
  } else {
    // Eine Kante verschieben, die gegenüberliegende bleibt stehen
    const senkrecht = griff.seite === 'links' || griff.seite === 'rechts';
    if (rasten) {
      if (senkrecht) qx = rasteKante(qx, 'x'); else qy = rasteKante(qy, 'y');
    }
    if (griff.seite === 'oben') {
      const unten = r.y + r.hoehe;
      r.y = Math.min(qy, unten - 8);
      r.hoehe = unten - r.y;
    } else if (griff.seite === 'unten') {
      r.hoehe = Math.max(8, qy - r.y);
    } else if (griff.seite === 'links') {
      const rechts = r.x + r.breite;
      r.x = Math.min(qx, rechts - 8);
      r.breite = rechts - r.x;
    } else {
      r.breite = Math.max(8, qx - r.x);
    }
  }
  zeichne();
  vorschau();
  frischeDaten();
});

function loslassen() {
  if (!griff) return;
  const art = griff.art;
  griff = null;
  S.eingerastet = { x: null, y: null };
  /* Ein Zug mit der Maus ist ein Schritt, nicht hundert. */
  if (art !== 'ansicht') schliesseStapel();
  passeAnsichtAn();
  zeichne();
}

buehne.addEventListener('pointerup', loslassen);
buehne.addEventListener('pointercancel', loslassen);

/* Den Ausschnitt um einen Faktor ändern, ein anteilig festgehaltener
   Punkt bleibt dabei stehen. */
function skaliereAusschnitt(faktor, ax, ay) {
  const r = S.rect;
  const grenze = grenzen(r.breite * faktor, r.hoehe * faktor);
  const px = r.x + ax * r.breite;
  const py = r.y + ay * r.hoehe;
  r.breite = grenze.breite;
  r.hoehe = grenze.hoehe;
  r.x = px - ax * r.breite;
  r.y = py - ay * r.hoehe;
}

buehne.addEventListener('wheel', (ev) => {
  if (!S.rect || !S.bild) return;
  ev.preventDefault();
  const p = zeigerPunkt(ev);
  /* Mit Strg zoomt das Rad das Bild, ohne Strg den Ausschnitt. */
  if (ev.ctrlKey || ev.metaKey) {
    zoomeAnsicht(view.k * Math.exp(-ev.deltaY * 0.0015), p.x, p.y);
    return;
  }
  const qx = (p.x - view.ox) / view.k;
  const qy = (p.y - view.oy) / view.k;
  /* Ein Stapel Radbewegungen ist ein Schritt, geschlossen wird er, wenn
     eine halbe Sekunde nichts mehr kommt. */
  beginneStapel('Ausschnitt gezoomt', true);
  // Anteilige Lage des Zeigers im Ausschnitt festhalten, dann bleibt das
  // Gesicht unter dem Zeiger stehen.
  skaliereAusschnitt(Math.exp(ev.deltaY * 0.0012),
    (qx - S.rect.x) / S.rect.breite, (qy - S.rect.y) / S.rect.hoehe);
  zeichne();
  vorschau();
  frischeDaten();
}, { passive: false });

buehne.addEventListener('keydown', (ev) => {
  if (!S.rect) return;
  const schritt = ev.shiftKey ? 10 : 1;
  const schub = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
  if (schub) {
    beginneStapel('Ausschnitt geschoben', true);
    S.rect.x += schub[0] * schritt;
    S.rect.y += schub[1] * schritt;
  } else if (ev.key === '+' || ev.key === '-') {
    beginneStapel('Ausschnitt gezoomt', true);
    skaliereAusschnitt(ev.key === '+' ? 1.03 : 1 / 1.03, 0.5, 0.5);
  } else {
    return;
  }
  ev.preventDefault();
  zeichne();
  vorschau();
  frischeDaten();
});

/* Der Ausschnitt darf weder zum Punkt schrumpfen noch ins Uferlose
   wachsen. Beim Porträt bleibt er quadratisch, deshalb zählt eine Kante. */
function grenzen(b, h) {
  if (!S.bild) return { breite: b, hoehe: h };
  const kleinste = Math.max(16, Math.min(S.bild.naturalWidth, S.bild.naturalHeight) * 0.04);
  const groesste = Math.max(S.bild.naturalWidth, S.bild.naturalHeight) * 1.6;
  let faktor = 1;
  if (Math.max(b, h) > groesste) faktor = groesste / Math.max(b, h);
  else if (Math.min(b, h) < kleinste) faktor = kleinste / Math.min(b, h);
  return { breite: b * faktor, hoehe: h * faktor };
}

new ResizeObserver(() => { passeAnsichtAn(); zeichne(); })
  .observe(buehne.parentElement);

/* ---------- Vorschau ---------- */

function malGrund(c, b, h) {
  if (S.grund === 'hell') {
    c.fillStyle = FARBE.vorschauHell;
    c.fillRect(0, 0, b, h);
  } else if (S.grund === 'karo') {
    const feld = Math.max(6, Math.min(b, h) / 16);
    for (let y = 0; y < h; y += feld) {
      for (let x = 0; x < b; x += feld) {
        c.fillStyle = ((x / feld | 0) + (y / feld | 0)) % 2 ? FARBE.karoHell : FARBE.karoDunkel;
        c.fillRect(x, y, feld, feld);
      }
    }
  } else {
    c.fillStyle = FARBE.vorschauDunkel;
    c.fillRect(0, 0, b, h);
  }
}

function vorschau() {
  if (quadrat()) vorschauPortrait(); else vorschauGanzkoerper();
}

function vorschauPortrait() {
  const gross = $('pv-gross');
  const c = gross.getContext('2d');
  const seite = gross.width;
  c.clearRect(0, 0, seite, seite);
  malGrund(c, seite, seite);
  if (S.bild && S.rect) {
    /* Ragt der Ausschnitt über die Vorlage hinaus, schneidet der Browser
       den Quellbereich mit und verkleinert das Ziel entsprechend. Das
       Ergebnis ist dasselbe wie der durchsichtige Rand in bild.py. */
    c.imageSmoothingQuality = 'high';
    c.drawImage(S.bild, S.rect.x, S.rect.y, S.rect.breite, S.rect.hoehe, 0, 0, seite, seite);
  }
  for (const id of ['pv-76', 'pv-40']) {
    const klein = $(id);
    const k = klein.getContext('2d');
    k.clearRect(0, 0, klein.width, klein.height);
    k.imageSmoothingQuality = 'high';
    k.drawImage(gross, 0, 0, klein.width, klein.height);
  }
}

/* Was der Rahmen am Ende zeigt: Körpergröße mal Bildkorrektur, gedeckelt
   wie fullsizeScale() in js/chars.js. Bei 1.22 ist der Rahmen voll. */
function wirkung(skala, korrektur) {
  return Math.min(1.22, Math.round(skala * korrektur * 1000) / 1000);
}

/* Die beiden Regler, ihre Zahlen und die Knöpfe daneben.

   Geschrieben wird nur, was sich gegenüber chars.js geändert hat und was
   der Rahmen auch zeigen kann: Für das Produkt gilt derselbe Bereich wie
   für die Körpergröße allein, darunter verschwindet die Figur, darüber
   ist der Rahmen voll. */
function frischeSkalaFelder() {
  const alteSkala = (S.ziel && S.ziel.skala) || 1;
  const alteKorrektur = (S.ziel && S.ziel.korrektur) || 1;
  const roh = Math.round(S.skala * S.korrektur * 100) / 100;
  $('d-skala').textContent = S.skala.toFixed(2);
  $('d-korrektur').textContent = Math.round(S.korrektur * 100) + ' %';

  const zahl = document.createElement('b');
  zahl.textContent = roh.toFixed(2);
  const hinweis = $('d-wirkung');
  hinweis.replaceChildren('Im Rahmen: ', zahl);
  const moeglich = roh >= 0.2 && roh <= 1.22;
  if (roh > 1.22) hinweis.append(', mehr als 1.22 zeigt der Rahmen nicht.');
  else if (roh < 0.2) hinweis.append(', weniger als 0.2 geht im Rahmen unter.');
  else if (S.korrektur !== 1) hinweis.append(` (${S.skala.toFixed(2)} mal `
    + `${Math.round(S.korrektur * 100)} %)`);
  hinweis.classList.toggle('zuviel', !moeglich);

  const knopf = $('skala-speichern');
  knopf.disabled = !S.ziel || !moeglich
    || (S.skala === alteSkala && S.korrektur === alteKorrektur);
  knopf.title = moeglich ? ''
    : 'Körpergröße mal Bildkorrektur muss zwischen 0.2 und 1.22 liegen.';
  $('skala-zurueck').disabled = !S.ziel || S.skala === alteSkala;
  $('korrektur-zurueck').disabled = !S.ziel || S.korrektur === alteKorrektur;
}

/* Der Ausschnitt im Rahmen der Charakterseite. Die Leinwand trägt das
   Seitenverhältnis des Ausschnitts, wie hoch sie darin steht, regeln
   Rahmen und Körpergröße über CSS. Genau wie auf der Seite.

   Oben gilt, was die Regler sagen, unten im Vergleich das, was gerade in
   chars.js steht. */
function vorschauGanzkoerper() {
  const leinwand = $('pv-gk');
  leinwand.parentElement.style.setProperty('--figure-scale',
    wirkung(S.skala, S.korrektur));
  $('pv-gk-alt').parentElement.style.setProperty('--figure-scale',
    wirkung((S.ziel && S.ziel.skala) || 1, (S.ziel && S.ziel.korrektur) || 1));
  frischeSkalaFelder();

  if (!S.bild || !S.rect) {
    leinwand.width = 10;
    leinwand.height = 10;
    leinwand.getContext('2d').clearRect(0, 0, 10, 10);
    return;
  }
  const r = S.rect;
  const massstab = Math.min(1, 420 / Math.max(r.breite, r.hoehe));
  leinwand.width = Math.max(1, Math.round(r.breite * massstab));
  leinwand.height = Math.max(1, Math.round(r.hoehe * massstab));
  const c = leinwand.getContext('2d');
  c.clearRect(0, 0, leinwand.width, leinwand.height);
  if (S.grund !== 'dunkel') malGrund(c, leinwand.width, leinwand.height);
  c.imageSmoothingQuality = 'high';
  c.drawImage(S.bild, r.x, r.y, r.breite, r.hoehe, 0, 0, leinwand.width, leinwand.height);
}

/* ---------- Daten und Speichern ---------- */

/* Was am Ende auf der Platte liegt. Beim Porträt eine Kante zwischen 240
   und 480, beim Ganzkörperbild die Größe des Ausschnitts, bei sehr großen
   Vorlagen auf das Maß des Bestandes gebracht. Beides spiegelt bild.py. */
function ergebnisMass() {
  if (!S.rect) return null;
  if (quadrat()) {
    const s = Math.max(240, Math.min(480, Math.round(S.rect.breite)));
    return { breite: s, hoehe: s };
  }
  const b = Math.max(1, Math.round(S.rect.breite));
  const h = Math.max(1, Math.round(S.rect.hoehe));
  const massstab = Math.min(1, 1500 / h, 1200 / b);
  return { breite: Math.round(b * massstab), hoehe: Math.round(h * massstab) };
}

function frischeDaten() {
  const ziel = S.ziel;
  $('d-datei').textContent = ziel ? ziel.datei + '.webp' : '—';
  $('d-datei').title = ziel ? `assets/characters/${ordner()}/${ziel.datei}.webp` : '';
  $('d-quelle').textContent = !S.quelle ? '—'
    : (S.quelle.typ === 'upload' ? S.upload.name : S.quelle.name + '.webp');

  /* Läuft gerade eine Markierung, gehört das Kästchen der Anfrage. Sonst
     nähme ihr diese Zeile die Sperre weg und ein zweiter Klick käme
     dazwischen. */
  const kasten = $('offen');
  if (!markierungLaeuft) {
    kasten.checked = !!(ziel && ziel.markiert);
    kasten.disabled = !ziel;
    kasten.closest('label').classList.toggle('an', kasten.checked);
  }

  /* Das Vergleichsbild gehört zum Ziel, nicht zur Vorlage: Es zeigt, was
     an dieser Stelle bisher steht. */
  const alt = quadrat() ? $('pv-alt') : $('pv-gk-alt');
  $('d-bisher').textContent = ziel
    ? (ziel.zustand === 'fehlt' ? 'noch nichts' : ziel.datei + '.webp') : '—';
  if (ziel && ziel.zustand !== 'fehlt') {
    alt.src = bildUrl(ziel.datei);
    alt.style.visibility = '';
  } else {
    alt.removeAttribute('src');
    alt.style.visibility = 'hidden';
  }

  const warnungen = [];
  const mass = ergebnisMass();
  if (mass && S.bild) {
    $('d-groesse').textContent = `${mass.breite} × ${mass.hoehe} px`;
    if (quadrat()) {
      const s = Math.round(S.rect.breite);
      if (s < 240) {
        $('d-groesse').textContent += ` (aus ${s})`;
        warnungen.push('Der Ausschnitt ist kleiner als 240 Pixel und wird hochgerechnet. '
          + 'Das kostet Schärfe.'
          + (S.engine && S.engine.ok
            ? ' „Upscale“ holt vorher echte Auflösung in die Vorlage.' : ''));
      }
      if (!S.alpha) {
        warnungen.push('Die Vorlage ist nicht freigestellt. Das Porträt bekommt einen '
          + 'deckenden Hintergrund und gilt weiter als offen.');
      }
    } else {
      if (mass.breite !== Math.round(S.rect.breite)) {
        $('d-groesse').textContent += ` (aus ${Math.round(S.rect.breite)} × ${Math.round(S.rect.hoehe)})`;
      }
      if (!S.alpha) {
        warnungen.push('Die Vorlage ist nicht freigestellt. Im Rahmen der Charakterseite '
          + 'steht die Figur dann in einem Kasten statt frei.');
      }
    }
  } else {
    $('d-groesse').textContent = '—';
  }
  const w = $('d-warnung');
  w.textContent = warnungen.join(' ');
  w.hidden = !warnungen.length;

  if (S.art) $('art').textContent = AUSKUNFT[S.art] || S.art;
  $('speichern').disabled = !(S.bild && S.rect && S.ziel);
  $('hochskalieren').disabled = !(S.bild && S.quelle) || skaliertLaeuft;
}

async function speichern() {
  if (!S.bild || !S.rect || !S.ziel) return;
  const knopf = $('speichern');
  const info = $('speicher-info');
  knopf.disabled = true;
  info.className = 'speicher-info';
  info.textContent = 'Wird geschnitten …';

  /* Nur der Aufruf steht im Fang. Was danach kommt, ist Anzeige: Ein
     Fehler dort darf nicht als „nicht gespeichert“ erscheinen, die Datei
     liegt dann längst auf der Platte. */
  let antwort;
  try {
    antwort = await json('/api/speichern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bereich: S.bereich,
        ziel: S.ziel.datei,
        quelle: S.quelle,
        x: S.rect.x,
        y: S.rect.y,
        breite: S.rect.breite,
        hoehe: S.rect.hoehe,
        merken: quadrat() && $('merken').checked,
        /* Der Zuschnitt und die Größe im Rahmen gehören zusammen, also
           gehen die Regler mit. Der Knopf darüber bleibt trotzdem: Er
           setzt die Größe, ohne die Datei neu zu schneiden. */
        ...(quadrat() ? {} : { skala: S.skala, korrektur: S.korrektur }),
      }),
    });
  } catch (fehler) {
    knopf.disabled = false;
    info.className = 'speicher-info schlecht';
    info.textContent = 'Nicht gespeichert: ' + fehler.message;
    melde('Nicht gespeichert: ' + fehler.message, true);
    return;
  }

  S.ziel.zustand = antwort.zustand;
  if (antwort.warMarkiert) S.ziel.markiert = false;
  /* Die Größe steht jetzt in chars.js. Damit ist sie der neue Vergleich,
     unten in der Vorschau wie an den beiden Rücksetzern. */
  if (antwort.groessenwerte) {
    S.ziel.skala = antwort.groessenwerte.skala;
    S.ziel.korrektur = antwort.groessenwerte.korrektur;
  }
  /* Die Datei gibt es jetzt. Ohne diesen Eintrag fände die Fassung beim
     nächsten Hinwechseln ihre eigene Vorlage nicht und meldete wieder,
     es gebe noch kein Bild. */
  if (!quadrat() && !S.figur.quellen.some((q) => q.datei === S.ziel.datei)) {
    S.figur.quellen.push({ datei: S.ziel.datei, label: S.ziel.label });
  }
  S.zaehler = antwort.zaehler;
  S.frisch.set(ordner() + '/' + S.ziel.datei, Date.now());
  pruefeStand(antwort.stand);
  frischerVerlauf(antwort.verlauf);
  zeigeZaehler();
  frischeListe(S.figur);
  zeichneChips();
  frischeDaten();
  vorschau();
  knopf.disabled = false;
  const mass = quadrat()
    ? `${antwort.groesse} × ${antwort.groesse}`
    : `${antwort.breite} × ${antwort.hoehe}`;
  const g = antwort.groessenwerte;
  info.className = 'speicher-info gut';
  info.textContent = `Gespeichert: ${S.ziel.datei}.webp, ${mass} px.`
    + (antwort.warMarkiert ? ' Die Markierung „noch offen“ ist damit weg.' : '')
    + (antwort.gemerkt ? ' Zuschnitt in manuell.json vermerkt.' : '')
    + (antwort.verkleinert ? ' Die Vorlage war größer als der Bestand und wurde verkleinert.' : '')
    + (g && g.geaendert
      ? ` Körpergröße ${g.skala.toFixed(2)}`
        + (g.korrektur === 1 ? '' : ` und Bildkorrektur ${Math.round(g.korrektur * 100)} %`)
        + ' stehen in chars.js.'
      : '')
    + (antwort.groessenfehler
      ? ' Die Größe blieb stehen: ' + antwort.groessenfehler : '')
    + (antwort.sicherung ? ' Die alte Datei liegt in tools/portrait-studio/.sicherung.' : '');
  melde(`${S.ziel.datei}.webp gespeichert.` + (antwort.liste ? ' ' + antwort.liste : ''));
}

/* Von Hand auf „noch offen“ stellen. Das wirkt sofort, ohne Speichern:
   Die Markierung hängt am Bild, nicht am gerade gezeigten Zuschnitt. */
let markierungLaeuft = false;

async function markiereOffen(gewollt) {
  const ziel = S.ziel;
  const kasten = $('offen');
  markierungLaeuft = true;
  kasten.disabled = true;
  try {
    const antwort = await json('/api/offen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bereich: S.bereich, ziel: ziel.datei, offen: gewollt }),
    });
    markierungLaeuft = false;
    ziel.markiert = antwort.markiert;
    S.zaehler = antwort.zaehler;
    frischerVerlauf(antwort.verlauf);
    zeigeZaehler();
    frischeListe(S.figur);
    zeichneChips();
    frischeDaten();
    melde(gewollt
      ? `${ziel.datei}.webp steht jetzt als offen in der Liste.`
      : `${ziel.datei}.webp gilt wieder als fertig.`);
  } catch (fehler) {
    kasten.checked = !gewollt;
    melde('Markierung nicht gesetzt: ' + fehler.message, true);
  } finally {
    markierungLaeuft = false;
    kasten.disabled = false;
  }
}

/* ---------- Fassungen verwalten ----------

   Die Ganzkörper-Fassungen stehen als gepflegte Liste in FULLSIZE_LOOKS
   (js/chars.js), von dort nimmt auch die Charakterseite ihre
   Fassungsleiste. Angelegt, umbenannt, verschoben und gelöscht wird
   deshalb dort, das Bild folgt der Fassung.

   Die Porträt-Fassungen stehen dagegen in CHAR_LOOKS und hängen am Film,
   nicht an einer Beschriftung. Für sie ist diese Leiste ausgeblendet. */

/* Die Stelle des Ziels in der ganzen Liste, nicht nur unter den
   gepflegten: Fassungen, die bisher nur als Datei im Ordner liegen,
   wandern beim ersten Eingriff von selbst in FULLSIZE_LOOKS. */
/* Standard ist, was an erster Stelle steht, unabhängig vom Dateinamen. */
function fassungLage() {
  const figur = S.figur;
  const ziel = S.ziel;
  if (!figur || !ziel) return { stelle: -1, anzahl: 0 };
  const stelle = figur.ganzkoerper.indexOf(ziel);
  return { standard: stelle === 0, stelle, anzahl: figur.ganzkoerper.length };
}

function frischeFassungsleiste() {
  const leiste = $('fassung-leiste');
  leiste.hidden = quadrat();
  if (leiste.hidden) return;
  const l = fassungLage();
  const knopf = (tat) => leiste.querySelector(`[data-tat="${tat}"]`);
  knopf('neu').disabled = !S.figur;
  /* Eine Figur mit nur einem Bild hat nichts zu beschriften: Ihre Datei
     heißt wie die Figur und soll das auch bleiben. */
  knopf('umbenennen').disabled = !S.ziel || l.anzahl < 2;
  knopf('loeschen').disabled = !S.ziel || l.anzahl < 2;
  knopf('hoch').disabled = !S.ziel || l.stelle < 1;
  knopf('runter').disabled = !S.ziel || l.stelle < 0 || l.stelle >= l.anzahl - 1;
  knopf('standard').disabled = !S.ziel || l.standard;
  const grund = l.anzahl < 2 ? 'Die Figur hat nur dieses eine Bild.'
    : (l.standard ? 'Das ist schon die Standardansicht.' : '');
  for (const tat of ['umbenennen', 'loeschen', 'hoch', 'runter', 'standard']) {
    knopf(tat).title = knopf(tat).disabled && grund ? grund : knopf(tat).dataset.hilfe;
  }
}

/* Nach jeder Änderung an chars.js ist die Liste der Figuren nicht mehr
   aktuell. Sie neu zu holen ist einfacher und sicherer, als den Zustand
   im Browser nachzuziehen. */
async function neuLaden(slug, datei) {
  const daten = await json('/api/figuren');
  S.figuren = daten.figuren;
  S.zaehler = daten.zaehler;
  S.figur = null;
  zeigeZaehler();
  frischerVerlauf(daten.verlauf);
  baueListe();
  const figur = S.figuren.find((f) => f.slug === slug);
  if (!figur) return;
  waehleFigur(slug);
  const ziel = zieleVon(figur).find((z) => z.datei === datei);
  if (ziel && ziel !== S.ziel) waehleZiel(ziel);
}

async function fassungAktion(auftrag, danach) {
  const leiste = $('fassung-leiste');
  for (const b of leiste.children) b.disabled = true;
  try {
    const antwort = await json('/api/fassung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auftrag),
    });
    await neuLaden(auftrag.slug, danach || antwort.datei);
    if (antwort.bildWeg) melde(`Fassung entfernt. Das Bild liegt in ${antwort.bildWeg}.`);
    else if (antwort.umbenannt) {
      const u = antwort.umbenannt;
      melde(`${u.alt}.webp heißt jetzt ${u.neu}.webp.`
        + (u.mitgewandert.length ? ' Mitgewandert: ' + u.mitgewandert.join(', ') + '.' : ''));
    } else melde('Fassung übernommen, js/chars.js ist geschrieben.');
  } catch (fehler) {
    melde('Nicht geändert: ' + fehler.message, true);
  } finally {
    frischeFassungsleiste();
  }
}

/* Der Dialog dient dem Anlegen und dem Umbenennen. Er gibt zurück, was
   eingetragen wurde, oder nichts, wenn abgebrochen wurde. */
/* Woraus der Dialog gerade den Dateinamen rechnet. */
let dialogKontext = null;

function zeigeDateinamen() {
  const hinweis = $('fassung-datei');
  if (!dialogKontext) {
    hinweis.hidden = true;
    return;
  }
  const stamm = slugAus($('fassung-label').value.trim());
  if (!stamm) {
    hinweis.textContent = 'Aus dieser Beschriftung entsteht kein Dateiname.';
    hinweis.hidden = false;
    return;
  }
  let name = `${dialogKontext.slug}-${stamm}`;
  for (let n = 2; dialogKontext.belegt.has(name); n += 1) {
    name = `${dialogKontext.slug}-${stamm}-${n}`;
  }
  hinweis.innerHTML = `Dateiname: <code>${name}.webp</code>`;
  hinweis.hidden = false;
}

function frageFassung({ titel, text, label, ohneLabel, knopf, kontext }) {
  const dialog = $('fassung-dialog');
  $('fassung-titel').textContent = titel;
  $('fassung-text').textContent = text;
  $('fassung-label').value = label || '';
  $('fassung-label').closest('label').hidden = !!ohneLabel;
  $('fassung-ok').textContent = knopf;
  $('fassung-ok').classList.toggle('gefahr', !!ohneLabel);
  $('fassung-fehler').hidden = true;
  dialogKontext = kontext || null;
  zeigeDateinamen();
  dialog.showModal();
  ($(ohneLabel ? 'fassung-ok' : 'fassung-label')).focus();
  if (!ohneLabel) $('fassung-label').select();
  return new Promise((fertig) => {
    dialog.addEventListener('close', () => {
      dialogKontext = null;
      fertig(dialog.returnValue === 'ok'
        ? { label: $('fassung-label').value.trim() }
        : null);
    }, { once: true });
  });
}

async function fassungKlick(tat) {
  const figur = S.figur;
  const ziel = S.ziel;
  if (!figur) return;

  if (tat === 'neu') {
    const antwort = await frageFassung({
      titel: 'Neue Fassung',
      text: `Eine weitere Ansicht für ${figur.name}. Sie erscheint sofort in der `
        + 'Liste und wartet auf ihr Bild. Der Dateiname entsteht aus der Beschriftung.',
      knopf: 'Anlegen',
      kontext: {
        slug: figur.slug,
        belegt: new Set(figur.ganzkoerper.map((z) => z.datei).concat(figur.slug)),
      },
    });
    if (!antwort || !antwort.label) return;
    await fassungAktion({
      aktion: 'neu',
      slug: figur.slug,
      label: antwort.label,
      standardLabel: (figur.ganzkoerper[0] && figur.ganzkoerper[0].label) || 'Standard',
    });
    return;
  }

  if (!ziel) return;

  if (tat === 'umbenennen') {
    const antwort = await frageFassung({
      titel: 'Fassung umbenennen',
      text: `So heißt ${ziel.datei}.webp in der Fassungsleiste der Charakterseite. `
        + 'Der Dateiname folgt der Beschriftung und wird mit umbenannt.',
      label: ziel.label,
      knopf: 'Übernehmen',
      kontext: {
        slug: figur.slug,
        belegt: new Set(figur.ganzkoerper.filter((z) => z !== ziel).map((z) => z.datei)),
      },
    });
    if (!antwort || !antwort.label || antwort.label === ziel.label) return;
    await fassungAktion({
      aktion: 'umbenennen', slug: figur.slug, datei: ziel.datei, label: antwort.label,
    });
    return;
  }

  /* Standard ist der erste Eintrag. „Zum Standard“ schiebt die Fassung
     also nur nach vorn, es wandert keine Datei. */
  if (tat === 'standard') {
    await fassungAktion({ aktion: 'standard', slug: figur.slug, datei: ziel.datei },
      ziel.datei);
    return;
  }

  if (tat === 'hoch' || tat === 'runter') {
    await fassungAktion({
      aktion: 'verschieben', slug: figur.slug, datei: ziel.datei, richtung: tat,
    }, ziel.datei);
    return;
  }

  if (tat === 'loeschen') {
    const antwort = await frageFassung({
      titel: 'Fassung löschen',
      text: `„${ziel.label}“ aus der Fassungsliste von ${figur.name} entfernen.`
        + (ziel.zustand === 'fehlt' ? ' Ein Bild gibt es dazu noch nicht.'
          : ` ${ziel.datei}.webp wandert dabei in die Sicherung und steht `
            + 'danach nicht mehr auf der Charakterseite.'),
      ohneLabel: true,
      knopf: 'Löschen',
    });
    if (!antwort) return;
    await fassungAktion({
      aktion: 'loeschen', slug: figur.slug, datei: ziel.datei,
    }, figur.slug);
  }
}

/* ---------- Namen, Schlüssel und Auftritte ----------

   Eine Figur ist in data.js nur eine Zeichenkette in den
   Besetzungslisten. charSlug() macht daraus den Schlüssel, unter dem
   Bilder, Biografie, Steckbrief und Begegnungen geführt werden, und
   CHAR_ALIAS schiebt sich dazwischen.

   Deshalb sind die beiden Felder verschieden gefährlich: Ein Name lässt
   sich frei ändern, der Schlüssel bleibt dabei stehen (notfalls hält ihn
   ein neuer Alias fest). Der Schlüssel selbst zieht dagegen Dateien und
   Verweise mit sich. */

/* ---------- Realname und Heldenname ----------

   In data.js steht beides in einer Zeichenkette, getrennt durch " / " mit
   Leerzeichen davor und danach. Genau daran teilt splitName() in
   js/chars.js auf, und zwar am ersten Slash: „Marc Spector / Steven Grant
   / Moon Knight“ ist ein Realname und zwei Heldennamen. Deshalb wird hier
   auch nur am ersten getrennt und der Rest bleibt am Stück, so kommt beim
   Zusammensetzen wieder genau dasselbe heraus. */
function zerlegeNamen(name) {
  const schnitt = name.indexOf(' / ');
  return schnitt === -1
    ? { real: name, alias: '' }
    : { real: name.slice(0, schnitt), alias: name.slice(schnitt + 3) };
}

function setzeNamenZusammen(real, alias) {
  const links = real.trim().replace(/\s+/g, ' ');
  const rechts = alias.trim().replace(/\s+/g, ' ');
  return rechts ? `${links} / ${rechts}` : links;
}

/* Dieselbe Regel wie charSlug() in js/chars.js, ohne den Alias. */
function slugAus(name) {
  return String(name).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/* Der Alias, wie er beim Öffnen des Dialogs stand. Daran misst sich, ob
   der Übernehmen-Knopf etwas zu tun hat. */
let aliasStand = '';

function zeigeFigurDialog() {
  const figur = S.figur;
  if (!figur) return;
  const liste = $('namensliste');
  liste.textContent = '';
  figur.namen.forEach((name, i) => {
    const teile = zerlegeNamen(name);
    const zeile = document.createElement('div');
    zeile.className = 'namenszeile';
    const real = document.createElement('input');
    real.type = 'text';
    real.maxLength = 60;
    real.value = teile.real;
    real.placeholder = 'Realname';
    const trenner = document.createElement('b');
    trenner.className = 'trenner';
    trenner.textContent = '/';
    const alias = document.createElement('input');
    alias.type = 'text';
    alias.maxLength = 60;
    alias.value = teile.alias;
    alias.placeholder = 'Heldenname, darf leer bleiben';
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'knopf';
    knopf.textContent = 'Übernehmen';
    knopf.disabled = true;
    const pruefe = () => {
      const neu = setzeNamenZusammen(real.value, alias.value);
      knopf.disabled = !real.value.trim() || neu === name;
    };
    real.addEventListener('input', pruefe);
    alias.addEventListener('input', pruefe);
    knopf.addEventListener('click', () => nameSpeichern(figur.slug, name,
      setzeNamenZusammen(real.value, alias.value), i));
    zeile.append(real, trenner, alias, knopf);
    liste.append(zeile);
  });

  /* Der Alias steht je Name in CHAR_ALIAS. Das Studio hält sie für eine
     Figur gleich, sonst zerfiele sie in zwei Schlüssel. Gezeigt wird
     deshalb einer. */
  aliasStand = figur.alias.find((a) => a) || '';
  $('figur-alias').value = aliasStand;
  frischeSchluessel();
  $('figur-dialog').showModal();
}

/* Zeigt, welcher Schlüssel aus der Eingabe entstünde, und gibt den Knopf
   frei, sobald sich etwas geändert hat. */
function frischeSchluessel() {
  const figur = S.figur;
  const eingabe = $('figur-alias').value.trim();
  const neu = eingabe ? slugAus(eingabe) : slugAus(figur.namen[0]);
  $('figur-slug').innerHTML = `Schlüssel: <code>${neu || '—'}</code>`
    + (neu === figur.slug ? ' (unverändert)' : ` statt <code>${figur.slug}</code>`);
  $('alias-uebernehmen').disabled = eingabe === aliasStand;
  const w = $('figur-warnung');
  if (neu && neu !== figur.slug) {
    w.textContent = 'Der Schlüssel ändert sich. Bilddateien, Biografie, Steckbrief '
      + 'und Begegnungen wandern mit.';
    w.hidden = false;
  } else {
    w.hidden = true;
  }
  return neu;
}

async function nameSpeichern(slug, alt, neu, index) {
  try {
    const antwort = await json('/api/figur', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aktion: 'name', slug, alt, neu }),
    });
    melde(`Name geändert: „${alt}“ heißt jetzt „${neu}“`
      + ` (${antwort.treffer} Auftritt${antwort.treffer === 1 ? '' : 'e'})`
      + (antwort.alias ? ', der Schlüssel bleibt über einen Alias erhalten.' : '.'));
    await neuLaden(slug, S.ziel && S.ziel.datei);
    zeigeFigurDialogNeu(index);
  } catch (fehler) {
    melde('Name nicht geändert: ' + fehler.message, true);
  }
}

/* Nach dem Neuladen steht der Dialog auf veralteten Daten. Er wird
   deshalb frisch aufgebaut, ohne ihn zu schließen. */
function zeigeFigurDialogNeu(index) {
  const offen = $('figur-dialog').open;
  if (!offen) return;
  $('figur-dialog').close();
  zeigeFigurDialog();
  const felder = $('namensliste').querySelectorAll('input');
  if (felder[index]) felder[index].focus();
}

async function aliasSpeichern() {
  const figur = S.figur;
  if (!figur) return;
  const eingabe = $('figur-alias').value.trim();
  /* Auch eine Änderung, die den Schlüssel gleich lässt, ist eine: In
     CHAR_ALIAS steht danach ein anderer Text. */
  if (eingabe === aliasStand) return;
  try {
    const antwort = await json('/api/figur', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aktion: 'alias', slug: figur.slug, ziel: eingabe || null }),
    });
    const w = antwort.wanderung;
    const bleibt = antwort.slug === figur.slug;
    melde(bleibt
      ? `Alias ist jetzt „${eingabe || '(keiner)'}“, der Schlüssel bleibt ${antwort.slug}.`
      : `Schlüssel ist jetzt ${antwort.slug}.`
        + (w ? ` ${w.dateien.length} Bilddatei${w.dateien.length === 1 ? '' : 'en'} umbenannt, `
          + `${w.quellen.length} Quelldatei${w.quellen.length === 1 ? '' : 'en'} nachgezogen.` : ''));
    /* Wandert der Schlüssel, ist die Figur eine andere Zeile in der Liste
       und der Dialog schließt. Bleibt er, arbeitet der Nutzer weiter. */
    if (!bleibt) $('figur-dialog').close();
    await neuLaden(antwort.slug, null);
    if (bleibt) zeigeFigurDialogNeu(-1);
  } catch (fehler) {
    melde('Alias nicht geändert: ' + fehler.message, true);
  }
}

/* --- Auftritte --- */

let alleFilme = null;

async function holeFilme() {
  if (!alleFilme) alleFilme = (await json('/api/filme')).filme;
  return alleFilme;
}

/* Die Filmliste mit Kontrollkästchen. Zwei Dialoge benutzen sie: die
   Auftritte einer Figur und das Anlegen einer neuen. */
function maleFilmliste(behaelter, suche, istDabei, beiWechsel) {
  const text = suche.trim().toLowerCase();
  behaelter.textContent = '';
  for (const film of alleFilme) {
    if (text && !`${film.titel} ${film.phase}`.toLowerCase().includes(text)) continue;
    const dabei = istDabei(film);
    const zeile = document.createElement('label');
    zeile.className = 'filmzeile' + (dabei ? ' dabei' : '');
    const kasten = document.createElement('input');
    kasten.type = 'checkbox';
    kasten.checked = dabei;
    kasten.addEventListener('change', () => beiWechsel(film, kasten));
    const titel = document.createElement('span');
    titel.className = 'titel';
    titel.textContent = film.titel + (film.serie ? ' (Serie)' : '');
    const phase = document.createElement('span');
    phase.className = 'phase';
    phase.textContent = film.phase;
    zeile.append(kasten, titel, phase);
    behaelter.append(zeile);
  }
}

async function zeigeAuftritte() {
  const figur = S.figur;
  if (!figur) return;
  try {
    await holeFilme();
  } catch (fehler) {
    melde('Die Filme ließen sich nicht laden: ' + fehler.message, true);
    return;
  }
  const auswahl = $('auftritt-name');
  auswahl.textContent = '';
  for (const name of figur.namen) {
    const eintrag = document.createElement('option');
    eintrag.value = name;
    eintrag.textContent = name;
    auswahl.append(eintrag);
  }
  $('auftritt-namensfeld').hidden = figur.namen.length < 2;
  $('auftritt-text').textContent = `In welchen Filmen und Serien ${figur.name} vorkommt. `
    + 'Ein Haken schreibt die Besetzungsliste in js/data.js sofort um.';
  $('auftritt-suche').value = '';
  $('auftritt-warnung').hidden = true;
  baueFilmliste();
  $('auftritt-dialog').showModal();
}

/* Zugehörigkeit und Schreiben laufen über den Filmtitel, nicht über den
   Slug: Bei Mehrstaffel-Serien tragen alle Staffeln denselben Slug, erst
   der Titel unterscheidet sie. */
function baueFilmliste() {
  maleFilmliste($('filmliste'), $('auftritt-suche').value,
    (film) => S.figur.filme.includes(film.titel),
    (film, kasten) => auftrittSetzen(film, kasten));
}

async function auftrittSetzen(film, kasten) {
  const figur = S.figur;
  const dabei = kasten.checked;
  const name = $('auftritt-name').value || figur.namen[0];
  const warnung = $('auftritt-warnung');
  if (!dabei && figur.filme.length === 1) {
    warnung.textContent = 'Das ist der letzte Auftritt. Ohne Auftritt steht die Figur '
      + 'in keiner Besetzungsliste mehr und verschwindet aus der Datenbank.';
    warnung.hidden = false;
  }
  kasten.disabled = true;
  try {
    const antwort = await json('/api/auftritt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: figur.slug, name, film: film.titel, dabei }),
    });
    melde(dabei
      ? `${name} steht jetzt in der Besetzung von ${film.titel}.`
      : `${name} ist aus der Besetzung von ${film.titel} heraus.`
        + (antwort.begegnungen ? ` ${antwort.begegnungen} Begegnung${antwort.begegnungen === 1 ? '' : 'en'} dort mit entfernt.` : ''));
    const slug = figur.slug;
    await neuLaden(slug, S.ziel && S.ziel.datei);
    if (S.figur && S.figur.slug === slug) {
      baueFilmliste();
    } else {
      /* Die Figur hat ihren letzten Auftritt verloren und steht in keiner
         Liste mehr. Der Dialog bleibt offen, damit sie sich zurückholen
         lässt, arbeitet aber ab jetzt auf dem alten Stand. */
      figur.filme = figur.filme.filter((t) => t !== film.titel);
      S.figur = figur;
      baueFilmliste();
    }
  } catch (fehler) {
    kasten.checked = !dabei;
    melde('Auftritt nicht geändert: ' + fehler.message, true);
  } finally {
    kasten.disabled = false;
  }
}

/* ---------- Neue Figur ----------

   Sie entsteht mit ihrem ersten Auftritt, denn mehr ist eine Figur in
   data.js nicht: ein Name in einer Besetzungsliste. Name, Schlüssel und
   Auftritte gehen deshalb in einem Zug hinaus, das gibt einen Schritt im
   Verlauf und eine Prüfung statt drei. */
const neueFigur = { filme: new Set() };

function frischeNeueFigur() {
  const name = setzeNamenZusammen($('neu-name').value, $('neu-held').value);
  const alias = $('neu-alias').value.trim();
  const slug = alias ? slugAus(alias) : slugAus(name);
  const belegt = slug && S.figuren.find((f) => f.slug === slug);
  $('neu-slug').innerHTML = name
    ? `Schlüssel: <code>${slug || '—'}</code>`
    : 'Schlüssel: entsteht aus dem Namen';
  const fehler = $('neu-fehler');
  if (belegt) {
    fehler.textContent = `Der Schlüssel ${slug} gehört schon zu ${belegt.name}. `
      + 'Mit einem Alias lässt sich ein anderer wählen.';
    fehler.hidden = false;
  } else {
    fehler.hidden = true;
  }
  $('neu-ok').disabled = !name || !slug || !!belegt || !neueFigur.filme.size;
}

async function zeigeNeueFigur() {
  try {
    await holeFilme();
  } catch (fehler) {
    melde('Die Filme ließen sich nicht laden: ' + fehler.message, true);
    return;
  }
  neueFigur.filme = new Set();
  $('neu-name').value = '';
  $('neu-held').value = '';
  $('neu-alias').value = '';
  $('neu-suche').value = '';
  maleNeueFilme();
  frischeNeueFigur();
  $('neu-dialog').showModal();
  $('neu-name').focus();
}

function maleNeueFilme() {
  maleFilmliste($('neu-filme'), $('neu-suche').value,
    (film) => neueFigur.filme.has(film.titel),
    (film, kasten) => {
      if (kasten.checked) neueFigur.filme.add(film.titel);
      else neueFigur.filme.delete(film.titel);
      kasten.closest('.filmzeile').classList.toggle('dabei', kasten.checked);
      frischeNeueFigur();
    });
}

async function legeFigurAn() {
  const name = setzeNamenZusammen($('neu-name').value, $('neu-held').value);
  const alias = $('neu-alias').value.trim();
  const filme = [...neueFigur.filme];
  try {
    const antwort = await json('/api/figur/neu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, alias: alias || null, filme }),
    });
    await neuLaden(antwort.slug, null);
    melde(`${antwort.name} angelegt, Schlüssel ${antwort.slug}, `
      + `${antwort.filme} Auftritt${antwort.filme === 1 ? '' : 'e'}. `
      + 'Bilder fehlen noch.');
  } catch (fehler) {
    melde('Nicht angelegt: ' + fehler.message, true);
  }
}

/* ---------- Rückgängig und wiederholen ----------

   Zwei Sorten von Schritten stehen in einer Reihe: die Arbeit an der
   Bühne, die nur im Browser liegt, und die Eingriffe, die der Server
   geschrieben hat. Das Journal hier merkt sich beide in ihrer
   Reihenfolge. Bei einem Bühnenschritt setzt es den Ausschnitt zurück,
   bei einem Serverschritt ruft es den Server.

   Ein Bühnenschritt trägt seinen Zusammenhang mit sich, also Bereich,
   Figur, Ziel und Vorlage. Führt das Rückgängig woanders hin, wird erst
   dorthin gewechselt und dann der Ausschnitt gesetzt.

   Die Ansicht, also Zoom und Lage des Bildes, steht bewusst nicht drin:
   Sie ändert nichts am Ergebnis, und ein Rückgängig, das nur die Ansicht
   verschiebt, fühlt sich wie ein Fehlgriff an. */
const GRENZE_JOURNAL = 80;
const journal = { schritte: [], stelle: 0 };
let letzteTiefe = 0;          // Serverschritte, die das Journal schon kennt
let eigenerLauf = false;      // gerade läuft ein Rückgängig oder Wiederholen

function kontextJetzt() {
  return {
    bereich: S.bereich,
    slug: S.figur && S.figur.slug,
    ziel: S.ziel && S.ziel.datei,
    quelle: S.quelle
      ? (S.quelle.typ === 'upload' ? 'upload:' + S.quelle.id : S.quelle.name)
      : null,
  };
}

function schneideZukunftAb() {
  journal.schritte.length = journal.stelle;
}

function haengeAn(schritt) {
  schneideZukunftAb();
  journal.schritte.push(schritt);
  while (journal.schritte.length > GRENZE_JOURNAL) journal.schritte.shift();
  journal.stelle = journal.schritte.length;
}

/* Einen Bühnenschritt festhalten, wenn sich der Ausschnitt bewegt hat. */
function merkeAusschnitt(titel, vorher) {
  if (!vorher || !S.rect) return;
  const nachher = { ...S.rect };
  const gleich = ['x', 'y', 'breite', 'hoehe']
    .every((k) => Math.abs(vorher[k] - nachher[k]) < 0.01);
  if (gleich) return;
  haengeAn({ art: 'buehne', titel, kontext: kontextJetzt(), vorher, nachher });
  frischerVerlauf();
}

/* Zusammenhängende Bewegungen werden zu einem Schritt: ein Zug mit der
   Maus, ein Rad-Stapel, eine Folge von Pfeiltasten. */
let stapel = null;

function beginneStapel(titel, mitUhr) {
  if (!S.rect) return;
  if (stapel && stapel.uhr) clearTimeout(stapel.uhr);
  if (!stapel) stapel = { vorher: { ...S.rect }, titel, uhr: 0 };
  stapel.titel = titel;
  if (mitUhr) stapel.uhr = setTimeout(schliesseStapel, 600);
}

function schliesseStapel() {
  if (!stapel) return;
  const alt = stapel;
  stapel = null;
  if (alt.uhr) clearTimeout(alt.uhr);
  merkeAusschnitt(alt.titel, alt.vorher);
}

function verwirfStapel() {
  if (stapel && stapel.uhr) clearTimeout(stapel.uhr);
  stapel = null;
}

/* Der Server meldet nach jedem Eingriff, wie tief sein Verlauf ist. Wird
   er tiefer, ohne dass dieses Fenster gerade zurückgeht, gehört ein
   Serverschritt ins Journal. */
function frischerVerlauf(stand) {
  if (stand) {
    S.verlauf = stand;
    if (!eigenerLauf) {
      if (stand.tiefe > letzteTiefe) {
        const titel = stand.titel || [];
        for (let i = letzteTiefe; i < stand.tiefe; i += 1) {
          haengeAn({ art: 'server', titel: titel[i] || stand.zurueck || 'Änderung' });
        }
      }
      letzteTiefe = stand.tiefe;
    }
  }
  const zurueck = journal.schritte[journal.stelle - 1];
  const vor = journal.schritte[journal.stelle];
  const knopf = (richtung) => $('verlauf').querySelector(`[data-richtung="${richtung}"]`);
  knopf('zurueck').disabled = !zurueck;
  knopf('vor').disabled = !vor;
  knopf('zurueck').title = zurueck ? `Rückgängig: ${zurueck.titel} (Strg+Z)`
    : 'Nichts rückgängig zu machen';
  knopf('vor').title = vor ? `Wiederholen: ${vor.titel} (Strg+Y)`
    : 'Nichts zu wiederholen';
}

/* Zu dem Zusammenhang zurückkehren, in dem der Schritt entstanden ist. */
async function stelleKontextHer(k) {
  const jetzt = kontextJetzt();
  if (jetzt.bereich === k.bereich && jetzt.slug === k.slug
    && jetzt.ziel === k.ziel && jetzt.quelle === k.quelle) return;
  if (jetzt.bereich !== k.bereich) wechsleBereich(k.bereich);
  if (!S.figur || S.figur.slug !== k.slug) await waehleFigur(k.slug);
  if (!S.figur) throw new Error('Die Figur steht nicht mehr in der Liste.');
  const ziel = zieleVon(S.figur).find((z) => z.datei === k.ziel);
  if (ziel && ziel !== S.ziel) await waehleZiel(ziel);
  if (k.quelle && !k.quelle.startsWith('upload:')
    && (!S.quelle || S.quelle.name !== k.quelle)) {
    await waehleQuelle({ typ: 'fullsize', name: k.quelle });
  }
}

async function buehnenSchritt(schritt, richtung) {
  await stelleKontextHer(schritt.kontext);
  if (!S.bild) throw new Error('Die Vorlage ist nicht mehr da.');
  S.rect = { ...(richtung === 'zurueck' ? schritt.vorher : schritt.nachher) };
  passeAnsichtAn();
  zeichne();
  vorschau();
  frischeDaten();
}

let verlaufLaeuft = false;

async function verlaufGehen(richtung) {
  if (verlaufLaeuft) return;
  schliesseStapel();
  const schritt = journal.schritte[
    richtung === 'zurueck' ? journal.stelle - 1 : journal.stelle];
  if (!schritt) return;
  verlaufLaeuft = true;
  eigenerLauf = true;
  try {
    if (schritt.art === 'buehne') {
      await buehnenSchritt(schritt, richtung);
      journal.stelle += richtung === 'zurueck' ? -1 : 1;
      melde(`${richtung === 'zurueck' ? 'Rückgängig' : 'Wiederholt'}: ${schritt.titel}`);
      return;
    }
    await serverSchritt(richtung);
    journal.stelle += richtung === 'zurueck' ? -1 : 1;
  } catch (fehler) {
    melde('Nicht möglich: ' + fehler.message, true);
  } finally {
    verlaufLaeuft = false;
    eigenerLauf = false;
    frischerVerlauf();
  }
}

async function serverSchritt(richtung) {
  const antwort = await json('/api/verlauf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ richtung }),
  });
  /* Die Bilder können sich unter demselben Namen geändert haben. */
  S.frisch.clear();
  const stempel = Date.now();
  for (const ordner of ['portraits', 'fullsize']) {
    for (const figur of S.figuren) {
      for (const ziel of [...figur.ziele, ...figur.ganzkoerper]) {
        S.frisch.set(ordner + '/' + ziel.datei, stempel);
      }
    }
  }
  const slug = S.figur && S.figur.slug;
  const datei = S.ziel && S.ziel.datei;
  await neuLaden(slug, datei);
  S.verlauf = antwort.verlauf;
  letzteTiefe = antwort.verlauf.tiefe;
  melde(`${richtung === 'zurueck' ? 'Rückgängig' : 'Wiederholt'}: ${antwort.titel}`
    + (antwort.liste ? ' · ' + antwort.liste : ''));
}

/* ---------- Eigenes Bild ---------- */

async function hochladen(datei) {
  if (!datei || !datei.type.startsWith('image/')) {
    melde('Das ist kein Bild.', true);
    return;
  }
  if (!S.figur) {
    melde('Erst eine Figur wählen, dann das Bild.', true);
    return;
  }
  try {
    const daten = await datei.arrayBuffer();
    const antwort = await json('/api/upload', {
      method: 'POST',
      headers: { 'X-Dateiname': encodeURIComponent(datei.name || 'bild.png') },
      body: daten,
    });
    if (S.upload) URL.revokeObjectURL(S.upload.url);
    S.upload = { id: antwort.id, name: antwort.name, url: URL.createObjectURL(datei) };
    await waehleQuelle({ typ: 'upload', id: antwort.id });
  } catch (fehler) {
    melde('Hochladen misslungen: ' + fehler.message, true);
  }
}

/* ---------- Hochskalieren und Gesichter ----------

   Real-ESRGAN rechnet die gewählte Vorlage vierfach hoch. Das Ergebnis
   kommt vom Server als hochgeladenes Bild zurück und nimmt den Platz des
   eigenen Bildes ein: ein Chip bei den Vorlagen, zuschneiden und
   speichern wie gewohnt. Der Lauf braucht auf diesem Rechner eine bis
   einige Minuten, solange bleibt der Knopf gesperrt.

   Steht ein Gesichtsmodell in der Wahl, folgt danach ein zweiter
   Schritt: GFPGAN oder CodeFormer bauen das Gesicht neu auf. Der Server
   hält beide Schritte getrennt vor, ein Wechsel des Modells rechnet
   deshalb nicht wieder hoch. */
let skaliertLaeuft = false;

/* Warum ein Modell nicht zu haben ist. Ein Server, der von vor dem Umbau
   läuft, kennt das Feld noch gar nicht, deshalb der eigene Fall: Sonst
   stünden die Knöpfe stumm gesperrt da und niemand käme darauf, dass ein
   Neustart genügt. */
function gesichtGrund() {
  if (!S.gesicht) {
    return 'Dieser Server kennt die Gesichtsmodelle noch nicht. '
      + 'Das Studio einmal neu starten: node tools/portrait-studio/server.js';
  }
  if (!S.gesicht.ok) return S.gesicht.grund;
  return null;
}

/* Was nicht bereitsteht, ist in der Liste gesperrt. Warum, steht als
   Warnung im Dialog, nicht nur als Titel: Ein gesperrter Eintrag, der
   schweigt, hat schon einmal ratlos gemacht. */
function richteGesichtEin() {
  const grund = gesichtGrund();
  const modelle = grund ? [] : S.gesicht.modelle;
  for (const o of $('gesicht').options) {
    if (o.value === 'ohne') continue;
    o.disabled = !modelle.includes(o.value);
  }
  if (grund) waehleGesicht('ohne');
  zeigeTreue();
}

function waehleGesicht(modell) {
  S.gesichtModell = modell;
  $('gesicht').value = modell;
  zeigeTreue();
}

function zeigeTreue() {
  $('treue-feld').hidden = S.gesichtModell !== 'codeformer';
  $('d-treue').textContent = S.treue.toFixed(2);
}

/* ---------- Der Upscale-Dialog ----------

   Der Knopf in der Werkzeugreihe führt nicht mehr sofort aus, sondern
   fragt erst, was passieren soll. Erst „Starten“ schickt den Auftrag
   los. */

/* Grobe Schätzung aus der Fläche der Vorlage, gemessen an den Läufen auf
   diesem Rechner: rund 150 Sekunden je Megapixel Eingang, dazu die feste
   Zeit fürs Gesicht. Sie steht als Anhalt im Dialog, damit niemand vor
   einem Knopf sitzt, der scheinbar nichts tut. */
function upscaleDauer(mitGesicht) {
  const megapixel = (S.bild.naturalWidth * S.bild.naturalHeight) / 1e6;
  const sekunden = megapixel * 150 + (mitGesicht ? 25 : 0);
  if (sekunden < 90) return `rund ${Math.round(sekunden / 10) * 10} Sekunden`;
  return `rund ${Math.round(sekunden / 30) / 2} Minuten`;
}

function frischeUpscaleVorschau() {
  const vorschau = $('upscale-vorschau');
  if (!S.bild) {
    vorschau.textContent = '';
    return;
  }
  const b = S.bild.naturalWidth;
  const h = S.bild.naturalHeight;
  const name = S.quelle && S.quelle.typ === 'upload' ? S.upload.name : S.quelle.name + '.webp';
  vorschau.innerHTML = `<b>${name}</b> · ${b} × ${h} → ${b * 4} × ${h * 4} px · `
    + upscaleDauer(S.gesichtModell !== 'ohne');
}

function zeigeUpscale() {
  if (!S.quelle || !S.bild || skaliertLaeuft) return;
  /* Fehlt eines von beiden, sagt der Dialog es und „Starten“ bleibt zu.
     Die Engine ist Voraussetzung, das Gesichtsmodell nur eine Zutat. */
  const grund = (S.engine && !S.engine.ok) ? S.engine.grund : gesichtGrund();
  const warnung = $('upscale-warnung');
  warnung.textContent = grund || '';
  warnung.hidden = !grund;
  $('upscale-ok').disabled = !!(S.engine && !S.engine.ok);
  richteGesichtEin();
  frischeUpscaleVorschau();
  $('upscale-dialog').showModal();
}

async function hochskalieren() {
  if (!S.quelle || !S.bild || skaliertLaeuft) return;
  if (S.engine && !S.engine.ok) return melde(S.engine.grund, true);
  const knopf = $('hochskalieren');
  const mitGesicht = S.gesichtModell !== 'ohne';

  /* Nach einem Lauf ist das Ergebnis die gewählte Vorlage. Wer danach das
     Modell wechselt und noch einmal drückt, meint aber nicht „das
     Ergebnis noch einmal vervierfachen“, sondern „dasselbe Bild, anderes
     Gesicht“. Deshalb wird immer von dem Bild ausgegangen, aus dem das
     Ergebnis entstanden ist. Der Server findet den ersten Schritt dann in
     seinem Speicher wieder und rechnet nur das Gesicht neu. */
  const basis = (S.quelle.typ === 'upload' && S.upload && S.upload.herkunft)
    ? S.upload.herkunft : S.quelle;

  skaliertLaeuft = true;
  knopf.disabled = true;
  knopf.textContent = mitGesicht ? 'Rechnet und baut Gesicht …' : 'Wird hochgerechnet …';
  try {
    const antwort = await json('/api/hochskalieren', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quelle: basis, modell: S.gesichtModell, treue: S.treue,
      }),
    });
    if (S.upload) URL.revokeObjectURL(S.upload.url);
    S.upload = {
      id: antwort.id, name: antwort.name, url: '/upload/' + antwort.id, herkunft: basis,
    };
    await waehleQuelle({ typ: 'upload', id: antwort.id });

    let text = `Hochskaliert auf ${antwort.breite} × ${antwort.hoehe} px`;
    text += antwort.wiederverwendet ? ', aus dem letzten Lauf übernommen.'
      : ` in ${antwort.dauer} s.`;
    if (mitGesicht) {
      /* Kein Gefundenes ist keine Panne: Masken, Rüstungen und Tiere
         haben schlicht kein Gesicht im Sinne des Modells. */
      text += antwort.gesichter
        ? ` ${antwort.gesichter} Gesicht${antwort.gesichter === 1 ? '' : 'er'} neu aufgebaut.`
        : ' Kein Gesicht gefunden, das Bild ist nur hochgerechnet.';
    }
    melde(text, mitGesicht && !antwort.gesichter);
  } catch (fehler) {
    melde('Hochskalieren misslungen: ' + fehler.message, true);
  } finally {
    skaliertLaeuft = false;
    knopf.textContent = 'Upscale …';
    frischeDaten();
  }
}

/* ---------- Bedienung ---------- */

$('bereich').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (knopf) wechsleBereich(knopf.dataset.bereich);
});

$('liste-schalter').addEventListener('click', () => {
  zeigeListe(document.querySelector('.raster').classList.contains('zu'));
});

$('fassung-leiste').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (knopf && !knopf.disabled) fassungKlick(knopf.dataset.tat);
});

$('fassung-label').addEventListener('input', zeigeDateinamen);
$('figur-bearbeiten').addEventListener('click', zeigeFigurDialog);
$('figur-auftritte').addEventListener('click', zeigeAuftritte);
$('figur-alias').addEventListener('input', frischeSchluessel);
/* Geschrieben wird erst auf den Knopf. Das Verlassen des Feldes reicht
   nicht, dafür wandert beim Schlüsselwechsel zu viel mit. */
$('alias-uebernehmen').addEventListener('click', aliasSpeichern);
$('figur-alias').addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter') return;
  ev.preventDefault();
  if (!$('alias-uebernehmen').disabled) aliasSpeichern();
});
$('auftritt-suche').addEventListener('input', baueFilmliste);

$('figur-neu').addEventListener('click', zeigeNeueFigur);
$('neu-name').addEventListener('input', frischeNeueFigur);
$('neu-held').addEventListener('input', frischeNeueFigur);
$('neu-alias').addEventListener('input', frischeNeueFigur);
$('neu-suche').addEventListener('input', maleNeueFilme);
$('neu-dialog').addEventListener('close', () => {
  if ($('neu-dialog').returnValue === 'ok') legeFigurAn();
});

$('suche').addEventListener('input', (ev) => { S.suche = ev.target.value; filtern(); });

$('filter').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (!knopf) return;
  S.filter = knopf.dataset.filter;
  for (const b of $('filter').children) b.classList.toggle('an', b === knopf);
  filtern();
});

$('grund').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (!knopf) return;
  S.grund = knopf.dataset.grund;
  for (const b of $('grund').children) b.classList.toggle('an', b === knopf);
  vorschau();
});

$('auto').addEventListener('click', () => {
  if (!S.quelle || !S.bild) return;
  schliesseStapel();
  if (!quadrat()) return setzeRandlos(true);
  if (!S.python.ok) return melde(S.python.grund, true);
  holeVorschlag(true);
});

$('zurueck').addEventListener('click', () => {
  if (!S.bild) return;
  schliesseStapel();
  const vorher = { ...S.rect };
  S.rect = S.vorschlag
    ? { ...S.vorschlag }
    : standardRect(S.bild.naturalWidth, S.bild.naturalHeight);
  passeAnsichtAn(true);
  zeichne();
  vorschau();
  frischeDaten();
  merkeAusschnitt('Ausschnitt zurückgesetzt', vorher);
});

$('ansicht-plus').addEventListener('click', () => zoomeAnsicht(view.k * 1.3, breite / 2, hoehe / 2));
$('ansicht-minus').addEventListener('click', () => zoomeAnsicht(view.k / 1.3, breite / 2, hoehe / 2));
$('ansicht-fit').addEventListener('click', einpassen);

$('hilfslinien').addEventListener('change', (ev) => {
  S.hilfslinien = ev.target.checked;
  zeichne();
});

/* Kommt der Rahmen dazu oder fällt er weg, ändert sich, was auf die Bühne
   passen muss: einmal der Rahmen, einmal der Ausschnitt allein. */
$('rahmen').addEventListener('change', (ev) => {
  S.rahmen = ev.target.checked;
  passeAnsichtAn(true);
  zeichne();
});

$('referenz').addEventListener('change', (ev) => setzeReferenz(ev.target.value || null));

$('referenz-alpha').addEventListener('input', (ev) => {
  S.referenzAlpha = Number(ev.target.value) / 100;
  zeichne();
});

$('offen').addEventListener('change', (ev) => {
  if (S.ziel) markiereOffen(ev.target.checked);
});

/* Die Körpergröße gehört der Figur, die Bildkorrektur diesem einen Bild.
   Getrennt geregelt, gemeinsam angezeigt: Der Rahmen zeigt ihr Produkt,
   auf der Bühne wie in der Vorschau. */
function frischeGroesse() {
  vorschau();
  if (quadrat() || !S.rahmen) return;
  /* Der Rahmen bleibt stehen, die Figur wächst darin. Dafür muss die
     Ansicht dem Regler folgen, deshalb wird sie hier neu gesetzt und
     nicht nur nachgebessert: Wer am Größenregler zieht, will die Größe
     sehen, auch wenn er die Bühne vorher selbst verschoben hat. */
  passeAnsichtAn(true);
  zeichne();
}

$('skala').addEventListener('input', (ev) => {
  S.skala = Number(ev.target.value);
  frischeGroesse();
});

$('korrektur').addEventListener('input', (ev) => {
  S.korrektur = Number(ev.target.value);
  frischeGroesse();
});

/* Zurück auf den Stand aus chars.js, je Regler einzeln. */
for (const welcher of ['skala', 'korrektur']) {
  $(welcher + '-zurueck').addEventListener('click', () => {
    S[welcher] = (S.ziel && S.ziel[welcher]) || 1;
    $(welcher).value = String(S[welcher]);
    frischeGroesse();
  });
}

/* Beide Werte stehen nicht im Bild, sondern in js/chars.js. Deshalb
   schreibt sie ein eigener Knopf, unabhängig vom Zuschnitt. */
$('skala-speichern').addEventListener('click', async () => {
  const ziel = S.ziel;
  const knopf = $('skala-speichern');
  if (!ziel) return;
  knopf.disabled = true;
  try {
    const antwort = await json('/api/skala', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datei: ziel.datei, skala: S.skala, korrektur: S.korrektur }),
    });
    ziel.skala = S.skala;
    ziel.korrektur = S.korrektur;
    frischerVerlauf(antwort.verlauf);
    vorschau();
    const prozent = Math.round(S.korrektur * 100);
    melde(S.skala === 1 && S.korrektur === 1
      ? `${ziel.datei} steht wieder auf der Standardgröße, chars.js führt die Datei nicht mehr.`
      : `Körpergröße ${S.skala.toFixed(2)}`
        + (S.korrektur === 1 ? '' : `, Bildkorrektur ${prozent} %`)
        + ` für ${ziel.datei} in js/chars.js eingetragen.`);
  } catch (fehler) {
    knopf.disabled = false;
    melde('Größe nicht gesetzt: ' + fehler.message, true);
  }
});

$('speichern').addEventListener('click', speichern);
$('hochskalieren').addEventListener('click', zeigeUpscale);

$('upscale-dialog').addEventListener('close', () => {
  if ($('upscale-dialog').returnValue === 'ok') hochskalieren();
});

$('gesicht').addEventListener('change', (ev) => {
  waehleGesicht(ev.target.value);
  frischeUpscaleVorschau();
});

$('treue').addEventListener('input', (ev) => {
  S.treue = Number(ev.target.value);
  $('d-treue').textContent = S.treue.toFixed(2);
});
$('upload-knopf').addEventListener('click', () => $('upload').click());
$('upload').addEventListener('change', (ev) => {
  if (ev.target.files[0]) hochladen(ev.target.files[0]);
  ev.target.value = '';
});

const feld = buehne.parentElement;
feld.addEventListener('dragover', (ev) => { ev.preventDefault(); feld.classList.add('zieht'); });
feld.addEventListener('dragleave', (ev) => {
  if (ev.relatedTarget && feld.contains(ev.relatedTarget)) return;
  feld.classList.remove('zieht');
});
feld.addEventListener('drop', (ev) => {
  ev.preventDefault();
  feld.classList.remove('zieht');
  if (ev.dataTransfer.files[0]) hochladen(ev.dataTransfer.files[0]);
});

document.addEventListener('paste', (ev) => {
  const datei = [...(ev.clipboardData.files || [])][0];
  if (datei) hochladen(datei);
});

$('verlauf').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (knopf && !knopf.disabled) verlaufGehen(knopf.dataset.richtung);
});

document.addEventListener('keydown', (ev) => {
  if (!(ev.ctrlKey || ev.metaKey)) return;
  const taste = ev.key.toLowerCase();
  if (taste === 's') {
    ev.preventDefault();
    speichern();
  } else if (taste === 'z' && !ev.shiftKey) {
    /* In einem Textfeld gehört Strg+Z dem Textfeld. */
    if (ev.target.matches('input, textarea, select')) return;
    ev.preventDefault();
    verlaufGehen('zurueck');
  } else if (taste === 'y' || (taste === 'z' && ev.shiftKey)) {
    if (ev.target.matches('input, textarea, select')) return;
    ev.preventDefault();
    verlaufGehen('vor');
  }
});

start();
