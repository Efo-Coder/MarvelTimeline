"""Macht aus abgelegten Emblem-Vorlagen die Masken für die Bühne.

Die Zeichen hinter der Figur stehen auf der Erscheinungsbühne mehrere
hundert Pixel groß und in wechselnden Farben da. Eine farbige Bilddatei
kann das nicht: Sie brächte ihre eigene Farbe mit und ihren eigenen
Hintergrund. Gebraucht wird deshalb eine Maske, also ein Bild, das nur
sagt, wo das Zeichen ist und wo nicht. Die Farbe legt die Seite darüber
(mask-image in css/style.css).

Ablauf:

    1. Vorlage nach assets/emblems/source/<name>.png legen.
       <name> ist der Schlüssel aus EMBLEM_ART in js/emblems.js, also
       etwa spider-man.png, iron-man.png, thor.png. Welche Namen es
       gibt, sagt dieses Skript mit --liste.

    2. python tools/emblems/build-emblems.py

    3. Fertig liegt assets/emblems/<name>.webp und wird von der Bühne
       ab sofort statt des gezeichneten Zeichens genommen.

Die Vorlage darf farbig sein, einen weißen oder schwarzen Grund haben
oder schon freigestellt sein. Erkannt wird beides:

  - Bringt sie einen Alphakanal mit, der wirklich etwas freistellt,
    gilt der.
  - Sonst entscheidet die Helligkeit. Ob das Zeichen dunkel auf hell
    steht oder hell auf dunkel, sieht das Skript an den Rändern nach:
    Was in den vier Ecken liegt, ist der Hintergrund.

Aufrufe:

    python tools/emblems/build-emblems.py            alle neuen
    python tools/emblems/build-emblems.py --alle     auch die fertigen
    python tools/emblems/build-emblems.py --liste    welche Namen es gibt
    python tools/emblems/build-emblems.py spider-man nur dieses eine
"""

import io
import os
import re
import sys

from PIL import Image
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HIER, '..', '..'))
QUELLE = os.path.join(REPO, 'assets', 'emblems', 'source')
ZIEL = os.path.join(REPO, 'assets', 'emblems')

# Wie groß die fertige Maske wird. 512 reicht: Auf der Bühne steht sie
# knapp 400 Pixel breit, und weil sie nur eine Maske ist und keine
# Farbe trägt, fällt eine weiche Kante nicht auf.
KANTE = 512

# Wie viel Luft rundherum bleibt, gemessen an der langen Seite des
# Zeichens. Ohne diesen Rand stieße ein Zeichen mit geraden Kanten
# genau an den Rand der Fläche und sähe angeschnitten aus.
LUFT = 0.04

LESBAR = ('.png', '.webp', '.jpg', '.jpeg', '.gif', '.bmp')


def namen_aus_js():
    """Die Schlüssel aus EMBLEM_ART, damit die Vorlagen richtig heißen."""
    pfad = os.path.join(REPO, 'js', 'emblems.js')
    with io.open(pfad, encoding='utf-8') as f:
        text = f.read()
    anfang = text.index('const EMBLEM_ART = {')
    ende = text.index('\n};', anfang)
    return re.findall(r"^  '([a-z0-9-]+)':", text[anfang:ende], re.M)


