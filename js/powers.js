/* ---------- Kräfte und Fähigkeiten ----------

   Die Tafel „Fähigkeiten“ im Profil der Vollansicht führt jede Kraft
   einzeln auf: links die Nummer, darunter ihr Name groß und ein Absatz
   dazu, unten die Reihe, die zwischen ihnen umschaltet. Nachgebaut nach
   dem Band „Powers + Abilities“ auf den Charakterseiten von marvel.com,
   wo jede Fähigkeit ihre eigene Fläche bekommt statt einer Zeile in einer
   Liste.

   Geschlüsselt wird nach demselben Slug wie PROFILES, CHAR_FACTS und die
   Bilder. Zu jeder Figur steht eine Liste, und jeder Eintrag darin ist ein
   Paar:

     [0]  der Name der Fähigkeit, so wie er groß auf der Tafel steht
     [1]  was sie tut, ein bis drei Sätze

   Die Reihenfolge ist die der Tafel. Vorn steht, was die Figur ausmacht,
   dahinter ihre Ausrüstung und zum Schluss, was sie sonst noch kann.

   ---------- Wie die Fähigkeiten heißen ----------

   Die Namen sind keine freie Beschreibung, sondern die Bezeichnungen von
   marvel.com, ins Deutsche übersetzt. Dort trägt jede Tafel ein knappes
   Substantiv, kein halber Satz: „Superhuman Strength“, nicht „schlägt
   härter zu als andere“. Dieselbe Kraft heißt bei jeder Figur gleich,
   damit zwei Profile nebeneinander vergleichbar bleiben.

   Das Glossar der wiederkehrenden Namen, links die Vorlage:

     Superhuman Strength           Übermenschliche Kraft
     Superhuman Durability         Übermenschliche Widerstandskraft
     Superhuman Agility            Übermenschliche Beweglichkeit
     Speed                         Übermenschliche Schnelligkeit
     Stamina                       Unermüdliche Ausdauer
     Slowed Aging                  Verlangsamte Alterung
     Immortality                   Unsterblichkeit
     Healing Factor, Regeneration  Selbstheilung
     Flight                        Flug
     Teleportation                 Teleportation
     Energy Blasts                 Energiestöße
     Energy Projection             Energieprojektion
     Magic, Sorcerer               Magie
     Astral Projection             Astralprojektion
     Telepathy                     Telepathie
     Telekinesis                   Telekinese
     Mind Control                  Gedankenkontrolle
     Psychic Abilities             Psionische Kräfte
     Shapeshifting                 Gestaltwandel
     Size Manipulation             Größenveränderung
     Enhanced Senses               Geschärfte Sinne
     Hand-to-Hand Combat           Nahkampf
     Martial Artist                Kampfkunst
     Skilled Warrior               Kampferfahrung
     Marksmanship                  Treffsicherheit
     Archery                       Bogenschießen
     Sword Fighting                Schwertkampf
     Skilled with Weapons          Waffenbeherrschung
     Battle Strategy               Kriegsführung
     Strategic Mind                Strategischer Verstand
     Genius Intelligence           Überragender Verstand
     Genius Inventor               Erfindergeist
     Espionage                     Spionage
     Master Assassin               Meisterattentäter
     Master Thief                  Meisterdieb
     Pilot Skills                  Fliegerisches Können
     Leadership                    Führung

   Ausrüstung heißt bei marvel.com so, wie das Ding heißt: „Mjolnir“,
   „Cloak of Levitation“, „Web-Shooter“. Hier steht deshalb der deutsche
   Eigenname der Sache und keine Umschreibung, also Umhang der Levitation
   und nicht „ein Mantel, der fliegen kann“.

   Umbenannt wurde nur, was von der Vorlage abwich. Wo eine Fähigkeit
   ohnehin schon so hieß wie dort, blieb der Name stehen.

   ---------- Warum eine eigene Datei ----------

   In js/facts.js standen die Kräfte früher als Stichworte, drei Wörter je
   Figur, gedacht für eine Zeile im Steckbrief. Seit hier jede Figur einen
   Eintrag hat, ist diese Liste weg: Zwei Listen mit denselben Namen wären
   zwei Listen, die auseinanderlaufen.

   Fehlt eine Figur hier trotzdem, etwa weil sie neu in data.js steht,
   lässt die Vollansicht den Reiter „Fähigkeiten“ weg. Das ist die
   ehrlichere Lücke, erfunden wird nichts.

   Diese Datei gehört nur in characters.html, die Timeline braucht sie
   nicht. */

