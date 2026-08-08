"""Freistellen für das Bild-Studio: Hintergrund weg, Alphakanal dran.

Alle Antworten gehen als eine Zeile JSON auf stdout, Fehler als
{"fehler": "..."} mit Rückgabewert 1. Der Zwischenstand geht als Zeilen
"FORTSCHRITT <0..1> <Text>" auf stderr, genau wie bei facial-recognition/enhance-face.py.

    remove-background.py pruefen
    remove-background.py frei --bild <pfad> --ziel <pfad> [--modell <name>]
                        [--feinschliff 0|1] [--saum <0..1>]

Was hier passiert und warum
---------------------------
Der Dienst photoroom.com macht drei Dinge, und alle drei stehen auch
offline zur Verfügung. Erstens ein Modell, das den Vordergrund findet.
Zweitens ein zweiter Blick aus der Nähe, damit Haare und Finger nicht an
der Auflösung des Modells scheitern. Drittens das Herausrechnen der
Hintergrundfarbe aus den halbdurchsichtigen Randpixeln, denn ohne das
trägt jede Freistellung einen Saum in der Farbe ihres alten Grundes.

**Das Modell.** rembg bringt mehrere mit, das beste ist BiRefNet. Es ist
dieselbe Bauart, auf der auch die bekannten Dienste aufsetzen. Gemessen
gegen die bekannte Alpha eines Ganzkörperbildes dieses Bestandes:

    isnet-general-use            Kantenfehler 0.289     3 s
    birefnet-general             Kantenfehler 0.117    28 s
    birefnet-general + Nachbau   Kantenfehler 0.288    28 s

Die dritte Zeile ist rembgs eigenes post_process_mask. Es zieht die
Maske über eine Morphologie und macht die weiche Kante wieder hart,
womit es genau das zerstört, worauf es hier ankommt. Deshalb steht es
aus, und der Alphakanal kommt so heraus, wie das Modell ihn rechnet.

**Der zweite Blick.** Das Modell rechnet auf 1024 mal 1024. Steht die
Figur klein in einer großen Vorlage, bleiben von ihr im Modell nur ein
paar hundert Pixel, und die Kante wird entsprechend grob. Der zweite
Durchgang schneidet deshalb den gefundenen Vordergrund aus und rechnet
ihn noch einmal, jetzt füllt die Figur die 1024. Dieselbe Messung, Figur
klein auf großer Fläche:

    ein Durchgang    Kantenfehler 0.178     IoU 0.9921
    zwei Durchgänge  Kantenfehler 0.082     IoU 0.9974

Füllt die Figur die Vorlage ohnehin schon aus, bringt der zweite
Durchgang nichts und wird übersprungen. Das Ergebnis sagt, was war.

**Der Farbsaum.** Ein halbdurchsichtiger Randpixel hat die Farbe
C = a*F + (1-a)*B, er trägt also den alten Hintergrund B anteilig mit
sich. Vor einem weißen Grund bekommt jede Haarsträhne dadurch einen
hellen Rand, der vor dem dunklen Grund der Charakterseite sofort
auffällt. Zurückgerechnet wird mit F = (C - (1-a)*B) / a.

Anders als in zuschnitt.py des Porträt-Skills ist B hier kein einziger
Wert aus den Bildecken, sondern für jeden Randpixel der örtliche
Hintergrund: Die sicher durchsichtigen Pixel werden über eine gewichtete
Unschärfe in die Kante hineingezogen. Ein Verlauf, eine Wand, ein
Fensterausschnitt hinter der Schulter, all das wird damit richtig
abgezogen statt mit einer Farbe aus einer Ecke, die dort gar nicht steht.

Kein Netz
---------
Die Modelle liegen als ONNX in ~/.u2net (oder wo U2NET_HOME hinzeigt).
"pruefen" meldet nur, was dort wirklich als Datei liegt, und die
Oberfläche bietet auch nur das an. Damit fasst kein Lauf jemals das Netz
an. Fehlt ein Modell, ist es einmalig mit Verbindung zu holen:

    python -c "from rembg import new_session; new_session('birefnet-general')"
"""

import argparse
import json
import os
import sys

import numpy as np
from PIL import Image

# Die Modelle, die das Studio kennt, in der Reihenfolge, in der sie in
# der Oberfläche stehen sollen. Der Text ist der, den der Nutzer liest.
MODELLE = [
    ("birefnet-general", "BiRefNet", "genau, für alles"),
    ("birefnet-portrait", "BiRefNet Porträt", "auf Menschen trainiert"),
    ("isnet-general-use", "ISNet", "schnell, gröbere Kante"),
    ("u2net", "U²-Net", "der alte Vorgabewert"),
]
STANDARD = "birefnet-general"

# Ab hier lohnt der zweite Durchgang nicht mehr: Füllt der Vordergrund so
# viel der Fläche, sieht das Modell ihn schon jetzt fast bildfüllend.
FEINSCHLIFF_GRENZE = 0.85
LUFT = 0.06          # Zuschlag um den gefundenen Vordergrund, Anteil
BAND = (0.02, 0.98)  # halbdurchsichtig, nur hier wird der Saum gerechnet


