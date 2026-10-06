/* Der Übergang der ganzen Figurenansicht.

   Beim Blättern wechselt nicht nur ein Bild, sondern alles: Namen,
   Beschreibung, Bühne, Fassungen, Auftritte, Begegnungen. Bisher lösten
   sich nur die beiden Bilder auf (js/portrait-morph.js), der Rest sprang
   um. Hier geht die ganze Fläche über, und stehen bleiben allein die drei
   Schaltflächen oben rechts: Sie gehören nicht zur Figur, sondern zur
   Ansicht, und wer weiterblättert, zielt schon auf den nächsten Klick.

   Der Weg dorthin ist ein Abzug des alten Standes. Vor dem Umbau wird die
   Ansicht geklont und der Klon deckungsgleich darübergelegt. Der Umbau
   läuft danach unsichtbar darunter ab, und erst dann blenden beide
   Schichten gegeneinander über: Der Klon zerfließt und verschwindet, die
   neue Ansicht kommt aus derselben Verzerrung heraus.

   Gerechnet wird das nicht im eigenen Shader, sondern von der Seite
   selbst. Ein Filter aus feTurbulence und feDisplacementMap verzieht
   jede der beiden Schichten, und der Ausschlag hängt an sin(p·π): Am
   Anfang und am Ende steht die Ansicht unverzerrt da, dazwischen fließt
   sie. Ein zweiter Filter dreht das Vorzeichen, damit die Schichten
   auseinander- und wieder zusammenlaufen statt gemeinsam zu wandern.

   Regler in der Konsole:

     PageMorph.set({ intensity: 0.8, duration: 1.2 })
     PageMorph.set({ enabled: false })     zurück zum harten Wechsel
     PageMorph.get()

   Wer weniger Bewegung verlangt, bekommt eine kurze Blende ohne
   Verzerrung. */
