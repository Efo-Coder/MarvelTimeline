"""Legt die kleinen Plakate fuer die Wand im Kopfband der Filmseite an.

Die Plakate unter assets/covers/ sind 500 Pixel breit, weil die Kacheln
der Reihen rund 250 Pixel breit stehen. Im Kopfband laufen dieselben
Plakate als treibende Wand, dort ist eine Kachel aber nur etwa 160 Pixel
breit, und sie laufen alle gleichzeitig. Der ganze Satz in voller
Groesse waere ueber sechs Megabyte, die vor dem ersten Bild der Seite
geladen sein wollen.

Deshalb dieser zweite, kleinere Satz unter assets/covers/wall/. Er ist
auf WALL_WIDTH verkleinert, deckt mit dem Doppelten der Kachelbreite
auch feine Bildschirme ab und kommt zusammen auf rund ein Megabyte.

    python vision-studio/films/covers/build-wall-covers.py
    python vision-studio/films/covers/build-wall-covers.py --force

Gerechnet wird nur, was fehlt oder aelter ist als seine Vorlage. Neue
Plakate brauchen also erst import-covers.py und danach einen Lauf hier.
Welche Titel die Wand zeigt, steht nirgends in einer Liste: js/drift-wall.js
fragt jedes Plakat aus js/data.js einmal an und baut die Wand aus dem,
was ankommt.
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageEnhance
except ImportError:
    sys.exit("Pillow fehlt:  pip install pillow")

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "assets" / "covers"
OUT = SOURCE / "wall"

# Breite der abgelegten Datei. Eine Kachel der Wand ist rund 160 Pixel
# breit, das Doppelte deckt auch feine Bildschirme ab.
WALL_WIDTH = 300
QUALITY = 76

# Die Farbe eine Spur zurueckgenommen. Die Plakate sind bunt und laut,
# und im Hintergrund soll keines davon die Aufmerksamkeit ziehen.
#
# Das gehoert hierher und nicht ins Stylesheet: Ein Filter dort muesste
# der Browser fuer jede der weit ueber hundert Kacheln einzeln rechnen,
# und zwar bei jedem Bild neu. Hier wird er einmal gerechnet und steht
# danach in der Datei.
SATURATION = 0.9


def build(force):
    OUT.mkdir(parents=True, exist_ok=True)
    made = 0
    kept = 0
    total = 0

    for src in sorted(SOURCE.glob("*.webp")):
        dst = OUT / src.name
        if not force and dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
            kept += 1
            total += dst.stat().st_size
            continue

        image = Image.open(src).convert("RGB")
        # Nie vergroessern: Ein Plakat, das schon schmaler ist, bleibt wie
        # es ist und wird nur neu gespeichert.
        width = min(WALL_WIDTH, image.width)
        height = round(image.height * width / image.width)
        image = image.resize((width, height), Image.LANCZOS)
        image = ImageEnhance.Color(image).enhance(SATURATION)
        image.save(dst, "WEBP", quality=QUALITY, method=6)
        made += 1
        total += dst.stat().st_size
        print(f"  {src.name}  ->  {width}x{height}")

    print(f"\n{made} neu, {kept} unveraendert, zusammen {round(total / 1024)} KB")
    print(f"Ordner: {OUT}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true",
                        help="alle neu rechnen, auch die unveraenderten")
    args = parser.parse_args()

    if not SOURCE.is_dir():
        sys.exit(f"Kein Ordner {SOURCE}")
    build(args.force)


if __name__ == "__main__":
    main()
