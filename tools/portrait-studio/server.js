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
   tools/portraits-offen.js. Damit zählt genau das, was auch die Seite
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
   Macht bild.py über Pillow, damit das Ergebnis Pixel für Pixel dem
   entspricht, was der Skill portraits liefert. Der Browser zeigt nur die
   Vorschau. Gespeichert wird erst auf Knopfdruck, die alte Datei wandert
   vorher nach .sicherung.

   Zwei Dinge macht nicht bild.py: Das Hochrechnen einer zu kleinen
   Vorlage übernimmt Real-ESRGAN, das Neuaufbauen der Gesichter danach
   GFPGAN oder CodeFormer. Beides steht in eigenen Abschnitten weiter
   unten, beides ist freiwillig und beides braucht Programme, die nicht
   im Repo liegen.
*/

'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execFile, spawn } = require('child_process');

const HIER = __dirname;
const REPO = path.dirname(path.dirname(HIER));
const PORTRAITS = path.join(REPO, 'assets', 'characters', 'portraits');
const FULLSIZE = path.join(REPO, 'assets', 'characters', 'fullsize');
const SICHERUNG = path.join(HIER, '.sicherung');
const OFFEN = path.join(HIER, 'offen.json');
const UPLOADS = path.join(os.tmpdir(), 'portrait-studio-uploads');

const argv = process.argv.slice(2);
const PORT = Number(wert('--port') || 4321);
const OEFFNEN = !argv.includes('--kein-browser');

function wert(flagge) {
  const i = argv.indexOf(flagge);
  return i === -1 ? null : argv[i + 1];
}

/* ---------- Python finden ----------

   Zuerst die Umgebung des Skills, dann eine eigene Angabe, dann was auf
   dem Pfad liegt. Gefunden ist sie erst, wenn bild.py damit auch
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
      execFile(kandidat, [path.join(HIER, 'bild.py'), 'pruefen'],
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
    execFile(PYTHON, [path.join(HIER, 'bild.py'), ...args],
      { timeout: 180000, maxBuffer: 8 * 1024 * 1024 }, (fehler, aus, err) => {
        const zeile = (aus || '').trim().split('\n').pop();
        let daten = null;
        try { daten = JSON.parse(zeile); } catch { /* gleich unten */ }
        if (daten && daten.fehler) return scheitern(new Error(daten.fehler));
        if (fehler) return scheitern(new Error((err || fehler.message).trim()));
        if (!daten) return scheitern(new Error('Unlesbare Antwort von bild.py: ' + zeile));
        fertig(daten);
      });
  });
}

/* ---------- Datenbank lesen ---------- */

function ladeDaten() {
  const ctx = {};
  vm.createContext(ctx);
  /* Beide Dateien in einem Rutsch, denn const aus getrennten Läufen sieht
     der jeweils andere nicht. Die Zuweisung am Ende holt sie heraus. */
  const src = [
    fs.readFileSync(path.join(REPO, 'js', 'data.js'), 'utf8'),
    fs.readFileSync(path.join(REPO, 'js', 'chars.js'), 'utf8'),
    ';globalThis.OUT = { PHASES, CHAR_ALIAS, CHAR_LOOKS, FULLSIZE_LOOKS, FULLSIZE_SCALE,'
      + ' FULLSIZE_FIT, CHAR_NO_IMAGE, CHAR_NO_PROFILE, charSlug, splitName };',
  ].join('\n');
  vm.runInContext(src, ctx, { filename: 'daten.js' });
  return ctx.OUT;
}

/* Hat die Datei einen Alphakanal? null, wenn es kein WebP ist. Gleiche
   Prüfung wie in tools/portraits-offen.js: Die neuen Porträts sind
   freigestellt, die alten aus dem Wiki sind deckend. */
