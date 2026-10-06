/* Stränge im Fortschrittskasten: leuchtende Fäden hinter Zahl und Balken.

   Die Vorlage ist Strands von React Bits, dort auf React und ogl gebaut.
   Beides gibt es im Studio nicht, es hat keinen Bauschritt und keine
   Abhängigkeiten. ogl tut in dieser Vorlage ohnehin nur dreierlei: Es
   legt ein Rechteck über die ganze Leinwand, hängt einen Fragment-Shader
   daran und füllt Uniformen nach. Genau das steht hier zu Fuß, der
   Shader selbst ist bis auf vier Stellen der der Vorlage:

     1. Er läuft auf WebGL 1 statt auf WebGL 2. Die Farben liegen deshalb
        in drei Uniformen statt in einem Feld, das mit gerechnetem Index
        gelesen wird, und die Schleife läuft gegen eine feste Obergrenze
        und bricht bei der gewünschten Zahl ab. Beides ist in GLSL ES 1.0
        nicht anders erlaubt, dieselben zwei Kunstgriffe stehen schon in
        background-lines.js.
     2. Der Glaskörper der Vorlage fehlt. Er ist mit glass: false
        abgeschaltet und wäre ein zweiter Durchgang über eine
        Zwischenleinwand, der nichts zeigt.
     3. Der Maßstab folgt dem Seitenverhältnis des Kastens, statt fest bei
        1.5 zu stehen. Die Vorlage zeigt ihre Stränge in einem 600 Bild-
        punkte hohen Feld, der Fortschrittskasten ist 330 mal 100. Mit dem
        festen Wert säße das ganze Geflecht als daumenbreiter Knoten in
        der Mitte, denn die Verjüngung ist schon nach gut fünfzig
        Bildpunkten bei null. Gerechnet wird er so, dass die Stränge kurz
        vor dem linken und rechten Rand auslaufen.
     4. Die Farben stehen nicht im Skript, sondern als --strang-a bis
        --strang-c in studio.css, dort wo alle Farben des Studios stehen.

   Gezeichnet wird nur, solange der Kasten zu sehen ist. Das ist
   wichtiger, als es klingt: Der Kasten steht genau dann da, wenn nebenan
   Real-ESRGAN auf derselben Grafikkarte rechnet. Daher auch der Deckel
   auf die Bildrate und die kleine Leinwand. */

'use strict';

