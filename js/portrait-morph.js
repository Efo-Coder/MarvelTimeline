/* Der Übergang zwischen zwei Bildern auf der Charakterseite.

   Zwei Stellen wechseln dort ihr Bild, und beide gingen bisher hart oder
   mit einer schlichten Blende: das Porträt auf der Bühne, wenn mit den
   Pfeilen weitergeblättert wird, und das Ganzkörperbild auf der
   Erscheinungsbühne, wenn eine andere Fassung oder eine andere Figur
   drankommt. Hier löst sich das alte Bild stattdessen auf, und das neue
   tritt aus derselben Auflösung wieder heraus, gerechnet auf der
   Grafikkarte.

   Vier Übergänge stehen zur Wahl, umschaltbar zur Laufzeit:

     melt     beide Bilder zerfließen entlang eines wandernden Rauschens
     ripple   eine Welle läuft von der Kante herein und tauscht dahinter
     shear    waagerechte Streifen ziehen versetzt zur Seite
     swirl    beide Bilder drehen gegeneinander und blenden dabei über

   Die Regler heißen wie in der Vorlage, aus der die Idee stammt, und
   lassen sich in der Konsole ausprobieren:

     PortraitMorph.set({ transition: 'ripple', intensity: 0.8 })
     PortraitMorph.channel('stage').set({ duration: 0.7 })
     PortraitMorph.get()

   Jede der beiden Stellen ist ein eigener Kanal mit eigener Leinwand,
   denn beim Blättern laufen beide Übergänge gleichzeitig. Ein Kanal
   entsteht beim ersten Gebrauch und bleibt dann liegen: Sein Rahmen
   wechselt, seine Leinwand nicht.

   Drei Dinge unterscheiden die Umsetzung von der Vorlage, und alle drei
   folgen aus den Bildern, die hier stehen:

   1. Beide Bilder sind freigestellt. Gerechnet wird deshalb mit
      vorgewichteter Deckung, und der Grund darunter bleibt der Grund
      darunter. Ein Übergang, der die Fläche vollflächig füllte, machte
      aus der freigestellten Figur einen Kasten.

   2. Wo genau ein Bild im Rahmen liegt, sagt nicht der Shader, sondern
      das Bild selbst: Vor dem Wechsel wird seine Fläche im Rahmen
      gemessen (siehe boxOf), und der Shader legt die Textur genau
      dorthin. Anders ginge es auf der Erscheinungsbühne auch nicht, denn
      dort hat jede Datei ihr eigenes Maß aus Körpergröße und Zuschnitt.

   3. Am Anfang und am Ende steht exakt das Bild, das auch das <img>
      zeigt. Jede Verzerrung, jeder Farbversatz und auch das leichte
      Wandern hängen an sin(p·π) und sind an beiden Enden null, und die
      Mischung selbst ist so gebaut, dass sie bei 0 und 1 sauber aufgeht.
      Sonst blitzte beim Ein- und Ausblenden der Leinwand ein Sprung auf.

   Ohne WebGL meldet ready() falsch, und die Seite wechselt weiterhin
   hart. */
