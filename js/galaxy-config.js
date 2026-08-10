/* Alle Regler der Galaxie an einer Stelle.

   Die Datei wird vor beiden Renderern geladen und von beiden gelesen, von
   js/galaxy.js (WebGL2) und von js/galaxy-canvas-2d.js (Rückfallebene).
   Wer am Aussehen dreht, dreht hier und nirgends sonst.

   Zur Laufzeit lässt sich alles über Galaxy.set({ ... }) ändern, siehe
   den Kopf von js/galaxy.js. Werte, die das Nebelbild betreffen, lösen
   dabei ein neues Backen aus, der Rest wirkt sofort im nächsten Bild. */
(function () {
  'use strict';

  window.GALAXY_CONFIG = {
    /* Die fünf Regler der Vorlage mit den Werten, auf denen sie dort
       steht. drift ist auf 0 gespeichert, Grundbild und Nebelfelder
       stehen also still und folgen allein dem Mauszeiger. Wer sie ziehen
       lassen will, setzt den Wert auf 1. */
    starDensity: 1,
    drift: 0,

    /* Die beiden Sternschichten noch einmal einzeln, als Vielfaches von
       starDensity. Die feinen sind der Staub im Hintergrund, die hellen
       funkeln und tragen die Tiefe. 0 schaltet eine Schicht ab. */
    faintDensity: 1,
    brightDensity: 1,

    nebGlow: 0.7,
    twinkle: true,
    shootingStars: true,

    /* Mittlerer Abstand zwischen zwei Sternschnuppen, in Sekunden. Der
       wirkliche Abstand streut darum herum, von gut der Hälfte bis knapp
       zum Anderthalbfachen: Bei 12.5 sind das die 7 bis 18 Sekunden der
       Vorlage. Kleine Werte machen aus dem seltenen Ereignis schnell
       einen Regen, unter 3 wird es unruhig. */
    shootInterval: 12.5,

    /* Phasenschleier: Wie kräftig die Akzentfarbe über den Nebelfeldern
       liegt und wie schnell sie beim Phasenwechsel überblendet. 0 schaltet
       die Phasenwirkung ab, 1 färbt den Hintergrund fast vollständig um. */
    tintStrength: 0.4,
    tintEase: 0.035,

    /* Wie weit der Mauszeiger das Grundbild verschiebt, in Bildpunkten.
       Jeder Punkt kostet doppelt so viel Zugabe am Bild und damit
       Bildfläche, deshalb bewusst klein gehalten. Die Vorlage stand auf
       16 und 12. Die Sterne laufen weiterhin weiter, die Tiefenwirkung
       kommt ohnehin aus dem Unterschied zwischen den Ebenen. */
    parallaxX: 6,
    parallaxY: 4,

    /* Zugabe über die formatfüllende Größe des Grundbilds hinaus. Wie viel
       Rand die Bewegung wirklich braucht, rechnet der Renderer selbst aus,
       hier steht nur die Luft darüber hinaus. 1 sitzt so knapp wie
       möglich, jeder Punkt mehr schneidet ringsum etwas vom Bild ab.

       Weiter offen als 1 geht nicht, ohne Balken an den Seiten: Das Bild
       steht 3:2, ein breites Fenster eher 16:9 bis 2:1. Was oben und unten
       fehlt, ist von da an der Formatunterschied und nicht mehr der
       Zoom. */
    bgZoom: 1,

    /* ---- Ab hier nur WebGL2, die Rückfallebene kennt das nicht ---- */

    /* Wie fein das Nebelbild gebacken wird, als Vielfaches von 400 x 288.
       Die Canvas-Fassung konnte nur 1, weil sie jeden Punkt einzeln auf
       der CPU rechnet. Die GPU schafft auch 4 in unter einer Millisekunde.

       Es bringt trotzdem fast nichts, und das ist gemessen: Der Sprung
       von 1 auf 4 ändert das Bild um zwei von 255 Stufen, selbst bei
       hochgedrehtem nebRoughness um drei. Die Weichheit der Nebel kommt
       nicht von der Auflösung, sondern daher, dass die feinen Oktaven
       kaum Energie tragen und die ganze Schicht ohnehin nur ein blasser
       Hauch über dem gemalten Grundbild ist. Sechzehnfacher
       Speicherverbrauch für zwei Stufen lohnt nicht, deshalb steht die
       Vorgabe auf 1. Wer nebGlow und nebRoughness kräftig aufdreht, darf
       hier mitziehen. */
    nebFactor: 1,

    /* Oktaven des Rauschens im Nebel. Die Vorlage steht auf 5, jede
       weitere verdoppelt die Feinheit der Schlieren.

       Allein bringt dieser Regler wenig, das ist nachgemessen: Bei
       nebRoughness 0.5 trägt die fünfte Oktave nur noch drei Prozent zum
       Rauschen bei, die sechste eineinhalb. Der Sprung von 5 auf 7
       verändert das Bild um zwei von 255 Stufen. Wer wirklich mehr
       Struktur will, dreht zuerst an nebRoughness. */
    nebOctaves: 5,

    /* Wie viel jede Oktave von der vorigen behält. 0.5 ist die Vorlage
       und lässt die feinen Lagen fast verschwinden. 0.65 gibt dem Nebel
       fasrige Struktur, ab 0.75 wird er körnig und rauscht sichtbar.

       Das ist der Regler, der nebOctaves und nebFactor überhaupt erst
       etwas zu tun gibt. */
    nebRoughness: 0.5,

    /* Domain-Verzerrung: Das Rauschen fragt sich selbst nach der Stelle,
       an der es abgelesen wird. Aus runden Wolken werden dadurch gezogene,
       wirbelnde Schwaden. 0 ist die Vorlage, 0.25 bis 0.5 sieht nach
       echtem Gasnebel aus, darüber franst es aus. */
    nebWarp: 0,

    /* Trennt Struktur und Farbe im gemalten Grundbild. Bei 0 behält das
       Bild seine eigenen Farben, bei 1 wird nur noch seine Helligkeit als
       Dichte gelesen und die Farbe kommt vollständig aus der Palette der
       gerade sichtbaren Phase. Das ist der eigentliche Gewinn gegenüber
       dem alten Schleier: Der konnte die gemalten Farben nur anhauchen,
       das hier färbt sie wirklich um. */
    bgTint: 0,

    /* Wie das Grundbild auf Schirmgröße verkleinert wird. Auf einem
       1280er Schirm liegt es auf 42 Prozent, und weil darin gemalte
       Sterne von der Größe einzelner Punkte stehen, entscheidet dieser
       Regler darüber, wie hart die herauskommen.

         'mip'   Verkleinerung über Mipmaps. Die weichste Variante und
                 die, die der alten Canvas-Fassung am nächsten kommt.
         'roh'   Ein bilinearer Griff in die volle Auflösung. Die
                 gemalten Sterne bleiben am härtesten, dafür flimmern
                 sie beim Ändern der Fenstergröße.
         'fein'  Der Browser rechnet das Bild einmal sauber auf die
                 gebrauchte Größe herunter. Kein Flimmern, aber die
                 gemalten Sterne verlieren an Biss, weil ein richtiger
                 Filter sie mit ihrer dunklen Umgebung mittelt. */
    bgResample: 'mip',

    /* Tempo aller Bewegungen auf einmal. 0 friert das Bild ein, 0.5 ist
       halb so schnell, 2 doppelt. Wirkt auch in der Rückfallebene. */
    timeScale: 1,

    /* Wie stark Nebel und Sonne atmen. 1 ist die Vorlage, 0 lässt beide
       gleichmäßig stehen. */
    nebPulse: 1,
    sunPulse: 1,

    /* Tempo des Sternenfunkelns, unabhängig von timeScale. */
    twinkleSpeed: 1,
  };

  /* Die Nebelfelder der Vorlage: sechs Bereiche, jeder mit eigener Lage,
     Ausdehnung, Farbe und Struktur. ridged klappt das Rauschen an seiner
     Mitte nach oben und macht aus weichen Hügeln scharfe Grate, daraus
     entstehen die fasrigen Schlieren. */
  window.GALAXY_REGIONS = [
    { x: 0.10, y: 0.46, rx: 0.30, ry: 0.90, col: [62, 196, 158], ridged: true, amp: 0.62, sc: 3.4 },
    { x: 0.23, y: 0.04, rx: 0.30, ry: 0.32, col: [92, 214, 172], ridged: true, amp: 0.50, sc: 4.2 },
    { x: 0.53, y: 0.24, rx: 0.42, ry: 0.46, col: [44, 54, 184], ridged: false, amp: 0.44, sc: 2.2 },
    { x: 0.92, y: 0.20, rx: 0.30, ry: 0.48, col: [132, 58, 178], ridged: false, amp: 0.50, sc: 2.6 },
    { x: 0.46, y: 0.87, rx: 0.24, ry: 0.22, col: [106, 106, 255], ridged: true, amp: 0.82, sc: 4.6 },
    { x: 0.75, y: 0.86, rx: 0.28, ry: 0.17, col: [236, 168, 84], ridged: true, amp: 0.66, sc: 5.2 },
  ];

  /* Werte, die beide Renderer fest teilen und die niemand von außen
     dreht, weil an ihnen der ganze Aufbau hängt. */
  window.GALAXY_FIXED = {
    bgSrc: 'assets/theme/galaxy-bg.webp',
    nebW: 400,
    nebH: 288,
    starMargin: 70,     // Rand um den Schirm, damit die Parallaxe der
                        // feinen Sterne keine leere Kante freigibt
    spriteSize: 48,
    tintSlots: 6,       // feste Zahl an Farbplätzen, damit sich Paletten
                        // unterschiedlicher Länge ineinander blenden lassen
    fallback: [[70, 110, 255], [150, 70, 230], [60, 200, 140]],
    seedNeb1: 11,
    seedNeb2: 203,
    seedFaint: 24601357,
    seedBright: 90210773,
    seedShoot: 55512480,
  };
})();
