/* Hintergrund des Bild-Studios: treibende Linien.

   Die Vorlage ist FloatingLines von React Bits, dort auf React und
   three.js gebaut. Beides gibt es hier nicht: Das Studio hat keinen
   Bauschritt, keine Abhängigkeiten und soll auch ohne Internet richtig
   aussehen. three.js tut in dieser Vorlage ohnehin nur dreierlei, es legt
   ein Rechteck über das ganze Bild, hängt einen Fragment-Shader daran und
   füllt Uniformen nach. Genau das steht hier zu Fuß, der Shader selbst
   ist bis auf drei Stellen der der Vorlage:

     1. Der Farbverlauf liegt in drei Uniformen statt in einem Feld, das
        mit gerechnetem Index gelesen wird. Ein solcher Zugriff ist in
        GLSL ES 1.0 nicht erlaubt, three.js kommt nur darüber hinweg,
        weil es auf WebGL 2 übersetzt.
     2. Die Schleifen laufen gegen eine feste Obergrenze und brechen bei
        der gewünschten Zahl ab, aus demselben Grund.
     3. Das Ergebnis geht mit einer Deckung heraus, die aus seiner
        Helligkeit folgt. Dunkles bleibt durchsichtig, dadurch scheint
        das feine Raster aus studio.css zwischen den Linien hindurch,
        statt von der Leinwand verdeckt zu werden.

   Die Leinwand liegt fest hinter der Oberfläche und nimmt keine Klicks
   an. Die Maus wird trotzdem verfolgt, sie kommt vom Fenster. */

'use strict';

