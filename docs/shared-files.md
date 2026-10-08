# Files shared with the account app

`tablepro.app` is two applications on one origin: this repository (the public
site) and `TableProApp/license` (the account, checkout and transactional pages).
They share a theme key, a consent key and a visual system, so a set of files
must be **byte-identical in both repositories**. There is no package and no
monorepo: each file is copied, and both copies change in the same release.

This document is identical in both repositories too.

## The contract

1. Every shared file starts with a header comment naming this document:
   `Shared with TableProApp/web and TableProApp/license at <path>. Change both in
   the same release. See docs/shared-files.md.` (as a `/* */`, `{{-- --}}` or PHP
   comment, whichever the file type takes). The wording is the same in both
   repositories, because the files must be.
2. The table below lists each file with the sha256 of its current content.
   `SharedFilesTest` in each repository fails when a listed file is missing,
   lacks the header, or no longer matches its hash, and when a file carries the
   header without being listed. Updating the hash here is the reminder to make
   the same edit in the other repository.
3. `scripts/check-shared-files.sh <other-repository>` (public repository only;
   `npm run check:shared -- ../license`) diffs every pair. Run it during
   integration and before either pull request is marked ready.

Change a shared file like this: edit it in both repositories, run
`shasum -a 256 <path>`, put the new hash in this table in both repositories, and
run the diff script. A file that cannot be shared without a dependency change in
the account app (where adding a dependency is a separate decision) is rebuilt
there to the same specification instead, and listed under "Exceptions".

### What a shared file may depend on

A shared file imports only what resolves identically in both repositories with
no new dependency: `react`, `lucide-react`, `@/lib/utils` (`cn`, built on
`clsx` and `tailwind-merge`, the same file in both), and other files in this
table. It never imports `@/i18n`, `usePage` or anything else app-specific: every
string arrives as a prop, so each app passes its own words in its own language.
`SharedFilesTest` checks the imports.

## Shared files

### Foundation

| Path | sha256 | Contents |
| --- | --- | --- |
| `resources/css/tokens.css` | `aeba9a5b0dbcadc2285968462c8973217be6a03f349aa8d317f6698ccc5d6a40` | Colour tokens for light and dark, `color-scheme`, the type roles and their `--lh-*` line heights per language, radii, motion, the default border colour, the focus ring, forced colours, the ThemeControl icon and segment states, reduced motion (design-system §2–§4, §7) |
| `resources/css/fonts.css` | `1ca1fc06d1978f008deb7c1d3e0b6421d11df39732612898e8776941228be6c0` | Inter (optical size) and IBM Plex Mono 400, declared latin-ext, vietnamese, latin (architecture §1.11) |
| `resources/css/international.css` | `1d79b00ee7cf413b35cafd204a8444e97cc5e398bf34b2f4db0679fbe86c0c8c` | Native Japanese, Korean, simplified and traditional Chinese font stacks in both apps |
| `resources/views/partials/head-theme.blade.php` | `10d0c109dc1b41f732519b94fa2dfa302fab590dc80089f419b48d36a3710110` | The pre-paint theme script, verbatim from design-system §2.8: light by default, `theme` in `localStorage`, `data-theme-choice`, one `theme-color` |
| `tests/Support/vi-forbidden-variants.php` | `fcf40949323de01bed0be38a53d89256184e6c823acedfd0e0a91513690caa69` | The glossary's forbidden Vietnamese variants (sitemap §E.10), read by `Localization/ContentParityTest` here and `Localization/LangParityTest` in the account app |
| `resources/js/lib/theme.ts` | `2c8b2af95cb12329a87a11743281af2506917ccbd57cc109629b51e4505d9765` | Reading, applying and syncing the theme choice across tabs and both apps (`theme` key; `tablepro:theme-change` event) |
| `resources/js/components/shared/theme-control.tsx` | `f94cbcd17353cca13463c2cb2e81e5c13ab9ef8c041cc2770f54eec51c2256c7` | ThemeControl, `menu`, `segmented` and `icons` variants; labels arrive as props |
| `resources/js/components/shared/footer-bar.tsx` | `1757417d90c9a1816e5ec0abcecea291394e6537cc28850ab5a63970693e3e2f` | FooterBar, the last row of every page in both apps: the mark, the copyright, a slot for the app's language control and ThemeControl `icons`, kept clear of the chat launcher where chat is configured. FooterMenu, the `<details>` menu that opens upward and that each app's language switcher fills, and `FOOTER_MENU_ITEM`, the class of one of its choices |
| `resources/js/lib/consent.ts` | `1c276dfffeb65b67e01601e2d17bffeb854542573797c9c69f4bc8e21ae51aeb` | The analytics consent record (`tablepro:analytics-consent`), applying and withdrawing it, and the "Cookie settings" reopen event |
| `resources/js/components/shared/consent-bar.tsx` | `e996494849fbd6ee2ec7316eec9a580dd5fa136e2c9809f819541fba16d2dcf7` | The consent bar: one question, a privacy link, equal Allow and Decline; rendered on the server and shown by `consent-open` on `<html>`, which each app's head script sets when no answer is stored; labels and the privacy URL arrive as props; `data-consent-bar` lets the chat launcher keep clear of it |
| `resources/js/lib/crisp.ts` | `89029eb8f027e4f3ea7ceb14bddf47b246ac66a2d6713ab3b2b6176e6fe53fa6` | Chat on every page: the loader arrives after the load event and an idle moment, a chat button opens it, and the launcher hides while the consent bar covers its corner |

