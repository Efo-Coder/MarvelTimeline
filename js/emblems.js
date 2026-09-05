/* Die Zeichen hinter der Figur

   Auf der Erscheinungsbühne (js/characters.js) steht hinter dem
   Ganzkörperbild ein großes, blasses Zeichen und darüber und darunter je
   ein schräges Band in einer Farbe, die zur Figur passt. Vorlage ist die
   Heldentafel, wie Marvel sie für einzelne Figuren zeichnet: heller
   Grund, ein Wappen im Rücken, oben und unten ein angeschnittener
   Streifen.

   Die Regel ist EMBLEM_BY_FILM, und EMBLEM_BY_CHAR steht darüber und
   sticht sie. Im einzelnen entscheidet emblemFor() in drei Schritten:

     1. EMBLEM_BY_CHAR - wer ein eigenes Zeichen trägt, bekommt es und
        behält es überall. Tony Stark den Helm, Steve Rogers das Schild,
        Peter Parker die Spinne.

     2. EMBLEM_BY_FILM - alle anderen erben das Zeichen ihres ersten
        Auftritts. Aamir Khan ist kein Held und hat kein Wappen, aber er
        kommt zuerst in Ms. Marvel vor, also steht der Blitz seiner
        Schwester hinter ihm.

     3. 'marvel' - bleibt beides leer, steht das Zeichen des Hauses da.

   Maßgeblich ist der erste Auftritt in Handlungsreihenfolge und nicht
   der Film, aus dem das gezeigte Bild stammt. Das Zeichen steht damit
   für die ganze Figur fest: Wer durch die Fassungen blättert, sieht die
   Kulisse nicht mehr die Farbe wechseln. Wem dabei ein Wappen zufällt,
   das nicht zu ihm passt, den trägt man in EMBLEM_BY_CHAR ein.

   Auf die Bühne kommt jedes Zeichen als Vorlage aus assets/emblems,
   siehe emblemFile() weiter unten. Die Umrisse in EMBLEM_ART werden
   nicht mehr gezeichnet: Sie sind der erste Stand von Hand, und sie
   stehen hier noch als Verzeichnis der Wappen. Woran EMBLEM_ART hängt,
   ist emblemFor() oben, das nur Namen aus dieser Liste durchlässt, und
   tools/emblems/build-emblems.py, das die Schlüssel daraus liest, damit
   die Vorlagen richtig heißen.

   Ein Zeichen ohne Vorlage steht deshalb nicht mehr als Umriss da,
   sondern gar nicht. Wer eines aufnimmt, legt also auch die Datei dazu
   an. */

