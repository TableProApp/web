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

Always the bundled sample database — never a real connection. `File > Try Sample
Database` opens a Chinook SQLite. This is not a privacy nicety: it is what makes
a capture reproducible after a release, by anyone, without leaking internal
table names.

| Shot | Frame |
|---|---|
| `app-{light,dark}.png` (hero) | Sidebar open on the Chinook connection. A multi-line SELECT joining `Track`, `Album` and `Artist` in the editor, already run, with the result grid filled and the row count visible. |
| `features/sql-editor-{light,dark}.png` | Same query, but a multi-statement batch, with the result tabs visible below. |
| `features/data-grid-{light,dark}.png` | `Track` table with two or three cells edited so the pending-changes count shows in the toolbar. This is the point of the shot — the edits have *not* been committed. |
| `features/ai-assistant-{light,dark}.png` | The assistant panel showing a before/after diff of a rewritten query with the numbered explanation steps. |

Keep the same connection, same table and same query across releases. A shot that
changes content every release cannot be compared, and re-cropping becomes a
recurring cost.

## Deriving the web assets

`ThemedImage` serves one file per theme and picks the density itself. Generate
both rungs from the 2432px capture:

```bash
cd public/images
for f in app-light app-dark; do
  cwebp -q 92 -resize 2432 0 "${f}.png" -o "${f}-2432.webp"
  cwebp -q 92 -resize 1216 0 "${f}.png" -o "${f}-1216.webp"
done
```

`-q 92`, not `-lossless`. Lossless is roughly twice the bytes here, and the
hero has always shipped lossy WebP — this keeps the whole site on one setting.

Stop at 2x. Nobody ships 3x for desktop: it costs about 2.25x the bytes of 2x
for nothing visible on a Mac display, all of which are 2x.

Then wire it up, and **change both places in the same commit** or the preload
commits to a file the parser never reaches:

- the component's `webpSrcSet`
- `resources/views/app.blade.php`, which preloads the hero before Inertia boots

## Adding a new screenshot

1. Capture per the above.
2. Generate the 1216/2432 rungs.
3. Pass `webpSrcSet` — not just `src`. `ThemedImage` has always supported the
   ladder; the workbench section went four releases without using it and shipped
   4.46 MB of PNG.
4. Pass `sizes` **only** alongside a `webpSrcSet`. On its own it does nothing:
   `themed-image.tsx` applies it to a `<source>` that only exists when a srcSet
   was given, so a lone `sizes` is inert and reads as optimization that is not
   there.
