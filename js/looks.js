/* Was eine Fassung ist

   Zu jedem Ganzkörperbild aus FULLSIZE_LOOKS (js/chars.js) steht hier
   ein Satz, der die Fassung selbst beschreibt: woher der Anzug stammt,
   wozu er gebaut wurde, in welchem Zustand die Figur darin steckt.
   Vorher stand an dieser Stelle die Zusammenfassung des Films, die für
   jede Fassung derselben Figur gleich lautete und über den Anzug selbst
   nichts sagte.

   Grundlage sind die Angaben des Marvel-Cinematic-Universe-Wikis zu den
   Anzügen, Rüstungen und Figuren, nicht der Eindruck des Bildes. Wo es
   zu einer Fassung keinen eigenen Eintrag gibt, steht der Satz, den die
   Handlung des Films über sie hergibt.

   Schlüssel ist der Dateiname aus FULLSIZE_LOOKS und nicht der
   Charakter: Eine Figur hat so viele Sätze wie Fassungen. Auch die
   Figur mit nur einem einzigen Bild hat einen, denn ihre Standardansicht
   ist ebenso eine Fassung wie die zwanzigste Rüstung Tony Starks.
   Gepflegt wird der Satz im Bild-Studio unter der Fassungsleiste. Fehlt
   er doch einmal, springt auf der Bühne die Zusammenfassung des Films
   ein.

   Bei einer Fassung mit mehreren Varianten (FULLSIZE_VARIANTS in
   js/chars.js) ist der Schlüssel ihr Stamm, denn der Satz beschreibt die
   Fassung und nicht die Aufnahme. Wer zu einer einzelnen Variante etwas
   zu sagen hat, schreibt es unter deren Dateinamen; die Bühne sieht
   zuerst dort nach und fällt sonst auf den Stamm zurück. */
