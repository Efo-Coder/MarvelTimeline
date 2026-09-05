/* Bild-Studio, Oberfläche.

   Zwei Bereiche, ein Werkzeug. Bei den **Porträts** ist der Ausschnitt ein
   Quadrat, aus dem die Seite einen Kreis maskiert. Bei den
   **Ganzkörperbildern** ist er ein freies Rechteck, und richtig ist er
   dann, wenn er randlos am sichtbaren Inhalt sitzt: Der Rahmen auf der
   Charakterseite rechnet damit, dass die Datei keine leere Fläche trägt,
   sonst steht die Figur zu klein darin und schwebt über der Bodenlinie.

   Der Ausschnitt ist immer { x, y, breite, hoehe } in Pixeln der Vorlage.
   Genau diese vier Zahlen gehen beim Speichern an den Server, der sie an
   crop-image.py weiterreicht. Die Bühne rechnet sie nur für die Anzeige um, es
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
  bereich: 'portrait',   // 'portrait', 'ganzkoerper', 'biografie' oder 'emblem'
  figuren: [],
  welten: [],          // CHAR_WORLDS aus js/chars.js, siehe zerlegeNamen()
  zaehler: null,
  python: null,
  engine: null,        // Real-ESRGAN: { ok, pfad } oder { ok: false, grund }
  gesicht: null,       // Gesichtsmodelle: { ok, modelle } oder { ok: false, grund }
  gesichtModell: 'ohne',
  treue: 0.8,          // nur CodeFormer, siehe services/facial-recognition/enhance-face.py
  frei: null,          // Freistellen: { ok, modelle } oder { ok: false, grund }
  freiModell: null,    // Name des gewählten Modells, siehe remove-background.py
  feinschliff: true,   // zweiter Durchgang am Ausschnitt
  saum: 1,             // wie stark der alte Hintergrund herausgerechnet wird
  filter: 'alle',
  suche: '',
  figur: null,
  vorwahl: null,       // Schlüssel der vorgewählten Figur, siehe setzeVorwahl
  ziel: null,          // Eintrag aus figur.ziele bzw. figur.ganzkoerper
  quelle: null,        // { typ: 'fullsize', name } oder { typ: 'upload', id }
  upload: null,        // { id, name, url }
  vorlage: null,       // HTMLImageElement, die Datei wie sie auf der Platte liegt
  bild: null,          // dasselbe oder die gedrehte Leinwand, siehe baueDrehung
  viertel: 0,          // Vierteldrehungen, 0 bis 3
  fein: 0,             // Feinwinkel in Grad, -45 bis 45
  vorlageAlpha: false, // ob die ungedrehte Vorlage freigestellt ist
  rect: null,          // { x, y, breite, hoehe } in Pixeln der Arbeitsvorlage
  vorschlag: null,     // derselbe Aufbau, vom Server
  art: '',
  alpha: true,
  hilfslinien: true,
  rahmen: true,        // Rahmen der Charakterseite über der Bühne
  referenz: null,      // { datei, bild, bereich }: Schablone im Ausschnitt, nur Anhalt
  referenzAlpha: 0.45,
  kasten: null,        // Hülle des sichtbaren Inhalts, Quelle der Führungslinien
  eingerastet: { x: null, y: null },
  skala: 1,            // Körpergröße der Figur, so wie der Regler steht
  korrektur: 1,        // Feinkorrektur dieses Bildes, ebenso
  grund: 'dunkel',
  ansichtManuell: false,   // Nutzer führt Zoom und Lage des Bildes selbst
  verlauf: null,       // { zurueck, vor } vom Server
  frisch: new Map(),   // Datei -> Zeitstempel, bricht den Bildcache auf
  texte: null,         // Biografie: was der Server zur offenen Figur schickte
  texteStand: '',      // dasselbe als Abdruck, daran hängt „geändert?“
  begriffe: [],        // Bezeichnungen der Beziehungen: [{ name, anzahl }]
  wikiOffen: 0,        // Figuren ohne Eintrag im erzeugten Steckbrief-Block

  /* Embleme. „zeichen“ ist der Stand aller Namen aus EMBLEM_ART, wie ihn
     build-emblems.py meldet. Die drei Felder darunter gehören zu dem
     Zeichen, das gerade offen ist, und leben nur bis zum nächsten. */
  zeichen: [],         // [{ name, vorlage, maske, vorlageStand, maskeStand }]
  zeichenWahl: null,   // Name des offenen Zeichens
  zeichenLesart: 'zeichnung',
  zeichenRoh: null,    // { id, name }: die eben abgelegte Vorlage
  zeichenFrei: null,   // { id, name, ... }: dieselbe, freigestellt
  zeichenErzwungen: false, // ob der letzte Lauf den Alphakanal überging
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
   Werkzeugen. Die Schlüssel kommen aus crop-image.py und zuschnitt.py. Jeder
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
  'unveraendert': 'Das bestehende Porträt, unverändert im Ausschnitt. „Automatisch zuschneiden“ sucht darin nach dem Gesicht.',
};

/* Kurze Wege zu dem, was je Bereich gilt.

   „quadrat“ ist die Frage nach dem Ausschnitt und gilt nur im
   Porträt-Betrieb. Welche Bilder gemeint sind, ist eine andere Frage:
   Die Biografie hat gar keine, zeigt in der Liste aber die Porträts,
   denn dort steht die Figur und nicht ihre Datei. */
const quadrat = () => S.bereich === 'portrait';
const ganz = () => S.bereich === 'ganzkoerper';
const texte = () => S.bereich === 'biografie';

/* Die Embleme sind der einzige Bereich ohne Figuren. In der Liste stehen
   die Namen aus EMBLEM_ART in js/emblems.js, und die Werkbank zeigt keine
   Bühne, sondern die drei Schritte vom Bild zur Maske. Siehe den
   Abschnitt „Embleme“ weiter unten. */
const zeichen = () => S.bereich === 'emblem';

/* Die Vorlage ist das bestehende Porträt selbst. Es liegt dann nicht als
   Schablone daneben, sondern auf der Bühne, und lässt sich neu
   beschneiden, hochrechnen und freistellen. */
const eigenesBild = () => !!(S.quelle && S.quelle.typ === 'portrait');

/* In welchem Ordner eine Vorlage liegt. Porträt und Ganzkörperbild tragen
   denselben Dateinamen, der Name allein sagt es also nicht. */
const quellOrdner = (quelle) => (quelle.typ === 'portrait' ? 'portraits' : 'fullsize');
const zieleVon = (figur) => (ganz() ? figur.ganzkoerper : figur.ziele);

/* Wie viele Fassungen in der Liste neben der Figur stehen. Gezählt werden
   Fassungen und keine Dateien: Eine Fassung mit drei Varianten ist eine,
   auch wenn sie in drei Bildern vorliegt. */
const fassungsZahl = (figur) => (ganz()
  ? fassungenVon(figur).length : figur.ziele.length);
const ordner = () => (ganz() ? 'fullsize' : 'portraits');

function bildUrl(datei, welcher) {
  const wo = welcher || ordner();
  const frisch = S.frisch.get(wo + '/' + datei);
  return `/datei/assets/characters/${wo}/${datei}.webp` + (frisch ? `?v=${frisch}` : '');
}

/* ---------- Fortschritt ----------

   Der Server meldet über einen Ereignisstrom, was gerade läuft, wie lange
   es voraussichtlich dauert und wie viel davon schon vorbei ist. Angezeigt
   wird jede laufende Arbeit mit eigenem Balken, untereinander im selben
   Kasten.

   Vorher stand dort nur die jüngste. Wer ein Bild speicherte und
   währenddessen zur nächsten Fassung wechselte, sah den Zuschnitt
   verschwinden und stattdessen die Gesichtssuche der neuen Vorlage
   anlaufen, die nach einer Sekunde auf hundert Prozent sprang. Der
   Zuschnitt lief die ganze Zeit weiter, nur zu sehen war er nicht mehr,
   und der Balken meldete den Abschluss von etwas ganz anderem.

   Die Zahl kommt aus der Uhr: Sie zeigt, welcher Anteil der erwarteten
   Dauer verstrichen ist. Der Server schätzt diese Dauer aus seinen
   früheren Messungen derselben Arbeit, siehe merkeDauer in server.js.
   Gerechnet wird hier Bild für Bild statt bei jeder Meldung, denn nur so
   wandert der Balken gleichmäßig, statt in Stufen nachzuziehen.

   Die Zahl läuft geradlinig auf 95 Prozent, bis die geschätzte Zeit um
   ist, und kriecht danach mit derselben Steigung, aber immer langsamer,
   gegen 99. Die vollen hundert setzt erst die Meldung, dass die Arbeit
   fertig ist, und sie bleibt eine Sekunde stehen: Ein Balken, der bei 99
   verschwindet, sieht aus, als sei etwas schiefgegangen.

   Dauert es länger als geschätzt, hört die Restzeit nicht auf, sondern
   bekommt Sekunden angehängt. Eine Schätzung, die um das Fünffache
   danebenliegt, kommt vor: Rechnet nebenher etwas anderes an der
   Grafikkarte, braucht derselbe Lauf ein Vielfaches. Dann ist eine
   wachsende Restzeit die ehrliche Auskunft, eine stehen gebliebene Null
   wäre es nicht.

   Kurze Arbeiten sollen nicht aufblitzen: Der Kasten erscheint erst, wenn
   etwas länger als eine knappe halbe Sekunde dauert. Wer nur ein Porträt
   speichert, sieht deshalb meist gar nichts, und das ist richtig so. */
const ANZEIGE_AB = 400;          // Millisekunden, bevor der Kasten kommt
const ABSCHLUSS_STEHT = 900;     // so lange bleibt die volle Länge stehen
const KAUM_GESEHEN = 300;        // darunter war der Kasten nur ein Zucken
const BIS_ZUR_SCHAETZUNG = 0.95; // Stand, wenn die erwartete Zeit um ist
const HOECHSTENS = 0.99;         // Grenze, gegen die es danach geht
const NACHSCHLAG = 0.15;         // erste Verlängerung, Anteil der Schätzung
const NACHSCHLAG_MIN = 5000;     // aber nie weniger als fünf Sekunden
const NACHSCHLAG_MAX = 60000;    // und nie mehr als eine Minute am Stück


/* Der Kasten insgesamt: Er geht auf, sobald eine Arbeit länger dauert als
   ANZEIGE_AB, und wieder zu, wenn die letzte Zeile verschwunden ist. */
let kastenSeit = 0;              // wann er zuletzt aufging
let bildTakt = 0;

/* Je laufender Arbeit eine Uhr und eine Zeile im Kasten. Der Schlüssel
   ist die Nummer, die der Server vergibt. */
const uhren = new Map();         // id -> { id, start, erwartet, frist, stufe, ... }

function kurve(teil) {
  if (teil <= 0) return 0;
  if (teil < 1) return BIS_ZUR_SCHAETZUNG * teil;
  /* Der Faktor im Exponenten ist so gewählt, dass die Kurve am Übergang
     dieselbe Steigung hat wie die Gerade davor. Sonst wäre dort ein
     sichtbarer Knick. */
  const rest = HOECHSTENS - BIS_ZUR_SCHAETZUNG;
  return HOECHSTENS - rest * Math.exp(-(BIS_ZUR_SCHAETZUNG / rest) * (teil - 1));
}

/* Die Frist ist der Zeitpunkt, zu dem die Arbeit nach jetzigem Stand fertig
   sein sollte. Zu Beginn ist das die Schätzung. Läuft sie ab, ohne dass
   etwas fertig ist, kommt ein Nachschlag drauf, und der nächste ist
   größer als der vorige: Wer schon das Doppelte gebraucht hat, wird kaum
   in den nächsten fünf Sekunden fertig, und eine Restzeit, die zwanzigmal
   „noch etwa 5 s“ sagt, glaubt niemand mehr. */
function frist(uhr, verstrichen) {
  while (verstrichen >= uhr.frist) {
    uhr.frist += uhr.stufe;
    uhr.stufe = Math.min(NACHSCHLAG_MAX, uhr.stufe * 1.6);
  }
  return uhr.frist;
}

/* Die verbleibende Zeit steht hinter dem Arbeitsschritt. */
function restText(ms) {
  const sekunden = Math.ceil(ms / 1000);
  if (!(sekunden > 0)) return '';
  if (sekunden < 60) return `noch etwa ${sekunden} s`;
  return `noch etwa ${Math.floor(sekunden / 60)}:`
    + `${String(sekunden % 60).padStart(2, '0')} min`;
}

/* Die Breite ändert sich mit jedem Bild, Zahl und Zeile nur, wenn sie
   wirklich anders lauten. Das hält die Vorleseprogramme ruhig, die am
   Kasten hängen. */
function schreibe(uhr, anteil, zeile) {
  const zahl = Math.round(anteil * 100) + ' %';
  if (zahl !== uhr.letzteZahl) {
    uhr.letzteZahl = zahl;
    uhr.feld.zahl.textContent = zahl;
  }
  if (zeile !== uhr.letzteZeile) {
    uhr.letzteZeile = zeile;
    uhr.feld.schritt.textContent = zeile;
  }
  uhr.feld.balken.style.width = (anteil * 100).toFixed(2) + '%';
}

function male() {
  bildTakt = 0;
  let laeuft = false;
  const jetzt = performance.now();
  for (const uhr of uhren.values()) {
    if (uhr.fertig) continue;
    laeuft = true;
    const verstrichen = jetzt - uhr.start;
    /* Nie rückwärts, auch wenn der Rechner beim Umschalten der Ansicht
       einmal aussetzt. */
    uhr.anteil = Math.max(uhr.anteil, kurve(verstrichen / uhr.erwartet));
    schreibe(uhr, uhr.anteil,
      [uhr.schritt, restText(frist(uhr, verstrichen) - verstrichen)].filter(Boolean).join(', '));
  }
  if (laeuft) bildTakt = requestAnimationFrame(male);
}

/* Eine Zeile im Kasten, aus der Vorlage in index.html. */
function baueZeile() {
  const zeile = $('fortschritt-zeile').content.firstElementChild.cloneNode(true);
  return {
    wurzel: zeile,
    titel: zeile.querySelector('.fortschritt-titel'),
    zahl: zeile.querySelector('.fortschritt-zahl'),
    balken: zeile.querySelector('.fortschritt-balken'),
    schritt: zeile.querySelector('.fortschritt-schritt'),
  };
}

/* Eine einzelne Uhr fällt weg, samt ihrer Zeile. */
function nimmUhr(id) {
  const uhr = uhren.get(id);
  if (!uhr) return;
  clearTimeout(uhr.ausblendZeit);
  uhr.feld.wurzel.remove();
  uhren.delete(id);
  if (!uhren.size) schliesseKasten();
}

function schliesseKasten() {
  cancelAnimationFrame(bildTakt);
  bildTakt = 0;
  kastenSeit = 0;
  $('fortschritt-laeufe').textContent = '';
  $('fortschritt').hidden = true;
}

function versteckeFortschritt() {
  for (const uhr of uhren.values()) clearTimeout(uhr.ausblendZeit);
  uhren.clear();
  clearTimeout(anzeigeZeit);
  anzeigeZeit = 0;
  schliesseKasten();
}

/* Der Kasten geht mit Verzögerung auf: Was in einer knappen halben
   Sekunde durch ist, soll gar nicht erst aufblitzen. */
let anzeigeZeit = 0;

function oeffneKasten(spaeter) {
  const kasten = $('fortschritt');
  if (!kasten.hidden || anzeigeZeit) return;
  anzeigeZeit = setTimeout(() => {
    anzeigeZeit = 0;
    if (!uhren.size) return;
    kasten.hidden = false;
    kastenSeit = performance.now();
  }, Math.max(0, spaeter));
}

/* Der Stand, wie der Server ihn schickt: alle Läufe, jüngster zuerst.
   Daraus werden die Zeilen im Kasten, in der Reihenfolge, in der die
   Arbeiten angefangen haben – die älteste oben, damit eine neue Arbeit
   die anderen nicht verschiebt. */
function zeigeFortschritt(laeufe) {
  const liste = Array.isArray(laeufe) ? laeufe : [];
  const gemeldet = new Set(liste.map((l) => l.id));

  /* Was der Server nicht mehr kennt, ist weg. Das ist der Abbruch: Er hat
     die vollen hundert Prozent nicht verdient und verschwindet sofort.
     Ein Lauf, der schon im Nachleuchten steht, bleibt dagegen stehen,
     bis sein Zeitgeber ihn abräumt. */
  for (const [id, uhr] of [...uhren]) {
    if (!gemeldet.has(id) && !uhr.fertig) nimmUhr(id);
  }

  const felder = $('fortschritt-laeufe');
  for (const lauf of [...liste].reverse()) {
    let uhr = uhren.get(lauf.id);
    if (!uhr) {
      /* Die Uhr wird einmal je Lauf gestellt, auf den Beginn, den der
         Server meldet. Spätere Meldungen rühren sie nicht mehr an, sonst
         zöge jede von ihnen den Balken um die Laufzeit der Leitung
         zurück. */
      const erwartet = Math.max(500, lauf.erwartet || 0);
      uhr = {
        id: lauf.id,
        start: performance.now() - (lauf.verstrichen || 0),
        erwartet,
        frist: erwartet,
        stufe: Math.max(NACHSCHLAG_MIN, erwartet * NACHSCHLAG),
        anteil: 0,
        letzteZahl: '',
        letzteZeile: '',
        seit: performance.now(),
        fertig: false,
        ausblendZeit: 0,
        feld: baueZeile(),
      };
      uhren.set(lauf.id, uhr);
      felder.append(uhr.feld.wurzel);
      oeffneKasten(ANZEIGE_AB - (lauf.verstrichen || 0));
    }
    uhr.schritt = lauf.schritt || '';
    if (uhr.titel !== lauf.titel) {
      uhr.titel = lauf.titel;
      uhr.feld.titel.textContent = lauf.titel;
    }

    if (lauf.fertig && !uhr.fertig) {
      uhr.fertig = true;
      /* War der Kasten noch gar nicht zu sehen, ging alles unter einer
         halben Sekunde über die Bühne. Dann bleibt die Zeile auch weg.
         War er eben erst aufgegangen, geht sie sofort wieder zu: Die
         vollen hundert Prozent noch fast eine Sekunde stehen zu lassen,
         nachdem der Kasten einen Wimpernschlag lang da war, machte aus
         dem Zucken erst recht ein Blinken. */
      if ($('fortschritt').hidden || performance.now() - kastenSeit < KAUM_GESEHEN) {
        nimmUhr(lauf.id);
        continue;
      }
      uhr.anteil = 1;
      uhr.feld.balken.classList.add('abschluss');
      schreibe(uhr, 1, uhr.schritt);
      uhr.ausblendZeit = setTimeout(() => nimmUhr(lauf.id), ABSCHLUSS_STEHT);
    }
  }

  if (uhren.size && !bildTakt) bildTakt = requestAnimationFrame(male);
}
function hoereFortschritt() {
  const strom = new EventSource('/api/fortschritt');
  strom.addEventListener('message', (ev) => {
    let stand;
    try { stand = JSON.parse(ev.data); } catch { return; }
    zeigeFortschritt(stand.laeufe || []);
  });
  /* Fällt die Verbindung, verbindet der Browser von allein neu. Die
     Anzeige geht dabei ohne Nachleuchten weg: Wie weit die Arbeit
     gekommen ist, weiß hier gerade niemand. */
  strom.addEventListener('error', versteckeFortschritt);
  /* Der Server meldet über denselben Strom, wenn sich seine Dateien
     geändert haben, siehe standDesStudios in server.js. */
  strom.addEventListener('stand', (ev) => {
    try { pruefeStand(JSON.parse(ev.data)); } catch { /* nächste Meldung kommt */ }
  });
}

/* ---------- Start ----------

   Die Adresse merkt sich Bereich und Figur. Das Kürzel vor dem Schlüssel
   sagt, welcher Bereich gemeint ist; die Porträts sind der Normalfall und
   tragen keines. */
const MARKE = { portrait: '', ganzkoerper: 'gk:', biografie: 'bio:', emblem: 'em:' };

