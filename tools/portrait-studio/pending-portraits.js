/* Schreibt "assets/ersetzen/A - Portraits noch offen.txt": jede Figur der
   Datenbank, deren Porträt noch aus der alten Wiki-Quelle stammt.

   Woher die Liste der Figuren kommt
   ---------------------------------
   Aus js/data.js und js/chars.js, geladen in einem vm-Kontext. Damit zählt
   genau das, was auch die Seite zeigt: der Slug aus charSlug() samt
   CHAR_ALIAS, die abweichenden Fassungen pro Film aus CHAR_LOOKS und die
   Platzhalter aus CHAR_NO_IMAGE und CHAR_NO_PROFILE. Eine neue Figur in
   data.js taucht hier ohne weiteres Zutun auf.

   Woran „schon ersetzt“ erkannt wird
   ----------------------------------
   Die neuen Porträts sind freigestellt und tragen einen Alphakanal, die
   alten aus dem Fandom-Wiki sind deckend. Das steht im WebP-Kopf und lässt
   sich ohne Bildbibliothek lesen: Bei einem VP8X-Chunk sitzt das Alphabit in
   den Flags, ein VP8L-Chunk trägt es im vierten Byte, ein reiner VP8-Chunk
   hat nie Alpha. Ein Datum oder eine gepflegte Liste würde stattdessen
   auseinanderlaufen, sobald jemand eine Datei anfasst.

   Dazu kommen die Porträts, die im Studio von Hand als noch offen markiert
   wurden. Sie stehen in tools/portrait-studio/offen.json: freigestellt,
   aber trotzdem nicht gut genug. Der Alphakanal allein sieht das nicht.

   Aufruf
   ------
       node tools/portraits-offen.js
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.dirname(__dirname);
const PORTRAITS = path.join(REPO, 'assets', 'characters', 'portraits');
const ZIEL = path.join(REPO, 'assets', 'ersetzen', 'A - Portraits noch offen.txt');
const MARKIERT = path.join(REPO, 'tools', 'portrait-studio', 'offen.json');

/* Von Hand im Studio als offen markierte Porträts. Fehlt die Datei, gibt
   es eben keine. */
function ladeMarkiert() {
  try {
    return new Set(JSON.parse(fs.readFileSync(MARKIERT, 'utf8')).offen || []);
  } catch {
    return new Set();
  }
}

