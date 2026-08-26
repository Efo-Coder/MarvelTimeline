/* ---------- Steckbrief und Beziehungen ----------

   Das Fenster rechts im Ganzkörperbild zeigt zu jeder Figur die Angaben,
   die keine Erzählung sind: Herkunft, Spezies, Körpergröße, Zugehörigkeit,
   Status, Kräfte und ihre Verbindungen zu anderen Figuren.

   Geschlüsselt wird nach demselben Slug wie PROFILES, ACTORS und die
   Bilder. Jedes Feld ist einzeln freiwillig: Was fehlt, lässt das Fenster
   weg, statt eine leere Zeile zu zeigen.

     origin   Herkunft als Ort, bei Figuren ohne bekannten Geburtsort die
              Staatsangehörigkeit oder die Welt, aus der sie kommt.
     species  Was die Figur ist, im Filmkanon und nicht im Comic:
              Mensch, Asgardier, Eternal, Skrull, Synthezoid.
     height   Körpergröße in Metern, aus Fuß und Zoll umgerechnet.
     teams    Zugehörigkeiten, die wichtigste zuerst. Aufgelöste bleiben
              stehen, sie gehören zur Figur.
     status   'Am Leben' oder 'Verstorben', gemeint ist der Stand am Ende
              des letzten Auftritts.

   Kräfte stehen hier nicht mehr. Sie standen früher als Stichworte in
   CHAR_FACTS_EXTRA und waren zugleich der Rückfall der Tafel
   „Fähigkeiten“, solange js/powers.js erst einen Teil der Figuren
   führte. Seit dort jede Figur einen ausgeschriebenen Eintrag hat, wäre
   diese Liste eine zweite Liste derselben Namen, die auseinanderläuft.

   Die Datei hat zwei Teile. CHAR_FACTS zwischen den Marken @wiki:anfang
   und @wiki:ende stammt aus den beiden Marvel-Wikis und wird von
   tools/portrait-studio/services/biography/fetch-facts.py und tools/portrait-studio/services/biography/build-facts.py erzeugt: Spezies, Status
   und Zugehörigkeit aus dem MCU-Wiki, Größe und Geburtsort aus der
   Marvel Database (Earth-199999). Von Hand geändert wird dort nichts,
   der nächste Lauf überschriebe es.

   CHAR_FACTS_EXTRA steht daneben und gehört der Handarbeit. Es liegt
   beim Anzeigen über dem Generat, Feld für Feld, und trägt zweierlei:

     - Was die Abfrage nicht gefunden hat. Die Marvel Database führt nur
       zu drei Dutzend Figuren eine Körpergröße, bei Nebenfiguren und
       allem ab Phase Fünf steht dort nichts.
     - Korrekturen an Angaben, die das Wiki ungenau oder auf Englisch
       führt, etwa bei Figuren, deren Spezies eine Redaktionsnotiz war.

   Jede Figur aus data.js hat hier einen Eintrag. Kommt eine neue dazu,
   gehört sie in derselben Reihenfolge dazwischen, in der sie zum ersten
   Mal auftritt.

   Diese Datei gehört nur in characters.html, die Timeline braucht sie
   nicht. */

