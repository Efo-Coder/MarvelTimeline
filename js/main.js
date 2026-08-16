/* Baut Navigation + Phasen-Timelines aus PHASES (js/data.js) auf.

   Scrolling: Lenis (Smooth Scroll); die Seite scrollt ganz normal
   vertikal. Jede Timeline ist ein natives horizontales Scroll-Element –
   nur Mausrad-Scrollen direkt über der Zeitskala schiebt sie (geglättet)
   horizontal. Ist sie in Scrollrichtung am Anschlag, läuft das Event an
   Lenis weiter und die Seite scrollt normal vertikal weiter.

   Ein-/Ausblendungen (Hero-Textstufen, Timeline-Einträge) sind scroll-
   gekoppelt (Scrub): opacity/transform werden pro Frame aus der Position
   im Viewport berechnet. Der Hero klebt dabei über die Höhe seines Tracks
   am oberen Rand und schaltet nacheinander durch seine Textstufen. Nur
   die Hero-Intro-Choreografie beim Laden läuft zeitbasiert über
   CSS-Transitions (.hero.ready). */
(function () {
  'use strict';

  const nav = document.getElementById('phase-nav');
  const phaseRoot = document.getElementById('phases');
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* #hero ist der Scroll-Track, die eigentliche Sektion klebt darin
     (sticky). heroSpan = Scrollweg durch den Track (Trackhöhe minus
     Viewport); measure() hält ihn aktuell. Schon hier deklariert, weil
     der Ton-Schalter beim Start darauf zugreift. */
  const heroTrack = document.getElementById('hero');
  const hero = heroTrack.querySelector('.hero');
  let heroSpan = 1;

  const navLinks = new Map();
  const byId = new Map(PHASES.map(p => [p.id, p]));
  const strips = [];   // { section, viewport, timeline, overflow, entries[] }

  /* Alle Einträge aller Phasen in einer flachen Liste, in Aufbaureihenfolge
     – also durchgehend nach Handlung sortiert. Daraus zieht das Modal seine
     Blätterfunktion: „vorheriger/nächster Titel“ läuft über Phasengrenzen
     hinweg einfach weiter. */
  const chronology = [];   // { movie, phase, box, strip, pos, index }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- Logo-Normalisierung ----------

     Logo-Dateien kommen mit unterschiedlichen Seitenverhältnissen und
     unterschiedlich viel transparentem Rand. Würden alle auf Boxbreite
     skaliert, wirkten breite Logos kleiner als kompakte. Deshalb wird
     jedes Logo auf die gleiche sichtbare Fläche gebracht wie die
     Referenz iron-man.webp – die gilt als Standardgröße.

     Der sichtbare Inhalt (Alpha-Bounding-Box) wird per Canvas vermessen;
     ist das nicht erlaubt (Aufruf über file://), zählt ersatzweise die
     ganze Bilddatei als Inhalt. */

  // (990/1080)² / (990/176): sichtbare Fläche von iron-man.webp, wenn die
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
    img.dataset.stone = stone; /* die Farbe seines Scheins steht im CSS */
    img.addEventListener('error', () => img.replaceWith(el('div', 'dot')));
    img.src = 'assets/infinity stones/' + stone + '.png';
    return img;
  }

  function buildEntry(movie, phase, pos) {
    const li = el('li', 'entry');

    /* Button statt div: Der Klick aufs Logo öffnet das Info-Modal, das
       soll auch für Screenreader als Schaltfläche lesbar sein. Bewusst
       aus der Tab-Reihenfolge genommen (tabIndex -1) – aus demselben
       Grund wie bei den Titeln im Phasen-Dropdown: 56 zusätzliche
       Tab-Stationen würden den Header praktisch unerreichbar machen. */
    const box = el('button', 'logo-box');
    box.type = 'button';
    box.tabIndex = -1;
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
    img.src = 'assets/logos/' + movie.slug + '.webp';
    box.append(img, fallback);
    /* strips.length ist der Index, den der Streifen dieser Phase gleich
       bekommt: buildSection() legt ihn erst nach allen Einträgen an. Über
       strip + pos findet das Modal später den Eintrag auf der Zeitskala
       wieder und schiebt ihn beim Blättern mittig. */
    const record = { movie, phase, box, strip: strips.length, pos };
    record.index = chronology.push(record) - 1;

    box.addEventListener('mouseenter', () => showTip(movie, phase, box));
    box.addEventListener('mouseleave', hideTip);
    box.addEventListener('click', () => openModal(record));

    /* Die Pille sitzt unter dem Logo, das Datum am Fuß des Verbindungs-
       strichs dicht über der Zeitskala. */
    li.append(box);
    const tags = [];
    if (movie.series) tags.push('Serie');
    if (movie.upcoming) tags.push('Demnächst');
    if (tags.length) {
      const tag = el('div', 'entry-tag');
      tag.append(el('span', 'badge', tags.join(' · ')));
      li.append(tag);
    } else {
      /* Ohne Pille wächst dafür der Strich: Er beginnt so wie im Original
         gleich unter dem Logo, und der Punkt bleibt trotzdem auf der
         Höhe der Skala (siehe .entry.untagged im CSS). */
      li.classList.add('untagged');
    }

    li.append(el('div', 'connector'),
      el('p', 'date', movie.period || movie.date), buildDot(movie));
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
    phase.movies.forEach((movie, i) => list.append(buildEntry(movie, phase, i)));
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
      /* Kopfzeile, Zeitskala und Phasenband blenden im Gleichschritt mit
         den Einträgen, siehe updateEntries */
      reveal: { heading, shown: -1 },
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

  /* ---------- Nav-Eintrag mit Phasen-Dropdown ----------
     Listet die Titel der Phase in zwei Spalten. Ein Klick springt zur
     Phase (über den normalen Anker-Handler weiter unten) und schiebt
     zusätzlich die Timeline seitlich auf den gewählten Eintrag. */

  function buildNavItem(phase, strip) {
    const item = el('div', 'nav-item has-dropdown');

    const link = el('a', 'nav-link', 'Phase ' + phase.num);
    link.href = '#' + phase.id;
    navLinks.set(phase.id, link);

    const head = el('div', 'nav-panel-head');
    head.append(
      el('p', 'dropdown-heading', phase.saga),
      el('span', 'nav-panel-years', phase.years)
    );

    const list = el('div', 'nav-titles');
    phase.movies.forEach((movie, index) => {
      const entry = el('a', 'nav-title');
      entry.href = '#' + phase.id;
      /* Bewusst aus der Tab-Reihenfolge genommen: Sonst lägen 56 Titel
         zwischen den Phasen-Links und dem Zahnrad, das damit per Tastatur
         praktisch unerreichbar wäre. Das Dropdown ist eine reine
         Maus-Abkürzung – jede Phase bleibt über ihren Nav-Link und jeder
         Titel über die Timeline erreichbar. */
      entry.tabIndex = -1;
      entry.append(el('span', 'nav-title-text', movie.title));
      if (movie.series) entry.append(el('span', 'nav-title-tag', 'Serie'));
      entry.addEventListener('click', () => centerEntry(strip, index));
      list.append(entry);
    });

    const seriesCount = phase.movies.filter(m => m.series).length;
    const foot = el('p', 'nav-panel-foot', phase.movies.length + ' Einträge' +
      (seriesCount ? ' · davon ' + seriesCount + ' Serien' : ''));

    const panel = el('div', 'dropdown-panel');
    panel.append(head, list, foot);
    const menu = el('div', 'dropdown-menu');
    menu.append(panel);

    item.append(link, menu);
    return item;
  }

  /* Timeline der Phase so schieben, dass der gewählte Eintrag mittig
     steht. In eingepassten Phasen (kein Überstand) gibt es nichts zu
     schieben – dort ist bereits alles sichtbar. */
  function centerEntry(strip, index) {
    if (strip.overflow <= 0) return;
    const entry = strip.entries[index];
    strip.targetX = Math.max(0, Math.min(strip.overflow,
      entry.left + entry.width / 2 - strip.viewport.clientWidth / 2));
  }

  PHASES.forEach(phase => {
    phaseRoot.append(buildSection(phase));
    nav.append(buildNavItem(phase, strips[strips.length - 1]));
  });

  /* ---------- Infobox beim Hover über einen Filmtitel ----------
     Ein einziges fixes Element am body (nicht in der Timeline, sonst würde
     es vom overflow/mask des Viewports abgeschnitten). Solange es sichtbar
     ist, wird es pro Frame neu an seinem Titel ausgerichtet – es bleibt
     also auch beim Weiterscrollen der Timeline am Eintrag „kleben“. */

  /* Streaming-Dienste: Schlüssel für movie.streaming in data.js →
     Logo-Datei unter assets/streaming services/ + Anzeigename.
     Ohne streaming-Angabe gilt Disney+; upcoming-Titel zeigen nichts. */
  const STREAMING = {
    'disney+': { file: 'disney+.webp', name: 'Disney+' },
    'prime': { file: 'prime.webp', name: 'Prime Video' },
    'netflix': { file: 'netflix.webp', name: 'Netflix' },
    'cinema': { file: 'cinema.webp', name: 'Cinema' },
  };

  /* Slugs, Porträts und die Aufteilung der Namen kommen aus js/chars.js:
     Die Charakterseite arbeitet mit denselben Regeln, deshalb stehen sie
     dort statt hier. Im Modal steht vor jedem Namen das Porträt aus
     assets/characters/portraits/, im Zweifel in der Fassung aus genau
     diesem Film. */

  /* Eine Zeile "Bild + Name". Im Modal ist sie eine Schaltfläche, die die
     Charakterübersicht öffnet. Fehlt das Bild, fällt der Eintrag auf die
     reine Textzeile zurück, statt ein kaputtes Icon zu zeigen. */
  function charItem(name, movie) {
    const li = el('li');
    if (CHAR_NO_PROFILE.has(name)) {
      li.className = 'char-plain';
      li.append(el('span', null, name));
      return li;
    }
    const chip = el('button', 'char-chip');
    chip.type = 'button';
    if (CHAR_NO_IMAGE.has(name)) {
      chip.classList.add('no-avatar');
    } else {
      const img = el('img', 'char-avatar');
      img.src = 'assets/characters/portraits/' + charLook(charSlug(name), movie) + '.webp';
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        img.remove();
        chip.classList.add('no-avatar');
      });
      chip.append(img);
    }
    chip.append(el('span', null, name));
    chip.addEventListener('click', () => openChar(charSlug(name), chip));
    li.append(chip);
    return li;
  }

  /* Hover-Infobox und Klick-Modal sind bis auf den Handlungsteil gleich
     aufgebaut, deshalb baut buildPanel() beide und fillPanel() befüllt
     sie aus einem Film. Der Unterschied: Die Hover-Box zeigt nur die
     Kurzfassung (movie.summary) – sie soll im Vorbeifahren lesbar sein.
     Die vollständige Liste der Schlüsselmomente (movie.story) steht im
     Modal, das beim Klick aufs Logo aufgeht und Platz zum Scrollen hat. */
  function buildPanel(className, detailed) {
    const panel = {
      root: el('div', className),
      detailed,
      title: el('p', 'tip-title'),
      date: el('p', 'tip-date'),
      body: detailed ? el('ul', 'tip-story') : el('p', 'tip-summary'),
      chars: el('ul', 'tip-chars'),
      streamLabel: el('p', 'tip-label', 'Streaminganbieter'),
      stream: el('div', 'tip-stream'),
    };
    panel.root.append(
      panel.title, panel.date,
      el('p', 'tip-label', detailed ? 'Schlüsselmomente' : 'Handlung'), panel.body,
      el('p', 'tip-label', 'Erscheinungen'), panel.chars,
      panel.streamLabel, panel.stream
    );
    return panel;
  }

  function fillPanel(panel, movie, phase) {
    panel.title.textContent = movie.title;
    panel.date.textContent = (movie.series ? 'Disney+-Start: ' : 'Kinostart: ') + movie.date;
    const length = formatLength(movie);
    if (length) panel.date.append(el('span', 'tip-length', length));
    if (panel.detailed) {
      panel.body.replaceChildren(...(movie.story || []).map(text => el('li', null, text)));
    } else {
      panel.body.textContent = movie.summary || '';
    }
    /* Nur das Modal zeigt Porträts – die Hover-Box soll im Vorbeifahren
       kompakt bleiben und behält die reinen Namens-Pillen. */
    panel.chars.replaceChildren(...(movie.characters || [])
      .map(name => (panel.detailed ? charItem(name, movie) : el('li', null, name))));
    const services = (movie.streaming || (movie.upcoming ? [] : ['disney+']))
      .map(key => STREAMING[key]).filter(Boolean);
    panel.stream.replaceChildren(...services.map(s => {
      const img = el('img');
      img.src = 'assets/streaming services/' + s.file;
      img.alt = s.name;
      return img;
    }));
    panel.streamLabel.hidden = panel.stream.hidden = services.length === 0;
    /* Akzent kommt von der Phase des Films, nicht vom globalen Akzent */
    panel.root.style.setProperty('--accent', phase.accent);
  }

  const tipPanel = buildPanel('movie-tip', false);
  const tip = tipPanel.root;
  tip.setAttribute('role', 'tooltip');
  tip.setAttribute('aria-hidden', 'true');
  document.body.append(tip);

  let tipAnchor = null; // logo-box, an der die Infobox gerade hängt

  /* ---------- Einstellungen: Infoboxen an/aus ----------
     Der Regler im Header-Dropdown schaltet die Infobox ab; die Wahl
     überlebt einen Reload (localStorage, falls verfügbar – bei file://
     oder blockierten Cookies wirft der Zugriff, dann gilt der Default). */

  const TIPS_KEY = 'mcu-timeline.tips';
  const tipsToggle = document.getElementById('toggle-tips');

  function readStored(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
  }

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (err) {}
  }

  let tipsEnabled = readStored(TIPS_KEY) !== 'off';
  tipsToggle.checked = tipsEnabled;

  tipsToggle.addEventListener('change', () => {
    tipsEnabled = tipsToggle.checked;
    store(TIPS_KEY, tipsEnabled ? 'on' : 'off');
    if (!tipsEnabled) hideTip();
  });

  /* ---------- Ton-Schalter für das Hero-Theme-Video ----------

     Das Video läuft wegen der Autoplay-Policy stumm. Der Button schaltet
     den Ton um; die letzte Wahl wird gespeichert. Beim Neuladen kann der
     Browser Ton ohne Nutzergeste blockieren – dann fällt play() durch und
     wir gehen sauber zurück auf stumm. */
  const SOUND_KEY = 'mcu-timeline.sound';
  const heroVideo = document.querySelector('.hero-video');
  const soundBtn = document.getElementById('hero-sound');

  /* Wird vom Frame-Loop aufgerufen und weiter unten befüllt, sobald der
     Ton-Schalter existiert. */
  let fadeHeroSound = () => {};

  if (heroVideo && soundBtn) {
    const reflectSound = () => {
      const on = !heroVideo.muted;
      soundBtn.classList.toggle('is-on', on);
      soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      soundBtn.setAttribute('aria-label', on ? 'Ton ausschalten' : 'Ton einschalten');
    };

    /* Die Lautstärke hängt am Scroll und folgt dem Ausblenden der Hero:
       Während der gepinnten Textsequenz bleibt das Theme voll zu hören –
       das Video füllt dort durchgehend den Viewport. Erst wenn der Hero
       den Track verlässt, wird es leiser und nach gut der halben
       Viewporthöhe still. Zurückscrollen dreht wieder auf. Gestellt wird
       nur volume, nicht muted, damit der Schalter seinen Zustand behält.
       Die Stufen von 5 Prozent halten die Zahl der Setzer pro Sekunde
       klein, ohne dass man den Verlauf treppig hört. */
    const FADE_SPAN = 0.55; // Anteil der Viewporthöhe bis zur Stille
    let shownVolume = -1;

    const scrollVolume = () => {
      const vh = window.innerHeight || 1;
      return Math.round((1 - clamp01((window.scrollY - heroSpan) / (vh * FADE_SPAN))) * 20) / 20;
    };

    const applyVolume = (v) => {
      if (v === shownVolume) return;
      shownVolume = v;
      try { heroVideo.volume = v; } catch (err) {}
    };

    fadeHeroSound = () => {
      if (heroVideo.muted) return;
      applyVolume(scrollVolume());
    };

    const setSound = (on) => {
      heroVideo.muted = !on;
      store(SOUND_KEY, on ? 'on' : 'off');
      if (on) {
        /* Beim Einschalten im gescrollten Zustand sofort auf den zum
           Scrollstand passenden Pegel, sonst knallt der erste Frame laut */
        applyVolume(scrollVolume());
        const p = heroVideo.play();
        if (p && p.catch) p.catch(() => { heroVideo.muted = true; reflectSound(); });
      }
      reflectSound();
    };

    soundBtn.addEventListener('click', () => setSound(heroVideo.muted));

    if (readStored(SOUND_KEY) === 'on') setSound(true);
    else reflectSound();
  }

  /* Das Menü selbst öffnet und schließt rein über CSS (:hover bzw.
     :has(:focus-visible)) – hier hängt keine Logik dran. */

  /* Umfang eines Eintrags für die Infobox: Filme zeigen ihre Laufzeit
     (runtime in Minuten → „2 Std. 6 Min.“), Serien die Folgenzahl.
     Noch nicht erschienene Titel haben keine Angabe – dann bleibt der
     Zusatz hinter dem Datum weg. */
  function formatLength(movie) {
    if (movie.episodes) return movie.episodes + (movie.episodes === 1 ? ' Folge' : ' Folgen');
    if (!movie.runtime) return '';
    const h = Math.floor(movie.runtime / 60);
    const min = movie.runtime % 60;
    return (h ? h + ' Std. ' : '') + min + ' Min.';
  }

  function showTip(movie, phase, anchor) {
    if (!tipsEnabled || modalOpen) return;
    fillPanel(tipPanel, movie, phase);
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
    // Auf niedrigen Fenstern notfalls in den Viewport klemmen, auch wenn
    // die Box dann den Titel überlappt.
    y = Math.max(12, Math.min(y, window.innerHeight - h - 12));
    tip.classList.toggle('below', below);
    tip.style.left = Math.round(x) + 'px';
    tip.style.top = Math.round(y) + 'px';
  }

  /* ---------- Modal beim Klick auf ein Logo ----------
     Vertieft die Hover-Box: statt der Kurzfassung die vollständige Liste
     der Schlüsselmomente, zentriert und in sich scrollbar – dadurch
     bleiben auch lange Listen ganz lesbar. Das Modal hängt nicht am
     Regler „Infoboxen“: Der schaltet nur
     das ungefragte Einblenden beim Zeigen ab, der Klick bleibt immer eine
     bewusste Anfrage. */

  const modalPanel = buildPanel('modal-card', true);
  const modalCard = modalPanel.root;
  modalCard.setAttribute('role', 'dialog');
  modalCard.setAttribute('aria-modal', 'true');
  modalCard.setAttribute('aria-labelledby', 'modal-title');
  modalPanel.title.id = 'modal-title';

  const modalClose = el('button', 'modal-close', '×');
  modalClose.type = 'button';
  modalClose.setAttribute('aria-label', 'Schließen');

  /* Zwei Pfeile blättern durch die Chronologie, ohne dass man das Modal
     dafür schließen muss. Sie stehen links vom Schließen-Button, damit die
     drei Schaltflächen eine Reihe bilden. Das Winkelzeichen kommt wie bei
     den Timeline-Pfeilen aus einem gedrehten Kästchen und nicht aus einer
     Schrift: Ein Glyph säße in seiner Zeilenbox nie exakt in der Mitte des
     Kreises. */
  const modalPrev = el('button', 'modal-step prev');
  const modalNext = el('button', 'modal-step next');
  modalPrev.type = modalNext.type = 'button';
  modalPrev.append(el('span'));
  modalNext.append(el('span'));

  const modalActions = el('div', 'modal-actions');
  modalActions.append(modalPrev, modalNext, modalClose);

  /* Titel, Datum und die Schaltflächen wandern in einen eigenen Kopf, der
     beim Scrollen der Karte oben stehen bleibt: Bei langen Momentlisten
     bleibt so sichtbar, worum es geht – und die Buttons bleiben in
     Reichweite (absolut positioniert würden sie sonst mitscrollen). */
  const modalHead = el('div', 'modal-head');
  modalHead.append(modalPanel.title, modalPanel.date, modalActions);
  modalCard.prepend(modalHead);

  const modal = el('div', 'modal');
  modal.setAttribute('aria-hidden', 'true');
  /* Lenis würde das Mausrad abfangen und die Seite dahinter scrollen –
     im Modal soll stattdessen die Karte selbst nativ scrollen. */
  modal.setAttribute('data-lenis-prevent', '');
  modal.append(modalCard);
  document.body.append(modal);

  let modalOpen = false;
  let modalEntry = null;  // Eintrag, der gerade im Modal steht

  /* Beschriftet einen Pfeil mit dem Titel, auf dem er landet, und schaltet
     ihn an den Enden der Chronologie ab. */
  function labelStep(btn, target, word) {
    btn.disabled = !target;
    btn.setAttribute('aria-label', target ? word + ': ' + target.movie.title : word);
    btn.title = target ? target.movie.title : '';
  }

  /* Inhalt des Modals auf einen Eintrag umstellen – beim Öffnen wie beim
     Blättern derselbe Weg. */
  function showEntry(record) {
    modalEntry = record;
    fillPanel(modalPanel, record.movie, record.phase);
    modalCard.scrollTop = 0;
    labelStep(modalPrev, chronology[record.index - 1], 'Vorheriger Titel');
    labelStep(modalNext, chronology[record.index + 1], 'Nächster Titel');
  }

  /* Seite hinter dem Modal auf die Phase des Films schieben – dasselbe Ziel,
     das ein Klick im Header-Dropdown ansteuert. Der Sprung ist absichtlich
     sofort (immediate): Er läuft unsichtbar hinter dem Modal, und ein noch
     laufendes Lenis-Scrollen bräche beim Schließen (lenis.start → reset)
     mittendrin ab. force lässt Lenis auch scrollen, obwohl es fürs Modal
     gestoppt ist; ohne Lenis (reduzierte Bewegung) springt die Seite direkt. */
  function scrollPageToSection(section) {
    if (lenis) {
      lenis.scrollTo(section, { immediate: true, force: true });
    } else {
      window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY);
    }
  }

  /* Das Modal auf einen anderen Titel umstellen. Die Zeitskala im
     Hintergrund zieht mit: Wer das Modal danach schließt, steht vor dem
     Eintrag, den er zuletzt gelesen hat, statt vor dem, bei dem er
     eingestiegen ist. Bei einem Phasenwechsel schiebt sich zusätzlich die
     Seite senkrecht zur neuen Phase, sonst bliebe der Viewport bei der
     alten stehen. */
  function goToEntry(next) {
    const phaseChanged = !modalEntry || next.strip !== modalEntry.strip;
    showEntry(next);
    centerEntry(strips[next.strip], next.pos);
    if (phaseChanged) scrollPageToSection(strips[next.strip].section);
  }

  /* Einen Titel weiter oder zurück in der Chronologie. */
  function stepEntry(delta) {
    const next = modalEntry && chronology[modalEntry.index + delta];
    if (!modalOpen || !next) return;
    goToEntry(next);
    /* Am Ende der Chronologie wird der gedrückte Pfeil deaktiviert und
       verlöre den Fokus ans Nichts – dann übernimmt der Gegenpfeil. */
    if (document.activeElement === modalPrev && modalPrev.disabled) modalNext.focus();
    if (document.activeElement === modalNext && modalNext.disabled) modalPrev.focus();
  }

  modalPrev.addEventListener('click', () => stepEntry(-1));
  modalNext.addEventListener('click', () => stepEntry(1));

  function openModal(record) {
    showEntry(record);
    hideTip();
    modalOpen = true;
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    /* Seite hinter dem Modal festhalten: Lenis setzt dafür selbst
       .lenis-stopped, die Klasse deckt den Fall ohne Lenis ab
       (reduzierte Bewegung). */
    root.classList.add('modal-open');
    if (lenis) lenis.stop();
    /* Erst im nächsten Frame fokussieren: Vorher ist das Modal noch
       visibility: hidden und damit gar nicht fokussierbar. preventScroll
       vorsorglich, damit das Heranrücken des Buttons die Karte nie aus
       ihrer Startposition schiebt. */
    requestAnimationFrame(() => {
      if (modalOpen) modalClose.focus({ preventScroll: true });
    });
  }

  function closeModal() {
    if (!modalOpen) return;
    if (charOpen) closeChar();
    modalOpen = false;
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    root.classList.remove('modal-open');
    if (lenis) lenis.start();
    /* Der Fokus geht an das Logo des zuletzt gezeigten Titels, nicht an das
       zuerst angeklickte – nach dem Blättern ist das der Eintrag, den man
       vor sich hat. preventScroll: Ohne das würde der Browser das Logo „in
       den Blick rücken“ und dabei Seite und Timeline verschieben. */
    if (modalEntry) modalEntry.box.focus({ preventScroll: true });
    modalEntry = null;
  }

  // Klick auf die Fläche neben der Karte schließt
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  modalClose.addEventListener('click', closeModal);

  /* Fokus im offenen Dialog halten: Tab wandert nur durch dessen eigene
     Schaltflächen und springt am Ende wieder an den Anfang. An den Enden
     der Chronologie fällt der abgeschaltete Pfeil aus der Runde. Bewusst
     ohne preventScroll: In der langen Karte soll die gerade fokussierte
     Schaltfläche in den Blick rücken. */
  function trapTab(card, e) {
    e.preventDefault();
    const stops = Array.from(card.querySelectorAll('button:not([disabled])'));
    if (!stops.length) return;
    const at = stops.indexOf(document.activeElement);
    const to = at === -1 ? 0
      : (at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length;
    stops[to].focus();
  }

  document.addEventListener('keydown', e => {
    /* Liegt die Charakterübersicht obenauf, gehören die Tasten ihr: Escape
       schließt nur sie, und das Blättern durch die Chronologie ruht so
       lange – sonst wechselte im Hintergrund unbemerkt der Film. */
    if (charOpen) {
      if (e.key === 'Escape') closeChar();
      else if (e.key === 'Tab') trapTab(charCard, e);
      return;
    }
    if (!modalOpen) return;
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      stepEntry(-1);
    } else if (e.key === 'ArrowRight') {
      stepEntry(1);
    } else if (e.key === 'Tab') {
      trapTab(modalCard, e);
    }
  });

  /* ---------- Charakterübersicht: Modal über dem Film-Modal ----------

     Jeder Name im Film-Modal ist eine Schaltfläche. Der Klick legt eine
     zweite Karte darüber: Porträt, Rollen und alle Auftritte der Figur in
     Handlungsreihenfolge, quer durch alle Phasen. Von dort führt jeder
     Auftritt zurück ins Film-Modal, das im Hintergrund stehen bleibt und
     einfach auf den gewählten Titel umschaltet.

     Der Index entsteht aus denselben Namenslisten, die auch die Pillen
     füllen: buildCharIndex() (js/chars.js) fasst sie zu Figuren zusammen,
     hier über die Einträge der Zeitskala, damit jeder Auftritt in der
     Übersicht auch weiß, wo er auf der Timeline liegt. */

  const charIndex = buildCharIndex(chronology);   // slug -> { slug, names[], entries[] }

  const charCard = el('div', 'modal-card char-card');
  charCard.setAttribute('role', 'dialog');
  charCard.setAttribute('aria-modal', 'true');
  charCard.setAttribute('aria-labelledby', 'char-title');

  const charPortrait = el('img', 'char-portrait');
  charPortrait.alt = '';
  charPortrait.addEventListener('error', () => { charPortrait.hidden = true; });

  const charName = el('p', 'tip-title');
  charName.id = 'char-title';
  const charRoles = el('p', 'tip-date');

  /* Besetzung aus ACTORS (js/data.js). Steht als eigene Zeile unter den
     Rollen, weil sie zur Figur gehört und nicht zum einzelnen Film. */
  const charCast = el('p', 'char-cast');
  const charCastLabel = el('span');
  const charCastNames = el('span');
  charCast.append(charCastLabel, charCastNames);

  const charClose = el('button', 'modal-close', '×');
  charClose.type = 'button';
  charClose.setAttribute('aria-label', 'Zurück zum Film');

  const charActions = el('div', 'modal-actions');
  charActions.append(charClose);

  const charText = el('div', 'char-headtext');
  charText.append(charName, charRoles, charCast);
  const charHead = el('div', 'modal-head char-head');
  charHead.append(charPortrait, charText, charActions);

  /* Kurzbiografie aus BIOS (js/data.js). Teilt sich die Textgestalt mit der
     Kurzfassung der Hover-Box, deshalb dieselbe Klasse. */
  const charBioLabel = el('p', 'tip-label', 'Zur Figur');
  const charBio = el('p', 'tip-summary');

  const charCount = el('p', 'tip-label');
  const charFilms = el('ul', 'char-films');
  charCard.append(charHead, charBioLabel, charBio, charCount, charFilms);

  const charModal = el('div', 'modal char-modal');
  charModal.setAttribute('aria-hidden', 'true');
  charModal.setAttribute('data-lenis-prevent', '');
  charModal.append(charCard);
  document.body.append(charModal);

  let charOpen = false;
  let charOpener = null;   // Pille, von der aus geöffnet wurde

  function fillChar(char) {
    charName.textContent = splitName(char.names[0]).real;
    const roles = [];
    for (const name of char.names) {
      const role = splitName(name).role;
      if (role && !roles.includes(role)) roles.push(role);
    }
    charRoles.textContent = roles.join(' · ');
    charRoles.hidden = roles.length === 0;

    /* Umbesetzte Rollen stehen in data.js als Liste, alle anderen als
       einzelner Name. Ohne Eintrag (Sammelbegriffe, noch offene Rollen)
       bleibt die Zeile weg. */
    const cast = ACTORS[char.slug];
    charCastLabel.textContent = CHAR_VOICE_ONLY.has(char.slug)
      ? 'gesprochen von ' : 'gespielt von ';
    charCastNames.textContent = Array.isArray(cast) ? cast.join(', ') : cast || '';
    charCast.hidden = !cast;

    const bio = BIOS[char.slug] || '';
    charBio.textContent = bio;
    charBioLabel.hidden = charBio.hidden = !bio;

    /* Platzhalter wie „Noch unbekannt“ haben kein einzelnes Porträt –
       für sie gar nicht erst laden, statt den 404 abzuwarten. */
    const hasImage = !char.names.every(name => CHAR_NO_IMAGE.has(name));
    charPortrait.hidden = !hasImage;
    /* Geöffnet wird die Übersicht immer aus einem Film heraus, also zeigt
       sie auch dessen Fassung der Figur: Wer die Karte aus Brave New World
       aufruft, sieht den Red Hulk, wer sie aus The Incredible Hulk aufruft,
       den General. */
    if (hasImage) {
      charPortrait.src = 'assets/characters/portraits/'
        + charLook(char.slug, modalEntry && modalEntry.movie) + '.webp';
    }

    charCount.textContent = char.entries.length === 1
      ? 'Ein Auftritt' : char.entries.length + ' Auftritte';

    charFilms.replaceChildren(...char.entries.map(record => {
      const btn = el('button', 'char-film');
      btn.type = 'button';
      /* Jeder Auftritt trägt die Akzentfarbe seiner Phase – die Liste
         zeigt damit auf einen Blick, über welche Phasen die Figur läuft. */
      btn.style.setProperty('--accent', record.phase.accent);
      btn.append(
        el('span', 'char-film-title', record.movie.title),
        el('span', 'char-film-meta',
          'Phase ' + record.phase.num + ' · ' + (record.movie.period || record.movie.date))
      );
      /* Der Titel, der hinter der Karte offen ist, bleibt markiert und
         führt nirgendwo hin – ein Klick darauf schließt einfach. */
      if (record === modalEntry) {
        btn.classList.add('current');
        btn.setAttribute('aria-current', 'true');
      }
      btn.addEventListener('click', () => {
        if (record !== modalEntry) goToEntry(record);
        /* Der Fokus geht an den Schließen-Button des Film-Modals: Die
           Pille, von der aus geöffnet wurde, hat der Titelwechsel gerade
           durch eine neue ersetzt. */
        closeChar(modalClose);
      });
      const li = el('li');
      li.append(btn);
      return li;
    }));

    /* Akzent vom Film, aus dem heraus geöffnet wurde – die zweite Karte
       soll sichtbar zur ersten gehören. */
    charCard.style.setProperty('--accent',
      (modalEntry ? modalEntry.phase : PHASES[0]).accent);
  }

  function openChar(slug, opener) {
    const char = charIndex.get(slug);
    if (!char) return;
    fillChar(char);
    charOpener = opener || null;
    charOpen = true;
    charCard.scrollTop = 0;
    charModal.classList.add('visible');
    charModal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      if (charOpen) charClose.focus({ preventScroll: true });
    });
  }

  function closeChar(focusTarget) {
    if (!charOpen) return;
    charOpen = false;
    charModal.classList.remove('visible');
    charModal.setAttribute('aria-hidden', 'true');
    const target = focusTarget || charOpener;
    charOpener = null;
    if (target && target.isConnected) target.focus({ preventScroll: true });
  }

  charModal.addEventListener('click', e => {
    if (e.target === charModal) closeChar();
  });
  charClose.addEventListener('click', () => closeChar());

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
    heroSpan = Math.max(1, heroTrack.offsetHeight - window.innerHeight);
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
      item.reveal.shown = -1;
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
    fadeHeroSound();
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

  sectionObserver.observe(heroTrack);
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

  /* Fortschritt eines Elements beim Seiten-Scroll: 0 außerhalb, 1 im Bild.
     Eintritt von unten und Austritt nach oben laufen über dieselbe
     Strecke, damit Zurückscrollen die Einblendung rückwärts abspielt. */
  function revealY(top, height, vh, my) {
    return clamp01(Math.min(
      (vh - my - top) / REVEAL_SPAN,
      (top + height - my) / REVEAL_SPAN
    ));
  }

  function updateEntries(item, tx, vw, vh) {
    const mx = vw * EDGE_X;
    const my = vh * EDGE_Y;
    const baseLeft = item.pinRect.left + item.tlLeft + tx;
    const baseTop = item.pinRect.top + item.tlTop;

    /* Alles außer den Einträgen selbst: Kopfzeile oben, darunter die
       Zeitskala und das Phasenband. Alle hängen am Fortschritt der
       Einträge statt an ihrer eigenen Höhe im Bild, sonst käme die
       Kopfzeile früher herein und die Linien blieben stehen, während die
       Logos schon weg sind. Die Linien sind Pseudo-Elemente und lesen
       ihren Wert aus --reveal, siehe style.css.
       Alle Einträge liegen auf einer Höhe, der erste steht für die Reihe. */
    const rv = item.reveal;
    const row = item.entries[0];
    const qr = Math.round(revealY(baseTop + row.top, row.height, vh, my) * 200);
    if (qr !== rv.shown) {
      rv.shown = qr;
      const ev = smooth(qr / 200);
      rv.heading.style.opacity = ev.toFixed(3);
      rv.heading.style.transform = 'translateY(' + ((1 - ev) * ENTRY_RISE).toFixed(1) + 'px)';
      item.pin.style.setProperty('--reveal', ev.toFixed(3));
    }

    for (const e of item.entries) {
      const left = baseLeft + e.left;
      const top = baseTop + e.top;
      /* Vertikal (Seiten-Scroll): kompletter Eintrag blendet mit Hub */
      const vy = revealY(top, e.height, vh, my);
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

  /* Hero: gepinnte Textsequenz. Der Fortschritt p (0..1) durch den Track
     schaltet die Stufen um – jede blendet in ihrem Fenster scroll-
     gekoppelt ein (Hub von unten, Unschärfe weicht) und wieder aus
     (Drift nach oben, Unschärfe kehrt zurück); Zurückscrollen spielt
     alles rückwärts. Der Titel steht ohne Einblendfenster von Anfang an
     da – sein Auftritt beim Laden gehört der Intro-Choreografie
     (.hero.ready), die das h1 im Wrapper animiert. Die Untertitel bleiben
     bis zum Schluss stehen und fahren mit dem Hero aus dem Bild. */
  const STAGE_RISE = 22;   // px Hub beim Einblenden
  const STAGE_LIFT = 30;   // px Drift nach oben beim Ausblenden
  const STAGE_BLUR = 8;    // px Unschärfe im ausgeblendeten Zustand
  const STAGE_ZOOM = 0.04; // Anteil, um den eine Stufe beim Einblenden größer startet

  /* Breite Fenster (je rund ein Fünftel des Scrollwegs) halten die
     Übergänge ruhig: Auch ein kräftiger Mausrad-Schwung durchläuft eine
     Blende dann über mehrere hundert Pixel Scrollweg statt sie im
     Vorbeiflug zu überspringen. Die kurzen Lücken dazwischen verhindern,
     dass zwei Stufen halbtransparent übereinander stehen. */
  const heroStages = [
    { node: hero.querySelector('.hero-stage-title'),  fadeIn: null,         fadeOut: [0.12, 0.32] },
    { node: hero.querySelector('.hero-stage-kicker'), fadeIn: [0.36, 0.53], fadeOut: [0.58, 0.75] },
    { node: hero.querySelector('.hero-stage-subs'),   fadeIn: [0.79, 0.94], fadeOut: null },
  ];
  for (const s of heroStages) s.shown = -1;

  let heroShown = -1;

  /* Rampe 0→1 über das Fenster [von, bis]; ohne Fenster konstant 1. */
  function ramp(p, span) {
    return span ? clamp01((p - span[0]) / (span[1] - span[0])) : 1;
  }

  function updateHero(vh) {
    const y = window.scrollY;
    const p = y / heroSpan;

    for (const s of heroStages) {
      const vIn = ramp(p, s.fadeIn);
      const vOut = 1 - (s.fadeOut ? ramp(p, s.fadeOut) : 0);
      /* Beide Rampen quantisiert in einem Schlüssel – geschrieben wird
         nur, wenn sich sichtbar etwas ändert */
      const q = Math.round(vIn * 200) * 1000 + Math.round(vOut * 200);
      if (q === s.shown) continue;
      s.shown = q;
      const eIn = smooth(vIn);
      const eOut = smooth(vOut);
      s.node.style.opacity = (eIn * eOut).toFixed(3);
      /* Beim Einblenden startet die Stufe minimal größer und setzt sich
         wie ein Fokuszug ins Bild – transform statt Laufweite/Umbruch,
         damit mehrzeilige Texte während der Blende nicht neu umbrechen. */
      const ty = (1 - eIn) * STAGE_RISE - (1 - eOut) * STAGE_LIFT;
      const sc = 1 + STAGE_ZOOM * (1 - eIn);
      s.node.style.transform = Math.abs(ty) < 0.05 && sc < 1.0005 ? '' :
        'translateY(' + ty.toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
      const blur = Math.min((1 - eIn) + (1 - eOut), 1) * STAGE_BLUR;
      s.node.style.filter = blur < 0.05 ? '' : 'blur(' + blur.toFixed(1) + 'px)';
    }

    /* Nach dem Track löst sich der Hero vom oberen Rand und scrollt mit
       der Seite davon – dabei blendet er wie früher über gut die halbe
       Viewporthöhe aus; Zurückscrollen kehrt es um. */
    const q = Math.round(clamp01((y - heroSpan) / (vh * 0.55)) * 200);
    if (q !== heroShown) {
      heroShown = q;
      hero.style.opacity = q === 0 ? '' : (1 - smooth(q / 200)).toFixed(3);
    }
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

  /* ---------- Tiefer Link von der Charakterseite ----------

     characters.html verlinkt jeden Auftritt einer Figur als
     index.html#titel=<Titel>. Beim Laden wird daraus der Eintrag gesucht,
     die Seite steht danach vor seiner Phase und das Modal ist offen.

     Im Link steht der Titel und nicht der Slug: Loki und Daredevil teilen
     sich pro Staffel einen Logo-Slug, die Titel sind eindeutig. */

  const TITLE_LINK = /^#titel=(.+)$/;

  function openFromHash() {
    const match = TITLE_LINK.exec(location.hash);
    if (!match) return;
    let title;
    try { title = decodeURIComponent(match[1]); } catch (err) { return; }
    const record = chronology.find(entry => entry.movie.title === title);
    if (!record || record === modalEntry) return;
    goToEntry(record);   // schiebt Seite und Zeitskala auf den Eintrag
    openModal(record);
  }

  window.addEventListener('hashchange', openFromHash);

  /* ---------- Start ---------- */

  window.addEventListener('resize', measure);
  measure();
  /* Erst nach measure(): Ohne die Maße der Zeitskala wüsste centerEntry()
     nicht, wie weit es den Eintrag schieben kann. */
  openFromHash();
  requestAnimationFrame(frame);
})();
