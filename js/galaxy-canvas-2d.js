/* Rückfallebene der Galaxie auf einem 2D-Canvas.

   Das ist die Fassung, die bis zum Umbau auf WebGL2 die einzige war. Sie
   springt nur noch ein, wenn der Browser kein WebGL2 kann oder der
   Kontext verloren geht und sich nicht wiederherstellen lässt. Gestartet
   wird sie ausschließlich von js/galaxy.js, von selbst tut sie nichts.

   Der Aufbau stammt aus dem Design-Projekt "Galaxy Website" und ist von
   React auf reines JavaScript übertragen. Von unten nach oben: ein
   Grundbild, zwei prozedural erzeugte Nebelfelder, die pulsierende Sonne
   links oben, ein feines Sternenfeld, die hellen Sterne mit Funkeln,
   gelegentliche Sternschnuppen und zuletzt drei abdunkelnde Verläufe.
   Alles ab der zweiten Schicht wird additiv gezeichnet, deshalb hellt
   jede Lage die darunter auf, statt sie zu verdecken.

   Dazu kommt der Phasenschleier, den die Vorlage nicht kennt: main.js und
   characters.js melden über Galaxy.setPalette(...) die Akzentfarben der
   gerade sichtbaren Phase. Diese Datei legt sie als weichen Verlauf über
   die Nebelfelder, sodass der Hintergrund weiterhin der Timeline folgt.

   Die Regler stehen in js/galaxy-config.js. Zwei wirken hier nicht:
   nebFactor und bgTint brauchen die GPU. nebOctaves und nebWarp wirken,
   kosten auf der CPU aber spürbar Zeit beim Seitenaufbau. */
