/* Das Farbschema des Studios.

   Drei Töne, benannt nach den KI-Systemen, an deren Anzeigen die
   Oberfläche angelehnt ist: J.A.R.V.I.S. in Cyan, Ultron in Rot und
   E.D.I.T.H. in Blau. Die Farben selbst stehen alle in studio.css, hier
   steht nur, welches Schema gilt und wer davon erfahren muss.

   Gesetzt wird es als data-schema am <html>. Das kleine Skript im Kopf
   von index.html holt den gespeicherten Wert schon vor dem ersten Bild,
   damit nichts aufblitzt. Diese Datei prüft ihn danach, bedient den
   Knopf und sagt allen Bescheid, die ihre Farben nicht aus dem
   Stylesheet, sondern aus einer Leinwand beziehen:

     - studio.js liest die Farben der Bühne beim Start einmal ab, danach
       hängen sie in FARBE fest. Sie werden neu gelesen und die Bühne
       samt Vorschau wird neu gezeichnet.
     - background-lines.js, electric-border.js und particle-text.js hören auf
       das Ereignis „schemawechsel“ am Fenster und holen sich, was sie
       brauchen, selbst.

   Wer später noch etwas malt, hört auf dasselbe Ereignis. */

'use strict';

(() => {
  const SCHLUESSEL = 'studio-farbschema';

  /* Die Reihenfolge ist die im Feld. Das erste Schema gilt, wenn nichts
     gespeichert ist oder etwas Unbekanntes darin steht. */
  const SCHEMEN = [
    { id: 'jarvis', name: 'J.A.R.V.I.S.' },
    { id: 'ultron', name: 'Ultron' },
    { id: 'edith', name: 'E.D.I.T.H.' },
    { id: 'minutes', name: 'Miss Minutes' },
    { id: 'intelligenz', name: 'Die Oberste Intelligenz' },
    { id: 'griot', name: 'Griot' },
    { id: 'kevin', name: 'K.E.V.I.N.' },
  ];

  const knopf = document.getElementById('schema-knopf');
  const feld = document.getElementById('schema-feld');
  const name = document.getElementById('schema-name');
  if (!knopf || !feld || !name) return;

  const gueltig = (id) => SCHEMEN.some((s) => s.id === id);

  function gespeichert() {
    try {
      const wert = localStorage.getItem(SCHLUESSEL);
      return gueltig(wert) ? wert : SCHEMEN[0].id;
    } catch (fehler) {
      return SCHEMEN[0].id;
    }
  }

  /* ---------- Umschalten ---------- */

  function setze(id, merken) {
    const schema = SCHEMEN.find((s) => s.id === id) || SCHEMEN[0];
    document.documentElement.dataset.schema = schema.id;
    name.textContent = schema.name;
    knopf.title = `Farbschema: ${schema.name}. Klicken zum Wechseln.`;

    for (const eintrag of feld.children) {
      eintrag.setAttribute('aria-checked', String(eintrag.dataset.schema === schema.id));
    }

    if (merken) {
      try { localStorage.setItem(SCHLUESSEL, schema.id); } catch (fehler) { /* dann eben nur diese Sitzung */ }
    }

    /* Die Bühne hält ihre Farben in eigenen Feldern, sie muss neu lesen
       und neu zeichnen. Beides gibt es erst, wenn studio.js geladen ist,
       beim ersten Setzen also noch nicht. */
    if (typeof leseFarben === 'function') leseFarben();
    if (typeof zeichne === 'function' && typeof S === 'object' && S.bild) zeichne();
    if (typeof vorschau === 'function' && typeof S === 'object' && S.bild) vorschau();

    window.dispatchEvent(new CustomEvent('schemawechsel', { detail: { schema: schema.id } }));
  }

  /* ---------- Das Feld ---------- */

  function zeige(offen) {
    feld.hidden = !offen;
    knopf.setAttribute('aria-expanded', String(offen));
    if (offen) {
      const an = feld.querySelector('[aria-checked="true"]') || feld.firstElementChild;
      if (an) an.focus();
    }
  }

  knopf.addEventListener('click', () => zeige(feld.hidden));

  feld.addEventListener('click', (ev) => {
    const eintrag = ev.target.closest('button');
    if (!eintrag) return;
    setze(eintrag.dataset.schema, true);
    zeige(false);
    knopf.focus();
  });

  /* Mit den Pfeiltasten durch das Feld, mit Escape wieder heraus. */
  feld.addEventListener('keydown', (ev) => {
    if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
    ev.preventDefault();
    const alle = [...feld.children];
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
    if (!ev.target.closest('#schema')) zeige(false);
  });

  setze(gespeichert(), false);
})();
