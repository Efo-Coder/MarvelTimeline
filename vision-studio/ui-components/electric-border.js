/* Elektrischer Rand: der Fokus der Eingabefelder.

   Die Vorlage ist ElectricBorder von React Bits, dort eine Komponente,
   die ihren Inhalt umschließt und dauerhaft blitzt. Beides passt hier
   nicht: Das Studio hat keinen Bauschritt und keine Komponenten, und ein
   Feld, das immer blitzt, wäre Unruhe. Hier liegt der Effekt deshalb in
   einer einzigen Hülle, die dem Feld mit dem Fokus folgt und danach
   wieder verschwindet. Es blitzt immer nur ein Feld, denn den Fokus hat
   immer nur eines.

   Die Rechnung selbst ist die der Vorlage: Ein gerundetes Rechteck wird
   in gleichen Schritten abgelaufen, und jeder Punkt wird von zwei
   Rauschströmen aus der Bahn gezogen, einem für x und einem für y. Das
   Rauschen läuft über mehrere Oktaven, die unterste ist ausgeblendet.
   Dadurch zittert die Linie fein, statt als Ganzes zu schwanken.

   Vier Dinge sind anders als in der Vorlage:

     1. Die Ecken sind eckig, wie alles im Studio. Bei Radius null hat
        der Bogen die Länge null, deshalb sind die Bogenzweige beim
        Ablaufen des Rahmens abgesichert, sonst käme dort eine Division
        durch null heraus.
     2. Auslenkung und Luft um das Feld sind kleiner. Die Vorlage
        umrahmt Karten, hier geht es um Zeilen von dreißig Pixeln Höhe.
     3. Die Länge einer Zacke hängt an der Strecke, nicht am Anteil am
        Umfang. Siehe "bezug" weiter unten.
     4. Die Hülle hängt im Dialog, wenn das Feld in einem steht. Ein
        offener Dialog liegt in der obersten Ebene des Browsers, alles
        am Körper der Seite läge dahinter.

   Wer es ruhig mag, bekommt ein stehendes Bild: die Linie einmal
   gezeichnet, danach nur noch nachgeführt, wenn sich das Feld bewegt. */

'use strict';

