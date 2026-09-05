"""Stellt Emblem-Vorlagen frei, bevor build-emblems.py eine Maske daraus macht.

Alle Antworten gehen als eine Zeile JSON auf stdout, Fehler als
{"fehler": "..."} mit Rückgabewert 1, genau wie bei den Diensten des
Studios in tools/portrait-studio/services.

    cutout-emblems.py pruefen
    cutout-emblems.py frei --bild <pfad> --ziel <pfad> [--lesart zeichnung|scheibe]
                          [--erzwingen 1]
    cutout-emblems.py <ordner> [--lesart ...] [--ziel <ordner>] [--erzwingen 1]

Eine Vorlage, die schon einen Alphakanal mitbringt, wird abgelehnt:
Sie hat die Frage beantwortet. --erzwingen 1 wirft ihn weg und rechnet
neu aus den Farben. Das ist der Weg für eine Vorlage, die zwar
freigestellt aussieht, es aber schlecht ist.

Wozu das gut ist
----------------
Die Vorlagen kommen als Bilddatei mit flachem Grund, meist ein
schwarzes Quadrat mit einem runden Zeichen darin. build-emblems.py
braucht davon nur die Form, und es holt sie sich am liebsten aus einem
Alphakanal. Bringt die Vorlage keinen mit, muss es über die Helligkeit
gehen, und das geht bei dunklen Zeichen schief. Der Totenkopf des
Punisher ist selbst fast schwarz.

Dieses Skript setzt den Alphakanal, und zwar ohne Modell: Der Grund ist
eine einzige Farbe, das lässt sich rechnen.

Zwei Fallen liegen dabei im Weg, und ihre Auswege widersprechen sich.

Nimmt man den Farbabstand zum Grund als Deckkraft, wird jedes dunkel
gemalte Zeichen halb durchsichtig. Venom und Punisher bleichen aus, denn
ihr Grau liegt nah am Schwarz des Grundes, ist aber deckend gemalt.

Nimmt man stattdessen einen harten Schwellwert, bleiben die halb
gedeckten Randpixel voll stehen. Sie tragen den alten Grund in sich und
legen sich als dunkler Saum um jeden Strich.

Der Ausweg ist, beides zu trennen. Innen entscheidet die Form: Was den
Grund nicht mehr berührt, ist deckend, so dunkel es auch gemalt sein
mag. Nur am Rand entscheidet der Farbabstand, und der wird nicht am
vollen Weg gemessen, sondern an der Farbe des nächstgelegenen deckenden
Pixels. Ein Randpixel mit einem Drittel der Strichfarbe bekommt so ein
Drittel Deckkraft und die volle Strichfarbe.

Die beiden Lesarten
-------------------
Die Zeichen sind runde Scheiben, und das Innere der Scheibe trägt
denselben Schwarzwert wie der Grund. An der Farbe ist beides nicht zu
unterscheiden, nur an der Form, und beide Lesarten sind vertretbar:

    zeichnung   nur die gemalten Striche bleiben stehen, das Innere
                wird durchsichtig. Das ist die Vorgabe, denn genau so
                will die Bühne es haben: Sie färbt die Maske selbst ein
                und schneidet mit ihr Löcher in die Fläche darunter.

    scheibe     was der Ring umschließt, bleibt deckend. Für Vorlagen,
                deren Zeichen eine wirklich gefüllte Fläche ist.

Für die Bühne zählt am Ende nur der Alphakanal, die Farbe wirft
build-emblems.py weg. Sie steht trotzdem sauber in der Datei, damit die
freigestellte Vorlage auch für sich genommen etwas taugt.
"""

import argparse
import json
import os
import sys

import numpy as np
from PIL import Image

try:
    import cv2
except ImportError:  # pragma: no cover - beim Prüfen gemeldet
    cv2 = None

LESBAR = ('.png', '.webp', '.jpg', '.jpeg', '.bmp')

# Ab welchem Farbabstand zum Grund ein Pixel überhaupt mitzählt. 8 liegt
# über dem Rauschen der Vorlagen und unter jedem sichtbaren Strich.
SCHWELLE = 8

# Ab welchem Anteil der kräftigsten Farbe im Bild ein Pixel sicher gemalt
# ist und nicht bloß ein Übergang. Dünne Striche sind in der Mitte
# kräftig und werden so gefasst, auch wenn sie zum Wegschmelzen zu
# schmal sind.
#
# Der Wert muss aus dem Bild kommen und darf nicht fest stehen. Bei einem
# festen Wert gilt schon ein zu einem Fünftel gedecktes Rotpixel als
# gemalt, bleibt voll deckend und legt sich als dunkle Linie an die Kante.
KRAEFTIG = 0.7

