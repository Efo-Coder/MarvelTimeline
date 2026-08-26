/* Filmlogos auf eine gemeinsame Größe bringen.

   Die Logodateien kommen mit ganz unterschiedlichen Seitenverhältnissen
   und mit unterschiedlich viel durchsichtigem Rand. Skaliert man sie alle
   auf dieselbe Kastenbreite, wirkt ein breiter Schriftzug wie „Captain
   America: The Winter Soldier“ viel kleiner als ein kompakter wie
   „Agatha All Along“, obwohl beide gleich viel Platz bekommen haben.

   Gleich groß heißt deshalb: gleich viel sichtbare Fläche. Gemessen wird
   dafür nicht die Bilddatei, sondern ihr sichtbarer Inhalt, also das
   kleinste Rechteck um alles, was nicht durchsichtig ist. Aus Fläche und
   Seitenverhältnis ergibt sich dann die Größe, in der das Bild stehen
   muss.

   Zwei Ankermaße, weil die beiden Seiten verschieden gebaut sind:

     toWidth  – die Timeline. Ihre Logokästen sind breiter als hoch und
                die Breite ist das feste Maß, an dem alle hängen.
     toHeight – die Bühne der Charakterseite. Dort steht das Logo in einem
                flachen Kasten fester Höhe, und die Spalte daneben ist so
                breit, wie das Fenster es gerade zulässt.

   Beide rechnen dieselbe Fläche aus, nur eben in Anteilen der Breite oder
   in Anteilen der Höhe ihres Kastens. */
(function () {
  'use strict';

  /* Der sichtbare Inhalt wird auf einer Leinwand vermessen. Ist das nicht
     erlaubt (beim Aufruf über file:// gilt jedes Bild als fremd), zählt
     ersatzweise die ganze Datei als Inhalt: Dann sitzen die Größen nicht
     ganz genau, aber nichts steht schief. */
  function measureAlphaBox(img) {
    try {
      const scale = Math.min(1, 200 / img.naturalWidth);
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const alpha = ctx.getImageData(0, 0, w, h).data;
      let minX = w, maxX = -1, minY = h, maxY = -1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (alpha[(y * w + x) * 4 + 3] > 16) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < 0) return null;
      return {
        w: (maxX - minX + 1) / w * img.naturalWidth,
        h: (maxY - minY + 1) / h * img.naturalHeight,
      };
    } catch (err) {
      return null;
    }
  }

  function contentBox(img) {
    return measureAlphaBox(img)
      || { w: img.naturalWidth, h: img.naturalHeight };
  }

  /* Die Fläche der Timeline: (990/1080)² / (990/176), also die sichtbare
     Fläche von iron-man.webp, wenn die Datei ihren Kasten genau ausfüllt.
     Dieses eine Logo gilt dort als Standardgröße, alle anderen werden auf
     seine Fläche gebracht. Gemessen in Anteilen der Kastenbreite zum
     Quadrat. */
  const REF_AREA_BY_WIDTH = 0.1494;

  /* Dasselbe für die Bühne, nur in Anteilen der Kastenhöhe zum Quadrat.
     Der Wert ist nach oben durch den Kasten selbst begrenzt: Das
     kompakteste Logo im Bestand steht etwa im Verhältnis 3:2, bei einer
     Fläche von einem Quadrat über der Kastenhöhe wird es rund vier
     Fünftel davon hoch und stößt gerade nicht an. */
  const REF_AREA_BY_HEIGHT = 1;

  /* Timeline: Die Breite kommt als Prozentwert, weil die Kästen mit dem
     Fenster mitwachsen. Über 100 Prozent geht es nicht, sonst liefe ein
     Logo aus seinem Kasten heraus. */
  function toWidth(img, share) {
    const box = contentBox(img);
    const ratio = box.w / box.h;
    const frac = Math.sqrt((share || REF_AREA_BY_WIDTH) * ratio)
      * (img.naturalWidth / box.w);
    img.style.width = Math.min(frac, 1) * 100 + '%';
  }

  /* Bühne: dieselbe Rechnung über die Höhe. Die Breite bleibt frei und
     ergibt sich aus dem Seitenverhältnis der Datei. */
  function toHeight(img, share) {
    const box = contentBox(img);
    const ratio = box.w / box.h;
    const frac = Math.sqrt((share || REF_AREA_BY_HEIGHT) / ratio)
      * (img.naturalHeight / box.h);
    img.style.height = Math.min(frac, 1) * 100 + '%';
    img.style.width = 'auto';
  }

  window.LogoFit = { toWidth, toHeight, measureAlphaBox };
})();
