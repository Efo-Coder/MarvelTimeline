/* Die Zeichen hinter der Figur

   Auf der Erscheinungsbühne (js/characters.js) steht hinter dem
   Ganzkörperbild ein großes, blasses Zeichen und darüber und darunter je
   ein schräges Band in einer Farbe, die zur Figur passt. Vorlage ist die
   Heldentafel, wie Marvel sie für einzelne Figuren zeichnet: heller
   Grund, ein Wappen im Rücken, oben und unten ein angeschnittener
   Streifen.

   Woher das Zeichen einer Figur kommt, entscheidet sich in drei
   Schritten, siehe emblemFor():

     1. EMBLEM_BY_CHAR - wer ein eigenes Zeichen trägt, bekommt es.
        Tony Stark den Helm, Steve Rogers das Schild, Peter Parker die
        Spinne.

     2. EMBLEM_BY_FILM - alle anderen erben das Zeichen des Films, aus
        dem ihr Bild stammt. Aamir Khan ist kein Held und hat kein
        Wappen, aber er steht in Ms. Marvel, also steht der Blitz seiner
        Schwester hinter ihm.

     3. 'marvel' - bleibt beides leer, steht das Zeichen des Hauses da.

   Das Zeichen wechselt mit der Fassung: Wer in einem anderen Film ein
   anderes Bild hat, steht dort vor dem Wappen jenes Films, aber nur,
   solange die Figur nicht selbst eines mitbringt. Tony Stark bleibt
   unter jedem Logo Iron Man.

   Gezeichnet ist jedes Zeichen in einer Fläche von 200 auf 200 als
   Umriss, nicht als Bild: Es steht auf der Bühne mehrere hundert Pixel
   groß und in wechselnden Farben da, und beides kann eine Datei nicht.
   Klasse "f" füllt, Klasse "s" zieht eine Linie, Klasse "c" schneidet
   ein Loch in die Fläche darunter. Alle drei nehmen ihre Farbe von der
   Bühne. */