(() => {
  /* ---------- Was sich einstellen lässt ----------

     Die Namen folgen den Eigenschaften der Vorlage: zahl ist count,
     tempo speed, ausschlag amplitude, welligkeit waviness, dicke
     thickness, leuchten glow, verjuengung taper, streuung spread,
     staerke intensity, saettigung saturation, deckung opacity,
     farbversatz hueShift. Die Werte sind die gewünschten. */
  const E = {
    zahl: 3,
    tempo: 0.5,
    ausschlag: 1,
    welligkeit: 1,
    dicke: 0.7,
    leuchten: 2.6,
    verjuengung: 3,
    streuung: 1,
    staerke: 0.6,
    saettigung: 2,
    /* Als einziger Wert nicht der der Vorlage: Dort steht die Deckung auf
       1. In einem 600 Bildpunkte hohen Feld ist das richtig, im
       Fortschrittskasten liegt die Schrift mitten im Leuchten und der
       Schrittsatz war über dem hellen Strang kaum noch zu lesen. */
    deckung: 0.62,
    farbversatz: 0,

    /* Nur der Rückfall, falls das Stylesheet einmal nicht dasteht. */
    farben: ['#f97316', '#7c3aed', '#06b6d4'],

    /* Der Maßstab, siehe Punkt 3 oben. rand ist die Stelle, an der die
       Stränge am linken und rechten Rand verschwunden sein sollen: Die
       Verjüngung erreicht bei 1 / (2 * 1.3) = 0.385 die Null, ein wenig
       darüber bleibt am Rand wirklich nichts stehen. Der Mindestwert ist
       der der Vorlage und greift nur bei einem hohen Kasten. */
    rand: 0.42,
    massstabMin: 1.5,

    /* Die Leinwand ist klein, die volle Gerätedichte kostet hier fast
       nichts. Die Bildrate dagegen bleibt gedeckelt, denn während der
       Kasten steht, rechnet die Grafikkarte an der eigentlichen Arbeit.
       Die Bewegung ist langsam, 30 Bilder je Sekunde sieht man ihr nicht
       an. */
    dichteMax: 2,
    bilderJeSekunde: 30,
  };

  const MAX_STRAENGE = 12;

  const kasten = document.getElementById('fortschritt');
  const leinwand = document.getElementById('fortschritt-straenge');
  if (!kasten || !leinwand) return;

  /* Wer es ruhig mag, bekommt ein stehendes Bild statt einer Bewegung. */
  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vertexQuelle = `
    attribute vec2 lage;
    void main() { gl_Position = vec4(lage, 0.0, 1.0); }
  `;

  const fragmentQuelle = `
    precision highp float;

    uniform float iTime;
    uniform vec2  iResolution;
    uniform float massstab;

    uniform int   strangZahl;
    uniform float tempo;
    uniform float ausschlag;
    uniform float welligkeit;
    uniform float dicke;
    uniform float leuchten;
    uniform float verjuengung;
    uniform float streuung;
    uniform float staerke;
    uniform float saettigung;
    uniform float deckung;
    uniform float farbversatz;

    uniform vec3 farbeA;
    uniform vec3 farbeB;
    uniform vec3 farbeC;

    const float PI = 3.14159265;
    const int MAX_STRAENGE = ${MAX_STRAENGE};

    /* Der Verlauf über die drei Töne, t läuft im Kreis. In der Vorlage
       steht dafür ein Feld mit gerechnetem Index, das WebGL 1 nicht
       erlaubt. Bei drei Farben ist die Fallunterscheidung dasselbe. */
    vec3 verlauf(float t) {
      float s = fract(t) * 3.0;
      if (s < 1.0) return mix(farbeA, farbeB, s);
      if (s < 2.0) return mix(farbeB, farbeC, s - 1.0);
      return mix(farbeC, farbeA, s - 2.0);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
      uv /= max(massstab, 0.0001);

      float e = 0.06 + staerke * 0.94;

      /* Die Verjüngung zu den Seiten hin. Sie führt Ausschlag, Dicke und
         Helligkeit zugleich, deshalb laufen die Stränge an den Rändern
         nicht nur aus, sondern werden auch flach und dünn. */
      float huelle = pow(max(cos(uv.x * PI * 1.3), 0.0), verjuengung);

      vec3 col = vec3(0.0);

      for (int i = 0; i < MAX_STRAENGE; ++i) {
        if (i >= strangZahl) break;

        float fi = float(i);
        float ph = fi * 1.7 * streuung;
        float freq = (2.0 + fi * 0.35) * welligkeit;
        float spd = 1.4 + fi * 1.2;

        /* Zwei Schwingungen gegeneinander, die schnellere läuft rückwärts.
           Daraus wird die Bewegung unregelmäßig, statt zu schaukeln. */
        float tt = iTime * tempo;
        float w = sin(uv.x * freq + tt * spd + ph) * 0.60
                + sin(uv.x * freq * 1.1 - tt * spd * 0.7 + ph * 1.7) * 0.40;

        float y = w * (0.1 + 0.02 * e) * huelle * ausschlag;

        /* Der Faden selbst: Sein Licht fällt mit dem Abstand, das Quadrat
           macht daraus einen scharfen Kern mit weichem Hof. */
        float d = abs(uv.y - y);
        float dick = (0.001 + 0.05 * e) * (0.35 + huelle) * dicke;
        float g = dick / (d + dick * 0.45);
        g = g * g;

        float h = fi / float(strangZahl) + uv.x * 0.30 + iTime * 0.04 + farbversatz;
        col += verlauf(h) * g * huelle;
      }

      col *= 0.45 + 0.7 * e;
      col = 1.0 - exp(-col * leuchten);

      float grau = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = max(mix(vec3(grau), col, saettigung), 0.0);

      /* Die Deckung folgt der Helligkeit: Wo nichts leuchtet, bleibt die
         Leinwand durchsichtig und der Grund des Kastens steht darunter.
         Die Farbe geht schon multipliziert heraus, so erwartet es der
         Zusammensetzer bei premultipliedAlpha. */
      float hell = max(max(col.r, col.g), col.b);
      gl_FragColor = vec4(col * deckung, clamp(hell, 0.0, 1.0) * deckung);
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

  function toene() {
    const stil = getComputedStyle(document.documentElement);
    return ['--strang-a', '--strang-b', '--strang-c'].map((name, i) => {
      const wert = stil.getPropertyValue(name).trim();
      return ausHex(wert || E.farben[i]);
    });
  }

  /* ---------- WebGL ---------- */

  let gl = null;
  let programm = null;
  let u = {};
  let raf = 0;
  let laeuft = false;
  let letztesBild = 0;
  const beginn = performance.now();

  function uebersetze(art, quelle) {
    const s = gl.createShader(art);
    gl.shaderSource(s, quelle);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Stränge: Shader ließ sich nicht übersetzen.', gl.getShaderInfoLog(s));
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
      console.warn('Stränge: Programm ließ sich nicht binden.', gl.getProgramInfoLog(programm));
      return false;
    }
    gl.useProgram(programm);

    /* Ein Dreieck über die ganze Leinwand, mehr Geometrie gibt es nicht. */
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const lage = gl.getAttribLocation(programm, 'lage');
    gl.enableVertexAttribArray(lage);
    gl.vertexAttribPointer(lage, 2, gl.FLOAT, false, 0, 0);

    const ort = (name) => gl.getUniformLocation(programm, name);
    u = {
      zeit: ort('iTime'),
      groesse: ort('iResolution'),
      massstab: ort('massstab'),
      farbeA: ort('farbeA'),
      farbeB: ort('farbeB'),
      farbeC: ort('farbeC'),
    };

    /* Alles, was sich zur Laufzeit nicht ändert, geht einmal hinein. */
    const zahl = (name, wert) => gl.uniform1f(ort(name), wert);
    gl.uniform1i(ort('strangZahl'), Math.max(1, Math.min(MAX_STRAENGE, Math.round(E.zahl))));
    zahl('tempo', E.tempo);
    zahl('ausschlag', E.ausschlag);
    zahl('welligkeit', E.welligkeit);
    zahl('dicke', E.dicke);
    zahl('leuchten', E.leuchten);
    zahl('verjuengung', E.verjuengung);
    zahl('streuung', E.streuung);
    zahl('staerke', E.staerke);
    zahl('saettigung', E.saettigung);
    zahl('deckung', E.deckung);
    zahl('farbversatz', E.farbversatz);

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

  /* ---------- Größe ----------

     Solange der Kasten zu ist, hat die Leinwand keine Ausdehnung. Das
     macht nichts: Gemessen wird vor jedem Bild, und Bilder gibt es erst,
     wenn der Kasten aufgeht. */

  function passeAn() {
    if (!gl) return;
    const dichte = Math.min(window.devicePixelRatio || 1, E.dichteMax);
    const breite = Math.max(1, Math.round(leinwand.clientWidth * dichte));
    const hoehe = Math.max(1, Math.round(leinwand.clientHeight * dichte));
    if (leinwand.width === breite && leinwand.height === hoehe) return;
    leinwand.width = breite;
    leinwand.height = hoehe;
    gl.viewport(0, 0, breite, hoehe);
    gl.uniform2f(u.groesse, breite, hoehe);
    gl.uniform1f(u.massstab,
      Math.max(E.massstabMin, breite / hoehe / 2 / E.rand));
  }

  /* ---------- Lauf ---------- */

  function zeichne(sekunden) {
    passeAn();
    gl.uniform1f(u.zeit, sekunden);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function bild(jetzt) {
    if (!laeuft || !gl) return;
    raf = requestAnimationFrame(bild);

    /* Der Deckel auf die Bildrate. Die eine Millisekunde Nachlass fängt
       die Streuung der Zeitstempel ab, sonst fiele bei einem Schirm mit
       60 Hertz jedes zweite Bild aus und die Bewegung ruckelte. */
    if (jetzt - letztesBild < 1000 / E.bilderJeSekunde - 1) return;
    letztesBild = jetzt;

    zeichne((jetzt - beginn) / 1000);
  }

  function starte() {
    if (!gl || document.hidden || kasten.hidden) return;
    if (ruhig) return zeichne(0);
    if (laeuft) return;
    laeuft = true;
    raf = requestAnimationFrame(bild);
  }

  function halte() {
    laeuft = false;
    cancelAnimationFrame(raf);
  }

  if (!baue()) {
    /* Ohne WebGL bleibt der Kasten, wie er war. Balken und Zahl sagen
       ohnehin alles, was zu sagen ist. */
    leinwand.remove();
    return;
  }

  /* Der Kasten geht auf und zu, indem studio.js sein hidden setzt. Daran
     hängt der Lauf, damit im Leerlauf nichts gerechnet wird. */
  new MutationObserver(() => (kasten.hidden ? halte() : starte()))
    .observe(kasten, { attributes: true, attributeFilter: ['hidden'] });

  window.addEventListener('schemawechsel', () => {
    setzeFarben();
    if (ruhig) starte();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) halte(); else starte();
  });

  /* Verliert die Grafikkarte den Zusammenhang, etwa weil ein Treiber sich
     neu aufsetzt, wird er danach neu aufgebaut. */
  leinwand.addEventListener('webglcontextlost', (ev) => {
    ev.preventDefault();
    halte();
  });

  leinwand.addEventListener('webglcontextrestored', () => {
    if (baue()) starte();
  });

  starte();
})();
