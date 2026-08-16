/* Symbole: die Zeichen an den Knöpfen des Studios.

   Vorher stand an jedem Knopf ein Zeichen aus dem Zeichensatz, ↶ für
   Rückgängig, ＋ für Neu, ✕ für Löschen. Das ist Schrift und benimmt sich
   auch so: verschiedene Strichstärken, verschiedene Höhen über der
   Grundlinie, und was es nicht gibt, gibt es eben nicht. Ein Zuschnitt
   oder ein Upscale hat kein Zeichen.

   Hier stehen sie stattdessen als Strichzeichnungen, alle aus einer Hand.
   Die Vorlage ist react-icons, genauer der Satz Lucide daraus
   (react-icons/lu). Das Studio hat keinen Bauschritt und soll ohne
   Internet laufen, deshalb liegt hier nicht das Paket, sondern das, was
   davon gebraucht wird: die reinen Pfaddaten der 35 benutzten Symbole,
   aus react-icons entnommen und unverändert. Sie teilen sich alle
   denselben Rahmen (24 × 24, ohne Füllung, Strich in der Textfarbe), der
   steht deshalb nur einmal in RAHMEN. Lucide steht unter der ISC-Lizenz,
   react-icons unter MIT, beides erlaubt das.

   Weil der Strich die Textfarbe erbt, macht jeder Knopf mit seinem Symbol
   dasselbe: Es wird hell, wenn der Zeiger darüber steht, blass, wenn er
   nicht zu haben ist, und rot in der Gefahrenfarbe beim Löschen. Dafür
   ist im Stilblatt nichts weiter nötig, siehe den Abschnitt Symbole in
   styles/studio.css.

   Ein Knopf mit Symbol trägt seine Aufschrift in einem eigenen <span>:

       <button class="knopf mit-symbol" data-symbol="hochskalieren">
         <svg class="symbol">…</svg><span class="aufschrift">Upscale …</span>

   Das ist der Grund für beschrifte(). Ein knopf.textContent = 'läuft …'
   würde das Symbol mit hinauswerfen, und genau das tut studio.js an einem
   guten Dutzend Stellen, während etwas rechnet.

   Aufruf:
       symbole.zeichne();                       // alle [data-symbol] im Dokument
       symbole.setze(knopf, 'zuschneiden');     // Symbol setzen oder tauschen
       symbole.beschrifte(knopf, 'Upscale …');  // nur die Aufschrift
       symbole.aufschrift(knopf);               // sie wieder lesen

   Die Knöpfe der Oberfläche tragen ihr Symbol als data-symbol in
   index.html, zeichne() versorgt sie beim Start. Was studio.js erst
   später baut, bekommt es über setze(). */
