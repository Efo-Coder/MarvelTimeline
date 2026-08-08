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
Phasen 1–6. Innerhalb jeder Phase ist alles **chronologisch nach der
Handlung** sortiert (Story-Reihenfolge, angelehnt an Marvels offizielle
Timeline-Reihenfolge), nicht nach Kinostart – vor einem animierten
Galaxie-Hintergrund, dessen Farben sich pro Phase ändern. Serien tragen
ein „Serie“-Badge unter dem Zeitstrahl.

Dazu gibt es eine zweite Seite: [characters.html](characters.html) zeigt
alle Figuren als Raster, mit Suche über Namen, Rollen und Besetzung, Filter
nach Phase und Sortierung nach Alphabet, Zahl der Auftritte oder erstem
Auftritt. Ein Klick auf eine Figur öffnet dieselbe Karte wie in der
Timeline (Porträt, Rollen, Besetzung, Kurzbiografie, alle Auftritte),
dazu eine ausführliche Biografie in benannten Abschnitten, und jeder
Auftritt darin führt zurück auf die Timeline, die den Titel direkt
aufschlägt. Der Header verlinkt beide Seiten.

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

## Starten

Einfach `index.html` im Browser öffnen – es wird kein Server und kein
Build-Tool benötigt. Die Charakterseite liegt daneben als
`characters.html`, verlinkt ist sie im Header. (Die beiden Marvel-Schriften
liegen lokal unter `assets/fonts`; nur Bebas Neue und Inter kommen von
Google Fonts, ohne Internet greift dort ein System-Font-Fallback.)

### Schriften

Die Seite folgt dem Aufbau des Marvel-Studios-Schriftzugs und arbeitet
mit drei Ebenen, gesetzt als CSS-Variablen in [css/style.css](css/style.css):

| Variable | Schrift | Wo |
| --- | --- | --- |
| `--font-impact` | BentonSans Comp Black | Die Schrift des fetten „MARVEL": Hero-Überschrift, Titel der Charakterseite, Name in der Figurenansicht, Ersatz für ein fehlendes Filmlogo, Monogramm ohne Porträt |
| `--font-brand` | Dharma Gothic E | Die Schrift des gesperrten „STUDIOS": „Timeline" im Header, Hero-Zeilen darunter, Saga-Zeile, Phasenband, die Zeilen über und unter „Charaktere" |
| `--font-display` | Bebas Neue | Die Bedienoberfläche: Navigation, Chips, Datumsangaben, Infoboxen, Beschriftungen |
| `--font-body` | Inter | Fließtext |

Beide Marvel-Schriften bringen nur einen Schnitt mit und haben echte
Kleinbuchstaben. Wer sie an einer neuen Stelle einsetzt, setzt deshalb
`text-transform: uppercase` dazu, wo Versalien gemeint sind. Bebas Neue
hat gar keine Kleinbuchstaben und brauchte die Angabe nie.

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
Oberfläche.

| Geändert | Was passiert |
| --- | --- |
| `styles/studio.css` | Das Stilblatt wird im laufenden Betrieb getauscht. Die Seite lädt nicht neu, die angefangene Arbeit bleibt stehen. |
| `index.html`, `studio.js` und die Skripte in `components/` | Die Seite lädt neu. Die Figur steht in der Adresse, man landet wieder bei ihr. |
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
| Daredevil: Born Again (Staffel 1 & 2) | `daredevil-born-again.png` |
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

Unter `tools/portrait-studio/` liegen oben der Server und die beiden
Dateien, die die Oberfläche tragen. Darunter stehen drei Ordner:

| Ordner | Was darin liegt |
| --- | --- |
| `components/` | Die eigenständigen Stücke der Oberfläche: Hintergrund, Partikelschrift, elektrischer Rand, Zählwerk, Farbschema, die Stränge im Fortschrittskasten und die Symbole an den Knöpfen. |
| `styles/` | Das Stilblatt `studio.css`. |
| `services/` | Was der Server aufruft. `crop-image.py` schneidet zu, `remove-background.py` nimmt den Hintergrund weg, `facial-recognition/` baut Gesichter neu auf und holt sich seine Modelle mit `install-models.py` selbst. |
| `vendor/` | Fremdes, hier nur Real-ESRGAN zum Hochrechnen. Rund 50 MB Binärdateien, die nicht im Repo liegen. |