const CHAR_FACTS = {
  /* @wiki:anfang */
  'steve-rogers': {
    origin: 'Brooklyn, New York City, New York',
    species: 'Mensch',
    height: '1,88 m',
    teams: ['Avengers', 'S.H.I.E.L.D.', 'Howling Commandos', 'SSR'],
    status: 'Am Leben',
  },
  'peggy-carter': {
    origin: 'London, England',
    species: 'Mensch',
    height: '1,70 m',
    teams: ['S.H.I.E.L.D.', 'SSR', 'Special Operations Executive', 'British Army'],
    status: 'Verstorben',
  },
  'bucky-barnes': {
    origin: 'Brooklyn, New York City, New York',
    species: 'Mensch (Cyborg)',
    height: '1,83 m',
    teams: ['New Avengers', 'HYDRA', 'Howling Commandos', '107th Infantry Regiment'],
    status: 'Am Leben',
  },
  'johann-schmidt-red-skull': {
    origin: 'Nazi German',
    species: 'Mensch',
    teams: ['HYDRA', 'Schutzstaffel'],
    status: 'Am Leben',
  },
  'howard-stark': {
    origin: 'Richford, New York',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.', 'Stark Industries', 'SSR', 'Stark Pictures'],
    status: 'Verstorben',
  },
  'abraham-erskine': {
    origin: 'Augsburg, Deutschland',
    species: 'Mensch',
    teams: ['SSR', 'Project Rebirth'],
    status: 'Verstorben',
  },
  'arnim-zola': {
    origin: 'Switzerland',
    species: 'Mensch (früher)',
    teams: ['S.H.I.E.L.D.', 'HYDRA', 'Sturmabteilung', 'Schutzstaffel'],
    status: 'Verstorben',
  },
  'chester-phillips': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.', 'SSR', '107th Infantry Regiment'],
    status: 'Verstorben',
  },
  'carol-danvers': {
    origin: 'USA',
    species: 'Mensch-Kree-Hybrid',
    teams: ['Avengers', 'Sparrows', 'US Air Force', 'Air Force Systems Command'],
    status: 'Am Leben',
  },
  'nick-fury': {
    origin: 'Huntsville, Alabama, USA',
    species: 'Mensch',
    height: '1,91 m',
    teams: ['Avengers Initiative', 'S.H.I.E.L.D.', 'CIA', 'Project P.E.G.A.S.U.S'],
    status: 'Am Leben',
  },
  'talos': {
    species: 'Skrull',
    teams: ['Skrull-Rat', 'Nick Fury\'s Crew'],
    status: 'Verstorben',
  },
  'yon-rogg': {
    origin: 'Hala',
    species: 'Kree',
    height: '1,78 m',
    teams: ['Starforce'],
    status: 'Am Leben',
  },
  'maria-rambeau': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['US Air Force', 'Air Force Systems Command', 'Project P.E.G.A.S.U.S', 'S.W.O.R.D'],
    status: 'Verstorben',
  },
  'goose': {
    species: 'Flerken',
    status: 'Am Leben',
  },
  'supreme-intelligence': {
    origin: 'Hala',
    species: 'Kree-Künstliche Intelligenz',
    teams: ['Kree-Imperium'],
    status: 'Verstorben',
  },
  'phil-coulson': {
    origin: 'USA',
    species: 'Mensch (Cyborg)',
    teams: ['Avengers Initiative', 'S.H.I.E.L.D.', 'Project T.A.H.I.T.I', 'Coulson\'s Team'],
    status: 'Verstorben',
  },
  'ronan': {
    origin: 'Hala',
    species: 'Kree',
    teams: ['Accusers'],
    status: 'Verstorben',
  },
  'tony-stark': {
    origin: 'Manhattan, New York City, New York',
    species: 'Mensch',
    height: '1,75 m',
    teams: ['Avengers', 'S.H.I.E.L.D.', 'Stark Industries', 'Project Insight'],
    status: 'Verstorben',
  },
  'pepper-potts': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Stark Industries'],
    status: 'Am Leben',
  },
  'james-rhodes': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,85 m',
    teams: ['Avengers', 'Stark Industries', 'US Air Force', 'US-Regierung'],
    status: 'Am Leben',
  },
  'obadiah-stane': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,85 m',
    teams: ['Stark Industries'],
    status: 'Verstorben',
  },
  'happy-hogan': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Stark Industries', 'Salvation Army'],
    status: 'Am Leben',
  },
  'raza': {
    origin: 'Afghanistan',
    species: 'Mensch',
    teams: ['Ten Rings'],
    status: 'Am Leben',
  },
  'natasha-romanoff': {
    origin: 'Volgograd, USSR, Russland, Erde',
    species: 'Mensch',
    height: '1,68 m',
    teams: ['Avengers', 'S.H.I.E.L.D.', 'Red Room', 'Black Widows'],
    status: 'Verstorben',
  },
  'ivan-vanko-whiplash': {
    origin: 'Sowjetunion',
    species: 'Mensch',
    teams: ['Hammer Industries'],
    status: 'Verstorben',
  },
  'justin-hammer': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['US-Verteidigungsministerium', 'Hammer Industries'],
    status: 'Am Leben',
  },
  'bruce-banner': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,75 m',
    teams: ['Avengers', 'Revengers', 'Pingo Doce Bottling Plant'],
    status: 'Am Leben',
  },
  'betty-ross': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'thaddeus-ross': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Project Gamma Pulse', 'Strategic Operations Command Center', 'US-Außenministerium', 'US-Regierung'],
    status: 'Am Leben',
  },
  'emil-blonsky-abomination': {
    origin: 'Russland',
    species: 'Mensch',
    height: '1,70 m',
    teams: ['Royal Marines', 'US-Sonderkommando', 'Strategic Operations Command Center', 'Abomaste'],
    status: 'Am Leben',
  },
  'samuel-sterns-the-leader': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'thor': {
    origin: 'Asgard',
    species: 'Asgardier (Cyborg)',
    teams: ['Avengers', 'Guardians of the Galaxy', 'Asgard', 'Revengers'],
    status: 'Am Leben',
  },
  'loki': {
    origin: 'Jötunheim',
    species: 'Frostriese',
    height: '1,88 m',
    teams: ['Asgard', 'Revengers', 'Sakaaran Rebellion'],
    status: 'Verstorben',
  },
  'jane-foster': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.'],
    status: 'Verstorben',
  },
  'odin': {
    origin: 'Asgard',
    species: 'Asgardier',
    teams: ['Asgard', 'Council of Godheads'],
    status: 'Verstorben',
  },
  'heimdall': {
    origin: 'Asgard',
    species: 'Asgardier',
    teams: ['Götter Asgards'],
    status: 'Verstorben',
  },
  'sif': {
    origin: 'Asgard',
    species: 'Asgardier',
    teams: ['Asgardier', 'Thor', 'Krieger der Drei'],
    status: 'Am Leben',
  },
  'fandral': {
    origin: 'Asgard',
    species: 'Asgardier',
    teams: ['Krieger der Drei'],
    status: 'Verstorben',
  },
  'hogun': {
    origin: 'Vanaheim',
    species: 'Vanir',
    teams: ['Krieger der Drei'],
    status: 'Verstorben',
  },
  'volstagg': {
    origin: 'Asgard',
    species: 'Asgardier',
    teams: ['Krieger der Drei'],
    status: 'Verstorben',
  },
  'laufey': {
    origin: 'Jötunheim',
    species: 'Frostriese',
    teams: ['Jötunheim'],
    status: 'Verstorben',
  },
  'destroyer': {
    species: 'Außerirdischer',
    teams: ['Knowhere'],
    status: 'Verstorben',
  },
  'erik-selvig': {
    origin: 'Stockholm, Sweden',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.', 'Project P.E.G.A.S.U.S', 'Science Avengers'],
    status: 'Am Leben',
  },
  'darcy-lewis': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Science Avengers'],
    status: 'Am Leben',
  },
  'clint-barton': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,78 m',
    teams: ['Avengers', 'S.H.I.E.L.D.', 'STRIKE Team: Delta', 'New York City Live Action Role Players'],
    status: 'Am Leben',
  },
  'thanos': {
    origin: 'Titan',
    species: 'Titan',
    teams: ['Black Order', 'Titan Royal Family'],
    status: 'Verstorben',
  },
  'maria-hill': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,73 m',
    teams: ['S.H.I.E.L.D.', 'Stark Industries', 'Nick Fury\'s Crew'],
    status: 'Verstorben',
  },
  'der-andere': {
    status: 'Am Leben',
  },
  'malekith': {
    origin: 'Svartalfheim',
    species: 'Dunkelelf',
    teams: ['Dunkelelfen'],
    status: 'Verstorben',
  },
  'kurse': {
    origin: 'Svartalfheim',
    species: 'Dunkelelf',
    teams: ['Dunkelelfen'],
    status: 'Verstorben',
  },
  'frigga': {
    origin: 'Asgard',
    species: 'Asgardier',
    teams: ['Asgardian Royal Family'],
    status: 'Verstorben',
  },
  'the-collector': {
    species: 'Außerirdischer',
    teams: ['Tivan Group'],
    status: 'Am Leben',
  },
  'aldrich-killian': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['A.I.M'],
    status: 'Verstorben',
  },
  'trevor-slattery': {
    origin: 'Großbritannien',
    species: 'Mensch',
    teams: ['A.I.M', 'Ta Lo Armed Forces'],
    status: 'Am Leben',
  },
  'sam-wilson': {
    origin: 'Delacroix, Louisiana',
    species: 'Mensch',
    teams: ['Avengers', 'Wilson Family Seafood', 'US Air Force', 'Air National Guard'],
    status: 'Am Leben',
  },
  'alexander-pierce': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.', 'HYDRA', 'US-Verteidigungsministerium', 'US-Außenministerium'],
    status: 'Verstorben',
  },
  'crossbones': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,83 m',
    teams: ['HYDRA', 'Project Insight'],
    status: 'Verstorben',
  },
  'wanda-maximoff': {
    origin: 'Sokovia',
    species: 'Mensch',
    teams: ['Avengers', 'HYDRA'],
    status: 'Verstorben',
  },
  'pietro-maximoff': {
    origin: 'Sokovia',
    species: 'Mensch',
    teams: ['Avengers', 'HYDRA'],
    status: 'Verstorben',
  },
  'sharon-carter': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.', 'CIA', 'Joint Terrorism Task Force'],
    status: 'Am Leben',
  },
  'peter-quill': {
    origin: 'USA',
    species: 'Mensch-Celestial Hybrid',
    teams: ['Guardians of the Galaxy', 'Ravagers', 'St. Charles Elementary', 'Yondu Ravager Clan'],
    status: 'Am Leben',
  },
  'gamora': {
    origin: 'Zen-Whoberi',
    species: 'Zehoberei (Cyborg)',
    teams: ['Guardians of the Galaxy'],
    status: 'Verstorben',
  },
  'drax': {
    species: 'Außerirdischer',
    teams: ['Guardians of the Galaxy'],
    status: 'Am Leben',
  },
  'rocket': {
    origin: 'North America, Erde',
    species: 'Halfworlder (evolved raccoon)',
    teams: ['Avengers', 'Guardians of the Galaxy', 'Batch 89'],
    status: 'Am Leben',
  },
  'groot': {
    origin: 'Planet X',
    species: 'Flora Colossus',
    teams: ['Guardians of the Galaxy'],
    status: 'Am Leben',
  },
  'yondu': {
    species: 'Centaurian (Cyborg)',
    height: '1,78 m',
    teams: ['Guardians of the Galaxy', 'Ravagers', 'Stakar Ogord\'s Team', 'Yondu Ravager Clan'],
    status: 'Verstorben',
  },
  'kraglin': {
    origin: 'Xandar',
    species: 'Xandarian',
    status: 'Am Leben',
  },
  'nebula': {
    species: 'Luphomoid (Cyborg)',
    teams: ['Avengers', 'Guardians of the Galaxy'],
    status: 'Am Leben',
  },
  'howard-the-duck': {
    origin: 'Duckworldian',
    species: 'Duckworldian',
    teams: ['Knowhere', 'Fomerly', 'Collector'],
    status: 'Am Leben',
  },
  'eson': {
    species: 'Celestial',
    status: 'Am Leben',
  },
  'ego': {
    species: 'Celestial',
    status: 'Verstorben',
  },
  'mantis': {
    species: 'Celestial Hybrid',
    height: '1,70 m',
    teams: ['Guardians of the Galaxy'],
    status: 'Am Leben',
  },
  'taserface': {
    species: 'Außerirdischer',
    teams: ['Ravagers', 'Yondu Ravager Clan'],
    status: 'Verstorben',
  },
  'stakar-ogord': {
    origin: 'Arcturan',
    species: 'Arcturan',
    teams: ['Ravagers', 'Stakar Ravager Clan', 'Stakar Ogord\'s Team', 'United Ravagers'],
    status: 'Am Leben',
  },
  'krugarr': {
    species: 'Lem',
    teams: ['Ravagers', 'Stakar Ogord\'s Team', 'United Ravagers'],
    status: 'Am Leben',
  },
  'ayesha': {
    species: 'Sovereign',
    status: 'Verstorben',
  },
  'martinex': {
    species: 'Pluvian',
    teams: ['Ravagers', 'Stakar Ravager Clan', 'Stakar Ogord\'s Team', 'United Ravagers'],
    status: 'Am Leben',
  },
  'ultron': {
    species: 'Roboter (früher Künstliche Intelligenz)',
    height: '2,44 m',
    status: 'Verstorben',
  },
  'vision': {
    species: 'Synthezoid',
    teams: ['Avengers'],
    status: 'Verstorben',
  },
  'wolfgang-von-strucker': {
    origin: 'Deutschland',
    species: 'Mensch',
    teams: ['HYDRA', 'Project Destroyer of Worlds'],
    status: 'Verstorben',
  },
  'ulysses-klaue': {
    origin: 'Belgian',
    species: 'Mensch (Cyborg)',
    teams: ['Intelligencia'],
    status: 'Verstorben',
  },
  'laura-barton': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.'],
    status: 'Am Leben',
  },
  'cooper-barton': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'lila-barton': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'scott-lang': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Avengers', 'VistaCorp', 'Baskin-Robbins', 'X-Con Security Consultants'],
    status: 'Am Leben',
  },
  'hank-pym': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.', 'Pym Technologies', 'Project G.O.L.I.A.T.H'],
    status: 'Am Leben',
  },
  'hope-van-dyne': {
    origin: 'San Francisco, California',
    species: 'Mensch',
    teams: ['Pym Technologies', 'Pym van Dyne Foundation'],
    status: 'Am Leben',
  },
  'darren-cross': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Pym Technologies', 'Cross Technologies', 'Kang\'s Empire'],
    status: 'Verstorben',
  },
  'luis': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['X-Con Security Consultants'],
    status: 'Am Leben',
  },
  'cassie-lang': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  't-challa': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['Golden Tribe', 'Tribal Council'],
    status: 'Verstorben',
  },
  'peter-parker': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Avengers', 'Stark Industries'],
    status: 'Am Leben',
  },
  'helmut-zemo': {
    origin: 'Sokovia',
    species: 'Mensch',
    teams: ['Sokovian Armed Forces', 'EKO Scorpion'],
    status: 'Am Leben',
  },
  't-chaka': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['Golden Tribe', 'Tribal Council'],
    status: 'Verstorben',
  },
  'may-parker': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Salvation Army', 'F.E.A.S.T'],
    status: 'Verstorben',
  },
  'everett-ross': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['US Air Force', 'CIA', 'Joint Terrorism Task Force'],
    status: 'Am Leben',
  },
  'yelena-belova': {
    origin: 'Sowjetunion',
    species: 'Mensch',
    teams: ['New Avengers', 'Red Room', 'West Chesapeake Valley Thunderbolts', 'Black Widows'],
    status: 'Am Leben',
  },
  'alexei': {
    species: 'Mensch verstärkt durch Supersoldaten-Serum',
    height: '1,91 m',
    status: 'Am Leben',
  },
  'melina-vostokoff': {
    origin: 'Sowjetunion',
    species: 'Mensch',
    teams: ['Red Room', 'Black Widows'],
    status: 'Am Leben',
  },
  'taskmaster': {
    origin: 'Russland',
    species: 'Mensch (Cyborg)',
    teams: ['Red Room', 'Taskmaster Protocol', 'O.X.E'],
    status: 'Verstorben',
  },
  'general-dreykov': {
    origin: 'Sowjetunion',
    species: 'Mensch',
    teams: ['Red Room', 'Soviet Armed Forces'],
    status: 'Verstorben',
  },
  'rick-mason': {
    origin: 'Großbritannien',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'erik-killmonger': {
    origin: 'Oakland, California',
    species: 'Mensch',
    teams: ['US Navy', 'Navy SEALs', 'Golden Tribe', 'Tribal Council'],
    status: 'Verstorben',
  },
  'shuri': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['Wakandan Design Group', 'Wakandan International Outreach Centre', 'Golden Tribe'],
    status: 'Am Leben',
  },
  'okoye': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['Avengers', 'Dora Milaje', 'Border Tribe', 'Midnight Angels'],
    status: 'Am Leben',
  },
  'nakia': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['Wakandan International Outreach Centre', 'River Tribe', 'War Dogs'],
    status: 'Am Leben',
  },
  'm-baku': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['Jabari Tribe', 'Tribal Council'],
    status: 'Am Leben',
  },
  'w-kabi': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['Border Tribe', 'Tribal Council'],
    status: 'Am Leben',
  },
  'zuri': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['War Dogs'],
    status: 'Verstorben',
  },
  'koenigin-ramonda': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['River Tribe', 'Golden Tribe', 'Tribal Council'],
    status: 'Verstorben',
  },
  'adrian-toomes-vulture': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Bestman Salvage', 'Adrian Toomes\' Crew'],
    status: 'Am Leben',
  },
  'scorpion': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,68 m',
    status: 'Am Leben',
  },
  'ned-leeds': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Spidey Tracker'],
    status: 'Am Leben',
  },
  'michelle-jones-watson': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Peter Pan Donut & Pastry Shop'],
    status: 'Am Leben',
  },
  'shocker': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Bestman Salvage', 'Adrian Toomes\' Crew'],
    status: 'Am Leben',
  },
  'stephen-strange': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Masters of the Mystic Arts'],
    status: 'Am Leben',
  },
  'the-ancient-one': {
    origin: 'Nepal',
    species: 'Mensch',
    teams: ['Masters of the Mystic Arts'],
    status: 'Verstorben',
  },
  'karl-mordo': {
    origin: 'Großbritannien',
    species: 'Mensch',
    teams: ['Masters of the Mystic Arts'],
    status: 'Am Leben',
  },
  'wong': {
    origin: 'Nepal',
    species: 'Mensch',
    teams: ['Masters of the Mystic Arts', 'Target Corporation'],
    status: 'Am Leben',
  },
  'kaecilius': {
    origin: 'Copenhagen, Denmark',
    species: 'Mindless One (früher Mensch)',
    teams: ['Masters of the Mystic Arts', 'Zealots'],
    status: 'Am Leben',
  },
  'dormammu': {
    origin: 'Dark Dimension',
    species: 'Faltine',
    teams: ['Zealots'],
    status: 'Am Leben',
  },
  'christine-palmer': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'hela': {
    origin: 'Asgard',
    species: 'Asgardier',
    teams: ['Asgard', 'Berserkers'],
    status: 'Verstorben',
  },
  'valkyrie': {
    origin: 'City of Asgard, Asgard',
    species: 'Asgardier',
    teams: ['Revengers', 'Valkyrie', 'Sakaaran Scrappers'],
    status: 'Am Leben',
  },
  'grandmaster': {
    origin: 'Sakaar',
    species: 'Außerirdischer',
    status: 'Am Leben',
  },
  'skurge': {
    origin: 'Asgard',
    species: 'Asgardier',
    teams: ['Executioner of Hela'],
    status: 'Verstorben',
  },
  'surtur': {
    origin: 'Muspelheim',
    species: 'Fire Dämon',
    status: 'Verstorben',
  },
  'korg': {
    origin: 'Sakaar',
    species: 'Kronan',
    status: 'Am Leben',
  },
  'janet-van-dyne': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.', 'Freedom Fighters'],
    status: 'Am Leben',
  },
  'ava-starr': {
    species: 'Mensch',
    height: '1,73 m',
    teams: ['New Avengers', 'S.H.I.E.L.D.', 'O.X.E'],
    status: 'Am Leben',
  },
  'bill-foster': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.', 'Project G.O.L.I.A.T.H'],
    status: 'Am Leben',
  },
  'ebony-maw': {
    teams: ['Black Order'],
    status: 'Verstorben',
  },
  'corvus-glaive': {
    species: 'Außerirdischer',
    teams: ['Black Order'],
    status: 'Verstorben',
  },
  'proxima-midnight': {
    species: 'Außerirdischer',
    teams: ['Black Order'],
    status: 'Verstorben',
  },
  'cull-obsidian': {
    teams: ['Black Order'],
    status: 'Verstorben',
  },
  'eitri': {
    species: 'Dwarf',
    teams: ['Dwarves of Nidavellir'],
    status: 'Am Leben',
  },
  'sylvie': {
    origin: 'Jötunheim',
    species: 'Frostriese',
    teams: ['Asgardian Royal Family', 'McDonald\'s Corporation'],
    status: 'Am Leben',
  },
  'mobius': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Time Variance Authority'],
    status: 'Am Leben',
  },
  'ravonna-renslayer': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Time Variance Authority', 'Minutemen', 'Judges\' Council'],
    status: 'Am Leben',
  },
  'hunter-b-15': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Time Variance Authority', 'Minutemen'],
    status: 'Am Leben',
  },
  'miss-minutes': {
    species: 'Roboter',
    status: 'Am Leben',
  },
  'der-da-bleibt': {
    status: 'Am Leben',
  },
  'throg': {
    origin: 'Asgard',
    species: 'Asgardier/',
    status: 'Am Leben',
  },
  'alioth': {
    status: 'Am Leben',
  },
  'white-vision': {
    species: 'Synthezoid',
    teams: ['S.W.O.R.D'],
    status: 'Am Leben',
  },
  'agatha-harkness': {
    origin: 'England',
    species: 'Mensch Ghost',
    teams: ['Salemites', 'Agatha Harkness\' Coven'],
    status: 'Verstorben',
  },
  'monica-rambeau': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.W.O.R.D', 'S.A.B.E.R', 'Marvels'],
    status: 'Am Leben',
  },
  'jimmy-woo': {
    origin: 'Bakersfield, California',
    species: 'Mensch',
    teams: ['S.H.I.E.L.D.', 'FBI'],
    status: 'Am Leben',
  },
  'billy-maximoff-wiccan': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Hokey Pokey Bowl', 'Agatha Harkness\' Coven'],
    status: 'Am Leben',
  },
  'mrs-hart': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Westview Historical Society', 'Agatha Harkness\' Coven'],
    status: 'Verstorben',
  },
  'shang-chi': {
    origin: 'China',
    species: 'Mensch',
    teams: ['Ten Rings', 'Fairmont San Francisco', 'Ta Lo Armed Forces'],
    status: 'Am Leben',
  },
  'katy': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Fairmont San Francisco', 'Ta Lo Armed Forces'],
    status: 'Am Leben',
  },
  'wenwu-mandarin': {
    origin: 'China',
    species: 'Mensch',
    teams: ['Ten Rings'],
    status: 'Verstorben',
  },
  'xialing': {
    origin: 'China',
    species: 'Mensch',
    teams: ['Ten Rings', 'Golden Daggers Club', 'Ta Lo Armed Forces'],
    status: 'Am Leben',
  },
  'razor-fist': {
    origin: 'Rumänien',
    species: 'Mensch (Cyborg)',
    teams: ['Ten Rings'],
    status: 'Am Leben',
  },
  'ying-li': {
    origin: 'Ta Lo',
    species: 'Mensch',
    status: 'Verstorben',
  },
  'ying-nan': {
    species: 'Mensch',
    teams: ['Ta Lo Armed Forces'],
    status: 'Am Leben',
  },
  'death-dealer': {
    origin: 'China',
    species: 'Mensch',
    teams: ['Ten Rings'],
    status: 'Verstorben',
  },
  'morris': {
    origin: 'Ta Lo',
    species: 'Dijiang',
    teams: ['Ta Lo', 'Trevor Slattery'],
    status: 'Am Leben',
  },
  'john-walker': {
    origin: 'Custer\'s Grove, Georgia',
    species: 'Mensch',
    height: '1,85 m',
    teams: ['New Avengers', '75th Ranger Regiment', 'US-Verteidigungsministerium', 'Global Repatriation Council'],
    status: 'Am Leben',
  },
  'karli-morgenthau': {
    origin: 'Großbritannien',
    species: 'Mensch',
    teams: ['Flag Smashers'],
    status: 'Verstorben',
  },
  'isaiah-bradley': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,85 m',
    status: 'Am Leben',
  },
  'joaquin-torres-falcon': {
    origin: 'Miami, Florida',
    species: 'Mensch',
    teams: ['US Air Force', '547th Intelligence Squadron'],
    status: 'Am Leben',
  },
  'valentina-allegra-de-fontaine': {
    origin: 'Italien',
    species: 'Mensch',
    teams: ['O.X.E', 'CIA'],
    status: 'Am Leben',
  },
  'quentin-beck-mysterio': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Stark Industries', 'Quentin Beck\'s Crew'],
    status: 'Verstorben',
  },
  'j-jonah-jameson': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['The Daily Bugle'],
    status: 'Am Leben',
  },
  'sersi': {
    origin: 'World Forge',
    species: 'Eternal',
    teams: ['Natural History Museum'],
    status: 'Am Leben',
  },
  'ikaris': {
    origin: 'World Forge',
    species: 'Eternal',
    teams: ['Eternals of Earth'],
    status: 'Verstorben',
  },
  'thena': {
    origin: 'World Forge',
    species: 'Eternal',
    teams: ['Eternals of Earth'],
    status: 'Am Leben',
  },
  'kingo': {
    origin: 'World Forge',
    species: 'Eternal',
    teams: ['Eternals of Earth'],
    status: 'Am Leben',
  },
  'sprite': {
    origin: 'World Forge',
    species: 'Mensch (früher Eternal)',
    teams: ['Eternals of Earth'],
    status: 'Am Leben',
  },
  'druig': {
    origin: 'World Forge',
    species: 'Eternal',
    teams: ['Eternals of Earth'],
    status: 'Am Leben',
  },
  'makkari': {
    origin: 'World Forge',
    species: 'Eternal',
    teams: ['Eternals of Earth'],
    status: 'Am Leben',
  },
  'phastos': {
    origin: 'World Forge',
    species: 'Eternal',
    teams: ['Eternals of Earth'],
    status: 'Am Leben',
  },
  'ajak': {
    origin: 'World Forge',
    species: 'Eternal',
    teams: ['Arishem the Judge'],
    status: 'Verstorben',
  },
  'gilgamesh': {
    origin: 'World Forge',
    species: 'Eternal',
    teams: ['Eternals of Earth'],
    status: 'Verstorben',
  },
  'kro': {
    species: 'Deviant',
    teams: ['Deviant'],
    status: 'Verstorben',
  },
  'arishem': {
    species: 'Celestial',
    teams: ['Celestials'],
    status: 'Am Leben',
  },
  'tiamut': {
    species: 'Celestial',
    status: 'Verstorben',
  },
  'nezarr': {
    species: 'Celestial',
    status: 'Am Leben',
  },
  'eros-starfox': {
    origin: 'Titan',
    species: 'Eternal',
    teams: ['Titan Royal Family'],
    status: 'Am Leben',
  },
  'jemiah': {
    species: 'Celestial',
    status: 'Am Leben',
  },
  'green-goblin': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'doc-ock': {
    origin: 'USA',
    species: 'Mensch (Cyborg)',
    status: 'Am Leben',
  },
  'electro': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'curt-connors': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'sandman': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'matt-murdock-daredevil': {
    origin: 'New York City, New York',
    species: 'Mensch',
    height: '1,78 m',
    teams: ['Defenders', 'Landman and Zack', 'Nelson and Murdock', 'Nelson, Murdock & Page'],
    status: 'Am Leben',
  },
  'america-chavez': {
    origin: 'Utopian Parallel',
    species: 'Fuertona',
    teams: ['Masters of the Mystic Arts'],
    status: 'Am Leben',
  },
  'charles-xavier-professor-x': {
    origin: 'USA',
    species: 'Mutant',
    teams: ['X-Men'],
    status: 'Am Leben',
  },
  'reed-richards-mister-fantastic': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Fantastic Four', 'ReedTech', 'American National Space Agency', 'Future Foundation'],
    status: 'Am Leben',
  },
  'black-bolt': {
    origin: 'Attilan',
    species: 'Inhuman',
    teams: ['Inhuman Royal Family'],
    status: 'Am Leben',
  },
  'clea': {
    origin: 'Dark Dimension',
    species: 'Dark Dimensional sorceress',
    status: 'Am Leben',
  },
  'rintrah': {
    species: 'R\'Vaalian',
    teams: ['Masters of the Mystic Arts'],
    status: 'Am Leben',
  },
  'kate-bishop': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Bishop Security'],
    status: 'Am Leben',
  },
  'maya-lopez-echo': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Choctaw', 'Tracksuit Mafia'],
    status: 'Am Leben',
  },
  'wilson-fisk-kingpin': {
    origin: 'Hell\'s Kitchen, New York City, New York',
    species: 'Mensch',
    teams: ['Tracksuit Mafia', 'Union Allied Construction', 'Confederated Global Investments', 'Better Tomorrow Initiative'],
    status: 'Am Leben',
  },
  'eleanor-bishop': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Bishop Security'],
    status: 'Am Leben',
  },
  'jack-duquesne': {
    origin: 'French',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'kazi-kazimierczak': {
    origin: 'Polish',
    species: 'Mensch',
    teams: ['Tracksuit Mafia', 'Sloan Limited'],
    status: 'Verstorben',
  },
  'nathaniel-barton': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'william-lopez': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Choctaw', 'Tracksuit Mafia'],
    status: 'Verstorben',
  },
  'ivan-banionis': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Tracksuit Mafia'],
    status: 'Am Leben',
  },
  'tomas': {
    origin: 'Polish',
    species: 'Mensch',
    teams: ['Tracksuit Mafia'],
    status: 'Am Leben',
  },
  'enrique': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Tracksuit Mafia'],
    status: 'Am Leben',
  },
  'dmitri': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Tracksuit Mafia'],
    status: 'Am Leben',
  },
  'grills': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Fire Department of New York City', 'New York City Live Action Role Players'],
    status: 'Am Leben',
  },
  'wendy-conrad': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Polizei New York', 'New York City Live Action Role Players'],
    status: 'Am Leben',
  },
  'lucky': {
    species: 'Hund',
    status: 'Am Leben',
  },
  'wade-wilson-deadpool': {
    origin: 'Kanada',
    species: 'Mutant',
    teams: ['X-Men', 'Time Variance Authority', 'Drive Max', 'Widerstand'],
    status: 'Am Leben',
  },
  'logan-wolverine': {
    origin: 'Kanada',
    species: 'Mutant',
    teams: ['X-Men', 'Widerstand'],
    status: 'Am Leben',
  },
  'cassandra-nova': {
    species: 'Mutant',
    teams: ['Cassandra Nova\'s Henchmen'],
    status: 'Verstorben',
  },
  'mr-paradox': {
    species: 'Mensch',
    teams: ['Time Variance Authority', 'Mr. Paradox\'s Crew'],
    status: 'Am Leben',
  },
  'dogpool': {
    species: 'Hund',
    teams: ['Deadpool Corps'],
    status: 'Am Leben',
  },
  'blade': {
    species: 'Mensch-Vampir Hybrid',
    status: 'Am Leben',
  },
  'remy-lebeau-gambit': {
    species: 'Mutant',
    teams: ['Widerstand'],
    status: 'Am Leben',
  },
  'juggernaut': {
    origin: 'USA',
    species: 'Mutant',
    teams: ['Cassandra Nova\'s Henchmen'],
    status: 'Verstorben',
  },
  'toad': {
    species: 'Mutant',
    teams: ['Cassandra Nova\'s Henchmen'],
    status: 'Verstorben',
  },
  'azazel': {
    species: 'Mutant',
    teams: ['Cassandra Nova\'s Henchmen'],
    status: 'Verstorben',
  },
  'colossus': {
    origin: 'Sowjetunion',
    species: 'Mutant',
    teams: ['X-Men'],
    status: 'Am Leben',
  },
  'marc-spector-steven-grant-moon-knight': {
    origin: 'Chicago, Illinois, USA',
    species: 'Mensch',
    teams: ['US Marine Corps', 'National Art Gallery'],
    status: 'Am Leben',
  },
  'layla-el-faouly': {
    origin: 'Ägypten',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'arthur-harrow': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Disciples of Ammit'],
    status: 'Verstorben',
  },
  'khonshu': {
    species: 'Ennead',
    teams: ['Ennead Council'],
    status: 'Am Leben',
  },
  'ammit': {
    species: 'Ennead',
    teams: ['Ennead Council'],
    status: 'Verstorben',
  },
  'kamala-khan-ms-marvel': {
    origin: 'USA',
    species: 'Mutant Hybrid',
    teams: ['Sloth Baby Productions', 'Marvels'],
    status: 'Am Leben',
  },
  'bruno-carrelli': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Circle Q'],
    status: 'Am Leben',
  },
  'nakia-bahadir': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Islamic Masjid of Jersey City'],
    status: 'Am Leben',
  },
  'kamran': {
    origin: 'Großbritannien',
    species: 'Mensch Hybrid',
    teams: ['Clandestines'],
    status: 'Am Leben',
  },
  'muneeba-khan': {
    origin: 'Karachi, Pakistan',
    species: 'Mensch Hybrid',
    status: 'Am Leben',
  },
  'aamir-khan': {
    origin: 'Pakistan',
    species: 'Mensch Hybrid',
    status: 'Am Leben',
  },
  'sana-ali': {
    origin: 'British Indian',
    species: 'Mensch Hybrid',
    status: 'Am Leben',
  },
  'gorr': {
    origin: 'unbekannte Welt',
    species: 'Unidentified Außerirdischer',
    status: 'Verstorben',
  },
  'zeus': {
    species: 'Olympier',
    teams: ['Council of Godheads'],
    status: 'Am Leben',
  },
  'hercules': {
    species: 'Olympier',
    status: 'Am Leben',
  },
  'love': {
    origin: 'unbekannte Welt',
    species: 'Kosmische Entität Hybrid',
    status: 'Am Leben',
  },
  'jennifer-walters-she-hulk': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['UCLA', 'Los Angeles County District Attorney\'s Office', 'Goodman, Lieber, Kurtzberg & Holliway', 'Abomaste'],
    status: 'Am Leben',
  },
  'nikki-ramos': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Los Angeles County District Attorney\'s Office', 'Goodman, Lieber, Kurtzberg & Holliway'],
    status: 'Am Leben',
  },
  'titania': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Titania Worldwide'],
    status: 'Am Leben',
  },
  'piledriver': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Wrecking Crew', 'Intelligencia'],
    status: 'Am Leben',
  },
  'namor': {
    origin: 'Talokan',
    species: 'Talokanil Mutant',
    teams: ['Talokan'],
    status: 'Am Leben',
  },
  'riri-williams': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Hood\'s Gang'],
    status: 'Am Leben',
  },
  'ouroboros-o-b': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Time Variance Authority'],
    status: 'Am Leben',
  },
  'victor-timely': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'kang-der-eroberer': {
    species: 'Mensch',
    teams: ['Council of Kangs', 'Kang\'s Empire'],
    status: 'Verstorben',
  },
  'rama-tut': {
    origin: 'Ancient Egyptian',
    species: 'Mensch',
    teams: ['Council of Kangs'],
    status: 'Am Leben',
  },
  'veb': {
    teams: ['Freedom Fighters'],
    status: 'Am Leben',
  },
  'high-evolutionary': {
    species: 'Cyborg',
    teams: ['OrgoCorp'],
    status: 'Am Leben',
  },
  'adam-warlock': {
    species: 'Sovereign',
    teams: ['Guardians of the Galaxy'],
    status: 'Am Leben',
  },
  'cosmo': {
    origin: 'Russland',
    species: 'Hund',
    teams: ['Guardians of the Galaxy'],
    status: 'Am Leben',
  },
  'lylla': {
    origin: 'Erde',
    species: 'Halfworlder (Evolved )',
    teams: ['Batch 89'],
    status: 'Verstorben',
  },
  'teefs': {
    origin: 'Erde',
    species: 'Halfworlder (Evolved )',
    teams: ['Batch 89'],
    status: 'Verstorben',
  },
  'floor': {
    origin: 'Erde',
    species: 'Halfworlder (Evolved Rabbit)',
    teams: ['Batch 89'],
    status: 'Verstorben',
  },
  'phyla-vell': {
    species: 'Star Child (evolved Fish)',
    teams: ['Guardians of the Galaxy'],
    status: 'Am Leben',
  },
  'gravik': {
    species: 'Skrull',
    teams: ['Skrull Resistance', 'Skrull-Rat'],
    status: 'Verstorben',
  },
  'g-iah': {
    origin: 'Mar-Vell\'s Laboratory, Earth Orbit',
    species: 'Skrull',
    teams: ['Skrull Resistance'],
    status: 'Am Leben',
  },
  'sonya-falsworth': {
    origin: 'Großbritannien',
    species: 'Mensch',
    teams: ['MI6'],
    status: 'Am Leben',
  },
  'praesident-james-ritson': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['US-Regierung', 'US-Streitkräfte'],
    status: 'Am Leben',
  },
  'chula': {
    origin: 'Choctaw Nation of Oklahoma',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'bonnie': {
    origin: 'Choctaw Nation of Oklahoma',
    species: 'Mensch',
    teams: ['Choctaw', 'Tamaha Fire Department'],
    status: 'Am Leben',
  },
  'henry-lopez': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Choctaw', 'Fisk Shipping', 'Black Crow\'s SkateLife'],
    status: 'Am Leben',
  },
  'dar-benn': {
    origin: 'Hala',
    species: 'Kree',
    teams: ['Starforce', 'Accusers'],
    status: 'Verstorben',
  },
  'hank-mccoy-beast': {
    origin: 'USA',
    species: 'Mutant',
    teams: ['X-Men'],
    status: 'Am Leben',
  },
  'rio-vidal': {
    species: 'Kosmische Entität',
    status: 'Am Leben',
  },
  'lilia-calderu': {
    origin: 'Sizilien',
    species: 'Mensch',
    teams: ['Lilia Calderu\'s Coven', 'Madame Calderu\'s Psychic Readings', 'Lilia\'s Leggings', 'Agatha Harkness\' Coven'],
    status: 'Verstorben',
  },
  'jennifer-kale': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Kale Kare', 'Agatha Harkness\' Coven'],
    status: 'Am Leben',
  },
  'alice-wu-gulliver': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Eastview Police Department', 'Westview Shopping Mall Security', 'Agatha Harkness\' Coven'],
    status: 'Verstorben',
  },
  'bullseye': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Lyndhurst Home for Boys', 'Brooklyn Suicide Prevention Center', 'FBI', 'CIA'],
    status: 'Am Leben',
  },
  'frank-castle-punisher': {
    origin: 'Queens, New York City, New York',
    species: 'Mensch',
    teams: ['US Marine Corps', 'Cerberus Squad', 'New York Veteran Support Group'],
    status: 'Am Leben',
  },
  'vanessa-fisk': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Scene Contempo Gallery', 'Five Families'],
    status: 'Verstorben',
  },
  'muse': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Verstorben',
  },
  'karen-page': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Penny\'s Place', 'Union Allied Construction', 'Nelson and Murdock', 'New York Bulletin'],
    status: 'Am Leben',
  },
  'connor-powell': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,78 m',
    teams: ['Polizei New York', 'Anti-Vigilante Task Force'],
    status: 'Am Leben',
  },
  'cole-north': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Chicago Police Department', 'Polizei New York', 'Anti-Vigilante Task Force'],
    status: 'Am Leben',
  },
  'white-tiger': {
    origin: 'Puerto Rico',
    species: 'Mensch',
    status: 'Verstorben',
  },
  'parker-robbins-the-hood': {
    origin: 'USA',
    species: 'Mensch',
    height: '1,75 m',
    teams: ['Hood\'s Gang'],
    status: 'Am Leben',
  },
  'n-a-t-a-l-i-e': {
    species: 'Mensch',
    status: 'Am Leben',
  },
  'ezekiel-stane': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'mephisto': {
    species: 'Dämon',
    teams: ['Riri Williams', 'Parker Robbins', 'Ringo Starr', '100 of \' "100 Richest" list'],
    status: 'Am Leben',
  },
  'bob-sentry': {
    origin: 'Sarasota, Florida',
    species: 'Mensch verändert durch das Project Sentry serum',
    status: 'Am Leben',
  },
  'sue-storm-invisible-woman': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Fantastic Four', 'American National Space Agency', 'Future Foundation'],
    status: 'Am Leben',
  },
  'johnny-storm-human-torch': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Fantastic Four', 'Boy Scouts of America', 'American National Space Agency', 'Future Foundation'],
    status: 'Am Leben',
  },
  'ben-grimm-the-thing': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Fantastic Four', 'US Air Force', 'American National Space Agency', 'Future Foundation'],
    status: 'Am Leben',
  },
  'galactus': {
    species: 'Taa-an',
    status: 'Am Leben',
  },
  'silver-surfer': {
    species: 'Zenn-Lavian',
    status: 'Am Leben',
  },
  'doctor-doom': {
    origin: 'Latveria',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'h-e-r-b-i-e': {
    status: 'Am Leben',
  },
  'simon-williams': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'regisseur-von-kovak': {
    species: 'Mensch',
    status: 'Am Leben',
  },
  'jessica-jones': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Defenders', 'Alias Investigations', 'Daredevil\'s Army'],
    status: 'Am Leben',
  },
  'elektra': {
    origin: 'Griechenland, gekappte Zeitlinie',
    species: 'Mensch',
    height: '1,70 m',
    teams: ['Widerstand im Void', 'Chaste'],
    status: 'Am Leben',
  },
  'jocasta-angekuendigt': {
    species: 'Roboter',
    status: 'Am Leben',
  },
  'e-d-i-t-h': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'erik-lehnsherr-magneto': {
    origin: 'Deutschland',
    species: 'Mutant',
    teams: ['X-Men'],
    status: 'Am Leben',
  },
  'scott-summers-cyclops': {
    origin: 'USA',
    species: 'Mutant',
    teams: ['X-Men'],
    status: 'Am Leben',
  },
  'raven-darkhoelme-mystique': {
    origin: 'USA',
    species: 'Mutant',
    teams: ['X-Men'],
    status: 'Am Leben',
  },
  'kurt-wagner-nightcrawler': {
    origin: 'Deutschland',
    species: 'Mutant',
    teams: ['X-Men'],
    status: 'Am Leben',
  },
  /* @wiki:ende */
};

