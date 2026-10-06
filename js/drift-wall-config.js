/* Alle Regler der Plakatwand an einer Stelle.

   Die Wand steht im Kopfband der Filmseite und zieht dort in Spalten
   aneinander vorbei, siehe js/drift-wall.js. Wer an ihrem Aussehen oder
   ihrem Lauf dreht, dreht hier und nirgends sonst: Lage, Kachelmaß und
   Tempo gehen von hier an den Shader in drift-wall.js, und die Werte
   des Schleiers schreibt drift-wall.js als eigene Eigenschaften an das
   Kopfband, wo das Stylesheet sie abholt.

   Zur Laufzeit lässt sich alles über DriftWall.set({ ... }) ändern.
   Genau das macht das Vision-Studio: Der Bereich „Plakatwand“ zeigt die
   echte Wand mit den echten Dateien und stellt die Regler daneben.
   Gesichert schreibt er sie wieder hierher.

   Die Werte, die die Vorlage von ReactBits mitbringt, stehen im Kopf von
   js/drift-wall.js. Hier stehen die, mit denen die Wand auf dieser Seite
   läuft, und für hochkant stehende Plakate sind das andere.

   Die Schreibweise ist nicht beliebig: Das Studio ersetzt beim Sichern
   die Zeile eines Reglers über ein Muster, das auf vier Leerzeichen
   Einrückung, einen Doppelpunkt und ein Komma am Ende besteht. Ein Wert
   je Zeile, nichts anderes dahinter. Die Erklärungen dazwischen bleiben
   dabei unangetastet. */