async function start() {
  hoereFortschritt();
  zeigeBedienung(bedienungGemerkt());
  try {
    const daten = await json('/api/figuren');
    S.figuren = daten.figuren;
    S.welten = daten.welten || [];
    S.zaehler = daten.zaehler;
    S.python = daten.python;
    S.engine = daten.engine;
    S.gesicht = daten.gesicht;
    S.frei = daten.frei;
    S.wikiOffen = daten.wikiOffen || 0;
    S.begriffe = daten.begriffe || [];
    richteGesichtEin();
    richteFreiEin();
    pruefeStand(daten.stand);
    frischerVerlauf(daten.verlauf);
    baueBondWahl();
    frischeWikiLage();

    /* Ein Neuladen landet wieder dort, wo es aufgehört hat. So lässt sich
       auch von außen eine Figur aufschlagen. */
    let marke = decodeURIComponent(location.hash.slice(1));
    for (const [bereich, kuerzel] of Object.entries(MARKE)) {
      if (!kuerzel || !marke.startsWith(kuerzel)) continue;
      S.bereich = bereich;
      marke = marke.slice(kuerzel.length);
      for (const b of $('bereich').children) {
        b.classList.toggle('an', b.dataset.bereich === bereich);
      }
      break;
    }
    richteBereichEin();

    zeigeZaehler(true);
    baueListe();
    if (zeichen()) {
      ladeZeichen().then(() => {
        if (marke && S.zeichen.some((z) => z.name === marke)) waehleZeichen(marke);
      });
    } else if (marke && S.figuren.some((f) => f.slug === marke)) {
      waehleFigur(marke);
    }

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
   nicht an: Es tut dann seelenruhig das, was es früher einmal tat.

   Wer am Studio arbeitet, will das aber nicht nur gemeldet bekommen,
   sondern erledigt haben. Der Server schickt seinen Stand deshalb bei
   jeder Änderung von sich aus, und hier wird daraus die passende
   Antwort:

     styles/studio.css  Das Blatt wird im laufenden Betrieb getauscht. Die
                      angefangene Arbeit bleibt, wo sie ist.
     Seitendateien    Neu laden. Anders kommt neues JavaScript nicht in
                      den Tab. Die Adresse merkt sich die Figur, siehe
                      start(), man landet also wieder an derselben Stelle.
     server.js        Läuft node mit --watch, hat es den Server längst
                      neu gestartet, und ein neues START heißt genau das.
                      Auch dann neu laden, denn die Oberfläche darf nicht
                      älter sein als der Server, der sie bedient.

   Ohne --watch bleibt der alte Hinweis: Dann wird nichts neu gestartet,
   und Bescheid zu wissen ist alles, was zu haben ist. */
let seitenStand = null;
let stilStand = null;
let serverStart = null;
let laedtNeu = false;

function pruefeStand(stand) {
  if (!stand) return;
  if (seitenStand === null) {
    seitenStand = stand.seite;
    stilStand = stand.stil;
    serverStart = stand.start;
  }
  if (laedtNeu) return;

  /* Ein neues START heißt: Das hier ist nicht mehr derselbe Server.
     Verglichen wird der Abdruck der Seitendateien, nicht ihr Zeitpunkt:
     Eine bloß angefasste Datei ist kein Grund, mitten in der Arbeit neu
     zu laden, siehe abdruck() in server.js. */
  const neuerServer = stand.start && stand.start !== serverStart;
  if (neuerServer || stand.seite !== seitenStand) {
    laedtNeu = true;
    melde(neuerServer ? 'Der Server ist neu gestartet, die Seite lädt nach …'
      : 'Die Oberfläche hat sich geändert, die Seite lädt neu …');
    /* Der kurze Moment ist kein Zieren: Beim Neustart steht der Server
       noch nicht wieder, und die Meldung soll lesbar gewesen sein. */
    setTimeout(() => location.reload(), 250);
    return;
  }

  if (stand.stil > stilStand) {
    stilStand = stand.stil;
    tauscheStil();
  }

  const zeilen = [];
  if (stand.serverAlt && stand.serverAlt.length) {
    zeilen.push(`${stand.serverAlt.join(' und ')} wurde geändert, seit dieser Server läuft. `
      + 'Er arbeitet weiter mit der alten Fassung, ein Neustart holt sie nach.');
  }
  const p = $('stand-hinweis');
  p.textContent = zeilen.join(' ');
  p.hidden = !zeilen.length;
}

/* Das neue Blatt kommt neben das alte und erst, wenn es wirklich steht,
   geht das alte weg. Andersherum blitzte die Seite für einen Lidschlag
   ohne jede Gestaltung auf. Die Bühne holt sich danach ihre Farben neu,
   denn die stehen in studio.css und werden beim Zeichnen gebraucht. */
function tauscheStil() {
  const alt = document.querySelector('link[rel="stylesheet"]');
  if (!alt) return;
  const neu = alt.cloneNode();
  neu.href = 'styles/studio.css?stand=' + Date.now();
  neu.addEventListener('load', () => {
    alt.remove();
    leseFarben();
    zeichne();
  }, { once: true });
  alt.after(neu);
}

/* Der Stand im Kopf, als Reihe kurzer Anzeigen statt als Satz: erst die
   Zahl, darunter das Wort. So steht in jeder Spalte dasselbe an derselben
   Stelle und das Auge findet die gesuchte Zahl, ohne den Satz zu lesen.
   Die Art färbt die Zahl, dieselben Farben wie die Punkte in der Liste. */

const zaehlTafeln = new Map();   // Wort -> { stat, b, werk }

/* aufbau = die Zahlen zählen sich von null hoch statt nur weiterzurücken.
   Gemeint ist jeder Neuaufbau des Kopfes: das Laden der Seite, der Wechsel
   zwischen Porträts und Ganzkörper und jede Änderung an der Figurenliste.
   Ein einzelnes gespeichertes Bild ist kein Aufbau, dort soll die eine
   betroffene Zahl um eins weiterschieben und der Rest stehen bleiben. */
function zeigeZaehler(aufbau) {
  const z = S.zaehler;
  const teile = {
    portrait: () => [
      ['Figuren', S.figuren.length, ''],
      ['Porträts', z.gesamt, ''],
      ['Freigestellt', z.fertig, 'gut'],
      ['Noch alt', z.alt, 'warn'],
      ['Markiert', z.markiert, 'merk'],
      ['Ohne Datei', z.fehlt, 'fehlt'],
    ],
    ganzkoerper: () => [
      ['Figuren', S.figuren.length, ''],
      ['Ganzkörper', z.gk.gesamt, ''],
      ['Fertig', z.gk.fertig, 'gut'],
      ['Markiert', z.gk.markiert, 'merk'],
      ['Ohne Datei', z.gk.fehlt, 'fehlt'],
    ],
    /* Bei den Texten zählt die Figur: Jede hat eine Biografie und einen
       Steckbrief. „Ausgeführt“ heißt genug Abschnitte, dazu Kurzfassung
       und Kräfte, siehe texteStand in server.js. */
    biografie: () => [
      ['Figuren', S.figuren.length, ''],
      ['Biografien', z.bio.fertig + z.bio.alt, ''],
      ['Ausgeführt', z.bio.fertig, 'gut'],
      ['Angefangen', z.bio.alt, 'warn'],
      ['Ohne Text', z.bio.fehlt, 'fehlt'],
    ],
    /* Bei den Zeichen zählt nicht die Figur, sondern der Name aus
       EMBLEM_ART. „Gebaut“ heißt: Eine Maske liegt unter
       assets/emblems und tritt auf der Bühne an die Stelle des
       gezeichneten Umrisses. */
    emblem: () => [
      ['Zeichen', S.zeichen.length, ''],
      ['Gebaut', S.zeichen.filter((z) => z.maske).length, 'gut'],
      ['Nur Vorlage', S.zeichen.filter((z) => z.vorlage && !z.maske).length, 'warn'],
      ['Gezeichnet', S.zeichen.filter((z) => !z.vorlage && !z.maske).length, 'fehlt'],
    ],
  }[S.bereich]();

  /* Die Tafeln werden nicht neu geschrieben, sondern wiederverwendet, je
     eine ihrem Wort zugeordnet. Nur so behält jede Zahl ihr Zählwerk
     (count-up.js) und läuft nach einem gespeicherten Bild um eins weiter,
     statt umzuspringen. Beim Wechsel des Bereichs bleiben die Wörter
     stehen, die es in beiden gibt, und ihre Zahlen laufen von der alten
     auf die neue: Was nur einem Bereich gehört, zählt sich neu hoch.

     Die Staffel von 0,07 Sekunden je Tafel füllt den Kopf von links nach
     rechts. Sie wird bei jedem Aufbau neu vergeben, denn dieselbe Tafel
     kann im anderen Bereich an einer anderen Stelle der Reihe stehen. */
  const reihe = $('zaehler');
  const sichtbar = [];

  teile.forEach(([wort, zahl, art], i) => {
    const staffel = 0.07 * i;
    let tafel = zaehlTafeln.get(wort);
    if (!tafel) {
      const stat = document.createElement('span');
      stat.className = 'stat';
      const b = document.createElement('b');
      const kurz = document.createElement('i');
      kurz.textContent = wort;
      stat.append(b, kurz);
      tafel = { stat, b, werk: zaehlwerk(b, { bis: zahl, verzoegerung: staffel }) };
      zaehlTafeln.set(wort, tafel);
    }
    tafel.b.className = art;
    tafel.werk.setze(zahl);
    if (aufbau) tafel.werk.vonVorn(staffel);

    /* Was null ist, gibt es nicht, und was null zählt, lohnt die Spalte
       nicht. Die beiden ersten Anzeigen bleiben immer stehen, sie sind der
       Umfang der Arbeit und nicht ihr Ergebnis. */
    if (i < 2 || zahl) sichtbar.push(tafel.stat);
  });

  reihe.replaceChildren(...sichtbar);
}

/* ---------- Bereich wechseln ---------- */

/* Wie der vierte Filterknopf heißt. „Ohne Bild“ ergibt bei den Texten
   keinen Sinn, gemeint ist dort die fehlende Biografie. */
const FILTER_FEHLT = {
  portrait: ['Ohne Bild', 'Nur Figuren, denen die Porträtdatei fehlt'],
  ganzkoerper: ['Ohne Bild', 'Nur Figuren, denen das Ganzkörperbild fehlt'],
  biografie: ['Ohne Text', 'Nur Figuren ohne einen einzigen Abschnitt in js/profiles.js'],
  emblem: ['Ohne Vorlage', 'Nur Zeichen, für die noch keine Vorlage abgelegt ist'],
};

function richteBereichEin() {
  const gk = ganz();
  const bio = texte();
  const em = zeichen();

  /* Die Werkbank und die Konsole darüber gehören den Bildern einer Figur.
     Der Textbetrieb und die Zeichen haben beides nicht, sie stellen eine
     eigene Bank an dieselbe Stelle. */
  document.querySelector('.werkbank').hidden = bio || em;
  $('biografie-bank').hidden = !bio;
  $('emblem-bank').hidden = !em;
  document.querySelector('.konsole').hidden = bio || em;
  /* Der Kopf über der Bank nennt die offene Figur. Die Zeichen haben
     keine, ihr Name steht in der Bank selbst. */
  document.querySelector('.arbeit-kopf').hidden = em;

  /* Die linke Spalte führt im Emblembereich keine Figuren. Ihre
     Aufschriften sagen das auch, sonst suchte man dort nach Rollen und
     Dateinamen, die es gar nicht gibt. */
  $('listen-marke').textContent = em ? 'Zeichen' : 'Figuren';
  $('suche').placeholder = em ? 'Name des Zeichens' : 'Figur, Rolle oder Dateiname';
  document.querySelector('.listenfuss').hidden = em;

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
  /* Der Knopf tut in beiden Betrieben etwas anderes und trägt deshalb
     auch ein anderes Zeichen: der Kreis sucht den Kopf, das Rechteck legt
     sich um alles Sichtbare. */
  symbole.setze($('auto'), gk ? 'randlos' : 'zuschneiden');
  symbole.beschrifte($('auto'), gk ? 'Randlos beschneiden' : 'Automatisch zuschneiden');
  $('auto').title = gk
    ? 'Schneidet auf die Hülle aller sichtbaren Pixel, wie services/fullsize/crop-fullsize.py'
    : 'Nimmt den Kopf-Vorschlag des Porträt-Skills';

  const [wort, hilfe] = FILTER_FEHLT[S.bereich];
  const knopf = $('filter').querySelector('[data-filter="fehlt"]');
  knopf.textContent = wort;
  knopf.title = hilfe;
}

function wechsleBereich(bereich) {
  if (bereich === S.bereich) return;
  /* Angefangene Texte gehen beim Wechsel verloren, sie stehen ja nur im
     Browser. Ein Wechsel im Vorbeigehen soll sie nicht verschlucken. */
  if (texte() && !texteFortlassen()) return;
  S.bereich = bereich;
  /* Die Schablone gehört in ihren Bereich. Eine von Hand gewählte gilt
     drüben nicht weiter, auch wenn gerade keine Figur offen ist. */
  referenzVonHand = false;
  for (const b of $('bereich').children) b.classList.toggle('an', b.dataset.bereich === bereich);
  richteBereichEin();
  baueListe();

  /* Die Zeichen kennen keine Figur. Was offen war, bleibt es beim
     Zurückkommen, und beim ersten Mal steht die Bank leer da. */
  if (zeichen()) {
    ladeZeichen().then(() => {
      if (S.zeichenWahl) waehleZeichen(S.zeichenWahl);
      else zeigeLeerZeichen();
    });
    return;
  }

  zeigeZaehler(true);
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
  symbole.setze(knopf, offen ? 'liste-zu' : 'liste-auf');
  knopf.title = offen ? 'Figurenliste ausblenden' : 'Figurenliste einblenden';
  knopf.setAttribute('aria-label', knopf.title);
  knopf.setAttribute('aria-expanded', String(offen));
  /* Eingeklappt ist die Liste auch für die Tabulatortaste weg. Sonst
     wanderte der Fokus in eine Spalte, die niemand sieht. */
  $('spalte-liste').inert = !offen;
}

/* ---------- Bedienung zuklappen ---------- */

const BEDIENUNG_SCHLUESSEL = 'studio-bedienung-zu';

/* Die Tafel mit der Hilfe steht nur da, solange keine Figur gewählt ist.
   Wer sie kennt, klappt sie mit dem Kreuz weg, an ihrer Stelle bleibt der
   Knopf zurück. Der Zustand überlebt das Neuladen, sonst stünde die Tafel
   bei jedem Start wieder im Weg. */
function zeigeBedienung(offen) {
  $('bedienung').hidden = !offen;
  $('bedienung-auf').hidden = offen;
  try {
    if (offen) localStorage.removeItem(BEDIENUNG_SCHLUESSEL);
    else localStorage.setItem(BEDIENUNG_SCHLUESSEL, '1');
  } catch (fehler) { /* ohne Speicher gilt es eben nur diese Sitzung */ }
}

function bedienungGemerkt() {
  try { return localStorage.getItem(BEDIENUNG_SCHLUESSEL) !== '1'; }
  catch (fehler) { return true; }
}

/* „markiert“ ist der Handeingriff: Die Datei ist da, taugt dem Nutzer aber
   trotzdem noch nicht. Sie zählt damit als offen. */
function zielZustand(ziel) {
  if (ziel.zustand !== 'fertig') return ziel.zustand;
  return ziel.markiert ? 'markiert' : 'fertig';
}

/* Der Zustand einer Figur ist der schlechteste ihrer Bilder. Im
   Textbetrieb hat sie keine, dort zählt, wie weit ihre Texte gediehen
   sind: Das rechnet der Server aus, siehe texteStand in server.js. */
function figurZustand(figur) {
  if (texte()) return figur.texte.zustand;
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

/* ---------- Bewegung der Liste ----------

   Drei Dinge halten die Liste in Gang, und alle drei hängen an derselben
   Frage: Was sieht man gerade? Ein Eintrag fährt herein, sobald er im
   Feld auftaucht. Über beiden Kanten liegt ein Schleier, so stark, wie
   die Liste in diese Richtung noch weiterreicht. Und die Vorwahl wandert
   mit den Pfeiltasten durch das, was der Filter übrig lässt. */

const ruhig = matchMedia('(prefers-reduced-motion: reduce)');

/* Ein einziger Beobachter für alle Einträge, sein Bezugsrahmen ist die
   Liste selbst. Die Hälfte reicht als Schwelle: So kippt ein Eintrag am
   Rand einmal um und nicht bei jedem Pixel hin und her.

   Wer keine Bewegung will, bekommt gar keinen Beobachter. Die Liste
   trägt dann auch die Klasse „belebt“ nicht und steht einfach da. */
const listenBlick = 'IntersectionObserver' in window && !ruhig.matches
  ? new IntersectionObserver((eintraege) => {
      for (const e of eintraege) e.target.classList.toggle('sichtbar', e.isIntersecting);
    }, { root: $('liste'), threshold: 0.5 })
  : null;

/* Die Schleier lesen nur die Rollwerte ab. 50 Pixel sind der Weg, auf
   dem ein Schleier von fort bis voll da ist. Passt die ganze Liste ins
   Feld, gibt es unten nichts zu verschweigen. */
function frischeSchleier() {
  const liste = $('liste');
  const rest = liste.scrollHeight - liste.scrollTop - liste.clientHeight;
  const rollbar = liste.scrollHeight > liste.clientHeight + 1;
  $('schleier-oben').style.opacity = Math.min(liste.scrollTop / 50, 1);
  $('schleier-unten').style.opacity = rollbar ? Math.min(rest / 50, 1) : 0;
}

/* Die Vorwahl hält nur einen Schlüssel fest, keinen Verweis: baueListe
   wirft die Knöpfe weg und macht neue, ein Verweis zeigte danach ins
   Leere. Der Knopf daneben ist bloß die Abkürzung zum Abräumen. */
let vorwahlKnopf = null;

function setzeVorwahl(figur, rollen) {
  const knopf = figur ? figur._knopf : null;
  if (knopf !== vorwahlKnopf) {
    if (vorwahlKnopf) vorwahlKnopf.classList.remove('vorwahl');
    vorwahlKnopf = knopf;
    S.vorwahl = figur ? figur.slug : null;
    if (knopf) knopf.classList.add('vorwahl');
  }
  if (knopf && rollen) rolleZuVorwahl(knopf);
}

/* Der Eintrag soll nicht knapp an der Kante stehen bleiben, sondern mit
   etwas Luft davor. Sonst läuft er genau in den Schleier hinein und ist
   ausgerechnet der, den man sucht, halb verschluckt. */
function rolleZuVorwahl(knopf) {
  const liste = $('liste');
  const luft = 50;
  const oben = knopf.offsetTop;
  const unten = oben + knopf.offsetHeight;
  const weich = ruhig.matches ? 'auto' : 'smooth';
  if (oben < liste.scrollTop + luft) {
    liste.scrollTo({ top: Math.max(oben - luft, 0), behavior: weich });
  } else if (unten > liste.scrollTop + liste.clientHeight - luft) {
    liste.scrollTo({ top: unten - liste.clientHeight + luft, behavior: weich });
  }
}

/* Die Pfeiltasten laufen über das, was gerade dasteht, nicht über alle
   Figuren: Was Suche oder Filter ausblenden, wird übersprungen. */
function sichtbareFiguren() {
  const alle = zeichen() ? S.zeichen : S.figuren;
  return alle.filter((f) => f._knopf && !f._knopf.parentElement.hidden);
}

function baueListe() {
  if (zeichen()) return baueZeichenListe();
  const liste = $('liste');
  if (listenBlick) listenBlick.disconnect();
  vorwahlKnopf = null;
  liste.classList.toggle('belebt', !!listenBlick);
  liste.textContent = '';
  for (const figur of S.figuren) {
    const li = document.createElement('li');
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'eintrag' + (ganz() ? ' gk' : '');
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
    /* Oben steht, was auf der Charakterseite groß über der Kachel steht,
       und danach ist die Liste auch sortiert. Der Realname rutscht in die
       Zeile darunter: Sonst läge der Schlüssel der Ordnung nirgends
       sichtbar, und die Liste läse sich ungeordnet. */
    name.textContent = figur.ueberschrift || figur.name;
    const unten = document.createElement('span');
    unten.className = 'eintrag-unten';
    unten.textContent = [figur.welt,
      figur.ueberschrift === figur.name ? '' : figur.name,
      `${figur.auftritte} Auftritt${figur.auftritte === 1 ? '' : 'e'}`]
      .filter(Boolean).join(' · ');
    text.append(name, unten);

    knopf.append(bild, text);
    const anzahl = fassungsZahl(figur);
    if (anzahl > 1) {
      const marke = document.createElement('span');
      marke.className = 'marke';
      marke.textContent = anzahl + ' Fassungen';
      knopf.append(marke);
    }
    const punkt = document.createElement('span');
    punkt.className = 'punkt ' + figurZustand(figur);
    knopf.append(punkt);

    knopf.addEventListener('click', () => waehleFigur(figur.slug));
    /* Maus und Tastatur schieben denselben Zeiger. Wer die Liste
       überfährt und dann zur Tastatur greift, macht dort weiter, wo der
       Zeiger zuletzt stand. */
    knopf.addEventListener('mouseenter', () => setzeVorwahl(figur, false));
    li.append(knopf);
    figur._knopf = knopf;
    figur._bild = bild;
    figur._punkt = punkt;
    if (figur.slug === S.vorwahl) {
      vorwahlKnopf = knopf;
      knopf.classList.add('vorwahl');
    }
    if (listenBlick) listenBlick.observe(knopf);
    liste.append(li);
  }
  filtern();
  if (S.figur) S.figur._knopf.classList.add('an');
}

function filtern() {
  if (zeichen()) return filtereZeichen();
  const suche = S.suche.trim().toLowerCase();
  for (const figur of S.figuren) {
    const zustand = figurZustand(figur);
    let passt = S.filter === 'alle'
      || (S.filter === 'offen' && zustand !== 'fertig')
      || (S.filter === 'fertig' && zustand === 'fertig')
      || (S.filter === 'fehlt' && zustand === 'fehlt');
    if (passt && suche) {
      const heuhaufen = [figur.name, figur.ueberschrift, figur.rolle, figur.welt, figur.slug,
        ...zieleVon(figur).map((z) => z.datei), ...figur.filme].join(' ').toLowerCase();
      passt = heuhaufen.includes(suche);
    }
    figur._knopf.parentElement.hidden = !passt;
  }
  /* Die Liste ist gerade kürzer oder länger geworden, damit stimmt auch
     der untere Schleier nicht mehr. */
  frischeSchleier();
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
  /* Wer mitten in einem Text zu einer anderen Figur springt, verlöre ihn:
     Er steht nur im Browser. Bei derselben Figur ist nichts zu fragen,
     das ist ein Neuaufbau und kein Wechsel. */
  if (texte() && figur !== S.figur && !texteFortlassen()) return;
  S.figur = figur;
  /* Ein hochgeladenes Bild gehört zu der Figur, für die es gedacht war.
     Beim Wechsel muss deshalb auch die Wahl der Vorlage fallen, sonst
     zeigt der Ausschnitt auf ein Bild, das es nicht mehr gibt. */
  if (S.upload) URL.revokeObjectURL(S.upload.url);
  S.upload = null;
  S.quelle = null;
  history.replaceState(null, '', '#' + MARKE[S.bereich] + figur.slug);
  for (const f of S.figuren) f._knopf.classList.toggle('an', f === figur);
  /* Die offene Figur ist zugleich die Vorwahl: Von ihr aus geht es mit
     den Pfeiltasten weiter, egal ob der Klick oder die Tastatur sie
     aufgeschlagen hat. */
  setzeVorwahl(figur, false);
  figur._knopf.scrollIntoView({ block: 'nearest' });

  $('leerzustand').hidden = true;
  $('arbeit').hidden = false;
  $('figur-name').textContent = figur.name;
  $('figur-rolle').textContent = figur.rolle;
  $('figur-welt').textContent = figur.welt || '';
  $('figur-filme').textContent = figur.filme.join(', ');
  $('figur-filme').title = figur.filme.join(', ');

  if (texte()) return ladeTexte(figur);
  /* Eine neue Figur heißt: Die Schablone der alten ist erledigt, auch
     wenn sie von Hand gewählt war. */
  referenzVonHand = false;
  return waehleZiel(zieleVon(figur)[0] || null);
}

/* Zu einem Ziel die passende Vorlage.

   Beim Porträt ist das immer das bestehende Profilbild selbst. Es ist der
   Stand der Seite, und es liegt dafür auf der Bühne und nicht als
   Schablone daneben: Von dort lässt es sich nachziehen, hochrechnen und
   freistellen, und Speichern schreibt es an dieselbe Stelle zurück. Erst
   wenn die Figur in dieser Fassung noch gar kein Porträt hat, kommt ein
   Ganzkörperbild als Vorlage, aus dem der Kopf geschnitten wird.

   Beim Ganzkörperbild ist die Vorlage das Bild selbst, es wird ja neu
   beschnitten. Fehlt es noch, gibt es nichts vorzuschlagen und der Nutzer
   lädt eines hoch. */
function passendeQuelle(ziel) {
  if (!ziel) return null;
  const eigen = S.figur.quellen.find((q) => q.datei === ziel.datei);
  if (!quadrat()) return eigen ? { typ: 'fullsize', name: eigen.datei } : null;
  if (ziel.zustand !== 'fehlt') return { typ: 'portrait', name: ziel.datei };
  /* Trägt ein Ganzkörperbild denselben Namen wie das Ziel, ist es die
     richtige Fassung, sonst nimmt es das Standardbild. */
  if (S.figur.quellen.length) {
    return { typ: 'fullsize', name: (eigen || S.figur.quellen[0]).datei };
  }
  return null;
}

async function waehleZiel(ziel) {
  S.ziel = ziel;
  /* Die Zeile unter dem Knopf gehört der Fassung, für die sie geschrieben
     wurde. „Wird geschnitten …“ oder „Gespeichert: xy.webp“ über einer
     anderen Fassung stehen zu lassen, wäre eine falsche Auskunft: Läuft
     dort gerade etwas, meldet es der Fortschrittskasten, und was fertig
     ist, stand in der Meldung. */
  const info = $('speicher-info');
  info.className = 'speicher-info';
  info.textContent = ziel && speichertGerade.has(speicherSchluessel(S.bereich, ziel.datei))
    ? 'Wird geschnitten …' : '';
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
  /* Jede Fassung bringt ihre eigene Vorlage mit. Ein hochgeladenes Bild
     bleibt deshalb nicht am Werkzeug hängen, wenn die Fassung wechselt,
     sonst zeigte die Vorschau überall dasselbe. Sein Chip bleibt stehen,
     ein Klick holt es zurück. */
  const quelle = ziel ? passendeQuelle(ziel) : null;
  /* Die Wahl der Schablone wird neu aufgebaut, weil jede Fassung ihre
     eigenen Dateien anzubieten hat. Was von Hand gewählt war, bleibt
     dabei stehen, sonst steht sie auf „Ohne“. */
  baueReferenzWahl();
  if (!ziel) {
    zeigeLeer('Diese Figur hat in diesem Bereich kein Bild in der Datenbank.');
    frischeDaten();
    return;
  }
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
  /* Im Ganzkörper-Betrieb steht jede Fassung einmal in der Reihe, auch
     wenn sie in mehreren Bildern vorliegt. Ihre Varianten hängen als
     Ziffern am Chip, genauso wie sie auf der Charakterseite an der
     Profilleiste hängen. Bearbeitet wird dabei immer ein einzelnes Bild:
     Ein Klick auf eine Ziffer wählt genau dieses. */
  const gezeigt = ganz() ? fassungenVon(S.figur) : ziele;
  for (const ziel of gezeigt) {
    const stamm = stammVon(ziel);
    const varianten = ganz() ? variantenVon(S.figur, stamm) : [ziel];
    /* Offen ist die Variante, die gerade auf der Bühne steht, sonst die
       erste. So weiß der Chip, welchen Zustandspunkt und welchen Namen er
       trägt, bevor jemand eine Ziffer angeklickt hat. */
    const offen = varianten.find((z) => z === S.ziel) || varianten[0];
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (offen === S.ziel ? ' an' : '');
    const punkt = document.createElement('span');
    punkt.className = 'punkt ' + zielZustand(offen);
    const text = document.createElement('span');
    text.textContent = offen.label;
    chip.append(punkt, text);
    chip.title = `${offen.datei}.webp`
      + (offen.filme ? ' · ' + offen.filme.join(', ') : '')
      + (varianten.length > 1 ? ` · ${varianten.length} Varianten` : '')
      + (offen.zustand === 'fehlt' ? ' · noch keine Datei' : '')
      + (offen.markiert ? ' · von Hand als offen markiert' : '');
    chip.addEventListener('click', () => waehleZiel(offen));
    if (varianten.length < 2) {
      zieleFeld.append(chip);
      continue;
    }
    /* Chip und Ziffern stehen zusammen in einem Kasten, damit sie beim
       Umbrechen der Reihe nicht auseinanderfallen. */
    const gruppe = document.createElement('span');
    gruppe.className = 'chip-gruppe';
    gruppe.append(chip);
    for (const variante of varianten) {
      const ziffer = document.createElement('button');
      ziffer.type = 'button';
      ziffer.className = 'chip-variante' + (variante === S.ziel ? ' an' : '');
      const punkt2 = document.createElement('span');
      punkt2.className = 'punkt ' + zielZustand(variante);
      const zahl = document.createElement('span');
      zahl.textContent = String(variante.variante);
      ziffer.append(punkt2, zahl);
      ziffer.title = `${variante.datei}.webp`
        + (variante.zustand === 'fehlt' ? ' · noch keine Datei' : '')
        + (variante.markiert ? ' · von Hand als offen markiert' : '');
      ziffer.setAttribute('aria-label',
        `${offen.label}, Variante ${variante.variante} von ${varianten.length}`);
      ziffer.addEventListener('click', () => waehleZiel(variante));
      gruppe.append(ziffer);
    }
    zieleFeld.append(gruppe);
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
  /* Das bestehende Porträt steht mit in der Reihe. Es ist damit nicht nur
     Schablone, sondern Vorlage wie jede andere: neu beschneiden,
     hochrechnen, freistellen, und beim Speichern geht es in dieselbe
     Datei zurück. */
  if (quadrat() && S.ziel && S.ziel.zustand !== 'fehlt') {
    const chip = document.createElement('button');
    chip.type = 'button';
    const an = S.quelle && S.quelle.typ === 'portrait' && S.quelle.name === S.ziel.datei;
    chip.className = 'chip' + (an ? ' an' : '');
    const bild = document.createElement('img');
    bild.src = bildUrl(S.ziel.datei, 'portraits');
    bild.alt = '';
    const text = document.createElement('span');
    text.textContent = 'Aktuelles Bild';
    chip.append(bild, text);
    chip.title = `assets/characters/portraits/${S.ziel.datei}.webp`
      + ' · das bestehende Porträt selbst bearbeiten';
    chip.addEventListener('click', () => waehleQuelle({ typ: 'portrait', name: S.ziel.datei }));
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
  S.vorlage = null;
  S.bild = null;
  S.viertel = 0;
  S.fein = 0;
  S.rect = null;
  zeigeDrehung();
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

/* ---------- Ausrichten ----------

   Manche Vorlagen stehen schief. Ein gedrehter Ausschnitt wäre die
   falsche Antwort darauf: Die Datei am Ende ist ein aufrechtes Rechteck,
   und die Charakterseite stellt sie aufrecht in ihren Rahmen. Gedreht
   wird deshalb das Bild, nicht der Ausschnitt.

   Damit gibt es zwei Fassungen der Vorlage. **S.vorlage** ist die Datei,
   wie sie auf der Platte liegt; sie geht an den Server, wenn dort etwas
   gerechnet werden soll. **S.bild** ist die Arbeitsvorlage: bei null Grad
   dieselbe, sonst eine Leinwand mit dem gedrehten Bild darauf. Alles
   andere im Studio rechnet in Pixeln von S.bild und merkt von der Drehung
   nichts: der Ausschnitt, die Führungslinien, die Vorschau, die Ansicht.

   Beim Speichern geht der Winkel als eine Zahl mit, crop-image.py dreht
   dort genauso und schneidet dann denselben Ausschnitt heraus. Die Maße
   der gedrehten Fläche müssen auf beiden Seiten aufs Pixel dieselben
   sein, sonst läge der Ausschnitt in der Datei woanders als auf der
   Bühne. Deshalb steht die Rechnung hier und in crop-image.py wortgleich,
   bis hin zum Aufrunden. */

const BOGEN = Math.PI / 180;

/* Die Maße der Arbeitsvorlage. Ein Bild misst sich über naturalWidth,
   eine Leinwand über width, und beide kommen hier vor. */
const bildBreite = () => (S.bild ? S.bild.naturalWidth || S.bild.width : 0);
const bildHoehe = () => (S.bild ? S.bild.naturalHeight || S.bild.height : 0);

/* Der Winkel als eine Zahl, von -180 bis 180. Drei Vierteldrehungen sind
   dasselbe wie eine nach links, und so soll es auch dastehen. */
function winkelJetzt() {
  let w = S.viertel * 90 + S.fein;
  if (w > 180) w -= 360;
  if (w <= -180) w += 360;
  return Math.round(w * 100) / 100;
}

/* Die Fläche, die das gedrehte Bild braucht. Dieselbe Rechnung steht als
   dreh_masse() in crop-image.py. */
function drehMasse(winkel) {
  const w = S.vorlage.naturalWidth;
  const h = S.vorlage.naturalHeight;
  const c = Math.abs(Math.cos(winkel * BOGEN));
  const s = Math.abs(Math.sin(winkel * BOGEN));
  return {
    breite: Math.max(1, Math.round(w * c + h * s)),
    hoehe: Math.max(1, Math.round(w * s + h * c)),
  };
}

/* Ein Punkt der gedrehten Fläche in Pixeln der Vorlage und zurück. Beides
   dreht um die Mitte, positive Winkel im Uhrzeigersinn wie ctx.rotate. */
function zurVorlage(p, winkel) {
  const m = drehMasse(winkel);
  const c = Math.cos(winkel * BOGEN);
  const s = Math.sin(winkel * BOGEN);
  const dx = p.x - m.breite / 2;
  const dy = p.y - m.hoehe / 2;
  return {
    x: c * dx + s * dy + S.vorlage.naturalWidth / 2,
    y: -s * dx + c * dy + S.vorlage.naturalHeight / 2,
  };
}

function ausVorlage(p, winkel) {
  const m = drehMasse(winkel);
  const c = Math.cos(winkel * BOGEN);
  const s = Math.sin(winkel * BOGEN);
  const dx = p.x - S.vorlage.naturalWidth / 2;
  const dy = p.y - S.vorlage.naturalHeight / 2;
  return {
    x: c * dx - s * dy + m.breite / 2,
    y: s * dx + c * dy + m.hoehe / 2,
  };
}

/* Eine einzige Leinwand für alle Drehungen. Bei jedem Zucken des Reglers
   eine neue anzulegen hieße, dem Speicher ein Vielfaches der Vorlage in
   den Weg zu legen. */
const drehLeinwand = document.createElement('canvas');

function baueDrehung() {
  if (!S.vorlage) return;
  const winkel = winkelJetzt();
  if (!winkel) {
    S.bild = S.vorlage;
    return;
  }
  const m = drehMasse(winkel);
  drehLeinwand.width = m.breite;
  drehLeinwand.height = m.hoehe;
  const k = drehLeinwand.getContext('2d');
  k.setTransform(1, 0, 0, 1, 0, 0);
  k.clearRect(0, 0, m.breite, m.hoehe);
  k.imageSmoothingQuality = 'high';
  k.translate(m.breite / 2, m.hoehe / 2);
  k.rotate(winkel * BOGEN);
  k.drawImage(S.vorlage, -S.vorlage.naturalWidth / 2, -S.vorlage.naturalHeight / 2);
  k.setTransform(1, 0, 0, 1, 0, 0);
  S.bild = drehLeinwand;
}

/* Nach jeder Drehung ist die Hülle des Inhalts eine andere. Sie zu messen
   heißt, jedes Pixel der Vorlage anzufassen, und das verträgt kein
   Regler, der unter der Hand läuft. Während gezogen wird, gibt es deshalb
   keine Hülle und damit auch keine Linien an der Figur; kurz nach dem
   Loslassen stehen sie wieder.

   Ob die Vorlage freigestellt ist, wird nicht neu beurteilt: Eine Drehung
   legt durchsichtige Ecken an, und die machten aus jeder deckenden
   Vorlage eine freigestellte. */
let kastenUhr = 0;

function messeKasten() {
  clearTimeout(kastenUhr);
  kastenUhr = 0;
  if (!S.bild) return;
  S.kasten = messeInhalt(S.bild);
  if (S.kasten) S.kasten.alpha = S.vorlageAlpha;
}

function messeKastenSpaeter() {
  clearTimeout(kastenUhr);
  S.kasten = null;
  kastenUhr = setTimeout(() => { messeKasten(); zeichne(); }, 200);
}

/* Drehen und dabei den Ausschnitt auf seiner Stelle der Figur lassen:
   Sein Mittelpunkt wandert in die Vorlage und von dort in die neue
   Fläche. Die Ansicht rückt um denselben Betrag nach, sonst spränge das
   Bild bei jedem Grad unter dem Auge weg. */
function drehe(viertel, fein, sofort) {
  if (!S.vorlage || !S.rect) return;
  const alt = winkelJetzt();
  const mitte = { x: S.rect.x + S.rect.breite / 2, y: S.rect.y + S.rect.hoehe / 2 };
  const punkt = zurVorlage(mitte, alt);
  const vorschlag = S.vorschlag
    ? zurVorlage({
      x: S.vorschlag.x + S.vorschlag.breite / 2,
      y: S.vorschlag.y + S.vorschlag.hoehe / 2,
    }, alt)
    : null;
  const aufSchirm = { x: vx(mitte.x), y: vy(mitte.y) };

  S.viertel = ((viertel % 4) + 4) % 4;
  S.fein = Math.max(-45, Math.min(45, fein));
  baueDrehung();
  const neu = winkelJetzt();

  const jetzt = ausVorlage(punkt, neu);
  S.rect.x = jetzt.x - S.rect.breite / 2;
  S.rect.y = jetzt.y - S.rect.hoehe / 2;
  if (vorschlag) {
    const v = ausVorlage(vorschlag, neu);
    S.vorschlag.x = v.x - S.vorschlag.breite / 2;
    S.vorschlag.y = v.y - S.vorschlag.hoehe / 2;
  }
  view.ox += aufSchirm.x - vx(jetzt.x);
  view.oy += aufSchirm.y - vy(jetzt.y);

  if (sofort) messeKasten(); else messeKastenSpaeter();
  passeAnsichtAn();
  zeichne();
  vorschau();
  frischeDaten();
}

/* Der Zuschnitt für den Skill ist an eine gedrehte Vorlage nicht zu
   vergeben: Der Skill dreht beim nächsten Lauf nicht mit und träfe mit
   den gemerkten Werten daneben. */
const MERKEN_TITEL = $('merken-feld').title;

function zeigeDrehung() {
  const winkel = winkelJetzt();
  const ohne = !S.vorlage;
  $('winkel').value = String(S.fein);
  $('winkel').disabled = ohne;
  $('d-winkel').textContent = (winkel < 0 ? '−' : '') + Math.abs(winkel).toFixed(1) + '°';
  for (const knopf of $('drehung').querySelectorAll('button')) {
    knopf.disabled = ohne || (knopf.dataset.dreh === 'null' && !winkel);
  }
  /* Aus dem Porträt selbst gibt es nichts zu merken: manuell.json führt
     seine Werte je Vorlagenname, und der zeigt dort auf das
     gleichnamige Ganzkörperbild. */
  const eigen = eigenesBild();
  $('merken').disabled = !!winkel || eigen;
  $('merken-feld').title = winkel
    ? 'Bei gedrehter Vorlage nicht möglich: Der Skill dreht nicht mit, '
      + 'ein gemerkter Zuschnitt träfe beim nächsten Lauf daneben.'
    : eigen
      ? 'Am bestehenden Porträt nicht möglich: Der Skill merkt sich den '
        + 'Zuschnitt im Ganzkörperbild, und das ist hier nicht die Vorlage.'
      : MERKEN_TITEL;
}

/* Solange keine Vorlage dasteht, gibt es nichts zu drehen. */
zeigeDrehung();

/* ---------- Führungslinien ----------

   Alle Linien kommen aus der Hülle des sichtbaren Inhalts: der Boden
   unter den Füßen, der Scheitel, die beiden Seiten und die Senkrechte
   durch die Mitte der Figur. Sie wird einmal je Vorlage im Browser
   ausgemessen, mit derselben Alphaschwelle wie crop-image.py. Ein Wert von 8
   statt 0, weil verlustbehaftetes WebP einen unsichtbaren Saum mit
   Alphawerten von 1 bis 7 über das ganze Bild legt. */
const ALPHA_MIN = 8;

function messeInhalt(bild) {
  const b = bild.naturalWidth || bild.width;
  const h = bild.naturalHeight || bild.height;
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
    /* Dieselbe Faustregel wie in crop-image.py: Unter zwei Prozent
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
  x.push({ wert: 0, art: 'rand' }, { wert: bildBreite(), art: 'rand' });
  y.push({ wert: 0, art: 'rand' }, { wert: bildHoehe(), art: 'rand' });
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
   Ganzkörperbild die ganze Vorlage, da ist nichts zu raten.

   Ist die Vorlage das bestehende Porträt, ist es das größte Quadrat
   darin, also praktisch das ganze Bild: Der Ausschnitt sitzt ja schon,
   und wer ihn nur nachziehen will, soll nicht erst zurückzoomen. */
function standardRect(breite, hoehe) {
  if (!quadrat()) return { x: 0, y: 0, breite, hoehe };
  const seite = eigenesBild()
    ? Math.min(breite, hoehe)
    : Math.min(breite * 1.2, hoehe * 0.22);
  return {
    x: (breite - seite) / 2,
    y: eigenesBild() ? (hoehe - seite) / 2 : 0,
    breite: seite,
    hoehe: seite,
  };
}

/* Zählt jede Wahl einer Vorlage mit. Wer zweimal schnell klickt, wartet
   sonst auf zwei Bilder, und das langsamere käme zuletzt an. */
let lauf = 0;

const neueMarke = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

async function waehleQuelle(quelle) {
  if (quelle.typ === 'upload' && !S.upload) return;
  const meiner = ++lauf;
  /* Die Marke sagt dem Server, welche Pixel gerade auf der Bühne liegen.
     Sie ist neu, weil die Vorlage gleich frisch von der Platte kommt:
     Was er beim letzten Speichern von dieser Datei beiseitegelegt hat,
     zeigt die Bühne damit nicht mehr, und es gilt der Stand im Ordner. */
  S.quelle = { ...quelle, marke: neueMarke() };
  zeichneChips();
  /* Die Schablone bleibt, wie sie steht: Sie hängt an der Figur und ihren
     Fassungen, nicht daran, welche Vorlage gerade auf der Bühne liegt. */
  $('buehne-leer').hidden = true;
  $('art').textContent = 'Vorlage wird geladen …';

  const url = quelle.typ === 'upload'
    ? S.upload.url : bildUrl(quelle.name, quellOrdner(quelle));
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
  /* Eine neue Vorlage steht gerade, bis jemand anderes sagt. */
  S.vorlage = bild;
  S.viertel = 0;
  S.fein = 0;
  S.bild = bild;
  S.kasten = messeInhalt(bild);
  S.vorlageAlpha = !!(S.kasten && S.kasten.alpha);

  /* Ein Vorlagenwechsel ist kein Schritt am Ausschnitt, sondern ein
     neuer Zusammenhang. Was gerade in Arbeit war, gehört nicht dazu. */
  verwirfStapel();
  S.rect = standardRect(bildBreite(), bildHoehe());
  S.vorschlag = null;
  S.art = quadrat() ? (eigenesBild() ? 'unveraendert' : 'standard') : 'ganzes';
  S.alpha = true;
  passeAnsichtAn(true);
  zeichne();
  vorschau();
  frischeDaten();

  /* Beim Ganzkörperbild steht der Vorschlag sofort, beim Porträt muss
     der Skill das Gesicht suchen. Am bestehenden Porträt geht die Suche
     nicht von selbst los: Wer es aufschlägt, will es meist nur nachziehen
     oder schärfen, und eine Erkennung, die sofort enger schneidet, nähme
     ihm genau das. Der Knopf holt sie jederzeit. */
  if (!quadrat()) {
    setzeRandlos(false);
    stelleSchwebeHer();
  } else if (eigenesBild()) {
    S.vorschlag = { ...S.rect };
    frischeDaten();
  } else if (S.python.ok) await holeVorschlag();
  else $('art').textContent = AUSKUNFT['ohne-skill'];
}

/* Der randlose Zuschnitt eines Ganzkörperbildes ist die Hülle des
   sichtbaren Inhalts, und die hat der Browser für die Führungslinien
   ohnehin schon gemessen. Dafür braucht es keinen Weg zum Server: Das
   Ergebnis steht sofort, statt nach einer knappen Sekunde. Gerechnet wird
   mit derselben Alphaschwelle wie in crop-image.py. */
function setzeRandlos(merken) {
  if (!S.bild) return;
  const vorher = merken ? zustandJetzt() : null;
  const k = S.kasten;
  S.vorschlag = k
    ? { x: k.links, y: k.oben, breite: k.rechts - k.links, hoehe: k.unten - k.oben }
    : { x: 0, y: 0, breite: bildBreite(), hoehe: bildHoehe() };
  S.alpha = !!(k && k.alpha);
  S.art = S.alpha ? 'rand' : 'ganzes-bild';
  S.rect = { ...S.vorschlag };
  passeAnsichtAn(true);
  zeichne();
  vorschau();
  frischeDaten();
  if (vorher) merkeAusschnitt('Randlos beschnitten', vorher);
}

/* Eine fliegende Figur wieder in die Luft heben, wenn ihre Vorlage
   aufgeschlagen wird.

   Der randlose Zuschnitt legt das Rechteck eng um die sichtbaren Pixel
   und nimmt der Figur damit genau die leere Fläche weg, die sie schweben
   lässt. Wer sie nur nachschärfen will, sähe sie danach auf der
   Bodenlinie stehen und schriebe beim Speichern eine Null in
   FULLSIZE_LIFT. Deshalb wird die gespeicherte Schwebe hier wieder
   angehängt: unten so viel Fläche, dass ihr Anteil wieder stimmt.

   Nur der Boden wandert. Streifen links, rechts und oben bleiben
   weggeschnitten, die gehören nicht zur Schwebe. */
function stelleSchwebeHer() {
  const schwebe = (S.ziel && S.ziel.schwebe) || 0;
  if (quadrat() || !S.rect || !(schwebe > 0) || !S.alpha) return;
  S.rect.hoehe /= (1 - schwebe);
  passeAnsichtAn(true);
  zeichne();
  vorschau();
  frischeDaten();
}

/* Den Vorschlag holen und übernehmen: beim Porträt den Kopf aus dem
   Skill, beim Ganzkörperbild die Hülle des sichtbaren Inhalts. Beim
   Wechsel der Vorlage passiert das von allein, per Knopf auch später
   wieder. Der Vorschlag bleibt gespeichert, „Zurücksetzen“ kommt zu ihm
   zurück. */
async function holeVorschlag(merken) {
  const quelle = S.quelle;
  const winkel = winkelJetzt();
  const vorher = merken ? zustandJetzt() : null;
  $('art').textContent = quadrat()
    ? 'Die Erkennung sucht das Gesicht …'
    : 'Der sichtbare Rand wird gesucht …';
  try {
    /* Der Server bekommt den Winkel mit und dreht vor der Erkennung
       genauso. Sein Vorschlag steht damit in denselben Pixeln wie der
       Ausschnitt auf der Bühne. */
    const p = new URLSearchParams({ typ: quelle.typ, bereich: S.bereich, winkel });
    if (quelle.typ === 'upload') p.set('id', quelle.id); else p.set('name', quelle.name);
    if (quelle.marke) p.set('marke', quelle.marke);
    const daten = await json('/api/auto?' + p);
    /* Inzwischen umgeschaltet oder weitergedreht: Der Vorschlag gehört
       dann zu einer Fläche, die es so nicht mehr gibt. */
    if (S.quelle !== quelle || winkelJetzt() !== winkel) return;
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

   Von selbst liegt nichts darin: Die Wahl steht auf „Ohne“, bis der
   Nutzer eine Fassung aussucht. Das bestehende Porträt steht beim
   Porträt-Betrieb ohnehin schon auf der Bühne, es hier ein zweites Mal
   darüberzulegen zeigte nur Schleier.

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

/* Hat der Nutzer die Wahl selbst getroffen, bleibt sie stehen. Erst der
   Wechsel zu einer anderen Figur oder in einen anderen Bereich gibt sie
   wieder frei, dann steht sie wieder auf „Ohne“. */
let referenzVonHand = false;

/* Was liegen soll, mitsamt Bereich. Nicht dasselbe wie S.referenz: Die
   Datei lädt, und in der Zeit kann die Wahl schon wieder neu gebaut
   werden. Ohne diesen Merker liefe dann ein zweiter Ladevorgang für
   dasselbe Bild los. */
let referenzWunsch = { datei: '', bereich: null };

function baueReferenzWahl() {
  const wahl = $('referenz');
  /* Die Wahl gilt nur im eigenen Bereich. Porträt und Ganzkörperbild
     tragen denselben Dateinamen, der Name allein sagt also nicht, aus
     welchem Ordner das geladene Bild stammt. Ohne diese Prüfung bliebe
     nach dem Wechsel das Ganzkörperbild als Schablone über dem Porträt
     stehen. */
  const eigenerBereich = referenzWunsch.bereich === S.bereich;
  const vorher = eigenerBereich ? referenzWunsch.datei : '';
  wahl.textContent = '';
  wahl.append(new Option('Ohne', ''));
  const dateien = S.figur ? zieleVon(S.figur).filter((z) => z.zustand !== 'fehlt') : [];
  for (const z of dateien) wahl.append(new Option(z.labelBild || z.label || z.datei, z.datei));
  wahl.disabled = !dateien.length;
  /* Eine von Hand gewählte Schablone hat Vorrang, solange es sie noch
     gibt: So übersteht sie das Speichern und den Sprung zu einer anderen
     Fassung. Sonst bleibt es bei „Ohne“. */
  const halten = referenzVonHand && !!vorher && dateien.some((z) => z.datei === vorher);
  const jetzt = halten ? vorher : '';
  wahl.value = jetzt;
  /* Nach einem Bereichswechsel muss setzeReferenz() auf jeden Fall laufen,
     auch wenn beide Namen leer sind: Die Wahl steht dann zwar auf „Ohne“,
     das Bild des anderen Bereichs liegt aber noch in S.referenz und würde
     weiter gezeichnet. Innerhalb eines Bereichs bleibt der Vergleich, sonst
     liefe für eine noch ladende Datei ein zweiter Ladevorgang los. */
  if (jetzt !== vorher || !eigenerBereich) setzeReferenz(jetzt || null);
}

async function setzeReferenz(datei) {
  const meiner = ++referenzLauf;
  referenzWunsch = { datei: datei || '', bereich: S.bereich };
  if (!datei) {
    S.referenz = null;
    $('referenz-alpha').disabled = true;
    zeichne();
    return;
  }
  try {
    /* Der Bereich wird vor dem Laden festgehalten: Er sagt, aus welchem
       Ordner das Bild kommt, und entscheidet später, ob die Wahl einen
       Wechsel übersteht. */
    const bereich = S.bereich;
    const bild = await bildLaden(bildUrl(datei));
    if (meiner !== referenzLauf) return;
    S.referenz = { datei, bild, bereich };
    $('referenz-alpha').disabled = false;
  } catch (fehler) {
    if (meiner !== referenzLauf) return;
    S.referenz = null;
    referenzWunsch = { datei: '', bereich: S.bereich };
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

   Liegt der Rahmen über der Bühne, wird nicht der Ausschnitt allein
   eingepasst, sondern der Platz, den der Rahmen um ihn herum braucht,
   siehe blickHoehe(). Wie groß die Bühne zeichnet, hängt damit am
   Ausschnitt und sonst an nichts.

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
  const zeigHoehe = blickHoehe();
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
  return Math.min(breite / bildBreite(), hoehe / bildHoehe()) * 0.94;
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
  view.ox = (breite - bildBreite() * view.k) / 2;
  view.oy = (hoehe - bildHoehe() * view.k) / 2;
  S.ansichtManuell = true;
  zeichne();
}

function zeichne() {
  if (!buehne.width) messen();
  ctx.clearRect(0, 0, breite, hoehe);
  zeigeZoom();
  if (!S.bild || !S.rect) return;

  const b = bildBreite();
  const h = bildHoehe();
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
const RAHMEN_SEITEN = 1.1;          // --frame-ratio, siehe css/style.css
const RAHMEN_LUFT = 0.82;           // ebenda: darüber bleibt Platz für den Kopf

/* ---------- Die Schwebe: leere Fläche unter der Figur ----------

   Wer den Ausschnitt unter die Figur hinaus nach unten zieht, will sie
   fliegen lassen und nicht kleiner haben. Für den Rahmen ist die leere
   Fläche aber Bild wie jede andere, und dieselbe Figur stünde in einer
   höheren Datei kleiner da.

   Deshalb wird gemessen statt ausgeglichen: Wie viel des Ausschnitts
   unter dem letzten sichtbaren Pixel liegt, steht als eigene Zahl in
   FULLSIZE_LIFT und rechnet die Datei auf der Seite wieder groß. Die
   Bildkorrektur bleibt davon unberührt, sie sagt weiter, wie die Pose
   von einer ruhig stehenden abweicht.

   Ohne freigestellte Vorlage gibt es keine Hülle und damit keine
   Schwebe: Ein Bild mit undurchsichtigem Hintergrund hat unten keine
   leere Fläche, sondern Hintergrund. */
function schwebeJetzt(genau) {
  /* Nach einer Drehung wird die Hülle erst nach einer kurzen Pause neu
     gemessen. Fürs Zeichnen ist das gleichgültig, beim Speichern nicht:
     Dort muss die Zahl stimmen, auch wenn sie gerade fehlt. */
  if (genau && !S.kasten && S.bild) messeKasten();
  const k = S.kasten;
  const r = S.rect;
  if (quadrat() || !r || !k || !k.alpha || !(r.hoehe > 0)) return 0;
  const leer = (r.y + r.hoehe) - k.unten;
  return Math.max(0, Math.min(0.9, Math.round((leer / r.hoehe) * 1000) / 1000));
}

/* Wie viel der Rahmen von der Datei zeigt: Körpergröße mal
   Bildkorrektur, über die Schwebe wieder aufgerechnet, gedeckelt bei
   der vollen Rahmenhöhe. Dieselbe Rechnung steht als max-height an
   .char-figure-frame img in css/style.css. */
function dateiAnteil(skala, korrektur, schwebe) {
  return Math.min(1, wirkung(skala, korrektur) * RAHMEN_LUFT / (1 - schwebe));
}

/* Welche Kante des Ausschnitts seine Größe im Rahmen bestimmt. Der
   Rahmen ist 1.1 mal so breit wie hoch; ein Ausschnitt, der breiter als
   das ist, stößt zuerst an die Seiten und zählt dann mit seiner Breite.

   Anders als in der Höhe zählt seitlich das Maß der Figur und nicht das
   der Datei: Der Zuschnitt sitzt links und rechts eng an ihr, leere
   Fläche steht nur unten. */
function rahmenMasse() {
  if (!S.rect) return null;
  const r = S.rect;
  const schwebe = schwebeJetzt();
  const hochkant = r.hoehe / dateiAnteil(S.skala, S.korrektur, schwebe);
  const quer = r.breite / (RAHMEN_SEITEN * wirkung(S.skala, S.korrektur) * RAHMEN_LUFT);
  /* Es zählt die Kante, die zuerst anstößt: Eine weit ausgebreitete
     Flugpose stößt an die Seiten, alles Stehende an die Höhe. */
  const hoehe = Math.max(hochkant, quer);
  return { hoehe, breite: hoehe * RAHMEN_SEITEN, schwebe,
    /* Was der Rahmen zeigt, ist die Figur und nicht die leere Fläche
       unter ihr. */
    anteil: r.hoehe * (1 - schwebe) / hoehe };
}

/* Wonach die Bühne einpasst. Mit Rahmen gehört seine Oberkante mit ins
   Bild, sonst stünde sie gerade bei den kleinen Figuren weit über dem
   oberen Bühnenrand, und das ist die Linie, um die es geht.

   Gerechnet wird sie aber mit den Standardwerten und nicht mit den
   Reglern: Sonst zöge jeder Zug an Körpergröße oder Bildkorrektur den
   Zoom der Bühne mit, und die Figur bliebe darin gleich groß, während
   die Zahlen ringsum sich ändern. Umgekehrt ist es richtig herum: Der
   Zoom bleibt stehen, und die Rahmenlinien wandern. */
function blickHoehe() {
  const r = S.rect;
  if (quadrat() || !S.rahmen) return r.hoehe;
  return Math.max(r.hoehe / dateiAnteil(1, 1, schwebeJetzt()),
    r.breite / (RAHMEN_SEITEN * RAHMEN_LUFT));
}

/* Die Referenz in diesem Rahmen, gerechnet wie auf der Seite: Ihre Höhe
   folgt ihren eigenen Werten samt ihrer eigenen Schwebe, und wird sie
   dabei breiter als der Rahmen, begrenzt ihn die Breite. Dieselben
   beiden Schranken stehen als max-width und max-height in
   css/style.css. */
function referenzMasse(mass) {
  if (!S.referenz || !mass || !S.figur) return null;
  const eintrag = zieleVon(S.figur).find((z) => z.datei === S.referenz.datei);
  const skala = (eintrag && eintrag.skala) || 1;
  const korrektur = (eintrag && eintrag.korrektur) || 1;
  const wert = wirkung(skala, korrektur);
  const rb = S.referenz.bild;
  const seiten = rb.naturalWidth / rb.naturalHeight;
  let hoehe = mass.hoehe * dateiAnteil(skala, korrektur, (eintrag && eintrag.schwebe) || 0);
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
     wechselt ihre Beschriftung unter die Linie und nach links. Bei einer
     klein gestellten Figur wandert die Linie ganz über die Bühne hinaus;
     dann bleibt die Zahl am oberen Rand stehen und sagt dazu, wo die
     Linie liegt. */
  const eng = oben < 46;
  const weg = oben < 0;
  ctx.textAlign = eng ? 'left' : 'right';
  ctx.fillText(`Rahmenoberkante${weg ? ' über der Bühne' : ''}, `
    + `die Figur füllt ${Math.round(mass.anteil * 100)} %`,
    eng ? 6 : breite - 6, eng ? Math.max(13, oben + 13) : oben - 5);
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
  const kleinste = Math.max(16, Math.min(bildBreite(), bildHoehe()) * 0.04);
  const groesste = Math.max(bildBreite(), bildHoehe()) * 1.6;
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
       Ergebnis ist dasselbe wie der durchsichtige Rand in crop-image.py. */
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

  /* Die Zeile unter dem Kreis nennt nicht seine Anzeigegröße, sondern die
     Kante der Datei, die beim Speichern entsteht. Sie steht hier und nicht
     in frischeDaten(), damit die Zahl schon beim Ziehen mitläuft. */
  const mass = ergebnisMass();
  $('pv-mass').textContent = mass && S.bild ? `Datei, ${mass.breite} px` : '';
}

/* Die Bildkorrektur läuft in Tausendsteln, ein Schritt ist also ein
   Zehntel Prozent. So steht sie auch da, sonst zeigte die Zahl neben dem
   Regler bei jedem zweiten Schritt denselben Wert. */
const prozent = (wert) => (wert * 100).toFixed(1) + ' %';

/* Der Rahmen der Charakterseite in Pixeln dieser Seite: --stage-h steht
   in css/style.css auf 32rem. Die Zahl macht aus den beiden Reglern ein
   Maß, das sich nachmessen lässt, und sagt zugleich, wie fein sie
   greifen: Ein Schritt der Bildkorrektur sind gut vier Zehntel Pixel,
   auf einem üblichen Schirm also gut ein Zehntelmillimeter. */
const SEITEN_RAHMEN = 512;

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
  /* Drei Stellen wie in fullsizeScale(): Zwei verschluckten die feinen
     Schritte der Bildkorrektur, und neben dem Regler stünde eine Zahl,
     die sich beim Ziehen nicht rührt. */
  const roh = Math.round(S.skala * S.korrektur * 1000) / 1000;
  $('d-skala').textContent = S.skala.toFixed(2);
  $('d-korrektur').textContent = prozent(S.korrektur);

  const zahl = document.createElement('b');
  zahl.textContent = roh.toFixed(3);
  const hinweis = $('d-wirkung');
  hinweis.replaceChildren('Im Rahmen: ', zahl);
  const moeglich = roh >= 0.2 && roh <= 1.22;
  if (roh > 1.22) hinweis.append(', mehr als 1.22 zeigt der Rahmen nicht.');
  else if (roh < 0.2) hinweis.append(', weniger als 0.2 geht im Rahmen unter.');
  else if (S.korrektur !== 1) hinweis.append(` (${S.skala.toFixed(2)} mal `
    + `${prozent(S.korrektur)})`);
  hinweis.classList.toggle('zuviel', !moeglich);

  /* Der Realwert zu den beiden Reglern: wie hoch die Figur damit im
     Rahmen der Charakterseite steht. Gerechnet wird sie wie dort, samt
     der Kante, die zuerst anstößt, deshalb kommt die Zahl aus
     rahmenMasse() und nicht noch einmal aus der Formel. */
  const rahmen = S.rect ? rahmenMasse() : null;
  const hoehenZeile = $('d-hoehe');
  hoehenZeile.hidden = !rahmen;
  if (rahmen) {
    const px = document.createElement('b');
    /* Eine Nachkommastelle, damit jeder Schritt des Reglers zu sehen
       ist: Auf ganze Pixel gerundet stünde bei zwei Schritten dieselbe
       Zahl, und der Regler wirkte wieder grob. */
    px.textContent = (SEITEN_RAHMEN * rahmen.anteil).toFixed(1) + ' px';
    hoehenZeile.replaceChildren('Auf der Seite steht die Figur ', px,
      ` hoch, der Rahmen misst ${SEITEN_RAHMEN}.`);
  }

  /* Die Schwebe steht daneben als Ablesung und nicht als Regler: Sie
     wird am Ausschnitt gemessen und nicht eingestellt. Sichtbar ist sie
     nur, wenn es sie gibt, sonst stünde bei jeder stehenden Figur eine
     Zeile mit einer Null. */
  const schwebe = schwebeJetzt();
  const schwebeZeile = $('d-schwebe');
  schwebeZeile.hidden = schwebe <= 0;
  if (schwebe > 0) {
    const anteil = document.createElement('b');
    anteil.textContent = Math.round(schwebe * 100) + ' %';
    schwebeZeile.replaceChildren('Schwebe: ', anteil, ' der Datei sind unter der Figur leer');
    /* Voll ist der Rahmen, wenn die Datei ihn ganz ausfüllt. Von da an
       hebt weiteres Ziehen die Figur nicht mehr, sondern macht sie
       kleiner. */
    if (dateiAnteil(S.skala, S.korrektur, schwebe) >= 1) {
      schwebeZeile.append('. Der Rahmen ist voll, weiter steigt sie nicht.');
    }
    schwebeZeile.classList.toggle('zuviel', dateiAnteil(S.skala, S.korrektur, schwebe) >= 1);
  }

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
  /* Oben die Schwebe, die dieser Ausschnitt gerade ergibt, unten die,
     die mit der Datei in chars.js steht. */
  leinwand.parentElement.style.setProperty('--figure-lift', schwebeJetzt());
  $('pv-gk-alt').parentElement.style.setProperty('--figure-scale',
    wirkung((S.ziel && S.ziel.skala) || 1, (S.ziel && S.ziel.korrektur) || 1));
  $('pv-gk-alt').parentElement.style.setProperty('--figure-lift',
    (S.ziel && S.ziel.schwebe) || 0);
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
   Vorlagen auf das Maß des Bestandes gebracht. Beides spiegelt crop-image.py. */
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
  /* Der Ordner gehört dazu: Beide Bilder einer Figur heißen gleich, der
     Dateiname allein sagt also nicht, welches auf der Bühne liegt. */
  $('d-quelle').title = S.quelle && S.quelle.typ !== 'upload'
    ? `assets/characters/${quellOrdner(S.quelle)}/${S.quelle.name}.webp` : '';

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
      if (eigenesBild() && ziel && S.quelle.name === ziel.datei) {
        warnungen.push('Vorlage und Ziel sind dieselbe Datei. Speichern rechnet sie also '
          + 'ein zweites Mal durch WebP, die vorige Fassung liegt danach in '
          + 'tools/portrait-studio/.sicherung.');
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
  zeigeDrehung();
  /* Gesperrt ist der Knopf nur für die eine Fassung, die gerade
     geschnitten wird. Jede andere lässt sich nebenher speichern. */
  $('speichern').disabled = !(S.bild && S.rect && ziel)
    || speichertGerade.has(speicherSchluessel(S.bereich, ziel.datei));
  $('hochskalieren').disabled = !(S.bild && S.quelle) || skaliertLaeuft;
  $('freistellen').disabled = !(S.bild && S.quelle) || freiLaeuft;
}

/* ---------- Speichern ----------

   Ein Zuschnitt läuft ein paar Sekunden, und in dieser Zeit soll die
   Oberfläche weiter bedienbar sein: zur nächsten Fassung wechseln, die
   nächste Figur aufschlagen, ein zweites Bild losschicken. Der Server
   kann das, er arbeitet die Aufträge nebeneinander ab.

   Dafür darf nach dem Warten nichts mehr aus S gelesen werden. Alles,
   wozu der Auftrag gehört – Bereich, Figur, Ziel, Ordner –, wird vorher
   festgehalten und danach an genau diesen Objekten nachgetragen. Vorher
   schrieb die Antwort in S.ziel, und das war nach einem Wechsel die
   falsche Fassung: Das eben geschnittene Bild blieb in der Liste auf
   „fehlt“ stehen, das andere sprang auf „fertig“, und das Ganze sah aus,
   als hätte der Server den Auftrag fallen gelassen. Geschrieben war die
   Datei die ganze Zeit.

   Die Anzeige am Werkzeug – Knopf, Zeile darunter, Vorschau – gehört
   dagegen dem, was gerade auf der Bühne liegt. Sie wird nur angefasst,
   wenn das immer noch derselbe Auftrag ist. */

/* Welche Ziele gerade geschnitten werden, je Bereich und Datei. Ein
   zweiter Klick auf dieselbe Fassung wartet, ein Klick auf eine andere
   nicht. */
const speichertGerade = new Set();

function speicherSchluessel(bereich, datei) {
  return bereich + '/' + datei;
}

async function speichern() {
  if (!S.bild || !S.rect || !S.ziel) return;

  /* Der Auftrag, wie er jetzt dasteht. Ab hier ist S nur noch für die
     Anzeige zuständig, nicht mehr für den Inhalt. */
  const auftrag = {
    bereich: S.bereich,
    figur: S.figur,
    ziel: S.ziel,
    ordner: ordner(),
    quadrat: quadrat(),
    winkel: winkelJetzt(),
    daten: {
      bereich: S.bereich,
      ziel: S.ziel.datei,
      quelle: S.quelle,
      x: S.rect.x,
      y: S.rect.y,
      breite: S.rect.breite,
      hoehe: S.rect.hoehe,
      /* Der Ausschnitt ist in der gedrehten Fläche gemessen, also muss
         der Server vor dem Schneiden genauso drehen. */
      winkel: winkelJetzt(),
      merken: quadrat() && $('merken').checked && !winkelJetzt() && !eigenesBild(),
      /* Der Zuschnitt und die Größe im Rahmen gehören zusammen, also
         gehen die Regler mit. Der Knopf darüber bleibt trotzdem: Er
         setzt die Größe, ohne die Datei neu zu schneiden.

         Die Schwebe kommt nur hier mit und nicht über den Knopf: Sie ist
         am Ausschnitt gemessen und gilt für die Datei, die gerade
         geschrieben wird. */
      ...(quadrat() ? {} : { skala: S.skala, korrektur: S.korrektur, schwebe: schwebeJetzt(true) }),
    },
  };

  const schluessel = speicherSchluessel(auftrag.bereich, auftrag.ziel.datei);
  if (speichertGerade.has(schluessel)) return;
  speichertGerade.add(schluessel);

  /* Zeigt die Bühne noch denselben Auftrag? Danach richtet sich, ob die
     Anzeige am Werkzeug etwas zu sagen hat. */
  const nochDa = () => S.ziel === auftrag.ziel && S.bereich === auftrag.bereich;

  const info = $('speicher-info');
  $('speichern').disabled = true;
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
      body: JSON.stringify(auftrag.daten),
    });
  } catch (fehler) {
    speichertGerade.delete(schluessel);
    if (nochDa()) {
      $('speichern').disabled = false;
      info.className = 'speicher-info schlecht';
      info.textContent = 'Nicht gespeichert: ' + fehler.message;
    }
    melde(`${auftrag.ziel.datei}.webp nicht gespeichert: ${fehler.message}`, true);
    return;
  }
  speichertGerade.delete(schluessel);

  const ziel = auftrag.ziel;
  ziel.zustand = antwort.zustand;
  if (antwort.warMarkiert) ziel.markiert = false;
  /* Die Größe steht jetzt in chars.js. Damit ist sie der neue Vergleich,
     unten in der Vorschau wie an den beiden Rücksetzern. */
  if (antwort.groessenwerte) {
    ziel.skala = antwort.groessenwerte.skala;
    ziel.korrektur = antwort.groessenwerte.korrektur;
    ziel.schwebe = antwort.groessenwerte.schwebe;
  }
  /* Die Datei gibt es jetzt. Ohne diesen Eintrag fände die Fassung beim
     nächsten Hinwechseln ihre eigene Vorlage nicht und meldete wieder,
     es gebe noch kein Bild. */
  if (!auftrag.quadrat && auftrag.figur
    && !auftrag.figur.quellen.some((q) => q.datei === ziel.datei)) {
    auftrag.figur.quellen.push({ datei: ziel.datei, label: ziel.label });
  }
  S.zaehler = antwort.zaehler;
  /* Der Stempel gehört an die Datei, die geschrieben wurde, nicht an die,
     die gerade zu sehen ist. Sonst zeigte das Studio beim Zurückwechseln
     weiter das Bild von vorhin. */
  S.frisch.set(auftrag.ordner + '/' + ziel.datei, Date.now());
  pruefeStand(antwort.stand);
  frischerVerlauf(antwort.verlauf);
  zeigeZaehler();
  if (auftrag.figur) frischeListe(auftrag.figur);

  const mass = auftrag.quadrat
    ? `${antwort.groesse} × ${antwort.groesse}`
    : `${antwort.breite} × ${antwort.hoehe}`;
  const g = antwort.groessenwerte;
  const winkel = auftrag.winkel;
  const satz = `Gespeichert: ${ziel.datei}.webp, ${mass} px.`
    + (winkel ? ` Um ${(winkel < 0 ? '−' : '') + Math.abs(winkel).toFixed(1)}° gedreht.` : '')
    + (antwort.warMarkiert ? ' Die Markierung „noch offen“ ist damit weg.' : '')
    + (antwort.gemerkt ? ' Zuschnitt in manuell.json vermerkt.' : '')
    + (antwort.verkleinert ? ' Die Vorlage war größer als der Bestand und wurde verkleinert.' : '')
    + (g && g.geaendert
      ? ` Körpergröße ${g.skala.toFixed(2)}`
        + (g.korrektur === 1 ? '' : `, Bildkorrektur ${prozent(g.korrektur)}`)
        + (g.schwebe ? `, Schwebe ${Math.round(g.schwebe * 100)} %` : '')
        + ' stehen in chars.js.'
      : '')
    + (antwort.groessenfehler
      ? ' Die Größe blieb stehen: ' + antwort.groessenfehler : '')
    + (antwort.sicherung ? ' Die alte Datei liegt in tools/portrait-studio/.sicherung.' : '');

  if (nochDa()) {
    zeichneChips();
    frischeDaten();
    vorschau();
    info.className = 'speicher-info gut';
    info.textContent = satz;
  } else if (S.figur === auftrag.figur) {
    /* Dieselbe Figur, andere Fassung: Ihre Chips tragen den Zustand
       jeder Fassung, und einer davon hat sich eben geändert. */
    zeichneChips();
  }
  melde(`${ziel.datei}.webp gespeichert.` + (antwort.liste ? ' ' + antwort.liste : ''));
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

/* Der Stamm eines Bildes: die Fassung, zu der es gehört. Bei einer
   Fassung ohne Varianten ist beides derselbe Name. Die Eingriffe an
   einer Fassung nennen ihn und nicht die einzelne Datei. */
const stammVon = (ziel) => (ziel && (ziel.stamm || ziel.datei)) || '';

/* Die Fassungen einer Figur, jede einmal. In figur.ganzkoerper steht
   jedes Bild für sich, eine Fassung mit drei Varianten also dreimal. */
function fassungenVon(figur) {
  const gesehen = new Set();
  const liste = [];
  for (const ziel of (figur && figur.ganzkoerper) || []) {
    const stamm = stammVon(ziel);
    if (gesehen.has(stamm)) continue;
    gesehen.add(stamm);
    liste.push(ziel);
  }
  return liste;
}

/* Alle Bilder einer Fassung, in der Reihenfolge ihrer Varianten. */
function variantenVon(figur, stamm) {
  return ((figur && figur.ganzkoerper) || []).filter((z) => stammVon(z) === stamm);
}

/* Die Stelle des Ziels in der ganzen Liste, nicht nur unter den
   gepflegten: Fassungen, die bisher nur als Datei im Ordner liegen,
   wandern beim ersten Eingriff von selbst in FULLSIZE_LOOKS.

   Gezählt werden Fassungen und keine Bilder: Die Leiste verschiebt und
   löscht Fassungen, und eine Fassung mit drei Varianten ist eine. */
/* Standard ist, was an erster Stelle steht, unabhängig vom Dateinamen. */
function fassungLage() {
  const figur = S.figur;
  const ziel = S.ziel;
  if (!figur || !ziel) return { stelle: -1, anzahl: 0, varianten: 1 };
  const fassungen = fassungenVon(figur);
  const stamm = stammVon(ziel);
  const stelle = fassungen.findIndex((z) => stammVon(z) === stamm);
  return {
    standard: stelle === 0,
    stelle,
    anzahl: fassungen.length,
    varianten: ziel.varianten || 1,
    variante: ziel.variante || 1,
  };
}

function frischeFassungsleiste() {
  const leiste = $('fassung-leiste');
  leiste.hidden = !ganz();
  frischeFilmwahl();
  frischeBeschreibung();
  if (leiste.hidden) return;
  const l = fassungLage();
  const knopf = (tat) => leiste.querySelector(`[data-tat="${tat}"]`);
  knopf('neu').disabled = !S.figur;
  /* Auch die Figur mit ihrem einzigen Bild darf beschriftet werden: Ohne
     Beschriftung schreibt die Charakterseite ihren Namen an die
     Fassungstafel, und wer stattdessen die Fassung benennt, legt damit
     zugleich ihren Eintrag in FULLSIZE_LOOKS an. */
  knopf('umbenennen').disabled = !S.ziel;
  knopf('loeschen').disabled = !S.ziel || l.anzahl < 2;
  knopf('hoch').disabled = !S.ziel || l.stelle < 1;
  knopf('runter').disabled = !S.ziel || l.stelle < 0 || l.stelle >= l.anzahl - 1;
  knopf('standard').disabled = !S.ziel || l.standard;
  /* Varianten hängen an der Fassung und nicht an der Figur: Auch die
     Figur mit ihrem einzigen Bild darf eine zweite Aufnahme bekommen.
     Weg geht eine nur, solange es überhaupt eine zweite gibt. */
  knopf('variante-neu').disabled = !S.ziel || l.varianten >= 9;
  knopf('variante-weg').disabled = !S.ziel || l.varianten < 2;
  /* Die beiden Pfeile schieben das offene Bild in der Reihe seiner
     Varianten, nicht die Fassung in ihrer Liste. Sie stehen deshalb
     waagerecht: So hängen die Ziffern auch am Chip. */
  knopf('variante-hoch').disabled = !S.ziel || l.variante < 2;
  knopf('variante-runter').disabled = !S.ziel || l.variante >= l.varianten;
  /* Umhängen geht in beide Richtungen: Eine Fassung wird Variante einer
     anderen, sobald es überhaupt eine andere gibt, und eine Variante
     löst sich, sobald sie eine ist. */
  knopf('zu-variante').disabled = !S.ziel || l.anzahl < 2;
  knopf('zu-fassung').disabled = !S.ziel || l.varianten < 2;
  const grund = l.anzahl < 2 ? 'Die Figur hat nur dieses eine Bild.'
    : (l.standard ? 'Das ist schon die Standardansicht.' : '');
  for (const tat of ['loeschen', 'hoch', 'runter', 'standard']) {
    knopf(tat).title = knopf(tat).disabled && grund ? grund : knopf(tat).dataset.hilfe;
  }
  /* Ein gesperrter Knopf sagt, woran es liegt. Bei den Varianten sind das
     zwei verschiedene Gründe: Die Fassung hat nur ihr eines Bild, oder
     das offene steht schon am Ende der Reihe. */
  const einBild = 'Diese Fassung hat nur dieses eine Bild.';
  const enden = {
    'variante-weg': einBild,
    'zu-fassung': 'Diese Fassung hat nur dieses eine Bild, sie steht schon für sich.',
    'variante-hoch': l.varianten < 2 ? einBild : 'Das ist schon die erste Variante.',
    'variante-runter': l.varianten < 2 ? einBild : 'Das ist schon die letzte Variante.',
    'zu-variante': 'Die Figur hat nur diese eine Fassung, es gibt nichts zum Anhängen.',
    'variante-neu': 'Mehr als neun Varianten trägt eine Fassung nicht.',
  };
  for (const [tat, warum] of Object.entries(enden)) {
    knopf(tat).title = knopf(tat).disabled && S.ziel ? warum : knopf(tat).dataset.hilfe;
  }
}

/* ---------- Der Film einer Fassung ----------

   Zu jeder Ganzkörper-Fassung gehört der Film, aus dem sie stammt: Die
   Charakterseite setzt sein Logo auf die Fassungstafel und schreibt
   Titel und Jahr neben die Bühne. Gemeint ist der Film, der die Fassung
   zeigt, und nicht jeder, in dem sie vorkommt – Steve Rogers trägt
   seinen Winter-Soldier-Anzug auch noch in Age of Ultron.

   Geschrieben wird an zwei Stellen, je nachdem, ob die Figur eine
   Fassungsliste hat: mit Liste als dritter Wert in FULLSIZE_LOOKS, ohne
   Liste in FULLSIZE_STANDARD. Wer nur in einem Titel vorkommt, braucht
   auch dort nichts, das rechnet die Charakterseite selbst aus. Welcher
   Fall gilt, entscheidet der Server; hier steht nur, was dazu
   angezeigt wird. */

/* Steht der Film in der Fassungsliste? Das ist der Fall, sobald die
   Figur mehr als ein Ganzkörperbild hat: Dann entsteht die Liste beim
   ersten Eingriff von selbst. */
const filmInListe = () => !!S.figur && fassungenVon(S.figur).length > 1;

/* Slug -> Titel, aus allen Filmen. Mehrstaffel-Serien haben pro Staffel
   eine Zeile, aber denselben Slug und dasselbe Logo. In der Wahl steht
   deshalb ein Eintrag, benannt nach dem gemeinsamen Teil des Titels:
   „Loki“ statt „Loki – Staffel 1“. */
function filmTitel() {
  const titel = new Map();
  for (const film of alleFilme || []) {
    const bisher = titel.get(film.slug);
    if (bisher === undefined) titel.set(film.slug, film.titel);
    else if (bisher !== film.titel) titel.set(film.slug, bisher.split(' – ')[0]);
  }
  return titel;
}

/* Die Filmwahl mit allem, was data.js führt: vorn die Auftritte der
   Figur, dahinter die übrigen Titel. Ein eingetragener Film, den data.js
   gar nicht kennt, bleibt trotzdem stehen – was von Hand da steht, soll
   nicht durch ein Aufklappen verschwinden. */
function fuelleFilmwahl(wahl, jetzt, ohneText) {
  const titel = filmTitel();
  wahl.textContent = '';
  const ohne = document.createElement('option');
  ohne.value = '';
  ohne.textContent = ohneText;
  wahl.append(ohne);

  const gesehen = new Set();
  const gruppe = (name, slugs) => {
    const liste = slugs.filter((slug) => slug && !gesehen.has(slug));
    if (!liste.length) return;
    const feld = document.createElement('optgroup');
    feld.label = name;
    for (const slug of liste) {
      gesehen.add(slug);
      const eintrag = document.createElement('option');
      eintrag.value = slug;
      eintrag.textContent = titel.get(slug) || slug;
      feld.append(eintrag);
    }
    wahl.append(feld);
  };
  gruppe('Auftritte der Figur', (S.figur && S.figur.filmSlugs) || []);
  gruppe('Weitere Titel', [...titel.keys()]);
  gruppe('Steht so in chars.js', [jetzt]);
  wahl.value = jetzt || '';
}

function zeigeFilmLogo(slug) {
  const feld = $('film-logo');
  const bild = feld.querySelector('img');
  feld.hidden = !slug;
  if (!slug) {
    bild.removeAttribute('src');
    return;
  }
  /* Zu manchen Titeln liegt kein Logo im Ordner. Dann bleibt der Platz
     leer, statt ein kaputtes Bild zu zeigen. */
  bild.onerror = () => { feld.hidden = true; };
  bild.src = `/datei/assets/logos/${slug}.webp`;
}

function frischeFilmwahl() {
  const feld = $('fassung-film');
  const zeigen = ganz() && !!S.ziel;
  feld.hidden = !zeigen;
  $('film-wahl').disabled = !zeigen;
  if (!zeigen) return;
  const ziel = S.ziel;
  holeFilme().then(() => {
    /* Bis die Filme da sind, kann längst eine andere Fassung offen sein. */
    if (S.ziel !== ziel || !ganz()) return;
    const titel = filmTitel();
    /* Ohne Fassungsliste rechnet die Charakterseite den Film des
       einzelnen Bildes selbst aus, sofern die Figur nur in einem Titel
       vorkommt. Dann steht er schon in der Wahl, ohne dass er
       irgendwo geschrieben stünde. */
    const auto = (!ziel.gepflegt && ziel.datei === S.figur.slug && S.figur.filmAuto) || '';
    fuelleFilmwahl($('film-wahl'), ziel.film,
      auto ? `Aus dem einzigen Titel: ${titel.get(auto) || auto}` : 'Ohne Film');
    $('film-wahl').disabled = false;
    zeigeFilmLogo(ziel.film || auto);
    $('film-hinweis').textContent = ziel.gepflegt ? 'steht in FULLSIZE_LOOKS'
      : (filmInListe() ? 'kommt in FULLSIZE_LOOKS'
        : (ziel.film ? 'steht in FULLSIZE_STANDARD' : ''));
  }, (fehler) => melde('Die Filme ließen sich nicht laden: ' + fehler.message, true));
}

async function filmSetzen(film) {
  const figur = S.figur;
  const ziel = S.ziel;
  if (!figur || !ziel || film === (ziel.film || '')) return;
  const titel = filmTitel().get(film) || film;
  await fassungAktion(
    { aktion: 'film', slug: figur.slug, datei: ziel.datei, film },
    ziel.datei,
    film ? `„${ziel.label}“ stammt jetzt aus ${titel}.`
      : `„${ziel.label}“ steht jetzt ohne Film.`);
}

/* ---------- Der Satz zu einer Fassung ----------

   Unter der Fassungstafel der Charakterseite steht ein Satz, der die
   gezeigte Fassung beschreibt: woher der Anzug stammt, wozu er gebaut
   wurde, in welchem Zustand die Figur darin steckt. Er gehört der
   Fassung und nicht der Figur, und auch die Figur mit ihrem einzigen
   Bild hat einen, denn ihre Standardansicht ist ebenso eine Fassung wie
   die zwanzigste Rüstung Tony Starks.

   Geschrieben wird er in FULLSIZE_NOTES (js/looks.js) unter dem Stamm
   der Fassung. Nur wo zu einer einzelnen Aufnahme schon etwas Eigenes
   steht, gilt deren Dateiname, denn die Bühne sieht zuerst dort nach. */

/* Unter welchem Namen der Satz dieser Fassung steht. */
function beschreibungSchluessel(ziel) {
  return ziel && ziel.beschreibungEigen ? ziel.datei : stammVon(ziel);
}

/* Ein Satz und keine Erzählung, hier wie auf dem Server: Umbrüche und
   doppelte Leerzeichen fallen weg, damit der Vergleich mit dem
   Geschriebenen nicht an einem Leerzeichen scheitert. */
const einSatz = (text) => String(text || '').replace(/\s+/g, ' ').trim();

function frischeBeschreibung() {
  const feld = $('fassung-beschreibung');
  const zeigen = ganz() && !!S.ziel;
  feld.hidden = !zeigen;
  if (!zeigen) return;
  const eingabe = $('beschreibung-feld');
  const schluessel = beschreibungSchluessel(S.ziel);
  /* Wer gerade tippt, soll nicht mitten im Satz überschrieben werden.
     Diese Funktion läuft nach jedem Eingriff an der Leiste mit, und die
     Leiste bleibt bedienbar, solange etwas unterwegs ist. Wechselt
     dabei die Fassung, gilt der neue Satz trotzdem. */
  if (eingabe.dataset.datei !== schluessel || document.activeElement !== eingabe) {
    eingabe.value = S.ziel.beschreibung || '';
  }
  eingabe.dataset.datei = schluessel;
  /* Wo der Satz landet. „steht bei dieser Aufnahme“ heißt: Diese eine
     Variante trägt einen eigenen, der den der Fassung übergeht. */
  $('beschreibung-hinweis').textContent = S.ziel.beschreibungEigen
    ? 'steht bei dieser Aufnahme'
    : (S.ziel.beschreibung ? 'steht in FULLSIZE_NOTES' : 'kommt in FULLSIZE_NOTES');
  frischeBeschreibungKnopf();
}

/* Der Knopf ist nur zu haben, solange sich der Text von dem
   unterscheidet, was geschrieben steht. Der Zähler daneben sagt, wie
   viel noch passt. */
function frischeBeschreibungKnopf() {
  const jetzt = einSatz($('beschreibung-feld').value);
  const vorher = einSatz(S.ziel && S.ziel.beschreibung);
  $('beschreibung-ok').disabled = !S.ziel || jetzt === vorher;
  $('beschreibung-zaehler').textContent = `${jetzt.length}/400`;
}

async function beschreibungSetzen() {
  const figur = S.figur;
  const ziel = S.ziel;
  if (!figur || !ziel) return;
  const text = einSatz($('beschreibung-feld').value);
  if (text === einSatz(ziel.beschreibung)) return;
  $('beschreibung-ok').disabled = true;
  try {
    const antwort = await json('/api/beschreibung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: figur.slug, datei: beschreibungSchluessel(ziel), text,
      }),
    });
    frischerVerlauf(antwort.verlauf);
    await frischeFigur(antwort.figur, ziel.datei, false);
    melde(text
      ? `„${ziel.label}“ hat ihren Satz, js/looks.js ist geschrieben.`
      : `Der Satz zu „${ziel.label}“ ist gelöscht.`);
  } catch (fehler) {
    melde('Nicht geschrieben: ' + fehler.message, true);
  } finally {
    frischeBeschreibung();
  }
}

/* Nach jeder Änderung an chars.js ist die Liste der Figuren nicht mehr
   aktuell. Sie neu zu holen ist einfacher und sicherer, als den Zustand
   im Browser nachzuziehen. */
async function neuLaden(slug, datei) {
  const daten = await json('/api/figuren');
  S.figuren = daten.figuren;
  S.welten = daten.welten || [];
  S.zaehler = daten.zaehler;
  S.wikiOffen = daten.wikiOffen || 0;
  S.begriffe = daten.begriffe || [];
  S.figur = null;
  /* Die Auswahl der Zielfigur in den Beziehungen führt alle Figuren. Kam
     eine dazu oder wechselte einen Schlüssel, muss sie neu gebaut
     werden. */
  baueBondWahl();
  zeigeZaehler(true);
  frischerVerlauf(daten.verlauf);
  baueListe();
  const figur = S.figuren.find((f) => f.slug === slug);
  if (!figur) return;
  waehleFigur(slug);
  const ziel = zieleVon(figur).find((z) => z.datei === datei);
  if (ziel && ziel !== S.ziel) waehleZiel(ziel);
}

/* ---------- Eine Figur nachziehen ----------

   Eine Fassung umzubenennen oder um einen Platz zu verschieben ändert
   genau eine Figur. Bis hierher holte die Oberfläche danach trotzdem alle
   vierhundert vom Server, warf ihre Liste weg, baute sie neu auf, schlug
   die Figur wieder auf, lud deren Vorlage frisch von der Platte und ließ
   beim Porträt sogar die Gesichtserkennung wieder anlaufen. Gemessen
   dauerte das über zwei Sekunden, in denen nichts anzuklicken war, und
   danach stand die Liste wieder ganz oben.

   Jetzt kommt die eine geänderte Figur mit der Antwort zurück und wird an
   ihrer Stelle eingesetzt. Die Bühne bleibt stehen: Bei einer Umbenennung
   sind es dieselben Pixel unter einem anderen Namen, und den zieht die
   Quelle einfach nach. */
async function frischeFigur(neu, datei, buehneNeu) {
  if (!neu) return;
  const stelle = S.figuren.findIndex((f) => f.slug === neu.slug);
  if (stelle === -1) return;
  const alt = S.figuren[stelle];
  /* Die Verweise auf die Knöpfe der Liste hängen an der alten Figur und
     gehören zum DOM, nicht zu den Daten. */
  neu._knopf = alt._knopf;
  neu._bild = alt._bild;
  neu._punkt = alt._punkt;
  S.figuren[stelle] = neu;
  frischeEintrag(neu);

  if (S.figur !== alt) return;
  S.figur = neu;
  /* Die offene Fassung wiederfinden: erst über den Dateinamen, den der
     Aufrufer nennt, sonst über den, der vorher offen war. */
  const ziele = zieleVon(neu);
  const gesucht = datei || (S.ziel && S.ziel.datei);
  const ziel = ziele.find((z) => z.datei === gesucht) || ziele[0] || null;
  const zielGewechselt = !ziel || !S.ziel || ziel.datei !== S.ziel.datei;

  /* Eine Fassung, die es eben noch nicht gab, und eine, die eben
     verschwunden ist, brauchen eine neue Vorlage auf der Bühne. Dafür
     gibt es den gewohnten Weg. */
  if (buehneNeu) {
    referenzVonHand = false;
    await waehleZiel(ziel);
    return;
  }

  S.ziel = ziel;
  if (ziel) {
    S.skala = ziel.skala || 1;
    S.korrektur = ziel.korrektur || 1;
    $('skala').value = String(S.skala);
    $('korrektur').value = String(S.korrektur);
    frischeSkalaFelder();
  }

  /* Eine umbenannte Fassung liegt unter neuem Namen auf der Platte. Die
     Bühne zeigt weiter dieselben Pixel, nur die Quelle heißt jetzt
     anders. Die Marke ist neu, denn was der Server beiseitegelegt hatte,
     gehörte zum alten Namen. */
  if (ganz() && ziel && S.quelle && S.quelle.typ === 'fullsize' && zielGewechselt) {
    S.quelle = { typ: 'fullsize', name: ziel.datei, marke: neueMarke() };
  }

  zeichneChips();
  frischeDaten();
  frischeSchleier();
}

/* Nur die eine Zeile in der Liste: Punkt, Bild, Zahl der Fassungen. */
function frischeEintrag(figur) {
  if (!figur._knopf) return;
  frischeListe(figur);
  const marke = figur._knopf.querySelector('.marke');
  const anzahl = fassungsZahl(figur);
  if (anzahl > 1) {
    if (marke) marke.textContent = anzahl + ' Fassungen';
    else {
      const neu = document.createElement('span');
      neu.className = 'marke';
      neu.textContent = anzahl + ' Fassungen';
      figur._knopf.insertBefore(neu, figur._punkt);
    }
  } else if (marke) marke.remove();
}

async function fassungAktion(auftrag, danach, meldung) {
  /* Die Leiste bleibt bedienbar. Gezeichnet wird nur, welcher Knopf
     gerade arbeitet: Wer eine Fassung umbenennt, will danach oft gleich
     ihre Stelle ändern, und dafür soll er nicht warten müssen. */
  const leiste = $('fassung-leiste');
  const eigener = [...leiste.children].find((b) => b.dataset.tat === auftrag.aktion)
    || [...leiste.children].find((b) => b.dataset.tat === auftrag.richtung);
  if (eigener) eigener.classList.add('laeuft');
  try {
    const antwort = await json('/api/fassung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auftrag),
    });
    S.zaehler = antwort.zaehler || S.zaehler;
    frischerVerlauf(antwort.verlauf);
    zeigeZaehler();
    /* Angelegt und gelöscht heißt: eine andere Fassung mit einer anderen
       Vorlage. Dasselbe gilt fürs Anlegen und Entfernen einer Variante
       und fürs Umhängen, denn dort wechselt unter der Bühne das Bild.
       Umbenennen, Verschieben, das Tauschen zweier Varianten und die
       Filmzuordnung lassen dieselben Pixel stehen, die Quelle zieht den
       neuen Namen einfach nach. */
    const andereDatei = ['neu', 'loeschen', 'variante-neu', 'variante-weg',
      'zu-variante', 'zu-fassung'].includes(auftrag.aktion);
    await frischeFigur(antwort.figur, danach || antwort.datei, andereDatei);
    const mit = (antwort.mitgewandert || []).length
      ? ' Mitgewandert: ' + antwort.mitgewandert.join(', ') + '.' : '';
    if (meldung) melde(meldung);
    else if (auftrag.aktion === 'variante-neu') {
      melde(`${antwort.datei}.webp wartet als Variante ${antwort.varianten} `
        + `auf ihr Bild.${mit}`);
    } else if (auftrag.aktion === 'variante-weg') {
      melde('Variante entfernt.'
        + (antwort.bildWeg ? ` Das Bild liegt in ${antwort.bildWeg}.` : '') + mit);
    } else if (auftrag.aktion === 'zu-variante') {
      melde(`Angehängt. ${antwort.datei}.webp ist jetzt Variante ${antwort.variante} `
        + `von ${antwort.varianten}.${mit}`);
    } else if (auftrag.aktion === 'zu-fassung') {
      melde(`${antwort.datei}.webp steht jetzt als eigene Fassung in der Liste.${mit}`);
    } else if (auftrag.aktion === 'variante-hoch' || auftrag.aktion === 'variante-runter') {
      melde(`Getauscht. Das Bild ist jetzt Variante ${antwort.variante} `
        + `von ${antwort.varianten}.${mit}`);
    } else if (antwort.bildWeg) melde(`Fassung entfernt. Das Bild liegt in ${antwort.bildWeg}.`);
    else if (antwort.umbenannt) {
      const u = antwort.umbenannt;
      melde(`${u.alt}.webp heißt jetzt ${u.neu}.webp.`
        + (u.mitgewandert.length ? ' Mitgewandert: ' + u.mitgewandert.join(', ') + '.' : ''));
    } else melde('Fassung übernommen, js/chars.js ist geschrieben.');
  } catch (fehler) {
    melde('Nicht geändert: ' + fehler.message, true);
  } finally {
    if (eigener) eigener.classList.remove('laeuft');
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
  /* Beim Anhängen entsteht kein Name aus einer Beschriftung: Die Bilder
     heißen danach nach der Zielfassung und zählen hinter deren eigenen
     weiter. Welche das sind, hängt an der Wahl darüber und ändert sich
     mit ihr. */
  if (dialogKontext.anhaengen) {
    const nach = $('fassung-zielwahl').value;
    const dort = dialogKontext.anhaengen[nach] || 1;
    const namen = [];
    for (let i = 0; i < dialogKontext.meine; i += 1) namen.push(nach + '-' + (dort + i + 1));
    hinweis.innerHTML = 'Heißt danach: '
      + namen.map((name) => `<code>${name}.webp</code>`).join(', ')
      + (dort < 2 ? `, und <code>${nach}.webp</code> heißt <code>${nach}-1.webp</code>` : '');
    hinweis.hidden = false;
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

function frageFassung({ titel, text, label, ohneLabel, mitFilm, film, knopf, kontext,
  ziele, gefahr }) {
  const dialog = $('fassung-dialog');
  $('fassung-titel').textContent = titel;
  $('fassung-text').textContent = text;
  $('fassung-label').value = label || '';
  $('fassung-label').closest('label').hidden = !!ohneLabel;
  /* An welche Fassung angehängt wird. Die Wahl steht nur beim Umhängen
     da, und der Hinweis darunter rechnet mit ihr. */
  $('fassung-zielfeld').hidden = !ziele;
  if (ziele) {
    const wahl = $('fassung-zielwahl');
    wahl.textContent = '';
    for (const eintrag of ziele) {
      const stelle = document.createElement('option');
      stelle.value = eintrag.wert;
      stelle.textContent = eintrag.text;
      wahl.append(stelle);
    }
  }
  /* Der Film wird nur beim Anlegen gefragt. Beim Umbenennen bleibt er,
     wo er war, und beim Löschen gibt es nichts zu wählen. */
  $('fassung-filmfeld').hidden = !mitFilm;
  if (mitFilm) fuelleFilmwahl($('fassung-filmwahl'), film || '', 'Ohne Film');
  /* Ohne Beschriftungsfeld ist es meist die Rückfrage vor dem Löschen,
     und dann trägt der Knopf auch dessen Zeichen. Beim Umhängen geht
     nichts verloren, dort steht die Gefahr ausdrücklich auf nein. */
  const rot = gefahr === undefined ? !!ohneLabel : !!gefahr;
  symbole.setze($('fassung-ok'), rot ? 'loeschen' : 'uebernehmen');
  symbole.beschrifte($('fassung-ok'), knopf);
  $('fassung-ok').classList.toggle('gefahr', rot);
  $('fassung-fehler').hidden = true;
  dialogKontext = kontext || null;
  zeigeDateinamen();
  dialog.showModal();
  const zuerst = ziele ? $('fassung-zielwahl')
    : $(ohneLabel ? 'fassung-ok' : 'fassung-label');
  zuerst.focus();
  if (!ohneLabel) $('fassung-label').select();
  return new Promise((fertig) => {
    dialog.addEventListener('close', () => {
      dialogKontext = null;
      fertig(dialog.returnValue === 'ok'
        ? {
          label: $('fassung-label').value.trim(),
          film: $('fassung-filmwahl').value,
          ziel: $('fassung-zielwahl').value,
        }
        : null);
    }, { once: true });
  });
}

async function fassungKlick(tat) {
  const figur = S.figur;
  const ziel = S.ziel;
  if (!figur) return;

  if (tat === 'neu') {
    /* Die Filmwahl im Dialog braucht die Titel. Sie stehen nach dem
       ersten Abruf im Speicher, danach kostet das nichts mehr. */
    try {
      await holeFilme();
    } catch (fehler) {
      melde('Die Filme ließen sich nicht laden: ' + fehler.message, true);
      return;
    }
    const antwort = await frageFassung({
      titel: 'Neue Fassung',
      text: `Eine weitere Ansicht für ${figur.name}. Sie erscheint sofort in der `
        + 'Liste und wartet auf ihr Bild. Der Dateiname entsteht aus der Beschriftung, '
        + 'der Film sagt, aus welchem Auftritt die Fassung stammt.',
      knopf: 'Anlegen',
      mitFilm: true,
      film: (ziel && ziel.film) || '',
      kontext: {
        slug: figur.slug,
        belegt: new Set(fassungenVon(figur).map(stammVon).concat(figur.slug)),
      },
    });
    if (!antwort || !antwort.label) return;
    await fassungAktion({
      aktion: 'neu',
      slug: figur.slug,
      label: antwort.label,
      film: antwort.film,
      standardLabel: (figur.ganzkoerper[0] && figur.ganzkoerper[0].label) || 'Standard',
    });
    return;
  }

  if (!ziel) return;

  if (tat === 'umbenennen') {
    const antwort = await frageFassung({
      titel: 'Fassung umbenennen',
      text: `So heißt ${stammVon(ziel)}.webp in der Fassungsleiste der Charakterseite. `
        + (fassungenVon(figur).length < 2
          ? `Bisher steht dort ${figur.ueberschrift || figur.name}, denn die Figur hat `
            + 'nur dieses eine Bild. '
            + 'Mit der Beschriftung bekommt sie ihre eigene Fassungsliste. ' : '')
        + 'Der Dateiname folgt der Beschriftung und wird mit umbenannt.'
        + (ziel.varianten > 1
          ? ` Die ${ziel.varianten} Varianten wandern alle mit.` : ''),
      label: ziel.label,
      knopf: 'Übernehmen',
      kontext: {
        slug: figur.slug,
        belegt: new Set(fassungenVon(figur)
          .filter((z) => stammVon(z) !== stammVon(ziel)).map(stammVon)),
      },
    });
    if (!antwort || !antwort.label || antwort.label === ziel.label) return;
    await fassungAktion({
      aktion: 'umbenennen', slug: figur.slug, datei: stammVon(ziel), label: antwort.label,
    });
    return;
  }

  /* Standard ist der erste Eintrag. „Zum Standard“ schiebt die Fassung
     also nur nach vorn, es wandert keine Datei. */
  if (tat === 'standard') {
    await fassungAktion({ aktion: 'standard', slug: figur.slug, datei: stammVon(ziel) },
      ziel.datei);
    return;
  }

  if (tat === 'hoch' || tat === 'runter') {
    await fassungAktion({
      aktion: 'verschieben', slug: figur.slug, datei: stammVon(ziel), richtung: tat,
    }, ziel.datei);
    return;
  }

  if (tat === 'loeschen') {
    const bilder = variantenVon(figur, stammVon(ziel)).filter((z) => z.zustand !== 'fehlt');
    const antwort = await frageFassung({
      titel: 'Fassung löschen',
      text: `„${ziel.label}“ aus der Fassungsliste von ${figur.name} entfernen.`
        + (!bilder.length ? ' Ein Bild gibt es dazu noch nicht.'
          : ` ${bilder.map((z) => z.datei + '.webp').join(', ')} wandert dabei in die `
            + 'Sicherung und steht danach nicht mehr auf der Charakterseite.'),
      ohneLabel: true,
      knopf: 'Löschen',
    });
    if (!antwort) return;
    await fassungAktion({
      aktion: 'loeschen', slug: figur.slug, datei: stammVon(ziel),
    }, figur.slug);
    return;
  }

  /* ---------- Varianten ----------

     Eine zweite Aufnahme derselben Fassung. Sie bekommt keinen eigenen
     Eintrag in der Fassungsliste, sondern nur eine Nummer: Aus
     <Fassung>.webp wird <Fassung>-1.webp, die neue heißt <Fassung>-2.webp
     und wartet auf ihr Bild. Auf der Charakterseite steht sie danach als
     Schalter oben an der Profilleiste. */
  if (tat === 'variante-neu') {
    const stamm = stammVon(ziel);
    const jetzt = ziel.varianten || 1;
    const antwort = await frageFassung({
      titel: 'Variante anlegen',
      text: jetzt < 2
        ? `Ein zweites Bild für „${ziel.label}“. ${stamm}.webp heißt danach `
          + `${stamm}-1.webp, die neue Variante ${stamm}-2.webp und wartet auf ihr Bild. `
          + 'Auf der Charakterseite stehen sie als Schalter 1 und 2 an der Profilleiste.'
        : `Ein weiteres Bild für „${ziel.label}“. Es heißt ${stamm}-${jetzt + 1}.webp `
          + 'und wartet auf seine Vorlage.',
      ohneLabel: true,
      knopf: 'Anlegen',
    });
    if (!antwort) return;
    await fassungAktion({ aktion: 'variante-neu', slug: figur.slug, datei: ziel.datei },
      null, null);
    return;
  }

  if (tat === 'variante-weg') {
    const jetzt = ziel.varianten || 1;
    const antwort = await frageFassung({
      titel: 'Variante entfernen',
      text: `Variante ${ziel.variante} von „${ziel.label}“.`
        + (ziel.zustand === 'fehlt' ? ' Ein Bild gibt es dazu noch nicht.'
          : ` ${ziel.datei}.webp wandert dabei in die Sicherung.`)
        + (jetzt > 2
          ? ' Die Varianten dahinter rücken eine Nummer nach vorn.'
          : ` Übrig bleibt ein einziges Bild, es heißt danach wieder `
            + `${stammVon(ziel)}.webp.`),
      ohneLabel: true,
      knopf: 'Entfernen',
    });
    if (!antwort) return;
    await fassungAktion({ aktion: 'variante-weg', slug: figur.slug, datei: ziel.datei },
      null, null);
    return;
  }

  /* Die Reihenfolge der Varianten steckt allein in ihren Nummern. Wer
     verschoben wird, tauscht mit seinem Nachbarn den Dateinamen, und auf
     der Charakterseite tauschen damit die Ziffern an der Profilleiste
     ihre Bilder. Variante 1 ist die, die dort zuerst steht. */
  if (tat === 'variante-hoch' || tat === 'variante-runter') {
    await fassungAktion({ aktion: tat, slug: figur.slug, datei: ziel.datei });
    return;
  }

  /* ---------- Umhängen ----------

     Was als eigene Fassung angelegt wurde, ist manchmal doch nur eine
     zweite Aufnahme derselben, und was als Variante mitläuft, manchmal
     doch ein eigener Anzug. Beides lässt sich nachträglich umhängen,
     ohne ein Bild neu zu schneiden: Es wandern die Dateinamen und mit
     ihnen Körpergröße, Bildkorrektur, Schwebe, Offen-Markierung und
     Quellenangabe. */
  if (tat === 'zu-variante') {
    const andere = fassungenVon(figur).filter((z) => stammVon(z) !== stammVon(ziel));
    if (!andere.length) return;
    const meine = variantenVon(figur, stammVon(ziel)).length;
    const antwort = await frageFassung({
      titel: 'Zur Variante machen',
      text: `„${ziel.label}“ hängt danach als Variante hinter einer anderen Fassung. `
        + 'Auf der Charakterseite steht dafür keine eigene Tafel mehr, sondern eine '
        + 'Ziffer an der Profilleiste, und Beschriftung und Film der Zielfassung gelten '
        + 'dann für alle ihre Bilder.'
        + (meine > 1 ? ` Alle ${meine} Bilder wandern mit.` : ''),
      ohneLabel: true,
      gefahr: false,
      knopf: 'Anhängen',
      ziele: andere.map((z) => ({
        wert: stammVon(z),
        text: z.label + (z.varianten > 1 ? ` (${z.varianten} Bilder)` : ''),
      })),
      kontext: {
        meine,
        anhaengen: Object.fromEntries(andere.map((z) => [stammVon(z), z.varianten || 1])),
      },
    });
    if (!antwort) return;
    await fassungAktion({
      aktion: 'zu-variante', slug: figur.slug, datei: stammVon(ziel), ziel: antwort.ziel,
    });
    return;
  }

  if (tat === 'zu-fassung') {
    /* Die Filmwahl im Dialog braucht die Titel, genau wie beim Anlegen. */
    try {
      await holeFilme();
    } catch (fehler) {
      melde('Die Filme ließen sich nicht laden: ' + fehler.message, true);
      return;
    }
    const jetzt = ziel.varianten || 1;
    const antwort = await frageFassung({
      titel: 'Zur Fassung machen',
      text: `Variante ${ziel.variante} von „${ziel.label}“ bekommt eine eigene Tafel, `
        + 'gleich hinter der Fassung, aus der sie kommt. Die Beschriftung sagt, was sie '
        + `von ihr unterscheidet, und ${ziel.datei}.webp wird nach ihr umbenannt. `
        + (jetzt > 2
          ? 'Die Varianten dahinter rücken eine Nummer nach vorn.'
          : `Drüben bleibt ein einziges Bild übrig, es heißt danach wieder `
            + `${stammVon(ziel)}.webp.`),
      knopf: 'Lösen',
      mitFilm: true,
      film: ziel.film || '',
      kontext: {
        slug: figur.slug,
        belegt: new Set(fassungenVon(figur).map(stammVon).concat(figur.slug)),
      },
    });
    if (!antwort || !antwort.label) return;
    await fassungAktion({
      aktion: 'zu-fassung', slug: figur.slug, datei: ziel.datei,
      label: antwort.label, film: antwort.film,
    });
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
   js/chars.js auf, und zwar am letzten Slash: „Marc Spector / Steven
   Grant / Moon Knight“ sind zwei bürgerliche Namen und ein Heldenname.
   Deshalb wird hier ebenso am letzten getrennt, der Anfang bleibt am
   Stück im Realnamen, und beim Zusammensetzen kommt wieder genau
   dasselbe heraus. */
function zerlegeNamen(name) {
  const { rest, welt } = loeseWelt(name);
  const schnitt = rest.lastIndexOf(' / ');
  return schnitt === -1
    ? { real: rest, alias: '', welt }
    : { real: rest.slice(0, schnitt), alias: rest.slice(schnitt + 3), welt };
}

function setzeNamenZusammen(real, alias, welt) {
  const links = real.trim().replace(/\s+/g, ' ');
  const rechts = alias.trim().replace(/\s+/g, ' ');
  const name = rechts ? `${links} / ${rechts}` : links;
  const wo = (welt || '').trim();
  return wo ? `${name} (${wo})` : name;
}

/* ---------- Die Welt am Ende des Namens ----------

   Aus welcher Wirklichkeit eine Figur stammt, hängt in data.js als
   Klammer am Namen: „Christine Palmer (Erde-838)“. Nicht jede Klammer
   ist eine Welt, „Gamora (2014)“ nennt eine Zeit und „Peter Parker /
   Spider-Man (Maguire)“ eine Besetzung. Welche zählt, steht in
   CHAR_WORLDS (js/chars.js), und die Liste kommt mit den Figuren vom
   Server. Genau daran teilt auch splitName() dort auf.

   Damit ist die Welt im Studio ein eigenes Feld und klebt nicht am
   Realnamen: Wer sie wechselt, ändert nur die Klammer. */
function loeseWelt(name) {
  const klammer = name.match(/ \(([^()]+)\)$/);
  return klammer && S.welten.includes(klammer[1])
    ? { rest: name.slice(0, -klammer[0].length), welt: klammer[1] }
    : { rest: name, welt: '' };
}

/* Die Auswahl einer Welt: leer, dann alles Bekannte. Eine Welt, die die
   Liste nicht kennt, bliebe sonst beim Öffnen des Dialogs unter den
   Tisch fallen und ginge beim nächsten Übernehmen verloren. */
function fuelleWeltwahl(wahl, jetzt) {
  wahl.textContent = '';
  const ohne = document.createElement('option');
  ohne.value = '';
  ohne.textContent = 'Ohne Welt';
  wahl.append(ohne);
  const alle = S.welten.includes(jetzt) || !jetzt ? S.welten : [jetzt, ...S.welten];
  for (const welt of alle) {
    const eintrag = document.createElement('option');
    eintrag.value = welt;
    eintrag.textContent = welt;
    wahl.append(eintrag);
  }
  wahl.value = jetzt || '';
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
    /* Die Welt ist eine Auswahl und kein Feld: Getippt wäre sie ein
       zweites Mal geschrieben, und ein Tippfehler machte aus der Klammer
       wieder einen Teil des Namens. */
    const welt = document.createElement('select');
    welt.className = 'weltwahl';
    welt.title = 'Aus welcher Wirklichkeit diese Fassung stammt';
    fuelleWeltwahl(welt, teile.welt);
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'knopf';
    knopf.textContent = 'Übernehmen';
    symbole.setze(knopf, 'uebernehmen');
    knopf.disabled = true;
    const pruefe = () => {
      const neu = setzeNamenZusammen(real.value, alias.value, welt.value);
      knopf.disabled = !real.value.trim() || neu === name;
    };
    real.addEventListener('input', pruefe);
    alias.addEventListener('input', pruefe);
    welt.addEventListener('change', pruefe);
    knopf.addEventListener('click', () => nameSpeichern(figur.slug, name,
      setzeNamenZusammen(real.value, alias.value, welt.value), i));
    zeile.append(real, trenner, alias, welt, knopf);
    liste.append(zeile);
  });

  /* Der Alias steht je Name in CHAR_ALIAS. Das Studio hält sie für eine
     Figur gleich, sonst zerfiele sie in zwei Schlüssel. Gezeigt wird
     deshalb einer. */
  aliasStand = figur.alias.find((a) => a) || '';
  $('figur-alias').value = aliasStand;
  $('welt-neu').value = '';
  frischeWelten();
  frischeSchluessel();
  $('loeschen-text').textContent = `${figur.ueberschrift || figur.name} verliert dabei `
    + loeschumfang(figur).join(', ') + '. Rückgängig holt alles zurück.';
  $('figur-dialog').showModal();
}

/* Was die Auswahl gerade kennt, und was die Eingabe daneben damit
   anfangen kann. Zweimal dieselbe Welt anzulegen bringt nichts,
   gestrichen wird nur, was es gibt: Jeder Knopf ist deshalb genau dann
   an, wenn er etwas zu tun hat. */
function frischeWelten() {
  const feld = $('welt-bekannt');
  const eingabe = $('welt-neu').value.trim();
  /* Die Reihe wird neu gebaut, steht danach aber wieder an derselben
     Stelle: Ein Klick auf eine weit rechts liegende Welt risse sie sonst
     an den Anfang zurück, und der Getroffene wäre aus dem Bild. */
  const stand = feld.scrollLeft;
  feld.textContent = '';
  let gewaehlt = null;
  for (const welt of S.welten) {
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = welt === eingabe ? 'an' : '';
    knopf.textContent = welt;
    knopf.title = 'In das Feld darüber setzen';
    knopf.addEventListener('click', () => {
      $('welt-neu').value = welt;
      frischeWelten();
      $('welt-neu').focus();
    });
    if (welt === eingabe) gewaehlt = knopf;
    feld.append(knopf);
  }
  feld.scrollLeft = stand;
  /* Was im Feld steht, soll auch zu sehen sein. Getippt wandert die
     Auswahl durch die ganze Reihe, und 'nearest' rückt nur dann etwas,
     wenn die Welt wirklich draußen liegt. */
  if (gewaehlt) gewaehlt.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  weltRollstand();
  $('welt-hinzu').disabled = !eingabe || S.welten.includes(eingabe);
  $('welt-weg').disabled = !S.welten.includes(eingabe);
}

/* Die beiden Pfeile neben der Reihe. Sie stehen nur da, solange die Reihe
   überhaupt breiter ist als ihr Platz, und der einzelne ist nur zu haben,
   solange an seiner Seite noch etwas liegt. Gemessen wird in Pixeln, und
   die kommen bei gerollten Kästen gebrochen heraus: Der Rest von einem
   Pixel ist kein Rollweg mehr. */
function weltRollstand() {
  const feld = $('welt-bekannt');
  const rest = feld.scrollWidth - feld.clientWidth;
  const rollbar = rest > 1;
  const links = $('welt-links');
  const rechts = $('welt-rechts');
  links.hidden = rechts.hidden = !rollbar;
  links.disabled = feld.scrollLeft <= 1;
  rechts.disabled = feld.scrollLeft >= rest - 1;
}

/* Ein Druck rollt vier Fünftel der sichtbaren Breite weiter. Ganze
   Breiten sind zu viel: Am Rand stünde dann nichts mehr, woran sich das
   Auge festhält. */
function weltRollen(richtung) {
  const feld = $('welt-bekannt');
  feld.scrollBy({ left: richtung * feld.clientWidth * 0.8, behavior: 'smooth' });
}

/* Eine neue Welt kommt in CHAR_WORLDS (js/chars.js) und steht danach in
   jeder Auswahl. Am Namen der Figur ändert das noch nichts: Sie wird
   danach in ihrer Zeile gewählt und übernommen. */
async function weltAnlegen() {
  const name = $('welt-neu').value.trim();
  if (!name) return;
  try {
    const antwort = await json('/api/welt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    S.welten = antwort.welten || S.welten;
    frischerVerlauf(antwort.verlauf);
    /* Jede offene Auswahl bekommt die neue Welt, ohne ihre eigene Wahl
       zu verlieren. */
    for (const wahl of document.querySelectorAll('.weltwahl')) {
      fuelleWeltwahl(wahl, wahl.value);
    }
    $('welt-neu').value = '';
    frischeWelten();
    melde(`Welt „${antwort.welt}“ steht jetzt zur Wahl.`);
  } catch (fehler) {
    melde('Welt nicht angelegt: ' + fehler.message, true);
  }
}

/* Eine Welt wieder aus CHAR_WORLDS nehmen.

   Der Server lässt das nur zu, solange kein Name sie mehr trägt: Die
   Liste entscheidet, ob eine Klammer am Ende eines Namens eine
   Wirklichkeit meint oder eine Variante, und eine gestrichene Welt
   machte aus der einen die andere. Trägt sie noch jemand, sagt der
   Fehler, wer. */
async function weltStreichen() {
  const name = $('welt-neu').value.trim();
  if (!name || !S.welten.includes(name)) return;
  if (!confirm(`„${name}“ aus der Weltenliste streichen?`)) return;
  try {
    const antwort = await json('/api/welt/loeschen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    S.welten = antwort.welten || S.welten;
    frischerVerlauf(antwort.verlauf);
    for (const wahl of document.querySelectorAll('.weltwahl')) {
      fuelleWeltwahl(wahl, wahl.value);
    }
    $('welt-neu').value = '';
    frischeWelten();
    melde(`Welt „${antwort.welt}“ steht nicht mehr zur Wahl.`);
  } catch (fehler) {
    melde('Welt nicht gestrichen: ' + fehler.message, true);
  }
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

/* Was das Löschen dieser Figur mitnimmt, in Worten. Es steht schon im
   Dialog, bevor jemand den Knopf drückt: Wer erst in der Rückfrage
   erfährt, dass acht Bilder und eine Biografie daranhängen, hat den
   Schritt bereits halb getan. */
function loeschumfang(figur) {
  /* Gezählt wird alles, was dasteht: Fremde Bilder stehen gar nicht
     erst in der Liste. Der Server führt jeder Figur nur ihre eigenen
     Dateien zu (eigeneDateien() in server.js), und „gamora-2014“ gehört
     nicht zu „gamora“, bleibt beim Löschen liegen und zählt hier auch
     nicht mit. */
  const bilder = zieleVon(figur).filter((z) => z.zustand !== 'fehlt').length
    + figur.ganzkoerper.filter((z) => z.zustand !== 'fehlt').length;
  const raus = [
    `${figur.auftritte} Auftritt${figur.auftritte === 1 ? '' : 'e'} in js/data.js`,
  ];
  if (bilder) raus.push(`${bilder} Bilddatei${bilder === 1 ? '' : 'en'}`);
  const t = figur.texte || {};
  const texte = [];
  if (t.abschnitte) texte.push(`Biografie mit ${t.abschnitte} Abschnitten`);
  if (t.kurz) texte.push('Kurzbiografie');
  if (t.felder) texte.push('Steckbrief');
  if (t.bonds) texte.push(`${t.bonds} Beziehungen`);
  if (t.besetzung) texte.push('Besetzung');
  if (texte.length) raus.push(texte.join(', '));
  raus.push('Schlüssel, Alias und Fassungen in js/chars.js');
  return raus;
}

/* Die Figur, die nach dem Löschen an ihrer Stelle steht. Ohne sie bliebe
   die Bühne auf einer Figur stehen, die es nicht mehr gibt. */
function nachbarVon(slug) {
  const i = S.figuren.findIndex((f) => f.slug === slug);
  if (i === -1) return null;
  const nachbar = S.figuren[i + 1] || S.figuren[i - 1];
  return nachbar ? nachbar.slug : null;
}

async function figurLoeschen() {
  const figur = S.figur;
  if (!figur) return;
  $('weg-text').textContent = `„${figur.ueberschrift || figur.name}“ verschwindet `
    + 'aus der Datenbank und damit von der Charakterseite, aus der Timeline und '
    + 'aus der Galaxie. Das geht mit:';
  const liste = $('weg-liste');
  liste.textContent = '';
  for (const zeile of loeschumfang(figur)) {
    const li = document.createElement('li');
    li.textContent = zeile;
    liste.append(li);
  }
  const dialog = $('weg-dialog');
  dialog.showModal();
  $('weg-ok').focus();
  const ja = await new Promise((fertig) => {
    dialog.addEventListener('close', () => fertig(dialog.returnValue === 'ok'), { once: true });
  });
  if (!ja) return;

  const nachbar = nachbarVon(figur.slug);
  const knopf = $('figur-loeschen');
  knopf.disabled = true;
  try {
    const antwort = await json('/api/figur/loeschen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: figur.slug }),
    });
    $('figur-dialog').close();
    S.zaehler = antwort.zaehler;
    pruefeStand(antwort.stand);
    await neuLaden(nachbar, null);
    melde(`${antwort.name} gelöscht: ${antwort.auftritte} Auftritte, `
      + `${antwort.bilder.length} Bilder, ${antwort.dateien.length} Dateien geändert.`
      + (antwort.beziehungen
        ? ` ${antwort.beziehungen} Beziehung${antwort.beziehungen === 1 ? '' : 'en'} `
          + 'anderer Figuren zeigten auf sie und sind mit weg.' : ''));
  } catch (fehler) {
    melde('Figur nicht gelöscht: ' + fehler.message, true);
  } finally {
    knopf.disabled = false;
  }
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
  const name = setzeNamenZusammen($('neu-name').value, $('neu-held').value,
    $('neu-welt').value);
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
  fuelleWeltwahl($('neu-welt'), '');
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
  const name = setzeNamenZusammen($('neu-name').value, $('neu-held').value,
    $('neu-welt').value);
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

/* Die Vorlage als eine Zeichenkette, denn so liegt sie im Journal. Der
   Name allein reichte nicht: Porträt und Ganzkörperbild heißen gleich. */
function quelleSchluessel(quelle) {
  if (!quelle) return null;
  if (quelle.typ === 'upload') return 'upload:' + quelle.id;
  if (quelle.typ === 'portrait') return 'portrait:' + quelle.name;
  return quelle.name;
}

function quelleAusSchluessel(schluessel) {
  if (!schluessel || schluessel.startsWith('upload:')) return null;
  return schluessel.startsWith('portrait:')
    ? { typ: 'portrait', name: schluessel.slice('portrait:'.length) }
    : { typ: 'fullsize', name: schluessel };
}

function kontextJetzt() {
  return {
    bereich: S.bereich,
    slug: S.figur && S.figur.slug,
    ziel: S.ziel && S.ziel.datei,
    quelle: quelleSchluessel(S.quelle),
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

/* Was ein Bühnenschritt festhält: der Ausschnitt und die Ausrichtung der
   Vorlage. Beide zusammen, denn ein Ausschnitt ohne seinen Winkel meint
   in einer anders gedrehten Fläche etwas anderes. Die Schwebe steht
   nicht dabei: Sie wird aus beidem gemessen und kommt mit ihnen von
   selbst zurück. */
const SCHRITT_WERTE = ['x', 'y', 'breite', 'hoehe', 'viertel', 'fein'];

function zustandJetzt() {
  if (!S.rect) return null;
  return { ...S.rect, viertel: S.viertel, fein: S.fein };
}

/* Einen Bühnenschritt festhalten, wenn sich etwas davon bewegt hat. */
function merkeAusschnitt(titel, vorher) {
  if (!vorher || !S.rect) return;
  const nachher = zustandJetzt();
  const gleich = SCHRITT_WERTE.every((k) => Math.abs(vorher[k] - nachher[k]) < 0.01);
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
  if (!stapel) stapel = { vorher: zustandJetzt(), titel, uhr: 0 };
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
  const quelle = quelleAusSchluessel(k.quelle);
  if (quelle && quelleSchluessel(S.quelle) !== k.quelle) await waehleQuelle(quelle);
}

async function buehnenSchritt(schritt, richtung) {
  await stelleKontextHer(schritt.kontext);
  if (!S.vorlage) throw new Error('Die Vorlage ist nicht mehr da.');
  const z = richtung === 'zurueck' ? schritt.vorher : schritt.nachher;
  S.rect = { x: z.x, y: z.y, breite: z.breite, hoehe: z.hoehe };
  /* Die Ausrichtung gehört zum Schritt: Der Ausschnitt daneben ist in der
     Fläche gemessen, die dieser Winkel aufspannt. */
  if (z.viertel !== S.viertel || z.fein !== S.fein) {
    S.viertel = z.viertel;
    S.fein = z.fein;
    baueDrehung();
    messeKasten();
  }
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

/* ---------- Sicherung ----------

   Der Blick in .sicherung, den Ordner mit den Kopien, die der Server vor
   jedem Eingriff anlegt. Er ist die Rückfallebene unter dem Verlauf: Der
   gilt nur für die laufende Sitzung, die Sicherung überlebt den Neustart.

   Drei Dinge kann man hier tun. Eine Fassung zurückholen, dann schreibt
   der Server sie an ihren Platz und legt vorher die aktuelle weg. Einzelne
   Fassungen löschen. Und aufräumen, entweder die älteren je Datei oder
   den ganzen Ordner.

   Die Liste kommt bei jedem Öffnen frisch vom Server. Sie im Browser zu
   halten lohnte nicht: Jedes Speichern legt eine neue Kopie dort ab, ein
   gemerkter Stand wäre nach der nächsten Figur schon falsch. */

const sicherung = { eintraege: [], art: 'alle', gewaehlt: new Set(), laeuft: false };

const ARTNAME = { portrait: 'Porträt', ganzkoerper: 'Ganzkörper', quelle: 'Daten' };

function alsMasse(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  return Math.round(bytes / 1024) + ' kB';
}

/* Tag und Uhrzeit, ohne Jahr: Was hier liegt, ist Tage alt und nicht
   Jahre, und die Spalte bleibt schmal. */
function alsZeitpunkt(ms) {
  const d = new Date(ms);
  const zwei = (n) => String(n).padStart(2, '0');
  return `${zwei(d.getDate())}.${zwei(d.getMonth() + 1)}., ${zwei(d.getHours())}:${zwei(d.getMinutes())}`;
}

function sicherungGefiltert() {
  return sicherung.art === 'alle'
    ? sicherung.eintraege
    : sicherung.eintraege.filter((e) => e.art === sicherung.art);
}

async function oeffneSicherung() {
  $('sicherung-warnung').hidden = true;
  sicherung.gewaehlt.clear();
  $('sicherung-liste').textContent = '';
  $('sicherung-summe').textContent = 'lädt …';
  $('sicherung-dialog').showModal();
  await holeSicherung();
}

async function holeSicherung() {
  try {
    const daten = await json('/api/sicherung');
    setzeSicherung(daten);
  } catch (fehler) {
    $('sicherung-summe').textContent = '';
    zeigeSicherungsfehler(fehler.message);
  }
}

function setzeSicherung(daten) {
  sicherung.eintraege = daten.eintraege || [];
  /* Was inzwischen weg ist, kann auch nicht mehr ausgewählt sein. */
  const da = new Set(sicherung.eintraege.map((e) => e.name));
  for (const name of [...sicherung.gewaehlt]) if (!da.has(name)) sicherung.gewaehlt.delete(name);
  maleSicherung();

  /* Die Summe zählt, was gerade in der Liste steht, und nicht den ganzen
     Ordner: Sonst stünde neben „53 von 286“ eine Größe, die zu keiner der
     beiden Zahlen gehört. */
  const summe = $('sicherung-summe');
  const gezeigt = sicherungGefiltert();
  const gesamt = sicherung.eintraege.length;
  summe.textContent = '';
  if (!gesamt) {
    summe.textContent = 'leer';
    return;
  }
  const zahl = document.createElement('b');
  zahl.textContent = gezeigt.length === gesamt ? String(gesamt) : `${gezeigt.length} von ${gesamt}`;
  const bytes = gezeigt.reduce((s, e) => s + e.bytes, 0);
  summe.append(zahl, ` ${gezeigt.length === 1 ? 'Fassung' : 'Fassungen'} · ${alsMasse(bytes)}`);
}

function zeigeSicherungsfehler(text) {
  const warnung = $('sicherung-warnung');
  warnung.textContent = text || '';
  warnung.hidden = !text;
}

function maleSicherung() {
  const feld = $('sicherung-liste');
  feld.textContent = '';
  const liste = sicherungGefiltert();

  if (!liste.length) {
    const leer = document.createElement('p');
    leer.className = 'sicherung-leer';
    leer.textContent = sicherung.eintraege.length
      ? 'In diesem Fach liegt nichts.'
      : 'Der Sicherungsordner ist leer. Er füllt sich beim nächsten Speichern von allein.';
    feld.append(leer);
    frischeSicherungsknoepfe();
    return;
  }

  for (const eintrag of liste) {
    const zeile = document.createElement('div');
    zeile.className = 'sicherung-zeile';
    zeile.dataset.name = eintrag.name;
    zeile.classList.toggle('gewaehlt', sicherung.gewaehlt.has(eintrag.name));

    const haken = document.createElement('input');
    haken.type = 'checkbox';
    haken.checked = sicherung.gewaehlt.has(eintrag.name);
    haken.title = 'Für das Löschen auswählen';
    haken.addEventListener('change', () => {
      if (haken.checked) sicherung.gewaehlt.add(eintrag.name);
      else sicherung.gewaehlt.delete(eintrag.name);
      zeile.classList.toggle('gewaehlt', haken.checked);
      frischeSicherungsknoepfe();
    });

    /* Bilder zeigen sich selbst, Quelldateien ihre Endung. Ein Vorschau-
       bild für chars.js gäbe es nicht, und ein leeres Kästchen an seiner
       Stelle ließe die Zeile kaputt aussehen. */
    let marke;
    if (eintrag.art === 'quelle') {
      marke = document.createElement('span');
      marke.className = 'sicherung-kuerzel';
      marke.textContent = (eintrag.datei.split('.').pop() || '?').toUpperCase();
    } else {
      marke = document.createElement('img');
      marke.className = 'sicherung-bild';
      marke.loading = 'lazy';
      marke.alt = '';
      marke.src = '/sicherung/' + encodeURIComponent(eintrag.name);
    }

    const name = document.createElement('span');
    name.className = 'sicherung-name';
    const oben = document.createElement('b');
    oben.textContent = eintrag.titel || eintrag.datei;
    /* Der Ordner assets/characters/ steht vor jedem Bild und sagt deshalb
       nichts. Ohne ihn passt die Zeile, mit ihm bräche der Dateiname am
       rechten Rand ab, und der ist das Interessante. Ganz steht der Weg
       im Hinweisfähnchen. */
    const unten = document.createElement('i');
    const kurz = eintrag.ziel.replace(/^assets\/characters\//, '');
    unten.textContent = eintrag.vorhanden ? kurz : `${kurz} · steht dort nicht mehr`;
    unten.title = eintrag.ziel;
    unten.classList.toggle('fehlt', !eintrag.vorhanden);
    name.append(oben, unten);

    const zeit = document.createElement('span');
    zeit.className = 'sicherung-zeit';
    zeit.textContent = alsZeitpunkt(eintrag.zeit);

    const mass = document.createElement('span');
    mass.className = 'sicherung-mass';
    mass.textContent = alsMasse(eintrag.bytes);

    const tasten = document.createElement('span');
    tasten.className = 'sicherung-tasten';
    const zurueck = document.createElement('button');
    zurueck.type = 'button';
    zurueck.textContent = 'Zurückholen';
    symbole.setze(zurueck, 'zurueckholen');
    zurueck.title = `${ARTNAME[eintrag.art]}: diese Fassung nach ${eintrag.ziel} schreiben. `
      + 'Was dort steht, wird vorher gesichert.';
    zurueck.addEventListener('click', () => holeZurueck(eintrag));
    const weg = document.createElement('button');
    weg.type = 'button';
    weg.className = 'weg';
    weg.title = 'Diese Fassung endgültig löschen';
    symbole.setze(weg, 'schliessen');
    weg.addEventListener('click', () => loescheSicherung({ namen: [eintrag.name] },
      eintrag.vorhanden ? null
        : `${eintrag.ziel} steht nicht mehr im Repo. Diese Kopie ist das Einzige, `
          + 'was davon übrig ist. Wirklich löschen?'));
    tasten.append(zurueck, weg);

    zeile.append(haken, marke, name, zeit, mass, tasten);
    feld.append(zeile);
  }
  frischeSicherungsknoepfe();
}

function frischeSicherungsknoepfe() {
  const anzahl = sicherung.gewaehlt.size;
  const knopf = $('sicherung-auswahl');
  knopf.disabled = !anzahl || sicherung.laeuft;
  symbole.beschrifte(knopf, anzahl ? `Auswahl löschen (${anzahl})` : 'Auswahl löschen');
  for (const id of ['sicherung-veraltet', 'sicherung-alles']) {
    $(id).disabled = sicherung.laeuft || !sicherung.eintraege.length;
  }
}

/* Eine Fassung an ihren Platz zurückschreiben. Danach ist im Repo etwas
   anderes zu sehen als eben, deshalb wird die Figurenliste neu geholt und
   der Bildcache für diese eine Datei aufgebrochen. */
async function holeZurueck(eintrag) {
  if (sicherung.laeuft) return;
  const frage = eintrag.vorhanden
    ? `${eintrag.ziel} durch die Fassung vom ${alsZeitpunkt(eintrag.zeit)} ersetzen? `
      + 'Der jetzige Stand wird vorher gesichert und lässt sich mit Strg+Z zurückholen.'
    : `${eintrag.ziel} neu anlegen, mit der Fassung vom ${alsZeitpunkt(eintrag.zeit)}?`;
  if (!confirm(frage)) return;

  sicherung.laeuft = true;
  frischeSicherungsknoepfe();
  try {
    const antwort = await json('/api/sicherung/zurueck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: eintrag.name }),
    });
    if (eintrag.art !== 'quelle') {
      const wo = eintrag.art === 'ganzkoerper' ? 'fullsize' : 'portraits';
      S.frisch.set(wo + '/' + eintrag.datei, Date.now());
    }
    await neuLaden(S.figur && S.figur.slug, S.ziel && S.ziel.datei);
    setzeSicherung(antwort);
    zeigeSicherungsfehler(null);
    melde(`Zurückgeholt: ${antwort.ziel}`
      + (antwort.liste ? ' · ' + antwort.liste : ''));
  } catch (fehler) {
    zeigeSicherungsfehler('Nicht zurückgeholt: ' + fehler.message);
  } finally {
    sicherung.laeuft = false;
    frischeSicherungsknoepfe();
  }
}

/* Löschen ist endgültig, hier gibt es kein Rückgängig: Der Verlauf sichert
   das Repo, nicht die Sicherung. Deshalb fragt jeder Griff, der mehr als
   eine Zeile trifft, vorher nach. */
async function loescheSicherung(auftrag, frage) {
  if (sicherung.laeuft) return;
  if (frage && !confirm(frage)) return;

  sicherung.laeuft = true;
  frischeSicherungsknoepfe();
  try {
    const antwort = await json('/api/sicherung/loeschen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auftrag),
    });
    setzeSicherung(antwort);
    zeigeSicherungsfehler(null);
    melde(antwort.geloescht
      ? `${antwort.geloescht} ${antwort.geloescht === 1 ? 'Fassung' : 'Fassungen'} gelöscht, `
        + `${alsMasse(antwort.frei)} frei.`
      : 'Es war nichts zu löschen.');
  } catch (fehler) {
    zeigeSicherungsfehler('Nicht gelöscht: ' + fehler.message);
  } finally {
    sicherung.laeuft = false;
    frischeSicherungsknoepfe();
  }
}

function sicherungBytes() {
  return sicherung.eintraege.reduce((summe, e) => summe + e.bytes, 0);
}

/* Was die drei Knöpfe im Fuß tun, hängt am Stand der Liste, deshalb steht
   die Frage jeweils hier und nicht in loescheSicherung(). */
function loescheAuswahl() {
  const anzahl = sicherung.gewaehlt.size;
  loescheSicherung({ namen: [...sicherung.gewaehlt] },
    `${anzahl} ${anzahl === 1 ? 'Fassung' : 'Fassungen'} endgültig löschen?`);
}

function raeumeVeraltet() {
  const behalten = new Set(sicherung.eintraege.map((e) => e.art + '/' + e.ziel)).size;
  const weg = sicherung.eintraege.length - behalten;
  if (!weg) return melde('Von jeder Datei liegt nur eine Fassung da, es gibt nichts aufzuräumen.');
  return loescheSicherung({ veraltet: true },
    `${weg} ältere ${weg === 1 ? 'Fassung' : 'Fassungen'} löschen? `
    + `Von jeder Datei bleibt die jüngste stehen, das sind ${behalten}.`);
}

function leereSicherung() {
  loescheSicherung({ alle: true },
    `Den Sicherungsordner vollständig leeren? ${sicherung.eintraege.length} Fassungen `
    + `(${alsMasse(sicherungBytes())}) sind dann weg, auch die von Dateien, die es `
    + 'im Repo nicht mehr gibt.');
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
  const megapixel = (S.vorlage.naturalWidth * S.vorlage.naturalHeight) / 1e6;
  const sekunden = megapixel * 150 + (mitGesicht ? 25 : 0);
  if (sekunden < 90) return `rund ${Math.round(sekunden / 10) * 10} Sekunden`;
  return `rund ${Math.round(sekunden / 30) / 2} Minuten`;
}

function frischeUpscaleVorschau() {
  const vorschau = $('upscale-vorschau');
  if (!S.vorlage) {
    vorschau.textContent = '';
    return;
  }
  /* Gerechnet wird an der Datei, nicht an der gedrehten Arbeitsvorlage:
     Der Server bekommt die Vorlage, wie sie auf der Platte liegt. */
  const b = S.vorlage.naturalWidth;
  const h = S.vorlage.naturalHeight;
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
  symbole.beschrifte(knopf, mitGesicht ? 'Rechnet und baut Gesicht …' : 'Wird hochgerechnet …');
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
    symbole.beschrifte(knopf, 'Upscale …');
    frischeDaten();
  }
}

/* ---------- Freistellen ----------

   Der Hintergrund einer deckenden Vorlage kommt weg, das Ergebnis geht
   als eigenes Bild auf die Bühne. Damit hört die halbe Arbeit auf: Mit
   Alphakanal findet der Vorschlag den Kopf über die Umrissform statt
   über eine geschätzte Gesichtsbox, und das Ganzkörperbild steht im
   Rahmen der Charakterseite frei statt in einem Kasten.

   Gerechnet wird örtlich, siehe tools/portrait-studio/services/remove-background.py.
   Die Reihenfolge mit dem Upscale ist nicht gleichgültig: erst
   hochrechnen, dann freistellen. Das Modell sieht dann mehr Pixel, und
   Real-ESRGAN muss keine Kante erfinden, die nach dem Freistellen
   ohnehin halb durchsichtig ist. */
let freiLaeuft = false;

function freiGrund() {
  if (!S.frei) {
    return 'Dieser Server kennt das Freistellen noch nicht. '
      + 'Das Studio einmal neu starten: node tools/portrait-studio/server.js';
  }
  if (!S.frei.ok) return S.frei.grund;
  return null;
}

/* Die Wahl trägt nur, was auch als Datei daliegt: Ein Modell, das erst
   geladen werden müsste, wäre genau das, was hier nicht sein soll. */
function richteFreiEin() {
  const wahl = $('frei-modell');
  const modelle = freiGrund() ? [] : S.frei.modelle;
  wahl.textContent = '';
  for (const m of modelle) {
    const o = document.createElement('option');
    o.value = m.name;
    o.textContent = `${m.titel}  ·  ${m.hinweis}`;
    wahl.append(o);
  }
  if (!modelle.length) {
    const o = document.createElement('option');
    o.textContent = 'Kein Modell vorhanden';
    o.disabled = true;
    wahl.append(o);
    S.freiModell = null;
    return;
  }
  if (!modelle.some((m) => m.name === S.freiModell)) S.freiModell = modelle[0].name;
  wahl.value = S.freiModell;
}

/* Gemessen auf diesem Rechner, wo onnxruntime auf der CPU rechnet: Die
   BiRefNet-Datei wiegt fast ein Gigabyte und braucht allein zum Laden
   rund eine halbe Minute, danach etwa fünfzig Sekunden je Durchgang.
   ISNet und U²-Net sind ein Bruchteil davon. Die Größe der Vorlage
   ändert daran wenig, das Modell rechnet ohnehin auf 1024 Pixel, der
   zweite Durchgang kostet dafür noch einmal einen vollen Lauf.

   Die Streuung ist groß, zwischen zwei gleichen Läufen lagen schon
   hundert und hundertsechzig Sekunden. Das hier ist ein Anhalt, damit
   niemand vor einem Knopf sitzt, der scheinbar nichts tut. */
function freiDauer() {
  const gross = (S.freiModell || '').startsWith('birefnet');
  const laden = gross ? 25 : 8;
  const lauf = gross ? 50 : 8;
  const sekunden = laden + lauf * (S.feinschliff ? 2 : 1);
  if (sekunden < 90) return `rund ${Math.round(sekunden / 5) * 5} Sekunden`;
  return `rund ${Math.round(sekunden / 30) / 2} Minuten`;
}

function frischeFreiVorschau() {
  const vorschau = $('frei-vorschau');
  if (!S.vorlage || !S.quelle) {
    vorschau.textContent = '';
    return;
  }
  const name = S.quelle.typ === 'upload' ? S.upload.name : S.quelle.name + '.webp';
  vorschau.innerHTML = `<b>${name}</b> · `
    + `${S.vorlage.naturalWidth} × ${S.vorlage.naturalHeight} px · ` + freiDauer();
  $('d-saum').textContent = S.saum.toFixed(2);
}

function zeigeFrei() {
  if (!S.quelle || !S.bild || freiLaeuft) return;
  const grund = freiGrund();
  const warnung = $('frei-warnung');
  /* Trägt die Vorlage schon Alpha, ist nichts kaputt, aber der Lauf
     bringt meist nichts. Das gehört gesagt, bevor jemand eine Minute
     wartet. */
  const text = grund
    || (S.alpha
      ? 'Diese Vorlage ist schon freigestellt. Ein Lauf legt sie dafür auf '
        + 'Weiß und sucht den Vordergrund neu, die vorhandene Alpha fällt '
        + 'dabei weg.'
      : null);
  warnung.textContent = text || '';
  warnung.hidden = !text;
  $('frei-ok').disabled = !!grund;
  richteFreiEin();
  $('frei-feinschliff').checked = S.feinschliff;
  $('frei-saum').value = S.saum;
  frischeFreiVorschau();
  $('frei-dialog').showModal();
}

async function freistellen() {
  if (!S.quelle || !S.bild || freiLaeuft) return;
  const grund = freiGrund();
  if (grund) return melde(grund, true);
  const knopf = $('freistellen');

  /* Wie beim Upscale: Ein zweiter Klick nach einem Wechsel des Modells
     meint dieselbe Vorlage mit anderer Einstellung, nicht das Ergebnis
     noch einmal freistellen. */
  const basis = (S.quelle.typ === 'upload' && S.upload && S.upload.herkunft)
    ? S.upload.herkunft : S.quelle;

  freiLaeuft = true;
  knopf.disabled = true;
  symbole.beschrifte(knopf, 'Wird freigestellt …');
  try {
    const antwort = await json('/api/freistellen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quelle: basis, modell: S.freiModell,
        feinschliff: S.feinschliff, saum: S.saum,
      }),
    });
    if (S.upload) URL.revokeObjectURL(S.upload.url);
    S.upload = {
      id: antwort.id, name: antwort.name, url: '/upload/' + antwort.id, herkunft: basis,
    };
    await waehleQuelle({ typ: 'upload', id: antwort.id });

    /* Der Anteil ist der Teil der Fläche, der stehen blieb. Ein sehr
       kleiner Wert heißt fast immer: Das Modell hat nicht die Figur
       erwischt, sondern ein Stück davon. Das sieht man auf der Bühne,
       aber die Zahl bringt einen schneller darauf. */
    let text = `Freigestellt, ${Math.round(antwort.anteil * 100)} % der Fläche `
      + 'bleiben stehen';
    text += antwort.feinschliff ? ', mit zweitem Durchgang' : '';
    text += antwort.wiederverwendet ? '. Aus dem letzten Lauf übernommen.'
      : ` in ${antwort.dauer} s.`;
    melde(text, antwort.anteil < 0.02);
  } catch (fehler) {
    melde('Freistellen misslungen: ' + fehler.message, true);
  } finally {
    freiLaeuft = false;
    symbole.beschrifte(knopf, 'Freistellen …');
    frischeDaten();
  }
}

/* ---------- Biografie ----------

   Der dritte Bereich arbeitet nicht an Pixeln, sondern an dem, was in
   js/profiles.js, js/facts.js und js/data.js steht. Er hält alles zu
   einer Figur im Browser, bis auf „Speichern“ gedrückt wird: Erst dann
   gehen die drei Dateien in einem Schritt an den Server, und erst dann
   entsteht ein Schritt im Verlauf.

   S.texte ist dabei die einzige Wahrheit über Abschnitte und
   Beziehungen. Die Felder schreiben bei jeder Eingabe dorthin zurück,
   deshalb überleben Reihenfolge und Inhalt jedes Neuzeichnen der Liste.
   Die einzeiligen Felder daneben werden umgekehrt erst beim Sammeln
   ausgelesen, sie haben nichts zu verwalten. */

const NICHTS_IM_WIKI = 'Im Wiki nichts gefunden';

/* Die Vorlage für die Auswahl einer Zielfigur. Sie wird einmal gebaut
   und für jede Zeile geklont: Zweihundertachtzig Einträge je Beziehung
   neu zu erzeugen kostet mehr, als die Vorlage im Speicher zu halten. */
let bondVorlage = null;

function baueBondWahl() {
  bondVorlage = document.createElement('select');
  const leer = document.createElement('option');
  leer.value = '';
  leer.textContent = 'Figur wählen …';
  bondVorlage.append(leer);
  for (const figur of S.figuren) {
    const wahl = document.createElement('option');
    wahl.value = figur.slug;
    wahl.textContent = [figur.name, figur.rolle, figur.welt].filter(Boolean).join(' · ');
    bondVorlage.append(wahl);
  }
}

/* Eine eigene Auswahl für eine Zeile. Die offene Figur fällt heraus, sie
   steht nicht mit sich selbst in Beziehung. Ein Ziel, das es nicht mehr
   gibt, bleibt als eigener Eintrag stehen: Sonst spränge die Zeile
   stillschweigend auf eine andere Figur. */
function bondWahl(ziel) {
  const wahl = bondVorlage.cloneNode(true);
  if (S.figur) {
    const eigen = wahl.querySelector(`option[value="${S.figur.slug}"]`);
    if (eigen) eigen.remove();
  }
  if (ziel && !wahl.querySelector(`option[value="${ziel}"]`)) {
    const verwaist = document.createElement('option');
    verwaist.value = ziel;
    verwaist.textContent = `${ziel} (unbekannt)`;
    wahl.append(verwaist);
  }
  wahl.value = ziel || '';
  return wahl;
}

/* ---------- Laden und Anzeigen ---------- */

async function ladeTexte(figur) {
  S.texte = null;
  S.texteStand = '';
  $('bio-liste').textContent = '';
  begriffeSchliessen();
  $('bond-liste').textContent = '';
  $('texte-speichern').disabled = true;
  setzeTexteInfo('', '');
  try {
    const daten = await json('/api/texte?slug=' + encodeURIComponent(figur.slug));
    /* Wer während des Ladens weiterklickt, soll nicht die Texte der
       vorigen Figur bekommen. */
    if (S.figur !== figur) return;
    S.texte = daten;
    S.wikiOffen = daten.offen;
    zeigeTexte();
  } catch (fehler) {
    melde('Die Texte ließen sich nicht laden: ' + fehler.message, true);
  }
}

function zeigeTexte() {
  const t = S.texte;
  $('t-bio').value = t.bio;
  $('t-actors').value = t.actors.join('\n');
  for (const name of ['origin', 'species', 'height']) $('t-' + name).value = t.hand[name] || '';
  $('t-status').value = t.hand.status || '';
  $('t-teams').value = (t.hand.teams || []).join('\n');
  $('t-powers').value = alsBloecke(t.kraefte || []);
  zeigeWikiVorgaben();
  maleAbschnitte();
  maleBonds();
  merkeTexteStand();
  frischeWikiLage();
}

/* Was der Wiki-Abruf gefunden hat, steht blass im leeren Feld. Es ist
   keine Eingabe, sondern die Angabe, die ohne Handarbeit gilt. */
function zeigeWikiVorgaben() {
  const w = (S.texte && S.texte.wiki) || {};
  for (const name of ['origin', 'species', 'height']) {
    $('t-' + name).placeholder = w[name] || NICHTS_IM_WIKI;
  }
  /* Die Auswahl ist schmal, deshalb hier kurz: Ohne Angabe des Wikis
     stünde „Status: Im Wiki nichts gefunden“ und liefe über den Rand. */
  $('t-status').querySelector('option[value=""]').textContent = w.status
    ? `Aus dem Wiki: ${w.status}` : 'Aus dem Wiki: unbekannt';
  $('t-teams').placeholder = (w.teams || []).join('\n') || NICHTS_IM_WIKI;
  /* Kräfte stehen in keiner Infobox und lassen sich gar nicht abfragen,
     siehe js/powers.js. Dort ist das leere Feld also wirklich leer. */
  $('t-powers').placeholder = 'Übermenschliche Kraft\nDas Serum hebt Kraft, Reflexe und Ausdauer an den äußersten Rand '
    + 'dessen, was ein Mensch erreichen kann.';
  frischeZurueckTasten();
}

/* Die Taste, die ein Feld leert, hat nichts zu tun, solange es leer ist. */
function frischeZurueckTasten() {
  for (const taste of document.querySelectorAll('.feld-zurueck[data-leert]')) {
    taste.disabled = !$(taste.dataset.leert).value;
  }
}

/* ---------- Die Abschnitte ---------- */

function maleAbschnitte() {
  const feld = $('bio-liste');
  feld.textContent = '';
  if (!S.texte.profil.length) {
    const hinweis = document.createElement('p');
    hinweis.className = 'bio-leer';
    hinweis.textContent = 'Zu dieser Figur steht noch keine ausführliche Biografie '
      + 'in js/profiles.js. Die Charakterseite zeigt dann nur die Kurzfassung. '
      + 'Mit „Abschnitt“ oben in der Aufschrift fängt sie an.';
    feld.append(hinweis);
  } else {
    S.texte.profil.forEach((abschnitt, i) => feld.append(baueAbschnitt(abschnitt, i)));
  }
  frischeBioStand();
}

function bioTaste(symbol, hilfe, tun, aus, gefahr) {
  const knopf = document.createElement('button');
  knopf.type = 'button';
  knopf.title = hilfe;
  symbole.setze(knopf, symbol);
  knopf.disabled = !!aus;
  if (gefahr) knopf.className = 'gefahr';
  knopf.addEventListener('click', tun);
  return knopf;
}

function baueAbschnitt(abschnitt, i) {
  const kasten = document.createElement('div');
  kasten.className = 'bio-abschnitt';

  const kopf = document.createElement('div');
  kopf.className = 'bio-kopf';
  const nummer = document.createElement('span');
  nummer.className = 'bio-nummer';
  nummer.textContent = (i + 1) + '.';

  const titel = document.createElement('input');
  titel.type = 'text';
  titel.maxLength = 60;
  titel.value = abschnitt[0];
  titel.placeholder = 'Überschrift';
  titel.dataset.stelle = String(i);
  titel.addEventListener('input', () => {
    abschnitt[0] = titel.value;
    frischeTexteKnopf();
  });

  const tasten = document.createElement('div');
  tasten.className = 'bio-tasten';
  tasten.append(
    bioTaste('hoch', 'Einen Abschnitt nach vorn', () => schiebeAbschnitt(i, -1), i === 0),
    bioTaste('runter', 'Einen Abschnitt nach hinten', () => schiebeAbschnitt(i, 1),
      i === S.texte.profil.length - 1),
    bioTaste('schliessen', 'Abschnitt entfernen', () => loescheAbschnitt(i), false, true),
  );
  kopf.append(nummer, titel, tasten);

  const text = document.createElement('textarea');
  text.rows = 5;
  text.spellcheck = true;
  text.value = abschnitt[1];
  text.placeholder = 'Was in diesem Abschnitt geschieht, in ganzen Sätzen.';
  text.addEventListener('input', () => {
    abschnitt[1] = text.value;
    frischeTexteKnopf();
  });

  kasten.append(kopf, text);
  return kasten;
}

/* Nach dem Verschieben stehen alle Nummern und alle Tasten anders, also
   wird die Liste neu gezeichnet. Der Fokus wandert auf die Überschrift,
   die eben bewegt wurde: Wer dreimal nach oben will, drückt dreimal. */
function schiebeAbschnitt(i, richtung) {
  const ziel = i + richtung;
  const liste = S.texte.profil;
  if (ziel < 0 || ziel >= liste.length) return;
  [liste[i], liste[ziel]] = [liste[ziel], liste[i]];
  maleAbschnitte();
  frischeTexteKnopf();
  const kasten = $('bio-liste').children[ziel];
  if (kasten) {
    const knopf = kasten.querySelector(`.bio-tasten button:nth-child(${richtung < 0 ? 1 : 2})`);
    (knopf && !knopf.disabled ? knopf : kasten.querySelector('input')).focus();
    kasten.scrollIntoView({ block: 'nearest' });
  }
}

function loescheAbschnitt(i) {
  const abschnitt = S.texte.profil[i];
  if (!abschnitt) return;
  if ((abschnitt[0] || abschnitt[1])
    && !confirm(`Den Abschnitt „${abschnitt[0] || 'ohne Überschrift'}“ entfernen?`)) return;
  S.texte.profil.splice(i, 1);
  maleAbschnitte();
  frischeTexteKnopf();
}

function neuerAbschnitt() {
  if (!S.texte) return;
  S.texte.profil.push(['', '']);
  maleAbschnitte();
  frischeTexteKnopf();
  const kasten = $('bio-liste').lastElementChild;
  if (kasten) {
    kasten.querySelector('input').focus();
    kasten.scrollIntoView({ block: 'nearest' });
  }
}

/* Wie weit die Biografie ist, als Zeile in der Aufschrift. Die Zeichen
   sind das ehrlichere Maß als die Zahl der Abschnitte: Sechs Zeilen sind
   keine Biografie. */
function frischeBioStand() {
  const liste = (S.texte && S.texte.profil) || [];
  const zeichen = liste.reduce((summe, [, text]) => summe + text.trim().length, 0);
  $('bio-stand').textContent = liste.length
    ? `${liste.length} Abschnitt${liste.length === 1 ? '' : 'e'} · ${zeichen} Zeichen`
    : '';
}

/* ---------- Beziehungen ---------- */

function maleBonds() {
  const feld = $('bond-liste');
  /* Das Feld der Begriffe hängt an einer dieser Zeilen. Sie werden alle
     neu gebaut, es muss also zu. */
  begriffeSchliessen();
  feld.textContent = '';
  S.texte.bonds.forEach((paar, i) => feld.append(baueBond(paar, i)));
}

function baueBond(paar, i) {
  const zeile = document.createElement('div');
  zeile.className = 'bond-zeile';

  const label = document.createElement('input');
  label.type = 'text';
  label.maxLength = 40;
  label.value = paar[0];
  label.placeholder = 'Bester Freund';
  label.setAttribute('aria-autocomplete', 'list');
  label.addEventListener('input', () => {
    paar[0] = label.value;
    frischeTexteKnopf();
    /* Getippt wird meist ein Begriff, den es schon gibt. Was dazu passt,
       steht deshalb beim Tippen von selbst darunter. */
    begriffe.alles = false;
    if (begriffeOffen()) begriffeMalen();
    else if (label.value.trim() && begriffePassen(label.value).length) begriffeOeffnen(label, paar);
  });
  /* Verlassen mit einem Wort, das die Liste nicht kennt: Es ist neu und
     wird gemerkt. */
  label.addEventListener('change', () => begriffAnlegen(label.value));
  label.addEventListener('keydown', (ev) => begriffeTastatur(ev, label, paar));

  const auf = document.createElement('button');
  auf.type = 'button';
  auf.className = 'bond-begriffe';
  auf.title = 'Begriffe, die schon benutzt sind';
  auf.setAttribute('aria-haspopup', 'listbox');
  symbole.setze(auf, 'runter');
  auf.addEventListener('click', () => {
    if (begriffeOffen() && begriffe.eingabe === label) begriffeSchliessen();
    else begriffeOeffnen(label, paar, true);
  });

  const wahl = bondWahl(paar[1]);
  wahl.addEventListener('change', () => {
    paar[1] = wahl.value;
    frischeTexteKnopf();
  });

  const weg = document.createElement('button');
  weg.type = 'button';
  weg.className = 'feld-zurueck';
  weg.title = 'Beziehung entfernen';
  symbole.setze(weg, 'schliessen');
  weg.addEventListener('click', () => {
    S.texte.bonds.splice(i, 1);
    maleBonds();
    frischeTexteKnopf();
  });

  zeile.append(label, auf, wahl, weg);
  return zeile;
}

function neueBond() {
  if (!S.texte) return;
  S.texte.bonds.push(['', '']);
  maleBonds();
  frischeTexteKnopf();
  const zeile = $('bond-liste').lastElementChild;
  if (zeile) zeile.querySelector('input').focus();
}

/* ---------- Die Begriffe der Beziehungen ----------

   „Weggefährte“, „Bruder“, „Erzfeind“: Die Bezeichnung einer Beziehung
   ist Freitext, aber fast immer eine, die es schon gibt. Neben dem Feld
   steht deshalb ein Pfeil, der die Liste aufschlägt, und wer tippt,
   filtert sie dabei. Ein Begriff, den die Liste nicht kennt, wird beim
   Verlassen des Feldes gemerkt und steht von da an mit darin. Wo er
   schon steht, lässt er sich umbenennen, und das gilt dann bei jeder
   Figur, die ihn trägt.

   Woher die Liste kommt und wo die frisch getippten Begriffe liegen,
   steht in server.js unter „Die Begriffe der Beziehungen“. Hier steht
   nur die Bedienung.

   Das Feld gibt es einmal für alle Zeilen, es hängt am Fenster und
   nicht an der Zeile: In der Tafel steckt es in einem Kasten, der
   rollt, und würde an dessen Rand abgeschnitten. Beim Rollen wird es
   deshalb geschlossen, sonst stünde es neben einer Zeile, die
   inzwischen weitergewandert ist. */

/* So viele Begriffe stehen höchstens im Feld. Zweihundert Zeilen bei
   jedem Tastendruck neu zu bauen kostet mehr, als die letzten davon
   wert sind: Wer so weit unten sucht, tippt schneller weiter. */
const BEGRIFF_MAX = 60;

const begriffe = {
  eingabe: null,   // das Feld, neben dem die Liste steht
  paar: null,      // die Beziehung dazu, ein Eintrag aus S.texte.bonds
  treffer: [],     // was gerade zu sehen ist
  wahl: -1,        // hervorgehoben von den Pfeiltasten
  aendert: '',     // Begriff, der gerade umbenannt wird
  alles: false,    // ganze Liste zeigen, statt nach dem Feld zu filtern
};

function begriffeOffen() {
  return !$('begriff-feld').hidden;
}

function begriffeSchliessen() {
  const feld = $('begriff-feld');
  if (feld.hidden) return;
  feld.hidden = true;
  feld.textContent = '';
  begriffe.eingabe = null;
  begriffe.paar = null;
  begriffe.treffer = [];
  begriffe.wahl = -1;
  begriffe.aendert = '';
}

function begriffeOeffnen(eingabe, paar, alles) {
  begriffe.eingabe = eingabe;
  begriffe.paar = paar;
  begriffe.wahl = -1;
  begriffe.aendert = '';
  begriffe.alles = !!alles;
  $('begriff-feld').hidden = false;
  begriffeMalen();
}

/* Was zu einem Text passt, die häufigsten zuerst. Was vorn anfängt,
   steht über dem, was ihn nur irgendwo trägt. */
function begriffePassen(text) {
  const wort = text.trim().toLowerCase();
  if (!wort) return S.begriffe;
  const vorn = [];
  const drin = [];
  for (const b of S.begriffe) {
    const stelle = b.name.toLowerCase().indexOf(wort);
    if (stelle === 0) vorn.push(b);
    else if (stelle > 0) drin.push(b);
  }
  return [...vorn, ...drin];
}

/* Was gerade im Feld steht. Der Pfeil schlägt die ganze Liste auf, auch
   wenn in der Zeile schon ein Begriff steht: Wer ihn drückt, sucht einen
   anderen. Erst die nächste Taste im Feld filtert wieder. */
function begriffeTreffer() {
  if (begriffe.alles) return S.begriffe;
  return begriffePassen(begriffe.eingabe ? begriffe.eingabe.value : '');
}

function begriffTaste(symbol, hilfe, tun, gefahr) {
  const knopf = document.createElement('button');
  knopf.type = 'button';
  knopf.className = 'begriff-taste' + (gefahr ? ' gefahr' : '');
  knopf.title = hilfe;
  symbole.setze(knopf, symbol);
  knopf.addEventListener('click', tun);
  return knopf;
}

function begriffeMalen() {
  const feld = $('begriff-feld');
  feld.textContent = '';
  begriffe.treffer = begriffeTreffer();
  if (begriffe.wahl >= begriffe.treffer.length) begriffe.wahl = -1;

  const sichtbar = begriffe.treffer.slice(0, BEGRIFF_MAX);
  sichtbar.forEach((b, i) => feld.append(begriffZeile(b, i)));
  if (!sichtbar.length) {
    feld.append(begriffNotiz(S.begriffe.length
      ? 'Kein Begriff dazu. Wer das Feld verlässt, legt ihn an.'
      : 'Noch steht kein Begriff in der Liste.'));
  } else if (begriffe.treffer.length > sichtbar.length) {
    feld.append(begriffNotiz(`${begriffe.treffer.length - sichtbar.length} weitere, `
      + 'Tippen sucht sie heraus.'));
  }
  begriffeStellen();
}

function begriffNotiz(text) {
  const p = document.createElement('p');
  p.className = 'begriff-leer';
  p.textContent = text;
  return p;
}

function begriffZeile(b, i) {
  const zeile = document.createElement('div');
  zeile.className = 'begriff-zeile';

  /* Umbenennen geschieht an Ort und Stelle: Aus der Zeile wird ein Feld
     mit demselben Wort darin. */
  if (begriffe.aendert === b.name) {
    zeile.classList.add('taufe');
    const eingabe = document.createElement('input');
    eingabe.type = 'text';
    eingabe.maxLength = 40;
    eingabe.value = b.name;
    eingabe.className = 'begriff-taufe';
    eingabe.addEventListener('keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Enter') {
        ev.preventDefault();
        begriffTaufen(b, eingabe.value);
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        begriffe.aendert = '';
        begriffeMalen();
      }
    });
    zeile.append(eingabe,
      begriffTaste('uebernehmen', 'Umbenennen', () => begriffTaufen(b, eingabe.value)),
      begriffTaste('schliessen', 'Lassen, wie es war', () => {
        begriffe.aendert = '';
        begriffeMalen();
      }));
    setTimeout(() => { eingabe.focus(); eingabe.select(); }, 0);
    return zeile;
  }

  if (i === begriffe.wahl) zeile.classList.add('an');

  const nehmen = document.createElement('button');
  nehmen.type = 'button';
  nehmen.className = 'begriff-wahl';
  nehmen.setAttribute('role', 'option');
  nehmen.setAttribute('aria-selected', String(i === begriffe.wahl));
  const name = document.createElement('b');
  name.textContent = b.name;
  const zahl = document.createElement('i');
  /* Wie oft der Begriff schon steht. Ein frisch getippter steht nirgends
     und trägt deshalb keine Zahl, sondern ein Wort. */
  zahl.textContent = b.anzahl ? String(b.anzahl) : 'neu';
  nehmen.append(name, zahl);
  nehmen.addEventListener('click', () => begriffNehmen(b));

  zeile.append(nehmen,
    begriffTaste('umbenennen', b.anzahl
      ? `„${b.name}“ in allen ${b.anzahl} Beziehungen umbenennen`
      : `„${b.name}“ umbenennen`,
    () => {
      begriffe.aendert = b.name;
      begriffeMalen();
    }));
  /* Weg kann nur, was bei keiner Figur steht. Alles andere verschwindet
     mit seiner Beziehung und nicht aus dieser Liste. */
  if (!b.anzahl) {
    zeile.append(begriffTaste('schliessen', 'Aus der Liste nehmen',
      () => begriffWeg(b), true));
  }
  return zeile;
}

/* Das Feld steht unter seiner Zeile, und wenn dort kein Platz mehr ist,
   darüber. */
function begriffeStellen() {
  const feld = $('begriff-feld');
  const eingabe = begriffe.eingabe;
  if (!eingabe) return;
  const kasten = eingabe.getBoundingClientRect();
  feld.style.minWidth = Math.round(Math.max(kasten.width, 240)) + 'px';
  feld.style.left = Math.round(kasten.left) + 'px';
  const drunter = window.innerHeight - kasten.bottom - 10;
  const hoehe = feld.offsetHeight;
  feld.style.top = hoehe > drunter && kasten.top > drunter
    ? Math.round(Math.max(8, kasten.top - 5 - hoehe)) + 'px'
    : Math.round(kasten.bottom + 5) + 'px';
}

/* Pfeiltasten laufen durch die Liste, die Eingabe nimmt, was steht. */
function begriffeTastatur(ev, eingabe, paar) {
  if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
    ev.preventDefault();
    if (!begriffeOffen()) begriffeOeffnen(eingabe, paar, true);
    begriffeWandern(ev.key === 'ArrowDown' ? 1 : -1);
  } else if (ev.key === 'Enter' && begriffeOffen()) {
    ev.preventDefault();
    if (begriffe.wahl >= 0) begriffNehmen(begriffe.treffer[begriffe.wahl]);
    else begriffeSchliessen();
  } else if (ev.key === 'Escape' && begriffeOffen()) {
    ev.preventDefault();
    begriffeSchliessen();
  }
}

function begriffeWandern(richtung) {
  const anzahl = Math.min(begriffe.treffer.length, BEGRIFF_MAX);
  if (!anzahl) return;
  const stelle = begriffe.wahl + richtung;
  begriffe.wahl = stelle < 0 ? anzahl - 1 : stelle % anzahl;
  begriffeMalen();
  const zeile = $('begriff-feld').children[begriffe.wahl];
  if (zeile) zeile.scrollIntoView({ block: 'nearest' });
}

/* Einen Begriff aus der Liste in die Zeile setzen. */
function begriffNehmen(b) {
  const eingabe = begriffe.eingabe;
  const paar = begriffe.paar;
  if (!b || !eingabe || !paar) return;
  eingabe.value = b.name;
  paar[0] = b.name;
  frischeTexteKnopf();
  begriffeSchliessen();
  eingabe.focus();
}

/* Ein Wort, das die Liste noch nicht kennt, kommt hinein. Das geschieht
   still: Wer tippt, will eine Beziehung schreiben und keine Liste
   pflegen. */
async function begriffAnlegen(wort) {
  const kurz = wort.trim();
  if (!kurz || S.begriffe.some((b) => b.name === kurz)) return;
  try {
    const antwort = await json('/api/begriffe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: kurz }),
    });
    S.begriffe = antwort.begriffe;
    if (begriffeOffen()) begriffeMalen();
  } catch (fehler) {
    melde('Der Begriff ließ sich nicht merken: ' + fehler.message, true);
  }
}

async function begriffWeg(b) {
  if (!confirm(`„${b.name}“ aus der Liste nehmen?`)) return;
  try {
    const antwort = await json('/api/begriffe/loeschen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: b.name }),
    });
    S.begriffe = antwort.begriffe;
    begriffe.wahl = -1;
    if (begriffeOffen()) begriffeMalen();
  } catch (fehler) {
    melde('Der Begriff blieb stehen: ' + fehler.message, true);
  }
}

async function begriffTaufen(b, wort) {
  const neu = wort.trim();
  if (!neu || neu === b.name) {
    begriffe.aendert = '';
    begriffeMalen();
    return;
  }
  const schon = S.begriffe.some((x) => x.name === neu);
  const frage = schon
    ? `„${neu}“ steht schon in der Liste. Beide zusammenlegen?`
    : `„${b.name}“ in „${neu}“ umbenennen?`
      + (b.anzahl ? ` Er steht in ${b.anzahl} Beziehung${b.anzahl === 1 ? '' : 'en'}.` : '');
  if (!confirm(frage)) return;

  try {
    const antwort = await json('/api/begriffe/umbenennen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt: b.name, neu }),
    });
    S.begriffe = antwort.begriffe;
    if (antwort.verlauf) frischerVerlauf(antwort.verlauf);
    begriffe.aendert = '';
    begriffe.wahl = -1;
    /* Trägt die offene Figur den Begriff, stehen ihre Zeilen jetzt
       anders da und werden neu gebaut. Das Feld schließt dabei, es hinge
       sonst an einer Eingabe, die es nicht mehr gibt. */
    if (begriffTauschen(b.name, neu)) {
      maleBonds();
    } else if (begriffeOffen()) {
      begriffeMalen();
    }
    frischeTexteKnopf();
    melde(antwort.stellen
      ? `„${b.name}“ heißt jetzt „${neu}“: ${antwort.stellen} `
        + `Beziehung${antwort.stellen === 1 ? '' : 'en'} bei ${antwort.figuren} `
        + `Figur${antwort.figuren === 1 ? '' : 'en'}`
      : `Der Begriff heißt jetzt „${neu}“.`);
  } catch (fehler) {
    melde('Das Umbenennen ging nicht: ' + fehler.message, true);
  }
}

/* Die offene Figur steht im Browser und weiß nicht, dass ihre Datei sich
   gerade geändert hat. Der Begriff wird deshalb auch hier getauscht, in
   den Zeilen wie in dem Abdruck, an dem „geändert?“ hängt: Sonst stünde
   die Figur als geändert da, obwohl niemand sie angefasst hat. */
function begriffTauschen(alt, neu) {
  if (!S.texte) return false;
  if (S.texteStand) {
    try {
      const stand = JSON.parse(S.texteStand);
      stand.bonds = (stand.bonds || [])
        .map(([label, ziel]) => [label === alt ? neu : label, ziel]);
      S.texteStand = JSON.stringify(stand);
    } catch (fehler) { /* dann bleibt der Abdruck, wie er war */ }
  }
  let getroffen = false;
  for (const paar of S.texte.bonds) {
    if (paar[0] !== alt) continue;
    paar[0] = neu;
    getroffen = true;
  }
  return getroffen;
}

/* ---------- Sammeln, vergleichen, speichern ---------- */

/* Ein mehrzeiliges Feld als Liste: leere Zeilen fallen weg, der Rest
   behält seine Reihenfolge. So stehen Zugehörigkeiten und Kräfte auch in
   js/facts.js, die wichtigste zuerst. */
function alsListe(id) {
  return $(id).value.split('\n').map((zeile) => zeile.trim()).filter(Boolean);
}

/* Die Kräfte sind Paare aus Name und Absatz. Im Feld steht je Fähigkeit
   ein Block: oben der Name, darunter der Text, dazwischen eine
   Leerzeile zur nächsten. Das liest sich wie die Tafel selbst und
   braucht keine eigene Liste mit Knöpfen. */
function alsBloecke(paare) {
  return paare.map(([name, text]) => name + '\n' + text).join('\n\n');
}

function ausBloecken(id) {
  return $(id).value.split(/\n\s*\n/)
    .map((block) => block.split('\n').map((zeile) => zeile.trim()).filter(Boolean))
    .filter((zeilen) => zeilen.length)
    .map((zeilen) => [zeilen[0], zeilen.slice(1).join(' ')]);
}

function sammleTexte() {
  return {
    slug: S.texte.slug,
    bio: $('t-bio').value,
    profil: S.texte.profil.map(([titel, text]) => [titel, text]),
    hand: {
      origin: $('t-origin').value,
      species: $('t-species').value,
      height: $('t-height').value,
      status: $('t-status').value,
      teams: alsListe('t-teams'),
    },
    kraefte: ausBloecken('t-powers'),
    bonds: S.texte.bonds.map(([label, ziel]) => [label, ziel]),
    actors: alsListe('t-actors'),
  };
}

function merkeTexteStand() {
  S.texteStand = S.texte ? JSON.stringify(sammleTexte()) : '';
  frischeTexteKnopf();
}

function texteGeaendert() {
  return !!S.texte && JSON.stringify(sammleTexte()) !== S.texteStand;
}

function frischeTexteKnopf() {
  $('texte-speichern').disabled = !texteGeaendert();
  frischeBioStand();
  frischeZurueckTasten();
}

function setzeTexteInfo(text, art) {
  const p = $('texte-info');
  p.textContent = text;
  p.className = 'speicher-info' + (art ? ' ' + art : '');
}

/* Vor jedem Wechsel, der die Eingaben verlöre. Sie stehen nur im
   Browser, ein Klick auf die nächste Figur wäre sonst ein stiller
   Verlust. */
function texteFortlassen() {
  if (!texteGeaendert()) return true;
  return confirm('An dieser Figur stehen ungespeicherte Änderungen. Verwerfen?');
}

async function texteSpeichern() {
  if (!S.texte || !S.figur || !texteGeaendert()) return;
  const knopf = $('texte-speichern');
  const figur = S.figur;
  const auftrag = sammleTexte();
  knopf.disabled = true;
  setzeTexteInfo('speichert …', '');
  try {
    const antwort = await json('/api/texte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auftrag),
    });
    if (antwort.texte) figur.texte = antwort.texte;
    S.zaehler = antwort.zaehler;
    /* Eine gespeicherte Beziehung ändert die Zahlen hinter den
       Begriffen, und ein frisch getippter steht jetzt bei einer Figur. */
    if (antwort.begriffe) S.begriffe = antwort.begriffe;
    frischerVerlauf(antwort.verlauf);
    zeigeZaehler(false);
    frischeListe(figur);
    filtern();
    /* Der Stand von jetzt ist der neue Vergleichspunkt, auch wenn der
       Server nichts zu schreiben fand: Dann waren es nur Leerzeichen. */
    if (S.figur === figur) merkeTexteStand();
    setzeTexteInfo(antwort.geaendert
      ? `Gespeichert in ${antwort.dateien.join(', ')}.`
      : 'Es gab nichts zu ändern.', 'gut');
  } catch (fehler) {
    knopf.disabled = false;
    setzeTexteInfo('Nicht gespeichert: ' + fehler.message, 'schlecht');
    melde('Texte nicht gespeichert: ' + fehler.message, true);
  }
}

/* ---------- Der Steckbrief aus den Wikis ---------- */

function frischeWikiLage() {
  const offen = S.wikiOffen;
  $('wiki-lage').textContent = offen
    ? `${offen} von ${S.figuren.length} Figuren haben keinen Eintrag im erzeugten Block `
      + 'CHAR_FACTS. Gerechnet wird gut eine Sekunde je Figur, dazu eine halbe Minute '
      + 'für den Bau.'
    : `Alle ${S.figuren.length} Figuren stehen im erzeugten Block CHAR_FACTS.`;
  const knopf = $('wiki-alle');
  knopf.disabled = !offen;
  symbole.beschrifte(knopf, offen ? `${offen} fehlende nachziehen` : 'Nichts nachzuziehen');
  knopf.title = 'Ruft services/biography/fetch-facts.py und services/biography/build-facts.py auf. Geholt wird nur, '
    + 'was noch fehlt, und gesetzt wird nur das Geholte: Die übrigen Einträge im Block '
    + 'bleiben unberührt.';
}

/* Nach einem Lauf über viele Figuren stimmt der Textstand der ganzen
   Liste nicht mehr. Sie wird neu geholt, die offene Figur und ihre
   angefangenen Eingaben bleiben stehen. */
async function frischeFiguren() {
  const offen = S.figur ? S.figur.slug : null;
  const daten = await json('/api/figuren');
  S.figuren = daten.figuren;
  S.welten = daten.welten || [];
  S.zaehler = daten.zaehler;
  S.wikiOffen = daten.wikiOffen || 0;
  S.begriffe = daten.begriffe || [];
  S.figur = S.figuren.find((f) => f.slug === offen) || null;
  baueBondWahl();
  zeigeZaehler(true);
  baueListe();
}

async function wikiAbrufen(slug) {
  const knopf = slug ? $('wiki-figur') : $('wiki-alle');
  const wort = symbole.aufschrift(knopf);
  const figur = S.figur;
  for (const b of [$('wiki-figur'), $('wiki-alle')]) b.disabled = true;
  symbole.beschrifte(knopf, 'läuft …');
  try {
    const antwort = await json('/api/wiki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slug ? { slug } : {}),
    });
    frischerVerlauf(antwort.verlauf);
    S.wikiOffen = antwort.offen;
    if (!antwort.geaendert) {
      melde('Es fehlt keine Figur im erzeugten Block.');
    } else if (slug) {
      S.zaehler = antwort.zaehler;
      if (antwort.texte && figur) figur.texte = antwort.texte;
      if (S.texte && S.texte.slug === slug) {
        S.texte.wiki = antwort.wiki || {};
        zeigeWikiVorgaben();
      }
      zeigeZaehler(false);
      if (figur) frischeListe(figur);
      melde(`${figur ? figur.name : slug}: Steckbrief aus den Wikis geholt.`);
    } else {
      await frischeFiguren();
      /* Die Vorgaben der offenen Figur können sich mitgeändert haben,
         ihre Eingaben bleiben davon unberührt. */
      if (S.texte && S.figur) {
        const daten = await json('/api/texte?slug=' + encodeURIComponent(S.texte.slug));
        S.texte.wiki = daten.wiki;
        zeigeWikiVorgaben();
      }
      melde(`${antwort.geholt} Figuren aus den Wikis geholt, `
        + `${antwort.gesetzt} Einträge gesetzt.`);
    }
  } catch (fehler) {
    melde('Wiki-Abruf misslungen: ' + fehler.message, true);
  } finally {
    symbole.beschrifte(knopf, wort);
    $('wiki-figur').disabled = false;
    frischeWikiLage();
  }
}

/* ---------- Bedienung ---------- */

$('bio-neu').addEventListener('click', neuerAbschnitt);
$('bond-neu').addEventListener('click', neueBond);

/* Das Feld der Begriffe steht über allem und gehört doch zu einer Zeile.
   Es schließt, sobald daneben geklickt wird, und ebenso, sobald die
   Tafel darunter rollt oder das Fenster sich ändert: Dann stünde es
   neben nichts mehr. Der Pfeil, der es aufschlägt, ist davon
   ausgenommen, sonst schlösse dieser Klick es und der nächste Griff
   öffnete es wieder. */
document.addEventListener('pointerdown', (ev) => {
  if (!begriffeOffen()) return;
  const ziel = ev.target;
  if ($('begriff-feld').contains(ziel)) {
    /* Ein Knopf im Feld darf die Eingabe nicht aus dem Fokus nehmen, aus
       ihr kommt der Text. Das Feld zum Umbenennen braucht ihn dagegen. */
    if (!ziel.closest('.begriff-taufe')) ev.preventDefault();
    return;
  }
  if (ziel === begriffe.eingabe || (ziel.closest && ziel.closest('.bond-begriffe'))) return;
  begriffeSchliessen();
}, true);

document.addEventListener('scroll', (ev) => {
  if (!begriffeOffen()) return;
  /* Das Feld rollt in sich selbst, wenn die Liste lang ist. Das ist
     kein Grund, es zu schließen. */
  if (ev.target === $('begriff-feld')) return;
  begriffeSchliessen();
}, true);

window.addEventListener('resize', begriffeSchliessen);
$('texte-speichern').addEventListener('click', texteSpeichern);
$('wiki-figur').addEventListener('click', () => {
  if (S.figur) wikiAbrufen(S.figur.slug);
});
$('wiki-alle').addEventListener('click', () => wikiAbrufen(null));

/* Die einzeiligen Felder verwalten nichts, sie werden beim Sammeln
   ausgelesen. Ein Blick auf den Speichern-Knopf reicht deshalb. */
for (const id of ['t-bio', 't-origin', 't-species', 't-height', 't-status',
  't-teams', 't-powers', 't-actors']) {
  $(id).addEventListener('input', frischeTexteKnopf);
  $(id).addEventListener('change', frischeTexteKnopf);
}

/* Die Tasten, die ein Feld leeren, hängen an der Spalte und nicht je
   Feld: Es sind vier gleiche Tasten mit einem Ziel im Datenattribut. */
document.querySelector('.steck-feld').addEventListener('click', (ev) => {
  const taste = ev.target.closest('.feld-zurueck[data-leert]');
  if (!taste || taste.disabled) return;
  $(taste.dataset.leert).value = '';
  frischeTexteKnopf();
});

/* Ungespeicherte Texte überleben kein Neuladen und keinen geschlossenen
   Tab. Der Browser darf davor warnen, mehr als das lässt er nicht zu. */
addEventListener('beforeunload', (ev) => {
  if (!texte() || !texteGeaendert()) return;
  ev.preventDefault();
  ev.returnValue = '';
});

$('bereich').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (knopf) wechsleBereich(knopf.dataset.bereich);
});

