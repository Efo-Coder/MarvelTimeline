/* Von einer Seite im Rahmen nur einen Teil zeigen.

   Plakatwand und Schatten zeigen in ihrer Vorschau die echte Seite, in
   einem Rahmen von fest 1600 auf 900, damit sie ihre Anordnung für den
   Schreibtisch baut. Gebraucht wird davon jeweils nur ein Teil: der Hero
   der Filmseite, die Bühne der Charakterseite. Der Rahmen wird dafür so
   verschoben und vergrößert, dass genau dieser Teil die Vorschau füllt,
   und die Vorschau nimmt sein Seitenverhältnis an.

   Hier werden nur Eigenschaften an der Vorschau gesetzt, gerechnet wird
   in styles/studio.css bei .ausschnitt.

   Zu sehen ist der Rahmen erst, wenn der Teil zweimal hintereinander an
   derselben Stelle gemessen wurde und ganz im Rahmen liegt. Beim Laden
   rollt oder wächst die Seite noch, und vorher stünde für einen Moment
   ein halber Ausschnitt in der Vorschau. Messen müssen die Bereiche
   deshalb laufend, solange sie offen sind.

   Benutzt wird es so:

     const blick = RahmenAusschnitt(rahmen);
     blick.setze({ x, y, breite, hoehe }, fertig);  // Fläche in Pixeln des Rahmens
     blick.flaeche                                  // zuletzt gesetzt, samt zoom
     blick.vergiss();                               // vor dem Laden einer neuen Seite

   setze() meldet true, wenn sich der Ausschnitt geändert hat. Mit
   fertig = false wird gemessen und gesetzt, aber noch nicht gezeigt. */

'use strict';

window.RahmenAusschnitt = function RahmenAusschnitt(rahmen) {
  const BREITE = 1600;
  const HOEHE = 900;
  const vorschau = rahmen.parentElement;
  vorschau.classList.add('ausschnitt');
  let zuletzt = null;

  function setze(f, fertig = true) {
    if (!f || !f.breite || !f.hoehe || !vorschau.clientWidth) return false;
    const steht = !!zuletzt && ['x', 'y', 'breite', 'hoehe']
      .every((k) => Math.abs(zuletzt[k] - f[k]) < 0.5);
    const drin = f.x >= 0 && f.y >= 0 && f.x + f.breite <= BREITE && f.y + f.hoehe <= HOEHE;
    if (fertig && steht && drin) vorschau.classList.add('bereit');
    /* Gleich geblieben ist auch die Breite der Vorschau, dann ist nichts
       neu zu setzen. Gemessen wird oft, auch mitten in einem Zug. */
    const zoom = vorschau.clientWidth / f.breite;
    if (steht && zuletzt.zoom === zoom) return false;
    zuletzt = { x: f.x, y: f.y, breite: f.breite, hoehe: f.hoehe, zoom };
    vorschau.style.setProperty('--ausschnitt-seiten', String(f.breite / f.hoehe));
    vorschau.style.setProperty('--wand-zoom', String(zoom));
    vorschau.style.setProperty('--ausschnitt-x', -f.x * zoom + 'px');
    vorschau.style.setProperty('--ausschnitt-y', -f.y * zoom + 'px');
    return true;
  }

  function vergiss() {
    zuletzt = null;
    vorschau.classList.remove('bereit');
  }

  return {
    setze,
    vergiss,
    get flaeche() { return zuletzt; },
  };
};
