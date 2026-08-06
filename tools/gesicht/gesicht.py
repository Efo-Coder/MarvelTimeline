"""Gesichter in einem Bild neu aufbauen, nach dem Hochskalieren.

Alle Antworten gehen als eine Zeile JSON auf stdout, Fehler als
{"fehler": "..."} mit Rückgabewert 1. Derselbe Umgang wie in
tools/portrait-studio/bild.py, der Server ruft das Skript pro Aufgabe
einmal auf.

    gesicht.py pruefen
    gesicht.py veredeln --bild <pfad> --ziel <pfad> --modell gfpgan|codeformer
                        [--treue 0.7]

Warum das nötig ist
-------------------
Real-ESRGAN schärft Kanten, es kann aber keine Hautporen, Wimpern oder
Iris erfinden, die in der Vorlage nicht stehen. Gesichter geraten dadurch
glatt und wächsern. GFPGAN und CodeFormer gehen anders vor: Sie schneiden
das Gesicht heraus, richten es auf 512 Pixel aus und bauen es aus einem
gelernten Gesichtsmodell neu auf. Erst danach wird es zurückgeblendet.

Die beiden Modelle
------------------
**GFPGAN v1.4** stammt vom selben Team wie Real-ESRGAN und ist der
gutmütigere von beiden. Es liefert saubere Haut und wirkt zuverlässig,
schönt aber leicht: Ein Gesicht wird ebenmäßiger, als es war.

**CodeFormer** hat einen Regler zwischen Detailfreude und Ähnlichkeit,
hier `--treue`. Bei 0 erfindet es die meisten Einzelheiten und entfernt
sich am weitesten vom Original, bei 1 bleibt es dicht an der Vorlage und
tut entsprechend weniger. Bei bekannten Gesichtern ist das der Punkt: Zu
wenig Treue, und die Figur sieht aus wie jemand anderes. 0.7 ist der
Wert, den auch die Vorführung des Modells nimmt.

Ausrichten und Zurückblenden macht in beiden Fällen facexlib, dieselbe
Bibliothek, die auch die Originalimplementierungen benutzen. Damit
entspricht das Ergebnis dem, was die offiziellen Werkzeuge liefern.

Durchsichtigkeit
----------------
Die Vorlagen sind freigestellt. Die Modelle rechnen auf drei Kanälen,
der Alphakanal geht deshalb vor der Veredelung beiseite und kommt
danach unverändert zurück. Die Geometrie bleibt dabei gleich, das Bild
behält Größe und Lage, nur die Farbkanäle im Gesicht ändern sich.
"""

import argparse
import json
import os
import sys

import cv2
import numpy as np
import torch
from PIL import Image
from torchvision.transforms.functional import normalize

HIER = os.path.dirname(os.path.abspath(__file__))
FREMD = os.path.join(HIER, "fremd")
MODELLE = os.path.join(HIER, "modelle")

# Die Fremdarchitekturen liegen unter fremd/ und führen ihre eigenen
# Importe, siehe einrichten.py.
if FREMD not in sys.path:
    sys.path.insert(0, FREMD)

GEWICHT = {
    "gfpgan": os.path.join(MODELLE, "GFPGANv1.4.pth"),
    "codeformer": os.path.join(MODELLE, "codeformer.pth"),
}

# Ein Gesicht wird auf dieser Kantenlänge aufgebaut, so sind beide
# Modelle trainiert.
GESICHT = 512

# Unter dieser Augenweite in Pixeln ist ein Fund kein Gesicht, sondern
# Rauschen. Derselbe Wert wie in den Originalwerkzeugen.
MIN_AUGENABSTAND = 5


def geraet():
    return torch.device("cpu")


