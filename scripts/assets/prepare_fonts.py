"""Prepare fonts for the reproducible diagram and social-card generators.

Inter comes from the installed fontsource package. Regional Noto Sans CJK
comes from the pinned upstream commit below and retains its OFL notice.
Only outlined SVG and rendered PNG artifacts are served by the website.
"""

import argparse
import urllib.request
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


NOTO_COMMIT = "f8d157532fbfaeda587e826d4cd5b21a49186f7c"
NOTO_BASE = f"https://raw.githubusercontent.com/notofonts/noto-cjk/{NOTO_COMMIT}/Sans/"
REGIONS = {
    "ja": ("Japanese", "jp"),
    "ko": ("Korean", "kr"),
    "zh-Hans": ("SimplifiedChinese", "sc"),
    "zh-Hant": ("TraditionalChinese", "tc"),
}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    root = Path(__file__).resolve().parents[2]
    for region in ("latin", "latin-ext", "vietnamese"):
        for weight in (500, 600):
            source = root / f"node_modules/@fontsource-variable/inter/files/inter-{region}-opsz-normal.woff2"
            font = TTFont(source)
            font.flavor = None
            instantiateVariableFont(font, {"wght": weight, "opsz": 14}, inplace=True)
            font.save(args.output / f"inter-{region}-{weight}.ttf")
    for locale, (directory, suffix) in REGIONS.items():
        for weight, name in ((500, "Medium"), (600, "Bold")):
            url = NOTO_BASE + f"OTF/{directory}/NotoSansCJK{suffix}-{name}.otf"
            urllib.request.urlretrieve(url, args.output / f"noto-{locale}-{weight}.otf")
    urllib.request.urlretrieve(NOTO_BASE + "LICENSE", args.output / "LICENSE-NOTO-CJK")


if __name__ == "__main__":
    main()