const EMBLEM_ART = {

  /* ---------- Die Zeichen ---------- */

  /* Die Helmmaske: die kantige Haube mit den beiden Augenschlitzen und
     dem waagerechten Mund. */
  'iron-man': '<path class="f" d="M100 12c30 0 52 14 56 40l6 46c4 26-10 50-32 68l-10 20'
    + 'H80l-10-20c-22-18-36-42-32-68l6-46c4-26 26-40 56-40Z"/>'
    + '<path class="c" d="M54 90 94 72v26l-38 10Zm92 0L106 72v26l38 10Z"/>'
    + '<path class="c" d="M72 132h56v11H72Z"/>',

  /* Das Schild: drei Ringe und der Stern. */
  'captain-america': '<circle class="s" cx="100" cy="100" r="90" stroke-width="15"/>'
    + '<circle class="s" cx="100" cy="100" r="63" stroke-width="15"/>'
    + '<circle class="s" cx="100" cy="100" r="37" stroke-width="15"/>'
    + '<path class="f" d="M100 58 110 86.2 139.9 87 116.2 105.3 124.7 134 100 117'
    + ' 75.3 134 83.8 105.3 60.1 87 90 86.2Z"/>',

  /* John Walkers Stern, halb ausgefüllt: dasselbe Zeichen wie auf Steve
     Rogers' Schild, aber nur zur Hälfte. Der Mann, den die Regierung an
     seine Stelle setzt, füllt sie nie ganz aus. */
  'us-agent': '<path class="s" stroke-width="12" fill="none" d="M100 12 119.8 72.8 183.7 72.8 132 110.4 151.7 171.2 100 133.6 48.3 171.2 68 110.4 16.3 72.8 80.2 72.8Z"/>'
    + '<path class="f" d="M100 133.6 48.3 171.2 68 110.4 16.3 72.8 80.2 72.8 100 12Z"/>',

  /* Mjölnir von vorn: der breite Kopf mit den abgeschrägten Ecken, der
     lange Stiel darunter, die Schlaufe am Ende. */
  'thor': '<path class="f" d="M52 26h96l24 26v44l-24 26H52L28 96V52Z"/>'
    + '<path class="f" d="M86 122h28v50H86Z"/>'
    + '<path class="f" d="M68 166h64v26H68Z"/>',

  /* Die geballte Faust von vorn: die vier Finger als Block mit
     Knöchellinie, der Daumen quer davor. */
  'hulk': '<path class="f" d="M62 84c0-9 6-15 14-15s14 6 14 15v6h4V72c0-9 6-15 14-15'
    + 's14 6 14 15v18h4V80c0-9 6-15 14-15s14 6 14 15v42c0 28-20 48-48 48h-8'
    + 'c-28 0-48-20-48-48v-24c0-9 6-15 12-15Z"/>'
    + '<path class="f" d="M56 108c-10-6-22-2-26 8s2 22 12 28l20 12Z"/>'
    + '<path class="c" d="M62 116h84v9H62Z"/>',

  /* Die Spinne von oben: der Leib in der Mitte, je vier gebogene Beine. */
  'spider-man': '<path class="f" d="M100 62c9 0 15 8 15 20s-4 42-15 56c-11-14-15-44-15-56'
    + 's6-20 15-20Z"/>'
    + '<path class="s" stroke-width="9" stroke-linecap="round" fill="none" d="'
    + 'M86 78C60 68 40 46 32 18M86 92C56 90 32 76 16 52M88 108C58 118 36 136 24 164'
    + 'M92 122C72 140 60 162 56 190'
    + 'M114 78C140 68 160 46 168 18M114 92C144 90 168 76 184 52M112 108C142 118 164 136 176 164'
    + 'M108 122C128 140 140 162 144 190"/>',

  /* Der Pantherkopf: die Maske mit den spitzen Ohren, den schmalen
     Augen und den Zähnen. */
  'black-panther': '<path class="f" d="M40 18 76 42 34 62Zm120 0-36 24 42 20Z"/>'
    + '<path class="f" d="M100 28c40 0 68 30 68 72 0 44-30 82-68 82S32 144 32 100'
    + 'c0-42 28-72 68-72Z"/>'
    + '<path class="c" d="M56 88 94 98l-2 18-38-12Zm88 0-38 10 2 18 38-12Z"/>'
    + '<path class="c" d="M80 140h40l-8 20H88Z"/>',

  /* Die Ameise von oben: Kopf, Brust, Hinterleib, sechs Beine und zwei
     Fühler. */
  'ant-man': '<ellipse class="f" cx="100" cy="46" rx="19" ry="16"/>'
    + '<ellipse class="f" cx="100" cy="88" rx="15" ry="20"/>'
    + '<ellipse class="f" cx="100" cy="146" rx="28" ry="36"/>'
    + '<path class="s" stroke-width="8" stroke-linecap="round" fill="none" d="'
    + 'M90 34C78 14 62 6 44 4M110 34c12-20 28-28 46-30'
    + 'M86 74 52 54 40 22M84 90 44 90 24 66M86 106 52 124 42 156'
    + 'M114 74 148 54 160 22M116 90 156 90 176 66M114 106 148 124 158 156"/>',

  /* Ava Starrs Maske mit den kantigen Augen, und daneben dieselbe Maske
     noch einmal als bloßer Umriss. Zwei Fassungen derselben Figur, weil
     sie nie ganz an einem Ort ist. */
  'ghost': '<g transform="translate(-26 0)">'
    + '<path class="s" stroke-width="9" fill="none" d="M100 12C144 12 164 44 164 80C164 120 138 160 100 188C62 160 36 120 36 80C36 44 56 12 100 12Z"/></g>'
    + '<path class="f" d="M100 12C144 12 164 44 164 80C164 120 138 160 100 188C62 160 36 120 36 80C36 44 56 12 100 12Z"/>'
    + '<path class="c" d="M58 62 96 74v20L58 84Zm84 0L104 74v20l38-10Z"/>',

  /* Das Auge von Agamotto: die Mandel mit dem Stein und die vier
     Strahlen des Siegels. */
  'doctor-strange': '<path class="s" stroke-width="11" fill="none" d="M18 100'
    + 'c26-34 52-51 82-51s56 17 82 51c-26 34-52 51-82 51S44 134 18 100Z"/>'
    + '<circle class="s" cx="100" cy="100" r="26" stroke-width="10"/>'
    + '<circle class="f" cx="100" cy="100" r="11"/>'
    + '<path class="s" stroke-width="8" d="M100 22V4M100 178v18M22 100H4M178 100h18"/>',

  /* Der Stern der Guardians im Ring, wie ihn die Nova Corps führen. */
  'guardians': '<circle class="s" cx="100" cy="100" r="88" stroke-width="10"/>'
    + '<path class="f" d="M100 22 118 78 178 78 130 112 148 170 100 134 52 170 70 112'
    + ' 22 78 82 78Z"/>',

  /* Der Hala-Stern: acht Zacken um einen Kern. */
  'captain-marvel': '<path class="f" d="M100 4 116 68 152 30 132 82 194 66 138 100'
    + ' 194 134 132 118 152 170 116 132 100 196 84 132 48 170 68 118 6 134 62 100'
    + ' 6 66 68 82 48 30 84 68Z"/>'
    + '<circle class="c" cx="100" cy="100" r="22"/>',

  /* Die Sanduhr der Black Widow: zwei Dreiecke im Ring, dazu die
     Fangschenkel. */
  'black-widow': '<circle class="s" cx="100" cy="100" r="82" stroke-width="10"/>'
    + '<path class="f" d="M62 34h76l-38 62Zm0 132h76l-38-62Z"/>'
    + '<path class="s" stroke-width="8" stroke-linecap="round" fill="none" d="'
    + 'M46 58C28 74 22 90 22 100M154 58c18 16 24 32 24 42M46 142c-18-16-24-32-24-42'
    + 'M154 142c18-16 24-32 24-42"/>',

  /* Yelenas Ampulle mit dem roten Gas, dem Gegenmittel, das die Witwen
     aus der Fremdsteuerung holt. Nicht die Sanduhr: Die trägt Natasha,
     und Yelena ist über den ganzen Film hinweg die mit dem Fläschchen. */
  'yelena': '<path class="s" stroke-width="8" stroke-linecap="round" fill="none"'
    + ' d="M100 24C100 16 90 14 90 4M72 30C72 24 64 22 64 12M128 30c0-6 8-8 8-18"/>'
    + '<path class="f" d="M84 36h32v16H84Z"/>'
    + '<path class="s" stroke-width="9" fill="none" d="M80 52v104a20 20 0 0 0 40 0V52"/>'
    + '<path class="f" d="M80 118h40v38a20 20 0 0 1-40 0Z"/>',

  /* Alexeis Zeichen: die volle Scheibe, aus der der Sowjetstern
     ausgespart ist. Umgekehrt herum gezeichnet, weil ein Stern im Ring
     schon hinter Bucky steht. */
  'red-guardian': '<circle class="f" cx="100" cy="100" r="88"/>'
    + '<path class="c" d="M100 36 114.4 80.2 160.9 80.2 123.3 107.6 137.6 151.8 100 124.4 62.4 151.8 76.7 107.6 39.1 80.2 85.6 80.2Z"/>',

  /* Zwei gekreuzte Schwerter für Antonia Dreykov, die jede Bewegung
     nachmacht, die sie einmal gesehen hat. */
  'taskmaster': '<path class="f" d="M28.5 166.4 35.6 173.5 66 143.1 58.9 136Z'
    + 'M41.1 124.2 77.8 160.9 86.9 151.8 50.2 115.1Z'
    + 'M62.9 127.8 74.2 139.1 170.1 40.4 161.6 31.9ZM161.6 31.9 170.1 40.4 178 24Z'
    + 'M25.7 163.6a9 9 0 1 0 .1 0Z"/>'
    + '<path class="f" d="M164.4 173.5 171.5 166.4 141.1 136 134 143.1Z'
    + 'M122.2 160.9 158.9 124.2 149.8 115.1 113.1 151.8Z'
    + 'M125.8 139.1 137.1 127.8 38.4 31.9 29.9 40.4ZM29.9 40.4 38.4 31.9 22 24Z'
    + 'M161.6 176.3a9 9 0 1 0 .1 0Z"/>',

  /* Die Zielscheibe mit dem Pfeil quer hindurch. */
  'hawkeye': '<circle class="s" cx="100" cy="100" r="86" stroke-width="11"/>'
    + '<circle class="s" cx="100" cy="100" r="54" stroke-width="11"/>'
    + '<circle class="f" cx="100" cy="100" r="22"/>'
    + '<path class="s" stroke-width="9" d="M6 194 176 24"/>'
    + '<path class="f" d="M196 4 150 14 186 50Z"/>',

  /* Lokis Helm: die beiden langen geschwungenen Hörner über dem
     Stirnband. */
  'loki': '<path class="f" d="M80 178C46 168 8 120 40 14 34 90 88 140 106 178Z"/>'
    + '<path class="f" d="M120 178c34-10 72-58 40-164 6 76-48 126-66 164Z"/>'
    + '<path class="f" d="M62 168h76v26H62Z"/>',

  /* Die Krone der Scarlet Witch: die drei Spitzen über dem Reif. */
  'scarlet-witch': '<path class="f" d="M100 8 120 62c16-12 36-16 56-12l-18 42'
    + 'c12 14 18 30 16 48H26c-2-18 4-34 16-48L24 50c20-4 40 0 56 12Z"/>'
    + '<path class="f" d="M30 158h140v26H30Z"/>',

  /* Visions Kopf mit dem Stein in der Stirn und den Schläfenlinien. */
  'vision': '<path class="f" d="M100 12c34 0 56 22 56 52v32c0 42-26 80-56 92'
    + '-30-12-56-50-56-92V64c0-30 22-52 56-52Z"/>'
    + '<path class="c" d="M100 42 120 60 114 92H86L80 60Z"/>'
    + '<path class="c" d="M40 108h32v10H40Zm88 0h32v10h-32Z"/>',

  /* Der rote Stern des Winter Soldier zwischen den Fugen der Armplatten. */
  /* Ultrons Kopf: die kantige Platte, die schmalen schrägen Augen und
     das Gitter vor dem Mund. Der Umriss läuft nach unten spitz zu, damit
     er sich von der runderen Helmmaske Iron Mans unterscheidet. */
  'ultron': '<path class="f" d="M100 14 152 44 160 92 142 128 100 186 58 128 40 92 48 44Z"/>'
    + '<path class="c" d="M56 74 92 88v14L56 90Zm88 0L108 88v14l36-12Z"/>'
    + '<path class="c" d="M78 122h7v20h-7Zm12 0h7v20h-7Zm12 0h7v20h-7Zm12 0h7v20h-7Z"/>',

  /* Quicksilvers Zeichen: zwei ineinander laufende Winkel, wie die
     Striche, die hinter einem Läufer stehen bleiben. Kein Blitz, den
     tragen auf dieser Seite schon Ms. Marvel und die Thunderbolts. */
  'quicksilver': '<path class="f" d="M104 22 186 100 104 178H74L156 100 74 22Z"/>'
    + '<path class="f" d="M44 22 126 100 44 178H14L96 100 14 22Z"/>',

  'winter-soldier': '<circle class="s" cx="100" cy="100" r="88" stroke-width="9"/>'
    + '<path class="f" d="M100 30 120 84 178 84 131 117 149 172 100 138 51 172 69 117'
    + ' 22 84 80 84Z"/>'
    + '<path class="s" stroke-width="8" fill="none" d="M27 56h146M27 144h146"/>',

  /* Falcons Flügelpaar mit den gestaffelten Federn. */
  'falcon': '<path class="f" d="M100 42c7 0 12 5 12 12v92l-12 20-12-20V54c0-7 5-12 12-12Z"/>'
    + '<path class="f" d="M84 62 6 38l20 28-14 4 28 22-14 6 30 18-8 8 36 14Z"/>'
    + '<path class="f" d="M116 62 194 38l-20 28 14 4-28 22 14 6-30 18 8 8-36 14Z"/>',

  /* Das Zeichen der Eternals: der Kreis der Ewigkeit mit den Strahlen
     des kosmischen Ursprungs. */
  'eternals': '<circle class="s" cx="100" cy="100" r="46" stroke-width="10"/>'
    + '<circle class="s" cx="100" cy="100" r="80" stroke-width="6"/>'
    + '<path class="s" stroke-width="9" d="M100 2v42M100 156v42M2 100h42M156 100h42'
    + 'M31 31 61 61M139 139l30 30M169 31 139 61M61 139l-30 30"/>',

  /* Der Halbmond des Moon Knight. */
  'moon-knight': '<path class="f" d="M136 8a92 92 0 1 0 0 184 108 108 0 0 1 0-184Z"/>',

  /* Der Blitz der Ms. Marvel im Sechseck. */
  'ms-marvel': '<path class="s" stroke-width="10" fill="none" d="M100 8 176 52v96l-76 44'
    + '-76-44V52Z"/>'
    + '<path class="f" d="M116 34 68 108h26l-12 58 50-78H106Z"/>',

  /* She-Hulks Zeichen: die Faust, schlanker als die ihres Vetters, im
     Ring. */
  'she-hulk': '<circle class="s" cx="100" cy="100" r="88" stroke-width="10"/>'
    + '<path class="f" d="M74 88c0-7 5-12 11-12s11 5 11 12v5h3V78c0-7 5-12 11-12s11 5 11 12'
    + 'v14h3v-8c0-7 5-12 11-12s11 5 11 12v33c0 22-16 38-38 38h-6c-22 0-38-16-38-38v-19'
    + 'c0-7 5-12 10-12Z"/>'
    + '<path class="f" d="M69 107c-8-5-17-2-20 6s2 17 9 22l16 9Z"/>'
    + '<path class="c" d="M74 113h66v7H74Z"/>',

  /* Der Adler von S.H.I.E.L.D. mit ausgebreiteten Schwingen. */
  'shield': '<circle class="s" cx="100" cy="100" r="88" stroke-width="9"/>'
    + '<path class="f" d="M100 32c8 0 13 6 13 13v8l72-24-24 32 22 8-40 20 20 14-50 12'
    + 'v18l-13 30-13-30v-18l-50-12 20-14-40-20 22-8-24-32 72 24v-8c0-7 5-13 13-13Z"/>',

  /* Deadpools Maske: die beiden kantigen Augenfelder in der Kapuze. */
  'deadpool': '<path class="f" d="M100 10c40 0 68 28 68 68v34c0 46-30 78-68 78'
    + 's-68-32-68-78V78c0-40 28-68 68-68Z"/>'
    + '<path class="c" d="M46 72 92 58l4 40-46 12Zm108 0L108 58l-4 40 46 12Z"/>',

  /* Das X der X-Men im Ring. */
  'x-men': '<circle class="s" cx="100" cy="100" r="88" stroke-width="12"/>'
    + '<path class="f" d="M46 24h34l20 44 20-44h34l-36 76 36 76h-34l-20-44-20 44H46'
    + 'l36-76Z"/>',

  /* Wolverines drei Krallen. */
  'wolverine': '<path class="f" d="M32 8 62 150l-16 34-14-34Z"/>'
    + '<path class="f" d="M100 2l14 148-14 40-14-40Z"/>'
    + '<path class="f" d="M168 8l-14 142 16 34 14-34Z"/>',

  /* Reeds Zeichen: das Band, das durch sich selbst zurückläuft und
     nirgends aufhört. Kein Knoten und keine gedehnte Vier, beides wurde
     beim Zeichnen zum Hufeisen. */
  'mister-fantastic': '<path class="s" stroke-width="21" fill="none" d="'
    + 'M100 100C74 66 34 68 34 100C34 132 74 134 100 100'
    + 'C126 66 166 68 166 100C166 132 126 134 100 100Z"/>',


  /* Sues Kraftfeld: zwei Ringe aus einzelnen Bögen, mit Lücken
     dazwischen, dazu der Kern. Das Feld ist da und doch nicht ganz zu
     sehen. */
  'invisible-woman': 
    + 'M13.3 84.7A88 88 0 0 1 84.7 13.3M115.3 13.3A88 88 0 0 1 186.7 84.7'
    + 'M132.1 145.9A56 56 0 0 1 67.9 145.9M54.1 132.1A56 56 0 0 1 54.1 67.9'
    + 'M67.9 54.1A56 56 0 0 1 132.1 54.1M145.9 67.9A56 56 0 0 1 145.9 132.1"/>'
    + '<circle class="f" cx="100" cy="100" r="20"/>',


  /* Johnnys Flamme, mit der zweiten Zunge im Inneren. Nicht die Sonne
     Sentrys und nicht der brennende Schädel des Ghost Rider, sondern das
     Feuer allein. */
  'human-torch': '<path class="f" d="M100 4C112 46 148 60 148 106'
    + 'C148 154 126 190 100 196C74 190 52 154 52 106C52 60 88 46 100 4Z"/>'
    + '<path class="c" d="M100 76C108 100 122 110 122 134C122 156 112 174 100 178'
    + 'C88 174 78 156 78 134C78 110 92 100 100 76Z"/>'
    + '<path class="f" d="M100 118C104 130 112 136 112 148C112 160 106 170 100 172'
    + 'C94 170 88 160 88 148C88 136 96 130 100 118Z"/>',


  /* Bens Steinpanzer: der Brocken mit den Platten darin. Keine Faust,
     die tragen auf dieser Seite schon Hulk und She-Hulk.

     Die Risse sind gefüllte Bänder und keine Striche. Klasse c bekommt
     im Stylesheet nur eine Füllung und keine Strichfarbe, ein
     gezeichneter Riss bliebe also stehen. */
  'the-thing': '<path class="f" d="M62 14 146 26 186 78 168 154 96 190 30 152 14 74Z"/>'
    + '<path class="c" d="M86.4 65 141 81.6 143.6 73 89 56.4ZM134.1 71 127 129.9 135.9 131 143 72.1Z'
    + 'M136.1 121.1 79.1 125.9 79.9 134.9 136.9 130.1ZM90 132.1 68.1 86 60 89.9 81.9 136Z'
    + 'M66.5 98.3 98.3 61.5 91.5 55.7 59.7 92.5ZM98 64 76 20 68 24 90 68Z'
    + 'M134.9 81.5 179.5 69.1 177.1 60.5 132.5 72.9Z'
    + 'M125.7 126.5 158.5 154.3 164.3 147.5 131.5 119.7Z'
    + 'M82.5 123.8 55.8 167.5 63.5 172.2 90.2 128.5Z'
    + 'M71.3 88.4 20.4 78.7 18.7 87.6 69.6 97.3Z"/>',

  /* Die Vier der Fantastic Four im Ring. */
  'fantastic-four': '<circle class="s" cx="100" cy="100" r="88" stroke-width="12"/>'
    + '<path class="f" fill-rule="evenodd" d="M112 28h30v78h22v30h-22v34h-30v-34H42v-28Z'
    + 'm0 78V56l-38 50Z"/>',

  /* Die beiden D von Daredevil, ineinandergestellt. */
  'daredevil': '<path class="f" fill-rule="evenodd" d="M22 22h48c46 0 78 32 78 78s-32 78-78 78'
    + 'H22Zm38 34v88h10c26 0 42-18 42-44s-16-44-42-44Z"/>'
    + '<path class="f" d="M104 22h26c46 0 74 32 74 78s-28 78-74 78h-26'
    + 'c34-16 54-46 54-78s-20-62-54-78Z"/>',

  /* Der Totenkopf des Punisher, breit und mit den langen Zähnen, die
     bis über die halbe Höhe hinabreichen. */
  'punisher': '<path class="f" d="M100 10c32 0 58 24 58 56 0 17-5 30-14 39'
    + 'l2 58-11-32-11 34-11-34-11 36-11-36-11 34-11-34-11 32 2-58'
    + 'c-9-9-14-22-14-39 0-32 26-56 58-56Z"/>'
    + '<path class="c" d="M56 48 94 62l-3 30-38-10Zm88 0-38 14 3 30 38-10Z"/>',

  /* Der brennende Schädel des Ghost Rider: der Flammenkranz über der
     Stirn, darunter der Schädel. */
  'ghost-rider': '<path class="f" d="M100 2 118 46 138 14l6 40 26-24-6 42 34-14-24 36'
    + 'H32L8 58l34 14-6-42 26 24 6-40 20 32Z"/>'
    + '<path class="f" d="M100 64c32 0 56 22 56 52 0 15-5 27-14 36l5 46-17-28-9 26-11-24'
    + '-10 26-10-26-11 24-9-26-17 28 5-46c-9-9-14-21-14-36 0-30 24-52 56-52Z"/>'
    + '<path class="c" d="M52 112 94 122l-3 26-38-10Zm96 0-42 10 3 26 38-10Z"/>',

  /* Sentrys Sonne: der volle Kern und zehn Flammen, die sich alle in
     dieselbe Richtung legen. Flammen statt gerader Zacken sind Absicht.
     Ein gleichmäßiger Stern stünde zu nah bei Captain Marvel, ein dünner
     Ring zu nah bei den Eternals. */
  'sentry': '<circle class="f" cx="100" cy="100" r="40"/>'
    + '<path class="f" d="M92.1 62.8Q109.6 26.9 136 11Q122.1 33.9 107.9 62.8Z'
    + 'M115.5 65.3Q150.7 46.5 181.4 49.1Q156.7 59.5 128.2 74.6Z'
    + 'M132.9 81Q172.5 86.6 195.8 106.7Q169.7 100.6 137.8 96Z'
    + 'M137.8 104Q166.5 131.7 173.5 161.7Q156 141.4 132.9 119Z'
    + 'M128.2 125.4Q135.2 164.8 123.2 193.1Q121 166.5 115.5 134.7Z'
    + 'M107.9 137.2Q90.4 173.1 64 189Q77.9 166.1 92.1 137.2Z'
    + 'M84.5 134.7Q49.3 153.5 18.6 150.9Q43.3 140.5 71.8 125.4Z'
    + 'M67.1 119Q27.5 113.4 4.2 93.3Q30.3 99.4 62.2 104Z'
    + 'M62.2 96Q33.5 68.3 26.5 38.3Q44 58.6 67.1 81Z'
    + 'M71.8 74.6Q64.8 35.2 76.8 6.9Q79 33.5 84.5 65.3Z"/>',

  /* Agathas Zeichen: die drei Monde der Hexen, zunehmend, voll und
     abnehmend. */
  'agatha': '<circle class="f" cx="100" cy="100" r="40"/>'
    + '<path class="f" d="M60 50a50 50 0 1 0 0 100 62 62 0 0 1 0-100Z"/>'
    + '<path class="f" d="M140 50a50 50 0 1 1 0 100 62 62 0 0 0 0-100Z"/>',

  /* Echos Handabdruck, das Zeichen der Choctaw-Ahnin. */
  'echo': '<path class="f" d="M78 92V44c0-10 15-10 15 0v42h7V28c0-10 15-10 15 0v58h7V40'
    + 'c0-10 15-10 15 0v50h7V66c0-10 15-10 15 0v56c0 42-24 72-54 72-19 0-33-10-42-30'
    + 'L38 112c-6-12 8-22 16-12l14 16c4-8 6-16 10-24Z"/>'
    + '<path class="c" d="M62 104c-8-8-16-4-14 4l14 22Z"/>',

  /* Ironhearts Zeichen: das Herz im Ring der Rüstung. */
  'ironheart': '<circle class="s" cx="100" cy="100" r="86" stroke-width="11"/>'
    + '<path class="f" d="M100 168 48 118c-16-16-16-42 0-56s40-12 52 6c12-18 36-20 52-6'
    + 's16 40 0 56Z"/>',

  /* Wonder Mans W in der Raute. */
  'wonder-man': '<path class="s" stroke-width="11" fill="none" d="M100 8 192 100 100 192'
    + ' 8 100Z"/>'
    + '<path class="f" d="M40 66h26l14 52 16-52h8l16 52 14-52h26l-28 92h-20l-12-42'
    + '-12 42H68Z"/>',

  /* Das Zeichen der Zehn Ringe als Organisation: der Ring im Ring. */
  'ten-rings': '<circle class="s" cx="100" cy="100" r="86" stroke-width="10"/>'
    + '<circle class="s" cx="100" cy="100" r="44" stroke-width="10"/>'
    + '<path class="s" stroke-width="9" d="M100 14v42M100 144v42M14 100h42M144 100h42"/>',

  /* Der Totenkopf mit den sechs Armen. Abgeschlagen wachsen zwei nach,
     deshalb greifen sie unter dem Schädel hervor und krümmen sich nach
     außen. */
  'hydra': '<path class="f" d="M84.7 89.3 78.5 88.8 72.4 88.8 66.5 89.3 60.8 90.1 55.3 91.5 50 93.2 45 95.3 40.3 97.9 35.9 100.8 32 104 28.4 107.7 25.3 111.6 22.7 115.8 20.6 120.2 19.1 124.9 18.1 129.8 17.6 134.8 17.8 140 18.5 145.3 19.7 150.7 21.6 156.3 24 162 24 162 22.7 156 22.1 150.3 22 145 22.5 140.1 23.5 135.7 24.9 131.6 26.8 128 28.9 124.8 31.4 121.9 34.1 119.5 37.1 117.3 40.3 115.6 43.6 114.1 47.2 112.9 50.9 112.1 54.7 111.5 58.7 111.3 62.7 111.3 66.8 111.7 71 112.4 75.2 113.4 79.3 114.7Z'
    + 'M120.7 114.7 124.8 113.4 129 112.4 133.2 111.7 137.3 111.3 141.3 111.3 145.3 111.5 149.1 112.1 152.8 112.9 156.4 114.1 159.7 115.6 162.9 117.3 165.9 119.5 168.6 121.9 171.1 124.8 173.2 128 175.1 131.6 176.5 135.7 177.5 140.1 178 145 177.9 150.3 177.3 156 176 162 176 162 178.4 156.3 180.3 150.7 181.5 145.3 182.2 140 182.4 134.8 181.9 129.8 180.9 124.9 179.4 120.2 177.3 115.8 174.7 111.6 171.6 107.7 168 104 164.1 100.8 159.7 97.9 155 95.3 150 93.2 144.7 91.5 139.2 90.1 133.5 89.3 127.6 88.8 121.5 88.8 115.3 89.3Z'
    + 'M78.6 97.3 74.2 101.2 70 105.3 65.9 109.6 62.1 114 58.5 118.5 55.2 123.2 52.2 127.9 49.4 132.8 47 137.6 45 142.5 43.3 147.4 42 152.3 41.2 157.1 40.8 161.9 40.9 166.5 41.5 170.9 42.6 175.2 44.3 179.2 46.5 182.9 49.1 186.3 52.3 189.3 56 192 56 192 53.2 188.5 51.1 184.9 49.6 181.3 48.8 177.7 48.4 174.1 48.6 170.5 49.1 166.9 50.1 163.3 51.5 159.7 53.2 156.2 55.2 152.6 57.6 149 60.2 145.5 63.1 142.1 66.3 138.7 69.7 135.4 73.3 132.2 77.1 129.1 81 126.2 85 123.5 89.2 121 93.4 118.7Z'
    + 'M106.6 118.7 110.8 121 115 123.5 119 126.2 122.9 129.1 126.7 132.2 130.3 135.4 133.7 138.7 136.9 142.1 139.8 145.5 142.4 149 144.8 152.6 146.8 156.2 148.5 159.7 149.9 163.3 150.9 166.9 151.4 170.5 151.6 174.1 151.2 177.7 150.4 181.3 148.9 184.9 146.8 188.5 144 192 144 192 147.7 189.3 150.9 186.3 153.5 182.9 155.7 179.2 157.4 175.2 158.5 170.9 159.1 166.5 159.2 161.9 158.8 157.1 158 152.3 156.7 147.4 155 142.5 153 137.6 150.6 132.8 147.8 127.9 144.8 123.2 141.5 118.5 137.9 114 134.1 109.6 130 105.3 125.8 101.2 121.4 97.3Z'
    + 'M80.1 106.8 78.7 111.6 77.3 116.4 76 121.3 74.8 126.2 73.6 131.1 72.6 136 71.8 140.9 71 145.8 70.5 150.6 70.2 155.3 70.1 159.9 70.2 164.4 70.6 168.7 71.2 172.9 72.2 176.9 73.5 180.6 75.1 184.1 77.1 187.2 79.3 190 81.9 192.4 84.8 194.4 88 196 88 196 85.6 193.5 83.7 190.8 82.3 188 81.3 185.1 80.7 182.1 80.4 179 80.4 175.8 80.7 172.4 81.2 168.9 82 165.3 82.9 161.6 84.1 157.8 85.5 153.9 87.1 149.9 88.8 145.9 90.6 141.8 92.6 137.7 94.7 133.5 96.9 129.4 99.2 125.3 101.5 121.2 103.9 117.2Z'
    + 'M96.1 117.2 98.5 121.2 100.8 125.3 103.1 129.4 105.3 133.5 107.4 137.7 109.4 141.8 111.2 145.9 112.9 149.9 114.5 153.9 115.9 157.8 117.1 161.6 118 165.3 118.8 168.9 119.3 172.4 119.6 175.8 119.6 179 119.3 182.1 118.7 185.1 117.7 188 116.3 190.8 114.4 193.5 112 196 112 196 115.2 194.4 118.1 192.4 120.7 190 122.9 187.2 124.9 184.1 126.5 180.6 127.8 176.9 128.8 172.9 129.4 168.7 129.8 164.4 129.9 159.9 129.8 155.3 129.5 150.6 129 145.8 128.2 140.9 127.4 136 126.4 131.1 125.2 126.2 124 121.3 122.7 116.4 121.3 111.6 119.9 106.8Z"/>'
    + '<path class="f" d="M100 10C128 10 143 29 143 54C143 71 135 84 122 92'
    + 'V108H78V92C65 84 57 71 57 54C57 29 72 10 100 10Z"/>'
    + '<path class="c" d="M70 48 95 58V76L70 66Zm60 0L105 58v18l25-10Z"/>'
    + '<path class="c" d="M100 80 110 98H90Z"/>',

  /* Der Skrull-Kopf mit den spitzen Ohren und dem gefurchten Kinn. */
  'skrull': '<path class="f" d="M100 20c30 0 50 20 50 48 0 8-2 16-6 22 14-6 26-4 36 6'
    + '-14 2-24 10-30 22-10 26-28 46-50 56-22-10-40-30-50-56-6-12-16-20-30-22'
    + 'c10-10 22-12 36-6-4-6-6-14-6-22 0-28 20-48 50-48Z"/>'
    + '<path class="c" d="M72 62c10-6 20-2 22 6s-6 16-16 18-18-2-20-10 4-12 14-14Z'
    + 'M128 62c-10-6-20-2-22 6s6 16 16 18 18-2 20-10-4-12-14-14Z"/>'
    + '<path class="c" d="M92 148h16l-2 24h-12Z"/>',

  /* Der Infinity-Handschuh im Ring: die vier Finger, der Daumen rechts
     daneben, und die sechs Steine als Löcher darin. Nicht Thanos selbst,
     sondern das Ding, um das sich bei ihm alles dreht - so wie beim
     Captain das Schild steht und nicht der Mann. */
  'thanos': '<circle class="s" cx="100" cy="100" r="88" stroke-width="12"/>'
    + '<rect class="f" x="56" y="50" width="16" height="42" rx="7"/>'
    + '<rect class="f" x="73" y="46" width="16" height="46" rx="7"/>'
    + '<rect class="f" x="90" y="46" width="16" height="46" rx="7"/>'
    + '<rect class="f" x="107" y="50" width="16" height="42" rx="7"/>'
    + '<rect class="f" x="127" y="80" width="21" height="36" rx="10"/>'
    + '<rect class="f" x="54" y="86" width="86" height="66" rx="14"/>'
    + '<rect class="f" x="68" y="148" width="58" height="16" rx="5"/>'
    + '<circle class="c" cx="64" cy="80" r="5.5"/>'
    + '<circle class="c" cx="81" cy="76" r="5.5"/>'
    + '<circle class="c" cx="98" cy="76" r="5.5"/>'
    + '<circle class="c" cx="115" cy="80" r="5.5"/>'
    + '<circle class="c" cx="137.5" cy="96" r="5.5"/>'
    + '<circle class="c" cx="94" cy="118" r="12"/>',

  /* Das Haus selbst, wenn zu einer Figur nichts Näheres bekannt ist:
     der Block mit dem M, wie ihn die Marke führt. */
  'marvel': '<path class="s" stroke-width="13" fill="none" d="M14 42h172v116H14Z"/>'
    + '<path class="f" d="M50 70h28l22 52 22-52h28v60h-24V96l-16 34h-20l-16-34v34H50Z"/>',
};

