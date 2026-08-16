"""Schneidet die Ganzkoerperbilder randlos auf ihren sichtbaren Inhalt zu.

Der Rahmen auf der Charakterseite (.char-figure-frame in css/style.css) hat
eine feste Hoehe, und wie gross eine Figur darin steht, ergibt sich aus dem
Bild selbst und aus FULLSIZE_SCALE in js/chars.js. Beides rechnet damit, dass
die Datei randlos ist. Traegt sie leere Flaeche mit sich, steht die Figur zu
klein im Rahmen und schwebt ueber der Bodenlinie, statt auf ihr zu stehen.

Warum die Alphaschwelle bei 8 liegt und nicht bei 0
---------------------------------------------------
Verlustbehaftetes WebP legt beim Speichern einen ein bis zwei Pixel breiten
Saum mit Alphawerten von 1 bis 7 ueber das ganze Bild. Sichtbar ist der nicht,
er haelt aber jede Bounding Box auf volle Bildgroesse offen. Ein Zuschnitt
ueber `getbbox()` allein bleibt bei fertigen WebP-Dateien deshalb wirkungslos,
auch wenn rundherum offensichtlich nichts steht.

Hoeher als 8 darf die Schwelle nicht liegen. Energieeffekte wie bei
quake-powers oder wanda-maximoff-multiverse-of-madness haben Alphawerte um 10
bis 30 und sind echter Bildinhalt, den ein groesserer Wert wegschneiden wuerde.

Aufruf
------
Aus der Wurzel des Repos, der Weg ist SKRIPT:

    SKRIPT=tools/portrait-studio/services/fullsize/crop-fullsize.py

    python $SKRIPT                        # Probelauf, schreibt nichts
    python $SKRIPT --apply                # schreibt die Dateien
    python $SKRIPT --apply a.webp b.webp  # nur diese beiden
"""

import argparse
import io
import os
import sys

from PIL import Image

# Vier Ebenen hoch: fullsize, services, portrait-studio, tools.
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
FULLSIZE = os.path.join(REPO, "assets", "characters", "fullsize")

ALPHA_MIN = 8      # ab hier gilt ein Pixel als Inhalt, siehe oben
MIN_EDGE = 4       # weniger Rand als das lohnt das Neukodieren nicht
QUALITY = 90       # ein Zuschnitt kodiert neu, deshalb hoch genug angesetzt


def content_box(im):
    """Huelle aller Pixel, die sichtbar genug sind, um zu zaehlen."""
    mask = im.getchannel("A").point(lambda v: 255 if v > ALPHA_MIN else 0)
    return mask.getbbox()


def crop_file(path, apply, quality=QUALITY):
    """Schneidet eine Datei zu. Gibt None zurueck, wenn nichts zu tun war."""
    im = Image.open(path)
    if im.mode != "RGBA":
        # Ohne Alphakanal gibt es keinen freigestellten Rand zu finden.
        return None
    im = im.convert("RGBA")
    w, h = im.size

    box = content_box(im)
    if box is None:
        return None                      # komplett transparent, nicht anfassen

    left, top, right, bottom = box
    edges = (left, top, w - right, h - bottom)
    if max(edges) < MIN_EDGE:
        return None

    out = im.crop(box)
    size_old = os.path.getsize(path)
    if apply:
        out.save(path, "WEBP", quality=quality, method=6, alpha_quality=100)
        size_new = os.path.getsize(path)
    else:
        buf = io.BytesIO()
        out.save(buf, "WEBP", quality=quality, method=6, alpha_quality=100)
        size_new = len(buf.getvalue())
    return (w, h), out.size, edges, size_old, size_new


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="*",
                    help="einzelne Dateien; ohne Angabe der ganze Ordner")
    ap.add_argument("--apply", action="store_true",
                    help="Dateien wirklich ueberschreiben (sonst Probelauf)")
    ap.add_argument("--dir", default=FULLSIZE,
                    help="Ordner statt assets/characters/fullsize")
    ap.add_argument("--quality", type=int, default=QUALITY,
                    help=f"WebP-Qualitaet beim Neukodieren (Vorgabe {QUALITY})")
    args = ap.parse_args()

    if args.files:
        paths = [f if os.path.isabs(f) else os.path.join(args.dir, f)
                 for f in args.files]
    else:
        paths = [os.path.join(args.dir, f) for f in sorted(os.listdir(args.dir))
                 if f.lower().endswith(".webp")]

    missing = [p for p in paths if not os.path.exists(p)]
    if missing:
        sys.exit("nicht gefunden: " + ", ".join(os.path.basename(p) for p in missing))

    results = []
    before = after = 0
    for p in paths:
        size_old = os.path.getsize(p)
        before += size_old
        res = crop_file(p, args.apply, args.quality)
        if res is None:
            after += size_old
            continue
        old, new, edges, _, size_new = res
        after += size_new
        saved = 1 - (new[0] * new[1]) / (old[0] * old[1])
        results.append((saved, os.path.basename(p), old, new, edges))

    results.sort(reverse=True)
    if results:
        print(f"{'Datei':50} {'vorher':>12} {'nachher':>12} {'Flaeche':>8}  Rand L/O/R/U")
        for saved, name, old, new, edges in results:
            print(f"{name:50} {str(old):>12} {str(new):>12} "
                  f"{saved * 100:6.1f}%  {edges}")
        print()

    modus = "ANGEWENDET" if args.apply else "PROBELAUF (nichts geschrieben)"
    print(f"{modus}: {len(results)} zugeschnitten, "
          f"{len(paths) - len(results)} unveraendert")
    print(f"Gesamtgroesse: {before / 1024 / 1024:.1f} MB "
          f"-> {after / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
