# MCU Timeline – Fanpage

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
`characters.html`, verlinkt ist sie im Header. (Nur die Schriftarten
werden von Google Fonts geladen; ohne Internet greift ein
System-Font-Fallback.)

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
