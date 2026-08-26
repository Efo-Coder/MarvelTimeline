/* Bild-Studio: lokaler Server für das Zuschneiden der Charakterbilder.

   Zwei Bereiche: die runden Porträts unter assets/characters/portraits
   und die Ganzkörperbilder unter assets/characters/fullsize. Der Aufbau
   ist derselbe, nur Ziel, Vorschlag und Zuschnitt unterscheiden sich.

   Aufruf
   ------
       node tools/portrait-studio/server.js
       node tools/portrait-studio/server.js --port 5000 --kein-browser

   Danach steht die Oberfläche unter http://127.0.0.1:4321. Der Server
   lauscht nur auf der Loopback-Adresse, er ist ein Werkzeug für diesen
   Rechner und nicht für das Netz gedacht.

   Woher die Figuren kommen
   ------------------------
   Aus js/data.js und js/chars.js, geladen in einem vm-Kontext wie in
   pending-portraits.js nebenan. Damit zählt genau das, was auch die Seite
   zeigt: der Slug aus charSlug() samt CHAR_ALIAS, die abweichenden
   Fassungen pro Film aus CHAR_LOOKS und die Ganzkörper-Fassungen aus
   FULLSIZE_LOOKS. Eine neue Figur in data.js taucht hier ohne weiteres
   Zutun auf, es gibt keine zweite gepflegte Liste.

   Ziel und Quelle
   ---------------
   Ein Ziel ist eine Porträtdatei unter assets/characters/portraits. Die
   meisten Figuren haben genau eine, wer laut CHAR_LOOKS je Film anders
   aussieht, hat mehrere. Eine Quelle ist das Bild, aus dem geschnitten
   wird: ein Ganzkörperbild aus assets/characters/fullsize oder eine
   hochgeladene Datei.

   Bildarbeit
   ----------
   Macht crop-image.py über Pillow, damit das Ergebnis Pixel für Pixel dem
   entspricht, was der Skill portraits liefert. Der Browser zeigt nur die
   Vorschau. Gespeichert wird erst auf Knopfdruck, die alte Datei wandert
   vorher nach .sicherung.

   Zwei Dinge macht nicht crop-image.py: Das Hochrechnen einer zu kleinen
   Vorlage übernimmt Real-ESRGAN, das Neuaufbauen der Gesichter danach
   GFPGAN oder CodeFormer. Beides steht in eigenen Abschnitten weiter
   unten, beides ist freiwillig und beides braucht Programme, die nicht
   im Repo liegen.
*/

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execFile, spawn } = require('child_process');

/* Der Studioordner: Oben liegen der Server und die beiden Dateien, die
   die Oberfläche tragen, index.html und studio.js. Darunter vier Ordner.

     ui-components/  Die eigenständigen Stücke der Oberfläche.
     styles/         Das Stilblatt.
     services/       Was der Server aufruft. Oben liegt, was beide
                     Bildarten bedient: crop-image.py schneidet zu,
                     remove-background.py nimmt den Hintergrund weg, und
                     facial-recognition/ baut Gesichter neu auf und holt
                     sich seine Modelle selbst. Darunter steht je ein
                     Ordner für die Skripte, die nur einen Bereich
                     angehen: fullsize/ schneidet die Ganzkörperbilder
                     randlos nach, biography/ holt die Steckbriefe aus
                     den Wikis und baut js/facts.js daraus.
     vendor/         Fremdes, hier nur Real-ESRGAN. Nicht im Repo, siehe
                     die .gitignore ganz oben.

   Was der Browser sieht, liegt unter demselben Weg wie auf der Platte,
   siehe SEITENDATEIEN weiter unten. */
const HIER = __dirname;
const BILD_SKRIPT = path.join(HIER, 'services', 'crop-image.py');
const REPO = path.dirname(path.dirname(HIER));
const PORTRAITS = path.join(REPO, 'assets', 'characters', 'portraits');
const FULLSIZE = path.join(REPO, 'assets', 'characters', 'fullsize');
const SICHERUNG = path.join(HIER, '.sicherung');
const OFFEN = path.join(HIER, 'offen.json');
const UPLOADS = path.join(os.tmpdir(), 'portrait-studio-uploads');
const URFASSUNGEN = path.join(os.tmpdir(), 'portrait-studio-urfassungen');

const argv = process.argv.slice(2);
const PORT = Number(wert('--port') || 4321);
const OEFFNEN = !argv.includes('--kein-browser');

function wert(flagge) {
  const i = argv.indexOf(flagge);
  return i === -1 ? null : argv[i + 1];
}

/* ---------- Python finden ----------

   Zuerst die Umgebung des Skills, dann eine eigene Angabe, dann was auf
   dem Pfad liegt. Gefunden ist sie erst, wenn crop-image.py damit auch
   durchläuft, ein blankes python.exe ohne Pillow nützt nichts. */
const PYTHON_KANDIDATEN = [
  process.env.PORTRAIT_PYTHON,
  path.join(os.homedir(), 'AppData', 'Local', 'mvp', 'Scripts', 'python.exe'),
  'python',
  'py',
].filter(Boolean);

let PYTHON = null;
let PYTHON_INFO = { ok: false, grund: 'noch nicht geprüft' };

function pythonSuchen() {
  return new Promise((fertig) => {
    let i = 0;
    const naechster = () => {
      if (i >= PYTHON_KANDIDATEN.length) {
        PYTHON_INFO = {
          ok: false,
          grund: 'Keine Python-Umgebung mit Pillow, numpy und OpenCV gefunden. '
            + 'Anlegen wie in .claude/skills/portraits/SKILL.md beschrieben, '
            + 'oder den Pfad über die Umgebungsvariable PORTRAIT_PYTHON setzen.',
        };
        return fertig();
      }
      const kandidat = PYTHON_KANDIDATEN[i++];
      execFile(kandidat, [BILD_SKRIPT, 'pruefen'],
        { timeout: 30000 }, (fehler, aus) => {
          if (fehler) return naechster();
          try {
            const info = JSON.parse(aus.trim().split('\n').pop());
            PYTHON = kandidat;
            PYTHON_INFO = { ok: true, ...info, pfad: kandidat };
            return fertig();
          } catch {
            return naechster();
          }
        });
    };
    naechster();
  });
}

function python(args) {
  return new Promise((fertig, scheitern) => {
    if (!PYTHON) return scheitern(new Error(PYTHON_INFO.grund));
    execFile(PYTHON, [BILD_SKRIPT, ...args],
      { timeout: 180000, maxBuffer: 8 * 1024 * 1024 }, (fehler, aus, err) => {
        const zeile = (aus || '').trim().split('\n').pop();
        let daten = null;
        try { daten = JSON.parse(zeile); } catch { /* gleich unten */ }
        if (daten && daten.fehler) return scheitern(new Error(daten.fehler));
        if (fehler) return scheitern(new Error((err || fehler.message).trim()));
        if (!daten) return scheitern(new Error('Unlesbare Antwort von crop-image.py: ' + zeile));
        fertig(daten);
      });
  });
}

/* ---------- Datenbank lesen ---------- */

const QUELLDATEIEN = ['js/data.js', 'js/chars.js', 'js/looks.js', 'js/profiles.js',
  'js/facts.js', 'js/powers.js'];

/* Wie die vier Dateien gerade dastehen: Zeitpunkt und Länge jeder
   einzelnen. Ändert eine sich, ändert sich diese Zeichenkette. */
function quellStand() {
  return QUELLDATEIEN.map((rel) => {
    try {
      const s = fs.statSync(path.join(REPO, rel));
      return `${rel}:${s.mtimeMs}:${s.size}`;
    } catch {
      return rel + ':-';
    }
  }).join('|');
}

/* Die Quelldateien zu lesen und auszuwerten sind eine halbe Million
   Zeichen JavaScript, und fast jede Anfrage braucht sie, manche mehrfach.
   Das Ergebnis wird deshalb gehalten, bis eine der Dateien sich rührt.
   Geschrieben werden sie ohnehin nur von hier oder von Hand, und beides
   rückt den Zeitpunkt weiter. */
let datenSpeicher = null;

function ladeDaten() {
  const stand = quellStand();
  if (datenSpeicher && datenSpeicher.stand === stand) return datenSpeicher.daten;

  const ctx = {};
  vm.createContext(ctx);
  /* Alle in einem Rutsch, denn const aus getrennten Läufen sieht der
     jeweils andere nicht. Die Zuweisung am Ende holt sie heraus.
     profiles.js und facts.js gehören dazu, seit das Studio auch die Texte
     einer Figur führt, looks.js seit dem Satz unter der Fassungstafel:
     Biografie, Steckbrief, Beziehungen, Beschreibung. */
  const src = [
    ...QUELLDATEIEN.map((rel) => fs.readFileSync(path.join(REPO, rel), 'utf8')),
    ';globalThis.OUT = { PHASES, CHAR_ALIAS, CHAR_LOOKS, FULLSIZE_LOOKS, FULLSIZE_STANDARD,'
      + ' FULLSIZE_SCALE, FULLSIZE_VARIANTS, lookVariants, lookVariantFile, lookVariantFiles,'
      + ' FULLSIZE_FIT, FULLSIZE_LIFT, FULLSIZE_NOTES, lookNote,'
      + ' CHAR_NO_IMAGE, CHAR_NO_PROFILE, CHAR_WORLDS,'
      + ' charSlug, splitName,'
      + ' ACTORS, BIOS, PROFILES, CHAR_FACTS, CHAR_FACTS_EXTRA, CHAR_BONDS,'
      + ' CHAR_POWERS };',
  ].join('\n');
  vm.runInContext(src, ctx, { filename: 'daten.js' });
  datenSpeicher = { stand, daten: ctx.OUT };
  return ctx.OUT;
}

/* Hat die Datei einen Alphakanal? null, wenn es kein WebP ist. Gleiche
   Prüfung wie in pending-portraits.js nebenan: Die neuen Porträts sind
   freigestellt, die alten aus dem Wiki sind deckend. */
function alphaLesen(datei) {
  let fd;
  try {
    const kopf = Buffer.alloc(30);
    fd = fs.openSync(datei, 'r');
    const gelesen = fs.readSync(fd, kopf, 0, 30, 0);
    if (gelesen < 30) return null;
    if (kopf.toString('ascii', 0, 4) !== 'RIFF') return null;
    if (kopf.toString('ascii', 8, 12) !== 'WEBP') return null;
    const chunk = kopf.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return (kopf[20] & 0x10) !== 0;
    if (chunk === 'VP8L') return (kopf[24] & 0x10) !== 0;
    return false;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/* Die Antwort je Datei, gehalten bis der Server ein Bild anfasst.

   Vierhundert Porträts einzeln zu öffnen kostete gemessen achtzig
   Millisekunden, und baueFiguren() tat das bei jeder Anfrage. Auch die
   billigere Frage nach Zeitpunkt und Länge kostet noch, wenn sie
   vierhundertmal gestellt wird und die Dateien auf einem Laufwerk liegen,
   über dem ein Abgleichdienst sitzt.

   Deshalb wird gar nicht mehr gefragt. Wer ein Bild schreibt, sagt
   Bescheid, siehe bilderVergessen(); ein Bild, das von außen dazukommt
   oder verschwindet, rückt den Zeitpunkt seines Ordners weiter und
   räumt den Speicher damit ebenfalls. Nur ein Bild, das außerhalb des
   Studios an Ort und Stelle überschrieben wird, bliebe hier auf seinem
   alten Wert stehen – bis zum nächsten Eingriff im Studio oder zum
   Neustart. */
const alphaSpeicher = new Map();   // Pfad -> Alpha, oder null

function hatAlpha(datei) {
  if (alphaSpeicher.has(datei)) return alphaSpeicher.get(datei);
  const alpha = alphaLesen(datei);
  alphaSpeicher.set(datei, alpha);
  return alpha;
}

/* ---------- Von Hand als offen markiert ----------

   Ein Bild kann fertig aussehen und trotzdem nicht gut sein. Diese Liste
   hält fest, was noch einmal gemacht werden soll. Sie steht in
   offen.json neben dieser Datei, die Porträts daraus liest auch
   pending-portraits.js.

   Porträts und Ganzkörperbilder stehen in getrennten Listen, denn beide
   heißen gleich: thor ist ein Porträt und ein Ganzkörperbild. */
const FELD = { portrait: 'offen', ganzkoerper: 'offenGanzkoerper' };

function ladeMarkiert(bereich) {
  try {
    const daten = JSON.parse(fs.readFileSync(OFFEN, 'utf8'));
    return new Set(daten[FELD[bereich] || FELD.portrait] || []);
  } catch {
    return new Set();
  }
}

function speichereMarkiert(bereich, menge) {
  let daten = {};
  try { daten = JSON.parse(fs.readFileSync(OFFEN, 'utf8')); } catch { /* neu anlegen */ }
  daten[FELD[bereich] || FELD.portrait] = [...menge].sort((a, b) => a.localeCompare(b, 'de'));
  if (!daten.offen) daten.offen = [];
  if (!daten.offenGanzkoerper) daten.offenGanzkoerper = [];
  fs.writeFileSync(OFFEN, JSON.stringify(daten, null, 2) + '\n', 'utf8');
}

function webpListe(ordner) {
  try {
    return fs.readdirSync(ordner)
      .filter((f) => f.toLowerCase().endsWith('.webp'))
      .map((f) => f.slice(0, -5));
  } catch {
    return [];
  }
}

/* ---------- Welche Bilder es gibt ----------

   Ob eine Datei da ist, wurde bisher je Datei gefragt. Bei elfhundert
   Fassungen und Zielen sind das elfhundert Einzelfragen ans
   Dateisystem, gemessen einhundertfünfzig Millisekunden, und
   baueFiguren() stellte sie bei jeder Anfrage neu.

   Ein Verzeichnis auf einmal zu lesen kostet dagegen eine Millisekunde.
   Gehalten wird das Ergebnis, bis der Ordner sich rührt: Anlegen,
   Löschen und Umbenennen rücken seinen Zeitpunkt weiter, und was der
   Server selbst schreibt, meldet er über bilderVergessen(). */
const ordnerSpeicher = new Map();   // Ordner -> { stand, menge }

function ordnerStand(ordner) {
  try { return String(fs.statSync(ordner).mtimeMs); } catch { return '-'; }
}

function bilderDa(ordner) {
  const stand = ordnerStand(ordner);
  const gemerkt = ordnerSpeicher.get(ordner);
  if (gemerkt && gemerkt.stand === stand) return gemerkt.menge;
  const menge = new Set(webpListe(ordner));
  ordnerSpeicher.set(ordner, { stand, menge });
  /* Der Ordner hat sich gerührt: Was darin steht, kann anders sein als
     beim letzten Blick, also gilt auch der Alphakanal nicht mehr. */
  alphaSpeicher.clear();
  return menge;
}

/* Nach jedem eigenen Schreiben an einem Bild. Ein überschriebenes Bild
   rückt den Zeitpunkt des Ordners nicht weiter, und ein neu angelegtes
   tut es auf manchen Dateisystemen erst mit Verzögerung. Wer schreibt,
   weiß es dagegen sicher. */
function bilderVergessen() {
  ordnerSpeicher.clear();
  alphaSpeicher.clear();
  figurenSpeicher = null;
}

/* Beschriftung einer Fassung: der gepflegte Name aus FULLSIZE_LOOKS, sonst
   der Zusatz aus dem Dateinamen in lesbar. */
function beschriftung(datei, slug, namen) {
  if (datei === slug) return 'Standard';
  if (namen.has(datei)) return namen.get(datei);
  const zusatz = datei.slice(slug.length + 1).replace(/-/g, ' ');
  return zusatz.charAt(0).toUpperCase() + zusatz.slice(1);
}

/* Ein Porträt ist fertig, wenn es freigestellt ist. Die alten aus dem
   Fandom-Wiki sind deckend. */
function zustand(datei) {
  if (!bilderDa(PORTRAITS).has(datei)) return 'fehlt';
  return hatAlpha(path.join(PORTRAITS, datei + '.webp')) ? 'fertig' : 'alt';
}

/* Bei den Ganzkörperbildern gibt es die Unterscheidung nicht: Was da ist,
   ist freigestellt. Offen ist, was fehlt oder von Hand markiert wurde. */
function zustandGk(datei) {
  return bilderDa(FULLSIZE).has(datei) ? 'fertig' : 'fehlt';
}

/* Wie weit die Texte einer Figur gediehen sind. Die Liste im Studio malt
   daraus ihren Punkt, ohne für jede Figur die Texte selbst zu holen:
   Zahlen reichen, der Wortlaut nicht.

   „fertig“ heißt hier nicht vollständig im Sinne des Wikis, sondern
   brauchbar für die Charakterseite: eine Biografie mit genug Abschnitten,
   die Kurzfassung für die Timeline und ein Steckbrief, der über das
   hinausgeht, was der Wiki-Abruf von allein findet. */
const BIO_ABSCHNITTE = 6;         // ab hier gilt eine Biografie als ausgeführt

function texteStand(D, slug) {
  const profil = D.PROFILES[slug] || [];
  const wiki = D.CHAR_FACTS[slug] || {};
  const hand = D.CHAR_FACTS_EXTRA[slug] || {};
  const facts = { ...wiki, ...hand };
  const stand = {
    abschnitte: profil.length,
    kurz: !!D.BIOS[slug],
    felder: FACT_FELDER.filter((f) => {
      const wert = facts[f];
      return Array.isArray(wert) ? wert.length > 0 : !!wert;
    }).length,
    kraefte: (D.CHAR_POWERS[slug] || []).length > 0,
    bonds: (D.CHAR_BONDS[slug] || []).length,
    besetzung: !!D.ACTORS[slug],
  };
  if (!stand.abschnitte) stand.zustand = 'fehlt';
  else if (stand.abschnitte < BIO_ABSCHNITTE || !stand.kurz || !stand.kraefte) {
    stand.zustand = 'alt';
  } else stand.zustand = 'fertig';
  return stand;
}

/* ---------- Wem eine Bilddatei gehört ----------

   Die Bilder einer Figur heißen wie ihr Schlüssel, ihre weiteren
   Fassungen tragen ihn als Präfix: gamora, gamora-kid,
   gamora-guardians-of-the-galaxy-vol-2. Das Präfix allein reicht als
   Regel aber nicht, denn manche Varianten sind eigene Figuren mit
   eigenem Schlüssel, eigenen Auftritten und eigenen Texten.
   „gamora-2014“ ist keine Fassung von „gamora“, sondern die Gamora von
   2014, und „nakia-bahadir“ hat mit der Nakia aus Wakanda nichts gemein
   als die ersten fünf Buchstaben.

   Eine Datei gehört deshalb der Figur mit dem längsten Schlüssel, der
   auf sie passt. „gamora-2014-avengers-endgame“ trifft „gamora“ und
   „gamora-2014“, und die zweite gewinnt. Betroffen sind im Bestand
   christine-palmer, corvus-glaive, cull-obsidian, ebony-maw, gamora,
   karl-mordo, maria-rambeau, nakia, peggy-carter und peter-parker.

   Ohne diese Regel führt die eine Figur die Bilder der anderen mit auf:
   Ein neues Bild für Gamora 2014 stünde dann auch in Gamoras
   Fassungsleiste, und eine Umbenennung nähme es mit. */
function fremdeSchluessel(slug, alleSlugs) {
  return alleSlugs.filter((s) => s !== slug && s.length > slug.length
    && s.startsWith(slug + '-'));
}

/* Der Test „gehört diese Datei zu <slug>?“, fertig gebunden. */
function eigeneDateien(slug, alleSlugs) {
  const fremde = fremdeSchluessel(slug, alleSlugs);
  return (datei) => passtZuPraefix(datei, [slug]) && !passtZuPraefix(datei, fremde);
}

/* ---------- Alle Figuren ----------

   Die Liste ist die Grundlage fast jeder Anfrage, und manche Anfrage
   braucht sie mehrfach: /api/fassung baute sie dreimal, einmal für die
   Prüfung der Figur, einmal für die des Ziels und einmal für die Zähler.
   Gemessen kostete jeder Aufbau vierhundert Millisekunden, und der
   Server steht in dieser Zeit still. Ein Umbenennen brauchte damit
   allein im Backend über eine Sekunde, bevor irgendetwas geschrieben
   war.

   Gehalten wird das Ergebnis deshalb, bis sich etwas rührt, woraus es
   entsteht: die Quelldateien, die beiden Bildordner und die Liste der
   von Hand markierten Bilder. Alle drei kosten zusammen einen
   Bruchteil einer Millisekunde zu prüfen. Was der Server selbst
   schreibt, wirft den Speicher über bilderVergessen() weg, denn ein
   überschriebenes Bild rührt keinen der drei Zeitpunkte an. */
let figurenSpeicher = null;

function figurenStand() {
  return quellStand()
    + '|' + ordnerStand(PORTRAITS) + '|' + ordnerStand(FULLSIZE)
    + '|' + (() => { try { return fs.statSync(OFFEN).mtimeMs; } catch { return '-'; } })();
}

function baueFiguren() {
  const stand = figurenStand();
  if (figurenSpeicher && figurenSpeicher.stand === stand) return figurenSpeicher.figuren;
  const figuren = figurenAufbauen();
  figurenSpeicher = { stand, figuren };
  return figuren;
}

function figurenAufbauen() {
  const D = ladeDaten();
  const vorhanden = bilderDa(FULLSIZE);
  const markiert = ladeMarkiert('portrait');
  const markiertGk = ladeMarkiert('ganzkoerper');

  /* Dateiname -> Beschriftung, aus allen Ganzkörper-Fassungen. */
  const namen = new Map();
  for (const liste of Object.values(D.FULLSIZE_LOOKS)) {
    for (const [label, datei] of liste) namen.set(datei, label);
  }

  const figuren = new Map();
  for (const phase of D.PHASES) {
    for (const film of phase.movies) {
      for (const name of film.characters || []) {
        if (D.CHAR_NO_PROFILE.has(name)) continue;
        const slug = D.charSlug(name);
        let figur = figuren.get(slug);
        if (!figur) {
          figuren.set(slug, figur = {
            slug, namen: [], filme: [], filmSlugs: [], ziele: new Map(),
          });
        }
        if (!figur.namen.includes(name)) figur.namen.push(name);
        if (!figur.filme.includes(film.title)) figur.filme.push(film.title);
        if (!figur.filmSlugs.includes(film.slug)) figur.filmSlugs.push(film.slug);
        if (D.CHAR_NO_IMAGE.has(name)) continue;
        const datei = (D.CHAR_LOOKS[slug] && D.CHAR_LOOKS[slug][film.slug]) || slug;
        let ziel = figur.ziele.get(datei);
        if (!ziel) figur.ziele.set(datei, ziel = { datei, filme: [] });
        if (!ziel.filme.includes(film.title)) ziel.filme.push(film.title);
      }
    }
  }

  const alleSlugs = [...figuren.keys()];
  const liste = [];
  for (const figur of figuren.values()) {
    const { slug } = figur;
    /* Was im Ordner nach dieser Figur benannt ist, einer anderen aber
       gehört, bleibt draußen: siehe eigeneDateien(). */
    const meine = eigeneDateien(slug, alleSlugs);
    /* Der ausführlichste gepflegte Name trägt die Rolle, „Realname /
       Heldenname“ wird für Überschrift und Rollenzeile getrennt. */
    const voll = [...figur.namen].sort((a, b) => b.length - a.length)[0];
    /* Die Welt steckt als Klammer im Namen und kommt hier als eigene
       Angabe heraus, sonst hinge sie im Studio am Realnamen fest. */
    const { real, role, world } = D.splitName(voll);

    /* Die Zeile, die auf der Charakterseite groß über der Kachel steht:
       alle Heldennamen dieser Figur, sonst der bürgerliche. Sie ist
       zugleich der Schlüssel, nach dem dort sortiert wird, und deshalb
       auch hier. Beide Listen lesen sich damit gleich, und wer eine Figur
       auf der Seite an einer Stelle sucht, findet sie im Studio an
       derselben. Gebaut wird sie wortgleich wie in js/characters.js. */
    const rollen = [];
    for (const name of figur.namen) {
      const r = D.splitName(name).role;
      if (r && !rollen.includes(r)) rollen.push(r);
    }
    const ueberschrift = rollen.length ? rollen.join(' · ') : real;

    /* Die Ganzkörper-Fassungen dieser Figur: die gepflegten aus
       FULLSIZE_LOOKS zuerst, danach alles, was im Ordner sonst noch nach
       ihr benannt ist. Anders als bei den Quellen zählen hier auch
       Fassungen ohne Datei, die sind ja gerade das, was noch fehlt. */
    const inLooks = !!D.FULLSIZE_LOOKS[slug];

    /* Zu jeder Fassung gehört der Film, aus dem sie stammt. Bei Figuren
       mit Fassungsliste steht er als dritter Wert im Eintrag, bei Figuren
       mit nur einem Bild in FULLSIZE_STANDARD. Wer nur in einem Titel
       vorkommt, braucht auch dort nichts: Dann kann das Bild aus keinem
       anderen sein, das rechnet die Charakterseite selbst aus
       (standardFilm() in js/characters.js). */
    const filmAuto = figur.filmSlugs.length === 1 ? figur.filmSlugs[0] : '';
    const gepflegt = D.FULLSIZE_LOOKS[slug]
      || [['Standard', slug, D.FULLSIZE_STANDARD[slug] || '']];
    const ganzkoerper = [];
    const quellen = [];
    const gesehen = new Set();
    /* „gepflegt“ heißt: Die Fassung steht in FULLSIZE_LOOKS und lässt sich
       dort umbenennen, verschieben und löschen. Alles andere ist nur eine
       Datei im Ordner.

       Eine Fassung mit Varianten liegt in mehreren Dateien
       (FULLSIZE_VARIANTS in js/chars.js). In der Liste steht jede von
       ihnen einzeln: Bearbeitet wird immer ein Bild, nicht eine Fassung.
       Zusammen gehören sie über „stamm“, und die Oberfläche macht daraus
       einen Chip mit den Schaltern 1, 2, 3. */
    const merke = (stamm, label, gefuehrt, film) => {
      if (gesehen.has(stamm)) return;
      gesehen.add(stamm);
      const anzahl = D.lookVariants(stamm);
      for (const datei of D.lookVariantFiles(stamm)) {
        gesehen.add(datei);
        const nr = anzahl > 1 ? Number(datei.slice(stamm.length + 1)) : 1;
        /* „label“ ist die Fassung, „labelBild“ das einzelne Bild. Wo
           eine Liste Dateien aufzählt – Vorlagen, Schablonen –, stünde
           die Fassung sonst drei Mal gleich da. */
        const labelBild = anzahl > 1 ? `${label} ${nr}` : label;
        ganzkoerper.push({
          datei,
          stamm,
          variante: nr,
          varianten: anzahl,
          label,
          labelBild,
          film: film || '',
          gepflegt: gefuehrt,
          zustand: zustandGk(datei),
          markiert: markiertGk.has(datei),
          skala: D.FULLSIZE_SCALE[datei] || 1,
          korrektur: D.FULLSIZE_FIT[datei] || 1,
          schwebe: D.FULLSIZE_LIFT[datei] || 0,
          /* Der Satz, den die Charakterseite unter die Fassungstafel
             schreibt. Er gehört der Fassung und steht deshalb unter ihrem
             Stamm. Nur wo zu einer einzelnen Aufnahme etwas Eigenes
             vermerkt ist, gilt das (FULLSIZE_NOTES in js/looks.js). */
          beschreibung: D.FULLSIZE_NOTES[datei] || D.FULLSIZE_NOTES[stamm] || '',
          beschreibungEigen: datei !== stamm && !!D.FULLSIZE_NOTES[datei],
        });
        if (vorhanden.has(datei)) quellen.push({ datei, label: labelBild });
      }
    };
    for (const [label, datei, film] of gepflegt) merke(datei, label, inLooks, film);
    /* Von einer Fassung mit Varianten liegt der Stamm selbst gar nicht
       mehr im Ordner, dort stehen nur seine Nummern. Solange die Fassung
       in FULLSIZE_LOOKS steht, hat merke() sie oben schon
       zusammengefasst. Fehlt sie dort, weiß allein FULLSIZE_VARIANTS um
       die Zusammengehörigkeit, und ohne diesen Griff stünde jede Nummer
       als eigene Fassung in der Liste: „Variante +“ an einer Fassung, die
       bisher nur eine Datei im Ordner war, ließ sie auseinanderfallen.

       Die Nummer zählt nur als solche, wenn ihr Stamm wirklich in
       FULLSIZE_VARIANTS steht. Eine Fassung, die von sich aus auf eine
       Ziffer endet, bleibt damit, was sie ist. */
    for (const datei of vorhanden) {
      if (!meine(datei)) continue;
      const teil = /^(.+)-([1-9])$/.exec(datei);
      const stamm = teil && D.lookVariants(teil[1]) > 1 ? teil[1] : datei;
      merke(stamm, beschriftung(stamm, slug, namen), false, '');
    }

    const ziele = [...figur.ziele.values()].map((z) => ({
      datei: z.datei,
      label: beschriftung(z.datei, slug, namen),
      filme: z.filme,
      zustand: zustand(z.datei),
      markiert: markiert.has(z.datei),
    }));

    liste.push({
      slug,
      name: real,
      ueberschrift,
      rolle: role,
      welt: world,
      /* Die Namen, wie sie in data.js stehen, und der Alias, der daraus
         den Schlüssel macht. Beides lässt sich im Studio ändern. */
      namen: figur.namen,
      alias: figur.namen.map((n) => D.CHAR_ALIAS[n] || null),
      auftritte: figur.filme.length,
      filme: figur.filme,
      filmSlugs: figur.filmSlugs,
      /* Der Film, den die Charakterseite auch ohne Eintrag kennt. */
      filmAuto,
      ziele,
      ganzkoerper,
      quellen,
      texte: texteStand(D, slug),
    });
  }

  /* Wie auf der Charakterseite: nach der Zeile, die oben steht. */
  liste.sort((a, b) => a.ueberschrift.localeCompare(b.ueberschrift, 'de'));
  return liste;
}

/* Die vier Fächer schließen sich aus: Ohne Datei zählt nichts anderes,
   ein deckendes Bild ist ohnehin alt, und erst ein freigestelltes Bild
   kann von Hand als offen markiert sein. */
function zaehlen(figuren) {
  const z = { gesamt: 0, fertig: 0, alt: 0, fehlt: 0, markiert: 0, ohneQuelle: 0 };
  const gk = { gesamt: 0, fertig: 0, alt: 0, fehlt: 0, markiert: 0 };
  /* Bei den Texten zählt die Figur, nicht die Datei: Jede hat genau eine
     Biografie und genau einen Steckbrief. */
  const bio = { gesamt: figuren.length, fertig: 0, alt: 0, fehlt: 0, kurz: 0, kraefte: 0 };
  for (const figur of figuren) {
    bio[figur.texte.zustand] += 1;
    if (figur.texte.kurz) bio.kurz += 1;
    if (figur.texte.kraefte) bio.kraefte += 1;
    if (!figur.quellen.length) z.ohneQuelle += 1;
    for (const ziel of figur.ziele) {
      z.gesamt += 1;
      if (ziel.zustand !== 'fertig') z[ziel.zustand] += 1;
      else if (ziel.markiert) z.markiert += 1;
      else z.fertig += 1;
    }
    for (const ziel of figur.ganzkoerper) {
      gk.gesamt += 1;
      if (ziel.zustand !== 'fertig') gk[ziel.zustand] += 1;
      else if (ziel.markiert) gk.markiert += 1;
      else gk.fertig += 1;
    }
  }
  z.gk = gk;
  z.bio = bio;
  return z;
}

/* ---------- Körpergröße im Rahmen ----------

   FULLSIZE_SCALE in js/chars.js trägt nach, wie groß eine Figur im
   Rahmen der Charakterseite steht, FULLSIZE_FIT daneben, wie weit die
   einzelne Datei davon abweicht. 1.0 ist bei beiden der Normalfall und
   steht nicht in der Liste, deshalb nimmt dieser Wert den Eintrag wieder
   heraus. Geschrieben wird zeilenweise in den bestehenden Block, damit
   Kommentare, Gruppen und Reihenfolge erhalten bleiben.

   Vor dem Schreiben wird die neue Fassung geprüft: Sie muss sich laden
   lassen und die erwarteten Werte tragen. Sonst bleibt die alte stehen. */
const CHARS = path.join(REPO, 'js', 'chars.js');
/* Die Fähigkeiten liegen für sich, das Studio schreibt sie nicht. Beim
   Löschen einer Figur muss ihr Eintrag trotzdem mit weg, sonst bliebe er
   als Waise stehen. */
const POWERS = path.join(REPO, 'js', 'powers.js');

/* Die Sätze zu den Fassungen liegen für sich in js/looks.js: ein Satz je
   Ganzkörper-Fassung, geschlüsselt nach ihrem Dateinamen. Die
   Charakterseite schreibt ihn unter die Fassungstafel. */
const LOOKS = path.join(REPO, 'js', 'looks.js');

/* Die Dateien im Repo tragen CRLF. Beim Zerlegen fällt der Wagenrücklauf
   weg und beim Zusammensetzen wieder an, sonst mischt eine neue Zeile die
   Zeilenenden. */
const bruchVon = (quelle) => (quelle.includes('\r\n') ? '\r\n' : '\n');

function zahl(wert) {
  return String(Math.round(wert * 100) / 100);
}

/* Zwei Nachkommastellen, mehr trägt weder der Regler noch chars.js. */
const runde = (wert) => Math.round(Number(wert) * 100) / 100;

/* Die Schwebe ist gemessen und nicht geregelt, und sie steht im Nenner:
   Bei 0.9 wären zwei Stellen schon ein Zehntel Größe. Deshalb hier drei. */
const runde3 = (wert) => Math.round(Number(wert) * 1000) / 1000;
const zahl3 = (wert) => String(runde3(wert));

/* Der Winkel, mit dem die Bühne ihre Vorlage ausrichtet. Was keine Zahl
   ist, ist keine Drehung: Ein NaN käme sonst als Zeichenkette bei
   crop-image.py an und legte den Zuschnitt lahm. */
function grad(wert) {
  const zahlWert = Number(wert);
  if (!Number.isFinite(zahlWert)) return 0;
  return Math.max(-180, Math.min(180, Math.round(zahlWert * 100) / 100));
}

const WERT_ZEILE = /^\s*'([^']+)':\s*([0-9.]+),/;

/* Der Inhalt einer Tabelle als Zeilen, dazu die Stellen, zwischen denen
   er in der Quelle steht. Beides zusammen ergibt wieder die Datei.

   „wo“ steht nur in der Fehlermeldung. Dieselbe Zerlegung trägt auch die
   Texte, und die stehen in drei anderen Dateien. */
function blockVon(quelle, name, wo = 'js/chars.js') {
  const anfang = quelle.indexOf(`const ${name} = {`);
  if (anfang === -1) throw new Error(`${name} steht nicht in ${wo}.`);
  const kopf = quelle.indexOf('\n', anfang) + 1;
  /* Eine leere Tabelle trägt ihren Abschluss direkt hinter dem Kopf. Von
     kopf an gesucht fände die Suche ihn nicht mehr, sondern erst den der
     nächsten Tabelle, deshalb setzt sie eine Zeile früher an. */
  let ende = quelle.indexOf('\n};', kopf - 1);
  if (ende === -1) throw new Error(`Das Ende von ${name} ist nicht zu finden.`);
  if (ende > 0 && quelle[ende - 1] === '\r') ende -= 1;   // Bruch gehört zum Rest
  return { kopf, ende, zeilen: ende <= kopf ? [] : quelle.slice(kopf, ende).split(/\r?\n/) };
}

function mitBlock(quelle, block, zeilen) {
  const bruch = bruchVon(quelle);
  /* Ohne Zeilen bleibt auch der Bruch hinter dem Kopf weg, sonst stünde
     in der leeren Tabelle eine Leerzeile. */
  if (!zeilen.length) return quelle.slice(0, block.kopf - bruch.length) + quelle.slice(block.ende);
  return quelle.slice(0, block.kopf) + zeilen.join(bruch) + quelle.slice(block.ende);
}

