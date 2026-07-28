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
  'Benjamin Poindexter / Bullseye': 'Bullseye',
  'Mac Gargan / Scorpion': 'Scorpion',
  'Baby Groot': 'Groot',
  'Brock Rumlow / Crossbones': 'Crossbones',
  'Bill Foster / Goliath': 'Bill Foster',
  'Bruce Banner / Hulk': 'Bruce Banner',
  'Bruce Banner / Hulk (angekündigt)': 'Bruce Banner',
  'Eric Brooks / Blade': 'Blade',
  'Bucky Barnes / Winter Soldier': 'Bucky Barnes',
  'Carol Danvers / Captain Marvel': 'Carol Danvers',
  'Clint Barton / Hawkeye': 'Clint Barton',
  'Curt Connors / Lizard': 'Curt Connors',
  'Darren Cross / Yellowjacket': 'Darren Cross',
  'Darren Cross / MODOK': 'Darren Cross',
  'Ezekiel Stane / Joe McGillicuddy': 'Ezekiel Stane',
  'Frank Castle / Punisher (angekündigt)': 'Frank Castle / Punisher',
  'Gamora (2014)': 'Gamora',
  'General Thaddeus „Thunderbolt“ Ross': 'Thaddeus Ross',
  'General Thaddeus „Thunderbolt“ Ross / Red Hulk': 'Thaddeus Ross',
  'Hope van Dyne / Wasp': 'Hope van Dyne',
  'James Rhodes / War Machine': 'James Rhodes',
  'Jane Foster / Mighty Thor': 'Jane Foster',
  'John Walker / U.S. Agent': 'John Walker',
  'Li Ching-Lin / Death Dealer': 'Death Dealer',
  'Max Dillon / Electro': 'Electro',
  'Natasha Romanoff / Black Widow': 'Natasha Romanoff',
  'Otto Octavius / Doctor Octopus': 'Doc Ock',
  'Peter Parker (Holland, Maguire & Garfield)': 'Peter Parker',
  'Peter Parker / Spider-Man': 'Peter Parker',
  'Peter Quill / Star-Lord': 'Peter Quill',
  'Riri Williams / Ironheart': 'Riri Williams',
  'Ronan der Ankläger': 'Ronan',
  'Sam Wilson / Captain America': 'Sam Wilson',
  'Sam Wilson / Falcon': 'Sam Wilson',
  'Scott Lang / Ant-Man': 'Scott Lang',
  'Simon Williams / Wonder Man': 'Simon Williams',
  'Stephen Strange / Doctor Strange': 'Stephen Strange',
  'Steve Rogers / Captain America': 'Steve Rogers',
  'Taneleer Tivan / The Collector': 'The Collector',
  "T'Challa / Black Panther": "T'Challa",
  'Tony Stark / Iron Man': 'Tony Stark',
  'Trevor Slattery / Mandarin': 'Trevor Slattery',
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
  'darren-cross': {
    'ant-man-and-the-wasp-quantumania': 'darren-cross-modok',
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
    ['Mark I', 'tony-stark-mark-1'],
    ['Mark II', 'tony-stark-mark-2'],
    ['Mark VI', 'tony-stark-mark-6'],
    ['Mark XIV', 'tony-stark-mark-14'],
    ['Mark 24', 'tony-stark-mark-24'],
    ['Mark 25', 'tony-stark-mark-25'],
    ['Mark 26', 'tony-stark-mark-26'],
    ['Mark 85', 'tony-stark-mark-85'],
    ['Hulkbuster', 'tony-stark-hulkbuster'],
  ],
  'marc-spector-steven-grant-moon-knight': [
    ['Zeremonie', 'marc-spector-steven-grant-moon-knight'],
    ['Moon Knight', 'marc-spector-steven-grant-moon-knight-classic'],
    ['Mr. Knight', 'marc-spector-steven-grant-moon-knight-mr-knight'],
  ],
  'thor': [
    ['Avengers', 'thor'],
    ['Ragnarok', 'thor-ragnarok'],
    ['Infinity War', 'thor-infinity-war'],
    ['Endgame', 'thor-endgame'],
    ['Love and Thunder', 'thor-love-and-thunder'],
  ],
  'bruce-banner': [
    ['Hulk', 'bruce-banner'],
    ['Smart Hulk', 'bruce-banner-smart-hulk'],
    ['Bruce Banner', 'bruce-banner-ruffalo'],
    ['The Incredible Hulk', 'bruce-banner-norton'],
  ],
  'steve-rogers': [
    ['Endgame', 'steve-rogers'],
    ['First Avenger', 'steve-rogers-first-avenger'],
    ['Winter Soldier', 'steve-rogers-winter-soldier'],
  ],
  'bucky-barnes': [
    ['Bucky Barnes', 'bucky-barnes'],
    ['First Avenger', 'bucky-barnes-first-avenger'],
    ['Winter Soldier', 'bucky-barnes-winter-soldier'],
    ['White Wolf', 'bucky-barnes-white-wolf'],
    ['Thunderbolts', 'bucky-barnes-thunderbolts'],
  ],
  'taskmaster': [
    ['Maskiert', 'taskmaster'],
    ['Unmaskiert', 'taskmaster-unmasked'],
  ],
  'natasha-romanoff': [
    ['Black Widow', 'natasha-romanoff'],
    ['Age of Ultron', 'natasha-romanoff-age-of-ultron'],
    ['Ultron (Action)', 'natasha-romanoff-age-of-ultron-action'],
  ],
  'peter-parker': [
    ['Far From Home', 'peter-parker'],
    ['Homecoming', 'peter-parker-homecoming'],
    ['Infinity War', 'peter-parker-infinity-war'],
    ['Iron Spider', 'peter-parker-iron-spider'],
    ['No Way Home', 'peter-parker-no-way-home'],
  ],
  'wanda-maximoff': [
    ['Civil War', 'wanda-maximoff'],
    ['WandaVision', 'wanda-maximoff-wandavision'],
    ['Multiverse of Madness', 'wanda-maximoff-multiverse-of-madness'],
  ],
  'nick-fury': [
    ['Klassisch', 'nick-fury'],
    ['Secret Invasion', 'nick-fury-secret-invasion'],
  ],
  'loki': [
    ['Asgard', 'loki'],
    ['The Avengers', 'loki-avengers'],
    ['The Dark World', 'loki-dark-world'],
    ['Ragnarok', 'loki-ragnarok'],
    ['TVA', 'loki-tva'],
  ],
  'sam-wilson': [
    ['Captain America', 'sam-wilson'],
    ['Falcon', 'sam-wilson-falcon'],
  ],
  'gamora': [
    ['Guardians', 'gamora'],
    ['Kind', 'gamora-kid'],
    ['Vol. 3', 'gamora-vol-3'],
  ],
  'groot': [
    ['Groot', 'groot'],
    ['Baby Groot', 'groot-baby'],
    ['Teenager', 'groot-teenager'],
    ['Vol. 3', 'groot-vol-3'],
  ],
  'carol-danvers': [
    ['Captain Marvel', 'carol-danvers'],
    ['Fliegend', 'carol-danvers-flight'],
    ['The Marvels', 'carol-danvers-the-marvels'],
    ['Starforce', 'carol-danvers-starforce'],
  ],
  'shuri': [
    ['Shuri', 'shuri'],
    ['Panther-Rüstung', 'shuri-panther-armor'],
    ['Black Panther', 'shuri-black-panther'],
    ['Maskiert', 'shuri-black-panther-masked'],
    ['Unmaskiert', 'shuri-black-panther-unmasked'],
  ],
  'thaddeus-ross': [
    ['General Ross', 'thaddeus-ross'],
    ['President', 'thaddeus-ross-president'],
    ['Red Hulk', 'thaddeus-ross-red-hulk'],
  ],
  'riri-williams': [
    ['Riri', 'riri-williams'],
    ['Mark I', 'riri-williams-mark-1'],
    ['Mark II', 'riri-williams-mark-2'],
    ['Mark III', 'riri-williams-mark-3'],
    ['Mark IV', 'riri-williams-mark-4'],
    ['Mark V', 'riri-williams-mark-5'],
    ['Ironheart', 'riri-williams-ironheart'],
  ],
  'matt-murdock-daredevil': [
    ['Daredevil', 'matt-murdock-daredevil'],
    ['Matt Murdock', 'matt-murdock-daredevil-civil'],
    ['Staffel 1', 'matt-murdock-daredevil-season-1'],
    ['Born Again', 'matt-murdock-daredevil-born-again'],
  ],
  'bob-sentry': [
    ['Sentry', 'bob-sentry'],
    ['Void', 'bob-sentry-void'],
  ],
  'gravik': [
    ['Mensch', 'gravik'],
    ['Super-Skrull', 'gravik-super-skrull'],
  ],
  'clint-barton': [
    ['Age of Ultron', 'clint-barton'],
    ['Civil War', 'clint-barton-civil-war'],
  ],
  'john-walker': [
    ['Maskiert', 'john-walker'],
    ['Unmaskiert', 'john-walker-unmasked'],
  ],
  'hope-van-dyne': [
    ['Wasp', 'hope-van-dyne'],
    ['Zivil', 'hope-van-dyne-civil'],
    ['Unmaskiert', 'hope-van-dyne-unmasked'],
    ['Im Flug', 'hope-van-dyne-flight'],
    ['Quantumania', 'hope-van-dyne-quantumania'],
  ],
  'james-rhodes': [
    ['Zivil', 'james-rhodes'],
    ['War Machine', 'james-rhodes-war-machine'],
    ['Endgame', 'james-rhodes-endgame'],
    ['Iron Patriot', 'james-rhodes-iron-patriot'],
  ],
  'samuel-sterns-the-leader': [
    ['Mensch', 'samuel-sterns-the-leader'],
    ['Leader', 'samuel-sterns-the-leader-green'],
  ],
  'scott-lang': [
    ['Unmaskiert', 'scott-lang'],
    ['Visier offen', 'scott-lang-visor'],
    ['Maskiert', 'scott-lang-masked'],
  ],
  'thanos': [
    ['Infinity War', 'thanos'],
    ['Rüstung', 'thanos-armor'],
    ['Endgame', 'thanos-endgame'],
  ],
  'trevor-slattery': [
    ['Mandarin', 'trevor-slattery'],
    ['Shang-Chi', 'trevor-slattery-shang-chi'],
  ],
  'wilson-fisk-kingpin': [
    ['Born Again', 'wilson-fisk-kingpin'],
    ['Weißer Anzug', 'wilson-fisk-kingpin-white'],
  ],
  'yelena-belova': [
    ['Black Widow', 'yelena-belova'],
    ['Thunderbolts', 'yelena-belova-thunderbolts'],
    ['Neuer Anzug', 'yelena-belova-new'],
  ],
  'adrian-toomes-vulture': [
    ['Vulture', 'adrian-toomes-vulture'],
    ['Im Flug', 'adrian-toomes-vulture-flight'],
  ],
  'alexei': [
    ['Maskiert', 'alexei'],
    ['Unmaskiert', 'alexei-unmasked'],
  ],
  'ava-starr': [
    ['Zivil', 'ava-starr'],
    ['Ghost', 'ava-starr-ghost'],
    ['New Avengers', 'ava-starr-new-avengers'],
  ],
  'charles-xavier-professor-x': [
    ['Multiverse of Madness', 'charles-xavier-professor-x'],
    ['Jung', 'charles-xavier-professor-x-young'],
    ['Stehend', 'charles-xavier-professor-x-standing'],
  ],
  'crossbones': [
    ['Brock Rumlow', 'crossbones'],
    ['Crossbones', 'crossbones-civil-war'],
  ],
  'darren-cross': [
    ['Darren Cross', 'darren-cross'],
    ['Yellowjacket', 'darren-cross-suit'],
    ['MODOK', 'darren-cross-modok'],
  ],
  'doc-ock': [
    ['Doc Ock', 'doc-ock'],
    ['Otto Octavius', 'doc-ock-civil'],
  ],
  'electro': [
    ['Electro', 'electro'],
    ['Max Dillon', 'electro-max-dillon'],
    ['Im Kampf', 'electro-fight'],
    ['No Way Home', 'electro-no-way-home'],
  ],
  'emil-blonsky-abomination': [
    ['Mensch', 'emil-blonsky-abomination'],
    ['The Incredible Hulk', 'emil-blonsky-abomination-2008'],
    ['Abomination', 'emil-blonsky-abomination-green'],
  ],
  'erik-killmonger': [
    ['Killmonger', 'erik-killmonger'],
    ['Black Panther', 'erik-killmonger-black-panther'],
  ],
  'green-goblin': [
    ['Norman Osborn', 'green-goblin'],
    ['Rüstung', 'green-goblin-armor'],
    ['Gleiter', 'green-goblin-glider'],
  ],
  'happy-hogan': [
    ['Happy Hogan', 'happy-hogan'],
    ['What If', 'happy-hogan-what-if'],
  ],
  'helmut-zemo': [
    ['Helmut Zemo', 'helmut-zemo'],
    ['Maskiert', 'helmut-zemo-masked'],
    ['Baron Zemo', 'helmut-zemo-baron'],
  ],
  'howard-stark': [
    ['Howard Stark', 'howard-stark'],
    ['Jung', 'howard-stark-young'],
  ],
  'ivan-vanko-whiplash': [
    ['Whiplash', 'ivan-vanko-whiplash'],
    ['Mark II', 'ivan-vanko-whiplash-mark-2'],
  ],
  'jane-foster': [
    ['Jane Foster', 'jane-foster'],
    ['The Dark World', 'jane-foster-dark-world'],
    ['Mighty Thor', 'jane-foster-mighty-thor'],
  ],
  'johann-schmidt-red-skull': [
    ['Johann Schmidt', 'johann-schmidt-red-skull'],
    ['Red Skull', 'johann-schmidt-red-skull-skull'],
  ],
  'logan-wolverine': [
    ['Unmaskiert', 'logan-wolverine'],
    ['Maskiert', 'logan-wolverine-masked'],
  ],
  'm-baku': [
    ['M’Baku', 'm-baku'],
    ['Fellumhang', 'm-baku-fur'],
    ['Man-Ape', 'm-baku-man-ape'],
  ],
  'nakia': [
    ['Nakia', 'nakia'],
    ['Wakanda Forever', 'nakia-wakanda-forever'],
  ],
  'quake': [
    ['Daisy Johnson', 'quake'],
    ['Quake', 'quake-powers'],
  ],
  'quentin-beck-mysterio': [
    ['Mysterio', 'quentin-beck-mysterio'],
    ['Nebelhelm', 'quentin-beck-mysterio-helm'],
  ],
  'shang-chi': [
    ['Shang-Chi', 'shang-chi'],
    ['Zehn Ringe', 'shang-chi-ten-rings'],
  ],
  'simon-williams': [
    ['Wonder Man', 'simon-williams'],
    ['Energie', 'simon-williams-power'],
  ],
  't-challa': [
    ['Black Panther', 't-challa'],
    ['Zivil', 't-challa-civil'],
    ['Unmaskiert', 't-challa-unmasked'],
    ['Kampfhaltung', 't-challa-fight'],
  ],
  'talos': [
    ['Mensch', 'talos'],
    ['Skrull', 'talos-skrull'],
  ],
  'erik-selvig': [
    ['Erik Selvig', 'erik-selvig'],
    ['The Dark World', 'erik-selvig-dark-world'],
  ],
  'janet-van-dyne': [
    ['Janet van Dyne', 'janet-van-dyne'],
    ['Wasp', 'janet-van-dyne-wasp'],
  ],
  'karli-morgenthau': [
    ['Karli Morgenthau', 'karli-morgenthau'],
    ['Maskiert', 'karli-morgenthau-masked'],
  ],
  'rio-vidal': [
    ['Lady Death', 'rio-vidal'],
    ['Grüne Hexe', 'rio-vidal-green-witch'],
  ],
  'bill-foster': [
    ['Bill Foster', 'bill-foster'],
    ['Maskiert', 'bill-foster-masked'],
  ],
  'cull-obsidian': [
    ['Cull Obsidian', 'cull-obsidian'],
    ['Kettenhammer', 'cull-obsidian-hammer'],
  ],
  'kang-der-eroberer': [
    ['Maskiert', 'kang-der-eroberer'],
    ['Unmaskiert', 'kang-der-eroberer-unmasked'],
  ],
  'karl-mordo': [
    ['Doctor Strange', 'karl-mordo'],
    ['Multiverse of Madness', 'karl-mordo-multiverse'],
  ],
  'layla-el-faouly': [
    ['Scarlet Scarab', 'layla-el-faouly'],
    ['Kampfhaltung', 'layla-el-faouly-combat'],
  ],
  'maya-lopez-echo': [
    ['Echo', 'maya-lopez-echo'],
    ['Leder', 'maya-lopez-echo-leather'],
  ],
  'ying-li': [
    ['Ying Li', 'ying-li'],
    ['Zeremonie', 'ying-li-ceremonial'],
  ],
  'curt-connors': [
    ['Curt Connors', 'curt-connors'],
    ['Lizard', 'curt-connors-lizard'],
  ],
  'heimdall': [
    ['Heimdall', 'heimdall'],
    ['Ragnarok', 'heimdall-ragnarok'],
  ],
  'melina-vostokoff': [
    ['Melina Vostokoff', 'melina-vostokoff'],
    ['Widow-Anzug', 'melina-vostokoff-widow'],
  ],
  'obadiah-stane': [
    ['Obadiah Stane', 'obadiah-stane'],
    ['Iron Monger', 'obadiah-stane-iron-monger'],
  ],
  'pepper-potts': [
    ['Rescue', 'pepper-potts'],
    ['Zivil', 'pepper-potts-civil'],
  ],
  'peter-quill': [
    ['Peter Quill', 'peter-quill'],
    ['Maskiert', 'peter-quill-masked'],
  ],
  't-chaka': [
    ['Black Panther', 't-chaka'],
    ['Unmaskiert', 't-chaka-unmasked'],
    ['Zivil', 't-chaka-civil'],
  ],
  'wade-wilson-deadpool': [
    ['Deadpool', 'wade-wilson-deadpool'],
    ['Wade Wilson', 'wade-wilson-deadpool-civil'],
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
  'rocket': 0.64,
  'gamora-kid': 0.72,
  'darren-cross-modok': 0.73,
  'sprite': 0.82,
  'america-chavez': 0.9,

  // Deutlich größer als ein Mensch
  'drax': 1.05,
  'm-baku': 1.05,
  'm-baku-man-ape': 1.08,
  'm-baku-fur': 1.05,
  'corvus-glaive': 1.06,
  'proxima-midnight': 1.05,
  'ebony-maw': 1.06,
  'volstagg': 1.06,
  'groot-teenager': 1.06,
  'tony-stark-mark-1': 1.08,
  'riri-williams-mark-1': 1.05,
  'hank-mccoy-beast': 1.08,
  'ivan-vanko-whiplash-mark-2': 1.1,
  'jennifer-walters-she-hulk': 1.1,
  'ben-grimm-the-thing': 1.12,
  'ronan': 1.12,
  'ultron': 1.15,
  'bill-foster-masked': 1.12,
  'eitri': 1.15,
  'laufey': 1.15,
  'cull-obsidian': 1.2,
  'cull-obsidian-hammer': 1.2,
  'destroyer': 1.16,
  'curt-connors-lizard': 1.16,
  'korg': 1.18,
  'groot': 1.18,
  'groot-vol-3': 1.18,
  'obadiah-stane': 1.2,
  'sandman': 1.2,
  'thanos': 1.2,
  'thanos-armor': 1.2,
  'thanos-endgame': 1.2,
  'tony-stark-hulkbuster': 1.22,
  'bruce-banner-smart-hulk': 1.2,
  'thaddeus-ross-red-hulk': 1.2,
  'happy-hogan-what-if': 1.2,
  'bruce-banner': 1.22,
  'emil-blonsky-abomination-green': 1.22,
  'emil-blonsky-abomination-2008': 1.22,

  // Jenseits jeder Skala, deshalb am oberen Anschlag
  'khonshu': 1.22,
  'galactus': 1.22,
  'surtur': 1.22,
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
