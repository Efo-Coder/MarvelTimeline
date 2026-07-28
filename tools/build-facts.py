"""Aus den Wiki-Rohdaten den Steckbrief-Block in js/facts.js schreiben.

   tools/fetch-facts.py holt die Infoboxen beider Marvel-Wikis als
   Rohtext. Dieses Skript macht daraus die kurzen deutschen Angaben, die
   im Fenster neben der Figur stehen:

     - Wiki-Syntax aufloesen: [[Ziel|Text]], Fussnoten, <small>-Zusaetze,
       Aufzaehlungen.
     - Die Vorlagen {{Affiliation|A2}} und {{Citizenship|WKD}} sind blosse
       Kuerzel. Ihre Zuordnung steht in den Modulen des Wikis und wird
       von dort geholt, statt hier zweihundert Kuerzel zu pflegen.
     - Status kommt nicht aus der Infobox, sondern aus der Kategorie
       "Deceased Characters".
     - Fuss und Zoll werden zu Metern.
     - Haeufige Begriffe werden uebersetzt (GERMAN), der Rest bleibt
       stehen: Bei Marvel sind die meisten Zugehoerigkeiten Eigennamen.

   Geschrieben wird nur der Bereich zwischen den beiden Marken in
   js/facts.js. Alles andere in der Datei, vor allem die von Hand
   gepflegten CHAR_BONDS, bleibt unangetastet.

   Aufruf:  python tools/build-facts.py <roh.json> <namen.json> js/facts.js
"""

import json
import re
import sys
import urllib.parse
import urllib.request

MCU = "https://marvelcinematicuniverse.fandom.com/api.php"
UA = {"User-Agent": "MarvelTimeline-Fanpage/1.0 (Steckbriefdaten)"}

START = "  /* @wiki:anfang */"
END = "  /* @wiki:ende */"

# Was aus dem Englischen uebersetzt wird. Alles, was hier nicht steht,
# bleibt so stehen, wie das Wiki es fuehrt.
GERMAN = {
    "Human": "Mensch", "Humans": "Menschen", "human": "Mensch",
    "Asgardian": "Asgardier", "Asgardians": "Asgardier",
    "Frost Giant": "Frostriese", "Frost Giants": "Frostriesen",
    "Dark Elf": "Dunkelelf", "Dark Elves": "Dunkelelfen",
    "Eternal": "Eternal", "Eternals": "Eternals",
    "Deviant": "Deviant", "Celestial": "Celestial",
    "Synthezoid": "Synthezoid", "Android": "Android",
    "Mutant": "Mutant", "Mutants": "Mutanten", "Mutate": "Mutant",
    "Inhuman": "Inhuman", "Vampire": "Vampir", "Demon": "Dämon",
    "Fire Demon": "Feuerdämon", "Dog": "Hund",
    "God": "Gott", "Goddess": "Göttin", "Titan": "Titan",
    "Cyborg": "Cyborg", "Robot": "Roboter", "Alien": "Außerirdischer",
    "Unidentified Alien": "Außerirdischer",
    "Olympian": "Olympier", "Cosmic Entity": "Kosmische Entität",
    "Flora colossus": "Flora Colossus",
    "Symbiote": "Symbiont", "Werewolf": "Werwolf",
    "Artificial Intelligence": "Künstliche Intelligenz",
    "Earth": "Erde", "Germany": "Deutschland", "Russia": "Russland",
    "Soviet Union": "Sowjetunion", "England": "England",
    "United States of America": "USA", "United States": "USA",
    "American": "USA", "British": "Großbritannien", "German": "Deutschland",
    "Russian": "Russland", "Sokovian": "Sokovia", "Wakandan": "Wakanda",
    "Asgardian citizen": "Asgard",
    "Afghan": "Afghanistan", "Latverian": "Latveria",
    "America": "USA", "Canadian": "Kanada", "Chinese": "China",
    "English": "England", "Italian": "Italien", "Soviet": "Sowjetunion",
    "Egypt": "Ägypten", "Romania": "Rumänien", "Sicily": "Sizilien",
    "Jotun": "Jötunheim", "Jotunheim": "Jötunheim", "Sakaaran": "Sakaar",
    "An unnamed planet": "unbekannte Welt",
    "United States Army": "US-Armee", "United States Air Force": "US Air Force",
    "United States Navy": "US Navy", "United States Government": "US-Regierung",
    "United States Armed Forces": "US-Streitkräfte",
    "Federal Government of the United States": "US-Regierung",
    "United States Department of State": "US-Außenministerium",
    "United States Department of Defense": "US-Verteidigungsministerium",
    "United States Special Operations Command": "US-Sonderkommando",
    "United States Marine Corps": "US Marine Corps",
    "United States Navy SEALs": "Navy SEALs",
    "United States Postal Service": "US-Post",
    "New York City Police Department": "Polizei New York",
    "Strategic Scientific Reserve": "SSR",
    "Kree Empire": "Kree-Imperium", "Kree Imperial": "Hala",
    "Skrull Council": "Skrull-Rat", "Gods of Asgard": "Götter Asgards",
    "The Warriors Three": "Krieger der Drei", "Warriors Three": "Krieger der Drei",
    "Jotuns": "Jötunheim", "Resistance": "Widerstand",
    # Schreibweisen, die im Wiki abweichen: Auf der Seite selbst heisst
    # es HYDRA, in der Vorlage steht Hydra, und dem Kuerzel fehlt der
    # letzte Punkt.
    "Hydra": "HYDRA",
    "S.H.I.E.L.D": "S.H.I.E.L.D.",
    "Mensch/Kree Hybrid": "Mensch-Kree-Hybrid",
}

