# Files shared with tablepro-cloud

`tablepro.app` (this repository) and `account.tablepro.app` (the portal in
`TableProApp/cloud`) paint with the same design tokens and load the same chat.
The files below are **byte-identical in both repositories**. There is no
package: each file is copied, and both copies change in the same release.

The portal is another origin built on its own components (`@cloud/ui`), so it
shares nothing else: not the theme key or the consent answer (each origin keeps
its own `localStorage`, and the portal runs no Google Analytics), and not the UI
primitives, the page frame or the footer bar. Until the cutover the account app
was `TableProApp/license`, on this origin, and those files were shared with it;
they are this repository's alone now and carry no header.

## The contract

1. Every shared file starts with a one-line header comment naming both copies,
   the same in both repositories because the files must be:
   `Shared by TableProApp/web at <path here> and TableProApp/cloud at <path there>. Change both in the same release. See docs/shared-files.md in TableProApp/web.`
2. The table below lists each file with its path in each repository and the
   sha256 of its content. `SharedFilesTest` fails when a listed file is
   missing, lacks its header or no longer matches its hash, and when a file
   carries the header without being listed. Updating the hash here is the
   reminder to make the same edit in tablepro-cloud.
3. tablepro-cloud's CI diffs its copies against this repository's `main`.
4. `scripts/check-shared-files.sh <tablepro-cloud checkout>`
   (`npm run check:shared -- ../tablepro-cloud`) diffs every pair. Run it before
   either pull request is marked ready.

Change a shared file like this: edit it in both repositories, run
`shasum -a 256 <path>`, put the new hash in this table, and run the diff script.
Merge the tablepro-cloud side first only when its CI tolerates the difference
(see "Changing a header" below); otherwise merge both on the same day, this
repository first.

A shared file imports nothing: each app reaches it through its own path, and
strings arrive as arguments. `SharedFilesTest` checks the imports.

## Shared files

| Path | Path in TableProApp/cloud | sha256 | Contents |
| --- | --- | --- | --- |
| `resources/css/tokens.css` | `web/packages/ui/src/styles/tokens.css` | `e8ddbd024105bb4c8dcd3a71f474191272412d7e0459f3761453930c1d0f96ed` | Colour tokens for light and dark, `color-scheme`, the type roles and their `--lh-*` line heights per language, radii, motion, the default border colour, the focus ring, forced colours, the ThemeControl icon and segment states, reduced motion (design-system §2–§4, §7) |
| `resources/css/international.css` | `web/packages/ui/src/styles/international.css` | `cce4879c96db53596d9cf1d243b816fec77c648f356c735849c36abf14ed5cef` | Native Japanese, Korean, simplified and traditional Chinese font stacks |
| `resources/js/lib/crisp.ts` | `web/apps/portal/src/lib/crisp.ts` | `5d86e190b119e05008aadce726b2eab3cae42f36ee3378865604f61c3411c2ac` | Chat on every page: the loader arrives after the load event and an idle moment, a chat button opens it, and the launcher hides while a consent bar covers its corner |

## Kept to one specification, not copied

These cannot be byte-identical, so each copy names the other in its header and
both change together. No hash pins them.

- `resources/css/fonts.css` and tablepro-cloud's
  `web/packages/ui/src/styles/fonts.css`: the same faces, unicode ranges and
  declaration order (latin-ext, vietnamese, latin); the `url()` paths follow
  each app's bundler.
- `tests/Support/vi-forbidden-variants.php` and tablepro-cloud's
  `web/packages/i18n/test/vi-forbidden-variants.ts`: the same rows, as PCRE
  here and as JavaScript patterns there.

## Changing a header

A header names both repositories, so a change to it changes every shared file
on both sides at once. tablepro-cloud's CI compares its copies with this
repository's `main`, so either side merged alone turns the other's CI red. Make
its comparison skip line 1 first, change the headers on both sides, then
restore the full comparison.
