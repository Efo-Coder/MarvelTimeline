/* Starter: Timeline und Bild-Studio in einem Rutsch.

   Aufruf
   ------
       node start.js
       node start.js --port 8080 --studio-port 5000 --kein-browser
       node start.js --ohne-studio
       node start.js --beobachten --kein-browser

   Danach steht die Fanpage unter http://127.0.0.1:4320 und das Bild-Studio
   unter http://127.0.0.1:4321. Beide Server lauschen nur auf der
   Loopback-Adresse, sie sind Werkzeuge für diesen Rechner und nicht fürs
   Netz gedacht. Strg+C beendet beide zusammen.

   Der neueste Start gewinnt: Hält ein hängen gebliebener früherer Start
   noch einen der Ports, wird er beendet statt den neuen zu blockieren.
   Ein Doppelklick auf start.cmd führt also immer zu laufenden Servern.

   Zwei Server, zwei Aufgaben
   -------------------------
   Die Fanpage braucht eigentlich keinen: index.html lässt sich auch direkt
   im Browser öffnen. Über http:// verhält sie sich aber wie im Web, und das
   Studio steht daneben unter einer festen Adresse. Den Statik-Teil macht
   diese Datei selbst, das Studio ist tools/portrait-studio/server.js und
   läuft als Kindprozess; seine Ausgabe steht eingerückt darunter.

   Beim Arbeiten am Studio
   -----------------------
   Mit --beobachten läuft das Studio unter node --watch: Eine Änderung an
   server.js startet es neu, ohne dass hier jemand etwas anklicken muss.
   Der Browser merkt das von selbst und lädt nach, siehe pruefeStand in
   tools/portrait-studio/studio.js. Zusammen mit --kein-browser ist das
   die Fassung für einen Server, der den ganzen Tag nebenher läuft, und
   genau so ruft ihn .vscode/tasks.json auf.
*/

'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn, execSync } = require('child_process');

const REPO = __dirname;
const STUDIO = path.join(REPO, 'tools', 'portrait-studio', 'server.js');

const argv = process.argv.slice(2);
const PORT = Number(wert('--port') || 4320);
const STUDIO_PORT = Number(wert('--studio-port') || 4321);
const OEFFNEN = !argv.includes('--kein-browser');
const MIT_STUDIO = !argv.includes('--ohne-studio');
const BEOBACHTEN = argv.includes('--beobachten');

function wert(flagge) {
  const i = argv.indexOf(flagge);
  return i === -1 ? null : argv[i + 1];
}

/* ---------- Statik-Server für die Fanpage ---------- */

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sende(res, 405, 'Nur GET und HEAD.', req.method);
  }

  const pfad = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  let ziel = path.resolve(REPO, '.' + pfad);

  /* Nichts außerhalb des Repos herausgeben, auch nicht über ../ */
  if (ziel !== REPO && !ziel.startsWith(REPO + path.sep)) {
    return sende(res, 403, 'Verboten.', req.method);
  }
  if (istOrdner(ziel)) ziel = path.join(ziel, 'index.html');

  fs.readFile(ziel, (fehler, inhalt) => {
    if (fehler) {
      console.log(`  404  ${pfad}`);
      return sende(res, 404, `Nicht gefunden: ${pfad}`, req.method);
    }
    sende(res, 200, inhalt, req.method,
      TYPEN[path.extname(ziel).toLowerCase()] || 'application/octet-stream');
  });
});

function istOrdner(pfad) {
  try {
    return fs.statSync(pfad).isDirectory();
  } catch {
    return false;
  }
}

/* Kein Zwischenspeicher: Wer an data.js oder style.css schreibt, will das
   Ergebnis nach dem Neuladen sehen und nicht den Stand von vorhin. */
function sende(res, code, daten, methode, typ) {
  const koerper = Buffer.isBuffer(daten) ? daten : Buffer.from(String(daten), 'utf8');
  res.writeHead(code, {
    'Content-Type': typ || 'text/plain; charset=utf-8',
    'Content-Length': koerper.length,
    'Cache-Control': 'no-store',
  });
  res.end(methode === 'HEAD' ? undefined : koerper);
}

/* ---------- Belegte Ports räumen ----------

   Der Starter ist ein Doppelklick-Werkzeug. Bleibt ein alter Start hängen,
   etwa weil sein Fenster nie geschlossen wurde, hält er die Ports und
   jeder neue Doppelklick liefe ins Leere. Deshalb gewinnt der neueste
   Start: Wer einen der Ports hält und ein node.exe ist, war ein früherer
   Start und wird beendet. Fremde Programme bleiben stehen, dann greift
   weiter die Meldung unten am Server. */

function portRaeumen(port) {
  let zeilen;
  try {
    zeilen = execSync('netstat -ano -p tcp', { encoding: 'utf8' }).split(/\r?\n/);
  } catch {
    return false;
  }

  /* Spalten: Proto, lokale Adresse, ferne Adresse, Zustand, PID. Der
     Zustand heißt je nach Sprache LISTENING oder ABHÖREN, deshalb zählt
     er nicht, nur die lokale Adresse mit genau diesem Port. */
  const pids = new Set();
  for (const zeile of zeilen) {
    const teile = zeile.trim().split(/\s+/);
    if (teile[0] !== 'TCP' || teile.length < 5) continue;
    if (!teile[1].endsWith(':' + port)) continue;
    const pid = teile[teile.length - 1];
    if (pid !== '0' && pid !== String(process.pid)) pids.add(pid);
  }

  let geraeumt = false;
  for (const pid of pids) {
    let name = '';
    try {
      name = execSync(`tasklist /fi "PID eq ${pid}" /fo csv /nh`, { encoding: 'utf8' });
    } catch { continue; }
    if (!name.toLowerCase().includes('"node.exe"')) {
      console.log(`Port ${port} hält ein fremdes Programm (PID ${pid}), es bleibt stehen.`);
      continue;
    }
    try {
      process.kill(Number(pid));
      console.log(`Port ${port} hielt noch ein früherer Start (PID ${pid}), er ist jetzt beendet.`);
      geraeumt = true;
    } catch { /* schon weg */ }
  }
  return geraeumt;
}

