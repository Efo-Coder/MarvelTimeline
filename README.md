# MCU Timeline – Fanpage

1. Tastenkombination: Strg+Umschalt+B

Die Aufgabe ist jetzt als Standard-Buildaufgabe eingetragen, das ist der kürzeste Weg. Ein Druck, die Server laufen.

2. Über die Befehlspalette

Strg+Umschalt+P, dann Tasks: Run Task, dann „Server: Fanpage und Bild-Studio“ auswählen. Derselbe Effekt, nur mit Auswahlliste.

3. Im Terminal

Falls VS Code gar nicht mitspielt, ist der Befehl selbst nichts Besonderes:


node start.js --beobachten --kein-browser

Inoffizielle Fanpage: Alle Kinofilme und Disney+-Realserien des Marvel
Cinematic Universe als horizontale Timeline, aufgeteilt in die offiziellen
Phasen 1–7. Innerhalb jeder Phase ist alles **chronologisch nach der
Handlung** sortiert (Story-Reihenfolge, angelehnt an Marvels offizielle
Timeline-Reihenfolge), nicht nach Kinostart – vor einem animierten
Galaxie-Hintergrund, dessen Farben sich pro Phase ändern. Serien tragen
ein „Serie“-Badge unter dem Zeitstrahl.

Dazu gibt es zwei weitere Seiten. [characters.html](characters.html) zeigt
alle Figuren als Raster, mit Suche über Namen, Rollen und Besetzung, Filter
nach Phase, Welt und Titel und Sortierung nach A bis Z, Z bis A, Zahl der
Auftritte oder erstem Auftritt. Im Filter lassen sich mehrere Phasen,
mehrere Welten und mehrere Titel zugleich anhaken, gelesen werden sie als
Oder: Phase 1 und Phase 3 angehakt zeigt die Figuren aus beiden, Erde-838
und Erde-617 die Figuren aus beiden Wirklichkeiten. Die Reihe der Welten
entsteht aus `CHAR_WORLDS` (js/chars.js) und zeigt nur, wo auch wirklich
jemand steht. Wer keine Welt im Namen trägt, zählt zu `CHAR_HOME_WORLD`,
also zu Erde-616: In der Hauptwirklichkeit muss niemand dazusagen, wo er
ist. „Alle Phasen“, „Alle Welten“ und „Alle Filme“ nehmen die Wahl ihrer
Reihe wieder zurück. Die Sortierung ist
dagegen eine Wahl unter vieren, deshalb steht in der Zeile nur die
gewählte: als roter Schalter, hinter dem die übrigen aufklappen.

