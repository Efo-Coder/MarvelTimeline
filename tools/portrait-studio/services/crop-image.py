"""Bildarbeit für das Porträt-Studio: Zuschnitt vorschlagen und speichern.

Alle Antworten gehen als eine Zeile JSON auf stdout, Fehler als
{"fehler": "..."} mit Rückgabewert 1. Der Server ruft das Skript pro
Aufgabe einmal auf, es hält keinen Zustand.

    crop-image.py pruefen
    crop-image.py analyse --bild <pfad> [--winkel <grad>]
    crop-image.py schneiden --bild <pfad> --ziel <pfad> --x <px> --y <px> --seite <px>
                      [--winkel <grad>] [--merken <vorlagenname>]
    crop-image.py rand --bild <pfad> [--winkel <grad>]
    crop-image.py frei --bild <pfad> --ziel <pfad> --x --y --breite --hoehe
                      [--winkel <grad>]

Die ersten drei Befehle gehören zu den runden Porträts, die letzten beiden
zu den Ganzkörperbildern. Dort ist der Ausschnitt ein freies Rechteck, und
der Vorschlag ist kein Kopf, sondern die Hülle des sichtbaren Inhalts:
Ganzkörperbilder gehören randlos zugeschnitten, sonst steht die Figur auf
der Charakterseite zu klein im Rahmen und schwebt über der Bodenlinie.
Dieselbe Regel wie in tools/crop-fullsize.py.

--winkel richtet eine schief stehende Vorlage aus. Gedreht wird um ihren
Mittelpunkt, die Fläche wächst dabei auf die Hülle des gedrehten Bildes.
Alle Angaben zum Ausschnitt zählen danach in dieser Fläche, denn genau so
misst die Bühne des Studios. Die Maße der Fläche stehen deshalb hier und
in studio.js wortgleich, bis hin zum Aufrunden: Ein Pixel Unterschied
verschöbe den Ausschnitt. Zusammen mit --merken ergibt eine Drehung keinen
Sinn, der Skill dreht beim nächsten Lauf nicht mit.

Der Vorschlag aus "analyse" ist genau der Ausschnitt, den der Skill
portraits von sich aus wählen würde. Dafür wird dessen zuschnitt.py
importiert statt nachgebaut, damit beide Wege nicht auseinanderlaufen.
Fehlt der Skill (er liegt unter .claude und damit außerhalb der
Versionsverwaltung), bleibt der Vorschlag aus und nur das Zuschneiden von
Hand funktioniert.

Anders als der Skill holt sich dieses Skript rembg nicht dazu. Eine
deckende Vorlage wird also nicht freigestellt, sondern nur beschnitten,
und der Kopf allein aus der Gesichtsbox geschätzt. Das steht als
"alpha": false in der Antwort, die Oberfläche weist darauf hin.
"""

import argparse
import json
import math
import os
import sys

import numpy as np
from PIL import Image

# Drei Ebenen hoch: services, portrait-studio, tools.
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
SKILL = os.path.join(REPO, ".claude", "skills", "portraits", "scripts")

# Dieselben Werte wie in zuschnitt.py, hier für den Fall gespiegelt, dass
# der Skill fehlt. Ändern sie sich dort, gehören sie auch hierher.
SIZE = 480          # Obergrenze der Kantenlänge
MIN_SIZE = 240      # Untergrenze, so groß waren die alten Porträts
HEAD_SHARE = 0.60   # Anteil der Kopfhöhe an der Bildhöhe
TOP_MARGIN = 0.06   # Luft über dem Kopf, Anteil der Bildhöhe

# Ganzkörper. ALPHA_MIN steht wie in tools/crop-fullsize.py bei 8: Ein
# verlustbehaftetes WebP legt einen Saum mit Alphawerten von 1 bis 7 über
# das ganze Bild, der jede Hülle auf volle Bildgröße offen hält. Höher darf
# die Schwelle nicht liegen, Energieeffekte fangen bei etwa 10 an.
ALPHA_MIN = 8
GK_MAX_HOEHE = 1500   # so hoch ist das größte Bild im Bestand
GK_MAX_BREITE = 1200
GK_QUALITY = 90       # ein Zuschnitt kodiert neu, deshalb hoch angesetzt


def skill():
    """Das Modul zuschnitt.py des Skills oder None.

    Es beendet sich beim Import selbst, wenn cv2 fehlt, deshalb muss der
    Fang bis BaseException reichen.
    """
    if not os.path.isdir(SKILL):
        return None
    if SKILL not in sys.path:
        sys.path.insert(0, SKILL)
    try:
        import zuschnitt
        return zuschnitt
    except BaseException:
        return None


# ---------- Ausrichten ----------

