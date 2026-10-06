/* Überschrift, deren Buchstaben ein Video zeigen.

   Die Schrift selbst bleibt gewöhnlicher Text im Fluss und ist damit für
   Vorlesegeräte und die Suche ganz normal lesbar. Sichtbar ist von ihr
   aber nichts: Sie steht durchsichtig da und gibt nur ihre Maße vor. Über
   ihr liegt das Video, und ein clipPath aus denselben Wörtern schneidet
   daraus die Buchstaben heraus.

   Aufbau eines fertigen Elements

       <h1 class="masked-heading">
         <span class="masked-heading__measure">          durchsichtiger Text
           <span class="masked-heading__word">Marvel<i/></span>
           <span class="masked-heading__word">Timeline<i/></span>
         </span>
         <svg class="masked-heading__defs">                    die Schablone
           <clipPath id="…"><text>Marvel</text><text>Timeline</text></clipPath>
         </svg>
         <span class="masked-heading__reveal">                das Video darin
           <span class="masked-heading__clip" style="clip-path:url(#…)">
             <span class="masked-heading__media"><video …></span>
           </span>
         </span>
       </h1>

   Die beiden Ebenen müssen deckungsgleich stehen, sonst stünden die
   Buchstaben des Videos neben denen des Textes. Dafür sorgt sync(): Es
   holt sich für jedes Wort die Position aus dem gesetzten Text und
   schreibt sie auf das zugehörige <text> der Schablone. Das kleine <i>
   hinter jedem Wort ist dabei der Trick für die Senkrechte. Es ist ein
   Kasten ohne Höhe und sitzt damit genau auf der Grundlinie, und die
   Grundlinie ist es, an der ein SVG-Text hängt.

   Die Schablone rechnet in userSpaceOnUse, ihre Koordinaten sind also die
   des Elements, das sie benutzt. Das ist .masked-heading__clip, und das
   liegt deckungsgleich auf der Überschrift. Genau in deren Koordinaten
   liefern offsetLeft und offsetTop die Wörter, weil die Überschrift
   position: relative trägt und damit ihr eigener Bezugspunkt ist.

   Das Video steht größer als sein Fenster (fillScale) und wandert darin
   langsam umher, dazu folgt es dem Zeiger. Bewegt wird dabei nur die
   Füllung, die Buchstaben stehen still. Die Regel, dass sich unter dem
   Zeiger keine Geometrie ändern darf, gilt Bedienelementen und ist hier
   nicht berührt.

   Ohne GSAP und ohne React, anders als die Vorlage. Das Projekt bringt
   außer Lenis keine Bibliothek mit, und die Blende braucht keine: Sie ist
   ein Hub von unten je Wort, versetzt gestartet und mit power4.out
   ausgerollt, und das sind drei Zeilen Rechnung in einer rAF-Schleife. */