/* ---------- Wer welches Zeichen trägt ----------

   Die Ausnahmen von EMBLEM_BY_FILM. Zwei Sorten stehen hier: Figuren
   mit einem Wappen, das nur ihnen gehört, und Figuren, deren erster
   Auftritt sie sonst unter ein falsches Wappen stellte. Ronan kommt
   zuerst in Captain Marvel vor und gehört trotzdem zu den Guardians.

   Wer fehlt, erbt das Zeichen seines ersten Auftritts.

   Der Schlüssel ist der Charakter-Slug aus charSlug() (js/chars.js). */
const EMBLEM_BY_CHAR = {
  /* Iron Man und sein Umfeld */
  'tony-stark': 'iron-man',
  'james-rhodes': 'iron-man',
  'pepper-potts': 'iron-man',
  'obadiah-stane': 'iron-man',
  'ivan-vanko-whiplash': 'iron-man',
  'aldrich-killian': 'iron-man',
  'justin-hammer': 'iron-man',
  'howard-stark': 'iron-man',
  'riri-williams': 'ironheart',

  /* Captain America */
  'steve-rogers': 'captain-america',
  'sam-wilson': 'falcon',
  'bucky-barnes': 'winter-soldier',
  'john-walker': 'us-agent',
  'isaiah-bradley': 'captain-america',
  'peggy-carter': 'captain-america',
  'sharon-carter': 'shield',

  /* Thor und Asgard */
  'thor': 'thor',
  'jane-foster': 'thor',
  'loki': 'loki',
  'sylvie': 'loki',
  'odin': 'thor',
  'frigga': 'thor',
  'heimdall': 'thor',
  'valkyrie': 'thor',
  'hela': 'thor',
  'sif': 'thor',
  'korg': 'thor',
  'gorr': 'thor',
  'eitri': 'thor',

  /* Hulk */
  'bruce-banner': 'hulk',
  'jennifer-walters-she-hulk': 'she-hulk',
  'thaddeus-ross': 'hulk',
  'emil-blonsky-abomination': 'hulk',
  'betty-ross': 'hulk',
  'samuel-sterns-the-leader': 'hulk',
  'skaar': 'hulk',

  /* Spider-Man */
  'peter-parker': 'spider-man',
  'may-parker': 'spider-man',
  'michelle-jones-watson': 'spider-man',
  'ned-leeds': 'spider-man',
  'flash-thompson': 'spider-man',

  /* Black Panther und Wakanda */
  't-challa': 'black-panther',
  'shuri': 'black-panther',
  'okoye': 'black-panther',
  'nakia': 'black-panther',
  'm-baku': 'black-panther',
  'koenigin-ramonda': 'black-panther',
  'erik-killmonger': 'black-panther',
  'ayo': 'black-panther',
  /* Beide treten zuerst in Civil War auf und trügen sonst Steve Rogers'
     Schild, obwohl sie nach Wakanda gehören. */
  't-chaka': 'black-panther',
  'everett-ross': 'black-panther',

  /* Ant-Man */
  'scott-lang': 'ant-man',
  'hope-van-dyne': 'ant-man',
  'hank-pym': 'ant-man',
  'janet-van-dyne': 'ant-man',
  'cassie-lang': 'ant-man',
  'luis': 'ant-man',
  'darren-cross': 'ant-man',
  'ava-starr': 'ghost',
  'dave': 'ant-man',
  'kurt-goreshter': 'ant-man',
  'jim-paxton': 'ant-man',
  'maggie-lang': 'ant-man',
  'jimmy-woo': 'ant-man',

  /* Doctor Strange */
  'stephen-strange': 'doctor-strange',
  'wong': 'doctor-strange',
  'the-ancient-one': 'doctor-strange',
  'christine-palmer': 'doctor-strange',
  'karl-mordo': 'doctor-strange',
  'america-chavez': 'doctor-strange',
  'clea': 'doctor-strange',

  /* Guardians */
  'peter-quill': 'guardians',
  'gamora': 'guardians',
  'drax': 'guardians',
  'rocket': 'guardians',
  'groot': 'guardians',
  'nebula': 'guardians',
  'mantis': 'guardians',
  'yondu': 'guardians',
  'kraglin': 'guardians',
  'adam-warlock': 'guardians',
  'cosmo': 'guardians',
  /* Beide kommen erst über Umwege zu den Guardians: Ronan tritt zuerst
     in Captain Marvel auf, der Collector im Abspann von Thor 2. Ohne
     diese Zeilen stünden sie vor dem Stern von Carol Danvers und vor
     Thors Hammer. */
  'ronan': 'guardians',
  'the-collector': 'guardians',
  'gamora-2014': 'guardians',
  'nebula-2014': 'guardians',

  /* Captain Marvel */
  'carol-danvers': 'captain-marvel',
  'monica-rambeau': 'captain-marvel',
  'maria-rambeau': 'captain-marvel',
  'goose': 'captain-marvel',
  'korath-der-verfolger': 'captain-marvel',
  'kamala-khan-ms-marvel': 'ms-marvel',

  /* S.H.I.E.L.D. */
  'nick-fury': 'shield',
  'maria-hill': 'shield',
  'phil-coulson': 'shield',
  'valentina-allegra-de-fontaine': 'shield',
  'mel': 'shield',
  'talos': 'skrull',
  'gravik': 'skrull',

  /* HYDRA

     Nur, wer dazugehört. Bucky Barnes steht nicht hier: Er war ihr
     Werkzeug und nicht ihr Mann, und sein Zeichen bleibt das des Winter
     Soldier. */
  'johann-schmidt-red-skull': 'hydra',
  'arnim-zola': 'hydra',
  'wolfgang-von-strucker': 'hydra',
  'alexander-pierce': 'hydra',
  'crossbones': 'hydra',

  /* Die übrigen Avengers */
  'natasha-romanoff': 'black-widow',
  'yelena-belova': 'yelena',
  'taskmaster': 'taskmaster',
  'alexei': 'red-guardian',
  'melina-vostokoff': 'black-widow',
  'clint-barton': 'hawkeye',
  'kate-bishop': 'hawkeye',
  'laura-barton': 'hawkeye',
  'cooper-barton': 'hawkeye',
  'lila-barton': 'hawkeye',
  'nathaniel-barton': 'hawkeye',
  'wanda-maximoff': 'scarlet-witch',
  'agatha-harkness': 'agatha',
  /* Billy tritt zuerst in WandaVision auf und erbte darüber Wandas
     Zeichen. Er gehört aber zu Agatha, bei der er den ganzen Weg über
     die Straße geht. */
  'billy-maximoff-wiccan': 'agatha',
  'vision': 'vision',
  'white-vision': 'vision',
  'ultron': 'ultron',
  'pietro-maximoff': 'quicksilver',

  /* Thanos und die Seinen

     Der Handschuh steht hinter Thanos selbst, hinter dem Schwarzen Orden
     als seinen Kindern und hinter dem Anderen, der in Avengers noch für
     ihn spricht. Beide Zeitlinien tragen dasselbe Zeichen: Der Thanos von
     2014 ist eine eigene Figur, aber derselbe Mann mit demselben Ziel.

     Nicht dabei sind seine Töchter. Gamora und Nebula sind seine Kinder
     wie die anderen, aber sie laufen über und gehören seit ihrem ersten
     Auftritt zu den Guardians; ihr Zeichen bleibt deren Zeichen. Ebenso
     Ronan, der als Kree mit ihm paktiert und ihn verrät, und sein Bruder
     Eros, der bei den Eternals steht. */
  'thanos': 'thanos',
  'thanos-2014': 'thanos',
  'ebony-maw': 'thanos',
  'ebony-maw-2014': 'thanos',
  'corvus-glaive': 'thanos',
  'corvus-glaive-2014': 'thanos',
  'proxima-midnight': 'thanos',
  'proxima-midnight-2014': 'thanos',
  'cull-obsidian': 'thanos',
  'cull-obsidian-2014': 'thanos',
  'der-andere': 'thanos',

  /* Die Straße von New York */
  'matt-murdock-daredevil': 'daredevil',
  'wilson-fisk-kingpin': 'daredevil',
  'karen-page': 'daredevil',
  'frank-castle-punisher': 'punisher',
  'marc-spector-steven-grant-moon-knight': 'moon-knight',
  'maya-lopez-echo': 'echo',

  /* Mutanten, Söldner und die Zehn Ringe */
  'wade-wilson-deadpool': 'deadpool',
  'logan-wolverine': 'wolverine',
  'charles-xavier-professor-x': 'x-men',
  'scott-summers-cyclops': 'x-men',
  'erik-lehnsherr-magneto': 'x-men',
  'raven-darkhoelme-mystique': 'x-men',
  'kurt-wagner-nightcrawler': 'x-men',
  /* Jean Grey steht beim Netz und nicht beim X: Sie kommt in Brand New
     Day vor und bei den X-Men, und gezeigt wird die Fassung aus dem
     Spider-Man-Film. */
  'jean-grey': 'spider-man',
  'shang-chi': 'ten-rings',
  'katy': 'ten-rings',
  'wenwu-mandarin': 'ten-rings',
  'xialing': 'ten-rings',

  /* Fantastic Four */
  'reed-richards-mister-fantastic': 'mister-fantastic',
  'sue-storm-invisible-woman': 'invisible-woman',
  'johnny-storm-human-torch': 'human-torch',
  'ben-grimm-the-thing': 'the-thing',
  /* Der Reed aus Erde-838 ist derselbe Mann und trägt dasselbe Zeichen.
     Die Vier bleibt bei Doom, der gegen die vier antritt und keinem von
     ihnen gehört. */
  'reed-richards-838': 'mister-fantastic',
  'doctor-doom': 'fantastic-four',

  /* Der Rest */
  'simon-williams': 'wonder-man',
  'bob-sentry': 'sentry',
  'trevor-slattery': 'ten-rings',
  'joaquin-torres-falcon': 'falcon',
  'g-iah': 'skrull',
  'ulysses-klaue': 'black-panther',

  /* Wer zu Stark gehört, aber sein Bild aus einem fremden Film hat:
     Happy Hogan steht in Spider-Man-Filmen vor der Kamera und bekäme
     von dort die Spinne, obwohl er seit dem ersten Iron Man Starks
     Fahrer ist. */
  'happy-hogan': 'iron-man',

  /* Die Varianten aus anderen Universen. Sie sind eigene Figuren, und
     der Film, in dem sie auftreten, gehört meist einer anderen Reihe:
     Mister Fantastic der Erde-838 steht in einem Doctor-Strange-Film,
     das Zeichen dahinter ist trotzdem die Vier. */
  'peter-parker-maguire': 'spider-man',
  'peter-parker-garfield': 'spider-man',
  'peggy-carter-838': 'captain-america',
  'maria-rambeau-838': 'captain-marvel',
  'karl-mordo-838': 'doctor-strange',
};

