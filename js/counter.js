/* Ein rollendes Zahlenwerk, wie es auf einer Anzeigetafel steht.

   Jede Ziffernstelle ist ein Rad: Die zehn Ziffern 0 bis 9 hängen
   untereinander an einem Kreis, und das Rad dreht sich so weit, bis die
   richtige im Fenster steht. Bewegt wird es von einer Feder und nicht von
   einer Kurve mit fester Dauer: Sie zieht am Anfang kräftig an und wird
   zum Schluss immer langsamer, ohne über ihre Stelle hinauszuschießen.

   Die Vorlage ist die React-Fassung von ReactBits (Counter, motion/react).
   Hier steht sie ohne Bauschritt und ohne Bibliothek: Die Feder rechnet
   diese Datei selbst, und alle laufenden Federn hängen an einer einzigen
   Bildschleife statt jede an ihrer eigenen.

   Der Kern ist die Rechnung, die aus dem Federstand die Höhe jeder
   einzelnen Ziffer macht:

     stelle  = stand % 10                    (der Bruchteil dreht mit)
     abstand = (10 + ziffer - stelle) % 10
     y       = abstand * schritthoehe
     bei abstand > 5:  y -= 10 * schritthoehe

   Der letzte Schritt ist der Trick am Rad. Ohne ihn stünden alle zehn
   Ziffern unter dem Fenster und das Rad liefe immer nur in eine Richtung.
   Mit ihm hängt die nähere Hälfte oben, die fernere unten, und aus dem
   Ring wird ein Band, das sich in beide Richtungen dreht.

   Ein Unterschied zur Vorlage steckt in set(). Dort federt jede Stelle auf
   ihren nackten Ziffernwert, und für ein Zählwerk, das nur nach oben
   läuft, reicht das. Ein Countdown springt aber von 0 auf 9 zurück, und
   die Feder liefe dann den ganzen Weg von 0 bis 9 durch, also neun Ziffern
   statt der einen, die wirklich dazwischenliegt. Deshalb merkt sich jede
   Stelle hier ihren Stand als fortlaufende Zahl und rückt immer nur um den
   kürzesten Weg weiter: von 0 auf 9 ist das ein Schritt nach unten und
   nicht neun nach oben. Was das Rad zeigt, bleibt dasselbe, weil es
   ohnehin nur modulo 10 rechnet. */
