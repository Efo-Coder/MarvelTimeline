"""Holt alles, was die Gesichtsveredelung braucht, und richtet es ein.

    python tools/gesicht/einrichten.py

Zwei Modelle stehen danach bereit: GFPGAN v1.4 und CodeFormer. Beide
bauen ein Gesicht aus einem gelernten Modell neu auf, statt es nur zu
vergrößern. Deshalb wirken sie dort natürlich, wo Real-ESRGAN wächsern
wird.

Was hier landet, ist Fremdcode und Fremdgewicht, zusammen rund 800 MB.
Beides steht in .gitignore und gehört nicht ins Repo, deshalb ist dieses
Skript die Bezugsquelle: Wer tools/gesicht/fremd und tools/gesicht/modelle
löscht und es erneut laufen lässt, hat den Stand wieder.

Der Umweg über einen basicsr-Ersatz
-----------------------------------
Die Architekturdateien beider Modelle stammen aus dem basicsr-Umfeld und
führen dessen Importe. basicsr selbst lässt sich hier nicht bauen, es
hängt an einer torchvision-Funktion, die es seit Version 0.17 nicht mehr
gibt. Statt die Fremddateien zu ändern, entsteht deshalb ein winziges
Paket namens basicsr mit genau den drei Dingen, die sie daraus holen:
eine Registrierung, die nichts tut, einen Logger und eine
Initialisierung. Die Dateien selbst bleiben unangetastet, ein späteres
Nachladen überschreibt also nichts von Hand Geändertem.
"""

import hashlib
import os
import sys
import urllib.request

HIER = os.path.dirname(os.path.abspath(__file__))
FREMD = os.path.join(HIER, "fremd")
MODELLE = os.path.join(HIER, "modelle")

# Fremdcode: Zieldatei -> Quelle. Die Architekturdateien sind reines
# PyTorch, sie werden unverändert übernommen.
CODE = {
    "basicsr/archs/vqgan_arch.py":
        "https://raw.githubusercontent.com/sczhou/CodeFormer/master/basicsr/archs/vqgan_arch.py",
    "basicsr/archs/codeformer_arch.py":
        "https://raw.githubusercontent.com/sczhou/CodeFormer/master/basicsr/archs/codeformer_arch.py",
    "gfpgan_archs/gfpganv1_clean_arch.py":
        "https://raw.githubusercontent.com/TencentARC/GFPGAN/master/gfpgan/archs/gfpganv1_clean_arch.py",
    "gfpgan_archs/stylegan2_clean_arch.py":
        "https://raw.githubusercontent.com/TencentARC/GFPGAN/master/gfpgan/archs/stylegan2_clean_arch.py",
}

GEWICHTE = {
    "GFPGANv1.4.pth":
        "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth",
    "codeformer.pth":
        "https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/codeformer.pth",
}

# Der basicsr-Ersatz. Mehr holen die Architekturdateien nicht daraus.
SHIM = {
    "basicsr/__init__.py": '"""Ersatz, erzeugt von tools/gesicht/einrichten.py."""\n',
    "basicsr/archs/__init__.py": "",
    "basicsr/utils/__init__.py": '''"""Ersatz, erzeugt von tools/gesicht/einrichten.py."""

import logging


def get_root_logger(*_args, **_kwargs):
    return logging.getLogger("gesicht")
''',
    "basicsr/utils/registry.py": '''"""Ersatz, erzeugt von tools/gesicht/einrichten.py.

Die Registrierung sammelt bei basicsr Architekturen unter einem Namen,
damit eine Konfigurationsdatei sie auswählen kann. Hier werden die
Klassen direkt importiert, also braucht es nur einen Dekorator, der das
Original zurückgibt.
"""


class _Registry:
    def __init__(self):
        self._eintraege = {}

    def register(self, obj=None):
        def nimm(klasse):
            self._eintraege[klasse.__name__] = klasse
            return klasse
        return nimm if obj is None else nimm(obj)

    def get(self, name):
        return self._eintraege[name]


ARCH_REGISTRY = _Registry()
''',
    "basicsr/archs/arch_util.py": '''"""Ersatz, erzeugt von tools/gesicht/einrichten.py.

Wortgleich zu default_init_weights aus BasicSR. Die Funktion setzt die
Startwerte der Gewichte, bevor die trainierten geladen werden. Sie wird
also nie sichtbar, muss aber da sein.
"""

from torch import nn
from torch.nn import init
from torch.nn.modules.batchnorm import _BatchNorm


def default_init_weights(module_list, scale=1, bias_fill=0, **kwargs):
    if not isinstance(module_list, list):
        module_list = [module_list]
    for module in module_list:
        for m in module.modules():
            if isinstance(m, (nn.Conv2d, nn.Linear)):
                init.kaiming_normal_(m.weight, **kwargs)
                m.weight.data *= scale
                if m.bias is not None:
                    m.bias.data.fill_(bias_fill)
            elif isinstance(m, _BatchNorm):
                init.constant_(m.weight, 1)
                if m.bias is not None:
                    m.bias.data.fill_(bias_fill)
''',
    "gfpgan_archs/__init__.py": "",
}


def schreibe(rel, inhalt):
    ziel = os.path.join(FREMD, rel)
    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    with open(ziel, "w", encoding="utf-8") as fh:
        fh.write(inhalt)


def hole(url, ziel, name):
    if os.path.isfile(ziel) and os.path.getsize(ziel) > 0:
        print(f"  {name}: liegt schon da ({os.path.getsize(ziel) / 1e6:.1f} MB)")
        return
    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    print(f"  {name}: wird geladen …", end="", flush=True)
    vorlaeufig = ziel + ".teil"
    try:
        with urllib.request.urlopen(url, timeout=120) as antwort, \
                open(vorlaeufig, "wb") as fh:
            while True:
                stueck = antwort.read(1 << 20)
                if not stueck:
                    break
                fh.write(stueck)
        os.replace(vorlaeufig, ziel)
    except BaseException:
        if os.path.isfile(vorlaeufig):
            os.remove(vorlaeufig)
        raise
    print(f" {os.path.getsize(ziel) / 1e6:.1f} MB")


def pruefe():
    """Lädt beide Architekturen einmal, damit ein Fehler jetzt auffällt
    und nicht erst beim ersten Bild."""
    sys.path.insert(0, FREMD)
    from basicsr.archs.codeformer_arch import CodeFormer          # noqa: F401
    from gfpgan_archs.gfpganv1_clean_arch import GFPGANv1Clean    # noqa: F401
    print("  Beide Architekturen lassen sich laden.")


def main():
    print("Fremdcode:")
    for rel, url in CODE.items():
        hole(url, os.path.join(FREMD, rel), rel)

    print("basicsr-Ersatz:")
    for rel, inhalt in SHIM.items():
        schreibe(rel, inhalt)
    print(f"  {len(SHIM)} Dateien geschrieben")

    print("Modellgewichte:")
    for name, url in GEWICHTE.items():
        hole(url, os.path.join(MODELLE, name), name)

    print("Probe:")
    pruefe()
    print("\nFertig. Die Gesichtsveredelung steht bereit.")


if __name__ == "__main__":
    main()
