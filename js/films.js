/* Baut die Übersicht aller Filme und Serien (films.html) aus PHASES
   (js/data.js) und FILM_CREDITS (js/credits.js) auf.

   Die Timeline zeigt die Titel als Logos an einer Zeitskala, also immer
   im Zusammenhang ihrer Phase. Hier stehen sie als Plakate in Reihen
   untereinander, jede mit einer Überschrift und zwei Pfeilen an den
   Kanten: eine Reihe mit Empfehlungen, eine in der Reihenfolge der
   Handlung, eine nach Kinostart, dazu die Serien, was noch bevorsteht,
   und zum Schluss Phase für Phase.

   Gebaut sind die Reihen wie das Band „Connections“ auf der
   Charakterseite (siehe buildConnections() in js/characters.js):
   Überschrift, eine Reihe, die zur Seite rollt statt umzubrechen, und
   rote Pfeile an ihren Kanten. Ein Titel darf dabei in mehreren Reihen
   stehen, das ist der Sinn der Sache. Jede Reihe bekommt dafür ihre
   eigenen Kacheln; die Bilder dahinter sind dieselben Dateien und liegen
   nach der ersten Reihe im Zwischenspeicher des Browsers.

   Ein Klick öffnet das Fenster zum Titel: links das Plakat, rechts die
   Angaben, Regie, Drehbuch, Produktion und Besetzung. Es ist der Aufbau
   einer Titelseite auf Disney+ und bewusst nicht der der Charakterseite –
   dort gehören die beiden hereinfahrenden Bänder zur zweigeteilten Bühne,
   hier ist es eine Fläche, die einfach aufblendet.

   Die Handlung im Einzelnen steht weiter nur auf der Timeline: Das Modal
   dort kennt die Key Moments, und zwei Fassungen davon liefen früher oder
   später auseinander. Der rote Knopf im Fenster führt deshalb dorthin
   (index.html#titel=<Titel>, siehe openFromHash() in js/main.js). */