const EMBLEM_ART = {

  /* ---------- Die Zeichen ---------- */

  /* Der Kreis mit dem A, dessen rechter Balken oben als Pfeil aus ihm
     herausschießt. Der Kreis hat deshalb dort eine Lücke. */
  'avengers': '<path class="s" stroke-width="11" fill="none" d="M142 27A84 84 0 1 0 183 85"/>'
    + '<path class="f" fill-rule="evenodd" d="M100 34 156 168h-28l-8-24H80l-8 24H44Z'
    + 'M88 120h24l-12-36Z"/>'
    + '<path class="s" stroke-width="15" d="M126 78 178 20"/>'
    + '<path class="f" d="M198 2 152 10 188 42Z"/>',

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
  'winter-soldier': '<circle class="s" cx="100" cy="100" r="88" stroke-width="9"/>'
    + '<path class="f" d="M100 30 120 84 178 84 131 117 149 172 100 138 51 172 69 117'
    + ' 22 84 80 84Z"/>'
    + '<path class="s" stroke-width="8" fill="none" d="M27 56h146M27 144h146"/>',

  /* Falcons Flügelpaar mit den gestaffelten Federn. */
  'falcon': '<path class="f" d="M100 42c7 0 12 5 12 12v92l-12 20-12-20V54c0-7 5-12 12-12Z"/>'
    + '<path class="f" d="M84 62 6 38l20 28-14 4 28 22-14 6 30 18-8 8 36 14Z"/>'
    + '<path class="f" d="M116 62 194 38l-20 28 14 4-28 22 14 6-30 18 8 8-36 14Z"/>',

  /* Die Zehn Ringe: fünf Reifen übereinander, wie sie am Arm sitzen. */
  'shang-chi': '<ellipse class="s" cx="100" cy="34" rx="60" ry="17" stroke-width="10"/>'
    + '<ellipse class="s" cx="100" cy="67" rx="66" ry="18" stroke-width="10"/>'
    + '<ellipse class="s" cx="100" cy="100" rx="70" ry="19" stroke-width="10"/>'
    + '<ellipse class="s" cx="100" cy="133" rx="66" ry="18" stroke-width="10"/>'
    + '<ellipse class="s" cx="100" cy="166" rx="60" ry="17" stroke-width="10"/>',

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

  /* Der doppelte Blitz der Thunderbolts im Kreis. */
  'thunderbolts': '<circle class="s" cx="100" cy="100" r="88" stroke-width="11"/>'
    + '<path class="f" d="M104 22 46 106h30l-8 72 58-84H96Z"/>'
    + '<path class="f" d="M154 44 116 100h20l-6 48 38-56h-20Z"/>',

  /* Das Zeichen der Dora Milaje: der Vibranium-Speer im Ring. */
  'wakanda': '<circle class="s" cx="100" cy="100" r="86" stroke-width="10"/>'
    + '<path class="f" d="M100 14 132 70 100 132 68 70Z"/>'
    + '<path class="f" d="M93 122h14v62H93Z"/>',

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

  /* Der Skrull-Kopf mit den spitzen Ohren und dem gefurchten Kinn. */
  'skrull': '<path class="f" d="M100 20c30 0 50 20 50 48 0 8-2 16-6 22 14-6 26-4 36 6'
    + '-14 2-24 10-30 22-10 26-28 46-50 56-22-10-40-30-50-56-6-12-16-20-30-22'
    + 'c10-10 22-12 36-6-4-6-6-14-6-22 0-28 20-48 50-48Z"/>'
    + '<path class="c" d="M72 62c10-6 20-2 22 6s-6 16-16 18-18-2-20-10 4-12 14-14Z'
    + 'M128 62c-10-6-20-2-22 6s6 16 16 18 18-2 20-10-4-12-14-14Z"/>'
    + '<path class="c" d="M92 148h16l-2 24h-12Z"/>',

  /* Das Haus selbst, wenn zu einer Figur nichts Näheres bekannt ist:
     der Block mit dem M, wie ihn die Marke führt. */
  'marvel': '<path class="s" stroke-width="13" fill="none" d="M14 42h172v116H14Z"/>'
    + '<path class="f" d="M50 70h28l22 52 22-52h28v60h-24V96l-16 34h-20l-16-34v34H50Z"/>',
};

