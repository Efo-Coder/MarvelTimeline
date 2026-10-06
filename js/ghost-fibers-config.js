/* Alle Regler des Faserfelds an einer Stelle.

   Das Feld ist der Grund der ganzen Startseite. Gezeichnet wird es in
   js/ghost-fibers.js, gedreht wird hier und nirgends sonst. Nur die
   beiden Farben je Phase stehen woanders, nämlich bei der Phase selbst
   in js/data.js: Sie gehören der Phase und nicht dem Hintergrund.

   Zur Laufzeit lässt sich alles über GhostFibers.set({ ... }) ändern,
   und im Vision-Studio steht unter „Fasern“ ein Regler für jeden Wert mit
   laufender Vorschau daneben. Wer dort sichert, schreibt zurück in diese
   Datei.

   Die Werte stehen bewusst einer je Zeile und ohne etwas hinter dem
   Komma: Das Studio schreibt sie zeilenweise um und lässt alles andere
   in Ruhe, damit diese Erklärungen stehen bleiben. */
(function () {
  'use strict';

  window.GHOST_FIBERS_CONFIG = {
    /* Die beiden Farben, solange keine Phase gilt. lineColor tragen die
       Fasern selbst, glowColor den Schein in der Mitte und die ziehende
       Wolke. Beide gehen zusätzlich in die Tonwertkurve ein, sehr helle
       Werte kippen das Bild deshalb schnell ins Milchige. Sobald eine
       Phase im Bild steht, blendet das Feld auf deren fibers-Farben
       über. */
    lineColor: '#140e35',
    glowColor: '#3437a0',

    /* Wie schnell die ganze Zeit läuft. Jede Bewegung im Bild hängt
       daran, Wellen wie Drehung. 0 friert das Feld ein. */
    speed: 0.2,

    /* Zoom auf das Feld. Größer heißt weiter weg und damit mehr, feinere
       Fasern im Bild. */
    scale: 1.75,

    /* Wie das Feld im Bild liegt, in Grad. Bei 90 laufen die Fasern
       waagerecht, bei 0 senkrecht. rotationSpeed dreht es zusätzlich
       fortwährend weiter, 0 lässt es stehen. */
    rotation: 90,
    rotationSpeed: 0,

    /* Wie viele Lagen übereinanderliegen, höchstens zehn. Jede Lage
       verbiegt die Ebene weiter und legt eigene Linien darüber. Mehr
       Lagen geben ein dichteres Geflecht und kosten Rechenzeit. */
    layers: 10,

    /* Die Welle, die jede Lage quer schiebt. amplitude ist der Ausschlag,
       frequency die Dichte der Wellen, speed ihr Tempo. layerSpeed ist
       der Aufschlag je Lage: Ohne ihn liefen alle Lagen im Gleichschritt
       und das Geflecht stünde still im eigenen Muster. */
    waveAmplitude: 0.015,
    waveFrequency: 3,
    waveSpeed: 0.15,
    layerSpeed: 0.08,

    /* Die Drehung um den Mittelpunkt, die aus geraden Linien Wirbel
       macht. twist ist ihre Stärke, frequency wie oft sie sich von innen
       nach außen wiederholt, speed ihr Tempo. */
    twist: 0.04,
    twistFrequency: 5,
    twistSpeed: 1.2,

    /* Die Linien selbst. frequency ist ihre Dichte, spacing der Aufschlag
       je Lage, sharpness die Schärfe: Der Wert ist die Potenz, mit der
       die Streifen zusammengezogen werden, hohe Werte geben dünne
       Fäden, niedrige breite Bänder. */
    lineFrequency: 5,
    lineSpacing: 8,
    lineSharpness: 16,

    /* Ein zusätzlicher Schein je Lage. falloff bestimmt, wie schnell er
       abfällt, intensity wie kräftig er ist. Auf 0 bleibt er ganz aus,
       und das Bild lebt allein von den Fasern und dem Schein in der
       Mitte. */
    glowFalloff: 10,
    glowIntensity: 1.25,

    /* Die Tonwertkurve am Schluss. brightness zieht das ganze Bild
       heller, blueBoost hebt danach nur den Blaukanal an. */
    brightness: 2,
    blueBoost: 1.25,

    /* Wie stark die Ränder abfallen. 0 lässt das Feld bis in die Ecken
       gleich hell stehen, 1 lässt nur die Mitte übrig. */
    vignette: 0.63,

    /* Filmkorn über allem. Es wandert mit der Zeit und nimmt den
       weichen Verläufen das Bandartige. */
    grain: 0.05,

    /* Heller Grund statt dunklem. Für dieses Projekt aus, die Startseite
       ist dunkel. */
    lightMode: false,

    /* Wie lange die beiden Farben beim Wechsel der Phase ineinander
       übergehen, in Sekunden. Welche Farben eine Phase trägt, steht bei
       der Phase selbst in js/data.js unter fibers. 0 lässt sie
       umspringen. */
    phaseFade: 1.2,

    /* Punktdichte, mit der gerechnet wird. 1 rechnet einen Bildpunkt je
       CSS-Punkt und reicht für ein weiches Bild vollkommen, 2 kostet das
       Vierfache. Unter 1 wird spürbar grob. */
    dpr: 1,

    /* Bilder je Sekunde. Darüber wird nicht gezeichnet, auch wenn der
       Browser öfter fragt. */
    fps: 60,
  };
})();
