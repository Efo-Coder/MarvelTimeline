"""Holt die Cover der Filme und Serien in die Fanpage.

Die Vorlagen liegen als Plakate in einem Ordner ausserhalb des Projekts,
benannt nach der Reihenfolge des Nutzers ("22 - Avengers - 03 - Infinity
War.webp"). Die Seite braucht sie unter ihrem Slug aus js/data.js, also
assets/covers/<slug>.webp. Dazwischen steht diese Zuordnung.

    python tools/covers/import-covers.py
    python tools/covers/import-covers.py --source "D:/woanders" --force

Gerechnet wird nur, was noetig ist: Ein Plakat wird auf COVER_WIDTH
verkleinert (nie vergroessert, ein 480 Pixel breites Plakat bleibt 480)
und als WebP gespeichert. Der Zuschnitt aufs Kachelmass macht das
Stylesheet, hier bleibt jedes Plakat in seinem eigenen Seitenverhaeltnis.

Fehlt ein Titel in TITLES, laesst die Seite den Platz nicht leer: Sie
zeigt das Filmlogo auf dunklem Grund (siehe js/films.js). Neue Plakate
bekommen also nur eine Zeile hier und einen Lauf.
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow fehlt:  pip install pillow")

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "covers"
SOURCE = Path.home() / "Desktop" / "Marvel" / "Illustrations" / "Movie Covers"

# Breite der abgelegten Datei. Die Kacheln sind rund 250 Pixel breit,
# das Doppelte deckt auch feine Bildschirme ab.
COVER_WIDTH = 500
QUALITY = 82

# Slug aus js/data.js  ->  Dateiname im Vorlagenordner.
# Loki und Daredevil teilen sich je einen Slug ueber beide Staffeln, also
# auch ein Cover. Titel ohne Eintrag zeigen ihr Logo als Platzhalter.
TITLES = {
    "captain-america-the-first-avenger": "01 - Captain America - The First Avenger.webp",
    "captain-marvel": "44 - Captain Marvel.jpeg",
    "iron-man": "03 - Iron Man.webp",
    "iron-man-2": "04 - Iron Man.webp",
    "thor": "06 - Thor.webp",
    "the-avengers": "07 - Avengers.webp",
    "thor-the-dark-world": "08 - Thor - The Dark World.webp",
    "iron-man-3": "09 - Iron Man 3.webp",
    "captain-america-the-winter-soldier": "10 - Captain America - The Winter Soldier.webp",
    "guardians-of-the-galaxy": "11 - Guardians of the Galaxy.webp",
    "guardians-of-the-galaxy-vol-2": "12 - Guardians of the Galaxy - Volume 2.webp",
    "avengers-age-of-ultron": "13 - Avengers - Age of Ultron.webp",
    "ant-man": "14 - Ant-Man.webp",
    "captain-america-civil-war": "15 - Captain America - Civil War.webp",
    "black-widow": "16 - Black Widow.webp",
    "black-panther": "17 - Black Panther.jpeg",
    "doctor-strange": "19 - Doctor Strange.webp",
    "thor-ragnarok": "20 - Thor - Ragnarok (DE).webp",
    "ant-man-and-the-wasp": "21 - Ant-Man and the Wasp.webp",
    "avengers-infinity-war": "22 - Avengers - 03 - Infinity War.webp",
    "avengers-endgame": "23 - Avengers - 04 - Endgame.webp",
    "loki": "24 - Loki.webp",
    "wandavision": "25 - WandaVision.webp",
    "shang-chi": "26 - Shang-Chi and the Legend of the Ten Rings.webp",
    "the-falcon-and-the-winter-soldier": "27 - The Falcon and the Winter Soldier.webp",
    "eternals": "29 - Eternals.webp",
    "doctor-strange-in-the-multiverse-of-madness": "31 - Doctor Strange in the Multiverse of Madness.webp",
    "hawkeye": "32 - Hawkeye.webp",
    "deadpool-and-wolverine": "33 - Deadpool & Wolverine.webp",
    "moon-knight": "34 - Moon Knight.webp",
    "ms-marvel": "35 - Ms Marvel.webp",
    "thor-love-and-thunder": "36 - Thor - Love And Thunder.webp",
    "she-hulk": "37 - Shehulk.webp",
    "black-panther-wakanda-forever": "38 - Black Panther - Wakanda Forever.webp",
    "ant-man-and-the-wasp-quantumania": "40 - Ant-Man and the Wasp - Quantumania.webp",
    "guardians-of-the-galaxy-vol-3": "41 - Guardians of the Galaxy - Volume 3.webp",
    "secret-invasion": "42 - Secret Invasion.webp",
    "echo": "43 - Echo.webp",
    "the-marvels": "44 - The Marvels.webp",
    "agatha-all-along": "45 - Agatha All Along.webp",
    "captain-america-brave-new-world": "46 - Captain America - New Brave World.webp",
    "daredevil-born-again": "47 - Daredevil Born Again.webp",
    "ironheart": "48 - Ironheart.webp",
    "thunderbolts": "49 - Thunderbolts.webp",
    "the-fantastic-four-first-steps": "50 - Fantastic Four - First Steps.webp",
    "wonder-man": "51 - Wonder Man.webp",
    "the-punisher-one-last-kill": "53 - The Punisher - One Last Kill.webp",
    "avengers-doomsday": "56 - Avengers - 05 - Doomsday.jpeg",
    "x-men": "X-Men (2027).png",
}


def convert(src: Path, dst: Path) -> str:
    image = Image.open(src)
    if image.mode != "RGB":
        image = image.convert("RGB")
    if image.width > COVER_WIDTH:
        height = round(image.height * COVER_WIDTH / image.width)
        image = image.resize((COVER_WIDTH, height), Image.LANCZOS)
    image.save(dst, "WEBP", quality=QUALITY, method=6)
    return f"{image.width}x{image.height}, {dst.stat().st_size // 1024} KB"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=SOURCE,
                        help="Ordner mit den Plakaten (Vorgabe: Desktop)")
    parser.add_argument("--force", action="store_true",
                        help="auch schon abgelegte Cover neu rechnen")
    args = parser.parse_args()

    if not args.source.is_dir():
        sys.exit(f"Vorlagenordner nicht gefunden: {args.source}")
    OUT.mkdir(parents=True, exist_ok=True)

    neu = uebersprungen = 0
    for slug, name in sorted(TITLES.items()):
        src = args.source / name
        dst = OUT / f"{slug}.webp"
        if not src.is_file():
            print(f"  fehlt   {slug}: {name}")
            continue
        if dst.exists() and not args.force:
            uebersprungen += 1
            continue
        print(f"  {slug}: {convert(src, dst)}")
        neu += 1

    print(f"\n{neu} Cover abgelegt, {uebersprungen} schon vorhanden "
          f"(--force rechnet sie neu). Ziel: {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