### UI primitives

The design-system §9 primitives. All fifteen are shared: each imports only
`react`, `lucide-react`, `@/lib/utils` and other files in this table, so each
resolves in the account app without a dependency change.

| Path | sha256 | Contents |
| --- | --- | --- |
| `resources/js/components/ui/button.tsx` | `d4dbca241cf243cb415810713dbc6ce1ea6b6f25821bc57d95d3764caecc70a7` | Button: `primary`, `secondary`, `quiet`, `danger`; `sm`, `md`, `lg`; loading, disabled, icon, `fullWidth`; `<a>` when it navigates; `buttonClasses()` |
| `resources/js/components/ui/text-link.tsx` | `e08f165a9ee91754ee937858b631a06d3024abcf9f776614164160570d12d13d` | TextLink, `inline` and `standalone`; a plain `<a>`; `textLinkClasses()` |
| `resources/js/components/ui/container.tsx` | `59ee395cd47dfc366ed2aae2f5f55c64152729067f850213ac2048edaadbf310` | Container widths `wide` (1216), `text` (704), `narrow` (576), with the 16/24/32 gutters |
| `resources/js/components/ui/badge.tsx` | `63959e47d6acff72b0dbfce4a3d2b936f66e40787e42e9e2f99ed2abb5e9a3b4` | Badge: `neutral`, `accent`, `outline`, each on its own ground |
| `resources/js/components/ui/status-badge.tsx` | `f944c3345d745e51cec837e6c3641dc2d061e136ee85921990aa262f809eeff9` | StatusBadge: a status-coloured dot and the word, passed as children |
| `resources/js/components/ui/field.tsx` | `44837a27d54d7a1c4a57f47176ad77ec0c5f7067248703e9e7154c66eb8c38dc` | Field, FieldLabel, FieldHint, FieldError, Fieldset, Input, Checkbox, `describedBy()` |
| `resources/js/components/ui/select.tsx` | `3bdd1dd4ecbf2a5990f6fe05ee98c72ff18eee770e3babce7245856238e8040e` | Select: the native `<select>` with the field chrome |
| `resources/js/components/ui/stepper.tsx` | `8007ee15158d1b1b2bc7f2bdde3c5192df1679db0793af53c7acdbd79241d136` | Stepper: minus, a numeric input, plus; bounds from data; labels as props |
| `resources/js/components/ui/dialog.tsx` | `50f529d7eef1fecaa1b0a2c147c09bc67e875b05fbba43f3dc4af208c0cf106b` | Dialog on the native `<dialog>`, and ConfirmDialog (trigger plus dialog) as the default export |
| `resources/js/components/ui/data-table.tsx` | `d448413a1e5af09ef1d01cc92d0e03133f12da5dcd72bdd922adfa317b0256b2` | DataTable: a required caption, a focusable scroll region, a sticky first column; the cell class constants |
| `resources/js/components/ui/description-list.tsx` | `d6d806f73b813e077b3dd8425d2a56e162d5512d88aa5ba73c8d4ed998263ed6` | DescriptionList and DescriptionItem (replaces Ledger) |
| `resources/js/components/ui/callout.tsx` | `7f3583e7fcc29e54c60e52a939a927e887986fbd4725f5e16c2d9d92a1f9f78b` | Callout: `note`, `success`, `warning`, `danger`; `note`, `alert` or `status` role |
| `resources/js/components/ui/copy-button.tsx` | `147a826bf16bcaf760e79809c053801d196932082c175d305425b38355cf507f` | CopyButton, `sm` and `md`; a polite live region; labels as props |
| `resources/js/components/ui/empty-state.tsx` | `b1edcad8a5368d93a4677ec8f2e827a68b37127817742d3d642ea496bfcb3bad` | EmptyState: a title, one sentence, one action |
| `resources/js/components/ui/notice-page.tsx` | `ccb2385ad844df40d910dbc81748d0d057a1db576bffb5b2dcd75664700e5c52` | NoticePage: the narrow page body for 404/410, thank-you, newsletter and error pages |

