# TablePro web design system (public site and account)

Decided 2026-10-02. This document is the visual contract for both web apps:

- **Public site:** `TableProApp/web`
- **Account and transactional screens:** `TableProApp/license`

It replaces the "Result Set" ledger system: numbered rules, gutter rails, `FullLine`, `GridCell` borders, mono uppercase eyebrows and split-colour headlines. The page frame (§4.7, decided 2026-10-06) later brought back rails and full-bleed rules in a different form. Values marked as tokens are locked. Templates are wireframe-level, and copy shown in them is placeholder wording. The content documents own the final copy.

**Inputs read:**

- The rebuild brief ("the spec"; not part of this repository), §0 first
- A rendered audit of the previous site (cited below as "the old site"), and the Inter and IBM Plex Mono font files for glyph metrics
- The sibling design documents `sitemap.md`, `architecture.md` and `positioning.md`
- `resources/css/app.css` and every component under `resources/js/components/**` in both repositories

**What this document owns, and what it defers.** Where two documents overlap, one owns the answer:

| Topic | Owner |
|---|---|
| Page sections, their order and ids (homepage included), slot IDs and where each is used, navigation items | `sitemap.md` (§A, §B, §D, §A.8) |
| Manifest files and fields, the shared-file list and its enforcement, the theme head partial's code, locale mechanics | `architecture.md` (§1.9, §3, §1.10, §2) |
| Account screens, their copy and the account and transactional shells | The license repository |
| Copy, labels and the banned-word list | `positioning.md` |
| Tokens, type, layout, component specs, slot geometry, the slot type vocabulary and its visible labels | **this document** |

The page sketches in §8 add layout to the sitemap's structure. Where a sketch and the sitemap disagree, the sitemap wins.

**Numbers:** every contrast ratio here was computed with the script in Appendix A. That script reproduces the old site's measured values before it measures anything new. Text widths (§4.4, §6.2) were measured with Inter's own advance widths (fontTools on the shipped `@fontsource-variable/inter` files).

---

## Decisions at a glance

| Area | Decision |
|---|---|
| Grounds | Achromatic neutrals. Light: white page, `#f7f7f7` bands. Dark: `#121212` page, lighter surfaces for elevation |
| Accent | One brand hue, 55. The fill `#f68001` is unchanged. Every derived brand token returns to hue 55; the old text accent had drifted to 45 in light and 58 in dark |
| Theme | Light by default. Light / Dark / System control in both apps. Shared `localStorage.theme`. Driven by the theme class, never by the OS media query, and painted with no flash |
| Type | Inter Variable for everything except code and identifiers, which use IBM Plex Mono 400. Running copy is 16px. Tables and cards use 14px. Nothing is smaller than 12px. Vietnamese headings get line-height 1.3. Labels are never uppercase or tracked |
| Width | Content column 1216px (Container 1280 minus 32px gutters), reading column 704px, narrow 576px. Gutters 16 / 24 / 32 |
| Rhythm | Section spacing 64 / 80 / 96px, replacing the old stacked spacers of up to 184px between sections. The frame's join sits in the middle of it (§4.3) |
| Shape | Buttons and inputs are 8px rounded rectangles (pills retired). Cards, code blocks and image slots use 12px. Shadows only on floating layers |
| Frame | The page is drawn as a grid (§4.7): 1px `--rule` rails on the wide Container's outer edge from 1280px, a full-bleed join between every two blocks of `<main>`, a neutral mark wherever a join meets a rail, and shared-border cells for sets of like items. Solid and static. No hatching, graph paper, numbered gutters or accent lines |
| Removed | Rule ordinals, the old gutter rails (the page frame replaces them, §4.7), `FullLine`, `Ledger`, `GridCell`, `SectionLabel` eyebrows, the spec strip, the giant footer wordmark, the row-selection bar on static content, the Product Hunt hotlink |
| Images | Every content image is an `AssetSlot`: IDs from sitemap §A.8, one manifest per app with architecture §1.9's schema, and geometry, types and labels from §6. A dashed neutral slot shows the type label, the asset ID and a short localized description. Mac windows are **16:9** (2432 × 1368 export), detail crops **4:3**, and every window gets a 4:5 phone crop |
| Shared code | Architecture §3's list is the only source of byte-identical files: tokens, fonts, the theme script and control, consent and Crisp always; the UI primitives wherever their imports resolve in both repos. Everything else is a separate file per repo, built to this spec. The license app has its own slim shells and language switcher, never the public header |
| Motion | Feedback only, 120–240ms. Nothing animates on scroll. Reduced motion collapses all of it |

---

## 1. Principles

1. **The product is the picture; the page stays quiet.** Real screenshots of the app carry the visual interest. HTML never imitates app chrome ("grammar, not costume"): no traffic lights, fake sidebars, fake result grids or dashboards. Until real images exist, placeholders say plainly that they are placeholders, and only outside production (§6.2).
2. **Use native conventions, not invention.** TablePro sells a native client, so the site uses controls a Mac or iPhone user already knows: a segmented control for the billing cycle, disclosure triangles for optional detail, real tables, and a sidebar in the account. Labels are the conventional ones: Features, Databases, Pricing, Download, Docs, Account.
3. **Tables for tabular facts, prose for explanation.** Engines, plans, comparisons, machines and seats are captioned `<table>`s built from data. Explanations get a reading measure and air. The old rule "grids are for data" survives; the decorative ledger framing around prose does not. The page frame (§4.7) draws the layout's own structure, the column and one line between blocks, on every page including prose pages; it never rules the paragraphs inside a block.
4. **One accent, used for action and location.** Orange hue 55 marks the primary action, the current location, keyboard focus and the logo. It never colours headings, dividers, section backgrounds, gradients or glows. Accent text goes through a darker token computed for contrast.
5. **Facts render from data, through one component each.** Requirements, availability, versions, prices, seats, engines and paid features render only through `AvailabilityLine`, `PlatformCard`, `PricingCard`, `PlanMatrix` and `EngineTable`, which read `resources/data/*.json`. No count is typed into prose; name things instead of counting them.
6. **Two languages and two themes, by construction.** Every colour pair is computed in both themes (§2.3). Vietnamese gets the line-height its stacked diacritics need (§3.3). No label relies on uppercase with letter-spacing. Layouts absorb longer Vietnamese strings without truncation.
7. **Calm by default.** One primary action per view region. Motion confirms what the user did and never performs on its own. There are no scroll reveals, marquees, carousels or animated gradients.
8. **Placeholders are honest.** A slot without art is visibly a slot: neutral, labelled, carrying its ID and a description. Supplying the final file changes no layout. The placeholder is for whoever supplies the image, so the live site renders nothing for such a slot (§6.2).

---

## 2. Colour

### 2.1 Approach

- **Neutrals carry no hue** (chroma 0). Screenshots of a Mac app read true on a neutral ground, while a warm-tinted page would colour-cast the captures. The orange accent then has no competition.
- **Brand hue 55, unchanged.** Only lightness and chroma vary between brand tokens, and every one sits inside sRGB (checked; Appendix A). The light text accent moves from `oklch(0.52 0.148 45)` (`#ab4501`) to `oklch(0.52 0.125 55)` (`#9e5209`), and the dark one from hue 58 to 55. That brings them back to the brand hue, as spec §0 asks.
- **Tokens are opaque.** The old `--rule` was an alpha value, so its contrast depended on whatever sat behind it. Opaque tokens have one defined ratio, and the contrast test can parse them.
- **Light is the default.** The `.dark` class (set before paint, §2.8) swaps every token.

### 2.2 Tokens

| Token | Role | Light | Dark |
|---|---|---|---|
| `--background` | Page ground | `oklch(1 0 0)` `#ffffff` | `oklch(0.18 0 0)` `#121212` |
| `--surface` | Sunken band (one per page at most), footer, table header, inline code, AssetSlot | `oklch(0.975 0 0)` `#f7f7f7` | `oklch(0.21 0 0)` `#181818` |
| `--surface-strong` | Segmented-control track, hover on `surface`, neutral Badge | `oklch(0.95 0 0)` `#eeeeee` | `oklch(0.25 0 0)` `#222222` |
| `--raised` | Cards, menus, popovers, dialogs, code blocks | `oklch(1 0 0)` `#ffffff` | `oklch(0.235 0 0)` `#1e1e1e` |
| `--segment-selected` | The checked segment of a segmented control (billing cycle, theme). A step above the track in both themes: `--raised` sits *below* the dark track (0.235 on 0.25) and read as pressed in | `= --raised` `#ffffff` | `oklch(0.34 0 0)` `#383838` (1.36:1 on the track) |
| `--control-disabled` | Disabled control fill (Stepper buttons): below an enabled `--raised` control in both themes | `= --surface-strong` `#eeeeee` | `= --background` `#121212` |
| `--rule` | Dividers, card and table borders (decorative) | `oklch(0.91 0 0)` `#e1e1e1` | `oklch(0.3 0 0)` `#2e2e2e` |
| `--rule-strong` | Form-control outlines; AssetSlot dashed outline (needs ≥ 3:1) | `oklch(0.62 0 0)` `#868686` | `oklch(0.55 0 0)` `#717171` |
| `--foreground` | Text (body and headings) | `oklch(0.145 0 0)` `#0a0a0a` | `oklch(0.97 0 0)` `#f5f5f5` |
| `--muted-foreground` | Secondary text: captions, meta, help, availability lines | `oklch(0.5 0 0)` `#636363` | `oklch(0.72 0 0)` `#a4a4a4` |
| `--accent` | Brand fill: primary button, skip link | `oklch(0.72 0.178 55)` `#f68001` | same |
| `--accent-hover` | Primary button, hover (lighter) | `oklch(0.75 0.172 55)` `#fe8b29` | same |
| `--accent-active` | Primary button, pressed (darker) | `oklch(0.68 0.167 55)` `#e47706` | same |
| `--accent-foreground` | Text and icons on accent fills | `oklch(0.16 0.039 55)` `#1a0800` | same |
| `--accent-text` | Accent used as text: standalone links, link hover, check glyph, accent Badge | `oklch(0.52 0.125 55)` `#9e5209` | `oklch(0.8 0.13 55)` `#fea668` |
| `--accent-subtle` | Tint behind the current or selected item; accent Badge ground | `oklch(0.965 0.02 55)` `#fff0e7` | `oklch(0.26 0.04 55)` `#331f10` |
| `--accent-indicator` | Non-text state marks: current-nav underline, selected tab, account rail bar, checked controls (`accent-color`) | `oklch(0.62 0.152 55)` `#c96805` | `oklch(0.72 0.178 55)` `#f68001` |
| `--focus` | Focus ring | `= --accent-text` `#9e5209` | `= --accent-text` `#fea668` |
| `--success` | Status dot or icon (the word stays `--foreground`, §2.6); success notice icon | `oklch(0.5 0.13 150)` `#137738` | `oklch(0.78 0.15 150)` `#67d283` |
| `--warning` | Status dot or icon ("Expired", lagging package manager); caution notice icon | `oklch(0.5 0.1 70)` `#875814` | `oklch(0.8 0.14 80)` `#edb345` |
| `--danger` | Field-error text (the one coloured status text), "Suspended" dot, danger notice icon | `oklch(0.52 0.2 27)` `#c2181d` | `oklch(0.72 0.16 25)` `#f97770` |
| `--danger-fill` | Destructive button fill (theme-invariant) | `oklch(0.52 0.2 27)` `#c2181d` | same |
| `--danger-fill-hover` | Destructive button, hover and pressed | `oklch(0.48 0.19 27)` `#b00c15` | same |
| `--danger-foreground` | Text on danger fills | `oklch(1 0 0)` `#ffffff` | same |

**Code tokens.** Each one aliases a token above, so no new colour is introduced.

- `--code-background: var(--raised)` and `--code-border: var(--rule)` for code blocks.
- `--inline-code-background: var(--surface)` for inline code, whose text is `--foreground`.
- Syntax colours come from Phiki's `github-light-default` and `github-dark-default`, which `BlogService.php:128-129` already uses. Their own `pre` background is overridden to `--code-background`.

**Overlays.**

- `--overlay: oklch(0 0 0 / 0.45)` is the dialog backdrop. It is the only alpha token, and it carries no text.
- `--shadow-overlay` for menus, popovers, dialogs and toasts:
  - light: `0 1px 2px oklch(0 0 0 / 0.06), 0 8px 24px oklch(0 0 0 / 0.10)`
  - dark: `0 1px 2px oklch(0 0 0 / 0.5), 0 8px 24px oklch(0 0 0 / 0.5)`, plus a 1px `--rule` border, because a shadow on a dark ground does not separate layers on its own.

**`theme-color` meta:** `#ffffff` in light and `#121212` in dark. The head script sets it in both apps, which replaces the platform's fixed `#FFAA46`.

### 2.3 Contrast, computed

**Method.** These are WCAG 2.x ratios on the 8-bit sRGB hex each token rounds to, because that is what a browser paints. Appendix A has the script. Before measuring anything new, it was checked against known values:

| Check | Expected | Script |
|---|---|---|
| `#777` on `#fff` | 4.48:1 | **4.48:1** |
| `--muted-foreground` 0.52 on white (old site) | 5.49 | 5.49 |
| `--primary` as text on white (old site) | 2.62 | 2.62 |
| `--primary-strong` on white (old site) | 5.86 | 5.86 |
| `--primary-foreground` on `--primary` (banner, old site) | 7.42 | 7.42 |
| Old "Save 33%" badge, light / dark (old site) | 3.03 / 1.69 | 3.02 / 1.69 (composited) |

**Thresholds:**

- Text: 4.5:1 for every size, so large text always has headroom.
- Non-text UI and focus indicators: 3:1 (WCAG 1.4.11).
- Dividers are decorative and have no requirement.

| Foreground on background | Used for | Light | Dark | Needs |
|---|---|---|---|---|
| `foreground` on `background` | Body copy and headings | 19.80 | 17.18 | 4.5 |
| `foreground` on `surface` | Copy on a band; table header cells | 18.48 | 16.29 | 4.5 |
| `foreground` on `raised` | Cards, menus, dialogs, code | 19.80 | 15.29 | 4.5 |
| `foreground` on `segment-selected` | Selected segment label | 19.80 | 10.76 | 4.5 |
| `foreground` on `accent-subtle` | Current item in the account rail | 17.79 | 14.33 | 4.5 |
| `muted-foreground` on `background` | Secondary copy, captions, availability line, cycle caption | 6.01 | 7.52 | 4.5 |
| `muted-foreground` on `surface` | Captions on a band; AssetSlot description | 5.61 | 7.12 | 4.5 |
| `muted-foreground` on `surface-strong` | Unselected segment; neutral Badge; disabled label | 5.18 | 6.38 | 4.5 |
| `muted-foreground` on `raised` | Help text in cards and dialogs | 6.01 | 6.69 | 4.5 |
| `muted-foreground` on `accent-subtle` | Meta text in a selected row | 5.40 | 6.27 | 4.5 |
| `accent-text` on `background` | Standalone links, link hover, check glyph | 5.73 | 9.70 | 4.5 |
| `accent-text` on `surface` | Same, on a band | 5.35 | 9.19 | 4.5 |
| `accent-text` on `raised` | Same, in cards and menus | 5.73 | 8.63 | 4.5 |
| `accent-text` on `accent-subtle` | Accent Badge (replaces "Save 33%") | 5.15 | 8.09 | 4.5 |
| `accent-foreground` on `accent` | Primary button label, skip link | 7.42 | 7.42 | 4.5 |
| `accent-foreground` on `accent-hover` | Primary button, hover | 8.29 | 8.29 | 4.5 |
| `accent-foreground` on `accent-active` | Primary button, pressed | 6.43 | 6.43 | 4.5 |
| `danger-foreground` on `danger-fill` | Danger button | 6.10 | 6.10 | 4.5 |
| `danger-foreground` on `danger-fill-hover` | Danger button, hover | 7.22 | 7.22 | 4.5 |
| `success` on `background` / `surface` / `raised` | "Active" dot, success icons (held to the text threshold anyway) | 5.64 / 5.26 / 5.64 | 9.92 / 9.40 / 8.83 | 4.5 |
| `warning` on `background` / `surface` / `raised` | "Expired" dot, caution icons | 6.11 / 5.70 / 6.11 | 9.93 / 9.41 / 8.84 | 4.5 |
| `danger` on `background` / `surface` / `raised` | Field-error text, "Suspended" dot | 6.10 / 5.69 / 6.10 | 7.05 / 6.68 / 6.27 | 4.5 |
| `focus` on `background` / `surface` / `surface-strong` / `raised` | Focus ring | 5.73 / 5.35 / 4.94 / 5.73 | 9.70 / 9.19 / 8.23 / 8.63 | 3.0 |
| `rule-strong` on `background` / `surface` / `surface-strong` / `raised` | Input and checkbox outline, AssetSlot outline | 3.64 / 3.40 / 3.14 / 3.64 | 3.84 / 3.64 / 3.26 / 3.42 | 3.0 |
| `accent-indicator` on `background` / `surface` / `surface-strong` / `raised` / `accent-subtle` | Nav underline, tab, rail bar, checked control | 3.84 / 3.59 / 3.31 / 3.84 / 3.45 | 7.14 / 6.77 / 6.07 / 6.36 / 5.96 | 3.0 |
| `accent` on `background` | Brand fill edge | 2.62 | 7.14 | none, see below |
| `rule` on `background` | Dividers | 1.31 | 1.38 | none |
| Phiki light tokens on `raised` (lowest: comment `#6e7781`) | Code blocks | **4.55** | — | 4.5 |
| Phiki dark tokens on `raised` (lowest: comment `#8b949e`) | Code blocks | — | **5.42** | 4.5 |

**Lowest text pairs:** 5.15:1 in light (`accent-text` on `accent-subtle`) and 6.01:1 for `muted-foreground` on the page. In dark the lowest is 6.27:1.

**Rules this table imposes:**

