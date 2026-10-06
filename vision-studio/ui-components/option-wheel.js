/* Die Seitenwahl im Kopf: Timeline, Filme & Serien, Charaktere.

   Die Vorlage ist OptionWheel von React Bits. Die Einträge liegen dort
   nicht nebeneinander in einer Reihe, sondern senkrecht auf einem Rad,
   von dem immer nur ein Ausschnitt zu sehen ist. Der gewählte Eintrag
   steht scharf in der Mitte, seine Nachbarn stehen darüber und darunter,
   leiser und unschärfer, weil sie schon am Rand des Rades hängen.
   Gedreht wird mit dem Mausrad, mit gezogener Maus, mit den Pfeiltasten
   oder mit einem Klick auf einen Nachbarn.

   Das Rad läuft im Studio gerade und nicht auf einem Bogen: Die Einträge
   ziehen senkrecht übereinander durch, die Tiefe machen Deckkraft und
   Unschärfe. Der Bogen der Vorlage steckt trotzdem noch in der Rechnung
   und lässt sich über neigung anstellen. Er ist keine Kulisse: Die
   Einträge sitzen dann auf einem Kreis, dessen Radius den Abstand zweier
   Nachbarn auf dem Bogen genau eine Zeilenhöhe groß hält. Die Neigung
   sagt, um wie viel Grad ein Schritt weiterdreht, und daraus folgt der
   Radius.

   Hier ist es dieselbe Idee ohne React, an drei Stellen dem Studio
   angepasst:

     1. Die Vorlage baut ihre Einträge selbst aus einem Array. Hier steht
        die Reihe schon in index.html, wie bei allen Teilen der
        Oberfläche. Diese Datei liest sie und hängt sich daran.

     2. Schriftgröße und Farben stehen im Stilblatt und nicht im Aufruf.
        Die Zeilenhöhe folgt der gemessenen Schriftgröße, damit das Rad
        auch dann stimmt, wenn die Reiter daneben einmal andere Maße
        bekommen.

     3. Der Aufrufer darf einen Wechsel ablehnen. Im Studio kann ein
        angefangener Text im Weg stehen. Sagt beiWahl nein, dreht das Rad
        auf den alten Eintrag zurück, und ein laufendes Ziehen bricht ab.

   Aufruf:
       const rad = optionWheel(document.getElementById('seiten'), {
         beiWahl: (name) => wechsleSeite(name),   // false lehnt ab
       });
       rad.setze('timeline');         // von außen, ohne beiWahl zu rufen
       rad.setze('timeline', true);   // dasselbe, aber gedreht statt gesetzt

   Wer die Bewegung abbestellt hat (prefers-reduced-motion), bekommt das
   Rad ohne Fahrt: Der neue Eintrag steht sofort in der Mitte. */