/* ---------- Welcher Film welches Zeichen führt ----------

   Die Regel für alle, die kein eigenes Wappen tragen. Der Schlüssel ist
   der Film-Slug aus data.js, und nachgesehen wird unter dem ersten
   Auftritt der Figur.

   Ein Film ohne Zeile hier schickt seine Figuren auf das rote Zeichen
   der Marke. Wer also einen Titel neu aufnimmt, trägt ihn auch hier
   ein. */
const EMBLEM_BY_FILM = {
  'iron-man': 'iron-man',
  'iron-man-2': 'iron-man',
  'iron-man-3': 'iron-man',
  'the-incredible-hulk': 'hulk',
  'thor': 'thor',
  'thor-the-dark-world': 'thor',
  'thor-ragnarok': 'thor',
  'thor-love-and-thunder': 'thor',
  'captain-america-the-first-avenger': 'captain-america',
  'captain-america-the-winter-soldier': 'captain-america',
  'captain-america-civil-war': 'captain-america',
  'captain-america-brave-new-world': 'captain-america',
  'the-falcon-and-the-winter-soldier': 'falcon',
  'guardians-of-the-galaxy': 'guardians',
  'guardians-of-the-galaxy-vol-2': 'guardians',
  'guardians-of-the-galaxy-vol-3': 'guardians',
  'ant-man': 'ant-man',
  'ant-man-and-the-wasp': 'ant-man',
  'ant-man-and-the-wasp-quantumania': 'ant-man',
  'black-widow': 'black-widow',
  'black-panther': 'black-panther',
  'black-panther-wakanda-forever': 'black-panther',
  'black-panther-3': 'black-panther',
  'spider-man-homecoming': 'spider-man',
  'spider-man-far-from-home': 'spider-man',
  'spider-man-no-way-home': 'spider-man',
  'spider-man-brand-new-day': 'spider-man',
  'doctor-strange': 'doctor-strange',
  'doctor-strange-in-the-multiverse-of-madness': 'doctor-strange',
  'captain-marvel': 'captain-marvel',
  'the-marvels': 'captain-marvel',
  'ms-marvel': 'ms-marvel',
  'loki': 'loki',
  'wandavision': 'scarlet-witch',
  'agatha-all-along': 'agatha',
  'visionquest': 'vision',
  'shang-chi': 'ten-rings',
  'eternals': 'eternals',
  'hawkeye': 'hawkeye',
  'moon-knight': 'moon-knight',
  'she-hulk': 'she-hulk',
  'secret-invasion': 'skrull',
  'echo': 'echo',
  'daredevil-born-again': 'daredevil',
  'the-punisher-one-last-kill': 'punisher',
  'ironheart': 'ironheart',
  'the-fantastic-four-first-steps': 'fantastic-four',
  'wonder-man': 'wonder-man',
  'deadpool-and-wolverine': 'deadpool',
  'x-men': 'x-men',
  'ghost-rider': 'ghost-rider',
};

