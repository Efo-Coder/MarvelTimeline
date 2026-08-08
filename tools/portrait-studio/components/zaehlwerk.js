/* Zählwerk: die Zahlen im Kopf laufen auf ihren Wert, statt zu springen.

   Die Vorlage ist CountUp von React Bits. Dort hängt die Zahl an einer
   Feder (useSpring), die beim ersten Erscheinen im Bild angestoßen wird.
   Hier ist es dieselbe Idee ohne Framework, an zwei Stellen der Aufgabe
   angepasst:

     1. Gerechnet wird Schritt für Schritt statt über die geschlossene
        Lösung der Schwingung. Der Stand im Kopf ändert sich nach jedem
        gespeicherten Bild, und eine Feder darf mitten im Lauf ein neues
        Ziel bekommen: Wert und Geschwindigkeit laufen weiter, nur die
        Ruhelage verschiebt sich. Ein Zeitverlauf müsste dafür jedes Mal
        von vorn beginnen.

     2. Die Feder steht im Grenzfall (Dämpfungsgrad 1). Sie erreicht ihr
        Ziel auf kürzestem Weg, ohne darüber hinauszuschießen, und dauer
        ist damit ungefähr die Zeit, die das Hochzählen wirklich braucht.
        Die Vorlage rechnet mit stiffness = 100/duration und
        damping = 20 + 40/duration, ist also stark überdämpft: Der
        Ausschlag klingt dort höchstens mit 2,5 je Sekunde ab, wie klein
        duration auch gewählt wird. Eine dreistellige Zahl bräuchte so
        über drei Sekunden, viel zu träge für eine Kopfzeile.

   Aus dem Grenzfall folgt ein angenehmer Nebeneffekt: Wie lange es
   dauert, hängt am Abstand zum Ziel. Beim Laden zählt der Kopf gut eine
   Sekunde von null hoch, ein einzelnes fertiges Bild später schiebt die
   Zahl in unter zwei Zehnteln um eins weiter.

   Gezählt wird in ganzen Zahlen, hier wird nichts Halbes gezählt.

   Aufruf:
       const w = zaehlwerk(knoten, { bis: 143, verzoegerung: 0.07 });
       w.setze(144);    // neues Ziel, die Feder läuft von dort weiter
       w.vonVorn();     // noch einmal von null, mit Staffel

   Alle laufenden Zählwerke teilen sich eine Bildschleife, die stillsteht,
   sobald keines mehr etwas zu tun hat. */