# Python schreibt auf Windows sonst in der Codepage der Konsole, und der
# Server liest UTF-8: Aus „zurückgeblendet“ würde „zur?ckgeblendet“.
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def melde(anteil, text=""):
    """Den Stand nach stderr, damit der Server ihn mitlesen kann.

    stdout bleibt der Antwort vorbehalten, dort steht am Ende genau eine
    Zeile JSON. Der Server erkennt diese Zeilen am Wort am Anfang, alles
    andere auf stderr gilt ihm als Fehlertext.
    """
    print(f"FORTSCHRITT {min(1.0, max(0.0, anteil)):.3f} {text}",
          file=sys.stderr, flush=True)


def tensor_zu_bild(tensor, min_max=(-1, 1)):
    """Ein Modellausgang als BGR-Bild in uint8."""
    t = tensor.squeeze(0).float().detach().cpu().clamp_(*min_max)
    t = (t - min_max[0]) / (min_max[1] - min_max[0])
    bild = t.numpy().transpose(1, 2, 0)
    bild = cv2.cvtColor(bild, cv2.COLOR_RGB2BGR)
    return (bild * 255.0).round().astype(np.uint8)


def lade_gewicht(pfad):
    """Die Gewichte aus einer .pth-Datei.

    weights_only=True ist der sichere Weg und reicht für beide Dateien,
    sie tragen nichts als Tensoren. Der Rückfall bleibt für den Fall,
    dass eine spätere Fassung des Modells etwas anderes mitbringt.
    """
    try:
        roh = torch.load(pfad, map_location="cpu", weights_only=True)
    except Exception:
        roh = torch.load(pfad, map_location="cpu", weights_only=False)
    for schluessel in ("params_ema", "params"):
        if schluessel in roh:
            return roh[schluessel]
    return roh


def baue_gfpgan():
    from gfpgan_archs.gfpganv1_clean_arch import GFPGANv1Clean
    modell = GFPGANv1Clean(
        out_size=GESICHT, num_style_feat=512, channel_multiplier=2,
        decoder_load_path=None, fix_decoder=False, num_mlp=8,
        input_is_latent=True, different_w=True, narrow=1, sft_half=True)
    modell.load_state_dict(lade_gewicht(GEWICHT["gfpgan"]), strict=True)
    return modell.eval().to(geraet())


def baue_codeformer():
    from basicsr.archs.codeformer_arch import CodeFormer
    modell = CodeFormer(
        dim_embd=512, codebook_size=1024, n_head=8, n_layers=9,
        connect_list=["32", "64", "128", "256"])
    modell.load_state_dict(lade_gewicht(GEWICHT["codeformer"]), strict=True)
    return modell.eval().to(geraet())


def veredle_ausschnitt(modell, name, ausschnitt, treue):
    """Ein ausgerichtetes Gesicht durch das Modell schicken.

    Herein und heraus geht je ein BGR-Bild von 512 Pixeln Kantenlänge.
    """
    from facexlib.utils import img2tensor

    t = img2tensor(ausschnitt / 255.0, bgr2rgb=True, float32=True)
    normalize(t, (0.5, 0.5, 0.5), (0.5, 0.5, 0.5), inplace=True)
    t = t.unsqueeze(0).to(geraet())

    with torch.no_grad():
        if name == "codeformer":
            ausgang = modell(t, w=treue, adain=True)[0]
        else:
            ausgang = modell(t, return_rgb=False)[0]
    return tensor_zu_bild(ausgang)


