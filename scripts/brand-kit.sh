#!/usr/bin/env bash
#
# Rebuilds the PNG files in public/images/brand: the app icon from the app's
# icon set, the flat icon and the logo from their SVG files. Run it after the
# app icon changes. macOS only (sips); needs rsvg-convert (brew install librsvg).
#
#   scripts/brand-kit.sh ../TablePro
#
set -euo pipefail

app="${1:?usage: scripts/brand-kit.sh <path to a TablePro app checkout>}"
icon="$app/TablePro/Assets.xcassets/AppIcon.appiconset/icon_512x512@2x.png"
out="$(cd "$(dirname "$0")/.." && pwd)/public/images/brand"
srgb='/System/Library/ColorSync/Profiles/sRGB Profile.icc'

[ -f "$icon" ] || { echo "No app icon at $icon" >&2; exit 1; }
command -v rsvg-convert >/dev/null || { echo "rsvg-convert is missing: brew install librsvg" >&2; exit 1; }

# The icon set is 16-bit Display P3; the kit is 8-bit sRGB.
for size in 1024 512 256 128 64; do
    sips --matchTo "$srgb" -z "$size" "$size" -s format png "$icon" --out "$out/tablepro-icon-$size.png" >/dev/null
done

rsvg-convert -w 512 -h 512 "$out/tablepro-icon-flat.svg" -o "$out/tablepro-icon-flat-512.png"

for color in black white; do
    rsvg-convert -h 256 "$out/tablepro-logo-$color.svg" -o "$out/tablepro-logo-$color-256.png"
done