# Reihenfolge der Zugehoerigkeiten: Was eine Figur ausmacht, steht vorn.
# Das Wiki listet streng alphabetisch und faengt bei Steve Rogers mit
# zwei Schulen an, bevor die Avengers kommen.
TEAM_RANK = [
    "Avengers", "New Avengers", "Guardians of the Galaxy", "X-Men",
    "Fantastic Four", "Eternals", "Thunderbolts", "Defenders",
    "S.H.I.E.L.D.", "HYDRA", "Hydra", "Ten Rings", "TVA",
    "Time Variance Authority", "Ravagers", "Nova Corps", "Kree",
    "Skrulls", "Wakanda", "Dora Milaje", "Asgard", "Asgardians",
    "Masters of the Mystic Arts", "Sorcerers", "Sanctum Sanctorum",
    "Black Order", "Red Room", "Stark Industries", "Pym Technologies",
    "Howling Commandos", "SSR", "Sinister Six", "Revengers",
]

MAX_TEAMS = 4

# Was keine Zugehoerigkeit im Sinne des Fensters ist: Schulen, in denen
# jemand mal saß, und Staaten, die schon unter Herkunft stehen.
TEAM_SKIP = re.compile(
    r"\b(School|University|College|Academy|Institute|Hospital|High)\b|"
    r"^(USA|Grossbritannien|Russland|Deutschland|Sowjetunion|Wakanda|Sokovia|"
    r"United Kingdom|Kanada|Frankreich|Norwegen|Erde)$")


def api(params):
    url = MCU + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.loads(res.read().decode("utf-8"))


def module_map(page):
    """Kuerzel -> Klartext aus einem Datenmodul des Wikis.

       Die Tabellen sind Lua: Kuerzel, die mit einer Ziffer anfangen,
       stehen als ["107IR"], alle uebrigen als blosser Bezeichner
       (AIM = "..."). Beide Schreibweisen zaehlen, sonst faende man von
       ueber tausend Organisationen die drei Dutzend Regimenter."""
    data = api({"action": "parse", "page": page, "prop": "wikitext",
                "format": "json"})
    text = data["parse"]["wikitext"]["*"]
    out = {}
    rows = re.findall(r'^\s*(?:\["([^"]+)"\]|([A-Za-z_][A-Za-z0-9_]*))'
                      r'\s*=\s*"(.*?)",?\s*$', text, re.M)
    for quoted, bare, value in rows:
        code = quoted or bare
        # Der Wert ist "[[File:Wappen.png|25px|link=]] [[Organisation]]".
        # Das Bild faellt weg, uebrig bleibt der letzte Link.
        links = re.findall(r"\[\[([^\]]+)\]\]", value)
        links = [l for l in links if not l.lower().startswith("file:")]
        if links:
            name = links[-1]
            out[code] = name.split("|")[-1].strip()
    return out


def deceased(titles):
    """Alle Seiten der Liste, die als verstorben gefuehrt werden.

       Gefragt wird gezielt nach der einen Kategorie: Ohne clcategories
       antwortet die API mit saemtlichen Kategorien aller Seiten, und das
       gemeinsame Limit reisst die Liste nach wenigen Figuren ab – der
       Rest sieht dann kategorielos und damit lebendig aus."""
    dead = set()
    for at in range(0, len(titles), 40):
        batch = titles[at:at + 40]
        data = api({"action": "query", "titles": "|".join(batch),
                    "prop": "categories",
                    "clcategories": "Category:Deceased Characters",
                    "cllimit": 500, "redirects": 1, "format": "json"})
        pages = data.get("query", {}).get("pages", {})
        # Weiterleitungen zurueckuebersetzen: Gefragt wurde nach "Tony
        # Stark", geantwortet hat die Seite "Iron Man".
        back = {}
        for row in data.get("query", {}).get("redirects", []):
            back[row["to"]] = row["from"]
        for page in pages.values():
            cats = [c["title"] for c in page.get("categories", [])]
            if any("Deceased Characters" in c for c in cats):
                name = page["title"]
                dead.add(name)
                if name in back:
                    dead.add(back[name])
    return dead