$('liste-schalter').addEventListener('click', () => {
  zeigeListe(document.querySelector('.raster').classList.contains('zu'));
});

$('bedienung-zu').addEventListener('click', () => {
  zeigeBedienung(false);
  /* Der Fokus säße sonst auf einem Knopf, den es nicht mehr gibt, und
     fiele auf den Körper zurück. Er wandert mit auf den Knopf, der an
     der Stelle der Tafel steht. */
  $('bedienung-auf').focus();
});

$('bedienung-auf').addEventListener('click', () => {
  zeigeBedienung(true);
  $('bedienung-zu').focus();
});

$('fassung-leiste').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (knopf && !knopf.disabled) fassungKlick(knopf.dataset.tat);
});

$('film-wahl').addEventListener('change', (ev) => filmSetzen(ev.target.value));

/* Geschrieben wird auf den Knopf oder auf Enter. Das Verlassen des
   Feldes reicht nicht: Wer nur nachliest und weiterklickt, soll damit
   keine Datei anfassen. Umbruch im Satz gibt es mit Umschalt. */
$('beschreibung-feld').addEventListener('input', frischeBeschreibungKnopf);
$('beschreibung-ok').addEventListener('click', beschreibungSetzen);
$('beschreibung-feld').addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' || ev.shiftKey) return;
  ev.preventDefault();
  if (!$('beschreibung-ok').disabled) beschreibungSetzen();
});