/* Hat die Datei einen Alphakanal? null, wenn es kein WebP ist. */
function hasAlpha(file) {
  const head = Buffer.alloc(30);
  const fd = fs.openSync(file, 'r');
  const read = fs.readSync(fd, head, 0, 30, 0);
  fs.closeSync(fd);
  if (read < 30) return null;
  if (head.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (head.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = head.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return (head[20] & 0x10) !== 0;
  if (chunk === 'VP8L') return (head[24] & 0x10) !== 0;
  return false;
}

function loadData() {
  const ctx = {};
  vm.createContext(ctx);
  /* Beide Dateien in einem Rutsch, denn const aus getrennten Läufen sieht
     der jeweils andere nicht. Die Zuweisung am Ende holt sie heraus. */
  const src = [
    fs.readFileSync(path.join(REPO, 'js', 'data.js'), 'utf8'),
    fs.readFileSync(path.join(REPO, 'js', 'chars.js'), 'utf8'),
    ';globalThis.OUT = { PHASES, CHAR_LOOKS, CHAR_NO_IMAGE, CHAR_NO_PROFILE, charSlug, splitName };',
  ].join('\n');
  vm.runInContext(src, ctx, { filename: 'daten.js' });
  return ctx.OUT;
}

function sammle(D) {
  /* Dateiname -> { namen, auftritte }. Ein Eintrag je Bilddatei, denn eine
     Figur mit mehreren Fassungen braucht auch mehrere Bilder. */
  const bilder = new Map();
  for (const phase of D.PHASES) {
    for (const film of phase.movies) {
      for (const name of film.characters || []) {
        if (D.CHAR_NO_PROFILE.has(name) || D.CHAR_NO_IMAGE.has(name)) continue;
        const slug = D.charSlug(name);
        const looks = D.CHAR_LOOKS[slug];
        const datei = (looks && looks[film.slug]) || slug;
        let eintrag = bilder.get(datei);
        if (!eintrag) bilder.set(datei, eintrag = { datei, slug, namen: [], filme: [] });
        if (!eintrag.namen.includes(name)) eintrag.namen.push(name);
        if (!eintrag.filme.includes(film.title)) eintrag.filme.push(film.title);
      }
    }
  }
  return [...bilder.values()].sort((a, b) => a.datei.localeCompare(b.datei, 'de'));
}

/* Überschrift für eine Zeile: der ausführlichste gepflegte Name, bei einer
   abweichenden Fassung mit dem Zusatz aus dem Dateinamen dahinter. */
function anzeige(e, D) {
  const name = [...e.namen].sort((a, b) => b.length - a.length)[0];
  const real = D.splitName(name).real;
  if (e.datei === e.slug) return name;
  const zusatz = e.datei.slice(e.slug.length + 1).replace(/-/g, ' ');
  return `${real} (Fassung: ${zusatz})`;
}

function main() {
  const D = loadData();
  const alle = sammle(D);

  const markiert = ladeMarkiert();
  const offen = [];
  const fehlt = [];
  let fertig = 0;
  let vonHand = 0;
  for (const e of alle) {
    const datei = path.join(PORTRAITS, e.datei + '.webp');
    if (!fs.existsSync(datei)) fehlt.push(e);
    else if (!hasAlpha(datei)) offen.push(e);
    else if (markiert.has(e.datei)) {
      e.markiert = true;
      vonHand++;
      offen.push(e);
    } else fertig++;
  }

  const heute = new Date().toLocaleDateString('de-DE',
    { day: '2-digit', month: '2-digit', year: 'numeric' });
  const strich = '-'.repeat(70);
  const zeilen = [
    'PORTRÄTS, DIE NOCH AUF EIN NEUES BILD WARTEN',
    '',
    `Stand: ${heute}`,
    `${alle.length} Porträts in der Datenbank, ${fertig} ersetzt, ${offen.length} offen` +
      (vonHand ? `, davon ${vonHand} von Hand markiert` : '') +
      (fehlt.length ? `, ${fehlt.length} ohne Datei.` : '.'),
    '',
    'Als ersetzt gilt ein Porträt, das freigestellt ist und nicht im',
    'Porträt-Studio von Hand als offen markiert wurde. Neue Bilder gehören',
    'nach assets/ersetzen, freigestellt als PNG. In Klammern steht der',
    'Dateiname unter assets/characters/portraits.',
    '',
    'Erzeugt von tools/portraits-offen.js.',
    '',
    strich,
    '',
  ];
  for (const e of offen) {
    zeilen.push(`${anzeige(e, D)}  (${e.datei})${e.markiert ? '  [von Hand markiert]' : ''}`);
    zeilen.push(`    ${e.filme.length} Auftritt${e.filme.length === 1 ? '' : 'e'}: ${e.filme.join(', ')}`);
  }
  if (fehlt.length) {
    zeilen.push('', strich, '',
      'OHNE PORTRÄTDATEI, auf der Seite stehen dort nur die Initialen:', '');
    for (const e of fehlt) zeilen.push(`${anzeige(e, D)}  (${e.datei})`);
  }
  zeilen.push('');

  fs.writeFileSync(ZIEL, zeilen.join('\r\n'), 'utf8');
  console.log(`${alle.length} gesamt, ${fertig} ersetzt, ${offen.length} offen`
    + (vonHand ? ` (${vonHand} von Hand)` : '') + `, ${fehlt.length} ohne Datei`);
  console.log(path.relative(REPO, ZIEL));
}

main();
