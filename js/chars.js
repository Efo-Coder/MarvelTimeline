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
  'Dogpool (Earth-TRN872)': 'Dogpool',
  'Dr. Jane Foster': 'Jane Foster',
  'Eson der Sucher': 'Eson',
  'Gorr der Götterschlächter': 'Gorr',
  'Hank McCoy / Beast (Earth-10005)': 'Hank McCoy / Beast',
  'Elektra Natchios (Earth-701306)': 'Elektra',
  'Herman Schultz / Shocker': 'Shocker',
  'Jemiah der Analytiker': 'Jemiah',
  'Jener der bleibt': 'Der da bleibt',
  'Kidpool (Earth-66345)': 'Kidpool',
  'Rocket Raccoon': 'Rocket',
  'Wade Winston Wilson / Cowboypool (Earth-TRN872)': 'Cowboypool',
  'Wade Winston Wilson / Zenpool': 'Zenpool',
  'Warda Wilson / Deadpool 2099': 'Deadpool 2099',
  'Wanda Wilson / Ladypool (Earth-TRN872)': 'Ladypool',
  'Michelle Jones-Watson / MJ': 'Michelle Jones-Watson',
  'Nezarr der Rechner': 'Nezarr',
  'Piotr Rasputin / Colossus': 'Colossus',
  'Algrim / Kurse': 'Kurse',
  'Anton Miguel Rodriguez / Tarantula': 'Tarantula',
  'Althea / Blind Al': 'Blind Al',
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
  'Ellie Phimister / Negasonic Teenage Warhead': 'Negasonic Teenage Warhead',
  'Ezekiel Stane / Joe McGillicuddy': 'Ezekiel Stane',
  'Flint Marko / Sandman': 'Sandman',
  'General Thaddeus „Thunderbolt“ Ross': 'Thaddeus Ross',
  'General Thaddeus „Thunderbolt“ Ross / Red Hulk': 'Thaddeus Ross',
  'Hector Ayala / White Tiger': 'White Tiger',
  'Hope van Dyne / Wasp': 'Hope van Dyne',
  'Heather Glenn / Muse': 'Heather Glenn',
  'Isabella Gnucci / Ma Gnucci': 'Ma Gnucci',
  'James Rhodes / War Machine': 'James Rhodes',
  'Dr. Jane Foster / Mighty Thor': 'Jane Foster',
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
  'Peter Wisdom / Peterpool': 'Peter Wisdom',
  'Pietro Maximoff / Quicksilver': 'Pietro Maximoff',
  'Riri Williams / Ironheart': 'Riri Williams',
  'Ronan der Ankläger': 'Ronan',
  'Rusty / Shatterstar': 'Shatterstar',
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
  'Toussaint / Black Panther': 'Toussaint',
  'Trevor Slattery / Mandarin': 'Trevor Slattery',
  'Wanda Maximoff / Scarlet Witch': 'Wanda Maximoff',
  'Watari / Samuraipool (Earth-11542)': 'Samuraipool',
  'William Metzger / Bill': 'William Metzger',
  'Yuriko Oyama / Lady Deathstrike': 'Lady Deathstrike',

  /* Varianten: eigene Figuren, deren Bilder unter der Kurzform der
     Herkunft liegen. Ohne diese Brücke hieße die Datei
     "maria-rambeau-captain-marvel-erde-838". */
  'Maria Rambeau / Captain Marvel (Erde-838)': 'Maria Rambeau 838',
  'Johnny Storm / Human Torch (Erde-121698)': 'Johnny Storm 121698',
  'Todd Phelps / HulkKing': 'Todd Phelps',
  'Maria Rambeau / Binary (Earth-10005)': 'Maria Rambeau Binary',
  'Peggy Carter / Captain Carter (Erde-838)': 'Peggy Carter 838',
  'Reed Richards / Mister Fantastic (Erde-838)': 'Reed Richards 838',
  'Karl Mordo / Baron Mordo (Erde-838)': 'Karl Mordo 838',
  'Wanda Maximoff / Scarlet Witch (Erde-838)': 'Wanda Maximoff 838',
  'Christine Palmer (Erde-838)': 'Christine Palmer 838',
  'Stephen Strange / Defender Strange (Erde-617)': 'Defender Strange',
  'Peter Parker / Spider-Man (Maguire)': 'Peter Parker Maguire',
  'Peter Parker / Spider-Man (Garfield)': 'Peter Parker Garfield',
  'Stephen Strange / Sinister Strange (andere Welt)': 'Sinister Strange',
  'Wade Wilson / Nicepool (Earth-TRN872)': 'Nicepool',
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
  'g-iah': {
    'captain-marvel': 'g-iah-kind',
  },
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

   Wie CHAR_LOOKS, nur für die Ganzkörperbilder auf der
   Erscheinungsbühne: Wer im Lauf des Universums Rüstungen wechselt oder
   sich verwandelt, bekommt links neben der Figur die Fassungswahl.

   Pro Figur eine Liste [Beschriftung, Dateiname, Film-Slug], die Datei
   liegt unter assets/characters/fullsize/<Dateiname>.webp. Der erste
   Eintrag ist die Standardansicht und heißt wie der Charakter-Slug.
   Figuren ohne Eintrag zeigen einfach ihr einzelnes Bild.

   Der Film-Slug ist derselbe wie in data.js und holt das Logo aus
   assets/logos/dark/<Film-Slug>.webp, der dunklen Fassung für den weißen
   Grund dieser Seite. Er benennt den Film, aus dem die
   gezeigte Fassung stammt, nicht jeden Film, in dem sie vorkommt: Steve
   Rogers trägt seinen Winter-Soldier-Anzug auch noch in Age of Ultron,
   das Logo bleibt trotzdem das des Films, der ihn eingeführt hat.
   Fehlt der dritte Wert, bleibt der Logoplatz leer und nur die
   Beschriftung steht da.

   Von mancher Fassung gibt es mehr als ein Bild. Dann steht hier
   trotzdem nur ein Eintrag, und der Dateiname ist der Stamm, unter dem
   die einzelnen Bilder liegen: siehe FULLSIZE_VARIANTS weiter unten. */