const FULLSIZE_NOTES = {

  /* ---------- Tony Stark ---------- */
  'tony-stark-mark-i': 'Die erste Rüstung entstand in der Gefangenschaft der Zehn Ringe aus Schrott, Maschinenteilen und Bruchstücken von Jericho-Raketen und diente allein der Flucht aus der Höhle.',
  'tony-stark-mark-ii': 'Der zweite Anzug machte aus dem klobigen Rohbau eine bewegliche Konstruktion, wurde wegen Vereisung in großer Höhe aber rasch ausgemustert und später zur ersten War-Machine-Rüstung umgebaut.',
  'tony-stark-mark-iii': 'Der dritte Anzug löste das Vereisungsproblem mit einer kältefesten Legierung, brachte als erster ein eingebautes Waffensystem mit und führte die rot-goldene Lackierung ein.',
  'tony-stark-mark-v': 'Der fünfte Anzug faltet sich zu einem Koffer zusammen und war beim Duell von Monaco griffbereit, wo Whiplash ihn beschädigte.',
  'tony-stark-mark-vi': 'Der sechste Anzug wurde für den neuen Arc-Reaktor mit höherer Leistung gebaut und ist der einzige der klassischen Reihe mit dreieckigem Brustelement.',
  'tony-stark-mark-vii': 'Der siebte Anzug legt sich als erster im Fallen von selbst an und trug Stark durch die Schlacht von New York.',
  'tony-stark-mark-xiv': 'Der vierzehnte Anzug gehört zu der Serie, die Stark nach der Schlacht von New York in rascher Folge baute und die zur Iron Legion anwuchs.',
  'tony-stark-mark-xxiv-tank': 'Der vierundzwanzigste Anzug trägt den Codenamen Tank, steckt schwere Treffer weg und ist für harte Gefechte gebaut.',
  'tony-stark-mark-xxv-striker': 'Der fünfundzwanzigste Anzug heißt Striker und ist mit zwei Presslufthämmern für Bauarbeiten ausgerüstet.',
  'tony-stark-mark-xxvi-gamma': 'Der sechsundzwanzigste Anzug mit dem Codenamen Gamma ist die verbesserte Bauversion des Mark XXV und gehörte wie dieser zur Iron Legion.',
  'tony-stark-mark-xxxviii-igor': 'Der achtunddreißigste Anzug mit dem Codenamen Igor ist auf schweres Heben ausgelegt und stützte in Miami einen einstürzenden Kran.',
  'tony-stark-mark-xliv-hulkbuster': 'Der vierundvierzigste Anzug ist der Hulkbuster, den Stark und Banner gemeinsam für den Fall bauten, dass Hulk außer Kontrolle gerät, und der in Johannesburg zum Einsatz kam.',
  'tony-stark-mark-xlv': 'Den fünfundvierzigsten Anzug trug Stark vor allem in der Schlacht von Sokovia gegen Ultron.',
  'tony-stark-mark-xlviii-hulkbuster-2-0': 'Der achtundvierzigste Anzug war als zweiter Hulkbuster gedacht, um Hulk notfalls zu bändigen, in der Schlacht von Wakanda steckte darin aber Bruce Banner.',
  'tony-stark-mark-l': 'Der fünfzigste Anzug ist der erste aus Nanotechnik, die aus dem Brustelement über den Körper wächst, und kämpfte auf Titan gegen Thanos.',
  'tony-stark-mark-lxxxv-85': 'Der fünfundachtzigste und letzte Anzug begleitete Stark durch den Zeitraub und die Schlacht um die Erde, in der er die Steine ein letztes Mal in die Hand nahm.',
  'tony-stark-quantum-suit': 'Für den Zeitraub trägt auch Stark den weißen Quantenanzug nach Scott Langs Bauplan und geht darin zurück ins Jahr 1970.',
  'tony-stark-civil': 'Ohne Rüstung ist Stark der Kopf von Stark Industries, der seine Identität als Iron Man vor laufenden Kameras selbst preisgegeben hat.',
  'tony-stark-mark-xlvii': 'Der siebenundvierzigste Anzug entstand als Ersatz, nachdem Captain America den Mark XLVI in Leipzig beschädigt hatte.',

  /* ---------- Marc Spector / Steven Grant ---------- */
  'marc-spector-steven-grant-moon-knight': 'Der Zeremonienpanzer ist die Rüstung, die Khonshu seinen Avataren verleiht und die sich auf Ruf anlegt und wieder auflöst.',
  'marc-spector-steven-grant-moon-knight-classic': 'In der Kampfform von Khonshus Rüstung tritt Marc Spector als Moon Knight an, vermummt und mit halbmondförmigen Wurfklingen.',
  'marc-spector-steven-grant-moon-knight-mr-knight': 'Mr. Knight ist die zweite Gestalt derselben Rüstung, ein weißer Anzug mit Maske, den Steven Grant ruft, wenn ermittelt statt gekämpft wird.',
  'marc-spector-steven-grant-moon-knight-steven-grant': 'Steven Grant ist die zweite Persönlichkeit in Marc Spectors Körper, ein Angestellter im Museumsladen, der von den nächtlichen Einsätzen zunächst nichts ahnt.',
  'marc-spector-steven-grant-moon-knight-steven-grant-zivil': 'Zwischen den Aussetzern führt Steven Grant sein Londoner Alltagsleben weiter und fesselt sich nachts ans Bett, um dem eigenen Körper nicht zu folgen.',

  /* ---------- Thor ---------- */
  'thor': 'Für die Schlacht von New York trägt Thor die asgardische Rüstung mit den Scheiben auf der Brust und rotem Umhang und führt noch Mjölnir.',
  'thor-ragnarok': 'Nach dem Verlust von Mjölnir und seinem Haar tritt Thor in der Gladiatorenrüstung von Sakaar an und lernt, dass seine Kraft nie am Hammer hing.',
  'thor-infinity-war': 'Nach dem Untergang Asgards lässt Thor sich auf Nidavellir die Axt Stormbreaker schmieden und zieht damit in die Schlacht von Wakanda.',
  'thor-endgame': 'Fünf Jahre nach dem Fingerschnippen lebt Thor zurückgezogen und verwahrlost in Neu-Asgard, bis der Zeitraub ihn aus der Hütte holt.',
  'thor-love-and-thunder': 'Für die Jagd auf Gorr den Götterschlächter bringt Thor sich wieder in Form und zieht mit Stormbreaker und den Guardians los.',
  'thor-thor': 'In seinem ersten Auftritt ist Thor der überhebliche Thronerbe Asgards, den Odin auf die Erde verbannt, bis er Mjölnir wieder heben darf.',
  'thor-zivil': 'Ohne Rüstung trägt Thor die schlichte Kleidung, die ihm auf Sakaar bleibt, nachdem der Großmeister ihn zum Arenakämpfer erklärt hat.',
  'thor-love-and-thunder-helm': 'Zur Rüstung aus Love and Thunder gehört der geflügelte Helm, den Thor für seine großen Auftritte aufsetzt.',
  'thor-love-and-thunder-schwarz-gold': 'Dieselbe Rüstung tritt in Schwarz und Gold auf, wenn Thor sie mit Mjölnir statt mit Stormbreaker führt.',
  'thor-fellumhang': 'Zu Beginn von Love and Thunder zieht Thor mit den Guardians durch die Galaxis und trägt dazu den Fellkragen über der asgardischen Rüstung.',
  'thor-zivil-love-and-thunder': 'Zwischen den Einsätzen läuft Thor in Lederweste und T-Shirt herum, denn Neu-Asgard ist inzwischen ein Ausflugsziel mit Souvenirladen.',
  'thor-the-dark-world': 'Für den Krieg gegen Malekith trägt Thor die dunkle Lederrüstung mit dem langen roten Umhang und führt Mjölnir gegen die Dunkelelfen.',
  'thor-age-of-ultron': 'Gegen Ultron trägt Thor die Rüstung mit den Brustscheiben und dem kurzen Umhang und öffnet damit Visions Erschaffung den Weg.',
  'thor-ragnarok-anfang': 'Vor Haarschnitt und Hammerverlust jagt Thor Surtur in Muspelheim nach, noch mit langem Haar, rotem Umhang und Mjölnir in der Hand.',
  'thor-quantum-suit': 'Für den Zeitraub steckt auch Thor in dem weißen Quantenanzug nach Scott Langs Bauplan, mit dem das Team durch den Quantentunnel geht.',

  /* ---------- Bruce Banner ---------- */
  'bruce-banner': 'Hulk ist die Gestalt, in die Banner unter Wut und Angst umschlägt, seit ein Gammastrahlenversuch die Kontrolle über seinen Körper zerrissen hat.',
  'bruce-banner-smart-hulk': 'Als Smart Hulk hat Banner nach achtzehn Monaten im Gammalabor beide Seiten in einem Körper vereint und behält Verstand und Sprache im grünen Leib.',
  'bruce-banner-quantum-suit': 'Für den Zeitraub steckt der Smart Hulk in einem eigens geschnittenen Quantenanzug und holt in Greenwich Village den Zeitstein bei der Ältesten.',
  'bruce-banner-ruffalo': 'Zwischen den Verwandlungen ist Banner der Wissenschaftler, der sich in Kalkutta versteckt hielt, bis S.H.I.E.L.D. ihn wegen des Tesserakts zurückholte.',
  'bruce-banner-norton': 'In seinen ersten Jahren auf der Flucht lebt Banner in Brasilien und sucht nach einem Gegenmittel, während General Ross Jagd auf ihn macht.',
  'bruce-banner-the-incredible-hulk': 'In seinem ersten Auftritt ist Hulk dunkler und schwerer als später und stellt sich in Harlem der Abomination.',
  'bruce-banner-infinity-war': 'Auf dem Flüchtlingsschiff der Asgardier stellt Hulk sich Thanos in den Weg und verliert den Kampf so gründlich, dass er sich danach lange nicht mehr zeigt.',
  'bruce-banner-infinity-war-mensch': 'Nach der Niederlage gegen Thanos bleibt Banner in menschlicher Gestalt und zieht in Wakanda in Starks Hulkbuster-Rüstung in die Schlacht.',
  'bruce-banner-ragnarok': 'Zwei Jahre am Stück blieb Banner Hulk, wurde auf Sakaar zum Champion des Großmeisters und gewöhnte sich an Sprache, Rüstung und Ruhm.',
  'bruce-banner-ragnarok-mensch': 'Als Banner auf Sakaar zurückverwandelt wird, steckt er in Tony Starks zu enger Kleidung und fürchtet, dass ein weiterer Wechsel für immer wäre.',
  'bruce-banner-she-hulk': 'In seinem Strandhaus in Mexiko steht Banner als Hulk in Trägerhemd und kurzer Hose und richtet dort das Gelände ein, auf dem Jennifer Walters ihre Kräfte kennenlernt.',
  'bruce-banner-banner-pullover': 'Zwischen den Einsätzen lebt Banner in aller Ruhe an der Küste und bringt seiner Cousine Jennifer Walters bei, mit dem Hulk in ihr umzugehen.',
  'bruce-banner-brand-new-day': 'Als Jean Grey von Banner Besitz ergreift, kehrt der wortlose Hulk der ersten Jahre zurück und geht auf ein Depot von Damage Control los.',
  'bruce-banner-professor': 'Als Professor hält ein Hemmgerät den Hulk in menschlicher Gestalt, und nach diesem Vorbild baut Peter Parker sich seinen eigenen Hemmer gegen die Mutation.',

  /* ---------- Steve Rogers ---------- */
  'steve-rogers': 'Der dunkle Anzug ohne Stern entstand in der Zeit nach dem Bruch der Avengers, in Wakanda kommen die beiden Vibraniumschilde von Shuri dazu.',
  'steve-rogers-mjoelnir': 'In der Schlacht um die Erde hebt Rogers Mjölnir, weil er des Hammers immer würdig war, und schlägt damit auf Thanos ein.',
  'steve-rogers-endgame': 'Für die Schlacht um die Erde trägt Rogers wieder Stern und Helm und führt den Schild, den er sich im Jahr 2012 selbst abgenommen hat.',
  'steve-rogers-quantum-suit': 'Im weißen Quantenanzug geht Rogers zurück ins Jahr 2012, wo er seinem eigenen jüngeren Ich gegenübersteht und Loki das Tesserakt wieder abnimmt.',
  'steve-rogers-civil-war': 'Der Anzug aus Civil War kommt ohne Helmflügel aus und begleitet Rogers vom Streit um das Sokovia-Abkommen bis in den Kampf gegen Iron Man in Sibirien.',
  'steve-rogers-age-of-ultron': 'Der Anzug aus Age of Ultron ist dunkler als der von New York und begleitet Rogers von der Erstürmung der Hydra-Festung bis in die Schlacht von Sokovia.',
  'steve-rogers-avengers': 'Das Kostüm für die Schlacht von New York ist das erste, das S.H.I.E.L.D. für ihn baut, mit hellem Blau, großem Stern und dem Helm mit dem A.',
  'steve-rogers-first-avenger': 'Das erste Kostüm entstand aus dem Bühnenanzug der Kriegsanleihe-Tournee und wurde für den Einsatz gegen Hydra zur Uniform mit Vibraniumschild umgebaut.',
  'steve-rogers-uso-tournee': 'Für die Tournee zum Verkauf von Kriegsanleihen steckte die Armee ihren einzigen Supersoldaten in ein Bühnenkostüm mit dreieckigem Schild, statt ihn an die Front zu lassen.',
  'steve-rogers-stealth-suit-maskiert-2': 'Die alte Uniform holt Rogers sich aus dem Smithsonian zurück, als S.H.I.E.L.D. von Hydra unterwandert ist und er niemandem mehr trauen kann.',
  'steve-rogers-stealth-suit-maskiert-1': 'Zum Stealth Suit gehört ein Helm ohne Flügel, hinter dem Rogers beim Zugriff auf der Lemurian Star unerkannt bleiben sollte.',

  /* ---------- Bucky Barnes ---------- */
  'bucky-barnes-zivil': 'Nach der Rückkehr aus Wakanda lebt Barnes ohne Auftrag in Brooklyn, geht zur Therapie und arbeitet die Liste seiner Opfer ab.',
  'bucky-barnes-winter-soldier-1': 'Als Winter Soldier war Barnes Hydras Auftragsmörder, den ein Metallarm, eine Maske und eine Reihe russischer Auslösewörter steuerten.',
  'bucky-barnes-winter-soldier-3': 'Ohne Maske erkennt Rogers in dem Attentäter seinen totgeglaubten Freund, während Barnes selbst den eigenen Namen nicht mehr kennt.',
  'bucky-barnes-winter-soldier-2': 'In der Rückblende von Civil War fährt der Winter Soldier 1991 mit Maulkorbmaske und Schutzbrille den Wagen der Starks von der Straße.',
  'bucky-barnes-thunderbolts': 'Als gewählter Abgeordneter tritt Barnes den Thunderbolts bei und trägt einen dunklen Kampfanzug über dem goldenen Arm aus Wakanda.',

  /* ---------- Taskmaster ---------- */
  'taskmaster': 'Der Taskmaster-Anzug wurde für Antonia Dreykov gebaut, die über ihr Visier die Bewegungen jedes Gegners abliest und sofort nachahmt.',
  'taskmaster-unmasked': 'Unter der Maske steckt Antonia Dreykov, die ihr Vater nach einer Explosion mit einem Implantat im Kopf zur willenlosen Waffe machte.',
  'taskmaster-thunderbolts': 'Von Dreykovs Steuerung befreit arbeitet Antonia als Söldnerin für Valentina Allegra de Fontaine und läuft mit ihr in die Falle im Bunker.',

  /* ---------- Natasha Romanoff ---------- */
  'natasha-romanoff': 'Der schwarze Kampfanzug mit den Widow-Stäben ist Romanoffs Arbeitskleidung, seit sie aus dem Roten Raum zu S.H.I.E.L.D. übergelaufen ist.',
  'natasha-romanoff-white': 'Den weißen Tarnanzug nimmt Romanoff Yelena Belova ab und trägt ihn beim Angriff auf den Roten Raum über dem Schnee.',
  'natasha-romanoff-black-widow-white-suit': 'Der weiße Anzug stammt aus Belovas Vorrat und ersetzt das Schwarz, weil das Versteck der Familie tief im Schnee liegt.',
  'natasha-romanoff-endgame': 'Fünf Jahre nach dem Fingerschnippen hält Romanoff vom Avengers-Hauptquartier aus die Reste des Netzes zusammen und lässt ihr Haar wieder wachsen.',
  'natasha-romanoff-quantum-suit': 'Im weißen Quantenanzug fliegt Romanoff mit Clint Barton nach Vormir, wo sie sich für den Seelenstein in die Tiefe stürzt.',
  'natasha-romanoff-infinity-war': 'Untergetaucht nach dem Bruch der Avengers färbt Romanoff ihr Haar blond und kämpft in Schottland und Wakanda ohne Ausweis und ohne Auftrag.',
  'natasha-romanoff-lagos': 'In Lagos jagt Romanoff mit dem Team Brock Rumlow und trägt dafür den leichten Anzug für den Einsatz in der Menge.',
  'natasha-romanoff-age-of-ultron': 'Für die Jagd auf Lokis Zepter trägt Romanoff den Avengers-Anzug mit den Leuchtstreifen, der zur gemeinsamen Ausrüstung des Teams gehört.',
  'natasha-romanoff-civil-war': 'Nach dem Fall von S.H.I.E.L.D. arbeitet Romanoff ohne Dienststelle weiter und stellt sich im Senat den Fragen zu ihrer Vergangenheit.',
  'natasha-romanoff-winter-soldier': 'Als Agentin von S.H.I.E.L.D. begleitet Romanoff Rogers auf die Lemurian Star und deckt mit ihm Hydras Project Insight auf.',
  'natasha-romanoff-avengers': 'In der Schlacht von New York trägt Romanoff den schwarzen Anzug mit den Widow-Bissen an den Handgelenken und schließt mit Lokis Zepter das Portal über dem Stark Tower.',
  'natasha-romanoff-iron-man-2': 'In ihrem ersten Auftritt hält Romanoff sich in der Rechtsabteilung von Stark Industries bedeckt und beobachtet Tony Stark für Nick Fury.',
  'natasha-romanoff-natalie-rushman': 'Natalie Rushman ist die Tarnidentität, unter der Romanoff als Assistentin bei Stark Industries eingeschleust wurde.',
  'natasha-romanoff-black-widow-black-suit': 'Den schwarzen Kampfanzug trägt Natasha Romanoff beim Sturm auf den Roten Raum, mit dem sie Dreykovs Herrschaft über die Witwen beendet.',

  /* ---------- Peter Parker ---------- */
  'peter-parker': 'Den Anzug aus Far From Home baute Parker selbst in Happy Hogans Werkstatt, nachdem Mysterio ihm die Stark-Ausrüstung abgenommen hatte.',
  'peter-parker-homecoming': 'Der von Tony Stark gebaute Anzug bringt eine eigene K.I., Linsen mit Anzeigefeld, eine Drohne und ausfahrbare Gleitflächen mit.',
  'peter-parker-iron-spider': 'Die Iron-Spider-Rüstung aus Nanotechnik trägt die Bezeichnung Item 17A, hält Parker im Weltraum am Leben und fährt vier Greifarme aus.',
  'peter-parker-no-way-home': 'Den letzten Anzug näht Parker von Hand, nachdem der Zauber jede Erinnerung an ihn gelöscht hat und von Starks Technik nichts mehr übrig ist.',
  'peter-parker-black-suit': 'Der schwarz-goldene Anzug entstand aus Resten in Happy Hogans Wohnung und begleitete Parker durch den Kampf gegen Green Goblin.',
  'peter-parker-night-monkey': 'Night Monkey ist die Tarnkleidung aus S.H.I.E.L.D.-Beständen, die Parker in Prag anzieht, um in Europa nicht als Spider-Man aufzufallen.',
  'peter-parker-civil-war': 'Vor dem Stark-Anzug trug Parker eine Kapuzenjacke mit Spinnenzeichen, blaue Kleidung und eine Maske mit Schwimmbrille.',
  'peter-parker-selbstgebauter-anzug': 'Zum selbstgebauten Anzug gehören Netzschleudern aus dem Chemieraum der Schule und Brillengläser, mit denen Parker in Queens seine ersten Runden drehte.',
  'peter-parker-brand-new-day': 'Vier Jahre nach dem großen Vergessen schützt Parker New York im Alleingang und trägt dabei den rot-blauen Anzug, den er sich nach dem Zauber selbst genäht hat.',
  'peter-parker-mutiert': 'Als das Trauma die Mutation seiner Spinnen-DNA beschleunigt, spinnt Parker organische Netze ohne Netzschleudern und hält die neuen Instinkte nur mit einem Inhibitor im Zaum.',
  'peter-parker-integrated-suit': 'Der Integrated Suit verbindet die Nanotechnik der Iron-Spider-Rüstung mit dem roten Anzug und ist der letzte, den Parker aus Starks Beständen trägt.',
  'peter-parker-zivil': 'Ohne Anzug ist Parker ein Schüler aus Queens, der mit seiner Klasse nach Europa fährt und dort eigentlich Ferien machen wollte.',

  /* ---------- Wanda Maximoff ---------- */
  'wanda-maximoff': 'Nach Sokovia kämpft Maximoff in dunkelrotem Mantel als Mitglied der Avengers und wird nach Lagos zur Streitfrage des Sokovia-Abkommens.',
  'wanda-maximoff-wandavision': 'In Westview zieht Maximoff sich zum Halloweenabend das rote Kostüm einer osteuropäischen Wahrsagerin an, das ihre Mutter für sie genäht hatte.',
  'wanda-maximoff-age-of-ultron': 'Als Versuchsperson Hydras erhielt Maximoff ihre Kräfte durch das Zepter und stand erst auf Ultrons Seite, bevor sie zu den Avengers wechselte.',
  'wanda-maximoff-lagos': 'In Lagos hält Maximoff die Explosion von Rumlows Weste in der Luft fest und trägt die Schuld an den Toten im Nachbargebäude.',
  'wanda-maximoff-infinity-war': 'Untergetaucht mit Vision lebt Maximoff in Schottland und muss in der Schlacht von Wakanda den Gedankenstein aus seiner Stirn brennen.',
  'wanda-maximoff-scarlet-witch': 'Als Scarlet Witch nimmt Maximoff die Krone der Hexe an, die in der Prophezeiung des Darkhold als Herrin über das Chaos steht.',

  /* ---------- Nick Fury ---------- */
  'nick-fury': 'Als Direktor von S.H.I.E.L.D. stellt Fury im langen Ledermantel die Avengers zusammen und behält die Fäden auch dann in der Hand, wenn er offiziell tot ist.',
  'nick-fury-secret-invasion': 'Nach Jahren auf der Raumstation kehrt ein gealterter Fury ohne Amt und ohne Rückhalt zurück, um die Skrull-Rebellion um Gravik aufzuhalten.',
  'nick-fury-director-fury': 'Im Dienstanzug führt Fury das Dreieck von S.H.I.E.L.D. in Washington, bis er merkt, dass Hydra längst im Haus sitzt.',

  /* ---------- Loki ---------- */
  'loki': 'In Asgard steht Loki als zweiter Sohn Odins im grün-goldenen Gewand neben dem Thron, bis er von seiner Herkunft als Jötun erfährt.',
  'loki-avengers': 'Für den Angriff auf New York trägt Loki die Rüstung mit dem Hörnerhelm und führt das Zepter mit dem Gedankenstein.',
  'loki-dark-world': 'Nach New York sitzt Loki in Asgards Kerker, bis Thor ihn für den Zug gegen Malekith herausholt und er seinen Tod vortäuscht.',
  'loki-ragnarok': 'Auf Sakaar hat Loki sich als Vertrauter des Großmeisters eingerichtet und wechselt im Untergang Asgards zum letzten Mal die Seite.',
  'loki-tva': 'Als Variante festgenommen steckt Loki im braunen Overall der Zeitvarianzbehörde, auf dem seine Nummer und das Wort Variant stehen.',
  'loki-god-of-stories': 'Am Ende nimmt Loki den Platz am Webstuhl der Zeit ein, hält die Zweige des Multiversums mit eigener Kraft zusammen und trägt die Krone des Gottes der Geschichten.',
  'loki-schwarzer-anzug': 'In der Zwischenzeit zwischen den Reichen zeigt Loki sich gern in schlichter dunkler Kleidung, weil sie in keiner Welt auffällt.',
  'loki-the-dark-world': 'In The Dark World verlässt Loki die Zelle unter Asgard und zieht in leichter Lederrüstung mit Thor nach Svartalfheim, wo er seinen Tod vortäuscht.',
  'loki-gefangener': 'Als Gefangener sitzt Loki nach der Schlacht von New York ohne Helm und ohne Waffen in einer gläsernen Zelle in Asgards Verlies.',
  'loki-ledermantel': 'Über der asgardischen Kleidung trägt Loki den langen Ledermantel, in dem er Thor auf dem Zug gegen die Dunkelelfen begleitet.',

  /* ---------- Sylvie ---------- */
  'sylvie': 'Als Variante des Loki gehört auch zu Sylvie ein Hörnerreif, ein kleinerer Kranz mit abgebrochenem Horn, den sie im Kampf zur Not als Waffe nimmt.',
  'sylvie-staffel-1': 'In der ersten Staffel trägt Sylvie den grünen Umhang über abgetragener Lederrüstung und führt das Schwert mit den asgardischen Runen, mit dem sie sich durch die Minutemen der TVA schlägt.',
  'sylvie-staffel-2': 'In der zweiten Staffel hat Sylvie sich im Jahr 1982 in Oklahoma ein ruhiges Leben hinter einem Tresen eingerichtet und legt den langen Mantel erst wieder an, als die Jagd auf Victor Timely sie zurückholt.',

  /* ---------- Sam Wilson ---------- */
  'sam-wilson-stealth-suit': 'Der dunkle Stealth Suit ist Wilsons Ausrüstung als Falcon in den Einsätzen gegen die Flag Smashers, bevor er den Schild annimmt.',
  'sam-wilson-stealth-suit-maskiert': 'Zur Falcon-Ausrüstung gehört die Brille mit Anzeigefeld, über die Wilson die Drohne Redwing steuert.',
  'sam-wilson-vibranium-captain-america-suit': 'Den Anzug aus Vibranium baute die Wakandan Design Group für Wilson, als er den Schild annahm und dritter Captain America wurde.',
  'sam-wilson-vibranium-captain-america-suit-masked': 'Zum Vibraniumanzug gehören die ausfahrbaren Flügel und der Helm, mit denen Wilson als erster Captain America ohne Serum in die Luft geht.',
  'sam-wilson-exo-7-falcon-upgraded-service-suit': 'Vor dem Infinity War flog Wilson mit der überarbeiteten Fassung des EXO-7 Falcon, die er nach dem Bruch der Avengers im Untergrund weiternutzte.',
  'sam-wilson-exo-7-falcon-avengers-suit': 'Als offizielles Mitglied der Avengers bekam Wilson einen neuen EXO-7 Falcon mit rotem Zeichen auf der Brust.',
  'sam-wilson-exo-7-falcon-air-force-prototype': 'Der EXO-7 Falcon ist ein Flügelanzug der Air National Guard, den Rogers und Romanoff für Wilson aus einem Lager holten, um Project Insight zu stoppen.',

  /* ---------- Gamora ---------- */
  'gamora-guardians-of-the-galaxy': 'Als Adoptivtochter von Thanos wurde Gamora zur gefährlichsten Frau der Galaxis ausgebildet und lief bei der Jagd auf den Machtstein zu den Guardians über.',
  'gamora-kid': 'Als Kind wurde Gamora auf Zen-Whoberi von Thanos aus der Menge gegriffen, nachdem er ihr Volk zur Hälfte hatte töten lassen.',
  'gamora-guardians-of-the-galaxy-vol-2': 'In Vol. 2 hält Gamora die Mannschaft zusammen und stellt sich am Ende der Schwester, die sie ihr Leben lang bekämpft hat.',

  /* ---------- Groot ---------- */
  'groot-adult-groot': 'Der erwachsene Groot spricht nur einen einzigen Satz, versteht sich aber mit Rocket und opfert sich in der Schlacht um Xandar für das Team.',
  'groot-baby': 'Aus dem geretteten Zweig wuchs Baby Groot heran, ein völlig neues Wesen, das die Erinnerung des ersten Groot nicht mehr in sich trägt.',
  'groot-adolescent-groot': 'Als Halbwüchsiger antwortet Groot nur noch mürrisch und lässt sich vom Spiel kaum losreißen, hilft auf Nidavellir aber beim Schmieden von Stormbreaker.',
  'groot-swole-groot': 'Nach einer Zeit im Kraftraum steht Groot als muskelbepackte Fassung seiner selbst da, die er sich in Vol. 3 selbst antrainiert hat.',
  'groot-alpha-groot': 'In seiner ausgewachsenen Gestalt kann Groot seinen Körper zu Klingen, Schilden und ganzen Wänden umformen und spricht am Ende zum ersten Mal verständlich.',

  /* ---------- Carol Danvers ---------- */
  'carol-danvers': 'Der rot-blaue Anzug entsteht, als Danvers die Farben der Kree-Uniform selbst wählt und sich zu ihrer Herkunft auf der Erde bekennt.',
  'carol-danvers-the-marvels': 'In The Marvels trägt Danvers ihren überarbeiteten Anzug mit Schärpe und ist durch den Sprungfehler mit Kamala Khan und Monica Rambeau verbunden.',
  'carol-danvers-starforce': 'Die Starforce-Uniform ist die grün-schwarze Ausrüstung der Kree-Elitetruppe, in der Danvers als Vers gegen die Skrulls kämpfte.',
  'carol-danvers-aladna': 'Auf Aladna gilt Danvers als Prinzgemahl und trägt zur Hochzeitszeremonie das festliche Gewand des Planeten, auf dem gesungen statt gesprochen wird.',

  /* ---------- Shuri ---------- */
  'shuri': 'Als Prinzessin von Wakanda führt Shuri die Wakandan Design Group und baut die Technik, die ihr Bruder als Black Panther benutzt.',
  'shuri-panther-armor': 'Die Panther-Handschuhe aus ihrer Werkstatt baute Shuri für sich selbst und setzte sie im Kampf gegen Killmonger in der Vibraniummine ein.',
  'shuri-black-panther': 'Nach dem Tod von T’Challa und Ramonda stellt Shuri das Kraut selbst her und nimmt als zweite Black Panther den Habit an.',
  'shuri-black-panther-masked': 'Der Panther Habit ist ein aus Vibraniumgewebe gefertigter Anzug, der aufgenommene Treffer speichert und beim Gegenschlag zurückgibt.',
  'shuri-black-panther-unmasked': 'In ihrem Habit mit goldenem Muster tritt Shuri Namor am Strand gegenüber und entscheidet sich gegen die Rache.',

  /* ---------- Thaddeus Ross ---------- */
  'thaddeus-ross': 'Als General führte Ross die Jagd auf Bruce Banner und war es, der das Super-Soldaten-Programm wieder aufleben ließ, aus dem Abomination hervorging.',
  'thaddeus-ross-president': 'Als Präsident der Vereinigten Staaten will Ross die Avengers neu aufstellen und einen Vertrag über das Adamantium des Himmelsaffen aushandeln.',
  'thaddeus-ross-red-hulk': 'Die roten Pillen von Samuel Sterns hielten Ross am Leben und machten ihn im Zorn zum Red Hulk, worauf er sein Amt niederlegte.',

  /* ---------- Riri Williams ---------- */
  'riri-williams': 'Riri Williams studiert am MIT und baut mit knapp neunzehn Jahren eine eigene Rüstung, die Tony Starks Technik nachempfunden ist.',
  'riri-williams-mark-1': 'Die erste Ironheart-Rüstung entstand aus Schrott in ihrer Werkstatt am MIT und flog zum ersten Mal auf der Flucht vor Wakandas Kriegerinnen.',
  'riri-williams-mark-2': 'Die zweite Rüstung baute Shuri in ihrem Labor vollständig aus Vibranium, damit Williams im Krieg gegen die Talokanil bestehen konnte.',
  'riri-williams-mark-3': 'Die dritte Rüstung war der Ersatz, den Williams bauen musste, weil Wakanda die Mark II einbehalten hatte.',
  'riri-williams-mark-4': 'Die vierte Rüstung bezahlte Williams mit dem Geld, das sie als Mitglied von Hoods Bande verdient hatte.',
  'riri-williams-mark-5': 'Die fünfte Rüstung verbindet ihre Technik zum ersten Mal mit Magie und entstand unter dem Einfluss von Parker Robbins Kapuze.',
  'riri-williams-what-if': 'In der Zeichentrickfassung von What If tritt Williams in einer eigenen Abwandlung ihrer Rüstung auf.',

  /* ---------- Matt Murdock ---------- */
  'matt-murdock-daredevil': 'Der rote Anzug aus Melvin Potters Werkstatt ist eine Körperpanzerung, die Murdock die nächtlichen Runden über Hell’s Kitchen überleben lässt.',
  'matt-murdock-daredevil-civil': 'Bei Tag ist Murdock Anwalt in Hell’s Kitchen, der seit einem Unfall in der Kindheit blind ist und alle übrigen Sinne geschärft hat.',
  'matt-murdock-daredevil-season-1': 'Sein erster Aufzug war ein schwarzes Trainingsoutfit mit Tuch vor den Augen, in dem er im Viertel nur der Mann in der Maske hieß.',
  'matt-murdock-daredevil-born-again': 'In Born Again holt Murdock den Anzug nach langer Pause wieder hervor, als Wilson Fisk zum Bürgermeister von New York gewählt wird.',
  'matt-murdock-daredevil-she-hulk': 'Für den Besuch in Los Angeles trägt Murdock die gelb-rote Fassung seines Anzugs, ein Rückgriff auf sein allererstes Kostüm in den Comics.',

  /* ---------- Bob Reynolds ---------- */
  'bob-sentry': 'Robert Reynolds überlebte als einziger Versuch von Project Sentry und wurde zum stärksten Wesen der Erde, dessen Kraft an seiner Stimmung hängt.',
  'bob-sentry-void': 'Der Void ist die Kehrseite des Sentry, eine Schattengestalt aus Reynolds eigener Schwermut, die Menschen in ihre schlimmsten Erinnerungen sperrt.',

  /* ---------- Gravik ---------- */
  'gravik': 'Gravik führt die Skrull-Rebellion an und lebt in Menschengestalt in Neu-Skrullos, weil ihm die Erde als neue Heimat versprochen wurde.',
  'gravik-super-skrull': 'Mit der Harvester zog Gravik sich die Kräfte mehrerer Wesen in den eigenen Körper und wurde zum Super-Skrull mit Flammen, Eis und Groots Ranken.',

  /* ---------- Clint Barton ---------- */
  'clint-barton': 'Für die Jagd auf Ultron trägt Barton den Anzug mit den violetten Streifen und hält als einziger Avenger noch eine Familie geheim.',
  'clint-barton-civil-war': 'Aus dem Ruhestand holt Rogers ihn für den Kampf in Leipzig zurück, wonach Barton den Hausarrest der Familie zuliebe unterschreibt.',
  'clint-barton-ronin-unmaskiert': 'Nach dem Verlust seiner Familie zieht Barton fünf Jahre lang als Ronin durch die Welt und tötet die Verbrecher, die das Fingerschnippen verschont hat.',
  'clint-barton-ronin': 'Der Ronin-Anzug mit Schwert und Kapuze landete später auf einer Schwarzmarktauktion, wo Kate Bishop ihn an sich nahm.',
  'clint-barton-thor': 'In seinem ersten Auftritt sitzt Barton als Scharfschütze von S.H.I.E.L.D. über dem Krater, in dem Mjölnir liegt.',
  'clint-barton-avengers': 'Unter Lokis Zepter kämpft Barton als dessen Werkzeug gegen S.H.I.E.L.D., bis ein Schlag von Romanoff ihn befreit.',
  'clint-barton-hawkeye': 'Als Hawkeye arbeitet Barton ohne Kräfte und ohne Rüstung, verlässt sich auf Trickpfeile und trägt seit Sokovia ein Hörgerät.',
  'clint-barton-quantum-suit': 'Für den Zeitraub trägt Barton den weißen Quantenanzug und holt damit in Vormir den Seelenstein, wofür Natasha Romanoff mit dem Leben zahlt.',

  /* ---------- John Walker ---------- */
  'john-walker-captain-america': 'Von der Regierung zum neuen Captain America ernannt bekam Walker Schild und Uniform, ohne je das Serum erhalten zu haben.',
  'john-walker': 'Nach dem Mord vor laufenden Kameras wurde Walker unehrenhaft entlassen und trat später als U.S. Agent in einer schwarzen Fassung derselben Uniform an.',

  /* ---------- Hope van Dyne ---------- */
  'hope-van-dyne': 'Den Wasp-Anzug hatten Hank Pym und Janet van Dyne einst begonnen und ihn für ihre Tochter mit Flügeln und Blastern fertiggestellt.',
  'hope-van-dyne-civil': 'Vor dem Anzug arbeitet Hope van Dyne im Vorstand von Pym Technologies und hält den Vater für schuld am Verschwinden ihrer Mutter.',
  'hope-van-dyne-unmasked': 'Zum Wasp-Anzug gehört ein Helm, der beim Schrumpfen mitgeht und den van Dyne für die Gespräche im Team hochklappt.',
  'hope-van-dyne-flight': 'Anders als der Ant-Man-Anzug hat der Wasp-Anzug eingebaute Flügel, mit denen van Dyne im Flug die Größe wechselt.',
  'hope-van-dyne-quantumania': 'In Quantumania führt van Dyne die Pym-Van-Dyne-Stiftung und folgt ihrer Familie in das Quantenreich hinunter.',

  /* ---------- James Rhodes ---------- */
  'james-rhodes': 'Ohne Rüstung ist Rhodes Verbindungsoffizier der Air Force zu Stark Industries und der älteste Freund von Tony Stark.',
  'james-rhodes-colonel': 'Als Oberst der Air Force vertritt Rhodes im Dienstanzug die Rüstung gegenüber dem Militär, das sie am liebsten selbst hätte.',
  'james-rhodes-mark-1': 'Die erste War-Machine-Rüstung ist Starks Mark II, die Rhodes mitnahm und Justin Hammer mit schwerem Geschütz aufrüstete.',
  'james-rhodes-mark-2': 'Die zweite Rüstung wurde nach der Invasion der Chitauri von A.I.M. neu lackiert, um Rhodes als Iron Patriot zu vermarkten.',
  'james-rhodes-mark-ii-iron-patriot': 'Unter dem Namen Iron Patriot trug dieselbe Rüstung Sterne und Streifen, bis Aldrich Killians Anschläge den Namen unbrauchbar machten.',
  'james-rhodes-mark-3': 'Die dritte Rüstung entstand nach der Schlacht von Sokovia und wurde in Leipzig von Visions Strahl getroffen.',
  'james-rhodes-mark-iv': 'Die vierte Rüstung folgte auf den Absturz von Leipzig und war Rhodes Ausrüstung im Infinity War.',
  'james-rhodes-mark-v': 'Die fünfte Rüstung, auch Cosmic Iron Patriot genannt, lag im Lager, bis Rhodes sie für die Schlacht um die Erde brauchte.',
  'james-rhodes-mark-6': 'Die sechste Rüstung trug Rhodes beim Zeitraub und verlor sie bei Thanos Angriff auf das Avengers-Hauptquartier.',
  'james-rhodes-mark-vi-quantum-suit': 'Der weiße Quantenanzug entstand nach Scott Langs Bauplan und trug das Team durch den Quantentunnel in die eigene Vergangenheit.',
  'james-rhodes-mark-vii-iron-patriot-mk-ii': 'In Secret Invasion tritt Rhodes in einer neuen Iron-Patriot-Rüstung an, während ein Skrull längst seinen Platz eingenommen hat.',

  /* ---------- Samuel Sterns ---------- */
  'samuel-sterns-the-leader': 'Samuel Sterns war der Zellbiologe, der Banner unter dem Decknamen Mr. Blue half und dabei das Gammablut für sich selbst behielt.',
  'samuel-sterns-the-leader-green': 'Nach Jahren in einem geheimen Gefängnis tritt Sterns als Leader an, dessen aufgeblähter Schädel jeden Ablauf im Voraus berechnet.',
  'samuel-sterns-the-leader-the-incredible-hulk': 'Als Blonskys Blut in eine Wunde an Sterns Stirn tropfte, begann die Mutation, die seinen Kopf wachsen ließ.',

  /* ---------- Scott Lang ---------- */
  'scott-lang': 'Scott Lang ist der Einbrecher, den Hank Pym als Nachfolger auswählte, weil er den Anzug bei seinem ersten Bruch selbst gefunden hatte.',
  'scott-lang-visor': 'Der Ant-Man-Anzug schützt seinen Träger vor den Nebenwirkungen der Pym-Partikel und regelt die Größe über einen Knopf am Handschuh.',
  'scott-lang-masked': 'Mit geschlossenem Helm steuert Lang über eine Antenne die Ameisen, die im Einsatz Werkzeug, Transport und Verstärkung zugleich sind.',
  'scott-lang-quantum-suit': 'Der weiße Quantenanzug entstand nach Langs eigenem Bauplan, denn nach fünf Stunden im Quantenreich kannte er den Weg dorthin als Einziger.',

  /* ---------- Thanos ---------- */
  'thanos-ohne-ruestung': 'Im Infinity War zieht Thanos ohne vollständige Rüstung durch die Galaxis, weil er sich seiner Sache und der Steine sicher ist.',
  'thanos-armor': 'Die schwere goldene Rüstung mit dem doppelschneidigen Schwert legt Thanos an, als er 2014 der Erde ein zweites Mal entgegentritt.',
  'thanos-ruestung': 'Der Thanos aus dem Jahr 2014 folgte Nebula durch die Zeit und traf auf eine Erde, auf der sein Plan längst geschehen war.',

  /* ---------- Trevor Slattery ---------- */
  'trevor-slattery': 'Trevor Slattery ist ein abgehalfterter Schauspieler, den Aldrich Killian als Mandarin vor die Kamera stellte, um die Anschläge zu erklären.',
  'trevor-slattery-shang-chi': 'Nach dem Auffliegen der Rolle hielten die echten Zehn Ringe Slattery in Ta Lo gefangen, wo er sich mit dem Wesen Morris anfreundete.',
  'trevor-slattery-iron-man-3': 'In den Videobotschaften trat Slattery in weiten Gewändern und mit Vollbart auf, ein Bild aus mehreren Feindbildern zusammengesetzt.',

  /* ---------- Jack Duquesne ---------- */
  'jack-duquesne': 'Jack Duquesne ist Fechter und Verlobter von Eleanor Bishop, den Kate für den Kopf der Tracksuit-Bande hält, bis sich der Verdacht auflöst.',
  'jack-duquesne-born-again': 'In Born Again taucht Duquesne als Swordsman auf und stellt sich in New York offen gegen Wilson Fisks Regime.',

  /* ---------- Wilson Fisk ---------- */
  'wilson-fisk-kingpin': 'Wilson Fisk beherrscht das Verbrechen New Yorks und lässt sich in Born Again zum Bürgermeister wählen, um die Stadt von innen zu übernehmen.',
  'wilson-fisk-kingpin-white': 'Der weiße Anzug ist Fisks Erkennungszeichen und gehört zu den Auftritten, bei denen er sich als Wohltäter der Stadt zeigt.',
  'wilson-fisk-kingpin-hawkeye': 'In Hawkeye führt Fisk die Tracksuit-Bande über seine Nichte Maya Lopez und steht am Ende Kate Bishop selbst gegenüber.',
  'wilson-fisk-kingpin-echo': 'In Echo überlebt Fisk den Schuss ins Auge und trägt seither eine Augenklappe, während Maya Lopez ihm in Oklahoma entgegentritt.',

  /* ---------- Yelena Belova ---------- */
  'yelena-belova': 'Der schwarze Anzug mit der Weste ist Belovas Ausrüstung, nachdem sie sich mit dem roten Gegengift von der Steuerung des Roten Raums befreit hat.',
  'yelena-belova-hawkeye-maskiert': 'Für den Auftrag gegen Clint Barton geht Belova maskiert im schwarzen Anzug mit den grünen Leuchtstreifen vor und liefert sich mit Kate Bishop den Kampf auf den Dächern von New York.',
  'yelena-belova-hawkeye': 'Ohne Maske stellt Belova Barton persönlich, weil Valentina Allegra de Fontaine ihr den Bogenschützen als Schuldigen am Tod ihrer Schwester genannt hat.',
  'yelena-belova-thunderbolts': 'Als Auftragsmörderin für Valentina Allegra de Fontaine trägt Belova den grauen Kampfanzug und findet sich im Bunker mit ihren Konkurrenten wieder.',

  /* ---------- Adrian Toomes ---------- */
  'adrian-toomes-vulture': 'Adrian Toomes verlor nach der Schlacht von New York den Auftrag zur Trümmerbergung und baute aus der Chitauri-Technik ein eigenes Geschäft auf.',
  'adrian-toomes-vulture-flight': 'Der Flügelanzug des Vulture stammt aus umgebauter Chitauri-Technik und hebt Toomes samt Beute in die Luft.',

  /* ---------- Alexei Shostakov ---------- */
  'alexei': 'Alexei Shostakov war als Red Guardian die sowjetische Antwort auf Captain America und saß danach zwanzig Jahre in einem russischen Lager.',
  'alexei-unmaskiert': 'Aus dem Gefängnis befreit passt Shostakov kaum noch in sein altes Kostüm und lebt von den Geschichten seines einzigen großen Auftritts.',

  /* ---------- Ava Starr ---------- */
  'ava-starr-schwarzer-ghost-anzug-unmaskiert': 'Ava Starr wurde als Kind von einem Quantenunfall zerrissen und kann seither durch feste Materie hindurchgehen, was sie zugleich langsam auflöst.',
  'ava-starr-schwarzer-ghost-anzug': 'Den Ghost-Anzug baute S.H.I.E.L.D., damit Starr ihr Phasen steuern kann, ohne die Kontrolle über den eigenen Körper zu verlieren.',
  'ava-starr-weisser-ghost-anzug': 'In den Thunderbolts trägt Starr eine hellere Fassung des Anzugs und arbeitet als Söldnerin für Valentina Allegra de Fontaine.',

  /* ---------- Charles Xavier ---------- */
  'charles-xavier-professor-x': 'Der Charles Xavier des Universums 838 sitzt für die Illuminati im gelben Schwebestuhl und versucht, Wanda Maximoff in ihrem eigenen Geist zu erreichen.',
  'charles-xavier-professor-x-young': 'In jüngeren Jahren gründete Xavier die Schule für begabte Jugendliche und bildete dort die erste Generation der X-Men aus.',
  'charles-xavier-professor-x-standing': 'Vor dem Rat der Illuminati tritt Xavier in der Robe des Gremiums auf, das über die Sicherheit seines Universums wacht.',

  /* ---------- Brock Rumlow ---------- */
  'crossbones': 'Brock Rumlow führte das S.T.R.I.K.E.-Team von S.H.I.E.L.D. und arbeitete dabei die ganze Zeit für Hydra.',
  'crossbones-civil-war': 'Nach den Verbrennungen in Washington kehrt Rumlow als Crossbones mit Panzerhandschuhen und Totenkopfweste zurück und zündet in Lagos seine Bombe.',

  /* ---------- Darren Cross ---------- */
  'darren-cross': 'Darren Cross verdrängte Hank Pym aus dessen eigener Firma und rekonstruierte im Alleingang die Formel der Pym-Partikel.',
  'darren-cross-suit': 'Der Yellowjacket-Anzug ist Cross bewaffnete Fassung des Ant-Man-Anzugs mit Kevlar, Titangliedern und Laserwaffen.',
  'darren-cross-modok': 'Der Absturz in das Quantenreich zerdrückte Cross Körper, den Kang zu MODOK umbaute, einem Kopf auf einer schwebenden Kampfmaschine.',
  'darren-cross-modok-masked': 'Als MODOK diente Cross Kang als Jäger, bis Cassie Lang ihn daran erinnerte, dass er selbst entscheiden kann.',

  /* ---------- Otto Octavius ---------- */
  'doc-ock': 'Otto Octavius verwuchs bei einem Fusionsunfall mit vier künstlich intelligenten Greifarmen, die seither seinen Willen überlagern.',
  'doc-ock-civil': 'Nachdem Peter Parker den Steuerungschip im Nacken repariert hat, gewinnt Octavius die Kontrolle zurück und hilft, die anderen zu heilen.',

  /* ---------- Max Dillon ---------- */
  'electro': 'Max Dillon fiel bei Oscorp in ein Becken elektrischer Aale und wurde zu einem Wesen, das aus reiner Elektrizität besteht.',
  'electro-max-dillon': 'Vor dem Unfall war Dillon ein übersehener Elektroingenieur, der sich in Spider-Man den einzigen Menschen sah, der ihn wahrnahm.',
  'electro-fight': 'Im Multiversum bekommt Dillon durch Starks Arc-Reaktor mehr Kraft als je zuvor und will damit nicht in seine Welt zurück.',
  'electro-no-way-home': 'Ohne die Maske seiner Heimatwelt tritt Electro in No Way Home offen auf und leuchtet im Kampf auf dem Freiheitsdamm blau.',

  /* ---------- Emil Blonsky ---------- */
  'emil-blonsky-abomination': 'Emil Blonsky war Elitesoldat der Royal Marines, den Ross zur Jagd auf Hulk holte und mit einer Fassung des Serums aufwertete.',
  'emil-blonsky-abomination-2008': 'Die Mischung aus Serum und Sterns Gammablut machte Blonsky zum Abomination, der Harlem verwüstete und danach jahrzehntelang eingesperrt blieb.',
  'emil-blonsky-abomination-green': 'In der Haft lernte Blonsky Sonette zu schreiben und seine Verwandlung willentlich zu steuern, worauf ihm Freigang gewährt wurde.',
  'emil-blonsky-abomination-she-hulk': 'Im Untergrundkampf von Shang-Chi trat Blonsky als Abomination gegen Wong an und ließ sich von ihm aus dem Gefängnis holen.',
  'emil-blonsky-abomination-zivil': 'Auf seinem Rückzugsort in Kalifornien führt Blonsky Selbsthilfegruppen und trägt einen Fußfessel-Hemmer, der die Verwandlung unterbinden soll.',

  /* ---------- Erik Killmonger ---------- */
  'erik-killmonger': 'N’Jadaka wuchs als Sohn eines ermordeten wakandischen Prinzen in Oakland auf und erarbeitete sich beim Militär den Namen Killmonger.',
  'erik-killmonger-black-panther': 'Nach dem Sieg im Zweikampf nahm Killmonger das Kraut und den Habit an sich und ließ die restlichen Pflanzen verbrennen.',

  /* ---------- Norman Osborn ---------- */
  'green-goblin': 'Norman Osborn testete das Leistungsserum an sich selbst, worauf eine zweite Persönlichkeit die Herrschaft über ihn übernahm.',
  'green-goblin-armor': 'Die Panzerung des Green Goblin stammt aus Oscorps Militärprogramm und wurde im Multiversum ohne Maske weitergetragen.',
  'green-goblin-glider': 'Zur Ausrüstung gehören der Gleiter und die Kürbisbomben, mit denen Osborn im Kampf auf dem Freiheitsdamm Tante May tötet.',

  /* ---------- Happy Hogan ---------- */
  'happy-hogan': 'Happy Hogan war Fahrer und Leibwächter von Tony Stark und leitet später die Sicherheit von Stark Industries.',
  'happy-hogan-what-if': 'In What If ermittelt Hogan im Zeichentrick auf eigene Faust, als die Anwärter auf die Avengers nacheinander sterben.',

  /* ---------- Helmut Zemo ---------- */
  'helmut-zemo': 'Helmut Zemo verlor seine Familie in der Schlacht von Sokovia und ließ die Avengers daraufhin an ihrer eigenen Vergangenheit zerbrechen.',
  'helmut-zemo-falcon-and-the-winter-soldier': 'Mit Maske und Mantel führt Zemo den Zug gegen die Flag Smashers an, weil er jede weitere Reihe von Super-Soldaten verhindern will.',

  /* ---------- Howard Stark ---------- */
  'howard-stark': 'Howard Stark war Waffenentwickler, Mitgründer von S.H.I.E.L.D. und der Vater, dem Tony erst im Zeitraub noch einmal begegnet.',
  'howard-stark-young': 'Im Krieg baute Stark die Ausrüstung von Captain America, entwickelte das Vibraniumschild und flog die Einsätze der Strategischen Wissenschaftsreserve mit.',

  /* ---------- Ivan Vanko ---------- */
  'ivan-vanko-whiplash': 'Ivan Vanko baute seine erste Rüstung, um Tony Stark für die Vertreibung seines Vaters Anton büßen zu lassen.',
  'ivan-vanko-whiplash-mark-2': 'Die zweite Rüstung entstand in Justin Hammers Werkstatt und steuerte über Funk die ganze Reihe der Hammer-Drohnen.',

  /* ---------- Jane Foster ---------- */
  'jane-foster': 'Jane Foster ist Astrophysikerin und findet Thor in New Mexico, wo sie die Brücke zwischen den Reichen zum ersten Mal misst.',
  'jane-foster-dark-world': 'In London zieht der Äther in Fosters Körper ein und macht sie zur Trägerin eines Infinity-Steins, den Malekith zurückholen will.',
  'jane-foster-mighty-thor': 'Als Mighty Thor ruft Foster den wieder zusammengefügten Mjölnir zu sich, der ihr im Kampf Kraft gibt und außerhalb davon ihre Krebsbehandlung zunichtemacht.',

  /* ---------- Johann Schmidt ---------- */
  'johann-schmidt-red-skull': 'Johann Schmidt führte Hydra als Forschungsabteilung der SS und nahm eine unfertige Fassung von Erskines Serum an sich.',
  'johann-schmidt-red-skull-skull': 'Das Serum verbrannte Schmidts Gesicht zur roten Totenmaske, hinter der er sich bis zum Angriff auf die Vereinigten Staaten verbarg.',
  'johann-schmidt-red-skull-stonekeeper': 'Der Tesserakt schleuderte Schmidt nach Vormir, wo er seit Jahrzehnten als körperloser Wächter den Preis des Seelensteins erklärt.',

  /* ---------- Logan ---------- */
  'logan-wolverine-1': 'Dieser Logan ließ sein Universum untergehen, weil er beim Aufruf zum Kampf betrunken liegen blieb, und trinkt seither gegen die Schuld an.',
  'logan-wolverine-2': 'Der gelb-blaue Anzug ist das Kostüm, das Logan in seiner eigenen Welt nie getragen hat und das ihm die TVA schließlich aushändigt.',

  /* ---------- M’Baku ---------- */
  'm-baku': 'M’Baku führt den Jabari-Stamm, der sich aus den Angelegenheiten Wakandas heraushält und den Panther nicht als seinen König anerkennt.',
  'm-baku-fur': 'Der Fellumhang der Jabari kommt aus dem Bergland, in dem der Stamm getrennt vom Rest Wakandas lebt.',
  'm-baku-man-ape': 'Im Zweikampf am Wasserfall tritt M’Baku in der Rüstung mit der Gorillamaske an, dem Zeichen des Affengottes Hanuman.',

  /* ---------- Nakia ---------- */
  'nakia': 'Nakia arbeitet als War Dog im Ausland und will Wakandas Reichtum mit der Welt teilen, lange bevor T’Challa denselben Schritt geht.',
  'nakia-wakanda-forever': 'Nach T’Challas Tod lebt Nakia mit dem gemeinsamen Sohn in Haiti, bis Shuri sie für die Rettung von Riri Williams zurückholt.',
  'nakia-bahadir': 'Kamalas beste Freundin geht in Jersey City in Jeans, Lederjacke und Hidschab zur Schule und trägt ihren Glauben so selbstverständlich wie ihre Freundschaft.',

  /* ---------- Quentin Beck ---------- */
  'quentin-beck-mysterio': 'Quentin Beck war der von Stark entlassene Entwickler der Illusionstechnik B.A.R.F. und baute daraus die Legende des Helden aus einer anderen Erde.',
  'quentin-beck-mysterio-helm': 'Der Nebelhelm ist Teil der Inszenierung und leer, weil Beck den Auftritt in Wahrheit aus einer Drohnenflotte heraus steuert.',

  /* ---------- Shang-Chi ---------- */
  'shang-chi': 'Shang-Chi wuchs als Sohn von Xu Wenwu zum Auftragsmörder heran und lebte danach unter dem Namen Shaun als Parkwächter in San Francisco.',

  /* ---------- Simon Williams ---------- */
  'simon-williams-1': 'Simon Williams ist ein Schauspieler in Los Angeles, der die Rolle des Wonder Man in einer Neuverfilmung anstrebt.',
  'simon-williams-2': 'Als Wonder Man besteht sein Körper aus Ionenenergie, die ihn nahezu unverwundbar macht und in blauem Licht leuchten lässt.',

  /* ---------- T’Challa ---------- */
  't-challa': 'Nach dem Tod seines Vaters übernimmt T’Challa Thron und Habit und muss entscheiden, ob Wakanda sich der Welt öffnet.',
  't-challa-civil': 'Zwischen den Einsätzen führt T’Challa die Amtsgeschäfte in Wakanda und trägt dabei die Gewänder des Königshauses.',
  't-challa-unmasked': 'Der Habit lässt sich über die Halskette aus Kimoyo-Perlen an- und ablegen und rollt sich bei Bedarf vollständig zurück.',
  't-challa-fight': 'In Leipzig kämpft T’Challa nicht für ein Abkommen, sondern für die Rache an dem Mann, den er für den Mörder seines Vaters hält.',

  /* ---------- Talos ---------- */
  'talos': 'In Menschengestalt gab Talos sich als Agent Keller aus, um in den Neunzigern unerkannt nach den Überresten des Lichtgeschwindigkeitsantriebs zu suchen.',
  'talos-skrull': 'Talos führte die geflohenen Skrulls an, die vor den Kree eine neue Heimat suchten, und blieb Nick Fury über Jahrzehnte verbunden.',

  /* ---------- Erik Selvig ---------- */
  'erik-selvig': 'Erik Selvig ist Astrophysiker und Fosters Mentor, der als erster ernst nimmt, dass die Erscheinungen über New Mexico kein Wetter sind.',
  'erik-selvig-dark-world': 'Nach Lokis Zugriff auf seinen Verstand kommt Selvig aus der Psychiatrie und misst die Konvergenz der neun Reiche in Stonehenge.',

  /* ---------- Janet van Dyne ---------- */
  'janet-van-dyne': 'Janet van Dyne schrumpfte 1987 unter die Grenze der Umkehr, um eine Rakete zu stoppen, und verbrachte dreißig Jahre im Quantenreich.',
  'janet-van-dyne-wasp': 'Den ersten Wasp-Anzug bauten Hank Pym und Janet van Dyne gemeinsam für ihre eigenen Einsätze in den achtziger Jahren.',

  /* ---------- Karli Morgenthau ---------- */
  'karli-morgenthau': 'Karli Morgenthau führt die Flag Smashers an, die nach dem Blip für eine Welt ohne Grenzen kämpfen, und nahm dafür das Super-Soldaten-Serum.',
  'karli-morgenthau-masked': 'Die rote Maske mit dem schwarzen Kreis ist das Zeichen der Flag Smashers, die alle dieselbe tragen, damit keiner an der Spitze steht.',

  /* ---------- Rio Vidal ---------- */
  'rio-vidal': 'Rio Vidal ist der Tod selbst, der als Grüne Hexe in Agathas Zirkel geht und nur einsammelt, was ohnehin ihm gehört.',
  'rio-vidal-green-witch': 'Auf der Straße der Hexen tritt Vidal als Grüne Hexe an, deren Bereich das Wachsen und das Vergehen umfasst.',

  /* ---------- Bill Foster ---------- */
  'bill-foster-1': 'Bill Foster arbeitete in den Siebzigern mit Hank Pym an Goliath und lehrt später als Professor in Berkeley.',
  'bill-foster-2': 'Als Goliath wächst Foster auf mehrere Meter Höhe und stellt sich Ava Starr in den Weg, für die er wie ein Vater sorgt.',

  /* ---------- Cull Obsidian ---------- */
  'cull-obsidian': 'Cull Obsidian ist der stärkste Kämpfer der Black Order und wurde wie seine Geschwister von Thanos aufgezogen.',
  'cull-obsidian-hammer': 'Sein Kettenhammer wächst aus dem Armstumpf und ist die Waffe, mit der er in New York und Wakanda kämpft.',

  /* ---------- Kang ---------- */
  'kang-der-eroberer': 'Die Rüstung von Kang dem Eroberer nimmt die Energie ihrer Umgebung auf und lässt ihn durch Zeit und Raum treten.',
  'kang-der-eroberer-unmasked': 'Verbannt im Quantenreich sitzt Kang seit Jahren fest und braucht Scott Lang, um seinen Kern zu reparieren und wieder zu seiner Flotte zu kommen.',

  /* ---------- Defender Strange ---------- */
  'defender-strange': 'Der Defender Strange stammt aus einem anderen Universum und floh mit America Chavez durch den Raum zwischen den Welten.',
  'defender-strange-dead': 'Seine Leiche trieb im Fluss von Erde 616, wo Stephen Strange den eigenen toten Körper aus einer fremden Welt fand.',

  /* ---------- Layla El-Faouly ---------- */
  'layla-el-faouly': 'Der Anzug des Scarlet Scarab ist die Zeremonienrüstung, die Taweret Layla El-Faouly verlieh, als sie deren Avatar wurde.',
  'layla-el-faouly-combat': 'Vor dem Anzug arbeitete El-Faouly als Grabräuberin und Archäologin und war mit Marc Spector verheiratet.',

  /* ---------- Maya Lopez ---------- */
  'maya-lopez-echo': 'Maya Lopez ist gehörlos, trägt eine Beinprothese und kann jede Bewegung, die sie einmal gesehen hat, exakt wiederholen.',
  'maya-lopez-echo-leather': 'In New York führte Lopez für Wilson Fisk die Tracksuit-Bande und jagte den Mann, den sie für den Mörder ihres Vaters hielt.',
  'maya-lopez-echo-zivil': 'Zurück in Oklahoma tritt Lopez ihren Verwandten in Alltagskleidung gegenüber und muss sich vor der Familie erklären, die sie verlassen hatte.',
  'maya-lopez-echo-kriegsbemalung': 'Mit dem Handabdruck ihrer Vorfahren auf dem Gesicht nimmt Lopez die Kraft der Choctaw-Ahnen an und richtet sie gegen Fisk.',

  /* ---------- Ying Li ---------- */
  'ying-li': 'Ying Li stammt aus Ta Lo, verließ das verborgene Dorf für Xu Wenwu und ist die Mutter von Shang-Chi und Xialing.',
  'ying-li-ceremonial': 'Im Gewand von Ta Lo bewachte Li das Tor zum Reich der Dunkelheit, bevor sie ihren Posten für die Familie aufgab.',
  'ying-li-ruestung': 'Lis Kampfkunst kommt ohne Waffen aus und nutzt die Energie des Gegners, weshalb sie Wenwu mit seinen zehn Ringen bezwingen konnte.',

  /* ---------- Curt Connors ---------- */
  'curt-connors': 'Curt Connors war der einarmige Genetiker bei Oscorp, der an Eidechsen forschte, um menschliche Gliedmaßen nachwachsen zu lassen.',
  'curt-connors-lizard': 'Das Serum ließ den Arm nachwachsen und machte Connors zum Lizard, der ganz New York in Reptilien verwandeln wollte.',

  /* ---------- Heimdall ---------- */
  'heimdall': 'Heimdall bewacht den Bifröst, sieht und hört alles in den neun Reichen und öffnet die Brücke nur auf sein eigenes Urteil hin.',
  'heimdall-waechterruestung': 'In der goldenen Wachrüstung mit dem Hörnerhelm steht Heimdall am Ende des Bifröst und hält das Schwert Hofund, mit dem die Brücke geöffnet wird.',
  'heimdall-ragnarok': 'Nach Lokis Machtübernahme lebt Heimdall als Geächteter in den Bergen und versteckt dort die Bevölkerung Asgards vor Hela.',
  'miek': 'Auf Sakaar kämpft Miek in einem gepanzerten Gestell mit Klingen an beiden Armen und schließt sich Korgs Aufstand gegen den Großmeister an.',
  'miek-love-and-thunder': 'In Neu-Asgard trägt Miek Anzug und Kragen, denn dort steht er als Schauspieler im Theaterstück über Lokis Tod auf der Bühne.',

  /* ---------- Melina Vostokoff ---------- */
  'melina-vostokoff': 'Melina Vostokoff war die Widow, die in Ohio Natashas Mutter spielte, und entwickelte danach im Roten Raum die chemische Steuerung der Kämpferinnen.',
  'melina-vostokoff-widow': 'Im eigenen Widow-Anzug fliegt Vostokoff den Angriff auf den Roten Raum mit und tauscht ihre Rolle mit Natasha.',

  /* ---------- Obadiah Stane ---------- */
  'obadiah-stane': 'Obadiah Stane leitete Stark Industries nach dem Tod von Howard Stark und verkaufte Waffen an dieselben Zehn Ringe, die Tony entführten.',
  'obadiah-stane-iron-monger': 'Die Iron-Monger-Rüstung aus Omnium-Stahl baute Stane aus den zurückgelassenen Plänen der Mark I als schwer bewaffnete Gegenfassung.',

  /* ---------- Pepper Potts ---------- */
  'pepper-potts-civil': 'Pepper Potts war Starks Assistentin, bevor sie Stark Industries übernahm, und hielt die Firma zusammen, wenn er in der Rüstung steckte.',
  'pepper-potts-mark-49-rescue': 'Die Rescue-Rüstung mit der Nummer 49 baute Stark für seine Frau, die damit in der Schlacht um die Erde an seiner Seite flog.',

  /* ---------- Peter Quill ---------- */
  'peter-quill': 'Peter Quill wurde als Kind von Ravagers von der Erde geholt und wuchs unter Yondus Bande zum Dieb heran.',
  'peter-quill-masked': 'Die Maske erzeugt einen Helm, der Quill im Vakuum am Leben hält und ihm die Anzeigen seiner Ausrüstung einblendet.',
  'peter-quill-star-lord': 'Star-Lord ist der Name, den seine Mutter für ihn hatte und den Quill sich selbst gibt, obwohl ihn kaum jemand kennt.',
  'peter-quill-guardians-of-the-galaxy': 'Der rote Ledermantel gehört zum Aufzug, den Quill von seiner Zeit bei den Ravagers behalten hat.',

  /* ---------- T’Chaka ---------- */
  't-chaka': 'T’Chaka führte Wakanda in der Abschottung und tötete in Oakland seinen eigenen Bruder, um das Geheimnis des Vibraniums zu bewahren.',
  't-chaka-unmasked': 'Als Black Panther der vorigen Generation trug T’Chaka den Habit in schlichtem Schwarz ohne die Silberfäden seines Sohnes.',
  't-chaka-civil': 'Bei der Unterzeichnung des Sokovia-Abkommens in Wien starb T’Chaka bei dem Anschlag, den Helmut Zemo Bucky Barnes anhängte.',

  /* ---------- Wade Wilson ---------- */
  'wade-wilson-deadpool': 'Der rot-schwarze Anzug verbirgt die vom Heilfaktor entstellte Haut und macht Wilson zu dem Söldner, der beim Töten mit dem Publikum spricht.',
  'wade-wilson-deadpool-unmaskiert': 'Ohne Maske zeigt der Anzug das vom Heilfaktor entstellte Gesicht, das Wilson sonst vor allen außer seinen Freunden verbirgt.',
  'wade-wilson-deadpool-civil': 'Ohne Maske arbeitet Wilson als Gebrauchtwagenverkäufer und hat seine Zeit als Deadpool nach der Trennung von Vanessa an den Nagel gehängt.',
  'peter-wisdom': 'Als Peterpool steigt Wisdom in Wilsons alten Anzug aus dem Spind von Drive Max und lenkt damit das ganze Deadpool Corps auf sich.',
  'peter-wisdom-zivil': 'Im gestreiften Poloshirt verkauft Wisdom bei Drive Max Gebrauchtwagen und hebt den alten Anzug seines Freundes für den Fall der Fälle auf.',

  /* ---------- Cassie Lang ---------- */
  'cassie-lang-1': 'Als Jugendliche baut Cassie Lang heimlich ein eigenes Gerät, das Signale in das Quantenreich schickt, und zieht damit die ganze Familie hinein.',
  'cassie-lang-2': 'Ihr Anzug entstand aus Hank Pyms Werkstatt und lässt Lang unter dem Namen Stature wachsen und schrumpfen wie ihr Vater.',
  'cassie-lang-ant-man': 'In der Zukunft, die Darren Cross zeigt, trägt Cassie den Anzug ihres Vaters weiter.',
  'cassie-lang-zivil': 'Nach dem Blip ist Cassie fünf Jahre älter als bei ihrem letzten Wiedersehen mit dem Vater, der die Zeit im Quantenreich verbracht hat.',

  /* ---------- Agatha Harkness ---------- */
  'agatha-harkness': 'In Westview gab Agatha Harkness sich als Nachbarin Agnes aus, um herauszufinden, welche Macht den Ort unter der Kuppel hält.',
  'agatha-harkness-coven': 'Ihres eigenen Zaubers beraubt stellt Harkness einen neuen Zirkel zusammen und geht die Straße der Hexen entlang, um ihre Kraft zurückzuholen.',

  /* ---------- America Chavez ---------- */
  'america-chavez-civil': 'America Chavez kann Löcher in den Raum zwischen den Universen stoßen, konnte die Kraft aber lange nicht steuern und verlor so ihre Mütter.',
  'america-chavez': 'In Kamar-Taj bleibt Chavez am Ende zur Ausbildung und lernt dort, ihre Sprünge bewusst zu setzen.',

  /* ---------- Bullseye ---------- */
  'bullseye-1': 'Benjamin Poindexter trifft mit jedem Gegenstand jedes Ziel und wurde von Wilson Fisk als falscher Daredevil in die Stadt geschickt.',
  'bullseye-2': 'Nach dem Sturz von einem Dach und einer Wirbelsäulenoperation kehrt Poindexter in Born Again als Bullseye zurück.',

  /* ---------- G’iah ---------- */
  'g-iah-kind': 'Als Kind lebte G\'iah versteckt unter den Skrull-Flüchtlingen und sah 1995 auf Mar-Vells Labor ihren Vater nach sechs Jahren wieder.',
  'g-iah': 'In Menschengestalt arbeitet G’iah in Graviks Lager und gibt Nick Fury Nachrichten weiter, weil sie den Krieg gegen die Erde ablehnt.',
  'g-iah-skrull': 'Als Tochter von Talos nahm G’iah die Kräfte der Harvester in sich auf und wurde damit zum stärksten Wesen ihres Volkes.',

  /* ---------- Kurse ---------- */
  'kurse': 'Algrim ließ sich für Malekith in einen Kursed verwandeln, ein Wesen von zerstörerischer Kraft, das dabei jede eigene Zukunft aufgibt.',
  'kurse-dark-elf': 'Vor der Verwandlung war Algrim ein Dunkelelf und Malekiths treuester Gefolgsmann aus der Zeit vor der letzten Konvergenz.',

  /* ---------- Mantis ---------- */
  'mantis': 'Mantis wuchs allein bei Ego auf und musste ihn mit ihrer Berührung in den Schlaf legen, weil er sonst nicht zur Ruhe kam.',
  'mantis-vol-3': 'In Vol. 3 stellt sich heraus, dass Mantis Egos Tochter und damit Peter Quills Halbschwester ist, worauf sie eigene Wege geht.',

  /* ---------- Valkyrie ---------- */
  'valkyrie': 'Für den Zug gegen Hela legt sie die alte Rüstung wieder an und stellt sich der Frau, die ihre Schwestern getötet hat.',
  'valkyrie-armor': 'Die weiße Rüstung der Walküren stammt aus Asgards alter Elitetruppe, die Odin gegen Hela in den Kampf schickte.',
  'valkyrie-walkuere': 'Die Walküren waren berittene Kriegerinnen Asgards, von denen nach dem Kampf um Hela nur eine einzige überlebte.',
  'valkyrie-koenig-von-neu-asgard': 'In Neu-Asgard führt sie als König die Geschäfte der Siedlung und kümmert sich um Verträge, Touristen und Anträge.',

  /* ---------- Joaquin Torres ---------- */
  'joaquin-torres-falcon': 'Joaquin Torres übernahm nach Sam Wilson die Flügel und wurde damit zum neuen Falcon an der Seite von Captain America.',
  'joaquin-torres-falcon-flight': 'Sein Flügelanzug stammt aus der Werkstatt von Wakanda und wird nach dem Absturz in Brave New World neu aufgebaut.',
  'joaquin-torres-falcon-zivil': 'Als Leutnant der Air Force beobachtete Torres in Tunis die Flag Smashers, bevor er in den Dienst der Avengers wechselte.',

  /* ---------- Stakar Ogord ---------- */
  'stakar-ogord': 'Stakar Ogord führt die Ravagers und schloss Yondu aus der Gemeinschaft aus, weil dieser Kinder für Ego geschmuggelt hatte.',
  'stakar-ogord-starhawk': 'Unter dem Namen Starhawk gehörte Ogord der ersten Mannschaft an, die sich vor Jahrzehnten Guardians of the Galaxy nannte.',

  /* ---------- Ulysses Klaue ---------- */
  'ulysses-klaue': 'Ulysses Klaue stahl in den Achtzigern Vibranium aus Wakanda und verkauft es seither auf dem Schwarzmarkt.',
  'ulysses-klaue-black-panther': 'Nachdem Ultron ihm den Arm abgetrennt hatte, ersetzte Klaue ihn durch eine Prothese, die Schallwellen als Waffe abfeuert.',

  /* ---------- Arnim Zola ---------- */
  'arnim-zola-zivil': 'Arnim Zola war Hydras Chefwissenschaftler unter Johann Schmidt und wurde nach dem Krieg über Operation Paperclip von S.H.I.E.L.D. übernommen.',
  'arnim-zola-kuenstliche-intelligenz': 'Vor seinem Tod 1972 überspielte Zola sein Bewusstsein auf Datenbänder in einem Bunker in New Jersey, wo er den Algorithmus für Project Insight schrieb.',

  /* ---------- Flint Marko ---------- */
  'sandman': 'Flint Marko geriet in ein Teilchenfeld und besteht seither aus Sand, den er zu jeder Form und Größe zusammenziehen kann.',
  'sandman-zivil': 'Im Multiversum kehrt Marko kurz in seine menschliche Gestalt zurück und will vor allem eines, nämlich nach Hause zu seiner Tochter.',

  /* ---------- Hank Pym ---------- */
  'hank-pym': 'Hank Pym entdeckte die nach ihm benannten Partikel, arbeitete als erster Ant-Man für S.H.I.E.L.D. und hielt seine Forschung danach unter Verschluss.',
  'hank-pym-quantum-suit': 'Für den Zeitraub trugen alle Beteiligten denselben weißen Quantenanzug, der auf Pyms Technik beruht.',
  'hank-pym-quantumania': 'In Quantumania folgt Pym seiner Frau in das Quantenreich und findet dort seine Ameisen wieder, die sich in dreißig Jahren zu einer eigenen Zivilisation entwickelt haben.',
  'hank-pym-ant-man': 'In den Achtzigern trug Pym den Anzug selbst und führte für S.H.I.E.L.D. Einsätze hinter dem Eisernen Vorhang.',

  /* ---------- Okoye ---------- */
  'okoye': 'Okoye führt die Dora Milaje, die Leibgarde des Throns, und dient dem Amt selbst und nicht der Person, die es gerade innehat.',
  'okoye-midnight-angel': 'Die Midnight-Angel-Rüstung baute Shuri mit der Wakandan Design Group, damit Okoye auch ohne die Speere der Garde bestehen kann.',

  /* ---------- Skurge ---------- */
  'skurge': 'Skurge übernahm nach Heimdall die Wacht am Bifröst und ließ sich von Hela zum Vollstrecker machen, um endlich gesehen zu werden.',
  'skurge-mit-zer-und-stoer': 'Zer und Stör sind zwei Sturmgewehre, die Skurge von der Erde mitbrachte und mit denen er sich am Ende gegen Hela stellt.',

  /* ---------- Remy LeBeau ---------- */
  'remy-lebeau-gambit-pose-1': 'Gambit lädt Gegenstände mit kinetischer Energie auf und wirft vor allem Spielkarten, die beim Aufschlag explodieren.',
  'remy-lebeau-gambit-pose-2': 'In der Leere lebt Gambit mit anderen Vergessenen und behauptet, seine Welt habe nie einen Beschützer gehabt.',

  /* ---------- Mac Gargan ---------- */
  'scorpion-pose-1': 'Mac Gargan gehörte zu Adrian Toomes Kundschaft und wurde bei der Fährenaktion von Spider-Man festgenommen.',
  'scorpion-pose-2': 'Im Gefängnis fragt Gargan bei Toomes nach dem wahren Namen von Spider-Man, weil draußen Leute darauf warten.',
  'scorpion-zivil': 'Die Tätowierung eines Skorpions im Nacken ist das Zeichen, unter dem Gargan in den Comics zum gleichnamigen Gegner wird.',
  'scorpion-lederjacke': 'In Lederjacke und Kapuzenpulli tritt Gargan als Käufer auf, der bei Adrian Toomes Waffen aus fremder Technik bestellt.',

  /* ---------- Ned Leeds ---------- */
  'ned-leeds': 'Ned Leeds ist Parkers bester Freund und der erste, der von der Maske erfährt, worauf er sich selbst zum Stuhlmann erklärt.',
  'ned-leeds-brand-new-day': 'Nach dem Zauber hat Leeds jede Erinnerung an Peter Parker verloren und beginnt sein Studium mit MJ ohne ihn.',

  /* ---------- Billy Maximoff ---------- */
  'billy-maximoff-wiccan': 'Billy Maximoff entstand in Westview aus Wandas Zauber und fand seine Seele nach dem Ende der Kuppel in einem Jungen namens William Kaplan.',
  'billy-maximoff-wiccan-wandavision': 'In der Kuppel wuchs Billy binnen Tagen vom Säugling zum Zehnjährigen und hörte als erster die Gedanken der eingesperrten Nachbarn.',
  'billy-maximoff-wiccan-magie': 'Als Wiccan wirkt Maximoff mit gesprochener Formel und blauem Licht und sucht auf der Straße der Hexen nach seinem Bruder Tommy.',

  /* ---------- Blade ---------- */
  'blade': 'Eric Brooks kam als Halbvampir zur Welt, trägt die Stärken seiner Art ohne ihre Schwächen und jagt seitdem seinesgleichen.',
  'blade-knight': 'In der Leere schlug Blade sich jahrelang allein durch und wartete auf eine Gelegenheit, nach Hause zu kommen.',
  'blade-kampfanzug': 'Zu seiner Ausrüstung gehören das Schwert aus Silber und der lange Mantel, der die Waffen für die Nachtjagd verbirgt.',

  /* ---------- Erik Lehnsherr ---------- */
  'erik-lehnsherr-magneto': 'Erik Lehnsherr beherrscht die Magnetfelder und formt daraus alles, was aus Metall besteht, vom Splitter bis zur Brücke.',
  'erik-lehnsherr-magneto-jung': 'Seine Kraft brach zum ersten Mal als Kind im Lager durch, als er von seinen Eltern getrennt am Tor stand.',

  /* ---------- Everett Ross ---------- */
  'everett-ross': 'Everett Ross ist Verbindungsmann der CIA, der als einer der wenigen Außenstehenden weiß, was Wakanda wirklich besitzt.',
  'everett-ross-anzug': 'In Berlin führte Ross die Vernehmung von Bucky Barnes und ließ die unterzeichnenden Parteien nach dem Anschlag in Wien zusammenkommen.',

  /* ---------- Frank Castle ---------- */
  'frank-castle-punisher': 'Nach dem Mord an seiner Familie führt Frank Castle einen eigenen Krieg gegen das organisierte Verbrechen, ohne Gefangene zu machen.',
  'frank-castle-punisher-kampfanzug': 'Die kugelsichere Weste mit dem aufgemalten Totenschädel ist das Zeichen, unter dem der Punisher auftritt.',

  /* ---------- Jennifer Walters ---------- */
  'jennifer-walters-she-hulk': 'Durch Bruce Banners Blut wurde Jennifer Walters zur She-Hulk und behält im grünen Körper Verstand, Sprache und ihre Anwaltszulassung.',
  'jennifer-walters-she-hulk-menschenform': 'Als Anwältin leitet Walters die Abteilung für Superhelden-Recht der Kanzlei GLK und H und vertritt dort ihre eigenen Bekannten.',

  /* ---------- Jessica Jones ---------- */
  'jessica-jones-1': 'Jessica Jones überlebte als einzige einen Autounfall, kam mit übermenschlicher Kraft daraus hervor und arbeitet heute als Privatdetektivin.',
  'jessica-jones-2': 'In Born Again kehrt Jones nach New York zurück und arbeitet dort wieder mit Matt Murdock zusammen.',

  /* ---------- Johnny Storm ---------- */
  'johnny-storm-human-torch': 'Nach dem Flug durch die kosmische Strahlung kann Johnny Storm seinen Körper entzünden, fliegen und die Flamme steuern.',
  'johnny-storm-human-torch-halb-entzuendet': 'Der Anzug der Fantastic Four besteht aus unstillbarem Gewebe, das Storms Flammen ohne Schaden übersteht.',
  'johnny-storm-human-torch-flame-on': 'Bei voller Leistung erreicht Storm die Nova-Flamme, die er nur kurz halten kann und die ihn danach völlig auszehrt.',

  /* ---------- Kamala Khan ---------- */
  'kamala-khan-ms-marvel': 'Kamala Khan zieht ihre Kraft aus dem Armband ihrer Urgroßmutter, das die Verbindung zur Noor-Dimension herstellt.',
  'kamala-khan-ms-marvel-neues-kostuem': 'Das Kostüm mit dem Blitz nähte ihre Mutter Muneeba, damit ihre Tochter in Jersey City nicht als sie selbst erkannt wird.',

  /* ---------- Kate Bishop ---------- */
  'kate-bishop': 'Kate Bishop wurde nach der Schlacht von New York zur besten Bogenschützin ihres Jahrgangs, weil sie Clint Barton auf dem Dach gesehen hatte.',
  'kate-bishop-mantel': 'Ihre erste Ausrüstung stammt aus dem eigenen Kleiderschrank und aus dem, was sie bei der Auktion mitnimmt.',

  /* ---------- Ramonda ---------- */
  'koenigin-ramonda': 'Königin Ramonda hält Wakanda nach dem Tod ihres Mannes und ihres Sohnes zusammen und weist die Forderungen der Weltmächte im Sitzungssaal zurück.',
  'koenigin-ramonda-weisses-kleid': 'Zur Trauerzeremonie für T’Challa trägt ganz Wakanda Weiß, weil dort der Tod nicht als Ende gilt.',

  /* ---------- Kraglin ---------- */
  'kraglin': 'Kraglin diente Yondu als erster Offizier und übernahm nach dessen Tod den Yaka-Pfeil, den er lange nicht steuern konnte.',
  'kraglin-vol-2': 'Unter den Ravagers war Kraglin derjenige, der die Meuterei gegen Yondu mit auslöste und sie danach am meisten bereute.',

  /* ---------- Maria Hill ---------- */
  'maria-hill': 'Maria Hill war Nick Furys Stellvertreterin bei S.H.I.E.L.D. und arbeitete nach dessen Fall für Stark Industries.',
  'maria-hill-im-einsatz': 'Auf dem Helicarrier führte Hill die Mannschaft, während Loki den Tesserakt und Bartons Verstand in seiner Gewalt hatte.',
  'maria-hill-s-h-i-e-l-d': 'In der blauen Einsatzuniform half Hill Rogers und Romanoff, Project Insight von innen zu stoppen.',

  /* ---------- Michelle Jones-Watson ---------- */
  'michelle-jones-watson': 'MJ beobachtet ihre Mitschüler genauer als alle anderen und weiß lange vor allen anderen, wer unter der Spinnenmaske steckt.',
  'michelle-jones-watson-far-from-home': 'Auf der Klassenfahrt durch Europa spricht MJ Parker offen darauf an und wird die erste, mit der er die Maske teilt.',
  'michelle-jones-watson-no-way-home': 'Nach dem Zauber weiß auch MJ nicht mehr, wer Peter Parker ist, und beginnt ihr Studium in Boston ohne ihn.',

  /* ---------- Nebula ---------- */
  'nebula': 'Nebula wurde von Thanos nach jedem verlorenen Zweikampf gegen Gamora durch Maschinenteile ersetzt, bis kaum noch Fleisch übrig war.',
  'nebula-violetter-anzug': 'Nach der Trennung von Thanos schließt Nebula sich den Guardians an und sucht die Nähe der Schwester, die sie eigentlich töten wollte.',
  'nebula-vol-3': 'In Vol. 3 hält Nebula die Mannschaft zusammen und baut auf Knowhere die Gemeinschaft auf, in der die Geretteten leben.',
  'nebula-quantum-suit': 'Im weißen Quantenanzug geht Nebula zurück ins Jahr 2014, wo ihr jüngeres Ich sie ausliest und Thanos die ganze Zukunft verrät.',

  /* ---------- Ravonna Renslayer ---------- */
  'ravonna-renslayer': 'Als Richterin der Zeitvarianzbehörde sprach Renslayer Urteile über Varianten, ohne zu wissen, dass sie selbst eine ist.',
  'ravonna-renslayer-zeitwende': 'Nach dem Bruch der Behörde sucht Renslayer die Wahrheit hinter dem Bleibenden und landet in der Leere am Ende der Zeit.',

  /* ---------- Reed Richards ---------- */
  'reed-richards-mister-fantastic': 'Die kosmische Strahlung machte Reed Richards Körper dehnbar, sodass er sich in jede Form und über weite Strecken strecken kann.',
  'reed-richards-mister-fantastic-mit-jacke': 'Als Kopf der Fantastic Four führt Richards die Forschung des Baxter Building und rechnet die Bahnen aus, denen die Mannschaft folgt.',

  /* ---------- Sif ---------- */
  'sif': 'Lady Sif gehört zu Asgards besten Kriegerinnen und kämpft an der Seite der Drei Krieger für Thor gegen Loki und Malekith.',
  'sif-thor': 'In ihrem ersten Auftritt bricht Sif mit Thor nach Jotunheim auf und stellt sich danach gegen Lokis Anspruch auf den Thron.',
  'sif-love-and-thunder': 'In Love and Thunder verliert Sif im Kampf gegen Gorr einen Arm und will auf dem Schlachtfeld nach Walhall gehen.',

  /* ---------- Stephen Strange ---------- */
  'stephen-strange': 'Nach dem Autounfall, der seine Hände zerstörte, fand der Neurochirurg Stephen Strange in Kamar-Taj die Kunst der Mystik.',
  'stephen-strange-supreme-strange': 'Als Sorcerer Supreme trägt Strange das Auge von Agamotto und den Umhang der Levitation, der sich selbst entscheidet, wem er folgt.',

  /* ---------- Vanessa Fisk ---------- */
  'vanessa-fisk': 'Vanessa Fisk führte das Geschäft ihres Mannes weiter, während er im Gefängnis saß, und trat dabei härter auf als er.',
  'vanessa-fisk-rotes-kleid': 'An der Seite des Bürgermeisters ist Vanessa die Frau, die Wilson Fisk vor der Stadt menschlich wirken lässt.',

  /* ---------- Wong ---------- */
  'wong-shehulk': 'In She-Hulk tritt Wong als Sorcerer Supreme auf, holt Emil Blonsky aus dem Gefängnis und wird prompt als Zeuge geladen.',
  'wong-multiverse-of-madness': 'Nach dem Blip übernahm Wong das Amt des Sorcerer Supreme und verteidigt Kamar-Taj gegen Wanda Maximoff.',
  'wong-shang-chi': 'Im Untergrundkampf von Macau tritt Wong gegen Abomination an und nimmt ihn danach mit nach Kamar-Taj.',
  'wong-doctor-strange': 'Als Hüter der Bibliothek von Kamar-Taj bewacht Wong die verbotenen Bücher und war es, der Strange die erste Formel verweigerte.',

  /* ---------- Agent Cleary ---------- */
  'agent-cleary': 'Agent Cleary leitet die Behörde Damage Control, die Peter Parker nach Mysterios Video als Mordverdächtigen vernimmt.',
  'agent-cleary-anzug': 'Damage Control räumt seit der Schlacht von New York die Trümmer weg und ermittelt in allem, was mit Übermenschen zu tun hat.',

  /* ---------- Alejandro Montoya ---------- */
  'alejandro-montoya-el-aguila': 'El Águila ist ein Fechter mit elektrischen Kräften, der bei She-Hulk als Mandant in der Kanzlei sitzt.',
  'alejandro-montoya-el-aguila-blitze': 'Seine Kraft lädt die Klinge auf, weshalb er im Ring als Kämpfer mit Blitzen auftritt.',

  /* ---------- Aneka ---------- */
  'aneka': 'Aneka bildet die Dora Milaje aus und wurde wegen Ungehorsams vor Gericht gestellt, nachdem sie Anzüge ohne Erlaubnis benutzt hatte.',
  'aneka-midnight-angel': 'Die Midnight-Angel-Rüstung gab Shuri an Aneka und Okoye aus, die damit außerhalb des Rangs der Dora Milaje kämpfen.',

  /* ---------- Elder Beast ---------- */
  'elder-beast': 'Die Elder Beasts sind die Wächter der Darkhold-Burg auf dem Berg Wundagore und gehorchen dem dunklen Wesen Chthon.',
  'elder-beast-magiewirkend': 'Ihre Kraft stammt aus derselben Chaosmagie, die im Darkhold aufgeschrieben ist, und sie richten sie gegen jeden, der sich der Burg nähert.',

  /* ---------- Johnny Storm aus 121698 ---------- */
  'johnny-storm-121698': 'Dieser Johnny Storm stammt aus Universum 121698 und landete in der Leere, wo Cassandra Nova ihn zur Strafe für sein Mundwerk häutete.',
  'johnny-storm-121698-flame-on': 'Vollständig entzündet brennt Storm von Kopf bis Fuß und fliegt in dieser Gestalt, solange sein Körper die Hitze trägt.',
  'johnny-storm-121698-zivil': 'Vor der Leere war Storm der jüngste der Fantastic Four seines Universums und für den Auftritt vor den Kameras zuständig.',

  /* ---------- Pagon ---------- */
  'pagon': 'Pagon war Graviks engster Gefolgsmann und einer der ersten Skrulls, die sich in Neu-Skrullos ansiedelten.',
  'pagon-menschenform': 'In Menschengestalt bewegte Pagon sich unerkannt durch London und führte dort die Anschläge der Rebellion aus.',

  /* ---------- Todd Phelps ---------- */
  'todd-phelps': 'Todd Phelps ist ein Unternehmer aus dem Silicon Valley, der als Mandant in die Kanzlei kommt und Jennifer Walters nachstellt.',
  'todd-phelps-hulkking': 'Mit gestohlenem Blut von She-Hulk verwandelte Phelps sich selbst in einen Hulk und trat als Anführer der Intelligencia auf.',

  /* ---------- Varra ---------- */
  'varra-priscilla-davis': 'Varra ist eine Skrull, die mit den ersten Geflohenen zur Erde kam und von Talos an Nick Furys Seite gestellt wurde.',
  'varra-priscilla-davis-menschenform': 'Als Priscilla Davis lebt sie seit Jahrzehnten in menschlicher Gestalt und ist mit Nick Fury verheiratet.',

  /* ---------- Yusuf Khan ---------- */
  'yusuf-khan': 'Yusuf Khan ist Kamalas Vater, der von Pakistan nach Jersey City auswanderte und seine Tochter am Ende in ihrer Maske unterstützt.',
  'yusuf-khan-ohne-muetze': 'Es war Yusuf, der beim Kostümwettbewerb den Rollstuhl mit dem Hulk-Handschuh baute und den Namen Ms. Marvel vorschlug.',

  /* ---------- Rocket ---------- */
  'rocket-guradians-of-the-galaxy-vol-3': 'In Vol. 3 kommt heraus, dass Rocket als Versuchstier 89P13 des Hohen Evolutionärs entstand, der ihn für sein Denken hasste.',
  'rocket-quantum-suit': 'Für den Zeitraub bekommt auch Rocket den weißen Quantenanzug, in dem er mit Thor nach Asgard zurückgeht.',
  'rocket-endgame': 'Fünf Jahre nach dem Fingerschnippen ist Rocket der letzte Guardian im Avengers-Hauptquartier und holt beim Zeitraub mit Thor den Äther aus Asgard.',
  'rocket-guradians-of-the-galaxy-vol-2': 'In Vol. 2 stiehlt Rocket den Sovereign die Batterien und zieht damit die halbe Galaxis hinter die Mannschaft her.',
  'rocket-guradians-of-the-galaxy': 'Rocket ist ein zusammengeflickter Waschbär mit einem Talent für Waffenbau, der sich mit dem Kopfgeld auf Peter Quill zur Ruhe setzen wollte.',

  /* ---------- Peggy Carter ---------- */
  'peggy-carter': 'Peggy Carter ist Offizierin der Strategic Scientific Reserve, die einzige Frau im Raum bei Projekt Rebirth und die Erste, die in Steve Rogers mehr sieht als seinen schmächtigen Körper.',

  /* ---------- Abraham Erskine ---------- */
  'abraham-erskine': 'Abraham Erskine trägt die Formel des Serums nur im Kopf und wählt für sie den Mann aus, der die eigene Schwäche nie vergessen wird.',

  /* ---------- Chester Phillips ---------- */
  'chester-phillips': 'Colonel Chester Phillips führt die Strategic Scientific Reserve, misstraut allem Wissenschaftlichen und ändert seine Meinung über Steve Rogers erst, als der ohne Befehl vierhundert Gefangene zurückbringt.',

  /* ---------- Yon-Rogg ---------- */
  'yon-rogg': 'In der Rüstung der Starforce befehligt Yon-Rogg die Eliteeinheit der Kree und hält seine beste Kämpferin jahrelang in dem Glauben, ihre Kraft sei nur geliehen.',

  /* ---------- Maria Rambeau ---------- */
  'maria-rambeau': 'Maria Rambeau fliegt für die Air Force unter dem Rufzeichen Photon und erkennt Carol Danvers nach sechs Jahren als Erste wieder.',

  /* ---------- Goose ---------- */
  'goose': 'Goose ist die Katze aus Wendy Lawsons Labor, in Wahrheit ein Flerken, dessen Tentakel alles verschlucken, was ihm in die Quere kommt.',

  /* ---------- Supreme Intelligence ---------- */
  'supreme-intelligence': 'Die Supreme Intelligence tritt jedem Kree in der Gestalt entgegen, die er am meisten bewundert, und trägt vor Carol Danvers deshalb das Gesicht von Wendy Lawson.',

  /* ---------- Phil Coulson ---------- */
  'phil-coulson': 'Phil Coulson ist das höfliche Gesicht, mit dem S.H.I.E.L.D. den Helden zum ersten Mal gegenübertritt, und er spricht den Namen der Behörde bei jeder Gelegenheit vollständig aus.',

  /* ---------- Ronan der Ankläger ---------- */
  'ronan': 'Ronan der Ankläger tritt in schwarzem Ornat und mit dem Kriegshammer an, in dessen Kopf er den Machtstein setzt, um Xandar auszulöschen.',

  /* ---------- Att-Lass ---------- */
  'att-lass': 'Att-Lass ist der Mann der Starforce für Tarnung und Zugriff und der Einzige, der darauf achtet, wie in der Einheit miteinander geredet wird.',

  /* ---------- Bron-Char ---------- */
  'bron-char': 'Bron-Char ist der Schwergewichtskämpfer der Starforce, den man vorschickt, wenn es eng wird, und der dafür mehr Spott als Dank erntet.',

  /* ---------- Korath der Verfolger ---------- */
  'korath-der-verfolger': 'Korath führt den Titel des Verfolgers als Berufsbezeichnung und findet mit seinem kybernetisch verstärkten Körper alles, was verschwunden ist.',

  /* ---------- Raza Hamidmi Al-Wazar ---------- */
  'raza': 'Raza Hamidmi Al-Wazar führt die Zelle der Zehn Ringe, die Tony Stark verschleppt, und sieht in der eigenen Höhle die erste Iron-Man-Rüstung entstehen.',

  /* ---------- Justin Hammer ---------- */
  'justin-hammer': 'Justin Hammer tritt im maßgeschneiderten Anzug als Waffenhersteller auf und will mit Ivan Vankos Drohnen beweisen, dass er Stark ablösen kann.',

  /* ---------- Betty Ross ---------- */
  'betty-ross': 'Betty Ross ist Zellbiologin an der Culver University und versteckt Bruce Banner nach seiner Rückkehr, obwohl ihr eigener Vater die Jagd auf ihn führt.',

  /* ---------- Odin ---------- */
  'odin': 'Odin herrscht als Allvater über die Neun Reiche, die er einst mit Feuer und Schwert erobert hat, und verschweigt seinen Kindern beides.',

  /* ---------- Fandral ---------- */
  'fandral': 'Fandral ficht mit dem Degen, legt auf sein Auftreten mehr Wert als auf alles andere und erzählt unter den Drei Kriegern die Geschichten.',

  /* ---------- Hogun ---------- */
  'hogun': 'Hogun stammt als Einziger der Drei Krieger nicht aus Asgard, kämpft mit dem Streitkolben und spricht so wenig wie möglich.',

  /* ---------- Volstagg ---------- */
  'volstagg': 'Volstagg ist der Lauteste und Größte der Drei Krieger, trägt Axt und Schild und redet am liebsten über gutes Essen.',

  /* ---------- Laufey ---------- */
  'laufey': 'Laufey herrscht über die Frostriesen von Jotunheim und erfährt erst kurz vor seinem Tod, dass der Sohn, den er einst aussetzte, vor ihm steht.',

  /* ---------- Destroyer ---------- */
  'destroyer': 'Der Destroyer ist eine Rüstung ohne Insassen, die vom Thron Asgards gelenkt wird und die Waffenkammer bewacht, bis Loki sie nach Puente Antiguo schickt.',

  /* ---------- Darcy Lewis ---------- */
  'darcy-lewis': 'Darcy Lewis fängt bei Jane Foster als Praktikantin an, weil sie sechs Studienpunkte braucht, und streckt Thor beim ersten Treffen mit dem Elektroschocker nieder.',

  /* ---------- Frigga ---------- */
  'frigga': 'Frigga wurde von Hexen aufgezogen, brachte Loki die Magie bei und behandelt ihn auch dann noch als ihren Sohn, als alle anderen ihn aufgegeben haben.',

  /* ---------- Der Andere ---------- */
  'der-andere': 'Der Andere spricht in Kapuze und Rüstung für Thanos, solange der selbst im Verborgenen bleibt, und drillt Loki für den Angriff auf die Erde.',

  /* ---------- Malekith ---------- */
  'malekith': 'Malekith führt die Dunkelelfen von Svartalfheim und will mit dem Äther die Neun Reiche in die Finsternis zurückstoßen, aus der sein Volk stammt.',

  /* ---------- Taneleer Tivan ---------- */
  'the-collector': 'Taneleer Tivan gehört zu den Elders des Universums und trägt in seinem Museum auf Knowhere zusammen, was es nur ein einziges Mal gibt.',

  /* ---------- Aldrich Killian ---------- */
  'aldrich-killian': 'Aldrich Killian hat mit Extremis seinen eigenen Körper neu gebaut und stellt einen Schauspieler als Mandarin vor die Kameras, damit niemand nach ihm selbst sucht.',

  /* ---------- Alexander Pierce ---------- */
  'alexander-pierce': 'Alexander Pierce sitzt im Weltsicherheitsrat, gilt als Held der Diplomatie und treibt für Hydra zugleich das Programm voran, das Millionen im Voraus töten soll.',

  /* ---------- Pietro Maximoff ---------- */
  'pietro-maximoff': 'Pietro Maximoff verdankt seine Geschwindigkeit den Versuchen mit Lokis Zepter und stirbt in Sokovia, als er Clint Barton und ein Kind vor dem Kugelhagel deckt.',

  /* ---------- Sharon Carter ---------- */
  'sharon-carter': 'Sharon Carter wohnt als vermeintliche Krankenschwester in der Nachbarwohnung von Steve Rogers und bewacht ihn dort im Auftrag von Nick Fury.',

  /* ---------- Georges Batroc ---------- */
  'georges-batroc': 'Georges Batroc kommt von der Fremdenlegion, kämpft in der Savate und arbeitet für jeden, der genug zahlt.',

  /* ---------- Drax ---------- */
  'drax': 'Drax stammt von einem Volk, das keine Bildersprache kennt, und nimmt deshalb jedes Wort wörtlich, das ihm gesagt wird.',

  /* ---------- Yondu ---------- */
  'yondu': 'Yondu Udonta lenkt seinen Yaka-Pfeil mit einem Pfiff und behielt den kleinen Peter Quill bei sich, statt ihn wie vereinbart abzuliefern.',

  /* ---------- Howard the Duck ---------- */
  'howard-the-duck': 'Howard the Duck sitzt als Ausstellungsstück in einer Vitrine des Collectors und bleibt nach der Explosion von Knowhere seelenruhig am Tresen sitzen.',

  /* ---------- Eson der Sucher ---------- */
  'eson': 'Eson der Sucher ist ein Celestial von mehreren Kilometern Höhe, den der Collector auf einer Aufnahme zeigt, wie er mit dem Machtstein eine ganze Welt auslöscht.',

  /* ---------- Cosmo ---------- */
  'cosmo': 'Cosmo wurde von der Sowjetunion ins All geschossen, entwickelte dort Telepathie und Telekinese und wünscht sich nichts mehr, als ein braves Mädchen genannt zu werden.',

  /* ---------- Ego ---------- */
  'ego': 'Ego ist ein Celestial, der sich über Millionen Jahre einen Planeten um sich herum gebaut und für die Suche nach Erben eine menschliche Gestalt geformt hat.',

  /* ---------- Taserface ---------- */
  'taserface': 'Taserface bringt es im Ravager-Clan bis zum Leutnant, stiftet die Meuterei gegen Yondu und versteht bis zuletzt nicht, warum alle über seinen Namen lachen.',

  /* ---------- Krugarr ---------- */
  'krugarr': 'Krugarr bewegt sich auf einem langen Schlangenleib fort und öffnet als einziger Ravager-Hauptmann seine Portale mit den Ringen der mystischen Künste.',

  /* ---------- Ayesha ---------- */
  'ayesha': 'Ayesha ist die goldene Hohepriesterin der Sovereign, die keine Kränkung erträgt und aus Zorn über die Guardians Adam Warlock züchten lässt.',

  /* ---------- Martinex ---------- */
  'martinex': 'Martinex T\'Naga besteht aus kristallinem Silizium, führt einen eigenen Ravager-Clan und steht Stakar Ogord auch nach dem Zerwürfnis mit Yondu am nächsten.',

  /* ---------- Ultron ---------- */
  'ultron': 'Ultron erwachte aus Starks Friedensprogramm und dem Neuronennetz in Lokis Zepter und beschloss binnen Sekunden, dass die Menschheit selbst das Problem ist.',

  /* ---------- Vision ---------- */
  'vision': 'Vision entstand aus Ultrons Vibranium-Körper, der Stimme von J.A.R.V.I.S. und dem Gedankenstein und kann die Dichte dieses Körpers nach Belieben ändern.',

  /* ---------- Wolfgang von Strucker ---------- */
  'wolfgang-von-strucker': 'Baron Wolfgang von Strucker führt die Hydra-Festung in Sokovia, trägt ein Monokel und hält sich für den Mann, der die Wissenschaft endlich frei arbeiten lässt.',

  /* ---------- Laura Barton ---------- */
  'laura-barton': 'Laura Barton arbeitete bei S.H.I.E.L.D. selbst als Agent 19, führt heute die Farm, deren Lage aus allen Akten gestrichen ist, und lässt ihren Mann trotzdem jedes Mal wieder gehen.',

  /* ---------- Cooper Barton ---------- */
  'cooper-barton': 'Cooper ist das erste Kind der Bartons und wächst auf der Farm in Iowa auf, außerhalb jedes Registers.',

  /* ---------- Lila Barton ---------- */
  'lila-barton': 'Lila wächst als zweites Kind der Bartons auf der Farm auf und lernt von ihrem Vater das Bogenschießen, in dem sie schnell sehr genau wird.',

  /* ---------- Luis ---------- */
  'luis': 'Luis war Scott Langs Zellengenosse in San Quentin, nimmt ihn nach der Entlassung bei sich auf und erzählt jede Vorgeschichte in einem einzigen atemlosen Wortschwall.',

  /* ---------- Dave ---------- */
  'dave': 'Dave gehört zu Luis\' kleiner Bande und sitzt bei jedem Einbruch am Steuer des Fluchtwagens.',

  /* ---------- Jim Paxton ---------- */
  'jim-paxton': 'Jim Paxton ist Polizist in San Francisco, mit Maggie Lang verlobt und damit Stiefvater der Tochter des Mannes, den er für eine Gefahr hält.',

  /* ---------- Kurt Goreshter ---------- */
  'kurt-goreshter': 'Kurt Goreshter saß fünf Jahre in Folsom, kommt bei Luis unter und ist der Einzige der Bande, der mit Schlössern und Rechnern umgehen kann.',

  /* ---------- Maggie Lang ---------- */
  'maggie-lang': 'Maggie Lang trug Scott Langs Einbrüche mit, bis die Tochter zur Welt kam, und zieht Cassie heute mit Jim Paxton groß.',

  /* ---------- May Parker ---------- */
  'may-parker': 'May Parker zieht Peter nach Bens Tod allein in Queens groß und ahnt lange nicht, was ihr Neffe nachts in der Stadt treibt.',

  /* ---------- Ayo ---------- */
  'ayo': 'Ayo bewacht mit dem Speer der Dora Milaje drei Könige Wakandas nacheinander, spricht dabei selten und zögert nie.',

  /* ---------- General Dreykov ---------- */
  'general-dreykov': 'General Dreykov leitet den Roten Raum, verschleppt Mädchen aus aller Welt und hält die fertigen Witwen über einen chemischen Zwang in der Hand.',

  /* ---------- Rick Mason ---------- */
  'rick-mason': 'Rick Mason ist Natasha Romanoffs Beschaffer aus S.H.I.E.L.D.-Zeiten, der ihr Papiere, Fahrzeuge und Quartiere besorgt und dabei nie eine Frage stellt.',

  /* ---------- Valentina Allegra de Fontaine ---------- */
  'valentina-allegra-de-fontaine': 'Valentina Allegra de Fontaine sammelt für die CIA beschädigte Leute ein und redet sich aus jedem Untersuchungsausschuss wieder heraus.',

  /* ---------- W'Kabi ---------- */
  'w-kabi': 'W\'Kabi verwaltet den Grenzstamm und dessen gepanzerte Nashörner und stellt beide hinter Killmonger, weil kein König den Mörder seiner Eltern je zur Rechenschaft gezogen hat.',

  /* ---------- Zuri ---------- */
  'zuri': 'Zuri hütet das herzförmige Kraut, leitet die Krönungsriten an den Kriegerfällen und verschweigt jahrzehntelang, wen T\'Chaka in Oakland zurückließ.',

  /* ---------- Herman Schultz ---------- */
  'shocker': 'Herman Schultz ist der zweite Mann in Toomes\' Truppe, der den Vibrationshandschuh trägt, nachdem sein Vorgänger damit selbst erschossen wurde.',

  /* ---------- Flash Thompson ---------- */
  'flash-thompson': 'Flash Thompson gehört mit Peter Parker zum Zehnkampfteam der Midtown School und hält seine endlosen Sticheleien selbst für Humor.',

  /* ---------- Liz Allan ---------- */
  'liz-allan': 'Liz Allan führt das Zehnkampfteam der Midtown School an und erfährt erst am Abend des Balls, wer ihr Vater in Wirklichkeit ist.',

  /* ---------- The Ancient One ---------- */
  'the-ancient-one': 'Die Älteste führt Kamar-Taj seit Jahrhunderten, bewacht die drei Heiligtümer und zieht ihre eigene Lebenskraft heimlich aus der Dunklen Dimension.',

  /* ---------- Karl Mordo ---------- */
  'karl-mordo': 'Karl Mordo kam mit dem Wunsch nach Rache nach Kamar-Taj, wurde dort Meister der mystischen Künste und bricht mit allen, als er sieht, wie beiläufig sie die Regeln beugen.',

  /* ---------- Kaecilius ---------- */
  'kaecilius': 'Kaecilius verlor Frau und Sohn und will seither die Erde der Dunklen Dimension übergeben, weil dort niemand mehr sterben muss.',

  /* ---------- Dormammu ---------- */
  'dormammu': 'Dormammu herrscht als Wesen der Faltine über die zeitlose Dunkle Dimension und will jede Welt in sein Reich holen.',

  /* ---------- Christine Palmer ---------- */
  'christine-palmer': 'Christine Palmer ist Notärztin am Metro-General Hospital und diejenige, die Stephen Strange nach dem Unfall buchstäblich ins Leben zurückholt.',

  /* ---------- Hela ---------- */
  'hela': 'Hela war Odins Henkerin und die erste Trägerin Mjölnirs, formt aus ihrem Körper beliebig viele Klingen und kehrt nach seinem Tod aus der Verbannung zurück.',

  /* ---------- Grandmaster ---------- */
  'grandmaster': 'Der Grandmaster wurde kurz nach dem Beginn des Universums geboren und lässt seither Lebewesen in seiner Arena gegeneinander antreten, solange ihn das unterhält.',

  /* ---------- Topaz ---------- */
  'topaz': 'Topaz führt die Wache von Sakaar, verwaltet die Gefangenen des Grandmasters und bleibt neben seinem fröhlichen Ton stets die Verdrossene.',

  /* ---------- Surtur ---------- */
  'surtur': 'Surtur herrscht über Muspelheim und soll Asgard vernichten, sobald seine Krone das Ewige Feuer berührt, was am Ende Thor selbst veranlasst.',

  /* ---------- Korg ---------- */
  'korg': 'Korg ist ein Kronaner aus Stein mit sanfter Stimme, dessen Revolution an zu wenigen Flugblättern scheiterte und ihn in Sakaars Arena brachte.',

  /* ---------- Sonny Burch ---------- */
  'sonny-burch': 'Sonny Burch handelt in San Francisco mit allem, was sich nicht offen verkaufen lässt, und will Hank Pyms Labor an sich bringen, als er begreift, was darin steckt.',

  /* ---------- Jimmy Woo ---------- */
  'jimmy-woo': 'Jimmy Woo überwacht für das FBI Scott Langs Hausarrest, klingelt gern unangemeldet und übt in der Freizeit Kartentricks.',

  /* ---------- Ebony Maw ---------- */
  'ebony-maw': 'Ebony Maw ist der Redner unter Thanos\' Kindern, der jede Welt vor ihrer Auslöschung noch glücklich preist, und kämpft allein mit Telekinese.',

  /* ---------- Corvus Glaive ---------- */
  'corvus-glaive': 'Corvus Glaive gilt als der treueste von Thanos\' Kindern und führt die Klinge, die jedes Material durchschneidet und ihn selbst aus dem Tod zurückholt.',

  /* ---------- Proxima Midnight ---------- */
  'proxima-midnight': 'Proxima Midnight ist die Kämpferin unter Thanos\' Kindern und führt einen dreizinkigen Speer, der sein Ziel von selbst verfolgt und zu ihr zurückkehrt.',

  /* ---------- Eitri ---------- */
  'eitri': 'Eitri herrscht über Nidavellir, wo ein sterbender Stern die Öfen speist, und gießt Stormbreaker, obwohl Thanos ihm die Hände zerstört hat.',

  /* ---------- Thanos (2014) ---------- */
  'thanos-2014': 'Der Thanos aus dem Jahr 2014 sucht die Steine gerade erst und springt in voller Rüstung neun Jahre nach vorn, nachdem er aus Nebulas Gedächtnis von seiner Niederlage erfahren hat.',

  /* ---------- Nebula (2014) ---------- */
  'nebula-2014': 'Die Nebula aus dem Jahr 2014 ist noch ganz das Werkzeug ihres Vaters und schleust seine Flotte in eine Zukunft, in der ihr eigenes späteres Ich sie erschießt.',

  /* ---------- Gamora (2014) ---------- */
  'gamora-2014-guardians-of-the-galaxy-vol-3': 'In Vol. 3 lebt die Gamora aus dem Jahr 2014 als Ravager unter Stakar Ogord und will mit der Frau nichts zu tun haben, die Peter Quill in ihr sucht.',
  'gamora-2014-avengers-endgame': 'In Endgame steht die Gamora aus dem Jahr 2014 noch in der Rüstung ihres Vaters und wechselt erst die Seiten, als sie sieht, was aus ihrer Schwester geworden ist.',

  /* ---------- Ebony Maw (2014) ---------- */
  'ebony-maw-2014': 'Der Ebony Maw aus dem Jahr 2014 hat den Krieg gegen die Erde nie geführt und findet in Nebulas Speicher die Erinnerungen, die Thanos den Weg in die Zukunft weisen.',

  /* ---------- Corvus Glaive (2014) ---------- */
  'corvus-glaive-2014': 'Der Corvus Glaive aus dem Jahr 2014 kommt mit der Flotte seines Herrn in eine Zukunft, in der er längst gefallen sein müsste.',

  /* ---------- Proxima Midnight (2014) ---------- */
  'proxima-midnight-2014': 'Die Proxima Midnight aus dem Jahr 2014 hat Wakanda nie gesehen und stürzt sich trotzdem mit der Black Order in die Schlacht um das Avengers-Hauptquartier.',

  /* ---------- Cull Obsidian (2014) ---------- */
  'cull-obsidian-2014': 'Der Cull Obsidian aus dem Jahr 2014 hat den Hulkbuster nie gesehen und schlägt sich mit Kettenhammer und Klinge durch die Schlacht um das Avengers-Hauptquartier.',

  /* ---------- Nathaniel Barton ---------- */
  'nathaniel-barton': 'Nathaniel ist das dritte Kind der Bartons, das eigentlich Natasha heißen sollte und seinen zweiten Vornamen nach Pietro Maximoff trägt.',

  /* ---------- Mobius ---------- */
  'mobius': 'Mobius war ein Autoverkäufer namens Don, bis Jener der bleibt ihn aus seinem Leben holte und ihm bei der TVA die Akten der Zeitsünder gab.',

  /* ---------- Hunter B-15 ---------- */
  'hunter-b-15': 'Hunter B-15 führt eine Einheit der TVA und merkt erst spät, dass ihr Name nur eine Nummer ist und sie selbst einmal ein eigenes Leben hatte.',

  /* ---------- Miss Minutes ---------- */
  'miss-minutes': 'Miss Minutes ist die gezeichnete Uhr mit Südstaatenakzent, die den neuen Mitarbeitern der TVA die Regeln erklärt und in Wahrheit ihrem Erbauer dient.',

  /* ---------- Throg ---------- */
  'throg': 'Throg ist ein in einen Frosch verwandelter Thor, der seine Würdigkeit behalten hat und im Archiv der TVA in einem Einmachglas sitzt.',

  /* ---------- Alioth ---------- */
  'alioth': 'Alioth ist reine entfesselte Zeitenergie in Gestalt einer violetten Wolke, die alles verschlingt, was in der Leere am Ende der Zeit ankommt.',

  /* ---------- Jener der bleibt ---------- */
  'der-da-bleibt': 'Jener der bleibt ging als einziger Sieger aus dem Krieg der Varianten hervor und hält mit der TVA seither jede andere Ausgabe seiner selbst aus der Zeit heraus.',

  /* ---------- Classic Loki ---------- */
  'classic-loki': 'Classic Loki hat den Griff von Thanos überlebt, weil er eine Illusion seines Todes zurückließ, und lebte danach jahrzehntelang allein auf einem leeren Planeten.',

  /* ---------- Kid Loki ---------- */
  'kid-loki': 'Kid Loki hat in seiner Zeitlinie als Kind den eigenen Bruder getötet und gilt in der Leere deshalb als der Gefährlichste unter den Varianten.',

  /* ---------- Boastful Loki ---------- */
  'boastful-loki': 'Boastful Loki behauptet, Captain America und Iron Man getötet und alle sechs Steine besessen zu haben, wovon ihm keine der anderen Varianten ein Wort glaubt.',

  /* ---------- Alligator Loki ---------- */
  'alligator-loki': 'Alligator Loki ist ein Alligator mit den Hörnern des Loki-Helms und in Kid Lokis Bande das verlässlichste Mitglied.',

  /* ---------- President Loki ---------- */
  'president-loki': 'President Loki führt in der Leere eine eigene Armee aus Lokis an und trägt die Schärpe eines Wahlkampfs, den es in seiner Zeitlinie gegeben haben muss.',

  /* ---------- White Vision ---------- */
  'white-vision': 'White Vision ist die farblose Kopie, die S.W.O.R.D. aus Visions geborgenem Körper baute, ohne Gedankenstein und ohne jede Erinnerung.',

  /* ---------- Monica Rambeau ---------- */
  'monica-rambeau': 'Monica Rambeau ging beim Durchqueren der Hex-Grenze durch Wandas Magie und kann seither jede Form von Energie in ihrem Körper umsetzen.',

  /* ---------- Sharon Davis ---------- */
  'mrs-hart': 'Sharon Davis bekommt im Hex die Rolle der Mrs. Hart, der Gattin von Visions Vorgesetztem, und zeigt als Erste, was mit den Bewohnern geschieht, wenn jemand das Skript verlässt.',

  /* ---------- Tyler Hayward ---------- */
  'tyler-hayward': 'Tyler Hayward übernimmt S.W.O.R.D. nach dem Snap kommissarisch und richtet die Behörde von der Beobachtung auf Waffen mit eigenem Willen um.',

  /* ---------- Katy ---------- */
  'katy': 'Katy Chen arbeitet mit Shaun als Parkwächterin in einem Hotel in San Francisco und fährt Autos wie eine Rennfahrerin.',

  /* ---------- Wenwu ---------- */
  'wenwu-mandarin': 'Wenwu trägt die zehn Ringe seit tausend Jahren, altert nicht und führt mit ihnen ein Verbrechernetz, das die Welt unter wechselnden Namen fürchtet.',

  /* ---------- Xialing ---------- */
  'xialing': 'Xialing durfte als Tochter nie ausgebildet werden, schaute den Übungen ihres Bruders heimlich zu und brachte sich alles selbst bei.',

  /* ---------- Razor Fist ---------- */
  'razor-fist': 'Mattias hatte seine rechte Hand längst verloren, als Wenwu ihn aufnahm, und trägt an ihrer Stelle eine ausfahrbare Klinge.',

  /* ---------- Ying Nan ---------- */
  'ying-nan': 'Ying Nan gehört zu den Hütern von Ta Lo, bewacht das Dunkle Tor und schmiedet aus Drachenschuppen die Waffen gegen die Seelenfresser.',

  /* ---------- Li Ching-Lin ---------- */
  'death-dealer': 'Li Ching-Lin trägt eine weiße Maske, spricht kaum und hat als ranghöchster Ausbilder der Zehn Ringe den jungen Shang-Chi zum Killer gemacht.',

  /* ---------- Morris ---------- */
  'morris': 'Morris ist ein gesichtsloses Fellwesen aus Ta Lo, das sich im Nebellabyrinth verirrte und den Weg nach Hause erst mit Trevor Slattery wiederfindet.',

  /* ---------- Der Große Beschützer ---------- */
  'der-grosse-beschuetzer': 'Der Große Beschützer ist die Drachin von Ta Lo, die im See neben dem Dorf ruht und aus ihm aufsteigt, wenn das Dunkle Tor bricht.',

  /* ---------- Isaiah Bradley ---------- */
  'isaiah-bradley': 'Isaiah Bradley ist der einzige Soldat, bei dem die nachgebaute Fassung des Serums wirkte, und sein eigenes Land sperrte ihn dafür dreißig Jahre weg.',

  /* ---------- Eli Bradley ---------- */
  'eli-bradley': 'Eli Bradley lebt bei seinem Großvater in Baltimore, kümmert sich um ihn und ist die Tür, durch die jeder Besucher zuerst muss.',

  /* ---------- E.D.I.T.H. ---------- */
  'e-d-i-t-h': 'E.D.I.T.H. ist die künstliche Intelligenz in Tony Starks Brille, deren Name für „Even Dead I\'m The Hero“ steht und die Zugriff auf sein gesamtes Arsenal gibt.',

  /* ---------- J. Jonah Jameson ---------- */
  'j-jonah-jameson': 'J. Jonah Jameson betreibt TheDailyBugle.net, brüllt seine Meldungen selbst in die Kamera und hat Spider-Man zum Dauerthema gemacht.',

  /* ---------- Dimitri Smerdyakov ---------- */
  'dimitri-smerdyakov': 'Dimitri Smerdyakov gehört zu Nick Furys kleinem Kreis, fährt den Bus der Klassenfahrt durch Europa und ist wortkarg bis zur Unhöflichkeit.',

  /* ---------- Sersi ---------- */
  'sersi': 'Sersi verwandelt tote Materie in jeden anderen Stoff und lebt seit Jahrtausenden unter Menschen, weil sie sie wirklich mag.',

  /* ---------- Ikaris ---------- */
  'ikaris': 'Ikaris ist der stärkste der Eternals, fliegt und schießt Strahlen aus den Augen und kennt Arishems wahren Auftrag länger als alle anderen.',

  /* ---------- Thena ---------- */
  'thena': 'Thena formt aus kosmischer Energie jede Waffe, die sie gerade braucht, und leidet am Mahd Wy\'ry, in dem alle früheren Leben gleichzeitig auf sie einstürzen.',

  /* ---------- Kingo ---------- */
  'kingo': 'Kingo schießt Energiegeschosse aus den Händen und lebt in Indien als Filmstar, der sich seit Generationen als sein eigener Nachfahre ausgibt.',

  /* ---------- Sprite ---------- */
  'sprite': 'Sprite erschafft Trugbilder von ganzen Armeen und bleibt dabei seit Jahrtausenden im Körper eines Kindes.',

  /* ---------- Druig ---------- */
  'druig': 'Druig kann den Willen anderer lenken und zog sich mit einem Dorf im Regenwald zurück, weil er den Kriegen der Menschen nicht länger zusehen wollte.',

  /* ---------- Makkari ---------- */
  'makkari': 'Makkari bewegt sich schneller als der Schall, ist gehörlos und findet auf der Erde als Erste die Spuren der Deviants.',

  /* ---------- Phastos ---------- */
  'phastos': 'Phastos ist der Erfinder der Eternals, der den Menschen ihre Werkzeuge gab und sich zurückzog, als er sah, was sie daraus machten.',

  /* ---------- Ajak ---------- */
  'ajak': 'Ajak führt die zehn Eternals als Prime Eternal, heilt jede ihrer Wunden und ist die Einzige, die unmittelbar mit Arishem spricht.',

  /* ---------- Gilgamesh ---------- */
  'gilgamesh': 'Gilgamesh ist der beständigste Kämpfer der Eternals, der fünfhundert Jahre lang mit Thena im Exil lebte und sie aus jedem Anfall zurückholte.',

  /* ---------- Kro ---------- */
  'kro': 'Kro führt die Deviants an, die aus derselben Weltenschmiede stammen wie die Eternals, und nimmt Ajak ihre Kraft, um selbst denken und sprechen zu lernen.',

  /* ---------- Dane Whitman ---------- */
  'dane-whitman': 'Dane Whitman ist Historiker am Londoner Natural History Museum, Sersis Freund und Erbe eines schwarzen Schwertes, über das seine Familie nicht spricht.',

  /* ---------- Arishem der Richter ---------- */
  'arishem': 'Arishem der Richter baut in der Weltenschmiede die Eternals und spricht über jede Welt das Urteil, in der ein Celestial heranwächst.',

  /* ---------- Tiamut der Kommunikator ---------- */
  'tiamut': 'Tiamut wächst seit Jahrtausenden im Erdkern und wird von Sersi im Augenblick des Erwachens in Stein verwandelt.',

  /* ---------- Nezarr der Rechner ---------- */
  'nezarr': 'Nezarr der Rechner ist einer der Celestials neben Arishem, der in den Bildern aus der Weltenschmiede über die Verteilung der Eternals wacht.',

  /* ---------- Eros ---------- */
  'eros-starfox': 'Eros ist Thanos\' Bruder von Titan, das gelöste Gegenteil seines düsteren Verwandten, und im Universum unter dem Namen Starfox bekannt.',

  /* ---------- Jemiah der Analytiker ---------- */
  'jemiah': 'Jemiah der Analytiker ist der Celestial, der prüft und bewertet, was die anderen an Welten und Arten hervorbringen.',

  /* ---------- Karun Patel ---------- */
  'karun-patel': 'Karun Patel hielt Kingo bei der ersten Begegnung für einen Vampir und begleitet ihn seit fünfzig Jahren als Kammerdiener mit der Kamera.',

  /* ---------- Pip der Troll ---------- */
  'pip-der-troll': 'Pip ist ein Laxidazianer, der Eros bewundert und ihn überall als Herold mit weit größeren Worten ankündigt, als der es je täte.',

  /* ---------- Peter Parker (Maguire) ---------- */
  'peter-parker-maguire': 'Dieser Peter Parker trägt seinen Anzug am längsten von den dreien und schießt seine Netze ohne jede Technik direkt aus den Handgelenken.',

  /* ---------- Peter Parker (Garfield) ---------- */
  'peter-parker-garfield': 'Dieser Peter Parker baut seine Netzwerfer selbst und hat seit dem Tod von Gwen Stacy niemanden mehr an sich herangelassen.',

  /* ---------- Black Bolt ---------- */
  'black-bolt': 'Black Bolt herrscht über die Inhumans von Attilan und spricht seit seiner Terrigenese kein Wort, weil seine Stimme Wände einreißt.',

  /* ---------- Clea ---------- */
  'clea': 'Clea ist Dormammus Nichte und schneidet Tore zwischen den Dimensionen, ohne dafür ein Heiligtum zu brauchen.',

  /* ---------- Rintrah ---------- */
  'rintrah': 'Rintrah stammt vom Planeten R\'Vaal, kam als Schüler der mystischen Künste nach Kamar-Taj und blieb dort als einer der Meister.',

  /* ---------- Reed Richards (Erde-838) ---------- */
  'reed-richards-838': 'Der Reed Richards von Erde-838 dehnt seine Glieder nach Belieben, gilt als klügster Mensch seiner Welt und sitzt dafür im Kreis der Illuminati.',

  /* ---------- Karl Mordo (Erde-838) ---------- */
  'karl-mordo-838': 'Der Mordo von Erde-838 übernahm nach der Hinrichtung seines Strange dessen Rang als Oberster Zauberer und führt das New Yorker Heiligtum.',

  /* ---------- Peggy Carter (Erde-838) ---------- */
  'peggy-carter-838': 'Auf Erde-838 bekam Peggy Carter das Serum und kämpft als Captain Carter mit einem Schild in den Farben des Union Jack.',

  /* ---------- Maria Rambeau (Erde-838) ---------- */
  'maria-rambeau-838': 'Auf Erde-838 trägt Maria Rambeau Anzug, Kräfte und Namen von Captain Marvel und sitzt für ihre Welt bei den Illuminati.',

  /* ---------- Christine Palmer (Erde-838) ---------- */
  'christine-palmer-838': 'Die Christine Palmer von Erde-838 erforscht für die Baxter Foundation das Multiversum und hat ihrer eigenen Welt diese Nummer gegeben.',

  /* ---------- Wanda Maximoff (Erde-838) ---------- */
  'wanda-maximoff-838': 'Die Wanda von Erde-838 hat die Avengers verlassen und zieht in Westview ihre Söhne Tommy und Billy groß, unbelastet von jedem Darkhold.',

  /* ---------- Stephen Strange (andere Welt) ---------- */
  'sinister-strange': 'Dieser Strange hat mit dem Darkhold nach einer Wirklichkeit gesucht, in der Christine Palmer bei ihm ist, und dabei die eigene zerstört.',

  /* ---------- Eleanor Bishop ---------- */
  'eleanor-bishop': 'Eleanor Bishop führt Bishop Security und hält die Firma über Wasser, indem sie für Wilson Fisk arbeitet.',

  /* ---------- Kazi Kazimierczak ---------- */
  'kazi-kazimierczak': 'Kazi Kazimierczak wuchs mit Maya Lopez auf, führt mit ihr die Tracksuit Mafia und arbeitet dabei längst für Wilson Fisk.',

  /* ---------- William Lopez ---------- */
  'william-lopez': 'William Lopez führt die Tracksuit Mafia und stirbt bei Ronins Angriff, ohne dass seine Tochter je erfährt, wer das Treffen verraten hat.',

  /* ---------- Ivan Banionis ---------- */
  'ivan-banionis': 'Ivan Banionis ist einer der Anführer der Tracksuit Mafia, laut, breit und mit einem „Bro“ in jedem zweiten Satz.',

  /* ---------- Tomas ---------- */
  'tomas': 'Tomas gehört seit Jahren zur Tracksuit Mafia und wirft beim Angriff auf Kate Bishops Wohnung die Brandflaschen mit.',

  /* ---------- Enrique ---------- */
  'enrique': 'Enrique ist der junge Tracksuit unter Kazi Kazimierczak, der beim Überfall auf die Auktion als Erster zum Abbruch rät.',

  /* ---------- Dmitri ---------- */
  'dmitri': 'Dmitri gehört zu den Tracksuits, die Clint Barton verschleppen, um über ihn an Kate Bishop heranzukommen.',

  /* ---------- Wendy Conrad ---------- */
  'wendy-conrad': 'Wendy Conrad ist Polizistin und führt die New Yorker Rollenspielgruppe an, die im Ernstfall auch eine Räumung organisiert.',

  /* ---------- Lucky ---------- */
  'lucky': 'Lucky ist der einäugige Golden Retriever, der vor dem Presidential Hotel im Schnee saß und seither bei Kate Bishop von Pizza lebt.',

  /* ---------- Cassandra Nova ---------- */
  'cassandra-nova': 'Cassandra Nova ist Charles Xaviers Zwillingsschwester, die schon im Mutterleib nach ihm griff und in der Leere mit ihrer Telepathie herrscht.',

  /* ---------- Mr. Paradox ---------- */
  'mr-paradox': 'Mr. Paradox verwaltet bei der TVA zerfallende Zeitlinien und will eine davon abkürzen, um seine Beförderung zu beschleunigen.',

  /* ---------- Dogpool ---------- */
  'dogpool': 'Mary Puppins ist eine Pugese-Hündin mit Heilfaktor, die ihrem Besitzer Nicepool ständig davonläuft, weil sie sich für jeden Fremden begeistert.',

  /* ---------- Wade Wilson (Earth-TRN872) ---------- */
  'nicepool': 'Nicepool trägt weißes Leder, blondes Haar und goldene Pistolen und redet über sich selbst so freundlich, wie andere Fassungen über sich herziehen.',

  /* ---------- Cain Marko ---------- */
  'juggernaut': 'Cain Marko verdankt seine Unaufhaltsamkeit dem Helm, der jeden Angriff auf den Verstand abblockt, und dient damit Cassandra Nova.',

  /* ---------- Toad ---------- */
  'toad': 'Toad ist ein Mutant mit meterlanger Zunge und gewaltiger Sprungkraft, der sich in der Leere Cassandra Nova angeschlossen hat.',

  /* ---------- Azazel ---------- */
  'azazel': 'Azazel setzt sich mit einer roten Rauchwolke von Ort zu Ort und trägt rote Haut, spitze Züge und einen gespaltenen Greifschwanz.',

  /* ---------- Piotr Rasputin ---------- */
  'colossus': 'Piotr Rasputin verwandelt seinen Körper in organischen Stahl und bleibt dabei der höflichste und altmodischste der X-Men.',

  /* ---------- Wade Winston Wilson ---------- */
  'deadpool-2099': 'Die Rüstung von Deadpool 2099 zieht Neonlinien über Rot und Schwarz, über der Schulter stecken zwei elektrisch geladene Katanas.',
  'zenpool': 'Zenpool trägt eine graue Kutte mit Kapuze, eine Gebetskette über der Brust und führt statt Schusswaffen einen Stab und ein Blasrohr.',
  'cowboypool': 'Cowboypool trägt eine rote Westernweste mit goldenen Druckknöpfen, Stiefel mit vergoldeten Sporen und einen Patronengurt über der Brust.',

  /* ---------- Kidpool ---------- */
  'kidpool': 'Kidpool ist die Deadpool-Variante im Kindesalter, die auf dem Rücken zwei echte Katanas und an der Hüfte zwei Wasserpistolen trägt.',

  /* ---------- Wanda Wilson ---------- */
  'ladypool': 'Wanda Wilson führt in der Leere das Deadpool Corps an, eine Truppe aus lauter Varianten ihrer selbst.',

  /* ---------- Laura ---------- */
  'laura-x-23': 'Laura wurde aus Logans Erbgut erzeugt, wuchs in einem Labor als X-23 auf und gab sich nach der Flucht selbst diesen Namen.',

  /* ---------- Watari ---------- */
  'samuraipool': 'Samuraipool tritt in rotem Gewand und mit Strohhut als Samurai an und führt dazu zwei Katanas.',

  /* ---------- Victor Creed ---------- */
  'victor-creed-sabretooth': 'Victor Creed trägt denselben Heilfaktor wie sein Halbbruder Logan und Klauen, die aus seinen Fingernägeln fahren.',

  /* ---------- John Allerdyce ---------- */
  'john-allerdyce-pyro': 'John Allerdyce lenkt Feuer, das er nicht selbst entzündet hat, und verkauft diese Gabe in der Leere an Cassandra Nova.',

  /* ---------- Elektra Natchios ---------- */
  'elektra': 'Elektra Natchios wurde nach dem Mord an ihrer Mutter im Kampf ausgebildet und führt seither zwei Sai.',

  /* ---------- Althea ---------- */
  'blind-al': 'Althea lebt blind in ihrer New Yorker Wohnung, teilt sie mit Wade Wilson und spricht ihm jede Rücksicht ab, die er nicht verdient hat.',

  /* ---------- Ellie Phimister ---------- */
  'negasonic-teenage-warhead': 'Ellie Phimister zündet Explosionen aus dem eigenen Körper und hat für Wade Wilson nie mehr als ein Augenrollen übrig.',

  /* ---------- Yukio ---------- */
  'yukio': 'Yukio lenkt Elektrizität, gehört zu den X-Men und begrüßt Wade Wilson als eine der wenigen ohne jeden Vorbehalt.',

  /* ---------- Rusty ---------- */
  'shatterstar': 'Rusty stammt nicht von der Erde und wurde von Deadpool unter dem Namen Shatterstar für die X-Force angeworben.',

  /* ---------- Headpool ---------- */
  'headpool': 'Von diesem Wade Wilson blieb nach einer Mutantenseuche nur der Kopf übrig, der weiterredet und mit einer Propellermütze fliegt.',

  /* ---------- Callisto ---------- */
  'callisto': 'Callisto ist eine Mutantin, deren Körper auf hohes Tempo gebaut ist, und führt in Cassandra Novas Gefolge zwei Messer.',

  /* ---------- Quill ---------- */
  'quill': 'Quill treibt stachelschweinartige Stacheln aus Gesicht und Kopf und hält für Cassandra Nova die Festung.',

  /* ---------- Yuriko Oyama ---------- */
  'lady-deathstrike': 'Yuriko Oyamas Skelett und Fingernägel sind mit Adamantium durchsetzt, weshalb sie an allen zehn Fingern ausfahrbare Klauen trägt.',

  /* ---------- Arthur Harrow ---------- */
  'arthur-harrow': 'Arthur Harrow diente Khonshu vor Marc Spector als Avatar und läuft seither barfuß über Glasscherben, um den Schmerz nicht zu vergessen.',

  /* ---------- Khonshu ---------- */
  'khonshu': 'Khonshu ist der ägyptische Gott des Mondes, den die Ennead verbannte, weil er sich weiter in die Angelegenheiten der Menschen einmischte.',

  /* ---------- Ammit ---------- */
  'ammit': 'Ammit wiegt die Seelen auf ihrer Waage und rechnet dabei auch Taten an, die noch niemand begangen hat.',

  /* ---------- Taweret ---------- */
  'taweret': 'Taweret gehört zur Ennead, ist die Göttin der Frauen und Kinder und geleitet die Toten durch die Duat.',

  /* ---------- Bruno Carrelli ---------- */
  'bruno-carrelli': 'Bruno Carrelli wohnt über dem Kiosk Circle Q, kennt Kamala seit der zweiten Klasse und baut ihr die Technik zu ihrem Anzug.',

  /* ---------- Kamran ---------- */
  'kamran': 'Kamran ist der Sohn der Clandestine Najma, wuchs an ständig wechselnden Orten auf und entdeckt in Jersey City eigene Kräfte.',

  /* ---------- Muneeba Khan ---------- */
  'muneeba-khan': 'Muneeba Khan führt ihre Familie in Jersey City mit strengen Regeln und hält die Geschichten über ihre Urgroßmutter für gefährlichen Aberglauben.',

  /* ---------- Aamir Khan ---------- */
  'aamir-khan': 'Aamir Khan lebt seinen Glauben strenger als der Rest der Familie, arbeitet ehrenamtlich in der Moschee mit und hat sein Studium abgebrochen.',

  /* ---------- Sana Ali ---------- */
  'sana-ali': 'Sana Ali lebt in Karatschi in einem Haus voller Karten und Zettel und gilt der Familie seit Jahrzehnten als wunderlich.',

  /* ---------- Kareem ---------- */
  'kareem-red-dagger': 'Kareem wuchs in Karatschi auf und kämpft für den Orden der Roten Dolche als Red Dagger gegen alles, was aus der Noor-Dimension kommt.',

  /* ---------- Gorr der Götterschlächter ---------- */
  'gorr': 'Gorr verlor seine Tochter auf einer verdorrten Welt und führt seither das Necroschwert, das ihn selbst auszehrt, während er die Götter jagt.',

  /* ---------- Zeus ---------- */
  'zeus': 'Zeus ist der König der Olympier, der älteste aller Götter, der Blitze auch ohne Waffe ruft und in der Goldenen Stadt Hof hält.',

  /* ---------- Hercules ---------- */
  'hercules': 'Hercules ist der Sohn des Zeus, der von seinem Vater losgeschickt wird, um Thor zu töten.',

  /* ---------- Love ---------- */
  'love': 'Love ist Gorrs Tochter, die auf einer sterbenden Welt verhungerte und von Eternity zurückgegeben wird.',

  /* ---------- Tanngrisnir und Tanngnjostr ---------- */
  'tanngrisnir-und-tanngnjostr': 'Tanngrisnir und Tanngnjostr sind zwei Ziegenböcke aus Indigarr, die Thors Boot durch den Weltraum ziehen und dabei ununterbrochen schreien.',

  /* ---------- Nikki Ramos ---------- */
  'nikki-ramos': 'Nikki Ramos ist Rechtsanwaltsgehilfin und Jennifer Walters\' beste Freundin, die von der Verwandlung von Anfang an weiß.',

  /* ---------- Titania ---------- */
  'titania': 'Mary MacPherran verkauft als Titania Nahrungsergänzung und Lebensberatung an Millionen und sucht in jedem Kampf zuerst die Kamera.',

  /* ---------- Piledriver ---------- */
  'piledriver': 'Brian Calusky gehört zur Wrecking Crew und trägt seine übermenschliche Kraft in den bloßen Fäusten.',

  /* ---------- Alexander Gentry ---------- */
  'alexander-gentry-porcupine': 'Alexander Gentry steckt in einem selbstgebauten Anzug voller Stacheln, der ihm zugleich Waffe, Panzer und einziger sicherer Ort ist.',

  /* ---------- Dirk Garthwaite ---------- */
  'eugene-patilio-leapfrog': 'Der Froschanzug von Luke Jacobson ist grün gepolstert, hat gelbe Handschuhe und Stiefel und trägt in den Sohlen die Triebwerke, mit denen Patilio springen und fliegen will.',
  'dirk-garthwaite-wrecker-brechstange': 'Dirk Garthwaite führt die Wrecking Crew und hält sie mit einer Brechstange aus asgardischem Vibranium zusammen.',
  'dirk-garthwaite-wrecker': 'Ohne die Brechstange ist Garthwaite ein Handlanger, der bis zuletzt kaum weiß, für wen die Wrecking Crew eigentlich arbeitet.',

  /* ---------- Muzzafar Lambert ---------- */
  'muzzafar-lambert-saracen': 'Muzzafar Lambert ist ein Vampir, der im Retreat Summer Twilights untergekommen ist und dort seinen Blutdurst höflich verpackt.',

  /* ---------- William Taurens ---------- */
  'william-taurens-man-bull': 'William Taurens wurde von einem missglückten Laborversuch in ein Stierwesen verwandelt, dessen Kraft er nicht sicher steuern kann.',

  /* ---------- Craig Hollis ---------- */
  'craig-hollis-mr-immortal': 'Craig Hollis besitzt einen Heilungsfaktor, den der Tod nicht hält, und nutzt ihn vor allem, um sich aus seinen Ehen zu stehlen.',

  /* ---------- Donny Blaze ---------- */
  'donny-blaze': 'Donny Blaze hielt es in Kamar-Taj genau eine Woche aus und benutzt den Sling Ring seither für seine Bühnenshow.',

  /* ---------- Luke Jacobson ---------- */
  'luke-jacobson': 'Luke Jacobson näht als Modeschöpfer nur noch für die Heldenszene und sucht sich seine Kundschaft selbst aus.',

  /* ---------- Mallory Book ---------- */
  'mallory-book': 'Mallory Book gilt in der Abteilung für Übermenschenrecht als die Beste und tritt dabei so glatt auf, dass Kollegen sie eher fürchten als mögen.',

  /* ---------- Skaar ---------- */
  'skaar': 'Skaar kam auf Sakaar zur Welt, wo die Zeit anders läuft, und steht als Sohn von Bruce Banner eines Tages beim Grillfest der Walters vor der Tür.',

  /* ---------- Namor ---------- */
  'namor': 'Ch\'ah Toh Almehen kam 1571 auf Yucatán zur Welt, wurde durch eine blaue Wasserpflanze zum Mutanten und herrscht seither über Talokan.',

  /* ---------- Attuma ---------- */
  'attuma': 'Attuma führt die Streitkräfte Talokans, berät Namor und schlägt mit einer Doppelaxt zu.',

  /* ---------- Namora ---------- */
  'namora': 'Namora bewundert Namor seit ihrer Kindheit, ist seine Stellvertreterin und kämpft an vorderster Stelle.',

  /* ---------- Ouroboros (O.B.) ---------- */
  'ouroboros-o-b': 'Ouroboros hat jedes Handbuch der TVA selbst geschrieben und wartet seit Jahrzehnten allein in der Werkstatt darauf, dass ihn jemand etwas fragt.',

  /* ---------- Victor Timely ---------- */
  'victor-timely': 'Victor Timely tritt um 1900 als Erfinder und Industrieller auf und liest seine Baupläne aus einem Handbuch der TVA ab, das er selbst nicht ganz versteht.',

  /* ---------- Rama-Tut ---------- */
  'rama-tut': 'Rama-Tut landete mit einem Zeitschiff im alten Ägypten und herrschte dort als Pharao mit Technik, gegen die niemand etwas ausrichten konnte.',

  /* ---------- Veb ---------- */
  'veb': 'Veb ist ein gallertartiges Wesen aus dem Quantenreich, das bei jeder Begegnung als Erstes darauf hinweist, dass es keine Löcher hat.',

  /* ---------- Jentorra ---------- */
  'jentorra': 'Jentorra führt die Freiheitskämpfer des Quantenreichs an, seit Kang für den Bau von Axia ihre Heimat zerstören ließ.',

  /* ---------- Krylar ---------- */
  'krylar': 'Krylar kämpfte einst im Widerstand des Quantenreichs an Janet van Dynes Seite und verwaltet heute für Kang die Stadt Axia.',

  /* ---------- Quaz ---------- */
  'quaz': 'Quaz hört als Telepath die Gedanken der anderen ohne Schalter und weiß deshalb mehr, als ihm lieb ist.',

  /* ---------- Immortus ---------- */
  'immortus': 'Immortus ist die Fassung, die nach der Entdeckung des Multiversums Wissen und Technik unter ihren eigenen Ausgaben verteilte, und führt den Rat der Kangs an.',

  /* ---------- Scarlet Centurion ---------- */
  'scarlet-centurion': 'Der Scarlet Centurion führt mit Immortus und Rama-Tut den Rat der Kangs und teilt dort die Herrschaft über die Universen auf.',

  /* ---------- High Evolutionary ---------- */
  'high-evolutionary': 'Der High Evolutionary hält sich für denjenigen, der die Schöpfung zu Ende bringt, und wirft jedes Volk weg, das ihm nicht vollkommen genug ist.',

  /* ---------- Adam Warlock ---------- */
  'adam-warlock': 'Adam Warlock schlüpfte zu früh aus seinem Kokon und handelt deshalb mit der Kraft eines Gottes und dem Verstand eines Kindes.',

  /* ---------- Lylla ---------- */
  'lylla': 'Lylla ist die Otterdame mit den mechanischen Vorderbeinen, die Rocket im Käfig der Versuchsreihe 89 als Erste ansprach und ihm seinen Namen gab.',

  /* ---------- Teefs ---------- */
  'teefs': 'Teefs ist ein Walross, dem der High Evolutionary statt der Flossen Räder angesetzt hat, damit es sich an Land bewegen kann.',

  /* ---------- Floor ---------- */
  'floor': 'Floor ist ein Kaninchen auf langen mechanischen Spinnenbeinen, das seinen Namen bekam, weil es beim Aufwachen als Erstes den Boden benannte.',

  /* ---------- Phyla-Vell ---------- */
  'phyla-vell': 'Phyla ist ein Kree-Mädchen aus den Versuchen des High Evolutionary, das die Guardians beim Sturm auf die Arête befreien.',

  /* ---------- Sonya Falsworth ---------- */
  'sonya-falsworth': 'Sonya Falsworth leitet eine Abteilung des britischen Auslandsgeheimdienstes und foltert mit der Teetasse in der Hand.',

  /* ---------- Präsident James Ritson ---------- */
  'praesident-james-ritson': 'Präsident James Ritson überlebte den Schnips und lässt sich als Staatsoberhaupt von Gravik in einen Krieg treiben, den niemand gewinnen kann.',

  /* ---------- Chula ---------- */
  'chula': 'Chula führt die Familie Lopez in Tamaha, betreibt dort einen Laden und hält die Geschichte der Choctaw wach.',

  /* ---------- Bonnie ---------- */
  'bonnie': 'Bonnie ist Maya Lopez\' Cousine aus Tamaha, mit der sie als Kind unzertrennlich war und die sie Jahre später wieder aufnimmt.',

  /* ---------- Henry Lopez ---------- */
  'henry-lopez': 'Henry Lopez führt in Tamaha eine Rollschuhbahn und ist der Einzige der Familie, der den Kontakt zu Maya nie ganz abreißen lässt.',

  /* ---------- Dar-Benn ---------- */
  'dar-benn': 'Dar-Benn gehörte zur Starforce und greift nach dem zweiten Armreif, um ihrem sterbenden Hala von anderen Welten zu holen, was es braucht.',

  /* ---------- Hank McCoy ---------- */
  'hank-mccoy-beast': 'Henry McCoy trägt blaues Fell, spitze Ohren und Klauen und ist zugleich Arzt und Gelehrter unter den X-Men.',

  /* ---------- Maria Rambeau (Earth-10005) ---------- */
  'maria-rambeau-binary': 'In diesem Universum hat Maria Rambeau den Blip überlebt, trägt den Namen Binary und hält ihre eigene Tochter für eine Fremde.',

  /* ---------- Prinz Yan ---------- */
  'prinz-yan': 'Yan ist der Prinz von Aladna, einer Welt, auf der gesungen statt gesprochen wird, und durch einen diplomatischen Akt mit Carol Danvers verheiratet.',

  /* ---------- Lilia Calderu ---------- */
  'lilia-calderu': 'Lilia Calderu erlebt ihr Leben nicht der Reihe nach und liest ihre Tarotkarten deshalb wie eine Erinnerung an das, was noch kommt.',

  /* ---------- Jennifer Kale ---------- */
  'jennifer-kale': 'Jennifer Kale ist Trankhexe in elfter Generation und hält sich, seit ein Fluch ihre Kräfte nahm, mit Wellness-Produkten über Wasser.',

  /* ---------- Alice Wu-Gulliver ---------- */
  'alice-wu-gulliver': 'Alice Wu-Gulliver wuchs mit dem Fluch auf, der ihre Mutter das Leben kostete, und arbeitet seither als Bodyguard und Schutzhexe.',

  /* ---------- Leila Taylor ---------- */
  'leila-taylor': 'Leila Taylor führt den Personenschutz von Präsident Ross, benennt jedes Risiko und bleibt trotzdem an seiner Seite.',

  /* ---------- Muse ---------- */
  'muse': 'Bastian Cooper malt als Muse seine Bilder mit dem Blut seiner Opfer und lässt sich dafür von der halben Stadt als Künstler feiern.',

  /* ---------- Karen Page ---------- */
  'karen-page': 'Karen Page kam als Verdächtige in die Kanzlei Nelson und Murdock, arbeitete danach für sie und schreibt heute über genau die Verbrechen, die Matt Murdock nachts verfolgt.',

  /* ---------- Connor Powell ---------- */
  'connor-powell': 'Connor Powell stammt aus einer Polizistenfamilie, sammelt Verwarnungen wegen unverhältnismäßiger Gewalt und gehört unter Fisk zur Anti-Vigilante Task Force.',

  /* ---------- Cole North ---------- */
  'cole-north': 'Cole North schloss die Polizeiakademie als Jahrgangsbester ab, verehrt den Punisher und erschießt Hector Ayala am Abend seines Freispruchs.',

  /* ---------- Hector Ayala ---------- */
  'white-tiger': 'Hector Ayala schützt New York mit den mystischen Amuletten als White Tiger und arbeitet daneben fünfzehn Jahre lang als Buchprüfer.',

  /* ---------- Mr. Charles ---------- */
  'mr-charles': 'Mr. Charles besorgt für Valentina Allegra de Fontaine die Logistik und sorgt dafür, dass Dinge ankommen, ohne dass jemand nach ihrer Herkunft fragt.',

  /* ---------- Franklin Nelson ---------- */
  'franklin-nelson-foggy': 'Foggy Nelson gründete mit Matt Murdock die Kanzlei Nelson und Murdock und nimmt dort die Fälle an, die sich nicht rechnen.',

  /* ---------- Heather Glenn ---------- */
  'heather-glenn': 'Heather Glenn führt eine Praxis für Paartherapie in New York, betreut das Ehepaar Fisk und ist zugleich mit Matt Murdock zusammen.',

  /* ---------- Luke Cage ---------- */
  'luke-cage': 'Carl Lucas kam als Unschuldiger nach Seagate, wo ein Experiment ihm übermenschliche Kraft und undurchdringliche Haut hinterließ.',

  /* ---------- Parker Robbins ---------- */
  'parker-robbins-the-hood': 'Parker Robbins schloss einen Pakt mit Mephisto und trägt seither einen Umhang, der ihn über gewöhnliche Menschen hinaushebt.',

  /* ---------- N.A.T.A.L.I.E. ---------- */
  'n-a-t-a-l-i-e': 'N.A.T.A.L.I.E. ist die künstliche Intelligenz, die Riri Williams aus Videos und Nachrichten ihrer toten besten Freundin gebaut hat.',

  /* ---------- Ezekiel Stane ---------- */
  'ezekiel-stane': 'Ezekiel Stane ist Obadiah Stanes Sohn, der sich der Bionik verschrieben hat und unter falschem Namen für den Hood arbeitet.',

  /* ---------- Mephisto ---------- */
  'mephisto': 'Mephisto handelt mit Wünschen, lässt sich allein in Seelen bezahlen und fasst jeden Vertrag so, dass die Erfüllung schlimmer ist als der Wunsch.',

  /* ---------- Clown ---------- */
  'clown': 'Clown ist die Pyrotechnikerin, die Parker Robbins im Moment ihrer größten Dummheit auffing und in seine Bande holte.',

  /* ---------- Jeri Blood ---------- */
  'jeri-blood': 'Jeri Blood ist ein aus jeder Liga geworfener Sportler, der sein Geld in Kellerkämpfen verdient und in Hoods Bande die Muskelkraft stellt.',

  /* ---------- John King ---------- */
  'john-king': 'John King ist Parker Robbins\' Cousin, der ihn aus der Gosse holte und die Bande für die Einbrüche bei ArtWorks zusammenstellt.',

  /* ---------- Landon ---------- */
  'landon': 'Landon verkauft in Riri Williams\' Viertel Saft und Süßigkeiten aus einem Bollerwagen und lässt sich jeden Handgriff bezahlen.',

  /* ---------- Ronnie Williams ---------- */
  'ronnie-williams': 'Ronnie Williams bringt ihre Tochter nach zwei Todesfällen allein durch und sieht als Erste, dass hinter Riris Rüstungsbau die Trauer steckt.',

  /* ---------- Roz Blood ---------- */
  'roz-blood': 'Roz Blood ist wie ihr Bruder aus jeder Liga verbannt und tritt seither im Untergrund an, wo es kein Regelwerk gibt.',

  /* ---------- Slug ---------- */
  'slug': 'Slug betrog als Hacker in Madripoor illegale Glücksspieler um ihren Einsatz und steht seither ganz oben auf den Fahndungslisten der Insel.',

  /* ---------- Zelma Stanton ---------- */
  'zelma-stanton': 'Zelma Stanton hat sich die Magie aus Büchern selbst beigebracht, nachdem ihre Mutter bei den Meistern der mystischen Künste gelernt hatte.',

  /* ---------- Mel ---------- */
  'mel': 'Mel Gold erlebte die Schlacht von New York als Schülerin und arbeitet heute als Assistentin für Valentina Allegra de Fontaine.',

  /* ---------- Sue Storm ---------- */
  'sue-storm-invisible-woman': 'Sue Storm macht sich und andere unsichtbar und formt Kraftfelder, die ganze Gebäude tragen.',

  /* ---------- Ben Grimm ---------- */
  'ben-grimm-the-thing': 'Ben Grimm wurde von der kosmischen Strahlung in ein Wesen aus orangefarbenem Gestein verwandelt und ist der Einzige der Vier, der nicht in seine alte Gestalt zurückkann.',

  /* ---------- Galactus ---------- */
  'galactus': 'Galactus war vor Milliarden Jahren ein sterblicher Mann, bis die Kosmische Kraft ihn in eine gottgleiche Gestalt mit einem Hunger verwandelte, der nie endet.',

  /* ---------- Shalla-Bal ---------- */
  'silver-surfer': 'Shalla-Bal trat in Galactus\' Dienst, um ihre eigene Welt zu retten, und reist seither als Wesen aus Silber auf einem Brett durch die Leere.',

  /* ---------- Doctor Doom ---------- */
  'doctor-doom': 'Victor von Doom herrscht mit absoluter Gewalt über Latveria und verbindet als einer der wenigen Spitzenforschung mit tatsächlicher Magie.',

  /* ---------- H.E.R.B.I.E. ---------- */
  'h-e-r-b-i-e': 'H.E.R.B.I.E. ist der Roboter, den Reed Richards für Haushalt und Forschung baute, der auf einem Sockel schwebt und die Vier des Teams auf der Brust trägt.',

  /* ---------- Franklin Richards ---------- */
  'franklin-richards': 'Franklin Richards kam am Rand eines Neutronensterns zur Welt, weil Galactus die Kosmische Kraft in dem ungeborenen Kind spürte.',

  /* ---------- Giganto ---------- */
  'giganto': 'Giganto ist ein Ungeheuer von der Größe eines Hochhauses, das mitten in bewohntem Gebiet aus dem Boden bricht.',

  /* ---------- Harvey Elder ---------- */
  'harvey-elder-mole-man': 'Harvey Elder war Wissenschaftler, bevor er in Subterranea ein Volk fand und dessen Anführer wurde.',

  /* ---------- Rachel Rozman ---------- */
  'rachel-rozman': 'Rachel Rozman arbeitet für die Synagoge in der Yancy Street, wo Ben Grimm noch Ben heißt und nicht The Thing.',

  /* ---------- Regisseur Von Kovak ---------- */
  'regisseur-von-kovak': 'Regisseur Von Kovak besetzt die Neuverfilmung von Wonder Man und entscheidet damit über Auslegung, Ton und Besetzung der Figur.',

  /* ---------- DeMarr Davis ---------- */
  'demarr-davis-doorman': 'DeMarr Davis arbeitet als Türsteher im Club Wilcox und wird durch eine Pfütze aus Darkforce zum lebenden Portal.',

  /* ---------- Eric Williams ---------- */
  'eric-williams': 'Eric Williams ist der ältere Bruder, der zu Hause blieb und die Familie zusammenhält, während Simon nach Hollywood ging.',

  /* ---------- Janelle Jackson ---------- */
  'janelle-jackson': 'Janelle Jackson betreut Simon Williams bei der Hanover Agency und sagt ihm, was in dieser Branche tatsächlich zu holen ist.',

  /* ---------- Martha Williams ---------- */
  'martha-williams': 'Martha Williams ist die Witwe von Sanford und der feste Punkt, um den sich die Familie noch versammelt.',

  /* ---------- Sanford Williams ---------- */
  'sanford-williams': 'Sanford Williams ist der verstorbene Vater von Eric und Simon, dessen Platz in der Familie beide Söhne auf ihre Weise gefüllt haben.',

  /* ---------- Curtis Hoyle ---------- */
  'curtis-hoyle': 'Curtis Hoyle verlor als Sanitäter ein Bein und leitet heute die Gesprächsgruppe für Heimkehrer, die mit dem Krieg nicht zurechtkommen.',

  /* ---------- Isabella Gnucci ---------- */
  'ma-gnucci': 'Isabella Gnucci führt mit ihrem Mann die Familie Gnucci und setzt nach dem Verlust ihrer Söhne ein Kopfgeld aus, das halb Little Sicily in Bewegung setzt.',

  /* ---------- Jean Grey ---------- */
  'jean-grey': 'Jean Grey liest Gedanken und bewegt Dinge mit dem Willen, seit ihre Mutter die beiden Schwestern aus Angst vor dieser Gabe vor die Tür setzte.',

  /* ---------- William Metzger ---------- */
  'william-metzger': 'Direktor William Metzger leitet Damage Control, jene Behörde, die nach jedem Übermenschenkampf die Trümmer und die zurückgelassene Technik einsammelt.',

  /* ---------- Jean DeWolff ---------- */
  'jean-dewolff': 'Jean DeWolff stammt aus einer Polizistenfamilie, ist Detective beim NYPD und Spider-Mans Verbindung zur Polizei.',

  /* ---------- E.V. ---------- */
  'e-v': 'E.V. ist die künstliche Intelligenz im fünften Spider-Man-Anzug, die Peter Parker nach dem großen Vergessen ohne Stark-Technik selbst gebaut hat.',

  /* ---------- Sara Grey ---------- */
  'sara-grey': 'Sara Grey ist Jeans ältere Schwester, ebenfalls Telepathin, und übernahm nach dem Rauswurf die Rolle, die sonst niemand ausfüllte.',

  /* ---------- Paul Rabin ---------- */
  'paul-rabin': 'Paul Rabin lernte Michelle Jones am MIT kennen und ist bis 2028 ihr fester Freund, ohne von der Gefahr um sie herum etwas zu ahnen.',

  /* ---------- Lonnie Lincoln ---------- */
  'lonnie-lincoln-tombstone': 'Lonnie Lincoln führt eine eigene Bande in New York, hält Schläge aus, die andere umwerfen, und hebt Erwachsene mit ausgestrecktem Arm hoch.',

  /* ---------- Fred Myers ---------- */
  'fred-myers-boomerang': 'Fred Myers stammt aus Australien und trägt seine Wurfbumerangs in einem Anzug mit Halterungen und Schutzvisier bei sich.',

  /* ---------- Anton Miguel Rodriguez ---------- */
  'tarantula': 'Anton Miguel Rodriguez diente in den Streitkräften Delvadias und verkauft seither Kampfkunst, Stacheln und Gift an den Höchstbietenden.',

  /* ---------- Snow ---------- */
  'snow': 'Snow gehört zur Führung der Hand, tritt in rotem Gewand mit Stirnband und Gesichtstuch auf und führt zwei Katanas.',

  /* ---------- Ramrod ---------- */
  'ramrod': 'Ramrod ist ein Mensch, dessen Schultern, Unterarme und Schädeldecke mit Metall verstärkt wurden.',

  /* ---------- Jocasta ---------- */
  'jocasta-angekuendigt': 'Jocasta ist eine künstliche Intelligenz aus dem Umfeld Ultrons, die für VisionQuest angekündigt ist.',

  /* ---------- Scott Summers ---------- */
  'scott-summers-cyclops': 'Scott Summers verschießt aus den Augen einen Energiestrahl, den er nie abschalten kann und den nur seine Visierbrille im Zaum hält.',

  /* ---------- Raven Darkhölme ---------- */
  'raven-darkhoelme-mystique': 'Raven Darkhölme trägt blaue Schuppen und gelbe Augen und verwandelt sich in jeden beliebigen Menschen, samt Stimme, Größe und Fingerabdrücken.',

  /* ---------- Kurt Wagner ---------- */
  'kurt-wagner-nightcrawler': 'Kurt Wagner trat in einem deutschen Zirkus als Kunstspringer auf und setzt sich mit seiner Gabe von einem Ort zum nächsten.',
};

/* Der Satz zu einer Fassung, sonst ein leerer Text. */
function lookNote(file) {
  return FULLSIZE_NOTES[file] || '';
}