def dreh_masse(w, h, winkel):
    """Die Fläche, die das gedrehte Bild braucht.

    Wortgleich zu drehMasse() in studio.js, samt Aufrunden: Python rundet
    die halbe Zahl von sich aus zur geraden, JavaScript nach oben, deshalb
    das ausgeschriebene floor(x + 0.5).
    """
    rad = math.radians(winkel)
    c, s = abs(math.cos(rad)), abs(math.sin(rad))
    return (max(1, int(math.floor(w * c + h * s + 0.5))),
            max(1, int(math.floor(w * s + h * c + 0.5))))


def drehen(rgba, winkel):
    """Die Vorlage um ihren Mittelpunkt drehen, die Fläche wächst mit.

    Die Matrix führt vom Ziel zurück in die Vorlage, so will es
    Image.transform. Sie ist die Umkehrung dessen, was die Bühne mit
    ctx.rotate() tut, positive Winkel drehen also auch hier im
    Uhrzeigersinn.
    """
    if not winkel:
        return rgba
    h, w = rgba.shape[:2]
    nw, nh = dreh_masse(w, h, winkel)
    rad = math.radians(winkel)
    c, s = math.cos(rad), math.sin(rad)
    matrix = (c, s, -c * nw / 2.0 - s * nh / 2.0 + w / 2.0,
              -s, c, s * nw / 2.0 - c * nh / 2.0 + h / 2.0)

    # Vor dem Drehen mit Alpha multiplizieren, sonst blutet Schwarz aus
    # den durchsichtigen Pixeln in die neue Kante. Dieselbe Vorsicht wie
    # beim Verkleinern weiter unten.
    a = rgba[..., 3:4] / 255.0
    vor = np.concatenate([rgba[..., :3] * a, rgba[..., 3:4]], axis=2)
    im = Image.fromarray(np.clip(vor, 0, 255).astype(np.uint8), "RGBA")
    im = im.transform((nw, nh), Image.AFFINE, matrix,
                      resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0))
    arr = np.asarray(im).astype(np.float32)
    a2 = arr[..., 3:4] / 255.0
    rgb = np.clip(arr[..., :3] / np.maximum(a2, 1e-3), 0, 255)
    return np.concatenate([rgb, arr[..., 3:4]], axis=2)


# ---------- Vorlage laden ----------

def laden(pfad, winkel=0.0):
    """RGBA der Vorlage, dazu eine auf Weiß gelegte Fassung für die
    Erkennung und die Auskunft, ob überhaupt Alpha mit Inhalt da ist."""
    im = Image.open(pfad)
    arr = np.asarray(im.convert("RGBA")).astype(np.float32)
    hat_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    if hat_alpha and float((arr[..., 3] < 250).mean()) < 0.02:
        hat_alpha = False          # Alphakanal vorhanden, aber ohne Inhalt
    # Erst nach dieser Frage drehen: Eine Drehung legt durchsichtige Ecken
    # an, und die machten aus jeder deckenden Vorlage eine freigestellte.
    arr = drehen(arr, winkel)
    a = arr[..., 3:4] / 255.0
    flach = arr[..., :3] * a + 255.0 * (1.0 - a)
    return flach, arr, hat_alpha


# ---------- Vorschlag ----------

def aus_gesicht(fx, fy, fw, fh):
    """Kopf allein aus der Gesichtsbox, ohne Maske zum Nachlaufen.

    Der Scheitel liegt bei einem Erwachsenen rund eine halbe Gesichtshöhe
    über der Augenpartie, das Kinn knapp darunter. Grob, aber es setzt den
    Kreis in die Nähe, den Rest schiebt der Nutzer zurecht.
    """
    kopf_oben = fy - 0.42 * fh
    kopf_h = 1.55 * fh
    return fx + fw / 2.0, kopf_oben, kopf_h


def analyse(pfad, winkel=0.0):
    flach, rgba, hat_alpha = laden(pfad, winkel)
    h, w = rgba.shape[:2]
    z = skill()

    if z is None:
        # Ohne Skill ein Quadrat über die obere Bildhälfte, mittig.
        seite = min(w, h * 0.55)
        return dict(breite=w, hoehe=h, x=(w - seite) / 2.0, y=0.0,
                    seite=seite, art="ohne-skill", alpha=hat_alpha)

    if hat_alpha:
        links, oben, seite, art = z.ausschnitt(flach, rgba, os.path.basename(pfad))
    else:
        treffer = z.gesicht(flach)
        if treffer is None:
            seite = min(w, h * 0.55)
            links, oben, art = (w - seite) / 2.0, 0.0, "keine-erkennung"
        else:
            cx, kopf_oben, kopf_h = aus_gesicht(*treffer)
            seite = kopf_h / HEAD_SHARE
            links = cx - seite / 2.0
            oben = kopf_oben - TOP_MARGIN * seite
            art = "gesicht-ohne-alpha"

    seite = max(16.0, float(seite))
    return dict(breite=w, hoehe=h, x=float(links), y=float(oben),
                seite=seite, art=art, alpha=hat_alpha)