(function () {
  'use strict';

  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const MASSE = 1;
  const SCHRITT = 1 / 240;   // feste Rechenschritte, unabhängig von der Bildrate
  const HOECHSTSPRUNG = 0.064;   // längere Pausen nicht nachrechnen

  const laufend = new Set();
  let bild = 0;
  let zuletzt = 0;

  function schlag(jetzt) {
    const dt = Math.min((jetzt - zuletzt) / 1000, HOECHSTSPRUNG);
    zuletzt = jetzt;
    laufend.forEach((werk) => werk.rechne(dt));
    bild = laufend.size ? requestAnimationFrame(schlag) : 0;
  }

  function wecke() {
    if (bild) return;
    zuletzt = performance.now();
    bild = requestAnimationFrame(schlag);
  }

  /* Im Hintergrundtab rechnet nichts. Das Studio steht oft stundenlang
     offen, während nebenan hochgerechnet wird. Beim Zurückkommen stehen
     die Zahlen auf ihrem Ziel, es gibt nichts nachzuholen. */
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    laufend.forEach((werk) => werk.springe());
    laufend.clear();
  });

  window.zaehlwerk = function (knoten, optionen) {
    const o = optionen || {};
    const dauer = o.dauer > 0 ? o.dauer : 1;
    /* Eigenfrequenz umgekehrt zur gewünschten Dauer, Dämpfung genau im
       Grenzfall: daempfung = 2 * Wurzel(haerte * masse). */
    const haerte = 100 / (dauer * dauer);
    const daempfung = 20 / dauer;
    const trenner = o.trenner || '';

    let verzoegerung = Math.max(0, Number(o.verzoegerung) || 0);
    let wert = 0;
    let ziel = Math.round(Number(o.bis) || 0);
    let tempo = 0;
    let los = false;    // Staffel abgelaufen, die Feder zieht?
    let uhr = 0;        // laufende Staffel
    let platz = 0;      // bisher breiteste Zahl in Zeichen

    function schreibe(zahl) {
      const ganz = String(Math.abs(Math.round(zahl)));
      return (zahl < 0 ? '-' : '') +
        (trenner ? ganz.replace(/\B(?=(\d{3})+$)/g, trenner) : ganz);
    }

    /* Die Zahl wächst von 0 auf 143 und damit von einer auf drei Stellen.
       Ohne reservierten Platz rutschten die Ziffern bei jedem
       Stellenwechsel zur Seite. Der Platz steht deshalb auf der breitesten
       bisher gesehenen Zahl und wird nie wieder kleiner. */
    function reserviere(zahl) {
      const stellen = schreibe(zahl).length;
      if (stellen <= platz) return;
      platz = stellen;
      knoten.style.minWidth = platz + 'ch';
    }

    function zeige() {
      knoten.textContent = schreibe(wert);
    }

    const werk = {
      rechne(dt) {
        let rest = dt;
        while (rest > 0) {
          const h = Math.min(SCHRITT, rest);
          rest -= h;
          tempo += ((ziel - wert) * haerte - tempo * daempfung) / MASSE * h;
          wert += tempo * h;
        }
        /* Fertig, sobald die Anzeige das Ziel ohnehin nicht mehr von sich
           unterscheidet: Eine halbe Stelle rundet bereits auf den Endwert. */
        if (Math.abs(ziel - wert) < 0.5) {
          wert = ziel;
          tempo = 0;
          laufend.delete(werk);
        }
        zeige();
      },
      springe() {
        wert = ziel;
        tempo = 0;
        zeige();
      },
    };

    function ziehe() {
      los = true;
      laufend.add(werk);
      wecke();
    }

    /* Die Staffel: Bis sie abgelaufen ist, steht die Null. Genau daraus
       entsteht im Kopf der Lauf von links nach rechts, wenn jede Tafel
       eine Spur später angestoßen wird als die vorige. */
    function stosse() {
      los = false;
      clearTimeout(uhr);
      if (verzoegerung > 0) uhr = window.setTimeout(ziehe, verzoegerung * 1000);
      else ziehe();
    }

    /* Vor dem Anstoß verschiebt ein neues Ziel nur die Ruhelage: Angezeigt
       wird weiter die Null, hochgezählt wird auf den zuletzt gesetzten
       Wert, sobald die Staffel abgelaufen ist. */
    function setze(neu) {
      ziel = Math.round(Number(neu) || 0);
      reserviere(ziel);
      if (ruhig) werk.springe();
      else if (los) ziehe();
    }

    /* Noch einmal von null: für jeden neuen Aufbau des Kopfes, also beim
       Laden der Seite, beim Wechsel des Bereichs und nach jeder Änderung
       an der Figurenliste. Ein einzelnes fertiges Bild ist kein Aufbau,
       dort schiebt setze() die Zahl nur um eins weiter. Die Staffel darf
       mitgegeben werden, weil dieselbe Tafel im anderen Bereich an einer
       anderen Stelle der Reihe stehen kann. */
    function vonVorn(warten) {
      if (warten !== undefined) verzoegerung = Math.max(0, Number(warten) || 0);
      if (ruhig) return werk.springe();
      laufend.delete(werk);
      wert = 0;
      tempo = 0;
      zeige();
      stosse();
    }

    reserviere(ziel);

    if (ruhig) {
      /* Ohne Bewegung steht die Zahl von Anfang an auf ihrem Wert. */
      werk.springe();
    } else {
      zeige();
      stosse();
    }

    return { setze, vonVorn, springe: werk.springe, knoten };
  };
})();