def clean(text):
    """Wikitext zu Klartext. Der Rest der Datei rechnet mit sauberen
       Zeilen, deshalb faellt hier alles weg, was Auszeichnung ist."""
    if not text:
        return ""
    text = re.sub(r"<ref[^>]*/>", "", text)
    text = re.sub(r"<ref.*?</ref>", "", text, flags=re.S)
    text = re.sub(r"\{\{r\|[^}]*\}\}", "", text)
    text = re.sub(r"\{\{Ref\|[^}]*\}\}", "", text)
    # Der Zusatz steht mal mit, mal ohne eigene Klammern in <small>.
    # Ohne den ersten Schritt entstuende daraus ((Cyborg)).
    text = re.sub(r"<small>\s*\((.*?)\)\s*</small>", r" (\1)", text, flags=re.S)
    text = re.sub(r"<small>(.*?)</small>", r" (\1)", text, flags=re.S)
    text = re.sub(r"<br\s*/?>", "\n", text)
    text = re.sub(r"</?[a-z]+[^>]*>", "", text)
    text = text.replace("'''", "").replace("''", "")
    text = re.sub(r"\[\[(?:File|Datei):[^\]]*\]\]", "", text, flags=re.I)
    text = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", text)
    text = re.sub(r"\[\[([^\]]+)\]\]", r"\1", text)
    text = re.sub(r"\[https?://\S+\s*([^\]]*)\]", r"\1", text)
    # Reste von Bildeinbindungen, die ohne Klammern im Text stehen.
    text = re.sub(r"\b\d+px\b", "", text)
    return text


def entries(text, codes):
    """Eine Infobox-Liste als Liste einzelner Namen. Die Vorlagen
       {{Affiliation|X}} und {{Citizenship|X}} werden dabei aufgeloest."""
    if not text:
        return []
    def swap(match):
        return codes.get(match.group(2).strip(), "")
    text = re.sub(r"\{\{(Affiliation|Citizenship|m|M)\|([^}|]+)(\|[^}]*)?\}\}",
                  swap, text, flags=re.I)
    text = re.sub(r"\{\{[^{}]*\}\}", "", text)
    out = []
    for line in clean(text).split("\n"):
        line = line.strip(" *:-\t")
        # Wer irgendwo eingeschleust war, gehoerte nicht dazu: Peggy
        # Carter stuende sonst mit HYDRA im Steckbrief, weil sie dort
        # verdeckt ermittelt hat.
        if re.search(r"\((?=[^()]*(undercover|infiltrat|impersonat))", line, re.I):
            continue
        # Die uebrigen Klammerzusaetze sagen im Fenster nichts: Dass die
        # Avengers sich zwischendurch aufgeloest haben, steht in der
        # Biografie.
        line = re.sub(r"\([^()]*\)", "", line)
        line = re.sub(r"\s+", " ", line).strip(" ,;.")
        # Was uebrig bleibt, muss ein Name sein. Die Zwischenzeile
        # "Formerly:" gehoert nicht dazu, ebenso wenig Beschreibungen wie
        # "ally of the Avengers", die im Wiki klein anfangen.
        if not line or len(line) > 46 or line.lower() in ("formerly", "currently"):
            continue
        if not line[0].isupper() and not line[0].isdigit():
            continue
        line = GERMAN.get(line, line)
        if line not in out:
            out.append(line)
    return out


def teams(values):
    """Die wichtigsten Zugehoerigkeiten zuerst, dann der Rest."""
    def rank(name):
        for at, known in enumerate(TEAM_RANK):
            if name == known or name.startswith(known):
                return at
        return len(TEAM_RANK)
    keep = [v for v in values if not TEAM_SKIP.search(v)]
    return sorted(keep, key=rank)[:MAX_TEAMS]


