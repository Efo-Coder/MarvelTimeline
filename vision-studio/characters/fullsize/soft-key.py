"""Rechnet aus einem Bild vor Schwarz ein Ganzkörperbild mit weicher Kante.

Für Figuren, die keine Silhouette haben. Dormammu ist ein Gesicht, das am
Rand in Rauch und Glut ausläuft, und jeder Freisteller zieht mitten durch
diesen Rauch eine Linie. Vor der schwarzen Wand der Bühne steht dann ein
ausgeschnittener Kopf, wo die Vorlage ein Gesicht zeigt, das aus dem Dunkel
kommt.

Statt eine Kante zu suchen, rechnet dieses Skript die Deckung aus dem Bild
selbst. Die Vorlage ist die Figur über Schwarz gelegt, jeder Bildpunkt also
Deckung mal Farbe. Mit jeder Deckung, die mindestens so groß ist wie der
hellste Kanal, und der Farbe Bildpunkt durch Deckung kommt über Schwarz
wieder genau die Vorlage heraus. Welche Deckung man wählt, entscheidet nur,
wie viel von einem anderen Grund durchscheint:

  Kern   Im Inneren des Kopfes volle Deckung. Seine Schatten bleiben
         schwarz, und das Muster der Wand läuft nicht durch das Gesicht.
         Nach außen fällt die Deckung über ein Band weich auf null, und
         dort kommt die Wand allmählich durch.
  Glut   Außerhalb davon deckt ein Bildpunkt so stark, wie er hell ist.
         Flammen und Rippen, die über den Kopf hinausragen, bleiben stehen,
         das Schwarz zwischen ihnen wird durchsichtig.

Ohne den Kern, also nur aus der Helligkeit gerechnet, schiene jeder Grund
durch die dunklen Stellen des Gesichts. Auf der schwarzen Wand fällt das
kaum auf, auf den hellen Tafeln der Seite wäre der Kopf ein Geist.

Aufruf
------
Aus der Wurzel des Repos, mit der Umgebung der Skills (Pillow, NumPy,
OpenCV):

    SKRIPT=vision-studio/characters/fullsize/soft-key.py

    python $SKRIPT <vorlage> <name>          # Probelauf, schreibt nichts
    python $SKRIPT <vorlage> <name> --apply  # schreibt fullsize/<name>.webp

Eine vorhandene Datei wandert vorher nach vision-studio/.sicherung, unter
demselben Namen, den das Studio dafür benutzt.
"""

import argparse
import datetime
import os
import shutil

import cv2
import numpy as np
from PIL import Image

# Drei Ebenen hoch: fullsize, characters, vision-studio.
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
FULLSIZE = os.path.join(REPO, "assets", "characters", "fullsize")
BACKUP = os.path.join(REPO, "vision-studio", ".sicherung")

ALPHA_MIN = 8      # ab hier gilt ein Pixel als Inhalt, wie in crop-fullsize.py
QUALITY = 86       # wie import-look.py im Skill looks
HEAD_MIN = 0.07    # geglättete Helligkeit, ab der eine Stelle zum Kopf zählt
ROUNDING = 16      # so stark wird der Umriss des Kopfes gerundet, in Pixeln


def black_level(image):
    """Wie hell das Schwarz der Vorlage ist. JPEG rauscht, ganz null ist es nie.

    Das neunte Zehntel des Randes und nicht sein hellster Wert: Manche
    Vorlagen tragen am Rand eine hellere Haarlinie, die sonst als Grund
    gälte und dem Gesicht die Tiefen nähme.
    """
    edge = np.concatenate([image[:30].reshape(-1, 3), image[-30:].reshape(-1, 3),
                           image[:, :30].reshape(-1, 3), image[:, -30:].reshape(-1, 3)])
    return float(np.percentile(edge.max(axis=1), 90)) + 1 / 255


