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
   im Browser öffnen. Über http:// verhält sie sich aber wie im Web, sie
   lädt nach jeder Änderung von selbst nach (siehe „Änderungen kommen von
   selbst an“ weiter unten), und das Studio steht daneben unter einer festen
   Adresse. Den Statik-Teil macht diese Datei selbst, das Studio ist
   tools/portrait-studio/server.js und läuft als Kindprozess; seine Ausgabe
   steht eingerückt darunter.

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

const crypto = require('crypto');
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

  /* Die einzige Adresse, hinter der keine Datei liegt: der Ereignisstrom,
     über den die offene Seite von Änderungen erfährt. */
  if (pfad === MELDEWEG) {
    if (req.method !== 'GET') return sende(res, 405, 'Nur GET.', req.method);
    return horchen(res);
  }

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
    const typ = TYPEN[path.extname(ziel).toLowerCase()] || 'application/octet-stream';
    sende(res, 200, typ.startsWith('text/html') ? mitZuhoerer(inhalt) : inhalt, req.method, typ);
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
   Ergebnis sehen und nicht den Stand von vorhin. */
function sende(res, code, daten, methode, typ) {
  const koerper = Buffer.isBuffer(daten) ? daten : Buffer.from(String(daten), 'utf8');
  res.writeHead(code, {
    'Content-Type': typ || 'text/plain; charset=utf-8',
    'Content-Length': koerper.length,
    'Cache-Control': 'no-store',
  });
  res.end(methode === 'HEAD' ? undefined : koerper);
}

/* ---------- Änderungen kommen von selbst an ----------

   An data.js, style.css und den Skripten wird gearbeitet, während die
   Seite offen daneben liegt. Ausgeliefert wird zwar bei jedem Laden
   frisch, siehe no-store oben, aber ein Tab, der schon offen ist, lädt
   von sich aus nie: Jede Änderung wollte bisher mit F5 angesehen werden.

   Deshalb hört der Browser hier zu. Ein Wächter über den Ordnern mit den
   Seitendateien meldet jede Änderung über einen Ereignisstrom, und die
   Seite zieht daraus ihren Schluss, siehe ZUHOERER weiter unten. Das
   Stilblatt und die Bilder stehen dabei für sich allein: Sie lassen sich
   im laufenden Betrieb austauschen, während für HTML und JavaScript kein
   Weg am Neuladen vorbeiführt. Genau deshalb zählen sie nicht zu den
   Seitendateien. Beim Arbeiten im Bild-Studio ist das der Unterschied
   zwischen Zusehen und Nachschlagen: Das frisch geschnittene Porträt
   steht in der offenen Figur, ohne dass die Seite von vorn anfängt.

   Entschieden wird über den Zeitstempel, nicht über die Meldung. Der
   Wächter schlägt auch bei Dateien an, die die Seite nichts angehen,
   etwa dieser hier; ein Stand, der sich nicht bewegt hat, löst dann eben
   nichts aus. START geht ebenfalls mit: Daran erkennt die Seite einen
   neu gestarteten Server und holt sich, was sie währenddessen verpasst
   hat. */

const MELDEWEG = '/api/stand';
const START = Date.now();

/* ---------- Hat sich die Datei wirklich geändert? ----------

   Zeitpunkt und Länge reichen dafür nicht. Wer eine Datei nur anfasst,
   ohne ein Byte zu ändern, rückt den Zeitpunkt trotzdem weiter, und das
   tun genug Programme: der Abgleich von OneDrive, ein Editor, der beim
   Öffnen anfasst, ein Werkzeug, das dieselben Zahlen noch einmal
   schreibt. Jede dieser Berührungen ließ die offene Seite bisher ein Bild
   neu holen oder gleich ganz neu laden, und ein Neuladen der
   Charakterseite kostet zwei Sekunden und die Stelle, an der man war.

   Deshalb entscheidet der Inhalt. Gelesen wird er nur, wenn Zeitpunkt
   oder Länge sich bewegt haben, sonst steht die Antwort ohnehin schon
   fest. */
const abdruecke = new Map();   // absoluter Pfad -> { mtimeMs, size, hash }