function hatAlpha(datei) {
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

/* ---------- Von Hand als offen markiert ----------

   Ein Bild kann fertig aussehen und trotzdem nicht gut sein. Diese Liste
   hält fest, was noch einmal gemacht werden soll. Sie steht in
   offen.json neben dieser Datei, die Porträts daraus liest auch
   tools/portraits-offen.js.

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
  const pfad = path.join(PORTRAITS, datei + '.webp');
  if (!fs.existsSync(pfad)) return 'fehlt';
  return hatAlpha(pfad) ? 'fertig' : 'alt';
}

/* Bei den Ganzkörperbildern gibt es die Unterscheidung nicht: Was da ist,
   ist freigestellt. Offen ist, was fehlt oder von Hand markiert wurde. */
function zustandGk(datei) {
  return fs.existsSync(path.join(FULLSIZE, datei + '.webp')) ? 'fertig' : 'fehlt';
}

/* Alle Figuren der Datenbank, jede mit ihren Zielen und Quellen. */
function baueFiguren() {
  const D = ladeDaten();
  const vorhanden = new Set(webpListe(FULLSIZE));
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

  const liste = [];
  for (const figur of figuren.values()) {
    const { slug } = figur;
    /* Der ausführlichste gepflegte Name trägt die Rolle, „Realname /
       Heldenname“ wird für Überschrift und Rollenzeile getrennt. */
    const voll = [...figur.namen].sort((a, b) => b.length - a.length)[0];
    const { real, role } = D.splitName(voll);

    /* Die Ganzkörper-Fassungen dieser Figur: die gepflegten aus
       FULLSIZE_LOOKS zuerst, danach alles, was im Ordner sonst noch nach
       ihr benannt ist. Anders als bei den Quellen zählen hier auch
       Fassungen ohne Datei, die sind ja gerade das, was noch fehlt. */
    const inLooks = !!D.FULLSIZE_LOOKS[slug];
    const gepflegt = D.FULLSIZE_LOOKS[slug] || [['Standard', slug]];
    const ganzkoerper = [];
    const quellen = [];
    const gesehen = new Set();
    /* „gepflegt“ heißt: Die Fassung steht in FULLSIZE_LOOKS und lässt sich
       dort umbenennen, verschieben und löschen. Alles andere ist nur eine
       Datei im Ordner. */
    const merke = (datei, label, gefuehrt) => {
      if (gesehen.has(datei)) return;
      gesehen.add(datei);
      ganzkoerper.push({
        datei,
        label,
        gepflegt: gefuehrt,
        zustand: zustandGk(datei),
        markiert: markiertGk.has(datei),
        skala: D.FULLSIZE_SCALE[datei] || 1,
        korrektur: D.FULLSIZE_FIT[datei] || 1,
      });
      if (vorhanden.has(datei)) quellen.push({ datei, label });
    };
    for (const [label, datei] of gepflegt) merke(datei, label, inLooks);
    for (const datei of vorhanden) {
      if (datei !== slug && !datei.startsWith(slug + '-')) continue;
      merke(datei, beschriftung(datei, slug, namen), false);
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
      rolle: role,
      /* Die Namen, wie sie in data.js stehen, und der Alias, der daraus
         den Schlüssel macht. Beides lässt sich im Studio ändern. */
      namen: figur.namen,
      alias: figur.namen.map((n) => D.CHAR_ALIAS[n] || null),
      auftritte: figur.filme.length,
      filme: figur.filme,
      filmSlugs: figur.filmSlugs,
      ziele,
      ganzkoerper,
      quellen,
    });
  }

  liste.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  return liste;
}

/* Die vier Fächer schließen sich aus: Ohne Datei zählt nichts anderes,
   ein deckendes Bild ist ohnehin alt, und erst ein freigestelltes Bild
   kann von Hand als offen markiert sein. */
function zaehlen(figuren) {
  const z = { gesamt: 0, fertig: 0, alt: 0, fehlt: 0, markiert: 0, ohneQuelle: 0 };
  const gk = { gesamt: 0, fertig: 0, alt: 0, fehlt: 0, markiert: 0 };
  for (const figur of figuren) {
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

/* Die Dateien im Repo tragen CRLF. Beim Zerlegen fällt der Wagenrücklauf
   weg und beim Zusammensetzen wieder an, sonst mischt eine neue Zeile die
   Zeilenenden. */
const bruchVon = (quelle) => (quelle.includes('\r\n') ? '\r\n' : '\n');

function zahl(wert) {
  return String(Math.round(wert * 100) / 100);
}

/* Zwei Nachkommastellen, mehr trägt weder der Regler noch chars.js. */
const runde = (wert) => Math.round(Number(wert) * 100) / 100;

const WERT_ZEILE = /^\s*'([^']+)':\s*([0-9.]+),/;

/* Der Inhalt einer Tabelle als Zeilen, dazu die Stellen, zwischen denen
   er in der Quelle steht. Beides zusammen ergibt wieder die Datei. */