Der Browser bekommt nur, was in `SEITENDATEIEN` und `STILDATEI` in
`server.js` steht, und zwar unter demselben Weg wie auf der Platte. Die
Skripte in `services/` liefert der Server nicht aus.

Die Zeichen an den Knöpfen kommen aus `react-icons`, aus dem Satz Lucide
darin. Das Studio hat keinen Bauschritt und läuft ohne Internet, deshalb
liegt nicht das Paket im Repo, sondern nur die Pfaddaten der benutzten
Symbole, in `components/icons.js`. Wer ein weiteres braucht, nimmt es dort
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
Wikis gelten zu lassen. Kräfte stehen in keiner Infobox und gehören
deshalb ganz der Handarbeit.

| Feld | Wohin es geschrieben wird |
| --- | --- |
| Abschnitte | `PROFILES` in `js/profiles.js` |
| Kurzbiografie | `BIOS` in `js/data.js` |
| Besetzung | `ACTORS` in `js/data.js` |
| Herkunft, Spezies, Größe, Status, Zugehörigkeit, Kräfte | `CHAR_FACTS_EXTRA` in `js/facts.js` |
| Beziehungen | `CHAR_BONDS` in `js/facts.js` |

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

`CHAR_FACTS` in `js/facts.js` ist erzeugt und gehört
[tools/fetch-facts.py](tools/fetch-facts.py) und
[tools/build-facts.py](tools/build-facts.py). Beide lassen sich aus dem
Reiter Biografie auslösen:

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

*Randlos beschneiden* legt das Rechteck um die Hülle aller sichtbaren
Pixel, nach derselben Regel wie `tools/crop-fullsize.py`. Das ist keine
Kosmetik: Der Rahmen auf der Charakterseite rechnet damit, dass die Datei
keine leere Fläche trägt. Ist sie doch da, steht die Figur zu klein im
Rahmen und schwebt über der Bodenlinie. Die Vorschau rechts ist deshalb
genau dieser Rahmen, maßstäblich, mit Bodenlinie und der Größe aus
`FULLSIZE_SCALE` und `FULLSIZE_FIT`. Sehr große Vorlagen werden beim Speichern auf das Maß
des Bestandes gebracht (höchstens 1500 Pixel hoch und 1200 breit),
kleinere bleiben, wie sie sind.

Unter den Fassungs-Chips steht die Leiste **Neu / Umbenennen / hoch /
runter / Zum Standard / Löschen**. Sie schreibt in `FULLSIZE_LOOKS` in `js/chars.js`, aus dem auch
die Charakterseite ihre Fassungsleiste nimmt:

**Die Beschriftung ist der einzige Wert, der gepflegt wird.** Der
Dateiname entsteht aus ihr: Leerzeichen werden zu Bindestrichen, Umlaute
aufgelöst, aus „Im Flug“ wird `adrian-toomes-vulture-im-flug.webp`. Ändert
sich die Beschriftung, wird das Bild mit umbenannt, und mit ihm ziehen
Körpergröße (`FULLSIZE_SCALE`), Bildkorrektur (`FULLSIZE_FIT`),
Offen-Markierung (`offen.json`) und die
Quellenangabe in `assets/characters/fullsize/CREDITS.md` nach. Gedacht
werden muss der Name also nur einmal.

**Standard ist, was an erster Stelle steht**, unabhängig vom Dateinamen.
Nur Figuren ohne Eintrag in `FULLSIZE_LOOKS` haben ihr eines Bild unter
`<slug>.webp`.

- **Neu** legt eine Fassung an, gefragt wird nur nach der Beschriftung.
  Der entstehende Dateiname steht im Dialog. Die Fassung erscheint sofort
  mit rotem Punkt und wartet auf ihr Bild, das per Upload und *Speichern*
  dazukommt. Hat eine Figur bisher nur ihr eines Bild, entsteht der
  Listeneintrag dabei neu.
- **Umbenennen** ändert Beschriftung und Dateinamen zusammen. Bei einer
  Figur mit nur einem Bild ist der Knopf gesperrt: Dort gibt es nichts zu
  unterscheiden, und die Datei soll wie die Figur heißen.
- **Die beiden Winkel** verschieben die Fassung in der Reihenfolge, in der die
  Charakterseite ihre Schalter zeigt. Wer nach ganz vorn rutscht, ist die
  neue Standardansicht.