/* ---------- Die Farbe der Bänder ----------

   Zu jedem Zeichen ein Farbpaar: der dunkle Ton, in dem der Keil unten
   steht, und der helle, in dem das Band oben und das Zeichen selbst
   liegen. Beides sind Töne der Figur und nicht der Phase, in der ihr
   Film läuft. Die Phasenfarben gehören der Timeline, die Charakterseite
   hält sich von ihnen fern.

   Die dunkle Farbe steht als voller Keil da und muss deshalb kräftig
   genug für weiße Schrift sein. Die helle liegt nur als Hauch auf dem
   weißen Grund und darf ruhig satt sein, die Bühne verdünnt sie
   ohnehin. */
const EMBLEM_TINT = {
  'iron-man':        ['#8f1420', '#c8102e'],
  'ironheart':       ['#8a1538', '#d21f4b'],
  'captain-america': ['#12325e', '#1f5fa8'],
  'winter-soldier':  ['#2c3b4a', '#4d6a86'],
  'falcon':          ['#8c3b12', '#d1631f'],
  'thor':            ['#1e3a63', '#3f74b8'],
  'loki':            ['#1f5138', '#2f7d52'],
  'hulk':            ['#1f5124', '#3f8a3a'],
  'she-hulk':        ['#2b6130', '#54a04a'],
  'spider-man':      ['#8c1119', '#d02a32'],
  'black-panther':   ['#2a1b47', '#5b3d94'],
  'ant-man':         ['#7a2c14', '#c25a26'],
  'doctor-strange':  ['#6b2a12', '#c2551f'],
  'guardians':       ['#5a2372', '#9b47b8'],
  'captain-marvel':  ['#8c4a08', '#dd7d10'],
  'ms-marvel':       ['#8c3a05', '#e0700c'],
  'black-widow':     ['#3a1216', '#8e2028'],
  'hawkeye':         ['#5c1f24', '#a83b3f'],
  'yelena':          ['#3f4a1c', '#8a9e33'],
  'red-guardian':    ['#5e1214', '#9c2b22'],
  'taskmaster':      ['#5c4a24', '#a89040'],
  'ghost':           ['#2d4a4a', '#6f9c9c'],
  'us-agent':        ['#232f42', '#556b8c'],
  'scarlet-witch':   ['#5f0f22', '#a81f3f'],
  'agatha':          ['#3c1a52', '#7c3fa0'],
  'vision':          ['#6a1030', '#b81f52'],
  'shield':          ['#1b2c3d', '#3e6183'],
  'skrull':          ['#1f4a2c', '#3d8a54'],
  'hydra':           ['#16301f', '#2a5c34'],
  'ultron':          ['#3a3a3f', '#82828c'],
  'quicksilver':     ['#155a63', '#2ba7bd'],
  'ten-rings':       ['#5c2410', '#a8481f'],
  'eternals':        ['#0f3a44', '#1f7d90'],
  'moon-knight':     ['#22283a', '#5a6488'],
  'echo':            ['#5c2a10', '#a8541f'],
  'daredevil':       ['#5c0f14', '#a81f26'],
  'punisher':        ['#1a1a1c', '#4a4a50'],
  'deadpool':        ['#7a0f14', '#c41f26'],
  'wolverine':       ['#7a5a08', '#c99a12'],
  'x-men':           ['#1f3352', '#42639e'],
  'fantastic-four':  ['#123a63', '#2470b8'],
  'mister-fantastic':['#173f66', '#2d78c0'],
  'invisible-woman': ['#33356e', '#6a6fd0'],
  'human-torch':     ['#8f1c05', '#e8480a'],
  'the-thing':       ['#5a3a1c', '#9c6a35'],
  'sentry':          ['#7a6408', '#e5c520'],
  'wonder-man':      ['#6b2a52', '#b8479e'],
  'ghost-rider':     ['#5c2a08', '#c2691f'],
  'thanos':          ['#33174d', '#6b34a3'],
  'marvel':          ['#8c1017', '#e62429'],
};

