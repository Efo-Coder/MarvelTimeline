/* Prüft den Galaxie-Hintergrund nach.

   Der Umbau von Canvas auf WebGL2 sollte am Bild nichts ändern. Ob das
   stimmt, lässt sich nicht am Auge entscheiden, deshalb dieses Werkzeug:
   Es startet beide Renderer im selben Browser, schiebt sie Bild für Bild
   durch denselben Zeitverlauf und zählt die Abweichung Punkt für Punkt.

   Aufruf:

     node tools/galaxy-diff/pruefen.js            alle drei Prüfungen
     node tools/galaxy-diff/pruefen.js schichten  nur der Vergleich
     node tools/galaxy-diff/pruefen.js regler     wirkt jeder Regler?
     node tools/galaxy-diff/pruefen.js seite      läuft die echte Seite?

   Gebraucht wird Chrome und einmalig `npm i puppeteer-core` in diesem
   Ordner. Die Bilder landen in tools/galaxy-diff/out/ und sind über
   .gitignore ausgenommen.

   Zum Stand bei der Umstellung siehe den Abschnitt "Der Galaxie-
   Hintergrund" in der README. */
const http = require('http');
const fs = require('fs');
const path = require('path');

let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  console.error('puppeteer-core fehlt. Einmalig im Ordner tools/galaxy-diff:');
  console.error('  npm i puppeteer-core');
  process.exit(1);
}

const HERE = __dirname;
const REPO = path.resolve(HERE, '..', '..');
const OUT = path.join(HERE, 'out');
const PORT = 4399;

const CHROME_KANDIDATEN = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
const CHROME = CHROME_KANDIDATEN.find(p => p && fs.existsSync(p));

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.svg': 'image/svg+xml',
};

/* Die Prüfseite muss unter der Wurzel des Repos liegen, sonst zeigen die
   relativen Pfade zu js/ und assets/ ins Leere. Deshalb dieser kleine
   Server, der sie an genau eine Adresse einhängt. */
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const file = p === '/galaxy-diff.html'
    ? path.join(HERE, 'index.html')
    : path.join(REPO, (p === '/' ? '/index.html' : p).replace(/^\/+/, ''));
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});

function speichern(name, dataUrl) {
  if (!dataUrl) return;
  fs.writeFileSync(path.join(OUT, name), Buffer.from(dataUrl.split(',')[1], 'base64'));
}

/* Jede Zeile schaltet eine Schicht dazu. Was eine Zeile gegenüber der
   vorigen an Abweichung hinzufügt, geht auf genau diese Schicht. */
const SCHICHTEN = [
  { name: 'nur-grundbild', cfg: { nebGlow: 0, tintStrength: 0, starDensity: 0, shootingStars: false } },
  { name: 'plus-nebel', cfg: { tintStrength: 0, starDensity: 0, shootingStars: false } },
  { name: 'plus-schleier', cfg: { starDensity: 0, shootingStars: false } },
  { name: 'plus-feine-sterne', cfg: { brightDensity: 0, shootingStars: false } },
  { name: 'plus-helle-sterne', cfg: { shootingStars: false } },
  { name: 'voll-bewegt', cfg: { drift: 1 }, frames: 120, dt: 0.05 },
  { name: 'mit-schweifen', cfg: {}, frames: 260, dt: 0.05 },
];

const REGLER = [
  ['Nebel ganz aus/an', { nebGlow: 0 }, { nebGlow: 0.7 }],
  ['nebFactor 1 -> 4', {}, { nebFactor: 4 }],
  ['nebOctaves 5 -> 7', {}, { nebOctaves: 7 }],
  ['nebRoughness .5 -> .68', {}, { nebRoughness: 0.68 }],
  ['nebWarp 0 -> 0.35', {}, { nebWarp: 0.35 }],
  ['nebWarp bei nebGlow 3', { nebGlow: 3 }, { nebGlow: 3, nebWarp: 0.35 }],
  ['bgTint 0 -> 1', {}, { bgTint: 1 }],
  ['bgResample mip -> fein', {}, { bgResample: 'fein' }],
  ['tintStrength 0.4 -> 0', {}, { tintStrength: 0 }],
  ['timeScale 1 -> 3', { drift: 1 }, { drift: 1, timeScale: 3 }],
  ['faintDensity 1 -> 0', {}, { faintDensity: 0 }],
  ['brightDensity 1 -> 0', {}, { brightDensity: 0 }],
];

/* Sternschnuppen bekommen ihre eigene Prüfung, siehe galaxySchweife in
   index.html: Ein Vergleich zweier Standbilder trifft sie nur mit Glück. */
const SCHWEIFE = [
  ['Abstand 60 Sek.', { shootInterval: 60 }],
  ['Abstand 12.5 Sek.', { shootInterval: 12.5 }],
  ['Abstand 3 Sek.', { shootInterval: 3 }],
];