/* ---------- Wer welches Zeichen trägt ----------

   Nur Figuren mit eigenem Wappen stehen hier. Wer fehlt, erbt das des
   Films, siehe EMBLEM_BY_FILM.

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
  'riri-williams': 'ironheart',

  /* Captain America */
  'steve-rogers': 'captain-america',
  'sam-wilson': 'falcon',
  'bucky-barnes': 'winter-soldier',
  'john-walker': 'captain-america',
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

  /* Black Panther und Wakanda */
  't-challa': 'black-panther',
  'shuri': 'black-panther',
  'okoye': 'wakanda',
  'nakia': 'wakanda',
  'm-baku': 'wakanda',
  'koenigin-ramonda': 'black-panther',
  'erik-killmonger': 'black-panther',
  'ayo': 'wakanda',

  /* Ant-Man */
  'scott-lang': 'ant-man',
  'hope-van-dyne': 'ant-man',
  'hank-pym': 'ant-man',
  'janet-van-dyne': 'ant-man',
  'cassie-lang': 'ant-man',
  'luis': 'ant-man',
  'darren-cross': 'ant-man',
  'ava-starr': 'ant-man',

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

  /* Captain Marvel */
  'carol-danvers': 'captain-marvel',
  'monica-rambeau': 'captain-marvel',
  'maria-rambeau': 'captain-marvel',
  'goose': 'captain-marvel',
  'kamala-khan-ms-marvel': 'ms-marvel',

  /* S.H.I.E.L.D. */
  'nick-fury': 'shield',
  'maria-hill': 'shield',
  'phil-coulson': 'shield',
  'alexander-pierce': 'shield',
  'talos': 'skrull',
  'gravik': 'skrull',

  /* Die übrigen Avengers */
  'natasha-romanoff': 'black-widow',
  'yelena-belova': 'black-widow',
  'taskmaster': 'black-widow',
  'alexei': 'black-widow',
  'melina-vostokoff': 'black-widow',
  'clint-barton': 'hawkeye',
  'kate-bishop': 'hawkeye',
  'wanda-maximoff': 'scarlet-witch',
  'agatha-harkness': 'agatha',
  'vision': 'vision',
  'ultron': 'avengers',
  'pietro-maximoff': 'avengers',
  'thanos': 'avengers',

  /* Die Straße von New York */
  'matt-murdock-daredevil': 'daredevil',
  'wilson-fisk-kingpin': 'daredevil',
  'frank-castle-punisher': 'punisher',
  'marc-spector-steven-grant-moon-knight': 'moon-knight',
  'maya-lopez-echo': 'echo',

  /* Mutanten, Söldner und die Zehn Ringe */
  'wade-wilson-deadpool': 'deadpool',
  'logan-wolverine': 'wolverine',
  'charles-xavier-professor-x': 'x-men',
  'shang-chi': 'shang-chi',
  'katy': 'shang-chi',
  'wenwu-mandarin': 'ten-rings',
  'xialing': 'ten-rings',

  /* Fantastic Four */
  'reed-richards-mister-fantastic': 'fantastic-four',
  'sue-storm-invisible-woman': 'fantastic-four',
  'johnny-storm-human-torch': 'fantastic-four',
  'ben-grimm-the-thing': 'fantastic-four',
  'doctor-doom': 'fantastic-four',

  /* Der Rest */
  'simon-williams': 'wonder-man',
  'bob-sentry': 'thunderbolts',
  'valentina-allegra-de-fontaine': 'thunderbolts',
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
  'reed-richards-838': 'fantastic-four',
  'peggy-carter-838': 'captain-america',
  'maria-rambeau-838': 'captain-marvel',
  'karl-mordo-838': 'doctor-strange',
};

/* ---------- Welcher Film welches Zeichen führt ----------

   Der Rückfall für alle, die kein eigenes Wappen tragen. Der Schlüssel
   ist der Film-Slug aus data.js. */
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
  'the-avengers': 'avengers',
  'avengers-age-of-ultron': 'avengers',
  'avengers-infinity-war': 'avengers',
  'avengers-endgame': 'avengers',
  'avengers-doomsday': 'avengers',
  'avengers-secret-wars': 'avengers',
  'guardians-of-the-galaxy': 'guardians',
  'guardians-of-the-galaxy-vol-2': 'guardians',
  'guardians-of-the-galaxy-vol-3': 'guardians',
  'ant-man': 'ant-man',
  'ant-man-and-the-wasp': 'ant-man',
  'ant-man-and-the-wasp-quantumania': 'ant-man',
  'black-widow': 'black-widow',
  'black-panther': 'black-panther',
  'black-panther-wakanda-forever': 'wakanda',
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
  'thunderbolts': 'thunderbolts',
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
  'wakanda':         ['#3a2560', '#7a52c4'],
  'ant-man':         ['#7a2c14', '#c25a26'],
  'doctor-strange':  ['#6b2a12', '#c2551f'],
  'guardians':       ['#5a2372', '#9b47b8'],
  'captain-marvel':  ['#8c4a08', '#dd7d10'],
  'ms-marvel':       ['#8c3a05', '#e0700c'],
  'black-widow':     ['#3a1216', '#8e2028'],
  'hawkeye':         ['#5c1f24', '#a83b3f'],
  'scarlet-witch':   ['#5f0f22', '#a81f3f'],
  'agatha':          ['#3c1a52', '#7c3fa0'],
  'vision':          ['#6a1030', '#b81f52'],
  'shield':          ['#1b2c3d', '#3e6183'],
  'skrull':          ['#1f4a2c', '#3d8a54'],
  'avengers':        ['#1c2a4a', '#3f5f9e'],
  'shang-chi':       ['#7a1616', '#c22c2c'],
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
  'thunderbolts':    ['#5c1a1f', '#a83238'],
  'wonder-man':      ['#6b2a52', '#b8479e'],
  'ghost-rider':     ['#5c2a08', '#c2691f'],
  'marvel':          ['#8c1017', '#e62429'],
};

