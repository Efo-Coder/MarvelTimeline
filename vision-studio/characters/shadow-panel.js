/* Der Schatten der Figuren auf der Erscheinungsbühne, mit dem
   Ziehwerkzeug darüber.

   Jede Figur wirft auf der Bühne ihren eigenen Umriss auf die Fläche.
   Wie er fällt, entscheiden fünf Werte im Stylesheet der Seite, bei
   .char-stage in css/style.css. Wer dort ohne Vorschau dreht, lädt nach
   jeder Zahl die Seite neu und rät zwischendurch, was die Zahlen
   bedeuten. Dieser Bereich zeigt den Wurf und lässt ihn anfassen.

   Gezeigt wird dabei nichts Nachgebautes, sondern die Seite selbst: In
   der Bühne steht ein Rahmen mit characters.html, geladen über /datei/
   aus dem Repo, mit der gewählten Figur im Anker. Verstellt wird über die
   Eigenschaften an .char-stage in diesem Rahmen, also genau an der
   Stelle, an der später auch das Stylesheet steht. Die Seite selbst weiß
   von diesem Bereich nichts und braucht dafür keine Zeile.

   ---------- Das Werkzeug ----------

   Über dem Rahmen liegt eine Zeichnung, die den Wurf umspannt: die vier
   Ecken seiner Fläche, die Mitten der Kanten und der Standpunkt. Gezogen
   wird daran wie an der vereinheitlichten Transformation in Gimp: innen
   verschieben, an den Ecken ziehen und drehen, an den Kanten stauchen,
   außerhalb drehen, mit Umschalt in einer Richtung bleiben und mit Strg
   spiegelbildlich arbeiten.

   Ein Unterschied zu Gimp bleibt, und er ist Absicht: Die untere Kante
   liegt fest. Sie ist die Standlinie, die Stelle also, an der die Figur
   den Boden berührt. In Gimp zieht man ein Bild, hier einen Schatten,
   und ein Schatten, der sich von den Füßen löst, ist keiner mehr. Die
   beiden unteren Ecken stehen deshalb als feste Marken da und nehmen
   keinen Zeiger an. Alles darüber ist frei.

   ---------- Wie aus dem Ziehen Zahlen werden ----------

   Der Wurf ist eine Projektion und hat nach dem Festhalten der
   Standlinie genau drei Freiheiten: wie weit die obere Kante nach links
   und nach rechts reicht und wie hoch sie liegt. Genau diese drei
   beschreiben umgekehrt auch die Werte, aus denen das Stylesheet den
   Wurf baut. Der Weg hin und zurück ist deshalb eindeutig und steht in
   ecken() und ausKante(): Jedes Ziehen wird zu einer neuen oberen Kante,
   und aus ihr fallen die Zahlen wieder heraus.

   Der Abstand der Kamera bleibt dabei stehen. Er lässt sich nur am
   Regler ändern, denn zusammen mit „Nach hinten“ beschreibt er dieselbe
   Verjüngung zweimal: Wer beide verdoppelt, ändert am Bild nichts. Beim
   Ziehen bleibt er deshalb der Maßstab, an dem „Nach hinten“ gemessen
   wird.

   Diese Datei benutzt json() und melde() aus studio.js und wird deshalb
   nach ihr geladen. */

'use strict';