# Kleiner als das ist kein Strich, sondern ein Sprenkel aus der
# Kompression. Brocken der Pinselspuren liegen deutlich darüber.
KLECKS = 24

# Wie breit der Übergangsstreifen am Rand ist, in Pixeln. Drei und nicht
# einer, weil die Vorlagen als JPG durch die Welt gehen und dessen
# Ringing die Kante über mehrere Pixel verschmiert.
SAUM = 3

# Ab welchem kleinsten Alphawert eine Vorlage als schon freigestellt gilt.
SCHON_FREI = 200


def grundfarbe(rgb):
    """Die Farbe der vier Ecken. Dort ist bei diesen Vorlagen Grund."""
    ecken = np.concatenate([rgb[:6, :6].reshape(-1, 3), rgb[:6, -6:].reshape(-1, 3),
                            rgb[-6:, :6].reshape(-1, 3), rgb[-6:, -6:].reshape(-1, 3)])
    return np.median(ecken, axis=0)


def loecher_fuellen(gemalt):
    """Was ringsum eingeschlossen ist, gehört dazu.

    Über einen Farbeimer vom Rand her und nicht über scipy: Das Studio
    rechnet mit einer schlanken Umgebung, in der nur Pillow, numpy und
    OpenCV liegen.
    """
    hoch, breit = gemalt.shape
    feld = np.zeros((hoch + 2, breit + 2), np.uint8)
    feld[1:-1, 1:-1] = gemalt.astype(np.uint8)
    cv2.floodFill(feld, np.zeros((hoch + 4, breit + 4), np.uint8), (0, 0), 1)
    return gemalt.astype(bool) | (feld[1:-1, 1:-1] == 0)


def flaeche(abstand, fuellen):
    """Wo überhaupt etwas gemalt ist."""
    gemalt = (abstand > SCHWELLE).astype(np.uint8)

    # Sprenkel werfen, sonst hängen einzelne Pixel als Schmutz im
    # Freiraum und der fertige Rand franst aus.
    anzahl, marken, werte, _ = cv2.connectedComponentsWithStats(gemalt, 8)
    for i in range(1, anzahl):
        if werte[i, cv2.CC_STAT_AREA] < KLECKS:
            gemalt[marken == i] = 0

    gemalt = gemalt.astype(bool)
    return loecher_fuellen(gemalt) if fuellen else gemalt