$('fassung-label').addEventListener('input', zeigeDateinamen);
$('fassung-zielwahl').addEventListener('change', zeigeDateinamen);
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
$('welt-neu').addEventListener('input', frischeWelten);
$('welt-hinzu').addEventListener('click', weltAnlegen);
$('welt-weg').addEventListener('click', weltStreichen);
$('welt-links').addEventListener('click', () => weltRollen(-1));
$('welt-rechts').addEventListener('click', () => weltRollen(1));
$('welt-bekannt').addEventListener('scroll', weltRollstand);
/* Von sich aus rollte das Rad hier nur mit gedrückter Umschalttaste zur
   Seite, senkrecht gedreht ginge stattdessen der Dialog darunter. Steht
   der Zeiger über der Reihe, ist die Reihe gemeint: Die senkrechte
   Drehung wird deshalb zur waagerechten Bewegung.

   Solange die Reihe rollt, gehört ihr das Rad ganz, auch am Anschlag.
   Wird es dort weitergereicht, schiebt Chrome die Reihe mit seiner
   eigenen Bewegung um einen Pixel vor und zurück, und das sieht man als
   Zittern. Es liegt nicht am Weiterreichen nach oben, sondern an der
   Standardbewegung selbst: Gemessen bleibt der Rollstand nur dann fest,
   wenn das Ereignis immer abgebrochen wird.

   Passt die Reihe ganz hinein, ist nichts zu rollen, und das Rad bleibt
   dem Dialog überlassen. Und gerollt wird ohne Weichzeichner, das smooth
   aus dem Stilblatt gehört den Pfeilen: Beim Rad reihten sich die
   Bewegungen sonst hintereinander auf. */
