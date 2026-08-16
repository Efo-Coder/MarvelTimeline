/* Animierter Galaxie-Hintergrund auf einem WebGL2-Canvas.

   Aufbau von unten nach oben, genau wie in der früheren Canvas-Fassung:
   ein gemaltes Grundbild, zwei prozedural erzeugte Nebelfelder, der
   Phasenschleier, die pulsierende Sonne links oben, ein feines
   Sternenfeld, die hellen Sterne mit Funkeln, gelegentliche
   Sternschnuppen und zuletzt drei abdunkelnde Verläufe.

   Der Unterschied zur alten Fassung liegt nicht im Ergebnis, sondern
   darin, wer rechnet. Bisher lief jede Schicht durch die 2D-Schnittstelle
   des Canvas: Das Nebelbild entstand Punkt für Punkt auf der CPU und
   kostete beim Seitenaufbau eine halbe Sekunde, das Zusammenlegen der
   Schichten ging über globalCompositeOperation. Hier backt die GPU
   dasselbe Rauschen in einem Durchgang, und alle Schichten kommen pro
   Bildpunkt in einem Shader zusammen.

   Damit steht jeder Wert als Regler zur Verfügung statt als fest
   gezeichnete Eigenschaft. Die Regler stehen in js/galaxy-config.js und
   lassen sich zur Laufzeit ändern:

     Galaxy.set({ nebWarp: 0.35, bgTint: 0.8, timeScale: 0.5 })
     Galaxy.setRegions([{ x: 0.1, col: [200, 40, 90] }, ...])
     Galaxy.get()

   bgTint ist dabei der eigentliche Gewinn: Es trennt Struktur und Farbe
   im gemalten Grundbild. Bei 0 behält das Bild seine eigenen Farben, bei
   1 wird nur noch seine Helligkeit als Dichte gelesen und die Farbe kommt
   vollständig aus der Palette der gerade sichtbaren Phase. Der alte
   Schleier konnte die gemalten Farben nur anhauchen, das hier färbt sie
   wirklich um.

   Die Schnittstelle nach außen bleibt unverändert: main.js und
   characters.js melden über Galaxy.setPalette(...) die Akzentfarben der
   gerade sichtbaren Phase, sonst wissen sie von alldem nichts.

   Kann der Browser kein WebGL2, übernimmt js/galaxy-canvas-2d.js. */
(function () {
  'use strict';

  const canvas = document.getElementById('galaxy');
  if (!canvas) return;

  const CFG = window.GALAXY_CONFIG;
  const FIX = window.GALAXY_FIXED;

  /* Zum Prüfen der Rückfallebene, die sonst in keinem heutigen Browser
     mehr anspringt: window.GALAXY_FORCE_CANVAS2D = true vor dem Laden
     dieser Datei setzen. */
  const gl = window.GALAXY_FORCE_CANVAS2D ? null : canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: !!window.GALAXY_DEBUG,
  });

  if (!gl) {
    window.Galaxy = window.GalaxyCanvas2D.start(canvas) || { setPalette: function () {} };
    return;
  }

  /* ---------------------------------------------------------------- */
  /* Shader                                                            */
  /* ---------------------------------------------------------------- */

  /* Ein einziges Dreieck, das über den ganzen Schirm hinausragt. Billiger
     als zwei Dreiecke für ein Rechteck, weil die Naht in der Mitte
     entfällt, und es braucht keinen Puffer: Die drei Ecken fallen aus der
     laufenden Nummer der Ecke. */
  const VS_FULL = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

  /* Das Rauschen der Vorlage, Zeile für Zeile übersetzt. hash ist derselbe
     ganzzahlige Mischer wie in JavaScript: Math.imul rechnet modulo 2^32,
     genau das tut uint in GLSL auch, und >>> entspricht dem Schieben eines
     uint. Aus denselben Koordinaten fällt deshalb derselbe Wert wie
     vorher, das Nebelbild ist dasselbe und nur feiner aufgelöst. */
  const NOISE = `
float hash(int x, int y, int s) {
  uint h = uint(x) * 0x27d4eb2du ^ uint(y) * 0x165667b1u ^ uint(s) * 0x9e3779b1u;
  h = (h ^ (h >> 15u)) * 0x85ebca6bu;
  h ^= h >> 13u;
  return float(h) / 4294967295.0;
}

float vnoise(vec2 p, int s) {
  vec2 fl = floor(p);
  vec2 f = p - fl;
  vec2 u = f * f * (3.0 - 2.0 * f);
  int xi = int(fl.x), yi = int(fl.y);
  float a = hash(xi,     yi,     s);
  float b = hash(xi + 1, yi,     s);
  float c = hash(xi,     yi + 1, s);
  float d = hash(xi + 1, yi + 1, s);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, int s, int oct, float rough) {
  float f = 1.0, a = 0.5, sum = 0.0, norm = 0.0;
  for (int i = 0; i < 10; i++) {
    if (i >= oct) break;
    sum += a * vnoise(p * f, s + i * 37);
    norm += a; f *= 2.0; a *= rough;
  }
  return sum / norm;
}`;

  /* Das Nebelbild. Sechs Bereiche, jeder trägt dort bei, wo er reicht,
     gedämpft nach außen und durchzogen vom Rauschen. ridged klappt das
     Rauschen an seiner Mitte nach oben und macht aus weichen Hügeln
     scharfe Grate, daraus entstehen die fasrigen Schlieren.

     Das Ergebnis wird vormultipliziert abgelegt, also Farbe schon mit der
     Deckkraft verrechnet. Beim Zeichnen ist der Beitrag dann eine reine
     Addition und das bilineare Filtern beim Vergrößern rechnet mit den
     Werten, die es auch addieren wird. */
  const FS_BAKE = `#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform vec2 uSize;
uniform int uSeed;
uniform int uOctaves;
uniform float uWarp;
uniform float uRough;
uniform vec4 uRegPos[6];
uniform vec4 uRegCol[6];
uniform vec2 uRegShape[6];
${NOISE}
void main() {
  vec2 nuv = (gl_FragCoord.xy - 0.5) / uSize;
  vec3 c = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    vec4 pos = uRegPos[i];
    vec2 d = (nuv - pos.xy) / pos.zw;
    float dist = length(d);
    if (dist >= 1.0) continue;
    float fall = pow(1.0 - dist, 1.8);
    float sc = uRegShape[i].x;
    vec2 q = vec2(nuv.x * sc * 1.4, nuv.y * sc);
    if (uWarp > 0.0) {
      /* Domain-Verzerrung: Das Rauschen fragt sich selbst nach der
         Stelle, an der es abgelesen wird. Aus runden Wolken werden
         dadurch gezogene, wirbelnde Schwaden. */
      float wx = fbm(q + vec2(1.7, 9.2), uSeed + i * 31 + 991, uOctaves, uRough);
      float wy = fbm(q + vec2(8.3, 2.8), uSeed + i * 31 + 1777, uOctaves, uRough);
      q += uWarp * (vec2(wx, wy) * 2.0 - 1.0);
    }
    float n = fbm(q, uSeed + i * 31, uOctaves, uRough);
    n = uRegShape[i].y > 0.5 ? pow(1.0 - abs(n * 2.0 - 1.0), 2.3) : pow(n, 1.7);
    float a = fall * n * uRegCol[i].w;
    c += uRegCol[i].xyz * a;
  }
  c = min(c, vec3(1.0));
  float alpha = min(1.0, max(max(c.r, c.g), c.b) * 1.2);
  fragColor = vec4(c * alpha, alpha);
}`;

  /* Grundbild, Nebel, Phasenschleier und Sonne in einem Durchgang. Alles
     hier ist deckend, deshalb läuft der Pass ohne Blending und
     überschreibt einfach den Schirm. */
  const FS_SKY = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uPix;