(function () {
  'use strict';

  window.DRIFT_WALL_CONFIG = {

    /* ---------- Die Kachel ----------

       Ein Plakat steht hochkant im Verhältnis 2:3 wie die Kacheln der
       Reihen darunter. Wie breit es ist, hängt am Fenster: Es bekommt
       einen Anteil der Fensterbreite, begrenzt nach unten und oben.
       Ohne die untere Grenze stünden auf einem Telefon nur zwei
       Spalten, ohne die obere wirkte die Wand auf einem großen Schirm
       wie eine Reihe Plakate statt wie eine Wand. */
    tileMin: 92,
    tileMax: 168,
    tileShare: 0.11,
    ratio: 1.5,

    /* Die Fuge zwischen zwei Plakaten, in Pixeln. Sie gilt nach allen
       Seiten gleich, waagerecht wie senkrecht. */
    gap: 14,

    /* Eckenrundung der Plakate. Die Kacheln der Reihen darunter haben
       keine, deshalb hat die Wand auch keine. */
    radius: 0,

    /* Wie viele Spalten nebeneinander stehen. Bei 0 rechnet die Wand
       sich das selbst aus: so viele, wie das Band samt Überstand fasst.
       Das ist die Vorgabe, denn ein Fenster ist nicht immer gleich
       breit. Eine feste Zahl ist zum Ausprobieren da und lässt auf
       breiten Fenstern unter Umständen die Ecken frei. */
    columns: 0,

    /* ---------- Die Lage im Raum ----------

       Die Wand steht nach hinten gekippt, zur Seite gedreht und ein
       Stück in die Tiefe geschoben. Der Maßstab holt zurück, was die
       Tiefe kleiner macht, der Fluchtpunkt sagt, wie stark sich die
       Fläche dabei überhaupt verjüngt: Große Werte flachen die
       Perspektive ab, kleine übertreiben sie.

       Kippung und Drehung sind der Grund, warum die Wand größer gebaut
       werden muss als das Band, siehe overX und overY weiter unten. Wer
       hier dreht, prüft also besser gleich mit, ob an den Ecken noch
       überall Plakate stehen. */
    tilt: 16,
    turn: -14,
    depth: 120,
    scale: 1.18,
    perspective: 1200,

    /* Und die Drehung in der Bildebene, also um die Achse zum Betrachter
       hin. Die Vorlage hat sie und lässt sie auf 0. Ein paar Grad legen
       die ganze Wand schief, viel mehr sieht schnell nach Versehen
       aus. */
    roll: 0,

    /* ---------- Der Lauf ----------

       Grundtempo einer Spalte in Pixeln je Sekunde. Die Vorlage läuft
       mit 42 bei halb so hohen Kacheln. Hochkant wäre dasselbe Tempo
       hektisch, ein Plakat soll lange genug stehen, um erkannt zu
       werden.

       Die Streuung sagt, wie weit die Spalten im Tempo auseinander-
       liegen dürfen, als Anteil des Grundtempos. Bei 0 liefe die Wand
       wie ein Vorhang, bei 0.45 bleibt jede Spalte für sich, ohne dass
       eine stehen bleibt. Die Richtung wechselt ohnehin von Spalte zu
       Spalte. */
    speed: 30,
    variance: 0.45,

    /* Die Grundrichtung: 'up' lässt die erste Spalte nach oben laufen,
       'down' nach unten. Die Nachbarspalte läuft ohnehin immer
       andersherum, dieser Wert dreht also das ganze Muster um. */
    direction: 'up',

    /* Wie oft je Sekunde die Wand neu gezeichnet wird. Sie läuft auf
       einem eigenen Canvas und kostet die Seite dabei kaum etwas, auch
       nicht beim Scrollen. Dreißig reichen trotzdem: Bei dreißig Pixeln
       je Sekunde ist ein Schritt ein einziger Pixel, und mehr Bilder
       sähe man nicht, sie gingen nur auf den Akku. */
    fps: 30,

    /* Hält die Wand ganz an. Für den Blick auf ein stehendes Bild
       gedacht, auf der Seite selbst steht das auf false. */
    paused: false,

    /* ---------- Der Zuschnitt ----------

       Wie viel breiter und höher die Wand gebaut wird als das Band. Sie
       steht schräg im Raum: Die abgewandte Seite rückt in die Ferne und
       schrumpft, die zugewandte wächst, und die Kippung nach hinten
       zieht oben und unten Platz. Ohne Überstand stünde an den Ecken
       nichts. Die Werte hier sind für die Lage oben gerechnet und haben
       eine knappe Reserve. */
    overX: 1.35,
    overY: 1.75,

    /* So viele Plakate bekommt jede Spalte mindestens. Eine Spalte wird
       unendlich, indem ihr Inhalt mehrfach untereinander hängt und der
       Stand am Ende einer Kopie wieder auf null springt. Je mehr
       Plakate in einer Kopie stehen, desto weniger Kopien braucht es
       für dieselbe Höhe. */
    minPerColumn: 4,

    /* ---------- Der Schleier ----------

       Über der Wand liegt eine Schicht in der Farbe, die das Band sonst
       allein hätte. Sie hat zwei Aufgaben, und beide brauchen ihre
       eigene Zahl.

       Gedämpft wird mit dim: Die Wand ist Hintergrund und nicht Inhalt,
       bei voller Deckung liefe der Titel darin unter. Der Fleck in der
       Mitte kommt dazu, damit der Titel auf ruhigem Grund steht, und
       nach unten wird der Schleier dichter, weil dort gleich das weiße
       Raster anfängt und ein heller Fleck genau an der Kante die beiden
       Flächen ineinanderlaufen ließe.

       Ausgeblendet werden die Ränder ebenfalls hier: edge sagt, ab
       welchem Anteil der Fläche der Schleier zur vollen Deckung
       hochläuft. Die Wand hat dadurch keine Kante, sie geht in den
       Grundton über. */
    dim: 0.45,
    scrim: 0.6,
    top: 0.34,
    bottom: 0.96,
    edge: 38,

    /* Die Farbe des Schleiers. Sie ist zugleich die Farbe, in die die
       Ränder der Wand übergehen, und muss deshalb die Farbe des Bandes
       darunter sein. Steht sie auf etwas anderem, bekommt die Wand einen
       sichtbaren Saum. Die Vorlage nennt sie Overlay und hat dort ein
       sehr dunkles Blau. */
    overlay: '#151515',

    /* Nimmt den Plakaten alle Farbe. Die Vorlage hat den Schalter, auf
       dieser Seite steht er aus: Die Plakate sind das Motiv, und in
       Grau erkennt man die Hälfte nicht wieder. Umgerechnet wird im
       Shader, mit denselben Gewichten wie der CSS-Filter grayscale(). */
    grayscale: false,
  };
})();