function neueSkalaQuelle(quelle, datei, skala) {
  const block = blockVon(quelle, 'FULLSIZE_SCALE');
  const { zeilen } = block;
  const vorhanden = zeilen.findIndex((z) => {
    const t = WERT_ZEILE.exec(z);
    return t && t[1] === datei;
  });

  /* Der Block ist in drei kommentierte Gruppen geteilt. In welcher eine
     Zeile steht, sagt der letzte Kommentar über ihr. */
  const GRUPPEN = [['Deutlich kleiner', 'klein'], ['Deutlich größer', 'gross'],
    ['Jenseits jeder Skala', 'anschlag']];
  const gruppeBei = (index) => {
    let gefunden = null;
    for (let i = 0; i <= index && i < zeilen.length; i++) {
      for (const [text, name] of GRUPPEN) if (zeilen[i].includes(text)) gefunden = name;
    }
    return gefunden;
  };

  /* Innerhalb der Gruppe aufsteigend einsortieren. */
  const einsortieren = () => {
    const [text] = GRUPPEN.find(([, name]) => name === (skala < 1 ? 'klein' : 'gross'));
    let stelle = zeilen.findIndex((z) => z.includes(text));
    stelle = stelle === -1 ? zeilen.length : stelle + 1;
    while (stelle < zeilen.length) {
      const t = WERT_ZEILE.exec(zeilen[stelle]);
      if (!t) break;                                // Leerzeile oder neue Gruppe
      if (parseFloat(t[2]) > skala) break;
      stelle += 1;
    }
    zeilen.splice(stelle, 0, `  '${datei}': ${zahl(skala)},`);
  };

  if (skala === 1) {
    if (vorhanden === -1) return null;              // war schon Standard
    zeilen.splice(vorhanden, 1);
  } else if (vorhanden !== -1) {
    /* Wechselt der Wert die Größenklasse, wandert der Eintrag mit. Wer am
       oberen Anschlag steht, bleibt dort. */
    const jetzt = gruppeBei(vorhanden);
    const soll = skala < 1 ? 'klein' : 'gross';
    if (jetzt === soll || (jetzt === 'anschlag' && skala >= 1.2)) {
      zeilen[vorhanden] = `  '${datei}': ${zahl(skala)},`;
    } else {
      zeilen.splice(vorhanden, 1);
      einsortieren();
    }
  } else {
    einsortieren();
  }
  return mitBlock(quelle, block, zeilen);
}

/* FULLSIZE_FIT ist eine flache Liste: keine Gruppen, keine Leerzeilen,
   nach Dateinamen sortiert. Der Wert sagt nichts über die Figur, nach
   Größe zu ordnen brächte hier also nichts. */
function neueKorrekturQuelle(quelle, datei, korrektur) {
  const block = blockVon(quelle, 'FULLSIZE_FIT');
  const zeilen = block.zeilen.filter((z) => z.trim() !== '');
  const vorhanden = zeilen.findIndex((z) => {
    const t = WERT_ZEILE.exec(z);
    return t && t[1] === datei;
  });
  const zeile = `  '${datei}': ${zahl(korrektur)},`;

  if (korrektur === 1) {
    if (vorhanden === -1) return null;              // war schon Standard
    zeilen.splice(vorhanden, 1);
  } else if (vorhanden !== -1) {
    zeilen[vorhanden] = zeile;
  } else {
    let stelle = zeilen.findIndex((z) => {
      const t = WERT_ZEILE.exec(z);
      return t && t[1].localeCompare(datei, 'de') > 0;
    });
    if (stelle === -1) stelle = zeilen.length;
    zeilen.splice(stelle, 0, zeile);
  }
  return mitBlock(quelle, block, zeilen);
}

/* FULLSIZE_LIFT ist wie FULLSIZE_FIT eine flache Liste nach Dateinamen.
   Der Wert sagt, welcher Anteil der Datei unter der Figur leer ist, weil
   sie fliegt. 0 ist der Normalfall und steht nicht darin, dieser Wert
   nimmt den Eintrag also wieder heraus.

   Gemessen wird die Zahl im Studio an den durchsichtigen Pixeln der
   Datei. Sie gehört deshalb zum Bild und wird nur zusammen mit ihm
   geschrieben, nie vom Knopf „In chars.js schreiben“ allein. */
function neueSchwebeQuelle(quelle, datei, schwebe) {
  const block = blockVon(quelle, 'FULLSIZE_LIFT');
  const zeilen = block.zeilen.filter((z) => z.trim() !== '');
  const vorhanden = zeilen.findIndex((z) => {
    const t = WERT_ZEILE.exec(z);
    return t && t[1] === datei;
  });
  const zeile = `  '${datei}': ${zahl3(schwebe)},`;

  if (schwebe === 0) {
    if (vorhanden === -1) return null;              // stand schon auf der Bodenlinie
    zeilen.splice(vorhanden, 1);
  } else if (vorhanden !== -1) {
    if (zeilen[vorhanden] === zeile) return null;   // steht schon so da
    zeilen[vorhanden] = zeile;
  } else {
    let stelle = zeilen.findIndex((z) => {
      const t = WERT_ZEILE.exec(z);
      return t && t[1].localeCompare(datei, 'de') > 0;
    });
    if (stelle === -1) stelle = zeilen.length;
    zeilen.splice(stelle, 0, zeile);
  }
  return mitBlock(quelle, block, zeilen);
}

/* FULLSIZE_VARIANTS ist wie FULLSIZE_FIT eine flache Liste, nur mit
   ganzen Zahlen: Wie viele Bilder eine Fassung hat. Eins ist der
   Normalfall und steht nicht darin, dieser Wert nimmt den Eintrag also
   wieder heraus. */
function neueVariantenQuelle(quelle, stamm, anzahl) {
  const block = blockVon(quelle, 'FULLSIZE_VARIANTS');
  const zeilen = block.zeilen.filter((z) => z.trim() !== '');
  const vorhanden = zeilen.findIndex((z) => {
    const t = WERT_ZEILE.exec(z);
    return t && t[1] === stamm;
  });
  const zeile = `  '${stamm}': ${anzahl},`;

  if (anzahl < 2) {
    if (vorhanden === -1) return null;              // hatte schon nur ein Bild
    zeilen.splice(vorhanden, 1);
  } else if (vorhanden !== -1) {
    if (zeilen[vorhanden] === zeile) return null;   // steht schon so da
    zeilen[vorhanden] = zeile;
  } else {
    let stelle = zeilen.findIndex((z) => {
      const t = WERT_ZEILE.exec(z);
      return t && t[1].localeCompare(stamm, 'de') > 0;
    });
    if (stelle === -1) stelle = zeilen.length;
    zeilen.splice(stelle, 0, zeile);
  }
  return mitBlock(quelle, block, zeilen);
}

/* ---------- Der Satz zu einer Fassung ----------

   FULLSIZE_NOTES in js/looks.js trägt zu jeder Ganzkörper-Fassung einen
   Satz, den die Charakterseite unter die Fassungstafel schreibt. Die
   Liste ist nach Figuren gruppiert, und jede Gruppe trägt eine
   Überschrift mit dem Namen der Figur. Ein neuer Satz stellt sich
   deshalb zu den Sätzen derselben Figur; hat sie noch keine, entsteht am
   Ende eine neue Gruppe. Sortiert wird dabei nichts: Die Reihenfolge der
   Gruppen folgt der Handlung.

   Ein leerer Text nimmt den Eintrag wieder heraus, und mit ihm die
   Überschrift, falls sonst nichts mehr unter ihr steht. */

const NOTIZ_ZEILE = /^\s*'([^']+)':/;

/* Einfache Anführungszeichen wie im Bestand. Was der Satz selbst an
   Anführungszeichen und Rückstrichen trägt, wird dabei geschützt. */
function notizZeile(datei, text) {
  const geschuetzt = text.split('\\').join('\\\\').split("'").join("\\'");
  return `  '${datei}': '${geschuetzt}',`;
}

/* Die Sätze, wie eine Fassung von looks.js sie trägt. */
function notizenLesen(fassung) {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(`${fassung}\n;globalThis.PROBE = FULLSIZE_NOTES;`, ctx,
    { filename: 'looks-lesen.js' });
  return ctx.PROBE;
}

const istUeberschrift = (zeile) => zeile.includes('/* ----------');

/* Bleibt von einer Gruppe nur noch ihre Überschrift übrig, geht sie mit,
   zusammen mit der Leerzeile davor. Sonst sammelten sich über die Zeit
   Namen ohne Inhalt in der Datei. */
function leereGruppeRaeumen(zeilen, ab) {
  let kopf = -1;
  for (let i = Math.min(ab, zeilen.length) - 1; i >= 0; i -= 1) {
    if (NOTIZ_ZEILE.test(zeilen[i])) return;
    if (istUeberschrift(zeilen[i])) { kopf = i; break; }
  }
  if (kopf === -1) return;
  for (let i = kopf + 1; i < zeilen.length; i += 1) {
    if (istUeberschrift(zeilen[i])) break;
    if (NOTIZ_ZEILE.test(zeilen[i])) return;
  }
  const von = kopf > 0 && zeilen[kopf - 1].trim() === '' ? kopf - 1 : kopf;
  zeilen.splice(von, kopf - von + 1);
}

/* Die Stelle eines Schlüssels in den Zeilen des Blocks. */
function notizStelle(zeilen, datei) {
  return zeilen.findIndex((z) => {
    const t = NOTIZ_ZEILE.exec(z);
    return t && t[1] === datei;
  });
}

/* „gruppe“ ist der Name der Figur für eine neue Überschrift,
   „geschwister“ sind die übrigen Fassungen derselben Figur: An ihnen
   erkennt der Schreiber, wo der neue Satz hingehört. */
function neueBeschreibungQuelle(quelle, datei, text, gruppe, geschwister) {
  const block = blockVon(quelle, 'FULLSIZE_NOTES', 'js/looks.js');
  const { zeilen } = block;
  const vorhanden = notizStelle(zeilen, datei);
  const zeile = notizZeile(datei, text);

  if (!text) {
    if (vorhanden === -1) return null;              // stand ohnehin nichts da
    zeilen.splice(vorhanden, 1);
    leereGruppeRaeumen(zeilen, vorhanden);
  } else if (vorhanden !== -1) {
    if (zeilen[vorhanden] === zeile) return null;   // steht schon so da
    zeilen[vorhanden] = zeile;
  } else {
    let letzte = -1;
    for (let i = 0; i < zeilen.length; i += 1) {
      const t = NOTIZ_ZEILE.exec(zeilen[i]);
      if (t && geschwister.includes(t[1])) letzte = i;
    }
    if (letzte === -1) zeilen.push('', `  /* ---------- ${gruppe} ---------- */`, zeile);
    else zeilen.splice(letzte + 1, 0, zeile);
  }
  return mitBlock(quelle, block, zeilen);
}

/* Prüfen, bevor die Datei angefasst wird: laden und nachsehen, ob jeder
   genannte Satz danach so dasteht. Ein leerer Text heißt, dass der
   Schlüssel danach gar nicht mehr vorkommt. */
function looksSchreiben(fassung, proben, stempel) {
  const jetzt = notizenLesen(fassung);
  for (const [datei, text] of proben) {
    if (jetzt[datei] !== (text || undefined)) {
      throw new Error(`Die neue Fassung von looks.js trägt bei ${datei} nicht, was sie soll.`);
    }
  }
  fs.mkdirSync(SICHERUNG, { recursive: true });
  const sicher = path.join(SICHERUNG, `looks-${stempel}.js`);
  if (!fs.existsSync(sicher)) fs.copyFileSync(LOOKS, sicher);
  fs.writeFileSync(LOOKS, fassung, 'utf8');
}

function setzeBeschreibung(datei, text, gruppe, geschwister) {
  const quelle = fs.readFileSync(LOOKS, 'utf8');
  const fassung = neueBeschreibungQuelle(quelle, datei, text, gruppe, geschwister);
  if (fassung === null) return { geaendert: false };
  looksSchreiben(fassung, [[datei, text]], stempelJetzt());
  return { geaendert: true, datei, beschreibung: text };
}

/* Der Satz hängt am Dateinamen und folgt ihm deshalb: Wird eine Fassung
   umbenannt, zieht er mit und bleibt dabei in seiner Gruppe stehen. Ein
   Satz, der unter dem neuen Namen schon stünde, weicht ihm. */
function notizUmziehen(alt, neu, stempel) {
  const quelle = fs.readFileSync(LOOKS, 'utf8');
  const text = notizenLesen(quelle)[alt];
  if (!text) return false;
  const block = blockVon(quelle, 'FULLSIZE_NOTES', 'js/looks.js');
  const { zeilen } = block;
  const belegt = notizStelle(zeilen, neu);
  if (belegt !== -1) zeilen.splice(belegt, 1);
  const stelle = notizStelle(zeilen, alt);
  if (stelle === -1) return false;
  zeilen[stelle] = notizZeile(neu, text);
  looksSchreiben(mitBlock(quelle, block, zeilen), [[alt, ''], [neu, text]], stempel);
  return true;
}

/* Und dasselbe fürs Löschen: Mit der Fassung geht ihr Satz, und mit dem
   letzten Satz einer Figur auch deren Überschrift. */
function notizWeg(dateien, stempel) {
  const quelle = fs.readFileSync(LOOKS, 'utf8');
  let stand = quelle;
  const proben = [];
  for (const datei of dateien) {
    const naechste = neueBeschreibungQuelle(stand, datei, '', '', []);
    if (naechste === null) continue;
    stand = naechste;
    proben.push([datei, '']);
  }
  if (!proben.length) return false;
  looksSchreiben(stand, proben, stempel);
  return true;
}

/* Die Schwebe kommt nur mit, wenn sie mitgeschickt wurde: Der Knopf „In
   chars.js schreiben“ setzt die beiden Regler, ohne die Datei neu zu
   schneiden, und über die leere Fläche in einer Datei, die er gar nicht
   anfasst, weiß er nichts. */
function setzeSkala(datei, skala, korrektur, schwebe) {
  const quelle = fs.readFileSync(CHARS, 'utf8');
  const mitSkala = neueSkalaQuelle(quelle, datei, skala);
  const mitKorrektur = neueKorrekturQuelle(
    mitSkala === null ? quelle : mitSkala, datei, korrektur);
  const bisher = mitKorrektur === null ? mitSkala : mitKorrektur;
  const neu = schwebe === undefined ? null
    : neueSchwebeQuelle(bisher === null ? quelle : bisher, datei, schwebe);
  if (mitSkala === null && mitKorrektur === null && neu === null) return { geaendert: false };
  const fassung = neu === null ? bisher : neu;

  /* Prüfen, bevor die Datei angefasst wird: laden und nachsehen. */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(
    [fs.readFileSync(path.join(REPO, 'js', 'data.js'), 'utf8'), fassung,
      ';globalThis.PROBE = { skala: FULLSIZE_SCALE, korrektur: FULLSIZE_FIT,'
      + ' schwebe: FULLSIZE_LIFT };'].join('\n'),
    ctx, { filename: 'chars-probe.js' });
  /* Der Normalfall steht in keiner der Listen: bei den beiden Reglern
     die 1, bei der Schwebe die 0. */
  const proben = [['Körpergröße', skala, ctx.PROBE.skala, 1, runde],
    ['Bildkorrektur', korrektur, ctx.PROBE.korrektur, 1, runde]];
  if (schwebe !== undefined) proben.push(['Schwebe', schwebe, ctx.PROBE.schwebe, 0, runde3]);
  for (const [name, wert, tabelle, standard, genau] of proben) {
    const soll = wert === standard ? undefined : genau(wert);
    if (tabelle[datei] !== soll) {
      throw new Error(`Die neue Fassung von chars.js trägt bei der ${name} `
        + `${tabelle[datei]} statt ${soll}.`);
    }
  }

  fs.mkdirSync(SICHERUNG, { recursive: true });
  const stempel = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.copyFileSync(CHARS, path.join(SICHERUNG, `chars-${stempel}.js`));
  fs.writeFileSync(CHARS, fassung, 'utf8');
  return { geaendert: true, skala, korrektur, schwebe };
}

/* ---------- Fassungen verwalten ----------

   FULLSIZE_LOOKS in js/chars.js führt je Figur ihre Ganzkörper-Fassungen
   als [Beschriftung, Dateiname, Film]. Der erste Eintrag ist die
   Standardansicht und heißt wie der Charakter-Slug, er bleibt deshalb
   stehen. Figuren mit nur einer Ansicht haben gar keinen Eintrag, der
   Block entsteht erst mit der zweiten Fassung und fällt mit ihr wieder
   weg. Ihr Film steht dann in FULLSIZE_STANDARD.

   Gearbeitet wird zeilenweise, damit Kommentare und Reihenfolge der Datei
   erhalten bleiben. Geschrieben wird erst, wenn sich die neue Fassung
   laden lässt und trägt, was sie soll. */

/* Der Film ist der dritte Wert und darf fehlen: Dann bleibt der Logoplatz
   auf der Charakterseite leer. Die Beschriftung ist genügsam gefasst, der
   Dateiname dahinter macht sie eindeutig. */
const EINTRAG = /^\s*\['(.*?)', '([a-z0-9-]+)'(?:, '([a-z0-9-]*)')?\],$/;

function fassungZeile(label, datei, film) {
  return `    ['${label}', '${datei}'${film ? `, '${film}'` : ''}],`;
}

/* Ein Film-Slug, wie ihn data.js führt, oder nichts. Alles andere käme
   als kaputte Zeile in chars.js an. */
function filmRoh(wert) {
  const film = String(wert || '').trim();
  if (film && !/^[a-z0-9-]+$/.test(film)) throw new Error('Kein Film-Slug: ' + film);
  return film;
}

/* FULLSIZE_STANDARD trägt den Film der Figuren, die nur ein einziges
   Ganzkörperbild haben. Ein leerer Film nimmt die Zeile wieder heraus,
   denn ohne Eintrag rechnet die Charakterseite selbst.

   Die Liste folgt der Handlung: Wer früher zum ersten Mal auftritt,
   steht weiter oben. Eine neue Zeile wird danach eingeordnet, statt sie
   unten anzuhängen. */
const FILM_ZEILE = /^\s*'([^']+)':\s*'([a-z0-9-]*)',/;

/* Charakter-Slug -> Stelle seines ersten Auftritts in der Handlung. */
function auftrittsOrdnung(figuren) {
  const platz = new Map();
  for (const phase of ladeDaten().PHASES) {
    for (const film of phase.movies) if (!platz.has(film.slug)) platz.set(film.slug, platz.size);
  }
  const ordnung = new Map();
  for (const figur of figuren) {
    const erster = platz.get(figur.filmSlugs[0]);
    if (erster !== undefined) ordnung.set(figur.slug, erster);
  }
  return ordnung;
}

function neueStandardFilmQuelle(quelle, slug, film, ordnung) {
  const block = blockVon(quelle, 'FULLSIZE_STANDARD');
  const zeilen = block.zeilen.filter((z) => z.trim() !== '');
  const vorhanden = zeilen.findIndex((z) => {
    const t = FILM_ZEILE.exec(z);
    return t && t[1] === slug;
  });
  const zeile = `  '${slug}': '${film}',`;

  if (!film) {
    if (vorhanden === -1) return null;                 // stand schon nicht da
    zeilen.splice(vorhanden, 1);
  } else if (vorhanden !== -1) {
    if (zeilen[vorhanden] === zeile) return null;      // steht schon so da
    zeilen[vorhanden] = zeile;
  } else {
    const meiner = ordnung && ordnung.get(slug);
    let stelle = -1;
    if (meiner !== undefined) {
      stelle = zeilen.findIndex((z) => {
        const t = FILM_ZEILE.exec(z);
        const andere = t && ordnung.get(t[1]);
        return andere !== undefined && andere > meiner;
      });
    }
    zeilen.splice(stelle === -1 ? zeilen.length : stelle, 0, zeile);
  }
  return mitBlock(quelle, block, zeilen);
}

/* Dieselbe Regel wie charSlug() in js/chars.js, ohne den Alias. Aus der
   Beschriftung wird damit der Dateizusatz: Leerzeichen werden zu
   Bindestrichen, Umlaute aufgelöst, alles andere fällt weg. */
