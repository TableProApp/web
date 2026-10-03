"""Builds diagram-icloud-sync-{light,dark}-{en,vi}.svg.

Text is outlined from the site's own Inter (fontsource-variable 5.3.0, opsz 14),
shaped with hb-shape so kerning matches the browser, because an SVG shown
through <img> cannot use the page's web fonts.
"""

from __future__ import annotations

import json
import math
import subprocess
import sys
import unicodedata
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "out"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1216, 684
FS = 44  # every label: 44 units = 12.4 px at 343 px wide
UPEM = 2048
K = FS / UPEM
CAP = 1490 * K  # cap height in units
DESC = 0.21 * FS  # deepest descender (g, p, y)

PALETTE = {
    # design-system §2.2: --foreground and --muted-foreground
    "light": {"fg": "#0a0a0a", "muted": "#636363"},
    "dark": {"fg": "#f5f5f5", "muted": "#a4a4a4"},
}

TEXT = {
    "en": {
        "solid": "Connections, groups and tags",
        "dashed": "Passwords, only with password sync on",
        "mac": ["Mac"],
        "icloud": ["Your iCloud", "account"],
        "devices": ["iPhone", "and iPad"],
        "keychain": "iCloud Keychain",
        "title": "iCloud Sync between Mac, iPhone and iPad",
        "desc": (
            "A diagram. Mac, your iCloud account and iPhone and iPad sit in a row. A solid two-way path "
            "runs from the Mac through your iCloud account to iPhone and iPad, labelled Connections, groups "
            "and tags. A second, dashed two-way path runs from the Mac through iCloud Keychain to iPhone and "
            "iPad, labelled Passwords, only with password sync on."
        ),
    },
    "vi": {
        "solid": "Connection, nhóm và tag",
        "dashed": "Mật khẩu, chỉ khi bật đồng bộ mật khẩu",
        "mac": ["Mac"],
        "icloud": ["Tài khoản iCloud", "của bạn"],
        "devices": ["iPhone", "và iPad"],
        "keychain": "iCloud Keychain",
        "title": "iCloud Sync giữa Mac, iPhone và iPad",
        "desc": (
            "Sơ đồ. Mac, tài khoản iCloud của bạn và iPhone, iPad nằm trên một hàng. Một đường liền hai chiều "
            "đi từ Mac qua tài khoản iCloud của bạn tới iPhone và iPad, ghi Connection, nhóm và tag. Một đường "
            "nét đứt hai chiều thứ hai đi từ Mac qua iCloud Keychain tới iPhone và iPad, ghi Mật khẩu, chỉ khi "
            "bật đồng bộ mật khẩu."
        ),
    },
}

# ---------------------------------------------------------------- text outlining

VI_RANGES = [(0x0102, 0x0103), (0x0110, 0x0111), (0x0128, 0x0129), (0x0168, 0x0169), (0x01A0, 0x01A1),
             (0x01AF, 0x01B0), (0x0300, 0x0301), (0x0303, 0x0304), (0x0308, 0x0309), (0x0323, 0x0323),
             (0x1EA0, 0x1EF9)]


def subset_for(ch: str) -> str:
    """The fontsource subset whose unicode-range serves this character on the site."""
    cp = ord(ch)
    if any(a <= cp <= b for a, b in VI_RANGES):
        return "vietnamese"
    if cp <= 0xFF:
        return "latin"
    return "latin-ext"


FONTS: dict[tuple[str, int], TTFont] = {}


def font(sub: str, weight: int) -> TTFont:
    key = (sub, weight)
    if key not in FONTS:
        FONTS[key] = TTFont(HERE / "fonts" / f"inter-{sub}-{weight}.ttf")
    return FONTS[key]


GLYPHS: dict[str, str] = {}  # id -> path d (font units, y down)
GLYPH_IDS: dict[tuple[str, int, str], str] = {}


def glyph_id(sub: str, weight: int, name: str) -> str | None:
    key = (sub, weight, name)
    if key in GLYPH_IDS:
        return GLYPH_IDS[key]
    f = font(sub, weight)
    gs = f.getGlyphSet()
    pen = SVGPathPen(gs, ntos=lambda v: str(round(v)) if abs(v - round(v)) < 0.05 else f"{v:.1f}")
    gs[name].draw(TransformPen(pen, (1, 0, 0, -1, 0, 0)))
    d = pen.getCommands()
    if not d:
        GLYPH_IDS[key] = None
        return None
    gid = f"g{len(GLYPHS)}"
    GLYPHS[gid] = d
    GLYPH_IDS[key] = gid
    return gid


