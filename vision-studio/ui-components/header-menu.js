/* Das Menü im Kopf.

   Sicherung und Farbschema standen früher als eigene Knöpfe
   nebeneinander in der rechten Ecke. Keines von beiden gehört zu einer
   Figur, beide betreffen die Seite als Ganzes, und keines wird oft
   gebraucht. Sie stehen deshalb zusammen unter einem Knopf, der nur sein
   Zeichen trägt (LuSettings2, siehe icons.js).

   Diese Datei macht das Feld auf und zu, sonst nichts. Was in den
   Einträgen steckt, bleibt bei denen, die es bisher taten: studio.js
   öffnet die Sicherung, color-scheme.js setzt die Farbe. Sie hängen an
   denselben Kennungen wie vorher und
   merken vom Umzug nichts. Ein Klick auf irgendeinen Eintrag schließt
   das Feld, das gilt für jeden, der später dazukommt. */

'use strict';

(() => {
  const knopf = document.getElementById('menue-knopf');
  const feld = document.getElementById('menue-feld');
  if (!knopf || !feld) return;

  const eintraege = () => [...feld.querySelectorAll('button')];

  function zeige(offen) {
    feld.hidden = !offen;
    knopf.setAttribute('aria-expanded', String(offen));
    if (offen) {
      const erster = eintraege()[0];
      if (erster) erster.focus();
    }
  }

  knopf.addEventListener('click', () => zeige(feld.hidden));

  /* Jeder Eintrag schließt das Feld. Die Sicherung und die Galaxie legen
     gleich darauf ihren Dialog darüber, das Farbschema färbt die
     Oberfläche um: In allen drei Fällen ist das Feld im Weg. */
  feld.addEventListener('click', (ev) => {
    if (!ev.target.closest('button')) return;
    zeige(false);
  });

  /* Mit den Pfeiltasten durch das Feld, mit Escape wieder heraus. */
  feld.addEventListener('keydown', (ev) => {
    if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
    ev.preventDefault();
    const alle = eintraege();
    const jetzt = alle.indexOf(document.activeElement);
    const schritt = ev.key === 'ArrowDown' ? 1 : -1;
    alle[(jetzt + schritt + alle.length) % alle.length].focus();
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && !feld.hidden) {
      zeige(false);
      knopf.focus();
    }
  });

  /* Ein Klick daneben schließt. Der Knopf selbst ist ausgenommen, sonst
     schlösse sein eigener Klick das Feld sofort wieder. */
  document.addEventListener('pointerdown', (ev) => {
    if (feld.hidden) return;
    if (!ev.target.closest('#menue')) zeige(false);
  });
})();
