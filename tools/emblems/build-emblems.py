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

Der Helligkeitsweg ist der schlechtere von beiden. Er kommt bei einem
dunkel gemalten Zeichen ins Straucheln, und er kann nicht wissen, ob
das Schwarze im Inneren zum Zeichen gehört oder es schneidet. Genau
dafür steht cutout-emblems.py daneben: Es setzt den Alphakanal vorweg,
und dann greift hier der obere der beiden Wege.

Beides zusammen bedient das Bild-Studio im Bereich „Embleme“. Es zeigt
die Strecke aus Vorlage, freigestelltem Bild und Maske nebeneinander
und ruft dafür genau diese beiden Skripte auf. Sie bleiben die
maßgebliche Fassung, das Studio führt keine eigene.

Aufrufe:

    python tools/emblems/build-emblems.py            alle neuen
    python tools/emblems/build-emblems.py --alle     auch die fertigen
    python tools/emblems/build-emblems.py --liste    welche Namen es gibt
    python tools/emblems/build-emblems.py spider-man nur dieses eine

--json hängt sich an jeden dieser Aufrufe und macht aus der Ausgabe
eine Zeile JSON. Daraus liest das Studio seinen Stand.
"""

import io
import json
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

# Vorlagen, deren Zeichen eine gefüllte Fläche ist und deren Zeichnung
# darin als schwarze Linie liegt: die Finger der Hulk-Faust etwa. Bei
# ihnen gehört das Schwarze nicht zum Zeichen, sondern schneidet es -
# ohne diesen Schritt würde die Faust zu einem Klumpen.
#
# Warum keine Regel für alle: Manches Zeichen ist selbst dunkel, der
# Totenkopf des Punisher etwa. Dort nähme derselbe Schritt neun Zehntel
# des Zeichens weg. Wer eine neue Vorlage ablegt und einen Klumpen
# bekommt, trägt ihren Namen hier ein.
LINIEN = {'hulk', 'thanos'}

# Ab welcher Helligkeit eine Linie als schwarz gilt.
LINIEN_SCHWELLE = 90


def namen_aus_js():
    """Die Schlüssel aus EMBLEM_ART, damit die Vorlagen richtig heißen."""
    pfad = os.path.join(REPO, 'js', 'emblems.js')
    with io.open(pfad, encoding='utf-8') as f:
        text = f.read()
    anfang = text.index('const EMBLEM_ART = {')
    ende = text.index('\n};', anfang)
    return re.findall(r"^  '([a-z0-9-]+)':", text[anfang:ende], re.M)


def linien_schneiden(deckung, bild):
    """Die schwarze Zeichnung im Zeichen aus der Deckung nehmen."""
    grau = np.array(bild.convert('L'))
    dunkel = (grau < LINIEN_SCHWELLE) & (deckung > 128)
    return np.where(dunkel, 0, deckung)


def maske_aus(bild):
    """Aus einer Vorlage die Deckung machen: 255 ist Zeichen, 0 ist Grund.

    Zurück kommen die Deckung und die Auskunft, ob sie aus einem echten
    Alphakanal stammt. Das entscheidet weiter unten über LINIEN.
    """
    # Ein Alphakanal gilt nur, wenn er wirklich etwas freistellt. Viele
    # Dateien tragen einen mit, der überall undurchsichtig ist.
    if bild.mode in ('RGBA', 'LA') or 'transparency' in bild.info:
        alpha = np.array(bild.convert('RGBA'))[:, :, 3]
        if alpha.min() < 200:
            return alpha, True

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

    return deckung.astype(np.uint8), False


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
    deckung, _aus_alpha = maske_aus(bild)
    # Auch bei einer Vorlage mit Alphakanal: Photoroom und seinesgleichen
    # nehmen nur den Grund weg und lassen die schwarze Zeichnung im
    # Zeichen deckend stehen. Ohne diesen Schritt wird die Faust ein
    # Klumpen. Bei einer mit cutout-emblems.py freigestellten Vorlage
    # läuft er ins Leere, dort ist das Schwarz schon durchsichtig.
    if name in LINIEN:
        deckung = linien_schneiden(deckung, bild)
    feld = zuschneiden(deckung)

    klein = Image.fromarray(feld, 'L').resize((KANTE, KANTE), Image.LANCZOS)

    # Weiß, wo das Zeichen ist, und dort deckend. Die Farbe kommt auf
    # der Seite dazu, die Datei trägt nur die Form.
    weiss = Image.new('RGBA', (KANTE, KANTE), (255, 255, 255, 0))
    weiss.putalpha(klein)
    weiss.save(ziel, 'WEBP', quality=92, method=6)
    return klein


def vorlagen():
    """Welche Vorlage zu welchem Namen liegt, egal in welchem Format."""
    if not os.path.isdir(QUELLE):
        return {}
    gefunden = {}
    for f in sorted(os.listdir(QUELLE)):
        name, endung = os.path.splitext(f)
        if endung.lower() in LESBAR:
            gefunden.setdefault(name, f)
    return gefunden


def stand():
    """Der Stand aller Zeichen: was die Bühne kennt, was gebaut ist.

    Das ist die Auskunft, aus der das Bild-Studio seine Liste baut.
    """
    fertig = {os.path.splitext(f)[0] for f in os.listdir(ZIEL)
              if f.lower().endswith('.webp')} if os.path.isdir(ZIEL) else set()
    liegt = vorlagen()
    return [{
        'name': name,
        'vorlage': liegt.get(name),
        'maske': name in fertig,
    } for name in namen_aus_js()]


def main():
    roh = sys.argv[1:]
    alle = '--alle' in roh
    als_json = '--json' in roh
    args = [a for a in roh if not a.startswith('--')]

    bekannt = namen_aus_js()

    if '--liste' in roh:
        if als_json:
            print(json.dumps({'ok': True, 'zeichen': stand()}))
            return
        da = {z['name'] for z in stand() if z['maske']}
        print('Diese Namen kennt die Bühne (%d):\n' % len(bekannt))
        for n in bekannt:
            print('  [%s] %s' % ('x' if n in da else ' ', n))
        print('\n[x] heißt: eine Vorlage ist schon verarbeitet.')
        print('Vorlagen gehören nach assets/emblems/source/<name>.png')
        return

    if not os.path.isdir(QUELLE):
        os.makedirs(QUELLE)
        if als_json:
            print(json.dumps({'ok': True, 'gebaut': [], 'misslungen': []}))
            return
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
        if als_json:
            print(json.dumps({'ok': True, 'gebaut': [], 'misslungen': [],
                              'grund': 'Keine Vorlagen in assets/emblems/source.'}))
            return
        print('Keine Vorlagen in assets/emblems/source.')
        return

    gebaut, uebersprungen, misslungen = [], 0, []
    for datei in dateien:
        name = os.path.splitext(datei)[0]
        ziel = os.path.join(ZIEL, name + '.webp')

        if name not in bekannt:
            misslungen.append({'name': name,
                               'grund': 'kein Zeichen dieses Namens, siehe --liste'})
            if not als_json:
                print('  ?  %-22s kein Zeichen dieses Namens, siehe --liste' % name)
            continue
        if os.path.exists(ziel) and not alle and not args:
            uebersprungen += 1
            continue

        try:
            klein = bauen(name, os.path.join(QUELLE, datei), ziel)
            anteil = float((np.array(klein) > 24).mean())
            gebaut.append({'name': name, 'kante': KANTE,
                           'anteil': round(anteil, 4)})
            if not als_json:
                print('  ok %-22s %d x %d, %.0f%% Fläche'
                      % (name, KANTE, KANTE, anteil * 100))
        except Exception as e:
            misslungen.append({'name': name, 'grund': str(e)})
            if not als_json:
                print('  !  %-22s %s' % (name, e))

    if als_json:
        print(json.dumps({'ok': True, 'gebaut': gebaut,
                          'uebersprungen': uebersprungen,
                          'misslungen': misslungen}))
        return

    print('\n%d gebaut, %d schon da, %d nicht gegangen.'
          % (len(gebaut), uebersprungen, len(misslungen)))
    if gebaut:
        print('Die Bühne nimmt sie beim nächsten Neuladen von selbst.')


if __name__ == '__main__':
    try:
        main()
    except Exception as fehler:  # noqa: BLE001 - die Antwort muss JSON bleiben
        if '--json' in sys.argv[1:]:
            print(json.dumps({'fehler': f'{type(fehler).__name__}: {fehler}'}))
            sys.exit(1)
        raise