(() => {
  /* ---------- Was sich einstellen lässt ----------

     Die Namen folgen den Eigenschaften der Vorlage. Die Farben stehen
     nicht hier, sondern als --hg-a bis --hg-c in studio.css: Sie gehören
     zum Farbschema und wechseln mit ihm. Die Werte unten sind nur der
     Rückfall, falls das Stylesheet einmal nicht dasteht. */
  const E = {
    wellen: { oben: true, mitte: true, unten: true },
    linien: 8,            // je Welle
    abstand: 8,           // Abstand der Linien, wie in der Vorlage mal 0.01
    tempo: 1,
    staerke: 0.32,        // Gesamthelligkeit, hier steht Oberfläche darüber
    farben: ['#0b4a63', '#45d6f5', '#a6efff'],

    interaktiv: true,
    biegeRadius: 8,
    biegeStaerke: -2,
    daempfung: 0.05,

    parallaxe: true,
    parallaxeStaerke: 0.2,

    /* Lage und Drehung der drei Wellen, wie in der Vorlage. */
    lagen: {
      oben: { x: 10.0, y: 0.5, dreh: -0.4 },
      mitte: { x: 5.0, y: 0.0, dreh: 0.2 },
      unten: { x: 2.0, y: -0.7, dreh: -1.0 },
    },

    /* Die Linien sind weich, sie brauchen weder die volle Gerätedichte
       noch die volle Bildrate. Beides ist hier gedeckelt, denn auf
       derselben Grafikkarte läuft das, worum es im Studio wirklich geht:
       Real-ESRGAN rechnet Vorlagen hoch. Ein Vollbild-Shader nimmt sonst
       Rechenzeit für etwas, das niemand ansieht. Die Bewegung ist
       ohnehin langsam, 30 Bilder je Sekunde sieht man ihr nicht an. */
    dichteMax: 1,
    bilderJeSekunde: 30,
  };

  const MAX_LINIEN = 12;

  const leinwand = document.getElementById('hintergrund');
  if (!leinwand) return;

  /* Wer es ruhig mag, bekommt ein stehendes Bild statt einer Bewegung. */
  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vertexQuelle = `
    attribute vec2 lage;
    void main() { gl_Position = vec4(lage, 0.0, 1.0); }
  `;

  const fragmentQuelle = `
    precision highp float;

    uniform float iTime;
    uniform vec3  iResolution;
    uniform float tempo;
    uniform float staerke;

    uniform bool obenAn;
    uniform bool mitteAn;
    uniform bool untenAn;

    uniform int obenZahl;
    uniform int mitteZahl;
    uniform int untenZahl;

    uniform float obenAbstand;
    uniform float mitteAbstand;
    uniform float untenAbstand;

    uniform vec3 obenLage;
    uniform vec3 mitteLage;
    uniform vec3 untenLage;

    uniform vec2  iMouse;
    uniform bool  interaktiv;
    uniform float biegeRadius;
    uniform float biegeStaerke;
    uniform float biegeAnteil;

    uniform bool parallaxe;
    uniform vec2 parallaxeVersatz;

    uniform vec3 farbeA;
    uniform vec3 farbeB;
    uniform vec3 farbeC;

    const int MAX_LINIEN = ${MAX_LINIEN};

    mat2 drehe(float r) {
      return mat2(cos(r), sin(r), -sin(r), cos(r));
    }

    /* Der Verlauf über die Linien einer Welle, t läuft von 0 bis 1. */
    vec3 linienfarbe(float t) {
      vec3 c = t < 0.5
        ? mix(farbeA, farbeB, t * 2.0)
        : mix(farbeB, farbeC, t * 2.0 - 1.0);
      return c * 0.5;
    }

    float welle(vec2 uv, float versatz, vec2 bildUv, vec2 mausUv, bool biegen) {
      float zeit = iTime * tempo;

      float x_versatz  = versatz;
      float x_lauf     = zeit * 0.1;
      float ausschlag  = sin(versatz + zeit * 0.2) * 0.3;
      float y          = sin(uv.x + x_versatz + x_lauf) * ausschlag;

      if (biegen) {
        vec2 d = bildUv - mausUv;
        float einfluss = exp(-dot(d, d) * biegeRadius);
        y += (mausUv.y - bildUv.y) * einfluss * biegeStaerke * biegeAnteil;
      }

      float m = uv.y - y;
      return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
    }

    void main() {
      vec2 bildUv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
      bildUv.y *= -1.0;

      if (parallaxe) bildUv += parallaxeVersatz;

      vec2 mausUv = vec2(0.0);
      if (interaktiv) {
        mausUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
        mausUv.y *= -1.0;
      }

      vec3 col = vec3(0.0);

      if (untenAn) {
        for (int i = 0; i < MAX_LINIEN; ++i) {
          if (i >= untenZahl) break;
          float fi = float(i);
          float t = fi / max(float(untenZahl - 1), 1.0);
          float winkel = untenLage.z * log(length(bildUv) + 1.0);
          vec2 ruv = bildUv * drehe(winkel);
          col += linienfarbe(t) * welle(
            ruv + vec2(untenAbstand * fi + untenLage.x, untenLage.y),
            1.5 + 0.2 * fi, bildUv, mausUv, interaktiv) * 0.2;
        }
      }

      if (mitteAn) {
        for (int i = 0; i < MAX_LINIEN; ++i) {
          if (i >= mitteZahl) break;
          float fi = float(i);
          float t = fi / max(float(mitteZahl - 1), 1.0);
          float winkel = mitteLage.z * log(length(bildUv) + 1.0);
          vec2 ruv = bildUv * drehe(winkel);
          col += linienfarbe(t) * welle(
            ruv + vec2(mitteAbstand * fi + mitteLage.x, mitteLage.y),
            2.0 + 0.15 * fi, bildUv, mausUv, interaktiv);
        }
      }

      if (obenAn) {
        for (int i = 0; i < MAX_LINIEN; ++i) {
          if (i >= obenZahl) break;
          float fi = float(i);
          float t = fi / max(float(obenZahl - 1), 1.0);
          float winkel = obenLage.z * log(length(bildUv) + 1.0);
          vec2 ruv = bildUv * drehe(winkel);
          ruv.x *= -1.0;
          col += linienfarbe(t) * welle(
            ruv + vec2(obenAbstand * fi + obenLage.x, obenLage.y),
            1.0 + 0.2 * fi, bildUv, mausUv, interaktiv) * 0.1;
        }
      }

      col *= staerke;

      /* Die Deckung folgt der Helligkeit: Wo nichts leuchtet, bleibt die
         Leinwand durchsichtig und das Raster der Seite steht darunter.
         Die Farbe geht schon multipliziert heraus, so erwartet es der
         Zusammensetzer bei premultipliedAlpha. */
      float deckung = clamp(max(max(col.r, col.g), col.b), 0.0, 1.0);
      gl_FragColor = vec4(col, deckung);
    }
  `;

  /* ---------- Farben ---------- */

  function ausHex(hex) {
    let w = String(hex).trim().replace(/^#/, '');
    if (w.length === 3) w = w[0] + w[0] + w[1] + w[1] + w[2] + w[2];
    const zahl = parseInt(w, 16);
    if (w.length !== 6 || Number.isNaN(zahl)) return [1, 1, 1];
    return [(zahl >> 16 & 255) / 255, (zahl >> 8 & 255) / 255, (zahl & 255) / 255];
  }

  /* Die drei Töne des gültigen Farbschemas, gelesen aus dem Stylesheet.
     Steht dort nichts, gilt der Rückfall aus E. */
  function toene() {
    const stil = getComputedStyle(document.documentElement);
    return ['--hg-a', '--hg-b', '--hg-c'].map((name, i) => {
      const wert = stil.getPropertyValue(name).trim();
      return ausHex(wert || E.farben[i]);
    });
  }

  /* ---------- WebGL ---------- */

  let gl = null;
  let programm = null;
  let puffer = null;
  let u = {};
  let raf = 0;
  let laeuft = false;
  let letztesBild = 0;
  const beginn = performance.now();

  const maus = { zielX: -1e4, zielY: -1e4, x: -1e4, y: -1e4 };
  const anteil = { ziel: 0, ist: 0 };
  const para = { zielX: 0, zielY: 0, x: 0, y: 0 };

  function uebersetze(art, quelle) {
    const s = gl.createShader(art);
    gl.shaderSource(s, quelle);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Hintergrund: Shader ließ sich nicht übersetzen.', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function baue() {
    gl = leinwand.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl) return false;

    const vs = uebersetze(gl.VERTEX_SHADER, vertexQuelle);
    const fs = uebersetze(gl.FRAGMENT_SHADER, fragmentQuelle);
    if (!vs || !fs) return false;

    programm = gl.createProgram();
    gl.attachShader(programm, vs);
    gl.attachShader(programm, fs);
    gl.linkProgram(programm);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(programm, gl.LINK_STATUS)) {
      console.warn('Hintergrund: Programm ließ sich nicht binden.', gl.getProgramInfoLog(programm));
      return false;
    }
    gl.useProgram(programm);

    /* Zwei Dreiecke über das ganze Bild, mehr Geometrie gibt es nicht. */
    puffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, puffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const lage = gl.getAttribLocation(programm, 'lage');
    gl.enableVertexAttribArray(lage);
    gl.vertexAttribPointer(lage, 2, gl.FLOAT, false, 0, 0);

    const ort = (name) => gl.getUniformLocation(programm, name);
    u = {
      zeit: ort('iTime'),
      groesse: ort('iResolution'),
      maus: ort('iMouse'),
      biegeAnteil: ort('biegeAnteil'),
      parallaxeVersatz: ort('parallaxeVersatz'),
      farbeA: ort('farbeA'),
      farbeB: ort('farbeB'),
      farbeC: ort('farbeC'),
    };

    /* Alles, was sich zur Laufzeit nicht ändert, geht einmal hinein. */
    const zahl = (name, wert) => gl.uniform1f(ort(name), wert);
    const ganz = (name, wert) => gl.uniform1i(ort(name), wert);

    zahl('tempo', E.tempo);
    zahl('staerke', E.staerke);
    ganz('obenAn', E.wellen.oben ? 1 : 0);
    ganz('mitteAn', E.wellen.mitte ? 1 : 0);
    ganz('untenAn', E.wellen.unten ? 1 : 0);

    const linien = Math.max(1, Math.min(MAX_LINIEN, E.linien));
    ganz('obenZahl', linien);
    ganz('mitteZahl', linien);
    ganz('untenZahl', linien);

    zahl('obenAbstand', E.abstand * 0.01);
    zahl('mitteAbstand', E.abstand * 0.01);
    zahl('untenAbstand', E.abstand * 0.01);

    for (const [name, l] of [['obenLage', E.lagen.oben], ['mitteLage', E.lagen.mitte],
      ['untenLage', E.lagen.unten]]) {
      gl.uniform3f(ort(name), l.x, l.y, l.dreh);
    }

    ganz('interaktiv', E.interaktiv && !ruhig ? 1 : 0);
    zahl('biegeRadius', E.biegeRadius);
    zahl('biegeStaerke', E.biegeStaerke);
    ganz('parallaxe', E.parallaxe && !ruhig ? 1 : 0);

    setzeFarben();

    passeAn();
    return true;
  }

  /* Die Töne des Schemas in den Shader. Beim Aufbau einmal, danach bei
     jedem Wechsel des Farbschemas. */
  function setzeFarben() {
    if (!gl || !programm) return;
    const [a, b, c] = toene();
    gl.useProgram(programm);
    gl.uniform3f(u.farbeA, a[0], a[1], a[2]);
    gl.uniform3f(u.farbeB, b[0], b[1], b[2]);
    gl.uniform3f(u.farbeC, c[0], c[1], c[2]);
  }

  /* ---------- Größe ---------- */

  function passeAn() {
    if (!gl) return;
    const dichte = Math.min(window.devicePixelRatio || 1, E.dichteMax);
    const breite = Math.max(1, Math.round(leinwand.clientWidth * dichte));
    const hoehe = Math.max(1, Math.round(leinwand.clientHeight * dichte));
    if (leinwand.width === breite && leinwand.height === hoehe) return;
    leinwand.width = breite;
    leinwand.height = hoehe;
    gl.viewport(0, 0, breite, hoehe);
    gl.uniform3f(u.groesse, breite, hoehe, 1);
  }

  /* ---------- Maus ----------

     Die Leinwand nimmt keine Zeiger an, sie liegt hinter allem. Die Lage
     kommt deshalb vom Fenster und wird auf Bildpunkte umgerechnet, mit
     dem Nullpunkt unten links wie in gl_FragCoord. */

  function zeiger(ev) {
    const dichte = Math.min(window.devicePixelRatio || 1, E.dichteMax);
    maus.zielX = ev.clientX * dichte;
    maus.zielY = (window.innerHeight - ev.clientY) * dichte;
    anteil.ziel = 1;

    if (E.parallaxe) {
      const vx = (ev.clientX - window.innerWidth / 2) / window.innerWidth;
      const vy = -(ev.clientY - window.innerHeight / 2) / window.innerHeight;
      para.zielX = vx * E.parallaxeStaerke;
      para.zielY = vy * E.parallaxeStaerke;
    }
  }

  function fort() {
    anteil.ziel = 0;
    para.zielX = 0;
    para.zielY = 0;
  }

  /* ---------- Lauf ---------- */

  function bild(jetzt) {
    if (!laeuft || !gl) return;
    raf = requestAnimationFrame(bild);

    /* Der Deckel auf die Bildrate. Die eine Millisekunde Nachlass fängt
       die Streuung der Zeitstempel ab, sonst fiele bei einem Schirm mit
       60 Hertz jedes zweite Bild aus und die Bewegung ruckelte. */
    if (jetzt - letztesBild < 1000 / E.bilderJeSekunde - 1) return;
    letztesBild = jetzt;

    passeAn();
    gl.uniform1f(u.zeit, (jetzt - beginn) / 1000);

    const d = E.daempfung;
    maus.x += (maus.zielX - maus.x) * d;
    maus.y += (maus.zielY - maus.y) * d;
    anteil.ist += (anteil.ziel - anteil.ist) * d;
    para.x += (para.zielX - para.x) * d;
    para.y += (para.zielY - para.y) * d;

    gl.uniform2f(u.maus, maus.x, maus.y);
    gl.uniform1f(u.biegeAnteil, anteil.ist);
    gl.uniform2f(u.parallaxeVersatz, para.x, para.y);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function starte() {
    if (laeuft || !gl) return;
    laeuft = true;
    raf = requestAnimationFrame(bild);
  }

  function halte() {
    laeuft = false;
    cancelAnimationFrame(raf);
  }

  if (!baue()) {
    /* Ohne WebGL bleibt der Grund aus studio.css stehen, das genügt. */
    leinwand.remove();
    return;
  }

  if (ruhig) {
    /* Ein Bild, dann Ruhe. Neu gezeichnet wird nur, wenn sich das Fenster
       oder das Farbschema ändert. */
    const einBild = () => {
      passeAn();
      gl.uniform1f(u.zeit, 0);
      gl.uniform2f(u.maus, -1e4, -1e4);
      gl.uniform1f(u.biegeAnteil, 0);
      gl.uniform2f(u.parallaxeVersatz, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    einBild();
    window.addEventListener('resize', einBild);
    window.addEventListener('schemawechsel', () => { setzeFarben(); einBild(); });
    return;
  }

  /* Ein anderes Farbschema heißt andere Töne für die Linien. Das nächste
     Bild trägt sie, dafür läuft ohnehin schon eine Schleife. */
  window.addEventListener('schemawechsel', setzeFarben);

  if (E.interaktiv || E.parallaxe) {
    window.addEventListener('pointermove', zeiger, { passive: true });
    document.addEventListener('pointerleave', fort);
    window.addEventListener('blur', fort);
  }

  /* Im Hintergrundtab rechnet nichts. Das Studio steht oft stundenlang
     offen, während nebenan hochgerechnet wird. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) halte(); else starte();
  });

  /* Verliert die Grafikkarte den Zusammenhang, etwa weil ein Treiber sich
     neu aufsetzt, wird er danach neu aufgebaut. Der Rest der Oberfläche
     merkt davon nichts. */
  leinwand.addEventListener('webglcontextlost', (ev) => {
    ev.preventDefault();
    halte();
  });

  leinwand.addEventListener('webglcontextrestored', () => {
    if (baue()) starte();
  });

  starte();
})();