/* Das Zeichen zu einer Figur in einem Film.

   charSlug ist der Schlüssel der Figur, filmSlug der des Films, aus dem
   das gezeigte Bild stammt. Der zweite darf fehlen, dann entscheidet
   allein die Figur. Zurück kommt ein Name aus EMBLEM_ART. */
function emblemFor(charSlug, filmSlug) {
  const eigen = EMBLEM_BY_CHAR[charSlug];
  if (eigen && EMBLEM_ART[eigen]) return eigen;
  const vomFilm = filmSlug ? EMBLEM_BY_FILM[filmSlug] : null;
  if (vomFilm && EMBLEM_ART[vomFilm]) return vomFilm;
  return 'marvel';
}

/* Das fertige SVG zu einem Zeichen, für innerHTML.

   Gezeichnet wird nicht direkt, sondern über eine Maske: Die Fläche ist
   eine einzige eingefärbte Platte, und was von ihr stehen bleibt,
   entscheidet die Maske darüber. Nur so werden die Löcher im Zeichen -
   die Augenschlitze im Helm, der Kern im Stern - wirklich zu Löchern.
   Würden sie weiß gefüllt, stünden sie als helle Flecken auf dem Band
   und dem Schrägstrich, die hinter dem Zeichen durchlaufen.

   In einer Maske heißt Weiß sichtbar und Schwarz unsichtbar, deshalb
   liegen die Klassen f und s dort in Weiß und c in Schwarz. Die Farbe
   dafür setzt das Stylesheet, siehe .char-stage-emblem.

   Jede Maske braucht einen eigenen Namen: Auf der Seite stehen mehrere
   Bühnen zugleich im Dokument, und zwei Masken desselben Namens brächten
   den Browser dazu, überall dieselbe zu nehmen. */
let emblemNr = 0;

function emblemSvg(name) {
  const art = EMBLEM_ART[name] || EMBLEM_ART['marvel'];
  const id = 'emblem-' + (++emblemNr);
  return '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">'
    + '<mask id="' + id + '" maskUnits="userSpaceOnUse"'
    + ' x="0" y="0" width="200" height="200">'
    + '<g class="art">' + art + '</g>'
    + '</mask>'
    + '<rect width="200" height="200" fill="currentColor" mask="url(#' + id + ')"/>'
    + '</svg>';
}

/* Das Farbpaar zu einem Zeichen: [dunkel, hell]. */
function emblemTint(name) {
  return EMBLEM_TINT[name] || EMBLEM_TINT['marvel'];
}

/* ---------- Vorlagen statt gezeichneter Zeichen ----------

   Die Umrisse oben sind von Hand gezeichnet und sehen auch danach aus.
   Wer ein besseres Zeichen hat, legt es als Vorlage ab und lässt
   tools/emblems/build-emblems.py eine Maske daraus machen; die liegt
   dann unter assets/emblems/<name>.webp und tritt an die Stelle des
   gezeichneten.

   Welche Masken es gibt, steht nirgends geschrieben: Die Bühne
   probiert es einfach und merkt sich das Ergebnis. Das erspart eine
   Liste, die bei jeder neuen Datei mitgepflegt werden müsste, und
   kostet pro Zeichen einen einzigen Versuch für die ganze Sitzung.

   Der Rückruf kommt nur, wenn es die Datei gibt. Bis dahin steht das
   gezeichnete Zeichen da, und wenn es keine Datei gibt, bleibt es
   stehen. */
const EMBLEM_FILE_STATE = new Map();

function emblemFileSrc(name) {
  return 'assets/emblems/' + name + '.webp';
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