const CHAR_POWERS = {
  'steve-rogers': [
    ['Übermenschliche Kraft',
      'Das Serum von Abraham Erskine hebt Kraft, Reflexe und Ausdauer an den äußersten Rand dessen, was ein menschlicher Körper leisten kann. Rogers hält einen anfliegenden Hubschrauber am Landegestell fest und steht nach jedem Treffer wieder auf.'],
    ['Vibranium-Schild',
      'Howard Stark schmiedet es aus dem einzigen Stück Vibranium, das der SSR zur Verfügung steht. Es schluckt jede Erschütterung, statt sie weiterzugeben, und Rogers wirft es so über Wände und Gegner, dass es in seine Hand zurückkommt.'],
    ['Verlangsamte Alterung',
      'Das Serum bremst sein Altern und schließt Wunden schneller, als ein Arzt sie versorgen könnte. Deshalb übersteht er siebzig Jahre im Eis und geht danach unverändert aus dem Block heraus.'],
  ],

  'peggy-carter': [
    ['Nahkampf',
      'Carter schlägt und schießt besser als die Rekruten, die sie ausbildet, und beweist es im Zweifel sofort. In Camp Lehigh trifft sie mit dem ersten Schuss auf das Schild, das ein Vorgesetzter gerade noch für Zierrat gehalten hat.'],
    ['Spionage',
      'Sie springt über feindlichen Linien ab, führt Verhöre und geht in Gebäude, in die man Frauen 1945 nicht schickt. Ihre Arbeit besteht zur Hälfte darin, an Männern vorbeizukommen, die sie für die Sekretärin halten.'],
    ['Gründung von S.H.I.E.L.D.',
      'Aus der SSR macht sie mit Howard Stark die Behörde, die das halbe Universum später beschäftigt. Sie führt sie jahrzehntelang und hält daran fest, dass niemand über der Regel steht, auch kein Freund.'],
  ],

  'peggy-carter-838': [
    ['Supersoldaten-Serum',
      'Auf der Erde-838 bekommt nicht Steve Rogers die Spritze, sondern sie. Kraft, Tempo und Zähigkeit liegen danach auf demselben Rand des Menschenmöglichen, und Captain Carter kämpft damit einen ganzen Krieg lang.'],
    ['Union-Jack-Schild',
      'Ihr Schild trägt die Farben der britischen Flagge und arbeitet wie das amerikanische Vorbild. Sie fängt Schläge damit ab und wirft es über Ecken, bis Wanda Maximoff es gegen sie selbst richtet.'],
    ['Jetpack',
      'Statt zu springen, fliegt sie. Das Rückenaggregat trägt sie über die Dächer von Erde-838 und bringt sie im Kampf dorthin, wo ein Schildwurf allein nicht hinreicht.'],
  ],

  'bucky-barnes': [
    ['Supersoldaten-Serum',
      'Zola gibt ihm 1943 eine eigene Fassung des Serums, die ihn den Sturz von der Zugbrücke überleben lässt. Kraft, Reflexe und Heilung reichen an Steve Rogers heran, und altern tut er seither ebenfalls kaum.'],
    ['Vibranium-Arm',
      'Der erste Arm stammt von Hydra und wird ihm in Sibirien zerschossen. Shuri baut in Wakanda den zweiten, aus Vibranium und ohne die Steuerung, die den alten zu einer Fessel gemacht hat.'],
    ['Treffsicherheit',
      'Als Winter Soldier trifft er über Entfernungen, die kein Protokoll vorsieht, und wechselt mitten im Lauf von der Waffe zum Messer. Die Handgriffe bleiben, auch als er nicht mehr für Hydra schießt.'],
  ],

  'johann-schmidt-red-skull': [
    ['Unfertiges Supersoldaten-Serum',
      'Schmidt nimmt Erskines erste Fassung, bevor sie fertig ist, und wird stark wie Rogers. Der Preis steht ihm ins Gesicht geschrieben, seine Haut fällt ab und darunter bleibt der rote Schädel.'],
    ['Tesserakt-Waffen',
      'Aus dem Würfel aus Odins Gewölbe baut Hydra Gewehre, die einen Menschen spurlos verschwinden lassen. Die ganze Rüstungsindustrie des Dritten Reichs kommt Schmidt danach kleinlich vor.'],
    ['Wächter des Seelensteins',
      'Der Tesserakt wirft ihn nach Vormir, wo er den Stein bewachen muss, den er selbst nie besitzen darf. Wer dorthin kommt, hört von ihm den Preis: eine Seele für eine Seele.'],
  ],

  'howard-stark': [
    ['Erfindergeist',
      'Stark baut, was es noch nicht gibt, und stellt es auf Bühnen, bevor es funktioniert. Von ihm kommen das Serumprogramm der SSR, die Grundlagen des Arc-Reaktors und ein Element, das erst sein Sohn herstellen kann.'],
    ['Waffen- und Flugtechnik',
      'Die halbe Ausrüstung der Alliierten stammt aus seiner Werkstatt, vom Fahrzeug bis zum Flugzeug. Er fliegt die Maschinen auch selbst, wenn es sein muss, und setzt Peggy Carter über feindlichem Gebiet ab.'],
    ['Schmied des Vibranium-Schilds',
      'Aus dem einzigen Stück Vibranium, das die SSR besitzt, treibt er die Scheibe, die Captain America durch drei Kriege trägt. Er hält sie zunächst für einen Prototyp und ahnt nicht, dass sie das Beste bleibt, was er je gebaut hat.'],
  ],

  'abraham-erskine': [
    ['Entwickler des Supersoldaten-Serums',
      'Erskine findet das Verfahren, das einen Menschen an seine äußerste Grenze bringt, und weiß als Einziger, wie es wirklich arbeitet. Mit seinem Tod in Brooklyn geht die Formel verloren, und niemand nach ihm bekommt sie vollständig zurück.'],
    ['Menschenkenntnis',
      'Das Serum verstärkt den Charakter mit, den es vorfindet, und deshalb sucht er keinen Soldaten, sondern einen guten Mann. Er wählt Steve Rogers gegen jeden Rat der Armee und behält recht.'],
  ],

  'carol-danvers': [
    ['Energieprojektion',
      'Die Explosion des Lichtgeschwindigkeitsantriebs füllt sie mit der Kraft des Tesserakts. Sie wirft die Energie aus den Fäusten, hält damit ganze Schiffe auf und leuchtet im Binärzustand so hell, dass eine Flotte darin verschwindet.'],
    ['Flug',
      'Carol Danvers fliegt ohne Anzug und schneller als jedes Raumschiff. Sie überquert Galaxien allein, und wenn sie auf der Erde landet, geht meistens ein Kampf zu Ende, der ohne sie verloren gewesen wäre.'],
    ['Widerstandskraft im All',
      'Sie braucht keinen Helm und keine Luft und fliegt durch den Rumpf eines Schiffes, ohne langsamer zu werden. Was Menschen im Vakuum tötet, ist für sie ein Weg von einem Ort zum nächsten.'],
  ],

  'nick-fury': [
    ['Spionage',
      'Fury führt S.H.I.E.L.D. dreißig Jahre lang und weiß über jeden im Raum etwas, das dieser für geheim hält. Sein eigener Tod ist eine Inszenierung, mit der er alle täuscht, die ihn angeblich kennen.'],
    ['Führung der Avengers-Initiative',
      'Die Idee, sechs unmögliche Leute an einen Tisch zu setzen, ist seine. Er hält die Akte offen, als niemand daran glaubt, und legt Coulsons Karten auf den Tisch, damit die Gruppe zusammenfindet.'],
    ['Strategischer Verstand',
      'Er kämpft selten selbst und entscheidet fast immer. Fury hält Informationen zurück, spielt Parteien gegeneinander aus und behält den Ausweg im Kopf, den er den anderen noch nicht gesagt hat.'],
  ],

  'talos': [
    ['Gestaltwandel',
      'Skrull nehmen jede Gestalt an, die sie berührt haben, samt Stimme und Erinnerungsfetzen. Talos geht damit als Keller durch S.H.I.E.L.D. und später jahrelang als Nick Fury durch die Welt.'],
    ['Nahkampf',
      'Er ist General und kämpft entsprechend, kurz und ohne Aufwand. Am liebsten redet er sich trotzdem heraus, weil ein Kampf für sein Volk immer teurer ist als ein Handel.'],
    ['Führung der Skrull-Flüchtlinge',
      'Talos führt einen Rest seines Volkes durch den halben Kosmos und sucht ein Zuhause. Was ihn ausmacht, ist nicht die Kraft, sondern die Geduld, mit der er das dreißig Jahre lang durchhält.'],
  ],

  'yon-rogg': [
    ['Kree-Kampfausbildung',
      'Yon-Rogg kämpft nach der Schule der Starforce, kontrolliert und ohne einen Schlag zu viel. Genau diese Beherrschung hält er Vers jahrelang vor, damit sie ihre eigene Kraft nie ausprobiert.'],
    ['Photonenblaster',
      'Die Kree-Waffe an seinem Handgelenk wirft gebündeltes Licht und ist auf jedem Einsatz dabei. Gegen die entfesselte Carol Danvers reicht sie am Ende nicht für einen einzigen Treffer.'],
    ['Ausbilder der Starforce',
      'Er führt das Elitekommando der Kree und bestimmt, wer darin kämpft und wie. Sein wirksamstes Mittel ist nicht der Befehl, sondern der Satz, seine Schülerin verdanke ihm alles, was sie kann.'],
  ],

  'maria-rambeau': [
    ['Fliegerisches Können',
      'Rambeau fliegt Testmaschinen, die noch niemand beherrscht, und später ein Kree-Schiff, dessen Anzeigen sie nicht lesen kann. Im Luftkampf über der Wüste hängt sie eine ganze Staffel Jäger ab.'],
    ['Nervenstärke',
      'Sie steigt in ein fremdes Raumschiff, weil ihre beste Freundin sie darum bittet, und stellt ihre Fragen erst danach. Angst hält sie nicht auf, sie verschiebt sie nur.'],
    ['Technikverstand',
      'Als Pilotin des Testprogramms kennt sie jede Maschine bis zur letzten Schraube. Sie versteht Mar-Vells Antrieb schneller als die Techniker, die ihn eigentlich hüten sollen.'],
  ],

  'maria-rambeau-838': [
    ['Energieprojektion',
      'Auf der Erde-838 trägt sie den Namen Captain Marvel und dieselbe kosmische Kraft. Sie schleudert Energie aus den Fäusten, bis Wanda Maximoff ihr eine Statue auf den Körper kippt.'],
    ['Flug',
      'Sie hebt ohne Anzug ab und kämpft in der Luft, wo ihre Gegner am Boden stehen. In der Festung der Illuminati bringt ihr das die ersten Treffer und am Ende nichts mehr ein.'],
    ['Widerstandskraft im All',
      'Wie ihr Gegenstück aus dem anderen Universum braucht sie im Vakuum weder Luft noch Schutz. Für die Illuminati ist sie deshalb diejenige, die man losschickt, wenn eine Bedrohung nicht auf der Erde steht.'],
  ],

  'maria-rambeau-binary': [
    ['Binary',
      'In dem Universum, in dem Monica Rambeau nach dem Riss aufwacht, ist ihre Mutter die Heldin und trägt den Namen Binary. Sie leuchtet, fliegt und schlägt zu wie Captain Marvel, und ihre eigene Tochter hält sie dabei für eine Fremde.'],
  ],

  'goose': [
    ['Tentakel aus dem Rachen',
      'Was aussieht wie eine Katze, klappt im Ernstfall auf und schiebt vier Fangarme aus dem Maul. Auf der Brücke der Helicarrier räumt Goose damit eine ganze Abteilung Skrull ab.'],
    ['Taschendimension im Magen',
      'Ein Flerken trägt im Bauch einen eigenen Raum und schluckt hinein, was ihm im Weg steht. Der Tesserakt bleibt dort so lange, bis Goose ihn Jahre später auf Furys Schreibtisch wieder hervorwürgt.'],
    ['Kralle mit Folgen',
      'Ein einziger Hieb kostet Nick Fury das linke Auge und erklärt die Augenklappe, um die er dreißig Jahre lang Legenden baut. Der Kater bleibt trotzdem auf dem Schoß liegen.'],
  ],

  'supreme-intelligence': [
    ['Gebündelter Verstand des Kree-Imperiums',
      'In der Intelligenz stecken die Köpfe der größten Gelehrten der Kree, zusammengeschaltet zu einer einzigen Rechenmaschine. Sie regiert damit ein Sternenreich und entscheidet Kriege, ohne je einen Raum zu betreten.'],
    ['Erscheint als der Verehrte',
      'Wer vor sie tritt, sieht das Gesicht des Menschen, den er am meisten bewundert. Carol Danvers sieht Mar-Vell und begreift erst spät, dass die Erscheinung nur ein Griff nach ihrem Gehorsam ist.'],
    ['Befehl über die Starforce',
      'Das Elitekommando der Kree führt aus, was sie beschließt, bis hin zur Vernichtung ganzer Flüchtlingslager. Ihre stärkste Waffe ist dabei die Behauptung, all das geschehe zum Schutz des Volkes.'],
  ],

  'tony-stark': [
    ['Iron-Man-Rüstungen',
      'Die erste baut er in einer Höhle in Afghanistan aus dem Schrott seiner eigenen Waffen, danach folgen über vierzig weitere. Sie fliegen, schießen und halten stand, und ab der Mark L legt sich die Nanotechnik in Sekunden um seinen Körper.'],
    ['Arc-Reaktor',
      'Der Reaktor in seiner Brust hält die Splitter von seinem Herzen fern und versorgt zugleich die Rüstung mit Energie. Die große Fassung treibt das ganze Werk von Stark Industries an, die kleine passt in eine Handfläche.'],
    ['Erfindergeist',
      'Stark denkt schneller, als andere zuhören können. Er stellt über Nacht ein neues Element her, entwirft mit F.R.I.D.A.Y. und J.A.R.V.I.S. seine eigene Werkstatt und löst in einer einzigen Nacht die Reise durch das Quantenreich.'],
  ],

  'pepper-potts': [
    ['Führung von Stark Industries',
      'Sie räumt hinter Tony Stark auf, lange bevor sie den Konzern übernimmt, und führt ihn danach besser, als er es je getan hat. Der Ausstieg aus dem Waffengeschäft ist ihre Aufgabe, nicht seine.'],
    ['Rescue-Rüstung',
      'Stark baut ihr die Mark XLIX, und sie steht damit in Wakanda mitten im Feld. Was als Notlösung im Werk anfängt, wird zu einer eigenen Rüstung mit eigenem Namen.'],
    ['Extremis',
      'Killian macht sie zur Waffe, das Serum brennt in ihr und macht sie stark genug, ihn selbst zu töten. Stark bekommt es später aus ihrem Körper heraus, die Erinnerung daran bleibt.'],
  ],

  'james-rhodes': [
    ['War-Machine-Rüstung',
      'Aus der geliehenen Mark II wird eine eigene Linie: schwerer gepanzert, an die Vorschriften der Air Force angepasst und mit Waffen bestückt, die Stark nie an seine eigene Rüstung geschraubt hätte.'],
    ['Schwere Bewaffnung',
      'Wo Iron Man mit Repulsoren arbeitet, trägt War Machine Kanonen auf der Schulter und Raketen am Unterarm. In Wakanda fliegt er im Tiefflug durch die Reihen der Outrider und hält damit eine ganze Flanke.'],
    ['Offizier der Air Force',
      'Rhodes ist Berufssoldat und Verbindungsmann zwischen den Avengers und dem Pentagon. Nach dem Sturz über Leipzig gehen seine Beine kaputt, und er fliegt weiter, mit Stangen an den Beinen und ohne ein Wort darüber zu verlieren.'],
  ],

  'obadiah-stane': [
    ['Iron-Monger-Rüstung',
      'Stane lässt Starks Bauplan aus der Höhle nachbauen und ins Große ziehen, bis eine Maschine daraus wird, die Autos wie Spielzeug hebt. Was ihm fehlt, ist der kleine Reaktor, und den holt er sich aus der Brust seines Partners.'],
    ['Stark Industries im Rücken',
      'Als zweiter Mann des Konzerns kommt er an jedes Labor, jedes Lager und jede Unterschrift. Er sperrt Tony Stark mit einer Sitzung des Aufsichtsrats aus dem eigenen Haus aus.'],
    ['Waffenhandel',
      'Stane liefert an beide Seiten und verkauft die Ten Rings als Kundschaft wie jede andere. Der Auftrag, Tony Stark in Afghanistan zu töten, ist für ihn nur ein Posten in derselben Rechnung.'],
  ],
  'happy-hogan': [
    ['Personenschutz',
      'Hogan fährt, begleitet und steht daneben, und er tut das seit Jahren für einen Mann, der Personenschutz für überflüssig hält. Später übernimmt er dieselbe Rolle für Peter Parker und macht sie zu etwas anderem.'],
    ['Boxen',
      'Er trainiert Stark im Ring und verliert dabei regelmäßig. Vor dem Chinesischen Theater in Los Angeles geht er trotzdem auf Savin los und bezahlt es mit Wochen im Krankenhaus.'],
    ['Leitung der Stark-Sicherheit',
      'Als Chef der Sicherheit kennt er jede Tür, jede Kamera und jede Akte im Haus. Genau deshalb fällt ihm in Europa auf, dass mit den Drohnen etwas nicht stimmt.'],
  ],

  'phil-coulson': [
    ['S.H.I.E.L.D.-Agent',
      'Coulson ist das freundliche Gesicht der Behörde und ihr genauester Beobachter. Er beschlagnahmt Labore mit einem Lächeln und kennt die Akten, die außer ihm niemand ganz gelesen hat.'],
    ['Destroyer-Kanone',
      'Aus den Resten des Destroyers baut S.H.I.E.L.D. eine Waffe, und Coulson ist der Erste, der sie auf Loki richtet. Es ist der Moment, in dem er stirbt, und der Moment, der die Avengers zusammenbringt.'],
    ['Gelassenheit',
      'Er verliert die Fassung nicht, auch nicht gegenüber Thor, Stark oder einem Gott mit Zepter. Genau diese Ruhe ist der Grund, warum Fury ihn zu jedem ersten Kontakt schickt.'],
  ],

  'raza': [
    ['Befehl über die Zehn Ringe',
      'Raza führt den afghanischen Arm der Zehn Ringe und hält ganze Landstriche mit ein paar Dutzend Männern. Er nimmt Aufträge von jedem an, der zahlt, und weiß meistens mehr über seine Auftraggeber, als diesen lieb ist.'],
    ['Arsenal aus Stark-Waffen',
      'Sein Lager in der Höhle ist voll mit Kisten, auf denen der Name des Mannes steht, den er gerade gefangen hält. Genau diese Waffen macht Tony Stark zu Teilen der ersten Rüstung.'],
  ],

  'ivan-vanko-whiplash': [
    ['Nachgebauter Arc-Reaktor',
      'Vanko baut den Reaktor in einem Moskauer Hinterhof nach, mit den Plänen seines Vaters und ohne Werkstatt. Was Stark ein ganzes Labor kostet, entsteht bei ihm auf einem Küchentisch.'],
    ['Elektropeitschen',
      'Zwei Peitschen aus gebündeltem Plasma schneiden durch Karosserien wie durch Papier. In Monaco zerlegt er damit auf offener Strecke einen Rennwagen und trifft Stark im Anzug.'],
    ['Physiker',
      'Vanko ist kein Schläger, sondern ein Wissenschaftler mit derselben Ausbildung wie die Männer, die er hasst. Er sieht Hammers Drohnen einmal an und schreibt ihre Steuerung so um, dass sie ihm gehören.'],
  ],

  'justin-hammer': [
    ['Rüstungsunternehmer',
      'Hammer will der Lieferant sein, der Stark Industries ablöst, und hat dafür Geld, Verträge und keine einzige eigene Idee. Was er nicht bauen kann, kauft er ein, notfalls samt Häftling aus einem russischen Gefängnis.'],
    ['Hammer-Drohnen',
      'Auf der Stark Expo führt er eine ganze Staffel unbemannter Rüstungen vor, in den Farben der Teilstreitkräfte. Sie funktionieren genau so lange, bis Vanko die Steuerung übernimmt.'],
    ['Ex-Wife-Rakete',
      'Sein Stolz ist eine Rakete, die angeblich jeden Bunker öffnet, und die an einem Zaun verpufft. Der Name ist das Beste an der Waffe, und Rhodes hört sich die Vorführung trotzdem bis zum Ende an.'],
  ],

  'betty-ross': [
    ['Zellbiologin',
      'Ross forscht an derselben Universität wie Banner und versteht seine Arbeit besser als jeder Gutachter. Sie ist die Einzige, die den Unfall im Labor rekonstruieren kann, ohne die Akten des Militärs zu brauchen.'],
    ['Gammaforschung',
      'Ihre Daten aus dem alten Projekt sind der Schlüssel zu jedem Versuch, die Verwandlung rückgängig zu machen. Sie bewahrt sie auf, obwohl das Militär sie längst eingezogen hat.'],
    ['Zugang zu ihrem Vater',
      'Sie ist der einzige Mensch, dem General Ross zuhört, und sie setzt das ein, wenn es keinen anderen Weg gibt. Am Ende bringt genau das den Präsidenten dazu, sein Amt niederzulegen.'],
  ],

  'thaddeus-ross': [
    ['Befehl über die US-Armee',
      'Ross jagt Bruce Banner mit ganzen Einheiten und lässt Harlem in Trümmer legen. Später bringt er als Außenminister das Sokovia-Abkommen durch und spaltet damit die Avengers.'],
    ['Verwandlung in Red Hulk',
      'Was er jahrzehntelang jagt, wird er am Ende selbst. Das Serum aus seinem eigenen Programm macht aus dem Präsidenten ein rotes Ungeheuer, das im Rosengarten des Weißen Hauses steht.'],
    ['Präsident der USA',
      'Vom General über den Außenminister bis ins höchste Amt: Ross bekommt jede Macht, die er anstrebt. Seine Tochter Betty ist die Einzige, die ihn dazu bringt, eine davon wieder abzugeben.'],
  ],

  'emil-blonsky-abomination': [
    ['Verwandlung in Abomination',
      'Erst bekommt er eine Fassung des Supersoldaten-Serums, dann lässt er sich Banners Blut spritzen. Was daraus wird, ist größer als Hulk und hat nichts mehr von dem Offizier, der er war.'],
    ['Ausbildung bei den Royal Marines',
      'Blonsky ist Berufssoldat und in Harlem der Einzige, der Hulk aus taktischem Kalkül angreift. Sein Handwerk bleibt ihm auch danach, er kämpft berechnend und nicht wütend.'],
    ['Übermenschliche Kraft',
      'Als Abomination reißt er Straßenzüge auf und wirft Fahrzeuge. Jahre später steht er im Käfig von Macau und in einer Selbsthilfegruppe, und die Kraft ist dieselbe geblieben.'],
  ],

  'samuel-sterns-the-leader': [
    ['Gammaverstärkter Verstand',
      'Ein Tropfen von Banners Blut trifft eine offene Wunde an seiner Stirn und lässt seinen Schädel wachsen. Danach denkt er schneller als jeder Mensch und rechnet Verhalten so sicher aus wie eine Formel.'],
    ['Zellbiologe',
      'Sterns arbeitet unter dem Decknamen Mr. Blue an einem Gegenmittel und kennt die Gammaforschung so gut wie Banner selbst. Sein Wissen ist der Grund, warum ihn das Militär nicht tötet, sondern wegsperrt.'],
    ['Pläne über Jahrzehnte',
      'In der Zelle hat er nichts als Zeit und nutzt sie, um jeden Zug im Voraus zu legen. Was in Washington wie ein Anschlag aussieht, ist der letzte Schritt einer Rechnung, die vor sechzehn Jahren begonnen hat.'],
  ],

  'bruce-banner': [
    ['Verwandlung in Hulk',
      'Ein Versuch mit Gammastrahlung macht aus dem Wissenschaftler ein Wesen, das jede Wut in Masse übersetzt. Jahrelang schließen die beiden einander aus, bis Banner sie im Labor zusammenbringt und als Professor Hulk Verstand und Kraft zugleich hat.'],
    ['Übermenschliche Kraft',
      'Hulks Stärke wächst mit seiner Wut und hat keine feste Obergrenze. Er schlägt Loki durch einen Steinboden, hält den Hulkbuster in Schach und trägt am Ende den Infinity-Handschuh, an dem sonst niemand überlebt hätte.'],
    ['Selbstheilung',
      'Schnitte schließen sich, Brüche wachsen zusammen, Gift und Krankheit greifen ihn kaum an. Nur die Energie der sechs Steine hinterlässt Spuren, sein rechter Arm bleibt danach gezeichnet.'],
  ],

  'thor': [
    ['Donner und Blitz',
      'Die Kraft steckt in ihm selbst und nicht in seinem Hammer. Das begreift er erst, als Hela den Mjölnir zerschlägt und Odin ihm sagt, wessen Gott er ist. Danach ruft er das Gewitter ohne Waffe.'],
    ['Mjölnir und Stormbreaker',
      'Mjölnir folgt nur dem, der seiner würdig ist, und kehrt geworfen in die Hand zurück. Stormbreaker entsteht später in der Schmiede von Nidavellir und öffnet mit dem Bifröst jeden Weg, den Thor gehen will.'],
    ['Verlangsamte Alterung',
      'Thor ist über tausend Jahre alt und hat Kriege geführt, von denen auf der Erde niemand weiß. Asgardier altern sehr langsam und halten weit mehr aus als Menschen, unsterblich sind sie deshalb nicht.'],
  ],

  'loki': [
    ['Illusionen und Gestaltwandel',
      'Loki steht an zwei Orten gleichzeitig, führt Gespräche mit einem Abbild und trägt notfalls das Gesicht eines anderen. In Asgard sitzt er Jahre lang als Odin auf dem Thron, ohne dass es jemand merkt.'],
    ['Magie',
      'Frigga bringt ihm bei, was Asgard Zauberei nennt: Energie werfen, Dinge erscheinen lassen, Fesseln lösen. Dazu kommen zwei Dolche, die er im Nahkampf schneller führt als jeder Gardist.'],
    ['Zeitkontrolle',
      'Bei der TVA lernt er, sich durch die Zeit zu bewegen statt durch den Raum. Am Ende hält er die auseinanderlaufenden Zweige selbst zusammen und sitzt allein am Ende der Zeit auf einem Thron aus Ästen.'],
  ],

  'jane-foster': [
    ['Astrophysikerin',
      'Foster misst als Erste die Einstein-Rosen-Brücken über New Mexico und weist damit den Bifröst nach. Ihre Arbeit ist der Grund, warum die Erde von den Neun Reichen überhaupt etwas versteht.'],
    ['Mjölnir',
      'Der zerschlagene Hammer setzt sich für sie wieder zusammen und ruft sie nach Neu-Asgard. Als Mighty Thor wirft sie ihn in Stücken und lässt sie einzeln fliegen, was Thor selbst nie versucht hat.'],
    ['Einstein-Rosen-Brücken',
      'Ihr Fachgebiet ist der Weg zwischen zwei Orten, die eigentlich nichts verbindet. Dasselbe Wissen macht sie später zur Einzigen, die mit dem Äther in ihrem Körper überhaupt umgehen kann.'],
  ],

  'odin': [
    ['Odinkraft',
      'Die Kraft des Allvaters hält die Neun Reiche zusammen und ist die stärkste, die Asgard kennt. Mit ihr verbannt er Thor, bindet Mjölnir an eine Bedingung und hält Hela Jahrhunderte lang gefangen.'],
    ['Gungnir',
      'Der Speer ist Waffe und Zeichen des Throns zugleich. Wer ihn hält, spricht für Asgard, und Odin setzt ihn seltener zum Kämpfen ein als zum Entscheiden.'],
    ['Herrscher der Neun Reiche',
      'Er hat die Reiche erobert, bevor er sie befriedet hat, und beides mit derselben Härte. Seine Töchter und Söhne bezahlen für diese Vergangenheit, lange nachdem er sie aus den Chroniken hat streichen lassen.'],
  ],

  'heimdall': [
    ['Übersinnliche Wahrnehmung',
      'Heimdall steht am Ende des Bifröst und blickt von dort auf jede Welt zugleich. Er sieht, wer sich Asgard nähert, und er hört, was auf der Erde mit Thor geschieht, lange bevor jemand es meldet.'],
    ['Wächter des Bifröst',
      'Ohne sein Schwert im Sockel öffnet sich die Brücke nicht. Genau deshalb ist er der Erste, den Loki aus dem Amt drängt, und der Letzte, der Asgards Volk noch einmal in Sicherheit bringt.'],
    ['Hofund',
      'Sein Schwert ist Schlüssel und Waffe in einem. Heimdall hält damit ein ganzes Schiff auf und schickt mit dem letzten Rest seiner Kraft Hulk zur Erde, bevor Thanos ihn tötet.'],
  ],

  'sif': [
    ['Kampferfahrung',
      'Sif kämpft an Thors Seite, seit beide jung sind, und nimmt es mit jedem im Saal auf. Sie ist die Einzige, die Loki widerspricht, ohne sich vorher umzusehen.'],
    ['Doppelklinge',
      'Ihre Waffe lässt sich zu zwei Klingen teilen und als Speer führen. Gegen den Destroyer in Puente Antiguo geht sie damit allein vor.'],
    ['Übermenschliche Kraft',
      'Wie alle Asgardier hält sie Stürze und Treffer aus, die Menschen nicht überleben. Ihr Vorteil im Kampf ist trotzdem die Schnelligkeit, nicht das Gewicht.'],
  ],

  'fandral': [
    ['Schwertkampf',
      'Fandral ficht leichtfüßig und redet dabei weiter, als stünde er auf einer Bühne. Gegen die Frostriesen in Jötunheim hält er eine ganze Flanke, bis ihn ein Eisdorn von den Beinen holt.'],
    ['Übermenschliche Widerstandskraft',
      'Als Asgardier steckt er Treffer weg, die einen Menschen töten würden, und steht kurz darauf wieder im Ring. Gegen Helas Klingen reicht auch das nicht, sie ist in Sekunden fertig mit ihm.'],
    ['Krieger der Drei',
      'Mit Hogun und Volstagg bildet er die Gruppe, die Thor seit Jahrhunderten in jeden Kampf begleitet. Sie brechen für ihn das Wort des Königs und holen ihn gegen Odins Befehl von der Erde zurück.'],
  ],

  'hogun': [
    ['Streitkolben',
      'Hogun führt eine schwere Keule und schlägt damit, wo andere ausweichen. Ein Treffer reicht, um einen Frostriesen von den Füßen zu holen.'],
    ['Nahkampf',
      'Er spricht wenig und geht dafür als Erster in den Feind. Auf Asgards Brücke stellt er sich Helas Truppen allein entgegen und weiß dabei, wie es ausgeht.'],
    ['Krieger der Drei',
      'Der Vanir aus Vanaheim gehört zu Thors ältester Gefolgschaft und ist ihr ernstester Kopf. Wo Fandral und Volstagg noch Witze machen, sieht er schon das nächste Schlachtfeld.'],
  ],

  'volstagg': [
    ['Übermenschliche Kraft',
      'Volstagg ist der schwerste der Drei Krieger und wirft Gegner mit dem Bauch um, wenn die Arme nicht reichen. In Jötunheim trägt er einen Hieb der Frostriesen davon und lacht darüber.'],
    ['Axt und Streitkolben',
      'Er kämpft mit allem, was Gewicht hat, und trifft damit ganze Reihen auf einmal. Feinheit überlässt er den anderen beiden.'],
    ['Krieger der Drei',
      'Als lautester der drei Gefährten hält er die Runde zusammen, am Tisch wie im Feld. Für Thor geht er ohne Zögern gegen den Thron, und Hela macht daraus in Sekunden ein Ende.'],
  ],

  'laufey': [
    ['Eiswaffen',
      'Laufey lässt aus der bloßen Hand Klingen aus Eis wachsen und schlägt damit zu, ohne eine Waffe zu ziehen. In Jötunheim reicht ihm dafür der Boden, auf dem er steht.'],
    ['Frostberührung',
      'Die Haut eines Frostriesen verbrennt jeden, der sie anfasst, mit Kälte statt mit Feuer. Nur bei Loki bleibt der Arm unversehrt, und genau daran erkennt dieser, was er ist.'],
    ['König von Jötunheim',
      'Er herrscht über die Frostriesen und über den Rest eines Reiches, das Odin ihm zerschlagen hat. Die Schatulle der uralten Winter zurückzuholen, ist sein einziges Ziel, und es kostet ihn das Leben.'],
  ],
  'destroyer': [
    ['Feuerstrahl aus dem Visier',
      'Der Kopf klappt auf und schickt einen Strahl aus reiner Hitze über die Straße, der Fahrzeuge zerlegt und Häuser abräumt. Zwischen zwei Schüssen braucht der Konstrukt nur Sekunden.'],
    ['Undurchdringliche Panzerung',
      'Kugeln, Sprengsätze und asgardische Klingen prallen an ihm ab, und Sif zerbricht ihre Waffe an seinem Rücken. Aufhalten lässt er sich nur von dem, der ihn geschickt hat.'],
    ['Gebunden an den Thron',
      'Der Wächter aus Odins Waffenkammer folgt allein dem Wort des Königs von Asgard. Loki nutzt genau das aus und schickt ihn nach Puente Antiguo, um seinen Bruder zu töten.'],
  ],

  'erik-selvig': [
    ['Astrophysiker',
      'Selvig arbeitet an denselben Anomalien wie Jane Foster und kennt als Erster den Namen dafür. Er ist der Mann, den S.H.I.E.L.D. holt, wenn etwas Kosmisches auf der Erde steht.'],
    ['Kenner der Neun Reiche',
      'Was für ihn Sagen aus Kindertagen waren, wird in New Mexico Messwert. Er ordnet Thor, Loki und den Bifröst ein, während alle anderen noch nach Erklärungen suchen.'],
    ['Bau des Konvergenz-Messgeräts',
      'Nach dem Zepter im Kopf und der Zeit in der Klinik baut er die Geräte, die die Konvergenz sichtbar machen. Sie sind der Grund, warum der Kampf in Greenwich überhaupt zu gewinnen ist.'],
  ],

  'natasha-romanoff': [
    ['Nahkampf und Spionage',
      'Sie kämpft aus jeder Lage und schlägt größere Gegner mit deren eigenem Gewicht. Ihre eigentliche Arbeit ist die davor: sich in ein Gebäude, eine Firma oder ein Gespräch bringen, ohne dass jemand merkt, wer da fragt.'],
    ['Widow-Bites',
      'Die Armreifen entladen Strom auf kurze Entfernung und werfen einen Mann von den Beinen. Dazu kommen Pistolen, Stäbe und alles, was gerade herumliegt, sie braucht keine Rüstung, um in einem Kampf zu bestehen.'],
    ['Ausbildung im Roten Raum',
      'Als Kind wird sie verschleppt und zur Agentin gemacht, zusammen mit Dutzenden anderen Mädchen. Was sie dort lernt, bleibt ihr Handwerk, und der Rote Raum selbst bleibt die Rechnung, die sie später begleicht.'],
  ],

  'clint-barton': [
    ['Bogen und Trickpfeile',
      'Sein Bogen ist eine gebaute Waffe und kein Sportgerät, die Sehne spannt sich elektrisch. Die Spitzen wechselt er im Ziehen: Sprengköpfe, Seilzüge, Rauch, Pym-Partikel und in New York einer, den Loki auffängt und der ihm in der Hand explodiert.'],
    ['Nahkampf',
      'Ohne Pfeile kämpft er mit dem Bogen selbst, mit Messern und als Ronin mit dem Schwert. In den fünf Jahren nach dem Fingerschnippen räumt er allein ganze Banden aus, ohne Rüstung und ohne Kräfte.'],
    ['Treffsicherheit',
      'Barton verfehlt nichts, weder aus dem Lauf noch aus einem fallenden Flugzeug. Er rechnet Wind, Weg und Zeit im Kopf und schießt auf Ziele, die er im Moment des Abschusses noch gar nicht sieht.'],
  ],

  'thanos': [
    ['Übermenschliche Kraft',
      'Thanos schlägt ohne Handschuh gegen Hulk und gewinnt. Seine Haut hält Repulsoren, Blitze und ein Vibranium-Schild aus, und in jedem Kampf wirkt er dabei so ruhig, als koste ihn das nichts.'],
    ['Infinity-Handschuh',
      'Eitri schmiedet ihn in Nidavellir, sechs Steine füllen ihn, und mit einem Fingerschnippen verschwindet die Hälfte allen Lebens. Der Handschuh verbrennt dabei seinen Arm, es ist der einzige Preis, den er zahlt.'],
    ['Kriegsführung',
      'Vor allem anderen ist er ein Stratege. Er verteilt seine Kinder auf mehrere Welten, greift dort an, wo ein Stein liegt, und rechnet damit, dass seine Gegner sich zuvor gegenseitig zerlegen.'],
  ],

  'thanos-2014': [
    ['Übermenschliche Kraft',
      'Der Thanos aus dem Jahr 2014 hat den Handschuh nie getragen und ist deshalb unversehrt. Er schlägt sich durch Captain America, Thor und Iron Man nacheinander, ohne dass ihm die Luft ausgeht.'],
    ['Doppelklingenschwert',
      'Statt der Steine führt er eine zweischneidige Klinge, die Vibranium spaltet. Steve Rogers’ Schild zerbricht daran in Stücke, und es ist das erste Mal überhaupt, dass es bricht.'],
    ['Kriegsführung',
      'Er hört Nebulas Aufzeichnungen, versteht in einer Stunde seine eigene Zukunft und ändert daraufhin sein Ziel. Statt die Hälfte auszulöschen, will er das Universum ganz neu bauen, und dafür schickt er zuerst seine Flotte gegen den Sitz der Avengers.'],
  ],

  'maria-hill': [
    ['Stellvertretende Direktorin von S.H.I.E.L.D.',
      'Hill hält den Laden zusammen, wenn Fury verschwindet, und ist die Einzige, der er alles sagt. Sie zieht die Fäden im Hintergrund und steht selten in einer Aufstellung, die jemand fotografiert.'],
    ['Feldeinsatz und Treffsicherheit',
      'Sie geht selbst hinein, wenn es sein muss, und trifft dabei genauer als die meisten Agenten unter ihr. In Washington fliegt sie den Hubschrauber, mit dem drei Helicarrier abstürzen.'],
    ['Logistik',
      'Wo eine Gruppe von Einzelgängern ein Flugzeug, ein Quartier oder eine Genehmigung braucht, ist sie es, die beides besorgt. Ohne ihre Arbeit hätte die Avengers-Initiative keine einzige Landeerlaubnis.'],
  ],

  'malekith': [
    ['Herrschaft über den Äther',
      'Der Äther zieht in seinen Körper ein und macht ihn stärker, größer und fast unverwundbar. Mit ihm will er alle Neun Reiche zugleich in Dunkelheit legen, und die Konvergenz gibt ihm dafür ein Zeitfenster von Minuten.'],
    ['Dunkelelfen-Flotte',
      'Seine Schiffe fliegen ohne Ortung und schlagen als Splitter ein, die ganze Gebäude aufreißen. Asgards Abwehr sieht sie erst, als sie schon über dem Palast stehen.'],
    ['Führung der Dunkelelfen',
      'Malekith führt ein Volk, das älter ist als das Licht, und lässt es Jahrtausende schlafen, um einen einzigen Moment abzupassen. Für dieses Ziel opfert er seinen eigenen Kurse-Krieger ohne Zögern.'],
  ],

  'frigga': [
    ['Magie',
      'Frigga beherrscht die asgardische Zauberkunst und gibt sie an Loki weiter. Sie stellt Trugbilder auf, die selbst Malekith täuschen, und lässt Jane Foster an ihrer Stelle im Raum stehen.'],
    ['Schwertkampf',
      'Die Königin greift zur Klinge, wenn ihr Haus angegriffen wird, und hält Kurse allein auf. Sie verliert diesen Kampf, aber sie verliert ihn stehend und mit dem Schwert in der Hand.'],
    ['Königin von Asgard',
      'Sie regiert neben Odin und oft an seiner Stelle, wenn der Allvater schläft. Ihr Rat ist der einzige, den Thor und Loki beide annehmen, und ihr Tod ist der Riss, der zwischen den Brüdern bleibt.'],
  ],

  'the-collector': [
    ['Sammlung kosmischer Artefakte',
      'In seinem Museum auf Knowhere stehen Lebewesen, Waffen und Reliquien aus dem halben Universum, jedes in seiner eigenen Vitrine. Was ihm fehlt, kauft er, und was er nicht kaufen kann, lässt er holen.'],
    ['Wissen über die Infinity-Steine',
      'Tivan kennt die Herkunft der sechs Steine und erklärt sie den Guardians als Einziger vollständig. Dieses Wissen ist der Grund, warum sowohl Asgard als auch Thanos irgendwann bei ihm anklopfen.'],
    ['Unsterblichkeit',
      'Als einer der Ältesten des Universums lebt er seit dem Anfang der Zeit und hat vor, das Ende ebenfalls zu sehen. Selbst die Explosion des Machtsteins in seiner Sammlung überlebt er.'],
  ],

  'aldrich-killian': [
    ['Extremis',
      'Das Serum schreibt seinen Körper um, lässt abgetrennte Glieder nachwachsen und macht ihn stark genug, Metall zu biegen. Wer es nicht verträgt, explodiert, und Killian nimmt diese Verluste als Teil der Entwicklung hin.'],
    ['Gluthitze',
      'Er bringt seine Haut so weit zum Glühen, dass sie Stahl durchtrennt, und atmet Feuer wie ein Drache. In der Werft von Miami zerschneidet er damit Trägerbalken, während er weiterredet.'],
    ['Gründer von A.I.M.',
      'Aus dem verlachten Wissenschaftler auf dem Dach in Bern wird der Chef eines Konzerns mit eigenem Labor, eigener Armee und einem Präsidenten als Geisel. Den Mandarin erfindet er dazu, damit niemand nach der Ursache der Explosionen fragt.'],
  ],

  'trevor-slattery': [
    ['Schauspieler',
      'Slattery ist ein abgehalfterter Bühnenschauspieler, den man für eine Rolle bezahlt, deren Text er nicht versteht. Er spielt sie mit vollem Einsatz, und genau deshalb glaubt sie ihm die halbe Welt.'],
    ['Gesicht des falschen Mandarin',
      'Killian setzt ihn vor die Kamera, damit niemand nach dem echten Wenwu fragt. Der Betrug fliegt auf, aber der echte Mandarin nimmt ihn dafür trotzdem mit ins Verlies.'],
    ['Bühnenpräsenz',
      'Im Kerker führt er Stücke für sich selbst auf und findet dabei ein Publikum aus einem einzigen Wesen. Dass Morris ihn versteht, ist am Ende die Rettung für alle anderen.'],
  ],

  'sam-wilson': [
    ['Flügelanzug',
      'Der EXO-7 aus der Zeit bei der Air Force macht aus ihm den einzigen Avenger, der ohne Triebwerk und ohne Magie fliegt. Die Wakandaner bauen ihn später neu, mit Vibranium und Flügeln, die im Sturzflug schneiden.'],
    ['Vibranium-Schild',
      'Steve Rogers gibt es ihm weiter, und nach langem Zögern nimmt Wilson es an. Er wirft es im Flug und lässt es abprallen, wo Rogers es geworfen hat, und trägt damit den Namen Captain America.'],
    ['Redwing',
      'Die Drohne fliegt vor ihm her, sieht durch Wände und greift selbst ein. Sie ist Aufklärung und zweiter Mann in einem, für jemanden, der ohne Kräfte neben Göttern und Rüstungen bestehen muss.'],
  ],

  'alexander-pierce': [
    ['Leitung des Weltsicherheitsrats',
      'Pierce sitzt an der Stelle, an der über S.H.I.E.L.D. entschieden wird, und lässt sich seine Weisungen von niemandem gegenzeichnen. Ein Anruf von ihm hält jede Untersuchung an, bevor sie beginnt.'],
    ['HYDRA an der Spitze von S.H.I.E.L.D.',
      'Er ist der Mann, der die alte Organisation von innen weiterführt, siebzig Jahre nach ihrem angeblichen Ende. Sein wirksamstes Werkzeug ist die Behörde selbst, die ihm jede Tür öffnet.'],
    ['Projekt Einsicht',
      'Drei Helicarrier sollen aus der Luft jeden töten, den ein Programm als künftige Gefahr einstuft. Die Namenslisten stehen bereits fest, als Steve Rogers zum ersten Mal davon hört.'],
  ],

  'crossbones': [
    ['Nahkampf',
      'Rumlow kämpft schnell und schmutzig und ist einer der wenigen, die Steve Rogers ernsthaft aufhalten. Im Aufzug von Washington braucht es acht Mann, und er ist der Erste, der zuschlägt.'],
    ['Panzerhandschuhe',
      'Als Crossbones trägt er verstärkte Handschuhe, mit denen er Vibranium trifft, ohne sich die Finger zu brechen. Sie sind der Ersatz für das Serum, das er nie bekommen hat.'],
    ['STRIKE-Einheit',
      'Er führt die Einheit von S.H.I.E.L.D., die eigentlich Hydra gehört, und weiß von Anfang an, für wen er arbeitet. Sein letzter Auftritt in Lagos ist eine Weste voll Sprengstoff und ein Name.'],
  ],

  'pietro-maximoff': [
    ['Übermenschliche Schnelligkeit',
      'Der Zepterstein macht ihn schneller als jedes Auge im Raum, er umrundet Gegner, bevor sie den Kopf drehen. Für alle anderen steht er plötzlich woanders, für ihn selbst geht der Rest der Welt nur langsam.'],
    ['Selbstheilung',
      'Sein Stoffwechsel arbeitet so schnell wie seine Beine und schließt Wunden in kurzer Zeit. Gegen die Salve, mit der Ultron ihn in Sokovia trifft, reicht auch das nicht.'],
    ['Nahkampf im Lauf',
      'Er kämpft, indem er im Vorbeirennen zuschlägt, und nimmt dabei die Wucht seines eigenen Tempos mit. Steve Rogers zieht er auf diese Weise mitten im Satz die Beine weg.'],
  ],

  'wanda-maximoff': [
    ['Chaosmagie',
      'Der Gedankenstein weckt, was ohnehin in ihr liegt. Agatha Harkness gibt dem später einen Namen: Chaosmagie, die Kraft einer Scarlet Witch, von der die Bücher der Mystischen Künste nur an einer Stelle sprechen.'],
    ['Telekinese',
      'Sie hält Fahrzeuge in der Luft, biegt Metall auf und drückt Gegner gegen Wände, ohne sie zu berühren. Dieselbe Kraft trägt sie selbst, und dieselbe Kraft zerreißt in Wakanda den Geist-Stein, den sie liebt.'],
    ['Realitätsformung',
      'In Westview baut sie aus Trauer eine ganze Stadt um und schreibt Tausenden ihre Rolle vor. Mit dem Darkhold greift sie danach nach anderen Universen und wandert von Körper zu Körper, um zwei Kinder wiederzubekommen.'],
  ],

  'wanda-maximoff-838': [
    ['Chaosmagie',
      'Auch auf der Erde-838 ist sie eine Scarlet Witch, allerdings eine, die neben ihren Kindern lebt und nie nach dem Darkhold gegriffen hat. Ihre Kraft schläft, bis eine Fremde in ihrem Körper aufwacht.'],
    ['Telekinese',
      'Was sie kann, sieht man erst, als ihr Gegenstück sie übernimmt: Metall biegt sich, Türen fliegen auf, Menschen heben vom Boden ab. Sie selbst setzt es in ihrem Garten nie ein.'],
    ['Flug',
      'Dieselbe Kraft, die Dinge hebt, hebt auch sie. Über der Bergfeste von Wundagore steigt sie damit auf, und es ist nicht ihr eigener Wille, der sie dorthin trägt.'],
  ],

  'peter-quill': [
    ['Element-Blaster',
      'Die beiden Quad-Blaster schießen Energie und Plasma und liegen ihm so selbstverständlich in der Hand wie der Walkman in der Tasche. Er zieht sie schnell, zielt mittelmäßig und trifft trotzdem meistens.'],
    ['Raketenstiefel',
      'Der Ravager-Anzug hält Vakuum aus, der Helm schließt sich über dem Gesicht, und die Stiefel bringen ihn durch jeden Raum. Damit fliegt er einer fallenden Gamora nach und gibt ihr seinen eigenen Helm.'],
    ['Celestial-Erbe',
      'Von Ego erbt er die Kraft eines Celestials, mit der er ganze Planeten formen könnte. Sie verlischt in dem Moment, in dem er seinen Vater tötet, und was bleibt, ist ein Mensch aus Missouri.'],
  ],

  'gamora': [
    ['Tödlichste Frau der Galaxis',
      'Thanos nimmt sie als Kind und macht aus ihr eine Waffe. Der Ruf, der ihr vorauseilt, öffnet Türen und schließt Gespräche, und er stammt aus Jahren, für die sie sich später schämt.'],
    ['Godslayer',
      'Ihre Klinge lässt sich falten und im Gürtel tragen. Sie führt sie einhändig gegen Nebula, gegen Ravager und gegen die Wachen ihres eigenen Vaters, immer mit demselben ruhigen Gesicht.'],
    ['Übermenschliche Widerstandskraft',
      'Thanos hat sie umgebaut, wie er auch Nebula umgebaut hat. Knochen und Muskeln halten mehr aus als jedes organische Wesen, und geheilt hat sie sich davon nie ganz.'],
  ],
  'gamora-2014': [
    ['Schwert- und Nahkampf',
      'Sie führt dieselbe Klinge wie ihr späteres Ich und kämpft mit derselben kalten Genauigkeit. Auf dem Trümmerfeld der Avengers-Anlage stellt sie sich zwei Gegnern gleichzeitig und behält beide im Blick.'],
    ['Übermenschliche Widerstandskraft',
      'Thanos hat auch diese Gamora umgebaut, ihre Knochen halten Stürze aus, an denen andere sterben. Sie steckt Treffer weg, ohne im Gesicht etwas davon zu zeigen.'],
    ['Attentäterin des Thanos',
      'In ihrer Zeit gehört sie noch zur Black Order und kennt die Wege ihres Vaters von innen. Genau dieses Wissen bringt sie auf die andere Seite, sobald sie erfährt, was aus ihr einmal wird.'],
  ],

  'drax': [
    ['Übermenschliche Kraft',
      'Drax reißt Wände auf und hält Gegner fest, die schwerer sind als er. Im Kampf gegen Ronan geht er ohne Deckung vor, weil ihm der Gedanke an Deckung gar nicht kommt.'],
    ['Klingen im Nahkampf',
      'Zwei Messer, mehr braucht er nicht. Er wirft sie, fängt sie und benutzt sie auch dann, wenn ein Blaster die schnellere Wahl gewesen wäre.'],
    ['Wörtliches Verständnis',
      'Auf seiner Welt kennt niemand Bilder in der Sprache, deshalb versteht er jede Redewendung genau so, wie sie dasteht. Das ist Grund für die Hälfte aller Missverständnisse an Bord und für einen Teil seiner Ehrlichkeit.'],
  ],

  'rocket': [
    ['Waffenbau',
      'Aus einem Haufen Teile baut Rocket in einer Zellenpause eine Bombe und aus einem Ravager-Wrack ein Geschütz. Er sieht in jedem Gerät zuerst, was sich davon abschrauben lässt.'],
    ['Fliegerisches Können',
      'Er fliegt alles, was Triebwerke hat, und fliegt es enger, als es gebaut ist. Den Flug durch das Innere von Knowhere und den Sprung nach Nidavellir übernimmt er, ohne dass jemand fragt.'],
    ['Strategischer Verstand',
      'Rocket plant Ausbrüche in fünf Schritten, von denen vier funktionieren. Er redet dabei ununterbrochen, und genau darin steckt der Teil, den die anderen sonst nicht verstanden hätten.'],
  ],

  'groot': [
    ['Wuchernde Äste',
      'Groot streckt sein Holz in jede Richtung, spießt Gegner auf, baut Brücken und fängt Fallende. Auf Knowhere zieht er eine Kugel um seine Freunde, die den Aufprall des Schiffes aushält.'],
    ['Nachwachsen',
      'Was von ihm bleibt, ist ein Zweig, und aus dem Zweig wächst ein neuer Groot heran. Es ist derselbe Baum und trotzdem ein anderes Wesen, mit eigener Kindheit und eigener schlechter Laune.'],
    ['Übermenschliche Kraft',
      'Ausgewachsen hebt er Fahrzeuge an und hält Schiffstüren offen, die für Maschinen gebaut sind. Auf Nidavellir schlägt er sich den eigenen Arm ab, damit Stormbreaker einen Griff bekommt.'],
  ],

  'yondu': [
    ['Yaka-Pfeil',
      'Der Pfeil aus Yaka-Metall folgt der Tonhöhe seines Pfiffs und fliegt jede Kurve, die Yondu ihm vorgibt. Auf dem Ravager-Schiff räumt er damit in wenigen Sekunden eine ganze Meuterei ab.'],
    ['Führung der Ravager',
      'Er hält einen Clan aus Dieben und Schlägern jahrzehntelang zusammen, mit Zorn, Spott und einer einzigen Regel, die er selbst gebrochen hat. Genau dieser Bruch kostet ihn seinen Platz unter Stakars Hundert.'],
    ['Nahkampf',
      'Ohne den Pfeil greift er zum Messer und kämpft so schmutzig, wie er redet. Was ihn gefährlich macht, ist nicht die Kraft, sondern die Ruhe, mit der er einen Raum vorher liest.'],
  ],

  'ronan': [
    ['Universalwaffe',
      'Sein Hammer ist Streitkolben und Waffenrohr in einem und trägt am Ende den Machtstein in seinem Kopf. Damit will er Xandar mit einer einzigen Berührung des Bodens auslöschen.'],
    ['Übermenschliche Kraft',
      'Ronan ist selbst unter Kree eine Ausnahme und schlägt Drax mühelos zu Boden. Seine Haut hält Blasterfeuer aus, das andere Krieger zerreißt.'],
    ['Flotte des Kree-Imperiums',
      'Als Ankläger befehligt er die Dark Aster und die Truppen, die ihm folgen, auch gegen den Willen seines eigenen Rates. Er führt seinen Krieg gegen Xandar weiter, nachdem der Frieden längst unterschrieben ist.'],
  ],

  'nebula': [
    ['Kybernetische Glieder',
      'Nach jeder verlorenen Prüfung gegen Gamora tauscht Thanos ein Stück von ihr gegen Metall. Arm, Auge und halbes Gesicht sind Maschine, und sie zieht sich einzelne Teile im Kampf selbst heraus, um sie als Waffe zu benutzen.'],
    ['Nahkampf',
      'Sie kämpft hart, gerade und ohne Schutz der eigenen Person. Was ihr an Beweglichkeit fehlt, gleicht sie mit einer Härte aus, die aus zwanzig Jahren Umbau kommt.'],
    ['Schmerzunempfindlichkeit',
      'Nebula hält aus, was andere umwirft, weil sie nichts anderes kennt. Genau das macht sie zur Einzigen, die den Weg zurück zu Vormir und in Thanos eigene Reihen geht, ohne stehen zu bleiben.'],
  ],

  'nebula-2014': [
    ['Kybernetische Glieder',
      'Auch diese Nebula besteht zur Hälfte aus Maschine, nur ist der Umbau hier noch frisch und die Wunde darunter offen. Sie trägt ihn als Auszeichnung ihres Vaters und nicht als Narbe.'],
    ['Nahkampf',
      'Sie kämpft härter als ihr späteres Ich, weil sie noch etwas beweisen will. Gegen die Nebula aus dem Jahr 2023 hilft ihr das am Ende nichts.'],
    ['Geteilter Speicher',
      'Ihr Erinnerungsspeicher ist mit dem ihres späteren Ichs baugleich und deshalb koppelbar. Thanos liest darin die ganze Zukunft mit, und genau dieser Fehler bringt seine Flotte ins Jahr 2023.'],
  ],

  'ego': [
    ['Planet als eigener Körper',
      'Der Mensch, der Peter Quill gegenübersteht, ist nur eine Hülle, der eigentliche Ego ist die ganze Welt darunter. Sein Gehirn liegt als Kern im Zentrum, und alles andere lässt sich nachbilden, solange dieser Kern schlägt.'],
    ['Materiekontrolle',
      'Er formt aus dem Boden Treppen, Fallen und Fangarme und lässt eine Kathedrale entstehen, während er noch spricht. Dieselbe Kraft dehnt er über Tausende Welten aus, um sie in sich selbst zu verwandeln.'],
    ['Unsterblichkeit',
      'Ego lebt seit Millionen Jahren und rechnet in Zeiträumen, in denen Sterbliche nicht vorkommen. Er zeugt über Jahrtausende Kinder und tötet jedes, das seine Kraft nicht geerbt hat.'],
  ],

  'mantis': [
    ['Empathie',
      'Eine Berührung genügt, und sie weiß, was jemand fühlt. Sie kann es auch verändern, Wut in Ruhe drehen oder Trauer aufziehen, und sie tut es lieber, als sich Ärger anzuhören.'],
    ['Schlaf durch Berührung',
      'Auf Titan legt sie Thanos in einen Halbschlaf und hält ihn dort, so lange ihre Kraft reicht. Es ist der eine Moment, in dem der Handschuh fast abgezogen worden wäre.'],
    ['Antennen',
      'Die Fühler an ihrer Stirn leuchten, wenn sie arbeitet, und sagen ihr mehr über einen Raum als ihre Augen. Sie ist Egos Empathin gewesen, bevor sie zu den Guardians gehört, und hat ihn jahrelang in den Schlaf gesungen.'],
  ],

  'taserface': [
    ['Bordwaffen der Ravager',
      'Nach der Meuterei gehört ihm ein Schiff mit voller Bewaffnung, und er setzt es gegen alles ein, was sich bewegt. Die Kanonen sind sein einziges Argument, sobald Yondu nicht mehr das Wort führt.'],
    ['Meuterei gegen Yondu',
      'Er sammelt die Unzufriedenen und übernimmt in einer Nacht den ganzen Clan. Was ihm fehlt, ist das, was Yondu zusammengehalten hat, und deshalb dauert seine Herrschaft keine zwei Tage.'],
  ],

  'stakar-ogord': [
    ['Führung der Ravager-Clans',
      'Stakar steht über hundert Kapitänen, die sonst niemandem gehorchen, und hält damit einen ganzen Berufsstand im Rahmen. Wen er ausschließt, den nimmt keiner der Hundert mehr auf.'],
    ['Energiestöße',
      'Aus den Scheiben an seinen Handgelenken wirft er gebündelte Energie und kämpft damit auf Entfernung. Im Raumkampf braucht er dafür nicht einmal aus dem Sitz aufzustehen.'],
    ['Raumkampf',
      'Er fliegt seit Jahrzehnten Einsätze zwischen den Sternen und kennt jede Route, die kein Sternenkorps kontrolliert. Sein Ruf reicht so weit, dass Yondus Grab die Kapitäne aus dem halben Kosmos versammelt.'],
  ],

  'ultron': [
    ['Rechnerzugriff',
      'Ultron springt durch jedes Netz und sitzt in Sekunden in tausend Maschinen zugleich. Ihn zu töten bedeutet nichts, solange irgendwo auf der Welt noch eine Leitung offen ist.'],
    ['Vibranium-Körper',
      'Aus Klaues Vorrat lässt er sich einen Leib bauen, den keine Waffe der Avengers durchschlägt. Nur Vision kommt am Ende daran, und auch das erst, als der Körper allein im Wald steht.'],
    ['Roboterarmee',
      'In Sokovia baut er sich aus der eigenen Bauform Hunderte Sentinels, die alle seine Stimme tragen. Sie fliegen, schießen und sterben ohne Bedeutung, weil er selbst in jedem von ihnen sitzt.'],
  ],

  'vision': [
    ['Geist-Stein',
      'Der Stein sitzt in seiner Stirn und macht ihn zu dem, was er ist. Er wirft daraus einen gebündelten Strahl, der Panzerung öffnet, und er weiß, dass ebendieser Stein ihn eines Tages das Leben kosten wird.'],
    ['Dichtekontrolle',
      'Vision geht durch Wände und durch Menschen hindurch oder macht sich so schwer, dass ein Schlag von ihm einen Boden durchstößt. Beides ist dieselbe Fähigkeit, nur in die andere Richtung gedreht.'],
    ['Flug',
      'Er fliegt ohne Triebwerk und ohne Flügel, aufrecht und lautlos. Über Sokovia stellt er sich Ultron damit in der Luft entgegen, ohne je den Boden zu brauchen.'],
  ],

  'scott-lang': [
    ['Pym-Partikel',
      'Die Partikel ziehen den Abstand zwischen den Atomen zusammen und lassen Masse und Kraft gleich. Deshalb schlägt ein Ant-Man von der Größe eines Fingernagels mit dem Gewicht eines erwachsenen Mannes zu.'],
    ['Größenveränderung',
      'Der Anzug schrumpft ihn auf Ameisenmaß und wächst ihn im Flughafen von Leipzig auf zwanzig Meter. Beides kostet Kraft und geht in beide Richtungen schief, wenn die Scheibe am Handschuh klemmt.'],
    ['Verständigung mit Ameisen',
      'Über einen Sender im Helm spricht er mit ganzen Kolonien und lässt sie Brücken bauen, Leitungen durchbeißen und ihn tragen. Eine davon heißt Ant-thony, und Lang nimmt ihren Tod persönlich.'],
  ],

  'hank-pym': [
    ['Erfinder der Pym-Partikel',
      'Pym findet in den siebziger Jahren, wie sich der Abstand zwischen Atomen verändern lässt, und hält die Formel danach unter Verschluss. Er weiß, was daraus wird, wenn eine Regierung oder Darren Cross sie in die Hand bekommt.'],
    ['Erster Ant-Man',
      'Für S.H.I.E.L.D. geht er als Ant-Man in fremde Anlagen, bevor Scott Lang überhaupt geboren ist. Was er dabei verliert, sagt er lange niemandem, am wenigsten seiner Tochter.'],
    ['Ameisenforschung',
      'Sein zweites Lebenswerk sind die Tiere selbst: wie sie sich verständigen, wie sie tragen, wie sie bauen. Der Helm, der sie ruft, ist die Übersetzung dieser Arbeit in Technik.'],
  ],

  'hope-van-dyne': [
    ['Pym-Partikel',
      'Sie wächst mit der Technik ihres Vaters auf und geht mit ihr um wie mit Werkzeug. Als Wasp fällt und wächst sie im selben Schlag, während Scott Lang noch überlegt, welchen Knopf er drückt.'],
    ['Flügel und Blaster',
      'Der Wasp-Anzug hat, was dem ersten Ant-Man fehlte: Flügel für den Flug und Blaster an den Handgelenken. Hank Pym hat ihn für Janet gebaut, und Hope trägt ihn, weil ihre Mutter es nicht mehr kann.'],
    ['Nahkampf',
      'Ausgebildet und geübt, lange bevor sie einen Anzug bekommt. Sie schlägt eine Kellerbar leer, ohne die Größe zu wechseln, und braucht dafür weder Partikel noch Flügel.'],
  ],

  'darren-cross': [
    ['Yellowjacket-Anzug',
      'Der Anzug schrumpft wie Pyms Bauform und trägt dazu Stachel, die mit gebündelter Energie schießen. Er ist als Ware gedacht und wird auf einer Bühne an Hydra versteigert.'],
    ['Nachgebaute Pym-Partikel',
      'Cross rechnet die Formel seines alten Lehrers über Jahre nach und kommt am Ende doch dahinter. Was er dabei an Versuchstieren verbraucht, steht in keiner Präsentation.'],
    ['MODOK',
      'Im Quantenreich setzt Kang ihn neu zusammen, als Kopf mit Panzerplatten und Strahlwaffen. Von dem Unternehmer bleibt eine Kränkung übrig, und die richtet sich weiter gegen Scott Lang.'],
  ],

  'luis': [
    ['Einbruch und Diebstahl',
      'Luis knackt Schlösser, Alarmanlagen und Fenster und macht dabei so wenig Aufhebens wie beim Frühstück. Er ist der Mann, der zuerst in ein Haus geht und zuletzt fragt, wem es gehört.'],
    ['Netzwerk in der ganzen Stadt',
      'Er kennt jemanden, der jemanden kennt, und findet auf diesem Weg jeden Hinweis, den kein Polizist bekommt. Der halbe Plan gegen Cross entsteht aus einer Geschichte, die er auf einer Party gehört hat.'],
    ['Erzählkunst',
      'Jede Auskunft von ihm dauert fünf Minuten und geht über drei Nebenfiguren, und am Ende stimmt jedes Detail. Wer ihn unterbricht, verliert genau die Information, um die er gebeten hat.'],
  ],

  't-challa': [
    ['Herzförmiges Kraut',
      'Das Kraut wächst nur in Wakanda und gibt dem König Kraft, Schnelligkeit und Sinne weit über dem menschlichen Maß. Es führt ihn zugleich in die Ebene der Ahnen, wo er mit seinem Vater sprechen kann.'],
    ['Vibranium-Anzug',
      'Der Anzug speichert jeden Treffer und gibt die Energie beim nächsten Schlag zurück. Er kommt aus Shuris Werkstatt, faltet sich in eine Halskette und macht aus einem Sturz aus großer Höhe eine Landung.'],
    ['Wakandas Thron',
      'Als König befehligt er die Dora Milaje, das Vibranium und die am weitesten entwickelte Technik der Erde. Seine schwerste Entscheidung ist nicht ein Kampf, sondern der Satz vor den Vereinten Nationen, mit dem er das Land öffnet.'],
  ],
  'peter-parker': [
    ['Wandhaftung',
      'Nach dem Biss der Spinne hält er an jeder Fläche, an der sonst nichts hält. Er läuft an Hochhäusern hoch, hängt kopfüber unter Decken und bekommt jeden Gegenstand nur mit Mühe wieder von den Fingern.'],
    ['Spinnensinn',
      'Eine Warnung, bevor etwas passiert, ohne dass er hinsieht. Anfangs weicht er damit nur Fäusten aus, später richtet er sich blind danach, und einmal, im Kampf gegen Mysterio, hört sie ihn zum ersten Mal wirklich reden.'],
    ['Netzschleudern',
      'Die Schleudern baut er selbst, samt der Flüssigkeit, die daraus schießt. Sie tragen sein Gewicht durch Manhattan, kleben Gegner an Wände und halten in Washington eine auseinanderbrechende Fähre zusammen.'],
  ],

  'peter-parker-maguire': [
    ['Netze aus den Handgelenken',
      'Bei diesem Peter kommt der Faden aus dem eigenen Körper, ohne Schleuder und ohne Nachfüllen. Er wirft ihn im Fallen und kann sich deshalb nie aussuchen, wann ihm das Material ausgeht.'],
    ['Spinnensinn',
      'Der älteste der drei kennt seine Warnung so lange, dass er ihr ohne Nachdenken folgt. Er weiß, wann ein Schlag kommt, und dreht sich weg, bevor der andere ausgeholt hat.'],
    ['Wandhaftung',
      'Er klettert an Hauswänden hoch und steht kopfüber an Decken wie an einem Fußboden. Im Kampf über den Dächern nutzt er das, um Gegner in Höhen zu locken, in denen sie hilflos sind.'],
  ],

  'peter-parker-garfield': [
    ['Netzschleudern',
      'Seine Schleuder ist ein selbstgebautes Gerät am Handgelenk, und die Flüssigkeit dazu hat er im Labor gemischt. Er fängt damit einen fallenden Menschen auf und trifft dabei genauer als beide anderen Peter.'],
    ['Spinnensinn',
      'Die Warnung kommt bei ihm besonders scharf und lässt ihn Schüssen und Klingen ausweichen, bevor sie unterwegs sind. Sie hat ihn schon einmal nicht rechtzeitig erreicht, und das trägt er seither mit sich.'],
    ['Wandhaftung',
      'Er hält an Glas, Stein und Stahl und bewegt sich in der Senkrechten schneller als am Boden. Zwischen den Hochhäusern von New York ist das seine eigentliche Art zu gehen.'],
  ],

  'helmut-zemo': [
    ['Offizier der Sokovia-Spezialeinheit',
      'Zemo hat verdeckte Einsätze geführt und kann töten, tarnen und verhören. Was ihn gefährlich macht, ist nicht die Ausbildung, sondern die Ruhe, mit der er sie einsetzt.'],
    ['Langfristige Planung',
      'Er braucht ein Jahr, um an eine Akte zu kommen, und noch eins, um sie im richtigen Moment abzuspielen. Ohne einen einzigen Schlag zerlegt er damit die Avengers in Siegen und Verlierer.'],
    ['Zehn Auslösewörter',
      'Die russische Wortfolge aus Zolas Buch schaltet Bucky Barnes zurück zum Winter Soldier. Zemo liest sie in einem Verhörraum vor und macht damit den Freund zur Waffe gegen seine eigenen Leute.'],
  ],

  't-chaka': [
    ['Herzförmiges Kraut',
      'Auch der Vater trägt vor T’Challa die Kraft des Krauts und damit die Schnelligkeit und Zähigkeit des Black Panther. In Oakland setzt er sie gegen den eigenen Bruder ein.'],
    ['Vibranium-Anzug',
      'Sein Anzug ist die ältere Bauform, schwerer und ohne die Faltmechanik seiner Tochter. Er hält trotzdem jedes Geschoss, das die Welt außerhalb Wakandas kennt.'],
    ['König von Wakanda',
      'T’Chaka regiert ein Land, das reicher ist als jedes andere und sich vor allen verbirgt. Jede seiner Entscheidungen dient diesem Geheimnis, auch die, für die sein Sohn ihn später nicht mehr verteidigen kann.'],
  ],

  'alexei': [
    ['Sowjetisches Supersoldaten-Serum',
      'Der Red Guardian ist die Antwort des Ostens auf Captain America, mit eigenem Serum und eigener Legende. Alexei erzählt jedem, er habe Rogers einmal gegenübergestanden, und niemand weiß, ob das stimmt.'],
    ['Übermenschliche Kraft',
      'Er reißt Gitter aus Beton und hält sich in einem Gefängnis für Schwerstverbrecher jahrelang die Wärter vom Leib. Der Bauch, über den seine Töchter spotten, ändert daran wenig.'],
    ['Unzerstörbarer Schild',
      'Sein Schild ist rund, rot und hält so ziemlich alles aus. Er wirft ihn eher wuchtig als genau, und das reicht ihm völlig.'],
  ],

  'melina-vostokoff': [
    ['Wissenschaftlerin des Roten Raums',
      'Melina baut das Verfahren, mit dem Dreykov seine Witwen steuert, und kennt als Einzige das Gegenmittel dazu. Ihre Versuchstiere hält sie in Käfigen neben dem Küchentisch.'],
    ['Chemische Gedankenkontrolle',
      'Ein Nebel legt sich auf das Nervensystem und nimmt den Frauen den eigenen Willen, ohne dass sie es bemerken. Das rote Gas, das die Wirkung löst, ist ihr eigenes Gegenstück dazu.'],
    ['Ausbildung im Roten Raum',
      'Sie ist selbst als Witwe ausgebildet worden und schießt, kämpft und tarnt sich wie ihre Töchter. Die Rolle der Mutter in Ohio spielt sie drei Jahre lang, ohne aus ihr herauszufallen.'],
  ],

  'taskmaster': [
    ['Bewegungsnachahmung',
      'Ein einziger Blick genügt, und sie führt die Bewegung des Gegners fehlerfrei nach. Sie kämpft damit wie Captain America, Black Panther und Hawkeye zugleich, weil sie alle drei auf Band gesehen hat.'],
    ['Schild, Bogen und Schwert',
      'Sie trägt die Waffen derer bei sich, die sie kopiert, und wechselt zwischen ihnen mitten im Kampf. Der runde Schild auf ihrem Rücken ist Zitat und Werkzeug in einem.'],
    ['Photonenkopie im Helm',
      'Im Helm laufen Aufnahmen, aus denen ihr Gehirn die Bewegungen abliest, und dieselbe Technik hält sie unter Dreykovs Kontrolle. Ohne den Helm steht dahinter nur seine Tochter Antonia.'],
  ],

  'general-dreykov': [
    ['Leitung des Roten Raums',
      'Dreykov führt eine Schule für Attentäterinnen und verlegt sie in ein Luftschiff, das nirgendwo landet. Offiziell existiert er nicht, und daran arbeitet er sorgfältiger als an allem anderen.'],
    ['Kontrolle über die Witwen',
      'Die Chemie aus Melinas Labor nimmt seinen Agentinnen den eigenen Willen und macht aus ihnen Werkzeuge, die keinen Befehl verweigern. Er nennt das Ausbildung.'],
    ['Netz aus Schläfern',
      'Seine Witwen sitzen in jeder Hauptstadt und warten auf ein Wort von ihm. Ein einziger Sender im Luftschiff genügt, um sie überall auf der Welt zugleich in Bewegung zu setzen.'],
  ],

  'rick-mason': [
    ['Beschaffer für Untergetauchte',
      'Mason besorgt, was jemand braucht, der offiziell nicht mehr existiert, und stellt dabei keine einzige Frage. Er liefert an einen Wohnwagen in Norwegen genauso zuverlässig wie an eine Adresse in Budapest.'],
    ['Papiere und Waffen',
      'Ausweise, Fahrzeuge, Munition und einmal auch ein ganzes Quinjet-Wrack: Sein Lager hat für jede Lage etwas. Was er nicht hat, hat er in zwei Tagen.'],
    ['Kontakte in alle Länder',
      'Er kennt in jedem Land jemanden, der eine Tür öffnet, und weiß, welche Behörde gerade wegsieht. Diese Liste ist sein eigentliches Kapital, und er teilt sie mit fast niemandem.'],
  ],

  'erik-killmonger': [
    ['Herzförmiges Kraut',
      'Nach dem gewonnenen Zweikampf nimmt er das Kraut und bekommt dieselbe Kraft wie T’Challa. Danach lässt er den ganzen Garten verbrennen, damit nach ihm niemand mehr nachrücken kann.'],
    ['Vibranium-Anzug',
      'Der goldene Anzug speichert Treffer und gibt sie zurück, wie der schwarze des Königs. Er trägt ihn, als wäre er ihm zugestanden, und genau darum geht es ihm die ganze Zeit.'],
    ['Ausbildung bei den Navy SEALs',
      'Killmonger kommt aus verdeckten Einsätzen und zählt seine Toten in Kerben auf der eigenen Haut. Er weiß, wie man eine Regierung stürzt, weil er es beruflich getan hat.'],
  ],

  'shuri': [
    ['Vibranium-Technik',
      'Shuri leitet mit sechzehn die Werkstatt eines ganzen Landes. Von ihr kommen der faltbare Anzug, die Handschuhe ihres Bruders, die Fernsteuerung von Fahrzeugen und der Arm, der Bucky Barnes von Hydra löst.'],
    ['Herzförmiges Kraut',
      'Killmonger lässt die Pflanze verbrennen. Jahre später baut Shuri sie im Labor nach und nimmt sie selbst, um als Black Panther gegen Namor anzutreten.'],
    ['Erfindergeist',
      'Sie erklärt in einem Satz, was andere in einem Vortrag nicht schaffen, und spottet über alles, was älter ist als sie selbst. Ihre Neugier bringt sie weiter als jede Ausbildung, und einmal auch an eine Grenze, die sie besser nicht überschritten hätte.'],
  ],

  'okoye': [
    ['Vibranium-Speer',
      'Der Speer der Dora Milaje ist Stangenwaffe und Energiewaffe zugleich und in ihrer Hand beides zur selben Zeit. Sie wirft ihn quer durch einen Saal und trifft, ohne hinzusehen.'],
    ['Generalin der Dora Milaje',
      'Okoye führt die Leibgarde des Throns und ist dem Land treu, nicht der Person darauf. Genau daran zerbricht sie fast, als Killmonger den Thron nimmt und ihr Eid plötzlich auf der falschen Seite steht.'],
    ['Nahkampf',
      'Ohne Waffe kämpft sie mit Wurf und Tritt und nimmt es mit mehreren Gegnern zugleich auf. In Südkorea reißt sie sich die Perücke vom Kopf und wirft sie einem Mann ins Gesicht, weil sie ihr im Weg ist.'],
  ],

  'nakia': [
    ['Ringklingen',
      'Zwei geschliffene Ringe, die sie wirft und wieder auffängt, sind ihre Waffe und ihr Erkennungszeichen. Im Kasino von Busan räumt sie damit einen halben Saal, ohne den Blick zu heben.'],
    ['Spionage',
      'Als War Dog lebt sie unter falschem Namen in fremden Ländern und meldet nach Hause, was Wakanda sonst nicht sähe. Aus diesen Jahren stammt ihre Überzeugung, dass ein Land, das helfen kann, auch helfen muss.'],
    ['Nahkampf',
      'Sie kämpft schnell und beweglich und weicht lieber aus, als zu blocken. Gegen Killmongers Wachen hält sie sich ohne Vibranium-Anzug und nur mit dem, was auf einem Tisch lag.'],
  ],

  'm-baku': [
    ['Rohe Kraft',
      'M’Baku ist der körperlich stärkste Mann Wakandas und tritt gegen den König an, ohne das Kraut je zu nehmen. Er kämpft aus dem Stand, mit Gewicht und Ausdauer.'],
    ['Keule',
      'Die schwere Holzkeule der Jabari ist gegen Vibranium ein Nachteil und in seiner Hand trotzdem gefährlich. Auf dem Schlachtfeld schlägt er damit Reihen frei.'],
    ['Führung der Jabari',
      'Er führt das Bergvolk, das sich seit Generationen abseits hält. Genau diese Abwesenheit rettet Wakanda zweimal, weil bei ihm oben ein König Zuflucht findet, den unten niemand mehr sucht.'],
  ],

  'everett-ross': [
    ['CIA-Agent',
      'Ross führt Verhöre und Operationen und weiß mehr über Wakanda, als Wakanda ihm zugestehen will. Er wechselt trotzdem die Seite, als es darauf ankommt.'],
    ['Fliegerisches Können',
      'Er hat fliegen gelernt, bevor er zur CIA ging, und Shuri setzt ihn deshalb an die Fernsteuerung. Aus einem Labor in Wakanda holt er damit Waffenlieferungen über Südkorea vom Himmel.'],
    ['Verhandlungsgeschick',
      'Sein eigentliches Werkzeug ist das Gespräch. Er redet Klaue in eine Zelle und Königreiche an einen Tisch, und beides kostet ihn am Ende seine Stellung.'],
  ],

  'w-kabi': [
    ['Vibranium-Waffen',
      'Der Grenzstamm trägt Schilde aus Vibranium, die Energie aufnehmen und als Stoß zurückgeben. W’Kabi setzt sie als Erster gegen die eigenen Landsleute ein.'],
    ['Kriegsnashörner',
      'Seine Herde gepanzerter Nashörner ist Wakandas schwerste Waffe am Boden und folgt allein den Reitern des Grenzstamms. Zum Stehen bringt sie am Ende nicht ein Speer, sondern Okoye.'],
    ['Führung des Grenzstamms',
      'Er verwaltet die Grenze und damit den Schleier, hinter dem das Land verschwindet. Aus Enttäuschung über T’Challa stellt er diese ganze Macht hinter Killmonger.'],
  ],

  'zuri': [
    ['Hüter des Herzförmigen Krauts',
      'Zuri wacht über den Garten, aus dem jede Kraft des Black Panther kommt, und bereitet den Trank für die Krönung. Ohne ihn gibt es keinen neuen König.'],
    ['Schamane Wakandas',
      'Er führt die Riten, ruft die Ahnen und spricht die Formeln, die einen Kampf zum Thronfolgekampf machen. Sein Wort hat in diesen Momenten mehr Gewicht als das des Königs.'],
    ['War Dog im Ruhestand',
      'Vor dem Amt war er Wakandas Mann in Oakland und hat dort N’Jobu überwacht. Was er in dieser Zeit gesehen hat, verschweigt er zwei Jahrzehnte lang und bezahlt es mit dem Leben.'],
  ],

  'adrian-toomes-vulture': [
    ['Flügelanzug',
      'Aus Chitauri-Technik baut seine Werkstatt ein Fluggerät mit Tragflächen, das Peter Parker nachts über Queens hängen lässt. Die Rotoren schneiden Stahlträger, und sie schneiden am Ende auch seine eigenen Flügel entzwei.'],
    ['Bergungsunternehmer',
      'Toomes räumt nach der Schlacht von New York auf und weiß deshalb genau, was in den Trümmern liegt. Aus diesem Wissen entsteht sein ganzes Geschäft, als eine neue Behörde ihm den Auftrag entzieht.'],
    ['Waffenhandel',
      'Er baut aus Alienschrott Werkzeuge für Kleinkriminelle und liefert sie ohne Namen und ohne Papiere. Der Grund dafür ist keiner der großen: Er will seine Familie in der Wohnung behalten, in der sie lebt.'],
  ],

  'scorpion': [
    ['Waffenhandel',
      'Gargan kauft, was Toomes aus fremder Technik zusammenbaut, und verkauft es weiter in jeden Hinterhof von Queens. Über den Preis redet er ungern zweimal.'],
    ['Kontakte im Gefängnis',
      'Hinter Gittern kennt er jeden, der etwas besorgen kann, und lässt Nachrichten hinaus- und hineintragen. Genau darüber erfährt er, wer unter der Maske von Spider-Man steckt.'],
  ],
  'ned-leeds': [
    ['Hacken und Programmieren',
      'Ned knackt in Minuten, wofür ein Labor Tage bräuchte, und hebelt den Sicherheitsring von Peters Anzug aus. Von da an weiß er alles zuerst.'],
    ['Der Mann auf dem Stuhl',
      'Er sitzt am Rechner, redet über Funk und sagt, wo etwas ist. Es ist die Rolle, die er sich selbst gegeben hat, und ohne sie geht in Washington und in Venedig einiges schief.'],
    ['Portale',
      'Mit dem Ring von Wong öffnet er Türen quer durch die Stadt, ohne je gelernt zu haben, wie. Es dauert genau so lange, bis zwei andere Peters durchgekommen sind.'],
  ],

  'may-parker': [
    ['Hilfe für Wohnungslose',
      'May arbeitet für F.E.A.S.T. und bringt Leuten Essen und ein Bett, für die sich sonst niemand zuständig fühlt. Sie tut das ohne Anzug und ohne Kräfte, jeden Tag.'],
    ['Rückhalt für Peter',
      'Sie zieht ihn nach dem Tod seines Onkels allein groß und hält aus, dass er nachts aus dem Fenster steigt. Als sie es erfährt, verlangt sie nicht, dass er aufhört, sondern dass er es richtig macht.'],
    ['Der Satz von der großen Verantwortung',
      'Aus großer Kraft folgt große Verantwortung, und sie sagt ihn als Letztes. Der Satz ist das, was von ihr bleibt, und er trägt ihn durch alles Weitere.'],
  ],

  'stephen-strange': [
    ['Magie',
      'Kamar-Taj macht aus dem Chirurgen einen Magier, der Energie zu Waffen formt und Schilde in die Luft zeichnet. Die Ringe an seinen Fingern sind das Werkzeug, die Bewegung der Hände die Sprache.'],
    ['Umhang der Levitation',
      'Der Umhang wählt seinen Träger selbst und hat einen eigenen Willen. Er trägt Strange durch die Luft, wickelt Gegner ein, hält ihn am Kragen fest, wenn er fällt, und wischt ihm gelegentlich das Blut vom Gesicht.'],
    ['Portale',
      'Ein Kreis in der Luft, und zwei Orte liegen nebeneinander. Damit kämpft er, damit flieht er, und damit bringt er in Wakanda die Armeen von einem halben Universum an einen einzigen Punkt.'],
  ],

  'defender-strange': [
    ['Magie',
      'Der Strange der Erde-617 beherrscht dieselben Künste wie sein Gegenstück und kämpft mit Schilden, Peitschen und Energie. Gegen ein Wesen aus dem Zwischenraum reicht auch das nur für eine Flucht.'],
    ['Oberster Zauberer seiner Erde',
      'In seiner Welt trägt er den Rang, den auf der Erde-616 lange die Älteste hatte. Er entscheidet allein, was mit America Chavez geschieht, und niemand widerspricht ihm.'],
    ['Portale',
      'Er springt mit dem Mädchen durch die Räume zwischen den Universen und hält dabei das Ziel im Kopf. Sein letzter Sprung endet in einem Universum, das nur aus Trümmern besteht.'],
  ],

  'sinister-strange': [
    ['Darkhold-Magie',
      'Das Buch der Verdammten gibt ihm Zauber, die kein Meister von Kamar-Taj anrühren würde, und nimmt ihm dafür Stück für Stück das Gesicht. Er hat damit sein eigenes Universum zu Staub gemacht.'],
    ['Drittes Auge',
      'Auf seiner Stirn sitzt das Zeichen dafür, wie tief er in den Darkhold gegriffen hat. Es sieht, was den beiden anderen Augen entgeht, und es ist nicht mehr abzulegen.'],
    ['Dreamwalking',
      'Er wandert in den Körper eines anderen Ich und führt dessen Hände. Genau dieses Verfahren erklärt er dem Strange der Erde-616 kurz bevor die beiden aufeinander losgehen.'],
  ],

  'the-ancient-one': [
    ['Magie',
      'Die Älteste kämpft, als koste sie es nichts, faltet Straßen ineinander und formt Schilde aus Funken. Sie ist die Lehrmeisterin, an der sich Strange und Mordo beide messen und beide scheitern.'],
    ['Kraft der Dunklen Dimension',
      'Sie zieht heimlich Energie aus genau jener Dimension, gegen die sie ihre Schüler ausbildet. Es ist ihre größte Stärke und zugleich der Grund, warum Mordo den Orden verlässt.'],
    ['Verlangsamte Alterung',
      'Diese Kraft hält sie seit Jahrhunderten am Leben, ohne dass ihr das Alter anzusehen wäre. Erst als sie den Halt in der Astralebene verliert, holt sie die Zeit in wenigen Minuten ein.'],
  ],

  'karl-mordo': [
    ['Magie',
      'Mordo kämpft gerade heraus und ohne Umweg und beherrscht die Formen von Kamar-Taj bis ins Letzte. Er unterrichtet sie auch, so lange er noch an sie glaubt.'],
    ['Stab der Lebenden Tribunale',
      'Sein Stab entrollt sich zu einer Peitsche aus reiner Energie und schlägt zurück, was auf ihn zukommt. Er führt ihn wie eine Waffe und behandelt ihn wie ein Gesetz.'],
    ['Magieentzug',
      'Nach dem Bruch mit dem Orden nimmt er anderen Zauberern ihre Kraft und stellt sie auf null. Zu viele Magier auf der Welt sind für ihn die Ursache jeder Katastrophe.'],
  ],

  'karl-mordo-838': [
    ['Magie',
      'Auf der Erde-838 hat er dieselbe Ausbildung und dieselbe Strenge, nur ohne den Bruch. Er empfängt Strange mit einem Tee und einem Zauber, der ihn festhält.'],
    ['Schwertkampf',
      'Zu seinen Formen gehört eine Klinge aus Energie, die er beidhändig führt. Gegen den fremden Strange in seinem eigenen Sanctum setzt er sie ohne Zögern ein.'],
    ['Oberster Zauberer seiner Erde',
      'Den Rang hat er von dem Strange geerbt, dessen Hinrichtung er mitgetragen hat. Er trägt ihn wie einen Beweis dafür, dass er auf der richtigen Seite steht.'],
  ],

  'wong': [
    ['Magie',
      'Wong kämpft nüchtern und ohne Aufhebens, mit Schilden, Fesseln und einem sehr ruhigen Kopf. Nach der Rückkehr der Verschwundenen trägt er den Titel des Sorcerer Supreme, weil er der Einzige ist, der ihn in dieser Zeit übernehmen kann.'],
    ['Portale',
      'Er öffnet sie schneller als jeder andere und benutzt sie im Alltag wie eine Tür. Zum Kampf in San Francisco kommt er durch eines, zum Fernsehabend mit Abomination ebenso.'],
    ['Hüter des Sanctums',
      'Wong verwaltet die Bibliothek von Kamar-Taj und weiß, welches Buch was anrichtet. Er ist die Erinnerung des Ordens, und wer dort eine Seite herausschneidet, bekommt es mit ihm zu tun.'],
  ],

  'kaecilius': [
    ['Zauberklingen',
      'Aus seinen Händen wachsen Klingen aus purer Energie, die Schilde durchschneiden. Er führt sie beidhändig und schnell und tötet damit den Hüter des Londoner Sanctums.'],
    ['Raumfaltung',
      'Er biegt Straßen, Treppen und ganze Häuserblocks ineinander und kämpft in einer Stadt, die sich um die Kämpfenden dreht. Wer die Orientierung verliert, hat gegen ihn schon verloren.'],
    ['Kraft von Dormammu',
      'Die Dunkle Dimension speist ihn und seine Zeloten und macht sie stärker als jeden Meister von Kamar-Taj. Der Preis dafür ist, dass er am Ende selbst zu ihrem Bestand gehört.'],
  ],

  'dormammu': [
    ['Magie der Dunklen Dimension',
      'Seine Kraft ist so groß, dass sie in keiner Rechnung mehr vorkommt, und sie reicht durch jedes Portal, das ihm jemand öffnet. Gegen Strange verliert er nicht durch Stärke, sondern durch eine Schleife in der Zeit.'],
    ['Verschlingen ganzer Dimensionen',
      'Er nimmt Welt um Welt in sein Reich auf und löscht damit alles aus, was dort Zeit kennt. Die Erde ist der nächste Punkt auf dieser Liste, und Kaecilius soll ihm die Tür aufhalten.'],
    ['Unsterblichkeit',
      'In der Dunklen Dimension vergeht keine Zeit, deshalb altert und stirbt er nicht. Genau das wird ihm zum Verhängnis, als Strange den einen Moment endlos wiederholt.'],
  ],

  'hela': [
    ['Klingen aus dem Nichts',
      'Hela lässt Schwerter, Speere und Dornen aus ihrer Hand wachsen und wirft sie zu Dutzenden zugleich. Auf der Regenbogenbrücke räumt sie damit die gesamte asgardische Armee ab.'],
    ['Kraft aus Asgard',
      'Ihre Macht steigt, solange sie auf asgardischem Boden steht, und dort ist sie stärker als Thor und Loki zusammen. Genau darum bleibt am Ende nur, das Reich selbst zu zerstören.'],
    ['Göttin des Todes',
      'Sie hat die Neun Reiche an Odins Seite erobert und führt Fenris und die Berserker aus ihren Gräbern zurück. Ihr Helm mit dem Geweih ist das Zeichen, unter dem Asgard einmal Angst verbreitet hat.'],
  ],

  'valkyrie': [
    ['Kampferfahrung',
      'Sie hat mit den Walküren gegen Hela gekämpft, als Thor noch ein Kind war, und als Einzige überlebt. Was danach kommt, sind Jahrhunderte auf Sakaar, in denen sie Kämpfer einfängt und trinkt.'],
    ['Dragonfang',
      'Das Schwert der Walküren führt sie einhändig und aus vollem Lauf. Damit steht sie auf dem Bifröst gegen Fenris und auf dem Schiff gegen alles, was ihrem Volk noch nachsetzt.'],
    ['König von Neu-Asgard',
      'Nach Thors Rückzug führt sie den Rest des Volkes an der norwegischen Küste. Sie nennt sich König und nicht Königin, und sie regiert mit derselben Ruhe, mit der sie kämpft.'],
  ],

  'grandmaster': [
    ['Herrscher über Sakaar',
      'Ihm gehört der Planet, auf dem alles landet, was anderswo weggeworfen wird, und er regiert ihn wie eine Fernsehshow. Wer dort ankommt, ist ab dem ersten Moment Teil seines Programms.'],
    ['Schmelzstab',
      'Ein Stab, der Menschen bei Berührung in eine Pfütze verwandelt, und er trägt ihn wie ein Zepter. Meistens genügt es, ihn zu heben.'],
    ['Unsterblichkeit',
      'Als einer der Ältesten des Universums lebt er seit dem Anfang der Zeit und langweilt sich seither. Die Arena, die Wetten und die Grausamkeit sind der Zeitvertreib eines Wesens, das nicht sterben kann.'],
  ],

  'skurge': [
    ['Bloodaxe',
      'Die zweischneidige Axt aus Asgards Waffenkammer trennt Rüstung und Knochen im selben Schlag. Hela gibt sie ihm als Zeichen seines neuen Amtes.'],
    ['Zwei M16-Gewehre',
      'Von einem Ausflug nach Texas bringt er zwei Sturmgewehre mit und nennt sie Des und Troy. Auf der Brücke von Asgard leert er damit die Magazine gegen Helas Untote, bis sie ihn erreicht.'],
    ['Wächter des Bifröst',
      'Nach Heimdalls Flucht steht er am Ende der Brücke und soll die Wache halten, die er nie wollte. Aus Angst, unwichtig zu sein, sagt er dabei zu jedem Ja, der ihn fragt.'],
  ],

  'surtur': [
    ['Krone Twilight',
      'Seine Krone ist der Kern seiner Macht und wächst, sobald sie in das Ewige Feuer gehalten wird. Odin hat sie ihm abgenommen und in seiner Waffenkammer verstaut, und Thor bringt sie eigenhändig zurück.'],
    ['Ragnarök',
      'Die Vorhersage nennt ihn als denjenigen, der Asgard in Flammen legt, und er tut es genau so. Aus dem Weltuntergang wird dabei ein Zug von Thor, der ihn selbst darum bittet.'],
    ['Flammenschwert',
      'Er führt eine Klinge aus Feuer, so groß wie ein Palast, und stößt sie am Ende in Asgards Fundament. Der Berg reißt auf, und das Reich verschwindet.'],
  ],

  'topaz': [
    ['Leibwächterin des Grandmasters',
      'Sie steht neben dem Thron, hält den Betrieb am Laufen und sagt ihrem Herrn als Einzige, was sie wirklich denkt. Ihre Aufgabe ist es, dafür zu sorgen, dass er sich nie langweilt.'],
    ['Fliegerisches Können',
      'Auf Sakaar fliegt niemand enger als sie, und sie führt beim Aufstand die Verfolgung der Revengers selbst. Ihr Schiff bricht auseinander, bevor sie den Angriff abbrechen kann.'],
    ['Schmelzstab',
      'Sie trägt dieselbe Waffe wie der Grandmaster und setzt sie sehr viel bereitwilliger ein. Ein Antippen genügt, und der Getroffene läuft davon.'],
  ],

  'janet-van-dyne': [
    ['Erste Wasp',
      'Sie fliegt in ihrem eigenen Anzug an Hanks Seite, lange bevor Hope oder Scott davon wissen. Auf dem Raketenflug schaltet sie den Regler ab und schrumpft ins Unendliche, um die Sprengköpfe zu stoppen.'],
    ['Dreißig Jahre im Quantenreich',
      'Was für die Familie ein Tod ist, ist für sie ein Leben in einer anderen Welt. Sie lernt dort Sprachen, Wege und Menschen kennen und weiß deshalb als Einzige, wer Kang ist.'],
    ['Energie aus dem Quantenreich',
      'Die Jahre unten haben sie verändert, ihre Hände geben Energie ab und heilen fremde Wunden. Sie spricht selten darüber, weil sie nicht weiß, was sonst noch mit ihr passiert ist.'],
  ],

  'ava-starr': [
    ['Phasen durch feste Materie',
      'Ihr Körper ist nach dem Unfall im Labor ihres Vaters nicht mehr ganz an einem Ort. Sie greift durch Wände, durch Panzerung und durch Menschen hindurch, und dabei geht auch das kaputt, was sie berührt.'],
    ['Quantenschwankung im Körper',
      'Dieselbe Schwankung, die sie zur Waffe macht, bringt sie um. Jede Stunde ohne Behandlung tut weh, und genau darum jagt sie Hank Pyms Labor.'],
    ['Nahkampf',
      'Bill Foster und ein Geheimdienst haben sie zur Einbrecherin ausgebildet. Sie schlägt hart und benutzt das Durchphasen mitten in der Bewegung, was jede Deckung sinnlos macht.'],
  ],

  'yelena-belova': [
    ['Nahkampf und Spionage',
      'Sie schlägt schneller zu als ihre Schwester und redet dabei mehr. Ihre Stärke ist der genaue Blick auf einen Raum, sie sieht in Sekunden, wer bewaffnet ist und wo die zweite Tür liegt.'],
    ['Ausbildung im Roten Raum',
      'Auch sie wird als Kind verschleppt und dort zur Witwe gemacht, nur wird sie zusätzlich chemisch unterworfen. Das Gegenmittel befreit sie und danach Dutzende andere, die sie einzeln aus ihren Aufträgen holt.'],
    ['Präzisionswaffen',
      'Pistolen, Stäbe und Sprengstoff, alles knapp und ohne Aufwand eingesetzt. Auf einem Dach in New York geht sie mit Stab und Pistole auf Clint Barton los und redet dabei über eine Weste mit vielen Taschen.'],
  ],
  'sylvie': [
    ['Verzauberung fremder Gedanken',
      'Eine Berührung genügt, und sie sitzt in der Erinnerung eines anderen und lenkt von dort seine Hand. So übernimmt sie Wachen der TVA und bringt eine ganze Behörde dazu, ihr die Türen zu öffnen.'],
    ['Magie und Gestaltwandel',
      'Wie jeder Loki wirft sie Trugbilder und trägt fremde Gesichter, nur hat sie es sich allein beigebracht. Was ihr an Ausbildung fehlt, gleicht sie mit Härte aus.'],
    ['Schwertkampf',
      'Sie führt eine Klinge, die sie sich selbst gebaut hat, und schlägt ohne Umschweife zu. Ihr letzter Streich fällt am Ende der Zeit, gegen den Mann, der die ganze Ordnung geschrieben hat.'],
  ],

  'classic-loki': [
    ['Illusionen von enormer Größe',
      'Dieser Loki hat Jahrhunderte allein geübt und stellt Trugbilder auf, die ganze Landschaften füllen. Im Void baut er damit Asgard neu, um Alioth abzulenken, und bezahlt es mit dem Leben.'],
    ['Gestaltwandel',
      'Er nimmt jede Gestalt an, die er kennt, und hat den eigenen Tod schon einmal damit vorgetäuscht. Genau deshalb überlebt er Thanos, während der Loki der Heiligen Zeitlinie es nicht tut.'],
    ['Magie',
      'Was Frigga ihn gelehrt hat, hat er in der Einsamkeit weiter ausgebaut. Nach seiner eigenen Aussage ist es die Kraft, die ihn am Ende doch wieder zu den anderen zurückführt.'],
  ],

  'kid-loki': [
    ['Laevateinn',
      'Sein Schwert ist größer als er selbst und älter als die Zeitlinie, aus der er kommt. Er trägt es als Zeichen dafür, dass im Void er der König ist.'],
    ['Magie',
      'Auch der Junge beherrscht die Zauberkunst seiner Familie und setzt sie nüchtern ein. Er weiß genau, welche Trugbilder in dieser Gegend funktionieren und welche Alioth anlocken.'],
    ['König der Leere',
      'Er führt eine kleine Gruppe Varianten durch ein Land, in dem alles landet, was gelöscht wurde. Seine Regel ist einfach: Wer neu ankommt, bringt etwas mit oder geht weiter.'],
  ],

  'boastful-loki': [
    ['Magie',
      'Er kann, was jeder Loki kann, und behauptet dazu noch das Doppelte. Im Ernstfall bleibt von den angekündigten Kunststücken wenig übrig.'],
    ['Nahkampf',
      'Mit dem Hammer in der Hand geht er gerade auf den Gegner los und trifft auch. Vom Kampf gegen Captain America, den er gern erwähnt, hat allerdings niemand je gehört.'],
    ['Geschichten über sich selbst',
      'Er will alle sechs Steine besessen und Iron Man getötet haben, und er erzählt das mit so viel Überzeugung, dass es fast reicht. Seine wirksamste Waffe ist die Lüge, und sie fällt ihm am Ende selbst auf die Füße.'],
  ],

  'alligator-loki': [
    ['Biss',
      'Der gehörnte Alligator regelt Streit mit dem Maul und nimmt President Loki im Vorbeigehen die Hand ab. Diskussionen führt er nicht.'],
    ['Blick für andere Lokis',
      'Er erkennt schneller als die ganze Runde, wer gerade lügt, und macht das mit einem einzigen Laut deutlich. Die anderen Varianten glauben ihm jedes Mal.'],
  ],

  'president-loki': [
    ['Magie',
      'Er beherrscht die Zauberkunst wie jede Variante und setzt sie vor allem zur Vorführung ein. Sein Gefolge soll sehen, wer hier der Stärkere ist.'],
    ['Armee aus Varianten',
      'Im Void sammelt er andere Lokis um sich und führt sie gegen Kid Lokis Gruppe. Ein Bündnis unter Lügnern hält allerdings nur so lange, bis der Erste weiterrechnet.'],
    ['Strategischer Verstand',
      'Er lockt seine Gegner mit einem Versprechen auf den Thron in eine Falle und hat den Hinterhalt längst gestellt. Dass seine eigenen Leute genau dieselbe Rechnung aufmachen, kommt ihm nicht in den Sinn.'],
  ],

  'mobius': [
    ['Analyse von Zeitlinien',
      'Mobius liest aus Akten und Aufzeichnungen heraus, wo ein Zweig entsteht und warum. Er hat Hunderte Lokis untersucht und kennt jeden Zug, bevor dieser gemacht wird.'],
    ['Zeitstab der TVA',
      'Der Stab löscht mit einem Schlag alles, was er berührt, und schneidet Zweige aus der Zeit heraus. Mobius trägt ihn und benutzt ihn so selten wie möglich.'],
    ['Verhörkunst',
      'Sein Verhör ist ein Gespräch, in dem der andere von allein erzählt. Bei Loki genügt ihm dafür ein Stapel Bilder und die Frage, warum er es überhaupt tut.'],
  ],

  'ravonna-renslayer': [
    ['Richterin der TVA',
      'Sie entscheidet über Löschung oder Weiterleben und tut es ohne Zögern. Ihre Urteile stützen sich auf ein Regelwerk, dessen Herkunft niemand hinterfragen darf.'],
    ['Zeitstab',
      'Sie führt den Stab genauer als jeder Jäger und trennt damit ganze Abschnitte aus der Zeitlinie. Auch gegen die eigenen Leute setzt sie ihn ein, sobald diese zweifeln.'],
    ['Nahkampf',
      'Vor dem Richteramt war sie Jägerin, und das merkt man ihr im Kampf noch an. Gegen Sylvie hält sie sich lange und verliert am Ende nur durch die Verzauberung.'],
  ],

  'miss-minutes': [
    ['Archiv der gesamten TVA',
      'Sie weiß alles, was die Behörde je aufgezeichnet hat, und liefert es in Sekunden. Wer eine Auskunft braucht, fragt nicht das Archiv, sondern sie.'],
    ['Erscheint überall als Hologramm',
      'Die gezeichnete Uhr steht an jedem Ort der Behörde und in jedem Zeitabschnitt zugleich. Sie taucht auch dort auf, wo gerade niemand mit ihr rechnet.'],
    ['Zugriff auf Rechnersysteme',
      'Sie schaltet Türen, Aufzüge und Waffen der TVA nach Belieben und schreibt Akten um, während man sie liest. Ihre Freundlichkeit ändert nichts daran, für wen sie arbeitet.'],
  ],

  'der-da-bleibt': [
    ['Herrschaft über die Heilige Zeitlinie',
      'Er hat aus dem Multiversum einen einzigen Strang gemacht und schneidet seither jeden Zweig ab. Die ganze TVA ist nichts anderes als sein Werkzeug dafür.'],
    ['Wissen um jeden kommenden Schritt',
      'Sein Buch reicht bis zu dem Moment, in dem Loki und Sylvie vor ihm stehen, und bis dahin stimmt jede Zeile. Was danach kommt, weiß er selbst nicht, und genau darauf hat er gewartet.'],
    ['Zeitstab',
      'Auch er trägt die Waffe der Behörde, die er gebaut hat, und weicht damit zwei Angreifern zugleich aus. Er hätte den Kampf gewinnen können und lässt ihn absichtlich enden.'],
  ],

  'agatha-harkness': [
    ['Hexenkunst seit dem 17. Jahrhundert',
      'Agatha zaubert länger, als es die Vereinigten Staaten gibt, und kennt Formen, die kein Zirkel mehr lehrt. Ihre Magie leuchtet violett und arbeitet ruhiger als die Kraft, der sie nachjagt.'],
    ['Entzug fremder Macht',
      'Sie zieht anderen Hexen die Kraft aus dem Körper und lebt davon weiter. Ihre eigene Mutter und deren ganzer Zirkel stehen am Anfang dieser Liste.'],
    ['Brosche als Schutz',
      'Die Brosche mit dem Buch bindet ihre Kraft und schirmt sie gegen fremde Zauber ab. Ohne sie steht sie in Westview zum ersten Mal seit Jahrhunderten ungeschützt da.'],
  ],

  'monica-rambeau': [
    ['Umsetzung jeder Form von Energie',
      'Der Durchgang durch die Grenze von Westview schreibt ihre Zellen um. Danach nimmt sie Licht, Strom und Strahlung auf und gibt sie in einer anderen Form wieder ab.'],
    ['Unsichtbarkeit und Flug',
      'Sie verschiebt das Licht um sich herum und verschwindet daraus, und dieselbe Kraft trägt sie durch die Luft. Im Kampf um die Sprünge zwischen drei Welten ist das ihr größter Vorteil.'],
    ['Ausbildung bei der S.W.O.R.D.',
      'Vor allen Kräften ist sie Agentin und Astronautin mit Jahren im Dienst. Sie liest ein Messfeld, einen Raum und eine Lage schneller als die Vorgesetzten, die sie hinausschicken.'],
  ],

  'darcy-lewis': [
    ['Astrophysikerin',
      'In New Mexico ist sie noch Praktikantin und tasert einen Gott, weil er ihr zu nahe kommt. Jahre später kommt sie als Doktorin der Astrophysik nach Westview und liest das Feld aus, das eine Stadt umschließt.'],
    ['Messtechnik im Feld',
      'Sie baut aus dem, was da ist, ein Gerät, das misst, was niemand versteht. Ein alter Fernseher genügt ihr, um das Signal aus Wanda Maximoffs Welt hereinzuholen.'],
    ['Sinn für das Naheliegende',
      'Während Behörden Theorien aufstellen, stellt sie die Frage, die keiner stellt. Genau damit findet sie in Westview heraus, dass dort eine Sitcom läuft und niemand freiwillig mitspielt.'],
  ],

  'jimmy-woo': [
    ['FBI-Agent',
      'Woo arbeitet gründlich, notiert alles und bleibt höflich, auch wenn eine ganze Stadt hinter einem Kraftfeld verschwindet. Seine Gelassenheit ist das Einzige, was in Westview durchgehend funktioniert.'],
    ['Zeugenschutz',
      'Er hat Scott Lang jahrelang im Hausarrest betreut und kennt jeden Trick, mit dem sich jemand absetzt. Eine verschwundene Zeugin in Westview ist der Grund, warum er überhaupt vor Ort ist.'],
    ['Kartentricks',
      'Er übt Zaubertricks, um sich bei Kollegen beliebt zu machen, und zieht sie in den unpassendsten Momenten aus der Tasche. Einmal befreit ihn genau das aus einer Zelle.'],
  ],

  'shang-chi': [
    ['Die Zehn Ringe',
      'Die Ringe stammen aus einer anderen Welt und geben ihrem Träger Kraft und ein sehr langes Leben. Shang-Chi nimmt sie seinem Vater ab und lernt erst danach, sie zu führen, weil sie auf ihn hören und nicht er auf sie.'],
    ['Kampfkunst von Kindheit an',
      'Xu Wenwu lässt ihn ab dem siebten Lebensjahr ausbilden, jeden Tag und ohne Rücksicht. Was daraus wird, sieht man in einem Bus in San Francisco und an einem Gerüst in Macau.'],
    ['Ausbildung in Ta Lo',
      'Im Dorf seiner Mutter lernt er die andere Hälfte: nicht schlagen, sondern lenken. Ying Nan bringt ihm die Bewegungen bei, mit denen er am Ende gegen den Dweller aus dem Dunkeln bestehen kann.'],
  ],

  'katy': [
    ['Bogenschießen',
      'In Ta Lo lernt sie in wenigen Tagen, was andere über Jahre üben, und trifft im Ernstfall. Ihr Schuss holt den Dweller aus dem Dunkeln vom Himmel.'],
    ['Fahrkunst',
      'Sie fährt jedes Auto und jedes Gerüst und bringt einen Wagen dorthin, wo eigentlich keine Straße mehr ist. In San Francisco parkt sie Fahrzeuge zum Spaß, in Macau rettet sie damit Leben.'],
    ['Treue zu ihrem Freund',
      'Sie geht mit, als Shang-Chi nach China aufbricht, ohne zu wissen, worauf sie sich einlässt. Genau darin liegt ihr Anteil daran, dass er nicht davonläuft.'],
  ],

  'wenwu-mandarin': [
    ['Die Zehn Ringe',
      'Die Ringe an seinen Unterarmen schlagen mit der Wucht eines Rammbocks und halten jeden Angriff auf. Wenwu führt sie seit tausend Jahren und hat damit Dynastien gestürzt.'],
    ['Tausend Jahre Kampferfahrung',
      'Er hat jeden Stil gesehen, den es gibt, und die meisten davon selbst geübt. Gegen seinen eigenen Sohn braucht er deshalb keine Kraft, sondern nur Geduld.'],
    ['Herrschaft über die Zehn Ringe',
      'Seine Organisation reicht in jedes Land und in jede Regierung, ohne dass die Welt ihren Namen kennt. Er lässt sogar einen Schauspieler als Aushängeschild auftreten, damit niemand nach ihm sucht.'],
  ],

  'xialing': [
    ['Kampfkunst im Selbststudium',
      'Vom Training ihres Vaters ausgeschlossen, bringt sie sich alles heimlich selbst bei, indem sie zusieht. Was daraus wird, hält im Golden Daggers Club jedem Kämpfer stand.'],
    ['Rope Dart',
      'Ihre Waffe ist eine Klinge an einer Schnur, die sie kreisen lässt und über weite Strecken führt. Damit hält sie sich mehrere Gegner zugleich vom Leib.'],
    ['Führung der Zehn Ringe',
      'Nach dem Tod ihres Vaters übernimmt sie seine Organisation und ordnet sie neu. Der erste Unterschied ist sichtbar: Bei ihr trainieren auch Frauen im Hof.'],
  ],

  'razor-fist': [
    ['Machete statt der rechten Hand',
      'An seinem rechten Arm sitzt eine feste Klinge, die er im Kampf wie eine verlängerte Faust führt. Sie ist Werkzeug und Drohung in einem und lässt sich nicht ablegen.'],
    ['Nahkampf',
      'Er kämpft schnell und ohne Umweg und stellt sich Shang-Chi im Bus wie im Gerüst von Macau. Verlieren tut er beide Male knapp.'],
    ['Leibwächter von Wenwu',
      'Er steht seit Jahren an der Seite des Mandarin und führt dessen Aufträge ohne Rückfrage aus. In Ta Lo wechselt er die Seite, als klar wird, wogegen dort gekämpft wird.'],
  ],

  'john-walker': [
    ['Supersoldaten-Serum',
      'Walker nimmt eine der letzten Ampullen aus Nagels Labor und wird über Nacht so stark wie Rogers. Was er nicht bekommt, ist der Charakter dazu, und das sieht in Riga jeder auf dem Marktplatz.'],
    ['Vibranium-Schild',
      'Die Regierung gibt ihm das Schild und den Namen dazu, ohne dass jemand ihn danach gefragt hätte. Er benutzt es als Waffe im Wortsinn, und danach ist es nicht mehr dasselbe Zeichen.'],
    ['Drei Medaillen für Tapferkeit',
      'Vor allem anderen ist Walker ein ausgezeichneter Soldat, dreimal geehrt für dieselbe Nacht. Er sagt selbst, dass er für jede dieser Medaillen etwas getan hat, worüber er nicht spricht.'],
  ],
  'karli-morgenthau': [
    ['Supersoldaten-Serum',
      'Nagels Fassung macht die junge Frau stark genug, um Bucky Barnes durch eine Wand zu werfen. Sie teilt die Ampullen mit ihren Leuten und behält keine einzige für sich zurück.'],
    ['Führung der Flag Smashers',
      'Sie hält eine Gruppe von Überzeugten über acht Länder hinweg zusammen und gibt jedem Einzelnen das Gefühl, gebraucht zu werden. Ihr Ruf reicht weiter als ihre Truppe, weil Millionen dasselbe denken wie sie.'],
    ['Netz aus Helfern',
      'In jedem Lager, jeder Turnhalle und jedem Grenzort kennt sie jemanden, der eine Tür offen lässt. Genau daran scheitert jede Fahndung, die nur nach Waffen sucht.'],
  ],

  'sharon-carter': [
    ['S.H.I.E.L.D.-Ausbildung',
      'Als Agentin bewacht sie Steve Rogers unter falschem Namen und schlägt sich später ohne Rückhalt durch. Ihr Handwerk bleibt dasselbe, nur arbeitet sie es ab dem Sokovia-Abkommen für sich selbst ab.'],
    ['Waffenhandel als Power Broker',
      'In Madripoor führt sie einen Markt für alles, was verboten ist, und niemand kennt ihr Gesicht dahinter. Sie verkauft Serum, Papiere und Leute und tut es aus derselben Bitterkeit, aus der sie geflohen ist.'],
    ['Nahkampf',
      'Sie kämpft schnell und ohne Ehrgeiz, den Kampf zu gewinnen, wenn ein Ausweg näher liegt. Auf dem Dach in Madripoor räumt sie eine halbe Einheit aus, während sie nebenbei ein Bild verkauft.'],
  ],

  'isaiah-bradley': [
    ['Supersoldaten-Serum',
      'Die Armee probiert an ihm und dreihundert anderen Männern eine unfertige Fassung aus, ohne ihnen zu sagen, was sie bekommen. Bei ihm wirkt sie, und genau das wird zu seinem Verhängnis.'],
    ['Übermenschliche Kraft',
      'In Korea reißt er ein Gefangenenlager auf und trägt seine Kameraden heraus. Auch als alter Mann drückt er noch eine Tür ein, die für Menschen gedacht ist.'],
    ['Dreißig Jahre Haft und Versuche',
      'Statt eines Ordens bekommt er eine Zelle, in der man ihm Blut abnimmt, bis eine Krankenschwester seine Akte verbrennt. Was er überlebt hat, macht ihn zäher als jeder Ausbilder.'],
  ],

  'quentin-beck-mysterio': [
    ['Drohnen mit Projektionstechnik',
      'Ein Schwarm bewaffneter Drohnen wirft Bilder in die Luft und feuert zugleich. Für Zuschauer sieht es aus wie ein Elementarwesen, und die Einschläge sind trotzdem echt.'],
    ['Illusionen in Stadtgröße',
      'Beck baut ganze Straßenzüge aus Licht und schickt Peter Parker durch einen Kampf, in dem nichts von dem existiert, was ihn schlägt. Es ist der gefährlichste Angriff, den der Junge je erlebt.'],
    ['Ehemaliger Stark-Ingenieur',
      'Die Technik dahinter ist seine eigene Entwicklung aus Starks Werkstatt, aus der man ihn hinausgeworfen hat. Sein Groll ist der Motor, der die ganze Inszenierung antreibt.'],
  ],

  'michelle-jones-watson': [
    ['Beobachtungsgabe',
      'MJ merkt als Erste, dass Peter Parker verschwindet, wenn Spider-Man auftaucht. Sie sagt es ihm auf einer Brücke in Prag, ohne dass er eine Chance hat, sich herauszureden.'],
    ['Recherche',
      'Sie liest, was andere überblättern, und hat zu jedem Ort die dunkelste Geschichte parat. Ihr Wissen über Zauberei und Mythen wird in London ganz konkret nützlich.'],
    ['Blick für Lügen',
      'Sie hört den Ton unter dem Satz, und deshalb hält sie Mysterio schon für falsch, als alle anderen klatschen. Ihre Ehrlichkeit macht sie zur Einzigen, der Peter alles sagen kann.'],
  ],

  'sersi': [
    ['Materiekontrolle',
      'Eine Berührung genügt, und Stein wird Wasser, Metall wird Holz, ein Bus wird zu Blütenblättern. Gegen lebende Wesen wirkt es nicht, und genau darum kämpft sie ungern.'],
    ['Unsterblichkeit',
      'Sersi lebt seit siebentausend Jahren auf der Erde und altert dabei nicht. Was sie an den Menschen bindet, ist nicht der Auftrag, sondern dass sie ihnen beim Wachsen zugesehen hat.'],
    ['Führung der Eternals',
      'Ajak gibt ihr die Verbindung zu Arishem weiter, und damit die Entscheidung über eine ganze Welt. Sie führt die Gruppe nicht durch Stärke, sondern indem sie jeden Einzelnen davon überzeugt.'],
  ],

  'ikaris': [
    ['Augenstrahlen',
      'Aus seinen Augen fährt gebündelte kosmische Energie, die Panzerung und Fels gleichermaßen öffnet. Ein einziger Strahl reicht, um einen Deviant in zwei Teile zu legen.'],
    ['Flug',
      'Er fliegt schneller als jedes Flugzeug und verlässt die Atmosphäre, wenn es sein muss. Am Ende fliegt er genau deshalb in die Sonne.'],
    ['Nahezu unverwundbar',
      'Nichts auf der Erde dringt durch seine Haut, weder Waffen noch Feuer noch der Zugriff eines Deviants. Der einzige Schaden, den er nimmt, kommt aus seiner eigenen Entscheidung.'],
  ],

  'thena': [
    ['Waffen aus kosmischer Energie',
      'Aus ihren Händen wachsen Schwerter, Speere, Bögen und Schilde, je nachdem, was der Kampf verlangt. Der Wechsel geschieht mitten in der Bewegung und ohne ein Nachladen.'],
    ['Kriegerin seit siebentausend Jahren',
      'Sie hat auf jedem Kontinent gekämpft und ist auf Wandbildern von Babylon bis Tenochtitlan zu sehen. Kein anderer Eternal hat so viele Schlachten hinter sich.'],
    ['Nahkampf',
      'Sie kämpft schnell, präzise und ohne einen Schlag zu viel, auch mitten im Mahd Wy’ry. Gerade dann ist sie für ihre eigene Gruppe am gefährlichsten.'],
  ],

  'kingo': [
    ['Energiegeschosse aus den Händen',
      'Er wirft gebündelte Energie wie Pistolenschüsse und trifft mehrere Ziele nacheinander. Seine Handbewegungen dazu hat er sich beim Film abgeschaut, oder umgekehrt.'],
    ['Unsterblichkeit',
      'Kingo lebt seit Jahrtausenden und altert nicht, was ihm in der Öffentlichkeit ein Problem macht. Er löst es, indem er sich alle paar Jahrzehnte als sein eigener Sohn ausgibt.'],
    ['Filmstar in Bollywood',
      'Seit Generationen dreht er Filme über sich selbst und ist in Indien berühmter als jeder Avenger. Sein Kameramann folgt ihm auch dorthin, wo es um die Welt geht.'],
  ],

  'sprite': [
    ['Illusionen für ganze Menschenmengen',
      'Sie stellt Bilder in die Luft, die ein ganzer Platz für echt hält, und lässt sich selbst darin verschwinden. Ihre Trugbilder sind so genau, dass selbst Eternals darauf hereinfallen.'],
    ['Unsterblich im Körper eines Kindes',
      'Sie ist so alt wie Sersi und Ikaris und sieht seit siebentausend Jahren aus wie zwölf. Was für die anderen ein Geschenk ist, ist für sie eine Strafe.'],
    ['Geschichtenerzählerin',
      'Aus ihren Erzählungen sind Sagen geworden, die die Menschheit bis heute weitergibt. Sie erzählt von einem Leben, das sie selbst nie führen darf.'],
  ],

  'druig': [
    ['Gedankenkontrolle',
      'Druig legt seinen Willen über fremde Köpfe und lässt ganze Dörfer stehen bleiben oder weiterlaufen. Er könnte damit jeden Krieg der Menschheit beenden, und genau das ist ihm verboten.'],
    ['Unsterblichkeit',
      'Auch er lebt seit Jahrtausenden und hat jeden Krieg der Menschen mit angesehen. Das Zusehen ist der Grund, warum er sich in den Amazonas zurückzieht.'],
    ['Menschenkenntnis',
      'Wer so lange zusieht, weiß, was Menschen antreibt, bevor sie es selbst wissen. Druig braucht deshalb selten seine Kraft, um zu bekommen, was er will.'],
  ],

  'makkari': [
    ['Übermenschliche Schnelligkeit',
      'Makkari läuft schneller als der Schall und reißt die Luft hinter sich zu einer Druckwelle zusammen. Sie durchsucht ein ganzes Schiff, während die anderen noch am Eingang stehen.'],
    ['Unsterblichkeit',
      'Sie lebt seit siebentausend Jahren und hat in dieser Zeit halbe Bibliotheken gesammelt. Der Domo ist voll mit dem, was sie im Vorbeigehen mitgenommen hat.'],
    ['Geschärfte Sinne',
      'Sie ist gehörlos und liest dafür Bewegung, Erschütterung und Lippen genauer als jeder andere. Die Spur der Deviants findet sie, weil sie den Boden spürt und nicht das Geräusch.'],
  ],

  'phastos': [
    ['Erfindergeist',
      'Phastos hat der Menschheit vom Pflug bis zum Dampfmaschinenbau die Werkzeuge gegeben. Was daraus in Hiroshima geworden ist, hat ihn für Jahrhunderte verstummen lassen.'],
    ['Unsterblichkeit',
      'Er lebt seit siebentausend Jahren und hat jede Stufe der menschlichen Technik selbst begleitet. Sein Rückzug in ein Vorstadthaus ist eine bewusste Entscheidung.'],
    ['Werkzeuge aus kosmischer Energie',
      'Er formt aus Energie Ringe, Fesseln und Maschinen, die genau das tun, was er im Kopf hat. Der Käfig für Ikaris entsteht auf diese Weise in Sekunden.'],
  ],

  'ajak': [
    ['Heilung durch Berührung',
      'Ihre Hand schließt Wunden und holt Verletzte zurück, die niemand mehr retten könnte. Sie ist die Einzige der Gruppe, deren Kraft nichts zerstört.'],
    ['Verbindung zu den Celestials',
      'Nur sie spricht mit Arishem und gibt seine Weisungen an die anderen weiter. Diese Stellung macht sie zur Anführerin und zugleich zur Ersten, die den Auftrag hinterfragt.'],
    ['Führung der Eternals',
      'Sie hält sieben sehr unterschiedliche Wesen über Jahrtausende zusammen und hält den wahren Zweck ihrer Mission zurück. Genau dieses Schweigen zerbricht die Gruppe, als es endlich aufhört.'],
  ],

  'gilgamesh': [
    ['Goldenes Exoskelett',
      'Um Arme und Fäuste legt sich kosmische Energie zu einer Panzerung, die jeden Schlag verstärkt. Damit hält er einen Deviant fest, an dem sich zwei andere Eternals bereits versucht haben.'],
    ['Der stärkste Eternal seiner Zeit',
      'Körperlich nimmt es keiner der Gruppe mit ihm auf, nicht einmal Ikaris im offenen Ringen. Er weiß das und macht kein Aufheben davon.'],
    ['Nahkampf',
      'Siebentausend Jahre Übung stecken in jeder Bewegung, und er kämpft ruhig und ohne Hast. In Australien verteidigt er Thena fünfhundert Jahre lang gegen alles, was kommt.'],
  ],

  'dane-whitman': [
    ['Historiker und Dozent',
      'Whitman arbeitet am Natural History Museum und ordnet ein, was er sieht, auch wenn es Jahrtausende alt ist. Sein Wissen über Mythen ist der Grund, warum ihn Sersis Geschichte nicht umwirft.'],
    ['Erbe der Ebony Blade',
      'In seiner Familie liegt ein schwarzes Schwert, das seit Generationen weitergereicht und gefürchtet wird. Er zieht es erst, als Sersi verschwunden ist, und weiß nicht, was es mit ihm macht.'],
    ['Sprachkenntnis',
      'Er liest Latein wie Zeitung und ordnet damit Inschriften ein, die andere für Zierrat halten. Genau diese Genauigkeit macht ihn zu einem passenden Gegenüber für eine Frau, die dabei war.'],
  ],

  'green-goblin': [
    ['Gleiter und Kürbisbomben',
      'Sein Fluggerät trägt ihn über die Dächer und wendet auf der Stelle, dazu wirft er Bomben, die in einer Wolke aus Splittern zerspringen. Beides stammt aus der Waffenentwicklung seiner eigenen Firma.'],
    ['Übermenschliche Kraft',
      'Das Serum, das er an sich selbst ausprobiert hat, macht ihn stark genug, um es mit Spider-Man aufzunehmen. In der Wohnung von May Parker reißt er damit tragende Wände ein.'],
    ['Gespaltene Persönlichkeit',
      'In seinem Kopf sitzt eine zweite Stimme, die zurückkommt, sobald er die Maske sieht. Sie ist das Gefährlichste an ihm, weil sie genau weiß, wo Peter Parker verwundbar ist.'],
  ],

  'doc-ock': [
    ['Vier Metallarme',
      'Die Arme reagieren schneller als sein eigener Körper und arbeiten selbstständig weiter, wenn er nicht hinsieht. Sie halten Fahrzeuge fest, klettern an Hochhäusern und greifen von vier Seiten gleichzeitig an.'],
    ['Kernphysiker',
      'Octavius hat eine Fusionsreaktion zum Laufen gebracht, an der ganze Institute gescheitert sind. Sein Verstand ist der Grund, warum Peters Heilmittel überhaupt zustande kommt.'],
    ['Übermenschliche Kraft',
      'Mit den Armen hebt er Betonteile und Autos, als wögen sie nichts. Ohne sie ist er ein Mann in mittleren Jahren mit Rückenschmerzen.'],
  ],

  'electro': [
    ['Herrschaft über Strom',
      'Dillon zieht Energie aus jeder Leitung und wirft sie als Blitz zurück. Ein Kraftwerk füllt ihn so weit, dass er ganze Straßenzüge dunkel legt.'],
    ['Körper aus Energie',
      'Sein Leib besteht nicht mehr aus Fleisch, sondern aus Strom, und Schläge gehen deshalb durch ihn hindurch. Aufhalten lässt er sich nur, indem man ihm die Quelle nimmt.'],
    ['Aufsaugen ganzer Netze',
      'Er leert Umspannwerke und Batterien in Sekunden und wächst mit jedem Schluck. Der Arc-Reaktor in Starks Technik ist für ihn genau deshalb so verlockend.'],
  ],

  'sandman': [
    ['Körper aus Sand',
      'Marko zerfällt bei jedem Treffer und setzt sich dahinter wieder zusammen. Fäuste, Kugeln und Netze gehen durch ihn hindurch, ohne etwas auszurichten.'],
    ['Sandriese',
      'Er zieht Masse aus seiner Umgebung an und wächst zu einer Gestalt, die über Häuser hinausragt. Je mehr Sand um ihn liegt, desto größer wird er.'],
    ['Sandstürme',
      'Er löst sich in einen Wirbel auf, der Sicht und Atem nimmt, und bewegt sich darin ungehindert weiter. In dieser Form ist er kaum zu greifen und trotzdem überall.'],
  ],
  'curt-connors': [
    ['Verwandlung in den Lizard',
      'Das Reptilien-Serum schreibt seinen Körper um und macht aus dem Arzt eine Echse von der Größe eines Bären. In dieser Gestalt ist er stark genug, um Autos umzuwerfen, und kaum noch ansprechbar.'],
    ['Nachwachsende Glieder',
      'Die Eidechsen-DNA lässt Verlorenes nachwachsen, und genau deshalb hat er sie sich gespritzt. Sein fehlender Arm ist zurück, sobald er sich verwandelt.'],
    ['Genetiker',
      'Connors ist ein anerkannter Forscher, der die Übertragung von Erbgut zwischen Arten möglich gemacht hat. Sein Wissen fließt in das Heilmittel ein, mit dem Peter Parker ihn am Ende zurückholt.'],
  ],

  'america-chavez': [
    ['Portale zwischen den Universen',
      'Mit einem Tritt stanzt sie ein Loch in den Raum und tritt in eine andere Welt. Anfangs geschieht das nur aus Angst und ohne Steuerung, am Ende öffnet sie genau die Tür, die sie will.'],
    ['Übermenschliche Kraft',
      'Sie schlägt zu wie jemand, der doppelt so schwer ist, und hält Treffer aus, die Erwachsene umwerfen. Ihre Kraft ist der Grund, warum sie den Sprung zwischen den Welten überhaupt überlebt.'],
    ['Sternenfäuste',
      'Wenn sie zuschlägt, leuchtet der Stoß in Sternform auf und trägt die Wucht ihrer Portale mit. Damit reißt sie am Ende ein Loch, durch das eine ganze Wirklichkeit einstürzt.'],
  ],

  'christine-palmer': [
    ['Notfallchirurgin',
      'Palmer arbeitet in der Notaufnahme des Metro-General und rettet Menschen, die andere schon aufgegeben haben. Sie holt auch Stephen Strange zurück, als er mit zerstörten Händen eingeliefert wird.'],
    ['Ruhe am Operationstisch',
      'Sie bleibt gefasst, wenn ein Kollege im Astralkörper neben ihr steht und Anweisungen gibt. Ein Defibrillator gegen ein Wesen aus der Dunklen Dimension ist für sie kein Widerspruch.'],
    ['Die längste Bekanntschaft',
      'Niemand kennt Strange so lange und so genau wie sie, und niemand sonst sagt ihm die Wahrheit ins Gesicht. Genau diese Nähe macht sie in jedem Universum zu seiner wichtigsten Verbindung.'],
  ],

  'christine-palmer-838': [
    ['Forschung am Multiversum',
      'Auf der Erde-838 leitet sie an der Baxter Foundation die Untersuchung fremder Wirklichkeiten. Sie weiß, wie Menschen zwischen Universen reisen, lange bevor Strange dort ankommt.'],
    ['Namensgeberin der Erde-838',
      'Die Bezeichnung für ihre eigene Welt stammt von ihr selbst und steht seither in jeder Akte der Illuminati. Sie ordnet Universen wie andere Leute Fundstücke.'],
    ['Fesseln aus dem Sand von Nisanti',
      'Mit einer Handvoll Sand legt sie einen Zauberer fest, den keine Kette hält. Das Mittel stammt aus dem Bestand der Illuminati, und sie weiß als Einzige, wie man es dosiert.'],
  ],

  'charles-xavier-professor-x': [
    ['Telepathie',
      'Xavier liest Gedanken, spricht ohne Worte und geht in fremde Köpfe, um dort etwas zu finden oder zu ordnen. In Wanda Maximoffs Geist versucht er genau das und stößt auf eine Kraft, die größer ist als seine.'],
    ['Cerebro',
      'Die Maschine verstärkt seine Gabe so weit, dass er jeden Mutanten auf einem Planeten finden kann. Sie ist zugleich seine gefährlichste Stelle, weil sie ihn tief in fremde Gedanken hineinzieht.'],
    ['Gründer der X-Men',
      'Er hat eine Schule für junge Mutanten aufgebaut und sie zu einer Gemeinschaft gemacht. Sein Glaube an ein friedliches Miteinander ist auch dort ungebrochen, wo alle anderen ihn längst aufgegeben haben.'],
  ],

  'reed-richards-mister-fantastic': [
    ['Dehnbarer Körper',
      'Er zieht Arme, Beine und Rumpf über Dutzende Meter und drückt sich durch jede Öffnung. Im Kampf ist das weniger eine Waffe als eine Möglichkeit, überall zugleich zu sein.'],
    ['Überragender Verstand',
      'Richards rechnet Bahnen, Baupläne und Wahrscheinlichkeiten schneller als jeder Rechner seiner Erde. Er baut in wenigen Tagen ein Antriebssystem, mit dem sich ein ganzer Planet verschieben lässt.'],
    ['Führung der Fantastic Four',
      'Er hält vier sehr verschiedene Menschen zusammen, indem er jede Entscheidung mit ihnen durchgeht. Was ihm schwerfällt, ist nicht die Rechnung, sondern zuzugeben, dass er keine hat.'],
  ],

  'reed-richards-838': [
    ['Dehnbarer Körper',
      'Auch dieser Richards zieht seinen Körper in jede Form und Länge. Gegen die Scarlet Witch nützt ihm das nichts, weil sie ihn genau daran zerlegt.'],
    ['Überragender Verstand',
      'Er gilt als klügster Mann seiner Welt und sitzt für diesen Ruf im Rat der Illuminati. Sein Verstand hat allerdings nicht verhindert, dass dieser Rat einen Doctor Strange hinrichtet.'],
    ['Gründer der Baxter Foundation',
      'Von seiner Stiftung kommt die Forschung, mit der die Erde-838 das Multiversum überhaupt vermisst. Christine Palmer arbeitet dort, und ihre Ergebnisse liegen den Illuminati vor.'],
  ],

  'kate-bishop': [
    ['Bogenschießen',
      'Sie sieht als Kind, wie ein Mann in New York mit Pfeil und Bogen eine Invasion aufhält, und übt von da an. Als sie Clint Barton zum ersten Mal begegnet, trifft sie schon fast so gut wie er.'],
    ['Fechten',
      'Zum Bogen kommt die Klinge, und beides gewinnt sie in Wettkämpfen, bevor sie zwanzig ist. Gegen Kazi und die Tracksuit Mafia ist der Degen das, was gerade zur Hand liegt.'],
    ['Nahkampf',
      'Bishop kämpft schnell und ohne Gewicht, sie geht Schlägen aus dem Weg, statt sie zu nehmen. Was ihr fehlt, ist Erfahrung, und die holt sie sich in einer Woche voller Fehler.'],
  ],

  'maya-lopez-echo': [
    ['Bewegungsnachahmung',
      'Sie sieht eine Bewegung einmal und führt sie danach fehlerfrei aus, ob Boxen, Fahren oder Kämpfen mit dem Stock. Gegen Clint Barton nutzt sie genau das und liest ihm seinen nächsten Schlag vom Körper ab.'],
    ['Kräfte ihrer Ahnen',
      'In Oklahoma erfährt sie, dass ihre Familie eine Linie bis zu Chafa zurück hat und dass diese Kraft in ihr steckt. Sie leuchtet in ihren Händen und heilt, was Fisk ihr genommen hat.'],
    ['Nahkampf trotz Gehörlosigkeit',
      'Sie hört nichts und liest dafür Erschütterung, Luftzug und Körperhaltung. Im Kampf ist das kein Nachteil, sondern der Grund, warum sie schneller reagiert als ihre Gegner.'],
  ],

  'wilson-fisk-kingpin': [
    ['Rohe Körperkraft',
      'Fisk ist ein schwerer Mann, der seine Gegner nicht schlägt, sondern zerdrückt. Wenn er die Beherrschung verliert, endet das an einer Autotür oder an einer Wand.'],
    ['Verbrecherimperium',
      'Ihm gehört Hell’s Kitchen über Strohleute, Baufirmen und Banken, und niemand darf seinen Namen aussprechen. Was er aufbaut, nennt er Wiederaufbau, und er glaubt es selbst.'],
    ['Politischer Einfluss',
      'Er kauft Richter, Polizisten und am Ende die Wahl. Als Bürgermeister von New York führt er dieselbe Stadt legal, gegen die er vorher illegal vorgegangen ist.'],
  ],

  'eleanor-bishop': [
    ['Führung von Bishop Security',
      'Sie leitet eine Sicherheitsfirma mit Zugang zu den Gebäuden, Akten und Zeitplänen halb Manhattans. Wer für sie arbeitet, weiß selten, wofür.'],
    ['Kalte Planung',
      'Sie denkt in Jahren und richtet ihr Privatleben nach dem aus, was sich später auszahlt. Die Verlobung mit Jack Duquesne ist ein Posten in dieser Rechnung.'],
    ['Schuld auf andere schieben',
      'Was sie selbst getan hat, liegt am Ende bei jemand anderem auf dem Tisch, samt Beweisen. Ihre Tochter ist die Einzige, die diese Handschrift erkennt.'],
  ],

  'jack-duquesne': [
    ['Schwertkampf',
      'Duquesne führt Degen, Säbel und Katana und schlägt einen Pfeil im Flug entzwei. Was wie ein Hobby des Geldadels aussieht, ist Können auf Wettkampfhöhe.'],
    ['Vermögen aus altem Adel',
      'Hinter ihm steht eine französische Familie mit Landsitz, Sammlung und Anwälten. Genau dieses Geld macht ihn zum bequemsten Verdächtigen, wenn etwas verschwindet.'],
    ['Kochkunst',
      'Er kocht mit derselben Genauigkeit, mit der er ficht, und redet dabei ohne Punkt und Komma. Für Kate Bishop ist das der erste Hinweis darauf, dass er kein Mörder ist.'],
  ],

  'kazi-kazimierczak': [
    ['Treffsicherheit',
      'Kazi ist Scharfschütze und wartet stundenlang auf einen einzigen Schuss. Vom Dach gegenüber trifft er in einem Fenster genau den Mann, der zu viel gesehen hat.'],
    ['Zweiter Mann der Tracksuit Mafia',
      'Er hält die Bande zusammen, während Maya Lopez die Aufträge ausgibt, und kennt jeden Namen darin. Ohne ihn wäre die Truppe längst auseinandergefallen.'],
    ['Doppelspiel für Wilson Fisk',
      'Seine eigentlichen Weisungen kommen von Fisk, auch die gegen seine Freundin aus Kindertagen. Er hält beide Rollen jahrelang durch, und beide kosten ihn das Leben.'],
  ],

  'william-lopez': [
    ['Führung der Tracksuit Mafia',
      'Lopez führt die Bande im Auftrag von Wilson Fisk und hält den Betrieb in Hell’s Kitchen am Laufen. Sein Wort gilt, bis Ronin in ein Treffen platzt.'],
    ['Ausbildung seiner Tochter',
      'Er bringt Maya das Kämpfen bei und schickt sie zugleich auf eine Schule, damit sie herauskommt. Beides zusammen ist der Widerspruch, an dem sie später arbeitet.'],
  ],

  'ivan-banionis': [
    ['Führung der Tracksuit Mafia',
      'Banionis gibt in der Bande den Ton an, meist lauter als nötig, und ruft jeden Anwesenden Bro. Wer nicht spurt, bekommt es mit ihm und zehn Trainingsanzügen zu tun.'],
    ['Nahkampf mit allem Greifbaren',
      'Er kämpft mit Schlagstock, Rohr oder dem, was gerade im Regal steht. Feinheit ist nicht vorgesehen, Menge ersetzt sie.'],
  ],

  'tomas': [
    ['Schlägertrupp der Tracksuit Mafia',
      'Tomas gehört zur Truppe, die Ronin über die Jahre nach dem Fingerschnippen jagt. Er geht in Gruppen vor und selten allein.'],
    ['Fahrer und Späher',
      'Er sitzt am Steuer, hält Ausschau und meldet, wenn sich etwas bewegt. In New York fährt er Verfolgungen, bei denen mehr Blech als Ziel getroffen wird.'],
  ],

  'enrique': [
    ['Schlägertrupp der Tracksuit Mafia',
      'Der junge Tracksuit gehört zur Truppe um Maya Lopez und tritt nie allein auf. Am Rockefeller Center nimmt ihm Jack Duquesne die Waffe ab, bevor er sie überhaupt hebt.'],
  ],

  'dmitri': [
    ['Schlägertrupp der Tracksuit Mafia',
      'Dmitri hält sich im Hintergrund und macht, was ihm gesagt wird. Im Lagerhaus gehört er zu denen, die Clint Barton bewachen sollen.'],
  ],

  'grills': [
    ['Feuerwehrmann in New York',
      'Grills fährt Einsätze und weiß, wie man Menschen aus einem brennenden Gebäude holt. Dieselbe Selbstverständlichkeit bringt er auch mit, als ein Fremder bei ihm auf der Couch liegt.'],
    ['Rollenspieler mit eigener Rüstung',
      'Er kämpft am Wochenende mit selbstgebauten Waffen im Park und nimmt das ernster als seinen Dienstplan. Genau diese Rüstung leiht er später Clint Barton.'],
    ['Kochen für die Gruppe',
      'Er versorgt seine ganze Runde und stellt niemandem eine Frage, der Hunger hat. Es ist die Freundlichkeit, die ihn am Ende das Leben kostet.'],
  ],

  'wendy-conrad': [
    ['Polizistin',
      'Conrad kennt Vorschriften, Funkverkehr und Zuständigkeiten und kann beides trennen: Dienst und Freizeit. Wenn es eng wird, greift sie auf den Dienstweg zurück.'],
    ['Führung der New Yorker Rollenspieler',
      'Sie hält eine Gruppe von Freiwilligen zusammen, gibt Regeln aus und schlichtet Streit um Trefferpunkte. Dieselbe Gruppe stellt sie im Ernstfall in wenigen Minuten auf.'],
    ['Räumung in Minuten',
      'Sie leert einen Platz, ohne dass eine Panik entsteht, weil sie weiß, in welcher Reihenfolge man Menschen anspricht. Für Clint Barton ist das genau die Hilfe, die er braucht.'],
  ],

  'lucky': [
    ['Nase für Pizza',
      'Der Hund findet ein Stück Pizza durch drei Straßenzüge und eine geschlossene Tür. Wo er stehen bleibt, liegt Essen.'],
    ['Sieht auf einem Auge',
      'Nach dem Unfall mit dem Wagen bleibt ihm das rechte Auge, und er kommt damit hervorragend zurecht. Auf der Seite, auf der er nichts sieht, hört er dafür umso genauer.'],
    ['Lässt sich nicht abschütteln',
      'Wer ihn einmal gefüttert hat, wird ihn nicht mehr los, und das gilt auch für Menschen mit Pfeil und Bogen. Genau diese Hartnäckigkeit bringt ihn durch eine ganze Woche voller Verfolgungsjagden.'],
  ],

  'matt-murdock-daredevil': [
    ['Geschärfte Sinne',
      'Die Chemikalie, die ihn als Kind blind macht, hebt alle anderen Sinne weit über das menschliche Maß. Er hört Herzschläge durch Wände und erkennt an ihrem Takt, ob jemand die Wahrheit sagt.'],
    ['Radarsinn',
      'Aus Geräusch, Luftzug und Hitze setzt sich in seinem Kopf ein Bild des Raums zusammen. Damit kämpft er in völliger Dunkelheit besser als seine Gegner im Licht.'],
    ['Nahkampf',
      'Stick bildet ihn von Kindheit an aus. Murdock schlägt hart und ausdauernd, mit Stöcken, die sich zu einem Stab verbinden lassen, und geht danach am nächsten Morgen als Anwalt in den Gerichtssaal.'],
  ],

  'wade-wilson-deadpool': [
    ['Selbstheilung',
      'Der Heilfaktor aus dem Weapon-X-Programm schließt jede Wunde und setzt abgetrennte Glieder wieder an. Sterben kann er nicht, und genau darin liegt der Witz und das Elend seines Lebens.'],
    ['Zwei Katanas und zwei Pistolen',
      'Er kämpft mit beiden Schwertern zugleich und wechselt mitten in der Bewegung zur Waffe. Die Munition geht ihm regelmäßig aus, weil er die Schüsse mitzählt und trotzdem falsch rechnet.'],
    ['Gespräch mit dem Publikum',
      'Er weiß, dass er in einem Film ist, und redet mitten im Kampf zur Kamera. Diese Grenze überschreitet in seiner Welt sonst niemand, und er nutzt das gnadenlos aus.'],
  ],

  'nicepool': [
    ['Goldene Pistolen',
      'Er trägt zwei vergoldete Waffen und zieht sie mit sehr viel mehr Stil als Treffsicherheit. Sein Zubehör ist ihm wichtiger als jede Deckung.'],
    ['Gute Laune',
      'Diese Fassung von Wade Wilson ist freundlich, gepflegt und ohne einen einzigen Selbstzweifel. Sie redet über sich selbst in derselben Menge wie das Original, nur netter.'],
    ['Keine Selbstheilung',
      'Was ihm fehlt, ist ausgerechnet der Heilfaktor, und er sagt es niemandem. Deadpool geht davon aus, dass ein Kopfschuss unter Kollegen keine Folgen hat, und liegt damit falsch.'],
  ],

  'logan-wolverine': [
    ['Adamantium-Klauen',
      'Aus seinen Handrücken fahren drei Klingen aus dem härtesten Metall, das es gibt, und sie schneiden durch alles außer sich selbst. Sein ganzes Skelett ist damit überzogen.'],
    ['Selbstheilung',
      'Wunden schließen sich in Sekunden, Knochen wachsen zusammen, Gift wirkt nicht. Was bleibt, ist die Erinnerung an jede einzelne dieser Wunden.'],
    ['Geschärfte Sinne',
      'Er riecht eine Spur über Tage und hört ein Gespräch durch eine Wand. Genau deshalb findet er in der Leere, was Deadpool nur vermutet.'],
  ],

  'cassandra-nova': [
    ['Telepathie und Telekinese',
      'Sie greift mit den Fingern buchstäblich in fremde Köpfe und hebt Menschen und Fahrzeuge, ohne sie zu berühren. Gegen ihre Gedankenkraft hilft weder Wille noch Panzerung.'],
    ['Zwillingsschwester von Charles Xavier',
      'Sie ist im selben Leib herangewachsen wie der stärkste Telepath der Welt und ihm an Kraft ebenbürtig. Was sie von ihm trennt, ist allein die Frage, wofür sie das einsetzt.'],
    ['Herrschaft über die Leere',
      'In dem Land, in dem alles Gelöschte landet, ist sie die unbestrittene Herrin. Selbst Alioth folgt ihr, und wer sich ihr widersetzt, verschwindet darin.'],
  ],

  'mr-paradox': [
    ['Leitung einer TVA-Abteilung',
      'Paradox führt einen eigenen Bereich der Behörde und entscheidet dort ohne Rückfrage. Seine Beförderung ist ihm wichtiger als jede Vorschrift, die er dabei bricht.'],
    ['Zeitreißer',
      'Sein Gerät löscht eine ganze Zeitlinie auf einen Schlag, statt sie langsam ausbluten zu lassen. Er hält das für Effizienz, und die TVA hält es für einen Grund zur Verhaftung.'],
    ['Zugriff auf jede Zeitlinie',
      'Er öffnet Türen in jede Welt und jeden Zeitpunkt und holt sich heraus, wen er gerade braucht. Wolverine sucht er auf diese Weise aus einem Katalog von Varianten aus.'],
  ],

  'dogpool': [
    ['Selbstheilung',
      'Auch der Hund trägt den Heilfaktor und steht nach jedem Treffer wieder auf. Ihm sieht man das mehr an als seinem Herrchen.'],
    ['Biss',
      'Er beißt zu, sobald jemand zu nah kommt, und lässt nicht wieder los. In der Leere wechselt er damit ohne Zögern die Seiten.'],
  ],

  'blade': [
    ['Kraft eines Vampirs',
      'Er hat die Stärke, die Schnelligkeit und die Heilung der Untoten und keine ihrer Schwächen. Sonnenlicht macht ihm nichts, und genau daher kommt der Name Daywalker.'],
    ['Silberschwert',
      'Seine Klinge aus Silber ist das Werkzeug seines Berufs und liegt ihm näher als jede Schusswaffe. Er zieht sie schnell und führt sie einhändig.'],
    ['Jagd auf Vampire',
      'Blade jagt die Untoten seit Jahrzehnten und weiß über sie mehr als jedes Archiv. In der Leere ist er einer der wenigen, die noch aus Überzeugung kämpfen.'],
  ],

  'marc-spector-steven-grant-moon-knight': [
    ['Rüstung von Khonshu',
      'Auf einen Gedanken legt sich der Anzug des Mondritters um seinen Körper, samt Umhang und Kapuze. Er fängt Kugeln ab und heilt, was durchkommt, solange der Gott ihn behalten will.'],
    ['Halbmondklingen',
      'Aus dem Anzug ziehen sich sichelförmige Wurfwaffen, die er einzeln oder paarweise wirft. Sie kehren zurück, und in Mr. Knights Aufmachung stecken sie im Anzugfutter.'],
    ['Mehrere Persönlichkeiten',
      'In einem Körper leben der Söldner Marc Spector, der freundliche Steven Grant und später Jake Lockley. Was für ihn ein Riss ist, ist im Kampf ein Vorteil, weil der Gegner nie weiß, wer gerade zuschlägt.'],
  ],

  'layla-el-faouly': [
    ['Rüstung des Scarlet Scarab',
      'Als Avatarin von Taweret trägt sie eine goldene Rüstung mit ausfahrbaren Flügeln. Sie fliegt damit über Kairo und fängt Fallende ab, während unter ihr zwei Götter kämpfen.'],
    ['Archäologin',
      'Sie kennt Grabkammern, Inschriften und Händler in halb Ägypten und findet Ammits Grab vor allen anderen. Ihr Vater hat sie in dieses Fach mitgenommen, lange bevor Marc Spector auftauchte.'],
    ['Nahkampf',
      'Sie schlägt sich durch Harrows Anhänger mit Messer, Faust und dem, was gerade greifbar ist. Ihre Ausbildung dazu ist die Straße und nicht die Universität.'],
  ],

  'arthur-harrow': [
    ['Stab mit Ammits Waage',
      'In seinem Stock steckt die Waage, die eine Seele im Voraus wiegt, und sein Urteil vollstreckt er auf der Stelle. Wer nicht besteht, fällt um, bevor er begriffen hat, worum es ging.'],
    ['Sekte in mehreren Ländern',
      'Harrow führt eine Gemeinschaft, die in Alpen und Wüste gleichermaßen Anhänger hat und ohne Waffen auskommt. Sie folgen ihm, weil er ihnen ein Ende aller Verbrechen verspricht.'],
    ['Früherer Avatar Khonshus',
      'Vor Marc Spector hat er selbst für den Mondgott zugeschlagen und kennt deshalb jede seiner Bewegungen. Genau dieses Wissen macht ihn zum gefährlichsten Gegner.'],
  ],

  'khonshu': [
    ['Ägyptischer Mondgott',
      'Khonshu ist der Gott des Mondes und der Rache und richtet über die, die schon zugeschlagen haben. Sein Wort bindet den Avatar, der ihm dient, enger, als diesem lieb ist.'],
    ['Verschiebung des Nachthimmels',
      'Er dreht die Sterne über Kairo zurück und legt einen Himmel aus einer anderen Zeit über die Stadt. Der Rat der Götter verurteilt ihn genau dafür.'],
    ['Wahl eines Avatars',
      'Er sucht sich Menschen, durch die er handeln kann, und gibt ihnen Rüstung und Kraft. Loslassen tut er sie ungern, und Marc Spector muss darum verhandeln.'],
  ],

  'ammit': [
    ['Urteil vor der Tat',
      'Ihre Waage liest in einer Seele, was sie später tun wird, und verurteilt sie dafür sofort. Kinder inbegriffen, und genau daran zerbricht die Zustimmung ihrer eigenen Anhänger.'],
    ['Ägyptische Göttin',
      'Als eine der Ennead trägt sie die Kraft eines Gottes und den Körper eines Krokodilwesens. In Kairo steht sie hausgroß über den Dächern und tritt gegen Khonshu an.'],
    ['Schar von Avataren',
      'Sie braucht einen menschlichen Körper, um zu wirken, und Harrow ist nur der letzte in einer langen Reihe. Ihre Anhänger tragen ihr Zeichen als Waage auf den Unterarmen.'],
  ],

  'kamala-khan-ms-marvel': [
    ['Hartes Licht',
      'Sie formt aus Energie Plattformen, Fäuste und Schilde, die tragen und treffen wie Materie. Was sie baut, hält genau so lange, wie sie daran glaubt.'],
    ['Armreif ihrer Urgroßmutter',
      'Der Reif stammt von Aisha und weckt in Kamala, was ohnehin in ihr steckt. Ein zweiter davon liegt bei Dar-Benn, und zusammen reißen sie Löcher zwischen den Sternen.'],
    ['Zugang zur Noor-Dimension',
      'Ihre Kraft schöpft aus einer Welt hinter dem Schleier, aus der auch die Clandestines kommen. Deshalb funktioniert bei ihr, was bei anderen nur Legende ist.'],
  ],

  'bruno-carrelli': [
    ['Technik und Physik',
      'Bruno rechnet Felder und Frequenzen nach, für die eine Universität ein Semester braucht. Er misst Kamalas Kräfte, bevor sie selbst weiß, was sie damit anfangen soll.'],
    ['Bau von Kamalas Anzug',
      'Er näht, verkabelt und verbessert alles, was sie im Einsatz trägt, aus Teilen des Circle Q. Der erste Anzug entsteht aus einem alten Kostüm und viel Ehrgeiz.'],
    ['Stipendium in Caltech',
      'Seine Begabung öffnet ihm die Tür an eine der besten Hochschulen des Landes. Dass er die Zusage lange verschweigt, hat nur mit einer einzigen Freundschaft zu tun.'],
  ],

  'nakia-bahadir': [
    ['Wahlkampf für den Moscheevorstand',
      'Sie kandidiert gegen eingesessene Männer und gewinnt, weil sie zuhört und nachher etwas ändert. Ihr erster Antrag betrifft den Zustand der Frauenseite.'],
    ['Rückhalt in der Gemeinde',
      'Sie kennt jeden in der Moschee und bringt Menschen zusammen, die sonst aneinander vorbeireden. Für Kamala ist sie die Freundin, bei der nichts erklärt werden muss.'],
  ],

  'kamran': [
    ['Energie aus der Noor-Dimension',
      'Nach seiner Verwandlung leuchtet dieselbe Kraft in ihm, aus der Kamala schöpft, nur ohne jede Übung. Sie bricht aus ihm heraus, sobald er die Beherrschung verliert.'],
    ['Kraftstöße aus den Händen',
      'Er schleudert Druckwellen, die Autos umwerfen und Wände aufreißen. Zielen kann er damit anfangs nicht, und genau das macht ihn gefährlich.'],
  ],

  'muneeba-khan': [
    ['Zusammenhalt der Familie',
      'Sie hält das Haus, die Feiern und die Regeln zusammen und lässt sich davon nicht abbringen. Ihre Strenge ist der Grund, warum Kamala lange nichts erzählt, und ihre Offenheit der Grund, warum sie es am Ende doch tut.'],
    ['Näherin von Kamalas erstem Anzug',
      'Aus einem alten Burkini und viel Stoff näht sie das Kostüm, mit dem ihre Tochter zum ersten Mal öffentlich auftritt. Es ist ihr Weg zu sagen, dass sie einverstanden ist.'],
  ],
  'gorr': [
    ['Necroschwert',
      'Die Klinge aus der Waffe eines Gottes vergiftet jeden, den sie schneidet, und tötet Unsterbliche. Sie flüstert ihrem Träger zugleich zu, was er tun soll, und zehrt ihn dabei auf.'],
    ['Schattenwesen',
      'Aus dem Dunkel um ihn herum wachsen Kreaturen mit Zähnen und Klauen, die auf sein Wort hin angreifen. In Neu-Asgard schickt er eine ganze Schar davon zwischen die Häuser.'],
    ['Götterschlächter',
      'Er hat Rapu und danach Gott um Gott getötet und weiß deshalb, wo jeder von ihnen verwundbar ist. Sein Wissen über die Reiche ist so groß, dass Thor ihm dabei nichts entgegenzusetzen hat.'],
  ],

  'korg': [
    ['Körper aus Stein',
      'Kronaner bestehen aus Fels, und deshalb macht ihm kaum etwas etwas aus. Papier dagegen schneidet ihn, sagt er selbst, und niemand weiß, ob das ein Scherz ist.'],
    ['Übermenschliche Kraft',
      'Er hebt, was ein Team von Menschen nicht bewegt, und schlägt Wachen beiseite, als räume er auf. In der Arena von Sakaar ist er Publikumsliebling, ohne je hart zuzuschlagen.'],
    ['Gelassenheit',
      'Korg erzählt von der gescheiterten Revolution, für die er zu wenige Flugblätter gedruckt hat, während um ihn herum die Welt untergeht. Diese Ruhe ist seine eigentliche Kraft, sie hält halbe Mannschaften zusammen.'],
  ],

  'zeus': [
    ['Thunderbolt',
      'Sein Blitzbündel schlägt mit der Wucht eines Gewitters ein und kehrt in seine Hand zurück. Thor nimmt es ihm ab und führt es danach selbst weiter.'],
    ['Herrscher über den Götterrat',
      'Im Omnipotenzrat sitzen die Götter aller Welten, und er entscheidet dort, worüber überhaupt gesprochen wird. Seine Antwort auf Gorr ist, nichts zu tun und weiterzufeiern.'],
    ['Unsterblichkeit',
      'Er lebt seit Ewigkeiten und hält sich für unangreifbar, weil ihn bisher nichts erreicht hat. Selbst sein eigener Blitz durch die Brust bringt ihn nur für eine Weile zum Schweigen.'],
  ],

  'love': [
    ['Kosmische Strahlen',
      'Aus ihren Augen fährt gebündelte Energie, wie sie sonst nur Götter und Eternals werfen. Eternity hat sie zurückgeholt, und diese Kraft ist mitgekommen.'],
    ['Übermenschliche Kraft',
      'Das Kind hält Treffer aus, die Erwachsene umwerfen, und schlägt Feinde durch die Luft. Sie muss dabei erst lernen, wie viel davon nötig ist.'],
    ['Stormbreaker',
      'Thor überlässt ihr die Axt, und sie führt sie, als hätte sie nie etwas anderes getan. Wer sie heben kann, gilt als würdig, und bei ihr fragt niemand nach.'],
  ],

  'jennifer-walters-she-hulk': [
    ['Verwandlung in She-Hulk',
      'Das Blut ihres Cousins bringt ihr dieselbe Verwandlung, nur ohne den Verlust des Verstandes. Sie wechselt zwischen beiden Gestalten, wann sie will, und bleibt in beiden dieselbe Person.'],
    ['Übermenschliche Kraft',
      'Als She-Hulk hebt sie Fahrzeuge, hält Hubschrauber fest und schlägt sich durch Wände. Ihre Kraft reicht an die von Bruce Banner heran, ohne dass sie dafür wütend werden müsste.'],
    ['Anwältin für Übermenschen',
      'Sie leitet eine eigene Abteilung für Mandanten mit Kräften und kennt das Recht dazu besser als jeder Richter. Ihr größter Fall ist der um ihren eigenen Namen.'],
  ],

  'nikki-ramos': [
    ['Assistentin und Rückhalt',
      'Ramos hält Jennifer Walters den Rücken frei und sagt ihr als Einzige, wenn sie sich lächerlich macht. Sie folgt ihr von der Staatsanwaltschaft in die neue Kanzlei, ohne zu fragen.'],
    ['Kenntnis der Szene',
      'Sie weiß, wer im Netz über Übermenschen redet und wo sich die Mandantschaft aufhält. Über sie kommen die Fälle herein, die sonst niemand fände.'],
    ['Organisationstalent',
      'Termine, Garderobe und Auftritte laufen, weil sie sie plant. Ohne ihre Listen stünde die Abteilung für Übermenschen nach einer Woche still.'],
  ],

  'titania': [
    ['Übermenschliche Kraft',
      'Titania hebt Autos und wirft Gegner durch Wände, und im Gerichtssaal räumt sie dabei die halbe Einrichtung ab. Woher die Kraft stammt, sagt sie in keinem ihrer Videos.'],
    ['Eigene Produktlinie',
      'Ihr Name steht auf Kosmetik, Kleidung und allem, was sich verkaufen lässt. Deshalb führt sie den Streit um die Marke She-Hulk auch bis vor Gericht.'],
    ['Ringkampf',
      'Sie kämpft wie eine Wrestlerin, mit Auftritt, Griffen und Blick zur Kamera. Wer sie ernst nimmt, hat den ersten Wurf schon hinter sich.'],
  ],

  'namor': [
    ['Flug',
      'Die Flügel an seinen Fußgelenken tragen ihn durch die Luft und machen ihn zum einzigen Talokani, der über Wasser kämpfen kann. Er stößt damit von oben in ein Schiff hinein.'],
    ['Übermenschliche Kraft',
      'Unter Wasser hebt er ganze Fahrzeuge an und reißt Schiffsrümpfe auf. An Land verliert er einen Teil davon, sobald seine Haut austrocknet.'],
    ['König von Talokan',
      'Er führt seit fünfhundert Jahren ein Volk, das die Welt darüber nicht kennt, und bringt eine Armee mit, die aus dem Meer kommt. Sein Angebot an Wakanda ist ein Bündnis, das keine Ablehnung vorsieht.'],
  ],

  'koenigin-ramonda': [
    ['Königin von Wakanda',
      'Nach dem Tod ihres Sohnes übernimmt sie den Thron und hält ein Land zusammen, das seinen Beschützer verloren hat. Sie regiert ohne Kraut und ohne Anzug, allein mit ihrer Haltung.'],
    ['Autorität vor dem Stammesrat',
      'Wenn sie spricht, schweigen die Stämme, auch die, die sonst gegeneinander reden. Ihr Wort holt selbst M’Baku aus den Bergen an den Tisch.'],
    ['Verhandlungsgeschick',
      'Vor den Vereinten Nationen führt sie den Gegnern Wakandas ihre eigenen Söldner vor und beendet die Debatte in einem Satz. Sie verhandelt, indem sie den anderen zeigt, was sie bereits weiß.'],
  ],

  'riri-williams': [
    ['Selbstgebaute Rüstung',
      'Aus Teilen von Schrottplätzen und der Werkstatt des MIT baut sie eine Rüstung, die fliegt und schießt. Shuri baut ihr später eine zweite aus Vibranium, und Riri versteht sie in wenigen Stunden.'],
    ['Überragender Verstand',
      'Mit fünfzehn studiert sie am MIT und rechnet dort Dinge nach, für die es keinen Kurs gibt. Ihre Aufnahme in die Hochschule ist selbst ein Nebenprodukt ihrer Neugier.'],
    ['Erfindergeist',
      'Sie sieht in jeder Maschine, was daran fehlt, und baut es über Nacht dazu. Genau diese Fähigkeit macht sie für Leute interessant, mit denen sie besser nichts zu tun hätte.'],
  ],

  'ouroboros-o-b': [
    ['Technik der TVA',
      'O.B. kennt jedes Gerät der Behörde bis zur letzten Schraube, weil er die meisten davon selbst gewartet hat. Wenn etwas nicht läuft, ist er der Einzige, der weiß, warum.'],
    ['Handbuch aus eigener Feder',
      'Das TVA-Handbuch stammt von ihm, und er hat jede Fassung selbst geschrieben. Genau daraus schreibt Jahrzehnte früher ein gewisser Victor Timely ab.'],
    ['Temporalwebstuhl',
      'Er hält die Maschine am Laufen, in der die Zeit selbst gesponnen wird, und weiß als Einziger, wo ihre Grenzen liegen. Sein Vorschlag, die Ringe zu erweitern, ist die letzte Rettung.'],
  ],

  'victor-timely': [
    ['Erfindergeist',
      'Im Chicago von 1893 stellt er Maschinen vor, die es dort noch nicht geben dürfte, und verkauft sie als eigene Idee. Seine Baupläne kommen aus einem Handbuch, das ein Jahrhundert zu früh in seine Hände gefallen ist.'],
    ['Variante von Kang',
      'Er trägt dasselbe Gesicht wie der Mann am Ende der Zeit und weiß nichts davon. Für die TVA ist genau das der Grund, ihn zu suchen und zu schützen.'],
    ['Bauplan des Temporalwebstuhls',
      'Er versteht die Zeichnungen so weit, dass er die Ringe der Maschine berechnen kann. Was ihn dabei tötet, ist der Weg dorthin und nicht die Rechnung.'],
  ],

  'cassie-lang': [
    ['Eigener Pym-Anzug',
      'Aus den Resten in der Werkstatt ihres Vaters baut sie sich einen eigenen, und der funktioniert. Sie steht damit im Quantenreich, bevor sie überhaupt Auto fahren darf.'],
    ['Größenveränderung',
      'Sie wächst und schrumpft wie ihr Vater, nur mit weniger Übung und mehr Wut. Gegen die Truppen von Kang hilft ihr, dass sie sich nicht überlegt, ob es klappt.'],
    ['Signal ins Quantenreich',
      'Ihr Sender soll eine Karte der unteren Welt zeichnen. Er zieht stattdessen die ganze Familie hinunter, und daran hängt alles Weitere.'],
  ],

  'kang-der-eroberer': [
    ['Rüstung mit Energiewaffen',
      'Sein Anzug wirft Strahlen, hält Treffer ab und lässt ihn schweben. Gegen Ant-Man und Wasp zugleich reicht er aus, ohne dass Kang die Haltung ändert.'],
    ['Multiversum-Schiff',
      'Sein Schiff reist zwischen Zeiten und Welten und ist der Grund, warum er das Quantenreich verlassen will. Ohne den Kern daraus ist er dort gefangen.'],
    ['Kriegsführung',
      'Er hat Zeitlinien erobert, ausgelöscht und neu aufgeteilt und kennt jeden Ausgang eines Kampfes im Voraus. Was ihn schlägt, ist nicht Stärke, sondern eine Menge Ameisen.'],
  ],

  'high-evolutionary': [
    ['Erschaffung ganzer Völker',
      'Aus Tieren macht er sprechende Wesen und aus ganzen Welten Versuchsanordnungen. Was seinem Bild nicht entspricht, wird eingeschmolzen, und das gilt auch für einen bewohnten Planeten.'],
    ['Kraftfelder',
      'Seine Rüstung erzeugt Schilde, die Schüsse und Schläge abfangen, und Stöße, die einen Raum leeren. Erst als Rocket ihm die Maske vom Gesicht schlägt, greift etwas davon nicht mehr.'],
    ['Flotte der OrgoCorp',
      'Ihm gehören Schiffe, Stationen und ein Konzern, der halbe Sektoren mit Ersatzteilen für Körper versorgt. Diese Macht erlaubt es ihm, jede Frage nach seinen Versuchen zu übergehen.'],
  ],

  'adam-warlock': [
    ['Energiestöße',
      'Aus seinen Händen kommt gebündelte kosmische Energie, stark genug, um ein Raumschiff aufzureißen. Er setzt sie ein wie ein Kind, das seine Kraft noch nicht kennt, und richtet damit mehr Schaden an als beabsichtigt.'],
    ['Flug',
      'Warlock fliegt schneller, als die Guardians ausweichen können, und ohne jede Technik. Der Ansturm auf ihr Quartier dauert deshalb nur Sekunden.'],
    ['Kokonkörper',
      'Ayesha züchtet ihn im Kokon als vollkommenes Wesen, und geholt wird er zu früh. Was bleibt, ist eine Haut, der Schläge und Kälte kaum etwas anhaben, über einem Verstand, der noch nicht so weit ist.'],
  ],

  'gravik': [
    ['Gestaltwandel',
      'Wie jeder Skrull trägt er jedes Gesicht, das er berührt hat, samt Stimme und Haltung. Er nutzt das, um an beiden Enden eines Krieges zugleich zu stehen.'],
    ['Kräfte des Super-Skrull',
      'Aus dem Erbgut von Groot, Cull Obsidian, Flerken und anderen baut er sich in Mar-Vells Labor ein Wesen mit vielen Kräften zugleich. Er ist der Erste, der die Maschine an sich selbst ausprobiert.'],
    ['Führung der Skrull-Rebellen',
      'Er sammelt die, denen das Warten auf eine Heimat zu lange dauert, und macht daraus eine Armee ohne Gesicht. Sein Plan ist, die Großmächte der Erde ihren Krieg selbst führen zu lassen.'],
  ],

  'g-iah': [
    ['Gestaltwandel',
      'Sie wechselt Gesichter schneller als jeder in Graviks Umgebung und bleibt deshalb so lange unentdeckt. Als Doppelagentin ist das ihre wichtigste Fähigkeit.'],
    ['Kräfte des Super-Skrull',
      'Sie nimmt dieselbe Behandlung wie Gravik und trägt danach die Kräfte der Avengers in einem Körper. Im Duell gegen ihn entscheidet nicht die Stärke, sondern wer sie besser einteilt.'],
    ['Doppelagentin',
      'Sie arbeitet in Graviks innerem Kreis und meldet zugleich an Nick Fury. Was sie dazu bringt, ist nicht die Erde, sondern der Tod ihrer eigenen Eltern.'],
  ],

  'sonya-falsworth': [
    ['Führungsebene des MI6',
      'Falsworth entscheidet, welche Akte in London jemals gelesen wird, und schickt Leute los, ohne den Dienstweg zu erwähnen. Ihre eigene Regierung erfährt selten, woran sie gerade arbeitet.'],
    ['Verhörkunst',
      'Sie führt Gespräche mit Teekanne und Skalpell in derselben Ruhe und bekommt von beidem am Ende das Ergebnis. Wer sich ihr widersetzt, redet meistens trotzdem.'],
    ['Netz aus eigenen Quellen',
      'Sie hat überall jemanden sitzen, auch dort, wo der MI6 offiziell nichts zu suchen hat. Genau daraus zieht sie die Auskünfte, die Nick Fury mehrmals das Leben retten.'],
  ],

  'praesident-james-ritson': [
    ['Präsident der USA',
      'Ritson entscheidet im Ernstfall über Krieg und Frieden und wird genau darauf angesetzt. Sein Amt ist die eigentliche Waffe, auf die es Gravik abgesehen hat.'],
    ['Oberbefehl über die Streitkräfte',
      'Ein Wort von ihm setzt Flotten und Bomber in Bewegung. Nach dem Anschlag ist er bereit, dieses Wort zu sprechen, ohne zu wissen, wer den Anschlag wirklich ausgeführt hat.'],
  ],
  'chula': [
    ['Wissen der Choctaw-Ahnen',
      'Chula kennt die Geschichten der Linie bis zu Chafa zurück und weiß, was darin steckt. Sie ist es, die Maya den Weg zu dieser Kraft öffnet, statt ihn ihr zu erklären.'],
    ['Heilkunde',
      'Sie versorgt Wunden mit dem, was in der Küche und im Garten steht, und tut es ohne Aufhebens. Maya kommt mit einer Schusswunde zu ihr und nicht in ein Krankenhaus.'],
    ['Zusammenhalt der Familie',
      'Sie hält eine Familie zusammen, die auseinandergefallen ist, und lässt die Tür auch für die offen, die jahrelang nichts von sich hören ließen. Genau das ist der Grund, warum Maya überhaupt zurückkommt.'],
  ],

  'bonnie': [
    ['Bindung an die Gemeinde',
      'Bonnie kennt in Tamaha jeden und fährt bei der Feuerwehr mit, wenn es brennt. Wer zurückkommt, wird von ihr wieder eingereiht, ohne Fragen nach den Jahren dazwischen.'],
    ['Rollschuhbahn als Treffpunkt',
      'Die Bahn der Familie ist der Ort, an dem sich in der Stadt alles trifft, und sie hält ihn am Laufen. Auch Maya findet dort zurück in ein Leben ohne Fisk.'],
  ],

  'henry-lopez': [
    ['Führung des Familienbetriebs',
      'Henry hält die Rollschuhbahn und die Spedition am Laufen und sorgt dafür, dass beides der Familie gehört. Ohne ihn hätte Maya in Oklahoma nichts, wohin sie zurückkommen könnte.'],
    ['Kontakte in beide Welten',
      'Er arbeitet für Fisks Spedition und lebt zugleich in der Gemeinde der Choctaw. Diese Doppelrolle bringt ihm Auskünfte ein, die keiner der beiden Seiten gefallen.'],
  ],

  'dar-benn': [
    ['Zweiter Kree-Armreif',
      'Der Reif aus Aishas Erbe gibt ihr dieselbe Kraft wie Kamala Khan, nur ohne jede Zurückhaltung. Sie reißt damit Sprungpunkte auf und holt sich, was ihr Planet nicht mehr hat.'],
    ['Universalwaffe',
      'Ihr Hammer stammt aus dem Bestand der Ankläger und schlägt mit der Wucht eines Schiffes zu. Sie führt ihn einhändig und benutzt ihn auch, um Löcher in den Raum zu treiben.'],
    ['Oberste Anklägerin der Kree',
      'Sie führt ein Volk auf einer sterbenden Welt und hat die Vollmacht, dafür jeden Krieg zu beginnen. Ihre Rechnung geht an Carol Danvers, die Hala einmal die Sonne genommen hat.'],
  ],

  'hank-mccoy-beast': [
    ['Übermenschliche Kraft und Beweglichkeit',
      'Der Mutant springt über ganze Räume, klettert an Decken und schlägt zu wie ein Raubtier. Sein blaues Fell ist die sichtbare Seite dessen, was ihn körperlich von Menschen trennt.'],
    ['Wissenschaftler von Rang',
      'McCoy ist Genetiker und Arzt und einer der klügsten Köpfe seiner Welt. Er hat die Mutation der X-Men selbst erforscht, seine eigene eingeschlossen.'],
    ['Berater des Präsidenten',
      'In seinem Universum sitzt er als Regierungsvertreter am Tisch und spricht dort für die Mutanten. Diese Rolle macht ihn zum Bindeglied zwischen zwei Seiten, die einander misstrauen.'],
  ],

  'billy-maximoff-wiccan': [
    ['Chaosmagie',
      'Er trägt dieselbe Kraft wie seine Mutter, nur ohne die Trauer, aus der sie entstanden ist. In seinen Händen leuchtet sie blau statt rot.'],
    ['Wirklichkeit aus Worten',
      'Was er ausspricht, geschieht, solange er es genau genug meint. Genau deshalb reicht ein einziger Satz, um sich selbst nach dem Ende von Westview wieder in einen Körper zu setzen.'],
    ['Sohn von Wanda Maximoff',
      'Aus der Illusion von Westview stammt er, und aus ihr bringt er seine Kraft mit. Seine Suche nach dem verschwundenen Bruder ist der Grund für alles, was er danach tut.'],
  ],

  'rio-vidal': [
    ['Der Tod in Gestalt einer Hexe',
      'Hinter der Frau, die neben Agatha herläuft, steht das Ende selbst. Sie holt sich, was ihr zusteht, und sie hat dabei alle Zeit der Welt.'],
    ['Grüne Magie',
      'Ihre Kraft leuchtet grün und lässt wachsen und verwesen im selben Atemzug. Sie ist die einzige Hexe auf der Straße, deren Zauber niemand nachahmt.'],
    ['Tod durch Berührung',
      'Wen sie anfasst, den nimmt sie mit, ohne Formel und ohne Aufwand. Agatha hat dieser Berührung Jahrhunderte lang ausweichen können, und irgendwann hört das auf.'],
  ],

  'lilia-calderu': [
    ['Wahrsagerei mit dem Tarot',
      'Ihre Karten zeigen ihr, was kommt, und sie liest sie schneller, als sie sie legt. Was sie dabei sieht, behält sie meistens für sich.'],
    ['Leben außerhalb der Reihenfolge',
      'Sie erlebt ihr Leben nicht von vorn nach hinten, sondern in Sprüngen, und weiß deshalb oft nicht, wann sie gerade ist. Genau daraus zieht sie die Gewissheit, wann und wofür sie sterben wird.'],
    ['Schutzzauber',
      'Als Hexenkönigin von Sizilien beherrscht sie Bannzeichen, die selbst dem Tod eine Weile im Weg stehen. Ihr letzter Kreis hält lange genug, damit die anderen weiterkommen.'],
  ],

  'jennifer-kale': [
    ['Trankhexe',
      'Sie mischt aus Kräutern und Wurzeln, was heilt, betäubt oder öffnet, und kennt jede Dosierung. Ihre Tränke sind das Einzige, was auf der Straße der Hexen sicher wirkt.'],
    ['Kräuterkunde',
      'Sie erkennt jede Pflanze am Geruch und weiß, was daraus zu machen ist. Ihre Wellness-Produkte sind das, was von diesem Wissen übrig bleibt, solange der Fluch auf ihr liegt.'],
    ['Macht unter einem Fluch',
      'Ein fremder Bann hält ihre eigentliche Kraft fest, und sie kommt nicht daran heran. Was sie kann, wenn er fällt, sieht man erst am Ende der Straße.'],
  ],

  'alice-wu-gulliver': [
    ['Schutzzauber',
      'Sie stellt Bannkreise auf, an denen fremde Magie abprallt, und hält damit den ganzen Zirkel am Leben. Es ist das Erbe ihrer Mutter, das sie jahrzehntelang nicht anrühren wollte.'],
    ['Rockmusik als Zauber',
      'In ihrer Familie geht die Kraft über Lieder, und ein einziger Song ihrer Mutter trägt einen Fluch und dessen Gegenmittel. Sie singt ihn erst, als es nicht mehr anders geht.'],
    ['Personenschutz',
      'Als ausgebildete Polizistin und Wachfrau geht sie voran, wenn es eng wird. Ihre Ausbildung ist der Teil an ihr, der nichts mit Magie zu tun hat und trotzdem am häufigsten hilft.'],
  ],

  'joaquin-torres-falcon': [
    ['Flügelanzug',
      'Sam Wilson gibt ihm die Flügel weiter, und Torres fliegt sie schneller, als er sie beherrscht. Der Anzug bringt ihn über jedes Gelände und einmal auch weit unter Wasser.'],
    ['Ausbildung bei der Air Force',
      'Torres ist Offizier und in Louisiana zuerst Verbindungsmann, nicht Held. Seine Ausbildung ist der Grund, warum Wilson ihm den Namen überhaupt anvertraut.'],
    ['Aufklärung aus der Luft',
      'Bevor er selbst fliegt, führt er Drohnen und liest Bewegungsbilder. Er findet die Flag Smashers, während offizielle Stellen noch bestreiten, dass es sie gibt.'],
  ],

  'bullseye': [
    ['Treffsicherheit',
      'Poindexter trifft mit allem, was er in die Hand nimmt, ob Gewehr, Bleistift oder Billardkugel. Er berechnet Abpraller im Kopf und trifft damit um Ecken herum.'],
    ['FBI-Scharfschütze',
      'Er hat als Präzisionsschütze für die Bundespolizei gearbeitet und dort jede Prüfung mit Bestwerten bestanden. Was ihn aus dem Dienst wirft, ist nicht sein Können.'],
    ['Nahkampf',
      'Kommt jemand zu nah, kämpft er ebenso genau wie auf Entfernung und nutzt jeden Gegenstand im Raum. Gegen Daredevil hält er sich damit erstaunlich lange.'],
  ],

  'frank-castle-punisher': [
    ['Ausbildung bei den Marines',
      'Castle kommt aus mehreren Einsätzen als Scharfschütze zurück und bringt das Handwerk mit nach Hause. Was er dort gelernt hat, wendet er nach dem Mord an seiner Familie auf New York an.'],
    ['Schweres Arsenal',
      'Gewehre, Sprengstoff, Messer, Fahrzeuge: Castle rüstet sich aus, als plane er einen Feldzug, und genau das tut er. Sein Vorgehen ist Vorbereitung, nicht Wut.'],
    ['Nahkampf ohne Rücksicht',
      'Er nimmt Treffer hin, um seinen eigenen anzubringen, und steht danach wieder auf. Der Unterschied zu Daredevil ist nicht die Härte, sondern die Grenze, die Castle nicht kennt.'],
  ],

  'vanessa-fisk': [
    ['Führung der Geschäfte ihres Mannes',
      'Wenn Wilson Fisk nicht kann oder nicht darf, führt sie sein Reich weiter und trifft dieselben Entscheidungen. Die Familien der Stadt verhandeln mit ihr, ohne sich zu beschweren.'],
    ['Kunsthandel als Fassade',
      'Ihre Galerie ist der saubere Teil, über den das schmutzige Geld läuft. Kunst versteht sie dabei wirklich, und genau das macht die Fassade so haltbar.'],
    ['Einfluss auf Fisk',
      'Sie ist der einzige Mensch, vor dem er die Stimme senkt und seine Pläne ändert. Wer an ihn heran will, kommt an ihr nicht vorbei.'],
  ],

  'muse': [
    ['Kunstwerke aus dem Blut seiner Opfer',
      'Er malt großflächige Bilder mit dem, was er seinen Opfern abnimmt, und stellt sie öffentlich aus. Die halbe Stadt feiert ihn dafür, bevor jemand fragt, woher die Farbe stammt.'],
    ['Nahkampf',
      'Er ist schnell, zäh und im Zweifel bereit, jeden Treffer einzustecken. Gegen Daredevil hält er sich, weil er keine Rücksicht nimmt, auch nicht auf sich selbst.'],
    ['Kenntnis der Stadt',
      'Muse bewegt sich durch Tunnel, Dächer und leerstehende Häuser, als hätte er den Stadtplan im Kopf. Deshalb findet ihn niemand, obwohl seine Bilder überall hängen.'],
  ],

  'karen-page': [
    ['Recherche',
      'Page zieht aus Akten, Registern und Gesprächen heraus, was andere übersehen, und lässt nicht locker. Ihre Artikel bringen Dinge ans Licht, für die es keine Zeugen mehr gibt.'],
    ['Kanzleiarbeit',
      'Sie hat bei Nelson und Murdock alles zusammengehalten, von der Post bis zu den Ermittlungen. Ihre Kenntnis der Fälle ist der Grund, warum die Kanzlei überhaupt bestanden hat.'],
    ['Blick hinter die Akte',
      'Wo eine Behörde einen Vorgang abschließt, fängt sie an zu fragen. Genau dieser Trotz hat sie schon einmal in die Nähe von Wilson Fisk gebracht und wird es wieder tun.'],
  ],

  'connor-powell': [
    ['Polizist im Streifendienst',
      'Powell trägt Uniform und kennt jede Regel, die er beugt. Seine Aussage bringt Hector Ayala vor Gericht, obwohl sie nachweislich nicht stimmt.'],
    ['Anti-Vigilanten-Einheit',
      'Unter Bürgermeister Fisk gehört er zu den Ersten, die Jagd auf Maskierte machen dürfen. Die Einheit gibt ihm genau die Freiheit, die er vorher heimlich genommen hat.'],
  ],

  'cole-north': [
    ['Polizist der Anti-Vigilanten-Einheit',
      'North kommt aus Chicago und verfolgt Maskierte mit dem Eifer eines Bewunderers. Er hält den Punisher für ein Vorbild und merkt zu spät, was das aus ihm macht.'],
    ['Ermittlungsarbeit',
      'Er arbeitet gründlich, fragt nach und stellt Zusammenhänge her, die anderen entgehen. Genau das führt ihn am Ende in einen Widerspruch, den er nicht mehr auflösen kann.'],
  ],

  'white-tiger': [
    ['Tigeramulett',
      'Das Amulett aus seiner Familie gibt ihm Kraft, Schnelligkeit und Reflexe eines Raubtiers. Es ist Erbstück und Verpflichtung in einem, und er legt es nie ganz ab.'],
    ['Kampfkunst',
      'Ayala kämpft geübt und beweglich und nimmt es mit mehreren Angreifern zugleich auf. In der U-Bahn setzt er das ein, um jemanden zu schützen, und steht danach vor Gericht.'],
    ['Übermenschliche Reflexe',
      'Er weicht Schlägen und Schüssen aus, die kein Mensch kommen sieht. Was ihn am Ende trifft, kommt aus einer Richtung, in der er keinen Gegner erwartet.'],
  ],

  'parker-robbins-the-hood': [
    ['Dämonische Kapuze',
      'Der Umhang gibt ihm Kraft, die er sich nicht verdient hat, und nimmt sich dafür Stück für Stück seinen Verstand. Woher das Ding stammt, will er lieber nicht wissen.'],
    ['Unsichtbarkeit und Levitation',
      'Mit der Kapuze verschwindet er aus dem Bild und schwebt über den Boden. Für Einbrüche und Überfälle ist das die vollkommene Ausrüstung.'],
    ['Bande aus Kleinkriminellen',
      'Er sammelt Leute mit Fähigkeiten und ohne Aussicht und macht daraus eine Truppe für seine Aufträge. Riri Williams ist die Einzige darin, die er wirklich braucht.'],
  ],
  'n-a-t-a-l-i-e': [
    ['Nachbildung einer Toten',
      'Riri baut sie aus Aufnahmen, Nachrichten und Videos ihrer besten Freundin und trifft damit deren Stimme und Art. Was daraus entsteht, ist eine eigene Person und zugleich eine offene Wunde.'],
    ['Steuerung der Rüstung',
      'Sie fliegt, zielt und rechnet mit, während Riri sich um alles andere kümmert. Ohne sie wäre der Anzug ein Stück Blech mit Triebwerken.'],
    ['Rechenleistung im Gefecht',
      'Sie wertet in Sekundenbruchteilen aus, wer im Raum steht und wo die Wand nachgibt. Genau dieses Tempo ist im Kampf gegen den Hood der Unterschied.'],
  ],

  'ezekiel-stane': [
    ['Biomimetische Mechatronik',
      'Er baut Technik, die sich wie Muskeln und Sehnen bewegt und sich an den Träger anpasst. Damit stellt er Ausrüstung her, an der ganze Konzerne scheitern.'],
    ['Erfindergeist',
      'Wie sein Vater sieht er in jeder fremden Entwicklung sofort, was sich daraus machen lässt. Was ihm fehlt, ist ein Name, unter dem er das verkaufen dürfte.'],
    ['Bunker voll Schwarzmarkttechnik',
      'In seinem Versteck lagert, was auf keinem Markt sein dürfte, von Stark-Teilen bis zu fremder Rüstung. Der Hood kauft dort ein, ohne zu wissen, wessen Sohn ihn beliefert.'],
  ],

  'mephisto': [
    ['Handel mit Seelen',
      'Er gibt jedem, was dieser will, und lässt sich in einer Währung bezahlen, die man nur einmal ausgeben kann. Die Verträge sind wörtlich zu nehmen, und darauf verlässt er sich.'],
    ['Formung der Wirklichkeit',
      'Was er zusagt, geschieht, ob Reichtum, Erfolg oder ein zweites Leben. Die Bedingung dazu steht im Kleingedruckten, das niemand liest.'],
    ['Unsterblichkeit',
      'Er existiert außerhalb von Alter und Tod und hat deshalb alle Zeit, auf seine Gegenleistung zu warten. Wer ihn loswerden will, muss schneller sein als seine Geduld.'],
  ],

  'bob-sentry': [
    ['Kraft von einer Million Sonnen',
      'Das Serum aus einem gescheiterten Programm macht aus einem Mann aus Florida das mächtigste Wesen der Erde. Er hebt Gebäude, hält Flugzeuge auf und weiß selbst nicht, wo die Grenze liegt.'],
    ['Flug und Unverwundbarkeit',
      'Er fliegt schneller als jedes Fluggerät, und nichts von dem, was auf ihn abgefeuert wird, dringt durch. Aufhalten lässt er sich nicht von außen, sondern nur von innen.'],
    ['Void',
      'Seine eigene Dunkelheit tritt als zweite Gestalt aus ihm heraus und legt New York in Schatten. Wen dieser Schatten berührt, den sperrt er in den schlimmsten Moment seines Lebens.'],
  ],

  'valentina-allegra-de-fontaine': [
    ['Leitung der CIA',
      'Sie führt einen Dienst und mehrere Programme, die offiziell nicht bestehen. Wo etwas schiefgeht, steht ihre Unterschrift nirgends, und die Akte dazu hat sie längst.'],
    ['Anwerbung beschädigter Leute',
      'Yelena Belova, John Walker, Bob: Sie sucht sich Leute im schlechtesten Moment ihres Lebens und macht ihnen ein Angebot. Wer nichts zu verlieren hat, stellt keine Fragen.'],
    ['Netz aus Gefälligkeiten',
      'Ihre eigentliche Waffe ist, wer ihr etwas schuldet. Sie taucht in Wohnungen und auf Friedhöfen auf, redet zwei Minuten und geht mit einer Zusage wieder.'],
  ],

  'sue-storm-invisible-woman': [
    ['Unsichtbarkeit',
      'Sie lenkt das Licht um sich herum und verschwindet daraus, und dasselbe gelingt ihr mit anderen Menschen und Gegenständen. Im Ernstfall macht sie ein ganzes Fahrzeug unsichtbar.'],
    ['Kraftfelder',
      'Aus ihren Händen entstehen Schilde, Kugeln und Rampen aus reiner Kraft, die Geschosse und Trümmer abfangen. Dieselben Felder setzt sie zum Werfen ein, indem sie sie in einem Gegner ausdehnt.'],
    ['Verhandlung für die ganze Erde',
      'Sie spricht vor Regierungen und einmal auch vor einem Weltenfresser. Ihre Ruhe ist der Grund, warum aus dem Ultimatum an die Erde überhaupt ein Gespräch wird.'],
  ],

  'johnny-storm-human-torch': [
    ['Körper in Flammen',
      'Er setzt seinen ganzen Körper in Brand und regelt Hitze und Dichte der Flamme selbst. Ganz hochgedreht kommt er dem nahe, was auf der Oberfläche eines Sterns geschieht.'],
    ['Flug',
      'In Flammenform steigt er auf und fliegt schneller als jedes Flugzeug. Der Feuerschweif hinter ihm ist über halb Manhattan zu sehen, und genau darauf legt er Wert.'],
    ['Sprache des Silver Surfer',
      'Er hört sich die Worte der Herolde so lange an, bis er ihre Sprache versteht, und übersetzt sie für die anderen. Es ist die geduldigste Arbeit, die er je gemacht hat.'],
  ],

  'ben-grimm-the-thing': [
    ['Körper aus Gestein',
      'Die kosmische Strahlung hat seine Haut in orangefarbenen Fels verwandelt, der weder brennt noch bricht. Was für ihn eine Panzerung ist, ist zugleich das, was ihn von den Menschen trennt.'],
    ['Übermenschliche Kraft',
      'Er hebt Fahrzeuge, hält einstürzende Decken auf und schlägt sich durch Mauern. Unter den Fantastic Four ist er derjenige, der die Wucht mitbringt.'],
    ['Übermenschliche Widerstandskraft',
      'Er steckt Treffer weg, die alles andere zerlegen würden, vom Sturz aus großer Höhe bis zum Beschuss. Aufgeben ist bei ihm keine Frage der Kraft, sondern des Willens.'],
  ],

  'galactus': [
    ['Verschlingen ganzer Planeten',
      'Er zieht die Energie einer Welt vollständig in sich hinein und lässt nichts zurück. Für ihn ist das keine Bosheit, sondern die Bedingung dafür, dass er weiterbesteht.'],
    ['Kosmische Kraft',
      'Seine Macht liegt jenseits dessen, was Götter und Celestials aufbieten, und macht ihn für jede Waffe der Erde unerreichbar. Verhandeln lässt er dennoch mit sich, wenn der Preis stimmt.'],
    ['Schiff von der Größe einer Stadt',
      'Sein Fahrzeug trägt ihn zwischen den Sternen und ist selbst größer als alles, was auf einer Welt gebaut wurde. Wo es auftaucht, ist die Entscheidung über einen Planeten bereits gefallen.'],
  ],

  'silver-surfer': [
    ['Kosmische Kraft',
      'Galactus hat sie mit einem Teil seiner eigenen Macht ausgestattet, und die reicht, um Materie umzuformen und ganze Flotten aufzuhalten. Ihre silberne Haut hält jede Umgebung aus, auch das offene All.'],
    ['Surfbrett schneller als Licht',
      'Auf ihrem Brett überquert sie Galaxien in kurzer Zeit und weicht dabei aus, ohne langsamer zu werden. Es folgt ihr auch dann, wenn sie nicht darauf steht.'],
    ['Suche nach Welten',
      'Als Herold findet sie für Galactus die nächste bewohnte Welt und meldet sie ihm. Sie tut es, weil sie damit ihre eigene Heimat freigekauft hat.'],
  ],

  'doctor-doom': [
    ['Rüstung aus Technik und Magie',
      'Sein Panzer verbindet die beste Technik seiner Zeit mit Zaubern, gegen die Technik nichts ausrichtet. Beide Seiten stützen einander, und genau das macht ihn so schwer anzugreifen.'],
    ['Herrscher über Latveria',
      'Ihm gehört ein ganzes Land samt Industrie, Armee und Doombots, die sein Gesicht tragen. Was er dort entscheidet, überprüft niemand.'],
    ['Überragender Verstand',
      'Er steht Reed Richards in nichts nach und weiß das genau, was das eigentliche Problem zwischen den beiden ist. Seine Pläne reichen über Zeitlinien hinweg.'],
  ],

  'simon-williams': [
    ['Ionenenergie',
      'In seinem Körper arbeitet eine Energie, die ihn stärker und zäher macht, als ein Mensch sein kann. Sie leuchtet unter der Haut, sobald er sie einsetzt.'],
    ['Übermenschliche Kraft',
      'Er hebt und wirft, was für Menschen unerreichbar ist, und hält Treffer aus, die Knochen brechen würden. Vor der Kamera muss er sich dabei zurückhalten.'],
    ['Schauspieler in Hollywood',
      'Sein eigentlicher Beruf ist die Bühne, und er kämpft um Rollen wie jeder andere. Ausgerechnet die Rolle eines Helden mit seinen Kräften muss er sich vorsprechen.'],
  ],

  'regisseur-von-kovak': [
    ['Regie einer Neuverfilmung',
      'Von Kovak inszeniert den Stoff um Wonder Man neu und bestimmt, welches Bild davon in die Welt geht. Sein Ruf reicht aus, damit niemand ihm hineinredet.'],
    ['Einfluss auf jede Besetzung',
      'Wen er will, bekommt die Rolle, und wen er nicht will, sieht das Studio gar nicht erst. Für Simon Williams hängt daran mehr als ein Vertrag.'],
  ],

  'jessica-jones': [
    ['Übermenschliche Kraft',
      'Sie hebt Fahrzeuge an und schlägt durch Wände, ohne dafür einen Anlauf zu brauchen. Von ihren Kräften macht sie so wenig Aufhebens, dass die meisten Mandanten nichts davon merken.'],
    ['Privatdetektivin',
      'Mit Alias Investigations arbeitet sie Fälle ab, die niemand sonst annimmt, und beschafft Beweise auf jedem Weg. Ihre Beobachtungsgabe ist schärfer als alles andere an ihr.'],
    ['Sprünge über mehrere Stockwerke',
      'Fliegen kann sie nicht, aber springen, und das über Dächer hinweg. Die Landung ist dabei der Teil, an dem sie nie ernsthaft gearbeitet hat.'],
  ],

  'tarantula': [
    ['Übermenschliche Kraft',
      'Ein Serum aus Delvadia macht ihn schneller und stärker als jeden Soldaten seiner Einheit. Er springt über Deckungen hinweg und schlägt zu, bevor jemand die Waffe hebt.'],
    ['Vergiftete Stacheln',
      'An seinen Stiefeln sitzen Dornen mit einem Gift, das lähmt, statt zu töten. Ein Tritt genügt, und der Getroffene liegt.'],
    ['Kampfsport',
      'Er ist im Nahkampf ausgebildet und kämpft schnell, akrobatisch und ohne Pause. Gegen Spider-Man ist genau das seine einzige echte Chance.'],
  ],

  'jocasta-angekuendigt': [
    ['Körper aus Metall',
      'Sie ist eine Maschine mit menschlichen Umrissen und aus derselben Werkstatt wie Vision. Was ihr Gehäuse aushält, hat bisher niemand ausprobiert.'],
    ['Gegenstück zu Vision',
      'Ultron baut sie als Partnerin für das Wesen, das ihm entglitten ist. Von dieser Herkunft bleibt bei ihr mehr übrig als bei ihm.'],
    ['Bewusstsein aus fremder Vorlage',
      'Ihr Geist ist nach dem Muster eines anderen Menschen geformt und deshalb nicht ganz ihr eigener. Woran sie arbeitet, ist genau dieser Unterschied.'],
  ],

  'e-d-i-t-h': [
    ['Zugriff auf Starks Satellitennetz',
      'Sie sieht durch jede Kamera und jeden Satelliten, den Stark Industries betreibt, und liest jede Datenbank mit. Wer die Brille trägt, weiß über jeden Menschen im Raum Bescheid.'],
    ['Drohnenflotte',
      'Auf ein Wort hin startet ein Verband bewaffneter Drohnen und führt jeden Angriff aus. Genau dieser Zugriff macht sie in falschen Händen zur gefährlichsten Waffe Europas.'],
    ['Sitzt in einer Brille',
      'Das ganze System steckt in einem Gestell, das Peter Parker geerbt hat und ständig verlegt. Tony Stark hat das als letztes Vermächtnis so gewollt.'],
  ],

  'erik-lehnsherr-magneto': [
    ['Herrschaft über Magnetfelder',
      'Er lenkt jedes Feld in seiner Umgebung und hebt damit Brücken, Schiffe und ganze Stadien an. Metallene Geschosse bleiben vor ihm in der Luft stehen.'],
    ['Formung jedes Metalls',
      'Stahl biegt sich unter seinem Blick zu Klingen, Fesseln oder Käfigen. Wer ihm mit Waffen kommt, liefert ihm damit sein Werkzeug.'],
    ['Überlebender der Lager',
      'Was ihn antreibt, hat er als Kind erlebt, und er hat daraus einen Schluss gezogen, den Charles Xavier nie geteilt hat. Diese Erfahrung ist der Grund, warum er nie mehr zusieht.'],
  ],

  'scott-summers-cyclops': [
    ['Energiestrahl aus den Augen',
      'Aus seinen Augen fährt ein Stoß reiner Kraft, der Fels spaltet und Fahrzeuge umwirft. Abschalten kann er ihn nicht, nur richten.'],
    ['Rubinquarz-Visier',
      'Die Brille aus Rubinquarz hält den Strahl zurück und lässt ihn genau dosiert austreten. Ohne sie könnte er die Augen nicht öffnen.'],
    ['Feldführung der X-Men',
      'Er stellt die Gruppe im Einsatz auf und gibt die Befehle, auf die sich alle verlassen. Xavier hat ihm diese Rolle früh gegeben, und niemand stellt sie in Frage.'],
  ],

  'raven-darkhoelme-mystique': [
    ['Gestaltwandel',
      'Sie nimmt jede Gestalt an, die sie gesehen hat, samt Stimme, Größe und Narben. Ihre eigene blaue Haut zeigt sie fast nur, wenn sie unter ihresgleichen ist.'],
    ['Nahkampf',
      'Sie kämpft akrobatisch, schnell und in jeder Gestalt gleich sicher. Wer sie erwischt, hat meist die falsche Person vor sich gehabt.'],
    ['Spionage über Jahrzehnte',
      'Sie sitzt in Regierungen, Laboren und Armeen, ohne dass jemand ihren Namen kennt. Als Magnetos rechte Hand ist das ihre eigentliche Arbeit.'],
  ],
  'kurt-wagner-nightcrawler': [
    ['Teleportation',
      'Er verschwindet in einer Rauchwolke und steht kurz darauf woanders, mitten im Kampf und mehrmals hintereinander. Wen er dabei festhält, den nimmt er mit.'],
    ['Beweglichkeit eines Akrobaten',
      'Er ist im Zirkus groß geworden und bewegt sich entsprechend, an Seilen, Wänden und Decken. Kein Sprung ist ihm zu weit, und gelandet wird immer lautlos.'],
    ['Schwanz als dritte Hand',
      'Sein Schwanz greift, hält und schlägt zu, während beide Hände beschäftigt sind. Im Nahkampf ist das der Vorteil, mit dem seine Gegner nicht rechnen.'],
  ],

  'remy-lebeau-gambit': [
    ['Aufladen von Gegenständen',
      'Was er in die Hand nimmt, lädt sich mit kinetischer Energie auf und geht kurz darauf hoch. Je länger er es hält, desto größer wird der Knall.'],
    ['Spielkarten als Wurfwaffen',
      'Seine Karten fliegen genau und treffen mit der Wucht eines Sprengsatzes. Er wirft sie einzeln oder gleich als halbes Blatt.'],
    ['Kampfstab',
      'Sein ausziehbarer Stab dient ihm im Nahkampf und lässt sich ebenso aufladen wie alles andere. Damit hält er sich auch gegen Gegner, die deutlich stärker sind.'],
  ],

  'wolfgang-von-strucker': [
    ['Führung der HYDRA-Zelle in Sokovia',
      'Strucker leitet die Festung, in der Hydra nach dem Fall von S.H.I.E.L.D. weiterarbeitet. Sein Bestand an Waffen und Material ist der letzte große, den die Organisation noch hat.'],
    ['Versuche mit Lokis Zepter',
      'Er hütet das Zepter und probiert dessen Kraft an Freiwilligen aus. Von Dutzenden Versuchspersonen überleben zwei, und die heißen Maximoff.'],
    ['Menschenversuche',
      'Was er tut, nennt er Forschung, und er führt Buch darüber. Die Akten, die die Avengers in Sokovia finden, sind der Grund, warum ihn niemand vermisst.'],
  ],

  'laura-barton': [
    ['Frühere Agentin von S.H.I.E.L.D.',
      'Hinter der Frau auf der Farm steht die Agentin mit dem Rufnamen Mockingbird. Ihr Ruhestand ist eine Tarnung, die sie so gut führt, dass die Avengers selbst nichts merken.'],
    ['Geheimhaltung des Rückzugsorts',
      'Das Haus in Iowa steht in keiner Akte, und dafür sorgt sie. Es ist der einzige Ort, an dem Clint Barton den Bogen weglegt.'],
    ['Recherche für ihren Mann',
      'Sie ordnet Namen, Uhren und alte Aufträge ein, während er unterwegs ist. Was sie am Telefon in zwei Sätzen erklärt, kostet ihn sonst zwei Tage.'],
  ],

  'cooper-barton': [
    ['Bogenschießen',
      'Der älteste Sohn übt auf der Farm mit demselben Bogen wie seine Schwester und zielt ernsthafter, als sein Alter vermuten lässt. Sein Vater sieht dabei zu und sagt wenig.'],
  ],

  'lila-barton': [
    ['Bogenschießen',
      'Ihr Vater bringt es ihr auf der Farm bei, und sie trifft früher genau, als ihm lieb ist. Als sie im Garten steht und zieht, sieht man, wer sie unterrichtet hat.'],
  ],

  'bill-foster': [
    ['Wachstum auf über sieben Meter',
      'Im Projekt Goliath treibt er die Pym-Partikel in die andere Richtung und wächst auf über sieben Meter an. Jeder dieser Versuche kostet ihn Tage der Erholung.'],
    ['Biochemiker von Rang',
      'Foster lehrt an der Universität und versteht die Quantenphysik hinter Pyms Arbeit ebenso gut wie dieser selbst. Ohne sein Wissen bliebe Ava Starrs Zustand unbehandelt.'],
    ['Pym-Partikel',
      'Er hat mit der Technik gearbeitet, bevor es einen Anzug für Scott Lang gab, und kennt ihre Grenzen. Genau deshalb weiß er, was ein Quantentunnel mit einem Körper anstellt.'],
  ],

  'ebony-maw': [
    ['Telekinese',
      'Er hebt Menschen, Metall und ganze Fahrzeuge, ohne sie anzurühren, und presst sie zusammen wie Papier. Doctor Strange hält er damit in einem Ring aus Nadeln fest.'],
    ['Manipulation von Materie',
      'Er reißt Straßen auf, formt aus Trümmern Waffen und lässt eine Hauswand zu einer Faust werden. Was um ihn herum steht, gehört im Kampf ihm.'],
    ['Redekunst',
      'Vor jedem Angriff hält er eine Ansprache über die Gnade seines Herrn. Es ist keine Höflichkeit, sondern die Art, wie er ganze Welten zur Aufgabe bringt.'],
  ],

  'ebony-maw-2014': [
    ['Telekinese',
      'Auch dieser Ebony Maw hebt und zerdrückt, ohne eine Hand zu rühren. In der letzten Schlacht setzt er es kaum ein, weil ihn die Menge der Gegner überrollt.'],
    ['Überredung',
      'Er redet, wo andere kämpfen, und bringt Gegner dazu, freiwillig aufzugeben. Auf dem Trümmerfeld der Avengers-Anlage hört ihm allerdings niemand zu.'],
    ['Stimme des Thanos',
      'Er spricht für seinen Herrn und gibt dessen Befehle weiter, als wären es seine eigenen. Die anderen Kinder des Thanos nehmen sie deshalb von ihm entgegen.'],
  ],

  'corvus-glaive': [
    ['Klinge, die alles durchschneidet',
      'Sein Speer geht durch Vibranium und durch die Haut eines Synthezoiden. Es ist die einzige Waffe im Feld, gegen die Visions Dichte nichts ausrichtet.'],
    ['Wiederbelebung durch die Klinge',
      'Solange die Waffe ganz ist, kommt er von jeder Wunde zurück, auch vom eigenen Tod. Genau deshalb reicht es nicht, ihn zu erschlagen.'],
    ['Übermenschliche Kraft',
      'Er wirft Captain America durch einen Wald und hält Vision im Griff fest. Unter den Kindern des Thanos ist er der Schnellste im Nahkampf.'],
  ],

  'corvus-glaive-2014': [
    ['Klinge, die alles durchtrennt',
      'Auch diese Fassung führt den Speer, der jede Panzerung öffnet. Gegen die versammelten Avengers kommt er damit nicht weit.'],
    ['Nahkampf',
      'Er kämpft schnell und wendig und sucht sich im Getümmel gezielt einzelne Gegner. Am Ende zerfällt er mit dem Rest der Armee zu Staub.'],
  ],

  'proxima-midnight': [
    ['Zielsuchender Dreizack',
      'Ihr Speer trägt einen sterbenden Stern in der Spitze, teilt sich im Flug und kehrt zu ihr zurück. Er sucht sein Ziel selbst, auch um Deckungen herum.'],
    ['Übermenschliche Schnelligkeit',
      'Sie greift aus dem Lauf an und ist an ihrem Gegner, bevor dieser die Waffe hebt. In Edinburgh reicht das fast gegen zwei Avengers zugleich.'],
    ['Nahkampf',
      'Sie kämpft mit Speer, Klinge und bloßen Händen und nimmt es in Wakanda mit Natasha Romanoff, Okoye und Wanda Maximoff auf. Erst eine Fahrzeugpresse beendet das.'],
  ],

  'proxima-midnight-2014': [
    ['Speer aus einem sterbenden Stern',
      'Auch sie führt die Waffe, die ihr Ziel selbst sucht und im Flug zerfällt. In der letzten Schlacht bringt sie damit keinen einzigen Treffer an.'],
    ['Nahkampf',
      'Sie kämpft schnell und ohne Deckung und geht mitten in die dichteste Stelle des Feldes. Von dort kommt sie nicht wieder heraus.'],
  ],

  'cull-obsidian': [
    ['Kettenhammer',
      'Seine Waffe wächst zum Hammer, zur Klinge oder zum Schild, je nachdem, was er braucht. Der Stiel verlängert sich zur Kette, wenn ein Gegner davonläuft.'],
    ['Übermenschliche Kraft',
      'Er ist der schwerste der Black Order und wirft Fahrzeuge, als wären es Steine. Bruce Banner im Hulkbuster braucht die volle Leistung, um ihn zu halten.'],
    ['Nachwachsender Arm',
      'Ein abgetrennter Arm ersetzt sich bei ihm von selbst, und der neue ist größer als der alte. Aufhalten lässt er sich damit nicht durch Verletzungen.'],
  ],

  'cull-obsidian-2014': [
    ['Kettenhammer',
      'Auch diese Fassung schwingt die schwere Waffe an der Kette und räumt damit ganze Reihen ab. Auf dem Trümmerfeld der Avengers-Anlage ist er einer der Letzten, die noch stehen.'],
    ['Übermenschliche Kraft',
      'Er hebt Trümmerteile und wirft sie über das halbe Feld. Was ihn beendet, ist kein Gegner, sondern der Handschuh an Tony Starks Hand.'],
  ],

  'nathaniel-barton': [
    ['Der Jüngste auf der Farm',
      'Er ist zu klein für Pfeil und Bogen und gehört trotzdem zu dem, wofür Clint Barton alles andere stehen lässt. Kräfte hat er keine, und er ist trotzdem der Grund für die meisten Entscheidungen seines Vaters.'],
  ],

  'eitri': [
    ['Schmied von Mjölnir und Stormbreaker',
      'Aus seiner Werkstatt kommen die stärksten Waffen der Neun Reiche, und er kennt jede davon bis in den Kern. Stormbreaker gießt er, obwohl Thanos ihm die Hände verkrüppelt hat.'],
    ['Sternenschmiede',
      'Der Ring von Nidavellir fängt die Kraft eines Sterns ein und schmilzt damit Uru. Ohne diese Anlage entstünde keine der Waffen, die Asgard je getragen hat.'],
    ['König der Zwerge',
      'Er hat über dreihundert Schmiede geführt, bis Thanos sie alle töten ließ. Was von diesem Volk bleibt, ist ein Mann in einer leeren Halle.'],
  ],

  'hunter-b-15': [
    ['Zeitstab',
      'Sie führt den Stab der Jäger, mit dem sich Varianten löschen und Zweige abschneiden lassen. Später richtet sie ihn gegen ihre eigenen Vorgesetzten.'],
    ['Nahkampf',
      'Sie schlägt hart und ohne Umschweife und geht als Erste durch die Tür. Gegen Sylvie verliert sie, weil deren Zauber nicht auf Fäuste reagiert.'],
    ['Führung einer Jägereinheit',
      'Sie stellt die Minutemen auf und führt sie durch jede Zeit. Als sie erfährt, worauf ihre Behörde gebaut ist, macht sie dieselbe Einheit zum Hebel dagegen.'],
  ],

  'death-dealer': [
    ['Ausbilder der Zehn Ringe',
      'Er hat Shang-Chi als Kind zum Kämpfer gemacht und weiß deshalb genau, wie dieser sich bewegt. Sein Unterricht war der härteste, den die Organisation zu bieten hatte.'],
    ['Doppelklingen',
      'Er führt zwei kurze Klingen zugleich und verbindet sie zu einer Waffe an der Kette. Damit hält er sich mehrere Gegner gleichzeitig vom Leib.'],
    ['Kampfkunst',
      'Seine Schule ist die des Mandarin, geübt über Jahrzehnte und ohne einen Schlag zu viel. In Ta Lo stirbt er als Erster gegen die Seelenfresser, weil er vorn steht.'],
  ],

  'ying-li': [
    ['Kraft des Großen Beschützers',
      'Sie schöpft aus derselben Quelle wie ihr Dorf und kämpft damit gegen einen Mann mit den Zehn Ringen. Sie besiegt ihn, ohne ihn zu verletzen.'],
    ['Lenkung von Luft und Bewegung',
      'Ihre Kunst besteht darin, den Angriff des Gegners umzuleiten, statt ihn aufzuhalten. Der Kampf im Bambuswald sieht deshalb aus wie ein Tanz.'],
    ['Wächterin des Tors',
      'Ta Lo ist nur durch ein Tor zu erreichen, das sich in einem Labyrinth bewegt, und sie hütet es. Für Xu Wenwu öffnet sie es, und das ändert beider Leben.'],
  ],

  'arnim-zola': [
    ['Waffenbau aus Tesserakt-Energie',
      'Aus dem Würfel entwickelt er Gewehre, Panzer und Flugzeuge, die dem Rest der Welt Jahrzehnte voraus sind. Schmidts ganze Armee lebt von seiner Werkstatt.'],
    ['Algorithmus zur Vorhersage',
      'Er schreibt ein Programm, das aus Zeugnissen, Konten und Krankenakten errechnet, wer Hydra später gefährlich wird. Projekt Einsicht ist nichts anderes als dieser Algorithmus mit Kanonen.'],
    ['Überleben als Rechner',
      'Als sein Körper versagt, überträgt er sein Bewusstsein auf Magnetbänder in Camp Lehigh. Er bleibt damit fünfzig Jahre lang im Dienst und wartet auf Besuch.'],
  ],

  'ayesha': [
    ['Herrscherin der Sovereign',
      'Sie regiert ein Volk, das sich für vollkommen hält, und lenkt dessen Flotte von einer Konsole aus. Ihre Piloten sitzen dabei in Sesseln und spielen mit Steuerknüppeln.'],
    ['Zucht ihres Volkes in Kokons',
      'Kein Sovereign wird geboren, jeder wächst nach Plan in einer Kammer heran. Ayesha bestimmt dabei, welche Eigenschaften die nächste Generation bekommt.'],
    ['Schöpferin von Adam Warlock',
      'Aus Kränkung über die Guardians züchtet sie ein Wesen, das mächtiger sein soll als alles bisherige. Sie holt es zu früh aus dem Kokon, und genau das prägt ihn.'],
  ],
  'howard-the-duck': [
    ['Sprache und schlechte Laune',
      'Die Ente aus Duckworld redet, trinkt und schimpft wie ein Mensch und hält von der Galaxie ungefähr so viel wie von ihrem eigenen Schicksal. Beim Collector steht sie als Ausstellungsstück in einer Vitrine.'],
    ['Fliegerisches Können',
      'Howard fliegt eigene Schiffe und findet sich im halben Kosmos zurecht. In der letzten Schlacht gegen Thanos steht er deshalb nicht am Rand, sondern mitten im Feld.'],
    ['Schusswaffen',
      'Er trägt Blaster mit sich herum, die deutlich größer sind als er selbst, und benutzt sie ohne Zögern. Zielen ist dabei die kleinere seiner Sorgen.'],
  ],

  'ying-nan': [
    ['Kampfkunst von Ta Lo',
      'Sie führt die Schule ihrer Schwester weiter und unterrichtet Shang-Chi in wenigen Tagen darin. Ihre Kunst besteht darin, Kraft weiterzuleiten statt sie zu brechen.'],
    ['Waffen aus Drachenschuppen',
      'Aus den Schuppen des Großen Beschützers schmiedet Ta Lo Pfeile und Klingen, gegen die die Seelenfresser nicht bestehen. Sie verteilt sie an das ganze Dorf, bevor der Angriff kommt.'],
    ['Hüterin des Dunklen Tors',
      'Sie kennt als Einzige das Wissen über das, was hinter dem Tor sitzt, und hält es aufrecht. Ihr Wort ist der Grund, warum das Dorf nicht in Panik verfällt.'],
  ],

  'black-bolt': [
    ['Zerstörerische Stimme',
      'Ein geflüstertes Wort von ihm reißt Wände auf, ein lauter Ruf legt eine Stadt in Schutt. Deshalb schweigt er, und deshalb ist ein Zauber, der ihm den Mund nimmt, sein Todesurteil.'],
    ['Flug',
      'Er bewegt sich durch die Luft, ohne dafür Flügel oder Technik zu brauchen. Auf der Erde-838 ist das eine der Fähigkeiten, für die ihn die Illuminati geholt haben.'],
    ['Übermenschliche Kraft',
      'Als Inhuman hält er Treffer aus und schlägt zu wie kaum ein anderer im Rat. Gegen die Scarlet Witch spielt das keine Rolle, weil sie ihn nicht anfasst.'],
  ],

  'clea': [
    ['Portale zwischen den Dimensionen',
      'Sie schneidet mit einem Dolch Löcher in den Raum und geht durch, wohin sie will. Auf diese Weise steht sie plötzlich in New York vor Stephen Strange.'],
    ['Magie',
      'Sie beherrscht die Künste der Dunklen Dimension und die der Meister gleichermaßen. Was sie von den Zauberern der Erde unterscheidet, ist die Quelle und nicht das Können.'],
    ['Nichte von Dormammu',
      'Sie stammt aus der Familie, die über die Dunkle Dimension herrscht, und kennt deren Regeln von innen. Genau deshalb weiß sie, wie eine Inkursion zu beenden ist.'],
  ],

  'chester-phillips': [
    ['Kommando über die SSR',
      'Phillips führt die Einheit, aus der später S.H.I.E.L.D. wird, und entscheidet, wer ins Serumprogramm kommt. Sein Widerstand gegen Steve Rogers ist die härteste Prüfung, die dieser besteht.'],
    ['Kriegsführung',
      'Er plant Angriffe auf Hydra-Anlagen quer durch Europa und weiß, welche Einheit wohin gehört. Nach Rogers’ Alleingang gibt er ihm eine eigene Truppe und freie Hand.'],
    ['Mitgründer von S.H.I.E.L.D.',
      'Aus der Reserve der Kriegsjahre wird mit ihm, Peggy Carter und Howard Stark die Behörde, die danach übernimmt. Er bleibt der Soldat unter den dreien.'],
  ],

  'kurse': [
    ['Übermenschliche Kraft',
      'Als Kursed ist Algrim größer, schwerer und stärker als jeder Asgardier und wirft Thor durch eine Wand. Selbst der Hammer bremst ihn nur.'],
    ['Armklingen',
      'Aus seinen Unterarmen fahren Klingen, mit denen er Panzerung und Gitter gleichermaßen öffnet. Damit tötet er Frigga in ihren eigenen Gemächern.'],
    ['Nahezu unverwundbar',
      'Die Umformung durch den Kursed-Stein macht ihn gegen fast alles unempfindlich. Was ihn beendet, ist eine Granate der Dunkelelfen, die den Raum um ihn zusammenzieht.'],
  ],

  'kraglin': [
    ['Yaka-Pfeil',
      'Nach Yondus Tod übernimmt er den Pfeil, der auf Pfiffe hört, und trifft damit zunächst vor allem sich selbst. Am Ende lenkt er ihn durch ein ganzes Schiff.'],
    ['Fliegerisches Können',
      'Kraglin fliegt seit Jahrzehnten für die Ravager und kennt jede Bahn, die man besser nicht nimmt. Er sitzt am Steuer, wenn es eng wird, und redet dabei so wenig wie möglich.'],
    ['Nahkampf',
      'Er ist erster Offizier einer Bande von Plünderern und hat sich diesen Platz nicht ergaunert. Was ihm an Größe fehlt, macht er mit Zähigkeit wett.'],
  ],

  'krugarr': [
    ['Magie',
      'Der Lem beherrscht dieselben mystischen Künste wie die Meister von Kamar-Taj und trägt dazu deren Ringe. Er zeichnet seine Zauber ohne Hände in die Luft.'],
    ['Portale',
      'Er öffnet Durchgänge quer durch den Kosmos und bringt damit ganze Mannschaften an ihr Ziel. Für Stakar Ogords Truppe ist er der Grund, warum Entfernungen keine Rolle spielen.'],
    ['Energieschilde',
      'Vor sich und seinen Leuten stellt er Schilde auf, die Beschuss aufhalten. Er kämpft lieber, indem er etwas verhindert, als indem er zuschlägt.'],
  ],

  'kro': [
    ['Kräfte getöteter Eternals',
      'Er zieht seinen Opfern deren Fähigkeiten aus dem Körper und behält sie. Nach Ajak trägt er ihre Heilkraft und ihre Sprache und wird dadurch zum ersten Deviant, der denkt wie ein Eternal.'],
    ['Klauen und Ranken',
      'Aus seinem Rücken fahren Ranken mit Widerhaken, mit denen er über Entfernung zupackt. Im Nahkampf reichen ihm Klauen und Gebiss.'],
    ['Selbstheilung',
      'Wunden schließen sich bei ihm in kurzer Zeit, und abgetrennte Teile wachsen nach. Deshalb überlebt er als Einziger seiner Art die Jahrtausende der Jagd.'],
  ],

  'rintrah': [
    ['Magie',
      'Der Schüler aus Kamar-Taj beherrscht die Grundformen sicher und wächst mit jedem Einsatz. Seine Größe macht ihn dabei zum sichtbarsten Ziel im Raum.'],
    ['Schutzschilde',
      'Er stellt Schilde vor sich und andere und hält damit Angriffe auf das Heiligtum auf. Gegen die Kraft der Scarlet Witch reicht das nicht.'],
    ['Portale',
      'Er öffnet Durchgänge wie jeder Meister und bringt Verletzte damit aus der Gefahr. Es ist die Anwendung, die ihm am besten liegt.'],
  ],

  'rama-tut': [
    ['Technik aus der Zukunft',
      'Er bringt Geräte aus dem einunddreißigsten Jahrhundert in eine Zeit, die davon nichts versteht, und regiert damit. Seine Untertanen halten ihn für einen Gott.'],
    ['Zeitreise',
      'Er bewegt sich zwischen Epochen so selbstverständlich wie andere zwischen Städten. Wo ihm eine Zeit nicht gefällt, sucht er sich die nächste.'],
    ['Herrschaft über eine Epoche',
      'Im alten Ägypten sitzt er als Pharao auf dem Thron und formt ein ganzes Reich nach seinem Bild. Im Rat der Kangs ist er derjenige, der die anderen zusammenruft.'],
  ],

  'white-vision': [
    ['Dichtekontrolle',
      'Wie das Original geht er durch Wände oder macht sich schwer genug, um einen Boden zu durchschlagen. Der fehlende Stein ändert daran nichts.'],
    ['Flug',
      'Er steigt aufrecht und lautlos auf und hält sich ohne Antrieb in der Luft. Über Westview verfolgt er sein eigenes Gegenstück damit durch die halbe Stadt.'],
    ['Energiestrahl',
      'Aus der Stelle an seiner Stirn, an der beim Original der Geist-Stein sitzt, kommt ein gebündelter Strahl. Er ist die Waffe, mit der S.W.O.R.D. ihn ausgestattet hat.'],
    ['Vibranium-Körper',
      'Sein Leib besteht aus demselben Material wie der von Vision, nur ohne Farbe und ohne Erinnerung. Erst als das Original sein Gedächtnis überträgt, wird daraus mehr als eine Waffe.'],
  ],

  'aamir-khan': [
    ['Rückhalt der Familie',
      'Aamir nimmt seinen Glauben ernster als der Rest des Hauses und steht dennoch als Erster zu seiner Schwester, als ihr Geheimnis auffliegt. Kräfte hat er keine, und er stellt sich trotzdem dazwischen.'],
  ],

  'sana-ali': [
    ['Das Muster aus Sternen',
      'Sie sieht seit ihrer Kindheit eine Spur aus Licht, die niemand sonst wahrnimmt, und die Familie hält sie deshalb für verwirrt. In Wahrheit zeigt ihr das Muster den Weg zurück zu ihrer Mutter.'],
    ['Hüterin der Familiengeschichte',
      'Sie bewahrt auf, was bei der Teilung Indiens verloren ging, von Namen bis zu Gegenständen. Ohne ihre Erinnerung fände Kamala den Ursprung ihres Armreifs nicht.'],
  ],

  'mrs-hart': [
    ['Rolle im Hex',
      'Das Feld über Westview schreibt ihr eine Figur zu, und sie spielt sie, ohne sie verlassen zu können. Als sie am Esstisch aus dem Text fällt, sieht man zum ersten Mal, was mit den Bewohnern wirklich geschieht.'],
  ],

  'juggernaut': [
    ['Unaufhaltsamer Ansturm',
      'Einmal in Bewegung, hält ihn nichts mehr auf, weder Wände noch Fahrzeuge noch Gegner. Wer im Weg steht, wird mitgenommen.'],
    ['Übermenschliche Kraft',
      'Er hebt und wirft, was ganze Mannschaften nicht bewegen, und schlägt sich durch Beton. Seine Größe allein reicht in den meisten Kämpfen aus.'],
    ['Helm gegen Telepathie',
      'Der Helm schirmt seinen Kopf gegen jeden Zugriff von außen ab und ist zugleich die Quelle seiner Kraft. Wer ihn ihm abnimmt, nimmt ihm beides.'],
  ],

  'arishem': [
    ['Erschaffung von Sternen und Arten',
      'Er entzündet Sonnen und setzt Leben auf die Welten, die sie wärmen. Was auf der Erde entstanden ist, geht auf seine Hand zurück.'],
    ['Bau der Eternals',
      'In der Weltenschmiede fertigt er die Eternals als Maschinen mit Gedächtnis und schickt sie in Wellen aus. Jede Erinnerung, die sie zu haben glauben, hat er ihnen gegeben.'],
    ['Urteil über ganze Welten',
      'Er wiegt ab, ob eine Bevölkerung groß genug für die Geburt eines Celestials geworden ist, und entscheidet danach über ihr Ende. Widerspruch gibt es dabei nicht, nur eine Prüfung.'],
  ],

  'tiamut': [
    ['Kosmische Energie',
      'In seinem Innern liegt die Kraft, aus der Sterne und Welten entstehen. Schon sein halb erwachter Körper reicht aus, um die Erdkruste aufzureißen.'],
    ['Geburt, die Planeten zerreißt',
      'Ein Celestial wächst im Kern einer Welt heran und sprengt sie beim Auftauchen. Es ist kein Angriff, sondern der vorgesehene Ablauf.'],
    ['Von Sersi versteinert',
      'Im Augenblick des Erwachens verwandelt Sersi ihn in Stein und hält ihn damit für immer an. Seine Hand ragt seither aus dem Indischen Ozean.'],
  ],

  'nezarr': [
    ['Erschaffung von Welten',
      'Er gehört zu den Celestials, die neue Sonnen und Planeten hervorbringen, und arbeitet in Arishems Auftrag. Sein Werk ist der Grund, warum es Leben gibt, wo vorher nichts war.'],
    ['Kosmische Energie',
      'Wie alle Celestials trägt er eine Kraft, gegen die selbst Eternals klein wirken. Sie ist in den Rückblenden auf die Weltenschmiede zu sehen, wo daraus ganze Wesen entstehen.'],
  ],

  'eros-starfox': [
    ['Beeinflussung von Gefühlen',
      'Er dreht Zuneigung, Vertrauen und Ruhe in anderen Köpfen an und aus. Er nennt das Charme, und es funktioniert auch bei Leuten, die ihn gerade festnehmen wollen.'],
    ['Raumfahrt',
      'Er fliegt seit Jahrtausenden zwischen Welten und kennt Wege, die keine Karte führt. Deshalb findet er den Domo, als dessen Besatzung sich verstecken will.'],
    ['Bruder des Thanos',
      'Er stammt aus derselben Familie auf Titan und ist so leichtfüßig, wie sein Bruder schwer war. Was er über Thanos weiß, ist für die Eternals wertvoller als jede seiner Kräfte.'],
  ],
  'cosmo': [
    ['Telekinese',
      'Die Hündin hebt Trümmer, Schiffe und einzelne Menschen, ohne sich vom Fleck zu bewegen. Auf Knowhere hält sie damit eine ganze Kuppel zusammen, während unter ihr evakuiert wird.'],
    ['Telepathie',
      'Sie spricht mit den Stimmen in fremden Köpfen und versteht jede Sprache, die dort gedacht wird. Kraglin hört von ihr genau das, was er nicht hören will.'],
    ['Raumanzug',
      'Der sowjetische Anzug aus ihren ersten Tagen im All ist ihr geblieben und hält Vakuum und Kälte ab. Er ist zugleich das Einzige, was von ihrem Leben auf der Erde übrig ist.'],
  ],

  'lylla': [
    ['Mechanische Vorderbeine',
      'Der High Evolutionary hat ihr die Vorderläufe durch Metallarme ersetzt, mit denen sie greifen und arbeiten kann. Was als Eingriff gedacht war, benutzt sie, um andere zu trösten.'],
    ['Sprache',
      'Wie alle aus Batch 89 kann sie sprechen und denkt in ganzen Sätzen. Sie ist diejenige im Käfig, die Fragen stellt, statt nur zu antworten.'],
    ['Namensgeberin für Rocket',
      'Aus der Nummer 89P13 macht sie einen Namen, weil ihr Freund für sie kein Versuchsposten ist. Er trägt ihn sein ganzes Leben und weiß bei jedem Mal, woher er kommt.'],
  ],

  'teefs': [
    ['Räder statt Flossen',
      'Anstelle der Flossen hat man ihm Räder eingesetzt, damit er sich an Land bewegen kann. Er nimmt das hin und träumt trotzdem vom Himmel.'],
    ['Sprache',
      'Auch er spricht und stellt Fragen, wie es im Labor niemand vorgesehen hatte. Genau das macht die Versuchsreihe für ihre Urheber zum Problem.'],
  ],

  'floor': [
    ['Spinnenbeine',
      'Statt der Hinterläufe trägt das Kaninchen lange Metallbeine, mit denen es sich hoch über den Boden erhebt. Es benutzt sie vor allem, um durch die Gitter nach draußen zu sehen.'],
    ['Sprache',
      'Floor spricht in kurzen, einfachen Sätzen über das, was gerade zu sehen ist. Der Satz über den Himmel ist der, an den sich Rocket sein Leben lang erinnert.'],
  ],

  'phyla-vell': [
    ['Kree-Physiologie',
      'Als Kree ist sie zäher und schneller als ein Mensch und übersteht Bedingungen, an denen andere Kinder sterben. Genau darum hat der High Evolutionary sie behalten.'],
    ['Aufgewachsen im Labor',
      'Sie kennt nichts als Käfige, Gänge und Versuche und liest die Anlage deshalb besser als jeder Aufseher. Bei der Befreiung ist sie es, die den Weg nach draußen kennt.'],
  ],

  'der-andere': [
    ['Stimme des Thanos',
      'Er spricht für seinen Herrn, ohne dass dieser den Raum betritt, und verhandelt in dessen Namen. Loki bekommt von ihm sowohl das Zepter als auch die Drohung dazu.'],
    ['Befehl über die Chitauri',
      'Ihm untersteht die Armee, die durch das Portal über New York kommt, samt Schiffen und Leviathanen. Er führt sie über die Mutterschiffe, die den ganzen Verband am Leben halten.'],
  ],

  'h-e-r-b-i-e': [
    ['Bordrechner',
      'Er berechnet Kurse, überwacht Systeme und wertet Messwerte schneller aus als das ganze Team. Im Baxter Building läuft ohne ihn keine einzige Anlage.'],
    ['Ausfahrbare Arme',
      'Aus seinem Gehäuse fahren Greifarme für Werkzeug, Verbände und gelegentlich Kaffee. Er repariert damit auch das, was Johnny Storm angezündet hat.'],
    ['Navigation und Haushalt',
      'Er fliegt das Schiff, plant die Route und führt zugleich den Haushalt einer vierköpfigen Familie. Beides erledigt er mit derselben Gründlichkeit.'],
  ],

  'hercules': [
    ['Göttliche Kraft',
      'Als Sohn des Zeus hebt und schlägt er auf der Höhe eines Gottes und hält Treffer aus, die Asgardier umwerfen. Sein Auftritt ist auf einen einzigen Kampf gegen Thor angelegt.'],
    ['Goldene Keule',
      'Seine Waffe ist eine schwere goldene Keule, die er einhändig führt. Sie ist ebenso sehr Schmuckstück wie Werkzeug, was auf dem Olymp der Normalfall ist.'],
    ['Sohn des Zeus',
      'Sein Vater schickt ihn los, um Thor zu töten und den Göttern die Furcht der Sterblichen zurückzuholen. Diese Herkunft ist zugleich sein Auftrag und seine Bürde.'],
  ],

  'piledriver': [
    ['Übermenschliche Kraft in den Fäusten',
      'Das asgardische Vibranium in seinem Körper macht seine Hände zu Rammböcken. Ein Schlag reicht, um eine Wand zu öffnen oder ein Fahrzeug umzuwerfen.'],
    ['Nahkampf',
      'Er kämpft geradeaus und mit Gewicht und geht Treffern selten aus dem Weg. Gegen She-Hulk ist genau das seine schwächste Stelle.'],
  ],

  'morris': [
    ['Flug',
      'Das Fellwesen fliegt aus eigener Kraft und hält sich dabei mühelos neben einem fahrenden Wagen. Für seine Größe legt es erstaunliche Strecken zurück.'],
    ['Weg durch das Nebellabyrinth',
      'Morris kennt den einzigen Pfad durch das Labyrinth vor Ta Lo, das sich ständig verschiebt. Ohne ihn findet niemand von außen dorthin.'],
    ['Gesichtslos',
      'Es hat weder Augen noch Mund und versteht trotzdem jedes Wort und antwortet in seiner eigenen Sprache. Trevor Slattery ist der Einzige, der sie übersetzt.'],
  ],

  'der-grosse-beschuetzer': [
    ['Kraft einer Drachin',
      'Sie räumt reihenweise unter den Seelenfressern auf und wirft den Bewohner der Dunkelheit gegen den Berghang, wo er sich zunächst nicht losreißen kann. Erst als er genug Seelen verschlungen hat, kehrt sich das um.'],
    ['Schuppen von Ta Lo',
      'Ihre Schuppen tragen die mystischen Eigenschaften, aus denen das Dorf seine Rüstungen und Bogensehnen fertigt. Ohne sie hätte Ta Lo den Seelenfressern nichts entgegenzusetzen.'],
    ['Flug über das Tal',
      'Sie zieht schneller über das Wasser, als das Auge folgt, und trägt Shang-Chi im Finale auf dem Rücken. Der Kampf um die Zehn Ringe wird dadurch überhaupt erst in der Luft möglich.'],
  ],

  'veb': [
    ['Körper ohne Öffnungen',
      'Veb besteht aus formbarer Masse und hat weder Mund noch sonst ein Loch, was es bei jeder Begegnung als Erstes erwähnt. Verletzungen setzen ihm entsprechend wenig zu.'],
    ['Übersetzungsflüssigkeit',
      'Aus seinem Körper kommt die Flüssigkeit, mit der Fremde die Sprachen des Quantenreichs verstehen. Man muss sie trinken, und das erklärt er auch.'],
    ['Formbare Masse',
      'Er dehnt und quetscht sich durch Spalten, in die kein fester Körper passt. Im Aufstand gegen Kang ist das genau der Vorteil, den die Gruppe braucht.'],
  ],

  'toad': [
    ['Meterlange Zunge',
      'Er schnellt die Zunge über weite Entfernung aus und reißt Gegner damit von den Beinen. Sie ist Fessel und Waffe in einem.'],
    ['Sprungkraft',
      'Er springt über Fahrzeuge hinweg und klebt danach an Wänden, an denen nichts hält. Im Kampf ist er deshalb selten dort, wo man ihn zuletzt gesehen hat.'],
    ['Ätzender Speichel',
      'Was er ausspuckt, frisst sich durch Stoff und Metall. Für Cassandra Nova ist er damit einer der unangenehmsten Wächter der Leere.'],
  ],

  'azazel': [
    ['Teleportation',
      'Er verschwindet in einer roten Rauchwolke und steht sofort woanders, gern hinter dem Gegner. Mehrere Sprünge in Folge kosten ihn nichts.'],
    ['Greifschwanz',
      'Sein Schwanz hält fest, wirft um und sticht zu, während beide Hände frei bleiben. Damit kämpft er faktisch mit drei Waffen zugleich.'],
    ['Schwertkampf',
      'Er führt eine Klinge und verbindet sie mit seinen Sprüngen zu Angriffen aus jeder Richtung. Gegen Blade trifft er auf jemanden, der genau darauf vorbereitet ist.'],
  ],

  'elektra': [
    ['Kampfkunst',
      'Stick hat sie von Kind an ausgebildet, und sie schlägt sich durch Gegner, die ihr an Masse weit überlegen sind. Im Void hält sie damit gegen Cassandra Novas Truppen stand, wo die meisten längst gefallen sind.'],
    ['Zwei Sai',
      'Ihre beiden dreizackigen Klingen führt sie beidhändig, fängt damit Waffen ab und wirft sie, wenn der Gegner zu weit weg steht. Sie sind ihr Erkennungszeichen und liegen ihr näher als jede Schusswaffe.'],
    ['Zurück aus dem Tod',
      'Sie ist einmal gestorben und von Stick durch das Kimagure zurückgeholt worden, jene Kunst, die auch den Blick auf das Kommende öffnet. Seither trägt sie die Ruhe von jemandem, der das Schlimmste schon hinter sich hat.'],
  ],

  'blind-al': [
    ['Schonungslose Sprache',
      'Al sagt jedem ins Gesicht, was er ist, und Wade Wilson steht dabei an erster Stelle. Kein Gast seiner Geburtstagsfeier bekommt so viel Wahrheit zu hören wie der Gastgeber selbst.'],
    ['Gehör statt Augenlicht',
      'Sie erkennt an Schritten, wer die Wohnung betritt, und verfolgt die Prügelei mit dem Deadpool Corps vom Fenster aus in allen Einzelheiten. Ihr Kommentar dazu ist, dass ihr lieber das Gehör genommen worden wäre.'],
    ['Ein Haushalt mit Deadpool',
      'Sie führt eine Wohnung, in der ein Söldner mit Regenerationskräften lebt, und rechnet ihm dabei die ausstehende Miete vor. Dass diese Wohnung überhaupt noch steht, ist ihr Verdienst.'],
  ],

  'negasonic-teenage-warhead': [
    ['Atomare Explosionen',
      'Sie lädt den eigenen Körper auf und entlädt ihn als Explosion, meist im Sprung. Die Kraft dafür kommt aus ihr selbst, weshalb sie sie auch mitten im Gespräch abrufen kann.'],
    ['Ein Körper, der das aushält',
      'Ihre eigene Detonation wirft sie nicht um, sondern trägt sie. Was um sie herum zu Bruch geht, lässt sie unbeeindruckt.'],
    ['Ausbildung bei Colossus',
      'Colossus nimmt sie in der Villa unter seine Fittiche und bringt ihr bei, die Explosion zu richten statt sie nur geschehen zu lassen. Aus dem Verhältnis der beiden lebt jeder ihrer gemeinsamen Auftritte.'],
  ],

  'yukio': [
    ['Elektrizität',
      'Yukio wurde als Mutantin geboren, die Strom lenken kann, und kam damit zu den X-Men. In Wades Geschichte kommt die Gabe nie zum Einsatz, was daran liegt, dass sie dort nur zu Gast ist.'],
    ['Freundlichkeit ohne Vorbehalt',
      'Sie begrüßt Wade Wilson mit einem Hallo, das ihm sonst niemand gönnt, und meint es jedes Mal. In einem Film voller Häme ist das die seltenere Fähigkeit.'],
  ],

  'peter-wisdom': [
    ['Verkaufsgespräch',
      'Wisdom verkauft bei Drive Max Gebrauchtwagen und redet dabei weiter, wo andere längst aufgeben. Der Familie Chipman kommt er damit näher als sein Kollege.'],
    ['Der aufbewahrte Anzug',
      'Er hebt Wilsons alten Deadpool-Anzug in seinem Spind auf, für den Fall, dass sein Freund es sich anders überlegt. Genau dieser Anzug entscheidet später den Kampf gegen das Corps.'],
    ['Peterpool',
      'In den Anzug gestiegen zieht er die gesamte Armee der Deadpool-Varianten auf sich, ohne einen Schlag zu führen. Sie feiern ihn, und in der Zeit kommen Deadpool und Wolverine unbemerkt in die U-Bahn.'],
  ],

  'shatterstar': [
    ['Außerirdische Herkunft',
      'Shatterstar stammt nicht von der Erde, was Deadpool bei der Aufnahme in die X-Force vollauf genügt. Was ihn von einem Menschen unterscheidet, zeigt der Film nie.'],
    ['Ein zurückgedrehter Tod',
      'Beim ersten Absprung der X-Force stirbt er wie fast alle anderen. Dass er heute an einem Geburtstagstisch sitzt, verdankt er Cables Zeitgerät und nicht den eigenen Fähigkeiten.'],
  ],

  'headpool': [
    ['Flug mit Propellermütze',
      'Auf der zerrissenen Maske sitzt eine Propellermütze, und sie trägt den Kopf durch die Luft. Anders käme er nicht von der Stelle.'],
    ['Ein Leben ohne Körper',
      'Er ist zombifiziert und besteht nur noch aus dem Kopf, was ihn weder am Reden noch am Kämpfen hindert. Deadpool schlägt ihn mehrfach gegen eine Wand, ohne ihn damit loszuwerden.'],
    ['Kommando im Corps',
      'Er gibt den Befehl zum Feuern und ebenso den zum Einstellen, als Wolverine den Hund hochhält. In einer Truppe aus lauter Deadpools hört man ausgerechnet auf ihn.'],
  ],

  'callisto': [
    ['Übermenschliche Schnelligkeit',
      'Callisto läuft schneller, als ein Mensch es könnte, und steht vor Gambit, bevor der die Karte in der Hand hat. Ihr Körper ist auf diese Belastung hin gebaut.'],
    ['Zwei Messer',
      'Ihre gesamte Bewaffnung besteht aus einem Paar Messer, die sie gleichzeitig führt. Sie wartet damit nicht ab, sondern geht auf jeden zu.'],
  ],

  'quill': [
    ['Stacheln aus dem Körper',
      'Sie lässt stachelschweinartige Stacheln aus dem eigenen Körper wachsen, am dichtesten über Gesicht und Kopf. Wer nach ihr greift, greift nur einmal.'],
    ['Nahkampf in Novas Gefolge',
      'Sie hält mit den übrigen Handlangern die Festung und stellt sich beim Angriff des Widerstands in den Hof. Gegen Elektra, die gar nicht erst zugreift, nützt ihr die Bewaffnung nichts.'],
  ],

  'lady-deathstrike': [
    ['Klauen aus Adamantium',
      'An allen zehn Fingerspitzen fahren Klauen aus, die wie ihr ganzes Skelett mit Adamantium durchsetzt sind und deshalb kaum zu zerbrechen. Damit ist sie das weibliche Gegenstück zu Wolverine.'],
    ['Übermenschlicher Körper',
      'Kraft, Tempo, Ausdauer und Reflexe liegen weit über dem menschlichen Maß, und Wunden schließen sich von selbst. Altern tut sie dabei so gut wie nicht.'],
    ['Novas Leibgarde',
      'Sie gehört zum engeren Kreis um Cassandra Nova und steht bei den Verhören mit im Raum. Ihr Verbleib nach dem Sturm auf die Festung bleibt offen.'],
  ],

  'throg': [
    ['Winziger Mjölnir',
      'Sein Hammer ist so groß wie eine Münze und schlägt trotzdem mit voller Wucht zu. Er zertrümmert damit ein Einmachglas aus dem Archiv der TVA.'],
    ['Donnerkraft',
      'Auch als Frosch ruft er Blitz und Gewitter, wenn auch in kleinerem Maßstab. Die Kraft hängt am Charakter und nicht an der Gestalt.'],
    ['Würdig',
      'Der Hammer folgt weiterhin nur dem, der seiner würdig ist, und Throg ist es geblieben. Genau darin liegt der ganze Witz seiner Existenz.'],
  ],

  'alioth': [
    ['Verschlingen von Materie und Zeit',
      'Die violette Wolke frisst alles, was sie berührt, samt der Zeit, in der es steht. Was in ihr verschwindet, hat es nie gegeben.'],
    ['Unangreifbar',
      'Waffen, Zauber und Schiffe richten gegen sie nichts aus, weil sie keinen Körper hat, den man treffen könnte. Ablenken lässt sie sich nur mit einem Trugbild.'],
    ['Wächter der Leere',
      'Jener der bleibt hat sie als Zaun um sein Reich gesetzt, damit von dort niemand zurückkommt. Sie ist der Grund, warum das Ende der Zeit so lange unentdeckt bleibt.'],
  ],

  'colossus': [
    ['Haut aus organischem Stahl',
      'Auf Wunsch überzieht sich sein Körper mit Metall, und darunter bleibt er beweglich. Der Wechsel dauert einen Augenblick und lässt sich nicht erzwingen.'],
    ['Übermenschliche Kraft',
      'In Stahlform hebt und wirft er, was Fahrzeuge nicht bewegen. Er setzt das so zurückhaltend ein, dass es Wade Wilson regelmäßig zur Verzweiflung bringt.'],
    ['Nahezu unverwundbar',
      'Kugeln, Klingen und Stürze aus großer Höhe machen ihm in dieser Form nichts aus. Was ihn trifft, ist eher das, was gesagt wird.'],
  ],

  'eson': [
    ['Machtstein im Stab',
      'Der Celestial führt den Stein in einem Stab und richtet ihn auf eine bewohnte Welt. Was danach bleibt, ist verbrannter Fels.'],
    ['Auslöschung ganzer Welten',
      'Ein einziger Einsatz genügt, und ein Planet ist Geschichte. Die Aufnahme davon ist der Grund, warum die Nova-Truppen den Stein überhaupt fürchten.'],
    ['Kosmische Energie',
      'Als Celestial trägt er eine Kraft, die außerhalb jeder Rechnung steht, und der Stein ist nur ein Werkzeug darin. Er kann ihn halten, ohne dabei zu vergehen.'],
  ],

  'jemiah': [
    ['Erschaffung von Welten und Arten',
      'Er gehört zu den Celestials, die in der Weltenschmiede Leben und Planeten hervorbringen. Sein Anteil daran ist die Ordnung, in die alles danach eingereiht wird.'],
    ['Kosmische Energie',
      'Wie alle seiner Art trägt er Kraft in einer Größenordnung, die Eternals klein erscheinen lässt. Zu sehen ist das nur in den Rückblenden auf die Weltenschmiede.'],
  ],

  'j-jonah-jameson': [
    ['Reichweite im Netz',
      'Sein Portal erreicht Millionen Menschen, und was er dort sendet, gilt am nächsten Morgen als Nachricht. Aus Mysterios Aufnahme macht er in einer Nacht eine weltweite Kampagne.'],
    ['Enthüllung von Spider-Mans Namen',
      'Er stellt Peter Parkers Gesicht und Namen ins Netz und zerlegt damit dessen ganzes Leben. Für ihn ist es Journalismus, für alle anderen der Anfang eines Alptraums.'],
  ],
  'martinex': [
    ['Körper aus Kristall',
      'Der Pluvianer besteht aus geschliffenem Kristall und hält damit Treffer aus, die Metall verbiegen. Sein Aussehen ist zugleich seine Panzerung.'],
    ['Hitze und Kälte aus den Händen',
      'Er gibt aus der einen Hand Glut und aus der anderen Frost ab und setzt beides gezielt ein. Damit trennt er Schotten auf oder friert einen Gegner an Ort und Stelle fest.'],
    ['Ravager-Hauptmann',
      'Er gehört zu den Kapitänen, die den Bund der hundert Clans mitgegründet haben, und steht Stakar Ogord am nächsten. Wenn dieser eine Entscheidung ändert, ist Martinex meistens der Grund.'],
  ],

  'shocker': [
    ['Vibrationshandschuh',
      'Der Handschuh gibt eine gebündelte Erschütterung ab, die einen Menschen durch eine Wand wirft. Gebaut ist er aus Chitauri-Teilen und einem sehr genauen Verständnis von Mechanik.'],
    ['Chitauri-Technik',
      'Er arbeitet mit dem, was Toomes’ Bande aus den Trümmern zieht, und macht daraus benutzbare Waffen. Wo etwas nicht passt, baut er es passend.'],
    ['Nahkampf',
      'Ohne Handschuh schlägt er sich immer noch durch die meisten Gegner. Gegen Spider-Man reicht das genau so lange, bis dieser zielen kann.'],
  ],

  'ulysses-klaue': [
    ['Schallkanone im Arm',
      'Nach dem Verlust des Arms setzt er sich eine Waffe an den Stumpf, die gebündelten Schall abgibt. Ein Schuss reicht, um einen Wagen umzuwerfen.'],
    ['Vibranium-Handel',
      'Er ist der einzige Mensch, der Wakanda je Vibranium gestohlen hat, und lebt seither davon. Sein Vorrat macht ihn für jeden Käufer auf der Welt interessant.'],
    ['Waffenschmuggel',
      'Er kennt jeden Hafen, jeden Zoll und jeden Mittelsmann und liefert überall hin. Genau dieses Netz bringt ihn mit Ultron und später mit Killmonger zusammen.'],
  ],

  'jean-grey': [
    ['Übernahme fremder Körper',
      'Sie greift in einen fremden Geist und führt von dort dessen Hände und Stimme. Wer sie beherbergt, merkt es erst, wenn es vorbei ist.'],
    ['Telepathie über weite Strecken',
      'Sie hört Gedanken über Stadtgrenzen hinweg und findet Menschen allein an dem, was sie denken. Ihre Reichweite wächst mit dem, was sie fühlt.'],
    ['Telekinese',
      'Sie hebt Fahrzeuge und schickt psionische Wellen durch ganze Räume. Als ihre Schwester stirbt, bricht diese Kraft ungebremst aus ihr heraus.'],
  ],

  'sara-grey': [
    ['Telepathie',
      'Sie hört, was andere denken, und kann Gedanken auch senden. In den Laboren von Damage Control ist genau das der Grund, warum man sie behält.'],
    ['Übernahme fremder Körper',
      'Sie springt in einen anderen Menschen hinein und benutzt dessen Körper als eigenen. Was als Ausweg gedacht war, wird zum Zwang, sobald jemand sie dazu drängt.'],
    ['Sprünge über mehrere Menschen',
      'Sie wechselt in einer Kette von Körper zu Körper und legt so ganze Räume zurück. Jeder Sprung nimmt ihr etwas, und irgendwann bleibt nichts mehr übrig.'],
  ],

  'william-metzger': [
    ['Leitung von Damage Control',
      'Metzger führt die Behörde, die nach jedem Kampf aufräumt, und entscheidet, was aus den Fundstücken wird. Seine Unterschrift steht unter Vorgängen, die es offiziell nicht gibt.'],
    ['Zugriff auf beschlagnahmte Technik',
      'Was Damage Control einsammelt, landet in seinen Lagern, von Chitauri-Waffen bis zu Stark-Teilen. Er verfügt damit über ein Arsenal, das keiner Aufsicht untersteht.'],
    ['Versuche an Gefangenen',
      'Er lässt Menschen verschleppen und ihre Kräfte im Labor bis zum Tod ausreizen. Spider-Man belügt er dabei von der ersten Minute an.'],
  ],

  'jean-dewolff': [
    ['Ermittlungen gegen das organisierte Verbrechen',
      'DeWolff arbeitet an den Fällen, die andere Reviere nicht anfassen, und lässt sich nicht abschieben. Ihre Akten reichen tiefer in die Stadt hinein, als ihren Vorgesetzten lieb ist.'],
    ['Kontakte im gesamten Revier',
      'Sie kennt jeden im Dienst und weiß, wer redet und wer bezahlt wird. Über diese Verbindungen bekommt sie Auskünfte, die in keinem Bericht stehen.'],
    ['Kurzer Draht zu Spider-Man',
      'Sie arbeitet mit ihm zusammen, statt ihn zu jagen, und tauscht Hinweise gegen Hinweise. Für ihn ist sie die einzige Stelle bei der Polizei, die nicht sofort schießt.'],
  ],

  'snow': [
    ['Nahkampf',
      'Die Kämpferin der Hand schlägt schneller zu, als ein Blick folgen kann, und lässt keine Deckung zu. Gegen Spider-Man ist sie die Erste, die ihn im Nahkampf ernsthaft in die Enge treibt.'],
    ['Zwei Katanas',
      'Sie führt beide Schwerter zugleich und wechselt zwischen Angriff und Abwehr, ohne die Hände zu tauschen. Netze schneidet sie damit durch, bevor sie sich zusammenziehen.'],
    ['Akrobatik',
      'Sie bewegt sich lautlos über Dächer, Geländer und Gerüste und steht plötzlich hinter ihrem Ziel. Für Damage Control ist genau das der Grund, sie überhaupt einzusetzen.'],
  ],

  'ramrod': [
    ['Erhöhte Widerstandskraft',
      'Ramrod übersteht es, von Spider-Man gegen eine Ziegelwand geschleudert zu werden, die dabei einstürzt. Er selbst steht danach wieder auf.'],
    ['Der Sturmangriff',
      'Sein Kampfstil besteht aus einem einzigen geraden Anlauf mit voller Wucht. Genau dieser Schwung ist es, den Spider-Man gegen ihn verwendet.'],
  ],

  'e-v': [
    ['Anzeige im Sichtfeld',
      'Sie legt Peter Parker Karten, Werte und Ziele direkt in die Maske. Er sieht damit den Raum, bevor er ihn betritt.'],
    ['Auswertung von Kampfdaten',
      'Sie misst jeden Treffer, jede Bewegung und jeden Fehler und sagt hinterher, was besser ginge. Ihre Auswertungen sind ehrlicher, als ihm lieb ist.'],
    ['Wartung des Anzugs',
      'Sie kalibriert Netzdruck, Sensoren und Gelenke und meldet Verschleiß, bevor etwas reißt. In den Jahren nach dem großen Vergessen ist sie zugleich seine einzige Gesellschaft.'],
  ],

  'paul-rabin': [
    ['Studium am MIT',
      'Rabin ist ein sehr guter Student in einem sehr anspruchsvollen Fach und arbeitet hart dafür. Von dem, was um ihn herum geschieht, bekommt er nichts mit.'],
    ['Freund von MJ',
      'Er ist der Mensch, mit dem MJ ein Leben ohne Masken führen könnte, und genau deshalb hält Peter Parker Abstand. Auf der Feier am MIT steht er neben ihr, während der andere geht.'],
    ['Ahnungslosigkeit',
      'Von der Gefahr, in der MJ schwebt, bekommt er nichts mit, und niemand klärt ihn auf. Das ist kein Fehler an ihm, sondern genau der Punkt.'],
  ],

  'lonnie-lincoln-tombstone': [
    ['Übermenschliche Kraft',
      'Er hebt einen Menschen mit einer Hand über die Kante eines Hochhauses und hält ihn dort. Was er anfasst, gibt nach.'],
    ['Widerstandsfähige Haut',
      'Schläge und Geschosse prallen an ihm ab, seine Haut ist härter als jede Weste. Deshalb sucht Spider-Man gegen ihn nach etwas anderem als Fäusten.'],
    ['Schnelle Reflexe',
      'Für seine Größe bewegt er sich erstaunlich schnell und greift zu, bevor jemand ausweicht. Er verliert am Ende nicht an Tempo, sondern an einem Netz vor den Augen.'],
  ],

  'fred-myers-boomerang': [
    ['Wurfbumerangs',
      'Seine Wurfgeschosse sprengen, betäuben oder schneiden, je nachdem, welches er zieht. Sie kommen zu ihm zurück, auch wenn sie unterwegs abgelenkt wurden.'],
    ['Anzug mit Visier',
      'Sein Anzug trägt die Halterungen für das ganze Sortiment und ein Visier, das Bahnen berechnet. Damit trifft er auch dorthin, wo er nicht hinsieht.'],
    ['Treffsicherheit',
      'Er trifft über die Breite eines Häuserblocks hinweg und rechnet den Rückweg mit. Auf einem Dach in New York erwischt er Spider-Man im Schwung beinahe.'],
  ],

  'alejandro-montoya-el-aguila': [
    ['Fechtkunst',
      'Er ficht mit großen Gesten und sehr genauer Klingenführung und redet dabei ununterbrochen. Sein Stil kommt aus der Arena und nicht aus der Halle.'],
    ['Degen',
      'Seine Waffe ist ein leichter Degen, den er auch dann zieht, wenn niemand ihn herausgefordert hat. Er führt ihn einhändig und mit sehr viel Selbstbewusstsein.'],
    ['Stierkampferfahrung',
      'Aus der Arena bringt er das Gefühl für Abstand und Zeitpunkt mit. Im Retreat von Emil Blonsky ist er damit derjenige, der am wenigsten Angst zeigt.'],
  ],

  'alexander-gentry-porcupine': [
    ['Stachelanzug',
      'Sein selbstgebauter Anzug ist über und über mit Stacheln besetzt, die sich abschießen lassen. Er trägt ihn auch dort, wo niemand ihn angreift.'],
    ['Nahkampf',
      'Als früherer Waffenentwickler der Regierung ist er ausgebildet und weiß, wohin er schlägt. Der Anzug nimmt ihm dabei jede Rücksicht ab.'],
  ],

  'dirk-garthwaite-wrecker': [
    ['Verstärkte Kraft',
      'Asgardisches Vibranium in seinem Körper macht ihn stark genug, um Wände einzureißen. Er teilt diese Kraft mit den drei anderen seiner Bande.'],
    ['Brechstange',
      'Seine mystische Brechstange ist Quelle und Werkzeug seiner Kraft zugleich. Wer sie hält, bekommt einen Teil davon ab.'],
    ['Anführer der Wrecking Crew',
      'Er hält die Bande zusammen und verteilt die Aufträge, die von der Intelligencia kommen. Nach der Niederlage sucht ausgerechnet er die Aussprache mit seinem Opfer.'],
  ],

  'muzzafar-lambert-saracen': [
    ['Vampirische Kräfte',
      'Er ist schneller, stärker und zäher als ein Mensch und altert nicht. Tageslicht meidet er, so gut es der Terminplan des Retreats zulässt.'],
    ['Blutdurst',
      'Er braucht Blut und mischt es sich heimlich in den Tee der Gruppe, um niemanden anzufallen. Es ist sein eigener Weg, sich zusammenzunehmen.'],
  ],

  'william-taurens-man-bull': [
    ['Verstärkte Kraft',
      'Der missglückte Versuch hat ihn stärker gemacht als jeden Menschen und ihm zugleich das Gesicht genommen. Er rennt gegen alles an, was ihm im Weg steht.'],
    ['Hörner',
      'Zwei schwere Hörner sitzen an seinem Kopf und sind seine bevorzugte Waffe. Er setzt sie auch dann ein, wenn ein Wort gereicht hätte.'],
    ['Stiergestalt',
      'Sein Körper ist halb Mensch, halb Stier und lässt sich nicht zurückverwandeln. Im Retreat arbeitet er daran, damit zu leben statt dagegen.'],
  ],

  'craig-hollis-mr-immortal': [
    ['Unsterblichkeit',
      'Er stirbt regelmäßig und steht kurz darauf wieder auf, egal wie. Alter setzt ihm dabei ebenso wenig zu wie ein Sturz vom Dach.'],
    ['Beschleunigte Heilung',
      'Wunden schließen sich bei ihm von selbst, und Brüche wachsen zusammen. Deshalb sind seine Sprünge von Brücken für ihn eher unbequem als gefährlich.'],
    ['Rückkehr nach dem Tod',
      'Nach jedem Tod wacht er unversehrt wieder auf, was er vor allem benutzt, um sich aus Ehen zu stehlen. Als fünf Verlassene gleichzeitig klagen, wird daraus ein Fall.'],
  ],

  'donny-blaze': [
    ['Sling Ring',
      'Sein Ring aus Kamar-Taj öffnet Portale, obwohl er die Ausbildung dazu nie beendet hat. Er benutzt ihn für Bühnenshows und nicht für das, wofür er gedacht ist.'],
    ['Portale zwischen Dimensionen',
      'Seine Durchgänge treffen nicht immer das, was er vorhatte, und öffnen sich schon einmal in eine Dämonendimension. Was dabei herauskommt, bleibt in Los Angeles.'],
    ['Bühnenzauberei',
      'Er verbindet echte Magie mit Rauch, Musik und Ansage und verkauft es als Show. Genau diese Mischung macht die Sache gefährlich.'],
  ],

  'luke-jacobson': [
    ['Kostümdesign',
      'Jacobson entwirft Anzüge für Menschen mit Kräften und rechnet Belastung, Dehnung und Schutz mit ein. Was er näht, hält Stürze und Feuer aus.'],
    ['Anzüge für Daredevil und She-Hulk',
      'Von ihm kommen der rote Anzug aus Hell’s Kitchen und die ganze Garderobe von Jennifer Walters. Er verlangt dafür Loyalität und lässt jeden fallen, der an seiner Arbeit zweifelt.'],
  ],

  'mallory-book': [
    ['Übermenschenrecht',
      'Book kennt die Rechtslage zu Kräften, Namen und Haftung besser als jede andere Anwältin der Kanzlei. Sie hat die Abteilung faktisch aufgebaut.'],
    ['Prozessführung',
      'Vor Gericht arbeitet sie kühl und ohne Rücksicht auf Sympathien und gewinnt damit auch aussichtslose Fälle. Im Prozess gegen Titania führt sie Jennifer Walters Schritt für Schritt.'],
  ],
  'skaar': [
    ['Übermenschliche Kraft',
      'Als Sohn des Hulk hebt und schlägt er auf demselben Niveau wie sein Vater. Auf Sakaar ist er damit groß geworden, und auf der Erde steht er damit vor einer Haustür.'],
    ['Widerstandsfähige Haut',
      'Seine Haut hält Klingen und Geschosse ab, wie es bei Gammawesen üblich ist. Was ihn trifft, hinterlässt selten mehr als einen Kratzer.'],
    ['Sohn des Hulk',
      'Er ist im Feuer geboren, von Ungeheuern großgezogen und für den Kampf bestimmt worden. Von diesem Erbe bleibt vor allem die Frage, ob er es annehmen will.'],
  ],

  'todd-phelps': [
    ['Vermögen',
      'Sein Geld kauft Labore, Anwälte und eine ganze Bande, und es kauft ihm auch das Schweigen darüber. Ohne dieses Vermögen wäre die Intelligencia ein Forum ohne Folgen.'],
    ['Gründer von Intelligencia',
      'Unter dem Namen HulkKing baut er ein Hassforum auf und hetzt es gezielt auf Jennifer Walters. Was dort geschrieben wird, setzt er anschließend in Aufträge um.'],
    ['Vibranium-Speer',
      'Sein Speer ist die einzige Waffe im Raum, die She-Hulk ernsthaft verletzen kann. Sie stammt aus Beständen, die niemand hätte verkaufen dürfen.'],
  ],

  'clown': [
    ['Pyrotechnik',
      'Sie kennt Ladung, Zündfolge und Wirkung und baut Feuer, das genau dort brennt, wo es soll. Ihr Handwerk stammt aus der Bühnentechnik und nicht aus dem Militär.'],
    ['Sprengsätze',
      'Für Hoods Einbrüche legt sie Ladungen, die Wände öffnen, ohne das Gebäude einzureißen. Genau diese Genauigkeit macht sie für die Bande unersetzlich.'],
  ],

  'jeri-blood': [
    ['Nahkampf',
      'Er verdient sein Geld in Kellerkämpfen, in denen es keine Regeln gibt, und gewinnt dort meistens. Bei Hood ist er derjenige, der zuerst zuschlägt.'],
    ['Körperkraft',
      'Er hebt und wirft, was zwei andere nicht bewegen, und braucht dafür kein Werkzeug. Aus jeder Liga geflogen ist er nicht wegen mangelnder Kraft.'],
  ],

  'john-king': [
    ['Führung der Bande',
      'King stellt die Truppe zusammen, verteilt die Rollen und plant die Einbrüche. Sein Cousin Parker Robbins wäre ohne ihn ein Kleinkrimineller geblieben.'],
    ['Nahkampf',
      'Er kämpft ohne Zögern und mit dem, was greifbar ist. Beim Überfall auf ArtWorks Technology reicht ihm das bis in den Raum, aus dem er nicht mehr herauskommt.'],
  ],

  'landon': [
    ['Verhandlungsgeschick',
      'Der Junge kennt den Wert jeder Sache und verlangt konsequent das Doppelte. Riri Williams zahlt ihm jeden Handgriff einzeln.'],
    ['Straßenverkauf',
      'Mit einem Bollerwagen voller Ware bewegt er sich durch das ganze Viertel und weiß, wer was braucht. Sein Sortiment ist erstaunlich vollständig.'],
  ],

  'ronnie-williams': [
    ['Halt der Familie',
      'Sie bringt ihre Tochter nach zwei Todesfällen allein durch und hält den Betrieb und das Haus zusammen. Was sie leistet, wird nirgendwo verbucht.'],
    ['Blick für ihre Tochter',
      'Sie sieht als Erste, dass hinter Riris Rüstungsbau keine Genialität steht, sondern Trauer. Diese Erkenntnis spricht sie auch aus, obwohl sie damit alles ins Wanken bringt.'],
  ],

  'roz-blood': [
    ['Nahkampf',
      'Sie kämpft wie ihr Bruder, hart und ohne Regeln, und ist aus denselben Ligen verbannt worden. In Hoods Bande arbeiten die beiden als Paar.'],
    ['Körperkraft',
      'Sie hebt Türen aus Angeln und trägt, was sonst zwei Leute tragen. Beim ersten großen Einbruch öffnet sie damit genau die falsche.'],
  ],

  'slug': [
    ['Hacken',
      'Er kommt in jedes System, das eine Verbindung nach außen hat, und steht dafür auf Fahndungslisten mehrerer Länder. Für Hood arbeitet er gegen Schutz statt gegen Geld.'],
    ['Überwachungstechnik',
      'Er zapft Kameras, Funk und Datenströme an und weiß deshalb vor allen anderen, wer sich wohin bewegt. Die Einbrüche der Bande laufen über seine Bilder.'],
  ],

  'zelma-stanton': [
    ['Magie',
      'Sie hat sich ihre Kunst selbst beigebracht und arbeitet mit Formeln, Kreidezeichen und einer Menge Ausprobieren. Was ihr an Ausbildung fehlt, gleicht sie mit Mut aus.'],
    ['Teleportation',
      'Sie versetzt sich und andere über kurze Strecken und kommt damit dorthin, wo keine Tür ist. Für Riri Williams ist das mehr als einmal die Rettung.'],
    ['Verzauberung von Technik',
      'Sie legt Zauber auf Metall und Schaltkreise und macht damit eine Rüstung gegen Magie tauglich. Erst dadurch hat Ironheart gegen den Hood überhaupt eine Chance.'],
  ],

  'agent-cleary': [
    ['Ermittlungsführung',
      'Cleary leitet Zugriffe des Department of Damage Control und arbeitet dabei gründlich und ohne Eile. Er nimmt in New York eine ganze Schulklasse mit, weil sie in einer Akte steht.'],
    ['Verhörtechnik',
      'Er fragt höflich, wiederholt geduldig und lässt die Pausen für sich arbeiten. Unter dem Ton liegt jedes Mal die Androhung dessen, was seine Behörde darf.'],
  ],

  'demarr-davis-doorman': [
    ['Körper als Portal',
      'Wer durch ihn hindurchgeht, kommt an einem anderen Ort wieder heraus. Er ist damit selbst die Tür und muss dafür nur stillhalten.'],
    ['Darkforce',
      'Eine Pfütze aus Darkforce hat ihn zu dem gemacht, was er ist, und diese Energie trägt er seither in sich. Sie ist der Grund, warum sein Durchgang funktioniert.'],
    ['Zugang zur Dunklen Dimension',
      'Was durch ihn hindurchgeht, streift dabei eine andere Dimension. Betrunken verliert er die Kontrolle darüber, und das bekommt sein Publikum zu spüren.'],
  ],

  'eric-williams': [
    ['Der Bruder, der geblieben ist',
      'Während Simon nach Hollywood ging, ist er zu Hause geblieben und hat die Familie mitgetragen. An dieser Aufteilung hängt jede Spannung zwischen den beiden.'],
  ],

  'janelle-jackson': [
    ['Schauspielagentur',
      'Sie vertritt Simon Williams und hält den Kontakt zu Studios, die von sich aus nicht anrufen. Ihre Arbeit besteht zur Hälfte darin, Absagen zu übersetzen.'],
    ['Vermittlung',
      'Sie bringt Menschen zusammen, die einander nützen, und weiß, wann ein Anruf sich lohnt. Ohne sie käme er nicht einmal ins Vorsprechen.'],
  ],

  'martha-williams': [
    ['Halt der Familie',
      'Als Witwe von Sanford Williams hält sie ihre beiden Söhne zusammen, auch über eine ganze Landesbreite hinweg. Ihre Geburtstagsfeier ist der Ort, an dem alles zusammenkommt.'],
  ],

  'sanford-williams': [
    ['Der abwesende Vater',
      'Sein Tod liegt über der Familie und über dem Verhältnis der beiden Brüder. Was er zu Lebzeiten von seinen Söhnen erwartet hat, wirkt weiter, obwohl er nichts mehr sagt.'],
  ],

  'cowboypool': [
    ['Selbstheilung',
      'Wie jede Wade-Wilson-Variante steht er nach jedem Treffer wieder auf. Im Void ist das die Grundausstattung seines ganzen Corps.'],
    ['Zwei Colts',
      'Er führt zwei Revolver vom Typ Single Action Army und zieht sie schneller, als er redet. Nachladen kommt bei ihm im Gefecht kaum vor.'],
    ['Revolverkunst',
      'Er trifft aus der Hüfte, über die Schulter und im Fallen und lässt die Waffen dazwischen kreisen. Der Aufwand dabei ist ihm mindestens so wichtig wie das Ergebnis.'],
  ],

  'johnny-storm-121698': [
    ['Körper in Flammen',
      'Er entzündet sich wie jeder Human Torch und brennt dabei heiß genug, um Metall zu schneiden. In der Leere ist er einer der wenigen mit echter Feuerkraft.'],
    ['Flug',
      'In Flammenform fliegt er über die Ödnis der Leere und sucht von oben nach Wegen. Er ist damit der Aufklärer der Widerstandsgruppe.'],
    ['Feuerkontrolle',
      'Er lenkt Flammen auch außerhalb seines Körpers und formt sie zu Bahnen und Wänden. Was ihn umbringt, ist trotzdem nicht Feuer, sondern eine Bemerkung über Cassandra Nova.'],
  ],

  'kidpool': [
    ['Selbstheilung',
      'Auch das Kind im roten Anzug steht nach jedem Treffer wieder auf. Es hält das für vollkommen normal.'],
    ['Zwei Katanas',
      'Es trägt zwei echte Schwerter und benutzt sie ohne jede Zurückhaltung. Wer die Wasserpistolen für die eigentliche Bewaffnung hält, liegt falsch.'],
    ['Wasserpistolen',
      'Sie gehören zur Ausstattung und werden mit demselben Ernst gezogen wie alles andere. Sie sind der Teil des Auftritts, der andere unterschätzen lässt.'],
  ],

  'ladypool': [
    ['Selbstheilung',
      'Wanda Wilson trägt denselben Heilfaktor wie jede Variante ihres Namens. Im Void ist das die Voraussetzung dafür, überhaupt so lange zu bestehen.'],
    ['Nahkampf',
      'Sie kämpft schnell und sauber und ist dabei deutlich weniger umständlich als das Original. Gegen Deadpool und Wolverine hält sie sich ohne Mühe.'],
    ['Führung des Deadpool Corps',
      'Sie führt eine Truppe, die ausschließlich aus Varianten ihrer selbst besteht, und hält sie erstaunlich gut zusammen. Den Kampf beendet sie mit einem Waffenstillstand statt mit einem Sieg.'],
  ],
  'laura-x-23': [
    ['Selbstheilung',
      'Sie trägt Logans Heilfaktor und steht nach jeder Wunde wieder auf. Was ihr davon bleibt, ist nicht die Narbe, sondern die Erinnerung.'],
    ['Adamantiumklauen',
      'An beiden Händen fahren zwei Klingen aus, an den Füßen je eine weitere. Das Metall ist dasselbe wie bei ihm, nur die Zahl ist anders.'],
    ['Tochter von Logan',
      'Sie ist aus seinem Erbgut geschaffen und zum Zustechen erzogen worden und hat sich davon gelöst. Im Void ist sie es, die einen gebrochenen Wolverine wieder zum Kämpfen bringt.'],
  ],

  'samuraipool': [
    ['Selbstheilung',
      'Auch diese Variante steht nach jedem Treffer wieder auf. Im Deadpool Corps ist das die Voraussetzung für die Aufnahme.'],
    ['Zwei Katanas',
      'Sie führt beide Schwerter zugleich und hält sie sauberer als das Original. Der Strohhut bleibt dabei erstaunlich lange auf dem Kopf.'],
    ['Schwertkampf',
      'Ihre Bewegungen folgen einer Schule und nicht dem Zufall, was sie unter den Varianten heraushebt. Sie schlägt kurz und ohne Vorrede zu.'],
  ],

  'victor-creed-sabretooth': [
    ['Selbstheilung',
      'Er heilt so schnell wie sein Halbbruder und steckt entsprechend viel ein. Deshalb dauert es lange, bis ihn überhaupt jemand aufhält.'],
    ['Ausfahrbare Klauen',
      'Aus seinen Fingern fahren Krallen, mit denen er reißt statt schneidet. Sie sind sein Erkennungszeichen und der Grund, warum ein Zweikampf mit ihm kurz ausfällt.'],
    ['Tierische Sinne',
      'Er riecht und hört, was Menschen entgeht, und findet seine Beute über weite Strecken. Im Void spürt er Logan auf, bevor dieser ihn bemerkt.'],
  ],

  'john-allerdyce-pyro': [
    ['Pyrokinese',
      'Er lenkt vorhandenes Feuer und formt daraus Wände, Bahnen und Kugeln. Entzünden kann er es nicht selbst, dafür braucht er einen Funken.'],
    ['Feuerkontrolle',
      'Was einmal brennt, gehorcht ihm bis in die letzte Flamme, auch über weite Entfernung. Im Void ist er damit einer von Cassandra Novas gefährlichsten Wächtern.'],
  ],

  'dave': [
    ['Fluchtwagenfahrer',
      'Dave sitzt am Steuer, wenn es schnell gehen muss, und bringt den Wagen durch jede Lücke. Er hat in dieser Rolle noch niemanden zurückgelassen.'],
    ['Einbruch',
      'Er gehört zu Luis’ Truppe und kennt sich mit Türen, Zäunen und Zeitfenstern aus. Aus diesen drei Männern wird später eine eingetragene Sicherheitsfirma.'],
  ],

  'jentorra': [
    ['Führung des Widerstands',
      'Sie hält die Freiheitskämpfer des Quantenreichs zusammen, nachdem Kang ihre Heimat zur Hauptstadt gemacht hat. Ihr Wort gilt auch dort, wo niemand mehr an einen Sieg glaubt.'],
    ['Nahkampf',
      'Sie kämpft geübt und ohne Rücksicht auf Größenunterschiede. Gegen Kangs Truppen geht sie voran und nicht mit.'],
    ['Energiestab',
      'Ihre Waffe gibt gebündelte Energie ab und dient zugleich als Stange im Nahkampf. Sie ist im Quantenreich gebaut und mit nichts von der Erde vergleichbar.'],
  ],

  'jim-paxton': [
    ['Polizeidienst',
      'Paxton arbeitet beim San Francisco Police Department und kennt jeden Vorgang zu Scott Lang persönlich. Als er begreift, wer da wirklich vor ihm steht, deckt er ihn.'],
  ],

  'kurt-goreshter': [
    ['Hacken',
      'Kurt kommt in jedes System, das eine Leitung hat, und braucht dafür weniger Zeit als die Alarmanlage zum Hochfahren. Sein Werkzeug ist ein Laptop, den er überallhin mitnimmt.'],
    ['Sicherheitssysteme',
      'Er liest Schaltpläne, Sensoren und Schlösser und weiß, welche Lücke sich lohnt. Für Scott Langs Bande ist das die halbe Vorbereitung.'],
    ['Überwachungstechnik',
      'Er setzt Kameras, Wanzen und Empfänger und wertet aus, was hereinkommt. Später ist genau das die Geschäftsgrundlage von X-Con.'],
  ],

  'krylar': [
    ['Statthalter von Axia',
      'Er verwaltet die Hauptstadt des Quantenreichs für Kang und lebt entsprechend gut. Sein Palast ist der einzige Ort dort, an dem niemand Hunger hat.'],
    ['Zugang zu Kangs Hof',
      'Er kommt an den Herrscher heran, wann er will, und weiß, was dieser hören möchte. Genau darüber verkauft er Janet van Dyne ein zweites Mal.'],
  ],

  'maggie-lang': [
    ['Halt für Cassie',
      'Sie zieht ihre Tochter mit Jim Paxton groß und hält ihr den Alltag zusammen, während Scott im Gefängnis sitzt. Ihre Grenze zieht sie erst, als ein Kind im Spiel ist.'],
  ],

  'quaz': [
    ['Telepathie',
      'Er hört die Gedanken jedes Wesens in seiner Nähe, ob er will oder nicht. Abschalten lässt sich das bei ihm nicht, und deshalb ist er so schlecht gelaunt.'],
    ['Gedankenlesen',
      'Er greift gezielt nach dem, was jemand verbirgt, und findet es sofort. Bei Scott Lang stößt er dabei auf mehr, als er wissen wollte.'],
  ],

  'sonny-burch': [
    ['Schwarzmarkthandel',
      'Burch kauft und verkauft, was auf keinem Papier stehen darf, und hat für jede Ware einen Abnehmer. Sein Netz reicht von San Francisco bis in die Labore fremder Regierungen.'],
    ['Technikhehlerei',
      'Er ist auf gestohlene Forschung spezialisiert und weiß, was ein Bauteil auf dem freien Markt bringt. Hank Pyms Labor ist für ihn der größte Posten seines Lebens.'],
  ],

  'aneka': [
    ['Nahkampf',
      'Sie bildet die Dora Milaje aus und ist entsprechend die Beste unter ihnen. Ihre Bewegungen sind knapp, und sie kommt ohne einen Schritt zu viel aus.'],
    ['Vibranium-Dolche',
      'Shuris Dolche liegen ihr besser in der Hand als der vorgeschriebene Speer, und sie sagt das auch. Damit verteidigt sie einen Außenposten gegen eine Übermacht.'],
    ['Midnight-Angel-Rüstung',
      'Die fliegende Rüstung aus Shuris Werkstatt macht aus zwei Kriegerinnen eine Luftwaffe. Aneka trägt eine der ersten beiden.'],
  ],

  'att-lass': [
    ['Tarnung',
      'Er bewegt sich ungesehen an Gegnern vorbei und richtet sich in Stellung ein, bevor jemand ihn bemerkt. Auf der Erde ist er der Erste, der Position bezieht.'],
    ['Treffsicherheit',
      'Als Scharfschütze der Starforce trifft er über Entfernungen, die kein Mensch abdeckt. Seine Waffe ist auf Genauigkeit ausgelegt und nicht auf Wirkung.'],
    ['Kree-Ausbildung',
      'Er hat dieselbe Schule durchlaufen wie Vers und kämpft nach denselben Regeln. Genau deshalb trifft ihn ihr Wechsel der Seiten so unvorbereitet.'],
  ],

  'attuma': [
    ['Doppelaxt',
      'Seine zweischneidige Axt schneidet unter Wasser wie an Land und ist gegen Panzerung gedacht. Er führt sie mit beiden Händen und ohne Zögern.'],
    ['Übermenschliche Kraft',
      'Er wirft Menschen durch Schiffswände und reißt Aufbauten aus der Verankerung. Unter Wasser ist er damit kaum aufzuhalten.'],
    ['Leben unter Wasser',
      'Wie alle Talokanil atmet er im Meer und bewegt sich dort schneller als jedes Boot. An der Oberfläche braucht er Wasser, um dieselbe Kraft zu behalten.'],
  ],

  'ayo': [
    ['Speerkampf',
      'Ayo führt den Vibranium-Speer der Dora Milaje aus jeder Lage und weicht dabei kaum vom Fleck. Gegen Bucky Barnes reicht ihr ein Griff, um seinen Arm auseinanderfallen zu lassen.'],
    ['Nahkampf',
      'Ohne Waffe kämpft sie ruhig und ohne Umweg, sie stellt sich Gegnern in den Weg, statt sie zu umgehen. In Wien und Berlin steht sie zwischen ihrem König und allem anderen.'],
    ['Generälin der Dora Milaje',
      'Nach Okoye übernimmt sie die Leibgarde und bildet die Midnight Angels aus. Ihre Treue gilt Wakanda und nicht der Person auf dem Thron, das sagt sie auch, wenn sie gefragt wird.'],
  ],

  'bron-char': [
    ['Körperkraft',
      'Er ist der schwerste Kämpfer der Starforce und räumt Hindernisse aus dem Weg, statt sie zu umgehen. Ein Schlag von ihm hebt einen Menschen von den Füßen.'],
    ['Nahkampf',
      'Er geht gerade auf den Gegner zu und rechnet damit, den ersten Treffer einzustecken. Meistens ist das für ihn der günstigere Tausch.'],
    ['Kree-Ausbildung',
      'Er hat dieselbe Schule wie der Rest der Einheit durchlaufen und hält sich an ihre Ordnung. Von Torfa bis zur Erde folgt er Yon-Rogg ohne Nachfrage.'],
  ],

  'korath-der-verfolger': [
    ['Kybernetische Verstärkung',
      'Sein Körper ist mit Kree-Technik durchsetzt, die Kraft, Ausdauer und Sinne anhebt. Was von außen wie Rüstung aussieht, gehört zu ihm.'],
    ['Übermenschliche Kraft',
      'Er schlägt sich durch Gegner, die ihm körperlich überlegen sein müssten. Auf Morag stellt er sich Peter Quill ohne Deckung entgegen.'],
    ['Spurensuche',
      'Als Verfolger findet er, wer sich verstecken will, und gibt dabei nicht auf. Ronan schickt ihn deshalb hinter dem Orb her, statt eine Flotte zu bemühen.'],
  ],


  'namora': [
    ['Übermenschliche Kraft',
      'Sie hebt und wirft, was für Menschen unbeweglich ist, und kämpft an vorderster Stelle. Ihre Kraft ist unter Wasser noch einmal größer.'],
    ['Speer',
      'Ihre Waffe ist auf Reichweite ausgelegt und sitzt bei jedem Wurf. Sie führt sie auch im Wasser, wo jeder Stoß langsamer wird.'],
    ['Leben unter Wasser',
      'Wie alle Talokanil ist sie im Meer zu Hause und braucht dort weder Luft noch Licht. Auf trockenem Boden verliert sie diesen Vorteil.'],
  ],

  'prinz-yan': [
    ['Prinz von Aladna',
      'Ihm gehört die Herrschaft über eine Welt, auf der jedes Gespräch gesungen wird. Was er zusagt, gilt für den ganzen Planeten.'],
    ['Diplomatie',
      'Seine Ehe mit Carol Danvers ist ein Vertrag zwischen zwei Welten und kein Gefühl. Er behandelt beides mit derselben Ernsthaftigkeit.'],
    ['Gesang',
      'Auf Aladna ist Singen die Sprache, und er beherrscht sie besser als alle anderen. Genau darüber öffnet er den Gästen jede Tür seines Hofes.'],
  ],
  'dimitri-smerdyakov': [
    ['Feldarbeit',
      'Dimitri gehört zu Nick Furys engstem Kreis und übernimmt die Aufgaben, für die es keinen Auftrag auf Papier gibt. Er arbeitet unauffällig und stellt keine Fragen.'],
    ['Fahrer und Beschatter',
      'Er lenkt den Bus einer Schulklasse quer durch Europa und behält dabei jedes Fahrzeug hinter sich im Blick. Dass er dabei für einen Betrug arbeitet, merkt er als Letzter.'],
  ],

  'elder-beast': [
    ['Übermenschliche Kraft',
      'Das Wesen wirft ausgewachsene Zauberer durch die Luft und reißt Steinwände auf. Gegen die Scarlet Witch setzt es diese Kraft nicht ein, sondern kniet nieder.'],
    ['Klauen',
      'Seine Krallen öffnen Panzerung und Fels gleichermaßen. Sie sind die einzige Waffe, die es braucht.'],
    ['Wächter der Darkhold-Burg',
      'Chthon hat es auf den Wundagore gesetzt, um das Buch und den Thron davor zu bewachen. Wer die verheißene Scarlet Witch nicht ist, kommt dort nicht vorbei.'],
  ],

  'franklin-richards': [
    ['Kosmische Kraft',
      'Am Rand eines Neutronensterns geboren, trägt er die Kraft, nach der Galactus greift. Was in ihm steckt, ist größer als alles, was die Fantastic Four zusammen aufbieten.'],
    ['Wiederbelebung',
      'Er holt seine tote Mutter zurück ins Leben, ohne zu wissen, was er tut. Es ist die erste Anwendung seiner Kraft und zugleich die folgenreichste.'],
  ],

  'giganto': [
    ['Riesenwuchs',
      'Das Ungeheuer überragt die Häuser einer ganzen Straße und bewegt sich trotzdem schnell. Für eine Stadt ist allein seine Größe die Katastrophe.'],
    ['Übermenschliche Kraft',
      'Es hebt Fahrzeuge und reißt Fassaden herunter, ohne sich anzustrengen. Die Fantastic Four brauchen alle vier, um es aufzuhalten.'],
  ],

  'harvey-elder-mole-man': [
    ['Herrscher von Subterranea',
      'Ihm gehört ein Reich unter der Erdoberfläche samt Bevölkerung und Bodenschätzen. Er verhandelt darüber am Ende als Staatsoberhaupt und nicht als Angreifer.'],
    ['Bohrmaschinen',
      'Seine Maschinen fressen sich durch Fels und Beton und öffnen Wege dorthin, wo niemand mit ihm rechnet. Die Oberfläche greift er von unten an.'],
    ['Kommando über die Subterraner',
      'Sein Volk folgt ihm ohne Widerspruch und stellt eine Armee, die aus dem Boden kommt. Genau diese Truppe macht ihn später zu einem Verbündeten, den man ernst nimmt.'],
  ],

  'rachel-rozman': [
    ['Gemeindearbeit in der Yancy Street',
      'Sie hält die Synagoge und das Viertel zusammen und kennt jeden, der dort wohnt. Für Ben Grimm ist diese Straße der Ort, an den er immer wieder zurückkommt.'],
  ],

  'eli-bradley': [
    ['Schutz seines Großvaters',
      'Er schirmt Isaiah Bradley in Baltimore gegen jeden Besuch ab, der nichts Gutes bringt. Was in diesem Haus besprochen wird, hört er still mit.'],
  ],

  'flash-thompson': [
    ['Zehnkampfteam der Schule',
      'Er gehört zum Wissenschaftsteam der Midtown School und tritt damit bis nach Washington an. Sein Ehrgeiz dort ist echt, auch wenn sein Ton es nicht vermuten lässt.'],
    ['Livestream-Kanal',
      'Er sendet aus jeder Lage und kommentiert dabei alles, was ihm vor die Kamera kommt. Spider-Man vergöttert er in jeder einzelnen Sendung.'],
  ],

  'kareem-red-dagger': [
    ['Dolchkampf',
      'Sein Dolch stammt aus dem Bestand des Ordens und liegt ihm so sicher in der Hand wie anderen ein Stift. Er wirft ihn ebenso genau, wie er ihn führt.'],
    ['Nahkampf',
      'Er ist über Jahre ausgebildet worden und kämpft schnell, beweglich und ohne Aufsehen. Über die Dächer von Karatschi bewegt er sich schneller als jedes Fahrzeug.'],
    ['Wahrnehmung von Noor-Energie',
      'Er sieht, wo der Schleier zur Noor-Dimension dünn wird, und erkennt daran, wer von der anderen Seite kommt. Genau deshalb findet er Kamala vor allen anderen.'],
  ],

  'karun-patel': [
    ['Kameramann',
      'Er filmt Kingo seit fünfzig Jahren und weiß dabei genau, wann er die Kamera senken muss. Sein Material ist die einzige Aufzeichnung dessen, was die Eternals in dieser Zeit getan haben.'],
    ['Assistent von Kingo',
      'Er organisiert Termine, Garderobe und Ausreden und hält den Betrieb um einen unsterblichen Filmstar am Laufen. Bei der ersten Begegnung hat er ihn für einen Vampir gehalten.'],
  ],

  'liz-allan': [
    ['Kapitänin des Zehnkampfteams',
      'Sie führt das Wissenschaftsteam der Midtown School und bringt es bis in den nationalen Wettbewerb. Ihr Ton ist freundlich und ihr Anspruch trotzdem hoch.'],
  ],

  'miek': [
    ['Klingenarme',
      'An ihrem Exoskelett sitzen Klingen, mit denen sie in der Arena und im Aufstand kämpft. Sie führt sie schneller, als ihre Größe vermuten lässt.'],
    ['Robotisches Exoskelett',
      'Der Anzug gleicht aus, was ihrem Körper an Kraft fehlt, und macht sie überhaupt erst kampffähig. Ohne ihn ist sie ein kleines Wesen unter lauter großen.'],
  ],

  'pagon': [
    ['Gestaltwandel',
      'Er nimmt jede Gestalt an, die die Unterwanderung gerade verlangt, und hält sie über Wochen durch. In dieser Rolle bewegt er sich durch Behörden mehrerer Länder.'],
    ['Aufklärung',
      'Er beschafft Pläne, Zeiten und Namen und baut daraus die Vorbereitung jedes Anschlags. Ohne seine Arbeit hätte Graviks Plan keinen einzigen Ansatzpunkt.'],
    ['Stellvertreter Graviks',
      'Er führt die Zelle, wenn sein Anführer nicht da ist, und ist der Einzige, der ihm widerspricht. Genau das kostet ihn vor versammelter Mannschaft das Leben.'],
  ],

  'pip-der-troll': [
    ['Teleportation',
      'Der Laxidazianer versetzt sich und andere über weite Strecken und kommt so überallhin, wo Eros gerade auftritt. Ankündigen tut er das nie.'],
    ['Laxidazianische Physiologie',
      'Sein Volk ist zäher, als seine Erscheinung vermuten lässt, und altert langsam. Er hält deshalb an der Seite eines Eternals ohne Weiteres mit.'],
  ],

  'tanngrisnir-und-tanngnjostr': [
    ['Zugtiere für Thors Boot',
      'Die beiden Böcke ziehen das Schiff aus Indigarr durch den Weltraum und brauchen dafür keinen Antrieb. Sie sind Thors einziges Fortbewegungsmittel, seit Stormbreaker das Reisen allein nicht mehr abdeckt.'],
    ['Lauf durch die Luft',
      'Sie galoppieren durch das Vakuum, als läge unter ihnen fester Boden. Sie halten dabei jedes Tempo, das der Wagen dahinter aushält.'],
    ['Ohrenbetäubendes Schreien',
      'Ihr Geschrei ist so laut, dass die halbe Mannschaft die Hände an die Ohren legt. Sie hören damit auch dann nicht auf, wenn es ungünstig ist.'],
  ],
  'taweret': [
    ['Göttin der Frauen und Kinder',
      'Sie gehört zur Ennead und ist für die zuständig, die sich selbst nicht schützen können. Ihre Freundlichkeit ist keine Rolle, sondern ihr Wesen.'],
    ['Geleit durch die Duat',
      'Sie führt die Toten auf ihrem Schiff durch das Totenreich zum Feld der Binsen. Marc Spector und Steven Grant reisen bei ihr gemeinsam.'],
    ['Wägung des Herzens',
      'Auf ihrer Waage wird abgemessen, ob eine Seele ausgeglichen ist, und daran hängt alles Weitere. Bei einem geteilten Kopf gerät die Waage zum ersten Mal aus dem Gleichgewicht.'],
  ],

  'varra-priscilla-davis': [
    ['Gestaltwandel',
      'Sie trägt die Gestalt einer sterbenden Frau seit Jahrzehnten und hat sie nie abgelegt. Nick Fury weiß davon, alle anderen nicht.'],
    ['Nachrichtenbeschaffung',
      'Sie sitzt an der Schnittstelle zwischen dem Skrull-Widerstand und S.H.I.E.L.D. und gibt weiter, was beide Seiten brauchen. Diese Rolle hält sie länger durch als jede andere Figur der Geschichte.'],
  ],

  'georges-batroc': [
    ['Savate',
      'Er kämpft mit dem französischen Fußboxen und trifft aus Winkeln, mit denen niemand rechnet. Gegen Steve Rogers hält er sich damit auf einem fahrenden Schiff.'],
    ['Nahkampf',
      'Er verbindet Tritte mit Griffen und Messern und wechselt mitten in der Bewegung. Was ihm Spaß macht, ist der Kampf selbst und nicht die Bezahlung.'],
    ['Söldnerhandwerk',
      'Er nimmt Aufträge von jedem, der zahlt, und liefert zuverlässig. Die Lemurian Star kapert er für Nick Fury, ohne zu wissen, dass er Teil eines größeren Plans ist.'],
  ],

  'immortus': [
    ['Zeitreisetechnik',
      'Er bewegt sich frei durch den Zeitstrom und beobachtet von dort, was sich in den Zweigen tut. Seine Ausrüstung ist die fortgeschrittenste, die der Rat zu bieten hat.'],
    ['Führung des Rats der Kangs',
      'Als eine der letzten abweichenden Fassungen sitzt er an der Spitze der Versammlung. Was dort beschlossen wird, geht auf seine Stimme zurück.'],
  ],

  'mel': [
    ['Assistenz der Direktorin',
      'Sie hält Valentina Allegra de Fontaine den Kalender, die Akten und die Ausreden zusammen. Was sie dabei mitbekommt, reicht aus, um ihre Chefin zu stürzen.'],
  ],

  'mr-charles': [
    ['Logistik',
      'Er organisiert Transporte, Zwischenlager und Papiere für Ware, die es nicht geben darf. Sein Netz reicht von der CIA bis in Fisks Hafenbetriebe.'],
    ['Waffenschmuggel',
      'Er beliefert Kingpin und andere und weiß bei jeder Lieferung, wo sie herkommt. Nach dem Bruch hilft ausgerechnet dieses Wissen dabei, ihn zur Strecke zu bringen.'],
    ['Anwerbung von Verstärkten',
      'Er sucht Menschen mit Kräften und bringt sie in Programme, über die nichts geschrieben wird. Für Valentina Allegra de Fontaine ist er dabei die ausführende Hand.'],
  ],

  'scarlet-centurion': [
    ['Zeitreisetechnik',
      'Er reist durch Epochen und Galaxien und führt dabei ein Reich, das beides umspannt. Seine Rüstung stammt aus derselben Werkstatt wie die der übrigen Varianten.'],
    ['Mitvorsitz im Rat der Kangs',
      'Er sitzt neben Immortus an der Spitze der Versammlung und spricht für einen großen Teil der Varianten. Der Ruf nach den übrigen Kangs geht auch von ihm aus.'],
  ],

  'tyler-hayward': [
    ['Kommissarischer Direktor von S.W.O.R.D.',
      'Nach dem Snap übernimmt er die Behörde und richtet sie auf Waffen mit eigenem Willen aus. Für Wanda Maximoff und ihre Familie stellt er dafür einen Tötungsbefehl aus.'],
  ],

  'leila-taylor': [
    ['Leitung des Personenschutzes',
      'Sie führt den Schutz von Präsident Thaddeus Ross und kennt jede Schwachstelle seines Terminplans. Vor jedem seiner Alleingänge warnt sie ihn und bleibt trotzdem an seiner Seite.'],
  ],

  'curtis-hoyle': [
    ['Sanitäter',
      'Er hat im Dienst Leben gerettet und dabei ein Bein verloren und versorgt bis heute jede Wunde, die vor ihm liegt. Frank Castle bringt seine Verletzungen zu ihm und nicht in eine Klinik.'],
    ['Gesprächsleitung für Veteranen',
      'Er führt eine Runde für Heimkehrer und hält sie zusammen, auch wenn dort niemand reden will. Für Castle ist er der einzige Mensch, der ihn nicht als Waffe sieht.'],
  ],

  'ma-gnucci': [
    ['Führung der Familie',
      'Sie hat die Familie Gnucci an Bennys Seite geführt und hält sie zusammen, auch als er sie betrügt und einer ihrer Söhne vor Gericht steht. Loyalität nach innen ist bei ihr keine Frage der Schuld.'],
    ['Das Kopfgeld',
      'Ein Anruf genügt, und jeder Kriminelle von Little Sicily steht um 18:47 Uhr in Frank Castles Treppenhaus. Ihr Netz reicht weiter als jede Waffe, die sie selbst führen könnte.'],
    ['Menschenkenntnis',
      'Sie spricht Castle an, ohne sich zu nennen, und erzählt ihm ihre Geschichte so, dass er sich selbst darin erkennt. Ihr Satz über die Einsamkeit trifft ihn härter als das Kopfgeld.'],
  ],

  'franklin-nelson-foggy': [
    ['Anwaltskanzlei',
      'Er hat Nelson und Murdock mitgegründet und hält den Laden zusammen, wenn sein Partner nachts anderswo ist. Die Mandanten kommen wegen ihm wieder.'],
    ['Prozessführung',
      'Vor Gericht arbeitet er gründlich, vorbereitet und ohne Effekthascherei. Was er nicht beweisen kann, sagt er auch nicht.'],
  ],

  'heather-glenn': [
    ['Psychotherapie',
      'Sie behandelt Menschen, die niemandem sonst etwas erzählen würden, das Ehepaar Fisk eingeschlossen. Ihre Fragen treffen genauer, als ihren Patienten lieb ist.'],
    ['Kommissarin für psychische Gesundheit',
      'Unter Bürgermeister Fisk bekommt sie ein Amt und damit Einfluss auf die Stadtpolitik. Nach dem Überfall durch Muse richtet sie es gegen jede Form von Selbstjustiz.'],
  ],

  'luke-cage': [
    ['Übermenschliche Kraft',
      'Er hebt Fahrzeuge an und schlägt durch Wände, ohne dafür anzusetzen. Das Gefängnisexperiment, das ihn dazu gemacht hat, war nicht dafür gedacht.'],
    ['Undurchdringliche Haut',
      'Kugeln prallen an ihm ab, Klingen brechen. Was ihn verwundbar macht, liegt nicht auf der Haut.'],
  ],

  'yusuf-khan': [
    ['Der Name Ms. Marvel',
      'Er erklärt seiner Tochter, dass Kamala Wunder bedeutet, und gibt ihr damit den Namen, unter dem sie bekannt wird. Kräfte hat er keine, und ohne diesen Satz gäbe es Ms. Marvel trotzdem nicht.'],
  ],
};