(function () {
  'use strict';

  const RAHMEN = 'class="symbol" viewBox="0 0 24 24" fill="none" '
    + 'stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"';

  /* Der Schlüssel sagt, wofür das Zeichen im Studio steht, nicht wie es
     aussieht: 'freistellen', nicht 'schere'. Wer das Symbol dafür anders
     wählt, ändert nur diese eine Zeile. Dahinter steht, aus welchem
     Symbol von react-icons die Pfade stammen. */
  const ZEICHEN = {
    'zuschneiden':    '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',  // LuCrop
    'randlos':        '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',  // LuScan
    'zuruecksetzen':  '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',  // LuRotateCcw
    'hochskalieren':  '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M14 15H9v-5"/><path d="M16 3h5v5"/><path d="M21 3 9 15"/>',  // LuScaling
    'freistellen':    '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',  // LuScissors
    'drehen-links':   '<path d="M20 9V7a2 2 0 0 0-2-2h-6"/><path d="m15 2-3 3 3 3"/><path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/>',  // LuRotateCcwSquare
    'drehen-rechts':  '<path d="M12 5H6a2 2 0 0 0-2 2v3"/><path d="m9 8 3-3-3-3"/><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>',  // LuRotateCwSquare
    'rueckgaengig':   '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',  // LuUndo2
    'wiederholen':    '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/>',  // LuRedo2
    'kleiner':        '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/>',  // LuZoomOut
    'groesser':       '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/>',  // LuZoomIn
    'einpassen':      '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',  // LuMaximize
    'speichern':      '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',  // LuSave
    'schreiben':      '<path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>',  // LuFileCode
    'neu':            '<path d="M5 12h14"/><path d="M12 5v14"/>',  // LuPlus
    'umbenennen':     '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',  // LuPencil
    'hoch':           '<path d="m18 15-6-6-6 6"/>',  // LuChevronUp
    'runter':         '<path d="m6 9 6 6 6-6"/>',  // LuChevronDown
    'standard':       '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',  // LuStar
    'loeschen':       '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',  // LuTrash2
    'hochladen':      '<path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>',  // LuImagePlus
    'liste-zu':       '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',  // LuPanelLeftClose
    'liste-auf':      '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>',  // LuPanelLeftOpen
    'sicherung':      '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',  // LuArchive
    'galaxie':        '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',  // LuGlobe
    'figur-neu':      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',  // LuUserPlus
    'namen':          '<path d="M11.5 15H7a4 4 0 0 0-4 4v2"/><path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><circle cx="10" cy="7" r="4"/>',  // LuUserPen
    'auftritte':      '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',  // LuFilm
    'wiki':           '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',  // LuRefreshCw
    'nachziehen':     '<path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/>',  // LuCloudDownload
    'starten':        '<polygon points="6 3 20 12 6 21 6 3"/>',  // LuPlay
    'schliessen':     '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',  // LuX
    'uebernehmen':    '<path d="M20 6 9 17l-5-5"/>',  // LuCheck
    'zurueckholen':   '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h2"/><path d="M20 8v11a2 2 0 0 1-2 2h-2"/><path d="m9 15 3-3 3 3"/><path d="M12 12v9"/>',  // LuArchiveRestore
    'aufraeumen':     '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="m9.5 17 5-5"/><path d="m9.5 12 5 5"/>',  // LuArchiveX
    'hilfe':          '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',  // LuCircleHelp
  };

  /* Jedes Symbol wird einmal aus seiner Zeichenkette gebaut und danach
     nur noch geklont. Der Zuschnitt braucht die Fassungsleiste bei jeder
     Figur neu, das sind über den Tag ein paar hundert Knoten. */
  const vorlagen = new Map();

  function bau(name) {
    let vorlage = vorlagen.get(name);
    if (!vorlage) {
      const huelle = document.createElement('div');
      huelle.innerHTML = `<svg ${RAHMEN}>${ZEICHEN[name]}</svg>`;
      vorlage = huelle.firstElementChild;
      vorlage.dataset.name = name;
      vorlagen.set(name, vorlage);
    }
    return vorlage.cloneNode(true);
  }

  /* Was schon im Knopf steht, zieht in die Aufschrift um. Es sind nicht
     immer nur Wörter: „Neu, 76 px“ und dergleichen tragen Auszeichnungen,
     deshalb wandern die Knoten und nicht der Text. */
  function fasseAufschrift(el) {
    if (el.querySelector(':scope > .aufschrift')) return;
    if (!el.textContent.trim()) return;
    const feld = document.createElement('span');
    feld.className = 'aufschrift';
    feld.append(...el.childNodes);
    el.append(feld);
  }

  /* Ein Knopf ohne Aufschrift hat für einen Screenreader keinen Namen,
     das Symbol ist für ihn nicht da. Der Hinweistext steht bei diesen
     Knöpfen ohnehin, er wird hier zum Namen. Ein aria-label, das schon da
     ist, bleibt: Die Fassungsleiste setzt ihre Hinweise erst später und
     wechselt sie im Betrieb, ihr Name soll davon unberührt bleiben. */
  function benenne(el) {
    const text = aufschrift(el);
    if (!text && el.title && !el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', el.title);
    } else if (text && el.getAttribute('aria-label') === el.title) {
      el.removeAttribute('aria-label');
    }
  }

  function setze(el, name) {
    if (!el) return null;
    if (!ZEICHEN[name]) {
      console.warn('Unbekanntes Symbol: ' + name);
      return null;
    }
    const alt = el.querySelector(':scope > .symbol');
    if (alt && alt.dataset.name === name) return alt;

    const neu = bau(name);
    if (alt) {
      alt.replaceWith(neu);
    } else {
      fasseAufschrift(el);
      el.prepend(neu);
    }
    el.dataset.symbol = name;
    el.classList.add('mit-symbol');
    benenne(el);
    return neu;
  }

  function beschrifte(el, text) {
    if (!el) return;
    let feld = el.querySelector(':scope > .aufschrift');
    if (!feld) {
      /* Ohne Symbol ist der Knopf ein gewöhnlicher Knopf und bleibt es. */
      if (!el.querySelector(':scope > .symbol')) {
        el.textContent = text;
        return;
      }
      feld = document.createElement('span');
      feld.className = 'aufschrift';
      el.append(feld);
    }
    feld.textContent = text;
    benenne(el);
  }

  function aufschrift(el) {
    if (!el) return '';
    const feld = el.querySelector(':scope > .aufschrift');
    return (feld ? feld.textContent : el.textContent).trim();
  }

  function zeichne(wurzel) {
    const feld = wurzel || document;
    if (feld.dataset && feld.dataset.symbol) setze(feld, feld.dataset.symbol);
    for (const el of feld.querySelectorAll('[data-symbol]')) setze(el, el.dataset.symbol);
  }

  window.symbole = { setze, beschrifte, aufschrift, zeichne };

  /* Das Skript steht am Fuß des Körpers, die Oberfläche ist da. */
  zeichne();
})();