(() => {
  /* ---------- Was sich einstellen lässt ---------- */
  const E = {
    tempo: 1,             // Geschwindigkeit des Rauschens
    chaos: 0.14,          // Grundstärke des Rauschens, in der Vorlage "chaos"
    auslenkung: 20,       // wie weit die Linie höchstens wegkann, in Pixeln
    versatz: 24,          // Luft um das Feld, so weit reicht die Leinwand
    dicke: 1,             // Strichstärke
    ecke: 0,              // Eckenradius, das Studio ist kantig

    /* Die Zahlen des Rauschens, alle aus der Vorlage. */
    oktaven: 10,
    lakunaritaet: 1.6,
    verstaerkung: 0.7,
    frequenz: 10,
    grundflaeche: 0,      // "baseFlatness": blendet die unterste Oktave aus

    /* Wie lang eine Zacke ist, in Pixeln des Umfangs. Die Vorlage rechnet
       das Rauschen über den Anteil am Umfang, nicht über die Strecke:
       Ein kleines Feld bekommt dadurch dieselbe Zahl Zacken wie eine
       große Karte, sie werden nur kürzer, und aus der Entladung wird
       Fussel. Hier zählt die Strecke, dadurch sieht ein Suchfeld aus wie
       ein Ausschnitt aus der Karte der Vorlage. */
    bezug: 125,

    /* Ein feiner Strich braucht die Gerätedichte, sonst franst er aus.
       Die Bildrate darf darunter bleiben: Die Linie zappelt ohnehin,
       fünfundvierzig Bilder sieht man ihr nicht an, und auf derselben
       Grafikkarte rechnet nebenan Real-ESRGAN. */
    dichteMax: 2,
    bilderJeSekunde: 45,
  };

  /* Diese Felder bekommen den Rand. Regler, Kästchen und der versteckte
     Dateiwähler nicht, die haben keinen Rahmen, den man umranden könnte. */
  const FELDER = [
    'input[type=text]',
    'input[type=search]',
    'input[type=number]',
    'input[type=email]',
    'input[type=url]',
    'input:not([type])',
    'textarea',
    'select',
  ].join(',');

  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Rauschen ----------

     Alles unverändert aus der Vorlage. Der Rest der Ähnlichkeit steckt
     in den Zahlen oben. */

  const zufall = (x) => (Math.sin(x * 12.9898) * 43758.5453) % 1;

  function rauschen2D(x, y) {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;

    const a = zufall(i + j * 57);
    const b = zufall(i + 1 + j * 57);
    const c = zufall(i + (j + 1) * 57);
    const d = zufall(i + 1 + (j + 1) * 57);

    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);

    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy)
         + c * (1 - ux) * uy + d * ux * uy;
  }

  function oktavenrauschen(x, zeit, samen) {
    let y = 0;
    let staerke = E.chaos;
    let frequenz = E.frequenz;

    for (let i = 0; i < E.oktaven; i++) {
      const anteil = i === 0 ? staerke * E.grundflaeche : staerke;
      y += anteil * rauschen2D(frequenz * x + samen * 100, zeit * frequenz * 0.3);
      frequenz *= E.lakunaritaet;
      staerke *= E.verstaerkung;
    }

    return y;
  }

  /* ---------- Der Rahmen ----------

     t läuft von 0 bis 1 einmal um das Rechteck herum, das Ergebnis ist
     der Punkt an dieser Stelle. Bei Radius null fallen die vier Bögen
     weg, ihre Zweige greifen dann nicht mehr. */

  function eckpunkt(mx, my, r, start, bogen, anteil) {
    const winkel = start + anteil * bogen;
    return { x: mx + r * Math.cos(winkel), y: my + r * Math.sin(winkel) };
  }

  function punktAufRahmen(t, links, oben, breite, hoehe, radius) {
    const gerade = breite - 2 * radius;
    const senkrecht = hoehe - 2 * radius;
    const bogen = (Math.PI * radius) / 2;
    const umfang = 2 * gerade + 2 * senkrecht + 4 * bogen;
    const weg = t * umfang;

    let bisher = 0;

    if (weg <= bisher + gerade) {
      const p = (weg - bisher) / gerade;
      return { x: links + radius + p * gerade, y: oben };
    }
    bisher += gerade;

    if (bogen > 0 && weg <= bisher + bogen) {
      const p = (weg - bisher) / bogen;
      return eckpunkt(links + breite - radius, oben + radius, radius, -Math.PI / 2, Math.PI / 2, p);
    }
    bisher += bogen;

    if (weg <= bisher + senkrecht) {
      const p = (weg - bisher) / senkrecht;
      return { x: links + breite, y: oben + radius + p * senkrecht };
    }
    bisher += senkrecht;

    if (bogen > 0 && weg <= bisher + bogen) {
      const p = (weg - bisher) / bogen;
      return eckpunkt(links + breite - radius, oben + hoehe - radius, radius, 0, Math.PI / 2, p);
    }
    bisher += bogen;

    if (weg <= bisher + gerade) {
      const p = (weg - bisher) / gerade;
      return { x: links + breite - radius - p * gerade, y: oben + hoehe };
    }
    bisher += gerade;

    if (bogen > 0 && weg <= bisher + bogen) {
      const p = (weg - bisher) / bogen;
      return eckpunkt(links + radius, oben + hoehe - radius, radius, Math.PI / 2, Math.PI / 2, p);
    }
    bisher += bogen;

    if (weg <= bisher + senkrecht) {
      const p = (weg - bisher) / senkrecht;
      return { x: links, y: oben + hoehe - radius - p * senkrecht };
    }
    bisher += senkrecht;

    if (bogen === 0) return { x: links, y: oben };
    const p = (weg - bisher) / bogen;
    return eckpunkt(links + radius, oben + radius, radius, Math.PI, Math.PI / 2, p);
  }

  /* ---------- Die Hülle ----------

     Eine einzige, sie wandert von Feld zu Feld. Darin liegen die
     Leinwand mit der zappelnden Linie und drei Scheine aus studio.css:
     zwei weiche Ränder auf der Kante des Feldes und ein breiter Schimmer
     dahinter. Die Hülle nimmt keine Klicks an. */

  let huelle = null;
  let leinwand = null;
  let ctx = null;

  function baueHuelle() {
    huelle = document.createElement('div');
    huelle.className = 'elektrorand';
    huelle.setAttribute('aria-hidden', 'true');
    huelle.style.setProperty('--elektro-luft', `${E.versatz}px`);

    leinwand = document.createElement('canvas');
    leinwand.className = 'elektrorand-strich';
    huelle.appendChild(leinwand);

    for (const art of ['schein', 'schein hell', 'grund']) {
      const lage = document.createElement('i');
      lage.className = `elektrorand-${art}`;
      huelle.appendChild(lage);
    }

    ctx = leinwand.getContext('2d');
  }

  /* ---------- Lauf ---------- */

  let feld = null;        // das Feld, das gerade den Fokus hat
  let rahmen = null;      // was umrandet wird, meist das Feld selbst
  let raf = 0;
  let zeit = 0;
  let letzterStempel = 0;
  let letztesBild = 0;
  let breite = 0;
  let hoehe = 0;
  let farbe = '#45d6f5';

  /* Nur der sichtbare Kasten zählt. Beim Dateinamen liegt der Rahmen um
     die ganze Zeile, das Feld darin hat selbst keinen. */
  function rahmenZu(el) {
    return el.closest('.dateiname') || el;
  }

  function anpassen(rect) {
    const b = rect.width + 2 * E.versatz;
    const h = rect.height + 2 * E.versatz;
    const dpr = Math.min(window.devicePixelRatio || 1, E.dichteMax);

    huelle.style.left = `${rect.left}px`;
    huelle.style.top = `${rect.top}px`;
    huelle.style.width = `${rect.width}px`;
    huelle.style.height = `${rect.height}px`;

    if (b === breite && h === hoehe && leinwand.width === Math.round(b * dpr)) return false;

    breite = b;
    hoehe = h;
    leinwand.width = Math.round(b * dpr);
    leinwand.height = Math.round(h * dpr);
    leinwand.style.width = `${b}px`;
    leinwand.style.height = `${h}px`;
    return true;
  }

  function zeichne() {
    const dpr = Math.min(window.devicePixelRatio || 1, E.dichteMax);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, breite, hoehe);

    ctx.strokeStyle = farbe;
    ctx.lineWidth = E.dicke;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const feldBreite = breite - 2 * E.versatz;
    const feldHoehe = hoehe - 2 * E.versatz;
    const radius = Math.min(E.ecke, Math.min(feldBreite, feldHoehe) / 2);

    const umfang = 2 * (feldBreite + feldHoehe) + 2 * Math.PI * radius;
    const schritte = Math.max(24, Math.floor(umfang / 2));

    ctx.beginPath();

    for (let i = 0; i <= schritte; i++) {
      const t = i / schritte;
      const p = punktAufRahmen(t, E.versatz, E.versatz, feldBreite, feldHoehe, radius);

      const s = (t * umfang) / E.bezug;
      const nx = oktavenrauschen(s, zeit, 0);
      const ny = oktavenrauschen(s, zeit, 1);

      const x = p.x + nx * E.auslenkung;
      const y = p.y + ny * E.auslenkung;

      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
  }

  function bild(jetzt) {
    raf = requestAnimationFrame(bild);

    if (!feld || !rahmen.isConnected) { aus(); return; }

    const rect = rahmen.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const neu = anpassen(rect);

    if (ruhig) {
      /* Ein stehendes Bild, neu nur wenn sich die Größe geändert hat. */
      if (neu) zeichne();
      return;
    }

    if (jetzt - letztesBild < 1000 / E.bilderJeSekunde - 1) return;
    zeit += Math.min((jetzt - letzterStempel) / 1000, 0.1) * E.tempo;
    letzterStempel = jetzt;
    letztesBild = jetzt;

    zeichne();
  }

  function an(el) {
    if (feld === el) return;
    aus();

    if (!huelle) baueHuelle();

    feld = el;
    rahmen = rahmenZu(el);

    /* Die Farbe kommt aus der Oberfläche, damit ein anderer Akzent in
       studio.css auch hier ankommt. */
    farbe = getComputedStyle(el).getPropertyValue('--accent').trim() || '#45d6f5';

    /* Steht das Feld in einem Dialog, gehört die Hülle in den Dialog:
       Ein offener Dialog liegt in der obersten Ebene, der Körper der
       Seite läge dahinter. */
    const ziel = el.closest('dialog') || document.body;
    if (huelle.parentNode !== ziel) ziel.appendChild(huelle);

    breite = 0;
    hoehe = 0;
    zeit = Math.random() * 100;   // nicht jedes Feld fängt gleich an
    letzterStempel = performance.now();
    letztesBild = 0;

    anpassen(rahmen.getBoundingClientRect());
    zeichne();

    /* Erst rechnen lassen, dann sichtbar schalten. Ohne diesen Zwang
       fielen das Einhängen und das Aufblenden in denselben Zug, der
       Browser sähe nie eine Deckung von null und die Blende bliebe aus:
       Die Linie stünde schlagartig da. */
    void huelle.getBoundingClientRect().width;
    huelle.classList.add('an');
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(bild);
  }

  function aus() {
    if (!feld) return;
    feld = null;
    rahmen = null;
    cancelAnimationFrame(raf);
    raf = 0;
    if (huelle) {
      huelle.classList.remove('an');
      huelle.remove();
    }
  }

  document.addEventListener('focusin', (ev) => {
    const el = ev.target;
    if (el instanceof Element && el.matches(FELDER)) an(el); else aus();
  });

  document.addEventListener('focusout', aus);

  /* Wechselt das Farbschema, während ein Feld den Fokus hat, wechselt die
     Linie mit. Sonst blitzte sie im alten Ton weiter, bis das nächste
     Feld drankommt. */
  window.addEventListener('schemawechsel', () => {
    if (!feld) return;
    farbe = getComputedStyle(feld).getPropertyValue('--accent').trim() || farbe;
  });

  /* Im Hintergrundtab rechnet nichts. Das Studio steht oft stundenlang
     offen, während nebenan hochgerechnet wird. Beim Zurückkommen fängt
     die Linie wieder an: Das Feld hat immer noch den Fokus, aber ein
     focusin kommt dafür nicht mehr. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { aus(); return; }
    const el = document.activeElement;
    if (el instanceof Element && el.matches(FELDER)) an(el);
  });
})();