Sie ist als einzige Seite **hell** und nach
[marvel.com/characters](https://www.marvel.com/characters) gebaut: weißer
Grund, eckige Flächen ohne Rundung und Marvel-Rot (`#e62429`) als einziger
Akzent. Phasenfarben und Galaxie gibt es dort nicht, die Phase ist nur noch
ein Filter. Jede Karte zeigt oben das Porträt und darunter einen dunklen
Block mit dem Heldennamen groß und dem bürgerlichen klein darunter; beim
Zeigen läuft der Block von seinem roten Balken aus voll und das Bild zoomt
leicht. Freigeschaltet wird das über `class="chars-page"` am `<html>`, weil
sich Regeln wie `.char-film` die Seite mit dem Film-Modal der Timeline
teilen, das dunkel bleibt.

Ein Klick auf eine Figur öffnet ihre Vollansicht im Zuschnitt der
Charakterseiten auf marvel.com: oben eine schwarze Bühne über die volle
Breite mit dem groß aufgezogenen Porträt rechts, Namen und
Kurzbeschreibung links und einer schrägen roten Unterkante, auf der die
weißen Reiter **Übersicht** und **Biografie** sitzen. Darunter geht es
wie auf der Vorlage weiß weiter: Die Übersicht gliedert sich in drei
Abschnitte — das **Profil** mit der Erscheinungsbühne,
**N Auftritte** mit der Liste in Handlungsreihenfolge und
**Connections** am Fuß; hinter dem zweiten Reiter liegt die
ausführliche Biografie in benannten Abschnitten. Jeder Auftritt führt
zurück auf die Timeline, die den Titel direkt aufschlägt.

[films.html](films.html) zeigt jeden Film und jede Serie als Plakat, in
Reihen mit Überschrift, die zur Seite rollen; ein Klick öffnet Stab,
Besetzung und Handlung. Der Header verlinkt alle drei Seiten.

Das **Profil** trägt oben eine dunkle Leiste, nachgebaut nach der
Heldenansicht aus Marvel Rivals: links ihr Name in fetter Kursiver,
daneben drei Einträge, die dieselbe Figur von drei Seiten zeigen. Der
offene steht golden mit einem Balken darunter, und die Wahl bleibt beim
Blättern zur nächsten Figur stehen.

| Eintrag | Was darunter steht |
| --- | --- |
| **Aussehen** | die Erscheinungsbühne mit der Fassungswahl |
| **Fähigkeiten** | jede Kraft einzeln, mit Nummer, Namen und Absatz |
| **Daten** | Herkunft, Spezies, Größe, Status, Zugehörigkeit, erster Auftritt, Auftritte, Phasen und Besetzung |

Die Tafel **Fähigkeiten** ist dem Band „Powers + Abilities“ auf den
Charakterseiten von marvel.com nachgebaut und der eine dunkle Kasten in
einer sonst hellen Ansicht: links die Nummer der Fähigkeit über ihrem
Namen und ihrem Absatz, rechts die Figur hinter einer schrägen Kante,
unten auf weißem Grund die Reihe, die zwischen den Fähigkeiten
umschaltet. Die Texte stehen in `CHAR_POWERS`
([js/powers.js](js/powers.js)), und dort hat jede Figur einen Eintrag.
Die Namen sind die Bezeichnungen von marvel.com, ins Deutsche
übersetzt: Dieselbe Kraft heißt bei jeder Figur gleich, damit zwei
Profile nebeneinander vergleichbar bleiben. Das Glossar dazu steht im
Kopf der Datei.

Die Tafel **Daten** ist das Blatt mit den Angaben zur Figur, die keine
Erzählung sind. Sie hat den Steckbrief abgelöst, der früher neben den
Auftritten stand, und führt neben den Angaben aus den Wikis auch, was
diese Seite selbst über eine Figur weiß: wie oft sie vorkommt, wo sie
anfängt und in welchen Phasen sie steht. Die Kräfte stehen dort nicht
mehr, sie haben nebenan ihre eigene Tafel.

Die **Connections** sind der gleichnamige Abschnitt der Vorlage: eine
Reihe hochkant stehender Karten mit Bild, rotem Balken und dunklem
Namensblock, die zur genannten Figur führen. Sie führen die wichtigsten
Verbindungen auf und nicht mehr jeden, mit dem eine Figur je eine
Leinwand geteilt hat. Vorn stehen die benannten Beziehungen aus
`CHAR_BONDS` ([js/facts.js](js/facts.js)) und tragen ihre Bezeichnung
mit auf die Karte („Vater“, „Erzfeind“); dahinter füllt
`CHAR_CONNECTIONS` ([js/connections.js](js/connections.js)) auf, die von
den Charakterseiten auf marvel.com geholte und auf unsere Schlüssel
übersetzte Auswahl. Wer beides nicht hat, bekommt den Abschnitt gar
nicht; das betrifft nur noch Figuren mit einem einzigen Auftritt.

Die **Erscheinungsbühne** ist der Heldenansicht aus Marvel Rivals
nachgebaut, übersetzt auf den weißen Grund dieser Seite: links die
Fassungswahl mit der Zahl der gezeigten Fassung darüber, in der Mitte das
Ganzkörperbild vor einem blassen Wappen, rechts oben das Logo des Films,
darunter der Name der Fassung, wovon der Film handelt und in welchem Jahr
er erschien, ganz unten der Knopf, der auf der Timeline zu ihm führt.

Wie groß eine Figur darin steht, sagt `FULLSIZE_SCALE` mal `FULLSIZE_FIT`
(siehe `fullsizeScale` in `js/chars.js`), und wie groß das ist, hängt an
der Bühne und nicht am Fenster. Die Höhe der Bühne steht als `--stage-h`
fest, ihre Breite dagegen nicht: Die mittlere Spalte bekommt, was
Fassungswahl und Filmspalte übrig lassen, auf einem breiten Fenster über
1300 Pixel und auf einem schmalen keine 400. Eine weit ausgebreitete Pose
hing früher daran und verlor beim Verkleinern des Fensters bis zu einem
Drittel ihrer Größe, während die Figur daneben stehen blieb. Deshalb gilt
in der Breite nicht die Spalte, sondern `--frame-ratio` mal die Höhe der
Bühne, derzeit 1.1. Elf der rund 720 Dateien sind breiter als dieses Maß
und stehen dadurch etwas kleiner im Rahmen, dafür stehen alle bei jeder
Fensterbreite gleich groß. Reicht die Spalte für dieses Maß nicht, darf
die Figur um `--frame-bleed` in die Fugen neben ihr laufen, aber keinen
Schritt weiter. Dieselbe Zahl steht als `RAHMEN_SEITEN` im Bild-Studio,
dessen Vorschau denselben Rahmen zeigt.

Trägt eine Datei unter der Figur leere Fläche, weil sie fliegt, steht
ihr Anteil als `FULLSIZE_LIFT` daneben. Der Rahmen misst die Datei und
nicht die Figur darin, ohne diese Zahl stünde eine schwebende Figur also
kleiner da als eine stehende derselben Größe. Mit ihr rechnet die Seite
die Datei wieder groß, bis die Figur ihr Maß hat, und über die Oberkante
des Rahmens geht sie dabei nicht hinaus. Gepflegt wird auch diese Zahl
nicht von Hand: Das Bildstudio misst sie beim Speichern ab.

Dazu gehört, dass die Bühne schon bei 1250 Pixeln zweispaltig wird und
nicht erst bei 1100: Dreispaltig blieben der Figur darunter keine 400
Pixel, zweispaltig sind es mehr als doppelt so viele. Von 860 Pixeln
aufwärts steht damit jede Figur bei jeder Fensterbreite gleich groß. Nur
zwischen 1250 und 1360 reicht die dreispaltige Mitte für die elf
breitesten Dateien noch nicht ganz, dort stehen sie bis zu einem Achtel
kleiner. Höher gelegt ist die Grenze nicht, weil die Bühne zweispaltig
eine zweite Zeile für den Film bekommt und damit höher wird als
`--panel-h`, worauf die Tafeln *Fähigkeiten* und *Daten* rechnen.

Die **Fassungswahl** steht wie in der Vorlage als Trapez im Bild: zwei
Tafeln nebeneinander, zwei Zeilen hoch, nach unten hin nach links
geneigt. Sie steht bei jeder Figur, auch bei einer, die nur ihr eines
Bild hat: Wer weniger als vier Fassungen mitbringt, füllt das Raster mit
halbdurchsichtigen leeren Feldern auf. Geneigt wird mit `skewX`, weil dort allein die senkrechten
Kanten schräg stehen und die Oberkanten der Tafeln waagerecht bleiben;
der Inhalt jeder Tafel wird gegengeneigt, damit Bild und Filmlogo gerade
bleiben. Jede Tafel zeigt ihre eigene Fassung als Ausschnitt und trägt
das Logo ihres Films, unter dem Zeiger blendet ihr Name darüber ein. Wer
mehr als vier Fassungen mitbringt, bekommt rechts daneben eine eigene
schräge Rollleiste aus Gleis und Griff — die des Browsers stünde als
gerader Balken quer zur Neigung. Alle Maße hängen an `--look-w` an
`.char-stage`; auch die Breite der linken Spalte rechnet sich daraus,
sonst drückte sie sich bei Figuren mit Fassungen selbst breiter und die
Figur spränge beim Blättern hin und her.

Von mancher Fassung gibt es mehr als ein brauchbares Bild: dieselbe
Rüstung in einer anderen Haltung, von der anderen Seite, mit und ohne
Helm. Das sind keine eigenen Fassungen – Beschriftung, Film und
Beschreibung wären bei jeder gleich, und in der Wahl stünden zwei Tafeln
nebeneinander, die dasselbe Ding meinen. Sie stehen deshalb als
**Varianten** hinter einer einzigen Fassung, und umgeschaltet wird oben
an der Profilleiste: Gleich hinter ihrem schrägen Ende hängt eine Reihe
kleiner Tafeln mit den Ziffern 1, 2, 3, in derselben Neigung und in
derselben Zeile. Die gewählte steht weiß auf Marvel-Rot, die übrigen
grau – umgekehrt zu den Reitern daneben, damit klar bleibt, dass hier
nicht die Tafel gewechselt wird, sondern das Bild darauf. Hat die
gezeigte Fassung nur ihr eines Bild, oder steht statt der Bühne die Tafel
*Fähigkeiten* oder *Daten* offen, bleibt die Reihe weg.

Gemerkt wird die Wahl pro Fassung: Wer zwischen zwei Fassungen hin und
her springt, findet jede so wieder, wie er sie verlassen hat. Die Tafel
in der Fassungswahl zieht dabei mit, sonst stünde auf ihr eine andere
Aufnahme als groß daneben. Fehlt die Datei einer Variante – eine frisch
angelegte hat noch keine –, tritt der Buchstabenersatz an ihre Stelle,
und die nächste Ziffer holt das Bild zurück.

Gepflegt wird das im Bild-Studio unter *Ganzkörper*, siehe **Variante +**,
**Variante −**, **Zur Variante …** und **Zur Fassung …** weiter unten.
Auch die Reihenfolge der Varianten lässt sich dort ändern, und ob ein
Bild eine eigene Fassung ist oder nur eine Aufnahme einer anderen, muss
nicht beim Anlegen feststehen. In `js/chars.js` steht davon nur die
Anzahl (`FULLSIZE_VARIANTS`), die Dateinamen folgen ihr: Aus der Fassung
`emil-blonsky-abomination-green` mit drei Varianten werden
`emil-blonsky-abomination-green-1`, `-2` und `-3`. Die Fassung selbst
liegt dann unter keinem Dateinamen mehr, sie ist nur noch der Stamm, und
`FULLSIZE_LOOKS` nennt genau ihn. Was zusammengehört, sagt dabei allein
die Anzahl, auch bei Fassungen, die gar nicht in `FULLSIZE_LOOKS` stehen
und nur als Datei im Ordner liegen.

Aufgeschlagen wird sie als Bewegung aus zwei Bändern, die über der noch
sichtbaren Rasterseite hereinfahren und sich davor zusammenfügen: die
schwarze Bühne von rechts, die weißen Tafeln darunter von links. Beide
tragen ihre Farbe selbst, einen weißen Grund gibt es während der Fahrt
nicht.

Gefahren wird dabei entlang der schrägen Trennlinie zwischen beiden und
nicht waagerecht. Das ist nicht nur Optik: Verschiebt man eine Gerade in
ihrer eigenen Richtung, liegt sie danach wieder auf sich selbst, und
deshalb bleiben die schräge Unterkante der Bühne und die schräge Oberkante
der Tafeln über die ganze Fahrt auf derselben Linie. Die Naht geht kein
Bild lang auf, die beiden Teile greifen ineinander wie ein Puzzle. Die
Gegenform der Tafeln entsteht aus `clip-path`, beide rechnen mit denselben
Werten `--cut-left` und `--cut-right` an `.char-full`.

Die Kurve (`--snap-in`) ist eine `linear()`-Kurve mit Stützstellen: ein
harter Schub auf zwei Drittel des Weges, ein Halt von gut einem Bild, dann
der Rest. Zugemacht wird andersherum und schneller. Bei reduzierter
Bewegung steht beides sofort an seinem Platz.

Gescrollt wird mit [Lenis](https://github.com/darkroomengineering/lenis)
(Smooth Scroll, lokal eingebunden unter `js/vendor/lenis.min.js`, MIT-Lizenz).
Die Seite scrollt normal vertikal; nur wenn man mit dem Mausrad direkt über
einer Zeitskala scrollt, schiebt sich diese Timeline horizontal weiter
(auf Touch-Geräten per Wischen). Ist sie am Anfang/Ende angekommen,
scrollt die Seite normal weiter.

Der Einstieg ist eine gepinnte Hero-Sequenz: Die Startsektion bleibt beim
Scrollen zunächst am oberen Rand stehen und zeigt nacheinander den Titel,
den Fan-Timeline-Hinweis und die Kurzbeschreibung. Jede Stufe blendet
scroll-gekoppelt ein und aus, Zurückscrollen spielt alles rückwärts. Erst
danach löst sich der Hero und es geht zu den Phasen weiter. Bei
reduzierter Bewegung (Systemeinstellung) entfällt die Sequenz und alle
Texte stehen statisch untereinander.

## Filme & Serien (films.html)

Die dritte Seite zeigt jeden Titel als Plakat, angeordnet in Reihen mit
Überschrift, die zur Seite rollen — gebaut wie das Band **Connections** am
Fuß einer Figur und wie die Reihen auf Disney+. Sie steht auf demselben
hellen Grund wie die Charakterseite und trägt dafür dieselbe Klasse
`chars-page` am `<html>`, dazu `films-page` für das, was nur hier gilt.
Ihr Kopfband trägt ein eigenes Bild: den MARVEL-Schriftzug mit Figuren in
den Buchstaben (`assets/theme/marvel-cinematic-bg.webp`).

Die Reihen entstehen in [js/films.js](js/films.js) aus `PHASES`, eine neue
Phase in `data.js` bringt also von selbst ihre eigene Reihe mit:

| Reihe | Was darin steht |
| --- | --- |
| **Bald zu sehen** | angekündigt, aber noch nicht erschienen — steht ganz oben |
| **Empfohlen** | eine Handauswahl, die Liste `FEATURED` in `js/films.js` |
| **In chronologischer Reihenfolge** | alle Titel in der Reihenfolge ihrer Handlung |
| **Nach Kinostart** | dieselben Titel in der Reihenfolge ihres Erscheinens |
| **Alle Serien** | was als Staffel läuft statt im Kino |
| **Phase One** … **Phase Seven** | je eine Reihe, in Handlungsreihenfolge |

Ein Titel darf in mehreren Reihen stehen, das ist der Sinn der Sache. Und
jede Staffel bekommt ihre **eigene** Kachel: Loki und Daredevil stehen in
`data.js` je Staffel als eigener Eintrag, und dabei bleibt es hier. Anders
ließe sich eine angekündigte Staffel gar nicht zeigen, denn
Daredevil: Born Again läuft seit 2025 und **Bald zu sehen** meint trotzdem
allein Staffel 3. Auf der Kachel steht der Titel ohne Staffelzusatz, und
die Gattungszeile darunter sagt statt „Serie“ dann „Staffel 3“. Was die
Staffeln eint, ist der gemeinsame Slug: An ihm hängen Plakat, Logo und die
Schalter im Fenster.

Am Fuß jeder Kachel stehen vier Angaben, durch Punkte getrennt:
Erscheinungsjahr, Laufzeit (bei einer Serie die Folgenzahl), die
Bewertung auf IMDb mit einem goldenen Stern davor und die Altersfreigabe
in einem dünnen Rahmen. Weil das zusammen gut doppelt so breit ist wie
eine Kachel, stehen sie in zwei Zeilen: oben, was der Titel ist, unten,
wie er angekommen ist. Ein angekündigter Titel hat weder Laufzeit noch
Bewertung und zeigt nur „ab 14. Okt. 2026“.

Der Stern kommt wie die Zeichen im Bild-Studio aus `react-icons`, aus dem
Satz Lucide darin (`LuStar`), und steht in `js/films.js` als reine
Pfaddaten — die Seite hat keinen Bauschritt. Anders als im Studio ist er
gefüllt statt gestrichelt und behält sein Gold, auch wenn der rote Balken
beim Zeigen unter ihm durchläuft.

### Das Fenster zu einem Titel

Ein Klick auf eine Kachel öffnet es über der Seite, im Zuschnitt einer
Titelseite auf Disney+: links das Plakat, rechts Titel, Angaben,
Kurzfassung der Handlung und darunter Regie, Drehbuch, Produktion und
Besetzung. Bei einer Serie mit mehreren Staffeln stehen unter dem Titel
Schalter, die zwischen ihnen umschalten.

Die Bewegung ist bewusst eine andere als die der Charakterseite: Dort
fahren zwei Bänder von beiden Seiten herein, was zur zweigeteilten Bühne
dort gehört. Hier blendet eine einzige Fläche auf.

Das Fenster ist so groß, dass niemand darin rollen muss. Das Plakat nimmt
die Höhe, die das Browserfenster hergibt (gedeckelt bei 41 rem), aus ihr
folgt über das Format 2:3 seine Breite, und was danach übrig bleibt,
gehört dem Text: je breiter, desto weniger Zeilen. Nachgemessen ist es für
1280 × 720 aufwärts, dort steht jeder der 58 Titel ganz da. In einem
schmalen Fenster kehrt sich das Verhältnis um – unter 1250 px richtet sich
das Plakat nach dem Text und wird oben und unten beschnitten, statt ihm
die Höhe vorzugeben.

Die Rollleiste der Seite verschwindet, solange das Fenster offen steht,
und kommt erst zurück, wenn es ganz ausgeblendet ist: Gäbe man sie sofort
frei, würde das feste Fenster mitten im Ausblenden um ihre Breite schmaler
und die Tafel darin spränge nach links. `films.html#<slug>` öffnet einen
Titel direkt.

Die Handlung im Einzelnen bleibt auf der Timeline.

### Cover

Die Plakate liegen als `assets/covers/<slug>.webp`, im selben Slug wie die
Logos. Fehlt eines, zeigt die Kachel das Filmlogo aus `assets/logos/` auf
dunklem Grund — das ist kein Fehler, sondern der vorgesehene Ersatz.

Neue Plakate kommen über ein kleines Werkzeug herein. Es verkleinert auf
500 Pixel Breite und speichert als WebP; die Zuordnung von Slug zu
Dateiname steht als Tabelle `TITLES` oben in der Datei:

```
python tools/covers/import-covers.py
python tools/covers/import-covers.py --source "D:/woanders" --force
```

Ohne `--force` bleibt liegen, was schon abgelegt ist.

### Stab, Bewertung und Freigabe

Regie, Drehbuch, Produktion, Genre, Bewertung und Altersfreigabe stehen
nicht in `data.js` — das beschreibt, was in einem Titel passiert, nicht,
wer ihn gemacht hat und wie er angekommen ist. Sie liegen daneben in
[js/credits.js](js/credits.js), als `FILM_CREDITS`, mit dem **Titel** als
Schlüssel (nicht dem Slug: Loki und Daredevil teilen sich einen Slug,
haben aber je Staffel eine eigene Regie).

Alle Felder sind freiwillig, was fehlt, lässt das Fenster weg. Offen sind
zurzeit die Altersfreigaben der meisten Serien und die Regie der Titel,
die noch nicht gelaufen sind. Die Besetzung steht **nicht** in dieser
Datei: Sie ergibt sich aus den Figuren des Titels und `ACTORS` in
`data.js` und ist auf zwanzig Namen gekürzt, danach steht „und weitere“.

Die Bewertungen im Feld `imdb` stammen aus dem offiziellen Datensatz von
IMDb, `title.ratings.tsv.gz` unter <https://datasets.imdbws.com/>. Er
enthält zu jeder Kennung den Durchschnitt und die Zahl der Stimmen und
wird täglich neu gelegt; die Zahlen in der Datei sind also ein Stand und
kein Abruf. Wer sie auffrischt, holt den Datensatz erneut und schreibt
die Zeilen neu. Eine Serie hat auf IMDb **eine** Bewertung für alle
Staffeln zusammen, ihre Staffeln tragen deshalb dieselbe Zahl. Was noch
nicht gelaufen ist, hat keine — bei den drei angekündigten Titeln fehlt
das Feld.

## Starten

Einfach `index.html` im Browser öffnen – es wird kein Server und kein
Build-Tool benötigt. Die beiden anderen Seiten liegen daneben als
`films.html` und `characters.html`, verlinkt sind sie im Header.

Ihr Kopfband trägt das Comic-Plakat
(`assets/theme/marvel-comic-bg.webp`) als Hintergrund, mit einem fast
deckenden Schleier davor: Der Titel steht damit auf ruhigem Grund, und vom
Plakat bleibt nur so viel, dass man es als Bild erkennt.

### Schriften

Die Seite folgt dem Aufbau des Marvel-Studios-Schriftzugs und arbeitet
mit mehreren Ebenen, gesetzt als CSS-Variablen in [css/style.css](css/style.css):

| Variable | Schrift | Wo |
| --- | --- | --- |
| `--font-impact` | BentonSans Comp Black | Die Schrift des fetten „MARVEL": Hero-Überschrift, Titel der Charakterseite, Name in der Figurenansicht, Ersatz für ein fehlendes Filmlogo, Monogramm ohne Porträt |
| `--font-subhead` | URW DIN Condensed Bold | Dieselbe Breite eine Stufe leichter, für Zwischenüberschriften unter einer `--font-impact`-Überschrift: „10 Auftritte" und „Connections" in der Übersicht |
| `--font-brand` | Dharma Gothic E | Die Schrift des gesperrten „STUDIOS": „Timeline" im Header, Hero-Zeilen darunter, Saga-Zeile, Phasenband, die Zeilen über und unter „Charaktere" |
| `--font-display` | Bebas Neue | Die Bedienoberfläche: Navigation, Chips, Datumsangaben, Infoboxen, Beschriftungen |
| `--font-body` | URW DIN Regular | Fließtext, dieselbe Schrift, mit der marvel.com seine Zeilen setzt |

Bis auf Bebas Neue liegen alle lokal unter `assets/fonts`; nur Bebas Neue
kommt von Google Fonts, ohne Internet greift dort ein System-Fallback.
Die beiden URW-DIN-Schnitte stammen vom CDN von marvel.com, das sie für
seine eigenen Seiten ausliefert.

Alle vier lokalen Schriften bringen nur einen Schnitt mit und haben echte
Kleinbuchstaben. Wer sie an einer neuen Stelle einsetzt, setzt deshalb
`text-transform: uppercase` dazu, wo Versalien gemeint sind. Bebas Neue
hat gar keine Kleinbuchstaben und brauchte die Angabe nie.

Bei den drei Überschriftenschriften bewirkt `font-weight` deshalb nichts:
Ihre `@font-face`-Regeln binden die eine Datei für `100 900` ein, damit
jede Angabe auf ihr landet, statt dass der Browser sich einen Schnitt
dazurechnet. Wer es leichter braucht, wechselt die Variable, nicht das
Gewicht — dafür steht `--font-subhead` neben `--font-impact`.

URW DIN ist die Ausnahme und auf `400` festgelegt. Fließtext braucht auch
ein Fett, und von der Schrift gibt es keins; mit der engen Angabe rechnet
der Browser es sich selbst dazu. Mit `100 900` bekäme jedes fett gesetzte
Wort wieder den normalen Schnitt und wäre von seiner Umgebung nicht mehr
zu unterscheiden.

Wer beides zusammen braucht, Seite und Bild-Studio, startet
[start.cmd](start.cmd) per Doppelklick oder im Terminal:

```
node start.js
```

Das bedient die Fanpage unter [http://127.0.0.1:4320](http://127.0.0.1:4320)
und startet das Bild-Studio unter
[http://127.0.0.1:4321](http://127.0.0.1:4321) gleich mit; beide Adressen
gehen im Browser auf. Die Ausgabe des Studios steht eingerückt in
derselben Konsole, Strg+C beendet beide. Die Ports lassen sich mit
`--port` und `--studio-port` verschieben, `--kein-browser` lässt den
Browser zu, `--ohne-studio` startet nur die Seite.

### Änderungen ohne F5

Über den Server sieht die Seite ihren eigenen Dateien zu. Ein Wächter
über `js/`, `css/`, den beiden Bilderordnern und den HTML-Dateien meldet
jede Änderung an den offenen Tab, der daraus seinen Schluss zieht:

| Geändert | Was passiert |
| --- | --- |
| `css/style.css` | Das Stilblatt wird im laufenden Betrieb getauscht. Die Seite lädt nicht neu, die Scrollhöhe und die geöffnete Figur bleiben stehen. |
| Bilder in `assets/characters/portraits/` und `assets/characters/fullsize/` | Nur das eine Bild wird getauscht, sonst ändert sich nichts. Ein Schnitt im Bild-Studio steht damit sofort in der offenen Figur. |
| `index.html`, `characters.html`, alles in `js/` | Die Seite lädt neu. Der Browser stellt die Scrollhöhe wieder her, die Figur steht in der Adresse. |
| `start.js` | Nichts. Der Server ist keine Seitendatei, für ihn zählt weiter ein Neustart. |

Nach einem Neustart des Servers lädt jeder offene Tab ebenfalls nach,
auch wenn währenddessen etwas geändert wurde. Das Skript dafür setzt der
Server beim Ausliefern selbst in die Seite, es steht in keiner Datei im
Ordner. Wer `index.html` direkt im Browser öffnet, bekommt es also nicht
und bleibt beim Neuladen von Hand.

Entschieden wird dabei über den **Inhalt** der Datei, nicht über ihren
Zeitpunkt. Ein Programm, das eine Datei nur anfasst, ohne ein Byte zu
ändern – der Abgleich von OneDrive tut das, ein Editor beim Öffnen
ebenso –, löst deshalb nichts aus. Sonst holte die offene Seite bei jedem
Abgleich reihenweise Bilder neu oder lud gleich ganz neu, und ein
Neuladen der Charakterseite kostet gut eine Sekunde und die Stelle, an
der man gerade war.

### In VS Code

Ein Doppelklick ist beim Arbeiten am Studio einer zu viel, deshalb macht
[.vscode/tasks.json](.vscode/tasks.json) es von selbst: Beim Öffnen des
Ordners laufen beide Server im eingebauten Terminal an, ohne eigenes
Konsolenfenster und ohne Browsertabs. Beim ersten Mal fragt VS Code
einmal nach, ob die Aufgabe laufen darf. Wieder loswerden lässt sie sich
über die Befehlspalette mit „Tasks: Manage Automatic Tasks“.

Der Aufruf dort lautet `node start.js --beobachten --kein-browser`.
`--beobachten` heißt: Das Studio läuft unter `node --watch` und startet
sich nach einer Änderung an `server.js` selbst neu, und der Server sieht
seinen Dateien beim Arbeiten zu. Was daraus folgt, entscheidet die
Oberfläche. Die Fanpage geht das nichts an, sie wird immer beobachtet.

| Geändert | Was passiert |
| --- | --- |
| `styles/studio.css` | Das Stilblatt wird im laufenden Betrieb getauscht. Die Seite lädt nicht neu, die angefangene Arbeit bleibt stehen. |
| `index.html`, `studio.js` und die Skripte in `ui-components/` | Die Seite lädt neu. Die Figur steht in der Adresse, man landet wieder bei ihr. |
| `server.js` | Node startet den Server neu, die Seite wartet ab und lädt danach nach. |

Der Live-Server-Knopf von VS Code hilft hier übrigens nicht: Er liefert
nur Dateien aus, und das Studio ist zum größten Teil eine Schnittstelle.
Ohne den Node-Server käme die Oberfläche hoch und könnte nichts.

## Film-Logos einfügen

Solange kein Logo vorhanden ist, zeigt die Seite automatisch den stilisierten
Filmtitel als Platzhalter. Um echte Logos zu verwenden:

1. Logo als **WebP mit transparentem Hintergrund** besorgen
   (z. B. aus der Wikipedia oder von Fan-Wikis – nur für private Nutzung).
2. Datei in `assets/logos/` ablegen, exakt benannt nach dem Slug des Films
   (siehe Tabelle unten), z. B. `assets/logos/iron-man.webp`.
3. Seite neu laden – das Logo ersetzt den Platzhalter automatisch.

Die Größe muss nicht angepasst werden: Jedes Logo wird beim Laden vermessen
(sichtbarer Inhalt ohne transparenten Rand) und automatisch so skaliert, dass
alle Logos optisch gleich groß wirken – als Referenz dient `iron-man.webp`.

### Dunkle Fassung für die Charakterseite

Die Logos in `assets/logos/` sind hell gezeichnet, für den dunklen Grund der
Timeline. Die Charakterseite (`characters.html`) ist als einzige Seite weiß,
dort wären sie kaum zu sehen. Deshalb liegt derselbe Schriftzug noch einmal
dunkel unter `assets/logos/dark/<slug>.webp`, mit denselben Bildmaßen wie die
helle Datei, damit beide Seiten auf dieselbe Logogröße kommen.

Fehlt eine dunkle Datei, nimmt die Charakterseite die helle. Es reicht also,
die dunklen Fassungen nach und nach zu ergänzen.

### Dateinamen (Slugs)

| Film | Dateiname |
| --- | --- |
| Iron Man | `iron-man.png` |
| The Incredible Hulk | `the-incredible-hulk.png` |
| Iron Man 2 | `iron-man-2.png` |
| Thor | `thor.png` |
| Captain America: The First Avenger | `captain-america-the-first-avenger.png` |
| Marvel's The Avengers | `the-avengers.png` |
| Iron Man 3 | `iron-man-3.png` |
| Thor: The Dark World | `thor-the-dark-world.png` |
| Captain America: The Winter Soldier | `captain-america-the-winter-soldier.png` |
| Guardians of the Galaxy | `guardians-of-the-galaxy.png` |
| Avengers: Age of Ultron | `avengers-age-of-ultron.png` |
| Ant-Man | `ant-man.png` |
| Captain America: Civil War | `captain-america-civil-war.png` |
| Doctor Strange | `doctor-strange.png` |
| Guardians of the Galaxy Vol. 2 | `guardians-of-the-galaxy-vol-2.png` |
| Spider-Man: Homecoming | `spider-man-homecoming.png` |
| Thor: Ragnarok | `thor-ragnarok.png` |
| Black Panther | `black-panther.png` |
| Avengers: Infinity War | `avengers-infinity-war.png` |
| Ant-Man and the Wasp | `ant-man-and-the-wasp.png` |
| Captain Marvel | `captain-marvel.png` |
| Avengers: Endgame | `avengers-endgame.png` |
| Spider-Man: Far From Home | `spider-man-far-from-home.png` |
| Black Widow | `black-widow.png` |
| Shang-Chi and the Legend of the Ten Rings | `shang-chi.png` |
| Eternals | `eternals.png` |
| Spider-Man: No Way Home | `spider-man-no-way-home.png` |
| Doctor Strange in the Multiverse of Madness | `doctor-strange-in-the-multiverse-of-madness.png` |
| Thor: Love and Thunder | `thor-love-and-thunder.png` |
| Black Panther: Wakanda Forever | `black-panther-wakanda-forever.png` |
| Ant-Man and the Wasp: Quantumania | `ant-man-and-the-wasp-quantumania.png` |
| Guardians of the Galaxy Vol. 3 | `guardians-of-the-galaxy-vol-3.png` |
| The Marvels | `the-marvels.png` |
| Deadpool & Wolverine | `deadpool-and-wolverine.png` |
| Captain America: Brave New World | `captain-america-brave-new-world.png` |
| Thunderbolts* | `thunderbolts.png` |
| The Fantastic Four: First Steps | `the-fantastic-four-first-steps.png` |
| Spider-Man: Brand New Day | `spider-man-brand-new-day.png` |
| Avengers: Doomsday | `avengers-doomsday.png` |
| Avengers: Secret Wars | `avengers-secret-wars.png` |
| X-Men | `x-men.png` |
| Ghost Rider | `ghost-rider.png` |
| Black Panther 3 | `black-panther-3.png` |

Serien (Staffeln teilen sich ein Logo):

| Serie | Dateiname |
| --- | --- |
| WandaVision | `wandavision.png` |
| The Falcon and the Winter Soldier | `the-falcon-and-the-winter-soldier.png` |
| Loki (Staffel 1 & 2) | `loki.png` |
| Hawkeye | `hawkeye.png` |
| Moon Knight | `moon-knight.png` |
| Ms. Marvel | `ms-marvel.png` |
| She-Hulk: Attorney at Law | `she-hulk.png` |
| Secret Invasion | `secret-invasion.png` |
| Echo | `echo.png` |
| Agatha All Along | `agatha-all-along.png` |
| Daredevil: Born Again (Staffel 1 bis 3) | `daredevil-born-again.png` |
| Ironheart | `ironheart.png` |
| Wonder Man | `wonder-man.png` |
| VisionQuest | `visionquest.png` |

## Bilder zuschneiden

Die runden Profilbilder liegen als quadratisches WebP unter
`assets/characters/portraits/<slug>.webp`, die Ganzkörperbilder unter
`assets/characters/fullsize/<datei>.webp`. Wer sie selbst setzen möchte,
startet das Bild-Studio:

```
node tools/portrait-studio/server.js
```

Wer die Fanpage daneben laufen lassen will, nimmt stattdessen
`node start.js` (siehe [Starten](#starten)).

Es öffnet [http://127.0.0.1:4321](http://127.0.0.1:4321) und listet jede
Figur aus `js/data.js`. Oben wird zwischen drei Bereichen umgeschaltet:
**Porträts** und **Ganzkörper** arbeiten am Bild und werden gleich
bedient, **Biografie** arbeitet an allem, was Text ist.

Die Liste links steht in derselben Ordnung wie das Raster der
Charakterseite: nach der Zeile, die dort groß über der Kachel steht, also
nach dem Heldennamen und nur ersatzweise nach dem bürgerlichen. Steve
Rogers steht deshalb unter **Captain America** und der Realname eine
Zeile darunter. Wer eine Figur auf der Seite an einer Stelle sucht,
findet sie hier an derselben.

Unter `tools/portrait-studio/` liegen oben der Server und die beiden
Dateien, die die Oberfläche tragen. Darunter stehen vier Ordner:

| Ordner | Was darin liegt |
| --- | --- |
| `ui-components/` | Die eigenständigen Stücke der Oberfläche: Hintergrund, Partikelschrift, elektrischer Rand, Zählwerk, Farbschema, die Stränge im Fortschrittskasten und die Symbole an den Knöpfen. |
| `styles/` | Das Stilblatt `studio.css`. |
| `services/` | Was der Server aufruft, sortiert nach Bereich. Oben liegt, was Porträt und Ganzkörper gleichermaßen bedient: `crop-image.py` schneidet zu, `remove-background.py` nimmt den Hintergrund weg, `facial-recognition/` baut Gesichter neu auf und holt sich seine Modelle mit `install-models.py` selbst. Darunter steht je ein Ordner für die Skripte eines einzelnen Bereichs: `fullsize/` mit `crop-fullsize.py`, `biography/` mit `fetch-facts.py` und `build-facts.py`. |
| `vendor/` | Fremdes, hier nur Real-ESRGAN zum Hochrechnen. Rund 50 MB Binärdateien, die nicht im Repo liegen. |

Der Browser bekommt nur, was in `SEITENDATEIEN` und `STILDATEI` in
`server.js` steht, und zwar unter demselben Weg wie auf der Platte. Die
Skripte in `services/` liefert der Server nicht aus.

Die Zeichen an den Knöpfen kommen aus `react-icons`, aus dem Satz Lucide
darin. Das Studio hat keinen Bauschritt und läuft ohne Internet, deshalb
liegt nicht das Paket im Repo, sondern nur die Pfaddaten der benutzten
Symbole, in `ui-components/icons.js`. Wer ein weiteres braucht, nimmt es dort
in `ZEICHEN` auf und hängt sein `data-symbol` an den Knopf.

### Biografie

Der dritte Bereich führt die Texte einer Figur. Links steht die
ausführliche Biografie als benannte Abschnitte, die sich anlegen,
umbenennen, verschieben und löschen lassen. Rechts stehen die
Kurzbiografie für die Timeline, der Steckbrief, die benannten
Beziehungen und die Besetzung.

Beim Steckbrief liegen zwei Schichten übereinander, wie auch die
Charakterseite sie liest. Was der Wiki-Abruf gefunden hat, steht blass im
leeren Feld; was hineingeschrieben wird, liegt darüber und kommt nach
`CHAR_FACTS_EXTRA`. Ein Feld zu leeren heißt also, wieder die Angabe des
Wikis gelten zu lassen. Die Kräfte stehen in keiner Infobox und gehören
ganz der Handarbeit; sie gehen einen eigenen Weg und landen nicht im
Steckbrief, sondern in `CHAR_POWERS`. Im Feld steht je Fähigkeit ein
Block: oben der Name, darunter der Absatz, dazwischen eine Leerzeile.

| Feld | Wohin es geschrieben wird |
| --- | --- |
| Abschnitte | `PROFILES` in `js/profiles.js` |
| Kurzbiografie | `BIOS` in `js/data.js` |
| Besetzung | `ACTORS` in `js/data.js` |
| Herkunft, Spezies, Größe, Status, Zugehörigkeit | `CHAR_FACTS_EXTRA` in `js/facts.js` |
| Kräfte | `CHAR_POWERS` in `js/powers.js` |
| Beziehungen | `CHAR_BONDS` in `js/facts.js` |

Die Beziehungen stehen auf der Charakterseite als Karten unter
**Connections** und tragen dort ihre Bezeichnung. Wer eine Figur mit
jemandem verbinden will, trägt sie hier ein: `CHAR_CONNECTIONS`
([js/connections.js](js/connections.js)) ist von marvel.com geholt und
wird nicht von Hand gepflegt.

Die Bezeichnung ist Freitext und trotzdem selten neu, „Weggefährte“ steht
bei über siebzig Figuren. Neben dem Feld schlägt ein Pfeil deshalb alle
Begriffe auf, die schon benutzt sind, mit der Zahl ihrer Beziehungen
dahinter, und Tippen filtert die Liste. Ein Wort, das noch nicht darin
steht, kommt beim Verlassen des Feldes von selbst hinein und liegt bis zu
seinem ersten Auftritt bei einer Figur in
`tools/portrait-studio/bond-labels.json`. Alles andere wird aus
`CHAR_BONDS` gezählt und nicht zweimal geführt. Das Stiftzeichen an einer
Zeile benennt den Begriff bei allen Figuren zugleich um, was ein Schritt
im Verlauf ist, und ein Begriff ohne Beziehung lässt sich mit dem Kreuz
wieder aus der Liste nehmen.

**Speichern** schreibt alle drei Dateien in einem Schritt, und der
Verlauf nimmt sie als einen zurück. Geschrieben wird dabei nicht die
Datei, sondern der Eintrag der Figur: Seine Zeilen werden ausgetauscht,
alles davor und dahinter bleibt Zeichen für Zeichen stehen. Kommentare,
Gruppen und die Reihenfolge überleben das, ein neuer Eintrag kommt an die
Stelle des ersten Auftritts. Vor dem Schreiben werden die neuen Fassungen
geladen und geprüft; trägt eine nicht das Erwartete, bleibt alles, wie es
war. Angefangene Texte stehen nur im Browser, deshalb fragt das Studio
vor jedem Wechsel nach.

### Steckbriefe aus den Wikis

`CHAR_FACTS` in `js/facts.js` ist erzeugt und gehört den beiden Skripten
in `tools/portrait-studio/services/biography/`:
[fetch-facts.py](tools/portrait-studio/services/biography/fetch-facts.py)
holt, [build-facts.py](tools/portrait-studio/services/biography/build-facts.py)
schreibt. Beide lassen sich aus dem Reiter Biografie auslösen:

- **Wiki neu** holt die offene Figur noch einmal aus beiden Wikis.
- **Fehlende nachziehen** holt die Figuren, die im Block noch keinen
  Eintrag haben. Die Zahl daneben sagt, wie viele das sind.

`build-facts.py` schreibt den Block als Ganzes und kennt nur, was in
seiner Namensliste steht. Das Studio baut deshalb in eine Kopie neben
`js/facts.js` und setzt daraus genau die Einträge, die eben geholt
wurden. Alles andere im Block bleibt unberührt, und ein Lauf über eine
einzelne Figur ist eine Sache von Sekunden.

Der Rohtext der Infoboxen bleibt unter `tools/portrait-studio/.wiki`
liegen. Was einmal geholt ist, wird nicht noch einmal geholt; nur beim
ausdrücklichen Neuabruf einer Figur fliegt ihr Eintrag vorher heraus.

### Nebeneinander arbeiten

Nichts im Studio wartet auf etwas anderes. Ein Zuschnitt läuft ein paar
Sekunden, und in dieser Zeit lässt sich weiterarbeiten: zur nächsten
Fassung wechseln, die nächste Figur aufschlagen, ein zweites Bild
losschicken, eine Fassung umbenennen und gleich darauf ihre Stelle
ändern. Der Auftrag gehört dabei der Fassung, für die er gestartet wurde,
nicht der, die gerade auf der Bühne liegt — was fertig wird, trägt sich
an der richtigen Stelle ein, auch wenn längst etwas anderes offen ist.

Der Fortschrittskasten unten rechts zeigt jede laufende Arbeit mit
eigenem Balken, untereinander. Er geht erst zu, wenn die letzte fertig
ist.

Gesperrt ist immer nur das eine, was gerade arbeitet: **Speichern** für
die Fassung, die geschnitten wird, und der Knopf der Fassungsleiste,
dessen Auftrag unterwegs ist. Alles andere bleibt bedienbar.

### Rückgängig und wiederholen

Über der Bühne stehen die beiden Pfeile **Rückgängig** und
**Wiederholen**, dazu Strg+Z und Strg+Y. Sie fassen zwei
Sorten von Schritten in einer Reihe zusammen, in der Reihenfolge, in der
sie passiert sind. Der Tooltip nennt jeweils den Schritt, um den es geht.

**Die Arbeit an der Bühne** liegt nur im Browser: Ausschnitt verschieben,
an Ecke oder Kante ziehen, zoomen, ausrichten, *Automatisch zuschneiden*,
*Zurücksetzen*. Zusammenhängendes wird zu einem Schritt — ein Zug mit der
Maus ist einer, ein Stapel Radbewegungen auch, sobald eine halbe Sekunde
Ruhe ist. Jeder Schritt merkt sich, wo er entstanden ist; führt ein
Rückgängig zu einer anderen Fassung, wechselt das Studio erst dorthin.
Zoom und Lage des Bildes stehen bewusst nicht drin, sie ändern nichts am
Ergebnis.

**Die Eingriffe, die geschrieben wurden**, hält der Server: gespeicherte
Bilder, Fassungen, Namen, Schlüssel, Auftritte, Körpergrößen,
Offen-Markierungen, die Texte einer Figur und die Steckbriefe aus den
Wikis. Dahinter stehen keine Gegenrechnungen, sondern
Schnappschüsse: Vor und nach jedem Eingriff sichert das Studio genau die
Dateien, die er anfassen kann, unter `tools/portrait-studio/.verlauf`.
Rückgängig spielt den Stand von vorher zurück, wiederholen den von
nachher. Deshalb stimmt es auch dort, wo Dateien umbenannt, verschoben
oder gelöscht wurden. Wer nach einem Rückgängig etwas Neues tut,
schneidet die Zukunft ab, wie überall.

Der Verlauf gilt für die laufende Sitzung und wird beim Start des Servers
geleert. Nach einem Neustart weiß niemand mehr, ob die Dateien in der
Zwischenzeit von Hand angefasst wurden, und ein Rückgängig würde dann
fremde Arbeit überschreiben. Er hält die letzten 40 Schritte.

### Die Sicherung

Darunter liegt die zweite Ebene. Vor jedem Eingriff legt das Studio eine
Kopie der Datei nach `tools/portrait-studio/.sicherung`, mit dem Zeitpunkt
im Namen: die Porträts und Ganzkörperbilder, dazu `chars.js`, `data.js`,
`profiles.js`, `facts.js` und die Quellenangabe `CREDITS.md`. Sie überlebt
den Neustart, hält keine Reihenfolge und kennt kein Wiederholen — sie ist
kein Verlauf, sondern ein Stapel Kopien.

**Sicherung** oben rechts im Kopf öffnet ihn. Jede Zeile nennt die Figur,
den Platz, an den die Fassung gehört, den Zeitpunkt und die Größe;
Bildfassungen zeigen sich in der Vorschau. Vier Fächer trennen Porträts,
Ganzkörperbilder und Daten. Steht am Platz einer Fassung nichts mehr, sagt
die Zeile es in Warnfarbe: Dann ist diese Kopie alles, was von der Datei
geblieben ist.

- **Zurückholen** schreibt die Fassung an ihren Platz. Was dort steht,
  wird vorher selbst gesichert, und der Schritt geht in den Verlauf — ein
  Strg+Z nimmt ihn zurück.
- **Auswahl löschen** trifft die angehakten Zeilen, das Kreuz in der Zeile
  genau eine.
- **Ältere aufräumen** behält je Datei die jüngste Fassung und wirft die
  älteren weg. Das ist der Griff, der den Ordner klein hält, ohne die
  letzte Rückfallebene zu nehmen.
- **Alles löschen** leert ihn.

Gelöschtes ist weg: Der Verlauf sichert das Repo, nicht die Sicherung.
Deshalb fragt jeder Griff, der mehr als eine Zeile trifft, vorher nach.
Der Ordner steht in der `.gitignore` und gehört diesem Rechner.

### Neue Figur anlegen

Unter den Filtern in der Liste steht **Neue Figur**. Eine Figur ist in
dieser Datenbank nichts als ein Name in den Besetzungslisten, sie entsteht
deshalb mit ihrem ersten Auftritt. Der Dialog fragt dreierlei:

- **Realname und Heldenname** in zwei Feldern, zusammengesetzt wird mit
  `&nbsp;/&nbsp;`. Der rechte darf leer bleiben. Der Schlüssel wird beim
  Tippen vorgerechnet.
- **Welt**, nur bei Figuren aus einer anderen Wirklichkeit. Sie hängt sich
  als Klammer an den Namen, zur Wahl steht `CHAR_WORLDS` aus
  `js/chars.js`.
- **Kürzel für den Schlüssel (CHAR_ALIAS)**, freiwillig. Ohne Angabe kommt
  der Schlüssel aus dem ganzen Namen, aus „Riri Williams / Ironheart“ also
  `riri-williams-ironheart`. Wer die Bilder unter `riri-williams` führen
  will, trägt das hier ein.
- **Auftritte**, mindestens einer, aus derselben Filmliste wie beim
  Bearbeiten.

Gehört der Schlüssel schon einer Figur, sagt der Dialog, welcher, und
lässt sich nicht abschicken. Nach dem Anlegen ist die Figur ausgewählt und
wartet auf ihre Bilder: Porträt und Ganzkörperbild stehen mit rotem Punkt
da, bis eine Vorlage hochgeladen und gespeichert wird. Alles zusammen ist
ein Schritt im Verlauf, ein Rückgängig nimmt die Figur wieder heraus.

### Namen, Schlüssel und Auftritte

Neben dem Namen der Figur stehen zwei Knöpfe, die in `js/data.js` und
`js/chars.js` schreiben:

**Namen …** hält drei Dinge auseinander, die leicht durcheinandergehen:

- **Realname und Heldenname** stehen in `data.js` als eine Zeichenkette,
  getrennt durch `&nbsp;/&nbsp;` mit Leerzeichen davor und danach. Im
  Dialog haben sie je ein Feld, zusammengesetzt wird beim Speichern.
  Getrennt wird am **ersten** Slash, wie es auch `splitName()` tut: Bei
  „Marc Spector / Steven Grant / Moon Knight“ steht links der Realname und
  rechts der ganze Rest. Wer keinen Heldennamen hat, lässt das rechte Feld
  leer. Der Dialog zeigt jeden Namen, unter dem die Figur in den
  Besetzungslisten steht — Sam Wilson steht zweimal drin, als Falcon und
  als Captain America — und jede Zeile hat ihr eigenes *Übernehmen*.
- Das **Kürzel für den Schlüssel** ist der Eintrag in `CHAR_ALIAS`, also
  `Tony Stark`. Auch eine Zeichenkette, kein Schlüssel. Es hat ein eigenes
  Feld mit eigenem *Übernehmen* und gilt für alle Namen der Figur
  zugleich, sonst zerfiele sie in zwei Schlüssel.
- Die **Welt** sagt, aus welcher Wirklichkeit die Fassung stammt. Sie
  steht in `data.js` als Klammer am Ende des Namens, also
  „Christine Palmer (Erde-838)“, und hat im Dialog eine eigene Auswahl je
  Namenszeile. Zur Wahl steht, was `CHAR_WORLDS` in `js/chars.js` führt.
  Nur diese Klammern gelten als Welt: „Gamora (2014)“ nennt eine Zeit und
  „Peter Parker / Spider-Man (Maguire)“ eine Besetzung, beide bleiben am
  Namen. Eine fehlende Welt kommt über das Feld **Neue Welt für die
  Auswahl** dazu, das sie in `CHAR_WORLDS` schreibt und danach in jeder
  Auswahl anbietet. Am Namen der Figur ändert das noch nichts, die Welt
  wird danach in ihrer Zeile gewählt und übernommen. Unter dem Feld steht
  jede bekannte Welt als eigener Knopf, ein Klick setzt sie ins Feld.
  **Streichen** nimmt sie wieder aus `CHAR_WORLDS` heraus, aber nur,
  solange kein Name sie mehr trägt: Die Liste entscheidet, ob eine Klammer
  eine Wirklichkeit meint oder eine Zeit, und eine gestrichene Welt machte
  aus „Christine Palmer (Erde-838)“ eine Variante namens Erde-838. Hängt
  noch jemand daran, sagt die Meldung, wer.
- Der **Schlüssel** ist, was `charSlug()` daraus macht, `tony-stark`. Er
  wird nur vorgerechnet und nie direkt gesetzt.

Beim **Umbenennen eines Namens** bleibt der Schlüssel in jedem Fall
stehen: Ergäbe der neue Name für sich einen anderen, entsteht automatisch
der passende Alias; wird ein Alias dadurch überflüssig, fällt er weg.

Beim **Ändern des Kürzels** kann sich der Schlüssel ändern — muss aber
nicht, `Ronan` und `Ronan!` ergeben denselben. Ändert er sich, zieht alles
mit: die Bilddateien in beiden Ordnern und die Verweise in `data.js`,
`chars.js`, `profiles.js` und `facts.js`. Das ist der Eingriff mit der
größten Reichweite im Studio, deshalb steht eine Warnung im Dialog,
geschrieben wird erst auf *Übernehmen*, und von jeder berührten Datei
liegt vorher eine Kopie in `tools/portrait-studio/.sicherung`.

**Auftritte …** listet alle Filme und Serien mit einem Kontrollkästchen.
Ein Haken schreibt die Besetzungsliste des Films sofort um. Beim
Streichen fallen auch die Begegnungen (`meets`) mit dieser Figur in dem
Film weg, sonst zeigten sie ins Leere. Wer den letzten Auftritt streicht,
bekommt einen Hinweis: Ohne Auftritt steht die Figur in keiner Liste mehr
und verschwindet aus der Datenbank.

### Figur löschen

Am Fuß von **Namen …** steht abgesetzt **Figur löschen**. Es nimmt die
Figur ganz aus der Datenbank, und das ist mehr, als die Auftritte zu
streichen: Ihr Schlüssel trägt Bilder, Biografie, Steckbrief,
Beziehungen und Fähigkeiten, und all das bliebe sonst als Waise in fünf
Dateien liegen. In einem Zug gehen deshalb weg:

| Was | Wo es steht |
| --- | --- |
| Auftritte und Begegnungen | `characters` und `meets` in `js/data.js` |
| Kurzbiografie und Besetzung | `BIOS` und `ACTORS` in `js/data.js` |
| Alias, Ansichten, Fassungen, Körpergrößen, Stimme | `CHAR_ALIAS`, `CHAR_LOOKS`, `FULLSIZE_LOOKS`, `FULLSIZE_STANDARD`, `FULLSIZE_SCALE`, `FULLSIZE_FIT`, `CHAR_VOICE_ONLY` in `js/chars.js` |
| Biografie | `PROFILES` in `js/profiles.js` |
| Steckbrief und Beziehungen | `CHAR_FACTS`, `CHAR_FACTS_EXTRA`, `CHAR_BONDS` in `js/facts.js` |
| Fähigkeiten | `CHAR_POWERS` in `js/powers.js` |
| Beschreibung einer Fassung | `FULLSIZE_NOTES` in `js/looks.js` |
| Porträts und Ganzkörperbilder | beide Ordner unter `assets/characters/` |

Beziehungen **anderer** Figuren, die auf sie zeigten, gehen mit: Sie
führten auf der Charakterseite ins Leere. Bleibt dabei eine leere
Beziehungsliste übrig, fällt sie ganz weg.

Bei den Bildern reicht der Dateiname als Regel nicht. Die Fassungen
einer Figur tragen ihren Schlüssel als Präfix, aber manche Varianten
sind eigene Figuren: `gamora-2014` ist nicht die Fassung von `gamora`,
sondern Gamora aus 2014, mit eigenem Schlüssel und eigenen Auftritten.
Eine Datei gehört deshalb der Figur mit dem **längsten** passenden
Schlüssel. Wer `peter-parker` löscht, verliert dessen neun Anzüge, aber
`peter-parker-maguire` und `peter-parker-garfield` bleiben stehen.

Der Dialog nennt vorher, was daranhängt, und die Rückfrage zählt es noch
einmal auf. Alles zusammen ist ein Schritt im Verlauf, ein Rückgängig
holt die Figur samt Bildern zurück. Die Bilder liegen danach zusätzlich
in `tools/portrait-studio/.sicherung`.

### Porträts

Ein Klick legt das bestehende Profilbild der Figur auf die Bühne, mit dem
Kreis darauf, der den Ausschnitt bestimmt. Es ist dort Vorlage wie jede
andere: nachziehen, hochrechnen, freistellen, und Speichern schreibt es
an dieselbe Stelle zurück. Wer stattdessen frisch aus dem Ganzkörperbild
schneiden will, wählt dessen Chip unter den Vorlagen. Gibt es für die
Fassung noch gar kein Porträt, steht das Ganzkörperbild von Anfang an da.

Ziehen im Kreis verschiebt den Ausschnitt,
das Mausrad ändert seine Größe, die Ecken lassen sich anfassen und die
Pfeiltasten schieben pixelweise.

Das Bild selbst zoomt die Leiste oben rechts auf der Bühne, ebenso Strg
mit dem Mausrad. Ziehen neben dem Ausschnitt verschiebt es, *Einpassen*
holt die ganze Figur zurück ins Bild. 100 Prozent heißt dabei ein
Bildschirmpunkt je Pixel der Vorlage. Eine selbst gewählte Ansicht bleibt
stehen, bis eine andere Vorlage an die Reihe kommt.

**Hilfslinien & Einrasten** legt Linien an den sichtbaren Inhalt der
Vorlage: den *Boden* unter den Füßen und die *Mitte* der Figur in Grün,
Scheitel und Seiten sowie die Bildkanten schwächer. Kanten, Ecken und die
Mitte des Ausschnitts rasten daran ein, sobald sie auf sieben
Bildschirmpunkte herankommen, die eingerastete Linie leuchtet dabei auf.
Wer einen Wert dicht daneben braucht, hält beim Ziehen Alt. Gemessen wird
die Hülle im Browser, mit derselben Alphaschwelle wie beim randlosen
Zuschnitt.

**Ausrichten** dreht eine schief stehende Vorlage gerade. Der Regler geht
bis 45 Grad, die Knöpfe daneben drehen um eine Vierteldrehung und der
Rücksetzer am Ende stellt auf null zurück. Gedreht wird das Bild, nicht der Ausschnitt: Die
Datei am Ende ist ein aufrechtes Rechteck, und der Ausschnitt bleibt beim
Drehen auf derselben Stelle der Figur stehen. Der Winkel gehört zum
Zuschnitt und wird beim Speichern mitgeschnitten, `crop-image.py` dreht
dafür genauso. Solange eine Drehung eingestellt ist, bleibt *Zuschnitt
für den Skill merken* gesperrt: Der Skill dreht beim nächsten Lauf nicht
mit und träfe mit den gemerkten Werten daneben.

Figuren mit mehreren Fassungen (Bruce Banner, Tony
Stark, …) haben je Fassung ein eigenes Porträt und ein eigenes
Ganzkörperbild, beides ist oben umschaltbar. Statt des Ganzkörperbildes
geht auch ein eigenes Bild vom Rechner, per Knopf, Ablegen oder Einfügen.

Das Kontrollkästchen **Noch offen, soll neu gemacht werden** stellt ein
Bild von Hand auf offen, auch wenn die Datei längst da ist. Das wirkt
sofort, ohne Speichern: Die Figur bekommt einen gelben Punkt und zählt
oben als markiert. Bei den Porträts steht sie zusätzlich in
`A - Portraits noch offen.txt` mit dem Zusatz `[von Hand markiert]`.
Gespeichert wird die Markierung in `tools/portrait-studio/offen.json`,
getrennt nach Porträts und Ganzkörperbildern, denn dieselbe Figur heißt in
beiden Ordnern gleich. Wer das Bild danach neu schneidet und speichert,
ist die Markierung wieder los.

*Automatisch zuschneiden* übernimmt den Vorschlag der Bilderkennung:
Gesicht suchen, von dort bis zum Scheitel laufen, den Kopf 60 Prozent der
Bildhöhe füllen lassen. Rechts steht die Vorschau in Originalgröße neben
dem bisherigen Porträt. **Speichern** schreibt die Datei endgültig, legt
die alte nach `tools/portrait-studio/.sicherung` und erneuert die Liste
`assets/ersetzen/A - Portraits noch offen.txt`.

### Ganzkörper

Hier ist der Ausschnitt ein freies Rechteck: Neben den Ecken lassen sich
auch die vier Kantenmitten anfassen, jede Seite geht für sich. Anders als
beim Porträt gibt es keine Wahl der Vorlage, die Fassung ist ihre eigene:
Zugeschnitten wird das Bild, das an dieser Stelle steht, oder ein
hochgeladenes. Welches das ist, steht unter der Vorschau bei *Bisher*.
Eine Fassung ohne Datei steht mit rotem Punkt in der Liste und wartet auf
ein eigenes Bild.

Eine Fassung mit Varianten steht trotzdem nur einmal in der Reihe, ihre
Bilder hängen als Ziffern hinter dem Chip – genau wie sie auf der
Charakterseite an der Profilleiste hängen. Ein Klick auf eine Ziffer holt
genau dieses Bild auf die Bühne: Bearbeitet wird immer ein einzelnes
Bild, nie eine ganze Fassung. Die Zahl neben der Figur in der linken
Liste zählt dagegen Fassungen und keine Dateien.

*Randlos beschneiden* legt das Rechteck um die Hülle aller sichtbaren
Pixel, nach derselben Regel wie `services/fullsize/crop-fullsize.py` im
Studioordner. Das ist keine
Kosmetik: Der Rahmen auf der Charakterseite misst die Datei und nicht die
Figur darin, leere Fläche zählt für ihn also mit. Nur unten ist sie
erlaubt, dort lässt sie die Figur fliegen und wird als Schwebe verrechnet
(siehe weiter unten). Die Vorschau rechts ist deshalb
genau dieser Rahmen, maßstäblich, mit Bodenlinie und der Größe aus
`FULLSIZE_SCALE` und `FULLSIZE_FIT`. Sehr große Vorlagen werden beim Speichern auf das Maß
des Bestandes gebracht (höchstens 1500 Pixel hoch und 1200 breit),
kleinere bleiben, wie sie sind.

Weil die Fassung ihre eigene Vorlage ist, schreibt Speichern in die
Datei, aus der die Bühne ihre Pixel hat. Der Server legt sie deshalb
beiseite, bevor er sie das erste Mal überschreibt, und schneidet von da
an aus dieser Urfassung. Solange die Bühne dieselbe Vorlage zeigt, trifft
jeder weitere Zuschnitt dieselbe Fläche wie der erste: Zweimal dasselbe
zu speichern ergibt zweimal dieselbe Datei, und wer den Rahmen danach
weiter aufzieht, bekommt genau das, was die Vorschau zeigt. Wird die
Vorlage neu von der Platte geladen, gilt wieder der Stand im Ordner.

Unter den Fassungs-Chips steht die Leiste **Neu / Umbenennen / hoch /
runter / Zum Standard / Variante + / Variante − / links / rechts / Zur
Variante … / Zur Fassung … / Löschen**. Sie schreibt in `FULLSIZE_LOOKS`
und `FULLSIZE_VARIANTS` in `js/chars.js`, woraus auch die Charakterseite
ihre Fassungswahl und die Ziffern an der Profilleiste nimmt:

**Die Beschriftung ist der einzige Wert, der gepflegt wird.** Der
Dateiname entsteht aus ihr: Leerzeichen werden zu Bindestrichen, Umlaute
aufgelöst, aus „Im Flug“ wird `adrian-toomes-vulture-im-flug.webp`. Ändert
sich die Beschriftung, wird das Bild mit umbenannt, und mit ihm ziehen
Körpergröße (`FULLSIZE_SCALE`), Bildkorrektur (`FULLSIZE_FIT`), Schwebe
(`FULLSIZE_LIFT`), Offen-Markierung (`offen.json`) und die
Quellenangabe in `assets/characters/fullsize/CREDITS.md` nach. Dasselbe
gilt überall dort, wo ein Bild seinen Namen wechselt, also auch beim
Umsortieren und Umhängen der Varianten weiter unten. Gedacht
werden muss der Name also nur einmal. Hat die Fassung Varianten,
ziehen alle ihre Bilder zusammen um, und die Anzahl in
`FULLSIZE_VARIANTS` wandert vom alten Stamm auf den neuen.

**Standard ist, was an erster Stelle steht**, unabhängig vom Dateinamen.
Nur Figuren ohne Eintrag in `FULLSIZE_LOOKS` haben ihr eines Bild unter
`<slug>.webp`.

- **Neu** legt eine Fassung an, gefragt wird nach der Beschriftung und dem
  Film. Der entstehende Dateiname steht im Dialog. Die Fassung erscheint
  sofort mit rotem Punkt und wartet auf ihr Bild, das per Upload und
  *Speichern* dazukommt. Hat eine Figur bisher nur ihr eines Bild,
  entsteht der Listeneintrag dabei neu.
- **Umbenennen** ändert Beschriftung und Dateinamen zusammen. Bei einer
  Figur mit nur einem Bild ist der Knopf gesperrt: Dort gibt es nichts zu
  unterscheiden, und die Datei soll wie die Figur heißen.
- **Die beiden Winkel** verschieben die Fassung in der Reihenfolge, in der die
  Charakterseite ihre Schalter zeigt. Wer nach ganz vorn rutscht, ist die
  neue Standardansicht.
- **Zum Standard** ist die Abkürzung dafür: Die Fassung rückt an die
  erste Stelle, die bisherige Standardansicht eine nach hinten. Es wandert
  keine Datei, beide Bilder behalten ihre Namen.
- **Variante +** legt ein weiteres Bild derselben Fassung an, keine
  zweite Fassung. Beim ersten Mal heißt `<Fassung>.webp` danach
  `<Fassung>-1.webp` und die neue Variante `<Fassung>-2.webp`; sie
  erscheint sofort mit rotem Punkt und wartet auf ihr Bild. Auf der
  Charakterseite stehen sie danach als Ziffern an der Profilleiste. Mehr
  als neun trägt eine Fassung nicht: Die Schalter dort tragen eine
  Ziffer, und wer zehn Aufnahmen desselben Anzugs hat, hat eher zwei
  Fassungen als eine.
- **Variante −** nimmt das gewählte Bild aus der Fassung. Die Varianten
  dahinter rücken eine Nummer nach vorn, samt Bild, Körpergröße,
  Bildkorrektur und Offen-Markierung; bleibt am Ende ein einziges Bild
  übrig, heißt es wieder wie die Fassung. Das entfernte Bild wandert in
  die Sicherung.
- **Die beiden Winkel neben Variante −** verschieben das gewählte Bild in
  der Reihe seiner Varianten. Sie zeigen nach links und nach rechts, denn
  so steht die Reihe auch da: als Ziffern hinter dem Chip und auf der
  Charakterseite an der Profilleiste. Verschoben heißt getauscht, das
  Bild wechselt mit seinem Nachbarn den Dateinamen und nimmt Körpergröße,
  Bildkorrektur, Schwebe, Offen-Markierung und Quellenangabe mit. Was
  ganz vorn steht, ist auf der Charakterseite als Erstes zu sehen.
- **Zur Variante …** hängt die gewählte Fassung als Variante an eine
  andere derselben Figur. Welche das ist, steht im Dialog zur Wahl, und
  darunter steht, wie die Dateien danach heißen. Die Fassung verliert
  dabei ihre Zeile in `FULLSIZE_LOOKS` und mit ihr Beschriftung und Film,
  ihre Bilder hängen sich hinten an die der Zielfassung. Hatte die
  Zielfassung bisher nur ihr eines Bild, heißt es danach
  `<Fassung>-1.webp`. Eine Fassung mit Varianten nimmt alle ihre Bilder
  mit, zusammen sind neun das Höchste.
- **Zur Fassung …** ist der Weg zurück: Das gewählte Bild löst sich aus
  seiner Fassung und bekommt eine eigene Tafel, gleich hinter der, aus der
  es kommt. Gefragt wird nach Beschriftung und Film wie beim Anlegen, und
  der Dateiname entsteht wie dort aus der Beschriftung. Die Varianten
  dahinter rücken eine Nummer nach vorn, und bleibt drüben ein einziges
  Bild übrig, heißt es wieder wie seine Fassung.
- **Löschen** nimmt die Fassung aus der Liste, das Bild wandert in
  `tools/portrait-studio/.sicherung` und die Größenangaben fallen mit weg.
  Eine Fassung mit Varianten nimmt alle ihre Bilder mit.
  Bleibt danach ein einzelnes Bild übrig, das ohnehin wie die Figur heißt,
  verschwindet der ganze Eintrag.

Die meisten Ganzkörperbilder liegen nur als Datei im Ordner und stehen
gar nicht in `FULLSIZE_LOOKS`: Figuren mit einer Ansicht brauchen dort
keinen Eintrag. Sobald jemand an Reihenfolge, Beschriftung oder Bestand
dreht, entsteht die Liste von selbst, und zwar aus dem, was die
Oberfläche ohnehin schon zeigt. Erst danach lässt sich sortieren.

Unter der Leiste steht die Wahl **Film**: aus welchem Auftritt die
gewählte Fassung stammt. Daraus nimmt die Charakterseite das Logo auf der
Fassungstafel und den Titel neben der Bühne. Gemeint ist der Film, der
die Fassung zeigt, und nicht jeder, in dem sie vorkommt: Steve Rogers
trägt seinen Winter-Soldier-Anzug auch noch in Age of Ultron, das Logo
bleibt das des Films, der ihn eingeführt hat. Vorn stehen die Auftritte
der Figur, dahinter alle übrigen Titel, denn ein Kurzauftritt steht nicht
immer in der Besetzungsliste. Neben der Wahl liegt das Logo, wie es
später auf der Tafel steht.

Geschrieben wird an der Stelle, an der die Charakterseite nachsieht: Bei
Figuren mit Fassungsliste als dritter Wert des Eintrags in
`FULLSIZE_LOOKS`, bei Figuren mit nur einem Bild in `FULLSIZE_STANDARD`.
Wer nur in einem Titel vorkommt, braucht auch dort nichts, dann steht der
Film schon in der Wahl. Beides zieht mit: Entsteht eine Fassungsliste,
wandert der Film in ihren ersten Eintrag und die Zeile in
`FULLSIZE_STANDARD` fällt weg; fällt die Liste wieder weg, steht er
danach wieder dort.

Darunter steht das Feld **Beschreibung**: ein Satz zur gewählten
Fassung, den die Charakterseite unter die Fassungstafel schreibt. Er
sagt, woher der Anzug stammt, wozu er gebaut wurde oder in welchem
Zustand die Figur darin steckt, und gehört damit der Fassung und nicht
der Figur: Tony Stark hat achtzehn davon, einen je Rüstung. Auch die
Figur mit ihrem einzigen Bild hat einen, denn ihre Standardansicht ist
ebenso eine Fassung. Geschrieben wird auf **Übernehmen** oder mit Enter,
ein leeres Feld nimmt den Eintrag wieder heraus. Dann steht auf der
Charakterseite wieder die Zusammenfassung des Films.

Der Satz liegt in `FULLSIZE_NOTES` (`js/looks.js`), geschlüsselt nach dem
Dateinamen der Fassung. Die Liste ist nach Figuren gruppiert; ein neuer
Satz stellt sich zu denen derselben Figur, und hat sie noch keine, legt
das Studio am Ende eine Gruppe mit ihrem Namen an. Der Satz folgt seiner
Fassung: Beim Umbenennen zieht er mit, beim Löschen geht er mit, und mit
dem letzten Satz einer Figur auch deren Überschrift. Eine Fassung mit
mehreren Aufnahmen hat einen gemeinsamen Satz unter ihrem Stamm, denn er
beschreibt die Fassung und nicht das einzelne Bild.

Vor jedem Schreiben
wird die neue `chars.js` geladen und geprüft, eine Kopie der alten liegt
in der Sicherung. Die Porträt-Fassungen bleiben außen vor: Sie hängen in
`CHAR_LOOKS` am Film und nicht an einer Beschriftung.

Unter der Vorschau stehen zwei Regler. **Körpergröße** trägt nach, was
dem engen Zuschnitt fehlt: Ohne ihn stünde Rocket so hoch wie Thor. 1.0
ist ein erwachsener Mensch, 1.22 füllt den Rahmen. **Bildkorrektur**
gehört daneben nicht der Figur, sondern dieser einen Datei. Eine
Sprungpose, ein wehender Umhang oder ein Sockel macht das Bild höher als
die Figur, und weil der Rahmen das Bild misst, steht sie darin zu klein.
Der zweite Regler gleicht genau das aus, in Prozent, ohne der Figur eine
Größe anzudichten, die sie nicht hat. Beide wirken sofort auf die obere
Vorschau, darunter steht zum Vergleich, was gerade gilt. Der Rücksetzer
neben einem Regler stellt ihn auf den Stand aus `chars.js` zurück.

**Die Schwebe ist die dritte Zahl und wird gemessen, nicht eingestellt.**
Wer die Unterkante des Ausschnitts unter die Figur hinaus nach unten
zieht, will sie fliegen lassen. Für den Rahmen der Charakterseite ist die
leere Fläche darunter aber Bild wie jede andere, und dieselbe Figur stünde
in einer höheren Datei kleiner da. Das Studio misst deshalb nach jedem Zug
am Ausschnitt an den durchsichtigen Pixeln nach, welcher Anteil unter dem
letzten sichtbaren Pixel liegt, und zeigt ihn als Zeile unter den beiden
Reglern. Beim Speichern geht er als `FULLSIZE_LIFT` nach `chars.js`, und
die Seite rechnet die Datei darüber wieder groß. Die Figur behält damit
ihre Größe und steigt nur höher über die Bodenlinie.

Die Bildkorrektur bleibt davon unberührt. Sie sagt weiter nur, wie die
Pose von einer ruhig stehenden abweicht, und eine fliegende Figur kostet
keine Körpergröße mehr. Vorher lief beides über dieselbe Zahl, und weil
der Regler bei 1.6 endet und der Rahmen bei 1.22 voll ist, fing die Figur
ab einem bestimmten Punkt wieder an zu schrumpfen.

Eine Grenze bleibt, aber es ist die des Rahmens und keine willkürliche:
Höher als bis zu seiner Oberkante kommt keine Datei. Bei einer Figur mit
Körpergröße 0.42 wie Headpool ist das erst bei zwei Dritteln leerer
Fläche der Fall, bei einer mit 1.0 schon bei einem Viertel. Ist der Rahmen
voll, sagt es die Zeile mit der Schwebe dazu.

Wer eine fliegende Figur wieder aufschlägt, findet sie in der Luft: Der
randlose Zuschnitt läuft beim Laden wie immer, danach hängt das Studio die
gespeicherte Schwebe unten wieder an. Sonst stünde sie auf der Bodenlinie
und ein Speichern schriebe eine Null.

Gearbeitet wird damit auf der Bühne, nicht in der Vorschau: Der Schalter
*Rahmen der Seite* legt den Rahmen der Charakterseite über die
Arbeitsfläche, mit Bodenlinie unten und Oberkante oben. Der Rahmen bleibt
stehen, die Figur wächst und schrumpft darin, genau wie sie es später auf
der Seite tut. Wie viel sie vom Rahmen füllt, steht an der Oberkante.

Dazu gehört die **Referenz** oben im Kopf. Mit dem Rahmen wird eine
andere Fassung derselben Figur nicht mehr in den Ausschnitt gequetscht,
sondern steht daneben in ihrer eigenen Größe, auf derselben Bodenlinie
und mit einer Linie an ihrem Scheitel. Genau dafür ist die Bildkorrektur
da: Regler schieben, bis die Köpfe zusammenpassen, und alle Fassungen
einer Figur stehen später gleich groß im Rahmen. Ohne den Rahmen füllt
die Referenz wie eh und je den Ausschnitt, dann geht es um die Pose
statt um die Größe.

Im Rahmen zählt das Produkt aus beidem, und die Zeile darunter zeigt es.
Sie warnt auch, wenn es aus dem Bereich 0.2 bis 1.22 läuft, denn mehr
zeigt der Rahmen nicht.

**Speichern nimmt beide Werte mit.** Zuschnitt und Größe gehören
zusammen, wer das Bild schneidet, will die Figur auch in der Größe, die
im Studio davorsteht. Beides ist damit ein Schritt im Verlauf, ein
Rückgängig holt Datei und Zahlen zusammen zurück. Läuft das Produkt aus
dem Rahmen, wird nur geschnitten und die Größe bleibt stehen, die Meldung
sagt es dazu. Der Knopf *In chars.js schreiben* bleibt daneben für den
anderen Fall: Größe setzen, ohne die Datei neu zu schneiden.

Geschrieben wird die Körpergröße in `FULLSIZE_SCALE`, an der richtigen
Stelle der kommentierten Gruppen und aufsteigend sortiert, die
Bildkorrektur in `FULLSIZE_FIT`, nach Dateinamen sortiert. 1.0 nimmt den
jeweiligen Eintrag wieder heraus, weil das der Vorgabewert ist. Vor dem
Schreiben wird die neue Fassung geladen und geprüft, und eine Kopie der
alten `chars.js` liegt in `tools/portrait-studio/.sicherung`.

### Vorlagen aufbereiten

Unter der Bühne stehen zwei Knöpfe, die die Vorlage anfassen statt den
Ausschnitt. Beide legen ihr Ergebnis als eigenes Bild bei den Vorlagen
ab, gespeichert wird dadurch noch nichts. Ihre Reihenfolge ist nicht
gleichgültig: erst hochrechnen, dann freistellen.

**Upscale** rechnet eine zu kleine Vorlage mit Real-ESRGAN vierfach hoch.
Im Fenster dazu lässt sich ein Gesichtsmodell wählen, GFPGAN oder
CodeFormer, das die Gesichter danach neu aufbaut. Ohne das bleiben sie
wächsern, denn Real-ESRGAN schärft nur Kanten und erfindet keine Iris.

**Freistellen** nimmt den Hintergrund aus einer deckenden Vorlage. Das
lohnt weit über die Bequemlichkeit hinaus: Mit Alphakanal findet der
Vorschlag den Kopf über die Umrissform statt über eine geschätzte
Gesichtsbox, und im Rahmen der Charakterseite steht die Figur frei statt
in einem Kasten. Gerechnet wird auf diesem Rechner, ohne Verbindung nach
draußen. Zwei Einstellungen stehen im Fenster:

- **Modell.** Voreingestellt ist BiRefNet, dieselbe Bauart, auf der auch
  die bekannten Netzdienste aufsetzen. ISNet und U²-Net sind schneller
  und gröber. Angeboten wird nur, was als Datei in `~/.u2net` liegt.
- **Zweiter Durchgang am Ausschnitt.** Das Modell rechnet auf 1024 Pixel.
  Steht die Figur klein in der Vorlage, wird sie dafür ausgeschnitten und
  noch einmal gerechnet, was den Fehler an der Kante etwa halbiert.
- **Farbsaum herausrechnen.** Halbdurchsichtige Randpixel tragen den
  alten Hintergrund anteilig mit sich, ohne Abzug bekäme jede
  Haarsträhne vor dem dunklen Grund der Seite einen hellen Rand.

Für den Vorschlag und das Speichern braucht es Python mit Pillow, NumPy
und OpenCV. Ohne diese Umgebung startet das Studio zwar, kann aber nichts
schneiden. Der Pfad lässt sich über die Umgebungsvariable
`PORTRAIT_PYTHON` vorgeben. Das Freistellen braucht zusätzlich `rembg`
und `onnxruntime` sowie mindestens ein Modell in `~/.u2net`, gesucht wird
das passende Python über `FREISTELLEN_PYTHON` und dieselben Kandidaten.
Was der Server gefunden hat, steht beim Start in seiner Ausgabe.

## Anpassen

- **Filme, Serien & Daten**: [js/data.js](js/data.js) – pro Eintrag Titel,
  Slug, `period` (Handlungszeitraum, steht unter dem Zeitstrahl) und `date`
  (Kinostart bzw. Disney+-Start, steht in der Infobox); neue Einträge ins
  `movies`-Array ihrer Phase einfügen, an der passenden Stelle der
  Handlungs-Chronologie. Serien mit `series: true` markieren
  („Serie“-Badge, Infobox zeigt „Disney+-Start“), zukünftige Titel mit
  `upcoming: true` („Demnächst“-Badge). `summary` ist die Kurzfassung für
  die Hover-Infobox, `story` die Liste der Schlüsselmomente fürs Modal,
  das ein Klick aufs Logo öffnet.
- **Charaktere**: `characters` listet pro Eintrag die Figuren, einheitlich
  als „Realname / Heldenname“. Im Modal ist jeder Name anklickbar und
  öffnet eine Charakterübersicht mit Porträt, allen Rollen und sämtlichen
  Auftritten in Handlungsreihenfolge. Von dort führt jeder Auftritt zurück
  ins Film-Modal. Dieselben Figuren stehen auf der Charakterseite im
  Raster, sie braucht keine eigene Pflege. Das Porträt liegt unter
  `assets/characters/portraits/<slug>.webp`, der Slug entsteht aus dem Namen
  (Kleinbuchstaben, Bindestriche). Dieselbe Datei steht auf der Bühne der
  Vollansicht noch einmal groß aufgezogen, ohne Rahmen und unten von der
  Schräge angeschnitten. Ein Ganzkörperbild mit transparentem Hintergrund
  unter `assets/characters/fullsize/<slug>.webp` steht dagegen auf der
  Erscheinungsbühne; fehlt die Datei, steht dort ein Platzhalter.
  Figuren, die im
  Lauf des Universums ihr Aussehen ändern, führen in `FULLSIZE_LOOKS`
  ([js/chars.js](js/chars.js)) weitere Fassungen (Rüstungen, Anzüge,
  Verwandlungen) und bekommen links neben der Figur die Fassungswahl.
  Zu jeder Fassung gehört der Film, aus dem sie stammt; er steht als
  dritter Wert im Eintrag. Liegt eine Fassung in mehreren Bildern vor –
  dieselbe Rüstung in einer anderen Haltung –, steht ihre Zahl in
  `FULLSIZE_VARIANTS` (ebenfalls [js/chars.js](js/chars.js)), die Dateien
  heißen dann `<Fassung>-1`, `<Fassung>-2` und so weiter, und die
  Charakterseite schaltet oben an der Profilleiste zwischen ihnen um.
  Figuren mit nur einem Bild führt
  `FULLSIZE_STANDARD` (ebenfalls [js/chars.js](js/chars.js)) — aber nur
  die, die in mehreren Titeln vorkommen: Wer nur in einem auftritt,
  dessen Bild kann aus keinem anderen sein, das rechnet die
  Charakterseite selbst aus. Weicht der Dateiname vom Namen in
  `data.js` ab oder wechselt eine Figur ihren Heldennamen, sorgt
  `CHAR_ALIAS` in [js/chars.js](js/chars.js) dafür, dass beides
  zusammenfindet. In `js/chars.js` steht alles, was sich Timeline und
  Charakterseite teilen (Slugs, Porträts, Auftrittsindex).
- **Welt einer Figur**: Varianten aus anderen Wirklichkeiten tragen ihre
  Herkunft in Klammern am Namen, „Wanda Maximoff / Scarlet Witch
  (Erde-838)“. Welche Klammer eine Welt ist, steht in `CHAR_WORLDS`
  ([js/chars.js](js/chars.js)); `splitName()` gibt sie als eigene Angabe
  heraus. Auf der Kachel und auf der Bühne steht sie deshalb in einer
  eigenen Zeile unter dem Namen und nicht hinter ihm, in der Timeline
  ebenso über der Rolle. Klammern, die keine Welt sind, bleiben am Namen:
  „Gamora (2014)“ nennt eine Zeit, „Peter Parker / Spider-Man (Maguire)“
  eine Besetzung. Neue Welten kommen über das Bild-Studio dazu.
- **Porträt pro Film**: Wird eine Figur umbesetzt oder verwandelt sie sich
  sichtbar, zeigt jeder Film die Fassung aus genau diesem Film. `CHAR_LOOKS`
  in [js/chars.js](js/chars.js) hält dafür pro Charakter-Slug die Filme fest,
  in denen ein anderes Bild gilt (Bruce Banner als Norton in
  „The Incredible Hulk“, Ross als Red Hulk in „Brave New World“). Ohne
  Eintrag gilt das Standardporträt. Die Figur bleibt trotzdem eine einzige:
  Auftritte, Besetzung und Biografie hängen weiter am Charakter-Slug.
- **Besetzung & Biografie**: `ACTORS` und `BIOS` am Ende von
  [js/data.js](js/data.js), beide nach demselben Slug geschlüsselt wie das
  Porträt. Ein Eintrag in `ACTORS` darf auch eine Liste sein, dann stehen
  mehrere Namen nebeneinander (Umbesetzungen wie Bruce Banner oder
  Thaddeus Ross, geteilte Rollen wie Rocket). `BIOS` sind ein bis drei
  Sätze zur Figur und stehen auf der Charakterseite als Beschreibung unter
  dem Namen auf der Bühne. Fehlt ein Eintrag, bleibt der jeweilige Teil
  weg, die beiden Listen lassen sich also unabhängig voneinander pflegen.
  Bei K.I.-Systemen und Robotern ohne Körper vor der Kamera heißt die
  Zeile „gesprochen von“ statt „gespielt von“. Welche Figuren das sind,
  steht in `CHAR_VOICE_ONLY` in [js/chars.js](js/chars.js). Künstliche
  Wesen, die jemand wirklich spielt, gehören nicht hinein: Vision steht
  als Paul Bettany im Bild, Ultron bewegt sich nach James Spaders
  Aufnahmen.
- **Ausführliche Biografie**: `PROFILES` in
  [js/profiles.js](js/profiles.js), pro Figur eine Liste aus
  `[Überschrift, Text]` in Handlungsreihenfolge. Die Vollansicht der
  Charakterseite führt sie hinter dem Reiter **Biografie**, die
  Kurzfassung aus `BIOS` steht davon unberührt oben auf der Bühne. Ohne
  Eintrag fällt der Reiter weg. Die Datei gehört nur in
  `characters.html`, die Timeline lädt sie nicht.
- **Kräfte und Fähigkeiten**: `CHAR_POWERS` in
  [js/powers.js](js/powers.js), pro Figur eine Liste aus
  `[Name, Beschreibung]`. Jeder Eintrag wird auf der Tafel
  **Fähigkeiten** zu einer eigenen Fläche, die Reihenfolge ist die der
  Reihe darunter. Die Namen folgen dem Band „Powers + Abilities“ auf
  marvel.com und sind ins Deutsche übersetzt, das Glossar dazu steht im
  Kopf der Datei. Jede Figur aus `js/data.js` hat einen Eintrag; fehlt
  einmal einer, fällt der Reiter weg, statt eine Tafel ohne Text zu
  zeigen. Erfunden wird nichts. Auch diese Datei gehört nur in
  `characters.html`.
- **Akzentfarben pro Phase**: ebenfalls in `js/data.js`
  (`accent` fürs UI, `nebula` = drei RGB-Farben für die Galaxie-Nebel).
- **Galaxie-Animation**: alle Regler an einer Stelle in
  [js/galaxy-config.js](js/galaxy-config.js), gezeichnet wird in
  [js/galaxy.js](js/galaxy.js) auf WebGL2. Siehe
  [Der Galaxie-Hintergrund](#der-galaxie-hintergrund).
- **Scroll-Gefühl**: in [js/main.js](js/main.js) beim Lenis-Aufruf
  (`lerp: 0.09` – kleiner = weicher/träger, größer = direkter).
- **Hero-Sequenz**: Länge über `.hero-track { height: 460vh }` in
  `css/style.css` (mehr = gemächlicher), die Fenster der Textstufen in
  `js/main.js` bei `heroStages` (Anteile 0–1 am Scrollweg des Tracks).
- **Layout/Design**: [css/style.css](css/style.css).

## Der Galaxie-Hintergrund

Der Hintergrund ist ein einziges bildschirmfüllendes Canvas hinter der
ganzen Seite. Von unten nach oben liegen darauf: ein gemaltes Grundbild
(`assets/theme/galaxy-bg.webp`, 3072 x 2048), zwei prozedural erzeugte
Nebelfelder, der Phasenschleier, die pulsierende Sonne links oben, ein
feines Sternenfeld, die hellen Sterne mit Funkeln, gelegentliche
Sternschnuppen und zuletzt drei abdunkelnde Verläufe.

Gezeichnet wird auf WebGL2, in fünf Durchgängen mit eigenen Shadern. Das
Nebelbild backt die Grafikkarte einmal beim Start in eine Textur, alles
Übrige entsteht pro Bildpunkt.

| Datei | Wofür |
| --- | --- |
| [js/galaxy-config.js](js/galaxy-config.js) | Alle Regler und die sechs Nebelbereiche. Wer am Aussehen dreht, dreht hier. |
| [js/galaxy.js](js/galaxy.js) | Der WebGL2-Renderer und die Schnittstelle `window.Galaxy`. |
| [js/galaxy-canvas-2d.js](js/galaxy-canvas-2d.js) | Rückfallebene ohne WebGL2. Startet nur, wenn `js/galaxy.js` sie ruft. |
| [tools/portrait-studio/ui-components/galaxy-panel.js](tools/portrait-studio/ui-components/galaxy-panel.js) | Die Tafel im Bild-Studio: Vorschau und Schieber. |

Alle drei müssen in dieser Reihenfolge eingebunden sein, siehe das Ende
von `index.html` und `characters.html`.

### Regler im Bild-Studio

Der bequeme Weg. Das Studio starten (`node start.js`, oder direkt
`node tools/portrait-studio/server.js`), oben im Kopf auf **Galaxie**.

Links läuft eine Vorschau, rechts stehen alle Regler als Schieber. Die
Vorschau ist kein Nachbau: Der Dialog lädt dieselben Dateien aus `js/`,
die auch die Seite lädt, und lässt sie in seinem eigenen Canvas laufen.
Was dort zu sehen ist, ist deshalb genau das, was herauskommt.

Unter der Vorschau stehen die sieben Phasen zur Auswahl, damit sich der
Phasenschleier beurteilen lässt und nicht nur der Seitenanfang. Weiter
unten in der Reglerspalte kommen zwei Gruppen, die nicht zu den Reglern
gehören:

- **Nebelbereiche**: die sechs Bereiche des prozeduralen Nebelbilds
  einzeln, mit Farbe, Stärke, Feinheit, Graten und ihrer Lage.
- **Farben der Phasen**: je Phase der Akzent und die drei Nebelfarben,
  siehe unten. Sie stehen in `js/data.js`.

Was man anfasst, wirkt sofort, aber nur in der Vorschau. Erst **Sichern**
schreibt es in die Dateien, und zwar Zeile für Zeile: Von den 4200 Zeilen
in `js/data.js` ändern sich genau die, die auch gemeint waren, und die
Erklärungen in `js/galaxy-config.js` bleiben unangetastet. Vorher legt
das Studio wie immer Kopien in `.sicherung`, und **Rückgängig** nimmt
beide Dateien in einem Schritt zurück.

### Regler zur Laufzeit

```js
Galaxy.set({ nebWarp: 0.35, bgTint: 0.8, timeScale: 0.5 })
Galaxy.get()                                   // aktueller Stand
Galaxy.setRegions([{ col: [200, 40, 90] }])    // Nebelbereiche einzeln
Galaxy.getRegions()
Galaxy.setPalette([[70,110,255], ...])         // ruft main.js pro Phase
```

Was das Nebelbild betrifft, löst ein neues Backen aus (unter einer
Millisekunde), der Rest wirkt im nächsten Bild. Jeder Regler ist in
`js/galaxy-config.js` einzeln beschrieben. Die wichtigsten:

- **`bgTint`** trennt Struktur und Farbe im gemalten Grundbild. Bei 0
  behält es seine eigenen Farben, bei 1 wird nur noch seine Helligkeit
  als Dichte gelesen und die Farbe kommt vollständig aus der Palette der
  gerade sichtbaren Phase. Der Schleier allein konnte die gemalten Farben
  nur anhauchen, das hier färbt sie wirklich um.
- **`nebWarp`** verzerrt das Rauschen mit sich selbst. Aus runden Wolken
  werden gezogene, wirbelnde Schwaden.
- **`nebRoughness`** bestimmt, wie viel jede Oktave von der vorigen
  behält. Der eigentliche Regler für Feinstruktur im Nebel.
- **`bgResample`** legt fest, wie das Grundbild verkleinert wird, und
  entscheidet damit, wie hart die darin gemalten Sterne herauskommen.
- **`shootInterval`** ist der mittlere Abstand zwischen zwei
  Sternschnuppen in Sekunden. Der wirkliche Abstand streut von gut der
  Hälfte bis knapp zum Anderthalbfachen, bei 12.5 sind das die 7 bis 18
  Sekunden der Vorlage.
- **`timeScale`**, **`nebPulse`**, **`sunPulse`**, **`twinkleSpeed`**
  regeln das Tempo der Bewegungen.

### Die Farben der Phasen

Sie gehören nicht zum Hintergrund, sondern zur Phase, und stehen deshalb
in [js/data.js](js/data.js) bei der Phase selbst. Zwei Felder:

- **`accent`** ist ein Hexwert und färbt die ganze Oberfläche dieser
  Phase: Ränder, Knöpfe, Chips, die Marke am Zeitstrahl. Er wird als
  CSS-Variable `--accent` gesetzt.
- **`nebula`** sind drei RGB-Tripel. Sie liegen als Verlauf über der
  Bildschirmdiagonale, das erste oben links, das dritte unten rechts, und
  gelten, solange diese Phase sichtbar ist.

| Phase | Zeile | Akzent |
| --- | --- | --- |
| 1 | [data.js:65](js/data.js#L65) | `#4d8cff` Blau |
| 2 | [data.js:252](js/data.js#L252) | `#ff4d4d` Rot |
| 3 | [data.js:453](js/data.js#L453) | `#ffd93c` Gelb |
| 4 | [data.js:716](js/data.js#L716) | `#a855f7` Violett |
| 5 | [data.js:1156](js/data.js#L1156) | `#34d6a0` Grün |
| 6 | [data.js:1427](js/data.js#L1427) | `#ffa63c` Orange |
| 7 | [data.js:1636](js/data.js#L1636) | `#ff4dc4` Magenta |

Ein Zusammenhang, den man leicht übersieht: `DEFAULT_NEBULA`
([data.js:2570](js/data.js#L2570)) wird nicht gepflegt, sondern aus den
**Akzenten** aller Phasen gerechnet. Das ist die Palette am Seitenanfang,
wo noch keine Phase gilt, also alle nebeneinander. Wer einen Akzent
ändert, ändert damit auch den Seitenanfang, aber nicht die Galaxie
dieser Phase. Wer `nebula` ändert, ändert nur die Galaxie dieser Phase.

### Nachprüfen

Der Umbau von Canvas auf WebGL2 sollte am Bild nichts ändern. Ob das
stimmt, entscheidet nicht das Auge, sondern
[tools/galaxy-diff/verify.js](tools/galaxy-diff/verify.js): Es startet
beide Renderer im selben Browser, schiebt sie Bild für Bild durch
denselben Zeitverlauf und zählt die Abweichung Punkt für Punkt.

```
cd tools/galaxy-diff && npm i puppeteer-core     # einmalig
node tools/galaxy-diff/verify.js                # alle drei Prüfungen
node tools/galaxy-diff/verify.js schichten      # Schicht für Schicht
node tools/galaxy-diff/verify.js regler         # wirkt jeder Regler?
node tools/galaxy-diff/verify.js seite          # läuft die echte Seite?
```

Stand bei der Umstellung, 1280 x 720, Abweichung in Stufen von 255: im
Mittel 0,6 über alle Schichten, 99,3 Prozent aller Bildpunkte innerhalb
von zwei Stufen, kein einziger über 24 außer bei bewegten Schweifen. Die
verbliebene Abweichung ist symmetrische Rundung und kein Versatz, das ist
mitgemessen: Canvas rundet nach jeder der sechs Schichten auf acht Bit,
der Shader nur einmal am Ende.

Drei Dinge sind bewusst anders und nicht angeglichen worden:

- Die feinen Sterne bekommen ihre Kantenglättung aus 64 ausgezählten
  Proben statt aus einem weichen Übergang. Bei Radien um einen halben
  Bildpunkt entscheidet das über die Helligkeit, und Auszählen trifft
  genau das, was Canvas rechnet.
- Sterne werden additiv übereinandergelegt, Canvas legt sie innerhalb
  ihrer Ebene deckend übereinander. Additiv ist richtiger, überlappende
  Sterne sind Licht und keine Farbe.
- Die hellen Sterne bekommen ihren Halo als Formel statt als 48 Punkte
  großes Bild, das auf 5 bis 24 Punkte zusammengezogen wird.

Zwei Erwartungen haben sich beim Messen nicht bestätigt und stehen
deshalb anders in der Vorgabe, als zuerst gedacht war: `nebFactor` ändert
das Bild um zwei von 255 Stufen und steht deshalb auf 1 statt auf 4, das
Sechzehnfache an Speicher lohnt dafür nicht. Die Weichheit der Nebel kam
nicht von der Auflösung des gebackenen Bildes, sondern daher, dass die
feinen Oktaven kaum Energie tragen und die ganze Schicht nur ein blasser
Hauch über dem Grundbild ist (gemessen 0,9 von 255 Stufen).

### Tempo

Gemessen auf einer Intel-Grafikeinheit, Median des Abstands zwischen den
Bildern über mehrere Läufe:

| | WebGL2 | Canvas 2D |
| --- | --- | --- |
| 1920 x 1080 | 16,6 bis 16,7 ms | 16,7 bis 16,8 ms |
| 3840 x 2160 | 17 bis 24 ms | 33 bis 40 ms |

Bei 1080p laufen beide mit vollen 60 Bildern, die alte Fassung mit etwas
mehr Ausreißern nach oben. Auf sehr großen Flächen, also 4K oder ein
2K-Schirm mit doppelter Punktdichte, ist die neue Fassung ungefähr
doppelt so schnell. Die Werte schwanken von Lauf zu Lauf spürbar, weil
die Grafikeinheit sich den Speicher mit allem anderen teilt.

## Hinweise

- Gruppierung = offizielle Marvel-Phasen 1–7; innerhalb jeder Phase gilt
  die Handlungs-Chronologie (angelehnt an Marvels offizielle
  Timeline-Reihenfolge, z. B. auf Disney+), nicht der Kinostart. Unter dem
  Zeitstrahl steht der Handlungszeitraum, der Kinostart in der
  Hover-Infobox.
- Dass es eine **Phase Seven** gibt, ist bestätigt, einen offiziellen
  Namen für die Saga danach gibt es aber noch nicht. In `data.js` steht
  „The Mutant Saga“, so nennt Kevin Feige sie selbst. Die drei Filme von
  2028 (*X-Men*, *Ghost Rider*, *Black Panther 3*) stehen hinter
  *Avengers: Secret Wars* und damit hinter dem Ende der Multiverse Saga.
- Serien = die Realserien von Marvel Studios / Marvel Television auf
  Disney+ (WandaVision bis VisionQuest). Animierte Serien (*What If…?*,
  *X-Men ’97*, *Eyes of Wakanda*, *Marvel Zombies*, …) und die Special
  Presentations (*Werewolf by Night*, Guardians-Holiday-Special) sind
  bewusst nicht enthalten. Staffeln mit eigener Phase (Loki,
  Daredevil: Born Again) stehen als eigene Einträge.
- Die Handlungszeiträume der neuesten Titel sind teils nur näherungsweise
  bekannt („20??“ = noch geheim); *The Fantastic Four: First Steps* spielt
  auf Erde-828, *Deadpool & Wolverine* größtenteils bei der TVA und die
  Loki-Staffeln liegen außerhalb der Zeit – sie stehen daher an ihrer
  offiziellen Viewing-Order-Position. Die Start-Termine ab August 2026
  sind angekündigt und können sich verschieben.
- Die Seite respektiert `prefers-reduced-motion` (Animationen werden dann
  deaktiviert).

---

Fanprojekt – nicht mit Marvel Studios oder The Walt Disney Company verbunden.
