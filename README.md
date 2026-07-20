# MCU Timeline – Fanpage

Inoffizielle Fanpage: Alle Kinofilme und Disney+-Realserien des Marvel
Cinematic Universe als horizontale Timeline, aufgeteilt in die offiziellen
Phasen 1–6. Innerhalb jeder Phase ist alles **chronologisch nach der
Handlung** sortiert (Story-Reihenfolge, angelehnt an Marvels offizielle
Timeline-Reihenfolge), nicht nach Kinostart – vor einem animierten
Galaxie-Hintergrund, dessen Farben sich pro Phase ändern. Serien tragen
ein „Serie“-Badge unter dem Zeitstrahl.

Gescrollt wird mit [Lenis](https://github.com/darkroomengineering/lenis)
(Smooth Scroll, lokal eingebunden unter `js/vendor/lenis.min.js`, MIT-Lizenz).
Die Seite scrollt normal vertikal; nur wenn man mit dem Mausrad direkt über
einer Zeitskala scrollt, schiebt sich diese Timeline horizontal weiter
(auf Touch-Geräten per Wischen). Ist sie am Anfang/Ende angekommen,
scrollt die Seite normal weiter.

## Starten

Einfach `index.html` im Browser öffnen – es wird kein Server und kein
Build-Tool benötigt. (Nur die Schriftarten werden von Google Fonts geladen;
ohne Internet greift ein System-Font-Fallback.)

## Film-Logos einfügen

Solange kein Logo vorhanden ist, zeigt die Seite automatisch den stilisierten
Filmtitel als Platzhalter. Um echte Logos zu verwenden:

1. Logo als **PNG mit transparentem Hintergrund** besorgen
   (z. B. aus der Wikipedia oder von Fan-Wikis – nur für private Nutzung).
2. Datei in `assets/logos/` ablegen, exakt benannt nach dem Slug des Films
   (siehe Tabelle unten), z. B. `assets/logos/iron-man.png`.
3. Seite neu laden – das Logo ersetzt den Platzhalter automatisch.

Die Größe muss nicht angepasst werden: Jedes Logo wird beim Laden vermessen
(sichtbarer Inhalt ohne transparenten Rand) und automatisch so skaliert, dass
alle Logos optisch gleich groß wirken – als Referenz dient `iron-man.png`.

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
  `upcoming: true` („Demnächst“-Badge).
- **Akzentfarben pro Phase**: ebenfalls in `js/data.js`
  (`accent` fürs UI, `nebula` = drei RGB-Farben für die Galaxie-Nebel).
- **Galaxie-Animation**: [js/galaxy.js](js/galaxy.js)
  (Sterndichte, Nebel, Sternschnuppen).
- **Scroll-Gefühl**: in [js/main.js](js/main.js) beim Lenis-Aufruf
  (`lerp: 0.09` – kleiner = weicher/träger, größer = direkter).
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