(function () {
  'use strict';

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const clamp01 = (v) => clamp(v, 0, 1);

  /* power4.out aus GSAP: schnell los und lange sanft auslaufend. */
  const easeOut4 = (t) => 1 - Math.pow(1 - t, 4);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let nextId = 0;

  /* Die Werte der Vorlage. Jeder lässt sich am Element überschreiben, der
     Name wandert dafür in Bindestrich-Schreibung ins Attribut, aus
     fillScale wird also data-mh-fill-scale. */
  const DEFAULTS = {
    media: 'video',      // video oder image
    src: '',
    poster: '',
    fillScale: 1.25,     // wie viel größer das Video als sein Fenster steht
    parallax: 26,        // px, um die es dem Zeiger entgegenläuft
    drift: 18,           // px, um die es von selbst umherwandert
    brightness: 1,
    saturation: 1,
    grayscale: false,
    reveal: 'rise',      // rise, wipe, fade oder none
    duration: 1.1,       // Sekunden je Wort
    stagger: 0.09,       // Sekunden Versatz von Wort zu Wort
    trigger: 'view',     // view, load oder hover
    textScale: 0.115,    // Schriftgröße als Anteil der eigenen Breite, 0 = das Stylesheet bestimmt
    start: 0,            // Sekunde, ab der das Video laufen soll
    end: 0,              // Sekunde, an der es zurückspringt (0 = bis zum Schluss)
  };

  function options(node) {
    const d = node.dataset;
    const num = (key, fallback) => {
      const raw = d[key];
      if (raw === undefined || raw === '') return fallback;
      const v = parseFloat(raw);
      return Number.isFinite(v) ? v : fallback;
    };
    return {
      media: d.mhMedia || DEFAULTS.media,
      src: d.mhSrc || DEFAULTS.src,
      poster: d.mhPoster || DEFAULTS.poster,
      fillScale: num('mhFillScale', DEFAULTS.fillScale),
      parallax: num('mhParallax', DEFAULTS.parallax),
      drift: num('mhDrift', DEFAULTS.drift),
      brightness: num('mhBrightness', DEFAULTS.brightness),
      saturation: num('mhSaturation', DEFAULTS.saturation),
      grayscale: d.mhGrayscale === 'true',
      reveal: d.mhReveal || DEFAULTS.reveal,
      duration: num('mhDuration', DEFAULTS.duration),
      stagger: num('mhStagger', DEFAULTS.stagger),
      trigger: d.mhTrigger || DEFAULTS.trigger,
      textScale: num('mhTextScale', DEFAULTS.textScale),
      start: num('mhStart', DEFAULTS.start),
      end: num('mhEnd', DEFAULTS.end),
    };
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag) => document.createElementNS(SVG_NS, tag);

  /* Aus der bloßen Überschrift im Markup die drei Ebenen bauen. Der Text
     steht dort als gewöhnlicher Inhalt, damit die Seite auch ohne dieses
     Skript einen Titel hat. */
  function build(root) {
    if (root.dataset.mhReady === 'true') return null;
    const opt = options(root);
    const words = String(root.textContent).split(/\s+/).filter(Boolean);
    if (!words.length || !opt.src) return null;

    root.dataset.mhReady = 'true';
    root.textContent = '';
    root.classList.add('masked-heading');

    const clipId = 'mh-clip-' + (nextId += 1);

    const measure = document.createElement('span');
    measure.className = 'masked-heading__measure';

    const boxes = [];
    const bases = [];
    for (const word of words) {
      const box = document.createElement('span');
      box.className = 'masked-heading__word';
      box.textContent = word;
      const base = document.createElement('i');
      base.className = 'masked-heading__baseline';
      box.appendChild(base);
      measure.appendChild(box);
      boxes.push(box);
      bases.push(base);
    }

    /* Die Schablone steht in einem eigenen, unsichtbaren SVG. Ein clipPath
       zeichnet nichts, er muss nur über seine Kennung auffindbar sein. */
    const defs = svgEl('svg');
    defs.setAttribute('class', 'masked-heading__defs');
    defs.setAttribute('aria-hidden', 'true');
    defs.setAttribute('focusable', 'false');
    const defsNode = svgEl('defs');
    const clipPath = svgEl('clipPath');
    clipPath.setAttribute('id', clipId);
    clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');

    const glyphs = [];
    for (const word of words) {
      const text = svgEl('text');
      text.textContent = word;
      clipPath.appendChild(text);
      glyphs.push(text);
    }
    defsNode.appendChild(clipPath);
    defs.appendChild(defsNode);

    /* Drei Hüllen, jede mit einer Aufgabe: reveal blendet auf, clip
       schneidet die Buchstaben aus, media verschiebt und färbt. */
    const reveal = document.createElement('span');
    reveal.className = 'masked-heading__reveal';
    const clip = document.createElement('span');
    clip.className = 'masked-heading__clip';
    clip.style.clipPath = 'url(#' + clipId + ')';
    const media = document.createElement('span');
    media.className = 'masked-heading__media';

    let source;
    if (opt.media === 'video') {
      source = document.createElement('video');
      /* Ohne Bewegung soll es gar nicht erst anlaufen. Es hielte zwar
         gleich darauf wieder an (siehe spielen() weiter unten), aber die
         Sekunde dazwischen wäre umsonst geladen und dekodiert. */
      source.autoplay = !reduceMotion;
      source.loop = true;
      source.muted = true;
      source.playsInline = true;
      source.preload = 'auto';
      /* Beides zusätzlich als Attribut. Safari sieht auf iOS nur das
         Attribut und würde das Video sonst gar nicht erst starten. */
      source.setAttribute('muted', '');
      source.setAttribute('playsinline', '');
      if (opt.poster) source.poster = opt.poster;
    } else {
      source = document.createElement('img');
      source.alt = '';
      source.draggable = false;
    }
    source.className = 'masked-heading__source';
    source.src = opt.src;

    media.appendChild(source);
    clip.appendChild(media);
    reveal.appendChild(clip);

    root.appendChild(measure);
    root.appendChild(defs);
    root.appendChild(reveal);

    return { root, opt, words, measure, boxes, bases, glyphs, reveal, media, source };
  }

  function start(view) {
    const { root, opt, measure, boxes, bases, glyphs, reveal, media, source } = view;

    /* Wo die Füllung gerade steht (x, y) und wohin der Zeiger sie zieht
       (tx, ty). Zwischen beidem läuft die Bewegung weich nach. */
    const off = { x: 0, y: 0, tx: 0, ty: 0 };

    function place() {
      const w = root.clientWidth;
      const h = root.clientHeight;
      /* Über den eigenen Rand hinaus darf die Füllung nicht wandern, sonst
         stünde in einem Buchstaben plötzlich nichts. Wie weit sie darf,
         gibt der Überstand vor, den fillScale ihr verschafft. */
      const maxX = Math.max(0, ((opt.fillScale - 1) / 2) * w);
      const maxY = Math.max(0, ((opt.fillScale - 1) / 2) * h);
      media.style.transform =
        'translate3d(' + clamp(off.x, -maxX, maxX).toFixed(2) + 'px, ' +
        clamp(off.y, -maxY, maxY).toFixed(2) + 'px, 0) scale(' + opt.fillScale + ')';
      media.style.filter =
        'brightness(' + opt.brightness + ') saturate(' + opt.saturation + ')' +
        (opt.grayscale ? ' grayscale(1)' : '');
    }

    /* Die Schablone auf den gesetzten Text nachziehen. Nötig nach jeder
       Größenänderung und nach dem Nachladen der Schrift, weil sich dabei
       Schriftgröße und Umbruch ändern. */
    function sync() {
      /* Bei textScale 0 bleibt die Schriftgröße dem Stylesheet überlassen.
         Die Schablone braucht ihren Wert trotzdem, holt ihn dann aber aus
         der Rechnung des Browsers statt ihn selbst zu setzen. So kann eine
         Überschrift dieselbe clamp()-Kurve tragen wie ihre Geschwister auf
         den anderen Seiten. */
      if (opt.textScale > 0) {
        root.style.fontSize = clamp(root.clientWidth * opt.textScale, 20, 200).toFixed(1) + 'px';
      }
      const cs = window.getComputedStyle(measure);
      for (let i = 0; i < boxes.length; i += 1) {
        const glyph = glyphs[i];
        glyph.setAttribute('x', String(boxes[i].offsetLeft));
        glyph.setAttribute('y', String(bases[i].offsetTop));
        glyph.style.fontFamily = cs.fontFamily;
        glyph.style.fontSize = cs.fontSize;
        glyph.style.fontWeight = cs.fontWeight;
        glyph.style.fontStyle = cs.fontStyle;
        glyph.style.letterSpacing = cs.letterSpacing;
      }
      place();
    }

    sync();
    if (window.ResizeObserver) new ResizeObserver(sync).observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync).catch(() => {});

    /* ---------- Die Blende ----------

       Ein Hub von unten je Wort, versetzt gestartet. Verschoben wird der
       <text> der Schablone, es wandert also der Ausschnitt und nicht das
       Video: Die Buchstaben steigen herauf und geben dabei nach und nach
       den Blick auf eine ruhig stehende Füllung frei. */
    const riseDistance = () =>
      (parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15;

    let raf = 0;

    const settle = () => {
      for (const glyph of glyphs) glyph.style.transform = '';
      reveal.style.opacity = '';
      reveal.style.transform = '';
      reveal.style.clipPath = '';
    };

    const rest = () => {
      if (opt.reveal === 'rise') {
        const d = riseDistance();
        for (const glyph of glyphs) glyph.style.transform = 'translateY(' + d.toFixed(2) + 'px)';
      } else if (opt.reveal === 'wipe') {
        reveal.style.clipPath = 'inset(0% 100% 0% 0%)';
      } else if (opt.reveal === 'fade') {
        reveal.style.opacity = '0';
        reveal.style.transform = 'scale(1.08)';
      }
    };

    function play() {
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const dist = riseDistance();

      const step = (now) => {
        const t = (now - t0) / 1000;
        let done = true;
        if (opt.reveal === 'rise') {
          for (let i = 0; i < glyphs.length; i += 1) {
            const p = clamp01((t - i * opt.stagger) / opt.duration);
            if (p < 1) done = false;
            const y = (1 - easeOut4(p)) * dist;
            glyphs[i].style.transform = y < 0.01 ? '' : 'translateY(' + y.toFixed(2) + 'px)';
          }
        } else {
          const p = clamp01(t / opt.duration);
          if (p < 1) done = false;
          const e = easeOut4(p);
          if (opt.reveal === 'wipe') {
            reveal.style.clipPath = 'inset(0% ' + ((1 - e) * 100).toFixed(2) + '% 0% 0%)';
          } else {
            reveal.style.opacity = e.toFixed(3);
            reveal.style.transform = 'scale(' + (1.08 - 0.08 * e).toFixed(4) + ')';
          }
        }
        if (done) settle();
        else raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    /* ---------- Wandern und Zeiger ---------- */
    function wander() {
      let last = performance.now();
      let clock = 0;
      const tick = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        clock += dt;
        /* Zwei Sinuskurven mit ungleichen Perioden, damit die Bahn sich
           nicht sichtbar wiederholt. Senkrecht kleiner, weil dort weniger
           Überstand da ist als in der Breite. */
        const dx = Math.sin(clock * 0.21) * opt.drift;
        const dy = Math.cos(clock * 0.17) * opt.drift * 0.6;
        const ease = 1 - Math.exp(-dt / 0.18);
        off.x += (off.tx + dx - off.x) * ease;
        off.y += (off.ty + dy - off.y) * ease;
        place();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      if (opt.parallax > 0) {
        root.addEventListener('pointermove', (e) => {
          const r = root.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / (r.width || 1)) * 2 - 1;
          const ny = ((e.clientY - r.top) / (r.height || 1)) * 2 - 1;
          off.tx = clamp(nx, -1, 1) * -opt.parallax;
          off.ty = clamp(ny, -1, 1) * -opt.parallax;
        });
        root.addEventListener('pointerleave', () => { off.tx = 0; off.ty = 0; });
      }
    }

    if (!reduceMotion) wander();

    /* ---------- Auslöser ----------

       Erst wenn wirklich Bild da ist. Ein Video ohne ersten Frame füllt
       die Buchstaben mit nichts, und eine Überschrift, die beim Laden
       einen Moment lang leer dasteht, ist schlimmer als eine, die einen
       Wimpernschlag später auftaucht. */
    let started = false;
    const ready = () => {
      if (started) return;
      started = true;
      root.classList.add('is-loaded');
      if (opt.reveal === 'none' || reduceMotion) { settle(); return; }
      if (opt.trigger === 'hover') {
        settle();
        root.addEventListener('pointerenter', play);
        return;
      }
      if (opt.trigger === 'view' && window.IntersectionObserver) {
        rest();
        const io = new IntersectionObserver((entries) => {
          if (entries.some((e) => e.isIntersecting)) { io.disconnect(); play(); }
        }, { threshold: 0.25 });
        io.observe(root);
        return;
      }
      rest();
      play();
    };

    if (source.tagName === 'VIDEO') videoStart(view, ready);
    else if (source.complete) ready();
    else {
      source.addEventListener('load', ready, { once: true });
      source.addEventListener('error', ready, { once: true });
    }
  }

  /* ---------- Der Ausschnitt des Videos ----------

     Ein Vorspann fängt gewöhnlich auf Schwarz an und geht auf Schwarz aus.
     In den Buchstaben heißt Schwarz aber: nichts zu sehen, und ein Titel,
     der beim Laden vier Sekunden lang leer dasteht und das am Ende jeder
     Runde wiederholt, ist keiner. start und end schneiden deshalb das
     helle Stück heraus, und nur das läuft in der Schleife.

     Gestartet wird erst, wenn wirklich ein Bild von dieser Stelle da ist.
     Ohne das Warten stünde beim Laden für einen Moment der erste Frame in
     der Schrift, und der ist genau das Schwarz, das hier weg soll. */
  function videoStart(view, ready) {
    const { opt, source } = view;
    /* Ohne eigenes Ende bis kurz vor den Schluss der Datei. Die
       Zehntelsekunde Abstand gibt zurueck() die Gelegenheit, vor dem
       letzten Frame umzukehren, statt das Video auslaufen zu lassen. */
    const ende = () => (opt.end > 0 ? opt.end : Math.max(0, (source.duration || 0) - 0.1));

    /* Innerhalb des Ausschnitts bleiben. Die native Schleife des Videos
       springt auf 0 zurück und damit ins Schwarz, sie wird deshalb
       abgeschaltet, sobald ein Ausschnitt gesetzt ist. */
    const zurueck = () => {
      const bis = ende();
      if (bis > opt.start && source.currentTime >= bis - 0.05) {
        source.currentTime = opt.start;
      }
    };

    /* Läuft der Ausschnitt bis ans Ende der Datei, kommt das Video dort
       trotz allem manchmal an, bevor zurueck() den letzten Frame zu sehen
       bekommt. Dann steht es, denn die eigene Schleife ist abgeschaltet,
       und ein bloßes Zurücksetzen der Zeit startet es nicht wieder. */
    const wiederAnfangen = () => {
      source.currentTime = opt.start;
      if (reduceMotion) return;
      const p = source.play();
      if (p && p.catch) p.catch(() => {});
    };

    if (opt.start > 0 || opt.end > 0) {
      source.loop = false;
      /* Bildgenau prüfen, wo der Browser es kann. timeupdate meldet sich
         nur viermal in der Sekunde, und in einer Vierteldrehung wäre der
         Abspann schon angeschnitten. */
      if (source.requestVideoFrameCallback) {
        const takt = () => {
          zurueck();
          source.requestVideoFrameCallback(takt);
        };
        source.requestVideoFrameCallback(takt);
      } else {
        source.addEventListener('timeupdate', zurueck);
      }
      source.addEventListener('ended', wiederAnfangen);
    }

    /* Ohne Bewegung bleibt das Video auf einem Bild stehen. Die Buchstaben
       tragen dann eine ruhige Füllung statt eines Films, und das ist genau
       das, was die Einstellung verlangt. */
    const spielen = () => {
      if (reduceMotion) { source.pause(); return; }
      const p = source.play();
      if (p && p.catch) p.catch(() => {});
    };

    const anfangen = () => {
      if (opt.start > 0 && Math.abs(source.currentTime - opt.start) > 0.5) {
        source.addEventListener('seeked', () => { spielen(); ready(); }, { once: true });
        try { source.currentTime = opt.start; } catch (err) { spielen(); ready(); }
      } else {
        spielen();
        ready();
      }
    };

    if (source.readyState >= 1) anfangen();
    else source.addEventListener('loadedmetadata', anfangen, { once: true });

    /* Das Standbild zeigt der Browser von selbst, bis der erste Frame da
       ist. Es ist dasselbe Bild wie die Stelle, an der das Video anfängt,
       der Wechsel ist also nicht zu sehen. Weil es in einem Bruchteil der
       Zeit geladen ist, darf die Überschrift schon damit auftreten, statt
       auf elf Megabyte Video zu warten. */
    if (opt.poster) {
      const vorschau = new Image();
      vorschau.addEventListener('load', ready, { once: true });
      vorschau.src = opt.poster;
      if (vorschau.complete) ready();
    }

    /* Kommt das Video gar nicht, soll die Überschrift trotzdem erscheinen.
       Zu sehen ist dann zwar nichts, aber eine Seite, die auf ein
       fehlendes Video wartet, hat gar keinen Titel mehr. */
    source.addEventListener('error', ready, { once: true });
    setTimeout(ready, 6000);
  }

  function init(scope) {
    const nodes = (scope || document).querySelectorAll('[data-masked-heading]');
    for (const node of nodes) {
      const view = build(node);
      if (view) start(view);
    }
  }

  window.MaskedHeading = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
})();
