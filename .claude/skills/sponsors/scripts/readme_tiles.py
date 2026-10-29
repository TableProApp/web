#!/usr/bin/env python3
# Writes the README's sponsor logos, each on a white tile so a dark logo stays visible in GitHub's dark theme.
# Usage: readme_tiles.py [path to TablePro's .github/assets/sponsors]
import base64
import json
import re
import sys
from pathlib import Path

web = Path(__file__).resolve().parents[4]
out = Path(sys.argv[1]) if len(sys.argv) > 1 else web.parent / "TablePro" / ".github" / "assets" / "sponsors"
out.mkdir(parents=True, exist_ok=True)
for stale in out.glob("*.svg"):
    stale.unlink()

data = json.loads((web / "resources/data/sponsors.json").read_text())
HEIGHT = 28  # the logo's height inside the tile, as on tablepro.app
PAD_X, PAD_Y, RADIUS = 8, 8, 6


def tile(inner_w, inner_h, body):
    w, h = inner_w + 2 * PAD_X, inner_h + 2 * PAD_Y
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}">\n'
        f'<rect width="{w}" height="{h}" rx="{RADIUS}" fill="#ffffff"/>\n{body}\n</svg>\n'
    )


for sponsor in data["sponsors"]:
    logo = sponsor["logo"]
    if logo is None:
        continue
    width = round(HEIGHT * logo["width"] / logo["height"])
    source = web / "public" / logo["light"].lstrip("/")
    if source.suffix == ".svg":
        text = source.read_text()
        root = re.search(r"<svg\b[^>]*>", text).group(0)
        view_box = re.search(r'viewBox="([^"]+)"', root)
        view_box = view_box.group(1) if view_box else f"0 0 {logo['width']} {logo['height']}"
        inner = text[text.index(root) + len(root): text.rindex("</svg>")]
        assert not re.search(r"<script|<foreignObject|\bhref=\"(?!#)|xlink:href=\"(?!#)", inner), sponsor["id"]
        # Keep the root's own paint attributes: a path that relies on the root's fill must still get it.
        paint = " ".join(re.findall(r'\b(?:fill|stroke)="[^"]*"', root))
        body = f'<svg x="{PAD_X}" y="{PAD_Y}" width="{width}" height="{HEIGHT}" viewBox="{view_box}" {paint}>{inner}</svg>'
    else:
        mime = {".png": "image/png", ".webp": "image/webp"}[source.suffix]
        encoded = base64.b64encode(source.read_bytes()).decode()
        body = f'<image x="{PAD_X}" y="{PAD_Y}" width="{width}" height="{HEIGHT}" href="data:{mime};base64,{encoded}"/>'
    (out / f"{sponsor['id']}.svg").write_text(tile(width, HEIGHT, body))
    print(sponsor["id"], width + 2 * PAD_X, HEIGHT + 2 * PAD_Y)
