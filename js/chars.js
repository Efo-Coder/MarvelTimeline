/* Charakter-Grundlagen, die sich beide Seiten teilen.

   In data.js steht pro Film nur eine Liste von Namen. Alles Weitere zu
   einer Figur entsteht daraus: der Schlüssel, unter dem sie geführt wird,
   ihr Porträt, die Aufteilung in Real- und Heldenname und die Liste ihrer
   Auftritte. Die Timeline (js/main.js) und die Charakterseite
   (js/characters.js) bauen darauf auf und führen dieselbe Figur damit
   unter demselben Schlüssel.

   Diese Datei gehört vor beide Seitenskripte ins HTML. */

/* ---------- Charakter-Profilbilder ----------

   Jedes Porträt liegt unter assets/characters/portraits/<slug>.webp,
   Ganzkörperbilder für die Biografie der Vollansicht unter
   assets/characters/fullsize/<slug>.webp. Der Slug entsteht per
   charSlug() aus dem Namen, es gibt also keine gepflegte Dateiliste:
   Ein neuer Charakter in data.js braucht nur die gleichnamige
   Bilddatei.

   In data.js heißt jede Figur einheitlich "Realname / Heldenname".
   Der Dateiname ist trotzdem der kurze Realname, sonst müsste jede
   Umbenennung auch die Bilder umbenennen. CHAR_ALIAS schlägt diese
   Brücke und fasst zugleich die Fälle zusammen, in denen derselbe
   Mensch bewusst unterschiedlich heißt: Sam Wilson ist erst Falcon
   und später Captain America, Ross wird zum Red Hulk. Verschiedene
   Namen im Verlauf, aber eine Figur mit einer Übersicht.

   CHAR_NO_IMAGE sind Platzhalter ohne einzelnes Porträt, sie
   sparen sich den 404-Umweg über den error-Handler. */
const CHAR_ALIAS = {
  'Alexei / Red Guardian': 'Alexei',
  'Ava Starr / Ghost': 'Ava Starr',
  'Baby Groot': 'Groot',
  'Bruce Banner / Hulk': 'Bruce Banner',
  'Bruce Banner / Hulk (angekündigt)': 'Bruce Banner',
  'Bucky Barnes / Winter Soldier': 'Bucky Barnes',
  'Carol Danvers / Captain Marvel': 'Carol Danvers',
  'Clint Barton / Hawkeye': 'Clint Barton',
  'Frank Castle / Punisher (angekündigt)': 'Frank Castle / Punisher',
  'Gamora (2014)': 'Gamora',
  'General Thaddeus „Thunderbolt“ Ross': 'Thaddeus Ross',
  'General Thaddeus „Thunderbolt“ Ross / Red Hulk': 'Thaddeus Ross',
  'Hope van Dyne / Wasp': 'Hope van Dyne',
  'James Rhodes / War Machine': 'James Rhodes',
  'Jane Foster / Mighty Thor': 'Jane Foster',
  'John Walker / U.S. Agent': 'John Walker',
  'Natasha Romanoff / Black Widow': 'Natasha Romanoff',
  'Peter Parker (Holland, Maguire & Garfield)': 'Peter Parker',
  'Peter Parker / Spider-Man': 'Peter Parker',
  'Peter Quill / Star-Lord': 'Peter Quill',
  'Riri Williams / Ironheart': 'Riri Williams',
  'Ronan der Ankläger': 'Ronan',
  'Sam Wilson / Captain America': 'Sam Wilson',
  'Sam Wilson / Falcon': 'Sam Wilson',
  'Scott Lang / Ant-Man': 'Scott Lang',
  'Stephen Strange / Doctor Strange': 'Stephen Strange',
  'Steve Rogers / Captain America': 'Steve Rogers',
  "T'Challa / Black Panther": "T'Challa",
  'Tony Stark / Iron Man': 'Tony Stark',
  'Wanda Maximoff / Scarlet Witch': 'Wanda Maximoff',
};

