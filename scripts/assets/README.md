# Generated image assets

These are the sources of the two drawn assets in `resources/data/assets.json`. Neither is served. Each produces files
the manifest already points at, so regenerating them needs no manifest change unless the words change (then update
the entry's `alt`).

## `diagram-icloud-sync/build.py`

Writes `diagram-icloud-sync-{light,dark}-{en,vi}.svg` into the directory given as its first argument
(`public/images/features`). The labels are outlined from the site's own Inter. An SVG shown through `<img>` cannot
use the page's web fonts, so the text would otherwise fall back to a system font.

Needs Python with `fontTools`, `hb-shape` (HarfBuzz) and a `fonts/` folder next to the script holding
`inter-{latin,latin-ext,vietnamese}-{500,600}.ttf`. Instance them from the installed variable font:

```bash
python3 -m fontTools.varLib.instancer \
  node_modules/@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2 wght=600 opsz=14 \
  -o scripts/assets/diagram-icloud-sync/fonts/inter-latin-600.ttf   # repeat per subset and weight
python3 scripts/assets/diagram-icloud-sync/build.py public/images/features
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