(function () {
  'use strict';

  const rows = document.getElementById('film-rows');
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- Datum, Umfang, Besetzung ---------- */

  /* Die Datumsangaben in data.js stehen deutsch und abgekürzt
     („22. Juli 2011“, „8. Nov. 2013“). Für die Reihe nach Kinostart
     braucht es daraus eine Zahl, für das Fenster den ausgeschriebenen
     Monat. Erkannt wird er an seinen ersten drei Buchstaben, damit „Juni“
     und „Jun.“ dasselbe ergeben. */
  const MONTHS = ['jan', 'feb', 'mär', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dez'];
  const MONTHS_LONG = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  /* Tag, Monatsindex und Jahr eines Datums, oder null, wenn sich die
     Angabe nicht lesen lässt. Bei einem angekündigten Titel steht mitunter
     erst der Monat fest („März 2027“). Dann bleibt der Tag leer, und für
     die Reihenfolge zählt der Monatsanfang. */
  function parseDate(movie) {
    const match = /^(?:(\d{1,2})\.\s+)?(\S+)\s+(\d{4})$/.exec(movie.date || '');
    if (!match) return null;
    const month = MONTHS.indexOf(match[2].toLowerCase().slice(0, 3));
    if (month < 0) return null;
    return { day: match[1] ? Number(match[1]) : null, month, year: Number(match[3]) };
  }

  /* Ein Titel ohne lesbares Datum wandert ans Ende, statt die Reihenfolge
     durcheinanderzubringen. */
  function releaseTime(movie) {
    const date = parseDate(movie);
    return date ? Date.UTC(date.year, date.month, date.day || 1) : Number.MAX_SAFE_INTEGER;
  }

  function releaseYear(movie) {
    const date = parseDate(movie);
    return date ? String(date.year) : '';
  }

  function longDate(movie) {
    const date = parseDate(movie);
    if (!date) return movie.date || '';
    return (date.day ? date.day + '. ' : '') + MONTHS_LONG[date.month] + ' ' + date.year;
  }

  /* Umfang eines Titels, in derselben Schreibweise wie die Infobox der
     Timeline (siehe formatLength() in js/main.js): Filme zeigen ihre
     Laufzeit, Serien die Folgenzahl. Angekündigte Titel haben beides noch
     nicht. */
  function formatLength(movie) {
    if (movie.episodes) return movie.episodes + (movie.episodes === 1 ? ' Folge' : ' Folgen');
    if (!movie.runtime) return '';
    const h = Math.floor(movie.runtime / 60);
    const min = movie.runtime % 60;
    return (h ? h + ' Std. ' : '') + min + ' Min.';
  }

  /* Was in js/credits.js zu einem Titel steht, oder ein leeres Objekt.
     Der Schlüssel dort ist der Titel aus data.js, bei einer Serie also
     der mit dem Staffelzusatz. */
  function creditsOf(movie) {
    return (typeof FILM_CREDITS === 'undefined' ? null : FILM_CREDITS[movie.title]) || {};
  }

  /* Die Bewertung deutsch gesetzt: 8,4 und nicht 8.4, wie überall sonst
     auf der Seite auch. Eine Nachkommastelle, damit aus einer glatten 7
     kein „7“ neben lauter „6,9“ wird. */
  function formatRating(value) {
    if (typeof value !== 'number' || !isFinite(value)) return '';
    return value.toFixed(1).replace('.', ',');
  }

  /* Das Sternsymbol vor der Bewertung. Es kommt wie die Zeichen im
     Bild-Studio aus react-icons, aus dem Satz Lucide darin (LuStar), und
     steht hier als reine Pfaddaten – die Seite hat keinen Bauschritt.
     Anders als dort ist es gefüllt und nicht gestrichelt: Auf 0,7 rem
     wäre ein Strichstern nur noch ein Fleck. */
  function starIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'film-star');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 '
      + '1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 '
      + '1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 '
      + '0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 '
      + '9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z');
    svg.append(path);
    return svg;
  }

  /* Die Besetzung steht nicht in js/credits.js, sie ergibt sich: Jede
     Figur des Titels hat in ACTORS (js/data.js) ihre Darstellerin oder
     ihren Darsteller. Stehen dort mehrere, ist es eine Rolle, die über
     die Jahre mehrfach besetzt war; für die Besetzungsliste zählt die
     erste Nennung.

     Gekürzt wird bei CAST_MAX: Endgame führt über fünfzig Figuren, und
     eine Liste über sechs Zeilen liest ohnehin niemand mehr. Wer alle
     sehen will, findet sie auf der Charakterseite. */
  const CAST_MAX = 20;

  function castOf(movie) {
    const names = [];
    for (const name of movie.characters || []) {
      if (typeof CHAR_NO_PROFILE !== 'undefined' && CHAR_NO_PROFILE.has(name)) continue;
      const cast = ACTORS[charSlug(name)];
      const actor = Array.isArray(cast) ? cast[0] : cast;
      if (actor && !names.includes(actor)) names.push(actor);
    }
    if (names.length <= CAST_MAX) return names.join(', ');
    return names.slice(0, CAST_MAX).join(', ') + ' und weitere';
  }

  /* ---------- Datenbasis ----------

     Ein Eintrag je Zeile in data.js, in der Reihenfolge der Timeline:
     nach Phasen, innerhalb der Phase nach der Handlung. */
  const entries = buildChronology().map(record => ({
    movie: record.movie,
    phase: record.phase,
    series: Boolean(record.movie.series),
    release: releaseTime(record.movie),
  }));

  /* ---------- Staffeln stehen für sich ----------

     Loki und Daredevil stehen in data.js mit jeder Staffel als eigener
     Eintrag: Sie laufen über verschiedene Phasen, spielen zu
     verschiedenen Zeiten und gehören auf der Timeline deshalb an
     verschiedene Stellen. Im Katalog ist es genauso, jede Staffel bekommt
     ihre eigene Kachel. Anders ließe sich eine angekündigte Staffel gar
     nicht zeigen: Daredevil: Born Again läuft seit 2025, und „Bald zu
     sehen“ meint trotzdem allein Staffel 3.

     Auf der Kachel steht der Titel ohne den Staffelzusatz, und die
     Gattungszeile darunter sagt „Staffel 3“ statt „Serie“. Was die
     Staffeln eint, ist der Slug – er ist in data.js über alle derselbe.
     An ihm hängen Plakat, Logo und die Schalter im Fenster, mit denen
     sich von einer Staffel zur nächsten wechseln lässt. */

  const SEASON_SUFFIX = /\s+–\s+Staffel\s+\d+\s*$/;

  function baseTitle(movie) {
    return movie.title.replace(SEASON_SUFFIX, '');
  }

  function seasonLabel(entry) {
    const match = /Staffel\s+(\d+)\s*$/.exec(entry.movie.title);
    return match ? 'Staffel ' + match[1] : entry.movie.title;
  }

  /* Die Zeile am Fuß der Kachel: Erscheinungsjahr, Umfang, Bewertung und
     Altersfreigabe, durch Punkte getrennt. Die Phase stand hier früher
     vorn und ist herausgefallen – sie steht schon in der Überschrift der
     Phasenreihe, und auf der Timeline sagt sie ohnehin jede Kachel.

     Zurück kommen Stücke und keine Zeichenkette: Vor der Bewertung steht
     ein Stern und die Freigabe steht in einem Rahmen, das lässt sich
     nicht mehr zusammenfügen. Ein Stück ist entweder Text oder ein
     fertiger Knoten; buildMeta() setzt die Punkte dazwischen.

     Und es kommen zwei Zeilen zurück, nicht eine: Alle vier Angaben
     nebeneinander sind gut doppelt so breit wie eine Kachel. Ließe man
     sie umbrechen, stünde der trennende Punkt am Ende der ersten Zeile
     im Leeren. Getrennt wird deshalb an der Stelle, an der ohnehin
     gebrochen würde – oben, was der Titel ist, unten, wie er
     angekommen ist.

     Bei einem angekündigten Titel gibt es weder Umfang noch Bewertung,
     dafür sagt das „ab“ vor dem Datum, dass er noch bevorsteht. Die
     zweite Zeile fällt dann weg. */
  function entryMeta(entry) {
    const movie = entry.movie;
    if (movie.upcoming) return movie.date ? [['ab ' + movie.date]] : [];

    const oben = [];
    const year = releaseYear(movie);
    if (year) oben.push(year);
    const length = formatLength(movie);
    if (length) oben.push(length);

    const unten = [];
    /* Eine Serie hat auf IMDb eine Bewertung für alle Staffeln zusammen,
       jede Staffel in credits.js trägt deshalb dieselbe Zahl. */
    const credits = creditsOf(movie);
    const rating = formatRating(credits.imdb);
    if (rating) {
      const box = el('span', 'film-rating');
      box.append(starIcon(), el('span', null, rating));
      box.title = 'Bewertung auf IMDb';
      unten.push(box);
    }
    if (credits.fsk !== undefined && credits.fsk !== null) {
      unten.push(el('span', 'film-fsk', 'FSK ' + credits.fsk));
    }

    return [oben, unten].filter(line => line.length);
  }

  /* Aus den Stücken die Zeilen, dazwischen je ein Punkt. Geklont wird,
     weil derselbe Titel in mehreren Reihen steht und ein Knoten immer nur
     an einer Stelle im Dokument hängen kann. */
  function buildMeta(entry) {
    const box = el('span', 'film-cell-meta');
    for (const parts of entry.meta) {
      const line = el('span', 'film-meta-line');
      parts.forEach((part, index) => {
        if (index) line.append(el('span', 'film-meta-dot', '·'));
        line.append(typeof part === 'string'
          ? document.createTextNode(part) : part.cloneNode(true));
      });
      box.append(line);
    }
    return box;
  }

  const groups = [];
  const groupOf = new Map();
  for (const entry of entries) {
    let group = groupOf.get(entry.movie.slug);
    if (!group) {
      group = {
        slug: entry.movie.slug,
        title: baseTitle(entry.movie),
        series: entry.series,
        entries: [],
      };
      groupOf.set(group.slug, group);
      groups.push(group);
    }
    group.entries.push(entry);
    /* Der Eintrag kennt seine Gruppe: Aus der Kachel einer Phasenreihe
       heraus soll das Fenster gleich bei der Staffel aufschlagen, die in
       dieser Phase läuft. */
    entry.group = group;
  }

  /* Was erst feststeht, wenn alle Staffeln einer Serie beisammen sind. */
  for (const group of groups) {
    group.movie = group.entries[0].movie;
    group.release = group.entries[0].release;
  }

  /* Und was zur einzelnen Kachel gehört. Die Gattungszeile sagt bei einer
     Serie mit mehreren Staffeln, welche hier steht; sonst bleibt es bei
     „Serie“ oder „Film“. */
  for (const entry of entries) {
    entry.title = baseTitle(entry.movie);
    entry.tag = entry.group.entries.length > 1
      ? seasonLabel(entry)
      : (entry.series ? 'Serie' : 'Film');
    entry.meta = entryMeta(entry);
  }

  /* ---------- Welche Reihe was zeigt ----------

     Eine Reihe zeigt Kacheln, und eine Kachel ist eine Gruppe. Weil eine
     Serie in mehreren Phasen läuft, merkt sich jede Kachel zusätzlich den
     Eintrag, wegen dem sie in dieser Reihe steht: In der Reihe „Phase
     Five“ schlägt Loki dann bei Staffel 2 auf. */

  function pick(entry) {
    return { group: entry.group, entry };
  }

  /* Jeder Eintrag eine Kachel. In der chronologischen Reihe steht Loki
     deshalb zweimal: Staffel 1 zwischen den Titeln der Phase Four,
     Staffel 2 zwischen denen der Phase Five. */
  function picksOf(list) {
    return list.map(pick);
  }

  /* Die Empfehlungen sind von Hand gewählt, wie auf Disney+ auch: In
     data.js steht keine Wertung, aus der sich eine Empfehlung rechnen
     ließe. Wer die Reihe anders bestücken will, ändert diese Liste – ein
     Slug, den es nicht gibt, wird beim Bauen übersprungen. */
  const FEATURED = [
    'avengers-endgame',
    'avengers-infinity-war',
    'the-avengers',
    'iron-man',
    'black-panther',
    'guardians-of-the-galaxy',
    'captain-america-the-winter-soldier',
    'thor-ragnarok',
    'spider-man-no-way-home',
    'loki',
    'wandavision',
    'deadpool-and-wolverine',
    'the-fantastic-four-first-steps',
  ];

  function pickSlugs(slugs) {
    const picks = [];
    for (const slug of slugs) {
      const group = groupOf.get(slug);
      if (group) picks.push(pick(group.entries[0]));
    }
    return picks;
  }

  /* Jede Reihe bringt ihre Überschrift, eine Zeile zur Erklärung und ihre
     Kacheln mit. Leere Reihen baut buildRow() gar nicht erst. */
  function buildRowPlan() {
    const plan = [
      /* Ganz oben, was noch aussteht: Wer die Seite aufschlägt, kennt das
         Erschienene meist schon. */
      {
        title: 'Bald zu sehen',
        lead: 'Angekündigt, aber noch nicht erschienen.',
        items: picksOf(entries.filter(entry => entry.movie.upcoming)
          .sort((a, b) => a.release - b.release)),
      },
      {
        title: 'Empfohlen',
        lead: 'Die Titel, mit denen sich das Universum am besten anfangen lässt.',
        items: pickSlugs(FEATURED),
      },
      {
        title: 'In chronologischer Reihenfolge',
        lead: 'Alle Titel in der Reihenfolge ihrer Handlung, so wie sie auch auf der Timeline stehen.',
        items: picksOf(entries),
      },
      {
        title: 'Nach Kinostart',
        lead: 'Dieselben Titel in der Reihenfolge, in der sie erschienen sind.',
        items: picksOf(entries.slice().sort((a, b) => a.release - b.release)),
      },
      {
        title: 'Alle Serien',
        lead: 'Was als Staffel läuft statt im Kino, Folge für Folge.',
        items: picksOf(entries.filter(entry => entry.series)),
      },
    ];

    /* Eine Reihe je Phase, in der Reihenfolge der Handlung. Sie kommen
       aus PHASES und nicht aus einer Liste hier, damit eine neue Phase in
       data.js von selbst ihre eigene Reihe bekommt. */
    for (const phase of PHASES) {
      plan.push({
        title: phase.title,
        lead: phase.saga + ' · ' + phase.years,
        items: picksOf(entries.filter(entry => entry.phase === phase)),
      });
    }

    return plan;
  }

  /* ---------- Plakate ---------- */

  /* Das Plakat eines Titels in ein vorbereitetes Fenster setzen, und wenn
     es keines gibt, der Notnagel darunter.

     Die Cover liegen als assets/covers/<slug>.webp und kommen aus
     tools/covers/import-covers.py. Zu einigen Titeln gibt es noch keines.
     Statt eines leeren grauen Kastens steht dort dann das Filmlogo auf
     dunklem Grund: Das erkennt man genauso gut, und die Datei liegt für
     jeden Titel ohnehin schon da (assets/logos/). Fehlt auch die, bleibt
     der Titel als Schrift.

     Die helle Fassung des Logos, nicht die dunkle: Der Ersatzgrund ist
     dunkel wie die Timeline, für die diese Dateien gezeichnet sind. Die
     dunkle Fassung nimmt nur die Charakterseite, die auf Weiß steht.

     fit sagt, was mit einem Ersatzlogo geschehen soll: In den Kacheln
     bringt LogoFit alle auf dieselbe sichtbare Fläche, im Fenster steht
     nur eines und darf seinen Platz einfach ausfüllen. */

  /* Die Fläche, auf die LogoFit die Ersatzlogos in den Kacheln bringt,
     gemessen in Anteilen der Kachelbreite zum Quadrat. Der Vorgabewert
     dort ist für die Logokästen der Timeline gedacht, die breiter als
     hoch sind; eine Kachel hier steht hochkant, und dieselbe Fläche wirkt
     darin verloren. Nach oben begrenzt das max-width im Stylesheet, damit
     ein sehr breiter Schriftzug nicht an die Kanten stößt. */
  const LOGO_AREA = 0.3;
  function fillCover(box, slug, title, fit) {
    box.classList.remove('empty');
    box.replaceChildren();

    const img = el('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      img.remove();
      fillCoverFallback(box, slug, title, fit);
    }, { once: true });
    img.src = 'assets/covers/' + slug + '.webp';
    box.append(img);
  }

  function fillCoverFallback(box, slug, title, fit) {
    box.classList.add('empty');
    const logo = el('img', fit ? 'film-cover-logo' : null);
    logo.alt = '';
    logo.loading = 'lazy';
    logo.decoding = 'async';
    if (fit) {
      /* Alle Ersatzlogos stehen mit derselben sichtbaren Fläche da,
         gemessen an der Breite ihres Kastens – dieselbe Rechnung wie auf
         der Timeline, damit ein breiter Schriftzug wie „Spider-Man: Far
         From Home“ neben einem kompakten wie „VisionQuest“ nicht kleiner
         wirkt (siehe js/logo-fit.js). Gerechnet wird erst mit dem
         fertigen Bild: Vorher kennt niemand seine Maße. */
      logo.addEventListener('load', () => {
        if (window.LogoFit) LogoFit.toWidth(logo, LOGO_AREA);
        logo.classList.add('ready');
      }, { once: true });
    }
    logo.addEventListener('error', () => {
      logo.remove();
      box.append(el('span', 'film-cover-title', title));
    }, { once: true });
    logo.src = 'assets/logos/' + slug + '.webp';
    box.append(logo);
  }

  /* ---------- Kacheln ---------- */

  /* Eine Kachel je Titel, gebaut wie die Karten der Charakterseite: oben
     das Bild, darunter ein dunkler Block, dessen roter Balken beim Zeigen
     von oben nach unten vollläuft. */
  function buildCell(item) {
    const entry = item.entry;
    const btn = el('button', 'film-cell');
    btn.type = 'button';

    const text = el('span', 'film-cell-text');
    text.append(el('span', 'film-cell-name', entry.title));
    /* Der Handlungszeitraum, nicht das Startdatum: Er ist der Grund,
       warum dieser Titel auf der Timeline dort steht, wo er steht. Das
       Startdatum steht klein in der Zeile darunter. Bei einer Serie ist
       es der Zeitraum dieser einen Staffel. */
    if (entry.movie.period) {
      text.append(el('span', 'film-cell-period', entry.movie.period));
    }
    /* Film, Serie oder die Staffel, gesetzt wie die Welt auf den
       Charakterkacheln: eine Gattung und kein Titelbestandteil. */
    text.append(el('span', 'film-cell-tag', entry.tag));

    const info = el('span', 'film-cell-info');
    info.append(text, buildMeta(entry));

    const cover = el('span', 'film-cover');
    fillCover(cover, entry.movie.slug, entry.title, true);

    btn.append(cover, info);
    btn.addEventListener('click', () => openFilm(item.group, entry, btn));

    const li = el('li');
    li.append(btn);
    return li;
  }

  /* ---------- Eine Reihe ----------

     Die Pfeile stehen nur da, wenn die Reihe wirklich über ihre Breite
     hinausläuft, und je einer fällt am Anschlag weg. Gerollt wird um
     knapp eine Bildbreite, damit am Rand eine angeschnittene Kachel
     stehen bleibt und zu sehen ist, dass es weitergeht. */
  function buildRow(plan, index) {
    if (!plan.items.length) return null;

    const box = el('section', 'film-row');
    const headId = 'film-row-' + index;
    box.setAttribute('aria-labelledby', headId);

    const head = el('div', 'film-row-head');
    const title = el('h2', 'film-row-title', plan.title);
    title.id = headId;
    head.append(title);
    /* Wie viele Titel in der Reihe stehen. Bei einer Reihe, die zur Seite
       rollt, ist das die einzige Auskunft darüber, wie weit sie reicht. */
    head.append(el('span', 'film-row-count',
      plan.items.length === 1 ? 'Ein Titel' : plan.items.length + ' Titel'));
    if (plan.lead) head.append(el('p', 'film-row-lead', plan.lead));

    const list = el('ul', 'film-row-list');
    for (const item of plan.items) list.append(buildCell(item));

    const rail = el('div', 'film-row-rail');
    const prev = el('button', 'film-row-step prev');
    const next = el('button', 'film-row-step next');
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
    list.addEventListener('scroll', fitSteps, { passive: true });
    /* Ein anderes Fenster heißt eine andere Kachelbreite und damit eine
       andere Antwort auf die Frage, ob überhaupt etwas zu rollen ist. */
    window.addEventListener('resize', fitSteps);

    rail.append(prev, list, next);
    box.append(head, rail);
    /* Beim Bauen hängt die Reihe noch nicht im Dokument und hat deshalb
       keine Breite. Gemessen wird erst, wenn sie steht. */
    requestAnimationFrame(fitSteps);
    return box;
  }

  /* ---------- Das Fenster zu einem Titel ----------

     Einmal gebaut, bei jedem Öffnen neu gefüllt. Aufbau wie eine
     Titelseite auf Disney+: links das Plakat, rechts der Titel, die
     Angaben dazu, die Kurzfassung der Handlung und darunter Stab und
     Besetzung. Was in js/credits.js zu einem Titel fehlt, lässt das
     Fenster weg, statt eine leere Zeile stehen zu lassen.

     Das Plakat ist so hoch, wie das Fenster es zulässt, und die rechte
     Spalte genauso: Der Text soll ganz dastehen, ohne dass jemand in ihm
     rollen muss. Wie die Höhe zustande kommt, steht bei .film-view im
     Stylesheet. */

  const view = el('div', 'film-view');
  view.setAttribute('role', 'dialog');
  view.setAttribute('aria-modal', 'true');
  view.setAttribute('aria-labelledby', 'film-view-title');
  view.setAttribute('aria-hidden', 'true');
  /* Lenis würde das Mausrad abfangen und die Seite dahinter scrollen –
     im Fenster soll stattdessen es selbst nativ scrollen. */
  view.setAttribute('data-lenis-prevent', '');

  const viewVeil = el('div', 'film-view-veil');
  viewVeil.setAttribute('aria-hidden', 'true');

  const viewPanel = el('div', 'film-view-panel');

  const viewClose = el('button', 'film-view-close');
  viewClose.type = 'button';
  viewClose.setAttribute('aria-label', 'Fenster schließen');
  viewClose.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="2" stroke-linecap="round" aria-hidden="true">'
    + '<path d="M18 6 6 18M6 6l12 12"></path></svg>';

  const viewPoster = el('div', 'film-view-poster');
  const viewSide = el('div', 'film-view-side');
  const viewBody = el('div', 'film-view-body');

  const viewTitle = el('h2', 'film-view-title');
  viewTitle.id = 'film-view-title';
  const viewSeasons = el('div', 'film-view-seasons');
  viewSeasons.setAttribute('role', 'group');
  viewSeasons.setAttribute('aria-label', 'Staffel wählen');
  const viewFacts = el('div', 'film-view-facts');
  const viewLead = el('p', 'film-view-lead');
  const viewBlocks = el('div', 'film-view-blocks');
  viewBody.append(viewTitle, viewSeasons, viewFacts, viewLead, viewBlocks);
  viewSide.append(viewBody);
  viewPanel.append(viewClose, viewPoster, viewSide);
  view.append(viewVeil, viewPanel);
  document.body.append(view);

  /* Eine Zeile der Art „Laufzeit: 2 Std. 14 Min.“. Ohne Wert entsteht
     nichts. */
  function addFact(label, value) {
    if (!value) return;
    const line = el('p', 'film-view-fact');
    /* Der Doppelpunkt gehört zur Bezeichnung, der Abstand dahinter kommt
       aus dem gap der Zeile (siehe .film-view-fact im Stylesheet). */
    line.append(el('b', null, label + ':'), document.createTextNode(String(value)));
    viewFacts.append(line);
  }

  /* Ein Abschnitt der Art „Regie / Ryan Coogler“. Auch hier gilt: kein
     Wert, kein Abschnitt. */
  function addBlock(label, value) {
    if (!value) return;
    const block = el('section', 'film-view-block');
    block.append(el('h3', null, label), el('p', null, value));
    viewBlocks.append(block);
  }

  /* Der Teil des Fensters, der zur gewählten Staffel gehört. Bei einem
     Film und bei einer Serie mit nur einer Staffel ist das alles außer
     dem Plakat und dem Titel. */
  function fillEntry(entry) {
    const movie = entry.movie;
    const credits = creditsOf(movie);

    viewFacts.replaceChildren();
    addFact('Altersfreigabe', credits.fsk);
    addFact(movie.episodes ? 'Umfang' : 'Laufzeit', formatLength(movie));
    addFact(entry.series ? 'Disney+-Start' : 'Kinostart', longDate(movie));
    /* Der Handlungszeitraum ist die Angabe, für die es diese Fanpage
       überhaupt gibt: Er sagt, wann der Titel im Universum spielt, und
       damit, wo er auf der Timeline steht. */
    addFact('Handlung', movie.period);
    addFact('Phase', 'Phase ' + entry.phase.num + ' · ' + entry.phase.saga);
    addFact('Genre', credits.genre);

    viewLead.textContent = movie.summary || '';
    viewLead.hidden = !viewLead.textContent;

    viewBlocks.replaceChildren();
    addBlock('Regie', credits.regie);
    addBlock('Drehbuch', credits.drehbuch);
    addBlock('Produktion', credits.produktion);
    addBlock('Besetzung', castOf(movie));

    /* Beim Wechsel der Staffel steht die Spalte sonst noch dort, wo die
       vorige zuletzt gerollt war. */
    viewBody.scrollTop = 0;
  }

  function fillView(group, entry) {
    fillCover(viewPoster, group.slug, group.title, false);
    viewTitle.textContent = group.title;

    /* Die Staffelschalter gibt es nur, wo es etwas zu wählen gibt. */
    viewSeasons.replaceChildren();
    viewSeasons.hidden = group.entries.length < 2;
    if (!viewSeasons.hidden) {
      for (const season of group.entries) {
        const chip = el('button', 'chip', seasonLabel(season));
        chip.type = 'button';
        const on = season === entry;
        chip.classList.toggle('active', on);
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
        chip.addEventListener('click', () => fillView(group, season));
        viewSeasons.append(chip);
      }
    }

    fillEntry(entry);
  }

  let viewOpen = false;
  let viewOpener = null;

  /* Die Breite der Rollleiste, damit die Seite dahinter nicht um sie
     springt, sobald das html auf overflow: hidden geht. Gemessen wird nur
     bei geschlossenem Fenster: Offen hat die Seite keine eigene Leiste
     mehr, die Rechnung ergäbe null. */
  function measureScrollbar() {
    if (viewOpen) return;
    const width = window.innerWidth - root.clientWidth;
    root.style.setProperty('--sb-width', Math.max(0, width) + 'px');
  }

  /* Die Dauer, die das Fenster zum Ausblenden braucht – dieselben 0,28 s
     wie im Stylesheet bei .film-view. */
  const FADE_MS = 280;

  /* Erst wenn das Fenster ganz weg ist, bekommt die Seite ihre Rollleiste
     zurück. Sonst würde das feste Fenster mitten im Ausblenden um deren
     Breite schmaler, und die Tafel darin spränge nach links. */
  let releaseTimer = 0;

  function releaseScrollbar() {
    releaseTimer = 0;
    if (!viewOpen) root.classList.remove('modal-open');
  }

  /* Der Slug des offenen Titels steht in der Adresse: So lässt sich ein
     Fenster verlinken, genau wie characters.html#<slug> eine Figur
     aufschlägt. replaceState statt eines echten Sprungs, damit der
     Zurück-Knopf nicht durch jedes geöffnete Plakat blättert. */
  function setHash(hash) {
    try {
      history.replaceState(null, '', hash || location.pathname + location.search);
    } catch (err) {}
  }

  function openFilm(group, entry, opener) {
    /* Als Erstes, solange die Seite ihre Leiste noch hat. Steht sie schon
       zur Rückgabe an (schnell hintereinander geschlossen und wieder
       geöffnet), gilt weiter die Breite von vorhin. */
    clearTimeout(releaseTimer);
    releaseTimer = 0;
    measureScrollbar();
    fillView(group, entry || group.entries[0]);
    setHash('#' + group.slug);
    viewOpen = true;
    viewOpener = opener || null;
    view.classList.add('visible');
    view.setAttribute('aria-hidden', 'false');
    /* Ganz oben anfangen: Das Fenster wird wiederverwendet und stünde
       sonst noch dort, wo der vorige Titel zuletzt gerollt war. */
    view.scrollTop = 0;
    root.classList.add('modal-open');
    if (lenis) lenis.stop();
    requestAnimationFrame(() => {
      if (viewOpen) viewClose.focus({ preventScroll: true });
    });
  }

  function closeFilm() {
    if (!viewOpen) return;
    viewOpen = false;
    view.classList.remove('visible');
    view.setAttribute('aria-hidden', 'true');
    setHash('');
    if (reduceMotion) {
      releaseScrollbar();
    } else {
      releaseTimer = setTimeout(releaseScrollbar, FADE_MS);
    }
    if (lenis) lenis.start();

    const target = viewOpener;
    viewOpener = null;
    if (target && target.isConnected) target.focus({ preventScroll: true });
  }

  viewClose.addEventListener('click', closeFilm);

  /* Ein Klick neben die Tafel schließt. Getroffen wird dabei die rollende
     Fläche selbst oder der Schleier darunter – die Tafel darin füllt sie
     ja nur in der Mitte aus. */
  view.addEventListener('click', e => {
    if (e.target === view || e.target === viewVeil) closeFilm();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && viewOpen) closeFilm();
  });

  window.addEventListener('resize', measureScrollbar);

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

  rows.append(...buildRowPlan().map(buildRow).filter(Boolean));
  measureScrollbar();

  /* films.html#<slug> öffnet den Titel direkt – so verlinkt die
     Adressleiste einen Film, ohne dass jemand ihn erst suchen muss. Bei
     einer Serie schlägt die erste Staffel auf. */
  const wanted = decodeURIComponent(location.hash.slice(1));
  if (wanted && groupOf.has(wanted)) {
    openFilm(groupOf.get(wanted), null, null);
  }
})();