function blockVon(quelle, name) {
  const anfang = quelle.indexOf(`const ${name} = {`);
  if (anfang === -1) throw new Error(`${name} steht nicht in js/chars.js.`);
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

function setzeSkala(datei, skala, korrektur) {
  const quelle = fs.readFileSync(CHARS, 'utf8');
  const mitSkala = neueSkalaQuelle(quelle, datei, skala);
  const neu = neueKorrekturQuelle(mitSkala === null ? quelle : mitSkala, datei, korrektur);
  if (mitSkala === null && neu === null) return { geaendert: false };
  const fassung = neu === null ? mitSkala : neu;

  /* Prüfen, bevor die Datei angefasst wird: laden und nachsehen. */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(
    [fs.readFileSync(path.join(REPO, 'js', 'data.js'), 'utf8'), fassung,
      ';globalThis.PROBE = { skala: FULLSIZE_SCALE, korrektur: FULLSIZE_FIT };'].join('\n'),
    ctx, { filename: 'chars-probe.js' });
  const gerundet = (wert) => (wert === 1 ? undefined : Math.round(wert * 100) / 100);
  for (const [name, wert] of [['Körpergröße', skala], ['Bildkorrektur', korrektur]]) {
    const tabelle = name === 'Körpergröße' ? ctx.PROBE.skala : ctx.PROBE.korrektur;
    if (tabelle[datei] !== gerundet(wert)) {
      throw new Error(`Die neue Fassung von chars.js trägt bei der ${name} `
        + `${tabelle[datei]} statt ${gerundet(wert)}.`);
    }
  }

  fs.mkdirSync(SICHERUNG, { recursive: true });
  const stempel = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.copyFileSync(CHARS, path.join(SICHERUNG, `chars-${stempel}.js`));
  fs.writeFileSync(CHARS, fassung, 'utf8');
  return { geaendert: true, skala, korrektur };
}

/* ---------- Fassungen verwalten ----------

   FULLSIZE_LOOKS in js/chars.js führt je Figur ihre Ganzkörper-Fassungen
   als [Beschriftung, Dateiname]. Der erste Eintrag ist die Standardansicht
   und heißt wie der Charakter-Slug, er bleibt deshalb stehen. Figuren mit
   nur einer Ansicht haben gar keinen Eintrag, der Block entsteht erst mit
   der zweiten Fassung und fällt mit ihr wieder weg.

   Gearbeitet wird zeilenweise, damit Kommentare und Reihenfolge der Datei
   erhalten bleiben. Geschrieben wird erst, wenn sich die neue Fassung
   laden lässt und trägt, was sie soll. */
const EINTRAG = /^\s*\['(.*?)', '([a-z0-9-]+)'\],$/;

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
  return bericht;
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
  if (aktion !== 'neu' && abgeleitet.length) {
    if (!figur) {
      zeilen.splice(bereich.ende, 0,
        `  '${slug}': [`,
        ...abgeleitet.map(([l, d]) => `    ['${beschriftungRoh(l)}', '${d}'],`),
        '  ],');
      bereich.ende += abgeleitet.length + 2;
      figur = figurBereich(zeilen, bereich, slug);
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
          ...fehlend.map(([l, d]) => `    ['${beschriftungRoh(l)}', '${d}'],`));
        bereich.ende += fehlend.length;
        figur = figurBereich(zeilen, bereich, slug);
      }
    }
  }

  /* Alle Einträge des Blocks, in ihrer Reihenfolge. */
  const einlesen = () => {
    const liste = [];
    if (!figur) return liste;
    for (let i = figur.start + 1; i < figur.ende; i += 1) {
      const t = EINTRAG.exec(zeilen[i]);
      if (t) liste.push({ zeile: i, label: t[1], datei: t[2] });
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
    zeilen[meiner.zeile] = `    ['${label}', '${neueDatei}'],`;
    return {
      quelle: zusammen(),
      pruefe: { datei: neueDatei, label },
      umbenennung: neueDatei === auftrag.datei ? null : { alt: auftrag.datei, neu: neueDatei },
    };
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
    return { quelle: zusammen(), pruefe: { datei: auftrag.datei, stelle: ziel } };
  }

  if (aktion === 'loeschen') {
    if (!figur) throw new Error(`${slug} hat keine Fassungsliste.`);
    const eintraege = einlesen();
    if (eintraege.length <= 1) throw new Error('Das ist das einzige Bild der Figur.');
    const weg = eintraege.find((e) => e.datei === auftrag.datei);
    if (!weg) throw new Error(`${auftrag.datei} steht nicht in der Liste von ${slug}.`);
    const rest = eintraege.filter((e) => e !== weg);
    if (rest.length === 1 && rest[0].datei === slug) {
      /* Übrig bliebe nur ein Bild, das ohnehin wie die Figur heißt. Dann
         ist der ganze Block überflüssig: Figuren ohne Eintrag zeigen
         einfach ihr einzelnes Bild. */
      zeilen.splice(figur.start, figur.ende - figur.start + 1);
    } else {
      zeilen.splice(weg.zeile, 1);
    }
    return { quelle: zusammen(), pruefe: { datei: auftrag.datei, label: null } };
  }

  if (aktion !== 'neu') throw new Error('Unbekannte Aktion: ' + aktion);

  if (!label) throw new Error('Die Beschriftung darf nicht leer sein.');
  /* Auch beim Anlegen kommt der Dateiname aus der Beschriftung. */
  const belegt = new Set(einlesen().map((e) => e.datei));
  if (!figur) belegt.add(slug);
  const datei = dateiAusLabel(slug, auftrag.label, belegt);
  const neu = `    ['${label}', '${datei}'],`;

  if (figur) {
    zeilen.splice(figur.ende, 0, neu);
  } else {
    /* Erste zusätzliche Fassung: Der Block entsteht mit der
       Standardansicht an erster Stelle, so verlangt es chars.js. */
    const standard = beschriftungRoh(auftrag.standardLabel || 'Standard');
    zeilen.splice(bereich.ende, 0,
      `  '${slug}': [`,
      `    ['${standard}', '${slug}'],`,
      neu,
      '  ],');
  }
  return { quelle: zusammen(), pruefe: { datei, label } };
}