def runs(text: str):
    out: list[tuple[str, str]] = []
    for ch in text:
        sub = subset_for(ch)
        if out and out[-1][0] == sub:
            out[-1] = (sub, out[-1][1] + ch)
        else:
            out.append((sub, ch))
    return out


def shape(text: str, weight: int):
    """[(sub, glyph name, x offset in font units)], total advance in font units."""
    assert unicodedata.is_normalized("NFC", text)
    pen_x = 0
    placed = []
    for sub, chunk in runs(text):
        res = subprocess.run(
            ["hb-shape", "--output-format=json", str(HERE / "fonts" / f"inter-{sub}-{weight}.ttf"), chunk],
            check=True, capture_output=True, text=True,
        ).stdout
        for g in json.loads(res):
            placed.append((sub, g["g"], pen_x + g["dx"], g["dy"]))
            pen_x += g["ax"]
    return placed, pen_x


def text_el(text: str, x: float, baseline: float, weight: int, fill: str, anchor: str = "middle"):
    """An outlined label. Returns (svg, bbox x0, x1)."""
    placed, adv = shape(text, weight)
    width = adv * K
    x0 = x - width / 2 if anchor == "middle" else x
    uses = []
    for sub, name, dx, dy in placed:
        gid = glyph_id(sub, weight, name)
        if gid is None:
            continue
        attrs = f'href="#{gid}"'
        if dx:
            attrs += f' x="{dx}"'
        if dy:
            attrs += f' y="{-dy}"'
        uses.append(f"<use {attrs}/>")
    svg = (f'<g transform="translate({x0:.1f} {baseline:.1f}) scale({K:.6f})" fill="{fill}">'
           + "".join(uses) + "</g>")
    return svg, x0, x0 + width


# ---------------------------------------------------------------- geometry

def f1(v: float) -> str:
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


def arrow(tip_x: float, tip_y: float, direction: str, fill: str, length: float = 26, half: float = 13) -> str:
    """A filled arrowhead whose tip is at (tip_x, tip_y)."""
    dx, dy = {"left": (1, 0), "right": (-1, 0), "up": (0, 1), "down": (0, -1)}[direction]
    bx, by = tip_x + dx * length, tip_y + dy * length
    px, py = -dy * half, dx * half
    pts = [(tip_x, tip_y), (bx + px, by + py), (bx - px, by - py)]
    return f'<path d="M{f1(pts[0][0])} {f1(pts[0][1])}L{f1(pts[1][0])} {f1(pts[1][1])}L{f1(pts[2][0])} {f1(pts[2][1])}Z" fill="{fill}"/>'


def circle_intersections(c1, r1, c2, r2):
    (x1, y1), (x2, y2) = c1, c2
    d = math.hypot(x2 - x1, y2 - y1)
    a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
    h = math.sqrt(r1 * r1 - a * a)
    xm, ym = x1 + a * (x2 - x1) / d, y1 + a * (y2 - y1) / d
    return [(xm + h * (y2 - y1) / d, ym - h * (x2 - x1) / d), (xm - h * (y2 - y1) / d, ym + h * (x2 - x1) / d)]


def cloud(cx: float, cy: float):
    """A cloud outline from three circles and a flat base. Returns (path d, left x, right x, top, bottom)."""
    L, rL = (-52.0, 12.0), 36.0
    T, rT = (4.0, -16.0), 52.0
    R, rR = (56.0, 14.0), 34.0
    base = 48.0  # bottom of the outline, relative
    # the left and right circles touch the base line at their lowest point
    L = (L[0], base - rL)
    R = (R[0], base - rR)
    lt = min(circle_intersections(L, rL, T, rT), key=lambda p: p[1])  # upper intersection
    tr = min(circle_intersections(T, rT, R, rR), key=lambda p: p[1])
    xs = [L[0] - rL, R[0] + rR]
    ys = [T[1] - rT, base]
    ox, oy = cx - (xs[0] + xs[1]) / 2, cy - (ys[0] + ys[1]) / 2

    def p(pt):
        return f"{f1(pt[0] + ox)} {f1(pt[1] + oy)}"

    d = (f"M{p((L[0], base))}"
         f"A{f1(rL)} {f1(rL)} 0 0 1 {p(lt)}"
         f"A{f1(rT)} {f1(rT)} 0 0 1 {p(tr)}"
         f"A{f1(rR)} {f1(rR)} 0 0 1 {p((R[0], base))}Z")
    return d, xs[0] + ox, xs[1] + ox, ys[0] + oy, ys[1] + oy, L, rL, ox, oy


