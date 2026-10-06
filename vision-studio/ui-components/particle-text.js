/* Partikelschrift: der Name der Figur über dem Arbeitsfeld.

   Die Vorlage ist ParticleText von React Bits. Dort wird ein Text einmal
   in eine unsichtbare Leinwand geschrieben, das Bild danach in einem
   Raster abgetastet, und jeder deckende Punkt wird zu einem Teilchen.
   Die Teilchen fliegen von außen zusammen, treiben danach leicht weiter
   und weichen dem Zeiger aus.

   Hier hängt der Effekt an genau einer Stelle, der Überschrift des
   Bearbeitungsfeldes. Die Figurenliste bleibt ruhig, dort wechseln beim
   Tippen im Suchfeld ständig Dutzende Namen auf einmal.

   Sechs Dinge sind anders als in der Vorlage:

     1. Kein Kasten mit fester Höhe. Die Überschrift behält ihren Platz
        im Fluss und wird nur durchsichtig geschaltet, die Leinwand liegt
        darüber und ist ringsum um "luft" größer. Nur so können die
        Teilchen von draußen hereinfliegen, ohne beschnitten zu werden.
     2. Die Schrift wird nicht neu gesetzt, sondern genau so gezeichnet,
        wie sie im Kopf steht: dieselbe Familie, dieselbe Größe, dieselbe
        Sperrung, dieselbe Grundlinie. Die Teilchen landen dadurch auf
        dem Platz der echten Buchstaben, und die Rolle daneben steht
        weiter auf derselben Linie.
     3. Die Vorlage arbeitet mit Text von hundert Pixeln Höhe, hier sind
        es knapp dreißig. Alle Wege sind entsprechend kürzer, und die
        Vorlage wird doppelt so fein gezeichnet, wie sie abgetastet wird.
        Sonst zerfielen die dünnen Striche von Dharma Gothic zu Fussel.
     4. Der Schein kommt als drop-shadow der ganzen Leinwand, nicht als
        shadowBlur je Teilchen. Tausend weiche Schatten je Bild kosten
        spürbar Zeit, das Filter rechnet die Grafikkarte in einem Zug.
     5. Die Leinwand nimmt keine Zeiger an, sonst lägen die Knöpfe
        daneben unter ihr. Der Zeiger wird am Fenster verfolgt und in die
        Leinwand umgerechnet.
     6. Ausgelöst wird nicht beim Einhängen, sondern immer dann, wenn in
        der Überschrift ein anderer Name steht. Das Studio schreibt ihn
        mit textContent, ein Beobachter merkt das. studio.js weiß von
        dieser Datei deshalb nichts.

   Wer es ruhig mag, bekommt ein stehendes Bild: die Teilchen einmal auf
   ihren Platz gesetzt, danach kein Bild mehr. */

'use strict';