- **`--accent` is never text** (2.62:1 on white), **and never the only state indicator in light.** It can still fill a primary button, because the label identifies the button and the label clears 7.42:1. Wherever a coloured mark alone signals state, use `--accent-indicator` (3.31–3.84:1 in light).
- **Code blocks sit on `--raised`, not `--surface`.** On `#f7f7f7` the GitHub light comment colour drops to **4.24:1**, a fail; on `--raised` (white) it is 4.55:1. Two other theme colours, `#eaeef2` and `#f6f8fa` (scopes `markup.ignored` and `carriage-return`), always come with their own background, so they never sit on the code background.
- **The current-item bar on the account rail** sits beside an `accent-subtle` row. The bar measures 3.45:1 in light and the row text 17.79:1.

### 2.4 The "Save 33%" failure and its fix

- **Defect.** The badge was 11px/600 `text-primary-strong` on a `primary/10` tint, inside the *selected* cycle button. That button's fill is `--foreground`, which inverts in dark mode. Measured 3.03:1 in light and 1.69:1 in dark on the old site (`pricing.tsx:328,443-445`).
- **Cause.** The badge had no background of its own, and the selected state inverted the fill underneath it.
- **Fix:**
  1. **The selected segment no longer inverts.** The `BillingCycleControl` track is `--surface-strong`. The selected segment is `--raised` with a 1px `--rule` border, and its label is `--foreground` (19.80 / 15.29). Unselected labels are `--muted-foreground` on the track (5.18 / 6.38).
  2. **The saving leaves the button.** It becomes one caption line under the control, in `--muted-foreground` on the section ground (6.01 / 7.52; 5.61 / 7.12 on a band), at 14px, never 11px. The caption announces politely when the cycle changes.
  3. **The number is computed.** The caption uses `floor((12 × monthly − yearly) / (12 × monthly) × 100)` from `pricing.json`. Today that is 33 for Starter (1 − 24 / 35.88 = 33.1%) and 33 for Team (1 − 10 / 15 = 33.3%). It is arithmetic on published prices, not an invented saving, and it updates itself if a price changes.
  4. **Any Badge carries its own ground.** An accent Badge is `--accent-text` on `--accent-subtle` (5.15 / 8.09), so no parent state can change its contrast.

### 2.5 Gamut correction found while computing

`--primary-foreground: oklch(0.16 0.04 55)` is slightly **outside** sRGB: the linear blue channel is −0.00003, and the maximum chroma at L 0.16 / H 55 is 0.0396. The comment in `app.css` says it was checked and is in gamut; it is not. The new `--accent-foreground` uses C 0.039. It renders the same `#1a0800` and the ratio stays 7.42:1. Every other token in §2.2 was checked inside the gamut.

### 2.6 Usage rules

**Text colour:**

- Body text is `--foreground`. That includes article bodies, FAQ answers and legal text. `.blog-article` currently renders its body in `--muted-foreground`, and that ends.
- `--muted-foreground` is for secondary text only: meta, captions, help, availability lines.
- `--accent-text` is for standalone links and accent glyphs, never paragraphs.

**Links:**

- An inline link in prose is underlined, in `--foreground`, with the underline in `--muted-foreground`.
- On hover the link and its underline turn `--accent-text`.
- Links are never distinguished by colour alone (WCAG 1.4.1).

**Status:**

- Status is always a word plus a dot or icon, never colour alone.
- Status *words* use `--foreground`, and the dot or icon carries the status colour.
- Coloured status text appears only in field errors and notices.

**Primary actions:**

- One primary (accent) button per view region.
- Allowed exceptions:
  - Download: the arch pair, where one is primary and one secondary.
  - Pricing: no button is primary (§5.3.18).

**Never:**

- gradients
- glows or coloured shadows
- tinted section backgrounds other than `--surface`
- an accent-coloured heading
- an opacity modifier on a text token (the old `/50`–`/70` failures)
- filters on vendor marks or screenshots

**Dark mode** is not inverted light. Elevation reads as lighter surfaces (`background` < `surface` < `raised` < `surface-strong`), and screenshots are shown unaltered (§7.3).

### 2.7 Token migration

| Old (`app.css`, both repos) | New | Note |
|---|---|---|
| `--primary` | `--accent` | Same value. `--accent` was declared and used nowhere: `grep` finds 0 `*-accent*` utilities in either repo |
| `--primary-foreground` | `--accent-foreground` | C 0.04 → 0.039 (§2.5) |
| `--primary-strong` | `--accent-text` | Hue 45 → 55 (light) and 58 → 55 (dark) |
| — | `--accent-hover`, `--accent-active`, `--accent-subtle`, `--accent-indicator`, `--focus` | Replace `hover:opacity-90` (an opacity drop that lowered label contrast) and `bg-primary/5` / `/10` tints |
| `--muted-foreground`, `--muted-foreground-subtle` | `--muted-foreground` (L 0.50 light) | Two near-identical greys become one, with more headroom (6.01 against 5.49) |
| `--surface-raised` | `--surface` | Name freed for the clearer `--raised` |
| `--card`, `--popover` | `--raised` | |
| `--secondary`, `--muted` (bg), `--input`, `--ring`, `--border` | `--surface-strong`, `--rule-strong`, `--focus`, `--rule` | `* { border-color: var(--rule) }` in the base layer |
| `--rule`, `--rule-strong` (alpha) | `--rule`, `--rule-strong` (opaque) | `rule-strong` is now the ≥ 3:1 control border |
| `--destructive`, `--destructive-foreground` (license) | `--danger`, `--danger-fill`, `--danger-foreground` | |
| `--success`, `--warning` (license) | `--success`, `--warning` | Values recomputed. Dark chroma lowered from neon |
| `--radius` 0.625rem | `--radius-control` 8px, `--radius-panel` 12px, `--radius-chip` 6px | §4.5 |

**`ColorContrastTest.php`** (public) is rewritten against the new names, and a copy is added to the license repo. Keep:

- the parse-from-`app.css` approach
- the 21:1 sanity check and the recorded-value check
- a **`#777` on `#fff` = 4.48** assertion

Every row of the §2.3 table becomes an assertion. Add a gamut assertion: no token may produce a linear channel outside [0, 1].

### 2.8 Theme mechanics (identical in both apps)

**Storage.** `localStorage.theme` holds `'light'`, `'dark'` or `'system'`. If the key is absent, unreadable, or holds any other value, the page is light. The key is shared, because both apps live on `tablepro.app`.

**Head script.** It runs before CSS paints and replaces the inline theme script in each app's `app.blade.php`. This script is the whole content of the shared partial `resources/views/partials/head-theme.blade.php` (architecture §1.10 copies it verbatim; a byte-identical file under architecture §3). It knows nothing about assets: a supplied LCP image is preloaded by a separate block in `app.blade.php` (architecture §1.9), so the partial stays identical in the license repo.

```html
<meta name="theme-color" content="#ffffff">
<script>
(function () {
  var choice = 'light';
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'system' || t === 'light') { choice = t; }
  } catch (e) {}
  var dark = choice === 'dark' || (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var root = document.documentElement;
  if (dark) { root.classList.add('dark'); }
  root.dataset.themeChoice = choice;          /* drives the control's icon without hydration */
  root.style.colorScheme = dark ? 'dark' : 'light';
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) { m.setAttribute('content', dark ? '#121212' : '#ffffff'); }
})();
</script>
```

`#ffffff` and `#121212` are the two `--background` values in §2.2.

**Rules:**

- SSR markup never depends on the theme.
- `ThemeControl` renders all three icons, and CSS shows the one matching `[data-theme-choice]`.
- `localStorage` is wrapped in `try`; the old script read it unguarded.
- **On change** (the shared `theme.ts`): write the key, toggle `.dark`, update `data-theme-choice`, `color-scheme` and `theme-color`. Add a `theme-switching` class for one frame, with `* { transition: none !important }`, so 200ms colour transitions do not ripple across the page.
- **Follow-ups:**
  - While `system` is chosen, listen to `matchMedia` changes.
  - Listen to the `storage` event to sync open tabs, including a public tab and an account tab.
- **Images switch by class, not media query** (§7.3). `ThemedImage`'s `media="(prefers-color-scheme: dark)"` sources are removed.
- **Rollout:** ship both apps' scripts together. An old platform script reads `'system'` as light, which is the new default anyway, so a skew is harmless but visible.

---

## 3. Typography

### 3.1 Families and loading

| Family | Use | Weights loaded |
|---|---|---|
| **Inter Variable** (`@fontsource-variable/inter/opsz.css`) | All UI, headings and prose, in both languages | 400, 500, 600 from the variable axis. **700 is not used** |
| **IBM Plex Mono** (`@fontsource/ibm-plex-mono/400.css`) | Code, commands, license keys, asset IDs, version strings in tables, `Kbd` | **400 only.** The 600 face existed for the uppercase eyebrows, which are retired. Dropping it saves about 16 KB latin and 7 KB Vietnamese |

**Loading:**

- **Vietnamese subset order.** Fontsource declares `vietnamese` before `latin-ext`, so the 22 shared letters resolve to `latin-ext`, which costs **258,404 B** of fonts per Vietnamese page against **110,740 B** once fixed (measured on the old site). Replace the `@import`s with hand-ordered `@font-face` blocks (latin-ext, then vietnamese, then latin), or re-declare the Vietnamese faces after the imports. They live in the shared `resources/css/fonts.css` (architecture §1.11 and §3). Verify the emitted order after `vite build`.
- **Preloads:**
  - Inter latin on every page.
  - Inter vietnamese as well on `/vi` pages (15 KB).
  - No mono preload: nothing above the fold is mono now.
  - The platform app gets the same preloads; today it has none.
- **`font-display: swap`.** If a swap shift is measured, add a metric-matched fallback face. Do not guess override values.
- **Vietnamese content is NFC-normalized**, with a test: `resources/data/{content,legal}/vi/**`, `resources/js/i18n/messages/vi/**`, `lang/vi/**` and the `vi` values in `resources/data/assets.json` (the paths of architecture §1.11; there is no `resources/data/vi/`).

### 3.2 Locked type scale

Sizes are px at the 375 / 768 / 1280 checkpoints. The size steps up at `md` (768) and `xl` (1280). Tracking follows Inter's dynamic-metrics curve, which `app.css` already uses (`−0.0223 + 0.185·e^(−0.1745·px)`), rounded per role.

| Role | Size 375 / 768 / 1280 | Line-height EN | Line-height VI | Weight | Tracking | Where |
|---|---|---|---|---|---|---|
| `display` | 36 / 48 / 56 | 1.1 | **1.3** | 600 | −0.022em | Homepage H1 only |
| `h1` | 30 / 36 / 40 | 1.15 | **1.3** | 600 | −0.022em | Every other public page's H1 |
| `h2` | 24 / 28 / 30 | 1.2 | **1.3** | 600 | −0.02em | Section headings; account screen H1 (styled as h2, §5.4) |
| `h3` | 18 / 20 / 20 | 1.35 | **1.4** | 600 | −0.015em | Sub-sections, card titles, FAQ questions |
| `body-lg` | 18 / 20 / 20 | 1.55 | 1.6 | 400 | −0.014em | Page and section leads (max 56ch), `muted-foreground` |
| `body` | 16 | 1.6 | 1.6 | 400 | −0.011em | All running copy, articles, legal, FAQ answers |
| `small` | 14 | 1.55 | 1.6 | 400 | −0.006em | Table cells, card meta, availability lines, footer links, help text |
| `caption` | 13 | 1.45 | 1.5 | 400 (500 in Badge) | −0.003em | Figure captions, dates, Badge, footnotes |
| `label` | 14 (16 in `lg` buttons; mobile-nav links use 18/500) | 1.3 | 1.3 | 500 | −0.006em | Buttons, nav, tabs, form labels, table headers (600) |
| `mono` | 14 block / 0.875em inline / 12 for IDs and `Kbd` | 1.6 (block), 1.5 (12px) | same | 400 | 0 | Code, commands, keys, asset IDs |

**Supporting numbers:**

- **Price numerals:** `h1` size, weight 600, line-height 1.1 (digits only, so Vietnamese diacritics are not involved), tabular figures.
- **Minimum text size is 12px**, and only for mono IDs and `Kbd`. The 11px `text-2xs` rung is retired.
- Tables, prices, versions, dates and seat counts use `font-variant-numeric: tabular-nums`.

### 3.3 Vietnamese rules (`:lang(vi)`)

Glyph metrics were read from the shipped font files with fontTools:

- **Inter:** tallest stacked capitals `Ễ` / `Ỗ` reach 1.087em; stacked lowercase `ễ` / `ỗ` reach 0.906em; the deepest descender is `g` at −0.216em.
- **Plex Mono:** stacked capitals reach 1.091em; the deepest descender is −0.194em.

| Case | Collision-free line-height (top + depth) | Decision |
|---|---|---|
| Lowercase stack under a descender on the previous line | 0.906 + 0.216 = **1.122** | Covered by every Vietnamese value above |
| Single-mark capital (`É` 0.942) under a descender | **1.158** | Covered |
| Stacked capital (`Ấ`, `Ễ`, `Ỗ`…) under a descender | 1.087 + 0.216 = **1.303** | Headings use **1.3**: an overlap of at most 0.003em (0.17px at 56px) |
| Plex Mono stacked capital under a descender | 1.091 + 0.194 = **1.285** | Code uses 1.6 |
| Any box with `overflow: hidden`, `truncate` or `line-clamp` (Inter capitals) | about **1.45** | **Never clip text that may be Vietnamese.** No `truncate` on labels, buttons, nav or table cells. Emails, keys and machine names are the only truncation candidates (ASCII), and only with `title` and a copy path |

**Rules:**

- **No uppercase with letter-spacing anywhere**, in either language. Eyebrows are retired. Where a kicker is useful, breadcrumbs or a sentence-case `small` muted line take its place. Table headers and status words are sentence case. `text-transform: uppercase` is linguistically safe for Vietnamese, but stacked marks on 11–12px tracked capitals are hard to read, and one rule for both languages is simpler.
- **Wrapping:**
  - `text-wrap: balance` on headings and `text-wrap: pretty` on leads.
  - `&nbsp;` inside short fixed compounds (`TablePro&nbsp;for&nbsp;Mac`, `macOS&nbsp;13`).
  - Never `hyphens: auto` and never `word-break: keep-all`.
- **Tracking is the same as English.** Vietnamese marks stack vertically. Verify display and h1 at 1440 with the test strings in §10.
- **Expansion:** no fixed widths on labels.
  - Header nav switches to the menu below 1024px (§4.4), and the Vietnamese row was summed to fit at 1024 (§4.4).
  - Buttons grow; segmented controls wrap their caption, not their labels.
  - Table headers wrap.
- **Implementation.** `@theme inline` inlines token values, so a `:lang(vi)` override of `--text-*--line-height` would do nothing. Define the roles as `@utility type-display` … `type-mono` utilities whose `line-height` reads a variable. Then set:

```css
:root, :lang(en) { --lh-display: 1.1; --lh-h1: 1.15; --lh-h2: 1.2; --lh-h3: 1.35; --lh-lead: 1.55; --lh-small: 1.55; --lh-caption: 1.45; }
:lang(vi)        { --lh-display: 1.3; --lh-h1: 1.3;  --lh-h2: 1.3; --lh-h3: 1.4;  --lh-lead: 1.6;  --lh-small: 1.6;  --lh-caption: 1.5; }
```

`:lang()` matches through inheritance, so an English quotation marked `lang="en"` inside a Vietnamese page gets English metrics back.

### 3.4 Other type rules

- **Reading measure:** body copy max 70ch. The `text` container (704px) is about 70ch at 16px, because Inter's `0` advance is 0.631em, or 10.1px. Leads max 56ch.
- **Headings are left-aligned everywhere,** including the hero. Centred marketing stacks read as a template, and a left edge matches documentation and the app.
- **No split-colour headlines.** A heading is one colour, `--foreground`. A second thought belongs in the lead.
- **Semantic levels follow the outline,** never the size. The account H1 uses the `h2` style (§5.4). Footer group titles become `h3` under a visually hidden footer `h2`, so they no longer nest under the last content heading.

---

## 4. Layout

### 4.1 Widths

| Container | Max content width | Used for |
|---|---|---|
| `wide` | **1216px** (Container `max-w-7xl` 1280 minus 2 × 32 gutter) | Page grid, header, footer, hero slot |
| `text` | **704px** (44rem) | Articles, legal, FAQ, comparison prose |
| `narrow` | **576px** (36rem) | Sign-in, notice pages (thank-you, newsletter, errors) |
| Account work column | 960px (60rem), left-aligned beside the rail | All account screens. Overview may cap at 768px |

**Why 1216:**

- The capture recipe (`docs/screenshots.md`) sizes the Mac window to 1216 × 684 pt on a 2× display, so each capture is a 2432 × 1368 px file (16:9, §6.3).
- A full-width window slot at 1216 therefore renders 1:1 at 2× density with no resampling.
- The layout and the capture plan agree on one number. (The files on disk today predate the recipe: 3024 × 1722 sources served as 1216- and 2432-wide WebP.)

### 4.2 Gutters and grid

| Width band | Side gutter | Grid | Column gap | Content width at the checkpoint |
|---|---|---|---|---|
| < 640 | **16px** | 4 columns (mostly single-column flow) | 16 | 343 at 375 |
| 640–1023 | 24px | 6 columns | 24 | 720 at 768 |
| ≥ 1024 | 32px | 12 columns | 32 | 960 at 1024; 1216 at 1280 and 1440 |

At 1216px, 12 columns are 72px wide with 32px gaps. Common splits:

- **5 / 7:** text 488px | media 696px. Used for a detail crop beside its text.
- **6 / 6:** 592 | 592.
- **4 / 4 / 4:** 384 each. Used for pricing cards.
- **8 / 4:** 800 | 384. Used for a database page lead with its facts card.

Text always sits on the left. There is no zigzag alternation.

### 4.3 Spacing scale and section rhythm

**Scale.** The base unit is 4px. Allowed steps are 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 and 96 (Tailwind 1–6, 8, 10, 12, 16, 20, 24). Nothing outside this set.