def veredeln(pfad, ziel, name, treue):
    # Die Abschnitte und ihr Anteil am Ganzen, an den gemessenen Zeiten
    # ausgerichtet: Das Laden der Netze und das Suchen der Gesichter
    # kosten zusammen etwa ein Drittel, der Rest ist die Rechenarbeit je
    # Gesicht und das Zurückblenden.
    melde(0.02, "Gesichtserkennung wird geladen")
    from facexlib.utils.face_restoration_helper import FaceRestoreHelper

    quelle = Image.open(pfad)
    rgba = np.asarray(quelle.convert("RGBA"))
    alpha = rgba[..., 3].copy()
    bgr = cv2.cvtColor(rgba[..., :3], cv2.COLOR_RGB2BGR)

    helfer = FaceRestoreHelper(
        upscale_factor=1,
        face_size=GESICHT,
        crop_ratio=(1, 1),
        det_model="retinaface_resnet50",
        save_ext="png",
        use_parse=True,          # weiche Maske aus der Gesichtsanalyse
        device=geraet(),
    )
    helfer.clean_all()
    helfer.read_image(bgr)
    melde(0.10, "Gesichter werden gesucht")
    gefunden = helfer.get_face_landmarks_5(
        only_center_face=False, resize=640, eye_dist_threshold=MIN_AUGENABSTAND)
    if not gefunden:
        melde(1.0, "Kein Gesicht gefunden")
        return dict(ok=True, gesichter=0, hinweis="kein-gesicht")
    helfer.align_warp_face()

    melde(0.20, f"Modell {name} wird geladen")
    modell = baue_codeformer() if name == "codeformer" else baue_gfpgan()
    # Ein einzelnes misslungenes Gesicht soll nicht das ganze Bild
    # kosten. Es bleibt dann, wie es war, und wird im Bericht gezählt:
    # still danebengehen darf es nicht.
    misslungen = []
    anzahl = len(helfer.cropped_faces)
    for nummer, ausschnitt in enumerate(helfer.cropped_faces):
        # Der Bereich von 0.30 bis 0.90 gehört den Gesichtern, gleichmäßig
        # unter ihnen aufgeteilt.
        melde(0.30 + 0.60 * nummer / anzahl,
              f"Gesicht {nummer + 1} von {anzahl} wird neu aufgebaut")
        try:
            neu = veredle_ausschnitt(modell, name, ausschnitt, treue)
        except Exception as fehler:                  # noqa: BLE001
            misslungen.append(f"{type(fehler).__name__}: {fehler}")
            neu = ausschnitt
        helfer.add_restored_face(neu.astype("uint8"))

    melde(0.90, "Gesichter werden zurückgeblendet")
    helfer.get_inverse_affine(None)
    fertig = helfer.paste_faces_to_input_image(upsample_img=None)

    # Der Alphakanal war nie im Spiel und kommt unverändert zurück.
    rgb = cv2.cvtColor(fertig, cv2.COLOR_BGR2RGB)
    aus = np.dstack([rgb, alpha]).astype(np.uint8)
    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    melde(0.96, "Bild wird geschrieben")
    Image.fromarray(aus, "RGBA").save(ziel)
    melde(1.0, "Fertig")

    hoehe, breite = fertig.shape[:2]
    return dict(ok=True, gesichter=len(helfer.cropped_faces),
                misslungen=misslungen, breite=int(breite), hoehe=int(hoehe))


def main():
    p = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("befehl", choices=["pruefen", "veredeln"])
    p.add_argument("--bild")
    p.add_argument("--ziel")
    p.add_argument("--modell", choices=["gfpgan", "codeformer"], default="gfpgan")
    p.add_argument("--treue", type=float, default=0.7,
                   help="nur CodeFormer: 0 erfindet am meisten, 1 bleibt am nächsten "
                        "an der Vorlage")
    args = p.parse_args()

    if args.befehl == "pruefen":
        print(json.dumps({
            "ok": True,
            "python": sys.version.split()[0],
            "torch": torch.__version__,
            "modelle": sorted(n for n, d in GEWICHT.items() if os.path.isfile(d)),
        }))
        return

    treue = min(1.0, max(0.0, args.treue))
    print(json.dumps(veredeln(args.bild, args.ziel, args.modell, treue)))


if __name__ == "__main__":
    try:
        main()
    except Exception as fehler:                      # noqa: BLE001
        print(json.dumps({"fehler": f"{type(fehler).__name__}: {fehler}"}))
        sys.exit(1)