def heim():
    return os.environ.get("U2NET_HOME") or os.path.join(
        os.path.expanduser("~"), ".u2net")


def vorhanden():
    """Die Modelle, die als Datei daliegen. Nur die sind offline nutzbar."""
    ordner = heim()
    da = []
    for name, titel, hinweis in MODELLE:
        pfad = os.path.join(ordner, name + ".onnx")
        if os.path.isfile(pfad):
            da.append(dict(name=name, titel=titel, hinweis=hinweis,
                           bytes=os.path.getsize(pfad)))
    return da


def laden(pfad):
    """Die Vorlage als deckendes RGB.

    Trägt sie schon Alpha, wird sie auf Weiß gelegt und nicht auf das
    Schwarz, das ein schlichtes convert("RGB") hinterließe. Vor Schwarz
    verschwimmt jede dunkle Figur mit ihrem Grund, und das Modell soll
    hier nicht an einer Farbe scheitern, die gar nicht im Bild stand.
    Weiß ist außerdem das, was die deckenden Vorlagen ohnehin mitbringen.
    """
    im = Image.open(pfad)
    hat_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    if not hat_alpha:
        return im.convert("RGB")
    im = im.convert("RGBA")
    weiss = Image.new("RGBA", im.size, (255, 255, 255, 255))
    return Image.alpha_composite(weiss, im).convert("RGB")


def melde(anteil, text=None):
    print(f"FORTSCHRITT {min(1.0, max(0.0, anteil)):.3f} {text or ''}",
          file=sys.stderr, flush=True)


# ---------- Maske ----------

_sitzungen = {}


def sitzung(name):
    from rembg import new_session
    if name not in _sitzungen:
        _sitzungen[name] = new_session(name)
    return _sitzungen[name]


def maske(bild, name):
    """Die rohe Alpha des Modells, ohne Nachbearbeitung.

    only_mask liefert die Maske allein. Das ist nicht nur sparsamer,
    sondern nötig: remove() setzt die Farbe durchsichtiger Pixel auf
    Schwarz, und dieses Schwarz blutet später beim Verkleinern in die
    Kanten. Die Farbe kommt hier deshalb aus der Vorlage.
    """
    from rembg import remove
    roh = remove(bild, session=sitzung(name), post_process_mask=False,
                 only_mask=True)
    return np.asarray(roh.convert("L")).astype(np.float32)


def huelle(alpha, breite, hoehe):
    """Der Kasten um den Vordergrund, mit etwas Luft. None, wenn leer."""
    ys, xs = np.where(alpha > 16)
    if not len(ys):
        return None
    y0, y1 = int(ys.min()), int(ys.max())
    x0, x1 = int(xs.min()), int(xs.max())
    dy = int((y1 - y0) * LUFT) + 8
    dx = int((x1 - x0) * LUFT) + 8
    return (max(0, x0 - dx), max(0, y0 - dy),
            min(breite, x1 + dx + 1), min(hoehe, y1 + dy + 1))


def zweiter_blick(bild, alpha, name):
    """Den Vordergrund ausschneiden und noch einmal rechnen.

    Zurück kommt (neue Alpha, Kasten) oder (alte Alpha, None), wenn es
    nichts zu holen gab. Außerhalb des Kastens liegt nur, was schon im
    ersten Durchgang unter der Schwelle blieb, dort geht also nichts
    verloren.
    """
    h, w = alpha.shape
    kasten = huelle(alpha, w, h)
    if kasten is None:
        return alpha, None
    x0, y0, x1, y1 = kasten
    if (x1 - x0) * (y1 - y0) >= FEINSCHLIFF_GRENZE * w * h:
        return alpha, None
    fein = maske(bild.crop(kasten), name)
    neu = np.zeros_like(alpha)
    neu[y0:y1, x0:x1] = fein
    return neu, kasten


# ---------- Farbsaum ----------

def grundfarbe(rgb, alpha):
    """Der örtliche Hintergrund für jeden Bildpunkt.

    Gemittelt wird nur über das, was sicher Hintergrund ist. Damit das
    auch mitten in der Kante noch einen Wert hat, läuft die Mittelung
    über mehrere Stufen von fein nach grob, und jede Stufe füllt nur die
    Stellen, die die feinere noch nicht erreicht hat. So bekommt ein
    Randpixel den Grund, der ihm am nächsten steht, und nicht den
    Durchschnitt des halben Bildes.
    """
    import cv2

    frei = (alpha < BAND[0] * 255.0).astype(np.float32)
    summe = rgb * frei[..., None]

    h, w = alpha.shape
    aus = np.zeros_like(rgb)
    offen = np.ones((h, w), bool)
    schritt = max(3, int(round(min(h, w) / 200.0)) | 1)

    for _ in range(7):
        k = (schritt, schritt)
        g = cv2.blur(frei, k)                    # (h, w)
        s = cv2.blur(summe, k)                   # (h, w, 3)
        gut = (g > 1e-3) & offen
        if gut.any():
            aus[gut] = s[gut] / g[gut][:, None]
            offen &= ~gut
        if not offen.any():
            break
        schritt = min(schritt * 4 | 1, 2 * max(h, w) | 1)

    if offen.any():
        # Nichts sicher Durchsichtiges im ganzen Bild: Dann ist die
        # Vorlage schon freigestellt, und es gibt keinen Saum abzuziehen.
        aus[offen] = rgb[offen]
    return aus