uniform float uDpr;
uniform sampler2D uBg, uNeb1, uNeb2;
uniform float uBgHas;
uniform vec4 uBgRect, uNeb1Rect, uNeb2Rect;
uniform vec2 uNebAlpha;
uniform vec3 uPalette[6];
uniform float uTint, uBgTint;
uniform vec4 uSun;

const vec3 LUM = vec3(0.2126, 0.7152, 0.0722);

/* Verlauf über die Bildschirmdiagonale, ein Halt je Farbplatz. Bei einer
   Phase sind das ihre drei Akzente, am Seitenanfang alle sechs. */
vec3 paletteAt(vec2 p, vec2 css) {
  float t = clamp(dot(p, css) / max(dot(css, css), 1.0), 0.0, 1.0) * 5.0;
  int i = min(int(floor(t)), 4);
  return mix(uPalette[i], uPalette[i + 1], t - float(i));
}

/* Die Mischform "overlay" aus der Canvas-Vorlage. Sie behält die
   Helligkeitsstruktur des Bildes und dreht nur den Farbton. */
vec3 overlayBlend(vec3 base, vec3 blend) {
  return mix(2.0 * base * blend,
             1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
             step(vec3(0.5), base));
}

void main() {
  vec2 css = uPix / uDpr;
  vec2 p = vec2(gl_FragCoord.x, uPix.y - gl_FragCoord.y) / uDpr;
  vec3 grad = paletteAt(p, css);

  vec3 col = vec3(3.0, 3.0, 10.0) / 255.0;

  if (uBgHas > 0.5) {
    vec2 uv = (p - uBgRect.xy) / uBgRect.zw;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
      vec4 s = texture(uBg, uv);
      vec3 painted = s.rgb;
      if (uBgTint > 0.0) {
        /* Struktur und Farbe trennen: Die Helligkeit des gemalten Punkts
           bleibt genau erhalten, seine Farbe wird durch die der Palette
           ersetzt. Deshalb das Teilen durch die Helligkeit der neuen
           Farbe, sonst würde ein dunkler Akzent das ganze Bild absaufen
           lassen. */
        float lum = dot(painted, LUM);
        vec3 recol = min(grad * (lum / max(dot(grad, LUM), 0.02)), vec3(1.0));
        painted = mix(painted, recol, uBgTint);
      }
      col = mix(col, painted, s.a);
    }
  }

  vec2 n1 = (p - uNeb1Rect.xy) / uNeb1Rect.zw;
  vec2 n2 = (p - uNeb2Rect.xy) / uNeb2Rect.zw;
  if (n1.x >= 0.0 && n1.x <= 1.0 && n1.y >= 0.0 && n1.y <= 1.0)
    col += texture(uNeb1, n1).rgb * uNebAlpha.x;
  if (n2.x >= 0.0 && n2.x <= 1.0 && n2.y >= 0.0 && n2.y <= 1.0)
    col += texture(uNeb2, n2).rgb * uNebAlpha.y;

  /* Der Phasenschleier liegt über Grundbild und Nebel, aber noch vor
     Sonne und Sternen, damit die Sonne golden und die Sterne weiß
     bleiben. Ein additiver Schleier täte das nicht: Der würde die
     Schwärze zwischen den Sternen mit aufhellen und das Bild flau
     machen. */
  if (uTint > 0.0) col = mix(col, overlayBlend(col, grad), uTint);

  if (uSun.z > 0.0) {
    float d = distance(p, uSun.xy);
    if (d < uSun.z) {
      float t = d / uSun.z;
      float pulse = uSun.w;
      /* Farbhalte des Verlaufs, schon vormultipliziert. Canvas
         interpoliert Verläufe vormultipliziert, und additiv gezeichnet
         ist genau dieser Wert der Beitrag. */
      vec4 s0 = vec4(vec3(255.0, 243.0, 182.0) / 255.0, 1.0) * (0.26 + 0.16 * pulse);
      vec4 s1 = vec4(vec3(255.0, 214.0,  92.0) / 255.0, 1.0) * (0.13 + 0.09 * pulse);
      vec4 sun = t < 0.22 ? mix(s0, s1, t / 0.22)
                          : mix(s1, vec4(0.0), (t - 0.22) / 0.78);
      col += sun.rgb;
    }
  }

  fragColor = vec4(col, 1.0);
}`;

  /* Feine Sterne. Über dreitausend Stück, deshalb als eine einzige
     instanzierte Zeichnung: ein Viereck, dreitausend Versätze.

     Kreise unter einem halben Gerätepunkt Radius kann die Rasterung nicht
     mehr auflösen. Statt sie zu groß zu zeichnen bleibt ihre Fläche
     erhalten und die Deckkraft sinkt im gleichen Maß, sonst wären die
     kleinsten Sterne heller als die mittleren. */
  const VS_FAINT = `#version 300 es