(function () {
  'use strict';

  const CFG = {
    /* Ob überhaupt übergeblendet wird. */
    enabled: true,
    /* Wie lange, in Sekunden. */
    duration: 0.9,
    /* Wie weit die Fläche dabei verzogen wird, gemessen in Bildpunkten
       Ausschlag auf dem Höhepunkt. */
    intensity: 0.55,
    /* Wie grob das Rauschen ist, das die Verzerrung führt. Kleine Werte
       geben lange Schlieren, große ein feines Zittern. */
    grain: 0.9,
    /* Wie stark die Fläche dabei atmet. */
    zoom: 0.14,
    /* Wie weich die alte Schicht in die neue übergeht: 0 ist eine reine
       Blende, 1 löst sie fleckig auf. */
    dissolve: 0.85,
  };

  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  /* ---------- Die beiden Filter ----------

     Beide sind gleich gebaut und unterscheiden sich nur im Vorzeichen
     ihres Ausschlags. Angelegt werden sie einmal, danach ändert die
     Bildschleife nur noch Zahlen daran.

     Die Turbulenz selbst bleibt dabei unangetastet: Sie ist der teure
     Teil des Filters, und solange ihre Werte stehen, rechnet der Browser
     sie nur ein einziges Mal. Bewegung kommt aus der Verschiebung, nicht
     aus neuem Rauschen. */
  let defs = null;
  const parts = {};

  function build() {
    if (defs) return;
    Object.assign(parts, filterPair('page-morph',
      { freq: 0.004, octaves: 2, seed: 11, margin: 6 }));
    defs = true;
  }

  /* Legt zwei Filter an, id-out für die abgehende und id-in für die
     kommende Schicht, und gibt ihre verstellbaren Teile zurück. Die
     Ansicht als Ganzes nimmt ein solches Paar, der Schatten auf der
     Bühne ein zweites mit eigenem Rauschen (siehe warp weiter unten).

     freq, octaves und seed bestimmen das Rauschen, margin den Rand um
     die Fläche in Prozent, both, ob auch die kommende Seite eine Maske
     bekommt. */
  function filterPair(id, opts) {
    const o = Object.assign(
      { freq: 0.004, octaves: 2, seed: 11, margin: 6, both: false }, opts || {});
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'page-morph-defs');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    const teile = {};

    for (const side of ['out', 'in']) {
      const filter = document.createElementNS(NS, 'filter');
      filter.setAttribute('id', id + '-' + side);
      /* Der Ausschlag zieht Bildpunkte von außerhalb herein, deshalb
         etwas Rand um die Fläche. */
      filter.setAttribute('x', -o.margin + '%');
      filter.setAttribute('y', -o.margin + '%');
      filter.setAttribute('width', (100 + 2 * o.margin) + '%');
      filter.setAttribute('height', (100 + 2 * o.margin) + '%');
      filter.setAttribute('color-interpolation-filters', 'sRGB');

      const noise = document.createElementNS(NS, 'feTurbulence');
      noise.setAttribute('type', 'fractalNoise');
      noise.setAttribute('baseFrequency', String(o.freq));
      noise.setAttribute('numOctaves', String(o.octaves));
      /* Beide Schichten tragen dasselbe Rauschen. Nur so lösen sie sich
         genau gegenläufig auf: Wo die alte aufreißt, steht die neue, und
         nirgends klafft ein Loch, durch das der Grund schiene. */
      noise.setAttribute('seed', String(o.seed));
      noise.setAttribute('result', 'noise');
      filter.append(noise);

      const warp = document.createElementNS(NS, 'feDisplacementMap');
      warp.setAttribute('in', 'SourceGraphic');
      warp.setAttribute('in2', 'noise');
      warp.setAttribute('scale', '0');
      warp.setAttribute('xChannelSelector', 'R');
      warp.setAttribute('yChannelSelector', 'G');
      warp.setAttribute('result', 'warped');
      filter.append(warp);

      /* Die fleckige Auflösung: Aus demselben Rauschen wird eine Maske
         mit wandernder Schwelle, und die verzerrte Schicht steht nur
         dort, wo die Maske deckt. Der steile Anstieg macht aus dem
         weichen Rauschen eine harte Kante, sonst wäre es wieder nur eine
         Blende.

         Die abgehende Seite bekommt sie immer, die kommende nur mit
         both. Die neue Ansicht beim Blättern bleibt ganz und braucht die
         Maske nicht (siehe setMask), zwei Schatten auf derselben Fläche
         dagegen lösen sich gegenläufig ab (siehe schwelle). */
      let funcA = null;
      if (side === 'out' || o.both) {
        const mask = document.createElementNS(NS, 'feComponentTransfer');
        mask.setAttribute('in', 'noise');
        mask.setAttribute('result', 'mask');
        funcA = document.createElementNS(NS, 'feFuncA');
        funcA.setAttribute('type', 'linear');
        funcA.setAttribute('slope', '0');
        funcA.setAttribute('intercept', side === 'out' ? '1' : '0');
        mask.append(funcA);
        filter.append(mask);

        const cut = document.createElementNS(NS, 'feComposite');
        cut.setAttribute('in', 'warped');
        cut.setAttribute('in2', 'mask');
        cut.setAttribute('operator', 'in');
        filter.append(cut);
      }

      svg.append(filter);
      teile[side] = { warp, funcA };
    }

    document.body.append(svg);
    return teile;
  }

  /* ---------- Der Abzug ---------- */

  let stage = null;      // die Fläche, auf der der Abzug liegt und endet
  let ghost = null;      // der Klon des alten Inhalts
  let host = null;       // der Inhalt selbst
  let raf = 0;
  let run = null;
  let ticket = 0;

  /* power1.inOut, eine Spur flacher als die Kurve des Bildübergangs.

     Mit der kubischen Kurve von dort geschieht am Anfang und am Ende
     fast nichts und alles auf einmal in der Mitte. Beim einzelnen Bild
     fällt das nicht auf, über die ganze Ansicht schon: Sie steht, springt
     und steht wieder. */
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function clear() {
    if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
    stage = null;
    ghost = null;
    if (host) {
      host.style.removeProperty('filter');
      host.style.removeProperty('clip-path');
      host.style.removeProperty('opacity');
      host.style.removeProperty('transform');
      host.classList.remove('page-morphing');
    }
    host = null;
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    const held = run;
    run = null;
    clear();
    if (held && held.resolve) held.resolve();
  }

  const API = {
    set(next) {
      Object.assign(CFG, next || {});
      return Object.assign({}, CFG);
    },

    get() {
      return Object.assign({}, CFG);
    },

    /* Legt den Abzug an und deckt die Ansicht damit zu. Was danach in ihr
       umgebaut wird, sieht niemand.

       port ist die rollende Fläche, flow der Inhalt darin. Abgezogen und
       später verzogen wird nur der Inhalt: Die Rollleiste gehört der
       Fläche, und die Fläche ist zugleich der Rahmen, an dem der Abzug
       endet.

       Zurück kommt der Abzug selbst, oder nichts, wenn kein Übergang
       gewünscht ist. Wer nichts bekommt, wechselt wie eh und je. */
    take(port, flow) {
      if (!CFG.enabled || !port || !flow || !port.parentNode) return null;
      /* Was noch läuft, ist damit erledigt: Der neue Abzug zeigt ohnehin
         den Stand von jetzt, samt allem, was der alte Übergang gerade im
         Bild hatte. */
      stop();
      build();

      const box = port.getBoundingClientRect();
      const eltern = port.parentNode.getBoundingClientRect();
      const klon = flow.cloneNode(true);

      /* Ein zweites Mal dieselben Kennungen im Baum wären für
         aria-labelledby und für jedes getElementById ein Ärgernis. Der
         Abzug ist ein Bild und braucht keine. */
      klon.removeAttribute('id');
      for (const el of klon.querySelectorAll('[id]')) el.removeAttribute('id');
      /* Leinwände kommen leer aus dem Klon: Ihr Inhalt hängt am Kontext,
         nicht am Element. Das Bild darunter steht ohnehin schon da. */
      for (const el of klon.querySelectorAll('canvas')) el.remove();
      klon.setAttribute('aria-hidden', 'true');
      /* Der Abzug enthält Schaltflächen und Verweise wie das Original.
         Ohne inert stünden sie für die Dauer des Übergangs ein zweites
         Mal in der Tabreihenfolge, und zwar vor den echten. */
      klon.setAttribute('inert', '');
      klon.classList.add('page-morph-ghost');

      /* Die Fläche, auf der der Abzug liegt. Sie deckt sich mit dem
         sichtbaren Ausschnitt der rollenden Fläche, also ohne deren
         Leiste, und beschneidet den Abzug an ihren Kanten. Was der
         Übergang darüber hinauszieht, ist damit fort, statt die Ränder
         der Ansicht wellig zu machen. */
      const buehne = document.createElement('div');
      buehne.className = 'page-morph-stage';
      buehne.setAttribute('aria-hidden', 'true');
      buehne.style.left = (box.left - eltern.left) + 'px';
      buehne.style.top = (box.top - eltern.top) + 'px';
      buehne.style.width = port.clientWidth + 'px';
      buehne.style.height = port.clientHeight + 'px';

      /* Der Abzug ist der Inhalt in voller Länge, nicht der Ausschnitt.
         Statt ihn zu rollen, wird er um die Rollhöhe nach oben gesetzt:
         Dasselbe Bild, aber ohne eigene Leiste und ohne die Frage, ob
         ein Kasten mit overflow: hidden sich überhaupt rollen lässt. */
      klon.style.position = 'absolute';
      klon.style.left = '0';
      klon.style.top = (-port.scrollTop) + 'px';
      klon.style.width = port.clientWidth + 'px';
      klon.style.pointerEvents = 'none';

      buehne.append(klon);
      port.parentNode.insertBefore(buehne, port.nextSibling);

      stage = buehne;
      ghost = klon;
      host = flow;
      return { port, flow, at: performance.now() };
    },

    /* Blendet den Abzug auf die inzwischen umgebaute Ansicht über. */
    play(shot, dir) {
      if (!shot || !ghost || !host) {
        clear();
        return Promise.resolve();
      }
      const mine = ++ticket;
      const sanft = reduced && reduced.matches;
      const dauer = (sanft ? Math.min(CFG.duration, 0.4) : CFG.duration) * 1000;
      const stark = sanft ? 0 : CFG.intensity;
      const seite = dir < 0 ? -1 : 1;

      /* Wer weniger Bewegung verlangt, bekommt eine schlichte Blende:
         kein Verziehen, kein Aufreißen, keine Filter. */
      if (!sanft) {
        ghost.style.filter = 'url(#page-morph-out)';
        host.style.filter = 'url(#page-morph-in)';
        /* Der Schnitt an den eigenen Kanten. Die rollende Fläche
           darüber beschneidet erst an ihrer Innenkante, und die schließt
           die Rinne der Rollleiste mit ein: Ohne diese Zeile ragte der
           gewachsene Inhalt genau dort hinein und die Leiste bekäme den
           Übergang ab. Der Abzug daneben braucht sie nicht, er liegt
           schon auf einer Fläche, die ihn beschneidet. */
        host.style.clipPath = 'inset(0)';
      }
      host.classList.add('page-morphing');

      return new Promise(resolve => {
        run = { resolve };
        const schritt = now => {
          if (mine !== ticket || !run) return;
          if (!run.t0) run.t0 = now;
          const roh = Math.min((now - run.t0) / Math.max(dauer, 50), 1);
          const p = ease(roh);
          /* Die Glocke über dem Übergang, etwas breiter als die reine
             Sinuskurve: Sonst geschieht das meiste in einem Augenblick um
             die Mitte, und davor wie danach steht die Ansicht scheinbar
             still. Null bleibt sie an beiden Enden trotzdem. */
          const env = Math.pow(Math.sin(p * Math.PI), 0.7);

          if (sanft) {
            ghost.style.opacity = (1 - p).toFixed(3);
            if (roh < 1) {
              raf = requestAnimationFrame(schritt);
              return;
            }
            stop();
            return;
          }

          /* Der Ausschlag in Bildpunkten. Die abgehende Schicht zieht in
             die eine Richtung, die kommende aus der anderen heraus.

             Er bleibt bewusst moderat. Die Ansicht bringt keinen eigenen
             Grund mit, sie besteht aus dem schwarzen Band oben und dem
             weißen darunter. Was die Verzerrung zur Seite zieht, lässt
             also ein Loch zurück, durch das die Rasterseite schaut, und
             ab etwa hundert Punkten wird daraus ein Schlierenmuster
             statt eines Übergangs. */
          const weit = env * stark * 90;
          parts.out.warp.setAttribute('scale', (weit * seite).toFixed(2));
          parts.in.warp.setAttribute('scale', (-weit * seite).toFixed(2));

          /* Die Schwelle der fleckigen Auflösung wandert mit der Zeit. */
          setMask(p, CFG.dissolve);

          /* Beide Schichten wachsen ein wenig: Der Zuwachs schiebt
             Material über die Ränder nach, die die Verzerrung sonst leer
             zieht, und gibt dem Verschwinden eine Richtung.

             Der Abzug darf das ohne Weiteres, er liegt auf einer Fläche,
             die ihn beschneidet. Die neue Lage darunter muss sich selbst
             beschneiden, und zwar um genau so viel, wie ihr Zuwachs
             beträgt: Ein Schnitt greift vor der Vergrößerung, und was
             danach über die Kante ragt, landete in der Rinne der
             Rollleiste. Nach dem Zuwachs liegt der Schnitt damit wieder
             exakt auf der Kante. */
          const atem = env * CFG.zoom * 0.1;
          const gross = 1 + atem;
          ghost.style.transform = 'scale(' + gross + ')';
          host.style.transform = 'scale(' + gross + ')';
          host.style.clipPath = 'inset(' + ((1 - 1 / gross) / 2 * 100).toFixed(4) + '%)';

          if (roh < 1) {
            raf = requestAnimationFrame(schritt);
            return;
          }
          stop();
        };
        raf = requestAnimationFrame(schritt);
      });
    },

    /* Bricht ab, was läuft, und räumt den Abzug weg. */
    cancel: stop,
  };

  /* Die Maske der abgehenden Schicht auf den Stand des Übergangs
     bringen.

     Aus dem Rauschen wird eine Schwelle: Die alte Ansicht steht noch,
     wo das Rauschen über ihr liegt, und ist fort, wo es darunter liegt.
     Die Gerade davor ist steil, damit daraus eine Kante wird und keine
     Blende. Wie steil, sagt der Regler dissolve; bei 0 bleibt eine
     weiche Überblendung.

     Aufreißen darf dabei nur die obere Schicht. Die neue darunter bleibt
     ganz, und deshalb steht an jeder Stelle immer genau eine von beiden.
     Zwei halb durchsichtige Schichten übereinander decken zusammen nur
     drei Viertel, und das fehlende Viertel wäre die Rasterseite hinter
     der Ansicht, die als grauer Schleier durchschiene.

     Die Schwelle wandert nur durch den Bereich, in dem das Rauschen
     überhaupt Werte hat. Liefe sie von 0 bis 1, geschähe die halbe Zeit
     über nichts und der Wechsel fiele in einen kurzen Augenblick in der
     Mitte. Die Enden werden festgenagelt: Bei 0 steht die alte Ansicht
     ganz, bei 1 ist sie ganz fort. */
  function setMask(p, dissolve) {
    schwelle(parts.out.funcA, p, dissolve, false);
  }

  /* Eine Maske auf den Stand p bringen. gegen dreht sie um: Dann deckt
     sie genau dort, wo die andere offen ist, und beide zusammen ergeben
     an jeder Stelle eine ganze Schicht. */
  function schwelle(funcA, p, dissolve, gegen) {
    if (!funcA) return;
    if (p <= 0) {
      hart(funcA, gegen ? 0 : 1);
      return;
    }
    if (p >= 1) {
      hart(funcA, gegen ? 1 : 0);
      return;
    }
    const kante = 1 + dissolve * 13;
    const lage = 0.08 + 0.84 * p;
    funcA.setAttribute('slope', (gegen ? -kante : kante).toFixed(2));
    funcA.setAttribute('intercept',
      (gegen ? 0.5 + kante * lage : 0.5 - kante * lage).toFixed(3));
  }

  function hart(funcA, wert) {
    funcA.setAttribute('slope', '0');
    funcA.setAttribute('intercept', String(wert));
  }

  /* ---------- Ein Filterpaar für andere Stellen ----------

     Dasselbe Verfahren taugt auch im Kleinen. Der Schatten auf der
     Erscheinungsbühne etwa ist kein Bild, das eine Leinwand übernehmen
     könnte, sondern zwei geworfene Kopien der Figur aus dem Stylesheet.
     Er geht deshalb mit einem solchen Paar über, auf den Ebenen, auf
     denen er ohnehin liegt (siehe castMorph in js/characters.js).

     Zurück kommt ein Paar mit den beiden Filtern als fertige Werte für
     style.filter und mit step(p, weit, dissolve), das beide auf einen
     Stand bringt. Mit both: true reißen beide Seiten auf, gegenläufig.
     Das ist dort richtig, wo keine der beiden Schichten decken muss, wie
     bei zwei Schatten auf derselben Fläche. Ein Paar wird einmal
     angelegt und danach unter seinem Namen wiederverwendet. */
  const pairs = new Map();

  function warp(id, opts) {
    let paar = pairs.get(id);
    if (paar) return paar;
    const teile = filterPair(id, opts);
    const beide = !!(opts && opts.both);
    paar = {
      out: 'url(#' + id + '-out)',
      in: 'url(#' + id + '-in)',
      step(p, weit, dissolve) {
        teile.out.warp.setAttribute('scale', weit.toFixed(2));
        teile.in.warp.setAttribute('scale', (-weit).toFixed(2));
        schwelle(teile.out.funcA, p, dissolve, false);
        if (beide) schwelle(teile.in.funcA, p, dissolve, true);
      },
    };
    pairs.set(id, paar);
    return paar;
  }

  API.warp = warp;
  window.PageMorph = API;
})();