(() => {
  const bank = document.getElementById('schatten-bank');
  if (!bank) return;

  const $$ = (id) => document.getElementById(id);
  const rahmen = $$('schatten-rahmen');
  const netz = $$('schatten-griffe');
  const wahl = $$('schatten-figur');

  const NS = 'http://www.w3.org/2000/svg';
  /* Der Rahmen ist fest so groß und wird verkleinert angezeigt, damit die
     Seite darin ein Schreibtischfenster vorfindet und nicht ihre schmale
     Fassung baut. Die Zeichnung darüber trägt dasselbe Netz als viewBox
     und stimmt damit ohne Umrechnung mit dem Rahmen überein. */
  const BREITE = 1600;
  const HOEHE = 900;

  let stand = null;      // was in css/style.css steht
  let entwurf = null;    // was gerade eingestellt ist
  let geholt = false;
  let mass = null;       // Lage der Figur im Rahmen, siehe messe()
  const blick = RahmenAusschnitt(rahmen); // nur die Bühne, siehe rahmeEin()
  let gerollt = false;   // ob die Seite ihre Bühne schon an ihren Platz gerollt hat
  let zug = null;        // was gerade gezogen wird
  let takt = 0;          // der laufende Blick auf den Rahmen, siehe starteTakt()

  const grenze = (wert, min, max) => Math.min(Math.max(wert, min), max);

  function regler(name) {
    return stand && stand.regler.find((r) => r.name === name);
  }

  /* Jeder Wert bleibt in den Grenzen seines Reglers. Was das Ziehen
     darüber hinaus fordert, wird abgeschnitten und nicht etwa
     durchgelassen: Der Server nähme es ohnehin nicht an. */
  function inGrenzen(werte) {
    const raus = { ...werte };
    for (const r of (stand ? stand.regler : [])) {
      if (typeof raus[r.name] === 'number') raus[r.name] = grenze(raus[r.name], r.min, r.max);
    }
    return raus;
  }

  /* ---------- Die Rechnung des Wurfs ----------

     Dieselbe wie in css/style.css, siehe die Herleitung dort. Für einen
     Punkt der Datei mit dem seitlichen Abstand u von der Mitte und der
     Höhe v über der Standlinie (v zählt nach unten, ist über der Linie
     also negativ):

       k = 1 - ferne / tiefe * v
       x = (u - weite * v) / k
       y = hoehe * ferne / tiefe * v / k

     Dazu kommt die Ferse, die den fertigen Wurf nach hinten schiebt. Alle
     Punkte hier zählen vom Standpunkt aus, also von der Mitte der
     Standlinie. */
  function ecken(c) {
    const B = mass.breite;
    const H = mass.hoehe;
    const f = c.ferne / c.tiefe;
    const K = 1 + f * H;               // die Verjüngung am Kopfende
    const fers = (c.ferse / 100) * H;
    const oy = -(c.hoehe * f * H) / K - fers;
    return {
      ul: { x: -B / 2, y: -fers },
      ur: { x: B / 2, y: -fers },
      ol: { x: (-B / 2 + c.weite * H) / K, y: oy },
      or: { x: (B / 2 + c.weite * H) / K, y: oy },
    };
  }

  /* Und der Rückweg: Aus der Lage der oberen Kante fallen die Werte
     wieder heraus. Die Ferse bleibt dabei stehen, sie ist keine
     Freiheit der Kante, sondern verschiebt alles gleichermaßen.

     Die Verjüngung K bleibt dabei in einem engen Band, und das aus einem
     handfesten Grund: Sie steht im Nenner der Kamerahöhe. Läuft sie gegen
     1, wird die Kante also fast so breit wie die Standlinie, dann müsste
     die Kamera unendlich hoch stehen, um denselben Anstieg zu zeigen. Ein
     Zug um wenige Punkte schlüge die Höhe dann bis an ihre Grenze, und
     die Kante liefe unter dem Zeiger weg. Über 1 hinaus geht sie
     ohnehin nicht: Ein Wurf, der nach hinten breiter wird, käme auf den
     Betrachter zu und liefe unter die Bühnenkante. */
  function ausKante(olx, orx, oy, c) {
    const B = mass.breite;
    const H = mass.hoehe;
    const fers = (c.ferse / 100) * H;
    const K = grenze(B / Math.max(orx - olx, B * 0.16), 1.1, 5);
    return inGrenzen({
      ...c,
      weite: (K * (olx + orx)) / 2 / H,
      ferne: ((K - 1) / H) * c.tiefe,
      hoehe: (-(oy + fers) * K) / (K - 1),
    });
  }

  /* ---------- Die Vorschau ---------- */

  function seite() {
    try {
      return rahmen.contentDocument;
    } catch {
      return null;
    }
  }

  /* Verstellt wird an der Bühne selbst und nicht am Wurzelelement: Die
     Werte stehen im Stylesheet an .char-stage, und was dort steht,
     schlüge einen geerbten Wert von weiter oben. */
  function setzeWerte(werte) {
    const d = seite();
    const buehne = d && d.querySelector('.char-stage');
    if (!buehne || !werte) return;
    buehne.style.setProperty('--schatten-weite', String(werte.weite));
    buehne.style.setProperty('--schatten-ferne', String(werte.ferne));
    buehne.style.setProperty('--schatten-hoehe', String(werte.hoehe));
    buehne.style.setProperty('--schatten-tiefe', String(werte.tiefe));
    buehne.style.setProperty('--schatten-ferse', werte.ferse + '%');
  }

  /* Wo die Figur im Rahmen steht: die Mitte ihrer Standlinie und das Maß
     ihres Bildes. Gemessen wird am sichtbaren Ganzkörperbild selbst, denn
     der Wurf hängt an dessen Kasten und nicht an der Bühne.

     Gemessen wird bei jedem Zeichnen neu. Das kostet nichts und erspart
     die Frage, wann sich etwas geändert haben könnte: Ein Fassungswechsel
     in der Vorschau, ein Rollen der Seite, ein anderes Fenster. */
  function messe() {
    const d = seite();
    const bild = d && d.querySelector('.char-figure-layer.front > img');
    if (!bild) return null;
    const rahmenEl = d.querySelector('.char-figure-frame');
    if (rahmenEl && rahmenEl.classList.contains('empty')) return null;
    const b = bild.getBoundingClientRect();
    if (!b.width || !b.height) return null;
    /* Ist die Figur nach oben gerückt, liegt die Standlinie des Wurfs
       nicht unter ihr, sondern auf dem Boden, und die Fläche dazwischen
       zählt zur Höhe wie eine Schwebe. Der Wurf trägt sie als Polster
       unter dem Bild, siehe .char-figure-cast img in css/style.css. */
    const wurf = d.querySelector('.char-figure-layer.front .char-figure-cast img');
    const luft = (wurf && parseFloat(getComputedStyle(wurf).paddingBottom)) || 0;
    return { mitte: b.x + b.width / 2, boden: b.bottom + luft, breite: b.width,
      hoehe: b.height + luft };
  }

  /* Die Seite im Rahmen soll sich wie eine Vorschau verhalten: kein
     eigenes Rollen, keine Bildlaufleiste über der Bühne. Der Zuhörer
     hängt ein einziges Mal am Rahmen und nicht an jedem Figurenwechsel,
     sonst sammelten sich beim Durchsehen so viele an, wie Figuren
     angesehen wurden. */
  rahmen.addEventListener('load', () => {
    const d = seite();
    if (!d) return;
    d.documentElement.style.overflow = 'hidden';
    /* Die Bühne in die Mitte holen. Die Ansicht der Figur fährt beim
       Öffnen herein, deshalb erst danach und dann noch einmal: Das zweite
       Mal fängt die Fälle ab, in denen das Bild später fertig wird als
       die Fläche. */
    const zeigeBuehne = () => {
      const st = d.querySelector('.char-stage');
      if (st) st.scrollIntoView({ block: 'center' });
      gerollt = true;
      setzeWerte(entwurf);
      zeichne();
    };
    setTimeout(zeigeBuehne, 700);
    setTimeout(zeigeBuehne, 1600);
  });

  /* Welche Figur die Vorschau zeigt, steht im Anker der Adresse, und den
     liest die Charakterseite einzig beim Laden. Ein Wechsel, der nur den
     Anker austauscht, lädt aber nicht neu: Für den Browser ist das ein
     Sprung innerhalb derselben Seite, und es bliebe die alte Figur
     stehen.

     Deshalb steht der Name zusätzlich in der Abfrage. Sie ändert die
     Adresse wirklich und erzwingt damit das Laden. Der Server sieht sie
     gar nicht, er liest nur den Pfad (siehe /datei/ in server.js). Zwei
     Zuweisungen hintereinander, erst leer und dann das Ziel, sind der
     falsche Weg: Die zweite kommt der ersten zuvor, und der Rahmen
     bleibt auf der leeren Seite stehen. */
  function starteVorschau(slug) {
    rahmen.dataset.figur = slug;
    blick.vergiss();
    gerollt = false;
    const name = encodeURIComponent(slug);
    rahmen.src = '/datei/characters.html?figur=' + name + '#' + name;
  }

  /* ---------- Nur die Bühne ----------

     Im Rahmen läuft die ganze Charakterseite, gezeigt wird aber nur ihre
     Bühne, siehe ui-components/frame-crop.js. Gezeigt wird sie erst,
     wenn die Seite sie an ihren Platz gerollt hat.

     Die Zeichnung darüber bekommt denselben Ausschnitt als viewBox. Sie
     rechnet damit weiter im Netz des Rahmens, und kein Griff braucht
     eine Umrechnung. */
  function rahmeEin() {
    const d = seite();
    const st = d && d.querySelector('.char-stage');
    const r = st && st.getBoundingClientRect();
    if (!r) return;
    const f = { x: r.x, y: r.y, breite: r.width, hoehe: r.height };
    if (blick.setze(f, gerollt)) {
      netz.setAttribute('viewBox', `${f.x} ${f.y} ${f.breite} ${f.hoehe}`);
    }
  }

  function passeZoom() {
    if (!rahmen.parentElement.clientWidth) return;
    zeichne();
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(passeZoom).observe(rahmen.parentElement);
  } else {
    window.addEventListener('resize', passeZoom);
  }

  /* ---------- Die Figurenwahl ----------

     In der Liste steht, wer ein Ganzkörperbild hat: Ohne Bild gäbe es auf
     der Bühne nichts, was einen Schatten wirft. Die Namen kommen aus dem
     Bestand, den studio.js beim Start geholt hat. */
  function baueWahl() {
    /* S ist die lexikalische Bindung aus studio.js: eine Konstante der
       obersten Ebene, also keine Eigenschaft von window. Angesprochen
       wird sie deshalb beim Namen, abgesichert über typeof. */
    const figuren = (typeof S !== 'undefined' && S.figuren) || [];
    const mitBild = figuren.filter((f) => (f.ganzkoerper || [])
      .some((g) => g.zustand === 'fertig'));
    wahl.replaceChildren();
    for (const f of mitBild) {
      const o = document.createElement('option');
      o.value = f.slug;
      o.textContent = f.ueberschrift || f.real || f.slug;
      wahl.append(o);
    }
    if (!mitBild.length) return '';
    /* Wer im Studio gerade offen ist, steht auch hier vorn. Sonst die
       erste Figur mit Bild. */
    const jetzt = typeof S !== 'undefined' && S.figur;
    const offen = jetzt && (jetzt.slug || jetzt);
    const start = mitBild.some((f) => f.slug === offen) ? offen : mitBild[0].slug;
    wahl.value = start;
    return start;
  }

  wahl.addEventListener('change', () => {
    mass = null;
    starteVorschau(wahl.value);
  });

  /* ---------- Die Zeichnung ----------

     Gezeichnet wird in den Koordinaten des Rahmens. Die Griffe müssen
     dabei ihre Größe auf dem Schirm behalten, sonst wären sie auf einer
     schmalen Bühne nicht mehr zu treffen. Ihr Maß wird deshalb durch den
     Faktor geteilt, mit dem der Ausschnitt in der Vorschau steht. */
  function zoom() {
    const breite = rahmen.parentElement.clientWidth;
    if (!breite) return 0.5;
    return breite / (blick.flaeche ? blick.flaeche.breite : BREITE);
  }

  function knoten(art, klasse, werte) {
    const el = document.createElementNS(NS, art);
    if (klasse) el.setAttribute('class', klasse);
    for (const [k, v] of Object.entries(werte)) el.setAttribute(k, String(v));
    return el;
  }

  function zeichne() {
    rahmeEin();
    if (!entwurf) return;
    mass = messe();
    if (!mass) {
      netz.replaceChildren();
      return;
    }
    setzeWerte(entwurf);

    const e = ecken(entwurf);
    const O = { x: mass.mitte, y: mass.boden };
    const P = (p) => ({ x: O.x + p.x, y: O.y + p.y });
    const ul = P(e.ul); const ur = P(e.ur); const ol = P(e.ol); const or = P(e.or);
    const g = 7 / zoom();          // halbe Kantenlänge eines Griffs
    const mitte = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

    const teile = [];
    /* Der Grund nimmt die Zeiger außerhalb des Wurfs an: Dort wird
       gedreht. Er ist durchsichtig, aber nicht durchlässig. */
    teile.push(knoten('rect', null, {
      x: 0, y: 0, width: BREITE, height: HOEHE, fill: 'transparent', 'data-griff': 'drehen',
    }));
    /* Die Fläche des Wurfs. Innen wird verschoben. */
    teile.push(knoten('polygon', null, {
      points: [ul, ol, or, ur].map((p) => p.x + ',' + p.y).join(' '),
      fill: 'transparent', 'data-griff': 'innen', style: 'cursor:move',
    }));
    teile.push(knoten('polyline', 'netz', {
      points: [ul, ol, or, ur].map((p) => p.x + ',' + p.y).join(' '),
    }));
    teile.push(knoten('line', 'netz leise', { x1: ul.x, y1: ul.y, x2: or.x, y2: or.y }));
    teile.push(knoten('line', 'netz leise', { x1: ur.x, y1: ur.y, x2: ol.x, y2: ol.y }));
    /* Die Standlinie zuletzt, sie soll über den Diagonalen liegen. */
    teile.push(knoten('line', 'boden', { x1: ul.x, y1: ul.y, x2: ur.x, y2: ur.y }));
    teile.push(knoten('circle', 'drehpunkt', { cx: O.x, cy: O.y, r: g * 0.9 }));

    const marke = (p, name, fest) => knoten('rect', 'griff' + (fest ? ' fest' : ''), {
      x: p.x - g, y: p.y - g, width: g * 2, height: g * 2, 'data-griff': name,
    });
    teile.push(marke(ul, 'fest-ul', true));
    teile.push(marke(ur, 'fest-ur', true));
    teile.push(marke(mitte(ul, ol), 'links'));
    teile.push(marke(mitte(ur, or), 'rechts'));
    teile.push(marke(mitte(ol, or), 'kopf'));
    teile.push(marke(ol, 'ol'));
    teile.push(marke(or, 'or'));
    netz.replaceChildren(...teile);
  }

  /* ---------- Das Ziehen ---------- */

  /* Der Zeiger im Koordinatennetz der Zeichnung. Über die Matrix des
     Browsers und nicht über eine eigene Rechnung: Die Zeichnung wird
     verkleinert dargestellt, und wo genau sie sitzt, weiß er besser. */
  function punkt(ev) {
    const m = netz.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  netz.addEventListener('pointerdown', (ev) => {
    if (!entwurf || !mass || ev.button !== 0) return;
    const art = ev.target.dataset && ev.target.dataset.griff;
    if (!art || art.startsWith('fest-')) return;
    const p = punkt(ev);
    if (!p) return;
    netz.setPointerCapture(ev.pointerId);
    zug = { art, start: p, anfang: { ...entwurf }, ecken: ecken(entwurf),
            ursprung: { x: mass.mitte, y: mass.boden } };
    ev.preventDefault();
  });

  netz.addEventListener('pointermove', (ev) => {
    if (!zug) return;
    const p = punkt(ev);
    if (!p) return;
    ziehe(p, ev.shiftKey, ev.ctrlKey || ev.metaKey);
    ev.preventDefault();
  });

  function endeZug(ev) {
    if (!zug) return;
    zug = null;
    if (ev && ev.pointerId != null && netz.hasPointerCapture(ev.pointerId)) {
      netz.releasePointerCapture(ev.pointerId);
    }
    ziehNach();
  }

  netz.addEventListener('pointerup', endeZug);
  netz.addEventListener('pointercancel', endeZug);

  /* Ein Zug wird immer aus dem Stand vom Anfang gerechnet und nicht aus
     dem letzten Bild. Sonst summierten sich die Abschneidungen an den
     Grenzen auf, und der Wurf liefe unter dem Zeiger davon. */
  function ziehe(p, umschalt, strg) {
    const c = zug.anfang;
    const e = zug.ecken;
    const O = zug.ursprung;
    const H = mass.hoehe;
    /* Alles rechnet vom Standpunkt aus, der Zeiger also auch. */
    const z = { x: p.x - O.x, y: p.y - O.y };
    const s = { x: zug.start.x - O.x, y: zug.start.y - O.y };
    const d = { x: z.x - s.x, y: z.y - s.y };
    /* Umschalt hält die Richtung, in der der Zug begonnen hat. */
    if (umschalt) {
      if (Math.abs(d.x) >= Math.abs(d.y)) d.y = 0; else d.x = 0;
    }

    let neu = c;
    if (zug.art === 'ol' || zug.art === 'or') {
      const eigen = zug.art === 'ol' ? e.ol : e.or;
      const ziel = { x: eigen.x + d.x, y: eigen.y + d.y };
      const mitte0 = (e.ol.x + e.or.x) / 2;
      let olx; let orx;
      if (zug.art === 'ol') {
        olx = ziel.x;
        orx = strg ? 2 * mitte0 - ziel.x : e.or.x;
      } else {
        orx = ziel.x;
        olx = strg ? 2 * mitte0 - ziel.x : e.ol.x;
      }
      neu = ausKante(Math.min(olx, orx), Math.max(olx, orx), ziel.y, c);
    } else if (zug.art === 'kopf') {
      neu = ausKante(e.ol.x + d.x, e.or.x + d.x, e.ol.y + d.y, c);
    } else if (zug.art === 'links' || zug.art === 'rechts') {
      /* Die Kantenmitte folgt dem Zeiger, die untere Ecke bleibt liegen.
         Daraus fällt die neue obere Ecke: Sie liegt doppelt so weit. */
      const untenX = zug.art === 'links' ? e.ul.x : e.ur.x;
      const mitte0 = (untenX + (zug.art === 'links' ? e.ol.x : e.or.x)) / 2;
      const ziel = 2 * (mitte0 + d.x) - untenX;
      const mittelpunkt = (e.ol.x + e.or.x) / 2;
      let olx = zug.art === 'links' ? ziel : e.ol.x;
      let orx = zug.art === 'rechts' ? ziel : e.or.x;
      if (strg) {
        if (zug.art === 'links') orx = 2 * mittelpunkt - ziel;
        else olx = 2 * mittelpunkt - ziel;
      }
      neu = ausKante(Math.min(olx, orx), Math.max(olx, orx), e.ol.y, c);
    } else if (zug.art === 'innen') {
      /* Seitwärts wandert die obere Kante, senkrecht der ganze Wurf: Die
         Standlinie kann nicht zur Seite, sie liegt unter den Füßen. Nach
         hinten und vorn darf sie, das ist die Ferse. */
      const ferse = grenze(c.ferse - (d.y / H) * 100,
        regler('ferse').min, regler('ferse').max);
      /* Senkrecht geht die obere Kante nur so weit mit wie die Standlinie.
         Was die Grenze der Ferse abschneidet, stauchte sonst den Wurf und
         drückte die Kamera bis auf den Boden. */
      const hub = -((ferse - c.ferse) / 100) * H;
      neu = ausKante(e.ol.x + d.x, e.or.x + d.x, e.ol.y + hub, { ...c, ferse });
      neu.ferse = ferse;
    } else if (zug.art === 'drehen') {
      /* Gedreht wird um den Standpunkt. Der Abstand bleibt, nur der
         Winkel ändert sich: ein Zug außen herum, wie in Gimp. */
      const winkel = Math.atan2(z.y, z.x) - Math.atan2(s.y, s.x);
      const m0 = { x: (e.ol.x + e.or.x) / 2, y: e.ol.y };
      const cos = Math.cos(winkel); const sin = Math.sin(winkel);
      const m = { x: m0.x * cos - m0.y * sin, y: m0.x * sin + m0.y * cos };
      const halb = (e.or.x - e.ol.x) / 2;
      neu = ausKante(m.x - halb, m.x + halb, m.y, c);
    }

    entwurf = inGrenzen(neu);
    zeichne();
    zeigeStand();
  }

  /* ---------- Die Regler ---------- */

  function zeige(wert, r) {
    const stellen = String(r.schritt).includes('.')
      ? String(r.schritt).split('.')[1].length : 0;
    return Number(wert).toFixed(stellen) + (r.einheit || '');
  }

  function baueRegler() {
    const feld = $$('schatten-regler');
    feld.replaceChildren();
    const gruppen = new Map();
    for (const r of stand.regler) {
      if (!gruppen.has(r.gruppe)) gruppen.set(r.gruppe, []);
      gruppen.get(r.gruppe).push(r);
    }
    for (const [name, liste] of gruppen) {
      const block = document.createElement('div');
      block.className = 'galaxie-gruppe';
      const kopf = document.createElement('p');
      kopf.className = 'galaxie-gruppe-marke';
      kopf.textContent = name;
      block.append(kopf);
      for (const r of liste) block.append(baueZeile(r));
      feld.append(block);
    }
  }

  function baueZeile(r) {
    const zeile = document.createElement('label');
    zeile.className = 'galaxie-zeile';
    zeile.title = (r.hilfe ? r.hilfe + '\n\n' : '') + 'In der Datei: --schatten-' + r.name;

    const marke = document.createElement('span');
    marke.className = 'galaxie-marke';
    marke.textContent = r.titel;

    const wert = document.createElement('span');
    wert.className = 'galaxie-wert';
    wert.textContent = zeige(entwurf[r.name], r);

    const eingabe = document.createElement('input');
    eingabe.type = 'range';
    eingabe.min = r.min; eingabe.max = r.max; eingabe.step = r.schritt;
    eingabe.value = entwurf[r.name];
    eingabe.dataset.regler = r.name;
    eingabe.addEventListener('input', () => {
      entwurf[r.name] = Number(eingabe.value);
      wert.textContent = zeige(entwurf[r.name], r);
      zeichne();
      zeigeStand();
    });

    zeile.append(marke, eingabe, wert);
    return zeile;
  }

  /* Die Regler dem Stand nachziehen, ohne sie neu zu bauen. Nach einem
     Zug am Werkzeug stehen dort andere Zahlen, und die Balken sollen das
     sofort zeigen. */
  function ziehNach() {
    if (!stand) return;
    for (const el of $$('schatten-regler').querySelectorAll('[data-regler]')) {
      const r = regler(el.dataset.regler);
      if (!r) continue;
      el.value = entwurf[r.name];
      el.parentElement.querySelector('.galaxie-wert').textContent = zeige(entwurf[r.name], r);
    }
    zeigeStand();
  }

  /* ---------- Stand, Holen und Sichern ---------- */

  /* Verglichen und geschrieben wird auf der Schrittweite des Reglers.
     Ein Zug am Werkzeug rechnet frei weiter, und ohne dieses Runden
     stünde am Ende eine Kamerahöhe von 635,873 Pixeln in der Datei. Der
     Regler daneben kennt nur Fünferschritte, und die drei Stellen wären
     eine Genauigkeit, die es nicht gibt.

     Gerundet wird erst beim Sichern und beim Vergleichen, nicht schon
     beim Ziehen: Sonst rastete der Wurf unter dem Zeiger. */
  function aufSchritt(wert, r) {
    const schritt = r.schritt || 0.001;
    const stellen = String(schritt).includes('.') ? String(schritt).split('.')[1].length : 0;
    return Number((Math.round(wert / schritt) * schritt).toFixed(stellen));
  }

  function schmutzig() {
    if (!stand) return false;
    return stand.regler.some((r) => aufSchritt(entwurf[r.name], r) !== stand.config[r.name]);
  }

  function zeigeStand() {
    const offen = schmutzig();
    $$('schatten-offen').hidden = !offen;
    $$('schatten-sichern').disabled = !offen;
    $$('schatten-zurueck').disabled = !offen;
  }

  function stelleZurueck() {
    entwurf = { ...stand.config };
    setzeWerte(entwurf);
    zeichne();
    ziehNach();
  }

  async function hole() {
    if (geholt) return;
    geholt = true;
    try {
      stand = await json('/api/schatten');
      entwurf = { ...stand.config };
      baueRegler();
      zeigeStand();
    } catch (e) {
      geholt = false;
      $$('schatten-warnung').textContent = 'Die Werte ließen sich nicht holen: ' + e.message;
      $$('schatten-warnung').hidden = false;
    }
  }

  async function sichere() {
    const knopf = $$('schatten-sichern');
    knopf.disabled = true;
    try {
      /* Gerundet wird schon hier, damit in der Datei dieselbe Zahl steht,
         die der Regler zeigt. */
      const werte = {};
      for (const r of stand.regler) werte[r.name] = aufSchritt(entwurf[r.name], r);
      const antwort = await json('/api/schatten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: werte }),
      });
      stand.config = antwort.config;
      entwurf = { ...antwort.config };
      ziehNach();
      melde(antwort.geaendert ? 'Schatten gesichert' : 'Nichts zu sichern');
    } catch (e) {
      melde('Nicht gesichert: ' + e.message, true);
      zeigeStand();
    }
  }

  $$('schatten-sichern').addEventListener('click', sichere);
  $$('schatten-zurueck').addEventListener('click', stelleZurueck);

  /* Gebaut wird erst, wenn der Bereich zum ersten Mal offen ist. Wer nur
     Porträts schneidet, soll dafür weder die Werte holen noch die halbe
     Charakterseite in einem Rahmen laufen lassen.

     Danach wird bei jedem Öffnen neu gezeichnet: Die Bühne im Rahmen
     steht zwar noch, ihre Lage im Fenster kann sich aber geändert
     haben. */
  /* ---------- Der laufende Blick auf den Rahmen ----------

     Wo die Figur im Rahmen steht, kann sich jederzeit ändern, ohne dass
     hier etwas davon mitbekäme: Das Bild wird fertig geladen, die Seite
     rollt, die Ansicht der Figur fährt herein. Ein einzelnes Nachmessen
     nach dem Laden trifft deshalb oft daneben, und dann bliebe das
     Werkzeug leer stehen.

     Statt für jeden dieser Fälle einen eigenen Anlass zu suchen, wird
     schlicht regelmäßig nachgesehen, solange der Bereich offen ist. Das
     Zeichnen kostet ein paar Dutzend Knoten, das Messen einen Aufruf.
     Während eines Zugs ruht der Takt: Dort führt der Zeiger. */
  function starteTakt() {
    if (takt) return;
    takt = setInterval(() => { if (!zug) zeichne(); }, 400);
  }

  function haltTakt() {
    clearInterval(takt);
    takt = 0;
  }

  window.addEventListener('bereichwechsel', async (e) => {
    if (e.detail.bereich !== 'schatten') { haltTakt(); return; }
    starteTakt();
    await hole();
    if (!rahmen.dataset.figur) {
      const slug = baueWahl();
      if (slug) starteVorschau(slug);
    }
    passeZoom();
    zeichne();
  });
})();