- **Zum Standard** ist die Abkürzung dafür: Die Fassung rückt an die
  erste Stelle, die bisherige Standardansicht eine nach hinten. Es wandert
  keine Datei, beide Bilder behalten ihre Namen.
- **Löschen** nimmt die Fassung aus der Liste, das Bild wandert in
  `tools/portrait-studio/.sicherung` und die Größenangaben fallen mit weg.
  Bleibt danach ein einzelnes Bild übrig, das ohnehin wie die Figur heißt,
  verschwindet der ganze Eintrag.

Die meisten Ganzkörperbilder liegen nur als Datei im Ordner und stehen
gar nicht in `FULLSIZE_LOOKS`: Figuren mit einer Ansicht brauchen dort
keinen Eintrag. Sobald jemand an Reihenfolge, Beschriftung oder Bestand
dreht, entsteht die Liste von selbst, und zwar aus dem, was die
Oberfläche ohnehin schon zeigt. Erst danach lässt sich sortieren.

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
  (Kleinbuchstaben, Bindestriche). Ein Ganzkörperbild mit transparentem
  Hintergrund unter `assets/characters/fullsize/<slug>.webp` erscheint
  gerahmt rechts in der Biografie der Vollansicht, der Text fließt daran
  vorbei; fehlt die Datei, steht dort ein Platzhalter. Figuren, die im
  Lauf des Universums ihr Aussehen ändern, führen in `FULLSIZE_LOOKS`
  ([js/chars.js](js/chars.js)) weitere Fassungen (Rüstungen, Anzüge,
  Verwandlungen) und bekommen unter dem Rahmen Schalter dafür. Weicht der Dateiname vom Namen in
  `data.js` ab oder wechselt eine Figur ihren Heldennamen, sorgt
  `CHAR_ALIAS` in [js/chars.js](js/chars.js) dafür, dass beides
  zusammenfindet. In `js/chars.js` steht alles, was sich Timeline und
  Charakterseite teilen (Slugs, Porträts, Auftrittsindex).
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
  Sätze zur Figur. Fehlt ein Eintrag, bleibt der jeweilige Teil der Karte
  weg, die beiden Listen lassen sich also unabhängig voneinander pflegen.
  Bei K.I.-Systemen und Robotern ohne Körper vor der Kamera heißt die
  Zeile „gesprochen von“ statt „gespielt von“. Welche Figuren das sind,
  steht in `CHAR_VOICE_ONLY` in [js/chars.js](js/chars.js). Künstliche
  Wesen, die jemand wirklich spielt, gehören nicht hinein: Vision steht
  als Paul Bettany im Bild, Ultron bewegt sich nach James Spaders
  Aufnahmen.
- **Ausführliche Biografie**: `PROFILES` in
  [js/profiles.js](js/profiles.js), pro Figur eine Liste aus
  `[Überschrift, Text]` in Handlungsreihenfolge. Die Vollbildansicht der
  Charakterseite zeigt sie unter Porträt und Auftritten, die Kurzfassung
  aus `BIOS` bleibt daneben als Vorspann stehen. Ohne Eintrag entfällt der
  Block. Die Datei gehört nur in `characters.html`, die Timeline lädt sie
  nicht.
- **Akzentfarben pro Phase**: ebenfalls in `js/data.js`
  (`accent` fürs UI, `nebula` = drei RGB-Farben für die Galaxie-Nebel).
- **Galaxie-Animation**: [js/galaxy.js](js/galaxy.js)
  (Sterndichte, Nebel, Sternschnuppen).
- **Scroll-Gefühl**: in [js/main.js](js/main.js) beim Lenis-Aufruf
  (`lerp: 0.09` – kleiner = weicher/träger, größer = direkter).
- **Hero-Sequenz**: Länge über `.hero-track { height: 460vh }` in
  `css/style.css` (mehr = gemächlicher), die Fenster der Textstufen in
  `js/main.js` bei `heroStages` (Anteile 0–1 am Scrollweg des Tracks).
- **Layout/Design**: [css/style.css](css/style.css).

## Hinweise

- Gruppierung = offizielle Marvel-Phasen 1–6; innerhalb jeder Phase gilt
  die Handlungs-Chronologie (angelehnt an Marvels offizielle
  Timeline-Reihenfolge, z. B. auf Disney+), nicht der Kinostart. Unter dem
  Zeitstrahl steht der Handlungszeitraum, der Kinostart in der
  Hover-Infobox.
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
