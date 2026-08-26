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
  const movieChips = document.getElementById('char-movies');
  const worldChips = document.getElementById('char-worlds');
  const filterButton = document.getElementById('char-filter');
  const filterPanel = document.getElementById('char-filter-panel');
  const sortButton = document.getElementById('char-sort-button');
  const sortPanel = document.getElementById('char-sort-panel');
  const sortText = document.getElementById('char-sort-text');
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* Setzt ein Filmlogo in seiner dunklen Fassung: assets/logos/dark/<slug>.webp.

     Diese Seite steht auf Weiß. Die Logos unter assets/logos/ sind für
     den dunklen Grund der Timeline gezeichnet und verschwänden hier fast
     vollständig, deshalb liegt daneben derselbe Schriftzug noch einmal
     als dunkle Vorlage. Beide Fassungen haben dieselben Bildmaße, damit
     LogoFit in der Galaxie und hier auf dieselbe Größe kommt.

     Fehlt eine dunkle Vorlage, tritt die helle ein: ein blasses Logo ist
     immer noch die Auskunft, aus welchem Film die Fassung stammt. Fehlen
     beide, meldet das onMissing() dem Aufrufer, der den Platz räumt.

     onerror wird zugewiesen und nicht angehängt: Die Bühne benutzt für
     jede Figur dasselbe <img> wieder, ein angehängter Lauscher bliebe
     dort über alle Wechsel hinweg liegen. src steht zuletzt, sonst liefe
     das Laden schon los, bevor der Notnagel bereitsteht. */
  function setFilmLogo(img, slug, onMissing) {
    let fallback = false;
    img.onerror = () => {
      if (fallback) { if (onMissing) onMissing(); return; }
      fallback = true;
      img.src = 'assets/logos/' + slug + '.webp';
    };
    img.src = 'assets/logos/dark/' + slug + '.webp';
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
    /* Die Welt der Figur steht nicht im Namen, sondern als eigene
       Angabe daneben: Sie gehört nicht zur Person, sondern sagt, aus
       welcher Wirklichkeit diese Person stammt. */
    const { real, world } = splitName(char.names[0]);
    return {
      char,
      order,
      real,
      world,
      /* Wonach der Weltfilter greift. Die allermeisten Figuren tragen
         keine Welt im Namen, weil sie in der Hauptwirklichkeit stehen und
         dort niemand dazusagen muss, wo er ist. Für den Filter braucht
         auch diese Wirklichkeit einen Namen, sonst hieße ihr Schalter
         „ohne Welt“ und stünde neben Erde-838 wie ein Rest. */
      worldKey: world || CHAR_HOME_WORLD,
      roles,
      /* Der Name, der auf der Kachel und über der Bühne groß dasteht: der
         Heldenname, sonst der bürgerliche. Er ist zugleich der Schlüssel,
         nach dem „A bis Z“ sortiert – sortiert würde sonst nach einem
         Namen, der auf der Kachel gar nicht oben steht, und das Raster
         läse sich ungeordnet. */
      headline: roles.length ? roles.join(' · ') : real,
      castNames,
      phases,
      /* Platzhalter wie „Noch unbekannt“ haben kein eigenes Porträt */
      hasImage: !char.names.every(name => CHAR_NO_IMAGE.has(name)),
      haystack: fold([real, char.names.join(' '), roles.join(' '), castNames].join(' ')),
      cell: null,   // die gebaute Kachel, siehe buildCell()
    };
  });

  /* Für den Sprung von einer Beziehung zur genannten Figur: Aus dem Slug
     im Steckbrief (js/facts.js) wird der Datensatz, den die Vollansicht
     anzeigen kann. */
  const bySlug = new Map(chars.map(item => [item.char.slug, item]));

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

  /* Die Kachel im Aufbau der Karten von marvel.com/characters: oben das
     Bild, darunter ein Block mit dem Heldennamen groß und dem bürgerlichen
     Namen klein daraus. Der Block ist eine eigene Fläche, weil der rote
     Balken an seiner Oberkante beim Zeigen bis nach unten durchläuft und
     dafür etwas braucht, das er füllen kann (siehe .char-cell-info im
     Stylesheet).

     Die Zahl der Auftritte hat die Vorlage nicht, sie ist die eine Angabe,
     die diese Seite mehr weiß. Sie steht am Fuß des Blocks, den die Vorlage
     ohnehin frei lässt. */
  function buildCell(item) {
    const btn = el('button', 'char-cell');
    btn.type = 'button';

    const text = el('span', 'char-cell-text');
    text.append(el('span', 'char-cell-name', item.headline));
    /* Nur bei Figuren mit Heldennamen: Sonst stünde der bürgerliche Name
       zweimal untereinander. */
    if (item.roles.length) {
      text.append(el('span', 'char-cell-real', item.real));
    }
    /* Die Welt steht als eigene Zeile darunter und nicht als Klammer
       hinter dem Namen: Zwei Figuren mit demselben Gesicht unterscheiden
       sich genau darin, und das soll man auf einen Blick sehen. */
    if (item.world) {
      text.append(el('span', 'char-cell-world', item.world));
    }

    const info = el('span', 'char-cell-info');
    info.append(text, el('span', 'char-cell-count', countLabel(item.char.entries.length)));

    btn.append(buildShot(item, 'char-shot'), info);
    btn.addEventListener('click', () => openChar(item));

    const li = el('li');
    li.append(btn);
    item.cell = li;
    return li;
  }

  function countLabel(count) {
    return count === 1 ? 'Ein Auftritt' : count + ' Auftritte';
  }

  /* Der Name für Beschriftungen, die keine zweite Zeile haben: Vorlesehilfe,
     Titel eines Knopfes, Alternativtext. Dort steht die Welt wieder in
     Klammern, sonst hießen zwei Figuren dasselbe. */
  function langerName(item) {
    return item.world ? `${item.real} (${item.world})` : item.real;
  }

  chars.forEach(buildCell);

  /* ---------- Suche, Filter, Sortierung ---------- */

  const SORTS = [
    {
      key: 'name',
      label: 'A bis Z',
      compare: (a, b) => a.headline.localeCompare(b.headline, 'de'),
    },
    {
      key: 'name-rueckwaerts',
      label: 'Z bis A',
      compare: (a, b) => b.headline.localeCompare(a.headline, 'de'),
    },
    {
      key: 'auftritte',
      label: 'Meiste Auftritte',
      compare: (a, b) => b.char.entries.length - a.char.entries.length
        || a.headline.localeCompare(b.headline, 'de'),
    },
    {
      key: 'chronologie',
      label: 'Erster Auftritt',
      compare: (a, b) => a.order - b.order,
    },
  ];

  let query = '';
  /* Leer heißt „alles“: Solange niemand etwas angehakt hat, lässt der
     Filter jede Figur durch. Mehrere Phasen und mehrere Titel dürfen
     nebeneinander leuchten, gelesen werden sie als Oder – wer Phase 1 und
     Phase 2 anhakt, sieht die Figuren aus beiden. */
  const activePhases = new Set();
  const activeMovies = new Set();
  const activeWorlds = new Set();
  let activeSort = SORTS[0];

  /* Zu jedem Wert sein Schalter. Aus diesen Verzeichnissen färbt
     syncFilterChips() nach jedem Klick die ganze Reihe neu, statt dass
     jeder Schalter seinen eigenen Zustand mit sich herumträgt. */
  const phaseChipOf = new Map();
  const movieChipOf = new Map();
  const worldChipOf = new Map();
  const sortChipOf = new Map();
  let allPhasesChip = null;
  let allMoviesChip = null;
  let allWorldsChip = null;

  /* Die Phase zu einem Titel, für das Aufräumen abgewählter Phasen. */
  const phaseOfMovie = new Map(chronology.map(record => [record.movie, record.phase]));

  /* Der Grundbaustein aller drei Reihen: eckige Schaltfläche, die ihren
     Zustand als Klasse und für Vorleseprogramme als aria-pressed trägt. */
  function buildChip(box, label, onPick) {
    const chip = el('button', 'chip', label);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', () => {
      onPick();
      render();
    });
    box.append(chip);
    return chip;
  }

  function setChipState(chip, on) {
    chip.classList.toggle('active', on);
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  /* Die Sortierung bleibt eine Wahl unter vieren: Zwei Reihenfolgen
     zugleich gibt es nicht. Deshalb steht in der Zeile auch nur die
     gewählte, und ein Klick darauf klappt die übrigen auf. */
  for (const sort of SORTS) {
    sortChipOf.set(sort, buildChip(sortChips, sort.label, () => {
      activeSort = sort;
      for (const [item, chip] of sortChipOf) setChipState(chip, item === activeSort);
      sortText.textContent = sort.label;
      /* Gewählt ist gewählt: Die Tafel hat ihre Aufgabe erfüllt und macht
         das Raster wieder frei. */
      openSort(false);
      sortButton.focus();
    }));
  }
  setChipState(sortChipOf.get(activeSort), true);
  sortText.textContent = activeSort.label;

  /* Phasen und Titel sammeln sich dagegen an: Jeder Klick schaltet nur
     seinen eigenen Schalter um. „Alle Phasen“ und „Alle Filme“ sind die
     Rücknahme dazu, sie räumen ihre Reihe und leuchten, solange aus ihr
     nichts gewählt ist.

     Die Phase wählt dabei nur aus, sie färbt nichts. Diese Seite hat eine
     einzige Farbe, das Rot von marvel.com, und das steht fest im
     Stylesheet (siehe --accent unter html.chars-page). Früher trug jede
     Phase ihren eigenen Akzent bis in die Nebel der Galaxie hinein, auf
     weißem Grund gibt es weder die Galaxie noch einen Platz für sechs
     wechselnde Farben. */
  allPhasesChip = buildChip(phaseChips, 'Alle Phasen', () => {
    activePhases.clear();
    activeMovies.clear();
    buildMovieChips();
    syncFilterChips();
  });
  for (const phase of PHASES) {
    phaseChipOf.set(phase, buildChip(phaseChips, 'Phase ' + phase.num, () => {
      if (!activePhases.delete(phase)) activePhases.add(phase);
      dropVanishedMovies();
      buildMovieChips();
      syncFilterChips();
    }));
  }

  /* Die Welten. Anders als die Titel hängen sie an keiner Phase und
     werden deshalb einmal gebaut und nicht wieder angefasst: Aus welcher
     Wirklichkeit eine Figur stammt, ändert sich nicht dadurch, dass
     jemand Phase 4 anhakt.

     In der Reihe steht nur, wo auch jemand steht. CHAR_WORLDS gibt die
     Reihenfolge vor, die Datensätze geben die Auswahl: Kommt eine neue
     Variante aus einer neuen Welt dazu, steht ihre Welt von selbst hier,
     und eine Welt, aus der niemand mehr auftritt, verschwindet ebenso von
     selbst. */
  const usedWorlds = new Set(chars.map(item => item.worldKey));
  allWorldsChip = buildChip(worldChips, 'Alle Welten', () => {
    activeWorlds.clear();
    syncFilterChips();
  });
  /* Die Rücknahme steht auf ihrer eigenen Zeile, wie „Alle Phasen“ und
     „Alle Filme“ darüber und darunter. Zwischen den Welten stünde sie als
     eine Wahl unter vielen da und wäre keine mehr. */
  allWorldsChip.classList.add('chip--all');
  for (const world of CHAR_WORLDS) {
    if (!usedWorlds.has(world)) continue;
    worldChipOf.set(world, buildChip(worldChips, world, () => {
      if (!activeWorlds.delete(world)) activeWorlds.add(world);
      syncFilterChips();
    }));
  }

  /* Die Titel der gewählten Phasen, in Handlungsreihenfolge. Sie werden
     neu gebaut, sobald sich die Phasenwahl ändert: Ein Titel aus einer
     anderen Phase und die Phasen selbst schlössen sich sonst gegenseitig
     aus und das Raster bliebe leer. Ohne Phase stehen hier alle 56. */
  function buildMovieChips() {
    movieChips.replaceChildren();
    movieChipOf.clear();
    allMoviesChip = buildChip(movieChips, 'Alle Filme', () => {
      activeMovies.clear();
      syncFilterChips();
    });
    for (const record of chronology) {
      if (activePhases.size && !activePhases.has(record.phase)) continue;
      movieChipOf.set(record.movie, buildChip(movieChips, record.movie.title, () => {
        if (!activeMovies.delete(record.movie)) activeMovies.add(record.movie);
        syncFilterChips();
      }));
    }
  }

  /* Ein angehakter Titel, dessen Phase gerade abgewählt wurde, steht
     gleich nicht mehr in der Liste. Er bliebe sonst unsichtbar im Filter
     hängen und das Raster ließe sich an den Schaltern nicht mehr
     erklären. */
  function dropVanishedMovies() {
    if (!activePhases.size) return;
    for (const movie of activeMovies) {
      if (!activePhases.has(phaseOfMovie.get(movie))) activeMovies.delete(movie);
    }
  }

  /* Zugeklappt ist von der Wahl nichts mehr zu sehen. Der Schalter nimmt
     deshalb die Akzentfarbe an, solange irgendetwas gefiltert wird. */
  function syncFilterChips() {
    setChipState(allPhasesChip, activePhases.size === 0);
    for (const [phase, chip] of phaseChipOf) setChipState(chip, activePhases.has(phase));
    setChipState(allMoviesChip, activeMovies.size === 0);
    for (const [movie, chip] of movieChipOf) setChipState(chip, activeMovies.has(movie));
    setChipState(allWorldsChip, activeWorlds.size === 0);
    for (const [world, chip] of worldChipOf) setChipState(chip, activeWorlds.has(world));
    filterButton.classList.toggle('filtered',
      Boolean(activePhases.size || activeMovies.size || activeWorlds.size));
  }

  /* ---------- Der Filterschalter ----------

     Die Phasen liegen wie auf der Vorlage hinter einem Schalter am rechten
     Ende der Suchzeile und stehen erst da, wenn er sie aufklappt. */
  /* Die Tafel hängt am Schalter und reicht mit ihrer vollen Höhe unter den
     Fensterrand, sobald die Seite weit oben steht. Wo der Platz knapp ist
     und trotzdem reicht, bekommt sie ihn als Deckel: Die Titelliste gibt
     dann so weit nach, dass die ganze Tafel im Bild steht.

     Zwei Maße entscheiden das, und beide kennt nur der Browser, weil sie
     an der Zahl der Phasen und der Schriftgröße hängen: die volle Höhe und
     der Rumpf, also alles außer der Titelliste samt deren Mindesthöhe aus
     dem Stylesheet. Unter den Rumpf darf der Deckel nicht, sonst
     verschwände hinter dem overflow der Tafel etwas, an das niemand mehr
     herankommt. Reicht der Platz nicht einmal für den Rumpf, bleibt die
     Tafel ungedeckelt: Gescrollt werden muss dann ohnehin, und mit fünf
     Titeln statt fünfzehn wäre niemandem geholfen. */
  function fitFilterPanel() {
    filterPanel.style.removeProperty('--filter-room');
    const voll = filterPanel.getBoundingClientRect().height;
    const liste = movieChips.getBoundingClientRect().height;
    const rumpf = voll - liste + parseFloat(getComputedStyle(movieChips).minHeight);
    const platz = window.innerHeight - filterButton.getBoundingClientRect().bottom - 24;
    if (platz >= rumpf && platz < voll) {
      filterPanel.style.setProperty('--filter-room', Math.floor(platz) + 'px');
    }
  }

  function openFilter(open) {
    filterPanel.hidden = !open;
    filterButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    /* Erst sichtbar, dann messen: Zugeklappt steht die Tafel auf
       display:none und misst sich als nichts. */
    if (open) {
      fitFilterPanel();
      /* Zwei offene Tafeln übereinander wären eine zu viel. */
      openSort(false);
    }
  }

  function openSort(open) {
    sortPanel.hidden = !open;
    sortButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) openFilter(false);
  }

  filterButton.addEventListener('click', () => {
    openFilter(filterPanel.hidden);
  });

  sortButton.addEventListener('click', () => {
    openSort(sortPanel.hidden);
  });

  /* Aufgeklappt wandert die Tafel beim Blättern mit dem Schalter durchs
     Bild, ihr Platz nach unten ändert sich dabei laufend. */
  window.addEventListener('scroll', () => {
    if (!filterPanel.hidden) fitFilterPanel();
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!filterPanel.hidden) fitFilterPanel();
  });

  /* Ein Klick daneben klappt wieder zu, wie bei jedem Aufklappmenü. Der
     Schalter selbst ist ausgenommen, sonst schlösse sein eigener Klick
     die Wahl im selben Moment wieder, in dem er sie öffnet. */
  document.addEventListener('click', e => {
    if (!filterPanel.hidden
        && !filterPanel.contains(e.target) && !filterButton.contains(e.target)) {
      openFilter(false);
    }
    if (!sortPanel.hidden
        && !sortPanel.contains(e.target) && !sortButton.contains(e.target)) {
      openSort(false);
    }
  });

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
    if (activePhases.size
        && !item.phases.some(phase => activePhases.has(phase))) return false;
    if (activeMovies.size
        && !item.char.entries.some(record => activeMovies.has(record.movie))) return false;
    /* Eine Figur steht in genau einer Welt, mehrere angehakte Welten
       lesen sich deshalb als Oder: Erde-838 und Erde-617 zusammen zeigen
       die Figuren aus beiden. */
    if (activeWorlds.size && !activeWorlds.has(item.worldKey)) return false;
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
     dem ganzen Bildschirm, gebaut wie eine Charakterseite auf marvel.com:
     oben die dunkle Bühne mit der Zeichnung der Figur und ihren Namen,
     darunter auf Weiß die Reiter, hinter denen die Übersicht und die
     Biografie liegen.

     Die Auftritte führen zurück auf die Timeline:
     index.html#titel=<Titel> schlägt den Eintrag dort direkt auf (siehe
     openFromHash() in js/main.js). */

  const charFull = el('div', 'char-full');
  charFull.setAttribute('role', 'dialog');
  charFull.setAttribute('aria-modal', 'true');
  /* Beide Namen zusammen benennen die Fläche, die große Zeile allein
     ließe „Mister Fantastic“ ohne Reed Richards stehen. Fehlt der
     bürgerliche Name, trägt die leere Zeile nichts bei. */
  charFull.setAttribute('aria-labelledby', 'char-real char-title');
  charFull.setAttribute('aria-hidden', 'true');
  /* Lenis würde das Mausrad abfangen und die Seite dahinter scrollen –
     im Vollbild soll stattdessen es selbst nativ scrollen. */
  charFull.setAttribute('data-lenis-prevent', '');

  /* Der Grund der Ansicht ist eine weiße Fläche, mehr braucht es nicht.
     Früher lag hier das weit aufgezogene, weichgezeichnete Porträt der
     Figur mit einem Schleier darüber – auf dunklem Grund gab das die Farbe
     und Stimmung der Figur. Unter weißem Text und weißen Tafeln wäre es
     nur ein Fleck. Das Porträt steht weiterhin scharf auf der Bühne oben,
     dort, wo marvel.com es auch zeigt. */
  const charBg = el('div', 'char-full-bg');
  charBg.setAttribute('aria-hidden', 'true');

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

  /* ---------- Kopf: die Bühne der Figur ----------

     Nachgebaut nach den Charakterseiten auf marvel.com (etwa
     marvel.com/characters/aneka). Dort steht die Figur nicht in einer
     Karte, sondern auf einer Bühne über die volle Breite: Die Zeichnung
     läuft rechts über den Rand hinaus, links steht der bürgerliche Name
     klein über dem großen Heldennamen, und die Fläche endet unten in
     einer flachen Schräge, die nach rechts ansteigt. Auf ihrer Kante
     sitzt eine Reihe eckiger Reiter, von denen der offene oben einen
     roten Balken trägt.

     Übernommen ist inzwischen auch die Farbe: Wo marvel.com sein Rot
     setzt, steht hier dasselbe Rot. Die Schräge entsteht im Stylesheet aus
     zwei ineinanderliegenden Formen, siehe .char-hero. */
  const charHeroArt = el('div', 'char-hero-art');

  const charHeroReal = el('span', 'char-hero-real');
  charHeroReal.id = 'char-real';
  const charTitle = el('h2', 'char-hero-name');
  charTitle.id = 'char-title';
  /* Die Welt gehört zum Namen und steht deshalb im selben Block, aber
     unter dem großen Namen: Erst wer die Figur ist, dann woher sie kommt. */
  const charHeroWorld = el('span', 'char-hero-world');

  /* Die Kurzbeschreibung unter dem Namen, wie auf der Vorlage der Satz
     unter „AAMIR KHAN“. Sie kommt aus BIOS (js/data.js), derselben
     Kurzfassung, die auch die Timeline über einer Figur zeigt. */
  const charLead = el('p', 'char-hero-lead');

  const charCast = el('p', 'char-full-cast');
  const charCastLabel = el('span');
  const charCastNames = el('span');
  charCast.append(charCastLabel, charCastNames);

  /* Zwei Hälften, damit der Name immer auf der Mittellinie der Bühne
     sitzt: Über ihr stehen die Namen und wachsen nach oben, unter ihr
     folgen Beschreibung und Besetzung und wachsen nach unten. Ein Block
     am Stück würde bei jeder Figur anders liegen, je nachdem, wie lang
     ihre Beschreibung ist. */
  const charHeroNames = el('div', 'char-hero-names');
  charHeroNames.append(charHeroReal, charTitle, charHeroWorld);

  const charHeroRest = el('div', 'char-hero-rest');
  charHeroRest.append(charLead, charCast);

  const charHeroText = el('div', 'char-hero-text');
  charHeroText.append(charHeroNames, charHeroRest);

  const charTabBar = el('div', 'char-tabs');
  charTabBar.setAttribute('role', 'tablist');
  charTabBar.setAttribute('aria-label', 'Abschnitte zur Figur');

  const charHero = el('header', 'char-hero');
  const charHeroBg = el('div', 'char-hero-bg');
  charHeroBg.setAttribute('aria-hidden', 'true');
  charHero.append(charHeroBg, charHeroArt, charHeroText, charTabBar);

  /* ---------- Die Tafel Übersicht ----------

     Sie beginnt mit dem Profil über die volle Breite und trägt
     darunter die Auftritte und ganz unten die Connections. Was früher
     zwei Reiter waren, ist damit einer: Wer eine Figur aufschlägt, sieht
     sie zuerst, liest darunter, wo sie mitspielt, und trifft am Ende
     die, die sie kennt.

     Alle Teile werden beim Öffnen gefüllt, weil buildFigure(),
     buildPowers(), buildData() und buildConnections() an der Figur
     hängen.

     ---------- Das Profil und seine Leiste ----------

     Über der Bühne läuft eine Leiste in Marvel-Rot, nachgebaut nach der
     Heldenansicht aus Marvel Rivals: links der Name der Tafel, rechts
     daneben die Wahl zwischen drei Ansichten derselben Figur. Sie steht
     im selben Kasten wie die Bühne und nicht über ihm, damit der Wechsel
     die Fläche darunter austauscht, ohne dass etwas springt.

       Aussehen      die Bühne mit der Fassungswahl, wie gehabt
       Fähigkeiten   jede Kraft einzeln, mit Beschreibung
       Daten         Herkunft, Spezies, Zugehörigkeit, Auftritte

     Die Leiste ist die dritte Reiterreihe der Ansicht und hält sich
     deshalb bewusst von den beiden anderen fern: Die Reiter der Bühne
     oben stehen hell auf der Schräge, die Sprungleiste der Biografie ist
     eine Liste von Marken. Diese hier ist rot und trägt ihren Namen
     mit. */
  const charStageSlot = el('div', 'char-stage-slot');
  const charPowersSlot = el('div', 'char-powers-slot');
  const charDataSlot = el('div', 'char-data-slot');

  const charModeTabs = el('div', 'char-modebar-tabs');
  charModeTabs.setAttribute('role', 'tablist');
  charModeTabs.setAttribute('aria-label', 'Ansicht des Profils');

  const charModeBar = el('div', 'char-modebar');
  charModeBar.append(el('span', 'char-modebar-brand', 'Profil'), charModeTabs);

  /* Rechts an der Leiste die Schalter für die Varianten der gezeigten
     Fassung, siehe drawVariants() weiter unten. Sie stehen in derselben
     Zeile und nicht darüber oder darunter: Die Leiste hört schräg auf,
     und die Schalter setzen genau diese Kante fort. */
  const charModeVariants = el('div', 'char-modebar-variants');
  charModeVariants.setAttribute('role', 'group');
  charModeVariants.setAttribute('aria-label', 'Varianten der Fassung');
  charModeVariants.hidden = true;

  /* Leiste und Schalter liegen zusammen in einer Zeile. Sie und nicht
     die Leiste selbst hängt über der Tafel: Die Leiste ist so breit wie
     ihr Inhalt, und die Schalter sollen dahinter weitergehen, ohne dass
     jemand ihre Breite ausrechnen muss. */
  const charModeRow = el('div', 'char-modebar-row');
  charModeRow.append(charModeBar, charModeVariants);

  const charModeBody = el('div', 'char-modebar-body');
  charModeBody.append(charStageSlot, charPowersSlot, charDataSlot);

  const charStageBox = el('section', 'char-full-profile');
  charStageBox.append(charModeRow, charModeBody);

  const charCount = el('p', 'char-part-head');
  const charFilms = el('ul', 'char-full-films');
  const charFilmsBox = el('div', 'char-full-filmsbox');
  charFilmsBox.append(charCount, charFilms);

  const charConnSlot = el('div', 'char-conn-slot');

  const charOverview = el('div', 'char-full-overview');
  charOverview.append(charStageBox, charFilmsBox, charConnSlot);

  /* Die ausführliche Biografie aus PROFILES (js/profiles.js): benannte
     Abschnitte in Handlungsreihenfolge. Fehlt der Eintrag, fällt der
     Reiter weg, statt auf eine leere Tafel zu führen. */
  const charLife = el('div', 'char-full-life-sections');
  /* Eine Figur mit vielen Auftritten bringt es auf über ein Dutzend
     Abschnitte. Die Sprungleiste zeigt deshalb vorweg, was kommt, und
     führt direkt hin, statt durch alles hindurchscrollen zu lassen. */
  const charLifeNav = el('div', 'char-life-nav');
  charLifeNav.setAttribute('aria-label', 'Abschnitte der Biografie');
  const charLifeBox = el('div', 'char-full-life');
  charLifeBox.append(charLifeNav, charLife);

  const charBody = el('div', 'char-full-body');
  charBody.append(charOverview, charLifeBox);

  const charInner = el('div', 'char-full-inner');
  charInner.append(charHero, charBody);
  charFull.append(charBg, charActions, charInner);
  document.body.append(charFull);

  /* ---------- Reiter und Tafeln ----------

     Was früher untereinander stand, liegt jetzt hinter den Reitern der
     Bühne: Zu jedem gehört genau eine Tafel, und nur die offene steht im
     Bild. Ohne sie liefe die Seite bei einer Figur wie Tony Stark über
     sechzehn Fassungen, hundert Begegnungen und vierzehn Abschnitte
     Biografie am Stück durch.

     has() sagt, ob eine Figur den Abschnitt überhaupt füllt. Die
     Übersicht hat jede, die Biografie nicht. */
  const TABS = [
    { key: 'uebersicht', label: 'Übersicht', panel: charOverview, has: () => true },
    { key: 'biografie', label: 'Biografie', panel: charLifeBox, has: profileOf },
  ];

  for (const tab of TABS) {
    tab.button = el('button', 'char-tab', tab.label);
    tab.button.type = 'button';
    tab.button.id = 'char-tab-' + tab.key;
    tab.button.setAttribute('role', 'tab');
    tab.button.setAttribute('aria-controls', 'char-panel-' + tab.key);
    tab.button.addEventListener('click', () => setTab(tab.key, true));
    charTabBar.append(tab.button);

    tab.panel.id = 'char-panel-' + tab.key;
    tab.panel.setAttribute('role', 'tabpanel');
    tab.panel.setAttribute('aria-labelledby', tab.button.id);
  }

  /* Der zuletzt gewählte Reiter, nicht der gerade offene: Beim Blättern
     zur nächsten Figur bleibt die Wahl stehen, wer Biografien vergleicht,
     will nicht jedes Mal neu umschalten. Hat die nächste Figur den
     Abschnitt nicht, öffnet der erste, den sie hat, ohne dass der Wunsch
     dabei verloren geht. */
  let wantTab = TABS[0].key;

  function setTab(key, byUser) {
    if (byUser) wantTab = key;
    for (const tab of TABS) {
      const open = tab.key === key && !tab.button.hidden;
      tab.button.classList.toggle('active', open);
      tab.button.setAttribute('aria-selected', open ? 'true' : 'false');
      tab.panel.hidden = !open;
    }
  }

  /* Die Reihe auf eine Figur einstellen: Reiter ohne Inhalt verschwinden,
     danach öffnet der gewünschte oder der erste vorhandene. */
  function fitTabs(item) {
    let first = null;
    for (const tab of TABS) {
      const has = Boolean(tab.has(item));
      tab.button.hidden = !has;
      if (has && !first) first = tab.key;
    }
    const wanted = TABS.find(tab => tab.key === wantTab && !tab.button.hidden);
    setTab(wanted ? wanted.key : first, false);
  }

  /* ---------- Die drei Ansichten des Profils ----------

     Dieselbe Mechanik wie bei den Reitern der Bühne, eine Ebene tiefer:
     Zu jedem Eintrag der roten Leiste gehört genau eine Tafel, und nur
     die offene steht im Bild. Auch die Wahl hält sich über das Blättern
     hinweg – wer die Daten zweier Figuren vergleicht, will nicht jedes
     Mal neu umschalten.

     Eine Figur ohne Kräfte und eine ohne jede Angabe gibt es kaum, aber
     beides kommt vor: Der Eintrag fällt dann weg, statt auf eine leere
     Tafel zu führen. */
  const MODES = [
    { key: 'aussehen', label: 'Aussehen', panel: charStageSlot, has: () => true },
    { key: 'faehigkeiten', label: 'Fähigkeiten', panel: charPowersSlot,
      has: item => powersOf(item).length },
    { key: 'daten', label: 'Daten', panel: charDataSlot,
      has: item => dataRows(item).length },
  ];

  for (const mode of MODES) {
    mode.button = el('button', 'char-modebar-tab', mode.label);
    mode.button.type = 'button';
    mode.button.id = 'char-mode-' + mode.key;
    mode.button.setAttribute('role', 'tab');
    mode.button.setAttribute('aria-controls', 'char-modepanel-' + mode.key);
    mode.button.addEventListener('click', () => setMode(mode.key, true));
    charModeTabs.append(mode.button);

    mode.panel.id = 'char-modepanel-' + mode.key;
    mode.panel.setAttribute('role', 'tabpanel');
    mode.panel.setAttribute('aria-labelledby', mode.button.id);
  }

  let wantMode = MODES[0].key;
  let modeNow = MODES[0].key;

  function setMode(key, byUser) {
    if (byUser) wantMode = key;
    modeNow = key;
    for (const mode of MODES) {
      const open = mode.key === key && !mode.button.hidden;
      mode.button.classList.toggle('active', open);
      mode.button.setAttribute('aria-selected', open ? 'true' : 'false');
      mode.panel.hidden = !open;
    }
    /* Die Rollleiste der Fassungswahl misst sich beim Bauen. Stand die
       Bühne dabei hinter einer anderen Tafel, hatte sie keine Höhe und
       die Leiste keinen Anhalt. Sobald sie ins Bild kommt, wird deshalb
       nachgemessen. */
    if (key === 'aussehen' && railFit) requestAnimationFrame(railFit);
    /* Die Schalter gehören zur Bühne und nicht zur Leiste: Hinter der
       Tafel der Fähigkeiten oder der Daten steht keine Fassung, zu der
       sie umschalten könnten. */
    drawVariants();
  }

  /* ---------- Die Schalter für die Varianten ----------

     Von mancher Fassung gibt es mehr als ein brauchbares Bild
     (FULLSIZE_VARIANTS in js/chars.js): dieselbe Rüstung in einer
     anderen Haltung, von der anderen Seite, mit und ohne Helm. Als
     zweite Tafel in der Fassungswahl stünden sie falsch, dort meinte
     jede von ihnen dasselbe Ding. Sie stehen deshalb als Reihe kleiner
     Schalter am rechten Ende der Profilleiste, wo die Leiste ohnehin
     schräg aufhört und der Platz frei ist.

     Gefüllt wird die Reihe von der Bühne, die gerade im Kasten steht.
     Hat die gezeigte Fassung nur ihr eines Bild, oder steht eine andere
     Tafel als die Bühne offen, bleibt sie weg. */
  let variantCount = 1;    // wie viele Bilder die gezeigte Fassung hat
  let variantAt = 1;       // welches davon im Bild steht
  let variantPick = null;  // was ein Klick auf einen Schalter auslöst

  function drawVariants() {
    const show = variantCount > 1 && modeNow === 'aussehen';
    charModeVariants.hidden = !show;
    if (!show) {
      charModeVariants.replaceChildren();
      return;
    }
    const switches = [];
    for (let nr = 1; nr <= variantCount; nr += 1) {
      const knopf = el('button', 'char-variant');
      knopf.type = 'button';
      /* Die Zahl steckt in einer eigenen Hülle: Die Tafel folgt der
         Neigung der Leiste, ihre Zahl wird darin gegengeneigt. */
      knopf.append(el('span', null, String(nr)));
      knopf.setAttribute('aria-label',
        'Variante ' + nr + ' von ' + variantCount);
      const open = nr === variantAt;
      knopf.classList.toggle('active', open);
      knopf.setAttribute('aria-pressed', open ? 'true' : 'false');
      const pick = nr;
      knopf.addEventListener('click', () => {
        if (variantPick) variantPick(pick);
      });
      switches.push(knopf);
    }
    charModeVariants.replaceChildren(...switches);
  }

  /* Die Bühne meldet hier, welche Fassung sie zeigt und wie viele Bilder
     diese mitbringt. Ohne Bühne im Kasten ist beides nichts. */
  function setVariants(count, at, pick) {
    variantCount = count;
    variantAt = at;
    variantPick = pick;
    drawVariants();
  }

  /* Die Leiste auf eine Figur einstellen: Einträge ohne Inhalt
     verschwinden, danach öffnet der gewünschte oder der erste
     vorhandene. */
  function fitModes(item) {
    let first = null;
    for (const mode of MODES) {
      const has = Boolean(mode.has(item));
      mode.button.hidden = !has;
      if (has && !first) first = mode.key;
    }
    const wanted = MODES.find(mode => mode.key === wantMode && !mode.button.hidden);
    setMode(wanted ? wanted.key : first, false);
  }

  /* PROFILES lädt nur die Charakterseite, deshalb der Blick auf die
     Existenz der Liste statt allein auf den Eintrag. */
  function profileOf(item) {
    return typeof PROFILES === 'undefined' ? null : PROFILES[item.char.slug];
  }

  let charOpen = false;
  let charOpener = null;   // Kachel, von der aus geöffnet wurde
  let charItem = null;     // Figur, die gerade im Vollbild steht
  let charList = [];       // Reihenfolge, durch die die Pfeile blättern

  /* Das Ganzkörperbild (assets/characters/fullsize/<slug>.webp,
     freigestellt mit transparentem Hintergrund). Es steht in der Mitte
     der Erscheinungsbühne. Fehlt die Datei, bleibt der Platz als
     Platzhalter stehen: Silhouette und Anfangsbuchstaben, wie beim
     Porträtersatz.

     Figuren mit Einträgen in FULLSIZE_LOOKS (js/chars.js) bekommen links
     die Fassungswahl: Rüstungen, Verwandlungen und neue Anzüge im Lauf
     des Universums. */
  function lookSrc(file) {
    return 'assets/characters/fullsize/' + file + '.webp';
  }

  /* Aus dem Kürzel eines Films wird sein Eintrag: Die Bühne schreibt
     rechts Titel und Jahr der Fassung, die gerade im Bild steht. */
  const movieBySlug = new Map(chronology.map(record => [record.movie.slug, record.movie]));

  /* Das Erscheinungsjahr aus dem Datum („5. Mai 2023“). */
  function filmYear(movie) {
    const found = /(\d{4})/.exec(movie.date || '');
    return found ? found[1] : '';
  }

  /* Die Fassung, die zuerst im Bild steht: der erste Eintrag in
     FULLSIZE_LOOKS, egal wie seine Datei heißt. Figuren ohne Eintrag
     haben nur ihr eines Bild, das wie ihr Schlüssel heißt.

     Herauskommt der Stamm und nicht die Datei: Eine Fassung mit
     Varianten liegt unter mehreren Namen, und welcher davon gilt,
     entscheidet erst die Wahl an der Profilleiste. */
  function standardLook(item) {
    const looks = FULLSIZE_LOOKS[item.char.slug];
    return looks && looks.length ? looks[0][1] : item.char.slug;
  }

  /* Dasselbe als Datei: die erste Variante der Standardfassung. Sie
     steht überall dort, wo die Figur nur als Kulisse gebraucht wird und
     niemand zwischen ihren Bildern wählen kann. */
  function standardFile(item) {
    return lookVariantFile(standardLook(item), 1);
  }

  /* Aus welchem Film das eine Ganzkörperbild einer Figur ohne Eintrag in
     FULLSIZE_LOOKS stammt.

     Wer nur in einem Titel vorkommt, braucht dafür keine Pflege: Dann
     kann das Bild aus keinem anderen stammen. Gezählt werden dabei die
     Titel und nicht die Auftritte – die beiden Staffeln von Loki sind
     zwei Auftritte, aber ein Titel und damit genauso eindeutig.

     Alle übrigen stehen von Hand in FULLSIZE_STANDARD (js/chars.js). */
  function standardFilm(item) {
    const gepflegt = typeof FULLSIZE_STANDARD === 'undefined'
      ? null : FULLSIZE_STANDARD[item.char.slug];
    if (gepflegt) return gepflegt;
    const titel = new Set(item.char.entries.map(record => record.movie.slug));
    return titel.size === 1 ? item.char.entries[0].movie.slug : '';
  }

  /* Die Fassungswahl einer Figur, immer als Liste – auch bei einer, die
     nur ihr eines Bild hat. Beschriftet ist es mit dem Namen, unter dem
     die Figur groß dasteht. */
  function looksOf(item) {
    return FULLSIZE_LOOKS[item.char.slug]
      || [[item.headline, item.char.slug, standardFilm(item)]];
  }

  /* Das Raster wird nur so weit aufgefüllt, wie es der Form nützt.

     Unter vier Fassungen wächst es auf vier Felder. Sonst stünde die
     Wahl als Stummel da und die zweite Zeile fehlte ganz.

     Ab vier Fassungen bleibt jede gerade Zahl, wie sie ist: Zwei
     Spalten gehen darin ohne Rest auf. Eine ungerade Zahl bekommt ihr
     eines leeres Feld dazu, damit rechts unten keine Lücke offen
     bleibt. Sieben Fassungen ergeben also acht Felder, fünf ergeben
     sechs, und sechs bleiben sechs.

     Auf schmalen Fenstern stehen vier Tafeln nebeneinander (siehe
     .char-rail-grid im Stil). Dort füllt eine gerade Zahl die letzte
     Zeile nicht immer aus. Das nimmt die Regel in Kauf, denn drei
     leere Tafeln im breiten Bild fallen weit stärker auf. */
  const RAIL_STEP = 4;

  function railCells(count) {
    if (count < RAIL_STEP) return RAIL_STEP;
    return count + (count % 2);
  }

  /* ---------- Das Bild auf der Bühne ----------

     Rechts im Kopf steht das Porträt der Figur (assets/characters/
     portraits), weit über seine 240 bis 480 Pixel hinaus aufgezogen und
     unten von der Schräge angeschnitten, wie auf der Vorlage. Dass es
     dabei weich wird, ist gewollt: Der Kopf soll die Bühne füllen, und
     ein scharfes Bild dieser Größe gibt es zu keiner Figur.

     Das Ganzkörperbild bleibt der Erscheinungsbühne in der Übersicht
     vorbehalten, wo es groß steht und seine Fassungen durchgeschaltet
     werden können.

     Gebaut wird es bei jedem Öffnen neu, weil buildShot() den Ersatz aus
     Anfangsbuchstaben selbst regelt. */
  function fillHeroArt(item) {
    charHeroArt.replaceChildren(buildShot(item, 'char-hero-shot'));
  }

  /* Schon geladene und dekodierte Fassungen. Was hier steht, kann ohne
     Warten eingeblendet werden. */
  const lookReady = new Set();

  /* Und die Gegenprobe: Dateien, die es nicht gibt. Eine Fassung, deren
     Bild noch fehlt, soll nicht bei jedem Klick neu angefragt werden,
     und ihr Platzhalter steht damit sofort statt nach einem Fehlversuch. */
  const lookGone = new Set();

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

  /* ---------- Die Angaben zu einer Figur ----------

     CHAR_FACTS (js/facts.js) kommt aus den beiden Wikis, CHAR_FACTS_EXTRA
     daneben ist Handarbeit und liegt Feld für Feld darüber: Was die Wikis
     nicht führen oder ungenau führen, wird dort überschrieben. Beide
     laden nur auf dieser Seite. */
  function factsOf(item) {
    return typeof CHAR_FACTS === 'undefined' ? {}
      : Object.assign({}, CHAR_FACTS[item.char.slug],
        typeof CHAR_FACTS_EXTRA === 'undefined' ? null : CHAR_FACTS_EXTRA[item.char.slug]);
  }

  /* ---------- Tafel Fähigkeiten ----------

     Jede Kraft einzeln, nachgebaut nach dem Band „Powers + Abilities“ auf
     den Charakterseiten von marvel.com: links die Nummer, darunter der
     Name der Fähigkeit groß und ihr Absatz, rechts die Figur hinter einer
     schrägen Kante. Unten läuft die Reihe, die zwischen ihnen umschaltet,
     der offene Eintrag trägt den roten Balken.

     Die einzige Quelle ist CHAR_POWERS (js/powers.js): pro Fähigkeit ihr
     Name und der Absatz dazu. Fehlt eine Figur dort, etwa weil sie neu in
     data.js steht, verschwindet der Eintrag „Fähigkeiten“ aus der Leiste,
     statt eine Tafel ohne Text zu zeigen. Erfunden wird nichts. */
  function powersOf(item) {
    if (typeof CHAR_POWERS === 'undefined') return [];
    return CHAR_POWERS[item.char.slug] || [];
  }

  function buildPowers(item) {
    const list = powersOf(item);
    if (!list.length) return null;

    const box = el('div', 'char-powers');

    /* Rechts die Figur hinter einer schrägen Kante, wie das angeschnittene
       Bild in der Vorlage. Sie ist Kulisse und trägt keine Aussage,
       deshalb die Standardfassung und kein Wechsel: Wer die Fassungen
       sehen will, ist einen Reiter weiter links richtig. */
    const art = el('div', 'char-powers-art');
    art.setAttribute('aria-hidden', 'true');
    const artImg = el('img');
    artImg.alt = '';
    artImg.loading = 'lazy';
    artImg.decoding = 'async';
    /* Fehlt die Datei, bleibt die schräge Fläche stehen und nur das Bild
       darin geht weg: Ohne sie wäre die Tafel ein schwarzes Rechteck. */
    artImg.addEventListener('error', () => { artImg.remove(); });
    artImg.src = lookSrc(standardFile(item));
    art.style.setProperty('--figure-scale', fullsizeScale(standardFile(item)));
    art.style.setProperty('--figure-lift', fullsizeLift(standardFile(item)));
    art.append(artImg);

    const now = el('span', 'char-powers-now');
    const all = el('span', 'char-powers-all', pad2(list.length));
    const count = el('p', 'char-powers-count');
    count.append(now, all);

    const kicker = el('p', 'char-powers-kicker', 'Kräfte + Fähigkeiten');
    const title = el('h4', 'char-powers-title');
    const text = el('p', 'char-powers-text');

    const head = el('div', 'char-powers-head');
    head.setAttribute('aria-live', 'polite');
    head.append(count, kicker, title, text);

    /* Die Reihe am Fuß: ein Feld je Fähigkeit, das offene mit dem roten
       Balken darüber. Sie steht auf der weißen Kante der Tafel, genau wie
       in der Vorlage, und rollt zur Seite, wenn eine Figur mehr Kräfte
       mitbringt, als nebeneinander passen. */
    const rail = el('div', 'char-powers-rail');
    rail.setAttribute('role', 'group');
    rail.setAttribute('aria-label', 'Fähigkeiten von ' + langerName(item));

    const chips = list.map(([label], at) => {
      const chip = el('button', 'char-powers-chip');
      /* Kein tablist: Die Felder schalten keine eigene Tafel um, sondern
         tauschen den Text daneben aus. Sie tragen deshalb aria-pressed wie
         die Tafeln der Fassungswahl, und der Kopf daneben meldet den
         Wechsel selbst (aria-live). */
      chip.type = 'button';
      chip.append(el('span', null, label));
      chip.addEventListener('click', () => show(at));
      rail.append(chip);
      return chip;
    });

    function show(at) {
      const label = list[at][0];
      const body = list[at][1];
      now.textContent = pad2(at + 1);
      title.textContent = label;
      text.textContent = body || '';
      text.hidden = !body;
      chips.forEach((chip, other) => {
        const open = other === at;
        chip.classList.toggle('active', open);
        chip.setAttribute('aria-pressed', open ? 'true' : 'false');
      });
      chips[at].scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }

    box.append(art, head, rail);
    show(0);
    return box;
  }

  /* „01“ statt „1“, wie die Nummer über der Vorlage. */
  function pad2(count) {
    return count < 10 ? '0' + count : String(count);
  }

  /* ---------- Tafel Daten ----------

     Was eine Figur ausmacht, ohne Erzählung: Herkunft, Spezies, Größe,
     Zugehörigkeit und Status aus den Wikis, dazu was diese Seite selbst
     über sie weiß. Wie oft sie vorkommt, wo sie anfängt, in welchen
     Phasen sie steht und wer sie spielt.

     Die Kräfte stehen hier nicht mehr, sie haben ihre eigene Tafel
     nebenan. */
  function dataRows(item) {
    const facts = factsOf(item);
    const first = item.char.entries[0];
    const rows = [];

    function add(label, value) {
      if (!value || (Array.isArray(value) && !value.length)) return;
      rows.push([label, Array.isArray(value) ? value.join(' · ') : value]);
    }

    add('Herkunft', facts.origin);
    add('Spezies', facts.species);
    add('Größe', facts.height);
    add('Status', facts.status);
    add('Zugehörigkeit', facts.teams);
    if (first) {
      const jahr = filmYear(first.movie);
      add('Erster Auftritt', first.movie.title + (jahr ? ' (' + jahr + ')' : ''));
    }
    add('Auftritte', countLabel(item.char.entries.length));
    add('Phasen', item.phases.map(phase => 'Phase ' + phase.num));
    add(CHAR_VOICE_ONLY.has(item.char.slug) ? 'Gesprochen von' : 'Gespielt von',
      item.castNames);
    return rows;
  }

  function buildData(item) {
    const rows = dataRows(item);
    if (!rows.length) return null;

    const box = el('div', 'char-data');
    box.setAttribute('aria-label', 'Daten zu ' + langerName(item));

    const kicker = el('p', 'char-data-kicker');
    kicker.innerHTML = STAGE_MARK;
    kicker.append(el('span', null, 'Daten zur Figur'));

    const list = el('dl', 'char-data-list');
    /* Jede Angabe ist freiwillig: Was zu einer Figur nicht bekannt ist,
       lässt die Tafel weg, statt eine Zeile mit Strich zu zeigen. Lange
       Werte bekommen die ganze Breite, sonst bräche
       „S.H.I.E.L.D. · Howling Commandos · SSR“ in eine Säule. */
    for (const row of rows) {
      const cell = el('div', 'char-data-cell');
      if (row[1].length > 38) cell.classList.add('wide');
      cell.append(
        el('dt', 'char-data-key', row[0]),
        el('dd', 'char-data-value', row[1])
      );
      list.append(cell);
    }

    /* Das Wappen füllt die Ecke, die neben den Feldern frei bleibt. Auf
       der Bühne steht es nicht mehr, hier trägt es die sonst leere
       weiße Fläche. */
    const emblem = el('div', 'char-data-emblem');
    emblem.setAttribute('aria-hidden', 'true');
    emblem.innerHTML = STAGE_EMBLEM;

    box.append(emblem, kicker, list);
    return box;
  }

  /* ---------- Connections ----------

     Am Fuß der Übersicht: wen die Figur kennt, als Reihe von Karten mit
     Gesicht, Heldenname und bürgerlichem Namen. Aufbau und Zuschnitt
     kommen von den Charakterseiten auf marvel.com, wo derselbe Abschnitt
     genauso steht.

     Aufgeführt werden nur die wichtigsten, nicht jeder, mit dem die Figur
     je eine Leinwand geteilt hat. Zwei Quellen liefern sie:

     CHAR_BONDS (js/facts.js) sind die benannten Beziehungen von Hand –
     Vater, Ehefrau, Erzfeind. Sie stehen vorn und tragen ihre
     Bezeichnung auf der Karte.

     CHAR_CONNECTIONS (js/connections.js) ist die Auswahl von marvel.com
     selbst, von dort geholt und auf unsere Schlüssel übersetzt. Sie füllt
     auf, was von Hand nicht gepflegt ist, und steht deshalb dahinter.

     Eine Figur, für die beides nichts hergibt, bekommt den Abschnitt
     nicht. Das ist ehrlicher als eine Reihe aus Zufallsbekanntschaften. */

  /* So viele Karten passen ohne Rollen ins Bild. Wer mehr mitbringt,
     rollt zur Seite; darüber hinaus wird abgeschnitten, weil eine
     Connection Nummer dreißig keine mehr ist. */
  const CONN_MAX = 20;

  /* Die Pfeilprüfung der gerade gebauten Reihe. Sie hängt an einem
     einzigen Haken am Fenster statt an je einem pro Figur: Sonst
     sammelten sich beim Blättern durch zweihundert Figuren zweihundert
     Zuhörer an, von denen nur der letzte noch etwas im Bild hat. */
  let connFit = null;
  window.addEventListener('resize', () => { if (connFit) connFit(); });

  function connectionsOf(item) {
    const seen = new Set([item.char.slug]);
    const list = [];

    function add(slug, role) {
      if (seen.has(slug)) return;
      const target = bySlug.get(slug);
      /* Einen Schlüssel, den es nicht gibt, überspringen: In js/facts.js
         steht auch, wer noch keinen eigenen Auftritt hat. */
      if (!target) return;
      seen.add(slug);
      list.push({ item: target, role });
    }

    const bonds = typeof CHAR_BONDS === 'undefined' ? null : CHAR_BONDS[item.char.slug];
    for (const [role, slug] of bonds || []) add(slug, role);

    const more = typeof CHAR_CONNECTIONS === 'undefined'
      ? null : CHAR_CONNECTIONS[item.char.slug];
    for (const slug of more || []) add(slug, '');

    return list.slice(0, CONN_MAX);
  }

  function buildConnections(item) {
    const found = connectionsOf(item);
    if (!found.length) return null;

    const box = el('section', 'char-connections');
    box.setAttribute('aria-labelledby', 'char-conn-head');
    const head = el('h3', 'char-part-head', 'Connections');
    head.id = 'char-conn-head';

    const list = el('ul', 'char-conn-list');
    for (const entry of found) {
      const other = entry.item;
      const link = el('a', 'char-conn');
      /* Derselbe Hash, den auch die Adressleiste beim Öffnen setzt. Ein
         gewöhnlicher Klick schaltet die offene Ansicht direkt um, Mittel-
         und Strg-Klick öffnen die Figur im neuen Tab, wo der Hash sie
         aufschlägt. */
      link.href = '#' + other.char.slug;
      link.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        jumpToChar(other);
      });

      const text = el('span', 'char-conn-text');
      text.append(el('span', 'char-conn-name', other.headline));
      if (entry.role) text.append(el('span', 'char-conn-role', entry.role));
      /* Die Welt steht dicht unter der Bezeichnung: Beide sagen, in
         welchem Verhältnis die beiden Figuren zueinander stehen. Der
         bürgerliche Name bleibt davon getrennt am Fuß der Karte. */
      if (other.world) {
        text.append(el('span', 'char-conn-world', other.world));
      }
      /* Nur bei Figuren mit Heldennamen, sonst stünde derselbe Name
         zweimal auf der Karte – so hält es die Vorlage auch. */
      if (other.roles.length) {
        text.append(el('span', 'char-conn-real', other.real));
      }

      link.append(buildShot(other, 'char-conn-shot'), text);
      const li = el('li');
      li.append(link);
      list.append(li);
    }

    /* Zwei Pfeile an den Kanten, wie auf der Vorlage. Sie stehen nur da,
       wenn die Reihe wirklich über ihre Breite hinausläuft, und je einer
       fällt am Anschlag weg. Gerollt wird um knapp eine Bildbreite, damit
       am Rand eine angeschnittene Karte stehen bleibt und zu sehen ist,
       dass es weitergeht. */
    const rail = el('div', 'char-conn-rail');
    const prev = el('button', 'char-conn-step prev');
    const next = el('button', 'char-conn-step next');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'Zurück');
    next.setAttribute('aria-label', 'Weiter');
    prev.append(el('span'));
    next.append(el('span'));

    function fitSteps() {
      const rest = list.scrollWidth - list.clientWidth;
      const at = list.scrollLeft;
      prev.hidden = rest <= 1 || at <= 1;
      next.hidden = rest <= 1 || at >= rest - 1;
    }

    function step(dir) {
      list.scrollBy({ left: dir * list.clientWidth * 0.8,
        behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    list.addEventListener('scroll', fitSteps);

    rail.append(prev, list, next);
    box.append(head, rail);
    /* Beim Bauen hängt die Reihe noch nicht im Dokument und hat deshalb
       keine Breite. Gemessen wird erst, wenn sie steht. */
    connFit = fitSteps;
    requestAnimationFrame(fitSteps);
    return box;
  }

  /* ---------- Die Erscheinungsbühne ----------

     Nachgebaut nach der Heldenansicht aus Marvel Rivals, nur auf Weiß
     statt auf dem dunklen Blau des Spiels: In der Mitte steht die Figur
     in voller Größe auf freier Fläche, links die Wahl der Fassung als
     Tafeln nebeneinander und rechts, aus welchem Film die gezeigte
     Fassung stammt. Oben rechts das Logo dieses Films, unten rechts der
     Knopf, der zu ihm führt.

     Gebaut wird die Bühne bei jedem Öffnen neu. Die Bilder bleiben dabei
     im Zwischenspeicher des Browsers, teuer ist daran nichts. */

  /* Das Wappen in der Ecke der Tafel Daten: ein Ring mit zwei Marken und
     darin ein gezackter Stern. Es steht sehr blass und ist reine Kulisse.
     Hinter der Figur auf der Bühne stand es früher auch, dort ist die
     Fläche jetzt frei. */
  const STAGE_EMBLEM = '<svg viewBox="0 0 400 400" aria-hidden="true">'
    + '<path class="burst" d="M200 30 236.4 112.2 320.2 79.8 287.8 163.6 370 200'
    + ' 287.8 236.4 320.2 320.2 236.4 287.8 200 370 163.6 287.8 79.8 320.2'
    + ' 112.2 236.4 30 200 112.2 163.6 79.8 79.8 163.6 112.2Z"/>'
    + '<circle class="ring" cx="200" cy="200" r="176"/>'
    + '<circle class="ring dash" cx="200" cy="200" r="158"/>'
    + '<circle class="node" cx="24" cy="200" r="7"/>'
    + '<circle class="node" cx="376" cy="200" r="7"/>'
    + '</svg>';

  /* Das Nachmessen der Rollleiste der gerade gebauten Fassungswahl. Sie
     hängt wie die Pfeile der Connections an einem einzigen Haken am
     Fenster statt an je einem pro Figur: Sonst sammelten sich beim
     Blättern durch zweihundert Figuren zweihundert Zuhörer an, von denen
     nur der letzte noch etwas im Bild hat. */
  let railFit = null;
  window.addEventListener('resize', () => { if (railFit) railFit(); });

  /* Die kleine Marke vor „Marvel Cinematic Universe“ über dem Titel: der
     Filmstreifen, den das Bild-Studio schon für die Auftritte einer Figur
     benutzt (LuFilm, siehe ZEICHEN['auftritte'] in
     tools/portrait-studio/ui-components/icons.js). */
  const STAGE_MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"'
    + ' stroke-width="2" aria-hidden="true">'
    + '<rect width="18" height="18" x="3" y="3" rx="2"/>'
    + '<path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/>'
    + '<path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/>'
    + '<path d="M17 16.5h4"/></svg>';

  function buildFigure(item) {
    railFit = null;
    setVariants(1, 1, null);
    const looks = looksOf(item);
    const standard = standardLook(item);
    /* Stamm zu Eintrag, damit aus der gezeigten Fassung ihr Name und ihr
       Film wird. */
    const lookOf = new Map(looks.map(entry => [entry[1], entry]));
    const chipOf = new Map();
    /* Welche Variante bei welcher Fassung zuletzt im Bild stand. Wer
       zwischen zwei Fassungen hin und her springt, findet jede so
       wieder, wie er sie verlassen hat, statt jedes Mal beim ersten
       Bild zu landen. */
    const variantOf = new Map();

    /* Die Datei zur Fassung: bei einer Fassung ohne Varianten ihr eigener
       Name, sonst die gewählte Variante. */
    function fileOf(look) {
      return lookVariantFile(look, variantOf.get(look) || 1);
    }

    /* Zieht die Tafel einer Fassung auf ihre gewählte Variante nach. Bei
       einer Fassung ohne Varianten ändert sich dabei nichts. */
    function setChipShot(look) {
      const chip = chipOf.get(look);
      const img = chip && chip.querySelector('.char-look-shot img');
      if (!img) return;
      const file = fileOf(look);
      if (img.dataset.file === file) return;
      img.dataset.file = file;
      img.src = lookSrc(file);
    }

    const figure = el('figure', 'char-stage');

    const frame = el('div', 'char-figure-frame');
    const stack = el('span', 'char-figure-stack');
    /* Der Ersatz für ein fehlendes Bild: Silhouette und
       Anfangsbuchstaben. Er steht von Anfang an im Rahmen und ist nur
       ausgeblendet, siehe showEmpty(). */
    frame.innerHTML = '<svg class="char-figure-blank" viewBox="0 0 24 48"'
      + ' aria-hidden="true">'
      + '<path d="M12 3a4.4 4.4 0 1 1 0 8.8A4.4 4.4 0 0 1 12 3Z'
      + 'M8.2 14h7.6c1.8 0 3.2 1.4 3.2 3.2V28h-2.6v17h-3.4V32.5h-2V45'
      + 'H7.6V28H5V17.2C5 15.4 6.4 14 8.2 14Z"></path></svg>';
    frame.append(el('span', 'char-initials char-figure-blank', initials(item.real)));
    frame.append(stack);

    /* Das Bild steht in einer eigenen Spalte zwischen der Fassungswahl
       und dem Film. Die Spalte bleibt auch dann stehen, wenn showEmpty()
       den Rahmen leer räumt. */
    const middle = el('div', 'char-stage-figure');
    middle.append(frame);

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
    let front = 0;       // Ebene, die gerade vorne liegt
    let shown = null;    // Datei darauf
    let shownLook = null;  // zu welcher Fassung sie gehört
    let ticket = 0;      // nur der jüngste Wechsel darf noch durchkommen
    let busyTimer = 0;
    /* Die Zahl über der Fassungswahl. Sie steht nur bei Figuren mit
       Fassungen, sonst bleibt der Haken leer. */
    let railNow = null;

    /* ---------- Rechts: aus welchem Film die Fassung stammt ---------- */

    const info = el('div', 'char-stage-info');

    const filmLogo = el('div', 'char-stage-logo');
    const filmLogoImg = el('img');
    filmLogoImg.alt = '';
    filmLogoImg.decoding = 'async';
    filmLogo.append(filmLogoImg);

    const kicker = el('p', 'char-stage-kicker');
    kicker.innerHTML = STAGE_MARK;
    kicker.append(el('span', null, 'Marvel Cinematic Universe'));

    const stageTitle = el('h3', 'char-stage-title');
    const stageKind = el('p', 'char-stage-kind');
    const stageLead = el('p', 'char-stage-lead');
    const stageNote = el('p', 'char-stage-note');

    const stageText = el('div', 'char-stage-text');
    stageText.append(kicker, stageTitle, stageKind, stageLead, stageNote);

    info.append(filmLogo, stageText);

    /* Stellt die rechte Spalte auf eine Fassung um.

       Ohne Eintrag in FULLSIZE_LOOKS ist über die Herkunft des Bildes
       nichts bekannt: Dann steht dort nur der Name der Figur, und Logo
       und Film bleiben weg, statt einen Film zu behaupten.

       Der erste Wert ist die Fassung, der zweite ihre gezeigte Datei.
       Alles hier hängt an der Fassung, nur der Absatz sieht auch beim
       Bild nach: Wer zu einer einzelnen Variante etwas zu sagen hat,
       schreibt es unter deren Namen in FULLSIZE_NOTES. */
    function setInfo(look, file) {
      const entry = lookOf.get(look);
      /* Erst im eigenen Auftrittsverzeichnis der Figur nachsehen, dann
         erst im Verzeichnis aller Titel: „Loki“ heißt beide Staffeln,
         und wer in beiden vorkommt, soll die sehen, in der er zuerst
         steht, statt immer die zweite. */
      const movie = entry && entry[2]
        ? (item.char.entries.find(record => record.movie.slug === entry[2]) || {}).movie
          || movieBySlug.get(entry[2])
        : null;

      stageTitle.textContent = entry ? entry[0] : item.headline;
      /* Unter dem Titel steht, wem die Fassung gehört, wie in der Vorlage
         unter dem Namen der Kleidung ihr Held steht. Genannt wird der
         bürgerliche Name und nicht der Heldenname, den es bei Sam Wilson
         gleich zweimal gäbe („Falcon · Captain America“).

         Die Zeile steht bei jeder Figur und bei jeder Fassung, auch wenn
         die Fassung darüber schon denselben Namen trägt. */
      stageKind.textContent = item.real;

      filmLogo.hidden = !movie;
      filmLogo.classList.remove('ready');
      if (movie) {
        /* Erst mit dem fertigen Bild einblenden: Sonst stünde beim
           Wechsel für einen Moment eine leere Fläche in der Ecke.

           Die Größe kommt aus der sichtbaren Fläche des Logos und nicht
           aus seinem Kasten, sonst stünde ein breiter Schriftzug wie
           „Captain America: The First Avenger“ klein neben einem
           kompakten wie „Loki“ (siehe js/logo-fit.js). */
        filmLogoImg.onload = () => {
          LogoFit.toHeight(filmLogoImg);
          filmLogo.classList.add('ready');
        };
        setFilmLogo(filmLogoImg, entry[2], () => { filmLogo.hidden = true; });
      }

      /* Der Absatz beschreibt die Fassung selbst und nicht den Film:
         woher der Anzug stammt, was er kann, in welchem Zustand die
         Figur hier steckt (FULLSIZE_NOTES in js/looks.js). Fehlt der
         Satz, springt die Zusammenfassung des Films ein, damit die
         Stelle nicht leer bleibt. */
      stageLead.textContent = lookNote(file) || lookNote(look)
        || (movie ? movie.summary || '' : '');
      stageLead.hidden = !stageLead.textContent;

      /* Die Zeile unter dem Strich. Ohne Film ist über die Herkunft des
         Bildes nichts bekannt, dann steht dort, wie oft die Figur
         überhaupt vorkommt – die eine Angabe, die auch ohne Fassungen
         feststeht. */
      stageNote.textContent = movie
        ? 'Erscheint in ' + movie.title + ' von Marvel Studios ('
          + filmYear(movie) + ')'
        : countLabel(item.char.entries.length) + ' in der Timeline';

      if (railNow) {
        const at = looks.findIndex(other => other[1] === look);
        railNow.textContent = at === -1 ? '–' : String(at + 1);
      }
    }

    /* ---------- Mitte: das Ganzkörperbild ---------- */

    /* Die Bühne hat ein festes Maß, das Bild schöpft es nur so weit aus,
       wie die Körpergröße der Figur es hergibt (FULLSIZE_SCALE in
       js/chars.js, dazu die Feinkorrektur der Datei aus FULLSIZE_FIT).
       Der Wert hängt an der Datei, nicht an der Figur, und zieht deshalb
       mit der Ebene um. */
    function paint(layer, file) {
      layer.firstElementChild.src = lookSrc(file);
      layer.style.setProperty('--figure-scale', fullsizeScale(file));
      /* Trägt die Datei unter der Figur leere Fläche, weil sie fliegt,
         rechnet der Rahmen sie darüber wieder groß (FULLSIZE_LIFT). */
      layer.style.setProperty('--figure-lift', fullsizeLift(file));
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
          ? 'Ganzkörperbild von ' + langerName(item) : '';
      });
    }

    /* Fehlt die Datei, tritt der Buchstabenersatz an ihre Stelle, statt
       ein kaputtes Bild stehen zu lassen. Das Maß hat die Bühne schon.

       Er liegt von Anfang an im Rahmen und wird nur ein- und
       ausgeblendet. Früher räumte er den Rahmen leer und damit auch die
       beiden Ebenen: Ein einziges fehlendes Bild beendete das
       Umschalten für die ganze Figur. Mit Varianten kommt das regelmäßig
       vor, denn eine neu angelegte Variante hat ihre Datei noch nicht. */
    function showEmpty() {
      clearTimeout(busyTimer);
      frame.classList.remove('busy');
      frame.classList.add('empty');
    }

    /* Ein Fassungswechsel wartet, bis die neue Datei fertig dekodiert ist,
       und blendet dann über. Würde stattdessen das src im sichtbaren Bild
       getauscht, stünde die alte Fassung erst noch im Maß der neuen da
       und sprang danach hart um.

       Gewechselt wird auf eine Fassung, nicht auf eine Datei. Welche
       ihrer Varianten dabei ins Bild kommt, sagt nr; ohne Angabe die,
       die bei dieser Fassung zuletzt stand. */
    function showLook(look, nr) {
      const count = lookVariants(look);
      const wish = nr || variantOf.get(look) || 1;
      const at = Math.min(Math.max(wish, 1), count);
      variantOf.set(look, at);
      const file = lookVariantFile(look, at);
      /* Schalter und Tafel gehören zur gewählten Fassung und stehen
         deshalb sofort richtig, auch wenn das Bild noch lädt. */
      setVariants(count, at, pick => showLook(look, pick));
      setChipShot(look);
      if (file === shown) return;
      const mine = ++ticket;
      const next = layers[1 - front];
      const swap = () => {
        if (mine !== ticket) return;
        clearTimeout(busyTimer);
        frame.classList.remove('busy', 'empty');
        paint(next, file);
        shown = file;
        shownLook = look;
        setFront(1 - front);
        setInfo(look, file);
      };
      /* Ohne Datei bleibt der Platzhalter stehen. Die rechte Spalte
         schreibt trotzdem, was gewählt ist: Die Fassung gibt es ja, nur
         ihr Bild fehlt noch. */
      const missing = () => {
        if (mine !== ticket) return;
        shown = file;
        shownLook = look;
        showEmpty();
        setInfo(look, file);
      };
      if (lookGone.has(file)) {
        missing();
        return;
      }
      if (lookReady.has(file)) {
        swap();
        return;
      }
      /* Beim ersten Mal kann das Laden dauern. Das Bild dimmt dann ab,
         damit der Klick nicht ins Leere geht. */
      busyTimer = setTimeout(() => {
        if (mine === ticket) frame.classList.add('busy');
      }, 140);
      loadLook(file).then(swap, () => {
        lookGone.add(file);
        missing();
      });
    }

    /* ---------- Links: die Fassungswahl ----------

       An der Stelle, an der die Vorlage ihre Kleidungsstücke zeigt: die
       Fassungen der Figur als Trapez aus Tafeln, zwei nebeneinander und
       zwei Zeilen im Bild. Jede zeigt ihre eigene Fassung als Ausschnitt,
       darunter das Logo des Films. Über der Wahl steht, die wievielte von
       wie vielen gerade im Bild ist.

       Sie steht bei jeder Figur, auch bei einer, die nur ihr eines Bild
       hat: Wer weniger als vier Fassungen mitbringt, füllt das Raster mit
       leeren Feldern auf, und wer eine ungerade Zahl mitbringt, bekommt
       ihr eines leeres Feld dazu (siehe railCells()). Wer über vier
       hinausgeht, bekommt rechts daneben die eigene schräge Rollleiste.

       Die Reihenfolge ist die aus FULLSIZE_LOOKS, und ihr erster Eintrag
       ist zugleich die Fassung, mit der die Bühne aufmacht. */
    {
      const rail = el('div', 'char-stage-rail');

      railNow = el('span', 'char-rail-now');
      const railCount = el('p', 'char-rail-count');
      railCount.append(railNow, el('span', 'char-rail-all', '/' + looks.length));

      const grid = el('div', 'char-rail-grid');
      grid.setAttribute('role', 'group');
      grid.setAttribute('aria-label', 'Fassungen von ' + langerName(item));

      for (const [label, look, film] of looks) {
        const movie = film ? movieBySlug.get(film) : null;
        const count = lookVariants(look);
        const chip = el('button', 'char-look');
        chip.type = 'button';
        chip.setAttribute('aria-label',
          (movie ? label + ' aus ' + movie.title : label)
          + (count > 1 ? ', ' + count + ' Varianten' : ''));

        /* Der Ausschnitt zeigt Kopf und Oberkörper: dieselbe Datei wie
           das große Bild, oben angeschlagen und seitlich beschnitten. Sie
           lädt damit schon für die Tafel, und der Wechsel geht später
           ohne Warten.

           Bei einer Fassung mit Varianten steht auf der Tafel die, die
           gerade groß daneben steht: Sonst zeigten Tafel und Bühne
           dasselbe Ding in zwei verschiedenen Aufnahmen. */
        const shot = el('span', 'char-look-shot');
        const shotImg = el('img');
        shotImg.alt = '';
        shotImg.loading = 'lazy';
        shotImg.decoding = 'async';
        /* Ein fehlendes Bild blendet nur ab, statt aus der Tafel
           genommen zu werden: Die nächste Variante kann es sehr wohl
           geben, und dann kommt das Bild zurück. */
        shotImg.addEventListener('error', () => {
          lookGone.add(shotImg.dataset.file);
          shot.classList.add('empty');
        });
        shotImg.addEventListener('load', () => {
          lookReady.add(shotImg.dataset.file);
          shot.classList.remove('empty');
        });
        shotImg.dataset.file = fileOf(look);
        shotImg.src = lookSrc(shotImg.dataset.file);
        shot.append(shotImg);

        /* Auf der Unterkante das Logo des Films, aus dem die Fassung
           stammt. Dieselben Dateien wie auf der Timeline und in der
           Auftrittsliste, in der dunklen Fassung für den weißen Grund
           (assets/logos/dark/<slug>.webp, siehe setFilmLogo). */
        const plate = el('span', 'char-look-plate');
        if (film) {
          const logoImg = el('img');
          logoImg.alt = '';
          logoImg.loading = 'lazy';
          logoImg.decoding = 'async';
          setFilmLogo(logoImg, film, () => logoImg.remove());
          plate.append(logoImg);
        }

        /* Der Name der Fassung steht nicht ständig auf der Tafel, sonst
           wäre von der Figur darunter nichts mehr zu sehen. Er blendet
           unter dem Zeiger ein und verdrängt dabei das Logo. Wer sich
           entschieden hat, liest ihn groß in der rechten Spalte. */
        /* Die Schrift steckt in einer eigenen Hülle: Der Balken folgt
           der Neigung der Tafel, sein Text wird darin gegengeneigt. */
        const cap = el('span', 'char-look-label');
        cap.append(el('span', null, label));
        chip.append(shot, plate, cap);

        const active = look === standard;
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (active) chip.classList.add('active');

        /* Wer die Maus auf eine Tafel legt, hat sich meist schon
           entschieden: Die Fassung lädt dann vor dem Klick und wechselt
           danach ohne Wartezeit. */
        chip.addEventListener('pointerenter', () => {
          loadLook(fileOf(look)).catch(() => {});
        });

        chip.addEventListener('click', () => {
          for (const other of chipOf.values()) {
            other.classList.remove('active');
            other.setAttribute('aria-pressed', 'false');
          }
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
          /* Bei vielen Fassungen läuft die Wahl über ihre Höhe hinaus.
             Eine Tafel, die nur halb im Bild stand, rückt nach dem Klick
             ganz herein. „nearest“ lässt alles in Ruhe, was ohnehin ganz
             zu sehen ist, und rührt die Seite darunter nicht an. */
          chip.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
          showLook(look);
        });

        chipOf.set(look, chip);
        grid.append(chip);
      }

      /* Leere Felder, so viele wie railCells() vorsieht. Sie nehmen
         keine Klicks an und versprechen nichts, sie halten nur die
         Form der Wahl. */
      for (let at = looks.length; at < railCells(looks.length); at++) {
        const blank = el('span', 'char-look char-look-blank');
        blank.setAttribute('aria-hidden', 'true');
        grid.append(blank);
      }

      /* Die eigene Rollleiste: ein schräges Gleis mit einem schrägen
         Griff darin, sonst nichts. Die des Browsers ist ausgeschaltet,
         sie stünde als gerader grauer Balken quer zur Neigung der Wahl.

         Gerechnet wird in geraden Pixeln, obwohl alles schief im Bild
         steht – skewX verschiebt nur die Waagerechte, die Höhen bleiben
         die des ungeneigten Kastens. */
      const thumb = el('div', 'char-rail-thumb');
      const track = el('div', 'char-rail-track');
      track.append(thumb);

      const bar = el('div', 'char-rail-bar');
      bar.append(track);

      /* Wie hoch der Griff mindestens bleibt. Bei sechzehn Fassungen wäre
         er sonst ein Strich von vier Pixeln und nicht mehr zu fassen. */
      const THUMB_MIN = 18;

      function fitBar() {
        const rest = grid.scrollHeight - grid.clientHeight;
        /* Ohne Überlauf gibt es nichts zu rollen: Die Leiste fällt ganz
           weg, statt als toter Balken danebenzustehen. */
        bar.hidden = rest <= 1;
        if (bar.hidden) return;
        const trackH = track.clientHeight;
        const höhe = Math.max(THUMB_MIN,
          trackH * grid.clientHeight / grid.scrollHeight);
        const oben = (trackH - höhe) * (grid.scrollTop / rest);
        thumb.style.height = höhe + 'px';
        thumb.style.top = oben + 'px';
      }

      grid.addEventListener('scroll', fitBar);

      /* Den Griff kann man auch ziehen. Gerechnet wird über die Strecke,
         die der Griff im Gleis zurücklegen kann: Sie verhält sich zum
         Rollweg wie der Weg des Zeigers zum Rest. */
      let greift = 0;      // Abstand vom Zeiger zur Oberkante des Griffs
      thumb.addEventListener('pointerdown', e => {
        e.preventDefault();
        greift = e.clientY - thumb.getBoundingClientRect().top;
        thumb.setPointerCapture(e.pointerId);
      });
      thumb.addEventListener('pointermove', e => {
        if (!thumb.hasPointerCapture(e.pointerId)) return;
        const rest = grid.scrollHeight - grid.clientHeight;
        const weg = track.clientHeight - thumb.offsetHeight;
        if (weg <= 0) return;
        const oben = e.clientY - track.getBoundingClientRect().top - greift;
        grid.scrollTop = Math.max(0, Math.min(rest, oben / weg * rest));
      });
      thumb.addEventListener('pointerup', e => {
        thumb.releasePointerCapture(e.pointerId);
      });

      /* Ein Klick ins leere Gleis springt eine Seite weit, wie bei einer
         gewöhnlichen Rollleiste. */
      track.addEventListener('pointerdown', e => {
        if (e.target === thumb) return;
        const oben = e.clientY < thumb.getBoundingClientRect().top;
        grid.scrollBy({ top: (oben ? -1 : 1) * grid.clientHeight,
          behavior: reduceMotion ? 'auto' : 'smooth' });
      });

      const body = el('div', 'char-rail-body');
      body.append(grid, bar);
      rail.append(railCount, body);
      figure.append(rail);

      /* Beim Bauen hängt die Wahl noch nicht im Dokument und hat deshalb
         keine Höhe. Gemessen wird erst, wenn sie steht. */
      railFit = fitBar;
      requestAnimationFrame(fitBar);
    }

    figure.append(middle, info);

    /* Die Standardfassung steht sofort und ohne Überblendung da, geladen
       wird sie wie jedes Bild der Seite erst, wenn sie in Sicht kommt.
       Gezeigt wird ihre erste Variante, weil bei einer frisch gebauten
       Bühne noch bei keiner Fassung eine gewählt sein kann. */
    const firstFile = lookVariantFile(standard, 1);
    const first = layers[0].firstElementChild;
    first.loading = 'lazy';
    first.addEventListener('error', () => {
      lookGone.add(firstFile);
      showEmpty();
    });
    first.addEventListener('load', () => lookReady.add(firstFile));
    paint(layers[0], firstFile);
    variantOf.set(standard, 1);
    shown = firstFile;
    shownLook = standard;
    setFront(0);
    setInfo(standard, firstFile);
    setVariants(lookVariants(standard), 1, pick => showLook(standard, pick));

    return figure;
  }

  function fillChar(item) {
    const char = item.char;
    /* Wie auf der Vorlage steht der bürgerliche Name klein über dem
       großen Heldennamen. Wer keinen zweiten Namen trägt, steht mit dem
       eigenen groß da und die Zeile darüber entfällt, so hält es
       marvel.com bei Aneka auch. */
    charHeroReal.textContent = item.roles.length ? item.real : '';
    charHeroReal.hidden = item.roles.length === 0;
    charTitle.textContent = item.roles.length ? item.roles.join(' · ') : item.real;
    charHeroWorld.textContent = item.world;
    charHeroWorld.hidden = !item.world;

    /* Wie oft die Figur auftritt und in welchen Phasen, steht hier nicht:
       Beides liest die Tafel der Auftritte gleich darunter genauer vor. */
    const lead = BIOS[char.slug];
    charLead.textContent = lead || '';
    charLead.hidden = !lead;

    charCastLabel.textContent = CHAR_VOICE_ONLY.has(char.slug)
      ? 'gesprochen von ' : 'gespielt von ';
    charCastNames.textContent = item.castNames;
    charCast.hidden = !item.castNames;

    fillHeroArt(item);

    /* Die drei Tafeln des Profils. Gebaut werden alle drei, im Bild
       steht nur die, die die Leiste gerade offen hat (siehe fitModes()
       am Ende): Ein Wechsel soll die Fläche austauschen und nicht auf den
       Aufbau warten lassen. */
    charStageSlot.replaceChildren(buildFigure(item));

    const powers = buildPowers(item);
    charPowersSlot.replaceChildren(...(powers ? [powers] : []));

    const data = buildData(item);
    charDataSlot.replaceChildren(...(data ? [data] : []));

    /* Wen die Figur kennt. Ohne eine einzige Connection fällt der ganze
       Abschnitt weg, samt Überschrift. */
    const conns = buildConnections(item);
    charConnSlot.replaceChildren(...(conns ? [conns] : []));
    charConnSlot.hidden = !conns;
    if (!conns) connFit = null;

    const life = profileOf(item);
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
      /* Links das Filmlogo, dieselben Dateien wie auf der Timeline
         (assets/logos/dark/<slug>.webp), rechts daneben Titel und Phase. Der
         Logokasten ist fest bemessen und bleibt auch stehen, wenn die
         Datei fehlt – so fangen die Titel in allen Kacheln bündig an. */
      const logo = el('span', 'char-film-logo');
      const logoImg = el('img');
      logoImg.alt = '';
      logoImg.loading = 'lazy';
      logoImg.decoding = 'async';
      setFilmLogo(logoImg, record.movie.slug, () => logoImg.remove());
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

    /* Zum Schluss die beiden Reihen, sie brauchen die gefüllten Tafeln. */
    fitModes(item);
    fitTabs(item);
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
    btn.setAttribute('aria-label', target ? word + ': ' + langerName(target) : word);
    btn.title = target ? langerName(target) : '';
  }

  /* Inhalt des Vollbilds auf eine Figur umstellen – beim Öffnen wie beim
     Blättern derselbe Weg.

     Beim Blättern bleibt der Blick stehen, wo er war: Wer die Fähigkeiten
     zweier Figuren vergleicht, will nach dem Pfeil wieder bei den
     Fähigkeiten stehen und nicht ganz oben. Der Browser kürzt den Wert
     selbst, wenn der neue Steckbrief kürzer ist als der alte. */
  function showChar(item, blickBehalten) {
    const blick = blickBehalten ? charInner.scrollTop : 0;
    charItem = item;
    fillChar(item);
    charInner.scrollTop = blick;
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
    showChar(target, true);
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

  /* Wie breit die Rollleiste der Seite ist.

     Die Vollansicht braucht den Wert, um sich über die Rinne zu legen, die
     das html rechts dauerhaft freihält. Ohne ihn stünden dort zwei Rinnen
     nebeneinander: die leere der Seite und daneben die eigene der Ansicht
     (siehe .char-full im Stylesheet). In CSS ist die Breite nicht zu
     bekommen, sie ergibt sich nur aus dem Unterschied zwischen Fenster und
     Inhaltsbreite.

     Gemessen wird kurz vor dem Öffnen und bei jeder Größenänderung, nicht
     ein einziges Mal beim Laden: Beim Laden ist das Raster noch leer, die
     Seite scrollt noch nicht und die Leiste ist null Pixel breit. Auf
     Systemen mit überlagerten Leisten (macOS, Touch) bleibt sie das auch,
     dann verschiebt der Wert nichts.

     Bei offener Ansicht wird nicht gemessen. Die Seite hat dann keine
     eigene Leiste mehr, die Rechnung ergäbe null, das Polster fiele weg
     und der Inhalt dahinter spränge genau um die Breite, die er behalten
     sollte. Der zuletzt gemessene Wert gilt weiter, bis die Figur wieder
     zu ist. */
  function measureScrollbar() {
    if (charOpen) return;
    const width = window.innerWidth - root.clientWidth;
    root.style.setProperty('--sb-width', Math.max(0, width) + 'px');
  }

  /* Notbremse für das Freigeben der Seite. Normalerweise meldet das Band
     selbst, wann es draußen ist (siehe transitionend weiter unten); bleibt
     die Meldung aus, weil die Bewegung unterwegs abgebrochen wurde, greift
     dieser Wert. Er liegt bewusst über der Dauer im Stylesheet. */
  const EXIT_MS = 420;
  let exitTimer = 0;

  /* Das Ende des Hinausfahrens.

     Solange .exiting steht, hält sich die Ansicht mit einem negativen
     rechten Rand auf ihrer vollen Breite, obwohl die Seite ihre Rinne
     schon zurückhat (siehe .char-full.exiting im Stylesheet). Danach
     braucht sie das nicht mehr und gibt die Klasse ab. */
  function endExit() {
    clearTimeout(exitTimer);
    exitTimer = 0;
    if (charOpen) return;   // inzwischen wurde wieder eine Figur geöffnet
    charFull.classList.remove('exiting');
  }

  /* Das Band meldet selbst, wann es draußen ist. Das ist genauer als eine
     Uhr, die Bewegung läuft auf einem langsamen Rechner länger. Beim
     Ankommen meldet es sich auch, dann steht charOpen und der Aufruf läuft
     ins Leere. */
  charHero.addEventListener('transitionend', e => {
    if (e.target === charHero && e.propertyName === 'transform') endExit();
  });

  function openChar(item) {
    /* Als Erstes, solange die Seite ihre Leiste noch hat: Gleich darauf
       trägt das html overflow: hidden und sie ist fort. */
    measureScrollbar();
    charOpen = true;
    showChar(item);
    /* Ein noch laufendes Hinausfahren abbrechen: Sonst hinge die gerade
       geöffnete Ansicht noch am negativen Rand des vorigen. */
    clearTimeout(exitTimer);
    exitTimer = 0;
    charFull.classList.remove('exiting');
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
    setHash('');
    const target = charOpener;
    charOpener = null;
    if (target && target.isConnected) target.focus({ preventScroll: true });

    /* Die Seite bekommt ihre Rollleiste sofort zurück, nicht erst am Ende
       der Bewegung. So sieht man sie schon während des Hinausfahrens an
       ihrem Platz stehen, statt eines leeren Gleises.

       Möglich wird das durch .exiting: Mit der Sperre kehrt die Rinne der
       Seite zurück und der Bezugsrahmen wird um ihre Breite schmaler. Die
       Ansicht würde damit mitten in der Bewegung schrumpfen und die Bänder
       um zehn Pixel versetzen. Der negative rechte Rand aus .exiting hält
       sie genau um diese Breite auf ihrem Maß, die Bänder bleiben stehen,
       wo sie sind. Was dabei unter die Rollleiste der Seite ragt, zeichnet
       der Browser ohnehin nicht: Dort steht ihre Leiste, und genau die
       soll man sehen. */
    charFull.classList.add('exiting');
    root.classList.remove('modal-open');
    if (lenis) lenis.start();

    clearTimeout(exitTimer);
    if (reduceMotion) endExit();
    else exitTimer = setTimeout(endExit, EXIT_MS);
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
    /* Die geschlossenen Tafeln stehen weiter im Dokument, ihre Links und
       Schalter sind aber nicht zu sehen. Ohne den Filter liefe der Fokus
       durch die Biografie einer Figur, von der gerade die Auftritte im
       Bild stehen, und wäre für den Rest der Runde verschwunden.
       offsetParent ist bei allem null, was display: none trägt. */
    const stops = Array.from(charFull.querySelectorAll('button:not([disabled]), a[href]'))
      .filter(node => node.offsetParent !== null);
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
    /* Escape klappt die offene Tafel wieder zu und gibt den Fokus zurück
       auf den Schalter, von dem aus sie geöffnet wurde. */
    if (e.key === 'Escape' && !filterPanel.hidden) {
      openFilter(false);
      filterButton.focus();
      return;
    }
    if (e.key === 'Escape' && !sortPanel.hidden) {
      openSort(false);
      sortButton.focus();
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

  buildMovieChips();
  syncFilterChips();
  render();
  measureScrollbar();
  window.addEventListener('resize', measureScrollbar);

  /* characters.html#<slug> öffnet die Figur direkt – so verlinkt die
     Adressleiste eine Figur, ohne dass jemand suchen muss. */
  const wanted = decodeURIComponent(location.hash.slice(1));
  if (wanted) {
    const item = chars.find(entry => entry.char.slug === wanted);
    if (item) openChar(item);
  }
})();