def height(text):
    """6'2" wird zu 1,88 m. Angaben mit mehreren Werten ("6'2"; 5'4"
       (Originally)") behalten den ersten, das ist der aktuelle."""
    if not text:
        return ""
    match = re.search(r"(\d+)'\s*(\d+)?", clean(text))
    if not match:
        return ""
    feet = int(match.group(1))
    inch = int(match.group(2) or 0)
    metres = (feet * 12 + inch) * 0.0254
    return ("%.2f" % metres).replace(".", ",") + " m"


def species(mcu_text, db_origin):
    """Was die Figur ist. Das MCU-Wiki fuehrt den Filmkanon und geht vor,
       die Marvel Database ist der Rueckfall."""
    for source in (mcu_text, db_origin):
        line = clean(source).split("\n")[0].strip()
        line = re.sub(r"\{\{[^{}]*\}\}", "", line)
        # Redaktionsnotizen im Quelltext sind keine Angabe: Bei Taserface
        # stand so ein Kommentar als ganze Zeile in der Infobox.
        line = re.sub(r"<!--.*?-->", "", line, flags=re.S)
        line = re.sub(r"\s+", " ", line).strip(" ,;.")
        if not line:
            continue
        # "Human enhanced by Super-Soldier Serum" behaelt seinen Zusatz,
        # "Human (Cyborg)" auch – beides sagt etwas ueber die Figur.
        for src, dst in GERMAN.items():
            line = re.sub(r"\b" + re.escape(src) + r"\b", dst, line)
        line = line.replace("enhanced by", "verstärkt durch")
        line = line.replace("transformed by", "verwandelt durch")
        line = line.replace("mutated by the", "verändert durch das")
        line = line.replace("adopted by", "aufgezogen von")
        line = line.replace("Super-Soldier Serum", "Supersoldaten-Serum")
        line = line.replace("formerly", "früher")
        if len(line) <= 70:
            return line
    return ""


def origin(db_place, citizenship):
    """Herkunft: der Geburtsort, sonst die Staatsangehoerigkeit."""
    place = clean(db_place).split("\n")[0]
    place = re.sub(r"\{\{[^{}]*\}\}", "", place)
    place = re.sub(r"\([^()]*\)", "", place)
    place = re.sub(r"\s+", " ", place).strip(" ,;.")
    if place and len(place) <= 52:
        parts = [GERMAN.get(p.strip(), p.strip()) for p in place.split(",")]
        return ", ".join(parts)
    if citizenship:
        return citizenship[0]
    return ""


def js_string(text):
    return "'" + text.replace("\\", "\\\\").replace("'", "\\'") + "'"


def main():
    raw_path, names_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(raw_path, encoding="utf-8") as fh:
        raw = json.load(fh)
    with open(names_path, encoding="utf-8") as fh:
        order = [c["slug"] for c in json.load(fh)]

    print("Vorlagen laden ...", flush=True)
    codes = module_map("Module:Affiliation/data")
    codes.update(module_map("Module:Citizenship/data"))
    print("  %d Kuerzel" % len(codes), flush=True)

    titles = []
    for slug in order:
        row = raw.get(slug)
        if row:
            titles.append(row.get("mcu_page") or row["real"])
    print("Status abfragen ...", flush=True)
    dead = deceased(titles)
    print("  %d verstorben" % len(dead), flush=True)

    lines = []
    for slug in order:
        row = raw.get(slug)
        if not row:
            continue
        mcu, db = row["mcu"], row["db"]
        cite = entries(mcu.get("citizenship", ""), codes)
        fields = []
        value = origin(db.get("PlaceOfBirth", ""), cite)
        if value:
            fields.append(("origin", js_string(value)))
        value = species(mcu.get("species", ""), db.get("Origin", ""))
        if value:
            fields.append(("species", js_string(value)))
        value = height(db.get("Height", ""))
        if value:
            fields.append(("height", js_string(value)))
        value = teams(entries(mcu.get("affiliation", ""), codes)
                      or entries(db.get("Affiliation", ""), codes))
        if value:
            fields.append(("teams", "[" + ", ".join(js_string(v) for v in value) + "]"))
        page = row.get("mcu_page") or row["real"]
        fields.append(("status", js_string("Verstorben" if page in dead else "Am Leben")))

        lines.append("  " + js_string(slug) + ": {")
        for key, value in fields:
            lines.append("    %s: %s," % (key, value))
        lines.append("  },")

    with open(out_path, encoding="utf-8") as fh:
        text = fh.read()
    head, rest = text.split(START, 1)
    _, tail = rest.split(END, 1)
    new = head + START + "\n" + "\n".join(lines) + "\n" + END + tail
    with open(out_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(new)
    print("%d Figuren in %s" % (sum(1 for line in lines if line.endswith(": {")),
                                out_path))


if __name__ == "__main__":
    main()