function inhaltsAbdruck(pfad) {
  let s;
  try { s = fs.statSync(pfad); } catch { abdruecke.delete(pfad); return null; }
  const gemerkt = abdruecke.get(pfad);
  if (gemerkt && gemerkt.mtimeMs === s.mtimeMs && gemerkt.size === s.size) return gemerkt.hash;
  let hash;
  try {
    hash = crypto.createHash('sha1').update(fs.readFileSync(pfad)).digest('hex');
  } catch { abdruecke.delete(pfad); return null; }
  abdruecke.set(pfad, { mtimeMs: s.mtimeMs, size: s.size, hash });
  return hash;
}

/* Ordner und die Endung, die dort zur Seite gehört. Im Wurzelordner
   zählen nur die HTML-Dateien, start.js gehört dem Server. */
const SEITENQUELLEN = [['.', '.html'], ['js', '.js'], ['js/vendor', '.js']];
const STILQUELLEN = [['css', '.css']];
const WACHORDNER = ['.', 'js', 'js/vendor', 'css'];

/* Die Bilder gehen ihren eigenen Weg: Nicht der jüngste Zeitstempel
   zählt, sondern welche Datei es war. Nur die wird getauscht, alles
   andere auf der Seite bleibt, wie es ist. */
const BILDORDNER = ['assets/characters/portraits', 'assets/characters/fullsize'];
const BILDENDUNGEN = /\.(webp|png|jpe?g|gif|svg)$/i;

/* Mehr merkt sich niemand: Die Liste geht bei jeder Meldung mit, und wer
   so lange am Stück schneidet, hat die frühen Bilder längst gesehen.
   Der älteste Eintrag fällt dann hinten heraus. */
const BILDER_GEMERKT = 300;
const bilder = new Map();

/* Was zuletzt in der Datei stand. Ein Wächter meldet nämlich mehr, als
   sich wirklich ändert: Windows schlägt beim Schreiben einer einzigen
   Datei gern zwei- oder dreimal an. Getauscht wird deshalb nur, was auch
   wirklich anders aussieht als beim letzten Blick. */
const bildStand = new Map();

function bildGemerkt(ordner, name) {
  /* Nur die Bilder im Ordner selbst. Ein Name mit Trenner käme aus einem
     Unterordner, und was mit einem Punkt anfängt, gehört dem Studio. */
  if (name.includes('/') || name.includes('\\') || name.startsWith('.')) return false;
  if (!BILDENDUNGEN.test(name)) return false;

  const rel = ordner + '/' + name;
  /* Ein gelöschtes Bild wird nicht gemeldet, sonst tauschte die Seite ein
     vorhandenes Bild gegen einen Fehler. */
  const hash = inhaltsAbdruck(path.join(REPO, rel));
  if (!hash) { bildStand.delete(rel); return false; }
  if (bildStand.get(rel) === hash) return false;
  bildStand.set(rel, hash);

  bilder.delete(rel);                 // wieder ans Ende der Reihe
  bilder.set(rel, Date.now());
  while (bilder.size > BILDER_GEMERKT) bilder.delete(bilder.keys().next().value);
  return true;
}

function juengste(quellen) {
  let juengst = 0;
  for (const [ordner, endung] of quellen) {
    let eintraege;
    try {
      eintraege = fs.readdirSync(path.join(REPO, ordner), { withFileTypes: true });
    } catch { continue; }
    for (const eintrag of eintraege) {
      if (!eintrag.isFile() || !eintrag.name.toLowerCase().endsWith(endung)) continue;
      try {
        juengst = Math.max(juengst,
          fs.statSync(path.join(REPO, ordner, eintrag.name)).mtimeMs);
      } catch { /* gerade weg, dann zählt sie eben nicht mit */ }
    }
  }
  return juengst;
}

/* Für die Seitendateien reicht der jüngste Zeitpunkt nicht. Sie lösen ein
   Neuladen aus, und das ist der teuerste Griff, den dieser Server hat:
   Die Charakterseite braucht dafür knapp zwei Sekunden und fängt in ihrer
   Liste wieder von oben an. Deshalb entscheidet hier der Inhalt, siehe
   inhaltsAbdruck weiter oben. */