(function () {
  'use strict';

  /* ---------- Die Feder ----------

     Härte und Masse stehen auf den Werten, mit denen Framer Motion eine
     Feder ohne weitere Angaben anlegt. Die Dämpfung nicht: Dort steht sie
     auf 10 und damit auf der Hälfte dessen, was Nachschwingen überhaupt
     unterbindet. Die Ziffer sackt dann am Ende gut ein Siebtel eines
     Schrittes unter ihre Stelle durch und kommt zurück.

     Hier steht sie auf dem aperiodischen Grenzfall, also auf
     2 * Wurzel(Härte * Masse) = 20. Das ist genau die Dämpfung, bei der
     die Feder gerade nicht mehr überschwingt: Die Ziffer läuft zügig an,
     wird zum Schluss langsamer und bleibt stehen, ohne durchzusacken. Ein
     Wert darunter gibt den Nachschwinger zurück, einer darüber macht die
     Bewegung nur zäh. */
  const STIFFNESS = 100;
  const DAMPING = 20;
  const MASS = 1;

  /* Gerechnet wird in festen Sechzigstelsekunden und nicht in dem, was der
     Bildschirm gerade liefert. Sonst federte dieselbe Ziffer auf einem
     144-Hz-Schirm anders als auf einem 60-Hz-Schirm. */
  const STEP = 1 / 60;

  /* Wer die Seite im Hintergrund liegen lässt, kommt mit einer Lücke von
     Minuten zurück. Nachgerechnet wird höchstens eine Viertelsekunde
     davon, der Rest fällt unter den Tisch: Die Feder soll aufholen und
     nicht tausend Schritte am Stück rechnen. */
  const CATCH_UP = 0.25;

  /* Wann eine Feder als angekommen gilt. Gemessen wird in Ziffern und in
     Ziffern je Sekunde und nicht in Pixeln: Ein Rad ist zehn Ziffern groß,
     egal wie hoch es gerade steht.

     Eine Feder ohne Überschwingen kriecht das letzte Stück sehr lange, und
     ohne diese Schwelle liefe die Bildschleife für die Sekunden nie aus.
     Vier Tausendstel eines Schrittes sind bei jeder Schriftgröße unter
     einem halben Pixel, also nichts, was man springen sieht; zu sehen ist
     die Bewegung ohnehin nur die erste halbe Sekunde. */
  const REST_OFFSET = 0.004;
  const REST_SPEED = 0.08;

  const running = new Set();
  let frameId = 0;
  let lastTime = 0;
  let carry = 0;

  function tick(now) {
    frameId = 0;
    carry += Math.min((now - lastTime) / 1000, CATCH_UP);
    lastTime = now;

    /* Eine Kopie, weil eine angekommene Stelle sich beim Rechnen selbst
       aus der Liste nimmt. */
    const active = Array.from(running);
    while (carry >= STEP) {
      carry -= STEP;
      for (const digit of active) digit.advance();
    }
    /* Gezeichnet wird einmal je Bild und nicht einmal je Rechenschritt. */
    for (const digit of active) digit.draw();

    if (running.size) {
      frameId = requestAnimationFrame(tick);
    } else {
      carry = 0;
    }
  }

  function wake() {
    if (frameId) return;
    lastTime = performance.now();
    carry = 0;
    frameId = requestAnimationFrame(tick);
  }

  /* ---------- Eine Stelle ---------- */

  function createDigit() {
    const node = document.createElement('span');
    node.className = 'counter-digit';

    const glyphs = [];
    for (let n = 0; n < 10; n++) {
      const glyph = document.createElement('span');
      glyph.className = 'counter-number';
      glyph.textContent = String(n);
      node.append(glyph);
      glyphs.push(glyph);
    }

    return {
      node,
      glyphs,
      /* pos ist der Federstand, target die Stelle, auf die sie zuläuft.
         Beide laufen fortlaufend weiter und dürfen ins Minus gehen; was
         das Rad zeigt, ist immer nur pos modulo 10. */
      pos: 0,
      target: 0,
      speed: 0,
      shown: 0,
      height: 0,

      advance() {
        const pull = -STIFFNESS * (this.pos - this.target) - DAMPING * this.speed;
        this.speed += (pull / MASS) * STEP;
        this.pos += this.speed * STEP;
        if (Math.abs(this.pos - this.target) < REST_OFFSET
            && Math.abs(this.speed) < REST_SPEED) {
          this.pos = this.target;
          this.speed = 0;
          running.delete(this);
        }
      },

      draw() {
        const height = this.height;
        const place = this.pos % 10;
        for (let n = 0; n < 10; n++) {
          let offset = (10 + n - place) % 10;
          if (offset > 5) offset -= 10;
          this.glyphs[n].style.transform = 'translateY(' + (offset * height) + 'px)';
        }
      },

      /* Der kürzeste Weg von der stehenden zur nächsten Ziffer, als
         Schrittzahl zwischen -5 und 4. Von 0 auf 9 sind das -1 und nicht
         +9; von 0 auf 5 sind es -5, das Rad dreht dann nach unten. Bei
         einem Countdown ist das die Richtung, in die ohnehin alles
         läuft. */
      set(value, animate) {
        const step = (((value - this.shown) % 10) + 15) % 10 - 5;
        this.shown = value;
        this.target += step;
        if (animate === false) {
          this.pos = this.target;
          this.speed = 0;
          running.delete(this);
          this.draw();
        } else if (step !== 0) {
          running.add(this);
          wake();
        }
      },

      /* Die Schritthöhe ist die Höhe der Stelle selbst, gemessen und nicht
         gesetzt: So darf das Stylesheet die Schriftgröße bestimmen, auch
         über clamp() und damit je nach Fensterbreite eine andere.

         Kommt dabei nichts heraus, springt das Anderthalbfache der
         Schriftgröße ein. Ohne diesen Rückfall stünden alle zehn Ziffern
         auf demselben Fleck übereinander, sobald das Stylesheet einmal
         nicht da ist – etwa weil der Browser eine ältere Fassung im
         Zwischenspeicher hat. Ein Zahlensalat ist schlimmer als ein
         Zählwerk, dessen Schritt eine Spur daneben liegt. */
      measure() {
        let height = node.getBoundingClientRect().height;
        if (!height) {
          height = parseFloat(getComputedStyle(node).fontSize) * 1.5 || 0;
        }
        if (height && height !== this.height) {
          this.height = height;
          this.draw();
        }
      },

      release() {
        running.delete(this);
      },
    };
  }

  /* ---------- Das Zählwerk ----------

     places ist die Zahl der Stellen. Was nicht mehr hineinpasst, fällt
     links weg; die Stellenzahl steht beim Bauen fest und richtet sich
     danach, wie groß der Wert überhaupt werden kann. */
  function create(places) {
    const node = document.createElement('span');
    node.className = 'counter';

    const track = document.createElement('span');
    track.className = 'counter-track';
    node.append(track);

    const digits = [];
    for (let i = 0; i < places; i++) {
      const digit = createDigit();
      track.append(digit.node);
      digits.push(digit);
    }

    let current = null;

    function measure() {
      for (const digit of digits) digit.measure();
    }

    function set(value, animate) {
      const whole = Math.max(0, Math.floor(value));
      if (whole === current) return;
      current = whole;
      /* Von rechts nach links, damit jede Stelle ihre Zehnerpotenz
         bekommt: die letzte die Einer, die davor die Zehner. */
      let rest = whole;
      for (let i = digits.length - 1; i >= 0; i--) {
        digits[i].set(rest % 10, animate);
        rest = Math.floor(rest / 10);
      }
    }

    function release() {
      for (const digit of digits) digit.release();
    }

    return { node, set, measure, release };
  }

  window.Counter = { create };
})();