$('welt-bekannt').addEventListener('wheel', (ev) => {
  const feld = $('welt-bekannt');
  if (feld.scrollWidth - feld.clientWidth <= 1) return;
  ev.preventDefault();
  feld.scrollBy({
    left: Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY,
    behavior: 'instant',
  });
}, { passive: false });
/* frischeWelten() läuft, bevor der Dialog offen ist, und misst dort nur
   Nullen. Der Beobachter meldet sich, sobald die Reihe ihre Breite
   bekommt, und danach bei jeder Änderung des Fensters. */
new ResizeObserver(weltRollstand).observe($('welt-bekannt'));
$('figur-loeschen').addEventListener('click', figurLoeschen);
$('welt-neu').addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter') return;
  ev.preventDefault();
  if (!$('welt-hinzu').disabled) weltAnlegen();
});
$('auftritt-suche').addEventListener('input', baueFilmliste);

$('figur-neu').addEventListener('click', zeigeNeueFigur);
$('neu-name').addEventListener('input', frischeNeueFigur);
$('neu-held').addEventListener('input', frischeNeueFigur);
$('neu-alias').addEventListener('input', frischeNeueFigur);
$('neu-welt').addEventListener('change', frischeNeueFigur);
$('neu-suche').addEventListener('input', maleNeueFilme);
$('neu-dialog').addEventListener('close', () => {
  if ($('neu-dialog').returnValue === 'ok') legeFigurAn();
});