function abdruck(quellen) {
  const teile = [];
  for (const [ordner, endung] of quellen) {
    let eintraege;
    try {
      eintraege = fs.readdirSync(path.join(REPO, ordner), { withFileTypes: true });
    } catch { continue; }
    for (const eintrag of eintraege.sort((a, b) => a.name.localeCompare(b.name))) {
      if (!eintrag.isFile() || !eintrag.name.toLowerCase().endsWith(endung)) continue;
      const hash = inhaltsAbdruck(path.join(REPO, ordner, eintrag.name));
      if (hash) teile.push(`${ordner}/${eintrag.name}:${hash}`);
    }
  }
  return teile.join('|');
}

function standDerSeite() {
  return {
    start: START,
    seite: abdruck(SEITENQUELLEN),
    stil: juengste(STILQUELLEN),
    bilder: Object.fromEntries(bilder),
  };
}

const horcher = new Set();

function horchen(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
  });
  /* Der erste Stand kommt sofort, er ist der Vergleichswert für alles
     Weitere. retry sagt dem Browser, wie schnell er nach einem Abriss
     wieder anklopfen soll: Nach einem Neustart des Servers soll die
     Seite nicht drei Sekunden lang alt bleiben. */
  res.write(`retry: 1000\nevent: stand\ndata: ${JSON.stringify(standDerSeite())}\n\n`);
  horcher.add(res);
  res.on('close', () => horcher.delete(res));
}

function standSenden() {
  if (!horcher.size) return;
  const daten = JSON.stringify(standDerSeite());
  for (const res of horcher) res.write(`event: stand\ndata: ${daten}\n\n`);
}

/* persistent: false, damit die Wächter den Prozess nicht am Leben halten.
   Ein Editor schreibt eine Datei gern in mehreren Schritten, außerdem
   kommen bei einer Änderung oft mehrere Dateien zusammen. Die kurze
   Sammelpause macht daraus eine einzige Meldung. */
let wachePause = null;

function beobachte(ordner, passt) {
  try {
    fs.watch(path.join(REPO, ordner), { persistent: false }, (art, name) => {
      if (name && !passt(name)) return;
      clearTimeout(wachePause);
      wachePause = setTimeout(standSenden, 120);
    });
  } catch (fehler) {
    console.log(`  Kein Wächter über ${ordner}: ${fehler.message}`);
  }
}

function wacheStarten() {
  for (const ordner of WACHORDNER) beobachte(ordner, (name) => /\.(html|js|css)$/i.test(name));
  for (const ordner of BILDORDNER) beobachte(ordner, (name) => bildGemerkt(ordner, name));
}

/* Der Zuhörer geht in jede ausgelieferte Seite, steht aber in keiner
   Datei im Ordner: Über file:// und auf jedem anderen Server gibt es ihn
   nicht, er ist reines Werkzeug dieses Starters. */
