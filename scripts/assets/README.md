# Generated image assets

These are the sources of the two drawn assets in `resources/data/assets.json`. Neither is served. Each produces files
the manifest already points at, so regenerating them needs no manifest change unless the words change (then update
the entry's `alt`).

## `diagram-icloud-sync/build.py`

Writes `diagram-icloud-sync-{light,dark}-{locale}.svg` into the directory given as its first argument
(`public/images/features`). The labels are outlined from the site's own Inter, with regional Noto Sans CJK for Japanese, Korean and Chinese. An SVG shown through `<img>` cannot
use the page's web fonts, so the text would otherwise fall back to a system font.

Needs Python with `fontTools` and Brotli support, plus `hb-shape` (HarfBuzz). Native labels and social sentences
are in `localized-copy.json`. Prepare fonts in a temporary directory:

```bash
python3 scripts/assets/prepare_fonts.py /tmp/tablepro-asset-fonts
python3 scripts/assets/diagram-icloud-sync/build.py public/images/features \
  --translations scripts/assets/localized-copy.json --fonts /tmp/tablepro-asset-fonts
```

## `og-site/`

`og-site-{en,vi}.html` are the 1200 × 630 card templates, with the fonts embedded so the render cannot fall back.
`render.cjs` renders one with headless Chrome at scale 1 and reports which font drew each glyph. `finalize.py`
converts the result to an opaque sRGB PNG under the 300 KB cap.

```bash
node scripts/assets/og-site/render.cjs scripts/assets/og-site/og-site-en.html /tmp/raw-en.png
python3 scripts/assets/og-site/finalize.py /tmp/raw-en.png public/og/bespoke/og-site-en.png
```

`render.cjs` loads the Homebrew-global puppeteer (`/opt/homebrew/lib/node_modules`) and launches
chrome-headless-shell 149.0.7827.22, the build the committed cards used, from `~/.cache/puppeteer`. Set
`PUPPETEER_EXECUTABLE_PATH` to use another binary, and adjust the puppeteer path for another machine.

For the other supported languages, build temporary HTML from the same original composition, then render and
finalize each card using the commands above:

```bash
python3 scripts/assets/og-site/build.py scripts/assets/localized-copy.json /tmp/tablepro-og-localized \
  --fonts /tmp/tablepro-asset-fonts
node scripts/assets/og-site/render.cjs /tmp/tablepro-og-localized/og-site-ja.html /tmp/raw-ja.png
python3 scripts/assets/og-site/finalize.py /tmp/raw-ja.png public/og/bespoke/og-site-ja.png
```

`prepare_fonts.py` pins Noto Sans CJK to upstream commit `f8d157532fbfaeda587e826d4cd5b21a49186f7c`.
Its SIL Open Font License is retained in `LICENSE-NOTO-CJK`; the font files stay in the temporary build directory.
The Japanese, Korean, Simplified Chinese and Traditional Chinese cards embed regional subsets during rendering.
The served SVG files contain outlines and the social cards are opaque PNGs. Neither depends on the reader's fonts.