# ---------- Zuschneiden ----------

def schneiden(rgba, links, oben, seite, groesse):
    """Quadrat aus dem Bild schneiden, fehlende Ränder bleiben durchsichtig.

    Wortgleich zu zuschnitt.schneiden() des Skills. Vor dem Verkleinern
    wird mit Alpha multipliziert, sonst blutet Schwarz aus den
    durchsichtigen Pixeln in die Kanten.
    """
    h, w = rgba.shape[:2]
    s = int(round(seite))
    flaeche = np.zeros((s, s, 4), np.float32)
    li, ti = int(round(links)), int(round(oben))
    x0, y0 = max(0, li), max(0, ti)
    x1, y1 = min(w, li + s), min(h, ti + s)
    if x1 > x0 and y1 > y0:
        flaeche[y0 - ti:y1 - ti, x0 - li:x1 - li] = rgba[y0:y1, x0:x1]

    a = flaeche[..., 3:4] / 255.0
    vor = np.concatenate([flaeche[..., :3] * a, flaeche[..., 3:4]], axis=2)
    im = Image.fromarray(np.clip(vor, 0, 255).astype(np.uint8), "RGBA")
    im = im.resize((groesse, groesse), Image.LANCZOS)
    arr = np.asarray(im).astype(np.float32)
    a2 = arr[..., 3:4] / 255.0
    rgb = np.clip(arr[..., :3] / np.maximum(a2, 1e-3), 0, 255)
    return Image.fromarray(np.concatenate([rgb, arr[..., 3:4]], axis=2).astype(np.uint8), "RGBA")


def rand(pfad, winkel=0.0):
    """Hülle des sichtbaren Inhalts, der randlose Zuschnitt eines
    Ganzkörperbildes. Ohne Alphakanal gibt es nichts zu finden, dann ist
    die Hülle das ganze Bild."""
    im = Image.open(pfad)
    hat_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    im = im.convert("RGBA")
    if winkel:
        arr = drehen(np.asarray(im).astype(np.float32), winkel)
        im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    w, h = im.size
    kasten = None
    if hat_alpha:
        maske = im.getchannel("A").point(lambda v: 255 if v > ALPHA_MIN else 0)
        kasten = maske.getbbox()
        if kasten is not None and (kasten[2] - kasten[0] < 2 or kasten[3] - kasten[1] < 2):
            kasten = None                # praktisch leer, lieber das ganze Bild
    if kasten is None:
        kasten = (0, 0, w, h)
        hat_alpha = False
    links, oben, rechts, unten = kasten
    return dict(breite=w, hoehe=h, x=float(links), y=float(oben),
                b=float(rechts - links), h=float(unten - oben),
                art="rand" if hat_alpha else "ganzes-bild", alpha=hat_alpha)


def frei(pfad, ziel, x, y, b, h, winkel=0.0):
    """Freies Rechteck ausschneiden und als Ganzkörperbild ablegen.

    Sehr große Vorlagen werden auf das Maß des Bestandes gebracht,
    kleinere bleiben wie sie sind. Hochrechnen brächte nur Unschärfe und
    Dateigröße."""
    im = Image.open(pfad)
    hat_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    rgba = drehen(np.asarray(im.convert("RGBA")).astype(np.float32), winkel)
    bh, bw = rgba.shape[:2]

    sb, sh = max(1, int(round(b))), max(1, int(round(h)))
    flaeche = np.zeros((sh, sb, 4), np.float32)
    li, ti = int(round(x)), int(round(y))
    x0, y0 = max(0, li), max(0, ti)
    x1, y1 = min(bw, li + sb), min(bh, ti + sh)
    if x1 > x0 and y1 > y0:
        flaeche[y0 - ti:y1 - ti, x0 - li:x1 - li] = rgba[y0:y1, x0:x1]

    ziel_b, ziel_h = sb, sh
    massstab = min(1.0, GK_MAX_HOEHE / sh, GK_MAX_BREITE / sb)
    if massstab < 1.0:
        ziel_b = max(1, int(round(sb * massstab)))
        ziel_h = max(1, int(round(sh * massstab)))

    # Vor dem Verkleinern mit Alpha multiplizieren, sonst blutet Schwarz
    # aus den durchsichtigen Pixeln in die Kanten.
    a = flaeche[..., 3:4] / 255.0
    vor = np.concatenate([flaeche[..., :3] * a, flaeche[..., 3:4]], axis=2)
    bild = Image.fromarray(np.clip(vor, 0, 255).astype(np.uint8), "RGBA")
    if (ziel_b, ziel_h) != (sb, sh):
        bild = bild.resize((ziel_b, ziel_h), Image.LANCZOS)
    arr = np.asarray(bild).astype(np.float32)
    a2 = arr[..., 3:4] / 255.0
    rgb = np.clip(arr[..., :3] / np.maximum(a2, 1e-3), 0, 255)
    aus = Image.fromarray(np.concatenate([rgb, arr[..., 3:4]], axis=2).astype(np.uint8), "RGBA")

    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    aus.save(ziel, "WEBP", quality=GK_QUALITY, method=6, alpha_quality=100)
    return dict(ok=True, breite=ziel_b, hoehe=ziel_h, alpha=hat_alpha,
                verkleinert=massstab < 1.0)