function alsSlug(text) {
  return String(text).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/* Der Dateiname einer Fassung entsteht aus ihrer Beschriftung. Er ist
   damit kein eigener Wert, der gepflegt werden müsste, sondern folgt ihr.
   Kollidiert er mit einer anderen Fassung derselben Figur, zählt eine
   Nummer weiter. */
function dateiAusLabel(slug, label, belegt) {
  const stamm = alsSlug(label);
  if (!stamm) throw new Error('Aus dieser Beschriftung entsteht kein Dateiname.');
  let name = `${slug}-${stamm}`;
  for (let n = 2; belegt.has(name); n += 1) name = `${slug}-${stamm}-${n}`;
  return name;
}

/* Der Dateiname steht an mehreren Stellen. Diese Funktion zieht sie alle
   nach, damit eine Umbenennung nur an einer Stelle gedacht werden muss:
   das Bild selbst, die Körpergröße, die Offen-Markierung und die
   Quellenangabe. FULLSIZE_LOOKS schreibt der Aufrufer. */
function dateiUmbenennen(alt, neu, stempel) {
  const bericht = [];
  const bild = path.join(FULLSIZE, alt + '.webp');
  if (fs.existsSync(bild)) {
    fs.renameSync(bild, path.join(FULLSIZE, neu + '.webp'));
    bericht.push('Bild');
  }
  const menge = ladeMarkiert('ganzkoerper');
  if (menge.delete(alt)) {
    menge.add(neu);
    speichereMarkiert('ganzkoerper', menge);
    bericht.push('Markierung');
  }
  const credits = path.join(FULLSIZE, 'CREDITS.md');
  if (fs.existsSync(credits)) {
    const vorher = fs.readFileSync(credits, 'utf8');
    const nachher = vorher.split(`| ${alt}.webp |`).join(`| ${neu}.webp |`);
    if (vorher !== nachher) {
      fs.copyFileSync(credits, path.join(SICHERUNG, `CREDITS.md-${stempel}`));
      fs.writeFileSync(credits, nachher, 'utf8');
      bericht.push('Quellenangabe');
    }
  }
  if (notizUmziehen(alt, neu, stempel)) bericht.push('Beschreibung');
  return bericht;
}

/* Ein Umzug ist ein Paar [von, nach]. Mehrere davon laufen der Reihe
   nach, und deshalb darf jedes Ziel entweder frei sein oder selbst noch
   umziehen: Beim Tausch zweier Varianten ist jeder Name für einen
   Augenblick doppelt vergeben, beim Aufrücken zeigt jeder Schritt auf
   den Platz, den der vorige gerade geräumt hat. Was hier durchfällt,
   wäre eine fremde Datei, die einer anderen im Weg liegt, und die soll
   kein Eingriff überschreiben. */
function umzuegePruefen(umzuege) {
  const gehen = new Set(umzuege.map(([von]) => von));
  for (const [, nach] of umzuege) {
    if (!gehen.has(nach) && fs.existsSync(path.join(FULLSIZE, nach + '.webp'))) {
      throw new Error(`${nach}.webp liegt schon im Ordner.`);
    }
  }
}

/* Die Umzüge ausführen und melden, was dabei alles mitgewandert ist. */
function umzuegeAusfuehren(umzuege, stempel, bericht = []) {
  const mitgewandert = [];
  for (const [von, nach] of umzuege) {
    for (const was of dateiUmbenennen(von, nach, stempel)) {
      if (!mitgewandert.includes(was)) mitgewandert.push(was);
    }
  }
  for (const was of bericht) if (!mitgewandert.includes(was)) mitgewandert.push(was);
  return mitgewandert;
}

/* Körpergröße, Bildkorrektur und Schwebe hängen wie das Bild am
   Dateinamen. Bei einer Umbenennung ziehen sie mit: am alten Namen
   zurücksetzen, am neuen eintragen. Was dabei umgezogen ist, kommt in
   „bericht“.

   Der Normalfall steht in keiner der drei Listen und ist deshalb zugleich
   der Wert, mit dem der alte Name wieder herausfällt: bei den beiden
   Reglern die 1, bei der Schwebe die 0. */
function masseUmziehen(quelle, werte, alt, neu, bericht) {
  let stand = quelle;
  const umziehen = (topf, schreiber, name, standard) => {
    const wert = topf[alt];
    if (!wert) return;
    for (const [datei, neuerWert] of [[alt, standard], [neu, wert]]) {
      const naechste = schreiber(stand, datei, neuerWert);
      if (naechste !== null) stand = naechste;
    }
    /* Die gelesenen Werte wandern mit. Beim Entfernen einer Variante
       rückt jede dahinter eine Nummer vor, und dieselbe Zahl geht dabei
       durch mehrere Hände: erst von -3 auf -2, dann von -2 auf -1. Ohne
       diese beiden Zeilen fände der zweite Schritt am alten Namen nichts
       mehr und ließe die Zeile stehen, wo sie nicht hingehört. */
    delete topf[alt];
    topf[neu] = wert;
    if (bericht && !bericht.includes(name)) bericht.push(name);
  };
  umziehen(werte.S, neueSkalaQuelle, 'Körpergröße', 1);
  umziehen(werte.F, neueKorrekturQuelle, 'Bildkorrektur', 1);
  umziehen(werte.L, neueSchwebeQuelle, 'Schwebe', 0);
  return stand;
}

/* Und dasselbe fürs Löschen: Der Standardwert nimmt die Zeilen wieder
   heraus. */
function masseLoeschen(quelle, datei) {
  let stand = quelle;
  for (const [schreiber, standard] of [[neueSkalaQuelle, 1], [neueKorrekturQuelle, 1],
    [neueSchwebeQuelle, 0]]) {
    const naechste = schreiber(stand, datei, standard);
    if (naechste !== null) stand = naechste;
  }
  return stand;
}

/* Die Werte, wie sie vor dem Eingriff in chars.js standen. Gelesen wird
   die übergebene Fassung und nicht die Datei: Der Aufrufer hat sie schon
   in der Hand, und zwischendurch kann sie sich ändern. */
function masseLesen(quelle) {
  const werte = {};
  vm.createContext(werte);
  vm.runInContext([fs.readFileSync(DATA, 'utf8'), quelle,
    ';globalThis.S = FULLSIZE_SCALE; globalThis.F = FULLSIZE_FIT;'
    + ' globalThis.L = FULLSIZE_LIFT;'].join('\n'), werte);
  return werte;
}

/* Ein Ganzkörperbild in die Sicherung schieben und aus dem Ordner
   nehmen. Zurück kommt der Pfad der Sicherung, sonst nichts. */
function bildWegraeumen(datei, stempel) {
  const bild = path.join(FULLSIZE, datei + '.webp');
  if (!fs.existsSync(bild)) return null;
  const ziel = path.join(SICHERUNG, `gk-${datei}-${stempel}.webp`);
  fs.copyFileSync(bild, ziel);
  fs.unlinkSync(bild);
  return path.relative(REPO, ziel).replace(/\\/g, '/');
}

function looksBereich(zeilen) {
  const anfang = zeilen.findIndex((z) => z.startsWith('const FULLSIZE_LOOKS = {'));
  if (anfang === -1) throw new Error('FULLSIZE_LOOKS steht nicht in js/chars.js.');
  let ende = anfang;
  while (ende < zeilen.length && zeilen[ende] !== '};') ende += 1;
  if (ende >= zeilen.length) throw new Error('Das Ende von FULLSIZE_LOOKS fehlt.');
  return { anfang, ende };
}

function figurBereich(zeilen, bereich, slug) {
  const start = zeilen.findIndex((z, i) =>
    i > bereich.anfang && i < bereich.ende && z === `  '${slug}': [`);
  if (start === -1) return null;
  let ende = start;
  while (ende < bereich.ende && zeilen[ende] !== '  ],') ende += 1;
  return { start, ende };
}

function beschriftungRoh(label) {
  return String(label).trim().replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/* Baut die neue Quelle. Gibt außerdem zurück, was hinterher gelten muss. */
function neueFassungQuelle(quelle, auftrag) {
  const { aktion, slug } = auftrag;
  const bruch = bruchVon(quelle);
  const zeilen = quelle.split(/\r?\n/);
  const zusammen = () => zeilen.join(bruch);
  const bereich = looksBereich(zeilen);
  const label = beschriftungRoh(auftrag.label || '');

  /* Die meisten Ganzkörperbilder liegen nur als Datei im Ordner und
     stehen nicht in FULLSIZE_LOOKS: Figuren mit einer Ansicht brauchen
     dort keinen Eintrag. Sobald jemand an der Reihenfolge, der
     Beschriftung oder dem Bestand dreht, muss die Liste aber da sein.
     Sie entsteht dann aus dem, was die Oberfläche ohnehin schon zeigt,
     in genau dieser Reihenfolge. */
  let figur = figurBereich(zeilen, bereich, slug);
  const abgeleitet = auftrag.abgeleitet || [];
  /* Der Film der Standardansicht muss beim Entstehen der Liste
     ausgeschrieben werden: Ohne Liste rechnet die Charakterseite ihn aus
     dem einzigen Auftritt der Figur aus, mit Liste zählt allein der
     dritte Wert des Eintrags. Bliebe er leer, fiele das Logo von der
     Tafel, obwohl niemand etwas am Film geändert hat. */
  const abgeleitetZeile = ([l, d, f], i) =>
    fassungZeile(beschriftungRoh(l), d, i === 0 ? (f || auftrag.filmAuto || '') : f);

  /* Eine Liste mit einem einzigen Eintrag hat für sich keinen Zweck:
     Figuren mit einer Ansicht zeigen einfach ihr Bild, und ihr Film steht
     in FULLSIZE_STANDARD. Die Liste entsteht deshalb erst ab zwei, mit
     zwei Ausnahmen: Beim Umbenennen ist die Beschriftung genau das, was
     gesagt werden soll, und außerhalb der Liste gibt es dafür keinen
     Platz. Die Fassungstafel der Charakterseite trägt sonst den Namen
     der Figur, weil sie nichts Besseres weiß. Und wenn eine Variante
     sich zur eigenen Fassung löst, werden aus einer Fassung zwei, dann
     braucht auch die erste ihre Zeile. */
  let blockEntstand = false;
  if (aktion !== 'neu' && (abgeleitet.length > 1 || aktion === 'umbenennen'
    || aktion === 'zu-fassung')) {
    if (!figur) {
      zeilen.splice(bereich.ende, 0,
        `  '${slug}': [`,
        ...abgeleitet.map(abgeleitetZeile),
        '  ],');
      bereich.ende += abgeleitet.length + 2;
      figur = figurBereich(zeilen, bereich, slug);
      blockEntstand = true;
    } else {
      /* Der Block ist da, aber im Ordner liegt mehr. Das Fehlende kommt
         hinten dazu, dort steht es auch in der Anzeige. */
      const drin = new Set();
      for (let i = figur.start + 1; i < figur.ende; i += 1) {
        const t = EINTRAG.exec(zeilen[i]);
        if (t) drin.add(t[2]);
      }
      const fehlend = abgeleitet.filter(([, d]) => !drin.has(d));
      if (fehlend.length) {
        zeilen.splice(figur.ende, 0,
          ...fehlend.map(([l, d, f]) => fassungZeile(beschriftungRoh(l), d, f)));
        bereich.ende += fehlend.length;
        figur = figurBereich(zeilen, bereich, slug);
      }
    }
  }

  /* Entsteht die Fassungsliste, wandert der Film mit hinein und der
     Eintrag in FULLSIZE_STANDARD wird überflüssig: Zwei Stellen für
     dieselbe Auskunft laufen sonst auseinander. */
  const raus = (ergebnis) => (blockEntstand && !ergebnis.standardFilm
    ? { ...ergebnis, standardFilm: { slug, film: '' } } : ergebnis);

  /* Alle Einträge des Blocks, in ihrer Reihenfolge. */
  const einlesen = () => {
    const liste = [];
    if (!figur) return liste;
    for (let i = figur.start + 1; i < figur.ende; i += 1) {
      const t = EINTRAG.exec(zeilen[i]);
      if (t) liste.push({ zeile: i, label: t[1], datei: t[2], film: t[3] || '' });
    }
    return liste;
  };

  if (aktion === 'umbenennen') {
    if (!label) throw new Error('Die Beschriftung darf nicht leer sein.');
    if (!figur) throw new Error(`${slug} hat noch keine Fassungsliste.`);
    const eintraege = einlesen();
    const meiner = eintraege.find((e) => e.datei === auftrag.datei);
    if (!meiner) throw new Error(`${auftrag.datei} steht nicht in der Liste von ${slug}.`);
    /* Der Dateiname folgt der Beschriftung. Er ist damit kein zweiter
       Wert, den jemand pflegen müsste. */
    const belegt = new Set(eintraege.filter((e) => e !== meiner).map((e) => e.datei));
    const neueDatei = dateiAusLabel(slug, auftrag.label, belegt);
    /* Der Film bleibt, wo er war: Umbenannt wird die Beschriftung, nicht
       die Herkunft der Fassung. */
    zeilen[meiner.zeile] = fassungZeile(label, neueDatei, meiner.film);
    return raus({
      quelle: zusammen(),
      pruefe: { datei: neueDatei, label, film: meiner.film },
      umbenennung: neueDatei === auftrag.datei ? null : { alt: auftrag.datei, neu: neueDatei },
    });
  }

  /* Der Film, aus dem die Fassung stammt. Bei Figuren mit Fassungsliste
     steht er in ihrem Eintrag, bei Figuren mit nur einem Bild in
     FULLSIZE_STANDARD, und wer nur in einem Titel vorkommt, braucht auch
     dort nichts. */
  if (aktion === 'film') {
    const film = filmRoh(auftrag.film);
    if (!figur) {
      const gespeichert = film === auftrag.filmAuto ? '' : film;
      return {
        quelle: zusammen(),
        pruefe: { datei: auftrag.datei, standardFilm: gespeichert },
        standardFilm: { slug, film: gespeichert },
      };
    }
    const meiner = einlesen().find((e) => e.datei === auftrag.datei);
    if (!meiner) throw new Error(`${auftrag.datei} steht nicht in der Liste von ${slug}.`);
    zeilen[meiner.zeile] = fassungZeile(meiner.label, meiner.datei, film);
    return raus({ quelle: zusammen(), pruefe: { datei: meiner.datei, label: meiner.label, film } });
  }

  /* Verschieben und „zum Standard“ sind dasselbe geworden: Standard ist,
     was an erster Stelle steht, unabhängig vom Dateinamen. */
  if (aktion === 'verschieben' || aktion === 'standard') {
    if (!figur) throw new Error(`${slug} hat noch keine Fassungsliste.`);
    const eintraege = einlesen();
    const jetzt = eintraege.findIndex((e) => e.datei === auftrag.datei);
    if (jetzt === -1) throw new Error(`${auftrag.datei} steht nicht in der Liste von ${slug}.`);
    const ziel = aktion === 'standard' ? 0
      : jetzt + (auftrag.richtung === 'hoch' ? -1 : 1);
    if (ziel === jetzt) throw new Error('Das steht schon an dieser Stelle.');
    if (ziel < 0 || ziel >= eintraege.length) {
      throw new Error('Weiter geht es in diese Richtung nicht.');
    }
    /* Herausnehmen und an der Zeile des Ziels wieder einsetzen. Nach dem
       Herausnehmen rutschen die Zeilen dahinter eine hoch, dadurch trifft
       derselbe Index in beide Richtungen die richtige Stelle. */
    const zeile = zeilen[eintraege[jetzt].zeile];
    zeilen.splice(eintraege[jetzt].zeile, 1);
    zeilen.splice(eintraege[ziel].zeile, 0, zeile);
    return raus({ quelle: zusammen(), pruefe: { datei: auftrag.datei, stelle: ziel } });
  }

  /* Löschen und „wird Variante von“ nehmen dieselbe Zeile aus der Liste:
     Die Fassung steht danach nicht mehr für sich. Ob ihre Bilder dabei in
     die Sicherung wandern oder an eine andere Fassung, entscheidet sich
     erst danach an den Dateien. */
  if (aktion === 'loeschen' || aktion === 'zu-variante') {
    if (!figur) throw new Error(`${slug} hat keine Fassungsliste.`);
    const eintraege = einlesen();
    if (eintraege.length <= 1) throw new Error('Das ist das einzige Bild der Figur.');
    const weg = eintraege.find((e) => e.datei === auftrag.datei);
    if (!weg) throw new Error(`${auftrag.datei} steht nicht in der Liste von ${slug}.`);
    const rest = eintraege.filter((e) => e !== weg);
    if (rest.length === 1 && rest[0].datei === slug) {
      /* Übrig bliebe nur ein Bild, das ohnehin wie die Figur heißt. Dann
         ist der ganze Block überflüssig: Figuren ohne Eintrag zeigen
         einfach ihr einzelnes Bild. Sein Film zieht dabei nach
         FULLSIZE_STANDARD um, sonst fiele er mit der Liste weg. */
      zeilen.splice(figur.start, figur.ende - figur.start + 1);
      const bleibt = rest[0].film === auftrag.filmAuto ? '' : rest[0].film;
      return {
        quelle: zusammen(),
        pruefe: { datei: auftrag.datei, label: null },
        standardFilm: { slug, film: bleibt },
      };
    }
    zeilen.splice(weg.zeile, 1);
    return raus({ quelle: zusammen(), pruefe: { datei: auftrag.datei, label: null } });
  }

  /* Eine Variante löst sich zur eigenen Fassung. Das ist ein Eintrag wie
     beim Anlegen, nur dass sein Bild schon da ist: Es liegt als
     <Fassung>-<Nummer> im Ordner und heißt gleich nach der neuen
     Beschriftung. Die Zeile steht direkt hinter der Fassung, aus der sie
     kommt, denn dort sucht sie, wer sie eben noch als Ziffer gesehen
     hat. */
  if (aktion === 'zu-fassung') {
    if (!label) throw new Error('Die Beschriftung darf nicht leer sein.');
    if (!figur) throw new Error(`${slug} hat noch keine Fassungsliste.`);
    const eintraege = einlesen();
    const eltern = eintraege.find((e) => e.datei === auftrag.stamm);
    if (!eltern) throw new Error(`${auftrag.stamm} steht nicht in der Liste von ${slug}.`);
    const belegt = new Set(eintraege.map((e) => e.datei));
    belegt.add(slug);
    const datei = dateiAusLabel(slug, auftrag.label, belegt);
    /* Der Film der Fassung gilt zunächst auch für die gelöste Variante:
       Es ist dasselbe Bild aus demselben Auftritt. Wer es anders sieht,
       ändert ihn in der Konsole. */
    const film = filmRoh(auftrag.film);
    zeilen.splice(eltern.zeile + 1, 0, fassungZeile(label, datei, film));
    return raus({ quelle: zusammen(), pruefe: { datei, label, film } });
  }

  if (aktion !== 'neu') throw new Error('Unbekannte Aktion: ' + aktion);

  if (!label) throw new Error('Die Beschriftung darf nicht leer sein.');
  /* Auch beim Anlegen kommt der Dateiname aus der Beschriftung. */
  const belegt = new Set(einlesen().map((e) => e.datei));
  if (!figur) belegt.add(slug);
  const datei = dateiAusLabel(slug, auftrag.label, belegt);
  const film = filmRoh(auftrag.film);
  const neu = fassungZeile(label, datei, film);

  if (figur) {
    zeilen.splice(figur.ende, 0, neu);
  } else {
    /* Erste zusätzliche Fassung: Der Block entsteht mit der
       Standardansicht an erster Stelle, so verlangt es chars.js. Ihre
       Beschriftung und ihr Film stehen schon in der Anzeige, der Film
       kommt aus FULLSIZE_STANDARD und wird dort gleich überflüssig. */
    const erste = abgeleitet[0] || [];
    const standard = beschriftungRoh(erste[0] || auftrag.standardLabel || 'Standard');
    zeilen.splice(bereich.ende, 0,
      `  '${slug}': [`,
      fassungZeile(standard, slug, erste[2] || auftrag.filmAuto || ''),
      neu,
      '  ],');
    blockEntstand = true;
  }
  return raus({ quelle: zusammen(), pruefe: { datei, label, film } });
}


/* ---------- Varianten einer Fassung ----------

   Von mancher Fassung gibt es mehr als ein brauchbares Bild: dieselbe
   Rüstung in einer anderen Haltung, von der anderen Seite, mit und ohne
   Helm. Als zweite Fassung stünden sie falsch, denn Beschriftung, Film
   und Beschreibung wären bei beiden gleich. Sie stehen deshalb als
   Varianten hinter einer Fassung, und die Charakterseite schaltet oben
   an der Profilleiste zwischen ihnen um.

   Geschrieben wird allein die Anzahl (FULLSIZE_VARIANTS in js/chars.js),
   die Dateinamen folgen ihr: Aus der Fassung wird <Fassung>-1,
   <Fassung>-2 und so weiter. Die erste Variante entsteht deshalb als
   Umbenennung des vorhandenen Bildes, die letzte fällt wieder auf den
   Namen der Fassung zurück.

   Mehr als neun sind nicht vorgesehen: Die Schalter auf der
   Charakterseite tragen eine Ziffer, und wer zehn Aufnahmen desselben
   Anzugs hat, hat eher zwei Fassungen als eine. */
const VARIANTEN_MAX = 9;

function variantenPruefen(quelle, stamm, soll) {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(
    [fs.readFileSync(path.join(REPO, 'js', 'data.js'), 'utf8'), quelle,
      ';globalThis.PROBE = FULLSIZE_VARIANTS;'].join('\n'),
    ctx, { filename: 'chars-probe.js' });
  if ((ctx.PROBE[stamm] || 1) !== soll) {
    throw new Error('Die Zahl der Varianten steht danach nicht in chars.js.');
  }
}

function variantenAendern(auftrag) {
  const D = ladeDaten();
  const figur = baueFiguren().find((f) => f.slug === auftrag.slug);
  if (!figur) throw new Error('Unbekannte Figur: ' + auftrag.slug);
  const ziel = figur.ganzkoerper.find((z) => z.datei === auftrag.datei);
  if (!ziel) throw new Error(`${auftrag.datei} gehört zu keiner Fassung von ${auftrag.slug}.`);
  const stamm = ziel.stamm;
  const jetzt = D.lookVariants(stamm);
  const anlegen = auftrag.aktion === 'variante-neu';

  if (anlegen && jetzt >= VARIANTEN_MAX) {
    throw new Error(`Mehr als ${VARIANTEN_MAX} Varianten trägt eine Fassung nicht.`);
  }
  if (!anlegen && jetzt < 2) throw new Error('Diese Fassung hat nur dieses eine Bild.');

  const soll = anlegen ? Math.max(2, jetzt + 1) : jetzt - 1;
  const alt = fs.readFileSync(CHARS, 'utf8');
  const werte = masseLesen(alt);

  /* Was an Dateien passiert, steht erst als Liste da und wird danach in
     einem Rutsch ausgeführt: erst chars.js prüfen und schreiben, dann
     die Bilder anfassen. Umbenannt wird aufsteigend, dann ist der neue
     Name immer schon frei. */
  const umzuege = [];       // [von, nach]
  let weg = null;           // Datei, die aus dem Ordner geht
  let danach;               // Datei, die hinterher offen sein soll

  if (anlegen) {
    if (jetzt < 2) umzuege.push([stamm, `${stamm}-1`]);
    danach = `${stamm}-${soll}`;
  } else {
    weg = `${stamm}-${ziel.variante}`;
    for (let nr = ziel.variante + 1; nr <= jetzt; nr += 1) {
      umzuege.push([`${stamm}-${nr}`, `${stamm}-${nr - 1}`]);
    }
    if (soll < 2) umzuege.push([`${stamm}-1`, stamm]);
    danach = soll < 2 ? stamm : `${stamm}-${Math.min(ziel.variante, soll)}`;
  }

  umzuegePruefen(umzuege);

  let stand = alt;
  const neueZahl = neueVariantenQuelle(stand, stamm, soll);
  if (neueZahl !== null) stand = neueZahl;
  if (weg) stand = masseLoeschen(stand, weg);
  const bericht = [];
  for (const [von, nach] of umzuege) stand = masseUmziehen(stand, werte, von, nach, bericht);

  variantenPruefen(stand, stamm, soll < 2 ? 1 : soll);

  fs.mkdirSync(SICHERUNG, { recursive: true });
  const stempel = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.copyFileSync(CHARS, path.join(SICHERUNG, `chars-${stempel}.js`));
  fs.writeFileSync(CHARS, stand, 'utf8');

  let bildWeg = null;
  if (weg) {
    bildWeg = bildWegraeumen(weg, stempel);
    const menge = ladeMarkiert('ganzkoerper');
    if (menge.delete(weg)) speichereMarkiert('ganzkoerper', menge);
    /* Nur der Satz dieser einen Aufnahme. Der Satz der Fassung selbst
       bleibt, sie hat ja weiterhin Bilder. */
    notizWeg([weg], stempel);
  }
  const mitgewandert = umzuegeAusfuehren(umzuege, stempel, bericht);

  return { datei: danach, varianten: soll < 2 ? 1 : soll, bildWeg, mitgewandert };
}

/* Die drei Zahlen, die am Bild hängen und nicht an der Fassung. Ohne
   Eintrag gilt der Normalfall. */
function masseVon(werte, datei) {
  return [werte.S[datei] || 1, werte.F[datei] || 1, werte.L[datei] || 0];
}

/* ---------- Varianten umsortieren ----------

   Welche Aufnahme die erste ist, entscheidet allein der Dateiname: Die
   Charakterseite zeigt <Fassung>-1 zuerst und zählt von da an weiter.
   Eine Variante zu verschieben heißt deshalb, zwei Dateien zu tauschen,
   und getauscht wird über einen dritten Namen, weil beide Plätze schon
   belegt sind. Er trägt zwei Bindestriche und kann darum mit keinem
   echten Namen zusammenfallen: alsSlug() macht aus jeder Folge von
   Sonderzeichen genau einen.

   An der Zahl der Varianten ändert sich dabei nichts und an der
   Fassungsliste auch nicht. Mit den Bildern wandert nur, was an ihnen
   hängt: Körpergröße, Bildkorrektur, Schwebe, Offen-Markierung und die
   Quellenangabe. */
function variantenSchieben(auftrag) {
  const D = ladeDaten();
  const figur = baueFiguren().find((f) => f.slug === auftrag.slug);
  if (!figur) throw new Error('Unbekannte Figur: ' + auftrag.slug);
  const ziel = figur.ganzkoerper.find((z) => z.datei === auftrag.datei);
  if (!ziel) throw new Error(`${auftrag.datei} gehört zu keiner Fassung von ${auftrag.slug}.`);
  const stamm = ziel.stamm;
  const anzahl = D.lookVariants(stamm);
  if (anzahl < 2) throw new Error('Diese Fassung hat nur dieses eine Bild.');
  const stelle = ziel.variante + (auftrag.aktion === 'variante-hoch' ? -1 : 1);
  if (stelle < 1 || stelle > anzahl) throw new Error('Weiter geht es in diese Richtung nicht.');

  const hier = `${stamm}-${ziel.variante}`;
  const dort = `${stamm}-${stelle}`;
  const zwischen = `${stamm}--tausch`;
  const umzuege = [[hier, zwischen], [dort, hier], [zwischen, dort]];
  umzuegePruefen(umzuege);

  const alt = fs.readFileSync(CHARS, 'utf8');
  const werte = masseLesen(alt);
  /* Vorher gelesen, denn masseUmziehen() schreibt die Werte mit um. */
  const vorher = { hier: masseVon(werte, hier), dort: masseVon(werte, dort) };
  let stand = alt;
  const bericht = [];
  for (const [von, nach] of umzuege) stand = masseUmziehen(stand, werte, von, nach, bericht);

  /* Geprüft wird an der neuen Fassung, bevor sie die Datei ersetzt: Die
     beiden Bilder müssen ihre Maße getauscht haben. */
  const nachher = masseLesen(stand);
  for (const [datei, soll] of [[hier, vorher.dort], [dort, vorher.hier]]) {
    if (masseVon(nachher, datei).some((wert, i) => wert !== soll[i])) {
      throw new Error(`Die Maße von ${datei}.webp stehen danach nicht, wo sie sollen.`);
    }
  }

  fs.mkdirSync(SICHERUNG, { recursive: true });
  const stempel = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  /* Ohne eigene Maße steht in chars.js nichts über die beiden Bilder, und
     dann gibt es dort auch nichts zu sichern. */
  if (stand !== alt) {
    fs.copyFileSync(CHARS, path.join(SICHERUNG, `chars-${stempel}.js`));
    fs.writeFileSync(CHARS, stand, 'utf8');
  }
  return {
    datei: dort, varianten: anzahl, variante: stelle,
    mitgewandert: umzuegeAusfuehren(umzuege, stempel, bericht),
  };
}

/* ---------- Fassung und Variante tauschen die Rolle ----------

   Was eine eigene Fassung ist und was nur eine zweite Aufnahme, stellt
   sich oft erst heraus, wenn beide Bilder nebeneinander stehen: Zwei
   Tafeln für denselben Anzug sagen zweimal dasselbe, und eine Ziffer an
   der Profilleiste ist zu wenig für einen anderen Anzug. Beides lässt
   sich deshalb nachträglich umhängen.

   Die Zeile in FULLSIZE_LOOKS schreibt neueFassungQuelle(), sie fällt
   weg oder kommt dazu. Hier steht, was daran hängt: die Zahl in
   FULLSIZE_VARIANTS und die Dateinamen, die ihr folgen. Angehängt wird
   hinten, und wer sich löst, lässt die Varianten dahinter eine Nummer
   aufrücken. */
function umhaengenPruefen(auftrag, figur) {
  if (!figur) throw new Error('Unbekannte Figur: ' + auftrag.slug);
  if (auftrag.aktion === 'zu-fassung') {
    const bild = figur.ganzkoerper.find((z) => z.datei === auftrag.datei);
    if (!bild) {
      throw new Error(`${auftrag.datei} gehört zu keiner Fassung von ${auftrag.slug}.`);
    }
    if (bild.varianten < 2) {
      throw new Error('Diese Fassung hat nur dieses eine Bild, sie steht schon für sich.');
    }
    return bild;
  }
  const meine = figur.ganzkoerper.find((z) => z.stamm === auftrag.datei);
  const dort = figur.ganzkoerper.find((z) => z.stamm === auftrag.ziel);
  if (!meine) {
    throw new Error(`${auftrag.datei} gehört zu keiner Fassung von ${auftrag.slug}.`);
  }
  if (!dort) {
    throw new Error(`${auftrag.ziel} gehört zu keiner Fassung von ${auftrag.slug}.`);
  }
  if (meine.stamm === dort.stamm) {
    throw new Error('Eine Fassung wird keine Variante ihrer selbst.');
  }
  const zusammen = meine.varianten + dort.varianten;
  if (zusammen > VARIANTEN_MAX) {
    throw new Error(`Zusammen wären das ${zusammen} Bilder, mehr als ${VARIANTEN_MAX} `
      + 'trägt eine Fassung nicht.');
  }
  return meine;
}

function variantenUmhaengen(auftrag, figur, quelle, pruefe, stempel) {
  const D = ladeDaten();
  const werte = masseLesen(quelle);
  const umzuege = [];
  const zahlen = [];                 // je Stamm die neue Zahl seiner Bilder
  let danach;                        // die Datei, die hinterher offen sein soll
  let nummer;                        // ihre Nummer in der Reihe der Varianten
  let varianten;

  if (auftrag.aktion === 'zu-variante') {
    const von = auftrag.datei;
    const nach = auftrag.ziel;
    const meine = D.lookVariants(von);
    const dort = D.lookVariants(nach);
    /* Die Zielfassung mit ihrem einen Bild bekommt jetzt ihre Nummer:
       Aus <Fassung>.webp wird <Fassung>-1.webp. */
    if (dort < 2) umzuege.push([nach, `${nach}-1`]);
    D.lookVariantFiles(von).forEach((datei, i) => {
      umzuege.push([datei, `${nach}-${dort + i + 1}`]);
    });
    zahlen.push([von, 1], [nach, dort + meine]);
    danach = `${nach}-${dort + 1}`;
    nummer = dort + 1;
    varianten = dort + meine;
  } else {
    const bild = figur.ganzkoerper.find((z) => z.datei === auftrag.datei);
    const stamm = bild.stamm;
    const anzahl = bild.varianten;
    umzuege.push([bild.datei, pruefe.datei]);
    for (let nr = bild.variante + 1; nr <= anzahl; nr += 1) {
      umzuege.push([`${stamm}-${nr}`, `${stamm}-${nr - 1}`]);
    }
    /* Bleibt drüben ein einziges Bild übrig, heißt es wieder wie seine
       Fassung. */
    if (anzahl - 1 < 2) umzuege.push([`${stamm}-1`, stamm]);
    zahlen.push([stamm, anzahl - 1]);
    danach = pruefe.datei;
    nummer = 1;
    varianten = 1;
  }
  umzuegePruefen(umzuege);

  let stand = quelle;
  for (const [wo, wieviele] of zahlen) {
    const naechste = neueVariantenQuelle(stand, wo, wieviele);
    if (naechste !== null) stand = naechste;
  }
  const bericht = [];
  for (const [von, nach] of umzuege) stand = masseUmziehen(stand, werte, von, nach, bericht);
  for (const [wo, wieviele] of zahlen) {
    variantenPruefen(stand, wo, wieviele < 2 ? 1 : wieviele);
  }

  fs.writeFileSync(CHARS, stand, 'utf8');
  return {
    datei: danach, varianten, variante: nummer,
    mitgewandert: umzuegeAusfuehren(umzuege, stempel, bericht),
  };
}

function fassungAendern(auftrag) {
  /* Varianten greifen nicht in FULLSIZE_LOOKS ein: Sie hängen an der
     Datei und stehen in FULLSIZE_VARIANTS. */
  if (auftrag.aktion === 'variante-neu' || auftrag.aktion === 'variante-weg') {
    return variantenAendern(auftrag);
  }
  if (auftrag.aktion === 'variante-hoch' || auftrag.aktion === 'variante-runter') {
    return variantenSchieben(auftrag);
  }
  const alt = fs.readFileSync(CHARS, 'utf8');
  /* Die Liste, wie die Oberfläche sie zeigt: gepflegte Fassungen zuerst,
     danach die reinen Dateien aus dem Ordner. Sie dient als Vorlage,
     falls der Eintrag in FULLSIZE_LOOKS erst entstehen muss. */
  const figuren = baueFiguren();
  const figur = figuren.find((f) => f.slug === auftrag.slug);
  /* Je Fassung eine Zeile und nicht je Bild: In figur.ganzkoerper steht
     jede Variante für sich, in FULLSIZE_LOOKS gehört aber nur der Stamm
     hin. Ohne das schriebe der erste Eingriff an einer Figur mit
     Varianten jede von ihnen als eigene Fassung in die Liste. */
  const nachStamm = new Map();
  for (const z of (figur ? figur.ganzkoerper : [])) {
    const stamm = z.stamm || z.datei;
    if (!nachStamm.has(stamm)) nachStamm.set(stamm, [z.label, stamm, z.film]);
  }
  const abgeleitet = [...nachStamm.values()];

  /* „Wird Variante von“ und „wird eigene Fassung“ hängen an der Zahl der
     Varianten und nicht an FULLSIZE_LOOKS. Was daran scheitert, fällt
     deshalb hier durch, bevor eine Zeile geschrieben ist. */
  const umhaengen = auftrag.aktion === 'zu-variante' || auftrag.aktion === 'zu-fassung';
  const bild = umhaengen ? umhaengenPruefen(auftrag, figur) : null;

  const { quelle, pruefe, umbenennung, standardFilm } = neueFassungQuelle(alt, {
    ...auftrag, abgeleitet, filmAuto: (figur && figur.filmAuto) || '',
    /* Beim Lösen nennt der Auftrag das einzelne Bild, die Zeile in
       FULLSIZE_LOOKS steht aber unter dem Stamm seiner Fassung. */
    stamm: bild ? bild.stamm : auftrag.datei,
  });

  /* Der Film einer Figur ohne Fassungsliste steht in FULLSIZE_STANDARD.
     Er zieht mit, wenn die Liste entsteht oder wieder wegfällt. */
  let neuerStand = quelle;
  if (standardFilm) {
    const naechste = neueStandardFilmQuelle(neuerStand, standardFilm.slug, standardFilm.film,
      auftrittsOrdnung(figuren));
    /* Eine unveränderte Quelle heißt sonst, dass es nichts zu tun gab.
       Beim Umhängen heißt sie das nicht: Hat die Figur noch keine
       Fassungsliste, entsteht sie für diesen einen Schritt und fällt mit
       der angehängten Fassung gleich wieder weg. In FULLSIZE_VARIANTS und
       im Bilderordner steht die Arbeit dann noch aus. */
    if (naechste === null && neuerStand === alt && !umhaengen) return { geaendert: false };
    if (naechste !== null) neuerStand = naechste;
  }

  /* Prüfen, bevor die Datei angefasst wird. */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(
    [fs.readFileSync(path.join(REPO, 'js', 'data.js'), 'utf8'), neuerStand,
      ';globalThis.PROBE = { looks: FULLSIZE_LOOKS, standard: FULLSIZE_STANDARD };'].join('\n'),
    ctx, { filename: 'chars-probe.js' });
  const entkommen = (text) => text.replace(/\\(['\\])/g, '$1');
  const liste = ctx.PROBE.looks[auftrag.slug] || [];
  const treffer = liste.find(([, d]) => d === pruefe.datei);
  if (pruefe.standardFilm !== undefined) {
    if ((ctx.PROBE.standard[auftrag.slug] || '') !== pruefe.standardFilm) {
      throw new Error('Der Film steht danach nicht in FULLSIZE_STANDARD.');
    }
  } else if (pruefe.stelle !== undefined) {
    if (!liste[pruefe.stelle] || liste[pruefe.stelle][1] !== pruefe.datei) {
      throw new Error('Die Fassung steht danach nicht an der erwarteten Stelle.');
    }
    if (pruefe.label && liste[pruefe.stelle][0] !== entkommen(pruefe.label)) {
      throw new Error('Die Standardansicht trägt danach nicht die erwartete Beschriftung.');
    }
  } else if (pruefe.label === null) {
    if (treffer) throw new Error('Die Fassung steht danach immer noch in der Liste.');
  } else if (!treffer || treffer[0] !== entkommen(pruefe.label)) {
    throw new Error('Die neue Fassung von chars.js trägt nicht, was sie soll.');
  }
  if (pruefe.film !== undefined && (!treffer || (treffer[2] || '') !== pruefe.film)) {
    throw new Error('Die Fassung steht danach nicht bei dem gewählten Film.');
  }

  fs.mkdirSync(SICHERUNG, { recursive: true });
  const stempel = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.copyFileSync(CHARS, path.join(SICHERUNG, `chars-${stempel}.js`));

  /* Die Zeile steht, jetzt folgen ihr die Dateien: Die angehängte Fassung
     nimmt die Nummern hinter den Bildern der Zielfassung, die gelöste
     Variante heißt nach ihrer neuen Beschriftung. */
  if (umhaengen) return variantenUmhaengen(auftrag, figur, neuerStand, pruefe, stempel);

  /* Der Dateiname folgt der Beschriftung. Ändert sie sich, wandert das
     Bild mit, dazu Körpergröße, Bildkorrektur, Offen-Markierung und
     Quellenangabe. FULLSIZE_LOOKS trägt den neuen Namen schon.

     Eine Fassung mit Varianten liegt in mehreren Dateien, die alle nach
     ihr heißen. Dann ziehen sie alle mit, und die Anzahl selbst wandert
     vom alten Stamm auf den neuen. */
  let mitgewandert = null;
  if (umbenennung) {
    const D = ladeDaten();
    const werte = masseLesen(alt);
    let stand = neuerStand;
    const bericht = [];
    const anzahl = D.lookVariants(umbenennung.alt);
    const paare = anzahl > 1
      ? D.lookVariantFiles(umbenennung.alt)
        .map((datei, i) => [datei, `${umbenennung.neu}-${i + 1}`])
      : [[umbenennung.alt, umbenennung.neu]];
    if (anzahl > 1) {
      for (const [stamm, wert] of [[umbenennung.alt, 1], [umbenennung.neu, anzahl]]) {
        const naechste = neueVariantenQuelle(stand, stamm, wert);
        if (naechste !== null) stand = naechste;
      }
      bericht.push('Varianten');
    }
    for (const [von, nach] of paare) stand = masseUmziehen(stand, werte, von, nach, bericht);
    fs.writeFileSync(CHARS, stand, 'utf8');
    mitgewandert = [];
    for (const [von, nach] of paare) {
      for (const was of dateiUmbenennen(von, nach, stempel)) {
        if (!mitgewandert.includes(was)) mitgewandert.push(was);
      }
    }
    mitgewandert.push(...bericht);
    return { datei: paare[0][1], umbenannt: { ...umbenennung, mitgewandert } };
  }

  /* Beim Löschen wandern Bild und Größenangaben mit. Sonst stünde die
     Fassung gleich wieder in der Liste, denn der Ordner wird mitgelesen.
     Eine Fassung mit Varianten nimmt alle ihre Bilder mit, und ihre
     Anzahl fällt aus FULLSIZE_VARIANTS. */
  let bildWeg = null;
  if (auftrag.aktion === 'loeschen') {
    const D = ladeDaten();
    let stand = neuerStand;
    const weg = [];
    for (const datei of D.lookVariantFiles(auftrag.datei)) {
      const gesichert = bildWegraeumen(datei, stempel);
      if (gesichert) weg.push(gesichert);
      stand = masseLoeschen(stand, datei);
    }
    /* Mit der Fassung geht ihr Satz, sonst bliebe er als Waise in
       js/looks.js stehen. Gemeint sind ihr Stamm und jede Aufnahme,
       denn beide können einen eigenen tragen. */
    notizWeg([auftrag.datei, ...D.lookVariantFiles(auftrag.datei)], stempel);
    const ohneVarianten = neueVariantenQuelle(stand, auftrag.datei, 1);
    if (ohneVarianten !== null) stand = ohneVarianten;
    fs.writeFileSync(CHARS, stand, 'utf8');
    const menge = ladeMarkiert('ganzkoerper');
    let geraeumt = false;
    for (const datei of D.lookVariantFiles(auftrag.datei)) {
      if (menge.delete(datei)) geraeumt = true;
    }
    if (geraeumt) speichereMarkiert('ganzkoerper', menge);
    bildWeg = weg.join(', ') || null;
  } else {
    fs.writeFileSync(CHARS, neuerStand, 'utf8');
  }
  return { datei: pruefe.datei, bildWeg };
}

/* ---------- Namen, Alias und Auftritte ----------

   Eine Figur ist in data.js nur eine Zeichenkette in den
   characters-Listen der Filme. Alles Weitere hängt daran: charSlug()
   macht daraus den Schlüssel, unter dem Bilder, Biografie, Steckbrief und
   Begegnungen geführt werden. CHAR_ALIAS in chars.js schiebt sich
   dazwischen und fasst verschiedene Namen derselben Figur zusammen.

   Deshalb gilt hier: Ein Name lässt sich frei ändern, der Schlüssel
   bleibt dabei stehen. Wo der neue Name für sich einen anderen Schlüssel
   ergäbe, entsteht automatisch der passende Alias. Wer den Schlüssel
   wirklich wechseln will, tut das über den Alias und nimmt die Wanderung
   von Dateien und Verweisen in Kauf. */
const DATA = path.join(REPO, 'js', 'data.js');
const PROFILES = path.join(REPO, 'js', 'profiles.js');
const FACTS = path.join(REPO, 'js', 'facts.js');

/* Anführungszeichen wie im Bestand: einfache, außer der Text trägt selbst
   welche. */
function inAnfuehrung(text) {
  return text.includes("'") ? `"${text}"` : `'${text}'`;
}

function pruefeName(name) {
  const sauber = String(name || '').trim().replace(/\s+/g, ' ');
  if (!sauber) throw new Error('Der Name darf nicht leer sein.');
  if (/["\\\r\n]/.test(sauber)) {
    throw new Error('Anführungszeichen und Backslash gehen im Namen nicht.');
  }
  return sauber;
}

/* --- data.js: Namen in den characters-Listen --- */

function ersetzeInAuftritten(quelle, alt, neu) {
  const bruch = bruchVon(quelle);
  let treffer = 0;
  const zeilen = quelle.split(/\r?\n/).map((zeile) => {
    if (!zeile.includes('characters: [')) return zeile;
    const teile = zeile.split(`"${alt}"`);
    if (teile.length === 1) return zeile;
    treffer += teile.length - 1;
    return teile.join(`"${neu}"`);
  });
  return { quelle: zeilen.join(bruch), treffer };
}

/* --- chars.js: CHAR_ALIAS --- */

const ALIAS_ZEILE = /^(\s*)(['"])(.*?)\2:\s*(['"])(.*?)\4,\s*$/;

function aliasBereich(zeilen) {
  const anfang = zeilen.findIndex((z) => z.startsWith('const CHAR_ALIAS = {'));
  if (anfang === -1) throw new Error('CHAR_ALIAS steht nicht in js/chars.js.');
  let ende = anfang;
  while (ende < zeilen.length && zeilen[ende] !== '};') ende += 1;
  return { anfang, ende };
}

/* --- chars.js: CHAR_WORLDS ---

   Welche Klammer am Ende eines Namens eine Welt benennt und welche eine
   Zeit oder eine Besetzung, steht in CHAR_WORLDS (js/chars.js). Neue
   Welten kommen aus dem Namensdialog des Studios dazu. */

const WELT_ZEILE = /^\s*(['"])(.*?)\1,\s*$/;

function weltenBereich(zeilen) {
  const anfang = zeilen.findIndex((z) => z.startsWith('const CHAR_WORLDS = ['));
  if (anfang === -1) throw new Error('CHAR_WORLDS steht nicht in js/chars.js.');
  let ende = anfang;
  while (ende < zeilen.length && zeilen[ende] !== '];') ende += 1;
  return { anfang, ende };
}

function weltenLesen(quelle) {
  const zeilen = quelle.split(/\r?\n/);
  const bereich = weltenBereich(zeilen);
  const raus = [];
  for (let i = bereich.anfang + 1; i < bereich.ende; i += 1) {
    const t = WELT_ZEILE.exec(zeilen[i]);
    if (t) raus.push(t[2]);
  }
  return raus;
}

/* Eine Welt trägt keine Klammern: Im Namen steht sie selbst in einer,
   und eine zweite darin fände splitName() nicht mehr. */
function pruefeWelt(name) {
  const sauber = pruefeName(name);
  if (/[()]/.test(sauber)) throw new Error('Klammern gehen in einer Welt nicht.');
  if (sauber.length > 40) throw new Error('Der Name der Welt ist zu lang.');
  return sauber;
}

function weltAnlegen(name) {
  const welt = pruefeWelt(name);
  const quelle = fs.readFileSync(CHARS, 'utf8');
  if (weltenLesen(quelle).includes(welt)) return { geaendert: false, welt };
  const zeilen = quelle.split(/\r?\n/);
  const bereich = weltenBereich(zeilen);
  /* Ans Ende der Liste, nicht einsortiert: „Erde-838“ und „andere Welt“
     stehen in keiner Ordnung, die sich fortschreiben ließe. */
  zeilen.splice(bereich.ende, 0, `  ${inAnfuehrung(welt)},`);
  const stempel = stempelJetzt();
  sichereQuelle(CHARS, stempel);
  fs.writeFileSync(CHARS, zeilen.join(bruchVon(quelle)), 'utf8');
  return { geaendert: true, welt };
}

/* Eine Welt wieder aus CHAR_WORLDS nehmen.

   Die Liste entscheidet, wie splitName() eine Klammer am Ende eines
   Namens liest: als Welt oder als Zeit, Besetzung, Variante. Eine Welt zu
   streichen, die noch in Namen steht, bedeutete also nicht, dass die
   Klammer verschwindet, sondern dass sie plötzlich etwas anderes heißt.
   „Karl Mordo (Erde-838)“ wäre danach keine Figur aus einer anderen
   Wirklichkeit mehr, sondern eine Variante namens Erde-838.

   Deshalb wird zuerst nachgesehen, wer sie trägt. Ist noch jemand dabei,
   sagt der Fehler, wer das ist: Die Namen gehören dann zuerst geändert. */
function weltLoeschen(name) {
  const welt = pruefeWelt(name);
  const quelle = fs.readFileSync(CHARS, 'utf8');
  const zeilen = quelle.split(/\r?\n/);
  const bereich = weltenBereich(zeilen);
  let stelle = -1;
  for (let i = bereich.anfang + 1; i < bereich.ende; i += 1) {
    const t = WELT_ZEILE.exec(zeilen[i]);
    if (t && t[2] === welt) { stelle = i; break; }
  }
  if (stelle === -1) return { geaendert: false, welt };

  const traeger = weltTraeger(welt);
  if (traeger.length) {
    throw new Error(`„${welt}“ steht noch im Namen von `
      + traeger.slice(0, 4).join(', ')
      + (traeger.length > 4 ? ` und ${traeger.length - 4} weiteren` : '')
      + '. Diese Namen zuerst ändern.');
  }

  zeilen.splice(stelle, 1);
  const neu = zeilen.join(bruchVon(quelle));
  /* Prüfen, bevor geschrieben wird: Die Liste muss danach genau diese
     eine Welt weniger führen. */
  if (weltenLesen(neu).includes(welt)) {
    throw new Error('Die Welt steht danach immer noch in CHAR_WORLDS.');
  }
  sichereQuelle(CHARS, stempelJetzt());
  fs.writeFileSync(CHARS, neu, 'utf8');
  return { geaendert: true, welt };
}

/* Alle Figuren, deren Name diese Welt in der Klammer trägt. */
function weltTraeger(welt) {
  const D = ladeDaten();
  const raus = [];
  for (const figur of baueFiguren()) {
    if (figur.namen.some((n) => D.splitName(n).world === welt)) raus.push(figur.name);
  }
  return raus;
}

/* Alias setzen, ändern, umbenennen oder entfernen. ziel === null nimmt den
   Eintrag heraus, altName benennt den Schlüssel um. */
function aliasSchreiben(quelle, name, ziel, altName) {
  const bruch = bruchVon(quelle);
  const zeilen = quelle.split(/\r?\n/);
  const bereich = aliasBereich(zeilen);
  const suche = altName || name;
  let stelle = -1;
  for (let i = bereich.anfang + 1; i < bereich.ende; i += 1) {
    const t = ALIAS_ZEILE.exec(zeilen[i]);
    if (t && t[3] === suche) { stelle = i; break; }
  }
  const neu = ziel === null ? null
    : `  ${inAnfuehrung(name)}: ${inAnfuehrung(ziel)},`;
  if (stelle === -1) {
    if (neu === null) return quelle;                 // war schon nicht da
    /* Alphabetisch einsortieren, so ist die Liste grob gehalten. */
    let wohin = bereich.ende;
    for (let i = bereich.anfang + 1; i < bereich.ende; i += 1) {
      const t = ALIAS_ZEILE.exec(zeilen[i]);
      if (t && t[3].localeCompare(name, 'de') > 0) { wohin = i; break; }
    }
    zeilen.splice(wohin, 0, neu);
  } else if (neu === null) {
    zeilen.splice(stelle, 1);
  } else {
    zeilen[stelle] = neu;
  }
  return zeilen.join(bruch);
}

function aliasLesen(quelle, name) {
  const zeilen = quelle.split(/\r?\n/);
  const bereich = aliasBereich(zeilen);
  for (let i = bereich.anfang + 1; i < bereich.ende; i += 1) {
    const t = ALIAS_ZEILE.exec(zeilen[i]);
    if (t && t[3] === name) return t[5];
  }
  return null;
}

/* --- Schlüsselwanderung ---

   Der Slug steckt als ganzes Wort in Anführungszeichen in mehreren
   Dateien, und die Dateinamen der Bilder tragen ihn als Präfix. Ersetzt
   wird deshalb '<alt>' und '<alt>-zusatz', nie ein bloßer Teilstring.

   „fremde“ sind die Schlüssel eigener Figuren, die mit <alt> anfangen
   (siehe fremdeSchluessel()). Sie bleiben stehen: Wer „gamora“
   umbenennt, benennt die Gamora von 2014 nicht mit um, weder ihre
   Zeilen in den Quelldateien noch ihre Bilder. */
function slugMuster(alt) {
  return new RegExp(`(['"])${alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-[a-z0-9-]+)?\\1`, 'g');
}

function slugErsetzen(text, alt, neu, fremde = []) {
  return text.replace(slugMuster(alt), (ganz, q, zusatz) => (
    passtZuPraefix(alt + (zusatz || ''), fremde) ? ganz : `${q}${neu}${zusatz || ''}${q}`));
}

function slugWandern(alt, neu, stempel, fremde = []) {
  const bericht = { dateien: [], quellen: [] };
  for (const [name, pfad] of [['js/chars.js', CHARS], ['js/data.js', DATA],
    ['js/looks.js', LOOKS],
    ['js/profiles.js', PROFILES], ['js/facts.js', FACTS]]) {
    if (!fs.existsSync(pfad)) continue;
    const vorher = fs.readFileSync(pfad, 'utf8');
    const nachher = slugErsetzen(vorher, alt, neu, fremde);
    if (vorher === nachher) continue;
    fs.copyFileSync(pfad, path.join(SICHERUNG, `${path.basename(pfad)}-${stempel}`));
    fs.writeFileSync(pfad, nachher, 'utf8');
    bericht.quellen.push(name);
  }
  for (const ordner of [PORTRAITS, FULLSIZE]) {
    for (const datei of webpListe(ordner)) {
      if (!passtZuPraefix(datei, [alt]) || passtZuPraefix(datei, fremde)) continue;
      const zielname = neu + datei.slice(alt.length);
      fs.renameSync(path.join(ordner, datei + '.webp'), path.join(ordner, zielname + '.webp'));
      bericht.dateien.push(`${path.basename(ordner)}/${datei} → ${zielname}`);
    }
  }
  return bericht;
}

/* --- data.js: Auftritte ---

   Filme werden hier über den Titel gefunden, nicht über den Slug: Der
   Slug ist je Reihe vergeben und bei Mehrstaffel-Serien doppelt, Loki
   Staffel 1 und 2 heißen beide "loki". Über den Slug landete jeder
   Haken für Staffel 2 in der Liste von Staffel 1. Die Titel sind
   eindeutig. */

function filmZeile(zeilen, filmTitel) {
  const gesucht = `title: ${JSON.stringify(filmTitel)},`;
  return zeilen.findIndex((z) => z.trim() === gesucht);
}

function auftrittSchreiben(quelle, filmTitel, name, dabei) {
  const bruch = bruchVon(quelle);
  const zeilen = quelle.split(/\r?\n/);
  const film = filmZeile(zeilen, filmTitel);
  if (film === -1) throw new Error('Film nicht gefunden: ' + filmTitel);
  let i = film;
  while (i < zeilen.length && !zeilen[i].includes('characters: [')) {
    if (i > film + 40) throw new Error('Der Film hat keine characters-Liste.');
    i += 1;
  }
  const t = /^(\s*)characters: \[(.*)\],\s*$/.exec(zeilen[i]);
  if (!t) throw new Error('Die characters-Liste steht nicht in einer Zeile.');
  const liste = t[2].length ? JSON.parse('[' + t[2] + ']') : [];
  const drin = liste.indexOf(name);
  if (dabei && drin === -1) liste.push(name);
  else if (!dabei && drin !== -1) liste.splice(drin, 1);
  else return { quelle, geaendert: false };
  zeilen[i] = `${t[1]}characters: [${liste.map((n) => JSON.stringify(n)).join(', ')}],`;
  return { quelle: zeilen.join(bruch), geaendert: true };
}

/* Beim Streichen eines Auftritts fallen auch die Begegnungen weg, sonst
   zeigen sie ins Leere. */
function begegnungenSaeubern(quelle, filmTitel, slug) {
  const bruch = bruchVon(quelle);
  const zeilen = quelle.split(/\r?\n/);
  const film = filmZeile(zeilen, filmTitel);
  if (film === -1) return { quelle, entfernt: 0 };
  let i = film;
  while (i < zeilen.length && !zeilen[i].includes('meets: [')) {
    /* Die nächste title-Zeile ist der nächste Film, dann gibt es hier
       keine Begegnungen. */
    if (i > film + 60 || (zeilen[i].trim().startsWith('title: "') && i > film)) break;
    i += 1;
  }
  if (i >= zeilen.length || !zeilen[i].includes('meets: [')) return { quelle, entfernt: 0 };
  let entfernt = 0;
  let j = i + 1;
  while (j < zeilen.length && !zeilen[j].trim().startsWith('],')) {
    const t = /^(\s*)\[(.*)\],\s*$/.exec(zeilen[j]);
    if (t) {
      const gruppe = JSON.parse('[' + t[2] + ']');
      const weg = gruppe.filter((s) => s !== slug);
      if (weg.length !== gruppe.length) {
        entfernt += 1;
        if (weg.length < 2) {
          zeilen.splice(j, 1);
          continue;
        }
        zeilen[j] = `${t[1]}[${weg.map((s) => JSON.stringify(s)).join(', ')}],`;
      }
    }
    j += 1;
  }
  return { quelle: zeilen.join(bruch), entfernt };
}

/* --- Die Änderungen zusammensetzen --- */

/* Beide Quellen zusammen laden, ohne sie zu schreiben. So lässt sich
   vorher nachsehen, was die Änderung anrichtet. */
function probeLaden(dataQuelle, charsQuelle) {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext([dataQuelle, charsQuelle,
    ';globalThis.OUT = { PHASES, CHAR_ALIAS, charSlug };'].join('\n'),
    ctx, { filename: 'probe.js' });
  return ctx.OUT;
}

function stempelJetzt() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function sichereQuelle(pfad, stempel) {
  fs.mkdirSync(SICHERUNG, { recursive: true });
  fs.copyFileSync(pfad, path.join(SICHERUNG, `${path.basename(pfad)}-${stempel}`));
}

/* Namen ändern. Der Schlüssel der Figur bleibt dabei stehen, notfalls
   über einen neuen Alias. */
function nameAendern(slug, alt, neu) {
  const neuerName = pruefeName(neu);
  if (neuerName === alt) return { geaendert: false };

  const dataAlt = fs.readFileSync(DATA, 'utf8');
  const charsAlt = fs.readFileSync(CHARS, 'utf8');
  const { quelle: dataNeu, treffer } = ersetzeInAuftritten(dataAlt, alt, neuerName);
  if (!treffer) throw new Error(`„${alt}“ steht in keiner characters-Liste.`);

  /* Zuerst ohne Alias nachsehen: Trägt der neue Name den Schlüssel von
     allein, ist der Eintrag überflüssig und fällt weg. Sonst hält ein
     Alias den alten Schlüssel fest, damit Bilder, Biografie, Steckbrief
     und Begegnungen weiter passen. */
  const bisher = aliasLesen(charsAlt, alt);
  const ohneAlias = aliasSchreiben(charsAlt, neuerName, null, alt);
  const O = probeLaden(dataNeu, ohneAlias);
  const charsNeu = O.charSlug(neuerName) === slug
    ? ohneAlias
    : aliasSchreiben(charsAlt, neuerName, bisher || alt, alt);

  const P = probeLaden(dataNeu, charsNeu);
  if (P.charSlug(neuerName) !== slug) {
    throw new Error(`Der Schlüssel würde von ${slug} auf ${P.charSlug(neuerName)} springen.`);
  }
  const stempel = stempelJetzt();
  fs.mkdirSync(SICHERUNG, { recursive: true });
  sichereQuelle(DATA, stempel);
  fs.writeFileSync(DATA, dataNeu, 'utf8');
  if (charsNeu !== charsAlt) {
    sichereQuelle(CHARS, stempel);
    fs.writeFileSync(CHARS, charsNeu, 'utf8');
  }
  return { geaendert: true, treffer, alias: charsNeu !== charsAlt };
}

/* Den Schlüssel der Figur wechseln. Der Alias gilt für alle ihre Namen,
   sonst zerfiele die Figur in zwei. */
function aliasAendern(slug, namen, ziel) {
  const charsAlt = fs.readFileSync(CHARS, 'utf8');
  const dataAlt = fs.readFileSync(DATA, 'utf8');
  /* Noch vor der ersten Änderung festhalten, welche eigenen Figuren
     diesen Schlüssel als Präfix tragen. Danach steht in den Quellen
     schon der neue, und die Frage ließe sich nicht mehr stellen. */
  const fremde = fremdeSchluessel(slug, reihenfolge(ladeDaten()));

  let charsNeu = charsAlt;
  let neuerSlug;
  if (ziel === null) {
    /* Ohne Alias bekäme jeder Name seinen eigenen Schlüssel. Nur wenn das
       ohnehin derselbe ist, lässt sich der Alias streichen. */
    for (const name of namen) charsNeu = aliasSchreiben(charsNeu, name, null, null);
    const P = probeLaden(dataAlt, charsNeu);
    const slugs = new Set(namen.map((n) => P.charSlug(n)));
    if (slugs.size > 1) {
      throw new Error('Ohne Alias zerfiele die Figur in ' + slugs.size
        + ' Schlüssel: ' + [...slugs].join(', '));
    }
    neuerSlug = [...slugs][0];
  } else {
    const zielName = pruefeName(ziel);
    for (const name of namen) charsNeu = aliasSchreiben(charsNeu, name, zielName, null);
    const P = probeLaden(dataAlt, charsNeu);
    neuerSlug = P.charSlug(namen[0]);
    for (const name of namen) {
      if (P.charSlug(name) !== neuerSlug) {
        throw new Error('Die Namen der Figur ergäben verschiedene Schlüssel.');
      }
    }
    /* Trägt jeder Name den Schlüssel schon von allein, ist der Alias
       überflüssig und bleibt draußen. */
    let ohne = charsAlt;
    for (const name of namen) ohne = aliasSchreiben(ohne, name, null, null);
    const O = probeLaden(dataAlt, ohne);
    if (namen.every((n) => O.charSlug(n) === neuerSlug)) charsNeu = ohne;
  }
  if (!neuerSlug) throw new Error('Daraus entsteht kein brauchbarer Schlüssel.');

  const stempel = stempelJetzt();
  fs.mkdirSync(SICHERUNG, { recursive: true });
  sichereQuelle(CHARS, stempel);
  fs.writeFileSync(CHARS, charsNeu, 'utf8');

  let wanderung = null;
  if (neuerSlug !== slug) wanderung = slugWandern(slug, neuerSlug, stempel, fremde);

  const K = probeLaden(fs.readFileSync(DATA, 'utf8'), fs.readFileSync(CHARS, 'utf8'));
  if (K.charSlug(namen[0]) !== neuerSlug) {
    throw new Error('Der Schlüssel steht danach nicht wie erwartet.');
  }
  return { geaendert: true, slug: neuerSlug, wanderung };
}

/* Eine neue Figur anlegen.

   Eine Figur ist in dieser Datenbank nichts als ein Name in den
   Besetzungslisten. Sie entsteht deshalb mit ihrem ersten Auftritt und
   nicht durch einen eigenen Eintrag irgendwo. Alles Weitere, Bilder,
   Biografie, Steckbrief, hängt danach am Schlüssel und kommt nach. */
function figurAnlegen(name, alias, filme) {
  const sauber = pruefeName(name);
  if (!Array.isArray(filme) || !filme.length) {
    throw new Error('Ohne Auftritt gibt es keine Figur. Mindestens einen Film wählen.');
  }
  const dataAlt = fs.readFileSync(DATA, 'utf8');
  const charsAlt = fs.readFileSync(CHARS, 'utf8');

  const D = probeLaden(dataAlt, charsAlt);
  for (const phase of D.PHASES) {
    for (const film of phase.movies) {
      if ((film.characters || []).includes(sauber)) {
        throw new Error(`„${sauber}“ steht schon in der Besetzung von ${film.title}.`);
      }
    }
  }

  const charsNeu = alias
    ? aliasSchreiben(charsAlt, sauber, pruefeName(alias), null) : charsAlt;
  const P = probeLaden(dataAlt, charsNeu);
  const slug = P.charSlug(sauber);
  if (!slug) throw new Error('Aus diesem Namen entsteht kein Schlüssel.');
  const belegt = baueFiguren().find((f) => f.slug === slug);
  if (belegt) {
    throw new Error(`Der Schlüssel ${slug} gehört schon zu ${belegt.name}. `
      + 'Mit einem Alias lässt sich ein anderer wählen.');
  }

  let dataNeu = dataAlt;
  for (const filmTitel of filme) {
    const schritt = auftrittSchreiben(dataNeu, filmTitel, sauber, true);
    if (!schritt.geaendert) throw new Error('Auftritt nicht eingetragen: ' + filmTitel);
    dataNeu = schritt.quelle;
  }
  const K = probeLaden(dataNeu, charsNeu);
  if (K.charSlug(sauber) !== slug) throw new Error('Der Schlüssel stimmt danach nicht.');

  const stempel = stempelJetzt();
  fs.mkdirSync(SICHERUNG, { recursive: true });
  sichereQuelle(DATA, stempel);
  fs.writeFileSync(DATA, dataNeu, 'utf8');
  if (charsNeu !== charsAlt) {
    sichereQuelle(CHARS, stempel);
    fs.writeFileSync(CHARS, charsNeu, 'utf8');
  }
  return { geaendert: true, slug, name: sauber, filme: filme.length };
}

/* Welche Dateien wirklich dieser Figur gehören.

   Wem ein Bild gehört, sagt die Besitzregel weiter oben:
   eigeneDateien(). Wer beim Löschen von „gamora“ stur nach dem Präfix
   ginge, nähme das Bild der Gamora von 2014 mit. */
function dateienDerFigur(slug, alleSlugs) {
  const meine = eigeneDateien(slug, alleSlugs);
  const raus = { portraits: [], fullsize: [], namen: new Set() };
  for (const [ordner, pfad] of Object.entries(ORDNER)) {
    for (const datei of webpListe(pfad)) {
      if (!meine(datei)) continue;
      raus[ordner].push(datei);
      raus.namen.add(datei);
    }
  }
  return { ...raus, meine };
}

/* Eine Figur ganz aus der Datenbank nehmen.

   Sie hängt an mehr Stellen, als sie entstanden ist: Ihre Auftritte
   stehen in den Besetzungslisten von js/data.js, ihre Begegnungen
   daneben, und ihr Schlüssel trägt Bilder, Biografie, Steckbrief,
   Beziehungen und Fähigkeiten. Wer nur die Auftritte striche, ließe all
   das als Waise stehen: Die Figur verschwände von der Charakterseite,
   ihre Zeilen aber blieben in fünf Dateien liegen.

   Deshalb geht hier alles zusammen, in einem Zug und unter einem Schritt
   im Verlauf. Rückgängig holt die Figur samt Bildern zurück.

   Was von anderen Figuren auf sie zeigte, geht mit: Eine Beziehung zu
   jemandem, den es nicht mehr gibt, führte auf der Charakterseite ins
   Leere. */
function figurLoeschen(slug) {
  const figur = baueFiguren().find((f) => f.slug === slug);
  if (!figur) throw new Error('Unbekannte Figur: ' + slug);

  const D = ladeDaten();
  const ordnung = reihenfolge(D);
  const bericht = { auftritte: 0, begegnungen: 0, beziehungen: 0, bilder: [], dateien: [] };
  const eigen = dateienDerFigur(slug, ordnung);

  /* --- js/data.js: Besetzung, Begegnungen, Kurzbiografie, Darsteller --- */
  let data = fs.readFileSync(DATA, 'utf8');
  for (const filmTitel of figur.filme) {
    for (const name of figur.namen) {
      const schritt = auftrittSchreiben(data, filmTitel, name, false);
      if (schritt.geaendert) {
        data = schritt.quelle;
        bericht.auftritte += 1;
      }
    }
    const sauber = begegnungenSaeubern(data, filmTitel, slug);
    data = sauber.quelle;
    bericht.begegnungen += sauber.entfernt;
  }
  for (const tabelle of ['BIOS', 'ACTORS']) {
    const naechste = setzeEintrag(data, tabelle, 'js/data.js', slug, null, ordnung);
    if (naechste !== null) data = naechste;
  }

  /* --- js/chars.js: Alias, Ansichten, Fassungen, Größen, Stimme --- */
  let chars = fs.readFileSync(CHARS, 'utf8');
  for (const name of figur.namen) chars = aliasSchreiben(chars, name, null, null);
  for (const tabelle of ['CHAR_LOOKS', 'FULLSIZE_LOOKS', 'FULLSIZE_STANDARD']) {
    const naechste = setzeEintrag(chars, tabelle, 'js/chars.js', slug, null, ordnung);
    if (naechste !== null) chars = naechste;
  }
  /* Körpergröße und Bildkorrektur stehen je Datei, nicht je Figur: Eine
     Figur mit sechs Fassungen hat dort bis zu sechs Zeilen. Die Liste der
     Fassungen liest auch den Ordner mit und führt deshalb Dateien, die
     einer eigenen Figur gehören, siehe dateienDerFigur(). */
  for (const fassung of figur.ganzkoerper) {
    if (!eigen.meine(fassung.datei)) continue;
    for (const schreiber of [neueSkalaQuelle, neueKorrekturQuelle]) {
      const naechste = schreiber(chars, fassung.datei, 1);
      if (naechste !== null) chars = naechste;
    }
  }
  /* Die Zahl der Varianten steht dagegen je Fassung, also je Stamm: Eine
     Fassung mit drei Bildern hat dort eine Zeile und nicht drei. */
  for (const stamm of new Set(figur.ganzkoerper.map((z) => z.stamm || z.datei))) {
    if (!eigen.meine(stamm)) continue;
    const naechste = neueVariantenQuelle(chars, stamm, 1);
    if (naechste !== null) chars = naechste;
  }
  chars = ohneStimme(chars, slug);

  /* --- js/profiles.js, js/facts.js, js/powers.js --- */
  const profileAlt = fs.readFileSync(PROFILES, 'utf8');
  const profileNeu = setzeEintrag(profileAlt, 'PROFILES', 'js/profiles.js', slug, null, ordnung);

  let facts = fs.readFileSync(FACTS, 'utf8');
  for (const tabelle of ['CHAR_FACTS', 'CHAR_FACTS_EXTRA', 'CHAR_BONDS']) {
    const naechste = setzeEintrag(facts, tabelle, 'js/facts.js', slug, null, ordnung);
    if (naechste !== null) facts = naechste;
  }
  const fremde = ohneBeziehungenAuf(facts, slug, ordnung);
  facts = fremde.quelle;
  bericht.beziehungen = fremde.entfernt;

  let powers = null;
  if (fs.existsSync(POWERS)) {
    powers = setzeEintrag(fs.readFileSync(POWERS, 'utf8'),
      'CHAR_POWERS', 'js/powers.js', slug, null, ordnung);
  }

  /* --- Probe: laden und nachsehen, bevor eine Datei angefasst wird --- */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext([data, chars, profileNeu === null ? profileAlt : profileNeu, facts,
    ';globalThis.P = { PHASES, charSlug, CHAR_LOOKS, FULLSIZE_LOOKS, FULLSIZE_STANDARD,'
      + ' PROFILES, CHAR_FACTS, CHAR_FACTS_EXTRA, CHAR_BONDS, CHAR_NO_PROFILE };',
  ].join('\n'), ctx, { filename: 'loeschen-probe.js' });
  const P = ctx.P;
  for (const phase of P.PHASES) {
    for (const film of phase.movies) {
      for (const name of film.characters || []) {
        if (P.CHAR_NO_PROFILE.has(name)) continue;
        if (P.charSlug(name) !== slug) continue;
        throw new Error(`„${name}“ steht danach immer noch in der Besetzung `
          + `von ${film.title}. Es wurde nichts geschrieben.`);
      }
    }
  }
  for (const [was, tabelle] of [['Ansichten', P.CHAR_LOOKS], ['Fassungen', P.FULLSIZE_LOOKS],
    ['Standardfilm', P.FULLSIZE_STANDARD], ['Biografie', P.PROFILES],
    ['Steckbrief', P.CHAR_FACTS], ['Steckbrief von Hand', P.CHAR_FACTS_EXTRA],
    ['Beziehungen', P.CHAR_BONDS]]) {
    if (tabelle[slug] === undefined) continue;
    throw new Error(`Der Eintrag bei „${was}“ steht danach immer noch da. `
      + 'Es wurde nichts geschrieben.');
  }

  /* --- Schreiben --- */
  const stempel = stempelJetzt();
  fs.mkdirSync(SICHERUNG, { recursive: true });
  for (const [pfad, neu, name] of [[DATA, data, 'js/data.js'], [CHARS, chars, 'js/chars.js'],
    [PROFILES, profileNeu, 'js/profiles.js'], [FACTS, facts, 'js/facts.js'],
    [POWERS, powers, 'js/powers.js']]) {
    if (neu === null || !fs.existsSync(pfad)) continue;
    if (fs.readFileSync(pfad, 'utf8') === neu) continue;
    sichereQuelle(pfad, stempel);
    fs.writeFileSync(pfad, neu, 'utf8');
    bericht.dateien.push(name);
  }

  /* --- js/looks.js: die Sätze zu ihren Fassungen --- */
  const saetze = [];
  for (const fassung of figur.ganzkoerper) {
    if (!eigen.meine(fassung.datei)) continue;
    for (const name of [fassung.datei, fassung.stamm || fassung.datei]) {
      if (!saetze.includes(name)) saetze.push(name);
    }
  }
  if (saetze.length && notizWeg(saetze, stempel)) bericht.dateien.push('js/looks.js');

  /* --- Bilder: erst in die Sicherung, dann aus dem Ordner --- */
  for (const [ordner, pfad] of Object.entries(ORDNER)) {
    for (const datei of eigen[ordner]) {
      const von = path.join(pfad, datei + '.webp');
      fs.copyFileSync(von, path.join(SICHERUNG,
        `${ordner === 'fullsize' ? 'gk-' : ''}${datei}-${stempel}.webp`));
      fs.unlinkSync(von);
      bericht.bilder.push(`${ordner}/${datei}.webp`);
    }
  }

  /* --- offen.json: die Markierungen der Figur --- */
  for (const bereich of ['portrait', 'ganzkoerper']) {
    const menge = ladeMarkiert(bereich);
    let weg = false;
    for (const datei of [...menge]) {
      if (!eigen.meine(datei)) continue;
      menge.delete(datei);
      weg = true;
    }
    if (weg) speichereMarkiert(bereich, menge);
  }

  return { geaendert: true, slug, name: figur.ueberschrift, ...bericht };
}

/* CHAR_VOICE_ONLY ist eine Menge in einer Zeile und kein Block mit
   Einträgen. Sie fällt deshalb aus dem Muster der übrigen Tabellen. */
function ohneStimme(quelle, slug) {
  const zeilen = quelle.split(/\r?\n/);
  const i = zeilen.findIndex((z) => z.startsWith('const CHAR_VOICE_ONLY = new Set(['));
  if (i === -1) return quelle;
  const t = /^const CHAR_VOICE_ONLY = new Set\(\[(.*)\]\);\s*$/.exec(zeilen[i]);
  if (!t) return quelle;
  const drin = t[1].trim() ? JSON.parse('[' + t[1].replace(/'/g, '"') + ']') : [];
  const rest = drin.filter((s) => s !== slug);
  if (rest.length === drin.length) return quelle;
  zeilen[i] = `const CHAR_VOICE_ONLY = new Set([${rest.map((s) => `'${s}'`).join(', ')}]);`;
  return zeilen.join(bruchVon(quelle));
}

/* Beziehungen anderer Figuren, die auf diesen Schlüssel zeigen. Bleibt
   danach eine leere Liste übrig, fällt der ganze Eintrag weg. */
function ohneBeziehungenAuf(quelle, slug, ordnung) {
  const ZEIGT_AUF = /^\s*\[.*,\s*'(.+?)'\],\s*$/;
  const block = blockVon(quelle, 'CHAR_BONDS', 'js/facts.js');
  const bereiche = eintraege(block.zeilen);
  let entfernt = 0;
  const leer = [];
  for (const [fremd, stelle] of bereiche) {
    let trifft = 0;
    let bleibt = 0;
    for (let i = stelle.von + 1; i <= stelle.bis; i += 1) {
      const t = ZEIGT_AUF.exec(block.zeilen[i]);
      if (!t) continue;
      if (t[1] === slug) trifft += 1; else bleibt += 1;
    }
    entfernt += trifft;
    if (trifft && !bleibt) leer.push(fremd);
  }
  if (!entfernt) return { quelle, entfernt: 0 };
  const behalten = block.zeilen.filter((zeile) => {
    const t = ZEIGT_AUF.exec(zeile);
    return !t || t[1] !== slug;
  });
  let neu = mitBlock(quelle, block, behalten);
  /* Eine Beziehungsliste ohne Beziehungen ist keine. */
  for (const fremd of leer) {
    const naechste = setzeEintrag(neu, 'CHAR_BONDS', 'js/facts.js', fremd, null, ordnung);
    if (naechste !== null) neu = naechste;
  }
  return { quelle: neu, entfernt };
}

/* Einen Auftritt setzen oder streichen. */
function auftrittAendern(filmTitel, name, dabei, slug) {
  const dataAlt = fs.readFileSync(DATA, 'utf8');
  let { quelle, geaendert } = auftrittSchreiben(dataAlt, filmTitel, name, dabei);
  if (!geaendert) return { geaendert: false };
  let begegnungen = 0;
  if (!dabei) {
    const sauber = begegnungenSaeubern(quelle, filmTitel, slug);
    quelle = sauber.quelle;
    begegnungen = sauber.entfernt;
  }
  probeLaden(quelle, fs.readFileSync(CHARS, 'utf8'));   // muss sich laden lassen
  const stempel = stempelJetzt();
  fs.mkdirSync(SICHERUNG, { recursive: true });
  sichereQuelle(DATA, stempel);
  fs.writeFileSync(DATA, quelle, 'utf8');
  return { geaendert: true, begegnungen };
}

/* ---------- Texte: Biografie, Steckbrief, Beziehungen, Besetzung ----------

   Zu jeder Figur gehört mehr als ihr Bild, und das steht verteilt in drei
   Dateien:

     js/data.js      BIOS, die Kurzfassung in ein bis drei Sätzen, und
                     ACTORS, die Darsteller.
     js/profiles.js  PROFILES, die ausführliche Biografie als benannte
                     Abschnitte in Handlungsreihenfolge.
     js/facts.js     CHAR_FACTS_EXTRA, der Steckbrief von Hand, und
                     CHAR_BONDS, die benannten Beziehungen.

   Alle fünf Tabellen sind nach demselben Schlüssel geordnet und tragen je
   Figur genau einen Eintrag. Geschrieben wird deshalb nicht die Datei,
   sondern der Eintrag: Seine Zeilen werden ausgetauscht, alles davor und
   dahinter bleibt Zeichen für Zeichen stehen. Kommentare, Gruppen und die
   Reihenfolge überleben das, und der erzeugte Block CHAR_FACTS wird gar
   nicht erst angefasst.

   CHAR_FACTS selbst ist die einzige Ausnahme: Er kommt aus den beiden
   Marvel-Wikis und gehört services/biography/fetch-facts.py und services/biography/build-facts.py,
   siehe weiter unten. */

const FACT_FELDER = ['origin', 'species', 'height', 'teams', 'status'];
const FACT_LISTEN = new Set(['teams']);

/* Was in eine Zeile der Quelldatei geht. Alle fünf Tabellen führen ihre
   Texte einzeilig, ein Umbruch aus dem Textfeld wird deshalb zum
   Leerzeichen. */
function einzeilig(text) {
  return String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
}

/* Ein Text als JavaScript-Zeichenkette in den Anführungszeichen der
   jeweiligen Datei: profiles.js und data.js führen doppelte, facts.js
   einfache. */
function jsText(text, q) {
  return q + einzeilig(text).replace(/\\/g, '\\\\').split(q).join('\\' + q) + q;
}

/* Die Kopfzeile eines Eintrags: '<slug>': oder "<slug>": am Zeilenanfang.
   Die Zeilen im Inneren eines Eintrags fangen mit [ oder einem blanken
   Feldnamen an und werden davon nicht getroffen. */
const SCHLUESSEL_ZEILE = /^(\s*)(['"])(.+?)\2:\s*(.*)$/;

/* Schlüssel -> { von, bis } über alle Einträge einer Tabelle, in einem
   Durchgang. Ein Eintrag reicht von seiner Kopfzeile bis zu der Zeile,
   die ihn auf derselben Einrückung schließt. Was in einer Zeile beginnt
   und endet, etwa in BIOS, ist beides zugleich. */
function eintraege(zeilen) {
  const raus = new Map();
  for (let i = 0; i < zeilen.length; i++) {
    const treffer = SCHLUESSEL_ZEILE.exec(zeilen[i]);
    if (!treffer) continue;
    const [, einzug, , slug, rest] = treffer;
    if (!/[[{]\s*$/.test(rest)) {
      raus.set(slug, { von: i, bis: i });
      continue;
    }
    const schluss = new RegExp('^' + einzug + '[\\]}],?\\s*$');
    let j = i + 1;
    while (j < zeilen.length && !schluss.test(zeilen[j])) j += 1;
    if (j >= zeilen.length) continue;          // unfertig, lieber nichts anfassen
    raus.set(slug, { von: i, bis: j });
    i = j;
  }
  return raus;
}

/* Alle Figuren in der Reihenfolge ihres ersten Auftritts. So stehen die
   Einträge in allen fünf Tabellen, und dorthin gehört ein neuer auch. */
function reihenfolge(D) {
  const raus = [];
  const gesehen = new Set();
  for (const phase of D.PHASES) {
    for (const film of phase.movies) {
      for (const name of film.characters || []) {
        if (D.CHAR_NO_PROFILE.has(name)) continue;
        const slug = D.charSlug(name);
        if (gesehen.has(slug)) continue;
        gesehen.add(slug);
        raus.push(slug);
      }
    }
  }
  return raus;
}

/* Wohin ein neuer Eintrag kommt: hinter den letzten, der schon dasteht
   und vor dieser Figur zum ersten Mal auftritt. Damit landet er in seiner
   Phase und nicht am Ende der Datei. */
function einfuegeStelle(bereiche, slug, ordnung) {
  const platz = ordnung.indexOf(slug);
  const bis = platz === -1 ? ordnung.length : platz;
  let stelle = 0;
  for (let i = 0; i < bis; i++) {
    const bereich = bereiche.get(ordnung[i]);
    if (bereich) stelle = Math.max(stelle, bereich.bis + 1);
  }
  return stelle;
}

/* Den Eintrag einer Figur setzen, ersetzen oder streichen. Ohne Zeilen
   fällt er weg, null heißt: Es hat sich nichts geändert. */
function setzeEintrag(quelle, tabelle, wo, slug, zeilen, ordnung) {
  const block = blockVon(quelle, tabelle, wo);
  const liste = block.zeilen;
  const bereiche = eintraege(liste);
  const da = bereiche.get(slug);
  if (!zeilen) {
    if (!da) return null;
    liste.splice(da.von, da.bis - da.von + 1);
  } else if (da) {
    if (liste.slice(da.von, da.bis + 1).join('\n') === zeilen.join('\n')) return null;
    liste.splice(da.von, da.bis - da.von + 1, ...zeilen);
  } else {
    liste.splice(einfuegeStelle(bereiche, slug, ordnung), 0, ...zeilen);
  }
  return mitBlock(quelle, block, liste);
}

/* --- Die Zeilen je Tabelle --- */

function profilZeilen(slug, abschnitte) {
  if (!abschnitte.length) return null;
  const raus = [`  ${jsText(slug, '"')}: [`];
  for (const [titel, text] of abschnitte) {
    raus.push(`    [${jsText(titel, '"')}, ${jsText(text, '"')}],`);
  }
  raus.push('  ],');
  return raus;
}

function factZeilen(slug, felder) {
  const gesetzt = FACT_FELDER.filter((name) => (FACT_LISTEN.has(name)
    ? (felder[name] || []).length : einzeilig(felder[name])));
  if (!gesetzt.length) return null;
  const raus = [`  ${jsText(slug, "'")}: {`];
  for (const name of gesetzt) {
    raus.push(FACT_LISTEN.has(name)
      ? `    ${name}: [${felder[name].map((w) => jsText(w, "'")).join(', ')}],`
      : `    ${name}: ${jsText(felder[name], "'")},`);
  }
  raus.push('  },');
  return raus;
}

/* js/powers.js schreibt den Namen und den Absatz auf zwei Zeilen, so
   wie die Datei von Hand geführt wird. */
function powersZeilen(slug, kraefte) {
  if (!kraefte.length) return null;
  const raus = [`  ${jsText(slug, "'")}: [`];
  for (const [name, text] of kraefte) {
    raus.push(`    [${jsText(name, "'")},`);
    raus.push(`      ${jsText(text, "'")}],`);
  }
  raus.push('  ],');
  return raus;
}

function bondZeilen(slug, paare) {
  if (!paare.length) return null;
  const raus = [`  ${jsText(slug, "'")}: [`];
  for (const [label, ziel] of paare) {
    raus.push(`    [${jsText(label, "'")}, ${jsText(ziel, "'")}],`);
  }
  raus.push('  ],');
  return raus;
}

function bioZeilen(slug, text) {
  return einzeilig(text) ? [`  ${jsText(slug, '"')}: ${jsText(text, '"')},`] : null;
}

/* Ein Darsteller steht als Zeichenkette, mehrere als Liste. Genau so
   liest js/characters.js die Tabelle wieder. */
function actorZeilen(slug, namen) {
  if (!namen.length) return null;
  const wert = namen.length === 1 ? jsText(namen[0], '"')
    : `[${namen.map((n) => jsText(n, '"')).join(', ')}]`;
  return [`  ${jsText(slug, '"')}: ${wert},`];
}

/* --- Lesen --- */

function texteLesen(slug) {
  const D = ladeDaten();
  return {
    slug,
    /* Der Steckbrief steht in zwei Schichten: Was das Wiki liefert, und
       was von Hand darüberliegt. Beides geht einzeln hinaus, damit im
       Studio zu sehen ist, welches Feld wirklich der Handarbeit gehört
       und was nur die Vorgabe wiederholt. */
    wiki: D.CHAR_FACTS[slug] || {},
    hand: D.CHAR_FACTS_EXTRA[slug] || {},
    profil: (D.PROFILES[slug] || []).map(([titel, text]) => [titel, text]),
    /* Die Kräfte stehen nicht im Steckbrief, sondern in js/powers.js:
       je Fähigkeit ihr Name und der Absatz dazu. */
    kraefte: (D.CHAR_POWERS[slug] || []).map(([name, text]) => [name, text]),
    bio: D.BIOS[slug] || '',
    bonds: (D.CHAR_BONDS[slug] || []).map(([label, ziel]) => [label, ziel]),
    actors: D.ACTORS[slug] === undefined ? []
      : [].concat(D.ACTORS[slug]),
  };
}

/* --- Schreiben --- */

const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* Alles, was zu einer Figur an Text gehört, in einem Schritt. Vier
   Dateien sind daran beteiligt, und sie gehören zusammen: Wer die
   Biografie ergänzt und dabei die Kräfte nachträgt, hat einen Gedanken
   gefasst und nicht zwei.

   Geprüft wird vor dem Schreiben: Die neuen Fassungen werden geladen und
   müssen genau das tragen, was hineingeschrieben werden sollte. Erst
   danach werden die Dateien gesichert und ersetzt. */
function texteSchreiben(auftrag) {
  const slug = auftrag.slug;
  const D = ladeDaten();
  const ordnung = reihenfolge(D);

  const profil = (auftrag.profil || [])
    .map(([titel, text]) => [einzeilig(titel), einzeilig(text)])
    .filter(([titel, text]) => titel || text);
  for (const [titel, text] of profil) {
    if (!titel) throw new Error('Jeder Abschnitt braucht eine Überschrift.');
    if (!text) throw new Error(`Der Abschnitt „${titel}“ hat keinen Text.`);
  }

  const kraefte = (auftrag.kraefte || [])
    .map(([name, text]) => [einzeilig(name), einzeilig(text)])
    .filter(([name, text]) => name || text);
  for (const [name, text] of kraefte) {
    if (!name) throw new Error('Jede Fähigkeit braucht einen Namen.');
    if (!text) throw new Error(`Die Fähigkeit „${name}“ hat keinen Text.`);
  }

  const bonds = (auftrag.bonds || [])
    .map(([label, ziel]) => [einzeilig(label), einzeilig(ziel)])
    .filter(([label, ziel]) => label || ziel);
  const bekannt = new Set(reihenfolge(D));
  for (const [label, ziel] of bonds) {
    if (!label) throw new Error('Jede Beziehung braucht eine Bezeichnung.');
    if (!bekannt.has(ziel)) throw new Error(`Die Beziehung „${label}“ zeigt auf `
      + `${ziel || 'niemanden'}, und den gibt es nicht.`);
    if (ziel === slug) throw new Error('Eine Figur steht nicht mit sich selbst in Beziehung.');
  }

  const actors = (auftrag.actors || []).map(einzeilig).filter(Boolean);

  const hand = {};
  for (const name of FACT_FELDER) {
    const wert = (auftrag.hand || {})[name];
    if (FACT_LISTEN.has(name)) {
      hand[name] = (Array.isArray(wert) ? wert : []).map(einzeilig).filter(Boolean);
    } else {
      hand[name] = einzeilig(wert);
    }
  }
  if (hand.status && !['Am Leben', 'Verstorben'].includes(hand.status)) {
    throw new Error('Der Status ist „Am Leben“ oder „Verstorben“.');
  }

  /* js/data.js: Kurzbiografie und Besetzung */
  const dataAlt = fs.readFileSync(DATA, 'utf8');
  let dataNeu = setzeEintrag(dataAlt, 'BIOS', 'js/data.js', slug,
    bioZeilen(slug, auftrag.bio), ordnung);
  const nachBio = dataNeu === null ? dataAlt : dataNeu;
  const nachActors = setzeEintrag(nachBio, 'ACTORS', 'js/data.js', slug,
    actorZeilen(slug, actors), ordnung);
  if (nachActors !== null) dataNeu = nachActors;

  /* js/profiles.js: die ausführliche Biografie */
  const profilAlt = fs.readFileSync(PROFILES, 'utf8');
  const profilNeu = setzeEintrag(profilAlt, 'PROFILES', 'js/profiles.js', slug,
    profilZeilen(slug, profil), ordnung);

  /* js/facts.js: Steckbrief von Hand und Beziehungen */
  const factsAlt = fs.readFileSync(FACTS, 'utf8');
  let factsNeu = setzeEintrag(factsAlt, 'CHAR_FACTS_EXTRA', 'js/facts.js', slug,
    factZeilen(slug, hand), ordnung);
  const nachFacts = factsNeu === null ? factsAlt : factsNeu;
  const nachBonds = setzeEintrag(nachFacts, 'CHAR_BONDS', 'js/facts.js', slug,
    bondZeilen(slug, bonds), ordnung);
  if (nachBonds !== null) factsNeu = nachBonds;

  /* js/powers.js: die Kräfte mit Namen und Absatz */
  const powersAlt = fs.readFileSync(POWERS, 'utf8');
  const powersNeu = setzeEintrag(powersAlt, 'CHAR_POWERS', 'js/powers.js', slug,
    powersZeilen(slug, kraefte), ordnung);

  const geaendert = [dataNeu, profilNeu, factsNeu, powersNeu]
    .some((q) => q !== null);
  if (!geaendert) return { geaendert: false };

  /* Probe: laden und nachsehen, ob genau das dasteht, was gewollt war. */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext([
    dataNeu === null ? dataAlt : dataNeu,
    fs.readFileSync(CHARS, 'utf8'),
    profilNeu === null ? profilAlt : profilNeu,
    factsNeu === null ? factsAlt : factsNeu,
    powersNeu === null ? powersAlt : powersNeu,
    ';globalThis.PROBE = { BIOS, ACTORS, PROFILES, CHAR_FACTS_EXTRA, CHAR_BONDS,'
      + ' CHAR_POWERS };',
  ].join('\n'), ctx, { filename: 'texte-probe.js' });

  const P = ctx.PROBE;
  const sollHand = {};
  for (const name of FACT_FELDER) {
    const wert = hand[name];
    if (FACT_LISTEN.has(name) ? wert.length : wert) sollHand[name] = wert;
  }
  const proben = [
    ['Kurzbiografie', P.BIOS[slug], einzeilig(auftrag.bio) || undefined],
    ['Besetzung', P.ACTORS[slug],
      actors.length === 0 ? undefined : (actors.length === 1 ? actors[0] : actors)],
    ['Biografie', P.PROFILES[slug], profil.length ? profil : undefined],
    ['Steckbrief', P.CHAR_FACTS_EXTRA[slug],
      Object.keys(sollHand).length ? sollHand : undefined],
    ['Beziehungen', P.CHAR_BONDS[slug], bonds.length ? bonds : undefined],
    ['Fähigkeiten', P.CHAR_POWERS[slug], kraefte.length ? kraefte : undefined],
  ];
  for (const [was, ist, soll] of proben) {
    if (!gleich(ist, soll)) {
      throw new Error(`Die neue Fassung trägt bei „${was}“ nicht das Erwartete. `
        + 'Es wurde nichts geschrieben.');
    }
  }

  const stempel = stempelJetzt();
  fs.mkdirSync(SICHERUNG, { recursive: true });
  const dateien = [];
  for (const [pfad, neu, name] of [[DATA, dataNeu, 'js/data.js'],
    [PROFILES, profilNeu, 'js/profiles.js'], [FACTS, factsNeu, 'js/facts.js'],
    [POWERS, powersNeu, 'js/powers.js']]) {
    if (neu === null) continue;
    sichereQuelle(pfad, stempel);
    fs.writeFileSync(pfad, neu, 'utf8');
    dateien.push(name);
  }
  return { geaendert: true, dateien };
}

/* ---------- Die Begriffe der Beziehungen ----------

   Die Bezeichnung einer Beziehung ist Freitext, aber sie ist selten neu.
   „Weggefährte“ steht bei über siebzig Figuren, „Bruder“ bei siebzehn,
   und wer sie jedes Mal von Hand tippt, hat am Ende „Weggefährte“ und
   „Wegefährte“ nebeneinander stehen, ohne dass es jemandem auffiele.
   Deshalb führt das Studio eine Liste, aus der sich ein Begriff neben
   dem Feld auswählen lässt.

   Sie hat zwei Quellen und wird trotzdem nicht doppelt geführt.
   Gezählt wird, was in CHAR_BONDS wirklich steht, denn ein benutzter
   Begriff braucht keinen zweiten Ort. bond-labels.json daneben hält nur
   die Begriffe, die bei keiner Figur stehen, also gerade erst getippt
   wurden. Sobald einer davon bei einer Figur landet, fällt er aus der
   Datei heraus und kommt aus js/facts.js.

   Umbenennen geht quer durch alle Figuren: Der Begriff steht bei jeder
   einzeln, ein Tippfehler wäre sonst dreißigmal von Hand zu holen.
   Geschrieben wird dabei Eintrag für Eintrag mit denselben Zeilen wie
   beim Speichern einer Figur, alles andere in der Datei bleibt Zeichen
   für Zeichen stehen. */
const BEGRIFFE = path.join(HIER, 'bond-labels.json');

const BEGRIFF_HINWEIS = 'Bezeichnungen für Beziehungen, die im Porträt-Studio '
  + 'getippt, aber noch bei keiner Figur benutzt wurden. Was benutzt ist, steht '
  + 'in CHAR_BONDS in js/facts.js und wird von dort gezählt.';

/* Die freien Begriffe, so wie sie in der Datei stehen. */
function begriffeFrei() {
  try {
    const daten = JSON.parse(fs.readFileSync(BEGRIFFE, 'utf8'));
    return (daten.begriffe || []).map(einzeilig).filter(Boolean);
  } catch {
    return [];
  }
}

function begriffeFreiSchreiben(liste) {
  const sortiert = [...new Set(liste)].sort((a, b) => a.localeCompare(b, 'de'));
  fs.writeFileSync(BEGRIFFE,
    JSON.stringify({ _hinweis: BEGRIFF_HINWEIS, begriffe: sortiert }, null, 2) + '\n',
    'utf8');
}

/* Begriff -> wie oft er bei einer Figur steht. */
function begriffeBenutzt() {
  const zahl = new Map();
  for (const liste of Object.values(ladeDaten().CHAR_BONDS)) {
    for (const [label] of liste) zahl.set(label, (zahl.get(label) || 0) + 1);
  }
  return zahl;
}

/* Die ganze Liste für das Studio. Ganz oben stehen die frisch getippten,
   die noch bei keiner Figur stehen: Es sind wenige, sie sind eben erst
   entstanden, und weiter unten fänden sie sich in zweihundert Begriffen
   nicht wieder. Darunter die häufigsten, denn nach denen wird am ehesten
   gegriffen, und bei gleicher Zahl entscheidet das Alphabet. */
function begriffeListe() {
  const zahl = begriffeBenutzt();
  const raus = [...zahl].map(([name, anzahl]) => ({ name, anzahl }));
  for (const name of begriffeFrei()) {
    if (!zahl.has(name)) raus.push({ name, anzahl: 0 });
  }
  const neu = (b) => (b.anzahl ? 0 : 1);
  raus.sort((a, b) => neu(b) - neu(a)
    || b.anzahl - a.anzahl
    || a.name.localeCompare(b.name, 'de'));
  return raus;
}

function begriffPruefen(wort) {
  const kurz = einzeilig(wort);
  if (!kurz) throw new Error('Ein Begriff ohne Wort ist keiner.');
  if (kurz.length > 40) throw new Error('Ein Begriff hat höchstens vierzig Zeichen.');
  return kurz;
}

/* Einen getippten Begriff merken. Er steht damit zur Auswahl, noch bevor
   er bei einer Figur gespeichert ist. */
function begriffMerken(wort) {
  const kurz = begriffPruefen(wort);
  if (begriffeBenutzt().has(kurz)) return { geaendert: false, name: kurz };
  const frei = begriffeFrei();
  if (frei.includes(kurz)) return { geaendert: false, name: kurz };
  begriffeFreiSchreiben([...frei, kurz]);
  return { geaendert: true, name: kurz };
}

/* Einen Begriff aus der Liste nehmen, solange er bei keiner Figur steht.
   Was benutzt ist, verschwindet mit der Beziehung und nicht mit der
   Liste. */
function begriffVergessen(wort) {
  const kurz = begriffPruefen(wort);
  const anzahl = begriffeBenutzt().get(kurz) || 0;
  if (anzahl) {
    throw new Error(`„${kurz}“ steht bei ${anzahl} Figur${anzahl === 1 ? '' : 'en'} `
      + 'und bleibt deshalb in der Liste.');
  }
  const frei = begriffeFrei();
  if (!frei.includes(kurz)) return { geaendert: false };
  begriffeFreiSchreiben(frei.filter((b) => b !== kurz));
  return { geaendert: true };
}

/* Einen Begriff bei allen Figuren umbenennen. Trägt eine Figur den alten
   Begriff mehrfach, werden alle Zeilen mitgenommen, und trifft der neue
   auf einen, den es schon gibt, laufen beide zusammen. Geprüft wird vor
   dem Schreiben: Die neue Fassung wird geladen und muss den alten
   Begriff nirgends mehr tragen. */
function begriffUmbenennen(alt, neu) {
  const von = begriffPruefen(alt);
  const nach = begriffPruefen(neu);
  if (von === nach) return { geaendert: false };

  const D = ladeDaten();
  const ordnung = reihenfolge(D);
  const vorher = begriffeBenutzt();
  const alteQuelle = fs.readFileSync(FACTS, 'utf8');
  let quelle = alteQuelle;
  let figuren = 0;
  let stellen = 0;
  for (const [slug, liste] of Object.entries(D.CHAR_BONDS)) {
    const treffer = liste.filter(([label]) => label === von).length;
    if (!treffer) continue;
    const paare = liste.map(([label, ziel]) => [label === von ? nach : label, ziel]);
    const geschrieben = setzeEintrag(quelle, 'CHAR_BONDS', 'js/facts.js', slug,
      bondZeilen(slug, paare), ordnung);
    if (geschrieben === null) continue;
    quelle = geschrieben;
    figuren += 1;
    stellen += treffer;
  }

  /* Der alte Begriff fällt aus der Datei, der neue kommt nur dann
     hinein, wenn er bei keiner Figur steht: Was benutzt ist, kommt aus
     js/facts.js und gehört nicht auch noch hierher. */
  const frei = begriffeFrei();
  const freiNeu = frei.filter((b) => b !== von && b !== nach);
  if (!stellen && frei.includes(von) && !vorher.has(nach)) freiNeu.push(nach);
  const freiGeaendert = !gleich(frei, freiNeu);

  if (quelle === alteQuelle) {
    if (!freiGeaendert) return { geaendert: false };
    begriffeFreiSchreiben(freiNeu);
    return { geaendert: true, figuren: 0, stellen: 0 };
  }

  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(quelle + '\n;globalThis.PROBE = { CHAR_BONDS };', ctx,
    { filename: 'begriff-probe.js' });
  const jetzt = new Map();
  for (const liste of Object.values(ctx.PROBE.CHAR_BONDS)) {
    for (const [label] of liste) jetzt.set(label, (jetzt.get(label) || 0) + 1);
  }
  if (jetzt.get(von) || (jetzt.get(nach) || 0) !== (vorher.get(nach) || 0) + stellen) {
    throw new Error('Die neue Fassung von js/facts.js trägt nicht das Erwartete. '
      + 'Es wurde nichts geschrieben.');
  }

  fs.mkdirSync(SICHERUNG, { recursive: true });
  sichereQuelle(FACTS, stempelJetzt());
  fs.writeFileSync(FACTS, quelle, 'utf8');
  if (freiGeaendert) begriffeFreiSchreiben(freiNeu);
  return { geaendert: true, figuren, stellen };
}

/* ---------- Der Steckbrief aus den Wikis ----------

   services/biography/fetch-facts.py holt die Infoboxen aus dem MCU-Wiki
   und aus der Marvel Database und legt sie als Rohtext ab.
   services/biography/build-facts.py macht daraus die kurzen deutschen
   Angaben und schreibt sie zwischen die Marken @wiki:anfang und
   @wiki:ende in js/facts.js.

   Beide Skripte arbeiten über Dateien, deshalb liegt hier ein eigener
   Ordner: Die Rohdaten bleiben liegen und sind der Grund, warum ein
   zweiter Lauf schnell ist. Wer eine einzelne Figur neu abruft, verliert
   nur ihren Eintrag darin, alle anderen bleiben stehen.

   Ein Punkt verlangt Umsicht. build-facts.py schreibt den Block immer als
   Ganzes und kennt nur, was in seiner Namensliste steht: Ein Lauf über
   eine Figur ließe von zweihundertachtzig Einträgen einen übrig. Deshalb
   baut das Studio nicht in js/facts.js, sondern in eine Kopie daneben und
   holt aus ihr genau die Einträge heraus, die eben geholt wurden. Der
   echte Block bekommt sie einzeln gesetzt, alles andere bleibt Zeichen
   für Zeichen stehen. So ist auch der erste Lauf kurz: Er holt die
   Figuren, die noch fehlen, und nicht alle. */
const WIKI_ORDNER = path.join(HIER, '.wiki');
const WIKI_ROH = path.join(WIKI_ORDNER, 'roh.json');
const WIKI_HOLEN = path.join(HIER, 'services', 'biography', 'fetch-facts.py');
const WIKI_BAUEN = path.join(HIER, 'services', 'biography', 'build-facts.py');

/* Die Reihenfolge, in der die Figuren im erzeugten Block stehen: erst so,
   wie sie schon dort stehen, damit ein Lauf die Datei nicht umsortiert,
   und was fehlt, an der Stelle seines ersten Auftritts. */
function wikiOrdnung(D) {
  const block = blockVon(fs.readFileSync(FACTS, 'utf8'), 'CHAR_FACTS', 'js/facts.js');
  const raus = [...eintraege(block.zeilen).keys()];
  const platz = new Map(reihenfolge(D).map((slug, i) => [slug, i]));
  for (const [slug, i] of platz) {
    if (raus.includes(slug)) continue;
    let stelle = raus.length;
    for (let k = 0; k < raus.length; k++) {
      const p = platz.get(raus[k]);
      if (p !== undefined && p > i) { stelle = k; break; }
    }
    raus.splice(stelle, 0, slug);
  }
  return raus;
}

/* Welche Figuren im erzeugten Block noch fehlen. Das ist die Liste, die
   der Knopf „Fehlende nachziehen“ abarbeitet. */
function wikiOffen() {
  const D = ladeDaten();
  /* Gefragt sind die Figuren, nicht ihre Bilder: reihenfolge() liest sie
     aus den Besetzungslisten, ohne die Bildordner abzusuchen. */
  return reihenfolge(D).filter((slug) => !D.CHAR_FACTS[slug]);
}

/* Ein Skript starten und seine Ausgabe zeilenweise weiterreichen. Beide
   melden ihren Stand über stdout, und beide dürfen lange brauchen: Der
   erste Lauf holt fast zweihundert Figuren aus zwei Wikis. */
function wikiSkript(skript, args, aufZeile) {
  return new Promise((fertig, scheitern) => {
    if (!PYTHON) return scheitern(new Error(PYTHON_INFO.grund));
    const kind = spawn(PYTHON, [skript, ...args],
      { env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
    let err = '';
    let rest = '';
    const uhr = setTimeout(() => kind.kill(), 45 * 60 * 1000);

    kind.stdout.on('data', (teil) => {
      const zeilen = (rest + teil.toString()).split('\n');
      rest = zeilen.pop();
      for (const zeile of zeilen) aufZeile(zeile.trimEnd());
    });
    kind.stderr.on('data', (teil) => { err += teil.toString(); });

    kind.on('error', (fehler) => { clearTimeout(uhr); scheitern(fehler); });
    kind.on('close', (code) => {
      clearTimeout(uhr);
      if (rest.trim()) aufZeile(rest.trimEnd());
      if (code === 0) return fertig();
      scheitern(new Error(`${path.basename(skript)} brach ab: `
        + (err.trim().split('\n').pop() || 'Rückgabewert ' + code)));
    });
  });
}

/* „%3d/%d <slug> mcu:%d db:%d“, die Fortschrittszeile von fetch-facts.py. */
const WIKI_ZEILE = /^(\d+)\/(\d+)\s+(\S+)\s+mcu:(\d+)\s+db:(\d+)$/;

function wikiNamen(figuren, slugs) {
  const nach = new Map(figuren.map((f) => [f.slug, f]));
  return slugs.filter((s) => nach.has(s)).map((s) => ({
    slug: s, real: nach.get(s).name, role: nach.get(s).rolle || '',
  }));
}

/* Die Einträge der genannten Figuren aus dem erzeugten Block einer
   Datei. Aus der Kopie geholt, in js/facts.js gesetzt. */
function wikiEintraege(quelle, slugs) {
  const block = blockVon(quelle, 'CHAR_FACTS', 'der gebauten Kopie');
  const bereiche = eintraege(block.zeilen);
  const raus = new Map();
  for (const slug of slugs) {
    const bereich = bereiche.get(slug);
    if (bereich) raus.set(slug, block.zeilen.slice(bereich.von, bereich.bis + 1));
  }
  return raus;
}

/* Den Steckbrief der genannten Figuren aus den Wikis holen und in
   js/facts.js setzen. Alles, was nicht genannt ist, bleibt unberührt. */
async function wikiAbrufen(slugs, frisch) {
  if (!PYTHON) throw new Error(PYTHON_INFO.grund);
  for (const skript of [WIKI_HOLEN, WIKI_BAUEN]) {
    if (!fs.existsSync(skript)) {
      throw new Error(`${path.relative(REPO, skript)} liegt nicht vor.`);
    }
  }
  const figuren = baueFiguren();
  const holen = wikiNamen(figuren, slugs);
  if (!holen.length) return { geaendert: false, geholt: 0 };

  fs.mkdirSync(WIKI_ORDNER, { recursive: true });
  /* Eine Figur, die ausdrücklich neu abgerufen wird, soll wirklich neu
     kommen und nicht aus dem Zwischenlager: Ihr Rohtext fliegt vorher
     heraus. */
  if (frisch) {
    let roh = {};
    try { roh = JSON.parse(fs.readFileSync(WIKI_ROH, 'utf8')); } catch { /* noch keine */ }
    let weg = 0;
    for (const { slug } of holen) {
      if (!(slug in roh)) continue;
      delete roh[slug];
      weg += 1;
    }
    if (weg) fs.writeFileSync(WIKI_ROH, JSON.stringify(roh, null, 1), 'utf8');
  }
  const namenPfad = path.join(WIKI_ORDNER, 'namen.json');
  const kopiePfad = path.join(WIKI_ORDNER, 'facts-gebaut.js');
  fs.writeFileSync(namenPfad, JSON.stringify(holen, null, 1), 'utf8');
  fs.copyFileSync(FACTS, kopiePfad);

  /* Das Holen wächst mit der Zahl der Figuren, der Bau läuft immer über
     die ganze Datei und ist dadurch ein Posten für sich. */
  const lauf = laufStarten('Steckbriefe aus den Wikis', [
    { schluessel: 'wiki:holen', einheiten: holen.length, name: 'Infoboxen holen' },
    { schluessel: 'wiki:bauen', einheiten: 1, name: 'Angaben bauen' },
  ]);
  let geholt = 0;
  try {
    await wikiSkript(WIKI_HOLEN, [namenPfad, WIKI_ROH], (zeile) => {
      const treffer = WIKI_ZEILE.exec(zeile.trim());
      if (!treffer) return;
      geholt += 1;
      const [, at, von, name] = treffer;
      lauf.meldet(`${name} (${at}/${von})`);
    });
    /* Der Bau meldet nur drei Sätze und dazwischen nichts. Der Balken
       läuft derweil mit der erwarteten Dauer weiter, während der zuletzt
       gemeldete Satz danebensteht. */
    lauf.weiter('Angaben bauen');
    await wikiSkript(WIKI_BAUEN, [WIKI_ROH, namenPfad, kopiePfad], (zeile) => {
      if (zeile.trim()) lauf.meldet(zeile.trim());
    });
    lauf.fertig();
  } catch (fehler) {
    lauf.abbrechen();
    throw fehler;
  }

  /* Aus der Kopie in die Datei: Eintrag für Eintrag, an der Stelle, an
     die die Figur nach ihrem ersten Auftritt gehört. */
  const gebaut = wikiEintraege(fs.readFileSync(kopiePfad, 'utf8'), holen.map((h) => h.slug));
  const ordnung = wikiOrdnung(ladeDaten());
  const factsAlt = fs.readFileSync(FACTS, 'utf8');
  let quelle = factsAlt;
  const gesetzt = [];
  for (const [slug, zeilen] of gebaut) {
    const neu = setzeEintrag(quelle, 'CHAR_FACTS', 'js/facts.js', slug, zeilen, ordnung);
    if (neu === null) continue;
    quelle = neu;
    gesetzt.push(slug);
  }
  const ohne = holen.map((h) => h.slug).filter((s) => !gebaut.has(s));
  if (quelle === factsAlt) {
    return { geaendert: false, geholt, gesetzt: 0, ohne: ohne.length };
  }

  /* Probe: laden und nachsehen, ob die Einträge wirklich dastehen. */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext([quelle, ';globalThis.PROBE = CHAR_FACTS;'].join('\n'), ctx,
    { filename: 'facts-probe.js' });
  for (const slug of gesetzt) {
    if (!ctx.PROBE[slug]) {
      throw new Error(`Der neue Block trägt ${slug} nicht. Es wurde nichts geschrieben.`);
    }
  }

  sichereQuelle(FACTS, stempelJetzt());
  fs.writeFileSync(FACTS, quelle, 'utf8');
  return { geaendert: true, geholt, gesetzt: gesetzt.length, ohne: ohne.length };
}

/* ---------- Verlauf: rückgängig und wiederholen ----------

   Jeder Eingriff wird eingerahmt: Vorher und nachher wird gesichert, was
   er anfassen kann. Rückgängig heißt dann, den Zustand von vorher
   zurückzuspielen, wiederholen den von nachher. Das ist gröber als eine
   Gegenrechnung je Aktion, dafür stimmt es auch bei Umbenennungen,
   Wanderungen und gelöschten Dateien, ohne dass jede Aktion ihre eigene
   Umkehrung pflegen muss.

   Welche Dateien in den Rahmen gehören, sagt der Aufrufer: eine Liste von
   Quelldateien und eine Liste von Bildpräfixen. Bei den Bildern wird der
   Ordner abgesucht, nicht eine feste Liste. Nur so fällt auf, dass nach
   der Aktion eine Datei da ist, die es vorher nicht gab.

   Der Verlauf gilt für die laufende Sitzung. Beim Start wird er geleert,
   denn nach einem Neustart weiß niemand mehr, ob die Dateien inzwischen
   von Hand angefasst wurden. */
const VERLAUF = path.join(HIER, '.verlauf');
const GRENZE = 40;                       // so viele Schritte hält der Verlauf
const verlauf = { schritte: [], stelle: 0, zaehler: 0 };

const ORDNER = { portraits: PORTRAITS, fullsize: FULLSIZE };

function passtZuPraefix(datei, praefixe) {
  return praefixe.some((p) => datei === p || datei.startsWith(p + '-'));
}

function schrittOrdner(n, teil) {
  return path.join(VERLAUF, String(n), teil);
}

function nimmSchnappschuss(n, teil, quellen, praefixe) {
  const ziel = schrittOrdner(n, teil);
  fs.mkdirSync(ziel, { recursive: true });
  const stand = { quellen: [], bilder: [] };
  for (const rel of quellen) {
    const pfad = path.join(REPO, rel);
    if (!fs.existsSync(pfad)) continue;
    const name = rel.replace(/[\\/]/g, '__');
    fs.copyFileSync(pfad, path.join(ziel, name));
    stand.quellen.push({ rel, name });
  }
  for (const [ordner, pfad] of Object.entries(ORDNER)) {
    for (const datei of webpListe(pfad)) {
      if (!passtZuPraefix(datei, praefixe)) continue;
      const name = `${ordner}__${datei}.webp`;
      fs.copyFileSync(path.join(pfad, datei + '.webp'), path.join(ziel, name));
      stand.bilder.push({ ordner, datei, name });
    }
  }
  return stand;
}

function stelleHer(n, teil, stand, praefixe) {
  const quelle = schrittOrdner(n, teil);
  for (const q of stand.quellen) {
    fs.copyFileSync(path.join(quelle, q.name), path.join(REPO, q.rel));
  }
  /* Erst weg, was es damals nicht gab, dann zurück, was es gab. */
  const soll = new Set(stand.bilder.map((b) => b.ordner + '/' + b.datei));
  for (const [ordner, pfad] of Object.entries(ORDNER)) {
    for (const datei of webpListe(pfad)) {
      if (!passtZuPraefix(datei, praefixe)) continue;
      if (soll.has(ordner + '/' + datei)) continue;
      fs.unlinkSync(path.join(pfad, datei + '.webp'));
    }
  }
  for (const b of stand.bilder) {
    fs.copyFileSync(path.join(quelle, b.name), path.join(ORDNER[b.ordner], b.datei + '.webp'));
  }
  bilderVergessen();
}

function verwerfe(n) {
  fs.rmSync(path.join(VERLAUF, String(n)), { recursive: true, force: true });
}

/* Den Rahmen öffnen: Nummer belegen und den Stand von vorher sichern. */
function verlaufVorher(quellen, praefixe) {
  const n = ++verlauf.zaehler;
  return { n, quellen, praefixe, stand: nimmSchnappschuss(n, 'vorher', quellen, praefixe) };
}

/* Den Rahmen schließen: Stand von nachher sichern und einreihen. */
function verlaufAnhaengen(titel, rahmen) {
  const nachher = nimmSchnappschuss(rahmen.n, 'nachher', rahmen.quellen, rahmen.praefixe);
  /* Wer nach einem Rückgängig etwas Neues tut, schneidet die Zukunft ab. */
  for (const weg of verlauf.schritte.slice(verlauf.stelle)) verwerfe(weg.n);
  verlauf.schritte.length = verlauf.stelle;
  verlauf.schritte.push({
    n: rahmen.n, titel, praefixe: rahmen.praefixe, vorher: rahmen.stand, nachher,
  });
  while (verlauf.schritte.length > GRENZE) verwerfe(verlauf.schritte.shift().n);
  verlauf.stelle = verlauf.schritte.length;
}

/* Eine Änderung ausführen und in den Verlauf legen. Ändert sie nichts,
   bleibt der Verlauf, wie er war. */
function mitVerlauf(titel, quellen, praefixe, tun) {
  const rahmen = verlaufVorher(quellen, praefixe);
  let ergebnis;
  try {
    ergebnis = tun();
  } catch (fehler) {
    verwerfe(rahmen.n);
    throw fehler;
  } finally {
    /* Der Eingriff hat womöglich Bilder angelegt, umbenannt oder
       weggeräumt. Was danach nach den Figuren fragt, soll den neuen
       Stand sehen und nicht den von eben. */
    bilderVergessen();
  }
  if (ergebnis && ergebnis.geaendert === false) {
    verwerfe(rahmen.n);
    return ergebnis;
  }
  verlaufAnhaengen(titel, rahmen);
  return ergebnis;
}

/* Dasselbe für eine Änderung, die auf ein Programm wartet. Der Rahmen
   bleibt so lange offen, wie sie dauert: Der Wiki-Abruf holt einige
   Minuten lang Seiten, bevor auch nur eine Zeile geschrieben wird. */
async function mitVerlaufAsync(titel, quellen, praefixe, tun) {
  const rahmen = verlaufVorher(quellen, praefixe);
  let ergebnis;
  try {
    ergebnis = await tun();
  } catch (fehler) {
    verwerfe(rahmen.n);
    throw fehler;
  } finally {
    bilderVergessen();
  }
  if (ergebnis && ergebnis.geaendert === false) {
    verwerfe(rahmen.n);
    return ergebnis;
  }
  verlaufAnhaengen(titel, rahmen);
  return ergebnis;
}

function verlaufStand() {
  const zurueck = verlauf.stelle > 0 ? verlauf.schritte[verlauf.stelle - 1] : null;
  const vor = verlauf.stelle < verlauf.schritte.length
    ? verlauf.schritte[verlauf.stelle] : null;
  return {
    zurueck: zurueck ? zurueck.titel : null,
    vor: vor ? vor.titel : null,
    tiefe: verlauf.stelle,
    gesamt: verlauf.schritte.length,
    /* Alle Überschriften in ihrer Reihenfolge. Der Browser führt sein
       eigenes Journal und braucht sie, um nach einem Neuladen dieselben
       Schritte zu benennen. */
    titel: verlauf.schritte.map((s) => s.titel),
  };
}

function verlaufGehen(richtung) {
  if (richtung === 'zurueck') {
    if (!verlauf.stelle) throw new Error('Es gibt nichts rückgängig zu machen.');
    const schritt = verlauf.schritte[verlauf.stelle - 1];
    stelleHer(schritt.n, 'vorher', schritt.vorher, schritt.praefixe);
    verlauf.stelle -= 1;
    return schritt.titel;
  }
  if (verlauf.stelle >= verlauf.schritte.length) {
    throw new Error('Es gibt nichts zu wiederholen.');
  }
  const schritt = verlauf.schritte[verlauf.stelle];
  stelleHer(schritt.n, 'nachher', schritt.nachher, schritt.praefixe);
  verlauf.stelle += 1;
  return schritt.titel;
}

/* ---------- Fortschritt ----------

   Alles, was länger dauert als ein Wimpernschlag, meldet hier seinen
   Stand, und der Browser hört über einen Ereignisstrom zu. Ohne das säße
   der Nutzer bei einer Minute Rechnen vor einem Knopf, der scheinbar
   nichts tut.

   Die Zahl macht die Uhr: Der Server schickt, wie lange die Arbeit
   voraussichtlich dauert und wie viel davon verstrichen ist, und der
   Browser rechnet daraus Bild für Bild seinen Balken, siehe
   zeigeFortschritt in studio.js. Die Zwischenstände der Skripte tragen
   nur noch ihren Text bei. Vorher zählten Arbeitsschritte, und weil ein
   Schritt mal drei Sekunden und mal zwei Minuten dauert, sprang der
   Balken in Stufen, deren Größe mit dem Rest der Arbeit nichts zu tun
   hatte.

   Der Strom kennt keinen Zustand: Wer sich anhängt, bekommt sofort den
   aktuellen Stand geschickt. Ein Neuladen mitten im Lauf verliert also
   nichts. */
const zuhoerer = new Set();
const laeufe = new Map();       // id -> { titel, schritt, seit, erwartet, fertig }
let laufZaehler = 0;

function fortschrittStand() {
  /* Der jüngste Lauf ist der, den der Nutzer gerade ausgelöst hat. Die
     verstrichene Zeit geht als Spanne hinaus, nicht als Uhrzeit: Der
     Browser hat seine eigene Uhr und sie geht anders. */
  const jetzt = Date.now();
  const alle = [...laeufe.entries()]
    .sort(([, a], [, b]) => b.seit - a.seit)
    .map(([id, l]) => ({
      id,
      titel: l.titel,
      schritt: l.schritt,
      erwartet: l.erwartet,
      verstrichen: jetzt - l.seit,
      fertig: l.fertig,
    }));
  return { laeufe: alle };
}

function sendeStand() {
  sendeAnAlle(`data: ${JSON.stringify(fortschrittStand())}\n\n`);
}

/* Der Stand der Dateien geht unter eigenem Ereignisnamen hinaus, damit
   die Oberfläche ihn nicht aus jeder Fortschrittsmeldung heraussuchen
   muss. Er kommt selten, der Fortschritt kommt im Sekundentakt.

   Ein einziges Speichern meldet Windows gern mehrfach, und zwar weiter
   auseinander, als eine Sammelpause abfangen könnte. Was zählt, ist
   nicht die Meldung, sondern der Stand: Ist er derselbe wie eben, geht
   nichts hinaus. */
let letzterStand = '';

function sendeStudioStand() {
  const jetzt = JSON.stringify(standDesStudios());
  if (jetzt === letzterStand) return;
  letzterStand = jetzt;
  sendeAnAlle(`event: stand\ndata: ${jetzt}\n\n`);
}

function sendeAnAlle(zeile) {
  for (const res of zuhoerer) {
    try { res.write(zeile); } catch { zuhoerer.delete(res); }
  }
}

/* ---------- Erwartete Dauer ----------

   Damit die Uhr den Balken führen kann, braucht jede Arbeit eine
   Schätzung, wie lange sie dauern wird. Geraten wird dafür nichts: Jeder
   abgeschlossene Abschnitt schreibt seine gemessene Dauer fort, und nach
   ein paar Läufen passt die Schätzung zu diesem Rechner statt zu dem, auf
   dem der Quelltext entstanden ist. Die Zahlen unten sind nur die
   Startwerte für den allerersten Lauf.

   Gemessen wird je Einheit, und die Einheit ist das, womit die Dauer
   wächst: beim Rechnen an Bildern ein Megapixel der Vorlage, beim Holen
   aus den Wikis eine Figur, sonst der Lauf selbst. Erst dadurch ist eine
   Messung auf das nächste, doppelt so große Bild übertragbar.

   Aufgehoben werden die letzten Messungen einzeln, nicht ihr Mittel, und
   geschätzt wird daraus der Wert, den vier von fünf unterbieten. Das
   Mittel wäre die falsche Wahl: Jeder zweite Lauf läge darüber, und der
   Balken bliebe jedes zweite Mal sichtbar bei fünfundneunzig hängen. Der
   Höchstwert wäre es auch, denn er kann nur steigen. Ein einziger Lauf
   bei ausgelasteter Grafikkarte höbe ihn für immer, und danach spränge
   der Balken jedes Mal von der Hälfte auf hundert. Das obere Fünftel
   fängt genau solche Ausreißer ab, ohne dass sie die Schätzung mitziehen,
   und liegt dabei bewusst eher zu hoch als zu tief.

   Das Fenster begrenzt die Reihe: Ein Rechner, der schneller geworden
   ist, wird nach so vielen Läufen auch wieder schneller geschätzt. */
const DAUERN = path.join(HIER, '.durations.json');
const PROBEN_FENSTER = 12;       // so viele Messungen bleiben je Schlüssel
const PROBEN_ANTEIL = 0.8;       // vier von fünf Läufen bleiben darunter

/* Millisekunden je Einheit, gemessen auf diesem Rechner und eher großzügig
   gerundet: Ein Balken, der früher ankommt als angekündigt, ist besser als
   einer, der lange bei neunundneunzig steht. Ein Schlüssel mit Doppelpunkt,
   etwa „gesicht:gfpgan“, fällt auf den Teil davor zurück, solange für das
   einzelne Modell noch nichts gemessen wurde. */
const DAUER_VORGABE = {
  hochrechnen: 130000,          // je Megapixel der Vorlage
  gesicht: 70000,               // je Megapixel der Vorlage
  freistellen: 700000,          // je Megapixel der Vorlage
  zuschnitt: 7000,              // je Megapixel der Vorlage
  'zuschnitt:portrait': 1800,   // je Megapixel der Vorlage
  analyse: 800,
  rand: 800,
  verlauf: 1500,
  'wiki:holen': 1300,           // je Figur
  'wiki:bauen': 26000,
};

/* Nichts unter null und nichts über einer Stunde: Das eine ist keine
   Messung, das andere ist etwas hängen geblieben. */
const messbar = (je) => je > 0 && je <= 3600000;

/* Je Schlüssel die letzten Messungen in Millisekunden je Einheit, älteste
   zuerst.

   Ältere Dateien halten statt der Messungen nur deren Mittel. Das zählt
   dann als eine einzelne Messung und wird von den nächsten Läufen
   überholt. Beim Zuschnitt ist inzwischen das Megapixel der Vorlage das
   Maß und nicht mehr der Lauf: Diese Werte sind in der neuen Einheit
   nicht mehr zu lesen und fallen weg. */
const EINHEIT_GEWECHSELT = /^zuschnitt(:|$)/;

let dauern = {};
try {
  for (const [schluessel, wert] of Object.entries(
    JSON.parse(fs.readFileSync(DAUERN, 'utf8')))) {
    if (EINHEIT_GEWECHSELT.test(schluessel)) continue;
    const gelesen = Array.isArray(wert && wert.proben) ? wert.proben : [wert && wert.ms];
    const proben = gelesen.filter(messbar).slice(-PROBEN_FENSTER);
    if (proben.length) dauern[schluessel] = proben;
  }
} catch { /* erster Start */ }

/* Der Wert, den PROBEN_ANTEIL der Messungen unterbieten. Bei nur zwei
   oder drei Messungen ist das schlicht die größte davon, und das ist die
   richtige Richtung: Solange kaum etwas bekannt ist, lieber zu lang
   schätzen als zu kurz. */
function probenSchwelle(proben) {
  const sortiert = [...proben].sort((a, b) => a - b);
  return sortiert[Math.max(0, Math.ceil(PROBEN_ANTEIL * sortiert.length) - 1)];
}

function jeEinheit(schluessel) {
  const proben = dauern[schluessel];
  if (proben && proben.length) return probenSchwelle(proben);
  return DAUER_VORGABE[schluessel]
    || DAUER_VORGABE[schluessel.split(':')[0]]
    || 5000;
}

function schaetzung(schluessel, einheiten) {
  if (!schluessel) return 5000;
  return jeEinheit(schluessel) * Math.max(0.05, Number(einheiten) || 1);
}

function merkeDauer(schluessel, einheiten, gemessen) {
  if (!schluessel) return;
  const je = Math.round(gemessen / Math.max(0.05, Number(einheiten) || 1));
  if (!messbar(je)) return;
  dauern[schluessel] = [...(dauern[schluessel] || []), je].slice(-PROBEN_FENSTER);
  schreibeDauern();
}

/* Neben den Messungen steht in der Datei die Schätzung, die aus ihnen
   folgt. Gelesen wird sie nie, sie steht nur da, damit von Hand zu sehen
   ist, worauf die Reihe hinausläuft. */
function schreibeDauern() {
  const inhalt = {};
  for (const [schluessel, proben] of Object.entries(dauern)) {
    inhalt[schluessel] = { ms: Math.round(jeEinheit(schluessel)), proben };
  }
  try {
    fs.writeFileSync(DAUERN, JSON.stringify(inhalt, null, 1), 'utf8');
  } catch { /* Dann hält die Schätzung nur bis zum Neustart. */ }
}

/* Eine Arbeit anmelden. Die Abschnitte sind { schluessel, einheiten, name }:
   der Schlüssel für die Schätzung, die Einheiten als ihr Maß, der Name als
   Zeile in der Anzeige. Ihre Schätzungen ergeben zusammen die erwartete
   Dauer des Laufs, und mehr braucht der Balken nicht.

   Die Abschnitte teilen den Balken nicht mehr auf, sie dienen nur noch der
   Schätzung und der Messung. Ein Abschnitt, der gar nicht anfällt, gehört
   deshalb nicht in die Liste, sonst liefe die Uhr für Arbeit, die niemand
   tut. */
function laufStarten(titel, abschnitte) {
  const id = ++laufZaehler;
  const teile = abschnitte.map((a) => ({
    ...a, erwartet: schaetzung(a.schluessel, a.einheiten),
  }));
  const seit = Date.now();
  laeufe.set(id, {
    titel,
    schritt: teile[0] ? teile[0].name : titel,
    seit,
    erwartet: Math.max(500, teile.reduce((summe, t) => summe + t.erwartet, 0)),
    fertig: false,
  });
  sendeStand();

  let stelle = 0;
  let abschnittSeit = seit;

  /* Was der Abschnitt gebraucht hat, geht in seine Schätzung ein, aber nur
     einmal: Ein zweiter Aufruf am selben Abschnitt, etwa weiter() dicht
     gefolgt von fertig(), maße sonst die Nullzeit dazwischen. */
  const messen = () => {
    const teil = teile[stelle];
    if (teil && !teil.gemessen) {
      teil.gemessen = true;
      merkeDauer(teil.schluessel, teil.einheiten, Date.now() - abschnittSeit);
    }
    abschnittSeit = Date.now();
  };

  return {
    /* Nur die Zeile unter dem Balken. Was ein Skript an Prozenten meldet,
       bleibt hier liegen: Die Zahl macht die Uhr. Gleicher Text heißt
       nichts Neues und geht auch nicht hinaus, sonst schickte allein die
       Engine ein paar hundert Meldungen je Lauf. */
    meldet(schritt) {
      const l = laeufe.get(id);
      if (!l || !schritt || schritt === l.schritt) return;
      l.schritt = schritt;
      sendeStand();
    },
    /* Zum nächsten Abschnitt weiterrücken. */
    weiter(schritt) {
      const l = laeufe.get(id);
      if (!l) return;
      messen();
      stelle = Math.min(stelle + 1, teile.length - 1);
      l.schritt = schritt || (teile[stelle] ? teile[stelle].name : l.schritt);
      sendeStand();
    },
    fertig() {
      const l = laeufe.get(id);
      if (!l) return;
      messen();
      l.fertig = true;
      sendeStand();
      /* Der Lauf bleibt noch stehen, solange der Browser seine vollen
         hundert Prozent zeigt, siehe ABSCHLUSS_STEHT in studio.js. Wer in
         diesem Moment neu lädt, sieht dann den fertigen Balken statt gar
         nichts. */
      setTimeout(() => { laeufe.delete(id); sendeStand(); }, 1200);
    },
    abbrechen() {
      laeufe.delete(id);
      sendeStand();
    },
  };
}

/* Eine Arbeit umhüllen, die keine eigenen Zwischenstände meldet. Sie
   bekommt einen einzigen Abschnitt, der Balken läuft mit dessen Schätzung
   mit und bleibt kurz vor dem Ende stehen, bis die Arbeit wirklich fertig
   ist. So behauptet er nie, fertig zu sein, bevor er es ist.

   Einheiten bleibt bei kurzen Arbeiten der Lauf selbst. Wer an Pixeln
   rechnet, gibt das Megapixel der Vorlage mit, sonst wären die Messungen
   einer kleinen und einer großen Vorlage derselbe Topf. */
async function mitFortschritt(titel, schluessel, arbeit, einheiten = 1) {
  const lauf = laufStarten(titel, [{ schluessel, einheiten, name: titel }]);
  try {
    const ergebnis = await arbeit(lauf);
    lauf.fertig();
    return ergebnis;
  } catch (fehler) {
    /* Bei einem Fehler verschwindet der Balken sofort, statt vorher noch
       auf hundert zu springen. Was schiefging, sagt die Meldung. Gemessen
       wird ein Abbruch nicht, seine Dauer sagt nichts über die eines
       gelungenen Laufs. */
    lauf.abbrechen();
    throw fehler;
  }
}

/* ---------- Hochskalieren ----------

   Real-ESRGAN als portable ncnn-Vulkan-Version rechnet eine Vorlage
   vierfach hoch, bevor daraus geschnitten wird. Das lohnt sich bei
   kleinen Vorlagen, deren Ausschnitt sonst unter 240 Pixel fiele.

   Gesucht wird die Engine wie Python: erst eine eigene Angabe über die
   Umgebungsvariable REALESRGAN_PFAD, dann vendor/realesrgan neben dieser
   Datei, dann der entpackte Download. Das Ergebnis landet als PNG bei den
   hochgeladenen Bildern und geht denselben Weg wie ein eigenes Bild.

   Die Kachelgröße ist fest auf 128 gesetzt: Mit der automatischen Wahl
   bricht die Intel-Grafik dieses Rechners mit „vkQueueSubmit failed“ ab
   und schreibt ein vollständig durchsichtiges Bild. Schlägt auch 128
   fehl, folgt genau ein zweiter Versuch mit 64. */
const ENGINE_MODELL = process.env.REALESRGAN_MODELL || 'realesrgan-x4plus';
const ENGINE_KANDIDATEN = [
  process.env.REALESRGAN_PFAD,
  path.join(HIER, 'vendor', 'realesrgan', 'realesrgan-ncnn-vulkan.exe'),
  path.join(os.homedir(), 'Downloads', 'realesrgan-ncnn-vulkan-20220424-windows',
    'realesrgan-ncnn-vulkan.exe'),
].filter(Boolean);

const ENGINE = ENGINE_KANDIDATEN.find((p) => fs.existsSync(p)) || null;
const ENGINE_INFO = ENGINE
  ? { ok: true, pfad: ENGINE, modell: ENGINE_MODELL }
  : {
    ok: false,
    grund: 'Real-ESRGAN wurde nicht gefunden. Die Engine gehört als '
      + 'realesrgan-ncnn-vulkan.exe nach tools/portrait-studio/vendor/realesrgan '
      + 'oder in den Downloads-Ordner, oder ihr Pfad steht in der '
      + 'Umgebungsvariable REALESRGAN_PFAD.',
  };

/* spawn statt execFile, damit stderr mitläuft: Bei einem Vulkan-Absturz
   steht der Fehler nur dort, und zwar noch während die Engine rechnet.
   Ihre Prozentzeilen bleiben ungelesen, den Balken führt die Uhr. */
function engineLauf(quelle, ziel, kachel) {
  return new Promise((fertig, scheitern) => {
    /* cwd ist der Ordner der Engine, dort liegt ihr models-Verzeichnis. */
    const kind = spawn(ENGINE,
      ['-i', quelle, '-o', ziel, '-n', ENGINE_MODELL, '-t', String(kachel)],
      { cwd: path.dirname(ENGINE) });

    let fehlertext = '';
    let abbruch = null;
    const uhr = setTimeout(() => { abbruch = 'Zeitüberschreitung'; kind.kill(); }, 900000);

    kind.stderr.on('data', (teil) => {
      const text = teil.toString();
      fehlertext += text;
      /* Bei einem Vulkan-Absturz schreibt die Engine trotzdem eine Datei
         und beendet sich mit 0. Der Fehler steht nur hier im Text. */
      if (/failed/i.test(text)) abbruch = text.split('\n').find((z) => /failed/i.test(z)).trim();
    });

    kind.on('error', (fehler) => { clearTimeout(uhr); scheitern(fehler); });
    kind.on('close', (code) => {
      clearTimeout(uhr);
      if (abbruch) return scheitern(new Error(abbruch));
      if (code !== 0) {
        return scheitern(new Error(fehlertext.trim().split('\n').pop() || 'Abbruch ' + code));
      }
      fertig();
    });
  });
}

/* Breite und Höhe aus dem Dateikopf, für PNG, WebP und JPEG. Gebraucht
   wird das für die Schätzung: Real-ESRGAN und die Gesichtsmodelle rechnen
   Pixel ab, ein doppelt so großes Bild dauert doppelt so lang. null heißt
   unbekannt, dann rechnet die Schätzung mit einem Megapixel.

   Die 64 Kilobyte reichen für die Köpfe aller drei Formate. Bei JPEG
   liegt das Maß hinter den Segmenten, deren Länge im Kopf steht, deshalb
   der Sprung von Marke zu Marke. */
function bildMass(pfad) {
  let fd;
  try {
    fd = fs.openSync(pfad, 'r');
    const kopf = Buffer.alloc(65536);
    const gelesen = fs.readSync(fd, kopf, 0, kopf.length, 0);
    if (gelesen < 32) return null;

    if (kopf.readUInt32BE(0) === 0x89504e47) {
      return { breite: kopf.readUInt32BE(16), hoehe: kopf.readUInt32BE(20) };
    }

    if (kopf.toString('ascii', 0, 4) === 'RIFF' && kopf.toString('ascii', 8, 12) === 'WEBP') {
      /* Drei Fassungen: verlustbehaftet, verlustfrei und die erweiterte
         mit Alphakanal. Jede schreibt ihr Maß woandershin. */
      const art = kopf.toString('ascii', 12, 16);
      if (art === 'VP8X') {
        return { breite: kopf.readUIntLE(24, 3) + 1, hoehe: kopf.readUIntLE(27, 3) + 1 };
      }
      if (art === 'VP8L') {
        const bits = kopf.readUInt32LE(21);
        return { breite: (bits & 0x3fff) + 1, hoehe: ((bits >>> 14) & 0x3fff) + 1 };
      }
      if (art === 'VP8 ') {
        return { breite: kopf.readUInt16LE(26) & 0x3fff, hoehe: kopf.readUInt16LE(28) & 0x3fff };
      }
      return null;
    }

    if (kopf[0] === 0xff && kopf[1] === 0xd8) {
      let i = 2;
      while (i + 9 < gelesen) {
        if (kopf[i] !== 0xff) { i += 1; continue; }
        const marke = kopf[i + 1];
        /* Füllbytes und die Marken ohne Rumpf haben keine Länge. */
        if (marke === 0xff || marke === 0xd8 || marke === 0x01
          || (marke >= 0xd0 && marke <= 0xd7)) { i += 2; continue; }
        /* Die Rahmenköpfe SOF0 bis SOF15 tragen das Maß. Die drei Marken
           dazwischen bedeuten etwas anderes, sie sind Tabellen. */
        if (marke >= 0xc0 && marke <= 0xcf
          && marke !== 0xc4 && marke !== 0xc8 && marke !== 0xcc) {
          return { hoehe: kopf.readUInt16BE(i + 5), breite: kopf.readUInt16BE(i + 7) };
        }
        i += 2 + kopf.readUInt16BE(i + 2);
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function megapixel(pfad) {
  const mass = bildMass(pfad);
  if (!mass || !mass.breite || !mass.hoehe) return 1;
  return Math.max(0.05, (mass.breite * mass.hoehe) / 1000000);
}

/* Breite und Höhe aus dem PNG-Kopf. null heißt: keine brauchbare Datei.
   Anders als bildMass ist das zugleich die Prüfung, ob überhaupt ein PNG
   herausgekommen ist. */
function pngMass(pfad) {
  let fd;
  try {
    const kopf = Buffer.alloc(24);
    fd = fs.openSync(pfad, 'r');
    if (fs.readSync(fd, kopf, 0, 24, 0) < 24) return null;
    if (kopf.readUInt32BE(0) !== 0x89504e47) return null;
    return { breite: kopf.readUInt32BE(16), hoehe: kopf.readUInt32BE(20) };
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/* ---------- Gesichter neu aufbauen ----------

   Real-ESRGAN schärft Kanten, es kann aber keine Hautporen, Wimpern oder
   Iris erfinden. Gesichter geraten dadurch glatt und wächsern. GFPGAN und
   CodeFormer schneiden das Gesicht heraus und bauen es aus einem
   gelernten Gesichtsmodell neu auf, siehe services/facial-recognition/enhance-face.py.

   Das ist ein zweiter Schritt nach dem Hochskalieren und ein eigenes
   Python: Die Modelle brauchen PyTorch, das in der schlanken Umgebung des
   Porträt-Skills nichts zu suchen hat. Fehlt die Umgebung, bleiben die
   Modelle in der Oberfläche gesperrt und das Hochskalieren geht ohne. */
const GESICHT_SKRIPT = path.join(HIER, 'services', 'facial-recognition', 'enhance-face.py');
const GESICHT_KANDIDATEN = [
  process.env.GESICHT_PYTHON,
  path.join(os.homedir(), 'AppData', 'Local', 'gesicht', 'Scripts', 'python.exe'),
].filter(Boolean);

let GESICHT = null;
let GESICHT_INFO = { ok: false, modelle: [], grund: 'noch nicht geprüft' };

function gesichtSuchen() {
  return new Promise((fertig) => {
    let i = 0;
    const naechster = () => {
      if (i >= GESICHT_KANDIDATEN.length) {
        GESICHT_INFO = {
          ok: false,
          modelle: [],
          grund: 'Die Gesichtsveredelung steht nicht bereit. Einrichten mit '
            + 'services/facial-recognition/install-models.py im Studioordner, '
            + 'siehe den Kopf dieser Datei.',
        };
        return fertig();
      }
      const kandidat = GESICHT_KANDIDATEN[i++];
      execFile(kandidat, [GESICHT_SKRIPT, 'pruefen'], { timeout: 120000 },
        (fehler, aus) => {
          if (fehler) return naechster();
          try {
            const info = JSON.parse(aus.trim().split('\n').pop());
            if (!info.modelle || !info.modelle.length) return naechster();
            GESICHT = kandidat;
            GESICHT_INFO = { ok: true, ...info, pfad: kandidat };
            return fertig();
          } catch {
            return naechster();
          }
        });
    };
    naechster();
  });
}

/* enhance-face.py meldet seinen Stand als Zeilen „FORTSCHRITT <0..1> <Text>“
   auf stderr, das Ergebnis wie gehabt als JSON auf stdout. */
const FORTSCHRITT_ZEILE = /^FORTSCHRITT\s+([0-9.]+)\s*(.*)$/;

function gesichtLauf(quelle, ziel, modell, treue, melde) {
  return new Promise((fertigStellen, scheitern) => {
    const kind = spawn(GESICHT, [GESICHT_SKRIPT, 'veredeln', '--bild', quelle,
      '--ziel', ziel, '--modell', modell, '--treue', String(treue)]);

    let aus = '';
    let err = '';
    let rest = '';
    const uhr = setTimeout(() => kind.kill(), 900000);

    kind.stdout.on('data', (teil) => { aus += teil.toString(); });
    kind.stderr.on('data', (teil) => {
      const text = rest + teil.toString();
      const zeilen = text.split('\n');
      rest = zeilen.pop();
      for (const zeile of zeilen) {
        const treffer = FORTSCHRITT_ZEILE.exec(zeile.trim());
        if (treffer) {
          if (melde) melde(parseFloat(treffer[1]), treffer[2].trim() || null);
        } else {
          err += zeile + '\n';
        }
      }
    });

    kind.on('error', (fehler) => { clearTimeout(uhr); scheitern(fehler); });
    kind.on('close', () => {
      clearTimeout(uhr);
      const zeile = aus.trim().split('\n').pop();
      let daten = null;
      try { daten = JSON.parse(zeile); } catch { /* gleich unten */ }
      if (daten && daten.fehler) return scheitern(new Error(daten.fehler));
      if (!daten) {
        return scheitern(new Error('Unlesbare Antwort von enhance-face.py: '
          + (err.trim().split('\n').pop() || zeile)));
      }
      fertigStellen(daten);
    });
  });
}

/* ---------- Die Kette ----------

   Zwei Schritte, zwei Zwischenspeicher. Das Hochrechnen dauert etwa eine
   Minute, das Gesicht eine halbe. Wer nach GFPGAN noch CodeFormer sehen
   will, soll dafür nicht wieder hochrechnen müssen, deshalb hängt der
   erste Speicher nur an der Vorlage und der zweite zusätzlich am Modell.

   Ein neuer Name je Schritt hält die Zwischenstände auseinander, die
   Oberfläche zeigt ihn am Chip der Vorlage. */
const skaliert = new Map();      // Vorlage -> Pfad des hochgerechneten Bildes
const veredelt = new Map();      // Vorlage + Modell + Treue -> fertiges Ergebnis
let engineLaeuft = false;

function neueId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* Liegt das hochgerechnete Bild schon bereit? Das entscheidet vor dem
   Start, ob der Abschnitt überhaupt in die erwartete Dauer gehört. */
function esrganBekannt(pfad) {
  const bekannt = skaliert.get(pfad + '|' + fs.statSync(pfad).mtimeMs);
  return !!(bekannt && fs.existsSync(bekannt));
}

async function esrganSchritt(pfad, lauf) {
  const schluessel = pfad + '|' + fs.statSync(pfad).mtimeMs;
  const bekannt = skaliert.get(schluessel);
  if (bekannt && fs.existsSync(bekannt)) {
    /* Kein weiter() und keine Meldung: Der Abschnitt steht gar nicht in
       der Liste, der Lauf ist schon beim Gesicht, und dessen Name steht
       auch schon da. */
    return { pfad: bekannt, wiederverwendet: true };
  }

  fs.mkdirSync(UPLOADS, { recursive: true });
  const ziel = path.join(UPLOADS, neueId() + '.png');
  try {
    await engineLauf(pfad, ziel, 128);
  } catch {
    await engineLauf(pfad, ziel, 64);
  }
  if (!pngMass(ziel)) throw new Error('Die Engine hat keine lesbare Datei geschrieben.');
  skaliert.set(schluessel, ziel);
  if (lauf) lauf.weiter();
  return { pfad: ziel, wiederverwendet: false };
}

async function hochskalieren(quelle, modell, treue) {
  const { pfad, vorlage } = quellePfad(quelle);
  const stamm = vorlage.replace(/\.[^.]+$/, '');
  const kette = modell === 'ohne' ? '' : `|${modell}|${treue}`;
  const schluessel = pfad + '|' + fs.statSync(pfad).mtimeMs + kette;

  const fertig = veredelt.get(schluessel);
  const bekannt = fertig && hochgeladen.get(fertig.id);
  if (bekannt && fs.existsSync(bekannt.pfad)) return { ...fertig, wiederverwendet: true };

  if (engineLaeuft) throw new Error('Es läuft schon eine Berechnung, kurz warten.');
  if (modell !== 'ohne' && !GESICHT) throw new Error(GESICHT_INFO.grund);
  engineLaeuft = true;
  const beginn = Date.now();

  /* Beide Schritte rechnen an Pixeln, also ist das Megapixel der Vorlage
     ihr Maß. Was schon im Speicher liegt, bleibt draußen: Wer nach GFPGAN
     noch CodeFormer sehen will, wartet nur auf das Gesicht. */
  const vorlageMass = megapixel(pfad);
  const abschnitte = [];
  if (!esrganBekannt(pfad)) {
    abschnitte.push({
      schluessel: 'hochrechnen', einheiten: vorlageMass, name: 'Bild wird hochgerechnet',
    });
  }
  if (modell !== 'ohne') {
    abschnitte.push({
      schluessel: 'gesicht:' + modell, einheiten: vorlageMass,
      name: 'Gesichter werden neu aufgebaut',
    });
  }
  if (!abschnitte.length) {
    abschnitte.push({ schluessel: null, einheiten: 1, name: 'Aus dem Speicher übernommen' });
  }
  const lauf = laufStarten('Upscale', abschnitte);

  try {
    const grossesBild = await esrganSchritt(pfad, lauf);
    let ergebnisPfad = grossesBild.pfad;
    let gesichter = null;
    let hinweis = null;

    if (modell !== 'ohne') {
      const ziel = path.join(UPLOADS, neueId() + '.png');
      const bericht = await gesichtLauf(grossesBild.pfad, ziel, modell, treue,
        (anteil, text) => lauf.meldet(text));
      if (bericht.gesichter) {
        ergebnisPfad = ziel;
        gesichter = bericht.gesichter;
        if (bericht.misslungen && bericht.misslungen.length) {
          hinweis = bericht.misslungen[0];
        }
      } else {
        /* Kein Gesicht gefunden: Dann gibt es nichts zu veredeln, und das
           hochgerechnete Bild ist das Ergebnis. Für Masken, Rüstungen und
           alles Nichtmenschliche ist das der Normalfall. */
        gesichter = 0;
        hinweis = 'kein-gesicht';
      }
    }

    const mass = pngMass(ergebnisPfad);
    if (!mass) throw new Error('Das Ergebnis ist keine lesbare Datei.');
    const id = neueId();
    const name = `${stamm}-4x${gesichter ? '-' + modell : ''}.png`;
    hochgeladen.set(id, { pfad: ergebnisPfad, name });
    const ergebnis = { id, name, ...mass, gesichter, hinweis };
    veredelt.set(schluessel, ergebnis);
    lauf.fertig();
    return { ...ergebnis, dauer: Math.round((Date.now() - beginn) / 1000) };
  } catch (fehler) {
    lauf.abbrechen();
    throw fehler;
  } finally {
    engineLaeuft = false;
  }
}

/* ---------- Freistellen ----------

   Den Hintergrund einer deckenden Vorlage entfernen, damit sie mit
   Alphakanal auf die Bühne kommt. Das ist mehr als Bequemlichkeit: Ohne
   Alpha schätzt der Vorschlag den Kopf allein aus der Gesichtsbox, und
   der Rahmen der Charakterseite bekommt beim Ganzkörperbild einen Kasten
   statt einer freistehenden Figur.

   Gerechnet wird örtlich mit rembg und einem ONNX-Modell aus ~/.u2net,
   ohne jede Verbindung nach draußen. Was die Wege taugen und warum sie
   so gewählt sind, steht im Kopf von remove-background.py.

   Wieder ein eigenes Python, aus demselben Grund wie bei den
   Gesichtsmodellen: rembg und onnxruntime wiegen zusammen ein Vielfaches
   der schlanken Umgebung, mit der crop-image.py zuschneidet. Fehlt es, bleibt
   der Knopf gesperrt und sagt beim Zeigen, was zu tun ist. */
const FREI_SKRIPT = path.join(HIER, 'services', 'remove-background.py');
const FREI_KANDIDATEN = [
  process.env.FREISTELLEN_PYTHON,
  path.join(os.homedir(), 'AppData', 'Local', 'mvp', 'Scripts', 'python.exe'),
  'python',
  'py',
].filter(Boolean);

let FREI = null;
let FREI_INFO = { ok: false, modelle: [], grund: 'noch nicht geprüft' };

function freiSuchen() {
  return new Promise((fertig) => {
    let i = 0;
    let letzterGrund = null;
    const naechster = () => {
      if (i >= FREI_KANDIDATEN.length) {
        FREI_INFO = {
          ok: false,
          modelle: [],
          grund: letzterGrund || 'Das Freistellen steht nicht bereit. Es braucht '
            + 'eine Python-Umgebung mit rembg, onnxruntime und OpenCV, dazu '
            + 'mindestens ein Modell in ~/.u2net. Siehe den Kopf von '
            + 'tools/portrait-studio/services/remove-background.py.',
        };
        return fertig();
      }
      const kandidat = FREI_KANDIDATEN[i++];
      execFile(kandidat, [FREI_SKRIPT, 'pruefen'], { timeout: 120000 },
        (fehler, aus) => {
          if (fehler) return naechster();
          try {
            const info = JSON.parse(aus.trim().split('\n').pop());
            /* Ein Python mit rembg, aber ohne Modell ist kein Treffer. Sein
               Grund ist aber der hilfreichste, den es zu melden gibt: Er
               nennt den Ordner, in den das Modell gehört. */
            if (!info.ok) {
              if (info.grund) letzterGrund = info.grund;
              return naechster();
            }
            FREI = kandidat;
            FREI_INFO = { ok: true, ...info, pfad: kandidat };
            return fertig();
          } catch {
            return naechster();
          }
        });
    };
    naechster();
  });
}

/* Wie gesichtLauf: Zwischenstände als „FORTSCHRITT“ auf stderr, das
   Ergebnis als JSON auf stdout. */
function freiLauf(quelle, ziel, modell, feinschliff, saum, melde) {
  return new Promise((fertigStellen, scheitern) => {
    const kind = spawn(FREI, [FREI_SKRIPT, 'frei', '--bild', quelle,
      '--ziel', ziel, '--modell', modell,
      '--feinschliff', feinschliff ? '1' : '0', '--saum', String(saum)]);

    let aus = '';
    let err = '';
    let rest = '';
    const uhr = setTimeout(() => kind.kill(), 900000);

    kind.stdout.on('data', (teil) => { aus += teil.toString(); });
    kind.stderr.on('data', (teil) => {
      const text = rest + teil.toString();
      const zeilen = text.split('\n');
      rest = zeilen.pop();
      for (const zeile of zeilen) {
        const treffer = FORTSCHRITT_ZEILE.exec(zeile.trim());
        if (treffer) {
          if (melde) melde(parseFloat(treffer[1]), treffer[2].trim() || null);
        } else {
          err += zeile + '\n';
        }
      }
    });

    kind.on('error', (fehler) => { clearTimeout(uhr); scheitern(fehler); });
    kind.on('close', () => {
      clearTimeout(uhr);
      const zeile = aus.trim().split('\n').pop();
      let daten = null;
      try { daten = JSON.parse(zeile); } catch { /* gleich unten */ }
      if (daten && daten.fehler) return scheitern(new Error(daten.fehler));
      if (!daten) {
        return scheitern(new Error('Unlesbare Antwort von remove-background.py: '
          + (err.trim().split('\n').pop() || zeile)));
      }
      fertigStellen(daten);
    });
  });
}

/* Derselbe Speicher wie beim Hochskalieren: Wer nach BiRefNet noch ISNet
   sehen will, soll den ersten Lauf nicht verlieren, und wer zweimal
   dasselbe drückt, bekommt es sofort. */
const freigestellt = new Map();  // Vorlage + Einstellungen -> Ergebnis
let freiLaeuft = false;

async function freistellen(quelle, modell, feinschliff, saum) {
  const { pfad, vorlage } = quellePfad(quelle);
  const stamm = vorlage.replace(/\.[^.]+$/, '');
  const schluessel = [pfad, fs.statSync(pfad).mtimeMs, modell,
    feinschliff ? 1 : 0, saum].join('|');

  const fertig = freigestellt.get(schluessel);
  const bekannt = fertig && hochgeladen.get(fertig.id);
  if (bekannt && fs.existsSync(bekannt.pfad)) return { ...fertig, wiederverwendet: true };

  if (freiLaeuft) throw new Error('Es läuft schon ein Freistellen, kurz warten.');
  freiLaeuft = true;
  const beginn = Date.now();

  /* Ein Abschnitt. Der Feinschliff steht im Schlüssel, denn er ist ein
     zweiter Durchgang am Ausschnitt und verdoppelt die Dauer fast. */
  const lauf = laufStarten('Freistellen', [{
    schluessel: `freistellen:${modell}${feinschliff ? ':fein' : ''}`,
    einheiten: megapixel(pfad),
    name: 'Hintergrund wird entfernt',
  }]);

  try {
    fs.mkdirSync(UPLOADS, { recursive: true });
    const ziel = path.join(UPLOADS, neueId() + '.png');
    const bericht = await freiLauf(pfad, ziel, modell, feinschliff, saum,
      (anteil, text) => lauf.meldet(text));

    const id = neueId();
    const name = `${stamm}-frei.png`;
    hochgeladen.set(id, { pfad: ziel, name });
    const ergebnis = {
      id, name, breite: bericht.breite, hoehe: bericht.hoehe,
      modell: bericht.modell, anteil: bericht.anteil, kante: bericht.kante,
      feinschliff: bericht.feinschliff, saum: bericht.saum,
    };
    freigestellt.set(schluessel, ergebnis);
    lauf.fertig();
    return { ...ergebnis, dauer: Math.round((Date.now() - beginn) / 1000) };
  } catch (fehler) {
    lauf.abbrechen();
    throw fehler;
  } finally {
    freiLaeuft = false;
  }
}

/* ---------- Hochgeladene Bilder ---------- */

const hochgeladen = new Map();   // id -> { pfad, name }

function uploadAblegen(daten, name) {
  fs.mkdirSync(UPLOADS, { recursive: true });
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const endung = (path.extname(name || '') || '.png').toLowerCase();
  const pfad = path.join(UPLOADS, id + endung);
  fs.writeFileSync(pfad, daten);
  hochgeladen.set(id, { pfad, name: name || id + endung });
  return id;
}

/* ---------- Urfassungen ----------

   Beim Ganzkörperbild ist die Fassung ihre eigene Vorlage, und beim
   Porträt kann das bestehende Bild die Vorlage sein. Speichern schreibt
   dann in genau die Datei, aus der die Bühne ihre Pixel hat.

   Beim zweiten Speichern stünde dort schon das Ergebnis des ersten, und
   derselbe Ausschnitt griffe ein zweites Mal zu: Wer den Rahmen nach
   rechts erweitert, sähe die Figur bei jedem Speichern ein Stück weiter
   nach links rutschen, obwohl die Vorschau stillsteht. Die Bühne merkt
   davon nichts, sie hat ihre Vorlage längst im Speicher.

   Deshalb legt der Server die Datei beiseite, bevor er sie das erste Mal
   überschreibt, und schneidet von da an aus dieser Urfassung. Solange die
   Bühne dieselben Pixel zeigt, trifft jeder Zuschnitt damit dieselbe
   Fläche wie der erste, und zweimal dasselbe Speichern ergibt zweimal
   dieselbe Datei.

   Woran der Server das erkennt, ist die Marke: eine Zahl, die die Bühne
   neu würfelt, sobald sie eine Vorlage frisch von der Platte lädt. Eine
   neue Marke heißt, dass die Bühne den gespeicherten Stand sieht, und
   dann ist die beiseitegelegte Fassung nicht mehr die richtige. */

const GRENZE_URFASSUNGEN = 24;   // ältere fallen mitsamt Datei heraus
const urfassungen = new Map();   // marke -> { schluessel, pfad }

const urfassungSchluessel = (quelle) => quelle.typ + ':' + quelle.name;

/* Die beiseitegelegte Fassung zu dieser Marke, sofern sie zu derselben
   Vorlage gehört und noch auf der Platte liegt. */
function urfassung(quelle) {
  if (!quelle || !quelle.marke) return null;
  const eintrag = urfassungen.get(quelle.marke);
  if (!eintrag || eintrag.schluessel !== urfassungSchluessel(quelle)) return null;
  if (fs.existsSync(eintrag.pfad)) return eintrag.pfad;
  urfassungen.delete(quelle.marke);
  return null;
}

/* Die Vorlage beiseitelegen, bevor das Ziel sie überschreibt, und den
   Weg dorthin melden. Ohne Marke gibt es nichts festzuhalten, dann
   bleibt es beim Pfad der Datei selbst. */
function bewahreUrfassung(quelle, pfad) {
  const schon = urfassung(quelle);
  if (schon) return schon;
  if (!quelle || !quelle.marke) return pfad;
  fs.mkdirSync(URFASSUNGEN, { recursive: true });
  const ziel = path.join(URFASSUNGEN, neueId() + path.extname(pfad));
  fs.copyFileSync(pfad, ziel);
  urfassungen.set(quelle.marke, { schluessel: urfassungSchluessel(quelle), pfad: ziel });
  /* Map hält die Reihenfolge des Eintragens, vorne steht also die
     älteste. Sie geht mitsamt ihrer Datei, sonst wüchse der Ordner im
     Temp-Verzeichnis über eine lange Sitzung immer weiter. */
  while (urfassungen.size > GRENZE_URFASSUNGEN) {
    const [marke, alt] = urfassungen.entries().next().value;
    urfassungen.delete(marke);
    try { fs.unlinkSync(alt.pfad); } catch { /* schon weg, auch recht */ }
  }
  return ziel;
}

/* ---------- Quelle auflösen ----------

   Nur Dateien aus den beiden Bildordnern und frisch hochgeladene Bilder
   sind erlaubt. Damit kann über die Schnittstelle nichts Beliebiges vom
   Rechner gelesen werden.

   „portrait“ ist das bestehende Porträt als Vorlage: Es lässt sich damit
   neu beschneiden, hochrechnen und freistellen, statt nur danebenzuliegen.
   Beim Speichern ist die Zieldatei dann dieselbe Datei. Das geht, weil
   crop-image.py die Vorlage vollständig einliest, bevor es schreibt, und
   der Server vorher ohnehin eine Sicherung zieht. */
function quellePfad(quelle) {
  if (!quelle || typeof quelle !== 'object') throw new Error('Quelle fehlt.');
  if (quelle.typ === 'fullsize' || quelle.typ === 'portrait') {
    if (!/^[a-z0-9-]+$/.test(quelle.name || '')) throw new Error('Ungültige Quelle.');
    const gk = quelle.typ === 'fullsize';
    const pfad = path.join(gk ? FULLSIZE : PORTRAITS, quelle.name + '.webp');
    /* Hat diese Bühne die Datei schon einmal überschrieben, liegt das,
       was sie zeigt, beiseite. Von dort kommt es dann auch, sonst
       rechnete jeder weitere Schnitt auf dem eigenen Ergebnis weiter. */
    const bewahrt = urfassung(quelle);
    if (bewahrt) return { pfad: bewahrt, vorlage: quelle.name + '.webp' };
    if (!fs.existsSync(pfad)) {
      throw new Error((gk ? 'Ganzkörperbild fehlt: ' : 'Porträt fehlt: ') + quelle.name);
    }
    return { pfad, vorlage: quelle.name + '.webp' };
  }
  if (quelle.typ === 'upload') {
    const eintrag = hochgeladen.get(quelle.id);
    if (!eintrag) throw new Error('Das hochgeladene Bild ist nicht mehr da.');
    return { pfad: eintrag.pfad, vorlage: eintrag.name };
  }
  throw new Error('Unbekannte Quelle.');
}

/* ---------- Speichern ---------- */

/* Nur Ziele, die es in der Datenbank gibt. Damit schreibt die
   Schnittstelle nichts an eine beliebige Stelle im Repo. */
function zielErlaubt(datei, bereich) {
  const figuren = baueFiguren();
  const erlaubt = bereich === 'ganzkoerper'
    ? figuren.flatMap((f) => f.ganzkoerper.map((z) => z.datei))
    : figuren.flatMap((f) => f.ziele.map((z) => z.datei));
  return new Set(erlaubt).has(datei);
}

function sichern(datei, gk) {
  const pfad = path.join(gk ? FULLSIZE : PORTRAITS, datei + '.webp');
  if (!fs.existsSync(pfad)) return null;
  fs.mkdirSync(SICHERUNG, { recursive: true });
  const stempel = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const ziel = path.join(SICHERUNG, `${gk ? 'gk-' : ''}${datei}-${stempel}.webp`);
  fs.copyFileSync(pfad, ziel);
  return path.relative(REPO, ziel).replace(/\\/g, '/');
}

/* ---------- Der Sicherungsordner ----------

   Vor jedem Eingriff legt das Studio eine Kopie der Datei nach
   .sicherung, mit dem Zeitpunkt im Namen. Das ist die Rückfallebene für
   den Fall, dass etwas schiefging und der Verlauf nicht mehr hilft: Er
   gilt nur für die laufende Sitzung, die Sicherung überlebt den Neustart.

   Dafür wächst sie unbegrenzt, und was einmal drin liegt, kam bisher nur
   von Hand wieder heraus. Die Funktionen hier machen den Ordner von der
   Oberfläche aus lesbar: auflisten, eine Fassung zurückholen, aufräumen.

   Zwei Namensformen sind über die Zeit entstanden, beide stehen noch im
   Ordner. Die ältere hängt den Zeitpunkt hinten an den ganzen Dateinamen
   (chars.js-2026-08-04T10-57-05), die jüngere setzt ihn vor die Endung
   (chars-2026-08-04T10-57-05.js). Gelesen werden beide, geschrieben nur
   noch die jüngere. */

/* Welche Quelldatei hinter einem Rumpf steckt. Bilder brauchen das nicht,
   ihr Ordner steht am gk-Präfix. */
const SICHERUNG_QUELLEN = {
  chars: 'js/chars.js',
  'chars.js': 'js/chars.js',
  looks: 'js/looks.js',
  'looks.js': 'js/looks.js',
  'data.js': 'js/data.js',
  'profiles.js': 'js/profiles.js',
  'facts.js': 'js/facts.js',
  'galaxy-config.js': 'js/galaxy-config.js',
  'CREDITS.md': 'assets/characters/fullsize/CREDITS.md',
};

const SICHERUNG_MUSTER = /^(.+)-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})(\.webp|\.js)?$/;

/* Aus dem Zeitstempel im Namen wieder ein Datum machen. Er ist eine ISO-
   Zeit in Ortszeit-Schreibweise, bei der Doppelpunkte zu Bindestrichen
   wurden, siehe stempelJetzt(). */
function stempelLesen(stempel) {
  const [tag, zeit] = stempel.split('T');
  return new Date(`${tag}T${zeit.replace(/-/g, ':')}`);
}

/* Einen Dateinamen aus .sicherung auseinandernehmen. Gibt null zurück,
   wenn er nicht dem Muster folgt: Was da von Hand hineingelegt wurde,
   soll die Oberfläche nicht anfassen. */
function sicherungDeuten(name) {
  const treffer = SICHERUNG_MUSTER.exec(name);
  if (!treffer) return null;
  const [, rumpf, stempel, endung] = treffer;
  const zeit = stempelLesen(stempel);
  if (Number.isNaN(zeit.getTime())) return null;

  if (endung === '.webp') {
    const gk = rumpf.startsWith('gk-');
    const datei = gk ? rumpf.slice(3) : rumpf;
    return {
      name,
      art: gk ? 'ganzkoerper' : 'portrait',
      datei,
      ziel: `assets/characters/${gk ? 'fullsize' : 'portraits'}/${datei}.webp`,
      zeit: zeit.getTime(),
    };
  }

  const quelle = SICHERUNG_QUELLEN[endung ? rumpf + endung : rumpf]
    || SICHERUNG_QUELLEN[rumpf];
  if (!quelle) return null;
  return { name, art: 'quelle', datei: path.basename(quelle), ziel: quelle, zeit: zeit.getTime() };
}

/* Der Ordnerinhalt, gedeutet und mit der jüngsten Sicherung zuerst. Was
   dem Muster nicht folgt, wird nur gezählt: Von Hand Hineingelegtes soll
   die Oberfläche weder anzeigen noch löschen. */
function sicherungRoh() {
  let namen = [];
  try { namen = fs.readdirSync(SICHERUNG); } catch { return { eintraege: [], bytes: 0, fremd: 0 }; }

  const eintraege = [];
  let bytes = 0;
  let fremd = 0;
  for (const name of namen) {
    const eintrag = sicherungDeuten(name);
    let stat;
    try { stat = fs.statSync(path.join(SICHERUNG, name)); } catch { continue; }
    if (!stat.isFile()) continue;
    if (!eintrag) { fremd += 1; continue; }
    bytes += stat.size;
    eintraege.push({ ...eintrag, bytes: stat.size });
  }
  eintraege.sort((a, b) => b.zeit - a.zeit || a.name.localeCompare(b.name, 'de'));
  return { eintraege, bytes, fremd };
}

/* Dasselbe für die Oberfläche: mit dem Namen der Figur zu jedem Bild,
   sonst stünde in der Liste nur ein Dateiname. Das kostet einen Durchlauf
   durch data.js, deshalb steht es nicht schon in sicherungRoh(). */
function sicherungListe() {
  const roh = sicherungRoh();

  /* Der Figurenname zur Datei, bei abweichenden Fassungen mit deren
     Beschriftung dahinter. „Standard“ sagt nichts und bleibt weg. */
  const titel = new Map();
  const merkeTitel = (art, figur, ziel) => {
    titel.set(art + '/' + ziel.datei,
      ziel.label && ziel.label !== 'Standard' ? `${figur.name} · ${ziel.label}` : figur.name);
  };
  try {
    for (const figur of baueFiguren()) {
      for (const ziel of figur.ziele) merkeTitel('portrait', figur, ziel);
      for (const ziel of figur.ganzkoerper) merkeTitel('ganzkoerper', figur, ziel);
    }
  } catch { /* ohne Namen eben nur die Dateinamen */ }

  roh.eintraege = roh.eintraege.map((e) => ({
    ...e,
    titel: titel.get(e.art + '/' + e.datei) || null,
    /* Steht das Ziel überhaupt noch da? Fehlt es, ist die Sicherung das
       Einzige, was von der Datei geblieben ist. */
    vorhanden: fs.existsSync(path.join(REPO, e.ziel)),
  }));
  return roh;
}

/* Eine Sicherung annehmen, aber nur eine, die auch wirklich eine ist.
   Der Name kommt von außen, deshalb wird er nicht zusammengesetzt,
   sondern gegen den Ordnerinhalt geprüft. */
function sicherungPfad(name) {
  if (typeof name !== 'string' || path.basename(name) !== name || !sicherungDeuten(name)) {
    throw new Error('Das ist kein Name aus dem Sicherungsordner.');
  }
  const pfad = path.join(SICHERUNG, name);
  if (!fs.existsSync(pfad)) throw new Error(`${name} liegt nicht mehr in der Sicherung.`);
  return pfad;
}

/* Eine Fassung zurückholen. Was gerade an der Stelle steht, wird vorher
   selbst gesichert, sonst tauschte ein Griff in die Rückfallebene genau
   das weg, wovor sie schützen soll. Der Schritt geht in den Verlauf, ein
   Strg+Z nimmt ihn also zurück. */
function sicherungZurueck(name) {
  const quelle = sicherungPfad(name);
  const eintrag = sicherungDeuten(name);
  const ziel = path.join(REPO, eintrag.ziel);
  const stempel = stempelJetzt();

  return mitVerlauf(
    `Zurückgeholt: ${eintrag.ziel}`,
    eintrag.art === 'quelle' ? [eintrag.ziel] : [],
    eintrag.art === 'quelle' ? [] : [eintrag.datei],
    () => {
      fs.mkdirSync(SICHERUNG, { recursive: true });
      if (fs.existsSync(ziel)) {
        if (eintrag.art === 'quelle') sichereQuelle(ziel, stempel);
        else sichern(eintrag.datei, eintrag.art === 'ganzkoerper');
      }
      fs.mkdirSync(path.dirname(ziel), { recursive: true });
      fs.copyFileSync(quelle, ziel);
      return { geaendert: true, ziel: eintrag.ziel };
    },
  );
}

/* Aufräumen. Ohne Angabe fliegt alles heraus, sonst die genannten Namen.
   „veraltet“ behält je Ziel die jüngste Fassung und wirft die älteren
   weg: Das ist der Griff, der den Ordner klein hält, ohne die letzte
   Rückfallebene zu nehmen. */
function sicherungLoeschen({ namen, alle, veraltet }) {
  const { eintraege } = sicherungRoh();
  let weg = [];

  if (alle) {
    weg = eintraege.map((e) => e.name);
  } else if (veraltet) {
    const gesehen = new Set();
    for (const e of eintraege) {            // schon jüngste zuerst sortiert
      const schluessel = e.art + '/' + e.ziel;
      if (gesehen.has(schluessel)) weg.push(e.name);
      else gesehen.add(schluessel);
    }
  } else {
    const bekannt = new Set(eintraege.map((e) => e.name));
    weg = (Array.isArray(namen) ? namen : []).filter((n) => bekannt.has(n));
  }

  /* „frei“ und nicht „bytes“: Die Antwort trägt daneben den neuen Stand
     des Ordners, und dort heißt die Summe schon bytes. */
  let frei = 0;
  for (const name of weg) {
    const pfad = path.join(SICHERUNG, name);
    try {
      frei += fs.statSync(pfad).size;
      fs.unlinkSync(pfad);
    } catch { /* schon weg, auch recht */ }
  }
  return { geloescht: weg.length, frei };
}

/* ---------- Die Liste der offenen Porträts ----------

   Sie steht als Textdatei in assets/ersetzen und wird nach jedem
   Austausch neu geschrieben, siehe pending-portraits.js nebenan.

   Dafür startet ein eigenes Node, und das kostet gemessen knapp drei
   Zehntelsekunden. Bis hierher wartete jedes gespeicherte Porträt
   darauf, obwohl aus dem ganzen Lauf nur eine Zeile für die Meldung
   gebraucht wird: „189 gesamt, 142 ersetzt, 47 offen“.

   Deshalb läuft er jetzt nebenher. Die Antwort trägt die Zeile vom
   letzten Lauf – die stimmt bis auf das eine Bild, das gerade geschnitten
   wurde – und wer schnell hintereinander speichert, löst nicht jedes Mal
   einen neuen Lauf aus: Eine kurze Sammelpause macht daraus einen. */
let listeZeile = null;
let listeLaeuft = false;
let listeNochmal = false;
let listePause = null;

function listeSchreiben() {
  if (listeLaeuft) { listeNochmal = true; return; }
  listeLaeuft = true;
  execFile(process.execPath, [path.join(HIER, 'pending-portraits.js')],
    { cwd: REPO, timeout: 60000 }, (fehler, aus) => {
      listeLaeuft = false;
      if (!fehler) listeZeile = (aus || '').trim().split('\n')[0];
      if (listeNochmal) { listeNochmal = false; listeSchreiben(); }
    });
}

function listeErneuern() {
  clearTimeout(listePause);
  listePause = setTimeout(listeSchreiben, 250);
  return listeZeile;
}

/* ---------- Läuft hier noch die Fassung von vorhin? ----------

   Am Studio wird gearbeitet, während es läuft. Node lädt dabei nichts
   nach: server.js und crop-image.py bleiben auf dem Stand des Starts. Wer eine
   Änderung erwartet und sie nicht bekommt, sucht den Fehler sonst in
   seinem Bild statt im laufenden Prozess, und das kann dauern.

   Die Seite bekommt ihre Dateien bei jedem Laden frisch, siehe no-store
   in sende(). Ein Tab, der schon länger offen ist, kann trotzdem alt
   sein, deshalb geht der jüngste Zeitstempel mit an die Oberfläche: Sie
   vergleicht ihn mit dem, den sie beim Laden gesehen hat.

   Warten muss sie darauf nicht. Ein Wächter über dem Studioordner meldet
   jede Änderung sofort über den Ereignisstrom, und die Oberfläche zieht
   daraus ihren Schluss, siehe pruefeStand in studio.js. Das Stilblatt
   steht dabei für sich allein: Es lässt sich im laufenden Betrieb
   austauschen, während jede andere Datei ein Neuladen braucht. Genau
   deshalb zählt es nicht zu den Seitendateien.

   START geht ebenfalls mit. Daran erkennt die Oberfläche einen Neustart
   des Servers, auch einen, den sie nicht ausgelöst hat: Läuft node mit
   --watch, ist der Neustart nach einer Änderung an server.js das
   Übliche, und die Oberfläche holt sich die neue Fassung von selbst. */
const START = Date.now();
const SERVERDATEIEN = ['server.js', 'services/crop-image.py', 'services/remove-background.py',
  'services/facial-recognition/enhance-face.py'];
const STILDATEI = 'styles/studio.css';
const SEITENDATEIEN = ['index.html', 'studio.js', 'ui-components/background-lines.js',
  'ui-components/electric-border.js', 'ui-components/particle-text.js',
  'ui-components/count-up.js', 'ui-components/color-scheme.js', 'ui-components/icons.js',
  'ui-components/strands.js', 'ui-components/galaxy-panel.js'];

function mtime(name) {
  try { return fs.statSync(path.join(HIER, name)).mtimeMs; } catch { return 0; }
}

/* Ein Zeitpunkt allein rückt auch dann weiter, wenn niemand etwas
   geändert hat: Der Abgleich von OneDrive fasst Dateien an, ein Editor
   ebenso. Das Studio lud dann mitten in der Arbeit neu, und ein
   laufender Zuschnitt verlor dabei seine Anzeige.

   Deshalb entscheidet der Inhalt. Gelesen wird er nur, wenn Zeitpunkt
   oder Länge sich bewegt haben, sonst steht die Antwort ohnehin fest. */
const abdruecke = new Map();   // Name -> { mtimeMs, size, hash }

function abdruck(namen) {
  return namen.map((name) => {
    const pfad = path.join(HIER, name);
    let s;
    try { s = fs.statSync(pfad); } catch { abdruecke.delete(name); return name + ':-'; }
    const gemerkt = abdruecke.get(name);
    if (gemerkt && gemerkt.mtimeMs === s.mtimeMs && gemerkt.size === s.size) {
      return `${name}:${gemerkt.hash}`;
    }
    let hash;
    try {
      hash = crypto.createHash('sha1').update(fs.readFileSync(pfad)).digest('hex');
    } catch { abdruecke.delete(name); return name + ':-'; }
    abdruecke.set(name, { mtimeMs: s.mtimeMs, size: s.size, hash });
    return `${name}:${hash}`;
  }).join('|');
}

/* Wie die Serverdateien beim Start dastanden. Auch hier zählt der
   Abdruck und nicht der Zeitpunkt, sonst meldete jeder Abgleich von
   OneDrive, der Server laufe mit veralteten Dateien. */
const SERVER_ABDRUCK = new Map(SERVERDATEIEN.map((name) => [name, abdruck([name])]));

function standDesStudios() {
  return {
    start: START,
    serverAlt: SERVERDATEIEN.filter((name) => abdruck([name]) !== SERVER_ABDRUCK.get(name)),
    seite: abdruck(SEITENDATEIEN),
    stil: mtime(STILDATEI),
  };
}

/* Der Wächter sieht nur die Ordner mit den Studiodateien, nicht
   .sicherung, .verlauf und vendor. Das ist keine Sparsamkeit, sondern nötig: Dort
   legt der Server bei jedem Speichern etwas ab, und ein Neuladen mitten
   im eigenen Speichern wäre das Gegenteil von hilfreich. Ein rekursiver
   Wächter über dem Studioordner müsste die beiden wieder aussieben,
   deshalb steht lieber über jedem beobachteten Ordner ein eigener.

   Ein Editor schreibt eine Datei gern in mehreren Schritten, außerdem
   kommen bei einer Änderung oft mehrere Dateien zusammen. Die kurze
   Sammelpause macht daraus eine einzige Meldung. */
const AUSGELIEFERT = new Set([...SEITENDATEIEN, STILDATEI]);
const BEOBACHTET = new Set([...SEITENDATEIEN, STILDATEI, ...SERVERDATEIEN]
  .map((name) => path.basename(name)));
/* services/fullsize und services/biography stehen bewusst nicht dabei:
   Ihre Skripte werden bei jedem Lauf neu gestartet, eine Änderung ist
   also schon beim nächsten Aufruf drin. Ein Wächter darüber meldete
   nichts, denn gemeldet wird nur, was in BEOBACHTET steht. */
const WACHORDNER = ['.', 'ui-components', 'styles', 'services', 'services/facial-recognition']
  .map((name) => path.join(HIER, name));
let wachePause = null;

function wacheStarten() {
  for (const ordner of WACHORDNER) {
    try {
      fs.watch(ordner, { persistent: false }, (art, name) => {
        if (!name || !BEOBACHTET.has(path.basename(name))) return;
        clearTimeout(wachePause);
        wachePause = setTimeout(sendeStudioStand, 120);
      });
    } catch (fehler) {
      console.log('  Kein Wächter über ' + (path.relative(HIER, ordner) || '.')
        + ': ' + fehler.message);
      console.log('  Änderungen kommen dann erst beim Neuladen von Hand an.');
    }
  }
}

/* ---------- Galaxie-Hintergrund ----------

   Die Regler des Hintergrunds der Seite stehen in js/galaxy-config.js.
   Das Studio zeigt sie mit einer laufenden Vorschau daneben, deshalb
   liest und schreibt es die Datei hier.

   Die Beschreibung der Regler steht ebenfalls hier und nicht in der
   Oberfläche: Sie bestimmt gleichzeitig, was die Schieber anzeigen und
   was beim Speichern durchgelassen wird. Zwei Listen, die auseinander-
   laufen könnten, wären eine zu viel. */

const GALAXIE_DATEI = path.join(REPO, 'js', 'galaxy-config.js');

const GALAXIE_REGLER = [
  {
    name: 'nebGlow', titel: 'Helligkeit', gruppe: 'Nebel', min: 0, max: 3, schritt: 0.05,
    hilfe: 'Wie kräftig die beiden prozeduralen Nebelfelder über dem gemalten '
      + 'Grundbild liegen. Bei 0.7 sind sie nur ein blasser Hauch, gemessen knapp '
      + 'eine von 255 Stufen. Ab etwa 2 tragen sie das Bild sichtbar mit.',
  },
  {
    name: 'nebRoughness', titel: 'Rauheit', gruppe: 'Nebel', min: 0.3, max: 0.85, schritt: 0.01,
    hilfe: 'Wie viel jede Lage des Rauschens von der vorigen behält. 0.5 lässt die '
      + 'feinen Lagen fast verschwinden, 0.65 gibt fasrige Struktur, ab 0.75 wird es '
      + 'körnig. Der eigentliche Regler für Feinstruktur im Nebel.',
  },
  {
    name: 'nebWarp', titel: 'Verwirbelung', gruppe: 'Nebel', min: 0, max: 1, schritt: 0.01,
    hilfe: 'Das Rauschen fragt sich selbst nach der Stelle, an der es abgelesen wird. '
      + 'Aus runden Wolken werden dadurch gezogene, wirbelnde Schwaden.',
  },
  {
    name: 'nebOctaves', titel: 'Oktaven', gruppe: 'Nebel', min: 1, max: 8, schritt: 1,
    hilfe: 'Wie viele Lagen Rauschen übereinanderliegen, jede doppelt so fein wie die '
      + 'vorige. Allein bewirkt das wenig, spürbar wird es erst mit hoher Rauheit.',
  },
  {
    name: 'nebFactor', titel: 'Auflösung', gruppe: 'Nebel', min: 1, max: 6, schritt: 1,
    hilfe: 'Kantenlänge des gebackenen Nebelbilds, als Vielfaches von 400 x 288. '
      + 'Gemessen ändert der Sprung von 1 auf 4 nur zwei von 255 Stufen und kostet '
      + 'das Sechzehnfache an Speicher.',
  },
  {
    name: 'nebPulse', titel: 'Atmen', gruppe: 'Nebel', min: 0, max: 3, schritt: 0.05,
    hilfe: 'Wie stark die Helligkeit der Nebel im Lauf der Zeit schwankt. '
      + '0 lässt sie gleichmäßig stehen.',
  },

  {
    name: 'bgTint', titel: 'Umfärben', gruppe: 'Grundbild', min: 0, max: 1, schritt: 0.01,
    hilfe: 'Trennt Struktur und Farbe im gemalten Grundbild. Bei 0 behält es seine '
      + 'eigenen Farben, bei 1 wird nur noch seine Helligkeit als Dichte gelesen und '
      + 'die Farbe kommt vollständig aus der Palette der gewählten Phase.',
  },
  {
    name: 'bgZoom', titel: 'Zoom', gruppe: 'Grundbild', min: 1, max: 1.6, schritt: 0.01,
    hilfe: 'Wie weit das Grundbild über den Schirm hinaus aufgezogen wird. 1 sitzt so '
      + 'knapp wie möglich, jeder Punkt mehr schneidet ringsum etwas vom Bild ab.',
  },
  {
    name: 'bgResample', titel: 'Verkleinern', gruppe: 'Grundbild', art: 'auswahl',
    werte: [['mip', 'Mipmap, weich'], ['roh', 'Roh, hart'], ['fein', 'Fein gerechnet']],
    hilfe: 'Wie das 3072 Punkte breite Grundbild auf Schirmgröße verkleinert wird. '
      + 'Davon hängt ab, wie hart die darin gemalten Sterne herauskommen. Mipmap ist '
      + 'am weichsten, Roh am härtesten, Fein flimmert beim Ändern der Fenstergröße nicht.',
  },
  {
    name: 'parallaxX', titel: 'Parallaxe quer', gruppe: 'Grundbild', min: 0, max: 40, schritt: 1,
    hilfe: 'Wie weit der Mauszeiger das Grundbild waagerecht verschiebt, in Bildpunkten. '
      + 'Jeder Punkt kostet doppelt so viel Rand am Bild.',
  },
  {
    name: 'parallaxY', titel: 'Parallaxe hoch', gruppe: 'Grundbild', min: 0, max: 40, schritt: 1,
    hilfe: 'Wie weit der Mauszeiger das Grundbild senkrecht verschiebt, in Bildpunkten.',
  },
  {
    name: 'sunPulse', titel: 'Sonne pulsiert', gruppe: 'Grundbild', min: 0, max: 3, schritt: 0.05,
    hilfe: 'Wie stark der Schein um die Sonne links oben pulsiert. Die Sonne selbst ist '
      + 'ins Grundbild gemalt, hier bewegt sich nur der Schein darüber.',
  },

  {
    name: 'starDensity', titel: 'Dichte gesamt', gruppe: 'Sterne', min: 0, max: 3, schritt: 0.05,
    hilfe: 'Dichte beider Sternschichten zusammen. 1 sind auf einem Schirm von '
      + '1440 x 900 Punkten rund 1100 feine und 120 helle Sterne, größere Schirme '
      + 'bekommen entsprechend mehr.',
  },
  {
    name: 'faintDensity', titel: 'Feine Sterne', gruppe: 'Sterne', min: 0, max: 3, schritt: 0.05,
    hilfe: 'Die feinen Sterne allein, als Vielfaches der Gesamtdichte. Sie sind der '
      + 'Staub im Hintergrund, kleiner als ein Bildpunkt und ohne Funkeln.',
  },
  {
    name: 'brightDensity', titel: 'Helle Sterne', gruppe: 'Sterne', min: 0, max: 3, schritt: 0.05,
    hilfe: 'Die hellen Sterne allein, als Vielfaches der Gesamtdichte. Jeder von ihnen '
      + 'hat einen weichen Halo, funkelt in seinem eigenen Takt und läuft bei der '
      + 'Parallaxe weiter als die feinen. Daher kommt die Tiefe.',
  },
  {
    name: 'twinkle', titel: 'Funkeln', gruppe: 'Sterne', art: 'schalter',
    hilfe: 'Lässt die hellen Sterne heller und dunkler werden, jeder in seinem eigenen '
      + 'Takt. Aus stehen sie alle gleich hell.',
  },
  {
    name: 'twinkleSpeed', titel: 'Funkeltempo', gruppe: 'Sterne', min: 0, max: 4, schritt: 0.05,
    hilfe: 'Wie schnell das Funkeln geht. Wirkt zusätzlich zum Gesamttempo.',
  },
  {
    name: 'shootingStars', titel: 'Sternschnuppen', gruppe: 'Sterne', art: 'schalter',
    hilfe: 'Ob überhaupt Sternschnuppen durchs Bild ziehen.',
  },
  {
    name: 'shootInterval', titel: 'Abstand in Sek.', gruppe: 'Sterne', min: 2, max: 60, schritt: 0.5,
    hilfe: 'Mittlerer Abstand zwischen zwei Sternschnuppen, in Sekunden. Der wirkliche '
      + 'Abstand streut darum herum, von gut der Hälfte bis knapp zum Anderthalbfachen. '
      + 'Bei 12.5 sind das die 7 bis 18 Sekunden der Vorlage, kleine Werte machen aus '
      + 'dem seltenen Ereignis einen Regen.',
  },

  {
    name: 'drift', titel: 'Wandern', gruppe: 'Bewegung', min: 0, max: 2, schritt: 0.05,
    hilfe: 'Lässt Grundbild, Nebel und Sterne von selbst wandern und das Bild langsam '
      + 'atmen. Bei 0 steht alles still und nur der Mauszeiger bewegt noch etwas. '
      + 'So steht es auf der Seite.',
  },
  {
    name: 'timeScale', titel: 'Tempo gesamt', gruppe: 'Bewegung', min: 0, max: 3, schritt: 0.05,
    hilfe: 'Tempo aller Bewegungen auf einmal, also Wandern, Atmen, Pulsieren und '
      + 'Funkeln. 0 friert das Bild ein.',
  },

  {
    name: 'tintStrength', titel: 'Stärke', gruppe: 'Phasenfarbe', min: 0, max: 1, schritt: 0.01,
    hilfe: 'Wie kräftig die Akzentfarben der gerade sichtbaren Phase über Grundbild und '
      + 'Nebel liegen. Der Schleier behält dabei die Helligkeitsstruktur des Bildes und '
      + 'dreht nur den Farbton. 0 schaltet die Phasenwirkung ab.',
  },
  {
    name: 'tintEase', titel: 'Überblenden', gruppe: 'Phasenfarbe', min: 0.005, max: 0.2, schritt: 0.005,
    hilfe: 'Wie schnell die Farben beim Wechsel der Phase ineinander übergehen. '
      + 'Kleine Werte heißen träge, große lassen die Farbe umspringen.',
  },
];

/* Gelesen wird, indem die Datei wirklich ausgeführt wird. Ein Textmuster
   darüberzulegen wäre schneller und bei der ersten Umformatierung
   falsch. */
function galaxieLesen() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(GALAXIE_DATEI, 'utf8')
    + ';globalThis.OUT = { config: window.GALAXY_CONFIG,'
    + ' regions: window.GALAXY_REGIONS, fixed: window.GALAXY_FIXED };',
  ctx, { filename: 'galaxy-config-probe.js' });
  return ctx.OUT;
}

function galaxieZahl(wert) {
  /* Ohne das Runden schreibt 0.1 + 0.2 seine siebzehn Stellen in die
     Datei. Sechs reichen für jeden Regler hier. */
  const n = Math.round(Number(wert) * 1e6) / 1e6;
  if (!Number.isFinite(n)) throw new Error('Keine Zahl: ' + wert);
  return String(n);
}

function galaxieWert(wert) {
  if (typeof wert === 'string') return "'" + wert.replace(/'/g, "\\'") + "'";
  if (typeof wert === 'boolean') return String(wert);
  return galaxieZahl(wert);
}

/* Geschrieben wird Zeile für Zeile und nur der Wert. Die Datei besteht
   zu vier Fünfteln aus Erklärungen, welcher Regler was tut, und die
   sollen genau so stehen bleiben. Deshalb kein Neuschreiben aus einem
   Objekt heraus, sondern ein Muster je Regler, das auf die Einrückung
   von vier Leerzeichen besteht. Passt es nicht, bricht es ab, statt
   irgendwo im Text zu landen. */
function galaxieSchreiben(auftrag) {
  const alt = galaxieLesen();
  let quelle = fs.readFileSync(GALAXIE_DATEI, 'utf8');
  let geaendert = false;

  const erlaubt = new Map(GALAXIE_REGLER.map((r) => [r.name, r]));
  for (const [name, wert] of Object.entries(auftrag.config || {})) {
    const regler = erlaubt.get(name);
    if (!regler) throw new Error('Unbekannter Regler: ' + name);
    if (typeof wert !== typeof alt.config[name]) {
      throw new Error(`Der Regler ${name} will ${typeof alt.config[name]}, `
        + `bekommen hat er ${typeof wert}.`);
    }
    if (regler.art === 'auswahl' && !regler.werte.some(([w]) => w === wert)) {
      throw new Error(`${name} kennt den Wert ${wert} nicht.`);
    }
    if (typeof wert === 'number' && (wert < regler.min || wert > regler.max)) {
      throw new Error(`${name} liegt mit ${wert} außerhalb von ${regler.min} bis ${regler.max}.`);
    }
    if (wert === alt.config[name]) continue;
    const muster = new RegExp('^( {4}' + name + ': )([^,\\n]*)(,)$', 'm');
    if (!muster.test(quelle)) {
      throw new Error(`Die Zeile für ${name} steht nicht wie erwartet in `
        + 'js/galaxy-config.js. Wurde die Datei umformatiert?');
    }
    quelle = quelle.replace(muster, (_, vorn, __, komma) => vorn + galaxieWert(wert) + komma);
    geaendert = true;
  }

  if (auftrag.regions) {
    if (auftrag.regions.length !== alt.regions.length) {
      throw new Error(`Es sind ${alt.regions.length} Nebelbereiche, `
        + `gekommen sind ${auftrag.regions.length}.`);
    }
    const zeilen = auftrag.regions.map((R, i) => {
      const c = (R.col || alt.regions[i].col).map((k) => Math.max(0, Math.min(255, Math.round(k))));
      const z = (k) => galaxieZahl(R[k] === undefined ? alt.regions[i][k] : R[k]);
      return `    { x: ${z('x')}, y: ${z('y')}, rx: ${z('rx')}, ry: ${z('ry')},`
        + ` col: [${c.join(', ')}], ridged: ${!!R.ridged},`
        + ` amp: ${z('amp')}, sc: ${z('sc')} },`;
    });
    const muster = /(window\.GALAXY_REGIONS = \[)[\s\S]*?(\n {2}\];)/;
    if (!muster.test(quelle)) throw new Error('GALAXY_REGIONS steht nicht wie erwartet in der Datei.');
    const neu = quelle.replace(muster, (_, kopf, fuss) => kopf + '\n' + zeilen.join('\n') + fuss);
    if (neu !== quelle) { quelle = neu; geaendert = true; }
  }

  if (!geaendert) return { geaendert: false };

  /* Prüfen, bevor die Datei angefasst wird: die neue Fassung laden und
     nachsehen, ob wirklich drinsteht, was drinstehen sollte. */
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(quelle + ';globalThis.OUT = { config: window.GALAXY_CONFIG,'
    + ' regions: window.GALAXY_REGIONS };', ctx, { filename: 'galaxy-config-neu.js' });
  for (const [name, wert] of Object.entries(auftrag.config || {})) {
    if (ctx.OUT.config[name] !== wert) {
      throw new Error(`Die neue Fassung trägt bei ${name} ${ctx.OUT.config[name]} statt ${wert}.`);
    }
  }

  sichereQuelle(GALAXIE_DATEI, stempelJetzt());
  fs.writeFileSync(GALAXIE_DATEI, quelle, 'utf8');
  return { geaendert: true, ...ctx.OUT };
}

/* ---------- Farben der Phasen ----------

   Sie stehen nicht bei den Reglern, sondern in js/data.js bei der Phase
   selbst, denn sie gehören zur Phase und nicht zum Hintergrund. Zwei
   Felder je Phase:

     accent   Ein Hexwert. Er färbt die ganze Oberfläche dieser Phase und
              bestimmt zugleich, welche Farbe die Galaxie am Seitenanfang
              beisteuert, wo noch keine Phase gilt.
     nebula   Drei RGB-Tripel. Sie liegen als Verlauf über der Galaxie,
              solange diese Phase sichtbar ist. */

const DATEN_DATEI = path.join(REPO, 'js', 'data.js');

function phasenLesen() {
  return ladeDaten().PHASES.map((p) => ({
    id: p.id, num: p.num, titel: p.title, accent: p.accent, nebula: p.nebula,
  }));
}

function istFarbe(hex) {
  return typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex);
}

function pruefeNebel(nebula, wo) {
  if (!Array.isArray(nebula) || nebula.length !== 3) {
    throw new Error(`${wo}: nebula braucht genau drei Farben.`);
  }
  return nebula.map((c) => {
    if (!Array.isArray(c) || c.length !== 3) throw new Error(`${wo}: jede Farbe braucht drei Werte.`);
    return c.map((k) => {
      const n = Math.round(Number(k));
      if (!Number.isFinite(n) || n < 0 || n > 255) throw new Error(`${wo}: ${k} liegt nicht in 0 bis 255.`);
      return n;
    });
  });
}

function phasenSchreiben(phasen) {
  const alt = ladeDaten().PHASES;
  if (!Array.isArray(phasen) || phasen.length !== alt.length) {
    throw new Error(`Es sind ${alt.length} Phasen, gekommen sind ${(phasen || []).length}.`);
  }
  let quelle = fs.readFileSync(DATEN_DATEI, 'utf8');
  let geaendert = false;

  phasen.forEach((p, i) => {
    if (p.id !== alt[i].id) throw new Error(`Phase ${i + 1} heißt ${alt[i].id}, gekommen ist ${p.id}.`);
    if (!istFarbe(p.accent)) throw new Error(`${alt[i].id}: ${p.accent} ist keine Farbe wie #a1b2c3.`);
    const nebula = pruefeNebel(p.nebula, alt[i].id);

    /* Der Block dieser Phase, von ihrer Kennung bis zur nächsten. Die
       Kennungen sind eindeutig, deshalb lässt sich der Anker bei jedem
       Durchgang neu suchen, auch wenn die Datei inzwischen länger oder
       kürzer geworden ist. */
    const anker = new RegExp('^ {4}id: "' + p.id + '",$', 'm').exec(quelle);
    if (!anker) throw new Error(`Die Zeile id: "${p.id}" steht nicht in js/data.js.`);
    const rest = quelle.slice(anker.index + 1).search(/^ {4}id: "/m);
    const ende = rest < 0 ? quelle.length : anker.index + 1 + rest;
    let block = quelle.slice(anker.index, ende);

    const neuNebel = '[' + nebula.map((c) => '[' + c.join(', ') + ']').join(', ') + ']';
    for (const [muster, wert, name] of [
      [/^( {4}accent: ")(#[0-9a-fA-F]{6})(",)$/m, p.accent.toLowerCase(), 'accent'],
      [/^( {4}nebula: )(\[.*\])(,)$/m, neuNebel, 'nebula'],
    ]) {
      if (!muster.test(block)) {
        throw new Error(`Die Zeile ${name} von ${p.id} steht nicht wie erwartet in `
          + 'js/data.js. Wurde die Datei umformatiert?');
      }
      const neu = block.replace(muster, (_, vorn, __, hinten) => vorn + wert + hinten);
      if (neu !== block) { block = neu; geaendert = true; }
    }
    quelle = quelle.slice(0, anker.index) + block + quelle.slice(ende);
  });

  if (!geaendert) return { geaendert: false };

  /* Prüfen, bevor die Datei angefasst wird. js/data.js steht für sich
     allein, es lässt sich einfach laufen lassen. */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(quelle + ';globalThis.OUT = PHASES;', ctx, { filename: 'data-neu.js' });
  phasen.forEach((p, i) => {
    const steht = ctx.OUT[i];
    if (steht.accent !== p.accent.toLowerCase()) {
      throw new Error(`Die neue Fassung trägt bei ${p.id} den Akzent ${steht.accent} `
        + `statt ${p.accent}.`);
    }
    if (JSON.stringify(steht.nebula) !== JSON.stringify(pruefeNebel(p.nebula, p.id))) {
      throw new Error(`Die neue Fassung trägt bei ${p.id} andere Nebelfarben als gewollt.`);
    }
  });

  sichereQuelle(DATEN_DATEI, stempelJetzt());
  fs.writeFileSync(DATEN_DATEI, quelle, 'utf8');
  return { geaendert: true };
}

/* ---------- HTTP ---------- */

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function sende(res, code, daten, typ) {
  res.writeHead(code, {
    'Content-Type': typ || 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(typeof daten === 'string' || Buffer.isBuffer(daten) ? daten : JSON.stringify(daten));
}

function datei(res, pfad) {
  fs.readFile(pfad, (fehler, inhalt) => {
    if (fehler) return sende(res, 404, { fehler: 'Nicht gefunden' });
    sende(res, 200, inhalt, TYPEN[path.extname(pfad).toLowerCase()] || 'application/octet-stream');
  });
}

function koerper(req, grenze = 40 * 1024 * 1024) {
  return new Promise((fertig, scheitern) => {
    const teile = [];
    let laenge = 0;
    req.on('data', (teil) => {
      laenge += teil.length;
      if (laenge > grenze) {
        scheitern(new Error('Datei zu groß.'));
        req.destroy();
        return;
      }
      teile.push(teil);
    });
    req.on('end', () => fertig(Buffer.concat(teile)));
    req.on('error', scheitern);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const weg = decodeURIComponent(url.pathname);

  try {
    /* --- Oberfläche ---

       Ausgeliefert wird nur, was in SEITENDATEIEN oder STILDATEI steht,
       und zwar unter genau dem Weg, unter dem es auch auf der Platte
       liegt: /ui-components/count-up.js ist ui-components/count-up.js. Damit
       gibt es eine einzige Liste für Wächter, Standmeldung und
       Auslieferung, und der Ordner ist nicht offen für alles. */
    if (weg === '/' || weg === '/index.html') return datei(res, path.join(HIER, 'index.html'));
    if (AUSGELIEFERT.has(weg.slice(1))) return datei(res, path.join(HIER, weg.slice(1)));

    /* --- Bilder aus dem Repo, nur lesend --- */
    if (weg.startsWith('/datei/')) {
      const ziel = path.resolve(REPO, weg.slice(7));
      if (!ziel.startsWith(REPO + path.sep)) return sende(res, 403, { fehler: 'Verboten' });
      return datei(res, ziel);
    }

    /* --- Fortschritt der laufenden Arbeiten ---

       Ein Ereignisstrom, der offen bleibt. Wer sich anhängt, bekommt
       sofort den aktuellen Stand, danach jede Änderung. */
    if (weg === '/api/fortschritt') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
      });
      res.write(`data: ${JSON.stringify(fortschrittStand())}\n\n`);
      /* Der Stand der Dateien gleich mit. Nach einem Neustart des Servers
         hängt sich der Browser von allein wieder an, und das hier ist
         das Erste, was er dann hört. */
      res.write(`event: stand\ndata: ${JSON.stringify(standDesStudios())}\n\n`);
      zuhoerer.add(res);
      /* Ein Lebenszeichen alle 25 Sekunden, sonst schließen Zwischenstücke
         die stille Verbindung. */
      const puls = setInterval(() => {
        try { res.write(': puls\n\n'); } catch { /* fällt gleich weg */ }
      }, 25000);
      req.on('close', () => { clearInterval(puls); zuhoerer.delete(res); });
      return undefined;
    }

    /* --- Hochgeladene und hochskalierte Bilder, nur lesend --- */
    if (weg.startsWith('/upload/')) {
      const eintrag = hochgeladen.get(weg.slice(8));
      if (!eintrag) return sende(res, 404, { fehler: 'Nicht gefunden' });
      return datei(res, eintrag.pfad);
    }

    /* --- Figuren --- */
    if (weg === '/api/figuren') {
      const figuren = baueFiguren();
      return sende(res, 200, {
        figuren, welten: ladeDaten().CHAR_WORLDS.slice(),
        zaehler: zaehlen(figuren), python: PYTHON_INFO,
        engine: ENGINE_INFO, gesicht: GESICHT_INFO, frei: FREI_INFO,
        /* Wie viele Figuren im erzeugten Steckbrief-Block noch fehlen.
           Der Knopf im Reiter Biografie trägt die Zahl. */
        wikiOffen: wikiOffen().length,
        /* Die Bezeichnungen der Beziehungen, siehe begriffeListe(). Sie
           kommen mit den Figuren, damit die Auswahl neben dem Feld schon
           beim ersten Aufschlagen steht. */
        begriffe: begriffeListe(),
        verlauf: verlaufStand(), stand: standDesStudios(),
      });
    }

    /* --- Eigenes Bild --- */
    if (weg === '/api/upload' && req.method === 'POST') {
      const daten = await koerper(req);
      const name = decodeURIComponent(req.headers['x-dateiname'] || 'bild.png');
      const id = uploadAblegen(daten, name);
      return sende(res, 200, { id, name });
    }

    /* --- Vorlage vierfach hochrechnen, auf Wunsch mit neuem Gesicht --- */
    if (weg === '/api/hochskalieren' && req.method === 'POST') {
      if (!ENGINE) return sende(res, 500, { fehler: ENGINE_INFO.grund });
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const modell = ['gfpgan', 'codeformer'].includes(auftrag.modell)
        ? auftrag.modell : 'ohne';
      const treue = Math.min(1, Math.max(0, Number(auftrag.treue)));
      return sende(res, 200, await hochskalieren(auftrag.quelle, modell,
        Number.isFinite(treue) ? treue : 0.8));
    }

    /* --- Hintergrund entfernen --- */
    if (weg === '/api/freistellen' && req.method === 'POST') {
      if (!FREI) return sende(res, 500, { fehler: FREI_INFO.grund });
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const bekannt = FREI_INFO.modelle.map((m) => m.name);
      const modell = bekannt.includes(auftrag.modell) ? auftrag.modell : bekannt[0];
      const saum = Math.min(1, Math.max(0, Number(auftrag.saum)));
      return sende(res, 200, await freistellen(auftrag.quelle, modell,
        auftrag.feinschliff !== false, Number.isFinite(saum) ? saum : 1));
    }

    /* --- Vorschlag: Kopf beim Porträt, Rand beim Ganzkörperbild --- */
    if (weg === '/api/auto') {
      const quelle = {
        typ: url.searchParams.get('typ'),
        name: url.searchParams.get('name'),
        id: url.searchParams.get('id'),
        marke: url.searchParams.get('marke'),
      };
      const { pfad } = quellePfad(quelle);
      const gk = url.searchParams.get('bereich') === 'ganzkoerper';
      const befehl = gk ? 'rand' : 'analyse';
      /* Steht die Vorlage auf der Bühne gedreht, wird hier genauso
         gedreht: Der Vorschlag soll in denselben Pixeln liegen wie der
         Ausschnitt, den er ersetzt. */
      const winkel = grad(url.searchParams.get('winkel'));
      return sende(res, 200, await mitFortschritt(
        gk ? 'Rand suchen' : 'Gesicht suchen', gk ? 'rand' : 'analyse',
        () => python([befehl, '--bild', pfad, '--winkel', String(winkel)])));
    }

    /* --- Von Hand auf „noch offen“ stellen --- */
    if (weg === '/api/offen' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      if (!zielErlaubt(auftrag.ziel, auftrag.bereich)) {
        return sende(res, 400, { fehler: 'Unbekanntes Ziel: ' + auftrag.ziel });
      }
      const menge = ladeMarkiert(auftrag.bereich);
      mitVerlauf(
        `${auftrag.offen ? 'Markiert' : 'Markierung weg'}: ${auftrag.ziel}`,
        ['tools/portrait-studio/offen.json'], [],
        () => {
          if (auftrag.offen) menge.add(auftrag.ziel); else menge.delete(auftrag.ziel);
          speichereMarkiert(auftrag.bereich, menge);
        },
      );
      /* Die Textliste kennt nur die Porträts. */
      const bericht = auftrag.bereich === 'ganzkoerper' ? null : listeErneuern();
      return sende(res, 200, {
        ok: true,
        markiert: menge.has(auftrag.ziel),
        zaehler: zaehlen(baueFiguren()),
        liste: bericht,
        verlauf: verlaufStand(),
      });
    }

    /* --- Sicherung: was in .sicherung liegt --- */
    if (weg === '/api/sicherung' && req.method === 'GET') {
      return sende(res, 200, sicherungListe());
    }

    if (weg === '/api/sicherung/zurueck' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const ergebnis = sicherungZurueck(auftrag.name);
      const liste = listeErneuern();
      return sende(res, 200, {
        ok: true, ziel: ergebnis.ziel, liste,
        verlauf: verlaufStand(), zaehler: zaehlen(baueFiguren()),
        ...sicherungListe(),
      });
    }

    if (weg === '/api/sicherung/loeschen' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const ergebnis = sicherungLoeschen(auftrag);
      return sende(res, 200, { ok: true, ...ergebnis, ...sicherungListe() });
    }

    /* Eine gesicherte Fassung ansehen, nur lesend. Ausgeliefert wird
       ausschließlich, was sicherungPfad() als Sicherung durchgehen
       lässt, und nur Bilder: Quelltext gehört in den Editor. */
    if (weg.startsWith('/sicherung/')) {
      const name = weg.slice(11);
      if (!name.endsWith('.webp')) return sende(res, 403, { fehler: 'Nur Bilder' });
      try { return datei(res, sicherungPfad(name)); } catch (fehler) {
        return sende(res, 404, { fehler: fehler.message });
      }
    }

    /* --- Verlauf --- */
    if (weg === '/api/verlauf' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const titel = await mitFortschritt(
        auftrag.richtung === 'vor' ? 'Wiederholen' : 'Rückgängig', 'verlauf',
        async () => verlaufGehen(auftrag.richtung === 'vor' ? 'vor' : 'zurueck'));
      const liste = listeErneuern();
      return sende(res, 200, {
        ok: true, titel, liste, verlauf: verlaufStand(), zaehler: zaehlen(baueFiguren()),
      });
    }

    /* --- Alle Filme, für die Auftrittsliste --- */
    if (weg === '/api/filme') {
      const D = ladeDaten();
      const filme = [];
      for (const phase of D.PHASES) {
        for (const film of phase.movies) {
          filme.push({
            slug: film.slug,
            titel: film.title,
            phase: phase.title || phase.name || '',
            serie: !!film.series,
            besetzung: (film.characters || []).length,
          });
        }
      }
      return sende(res, 200, { filme });
    }

    /* --- Neue Welt --- */
    if (weg === '/api/welt' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const ergebnis = mitVerlauf(`Welt angelegt: ${auftrag.name}`,
        ['js/chars.js'], [], () => weltAnlegen(auftrag.name));
      return sende(res, 200, {
        ok: true, ...ergebnis, welten: ladeDaten().CHAR_WORLDS.slice(),
        verlauf: verlaufStand(),
      });
    }

    /* --- Welt wieder streichen --- */
    if (weg === '/api/welt/loeschen' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const ergebnis = mitVerlauf(`Welt gestrichen: ${auftrag.name}`,
        ['js/chars.js'], [], () => weltLoeschen(auftrag.name));
      return sende(res, 200, {
        ok: true, ...ergebnis, welten: ladeDaten().CHAR_WORLDS.slice(),
        verlauf: verlaufStand(),
      });
    }

    /* --- Figur löschen ---

       Der Schritt fasst fünf Quelldateien und alle Bilder der Figur an,
       deshalb geht er als Ganzes in den Verlauf: Ein Rückgängig holt sie
       vollständig zurück. */
    if (weg === '/api/figur/loeschen' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const figur = baueFiguren().find((f) => f.slug === auftrag.slug);
      if (!figur) return sende(res, 400, { fehler: 'Unbekannte Figur: ' + auftrag.slug });
      const ergebnis = mitVerlauf(`Figur gelöscht: ${figur.ueberschrift}`,
        ['js/data.js', 'js/chars.js', 'js/looks.js', 'js/profiles.js', 'js/facts.js',
          'js/powers.js'],
        [auftrag.slug], () => figurLoeschen(auftrag.slug));
      return sende(res, 200, {
        ok: true, ...ergebnis,
        zaehler: zaehlen(baueFiguren()),
        liste: listeErneuern(),
        verlauf: verlaufStand(),
        stand: standDesStudios(),
      });
    }

    /* --- Neue Figur --- */
    if (weg === '/api/figur/neu' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const ergebnis = mitVerlauf(`Figur angelegt: ${auftrag.name}`,
        ['js/data.js', 'js/chars.js'], [],
        () => figurAnlegen(auftrag.name, auftrag.alias || null, auftrag.filme || []));
      return sende(res, 200, { ok: true, ...ergebnis });
    }

    /* --- Name und Schlüssel --- */
    if (weg === '/api/figur' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const figur = baueFiguren().find((f) => f.slug === auftrag.slug);
      if (!figur) return sende(res, 400, { fehler: 'Unbekannte Figur: ' + auftrag.slug });
      let ergebnis;
      if (auftrag.aktion === 'name') {
        if (!figur.namen.includes(auftrag.alt)) {
          return sende(res, 400, { fehler: `„${auftrag.alt}“ gehört nicht zu dieser Figur.` });
        }
        ergebnis = mitVerlauf(`Name geändert: ${auftrag.neu}`,
          ['js/data.js', 'js/chars.js'], [],
          () => nameAendern(auftrag.slug, auftrag.alt, auftrag.neu));
      } else if (auftrag.aktion === 'alias') {
        const ziel = auftrag.ziel === null || auftrag.ziel === '' ? null : auftrag.ziel;
        /* Der Schlüsselwechsel benennt Bilder um, deshalb beide Präfixe. */
        const neuerSlug = ziel ? charSlugRoh(ziel) : auftrag.slug;
        ergebnis = mitVerlauf(`Schlüssel geändert: ${auftrag.slug}`,
          ['js/data.js', 'js/chars.js', 'js/looks.js', 'js/profiles.js', 'js/facts.js'],
          [auftrag.slug, neuerSlug],
          () => aliasAendern(auftrag.slug, figur.namen, ziel));
      } else {
        return sende(res, 400, { fehler: 'Unbekannte Aktion: ' + auftrag.aktion });
      }
      return sende(res, 200, { ok: true, ...ergebnis });
    }

    /* --- Auftritte ---

       Beim Streichen muss die Figur bekannt sein, beim Setzen nicht: Wer
       gerade seinen letzten Auftritt verloren hat, steht in keiner Liste
       mehr und käme sonst nicht zurück. */
    if (weg === '/api/auftritt' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const name = pruefeName(auftrag.name);
      if (!auftrag.dabei) {
        const figur = baueFiguren().find((f) => f.slug === auftrag.slug);
        if (!figur) return sende(res, 400, { fehler: 'Unbekannte Figur: ' + auftrag.slug });
        if (!figur.namen.includes(name)) {
          return sende(res, 400, { fehler: `„${name}“ gehört nicht zu dieser Figur.` });
        }
      }
      const ergebnis = mitVerlauf(
        `Auftritt ${auftrag.dabei ? 'gesetzt' : 'gestrichen'}: ${name} in ${auftrag.film}`,
        ['js/data.js'], [],
        () => auftrittAendern(auftrag.film, name, !!auftrag.dabei, auftrag.slug),
      );
      return sende(res, 200, { ok: true, ...ergebnis });
    }

    /* --- Texte einer Figur lesen ---

       Geprüft wird gegen die Besetzungslisten und nicht gegen
       baueFiguren(): Für einen Text ist gleichgültig, welche Bilder es
       gibt, und das Absuchen der beiden Bildordner kostet mehr als die
       ganze Antwort. */
    if (weg === '/api/texte' && req.method === 'GET') {
      const slug = url.searchParams.get('slug');
      if (!reihenfolge(ladeDaten()).includes(slug)) {
        return sende(res, 400, { fehler: 'Unbekannte Figur: ' + slug });
      }
      return sende(res, 200, { ...texteLesen(slug), offen: wikiOffen().length });
    }

    /* --- Texte einer Figur schreiben ---

       Alle drei Dateien in einem Schritt, und damit auch ein Schritt im
       Verlauf: Rückgängig nimmt die ganze Figur zurück, nicht die
       Biografie ohne den Steckbrief. */
    if (weg === '/api/texte' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const figur = baueFiguren().find((f) => f.slug === auftrag.slug);
      if (!figur) return sende(res, 400, { fehler: 'Unbekannte Figur: ' + auftrag.slug });
      const ergebnis = mitVerlauf(`Texte gespeichert: ${figur.name}`,
        ['js/data.js', 'js/profiles.js', 'js/facts.js'], [],
        () => texteSchreiben(auftrag));
      const figuren = baueFiguren();
      return sende(res, 200, {
        ok: true,
        ...ergebnis,
        texte: (figuren.find((f) => f.slug === auftrag.slug) || {}).texte || null,
        zaehler: zaehlen(figuren),
        /* Eine gespeicherte Beziehung verschiebt die Zahlen in der Liste
           der Begriffe, deshalb geht sie gleich mit zurück. */
        begriffe: begriffeListe(),
        verlauf: verlaufStand(),
      });
    }

    /* --- Die Begriffe der Beziehungen ---

       Lesen, einen neuen merken, einen streichen, einen umbenennen. Nur
       das Umbenennen fasst js/facts.js an und wird deshalb als einziges
       ein Schritt im Verlauf. */
    if (weg === '/api/begriffe' && req.method === 'GET') {
      return sende(res, 200, { begriffe: begriffeListe() });
    }

    if (weg === '/api/begriffe' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const ergebnis = begriffMerken(auftrag.name);
      return sende(res, 200, { ok: true, ...ergebnis, begriffe: begriffeListe() });
    }

    if (weg === '/api/begriffe/loeschen' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const ergebnis = begriffVergessen(auftrag.name);
      return sende(res, 200, { ok: true, ...ergebnis, begriffe: begriffeListe() });
    }

    if (weg === '/api/begriffe/umbenennen' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const ergebnis = mitVerlauf(
        `Begriff umbenannt: ${einzeilig(auftrag.alt)} zu ${einzeilig(auftrag.neu)}`,
        ['js/facts.js', 'tools/portrait-studio/bond-labels.json'], [],
        () => begriffUmbenennen(auftrag.alt, auftrag.neu));
      return sende(res, 200, {
        ok: true, ...ergebnis, begriffe: begriffeListe(), verlauf: verlaufStand(),
      });
    }

    /* --- Steckbriefe aus den Wikis nachziehen --- */
    if (weg === '/api/wiki' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const einzeln = !!auftrag.slug;
      if (einzeln && !baueFiguren().some((f) => f.slug === auftrag.slug)) {
        return sende(res, 400, { fehler: 'Unbekannte Figur: ' + auftrag.slug });
      }
      const slugs = einzeln ? [auftrag.slug] : wikiOffen();
      if (!slugs.length) {
        return sende(res, 200, { ok: true, geaendert: false, geholt: 0, offen: 0 });
      }
      const ergebnis = await mitVerlaufAsync(
        einzeln ? `Steckbrief geholt: ${auftrag.slug}`
          : `Steckbriefe geholt: ${slugs.length} Figuren`,
        ['js/facts.js'], [],
        () => wikiAbrufen(slugs, einzeln));
      const figuren = baueFiguren();
      return sende(res, 200, {
        ok: true,
        ...ergebnis,
        texte: einzeln
          ? (figuren.find((f) => f.slug === auftrag.slug) || {}).texte || null : null,
        wiki: einzeln ? texteLesen(auftrag.slug).wiki : null,
        offen: wikiOffen().length,
        zaehler: zaehlen(figuren),
        verlauf: verlaufStand(),
      });
    }

    /* --- Fassungen anlegen, umbenennen, verschieben, löschen, einem
           Film zuordnen, und ihre Varianten sortieren, anhängen und
           lösen --- */
    if (weg === '/api/fassung' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const figuren = baueFiguren();
      const meine = figuren.find((f) => f.slug === auftrag.slug);
      if (!meine) {
        return sende(res, 400, { fehler: 'Unbekannte Figur: ' + auftrag.slug });
      }
      /* Geprüft wird gegen die Fassungen genau dieser Figur, und der
         Stamm zählt mit: Die Eingriffe an einer Fassung nennen ihn, denn
         eine Fassung mit Varianten liegt unter mehreren Dateinamen und
         unter ihrem eigenen gar nicht mehr. */
      const bekannt = auftrag.aktion === 'neu' || meine.ganzkoerper.some(
        (z) => z.datei === auftrag.datei || z.stamm === auftrag.datei);
      if (!bekannt) {
        return sende(res, 400, { fehler: 'Unbekannte Fassung: ' + auftrag.datei });
      }
      const wort = {
        neu: 'angelegt', umbenennen: 'umbenannt', verschieben: 'verschoben',
        standard: 'nach vorn', loeschen: 'gelöscht', film: 'einem Film zugeordnet',
        'variante-neu': 'um eine Variante erweitert', 'variante-weg': 'um eine Variante gekürzt',
        'variante-hoch': 'Variante nach vorn', 'variante-runter': 'Variante nach hinten',
        'zu-variante': 'als Variante angehängt', 'zu-fassung': 'aus einer Variante gelöst',
      }[auftrag.aktion] || auftrag.aktion;
      /* In den Verlauf geht nur, was der Eingriff auch anfassen kann.
         Beim Umbenennen zieht die Bilddatei mit, dazu die
         Offen-Markierung und die Quellenangabe, und beim Löschen wandert
         das Bild in die Sicherung. Verschieben, Vorreihen und die
         Filmzuordnung ändern allein eine Zeile in chars.js, siehe
         dateiUmbenennen() und fassungAendern().

         Das ist kein Feinschliff. Der Schnappschuss kopiert jede genannte
         Datei, und zwar zweimal, einmal vorher und einmal nachher. Bei
         einer Figur mit fünf Fassungen war das rund ein Megabyte, das für
         jedes Verschieben um einen Platz über OneDrive ging. */
      const wandertMehr = ['umbenennen', 'loeschen', 'variante-neu', 'variante-weg',
        'variante-hoch', 'variante-runter', 'zu-variante', 'zu-fassung']
        .includes(auftrag.aktion);
      const ergebnis = mitVerlauf(
        `Fassung ${wort}: ${auftrag.label || auftrag.datei}`,
        wandertMehr
          ? ['js/chars.js', 'js/looks.js', 'tools/portrait-studio/offen.json',
            'assets/characters/fullsize/CREDITS.md']
          : ['js/chars.js'],
        wandertMehr ? [auftrag.slug] : [],
        () => fassungAendern(auftrag),
      );
      /* Die eine Figur geht mit zurück. Vorher holte sich die Oberfläche
         danach alle vierhundert neu und baute ihre ganze Liste noch
         einmal auf, nur weil eine Fassung ihren Namen gewechselt hatte:
         ein Weg über vierhundert Kilobyte für eine Zeile. */
      const frisch = baueFiguren().find((f) => f.slug === auftrag.slug) || null;
      return sende(res, 200, {
        ok: true, ...ergebnis, figur: frisch,
        zaehler: zaehlen(baueFiguren()), verlauf: verlaufStand(),
      });
    }

    /* --- Der Satz zu einer Fassung ---

       Geschrieben wird in js/looks.js, geschlüsselt nach der Fassung und
       nicht nach der Figur: Eine Figur hat so viele Sätze wie Fassungen.
       Ein leerer Text nimmt den Eintrag wieder heraus, dann springt auf
       der Charakterseite die Zusammenfassung des Films ein. */
    if (weg === '/api/beschreibung' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const meine = baueFiguren().find((f) => f.slug === auftrag.slug);
      if (!meine) {
        return sende(res, 400, { fehler: 'Unbekannte Figur: ' + auftrag.slug });
      }
      /* Geprüft wird gegen die Fassungen genau dieser Figur, und der
         Stamm zählt mit: Der Satz gehört der Fassung, nicht der einzelnen
         Aufnahme, und wird deshalb im Regelfall unter dem Stamm
         geschrieben. */
      const ziel = meine.ganzkoerper.find(
        (z) => z.datei === auftrag.datei || z.stamm === auftrag.datei);
      if (!ziel) {
        return sende(res, 400, { fehler: 'Unbekannte Fassung: ' + auftrag.datei });
      }
      /* Ein Satz und keine Erzählung: Zeilenumbrüche fallen weg, und was
         zu lang ist, passt unter der Tafel ohnehin nicht mehr. */
      const text = String(auftrag.text || '').replace(/\s+/g, ' ').trim();
      if (text.length > 400) {
        return sende(res, 400, { fehler: 'Der Satz ist länger als 400 Zeichen.' });
      }
      /* Die übrigen Fassungen derselben Figur: An ihnen erkennt der
         Schreiber, in welche Gruppe von js/looks.js der neue Satz
         gehört. */
      const geschwister = meine.ganzkoerper
        .flatMap((z) => [z.datei, z.stamm]).filter(Boolean);
      const ergebnis = mitVerlauf(
        `Beschreibung ${text ? 'gesetzt' : 'gelöscht'}: ${ziel.label}`,
        ['js/looks.js'], [],
        /* Die Überschrift einer neuen Gruppe trägt die Welt mit: Gamora
           und Gamora (2014) stünden sonst zweimal gleich in der Datei. */
        () => setzeBeschreibung(auftrag.datei, text,
          meine.welt ? `${meine.name} (${meine.welt})` : meine.name, geschwister),
      );
      const frisch = baueFiguren().find((f) => f.slug === auftrag.slug) || null;
      return sende(res, 200, {
        ok: true, ...ergebnis, figur: frisch, verlauf: verlaufStand(),
      });
    }

    /* --- Körpergröße und Bildkorrektur setzen --- */
    if (weg === '/api/skala' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      if (!zielErlaubt(auftrag.datei, 'ganzkoerper')) {
        return sende(res, 400, { fehler: 'Unbekanntes Ganzkörperbild: ' + auftrag.datei });
      }
      const skala = runde(auftrag.skala);
      const korrektur = auftrag.korrektur === undefined ? 1 : runde(auftrag.korrektur);
      if (!(skala >= 0.2 && skala <= 1.22)) {
        return sende(res, 400, { fehler: 'Die Körpergröße liegt zwischen 0.2 und 1.22.' });
      }
      if (!(korrektur >= 0.4 && korrektur <= 1.6)) {
        return sende(res, 400, { fehler: 'Die Bildkorrektur liegt zwischen 0.4 und 1.6.' });
      }
      /* Im Rahmen zählt das Produkt, und für das gilt derselbe Bereich:
         Darunter verschwindet die Figur, darüber ist der Rahmen voll. */
      const wirkung = runde(skala * korrektur);
      if (!(wirkung >= 0.2 && wirkung <= 1.22)) {
        return sende(res, 400, { fehler: `Körpergröße mal Bildkorrektur ergibt ${wirkung}. `
          + 'Im Rahmen sind 0.2 bis 1.22 möglich.' });
      }
      const ergebnis = mitVerlauf(
        korrektur === 1
          ? `Körpergröße ${skala}: ${auftrag.datei}`
          : `Körpergröße ${skala}, Korrektur ${korrektur}: ${auftrag.datei}`,
        ['js/chars.js'], [],
        () => setzeSkala(auftrag.datei, skala, korrektur),
      );
      return sende(res, 200, { ok: true, ...ergebnis, verlauf: verlaufStand() });
    }

    /* --- Endgültig speichern --- */
    /* --- Regler des Galaxie-Hintergrunds lesen ---

       Mitgeliefert werden die Phasenfarben aus js/data.js, damit die
       Vorschau im Studio den Schleier jeder Phase zeigen kann, und die
       Beschreibung der Regler, aus der die Oberfläche ihre Schieber
       baut. */
    if (weg === '/api/galaxie' && req.method === 'GET') {
      const stand = galaxieLesen();
      return sende(res, 200, { ...stand, regler: GALAXIE_REGLER, phasen: phasenLesen() });
    }

    /* --- Regler und Phasenfarben schreiben ---

       Zwei Dateien, aber ein Schritt im Verlauf: Rückgängig nimmt beides
       zusammen zurück, denn wer im Studio auf Sichern drückt, hat eine
       Einstellung im Sinn und nicht zwei Dateien. */
    if (weg === '/api/galaxie' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const dateien = ['js/galaxy-config.js'];
      if (auftrag.phasen) dateien.push('js/data.js');
      const ergebnis = mitVerlauf('Galaxie gespeichert', dateien, [], () => {
        const regler = galaxieSchreiben(auftrag);
        const farben = auftrag.phasen ? phasenSchreiben(auftrag.phasen) : { geaendert: false };
        return { geaendert: regler.geaendert || farben.geaendert };
      });
      /* Zurück geht immer der Stand, der jetzt in den Dateien steht, und
         nicht das, was die Schreiber gerade zufällig angefasst haben. */
      const jetzt = galaxieLesen();
      return sende(res, 200, {
        ok: true,
        geaendert: ergebnis.geaendert,
        config: jetzt.config,
        regions: jetzt.regions,
        phasen: phasenLesen(),
        sicherung: SICHERUNG,
        verlauf: verlaufStand(),
      });
    }

    if (weg === '/api/speichern' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const gk = auftrag.bereich === 'ganzkoerper';
      if (!zielErlaubt(auftrag.ziel, auftrag.bereich)) {
        return sende(res, 400, { fehler: 'Unbekanntes Ziel: ' + auftrag.ziel });
      }
      const { pfad: quellpfad, vorlage } = quellePfad(auftrag.quelle);
      const zieldatei = path.join(gk ? FULLSIZE : PORTRAITS, auftrag.ziel + '.webp');
      /* Geht der Schnitt in die Datei zurück, aus der er kommt, wandert
         sie jetzt beiseite: Die Bühne zeigt noch diese Pixel, und der
         nächste Schnitt derselben Bühne soll sie wieder treffen. */
      const pfad = path.resolve(quellpfad) === path.resolve(zieldatei)
        ? bewahreUrfassung(auftrag.quelle, quellpfad)
        : quellpfad;
      /* Die Bühne misst ihren Ausschnitt in der gedrehten Fläche, also
         wird hier erst gedreht und dann geschnitten. */
      const winkel = grad(auftrag.winkel);
      const args = gk
        ? ['frei', '--bild', pfad, '--ziel', zieldatei,
          '--x', String(auftrag.x), '--y', String(auftrag.y),
          '--breite', String(auftrag.breite), '--hoehe', String(auftrag.hoehe)]
        : ['schneiden', '--bild', pfad, '--ziel', zieldatei,
          '--x', String(auftrag.x), '--y', String(auftrag.y),
          '--seite', String(auftrag.breite)];
      args.push('--winkel', String(winkel));
      /* Der Skill dreht beim nächsten Lauf nicht mit: Ein gemerkter
         Zuschnitt aus einer gedrehten Fläche träfe dort daneben. Aus dem
         Porträt selbst gibt es ebenfalls nichts zu merken: manuell.json
         führt seine Werte je Vorlagenname, und der ist im Porträtordner
         derselbe wie im Ganzkörperordner. Der Eintrag dort gehört zum
         Ganzkörperbild und würde sonst mit fremden Zahlen überschrieben. */
      const ausPortrait = auftrag.quelle && auftrag.quelle.typ === 'portrait';
      if (!gk && auftrag.merken && !winkel && !ausPortrait) args.push('--merken', vorlage);
      const sicherungspfad = sichern(auftrag.ziel, gk);

      /* Beim Ganzkörperbild gehören Körpergröße und Bildkorrektur zum
         Bild: Wer den Ausschnitt speichert, will die Figur auch in der
         Größe, die im Studio davorsteht. Beides geht deshalb im selben
         Schritt nach js/chars.js, und der Verlauf nimmt die Datei mit.

         Läuft das Produkt aus dem Rahmen, wird nur die Datei geschnitten
         und die Größe bleibt, wie sie war. Das Bild ist ja richtig, die
         Zahl daneben nicht, und ein zurückgewiesenes Speichern hülfe hier
         niemandem. */
      /* Die Schwebe gehört zum Zuschnitt und nicht zu den Reglern: Sie
         sagt, welcher Anteil der geschnittenen Datei unter der Figur
         leer ist, und die Bühne hat sie an den durchsichtigen Pixeln
         gemessen. Deshalb kommt sie hier mit und nicht über /api/skala. */
      const schwebe = gk
        ? Math.max(0, Math.min(0.9, runde3(auftrag.schwebe || 0)))
        : 0;
      const groesse = gk && auftrag.skala !== undefined
        ? { skala: runde(auftrag.skala), korrektur: runde(auftrag.korrektur ?? 1), schwebe }
        : null;
      let groesseFehler = null;
      if (groesse) {
        const wirkt = runde(groesse.skala * groesse.korrektur);
        if (!(groesse.skala >= 0.2 && groesse.skala <= 1.22)
          || !(groesse.korrektur >= 0.4 && groesse.korrektur <= 1.6)
          || !(wirkt >= 0.2 && wirkt <= 1.22)) {
          groesseFehler = `Körpergröße ${groesse.skala} mal Bildkorrektur `
            + `${groesse.korrektur} ergibt ${wirkt}, möglich sind 0.2 bis 1.22.`;
        }
      }
      const setztGroesse = !!groesse && !groesseFehler;

      /* Der Zuschnitt selbst läuft außerhalb des Rahmens, er dauert am
         längsten. Der Verlauf hält nur das Ergebnis fest.

         Gedreht und geschnitten wird in Fließkomma über die ganze Vorlage,
         und das kostet je Pixel: Eine Vorlage mit acht Megapixeln braucht
         ein Vielfaches der Zeit einer mit zweien. Das Megapixel ist
         deshalb auch hier das Maß der Schätzung. */
      const rahmen = verlaufVorher(
        setztGroesse
          ? ['tools/portrait-studio/offen.json', 'js/chars.js']
          : ['tools/portrait-studio/offen.json'],
        [auftrag.ziel]);
      const ergebnis = await mitFortschritt(
        gk ? 'Ganzkörperbild speichern' : 'Porträt speichern',
        gk ? 'zuschnitt:ganzkoerper' : 'zuschnitt:portrait',
        () => python(args), megapixel(pfad));
      /* Die Datei liegt jetzt anders da als eben. Ohne das hier meldete
         die Antwort noch den Zustand von vorher. */
      bilderVergessen();
      /* Neu geschnitten heißt erledigt: Eine Markierung von Hand hat sich
         damit erübrigt und fällt weg. */
      const menge = ladeMarkiert(auftrag.bereich);
      const warMarkiert = menge.delete(auftrag.ziel);
      if (warMarkiert) speichereMarkiert(auftrag.bereich, menge);
      const gesetzt = setztGroesse
        && setzeSkala(auftrag.ziel, groesse.skala, groesse.korrektur, groesse.schwebe).geaendert;
      verlaufAnhaengen(`${gk ? 'Ganzkörperbild' : 'Porträt'} gespeichert: ${auftrag.ziel}`
        + (gesetzt ? ' samt Größe' : ''), rahmen);
      const bericht = gk ? null : listeErneuern();
      return sende(res, 200, {
        ...ergebnis,
        sicherung: sicherungspfad,
        zustand: gk ? zustandGk(auftrag.ziel) : zustand(auftrag.ziel),
        warMarkiert,
        /* Nicht „groesse“: Das ist beim Porträt schon die Kantenlänge,
           die crop-image.py meldet. */
        groessenwerte: setztGroesse ? { ...groesse, geaendert: gesetzt } : null,
        groessenfehler: groesseFehler,
        zaehler: zaehlen(baueFiguren()),
        liste: bericht,
        verlauf: verlaufStand(),
        stand: standDesStudios(),
      });
    }

    return sende(res, 404, { fehler: 'Nicht gefunden' });
  } catch (fehler) {
    sende(res, 500, { fehler: fehler.message });
  }
});

function charSlugRoh(text) {
  return alsSlug(text);
}

/* Läuft node mit --watch, startet es den Server nach jeder Änderung an
   server.js neu. Der Vorgänger gibt den Port dabei nicht immer schon
   frei, bevor der Nachfolger ihn haben will. Ein paar Anläufe im Abstand
   von einer Viertelsekunde überbrücken das. Bleibt er belegt, hält ihn
   etwas anderes, und dann hilft nur eine andere Nummer. */
let anlaeufe = 0;

server.on('error', (fehler) => {
  if (fehler.code !== 'EADDRINUSE') throw fehler;
  if (anlaeufe >= 8) {
    console.error(`Port ${PORT} bleibt belegt. Mit --port eine andere Nummer wählen.`);
    process.exit(1);
  }
  anlaeufe += 1;
  setTimeout(() => server.listen(PORT, '127.0.0.1'), 250);
});

(async () => {
  /* Der Verlauf gilt für die laufende Sitzung, siehe oben. */
  fs.rmSync(VERLAUF, { recursive: true, force: true });
  await pythonSuchen();
  await gesichtSuchen();
  await freiSuchen();
  wacheStarten();
  server.listen(PORT, '127.0.0.1', () => {
    const adresse = `http://127.0.0.1:${PORT}`;
    const figuren = baueFiguren();
    const z = zaehlen(figuren);
    console.log('Bild-Studio: Porträts und Ganzkörperbilder');
    console.log(`  ${figuren.length} Figuren, ${z.gesamt} Porträts, `
      + `${z.fertig} freigestellt, ${z.alt} noch alt, ${z.fehlt} ohne Datei`);
    console.log(`  ${z.gk.gesamt} Ganzkörperbilder, ${z.gk.fertig} da, `
      + `${z.gk.fehlt} ohne Datei`);
    console.log(PYTHON_INFO.ok
      ? `  Python: ${PYTHON_INFO.pfad}${PYTHON_INFO.skill ? '' : ' (Skill nicht gefunden, kein Vorschlag)'}`
      : '  Python fehlt: ' + PYTHON_INFO.grund);
    console.log(ENGINE_INFO.ok
      ? `  Real-ESRGAN: ${ENGINE_INFO.pfad} (${ENGINE_INFO.modell})`
      : '  Real-ESRGAN fehlt, der Knopf „4× hochskalieren“ meldet das beim Klick.');
    console.log(GESICHT_INFO.ok
      ? `  Gesichtsmodelle: ${GESICHT_INFO.modelle.join(', ')} (Torch ${GESICHT_INFO.torch})`
      : '  Gesichtsmodelle fehlen, einzurichten mit '
        + 'services/facial-recognition/install-models.py');
    console.log(FREI_INFO.ok
      ? `  Freistellen: ${FREI_INFO.modelle.map((m) => m.name).join(', ')} `
        + `(rembg ${FREI_INFO.rembg}, aus ${FREI_INFO.heim})`
      : '  Freistellen fehlt, der Knopf „Freistellen“ meldet das beim Zeigen.');
    console.log(`  ${adresse}   (beenden mit Strg+C)`);
    if (OEFFNEN && process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', adresse], { detached: true, stdio: 'ignore' }).unref();
    }
  });
})();