def head_mask(brightness):
    """Der Kopf als eine geschlossene, runde Fläche."""
    mask = (cv2.GaussianBlur(brightness, (0, 0), 9) > HEAD_MIN).astype(np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE,
                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61)))
    # Nur das größte Stück: Einzelne Funken weit draußen sind kein Kopf.
    _, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    mask = (labels == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    # Den Umriss runden: Die Rippen am Scheitel und die Flammen an den Seiten
    # geben der Fläche Stufen und Zacken, und auf einem hellen Grund zeichnet
    # der dunkle Hof um den Kopf genau diese Stufen nach.
    mask = (cv2.GaussianBlur(mask.astype(np.float32), (0, 0), ROUNDING) > 0.5).astype(np.uint8)
    # Und die Buchten schließen: Wo eine Seite des Scheitels im Schatten liegt,
    # fehlt sie der Fläche, und der Hof bekäme dort eine Kerbe.
    outline, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.fillConvexPoly(mask, cv2.convexHull(np.vstack(outline)), 1)
    return mask


def soft_key(path, inner, outer, glow):
    """Gibt das fertige Bild als RGBA-Feld zurück, randlos zugeschnitten."""
    image = np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255
    floor = black_level(image)
    clean = np.clip((image - floor) / (1 - floor), 0, 1)
    brightness = clean.max(axis=2)

    # Abstand zum Rand des Kopfes, innen negativ. Daraus das weiche Band.
    mask = head_mask(brightness)
    distance = (cv2.distanceTransform(1 - mask, cv2.DIST_L2, 5)
                - cv2.distanceTransform(mask, cv2.DIST_L2, 5))
    t = np.clip((outer - distance) / (outer + inner), 0, 1)
    core = t * t * (3 - 2 * t)

    alpha = np.maximum(core, np.clip(cv2.GaussianBlur(brightness, (0, 0), 0.8) * glow, 0, 1))
    # Weit draußen bleibt nur Rauschen übrig, das als Glut durchginge.
    alpha *= np.clip((outer * 1.6 - distance) / (outer * 0.6), 0, 1)
    alpha[alpha < 2 / 255] = 0

    colour = np.clip(clean / np.maximum(alpha, 1e-3)[..., None], 0, 1)
    colour[alpha == 0] = 0

    rows, cols = np.where(alpha > ALPHA_MIN / 255)
    out = np.dstack([colour, alpha])[rows.min():rows.max() + 1, cols.min():cols.max() + 1]
    return (out * 255 + 0.5).astype(np.uint8)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("vorlage", help="Bild der Figur vor Schwarz")
    parser.add_argument("name", help="Dateiname in fullsize, ohne Endung")
    parser.add_argument("--innen", type=float, default=28,
                        help="wie weit das Band in den Kopf hineinreicht, in Pixeln")
    parser.add_argument("--aussen", type=float, default=30,
                        help="wie weit es über ihn hinausreicht, in Pixeln")
    parser.add_argument("--glut", type=float, default=2.6,
                        help="Verstärkung der Helligkeit zur Deckung")
    parser.add_argument("--apply", action="store_true", help="schreibt die Datei")
    args = parser.parse_args()

    out = soft_key(args.vorlage, args.innen, args.aussen, args.glut)
    height, width = out.shape[:2]
    edge = np.concatenate([out[0, :, 3], out[-1, :, 3], out[:, 0, 3], out[:, -1, 3]])
    print(f"{args.name}.webp: {width}x{height}, Deckung am Dateirand höchstens {edge.max()}/255")

    if not args.apply:
        print("Probelauf, nichts geschrieben. Mit --apply schreiben.")
        return

    target = os.path.join(FULLSIZE, args.name + ".webp")
    if os.path.exists(target):
        stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H-%M-%S")
        backup = os.path.join(BACKUP, f"gk-{args.name}-{stamp}.webp")
        os.makedirs(BACKUP, exist_ok=True)
        shutil.copy2(target, backup)
        print(f"Bisherige Datei gesichert als {os.path.relpath(backup, REPO)}")
    Image.fromarray(out, "RGBA").save(target, "WEBP", quality=QUALITY, method=6, alpha_quality=100)
    Image.open(target).load()            # zur Probe wieder einlesen
    print(f"Geschrieben: {os.path.relpath(target, REPO)}")


if __name__ == "__main__":
    main()
