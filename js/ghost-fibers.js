/* Der Grund der ganzen Seite: ein Feld feiner Fasern, das langsam atmet.

   Gezeichnet wird alles in einem einzigen Fragment-Shader. Der Bildpunkt
   wird dafür mehrmals hintereinander verbogen, und aus jeder Runde fällt
   eine Lage Linien:

     1. Die Ebene wird gedreht und skaliert.
     2. Je Lage schiebt eine Sinuswelle die Koordinaten quer (uWave…),
        danach dreht ein zweiter Sinus sie um den Mittelpunkt (uTwist…).
        Beide laufen mit der Zeit, und dadurch bewegt sich das Bild.
     3. abs(sin(x)) über der verbogenen Ebene ergibt Streifen, eine hohe
        Potenz (uLineSharpness) macht daraus dünne helle Linien.
     4. Dazu kommen ein Schein in der Mitte und eine ziehende Wolke,
        zuletzt Vignette, Tonwertkurve, Blaustich und Filmkorn.

   Weil die Ebene bei jeder Lage weiter verbogen wird, laufen die Linien
   nicht parallel, sondern legen sich wie Fasern übereinander.

   Ohne ogl und ohne React, anders als die Vorlage. Gebraucht wird von der
   Bibliothek nur ein bildschirmfüllendes Dreieck und ein Shader-Programm,
   und beides steht hier in wenigen Zeilen. Der Fragment-Shader ist bis
   auf die Einsprungzeile der der Vorlage.

   Die Regler stehen in js/ghost-fibers-config.js, und im Vision-Studio
   steht unter „Fasern“ zu jedem ein Schieber mit laufender Vorschau.
   Damit das Studio dieselbe Datei in seinem eigenen Canvas laufen lassen
   kann, hängt hier nichts an einer festen Kennung:

     GhostFibers.starte(canvas, werte)   baut ein Feld auf und gibt seine
                                         Bedienung zurück
     feld.set({ twist: 0.4 })            Regler ändern
     feld.get()                          alles Eingestellte
     feld.setPhase(['#340e0e',
                    '#a23434'])          auf die Farben einer Phase
                                         überblenden, null geht zurück
                                         auf die aus der Datei
     feld.pause(true)                    anhalten, etwa im Hintergrund
     feld.stop()                         abbauen und die Grafikkarte
                                         freigeben

   Die beiden Farben sind das Einzige, was nicht sofort umspringt: Beim
   Wechsel der Phase schiebt sich das Feld über phaseFade Sekunden von
   den alten auf die neuen. Welche Phase welche Farben trägt, steht bei
   der Phase selbst in js/data.js unter fibers, und js/main.js meldet den
   Wechsel, sobald eine andere Phase im Bild steht.

   Die Seite selbst nimmt das Canvas mit der Kennung fibers. Es liegt
   fest hinter allem und deckt sie von Kante zu Kante. Dessen Bedienung
   liegt zusätzlich als GhostFibers.set/get/setPhase bereit, damit sich in
   der Konsole schnell etwas ausprobieren lässt.

   Kann der Browser kein WebGL2, gibt starte() nichts zurück und die
   Seite bleibt auf ihrer Grundfarbe stehen (--bg in css/style.css). */