$('sicherung-knopf').addEventListener('click', oeffneSicherung);
$('sicherung-auswahl').addEventListener('click', loescheAuswahl);
$('sicherung-veraltet').addEventListener('click', raeumeVeraltet);
$('sicherung-alles').addEventListener('click', leereSicherung);
$('sicherung-filter').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (!knopf) return;
  sicherung.art = knopf.dataset.art;
  for (const b of $('sicherung-filter').children) b.classList.toggle('an', b === knopf);
  setzeSicherung({ eintraege: sicherung.eintraege, bytes: sicherungBytes() });
});

$('suche').addEventListener('input', (ev) => { S.suche = ev.target.value; filtern(); });

$('filter').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (!knopf) return;
  S.filter = knopf.dataset.filter;
  for (const b of $('filter').children) b.classList.toggle('an', b === knopf);
  filtern();
});

/* Die Schleier hängen am Rollen und an der Höhe des Feldes. Beides
   ändert sich oft, das Ablesen ist billig, deshalb ohne Umschweife. */
$('liste').addEventListener('scroll', frischeSchleier, { passive: true });
addEventListener('resize', frischeSchleier);

/* Pfeiltasten führen durch die Liste, Enter schlägt die Vorwahl auf.
   Die Liste hört aber nur zu, wenn niemand sonst die Tasten braucht:
   nicht bei offenem Dialog, nicht bei eingeklappter Spalte, und von den
   Feldern nur aus der Suche heraus. Vor allem nicht auf der Bühne, die
   mit denselben Pfeilen den Ausschnitt schiebt. */
