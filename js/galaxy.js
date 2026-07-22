/* Animierter Galaxie-Hintergrund auf einem Fullscreen-Canvas:
   Sternenfeld mit Funkeln, farbige Nebelwolken, helle Sterne mit
   Kreuz-Strahlen und gelegentliche Sternschnuppen.

   Die Nebelfarben blenden weich zur Akzent-Palette der gerade sichtbaren
   Phase über – main.js ruft dafür Galaxy.setPalette(...) auf. */
(function () {
  'use strict';

  const canvas = document.getElementById('galaxy');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const NEB_W = 320;      // interne Breite der Nebel-Ebene, wird weich hochskaliert
  const STAR_COUNT = 430;
  const BLOB_COUNT = 7;   // Anzahl Nebelwolken
  const FALLBACK = [[70, 110, 255], [150, 70, 230], [60, 200, 140]];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const neb = document.createElement('canvas');
  const nctx = neb.getContext('2d');

  let W = 0, H = 0, nebH = 200;
  let baseGradient = null, vignette = null;
  let stars = [], flares = [], blobs = [];
  let shoot = null, nextShoot = 2;

  /* Verteilt eine Palette beliebiger Länge auf die Nebelwolken: pro Blob
     eine Farbe, frühe Farben bekommen bei Überhang mehr Wolken. Bei drei
     Farben ergibt das die gewohnte Gewichtung 3×/2×/2×, bei sechs (Hero:
     alle Phasen-Akzente) ist jede Farbe mindestens einmal vertreten. */
  function expandPalette(colors) {
    return Array.from({ length: BLOB_COUNT }, (_, i) =>
      colors[Math.floor(i * colors.length / BLOB_COUNT)].slice());
  }

  let current = expandPalette(typeof DEFAULT_NEBULA !== 'undefined' ? DEFAULT_NEBULA : FALLBACK);
  let target = current.map(c => c.slice());

  // Deterministischer Zufallsgenerator (mulberry32) mit festem Seed,
  // damit die Galaxy bei jedem Laden identisch aussieht.
  const random = (function (seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })(24601357);

  function rand(a, b) { return a + random() * (b - a); }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    nebH = Math.max(140, Math.round(NEB_W * H / Math.max(W, 1)));
    neb.width = NEB_W;
    neb.height = nebH;

    baseGradient = ctx.createLinearGradient(0, 0, 0, H);
    baseGradient.addColorStop(0, '#070a16');
    baseGradient.addColorStop(0.55, '#04060f');
    baseGradient.addColorStop(1, '#02030a');

    vignette = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.35,
      W / 2, H / 2, Math.max(W, H) * 0.72
    );
    vignette.addColorStop(0, 'rgba(1,2,8,0)');
    vignette.addColorStop(1, 'rgba(1,2,8,0.55)');

    if (reduceMotion) render(0, 0);
  }

  function init() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: random(), y: random(),
      r: rand(0.3, 1.5),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.4, 1.8),
      drift: rand(0.0008, 0.004),
      tint: random() < 0.18 ? 'warm' : (random() < 0.3 ? 'cool' : 'white'),
    }));

    flares = Array.from({ length: 4 }, () => ({
      x: rand(0.08, 0.92), y: rand(0.12, 0.8),
      size: rand(30, 60),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.25, 0.6),
    }));

    // Jeder Blob hat einen eigenen Farb-Slot; expandPalette füllt die
    // Slots aus der aktiven Palette (Phase: 3 Farben, Hero: alle Akzente).
    blobs = Array.from({ length: BLOB_COUNT }, (_, slot) => ({
      slot,
      cx: rand(0.08, 0.92),
      cy: rand(0.1, 0.9),
      r: rand(0.2, 0.42),
      squash: rand(0.5, 0.95),
      rot: rand(0, Math.PI),
      orbit: rand(0.02, 0.05),
      orbitSpeed: rand(0.02, 0.06),
      pulseSpeed: rand(0.08, 0.2),
      phase: rand(0, Math.PI * 2),
    }));
  }

  function drawNebula(t) {
    nctx.setTransform(1, 0, 0, 1, 0, 0);
    nctx.clearRect(0, 0, NEB_W, nebH);
    nctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      const c = current[b.slot];
      const cx = (b.cx + b.orbit * Math.cos(t * b.orbitSpeed + b.phase)) * NEB_W;
      const cy = (b.cy + b.orbit * Math.sin(t * b.orbitSpeed * 0.8 + b.phase)) * nebH;
      const R = b.r * NEB_W;
      const a = 0.42 + 0.12 * Math.sin(t * b.pulseSpeed + b.phase);
      const rgb = Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]);
      nctx.save();
      nctx.translate(cx, cy);
      nctx.rotate(b.rot);
      nctx.scale(1, b.squash);
      const g = nctx.createRadialGradient(0, 0, 0, 0, 0, R);
      g.addColorStop(0, 'rgba(' + rgb + ',' + a.toFixed(3) + ')');
      g.addColorStop(0.45, 'rgba(' + rgb + ',' + (a * 0.35).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + rgb + ',0)');
      nctx.fillStyle = g;
      nctx.beginPath();
      nctx.arc(0, 0, R, 0, Math.PI * 2);
      nctx.fill();
      nctx.restore();
    }
    nctx.globalCompositeOperation = 'source-over';
  }

  function drawStars(t) {
    for (const s of stars) {
      const x = ((s.x + t * s.drift) % 1) * W;
      const y = s.y * H;
      const tw = reduceMotion ? 0.85 : 0.62 + 0.38 * Math.sin(t * s.speed + s.phase);
      let color;
      if (s.tint === 'warm') color = '255,224,190';
      else if (s.tint === 'cool') color = '190,210,255';
      else color = '235,240,255';
      ctx.fillStyle = 'rgba(' + color + ',' + tw.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFlares(t) {
    ctx.globalCompositeOperation = 'lighter';
    for (const f of flares) {
      const x = f.x * W, y = f.y * H;
      const pulse = reduceMotion ? 0.8 : 0.65 + 0.35 * Math.sin(t * f.speed + f.phase);
      const s = f.size * pulse;

      const g = ctx.createRadialGradient(x, y, 0, x, y, s);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.15, 'rgba(220,230,255,0.35)');
      g.addColorStop(1, 'rgba(220,230,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();

      // Kreuz-Strahlen wie bei hellen Sternen auf dem Original-Panel
      const beam = s * 2.2;
      const alpha = (0.5 * pulse).toFixed(3);
      const lg = ctx.createLinearGradient(x - beam, y, x + beam, y);
      lg.addColorStop(0, 'rgba(255,255,255,0)');
      lg.addColorStop(0.5, 'rgba(255,255,255,' + alpha + ')');
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(x - beam, y - 0.6, beam * 2, 1.2);

      const vg = ctx.createLinearGradient(x, y - beam, x, y + beam);
      vg.addColorStop(0, 'rgba(255,255,255,0)');
      vg.addColorStop(0.5, 'rgba(255,255,255,' + alpha + ')');
      vg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = vg;
      ctx.fillRect(x - 0.6, y - beam, 1.2, beam * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function updateShoot(t, dt) {
    if (reduceMotion) return;
    if (!shoot) {
      if (t > nextShoot) {
        const ang = rand(Math.PI * 0.12, Math.PI * 0.3);
        shoot = {
          x: rand(0.05, 0.75) * W, y: rand(0.05, 0.35) * H,
          dx: Math.cos(ang), dy: Math.sin(ang),
          speed: rand(700, 1100), len: rand(120, 200),
          life: 0, maxLife: rand(0.6, 0.9),
        };
      }
      return;
    }
    shoot.life += dt;
    shoot.x += shoot.dx * shoot.speed * dt;
    shoot.y += shoot.dy * shoot.speed * dt;
    if (shoot.life >= shoot.maxLife) {
      shoot = null;
      nextShoot = t + rand(2.5, 6);
      return;
    }
    const a = Math.sin(Math.PI * shoot.life / shoot.maxLife) * 0.85;
    const tx = shoot.x - shoot.dx * shoot.len;
    const ty = shoot.y - shoot.dy * shoot.len;
    const g = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty);
    g.addColorStop(0, 'rgba(255,255,255,' + a.toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(shoot.x, shoot.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }

  function lerpColors() {
    for (let i = 0; i < current.length; i++) {
      for (let k = 0; k < 3; k++) {
        current[i][k] += (target[i][k] - current[i][k]) * 0.035;
      }
    }
  }

  function render(t, dt) {
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, W, H);

    drawNebula(t);
    ctx.globalAlpha = 0.95;
    ctx.drawImage(neb, 0, 0, W, H);
    ctx.globalAlpha = 1;

    drawStars(t);
    drawFlares(t);
    updateShoot(t, dt);

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  let last = 0;
  function loop(ms) {
    const t = ms / 1000;
    const dt = Math.min(0.05, t - last || 0.016);
    last = t;
    lerpColors();
    render(t, dt);
    requestAnimationFrame(loop);
  }

  window.Galaxy = {
    setPalette(colors) {
      target = expandPalette(colors);
      if (reduceMotion) {
        current = expandPalette(colors);
        render(0, 0);
      }
    },
  };

  window.addEventListener('resize', resize);
  init();
  resize();
  if (!reduceMotion) requestAnimationFrame(loop);
})();