def merken(name, breite, hoehe, x, y, seite):
    """Den Zuschnitt in manuell.json des Skills eintragen.

    Dort steht je Vorlage [Kopfmitte in Bildbreite, Scheitel in Bildhöhe,
    Kinn in Bildhöhe]. Aus dem Ausschnitt zurückgerechnet: Die Kopfmitte
    ist die Mitte des Quadrats, der Scheitel sitzt TOP_MARGIN tiefer als
    die Oberkante, der Kopf ist HEAD_SHARE der Seitenlänge hoch. Der Skill
    trifft denselben Zuschnitt beim nächsten Lauf damit auf Anhieb.
    """
    datei = os.path.join(SKILL, "manuell.json")
    if not os.path.isfile(datei):
        return None
    with open(datei, encoding="utf-8-sig") as fh:
        daten = json.load(fh)
    kopf_oben = y + TOP_MARGIN * seite
    werte = [round((x + seite / 2.0) / breite, 3),
             round(kopf_oben / hoehe, 3),
             round((kopf_oben + HEAD_SHARE * seite) / hoehe, 3)]
    daten.setdefault("kopf", {})[name] = werte
    with open(datei, "w", encoding="utf-8") as fh:
        json.dump(daten, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    return werte


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("befehl", choices=["pruefen", "analyse", "schneiden", "rand", "frei"])
    p.add_argument("--bild")
    p.add_argument("--ziel")
    p.add_argument("--x", type=float)
    p.add_argument("--y", type=float)
    p.add_argument("--seite", type=float)
    p.add_argument("--breite", type=float)
    p.add_argument("--hoehe", type=float)
    p.add_argument("--winkel", type=float, default=0.0,
                   help="Vorlage vor dem Schneiden um diesen Winkel drehen")
    p.add_argument("--merken", help="Vorlagenname für manuell.json des Skills")
    args = p.parse_args()

    if args.befehl == "pruefen":
        z = skill()
        print(json.dumps({
            "ok": True,
            "python": sys.version.split()[0],
            "skill": z is not None,
            "manuell": os.path.isfile(os.path.join(SKILL, "manuell.json")),
        }))
        return

    if args.befehl == "analyse":
        print(json.dumps(analyse(args.bild, args.winkel)))
        return

    if args.befehl == "rand":
        print(json.dumps(rand(args.bild, args.winkel)))
        return

    if args.befehl == "frei":
        print(json.dumps(frei(args.bild, args.ziel, args.x, args.y,
                              args.breite, args.hoehe, args.winkel)))
        return

    flach, rgba, hat_alpha = laden(args.bild, args.winkel)
    h, w = rgba.shape[:2]
    # Kleine Ausschnitte nicht über 480 hochrechnen, große nicht darunter
    # zusammenstauchen. Genau die Regel des Skills.
    groesse = max(MIN_SIZE, min(SIZE, int(round(args.seite))))
    bild = schneiden(rgba, args.x, args.y, args.seite, groesse)
    os.makedirs(os.path.dirname(args.ziel), exist_ok=True)
    bild.save(args.ziel, "WEBP", quality=88, method=6)

    # Aus einer gedrehten Fläche gibt es nichts zu merken: Der Skill dreht
    # beim nächsten Lauf nicht mit und träfe damit daneben.
    gemerkt = None
    if args.merken and not args.winkel:
        gemerkt = merken(args.merken, w, h, args.x, args.y, args.seite)

    print(json.dumps({"ok": True, "groesse": groesse, "alpha": hat_alpha,
                      "gemerkt": gemerkt}))


if __name__ == "__main__":
    try:
        main()
    except Exception as fehler:                      # noqa: BLE001
        print(json.dumps({"fehler": f"{type(fehler).__name__}: {fehler}"}))
        sys.exit(1)