| Token | < 768 | 768–1279 | ≥ 1280 | Notes |
|---|---|---|---|---|
| `--space-section` (between two sections' content) | 64 | 80 | 96 | Was up to 184px of stacked spacers. Each section pads half of it on both sides, with the frame's join between (§4.7) |
| `--space-page-top` (below the 64px header, above the H1) | 40 | 56 | 72 | |
| `--space-page-header-bottom` | 32 | 40 | 48 | H1 block to the first content |
| `--space-heading` (H2 block to section content) | 24 | 32 | 40 | |
| Paragraph gap | 16 | 16 | 16 | `1em` in articles |
| Item gap in lists of cards | 16 | 24 | 32 | Equals the grid gap |

**Bands.** A page has at most one `surface` band, plus the footer. The section immediately before the footer is never `surface`, so two bands never merge.

**Joins.** Every block of `<main>` (the hero, a PageHeader, a Section, a page's own content block) pads 32 / 40 / 48px above and below, so the full-bleed join between two blocks (§4.7) has the same air on both sides and two blocks' content sits one `--space-section` apart. A band or strip uses the same padding inside its own ground. A section whose content ends in cells drops its bottom padding (`flush`), so its last cell closes on the join.

### 4.4 Breakpoints and what changes at each

These are Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 (unused). The four checkpoints are verified with real English and Vietnamese strings.

| Checkpoint | Header | Type steps | Layout |
|---|---|---|---|
| **375** | Logo, compact Download button, Menu button (44 × 44) | Small rungs | Single column. Actions stack, each with its caption underneath. Phone slots 240px wide. Tables use priority columns (§5.3.10) |
| **768** | Same as 375 (the full Vietnamese row needs 946px, more than the 720 available) | Medium rungs | Two-up grids (cards 2-up or stacked with two-column interiors). Footer in 3 columns |
| **1024** | Full nav. **Measured** from Inter's advance widths at 14/500, Vietnamese labels: logo 112 + nav labels 286 + the Features chevron and Docs arrow 36 + four 24px nav gaps 96 + language button ("Tiếng Việt" with globe and chevron) 135 + theme 40 + Account 89 + Download 64 + three 8px control gaps 24 + two 32px group gaps 64 = **946 of 960**. That is 14px to spare, too tight to trust a font-metric sum: verify in a browser (§10), and if it does not fit, the menu breakpoint moves to 1280. English needs 49px less (nav labels 237) | Medium rungs | 12-column grid. Account rail appears |
| **1280** | Full nav | Large rungs | Content reaches 1216. Optional table of contents beside long articles |
| **1440** | Full nav | Large rungs | Content stays 1216, centred, 112px from each edge. Nothing stretches |

**Overflow.** Remove `overflow-x: hidden` from `html` and `body` (`app.blade.php:12,135`). It masks horizontal-scroll regressions. Anything wide scrolls inside its own focusable region (§5.3.10). A test asserts `scrollWidth === 375` on every template.

### 4.5 Radii, borders, elevation, layers

**Radii:**

- `--radius-chip` 6px: Badge, `Kbd`, inline code
- `--radius-control` 8px: buttons, inputs, selects, segments, menu items, Callout
- `--radius-panel` 12px: cards, code blocks, AssetSlot, menus, dialogs
- No pills. The segmented track is 10px, so its 8px segments nest concentrically with 2px padding.

**Borders.** 1px everywhere.

- Decorative borders use `--rule`; control outlines use `--rule-strong`.
- 2px is reserved for state marks (indicator underline and rail bar) and for the focus ring.
- 3px only for the Callout's leading edge.

**Elevation.**

- Flat content has no shadow.
- Floating layers (menu, popover, dialog, toast) use `--raised` + `--shadow-overlay`.
- The final Mac window captures keep `.app-plate` (a drop-shadow that follows their transparent squircle corners), which only applies when a real file is rendered (§7.3).

**z-index:**

| Layer | z-index |
|---|---|
| page frame rails (§4.7) | 30 |
| page frame marks (§4.7) | 31 |
| sticky header | 40 |
| menus and popovers | 50 |
| consent bar | 60 |
| toasts | 80 |
| skip link | 100 |

Dialogs use the native top layer (`<dialog>.showModal()`).

### 4.6 Removed layout machinery

All of these are deleted: the `landing-layout.tsx` 3-column grid with two gutter columns and two container rails, `ruled-frame.tsx`, `FullLine` / `AccentLine`, the `.rule-numbered` counter, `--rule-inset`, `GridCell` / `cellBorders`, `Ledger`, and `[data-tone]`.

The layout is a stack: skip link, banner, header, `<main>`, footer, consent bar, with `Container` and `Section` inside. Tests that pin the ordinals (`LandingStructureTest.php:24-50`) are replaced with tests for headings, landmarks and no-overflow.

The page frame (§4.7) draws that stack as a grid without laying it out as one. Its rails are not the deleted ones: they are an overlay on the Container's own box rather than grid columns, so they cannot detach from the content, collapse with a row span, or need `overflow-x: hidden`.

### 4.7 Page frame

Decided by the owner on 2026-10-06, after a rendered survey of grid-line sites (Laravel, Vercel, Tailwind CSS, Zed, Supabase, Raycast, Linear and others): the Laravel-style frame, with cells, marks, frames on prose pages, rails from 1280px and horizontals only below that. It reverses the "gutter rails" entry of the Removed row; everything else in that row stays removed.

**Rails.** `FrameRails` (`components/shared/frame-rails.tsx`): two 1px `--rule` verticals on the wide Container's outer edge, the 80rem box that 76rem of content and two 2rem gutters fill. At 1440 they are at x = 80 and 1359; at 1280 they meet the screen edges. Below 1280 there are no rails. The layout root draws them over the whole page, banner and footer included, and the site header draws its own stretch because it is an opaque sticky layer above the page. Each rail is its own 1px element, so a browser that promotes it to a layer promotes a sliver.

**Joins.** A 1px `--rule` top border on every block of `<main>` after the first, drawn in frame.css by position (`main > * + *`), at every width and full-bleed. A template cannot leave one out, so every block of `<main>` must be full width: a narrow Container goes inside a full-width block. No block draws a rule of its own beside the join. The banner's, header's and footer's own rules complete the set. An anchor lands a block's top on the header's bottom rule (`scroll-margin-top: -1rem` against the root's 5rem `scroll-padding-top`), so a jump to `/#pricing` shows one line, not two.

**Marks.** An 11px cross in `--rule-strong` (3.64:1 light, 3.84:1 dark), centred wherever a join meets a rail: every join in `<main>`, by position, and the footer's rule (`data-join-mark`). The rule a reader can see is that a line crossing the whole page is marked where it crosses the frame, and a line inside the frame (a cell's, a list's) never is. The first version marked only the frame's start, its end and the homepage's `#pricing`; on 2026-10-06 the owner chose every join instead, because a few marked joins among unmarked ones read as an omission. The homepage carries 20 marks and `/databases` 32. From 82rem only, so a mark never overhangs the screen, also with a classic scrollbar.

**Cells.** `CellGrid` (`components/ui/cell-grid.tsx`): cells that share one 1px `--rule` line, drawn as each cell's 1px spread shadow, with no gaps and no corners. The grid reaches the Container's outer edge, so from 1280 its outer lines land on the rails and below 1280 it runs to the screen edge, leaving only horizontals on a phone. Cell padding puts content back on the page's left edge. Use it only in a wide section, for content that already is a set of like items:

**Shared.** The account app draws the same frame: `frame.css`, `FrameRails` and `CellGrid` are byte-identical in both repositories (`docs/shared-files.md`), so the rails, joins and cells stay put when a reader crosses from a public page to `/account`.

- the homepage: the hero's two download actions, the featured engines, the sponsors, the workflow rows (a detail row is two cells, 5 / 7), the safety row, the platform block, the plans and the closing actions
- `/pricing`: the plans (`PricingPlans` is the same component)
- `/download`: the Mac and iPhone and iPad platforms
- `/faq`: one row per topic, the topic beside its questions
- a feature page: every block whose crop sits beside its text (5 / 7), and the documentation and related-pages row

Prose sections (`#ai`, `#switch`, articles) stay unlined inside their joins. Cards stay cards where a block holds a single object (the database facts card, callouts, code blocks, account panels).

**Inner lines end on a vertical.** Decided 2026-10-06, after the first frame shipped with table and list rules that stopped 32px short of the rails, or at the 704px reading measure, and read as loose lines in open space. A survey of framed sites found none that does that: Laravel Cloud and Forge run every table row from rail to rail with the text padded back to the heading edge, and lists either reach the rails, sit inside a cell, or use no rules at all. So every rule inside the frame runs from rail to rail (screen edge to screen edge below 1280px) or from wall to wall inside a cell, and the content keeps its place:

- `frame-table` on a DataTable's scroll region: the region reaches the rails, the first and last cells pad their text back to the content edges (the first column's text now starts on the heading edge), and the header row has one rule, not the 2px of its own rule plus the first row's.
- `frame-rows` on a ruled list in a wide section, and `frame-rows-text` on one at the reading measure: the list reaches the rails from whatever measure it sits in, using container units (`Section`'s Container is a size container), and each row keeps its text at the measure. Used by DescriptionList rows, FaqList items, PostList rows and the feature and comparison lists.
- `cell-rows` on a ruled list inside a cell, and the same bleed on a single divider in a cell (a plan's "Includes", the Mac card's "Other ways to install"): wall to wall.
- Topics within one subject are blocks of their own, so the frame's joins separate them: `/pricing`'s license, billing, refunds, Team, open source and FAQ, `/download`'s install, updates and older versions, and a blog post's related posts.
- A list that opens a block starts on its join (the blog index), and a list inside a card keeps its own inset rules, closed by the card's edge.

`PageFrameTest` fails any `dl`, ruled list or table in `<main>` that does none of these, outside a card or a blog article's own prose.

**Lists at a join.** A `dl`, `FaqList`, `PostList` or other list marked `data-rule-list` that ends a block drops its last rule, because the join below closes it; a list inside a card keeps it.

**Rules that hold the frame together:**

- Neutral and solid only. The accent never colours a line or a mark, and a dashed edge still means a placeholder (§6.2).
- Static. Nothing in the frame animates.
- Decoration only: rails and marks are `aria-hidden`, take no pointer, and are hidden in forced colours and in print. Joins are borders, so they stay in both, like the header's rule. Cell lines are shadows, which forced colours removes.
- No `vw` widths and no overflow clipping anywhere in the frame.

`PageFrameTest` holds the markup and CSS. The geometry was measured in a browser on every template at 390, 768, 1024, 1280, 1366, 1440 and 1920px: no horizontal scroll, rails on the Container edge, cell lines on the rails, one join per block boundary, two marks per join.

---

## 5. Components

### 5.1 Inventory

Repo key:

- **P** = public only (`TableProApp/web`).
- **A** = account only (`TableProApp/license`).
- **P+A** = the same spec, built as a **separate file in each repo** (§9).
- **Shared** = one byte-identical file in both repos, on architecture §3's list and enforced by its hash test (§9).
- **Shared\*** = on architecture §3's conditional list: byte-identical wherever every import resolves in both repos without a dependency change. Otherwise the file is rebuilt in the license repo to the same spec and listed as an exception in `docs/shared-files.md` (§9).

| Component | Repo | Decision | From (current file) | Notes |
|---|---|---|---|---|
| `Button` | Shared\* | **Refactor** | `ui/button.tsx` (both, byte-identical) | Variants `primary`, `secondary`, `quiet`, `danger`. Sizes `sm`/`md`/`lg`. 8px radius. Loading state. Hover becomes token fills, not `opacity-90` |
| `TextLink` | Shared\* | **Refactor** | `ui/prose-link.tsx` (`PROSE_LINK`) | `inline` and `standalone` kinds. Cross-app links are always a plain `<a>` |
| `Container` | Shared\* | **Refactor** | `ui/container.tsx` | Widths `wide` / `text` / `narrow`. Drop `rule-inset-host` |
| `Section` | P | **Replace** | `ui/section-shell.tsx` (`SectionShell`, `SectionHeader`) | `<section aria-labelledby>`, H2 + optional lead, tone `base` / `surface`. Half-rhythm padding around the frame's joins; `flush` ends on the join (§4.7). No eyebrow, no muted second line |
| `FrameRails` | P | **New** | — | The page frame's rails (§4.7), over the page and in the header |
| `CellGrid` | P | **New** | — | Shared-border cells reaching the rails (§4.7). Wide sections only |
| `PageHeader` | P+A | **Replace** | `section-shell.tsx` `PageHeader`; A `screen-header.tsx`, `notice-page.tsx` header | Breadcrumbs, H1, lead, meta line, actions. Variants `marketing` (`h1`), `utility` (`h1`, compact top), `screen` (account: H1 in the `h2` style) |
| `Card` | P+A | **New** (sparingly) | — | Only for a block that holds one object: the download page's platform cards, account license and settings panels, and the database facts card. A set of like items is a `CellGrid` (§4.7), never a grid of cards |
| `DataTable` | Shared\* | **Refactor** | `ui/data-table.tsx` (both) | Caption required, `visible` or `sr-only`. Scroll region, priority columns, numeric alignment. No row-selection bar |
| `DescriptionList` | Shared\* | **Replace** | `ui/ledger.tsx` (both) | `<dl>` key/value rows: database facts, license details |
| `Badge` | Shared\* | **Refactor** | A `ui/badge.tsx` | Variants `neutral`, `accent`, `outline`. 13px/500, sentence case |
| `StatusBadge` | Shared\* | **Refactor** | A `ui/status-badge.tsx` | Dot plus word. **Drop** the mono uppercase tracked label |
| `Availability` | P | **Refactor** | `ui/glyph.tsx` | Glyph + sr-only word, or a visible short word with a footnote |
| `AvailabilityLine` | P | **New** | hero caption, `footer-cta`, `Download.tsx` literals | One data-driven line under each platform action (≤ 8px gap, `small` muted). Public only: it reads `platforms.json`, and the account app states no platform requirement |
| `Tabs` | P | **New** (rare) | — | Only for alternatives of one thing, such as an MCP config per client. ARIA tabs with arrow keys. Built, then removed during integration: no page needed it |
| `SegmentedControl` / `BillingCycleControl` | P | **Replace** | `pricing.tsx:431-450` | Radio group (fieldset + native radios) plus a caption (§2.4) |
| `Disclosure` | P+A | **New** | `<details>` on compare and database pages (removed earlier) | Native `<details>`/`<summary>` for optional detail: "Which Mac do I have?", "On this page", older versions |
| `FaqList` | P | **Refactor** | `ui/faq-list.tsx`, `landing/faq.tsx` | One column at text width, every answer visible. Not an accordion (keeps Ctrl+F and indexing) |
| `CodeBlock` | P | **Refactor** | `ui/code.tsx` | Optional title (file name or shell). Copy button inside. Focusable scroll region. `command` variant with a non-copied `$` |
| `CopyButton` | Shared\* | **Refactor** | `ui/copy-button.tsx` (both) | Visible "Copy" label in `md`, icon-only in `sm`. A polite live region replaces the toast |
| `InlineCode`, `Kbd` | P | **Keep** (restyle) | `ui/code.tsx`, `ui/kbd.tsx` | 6px radius, `--surface` ground |
| `Callout` | Shared\* | **New** | — | `note`, `success`, `warning`, `danger`. Language notices, limits, link errors |
| `Footnote` | P | **Refactor** | `ui/footnote.tsx` | Numbered references under tables and comparisons. No closing rule. Removed unused during integration: the comparison pages number their sources with `compare/sources.tsx` |
| `Breadcrumbs` | P | **New** | `PageHeader` `labelHref` back-link | Hub children, blog posts, legal |
| `LanguageSwitcher` | P+A | **New** | — (none rendered on the old site) | Same look, different mechanics per repo (§5.3.15): public links to the equivalent page; the account app's switcher is its own |
| `ThemeControl` | Shared | **New** | — (none rendered on the old site) | `components/shared/theme-control.tsx`: `variant="menu"` (header `menuitemradio` menu), `variant="segmented"` (mobile menu) and `variant="icons"` (footer bar); labels as props |
| `SiteHeader` | P | **Replace** | `landing/header.tsx` (both) | Nav per sitemap §B.1 (Features menu, Databases, Pricing, Docs, Blog) plus language, theme, Account and Download. **No Download dropdown**: Download goes to `/download`. The license repo's copy is deleted; it gets its own slim headers (§5.4) |
| `MobileNav` | P | **Refactor** | `landing/mobile-nav.tsx` (both) | Full-height sheet dialog. Toggle gets `aria-expanded`, which the old one lacked. The license repo's copy is deleted |
| `SupportBanner` | P | **Refactor** | `landing/support-banner.tsx` | Neutral `--surface` band, not an orange fill. Key `tablepro:banner-dismissed` unchanged |
| `SiteFooter` | P | **Replace** | `landing/footer.tsx` (both) | Groups and links per sitemap §B.3 with positioning §10.2's labels, newsletter form and cookie settings, as cells, closed by the shared FooterBar (language menu, theme). No giant wordmark. The license repo's copy is replaced by its own slim footer (§5.4), which ends on the same FooterBar |
| `ConsentBar` | Shared | **Refactor** | `landing/consent-bar.tsx` (both) | Moves to `components/shared/consent-bar.tsx` with `lib/consent.ts`. Compact. Equal-weight Allow and Decline. Storage key and head order unchanged |
| `Field`, `Input`, `Select`, `Checkbox`, `Stepper` | Shared\* | **Keep/refactor** | A `ui/field.tsx`, `select.tsx`, `stepper.tsx` | Shared form styling. Native controls with `accent-color` |
| `Dialog` | Shared\* | **Refactor** | A `ui/confirm-dialog.tsx` | Native `<dialog>`. Cancel gets default focus on destructive dialogs |
| `Toast` | P+A | **Keep** (restyle) | A `ui/app-toaster.tsx`, P layout `Toaster` | Flash confirmations only. Errors that need action are inline `Callout`s |
| `EmptyState` | Shared\* | **Keep** | A `ui/empty-state.tsx` | Title (`h3` style), text, one action. No illustration |
| `NoticePage` | Shared\* | **Refactor** | A `landing/notice-page.tsx` | Public 404/410; account thank-you, newsletter, 403/404/419/429/500/503 |
| `AssetSlot` | P | **New** | `ui/themed-image.tsx` (replaced) | §6. Renders a placeholder or the supplied image from the manifest. Becomes Shared only if the account app ever gets an editorial slot (none at launch) |
| `PlatformCard` | P | **New** | `Download.tsx`, `footer-cta.tsx` | Per platform from `platforms.json` |
| `PlatformActions` / `DownloadBand` | P | **New** | `download-rail.tsx`, `footer-cta.tsx`, `closing-cta.tsx` (all removed) | Mac button + caption and App Store badge + caption. Used in the hero and the final band. Public only (the account app links to `/download` instead) |
| `AppStoreBadge` | P+A | **Keep** | `landing/app-store-badge.tsx` | Official Apple artwork, unmodified, 40px tall. Apple's official Vietnamese badge artwork serves `/vi` |
| `PricingCard` | P | **Refactor** | `pricing.tsx` `PricingCard` | §5.3.18 |
| `PlanMatrix` | P | **Refactor** | `landing/license.tsx` | Table of the paid features × Free/Starter/Team, from data |
| `ComparisonTable` | P | **Replace** | `landing/compare-table.tsx`, Compare page tables | One competitor per page, sourced and dated. Removed from the homepage |
| `EngineTable` | P | **Replace** | `landing/database-grid.tsx` (tiles, filter, 2-D arrow keys) | Grouped table on the hub |
| `EngineList` | P | **New** | — | Compact named list on the homepage |
| `DatabaseMark` | P | **Refactor** | `ui/database-mark.tsx` | Original colours, no `grayscale` / `opacity-40` / `invert`. Uses `iconDark` from data or a light tile |
| `SponsorList` | P | **Refactor** | `landing/sponsor-row.tsx` | The 4 verified sponsors only. Each link named |
| `ProseArticle` | P | **Refactor** | `.blog-article` CSS, `ui/prose-block.tsx` | Blog and legal. Body in `--foreground`. Permalink glyph kept out of the heading's accessible name |
| `TableOfContents` | P | **New** (optional) | — | Legal and long guides: sticky at ≥ 1280, a `Disclosure` below that |
| `AccountBar`, `AccountNav` | A | **Refactor** | A `dashboard/account-bar.tsx`, `nav-rail.tsx` | Adds language and theme. Rail bar uses `--accent-indicator` |
| Removed | P+A | **Remove** | `full-line`, `grid-cell`, `ledger`, `section-label`, `prose-block`, `themed-image`, `spec-strip`, `download-rail`, `switch-from` (moves to comparisons), `guardrails` (split into feature content), `workbench`, `hero`, `footer-cta`, `closing-cta`, `product-hunt-badge`, `ruled-frame` | Product Hunt: a hotlinked widget that set `__cf_bm` before consent |

### 5.2 State baseline (applies to every interactive element)

| State | Treatment |
|---|---|
| **Hover** | Only with `@media (any-hover: hover)`, so touch devices never keep a stuck state. Colour or fill changes over `--dur-tap` (120ms). Never movement, scale or shadow growth |
| **Focus-visible** | `outline: 2px solid var(--focus); outline-offset: 2px`, following the element's radius. Elements inside clipping containers use `outline-offset: -2px`. Never removed, and never replaced by `focus:outline-none focus:ring-*`. Measured 4.94–9.70:1 (§2.3) |
| **Active (pressed)** | A one-step darker fill (`accent-active`, `danger-fill-hover`, `surface-strong`). No transform |
| **Disabled** | A real `disabled` attribute on buttons and inputs. `aria-disabled="true"` on links, which are also removed from the tab order. Fill `--surface-strong`, label `--muted-foreground` (5.18 / 6.38, legible though exempt), `cursor: not-allowed`. **Never `opacity: .5`.** A disabled control states why, nearby (for example "Every seat is in use") |
| **Loading / busy** | `aria-busy="true"` + `disabled`. A 16px `currentColor` spinner replaces the leading icon. The label stays, so the width does not change |
| **Selected / current** | `aria-current="page"`, `aria-selected` or `aria-checked`, *plus* a visual change that does not rely on hue alone: weight or colour change on the text **and** an `--accent-indicator` mark (≥ 3.31:1) |
| **Invalid** | `aria-invalid="true"`; border `--danger`; message below the field in `--danger` with an icon, linked by `aria-describedby` |

**Target size.** Controls are at least 32px tall (`sm`) and 40px by default. Icon buttons are 40 × 40, and 44 × 44 in the mobile header. All exceed WCAG 2.5.8 (24 × 24).

### 5.3 Component specifications

#### 5.3.1 Button

| Variant | Rest | Hover | Pressed | Use |
|---|---|---|---|---|
| `primary` | `bg-accent text-accent-foreground` | `--accent-hover` | `--accent-active` | The one main action of a view: Download for Mac, Sign in link, Subscribe |
| `secondary` | `bg-raised`, 1px `--rule`, `text-foreground`; light only: `0 1px 0 oklch(0 0 0 / 0.04)` | `bg-surface` | `bg-surface-strong` | Alternatives: Intel build, Rotate key, plan purchase buttons, Allow/Decline |
| `quiet` | Transparent, `text-foreground` | `bg-surface` | `bg-surface-strong` | Header Account, Sign out, Cancel in dialogs, "Use a different email" |
| `danger` | `bg-danger-fill text-danger-foreground` | `--danger-fill-hover` | `--danger-fill-hover` | Confirm buttons in destructive dialogs only, never on the screen itself |

**Sizes:**

| Size | Height | Padding-x | Text | Icon |
|---|---|---|---|---|
| `sm` | 32 | 12 | 14/500 | 16 |
| `md` (default) | 40 | 16 | 14/500 | 16 |
| `lg` | 48 | 20 | 16/500 | 20 |

**Other rules:**

- Gap between icon and label: 8px.
- `fullWidth` stretches the button in cards and on mobile.
- Labels never truncate, and wrap to two centred lines at most.
- Filled variants keep a transparent 1px border so they stay outlined in forced-colours mode.
- Render `<a>` when the button navigates and `<button>` when it acts. `ref` stays forwarded, because `Download.tsx` assigns the resolved asset URL imperatively.
- `buttonClasses()` stays exported for the arch swap.

#### 5.3.2 TextLink

- **`inline`** (inside prose):
  - Rest: `--foreground`, 1px underline in `--muted-foreground`, `text-underline-offset: 3px`.
  - Hover: text and underline turn `--accent-text`.
  - Visited: unchanged.
- **`standalone`** ("Supported databases →" / "Cơ sở dữ liệu được hỗ trợ →", "See pricing →" / "Xem bảng giá →"):
  - Rest: `--accent-text` at 14/500, no underline, trailing `→` marked `aria-hidden`.
  - Hover: underline appears.
  - **The text names the destination** (positioning §4). Never "Learn more", "Read more" or "Click here", and never a universal such as "All databases" (positioning §12).
- **Internal targets** are built with `localePath` (architecture §1.2), never typed as a root path. For example, "See pricing" is `localePath('/#pricing', locale)`: `/#pricing` on English pages and `/vi#pricing` on Vietnamese ones (never `/vi/#pricing`, which the normaliser would redirect).
- **External:**
  - Opens in the same tab by default and shows `↗` (`aria-hidden`).
  - Docs links on Vietnamese pages read "Tài liệu (tiếng Anh)" because the docs are English-only.
  - When `target="_blank"` is unavoidable, add an sr-only "(opens in a new tab)" / "(mở trong thẻ mới)".
- **Cross-app** (public ↔ `/account`, `/checkout`, `/thank-you`):
  - Always a plain `<a>`, never an Inertia `<Link>`, because the other app answers with its own HTML and asset version.
  - Locale-aware: `/vi/...` public targets from Vietnamese account screens.

#### 5.3.3 Header nav link

- Label 14/500 in `--muted-foreground`; `--foreground` on hover.
- The current section gets `--foreground`, `aria-current="page"`, and a 2px `--accent-indicator` bar on the header's bottom edge.
- No pills or backgrounds.

#### 5.3.4 Tabs (rare)

- `role="tablist"`: labels 14/500 `--muted-foreground`.
- Selected tab: `--foreground` with a 2px `--accent-indicator` underline. The tablist has a 1px `--rule` baseline.
- Arrow keys move between tabs; Home and End jump to the ends. Selection follows focus.
- Panels are focusable, with `tabIndex=0` when they hold no focusable content.
- Use tabs only when every panel is an alternative of the same thing (config per MCP client). Never use them to hide page sections.

#### 5.3.5 SegmentedControl / BillingCycleControl

- **Structure:** a `<fieldset>` with a visually hidden `<legend>` ("Billing cycle" / "Chu kỳ thanh toán") and three native radios, each wrapped by its label.
- **Track:** `--surface-strong`, 10px radius, 2px padding.
- **Segments:** 36px tall, 16px padding-x, label 14/500.
  - Unselected: `--muted-foreground`.
  - Checked: `--segment-selected` fill (`--raised` in light; a step above the track in dark, 1.36:1) + 1px `--rule` border + `--foreground` label; light mode only adds a `0 1px 2px oklch(0 0 0 / 0.06)` shadow.
- **Focus:** the ring wraps the segment (`:has(:focus-visible)`).
- **Caption** (§2.4): one `small` muted line below, `aria-live="polite"`, with its height reserved (min-height one line) so switching causes no CLS.
- **Without JS:** the radios are server-rendered with yearly checked (the current default), so the control works before hydration.

#### 5.3.6 Disclosure

- **Structure:** native `<details>` / `<summary>`.
- **Summary:** 14/500 `--foreground` with a leading 16px chevron that rotates 90° over `--dur-state`; reduced motion makes it instant.
- **Body:** `small` or `body` text, indented 24px.
- **Use for** optional detail only:
  - Which Mac do I have
  - On this page
  - Older versions
- **Never use it to truncate data.** Engine lists, plan matrices and comparisons always render in full.

#### 5.3.7 FaqList

- One column. In a section its rows run from rail to rail with their text at `text` width (`frame-rows-text`, §4.7); on `/faq` it fills the questions cell beside its topic, with rows from the cell divider to the rail.
- Each item:
  - The question is an `h3` (or `h2` on `/faq` under group headings, which use the `h2` style).
  - The answer is `body` in `--foreground`, 8px below its question.
  - Items are separated by a 1px `--rule` with 24px of padding.
- All answers are visible. Answers come from data, with named interpolation.

#### 5.3.8 Badge, StatusBadge, Availability

- **Badge.** 22px tall, 8px padding-x, 6px radius, `caption` 13/500, sentence case.
  - `neutral`: `--muted-foreground` on `--surface-strong` (5.18 / 6.38).
  - `accent`: `--accent-text` on `--accent-subtle` (5.15 / 8.09).
  - `outline`: `--foreground` with a 1px `--rule` border.
  - Badges are labels, never buttons.
- **StatusBadge.** An 8px dot in the status colour followed by the word in `--foreground` (`small` 14/500): Active, Expired, Suspended, Pending. It replaces the mono 11px uppercase tracked label in `status-badge.tsx`.
- **Availability** (table cells):
  - Included: a 16px check in `--accent-text` + sr-only "Included" / "Có".
  - Not included: an en dash in `--muted-foreground` + sr-only "Not included" / "Không có".
  - Partial or conditional: a visible short word ("Mac only", "Partial") + a footnote marker. Never a bare glyph.

#### 5.3.9 Card

- **Shape:** `--raised` fill, 1px `--rule` border, 12px radius, 24px padding (20px below 640). No shadow.
- **Header row:** title in the `h3` style + optional Badge or StatusBadge on the right.
- **Linked card** (database hub alternative, related links): the heading link stretches over the card with `::after`.
  - Hover: border `--rule-strong`, fill `--surface`.
  - Focus: the card shows the focus ring via `:has(a:focus-visible)`.
  - Only one link per card.

#### 5.3.10 DataTable

**Structure:**

- `<table>` with a required `<caption>`. It is `sr-only` by default; `visible` renders it as a `small` muted line above the table (comparisons: "Compared on 2 October 2026. Sources below.").
- Header cells: `th` at 14/600 `--foreground` on `--surface`, with a 1px `--rule` bottom border, sentence case.
- Body cells: 14/1.55 `--foreground`; 12px vertical and 16px horizontal padding; 1px `--rule` row separators.
- **In the frame** (§4.7), every public table is `frame-table`: rows run from rail to rail, the first and last columns pad their text to the content edges, and the header row draws a single rule.
- Row headers: `th scope="row"` at 500.
- Numbers right-aligned with tabular figures.
- **No zebra striping and no hover bar on static tables.** The `[data-row]` row-selection treatment is retired. Its `::before` on a `<tr>` also generated an anonymous table cell that pushed every `<td>` one column right.

**Overflow:**

- A wrapper `div` with `role="region"`, `aria-labelledby` pointing at the caption id, `tabindex="0"`, `overflow-x: auto`.
- The first column is sticky (`--raised`) on comparison and plan tables.

**Narrow screens.** At < 640 the table keeps its semantics and uses **priority columns**: secondary columns fold into the first cell as `caption` lines, and the column `th` stays for screen readers. Account machine and member tables use this. Tables are never converted to `display: block`, which strips table roles in Safari.

#### 5.3.11 DescriptionList

- A `<dl>` of rows, each a `<div>` holding a `dt` and a `dd`.
- **Wide layout:** two columns; `dt` is 14/500 `--muted-foreground` (about 1/3), `dd` is 14 `--foreground`. Rows are separated by a 1px `--rule` with 12px padding.
- **Below 640:** `dt` stacks above `dd`.
- **In the frame** (§4.7): rows run from rail to rail (`frame-rows`, or `frame-rows-text` at the reading measure), or from wall to wall in a cell (`cell-rows`). Inside a card, rows keep the card's inset.
- **Used for:** database facts and license details.
- It replaces `Ledger`.

#### 5.3.12 CodeBlock, CopyButton, Kbd

- **CodeBlock:**
  - `--code-background` (`--raised`), 1px `--rule`, 12px radius.
  - Optional title bar: 36px tall, `small` muted file name or "Terminal", 1px `--rule` bottom border.
  - Body: 16px padding, `mono` 14/1.6.
  - Scroll region: `role="region"`, `aria-label`, `tabindex="0"` when it can overflow.
  - CopyButton sits top-right.
  - `command` variant: a `$` prompt in `--muted-foreground` with `user-select: none`, not part of the copied value.
- **CopyButton:**
  - `sm`: 32 × 32 icon only, `aria-label` "Copy {label}" / "Sao chép {label}".
  - `md`: icon + "Copy" / "Sao chép".
  - On success the icon becomes a check in `--accent-text` and the label "Copied" / "Đã sao chép" for 2s, announced through a polite live region (no toast).
  - On failure an inline danger line reads "Couldn't copy. Select the text and copy it." / "Không sao chép được. Hãy chọn và sao chép thủ công."
- **Kbd:** 20px tall, 6px radius, 1px `--rule-strong`, `mono` 12px, `--muted-foreground`. Uses the app's literal glyphs (⌘ ⇧ ⌥ ⌃ ⏎).

#### 5.3.13 Callout and Footnote

- **Callout:**
  - `--surface` fill, 1px `--rule`, 8px radius, 3px leading edge in the status colour (`note` uses `--rule-strong`), 16px padding.
  - Icon: 16px in the status colour.
  - Optional title at 14/600 `--foreground`; body `small` `--foreground`.
  - Role: `role="note"`. Errors that appear after an action use `role="alert"`.
  - **Uses:**
    - Vietnamese legal prevailing-language notice
    - "English-only article" labelling
    - limits on feature and database pages
    - lagging Homebrew notice
    - sign-in link errors
- **Footnote:**
  - Numbered `<sup><a href="#fn-n">` markers in tables.
  - An ordered list below, `caption` 13 `--muted-foreground`, each item with a ↩ back-link and the source date.

#### 5.3.14 Breadcrumbs

- `<nav aria-label="Breadcrumb">` / `"Đường dẫn"` containing an `<ol>`.
- Items are `small` `--muted-foreground` links separated by `/` (`aria-hidden`). The last item is plain `--foreground` text with `aria-current="page"`.
- Sits 16px above the H1.
- Below 640 only the parent shows, as "← Databases".
- Matches `BreadcrumbList` JSON-LD.

#### 5.3.15 LanguageSwitcher

- **Header:**
  - A `quiet` `sm` button: globe icon + the *current* endonym ("English" / "Tiếng Việt"), accessible name "Language: English" / "Ngôn ngữ: Tiếng Việt" (it contains the visible text, WCAG 2.5.3).
  - It opens a menu (`--raised`, `--shadow-overlay`, 12px radius, 4px padding).
  - Items are `<a href hreflang lang>` links to the **equivalent page**, labelled with endonyms. The current item gets a check and `aria-current="true"`.
  - Keyboard: arrow keys and Escape, and focus returns to the button.
- **Footer:** the same choices in the shared `FooterMenu` (§5.3.17), a `<details>` that opens upward from the footer bar: a globe, the current endonym and a chevron, named "Language: English". It opens, and its links work, without JS. Hydrated, it also closes on Escape (focus returns to it), on a press or focus outside, and the arrow keys move between choices. An inline list of every endonym stopped fitting at twelve languages (decided 2026-10-08).
- **Targets** come from `switchTargets` (sitemap §B.4). A cross-locale item is a plain `<a>` (`LocaleLink` with another locale renders one), so `<html lang>`, the font preloads and the theme script all run again.
- **No equivalent page** (for example an English-only release post): the item still links to the other locale's nearest parent (`/vi/blog`) with the second line from sitemap §B.4, such as "Bài viết này chỉ có bằng tiếng Anh · Xem danh sách Blog". Never a dead or flag-labelled item.
- **Account app** (a separate file in the license repo, §9; same look and labels): its mechanics belong to that repository. The public contract is architecture §2: one parameter name, `locale`, and switching language never invalidates a signed link.
  - No token or email appears in these URLs.
- **Never:** flags, codes ("EN"), or auto-redirects.

#### 5.3.16 ThemeControl

One shared file, `components/shared/theme-control.tsx` (architecture §1.10 and §3), with three variants. Each app passes its labels as props, so the file stays byte-identical.

- **`variant="menu"` (header):**
  - A 40 × 40 `quiet` icon button. Its icon reflects the *choice* (sun / moon / monitor), selected by CSS from `[data-theme-choice]`.
  - Accessible name: "Theme: Light" / "Giao diện: Sáng" (Dark / Tối; System / Theo hệ thống).
  - Opens a menu (`--raised`, `--shadow-overlay`, 12px radius) of three `menuitemradio` items with icon and label, `aria-checked` on the current one. Arrow keys move; Escape closes and returns focus to the button.
- **`variant="segmented"` (mobile menu):** an inline `SegmentedControl` with the same three options, icon + label.
- **`variant="icons"` (footer bar):** the same radios as icon-only segments, 32px square (36px below 640), each named for assistive tech and in a tooltip.
- **SSR:** the markup is theme-independent; the icon and the selected style come from `html[data-theme-choice=…]`, and `aria-checked` is corrected on mount.
- **Behaviour:** §2.8.

#### 5.3.17 SiteHeader, MobileNav, SupportBanner, SiteFooter, ConsentBar

**SiteHeader:**

- 64px, `position: sticky`, `--background` fill (opaque, no blur), 1px `--rule` bottom border, `wide` container.
- Left: the logo (`/images/logo.png` at 28px + "TablePro" at 18/600), linking to `/` or `/vi`.
- ≥ 1024 (items and order from sitemap §B.1):
  - Nav: **Features ▾** · Databases · Pricing · Docs ↗ · Blog. Features is a `<button aria-expanded>` that opens a disclosure panel (`--raised`, `--shadow-overlay`, 12px radius) listing All features, the seven feature pages (Querying, Data editing, Schema, Import & export, AI & MCP, Connections, Sync & teams) and iPhone & iPad. Escape closes it and returns focus. With a mouse it also opens on hover, 80ms after the pointer rests on the button, and closes 150ms after it leaves the button and the panel; a click on a panel that hover opened pins it open. Touch and pen keep the click (decided 2026-10-06).
  - Right: LanguageSwitcher, ThemeControl, Account (`quiet`, a plain `<a>` to `/account?locale={locale}`), **Download** (`primary` `sm`, to `/download`).
- < 1024: logo, Download (`primary` `sm`), Menu button (44 × 44, `aria-expanded`, `aria-controls`).
- Internal hrefs go through `LocaleLink`, which is why this component never moves to the license repo (§9).
- `scroll-padding-top: 80px`, so anchors and focused elements clear the header (WCAG 2.4.11). The banner scrolls away, so it adds nothing.

**MobileNav** (items and order from sitemap §B.2):

- A `<dialog>` sheet filling the viewport below the header, on `--raised`.
- Links at 18/500 with 48px rows: Features (expands in place to the same links as the desktop panel), Databases, Pricing, iPhone & iPad, Docs ↗, Blog, FAQ, then Account.
- Then a Language list and a Theme segmented control.
- At the bottom: a full-width `primary` `lg` "Download for Mac" (→ `/download`) and the App Store badge, each with its AvailabilityLine.
- Focus is trapped (native modal); Escape closes and focus returns to the toggle.
- "iPhone & iPad" is the one label for that link; the old menu used two.

**SupportBanner:**

- The license banner (decided 2026-10-05): on by default on every public page except Pricing, above the sticky header, scrolling away with the page.
- 40px `--surface` band with a 1px `--rule` bottom border; text `small` `--foreground`; link `standalone`. From 1024px the sentence and "Get a license"; below, the short link alone; from 1280px also "Have a license? Hide this".
- Dismiss is a 32px `quiet` icon button labelled "Dismiss" / "Ẩn thông báo". Closing it hides the bar for 30 days at that version; "Have a license?" and a purchase hide it for a year at every version (`lib/banner.ts`).
- Mechanics: `--banner-h`, `has-banner` stamped server-side on the pages that show it, and the dismissal record settled before first paint.

**SiteFooter:**

- `--surface`, 1px `--rule` top border (the page frame's last join, marked where it meets the rails), `wide` container. Redesigned 2026-10-08.
- Starts with a visually hidden `h2` ("Site links" / "Liên kết").
- The newsletter and the five link groups are cells of one `compact` CellGrid (§4.7), so their walls land on the rails:
  - The newsletter is a full-width cell: its words beside its form from 768px of cell width, stacked below that.
  - The groups are two to a row below 640, three from 640 and five from 1024. Below 640 the cells draw their horizontals only.
  - Six cells in one row was measured and rejected: at 1280 it leaves 131px per group, and labels run to 196px (Indonesian) with unbreakable words of 150px (German).
- Groups and links come from sitemap §B.3, with the labels in positioning §10.2 (for example "Supported databases", never "All databases"). Group titles are `h3` at 14/600; links are `small` `--muted-foreground` with `--foreground` on hover, 32px rows. A group cell keeps half its right padding and hyphenates a word that still cannot fit.
- **FooterBar** closes it: one shared file, `components/shared/footer-bar.tsx`, byte-identical in the account app, whose footer ends on the same row.
  - Left: the logo at 20px (decorative) and "© year TablePro. Source code under the AGPLv3."
  - Right: the language menu (§5.3.15) and ThemeControl `icons` (§5.3.16). Below 640 they sit on a second row, language left and theme right.
  - Its rule runs rail to rail, on the cell grid's last line.
  - Where chat is configured, the controls keep `LAUNCHER_REACH` (100px) clear of the screen's right edge, so the chat launcher never covers them. From about 1416px the page's own margin is that wide and nothing moves.
- "Cookie settings" stays in the Legal group.
- No wordmark SVG.
- The newsletter block:
  - Label + email `Input` + `secondary` Subscribe + one `caption` privacy line.
  - The result renders inline (`aria-live`) from `useEmailForm`.
  - It does not need `/api/newsletter/stats`. If a count is shown at all, it loads only on user intent, never on scroll, because that request sets platform cookies.

**ConsentBar:**

- Fixed, bottom-left, 16px from the edges; max-width 416px at ≥ 640; full width minus 32px below that.
- `--raised` + `--shadow-overlay`, 12px radius, 16px padding.
- Text: one `small` sentence + a "Privacy" link.
- Buttons: **Allow** and **Decline**, both `secondary` `sm`, equal width, on one row.
- **Target height:** ≤ 120px at 375 × 812 (≤ 15%, against 25.6% measured on the old site) and ≤ 96px at 1440.
- While visible it sets `scroll-padding-bottom` to its own height, so it cannot cover focused elements.
- Last in DOM order. Storage key and head order unchanged.

#### 5.3.18 Commerce and platform components

**AvailabilityLine:**

- `small` `--muted-foreground`, ≤ 8px below its action, built from `platforms.json` fields joined with " · ".
  - Mac example: "macOS 13 Ventura or later · Apple silicon or Intel".
  - iPhone example: "iPhone & iPad · iOS and iPadOS 18 or later".
- It stays attached to its action when the row stacks.

**PlatformActions:**

- Mac: `Button` `primary` `lg` "Download for Mac" + AvailabilityLine.
- iPhone and iPad: `AppStoreBadge` (40px) + AvailabilityLine.
- Side by side at ≥ 640 with a 24px gap; stacked below.
- **DownloadBand:** an H2 + one sentence + PlatformActions, at `wide` width, on `--background`.

**PlatformCard** (download page, the homepage's `#platforms`):

- A cell of a `CellGrid` (§4.7), on the download page and in the homepage's `#platforms`, with:
  - platform name (`h2` semantic, `h3` style)
  - a version Badge `neutral` "v0.77.0 · 2 Oct 2026" (from the release service, locale-formatted)
  - the requirement line
  - actions
  - secondary links
  - an optional section (Homebrew CodeBlock)
- Future platforms get **no** card and no dead button.

**PricingCard** (three across at ≥ 1024, equal width and emphasis):

- Joined cells of one `CellGrid` (§4.7): no border, corner or fill of their own.

- Tier name (`h3` style) and a one-line `small` muted description.
- Price at `h1` size, weight 600, tabular, with the unit in `small` muted beside it ("/ month", "/ year", "once"; Team "per seat").
- Team only:
  - a seat `Stepper`: min and max from data, 44px buttons, `inputmode="numeric"`
  - a live total line "{seats} seats · ${total} / year" (`aria-live="polite"`, height reserved)
  - "Minimum {min} seats"
- Activation line: "Up to 2 Macs" or "1 seat = 1 activated Mac".
- **Full-width `secondary` `md` purchase button.** Free gets "Download for Mac".
- `Includes`: a `small` list of paid features from data, with the check in `--accent-text`.

**Equal emphasis is deliberate:**

- No "most popular" (the spec forbids invented ones).
- No accent-filled buttons competing three abreast; the price is the focal point.
- **States:**
  - checkout loading: button busy
  - error: inline `Callout danger` under the button, with server text localized
  - unavailable plan: disabled button with the reason
- The **checkout contract is unchanged:** `POST /checkout` and `checkout_started{tier,cycle}`.
- **Below 1024** the cards stack full width. At 768 each card uses a two-column interior (price and action on the left, Includes on the right).

**PlanMatrix:**

- A DataTable with a visible caption and a sticky first column.
- Rows: each paid feature (name + a one-line `caption` explanation), Macs per license, Priority support ("Emails answered first, within one business day"), and "Everything else in the app".
- Columns: Free / Starter / Team, with `Availability` in the cells.
- A note below: the iPhone and iPad app has no paid features.

**ComparisonTable:**

- A DataTable with a visible, dated caption.
- `tbody` groups with `th colspan` group headers (Platforms, Pricing, Databases, Workflows).
- Three columns: feature, TablePro, competitor.
- Cell text first, `Availability` where binary, footnote markers to dated sources.
- Fits 343px without horizontal scroll when cells stay ≤ 3 short lines (40 / 30 / 30%).

**EngineTable** (hub):

- One table per category, each under an H2 that carries the category id from sitemap §A.3 (§8.3).
- Columns (sitemap §A.3):
  - Engine: `DatabaseMark` 24px + name, linked to its page, or to its docs page ↗ for a hub-only engine (whose row carries its own id, such as `#spanner`); a "0.77" Badge from data where it applies
  - Query language: from data (SQL, CQL, Query DSL, KafkaQL…)
  - Driver: "Built in" / "Downloads when you first connect"
  - iPhone & iPad: `Availability`
  - Notes: a short limit from data
- At < 640 Query language, Driver, iPhone and Notes fold into the Engine cell as `caption` lines.

**EngineList** (home):

- A `<ul>` of featured engines in 4 columns at ≥ 1024, 3 at 768, and 2 at 375.
- Each item: mark 24px + name at 16/500, linking to its page, 48px row.
- Followed by the standalone link "Supported databases →" / "Cơ sở dữ liệu được hỗ trợ →" to `/databases`.
- Names, not counts.

**DatabaseMark:**

- The vendor mark at its original colours with no filters (no `grayscale`, `opacity`, or `invert`, which today also alter trademarks).
- In dark mode use `iconDark` from data when the vendor publishes an official variant. Otherwise render the mark on a 32px `#ffffff` tile with 6px radius.
- Two-letter monogram fallback: `mono` 13 on `--surface`, 1px `--rule`.
- Always next to the visible name; the mark is `alt=""`.

**SponsorList:**

- Section 3 on the homepage.
- An H2 in the `h3` style, then four logo links at 28px tall with gaps of 32/48px.
- Each link is named (visible name in `caption` under the logo, or `aria-label`) with `rel="sponsored noopener"`.
- Then "Sponsor TablePro ↗" (GitHub Sponsors; sitemap §D, positioning §10.2).
- Logos follow the DatabaseMark rules in dark mode.

#### 5.3.19 ProseArticle and TableOfContents

- **`text` container.** Body is `body` 16/1.6 in `--foreground`, which ends the muted article body.
- **Headings:** `h2` in the `h2` style with 48px above and 16px below; `h3` in the `h3` style with 32px above and 8px below.
- **Lists:** 24px indent and 8px item gap.
- **Blocks:** `blockquote` with a 3px `--rule-strong` edge and `--foreground` (not italic). Tables use DataTable styling inside a scroll region. Code uses CodeBlock styling with Phiki colours.
- **Figures** are `AssetSlot`s with `figcaption` at `caption` size in `--muted-foreground`, left-aligned and not italic.
- **Heading permalinks:**
  - The `#` glyph sits in a sibling `<a aria-label="Link to this section">` *after* the heading text, outside the heading element's accessible name (the old site announced headings such as "One session, the whole window#").
  - Visible on hover or focus of the heading block. On touch it stays visible at `--muted-foreground`.
- **TableOfContents:**
  - At ≥ 1280: a sticky column (cols 1–3, top 96px) with `small` links. The current section is marked with `--foreground` + `aria-current="location"` + a 2px `--accent-indicator` bar.
  - Below 1280: a `Disclosure` "On this page" / "Trên trang này" above the article.

#### 5.3.20 Forms, Dialog, Toast, EmptyState, NoticePage (shared)

**Field:**

- Label at 14/500 `--foreground`, 6px above the control.
- Help text `small` `--muted-foreground` below. The error replaces the help text.
- Required fields get the label suffix "(required)" / "(bắt buộc)". Optional fields stay unmarked.

**Input and Select:**

- 40px tall, `--raised` fill, 1px `--rule-strong` (≥ 3:1), 8px radius, 12px padding-x, 16px text (16px also prevents iOS zoom).
- Placeholder text is `--muted-foreground` and never replaces the label.
- Select is the native `<select>` with a custom chevron.

**Checkbox and radio:** native, 16px, `accent-color: var(--accent-indicator)`. The browser picks the contrasting mark.

**Stepper:**

- `−` / input / `+` with 44px buttons on touch and 40px elsewhere.
- Bounds come from data. A button is disabled at its bound, with the reason in help text.

**Dialog:**

- Native `<dialog>` with `showModal()`: `--raised`, 12px radius, max-width 480px, 24px padding, `--overlay` backdrop.
- Title in the `h3` style (`h2` element). Body `small` `--foreground`, with a consequence list where actions cascade ("2 machines will be signed out").
- Actions are right-aligned: **Cancel** (`quiet`, default focus on destructive dialogs), then **confirm** (`danger` or `primary`).
- Below 480 the actions stack full width in the same order.
- Escape cancels. The confirm button shows a busy state; on error the dialog stays open with an inline `Callout danger`.

**Toast:**

- `sonner` at top-centre: `--raised`, `--shadow-overlay`, `small` text.
- Success confirmations only (flash `success`). Errors that need action render as an inline `Callout`, never toast-only.

**EmptyState:**

- 40px vertical padding, centred within its panel.
- Title in the `h3` style, one `small` muted sentence, at most one action. No illustration.

**NoticePage:**

- `narrow` container, left-aligned, top padding as page top.
- Optional status line: an icon in the status colour + a `caption` muted word ("404", "Confirmed").
- An H1 in the `h1` style, a `body` paragraph, an optional `Card` with steps, then actions (a `primary` and a `standalone` link).
- Header and footer stay present.

### 5.4 Account application layout (license repo)

**Same system, different frame.** The account app follows this document's tokens, type and component specs, so `Button`, `Field`, `Badge`, `DataTable`, `Dialog`, `CopyButton`, `Callout` and the rest look and behave as they do on the public site. Architecture §3's list decides which files are byte-identical copies (§9):
- always: the tokens, fonts, the theme script and `ThemeControl`, and `ConsentBar` with its consent and Crisp helpers;
- where their imports resolve in both repos without a dependency change: the UI primitives (`Button`, `Field`, `Dialog`, `DataTable` and the rest).

The site chrome and the `LanguageSwitcher` are always the license repo's own files, built to the same spec. Spec §9 allows task-specific navigation in application screens.

**Two shells, never the public header or footer:**

- **Account shell** (signed-in screens): the AccountBar, the section rail, and a slim footer inside the work column.
- **Transactional shell** (sign-in, thank-you, newsletter and error pages): a slim header (logo → public home in the current locale; Download → public `/download`; Account or Sign in; LanguageSwitcher; ThemeControl) and the same slim footer.
- The slim footer is one row of links, then the FooterBar the public footer ends on (§5.3.17): the mark, the copyright, the language menu and the theme.

```
┌ AccountBar · 56px · sticky · --background · 1px --rule bottom ──────────────────────────────┐
│ [logo] TablePro  /  Account          ◎ English ▾   ◐ ▾   you@example.com   [Sign out] quiet │
├ rail 208px (≥1024) ─────┬ work column · max 960 · padding 32 ──────────────────────────────┤
│                         │                                                                   │
│  Overview         ▌     │  H1 (h2 style)                         [screen actions]           │
│  Machines               │  one-line description (small, muted)                             │
│  Team        (team only)│  ─────────────────────────────────────────────────────────────── │
│  Library     (team only)│  Card / DataTable / EmptyState …                                 │
│                         │                                                                   │
│                         │  ─────────────────────────────────────────────────────────────── │
│                         │  footer (small, muted): Back to tablepro.app · Documentation ↗ ·  │
│                         │  Contact · Chat · Privacy · Terms · Refund policy · Cookie settings│
└─────────────────────────┴───────────────────────────────────────────────────────────────────┘
```

Rail labels, their order and the footer links belong to the license repository; this sketch shows only their layout.

**AccountBar:**

- The logo returns to the public home (a plain `<a>` to `/` or `/vi` per the account locale).
- The email is `small` `--muted-foreground`, truncated with `title` (ASCII only) and hidden below 640.
- **Sign out** is a POST.

**Rail (≥ 1024):**

- Links at 14/500, 40px rows.
- Current: `--foreground` on `--accent-subtle`, with a 2px `--accent-indicator` bar on the left and `aria-current="page"`.
- Others: `--muted-foreground`, `--foreground` on hover.
- The team-only items appear only when the account owns a Team license.

**Footer** (both shells): one `small` `--muted-foreground` row of links under a 1px `--rule`, inside the work column (account shell) or the `narrow` column (transactional shell). "Cookie settings" is a `quiet` `sm` button that reopens the consent bar. Public targets are locale-aware plain `<a>`s.

**Below 1024:**

- The rail becomes a horizontally scrollable tab strip under the AccountBar: 44px, 2px `--accent-indicator` underline on the current item.
- The footer stays at the end of the work column.

**Screen header:**

- An H1 in the `h2` style, a description and right-aligned actions, separated from content by a 1px `--rule`.
- The mono eyebrow `SectionLabel` is dropped.

**Feedback:**

- Every mutation still redirects to a named route.
- Flash success → Toast. Flash error → `Callout danger` at the top of the work column, and also a toast for screen-reader announcement.

**Sign-in, thank-you, newsletter and error pages** are not account screens. They use the transactional shell above, not the public SiteHeader and SiteFooter. The public header links through Inertia's `LocaleLink`, which must never run in the license app, and the license repo's old copies of the marketing header, footer and mobile nav are deleted. Continuity with tablepro.app comes from the shared tokens, type, logo and theme, not from shared chrome.

---

## 6. AssetSlot (placeholder) specification

**One contract, three owners.** Each part of the slot contract has exactly one owner, so the documents cannot drift apart again:

| Part | Owner |
|---|---|
| Asset IDs, the page and section that use each one, and the short EN/VI descriptions | sitemap §A.8 (the ID catalogue) |
| The manifest file, its fields, the component's props and render modes, the handoff generator and the tests | architecture §1.9 (the schema) |
| The visual values the manifest's `kinds` pin (aspect, rendered sizes, export pixels), the type vocabulary and its visible labels, the description limits and the placeholder's look | **this section** |
| Production briefs: scene, dataset, framing, light and dark, a Vietnamese summary | `docs/visual-assets.md`, generated from the manifest and the per-family fragments (architecture §1.9) |

Sitemap §A.8's Aspect and Type columns are superseded by §6.2 and §6.3, as architecture §1.9 already states.

### 6.1 Data

**One manifest per owning app** (spec §9.1): `resources/data/assets.json` in the public repo, with the schema in architecture §1.9. The license app has no editorial slot at launch (sitemap §A.8 lists none), so it has no manifest; if one appears, it gets the same file and schema, and `asset-slot.tsx` joins the shared files (§9).

The file has two parts:

- **`kinds`** state geometry and export rules once per kind. Their values are §6.3's, and architecture's `AssetManifestTest` pins them, so a change here needs a deliberate edit to both.
- **`assets`** hold one entry per sitemap §A.8 ID.

The fields that affect what a visitor sees (names exactly as in architecture §1.9):

| Field | Value | Visual effect |
|---|---|---|
| `kind` | `window`, `mobile-crop`, `detail`, `phone`, `ipad`, `diagram`, `illustration`, `figure`, `og-card` | Geometry from §6.3 |
| `type` | One of the §6.2 types, equal to the kind's type (a `figure` takes the type of its source image) | The visible type label and icon |
| `aspect` | `null` (the kind's), or an override on a 1:1 `mobile-crop` or a `figure` only | Reserves the box before and after supply |
| `priority` | Boolean, `true` only for `mac-hero-window` and its crop | Eager loading and a head preload once supplied |
| `theme` | `both` or `single` | Two class-switched pictures, or one (§7.3) |
| `locale` | `shared` or `per-locale` | One capture for both sites, or one per locale |
| `mobile` | Another ID, or `null` | The crop shown below 768px (§6.3) |
| `description` | `{en, vi}`, at most **160 characters in English and 200 in Vietnamese** (§6.2) | The visible brief in placeholder mode |
| `alt`, `caption` | `{en, vi}` (`caption` may be `null`) | Supplied mode only |
| `usedOn` | `[{path, section}]`, for example `{ "path": "/features/querying", "section": "editor" }` | Mirrors sitemap §A.8's "Used on" column |
| `status` | `placeholder` or `supplied` | The only render switch |
| `src` | `null`, or the supplied sources | Supplied mode only |

Handoff-only fields (`family`, `ownerRepo`, `slot`, `handoffPriority`, `replacement`, `legacySource`) are defined in architecture §1.9 and change nothing on the page.

`sizes` comes from the kind. A component passes its own `sizes` prop only when the slot sits in a narrower column, and then the value is the slot's real width (the old hero passed breakpoints instead).

### 6.2 Visual (placeholder mode)

```
╭╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╮
╎                                                                          ╎
╎            ▣  Screenshot placeholder   mac-hero-window                   ╎
╎                                                                          ╎
╎            TablePro on Mac with the shop sample database (PostgreSQL):   ╎
╎            the orders table, a query in the editor and its results.      ╎
╎                                                                          ╎
╰╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╯
  aspect-ratio from the kind · --surface fill · 1px dashed --rule-strong · radius 12
```

**Box:**

- Fill `--surface`; border 1px **dashed** `--rule-strong` (3.40–3.84:1 against the slot and the page, both themes); 12px radius.
- `aspect-ratio` from the kind (or the entry's override), with `width: 100%`.
- No shadow, no gradient, no grid pattern, no window frame, no fake content.
- The dashed edge is the one signal that separates a slot from a supplied image; supplied images are never dashed.

**Content block:**

- Centred in the box both ways, max-width 52ch, text left-aligned, padding 24px (16px below 640). Lines from top to bottom:
  1. **Type row:** the type's 16px lucide icon (from the type table below) in `--muted-foreground`, then the **type label** in `label` 14/500 `--foreground`, then the **asset ID** in `mono` 12px `--muted-foreground`. The row wraps at narrow widths, ID last. The ID may break anywhere (`overflow-wrap: anywhere`) and is never truncated.
  2. **Description:** `small` 14/1.55 (1.6 in Vietnamese) in `--muted-foreground` (5.61 / 7.12 on `--surface`).
- Nothing is uppercase, tracked or truncated.

**Type vocabulary and labels.** One vocabulary serves the manifest's `type`, the handoff and the visible label. The labels live in the `assets` UI catalog (architecture §1.4), never in the manifest. The Vietnamese suffix "(sẽ bổ sung)" is the glossary's (positioning §11.4: "Screenshot placeholder · {id}" / "Ảnh chụp màn hình (sẽ bổ sung) · {id}"). The earlier "(giữ chỗ)" and "(chờ ảnh thật)" are retired.

| `type` | Kinds | Sitemap §A.8 Type | Icon (lucide) | Label EN | Label VI |
|---|---|---|---|---|---|
| `screenshot` | `window` | screenshot | `image` | Screenshot placeholder | Ảnh chụp màn hình (sẽ bổ sung) |
| `detail` | `detail`, `mobile-crop` | crop | `crop` | Detail crop placeholder | Ảnh cắt chi tiết (sẽ bổ sung) |
| `screenshot-phone` | `phone` | iPhone | `smartphone` | iPhone screenshot placeholder | Ảnh chụp iPhone (sẽ bổ sung) |
| `screenshot-ipad` | `ipad` | iPad | `tablet` | iPad screenshot placeholder | Ảnh chụp iPad (sẽ bổ sung) |
| `diagram` | `diagram` | diagram | `workflow` | Diagram placeholder | Sơ đồ (sẽ bổ sung) |
| `illustration` | `illustration` | composite | `shapes` | Illustration placeholder | Hình minh họa (sẽ bổ sung) |

- **Release-post figures** (`figure`, `blog-{slug}-{n}`) take `screenshot` or `detail`, matching the existing source image.
- **`og-card` entries** (`slot: false`) are handoff-only bespoke social art. The live cards come from `og:generate`, so these entries never render in an `AssetSlot`.

**Description length: at most 160 characters in English and 200 in Vietnamese.** Architecture §1.9's test enforces the limits, and Vietnamese gets more room because it runs longer for the same content. Today's sitemap §A.8 descriptions reach 116 and 115 characters. Measured with Inter's advance widths:

- **Smallest landscape box: a 16:9 slot at 343 × 193**, a window still awaiting its crop or a diagram. Inside 16px padding it leaves 311 × 161.
  - 160 English characters wrap to 4 lines (87px at line-height 1.55).
  - 200 Vietnamese characters wrap to 5 lines (112px at 1.6).
  - The type row takes about 40px: the longest label, "Ảnh chụp màn hình (sẽ bổ sung)" at 238px with its icon, fits on one line, and the longest ID (`mac-server-dashboard-postgresql`, 223px) wraps under it. The gap adds 8px.
  - Total: about 135px in English and **160px of 161 in Vietnamese** at the limit.
- **Phone slot: 240 × 520, 208px of text width.**
  - The Vietnamese iPhone label (223px with its icon) wraps to two lines.
  - 200 Vietnamese characters take 7 lines (157px), about 225px in all.
- **Overflow.** The box keeps `min-height: auto`, so an overlong string grows the box and is never clipped.

**Markup and accessibility** (architecture §1.9):

- `<figure data-asset-id="…" data-asset-status="placeholder">` holding `<div role="img" aria-label="{type label}: {description}">`, whose visible children are `aria-hidden="true"`.
- The ID is not in the accessible name; it is for whoever supplies the image.
- No `<img>`, no `background-image` and no request of any kind in placeholder mode, so there is no broken-image fetch.
- **Not in production** (decided 2026-10-08). With `APP_ENV=production` a slot with no image renders nothing: no box, no accessible name, no reserved space, for the window and its phone crop alike. The block around it becomes text only (architecture §1.9).

**Phone and iPad slots:**

- Same treatment at the device aspect (§6.3).
- iPhone slot width: 280px at ≥ 768 and 240px at 375, centred.
- No device frame drawn in HTML.

**Both themes and languages.** Every colour above is a token checked in §2.3. Labels and descriptions come from the locale. Neither theme needs special handling.

### 6.3 Geometry and export sizes

**The full Mac window is 16:9.** The capture recipe in `docs/screenshots.md` sizes the window to exactly 1216 × 684 pt on a 2× display (`set size of front window to {1216, 684}`, then `screencapture -w -o`). That gives a 2432 × 1368 px file, which a 1216px slot shows 1:1 on a retina screen. Sitemap §A.8's 16:10 would need a 1216 × 760 pt window and would not match the recipe.

The files on disk today predate that recipe: 3024 × 1722 PNG sources, served as 1216 × 693 and 2432 × 1385 WebP. Their ratio is 1.756, which is 1.2% from 16:9.

These are the values that architecture's `kinds` pin:

| Kind | Aspect | Rendered CSS px: 1280 / 768 / 375 | Export |
|---|---|---|---|
| `window` | 16:9 | 1216 × 684 / 720 × 405 / its `mobile` crop (placeholder fallback 343 × 193) | **2432 × 1368** (2×) |
| `mobile-crop` | 4:5 (1:1 allowed) | shown only below 768: 343 × 429, centred, never stretched | 686 × 858, cut at native pixels from the 2× capture of the entry that names it |
| `detail` (cols 6–12 beside text) | **4:3** | 696 × 522 / 720 × 540 / 343 × 257 | 1392 × 1044 (2×) |
| `phone` | 9:19.5 | 280 × 607 / 280 × 607 / 240 × 520 | Native capture (1179 × 2556 on a 6.1-inch iPhone) |
| `ipad` | 4:3 | usually cols 2–11, 1008 × 756 (max 1216 × 912) / 720 × 540 / 343 × 257 | Native landscape capture (a 13-inch iPad is 4:3: 2732 × 2048 or 2752 × 2064) |
| `diagram` | 16:9 | as `window`; drawn to read at 343 wide | Vector (SVG) |
| `illustration` (composites) | 16:9 | as `window` | 2432 × 1368 (2×) |
| `figure` (release posts) | from the source image | `text` width: 704 / 704 / 343 | 1408 wide (2×) |
| `og-card` | 1200:630 | not a slot | 1200 × 630 |

**One detail aspect.** Every detail crop is 4:3, the shape that also holds the taller subjects (forms, sheets and pickers such as `mac-fk-picker` and `mac-connection-ssh-form`). Sitemap §A.8's 3:2 rows are re-framed to 4:3. One aspect means one column height, one export size and one handoff rule.

**Phone widths never show a shrunken window.** Spec §9 asks for "useful crops and separate detail views for phones instead of shrinking a full desktop window into unreadable detail". The rule:

- Every `window` that renders below 768px names a `mobile` crop: a 4:5 cut of its focal area, with its own ID and brief.
- The crop is cut from the same 2× capture, so it needs no new scene. A 686px-wide cut is a 343pt region of the window, so the Mac's own text shows at its real size on a 375 phone.
- Sitemap §A.8 defines one crop today, `mac-hero-window-mobile`. The other window rows need `{id}-mobile` entries, each a manifest edit plus its brief (architecture §1.9).
- Until a crop exists, the **placeholder** may render the 16:9 box at 343 × 193, and its text still fits (§6.2). A window **must not** reach `supplied` without its crop.
- The same holds for a `detail` and an `ipad` capture (found in review): below 768 a detail renders at 343 × 257, about half its size, and an iPad capture at about a quarter, so the focal text cannot be read. Every P1 or P2 `detail` or `ipad` entry (a page's lead or section image) names a `mobile` crop, cut the same way from its own capture; a P3 one may. An `illustration` may name one too, recomposed from the same captures. `AssetManifestTest` holds the rule.
- A crop renders at its 343px design width, centred in a wider column (a 430 phone, an iPad mini in portrait), so the Mac or iPad text keeps its real size; `kinds.mobile-crop.sizes` is `343px`.

**Art direction.** Below 768 the slot renders its `mobile` entry. In placeholder mode that is a second placeholder with its own ID and brief, swapped by CSS `display`, so only one is in the accessibility tree. Once supplied, it becomes a `<picture>` with `<source media="(min-width: 768px)">`.

### 6.4 Supplied mode

When `status` is `supplied`:

- Render `<picture>` with `<source type srcset sizes>` from `src` and the kind's `sizes` (slot widths, not breakpoints), then `<img>` with `width`, `height`, `alt` from the locale and `object-fit: contain`.
- `theme: both` renders the light and dark pictures switched by class (§7.3). `locale: per-locale` picks the page locale's sources.
- If `caption` is set, render `<figcaption>` (`caption` size, muted).
- **Hide the type label, the ID and the description** (spec §9.1).
- Priority images are eager with `fetchpriority="high"`. A separate block in `app.blade.php`, after the theme partial, preloads the variant for the *resolved* theme (architecture §1.9). All other images are `loading="lazy"`.
- The slot's geometry equals the image's geometry, so replacing a placeholder causes no layout shift.

---

## 7. Motion, focus and images

### 7.1 Motion

**Tokens.** These are kept from `app.css` and trimmed:

| Token | Value | Used for |
|---|---|---|
| `--ease-feedback` | `cubic-bezier(.25,.46,.45,.94)` | Colour and fill changes |
| `--ease-panel` | `cubic-bezier(.32,.72,0,1)` | Panels |
| `--dur-tap` | 120ms | Colour and fill on hover or press |
| `--dur-state` | 200ms | Disclosure chevron, copy confirmation |
| `--dur-panel` | 240ms | Menus, the mobile sheet and dialogs: opacity 0→1 + `translateY(4px)`→0 (dialogs scale .98→1) |

The ceiling drops from 320ms to 240ms, and `--dur-row` goes with the row bar.

**Allowed:**

- the hover and press feedback above
- menu, sheet and dialog entry and exit
- the copy-state swap
- `scroll-behavior: smooth` for in-page anchors, only under `prefers-reduced-motion: no-preference`

**Not allowed:**

- scroll-triggered reveals or parallax
- staggered entrances
- marquees, carousels or auto-advancing anything
- animated gradients or glows
- typing effects
- counters that animate numbers
- autoplay video
- hover lifts (`translateY`) or shadow blooms

**Reduced motion.** Keep the existing global block (`app.css:350-365`), including `animation-delay`, `animation-timeline` and `transition-delay`. Theme switches also suppress transitions for one frame (§2.8).

### 7.2 Focus visible and keyboard

- **The ring:** `:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }` in the base layer of both apps. It measures 4.94–9.70:1 against every ground.
- **Order:** skip link ("Skip to content" / "Chuyển đến nội dung chính", `--accent` fill, 7.42:1) → banner → header → `<main tabindex="-1">` → footer → consent bar (last in DOM).
- **Menus and dialogs:** menus close on Escape and return focus; dialogs are native modals.
- **Focus is never obscured** (WCAG 2.4.11):
  - `scroll-padding-top` clears the sticky header.
  - `scroll-padding-bottom` clears the consent bar while it is open.
- **Forced colours** (`@media (forced-colors: active)`):
  - Buttons and Badges keep a transparent 1px border, so they show as outlined.
  - The focus outline uses `Highlight`.
  - The AssetSlot dashed border uses `CanvasText`.
  - State bars use `Highlight`.
  - Nothing relies on background colour alone.
- **Print** (legal and articles): hide the header, footer, consent bar, banner and actions; text black on white; expand link URLs after external links.

### 7.3 Images in dark mode

- **The theme class decides, never the OS media query.** A themed pair renders two `<img>`s, `class="dark:hidden"` and `class="hidden dark:block"`. Non-priority images are `loading="lazy"`, so the hidden one is never fetched. The LCP image is preloaded for the resolved theme by the head script. This replaces `ThemedImage`'s `<source media="(prefers-color-scheme: dark)">`, which made the old site download both variants.
- **Mac window captures:**
  - Supply light and dark captures when the scene follows the system appearance; if only one exists, it shows in both themes.
  - They keep `.app-plate`'s drop-shadow, the dark recipe included.
  - No border or radius is added, because the captures carry real transparent squircle corners.
- **Phone and iPad captures** are opaque. One asset usually serves both themes; a 1px `--rule` outline and 12% corner radius separate it from the page.
- **Never alter screenshots or vendor marks with CSS** (`invert`, `brightness`, `grayscale`, `opacity`). A screenshot must show the product as it is. Marks use `iconDark` or a light tile (§5.3.18).
- **App Store badge:** Apple's official artwork, unmodified, switched by theme class between the existing black and white variants. One badge per layout, 40px minimum height.
- **OG cards** are not page images. The `og:generate` templates adopt this palette and type, with Inter embedded and Vietnamese variants. Bespoke cards go through the asset handoff.

---

## 8. Page templates

**Conventions:**

- Desktop wireframes are drawn at 1280 (content 1216, 12 columns).
- `[Button]` marks a button. `→` marks a standalone link. `↗` marks an external link.
- `{…}` comes from data.
- `▒ slot-id` is an AssetSlot. Every ID is one from sitemap §A.8; geometry is §6.3's.
- **Structure comes from the sitemap.** Section order, section ids and slot IDs are the sitemap's (§A for pages, §D for the homepage). These sketches add layout only. Where a sketch and the sitemap differ, the sitemap wins.
- **Ids other code links to are kept**: the homepage ids and aliases of sitemap §D (`#pricing` is where the Mac app's `/?ref=…#pricing` lands), and every feature-page id in sitemap §A.2. An alias is an empty `<span id>` inside its section, with no JavaScript hop (sitemap §C.2).
- Internal links use `localePath` (§5.3.2); cross-app links are plain `<a>`.
- Link text names its destination. There is no "Learn more" (positioning §4).
- Copy in these sketches is illustrative; the content documents own the final wording.

### 8.1 Home (`/`, `/vi`)

The ten sections, their ids, aliases and slots are sitemap §D's. `HomepageRenderTest` and sitemap §G.3 pin these ids.

```
SiteHeader
§1  HERO  #top                                                      pt 72 · pb 48
    cols 1–8 │ H1 (display), ≤ 2 lines
             │ Lead (body-lg, muted, 56ch): names engines, no counts
    cells 6 │ 6 [Download for Mac] lg primary          [ App Store badge ]           (rail to rail, §4.7)
             │ macOS 13 Ventura or later ·              iPhone and iPad ·
             │ Apple silicon or Intel                   iOS and iPadOS 18 or later
             │ Other ways to install →  (/download#mac, the section holding the Homebrew command)
             │ Open source and free to use. Paid plans add optional features to the Mac app.
             │ See pricing →  (localePath('/#pricing'): /#pricing or /vi#pricing)
    cols 1–12 ▒ mac-hero-window  16:9  1216×684        (< 768: ▒ mac-hero-window-mobile  4:5)
§2  DATABASES  #databases
    H2 + lead (cols 1–7) · EngineList (featured engines as cells, 2 / 3 / 6 across; the list by category rail to rail)
    one small line: built-in drivers vs drivers downloaded on first pick · the engines that open on iPhone (names)
    Supported databases →  (/databases)
§3  SPONSORS  #sponsors                         compact · flush: the logo cells close on the next join
    H2 (h3 style) · SponsorList (the 4 verified sponsors, cells 2 × 2, four across from 768) · Sponsor TablePro ↗
§4  WORKFLOWS  #features                        H2 + lead, then five FeatureRows (H3 each) as cells, flush, in this order
    Query                                  ▒ mac-query-autocomplete      window row   Querying →
    Edit data                              ▒ mac-edit-preview-sql        window row   Data editing →
    Schemas and sync (Compare & Sync: Starter)  ▒ mac-compare-sync-structure  window row   Schema →
    Files                                  ▒ mac-data-files-window       window row   Import & export →
    Connect                                ▒ mac-connection-ssh-form     detail row   Connections →
§5  PRODUCTION SAFETY  #safety
    H2, detail-row layout as two cells, flush: Safe Mode levels named · DROP, TRUNCATE and WHERE-less DELETE always ask · Read-Only · Touch ID
                · Agent mode raises the floor          ▒ mac-safe-mode-touchid (4:3)    Safe Mode →
§6  AI AND MCP  #ai   (alias #mcp)
    H2, window-row layout: providers named · Agent mode · local MCP server, off by default · permission layers in one line · free
                                                       ▒ mac-ai-chat                    AI & MCP →
§7  MAC, IPHONE AND IPAD  #platforms   (alias #mobile)       tone: surface (the page's one band) · cells, flush
    cols 1–6  PlatformCard Mac: the full workbench · requirement · [Download for Mac] secondary
    cols 7–12 PlatformCard iPhone and iPad: browse, edit, query and SSH on the go · free · App Store badge + caption
              ▒ ios-connection-list (280 wide, 9:19.5) · TablePro for iPhone and iPad →
    one line on iCloud Sync and Handoff (Starter on the Mac) · Sync & teams →
§8  COMING FROM ANOTHER APP  #switch   (alias #compare)
    text at text width: importers named (passwords where true) · Open Project Folder
    Compare TablePro with other clients →  (/compare)
§9  PRICING  #pricing   (alias #license)
    H2 + lead (free core · optional paid features on Mac · open source) · BillingCycleControl + caption
    PricingCard ×3 as joined cells (compact: no Includes list) · Compare plans →  (/pricing) · Prices in USD … line
§10 OPEN SOURCE AND GET STARTED  #open-source                 background, not surface
    AGPLv3 · View on GitHub ↗ · one sentence on how the project is funded
    PlatformActions as cells, flush on the footer's rule: [Download for Mac] primary + AvailabilityLine · App Store badge + AvailabilityLine
SiteFooter
```

**FeatureRow** has two layouts:

- **Window row:** H3, 2–3 sentences, the tier marker from `pricing.json` and the link in cols 1–6, then the 16:9 slot full width below.
- **Detail row:** text in cols 1–5 and the 4:3 slot in cols 6–12.

Its link is a standalone link whose text is the destination page's name in the Features menu (sitemap §B.1), for example "Querying →". Never "Learn more".

**One primary button per region:** the hero's Download and the final band's Download. The §7 Mac card uses `secondary`.

- **375:**
  - The hero stacks; each action keeps its caption.
  - The hero slot uses its mobile crop.
  - EngineList in 2 columns; sponsors 2 × 2. No rails: cells run to the screen edge and only horizontals remain.
  - FeatureRows stack text, then slot. Window slots show their `mobile` crops (§6.3).
  - The platform cards stack, with the phone slot 240 wide.
  - Pricing cards stack.
- **Sponsors stays third** (spec §0).

### 8.2 Feature page (`/features/{slug}`, `/vi/…`)

```
Breadcrumbs  Features / {Feature}
PageHeader   H1 · lead (2 sentences) · Badges: {platforms} {tier} from data · [Download for Mac] secondary · Read the docs ↗
Sections     one per sub-workflow, in sitemap §A.2's order and with its ids (#editor, #history, #performance …):
             H2 · 2–4 sentences at text width · tier marker · "0.77" label from data
             · at most one ▒ slot, taken from sitemap §A.2's Slots column in section order:
               a window (16:9) full width below its text; a detail (4:3) in cols 6–12 beside it
Section      On iPhone and iPad  #iphone   (or a plain "not on iPhone or iPad")
DataTable    Where it works: rows Mac / iPhone and iPad × cols Free · Starter · Team  (sr-only caption)
Callout note Limits that change a decision, from data
Related      3 standalone links named after their pages (no cards)
DownloadBand
```

There is **no page-level overview slot**. The first section's slot is the page's lead image, so every image shows one named workflow (sitemap §E.4: "at most one slot" per section).

### 8.3 Database hub (`/databases`)

```
PageHeader   H1 · intro (native drivers in one app; a few engines named)
Jump links   one per category, in sitemap §A.3's order and ids:
             #relational · #analytical · #cloud · #document · #key-value · #wide-column · #search · #streaming · #coordination · #files
             (labels from the catalog, for example Relational · Analytical and warehouse · Cloud and serverless · Document ·
              Key-value · Wide-column · Search and vector · Streaming · Coordination · Files; membership from engines.json `category`)
per category H2 carrying that id · EngineTable [Engine (mark + name → page, or docs ↗) | Query language | Driver | iPhone & iPad | Notes]
             hub-only engines keep their own row ids (#spanner, #sap-hana …)
#drivers     text cols 1–5: how drivers are delivered (built in vs downloaded on first pick, signature check,
             plugins update separately, a network connection for a first install) │ ▒ mac-engine-picker (4:3) cols 6–12
Section      iPhone and iPad engines (names only)
Line         No engine needs a license
Section      Missing your database? → GitHub request form ↗
Read the docs ↗
DownloadBand
```

At 375, EngineTable folds Query language, Driver, iPhone and Notes into the Engine cell. Other pages link these ids directly (for example `/databases#wide-column` from the Cassandra page and `#streaming` from the Kafka page), so a category never loses its id even when it holds one engine.

### 8.4 Database page (`/{engine}-client` and the like; `/vi/…`)

```
Breadcrumbs  Databases / {Engine}
cols 1–8:  [mark 40] H1 · lead (1–2 sentences) · AvailabilityLine (platforms · driver delivery · "0.77" where it applies)
           [Download for Mac] primary · App Store badge only if the engine opens on iPhone · Setup guide ↗
cols 9–12: Card "Facts" → DescriptionList { Query language · Driver · Connect with · Minimum version · iPhone and iPad }
▒ lead slot  the first ID in sitemap §A.3's Slots column for this page (engine-specific; never shared across engines)
             a window renders cols 1–12 at 16:9; a detail renders cols 1–7 at 4:3
Sections     sitemap §E.1's order: Connect · Work with the data · Schema · Operate · Move data · iPhone and iPad
             · further sitemap §A.3 slots, one per section at most, as detail rows (cols 6–12)
             · the query surface named as the engine has it (SQL, Redis commands, Query DSL…)
Callout note Limits, from engines.json `limits[]`
Family       #mariadb, #cockroachdb … sections, on merged pages only
Section      Other tools (optional, dated)
FaqList      2–4, optional
Related      feature pages, comparisons, docs ↗ (standalone links)
DownloadBand
```

**The "Minimum version" row** shows the engine's recorded server version floor from `engines.json` with its marker, as sitemap §E.1 requires: "enforced" when the app refuses older servers (Oracle 10g, for example), "documented" when the floor comes from documentation (MySQL 5.7, for example). The row is left out when the engine has no recorded floor. The site never says "tested": there is no test evidence for any engine version.

At 375 the Facts card moves under the lead, before the slot.

### 8.5 Comparison (`/compare/{competitor}`; the hub is a plain list of rows)

```
Breadcrumbs  Compare / TablePro vs {X}
PageHeader   H1 · lead · meta "Updated {date} · Sources below"
cols 1–6: H2 "Choose TablePro if…" list   │  cols 7–12: H2 "Choose {X} if…" list      (no colour coding)
ComparisonTable  visible dated caption · groups: Platforms · Pricing · Databases · Workflows · footnote markers
Section      Where {X} is stronger · Where TablePro is limited   (both prose, text width)
Section      Switching notes (only verified steps)
Footnote     Sources, numbered, each with its access date
FaqList · DownloadBand
```

No competitor screenshots and no benchmark numbers. A Download CTA sits in the PageHeader actions; the old comparison pages had none.

### 8.6 Pricing (`/pricing`; the homepage `#pricing` section stays)

Sections and ids follow sitemap §A.1.

```
PageHeader    H1 "Pricing" · one line from data: the Mac app is free; a paid plan adds features to the Mac app; the iPhone and iPad app is free
#plans        BillingCycleControl (Monthly | Yearly | Lifetime) + caption (computed saving / one payment)
              PricingCard ×3  Free · Starter · Team   (cols 4/4/4, equal emphasis)
              Line (small, muted)  Prices in USD. Polar is the merchant of record and handles tax and receipts.
#features     H2 "What a paid plan adds" / "Gói trả phí bổ sung những gì"   (positioning's wording)
              PlanMatrix  visible caption · each paid feature (linked to its feature-page anchor) + Macs + Priority support
                          + "Everything else in the app"
              Note        The iPhone and iPad app has no paid features.
              Each topic below is a Section of its own at `text` width, separated by the frame's joins (§4.7);
              its DescriptionList and FaqList rows run from rail to rail.
#license      How licenses work (prose from licensing facts, including what happens when a subscription ends)
#billing      Polar, USD, tax and receipts; "Billing & invoices" in Account for Polar purchases
#refunds      7 days on every plan → Refund policy
#team         Seats (1 seat = 1 activated Mac; min and max from data), invites, Priority support
#open-source  AGPLv3; source builds gate the same features
#faq          FaqList, licensing subset, incl. Lost your license key? → /account?locale={locale}
```

The `#features` heading and the intro say "adds" / "bổ sung", never "unlock" (positioning §12, spec §9). The exact strings are positioning's; this sketch quotes its current proposal.

- Below 1024 the cards stack.
- At 375, PlanMatrix keeps 4 columns with a sticky first column. The three value columns hold only glyphs, so it fits in 343.
- No currency conversion, no PPP and no bank transfer anywhere.

### 8.7 Download (`/download`)

Sections and ids follow sitemap §A.1. The `#mac` card holds the other ways to install, which is where positioning §3.2's "Other ways to install" link lands.

```
PageHeader (utility)  H1 · current release: v{ver} · {date} · Release notes ↗     (never "your download is starting")
┌ PlatformCard Mac  #mac · cols 1–7 ──────────────────┐ ┌ PlatformCard iPhone & iPad  #ios · cols 8–12 ┐
│ H2 Mac                     Badge v{ver} · {date}     │ │ H2 iPhone and iPad                            │
│ Requires macOS 13 Ventura or later                   │ │ Requires iOS and iPadOS 18 or later           │
│ [Download for Apple silicon]  lg primary             │ │ [ App Store badge ]                           │
│ [Download for Intel]          lg secondary           │ │ Free · no in-app purchases                    │
│ ▸ Which Mac do I have?  (Disclosure)                 │ │ TablePro for iPhone and iPad →                │
│ ── Other ways to install (h3 style) ──               │ │                                               │
│ Homebrew  CodeBlock(command) brew install --cask … ⧉ │ │                                               │
│           (no version beside the command)            │ │                                               │
│ Callout warning while the cask lags (from data)      │ │                                               │
│ GitHub Releases ↗ · Build from source (AGPLv3) ↗     │ │                                               │
└──────────────────────────────────────────────────────┘ └───────────────────────────────────────────────┘
The two platforms are cells of one CellGrid between two joins, so neither draws a box; the Mac cell's "Other ways to install"
rule runs from wall to wall. Each topic below is a Section of its own at `text` width, behind a join (§4.7).
#install          Install and first run: ordered list (drag to Applications; notarized; drivers download the first time
                  you pick an engine, which needs a network; the sample database)
#updates          Daily check; the Settings toggle
#other-platforms  Windows and Linux are not available; no date
#older-versions   Older versions and release notes
```

- **No screenshot**, as on the reference download pages.
- **No auto-download**, and an iPhone user agent is never detected as a Mac.
- Both arch links are server-rendered. The UA-CH hint only swaps which of the two is `primary`; the sizes are identical, so there is no CLS.
- On an iPhone or iPad UA, both Mac buttons become `secondary`, which leaves the App Store badge as the strongest action, again with no layout change.
- If the release API fails, the links fall back to GitHub `releases/latest` (server-rendered).

### 8.8 iPhone & iPad (`/ios`)

Sections, ids and slots follow sitemap §A.1 and §A.8.

```
PageHeader   H1 · lead (scope: a separate app designed for the phone and tablet, not a copy of the Mac app)
             [ App Store badge ] + AvailabilityLine (requirement · free, no in-app purchases)
             ▒ ios-connection-list (phone, 280) │ ▒ ipad-table-browse (4:3)
Rows         one capability each, in order: #databases · #browse · #query · #security · #safe-mode · #ipad · #mac · #automation
             phone rows: text cols 1–6 │ ▒ phone (280) cols 8–10      iPad rows: text, then ▒ 4:3 cols 2–11 below
             (slots from sitemap §A.8: ios-table-browse, ios-row-edit, ios-query, ios-live-activity, ios-connection-form,
              ios-safe-mode-confirm, ipad-two-windows, diagram-icloud-sync, mac-handoff-ios, ios-widgets, ios-shortcuts-add-rows)
#limits      Not on iPhone and iPad (list or DataTable from data)
#privacy     Share Usage Data is off by default; what is sent · ▒ ios-settings-privacy
Get it       App Store badge + a short FAQ
DownloadBand (App Store first on this page)
```

At 375 the phone slot (240) sits above its text.

### 8.9 Blog index (`/blog`, `/vi/blog`)

```
PageHeader   H1 · one line: release announcements; every version's notes are in the docs changelog ↗
List         opens on the frame's join; per post, newest first, one row from rail to rail (§4.7): <time> (caption) in its
             own column from 768 · H2 (h3 style) title link · description (small, muted, ≤ 200 chars) at the reading measure
             /vi/blog: a Vietnamese intro saying the posts are in English; each entry lang="en", Badge "tiếng Anh",
             link to /blog/{slug} hreflang="en"
Newsletter   inline signup (newsletter_signup_clicked{source:'blog'})
```

- **No filter and no per-post type badge.** Every retained post is a release post (sitemap decision 5 merges all four guides away), so a "Guides" filter would lead nowhere and a "Release" badge on every row says nothing. Add both only when a second kind of post exists.
- No thumbnails, so the index carries no wall of placeholders.
- Pagination appears only past 20 posts.

### 8.10 Blog post (`/blog/{slug}`, English only)

```
Breadcrumbs  Blog / {title}
Header (text width)  H1 · meta: <time> (the original datePublished)
Callout note         the dated archive note from the template ("Describes TablePro 0.74 as released on …; see Features for
                     today's app"), plus an editor's correction only where a claim was never true (sitemap §E.6)
ProseArticle         paragraphs · H2/H3 · CodeBlocks · tables · ▒ blog-{slug}-{n} (one ID per figure) · Callouts
                     ≥ 1280 and > 4 H2s: TableOfContents in cols 10–12
End                  two blocks after the article, each behind a join (§4.7): the current CTA from platforms.json
                     (one-line download prompt with a secondary button) · #related: Related posts (3 rows, rail to rail)
```

Release posts keep their original dates and meaning. They have no `/vi` URL: `/vi/blog/{slug}` is a 404 that links the English post (sitemap §A.7).

### 8.11 Legal (`/privacy`, `/terms`, `/refund-policy`, and `/vi/…`)

```
PageHeader (utility)  H1 · meta "Last updated {date}"
/vi only              Callout note: the Vietnamese text is a translation; the English version prevails · link to English
≥ 1280                TableOfContents cols 1–3 (sticky) │ ProseArticle cols 4–10
< 1280                Disclosure "On this page" above the article
Privacy               "Cookie settings" secondary button inside the cookies section
End                   Contact line (hello@tablepro.app)
```

Print styles apply.

### 8.12 FAQ (`/faq`)

```
PageHeader   H1 · lead · jump links: sitemap §A.1's categories and ids: #general · #platforms · #databases · #licensing ·
             #privacy · #account · #switching
per group    one row of two cells (§4.7): H2 in cols 1–4 (sticky from 1024) │ FaqList in cols 5–12, rows from the cell
             divider to the rail (questions h3, answers visible). Below 1024 the heading cell stacks above its questions
Callout note a block of its own: Didn't find it? Email us · Live chat (loads only when clicked)
```

### 8.13 404 and 410 (both apps)

```
SiteHeader   (public) · the transactional shell's header (license app, §5.4)
NoticePage   caption "404" · H1 "Page not found" · one sentence · links (public): Home · Features · Databases · Download · Blog
             (/vi/* paths render Vietnamese with /vi links; HTTP 404 or 410)
SiteFooter   (public) · the transactional shell's footer (license app)
```

No illustration and no search. The account app's stock Laravel pages are replaced by the same NoticePage layout inside its own shells, with the statuses, copy and actions the license repository defines.

### 8.14 Account: Overview (`/account`)

```
AccountBar · rail (Overview current)
H1 Overview · "Licenses registered to {email}."
Card per license
  header: {Tier} · {cycle}                                   StatusBadge ● Active
  DescriptionList
    License key   [mono key]  [Copy]  [Rotate key…] secondary → Dialog (consequences)
    Renews/Expires {date, locale-formatted}
    Machines      {n} of {max} in use · Manage machines →
    Billing       Billing & invoices ↗ (Polar portal, Polar-bought only) · [Cancel subscription…] quiet → Dialog
                  (cancelled: "Ends {date}" + [Resume subscription] secondary)
Card "Get the apps"   TablePro for Mac · [Download for Mac] secondary (plain <a> to the public /download in the account locale)
                      TablePro for iPhone and iPad · App Store badge · "It doesn't use a license key."
                      (no requirement line: the account app states no platform facts)
EmptyState            No licenses for {email} · Try a different email → sign out · See pricing →
```

Copy, rows and the billing states belong to the license repository; this sketch shows only their layout.

### 8.15 Account: Machines (`/account/machines`)

```
H1 Machines · description
[License selector: Select]   (only with more than one license)
DataTable (caption sr-only "Activated Macs for {key}")
  Machine │ App version │ macOS │ Last seen (relative, Intl.RelativeTimeFormat) │ [Remove…] quiet → Dialog danger
  < 640: Machine cell carries version · macOS · last seen as caption lines; action column stays
EmptyState  No Macs activated yet · open TablePro, Settings › License · [Download for Mac]
```

### 8.16 Account: Team (`/account/team`)

```
H1 Team · description (seat = one activated Mac)
Card Seats      {used} of {max} in use · Stepper (min {min}, max 200) · [Save] primary · help "Changes appear on your next invoice."
                shrinking below seats in use → Dialog danger listing machines to be signed out
Card Members    DataTable  Email │ Role │ Joined │ [Remove…]  (owner row: no action, Badge outline "Owner")
Card Pending    DataTable  Email │ Role · Badge "Pending" │ Expires │ [Cancel invitation…]
Card Invite     Field email · Select role (Member/Admin) · [Send invitation] primary
                disabled when full, with the reason as help text
```

The invitation wording says **code**, not link, because the mail carries a code.

### 8.17 Account: Library (`/account/library`)

```
H1 Library · description (published from the Mac app; removing affects every teammate)
Card Connections   list rows: name · type · host (mono) · [Remove…]
Card Queries       folder tree: Disclosure per folder (count) → query rows · [Remove…]
                   folder remove Dialog states descendant counts, "no undo"
EmptyState         Nothing shared yet · how to publish from the Mac app
```

### 8.18 Sign-in and magic-link states (`/account/login`, `/account/verify`)

```
Transactional shell (§5.4)
narrow column   H1 "Sign in to your account" · "We email you a sign-in link. There is no password."
Card            Field Email · [Email me a sign-in link] primary, full width
below           No license yet? See pricing →   (plain <a>: /#pricing or /vi#pricing)
```

| State | Rendering |
|---|---|
| Default | As above. The email field is autofocused (existing behaviour) |
| Submitting | Button busy |
| Sent | The Card content becomes: success icon + H2 (h3 style) "Check your email" · "If {email} has a license, a sign-in link is on its way. It works for 15 minutes." · `quiet` "Use a different email". The same text whether or not a license exists (anti-enumeration) |
| Link invalid or expired (from verify) | `Callout danger` above the Card: "This link is invalid or has expired. Request a new one." The form stays usable |
| Throttled | `Callout warning`: "Please wait a minute before requesting another link." |
| Validation error | Field error under the input, with `aria-invalid` |
| Session expired (419) | NoticePage: "Your session ended. Sign in again." with `[Sign in]` |

### 8.19 Thank-you (`/thank-you`)

```
Transactional shell (§5.4)
NoticePage (text width)   ✓ success · H1 per visit state
                          · a signed or provider-confirmed visit says the key is on its way
                          · a visit with no context makes no claim that a key was sent
Card "Activate it"        ordered steps: Open TablePro · Settings › License · enter the key · Activate
Get the apps              the same Mac link and App Store badge as the Overview (no requirement line)
Your key is also in your account →
Card (surface) Newsletter Checkbox consent · [Subscribe] secondary · inline result by the server's `code`
                          (subscribed / already subscribed / invalid / error)
```

### 8.20 Newsletter confirm and unsubscribe

| Page | Rendering (NoticePage) |
|---|---|
| `/newsletter/confirmed` | ✓ H1 "Subscription confirmed" · one sentence · Back to tablepro.app → |
| `?already=true` | H1 "Already confirmed" · same actions |
| `/newsletter/unsubscribe/{id}` (signed) | H1 "Unsubscribe from the newsletter?" · "Stop sending it to {email}. License and order emails are separate." · `[Unsubscribe]` primary, a form POST · Keep receiving it → |
| Already unsubscribed | H1 "You're already unsubscribed" |
| Unsubscribed (POST result) | ✓ H1 "You're unsubscribed" · "{email} won't receive the newsletter." |
| Invalid or expired signature (403) | H1 "This link isn't valid" · "Use the unsubscribe link in your most recent newsletter, or email us." |

None of these pages is indexed (`noindex`). The single robots tag comes from the page.

---

## 9. Sharing between the two repositories

There is no package and no monorepo (spec §11). **Architecture §3 is the authoritative list of shared files and their enforcement.** This section only says how the visual system splits across that list.

**1. Byte-identical files (architecture §3's list, nothing more):**

| File | What the visual system puts in it |
|---|---|
| `resources/css/tokens.css` | The §2.2 colour tokens for `:root` and `.dark`, `color-scheme`, and the type-role utilities with their `--lh-*` variables (§3.2–3.3), as architecture §3 lists. This document also places in it the radii (§4.5), the motion tokens (§7.1), the base focus ring (§7.2) and the reduced-motion block, so both apps behave identically |
| `resources/css/fonts.css` | The hand-ordered `@font-face` blocks (§3.1) |
| `resources/views/partials/head-theme.blade.php` | The §2.8 script, verbatim |
| `resources/js/lib/theme.ts` | Reading, applying and syncing the choice (§2.8) |
| `resources/js/components/shared/theme-control.tsx` | ThemeControl (§5.3.16), both variants; labels arrive as props |
| `resources/js/lib/consent.ts`, `resources/js/components/shared/consent-bar.tsx` | ConsentBar (§5.3.17); labels arrive as props |
| `resources/js/lib/crisp.ts` | Click-to-load chat |
| `resources/js/components/ui/asset-slot.tsx` | Only if the license app ever gets an editorial slot (§6.1). None at launch |
| `resources/js/components/ui/{button,text-link,container,badge,status-badge,field,select,stepper,dialog,data-table,description-list,callout,copy-button,empty-state,notice-page}.tsx` | The primitives marked **Shared\*** in §5.1, built to §5.2–§5.3. Each is shared **only where every import resolves in both repos without a dependency change**; adding a dependency to either is a separate decision. Every string arrives as a prop. `docs/shared-files.md` records the final set; a primitive that cannot be shared is rebuilt in the license repo to the same spec and listed there as an exception |

**Enforcement** is architecture §3's:

- `docs/shared-files.md` lists each path with its sha256.
- A Pest `SharedFilesTest` in each repo fails CI when a listed file changes and the list does not.
- One script, `scripts/check-shared-files.sh`, diffs the pair during integration.

The non-blocking `compare-shared-ui.sh` of an earlier draft is that same script, under that one name.

**2. Same spec, separate files.** `PageHeader`, `Card`, `Toast` and `AppStoreBadge`, plus any primitive listed as an exception, are the license repo's own files, built to §2–§5 on the shared tokens.

- They match the public site because they implement the same rules on the same `tokens.css`, not because their source is shared.
- Strings come through each app's i18n layer.
- Each repo's own tests cover its copies: contrast (§2.7), focus and states.

**3. Deliberately not shared:**

- **`SiteHeader`, `SiteFooter` and `MobileNav` are public only.** They hold each app's own link table and i18n calls. The public header links through `LocaleLink`, an Inertia `<Link>`, which must never run in the license app: cross-app links are plain `<a>`. The license app has its own account shell and transactional shell (§5.4). Its old copies of the marketing chrome are deleted.
- **`LanguageSwitcher` differs in mechanics** (§5.3.15). The public one links between locale URLs; the account one is the license repo's own (§5.4).
- **Data-bound components are public only**, because the license app has no `platforms.json` or `pricing.json`: `AvailabilityLine`, `PlatformActions`, `PlatformCard`, `PricingCard`, `PlanMatrix` and `EngineTable`.
- **The GA head block** is per repo, because the license app adds `page_location` redaction. Each repo pins the same consent order in its own test (architecture §3).

**Drift checks.** `tokens.css` is byte-identical and hash-checked, so each repo's `ColorContrastTest` parses the same values against the same §2.3 table. Visual drift in the separate files is caught at integration, with the §10 checks run on both apps.

---

## 10. Verification checklist

**Contrast.** The rewritten contrast test passes in both repos:

- every §2.3 row
- the `#777` = 4.48 sanity check
- the gamut assertion

**Widths** (375, 768, 1280, 1440) × (EN, VI) × (light, dark) for every template in §8:

- no horizontal scroll (`scrollWidth`)
- no clipped text
- the header fits at 1024 in Vietnamese (the measured sum is 946 of 960, §4.4; if the real row overflows, move the menu breakpoint to 1280)

**Vietnamese headings.** Force a 2-line wrap at display and h1 sizes with:

- "Kết nối an toàn bằng SSH và giữ query gọn gàng"
- a second line beginning "Ễ Ỗ Ấ Ẫ Ặ"

Confirm no mark touches the line above. Also check:

- buttons "Tải bản cho Apple silicon" (positioning §4)
- theme "Giao diện: Theo hệ thống"
- the nav "Cơ sở dữ liệu" and the link "Cơ sở dữ liệu được hỗ trợ →"

**Theme:**

- No flash on reload with each stored value, including a garbage value and storage throwing.
- An OS-dark visitor without a choice sees light.
- The choice carries public ↔ account in both directions.
- Only one image variant is requested per themed image.

**Keyboard and accessibility:**

- Tab through the header, menus, the segmented control, dialogs and the consent bar. Focus is always visible and never hidden under the header or consent bar.
- Forced-colours mode spot check.
- Reduced motion: no transitions.

**Layout stability:**

- CLS 0 when switching the billing cycle and changing Team seats.
- Slot geometry equals the supplied image geometry (test fixture image).

**Consent bar height** ≤ 120px at 375 × 812, ≤ 96px at 1440.

**Page frame** (§4.7), at 390, 768, 1024, 1280, 1366, 1440 and 1920:

- no horizontal scroll on any template
- both rails on the Container's outer edge, the header's stretch on the same columns
- every cell grid's outer lines on the rails from 1280, at the screen edge below
- one full-bleed join per block boundary, none doubled by a block's own rule
- two marks on every join and on the footer's rule, none on a cell or list line, none overhanging the screen
- an anchor jump shows one line under the header, not two
- every list and table rule inside the frame ends on a rail or a cell wall, or sits inside a card (`PageFrameTest`)
- checked again with the Crisp launcher loaded, in Safari and Firefox

**Homepage and links:**

- `/` and `/vi` render sitemap §D's ten section ids in order, Sponsors third, and every alias (`#mcp`, `#mobile`, `#compare`, `#license`) scrolls to its section.
- "See pricing" resolves to `/#pricing` on English pages and `/vi#pricing` on Vietnamese ones. "Other ways to install" lands on `/download#mac`, and the Homebrew command is visible in that section.
- No rendered page contains "Learn more", "All databases" or "unlock" in either language (positioning §12's guard).

**Placeholders:**

- Every AssetSlot ID resolves in the manifest and the handoff document, and every `usedOn` page renders its ID.
- Descriptions are at most 160 characters in English and 200 in Vietnamese.
- No network request for placeholder slots.
- Every window slot that renders below 768 has a `mobile` crop before it is marked `supplied` (§6.3).

**Fonts.** A Vietnamese page downloads no `latin-ext` faces (about 110 KB of fonts, against 258 KB today).

---

## 11. Objections and tensions

### 11.1 Tensions

**No decision here breaks the spec.** Seven tensions are resolved explicitly here, so that nobody resolves them silently later:

1. **Brand hue.** The light text accent changes from hue 45 to 55, and visibly so: `#ab4501`, a redder rust, becomes `#9e5209`, more amber. Spec §0 says "keep brand hue 55; only contrast and gamut may be refined", and the drift away from 55 was the deviation. All brand tokens now share hue 55.
2. **"Save 33%".** The spec forbids *inventing* savings. This one is arithmetic on published prices (33.1% Starter, 33.3% Team), so it stays, as a computed caption rather than a badge (§2.4). If the saving statement is ever dropped, the caption shows only "Billed once a year".
3. **Equal pricing emphasis.** All plan purchase buttons are `secondary`, and no card is highlighted. That follows from "no invented 'most popular'" and "do not optimize for aggressive conversion". The homepage still has exactly one primary button per region.
4. **Sponsors third.** Kept, as a compact strip between Databases and the workflow sections, so the explanation is interrupted as little as possible.
5. **Light default for OS-dark visitors.** This is a product decision (spec §0). It changes what dark-OS visitors see on first load, which is why the theme control sits in the header rather than only in the footer.
6. **Footer newsletter stats.** The design does not need `/api/newsletter/stats`. Sitemap §B.3 settles it: the footer shows no subscriber count and does not call the endpoint, whose contract stays unchanged.
7. **Grid lines and a quiet page.** The owner asked for the grid-line look (§4.7) on 2026-10-06. It stays compatible with "the page stays quiet" by being neutral, static and at `--rule` weight, by drawing structure that already exists (the column, the block boundaries, sets of like items) and by leaving prose sections unlined. A frame that needed hatching, graph paper or accent marks to be seen would break §1.1 and §1.4.

---

## Appendix A. Contrast and gamut method (reproducible)

Python, no dependencies. The same algorithm as `ColorContrastTest.php` (linear-light luminance, no double gamma), applied to the 8-bit hex each token renders as:

```python
import math
def oklch_to_linear(L, C, H):
    h = math.radians(H); a, b = C*math.cos(h), C*math.sin(h)
    l = (L + 0.3963377774*a + 0.2158037573*b)**3
    m = (L - 0.1055613458*a - 0.0638541728*b)**3
    s = (L - 0.0894841775*a - 1.2914855480*b)**3
    return (4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
            -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
            -0.0041960863*l - 0.7034186147*m + 1.7076147010*s)
def in_gamut(lin): return all(-1e-6 <= v <= 1 + 1e-6 for v in lin)
def to8(v): v = max(0, min(1, v)); return round(255*(12.92*v if v <= 0.0031308 else 1.055*v**(1/2.4) - 0.055))
def lin8(c): c /= 255; return c/12.92 if c <= 0.04045 else ((c + 0.055)/1.055)**2.4
def lum(rgb): r, g, b = (lin8(c) for c in rgb); return 0.2126*r + 0.7152*g + 0.0722*b
def ratio(a, b): la, lb = lum(a), lum(b); return (max(la, lb) + 0.05)/(min(la, lb) + 0.05)
# sanity: ratio((0x77,)*3, (0xff,)*3) == 4.48 (rounded)
```

| Check | Expected | Script |
|---|---|---|
| `#777` on `#fff` | 4.48 | 4.48 |
| `#000` on `#fff` | 21.0 | 21.0 |
| Old `--muted-foreground` | 5.49 (old site) | 5.49 |
| `--primary` on white | 2.62 | 2.62 |
| `--primary-strong` on white | 5.86 | 5.86 |
| Banner mark | 7.42 | 7.42 |
| Old "Save 33%" | 3.03 / 1.69 | 3.02 / 1.69 |

Gamut: every token in §2.2 returns all three linear channels within [0, 1]. `oklch(0.16 0.04 55)` does not (blue −0.00003), which is §2.5.