async function starten(browser, breite, hoehe) {
  const page = await browser.newPage();
  await page.setViewport({ width: breite, height: hoehe, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('  [fehler]', e.message));
  await page.goto(`http://127.0.0.1:${PORT}/galaxy-diff.html`, { waitUntil: 'load' });
  await page.waitForFunction('window.galaxyBereit && window.galaxyBereit()', { timeout: 60000 });
  const backend = await page.evaluate('window.galaxyBackend');
  if (backend !== 'webgl2') {
    console.log('WebGL2 kam nicht zustande, der Vergleich hätte keinen Sinn.');
    process.exit(1);
  }
  return page;
}

async function schichten(browser) {
  const page = await starten(browser, 1280, 720);
  console.log('\nAbweichung WebGL2 gegen Canvas, 1280 x 720, Stufen von 255');
  console.log('Schicht               Mittel   Max    >2%    >8%   >24%');
  console.log('---------------------------------------------------------');
  for (const fall of SCHICHTEN) {
    const r = await page.evaluate(f => window.galaxyDiff(f), fall);
    const s = r.stats;
    console.log(
      s.name.padEnd(20), String(s.mittel).padStart(7), String(s.max).padStart(5),
      String(s.ueber2).padStart(6), String(s.ueber8).padStart(6), String(s.ueber24).padStart(6)
    );
    speichern(`diff-${s.name}.png`, r.diff);
    const bild = await page.evaluate(f => window.galaxyShot(f), fall);
    speichern(`neu-${fall.name}.png`, bild.neu);
    speichern(`alt-${fall.name}.png`, bild.alt);
  }
  await page.close();
}

async function regler(browser) {
  const page = await starten(browser, 1280, 720);
  console.log('\nWirkt jeder Regler? WebGL2 gegen sich selbst');
  console.log('Regler                        Mittel   Max    >2%');
  console.log('--------------------------------------------------');
  for (const [name, a, b, frames, dt] of REGLER) {
    const r = await page.evaluate((x, y, f, d) => window.galaxyEigen(x, y, f, d), a, b, frames, dt);
    console.log(
      name.padEnd(28), String(r.mittel).padStart(7), String(r.max).padStart(5),
      String(r.ueber2).padStart(6), r.mittel < 0.2 ? '  <-- wirkt kaum' : ''
    );
    speichern('regler-' + name.replace(/[^a-z0-9]+/gi, '-') + '.png', r.diff);
  }

  console.log('\nSternschnuppen über zwanzig Sekunden, mit gegen ohne, je 400 Bilder');
  console.log('Einstellung          Bilder mit Schweif   stärkste Abweichung');
  console.log('-------------------------------------------------------------');
  for (const [name, cfg] of SCHWEIFE) {
    const r = await page.evaluate((c) => window.galaxySchweife({ cfg: c, frames: 400 }), cfg);
    console.log(name.padEnd(20), String(r.mitSchweif + ' von ' + r.bilder).padStart(18),
      String(r.groesster).padStart(21));
  }
  await page.close();
}

/* Die echte Seite, beide Renderer, zwei Größen. Gemessen wird der Abstand
   zwischen den Bildern, denn das ist die Zahl, die der Besucher merkt. */
async function seite(browser) {
  console.log('\nDie echte Seite, Abstand zwischen den Bildern');
  console.log('Seite                          Median     p95   über 20 ms  Fehler');
  console.log('-------------------------------------------------------------------');
  for (const [datei, breite, hoehe, zwang] of [
    ['index.html', 1920, 1080, false],
    ['index.html', 1920, 1080, true],
    ['characters.html', 1920, 1080, false],
    ['index.html', 3840, 2160, false],
    ['index.html', 3840, 2160, true],
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width: breite, height: hoehe, deviceScaleFactor: 1 });
    if (zwang) await page.evaluateOnNewDocument(() => { window.GALAXY_FORCE_CANVAS2D = true; });
    const fehler = new Set();
    page.on('pageerror', e => fehler.add('JS: ' + e.message));
    await page.goto(`http://127.0.0.1:${PORT}/${datei}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));

    const m = await page.evaluate(() => new Promise(fertig => {
      const dt = [];
      let vorher = performance.now(), n = 0;
      (function tick() {
        const jetzt = performance.now();
        dt.push(jetzt - vorher);
        vorher = jetzt;
        if (++n < 150) requestAnimationFrame(tick);
        else {
          const s = dt.slice(20).sort((a, b) => a - b);
          fertig({
            backend: window.Galaxy.backend,
            median: s[Math.floor(s.length / 2)],
            p95: s[Math.floor(s.length * 0.95)],
            lang: s.filter(v => v > 20).length,
            gesamt: s.length,
          });
        }
      })();
    }));

    const kennung = `${datei.replace('.html', '')} ${breite}x${hoehe} ${m.backend}`;
    console.log(
      kennung.padEnd(30), (m.median.toFixed(1) + ' ms').padStart(8),
      (m.p95.toFixed(1) + ' ms').padStart(8),
      String(m.lang + ' von ' + m.gesamt).padStart(12),
      fehler.size ? '  ' + [...fehler][0] : '  keine'
    );
    await page.screenshot({ path: path.join(OUT, `seite-${datei.replace('.html', '')}-${breite}${zwang ? '-2d' : ''}.png`) });
    await page.close();
  }
}

(async () => {
  if (!CHROME) {
    console.error('Kein Chrome und kein Edge gefunden.');
    process.exit(1);
  }
  const was = process.argv[2] || 'alles';
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--hide-scrollbars', '--force-device-scale-factor=1',
      '--ignore-gpu-blocklist', '--use-angle=d3d11'],
  });

  if (was === 'alles' || was === 'schichten') await schichten(browser);
  if (was === 'alles' || was === 'regler') await regler(browser);
  if (was === 'alles' || was === 'seite') await seite(browser);

  console.log('\nBilder in', path.relative(REPO, OUT).replace(/\\/g, '/'));
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