(function () {
  'use strict';

  window.GalaxyCanvas2D = { start: start };

  function start(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const CFG = window.GALAXY_CONFIG;
    const FIX = window.GALAXY_FIXED;
    const REGIONS = window.GALAXY_REGIONS;

    const NEB_W = FIX.nebW, NEB_H = FIX.nebH;
    const STAR_MARGIN = FIX.starMargin;
    const SPRITE_SIZE = FIX.spriteSize;
    const TINT_SLOTS = FIX.tintSlots;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, dpr = 1;
    let sprites = null, neb1 = null, neb2 = null;
    let faint = null, stars = [];
    let shots = [], nextShot = 3.2;
    let vignette = null, scrimRadial = null, scrimLinear = null;
    let orb = null;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const bg = new Image();
    let bgReady = false;

    /* Verteilt eine Palette beliebiger Länge auf die festen Farbplätze des
       Schleiers. Eine Phase liefert drei Farben und belegt damit je zwei
       Plätze, der Seitenanfang liefert alle sechs Akzente und je einen. */
    function expandPalette(colors) {
      return Array.from({ length: TINT_SLOTS }, (_, i) =>
        colors[Math.floor(i * colors.length / TINT_SLOTS)].slice());
    }

    let current = expandPalette(typeof DEFAULT_NEBULA !== 'undefined' ? DEFAULT_NEBULA : FIX.fallback);
    let target = current.map(c => c.slice());

    /* Deterministischer Zufallsgenerator (mulberry32). Die Vorlage zieht ihr
       Sternenfeld aus Math.random und würfelt es damit bei jedem Laden und
       sogar bei jeder Größenänderung des Fensters neu. Mit festem Startwert
       steht derselbe Himmel, und das Bild springt beim Skalieren nicht um. */
    function makeRandom(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    let shootRandom = makeRandom(FIX.seedShoot);

    /* Ganzzahliger Hash als Grundlage des Rauschens: Aus denselben
       Koordinaten fällt immer derselbe Wert, ohne dass ein Gitter im
       Speicher liegen muss. */
    function hash(x, y, s) {
      let n = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(s | 0, 0x9e3779b1);
      n = Math.imul(n ^ (n >>> 15), 0x85ebca6b);
      n ^= n >>> 13;
      return (n >>> 0) / 4294967295;
    }

    function vnoise(x, y, s) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = hash(xi, yi, s), b = hash(xi + 1, yi, s);
      const c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
      return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
    }

    /* Mehrere Oktaven übereinander, jede doppelt so fein und um
       nebRoughness schwächer als die vorige. */
    function fbm(x, y, s) {
      let f = 1, a = 0.5, sum = 0, norm = 0;
      for (let i = 0; i < CFG.nebOctaves; i++) {
        sum += a * vnoise(x * f, y * f, s + i * 37);
        norm += a; f *= 2; a *= CFG.nebRoughness;
      }
      return sum / norm;
    }

    /* Ein Stern wird nicht als Kreis gezeichnet, sondern als kleines Bild mit
       weichem Halo. Drei Vorlagen reichen für den ganzen Himmel, und das
       Zeichnen kostet danach nur noch ein Aufziehen pro Stern. */
    function makeSprite(r, g, b) {
      const S = SPRITE_SIZE;
      const c = document.createElement('canvas');
      c.width = S; c.height = S;
      const x = c.getContext('2d');
      const grd = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      const rgb = r + ',' + g + ',' + b;
      grd.addColorStop(0, 'rgba(' + rgb + ',1)');
      grd.addColorStop(0.14, 'rgba(' + rgb + ',0.55)');
      grd.addColorStop(0.4, 'rgba(' + rgb + ',0.12)');
      grd.addColorStop(1, 'rgba(' + rgb + ',0)');
      x.fillStyle = grd;
      x.fillRect(0, 0, S, S);
      return c;
    }

    /* Ein Nebelfeld entsteht einmalig Pixel für Pixel. Jeder Bereich trägt
       dort bei, wo er reicht, gedämpft nach außen und durchzogen vom
       Rauschen. Die Deckkraft folgt dem hellsten Farbkanal, damit dunkle
       Stellen wirklich durchsichtig bleiben.

       Die Auflösung bleibt hier fest bei 400 x 288. Jeder Punkt kostet
       dreißig Rauschabfragen auf der CPU, das Vierfache an Kantenlänge
       wäre das Sechzehnfache an Rechenzeit und würde den Seitenaufbau
       sekundenlang blockieren. Feiner geht nur auf der GPU. */
    function makeNebula(seed) {
      const c = document.createElement('canvas');
      c.width = NEB_W; c.height = NEB_H;
      const cx = c.getContext('2d');
      const img = cx.createImageData(NEB_W, NEB_H);
      const d = img.data;
      for (let y = 0; y < NEB_H; y++) {
        const v = y / NEB_H;
        for (let x = 0; x < NEB_W; x++) {
          const u = x / NEB_W;
          let r = 0, g = 0, b = 0;
          for (let i = 0; i < REGIONS.length; i++) {
            const R = REGIONS[i];
            const du = (u - R.x) / R.rx, dv = (v - R.y) / R.ry;
            const dist = Math.sqrt(du * du + dv * dv);
            if (dist >= 1) continue;
            const fall = Math.pow(1 - dist, 1.8);
            let qx = u * R.sc * 1.4, qy = v * R.sc;
            if (CFG.nebWarp > 0) {
              /* Domain-Verzerrung: Das Rauschen fragt sich selbst nach der
                 Stelle, an der es abgelesen wird. Aus runden Wolken werden
                 dadurch gezogene, wirbelnde Schwaden. */
              const wx = fbm(qx + 1.7, qy + 9.2, seed + i * 31 + 991);
              const wy = fbm(qx + 8.3, qy + 2.8, seed + i * 31 + 1777);
              qx += CFG.nebWarp * (wx * 2 - 1);
              qy += CFG.nebWarp * (wy * 2 - 1);
            }
            let n = fbm(qx, qy, seed + i * 31);
            n = R.ridged ? Math.pow(1 - Math.abs(n * 2 - 1), 2.3) : Math.pow(n, 1.7);
            const a = fall * n * R.amp;
            r += R.col[0] * a; g += R.col[1] * a; b += R.col[2] * a;
          }
          const o = (y * NEB_W + x) * 4;
          d[o] = Math.min(255, r);
          d[o + 1] = Math.min(255, g);
          d[o + 2] = Math.min(255, b);
          d[o + 3] = Math.min(255, Math.max(r, g, b) * 1.2);
        }
      }
      cx.putImageData(img, 0, 0);
      return c;
    }

    /* Feine Sterne kommen auf eine eigene Ebene, die als Ganzes verschoben
       wird. Über tausend einzelne Kreise pro Bild wären zu teuer, und
       bewegen müssen sie sich ohnehin nur gemeinsam. Die hellen Sterne
       bleiben einzeln, weil jeder für sich funkelt. */
    function buildStars() {
      if (!W || !H) return;
      const faintRandom = makeRandom(FIX.seedFaint);
      const brightRandom = makeRandom(FIX.seedBright);
      const m = STAR_MARGIN;
      const area = (W * H) / (1440 * 900);
      const scale = Math.max(0.4, area) * CFG.starDensity;

      const c = document.createElement('canvas');
      c.width = Math.ceil((W + 2 * m) * dpr);
      c.height = Math.ceil((H + 2 * m) * dpr);
      const cx = c.getContext('2d');
      cx.scale(dpr, dpr);
      const faintN = Math.round(1100 * scale * CFG.faintDensity);
      for (let i = 0; i < faintN; i++) {
        const t = faintRandom();
        const col = t < 0.72 ? '255,255,255' : (t < 0.88 ? '196,212,255' : '255,232,196');
        cx.fillStyle = 'rgba(' + col + ',' + (0.16 + faintRandom() * 0.5).toFixed(3) + ')';
        cx.beginPath();
        cx.arc(faintRandom() * (W + 2 * m), faintRandom() * (H + 2 * m), 0.2 + faintRandom() * 0.75, 0, 6.2832);
        cx.fill();
      }
      faint = c;

      const brightN = Math.round(120 * scale * CFG.brightDensity);
      stars = [];
      for (let i = 0; i < brightN; i++) {
        const t = brightRandom();
        stars.push({
          x: brightRandom() * (W + 140) - 70,
          y: brightRandom() * (H + 140) - 70,
          r: 0.55 + brightRandom() * 1.25,
          a: 0.42 + brightRandom() * 0.5,
          ph: brightRandom() * 6.2832,
          sp: 0.35 + brightRandom() * 1.7,
          s: t < 0.72 ? sprites.w : (t < 0.88 ? sprites.b : sprites.y),
        });
      }
    }

    /* Die Größe kommt vom Canvas selbst, nicht vom Fenster, damit dieselbe
       Datei auch in einer Tafel des Bild-Studios laufen kann. Auf der
       Seite liegt das Canvas fest über allem, dort ist beides dasselbe.
       Die Lage merkt sich resize gleich mit, damit die Parallaxe nicht bei
       jeder Zeigerbewegung das Layout befragen muss. */
    let rect = { left: 0, top: 0, width: 1, height: 1 };

    function resize() {
      if (paused) return;
      const r = canvas.getBoundingClientRect();
      const neuDpr = Math.min(window.devicePixelRatio || 1, 2);
      const neuW = Math.max(1, Math.round(r.width));
      const neuH = Math.max(1, Math.round(r.height));
      rect = { left: r.left, top: r.top, width: r.width || 1, height: r.height || 1 };
      if (neuW === W && neuH === H && neuDpr === dpr) return;
      dpr = neuDpr; W = neuW; H = neuH;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      vignette = ctx.createRadialGradient(
        W / 2, H * 0.5, Math.min(W, H) * 0.2,
        W / 2, H * 0.5, Math.max(W, H) * 0.78
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.5)');

      /* Die beiden abdunkelnden Verläufe der Vorlage lagen dort als eigene
         Ebene über dem Canvas. Hier gehören sie in dasselbe Bild, damit der
         Hintergrund eine einzige Schicht bleibt und die Seiten nichts davon
         wissen müssen. Der senkrechte nimmt Kopf und Fuß zurück, der runde
         dunkelt die Mitte ab, damit die Schrift darauf ruhig steht. */
      scrimLinear = ctx.createLinearGradient(0, 0, 0, H);
      scrimLinear.addColorStop(0, 'rgba(3,3,12,0.6)');
      scrimLinear.addColorStop(0.22, 'rgba(3,3,12,0)');
      scrimLinear.addColorStop(0.78, 'rgba(3,3,12,0)');
      scrimLinear.addColorStop(1, 'rgba(3,3,12,0.5)');

      /* Im Einheitskreis angelegt und beim Zeichnen auf die Ellipse
         gezogen, denn Canvas kennt nur runde Verläufe. */
      scrimRadial = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      scrimRadial.addColorStop(0, 'rgba(3,3,12,0.55)');
      scrimRadial.addColorStop(0.72, 'rgba(3,3,12,0)');
      scrimRadial.addColorStop(1, 'rgba(3,3,12,0)');

      buildStars();
      if (reduceMotion) frame(0, 0);
    }

    function init() {
      sprites = {
        w: makeSprite(255, 255, 255),
        b: makeSprite(186, 203, 255),
        y: makeSprite(255, 226, 176),
      };
      neb1 = makeNebula(FIX.seedNeb1);
      neb2 = makeNebula(FIX.seedNeb2);

      bg.onload = function () {
        bgReady = true;
        if (reduceMotion) frame(0, 0);
      };
      /* Der Pfad steht relativ zur Seite. Das Bild-Studio läuft auf einem
         eigenen Server und setzt deshalb einen Vorsatz davor. */
      bg.src = (window.GALAXY_BASE || '') + FIX.bgSrc;
    }

    /* Verlauf über die Bildschirmdiagonale, ein Halt je Farbplatz. Bei einer
       Phase sind das ihre drei Akzente, am Seitenanfang alle sechs. */
    function paletteGradient() {
      const g = ctx.createLinearGradient(0, 0, W, H);
      for (let i = 0; i < current.length; i++) {
        const c = current[i];
        const stop = current.length > 1 ? i / (current.length - 1) : 0;
        g.addColorStop(stop, 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')');
      }
      return g;
    }

    function updateShots(t, dt) {
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
          /* Streuung um den mittleren Abstand. Bei 12.5 sind das genau
             die 7 bis 18 Sekunden der Vorlage. */
          nextShot = CFG.shootInterval * (0.56 + 0.88 * shootRandom());
        }
      }
      for (let i = shots.length - 1; i >= 0; i--) {
        const sh = shots[i];
        sh.life += dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        const k = sh.life / sh.max;
        if (k >= 1 || sh.x > W + 200 || sh.y > H + 200) { shots.splice(i, 1); continue; }
        const fade = Math.sin(Math.PI * k);
        const n = Math.hypot(sh.vx, sh.vy) || 1;
        const tx = sh.x - (sh.vx / n) * sh.len, ty = sh.y - (sh.vy / n) * sh.len;
        const g = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
        g.addColorStop(0, 'rgba(255,255,255,' + (0.85 * fade).toFixed(3) + ')');
        g.addColorStop(0.35, 'rgba(198,214,255,' + (0.25 * fade).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(160,190,255,0)');
        ctx.globalAlpha = 1;
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    }

    function lerpColors() {
      for (let i = 0; i < current.length; i++) {
        for (let k = 0; k < 3; k++) {
          current[i][k] += (target[i][k] - current[i][k]) * CFG.tintEase;
        }
      }
    }

    function frame(rawT, dt) {
      const t = rawT * CFG.timeScale;
      const speed = (reduceMotion ? CFG.drift * 0.2 : CFG.drift) * CFG.timeScale;

      mouse.x += (mouse.tx - mouse.x) * 0.035;
      mouse.y += (mouse.ty - mouse.y) * 0.035;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#03030a';
      ctx.fillRect(0, 0, W, H);

      /* Das Grundbild wird etwas größer aufgezogen als der Schirm, sonst
         gäbe die Parallaxe an den Rändern eine Lücke frei. Die Sonne sitzt
         auf einem festen Punkt im Bild und wandert deshalb mit. */
      if (bgReady) {
        const ox = Math.sin(t * 0.017 * speed) * W * 0.02 - mouse.x * CFG.parallaxX;
        const oy = Math.cos(t * 0.013 * speed) * H * 0.02 - mouse.y * CFG.parallaxY;
        /* So groß, dass die weiteste Verschiebung an keinem Rand eine Lücke
           freigibt, und keinen Punkt größer. randX und randY sind der Weg,
           den Wandern und Parallaxe zusammen zurücklegen, das Teilen durch
           (1 - atmen) fängt den kleinsten Stand des atmenden Zooms ab.
           Steht drift auf 0, fallen alle drei Bewegungen bis auf die
           Parallaxe weg und das Bild sitzt entsprechend weiter offen. */
        const atmen = 0.035 * Math.abs(speed);
        const randX = 0.02 * W * Math.abs(speed) + CFG.parallaxX;
        const randY = 0.02 * H * Math.abs(speed) + CFG.parallaxY;
        const s = CFG.bgZoom / (1 - atmen)
          * Math.max((W + 2 * randX) / bg.width, (H + 2 * randY) / bg.height)
          * (1 + 0.035 * Math.sin(t * 0.05 * speed));
        const dw = bg.width * s, dh = bg.height * s;
        const dx = (W - dw) / 2 + ox, dy = (H - dh) / 2 + oy;
        ctx.drawImage(bg, dx, dy, dw, dh);
        orb = { x: dx + dw * 0.118, y: dy + dh * 0.312, r: dw * 0.085 };
      }

      ctx.globalCompositeOperation = 'lighter';

      const nx = Math.sin(t * 0.011 * speed) * W * 0.05;
      const ny = Math.cos(t * 0.008 * speed) * H * 0.04;
      ctx.globalAlpha = Math.max(0, CFG.nebGlow * (0.30 + 0.08 * CFG.nebPulse * Math.sin(t * 0.09)));
      ctx.drawImage(neb1, -W * 0.08 + nx, -H * 0.08 + ny, W * 1.16, H * 1.16);
      ctx.globalAlpha = Math.max(0, CFG.nebGlow * (0.20 + 0.07 * CFG.nebPulse * Math.cos(t * 0.062)));
      ctx.drawImage(neb2, -W * 0.14 - nx * 1.5, -H * 0.11 - ny * 1.3, W * 1.28, H * 1.22);

      /* Der Phasenschleier liegt über Grundbild und Nebel, aber noch vor
         Sonne und Sternen, damit die Sonne golden und die Sterne weiß
         bleiben. overlay behält die Helligkeitsstruktur des Bildes und
         dreht nur den Farbton. Ein additiver Schleier täte das nicht: Der
         würde die Schwärze zwischen den Sternen mit aufhellen und das ganze
         Bild flau machen. */
      if (CFG.tintStrength > 0) {
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = CFG.tintStrength;
        ctx.fillStyle = paletteGradient();
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
      }

      if (orb) {
        const p = 0.5 + 0.5 * CFG.sunPulse * Math.sin(t * 0.5);
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, 'rgba(255,243,182,' + (0.26 + 0.16 * p).toFixed(3) + ')');
        g.addColorStop(0.22, 'rgba(255,214,92,' + (0.13 + 0.09 * p).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,186,52,0)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, 6.2832);
        ctx.fill();
      }

      if (faint) {
        const m = STAR_MARGIN;
        const fx = Math.sin(t * 0.02 * speed) * 24 - mouse.x * 26;
        const fy = Math.cos(t * 0.016 * speed) * 18 - mouse.y * 18;
        ctx.globalAlpha = 0.92;
        ctx.drawImage(faint, -m + fx, -m + fy, W + 2 * m, H + 2 * m);
      }

      /* Die hellen Sterne laufen weiter aus der Mitte als die feinen, das
         gibt dem Feld Tiefe. */
      const tw = CFG.twinkle && !reduceMotion;
      const px = Math.sin(t * 0.021 * speed) * 36 - mouse.x * 42;
      const py = Math.cos(t * 0.015 * speed) * 26 - mouse.y * 30;
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const f = tw ? 0.5 + 0.5 * Math.sin(t * CFG.twinkleSpeed * st.sp + st.ph) : 0.8;
        const sz = st.r * (0.85 + 0.35 * f) * 11;
        ctx.globalAlpha = Math.min(1, st.a * (0.42 + 0.58 * f));
        ctx.drawImage(st.s, st.x + px - sz / 2, st.y + py - sz / 2, sz, sz);
      }

      updateShots(t, dt);

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = scrimLinear;
      ctx.fillRect(0, 0, W, H);

      const rx = W * 0.62, ry = H * 0.46;
      ctx.save();
      ctx.translate(W * 0.5, H * 0.46);
      ctx.scale(rx, ry);
      ctx.fillStyle = scrimRadial;
      ctx.fillRect(-(W * 0.5) / rx, -(H * 0.46) / ry, W / rx, H / ry);
      ctx.restore();
    }

    let last = 0, t0 = 0, paused = false;
    function loop(ms) {
      if (paused) return;
      const t = (ms - t0) / 1000;
      const dt = Math.min(0.05, t - last || 0.016);
      last = t;
      lerpColors();
      frame(t, dt);
      requestAnimationFrame(loop);
    }

    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(canvas);
    window.addEventListener('resize', resize);

    if (!reduceMotion) {
      window.addEventListener('pointermove', function (e) {
        mouse.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouse.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      });
    }

    init();
    resize();
    if (!reduceMotion) {
      requestAnimationFrame(function (ms) {
        t0 = ms;
        requestAnimationFrame(loop);
      });
    }

    return {
      backend: 'canvas2d',
      setPalette: function (colors) {
        target = expandPalette(colors);
        if (reduceMotion) {
          current = expandPalette(colors);
          frame(0, 0);
        }
      },
      /* Für den Vergleich in tools/galaxy-diff: ein einzelnes Bild zu
         einem festgelegten Zeitpunkt, ohne Schleife und ohne Mauszeiger. */
      renderAt: function (t, dt) {
        mouse.x = mouse.tx; mouse.y = mouse.ty;
        frame(t, dt === undefined ? 0.016 : dt);
      },
      /* Ohne Überblendung sofort auf die Zielfarben stellen. */
      snapPalette: function () {
        current = target.map(c => c.slice());
      },

      /* Die Sternschnuppen auf den Anfang zurückstellen, samt ihrem
         Zufallsgenerator. Für den Vergleich, siehe js/galaxy.js. */
      resetShots: function () {
        shots = [];
        nextShot = 3.2;
        shootRandom = makeRandom(FIX.seedShoot);
      },

      /* Steht das Grundbild schon? Nur für den Vergleich gedacht. */
      ready: function () {
        return bgReady;
      },

      /* Nebelbilder mit den aktuellen Reglern neu rechnen. Auf der CPU
         dauert das gut eine halbe Sekunde, deshalb nur auf Zuruf. */
      rebake: function () {
        neb1 = makeNebula(FIX.seedNeb1);
        neb2 = makeNebula(FIX.seedNeb2);
      },

      /* Sternenfeld mit den aktuellen Dichten neu würfeln. Von selbst
         passiert das nur, wenn sich die Größe ändert. */
      rebuildStars: buildStars,

      /* Anhalten und weiterlaufen lassen, für Stellen, an denen die
         Galaxie gerade niemand sieht. */
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
  }
})();
