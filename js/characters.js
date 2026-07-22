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
  const charCastNames = el('span');
  charCast.append('gespielt von ', charCastNames);

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
  charBody.append(charFilmsBox, charLifeBox);

  const charInner = el('div', 'char-full-inner');
  charInner.append(charHead, charBody);
  charFull.append(charBg, charActions, charInner);
  document.body.append(charFull);

  let charOpen = false;
  let charOpener = null;   // Kachel, von der aus geöffnet wurde
  let charItem = null;     // Figur, die gerade im Vollbild steht
  let charList = [];       // Reihenfolge, durch die die Pfeile blättern

  /* Das Ganzkörperbild zur Biografie (assets/characters/fullsize/
     <slug>.webp, freigestellt mit transparentem Hintergrund). Es steht
     gerahmt rechts im Text, der daran vorbeifließt. Fehlt die Datei,
     bleibt der Rahmen als Platzhalter stehen: Silhouette und
     Anfangsbuchstaben, wie beim Porträtersatz.

     Figuren mit Einträgen in FULLSIZE_LOOKS (js/chars.js) bekommen
     unter dem Rahmen Schalter für ihre Fassungen: Rüstungen,
     Verwandlungen und neue Anzüge im Lauf des Universums. */
  function buildLifeFigure(item) {
    const figure = el('figure', 'char-life-figure');
    const frame = el('span', 'char-life-frame');
    const img = el('img');
    img.src = 'assets/characters/fullsize/' + item.char.slug + '.webp';
    img.alt = 'Ganzkörperbild von ' + item.real;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      img.remove();
      frame.classList.add('empty');
      frame.innerHTML = '<svg viewBox="0 0 24 48" aria-hidden="true">'
        + '<path d="M12 3a4.4 4.4 0 1 1 0 8.8A4.4 4.4 0 0 1 12 3Z'
        + 'M8.2 14h7.6c1.8 0 3.2 1.4 3.2 3.2V28h-2.6v17h-3.4V32.5h-2V45'
        + 'H7.6V28H5V17.2C5 15.4 6.4 14 8.2 14Z"></path></svg>';
      frame.append(el('span', 'char-initials', initials(item.real)));
    });
    frame.append(img);
    figure.append(frame);

    const looks = FULLSIZE_LOOKS[item.char.slug];
    if (looks) {
      const nav = el('figcaption', 'char-look-nav');
      nav.setAttribute('aria-label', 'Fassungen von ' + item.real);
      for (const [label, file] of looks) {
        const chip = el('button', 'char-look', label);
        chip.type = 'button';
        const active = file === item.char.slug;
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (active) chip.classList.add('active');
        chip.addEventListener('click', () => {
          for (const other of nav.children) {
            other.classList.remove('active');
            other.setAttribute('aria-pressed', 'false');
          }
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
          img.src = 'assets/characters/fullsize/' + file + '.webp';
        });
        nav.append(chip);
      }
      figure.append(nav);
    }
    return figure;
  }

  function fillChar(item) {
    const char = item.char;
    charName.textContent = item.real;
    charRoles.textContent = item.roles.join(' · ');
    charRoles.hidden = item.roles.length === 0;

    charCastNames.textContent = item.castNames;
    charCast.hidden = !item.castNames;

    charShotBox.replaceChildren(buildShot(item, 'char-full-shot'));

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
      /* Das Bild zuerst: Als erstes Kind floatet es nach rechts oben,
         die Abschnitte fließen daran vorbei. */
      charLife.replaceChildren(buildLifeFigure(item), ...sections);
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
