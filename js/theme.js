/* Heller und dunkler Modus für Timeline, Filme und Charaktere.

   Umgeschaltet wird über die Klasse theme-dark am <html>. Was sie
   auslöst, steht im Block „Heller und dunkler Modus“ in css/style.css.

   Die Klasse muss stehen, bevor der erste Punkt gezeichnet ist. Deshalb
   liegt diese Datei im <head> und ohne defer: Käme sie später, stünde die
   Charakterseite einen Moment lang weiß da und liefe erst danach ins
   Dunkle. Das kostet nichts, sie hat keine Abhängigkeiten und ist ein
   paar Zeilen lang.

   Ohne eigene Wahl folgt die Seite dem Betriebssystem, und zwar auch
   während sie offen steht. Sobald jemand den Knopf einmal gedrückt hat,
   gilt seine Wahl und das System redet nicht mehr mit. Gemerkt wird sie
   in localStorage, wie schon die Infoboxen der Timeline, mit demselben
   Vorbehalt: Über file:// oder bei gesperrten Cookies wirft der Zugriff,
   dann gilt eben wieder das System.

   Der Knopf steht auf allen drei Seiten und wird hier gebaut statt in
   jeder der drei HTML-Dateien. So gibt es die Zeichen nur einmal, und
   keine der Seiten kann mit einem anderen Kopf dastehen als die
   nächste. */
(function () {
  'use strict';

  const KEY = 'mcu-timeline.theme';
  const root = document.documentElement;

  /* FiSun und FiMoon aus react-icons (Feather-Satz, react-icons/fi),
     Linie für Linie von dort übernommen: Kreis mit acht Strahlen für die
     Sonne, ein einziger Pfad für den Mond. Beide stehen im Kasten 24×24
     und zeichnen mit currentColor, sie nehmen die Farbe des Knopfes
     also von selbst an. */
  const SONNE = '<circle cx="12" cy="12" r="5"></circle>'
    + '<line x1="12" y1="1" x2="12" y2="3"></line>'
    + '<line x1="12" y1="21" x2="12" y2="23"></line>'
    + '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>'
    + '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>'
    + '<line x1="1" y1="12" x2="3" y2="12"></line>'
    + '<line x1="21" y1="12" x2="23" y2="12"></line>'
    + '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>'
    + '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';

  const MOND = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

  const system = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  function gewaehlt() {
    try { return localStorage.getItem(KEY); } catch (err) { return null; }
  }

  function merken(wert) {
    try { localStorage.setItem(KEY, wert); } catch (err) {}
  }

  function dunkelJetzt() {
    const wahl = gewaehlt();
    if (wahl === 'dark') return true;
    if (wahl === 'light') return false;
    return !!(system && system.matches);
  }

  /* Der Knopf sagt, wohin es geht, und nicht, wo man steht: Im Hellen
     steht dort der Mond und „Zum dunklen Modus wechseln“. aria-pressed
     nennt daneben den Stand selbst, damit ein Screenreader beides hat. */
  function beschriften(dunkel) {
    const text = dunkel ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln';
    const knopf = document.querySelector('.theme-toggle');
    if (!knopf) return;
    knopf.setAttribute('aria-label', text);
    knopf.setAttribute('title', text);
    knopf.setAttribute('aria-pressed', dunkel ? 'true' : 'false');
  }

  /* Fast alles hängt allein an der Klasse. Nur was in Bilddateien
     steckt, kann das Stylesheet nicht umfärben: Die Filmlogos liegen in
     einer hellen und einer dunklen Fassung nebeneinander, und wer auf
     dem Grund der Seite steht, muss beim Umschalten die Fassung tauschen.
     Deshalb die Meldung, js/characters.js hört darauf. */
  function setzen(dunkel) {
    root.classList.toggle('theme-dark', dunkel);
    beschriften(dunkel);
    document.dispatchEvent(new CustomEvent('themechange', { detail: { dunkel: dunkel } }));
  }

  /* Läuft noch im <head>, der Knopf ist hier also nicht zu finden. Die
     Klasse ist der Punkt, beschriftet wird gleich noch einmal. */
  setzen(dunkelJetzt());

  if (system && system.addEventListener) {
    system.addEventListener('change', function () {
      if (!gewaehlt()) setzen(system.matches);
    });
  }

  function zeichen(klasse, inhalt) {
    return '<svg class="theme-icon ' + klasse + '" viewBox="0 0 24 24" fill="none"'
      + ' stroke="currentColor" stroke-width="2" stroke-linecap="round"'
      + ' stroke-linejoin="round" aria-hidden="true">' + inhalt + '</svg>';
  }

  window.addEventListener('DOMContentLoaded', function () {
    const platz = document.querySelector('.header-side--end');
    if (!platz) return;

    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'theme-toggle';
    knopf.innerHTML = zeichen('theme-icon--sun', SONNE)
      + zeichen('theme-icon--moon', MOND);

    /* Vor das Zahnrad, wo eines steht. Der Knopf sitzt damit auf allen
       drei Seiten an derselben Stelle, und auf der Timeline stehen die
       beiden als Paar nebeneinander. */
    platz.prepend(knopf);

    knopf.addEventListener('click', function () {
      const dunkel = !root.classList.contains('theme-dark');
      merken(dunkel ? 'dark' : 'light');
      setzen(dunkel);
    });

    beschriften(root.classList.contains('theme-dark'));
  });
})();