(function () {
  'use strict';

  /* Ein einziges Dreieck über den ganzen Schirm, ohne Puffer: Die drei
     Ecken fallen aus der laufenden Nummer der Ecke. Es ersetzt die
     Triangle-Geometrie von ogl. */
  const VS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

  const FS = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uLayers;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uWaveSpeed;
uniform float uLayerSpeed;
uniform float uTwist;
uniform float uTwistFrequency;
uniform float uTwistSpeed;
uniform float uLineFrequency;
uniform float uLineSpacing;
uniform float uLineSharpness;
uniform float uGlowFalloff;
uniform float uGlowIntensity;
uniform float uBrightness;
uniform float uBlueBoost;
uniform float uVignette;
uniform float uGrain;
uniform float uRotationSpeed;
uniform float uLightMode;
uniform vec3 uLineColor;
uniform vec3 uGlowColor;

out vec4 fragColor;

#define MAX_LAYERS 10

mat2 rotate2d(float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);
  return mat2(cosine, -sine, sine, cosine);
}

float grainHash(vec2 point) {
  point = floor(point);
  float hash = 52.9829189 * fract(dot(point, vec2(0.065, 0.005)));
  return fract(hash);
}

float layeredGrain(vec2 fragmentPixel) {
  vec2 point = mod(fragmentPixel + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 rotated = mat2(0.8, -0.5, 0.5, 0.8) * point;
  float grain = 0.0;
  grain += 0.40 * grainHash(rotated);
  grain += 0.25 * grainHash(rotated * 2.0 + 17.0);
  grain += 0.20 * grainHash(rotated * 4.0 + 47.0);
  grain += 0.10 * grainHash(rotated * 8.0 + 113.0);
  grain += 0.05 * grainHash(rotated * 16.0 + 191.0);
  return grain;
}

void main() {
  vec2 resolution = max(uResolution, vec2(1.0));
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
  float time = uTime * uSpeed;
  vec3 backdrop = mix(vec3(0.070588, 0.058824, 0.090196), vec3(1.0), step(0.5, uLightMode));
  vec3 centerTone = max(uLineColor * 0.85567 - uGlowColor * 0.06186, vec3(0.0));
  vec3 cloudTone = uLineColor * 0.19588 + uGlowColor * 0.2268;
  vec2 p = uv;
  p /= max(uScale, 0.05);
  p = rotate2d(radians(uRotation) + time * uRotationSpeed) * p;
  vec3 color = vec3(0.0);
  float fiberField = 0.0;
  float fineField = 0.0;
  float glowField = 0.0;

  for (int index = 0; index < MAX_LAYERS; index++) {
    float fi = float(index) + 1.0;
    if (fi > uLayers) break;

    p += uWaveAmplitude * sin(p.yx * fi * uWaveFrequency + time * (uWaveSpeed + fi * uLayerSpeed));

    float radius = length(p);
    float polarAngle = atan(p.y, p.x);
    polarAngle += sin(radius * uTwistFrequency - time * uTwistSpeed + fi) * uTwist;
    p = vec2(cos(polarAngle), sin(polarAngle)) * radius;

    float lines = abs(sin(p.x * (uLineFrequency + fi * uLineSpacing) + sin(p.y * 3.0 + time)));
    lines = pow(max(0.0, 1.0 - lines), uLineSharpness);
    fiberField += lines / fi;
    fineField += lines / sqrt(fi);
    color += uLineColor * lines / fi;

    float glow = exp(-uGlowFalloff * abs(sin(p.x * 3.0 + time + fi)));
    glowField += glow / (fi * 2.0);
    color += uGlowColor * glow * uGlowIntensity / (fi * 2.0);
  }

  float center = exp(-2.2 * dot(uv, uv));
  color += centerTone * center;

  float cloud = exp(-1.5 * length(uv + vec2(sin(time * 0.3) * 0.25, cos(time * 0.25) * 0.18)));
  color += cloudTone * cloud;

  float vignette = 1.0 - smoothstep(0.35, 1.45, length(uv));
  color *= mix(1.0 - uVignette, 1.0, vignette);
  color = 1.0 - exp(-color * uBrightness);
  color.b *= uBlueBoost;

  vec3 outputColor;
  if (uLightMode > 0.5) {
    // Auf Weiß trägt nicht die Helligkeitskurve das Bild, sondern Tinte.
    // Die Fülle des dunklen Grundes kommt vom Schein je Lage, deshalb
    // zeichnet er hier als weiche Bänder mit. Die Fasern fallen je Lage
    // nur mit der Wurzel ab, sonst blieben auf Weiß allein die Stellen
    // stehen, an denen mehrere Lagen zusammenfallen.
    float edgeFade = mix(1.0 - uVignette, 1.0, vignette);
    float lineInk = 1.0 - exp(-fineField * 1.2);
    float glowInk = 1.0 - exp(-glowField * uGlowIntensity * uBrightness);
    float atmosphere = center * 0.06 + cloud * 0.05;
    vec3 glowTone = mix(backdrop, uGlowColor, 0.9);
    vec3 lineTone = mix(uLineColor, uGlowColor, 0.35);

    outputColor = mix(backdrop, glowTone, (glowInk * 0.34 + atmosphere) * edgeFade);
    outputColor = mix(outputColor, lineTone, lineInk * 0.42 * edgeFade);
  } else {
    outputColor = backdrop + color;
  }

  float noise = (layeredGrain(gl_FragCoord.xy) - 0.5) * uGrain;
  outputColor = clamp(outputColor + noise, 0.0, 1.0);
  fragColor = vec4(outputColor, 1.0);
}
`;

  /* Falls js/ghost-fibers-config.js einmal fehlt, steht hier genug, um
     nicht mit einem leeren Bild dazustehen. Gepflegt wird dort. */
  const NOTNAGEL = {
    lineColor: '#140e35', glowColor: '#3437a0', speed: 0.2, scale: 2,
    rotation: 90, rotationSpeed: 0, layers: 4,
    waveAmplitude: 0.015, waveFrequency: 3, waveSpeed: 0.15, layerSpeed: 0.08,
    twist: 0.1, twistFrequency: 5, twistSpeed: 1.2,
    lineFrequency: 5, lineSpacing: 2, lineSharpness: 16,
    glowFalloff: 10, glowIntensity: 0, brightness: 2, blueBoost: 1.25,
    vignette: 0.8, grain: 0.05, lightMode: false, phaseFade: 1.2,
    dpr: 1, fps: 60,
  };

  function hexZuRgb(hex) {
    const roh = String(hex).trim().replace(/^#/, '');
    const voll = roh.length === 3 ? roh.replace(/./g, (z) => z + z) : roh;
    const treffer = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(voll);
    if (!treffer) return [1, 1, 1];
    return [
      parseInt(treffer[1], 16) / 255,
      parseInt(treffer[2], 16) / 255,
      parseInt(treffer[3], 16) / 255,
    ];
  }

  function gleicheFarbe(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  }

  function mischeFarbe(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];
  }

  /* ---------- Ein Feld auf einem Canvas ---------- */

  function starte(canvas, startwerte) {
    if (!canvas) return null;

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    /* Ohne WebGL2 bleibt die Grundfarbe des Bandes stehen. Das Canvas
       nimmt dann keinen Platz weg, weil es ohnehin nur darüberliegt. */
    if (!gl) return null;

    const WERTE = Object.assign({}, NOTNAGEL, window.GHOST_FIBERS_CONFIG, startwerte);

    /* Die beiden Farben gehen nicht den Weg der übrigen Regler. Sie
       wechseln mit der Phase, und ein Umspringen mitten im Rollen wäre
       ein Schnitt im Bild. Gehalten wird deshalb, wo sie herkommen
       (von…), wo sie hinsollen (zu…) und wie weit sie dazwischen sind.
       Bei 1 ist die Blende durch. */
    let vonLinie = hexZuRgb(WERTE.lineColor);
    let vonSchein = hexZuRgb(WERTE.glowColor);
    let zuLinie = vonLinie.slice();
    let zuSchein = vonSchein.slice();
    let mischung = 1;
    let farbenFaellig = false;

    /* Die Farben der Phase, die gerade gilt, oder null am Seitenanfang.
       Gemerkt, damit ein Dreh am Grundton im Studio weiß, worauf er
       zurückfallen soll. */
    let phaseFarben = null;

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('GhostFibers: Shader ließ sich nicht übersetzen\n' + gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    const vs = compile(gl.VERTEX_SHADER, VS);
    const fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('GhostFibers: Programm ließ sich nicht binden\n' + gl.getProgramInfoLog(prog));
      return null;
    }

    /* Alle Uniform-Adressen einmal einsammeln, damit im Bild keine
       getUniformLocation mehr nötig ist. */
    const u = {};
    const anzahl = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < anzahl; i += 1) {
      const info = gl.getActiveUniform(prog, i);
      u[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(prog, info.name);
    }
    gl.useProgram(prog);

    /* Die Regler auf die Grafikkarte schreiben. Läuft nur bei einer
       Änderung, im laufenden Bild wird nur noch uTime gesetzt. */
    /* Die beiden Farben allein, im Stand der laufenden Blende. Sie gehen
       in jedem Bild neu auf die Grafikkarte, solange sie läuft, und
       kosten dabei nichts. */
    function farbenSchreiben() {
      gl.useProgram(prog);
      const linie = mischeFarbe(vonLinie, zuLinie, mischung);
      const schein = mischeFarbe(vonSchein, zuSchein, mischung);
      gl.uniform3f(u.uLineColor, linie[0], linie[1], linie[2]);
      gl.uniform3f(u.uGlowColor, schein[0], schein[1], schein[2]);
    }

    function uniformsSchreiben() {
      gl.useProgram(prog);
      farbenSchreiben();
      gl.uniform1f(u.uSpeed, WERTE.speed);
      gl.uniform1f(u.uScale, WERTE.scale);
      gl.uniform1f(u.uRotation, WERTE.rotation);
      gl.uniform1f(u.uRotationSpeed, WERTE.rotationSpeed);
      gl.uniform1f(u.uLayers, Math.min(Math.max(Math.round(WERTE.layers), 1), 10));
      gl.uniform1f(u.uWaveAmplitude, WERTE.waveAmplitude);
      gl.uniform1f(u.uWaveFrequency, WERTE.waveFrequency);
      gl.uniform1f(u.uWaveSpeed, WERTE.waveSpeed);
      gl.uniform1f(u.uLayerSpeed, WERTE.layerSpeed);
      gl.uniform1f(u.uTwist, WERTE.twist);
      gl.uniform1f(u.uTwistFrequency, WERTE.twistFrequency);
      gl.uniform1f(u.uTwistSpeed, WERTE.twistSpeed);
      gl.uniform1f(u.uLineFrequency, WERTE.lineFrequency);
      gl.uniform1f(u.uLineSpacing, WERTE.lineSpacing);
      gl.uniform1f(u.uLineSharpness, WERTE.lineSharpness);
      gl.uniform1f(u.uGlowFalloff, WERTE.glowFalloff);
      gl.uniform1f(u.uGlowIntensity, WERTE.glowIntensity);
      gl.uniform1f(u.uBrightness, WERTE.brightness);
      gl.uniform1f(u.uBlueBoost, WERTE.blueBoost);
      gl.uniform1f(u.uVignette, WERTE.vignette);
      gl.uniform1f(u.uGrain, WERTE.grain);
      gl.uniform1f(u.uLightMode, WERTE.lightMode ? 1 : 0);
    }

    /* ---------- Größe ---------- */

    let breite = 0;
    let hoehe = 0;

    function zeichne() {
      gl.useProgram(prog);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function messen(erzwingen) {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(Math.max(WERTE.dpr, 0.25), 2);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (w === breite && h === hoehe && !erzwingen) return;
      breite = w;
      hoehe = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.useProgram(prog);
      gl.uniform2f(u.uResolution, w, h);
      zeichne();
    }

    /* ---------- Die Schleife ----------

       Gerechnet wird nur, wenn es auch jemand sieht: nicht im
       weggescrollten Zustand, nicht in einem Tab im Hintergrund und
       nicht bei abgeschalteter Bewegung. Ein Bild wird dann trotzdem
       gezeichnet, das Band steht also still da statt leer. */
    const wenigerBewegung = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let uhr = 0;
    let zuletzt = performance.now();
    let letztesBild = 0;
    let imBild = true;
    let seiteSichtbar = !document.hidden;
    let angehalten = false;
    let abgebaut = false;

    const darfLaufen = () =>
      !abgebaut && imBild && seiteSichtbar && !angehalten && !wenigerBewegung.matches;

    function halt() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function takt(jetzt) {
      raf = 0;
      if (!darfLaufen()) return;

      /* Auf eine Zehntelsekunde gedeckelt: Nach einem Tab-Wechsel wäre
         der Abstand sonst minutenlang, und das Bild spränge weit nach
         vorn. */
      const dt = Math.min((jetzt - zuletzt) / 1000, 0.1);
      zuletzt = jetzt;
      uhr += dt;

      /* Die Blende der Phasenfarben läuft über dieselbe Uhr wie alles
         andere im Bild. Geschrieben wird sie erst im gezeichneten Bild,
         sonst ginge die Farbe auf die Grafikkarte, ohne dass jemand sie
         sieht. */
      if (mischung < 1) {
        mischung = Math.min(1, mischung + dt / Math.max(WERTE.phaseFade, 0.001));
        farbenFaellig = true;
      }

      const takte = 1000 / Math.min(Math.max(WERTE.fps, 1), 120);
      if (jetzt - letztesBild >= takte - 0.5) {
        gl.useProgram(prog);
        gl.uniform1f(u.uTime, uhr);
        if (farbenFaellig) {
          farbenSchreiben();
          farbenFaellig = false;
        }
        zeichne();
        letztesBild = jetzt;
      }
      raf = requestAnimationFrame(takt);
    }

    function start() {
      if (!darfLaufen() || raf) return;
      zuletzt = performance.now();
      raf = requestAnimationFrame(takt);
    }

    function nachfuehren() {
      if (darfLaufen()) start();
      else {
        halt();
        if (!abgebaut) zeichne();
      }
    }

    /* ---------- Die Farben der Phase ----------

       farben ist [Fasern, Schein] als Hexwerte oder null für die Farben
       aus der Datei. Die Blende fängt dort an, wo die Farben gerade
       stehen, und nicht bei der zuletzt gesetzten Phase: Wer mitten in
       einer Blende weiterrollt, soll keinen Sprung sehen. */
    function setzePhase(farben, sofort) {
      phaseFarben = farben || null;
      const linie = hexZuRgb(farben && farben[0] ? farben[0] : WERTE.lineColor);
      const schein = hexZuRgb(farben && farben[1] ? farben[1] : WERTE.glowColor);
      if (mischung >= 1 && gleicheFarbe(linie, zuLinie) && gleicheFarbe(schein, zuSchein)) {
        return;
      }

      vonLinie = mischeFarbe(vonLinie, zuLinie, mischung);
      vonSchein = mischeFarbe(vonSchein, zuSchein, mischung);
      zuLinie = linie;
      zuSchein = schein;
      mischung = sofort || WERTE.phaseFade <= 0 ? 1 : 0;

      /* Läuft die Schleife nicht, blendet auch niemand. Dann steht die
         neue Farbe sofort da, und das eine Bild dazu wird hier
         gezeichnet. Das ist zugleich der Weg bei abgeschalteter
         Bewegung. */
      if (darfLaufen()) {
        farbenFaellig = true;
        start();
      } else {
        mischung = 1;
        farbenSchreiben();
        zeichne();
      }
    }

    const beobachter = [];
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => messen(false));
      ro.observe(canvas);
      beobachter.push(() => ro.disconnect());
    }
    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver((eintraege) => {
        imBild = eintraege.some((e) => e.isIntersecting);
        nachfuehren();
      }, { threshold: 0 });
      io.observe(canvas);
      beobachter.push(() => io.disconnect());
    }

    const beiGroesse = () => messen(false);
    const beiSichtbarkeit = () => {
      seiteSichtbar = !document.hidden;
      nachfuehren();
    };
    window.addEventListener('resize', beiGroesse);
    document.addEventListener('visibilitychange', beiSichtbarkeit);
    if (wenigerBewegung.addEventListener) {
      wenigerBewegung.addEventListener('change', nachfuehren);
    }

    uniformsSchreiben();
    messen(true);
    zeichne();
    start();

    return {
      set(neu) {
        const dprVorher = WERTE.dpr;
        Object.assign(WERTE, neu || {});
        /* Ein neuer Grundton aus dem Studio soll sofort dastehen und
           nicht erst nach der nächsten Phase. Gilt gerade eine Phase,
           behält sie ihre eigenen Farben. */
        setzePhase(phaseFarben, true);
        uniformsSchreiben();
        /* Eine andere Punktdichte ändert die Größe des Puffers, obwohl
           das Canvas gleich groß bleibt. Ohne das Erzwingen fiele die
           Messung durch ihren eigenen Vergleich. */
        messen(WERTE.dpr !== dprVorher);
        zeichne();
        nachfuehren();
      },
      get() {
        return Object.assign({}, WERTE);
      },
      setPhase(farben, sofort) {
        setzePhase(farben, sofort);
      },
      pause(an) {
        angehalten = !!an;
        nachfuehren();
      },
      stop() {
        abgebaut = true;
        halt();
        beobachter.forEach((ab) => ab());
        window.removeEventListener('resize', beiGroesse);
        document.removeEventListener('visibilitychange', beiSichtbarkeit);
        if (wenigerBewegung.removeEventListener) {
          wenigerBewegung.removeEventListener('change', nachfuehren);
        }
        const verlust = gl.getExtension('WEBGL_lose_context');
        if (verlust) verlust.loseContext();
      },
    };
  }

  /* Das Feld der Seite selbst. Fehlt das Canvas, etwa im Vision-Studio,
     wird hier nichts gebaut und nur starte() bereitgelegt. */
  const eigenes = starte(document.getElementById('fibers'));

  window.GhostFibers = {
    starte: starte,
    /* Zum Ausprobieren in der Konsole: GhostFibers.set({ twist: 0.4 }) */
    set: (neu) => (eigenes ? eigenes.set(neu) : undefined),
    get: () => (eigenes ? eigenes.get() : null),
    /* Ruft js/main.js bei jedem Phasenwechsel, siehe activate() dort. */
    setPhase: (farben, sofort) => (eigenes ? eigenes.setPhase(farben, sofort) : undefined),
    pause: (an) => (eigenes ? eigenes.pause(an) : undefined),
  };
})();
