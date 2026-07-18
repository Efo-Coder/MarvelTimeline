/* Baut Navigation + Phasen-Timelines aus PHASES (js/data.js) auf.

   Scrolling: Lenis (Smooth Scroll) + Sticky-Sektionen – jede Phase ist so
   viel höher als der Viewport, wie ihre Timeline horizontal übersteht.
   Während der Pin sticky steht, wird vertikaler Scrollfortschritt 1:1 in
   horizontale Verschiebung der Timeline übersetzt.

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
  const pinned = [];   // { section, viewport, timeline, overflow, entries[] }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- Aufbau ---------- */

  function buildEntry(movie) {
    const li = el('li', 'entry');

    const box = el('div', 'logo-box');
    const fallback = el('span', 'logo-fallback', movie.title);
    const img = el('img', 'logo-img');
    img.alt = movie.title + ' – Logo';
    img.loading = 'lazy';
    img.hidden = true;
    img.addEventListener('load', () => { img.hidden = false; fallback.hidden = true; });
    img.addEventListener('error', () => img.remove());
    img.src = 'assets/logos/' + movie.slug + '.png';
    box.append(img, fallback);

    const date = el('p', 'date', movie.date);

    li.append(box, el('div', 'connector'), el('div', 'dot'), date);
    if (movie.upcoming) li.append(el('span', 'badge', 'Demnächst'));
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
    phase.movies.forEach(movie => list.append(buildEntry(movie)));
    timeline.append(list);
    viewport.append(timeline);

    const band = el('div', 'phase-band');
    band.append(el('h2', null, phase.title));

    pin.append(heading, viewport, band);
    section.append(pin);

    pinned.push({
      section, pin, viewport, timeline, overflow: 0,
      tx: 0, tlLeft: 0, tlTop: 0, secTop: 0, pinRect: null,
      entries: Array.from(list.children, node =>
        ({ node, left: 0, top: 0, width: 0, height: 0, shown: -1 }))
    });
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

  /* ---------- Sticky-Scroll: vertikal → horizontal ---------- */

  function measure() {
    const vh = window.innerHeight;
    for (const item of pinned) {
      item.overflow = Math.max(0, item.timeline.offsetWidth - item.viewport.clientWidth);
      item.section.style.height = (vh + item.overflow) + 'px';
      /* Layout-Offsets cachen (Timeline relativ zum Pin, Einträge relativ
         zur Timeline) – pro Frame sind dann keine Messungen an Elementen
         nötig, auf die auch geschrieben wird */
      const pinRect = item.pin.getBoundingClientRect();
      const tlRect = item.timeline.getBoundingClientRect();
      item.tlLeft = tlRect.left - item.tx - pinRect.left;
      item.tlTop = tlRect.top - pinRect.top;
      for (const e of item.entries) {
        e.left = e.node.offsetLeft;
        e.top = e.node.offsetTop;
        e.width = e.node.offsetWidth;
        e.height = e.node.offsetHeight;
        e.shown = -1;
      }
    }
    updateHorizontal();
  }

  function updateHorizontal() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /* Erst alle Positionen lesen, dann alle Styles schreiben – Messungen
       zwischen Writes würden jedes Mal einen Style-Recalc erzwingen */
    for (const item of pinned) {
      item.secTop = item.section.getBoundingClientRect().top;
      item.pinRect = item.pin.getBoundingClientRect();
    }

    for (const item of pinned) {
      let tx = 0;
      if (item.overflow > 0) {
        const progress = Math.min(1, Math.max(0, -item.secTop / item.overflow));
        tx = Math.round(-progress * item.overflow * 10) / 10;
      }
      if (tx !== item.tx) {
        item.tx = tx;
        item.timeline.style.transform = 'translate3d(' + tx + 'px, 0, 0)';
      }
      /* Nur Sektionen in Viewport-Nähe scrubben */
      if (!reduceMotion &&
          item.pinRect.top < vh + 200 && item.pinRect.bottom > -200) {
        updateEntries(item, tx, vw, vh);
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
    updateHorizontal();
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
      const v = clamp01(Math.min(
        (vw - mx - left) / REVEAL_SPAN,          // Eintritt von rechts
        (left + e.width - mx) / REVEAL_SPAN,     // Austritt nach links
        (vh - my - top) / REVEAL_SPAN,           // Eintritt von unten
        (top + e.height - my) / REVEAL_SPAN      // Austritt nach oben
      ));
      /* Quantisiert (Schritte von 0.005): keine Writes für unsichtbare
         Mikroänderungen, z. B. während Lenis ausrollt */
      const q = Math.round(v * 200);
      if (q === e.shown) continue;
      e.shown = q;
      const ev = smooth(q / 200);
      e.node.style.opacity = ev.toFixed(3);
      e.node.style.transform = 'translateY(' + ((1 - ev) * ENTRY_RISE).toFixed(1) + 'px)';
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
  }

  /* ---------- Hero-Intro: startet, sobald die Fonts geladen sind ---------- */

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(res => setTimeout(res, 1500))]).then(() => {
    /* Doppeltes rAF: erst nach dem Relayout des Font-Swaps starten,
       damit die Choreografie nicht ins Stottern gerät */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      hero.classList.add('ready');
      measure();
    }));
  });

  /* ---------- Start ---------- */

  window.addEventListener('resize', measure);
  measure();
  requestAnimationFrame(frame);
})();
