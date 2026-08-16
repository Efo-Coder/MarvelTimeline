"""Steckbriefdaten der Figuren aus den beiden Marvel-Wikis holen.

   Die Seite zeigt zu jeder Figur ein Fenster mit Herkunft, Spezies,
   Koerpergroesse, Zugehoerigkeit und Status (js/facts.js). Diese Angaben
   stehen nirgends im Projekt, sie kommen aus zwei Quellen:

     marvelcinematicuniverse.fandom.com  -> species, status, affiliation,
       citizenship. Fuehrt ausschliesslich den Film-Kanon, hat aber keine
       Koerpergroessen.
     marvel.fandom.com (Earth-199999)    -> Height, PlaceOfBirth. Die
       Marvel Database fuehrt die Filmfiguren unter eigener Nummer, dort
       stehen Groesse und Geburtsort.

   Das Skript sammelt nur den Rohtext beider Infoboxen und legt ihn als
   JSON ab. Uebersetzt und gekuerzt wird von Hand: Die Wikitexte stecken
   voller Vorlagen, Fussnoten und Klammerzusaetze, und js/facts.js soll
   kurze deutsche Angaben enthalten, keine Wiki-Syntax.

   Aufruf:  python tools/fetch-facts.py <namen.json> <ziel.json>
   <namen.json> ist die Liste aus buildCharIndex(): [{slug, real, ...}].
   Ein Lauf laesst sich abbrechen und wiederholen, bereits geholte Figuren
   bleiben in der Zieldatei stehen und werden uebersprungen.
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request

MCU = "https://marvelcinematicuniverse.fandom.com/api.php"
DB = "https://marvel.fandom.com/api.php"
UA = {"User-Agent": "MarvelTimeline-Fanpage/1.0 (Steckbriefdaten)"}

# Aus der MCU-Infobox, aus der Infobox der Marvel Database
MCU_FIELDS = ["species", "status", "affiliation", "citizenship", "gender", "DOB", "title"]
DB_FIELDS = ["Height", "Weight", "PlaceOfBirth", "Origin", "Citizenship", "Relatives",
             "Affiliation", "Identity", "Gender"]


def api(base, params):
    url = base + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.loads(res.read().decode("utf-8"))


def section0(base, page):
    """Wikitext der Infobox, oder None wenn es die Seite nicht gibt.

       redirects folgt den Weiterleitungen: Im MCU-Wiki liegt Bucky Barnes
       unter James Buchanan Barnes und Johann Schmidt unter Red Skull.
       Ohne das Flag antwortet die API dort mit der Weiterleitung selbst,
       die keine Infobox hat."""
    try:
        data = api(base, {"action": "parse", "page": page, "prop": "wikitext",
                          "section": 0, "redirects": 1, "format": "json"})
    except Exception:
        return None
    if "parse" not in data:
        return None
    return data["parse"]["wikitext"]["*"]


def search(base, term):
    """Erster Treffer der Wiki-Suche, oder None."""
    try:
        data = api(base, {"action": "query", "list": "search", "srsearch": term,
                          "srlimit": 1, "format": "json"})
    except Exception:
        return None
    hits = data.get("query", {}).get("search", [])
    return hits[0]["title"] if hits else None


def fields(text, names):
    """Rohwerte der genannten Infobox-Felder. Ein Feld reicht bis zur
       naechsten Zeile, die mit | beginnt, oder bis zum Ende der Vorlage."""
    if not text:
        return {}
    out = {}
    for name in names:
        match = re.search(r"^\|\s*" + name + r"\s*=(.*?)(?=^\||^\}\})",
                          text, re.M | re.S | re.I)
        if match:
            value = match.group(1).strip()
            if value:
                out[name] = value[:900]
    return out


def load(path):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {}


def main():
    names_path, out_path = sys.argv[1], sys.argv[2]
    with open(names_path, encoding="utf-8") as fh:
        chars = json.load(fh)
    done = load(out_path)

    for at, char in enumerate(chars, 1):
        slug = char["slug"]
        if slug in done:
            continue
        real = char["real"]
        row = {"real": real, "role": char.get("role", "")}

        # MCU-Wiki: erst der Name selbst, dann die Suche. Der Heldenname
        # ist der zweite Versuch, weil Figuren wie Vulture oder Ronan dort
        # unter ihm stehen und nicht unter dem buergerlichen Namen.
        text = section0(MCU, real)
        if text is None and char.get("role"):
            text = section0(MCU, char["role"])
        if text is None:
            found = search(MCU, real + " " + char.get("role", ""))
            if found:
                row["mcu_page"] = found
                text = section0(MCU, found)
        row["mcu"] = fields(text, MCU_FIELDS)

        # Marvel Database: die Filmfiguren stehen unter Earth-199999.
        found = search(DB, '"' + real + '" Earth-199999')
        if found and "Earth-199999" in found:
            row["db_page"] = found
            row["db"] = fields(section0(DB, found), DB_FIELDS)
        else:
            row["db"] = {}

        done[slug] = row
        with open(out_path, "w", encoding="utf-8") as fh:
            json.dump(done, fh, ensure_ascii=False, indent=1)
        print("%3d/%d %-42s mcu:%-2d db:%d" % (at, len(chars), slug,
                                               len(row["mcu"]), len(row["db"])),
              flush=True)
        time.sleep(0.35)


if __name__ == "__main__":
    main()
