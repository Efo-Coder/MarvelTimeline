/* Die treibende Plakatwand im Kopfband der Filmseite.

   Statt eines stehenden Bildes liegt hinter Titel und Uhr eine Wand aus
   Filmplakaten, die in Spalten aneinander vorbeizieht: eine Spalte nach
   oben, die nächste nach unten, jede in ihrem eigenen Tempo. Die ganze
   Wand steht dabei schräg im Raum, leicht nach hinten gekippt und zur
   Seite gedreht, und ihre Ränder verlaufen ins Nichts.

   Die Vorlage ist DriftWall von ReactBits. Hier steht sie ohne React und
   ohne Bauschritt, und vor allem ohne alles, was auf den Zeiger reagiert:
   Die Vorlage hebt die Kachel unter der Maus heraus, hält ihre Spalte an,
   neigt die Wand zum Zeiger hin und öffnet auf Klick einen Link. Nichts
   davon gehört in einen Hintergrund. Was bleibt, ist die Bewegung.

   Gezeichnet wird die Wand auf ein einziges Canvas mit WebGL2 und nicht
   mehr aus Kacheln im Dokument. Das ist der Grund, warum die Seite beim
   Scrollen nicht mehr stottert. Als Kacheln war die Wand weit über hundert
   Elemente in einer schrägen Ebene, und Chrome muss beim Scrollen fast
   jedes zweite Bild neu ausrechnen, welche Teile der Seite auf welcher
   Zeichenebene landen. Mit der Wand darin dauerte das gemessen 16 bis
   23 ms und damit länger als ein ganzes Bild, ohne sie 2 bis 3 ms. Das
   Anhalten der Wand beim Scrollen half dagegen nicht, denn die Rechnung
   hing an den Kacheln selbst und nicht an ihrer Bewegung. Ein Canvas ist
   für diese Rechnung eine einzige Fläche, und was darin passiert, geht
   sie nichts an. Deshalb läuft die Wand jetzt auch beim Scrollen weiter.

   Die Lage im Raum rechnet der Vertex-Shader genau so, wie das
   Stylesheet sie vorher gesetzt hat: Fluchtpunkt in der Mitte des
   Bandes, die Wand mittig darauf, gedreht in der Reihenfolge Maßstab,
   Kippung, Drehung, Rollen und Tiefe. Das Bild ist deshalb dasselbe wie
   mit den Kacheln, die Rechnung dazu steht bei lage() weiter unten.

   Die Plakate sind die der Kacheln darunter, nur klein: assets/covers/wall/
   liegt bei rund einem Megabyte für alle 55, die vollen Fassungen wären
   über sechs. Angelegt werden sie von vision-studio/films/covers/build-wall-covers.py.

   Welche Titel es gibt, sagt PHASES aus js/data.js. Zu einigen Titeln
   gibt es kein Plakat, und welche das sind, weiß im Browser niemand.
   Deshalb wird jedes einmal angefragt, und gebaut wird erst aus dem, was
   angekommen ist. Bis dahin bleibt das Kopfband auf seinem dunklen Grund
   stehen: Lieber einen Moment nichts als Kacheln, die nacheinander
   aufpoppen. Kann der Browser kein WebGL2, bleibt es bei diesem Grund. */
