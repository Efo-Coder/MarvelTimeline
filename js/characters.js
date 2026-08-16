/* Baut die Charakterseite (characters.html) aus PHASES und ACTORS
   (js/data.js) auf den Grundlagen aus js/chars.js auf.

   Die Timeline zeigt Figuren immer aus einem Film heraus. Hier ist es
   umgekehrt: Erst kommt die Figur, dann ihre Auftritte. Jede Kachel
   öffnet dieselbe Karte, die auch das Film-Modal kennt (Porträt, Rollen,
   Besetzung, Auftritte, Biografie), und jeder Auftritt darin führt
   zurück auf die Timeline, die den Titel direkt aufschlägt.

   Gefiltert wird ohne Neuaufbau: Jede Figur behält ihre einmal gebaute
   Kachel, gerendert wird nur die Reihenfolge der Treffer. So bleiben die
   knapp 200 Porträts geladen, egal wie oft jemand die Suche ändert. */
(function () {
  'use strict';

  const grid = document.getElementById('char-grid');
  const status = document.getElementById('char-status');
  const searchInput = document.getElementById('char-search');
  const searchClear = document.getElementById('char-clear');
  const phaseChips = document.getElementById('char-phases');
  const sortChips = document.getElementById('char-sort');
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* Suchtext und Slug folgen denselben Regeln: „Doctor Strange“ soll auch
     jemand finden, der „Stephen“ tippt, und „Lokis“ Umlaute dürfen dabei
     keine Rolle spielen. */
  function fold(text) {
    return text.toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /* ---------- Datenbasis ---------- */

  const chronology = buildChronology();
  const charIndex = buildCharIndex(chronology);

  /* Aus jeder Figur wird ein Datensatz mit allem, was Kachel, Karte,
     Suche und Filter brauchen. Die Reihenfolge der Map ist die des ersten
     Auftritts – daraus entsteht die chronologische Sortierung. */
  const chars = Array.from(charIndex.values()).map((char, order) => {
    const roles = [];
    for (const name of char.names) {
      const role = splitName(name).role;
      if (role && !roles.includes(role)) roles.push(role);
    }
    const cast = ACTORS[char.slug];
    const castNames = Array.isArray(cast) ? cast.join(', ') : cast || '';
    const phases = [];
    for (const entry of char.entries) {
      if (!phases.includes(entry.phase)) phases.push(entry.phase);
    }
    const real = splitName(char.names[0]).real;
    return {
      char,
      order,
      real,
      roles,
      castNames,
      phases,
      /* Platzhalter wie „Noch unbekannt“ haben kein eigenes Porträt */
      hasImage: !char.names.every(name => CHAR_NO_IMAGE.has(name)),
      accent: char.entries[0].phase.accent,
      haystack: fold([real, char.names.join(' '), roles.join(' '), castNames].join(' ')),
      cell: null,   // die gebaute Kachel, siehe buildCell()
    };
  });

  /* Für den Sprung von einer Beziehung zur genannten Figur: Aus dem Slug
     im Steckbrief (js/facts.js) wird der Datensatz, den die Vollansicht
     anzeigen kann. */
  const bySlug = new Map(chars.map(item => [item.char.slug, item]));

  /* Alle Figuren, denen jemand im Lauf der Reihe begegnet ist. Gezählt
     wird, in wie vielen Titeln sich beide treffen, und danach sortiert –
     die ständigen Weggefährten stehen so vorn und die einmalige
     Begegnung am Ende.

     Maßgeblich ist meets in js/data.js, die Gruppen der Figuren, die im
     jeweiligen Titel wirklich zusammenstehen. Fehlt das Feld, trifft
     jeder jeden, und bei den meisten Titeln ist genau das der Fall.
     Bloße Namensnachbarschaft in derselben Liste reicht dagegen nicht:
     Raza steht in Iron Man neben Pepper Potts und Phil Coulson, ohne
     einem von beiden je zu begegnen.

     Gerechnet wird erst beim Öffnen einer Figur und nur über ihre eigenen
     Auftritte. Ein Index über alle Paare wäre bei 223 Figuren und Filmen
     mit sechzig Namen ein Vielfaches an Arbeit, von der fast nichts
     gebraucht wird. */
  function metCharacters(item) {
    const counts = new Map();
    for (const record of item.char.entries) {
      const movie = record.movie;
      /* Ohne meets zählt die ganze Besetzung als eine Gruppe. */
      const groups = movie.meets
        || [(movie.characters || []).filter(name => !CHAR_NO_PROFILE.has(name)).map(charSlug)];
      const here = new Set();
      for (const group of groups) {
        if (!group.includes(item.char.slug)) continue;
        for (const slug of group) if (slug !== item.char.slug) here.add(slug);
      }
      for (const slug of here) counts.set(slug, (counts.get(slug) || 0) + 1);
    }
    const met = [];
    for (const [slug, shared] of counts) {
      const other = bySlug.get(slug);
      if (other) met.push({ item: other, shared });
    }
    /* Bei gleicher Zahl gemeinsamer Titel steht die Figur vorn, die
       insgesamt öfter auftritt: Nick Fury vor einer Nebenfigur, die
       zufällig im selben einen Film steht. */
    met.sort((a, b) => b.shared - a.shared
      || b.item.char.entries.length - a.item.char.entries.length
      || a.item.real.localeCompare(b.item.real, 'de'));
    return met;
  }

  /* ---------- Kacheln ---------- */

  /* Zwei Anfangsbuchstaben als Ersatz für ein fehlendes Porträt. Bei
     Sammelbegriffen („Die Fantastic Four“) sind das die der ersten beiden
     Wörter, sonst Vor- und Nachname. */
  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2)
      .map(word => word[0].toUpperCase()).join('');
  }

  function buildShot(item, className) {
    const shot = el('span', className);
    if (item.hasImage) {
      const img = el('img');
      img.src = 'assets/characters/portraits/' + item.char.slug + '.webp';
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      /* Fehlt die Datei, tritt der Buchstabenersatz an ihre Stelle,
         statt ein kaputtes Bild stehen zu lassen. */
      img.addEventListener('error', () => {
        img.remove();
        shot.classList.add('empty');
        shot.append(el('span', 'char-initials', initials(item.real)));
      });
      shot.append(img);
    } else {
      shot.classList.add('empty');
      shot.append(el('span', 'char-initials', initials(item.real)));
    }
    return shot;
  }

  function buildCell(item) {
    const btn = el('button', 'char-cell');
    btn.type = 'button';
    /* Jede Kachel trägt die Akzentfarbe der Phase, in der die Figur zum
       ersten Mal auftaucht – das Raster zeigt damit auch, wann wer
       dazugekommen ist. */
    btn.style.setProperty('--accent', item.accent);
    btn.append(
      buildShot(item, 'char-shot'),
      el('span', 'char-cell-name', item.real)
    );
    if (item.roles.length) {
      btn.append(el('span', 'char-cell-role', item.roles.join(' · ')));
    }
    btn.append(el('span', 'char-cell-count', countLabel(item.char.entries.length)));
    btn.addEventListener('click', () => openChar(item));

    const li = el('li');
    li.append(btn);
    item.cell = li;
    return li;
  }

  function countLabel(count) {
    return count === 1 ? 'Ein Auftritt' : count + ' Auftritte';
  }

  chars.forEach(buildCell);

  /* ---------- Suche, Filter, Sortierung ---------- */

  const SORTS = [
    {
      key: 'name',
      label: 'A bis Z',
      compare: (a, b) => a.real.localeCompare(b.real, 'de'),
    },
    {
      key: 'auftritte',
      label: 'Meiste Auftritte',
      compare: (a, b) => b.char.entries.length - a.char.entries.length
        || a.real.localeCompare(b.real, 'de'),
    },
    {
      key: 'chronologie',
      label: 'Erster Auftritt',
      compare: (a, b) => a.order - b.order,
    },
  ];

  let query = '';
  let activePhase = null;   // null = alle Phasen
  let activeSort = SORTS[0];

  /* Die Filterleisten sind zwei Reihen gleicher Pillen: eine für die
     Phasen, eine für die Sortierung. Beide verhalten sich wie ein
     Radiobutton-Satz, deshalb dieselbe Bauart. */
  function buildChip(box, label, isActive, onPick) {
    const chip = el('button', 'chip', label);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    if (isActive) chip.classList.add('active');
    chip.addEventListener('click', () => {
      for (const other of box.children) {
        other.classList.remove('active');
        other.setAttribute('aria-pressed', 'false');
      }
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      onPick();
      render();
    });
    box.append(chip);
    return chip;
  }

  buildChip(phaseChips, 'Alle Phasen', true, () => setPhase(null));
  for (const phase of PHASES) {
    const chip = buildChip(phaseChips, 'Phase ' + phase.num, false, () => setPhase(phase));
    chip.style.setProperty('--accent', phase.accent);
  }

  for (const sort of SORTS) {
    buildChip(sortChips, sort.label, sort === activeSort, () => { activeSort = sort; });
  }

  /* Die gewählte Phase färbt die ganze Seite: Akzent für Pillen und
     Fokusrahmen, dazu die Nebel der Galaxie im Hintergrund. Ohne Filter
     zeigt sie wie auf der Startseite das komplette Spektrum. */
  function setPhase(phase) {
    activePhase = phase;
    root.style.setProperty('--accent', phase ? phase.accent : DEFAULT_ACCENT);
    if (window.Galaxy) Galaxy.setPalette(phase ? phase.nebula : DEFAULT_NEBULA);
  }

  searchInput.addEventListener('input', () => {
    query = fold(searchInput.value.trim());
    render();
  });

  /* Das Kreuz räumt das Feld und gibt den Fokus zurück, damit gleich
     weitergetippt werden kann. Ob es überhaupt zu sehen ist, entscheidet
     das Stylesheet am Platzhalter. */
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    query = '';
    render();
    searchInput.focus();
  });

  function matches(item) {
    if (activePhase && !item.phases.includes(activePhase)) return false;
    return !query || item.haystack.includes(query);
  }

  function render() {
    const hits = chars.filter(matches).sort(activeSort.compare);
    /* Dieselbe Reihenfolge, durch die später die Pfeile im Vollbild
       blättern: Wer nach Phase 3 filtert, blättert auch nur durch Phase 3. */
    charList = hits;
    grid.replaceChildren(...hits.map(item => item.cell));
    grid.hidden = hits.length === 0;

    if (!hits.length) {
      status.textContent = 'Keine Figur gefunden.';
    } else if (hits.length === chars.length) {
      status.textContent = chars.length + ' Figuren aus ' + chronology.length + ' Filmen und Serien';
    } else {
      status.textContent = hits.length + ' von ' + chars.length + ' Figuren';
    }
  }

  /* ---------- Vollbildansicht einer Figur ----------

     Eine Kachel öffnet kein Modal über der Seite, sondern eine Fläche über
     dem ganzen Bildschirm: das Porträt weichgezeichnet als Grund, davor
     Name, Rolle, Besetzung, Kurzbiografie und alle Auftritte.

     Die Auftritte führen zurück auf die Timeline:
     index.html#titel=<Titel> schlägt den Eintrag dort direkt auf (siehe
     openFromHash() in js/main.js). */

  const charFull = el('div', 'char-full');
  charFull.setAttribute('role', 'dialog');
  charFull.setAttribute('aria-modal', 'true');
  charFull.setAttribute('aria-labelledby', 'char-title');
  charFull.setAttribute('aria-hidden', 'true');
  /* Lenis würde das Mausrad abfangen und die Seite dahinter scrollen –
     im Vollbild soll stattdessen es selbst nativ scrollen. */
  charFull.setAttribute('data-lenis-prevent', '');

  /* Der unscharfe Grund. Ein eigenes <img> statt einer CSS-Hintergrund-
     grafik, damit ein fehlendes Porträt einfach ausgeblendet werden kann
     und der Akzent der Phase allein stehen bleibt. */
  const charBlur = el('img', 'char-full-blur');
  charBlur.alt = '';
  charBlur.decoding = 'async';
  charBlur.addEventListener('error', () => { charBlur.hidden = true; });

  const charBg = el('div', 'char-full-bg');
  charBg.setAttribute('aria-hidden', 'true');
  charBg.append(charBlur, el('div', 'char-full-scrim'));

  const charClose = el('button', 'char-full-close');
  charClose.type = 'button';
  charClose.setAttribute('aria-label', 'Vollbild schließen');
  charClose.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="2" stroke-linecap="round" aria-hidden="true">'
    + '<path d="M18 6 6 18M6 6l12 12"></path></svg>';

  /* Zwei Pfeile blättern durch die Figuren, ohne dass man dafür ins Raster
     zurückmuss – wie die Pfeile im Film-Modal durch die Chronologie. Sie
     stehen links vom Schließen-Button, damit die drei Schaltflächen eine
     Reihe bilden. Der Winkel kommt wie dort aus einem gedrehten Kästchen
     und nicht aus einer Schrift: Ein Glyph säße in seiner Zeilenbox nie
     exakt in der Mitte des Kreises. */
  const charPrev = el('button', 'char-full-step prev');
  const charNext = el('button', 'char-full-step next');
  charPrev.type = charNext.type = 'button';
  charPrev.append(el('span'));
  charNext.append(el('span'));

  const charActions = el('div', 'char-full-actions');
  charActions.append(charPrev, charNext, charClose);

  const charName = el('span', 'char-full-real');
  const charRoles = el('span', 'char-full-role');
  const charTitle = el('h2', 'char-full-name');
  charTitle.id = 'char-title';
  charTitle.append(charName, charRoles);

  /* Nimmt die Porträtkugel auf. Sie wird bei jedem Öffnen neu gebaut,
     weil buildShot() den Ersatz aus Anfangsbuchstaben selbst regelt. */
  const charShotBox = el('div', 'char-full-shotbox');

  const charCast = el('p', 'char-full-cast');
  const charCastLabel = el('span');
  const charCastNames = el('span');
  charCast.append(charCastLabel, charCastNames);

  /* Porträt links, daneben Name, Heldenname und Besetzung: Der Kopf
     stellt die Figur komplett vor, ehe darunter die Auftritte folgen. */
  const charText = el('div', 'char-full-headtext');
  charText.append(charTitle, charCast);
  const charHead = el('div', 'char-full-head');
  charHead.append(charShotBox, charText);

  const charCount = el('p', 'char-full-label');
  const charFilms = el('ul', 'char-full-films');
  const charFilmsBox = el('div', 'char-full-filmsbox');
  charFilmsBox.append(charCount, charFilms);

  /* Das Ganzkörperbild als eigene Sektion zwischen Auftritten und
     Biografie, über die volle Breite. Gefüllt wird sie beim Öffnen, weil
     buildFigure() an der Figur hängt. */
  const charFigureSlot = el('div', 'char-figure-slot');
  const charFigureBox = el('div', 'char-full-figure');
  charFigureBox.append(el('p', 'char-full-label', 'Erscheinung'), charFigureSlot);

  /* Die ausführliche Biografie aus PROFILES (js/profiles.js): benannte
     Abschnitte in Handlungsreihenfolge, unter Porträt und Auftritten über
     die volle Breite. Fehlt der Eintrag, entfällt der ganze Block. */
  const charLife = el('div', 'char-full-life-sections');
  /* Eine Figur mit vielen Auftritten bringt es auf über ein Dutzend
     Abschnitte. Die Sprungleiste zeigt deshalb vorweg, was kommt, und
     führt direkt hin, statt durch alles hindurchscrollen zu lassen. */
  const charLifeNav = el('div', 'char-life-nav');
  charLifeNav.setAttribute('aria-label', 'Abschnitte der Biografie');
  const charLifeBox = el('div', 'char-full-life');
  charLifeBox.append(el('p', 'char-full-label', 'Biografie'), charLifeNav, charLife);

  const charBody = el('div', 'char-full-body');
  charBody.append(charFilmsBox, charFigureBox, charLifeBox);

  const charInner = el('div', 'char-full-inner');
  charInner.append(charHead, charBody);
  charFull.append(charBg, charActions, charInner);
  document.body.append(charFull);

  let charOpen = false;
  let charOpener = null;   // Kachel, von der aus geöffnet wurde
  let charItem = null;     // Figur, die gerade im Vollbild steht
  let charList = [];       // Reihenfolge, durch die die Pfeile blättern

  /* Das Ganzkörperbild (assets/characters/fullsize/<slug>.webp,
     freigestellt mit transparentem Hintergrund). Es steht in einem
     Rahmen über die volle Breite, wie auf einer Bühne im Lichtkegel.
     Fehlt die Datei, bleibt der Rahmen als Platzhalter stehen:
     Silhouette und Anfangsbuchstaben, wie beim Porträtersatz.

     Figuren mit Einträgen in FULLSIZE_LOOKS (js/chars.js) bekommen im
     Rahmen links Schalter für ihre Fassungen: Rüstungen,
     Verwandlungen und neue Anzüge im Lauf des Universums. */
  function lookSrc(file) {
    return 'assets/characters/fullsize/' + file + '.webp';
  }

  /* Schon geladene und dekodierte Fassungen. Was hier steht, kann ohne
     Warten eingeblendet werden. */
  const lookReady = new Set();

  /* Mit welchem Anteil die Fassungsleiste ihrem Rollziel pro Bild
     nachläuft. Derselbe Wert wie über der Zeitskala der Timeline
     (WHEEL_EASE in js/main.js), damit sich beide Leisten gleich anfühlen. */
  const LOOK_WHEEL_EASE = 0.14;

  /* Lädt eine Fassung im Hintergrund. decode() statt load, damit das Bild
     beim Einblenden nicht noch im Dekoder hängt und die erste Bildfolge
     der Überblendung leer bleibt. */
  function loadLook(file) {
    if (lookReady.has(file)) return Promise.resolve();
    const probe = new Image();
    probe.src = lookSrc(file);
    const done = typeof probe.decode === 'function'
      ? probe.decode()
      : new Promise((resolve, reject) => {
        probe.addEventListener('load', resolve);
        probe.addEventListener('error', reject);
      });
    return done.then(
      () => { lookReady.add(file); },
      /* decode() weist auch mal ein fertig geladenes Bild zurück. Erst
         wenn wirklich nichts angekommen ist, gilt die Datei als fehlend. */
      err => {
        if (!probe.complete || !probe.naturalWidth) throw err;
        lookReady.add(file);
      }
    );
  }

  /* ---------- Steckbrief ----------

     Das Fenster rechts im Rahmen: links steht die Figur, rechts steht,
     was sie ausmacht. Die Angaben kommen aus CHAR_FACTS (js/facts.js),
     die Beziehungen aus CHAR_BONDS und aus den gemeinsamen Filmen.

     Wie viele Begegnungen vor dem Ausklappen stehen. Nick Fury kommt auf
     weit über hundert – die gesamte Liste stünde als Wand im Bild und
     wäre für die Frage, mit wem er dauernd zu tun hat, unbrauchbar. */
  const MET_SHOWN = 10;

  function buildFacts(item) {
    /* CHAR_FACTS lädt wie PROFILES nur die Charakterseite. Über dem
       Generat aus den Wikis liegen die Angaben von Hand, Feld für Feld:
       Kräfte stehen in keiner Infobox, und was das Wiki ungenau führt,
       wird dort überschrieben. */
    const facts = typeof CHAR_FACTS === 'undefined' ? null
      : Object.assign({}, CHAR_FACTS[item.char.slug],
        typeof CHAR_FACTS_EXTRA === 'undefined' ? null : CHAR_FACTS_EXTRA[item.char.slug]);
    const bonds = typeof CHAR_BONDS === 'undefined' ? null : CHAR_BONDS[item.char.slug];
    const box = el('aside', 'char-facts');
    box.setAttribute('aria-label', 'Steckbrief von ' + item.real);

    const list = el('dl', 'char-facts-list');
    /* Jede Angabe ist freiwillig: Was zu einer Figur nicht bekannt ist,
       lässt das Fenster weg, statt eine Zeile mit Strich zu zeigen. */
    function addRow(label, value) {
      if (!value || (Array.isArray(value) && !value.length)) return;
      const row = el('div', 'char-facts-row');
      row.append(
        el('dt', 'char-facts-key', label),
        el('dd', 'char-facts-value', Array.isArray(value) ? value.join(' · ') : value)
      );
      list.append(row);
    }

    if (facts) {
      addRow('Herkunft', facts.origin);
      addRow('Spezies', facts.species);
      addRow('Größe', facts.height);
      addRow('Zugehörigkeit', facts.teams);
      addRow('Status', facts.status);
      addRow('Kräfte', facts.powers);
    }
    if (list.children.length) box.append(list);

    /* Ein Name führt zur Figur: Der Link trägt denselben Hash, den auch
       die Adressleiste beim Öffnen setzt (characters.html#<slug>). Ein
       gewöhnlicher Klick schaltet die offene Ansicht direkt um, Mittel-
       und Strg-Klick öffnen die Figur im neuen Tab, wo der Hash sie
       aufschlägt. */
    function bondLink(target, label) {
      const link = el('a', 'char-bond');
      link.href = '#' + target.char.slug;
      link.style.setProperty('--accent', target.accent);
      if (label) link.append(el('span', 'char-bond-label', label));
      link.append(el('span', 'char-bond-name', target.real));
      link.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        jumpToChar(target);
      });
      const li = el('li');
      li.append(link);
      return li;
    }

    const named = [];
    const namedSlugs = new Set();
    for (const [label, slug] of bonds || []) {
      const target = bySlug.get(slug);
      /* Ein Slug, den es nicht gibt, wird übersprungen: In js/facts.js
         steht auch, wer noch keinen eigenen Auftritt hat. */
      if (!target) continue;
      namedSlugs.add(slug);
      named.push(bondLink(target, label));
    }
    if (named.length) {
      box.append(el('h4', 'char-facts-head', 'Beziehungen'));
      const ul = el('ul', 'char-bonds');
      ul.append(...named);
      box.append(ul);
    }

    /* Die benannten Beziehungen stehen schon oben, hier folgt der Rest:
       jeder, mit dem die Figur eine Leinwand geteilt hat. */
    const met = metCharacters(item).filter(entry => !namedSlugs.has(entry.item.char.slug));
    if (met.length) {
      box.append(el('h4', 'char-facts-head', 'Begegnet'));
      const ul = el('ul', 'char-bonds char-bonds-met');
      ul.append(...met.slice(0, MET_SHOWN).map(entry => bondLink(entry.item, '')));
      box.append(ul);

      if (met.length > MET_SHOWN) {
        const rest = el('ul', 'char-bonds char-bonds-met');
        rest.hidden = true;
        rest.append(...met.slice(MET_SHOWN).map(entry => bondLink(entry.item, '')));
        const more = el('button', 'char-facts-more',
          'Alle ' + met.length + ' anzeigen');
        more.type = 'button';
        more.setAttribute('aria-expanded', 'false');
        more.addEventListener('click', () => {
          const open = rest.hidden;
          rest.hidden = !open;
          more.setAttribute('aria-expanded', open ? 'true' : 'false');
          more.textContent = open ? 'Weniger anzeigen' : 'Alle ' + met.length + ' anzeigen';
        });
        box.append(rest, more);
      }
    }

    /* Ohne einen einzigen Eintrag bliebe ein leerer Kasten im Bild
       stehen. Figuren ohne Steckbrief haben immerhin ihre Begegnungen,
       ganz leer wird das Fenster nur bei einer Figur, die allein in
       ihrem einzigen Film steht. */
    return box.children.length ? box : null;
  }

  function buildFigure(item) {
    const figure = el('figure', 'char-figure');
    /* Rahmen und alles, was in ihm liegt: die Fassungsleiste hängt an
       dieser Bühne und nicht am figure. Auf schmalen Fenstern rückt der
       Steckbrief unter den Rahmen und macht das figure damit doppelt so
       hoch – eine an ihm ausgerichtete Leiste stünde dann in der Mitte
       des Steckbriefs statt in der Mitte des Bildes. */
    const stage = el('div', 'char-figure-stage');
    const frame = el('span', 'char-figure-frame');
    const stack = el('span', 'char-figure-stack');
    frame.append(stack);
    stage.append(frame);
    figure.append(stage);

    /* Zwei Ebenen übereinander: Eine trägt die sichtbare Fassung, die
       andere nimmt die nächste auf und wird darübergeblendet. */
    function buildLayer() {
      const layer = el('span', 'char-figure-layer');
      const img = el('img');
      img.alt = '';
      img.decoding = 'async';
      layer.append(img);
      stack.append(layer);
      return layer;
    }

    const layers = [buildLayer(), buildLayer()];
    let front = 0;      // Ebene, die gerade vorne liegt
    let shown = null;    // Fassung darauf
    let ticket = 0;      // nur der jüngste Wechsel darf noch durchkommen
    let busyTimer = 0;
    let gone = false;    // Datei fehlt, der Rahmen zeigt den Platzhalter
    /* Setzt das große Logo oben links auf die gezeigte Fassung. Es gibt
       das nur bei Figuren mit Fassungsleiste, sonst bleibt der Haken leer
       und der Bildwechsel ruft ins Nichts. */
    let markCurrent = null;

    /* Der Rahmen hat ein festes Format, das Bild schöpft ihn nur so weit
       aus, wie die Körpergröße der Figur es hergibt (FULLSIZE_SCALE in
       js/chars.js, dazu die Feinkorrektur der Datei aus FULLSIZE_FIT).
       Der Wert hängt an der Datei, nicht an der Figur, und zieht deshalb
       mit der Ebene um. */
    function paint(layer, file) {
      layer.firstElementChild.src = lookSrc(file);
      layer.style.setProperty('--figure-scale', fullsizeScale(file));
    }

    /* Nur die vordere Ebene ist sichtbar, nur sie beschreibt das Bild.
       Die hintere bleibt für Vorlesegeräte stumm. */
    function setFront(index) {
      front = index;
      layers.forEach((layer, at) => {
        const isFront = at === index;
        layer.classList.toggle('front', isFront);
        layer.setAttribute('aria-hidden', isFront ? 'false' : 'true');
        layer.firstElementChild.alt = isFront
          ? 'Ganzkörperbild von ' + item.real : '';
      });
    }

    /* Fehlt die Datei, tritt der Buchstabenersatz an ihre Stelle, statt
       ein kaputtes Bild stehen zu lassen. Das Format hat der Rahmen. */
    function showEmpty() {
      gone = true;
      clearTimeout(busyTimer);
      frame.classList.remove('busy');
      frame.classList.add('empty');
      frame.innerHTML = '<svg viewBox="0 0 24 48" aria-hidden="true">'
        + '<path d="M12 3a4.4 4.4 0 1 1 0 8.8A4.4 4.4 0 0 1 12 3Z'
        + 'M8.2 14h7.6c1.8 0 3.2 1.4 3.2 3.2V28h-2.6v17h-3.4V32.5h-2V45'
        + 'H7.6V28H5V17.2C5 15.4 6.4 14 8.2 14Z"></path></svg>';
      frame.append(el('span', 'char-initials', initials(item.real)));
    }

    /* Ein Fassungswechsel wartet, bis die neue Datei fertig dekodiert ist,
       und blendet dann über. Würde stattdessen das src im sichtbaren Bild
       getauscht, stünde die alte Fassung erst noch im Maß der neuen im
       Rahmen und sprang danach hart um. */
    function showLook(file) {
      if (gone || file === shown) return;
      const mine = ++ticket;
      const next = layers[1 - front];
      const swap = () => {
        if (gone || mine !== ticket) return;
        clearTimeout(busyTimer);
        frame.classList.remove('busy');
        paint(next, file);
        shown = file;
        setFront(1 - front);
        if (markCurrent) markCurrent(file);
      };
      if (lookReady.has(file)) {
        swap();
        return;
      }
      /* Beim ersten Mal kann das Laden dauern. Der Rahmen dimmt dann ab,
         damit der Klick nicht ins Leere geht. */
      busyTimer = setTimeout(() => {
        if (!gone && mine === ticket) frame.classList.add('busy');
      }, 140);
      loadLook(file).then(swap, () => {
        if (mine === ticket) showEmpty();
      });
    }

    /* Die Standardansicht ist der erste Eintrag in FULLSIZE_LOOKS, egal
       wie seine Datei heißt: Die Reihenfolge dort bestimmt, was im Rahmen
       steht und welcher Schalter gedrückt ist. Figuren ohne Eintrag haben
       nur ihr eines Bild, das wie ihr Schlüssel heißt. */
    const looks = FULLSIZE_LOOKS[item.char.slug];
    const standard = looks && looks.length ? looks[0][1] : item.char.slug;

    /* Sie steht sofort und ohne Überblendung im Rahmen, geladen wird sie
       wie jedes Bild der Seite erst, wenn sie in Sicht kommt. */
    const first = layers[0].firstElementChild;
    first.loading = 'lazy';
    first.addEventListener('error', showEmpty);
    first.addEventListener('load', () => lookReady.add(standard));
    paint(layers[0], standard);
    shown = standard;
    setFront(0);

    if (looks) {
      /* Das Logo der gezeigten Fassung noch einmal groß in der freien
         Ecke oben links: Die Leiste unten führt sechzehn Rüstungen in
         Briefmarkengröße, hier steht der Film dazu in lesbarer Größe.
         Es liegt über dem Bild, nimmt aber keine Klicks an, sonst fiele
         ein Griff in diese Ecke ins Leere. */
      const filmOf = new Map(looks.map(([, file, film]) => [file, film]));
      const current = el('div', 'char-look-current');
      const currentImg = el('img');
      currentImg.alt = '';
      currentImg.decoding = 'async';
      current.append(currentImg);
      stage.append(current);

      markCurrent = file => {
        const film = filmOf.get(file);
        current.classList.toggle('empty', !film);
        if (!film) return;
        /* Erst mit dem fertigen Bild einblenden: Sonst stünde beim
           Wechsel für einen Moment die leere Fläche in der Ecke. */
        current.classList.remove('ready');
        currentImg.onload = () => current.classList.add('ready');
        currentImg.onerror = () => current.classList.add('empty');
        currentImg.src = 'assets/logos/' + film + '.webp';
      };
      markCurrent(standard);

      const nav = el('div', 'char-look-nav');
      nav.setAttribute('aria-label', 'Fassungen von ' + item.real);

      /* Mausrad über der Leiste rollt sie zur Seite. Die Leiste liegt
         quer, ein Rad dreht sich aber hoch und runter: Ohne diese
         Übersetzung scrollte die Seite hinter ihr weg und die Fassungen
         blieben stehen.

         Gerollt wird nicht in Sprüngen, sondern weich: Jede Raste legt
         ihren Weg auf ein Ziel, und die Leiste läuft ihm Bild für Bild
         hinterher. Dieselbe Mechanik wie über der Zeitskala der Timeline,
         siehe onTimelineWheel und WHEEL_EASE in js/main.js. */
      let targetX = null;   // Ziel, dem die Leiste nachläuft
      /* Die eigene, ungerundete Position. scrollLeft gibt nur ganze Pixel
         zurück: Auf den letzten Pixeln ist ein Schritt kleiner als einer,
         fiele beim Zurücklesen weg, und die Leiste bliebe kurz vor dem
         Ziel für immer stehen. Gerechnet wird deshalb hier, scrollLeft
         folgt nur. */
      let posX = 0;
      let rolling = 0;      // laufender Bildlauf

      function roll() {
        rolling = 0;
        if (targetX === null) return;
        const diff = targetX - posX;
        /* Unter einem halben Pixel ist der Rest nicht mehr zu sehen, und
           ohne diesen Abbruch liefe die Schleife ewig weiter. */
        if (Math.abs(diff) < 0.5) {
          posX = targetX;
          nav.scrollLeft = targetX;
          targetX = null;
          return;
        }
        posX += diff * LOOK_WHEEL_EASE;
        nav.scrollLeft = posX;
        rolling = requestAnimationFrame(roll);
      }

      /* Am Anschlag bleibt das Ereignis unangetastet und läuft weiter an
         die Seite: Wer über der Leiste weiterdreht, obwohl links oder
         rechts nichts mehr kommt, will die Seite scrollen. */
      nav.addEventListener('wheel', e => {
        const rest = nav.scrollWidth - nav.clientWidth;
        if (rest <= 0) return;
        const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const step = e.deltaMode === 1 ? raw * 16
          : e.deltaMode === 2 ? raw * nav.clientWidth
          : raw;
        /* Gerechnet wird ab dem Ziel und nicht ab dem, wo die Leiste
           gerade steht: Sonst verschluckte jede Raste, die während des
           Nachlaufens kommt, einen Teil ihres Wegs. Steht nichts aus,
           fängt der Lauf da an, wo die Leiste wirklich steht: Sie kann
           inzwischen an der Rollleiste gezogen worden sein. */
        if (targetX === null) posX = nav.scrollLeft;
        const from = targetX === null ? posX : targetX;
        const next = Math.max(0, Math.min(rest, from + step));
        if (next === from) return;
        e.preventDefault();
        targetX = next;
        if (reduceMotion) {
          posX = next;
          nav.scrollLeft = next;
          targetX = null;
          return;
        }
        if (!rolling) rolling = requestAnimationFrame(roll);
      }, { passive: false });

      for (const [label, file, film] of looks) {
        const chip = el('button', 'char-look');
        chip.type = 'button';
        /* Links das Logo des Films, aus dem die Fassung stammt, rechts
           daneben ihr Name. Der Logokasten hat ein festes Maß und bleibt
           auch ohne Datei stehen, damit die Namen aller Schalter auf
           derselben Höhe beginnen. Dieselben Dateien wie auf der
           Timeline und in der Auftrittsliste (assets/logos/<slug>.webp). */
        const logo = el('span', 'char-look-logo');
        if (film) {
          const logoImg = el('img');
          logoImg.alt = '';
          logoImg.loading = 'lazy';
          logoImg.decoding = 'async';
          logoImg.addEventListener('error', () => logoImg.remove());
          logoImg.src = 'assets/logos/' + film + '.webp';
          logo.append(logoImg);
        }
        chip.append(logo, el('span', 'char-look-label', label));
        const active = file === standard;
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (active) chip.classList.add('active');
        /* Wer die Maus auf einen Schalter legt, hat sich meist schon
           entschieden: Die Fassung lädt dann vor dem Klick und wechselt
           danach ohne Wartezeit. */
        chip.addEventListener('pointerenter', () => {
          loadLook(file).catch(() => {});
        });
        chip.addEventListener('click', () => {
          for (const other of nav.children) {
            other.classList.remove('active');
            other.setAttribute('aria-pressed', 'false');
          }
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
          /* Bei vielen Fassungen läuft die Leiste über die Breite hinaus.
             Ein Schalter, der nur halb im Bild stand, rückt nach dem
             Klick ganz herein. „nearest“ lässt alles in Ruhe, was ohnehin
             ganz zu sehen ist, und rührt die Seite darunter nicht an.

             Ein Rollziel vom Mausrad wird dabei fallen gelassen: Sonst
             zöge der Nachlauf die Leiste gleich wieder zurück. */
          targetX = null;
          chip.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
          showLook(file);
        });
        nav.append(chip);
      }
      stage.append(nav);
    }

    const facts = buildFacts(item);
    if (facts) figure.append(facts);
    return figure;
  }

  function fillChar(item) {
    const char = item.char;
    charName.textContent = item.real;
    charRoles.textContent = item.roles.join(' · ');
    charRoles.hidden = item.roles.length === 0;

    charCastLabel.textContent = CHAR_VOICE_ONLY.has(char.slug)
      ? 'gesprochen von ' : 'gespielt von ';
    charCastNames.textContent = item.castNames;
    charCast.hidden = !item.castNames;

    charShotBox.replaceChildren(buildShot(item, 'char-full-shot'));
    charFigureSlot.replaceChildren(buildFigure(item));

    charBlur.hidden = !item.hasImage;
    if (item.hasImage) {
      charBlur.src = 'assets/characters/portraits/' + char.slug + '.webp';
    } else {
      charBlur.removeAttribute('src');
    }

    /* PROFILES lädt nur die Charakterseite, deshalb der Blick auf die
       Existenz der Liste statt allein auf den Eintrag. */
    const life = typeof PROFILES === 'undefined' ? null : PROFILES[char.slug];
    charLifeBox.hidden = !life;
    if (life) {
      const jumps = [];
      const sections = life.map(part => {
        const section = el('section', 'char-life');
        section.append(
          el('h3', 'char-life-title', part[0]),
          el('p', 'char-life-text', part[1])
        );
        const jump = el('button', 'char-life-jump', part[0]);
        jump.type = 'button';
        jump.addEventListener('click', () => {
          section.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        });
        jumps.push(jump);
        return section;
      });
      charLife.replaceChildren(...sections);
      /* Bei wenigen Abschnitten steht die Leiste nur im Weg: Sie wäre
         länger als der Weg, den sie abkürzt. */
      charLifeNav.hidden = jumps.length < 5;
      charLifeNav.replaceChildren(...jumps);
    }

    charCount.textContent = countLabel(char.entries.length);

    charFilms.replaceChildren(...char.entries.map(record => {
      const link = el('a', 'char-film');
      link.href = 'index.html#titel=' + encodeURIComponent(record.movie.title);
      /* Jeder Auftritt trägt die Akzentfarbe seiner Phase – die Liste
         zeigt damit auf einen Blick, über welche Phasen die Figur läuft. */
      link.style.setProperty('--accent', record.phase.accent);
      /* Links das Filmlogo, dieselben Dateien wie auf der Timeline
         (assets/logos/<slug>.webp), rechts daneben Titel und Phase. Der
         Logokasten ist fest bemessen und bleibt auch stehen, wenn die
         Datei fehlt – so fangen die Titel in allen Kacheln bündig an. */
      const logo = el('span', 'char-film-logo');
      const logoImg = el('img');
      logoImg.alt = '';
      logoImg.loading = 'lazy';
      logoImg.decoding = 'async';
      logoImg.addEventListener('error', () => logoImg.remove());
      logoImg.src = 'assets/logos/' + record.movie.slug + '.webp';
      logo.append(logoImg);
      const text = el('span', 'char-film-text');
      text.append(
        el('span', 'char-film-title', record.movie.title),
        el('span', 'char-film-meta',
          'Phase ' + record.phase.num + ' · ' + (record.movie.period || record.movie.date))
      );
      link.append(logo, text);
      const li = el('li');
      li.append(link);
      return li;
    }));

    charFull.style.setProperty('--accent', item.accent);
  }

  /* Die Figur, auf der ein Pfeil landet – gezählt wird in der Liste, die
     das Raster gerade zeigt. Am Rand der Liste gibt es keine. */
  function stepTarget(delta) {
    const at = charItem ? charList.indexOf(charItem) : -1;
    return at === -1 ? null : charList[at + delta] || null;
  }

  /* Beschriftet einen Pfeil mit der Figur, auf der er landet, und schaltet
     ihn an den Enden der Liste ab. */
  function labelStep(btn, target, word) {
    btn.disabled = !target;
    btn.setAttribute('aria-label', target ? word + ': ' + target.real : word);
    btn.title = target ? target.real : '';
  }

  /* Inhalt des Vollbilds auf eine Figur umstellen – beim Öffnen wie beim
     Blättern derselbe Weg. */
  function showChar(item) {
    charItem = item;
    fillChar(item);
    charInner.scrollTop = 0;
    labelStep(charPrev, stepTarget(-1), 'Vorherige Figur');
    labelStep(charNext, stepTarget(1), 'Nächste Figur');
    /* Die Adresse merkt sich die offene Figur, ohne einen Verlaufsschritt
       anzulegen: Ein geteilter Link öffnet sie beim Laden wieder. */
    setHash('#' + item.char.slug);
    /* Beim Blättern wandert das Fokusziel mit: Wer danach schließt, steht
       vor der Figur, die er zuletzt gelesen hat, statt vor der, bei der er
       eingestiegen ist. */
    charOpener = item.cell.firstElementChild;
  }

  /* Eine Figur weiter oder zurück. */
  function stepChar(delta) {
    const target = charOpen ? stepTarget(delta) : null;
    if (!target) return;
    /* Am Ende der Liste wird der gedrückte Pfeil deaktiviert – der Browser
       nimmt ihm dabei den Fokus, deshalb vorher merken und danach dem
       Gegenpfeil geben. */
    const held = document.activeElement;
    showChar(target);
    if (held === charPrev && charPrev.disabled) charNext.focus();
    else if (held === charNext && charNext.disabled) charPrev.focus();
  }

  /* Ein Klick auf eine Beziehung im Steckbrief schlägt die genannte Figur
     auf, ohne den Umweg über das Raster. */
  function jumpToChar(target) {
    /* Die Zielfigur kann durch Suche oder Phasenfilter aus dem Raster
       gefallen sein. Die Pfeile blättern dann ab hier durch alle Figuren
       statt an Ort und Stelle stehen zu bleiben. Das nächste render()
       stellt die gefilterte Reihenfolge wieder her. */
    if (charList.indexOf(target) === -1) {
      charList = chars.slice().sort(activeSort.compare);
    }
    showChar(target);
    /* Der angeklickte Link ist mit dem Inhalt verschwunden, der Fokus
       stünde sonst wieder ganz am Anfang der Seite. */
    charClose.focus({ preventScroll: true });
  }

  charPrev.addEventListener('click', () => stepChar(-1));
  charNext.addEventListener('click', () => stepChar(1));

  function openChar(item) {
    charOpen = true;
    showChar(item);
    charFull.classList.add('visible');
    charFull.setAttribute('aria-hidden', 'false');
    /* Seite hinter dem Vollbild festhalten: Lenis setzt dafür selbst
       .lenis-stopped, die Klasse deckt den Fall ohne Lenis ab. */
    root.classList.add('modal-open');
    if (lenis) lenis.stop();
    requestAnimationFrame(() => {
      if (charOpen) charClose.focus({ preventScroll: true });
    });
  }

  function closeChar() {
    if (!charOpen) return;
    charOpen = false;
    charItem = null;
    charFull.classList.remove('visible');
    charFull.setAttribute('aria-hidden', 'true');
    root.classList.remove('modal-open');
    if (lenis) lenis.start();
    setHash('');
    const target = charOpener;
    charOpener = null;
    if (target && target.isConnected) target.focus({ preventScroll: true });
  }

  function setHash(hash) {
    try {
      history.replaceState(null, '', hash || location.pathname + location.search);
    } catch (err) {}
  }

  /* Ein Klick neben den Inhalt schließt, wie der Klick neben eine Karte es
     tat. Getroffen wird dabei die scrollende Fläche selbst – der Inhalt
     darin füllt sie ja nur oben aus. */
  charInner.addEventListener('click', e => {
    if (e.target === charInner) closeChar();
  });
  charClose.addEventListener('click', () => closeChar());

  /* Fokus im offenen Vollbild halten: Tab wandert nur durch seine eigenen
     Schaltflächen und Links und springt am Ende wieder an den Anfang. */
  function trapTab(e) {
    e.preventDefault();
    const stops = Array.from(charFull.querySelectorAll('button:not([disabled]), a[href]'));
    if (!stops.length) return;
    const at = stops.indexOf(document.activeElement);
    const to = at === -1 ? 0
      : (at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length;
    stops[to].focus();
  }

  document.addEventListener('keydown', e => {
    if (charOpen) {
      if (e.key === 'Escape') closeChar();
      else if (e.key === 'ArrowLeft') stepChar(-1);
      else if (e.key === 'ArrowRight') stepChar(1);
      else if (e.key === 'Tab') trapTab(e);
      return;
    }
    /* Tippen beginnt sofort in der Suche, ohne sie erst anzuklicken.
       Nur einzelne Zeichen ohne Sondertaste, damit Kürzel wie Strg+F
       beim Browser bleiben. */
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
        && document.activeElement !== searchInput) {
      searchInput.focus();
    }
  });

  /* ---------- Lenis Smooth Scroll ---------- */

  let lenis = null;
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, autoRaf: false });
    requestAnimationFrame(function frame(time) {
      lenis.raf(time);
      requestAnimationFrame(frame);
    });
  }

  /* ---------- Start ---------- */

  setPhase(null);
  render();

  /* characters.html#<slug> öffnet die Figur direkt – so verlinkt die
     Adressleiste eine Figur, ohne dass jemand suchen muss. */
  const wanted = decodeURIComponent(location.hash.slice(1));
  if (wanted) {
    const item = chars.find(entry => entry.char.slug === wanted);
    if (item) openChar(item);
  }
})();