function fassungAendern(auftrag) {
  const alt = fs.readFileSync(CHARS, 'utf8');
  /* Die Liste, wie die Oberfläche sie zeigt: gepflegte Fassungen zuerst,
     danach die reinen Dateien aus dem Ordner. Sie dient als Vorlage,
     falls der Eintrag in FULLSIZE_LOOKS erst entstehen muss. */
  const figur = baueFiguren().find((f) => f.slug === auftrag.slug);
  const abgeleitet = figur ? figur.ganzkoerper.map((z) => [z.label, z.datei]) : [];
  const { quelle, pruefe, umbenennung } = neueFassungQuelle(alt, { ...auftrag, abgeleitet });

  /* Prüfen, bevor die Datei angefasst wird. */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(
    [fs.readFileSync(path.join(REPO, 'js', 'data.js'), 'utf8'), quelle,
      ';globalThis.PROBE = FULLSIZE_LOOKS;'].join('\n'),
    ctx, { filename: 'chars-probe.js' });
  const entkommen = (text) => text.replace(/\\(['\\])/g, '$1');
  const liste = ctx.PROBE[auftrag.slug] || [];
  const treffer = liste.find(([, d]) => d === pruefe.datei);
  if (pruefe.stelle !== undefined) {
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

  fs.mkdirSync(SICHERUNG, { recursive: true });
  const stempel = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.copyFileSync(CHARS, path.join(SICHERUNG, `chars-${stempel}.js`));

  /* Der Dateiname folgt der Beschriftung. Ändert sie sich, wandert das
     Bild mit, dazu Körpergröße, Bildkorrektur, Offen-Markierung und
     Quellenangabe. FULLSIZE_LOOKS trägt den neuen Namen schon. */
  let mitgewandert = null;
  if (umbenennung) {
    const werte = {};
    vm.createContext(werte);
    vm.runInContext([fs.readFileSync(DATA, 'utf8'), alt,
      ';globalThis.S = FULLSIZE_SCALE; globalThis.F = FULLSIZE_FIT;'].join('\n'), werte);
    let quelleMitSkala = quelle;
    /* Am alten Namen zurücksetzen, am neuen eintragen. Der Standardwert
       nimmt die alte Zeile heraus. */
    const umziehen = (wert, schreiber) => {
      if (!wert) return false;
      for (const [datei, neuerWert] of [[umbenennung.alt, 1], [umbenennung.neu, wert]]) {
        const naechste = schreiber(quelleMitSkala, datei, neuerWert);
        if (naechste !== null) quelleMitSkala = naechste;
      }
      return true;
    };
    const mitGroesse = umziehen(werte.S[umbenennung.alt], neueSkalaQuelle);
    const mitKorrektur = umziehen(werte.F[umbenennung.alt], neueKorrekturQuelle);
    fs.writeFileSync(CHARS, quelleMitSkala, 'utf8');
    mitgewandert = dateiUmbenennen(umbenennung.alt, umbenennung.neu, stempel);
    if (mitGroesse) mitgewandert.push('Körpergröße');
    if (mitKorrektur) mitgewandert.push('Bildkorrektur');
    return { datei: umbenennung.neu, umbenannt: { ...umbenennung, mitgewandert } };
  }

  /* Beim Löschen wandern Bild und Größenangaben mit. Sonst stünde die
     Fassung gleich wieder in der Liste, denn der Ordner wird mitgelesen. */
  let bildWeg = null;
  if (auftrag.aktion === 'loeschen') {
    const bild = path.join(FULLSIZE, auftrag.datei + '.webp');
    if (fs.existsSync(bild)) {
      const ziel = path.join(SICHERUNG, `gk-${auftrag.datei}-${stempel}.webp`);
      fs.copyFileSync(bild, ziel);
      fs.unlinkSync(bild);
      bildWeg = path.relative(REPO, ziel).replace(/\\/g, '/');
    }
    const ohneSkala = neueSkalaQuelle(quelle, auftrag.datei, 1);
    const ohneMasse = neueKorrekturQuelle(ohneSkala === null ? quelle : ohneSkala,
      auftrag.datei, 1);
    fs.writeFileSync(CHARS, ohneMasse === null
      ? (ohneSkala === null ? quelle : ohneSkala) : ohneMasse, 'utf8');
    const menge = ladeMarkiert('ganzkoerper');
    if (menge.delete(auftrag.datei)) speichereMarkiert('ganzkoerper', menge);
  } else {
    fs.writeFileSync(CHARS, quelle, 'utf8');
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
   wird deshalb '<alt>' und '<alt>-zusatz', nie ein bloßer Teilstring. */
function slugMuster(alt) {
  return new RegExp(`(['"])${alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-[a-z0-9-]+)?\\1`, 'g');
}

function slugErsetzen(text, alt, neu) {
  return text.replace(slugMuster(alt), (_, q, zusatz) => `${q}${neu}${zusatz || ''}${q}`);
}

function slugWandern(alt, neu, stempel) {
  const bericht = { dateien: [], quellen: [] };
  for (const [name, pfad] of [['js/chars.js', CHARS], ['js/data.js', DATA],
    ['js/profiles.js', PROFILES], ['js/facts.js', FACTS]]) {
    if (!fs.existsSync(pfad)) continue;
    const vorher = fs.readFileSync(pfad, 'utf8');
    const nachher = slugErsetzen(vorher, alt, neu);
    if (vorher === nachher) continue;
    fs.copyFileSync(pfad, path.join(SICHERUNG, `${path.basename(pfad)}-${stempel}`));
    fs.writeFileSync(pfad, nachher, 'utf8');
    bericht.quellen.push(name);
  }
  for (const ordner of [PORTRAITS, FULLSIZE]) {
    for (const datei of webpListe(ordner)) {
      if (datei !== alt && !datei.startsWith(alt + '-')) continue;
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
  if (neuerSlug !== slug) wanderung = slugWandern(slug, neuerSlug, stempel);

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

   Der Stand ist immer ein Anteil zwischen 0 und 1, nie unbestimmt. Wo
   ein Programm von sich aus Prozente meldet, werden seine genommen, sonst
   zählen die Arbeitsschritte. Eine Arbeit aus mehreren Abschnitten legt
   deren Anteile gewichtet aneinander, damit der Balken einmal
   durchläuft, statt je Abschnitt neu zu beginnen.

   Der Strom kennt keinen Zustand: Wer sich anhängt, bekommt sofort den
   aktuellen Stand geschickt. Ein Neuladen mitten im Lauf verliert also
   nichts. */
const zuhoerer = new Set();
const laeufe = new Map();       // id -> { titel, schritt, anteil, seit }
let laufZaehler = 0;

function fortschrittStand() {
  /* Der jüngste Lauf ist der, den der Nutzer gerade ausgelöst hat. */
  const alle = [...laeufe.entries()].map(([id, l]) => ({ id, ...l }));
  return { laeufe: alle.sort((a, b) => b.seit - a.seit) };
}

function sendeStand() {
  const zeile = `data: ${JSON.stringify(fortschrittStand())}\n\n`;
  for (const res of zuhoerer) {
    try { res.write(zeile); } catch { zuhoerer.delete(res); }
  }
}

/* Eine Arbeit anmelden. Die Abschnitte sind [Name, Gewicht]-Paare, ihre
   Gewichte müssen sich nicht auf eins summieren, sie werden normiert. */
function laufStarten(titel, abschnitte) {
  const id = ++laufZaehler;
  const gesamt = abschnitte.reduce((s, [, g]) => s + g, 0) || 1;
  let davor = 0;
  const felder = abschnitte.map(([name, gewicht]) => {
    const eintrag = { name, von: davor / gesamt, breite: gewicht / gesamt };
    davor += gewicht;
    return eintrag;
  });
  laeufe.set(id, { titel, schritt: felder[0] ? felder[0].name : titel, anteil: 0, seit: Date.now() });
  sendeStand();

  let stelle = 0;
  return {
    /* Innerhalb des laufenden Abschnitts, 0 bis 1. */
    setz(anteilImAbschnitt, schritt) {
      const l = laeufe.get(id);
      if (!l) return;
      const a = felder[stelle] || { von: 0, breite: 1 };
      const roh = a.von + Math.min(1, Math.max(0, anteilImAbschnitt)) * a.breite;
      /* Nie rückwärts: Ein springender Balken wirkt kaputt. */
      l.anteil = Math.max(l.anteil, Math.min(1, roh));
      if (schritt) l.schritt = schritt;
      sendeStand();
    },
    /* Zum nächsten Abschnitt weiterrücken. */
    weiter(schritt) {
      const l = laeufe.get(id);
      if (!l) return;
      const a = felder[stelle];
      if (a) l.anteil = Math.max(l.anteil, a.von + a.breite);
      stelle = Math.min(stelle + 1, felder.length - 1);
      l.schritt = schritt || (felder[stelle] ? felder[stelle].name : l.schritt);
      sendeStand();
    },
    /* Einen Abschnitt überspringen, ohne seine Zeit zu verbrauchen: Was
       aus dem Speicher kommt, ist sofort fertig. */
    ueberspringe(schritt) {
      this.weiter(schritt);
    },
    fertig() {
      const l = laeufe.get(id);
      if (l) l.anteil = 1;
      sendeStand();
      /* Die volle Länge muss stehen bleiben, bis sie auch angekommen ist.
         Der Balken wandert im Browser über eine knappe Drittelsekunde
         dorthin, alles darunter sähe der Nutzer nie. */
      setTimeout(() => { laeufe.delete(id); sendeStand(); }, 600);
    },
    abbrechen() {
      laeufe.delete(id);
      sendeStand();
    },
  };
}

/* Eine Arbeit umhüllen, die keine eigenen Zwischenstände meldet. Der
   Balken läuft dann mit der erwarteten Dauer mit und bleibt kurz vor dem
   Ende stehen, bis die Arbeit wirklich fertig ist. So geht er nie
   rückwärts und behauptet nie, fertig zu sein, bevor er es ist. */
async function mitFortschritt(titel, erwarteteSekunden, arbeit) {
  const lauf = laufStarten(titel, [[titel, 1]]);
  const beginn = Date.now();
  const takt = setInterval(() => {
    const anteil = (Date.now() - beginn) / 1000 / erwarteteSekunden;
    /* Asymptotisch gegen 0.95: erst zügig, dann immer langsamer. */
    lauf.setz(0.95 * (1 - Math.exp(-2.2 * anteil)));
  }, 200);
  try {
    const ergebnis = await arbeit(lauf);
    clearInterval(takt);
    lauf.fertig();
    return ergebnis;
  } catch (fehler) {
    /* Bei einem Fehler verschwindet der Balken sofort, statt vorher noch
       auf hundert zu springen. Was schiefging, sagt die Meldung. */
    clearInterval(takt);
    lauf.abbrechen();
    throw fehler;
  }
}

/* ---------- Hochskalieren ----------

   Real-ESRGAN als portable ncnn-Vulkan-Version rechnet eine Vorlage
   vierfach hoch, bevor daraus geschnitten wird. Das lohnt sich bei
   kleinen Vorlagen, deren Ausschnitt sonst unter 240 Pixel fiele.

   Gesucht wird die Engine wie Python: erst eine eigene Angabe über die
   Umgebungsvariable REALESRGAN_PFAD, dann tools/realesrgan im Repo, dann
   der entpackte Download. Das Ergebnis landet als PNG bei den
   hochgeladenen Bildern und geht denselben Weg wie ein eigenes Bild.

   Die Kachelgröße ist fest auf 128 gesetzt: Mit der automatischen Wahl
   bricht die Intel-Grafik dieses Rechners mit „vkQueueSubmit failed“ ab
   und schreibt ein vollständig durchsichtiges Bild. Schlägt auch 128
   fehl, folgt genau ein zweiter Versuch mit 64. */
const ENGINE_MODELL = process.env.REALESRGAN_MODELL || 'realesrgan-x4plus';
const ENGINE_KANDIDATEN = [
  process.env.REALESRGAN_PFAD,
  path.join(REPO, 'tools', 'realesrgan', 'realesrgan-ncnn-vulkan.exe'),
  path.join(os.homedir(), 'Downloads', 'realesrgan-ncnn-vulkan-20220424-windows',
    'realesrgan-ncnn-vulkan.exe'),
].filter(Boolean);

const ENGINE = ENGINE_KANDIDATEN.find((p) => fs.existsSync(p)) || null;
const ENGINE_INFO = ENGINE
  ? { ok: true, pfad: ENGINE, modell: ENGINE_MODELL }
  : {
    ok: false,
    grund: 'Real-ESRGAN wurde nicht gefunden. Die Engine gehört als '
      + 'realesrgan-ncnn-vulkan.exe nach tools/realesrgan oder in den '
      + 'Downloads-Ordner, oder ihr Pfad steht in der Umgebungsvariable '
      + 'REALESRGAN_PFAD.',
  };

/* Die Engine schreibt ihren Stand fortlaufend nach stderr, als Zeilen wie
   „86,67%“ mit dem Komma der deutschen Windows-Ausgabe. Deshalb spawn
   statt execFile: Nur so lässt sich mitlesen, während sie rechnet, statt
   erst am Ende alles auf einmal zu bekommen. */
function engineLauf(quelle, ziel, kachel, melde) {
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
      const treffer = [...text.matchAll(/(\d+[.,]\d+)\s*%/g)].pop();
      if (treffer && melde) melde(parseFloat(treffer[1].replace(',', '.')) / 100);
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

/* Breite und Höhe aus dem PNG-Kopf. null heißt: keine brauchbare Datei. */
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
   gelernten Gesichtsmodell neu auf, siehe tools/gesicht/gesicht.py.

   Das ist ein zweiter Schritt nach dem Hochskalieren und ein eigenes
   Python: Die Modelle brauchen PyTorch, das in der schlanken Umgebung des
   Porträt-Skills nichts zu suchen hat. Fehlt die Umgebung, bleiben die
   Modelle in der Oberfläche gesperrt und das Hochskalieren geht ohne. */
const GESICHT_SKRIPT = path.join(REPO, 'tools', 'gesicht', 'gesicht.py');
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
            + 'tools/gesicht/einrichten.py, siehe den Kopf dieser Datei.',
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

/* gesicht.py meldet seinen Stand als Zeilen „FORTSCHRITT <0..1> <Text>“
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
        return scheitern(new Error('Unlesbare Antwort von gesicht.py: '
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

async function esrganSchritt(pfad, lauf) {
  const schluessel = pfad + '|' + fs.statSync(pfad).mtimeMs;
  const bekannt = skaliert.get(schluessel);
  if (bekannt && fs.existsSync(bekannt)) {
    if (lauf) lauf.ueberspringe('Aus dem Speicher übernommen');
    return { pfad: bekannt, wiederverwendet: true };
  }

  fs.mkdirSync(UPLOADS, { recursive: true });
  const ziel = path.join(UPLOADS, neueId() + '.png');
  const melde = lauf ? (anteil) => lauf.setz(anteil, 'Bild wird hochgerechnet') : null;
  try {
    await engineLauf(pfad, ziel, 128, melde);
  } catch {
    await engineLauf(pfad, ziel, 64, melde);
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

  /* Das Hochrechnen dauert etwa dreimal so lange wie das Gesicht. Mit
     diesen Gewichten läuft der Balken einmal durch, statt bei jedem
     Abschnitt neu anzusetzen. */
  const lauf = laufStarten('Upscale',
    modell === 'ohne' ? [['Bild wird hochgerechnet', 1]]
      : [['Bild wird hochgerechnet', 3], ['Gesichter werden neu aufgebaut', 1]]);

  try {
    const gross = await esrganSchritt(pfad, lauf);
    let ergebnisPfad = gross.pfad;
    let gesichter = null;
    let hinweis = null;

    if (modell !== 'ohne') {
      const ziel = path.join(UPLOADS, neueId() + '.png');
      const bericht = await gesichtLauf(gross.pfad, ziel, modell, treue,
        (anteil, text) => lauf.setz(anteil, text));
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

/* ---------- Quelle auflösen ----------

   Nur Dateien aus dem Ganzkörperordner und frisch hochgeladene Bilder
   sind erlaubt. Damit kann über die Schnittstelle nichts Beliebiges vom
   Rechner gelesen werden. */
function quellePfad(quelle) {
  if (!quelle || typeof quelle !== 'object') throw new Error('Quelle fehlt.');
  if (quelle.typ === 'fullsize') {
    if (!/^[a-z0-9-]+$/.test(quelle.name || '')) throw new Error('Ungültige Quelle.');
    const pfad = path.join(FULLSIZE, quelle.name + '.webp');
    if (!fs.existsSync(pfad)) throw new Error('Ganzkörperbild fehlt: ' + quelle.name);
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

/* Die Liste der offenen Porträts neu schreiben. Der Nutzer erwartet sie
   nach jedem Austausch aktuell, siehe tools/portraits-offen.js. */
function listeErneuern() {
  return new Promise((fertig) => {
    execFile(process.execPath, [path.join(REPO, 'tools', 'portraits-offen.js')],
      { cwd: REPO, timeout: 60000 }, (fehler, aus) => {
        fertig(fehler ? null : (aus || '').trim().split('\n')[0]);
      });
  });
}

/* ---------- Läuft hier noch die Fassung von vorhin? ----------

   Am Studio wird gearbeitet, während es läuft. Node lädt dabei nichts
   nach: server.js und bild.py bleiben auf dem Stand des Starts. Wer eine
   Änderung erwartet und sie nicht bekommt, sucht den Fehler sonst in
   seinem Bild statt im laufenden Prozess, und das kann dauern.

   Die Seite bekommt ihre Dateien bei jedem Laden frisch, siehe no-store
   in sende(). Ein Tab, der schon länger offen ist, kann trotzdem alt
   sein, deshalb geht der jüngste Zeitstempel mit an die Oberfläche: Sie
   vergleicht ihn mit dem, den sie beim Laden gesehen hat. */
const START = Date.now();
const SERVERDATEIEN = ['server.js', 'bild.py'];
const SEITENDATEIEN = ['index.html', 'studio.js', 'studio.css', 'hintergrund.js'];

function mtime(name) {
  try { return fs.statSync(path.join(HIER, name)).mtimeMs; } catch { return 0; }
}

function standDesStudios() {
  return {
    serverAlt: SERVERDATEIEN.filter((name) => mtime(name) > START),
    seite: Math.max(...SEITENDATEIEN.map(mtime)),
  };
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
    /* --- Oberfläche --- */
    if (weg === '/' || weg === '/index.html') return datei(res, path.join(HIER, 'index.html'));
    if (['/studio.css', '/studio.js', '/hintergrund.js'].includes(weg)) {
      return datei(res, path.join(HIER, weg.slice(1)));
    }

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
        figuren, zaehler: zaehlen(figuren), python: PYTHON_INFO,
        engine: ENGINE_INFO, gesicht: GESICHT_INFO, verlauf: verlaufStand(),
        stand: standDesStudios(),
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

    /* --- Vorschlag: Kopf beim Porträt, Rand beim Ganzkörperbild --- */
    if (weg === '/api/auto') {
      const quelle = { typ: url.searchParams.get('typ'), name: url.searchParams.get('name'), id: url.searchParams.get('id') };
      const { pfad } = quellePfad(quelle);
      const gk = url.searchParams.get('bereich') === 'ganzkoerper';
      const befehl = gk ? 'rand' : 'analyse';
      return sende(res, 200, await mitFortschritt(
        gk ? 'Rand suchen' : 'Gesicht suchen', 2, () => python([befehl, '--bild', pfad])));
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
      const bericht = auftrag.bereich === 'ganzkoerper' ? null : await listeErneuern();
      return sende(res, 200, {
        ok: true,
        markiert: menge.has(auftrag.ziel),
        zaehler: zaehlen(baueFiguren()),
        liste: bericht,
        verlauf: verlaufStand(),
      });
    }

    /* --- Verlauf --- */
    if (weg === '/api/verlauf' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const titel = await mitFortschritt(
        auftrag.richtung === 'vor' ? 'Wiederholen' : 'Rückgängig', 2,
        async () => verlaufGehen(auftrag.richtung === 'vor' ? 'vor' : 'zurueck'));
      const liste = await listeErneuern();
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
          ['js/data.js', 'js/chars.js', 'js/profiles.js', 'js/facts.js'],
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

    /* --- Fassungen anlegen, umbenennen, verschieben, löschen --- */
    if (weg === '/api/fassung' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const figuren = baueFiguren();
      if (!figuren.some((f) => f.slug === auftrag.slug)) {
        return sende(res, 400, { fehler: 'Unbekannte Figur: ' + auftrag.slug });
      }
      if (auftrag.aktion !== 'neu' && !zielErlaubt(auftrag.datei, 'ganzkoerper')) {
        return sende(res, 400, { fehler: 'Unbekannte Fassung: ' + auftrag.datei });
      }
      const wort = {
        neu: 'angelegt', umbenennen: 'umbenannt', verschieben: 'verschoben',
        standard: 'nach vorn', loeschen: 'gelöscht',
      }[auftrag.aktion] || auftrag.aktion;
      const ergebnis = mitVerlauf(
        `Fassung ${wort}: ${auftrag.label || auftrag.datei}`,
        ['js/chars.js', 'tools/portrait-studio/offen.json',
          'assets/characters/fullsize/CREDITS.md'],
        [auftrag.slug],
        () => fassungAendern(auftrag),
      );
      return sende(res, 200, { ok: true, ...ergebnis, zaehler: zaehlen(baueFiguren()), verlauf: verlaufStand() });
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
    if (weg === '/api/speichern' && req.method === 'POST') {
      const auftrag = JSON.parse((await koerper(req)).toString('utf8'));
      const gk = auftrag.bereich === 'ganzkoerper';
      if (!zielErlaubt(auftrag.ziel, auftrag.bereich)) {
        return sende(res, 400, { fehler: 'Unbekanntes Ziel: ' + auftrag.ziel });
      }
      const { pfad, vorlage } = quellePfad(auftrag.quelle);
      const zieldatei = path.join(gk ? FULLSIZE : PORTRAITS, auftrag.ziel + '.webp');
      const args = gk
        ? ['frei', '--bild', pfad, '--ziel', zieldatei,
          '--x', String(auftrag.x), '--y', String(auftrag.y),
          '--breite', String(auftrag.breite), '--hoehe', String(auftrag.hoehe)]
        : ['schneiden', '--bild', pfad, '--ziel', zieldatei,
          '--x', String(auftrag.x), '--y', String(auftrag.y),
          '--seite', String(auftrag.breite)];
      if (!gk && auftrag.merken) args.push('--merken', vorlage);
      const sicherungspfad = sichern(auftrag.ziel, gk);

      /* Beim Ganzkörperbild gehören Körpergröße und Bildkorrektur zum
         Bild: Wer den Ausschnitt speichert, will die Figur auch in der
         Größe, die im Studio davorsteht. Beides geht deshalb im selben
         Schritt nach js/chars.js, und der Verlauf nimmt die Datei mit.

         Läuft das Produkt aus dem Rahmen, wird nur die Datei geschnitten
         und die Größe bleibt, wie sie war. Das Bild ist ja richtig, die
         Zahl daneben nicht, und ein zurückgewiesenes Speichern hülfe hier
         niemandem. */
      const groesse = gk && auftrag.skala !== undefined
        ? { skala: runde(auftrag.skala), korrektur: runde(auftrag.korrektur ?? 1) }
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
         längsten. Der Verlauf hält nur das Ergebnis fest. */
      const rahmen = verlaufVorher(
        setztGroesse
          ? ['tools/portrait-studio/offen.json', 'js/chars.js']
          : ['tools/portrait-studio/offen.json'],
        [auftrag.ziel]);
      const ergebnis = await mitFortschritt(
        gk ? 'Ganzkörperbild speichern' : 'Porträt speichern', 3, () => python(args));
      /* Neu geschnitten heißt erledigt: Eine Markierung von Hand hat sich
         damit erübrigt und fällt weg. */
      const menge = ladeMarkiert(auftrag.bereich);
      const warMarkiert = menge.delete(auftrag.ziel);
      if (warMarkiert) speichereMarkiert(auftrag.bereich, menge);
      const gesetzt = setztGroesse
        && setzeSkala(auftrag.ziel, groesse.skala, groesse.korrektur).geaendert;
      verlaufAnhaengen(`${gk ? 'Ganzkörperbild' : 'Porträt'} gespeichert: ${auftrag.ziel}`
        + (gesetzt ? ' samt Größe' : ''), rahmen);
      const bericht = gk ? null : await listeErneuern();
      return sende(res, 200, {
        ...ergebnis,
        sicherung: sicherungspfad,
        zustand: gk ? zustandGk(auftrag.ziel) : zustand(auftrag.ziel),
        warMarkiert,
        /* Nicht „groesse“: Das ist beim Porträt schon die Kantenlänge,
           die bild.py meldet. */
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

(async () => {
  /* Der Verlauf gilt für die laufende Sitzung, siehe oben. */
  fs.rmSync(VERLAUF, { recursive: true, force: true });
  await pythonSuchen();
  await gesichtSuchen();
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
      : '  Gesichtsmodelle fehlen, einzurichten mit tools/gesicht/einrichten.py');
    console.log(`  ${adresse}   (beenden mit Strg+C)`);
    if (OEFFNEN && process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', adresse], { detached: true, stdio: 'ignore' }).unref();
    }
  });
})();