const ZUHOERER = `
<!-- Vom Entwicklungsserver eingesetzt, siehe start.js. -->
<script>
(function () {
  var stand = null;
  var laedtNeu = false;

  new EventSource('${MELDEWEG}').addEventListener('stand', function (ereignis) {
    var neu;
    try { neu = JSON.parse(ereignis.data); } catch (fehler) { return; }
    if (!stand) { stand = neu; return; }
    if (laedtNeu) return;

    /* Der Abdruck der Seitendateien wird verglichen, nicht ihr
       Zeitpunkt: Eine bloß angefasste Datei sieht danach genauso aus wie
       vorher und ist kein Grund, die Seite von vorn anfangen zu lassen. */
    if (neu.start !== stand.start || neu.seite !== stand.seite) {
      laedtNeu = true;
      location.reload();
      return;
    }
    if (neu.stil > stand.stil) {
      stand.stil = neu.stil;
      tauscheStil(neu.stil);
    }
    tauscheBilder(neu.bilder);
  });

  /* Das Stilblatt wird getauscht statt die Seite neu geladen: Die
     Timeline behält so ihre Scrollhöhe und die Charakterseite ihre
     geöffnete Figur. Das alte Blatt geht erst weg, wenn das neue steht,
     sonst blitzt die Seite dazwischen ungestylt auf.

     Aufgeräumt wird dabei alles außer dem neuen Blatt, und nur das
     jüngste räumt auf. Vorher merkte sich jeder Tausch sein eigenes altes
     Blatt und nahm nur dieses weg. Folgten zwei Änderungen dichter
     aufeinander, als der Browser zum Laden braucht, zeigten beide auf
     dasselbe Blatt: Eines wurde entfernt, das andere blieb für immer
     stehen. Über eine Arbeitssitzung hinweg lagen so schnell sieben
     Blätter übereinander, jedes mit allen Regeln der Seite. Jede
     Stiländerung war danach siebenfach zu rechnen, und genau das war das
     Stottern beim Scrollen. */
  var stilStand = 0;

  function tauscheStil(zeit) {
    var alt = document.querySelector('link[rel="stylesheet"][href*="css/style.css"]');
    if (!alt || zeit <= stilStand) return;
    stilStand = zeit;
    var neu = document.createElement('link');
    neu.rel = 'stylesheet';
    neu.href = 'css/style.css?stand=' + zeit;
    neu.addEventListener('load', function () {
      /* Ein überholtes Blatt nimmt sich selbst zurück, statt das jüngere
         wegzuräumen: Sonst gewänne beim Laden die Reihenfolge und nicht
         der Zeitstempel. */
      if (zeit !== stilStand) { neu.remove(); return; }
      var alle = document.querySelectorAll('link[rel="stylesheet"][href*="css/style.css"]');
      for (var i = 0; i < alle.length; i++) {
        if (alle[i] !== neu) alle[i].remove();
      }
    });
    alt.parentNode.insertBefore(neu, alt.nextSibling);
  }

  /* Ein frisch geschnittenes Porträt kommt genauso an, ohne Neuladen:
     Getauscht wird nur das eine Bild, die geöffnete Figur bleibt offen.
     Die Uhrzeit muss dabei mit in die Adresse, sonst zeigt der Browser
     weiter das Bild, das er schon im Arm hat.

     Bilder, die noch gar nicht im Dokument stehen, gehen das hier nichts
     an: Die Charakterseite hängt sie erst ein, wenn sie in Sicht kommen,
     und holt sie dann ohnehin frisch. */
  /* Gesucht wird einmal, nicht je Bild. Vorher lief für jeden gemeldeten
     Pfad ein eigenes querySelectorAll über das ganze Dokument: Bei
     dreihundert gemeldeten Bildern und vierhundert Bildern auf der
     Charakterseite waren das hundertzwanzigtausend Vergleiche und
     dreihundert Durchläufe durch den Baum, und die Seite stand dabei.
     Jetzt wird der Baum einmal gelesen und nach Pfad abgelegt. */
  function tauscheBilder(neue) {
    if (!neue) return;
    var offen = Object.keys(neue).filter(function (pfad) {
      return !(stand.bilder[pfad] >= neue[pfad]);
    });
    if (!offen.length) return;

    var nachPfad = {};
    var alle = document.querySelectorAll('img');
    for (var i = 0; i < alle.length; i++) {
      var quelle = (alle[i].getAttribute('src') || '').split('?')[0];
      if (!quelle) continue;
      (nachPfad[quelle] || (nachPfad[quelle] = [])).push(alle[i]);
    }

    offen.forEach(function (pfad) {
      stand.bilder[pfad] = neue[pfad];
      var treffer = nachPfad[pfad];
      if (!treffer) return;
      for (var k = 0; k < treffer.length; k++) {
        treffer[k].src = pfad + '?stand=' + neue[pfad];
      }
    });
  }
}());
</script>
`;

function mitZuhoerer(inhalt) {
  const text = inhalt.toString('utf8');
  const ende = text.lastIndexOf('</body>');
  if (ende === -1) return inhalt;
  return Buffer.from(text.slice(0, ende) + ZUHOERER + text.slice(ende), 'utf8');
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
  /* Die offenen Ereignisströme zuerst: Sie enden nie von selbst und
     hielten server.close() sonst bis zum Notausgang unten auf. */
  for (const res of horcher) res.end();
  horcher.clear();
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
    console.log('  Die Seite wird beobachtet: Änderungen kommen ohne Neuladen an.');
    if (MIT_STUDIO && BEOBACHTEN) {
      console.log('  Das Studio wird beobachtet: Änderungen kommen ohne Neustart an.');
    }
    console.log('  (beenden mit Strg+C)\n');

    wacheStarten();
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