in vec2 aCorner;
in vec2 aCenter;
in float aRad;
in vec4 aCol;
uniform vec2 uPix;
uniform float uDpr;
uniform vec2 uOfs;
uniform float uAlpha;
out vec4 vCol;
out vec2 vLocal;
out float vRad;
void main() {
  float r = aRad * uDpr;
  vec2 c = (aCenter + uOfs) * uDpr;
  vec2 d = (aCorner - 0.5) * 2.0 * (r + 1.0);
  vec2 pos = c + d;
  gl_Position = vec4(pos.x / uPix.x * 2.0 - 1.0, 1.0 - pos.y / uPix.y * 2.0, 0.0, 1.0);
  vLocal = d;
  vRad = r;
  vCol = vec4(aCol.rgb, aCol.a * uAlpha);
}`;

  /* Diese Sterne sind winzig, ihr Radius liegt zwischen 0,2 und 1,9
     Gerätepunkten. Bei solchen Größen entscheidet die Kantenglättung über
     die Helligkeit, nicht über die Form: Ein Kreis mit Radius 0,3 bedeckt
     nur 28 Prozent seines Bildpunkts und muss entsprechend blass
     herauskommen. Ein weicher Übergang per smoothstep trifft das nicht,
     der macht die kleinsten Sterne deutlich zu hell.

     Deshalb wird die Bedeckung wirklich ausgezählt: 64 Proben über den
     Bildpunkt verteilt, der Anteil innerhalb des Kreises ist die
     Deckkraft. Das ist auf zwei Stufen genau dasselbe, was die
     Kantenglättung des Canvas rechnet, und kostet bei ein paar tausend
     winzigen Vierecken nichts. */
  const FS_FAINT = `#version 300 es
precision highp float;
in vec4 vCol;
in vec2 vLocal;
in float vRad;
out vec4 fragColor;
void main() {
  float r2 = vRad * vRad;
  float cov = 0.0;
  for (int j = 0; j < 8; j++) {
    for (int i = 0; i < 8; i++) {
      vec2 o = vLocal + (vec2(float(i), float(j)) + 0.5) * 0.125 - 0.5;
      cov += step(dot(o, o), r2);
    }
  }
  if (cov <= 0.0) discard;
  float a = vCol.a * cov * 0.015625;
  fragColor = vec4(vCol.rgb * a, a);
}`;

  /* Helle Sterne. Die Vorlage zeichnet dafür ein 48 Punkte großes Bild mit
     weichem Halo und zieht es auf 5 bis 24 Punkte zusammen. Hier steht der
     Verlauf als Formel im Shader, das ist derselbe Verlauf ohne den Umweg
     über ein verkleinertes Bild und deshalb sauberer. */
  const VS_BRIGHT = `#version 300 es
in vec2 aCorner;
in vec2 aCenter;
in vec4 aStar;
in vec3 aCol;
uniform vec2 uPix;
uniform float uDpr;
uniform vec2 uOfs;
uniform float uTime;
uniform float uTwinkle;
out vec3 vCol;
out float vAlpha;
out vec2 vUnit;
void main() {
  float f = uTwinkle > 0.5 ? 0.5 + 0.5 * sin(uTime * aStar.w + aStar.z) : 0.8;
  float sz = aStar.x * (0.85 + 0.35 * f) * 11.0;
  vec2 c = (aCenter + uOfs) * uDpr;
  vec2 pos = c + (aCorner - 0.5) * sz * uDpr;
  gl_Position = vec4(pos.x / uPix.x * 2.0 - 1.0, 1.0 - pos.y / uPix.y * 2.0, 0.0, 1.0);
  vUnit = aCorner;
  vCol = aCol;
  vAlpha = min(1.0, aStar.y * (0.42 + 0.58 * f));
}`;

  const FS_BRIGHT = `#version 300 es
precision mediump float;
in vec3 vCol;
in float vAlpha;
in vec2 vUnit;
out vec4 fragColor;
void main() {
  float d = length(vUnit - 0.5) * 2.0;
  if (d >= 1.0) discard;
  float g = d < 0.14 ? mix(1.00, 0.55, d / 0.14)
          : d < 0.40 ? mix(0.55, 0.12, (d - 0.14) / 0.26)
                     : mix(0.12, 0.00, (d - 0.40) / 0.60);
  float a = g * vAlpha;
  fragColor = vec4(vCol * a, a);
}`;

  /* Sternschnuppen. Gleichzeitig sind es fast nie mehr als eine, deshalb
     kein eigener Puffer, sondern vier Plätze als Uniform und ein Pass, der
     nur läuft, wenn wirklich eine unterwegs ist. Der Strich entsteht aus
     dem Abstand zur Strecke, die runden Enden fallen dabei von selbst ab. */
  const FS_SHOTS = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uPix;
uniform float uDpr;
uniform int uShotN;
uniform vec4 uShotSeg[4];
uniform float uShotFade[4];
void main() {
  vec2 p = vec2(gl_FragCoord.x, uPix.y - gl_FragCoord.y) / uDpr;
  vec3 acc = vec3(0.0);
  float accA = 0.0;
  for (int i = 0; i < 4; i++) {
    if (i >= uShotN) break;
    vec2 h = uShotSeg[i].xy, tl = uShotSeg[i].zw;
    vec2 ab = tl - h, ap = p - h;
    float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
    float d = distance(p, h + ab * t);
    float cov = 1.0 - smoothstep(0.3, 1.3, d);
    if (cov <= 0.0) continue;
    float fade = uShotFade[i];
    vec4 s0 = vec4(1.0, 1.0, 1.0, 1.0) * (0.85 * fade);
    vec4 s1 = vec4(198.0 / 255.0, 214.0 / 255.0, 1.0, 1.0) * (0.25 * fade);
    vec4 g = t < 0.35 ? mix(s0, s1, t / 0.35)
                      : mix(s1, vec4(0.0), (t - 0.35) / 0.65);
    acc += g.rgb * cov;
    accA += g.a * cov;
  }
  if (accA <= 0.0) discard;
  fragColor = vec4(acc, accA);
}`;

  /* Die drei abdunkelnden Verläufe. In der Vorlage lagen sie als eigene
     Ebene über dem Canvas, hier gehören sie in dasselbe Bild, damit der
     Hintergrund eine einzige Schicht bleibt und die Seiten nichts davon
     wissen müssen. Der senkrechte nimmt Kopf und Fuß zurück, der runde
     dunkelt die Mitte ab, damit die Schrift darauf ruhig steht.

     Alle drei liegen normal übereinander, nicht additiv. Zusammengefasst
     ergibt sich daraus ein einziger vormultiplizierter Wert, den die
     Grafikkarte in einem Zug über das fertige Bild legt. */
  const FS_SCRIM = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uPix;
