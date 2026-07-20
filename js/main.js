/* Baut Navigation + Phasen-Timelines aus PHASES (js/data.js) auf.

   Scrolling: Lenis (Smooth Scroll); die Seite scrollt ganz normal
   vertikal. Jede Timeline ist ein natives horizontales Scroll-Element –
   nur Mausrad-Scrollen direkt über der Zeitskala schiebt sie (geglättet)
   horizontal. Ist sie in Scrollrichtung am Anschlag, läuft das Event an
   Lenis weiter und die Seite scrollt normal vertikal weiter.

   Ein-/Ausblendungen (Hero-Ausblendung, Timeline-Einträge) sind scroll-
   gekoppelt (Scrub): opacity/transform werden pro Frame aus der Position
   im Viewport berechnet. Nur die Hero-Intro-Choreografie beim Laden läuft
   zeitbasiert über CSS-Transitions (.hero.ready). */
(function () {
  'use strict';

  const nav = document.getElementById('phase-nav');
  const phaseRoot = document.getElementById('phases');
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navLinks = new Map();
  const byId = new Map(PHASES.map(p => [p.id, p]));
  const strips = [];   // { section, viewport, timeline, overflow, entries[] }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- Logo-Normalisierung ----------

     Logo-PNGs kommen mit unterschiedlichen Seitenverhältnissen und
     unterschiedlich viel transparentem Rand. Würden alle auf Boxbreite
     skaliert, wirkten breite Logos kleiner als kompakte. Deshalb wird
     jedes Logo auf die gleiche sichtbare Fläche gebracht wie die
     Referenz iron-man.png – die gilt als Standardgröße.

     Der sichtbare Inhalt (Alpha-Bounding-Box) wird per Canvas vermessen;
     ist das nicht erlaubt (Aufruf über file://), zählt ersatzweise die
     ganze Bilddatei als Inhalt. */

  // (990/1080)² / (990/176): sichtbare Fläche von iron-man.png, wenn die
  // Datei die Box exakt füllt – gemessen in Anteilen der Boxbreite.
  const LOGO_REF_AREA = 0.1494;

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

  function normalizeLogo(img) {
    const box = measureAlphaBox(img) || { w: img.naturalWidth, h: img.naturalHeight };
    const ratio = box.w / box.h;
    const frac = Math.sqrt(LOGO_REF_AREA * ratio) * (img.naturalWidth / box.w);
    img.style.width = Math.min(frac, 1) * 100 + '%';
  }

  /* ---------- Aufbau ---------- */

  /* Avengers-Filme bekommen statt des Punkts auf der Zeitskala den
     jeweiligen Infinity-Stein (Reihenfolge: Space, Reality, Mind,
     Power, Time, Soul). */
  const STONES = {
    'the-avengers': 'space-stone',
    'avengers-age-of-ultron': 'reality-stone',
    'avengers-infinity-war': 'mind-stone',
    'avengers-endgame': 'power-stone',
    'avengers-doomsday': 'time-stone',
    'avengers-secret-wars': 'soul-stone',
  };

  function buildDot(movie) {
    const stone = STONES[movie.slug];
    if (!stone) return el('div', 'dot');
    const img = el('img', 'dot stone');
    img.alt = '';
    img.addEventListener('error', () => img.replaceWith(el('div', 'dot')));
    img.src = 'assets/infinity stones/' + stone + '.png';
    return img;
  }

  function buildEntry(movie, phase) {
    const li = el('li', 'entry');

    const box = el('div', 'logo-box');
    const fallback = el('span', 'logo-fallback', movie.title);
    const img = el('img', 'logo-img');
    img.alt = movie.title + ' – Logo';
    img.hidden = true;
    img.addEventListener('load', () => {
      normalizeLogo(img);
      img.hidden = false;
      fallback.hidden = true;
    });
    img.addEventListener('error', () => img.remove());
    img.src = 'assets/logos/' + movie.slug + '.png';
    box.append(img, fallback);
    box.addEventListener('mouseenter', () => showTip(movie, phase, box));
    box.addEventListener('mouseleave', hideTip);

    const date = el('p', 'date', movie.period || movie.date);

    li.append(box, el('div', 'connector'), buildDot(movie), date);
    const tags = [];
    if (movie.series) tags.push('Serie');
    if (movie.upcoming) tags.push('Demnächst');
    if (tags.length) li.append(el('span', 'badge', tags.join(' · ')));
    return li;
  }

  function buildSection(phase) {
    const section = el('section', 'phase');
    section.id = phase.id;
    section.style.setProperty('--accent', phase.accent);

    const pin = el('div', 'phase-pin');

    const heading = el('header', 'phase-heading');
    heading.append(
      el('p', 'saga', phase.saga),
      el('p', 'years', phase.years)
    );

    const viewport = el('div', 'timeline-viewport');
    const timeline = el('div', 'timeline');
    const list = el('ol', 'entries');
    phase.movies.forEach(movie => list.append(buildEntry(movie, phase)));
    timeline.append(list);
    viewport.append(timeline);

    /* Dezente Pfeile links/rechts als Hinweis, dass die Timeline in die
       jeweilige Richtung weitergeht – updateScrub() blendet sie an den
       Enden aus. Sitzen als Geschwister neben dem Viewport, damit sie
       weder mitscrollen noch von dessen Randmaske erfasst werden. */
    const wrap = el('div', 'timeline-wrap');
    const arrowL = el('div', 'scroll-arrow left');
    const arrowR = el('div', 'scroll-arrow right');
    for (const arrow of [arrowL, arrowR]) {
      arrow.setAttribute('aria-hidden', 'true');
      arrow.append(el('span'));
    }
    wrap.append(viewport, arrowL, arrowR);

    const band = el('div', 'phase-band');
    band.append(el('h2', null, phase.title));

    pin.append(heading, wrap, band);
    section.append(pin);

    const item = {
      section, pin, wrap, viewport, timeline,
      arrowL, arrowR, arrowLShown: false, arrowRShown: false, overflow: 0,
      tx: 0, targetX: null, scrollX: 0, tlLeft: 0, tlTop: 0, pinRect: null,
      entries: Array.from(list.children, node => ({
        node,
        /* Beim seitlichen Ein-/Ausblenden bewegt sich nur der Inhalt –
           Punkt und Datum bleiben stabil auf der Zeitskala */
        lift: Array.from(node.children).filter(c =>
          !c.classList.contains('dot') && !c.classList.contains('date')),
        left: 0, top: 0, width: 0, height: 0, shown: -1, shownX: -1
      }))
    };
    strips.push(item);
    viewport.addEventListener('wheel', e => onTimelineWheel(item, e), { passive: false });
    return section;
  }

  PHASES.forEach(phase => {
    const link = el('a', null, 'Phase ' + phase.num);
    link.href = '#' + phase.id;
    nav.append(link);
    navLinks.set(phase.id, link);
    phaseRoot.append(buildSection(phase));
  });

  /* Alle Phasen-Akzente als Spektrum – genutzt von .hero-spectrum im CSS */
  root.style.setProperty('--accent-spectrum',
    'linear-gradient(90deg, ' + PHASES.map(p => p.accent).join(', ') + ')');

  /* ---------- Infobox beim Hover über einen Filmtitel ----------
     Ein einziges fixes Element am body (nicht in der Timeline, sonst würde
     es vom overflow/mask des Viewports abgeschnitten). Solange es sichtbar
     ist, wird es pro Frame neu an seinem Titel ausgerichtet – es bleibt
     also auch beim Weiterscrollen der Timeline am Eintrag „kleben“. */

  /* Streaming-Dienste: Schlüssel für movie.streaming in data.js →
     Logo-Datei unter assets/streaming services/ + Anzeigename.
     Ohne streaming-Angabe gilt Disney+; upcoming-Titel zeigen nichts. */
  const STREAMING = {
    'disney+': { file: 'disney+.png', name: 'Disney+' },
    'prime': { file: 'prime.png', name: 'Prime Video' },
    'netflix': { file: 'netflix.png', name: 'Netflix' },
    'cinema': { file: 'cinema.png', name: 'Cinema' },
  };

  const tip = el('div', 'movie-tip');
  tip.setAttribute('role', 'tooltip');
  tip.setAttribute('aria-hidden', 'true');
  const tipTitle = el('p', 'tip-title');
  const tipDate = el('p', 'tip-date');
  const tipStory = el('ul', 'tip-story');
  const tipChars = el('ul', 'tip-chars');
  const tipStreamLabel = el('p', 'tip-label', 'Streaminganbieter');
  const tipStream = el('div', 'tip-stream');
  tip.append(
    tipTitle, tipDate,
    el('p', 'tip-label', 'Schlüsselmomente'), tipStory,
    el('p', 'tip-label', 'Erscheinungen'), tipChars,
    tipStreamLabel, tipStream
  );
  document.body.append(tip);

  let tipAnchor = null; // logo-box, an der die Infobox gerade hängt

  function showTip(movie, phase, anchor) {
    tipTitle.textContent = movie.title;
    tipDate.textContent = (movie.series ? 'Disney+-Start: ' : 'Kinostart: ') + movie.date;
    tipStory.replaceChildren(...(movie.story || []).map(text => el('li', null, text)));
    tipChars.replaceChildren(...(movie.characters || []).map(name => el('li', null, name)));
    const services = (movie.streaming || (movie.upcoming ? [] : ['disney+']))
      .map(key => STREAMING[key]).filter(Boolean);
    tipStream.replaceChildren(...services.map(s => {
      const img = el('img');
      img.src = 'assets/streaming services/' + s.file;
      img.alt = s.name;
      return img;
    }));
    tipStreamLabel.hidden = tipStream.hidden = services.length === 0;
    tip.style.setProperty('--accent', phase.accent);
    tipAnchor = anchor;
    positionTip();
    tip.classList.add('visible');
    tip.setAttribute('aria-hidden', 'false');
  }

  function hideTip() {
    tipAnchor = null;
    tip.classList.remove('visible');
    tip.setAttribute('aria-hidden', 'true');
  }

  function positionTip() {
    if (!tipAnchor) return;
    const a = tipAnchor.getBoundingClientRect();
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const x = Math.max(12, Math.min(a.left + (a.width - w) / 2, window.innerWidth - w - 12));
    let y = a.top - h - 14;               // bevorzugt über dem Titel …
    const below = y < 12;
    if (below) y = a.bottom + 14;         // … sonst darunter
    // Durch die Key-Moments-Liste kann die Box hoch werden: notfalls in
    // den Viewport klemmen, auch wenn sie dann den Titel überlappt.
    y = Math.max(12, Math.min(y, window.innerHeight - h - 12));
    tip.classList.toggle('below', below);
    tip.style.left = Math.round(x) + 'px';
    tip.style.top = Math.round(y) + 'px';
  }

  /* ---------- Timeline-Scroll: Mausrad über der Zeitskala → horizontal ---------- */

  const WHEEL_EASE = 0.14; // Lerp-Faktor, mit dem scrollLeft dem Ziel folgt

  /* Vertikales Mausrad-Delta in horizontales Scrollen übersetzen – aber
     nur, solange die Timeline in Scrollrichtung noch Weg hat. Sonst wird
     das Event nicht konsumiert, läuft an Lenis weiter und die Seite
     scrollt normal vertikal. */
  function onTimelineWheel(item, e) {
    if (item.overflow <= 0) return;
    const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const delta = e.deltaMode === 1 ? raw * 16
                : e.deltaMode === 2 ? raw * window.innerHeight
                : raw;
    const current = item.targetX !== null ? item.targetX : item.viewport.scrollLeft;
    const next = Math.max(0, Math.min(item.overflow, current + delta));
    if (next === current) return;
    e.preventDefault();
    e.stopPropagation();
    item.targetX = next;
  }

  /* Phasen mit wenigen Einträgen (z. B. Phase 1 und 2) sollen komplett in
     den Viewport passen statt zu scrollen: .fit lässt die Einträge per CSS
     bis zu ihrer min-width schrumpfen. Inhaltsreiche Phasen behalten ihr
     Scrollen – außer der Überstand ist so klein, dass die Einträge kaum
     schrumpfen müssten (Mini-Scrollwege wirken kaputt). */
  const FIT_MAX_ENTRIES = 8;  // bis hierhin: „nicht genug Elemente zum Scrollen“
  const FIT_MIN_SHRINK = 0.9; // größere Phasen: nur wenn ≥90 % Breite bleibt

  function measure() {
    for (const item of strips) {
      item.wrap.classList.remove('fit');
      if (item.timeline.offsetWidth > item.viewport.clientWidth) {
        const naturalEntryW = item.entries[0].node.offsetWidth;
        item.wrap.classList.add('fit');
        const fits = item.viewport.scrollWidth <= item.viewport.clientWidth;
        const gentle = item.entries.length <= FIT_MAX_ENTRIES ||
          item.entries[0].node.offsetWidth >= naturalEntryW * FIT_MIN_SHRINK;
        if (!fits || !gentle) item.wrap.classList.remove('fit');
      }
      item.overflow = Math.max(0, item.timeline.offsetWidth - item.viewport.clientWidth);
      if (item.targetX !== null) item.targetX = Math.min(item.targetX, item.overflow);
      /* Layout-Offsets cachen (Timeline relativ zum Pin, Einträge relativ
         zur Timeline) – pro Frame sind dann keine Messungen an Elementen
         nötig, auf die auch geschrieben wird */
      const pinRect = item.pin.getBoundingClientRect();
      const tlRect = item.timeline.getBoundingClientRect();
      item.tlLeft = tlRect.left + item.viewport.scrollLeft - pinRect.left;
      item.tlTop = tlRect.top - pinRect.top;
      for (const e of item.entries) {
        e.left = e.node.offsetLeft;
        e.top = e.node.offsetTop;
        e.width = e.node.offsetWidth;
        e.height = e.node.offsetHeight;
        e.shown = -1;
        e.shownX = -1;
      }
    }
    updateScrub();
  }

  function updateScrub() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /* Erst alle Positionen lesen, dann alle Styles schreiben – Messungen
       zwischen Writes würden jedes Mal einen Style-Recalc erzwingen */
    for (const item of strips) {
      item.pinRect = item.pin.getBoundingClientRect();
      item.scrollX = item.viewport.scrollLeft;
    }

    for (const item of strips) {
      let x = item.scrollX;
      if (item.targetX !== null) {
        const diff = item.targetX - x;
        if (Math.abs(diff) < 0.5 || reduceMotion) {
          x = item.targetX;
          item.targetX = null;
        } else {
          x += diff * WHEEL_EASE;
        }
        item.viewport.scrollLeft = x;
      }
      item.tx = -Math.round(x * 10) / 10;
      /* Hinweis-Pfeile: nur zeigen, solange es in der jeweiligen
         Richtung noch (mehr als fast nichts) zu scrollen gibt */
      const showL = item.overflow > 0 && x > 24;
      const showR = item.overflow > 0 && x < item.overflow - 24;
      if (showL !== item.arrowLShown) {
        item.arrowLShown = showL;
        item.arrowL.classList.toggle('visible', showL);
      }
      if (showR !== item.arrowRShown) {
        item.arrowRShown = showR;
        item.arrowR.classList.toggle('visible', showR);
      }
      /* Nur Sektionen in Viewport-Nähe scrubben */
      if (!reduceMotion &&
          item.pinRect.top < vh + 200 && item.pinRect.bottom > -200) {
        updateEntries(item, item.tx, vw, vh);
      }
    }
    if (!reduceMotion) updateHero(vh);
  }

  /* ---------- Lenis Smooth Scroll ---------- */

  let lenis = null;
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, autoRaf: false });
  }

  function frame(time) {
    if (lenis) lenis.raf(time);
    updateScrub();
    if (tipAnchor) positionTip();
    requestAnimationFrame(frame);
  }

  /* Anker-Links (Nav, Scroll-Hinweis) über Lenis animieren */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || !lenis) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { duration: 1.4 });
    try { history.pushState(null, '', link.getAttribute('href')); } catch (err) {}
  });

  /* ---------- Aktive Phase: Nav, Akzentfarbe, Galaxie ---------- */

  function activate(id) {
    const phase = byId.get(id) || null;
    navLinks.forEach((link, key) => {
      link.classList.toggle('active', phase !== null && key === id);
    });
    root.style.setProperty('--accent', phase ? phase.accent : DEFAULT_ACCENT);
    if (window.Galaxy) Galaxy.setPalette(phase ? phase.nebula : DEFAULT_NEBULA);
  }

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activate(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sectionObserver.observe(document.getElementById('hero'));
  PHASES.forEach(p => sectionObserver.observe(document.getElementById(p.id)));

  /* ---------- Scroll-gekoppelte Ein-/Ausblendung (Scrub) ----------
     Wie GSAP ScrollTrigger mit scrub: Die Sichtbarkeit jedes Eintrags wird
     pro Frame aus seiner Position im Viewport berechnet – Zurückscrollen
     spielt die Animation entsprechend rückwärts ab. */

  const REVEAL_SPAN = 160; // Scrollstrecke (px), über die ein Eintrag überblendet
  const EDGE_X = 0.08;     // Randzone links/rechts (Anteil der Viewportbreite)
  const EDGE_Y = 0.12;     // Randzone oben/unten (Anteil der Viewporthöhe)
  const ENTRY_RISE = 18;   // Hub beim Einblenden – wie Startzustand von .entry im CSS

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(x) { return x * x * (3 - 2 * x); }

  function updateEntries(item, tx, vw, vh) {
    const mx = vw * EDGE_X;
    const my = vh * EDGE_Y;
    const baseLeft = item.pinRect.left + item.tlLeft + tx;
    const baseTop = item.pinRect.top + item.tlTop;
    for (const e of item.entries) {
      const left = baseLeft + e.left;
      const top = baseTop + e.top;
      /* Vertikal (Seiten-Scroll): kompletter Eintrag blendet mit Hub */
      const vy = clamp01(Math.min(
        (vh - my - top) / REVEAL_SPAN,           // Eintritt von unten
        (top + e.height - my) / REVEAL_SPAN      // Austritt nach oben
      ));
      /* Quantisiert (Schritte von 0.005): keine Writes für unsichtbare
         Mikroänderungen, z. B. während Lenis ausrollt */
      const qy = Math.round(vy * 200);
      if (qy !== e.shown) {
        e.shown = qy;
        const ev = smooth(qy / 200);
        e.node.style.opacity = ev.toFixed(3);
        e.node.style.transform = 'translateY(' + ((1 - ev) * ENTRY_RISE).toFixed(1) + 'px)';
      }
      /* Horizontal (Timeline-Scroll): nur Logo, Verbinder und Badge –
         Punkt und Datum bleiben ohne Fade/Hub fest auf der Zeitskala,
         am Rand blendet sie die CSS-Maske des Viewports aus.
         Nur bei scrollbaren Timelines – in einer eingepassten Phase
         (overflow 0) stünden Randeinträge sonst dauerhaft halbtransparent da */
      let vx = 1;
      if (item.overflow > 0) {
        vx = clamp01(Math.min(
          (vw - mx - left) / REVEAL_SPAN,        // Eintritt von rechts
          (left + e.width - mx) / REVEAL_SPAN    // Austritt nach links
        ));
      }
      const qx = Math.round(vx * 200);
      if (qx !== e.shownX) {
        e.shownX = qx;
        const ev = smooth(qx / 200);
        const op = ev.toFixed(3);
        const shift = 'translateY(' + ((1 - ev) * ENTRY_RISE).toFixed(1) + 'px)';
        for (const n of e.lift) {
          n.style.opacity = op;
          n.style.transform = shift;
        }
      }
    }
  }

  /* Hero: blendet über die erste halbe Viewporthöhe scroll-gekoppelt aus
     und driftet dabei nach oben – Zurückscrollen kehrt es um. */
  const hero = document.getElementById('hero');
  let heroShown = -1;

  function updateHero(vh) {
    const q = Math.round(clamp01(window.scrollY / (vh * 0.55)) * 200);
    if (q === heroShown) return;
    heroShown = q;
    const p = smooth(q / 200);
    hero.style.opacity = (1 - p).toFixed(3);
    hero.style.transform = p > 0 ? 'translateY(' + (-p * 60).toFixed(1) + 'px)' : '';
    /* Nach Resize im gescrollten Zustand: Snap nachholen, sobald die Hero
       wieder unverschoben ist (transform leer => Messung unverfälscht) */
    if (q === 0 && spectrumDirty) { spectrumDirty = false; snapSpectrum(); }
  }

  /* ---------- Subpixel-Fix für die Spektrumlinien ----------
     Bei fraktionaler Geräteskalierung (z. B. 125 % unter Windows) sind
     3 CSS-px = 3,75 Gerätepixel: Je nach Subpixel-Position rastert der
     Browser eine Linie auf 4, die andere auf 3 Pixelzeilen – sie wirken
     ungleich dick. Deshalb werden Höhe und Oberkante beider Linien aufs
     Gerätepixelraster gerundet. Wichtig: Die Verschiebung muss über
     margin-top (Layout) laufen, nicht über translate/transform –
     transformierte Elemente rastert der Browser mit Anti-Aliasing und
     die Linien bekämen nach der Intro-Animation weiche Kanten. Beim
     margin-Weg greift stattdessen das native Paint-Snapping: Kanten
     bleiben scharf, in der Animation (eigener Layer) wie danach. */

  const spectrumLines = Array.from(document.querySelectorAll('.hero-spectrum'));
  let spectrumDirty = false;

  function snapSpectrum() {
    const dpr = window.devicePixelRatio || 1;
    const snappedH = Math.round(3 * dpr) / dpr;
    for (const line of spectrumLines) {
      line.style.height = snappedH + 'px';
      line.style.marginTop = '';
    }
    /* Reihenfolge = DOM-Reihenfolge: Der margin der oberen Linie
       verschiebt die untere mit, daher erst setzen, dann weitermessen. */
    for (const line of spectrumLines) {
      const top = line.getBoundingClientRect().top;
      const d = Math.round(top * dpr) / dpr - top;
      line.style.marginTop = d.toFixed(4) + 'px';
    }
  }

  function requestSnap() {
    if (reduceMotion || window.scrollY < 2) snapSpectrum();
    else spectrumDirty = true;
  }

  window.addEventListener('resize', requestSnap);
  requestSnap();

  /* ---------- Hero-Intro: startet, sobald die Fonts geladen sind ---------- */

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(res => setTimeout(res, 1500))]).then(() => {
    /* Doppeltes rAF: erst nach dem Relayout des Font-Swaps starten,
       damit die Choreografie nicht ins Stottern gerät */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      hero.classList.add('ready');
      measure();
      /* Font-Swap hat die h1-Höhe geändert => Linien neu aufs Raster setzen */
      requestSnap();
    }));
  });

  /* ---------- Start ---------- */

  window.addEventListener('resize', measure);
  measure();
  requestAnimationFrame(frame);
})();
