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
     powers   Kräfte und Ausrüstung als Stichworte, nicht als Satz.

   Die Datei hat zwei Teile. CHAR_FACTS zwischen den Marken @wiki:anfang
   und @wiki:ende stammt aus den beiden Marvel-Wikis und wird von
   tools/fetch-facts.py und tools/build-facts.py erzeugt: Spezies, Status
   und Zugehörigkeit aus dem MCU-Wiki, Größe und Geburtsort aus der
   Marvel Database (Earth-199999). Von Hand geändert wird dort nichts,
   der nächste Lauf überschriebe es.

   CHAR_FACTS_EXTRA steht daneben und gehört der Handarbeit. Es liegt
   beim Anzeigen über dem Generat, Feld für Feld, und trägt dreierlei:

     - Kräfte, denn die stehen in keiner der beiden Infoboxen und lassen
       sich deshalb überhaupt nicht abfragen.
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
  'praesident-ritson': {
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
    origin: 'East Asia',
    species: 'Mensch',
    height: '1,70 m',
    teams: ['Chaste', 'Hand'],
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
    powers: ['übermenschliche Kraft und Ausdauer', 'Vibranium-Schild', 'altert kaum'],
  },
  'peggy-carter': {
    powers: ['Nahkampf und Schusswaffen', 'Feldagentin der SSR', 'Gründerin von S.H.I.E.L.D.'],
  },
  'peggy-carter-838': {
    origin: 'Erde-838',
    species: 'Mensch, verstärkt durch das Supersoldaten-Serum',
    teams: ['Illuminati', 'Avengers'],
    status: 'Verstorben',
    powers: ['Supersoldaten-Serum', 'Schild in den Farben des Union Jack', 'Jetpack'],
  },
  'bucky-barnes': {
    powers: ['Supersoldaten-Serum', 'Vibranium-Arm', 'Scharfschütze'],
  },
  'johann-schmidt-red-skull': {
    origin: 'Deutschland',
    species: 'Mensch, verstärkt durch das Supersoldaten-Serum',
    height: '1,88 m',
    powers: ['unfertiges Supersoldaten-Serum', 'Waffen aus Tesserakt-Energie', 'Wächter des Seelensteins'],
  },
  'howard-stark': {
    height: '1,80 m',
    powers: ['Erfindergeist', 'Waffen- und Flugtechnik', 'schmiedete das Vibranium-Schild'],
  },
  'abraham-erskine': {
    height: '1,78 m',
    powers: ['Entwickler des Supersoldaten-Serums', 'Menschenkenntnis'],
  },
  'carol-danvers': {
    height: '1,68 m',
    powers: ['Energieprojektion', 'Flug', 'Widerstandskraft im All'],
  },
  'nick-fury': {
    powers: ['Spionage', 'Führung der Avengers-Initiative', 'Taktik'],
  },
  'talos': {
    origin: 'Skrullos',
    height: '1,80 m',
    powers: ['Gestaltwandel', 'Nahkampf', 'Anführer der Skrull-Flüchtlinge'],
  },
  'yon-rogg': {
    powers: ['Kree-Kampfausbildung', 'Photonenblaster', 'Ausbilder der Starforce'],
  },
  'maria-rambeau': {
    height: '1,78 m',
    powers: ['Kampfpilotin', 'Nervenstärke', 'Technikverstand'],
  },
  'maria-rambeau-838': {
    origin: 'Erde-838',
    species: 'Mensch-Kree-Hybrid',
    teams: ['Illuminati'],
    status: 'Verstorben',
    height: '1,78 m',
    powers: ['Energieprojektion', 'Flug', 'Widerstandskraft im All'],
  },
  'maria-rambeau-binary': {
    origin: 'andere Welt',
    species: 'Mensch',
    status: 'Am Leben',
    height: '1,78 m',
    powers: ['Heldin ihrer Welt unter dem Namen Binary'],
  },
  'goose': {
    origin: 'unbekannte Welt',
    teams: ['Mar-Vells Labor', 'S.H.I.E.L.D.'],
    height: '0,25 m',
    powers: ['Tentakel aus dem Rachen', 'Taschendimension im Magen', 'verschluckte den Tesserakt'],
  },
  'supreme-intelligence': {
    species: 'Künstliche Intelligenz der Kree',
    powers: ['gebündelter Verstand des Kree-Imperiums', 'erscheint als der Mensch, den man verehrt', 'Befehl über die Starforce'],
  },
  'tony-stark': {
    powers: ['Iron-Man-Rüstungen', 'Arc-Reaktor', 'Erfindergeist'],
  },
  'pepper-potts': {
    height: '1,75 m',
    powers: ['Führung von Stark Industries', 'Rescue-Rüstung', 'zeitweise Extremis'],
  },
  'james-rhodes': {
    powers: ['War-Machine-Rüstung', 'schwere Bewaffnung', 'Offizier der Air Force'],
  },
  'obadiah-stane': {
    powers: ['Iron-Monger-Rüstung', 'Stark Industries im Rücken', 'Waffenhandel'],
  },
  'happy-hogan': {
    teams: ['Stark Industries'],
    height: '1,78 m',
    powers: ['Personenschutz', 'Boxen', 'Leitung der Stark-Sicherheit'],
  },
  'phil-coulson': {
    origin: 'Manitowoc, Wisconsin',
    height: '1,83 m',
    powers: ['S.H.I.E.L.D.-Agent', 'Destroyer-Kanone', 'Ruhe in jeder Lage'],
  },
  'raza': {
    height: '1,80 m',
    powers: ['Befehl über die Zehn Ringe in Afghanistan', 'Arsenal aus Stark-Waffen'],
  },
  'ivan-vanko-whiplash': {
    height: '1,80 m',
    powers: ['nachgebauter Arc-Reaktor', 'Elektropeitschen', 'Physiker'],
  },
  'justin-hammer': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Hammer Industries', 'Verteidigungsministerium'],
    status: 'Am Leben',
    powers: ['Rüstungsunternehmer', 'Hammer-Drohnen', 'Ex-Wife-Rakete'],
  },
  'betty-ross': {
    height: '1,75 m',
    teams: ['Culver University'],
    powers: ['Zellbiologin', 'Gammaforschung', 'Zugang zu ihrem Vater'],
  },
  'thaddeus-ross': {
    height: '1,85 m',
    powers: ['Befehl über die US-Armee', 'Verwandlung in Red Hulk', 'Präsident der USA'],
  },
  'emil-blonsky-abomination': {
    species: 'Mensch, verstärkt durch Serum und Gammastrahlung',
    powers: ['Verwandlung in Abomination', 'Ausbildung bei den Royal Marines', 'übermenschliche Kraft'],
  },
  'samuel-sterns-the-leader': {
    height: '1,73 m',
    teams: ['Culver University'],
    powers: ['gammaverstärkter Verstand', 'Zellbiologe', 'Pläne über Jahrzehnte'],
  },
  'bruce-banner': {
    teams: ['Avengers', 'Revengers'],
    species: 'Mensch, durch Gammastrahlung verwandelt',
    powers: ['Verwandlung in Hulk', 'unbegrenzte Kraft', 'Heilung in Sekunden'],
  },
  'thor': {
    height: '1,90 m',
    powers: ['Donner und Blitz', 'Mjölnir und Stormbreaker', 'jahrtausendealt'],
  },
  'loki': {
    powers: ['Illusionen und Gestaltwandel', 'Magie', 'Zeitkontrolle als Hüter'],
  },
  'jane-foster': {
    height: '1,60 m',
    powers: ['Astrophysikerin', 'als Mighty Thor Trägerin des Mjölnir', 'Einstein-Rosen-Brücken'],
  },
  'odin': {
    height: '1,83 m',
    powers: ['Odinkraft', 'Speer Gungnir', 'Herrscher der Neun Reiche'],
  },
  'heimdall': {
    teams: ['Asgard', 'Wächter des Bifröst'],
    height: '1,93 m',
    powers: ['sieht und hört alles in den Neun Reichen', 'Wächter des Bifröst', 'Schwert Hofund'],
  },
  'sif': {
    teams: ['Asgard', 'Asgardische Armee'],
    height: '1,73 m',
    powers: ['asgardische Kriegerin', 'Doppelklinge', 'übermenschliche Kraft'],
  },
  'fandral': {
    height: '1,85 m',
    powers: ['Fechtkunst', 'asgardische Zähigkeit', 'Krieger der Drei'],
  },
  'hogun': {
    height: '1,75 m',
    powers: ['Streitkolben', 'Nahkampf', 'Krieger der Drei'],
  },
  'volstagg': {
    height: '1,93 m',
    powers: ['rohe Kraft', 'Axt und Streitkolben', 'Krieger der Drei'],
  },
  'laufey': {
    height: '2,13 m',
    powers: ['Eis aus bloßer Hand', 'Kälteberührung', 'König von Jötunheim'],
  },
  'destroyer': {
    species: 'Asgardischer Konstrukt',
    origin: 'Asgard',
    height: '2,90 m',
    powers: ['Feuerstrahl aus dem Visier', 'nahezu unzerstörbar', 'gehorcht nur dem König'],
  },
  'erik-selvig': {
    height: '1,80 m',
    powers: ['Astrophysiker', 'Kenner der Neun Reiche', 'Bau des Konvergenz-Messgeräts'],
  },
  'natasha-romanoff': {
    powers: ['Nahkampf und Spionage', 'Widow-Bites', 'im Roten Raum ausgebildet'],
  },
  'clint-barton': {
    powers: ['Bogen und Trickpfeile', 'Nahkampf', 'trifft immer'],
  },
  'thanos': {
    height: '2,49 m',
    powers: ['übermenschliche Kraft', 'Infinity-Handschuh', 'Feldherr'],
  },
  'thanos-2014': {
    origin: 'Titan',
    species: 'Titan',
    teams: ['Black Order'],
    status: 'Verstorben',
    height: '2,49 m',
    powers: ['übermenschliche Kraft', 'Doppelklingenschwert', 'Feldherr'],
  },
  'maria-hill': {
    powers: ['stellvertretende Direktorin von S.H.I.E.L.D.', 'Feldeinsatz und Schusswaffen', 'Logistik'],
  },

  /* ---------- Phase Two ---------- */
  'malekith': {
    height: '1,88 m',
    powers: ['Herrschaft über den Äther', 'Dunkelelfen-Flotte', 'Anführer der Dunkelelfen'],
  },
  'frigga': {
    height: '1,73 m',
    powers: ['asgardische Zauberkunst', 'Schwertkampf', 'Königin von Asgard'],
  },
  'the-collector': {
    origin: 'Knowhere',
    height: '1,80 m',
    powers: ['Sammlung kosmischer Artefakte', 'Wissen über die Infinity-Steine', 'nahezu unsterblich'],
  },
  'aldrich-killian': {
    height: '1,88 m',
    powers: ['Extremis-Virus', 'Hitze aus bloßer Hand', 'Gründer von A.I.M.'],
  },
  'trevor-slattery': {
    origin: 'Liverpool, England',
    height: '1,73 m',
    powers: ['Schauspieler', 'Gesicht des falschen Mandarin', 'Bühnenpräsenz'],
  },
  'sam-wilson': {
    height: '1,83 m',
    powers: ['Flügelanzug', 'Vibranium-Schild', 'Redwing'],
  },
  'alexander-pierce': {
    height: '1,85 m',
    powers: ['Leitung des Weltsicherheitsrats', 'HYDRA an der Spitze von S.H.I.E.L.D.', 'Projekt Einsicht'],
  },
  'crossbones': {
    height: '1,83 m',
    powers: ['Nahkampf', 'Panzerhandschuhe', 'STRIKE-Einheit'],
  },
  'pietro-maximoff': {
    species: 'Mensch, verändert durch den Zepterstein',
    height: '1,88 m',
    powers: ['Überschallgeschwindigkeit', 'schnelle Heilung', 'Nahkampf im Lauf'],
  },
  'wanda-maximoff': {
    height: '1,68 m',
    powers: ['Chaosmagie', 'Telekinese', 'Realität formen'],
  },
  'wanda-maximoff-838': {
    origin: 'Erde-838',
    species: 'Mensch',
    teams: ['Avengers'],
    status: 'Am Leben',
    height: '1,68 m',
    powers: ['Chaosmagie', 'Telekinese', 'Flug'],
  },
  'peter-quill': {
    height: '1,88 m',
    powers: ['Element-Blaster', 'Raketenstiefel', 'halb Celestial'],
  },
  'gamora': {
    height: '1,83 m',
    powers: ['tödlichste Frau der Galaxis', 'Schwert Godslayer', 'kybernetisch verstärkt'],
  },
  'gamora-2014': {
    origin: 'Zen-Whoberi',
    species: 'Zehoberei',
    teams: ['Ravagers', 'Black Order'],
    status: 'Am Leben',
    height: '1,83 m',
    powers: ['Schwert- und Nahkampf', 'kybernetisch verstärkt', 'Attentäterin des Thanos'],
  },
  'drax': {
    origin: 'Kylos',
    height: '1,96 m',
    powers: ['übermenschliche Kraft', 'Klingen im Nahkampf', 'nimmt jedes Wort wörtlich'],
  },
  'rocket': {
    species: 'Halfworlder (Waschbär)',
    height: '1,20 m',
    powers: ['Waffenbau', 'Pilot', 'Taktik'],
  },
  'groot': {
    height: '2,30 m',
    powers: ['Äste und Ranken wachsen lassen', 'nachwachsend', 'übermenschliche Kraft'],
  },
  'yondu': {
    origin: 'Centauri IV',
    powers: ['Yaka-Pfeil per Pfiff', 'Anführer der Ravager', 'Nahkampf'],
  },
  'ronan': {
    status: 'Verstorben',
    species: 'Kree',
    origin: 'Hala',
    teams: ['Kree-Imperium', 'Accuser Corps'],
    height: '2,08 m',
    powers: ['Universalwaffe', 'übermenschliche Kraft', 'Flotte des Kree-Imperiums'],
  },
  'nebula': {
    origin: 'Luphom',
    height: '1,85 m',
    powers: ['kybernetische Glieder', 'Nahkampf', 'schmerzunempfindlich'],
  },
  'nebula-2014': {
    origin: 'Luphom',
    species: 'Luphomoide (Cyborg)',
    teams: ['Black Order'],
    status: 'Verstorben',
    height: '1,85 m',
    powers: ['kybernetische Glieder', 'Nahkampf', 'Speicher, der sich mit dem eigenen Ich verbindet'],
  },
  'ego': {
    origin: 'eigener Planet',
    teams: ['Celestials'],
    height: '1,88 m',
    powers: ['Planet als eigener Körper', 'Materie formen', 'nahezu unsterblich'],
  },
  'mantis': {
    origin: 'Egos Planet',
    powers: ['Gefühle lesen und lenken', 'Schlaf durch Berührung', 'Antennen als Sinnesorgan'],
  },
  'taserface': {
    species: 'Außerirdischer',
    origin: 'unbekannte Welt',
    height: '1,88 m',
    powers: ['Bordwaffen der Ravager', 'Meuterei gegen Yondu'],
  },
  'stakar-ogord': {
    height: '1,88 m',
    powers: ['Anführer der hundert Ravager-Clans', 'Energiestrahlen', 'Raumkampf'],
  },
  'ultron': {
    origin: 'Avengers Tower, New York City',
    teams: ['Ultron-Sentinels'],
    powers: ['überträgt sich in jeden Rechner', 'Vibranium-Körper', 'Roboterarmee'],
  },
  'vision': {
    origin: 'U-Gin Genetics, Seoul',
    height: '1,91 m',
    powers: ['Geist-Stein', 'Dichte verändern', 'Flug'],
  },
  'scott-lang': {
    height: '1,80 m',
    powers: ['Pym-Partikel', 'Größe verändern', 'befehligt Ameisen'],
  },
  'hank-pym': {
    height: '1,80 m',
    powers: ['Erfinder der Pym-Partikel', 'erster Ant-Man', 'Ameisenforschung'],
  },
  'hope-van-dyne': {
    height: '1,73 m',
    powers: ['Pym-Partikel', 'Flügel und Blaster', 'Nahkampf'],
  },
  'darren-cross': {
    species: 'Mensch, im Quantenreich zu MODOK umgebaut',
    height: '1,78 m',
    powers: ['Yellowjacket-Anzug', 'Pym-Partikel nachgebaut', 'als MODOK Panzerung und Energiestrahlen'],
  },
  'luis': {
    height: '1,75 m',
    powers: ['Einbruch und Diebstahl', 'Netzwerk in der ganzen Stadt', 'erzählt jede Geschichte ausführlich'],
  },

  /* ---------- Phase Three ---------- */
  't-challa': {
    height: '1,83 m',
    powers: ['Herzförmiges Kraut', 'Vibranium-Anzug', 'Wakandas Thron'],
  },
  'peter-parker': {
    origin: 'Queens, New York City, New York',
    species: 'Mensch, durch einen Spinnenbiss verändert',
    height: '1,78 m',
    powers: ['Wandhaftung', 'Spinnensinn', 'Netzschleudern'],
  },
  'peter-parker-maguire': {
    origin: 'New York City',
    species: 'Mensch, durch einen Spinnenbiss verändert',
    status: 'Am Leben',
    powers: ['Netze aus den Handgelenken', 'Spinnensinn', 'Wandhaftung'],
  },
  'peter-parker-garfield': {
    origin: 'New York City',
    species: 'Mensch, durch einen Spinnenbiss verändert',
    status: 'Am Leben',
    powers: ['selbstgebaute Netzschleudern', 'Spinnensinn', 'Wandhaftung'],
  },
  'helmut-zemo': {
    height: '1,78 m',
    powers: ['Offizier der Sokovia-Spezialeinheit', 'Planung über Jahre', 'die zehn Auslösewörter'],
  },
  't-chaka': {
    height: '1,80 m',
    powers: ['Herzförmiges Kraut', 'Vibranium-Anzug', 'König von Wakanda'],
  },
  'alexei': {
    species: 'Mensch, verstärkt durch das Supersoldaten-Serum',
    origin: 'Sowjetunion',
    teams: ['Thunderbolts', 'Roter Raum', 'Sowjetarmee'],
    powers: ['sowjetisches Supersoldaten-Serum', 'übermenschliche Kraft', 'unzerstörbarer Schild'],
  },
  'melina-vostokoff': {
    height: '1,70 m',
    powers: ['Wissenschaftlerin des Roten Raums', 'chemische Gedankenkontrolle', 'im Roten Raum ausgebildet'],
  },
  'taskmaster': {
    origin: 'Russland',
    height: '1,73 m',
    powers: ['ahmt jede Bewegung nach', 'Schild, Bogen und Schwert', 'Photonenkopie im Helm'],
  },
  'general-dreykov': {
    height: '1,80 m',
    powers: ['Leitung des Roten Raums', 'Kontrolle über die Witwen', 'Netz aus Schläfern'],
  },
  'rick-mason': {
    height: '1,80 m',
    teams: ['S.H.I.E.L.D.'],
    powers: ['Beschaffer für Untergetauchte', 'Papiere und Waffen', 'Kontakte in alle Länder'],
  },
  'erik-killmonger': {
    height: '1,80 m',
    powers: ['Herzförmiges Kraut', 'Vibranium-Anzug', 'Ausbildung bei den Navy SEALs'],
  },
  'shuri': {
    height: '1,70 m',
    powers: ['Vibranium-Technik', 'Herzförmiges Kraut', 'Erfindergeist'],
  },
  'okoye': {
    height: '1,73 m',
    powers: ['Vibranium-Speer', 'Generalin der Dora Milaje', 'Nahkampf'],
  },
  'nakia': {
    height: '1,68 m',
    powers: ['Ringklingen', 'Spionage als War Dog', 'Nahkampf'],
  },
  'm-baku': {
    height: '1,96 m',
    powers: ['rohe Kraft', 'Keule', 'Anführer der Jabari'],
  },
  'everett-ross': {
    height: '1,73 m',
    powers: ['CIA-Agent', 'Kampfpilot', 'Verhandlung'],
  },
  'w-kabi': {
    height: '1,83 m',
    powers: ['Vibranium-Waffen', 'Kriegsnashörner', 'Anführer des Grenzstamms'],
  },
  'zuri': {
    height: '1,88 m',
    powers: ['Hüter des Herzförmigen Krauts', 'Schamane Wakandas', 'War Dog im Ruhestand'],
  },
  'adrian-toomes-vulture': {
    height: '1,80 m',
    powers: ['Flügelanzug aus Chitauri-Technik', 'Bergungsunternehmer', 'Waffenhandel'],
  },
  'scorpion': {
    height: '1,80 m',
    teams: ['Sinister Six'],
    powers: ['Waffenhandel', 'Kontakte im Gefängnis'],
  },
  'ned-leeds': {
    height: '1,75 m',
    powers: ['Hacken und Programmieren', 'der Mann auf dem Stuhl', 'kurzzeitig Portale'],
  },
  'may-parker': {
    teams: ['F.E.A.S.T.'],
    height: '1,68 m',
    powers: ['Hilfe für Wohnungslose', 'Rückhalt für Peter', 'der Satz von der großen Verantwortung'],
  },
  'stephen-strange': {
    height: '1,88 m',
    powers: ['Magie der Mystischen Künste', 'Umhang der Levitation', 'Portale'],
  },
  'defender-strange': {
    origin: 'Erde-617',
    species: 'Mensch',
    teams: ['Meister der mystischen Künste'],
    status: 'Verstorben',
    height: '1,88 m',
    powers: ['Magie der mystischen Künste', 'Oberster Zauberer seiner Erde', 'Portale'],
  },
  'the-ancient-one': {
    origin: 'Kamar-Taj, Nepal',
    height: '1,70 m',
    powers: ['Mystische Künste', 'Kraft der Dunklen Dimension', 'jahrhundertelanges Leben'],
  },
  'karl-mordo': {
    height: '1,83 m',
    powers: ['Mystische Künste', 'Stab der Lebenden Tribunale', 'entzieht anderen die Magie'],
  },
  'karl-mordo-838': {
    origin: 'Erde-838',
    species: 'Mensch',
    teams: ['Meister der mystischen Künste', 'Illuminati'],
    status: 'Am Leben',
    height: '1,83 m',
    powers: ['Mystische Künste', 'Schwertkampf', 'Oberster Zauberer seiner Erde'],
  },
  'wong': {
    origin: 'Kamar-Taj, Nepal',
    height: '1,75 m',
    powers: ['Mystische Künste', 'Portale', 'Hüter des Sanctums'],
  },
  'kaecilius': {
    height: '1,80 m',
    powers: ['Zauberklingen', 'Raum falten', 'Kraft von Dormammu'],
  },
  'dormammu': {
    origin: 'Dunkle Dimension',
    species: 'Faltine',
    teams: ['Zeloten'],
    height: 'füllt den Himmel',
    powers: ['Magie der Dunklen Dimension', 'verschlingt ganze Dimensionen', 'unsterblich außerhalb der Zeit'],
  },
  'hela': {
    height: '1,73 m',
    powers: ['erschafft Klingen aus dem Nichts', 'zieht Kraft aus Asgard', 'Göttin des Todes'],
  },
  'valkyrie': {
    origin: 'Asgard',
    height: '1,73 m',
    powers: ['asgardische Kriegerin', 'Dragonfang', 'König von Neu-Asgard'],
  },
  'grandmaster': {
    height: '1,80 m',
    teams: ['Elders of the Universe'],
    powers: ['Herrscher über Sakaar', 'Schmelzstab', 'nahezu unsterblich'],
  },
  'skurge': {
    height: '1,93 m',
    powers: ['Axt Bloodaxe', 'zwei M16-Gewehre von der Erde', 'Wächter des Bifröst'],
  },
  'surtur': {
    species: 'Feuerdämon',
    origin: 'Muspelheim',
    teams: ['Feuerdämonen von Muspelheim'],
    height: '300 m',
    powers: ['Krone Twilight', 'Ragnarök', 'Flammenschwert'],
  },
  'topaz': {
    origin: 'Sakaar',
    species: 'Außerirdische',
    teams: ['Sakaaran Guards'],
    status: 'Verstorben',
    powers: ['Leibwächterin des Grandmasters', 'beste Pilotin von Sakaar', 'Schmelzstab'],
  },
  'janet-van-dyne': {
    height: '1,70 m',
    powers: ['erste Wasp', 'dreißig Jahre Quantenreich', 'Energie aus dem Quantenreich'],
  },
  'ava-starr': {
    origin: 'S.H.I.E.L.D.-Anlage, Argentinien',
    powers: ['Phasen durch feste Materie', 'Quantenschwankung im Körper', 'Nahkampf'],
  },
  'yelena-belova': {
    height: '1,65 m',
    powers: ['Nahkampf und Spionage', 'im Roten Raum ausgebildet', 'Präzisionswaffen'],
  },

  /* ---------- Phase Four ---------- */
  'sylvie': {
    height: '1,63 m',
    powers: ['Verzauberung fremder Gedanken', 'Magie und Gestaltwandel', 'Schwertkampf'],
  },
  'classic-loki': {
    origin: 'Jotunheim',
    species: 'Frostriese',
    teams: ['Kid Lokis Bande'],
    status: 'Verstorben',
    powers: ['Illusionen von enormer Größe', 'Gestaltwandel', 'Magie'],
  },
  'kid-loki': {
    origin: 'Jotunheim',
    species: 'Frostriese',
    teams: ['Kid Lokis Bande'],
    status: 'Am Leben',
    powers: ['Schwert Laevateinn', 'Magie', 'König der Leere'],
  },
  'boastful-loki': {
    origin: 'Jotunheim',
    species: 'Frostriese',
    teams: ['Kid Lokis Bande'],
    status: 'Am Leben',
    powers: ['Magie', 'Nahkampf', 'Geschichten über sich selbst'],
  },
  'alligator-loki': {
    species: 'Alligator',
    teams: ['Kid Lokis Bande'],
    status: 'Am Leben',
    powers: ['Biss', 'durchschaut andere Lokis'],
  },
  'president-loki': {
    origin: 'Jotunheim',
    species: 'Frostriese',
    teams: ['Loki-Banditen'],
    status: 'Am Leben',
    powers: ['Magie', 'Armee aus Varianten', 'Taktik'],
  },
  'mobius': {
    height: '1,80 m',
    powers: ['Analyse von Zeitlinien', 'Zeitstab der TVA', 'Verhörkunst'],
  },
  'ravonna-renslayer': {
    height: '1,70 m',
    powers: ['Richterin der TVA', 'Zeitstab', 'Nahkampf'],
  },
  'miss-minutes': {
    species: 'Künstliche Intelligenz',
    origin: 'Zitadelle am Ende der Zeit',
    teams: ['TVA'],
    powers: ['Archiv der gesamten TVA', 'erscheint überall als Hologramm', 'greift in Rechnersysteme ein'],
  },
  'der-da-bleibt': {
    species: 'Mensch (Variante von Nathaniel Richards)',
    origin: 'Erde im 31. Jahrhundert',
    teams: ['TVA'],
    height: '1,80 m',
    powers: ['Herrschaft über die Heilige Zeitlinie', 'Wissen um jeden kommenden Schritt', 'Zeitstab'],
  },
  'agatha-harkness': {
    species: 'Hexe',
    height: '1,70 m',
    powers: ['Hexenkunst seit dem 17. Jahrhundert', 'entzieht anderen Hexen die Macht', 'Brosche als Schutz'],
  },
  'monica-rambeau': {
    height: '1,73 m',
    powers: ['setzt jede Form von Energie um', 'Unsichtbarkeit und Flug', 'Ausbildung bei der S.W.O.R.D.'],
  },
  'darcy-lewis': {
    height: '1,63 m',
    powers: ['Astrophysikerin', 'Messtechnik im Feld', 'Sinn für das Naheliegende'],
  },
  'jimmy-woo': {
    height: '1,75 m',
    powers: ['FBI-Agent', 'Zeugenschutz', 'Kartentricks'],
  },
  'shang-chi': {
    teams: ['Ten Rings', 'Ta Lo'],
    height: '1,75 m',
    powers: ['die Zehn Ringe', 'Kampfkunst von Kindheit an', 'Ausbildung in Ta Lo'],
  },
  'katy': {
    teams: ['Ta Lo'],
    height: '1,65 m',
    powers: ['Bogenschießen', 'fährt jedes Auto', 'bleibt an der Seite ihres Freundes'],
  },
  'wenwu-mandarin': {
    height: '1,78 m',
    powers: ['die Zehn Ringe', 'tausend Jahre Kampferfahrung', 'Herrscher über die Zehn Ringe'],
  },
  'xialing': {
    height: '1,68 m',
    powers: ['Kampfkunst im Selbststudium', 'Rope Dart', 'Führung der Zehn Ringe'],
  },
  'razor-fist': {
    height: '1,80 m',
    powers: ['Machete statt der rechten Hand', 'Nahkampf', 'Leibwächter von Wenwu'],
  },
  'john-walker': {
    powers: ['Supersoldaten-Serum', 'Vibranium-Schild', 'drei Medaillen für Tapferkeit'],
  },
  'karli-morgenthau': {
    height: '1,68 m',
    powers: ['Supersoldaten-Serum', 'Führung der Flag Smashers', 'Netz aus Helfern in acht Ländern'],
  },
  'sharon-carter': {
    height: '1,70 m',
    powers: ['S.H.I.E.L.D.-Ausbildung', 'Waffenhandel als Power Broker', 'Nahkampf'],
  },
  'isaiah-bradley': {
    teams: ['US-Armee'],
    powers: ['Supersoldaten-Serum', 'übermenschliche Kraft', 'dreißig Jahre Haft und Versuche'],
  },
  'quentin-beck-mysterio': {
    height: '1,80 m',
    powers: ['Drohnen mit Projektionstechnik', 'Illusionen in Stadtgröße', 'ehemaliger Stark-Ingenieur'],
  },
  'michelle-jones-watson': {
    height: '1,73 m',
    powers: ['Beobachtungsgabe', 'Recherche', 'durchschaut jede Lüge'],
  },
  'sersi': {
    height: '1,73 m',
    powers: ['verwandelt Materie durch Berührung', 'unsterblich', 'Anführerin der Eternals'],
  },
  'ikaris': {
    height: '1,88 m',
    powers: ['Augenstrahlen', 'Flug', 'nahezu unverwundbar'],
  },
  'thena': {
    height: '1,75 m',
    powers: ['erschafft jede Waffe aus kosmischer Energie', 'Kriegerin seit siebentausend Jahren', 'Nahkampf'],
  },
  'kingo': {
    height: '1,78 m',
    powers: ['Energiegeschosse aus den Händen', 'unsterblich', 'Filmstar in Bollywood'],
  },
  'sprite': {
    height: '1,50 m',
    powers: ['Illusionen für ganze Menschenmengen', 'unsterblich im Körper eines Kindes', 'Geschichtenerzählerin'],
  },
  'druig': {
    height: '1,80 m',
    powers: ['lenkt fremde Gedanken', 'unsterblich', 'jahrhundertelange Menschenkenntnis'],
  },
  'makkari': {
    height: '1,73 m',
    powers: ['Überschallgeschwindigkeit', 'unsterblich', 'Gehörlosigkeit als geschärfter Sinn'],
  },
  'phastos': {
    height: '1,83 m',
    powers: ['erfindet jede Technik', 'unsterblich', 'formt kosmische Energie zu Werkzeugen'],
  },
  'ajak': {
    height: '1,70 m',
    powers: ['Heilung durch Berührung', 'Verbindung zu den Celestials', 'Anführerin der Eternals'],
  },
  'gilgamesh': {
    height: '1,78 m',
    powers: ['goldenes Exoskelett aus kosmischer Energie um Arme und Fäuste', 'der stärkste Eternal seiner Zeit', 'Nahkämpfer aus siebentausend Jahren Übung'],
  },
  'dane-whitman': {
    origin: 'England',
    species: 'Mensch',
    teams: ['Natural History Museum'],
    status: 'Am Leben',
    powers: ['Historiker und Dozent', 'Erbe der Ebony Blade', 'liest Latein'],
  },
  'green-goblin': {
    height: '1,80 m',
    teams: ['Sinister Six', 'Oscorp'],
    powers: ['Gleiter und Kürbisbomben', 'übermenschliche Kraft durch sein Serum', 'gespaltene Persönlichkeit'],
  },
  'doc-ock': {
    height: '1,80 m',
    teams: ['Sinister Six'],
    powers: ['vier verwachsene Metallarme', 'Kernphysiker', 'übermenschliche Kraft'],
  },
  'electro': {
    species: 'Mensch, verwandelt durch elektrische Energie',
    height: '1,83 m',
    teams: ['Sinister Six'],
    powers: ['Herrschaft über Strom', 'Körper aus Energie', 'saugt jedes Netz leer'],
  },
  'sandman': {
    origin: 'USA',
    species: 'Mensch, verwandelt durch einen Teilchenbeschleuniger',
    teams: ['Sinister Six'],
    status: 'Am Leben',
    powers: ['Körper aus Sand', 'wächst zum Sandriesen', 'Sandstürme'],
  },
  'curt-connors': {
    species: 'Mensch, verwandelt durch Reptilien-Serum',
    height: '1,80 m',
    teams: ['Sinister Six', 'Oscorp'],
    powers: ['Verwandlung in den Lizard', 'nachwachsende Glieder', 'Genetiker'],
  },
  'america-chavez': {
    height: '1,63 m',
    powers: ['öffnet Portale zwischen den Universen', 'übermenschliche Kraft', 'Sternenfäuste'],
  },
  'christine-palmer': {
    height: '1,70 m',
    teams: ['Metro-General Hospital'],
    powers: ['Notfallchirurgin', 'Ruhe am Operationstisch', 'kennt Strange länger als jeder andere'],
  },
  'christine-palmer-838': {
    origin: 'Erde-838',
    species: 'Mensch',
    teams: ['Baxter Foundation'],
    status: 'Am Leben',
    height: '1,70 m',
    powers: ['Forschung am Multiversum', 'benannte die Erde-838', 'Fesseln aus dem Sand von Nisanti'],
  },
  'charles-xavier-professor-x': {
    height: '1,80 m',
    powers: ['Telepathie', 'Cerebro', 'Gründer der X-Men'],
  },
  'reed-richards-mister-fantastic': {
    height: '1,88 m',
    powers: ['dehnt seinen Körper beliebig', 'klügster Kopf seiner Erde', 'Führung der Fantastic Four'],
  },
  'reed-richards-838': {
    origin: 'Erde-838',
    species: 'Mensch',
    teams: ['Fantastic Four', 'Illuminati', 'Baxter Foundation'],
    status: 'Verstorben',
    height: '1,88 m',
    powers: ['dehnt seinen Körper beliebig', 'klügster Kopf seiner Erde', 'Gründer der Baxter Foundation'],
  },
  'kate-bishop': {
    height: '1,68 m',
    powers: ['Bogenschießen', 'Fechten', 'Nahkampf'],
  },
  'maya-lopez-echo': {
    height: '1,68 m',
    powers: ['ahmt jede Bewegung nach', 'Kräfte ihrer Ahnen', 'Nahkampf trotz Gehörlosigkeit'],
  },
  'wilson-fisk-kingpin': {
    height: '1,96 m',
    powers: ['rohe Körperkraft', 'Verbrecherimperium', 'politischer Einfluss'],
  },
  'matt-murdock-daredevil': {
    powers: ['geschärfte Sinne', 'Radarsinn', 'Nahkampf'],
  },
  'wade-wilson-deadpool': {
    species: 'Mutant, verändert durch das Weapon-X-Programm',
    height: '1,88 m',
    powers: ['heilt jede Wunde', 'zwei Katanas und zwei Pistolen', 'spricht mit dem Publikum'],
  },
  'logan-wolverine': {
    height: '1,75 m',
    powers: ['Adamantium-Klauen', 'heilt jede Wunde', 'geschärfte Sinne'],
  },
  'cassandra-nova': {
    origin: 'Void',
    height: '1,73 m',
    powers: ['Telepathie und Telekinese', 'Zwillingsschwester von Charles Xavier', 'Herrschaft über die Leere'],
  },
  'mr-paradox': {
    origin: 'TVA',
    height: '1,78 m',
    powers: ['Leitung einer TVA-Abteilung', 'Zeitreißer', 'Zugriff auf jede Zeitlinie'],
  },
  'dogpool': {
    species: 'Hund',
    origin: 'Void',
    height: '0,30 m',
    powers: ['heilt jede Wunde', 'beißt jeden Gegner'],
  },
  'blade': {
    origin: 'Detroit, Michigan',
    teams: ['Vampirjäger'],
    height: '1,88 m',
    powers: ['Kraft eines Vampirs ohne dessen Schwächen', 'Schwert aus Silber', 'Jagd auf Vampire'],
  },
  'marc-spector-steven-grant-moon-knight': {
    height: '1,80 m',
    powers: ['Rüstung von Khonshu', 'Halbmondklingen', 'mehrere Persönlichkeiten in einem Körper'],
  },
  'layla-el-faouly': {
    height: '1,68 m',
    teams: ['Ennead-Rat'],
    powers: ['als Scarlet Scarab Rüstung und Flügel', 'Archäologin', 'Nahkampf'],
  },
  'arthur-harrow': {
    height: '1,85 m',
    powers: ['Stab mit Ammits Waage', 'Sekte in mehreren Ländern', 'ehemaliger Avatar Khonshus'],
  },
  'khonshu': {
    origin: 'Ennead',
    height: '2,60 m',
    powers: ['ägyptischer Mondgott', 'verschiebt den Nachthimmel', 'wählt sich einen Avatar'],
  },
  'ammit': {
    origin: 'Ennead',
    height: '3,00 m',
    powers: ['richtet über die Seele vor der Tat', 'ägyptische Göttin', 'Schar von Avataren'],
  },
  'kamala-khan-ms-marvel': {
    species: 'Mensch-Clandestine-Hybrid, Mutantin',
    height: '1,68 m',
    powers: ['hartes Licht formen', 'Armreif ihrer Urgroßmutter', 'Zugang zur Noor-Dimension'],
  },
  'bruno-carrelli': {
    height: '1,73 m',
    powers: ['Technik und Physik', 'baut Kamalas Anzug', 'Stipendium in Caltech'],
  },
  'nakia-bahadir': {
    height: '1,65 m',
    powers: ['Wahlkampf für den Moscheevorstand', 'Rückhalt in der Gemeinde'],
  },
  'kamran': {
    species: 'Mensch-Clandestine-Hybrid',
    height: '1,80 m',
    powers: ['Energie aus der Noor-Dimension', 'Kraftstöße aus den Händen'],
  },
  'muneeba-khan': {
    species: 'Mensch-Clandestine-Hybrid',
    height: '1,68 m',
    teams: ['Familie Khan'],
    powers: ['Zusammenhalt der Familie', 'näht Kamalas ersten Anzug'],
  },
  'gorr': {
    species: 'Außerirdischer',
    height: '1,85 m',
    teams: ['Götterschlächter'],
    powers: ['Necroschwert', 'erschafft Schatten als Diener', 'tötet Götter'],
  },
  'korg': {
    height: '2,44 m',
    teams: ['Revengers', 'Neu-Asgard'],
    powers: ['Körper aus Stein', 'übermenschliche Kraft', 'Gelassenheit in jeder Lage'],
  },
  'zeus': {
    origin: 'Olymp',
    height: '1,80 m',
    powers: ['Blitzbündel Thunderbolt', 'Herrscher über den Götterrat', 'nahezu unsterblich'],
  },
  'love': {
    origin: 'Rapus Planet',
    species: 'Außerirdische, von Eternity zurückgeholt',
    teams: ['Thors Familie'],
    status: 'Am Leben',
    powers: ['kosmische Strahlen aus den Augen', 'übermenschliche Kraft', 'führt Stormbreaker'],
  },
  'jennifer-walters-she-hulk': {
    height: '2,01 m',
    species: 'Mensch, durch Gammablut verwandelt',
    powers: ['Verwandlung in She-Hulk mit klarem Kopf', 'übermenschliche Kraft', 'Anwältin für Übermenschen'],
  },
  'nikki-ramos': {
    height: '1,60 m',
    powers: ['Assistentin und Rückhalt', 'Kenntnis der Szene', 'Organisation'],
  },
  'titania': {
    species: 'Mensch, verstärkt',
    height: '1,75 m',
    powers: ['übermenschliche Kraft', 'Marke mit eigener Produktlinie', 'Ringkampf'],
  },
  'namor': {
    species: 'Talokani',
    origin: 'Talokan',
    height: '1,75 m',
    powers: ['Flug mit Flügeln an den Fußgelenken', 'übermenschliche Kraft unter Wasser', 'König von Talokan'],
  },
  'koenigin-ramonda': {
    height: '1,73 m',
    powers: ['Königin von Wakanda', 'Autorität vor dem Stammesrat', 'Verhandlung vor den Vereinten Nationen'],
  },
  'riri-williams': {
    height: '1,68 m',
    powers: ['selbstgebaute Rüstung', 'Studium am MIT mit fünfzehn', 'Erfindergeist'],
  },

  /* ---------- Phase Five ---------- */
  'ouroboros-o-b': {
    height: '1,80 m',
    powers: ['Technik der gesamten TVA', 'Handbuch aus eigener Feder', 'Temporalwebstuhl'],
  },
  'victor-timely': {
    height: '1,80 m',
    teams: ['Timely Industries'],
    powers: ['Erfinder im Chicago von 1893', 'Variante von Kang', 'Bauplan des Temporalwebstuhls'],
  },
  'cassie-lang': {
    height: '1,70 m',
    teams: ['Ant-Man-Familie'],
    powers: ['eigener Pym-Anzug', 'Größe verändern', 'Signal ins Quantenreich gebaut'],
  },
  'kang-der-eroberer': {
    origin: 'Erde im 31. Jahrhundert',
    height: '1,80 m',
    powers: ['Rüstung mit Energiewaffen', 'Multiversum-Schiff', 'Wissen aus tausend Kriegen'],
  },
  'high-evolutionary': {
    origin: 'Counter-Earth',
    height: '1,88 m',
    powers: ['erschafft ganze Völker im Labor', 'Energieschilde und Kraftfelder', 'Flotte der Orgocorp'],
  },
  'adam-warlock': {
    origin: 'Sovereign',
    height: '1,88 m',
    powers: ['Energiestrahlen', 'Flug', 'nahezu unverwundbarer Kokonkörper'],
  },
  'gravik': {
    origin: 'Skrullos',
    height: '1,85 m',
    powers: ['Gestaltwandel', 'als Super-Skrull die Kräfte mehrerer Helden', 'Führung der Skrull-Rebellen'],
  },
  'g-iah': {
    height: '1,75 m',
    powers: ['Gestaltwandel', 'als Super-Skrull die Kräfte der Avengers', 'Doppelagentin'],
  },
  'sonya-falsworth': {
    height: '1,70 m',
    powers: ['Führungsebene des MI6', 'Verhörkunst', 'Netz aus eigenen Quellen'],
  },
  'praesident-ritson': {
    height: '1,80 m',
    powers: ['Präsident der USA', 'Oberbefehl über die Streitkräfte'],
  },
  'chula': {
    teams: ['Choctaw', 'US-Post'],
    height: '1,68 m',
    powers: ['Wissen der Choctaw-Ahnen', 'Heilkunde', 'Zusammenhalt der Familie'],
  },
  'bonnie': {
    height: '1,70 m',
    powers: ['Bindung an die Gemeinde', 'Rollschuhbahn als Treffpunkt'],
  },
  'henry-lopez': {
    height: '1,80 m',
    powers: ['Führung des Familienbetriebs', 'Kontakte in beide Welten'],
  },
  'dar-benn': {
    height: '1,75 m',
    powers: ['zweiter Kree-Armreif', 'Universalwaffe', 'Oberste Anklägerin der Kree'],
  },
  'hank-mccoy-beast': {
    height: '1,78 m',
    powers: ['übermenschliche Kraft und Beweglichkeit', 'Wissenschaftler von Rang', 'Berater des Präsidenten'],
  },
  'billy-maximoff-wiccan': {
    height: '1,75 m',
    powers: ['Chaosmagie', 'formt Wirklichkeit mit Worten', 'Sohn von Wanda Maximoff'],
  },
  'rio-vidal': {
    species: 'Kosmische Entität',
    origin: 'jenseits der Straße der Hexen',
    teams: ['Hexenzirkel von Agatha Harkness'],
    height: '1,73 m',
    powers: ['der Tod in Gestalt einer Hexe', 'grüne Magie', 'nimmt jedes Leben mit einer Berührung'],
  },
  'lilia-calderu': {
    height: '1,63 m',
    powers: ['Wahrsagerei mit dem Tarot', 'sieht die Zeit nicht der Reihe nach', 'Schutzzauber'],
  },
  'jennifer-kale': {
    height: '1,70 m',
    powers: ['Trankhexe', 'Kräuterkunde', 'ihre Macht liegt unter einem Fluch'],
  },
  'alice-wu-gulliver': {
    height: '1,78 m',
    powers: ['Schutzzauber gegen jede Magie', 'Rockmusik als Zauber', 'Personenschutz'],
  },
  'joaquin-torres-falcon': {
    height: '1,78 m',
    powers: ['Flügelanzug', 'Ausbildung bei der Air Force', 'Aufklärung aus der Luft'],
  },
  'bullseye': {
    origin: 'Portsmouth, New Hampshire',
    height: '1,83 m',
    powers: ['trifft mit jedem Gegenstand', 'FBI-Scharfschütze', 'Nahkampf'],
  },
  'frank-castle-punisher': {
    height: '1,88 m',
    powers: ['Ausbildung bei den Marines', 'schweres Arsenal', 'Nahkampf ohne Rücksicht'],
  },
  'vanessa-fisk': {
    height: '1,73 m',
    powers: ['Führung der Geschäfte ihres Mannes', 'Kunsthandel als Fassade', 'Einfluss auf Fisk'],
  },
  'muse': {
    height: '1,85 m',
    teams: ['Einzelgänger'],
    powers: ['Kunstwerke aus dem Blut seiner Opfer', 'Nahkampf', 'kennt jeden Winkel der Stadt'],
  },
  'karen-page': {
    origin: 'Fagan Corners, Vermont',
    height: '1,75 m',
    powers: ['Recherche im Investigativjournalismus', 'Kanzleiarbeit', 'sucht die Wahrheit hinter jeder Akte'],
  },
  'connor-powell': {
    powers: ['Polizist im Streifendienst', 'Anti-Vigilanten-Einheit'],
  },
  'cole-north': {
    height: '1,80 m',
    powers: ['Polizist der Anti-Vigilanten-Einheit', 'Ermittlungsarbeit'],
  },
  'white-tiger': {
    teams: ['Daredevils Truppe'],
    height: '1,78 m',
    powers: ['Tigeramulett', 'Kampfkunst', 'übermenschliche Reflexe'],
  },
  'parker-robbins-the-hood': {
    powers: ['dämonische Kapuze', 'Unsichtbarkeit und Levitation', 'Bande aus Kleinkriminellen'],
  },
  'n-a-t-a-l-i-e': {
    species: 'Künstliche Intelligenz',
    origin: 'Chicago, Illinois',
    teams: ['Ironheart-Projekt'],
    powers: ['Nachbildung von Riris toter Freundin', 'steuert die Rüstung mit', 'Rechenleistung im Gefecht'],
  },
  'ezekiel-stane': {
    teams: ['Stane Industries'],
    height: '1,80 m',
    powers: ['biomimetische Mechatronik', 'Erfinder wie sein Vater', 'Bunker voll Schwarzmarkttechnik'],
  },
  'mephisto': {
    teams: ['Hölle'],
    origin: 'Hölle',
    height: '1,85 m',
    powers: ['handelt mit Seelen', 'formt Wirklichkeit für seinen Preis', 'nahezu unsterblich'],
  },
  'bob-sentry': {
    species: 'Mensch, verändert durch das Sentry-Serum',
    height: '1,80 m',
    teams: ['Thunderbolts', 'Projekt Sentry'],
    powers: ['Kraft von einer Million explodierender Sonnen', 'Flug und Unverwundbarkeit', 'als Void die eigene Dunkelheit'],
  },
  'valentina-allegra-de-fontaine': {
    height: '1,73 m',
    powers: ['Leitung der CIA', 'wirbt beschädigte Leute an', 'Netz aus Gefälligkeiten'],
  },

  /* ---------- Phase Six ---------- */
  'sue-storm-invisible-woman': {
    height: '1,75 m',
    powers: ['Unsichtbarkeit', 'Kraftfelder', 'Verhandlung für die ganze Erde'],
  },
  'johnny-storm-human-torch': {
    height: '1,83 m',
    powers: ['Körper in Flammen', 'Flug', 'liest die Sprache der Silver Surfer'],
  },
  'ben-grimm-the-thing': {
    height: '1,96 m',
    powers: ['Körper aus Gestein', 'übermenschliche Kraft', 'hält jeden Treffer aus'],
  },
  'galactus': {
    species: 'Kosmische Entität',
    origin: 'Taa',
    teams: ['Kosmische Mächte'],
    height: '90 m',
    powers: ['verschlingt ganze Planeten', 'Macht der Kosmischen Kraft', 'Schiff von der Größe einer Stadt'],
  },
  'silver-surfer': {
    origin: 'Zenn-La',
    teams: ['Herolde von Galactus'],
    height: '1,93 m',
    powers: ['Kosmische Kraft', 'Surfbrett schneller als Licht', 'sucht Welten für Galactus'],
  },
  'doctor-doom': {
    height: '1,88 m',
    teams: ['Latveria'],
    powers: ['Rüstung aus Technik und Magie', 'Herrscher über Latveria', 'Verstand auf Augenhöhe mit Reed Richards'],
  },
  'simon-williams': {
    height: '1,88 m',
    teams: ['Schauspielergewerkschaft'],
    powers: ['Ionenenergie im Körper', 'übermenschliche Kraft', 'Schauspieler in Hollywood'],
  },
  'regisseur-von-kovak': {
    origin: 'Los Angeles, Kalifornien',
    teams: ['Filmbranche'],
    height: '1,80 m',
    powers: ['Regie einer Neuverfilmung', 'Einfluss auf jede Besetzung'],
  },
  'jessica-jones': {
    height: '1,75 m',
    powers: ['übermenschliche Kraft', 'Privatdetektivin', 'Sprünge über mehrere Stockwerke'],
  },
  'tarantula': {
    origin: 'Delvadia, Südamerika',
    species: 'Mensch, verstärkt durch ein Serum',
    teams: ['Streitkräfte von Delvadia'],
    status: 'Am Leben',
    powers: ['übermenschliche Kraft aus einem Serum', 'vergiftete Stacheln an den Stiefeln', 'Kampfsport'],
  },
  'jocasta-angekuendigt': {
    origin: 'unbekannt',
    teams: ['Ultrons Werk'],
    height: '1,80 m',
    powers: ['Körper aus Metall', 'Gegenstück zu Vision', 'Bewusstsein aus fremder Vorlage'],
  },
  'e-d-i-t-h': {
    origin: 'Tony Starks Werkstatt',
    species: 'Künstliche Intelligenz',
    teams: ['Stark Industries'],
    status: 'Am Leben',
    powers: ['Zugriff auf Starks Satellitennetz', 'Drohnenflotte', 'sitzt in einer Brille'],
  },
  'erik-lehnsherr-magneto': {
    height: '1,85 m',
    powers: ['Herrschaft über Magnetfelder', 'formt jedes Metall', 'Überlebender der Lager'],
  },
  'scott-summers-cyclops': {
    height: '1,83 m',
    powers: ['Energiestrahl aus den Augen', 'Rubinquarz-Visier', 'Feldführung der X-Men'],
  },
  'raven-darkhoelme-mystique': {
    height: '1,78 m',
    powers: ['nimmt jede Gestalt an', 'Nahkampf', 'Spionage über Jahrzehnte'],
  },
  'kurt-wagner-nightcrawler': {
    height: '1,75 m',
    powers: ['Teleportation', 'Beweglichkeit eines Akrobaten', 'Schwanz als dritte Hand'],
  },
  'remy-lebeau-gambit': {
    origin: 'New Orleans, Louisiana',
    height: '1,85 m',
    powers: ['lädt Gegenstände mit Energie auf', 'Spielkarten als Wurfwaffen', 'Kampfstab'],
  },
  'wolfgang-von-strucker': {
    origin: 'Deutschland',
    height: '1,85 m',
    powers: ['Führung der HYDRA-Zelle in Sokovia', 'Experimente mit Lokis Zepter', 'Menschenversuche'],
  },
  'bill-foster': {
    height: '1,88 m',
    powers: ['Wachstum auf über sieben Meter', 'Biochemiker von Rang', 'Pym-Partikel'],
  },
  'ebony-maw': {
    species: 'Außerirdischer',
    origin: 'unbekannte Welt',
    height: '1,88 m',
    powers: ['Telekinese', 'Manipulation von Materie', 'Redekunst'],
  },
  'corvus-glaive': {
    origin: 'unbekannte Welt',
    height: '1,96 m',
    powers: ['Klinge, die alles durchschneidet', 'Wiederbelebung durch die Klinge', 'übermenschliche Kraft'],
  },
  'proxima-midnight': {
    origin: 'unbekannte Welt',
    height: '1,88 m',
    powers: ['zielsuchender Dreizack', 'übermenschliche Schnelligkeit', 'Nahkampf'],
  },
  'cull-obsidian': {
    species: 'Außerirdischer',
    origin: 'unbekannte Welt',
    height: '2,29 m',
    powers: ['Kettenhammer', 'übermenschliche Kraft', 'nachwachsender Arm'],
  },
  'eitri': {
    species: 'Zwerg',
    origin: 'Nidavellir',
    height: '5 m',
    teams: ['Zwerge von Nidavellir'],
    powers: ['Schmied von Mjölnir und Stormbreaker', 'Sternenschmiede', 'König der Zwerge'],
  },
  'hunter-b-15': {
    teams: ['Zeitvarianzbehörde', 'Minutemen'],
    powers: ['Zeitstab', 'Nahkampf', 'Führung einer Jägereinheit'],
  },
  'death-dealer': {
    teams: ['Ten Rings'],
    height: '1,75 m',
    powers: ['Ausbilder der Ten Rings', 'Doppelklingen', 'Kampfkunst'],
  },
  'ying-li': {
    teams: ['Ta Lo'],
    height: '1,68 m',
    powers: ['Kraft des Großen Beschützers', 'lenkt Luft und Bewegung', 'Wächterin des Tors'],
  },
  'arnim-zola': {
    origin: 'Schweiz',
    species: 'Mensch, später Bewusstsein auf Magnetband',
    height: '1,65 m',
    powers: ['Waffenbau aus Tesserakt-Energie', 'Algorithmus zur Vorhersage von Gegnern', 'überlebt als Rechner'],
  },
  'ayesha': {
    origin: 'Sovereign',
    height: '1,80 m',
    teams: ['Sovereign'],
    powers: ['Herrscherin der Sovereign', 'Zucht ihres Volkes in Kokons', 'Schöpferin von Adam Warlock'],
  },
  'howard-the-duck': {
    origin: 'Duckworld',
    species: 'Duckworldianer',
    height: '0,79 m',
    teams: ['Knowhere', 'Sammlung des Collectors'],
    powers: ['spricht und trinkt wie ein Mensch', 'Pilot', 'Schusswaffen'],
  },
  'ying-nan': {
    origin: 'Ta Lo',
    teams: ['Ta Lo'],
    height: '1,63 m',
    powers: ['Kampfkunst von Ta Lo', 'Waffen aus Drachenschuppen', 'Hüterin des Dunklen Tors'],
  },
  'black-bolt': {
    species: 'Inhuman',
    height: '1,88 m',
    teams: ['Illuminati', 'Königsfamilie der Inhumans'],
    status: 'Verstorben',
    powers: ['zerstörerische Stimme', 'Flug', 'übermenschliche Kraft'],
  },
  'clea': {
    origin: 'Dunkle Dimension',
    species: 'Zauberin der Dunklen Dimension',
    height: '1,77 m',
    powers: ['Portale zwischen den Dimensionen', 'mystische Künste', 'Nichte von Dormammu'],
  },
  'chester-phillips': {
    height: '1,85 m',
    teams: ['SSR', 'S.H.I.E.L.D.', 'US-Armee'],
    powers: ['Kommando über die SSR', 'Taktik', 'Mitgründer von S.H.I.E.L.D.'],
  },
  'kurse': {
    origin: 'Svartalfheim',
    species: 'Dunkelelf, zum Kursed umgeformt',
    height: '2,29 m',
    powers: ['übermenschliche Kraft', 'Armklingen', 'nahezu unverwundbar'],
  },
  'kraglin': {
    origin: 'Xandar',
    species: 'Xandarianer',
    height: '1,80 m',
    teams: ['Guardians of the Galaxy', 'Ravagers'],
    powers: ['Yaka-Pfeil', 'Pilot', 'Nahkampf'],
  },
  'krugarr': {
    origin: 'unbekannte Welt',
    species: 'Lem',
    teams: ['Ravagers', 'United Ravagers'],
    powers: ['mystische Künste', 'Portale', 'Energieschilde'],
  },
  'kro': {
    origin: 'Erde',
    species: 'Deviant',
    height: '2,44 m',
    teams: ['Deviants'],
    powers: ['Kräfte getöteter Eternals', 'Klauen und Ranken', 'Selbstheilung'],
  },
  'rintrah': {
    origin: "R'Vaal",
    species: "R'Vaalianer",
    height: '2,13 m',
    teams: ['Meister der mystischen Künste'],
    powers: ['mystische Künste', 'Schutzschilde', 'Portale'],
  },
  'rama-tut': {
    origin: 'Altes Ägypten',
    species: 'Mensch aus dem 31. Jahrhundert',
    teams: ['Rat der Kangs'],
    powers: ['Technik aus der Zukunft', 'Zeitreise', 'Herrschaft über eine Epoche'],
  },
  'white-vision': {
    species: 'Synthezoid ohne Gedankenstein',
    height: '1,91 m',
    teams: ['S.W.O.R.D.'],
    powers: ['Dichteveränderung', 'Flug', 'Energiestrahl', 'Vibranium-Körper'],
  },
  'aamir-khan': {
    origin: 'Jersey City, New Jersey',
    species: 'Mensch',
    height: '1,80 m',
    powers: ['keine, Familie der Khans'],
  },
  'sana-ali': {
    origin: 'Karatschi, Pakistan',
    species: 'Mensch',
    height: '1,55 m',
    powers: ['sieht das Muster aus Sternen', 'Hüterin der Familiengeschichte'],
  },
  'mrs-hart': {
    origin: 'Westview, New Jersey',
    species: 'Mensch',
    height: '1,55 m',
    teams: ['Westview Historical Society', 'Agathas Zirkel'],
    powers: ['keine, vom Hex in ihre Rolle gezwungen'],
  },
  'juggernaut': {
    origin: 'die Leere',
    species: 'Mutant',
    height: '2,03 m',
    teams: ['Cassandra Novas Gefolge'],
    powers: ['unaufhaltsamer Ansturm', 'übermenschliche Kraft', 'Helm schützt vor Telepathie'],
  },
  'arishem': {
    origin: 'die Weltenschmiede',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
    powers: ['erschafft Sterne und Arten', 'baut die Eternals', 'richtet über ganze Welten'],
  },
  'tiamut': {
    origin: 'Erdkern',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
    powers: ['kosmische Energie', 'seine Geburt zerreißt Planeten', 'von Sersi versteinert'],
  },
  'nezarr': {
    origin: 'die Weltenschmiede',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
    powers: ['erschafft Welten', 'kosmische Energie'],
  },
  'eros-starfox': {
    origin: 'Titan',
    species: 'Eternal',
    height: '1,78 m',
    teams: ['Eternals von Titan'],
    powers: ['beeinflusst Gefühle', 'Raumfahrt', 'Bruder des Thanos'],
  },
  'cosmo': {
    origin: 'Sowjetunion, dann Knowhere',
    species: 'Hund',
    teams: ['Guardians of the Galaxy', 'Knowhere'],
    powers: ['Telekinese', 'Telepathie', 'Raumanzug'],
  },
  'lylla': {
    origin: 'Labor des High Evolutionary',
    species: 'Otter mit Kybernetik',
    teams: ['Batch 89'],
    powers: ['mechanische Vorderbeine', 'Sprache', 'gibt Rocket seinen Namen'],
  },
  'teefs': {
    origin: 'Labor des High Evolutionary',
    species: 'Walross mit Kybernetik',
    teams: ['Batch 89'],
    powers: ['Räder statt Flossen', 'Sprache'],
  },
  'floor': {
    origin: 'Labor des High Evolutionary',
    species: 'Kaninchen mit Kybernetik',
    teams: ['Batch 89'],
    powers: ['Spinnenbeine', 'Sprache'],
  },
  'phyla-vell': {
    origin: 'die Arête',
    species: 'Kree',
    teams: ['Guardians of the Galaxy'],
    powers: ['Kree-Physiologie', 'im Labor des High Evolutionary aufgewachsen'],
  },
  'der-andere': {
    origin: 'unbekannte Welt',
    species: 'Chitauri',
    teams: ['Schwarzer Orden', 'Chitauri'],
    powers: ['spricht für Thanos', 'befehligt die Chitauri'],
  },
  'h-e-r-b-i-e': {
    origin: 'Baxter Building, New York',
    species: 'Roboter',
    teams: ['Fantastic Four'],
    powers: ['Bordrechner', 'ausfahrbare Arme', 'Navigation und Haushalt'],
  },
  'hercules': {
    origin: 'Olymp',
    species: 'Gott',
    height: '1,88 m',
    teams: ['Götter des Olymp'],
    powers: ['göttliche Kraft', 'goldene Keule', 'Sohn des Zeus'],
  },
  'piledriver': {
    origin: 'USA',
    species: 'Mensch mit asgardischem Vibranium',
    teams: ['Wrecking Crew', 'Intelligencia'],
    powers: ['übermenschliche Kraft in den Fäusten', 'Nahkampf'],
  },
  'morris': {
    origin: 'Ta Lo',
    species: 'Fabelwesen aus Ta Lo',
    teams: ['Ta Lo'],
    powers: ['Flug', 'kennt den Weg durch das Nebellabyrinth', 'gesichtslos'],
  },
  'veb': {
    origin: 'Quantenraum',
    species: 'Wesen aus dem Quantenraum',
    teams: ['Freiheitskämpfer'],
    powers: ['Körper ohne Öffnungen', 'Übersetzungsflüssigkeit', 'formbare Masse'],
  },
  'toad': {
    origin: 'die Leere',
    species: 'Mutant',
    teams: ['Cassandra Novas Gefolge'],
    powers: ['meterlange Zunge', 'Sprungkraft', 'ätzender Speichel'],
  },
  'azazel': {
    origin: 'die Leere',
    species: 'Mutant',
    teams: ['Cassandra Novas Gefolge'],
    powers: ['Teleportation in roter Rauchwolke', 'Greifschwanz als Stichwaffe', 'Schwertkampf'],
  },
  'elektra': {
    origin: 'Griechenland',
    species: 'Mensch',
    height: '1,65 m',
    teams: ['Die Hand', 'Chaste'],
    powers: ['Kampfkunst', 'zwei Sai', 'als Black Sky ausgebildet'],
  },
  'throg': {
    origin: 'gekappte Zeitlinie',
    species: 'Asgardier als Frosch',
    height: '12 cm',
    powers: ['winziger Mjölnir', 'Donnerkraft', 'würdig'],
  },
  'alioth': {
    origin: 'die Leere am Ende der Zeit',
    species: 'Wesen aus reiner Zeitenergie',
    height: 'mehrere Kilometer',
    powers: ['verschlingt Materie und Zeit', 'unangreifbar', 'Wächter der Leere'],
  },
  'colossus': {
    origin: 'Russland',
    species: 'Mutant',
    height: '2,08 m',
    teams: ['X-Men'],
    powers: ['Haut aus organischem Stahl', 'übermenschliche Kraft', 'nahezu unverwundbar'],
  },
  'eson': {
    origin: 'unbekannt',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
    powers: ['trägt den Machtstein im Stab', 'löscht ganze Welten', 'kosmische Energie'],
  },
  'jemiah': {
    origin: 'die Weltenschmiede',
    species: 'Celestial',
    height: 'über 2 km',
    teams: ['Celestials'],
    powers: ['erschafft Welten und Arten', 'kosmische Energie'],
  },
  'j-jonah-jameson': {
    origin: 'New York City, New York',
    species: 'Mensch',
    height: '1,80 m',
    teams: ['TheDailyBugle.net'],
    powers: ['Reichweite im Netz', 'enthüllt Spider-Mans Identität'],
  },
  'martinex': {
    origin: 'Pluto',
    species: 'Pluvianer',
    height: '1,80 m',
    teams: ['Ravagers', 'United Ravagers'],
    powers: ['Körper aus Kristall', 'Hitze und Kälte aus den Händen', 'Ravager-Hauptmann'],
  },
  'shocker': {
    origin: 'New York City, New York',
    species: 'Mensch',
    height: '1,85 m',
    teams: ['Adrian Toomes’ Bande'],
    powers: ['Vibrationshandschuh', 'Chitauri-Technik', 'Nahkampf'],
  },
  'ulysses-klaue': {
    origin: 'Südafrika',
    species: 'Mensch mit Armprothese',
    height: '1,75 m',
    teams: ['Schwarzmarkt', 'Erik Killmongers Plan'],
    powers: ['Schallkanone im Arm', 'Vibranium-Handel', 'Waffenschmuggel'],
  },
  'jean-grey': {
    origin: 'USA',
    species: 'Mutantin',
    status: 'Am Leben',
    powers: ['übernimmt fremde Körper', 'Telepathie über weite Strecken', 'Telekinese und psionische Wellen'],
  },
  'sara-grey': {
    origin: 'USA',
    species: 'Mutantin',
    status: 'Verstorben',
    powers: ['Telepathie', 'übernimmt fremde Körper', 'Sprünge über mehrere Menschen hinweg'],
  },
  'william-metzger': {
    origin: 'USA',
    species: 'Mensch',
    teams: ['Damage Control'],
    status: 'Am Leben',
    powers: ['Leitung von Damage Control', 'Zugriff auf beschlagnahmte Technik', 'Versuche an Gefangenen'],
  },
  'jean-dewolff': {
    origin: 'New York City, New York',
    species: 'Mensch',
    teams: ['New York City Police Department'],
    status: 'Am Leben',
    powers: ['Ermittlungen gegen das organisierte Verbrechen', 'Kontakte im gesamten Revier', 'kurzer Draht zu Spider-Man'],
  },
  'e-v': {
    origin: 'Peter Parkers Werkstatt',
    species: 'Künstliche Intelligenz',
    teams: ['Spider-Mans Anzug'],
    status: 'Am Leben',
    powers: ['Anzeige im Sichtfeld der Maske', 'Auswertung von Kampfdaten', 'Wartung und Kalibrierung des Anzugs'],
  },
  'paul-rabin': {
    origin: 'USA',
    species: 'Mensch',
    status: 'Am Leben',
    powers: ['Studium am MIT', 'Freund von MJ', 'nichts von alledem, was um ihn herum passiert'],
  },
  'lonnie-lincoln-tombstone': {
    origin: 'USA',
    species: 'Mensch mit verstärkter Konstitution',
    teams: ['eigene Bande in New York'],
    status: 'Am Leben',
    powers: ['übermenschliche Kraft', 'sehr widerstandsfähige Haut', 'schnelle Reflexe'],
  },
  'fred-myers-boomerang': {
    origin: 'Australien',
    species: 'Mensch',
    status: 'Am Leben',
    powers: ['Wurfbumerangs mit verschiedener Wirkung', 'Anzug mit Visier und Halterungen', 'trifft auf große Entfernung'],
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
  ],
  'steve-rogers': [
    ['Bester Freund', 'bucky-barnes'],
    ['Große Liebe', 'peggy-carter'],
    ['Nachfolger', 'sam-wilson'],
    ['Mentor', 'abraham-erskine'],
    ['Erzfeind', 'johann-schmidt-red-skull'],
    ['Gegenspieler', 'tony-stark'],
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
  ],
  'thor': [
    ['Bruder', 'loki'],
    ['Vater', 'odin'],
    ['Mutter', 'frigga'],
    ['Schwester', 'hela'],
    ['Große Liebe', 'jane-foster'],
    ['Treuester Freund', 'heimdall'],
    ['Weggefährte', 'bruce-banner'],
  ],
  'loki': [
    ['Weitere Fassungen', 'kid-loki'],
    ['Bruder', 'thor'],
    ['Ziehvater', 'odin'],
    ['Leiblicher Vater', 'laufey'],
    ['Ziehmutter', 'frigga'],
    ['Variante', 'sylvie'],
    ['Freund', 'mobius'],
  ],
  'classic-loki': [
    ['Andere Fassung', 'loki'],
    ['König', 'kid-loki'],
    ['Bezwinger', 'alioth'],
  ],
  'kid-loki': [
    ['Andere Fassung', 'loki'],
    ['Gefolgsmann', 'classic-loki'],
    ['Verräter', 'boastful-loki'],
    ['Gegenspieler', 'president-loki'],
  ],
  'boastful-loki': [
    ['Andere Fassung', 'loki'],
    ['Verratener König', 'kid-loki'],
    ['Auftraggeber', 'president-loki'],
  ],
  'alligator-loki': [
    ['Andere Fassung', 'loki'],
    ['König', 'kid-loki'],
  ],
  'president-loki': [
    ['Andere Fassung', 'loki'],
    ['Gegenspieler', 'kid-loki'],
    ['Komplize', 'boastful-loki'],
  ],
  'bruce-banner': [
    ['Große Liebe', 'betty-ross'],
    ['Verfolger', 'thaddeus-ross'],
    ['Weggefährte', 'thor'],
    ['Gegenspieler', 'emil-blonsky-abomination'],
    ['Nichte', 'jennifer-walters-she-hulk'],
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
  ],
  'peter-parker': [
    ['Weitere Fassung', 'peter-parker-maguire'],
    ['Mentor', 'tony-stark'],
    ['Große Liebe', 'michelle-jones-watson'],
    ['Bester Freund', 'ned-leeds'],
    ['Tante', 'may-parker'],
    ['Erzfeind', 'green-goblin'],
    ['Gegenspieler', 'adrian-toomes-vulture'],
    ['Ausbilder', 'happy-hogan'],
  ],
  'peter-parker-maguire': [
    ['Jüngste Fassung', 'peter-parker'],
    ['Weitere Fassung', 'peter-parker-garfield'],
    ['Erzfeind', 'green-goblin'],
  ],
  'peter-parker-garfield': [
    ['Jüngste Fassung', 'peter-parker'],
    ['Weitere Fassung', 'peter-parker-maguire'],
    ['Erzfeind', 'electro'],
  ],
  'wanda-maximoff': [
    ['Fassung der Erde-838', 'wanda-maximoff-838'],
    ['Bruder', 'pietro-maximoff'],
    ['Große Liebe', 'vision'],
    ['Sohn', 'billy-maximoff-wiccan'],
    ['Gegenspielerin', 'agatha-harkness'],
    ['Gegenspieler', 'stephen-strange'],
  ],
  'wanda-maximoff-838': [
    ['Andere Fassung', 'wanda-maximoff'],
  ],
  'stephen-strange': [
    ['Weitere Fassung', 'defender-strange'],
    ['Lehrerin', 'the-ancient-one'],
    ['Weggefährte', 'wong'],
    ['Große Liebe', 'christine-palmer'],
    ['Gegenspieler', 'karl-mordo'],
    ['Schützling', 'america-chavez'],
  ],
  'defender-strange': [
    ['Andere Fassung', 'stephen-strange'],
    ['Verratene Freundin', 'america-chavez'],
  ],
  'sam-wilson': [
    ['Vorgänger', 'steve-rogers'],
    ['Weggefährte', 'bucky-barnes'],
    ['Rivale', 'john-walker'],
    ['Partner', 'joaquin-torres-falcon'],
    ['Vorbild', 'isaiah-bradley'],
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
    ['Andere Fassung', 'gamora'],
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
  ],
  'hope-van-dyne': [
    ['Vater', 'hank-pym'],
    ['Mutter', 'janet-van-dyne'],
    ['Große Liebe', 'scott-lang'],
  ],
  'clint-barton': [
    ['Beste Freundin', 'natasha-romanoff'],
    ['Schützling', 'kate-bishop'],
    ['Gegenspielerin', 'maya-lopez-echo'],
  ],
  'carol-danvers': [
    ['Beste Freundin', 'maria-rambeau'],
    ['Ziehnichte', 'monica-rambeau'],
    ['Mentor und Gegner', 'yon-rogg'],
    ['Verbündeter', 'talos'],
    ['Gegenspielerin', 'dar-benn'],
  ],
  'nick-fury': [
    ['Verbündete', 'carol-danvers'],
    ['Rechte Hand', 'maria-hill'],
    ['Freund', 'talos'],
    ['Erzfeind', 'gravik'],
    ['Gegenspieler', 'alexander-pierce'],
  ],
  'thanos': [
    ['Fassung von 2014', 'thanos-2014'],
    ['Ziehtochter', 'gamora'],
    ['Ziehtochter', 'nebula'],
    ['Handlanger', 'ronan'],
    ['Erzfeind', 'tony-stark'],
  ],
  'thanos-2014': [
    ['Späteres Ich', 'thanos'],
    ['Ältere Tochter', 'gamora-2014'],
    ['Jüngere Tochter', 'nebula-2014'],
    ['Bezwinger', 'tony-stark'],
  ],
  'vision': [
    ['Große Liebe', 'wanda-maximoff'],
    ['Schöpfer', 'tony-stark'],
    ['Schöpfer', 'ultron'],
  ],
  'james-rhodes': [
    ['Bester Freund', 'tony-stark'],
  ],
  'pepper-potts': [
    ['Ehemann', 'tony-stark'],
    ['Vertrauter', 'happy-hogan'],
  ],
  'yelena-belova': [
    ['Schwester', 'natasha-romanoff'],
    ['Ziehvater', 'alexei'],
    ['Ziehmutter', 'melina-vostokoff'],
    ['Weggefährte', 'bob-sentry'],
  ],
  'peggy-carter': [
    ['Fassung der Erde-838', 'peggy-carter-838'],
    ['Große Liebe', 'steve-rogers'],
    ['Verbündeter', 'howard-stark'],
    ['Großnichte', 'sharon-carter'],
  ],
  'peggy-carter-838': [
    ['Andere Fassung', 'peggy-carter'],
    ['Mörderin', 'wanda-maximoff'],
    ['Weggefährte', 'karl-mordo-838'],
  ],
  'maria-rambeau-838': [
    ['Andere Fassung', 'maria-rambeau'],
    ['Mörderin', 'wanda-maximoff'],
    ['Weggefährtin', 'peggy-carter-838'],
  ],
  'maria-rambeau-binary': [
    ['Andere Fassung', 'maria-rambeau'],
    ['Kollege', 'hank-mccoy-beast'],
  ],
  'reed-richards-838': [
    ['Andere Fassung', 'reed-richards-mister-fantastic'],
    ['Mörderin', 'wanda-maximoff'],
    ['Mitarbeiterin', 'christine-palmer-838'],
  ],
  'karl-mordo-838': [
    ['Andere Fassung', 'karl-mordo'],
    ['Gegenspieler', 'stephen-strange'],
    ['Weggefährtin', 'peggy-carter-838'],
  ],
  'christine-palmer-838': [
    ['Andere Fassung', 'christine-palmer'],
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
  ],
  'wilson-fisk-kingpin': [
    ['Erzfeind', 'matt-murdock-daredevil'],
    ['Ehefrau', 'vanessa-fisk'],
    ['Handlanger', 'bullseye'],
    ['Ziehtochter', 'maya-lopez-echo'],
  ],
  'kamala-khan-ms-marvel': [
    ['Vorbild', 'carol-danvers'],
    ['Mutter', 'muneeba-khan'],
    ['Bester Freund', 'bruno-carrelli'],
    ['Freundin', 'nakia-bahadir'],
  ],
  'monica-rambeau': [
    ['Mutter', 'maria-rambeau'],
    ['Patentante', 'carol-danvers'],
    ['Freundin', 'wanda-maximoff'],
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
  ],
  'marc-spector-steven-grant-moon-knight': [
    ['Gott', 'khonshu'],
    ['Ehefrau', 'layla-el-faouly'],
    ['Erzfeind', 'arthur-harrow'],
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
  'e-v': [
    ['Erbauer', 'peter-parker'],
  ],
  'paul-rabin': [
    ['Freundin', 'michelle-jones-watson'],
    ['Freund', 'ned-leeds'],
  ],
};