### The page frame

The grid both apps draw their pages on (design-system §4.7): rails on the wide
Container's outer edge from 1280px, a full-bleed join between every two blocks
of `<main>` with a mark where it meets a rail, cells that share one line, and
the utilities that end an inner rule on a rail or a cell wall. Shared so a
reader crossing from a public page to the account sees the lines stay put.

| Path | sha256 | Contents |
| --- | --- | --- |
| `resources/css/frame.css` | `0e4b2e3d24df72b11f6e342af09683c79aee4b2674ce30664e07335a9f893ee2` | Joins, marks, `--cell-bleed`, `.cell-grid`, `.frame-table`, `.frame-rows`, `.frame-rows-text`, `.cell-rows` and the end-of-block list rule; imported by each app's `app.css` after `tokens.css` |
| `resources/js/components/shared/frame-rails.tsx` | `5c160940a164990668b755fe6981cb0012cc3404a2e3e80a9efe5256eeeb2714` | FrameRails: the two rails, rendered over the layout root and again inside the opaque sticky header |
| `resources/js/components/ui/cell-grid.tsx` | `d3eec968285cc034e0766e7b0e0d3c0783a143268955ba80ea020005c3c8e165` | CellGrid: cells that share one 1px line, `compact` and `regular` density |

### Adopting them in the account app

The account app's own files at these paths predate the design system and have
different APIs. Copying the shared versions over them changes these call sites,
which are updated in the same change as the copies:

- Button: `ghost` becomes `quiet`; `onClick` receives the event; `loading` and
  `icon` exist; sizes are 32, 40 and 48px tall.
- Container: widths are `wide`, `text` and `narrow`. The account work column
  (960px) is the account shell's own, not a Container width.
- Badge: `primary` becomes `accent`; the default is `neutral`.
- StatusBadge: takes `status` (`success`, `warning`, `danger`, `neutral`) and the
  word as children, in the page's language. The English words are no longer
  built in.
- CopyButton: `labels` (copy, copied, `copyNamed`, failed) replaces
  `ariaLabel`, `copiedMessage` and `errorMessage`; `size` is `sm` or `md`.
- ConfirmDialog: moves from `confirm-dialog.tsx` to the default export of
  `dialog.tsx`; `confirmLabel` and `cancelLabel` are required (strings arrive as
  props); `triggerVariant` takes a Button variant.
- Field: `FieldLabel` takes `requiredLabel`; `Input` and `Checkbox` are new; the
  invalid outline is `border-danger`.
- Stepper: takes `id`, `decreaseLabel` and `increaseLabel`.
- DataTable: `captionVisible` and `stickyFirstColumn`; the column rule is the
  hairline.

### Conditional

- `resources/js/components/ui/asset-slot.tsx` joins the table only if an account
  page ever gains an editorial image slot. None does at launch.

### Not shared, on purpose

- The locale allowlist. This repository reads `resources/data/locales.json`; the
  account app mirrors it in its own config and pins the two together with a test
  fixture holding this file's content.
- The Google Analytics head block. The account app adds `page_location`
  redaction for its signed URLs. Each repository pins the same consent order in
  its own test.
- `SiteHeader`, `SiteFooter`, `MobileNav`, `SupportBanner` and the language
  switcher (`resources/js/components/site/*` here). They hold each app's own
  links and strings, the public ones link through `LocaleLink` (an Inertia
  link, which must never run in the account app), and the account switcher
  posts a form when signed in. The account app builds its own account and
  transactional shells to the same design (design-system §5.4). Both footers
  end on the shared `FooterBar`, and both switchers fill its `FooterMenu`.
- The public-only primitives, which read this site's data or locale helpers:
  `locale-link`, `breadcrumbs`, `page-header`, `section`, `card`, `disclosure`,
  `segmented-control`, `faq-list`, `code`, `kbd`, `glyph` (Availability),
  `database-mark`, `dot-list`, `prose-article` and `asset-slot`. Where the
  account app needs the same thing (a page header, a card), it builds its own
  file to the same specification (design-system §9, item 2).
- `resources/js/lib/utils.ts`. It is the same small file in both repositories
  and the shared primitives rely on its `cn`; it carries no header because it
  predates this list. Change it only together with every file above.

## Exceptions

None. Every primitive on architecture §3's conditional list is shared.