function listeHoertZu(ev) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) return false;
  if ($('spalte-liste').inert) return false;
  if (document.querySelector('dialog[open]')) return false;
  const ziel = ev.target;
  if (ziel === document.body || ziel === $('suche')) return true;
  /* Auf einem Eintrag macht Enter der Browser selbst, sonst ginge die
     Figur zweimal auf. Die Pfeile darf die Liste nehmen. */
  return ev.key !== 'Enter' && !!ziel.closest('.eintrag');
}

document.addEventListener('keydown', (ev) => {
  const runter = ev.key === 'ArrowDown';
  const hoch = ev.key === 'ArrowUp';
  if (!runter && !hoch && ev.key !== 'Enter') return;
  if (!listeHoertZu(ev)) return;

  if (ev.key === 'Enter') {
    const alle = zeichen() ? S.zeichen : S.figuren;
    const eintrag = alle.find((f) => f.slug === S.vorwahl);
    if (!eintrag || eintrag._knopf.parentElement.hidden) return;
    ev.preventDefault();
    if (zeichen()) waehleZeichen(eintrag.name);
    else waehleFigur(eintrag.slug);
    return;
  }

  const sichtbar = sichtbareFiguren();
  if (!sichtbar.length) return;
  ev.preventDefault();
  /* Ohne Vorwahl steht die offene Figur als Ausgangspunkt ein. Ist auch
     die weggefiltert, fängt der Lauf am jeweiligen Ende an. */
  const offen = zeichen() ? S.zeichenWahl : (S.figur && S.figur.slug);
  const jetzt = sichtbar.findIndex((f) => f.slug === (S.vorwahl || offen));
  const naechster = jetzt < 0
    ? (runter ? 0 : sichtbar.length - 1)
    : Math.min(Math.max(jetzt + (runter ? 1 : -1), 0), sichtbar.length - 1);
  setzeVorwahl(sichtbar[naechster], true);
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
  const vorher = zustandJetzt();
  S.rect = S.vorschlag
    ? { ...S.vorschlag }
    : standardRect(bildBreite(), bildHoehe());
  passeAnsichtAn(true);
  zeichne();
  vorschau();
  frischeDaten();
  merkeAusschnitt('Ausschnitt zurückgesetzt', vorher);
});