/* Ergänzungen und Korrekturen von Hand. Ein Feld hier gilt, auch wenn
   das Wiki oben etwas anderes sagt. */
const CHAR_FACTS_EXTRA = {
  /* ---------- Phase One ---------- */
  'steve-rogers': {
    species: 'Mensch, verstärkt durch das Supersoldaten-Serum',
  },
  'peggy-carter': {},
  'peggy-carter-838': {
    origin: 'Erde-838',
    species: 'Mensch, verstärkt durch das Supersoldaten-Serum',
    teams: ['Illuminati', 'Avengers'],
    status: 'Verstorben',
  },
  'bucky-barnes': {},
  'johann-schmidt-red-skull': {
    origin: 'Deutschland',
    species: 'Mensch, verstärkt durch das Supersoldaten-Serum',
    height: '1,88 m',
  },
  'howard-stark': {
    height: '1,80 m',
  },
  'abraham-erskine': {
    height: '1,78 m',
  },
  'carol-danvers': {
    height: '1,68 m',
  },
  'nick-fury': {},
  'talos': {
    origin: 'Skrullos',
    height: '1,80 m',
  },
  'yon-rogg': {},
  'maria-rambeau': {
    height: '1,78 m',
  },
  'maria-rambeau-838': {
    origin: 'Erde-838',
    species: 'Mensch-Kree-Hybrid',
    teams: ['Illuminati'],
    status: 'Verstorben',
    height: '1,78 m',
  },
  'maria-rambeau-binary': {
    origin: 'andere Welt',
    species: 'Mensch',
    status: 'Am Leben',
    height: '1,78 m',
  },
  'goose': {
    origin: 'unbekannte Welt',
    teams: ['Mar-Vells Labor', 'S.H.I.E.L.D.'],
    height: '0,25 m',
  },
  'supreme-intelligence': {
    species: 'Künstliche Intelligenz der Kree',
  },
  'tony-stark': {},
  'pepper-potts': {
    height: '1,75 m',
  },
  'james-rhodes': {},
  'obadiah-stane': {},
  'happy-hogan': {
    teams: ['Stark Industries'],
    height: '1,78 m',
  },
  'phil-coulson': {
    origin: 'Manitowoc, Wisconsin',
    height: '1,83 m',
  },
  'raza': {
    height: '1,80 m',
  },
  'ivan-vanko-whiplash': {
    height: '1,80 m',
  },
  'justin-hammer': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Hammer Industries', 'Verteidigungsministerium'],
    status: 'Am Leben',
  },
  'betty-ross': {
    height: '1,75 m',
    teams: ['Culver University'],
  },
  'thaddeus-ross': {
    height: '1,85 m',
  },
  'emil-blonsky-abomination': {
    species: 'Mensch, verstärkt durch Serum und Gammastrahlung',
  },
  'samuel-sterns-the-leader': {
    height: '1,73 m',
    teams: ['Culver University'],
  },
  'bruce-banner': {
    teams: ['Avengers', 'Revengers'],
    species: 'Mensch, durch Gammastrahlung verwandelt',
  },
  'thor': {
    height: '1,90 m',
  },
  'loki': {},
  'jane-foster': {
    height: '1,60 m',
  },
  'odin': {
    height: '1,83 m',
  },
  'heimdall': {
    teams: ['Asgard', 'Wächter des Bifröst'],
    height: '1,93 m',
  },
  'sif': {
    teams: ['Asgard', 'Asgardische Armee'],
    height: '1,73 m',
  },
  'fandral': {
    height: '1,85 m',
  },
  'hogun': {
    height: '1,75 m',
  },
  'volstagg': {
    height: '1,93 m',
  },
  'laufey': {
    height: '2,13 m',
  },
  'destroyer': {
    species: 'Asgardischer Konstrukt',
    origin: 'Asgard',
    height: '2,90 m',
  },
  'erik-selvig': {
    height: '1,80 m',
  },
  'natasha-romanoff': {},
  'clint-barton': {},
  'thanos': {
    height: '2,49 m',
  },
  'thanos-2014': {
    origin: 'Titan',
    species: 'Titan',
    teams: ['Black Order'],
    status: 'Verstorben',
    height: '2,49 m',
  },
  'maria-hill': {},

  /* ---------- Phase Two ---------- */
  'malekith': {
    height: '1,88 m',
  },
  'frigga': {
    height: '1,73 m',
  },
  'the-collector': {
    origin: 'Knowhere',
    height: '1,80 m',
  },
  'aldrich-killian': {
    height: '1,88 m',
  },
  'trevor-slattery': {
    origin: 'Liverpool, England',
    height: '1,73 m',
  },
  'sam-wilson': {
    height: '1,83 m',
  },
  'alexander-pierce': {
    height: '1,85 m',
  },
  'crossbones': {
    height: '1,83 m',
  },
  'pietro-maximoff': {
    species: 'Mensch, verändert durch den Zepterstein',
    height: '1,88 m',
  },
  'wanda-maximoff': {
    height: '1,68 m',
  },
  'wanda-maximoff-838': {
    origin: 'Erde-838',
    species: 'Mensch',
    teams: ['Avengers'],
    status: 'Am Leben',
    height: '1,68 m',
  },
  'peter-quill': {
    height: '1,88 m',
  },
  'gamora': {
    height: '1,83 m',
  },
  'gamora-2014': {
    origin: 'Zen-Whoberi',
    species: 'Zehoberei',
    teams: ['Ravagers', 'Black Order'],
    status: 'Am Leben',
    height: '1,83 m',
  },
  'drax': {
    origin: 'Kylos',
    height: '1,96 m',
  },
  'rocket': {
    species: 'Halfworlder (Waschbär)',
    height: '1,20 m',
  },
  'groot': {
    height: '2,30 m',
  },
  'yondu': {
    origin: 'Centauri IV',
  },
  'ronan': {
    status: 'Verstorben',
    species: 'Kree',
    origin: 'Hala',
    teams: ['Kree-Imperium', 'Accuser Corps'],
    height: '2,08 m',
  },
  'nebula': {
    origin: 'Luphom',
    height: '1,85 m',
  },
  'nebula-2014': {
    origin: 'Luphom',
    species: 'Luphomoide (Cyborg)',
    teams: ['Black Order'],
    status: 'Verstorben',
    height: '1,85 m',
  },
  'ego': {
    origin: 'eigener Planet',
    teams: ['Celestials'],
    height: '1,88 m',
  },
  'mantis': {
    origin: 'Egos Planet',
  },
  'taserface': {
    species: 'Außerirdischer',
    origin: 'unbekannte Welt',
    height: '1,88 m',
  },
  'stakar-ogord': {
    height: '1,88 m',
  },
  'ultron': {
    origin: 'Avengers Tower, New York City',
    teams: ['Ultron-Sentinels'],
  },
  'vision': {
    origin: 'U-Gin Genetics, Seoul',
    height: '1,91 m',
  },
  'scott-lang': {
    height: '1,80 m',
  },
  'hank-pym': {
    height: '1,80 m',
  },
  'hope-van-dyne': {
    height: '1,73 m',
  },
  'darren-cross': {
    species: 'Mensch, im Quantenreich zu MODOK umgebaut',
    height: '1,78 m',
  },
  'luis': {
    height: '1,75 m',
  },

  /* ---------- Phase Three ---------- */
  't-challa': {
    height: '1,83 m',
  },
  'peter-parker': {
    origin: 'Queens, New York City, New York',
    species: 'Mensch, durch einen Spinnenbiss verändert',
    height: '1,78 m',
  },
  'peter-parker-maguire': {
    origin: 'New York City',
    species: 'Mensch, durch einen Spinnenbiss verändert',
    status: 'Am Leben',
  },
  'peter-parker-garfield': {
    origin: 'New York City',
    species: 'Mensch, durch einen Spinnenbiss verändert',
    status: 'Am Leben',
  },
  'helmut-zemo': {
    height: '1,78 m',
  },
  't-chaka': {
    height: '1,80 m',
  },
  'alexei': {
    species: 'Mensch, verstärkt durch das Supersoldaten-Serum',
    origin: 'Sowjetunion',
    teams: ['Thunderbolts', 'Roter Raum', 'Sowjetarmee'],
  },
  'melina-vostokoff': {
    height: '1,70 m',
  },
  'taskmaster': {
    origin: 'Russland',
    height: '1,73 m',
  },
  'general-dreykov': {
    height: '1,80 m',
  },
  'rick-mason': {
    height: '1,80 m',
    teams: ['S.H.I.E.L.D.'],
  },
  'erik-killmonger': {
    height: '1,80 m',
  },
  'shuri': {
    height: '1,70 m',
  },
  'okoye': {
    height: '1,73 m',
  },
  'nakia': {
    height: '1,68 m',
  },
  'm-baku': {
    height: '1,96 m',
  },
  'everett-ross': {
    height: '1,73 m',
  },
  'w-kabi': {
    height: '1,83 m',
  },
  'zuri': {
    height: '1,88 m',
  },
  'adrian-toomes-vulture': {
    height: '1,80 m',
  },
  'scorpion': {
    height: '1,80 m',
    teams: ['Sinister Six'],
  },
  'ned-leeds': {
    height: '1,75 m',
  },
  'may-parker': {
    teams: ['F.E.A.S.T.'],
    height: '1,68 m',
  },
  'stephen-strange': {
    height: '1,88 m',
  },
  'defender-strange': {
    origin: 'Erde-617',
    species: 'Mensch',
    teams: ['Meister der mystischen Künste'],
    status: 'Verstorben',
    height: '1,88 m',
  },
  'sinister-strange': {
    origin: 'andere Welt',
    species: 'Mensch',
    teams: ['Meister der mystischen Künste'],
    status: 'Verstorben',
    height: '1,88 m',
  },
  'the-ancient-one': {
    origin: 'Kamar-Taj, Nepal',
    height: '1,70 m',
  },
  'karl-mordo': {
    height: '1,83 m',
  },
  'karl-mordo-838': {
    origin: 'Erde-838',
    species: 'Mensch',
    teams: ['Meister der mystischen Künste', 'Illuminati'],
    status: 'Am Leben',
    height: '1,83 m',
  },
  'wong': {
    origin: 'Kamar-Taj, Nepal',
    height: '1,75 m',
  },
  'kaecilius': {
    height: '1,80 m',
  },
  'dormammu': {
    origin: 'Dunkle Dimension',
    species: 'Faltine',
    teams: ['Zeloten'],
    height: 'füllt den Himmel',
  },
  'hela': {
    height: '1,73 m',
  },
  'valkyrie': {
    origin: 'Asgard',
    height: '1,73 m',
  },
  'grandmaster': {
    height: '1,80 m',
    teams: ['Elders of the Universe'],
  },
  'skurge': {
    height: '1,93 m',
  },
  'surtur': {
    species: 'Feuerdämon',
    origin: 'Muspelheim',
    teams: ['Feuerdämonen von Muspelheim'],
    height: '300 m',
  },
  'topaz': {
    origin: 'Sakaar',
    species: 'Außerirdische',
    teams: ['Sakaaran Guards'],
    status: 'Verstorben',
  },
  'janet-van-dyne': {
    height: '1,70 m',
  },
  'ava-starr': {
    origin: 'S.H.I.E.L.D.-Anlage, Argentinien',
  },
  'yelena-belova': {
    height: '1,65 m',
  },

  /* ---------- Phase Four ---------- */
  'sylvie': {
    height: '1,63 m',
  },
  'classic-loki': {
    origin: 'Jotunheim',
    species: 'Frostriese',
    teams: ['Kid Lokis Bande'],
    status: 'Verstorben',
  },
  'kid-loki': {
    origin: 'Jotunheim',
    species: 'Frostriese',
    teams: ['Kid Lokis Bande'],
    status: 'Am Leben',
  },
  'boastful-loki': {
    origin: 'Jotunheim',
    species: 'Frostriese',
    teams: ['Kid Lokis Bande'],
    status: 'Am Leben',
  },
  'alligator-loki': {
    species: 'Alligator',
    teams: ['Kid Lokis Bande'],
    status: 'Am Leben',
  },
  'president-loki': {
    origin: 'Jotunheim',
    species: 'Frostriese',
    teams: ['Loki-Banditen'],
    status: 'Am Leben',
  },
  'mobius': {
    height: '1,80 m',
  },
  'ravonna-renslayer': {
    height: '1,70 m',
  },
  'miss-minutes': {
    species: 'Künstliche Intelligenz',
    origin: 'Zitadelle am Ende der Zeit',
    teams: ['TVA'],
  },
  'der-da-bleibt': {
    species: 'Mensch (Variante von Nathaniel Richards)',
    origin: 'Erde im 31. Jahrhundert',
    teams: ['TVA'],
    height: '1,80 m',
  },
  'agatha-harkness': {
    species: 'Hexe',
    height: '1,70 m',
  },
  'monica-rambeau': {
    height: '1,73 m',
  },
  'darcy-lewis': {
    height: '1,63 m',
  },
  'jimmy-woo': {
    height: '1,75 m',
  },
  'shang-chi': {
    teams: ['Ten Rings', 'Ta Lo'],
    height: '1,75 m',
  },
  'katy': {
    teams: ['Ta Lo'],
    height: '1,65 m',
  },
  'wenwu-mandarin': {
    height: '1,78 m',
  },
  'xialing': {
    height: '1,68 m',
  },
  'razor-fist': {
    height: '1,80 m',
  },
  'john-walker': {},
  'karli-morgenthau': {
    height: '1,68 m',
  },
  'sharon-carter': {
    height: '1,70 m',
  },
  'isaiah-bradley': {
    teams: ['US-Armee'],
  },
  'quentin-beck-mysterio': {
    height: '1,80 m',
  },
  'michelle-jones-watson': {
    height: '1,73 m',
  },
  'sersi': {
    height: '1,73 m',
  },
  'ikaris': {
    height: '1,88 m',
  },
  'thena': {
    height: '1,75 m',
  },
  'kingo': {
    height: '1,78 m',
  },
  'sprite': {
    height: '1,50 m',
  },
  'druig': {
    height: '1,80 m',
  },
  'makkari': {
    height: '1,73 m',
  },
  'phastos': {
    height: '1,83 m',
  },
  'ajak': {
    height: '1,70 m',
  },
  'gilgamesh': {
    height: '1,78 m',
  },
  'dane-whitman': {
    origin: 'England',
    species: 'Mensch',
    teams: ['Natural History Museum'],
    status: 'Am Leben',
  },
  'green-goblin': {
    height: '1,80 m',
    teams: ['Sinister Six', 'Oscorp'],
  },
  'doc-ock': {
    height: '1,80 m',
    teams: ['Sinister Six'],
  },
  'electro': {
    species: 'Mensch, verwandelt durch elektrische Energie',
    height: '1,83 m',
    teams: ['Sinister Six'],
  },
  'sandman': {
    origin: 'USA',
    species: 'Mensch, verwandelt durch einen Teilchenbeschleuniger',
    teams: ['Sinister Six'],
    status: 'Am Leben',
  },
  'curt-connors': {
    species: 'Mensch, verwandelt durch Reptilien-Serum',
    height: '1,80 m',
    teams: ['Sinister Six', 'Oscorp'],
  },
  'america-chavez': {
    height: '1,63 m',
  },
  'christine-palmer': {
    height: '1,70 m',
    teams: ['Metro-General Hospital'],
  },
  'christine-palmer-838': {
    origin: 'Erde-838',
    species: 'Mensch',
    teams: ['Baxter Foundation'],
    status: 'Am Leben',
    height: '1,70 m',
  },
  'charles-xavier-professor-x': {
    height: '1,80 m',
  },
  'reed-richards-mister-fantastic': {
    height: '1,88 m',
  },
  'reed-richards-838': {
    origin: 'Erde-838',
    species: 'Mensch',
    teams: ['Fantastic Four', 'Illuminati', 'Baxter Foundation'],
    status: 'Verstorben',
    height: '1,88 m',
  },
  'kate-bishop': {
    height: '1,68 m',
  },
  'maya-lopez-echo': {
    height: '1,68 m',
  },
  'wilson-fisk-kingpin': {
    height: '1,96 m',
  },
  'eleanor-bishop': {
    height: '1,68 m',
  },
  'jack-duquesne': {
    origin: 'Frankreich',
    height: '1,80 m',
  },
  'kazi-kazimierczak': {
    origin: 'Polen',
  },
  'william-lopez': {},
  'ivan-banionis': {},
  'tomas': {
    origin: 'Polen',
  },
  'enrique': {},
  'dmitri': {},
  'grills': {},
  'wendy-conrad': {},
  'lucky': {},
  'matt-murdock-daredevil': {},
  'wade-wilson-deadpool': {
    species: 'Mutant, verändert durch das Weapon-X-Programm',
    height: '1,88 m',
  },
  'nicepool': {
    origin: 'andere Welt',
    species: 'Mensch',
    status: 'Verstorben',
  },
  'logan-wolverine': {
    height: '1,75 m',
  },
  'cassandra-nova': {
    origin: 'Void',
    height: '1,73 m',
  },
  'mr-paradox': {
    origin: 'TVA',
    height: '1,78 m',
  },
  'dogpool': {
    species: 'Hund',
    origin: 'Void',
    height: '0,30 m',
  },
  'blade': {
    origin: 'Detroit, Michigan',
    teams: ['Vampirjäger'],
    height: '1,88 m',
  },
  'marc-spector-steven-grant-moon-knight': {
    height: '1,80 m',
  },
  'layla-el-faouly': {
    height: '1,68 m',
    teams: ['Ennead-Rat'],
  },
  'arthur-harrow': {
    height: '1,85 m',
  },
  'khonshu': {
    origin: 'Ennead',
    height: '2,60 m',
  },
  'ammit': {
    origin: 'Ennead',
    height: '3,00 m',
  },
  'kamala-khan-ms-marvel': {
    species: 'Mensch-Clandestine-Hybrid, Mutantin',
    height: '1,68 m',
  },
  'bruno-carrelli': {
    height: '1,73 m',
  },
  'nakia-bahadir': {
    height: '1,65 m',
  },
  'kamran': {
    species: 'Mensch-Clandestine-Hybrid',
    height: '1,80 m',
  },
  'muneeba-khan': {
    species: 'Mensch-Clandestine-Hybrid',
    height: '1,68 m',
    teams: ['Familie Khan'],
  },
  'gorr': {
    species: 'Außerirdischer',
    height: '1,85 m',
    teams: ['Götterschlächter'],
  },
  'korg': {
    height: '2,44 m',
    teams: ['Revengers', 'Neu-Asgard'],
  },
  'zeus': {
    origin: 'Olymp',
    height: '1,80 m',
  },
  'love': {
    origin: 'Rapus Planet',
    species: 'Außerirdische, von Eternity zurückgeholt',
    teams: ['Thors Familie'],
    status: 'Am Leben',
  },
  'jennifer-walters-she-hulk': {
    height: '2,01 m',
    species: 'Mensch, durch Gammablut verwandelt',
  },
  'nikki-ramos': {
    height: '1,60 m',
  },
  'titania': {
    species: 'Mensch, verstärkt',
    height: '1,75 m',
  },
  'namor': {
    species: 'Talokani',
    origin: 'Talokan',
    height: '1,75 m',
  },
  'koenigin-ramonda': {
    height: '1,73 m',
  },
  'riri-williams': {
    height: '1,68 m',
  },

  /* ---------- Phase Five ---------- */
  'ouroboros-o-b': {
    height: '1,80 m',
  },
  'victor-timely': {
    height: '1,80 m',
    teams: ['Timely Industries'],
  },
  'cassie-lang': {
    height: '1,70 m',
    teams: ['Ant-Man-Familie'],
  },
  'kang-der-eroberer': {
    origin: 'Erde im 31. Jahrhundert',
    height: '1,80 m',
  },
  'high-evolutionary': {
    origin: 'Counter-Earth',
    height: '1,88 m',
  },
  'adam-warlock': {
    origin: 'Sovereign',
    height: '1,88 m',
  },
  'gravik': {
    origin: 'Skrullos',
    height: '1,85 m',
  },
  'g-iah': {
    height: '1,75 m',
  },
  'sonya-falsworth': {
    height: '1,70 m',
  },
  'praesident-james-ritson': {
    height: '1,80 m',
  },
  'chula': {
    teams: ['Choctaw', 'US-Post'],
    height: '1,68 m',
  },
  'bonnie': {
    height: '1,70 m',
  },
  'henry-lopez': {
    height: '1,80 m',
  },
  'dar-benn': {
    height: '1,75 m',
  },
  'hank-mccoy-beast': {
    height: '1,78 m',
  },
  'billy-maximoff-wiccan': {
    height: '1,75 m',
  },
  'rio-vidal': {
    species: 'Kosmische Entität',
    origin: 'jenseits der Straße der Hexen',
    teams: ['Hexenzirkel von Agatha Harkness'],
    height: '1,73 m',
  },
  'lilia-calderu': {
    height: '1,63 m',
  },
  'jennifer-kale': {
    height: '1,70 m',
  },
  'alice-wu-gulliver': {
    height: '1,78 m',
  },
  'joaquin-torres-falcon': {
    height: '1,78 m',
  },
  'bullseye': {
    origin: 'Portsmouth, New Hampshire',
    height: '1,83 m',
  },
  'frank-castle-punisher': {
    height: '1,88 m',
  },
  'vanessa-fisk': {
    height: '1,73 m',
  },
  'muse': {
    height: '1,85 m',
    teams: ['Einzelgänger'],
  },
  'karen-page': {
    origin: 'Fagan Corners, Vermont',
    height: '1,75 m',
  },
  'connor-powell': {},
  'cole-north': {
    height: '1,80 m',
  },
  'white-tiger': {
    teams: ['Daredevils Truppe'],
    height: '1,78 m',
  },
  'parker-robbins-the-hood': {},
  'n-a-t-a-l-i-e': {
    species: 'Künstliche Intelligenz',
    origin: 'Chicago, Illinois',
    teams: ['Ironheart-Projekt'],
  },
  'ezekiel-stane': {
    teams: ['Stane Industries'],
    height: '1,80 m',
  },
  'mephisto': {
    teams: ['Hölle'],
    origin: 'Hölle',
    height: '1,85 m',
  },
  'bob-sentry': {
    species: 'Mensch, verändert durch das Sentry-Serum',
    height: '1,80 m',
    teams: ['Thunderbolts', 'Projekt Sentry'],
  },
  'valentina-allegra-de-fontaine': {
    height: '1,73 m',
  },

  /* ---------- Phase Six ---------- */
  'sue-storm-invisible-woman': {
    height: '1,75 m',
  },
  'johnny-storm-human-torch': {
    height: '1,83 m',
  },
  'ben-grimm-the-thing': {
    height: '1,96 m',
  },
  'galactus': {
    species: 'Kosmische Entität',
    origin: 'Taa',
    teams: ['Kosmische Mächte'],
    height: '90 m',
  },
  'silver-surfer': {
    origin: 'Zenn-La',
    teams: ['Herolde von Galactus'],
    height: '1,93 m',
  },
  'doctor-doom': {
    height: '1,88 m',
    teams: ['Latveria'],
  },
  'simon-williams': {
    height: '1,88 m',
    teams: ['Schauspielergewerkschaft'],
  },
  'regisseur-von-kovak': {
    origin: 'Los Angeles, Kalifornien',
    teams: ['Filmbranche'],
    height: '1,80 m',
  },
  'jessica-jones': {
    height: '1,75 m',
  },
  'tarantula': {
    origin: 'Delvadia, Südamerika',
    species: 'Mensch, verstärkt durch ein Serum',
    teams: ['Streitkräfte von Delvadia'],
    status: 'Am Leben',
  },
  'jocasta-angekuendigt': {
    origin: 'unbekannt',
    teams: ['Ultrons Werk'],
    height: '1,80 m',
  },
  'e-d-i-t-h': {
    origin: 'Tony Starks Werkstatt',
    species: 'Künstliche Intelligenz',
    teams: ['Stark Industries'],
    status: 'Am Leben',
  },
  'erik-lehnsherr-magneto': {
    height: '1,85 m',
  },
  'scott-summers-cyclops': {
    height: '1,83 m',
  },
  'raven-darkhoelme-mystique': {
    height: '1,78 m',
  },
  'kurt-wagner-nightcrawler': {
    height: '1,75 m',
  },
  'remy-lebeau-gambit': {
    origin: 'New Orleans, Louisiana',
    height: '1,85 m',
  },
  'wolfgang-von-strucker': {
    origin: 'Deutschland',
    height: '1,85 m',
  },
  'laura-barton': {},
  'lila-barton': {},
  'bill-foster': {
    height: '1,88 m',
  },
  'ebony-maw': {
    species: 'Außerirdischer',
    origin: 'unbekannte Welt',
    height: '1,88 m',
  },
  'ebony-maw-2014': {
    species: 'Außerirdischer',
    teams: ['Black Order'],
    status: 'Verstorben',
  },
  'corvus-glaive': {
    origin: 'unbekannte Welt',
    height: '1,96 m',
  },
  'corvus-glaive-2014': {
    species: 'Außerirdischer',
    teams: ['Black Order'],
    status: 'Verstorben',
  },
  'proxima-midnight': {
    origin: 'unbekannte Welt',
    height: '1,88 m',
  },
  'proxima-midnight-2014': {
    species: 'Außerirdische',
    teams: ['Black Order'],
    status: 'Verstorben',
  },
  'cull-obsidian': {
    species: 'Außerirdischer',
    origin: 'unbekannte Welt',
    height: '2,29 m',
  },
  'cull-obsidian-2014': {
    species: 'Außerirdischer',
    teams: ['Black Order'],
    status: 'Verstorben',
  },
  'eitri': {
    species: 'Zwerg',
    origin: 'Nidavellir',
    height: '5 m',
    teams: ['Zwerge von Nidavellir'],
  },
  'hunter-b-15': {
    teams: ['Zeitvarianzbehörde', 'Minutemen'],
  },
  'death-dealer': {
    teams: ['Ten Rings'],
    height: '1,75 m',
  },
  'ying-li': {
    teams: ['Ta Lo'],
    height: '1,68 m',
  },
  'arnim-zola': {
    origin: 'Schweiz',
    species: 'Mensch, später Bewusstsein auf Magnetband',
    height: '1,65 m',
  },
  'ayesha': {
    origin: 'Sovereign',
    height: '1,80 m',
    teams: ['Sovereign'],
  },
  'howard-the-duck': {
    origin: 'Duckworld',
    species: 'Duckworldianer',
    height: '0,79 m',
    teams: ['Knowhere', 'Sammlung des Collectors'],
  },
  'ying-nan': {
    origin: 'Ta Lo',
    teams: ['Ta Lo'],
    height: '1,63 m',
  },
  'black-bolt': {
    species: 'Inhuman',
    height: '1,88 m',
    teams: ['Illuminati', 'Königsfamilie der Inhumans'],
    status: 'Verstorben',
  },
  'clea': {
    origin: 'Dunkle Dimension',
    species: 'Zauberin der Dunklen Dimension',
    height: '1,77 m',
  },
  'chester-phillips': {
    height: '1,85 m',
    teams: ['SSR', 'S.H.I.E.L.D.', 'US-Armee'],
  },
  'kurse': {
    origin: 'Svartalfheim',
    species: 'Dunkelelf, zum Kursed umgeformt',
    height: '2,29 m',
  },
  'kraglin': {
    origin: 'Xandar',
    species: 'Xandarianer',
    height: '1,80 m',
    teams: ['Guardians of the Galaxy', 'Ravagers'],
  },
  'krugarr': {
    origin: 'unbekannte Welt',
    species: 'Lem',
    teams: ['Ravagers', 'United Ravagers'],
  },
  'kro': {
    origin: 'Erde',
    species: 'Deviant',
    height: '2,44 m',
    teams: ['Deviants'],
  },
  'rintrah': {
    origin: "R'Vaal",
    species: "R'Vaalianer",
    height: '2,13 m',
    teams: ['Meister der mystischen Künste'],
  },
  'rama-tut': {
    origin: 'Altes Ägypten',
    species: 'Mensch aus dem 31. Jahrhundert',
    teams: ['Rat der Kangs'],
  },
  'white-vision': {
    species: 'Synthezoid ohne Gedankenstein',
    height: '1,91 m',
    teams: ['S.W.O.R.D.'],
  },
  'aamir-khan': {
    origin: 'Jersey City, New Jersey',
    species: 'Mensch',
    height: '1,80 m',
  },
  'sana-ali': {
    origin: 'Karatschi, Pakistan',
    species: 'Mensch',
    height: '1,55 m',
  },
  'mrs-hart': {
    origin: 'Westview, New Jersey',
    species: 'Mensch',
    height: '1,55 m',
    teams: ['Westview Historical Society', 'Agathas Zirkel'],
  },
  'juggernaut': {
    origin: 'die Leere',
    species: 'Mutant',
    height: '2,03 m',
    teams: ['Cassandra Novas Gefolge'],
  },
  'arishem': {
    origin: 'die Weltenschmiede',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
  },
  'tiamut': {
    origin: 'Erdkern',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
  },
  'nezarr': {
    origin: 'die Weltenschmiede',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
  },
  'eros-starfox': {
    origin: 'Titan',
    species: 'Eternal',
    height: '1,78 m',
    teams: ['Eternals von Titan'],
  },
  'cosmo': {
    origin: 'Sowjetunion, dann Knowhere',
    species: 'Hund',
    teams: ['Guardians of the Galaxy', 'Knowhere'],
  },
  'lylla': {
    origin: 'Labor des High Evolutionary',
    species: 'Otter mit Kybernetik',
    teams: ['Batch 89'],
  },
  'teefs': {
    origin: 'Labor des High Evolutionary',
    species: 'Walross mit Kybernetik',
    teams: ['Batch 89'],
  },
  'floor': {
    origin: 'Labor des High Evolutionary',
    species: 'Kaninchen mit Kybernetik',
    teams: ['Batch 89'],
  },
  'phyla-vell': {
    origin: 'die Arête',
    species: 'Kree',
    teams: ['Guardians of the Galaxy'],
  },
  'der-andere': {
    origin: 'unbekannte Welt',
    species: 'Chitauri',
    teams: ['Schwarzer Orden', 'Chitauri'],
  },
  'h-e-r-b-i-e': {
    origin: 'Baxter Building, New York',
    species: 'Roboter',
    teams: ['Fantastic Four'],
  },
  'hercules': {
    origin: 'Olymp',
    species: 'Gott',
    height: '1,88 m',
    teams: ['Götter des Olymp'],
  },
  'piledriver': {
    origin: 'USA',
    species: 'Mensch mit asgardischem Vibranium',
    teams: ['Wrecking Crew', 'Intelligencia'],
  },
  'morris': {
    origin: 'Ta Lo',
    species: 'Fabelwesen aus Ta Lo',
    teams: ['Ta Lo'],
  },
  'der-grosse-beschuetzer': {
    origin: 'Ta Lo',
    species: 'Drache',
    teams: ['Ta Lo'],
    status: 'Am Leben',
  },
  'veb': {
    origin: 'Quantenraum',
    species: 'Wesen aus dem Quantenraum',
    teams: ['Freiheitskämpfer'],
  },
  'toad': {
    origin: 'die Leere',
    species: 'Mutant',
    teams: ['Cassandra Novas Gefolge'],
  },
  'azazel': {
    origin: 'die Leere',
    species: 'Mutant',
    teams: ['Cassandra Novas Gefolge'],
  },
  'elektra': {
    origin: 'Griechenland',
    species: 'Mensch',
    height: '1,65 m',
    teams: ['Widerstand im Void'],
  },
  'blind-al': {
    origin: 'New York City, New York',
    species: 'Mensch',
    teams: ['Wade Wilsons Freundeskreis'],
    status: 'Am Leben',
  },
  'negasonic-teenage-warhead': {
    origin: 'Andere Wirklichkeit',
    species: 'Mutantin',
    teams: ['X-Men'],
    status: 'Am Leben',
  },
  'yukio': {
    origin: 'Andere Wirklichkeit',
    species: 'Mutantin',
    teams: ['X-Men'],
    status: 'Am Leben',
  },
  'peter-wisdom': {
    origin: 'Andere Wirklichkeit',
    species: 'Mensch',
    teams: ['Drive Max', 'X-Force'],
    status: 'Am Leben',
  },
  'shatterstar': {
    origin: 'nicht von der Erde',
    species: 'Außerirdischer',
    teams: ['X-Force'],
    status: 'Am Leben',
  },
  'headpool': {
    origin: 'Zombie-Kopf-Universum',
    species: 'Zombifizierter Mutant',
    teams: ['Deadpool Corps'],
    status: 'Zombifiziert',
  },
  'callisto': {
    origin: 'die Leere',
    species: 'Mutantin',
    teams: ['Cassandra Novas Gefolge'],
    status: 'Verstorben',
  },
  'quill': {
    origin: 'die Leere',
    species: 'Mutantin',
    teams: ['Cassandra Novas Gefolge'],
    status: 'Verstorben',
  },
  'lady-deathstrike': {
    origin: 'die Leere',
    species: 'Mutantin',
    teams: ['Cassandra Novas Gefolge'],
    status: 'Unbekannt',
  },
  'throg': {
    origin: 'gekappte Zeitlinie',
    species: 'Asgardier als Frosch',
    height: '12 cm',
  },
  'alioth': {
    origin: 'die Leere am Ende der Zeit',
    species: 'Wesen aus reiner Zeitenergie',
    height: 'mehrere Kilometer',
  },
  'colossus': {
    origin: 'Russland',
    species: 'Mutant',
    height: '2,08 m',
    teams: ['X-Men'],
  },
  'eson': {
    origin: 'unbekannt',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
  },
  'jemiah': {
    origin: 'die Weltenschmiede',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
  },
  'j-jonah-jameson': {
    origin: 'New York City, New York',
    species: 'Mensch',
    height: '1,80 m',
    teams: ['TheDailyBugle.net'],
  },
  'martinex': {
    origin: 'Pluto',
    species: 'Pluvianer',
    height: '1,80 m',
    teams: ['Ravagers', 'United Ravagers'],
  },
  'shocker': {
    origin: 'New York City, New York',
    species: 'Mensch',
    height: '1,85 m',
    teams: ['Adrian Toomes’ Bande'],
  },
  'ulysses-klaue': {
    origin: 'Südafrika',
    species: 'Mensch mit Armprothese',
    height: '1,75 m',
    teams: ['Schwarzmarkt', 'Erik Killmongers Plan'],
  },
  'jean-grey': {
    origin: 'USA',
    species: 'Mutantin',
    status: 'Am Leben',
  },
  'sara-grey': {
    origin: 'USA',
    species: 'Mutantin',
    status: 'Verstorben',
  },
  'william-metzger': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Damage Control'],
    status: 'Am Leben',
  },
  'jean-dewolff': {
    origin: 'New York City, New York',
    species: 'Mensch',
    teams: ['New York City Police Department'],
    status: 'Am Leben',
  },
  'snow': {
    origin: 'Japan',
    species: 'Mensch',
    teams: ['Hand', 'Department of Damage Control'],
    status: 'Am Leben',
  },
  'ramrod': {
    origin: 'USA',
    species: 'Mensch (Cyborg)',
    status: 'Am Leben',
  },
  'e-v': {
    origin: 'Peter Parkers Werkstatt',
    species: 'Künstliche Intelligenz',
    teams: ['Spider-Mans Anzug'],
    status: 'Am Leben',
  },
  'paul-rabin': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'lonnie-lincoln-tombstone': {
    origin: 'USA',
    species: 'Mensch mit verstärkter Konstitution',
    teams: ['eigene Bande in New York'],
    status: 'Am Leben',
  },
  'fred-myers-boomerang': {
    origin: 'Australien',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'alejandro-montoya-el-aguila': {
    origin: 'Spanien',
    species: 'Mensch',
    teams: ['Abomaste'],
    status: 'Am Leben',
  },
  'alexander-gentry-porcupine': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Abomaste'],
    status: 'Am Leben',
  },
  'dirk-garthwaite-wrecker': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Wrecking Crew', 'Intelligencia', 'Abomaste'],
    status: 'Am Leben',
  },
  'muzzafar-lambert-saracen': {
    origin: 'Erde',
    species: 'Vampir',
    teams: ['Abomaste'],
    status: 'Am Leben',
  },
  'william-taurens-man-bull': {
    origin: 'USA',
    species: 'Verstärkter Mensch',
    teams: ['Abomaste'],
    status: 'Am Leben',
  },
  'craig-hollis-mr-immortal': {
    origin: 'USA',
    species: 'Verstärkter Mensch',
    teams: ['Goodman, Lieber, Kurtzberg & Holliway'],
    status: 'Am Leben',
  },
  'donny-blaze': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Meister der mystischen Künste'],
    status: 'Am Leben',
  },
  'luke-jacobson': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'mallory-book': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Goodman, Lieber, Kurtzberg & Holliway'],
    status: 'Am Leben',
  },
  'skaar': {
    origin: 'Sakaar',
    species: 'Mensch-Hybrid',
    status: 'Am Leben',
  },
  'todd-phelps': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Intelligencia'],
    status: 'Am Leben',
  },
  'clown': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Hoods Bande'],
    status: 'Am Leben',
  },
  'jeri-blood': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Hoods Bande'],
    status: 'Am Leben',
  },
  'john-king': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Hoods Bande'],
    status: 'Verstorben',
  },
  'landon': {
    origin: 'Chicago, USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'ronnie-williams': {
    origin: 'Chicago, USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'roz-blood': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Hoods Bande'],
    status: 'Am Leben',
  },
  'slug': {
    origin: 'Madripoor',
    species: 'Mensch',
    teams: ['Hoods Bande'],
    status: 'Am Leben',
  },
  'zelma-stanton': {
    origin: 'Chicago, USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'agent-cleary': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Department of Damage Control'],
    status: 'Am Leben',
  },
  'demarr-davis-doorman': {
    origin: 'USA',
    species: 'Verstärkter Mensch',
    teams: ['Wilcox'],
    status: 'Am Leben',
  },
  'eric-williams': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'janelle-jackson': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Hanover Agency'],
    status: 'Am Leben',
  },
  'martha-williams': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'sanford-williams': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Verstorben',
  },
  'cowboypool': {
    origin: 'Andere Wirklichkeit',
    species: 'Mutant',
    teams: ['Deadpool Corps', 'Cassandra Novas Gefolge'],
    status: 'Am Leben',
  },
  'johnny-storm-121698': {
    origin: 'Erde-121698',
    species: 'Mensch',
    teams: ['Fantastic Four', 'Resistance'],
    status: 'Verstorben',
  },
  'kidpool': {
    origin: 'Andere Wirklichkeit',
    species: 'Mutant',
    teams: ['Deadpool Corps', 'Cassandra Novas Gefolge'],
    status: 'Am Leben',
  },
  'ladypool': {
    origin: 'Andere Wirklichkeit',
    species: 'Mutant',
    teams: ['Deadpool Corps', 'Cassandra Novas Gefolge'],
    status: 'Am Leben',
  },
  'laura-x-23': {
    origin: 'Erde-10005',
    species: 'Mutant',
    teams: ['Resistance'],
    status: 'Am Leben',
  },
  'samuraipool': {
    origin: 'Andere Wirklichkeit',
    species: 'Mutant',
    teams: ['Deadpool Corps', 'Cassandra Novas Gefolge'],
    status: 'Am Leben',
  },
  'victor-creed-sabretooth': {
    origin: 'Andere Wirklichkeit',
    species: 'Mutant',
    teams: ['Cassandra Novas Gefolge'],
    status: 'Verstorben',
  },
  'john-allerdyce-pyro': {
    origin: 'Andere Wirklichkeit',
    species: 'Mutant',
    teams: ['Cassandra Novas Gefolge', 'Mr. Paradox\' Truppe'],
    status: 'Verstorben',
  },
  'dave': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['X-Con Security Consultants'],
    status: 'Am Leben',
  },
  'jentorra': {
    origin: 'Quantenreich',
    species: 'Bewohnerin des Quantenreichs',
    teams: ['Freiheitskämpfer'],
    status: 'Am Leben',
  },
  'jim-paxton': {
    origin: 'San Francisco, USA',
    species: 'Mensch',
    teams: ['San Francisco Police Department'],
    status: 'Am Leben',
  },
  'kurt-goreshter': {
    origin: 'Russland',
    species: 'Mensch',
    teams: ['X-Con Security Consultants'],
    status: 'Am Leben',
  },
  'krylar': {
    origin: 'Quantenreich',
    species: 'Bewohner des Quantenreichs',
    teams: ['Freiheitskämpfer', 'Kangs Reich'],
    status: 'Am Leben',
  },
  'maggie-lang': {
    origin: 'San Francisco, USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'quaz': {
    origin: 'Quantenreich',
    species: 'Bewohner des Quantenreichs',
    teams: ['Freiheitskämpfer'],
    status: 'Am Leben',
  },
  'sonny-burch': {
    origin: 'San Francisco, USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'aneka': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['Dora Milaje', 'Midnight Angels'],
    status: 'Am Leben',
  },
  'att-lass': {
    origin: 'Hala',
    species: 'Kree',
    teams: ['Starforce', 'Kree-Imperium'],
    status: 'Am Leben',
  },
  'attuma': {
    origin: 'Talokan',
    species: 'Talokanil',
    teams: ['Streitkräfte von Talokan'],
    status: 'Am Leben',
  },
  'ayo': {
    origin: 'Wakanda',
    species: 'Mensch',
    teams: ['Dora Milaje', 'Midnight Angels'],
    status: 'Am Leben',
  },
  'bron-char': {
    origin: 'Hala',
    species: 'Kree',
    teams: ['Starforce', 'Kree-Imperium'],
    status: 'Am Leben',
  },
  'korath-der-verfolger': {
    origin: 'Hala',
    species: 'Kree (Kybernetisch verstärkt)',
    teams: ['Starforce', 'Kree-Imperium', 'Ronans Truppe'],
    status: 'Verstorben',
  },
  'namora': {
    origin: 'Talokan',
    species: 'Talokanil',
    teams: ['Streitkräfte von Talokan'],
    status: 'Am Leben',
  },
  'prinz-yan': {
    origin: 'Aladna',
    species: 'Aladneer',
    teams: ['Königshaus von Aladna'],
    status: 'Am Leben',
  },
  'dimitri-smerdyakov': {
    origin: 'Russland',
    species: 'Mensch',
    teams: ['Nick Furys Truppe'],
    status: 'Am Leben',
  },
  'elder-beast': {
    origin: 'Berg Wundagore',
    species: 'Dämonisches Wesen',
    teams: ['Chthons Wächter'],
    status: 'Am Leben',
  },
  'franklin-richards': {
    origin: 'Erde-828',
    species: 'Mensch',
    teams: ['Fantastic Four'],
    status: 'Am Leben',
  },
  'giganto': {
    origin: 'Erde-828',
    species: 'Deviant',
    status: 'Am Leben',
  },
  'harvey-elder-mole-man': {
    origin: 'Subterranea',
    species: 'Mensch',
    teams: ['Union von Subterranea'],
    status: 'Am Leben',
  },
  'rachel-rozman': {
    origin: 'Erde-828',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'eli-bradley': {
    origin: 'Baltimore, USA',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'flash-thompson': {
    origin: 'New York, USA',
    species: 'Mensch',
    teams: ['Midtown School of Science and Technology'],
    status: 'Am Leben',
  },
  'kareem-red-dagger': {
    origin: 'Karatschi, Pakistan',
    species: 'Mensch',
    teams: ['Orden der Roten Dolche'],
    status: 'Am Leben',
  },
  'karun-patel': {
    origin: 'Indien',
    species: 'Mensch',
    status: 'Am Leben',
  },
  'liz-allan': {
    origin: 'New York, USA',
    species: 'Mensch',
    teams: ['Midtown School of Science and Technology'],
    status: 'Am Leben',
  },
  'miek': {
    origin: 'Sakaar',
    species: 'Sakaaranerin',
    teams: ['Revolution von Sakaar', 'Asgardianer'],
    status: 'Am Leben',
  },
  'pagon': {
    origin: 'Skrullos',
    species: 'Skrull',
    teams: ['Skrull-Widerstand'],
    status: 'Verstorben',
  },
  'pip-der-troll': {
    origin: 'Laxidazia',
    species: 'Laxidazianer',
    status: 'Am Leben',
  },
  'tanngrisnir-und-tanngnjostr': {
    origin: 'Indigarr',
    species: 'Indigarrianische Ziegenböcke',
    status: 'Am Leben',
  },
  'taweret': {
    origin: 'Ägypten',
    species: 'Ennead',
    teams: ['Ennead'],
    status: 'Am Leben',
  },
  'varra-priscilla-davis': {
    origin: 'Skrullos',
    species: 'Skrull',
    teams: ['Skrull-Widerstand', 'S.H.I.E.L.D.'],
    status: 'Am Leben',
  },
  'georges-batroc': {
    origin: 'Frankreich',
    species: 'Mensch',
    teams: ['Französische Fremdenlegion', 'LAF', 'Flag Smashers'],
    status: 'Verstorben',
  },
  'immortus': {
    origin: 'Andere Wirklichkeit',
    species: 'Mensch',
    teams: ['Rat der Kangs'],
    status: 'Am Leben',
  },
  'mel': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['O.X.E.'],
    status: 'Am Leben',
  },
  'mr-charles': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['CIA'],
    status: 'Am Leben',
  },
  'scarlet-centurion': {
    origin: 'Andere Wirklichkeit',
    species: 'Mensch',
    teams: ['Rat der Kangs'],
    status: 'Am Leben',
  },
  'tyler-hayward': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['S.W.O.R.D.'],
    status: 'Am Leben',
  },
  'leila-taylor': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Regierung der Vereinigten Staaten'],
    status: 'Am Leben',
  },
  'curtis-hoyle': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Selbsthilfegruppe für Veteranen'],
    status: 'Am Leben',
  },
  'ma-gnucci': {
    origin: 'New York City, New York',
    species: 'Mensch',
    teams: ['Familie Gnucci'],
    status: 'Am Leben',
  },
  'franklin-nelson-foggy': {
    origin: 'New York, USA',
    species: 'Mensch',
    teams: ['Nelson und Murdock'],
    status: 'Verstorben',
  },
  'heather-glenn': {
    origin: 'New York, USA',
    species: 'Mensch',
    teams: ['Verwaltung von Bürgermeister Fisk'],
    status: 'Am Leben',
  },
  'luke-cage': {
    origin: 'Savannah, USA',
    species: 'Verstärkter Mensch',
    teams: ['Defenders', 'Harlem\'s Paradise'],
    status: 'Am Leben',
  },
  'yusuf-khan': {
    origin: 'Karatschi, Pakistan',
    species: 'Mensch',
    teams: ['New York Mutual Bank'],
    status: 'Am Leben',
  },
};