def maske_aus(bild):
    """Aus einer Vorlage die Deckung machen: 255 ist Zeichen, 0 ist Grund."""
    # Ein Alphakanal gilt nur, wenn er wirklich etwas freistellt. Viele
    # Dateien tragen einen mit, der überall undurchsichtig ist.
    if bild.mode in ('RGBA', 'LA') or 'transparency' in bild.info:
        alpha = np.array(bild.convert('RGBA'))[:, :, 3]
        if alpha.min() < 200:
            return alpha

    grau = np.array(bild.convert('L')).astype(np.int16)

    # Steht das Zeichen dunkel auf hell oder hell auf dunkel? Die
    # Antwort liegt in den Ecken: Dort ist Hintergrund.
    h, w = grau.shape
    ecke = max(2, min(h, w) // 20)
    ecken = np.concatenate([
        grau[:ecke, :ecke].ravel(), grau[:ecke, -ecke:].ravel(),
        grau[-ecke:, :ecke].ravel(), grau[-ecke:, -ecke:].ravel()])
    grund_hell = ecken.mean() > 127

    deckung = (255 - grau) if grund_hell else grau

    # Strecken, damit ein grauer Scan trotzdem volle Deckung bekommt.
    lo, hi = np.percentile(deckung, [4, 96])
    if hi - lo < 12:
        lo, hi = deckung.min(), max(deckung.max(), deckung.min() + 1)
    deckung = np.clip((deckung - lo) * (255.0 / (hi - lo)), 0, 255)

    return deckung.astype(np.uint8)


def zuschneiden(maske):
    """Auf den Inhalt beschneiden und quadratisch mit Luft rahmen."""
    zeilen = np.where(maske.max(axis=1) > 24)[0]
    spalten = np.where(maske.max(axis=0) > 24)[0]
    if not len(zeilen) or not len(spalten):
        raise ValueError('die Vorlage ist leer, es ist kein Zeichen darin')

    aus = maske[zeilen[0]:zeilen[-1] + 1, spalten[0]:spalten[-1] + 1]
    hoch, breit = aus.shape
    seite = int(max(hoch, breit) * (1 + 2 * LUFT))

    feld = np.zeros((seite, seite), dtype=np.uint8)
    oben = (seite - hoch) // 2
    links = (seite - breit) // 2
    feld[oben:oben + hoch, links:links + breit] = aus
    return feld


def bauen(name, quelle, ziel):
    bild = Image.open(quelle)
    feld = zuschneiden(maske_aus(bild))

    klein = Image.fromarray(feld, 'L').resize((KANTE, KANTE), Image.LANCZOS)

    # Weiß, wo das Zeichen ist, und dort deckend. Die Farbe kommt auf
    # der Seite dazu, die Datei trägt nur die Form.
    weiss = Image.new('RGBA', (KANTE, KANTE), (255, 255, 255, 0))
    weiss.putalpha(klein)
    weiss.save(ziel, 'WEBP', quality=92, method=6)
    return klein


def main():
    args = [a for a in sys.argv[1:]]
    alle = '--alle' in args
    args = [a for a in args if not a.startswith('--')]

    bekannt = namen_aus_js()

    if '--liste' in sys.argv[1:]:
        da = {os.path.splitext(f)[0] for f in os.listdir(ZIEL)
              if f.lower().endswith('.webp')} if os.path.isdir(ZIEL) else set()
        print('Diese Namen kennt die Bühne (%d):\n' % len(bekannt))
        for n in bekannt:
            print('  [%s] %s' % ('x' if n in da else ' ', n))
        print('\n[x] heißt: eine Vorlage ist schon verarbeitet.')
        print('Vorlagen gehören nach assets/emblems/source/<name>.png')
        return

    if not os.path.isdir(QUELLE):
        os.makedirs(QUELLE)
        print('Ordner angelegt: assets/emblems/source')
        print('Vorlagen dort ablegen, Namen siehe --liste.')
        return
    if not os.path.isdir(ZIEL):
        os.makedirs(ZIEL)

    dateien = sorted(f for f in os.listdir(QUELLE)
                     if f.lower().endswith(LESBAR))
    if args:
        dateien = [f for f in dateien if os.path.splitext(f)[0] in args]

    if not dateien:
        print('Keine Vorlagen in assets/emblems/source.')
        return

    gemacht, uebersprungen, fehler = 0, 0, 0
    for datei in dateien:
        name = os.path.splitext(datei)[0]
        ziel = os.path.join(ZIEL, name + '.webp')

        if name not in bekannt:
            print('  ?  %-22s kein Zeichen dieses Namens, siehe --liste' % name)
            fehler += 1
            continue
        if os.path.exists(ziel) and not alle and not args:
            uebersprungen += 1
            continue

        try:
            klein = bauen(name, os.path.join(QUELLE, datei), ziel)
            anteil = (np.array(klein) > 24).mean()
            print('  ok %-22s %d x %d, %.0f%% Fläche' % (name, KANTE, KANTE, anteil * 100))
            gemacht += 1
        except Exception as e:
            print('  !  %-22s %s' % (name, e))
            fehler += 1

    print('\n%d gebaut, %d schon da, %d nicht gegangen.' % (gemacht, uebersprungen, fehler))
    if gemacht:
        print('Die Bühne nimmt sie beim nächsten Neuladen von selbst.')


if __name__ == '__main__':
    main()