const CHAR_NO_IMAGE = new Set(['Noch unbekannt']);

/* Namen ohne eigene Übersicht: „Noch unbekannt“ ist ein Platzhalter für
   eine Besetzung, die noch nicht feststeht, und keine Figur. */
const CHAR_NO_PROFILE = new Set(['Noch unbekannt']);

function charSlug(name) {
  return (CHAR_ALIAS[name] || name).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/* ---------- Fassungen einer Figur ----------

   Wer umbesetzt wird oder sich sichtbar verwandelt, soll in jedem Film
   so aussehen wie in genau diesem Film: Bruce Banner ist im ersten
   Auftritt Edward Norton, Rhodey im ersten Iron Man Terrence Howard,
   Ross im letzten Auftritt der Red Hulk. Das Porträt hängt deshalb
   nicht nur an der Figur, sondern auch am Auftritt.

   CHAR_LOOKS führt pro Charakter-Slug die Filme auf, in denen ein
   anderes Bild gilt. Alles, was hier nicht steht, nimmt das Standardbild
   <slug>.webp, deshalb gehört dorthin die Fassung mit den meisten
   Auftritten. Der Zusatz im Dateinamen benennt die Fassung: bei
   Umbesetzungen der Nachname des Darstellers, bei Verwandlungen der
   Look.

   Die Figur bleibt dabei eine einzige. Übersicht, Auftritte, Besetzung
   und Biografie hängen weiter am Charakter-Slug, nur das Bild wechselt. */
const CHAR_LOOKS = {
  'bruce-banner': {
    'the-incredible-hulk': 'bruce-banner-norton',
    'avengers-endgame': 'bruce-banner-smart-hulk',
    'she-hulk': 'bruce-banner-smart-hulk',
    'spider-man-brand-new-day': 'bruce-banner-smart-hulk',
  },
  'james-rhodes': {
    'iron-man': 'james-rhodes-howard',
  },
  'thaddeus-ross': {
    'captain-america-brave-new-world': 'thaddeus-ross-red-hulk',
  },
};

/* Das Bild zu einem Auftritt: die Fassung aus diesem Film, sonst das
   Standardporträt der Figur. */
function charLook(slug, movie) {
  const looks = CHAR_LOOKS[slug];
  return (movie && looks && looks[movie.slug]) || slug;
}

/* ---------- Ganzkörper-Fassungen ----------

   Wie CHAR_LOOKS, nur für die Ganzkörperbilder in der Biografie der
   Vollansicht: Wer im Lauf des Universums Rüstungen wechselt oder sich
   verwandelt, bekommt unter dem Rahmen Schalter für seine Fassungen.

   Pro Figur eine Liste [Beschriftung, Dateiname], die Datei liegt unter
   assets/characters/fullsize/<Dateiname>.webp. Der erste Eintrag ist
   die Standardansicht und heißt wie der Charakter-Slug. Figuren ohne
   Eintrag zeigen einfach ihr einzelnes Bild. */
const FULLSIZE_LOOKS = {
  'tony-stark': [
    ['Mark 50', 'tony-stark'],
    ['Mark VI', 'tony-stark-mark-6'],
  ],
  'thor': [
    ['Avengers', 'thor'],
    ['Endgame', 'thor-endgame'],
    ['Love and Thunder', 'thor-love-and-thunder'],
  ],
  'bruce-banner': [
    ['Hulk', 'bruce-banner'],
    ['Smart Hulk', 'bruce-banner-smart-hulk'],
  ],
  'steve-rogers': [
    ['Endgame', 'steve-rogers'],
    ['First Avenger', 'steve-rogers-first-avenger'],
  ],
  'peter-parker': [
    ['Far From Home', 'peter-parker'],
    ['Iron Spider', 'peter-parker-iron-spider'],
    ['Homecoming', 'peter-parker-homecoming'],
  ],
  'wanda-maximoff': [
    ['WandaVision', 'wanda-maximoff'],
    ['Multiverse of Madness', 'wanda-maximoff-multiverse-of-madness'],
  ],
  'nick-fury': [
    ['Klassisch', 'nick-fury'],
    ['Secret Invasion', 'nick-fury-secret-invasion'],
  ],
  'loki': [
    ['Asgard', 'loki'],
    ['TVA', 'loki-tva'],
  ],
  'sam-wilson': [
    ['Captain America', 'sam-wilson'],
    ['Falcon', 'sam-wilson-falcon'],
  ],
  'gamora': [
    ['Guardians', 'gamora'],
    ['Vol. 3', 'gamora-vol-3'],
  ],
  'groot': [
    ['Groot', 'groot'],
    ['Baby Groot', 'groot-baby'],
  ],
  'carol-danvers': [
    ['Captain Marvel', 'carol-danvers'],
    ['Starforce', 'carol-danvers-starforce'],
  ],
  'shuri': [
    ['Shuri', 'shuri'],
    ['Black Panther', 'shuri-black-panther'],
  ],
  'thaddeus-ross': [
    ['General Ross', 'thaddeus-ross'],
    ['Red Hulk', 'thaddeus-ross-red-hulk'],
  ],
  'riri-williams': [
    ['Riri', 'riri-williams'],
    ['Ironheart', 'riri-williams-ironheart'],
  ],
};

/* In data.js heißt jede Figur "Realname / Heldenname". Überschriften
   zeigen den Realnamen, die Rollenzeile darunter die Heldennamen. Der
   Zusatz „(angekündigt)“ gehört zum Film, nicht zur Figur, und fällt
   hier weg. */
const CHAR_ANNOUNCED = / \(angekündigt\)$/;

function splitName(name) {
  const clean = name.replace(CHAR_ANNOUNCED, '');
  const cut = clean.indexOf(' / ');
  return cut === -1
    ? { real: clean, role: '' }
    : { real: clean.slice(0, cut), role: clean.slice(cut + 3) };
}

/* ---------- Index aller Figuren ----------

   Aus einer Liste von Auftritten (je ein Objekt mit movie und phase, in
   Handlungsreihenfolge) wird eine Map slug -> { slug, names, entries }.
   Zusammengefasst wird über charSlug(), damit ein Mensch mit wechselndem
   Heldennamen (Sam Wilson: erst Falcon, dann Captain America) eine
   einzige Übersicht bekommt statt zweier halber.

   Die Timeline reicht hier ihre eigenen Eintragsobjekte herein, die
   neben movie und phase auch die Position auf der Zeitskala kennen. Die
   Charakterseite baut sich eine schlichte Liste aus PHASES. Beide
   bekommen dieselben Figuren in derselben Reihenfolge. */
function buildCharIndex(records) {
  const index = new Map();
  for (const record of records) {
    for (const name of record.movie.characters || []) {
      if (CHAR_NO_PROFILE.has(name)) continue;
      const slug = charSlug(name);
      let char = index.get(slug);
      if (!char) index.set(slug, char = { slug, names: [], entries: [] });
      if (!char.names.includes(name)) char.names.push(name);
      /* Steht dieselbe Figur zweimal in einem Film (etwa Gamora und die
         Gamora von 2014), bleibt es trotzdem ein Auftritt. */
      if (char.entries[char.entries.length - 1] !== record) char.entries.push(record);
    }
  }
  return index;
}

/* Alle Auftritte aller Phasen als flache Liste, in Handlungsreihenfolge.
   Das ist die Vorlage für buildCharIndex() auf Seiten ohne Zeitskala. */
function buildChronology() {
  const records = [];
  for (const phase of PHASES) {
    for (const movie of phase.movies) records.push({ movie, phase });
  }
  return records;
}