(function () {
  'use strict';

  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');

  window.optionWheel = function (behaelter, optionen) {
    const o = optionen || {};
    const eintraege = [...behaelter.querySelectorAll('[data-seite]')];
    if (!eintraege.length) return null;

    const anzahl = eintraege.length;
    const beiWahl = o.beiWahl || (() => {});

    /* Der Abstand zweier Nachbarn, als Vielfaches der Schriftgröße. Die
       Größe selbst kommt aus dem Stilblatt: Das Rad steht neben den
       Reitern und soll deren Schrift tragen und keine eigene. */
    const abstand = o.abstand || 1.4;
    /* Grad je Schritt, und damit die Krümmung des Rades. Die Vorlage
       nimmt 6, sie hat aber ein hohes Rad mit kurzen Wörtern. Im Kopf des
       Studios ist das Rad eine Zeile hoch und die Wörter sind breit, und
       weil jeder Eintrag um seine linke Kante kippt, höbe schon ein
       kleiner Winkel das rechte Ende aus dem Ausschnitt. Deshalb steht
       hier null: Die Einträge laufen gerade übereinander durch, die Tiefe
       machen allein Deckkraft und Unschärfe. */
    const neigung = (o.neigung || 0) * Math.PI / 180;
    const bogen = o.bogen == null ? 1 : o.bogen;        // wie weit es einzieht
    const unschaerfe = o.unschaerfe == null ? 1.4 : o.unschaerfe;
    const blenden = o.blenden == null ? 0.5 : o.blenden;
    const mindest = o.mindest == null ? 0.08 : o.mindest;
    const glaettung = o.glaettung || 170;               // ms bis fast am Ziel
    const rechts = o.seite === 'rechts';

    let zeile = 18;          // Zeilenhöhe in Pixeln, gemessen in miss()
    let stand = 0;           // wo das Rad steht, mit Nachkommastellen
    let ziel = 0;            // wohin es läuft
    let gewaehlt = Math.max(0, eintraege.findIndex((el) => el.classList.contains('an')));
    let bild = null;         // das laufende requestAnimationFrame
    let zuletzt = 0;
    let zug = null;          // das laufende Ziehen
    let gezogen = false;     // erst ab ein paar Pixeln ist es ein Ziehen
    let radUhr = null;       // rastet ein, wenn das Mausrad zur Ruhe kommt

    stand = ziel = gewaehlt;

    /* ---------- Maße ----------

       Die Breite des Behälters ist die des längsten Eintrags. Die
       Einträge liegen absolut, tragen also nichts zur Breite bei, und
       ohne Maß fiele der Kasten auf null zusammen und die Reiter daneben
       rückten unter das Rad. */
    function miss() {
      const stil = getComputedStyle(eintraege[0]);
      zeile = Math.max(parseFloat(stil.fontSize) * abstand, 1);
      let breit = 0;
      for (const el of eintraege) breit = Math.max(breit, el.offsetWidth);
      const rand = parseFloat(getComputedStyle(behaelter).getPropertyValue('--rad-rand')) || 0;
      behaelter.style.setProperty('--rad-breite', Math.ceil(breit + rand) + 'px');
    }

    /* ---------- Die Fahrt ----------

       Ein einziges Bild für alles: Der Stand läuft dem Ziel hinterher,
       und zwar unabhängig von der Bildrate. Danach wird jeder Eintrag
       nach seinem Abstand zur Mitte gelegt. Steht das Rad, hört die
       Schleife auf, sie läuft also nur, solange sich etwas bewegt. */
    function zeichne(jetzt) {
      const dt = Math.min((jetzt - zuletzt) / 1000, 0.05);
      zuletzt = jetzt;
      const k = 1 - Math.exp(-dt / (glaettung / 1000));
      let neu = stand + (ziel - stand) * k;
      const steht = Math.abs(ziel - neu) < 0.001;
      if (steht) neu = ziel;
      stand = neu;

      /* Der Radius, der einen Schritt genau eine Zeile lang macht. Ohne
         Neigung gibt es keinen Kreis, dann laufen die Einträge gerade
         übereinander durch, und genau so steht es im Studio. */
      const spiegel = rechts ? -1 : 1;
      const r = neigung > 0.0005 ? zeile / neigung : 0;

      for (let i = 0; i < anzahl; i++) {
        const el = eintraege[i];
        const d = i - stand;
        const weite = Math.abs(d);
        let x = 0;
        let y = d * zeile;
        let dreh = 0;
        if (r > 0) {
          const w = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * neigung));
          y = r * Math.sin(w);
          x = -spiegel * r * (1 - Math.cos(w)) * bogen;
          dreh = spiegel * w * 180 / Math.PI;
        }
        el.style.transform = 'translate(' + x.toFixed(2) + 'px, calc('
          + y.toFixed(2) + 'px - 50%)) rotate(' + dreh.toFixed(3) + 'deg)';
        el.style.opacity = String(Math.max(mindest, 1 - weite * blenden));
        el.style.filter = unschaerfe > 0
          ? 'blur(' + (weite * unschaerfe).toFixed(2) + 'px)' : 'none';
        /* Geht von 0 auf 1, während ein Eintrag in die Mitte läuft. Das
           Stilblatt mischt daraus seine Farbe. */
        el.style.setProperty('--nah', Math.max(0, 1 - Math.min(weite, 1)).toFixed(3));
      }

      bild = steht ? null : requestAnimationFrame(zeichne);
    }

    function starte() {
      if (bild != null) cancelAnimationFrame(bild);
      bild = null;
      zuletzt = performance.now();
      /* Ohne Bewegung steht der neue Eintrag sofort in der Mitte. Ein
         Bild wird trotzdem gezeichnet, sonst läge gar nichts. */
      if (ruhig.matches) { stand = ziel; zeichne(zuletzt); return; }
      bild = requestAnimationFrame(zeichne);
    }

    /* ---------- Wahl ---------- */

    function markiere() {
      eintraege.forEach((el, i) => {
        el.classList.toggle('an', i === gewaehlt);
        el.setAttribute('aria-selected', String(i === gewaehlt));
      });
      if (eintraege[gewaehlt].id) {
        behaelter.setAttribute('aria-activedescendant', eintraege[gewaehlt].id);
      }
    }

    /* Sagt der Aufrufer nein, bleibt die Wahl stehen. Zurückgedreht wird
       in setzeZiel, denn nur dort ist bekannt, ob gerade gezogen wird. */
    function melde(i) {
      if (beiWahl(eintraege[i].dataset.seite, i) === false) return false;
      gewaehlt = i;
      markiere();
      return true;
    }

    function setzeZiel(wert, rasten) {
      let v = Math.min(Math.max(wert, 0), anzahl - 1);
      if (rasten) v = Math.round(v);
      ziel = v;
      const i = Math.min(Math.max(Math.round(v), 0), anzahl - 1);
      if (i !== gewaehlt && !melde(i)) {
        ziel = gewaehlt;
        /* Ein abgelehnter Wechsel bricht das Ziehen ab. Sonst stünde die
           Frage bei der nächsten Mausbewegung gleich wieder da. */
        zug = null;
        behaelter.classList.remove('zieht');
      }
      starte();
    }

    /* ---------- Mausrad ----------

       Von Hand angehängt, weil der Zuhörer die Seite am Rollen hindern
       muss und das nur ohne passive geht. Eingerastet wird erst, wenn das
       Rad zur Ruhe kommt, sonst spränge es bei jedem Zacken. */
    behaelter.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const weg = ev.deltaMode === 1 ? ev.deltaY * 24 : ev.deltaY;
      /* Ein Ereignis ist höchstens ein Schritt. Ein Mausrad mit Rasten
         geht damit pro Zacken genau einen Eintrag weiter, ein Trackpad
         läuft weiter durch. */
      setzeZiel(ziel + Math.max(-1, Math.min(1, weg / zeile)), false);
      clearTimeout(radUhr);
      radUhr = setTimeout(() => setzeZiel(ziel, true), 140);
    }, { passive: false });

    /* ---------- Ziehen ---------- */

    behaelter.addEventListener('pointerdown', (ev) => {
      zug = { y: ev.clientY, start: ziel, id: ev.pointerId };
      gezogen = false;
    });

    behaelter.addEventListener('pointermove', (ev) => {
      if (!zug) return;
      const dy = ev.clientY - zug.y;
      if (!gezogen && Math.abs(dy) > 4) {
        gezogen = true;
        behaelter.classList.add('zieht');
        /* Erst jetzt den Zeiger einfangen. Vorher bliebe ein einfacher
           Klick am Behälter hängen und käme nie beim Eintrag an. */
        behaelter.setPointerCapture(zug.id);
      }
      if (gezogen) setzeZiel(zug.start - dy / zeile, false);
    });

    function losgelassen() {
      if (!zug) return;
      zug = null;
      behaelter.classList.remove('zieht');
      if (gezogen) setzeZiel(ziel, true);
    }

    behaelter.addEventListener('pointerup', losgelassen);
    behaelter.addEventListener('pointercancel', losgelassen);

    /* ---------- Klick und Tasten ---------- */

    behaelter.addEventListener('click', (ev) => {
      /* Nach einem Ziehen kommt noch ein Klick hinterher. Der zählt
         nicht, sonst spränge das Rad am Ende jeder Fahrt noch einmal. */
      if (gezogen) { gezogen = false; return; }
      const el = ev.target.closest('[data-seite]');
      if (el) setzeZiel(eintraege.indexOf(el), true);
    });

    behaelter.addEventListener('keydown', (ev) => {
      let schritt = 0;
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') schritt = -1;
      else if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') schritt = 1;
      if (!schritt) return;
      ev.preventDefault();
      setzeZiel(Math.round(ziel) + schritt, true);
    });

    /* ---------- Nachführen ----------

       Breite und Zeilenhöhe hängen an der Schrift. Die steht beim ersten
       Bild noch nicht fest, und ein schmaleres Fenster kann sie später
       noch einmal ändern. */
    new ResizeObserver(() => { miss(); starte(); }).observe(behaelter);
    if (document.fonts) document.fonts.ready.then(() => { miss(); starte(); });

    miss();
    markiere();
    starte();

    return {
      /* Von außen gesetzt, ohne Rückfrage: Wer auf einen Reiter der
         anderen Seite klickt, hat die Seite damit schon gewechselt. Mit
         sanft dreht das Rad dorthin, ohne springt es. */
      setze(name, sanft) {
        const i = eintraege.findIndex((el) => el.dataset.seite === name);
        if (i < 0 || i === gewaehlt) return;
        gewaehlt = i;
        ziel = i;
        if (!sanft) stand = i;
        markiere();
        starte();
      },
      /* Welche Seite gerade gilt. */
      seite() {
        return eintraege[gewaehlt].dataset.seite;
      },
    };
  };
})();
