"""Build localized card HTML from the original composition and native copy.

The optional Noto CJK fonts are subset and embedded in the temporary HTML,
so Chromium never substitutes a font for Japanese, Korean or Chinese glyphs.
The final delivered artifact is the opaque PNG produced by finalize.py.
"""

import argparse
import base64
import html
import io
import json
import re
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


def embedded_cjk(font_path: Path, sentence: str) -> str:
    font = TTFont(font_path)
    missing = set(map(ord, sentence)) - set(font.getBestCmap())
    if missing:
        raise ValueError(f"{font_path} has no glyphs for {missing}")
    options = subset.Options()
    options.flavor = "woff2"
    sub = subset.Subsetter(options=options)
    sub.populate(text=sentence)
    sub.subset(font)
    font.flavor = "woff2"
    buffer = io.BytesIO()
    font.save(buffer)
    data = base64.b64encode(buffer.getvalue()).decode()
    return (
        '@font-face { font-family: "Card CJK"; font-weight: 600; '
        f'src: url("data:font/woff2;base64,{data}"); }}\n'
        '.sentence { font-family: "Card CJK", "Inter Variable", sans-serif; '
        'letter-spacing: 0; line-height: 1.3; }'
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("translations", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--fonts", type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    source = (Path(__file__).parent / "og-site-en.html").read_text()
    for locale, copy in json.loads(args.translations.read_text()).items():
        sentence = copy["ogSentence"]
        result = source.replace('lang="en"', f'lang="{locale}"')
        result = result.replace("<title>og-site en</title>", f"<title>og-site {locale}</title>")
        result = re.sub(
            r'(<p class="sentence" data-audit="sentence">).*?(</p>)',
            lambda match: match[1] + html.escape(sentence) + match[2],
            result,
            flags=re.S,
        )
        result = result.replace("</style>", ".sentence { text-wrap: balance; }\n</style>")
        if locale in ("ja", "ko", "zh-Hans", "zh-Hant"):
            if args.fonts is None:
                raise ValueError("CJK cards require --fonts with regional Noto CJK fonts")
            css = embedded_cjk(args.fonts / f"noto-{locale}-600.otf", sentence)
            result = result.replace("</style>", css + "\n</style>")
        (args.output / f"og-site-{locale}.html").write_text(result)


if __name__ == "__main__":
    main()