/* Das Zeichen zu einer Figur.

   charSlug ist der Schlüssel der Figur, filmSlug der ihres ersten
   Auftritts. Der zweite darf fehlen, dann entscheidet allein die Figur.
   Zurück kommt ein Name aus EMBLEM_ART. */
function emblemFor(charSlug, filmSlug) {
  const eigen = EMBLEM_BY_CHAR[charSlug];
  if (eigen && EMBLEM_ART[eigen]) return eigen;
  const vomFilm = filmSlug ? EMBLEM_BY_FILM[filmSlug] : null;
  if (vomFilm && EMBLEM_ART[vomFilm]) return vomFilm;
  return 'marvel';
}

/* Das Farbpaar zu einem Zeichen: [dunkel, hell]. */
function emblemTint(name) {
  return EMBLEM_TINT[name] || EMBLEM_TINT['marvel'];
}

/* ---------- Die Vorlagen ----------

   Ein Wappen entsteht aus einer Vorlage: Sie kommt unter
   assets/emblems/source/<name>.png, und tools/emblems/build-emblems.py
   macht die Maske assets/emblems/<name>.webp daraus, die die Bühne
   dann zeigt.

   Welche Masken es gibt, steht nirgends geschrieben: Die Bühne probiert
   es einfach und merkt sich das Ergebnis. Das erspart eine Liste, die
   bei jeder neuen Datei mitgepflegt werden müsste, und kostet pro
   Zeichen einen einzigen Versuch für die ganze Sitzung.

   Der Rückruf kommt nur, wenn es die Datei wirklich gibt. Fehlt sie,
   kommt er nie, und der Wappenplatz auf der Bühne bleibt leer. */