/* ---------- Ausrichten ----------

   Der Regler läuft unter der Hand, deshalb wird er wie das Mausrad
   gestapelt: Ein Zug ist ein Schritt im Verlauf, geschlossen wird er,
   wenn eine halbe Sekunde nichts mehr kommt. Die beiden Vierteldrehungen
   und der Rücksetzer sind je ein Griff und damit je ein Schritt. */
$('winkel').addEventListener('input', (ev) => {
  if (!S.vorlage) return;
  beginneStapel('Bild ausgerichtet', true);
  drehe(S.viertel, Number(ev.target.value), false);
});

$('drehung').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('button');
  if (!knopf || knopf.disabled || !S.vorlage) return;
  schliesseStapel();
  const vorher = zustandJetzt();
  if (knopf.dataset.dreh === 'null') {
    drehe(0, 0, true);
    merkeAusschnitt('Ausrichtung zurückgesetzt', vorher);
    return;
  }
  drehe(S.viertel + (knopf.dataset.dreh === 'links' ? -1 : 1), S.fein, true);
  merkeAusschnitt('Vierteldrehung', vorher);
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

$('referenz').addEventListener('change', (ev) => {
  referenzVonHand = true;
  setzeReferenz(ev.target.value || null);
});

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
  /* Auf der Bühne hängen allein die Rahmenlinien an den beiden Reglern.
     Sie wandern, der Zoom bleibt: Wer an der Größe dreht, will die Linien
     laufen sehen und nicht die Bühne unter der Hand springen haben. Ohne
     Rahmen ändert sich auf der Bühne gar nichts. */
  if (!quadrat() && S.rahmen) zeichne();
}

$('skala').addEventListener('input', (ev) => {
  S.skala = Number(ev.target.value);
  frischeGroesse();
});

$('korrektur').addEventListener('input', (ev) => {
  /* Drei Stellen, mehr trägt chars.js nicht. Ohne das Runden käme über
     die Schrittrechnung des Browsers eine vierte mit. */
  S.korrektur = Math.round(Number(ev.target.value) * 1000) / 1000;
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
/* Wie beim Zuschnitt gilt auch hier: Nach dem Warten steht in S womöglich
   schon eine andere Fassung. Die beiden Zahlen gehören zu der, für die
   der Knopf gedrückt wurde, und werden deshalb vorher festgehalten. */
$('skala-speichern').addEventListener('click', async () => {
  const ziel = S.ziel;
  const knopf = $('skala-speichern');
  if (!ziel) return;
  const skala = S.skala;
  const korrektur = S.korrektur;
  knopf.disabled = true;
  try {
    const antwort = await json('/api/skala', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datei: ziel.datei, skala, korrektur }),
    });
    ziel.skala = skala;
    ziel.korrektur = korrektur;
    frischerVerlauf(antwort.verlauf);
    if (S.ziel === ziel) vorschau();
    melde(skala === 1 && korrektur === 1
      ? `${ziel.datei} steht wieder auf der Standardgröße, chars.js führt die Datei nicht mehr.`
      : `Körpergröße ${skala.toFixed(2)}`
        + (korrektur === 1 ? '' : `, Bildkorrektur ${prozent(korrektur)}`)
        + ` für ${ziel.datei} in js/chars.js eingetragen.`);
  } catch (fehler) {
    melde('Größe nicht gesetzt: ' + fehler.message, true);
  } finally {
    /* Der Knopf ging vorher nur im Fehlerfall wieder auf. Nach einem
       geglückten Schreiben blieb er grau stehen, bis irgendetwas anderes
       die Anzeige neu aufbaute. Jetzt entscheidet wieder die Regel, die
       ihn ohnehin führt: offen, sobald die Regler von dem abweichen, was
       in chars.js steht. */
    knopf.disabled = false;
    frischeSkalaFelder();
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

$('freistellen').addEventListener('click', zeigeFrei);

$('frei-dialog').addEventListener('close', () => {
  if ($('frei-dialog').returnValue === 'ok') freistellen();
});

$('frei-modell').addEventListener('change', (ev) => {
  S.freiModell = ev.target.value;
  frischeFreiVorschau();
});

$('frei-feinschliff').addEventListener('change', (ev) => {
  S.feinschliff = ev.target.checked;
  frischeFreiVorschau();
});

$('frei-saum').addEventListener('input', (ev) => {
  S.saum = Number(ev.target.value);
  $('d-saum').textContent = S.saum.toFixed(2);
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
  /* Im Textbetrieb gehört die Zwischenablage den Feldern. Ein Bild
     hochzuladen gäbe es dort nichts, wohin. */
  if (texte()) return;
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
    /* Speichern heißt in jedem Bereich dasselbe: das, woran gerade
       gearbeitet wird, in die Dateien schreiben. Nur ist es hier ein
       Text und dort ein Bild. */
    if (texte()) texteSpeichern(); else speichern();
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

/* ---------- Embleme ----------

   Der einzige Bereich ohne Figuren. In der Liste stehen die Namen aus
   EMBLEM_ART in js/emblems.js, und zu jedem gehört eine Strecke aus drei
   Schritten:

     Vorlage        ein Bild mit flachem Grund, wie es hereinkommt
     Freigestellt   dasselbe mit Alphakanal, gerechnet ohne Modell
     Maske          512 auf 512, weiß, beschnitten, quadratisch gerahmt

   Der mittlere Schritt ist der, den man ansehen muss. Das Innere dieser
   Zeichen trägt denselben Schwarzwert wie ihr Grund, an der Farbe ist
   beides nicht zu unterscheiden. Ob das Innere zum Zeichen gehört oder
   nicht, sagt die Lesart, und welche stimmt, sieht man nur am Bild.

   Gerechnet wird beides in tools/emblems, nicht hier und auch nicht im
   Server: cutout-emblems.py stellt frei, build-emblems.py baut die
   Maske. Beide bleiben dort die maßgebliche Fassung, das Studio ruft sie
   nur auf. */

const ZEICHEN_ZUSTAND = {
  fertig: ['Maske gebaut', 'fertig'],
  alt: ['Vorlage liegt, Maske fehlt', 'alt'],
  fehlt: ['gezeichneter Umriss', 'fehlt'],
};

function zeichenZustand(z) {
  if (z.maske) return 'fertig';
  return z.vorlage ? 'alt' : 'fehlt';
}

/* Die Bilder der drei Schritte. Der Zeitstempel hängt hinten dran, sonst
   zeigte der Browser nach dem Bauen die alte Maske weiter. */
function zeichenVorlageUrl(z) {
  return z.vorlage
    ? `/datei/assets/emblems/source/${z.vorlage}?v=${Math.round(z.vorlageStand)}`
    : '';
}

function zeichenMaskeUrl(z) {
  return z.maske
    ? `/datei/assets/emblems/${z.name}.webp?v=${Math.round(z.maskeStand)}`
    : '';
}

async function ladeZeichen() {
  try {
    const daten = await json('/api/embleme');
    /* Nach dem Namen sortiert und nicht in der Reihenfolge, in der die
       Zeichen in js/emblems.js stehen. Dort stehen sie nach Zugehörigkeit
       beieinander, Iron Man bei War Machine, und das ist beim Lesen der
       Datei richtig. Wer hier ein bestimmtes Zeichen sucht, kennt aber
       nur seinen Namen und nicht seinen Platz in jener Liste.

       Einmal hier und nicht erst in der Liste: An dieser Reihenfolge
       hängen auch der Zähler, die Pfeiltasten und die Vorwahl über die
       Tastatur. */
    S.zeichen = daten.zeichen.slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
    baueZeichenListe();
    zeigeZaehler(true);
  } catch (fehler) {
    melde('Die Zeichen sind nicht zu lesen: ' + fehler.message, true);
  }
}

/* Der Stand kommt bei jedem Bauen mit zurück. Er ersetzt die Liste, ohne
   sie neu aufzubauen: Die Einträge behalten damit ihren Platz und ihr
   Aussehen, und nur die betroffenen Punkte und Bilder rücken nach. */
function frischeZeichen(neu) {
  if (!neu) return;
  const nachName = new Map(neu.map((z) => [z.name, z]));
  for (const alt of S.zeichen) {
    const frisch = nachName.get(alt.name);
    if (!frisch) continue;
    Object.assign(alt, frisch);
    const zustand = zeichenZustand(alt);
    if (alt._punkt) alt._punkt.className = 'punkt ' + zustand;
    if (alt._unten) alt._unten.textContent = ZEICHEN_ZUSTAND[zustand][0];
    if (alt._bild) {
      const url = zeichenMaskeUrl(alt) || zeichenVorlageUrl(alt);
      alt._bild.style.visibility = url ? '' : 'hidden';
      if (url) alt._bild.src = url;
    }
  }
  zeigeZaehler(false);
}

function baueZeichenListe() {
  const liste = $('liste');
  if (listenBlick) listenBlick.disconnect();
  vorwahlKnopf = null;
  liste.classList.toggle('belebt', !!listenBlick);
  liste.textContent = '';

  for (const z of S.zeichen) {
    const li = document.createElement('li');
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'eintrag eintrag-zeichen';
    knopf.dataset.zeichen = z.name;
    /* Vorwahl und Pfeiltasten gehen die Liste über „slug“ durch, egal was
       darin steht. Bei einem Zeichen ist der Name der Schlüssel. */
    z.slug = z.name;

    /* In der Liste steht die Maske, solange es eine gibt, sonst die
       Vorlage. So sieht man am Eintrag selbst, wie weit das Zeichen ist,
       und muss es nicht erst aufschlagen. */
    const bild = document.createElement('img');
    bild.loading = 'lazy';
    bild.alt = '';
    const url = zeichenMaskeUrl(z) || zeichenVorlageUrl(z);
    if (url) bild.src = url;
    else bild.style.visibility = 'hidden';
    bild.addEventListener('error', () => { bild.style.visibility = 'hidden'; });

    const text = document.createElement('span');
    text.className = 'eintrag-text';
    const name = document.createElement('span');
    name.className = 'eintrag-name';
    name.textContent = z.name;
    const unten = document.createElement('span');
    unten.className = 'eintrag-unten';
    unten.textContent = ZEICHEN_ZUSTAND[zeichenZustand(z)][0];
    text.append(name, unten);

    const punkt = document.createElement('span');
    punkt.className = 'punkt ' + zeichenZustand(z);

    knopf.append(bild, text, punkt);
    li.append(knopf);
    liste.append(li);

    z._knopf = knopf;
    z._bild = bild;
    z._punkt = punkt;
    z._unten = unten;
    /* Beobachtet wird der Knopf und nicht sein Listenelement: Die Klasse
       „sichtbar“, die der Beobachter setzt, gehört zu .eintrag, und ohne
       sie bleibt der Eintrag auf Deckkraft null stehen. */
    if (listenBlick) listenBlick.observe(knopf);
  }

  filtereZeichen();
}

function filtereZeichen() {
  const suche = S.suche.trim().toLowerCase();
  for (const z of S.zeichen) {
    const zustand = zeichenZustand(z);
    let passt = S.filter === 'alle'
      || (S.filter === 'offen' && zustand !== 'fertig')
      || (S.filter === 'fertig' && zustand === 'fertig')
      || (S.filter === 'fehlt' && zustand === 'fehlt');
    if (passt && suche) passt = z.name.includes(suche);
    z._knopf.parentElement.hidden = !passt;
  }
  frischeSchleier();
}

/* ---------- Ein Zeichen aufschlagen ---------- */

function zeigeLeerZeichen() {
  $('arbeit').hidden = true;
  $('leerzustand').hidden = false;
}

function waehleZeichen(name) {
  const z = S.zeichen.find((e) => e.name === name);
  if (!z) return;
  const gewechselt = S.zeichenWahl !== name;
  S.zeichenWahl = name;
  if (gewechselt) {
    /* Was freigestellt in der Schwebe hing, gehörte dem vorigen Zeichen.
       Es mit hinüberzunehmen, hieße es unter falschem Namen abzulegen. */
    S.zeichenRoh = null;
    S.zeichenFrei = null;
    S.zeichenErzwungen = false;
  }

  history.replaceState(null, '', '#' + MARKE.emblem + name);
  for (const e of S.zeichen) e._knopf.classList.toggle('an', e === z);
  setzeVorwahl(z, false);
  z._knopf.scrollIntoView({ block: 'nearest' });

  $('leerzustand').hidden = true;
  $('arbeit').hidden = false;
  zeigeZeichen();
}

function zeigeZeichen() {
  const z = S.zeichen.find((e) => e.name === S.zeichenWahl);
  if (!z) return;

  $('emblem-marke').textContent = z.name;

  /* Links steht, was hereinkommt: das eben Abgelegte, solange eines in
     der Schwebe hängt, sonst die abgelegte Vorlage. */
  const rohUrl = S.zeichenRoh ? `/upload/${S.zeichenRoh.id}` : zeichenVorlageUrl(z);
  setzeSchritt('vorlage', rohUrl, S.zeichenRoh
    ? 'eben abgelegt, noch nicht übernommen'
    : (z.vorlage ? 'assets/emblems/source/' + z.vorlage : ''));

  /* Der mittlere Schritt zeigt nur, was wirklich gerechnet wurde. Steht
     dort nichts, ist die Vorlage so abgelegt, wie sie kam, und der Knopf
     „Freistellen“ holt den Schritt nach. Vorher hier zu behaupten, sie
     trage ihren Alphakanal, wäre geraten: Nachgesehen hat niemand. */
  const frei = S.zeichenFrei;
  setzeSchritt('frei', frei ? `/upload/${frei.id}` : (S.zeichenRoh ? '' : rohUrl),
    frei
      ? `${frei.breite} × ${frei.hoehe}, ${Math.round(frei.deckend * 100)} % deckend`
        + (frei.erzwungen ? ', erzwungen' : '')
      : (S.zeichenRoh ? '' : (z.vorlage ? 'so abgelegt, nicht neu gerechnet' : '')));

  setzeSchritt('maske', zeichenMaskeUrl(z), z.maske ? '512 × 512' : '');

  /* Übernehmen gibt es nur, wenn etwas Freigestelltes dasteht. Freistellen
     und Neu bauen, sobald es überhaupt eine Vorlage gibt, gleich ob eben
     abgelegt oder längst da. */
  $('emblem-uebernehmen').disabled = !frei;
  $('emblem-freistellen').disabled = !S.zeichenRoh && !z.vorlage;
  $('emblem-bauen').disabled = !z.vorlage;
  $('emblem-weg').disabled = !z.vorlage && !z.maske;
  $('emblem-info').textContent = '';
}

function setzeSchritt(welcher, url, mass) {
  const bild = $('emblem-bild-' + welcher);
  const feld = bild.parentElement;
  bild.src = url || '';
  bild.hidden = !url;
  feld.querySelector('.emblem-leer').hidden = !!url;
  $('emblem-mass-' + welcher).textContent = mass || '';
}

/* ---------- Vorlage ablegen und freistellen ---------- */

async function zeichenVorlageNehmen(datei) {
  if (!S.zeichenWahl) return melde('Erst ein Zeichen wählen.', true);
  if (!datei || !datei.type.startsWith('image/')) {
    return melde('Das ist kein Bild.', true);
  }
  try {
    const antwort = await json('/api/upload', {
      method: 'POST',
      headers: { 'X-Dateiname': encodeURIComponent(datei.name || 'vorlage.png') },
      body: await datei.arrayBuffer(),
    });
    S.zeichenRoh = { id: antwort.id, name: antwort.name };
    S.zeichenFrei = null;
    zeigeZeichen();
    await zeichenFreistellen();
  } catch (fehler) {
    melde('Hochladen misslungen: ' + fehler.message, true);
  }
  return undefined;
}

/* Zwei Vorlagen kommen in Frage, und die eben abgelegte hat Vorrang:
   Sie ist die, die auf dem Weg ins Repo ist. Liegt keine in der Schwebe,
   gilt die, die schon unter assets/emblems/source steht. */
function zeichenQuelle() {
  if (S.zeichenRoh) return { typ: 'upload', id: S.zeichenRoh.id };
  const z = S.zeichen.find((e) => e.name === S.zeichenWahl);
  return z && z.vorlage ? { typ: 'emblem', name: z.name } : null;
}

/* erzwingen übergeht die Abfuhr „bringt schon einen Alphakanal mit“. Von
   allein wird nie erzwungen, denn eine gute Freistellung soll nicht ein
   zweites Mal gerechnet werden. Auf Knopfdruck immer: Wer ihn drückt,
   hat gesehen, dass die vorhandene nicht taugt. */
async function zeichenFreistellen(erzwingen) {
  const quelle = zeichenQuelle();
  if (!quelle) return;
  S.zeichenErzwungen = !!erzwingen;
  $('emblem-info').textContent = 'stellt frei …';
  try {
    S.zeichenFrei = await json('/api/emblem/freistellen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quelle, lesart: S.zeichenLesart, erzwingen: !!erzwingen,
      }),
    });
    zeigeZeichen();
    if (S.zeichenFrei.erzwungen) {
      $('emblem-info').textContent = 'Neu gerechnet, der mitgebrachte '
        + 'Alphakanal ist dabei weggefallen.';
    }
  } catch (fehler) {
    S.zeichenFrei = null;
    zeigeZeichen();
    /* Eine eben abgelegte Vorlage, die schon einen Alphakanal mitbringt,
       ist kein Fehlschlag: Sie geht so, wie sie ist, an den Bauer
       weiter. Wer sie trotzdem gerechnet haben will, drückt den Knopf. */
    if (/schon freigestellt/.test(fehler.message) && S.zeichenRoh) {
      S.zeichenFrei = { ...S.zeichenRoh, durchgereicht: true };
      $('emblem-uebernehmen').disabled = false;
      $('emblem-info').textContent = 'Die Vorlage bringt ihren Alphakanal '
        + 'schon mit und wird unverändert übernommen. „Freistellen“ rechnet '
        + 'sie trotzdem neu.';
      return;
    }
    melde('Freistellen misslungen: ' + fehler.message, true);
  }
}

async function zeichenUebernehmen() {
  const quelle = S.zeichenFrei || S.zeichenRoh;
  if (!S.zeichenWahl || !quelle) return;
  $('emblem-info').textContent = 'legt ab und baut …';
  try {
    const antwort = await json('/api/emblem/uebernehmen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: S.zeichenWahl,
        quelle: { typ: 'upload', id: quelle.id },
      }),
    });
    S.zeichenRoh = null;
    S.zeichenFrei = null;
    frischeZeichen(antwort.zeichen);
    zeigeZeichen();
    $('emblem-info').textContent = antwort.gesichert
      ? 'Gebaut. Die alte Vorlage liegt als ' + antwort.gesichert + ' in .sicherung.'
      : 'Gebaut.';
    melde('Maske für ' + S.zeichenWahl + ' gebaut.');
  } catch (fehler) {
    $('emblem-info').textContent = '';
    melde('Übernehmen misslungen: ' + fehler.message, true);
  }
  return undefined;
}

async function zeichenBauen(namen, wort) {
  $('emblem-info').textContent = 'baut …';
  try {
    const antwort = await json('/api/emblem/bauen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namen }),
    });
    frischeZeichen(antwort.zeichen);
    zeigeZeichen();
    const daneben = (antwort.misslungen || []).length;
    $('emblem-info').textContent = '';
    melde(`${antwort.gebaut.length} ${wort} gebaut`
      + (daneben ? `, ${daneben} nicht gegangen` : '') + '.', !!daneben);
  } catch (fehler) {
    $('emblem-info').textContent = '';
    melde('Bauen misslungen: ' + fehler.message, true);
  }
}

async function zeichenVorlageWeg() {
  const name = S.zeichenWahl;
  if (!name) return;
  if (!confirm(`Vorlage und Maske von „${name}“ entfernen?\n\n`
    + 'Beide wandern nach assets/emblems/.sicherung. Auf der Bühne steht '
    + 'danach wieder der gezeichnete Umriss aus js/emblems.js.')) return;
  try {
    const antwort = await json('/api/emblem/vorlage-weg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    S.zeichenRoh = null;
    S.zeichenFrei = null;
    frischeZeichen(antwort.zeichen);
    zeigeZeichen();
    melde(antwort.weg.length + ' Datei(en) entfernt, gesichert in .sicherung.');
  } catch (fehler) {
    melde('Entfernen misslungen: ' + fehler.message, true);
  }
  return undefined;
}

/* ---------- Bedienung ---------- */

$('liste').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('[data-zeichen]');
  if (knopf) waehleZeichen(knopf.dataset.zeichen);
});

$('emblem-hochladen').addEventListener('click', () => $('emblem-datei').click());
$('emblem-datei').addEventListener('change', (ev) => {
  const datei = ev.target.files && ev.target.files[0];
  if (datei) zeichenVorlageNehmen(datei);
  ev.target.value = '';
});

$('emblem-lesart').addEventListener('click', (ev) => {
  const knopf = ev.target.closest('[data-lesart]');
  if (!knopf || knopf.dataset.lesart === S.zeichenLesart) return;
  S.zeichenLesart = knopf.dataset.lesart;
  for (const k of $('emblem-lesart').querySelectorAll('[data-lesart]')) {
    k.classList.toggle('an', k === knopf);
  }
  /* Die Lesart ändert nur den mittleren Schritt. Gerechnet wird er neu,
     sobald überhaupt einer dasteht, und zwar so, wie er zuletzt lief. */
  if (S.zeichenRoh || S.zeichenFrei) zeichenFreistellen(S.zeichenErzwungen);
});

$('emblem-freistellen').addEventListener('click', () => zeichenFreistellen(true));
$('emblem-uebernehmen').addEventListener('click', zeichenUebernehmen);
$('emblem-bauen').addEventListener('click', () => zeichenBauen([S.zeichenWahl], 'Maske'));
$('emblem-alle').addEventListener('click', () => zeichenBauen([], 'Masken'));
$('emblem-weg').addEventListener('click', zeichenVorlageWeg);

/* Ablegen: über der Tafel, nicht nur über dem Feld. Wer ein Bild aus dem
   Dateimanager zieht, trifft die kleine Fläche sonst nur mit Mühe. */
const emblemAblage = $('emblem-ablage');
for (const art of ['dragenter', 'dragover']) {
  $('emblem-bank').addEventListener(art, (ev) => {
    if (!zeichen() || !S.zeichenWahl) return;
    ev.preventDefault();
    emblemAblage.classList.add('an');
  });
}
for (const art of ['dragleave', 'drop']) {
  $('emblem-bank').addEventListener(art, (ev) => {
    if (art === 'drop') ev.preventDefault();
    if (ev.relatedTarget && $('emblem-bank').contains(ev.relatedTarget)) return;
    emblemAblage.classList.remove('an');
  });
}
$('emblem-bank').addEventListener('drop', (ev) => {
  const datei = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
  if (datei) zeichenVorlageNehmen(datei);
});