(() => {
  /* ---------- Was sich einstellen lässt ---------- */
  const P = {
    korn: 1.45,           // Kantenlänge eines Teilchens in Pixeln
    raster: 2,            // Abstand der Proben, in Pixeln der feinen Vorlage
    feinheit: 2,          // so viel feiner wird die Vorlage gezeichnet
    schwelle: 40,         // ab dieser Deckung zählt ein Punkt als Schrift
    hoechstzahl: 4200,    // mehr Teilchen bringt bei dieser Größe nichts

    streuung: 54,         // wie weit die Teilchen am Anfang draußen liegen
    sammeln: 850,         // wie lange ein Teilchen zum Ziel braucht, in ms
    staffel: 320,         // um so viel später ist das letzte Teilchen dran
    folge: 0.22,          // wie hart ein Teilchen seinem Sollpunkt folgt

    drift: 0.4,           // wie weit es danach noch treibt
    stoss: 24,            // wie weit der Zeiger ein Teilchen wegschiebt
    stossweite: 90,       // so nah muss er dafür kommen

    luft: 72,             // Rand um die Überschrift, Platz für die Streuung
    dichteMax: 2,
    bilderJeSekunde: 40,
  };

  const kopf = document.getElementById('figur-name');
  if (!kopf || !kopf.parentNode) return;

  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Farben ----------

     Grundfarbe und Akzent kommen aus der Oberfläche, damit ein anderer
     Ton in studio.css auch hier ankommt. Die eine steht als rgb() in der
     berechneten Farbe der Überschrift, der andere als Hex in --accent. */

  const klemme = (w, min, max) => Math.min(Math.max(w, min), max);
  const weich = (t) => 1 - Math.pow(1 - t, 3);

  function farbeZuRgb(wert) {
    const s = String(wert || '').trim();

    const kurz = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(s);
    if (kurz) {
      return {
        r: parseInt(kurz[1] + kurz[1], 16),
        g: parseInt(kurz[2] + kurz[2], 16),
        b: parseInt(kurz[3] + kurz[3], 16),
      };
    }

    const lang = /^#([0-9a-f]{6})$/i.exec(s);
    if (lang) {
      return {
        r: parseInt(lang[1].slice(0, 2), 16),
        g: parseInt(lang[1].slice(2, 4), 16),
        b: parseInt(lang[1].slice(4, 6), 16),
      };
    }

    const zahlen = s.match(/[\d.]+/g);
    if (zahlen && zahlen.length >= 3) {
      return { r: +zahlen[0], g: +zahlen[1], b: +zahlen[2] };
    }

    return { r: 219, g: 236, b: 246 };
  }

  function mische(von, zu, anteil) {
    return `rgb(${Math.round(von.r + (zu.r - von.r) * anteil)},`
         + `${Math.round(von.g + (zu.g - von.g) * anteil)},`
         + `${Math.round(von.b + (zu.b - von.b) * anteil)})`;
  }

  /* ---------- Die Leinwand ----------

     Sie liegt absolut in der Titelzeile, also dort, wo auch die
     Überschrift steht, und wandert mit ihr ohne Zutun. Verschoben werden
     muss sie nur, wenn die Überschrift ihre Größe ändert, und das tut
     sie genau dann, wenn ein anderer Name darin steht. */

  const leinwand = document.createElement('canvas');
  leinwand.className = 'partikelschrift';
  leinwand.setAttribute('aria-hidden', 'true');
  kopf.parentNode.insertBefore(leinwand, kopf.nextSibling);
  const ctx = leinwand.getContext('2d');

  /* Die feine Vorlage, aus der die Teilchen abgelesen werden. Sie bleibt
     dieselbe Leinwand, nur ihre Größe wechselt mit dem Namen. */
  const vorlage = document.createElement('canvas');
  const vctx = vorlage.getContext('2d', { willReadFrequently: true });

  kopf.classList.add('partikel');

  /* ---------- Lauf ---------- */

  let teilchen = [];
  let bauNummer = 0;
  let raf = 0;
  let letztesBild = 0;
  let sammelt = false;
  let sammelStart = 0;
  let breite = 0;
  let hoehe = 0;
  let standBreite = -1;
  let standHoehe = -1;

  const zeiger = { da: false, x: 0, y: 0, weichX: 0, weichY: 0 };

  function schriftVon(stil) {
    return `${stil.fontStyle} ${stil.fontWeight} ${stil.fontSize} ${stil.fontFamily}`;
  }

  async function warteAufSchrift(schrift) {
    if (!document.fonts) return;
    try { await document.fonts.load(schrift, 'Mg'); } catch { /* egal */ }
  }

  function sperrung(stil) {
    return !stil.letterSpacing || stil.letterSpacing === 'normal'
      ? '0px' : stil.letterSpacing;
  }

  /* Teilchen zählen, setzen, färben. "neuStart" heißt: erst nach draußen
     streuen und wieder zusammenfliegen. Ohne das stehen sie sofort auf
     ihrem Platz, das ist der Fall beim Umbauen wegen einer Schrift, die
     spät geladen hat. */
  async function baue(neuStart) {
    const lauf = ++bauNummer;

    const text = (kopf.textContent || '').trim();
    const kasten = kopf.getBoundingClientRect();
    if (!text || kasten.width < 1 || kasten.height < 1) { leere(); return; }

    const stil = getComputedStyle(kopf);
    const schrift = schriftVon(stil);
    const spatium = sperrung(stil);

    await warteAufSchrift(schrift);
    if (lauf !== bauNummer) return;

    /* Erst messen, dann die Größe setzen: Ein Wechsel der Leinwandgröße
       wirft jede Einstellung des Kontextes weg, Schrift und Sperrung
       müssen danach noch einmal gesetzt werden. */
    vctx.setTransform(1, 0, 0, 1, 0, 0);
    vctx.font = schrift;
    if ('letterSpacing' in vctx) vctx.letterSpacing = spatium;

    const mass = vctx.measureText(text);
    const hoch = mass.fontBoundingBoxAscent || parseFloat(stil.fontSize) * 0.78;
    const tief = mass.fontBoundingBoxDescent || parseFloat(stil.fontSize) * 0.22;
    const textBreite = Math.max(1, mass.width);

    /* Die Grundlinie der echten Überschrift: Der Zeilenkasten ist so
       hoch wie die Zeilenhöhe, die Schrift steht mittig darin. Was oben
       und unten übrig bleibt, ist der halbe Durchschuss. */
    const grundlinie = (kasten.height - (hoch + tief)) / 2 + hoch;

    /* Die Kanten müssen in ganzen Gerätepixeln aufgehen. Bei krummer
       Bildschirmdichte wäre die Bitmap sonst ein halbes Pixel breiter
       als die Fläche, die zeichne() löscht, und in der letzten Spalte
       bliebe für immer stehen, was einmal dorthin geflogen ist. */
    const dpr = Math.min(window.devicePixelRatio || 1, P.dichteMax);
    const ganz = (mass) => Math.ceil(mass * dpr) / dpr;

    breite = ganz(Math.max(kasten.width, textBreite) + 2 * P.luft);
    hoehe = ganz(kasten.height + 2 * P.luft);

    const bezug = leinwand.offsetParent
      ? leinwand.offsetParent.getBoundingClientRect()
      : { left: 0, top: 0 };
    leinwand.style.left = `${Math.round(kasten.left - bezug.left - P.luft)}px`;
    leinwand.style.top = `${Math.round(kasten.top - bezug.top - P.luft)}px`;
    leinwand.style.width = `${breite}px`;
    leinwand.style.height = `${hoehe}px`;

    leinwand.width = Math.round(breite * dpr);
    leinwand.height = Math.round(hoehe * dpr);

    const f = P.feinheit;
    vorlage.width = Math.ceil(breite * f);
    vorlage.height = Math.ceil(hoehe * f);
    vctx.setTransform(f, 0, 0, f, 0, 0);
    vctx.clearRect(0, 0, breite, hoehe);
    vctx.font = schrift;
    if ('letterSpacing' in vctx) vctx.letterSpacing = spatium;
    vctx.textAlign = 'left';
    vctx.textBaseline = 'alphabetic';
    vctx.fillStyle = '#ffffff';
    vctx.fillText(text, P.luft, P.luft + grundlinie);

    const punkte = vctx.getImageData(0, 0, vorlage.width, vorlage.height).data;
    const ziele = [];

    for (let y = 0; y < vorlage.height; y += P.raster) {
      for (let x = 0; x < vorlage.width; x += P.raster) {
        const deckung = punkte[(y * vorlage.width + x) * 4 + 3];
        if (deckung > P.schwelle) {
          ziele.push({ x: x / f, y: y / f, deckung: deckung / 255 });
        }
      }
    }

    const schritt = Math.max(1, Math.ceil(ziele.length / P.hoechstzahl));
    /* Beide Farben kommen aus der Oberfläche. Die berechnete Farbe der
       Überschrift taugt dafür nicht: Sie ist durchsichtig, solange der
       Effekt läuft, und käme hier als Schwarz an. */
    const grund = farbeZuRgb(stil.getPropertyValue('--text'));
    const akzent = farbeZuRgb(stil.getPropertyValue('--accent'));

    teilchen = [];

    for (let i = 0; i < ziele.length; i += schritt) {
      const ziel = ziele[i];
      const samen = ((i * 9301 + 49297) % 233280) / 233280;
      const tiefe = 0.45 + (((i * 233 + 97) % 1000) / 1000) * 0.9;
      /* Der Farbverlauf läuft über die Breite des Namens, von der Farbe
         der Schrift in den Akzent. Der Samen verwischt die Kante, sonst
         läge über dem Wort ein sauberer Verlauf statt eines Schwarms. */
      const anteil = klemme(
        (ziel.x - P.luft) / textBreite + (samen - 0.5) * 0.3, 0, 1);

      teilchen.push({
        x: ziel.x,
        y: ziel.y,
        zielX: ziel.x,
        zielY: ziel.y,
        vonX: ziel.x,
        vonY: ziel.y,
        korn: Math.max(0.7, P.korn * (0.75 + ziel.deckung * 0.45)),
        farbe: mische(grund, akzent, anteil),
        samen,
        tiefe,
        warten: 0,
      });
    }

    standBreite = kasten.width;
    standHoehe = kasten.height;

    zeiger.da = false;
    sammelt = false;

    if (neuStart && !ruhig) streue();

    if (ruhig) {
      /* Ein stehendes Bild, kein Lauf. */
      halt();
      zeichne(performance.now());
      return;
    }

    an();
  }

  function streue() {
    for (const t of teilchen) {
      const winkel = t.samen * Math.PI * 2;
      const weite = P.streuung * (0.35 + t.tiefe * 0.75);
      t.x = t.zielX + Math.cos(winkel) * weite + (t.tiefe - 0.5) * P.streuung * 0.55;
      t.y = t.zielY + Math.sin(winkel) * weite + (t.samen - 0.5) * P.streuung * 0.55;
      t.vonX = t.x;
      t.vonY = t.y;
      t.warten = t.samen * P.staffel;
    }

    sammelStart = performance.now();
    sammelt = true;
  }

  function leere() {
    teilchen = [];
    standBreite = -1;
    standHoehe = -1;
    halt();
    if (breite && hoehe) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, leinwand.width, leinwand.height);
    }
  }

  function zeichne(jetzt) {
    const dpr = Math.min(window.devicePixelRatio || 1, P.dichteMax);

    /* Gelöscht wird in Gerätepixeln, nicht in den Maßen der Oberfläche.
       Nur so ist sicher, dass kein Streifen am Rand übrig bleibt, wenn
       die beiden Rechnungen einmal um einen Bruchteil auseinanderlaufen. */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, leinwand.width, leinwand.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Der Zeiger wird am Fenster verfolgt, gebraucht wird er in der
       Leinwand. Der Kasten dafür kostet ein Lesen des Layouts je Bild,
       das ist billiger als ihn bei jedem Rollen nachzuführen. */
    if (P.stoss > 0 && !ruhig) {
      const kasten = leinwand.getBoundingClientRect();
      const x = zeiger.x - kasten.left;
      const y = zeiger.y - kasten.top;
      zeiger.da = x > -P.stossweite && y > -P.stossweite
        && x < breite + P.stossweite && y < hoehe + P.stossweite;
      zeiger.weichX += (x - zeiger.weichX) * 0.18;
      zeiger.weichY += (y - zeiger.weichY) * 0.18;
    }

    let fertig = true;

    for (const t of teilchen) {
      let sollX = t.zielX;
      let sollY = t.zielY;
      let weg = 1;

      if (sammelt) {
        weg = klemme((jetzt - sammelStart - t.warten) / P.sammeln, 0, 1);
        const e = weich(weg);
        sollX = t.vonX + (t.zielX - t.vonX) * e;
        sollY = t.vonY + (t.zielY - t.vonY) * e;
        if (weg < 1) fertig = false;
      } else if (!ruhig && P.drift > 0) {
        const zeit = jetzt * 0.001;
        sollX += Math.sin(zeit * 0.9 + t.samen * 10) * P.drift * t.tiefe;
        sollY += Math.cos(zeit * 0.75 + t.tiefe * 10) * P.drift * t.tiefe;
      }

      if (zeiger.da && !ruhig) {
        const dx = sollX - zeiger.weichX;
        const dy = sollY - zeiger.weichY;
        const entfernung = Math.hypot(dx, dy);
        if (entfernung > 0 && entfernung < P.stossweite) {
          const kraft = Math.pow(1 - entfernung / P.stossweite, 2) * P.stoss;
          sollX += (dx / entfernung) * kraft;
          sollY += (dy / entfernung) * kraft;
        }
      }

      const folge = ruhig ? 1 : P.folge;
      t.x += (sollX - t.x) * folge;
      t.y += (sollY - t.y) * folge;

      ctx.globalAlpha = klemme(0.35 + weg * 0.65, 0, 1);
      ctx.fillStyle = t.farbe;
      ctx.fillRect(t.x - t.korn / 2, t.y - t.korn / 2, t.korn, t.korn);
    }

    ctx.globalAlpha = 1;

    if (sammelt && fertig) sammelt = false;
  }

  function bild(jetzt) {
    raf = requestAnimationFrame(bild);

    /* Ist das Arbeitsfeld zu, hat die Überschrift keinen Platz mehr im
       Layout. Dann steht der Lauf still, bis der nächste Name kommt. */
    if (!teilchen.length || !kopf.offsetParent) { leere(); return; }

    if (jetzt - letztesBild < 1000 / P.bilderJeSekunde - 1) return;
    letztesBild = jetzt;

    zeichne(jetzt);
  }

  function an() {
    if (raf) return;
    letztesBild = 0;
    raf = requestAnimationFrame(bild);
  }

  function halt() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  /* ---------- Anlässe ----------

     Ein anderer Name in der Überschrift lässt die Teilchen neu
     zusammenfliegen. Ändert sich nur die Größe des Kastens, etwa weil
     das Fenster schmaler wird, werden sie still umgesetzt: Beim Ziehen
     am Fensterrand soll nicht dauernd etwas zusammenfliegen. */

  new MutationObserver(() => baue(true)).observe(kopf, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  let umbau = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(umbau);
    umbau = requestAnimationFrame(() => {
      const kasten = kopf.getBoundingClientRect();
      if (kasten.width < 1) return;
      /* Der Wechsel des Namens ändert auch die Größe. Der Beobachter
         oben war schneller, gebaut ist längst, hier bliebe nur, die
         Teilchen mitten im Flug wieder anzuhalten. */
      if (Math.abs(kasten.width - standBreite) < 0.5
        && Math.abs(kasten.height - standHoehe) < 0.5) return;
      baue(false);
    });
  }).observe(kopf);

  /* Ein anderes Farbschema färbt die Teilchen um. Gebaut wird still,
     ohne neues Zusammenfliegen: Der Name steht ja schon da, es ändert
     sich nur sein Ton. */
  window.addEventListener('schemawechsel', () => {
    if (teilchen.length) baue(false);
  });

  window.addEventListener('pointermove', (ev) => {
    zeiger.x = ev.clientX;
    zeiger.y = ev.clientY;
  }, { passive: true });

  window.addEventListener('pointerleave', () => { zeiger.da = false; });

  /* Die Schriften kommen aus dem Repo und sind beim ersten Namen oft
     noch nicht da. Dann steht die Vorlage in Arial Narrow und die
     Teilchen lägen falsch, sobald Dharma nachkommt. */
  if (document.fonts) {
    document.fonts.ready.then(() => { if (teilchen.length) baue(false); });
  }

  /* Im Hintergrundtab rechnet nichts. Das Studio steht oft stundenlang
     offen, während nebenan hochgerechnet wird. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) halt();
    else if (teilchen.length && !ruhig) an();
  });
})();
