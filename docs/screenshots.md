# Capturing product screenshots

Every screenshot on this site is a 2x asset for a slot exactly 1216 CSS px
wide. Capture at that geometry and the image maps 1:1 onto device pixels on a
retina Mac; capture at anything else and the browser resamples at a fractional
ratio, which is what softens the 1px grid rules and 11pt mono type that make a
database client look sharp.

The previous hero was a 3024px file shown at 1216 px — a 2.49x downscale at a
0.804 sampling ratio.

## Geometry

| | |
|---|---|
| TablePro window width | **1216 pt** |
| Display | any retina Mac (2x) |
| Resulting file | **2432 px** wide |
| Aspect | 16:9 for the hero, matched per slot elsewhere |

Set the window width precisely rather than by eye:

```bash
# Requires: brew install --cask hammerspoon, or use any window manager that
# takes explicit pixel sizes. Rectangle's "Almost Maximize" is not precise.
osascript -e 'tell application "System Events" to tell process "TablePro" \
  to set size of front window to {1216, 684}'
```

## Capture

```bash
# -w  window mode: no desktop, and the real macOS squircle corners arrive as
#     transparent alpha rather than as a rectangle you then have to round in CSS
#     (border-radius is a circular arc and cannot reproduce a continuous curve).
# -o  no drop shadow: the page draws its own layered shadow, and a baked one
#     fights it and cannot adapt to the theme.
screencapture -w -o ~/Desktop/tablepro-hero.png
```

Take a **light** and a **dark** capture of the same frame. Switch the OS
appearance, not just the app theme, so the window chrome matches.

**Keep the traffic lights, in colour.** Cropping them is what makes a native Mac
app read as a web app.

## What the window shows

Sample data only — never a real connection, host or customer. The bundled
Chinook sample opens from **Help > Open Sample Database** (or **Open Sample
Database** in the Welcome window). Some scenes need another sample instead, such
as the `shop` schema or a fictional host under `*.acme.internal`; each image's
brief names its dataset. This is not a privacy nicety: it is what makes a
capture reproducible after a release, by anyone, without leaking internal
table names.

Which scene each image shows, its crop, its export size and where the files go
are in [`docs/visual-assets.md`](visual-assets.md), one brief per image. Keep
the same connection, table and query across releases: a shot that changes
content every release cannot be compared, and re-cropping becomes a recurring
cost.

## Deriving the web assets and wiring them up

Every image slot is an entry in `resources/data/assets.json`, rendered by
`<AssetSlot>`. Nothing in a component names an image file, so a new capture
never needs a code change:

1. Capture per the above, light and dark from the same frame when the brief
   says both.
2. Export the delivered files from the 2x master at each width the brief's
   "Replace with" row lists, in AVIF and WebP, named
   `{dir}/{id}-{light|dark}-{width}.{format}` (with `-{locale}` after the
   theme for an image made per language). For example:

   ```bash
   magick mac-hero-window-light.png -resize 1216x -quality 60 public/images/home/mac-hero-window-light-1216.avif
   cwebp -q 92 -resize 1216 0 mac-hero-window-light.png -o public/images/home/mac-hero-window-light-1216.webp
   ```

3. In the manifest entry, set `"status": "supplied"` and fill `src` with the
   widths, formats and true pixel size of each variant. Check the proposed
   `alt` and `caption` against the real image.
4. Run `php artisan assets:handoff`, then
   `php artisan test --compact --filter=AssetManifestTest`, which checks that
   every file exists at its true size and within the kind's byte budget.

The slot keeps its geometry, so the page does not shift when the image
arrives, and a supplied `priority` image (the hero) gets its head preload from
the manifest. Stop at 2x for Mac captures: 3x costs about 2.25x the bytes of
2x for nothing visible on a Mac display.