const EMBLEM_FILE_STATE = new Map();

function emblemFileSrc(name) {
  /* Voll ausgeschrieben und nicht als kurzer Pfad: Der Wert geht als
     Eigenschaft --emblem-src weiter, und dort steht er in einer
     Eigenschaft, die css/style.css benutzt (mask-image). Einen kurzen
     Pfad darin rechnet der Browser nicht vom Dokument aus, sondern von
     der Stildatei - er suchte also unter css/assets/emblems/ und fände
     nichts. Die Maske bliebe leer und das Zeichen unsichtbar, ohne
     Fehlermeldung: eine leere Maske zeigt nichts an, sie ist kein
     kaputtes Bild.

     Die Prüfung mit new Image() weiter unten fiele nicht darauf herein,
     die läuft am Dokument. Nur die Maske daneben wäre leer. */
  return new URL('assets/emblems/' + name + '.webp', document.baseURI).href;
}

function emblemFile(name, wennDa) {
  const stand = EMBLEM_FILE_STATE.get(name);
  if (stand === false) return;
  if (stand === true) { wennDa(emblemFileSrc(name)); return; }

  /* Noch nicht geprüft, oder gerade in Prüfung. Im zweiten Fall hängt
     sich dieser Aufruf an die laufende Prüfung an, statt eine zweite
     anzustoßen. */
  if (stand && stand.warten) { stand.warten.push(wennDa); return; }

  const warten = [wennDa];
  EMBLEM_FILE_STATE.set(name, { warten });

  const probe = new Image();
  probe.onload = () => {
    EMBLEM_FILE_STATE.set(name, true);
    warten.forEach(ruf => ruf(emblemFileSrc(name)));
  };
  probe.onerror = () => EMBLEM_FILE_STATE.set(name, false);
  probe.src = emblemFileSrc(name);
}