def build(locale: str, theme: str) -> str:
    t = TEXT[locale]
    c = PALETTE[theme]
    fg, muted = c["fg"], c["muted"]
    SW = 6  # stroke width: 1.7 px at 343 px wide

    cols = {"mac": 232, "icloud": 608, "devices": 984}
    line_h = 54

    # Vertical rhythm, top to bottom, then centred on the canvas.
    solid_base = 0.0
    yc = solid_base + 104  # icon centre line
    icon_half = 64
    l1 = yc + icon_half + 30 + CAP  # first node-label baseline
    l2 = l1 + line_h
    yb = l2 + DESC + 34 + 38  # dashed bus (centre of the pill)
    dashed_base = yb + 38 + 30 + CAP
    top, bottom = solid_base - CAP, dashed_base + DESC
    shift = (H - (bottom - top)) / 2 - top
    solid_base += shift; yc += shift; l1 += shift; l2 += shift; yb += shift; dashed_base += shift

    parts: list[str] = []
    bboxes: dict[str, tuple[float, float, float, float]] = {}

    # ---- nodes
    mx = cols["mac"]
    scr_w, scr_h = 150, 98
    scr_top = yc - icon_half + 4
    parts.append(f'<rect x="{f1(mx - scr_w / 2)}" y="{f1(scr_top)}" width="{scr_w}" height="{scr_h}" rx="10" '
                 f'fill="none" stroke="{fg}" stroke-width="{SW}"/>')
    base_y = scr_top + scr_h + 8
    parts.append(f'<rect x="{f1(mx - 96)}" y="{f1(base_y)}" width="192" height="12" rx="6" fill="{fg}"/>')
    mac_left, mac_right = mx - scr_w / 2 - SW / 2, mx + scr_w / 2 + SW / 2
    bboxes["mac-icon"] = (mx - 96, scr_top, mx + 96, base_y + 12)

    cd, c_left, c_right, c_top, c_bot, *_ = cloud(cols["icloud"], yc)
    parts.append(f'<path d="{cd}" fill="none" stroke="{fg}" stroke-width="{SW}" stroke-linejoin="round"/>')
    c_left -= SW / 2; c_right += SW / 2
    bboxes["cloud-icon"] = (c_left, c_top, c_right, c_bot)

    dx = cols["devices"]
    tab_w, tab_h, ph_w, ph_h, overlap = 104, 136, 60, 110, 22
    group_w = tab_w + ph_w - overlap
    tab_x = dx - group_w / 2
    ph_x = tab_x + tab_w - overlap
    dev_bottom = yc + tab_h / 2
    tab_y, ph_y = dev_bottom - tab_h, dev_bottom - ph_h
    gap = 11
    parts.append(
        '<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="1216" height="684">'
        '<rect width="1216" height="684" fill="#fff"/>'
        f'<rect x="{f1(ph_x - gap)}" y="{f1(ph_y - gap)}" width="{f1(ph_w + 2 * gap)}" height="{f1(ph_h + 2 * gap)}" '
        f'rx="{14 + gap}" fill="#000"/></mask>'
    )
    parts.append(f'<rect x="{f1(tab_x)}" y="{f1(tab_y)}" width="{tab_w}" height="{tab_h}" rx="14" fill="none" '
                 f'stroke="{fg}" stroke-width="{SW}" mask="url(#m)"/>')
    parts.append(f'<rect x="{f1(ph_x)}" y="{f1(ph_y)}" width="{ph_w}" height="{ph_h}" rx="14" fill="none" '
                 f'stroke="{fg}" stroke-width="{SW}"/>')
    dev_left, dev_right = tab_x - SW / 2, ph_x + ph_w + SW / 2
    bboxes["devices-icon"] = (dev_left, tab_y, dev_right, dev_bottom)

    # ---- solid path: Mac <-> iCloud <-> iPhone and iPad, at the icon centre line
    g = 16
    for a, b in ((mac_right + g, c_left - g), (c_right + g, dev_left - g)):
        parts.append(f'<path d="M{f1(a + 24)} {f1(yc)}H{f1(b - 24)}" stroke="{fg}" stroke-width="{SW}"/>')
        parts.append(arrow(a, yc, "left", fg))
        parts.append(arrow(b, yc, "right", fg))

    # ---- dashed path: Mac <-> iCloud Keychain <-> iPhone and iPad, around the row
    xl, xr = 64, W - 64
    r = 30
    kc_svg, kc_x0, kc_x1 = text_el(t["keychain"], cols["icloud"], yb + CAP / 2, 500, fg)
    pill_pad = 30
    pill_x0, pill_x1 = kc_x0 - pill_pad, kc_x1 + pill_pad
    pill_h = 76
    a_left = mac_left - g
    a_right = dev_right + g
    dash = 'stroke-dasharray="15 11"'
    parts.append(
        f'<path d="M{f1(a_left - 24)} {f1(yc)}H{f1(xl + r)}A{r} {r} 0 0 0 {f1(xl)} {f1(yc + r)}'
        f'V{f1(yb - r)}A{r} {r} 0 0 0 {f1(xl + r)} {f1(yb)}H{f1(pill_x0)}" '
        f'fill="none" stroke="{muted}" stroke-width="{SW}" {dash}/>'
    )
    parts.append(
        f'<path d="M{f1(a_right + 24)} {f1(yc)}H{f1(xr - r)}A{r} {r} 0 0 1 {f1(xr)} {f1(yc + r)}'
        f'V{f1(yb - r)}A{r} {r} 0 0 1 {f1(xr - r)} {f1(yb)}H{f1(pill_x1)}" '
        f'fill="none" stroke="{muted}" stroke-width="{SW}" {dash}/>'
    )
    parts.append(arrow(a_left, yc, "right", muted))
    parts.append(arrow(a_right, yc, "left", muted))
    parts.append(f'<rect x="{f1(pill_x0)}" y="{f1(yb - pill_h / 2)}" width="{f1(pill_x1 - pill_x0)}" '
                 f'height="{pill_h}" rx="{pill_h // 2}" fill="none" stroke="{muted}" stroke-width="{SW}"/>')
    parts.append(kc_svg)
    bboxes["keychain-pill"] = (pill_x0, yb - pill_h / 2, pill_x1, yb + pill_h / 2)

    # ---- labels
    s_svg, s0, s1 = text_el(t["solid"], cols["icloud"], solid_base, 500, fg)
    parts.append(s_svg)
    bboxes["solid-label"] = (s0, solid_base - CAP, s1, solid_base + DESC)
    d_svg, d0, d1 = text_el(t["dashed"], cols["icloud"], dashed_base, 500, fg)
    parts.append(d_svg)
    bboxes["dashed-label"] = (d0, dashed_base - CAP, d1, dashed_base + DESC)

    for node in ("mac", "icloud", "devices"):
        for i, line in enumerate(t[node]):
            base = l1 + i * line_h
            n_svg, n0, n1 = text_el(line, cols[node], base, 600, fg)
            parts.append(n_svg)
            bboxes[f"{node}-label-{i}"] = (n0, base - CAP - 0.16 * FS, n1, base + DESC)

    bboxes["dashed-left"] = (xl - SW / 2, yc, xl + SW / 2, yb)
    bboxes["dashed-right"] = (xr - SW / 2, yc, xr + SW / 2, yb)
    bboxes["solid-line-y"] = (0, yc - SW / 2, 0, yc + SW / 2)

    defs = "".join(f'<path id="{gid}" d="{d}"/>' for gid, d in GLYPHS.items())
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
        f'role="img" aria-labelledby="t d" lang="{locale}">'
        f'<title id="t">{t["title"]}</title><desc id="d">{t["desc"]}</desc>'
        f"<defs>{defs}</defs>"
        + "".join(parts)
        + "</svg>\n"
    )
    GLYPHS.clear()
    GLYPH_IDS.clear()
    return svg, bboxes


if __name__ == "__main__":
    report = {}
    for locale in ("en", "vi"):
        for theme in ("light", "dark"):
            svg, boxes = build(locale, theme)
            name = f"diagram-icloud-sync-{theme}-{locale}.svg"
            (OUT / name).write_text(svg, encoding="utf-8")
            report[name] = {"bytes": len(svg.encode()), "boxes": {k: [round(v, 1) for v in b] for k, b in boxes.items()}}
    print(json.dumps(report, indent=1, ensure_ascii=False))