(function () {
  'use strict';

  /* ---------- Regler ---------- */

  const CFG = {
    /* melt, ripple, shear oder swirl */
    transition: 'melt',
    /* Wie lange der Übergang läuft, in Sekunden. Die Vorlage nimmt 1.1;
       beim Blättern durch Figuren ist das eine Spur zäh, weil hier nicht
       ein Bild betrachtet, sondern gesucht wird. */
    duration: 0.9,
    /* Wie weit die Bilder dabei verzogen werden. */
    intensity: 0.55,
    /* Der Farbversatz an den Kanten der Verzerrung. */
    aberration: 0.35,
    /* Das langsame Wandern der ganzen Fläche während des Übergangs. */
    drift: 0.4,
    /* Wie klein das Rauschen von melt gekörnt ist. */
    scale: 2.4,
  };

  const MODES = { melt: 0, ripple: 1, shear: 2, swirl: 3 };

  /* Wie viele Bilder je Kanal auf der Grafikkarte liegen bleiben. Ein
     Porträt belegt rund ein Megabyte, ein Ganzkörperbild mehr; wer durch
     alle Figuren blättert, füllte sonst den Speicher mit Bildern, die
     längst hinter ihm liegen. */
  const CACHE = 14;

  const reduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  /* ---------- Shader ---------- */

  const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

  const FRAG = `
precision highp float;

uniform sampler2D tFrom;
uniform sampler2D tTo;
/* Wo die beiden Bilder im Rahmen liegen: linke untere Ecke und Maß,
   beides als Anteil der Fläche. Gemessen wird das am Bild selbst, siehe
   boxOf. Die Kopie der Leinwand, mit der ein zweiter Klick mitten im
   Übergang anknüpft, deckt sie ganz und trägt deshalb (0, 0, 1, 1). */
uniform vec4 uFromBox;
uniform vec4 uToBox;
uniform float uProgress;
uniform float uDir;
uniform int uMode;
uniform float uIntensity;
uniform float uScale;
uniform float uAberration;
uniform float uDrift;
uniform float uTime;
uniform float uReduce;
uniform vec2 uOrigin;

varying vec2 vUv;

const float PI = 3.14159265359;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

/* Ein Punkt der Fläche, umgerechnet auf die Fläche eines der beiden
   Bilder. Was daneben liegt, bleibt leer, statt den Rand zu strecken. */
vec4 pick(sampler2D tex, vec2 uv, vec4 box) {
  vec2 st = (uv - box.xy) / box.zw;
  if (st.x < 0.0 || st.x > 1.0 || st.y < 0.0 || st.y > 1.0) return vec4(0.0);
  return texture2D(tex, st);
}

/* Der Farbversatz greift die Deckung dreifach ab und mittelt sie: Rot,
   Grün und Blau kommen von drei Stellen, und wo eine davon schon im
   Freien liegt, deckt der Punkt eben weniger.

   Die Klemme am Ende ist die eigentliche Arbeit. Die Farben liegen
   vorgewichtet vor, ein Kanal darf also nie über der Deckung stehen.
   Ohne sie bekam ein Punkt am Rand des freigestellten Bildes die volle
   Farbe eines einzigen Kanals bei fast keiner Deckung, und die Umrisse
   der Figur zogen leuchtende Neonränder nach. */
vec4 chroma(sampler2D tex, vec2 uv, vec4 box, float ca) {
  vec4 mid = pick(tex, uv, box);
  if (ca <= 0.0) return mid;
  vec4 lo = pick(tex, uv + vec2(ca, 0.0), box);
  vec4 hi = pick(tex, uv - vec2(ca, 0.0), box);
  float a = (lo.a + mid.a + hi.a) / 3.0;
  return vec4(min(vec3(lo.r, mid.g, hi.b), vec3(a)), a);
}

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  /* Die Glocke über dem Übergang: null am Anfang, null am Ende, eins in
     der Mitte. Alles, was das Bild verzieht, hängt daran. */
  float env = sin(p * PI);

  vec2 uv = vUv;
  float ca = 0.0;
  float m = p;

  if (uReduce < 0.5) {
    uv += vec2(sin(uTime * 0.25 + uv.y * 4.0), cos(uTime * 0.22 + uv.x * 4.0))
      * uDrift * 0.01 * env;
    /* Der Versatz misst sich an der Breite der Fläche. Ein Prozent, wie
       es die Vorlage für Landschaftsbilder nimmt, sind hier sechs Punkte
       quer über ein Gesicht und damit zu viel. */
    ca = uAberration * env * 0.018;
  }

  vec2 uvF = uv;
  vec2 uvT = uv;

  if (uReduce < 0.5) {
    if (uMode == 3) {
      vec2 c = uv - 0.5;
      float r = length(c);
      float ang = env * uIntensity * 2.6 * (1.0 - r) * uDir;
      uvF = rot(ang) * c + 0.5;
      uvT = rot(-ang) * c + 0.5;
      m = smoothstep(0.0, 1.0, p);
    } else if (uMode == 1) {
      float d = distance(uv, uOrigin);
      float ring = p * 1.7 - 0.08;
      float wave = sin((d - ring) * 26.0) * env;
      vec2 dir = normalize(uv - uOrigin + 1e-4);
      vec2 disp = dir * wave * uIntensity * 0.2;
      uvF = uv + disp;
      uvT = uv + disp * 0.6;
      m = 1.0 - smoothstep(ring - 0.06, ring + 0.06, d);
    } else if (uMode == 2) {
      float slices = 14.0;
      float row = floor(uv.y * slices);
      float rnd = hash11(row);
      vec2 disp = vec2((rnd - 0.5) * env * uIntensity * 0.5, 0.0);
      uvF = uv + disp;
      uvT = uv + disp;
      float localX = uDir > 0.0 ? uv.x : 1.0 - uv.x;
      float th = p * 1.5 - 0.25 + (rnd - 0.5) * 0.25;
      m = 1.0 - smoothstep(th - 0.06, th + 0.06, localX);
    } else {
      float nn = fbm(uv * uScale + uTime * 0.03);
      float warp = fbm(uv * uScale * 1.7 - uTime * 0.02);
      vec2 g = vec2(nn, warp) - 0.5;
      uvF = uv + g * uIntensity * 0.4 * env;
      uvT = uv - g * uIntensity * 0.4 * env;
      /* Der Zerfall der Fläche über die Zeit. Der Anteil des Rauschens
         an der Zeitachse ist begrenzt, damit bei 0 wirklich noch nichts
         und bei 1 wirklich alles gewechselt hat. */
      float w = 0.55;
      float start = nn * w;
      m = smoothstep(start, start + (1.0 - w), p);
    }
  }

  vec4 colF = chroma(tFrom, uvF, uFromBox, ca);
  vec4 colT = chroma(tTo, uvT, uToBox, ca);

  gl_FragColor = mix(colF, colT, m);
}
`;

  /* ---------- Wo ein Bild in seinem Rahmen liegt ----------

     Zurück kommt die Fläche, die das Bild wirklich bedeckt, als Anteil
     der Rahmenfläche und von der linken unteren Ecke aus gezählt, weil
     die Textur so herum liegt.

     Gemessen und nicht gerechnet: Auf der Bühne füllt das Porträt seinen
     Rahmen und wird per object-fit eingepasst, auf der Erscheinungsbühne
     ist das <img> selbst so groß wie das Bild und trägt sein Maß aus
     Körpergröße, Zuschnitt und Schwebe. Beides hier nachzurechnen hieße,
     das halbe Stylesheet ein zweites Mal zu schreiben. */
  function boxOf(img, host) {
    if (!img || !host) return null;
    const hb = host.getBoundingClientRect();
    const ib = img.getBoundingClientRect();
    if (!hb.width || !hb.height || !ib.width || !ib.height) return null;

    const nw = img.naturalWidth || ib.width;
    const nh = img.naturalHeight || ib.height;
    const style = getComputedStyle(img);
    const fit = style.objectFit || 'fill';

    /* Die gezeichnete Fläche innerhalb des Kastens, den das Bild im
       Layout einnimmt. Bei fill sind beide dasselbe. */
    let dw = ib.width;
    let dh = ib.height;
    if (fit === 'contain' || fit === 'cover' || fit === 'scale-down') {
      const raw = fit === 'cover'
        ? Math.max(ib.width / nw, ib.height / nh)
        : Math.min(ib.width / nw, ib.height / nh);
      const s = fit === 'scale-down' ? Math.min(1, raw) : raw;
      dw = nw * s;
      dh = nh * s;
    } else if (fit === 'none') {
      dw = nw;
      dh = nh;
    }

    const pos = String(style.objectPosition || '50% 50%').split(/\s+/);
    const share = (raw, span, fallback) => {
      if (!raw) return fallback;
      if (raw === 'left' || raw === 'top') return 0;
      if (raw === 'right' || raw === 'bottom') return 1;
      if (raw === 'center') return 0.5;
      const n = parseFloat(raw);
      if (!isFinite(n)) return fallback;
      if (raw.indexOf('%') !== -1) return n / 100;
      return span ? n / span : fallback;
    };
    const left = ib.left + (ib.width - dw) * share(pos[0], ib.width - dw, 0.5);
    const top = ib.top + (ib.height - dh) * share(pos[1], ib.height - dh, 0.5);

    return {
      x: (left - hb.left) / hb.width,
      y: (hb.bottom - top - dh) / hb.height,
      w: dw / hb.width,
      h: dh / hb.height,
    };
  }

  /* Die ganze Fläche, für die eingefrorene Kopie der Leinwand. */
  const FULL = { x: 0, y: 0, w: 1, h: 1 };

  /* power2.inOut aus der Vorlage, also eine kubische Kurve. */
  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* ---------- Ein Kanal ----------

     Eine Leinwand, ein Kontext, ein Vorrat an Texturen. Der Rahmen, über
     dem die Leinwand liegt, wechselt mit jedem Aufruf, die Leinwand
     selbst bleibt. */
  function makeChannel(name) {
    const local = {};
    let gl = null;
    let canvas = null;
    let prog = null;
    const uni = {};
    let dead = false;

    const texByFile = new Map();
    const loading = new Map();
    let screenTex = null;

    let frame = null;    // Rahmen, in dem die Leinwand gerade liegt
    let raf = 0;
    let run = null;      // der laufende Übergang
    let frozen = false;  // sein Bild steht noch als Textur bereit
    let ticket = 0;

    function opt(key) {
      return local[key] !== undefined ? local[key] : CFG[key];
    }

    function start() {
      if (gl || dead) return !!gl;
      canvas = document.createElement('canvas');
      canvas.className = 'char-morph char-morph--' + name;
      canvas.setAttribute('aria-hidden', 'true');
      gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        /* Der laufende Übergang wird beim Weiterblättern von der Leinwand
           selbst abgelesen, und dafür muss ihr Inhalt stehen bleiben. */
        preserveDrawingBuffer: true,
        premultipliedAlpha: true,
        powerPreference: 'low-power',
      });
      if (!gl) {
        dead = true;
        canvas = null;
        return false;
      }

      canvas.addEventListener('webglcontextlost', e => {
        /* Ohne das Abfangen käme der Kontext nie zurück; zurückgeholt
           wird er trotzdem nicht. Ein verlorener Kontext heißt hier: ab
           jetzt wieder hart wechseln. */
        e.preventDefault();
        dead = true;
        run = null;
        if (frame) frame.classList.remove('morphing');
      });

      prog = build(VERT, FRAG);
      if (!prog) {
        dead = true;
        return false;
      }
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      for (const key of ['tFrom', 'tTo', 'uFromBox', 'uToBox', 'uProgress', 'uDir',
        'uMode', 'uIntensity', 'uScale', 'uAberration', 'uDrift', 'uTime',
        'uReduce', 'uOrigin']) {
        uni[key] = gl.getUniformLocation(prog, key);
      }
      gl.uniform1i(uni.tFrom, 0);
      gl.uniform1i(uni.tTo, 1);

      /* Die Bilder liegen mit vorgewichteter Deckung in den Texturen,
         deshalb ONE statt SRC_ALPHA: Sonst bekämen die weichen Kanten
         einen dunklen Saum. */
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      screenTex = blank();
      return true;
    }

    function build(vsrc, fsrc) {
      const vs = compile(gl.VERTEX_SHADER, vsrc);
      const fs = compile(gl.FRAGMENT_SHADER, fsrc);
      if (!vs || !fs) return null;
      const p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.warn('Bildübergang:', gl.getProgramInfoLog(p));
        return null;
      }
      return p;
    }

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn('Bildübergang:', gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }

    function setParams() {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    /* Zieht eine Textur auf das Maß der Fläche, auf der sie landet.

       Ein Ganzkörperbild bringt rund tausend Zeilen mit und steht auf der
       Bühne in der Hälfte davon. Der Shader liest daraus vier Punkte je
       Bildpunkt, der Browser daneben verkleinert dieselbe Datei mit einem
       weit besseren Verfahren, und der Unterschied fällt genau dort auf,
       wo er nicht auffallen darf: beim Ein- und Ausblenden der Leinwand.
       Also wird schon beim Hochladen verkleinert, und zwar von demselben
       Browser, der es nebenan auch tut.

       Vergrößert wird dabei nie. Die Porträts sind kleiner als die Fläche,
       auf der sie stehen, und bleiben deshalb, wie sie sind. */
    function fitTexture(entry, wPx, hPx) {
      if (!entry || !entry.img) return entry;
      const w = Math.max(1, Math.round(wPx));
      const h = Math.max(1, Math.round(hPx));
      /* Etwas Luft, damit ein Fenster, das um ein paar Punkte wächst,
         nicht jedes Mal alles neu zeichnen lässt. */
      if (entry.tw <= w * 1.15 && entry.th <= h * 1.15) return entry;
      const shrink = document.createElement('canvas');
      shrink.width = Math.min(w, entry.tw);
      shrink.height = Math.min(h, entry.th);
      const ctx = shrink.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(entry.img, 0, 0, shrink.width, shrink.height);
      gl.bindTexture(gl.TEXTURE_2D, entry.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shrink);
      setParams();
      entry.tw = shrink.width;
      entry.th = shrink.height;
      return entry;
    }

    function blank() {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 0]));
      setParams();
      return tex;
    }

    /* Lädt ein Bild und legt es als Textur ab. Was schon liegt, kommt
       sofort zurück; was gerade lädt, hängt sich an denselben Versuch. */
    function texture(src) {
      if (!src) return Promise.resolve(null);
      const have = texByFile.get(src);
      if (have) {
        /* Neu einsortieren, damit das Aufräumen unten die wirklich alten
           Bilder trifft. */
        texByFile.delete(src);
        texByFile.set(src, have);
        return Promise.resolve(have);
      }
      if (loading.has(src)) return loading.get(src);

      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      const done = (typeof img.decode === 'function' ? img.decode()
        : new Promise((ok, no) => {
          img.addEventListener('load', ok);
          img.addEventListener('error', no);
        }))
        .then(() => {
          loading.delete(src);
          if (!gl || dead) return null;
          const tex = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          setParams();
          /* Das Bild bleibt am Eintrag hängen: Steht später fest, wie
             groß es wirklich gezeigt wird, wird die Textur daraus neu
             gezeichnet (siehe fitTexture). */
          const entry = {
            tex,
            img,
            tw: img.naturalWidth || 1,
            th: img.naturalHeight || 1,
          };
          texByFile.set(src, entry);
          prune();
          return entry;
        }, () => {
          loading.delete(src);
          return null;
        });
      loading.set(src, done);
      return done;
    }

    function prune() {
      while (texByFile.size > CACHE) {
        const oldest = texByFile.keys().next().value;
        const entry = texByFile.get(oldest);
        texByFile.delete(oldest);
        if (entry && entry.tex) gl.deleteTexture(entry.tex);
      }
    }

    function size() {
      if (!frame) return;
      const box = frame.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(Math.round(box.width * dpr), 1);
      const h = Math.max(Math.round(box.height * dpr), 1);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function draw(now) {
      if (!run) return;
      gl.uniform1f(uni.uTime, now * 0.001);
      gl.uniform1f(uni.uProgress, run.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, run.from ? run.from.tex : screenTex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, run.to.tex);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function tick(now) {
      if (!run) return;
      if (!run.t0) run.t0 = now;
      const span = Math.max(run.duration, 0.05) * 1000;
      const raw = Math.min((now - run.t0) / span, 1);
      run.p = ease(raw);
      draw(now);
      /* Wer mitläuft, bekommt denselben Stand wie die Leinwand, und zwar
         im selben Bild: Ein Schatten, der seiner Figur um ein Bild
         hinterherhinkt, fällt bei einer schnellen Bewegung auf. */
      if (run.hooks && run.hooks.frame) run.hooks.frame(run.p);
      if (raw < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const done = run;
      run = null;
      raf = 0;
      if (frame) frame.classList.remove('morphing');
      if (done.hooks && done.hooks.end) done.hooks.end(true);
      if (done.resolve) done.resolve();
    }

    /* Hält den laufenden Übergang an und friert sein Bild als Textur
       ein. Ob daran jemand anknüpft, entscheidet der nächste Zug: Kommt
       sofort ein neuer Übergang, fängt er bei diesem Bild an, kommt
       keiner, ist die Sache erledigt.

       Die Frist dafür ist ein Einzelbild. Alles, was zum selben Klick
       gehört, läuft noch davor ab; was später kommt, gehört zu einem
       anderen Vorgang und fängt sauber neu an. */
    function freeze() {
      if (!run) return;
      draw(performance.now());
      gl.bindTexture(gl.TEXTURE_2D, screenTex);
      gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, canvas.width, canvas.height, 0);
      setParams();
      cancelAnimationFrame(raf);
      raf = 0;
      const held = run;
      run = null;
      frozen = true;
      requestAnimationFrame(() => { frozen = false; });
      /* Wer mitlief, räumt auf, bevor ein neuer Übergang ihn womöglich
         gleich wieder in Dienst nimmt. */
      if (held.hooks && held.hooks.end) held.hooks.end(false);
      if (held.resolve) held.resolve();
    }

    function boxUniform(where, box) {
      gl.uniform4f(uni[where], box.x, box.y, box.w, box.h);
    }

    return {
      name,

      /* Ob überhaupt gemorpht werden kann. Erst der Aufruf legt die
         Leinwand an: Wer nie blättert, zahlt auch nichts dafür. */
      ready() {
        return start() && !dead;
      },

      /* Ein Bild im Voraus auf die Grafikkarte holen, damit der Klick
         nicht auf das Laden wartet. Zurück kommt ein Versprechen, das
         hält, sobald die Textur liegt: Wer den Übergang selbst auslöst,
         kann darauf warten, statt ihn zu früh zu beginnen. */
      preload(src) {
        if (!src || !this.ready()) return Promise.resolve(null);
        return texture(src);
      },

      /* Ob ein Bild schon als Textur bereitliegt. Wer erst laden müsste,
         bekäme den Übergang um Sekundenbruchteile verspätet und damit
         einen Sprung zurück auf das alte Bild; dann ist der harte
         Wechsel das bessere Bild. */
      hot(src) {
        return !!src && !dead && texByFile.has(src);
      },

      /* Hält an, was gerade läuft, und gibt das Bild wieder frei. Der
         Rahmen ruft das, bevor er neu gefüllt wird: Danach ist die
         Leinwand aus dem Baum, und ein Übergang, der weiterliefe, hielte
         nur noch das neue Bild verborgen.

         Das eingefrorene Bild bleibt dabei einen Augenblick stehen.
         Folgt gleich darauf ein neuer Übergang, macht er dort weiter. */
      stop() {
        if (!gl || dead) return;
        freeze();
        if (frame) frame.classList.remove('morphing');
      },

      set(next) {
        Object.assign(local, next || {});
        return this.get();
      },

      get() {
        const out = {};
        for (const key in CFG) out[key] = opt(key);
        return out;
      },

      /* Blendet im Rahmen host von einem Bild auf das andere.

         from und to sind jeweils { src, box }: die Datei und die Fläche,
         die sie im Rahmen einnimmt (siehe boxOf). Ohne box deckt das
         Bild den ganzen Rahmen. dir sagt, in welche Richtung geblättert
         wurde, und dreht Welle, Streifen und Wirbel entsprechend.

         Zurück kommt ein Versprechen, das hält, sobald wieder das <img>
         im Bild steht. Ist der Übergang nicht möglich, hält es sofort,
         und an der Seite hat sich nichts verändert. */
      play(host, from, to, dir, hooks) {
        if (!host || !from || !to || !from.src || !to.src) return Promise.resolve();
        if (from.src === to.src) return Promise.resolve();
        if (!this.ready()) return Promise.resolve();

        const mine = ++ticket;
        /* Läuft oder stand gerade einer, dient sein eingefrorenes Bild
           als Ausgangsbild des neuen: Wer zweimal schnell blättert,
           sieht die Kette und nicht zweimal denselben Anfang. */
        freeze();
        const chain = frozen;
        /* Die Leinwand bleibt dabei im Bild, und zwar sofort und nicht
           erst mit dem geladenen Bild: Sonst stünde für einen Augenblick
           das schon gewechselte Bild da. */
        if (chain && frame) frame.classList.add('morphing');

        const wanted = chain ? Promise.resolve(null) : texture(from.src);
        return Promise.all([wanted, texture(to.src)]).then(pair => {
          const before = pair[0];
          const after = pair[1];
          if (mine !== ticket) return undefined;
          if (dead || !after || (!chain && !before)) {
            if (chain && frame) frame.classList.remove('morphing');
            return undefined;
          }

          if (canvas.parentNode !== host) host.appendChild(canvas);
          frame = host;
          size();

          const fromBox = chain ? FULL : (from.box || FULL);
          const toBox = to.box || FULL;
          /* Erst jetzt steht fest, auf wie vielen Punkten die beiden
             Bilder landen, und erst jetzt lässt sich die Textur darauf
             zuschneiden. */
          if (!chain) fitTexture(before, fromBox.w * canvas.width, fromBox.h * canvas.height);
          fitTexture(after, toBox.w * canvas.width, toBox.h * canvas.height);

          boxUniform('uFromBox', fromBox);
          boxUniform('uToBox', toBox);
          gl.uniform1f(uni.uDir, dir < 0 ? -1 : 1);
          gl.uniform1i(uni.uMode, MODES[opt('transition')] || 0);
          gl.uniform1f(uni.uIntensity, opt('intensity'));
          gl.uniform1f(uni.uScale, opt('scale'));
          gl.uniform1f(uni.uAberration, opt('aberration'));
          gl.uniform1f(uni.uDrift, opt('drift'));
          gl.uniform1f(uni.uReduce, reduced && reduced.matches ? 1 : 0);
          /* Die Welle kommt von der Seite, aus der geblättert wurde, und
             läuft auf Kopfhöhe herein statt aus der Bildmitte. */
          gl.uniform2f(uni.uOrigin, dir < 0 ? 0.1 : 0.9, 0.62);

          const slow = reduced && reduced.matches
            ? Math.min(opt('duration'), 0.4) : opt('duration');
          host.classList.add('morphing');

          return new Promise(resolve => {
            run = {
              from: chain ? null : before, to: after, duration: slow,
              p: 0, t0: 0, resolve, hooks,
            };
            /* Wer mitläuft, fängt im selben Bild an wie die Leinwand. Erst
               hier und nicht beim Aufruf: Kommt der Übergang gar nicht
               zustande, weil ein Bild fehlt, soll auch der Mitläufer
               nichts anfassen. */
            if (hooks && hooks.start) hooks.start();
            /* Der erste Strich noch im selben Bild wie der Klick: Sonst
               stünde für einen Augenblick eine leere Leinwand über dem
               gerade versteckten Bild. */
            draw(performance.now());
            raf = requestAnimationFrame(tick);
          });
        });
      },
    };
  }

  /* ---------- Nach außen ---------- */

  const channels = new Map();

  window.PortraitMorph = {
    /* Der Kanal zu einer der beiden Stellen: 'hero' für das Porträt auf
       der Bühne, 'stage' für das Ganzkörperbild der Erscheinungsbühne.
       Ein neuer Name legt einen neuen Kanal an. */
    channel(name) {
      let one = channels.get(name);
      if (!one) {
        one = makeChannel(name);
        channels.set(name, one);
      }
      return one;
    },

    /* Die Fläche eines Bildes in seinem Rahmen, für play(). */
    boxOf,

    /* Die Vorgaben für alle Kanäle. Was ein Kanal selbst gesetzt hat,
       behält er. */
    set(next) {
      Object.assign(CFG, next || {});
      return Object.assign({}, CFG);
    },

    get() {
      return Object.assign({}, CFG);
    },
  };
})();