def entsaeumen(rgb, alpha, staerke):
    """F = (C - (1-a)*B) / a, nur im halbdurchsichtigen Band."""
    if staerke <= 0:
        return rgb
    a = (alpha / 255.0)[..., None]
    band = (a > BAND[0]) & (a < BAND[1])
    if not band.any():
        return rgb
    grund = grundfarbe(rgb, alpha)
    vorn = np.clip((rgb - (1.0 - a) * grund) / np.maximum(a, 1e-3), 0, 255)
    gemischt = rgb + (vorn - rgb) * staerke
    return np.where(band, gemischt, rgb)


# ---------- Der Lauf ----------

def frei(pfad, ziel, name, feinschliff, saum):
    da = {m["name"] for m in vorhanden()}
    if not da:
        raise RuntimeError(
            "In " + heim() + " liegt kein Modell. Einmalig mit Verbindung "
            "holen, siehe den Kopf von remove-background.py.")
    if name not in da:
        raise RuntimeError(f"Das Modell {name} liegt nicht in {heim()}.")

    bild = laden(pfad)
    rgb = np.asarray(bild).astype(np.float32)
    hoehe, breite = rgb.shape[:2]

    melde(0.05, "Modell wird geladen")
    sitzung(name)

    melde(0.15, "Vordergrund wird gesucht")
    alpha = maske(bild, name)
    melde(0.60 if feinschliff else 0.85, "Vordergrund steht")

    kasten = None
    if feinschliff:
        melde(0.62, "Zweiter Durchgang am Ausschnitt")
        alpha, kasten = zweiter_blick(bild, alpha, name)
        melde(0.88, "Feinschliff steht")

    anteil = float((alpha > 127).mean())
    if anteil < 0.0005:
        raise RuntimeError(
            "Das Modell hat keinen Vordergrund gefunden. Mit einem anderen "
            "Modell versuchen oder die Vorlage enger schneiden.")

    melde(0.92, "Farbsaum wird herausgerechnet")
    farbe = entsaeumen(rgb, alpha, saum)

    aus = np.concatenate([farbe, alpha[..., None]], axis=2)
    bild_aus = Image.fromarray(np.clip(aus, 0, 255).astype(np.uint8), "RGBA")
    os.makedirs(os.path.dirname(ziel) or ".", exist_ok=True)
    bild_aus.save(ziel, "PNG")
    melde(1.0, "Fertig")

    weich = float(((alpha > BAND[0] * 255) & (alpha < BAND[1] * 255)).mean())
    return dict(ok=True, breite=breite, hoehe=hoehe, modell=name,
                anteil=round(anteil, 4), kante=round(weich, 5),
                feinschliff=kasten is not None,
                kasten=list(kasten) if kasten else None,
                saum=round(saum, 2))


def main():
    p = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("befehl", choices=["pruefen", "frei"])
    p.add_argument("--bild")
    p.add_argument("--ziel")
    p.add_argument("--modell", default=STANDARD)
    p.add_argument("--feinschliff", type=int, default=1)
    p.add_argument("--saum", type=float, default=1.0)
    args = p.parse_args()

    if args.befehl == "pruefen":
        modelle = vorhanden()
        antwort = dict(ok=bool(modelle), modelle=modelle, heim=heim(),
                       python=sys.version.split()[0])
        try:
            import rembg
            antwort["rembg"] = getattr(rembg, "__version__", "unbekannt")
        except ImportError as fehler:
            antwort["ok"] = False
            antwort["grund"] = "rembg fehlt: " + str(fehler)
            print(json.dumps(antwort))
            return
        try:
            import onnxruntime
            antwort["onnxruntime"] = onnxruntime.__version__
        except ImportError as fehler:
            antwort["ok"] = False
            antwort["grund"] = "onnxruntime fehlt: " + str(fehler)
            print(json.dumps(antwort))
            return
        try:
            import cv2
            antwort["cv2"] = cv2.__version__
        except ImportError as fehler:
            antwort["ok"] = False
            antwort["grund"] = "OpenCV fehlt: " + str(fehler)
            print(json.dumps(antwort))
            return
        if not modelle:
            antwort["grund"] = ("In " + heim() + " liegt kein Modell. "
                                "Einmalig mit Verbindung holen, siehe den "
                                "Kopf von remove-background.py.")
        print(json.dumps(antwort))
        return

    saum = min(1.0, max(0.0, args.saum if args.saum == args.saum else 1.0))
    print(json.dumps(frei(args.bild, args.ziel, args.modell,
                          bool(args.feinschliff), saum)))


if __name__ == "__main__":
    try:
        main()
    except Exception as fehler:                      # noqa: BLE001
        print(json.dumps({"fehler": f"{type(fehler).__name__}: {fehler}"}))
        sys.exit(1)