def naechste_farbe(rgb, kern):
    """Die Farbe des jeweils nächstgelegenen deckenden Pixels."""
    _, marken = cv2.distanceTransformWithLabels(
        (~kern).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    # Die Marken zählen die Nullpixel zeilenweise ab 1 durch.
    orte = np.argwhere(kern)
    return rgb[orte[:, 0][marken - 1], orte[:, 1][marken - 1]]


def schon_frei(bild):
    """Ob die Vorlage einen Alphakanal mitbringt, der wirklich etwas freistellt."""
    if bild.mode not in ('RGBA', 'LA') and 'transparency' not in bild.info:
        return False
    return np.array(bild.convert('RGBA'))[:, :, 3].min() < SCHON_FREI


def freistellen(bild, lesart='zeichnung'):
    """Aus einer Vorlage mit flachem Grund ein RGBA-Bild machen."""
    rgb = np.asarray(bild.convert('RGB')).astype(np.float32)
    grund = grundfarbe(rgb)
    abstand = np.abs(rgb - grund).max(axis=2)

    form = flaeche(abstand, lesart == 'scheibe')
    if not form.any():
        raise ValueError('die Vorlage ist leer, es ist kein Zeichen darin')

    # Deckend ist, was tief genug im Zeichen liegt, um den Grund nicht
    # mehr zu berühren, und außerdem jeder kräftig gemalte Strich, damit
    # dünne Linien nicht ganz wegerodieren.
    innen = cv2.erode(form.astype(np.uint8), np.ones((3, 3), np.uint8),
                      iterations=SAUM) > 0
    kraeftig = KRAEFTIG * np.percentile(abstand[form], 98)
    kern = innen | (form & (abstand > kraeftig))
    if not kern.any():
        kern = form

    farbe = np.where(kern[..., None], rgb, naechste_farbe(rgb, kern))

    # Am Rand sagt der Farbabstand, wie viel von der Strichfarbe da ist.
    weg = np.abs(farbe - grund).max(axis=2)
    alpha = np.clip(abstand / np.maximum(weg, 1.0), 0.0, 1.0)
    alpha[kern] = 1.0
    alpha[~form] = 0.0

    aus = np.dstack([np.clip(farbe, 0, 255), alpha * 255.0]).round().astype(np.uint8)
    # Volle Durchsicht trägt keine Farbe mehr, sonst rechnet ein
    # Verkleinerer den alten Grund wieder ein.
    aus[alpha == 0] = 0
    return Image.fromarray(aus, 'RGBA'), grund, alpha


def bericht(bild, alpha, grund):
    return {
        'breite': bild.width, 'hoehe': bild.height,
        'grund': [int(v) for v in grund],
        'deckend': round(float((alpha > 0.98).mean()), 4),
        'kante': round(float(((alpha > 0.02) & (alpha < 0.98)).mean()), 4),
    }


def eine_datei(quelle, ziel, lesart, erzwingen=False):
    """Eine Vorlage freistellen.

    Ohne erzwingen wird eine Datei mit eigenem Alphakanal abgelehnt, denn
    sie hat die Frage schon beantwortet und ein zweiter Durchgang könnte
    sie nur verschlechtern.

    Die Prüfung darauf ist aber grob: Ein einziges halbdurchsichtiges
    Pixel im ganzen Bild genügt ihr. Und eine schlecht freigestellte
    Vorlage bleibt schlecht freigestellt. Für beides gibt es erzwingen.
    Der alte Alphakanal fällt dann weg, gerechnet wird allein aus den
    Farben gegen den Grund in den Ecken.
    """
    bild = Image.open(quelle)
    if schon_frei(bild) and not erzwingen:
        raise ValueError('die Vorlage ist schon freigestellt, '
                         'sie bringt einen eigenen Alphakanal mit')
    aus, grund, alpha = freistellen(bild, lesart)
    aus.save(ziel, 'PNG', optimize=True)
    return {'lesart': lesart, 'erzwungen': bool(erzwingen),
            **bericht(aus, alpha, grund)}


def ordner_lauf(quelle, ziel, lesart, erzwingen=False):
    """Der Weg von Hand: einen ganzen Ordner auf einmal."""
    if not os.path.isdir(ziel):
        os.makedirs(ziel)
    dateien = sorted(f for f in os.listdir(quelle) if f.lower().endswith(LESBAR))
    if not dateien:
        print('Keine Bilder in %s.' % quelle)
        return
    gemacht, fehler = 0, 0
    for datei in dateien:
        name = os.path.splitext(datei)[0] + '.png'
        try:
            werte = eine_datei(os.path.join(quelle, datei),
                               os.path.join(ziel, name), lesart, erzwingen)
            print('  ok %-24s %d x %d, %.0f%% deckend'
                  % (name, werte['breite'], werte['hoehe'], werte['deckend'] * 100))
            gemacht += 1
        except Exception as e:
            print('  !  %-24s %s' % (name, e))
            fehler += 1
    print('\n%d freigestellt, %d nicht gegangen.' % (gemacht, fehler))
    print('Fertig liegen sie in %s.' % ziel)


def main():
    p = argparse.ArgumentParser(description=__doc__.split('\n')[0],
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('befehl', help='pruefen, frei oder ein Ordner')
    p.add_argument('--bild')
    p.add_argument('--ziel')
    p.add_argument('--lesart', choices=['zeichnung', 'scheibe'], default='zeichnung')
    p.add_argument('--erzwingen', type=int, default=0,
                   help='auch eine Vorlage mit eigenem Alphakanal freistellen')
    args = p.parse_args()

    if args.befehl == 'pruefen':
        if cv2 is None:
            print(json.dumps({'ok': False, 'grund': 'OpenCV fehlt in dieser '
                              'Python-Umgebung. Es braucht Pillow, numpy und '
                              'opencv-python.'}))
            return
        print(json.dumps({'ok': True, 'opencv': cv2.__version__,
                          'lesarten': ['zeichnung', 'scheibe']}))
        return

    if args.befehl == 'frei':
        if not args.bild or not args.ziel:
            raise SystemExit('frei braucht --bild und --ziel')
        print(json.dumps(eine_datei(args.bild, args.ziel, args.lesart,
                                    bool(args.erzwingen))))
        return

    if os.path.isdir(args.befehl):
        ziel = args.ziel or os.path.join(args.befehl, 'freigestellt')
        return ordner_lauf(args.befehl, ziel, args.lesart, bool(args.erzwingen))

    raise SystemExit('Unbekannt: %s. Erlaubt sind pruefen, frei oder ein Ordner.'
                     % args.befehl)


if __name__ == '__main__':
    try:
        main()
    except Exception as fehler:  # noqa: BLE001 - die Antwort muss JSON bleiben
        if len(sys.argv) > 1 and sys.argv[1] in ('pruefen', 'frei'):
            print(json.dumps({'fehler': f'{type(fehler).__name__}: {fehler}'}))
            sys.exit(1)
        raise