(function () {
  'use strict';

  const host = document.querySelector('[data-drift-wall]');
  if (!host) return;
  if (typeof PHASES === 'undefined') return;

  const WALL = 'assets/covers/wall/';
  const COVERS = 'assets/covers/';

  /* ---------- Die Stellschrauben ----------

     Sie stehen alle in js/drift-wall-config.js und keine einzige hier.
     Das Vision-Studio zeigt sie als Regler und schreibt sie dorthin
     zurück, und was das Studio verstellt, muss dieselbe Datei sein, die
     die Seite liest. Fehlt sie, steht die Wand nicht.

     Das Stylesheet holt sich von hier nur noch, was den Schleier über der
     Wand betrifft. Alles andere geht an den Shader, siehe stelleEin(). */

  if (!window.DRIFT_WALL_CONFIG) return;
  const cfg = Object.assign({}, window.DRIFT_WALL_CONFIG);

  /* Das Band selbst. Die eigenen Eigenschaften hängen dort und nicht an
     der Wand, weil der Schleier darüber ein Pseudo-Element des Bandes
     ist und sonst nichts davon mitbekäme. */
  const band = host.closest('.chars-masthead') || host.parentElement || host;

  const canvas = document.createElement('canvas');
  canvas.className = 'drift-wall__canvas';
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl) return;
  host.append(canvas);

  /* ---------- Die Plakate ----------

     Erst die Titel aus PHASES in der Reihenfolge der Phasen, dann jedes
     Plakat einmal anfragen. Was nicht ankommt, fällt weg.

     Der Rückfall auf die volle Fassung ist für den Fall, dass jemand ein
     Plakat nachgetragen und das Werkzeug für die kleinen vergessen hat.
     Dann steht der Titel trotzdem in der Wand, nur mit einer größeren
     Datei als nötig. */

  function slugs() {
    const seen = [];
    for (const phase of PHASES) {
      for (const movie of phase.movies) {
        if (movie.slug && !seen.includes(movie.slug)) seen.push(movie.slug);
      }
    }
    return seen;
  }

  /* Zurück kommt das Bild selbst, schon ausgepackt. decode() nimmt das
     Auspacken vorweg und erledigt es neben der Seite: Sonst packte der
     Browser jedes Plakat erst in dem Moment aus, in dem es in den Atlas
     gezeichnet wird, und das hielte die Seite beim Laden kurz an. */
  function load(slug) {
    return new Promise(resolve => {
      const img = new Image();
      let full = false;
      img.decoding = 'async';
      img.addEventListener('load', () => {
        img.decode().then(() => resolve(img), () => resolve(img));
      });
      img.addEventListener('error', () => {
        if (full) return resolve(null);
        full = true;
        img.src = COVERS + slug + '.webp';
      });
      img.src = WALL + slug + '.webp';
    });
  }

  /* ---------- Die Maße ----------

     Wie breit ein Plakat steht, hängt am Fenster: Es bekommt einen
     Anteil der Breite, begrenzt nach unten und oben.

     Zurück kommt das Maß einer Zelle, also Kachel samt Fuge. In diesem
     Raster steht die ganze Wand. */

  function unit(width) {
    const w = Math.round(Math.min(cfg.tileMax, Math.max(cfg.tileMin, width * cfg.tileShare)));
    return { tile: w, w: w + cfg.gap, h: Math.round(w * cfg.ratio) + cfg.gap };
  }

  /* Was das Stylesheet von der Konfiguration wissen muss. Das ist nur
     noch der Schleier über der Wand, denn der ist ein Pseudo-Element des
     Bandes und kein Teil der Zeichnung. */
  function stelleEin() {
    const s = band.style;
    s.setProperty('--dw-overlay', cfg.overlay);
    s.setProperty('--dw-dim', String(cfg.dim));
    s.setProperty('--dw-scrim', String(cfg.scrim));
    s.setProperty('--dw-top', String(cfg.top));
    s.setProperty('--dw-bottom', String(cfg.bottom));
    s.setProperty('--dw-edge', cfg.edge + '%');
  }

  /* Das Tempo einer Spalte. Der Faktor ist die Streuung der Vorlage: Der
     goldene Schnitt verteilt die Spalten gleichmäßig über den Bereich,
     ohne dass zwei benachbarte denselben Wert bekommen. Das Vorzeichen
     wechselt von Spalte zu Spalte, damit die Wand in beide Richtungen
     läuft und nicht als Ganzes wandert. */
  function velocity(index) {
    const spread = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
    const sign = index % 2 === 0 ? 1 : -1;
    return cfg.speed * (1 + cfg.variance * spread) * sign * (cfg.direction === 'down' ? -1 : 1);
  }

  /* ---------- Die Shader ----------

     Eine Kachel ist ein Rechteck aus vier Ecken, gezeichnet so oft, wie
     gerade Plakate im Bild stehen. Jede bringt ihre Lage in der Wand und
     die Nummer ihres Plakats im Atlas mit, alles andere gilt für alle.

     Die Rechnung im Vertex-Shader ist die des Stylesheets von vorher.
     Die Wand stand mittig im Band, gedreht um ihre eigene Mitte, und der
     Fluchtpunkt lag ebenfalls in der Mitte des Bandes. Beide Mitten fallen
     also zusammen, und damit bleibt von der ganzen Kette nur: den Punkt
     auf die Wandmitte beziehen, mit uLage drehen und verschieben, und
     dann durch 1 - z / perspective teilen. Das Teilen übernimmt die
     Grafikkarte über w, und sie verzerrt dabei auch die Bildpunkte des
     Plakats richtig mit.

     Der Fragment-Shader schneidet oben und unten ab, was über die Wand
     hinausläuft. Das war vorher das overflow: hidden jeder Spalte. */

  const VERTEX = `#version 300 es
    layout(location = 0) in vec2 aEcke;
    layout(location = 1) in vec3 aKachel;
    uniform mat4 uLage;
    uniform vec2 uWandMitte;
    uniform vec2 uBand;
    uniform float uFlucht;
    uniform vec2 uBild;
    uniform vec3 uAtlas;
    uniform vec2 uZelle;
    out vec2 vUv;
    out vec2 vLokal;
    out float vWandY;
    flat out vec4 vZelle;
    void main() {
      vec2 p = aKachel.xy + aEcke * uBild;
      vec4 r = uLage * vec4(p - uWandMitte, 0.0, 1.0);
      float w = 1.0 - r.z / uFlucht;
      gl_Position = vec4(2.0 * r.x / uBand.x, -2.0 * r.y / uBand.y, 0.0, w);
      float n = aKachel.z;
      vec2 ecke = vec2(mod(n, uAtlas.x), floor(n / uAtlas.x)) * uAtlas.yz;
      vUv = ecke + aEcke * uZelle;
      vZelle = vec4(ecke, ecke + uZelle);
      vLokal = aEcke * uBild;
      vWandY = p.y;
    }`;

  const FRAGMENT = `#version 300 es
    precision highp float;
    uniform sampler2D uBilder;
    uniform float uWandH;
    uniform vec2 uBild;
    uniform float uRund;
    uniform float uGrau;
    uniform vec2 uTexel;
    in vec2 vUv;
    in vec2 vLokal;
    in float vWandY;
    flat in vec4 vZelle;
    out vec4 farbe;
    void main() {
      vec2 q = abs(vLokal - uBild * 0.5) - (uBild * 0.5 - uRund);
      float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRund;
      float a = uRund > 0.0 ? clamp(0.5 - d / max(fwidth(d), 1e-4), 0.0, 1.0) : 1.0;
      if (vWandY < 0.0 || vWandY > uWandH) discard;
      vec2 uv = clamp(vUv, vZelle.xy + uTexel, vZelle.zw - uTexel);
      vec3 c = texture(uBilder, uv).rgb;
      c = mix(c, vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), uGrau);
      farbe = vec4(c * a, a);
    }`;

  let prog = null;
  let u = {};
  let instanzen = null;
  let instanzDaten = new Float32Array(0);
  let textur = null;

  function shader(art, quelle) {
    const s = gl.createShader(art);
    gl.shaderSource(s, quelle);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error('Plakatwand: ' + gl.getShaderInfoLog(s));
    }
    return s;
  }

  /* Alles, was auf der Grafikkarte liegt. Geht der Kontext verloren und
     kommt wieder, wird es hier noch einmal angelegt. */
  function richteEin() {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('Plakatwand: ' + gl.getProgramInfoLog(prog));
    }
    u = {};
    for (const name of ['uLage', 'uWandMitte', 'uBand', 'uFlucht', 'uBild', 'uAtlas', 'uZelle',
      'uBilder', 'uWandH', 'uRund', 'uGrau', 'uTexel']) {
      u[name] = gl.getUniformLocation(prog, name);
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const ecken = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ecken);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    instanzen = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanzen);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    instanzDaten = new Float32Array(0);

    gl.useProgram(prog);
    gl.uniform1i(u.uBilder, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    textur = null;
  }

  /* ---------- Der Atlas ----------

     Alle Plakate liegen nebeneinander in einer einzigen Textur, jedes
     schon auf das Format der Kachel zugeschnitten, wie object-fit: cover
     es vorher tat. So braucht die ganze Wand einen einzigen Zeichenaufruf.

     Die Plakate werden dabei gleich in der Größe abgelegt, in der sie
     auf dem Schirm stehen, samt Pixeldichte und Maßstab. Die Grafikkarte
     muss sie dann kaum noch verkleinern, und das Verkleinern selbst
     übernimmt der Browser beim Anlegen in guter Qualität. Zwischen zwei
     Plakaten bleibt eine Fuge von zwei Pixeln frei, damit beim Abtasten
     an der Kante nichts vom Nachbarn hereinblutet. */

  let atlas = null;   /* { schluessel, spalten, zelleU/V, schrittU/V, texelU/V } */

  function baueAtlas(size) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bildH = size.h - cfg.gap;
    const maximum = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 4096);
    const spalten = Math.ceil(Math.sqrt(sources.length));
    const reihen = Math.ceil(sources.length / spalten);
    const RAND = 2;

    let zoom = dpr * Math.max(1, cfg.scale);
    let zw = Math.round(size.tile * zoom);
    let zh = Math.round(bildH * zoom);
    const passt = Math.min(1, maximum / (spalten * (zw + RAND)), maximum / (reihen * (zh + RAND)));
    zw = Math.max(1, Math.floor(zw * passt));
    zh = Math.max(1, Math.floor(zh * passt));

    const schluessel = [sources.length, zw, zh].join('x');
    if (atlas && atlas.schluessel === schluessel && textur) return;

    const bw = spalten * (zw + RAND);
    const bh = reihen * (zh + RAND);
    const leinwand = document.createElement('canvas');
    leinwand.width = bw;
    leinwand.height = bh;
    const ctx = leinwand.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#0b0b12';

    sources.forEach((img, n) => {
      const x = (n % spalten) * (zw + RAND);
      const y = Math.floor(n / spalten) * (zh + RAND);
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      /* object-fit: cover, gemessen von der Mitte */
      let sx = 0, sy = 0, sw = iw, sh = ih;
      if (ih / iw > zh / zw) {
        sh = iw * zh / zw;
        sy = (ih - sh) / 2;
      } else {
        sw = ih * zw / zh;
        sx = (iw - sw) / 2;
      }
      ctx.fillRect(x, y, zw, zh);
      ctx.drawImage(img, sx, sy, sw, sh, x, y, zw, zh);
    });

    if (!textur) textur = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textur);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, bw, bh, 0, gl.RGBA, gl.UNSIGNED_BYTE, leinwand);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    leinwand.width = 0;
    leinwand.height = 0;

    atlas = {
      schluessel, spalten,
      zelleU: zw / bw, zelleV: zh / bh,
      schrittU: (zw + RAND) / bw, schrittV: (zh + RAND) / bh,
      texelU: 0.5 / bw, texelV: 0.5 / bh,
    };
  }

  /* ---------- Der Aufbau ----------

     Die Wand als Raster: wie viele Spalten, wie viele Plakate je Spalte,
     und wo jede Spalte in ihrem Lauf anfängt. Gezeichnet wird daraus in
     draw(). */

  let wand = null;   /* { width, height, size, wallW, planeH, perColumn, copies, columns } */
  let sources = [];

  function build() {
    const width = host.clientWidth || window.innerWidth;
    const height = host.clientHeight || 480;
    const size = unit(width);
    stelleEin();

    /* Die Maße der Wand. Sie ist größer als das Kopfband, weil sie
       schräg darin steht. Ihre Höhe ist das Fenster, durch das jede
       Spalte läuft. */
    const planeW = Math.ceil(width * cfg.overX);
    const planeH = Math.ceil(height * cfg.overY);

    /* Die Zahl der Spalten. Steht sie in der Konfiguration, gilt sie,
       sonst so viele, wie die Wand samt Überstand fasst. */
    const count = cfg.columns > 0
      ? Math.round(cfg.columns)
      : Math.max(3, Math.ceil(planeW / size.w));
    /* Die tatsächliche Breite. Sie ist ein Vielfaches der Spaltenbreite
       und damit etwas größer als das Maß oben, und für die Lage der
       Spalten zählt nur diese. */
    const wallW = count * size.w;
    /* Wie viele Plakate eine Spalte trägt, bevor sie sich wiederholt.
       Bei wenigen Spalten reicht der Bestand für jede einzelne, bei
       vielen bekommt jede ihren eigenen Anfang und greift danach im
       Abstand der Spaltenzahl weiter: So steht neben einem Plakat in der
       Nachbarspalte nie dasselbe. */
    const perColumn = Math.max(cfg.minPerColumn, Math.ceil(sources.length / count));

    /* Eine Umdrehung des Streifens. Nach so vielen Pixeln steht wieder
       dasselbe Plakat an derselben Stelle, und der Stand springt zurück
       auf null. Der Streifen ist deshalb um eine ganze Umdrehung länger
       als das Fenster hoch, sonst klaffte kurz vor dem Sprung unten
       Leere. */
    const span = perColumn * size.h;
    const copies = Math.ceil(planeH / span) + 1;

    const columns = [];
    for (let c = 0; c < count; c++) {
      const items = [];
      for (let i = 0; i < perColumn; i++) items.push((c + i * count) % sources.length);
      /* Jede Spalte fängt an einer anderen Stelle ihrer Kopie an, sonst
         stünden alle Plakate in einer Reihe nebeneinander. Steht die Wand
         schon und wird nur neu vermessen, läuft jede Spalte an ihrer
         Stelle weiter, soweit es sie noch gibt. */
      const alt = wand && wand.columns[c];
      const offset = alt && alt.span === span ? alt.offset : span * ((c * 0.37) % 1);
      columns.push({ items, span, offset, speed: velocity(c) });
    }

    wand = { width, height, size, wallW, planeH, perColumn, copies, columns };
    baueAtlas(size);
    groesse();
    draw();
    host.classList.add('ready');
    run();
  }

  /* Die Pixel des Canvas folgen dem Band. Das muss bei jeder Änderung
     der Größe geschehen und nicht nur beim Neubau, denn die Rechnung im
     Shader geht von genau dieser Fläche aus. */
  let pixelW = 0;
  let pixelH = 0;
  /* Dieselbe Fläche in CSS-Pixeln, für den Shader. Sie wird hier
     festgehalten und nicht bei jedem Bild gelesen: Wer mitten in der
     Schleife nach clientWidth fragt, zwingt den Browser unter Umständen,
     die Seite vorzeitig neu zu setzen. */
  let bandW = 1;
  let bandH = 1;

  function groesse() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    bandW = host.clientWidth || wand.width;
    bandH = host.clientHeight || wand.height;
    const w = Math.max(1, Math.round(bandW * dpr));
    const h = Math.max(1, Math.round(bandH * dpr));
    if (w === pixelW && h === pixelH) return;
    pixelW = w;
    pixelH = h;
    canvas.width = w;
    canvas.height = h;
  }

  /* ---------- Die Lage im Raum ----------

     Die Kette aus dem Stylesheet von vorher, als eine Matrix:

       scale(s) rotateX(tilt) rotateY(turn) rotateZ(roll) translateZ(-depth)

     Eine CSS-Transformation wirkt von rechts nach links auf den Punkt.
     Die Tiefe kommt also zuerst, das Rollen danach, und der Maßstab
     zuletzt. Die Matrizen sind die aus der Spezifikation, mit y nach
     unten und z zum Betrachter hin. Geschrieben wird spaltenweise, wie
     WebGL es erwartet. */

  function mal(a, b) {
    const o = new Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
        o[c * 4 + r] = s;
      }
    }
    return o;
  }

  function lage() {
    const grad = Math.PI / 180;
    const x = cfg.tilt * grad, y = cfg.turn * grad, z = cfg.roll * grad;
    const s = cfg.scale;
    /* scale() ist in CSS eine Angabe in der Ebene und lässt z stehen.
       Mit z mitgerechnet rückte die Wand ein Stück zu weit nach hinten. */
    const skal = [s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const rotX = [1, 0, 0, 0, 0, Math.cos(x), Math.sin(x), 0, 0, -Math.sin(x), Math.cos(x), 0, 0, 0, 0, 1];
    const rotY = [Math.cos(y), 0, -Math.sin(y), 0, 0, 1, 0, 0, Math.sin(y), 0, Math.cos(y), 0, 0, 0, 0, 1];
    const rotZ = [Math.cos(z), Math.sin(z), 0, 0, -Math.sin(z), Math.cos(z), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const tief = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -cfg.depth, 1];
    return new Float32Array(mal(mal(mal(mal(skal, rotX), rotY), rotZ), tief));
  }

  /* ---------- Das Zeichnen ----------

     Aus jeder Spalte kommen nur die Plakate in den Puffer, die gerade im
     Fenster der Wand stehen. Das sind bei einem breiten Fenster rund
     hundertfünfzig, und das Hochladen kostet dann weniger als das
     Durchzählen. */

  function draw() {
    if (!wand || !atlas || !textur || gl.isContextLost()) return;
    const { size, wallW, planeH, perColumn, copies, columns } = wand;
    const bildH = size.h - cfg.gap;
    const rand = cfg.gap / 2;

    const noetig = columns.length * perColumn * copies * 3;
    if (instanzDaten.length < noetig) instanzDaten = new Float32Array(noetig);
    let n = 0;
    columns.forEach((column, c) => {
      const x = c * size.w + rand;
      for (let k = 0; k < perColumn * copies; k++) {
        const y = k * size.h - column.offset + rand;
        if (y + bildH < 0 || y > planeH) continue;
        instanzDaten[n * 3] = x;
        instanzDaten[n * 3 + 1] = y;
        instanzDaten[n * 3 + 2] = column.items[k % perColumn];
        n++;
      }
    });

    gl.viewport(0, 0, pixelW, pixelH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(u.uLage, false, lage());
    gl.uniform2f(u.uWandMitte, wallW / 2, planeH / 2);
    gl.uniform2f(u.uBand, bandW, bandH);
    gl.uniform1f(u.uFlucht, cfg.perspective);
    gl.uniform2f(u.uBild, size.tile, bildH);
    gl.uniform3f(u.uAtlas, atlas.spalten, atlas.schrittU, atlas.schrittV);
    gl.uniform2f(u.uZelle, atlas.zelleU, atlas.zelleV);
    gl.uniform2f(u.uTexel, atlas.texelU, atlas.texelV);
    gl.uniform1f(u.uWandH, planeH);
    gl.uniform1f(u.uRund, Math.min(cfg.radius, size.tile / 2, bildH / 2));
    gl.uniform1f(u.uGrau, cfg.grayscale ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textur);

    gl.bindBuffer(gl.ARRAY_BUFFER, instanzen);
    gl.bufferData(gl.ARRAY_BUFFER, instanzDaten.subarray(0, n * 3), gl.DYNAMIC_DRAW);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
  }

  /* ---------- Die Bewegung ----------

     Eine Schleife für alle Spalten. Sie läuft nur, solange das Kopfband
     im Bild ist und der Reiter vorn liegt: Weiter unten auf der Seite
     sieht niemand die Wand, und ein Rechner, der nebenher etwas anderes
     tut, soll nicht für sie arbeiten. Beim Scrollen läuft sie weiter, das
     kostet auf dem Canvas nichts mehr, siehe den Kopf dieser Datei. */

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;
  let last = 0;
  let visible = true;

  /* Der Takt der Wand: Sie wird nicht bei jedem Bild des Bildschirms neu
     gesetzt, sondern so oft, wie fps in der Konfiguration sagt. Ein
     Zehntel Bild Abzug, damit der Takt nicht knapp am Bildwechsel
     vorbeischrammt und deshalb jedes zweite Mal aussetzt. */
  function takt() {
    return 0.9 / Math.max(1, cfg.fps);
  }

  function step(now) {
    frame = requestAnimationFrame(step);
    const seit = (now - last) / 1000;
    if (seit < takt()) return;
    last = now;
    const dt = Math.min(0.1, seit);
    for (const column of wand.columns) {
      const next = column.offset + column.speed * dt;
      column.offset = ((next % column.span) + column.span) % column.span;
    }
    draw();
  }

  function run() {
    const wanted = visible && !document.hidden && !reduced.matches
      && !cfg.paused && !!wand && !gl.isContextLost();
    if (wanted && frame === null) {
      last = performance.now();
      frame = requestAnimationFrame(step);
    } else if (!wanted && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  /* ---------- Anschlüsse ----------

     Neu gebaut wird nur, wenn sich die Breite wirklich ändert. Auf einem
     Telefon wächst und schrumpft die Höhe des Fensters beim Rollen
     ständig, weil die Adresszeile ein- und ausfährt. Jedes Mal das ganze
     Raster neu zu setzen, wäre Arbeit für nichts. Die Pixel des Canvas
     ziehen dagegen bei jeder Änderung nach, und das Bild dazu wird
     gleich gezeichnet, sonst stünde bis zum nächsten Takt eine verzerrte
     Wand da. */

  let lastWidth = 0;
  let lastHeight = 0;

  function measure() {
    if (!sources.length || !wand) return;
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (Math.abs(width - lastWidth) < 24 && Math.abs(height - lastHeight) < 120) {
      groesse();
      draw();
      return;
    }
    lastWidth = width;
    lastHeight = height;
    build();
  }

  document.addEventListener('visibilitychange', run);
  reduced.addEventListener('change', run);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[entries.length - 1].isIntersecting;
      run();
    }).observe(host);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(host);
  } else {
    window.addEventListener('resize', measure);
  }

  /* Geht der Kontext verloren, etwa weil der Treiber neu startet, hält
     die Schleife an. Kommt er wieder, liegt auf der Grafikkarte nichts
     mehr, und alles wird neu angelegt. */
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    run();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    richteEin();
    atlas = null;
    if (sources.length) build();
  });

  richteEin();

  Promise.all(slugs().map(load)).then(results => {
    sources = results.filter(Boolean);
    if (!sources.length) return;
    lastWidth = host.clientWidth;
    lastHeight = host.clientHeight;
    build();
  });

  /* ---------- Von außen verstellen ----------

     Für das Vision-Studio. Der Bereich „Plakatwand“ lädt diese Datei und
     die Konfiguration daneben und dreht dann an den Werten, ohne die
     Seite jedes Mal neu zu laden.

     Zwei Arten von Reglern, und sie kosten verschieden viel. Wer an der
     Lage, am Tempo, an den Ecken oder am Schleier dreht, braucht kein
     neues Raster: Der Schleier hängt an eigenen Eigenschaften, alles
     andere geht beim nächsten Zeichnen an den Shader. Wer am Kachelmaß,
     am Zuschnitt oder an der Zahl der Plakate je Spalte dreht, ändert das
     Raster selbst, und dann muss die Wand neu gebaut werden. Diese Liste
     sagt, welche Regler zu welcher Sorte gehören. */
  const NEU_BAUEN = ['tileMin', 'tileMax', 'tileShare', 'ratio', 'gap',
    'overX', 'overY', 'minPerColumn', 'columns'];

  window.DriftWall = {
    get: () => Object.assign({}, cfg),

    set(werte) {
      let bauen = false;
      for (const [name, wert] of Object.entries(werte || {})) {
        if (!(name in cfg) || cfg[name] === wert) continue;
        cfg[name] = wert;
        if (NEU_BAUEN.includes(name)) bauen = true;
      }
      stelleEin();
      if (bauen && sources.length) {
        build();
      } else if (wand) {
        /* Das Tempo steckt in jeder Spalte, es wird beim Bauen einmal
           ausgerechnet. Ohne Neubau muss es hier nachgezogen werden. */
        wand.columns.forEach((column, c) => { column.speed = velocity(c); });
        draw();
        run();
      }
    },
  };
})();