/* Benannte Beziehungen: slug -> [[Bezeichnung, Ziel-Slug], ...].

   Gepflegt wird nur, was eine eigene Bezeichnung verdient. Die Richtung
   steht aus Sicht der Figur, unter der der Eintrag steht: Bei Tony Stark
   ist Howard Stark der Vater, bei Howard Stark ist Tony der Sohn. Beide
   Seiten stehen deshalb einzeln da, es gibt keine automatische Umkehr –
   sie fiele bei „Mentor“ und „Erzfeind“ ohnehin falsch aus.

   Alle weiteren Figuren, denen jemand begegnet ist, entstehen ohne
   Pflege aus den gemeinsamen Filmen (js/characters.js) und stehen im
   Fenster darunter. Ein Ziel-Slug, den es nicht gibt, wird beim Bauen
   übersprungen. */
const CHAR_BONDS = {
  'wade-wilson-deadpool': [
    ['Weggefährte', 'logan-wolverine'],
    ['Variante', 'nicepool'],
    ['Hund', 'dogpool'],
    ['Variante', 'ladypool'],
    ['Variante', 'cowboypool'],
    ['Variante', 'kidpool'],
    ['Variante', 'samuraipool'],
    ['Mitstreiter', 'blade'],
    ['Weggefährte', 'colossus'],
  ],
  'nicepool': [
    ['Hauptfassung', 'wade-wilson-deadpool'],
    ['Hund', 'dogpool'],
  ],
  'maria-rambeau': [
    ['Fassung der Erde-838', 'maria-rambeau-838'],
    ['Fassung einer anderen Welt', 'maria-rambeau-binary'],
  ],
  'karl-mordo': [
    ['Fassung der Erde-838', 'karl-mordo-838'],
  ],
  'christine-palmer': [
    ['Fassung der Erde-838', 'christine-palmer-838'],
  ],
  'reed-richards-mister-fantastic': [
    ['Fassung der Erde-838', 'reed-richards-838'],
    ['Sohn', 'franklin-richards'],
    ['Werk', 'h-e-r-b-i-e'],
    ['Gegner', 'galactus'],
  ],
  'steve-rogers': [
    ['Bester Freund', 'bucky-barnes'],
    ['Große Liebe', 'peggy-carter'],
    ['Nachfolger', 'sam-wilson'],
    ['Mentor', 'abraham-erskine'],
    ['Erzfeind', 'johann-schmidt-red-skull'],
    ['Gegenspieler', 'tony-stark'],
    ['Befehlshaber', 'chester-phillips'],
  ],
  'tony-stark': [
    ['Vater', 'howard-stark'],
    ['Ehefrau', 'pepper-potts'],
    ['Ziehsohn', 'peter-parker'],
    ['Bester Freund', 'james-rhodes'],
    ['Vertrauter', 'happy-hogan'],
    ['Ziehvater', 'obadiah-stane'],
    ['Gegenspieler', 'steve-rogers'],
    ['Erzfeind', 'thanos'],
    ['Rivale', 'justin-hammer'],
    ['Erzfeind', 'ivan-vanko-whiplash'],
    ['Erzfeind', 'aldrich-killian'],
  ],
  'thor': [
    ['Bruder', 'loki'],
    ['Vater', 'odin'],
    ['Mutter', 'frigga'],
    ['Schwester', 'hela'],
    ['Große Liebe', 'jane-foster'],
    ['Treuester Freund', 'heimdall'],
    ['Weggefährte', 'bruce-banner'],
    ['Weggefährtin', 'miek'],
    ['Ziegenböcke', 'tanngrisnir-und-tanngnjostr'],
    ['Schmied', 'eitri'],
    ['Erzfeind', 'gorr'],
  ],
  'loki': [
    ['Varianten', 'kid-loki'],
    ['Bruder', 'thor'],
    ['Ziehvater', 'odin'],
    ['Leiblicher Vater', 'laufey'],
    ['Ziehmutter', 'frigga'],
    ['Variante', 'sylvie'],
    ['Freund', 'mobius'],
    ['Schwester', 'hela'],
  ],
  'classic-loki': [
    ['Hauptfassung', 'loki'],
    ['König', 'kid-loki'],
    ['Bezwinger', 'alioth'],
  ],
  'kid-loki': [
    ['Hauptfassung', 'loki'],
    ['Gefolgsmann', 'classic-loki'],
    ['Verräter', 'boastful-loki'],
    ['Gegenspieler', 'president-loki'],
  ],
  'boastful-loki': [
    ['Hauptfassung', 'loki'],
    ['Verratener König', 'kid-loki'],
    ['Auftraggeber', 'president-loki'],
  ],
  'alligator-loki': [
    ['Hauptfassung', 'loki'],
    ['König', 'kid-loki'],
  ],
  'president-loki': [
    ['Hauptfassung', 'loki'],
    ['Gegenspieler', 'kid-loki'],
    ['Komplize', 'boastful-loki'],
  ],
  'bruce-banner': [
    ['Große Liebe', 'betty-ross'],
    ['Verfolger', 'thaddeus-ross'],
    ['Weggefährte', 'thor'],
    ['Gegenspieler', 'emil-blonsky-abomination'],
    ['Nichte', 'jennifer-walters-she-hulk'],
    ['Sohn', 'skaar'],
  ],
  'natasha-romanoff': [
    ['Schwester', 'yelena-belova'],
    ['Ziehvater', 'alexei'],
    ['Ziehmutter', 'melina-vostokoff'],
    ['Bester Freund', 'clint-barton'],
    ['Erzfeind', 'general-dreykov'],
  ],
  'bucky-barnes': [
    ['Bester Freund', 'steve-rogers'],
    ['Weggefährte', 'sam-wilson'],
    ['Gegenspieler', 'helmut-zemo'],
    ['Rivale', 'john-walker'],
    ['Peiniger', 'arnim-zola'],
  ],
  'peter-parker': [
    ['Variante', 'peter-parker-maguire'],
    ['Mentor', 'tony-stark'],
    ['Große Liebe', 'michelle-jones-watson'],
    ['Bester Freund', 'ned-leeds'],
    ['Tante', 'may-parker'],
    ['Erzfeind', 'green-goblin'],
    ['Gegenspieler', 'adrian-toomes-vulture'],
    ['Ausbilder', 'happy-hogan'],
    ['Ermittler', 'agent-cleary'],
    ['Fahrer', 'dimitri-smerdyakov'],
    ['Mitschüler', 'flash-thompson'],
    ['Erzfeind', 'quentin-beck-mysterio'],
  ],
  'peter-parker-maguire': [
    ['Jüngste Fassung', 'peter-parker'],
    ['Variante', 'peter-parker-garfield'],
    ['Erzfeind', 'green-goblin'],
  ],
  'peter-parker-garfield': [
    ['Jüngste Fassung', 'peter-parker'],
    ['Variante', 'peter-parker-maguire'],
    ['Erzfeind', 'electro'],
  ],
  'wanda-maximoff': [
    ['Fassung der Erde-838', 'wanda-maximoff-838'],
    ['Bruder', 'pietro-maximoff'],
    ['Große Liebe', 'vision'],
    ['Sohn', 'billy-maximoff-wiccan'],
    ['Gegenspielerin', 'agatha-harkness'],
    ['Gegenspieler', 'stephen-strange'],
    ['Gegner', 'tyler-hayward'],
    ['Wächter', 'elder-beast'],
    ['Peiniger', 'wolfgang-von-strucker'],
  ],
  'wanda-maximoff-838': [
    ['Hauptfassung', 'wanda-maximoff'],
  ],
  'stephen-strange': [
    ['Variante', 'defender-strange'],
    ['Lehrerin', 'the-ancient-one'],
    ['Weggefährte', 'wong'],
    ['Große Liebe', 'christine-palmer'],
    ['Gegenspieler', 'karl-mordo'],
    ['Schützling', 'america-chavez'],
    ['Gegenspieler', 'kaecilius'],
    ['Erzfeind', 'dormammu'],
    ['Weggefährtin', 'clea'],
  ],
  'defender-strange': [
    ['Hauptfassung', 'stephen-strange'],
    ['Verratene Freundin', 'america-chavez'],
  ],
  'sinister-strange': [
    ['Hauptfassung', 'stephen-strange'],
    ['Variante', 'defender-strange'],
    ['Unerreichbare Liebe', 'christine-palmer'],
  ],
  'sam-wilson': [
    ['Vorgänger', 'steve-rogers'],
    ['Weggefährte', 'bucky-barnes'],
    ['Rivale', 'john-walker'],
    ['Partner', 'joaquin-torres-falcon'],
    ['Vorbild', 'isaiah-bradley'],
    ['Erzfeind', 'georges-batroc'],
  ],
  'peter-quill': [
    ['Große Liebe', 'gamora'],
    ['Ziehvater', 'yondu'],
    ['Vater', 'ego'],
    ['Weggefährte', 'rocket'],
    ['Weggefährte', 'drax'],
  ],
  'gamora': [
    ['Fassung von 2014', 'gamora-2014'],
    ['Ziehvater', 'thanos'],
    ['Schwester', 'nebula'],
    ['Große Liebe', 'peter-quill'],
  ],
  'gamora-2014': [
    ['Hauptfassung', 'gamora'],
    ['Vater', 'thanos-2014'],
    ['Schwester', 'nebula-2014'],
    ['Verehrer', 'peter-quill'],
  ],
  'nebula': [
    ['Fassung von 2014', 'nebula-2014'],
    ['Ziehvater', 'thanos'],
    ['Schwester', 'gamora'],
    ['Freund', 'rocket'],
  ],
  'nebula-2014': [
    ['Späteres Ich', 'nebula'],
    ['Vater', 'thanos-2014'],
    ['Schwester', 'gamora-2014'],
  ],
  'rocket': [
    ['Bester Freund', 'groot'],
    ['Schöpfer', 'high-evolutionary'],
    ['Weggefährte', 'peter-quill'],
    ['Gefährtin', 'lylla'],
  ],
  'groot': [
    ['Bester Freund', 'rocket'],
  ],
  't-challa': [
    ['Vater', 't-chaka'],
    ['Schwester', 'shuri'],
    ['Mutter', 'koenigin-ramonda'],
    ['Große Liebe', 'nakia'],
    ['Generalin', 'okoye'],
    ['Erzfeind', 'erik-killmonger'],
    ['Bester Freund', 'w-kabi'],
    ['Mentor', 'zuri'],
  ],
  'shuri': [
    ['Bruder', 't-challa'],
    ['Mutter', 'koenigin-ramonda'],
    ['Gegenspieler', 'namor'],
    ['Verbündete', 'riri-williams'],
  ],
  'scott-lang': [
    ['Tochter', 'cassie-lang'],
    ['Große Liebe', 'hope-van-dyne'],
    ['Mentor', 'hank-pym'],
    ['Freund', 'luis'],
    ['Erzfeind', 'kang-der-eroberer'],
    ['Frühere Ehe', 'maggie-lang'],
    ['Freund', 'dave'],
    ['Freund', 'kurt-goreshter'],
    ['Verbündete', 'jentorra'],
    ['Verbündeter', 'quaz'],
    ['Bewährungshelfer', 'jimmy-woo'],
  ],
  'hope-van-dyne': [
    ['Vater', 'hank-pym'],
    ['Mutter', 'janet-van-dyne'],
    ['Große Liebe', 'scott-lang'],
    ['Gegner', 'sonny-burch'],
  ],
  'clint-barton': [
    ['Beste Freundin', 'natasha-romanoff'],
    ['Schützling', 'kate-bishop'],
    ['Gegenspielerin', 'maya-lopez-echo'],
    ['Hund', 'lucky'],
    ['Freund', 'grills'],
  ],
  'carol-danvers': [
    ['Beste Freundin', 'maria-rambeau'],
    ['Ziehnichte', 'monica-rambeau'],
    ['Mentor und Gegner', 'yon-rogg'],
    ['Verbündeter', 'talos'],
    ['Gegenspielerin', 'dar-benn'],
    ['Starforce', 'att-lass'],
    ['Starforce', 'bron-char'],
    ['Ehemann', 'prinz-yan'],
    ['Gegnerin', 'supreme-intelligence'],
  ],
  'nick-fury': [
    ['Verbündete', 'carol-danvers'],
    ['Rechte Hand', 'maria-hill'],
    ['Freund', 'talos'],
    ['Erzfeind', 'gravik'],
    ['Gegenspieler', 'alexander-pierce'],
    ['Ehefrau', 'varra-priscilla-davis'],
  ],
  'thanos': [
    ['Fassung von 2014', 'thanos-2014'],
    ['Ziehtochter', 'gamora'],
    ['Ziehtochter', 'nebula'],
    ['Handlanger', 'ronan'],
    ['Erzfeind', 'tony-stark'],
    ['Gefolgsmann', 'ebony-maw'],
    ['Gefolgsmann', 'corvus-glaive'],
    ['Gefolgsfrau', 'proxima-midnight'],
    ['Gefolgsmann', 'cull-obsidian'],
  ],
  'thanos-2014': [
    ['Späteres Ich', 'thanos'],
    ['Ältere Tochter', 'gamora-2014'],
    ['Jüngere Tochter', 'nebula-2014'],
    ['Bezwinger', 'tony-stark'],
  ],
  'ebony-maw-2014': [
    ['Hauptfassung', 'ebony-maw'],
    ['Herr', 'thanos-2014'],
  ],
  'corvus-glaive-2014': [
    ['Hauptfassung', 'corvus-glaive'],
    ['Ehefrau', 'proxima-midnight-2014'],
    ['Herr', 'thanos-2014'],
  ],
  'proxima-midnight-2014': [
    ['Hauptfassung', 'proxima-midnight'],
    ['Ehemann', 'corvus-glaive-2014'],
    ['Herr', 'thanos-2014'],
  ],
  'cull-obsidian-2014': [
    ['Hauptfassung', 'cull-obsidian'],
    ['Herr', 'thanos-2014'],
  ],
  'vision': [
    ['Große Liebe', 'wanda-maximoff'],
    ['Schöpfer', 'tony-stark'],
    ['Schöpfer', 'ultron'],
    ['Bekannte', 'jocasta-angekuendigt'],
  ],
  'james-rhodes': [
    ['Bester Freund', 'tony-stark'],
  ],
  'pepper-potts': [
    ['Ehemann', 'tony-stark'],
    ['Vertrauter', 'happy-hogan'],
    ['Gegner', 'aldrich-killian'],
  ],
  'yelena-belova': [
    ['Schwester', 'natasha-romanoff'],
    ['Ziehvater', 'alexei'],
    ['Ziehmutter', 'melina-vostokoff'],
    ['Weggefährte', 'bob-sentry'],
    ['Erzfeind', 'general-dreykov'],
  ],
  'peggy-carter': [
    ['Fassung der Erde-838', 'peggy-carter-838'],
    ['Große Liebe', 'steve-rogers'],
    ['Verbündeter', 'howard-stark'],
    ['Großnichte', 'sharon-carter'],
    ['Befehlshaber', 'chester-phillips'],
  ],
  'peggy-carter-838': [
    ['Hauptfassung', 'peggy-carter'],
    ['Mörderin', 'wanda-maximoff'],
    ['Weggefährte', 'karl-mordo-838'],
  ],
  'maria-rambeau-838': [
    ['Hauptfassung', 'maria-rambeau'],
    ['Mörderin', 'wanda-maximoff'],
    ['Weggefährtin', 'peggy-carter-838'],
  ],
  'maria-rambeau-binary': [
    ['Hauptfassung', 'maria-rambeau'],
    ['Kollege', 'hank-mccoy-beast'],
  ],
  'reed-richards-838': [
    ['Hauptfassung', 'reed-richards-mister-fantastic'],
    ['Mörderin', 'wanda-maximoff'],
    ['Mitarbeiterin', 'christine-palmer-838'],
  ],
  'karl-mordo-838': [
    ['Hauptfassung', 'karl-mordo'],
    ['Gegenspieler', 'stephen-strange'],
    ['Weggefährtin', 'peggy-carter-838'],
  ],
  'christine-palmer-838': [
    ['Hauptfassung', 'christine-palmer'],
    ['Arbeitgeber', 'reed-richards-838'],
    ['Verbündeter', 'stephen-strange'],
  ],
  'jane-foster': [
    ['Große Liebe', 'thor'],
    ['Mentor', 'erik-selvig'],
    ['Freundin', 'darcy-lewis'],
    ['Gegenspieler', 'gorr'],
  ],
  'matt-murdock-daredevil': [
    ['Erzfeind', 'wilson-fisk-kingpin'],
    ['Vertraute', 'karen-page'],
    ['Gegenspieler', 'bullseye'],
    ['Weggefährte', 'frank-castle-punisher'],
    ['Beziehung', 'heather-glenn'],
    ['Bester Freund', 'franklin-nelson-foggy'],
    ['Gegenspieler', 'agent-cleary'],
    ['Schneider', 'luke-jacobson'],
    ['Weggefährte', 'luke-cage'],
    ['Mandant', 'white-tiger'],
    ['Mitstreiterin', 'jessica-jones'],
  ],
  'wilson-fisk-kingpin': [
    ['Erzfeind', 'matt-murdock-daredevil'],
    ['Ehefrau', 'vanessa-fisk'],
    ['Handlanger', 'bullseye'],
    ['Ziehtochter', 'maya-lopez-echo'],
    ['Geschäftspartner', 'mr-charles'],
  ],
  'kamala-khan-ms-marvel': [
    ['Vorbild', 'carol-danvers'],
    ['Mutter', 'muneeba-khan'],
    ['Bester Freund', 'bruno-carrelli'],
    ['Freundin', 'nakia-bahadir'],
    ['Vater', 'yusuf-khan'],
    ['Ermittler', 'agent-cleary'],
    ['Verbündeter', 'kareem-red-dagger'],
    ['Großmutter', 'sana-ali'],
  ],
  'monica-rambeau': [
    ['Mutter', 'maria-rambeau'],
    ['Patentante', 'carol-danvers'],
    ['Freundin', 'wanda-maximoff'],
    ['Vorgesetzter', 'tyler-hayward'],
  ],
  'john-walker': [
    ['Vorgänger', 'steve-rogers'],
    ['Rivale', 'sam-wilson'],
    ['Gegenspielerin', 'karli-morgenthau'],
  ],
  'sylvie': [
    ['Variante', 'loki'],
    ['Gegenspielerin', 'ravonna-renslayer'],
    ['Gegenspieler', 'der-da-bleibt'],
  ],
  'shang-chi': [
    ['Vater', 'wenwu-mandarin'],
    ['Schwester', 'xialing'],
    ['Beste Freundin', 'katy'],
    ['Mutter', 'ying-li'],
  ],
  'marc-spector-steven-grant-moon-knight': [
    ['Gott', 'khonshu'],
    ['Ehefrau', 'layla-el-faouly'],
    ['Erzfeind', 'arthur-harrow'],
    ['Geleiterin', 'taweret'],
  ],
  'love': [
    ['Vater', 'gorr'],
    ['Ziehvater', 'thor'],
  ],
  'jean-grey': [
    ['Schwester', 'sara-grey'],
    ['Erzfeind', 'william-metzger'],
    ['Retter', 'peter-parker'],
  ],
  'sara-grey': [
    ['Schwester', 'jean-grey'],
    ['Gegenspieler', 'william-metzger'],
  ],
  'william-metzger': [
    ['Gefangene', 'sara-grey'],
    ['Gegenspielerin', 'jean-grey'],
    ['Belogener Verbündeter', 'peter-parker'],
  ],
  'jean-dewolff': [
    ['Verbündeter', 'peter-parker'],
  ],
  'snow': [
    ['Gegner', 'peter-parker'],
    ['Vorgesetzter', 'william-metzger'],
    ['Beherrscherin', 'jean-grey'],
  ],
  'e-v': [
    ['Erbauer', 'peter-parker'],
  ],
  'paul-rabin': [
    ['Freundin', 'michelle-jones-watson'],
    ['Freund', 'ned-leeds'],
  ],
  'happy-hogan': [
    ['Chef', 'tony-stark'],
    ['Vertraute', 'pepper-potts'],
    ['Schützling', 'peter-parker'],
    ['Weggefährte', 'james-rhodes'],
  ],
  'howard-stark': [
    ['Sohn', 'tony-stark'],
    ['Weggefährte', 'steve-rogers'],
    ['Weggefährtin', 'peggy-carter'],
    ['Kollege', 'abraham-erskine'],
  ],
  'thaddeus-ross': [
    ['Tochter', 'betty-ross'],
    ['Gejagter', 'bruce-banner'],
    ['Handlanger', 'emil-blonsky-abomination'],
    ['Gegenspieler', 'steve-rogers'],
    ['Gegenspieler', 'sam-wilson'],
    ['Sicherheitschefin', 'leila-taylor'],
  ],
  'betty-ross': [
    ['Vater', 'thaddeus-ross'],
    ['Geliebter', 'bruce-banner'],
    ['Gegenspieler', 'emil-blonsky-abomination'],
  ],
  'emil-blonsky-abomination': [
    ['Vorgesetzter', 'thaddeus-ross'],
    ['Gegenspieler', 'bruce-banner'],
    ['Mandantin', 'jennifer-walters-she-hulk'],
    ['Mitgefangener', 'wong'],
    ['Gruppe', 'alejandro-montoya-el-aguila'],
    ['Gruppe', 'alexander-gentry-porcupine'],
    ['Gruppe', 'muzzafar-lambert-saracen'],
    ['Gruppe', 'william-taurens-man-bull'],
  ],
  'samuel-sterns-the-leader': [
    ['Gegenspieler', 'bruce-banner'],
    ['Gegenspieler', 'thaddeus-ross'],
    ['Gegenspieler', 'sam-wilson'],
  ],
  'may-parker': [
    ['Neffe', 'peter-parker'],
    ['Vertrauter', 'happy-hogan'],
    ['Bekannter', 'ned-leeds'],
    ['Gegenspieler', 'green-goblin'],
  ],
  'ned-leeds': [
    ['Bester Freund', 'peter-parker'],
    ['Freundin', 'michelle-jones-watson'],
    ['Mitschüler', 'flash-thompson'],
  ],
  'michelle-jones-watson': [
    ['Freund', 'peter-parker'],
    ['Freund', 'ned-leeds'],
    ['Bekannter', 'happy-hogan'],
  ],
  'j-jonah-jameson': [
    ['Gegenspieler', 'peter-parker'],
    ['Kronzeuge', 'quentin-beck-mysterio'],
  ],
  'scorpion': [
    ['Gegenspieler', 'peter-parker'],
    ['Weggefährte', 'adrian-toomes-vulture'],
  ],
  'e-d-i-t-h': [
    ['Erbauer', 'tony-stark'],
    ['Erbe', 'peter-parker'],
    ['Missbraucht von', 'quentin-beck-mysterio'],
  ],
  'heimdall': [
    ['Weggefährte', 'thor'],
    ['König', 'odin'],
    ['Gegenspieler', 'loki'],
    ['Weggefährtin', 'sif'],
  ],
  'odin': [
    ['Sohn', 'thor'],
    ['Ziehsohn', 'loki'],
    ['Ehefrau', 'frigga'],
    ['Tochter', 'hela'],
    ['Erzfeind', 'surtur'],
    ['Erzfeind', 'laufey'],
  ],
  'frigga': [
    ['Ehemann', 'odin'],
    ['Sohn', 'thor'],
    ['Ziehsohn', 'loki'],
    ['Mörder', 'kurse'],
  ],
  'sif': [
    ['Weggefährte', 'thor'],
    ['Weggefährte', 'heimdall'],
    ['Weggefährte', 'fandral'],
    ['Weggefährte', 'volstagg'],
    ['Weggefährte', 'hogun'],
  ],
  'fandral': [
    ['Weggefährte', 'thor'],
    ['Weggefährtin', 'sif'],
    ['Weggefährte', 'volstagg'],
    ['Weggefährte', 'hogun'],
  ],
  'hogun': [
    ['Weggefährte', 'thor'],
    ['Weggefährtin', 'sif'],
    ['Weggefährte', 'fandral'],
    ['Weggefährte', 'volstagg'],
  ],
  'volstagg': [
    ['Weggefährte', 'thor'],
    ['Weggefährtin', 'sif'],
    ['Weggefährte', 'fandral'],
    ['Weggefährte', 'hogun'],
  ],
  'erik-selvig': [
    ['Kollegin', 'jane-foster'],
    ['Kollegin', 'darcy-lewis'],
    ['Weggefährte', 'thor'],
    ['Beherrscht von', 'loki'],
  ],
  'darcy-lewis': [
    ['Mentorin', 'jane-foster'],
    ['Kollege', 'erik-selvig'],
    ['Bekannter', 'thor'],
    ['Ehemann', 'jimmy-woo'],
  ],
  'johann-schmidt-red-skull': [
    ['Erzfeind', 'steve-rogers'],
    ['Wissenschaftler', 'arnim-zola'],
    ['Gegenspielerin', 'peggy-carter'],
  ],
  'arnim-zola': [
    ['Vorgesetzter', 'johann-schmidt-red-skull'],
    ['Gegenspieler', 'steve-rogers'],
    ['Werk', 'bucky-barnes'],
  ],
  'alexander-pierce': [
    ['Gegenspieler', 'steve-rogers'],
    ['Vorgesetzter', 'nick-fury'],
    ['Werkzeug', 'bucky-barnes'],
  ],
  'crossbones': [
    ['Erzfeind', 'steve-rogers'],
    ['Vorgesetzter', 'alexander-pierce'],
    ['Gegenspielerin', 'wanda-maximoff'],
  ],
  'isaiah-bradley': [
    ['Nachfolger', 'sam-wilson'],
    ['Bekannter', 'bucky-barnes'],
    ['Enkel', 'eli-bradley'],
  ],
  'joaquin-torres-falcon': [
    ['Mentor', 'sam-wilson'],
    ['Bekannter', 'isaiah-bradley'],
  ],
  'valentina-allegra-de-fontaine': [
    ['Anwerbung', 'yelena-belova'],
    ['Anwerbung', 'john-walker'],
    ['Anwerbung', 'bob-sentry'],
    ['Vorgesetzter', 'thaddeus-ross'],
    ['Assistentin', 'mel'],
  ],
  'goose': [
    ['Halterin', 'carol-danvers'],
    ['Vertrauter', 'nick-fury'],
    ['Halterin', 'maria-rambeau'],
  ],
  'ronan': [
    ['Gegenspieler', 'peter-quill'],
    ['Auftraggeber', 'thanos'],
    ['Handlangerin', 'nebula'],
    ['Gegnerin', 'gamora'],
    ['Gefolgsmann', 'korath-der-verfolger'],
  ],
  'der-andere': [
    ['Herr', 'thanos'],
    ['Bote an', 'loki'],
    ['Bote an', 'ronan'],
  ],
  'the-collector': [
    ['Kunde', 'peter-quill'],
    ['Bruder', 'grandmaster'],
    ['Sammlerstück', 'howard-the-duck'],
  ],
  'howard-the-duck': [
    ['Sammler', 'the-collector'],
    ['Weggefährte', 'peter-quill'],
  ],
  'yondu': [
    ['Ziehsohn', 'peter-quill'],
    ['Erster Offizier', 'kraglin'],
    ['Ehemaliger Anführer', 'stakar-ogord'],
    ['Gegenspieler', 'ego'],
    ['Meuterer', 'taserface'],
  ],
  'stakar-ogord': [
    ['Verstoßener', 'yondu'],
    ['Weggefährte', 'martinex'],
  ],
  'martinex': [
    ['Anführer', 'stakar-ogord'],
    ['Weggefährte', 'yondu'],
  ],
  'ayesha': [
    ['Gegenspieler', 'peter-quill'],
    ['Sohn', 'adam-warlock'],
    ['Gegenspieler', 'rocket'],
    ['Söldner', 'yondu'],
    ['Verbündeter', 'high-evolutionary'],
  ],
  'ultron': [
    ['Erbauer', 'tony-stark'],
    ['Erbauer', 'bruce-banner'],
    ['Schöpfung', 'vision'],
    ['Verbündete', 'wanda-maximoff'],
    ['Verbündeter', 'pietro-maximoff'],
    ['Schöpfung', 'jocasta-angekuendigt'],
  ],
  'pietro-maximoff': [
    ['Zwillingsschwester', 'wanda-maximoff'],
    ['Verbündeter', 'ultron'],
    ['Weggefährte', 'clint-barton'],
    ['Peiniger', 'wolfgang-von-strucker'],
  ],
  'ulysses-klaue': [
    ['Gegenspieler', 't-challa'],
    ['Weggefährte', 'erik-killmonger'],
    ['Gegenspielerin', 'okoye'],
    ['Gegenspieler', 'everett-ross'],
  ],
  'laura-barton': [
    ['Ehemann', 'clint-barton'],
    ['Sohn', 'cooper-barton'],
    ['Tochter', 'lila-barton'],
    ['Sohn', 'nathaniel-barton'],
  ],
  'cooper-barton': [
    ['Vater', 'clint-barton'],
    ['Mutter', 'laura-barton'],
    ['Schwester', 'lila-barton'],
    ['Bruder', 'nathaniel-barton'],
  ],
  'lila-barton': [
    ['Vater', 'clint-barton'],
    ['Mutter', 'laura-barton'],
    ['Bruder', 'cooper-barton'],
    ['Bruder', 'nathaniel-barton'],
  ],
  'nathaniel-barton': [
    ['Vater', 'clint-barton'],
    ['Mutter', 'laura-barton'],
    ['Bruder', 'cooper-barton'],
    ['Schwester', 'lila-barton'],
  ],
  'jack-duquesne': [
    ['Verlobte', 'eleanor-bishop'],
    ['Stieftochter', 'kate-bishop'],
  ],
  'darren-cross': [
    ['Mentor', 'hank-pym'],
    ['Erzfeind', 'scott-lang'],
    ['Gegnerin', 'hope-van-dyne'],
    ['Dienstherr', 'kang-der-eroberer'],
  ],
  'luis': [
    ['Bester Freund', 'scott-lang'],
    ['Freund', 'dave'],
    ['Freund', 'kurt-goreshter'],
  ],
  'ava-starr': [
    ['Ziehvater', 'bill-foster'],
    ['Gegenspieler', 'scott-lang'],
    ['Helferin', 'janet-van-dyne'],
    ['Weggefährtin', 'yelena-belova'],
  ],
  'helmut-zemo': [
    ['Gegenspieler', 'steve-rogers'],
    ['Gegenspieler', 'tony-stark'],
    ['Bekannter', 'bucky-barnes'],
    ['Bekannter', 'sam-wilson'],
  ],
  't-chaka': [
    ['Sohn', 't-challa'],
    ['Tochter', 'shuri'],
    ['Ehefrau', 'koenigin-ramonda'],
    ['Neffe', 'erik-killmonger'],
  ],
  'koenigin-ramonda': [
    ['Sohn', 't-challa'],
    ['Tochter', 'shuri'],
    ['Ehemann', 't-chaka'],
    ['Vertraute', 'okoye'],
    ['Gegenspieler', 'namor'],
  ],
  'erik-killmonger': [
    ['Cousin', 't-challa'],
    ['Onkel', 't-chaka'],
    ['Weggefährte', 'ulysses-klaue'],
  ],
  'the-ancient-one': [
    ['Schüler', 'stephen-strange'],
    ['Schüler', 'karl-mordo'],
    ['Bibliothekar', 'wong'],
    ['Abtrünniger Schüler', 'kaecilius'],
  ],
  'mobius': [
    ['Vertrauter', 'loki'],
    ['Vorgesetzte', 'ravonna-renslayer'],
    ['Weggefährtin', 'hunter-b-15'],
    ['Bekannte', 'sylvie'],
  ],
  'alioth': [
    ['Wächter für', 'der-da-bleibt'],
    ['Bezwungen von', 'sylvie'],
    ['Bezwungen von', 'loki'],
  ],
  'der-da-bleibt': [
    ['Mörderin', 'sylvie'],
    ['Besucher', 'loki'],
    ['Wächter', 'alioth'],
    ['Variante', 'victor-timely'],
    ['Schöpfung', 'miss-minutes'],
  ],
  'mrs-hart': [
    ['Nachbarin', 'wanda-maximoff'],
    ['Nachbarin', 'agatha-harkness'],
  ],
  'bruno-carrelli': [
    ['Beste Freundin', 'kamala-khan-ms-marvel'],
    ['Freundin', 'nakia-bahadir'],
    ['Bekannte', 'muneeba-khan'],
  ],
  'frank-castle-punisher': [
    ['Weggefährte', 'matt-murdock-daredevil'],
    ['Gegenspieler', 'wilson-fisk-kingpin'],
    ['Weggefährte', 'curtis-hoyle'],
  ],
  'charles-xavier-professor-x': [
    ['Schüler', 'hank-mccoy-beast'],
    ['Weggefährte', 'reed-richards-838'],
    ['Weggefährtin', 'peggy-carter-838'],
    ['Gegenspielerin', 'wanda-maximoff'],
    ['Freund und Gegner', 'erik-lehnsherr-magneto'],
    ['Schüler', 'scott-summers-cyclops'],
    ['Ziehschwester', 'raven-darkhoelme-mystique'],
    ['Schüler', 'kurt-wagner-nightcrawler'],
  ],
  'hank-mccoy-beast': [
    ['Mentor', 'charles-xavier-professor-x'],
  ],
  'remy-lebeau-gambit': [
    ['Mitstreiterin', 'elektra'],
    ['Weggefährte', 'logan-wolverine'],
    ['Weggefährte', 'wade-wilson-deadpool'],
  ],
  'bob-sentry': [
    ['Vertraute', 'yelena-belova'],
    ['Erschaffen von', 'valentina-allegra-de-fontaine'],
    ['Weggefährte', 'bucky-barnes'],
    ['Weggefährte', 'john-walker'],
  ],
  'sue-storm-invisible-woman': [
    ['Ehemann', 'reed-richards-mister-fantastic'],
    ['Bruder', 'johnny-storm-human-torch'],
    ['Weggefährte', 'ben-grimm-the-thing'],
    ['Sohn', 'franklin-richards'],
    ['Friedensschluss', 'harvey-elder-mole-man'],
  ],
  'johnny-storm-human-torch': [
    ['Schwester', 'sue-storm-invisible-woman'],
    ['Schwager', 'reed-richards-mister-fantastic'],
    ['Weggefährte', 'ben-grimm-the-thing'],
    ['Hauptfassung', 'johnny-storm-121698'],
    ['Neffe', 'franklin-richards'],
  ],
  'ben-grimm-the-thing': [
    ['Bester Freund', 'reed-richards-mister-fantastic'],
    ['Weggefährtin', 'sue-storm-invisible-woman'],
    ['Weggefährte', 'johnny-storm-human-torch'],
    ['Gegner', 'giganto'],
    ['Bekannte', 'rachel-rozman'],
  ],
  'doctor-doom': [
    ['Erzfeind', 'reed-richards-mister-fantastic'],
    ['Gefangener', 'franklin-richards'],
  ],
  'johnny-storm-121698': [
    ['Mitstreiterin', 'elektra'],
    ['Hauptfassung', 'johnny-storm-human-torch'],
  ],
  'ladypool': [
    ['Hauptfassung', 'wade-wilson-deadpool'],
  ],
  'cowboypool': [
    ['Hauptfassung', 'wade-wilson-deadpool'],
  ],
  'kidpool': [
    ['Hauptfassung', 'wade-wilson-deadpool'],
  ],
  'samuraipool': [
    ['Hauptfassung', 'wade-wilson-deadpool'],
  ],
  'maggie-lang': [
    ['Frühere Ehe', 'scott-lang'],
    ['Tochter', 'cassie-lang'],
    ['Ehemann', 'jim-paxton'],
  ],
  'cassie-lang': [
    ['Mutter', 'maggie-lang'],
    ['Stiefvater', 'jim-paxton'],
  ],
  'jim-paxton': [
    ['Ehefrau', 'maggie-lang'],
    ['Stieftochter', 'cassie-lang'],
  ],
  'eli-bradley': [
    ['Großvater', 'isaiah-bradley'],
  ],
  'yusuf-khan': [
    ['Tochter', 'kamala-khan-ms-marvel'],
    ['Ehefrau', 'muneeba-khan'],
    ['Sohn', 'aamir-khan'],
  ],
  'muneeba-khan': [
    ['Ehemann', 'yusuf-khan'],
  ],
  'aamir-khan': [
    ['Vater', 'yusuf-khan'],
  ],
  'franklin-richards': [
    ['Vater', 'reed-richards-mister-fantastic'],
    ['Mutter', 'sue-storm-invisible-woman'],
    ['Onkel', 'johnny-storm-human-torch'],
    ['Beschützerin', 'h-e-r-b-i-e'],
  ],
  'skaar': [
    ['Vater', 'bruce-banner'],
  ],
  'ronnie-williams': [
    ['Tochter', 'riri-williams'],
  ],
  'riri-williams': [
    ['Mutter', 'ronnie-williams'],
    ['Gegner', 'john-king'],
    ['Bekannter', 'landon'],
    ['Freundin', 'zelma-stanton'],
    ['Schöpfung', 'n-a-t-a-l-i-e'],
    ['Gegner', 'ezekiel-stane'],
  ],
  'varra-priscilla-davis': [
    ['Ehemann', 'nick-fury'],
  ],
  'laura-x-23': [
    ['Mitstreiterin', 'elektra'],
    ['Vater', 'logan-wolverine'],
  ],
  'logan-wolverine': [
    ['Tochter', 'laura-x-23'],
    ['Halbbruder', 'victor-creed-sabretooth'],
    ['Mitstreiter', 'blade'],
    ['Weggefährte', 'colossus'],
  ],
  'victor-creed-sabretooth': [
    ['Halbbruder', 'logan-wolverine'],
    ['Mitstreiter', 'john-allerdyce-pyro'],
  ],
  'namora': [
    ['Gefolgsherr', 'namor'],
  ],
  'namor': [
    ['Vertraute', 'namora'],
    ['Berater', 'attuma'],
  ],
  'attuma': [
    ['Gefolgsherr', 'namor'],
  ],
  'aneka': [
    ['Gefährtin', 'ayo'],
  ],
  'ayo': [
    ['Gefährtin', 'aneka'],
  ],
  'heather-glenn': [
    ['Beziehung', 'matt-murdock-daredevil'],
  ],
  'franklin-nelson-foggy': [
    ['Bester Freund', 'matt-murdock-daredevil'],
  ],
  'curtis-hoyle': [
    ['Weggefährte', 'frank-castle-punisher'],
  ],
  'todd-phelps': [
    ['Widersacherin', 'jennifer-walters-she-hulk'],
    ['Handlanger', 'dirk-garthwaite-wrecker'],
    ['Anwältin', 'mallory-book'],
  ],
  'jennifer-walters-she-hulk': [
    ['Widersacher', 'todd-phelps'],
    ['Ausgesöhnt', 'dirk-garthwaite-wrecker'],
    ['Kollegin', 'mallory-book'],
    ['Schneider', 'luke-jacobson'],
  ],
  'liz-allan': [
    ['Vater', 'adrian-toomes-vulture'],
    ['Mitschüler', 'flash-thompson'],
  ],
  'adrian-toomes-vulture': [
    ['Tochter', 'liz-allan'],
  ],
  'agent-cleary': [
    ['Ermittelt gegen', 'peter-parker'],
    ['Ermittelt gegen', 'kamala-khan-ms-marvel'],
    ['Gegenspieler', 'matt-murdock-daredevil'],
    ['Ermittelt gegen', 'demarr-davis-doorman'],
  ],
  'leila-taylor': [
    ['Vorgesetzter', 'thaddeus-ross'],
  ],
  'alejandro-montoya-el-aguila': [
    ['Gruppenleiter', 'emil-blonsky-abomination'],
    ['Dauerstreit', 'william-taurens-man-bull'],
  ],
  'william-taurens-man-bull': [
    ['Dauerstreit', 'alejandro-montoya-el-aguila'],
    ['Gruppenleiter', 'emil-blonsky-abomination'],
  ],
  'alexander-gentry-porcupine': [
    ['Gruppenleiter', 'emil-blonsky-abomination'],
  ],
  'muzzafar-lambert-saracen': [
    ['Gruppenleiter', 'emil-blonsky-abomination'],
    ['Teegefährte', 'dirk-garthwaite-wrecker'],
  ],
  'dirk-garthwaite-wrecker': [
    ['Teegefährte', 'muzzafar-lambert-saracen'],
    ['Ausgesöhnt', 'jennifer-walters-she-hulk'],
    ['Auftraggeber', 'todd-phelps'],
  ],
  'craig-hollis-mr-immortal': [
    ['Anwältin', 'mallory-book'],
  ],
  'mallory-book': [
    ['Mandant', 'craig-hollis-mr-immortal'],
    ['Kollegin', 'jennifer-walters-she-hulk'],
    ['Kollegin', 'nikki-ramos'],
    ['Mandant', 'todd-phelps'],
  ],
  'nikki-ramos': [
    ['Kollegin', 'mallory-book'],
  ],
  'luke-jacobson': [
    ['Kundin', 'jennifer-walters-she-hulk'],
    ['Kunde', 'matt-murdock-daredevil'],
  ],
  'donny-blaze': [
    ['Lehrer', 'wong'],
  ],
  'wong': [
    ['Ehemaliger Schüler', 'donny-blaze'],
  ],
  'att-lass': [
    ['Befehlshaber', 'yon-rogg'],
    ['Kameradin', 'carol-danvers'],
  ],
  'yon-rogg': [
    ['Starforce', 'att-lass'],
    ['Starforce', 'bron-char'],
    ['Starforce', 'korath-der-verfolger'],
    ['Dienstherrin', 'supreme-intelligence'],
  ],
  'bron-char': [
    ['Befehlshaber', 'yon-rogg'],
    ['Kameradin', 'carol-danvers'],
  ],
  'korath-der-verfolger': [
    ['Befehlshaber', 'ronan'],
    ['Befehlshaber', 'yon-rogg'],
    ['Gegner', 'drax'],
  ],
  'drax': [
    ['Gegner', 'korath-der-verfolger'],
  ],
  'georges-batroc': [
    ['Erzfeind', 'sam-wilson'],
    ['Auftraggeberin', 'sharon-carter'],
  ],
  'sharon-carter': [
    ['Söldner', 'georges-batroc'],
  ],
  'clown': [
    ['Anführer', 'parker-robbins-the-hood'],
  ],
  'parker-robbins-the-hood': [
    ['Bande', 'clown'],
    ['Bande', 'slug'],
    ['Bande', 'jeri-blood'],
    ['Bande', 'roz-blood'],
    ['Cousin', 'john-king'],
    ['Gegnerin', 'zelma-stanton'],
    ['Dienstherr', 'mephisto'],
  ],
  'slug': [
    ['Anführer', 'parker-robbins-the-hood'],
  ],
  'jeri-blood': [
    ['Schwester', 'roz-blood'],
    ['Anführer', 'parker-robbins-the-hood'],
  ],
  'roz-blood': [
    ['Bruder', 'jeri-blood'],
    ['Anführer', 'parker-robbins-the-hood'],
  ],
  'john-king': [
    ['Cousin', 'parker-robbins-the-hood'],
    ['Gegnerin', 'riri-williams'],
  ],
  'landon': [
    ['Bekannte', 'riri-williams'],
  ],
  'zelma-stanton': [
    ['Freundin', 'riri-williams'],
    ['Gegner', 'parker-robbins-the-hood'],
  ],
  'dave': [
    ['Freund', 'luis'],
    ['Freund', 'scott-lang'],
    ['Freund', 'kurt-goreshter'],
  ],
  'kurt-goreshter': [
    ['Freund', 'luis'],
    ['Freund', 'scott-lang'],
    ['Freund', 'dave'],
  ],
  'sonny-burch': [
    ['Gegnerin', 'hope-van-dyne'],
  ],
  'jentorra': [
    ['Mitstreiter', 'quaz'],
    ['Verbündeter', 'scott-lang'],
  ],
  'quaz': [
    ['Anführerin', 'jentorra'],
    ['Verbündeter', 'scott-lang'],
  ],
  'krylar': [
    ['Frühere Liebe', 'janet-van-dyne'],
    ['Dienstherr', 'kang-der-eroberer'],
  ],
  'janet-van-dyne': [
    ['Frühere Liebe', 'krylar'],
  ],
  'kang-der-eroberer': [
    ['Statthalter', 'krylar'],
    ['Rat der Kangs', 'immortus'],
  ],
  'immortus': [
    ['Mitvorsitz', 'scarlet-centurion'],
    ['Mitvorsitz', 'rama-tut'],
    ['Verbannt', 'kang-der-eroberer'],
  ],
  'scarlet-centurion': [
    ['Mitvorsitz', 'immortus'],
    ['Mitvorsitz', 'rama-tut'],
  ],
  'rama-tut': [
    ['Mitvorsitz', 'immortus'],
    ['Mitvorsitz', 'scarlet-centurion'],
  ],
  'dimitri-smerdyakov': [
    ['Vorgesetzter', 'talos'],
    ['Beschattet', 'peter-parker'],
  ],
  'talos': [
    ['Mitarbeiter', 'dimitri-smerdyakov'],
  ],
  'flash-thompson': [
    ['Mitschüler', 'peter-parker'],
    ['Mitschüler', 'ned-leeds'],
    ['Mitschülerin', 'liz-allan'],
  ],
  'giganto': [
    ['Gegner', 'ben-grimm-the-thing'],
  ],
  'harvey-elder-mole-man': [
    ['Friedensschluss', 'sue-storm-invisible-woman'],
  ],
  'rachel-rozman': [
    ['Bekannter', 'ben-grimm-the-thing'],
  ],
  'eric-williams': [
    ['Bruder', 'simon-williams'],
    ['Mutter', 'martha-williams'],
    ['Vater', 'sanford-williams'],
  ],
  'simon-williams': [
    ['Bruder', 'eric-williams'],
    ['Mutter', 'martha-williams'],
    ['Vater', 'sanford-williams'],
    ['Agentin', 'janelle-jackson'],
    ['Regisseur', 'regisseur-von-kovak'],
  ],
  'martha-williams': [
    ['Sohn', 'eric-williams'],
    ['Sohn', 'simon-williams'],
    ['Ehemann', 'sanford-williams'],
  ],
  'sanford-williams': [
    ['Sohn', 'eric-williams'],
    ['Ehefrau', 'martha-williams'],
    ['Sohn', 'simon-williams'],
  ],
  'janelle-jackson': [
    ['Klient', 'simon-williams'],
    ['Agentur', 'trevor-slattery'],
  ],
  'trevor-slattery': [
    ['Agentin', 'janelle-jackson'],
    ['Auftraggeber', 'aldrich-killian'],
    ['Freund', 'morris'],
  ],
  'demarr-davis-doorman': [
    ['Ermittler', 'agent-cleary'],
  ],
  'mel': [
    ['Vorgesetzte', 'valentina-allegra-de-fontaine'],
  ],
  'miek': [
    ['Weggefährte', 'korg'],
    ['Weggefährte', 'thor'],
  ],
  'korg': [
    ['Weggefährtin', 'miek'],
  ],
  'tanngrisnir-und-tanngnjostr': [
    ['Halter', 'thor'],
  ],
  'taweret': [
    ['Geleit', 'marc-spector-steven-grant-moon-knight'],
    ['Ennead', 'khonshu'],
  ],
  'khonshu': [
    ['Ennead', 'taweret'],
    ['Gegner', 'arthur-harrow'],
    ['Ennead', 'ammit'],
  ],
  'tyler-hayward': [
    ['Untergebene', 'monica-rambeau'],
    ['Gegnerin', 'wanda-maximoff'],
    ['Schöpfung', 'white-vision'],
  ],
  'white-vision': [
    ['Auftraggeber', 'tyler-hayward'],
  ],
  'mr-charles': [
    ['Geschäftspartner', 'wilson-fisk-kingpin'],
  ],
  'luke-cage': [
    ['Weggefährte', 'matt-murdock-daredevil'],
  ],
  'pagon': [
    ['Anführer', 'gravik'],
    ['Mitstreiterin', 'g-iah'],
  ],
  'gravik': [
    ['Stellvertreter', 'pagon'],
  ],
  'g-iah': [
    ['Mitstreiter', 'pagon'],
  ],
  'pip-der-troll': [
    ['Weggefährte', 'eros-starfox'],
  ],
  'eros-starfox': [
    ['Weggefährte', 'pip-der-troll'],
  ],
  'prinz-yan': [
    ['Ehefrau', 'carol-danvers'],
  ],
  'kareem-red-dagger': [
    ['Verbündete', 'kamala-khan-ms-marvel'],
  ],
  'karun-patel': [
    ['Dienstherr', 'kingo'],
  ],
  'kingo': [
    ['Kammerdiener', 'karun-patel'],
  ],
  'elder-beast': [
    ['Dient', 'wanda-maximoff'],
  ],
  'john-allerdyce-pyro': [
    ['Dienstherrin', 'cassandra-nova'],
    ['Auftraggeber', 'mr-paradox'],
    ['Mitstreiter', 'victor-creed-sabretooth'],
  ],
  'cassandra-nova': [
    ['Gegnerin', 'elektra'],
    ['Handlanger', 'john-allerdyce-pyro'],
    ['Gefolgsmann', 'juggernaut'],
    ['Gefolgsmann', 'toad'],
    ['Gefolgsmann', 'azazel'],
  ],
  'mr-paradox': [
    ['Zuträger', 'john-allerdyce-pyro'],
  ],
  'abraham-erskine': [
    ['Schützling', 'steve-rogers'],
    ['Gegenspieler', 'johann-schmidt-red-skull'],
    ['Vorgesetzter', 'chester-phillips'],
    ['Kollege', 'howard-stark'],
  ],
  'chester-phillips': [
    ['Untergebener', 'steve-rogers'],
    ['Untergebene', 'peggy-carter'],
    ['Wissenschaftler', 'abraham-erskine'],
    ['Verbündeter', 'howard-stark'],
    ['Gefangener', 'arnim-zola'],
  ],
  'supreme-intelligence': [
    ['Statthalter', 'yon-rogg'],
    ['Gegnerin', 'carol-danvers'],
  ],
  'obadiah-stane': [
    ['Ziehsohn', 'tony-stark'],
    ['Geschäftspartner', 'howard-stark'],
    ['Handlanger', 'raza'],
    ['Gegnerin', 'pepper-potts'],
    ['Sohn', 'ezekiel-stane'],
  ],
  'raza': [
    ['Auftraggeber', 'obadiah-stane'],
    ['Gefangener', 'tony-stark'],
  ],
  'ivan-vanko-whiplash': [
    ['Erzfeind', 'tony-stark'],
    ['Auftraggeber', 'justin-hammer'],
    ['Gegenspieler', 'james-rhodes'],
  ],
  'justin-hammer': [
    ['Rivale', 'tony-stark'],
    ['Handlanger', 'ivan-vanko-whiplash'],
    ['Agentin', 'natasha-romanoff'],
  ],
  'laufey': [
    ['Sohn', 'loki'],
    ['Erzfeind', 'odin'],
    ['Gegner', 'thor'],
  ],
  'destroyer': [
    ['Wächter für', 'odin'],
    ['Werkzeug', 'loki'],
    ['Gegner', 'thor'],
  ],
  'malekith': [
    ['Erzfeind', 'thor'],
    ['Gefolgsmann', 'kurse'],
    ['Gegner', 'odin'],
    ['Gegnerin', 'jane-foster'],
  ],
  'kurse': [
    ['Herr', 'malekith'],
    ['Opfer', 'frigga'],
    ['Gegner', 'thor'],
  ],
  'aldrich-killian': [
    ['Erzfeind', 'tony-stark'],
    ['Gegnerin', 'pepper-potts'],
    ['Handlanger', 'trevor-slattery'],
    ['Gegenspieler', 'james-rhodes'],
  ],
  'eson': [
    ['Chronist', 'the-collector'],
    ['Artgenosse', 'arishem'],
    ['Artgenosse', 'tiamut'],
  ],
  'ego': [
    ['Sohn', 'peter-quill'],
    ['Dienerin', 'mantis'],
    ['Zuträger', 'yondu'],
    ['Gegnerin', 'gamora'],
  ],
  'taserface': [
    ['Ehemaliger Anführer', 'yondu'],
    ['Mitstreiter', 'kraglin'],
    ['Auftraggeberin', 'ayesha'],
    ['Gegner', 'rocket'],
  ],
  'krugarr': [
    ['Weggefährte', 'stakar-ogord'],
    ['Weggefährte', 'martinex'],
    ['Weggefährte', 'yondu'],
  ],
  'wolfgang-von-strucker': [
    ['Versuchsobjekt', 'wanda-maximoff'],
    ['Versuchsobjekt', 'pietro-maximoff'],
    ['Mörder', 'ultron'],
    ['Gegenspieler', 'tony-stark'],
  ],
  'melina-vostokoff': [
    ['Ziehtochter', 'natasha-romanoff'],
    ['Ziehtochter', 'yelena-belova'],
    ['Ehemann', 'alexei'],
    ['Erzfeind', 'general-dreykov'],
  ],
  'general-dreykov': [
    ['Tochter', 'taskmaster'],
    ['Agentin', 'natasha-romanoff'],
    ['Agentin', 'yelena-belova'],
    ['Gegnerin', 'melina-vostokoff'],
  ],
  'w-kabi': [
    ['Bester Freund', 't-challa'],
    ['Große Liebe', 'okoye'],
    ['Verbündeter', 'erik-killmonger'],
    ['Mörder', 'ulysses-klaue'],
  ],
  'zuri': [
    ['Schützling', 't-challa'],
    ['Vertrauter', 't-chaka'],
    ['Mörder', 'erik-killmonger'],
  ],
  'shocker': [
    ['Anführer', 'adrian-toomes-vulture'],
    ['Mitstreiter', 'scorpion'],
    ['Gegner', 'peter-parker'],
  ],
  'kaecilius': [
    ['Lehrerin', 'the-ancient-one'],
    ['Herr', 'dormammu'],
    ['Gegenspieler', 'stephen-strange'],
    ['Gegner', 'karl-mordo'],
  ],
  'dormammu': [
    ['Handlanger', 'kaecilius'],
    ['Bezwungen von', 'stephen-strange'],
  ],
  'hela': [
    ['Bruder', 'thor'],
    ['Bruder', 'loki'],
    ['Vater', 'odin'],
    ['Gefolgsmann', 'skurge'],
    ['Gegnerin', 'valkyrie'],
  ],
  'grandmaster': [
    ['Champion', 'bruce-banner'],
    ['Rechte Hand', 'topaz'],
    ['Untergebene', 'valkyrie'],
    ['Gegenspieler', 'thor'],
  ],
  'topaz': [
    ['Dienstherr', 'grandmaster'],
    ['Gegnerin', 'valkyrie'],
    ['Gegner', 'thor'],
  ],
  'skurge': [
    ['Dienstherrin', 'hela'],
    ['Vorgänger', 'heimdall'],
    ['Gegner', 'thor'],
  ],
  'surtur': [
    ['Erzfeind', 'odin'],
    ['Erweckt von', 'loki'],
    ['Gegner', 'thor'],
  ],
  'bill-foster': [
    ['Früherer Partner', 'hank-pym'],
    ['Ziehtochter', 'ava-starr'],
    ['Bekannter', 'scott-lang'],
  ],
  'ebony-maw': [
    ['Herr', 'thanos'],
    ['Mitstreiter', 'corvus-glaive'],
    ['Mitstreiterin', 'proxima-midnight'],
    ['Mitstreiter', 'cull-obsidian'],
    ['Gegenspieler', 'stephen-strange'],
  ],
  'corvus-glaive': [
    ['Herr', 'thanos'],
    ['Mitstreiterin', 'proxima-midnight'],
    ['Mitstreiter', 'ebony-maw'],
    ['Mitstreiter', 'cull-obsidian'],
    ['Bezwungen von', 'vision'],
  ],
  'proxima-midnight': [
    ['Herr', 'thanos'],
    ['Mitstreiter', 'corvus-glaive'],
    ['Mitstreiter', 'ebony-maw'],
    ['Mitstreiter', 'cull-obsidian'],
    ['Gegnerin', 'wanda-maximoff'],
  ],
  'cull-obsidian': [
    ['Herr', 'thanos'],
    ['Mitstreiter', 'ebony-maw'],
    ['Mitstreiter', 'corvus-glaive'],
    ['Mitstreiterin', 'proxima-midnight'],
    ['Bezwungen von', 'bruce-banner'],
  ],
  'eitri': [
    ['Kunde', 'thor'],
    ['Auftraggeber', 'odin'],
    ['Mörder', 'thanos'],
  ],
  'throg': [
    ['Variante', 'thor'],
    ['Bekannter', 'loki'],
  ],
  'hunter-b-15': [
    ['Vorgesetzte', 'ravonna-renslayer'],
    ['Kollege', 'mobius'],
  ],
  'ouroboros-o-b': [
    ['Freund', 'loki'],
    ['Freund', 'mobius'],
    ['Leser', 'victor-timely'],
  ],
  'victor-timely': [
    ['Variante', 'der-da-bleibt'],
    ['Vorbild', 'ouroboros-o-b'],
    ['Verbündete', 'ravonna-renslayer'],
    ['Bekannter', 'loki'],
  ],
  'jimmy-woo': [
    ['Kollegin', 'monica-rambeau'],
    ['Kollegin', 'darcy-lewis'],
    ['Vorgesetzter', 'tyler-hayward'],
    ['Ermittelt gegen', 'scott-lang'],
  ],
  'razor-fist': [
    ['Dienstherr', 'wenwu-mandarin'],
    ['Mitstreiter', 'death-dealer'],
    ['Verbündete', 'xialing'],
    ['Gegner', 'shang-chi'],
  ],
  'ying-li': [
    ['Ehemann', 'wenwu-mandarin'],
    ['Sohn', 'shang-chi'],
    ['Tochter', 'xialing'],
    ['Schwester', 'ying-nan'],
  ],
  'morris': [
    ['Freund', 'trevor-slattery'],
    ['Weggefährte', 'shang-chi'],
    ['Weggefährtin', 'katy'],
  ],
  'karli-morgenthau': [
    ['Gegenspieler', 'sam-wilson'],
    ['Gegner', 'john-walker'],
    ['Mörderin', 'sharon-carter'],
    ['Gegner', 'bucky-barnes'],
  ],
  'quentin-beck-mysterio': [
    ['Erzfeind', 'peter-parker'],
    ['Arbeitgeber', 'tony-stark'],
    ['Belogener Verbündeter', 'talos'],
    ['Sprachrohr', 'j-jonah-jameson'],
  ],
  'kro': [
    ['Gegnerin', 'sersi'],
    ['Opfer', 'ajak'],
    ['Opfer', 'gilgamesh'],
    ['Gegnerin', 'thena'],
  ],
  'arishem': [
    ['Schöpfung', 'sersi'],
    ['Schöpfung', 'ikaris'],
    ['Artgenosse', 'tiamut'],
    ['Artgenosse', 'nezarr'],
    ['Artgenosse', 'jemiah'],
  ],
  'tiamut': [
    ['Schöpfer', 'arishem'],
    ['Artgenosse', 'nezarr'],
    ['Artgenosse', 'jemiah'],
    ['Gegnerin', 'sersi'],
  ],
  'nezarr': [
    ['Herr', 'arishem'],
    ['Artgenosse', 'tiamut'],
    ['Artgenosse', 'jemiah'],
  ],
  'jemiah': [
    ['Herr', 'arishem'],
    ['Artgenosse', 'tiamut'],
    ['Artgenosse', 'nezarr'],
  ],
  'electro': [
    ['Erzfeind', 'peter-parker-garfield'],
    ['Gegner', 'peter-parker'],
    ['Mitstreiter', 'doc-ock'],
    ['Mitstreiter', 'green-goblin'],
  ],
  'curt-connors': [
    ['Erzfeind', 'peter-parker-garfield'],
    ['Gegner', 'peter-parker'],
    ['Mitstreiter', 'electro'],
    ['Mitstreiter', 'sandman'],
  ],
  'black-bolt': [
    ['Illuminati', 'charles-xavier-professor-x'],
    ['Illuminati', 'reed-richards-838'],
    ['Illuminati', 'peggy-carter-838'],
    ['Illuminati', 'karl-mordo-838'],
    ['Illuminati', 'maria-rambeau-838'],
    ['Gegnerin', 'wanda-maximoff'],
  ],
  'rintrah': [
    ['Mitstreiter', 'wong'],
    ['Mitstreiter', 'stephen-strange'],
    ['Gegnerin', 'wanda-maximoff'],
  ],
  'clea': [
    ['Weggefährte', 'stephen-strange'],
  ],
  'william-lopez': [
    ['Tochter', 'maya-lopez-echo'],
    ['Ziehsohn', 'kazi-kazimierczak'],
    ['Mörder', 'clint-barton'],
    ['Bruder', 'henry-lopez'],
  ],
  'ivan-banionis': [
    ['Anführerin', 'maya-lopez-echo'],
    ['Anführer', 'kazi-kazimierczak'],
    ['Bande', 'tomas'],
    ['Bande', 'enrique'],
    ['Gegner', 'clint-barton'],
  ],
  'tomas': [
    ['Anführerin', 'maya-lopez-echo'],
    ['Anführer', 'kazi-kazimierczak'],
    ['Bande', 'ivan-banionis'],
    ['Bande', 'dmitri'],
    ['Gegnerin', 'kate-bishop'],
  ],
  'enrique': [
    ['Anführerin', 'maya-lopez-echo'],
    ['Anführer', 'kazi-kazimierczak'],
    ['Bande', 'tomas'],
    ['Bande', 'dmitri'],
    ['Gegner', 'clint-barton'],
  ],
  'dmitri': [
    ['Anführerin', 'maya-lopez-echo'],
    ['Anführer', 'kazi-kazimierczak'],
    ['Bande', 'ivan-banionis'],
    ['Bande', 'enrique'],
    ['Gegnerin', 'kate-bishop'],
  ],
  'grills': [
    ['Freund', 'clint-barton'],
    ['Mitstreiterin', 'wendy-conrad'],
    ['Bekannte', 'kate-bishop'],
  ],
  'wendy-conrad': [
    ['Mitstreiter', 'grills'],
    ['Bekannter', 'clint-barton'],
    ['Bekannte', 'kate-bishop'],
  ],
  'lucky': [
    ['Halter', 'clint-barton'],
    ['Halterin', 'kate-bishop'],
    ['Bekannte', 'laura-barton'],
  ],
  'dogpool': [
    ['Halter', 'wade-wilson-deadpool'],
    ['Früherer Halter', 'nicepool'],
    ['Weggefährte', 'logan-wolverine'],
  ],
  'blade': [
    ['Mitstreiterin', 'elektra'],
    ['Mitstreiter', 'wade-wilson-deadpool'],
    ['Mitstreiter', 'logan-wolverine'],
    ['Mitstreiterin', 'laura-x-23'],
    ['Mitstreiter', 'remy-lebeau-gambit'],
    ['Gegnerin', 'cassandra-nova'],
  ],
  'juggernaut': [
    ['Dienstherrin', 'cassandra-nova'],
    ['Mitstreiter', 'toad'],
    ['Mitstreiter', 'azazel'],
    ['Gegner', 'wade-wilson-deadpool'],
  ],
  'toad': [
    ['Dienstherrin', 'cassandra-nova'],
    ['Mitstreiter', 'juggernaut'],
    ['Mitstreiter', 'azazel'],
    ['Mitstreiter', 'john-allerdyce-pyro'],
  ],
  'azazel': [
    ['Dienstherrin', 'cassandra-nova'],
    ['Mitstreiter', 'toad'],
    ['Mitstreiter', 'juggernaut'],
  ],
  'colossus': [
    ['Weggefährte', 'wade-wilson-deadpool'],
    ['Mitstreiter', 'logan-wolverine'],
  ],
  'layla-el-faouly': [
    ['Ehemann', 'marc-spector-steven-grant-moon-knight'],
    ['Göttin', 'taweret'],
    ['Gegner', 'arthur-harrow'],
    ['Gott', 'khonshu'],
  ],
  'arthur-harrow': [
    ['Göttin', 'ammit'],
    ['Erzfeind', 'marc-spector-steven-grant-moon-knight'],
    ['Gegnerin', 'layla-el-faouly'],
    ['Gegner', 'khonshu'],
  ],
  'ammit': [
    ['Avatar', 'arthur-harrow'],
    ['Ennead', 'khonshu'],
    ['Ennead', 'taweret'],
  ],
  'nakia-bahadir': [
    ['Beste Freundin', 'kamala-khan-ms-marvel'],
    ['Freund', 'bruno-carrelli'],
    ['Bekannter', 'kamran'],
  ],
  'kamran': [
    ['Verbündete', 'kamala-khan-ms-marvel'],
    ['Bekannte', 'nakia-bahadir'],
    ['Gegner', 'agent-cleary'],
  ],
  'sana-ali': [
    ['Enkelin', 'kamala-khan-ms-marvel'],
    ['Tochter', 'muneeba-khan'],
    ['Enkel', 'aamir-khan'],
  ],
  'gorr': [
    ['Erzfeind', 'thor'],
    ['Tochter', 'love'],
    ['Gegnerin', 'jane-foster'],
    ['Gegnerin', 'valkyrie'],
  ],
  'hercules': [
    ['Vater', 'zeus'],
  ],
  'piledriver': [
    ['Bande', 'dirk-garthwaite-wrecker'],
    ['Gegnerin', 'jennifer-walters-she-hulk'],
  ],
  'veb': [
    ['Weggefährte', 'scott-lang'],
    ['Weggefährtin', 'cassie-lang'],
    ['Mitstreiterin', 'jentorra'],
    ['Mitstreiter', 'quaz'],
  ],
  'high-evolutionary': [
    ['Schöpfung', 'rocket'],
    ['Schöpfung', 'lylla'],
    ['Schöpfung', 'teefs'],
    ['Schöpfung', 'floor'],
    ['Verbündete', 'ayesha'],
    ['Gegner', 'peter-quill'],
  ],
  'adam-warlock': [
    ['Schöpferin', 'ayesha'],
    ['Gegner', 'peter-quill'],
    ['Gegner', 'rocket'],
    ['Mitstreiter', 'groot'],
  ],
  'lylla': [
    ['Gefährtin', 'rocket'],
    ['Weggefährte', 'teefs'],
    ['Weggefährtin', 'floor'],
    ['Schöpfer', 'high-evolutionary'],
  ],
  'teefs': [
    ['Weggefährte', 'rocket'],
    ['Weggefährtin', 'lylla'],
    ['Weggefährtin', 'floor'],
    ['Schöpfer', 'high-evolutionary'],
  ],
  'floor': [
    ['Weggefährte', 'rocket'],
    ['Weggefährtin', 'lylla'],
    ['Weggefährte', 'teefs'],
    ['Schöpfer', 'high-evolutionary'],
  ],
  'phyla-vell': [
    ['Mitstreiter', 'rocket'],
    ['Mitstreiter', 'groot'],
    ['Mitstreiter', 'kraglin'],
    ['Weggefährte', 'cosmo'],
  ],
  'praesident-james-ritson': [
    ['Vertrauter', 'james-rhodes'],
    ['Bekannter', 'nick-fury'],
    ['Gegner', 'gravik'],
  ],
  'chula': [
    ['Enkelin', 'maya-lopez-echo'],
    ['Verwandte', 'bonnie'],
    ['Bekannter', 'henry-lopez'],
  ],
  'bonnie': [
    ['Cousine', 'maya-lopez-echo'],
    ['Großmutter', 'chula'],
    ['Onkel', 'henry-lopez'],
  ],
  'henry-lopez': [
    ['Nichte', 'maya-lopez-echo'],
    ['Bruder', 'william-lopez'],
    ['Gegner', 'wilson-fisk-kingpin'],
  ],
  'rio-vidal': [
    ['Geliebte', 'agatha-harkness'],
    ['Gejagter', 'billy-maximoff-wiccan'],
    ['Weggefährtin', 'lilia-calderu'],
    ['Weggefährtin', 'jennifer-kale'],
  ],
  'agatha-harkness': [
    ['Geliebte', 'rio-vidal'],
    ['Weggefährte', 'billy-maximoff-wiccan'],
    ['Weggefährtin', 'lilia-calderu'],
    ['Weggefährtin', 'jennifer-kale'],
    ['Weggefährtin', 'alice-wu-gulliver'],
    ['Nachbarin', 'mrs-hart'],
  ],
  'lilia-calderu': [
    ['Weggefährtin', 'agatha-harkness'],
    ['Weggefährtin', 'jennifer-kale'],
    ['Weggefährtin', 'alice-wu-gulliver'],
    ['Schützling', 'billy-maximoff-wiccan'],
  ],
  'jennifer-kale': [
    ['Weggefährtin', 'agatha-harkness'],
    ['Weggefährtin', 'lilia-calderu'],
    ['Weggefährtin', 'alice-wu-gulliver'],
    ['Weggefährte', 'billy-maximoff-wiccan'],
  ],
  'alice-wu-gulliver': [
    ['Mörderin', 'agatha-harkness'],
    ['Weggefährtin', 'lilia-calderu'],
    ['Weggefährtin', 'jennifer-kale'],
    ['Weggefährte', 'billy-maximoff-wiccan'],
  ],
  'billy-maximoff-wiccan': [
    ['Weggefährtin', 'agatha-harkness'],
    ['Gegnerin', 'rio-vidal'],
    ['Weggefährtin', 'lilia-calderu'],
    ['Weggefährtin', 'jennifer-kale'],
  ],
  'bullseye': [
    ['Erzfeind', 'matt-murdock-daredevil'],
    ['Opfer', 'franklin-nelson-foggy'],
    ['Gegnerin', 'karen-page'],
    ['Gegner', 'frank-castle-punisher'],
  ],
  'vanessa-fisk': [
    ['Ehemann', 'wilson-fisk-kingpin'],
    ['Gegner', 'matt-murdock-daredevil'],
    ['Bekannte', 'karen-page'],
  ],
  'muse': [
    ['Erzfeind', 'matt-murdock-daredevil'],
    ['Gegner', 'wilson-fisk-kingpin'],
  ],
  'karen-page': [
    ['Frühere Liebe', 'matt-murdock-daredevil'],
    ['Freund', 'franklin-nelson-foggy'],
    ['Vertrauter', 'frank-castle-punisher'],
    ['Gegner', 'wilson-fisk-kingpin'],
  ],
  'connor-powell': [
    ['Dienstherr', 'wilson-fisk-kingpin'],
    ['Kollege', 'cole-north'],
    ['Gegner', 'matt-murdock-daredevil'],
  ],
  'cole-north': [
    ['Kollege', 'connor-powell'],
    ['Ermittelt gegen', 'matt-murdock-daredevil'],
    ['Dienstherr', 'wilson-fisk-kingpin'],
  ],
  'white-tiger': [
    ['Anwalt', 'matt-murdock-daredevil'],
    ['Gegner', 'wilson-fisk-kingpin'],
  ],
  'jessica-jones': [
    ['Mitstreiter', 'matt-murdock-daredevil'],
    ['Gegner', 'wilson-fisk-kingpin'],
  ],
  'elektra': [
    ['Mitstreiter', 'blade'],
    ['Mitstreiter', 'remy-lebeau-gambit'],
    ['Mitstreiterin', 'laura-x-23'],
    ['Mitstreiter', 'johnny-storm-121698'],
    ['Gegnerin', 'cassandra-nova'],
  ],
  'n-a-t-a-l-i-e': [
    ['Erbauerin', 'riri-williams'],
    ['Gegner', 'parker-robbins-the-hood'],
  ],
  'ezekiel-stane': [
    ['Vater', 'obadiah-stane'],
    ['Gegnerin', 'riri-williams'],
    ['Auftraggeber', 'parker-robbins-the-hood'],
  ],
  'mephisto': [
    ['Handlanger', 'parker-robbins-the-hood'],
    ['Gegnerin', 'riri-williams'],
  ],
  'galactus': [
    ['Herold', 'silver-surfer'],
    ['Gegner', 'reed-richards-mister-fantastic'],
    ['Auserwählter', 'franklin-richards'],
  ],
  'silver-surfer': [
    ['Herr', 'galactus'],
    ['Gegnerin', 'sue-storm-invisible-woman'],
    ['Verbündeter', 'johnny-storm-human-torch'],
  ],
  'h-e-r-b-i-e': [
    ['Erbauer', 'reed-richards-mister-fantastic'],
    ['Weggefährtin', 'sue-storm-invisible-woman'],
    ['Schützling', 'franklin-richards'],
  ],
  'regisseur-von-kovak': [
    ['Hauptdarsteller', 'simon-williams'],
    ['Darsteller', 'trevor-slattery'],
    ['Agentin', 'janelle-jackson'],
  ],
  'lonnie-lincoln-tombstone': [
    ['Gegner', 'peter-parker'],
  ],
  'fred-myers-boomerang': [
    ['Gegner', 'peter-parker'],
  ],
  'tarantula': [
    ['Gegner', 'peter-parker'],
  ],
  'jocasta-angekuendigt': [
    ['Schöpfer', 'ultron'],
    ['Bekannter', 'vision'],
  ],
  'erik-lehnsherr-magneto': [
    ['Freund und Gegner', 'charles-xavier-professor-x'],
    ['Weggefährtin', 'raven-darkhoelme-mystique'],
    ['Gegner', 'scott-summers-cyclops'],
  ],
  'scott-summers-cyclops': [
    ['Mentor', 'charles-xavier-professor-x'],
    ['Mitstreiter', 'hank-mccoy-beast'],
    ['Mitstreiter', 'kurt-wagner-nightcrawler'],
    ['Gegner', 'erik-lehnsherr-magneto'],
  ],
  'raven-darkhoelme-mystique': [
    ['Ziehbruder', 'charles-xavier-professor-x'],
    ['Weggefährte', 'erik-lehnsherr-magneto'],
    ['Sohn', 'kurt-wagner-nightcrawler'],
  ],
  'kurt-wagner-nightcrawler': [
    ['Mutter', 'raven-darkhoelme-mystique'],
    ['Mentor', 'charles-xavier-professor-x'],
    ['Mitstreiter', 'scott-summers-cyclops'],
  ],
  'mantis': [
    ['Dienstherr', 'ego'],
  ],
  'okoye': [
    ['Große Liebe', 'w-kabi'],
  ],
  'hank-pym': [
    ['Früherer Partner', 'bill-foster'],
  ],
  'wenwu-mandarin': [
    ['Ehefrau', 'ying-li'],
  ],
  'xialing': [
    ['Mutter', 'ying-li'],
  ],
  'ying-nan': [
    ['Schwester', 'ying-li'],
  ],
  'sersi': [
    ['Schöpfer', 'arishem'],
  ],
  'ikaris': [
    ['Schöpfer', 'arishem'],
  ],
  'zeus': [
    ['Sohn', 'hercules'],
  ],
  'maya-lopez-echo': [
    ['Vater', 'william-lopez'],
    ['Großmutter', 'chula'],
    ['Cousine', 'bonnie'],
    ['Onkel', 'henry-lopez'],
  ],
  'kate-bishop': [
    ['Hund', 'lucky'],
  ],
};;;