uniform float uDpr;

vec4 over(vec4 src, vec4 dst) {
  return vec4(src.rgb + dst.rgb * (1.0 - src.a), src.a + dst.a * (1.0 - src.a));
}

void main() {
  vec2 css = uPix / uDpr;
  vec2 p = vec2(gl_FragCoord.x, uPix.y - gl_FragCoord.y) / uDpr;
  vec3 sc = vec3(3.0, 3.0, 12.0) / 255.0;

  float r0 = min(css.x, css.y) * 0.2;
  float r1 = max(css.x, css.y) * 0.78;
  float dv = distance(p, css * 0.5);
  vec4 L1 = vec4(0.0, 0.0, 0.0, clamp((dv - r0) / max(r1 - r0, 1e-4), 0.0, 1.0) * 0.5);

  float y = p.y / css.y;
  float al = y < 0.22 ? mix(0.6, 0.0, y / 0.22)
           : y < 0.78 ? 0.0
                      : mix(0.0, 0.5, (y - 0.78) / 0.22);
  vec4 L2 = vec4(sc * al, al);

  vec2 e = (p - vec2(css.x * 0.5, css.y * 0.46)) / vec2(css.x * 0.62, css.y * 0.46);
  float de = length(e);
  float ar = de < 0.72 ? mix(0.55, 0.0, de / 0.72) : 0.0;
  vec4 L3 = vec4(sc * ar, ar);

  fragColor = over(L3, over(L2, L1));
}`;

  /* ---------------------------------------------------------------- */
  /* Kleinkram um die Grafikkarte herum                                */
  /* ---------------------------------------------------------------- */

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('Galaxy: Shader ließ sich nicht übersetzen\n' + gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  /* Übersetzt ein Programm und sammelt gleich alle Uniform-Adressen ein,
     damit später niemand mehr getUniformLocation im Bild aufruft. */
  function program(vsSrc, fsSrc) {
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('Galaxy: Programm ließ sich nicht binden\n' + gl.getProgramInfoLog(p));
      return null;
    }
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      const name = info.name.replace(/\[0\]$/, '');
      u[name] = gl.getUniformLocation(p, name);
    }
    return { id: p, u: u };
  }

  const progBake = program(VS_FULL, FS_BAKE);
  const progSky = program(VS_FULL, FS_SKY);
  const progFaint = program(VS_FAINT, FS_FAINT);
  const progBright = program(VS_BRIGHT, FS_BRIGHT);
  const progShots = program(VS_FULL, FS_SHOTS);
  const progScrim = program(VS_FULL, FS_SCRIM);

  if (!progBake || !progSky || !progFaint || !progBright || !progShots || !progScrim) {
    window.Galaxy = window.GalaxyCanvas2D.start(canvas) || { setPalette: function () {} };
    return;
  }

  function makeTexture(filter) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  const emptyVao = gl.createVertexArray();

  /* Ein Viereck von (0,0) bis (1,1), das sich alle Sterne teilen. Die
     Lage jedes einzelnen kommt aus den Instanzdaten daneben. */
  const cornerBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

  function attr(prog, name, size, stride, offset, divisor) {
    const loc = gl.getAttribLocation(prog.id, name);
    if (loc < 0) return;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
    gl.vertexAttribDivisor(loc, divisor);
  }

  const faintBuf = gl.createBuffer();
  const faintVao = gl.createVertexArray();
  gl.bindVertexArray(faintVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuf);
  attr(progFaint, 'aCorner', 2, 8, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, faintBuf);
  attr(progFaint, 'aCenter', 2, 28, 0, 1);
  attr(progFaint, 'aRad', 1, 28, 8, 1);
  attr(progFaint, 'aCol', 4, 28, 12, 1);

  const brightBuf = gl.createBuffer();
  const brightVao = gl.createVertexArray();
  gl.bindVertexArray(brightVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuf);
  attr(progBright, 'aCorner', 2, 8, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, brightBuf);
  attr(progBright, 'aCenter', 2, 36, 0, 1);
  attr(progBright, 'aStar', 4, 36, 8, 1);
  attr(progBright, 'aCol', 3, 36, 24, 1);
  gl.bindVertexArray(null);

  const bgTex = makeTexture(gl.LINEAR);
  const nebTex = [makeTexture(gl.LINEAR), makeTexture(gl.LINEAR)];
  const nebFbo = gl.createFramebuffer();

  /* ---------------------------------------------------------------- */
  /* Zustand                                                           */
  /* ---------------------------------------------------------------- */

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TINT_SLOTS = FIX.tintSlots;

  let W = 0, H = 0, dpr = 1;
  let faintN = 0, brightN = 0;
  let shots = [], nextShot = 3.2;
  let bgReady = false, bgW = 1, bgH = 1;
  let bgTexW = 0, bgTexH = 0;
  let nebSize = [1, 1];
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  const paletteBuf = new Float32Array(TINT_SLOTS * 3);
  const syncPixel = new Uint8Array(4);
  const shotSeg = new Float32Array(16);
  const shotFade = new Float32Array(4);

  let regions = window.GALAXY_REGIONS.map(r => Object.assign({}, r, { col: r.col.slice() }));

  function expandPalette(colors) {
    return Array.from({ length: TINT_SLOTS }, (_, i) =>
      colors[Math.floor(i * colors.length / TINT_SLOTS)].slice());
  }

  let current = expandPalette(typeof DEFAULT_NEBULA !== 'undefined' ? DEFAULT_NEBULA : FIX.fallback);
  let target = current.map(c => c.slice());

  /* Derselbe Zufallsgenerator wie in der Vorlage (mulberry32) und dieselben
     Startwerte. Nur so steht bei jedem Laden und bei jeder Größenänderung
     derselbe Himmel, und das Bild springt beim Skalieren nicht um. */
  function makeRandom(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let shootRandom = makeRandom(FIX.seedShoot);

  /* ---------------------------------------------------------------- */
  /* Nebelbild backen                                                  */
  /* ---------------------------------------------------------------- */

  const regPos = new Float32Array(24);
  const regCol = new Float32Array(24);
  const regShape = new Float32Array(12);

  function bakeNebulae() {
    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const f = Math.max(1, CFG.nebFactor);
    const w = Math.min(Math.round(FIX.nebW * f), maxTex);
    const h = Math.min(Math.round(FIX.nebH * f), maxTex);
    nebSize = [w, h];

    for (let i = 0; i < 6; i++) {
      const R = regions[i] || regions[regions.length - 1];
      regPos.set([R.x, R.y, R.rx, R.ry], i * 4);
      regCol.set([R.col[0] / 255, R.col[1] / 255, R.col[2] / 255, R.amp], i * 4);
      regShape.set([R.sc, R.ridged ? 1 : 0], i * 2);
    }

    gl.bindVertexArray(emptyVao);
    gl.useProgram(progBake.id);
    gl.disable(gl.BLEND);
    gl.uniform2f(progBake.u.uSize, w, h);
    gl.uniform1i(progBake.u.uOctaves, Math.max(1, Math.min(10, Math.round(CFG.nebOctaves))));
    gl.uniform1f(progBake.u.uWarp, CFG.nebWarp);
    gl.uniform1f(progBake.u.uRough, CFG.nebRoughness);
    gl.uniform4fv(progBake.u.uRegPos, regPos);
    gl.uniform4fv(progBake.u.uRegCol, regCol);
    gl.uniform2fv(progBake.u.uRegShape, regShape);

    gl.bindFramebuffer(gl.FRAMEBUFFER, nebFbo);
    gl.viewport(0, 0, w, h);
    const seeds = [FIX.seedNeb1, FIX.seedNeb2];
    for (let k = 0; k < 2; k++) {
      gl.bindTexture(gl.TEXTURE_2D, nebTex[k]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nebTex[k], 0);
      gl.uniform1i(progBake.u.uSeed, seeds[k]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindVertexArray(null);
  }

  /* ---------------------------------------------------------------- */
  /* Sternenfeld                                                       */
  /* ---------------------------------------------------------------- */

  /* Genau dieselbe Reihenfolge der Zufallszahlen wie in der Vorlage, sonst
     steht ein anderer Himmel. Die Werte wandern nur nicht mehr auf ein
     zweites Canvas, sondern direkt in die Instanzpuffer der Grafikkarte. */
  function buildStars() {
    if (!W || !H) return;
    const faintRandom = makeRandom(FIX.seedFaint);
    const brightRandom = makeRandom(FIX.seedBright);
    const m = FIX.starMargin;
    const area = (W * H) / (1440 * 900);
    const scale = Math.max(0.4, area) * CFG.starDensity;

    faintN = Math.round(1100 * scale * CFG.faintDensity);
    const fd = new Float32Array(faintN * 7);
    for (let i = 0; i < faintN; i++) {
      const t = faintRandom();
      const col = t < 0.72 ? [1, 1, 1]
        : (t < 0.88 ? [196 / 255, 212 / 255, 1] : [1, 232 / 255, 196 / 255]);
      const a = 0.16 + faintRandom() * 0.5;
      const x = faintRandom() * (W + 2 * m);
      const y = faintRandom() * (H + 2 * m);
      const r = 0.2 + faintRandom() * 0.75;
      const o = i * 7;
      fd[o] = x - m; fd[o + 1] = y - m; fd[o + 2] = r;
      fd[o + 3] = col[0]; fd[o + 4] = col[1]; fd[o + 5] = col[2]; fd[o + 6] = a;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, faintBuf);
    gl.bufferData(gl.ARRAY_BUFFER, fd, gl.STATIC_DRAW);

    brightN = Math.round(120 * scale * CFG.brightDensity);
    const bd = new Float32Array(brightN * 9);
    for (let i = 0; i < brightN; i++) {
      const t = brightRandom();
      const col = t < 0.72 ? [1, 1, 1]
        : (t < 0.88 ? [186 / 255, 203 / 255, 1] : [1, 226 / 255, 176 / 255]);
      const o = i * 9;
      bd[o] = brightRandom() * (W + 140) - 70;
      bd[o + 1] = brightRandom() * (H + 140) - 70;
      bd[o + 2] = 0.55 + brightRandom() * 1.25;
      bd[o + 3] = 0.42 + brightRandom() * 0.5;
      bd[o + 4] = brightRandom() * 6.2832;
      bd[o + 5] = 0.35 + brightRandom() * 1.7;
      bd[o + 6] = col[0]; bd[o + 7] = col[1]; bd[o + 8] = col[2];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, brightBuf);
    gl.bufferData(gl.ARRAY_BUFFER, bd, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  /* ---------------------------------------------------------------- */
  /* Grundbild                                                         */
  /* ---------------------------------------------------------------- */

  /* Das Grundbild ist 3072 x 2048 groß und liegt auf einem 1280er Schirm
     nur gut 1290 Punkte breit, wird also auf 42 Prozent verkleinert. Wie
     man das tut, ist eine echte Entscheidung und keine Nebensache, denn
     in dem Bild stehen gemalte Sterne von der Größe einzelner Punkte.
     Davon hängt ab, wie hart sie herauskommen. Die drei Wege sind
     gemessen, siehe den Regler bgResample in js/galaxy-config.js.

     Ist das Bild ohnehin kleiner als gebraucht, etwa auf einem großen
     Schirm mit doppelter Punktdichte, bleibt es in allen drei Fällen
     unverändert und wird wie bisher vergrößert. */
  const bgScratch = document.createElement('canvas');
  let bgImg = null;
  let bgMode = null;

  /* Der Pfad zum Grundbild steht relativ zur Seite. Das Bild-Studio läuft
     auf einem eigenen Server und reicht Dateien aus dem Repo unter
     /datei/ durch, deshalb lässt sich ein Vorsatz davorsetzen. */
  function bgQuelle() {
    return (window.GALAXY_BASE || '') + FIX.bgSrc;
  }

  function uploadBg() {
    if (!bgImg) return;
    const mode = CFG.bgResample;
    let needW = bgW, needH = bgH;

    if (mode === 'fein') {
      const drift = Math.abs(CFG.drift);
      const atmen = 0.035 * drift;
      const randX = 0.02 * W * drift + CFG.parallaxX;
      const randY = 0.02 * H * drift + CFG.parallaxY;
      const s = CFG.bgZoom / (1 - atmen)
        * Math.max((W + 2 * randX) / bgW, (H + 2 * randY) / bgH)
        * (1 + 0.035 * drift);
      needW = Math.min(bgW, Math.ceil(bgW * s * dpr));
      needH = Math.min(bgH, Math.ceil(bgH * s * dpr));
    }
    if (needW === bgTexW && needH === bgTexH && mode === bgMode) return;
    bgTexW = needW; bgTexH = needH; bgMode = mode;

    let src = bgImg;
    if (needW < bgW || needH < bgH) {
      bgScratch.width = needW;
      bgScratch.height = needH;
      const bx = bgScratch.getContext('2d');
      bx.imageSmoothingEnabled = true;
      bx.imageSmoothingQuality = 'high';
      bx.clearRect(0, 0, needW, needH);
      bx.drawImage(bgImg, 0, 0, needW, needH);
      src = bgScratch;
    }
    gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
      mode === 'mip' ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    if (mode === 'mip') gl.generateMipmap(gl.TEXTURE_2D);
  }

  /* Die Größe kommt vom Canvas selbst, nicht vom Fenster. Auf der Seite
     liegt es fest über allem (position: fixed, inset: 0), dort ist beides
     dasselbe. Im Bild-Studio steckt dieselbe Datei in einer Tafel von
     vielleicht 600 Punkten Breite, und dann wäre die Fenstergröße die
     falsche Antwort.

     Die Lage merkt sich resize gleich mit, damit die Parallaxe beim
     Bewegen des Zeigers nicht jedes Mal das Layout befragen muss. */
  let rect = { left: 0, top: 0, width: 0, height: 0 };

  function resize() {
    if (paused) return;
    const r = canvas.getBoundingClientRect();
    const neuDpr = Math.min(window.devicePixelRatio || 1, 2);
    const neuW = Math.max(1, Math.round(r.width));
    const neuH = Math.max(1, Math.round(r.height));
    rect = { left: r.left, top: r.top, width: r.width || 1, height: r.height || 1 };
    /* Sonst baut jede Meldung des Beobachters das Sternenfeld neu auf,
       und das sind ein paar tausend Einträge. */
    if (neuW === W && neuH === H && neuDpr === dpr) return;
    dpr = neuDpr; W = neuW; H = neuH;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    buildStars();
    uploadBg();
    if (reduceMotion) frame(0, 0);
  }

  /* ---------------------------------------------------------------- */
  /* Bewegung auf der CPU                                              */
  /* ---------------------------------------------------------------- */

  function updateShots(dt) {
    if (CFG.shootingStars && !reduceMotion) {
      nextShot -= dt;
      if (nextShot <= 0) {
        const fromTop = shootRandom() < 0.65;
        const ang = (fromTop ? 0.42 : 0.58) + shootRandom() * 0.12;
        const sp = 620 + shootRandom() * 520;
        shots.push({
          x: shootRandom() * W * 0.7 + W * 0.1,
          y: fromTop ? -40 : shootRandom() * H * 0.4,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 0,
          max: 1.1 + shootRandom() * 0.7,
          len: 90 + shootRandom() * 140,
        });
        /* Die Streuung um den mittleren Abstand herum. Bei 12.5 kommen
           genau die 7 bis 18 Sekunden der Vorlage heraus, und weil es
           bei einer Zufallszahl bleibt, steht auch dieselbe Folge. */
        nextShot = CFG.shootInterval * (0.56 + 0.88 * shootRandom());
      }
    }
    let n = 0;
    for (let i = shots.length - 1; i >= 0; i--) {
      const sh = shots[i];
      sh.life += dt;
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      const k = sh.life / sh.max;
      if (k >= 1 || sh.x > W + 200 || sh.y > H + 200) { shots.splice(i, 1); continue; }
      if (n >= 4) continue;
      const nn = Math.hypot(sh.vx, sh.vy) || 1;
      shotSeg[n * 4] = sh.x;
      shotSeg[n * 4 + 1] = sh.y;
      shotSeg[n * 4 + 2] = sh.x - (sh.vx / nn) * sh.len;
      shotSeg[n * 4 + 3] = sh.y - (sh.vy / nn) * sh.len;
      shotFade[n] = Math.sin(Math.PI * k);
      n++;
    }
    return n;
  }

  function lerpColors() {
    for (let i = 0; i < current.length; i++) {
      for (let k = 0; k < 3; k++) {
        current[i][k] += (target[i][k] - current[i][k]) * CFG.tintEase;
      }
    }
  }

  /* ---------------------------------------------------------------- */
  /* Ein Bild                                                          */
  /* ---------------------------------------------------------------- */

  function frame(rawT, dt) {
    if (!W || !H) return;
    const t = rawT * CFG.timeScale;
    const speed = (reduceMotion ? CFG.drift * 0.2 : CFG.drift) * CFG.timeScale;
    const shotN = updateShots(dt);

    mouse.x += (mouse.tx - mouse.x) * 0.035;
    mouse.y += (mouse.ty - mouse.y) * 0.035;

    const pw = canvas.width, ph = canvas.height;
    gl.viewport(0, 0, pw, ph);
    gl.bindVertexArray(emptyVao);
    gl.disable(gl.BLEND);

    /* ---- Grundbild, Nebel, Schleier, Sonne ---- */

    /* Das Grundbild wird etwas größer aufgezogen als der Schirm, sonst
       gäbe die Parallaxe an den Rändern eine Lücke frei. Die Sonne sitzt
       auf einem festen Punkt im Bild und wandert deshalb mit.

       So groß, dass die weiteste Verschiebung an keinem Rand eine Lücke
       freigibt, und keinen Punkt größer. randX und randY sind der Weg, den
       Wandern und Parallaxe zusammen zurücklegen, das Teilen durch
       (1 - atmen) fängt den kleinsten Stand des atmenden Zooms ab. Steht
       drift auf 0, fallen alle drei Bewegungen bis auf die Parallaxe weg
       und das Bild sitzt entsprechend weiter offen. */
    let dx = 0, dy = 0, dw = 0, dh = 0, sunX = 0, sunY = 0, sunR = 0;
    if (bgReady) {
      const ox = Math.sin(t * 0.017 * speed) * W * 0.02 - mouse.x * CFG.parallaxX;
      const oy = Math.cos(t * 0.013 * speed) * H * 0.02 - mouse.y * CFG.parallaxY;
      const atmen = 0.035 * Math.abs(speed);
      const randX = 0.02 * W * Math.abs(speed) + CFG.parallaxX;
      const randY = 0.02 * H * Math.abs(speed) + CFG.parallaxY;
      const s = CFG.bgZoom / (1 - atmen)
        * Math.max((W + 2 * randX) / bgW, (H + 2 * randY) / bgH)
        * (1 + 0.035 * Math.sin(t * 0.05 * speed));
      dw = bgW * s; dh = bgH * s;
      dx = (W - dw) / 2 + ox; dy = (H - dh) / 2 + oy;
      sunX = dx + dw * 0.118; sunY = dy + dh * 0.312; sunR = dw * 0.085;
    }

    const nx = Math.sin(t * 0.011 * speed) * W * 0.05;
    const ny = Math.cos(t * 0.008 * speed) * H * 0.04;
    const pulse = CFG.nebPulse;
    const a1 = Math.max(0, CFG.nebGlow * (0.30 + 0.08 * pulse * Math.sin(t * 0.09)));
    const a2 = Math.max(0, CFG.nebGlow * (0.20 + 0.07 * pulse * Math.cos(t * 0.062)));

    for (let i = 0; i < TINT_SLOTS; i++) {
      paletteBuf[i * 3] = Math.round(current[i][0]) / 255;
      paletteBuf[i * 3 + 1] = Math.round(current[i][1]) / 255;
      paletteBuf[i * 3 + 2] = Math.round(current[i][2]) / 255;
    }

    const sky = progSky;
    gl.useProgram(sky.id);
    gl.uniform2f(sky.u.uPix, pw, ph);
    gl.uniform1f(sky.u.uDpr, dpr);
    gl.uniform1f(sky.u.uBgHas, bgReady ? 1 : 0);
    gl.uniform4f(sky.u.uBgRect, dx, dy, dw || 1, dh || 1);
    gl.uniform4f(sky.u.uNeb1Rect, -W * 0.08 + nx, -H * 0.08 + ny, W * 1.16, H * 1.16);
    gl.uniform4f(sky.u.uNeb2Rect, -W * 0.14 - nx * 1.5, -H * 0.11 - ny * 1.3, W * 1.28, H * 1.22);
    gl.uniform2f(sky.u.uNebAlpha, a1, a2);
    gl.uniform3fv(sky.u.uPalette, paletteBuf);
    gl.uniform1f(sky.u.uTint, CFG.tintStrength);
    gl.uniform1f(sky.u.uBgTint, CFG.bgTint);
    gl.uniform4f(sky.u.uSun, sunX, sunY, sunR, 0.5 + 0.5 * CFG.sunPulse * Math.sin(t * 0.5));
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, nebTex[0]);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, nebTex[1]);
    gl.uniform1i(sky.u.uBg, 0);
    gl.uniform1i(sky.u.uNeb1, 1);
    gl.uniform1i(sky.u.uNeb2, 2);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* ---- Sterne und Schweife, alles additiv ---- */

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    if (faintN) {
      const fx = Math.sin(t * 0.02 * speed) * 24 - mouse.x * 26;
      const fy = Math.cos(t * 0.016 * speed) * 18 - mouse.y * 18;
      gl.useProgram(progFaint.id);
      gl.bindVertexArray(faintVao);
      gl.uniform2f(progFaint.u.uPix, pw, ph);
      gl.uniform1f(progFaint.u.uDpr, dpr);
      gl.uniform2f(progFaint.u.uOfs, fx, fy);
      gl.uniform1f(progFaint.u.uAlpha, 0.92);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, faintN);
    }

    /* Die hellen Sterne laufen weiter aus der Mitte als die feinen, das
       gibt dem Feld Tiefe. */
    if (brightN) {
      const px = Math.sin(t * 0.021 * speed) * 36 - mouse.x * 42;
      const py = Math.cos(t * 0.015 * speed) * 26 - mouse.y * 30;
      gl.useProgram(progBright.id);
      gl.bindVertexArray(brightVao);
      gl.uniform2f(progBright.u.uPix, pw, ph);
      gl.uniform1f(progBright.u.uDpr, dpr);
      gl.uniform2f(progBright.u.uOfs, px, py);
      /* t und nicht rawT: timeScale soll wirklich alle Bewegungen
         anhalten, das Funkeln eingeschlossen. Die Rückfallebene rechnet
         seit jeher so, hier stand versehentlich die ungeskalierte Zeit. */
      gl.uniform1f(progBright.u.uTime, t * CFG.twinkleSpeed);
      gl.uniform1f(progBright.u.uTwinkle, CFG.twinkle && !reduceMotion ? 1 : 0);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, brightN);
    }

    gl.bindVertexArray(emptyVao);

    if (shotN) {
      gl.useProgram(progShots.id);
      gl.uniform2f(progShots.u.uPix, pw, ph);
      gl.uniform1f(progShots.u.uDpr, dpr);
      gl.uniform1i(progShots.u.uShotN, shotN);
      gl.uniform4fv(progShots.u.uShotSeg, shotSeg);
      gl.uniform1fv(progShots.u.uShotFade, shotFade);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    /* ---- Abdunkelnde Verläufe, normal darüber ---- */

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(progScrim.id);
    gl.uniform2f(progScrim.u.uPix, pw, ph);
    gl.uniform1f(progScrim.u.uDpr, dpr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }

  /* ---------------------------------------------------------------- */
  /* Start und Schleife                                                */
  /* ---------------------------------------------------------------- */

  let running = true, paused = false;
  let last = 0, t0 = 0;

  function loop(ms) {
    if (!running || paused) return;
    const t = (ms - t0) / 1000;
    const dt = Math.min(0.05, t - last || 0.016);
    last = t;
    lerpColors();
    frame(t, dt);
    requestAnimationFrame(loop);
  }

  const bg = new Image();
  bg.onload = function () {
    bgImg = bg;
    bgW = bg.naturalWidth; bgH = bg.naturalHeight;
    bgTexW = 0; bgTexH = 0;
    uploadBg();
    bgReady = true;
    if (reduceMotion) frame(0, 0);
  };
  bg.onerror = function () {
    /* Fehlt die Datei, bleibt der Rest der Galaxie stehen und es entfallen
       nur Bild und Sonne. Viel bleibt dann allerdings nicht: Gemessen
       trägt das Grundbild rund vier Fünftel des sichtbaren Lichts. */
    console.warn('Galaxy: ' + bgQuelle() + ' fehlt, Grundbild und Sonne entfallen.');
  };

  bakeNebulae();
  resize();
  bg.src = bgQuelle();

  /* Der Beobachter meldet, wenn die Tafel im Studio ihre Größe ändert.
     Am Fenster hängt der Renderer trotzdem noch: Ein Umzug auf einen
     Schirm mit anderer Punktdichte ändert nur devicePixelRatio, und davon
     erfährt ein ResizeObserver nichts. */
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize);

  if (!reduceMotion) {
    window.addEventListener('pointermove', function (e) {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      /* Steht der Zeiger neben der Leinwand, zieht das Bild in seine
         Mitte zurück. Auf der Seite liegt die Leinwand über dem ganzen
         Fenster, dort kommt der Fall nie vor und es bleibt beim Alten.
         In einer Tafel des Bild-Studios sehr wohl: Ohne das würde die
         Vorschau jedes Mal mitwandern, wenn jemand zu den Reglern fährt,
         und zwar bis zum Doppelten des vorgesehenen Wegs. */
      const drin = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      mouse.tx = drin ? (x - 0.5) * 2 : 0;
      mouse.ty = drin ? (y - 0.5) * 2 : 0;
    });
  }

  /* Geht der Kontext verloren, etwa weil der Treiber neu startet oder der
     Rechner in den Ruhezustand ging, hört die Schleife auf. Kommt er
     zurück, sind alle Puffer und Texturen weg und müssen neu entstehen. */
  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    running = false;
  });
  canvas.addEventListener('webglcontextrestored', function () {
    running = true;
    bakeNebulae();
    bgTexW = 0; bgTexH = 0;
    resize();
    if (!reduceMotion) requestAnimationFrame(loop);
  });

  if (!reduceMotion) {
    requestAnimationFrame(function (ms) {
      t0 = ms;
      requestAnimationFrame(loop);
    });
  }

  /* Diese Werte hängen am gebackenen Nebelbild. Ändert sich einer, muss
     es neu entstehen, alle anderen wirken im nächsten Bild von selbst. */
  const NEEDS_BAKE = ['nebFactor', 'nebOctaves', 'nebWarp', 'nebRoughness'];

  /* Und diese an der Größe, in der das Grundbild abgelegt ist. */
  const NEEDS_BG = ['bgZoom', 'drift', 'parallaxX', 'parallaxY', 'bgResample'];
  const NEEDS_STARS = ['starDensity', 'faintDensity', 'brightDensity'];

  window.Galaxy = {
    backend: 'webgl2',

    setPalette: function (colors) {
      target = expandPalette(colors);
      if (reduceMotion) {
        current = expandPalette(colors);
        frame(0, 0);
      }
    },

    /* Regler zur Laufzeit ändern, etwa Galaxy.set({ nebWarp: 0.35 }). */
    set: function (patch) {
      let rebake = false, restars = false, rebg = false;
      Object.keys(patch).forEach(function (k) {
        if (!(k in CFG)) { console.warn('Galaxy: unbekannter Regler ' + k); return; }
        if (CFG[k] === patch[k]) return;
        CFG[k] = patch[k];
        if (NEEDS_BAKE.indexOf(k) >= 0) rebake = true;
        if (NEEDS_STARS.indexOf(k) >= 0) restars = true;
        if (NEEDS_BG.indexOf(k) >= 0) rebg = true;
      });
      if (rebake) bakeNebulae();
      if (restars) buildStars();
      if (rebg) uploadBg();
      if (reduceMotion) frame(0, 0);
      return CFG;
    },

    get: function () {
      return Object.assign({}, CFG, { nebBakeSize: nebSize.slice(), backend: 'webgl2' });
    },

    /* Die sechs Nebelbereiche einzeln nachziehen. Jeder Eintrag darf nur
       die Felder nennen, die sich ändern sollen. */
    setRegions: function (list) {
      list.forEach(function (patch, i) {
        if (!patch || !regions[i]) return;
        Object.assign(regions[i], patch);
        if (patch.col) regions[i].col = patch.col.slice();
      });
      bakeNebulae();
      if (reduceMotion) frame(0, 0);
      return regions;
    },

    getRegions: function () {
      return regions.map(r => Object.assign({}, r, { col: r.col.slice() }));
    },

    /* Ein einzelnes Bild zu einem festgelegten Zeitpunkt, ohne Schleife
       und ohne Mauszeiger. Nur für den Vergleich zweier Fassungen und
       fürs Messen gedacht.

       Das Rücklesen eines einzigen Bildpunkts am Ende ist Absicht: Es
       zwingt die Grafikkarte, wirklich fertig zu werden, bevor die
       Funktion zurückkehrt. gl.finish allein tut das unter ANGLE nicht
       zuverlässig, und dann misst man nur das Abschicken der Befehle. */
    renderAt: function (t, dt) {
      mouse.x = mouse.tx; mouse.y = mouse.ty;
      frame(t, dt === undefined ? 0.016 : dt);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, syncPixel);
    },

    /* Ohne Überblendung sofort auf die Zielfarben stellen. */
    snapPalette: function () {
      current = target.map(c => c.slice());
    },

    /* Die Sternschnuppen auf den Anfang zurückstellen, samt ihrem
       Zufallsgenerator. Für den Vergleich: Ihr Zustand lebt sonst über
       einen ganzen Messlauf hinweg weiter, und dann hängt jede Messung
       an der davor. */
    resetShots: function () {
      shots = [];
      nextShot = 3.2;
      shootRandom = makeRandom(FIX.seedShoot);
    },

    /* Steht das Grundbild schon? Nur für den Vergleich gedacht. */
    ready: function () {
      return bgReady;
    },

    /* Anhalten und weiterlaufen lassen. Gedacht für Stellen, an denen die
       Galaxie gerade niemand sieht: Im Bild-Studio steckt sie in einem
       Dialog, und ein geschlossener Dialog soll keine Grafikkarte
       beschäftigen. Beim Weiterlaufen wird zuerst nachgemessen, denn in
       der Zwischenzeit kann sich die Größe geändert haben. */
    pause: function (an) {
      an = !!an;
      if (paused === an) return;
      paused = an;
      if (!an) {
        resize();
        if (!reduceMotion) requestAnimationFrame(loop);
        else frame(0, 0);
      }
    },
  };
})();