const FULLSIZE_LOOKS = {
  'tony-stark': [
    ['Mark LXXXV (85)', 'tony-stark-mark-lxxxv-85', 'avengers-endgame'],
    ['Quantum Suit', 'tony-stark-quantum-suit', 'avengers-endgame'],
    ['Mark L', 'tony-stark-mark-l', 'avengers-infinity-war'],
    ['Mark XLVIII - Hulkbuster 2.0', 'tony-stark-mark-xlviii-hulkbuster-2-0', 'avengers-infinity-war'],
    ['Mark XLVII', 'tony-stark-mark-xlvii', 'spider-man-homecoming'],
    ['Mark XLV', 'tony-stark-mark-xlv', 'avengers-age-of-ultron'],
    ['Mark XLIV - Hulkbuster', 'tony-stark-mark-xliv-hulkbuster', 'avengers-age-of-ultron'],
    ['Mark XXXVIII - Igor', 'tony-stark-mark-xxxviii-igor', 'iron-man-3'],
    ['Mark XXVI - Gamma', 'tony-stark-mark-xxvi-gamma', 'iron-man-3'],
    ['Mark XXV - Striker', 'tony-stark-mark-xxv-striker', 'iron-man-3'],
    ['Mark XXIV - Tank', 'tony-stark-mark-xxiv-tank', 'iron-man-3'],
    ['Mark XIV', 'tony-stark-mark-xiv', 'iron-man-3'],
    ['Mark VII', 'tony-stark-mark-vii', 'the-avengers'],
    ['Mark VI', 'tony-stark-mark-vi', 'iron-man-2'],
    ['Mark V', 'tony-stark-mark-v', 'iron-man-2'],
    ['Mark III', 'tony-stark-mark-iii', 'iron-man'],
    ['Mark II', 'tony-stark-mark-ii', 'iron-man'],
    ['Mark I', 'tony-stark-mark-i', 'iron-man'],
    ['Zivil', 'tony-stark-civil', 'iron-man-2'],
  ],
  'marc-spector-steven-grant-moon-knight': [
    ['Zeremonie', 'marc-spector-steven-grant-moon-knight', 'moon-knight'],
    ['Moon Knight', 'marc-spector-steven-grant-moon-knight-classic', 'moon-knight'],
    ['Mr. Knight', 'marc-spector-steven-grant-moon-knight-mr-knight', 'moon-knight'],
    ['Steven Grant', 'marc-spector-steven-grant-moon-knight-steven-grant', 'moon-knight'],
    ['Steven Grant (Zivil)', 'marc-spector-steven-grant-moon-knight-steven-grant-zivil', 'moon-knight'],
  ],
  'thor': [
    ['Endgame', 'thor-endgame', 'avengers-endgame'],
    ['Quantum Suit', 'thor-quantum-suit', 'avengers-endgame'],
    ['Infinity War', 'thor-infinity-war', 'avengers-infinity-war'],
    ['Love and Thunder (Helm)', 'thor-love-and-thunder-helm', 'thor-love-and-thunder'],
    ['Schwarz-Gold', 'thor-love-and-thunder-schwarz-gold', 'thor-love-and-thunder'],
    ['Love and Thunder', 'thor-love-and-thunder', 'thor-love-and-thunder'],
    ['Fellumhang', 'thor-fellumhang', 'thor-love-and-thunder'],
    ['Zivil (Love and Thunder)', 'thor-zivil-love-and-thunder', 'thor-love-and-thunder'],
    ['Ragnarok', 'thor-ragnarok', 'thor-ragnarok'],
    ['Ragnarok (Anfang)', 'thor-ragnarok-anfang', 'thor-ragnarok'],
    ['Zivil', 'thor-zivil', 'doctor-strange'],
    ['Age of Ultron', 'thor-age-of-ultron', 'avengers-age-of-ultron'],
    ['The Dark World', 'thor-the-dark-world', 'thor-the-dark-world'],
    ['Avengers', 'thor', 'the-avengers'],
    ['Thor', 'thor-thor', 'thor'],
  ],
  'bruce-banner': [
    ['Professor', 'bruce-banner-professor', 'spider-man-brand-new-day'],
    ['Brand New Day', 'bruce-banner-brand-new-day', 'spider-man-brand-new-day'],
    ['Zivil', 'bruce-banner-banner-pullover', 'she-hulk'],
    ['She-Hulk', 'bruce-banner-she-hulk', 'she-hulk'],
    ['Smart Hulk', 'bruce-banner-smart-hulk', 'avengers-endgame'],
    ['Quantum Suit', 'bruce-banner-quantum-suit', 'avengers-endgame'],
    ['Infinity War', 'bruce-banner-infinity-war', 'avengers-infinity-war'],
    ['Infinity War (Mensch)', 'bruce-banner-infinity-war-mensch', 'avengers-infinity-war'],
    ['Ragnarok (Mensch)', 'bruce-banner-ragnarok-mensch', 'thor-ragnarok'],
    ['Ragnarok', 'bruce-banner-ragnarok', 'thor-ragnarok'],
    ['Bruce Banner', 'bruce-banner-ruffalo', 'the-avengers'],
    ['Hulk', 'bruce-banner', 'the-avengers'],
    ['The Incredible Hulk', 'bruce-banner-the-incredible-hulk', 'the-incredible-hulk'],
    ['The Incredible Hulk (Mensch)', 'bruce-banner-norton', 'the-incredible-hulk'],
  ],
  'steve-rogers': [
    ['Infinity War', 'steve-rogers', 'avengers-infinity-war'],
    ['Mjölnir', 'steve-rogers-mjoelnir', 'avengers-endgame'],
    ['Endgame', 'steve-rogers-endgame', 'avengers-endgame'],
    ['Quantum Suit', 'steve-rogers-quantum-suit', 'avengers-endgame'],
    ['Civil War', 'steve-rogers-civil-war', 'captain-america-civil-war'],
    ['Age of Ultron', 'steve-rogers-age-of-ultron', 'avengers-age-of-ultron'],
    ['Stealth Suit (maskiert)', 'steve-rogers-stealth-suit-maskiert', 'captain-america-the-winter-soldier'],
    ['Avengers', 'steve-rogers-avengers', 'the-avengers'],
    ['First Avenger', 'steve-rogers-first-avenger', 'captain-america-the-first-avenger'],
    ['USO-Tournee', 'steve-rogers-uso-tournee', 'captain-america-the-first-avenger'],
  ],
  'bucky-barnes': [
    ['Zivil', 'bucky-barnes-zivil', 'the-falcon-and-the-winter-soldier'],
    ['Winter Soldier', 'bucky-barnes-winter-soldier', 'captain-america-the-winter-soldier'],
    ['Thunderbolts', 'bucky-barnes-thunderbolts', 'thunderbolts'],
  ],
  'taskmaster': [
    ['Maskiert', 'taskmaster', 'black-widow'],
    ['Unmaskiert', 'taskmaster-unmasked', 'black-widow'],
    ['Thunderbolts', 'taskmaster-thunderbolts', 'thunderbolts'],
  ],
  'natasha-romanoff': [
    ['Black Widow - Black Suit', 'natasha-romanoff-black-widow-black-suit', 'black-widow'],
    ['Black Widow - White Suit', 'natasha-romanoff-black-widow-white-suit', 'black-widow'],
    ['Endgame', 'natasha-romanoff-endgame', 'avengers-endgame'],
    ['Quantum Suit', 'natasha-romanoff-quantum-suit', 'avengers-endgame'],
    ['Infinity War', 'natasha-romanoff-infinity-war', 'avengers-infinity-war'],
    ['Age of Ultron', 'natasha-romanoff-age-of-ultron', 'avengers-age-of-ultron'],
    ['Civil War', 'natasha-romanoff-civil-war', 'captain-america-civil-war'],
    ['Lagos', 'natasha-romanoff-lagos', 'captain-america-civil-war'],
    ['Winter Soldier', 'natasha-romanoff-winter-soldier', 'captain-america-the-winter-soldier'],
    ['Avengers', 'natasha-romanoff-avengers', 'the-avengers'],
    ['Iron Man 2', 'natasha-romanoff-iron-man-2', 'iron-man-2'],
    ['Natalie Rushman', 'natasha-romanoff-natalie-rushman', 'iron-man-2'],
  ],
  'peter-parker': [
    ['Far From Home', 'peter-parker', 'spider-man-far-from-home'],
    ['Brand New Day', 'peter-parker-brand-new-day', 'spider-man-brand-new-day'],
    ['Mutiert', 'peter-parker-mutiert', 'spider-man-brand-new-day'],
    ['Integrated Suit', 'peter-parker-integrated-suit', 'spider-man-no-way-home'],
    ['Black Suit', 'peter-parker-black-suit', 'spider-man-no-way-home'],
    ['Iron Spider', 'peter-parker-iron-spider', 'avengers-infinity-war'],
    ['Night Monkey', 'peter-parker-night-monkey', 'spider-man-far-from-home'],
    ['Homecoming', 'peter-parker-homecoming', 'spider-man-homecoming'],
    ['Selbstgebauter Anzug', 'peter-parker-selbstgebauter-anzug', 'spider-man-homecoming'],
    ['Civil War', 'peter-parker-civil-war', 'captain-america-civil-war'],
    ['Zivil', 'peter-parker-zivil', 'spider-man-far-from-home'],
  ],
  'wanda-maximoff': [
    ['Scarlet Witch', 'wanda-maximoff-scarlet-witch', 'doctor-strange-in-the-multiverse-of-madness'],
    ['WandaVision', 'wanda-maximoff-wandavision', 'wandavision'],
    ['Infinity War', 'wanda-maximoff-infinity-war', 'avengers-infinity-war'],
    ['Civil War', 'wanda-maximoff', 'captain-america-civil-war'],
    ['Lagos', 'wanda-maximoff-lagos', 'captain-america-civil-war'],
    ['Age of Ultron', 'wanda-maximoff-age-of-ultron', 'avengers-age-of-ultron'],
  ],
  'nick-fury': [
    ['Klassisch', 'nick-fury', 'the-avengers'],
    ['Secret Invasion', 'nick-fury-secret-invasion', 'secret-invasion'],
    ['Director Fury', 'nick-fury-director-fury', 'captain-america-the-winter-soldier'],
  ],
  'loki': [
    ['God of Stories', 'loki-god-of-stories', 'loki'],
    ['TVA', 'loki-tva', 'loki'],
    ['Ragnarok', 'loki-ragnarok', 'thor-ragnarok'],
    ['Schwarzer Anzug', 'loki-schwarzer-anzug', 'doctor-strange'],
    ['The Dark World', 'loki-the-dark-world', 'thor-the-dark-world'],
    ['Gefangener', 'loki-gefangener', 'thor-the-dark-world'],
    ['The Avengers', 'loki-avengers', 'the-avengers'],
    ['Asgard', 'loki', 'thor'],
  ],
  'sylvie': [
    ['Rüstung', 'sylvie', 'loki'],
    ['Staffel 1', 'sylvie-staffel-1', 'loki'],
    ['Staffel 2', 'sylvie-staffel-2', 'loki'],
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
    ['Guardians of the Galaxy Vol. 2', 'gamora-guardians-of-the-galaxy-vol-2', 'guardians-of-the-galaxy-vol-2'],
    ['Guardians of the Galaxy', 'gamora-guardians-of-the-galaxy', 'guardians-of-the-galaxy'],
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
    ['She-Hulk', 'matt-murdock-daredevil-she-hulk', 'she-hulk'],
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
    ['Hawkeye', 'clint-barton-hawkeye', 'hawkeye'],
    ['Quantum Suit', 'clint-barton-quantum-suit', 'avengers-endgame'],
    ['Ronin (Unmaskiert)', 'clint-barton-ronin-unmaskiert', 'avengers-endgame'],
    ['Ronin', 'clint-barton-ronin', 'avengers-endgame'],
    ['Age of Ultron', 'clint-barton', 'avengers-age-of-ultron'],
    ['Civil War', 'clint-barton-civil-war', 'captain-america-civil-war'],
    ['Thor', 'clint-barton-thor', 'thor'],
    ['Avengers', 'clint-barton-avengers', 'the-avengers'],
  ],
  'hope-van-dyne': [
    ['Wasp', 'hope-van-dyne', 'ant-man-and-the-wasp'],
    ['Zivil', 'hope-van-dyne-civil', 'ant-man'],
    ['Unmaskiert', 'hope-van-dyne-unmasked', 'ant-man-and-the-wasp'],
    ['Im Flug', 'hope-van-dyne-flight', 'ant-man-and-the-wasp'],
    ['Quantumania', 'hope-van-dyne-quantumania', 'ant-man-and-the-wasp-quantumania'],
  ],
  'james-rhodes': [
    ['Mark VII - Iron Patriot MK II', 'james-rhodes-mark-vii-iron-patriot-mk-ii', 'secret-invasion'],
    ['Mark VI - Quantum Suit', 'james-rhodes-mark-vi-quantum-suit', 'avengers-endgame'],
    ['Mark VI', 'james-rhodes-mark-6', 'avengers-endgame'],
    ['Mark V', 'james-rhodes-mark-v', 'avengers-infinity-war'],
    ['Mark IV', 'james-rhodes-mark-iv', 'captain-america-civil-war'],
    ['Mark III', 'james-rhodes-mark-3', 'avengers-age-of-ultron'],
    ['Mark II - Iron Patriot', 'james-rhodes-mark-ii-iron-patriot', 'iron-man-3'],
    ['Mark II', 'james-rhodes-mark-2', 'iron-man-3'],
    ['Mark I', 'james-rhodes-mark-1', 'iron-man-2'],
    ['Zivil', 'james-rhodes', 'iron-man-2'],
    ['Colonel', 'james-rhodes-colonel', 'iron-man-2'],
  ],
  'samuel-sterns-the-leader': [
    ['Mensch', 'samuel-sterns-the-leader', 'the-incredible-hulk'],
    ['Leader', 'samuel-sterns-the-leader-green', 'captain-america-brave-new-world'],
    ['Mutation', 'samuel-sterns-the-leader-the-incredible-hulk', 'the-incredible-hulk'],
  ],
  'scott-lang': [
    ['Unmaskiert', 'scott-lang', 'ant-man'],
    ['Quantum Suit', 'scott-lang-quantum-suit', 'avengers-endgame'],
    ['Visier offen', 'scott-lang-visor', 'ant-man'],
    ['Maskiert', 'scott-lang-masked', 'ant-man'],
  ],
  'thanos': [
    ['Ohne Rüstung', 'thanos-ohne-ruestung', 'avengers-infinity-war'],
    ['Rüstung', 'thanos-ruestung', 'avengers-infinity-war'],
    ['Rüstung', 'thanos-armor', 'guardians-of-the-galaxy'],
  ],
  'trevor-slattery': [
    ['Mandarin', 'trevor-slattery', 'iron-man-3'],
    ['Shang-Chi', 'trevor-slattery-shang-chi', 'shang-chi'],
    ['Videobotschaft', 'trevor-slattery-iron-man-3', 'iron-man-3'],
  ],
  'jack-duquesne': [
    ['Hawkeye', 'jack-duquesne', 'hawkeye'],
    ['Born Again', 'jack-duquesne-born-again', 'daredevil-born-again'],
  ],
  'wilson-fisk-kingpin': [
    ['Born Again', 'wilson-fisk-kingpin', 'daredevil-born-again'],
    ['Weißer Anzug', 'wilson-fisk-kingpin-white', 'daredevil-born-again'],
    ['Hawkeye', 'wilson-fisk-kingpin-hawkeye', 'hawkeye'],
    ['Echo', 'wilson-fisk-kingpin-echo', 'echo'],
  ],
  'yelena-belova': [
    ['Black Widow', 'yelena-belova', 'black-widow'],
    ['Hawkeye', 'yelena-belova-hawkeye', 'hawkeye'],
    ['Hawkeye (maskiert)', 'yelena-belova-hawkeye-maskiert', 'hawkeye'],
    ['Thunderbolts', 'yelena-belova-thunderbolts', 'thunderbolts'],
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
    ['Zivil', 'emil-blonsky-abomination-zivil', 'she-hulk'],
    ['She-Hulk', 'emil-blonsky-abomination-she-hulk', 'she-hulk'],
    ['Abomination', 'emil-blonsky-abomination-green', 'she-hulk'],
    ['The Incredible Hulk', 'emil-blonsky-abomination-2008', 'the-incredible-hulk'],
    ['Mensch', 'emil-blonsky-abomination', 'the-incredible-hulk'],
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
    ['Maskiert (Serie)', 'helmut-zemo-falcon-and-the-winter-soldier', 'the-falcon-and-the-winter-soldier'],
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
  'm-baku': [
    ['M’Baku', 'm-baku', 'black-panther'],
    ['Fellumhang', 'm-baku-fur', 'black-panther-wakanda-forever'],
    ['Man-Ape', 'm-baku-man-ape', 'black-panther'],
  ],
  'nakia': [
    ['Nakia', 'nakia', 'black-panther'],
    ['Wakanda Forever', 'nakia-wakanda-forever', 'black-panther-wakanda-forever'],
  ],
  'quentin-beck-mysterio': [
    ['Mysterio', 'quentin-beck-mysterio', 'spider-man-far-from-home'],
    ['Nebelhelm', 'quentin-beck-mysterio-helm', 'spider-man-far-from-home'],
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
  'cull-obsidian': [
    ['Cull Obsidian', 'cull-obsidian', 'avengers-infinity-war'],
    ['Kettenhammer', 'cull-obsidian-hammer', 'avengers-infinity-war'],
  ],
  'kang-der-eroberer': [
    ['Maskiert', 'kang-der-eroberer', 'ant-man-and-the-wasp-quantumania'],
    ['Unmaskiert', 'kang-der-eroberer-unmasked', 'ant-man-and-the-wasp-quantumania'],
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
    ['Zivil', 'maya-lopez-echo-zivil', 'hawkeye'],
    ['Kriegsbemalung', 'maya-lopez-echo-kriegsbemalung', 'echo'],
  ],
  'ying-li': [
    ['Ying Li', 'ying-li', 'shang-chi'],
    ['Zeremonie', 'ying-li-ceremonial', 'shang-chi'],
    ['Rüstung', 'ying-li-ruestung', 'shang-chi'],
  ],
  'curt-connors': [
    ['Curt Connors', 'curt-connors', 'spider-man-no-way-home'],
    ['Lizard', 'curt-connors-lizard', 'spider-man-no-way-home'],
  ],
  'heimdall': [
    ['Ragnarok', 'heimdall-ragnarok', 'thor-ragnarok'],
    ['Heimdall', 'heimdall', 'thor-the-dark-world'],
    ['Wächterrüstung', 'heimdall-waechterruestung', 'thor'],
  ],
  'miek': [
    ['Ragnarok', 'miek', 'thor-ragnarok'],
    ['Love and Thunder', 'miek-love-and-thunder', 'thor-love-and-thunder'],
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
    ['Star-Lord', 'peter-quill-star-lord', 'guardians-of-the-galaxy'],
    ['Im Mantel', 'peter-quill-guardians-of-the-galaxy', 'guardians-of-the-galaxy'],
  ],
  't-chaka': [
    ['Black Panther', 't-chaka', 'black-panther'],
    ['Unmaskiert', 't-chaka-unmasked', 'black-panther'],
    ['Zivil', 't-chaka-civil', 'captain-america-civil-war'],
  ],
  'wade-wilson-deadpool': [
    ['Deadpool', 'wade-wilson-deadpool', 'deadpool-and-wolverine'],
    ['Unmaskiert', 'wade-wilson-deadpool-unmaskiert', 'deadpool-and-wolverine'],
    ['Wade Wilson', 'wade-wilson-deadpool-civil', 'deadpool-and-wolverine'],
  ],
  'peter-wisdom': [
    ['Peterpool', 'peter-wisdom', 'deadpool-and-wolverine'],
    ['Zivil', 'peter-wisdom-zivil', 'deadpool-and-wolverine'],
  ],
  'cassie-lang': [
    ['Cassie Lang', 'cassie-lang', 'ant-man-and-the-wasp-quantumania'],
    ['Zivil', 'cassie-lang-zivil', 'ant-man-and-the-wasp'],
    ['Ant-Man', 'cassie-lang-ant-man', 'ant-man'],
  ],
  'agatha-harkness': [
    ['WandaVision', 'agatha-harkness', 'wandavision'],
    ['Agathas Zirkel', 'agatha-harkness-coven', 'agatha-all-along'],
  ],
  'america-chavez': [
    ['Zivil', 'america-chavez-civil', 'doctor-strange-in-the-multiverse-of-madness'],
    ['Kamar-Taj', 'america-chavez', 'doctor-strange-in-the-multiverse-of-madness'],
  ],
  'g-iah': [
    ['Mensch', 'g-iah', 'secret-invasion'],
    ['Skrull', 'g-iah-skrull', 'secret-invasion'],
    ['Kind', 'g-iah-kind', 'captain-marvel'],
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
    ['Walküre', 'valkyrie-walkuere', 'thor-ragnarok'],
    ['König von Neu-Asgard', 'valkyrie-koenig-von-neu-asgard', 'thor-love-and-thunder'],
  ],
  'joaquin-torres-falcon': [
    ['Falcon', 'joaquin-torres-falcon', 'captain-america-brave-new-world'],
    ['Im Flug', 'joaquin-torres-falcon-flight', 'captain-america-brave-new-world'],
    ['Zivil', 'joaquin-torres-falcon-zivil', 'the-falcon-and-the-winter-soldier'],
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
    ['Quantum Suit', 'hank-pym-quantum-suit', 'ant-man-and-the-wasp'],
    ['Quantumania', 'hank-pym-quantumania', 'ant-man-and-the-wasp-quantumania'],
    ['Ant-Man', 'hank-pym-ant-man', 'ant-man-and-the-wasp'],
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
  ],
  'scorpion': [
    ['Pose 1', 'scorpion-pose-1', 'spider-man-homecoming'],
    ['Pose 2', 'scorpion-pose-2', 'spider-man-homecoming'],
    ['Lederjacke', 'scorpion-lederjacke', 'spider-man-homecoming'],
    ['Zivil', 'scorpion-zivil', 'spider-man-homecoming'],
  ],
  'ned-leeds': [
    ['Standard', 'ned-leeds', 'spider-man-homecoming'],
    ['Brand New Day', 'ned-leeds-brand-new-day', 'spider-man-brand-new-day'],
  ],
  'billy-maximoff-wiccan': [
    ['Wiccan', 'billy-maximoff-wiccan', 'agatha-all-along'],
    ['WandaVision', 'billy-maximoff-wiccan-wandavision', 'wandavision'],
  ],
  'blade': [
    ['Blade', 'blade', 'deadpool-and-wolverine'],
    ['Nachtjäger', 'blade-knight', 'deadpool-and-wolverine'],
    ['Kampfanzug', 'blade-kampfanzug', 'deadpool-and-wolverine'],
  ],
  'erik-lehnsherr-magneto': [
    ['Magneto', 'erik-lehnsherr-magneto', 'avengers-doomsday'],
    ['Jung', 'erik-lehnsherr-magneto-jung', 'avengers-doomsday'],
  ],
  'everett-ross': [
    ['Everett Ross', 'everett-ross', 'black-panther'],
    ['Anzug', 'everett-ross-anzug', 'captain-america-civil-war'],
  ],
  'frank-castle-punisher': [
    ['Punisher', 'frank-castle-punisher', 'daredevil-born-again'],
    ['Kampfanzug', 'frank-castle-punisher-kampfanzug', 'daredevil-born-again'],
  ],
  'jennifer-walters-she-hulk': [
    ['She-Hulk', 'jennifer-walters-she-hulk', 'she-hulk'],
    ['Menschenform', 'jennifer-walters-she-hulk-menschenform', 'she-hulk'],
  ],
  'johnny-storm-human-torch': [
    ['Human Torch', 'johnny-storm-human-torch', 'the-fantastic-four-first-steps'],
    ['Halb entzündet', 'johnny-storm-human-torch-halb-entzuendet', 'the-fantastic-four-first-steps'],
    ['Flame On', 'johnny-storm-human-torch-flame-on', 'the-fantastic-four-first-steps'],
  ],
  'kamala-khan-ms-marvel': [
    ['Ms. Marvel', 'kamala-khan-ms-marvel', 'ms-marvel'],
    ['Neues Kostüm', 'kamala-khan-ms-marvel-neues-kostuem', 'the-marvels'],
  ],
  'kate-bishop': [
    ['Kate Bishop', 'kate-bishop', 'hawkeye'],
    ['Mantel', 'kate-bishop-mantel', 'hawkeye'],
  ],
  'koenigin-ramonda': [
    ['Ramonda', 'koenigin-ramonda', 'black-panther'],
    ['Weißes Kleid', 'koenigin-ramonda-weisses-kleid', 'black-panther-wakanda-forever'],
  ],
  'kraglin': [
    ['Vol. 3', 'kraglin', 'guardians-of-the-galaxy-vol-3'],
    ['Vol. 2', 'kraglin-vol-2', 'guardians-of-the-galaxy-vol-2'],
  ],
  'maria-hill': [
    ['Maria Hill', 'maria-hill', 'the-avengers'],
    ['Im Einsatz', 'maria-hill-im-einsatz', 'the-avengers'],
    ['S.H.I.E.L.D.', 'maria-hill-s-h-i-e-l-d', 'captain-america-the-winter-soldier'],
  ],
  'michelle-jones-watson': [
    ['MJ', 'michelle-jones-watson', 'spider-man-homecoming'],
    ['Far From Home', 'michelle-jones-watson-far-from-home', 'spider-man-far-from-home'],
    ['No Way Home', 'michelle-jones-watson-no-way-home', 'spider-man-no-way-home'],
  ],
  'nebula': [
    ['Nebula', 'nebula', 'guardians-of-the-galaxy'],
    ['Violetter Anzug', 'nebula-violetter-anzug', 'guardians-of-the-galaxy-vol-2'],
    ['Quantum Suit', 'nebula-quantum-suit', 'avengers-endgame'],
    ['Vol. 3', 'nebula-vol-3', 'guardians-of-the-galaxy-vol-3'],
  ],
  'ravonna-renslayer': [
    ['Ravonna Renslayer', 'ravonna-renslayer', 'loki'],
    ['Zeitwende', 'ravonna-renslayer-zeitwende', 'loki'],
  ],
  'reed-richards-mister-fantastic': [
    ['Mister Fantastic', 'reed-richards-mister-fantastic', 'the-fantastic-four-first-steps'],
    ['Mit Jacke', 'reed-richards-mister-fantastic-mit-jacke', 'avengers-doomsday'],
  ],
  'sif': [
    ['Sif', 'sif', 'thor-the-dark-world'],
    ['Thor', 'sif-thor', 'thor'],
    ['Love and Thunder', 'sif-love-and-thunder', 'thor-love-and-thunder'],
  ],
  'stephen-strange': [
    ['Doctor Strange', 'stephen-strange', 'doctor-strange'],
    ['Supreme Strange', 'stephen-strange-supreme-strange', 'doctor-strange-in-the-multiverse-of-madness'],
  ],
  'vanessa-fisk': [
    ['Vanessa Fisk', 'vanessa-fisk', 'daredevil-born-again'],
    ['Rotes Kleid', 'vanessa-fisk-rotes-kleid', 'daredevil-born-again'],
  ],
  'wong': [
    ['Shehulk', 'wong-shehulk', 'she-hulk'],
    ['Multiverse of Madness', 'wong-multiverse-of-madness', 'doctor-strange-in-the-multiverse-of-madness'],
    ['Shang-Chi', 'wong-shang-chi', 'shang-chi'],
    ['Doctor Strange', 'wong-doctor-strange', 'doctor-strange'],
  ],
  'agent-cleary': [
    ['Damage Control', 'agent-cleary', 'spider-man-no-way-home'],
    ['Anzug', 'agent-cleary-anzug', 'ms-marvel'],
  ],
  'aneka': [
    ['Dora Milaje', 'aneka', 'black-panther-wakanda-forever'],
    ['Midnight Angel', 'aneka-midnight-angel', 'black-panther-wakanda-forever'],
  ],
  'johnny-storm-121698': [
    ['Human Torch', 'johnny-storm-121698', 'deadpool-and-wolverine'],
    ['Flame On', 'johnny-storm-121698-flame-on', 'deadpool-and-wolverine'],
    ['Zivil', 'johnny-storm-121698-zivil', 'deadpool-and-wolverine'],
  ],
  'pagon': [
    ['Skrull', 'pagon', 'secret-invasion'],
    ['Menschenform', 'pagon-menschenform', 'secret-invasion'],
  ],
  'todd-phelps': [
    ['Todd Phelps', 'todd-phelps', 'she-hulk'],
    ['HulkKing', 'todd-phelps-hulkking', 'she-hulk'],
  ],
  'varra-priscilla-davis': [
    ['Varra', 'varra-priscilla-davis', 'secret-invasion'],
    ['Priscilla Davis', 'varra-priscilla-davis-menschenform', 'secret-invasion'],
  ],
  'yusuf-khan': [
    ['Yusuf Khan', 'yusuf-khan', 'ms-marvel'],
    ['Ohne Mütze', 'yusuf-khan-ohne-muetze', 'ms-marvel'],
  ],
  'rocket': [
    ['Guradians of the Galaxy Vol. 3', 'rocket-guradians-of-the-galaxy-vol-3', 'guardians-of-the-galaxy-vol-3'],
    ['Endgame', 'rocket-endgame', 'avengers-endgame'],
    ['Quantum Suit', 'rocket-quantum-suit', 'avengers-endgame'],
    ['Guradians of the Galaxy Vol. 2', 'rocket-guradians-of-the-galaxy-vol-2', 'guardians-of-the-galaxy-vol-2'],
    ['Guradians of the Galaxy', 'rocket-guradians-of-the-galaxy', 'guardians-of-the-galaxy'],
  ],
  'john-walker': [
    ['US Agent', 'john-walker', 'the-falcon-and-the-winter-soldier'],
    ['Captain America', 'john-walker-captain-america', 'the-falcon-and-the-winter-soldier'],
  ],
  'dirk-garthwaite-wrecker': [
    ['Brechstange', 'dirk-garthwaite-wrecker-brechstange', 'she-hulk'],
    ['Zivil', 'dirk-garthwaite-wrecker', 'she-hulk'],
  ],
  'gamora-2014': [
    ['Guardians of the Galaxy Vol. 3', 'gamora-2014-guardians-of-the-galaxy-vol-3', 'guardians-of-the-galaxy-vol-3'],
    ['Avengers: Endgame', 'gamora-2014-avengers-endgame', 'avengers-endgame'],
  ],
};

/* ---------- Varianten einer Fassung ----------

   Von mancher Fassung gibt es mehr als ein brauchbares Bild: dieselbe
   Rüstung in einer anderen Haltung, von der anderen Seite, einmal mit
   Helm und einmal ohne. Das sind keine eigenen Fassungen. Beschriftung,
   Film und Beschreibung wären bei jeder gleich, und in der Fassungswahl
   stünden zwei Tafeln nebeneinander, die dasselbe Ding meinen.

   Sie stehen deshalb als Varianten hinter einer einzigen Fassung.
   Gewählt werden sie oben an der Profilleiste über die Schalter 1, 2, 3,
   die Fassungswahl links behält ihre eine Tafel.

   Hier steht nur die Anzahl, die Dateinamen folgen ihr: Aus der Fassung
   emil-blonsky-abomination-green mit drei Varianten werden die Dateien
   emil-blonsky-abomination-green-1, -2 und -3. Die Fassung selbst liegt
   dann unter keinem Dateinamen mehr, sie ist nur noch der Stamm.
   Fassungen ohne Eintrag haben ihr eines Bild und heißen wie bisher.

   Der Schlüssel ist der Dateiname aus FULLSIZE_LOOKS und nicht der
   Charakter-Slug: Varianten gehören zu einer Fassung, nicht zu einer
   Figur. Bei Figuren ohne Fassungsliste ist beides dasselbe.

   Gepflegt wird die Liste im Bild-Studio unter der Fassungsleiste, von
   Hand geschrieben werden muss hier nichts: Das Studio legt die Variante
   an, benennt die Dateien um und zieht Körpergröße, Bildkorrektur und
   Quellenangabe mit. */
const FULLSIZE_VARIANTS = {
  'alejandro-montoya-el-aguila': 2,
  'bill-foster': 2,
  'bucky-barnes-winter-soldier': 3,
  'bullseye': 2,
  'callisto': 2,
  'cassie-lang': 2,
  'elder-beast': 2,
  'jessica-jones': 2,
  'john-walker': 2,
  'logan-wolverine': 2,
  'peter-parker-garfield': 2,
  'remy-lebeau-gambit-pose-1': 2,
  'simon-williams': 2,
  'steve-rogers-stealth-suit-maskiert': 2,
  'ying-li-ceremonial': 2,
};

/* Wie viele Bilder eine Fassung hat. Ohne Eintrag ist es das eine. */
function lookVariants(file) {
  const anzahl = typeof FULLSIZE_VARIANTS === 'undefined' ? 0 : FULLSIZE_VARIANTS[file];
  return anzahl > 1 ? anzahl : 1;
}

/* Die Datei der n-ten Variante, gezählt ab eins. Eine Fassung ohne
   Varianten liegt unter ihrem eigenen Namen, alles andere unter
   <Fassung>-<Nummer>. Eine Nummer außerhalb der Reihe fällt auf die
   erste zurück, damit nie ein Name entsteht, zu dem keine Datei gehört. */
function lookVariantFile(file, nr) {
  const anzahl = lookVariants(file);
  if (anzahl < 2) return file;
  return file + '-' + (nr >= 1 && nr <= anzahl ? nr : 1);
}

/* Alle Dateien einer Fassung, in ihrer Reihenfolge. */
function lookVariantFiles(file) {
  const anzahl = lookVariants(file);
  if (anzahl < 2) return [file];
  const dateien = [];
  for (let nr = 1; nr <= anzahl; nr += 1) dateien.push(file + '-' + nr);
  return dateien;
}



/* ---------- Der Film zum einzelnen Ganzkörperbild ----------

   Auf der Erscheinungsbühne steht zu jeder Fassung, aus welchem Film sie
   stammt. Bei Figuren mit Eintrag in FULLSIZE_LOOKS steht das dort schon
   dabei. Alle anderen haben nur ihr eines Bild – und die meisten von
   ihnen brauchen auch hier nichts: Wer nur in einem Titel vorkommt, bei
   dem kann das Bild aus keinem anderen sein, das rechnet die
   Charakterseite selbst aus (standardFilm() in js/characters.js).

   Hier stehen die übrigen: Figuren, die in mehreren Titeln vorkommen und
   trotzdem nur ein Bild haben. Eingetragen ist der Titel, den das Bild
   zeigt. Wo die Quellenangabe in assets/characters/fullsize/CREDITS.md
   den Film nennt, folgt der Eintrag ihr; sonst steht der Auftritt da, der
   die Figur prägt. Wer es besser weiß, ändert die Zeile oder stellt sie
   im Bild-Studio unter der Fassungsleiste um.

   Die Liste folgt der Handlung: Wer früher zum ersten Mal auftritt, steht
   weiter oben. Bekommt eine Figur eine Fassungsliste in FULLSIZE_LOOKS,
   zieht ihr Film dorthin um und die Zeile hier fällt weg. */
const FULLSIZE_STANDARD = {
  'peggy-carter': 'captain-america-the-first-avenger',
  'goose': 'captain-marvel',
  'phil-coulson': 'the-avengers',
  'ronan': 'guardians-of-the-galaxy',
  'betty-ross': 'the-incredible-hulk',
  'odin': 'thor',
  'sif': 'thor',
  'fandral': 'thor',
  'hogun': 'thor',
  'volstagg': 'thor',
  'darcy-lewis': 'thor',
  'maria-hill': 'the-avengers',
  'der-andere': 'the-avengers',
  'frigga': 'thor-the-dark-world',
  'the-collector': 'guardians-of-the-galaxy',
  'alexander-pierce': 'captain-america-the-winter-soldier',
  'pietro-maximoff': 'avengers-age-of-ultron',
  'sharon-carter': 'captain-america-the-winter-soldier',
  'georges-batroc': 'captain-america-the-winter-soldier',
  'drax': 'guardians-of-the-galaxy',
  'yondu': 'guardians-of-the-galaxy-vol-2',
  'kraglin': 'guardians-of-the-galaxy-vol-2',
  'nebula': 'guardians-of-the-galaxy-vol-3',
  'howard-the-duck': 'guardians-of-the-galaxy',
  'ayesha': 'guardians-of-the-galaxy-vol-2',
  'martinex': 'guardians-of-the-galaxy-vol-2',
  'ultron': 'avengers-age-of-ultron',
  'vision': 'wandavision',
  'laura-barton': 'avengers-age-of-ultron',
  'cooper-barton': 'avengers-age-of-ultron',
  'lila-barton': 'avengers-age-of-ultron',
  'luis': 'ant-man',
  'may-parker': 'spider-man-homecoming',
  'everett-ross': 'black-panther',
  'koenigin-ramonda': 'black-panther-wakanda-forever',
  'michelle-jones-watson': 'spider-man-far-from-home',
  'stephen-strange': 'doctor-strange',
  'the-ancient-one': 'doctor-strange',
  'wong': 'doctor-strange',
  'christine-palmer': 'doctor-strange',
  'korg': 'thor-ragnarok',
  'nathaniel-barton': 'avengers-endgame',
  'alioth': 'loki',
  'monica-rambeau': 'the-marvels',
  'billy-maximoff-wiccan': 'agatha-all-along',
  'mrs-hart': 'wandavision',
  'shang-chi': 'shang-chi',
  'isaiah-bradley': 'the-falcon-and-the-winter-soldier',
  'valentina-allegra-de-fontaine': 'thunderbolts',
  'e-d-i-t-h': 'spider-man-far-from-home',
  'j-jonah-jameson': 'spider-man-far-from-home',
  'kate-bishop': 'hawkeye',
  'kamala-khan-ms-marvel': 'ms-marvel',
  'bruno-carrelli': 'ms-marvel',
  'muneeba-khan': 'ms-marvel',
  'love': 'thor-love-and-thunder',
  'namor': 'black-panther-wakanda-forever',
  'hank-mccoy-beast': 'the-marvels',
  'frank-castle-punisher': 'daredevil-born-again',
  'reed-richards-mister-fantastic': 'the-fantastic-four-first-steps',
  'sue-storm-invisible-woman': 'the-fantastic-four-first-steps',
  'johnny-storm-human-torch': 'the-fantastic-four-first-steps',
  'ben-grimm-the-thing': 'the-fantastic-four-first-steps',
  'doctor-doom': 'avengers-doomsday',
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
  'headpool': 0.42,
  'lylla': 0.42,
  'floor': 0.45,
  'morris': 0.5,
  'cosmo': 0.55,
  'lucky': 0.55,
  'h-e-r-b-i-e': 0.6,
  'teefs': 0.62,
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
  'corvus-glaive-2014': 1.06,
  'proxima-midnight': 1.05,
  'ebony-maw': 1.06,
  'volstagg': 1.06,
  'riri-williams-mark-1': 1.05,
  'hank-mccoy-beast': 1.08,
  'tony-stark-mark-i': 1.08,
  'ivan-vanko-whiplash-mark-2': 1.1,
  'jennifer-walters-she-hulk': 1.1,
  'ben-grimm-the-thing': 1.12,
  'bill-foster-2': 1.12,
  'groot-alpha-groot': 1.15,
  'tony-stark-mark-xxxviii-igor': 1.15,
  'colossus': 1.16,
  'juggernaut': 1.12,
  'hercules': 1.06,
  'piledriver': 1.05,
  'eros-starfox': 1.02,
  'ronan': 1.12,
  'ultron': 1.15,
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
  'thanos-armor': 1.2,
  'bruce-banner-smart-hulk': 1.2,
  'bruce-banner-quantum-suit': 1.2,
  'bruce-banner-she-hulk': 1.2,
  'bruce-banner-ragnarok': 1.2,
  'thaddeus-ross-red-hulk': 1.2,
  'happy-hogan-what-if': 1.2,
  'thanos-2014': 1.2,
  'thanos-ruestung': 1.2,
  'thanos-ohne-ruestung': 1.2,
  'bruce-banner': 1.22,
  'bruce-banner-infinity-war': 1.22,
  'bruce-banner-the-incredible-hulk': 1.22,
  'bruce-banner-brand-new-day': 1.22,
  'emil-blonsky-abomination-2008': 1.22,
  'tony-stark-mark-xlviii-hulkbuster-2-0': 1.22,
  'emil-blonsky-abomination-green': 1.22,

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
  'der-grosse-beschuetzer': 1.22,
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
  'alligator-loki': 0.56,
  'carol-danvers-starforce': 1.05,
  'cassie-lang-ant-man': 0.67,
  'cassie-lang-zivil': 0.77,
  'clint-barton-ronin': 1.1,
  'clint-barton-ronin-unmaskiert': 0.91,
  'cull-obsidian-2014': 1.22,
  'dimitri-smerdyakov': 1.06,
  'ebony-maw-2014': 1.06,
  'elder-beast-2': 1.03,
  'emil-blonsky-abomination': 0.8,
  'emil-blonsky-abomination-she-hulk': 1.22,
  'franklin-richards': 0.71,
  'g-iah-kind': 0.82,
  'g-iah-skrull': 0.98,
  'giganto': 1.22,
  'heimdall-waechterruestung': 1.1,
  'howard-stark': 1.03,
  'jean-grey': 0.96,
  'kazi-kazimierczak': 0.97,
  'kid-loki': 0.85,
  'kidpool': 0.85,
  'landon': 0.7,
  'logan-wolverine-2': 0.88,
  'loki-god-of-stories': 1.18,
  'love': 0.78,
  'ma-gnucci': 0.83,
  'natasha-romanoff-infinity-war': 0.92,
  'parker-robbins-the-hood': 0.96,
  'peter-parker-garfield-1': 0.97,
  'peter-parker-iron-spider': 1.17,
  'peter-parker-selbstgebauter-anzug': 0.76,
  'remy-lebeau-gambit-pose-1-2': 0.93,
  'rocket-guradians-of-the-galaxy': 0.65,
  'rocket-guradians-of-the-galaxy-vol-2': 0.79,
  'rocket-guradians-of-the-galaxy-vol-3': 0.65,
  'rocket-endgame': 0.66,
  'rocket-quantum-suit': 0.66,
  'scorpion-pose-1': 1.22,
  'skaar': 1.22,
  'skurge': 1.1,
  'snow': 0.64,
  'thor-endgame': 0.95,
  'todd-phelps-hulkking': 1.22,
};

/* ---------- Schwebe: leere Fläche unter der Figur ----------

   Ein paar Figuren fliegen, hängen oder schweben. Auf der Seite steht
   jedes Bild unten auf der Bodenlinie, und wer eine davon in die Luft
   heben will, lässt beim Zuschneiden unter ihr leere Fläche stehen.

   Für den Rahmen ist diese Fläche aber Bild wie jede andere: Er misst
   die Datei und nicht die Figur darin, also stünde dieselbe Figur in
   einer höheren Datei kleiner da. FULLSIZE_LIFT sagt deshalb, welcher
   Anteil der Datei unten leer ist. Die Seite rechnet die Datei darüber
   wieder groß, bis die Figur darin ihre Größe hat, und die Schwebe
   kostet keine Körpergröße mehr.

   Die Zahl gehört dem Bild und nicht der Figur, wie FULLSIZE_FIT
   daneben, und sie wird nicht von Hand gepflegt: Das Bildstudio misst
   sie beim Speichern an den durchsichtigen Pixeln der Datei ab. Ohne
   Eintrag gilt 0, dann steht die Figur auf der Bodenlinie.

   Nach oben ist bei 0.9 Schluss, sonst teilte ein Tippfehler durch fast
   Null und blähte die Datei ins Unermessliche. Wirklich begrenzt wird
   die Schwebe ohnehin vom Rahmen: Höher als bis zu seiner Oberkante
   kommt keine Datei, und was darüber hinausginge, macht die Figur wieder
   kleiner statt sie weiter zu heben. */
const FULLSIZE_LIFT = {
  'adam-warlock': 0.081,
  'headpool': 0.5,
};

/* Was am Ende in den Rahmen geht: Körpergröße mal Feinkorrektur. */
function fullsizeScale(file) {
  const wert = (FULLSIZE_SCALE[file] || 1) * (FULLSIZE_FIT[file] || 1);
  return Math.min(1.22, Math.round(wert * 1000) / 1000);
}

/* Der leere Anteil unter der Figur, wie ihn die Seite braucht. */
function fullsizeLift(file) {
  const wert = FULLSIZE_LIFT[file] || 0;
  return Math.max(0, Math.min(0.9, Math.round(wert * 1000) / 1000));
}

/* In data.js heißt jede Figur "Realname / Heldenname". Überschriften
   zeigen den Realnamen, die Rollenzeile darunter die Heldennamen. Steht
   mehr als ein Schrägstrich im Namen, gehört nur der letzte Teil zur
   Rolle: "Marc Spector / Steven Grant / Moon Knight" sind zwei
   bürgerliche Namen und ein Heldenname. Der Zusatz „(angekündigt)“
   gehört zum Film, nicht zur Figur, und fällt hier weg.

   Ein Zusatz in Klammern am Ende benennt dagegen die Variante: die
   Fassung aus einem anderen Universum oder einer anderen Zeit. Er
   gehört zur Person und nicht zur Rolle, sonst stünden zwei Figuren mit
   derselben Überschrift nebeneinander.

   Nennt der Zusatz eine Welt aus CHAR_WORLDS, kommt er als dritte Angabe
   heraus und fällt aus dem Namen. Aus "Maria Rambeau / Captain Marvel
   (Erde-838)" wird die Überschrift "Maria Rambeau", die Rolle "Captain
   Marvel" und die Welt "Erde-838". Jede andere Klammer bleibt am Namen,
   aus "Gamora (2014)" wird "Gamora (2014)". */
const CHAR_ANNOUNCED = / \(angekündigt\)$/;
const CHAR_VARIANT = / (\([^()]+\))$/;

/* ---------- Welten ----------

   Die Klammer am Ende benennt nicht immer dasselbe. Bei „Gamora (2014)“
   ist es eine Zeit, bei „Peter Parker / Spider-Man (Maguire)“ eine
   Besetzung, bei „Christine Palmer (Erde-838)“ dagegen die Welt, aus der
   die Figur stammt.

   Nur die Welt ist eine eigene Angabe. Sie steht auf der Karte in einer
   eigenen Zeile unter dem Namen, statt hinter ihm zu kleben, und sie
   lässt sich im Bild-Studio als eigenes Feld setzen. Zeit und Besetzung
   bleiben am Namen, dort unterscheiden sie zwei Figuren, die sonst gleich
   hießen.

   Ansehen kann man einer Klammer das nicht, „2014“ und „Erde-838“ sehen
   gleich aus. Deshalb steht hier, was als Welt zählt. Das Bild-Studio
   schreibt neue Welten in diese Liste („Welt hinzufügen“ im Namensdialog). */
const CHAR_WORLDS = [
  'Erde-616',
  'Erde-617',
  'Erde-838',
  'Erde-121698',
  'andere Welt',
  'Earth-11542',
  'Earth-66345',
  'Earth-TRN872',
  'Earth-10005',
  'Earth-701306',
  '2014',
];

const CHAR_WORLD_SET = new Set(CHAR_WORLDS);

/* Die Wirklichkeit, in der die Timeline spielt. Sie steht bei keiner
   Figur im Namen, denn wer dort zu Hause ist, muss das nicht dazusagen.
   Erst wo nach Welten sortiert wird, braucht sie ihren Namen, damit die
   Heimat der meisten Figuren nicht als Leerstelle dasteht (siehe den
   Weltfilter in js/characters.js). */
const CHAR_HOME_WORLD = 'Erde-616';

function splitName(name) {
  const clean = name.replace(CHAR_ANNOUNCED, '');
  const variant = clean.match(CHAR_VARIANT);
  const inner = variant ? variant[1].slice(1, -1) : '';
  const world = CHAR_WORLD_SET.has(inner) ? inner : '';
  const rest = variant ? clean.slice(0, -variant[0].length) : clean;
  /* Die Welt kommt heraus, jede andere Klammer bleibt am Namen. */
  const suffix = variant && !world ? ' ' + variant[1] : '';
  /* Der Heldenname steht hinten, deshalb wird am letzten Schrägstrich
     getrennt. Wer wie Marc Spector / Steven Grant zwei bürgerliche Namen
     trägt, behält damit beide im Realnamen, statt den zweiten in die
     Rollenzeile zu verlieren. */
  const cut = rest.lastIndexOf(' / ');
  return cut === -1
    ? { real: rest + suffix, role: '', world }
    : { real: rest.slice(0, cut) + suffix, role: rest.slice(cut + 3), world };
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
