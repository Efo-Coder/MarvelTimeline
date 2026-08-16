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

   Varianten aus anderen Universen oder anderen Zeiten sind eigene
   Figuren mit eigenem Bild, eigener Biografie und eigenen Auftritten:
   Die Maria Rambeau der Erde-838 ist nicht dieselbe Frau wie die
   Pilotin aus Captain Marvel, sie hat nur dasselbe Gesicht. Ihr Name
   trägt den Zusatz der Herkunft, ihr Dateiname die Kurzform davon.

   CHAR_NO_IMAGE sind Platzhalter ohne einzelnes Porträt, sie
   sparen sich den 404-Umweg über den error-Handler. */
const CHAR_ALIAS = {
  'Alexei / Red Guardian': 'Alexei',
  'Arishem der Richter': 'Arishem',
  'Eson der Sucher': 'Eson',
  'Gorr der Götterschlächter': 'Gorr',
  'Herman Schultz / Shocker': 'Shocker',
  'Jemiah der Analytiker': 'Jemiah',
  'Jener der bleibt': 'Der da bleibt',
  'Michelle Jones-Watson / MJ': 'Michelle Jones-Watson',
  'Nezarr der Rechner': 'Nezarr',
  'Piotr Rasputin / Colossus': 'Colossus',
  'Algrim / Kurse': 'Kurse',
  'Anton Miguel Rodriguez / Tarantula': 'Tarantula',
  'Antonia Dreykov / Taskmaster': 'Taskmaster',
  'Ava Starr / Ghost': 'Ava Starr',
  'Cain Marko / Juggernaut': 'Juggernaut',
  'Raza Hamidmi Al-Wazar': 'Raza',
  'Sharon Davis / Mrs. Hart': 'Mrs. Hart',
  'Benjamin Poindexter / Bullseye': 'Bullseye',
  'Mac Gargan / Scorpion': 'Scorpion',
  'Baby Groot': 'Groot',
  'Brock Rumlow / Crossbones': 'Crossbones',
  'Brunnhilde / Valkyrie': 'Valkyrie',
  'Bill Foster / Goliath': 'Bill Foster',
  'Bruce Banner / Hulk': 'Bruce Banner',
  'Eric Brooks / Blade': 'Blade',
  'Bucky Barnes / Winter Soldier': 'Bucky Barnes',
  'Carol Danvers / Captain Marvel': 'Carol Danvers',
  'Clint Barton / Hawkeye': 'Clint Barton',
  'Curt Connors / Lizard': 'Curt Connors',
  'Dane Whitman / Black Knight': 'Dane Whitman',
  'Darren Cross / Yellowjacket': 'Darren Cross',
  'Darren Cross / MODOK': 'Darren Cross',
  'Ezekiel Stane / Joe McGillicuddy': 'Ezekiel Stane',
  'Flint Marko / Sandman': 'Sandman',
  'General Thaddeus „Thunderbolt“ Ross': 'Thaddeus Ross',
  'General Thaddeus „Thunderbolt“ Ross / Red Hulk': 'Thaddeus Ross',
  'Hector Ayala / White Tiger': 'White Tiger',
  'Hope van Dyne / Wasp': 'Hope van Dyne',
  'James Rhodes / War Machine': 'James Rhodes',
  'Jane Foster / Mighty Thor': 'Jane Foster',
  'Joaquin Torres': 'Joaquin Torres / Falcon',
  'John Walker / U.S. Agent': 'John Walker',
  'Li Ching-Lin / Death Dealer': 'Death Dealer',
  'Max Dillon / Electro': 'Electro',
  'Natasha Romanoff / Black Widow': 'Natasha Romanoff',
  'Norman Osborn / Green Goblin': 'Green Goblin',
  'Obadiah Stane / Iron Monger': 'Obadiah Stane',
  'Otto Octavius / Doctor Octopus': 'Doc Ock',
  'Jack Duquesne / Swordsman': 'Jack Duquesne',
  'Peter Parker / Spider-Man': 'Peter Parker',
  'Peter Quill / Star-Lord': 'Peter Quill',
  'Pietro Maximoff / Quicksilver': 'Pietro Maximoff',
  'Riri Williams / Ironheart': 'Riri Williams',
  'Ronan der Ankläger': 'Ronan',
  'Sam Wilson / Captain America': 'Sam Wilson',
  'Sam Wilson / Falcon': 'Sam Wilson',
  'Scott Lang / Ant-Man': 'Scott Lang',
  'Shalla-Bal / Silver Surfer': 'Silver Surfer',
  'Shuri / Black Panther': 'Shuri',
  'Simon Williams / Wonder Man': 'Simon Williams',
  'Stephen Strange / Doctor Strange': 'Stephen Strange',
  'Steve Rogers / Captain America': 'Steve Rogers',
  'Taneleer Tivan / The Collector': 'The Collector',
  "T'Challa / Black Panther": "T'Challa",
  'Tiamut der Kommunikator': 'Tiamut',
  'Tony Stark / Iron Man': 'Tony Stark',
  'Trevor Slattery / Mandarin': 'Trevor Slattery',
  'Wanda Maximoff / Scarlet Witch': 'Wanda Maximoff',
  'William Metzger / Bill': 'William Metzger',

  /* Varianten: eigene Figuren, deren Bilder unter der Kurzform der
     Herkunft liegen. Ohne diese Brücke hieße die Datei
     "maria-rambeau-captain-marvel-erde-838". */
  'Maria Rambeau / Captain Marvel (Erde-838)': 'Maria Rambeau 838',
  'Maria Rambeau / Binary (andere Welt)': 'Maria Rambeau Binary',
  'Peggy Carter / Captain Carter (Erde-838)': 'Peggy Carter 838',
  'Reed Richards / Mister Fantastic (Erde-838)': 'Reed Richards 838',
  'Karl Mordo / Baron Mordo (Erde-838)': 'Karl Mordo 838',
  'Wanda Maximoff / Scarlet Witch (Erde-838)': 'Wanda Maximoff 838',
  'Christine Palmer (Erde-838)': 'Christine Palmer 838',
  'Stephen Strange / Defender Strange (Erde-617)': 'Defender Strange',
  'Peter Parker / Spider-Man (Maguire)': 'Peter Parker Maguire',
  'Peter Parker / Spider-Man (Garfield)': 'Peter Parker Garfield',
  'Stephen Strange / Sinister Strange (andere Welt)': 'Sinister Strange',
  'Wade Wilson / Nicepool (andere Welt)': 'Nicepool',
  'Gamora (2014)': 'Gamora 2014',
  'Thanos (2014)': 'Thanos 2014',
  'Nebula (2014)': 'Nebula 2014',
  'Ebony Maw (2014)': 'Ebony Maw 2014',
  'Corvus Glaive (2014)': 'Corvus Glaive 2014',
  'Proxima Midnight (2014)': 'Proxima Midnight 2014',
  'Cull Obsidian (2014)': 'Cull Obsidian 2014',
};