/* ---------- Das Studio als Kindprozess ---------- */

let studio = null;
let studioNeustarts = 0;

function studioStarten() {
  if (!fs.existsSync(STUDIO)) {
    console.log(`  Studio nicht gefunden: ${STUDIO}`);
    return;
  }
  /* process.execPath statt „node“: dasselbe Node, das hier schon läuft.

     Mit --watch startet node den Server nach jeder Änderung an server.js
     selbst neu. Der Kindprozess bleibt dabei derselbe, der exit-Zweig
     unten geht also nicht los, und das ist richtig so: Ein Neustart ist
     hier kein Absturz. */
  studio = spawn(process.execPath,
    [...(BEOBACHTEN ? ['--watch'] : []),
      STUDIO, '--port', String(STUDIO_PORT), '--kein-browser'],
    { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });

  einruecken(studio.stdout);
  einruecken(studio.stderr);

  /* Läuft das Studio eine Minute, gilt der Start als geglückt und ein
     späterer Absturz bekommt wieder einen Neustart. */
  const bewaehrt = setTimeout(() => { studioNeustarts = 0; }, 60000);

  studio.on('exit', (code, signal) => {
    studio = null;
    clearTimeout(bewaehrt);
    if (beendet) return;
    console.log(signal
      ? `  Studio beendet (${signal}).`
      : `  Studio beendet (Code ${code}).`);
    /* Einmal wieder aufhelfen, denn die Fanpage ohne Studio ist genau der
       Zustand, in dem der Starter kaputt wirkt. Stirbt es sofort wieder,
       steht der Grund oben im Protokoll und Neustarten hülfe nicht. */
    if (studioNeustarts < 1) {
      studioNeustarts += 1;
      console.log('  Studio wird neu gestartet …');
      setTimeout(studioStarten, 1500);
    } else {
      console.log('  Studio bleibt aus, es ist zweimal hintereinander beendet worden. '
        + 'Der Grund steht darüber. Die Fanpage läuft weiter.');
    }
  });
  studio.on('error', (fehler) => {
    studio = null;
    console.log(`  Studio ließ sich nicht starten: ${fehler.message}`);
  });
}

/* Zeilenweise, damit die Ausgabe der beiden Server nicht ineinanderläuft. */
function einruecken(strom) {
  let rest = '';
  strom.setEncoding('utf8');
  strom.on('data', (stueck) => {
    const zeilen = (rest + stueck).split('\n');
    rest = zeilen.pop();
    for (const zeile of zeilen) console.log('  │ ' + zeile);
  });
  strom.on('end', () => {
    if (rest) console.log('  │ ' + rest);
  });
}

/* ---------- Start und Ende ---------- */

let beendet = false;

function aufhoeren() {
  if (beendet) return;
  beendet = true;
  console.log('\nBeende beide Server …');
  if (studio) studio.kill();
  server.close(() => process.exit(0));
  /* Offene Verbindungen sollen den Feierabend nicht aufhalten. */
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on('SIGINT', aufhoeren);
process.on('SIGTERM', aufhoeren);

server.on('error', (fehler) => {
  if (fehler.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} ist von einem fremden Programm belegt. `
      + 'Mit --port eine andere Nummer wählen.');
    process.exit(1);
  }
  throw fehler;
});

function los() {
  /* Erst räumen, dann lauschen. Ein beendeter Vorgänger gibt den Port
     sofort frei, die kurze Pause ist nur Vorsicht. */
  let geraeumt = portRaeumen(PORT);
  if (MIT_STUDIO) geraeumt = portRaeumen(STUDIO_PORT) || geraeumt;
  setTimeout(lauschen, geraeumt ? 400 : 0);
}

function lauschen() {
  server.listen(PORT, '127.0.0.1', () => {
    const adresse = `http://127.0.0.1:${PORT}`;
    console.log('MCU Timeline – Fanpage');
    console.log(`  ${adresse}            Timeline`);
    console.log(`  ${adresse}/characters.html   Charaktere`);
    if (MIT_STUDIO) {
      console.log(`  http://127.0.0.1:${STUDIO_PORT}            Bild-Studio`);
    }
    if (MIT_STUDIO && BEOBACHTEN) {
      console.log('  Das Studio wird beobachtet: Änderungen kommen ohne Neustart an.');
    }
    console.log('  (beenden mit Strg+C)\n');

    if (MIT_STUDIO) studioStarten();
    if (OEFFNEN && process.platform === 'win32') {
      oeffnen(adresse);
      if (MIT_STUDIO) oeffnen(`http://127.0.0.1:${STUDIO_PORT}`);
    }
  });
}

los();

function oeffnen(adresse) {
  spawn('cmd', ['/c', 'start', '', adresse], { detached: true, stdio: 'ignore' }).unref();
}