const CHAR_NO_IMAGE = new Set(['Noch unbekannt']);

/* Namen ohne eigene Übersicht: „Noch unbekannt“ ist ein Platzhalter für
   eine Besetzung, die noch nicht feststeht, und keine Figur. */
const CHAR_NO_PROFILE = new Set(['Noch unbekannt']);

/* K.I.-Systeme und Roboter ohne Körper vor der Kamera: Wer sie darstellt,
   hat ihnen nur die Stimme geliehen, deshalb heißt die Zeile im Kopf der
   Karte hier „gesprochen von“ statt „gespielt von“.

   Nicht gemeint sind künstliche Wesen, die jemand tatsächlich spielt:
   Vision und White Vision stehen als Paul Bettany im Bild, Ultron bewegt
   sich nach James Spaders Aufnahmen, die Supreme Intelligence nimmt die
   Gestalt ihrer Darstellerin an und N.A.T.A.L.I.E. das Gesicht von Lyric
   Ross. Sie bleiben deshalb bei „gespielt von“. */
const CHAR_VOICE_ONLY = new Set(['e-v', 'e-d-i-t-h', 'miss-minutes', 'h-e-r-b-i-e']);

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
  },
  'darren-cross': {
    'ant-man-and-the-wasp-quantumania': 'darren-cross-modok',
  },
  'jack-duquesne': {
    'daredevil-born-again': 'jack-duquesne-born-again',
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

   Pro Figur eine Liste [Beschriftung, Dateiname, Film-Slug], die Datei
   liegt unter assets/characters/fullsize/<Dateiname>.webp. Der erste
   Eintrag ist die Standardansicht und heißt wie der Charakter-Slug.
   Figuren ohne Eintrag zeigen einfach ihr einzelnes Bild.

   Der Film-Slug ist derselbe wie in data.js und holt das Logo aus
   assets/logos/<Film-Slug>.webp. Er benennt den Film, aus dem die
   gezeigte Fassung stammt, nicht jeden Film, in dem sie vorkommt: Steve
   Rogers trägt seinen Winter-Soldier-Anzug auch noch in Age of Ultron,
   das Logo bleibt trotzdem das des Films, der ihn eingeführt hat.
   Fehlt der dritte Wert, bleibt der Logoplatz leer und nur die
   Beschriftung steht da. */
const FULLSIZE_LOOKS = {
  'tony-stark': [
    ['Mark I (1)', 'tony-stark-mark-i-1', 'iron-man'],
    ['Mark II (2)', 'tony-stark-mark-ii-2', 'iron-man'],
    ['Mark III (3)', 'tony-stark-mark-iii-3', 'iron-man'],
    ['Mark V (5)', 'tony-stark-mark-v-5', 'iron-man-2'],
    ['Mark VI (6)', 'tony-stark-mark-vi-6', 'iron-man-2'],
    ['Mark VII (7)', 'tony-stark-mark-vii-7', 'the-avengers'],
    ['Mark XIV (14)', 'tony-stark-mark-xiv-14', 'iron-man-3'],
    ['Mark XXIV - Tank (24)', 'tony-stark-mark-xxiv-tank-24', 'iron-man-3'],
    ['Mark XXV - Striker (25)', 'tony-stark-mark-xxv-striker-25', 'iron-man-3'],
    ['Mark 26', 'tony-stark-mark-26', 'iron-man-3'],
    ['Mark XXXVIII - Igor (38)', 'tony-stark-mark-xxxviii-igor-38', 'iron-man-3'],
    ['Mark XLV (45)', 'tony-stark-mark-xlv-45', 'avengers-age-of-ultron'],
    ['Mark XLVIII - Hulkbuster 2.0 (48)', 'tony-stark-mark-xlviii-hulkbuster-2-0-48', 'avengers-infinity-war'],
    ['Mark L (50)', 'tony-stark-mark-l-50', 'avengers-infinity-war'],
    ['Mark LXXXV (85)', 'tony-stark-mark-lxxxv-85', 'avengers-endgame'],
    ['Zivil', 'tony-stark-civil', 'iron-man-2'],
  ],
  'marc-spector-steven-grant-moon-knight': [
    ['Zeremonie', 'marc-spector-steven-grant-moon-knight', 'moon-knight'],
    ['Moon Knight', 'marc-spector-steven-grant-moon-knight-classic', 'moon-knight'],
    ['Mr. Knight', 'marc-spector-steven-grant-moon-knight-mr-knight', 'moon-knight'],
  ],
  'thor': [
    ['Avengers', 'thor', 'the-avengers'],
    ['Ragnarok', 'thor-ragnarok', 'thor-ragnarok'],
    ['Infinity War', 'thor-infinity-war', 'avengers-infinity-war'],
    ['Endgame', 'thor-endgame', 'avengers-endgame'],
    ['Love and Thunder', 'thor-love-and-thunder', 'thor-love-and-thunder'],
  ],
  'bruce-banner': [
    ['Hulk', 'bruce-banner', 'the-avengers'],
    ['Smart Hulk', 'bruce-banner-smart-hulk', 'avengers-endgame'],
    ['Bruce Banner', 'bruce-banner-ruffalo', 'the-avengers'],
    ['The Incredible Hulk', 'bruce-banner-norton', 'the-incredible-hulk'],
  ],
  'steve-rogers': [
    ['Endgame', 'steve-rogers', 'avengers-endgame'],
    ['First Avenger', 'steve-rogers-first-avenger', 'captain-america-the-first-avenger'],
    ['Winter Soldier', 'steve-rogers-winter-soldier', 'captain-america-the-winter-soldier'],
  ],
  'bucky-barnes': [
    ['Zivil', 'bucky-barnes-zivil', 'the-falcon-and-the-winter-soldier'],
    ['Winter Soldier', 'bucky-barnes-winter-soldier', 'captain-america-the-winter-soldier'],
    ['Winter Soldier Unmasked', 'bucky-barnes-winter-soldier-unmasked', 'captain-america-the-winter-soldier'],
    ['Thunderbolts', 'bucky-barnes-thunderbolts', 'thunderbolts'],
  ],
  'taskmaster': [
    ['Maskiert', 'taskmaster', 'black-widow'],
    ['Unmaskiert', 'taskmaster-unmasked', 'black-widow'],
    ['Thunderbolts', 'taskmaster-thunderbolts', 'thunderbolts'],
  ],
  'natasha-romanoff': [
    ['Black Widow', 'natasha-romanoff', 'black-widow'],
    ['Weißer Anzug', 'natasha-romanoff-white', 'black-widow'],
    ['Age of Ultron', 'natasha-romanoff-age-of-ultron', 'avengers-age-of-ultron'],
    ['Ultron (Action)', 'natasha-romanoff-age-of-ultron-action', 'avengers-age-of-ultron'],
    ['Suit 1', 'natasha-romanoff-suit-1', 'avengers-age-of-ultron'],
  ],
  'peter-parker': [
    ['Far From Home', 'peter-parker', 'spider-man-far-from-home'],
    ['Homecoming', 'peter-parker-homecoming', 'spider-man-homecoming'],
    ['Stark Suit', 'peter-parker-stark-suit', 'captain-america-civil-war'],
    ['Iron Spider', 'peter-parker-iron-spider', 'avengers-infinity-war'],
    ['No Way Home', 'peter-parker-no-way-home', 'spider-man-no-way-home'],
    ['Black Suit', 'peter-parker-black-suit', 'spider-man-no-way-home'],
    ['Night Monkey', 'peter-parker-night-monkey', 'spider-man-far-from-home'],
  ],
  'wanda-maximoff': [
    ['Civil War', 'wanda-maximoff', 'captain-america-civil-war'],
    ['WandaVision', 'wanda-maximoff-wandavision', 'wandavision'],
    ['Multiverse of Madness', 'wanda-maximoff-multiverse-of-madness', 'doctor-strange-in-the-multiverse-of-madness'],
  ],
  'nick-fury': [
    ['Klassisch', 'nick-fury', 'the-avengers'],
    ['Secret Invasion', 'nick-fury-secret-invasion', 'secret-invasion'],
  ],
  'loki': [
    ['Asgard', 'loki', 'thor'],
    ['The Avengers', 'loki-avengers', 'the-avengers'],
    ['The Dark World', 'loki-dark-world', 'thor-the-dark-world'],
    ['Ragnarok', 'loki-ragnarok', 'thor-ragnarok'],
    ['TVA', 'loki-tva', 'loki'],
    ['God of Stories', 'loki-god-of-stories', 'loki'],
  ],
  'sam-wilson': [
    ['Stealth Suit', 'sam-wilson-stealth-suit', 'the-falcon-and-the-winter-soldier'],
    ['Stealth Suit (Maskiert)', 'sam-wilson-stealth-suit-maskiert', 'the-falcon-and-the-winter-soldier'],
    ['Vibranium Captain America Suit', 'sam-wilson-vibranium-captain-america-suit', 'captain-america-brave-new-world'],
    ['Vibranium Captain America Suit (Masked)', 'sam-wilson-vibranium-captain-america-suit-masked', 'captain-america-brave-new-world'],
    ['EXO-7 Falcon (Upgraded Service Suit)', 'sam-wilson-exo-7-falcon-upgraded-service-suit', 'avengers-infinity-war'],
    ['EXO-7 Falcon (Avengers Suit)', 'sam-wilson-exo-7-falcon-avengers-suit', 'avengers-age-of-ultron'],
    ['EXO-7 Falcon (Air Force Prototype)', 'sam-wilson-exo-7-falcon-air-force-prototype', 'captain-america-the-winter-soldier'],
  ],
  'gamora': [
    ['Guardians', 'gamora', 'guardians-of-the-galaxy'],
    ['Kind', 'gamora-kid', 'avengers-infinity-war'],
  ],
  'groot': [
    ['Adult Groot', 'groot-adult-groot', 'guardians-of-the-galaxy'],
    ['Baby Groot', 'groot-baby', 'guardians-of-the-galaxy-vol-2'],
    ['Adolescent Groot', 'groot-adolescent-groot', 'avengers-infinity-war'],
    ['Swole Groot', 'groot-swole-groot', 'guardians-of-the-galaxy-vol-3'],
    ['Alpha Groot', 'groot-alpha-groot', 'guardians-of-the-galaxy-vol-3'],
  ],
  'carol-danvers': [
    ['Captain Marvel', 'carol-danvers', 'captain-marvel'],
    ['The Marvels', 'carol-danvers-the-marvels', 'the-marvels'],
    ['Starforce', 'carol-danvers-starforce', 'captain-marvel'],
    ['Aladna', 'carol-danvers-aladna', 'the-marvels'],
  ],
  'shuri': [
    ['Shuri', 'shuri', 'black-panther'],
    ['Panther-Rüstung', 'shuri-panther-armor', 'black-panther'],
    ['Black Panther', 'shuri-black-panther', 'black-panther-wakanda-forever'],
    ['Maskiert', 'shuri-black-panther-masked', 'black-panther-wakanda-forever'],
    ['Unmaskiert', 'shuri-black-panther-unmasked', 'black-panther-wakanda-forever'],
  ],
  'thaddeus-ross': [
    ['General Ross', 'thaddeus-ross', 'the-incredible-hulk'],
    ['President', 'thaddeus-ross-president', 'captain-america-brave-new-world'],
    ['Red Hulk', 'thaddeus-ross-red-hulk', 'captain-america-brave-new-world'],
  ],
  'riri-williams': [
    ['Riri', 'riri-williams', 'ironheart'],
    ['Mark I', 'riri-williams-mark-1', 'black-panther-wakanda-forever'],
    ['Mark II', 'riri-williams-mark-2', 'black-panther-wakanda-forever'],
    ['Mark III', 'riri-williams-mark-3', 'ironheart'],
    ['Mark IV', 'riri-williams-mark-4', 'ironheart'],
    ['Mark V', 'riri-williams-mark-5', 'ironheart'],
    ['What If', 'riri-williams-what-if', 'what-if'],
  ],
  'matt-murdock-daredevil': [
    ['Daredevil', 'matt-murdock-daredevil', 'daredevil-born-again'],
    ['Matt Murdock', 'matt-murdock-daredevil-civil', 'daredevil-born-again'],
    ['Staffel 1', 'matt-murdock-daredevil-season-1', 'daredevil-born-again'],
    ['Born Again', 'matt-murdock-daredevil-born-again', 'daredevil-born-again'],
  ],
  'bob-sentry': [
    ['Sentry', 'bob-sentry', 'thunderbolts'],
    ['Void', 'bob-sentry-void', 'thunderbolts'],
  ],
  'gravik': [
    ['Mensch', 'gravik', 'secret-invasion'],
    ['Super-Skrull', 'gravik-super-skrull', 'secret-invasion'],
  ],
  'clint-barton': [
    ['Age of Ultron', 'clint-barton', 'avengers-age-of-ultron'],
    ['Civil War', 'clint-barton-civil-war', 'captain-america-civil-war'],
    ['Ronin (Unmaskiert)', 'clint-barton-ronin-unmaskiert', 'avengers-endgame'],
    ['Ronin', 'clint-barton-ronin', 'avengers-endgame'],
    ['Thor', 'clint-barton-thor', 'thor'],
  ],
  'john-walker': [
    ['Maskiert', 'john-walker', 'the-falcon-and-the-winter-soldier'],
    ['Unmaskiert', 'john-walker-unmasked', 'the-falcon-and-the-winter-soldier'],
  ],
  'hope-van-dyne': [
    ['Wasp', 'hope-van-dyne', 'ant-man-and-the-wasp'],
    ['Zivil', 'hope-van-dyne-civil', 'ant-man'],
    ['Unmaskiert', 'hope-van-dyne-unmasked', 'ant-man-and-the-wasp'],
    ['Im Flug', 'hope-van-dyne-flight', 'ant-man-and-the-wasp'],
    ['Quantumania', 'hope-van-dyne-quantumania', 'ant-man-and-the-wasp-quantumania'],
  ],
  'james-rhodes': [
    ['Zivil', 'james-rhodes', 'iron-man-2'],
    ['Colonel', 'james-rhodes-colonel', 'iron-man-2'],
    ['Mark I', 'james-rhodes-mark-1', 'iron-man-2'],
    ['Mark II', 'james-rhodes-mark-2', 'iron-man-3'],
    ['Mark II - Iron Patriot', 'james-rhodes-mark-ii-iron-patriot', 'iron-man-3'],
    ['Mark III', 'james-rhodes-mark-3', 'avengers-age-of-ultron'],
    ['Mark IV', 'james-rhodes-mark-iv', 'captain-america-civil-war'],
    ['Mark V', 'james-rhodes-mark-v', 'avengers-infinity-war'],
    ['Mark VI', 'james-rhodes-mark-6', 'avengers-endgame'],
    ['Quantum Suit', 'james-rhodes-quantum-suit', 'avengers-endgame'],
    ['Mark VII - Iron Patriot MK II', 'james-rhodes-mark-vii-iron-patriot-mk-ii', 'secret-invasion'],
  ],
  'samuel-sterns-the-leader': [
    ['Mensch', 'samuel-sterns-the-leader', 'the-incredible-hulk'],
    ['Leader', 'samuel-sterns-the-leader-green', 'captain-america-brave-new-world'],
  ],
  'scott-lang': [
    ['Unmaskiert', 'scott-lang', 'ant-man'],
    ['Visier offen', 'scott-lang-visor', 'ant-man'],
    ['Maskiert', 'scott-lang-masked', 'ant-man'],
  ],
  'thanos': [
    ['Infinity War', 'thanos', 'avengers-infinity-war'],
    ['Rüstung', 'thanos-armor', 'avengers-endgame'],
    ['Endgame', 'thanos-endgame', 'avengers-endgame'],
  ],
  'trevor-slattery': [
    ['Mandarin', 'trevor-slattery', 'iron-man-3'],
    ['Shang-Chi', 'trevor-slattery-shang-chi', 'shang-chi'],
  ],
  'jack-duquesne': [
    ['Hawkeye', 'jack-duquesne', 'hawkeye'],
    ['Born Again', 'jack-duquesne-born-again', 'daredevil-born-again'],
  ],
  'wilson-fisk-kingpin': [
    ['Born Again', 'wilson-fisk-kingpin', 'daredevil-born-again'],
    ['Weißer Anzug', 'wilson-fisk-kingpin-white', 'daredevil-born-again'],
  ],
  'yelena-belova': [
    ['Black Widow', 'yelena-belova', 'black-widow'],
    ['Thunderbolts', 'yelena-belova-thunderbolts', 'thunderbolts'],
    ['Neuer Anzug', 'yelena-belova-new', 'thunderbolts'],
  ],
  'adrian-toomes-vulture': [
    ['Unmaskiert', 'adrian-toomes-vulture', 'spider-man-homecoming'],
    ['Maskiert', 'adrian-toomes-vulture-flight', 'spider-man-homecoming'],
  ],
  'alexei': [
    ['Maskiert', 'alexei', 'black-widow'],
    ['Unmaskiert', 'alexei-unmaskiert', 'black-widow'],
  ],
  'ava-starr': [
    ['Schwarzer Ghost-Anzug (Unmaskiert)', 'ava-starr-schwarzer-ghost-anzug-unmaskiert', 'ant-man-and-the-wasp'],
    ['Schwarzer Ghost-Anzug', 'ava-starr-schwarzer-ghost-anzug', 'ant-man-and-the-wasp'],
    ['Weißer Ghost-Anzug', 'ava-starr-weisser-ghost-anzug', 'thunderbolts'],
  ],
  'charles-xavier-professor-x': [
    ['Multiverse of Madness', 'charles-xavier-professor-x', 'doctor-strange-in-the-multiverse-of-madness'],
    ['Jung', 'charles-xavier-professor-x-young', 'doctor-strange-in-the-multiverse-of-madness'],
    ['Stehend', 'charles-xavier-professor-x-standing', 'doctor-strange-in-the-multiverse-of-madness'],
  ],
  'crossbones': [
    ['Brock Rumlow', 'crossbones', 'captain-america-the-winter-soldier'],
    ['Crossbones', 'crossbones-civil-war', 'captain-america-civil-war'],
  ],
  'darren-cross': [
    ['Darren Cross', 'darren-cross', 'ant-man'],
    ['Yellowjacket', 'darren-cross-suit', 'ant-man'],
    ['MODOK', 'darren-cross-modok', 'ant-man-and-the-wasp-quantumania'],
    ['MODOK maskiert', 'darren-cross-modok-masked', 'ant-man-and-the-wasp-quantumania'],
  ],
  'doc-ock': [
    ['Doc Ock', 'doc-ock', 'spider-man-no-way-home'],
    ['Otto Octavius', 'doc-ock-civil', 'spider-man-no-way-home'],
  ],
  'electro': [
    ['Electro', 'electro', 'spider-man-no-way-home'],
    ['Max Dillon', 'electro-max-dillon', 'spider-man-no-way-home'],
    ['Im Kampf', 'electro-fight', 'spider-man-no-way-home'],
    ['No Way Home', 'electro-no-way-home', 'spider-man-no-way-home'],
  ],
  'emil-blonsky-abomination': [
    ['Mensch', 'emil-blonsky-abomination', 'she-hulk'],
    ['The Incredible Hulk', 'emil-blonsky-abomination-2008', 'the-incredible-hulk'],
    ['Abomination', 'emil-blonsky-abomination-green', 'she-hulk'],
  ],
  'erik-killmonger': [
    ['Killmonger', 'erik-killmonger', 'black-panther'],
    ['Black Panther', 'erik-killmonger-black-panther', 'black-panther'],
  ],
  'green-goblin': [
    ['Norman Osborn', 'green-goblin', 'spider-man-no-way-home'],
    ['Rüstung', 'green-goblin-armor', 'spider-man-no-way-home'],
    ['Gleiter', 'green-goblin-glider', 'spider-man-no-way-home'],
  ],
  'happy-hogan': [
    ['Happy Hogan', 'happy-hogan', 'iron-man'],
    ['What If', 'happy-hogan-what-if', 'what-if'],
  ],
  'helmut-zemo': [
    ['Helmut Zemo', 'helmut-zemo', 'captain-america-civil-war'],
    ['Maskiert', 'helmut-zemo-masked', 'the-falcon-and-the-winter-soldier'],
    ['Baron Zemo', 'helmut-zemo-baron', 'the-falcon-and-the-winter-soldier'],
  ],
  'howard-stark': [
    ['Howard Stark', 'howard-stark', 'avengers-endgame'],
    ['Jung', 'howard-stark-young', 'captain-america-the-first-avenger'],
  ],
  'ivan-vanko-whiplash': [
    ['Whiplash', 'ivan-vanko-whiplash', 'iron-man-2'],
    ['Mark II', 'ivan-vanko-whiplash-mark-2', 'iron-man-2'],
  ],
  'jane-foster': [
    ['Jane Foster', 'jane-foster', 'thor'],
    ['The Dark World', 'jane-foster-dark-world', 'thor-the-dark-world'],
    ['Mighty Thor', 'jane-foster-mighty-thor', 'thor-love-and-thunder'],
  ],
  'johann-schmidt-red-skull': [
    ['Johann Schmidt', 'johann-schmidt-red-skull', 'captain-america-the-first-avenger'],
    ['Red Skull', 'johann-schmidt-red-skull-skull', 'captain-america-the-first-avenger'],
    ['Steinwaechter', 'johann-schmidt-red-skull-stonekeeper', 'avengers-infinity-war'],
  ],
  'logan-wolverine': [
    ['Unmaskiert', 'logan-wolverine', 'deadpool-and-wolverine'],
    ['Maskiert', 'logan-wolverine-masked', 'deadpool-and-wolverine'],
    ['Anzug', 'logan-wolverine-suit', 'deadpool-and-wolverine'],
  ],
  'm-baku': [
    ['M’Baku', 'm-baku', 'black-panther'],
    ['Fellumhang', 'm-baku-fur', 'black-panther-wakanda-forever'],
    ['Man-Ape', 'm-baku-man-ape', 'black-panther'],
  ],
  'nakia': [
    ['Nakia', 'nakia', 'black-panther'],
    ['Wakanda Forever', 'nakia-wakanda-forever', 'black-panther-wakanda-forever'],
    ['Bahadir', 'nakia-bahadir', 'black-panther'],
  ],
  /* Quake steht in keiner Besetzung der Timeline und hat deshalb auch
     keinen Film, dessen Logo hier passen würde. */
  'quake': [
    ['Daisy Johnson', 'quake'],
    ['Quake', 'quake-powers'],
  ],
  'quentin-beck-mysterio': [
    ['Mysterio', 'quentin-beck-mysterio', 'spider-man-far-from-home'],
    ['Nebelhelm', 'quentin-beck-mysterio-helm', 'spider-man-far-from-home'],
  ],
  'shang-chi': [
    ['Shang-Chi', 'shang-chi', 'shang-chi'],
    ['Zehn Ringe', 'shang-chi-ten-rings', 'shang-chi'],
  ],
  'simon-williams': [
    ['Wonder Man', 'simon-williams', 'wonder-man'],
    ['Energie', 'simon-williams-power', 'wonder-man'],
  ],
  't-challa': [
    ['Black Panther', 't-challa', 'black-panther'],
    ['Zivil', 't-challa-civil', 'black-panther'],
    ['Unmaskiert', 't-challa-unmasked', 'black-panther'],
    ['Kampfhaltung', 't-challa-fight', 'captain-america-civil-war'],
  ],
  'talos': [
    ['Mensch', 'talos', 'captain-marvel'],
    ['Skrull', 'talos-skrull', 'captain-marvel'],
  ],
  'erik-selvig': [
    ['Erik Selvig', 'erik-selvig', 'thor'],
    ['The Dark World', 'erik-selvig-dark-world', 'thor-the-dark-world'],
  ],
  'janet-van-dyne': [
    ['Janet van Dyne', 'janet-van-dyne', 'ant-man-and-the-wasp'],
    ['Wasp', 'janet-van-dyne-wasp', 'ant-man'],
  ],
  'karli-morgenthau': [
    ['Karli Morgenthau', 'karli-morgenthau', 'the-falcon-and-the-winter-soldier'],
    ['Maskiert', 'karli-morgenthau-masked', 'the-falcon-and-the-winter-soldier'],
  ],
  'rio-vidal': [
    ['Lady Death', 'rio-vidal', 'agatha-all-along'],
    ['Grüne Hexe', 'rio-vidal-green-witch', 'agatha-all-along'],
  ],
  'bill-foster': [
    ['Bill Foster', 'bill-foster', 'ant-man-and-the-wasp'],
    ['Maskiert', 'bill-foster-masked', 'ant-man-and-the-wasp'],
  ],
  'cull-obsidian': [
    ['Cull Obsidian', 'cull-obsidian', 'avengers-infinity-war'],
    ['Kettenhammer', 'cull-obsidian-hammer', 'avengers-infinity-war'],
  ],
  'kang-der-eroberer': [
    ['Maskiert', 'kang-der-eroberer', 'ant-man-and-the-wasp-quantumania'],
    ['Unmaskiert', 'kang-der-eroberer-unmasked', 'ant-man-and-the-wasp-quantumania'],
  ],
  'karl-mordo-838': [
    ['Baron Mordo', 'karl-mordo-838', 'doctor-strange-in-the-multiverse-of-madness'],
    ['Im Kampf', 'karl-mordo-838-fight', 'doctor-strange-in-the-multiverse-of-madness'],
  ],
  'defender-strange': [
    ['Defender Strange', 'defender-strange', 'doctor-strange-in-the-multiverse-of-madness'],
    ['Dead Strange', 'defender-strange-dead', 'doctor-strange-in-the-multiverse-of-madness'],
  ],
  'layla-el-faouly': [
    ['Scarlet Scarab', 'layla-el-faouly', 'moon-knight'],
    ['Kampfhaltung', 'layla-el-faouly-combat', 'moon-knight'],
  ],
  'maya-lopez-echo': [
    ['Echo', 'maya-lopez-echo', 'echo'],
    ['Leder', 'maya-lopez-echo-leather', 'hawkeye'],
  ],
  'ying-li': [
    ['Ying Li', 'ying-li', 'shang-chi'],
    ['Zeremonie', 'ying-li-ceremonial', 'shang-chi'],
  ],
  'curt-connors': [
    ['Curt Connors', 'curt-connors', 'spider-man-no-way-home'],
    ['Lizard', 'curt-connors-lizard', 'spider-man-no-way-home'],
  ],
  'heimdall': [
    ['Heimdall', 'heimdall', 'thor'],
    ['Ragnarok', 'heimdall-ragnarok', 'thor-ragnarok'],
  ],
  'melina-vostokoff': [
    ['Melina Vostokoff', 'melina-vostokoff', 'black-widow'],
    ['Widow-Anzug', 'melina-vostokoff-widow', 'black-widow'],
  ],
  'obadiah-stane': [
    ['Obadiah Stane', 'obadiah-stane', 'iron-man'],
    ['Iron Monger', 'obadiah-stane-iron-monger', 'iron-man'],
  ],
  'pepper-potts': [
    ['Zivil', 'pepper-potts-civil', 'iron-man'],
    ['Mark 49 - Rescue', 'pepper-potts-mark-49-rescue', 'avengers-endgame'],
  ],
  'peter-quill': [
    ['Peter Quill', 'peter-quill', 'guardians-of-the-galaxy'],
    ['Maskiert', 'peter-quill-masked', 'guardians-of-the-galaxy'],
  ],
  't-chaka': [
    ['Black Panther', 't-chaka', 'black-panther'],
    ['Unmaskiert', 't-chaka-unmasked', 'black-panther'],
    ['Zivil', 't-chaka-civil', 'captain-america-civil-war'],
  ],
  'wade-wilson-deadpool': [
    ['Deadpool', 'wade-wilson-deadpool', 'deadpool-and-wolverine'],
    ['Wade Wilson', 'wade-wilson-deadpool-civil', 'deadpool-and-wolverine'],
  ],
  'cassie-lang': [
    ['Cassie Lang', 'cassie-lang', 'ant-man-and-the-wasp-quantumania'],
    ['Maskiert', 'cassie-lang-masked', 'ant-man-and-the-wasp-quantumania'],
    ['Kind', 'cassie-lang-kind', 'ant-man'],
  ],
  'agatha-harkness': [
    ['WandaVision', 'agatha-harkness', 'wandavision'],
    ['Agathas Zirkel', 'agatha-harkness-coven', 'agatha-all-along'],
  ],
  'america-chavez': [
    ['Zivil', 'america-chavez-civil', 'doctor-strange-in-the-multiverse-of-madness'],
    ['Kamar-Taj', 'america-chavez', 'doctor-strange-in-the-multiverse-of-madness'],
  ],
  'bullseye': [
    ['Maskiert', 'bullseye', 'daredevil-born-again'],
    ['Unmaskiert', 'bullseye-unmasked', 'daredevil-born-again'],
  ],
  'g-iah': [
    ['Mensch', 'g-iah', 'secret-invasion'],
    ['Skrull', 'g-iah-skrull', 'secret-invasion'],
  ],
  'kurse': [
    ['Kurse', 'kurse', 'thor-the-dark-world'],
    ['Dunkelelf', 'kurse-dark-elf', 'thor-the-dark-world'],
  ],
  'mantis': [
    ['Guardians', 'mantis', 'guardians-of-the-galaxy-vol-2'],
    ['Vol. 3', 'mantis-vol-3', 'guardians-of-the-galaxy-vol-3'],
  ],
  'valkyrie': [
    ['Ragnarok', 'valkyrie', 'thor-ragnarok'],
    ['Asgard-Panzer', 'valkyrie-armor', 'thor-ragnarok'],
  ],
  'joaquin-torres-falcon': [
    ['Falcon', 'joaquin-torres-falcon', 'captain-america-brave-new-world'],
    ['Im Flug', 'joaquin-torres-falcon-flight', 'captain-america-brave-new-world'],
  ],
  'stakar-ogord': [
    ['Stakar Ogord', 'stakar-ogord', 'guardians-of-the-galaxy-vol-2'],
    ['Starhawk', 'stakar-ogord-starhawk', 'guardians-of-the-galaxy-vol-2'],
  ],
  'ulysses-klaue': [
    ['Age of Ultron', 'ulysses-klaue', 'avengers-age-of-ultron'],
    ['Black Panther', 'ulysses-klaue-black-panther', 'black-panther'],
  ],
  'arnim-zola': [
    ['Zivil', 'arnim-zola-zivil', 'captain-america-the-first-avenger'],
    ['Künstliche Intelligenz', 'arnim-zola-kuenstliche-intelligenz', 'captain-america-the-winter-soldier'],
  ],
  'sandman': [
    ['Standard', 'sandman', 'spider-man-no-way-home'],
    ['Zivil', 'sandman-zivil', 'spider-man-no-way-home'],
  ],
  'hank-pym': [
    ['Standard', 'hank-pym', 'ant-man'],
    ['Quantum Suit', 'hank-pym-quantum-suit', 'avengers-endgame'],
    ['Quantumania', 'hank-pym-quantumania', 'ant-man-and-the-wasp-quantumania'],
  ],
  'okoye': [
    ['Standard', 'okoye', 'black-panther'],
    ['Midnight Angel', 'okoye-midnight-angel', 'black-panther-wakanda-forever'],
  ],
  'skurge': [
    ['Standard', 'skurge', 'thor-ragnarok'],
    ['Mit Zer und Stör', 'skurge-mit-zer-und-stoer', 'thor-ragnarok'],
  ],
  'remy-lebeau-gambit': [
    ['Pose 1', 'remy-lebeau-gambit-pose-1', 'deadpool-and-wolverine'],
    ['Pose 2', 'remy-lebeau-gambit-pose-2', 'deadpool-and-wolverine'],
  ],
  'scorpion': [
    ['Pose 1', 'scorpion-pose-1', 'spider-man-homecoming'],
    ['Pose 2', 'scorpion-pose-2', 'spider-man-homecoming'],
    ['Zivil', 'scorpion-zivil', 'spider-man-homecoming'],
  ],
  'ned-leeds': [
    ['Standard', 'ned-leeds', 'spider-man-homecoming'],
    ['Brand New Day', 'ned-leeds-brand-new-day', 'spider-man-brand-new-day'],
  ],
};

/* ---------- Körpergrößen im Ganzkörperrahmen ----------

   Die Bilder sind randlos zugeschnitten, jede Figur füllt ihre Datei
   also komplett aus. Damit geht die Körpergröße verloren: Im festen
   Rahmen stünde Rocket sonst so hoch wie Thor. FULLSIZE_SCALE trägt sie
   nach, als Anteil der Rahmenhöhe. 1.0 ist ein erwachsener Mensch von
   etwa 1,80 m und gilt für alles, was hier nicht steht.

   Der Schlüssel ist der Dateiname, nicht der Charakter-Slug: Baby Groot
   und Groot teilen sich eine Figur, aber nicht ihre Größe.

   Die Skala ist gestaucht, nicht maßstäblich. 1.22 ist der höchste
   Wert, weil der Rahmen bei 1.22 voll ist (siehe .char-figure-frame img
   in css/style.css). Ein Riese wirkt so gut ein Drittel größer als ein
   Mensch, statt ihn wie in Wirklichkeit zu überragen, und Goose bleibt
   im Rahmen erkennbar. */
const FULLSIZE_SCALE = {
  // Deutlich kleiner als ein Mensch
  'goose': 0.36,
  'howard-the-duck': 0.5,
  'miss-minutes': 0.36,
  'dogpool': 0.38,
  'groot-baby': 0.4,
  'throg': 0.3,
  'lylla': 0.42,
  'floor': 0.45,
  'morris': 0.5,
  'cosmo': 0.55,
  'lucky': 0.55,
  'h-e-r-b-i-e': 0.6,
  'teefs': 0.62,
  'rocket': 0.64,
  'gamora-kid': 0.72,
  'darren-cross-modok': 0.73,
  'darren-cross-modok-masked': 0.73,
  'sprite': 0.82,
  'phyla-vell': 0.85,
  'america-chavez': 0.9,
  'america-chavez-civil': 0.9,
  'veb': 0.92,

  // Deutlich größer als ein Mensch
  'drax': 1.05,
  'm-baku': 1.05,
  'groot-adolescent-groot': 1.06,
  'm-baku-man-ape': 1.08,
  'm-baku-fur': 1.05,
  'corvus-glaive': 1.06,
  'proxima-midnight': 1.05,
  'ebony-maw': 1.06,
  'volstagg': 1.06,
  'tony-stark-mark-i-1': 1.08,
  'riri-williams-mark-1': 1.05,
  'hank-mccoy-beast': 1.08,
  'ivan-vanko-whiplash-mark-2': 1.1,
  'jennifer-walters-she-hulk': 1.1,
  'ben-grimm-the-thing': 1.12,
  'tony-stark-mark-xxxviii-igor-38': 1.15,
  'groot-alpha-groot': 1.15,
  'colossus': 1.16,
  'juggernaut': 1.12,
  'hercules': 1.06,
  'piledriver': 1.05,
  'eros-starfox': 1.02,
  'ronan': 1.12,
  'ultron': 1.15,
  'bill-foster-masked': 1.12,
  'rintrah': 1.14,
  'kro': 1.15,
  'kurse': 1.18,
  'eitri': 1.15,
  'laufey': 1.15,
  'groot-adult-groot': 1.18,
  'groot-swole-groot': 1.18,
  'cull-obsidian': 1.2,
  'cull-obsidian-hammer': 1.2,
  'destroyer': 1.16,
  'curt-connors-lizard': 1.16,
  'korg': 1.18,
  'obadiah-stane-iron-monger': 1.2,
  'sandman': 1.2,
  'thanos': 1.2,
  'thanos-armor': 1.2,
  'thanos-endgame': 1.2,
  'bruce-banner-smart-hulk': 1.2,
  'thaddeus-ross-red-hulk': 1.2,
  'happy-hogan-what-if': 1.2,
  'bruce-banner': 1.22,
  'emil-blonsky-abomination-green': 1.22,
  'emil-blonsky-abomination-2008': 1.22,
  'tony-stark-mark-xlviii-hulkbuster-2-0-48': 1.22,

  // Jenseits jeder Skala, deshalb am oberen Anschlag
  'dormammu': 1.22,
  'khonshu': 1.22,
  'galactus': 1.22,
  'surtur': 1.22,
  'arishem': 1.22,
  'tiamut': 1.22,
  'nezarr': 1.22,
  'eson': 1.22,
  'jemiah': 1.22,
  'alioth': 1.22,
};

/* ---------- Feinkorrektur je Bild ----------

   Die Körpergröße oben beschreibt die Figur, nicht ihre Datei. Die
   meisten Vorlagen zeigen eine Figur ruhig stehend, manche aber nicht:
   Ein Sprung, ein wehender Umhang oder ein Sockel macht die Datei höher
   als die Figur selbst, und weil der Rahmen die Datei misst, steht die
   Figur darin zu klein. Umgekehrt wirkt eine breite Flugpose zu groß.
   FULLSIZE_FIT gleicht genau das aus, als Faktor auf die Körpergröße.
   Ohne Eintrag gilt 1.0, dann ist am Bild nichts zu korrigieren.

   Zwei getrennte Zahlen statt einer, weil sie zwei verschiedene Dinge
   sagen. Stünde für Rocket am Ende 0.71 in einer einzigen Liste, wüsste
   später niemand mehr, ob er gewachsen ist oder ob nur sein Bild zu viel
   Luft hatte. Der Schlüssel ist wie oben der Dateiname, gepflegt wird
   die Liste im Bildstudio.

   Auf der Seite zählt das Produkt aus beidem, und mehr als 1.22 kann es
   nicht werden: Da ist der Rahmen voll. */
const FULLSIZE_FIT = {
  'cassie-lang-kind': 0.77,
  'jean-grey': 0.96,
  'loki-god-of-stories': 1.18,
  'love': 0.78,
  'parker-robbins-the-hood': 0.96,
  'remy-lebeau-gambit-pose-2': 0.9,
  'scorpion-pose-1': 1.22,
  'skurge': 1.1,
};

/* Was am Ende in den Rahmen geht: Körpergröße mal Feinkorrektur. */
function fullsizeScale(file) {
  const wert = (FULLSIZE_SCALE[file] || 1) * (FULLSIZE_FIT[file] || 1);
  return Math.min(1.22, Math.round(wert * 1000) / 1000);
}

/* In data.js heißt jede Figur "Realname / Heldenname". Überschriften
   zeigen den Realnamen, die Rollenzeile darunter die Heldennamen. Der
   Zusatz „(angekündigt)“ gehört zum Film, nicht zur Figur, und fällt
   hier weg.

   Ein Zusatz in Klammern am Ende benennt dagegen die Variante: die
   Fassung aus einem anderen Universum oder einer anderen Zeit. Er
   gehört zur Person und nicht zur Rolle, sonst stünden zwei Figuren mit
   derselben Überschrift nebeneinander. Aus "Maria Rambeau / Captain
   Marvel (Erde-838)" wird deshalb die Überschrift "Maria Rambeau
   (Erde-838)" mit der Rolle "Captain Marvel". */
const CHAR_ANNOUNCED = / \(angekündigt\)$/;
const CHAR_VARIANT = / (\([^()]+\))$/;

function splitName(name) {
  const clean = name.replace(CHAR_ANNOUNCED, '');
  const variant = clean.match(CHAR_VARIANT);
  const rest = variant ? clean.slice(0, -variant[0].length) : clean;
  const suffix = variant ? ' ' + variant[1] : '';
  const cut = rest.indexOf(' / ');
  return cut === -1
    ? { real: rest + suffix, role: '' }
    : { real: rest.slice(0, cut) + suffix, role: rest.slice(cut + 3) };
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
