# TablePro marketing site

Laravel 13 + Inertia v3 + React 19 + Tailwind v4, tested with Pest 5.

## The one thing to know

**This app has no database and no credentials.** Every page is built from
markdown in `resources/blog` and `resources/data/legal`, JSON in
`resources/data`, and the public GitHub API. If a change would introduce a
model, a migration, a queue job or an API key, it does not belong in this
repository — stop and say so.

It also runs **without a session**: `StartSession`, `PreventRequestForgery`,
`ShareErrorsFromSession` and `AddQueuedCookiesToResponse` are removed from the
web middleware group in `bootstrap/app.php`. Consequences that bite:

- `csrf_token()` throws. There is no CSRF meta tag and nothing should add one.
- `session()`, `->with('flash')` and `redirect()->back()->with(...)` do not work.
- Inertia's `useForm().post()` must not be used. Writes go through plain
  `fetch` and hold their result in React state — copy the `useEmailForm`
  pattern in `resources/js/hooks/use-email-form.ts`.
- No response sets a cookie, and that includes the language: see below.

See `docs/architecture.md` before touching anything that posts data.

## Languages

English lives at the root; every other supported language uses its prefix in
`resources/data/locales.json`, with the same slugs. The
locale is a function of the URL and nothing else: no cookie, no session, no
`Accept-Language`, no IP, no redirect between languages.

- `resources/data/locales.json` is the one list of locales. PHP reads it through
  `App\Support\Localization\Locales`, TypeScript through `@data/locales.json`.
- Every page route is declared once, in `routes/localized.php`, which
  `routes/web.php` mounts once per locale. English keeps the plain route names
  (`landing.compare`); each translated language gets the same names behind its locale code.
- A route existing is never enough for a page to answer. `App\Support\Seo\PageRegistry`
  says which locales each page **renders** in (it has content there) and which
  it is **indexed** in, and the `page` middleware answers 404 everywhere else.
  A Vietnamese URL must never show English copy under Vietnamese chrome.
- The registry also drives the canonical, robots, hreflang, `og:locale`, the OG
  card, the language switcher and the sitemap, through the shared `seo` and
  `localization` props. `SEOHead` renders the `seo` prop; no page sets its own
  robots value or canonical.
- Strings live in three places:
  - UI chrome: typed catalogs in `resources/js/i18n/messages/{locale}/{namespace}.ts`,
    read with `useI18n()` (`m.nav.features`). English defines the shape; a key
    missing or extra in another locale fails `npm run typecheck`.
  - Page copy: `resources/data/content/{locale}/…json`, read by
    `App\Support\Content\ContentRepository`, sent as a `content` prop. No
    fallback to English.
  - Long prose: blog posts in `resources/blog/` (Vietnamese in `resources/blog/vi/`),
    legal pages in `resources/data/legal/{locale}/`. Server-rendered strings
    (OG cards, the static error pages) in `lang/{locale}/`.
- Write whole sentences with `{name}` slots, never fragments glued together; use
  `<Trans>` for a link inside a sentence and `plural()` for counts. Format
  prices with `format.formatUsd`, not `Intl`, and dates in PHP, so SSR and the
  browser agree.
- Vietnamese text is NFC and follows the glossary
  (`docs/rebuild/design/positioning.md` §11): the reader is "bạn", developer
  terms stay in English. `tests/Support/vi-forbidden-variants.php` lists the
  wording that is ruled out.
- Internal links go through `<LocaleLink>` or `useI18n().path()`, so they stay
  in the reader's language. The platform's paths are never prefixed; both
  helpers leave them alone (`PLATFORM_PATHS` in `resources/js/i18n/paths.ts`),
  and `<LocaleLink>` renders them as a plain `<a>`.
- The language crosses to the account app only explicitly: link
  `/account?locale={locale}` (never `/vi/account`), and post to `/checkout` and
  `/newsletter/subscribe` with `locale` in the body (`/discount/preview` takes
  `{code}` only), every call with `credentials: 'omit'`, so no platform cookie
  lands on a public page.
- Light theme by default; `localStorage.theme` holds an explicit choice, shared
  with the account app on the same origin.

## Conventions

- Follow the existing structure; check sibling files before inventing a pattern.
- Use `php artisan make:` for new files.
- Explicit return types and parameter type hints on every method.
- Curly braces on every control structure, even single-line bodies.
- Prefer PHPDoc blocks over inline comments; use array shapes in PHPDoc.
- Reuse `resources/js/components/ui/*` before writing a new primitive.
- Every page sends a Content-Security-Policy. A new third-party host (script,
  frame, fetch, image, font) needs a source in
  `App\Support\Security\ContentSecurityPolicy`, or the browser blocks it.
- A few files are byte-identical with the account app (tokens, fonts, the theme
  partial, …). Change them in both repositories at once: `docs/shared-files.md`.

## Commands

```bash
composer dev                    # serve + vite
npm run dev:proxy               # one origin for this app (:8000) and the platform (:8001) on :8080
php artisan test --compact      # full suite
php artisan test --compact --filter=BlogTest
npm run typecheck               # includes the catalog parity between locales
npm run test:js
vendor/bin/pint                 # fix code style before finishing
npm run check:shared -- ../license   # diff the files shared with the account app
php artisan sitemap:generate
WEB_DOMAIN=tablepro.app php artisan og:generate --type=blog --slug=my-post   # needs Chromium (PUPPETEER_EXECUTABLE_PATH); cards print WEB_DOMAIN
php artisan og:generate --type=compare --locale=all  # types: site|blog|database|compare|feature|all; locales: a supported locale code or all
                                # commit public/og; delete a retired page's card (Seo/OgCardsTest fails on a missing or orphaned card)
php artisan assets:handoff      # after editing assets.json or docs/rebuild/assets/*.md
php artisan assets:handoff --check   # what CI runs: fails on a stale generated file
php artisan release:check       # network: compares platforms.json with GitHub, Sparkle, Homebrew, App Store
```

Run `vendor/bin/pint --dirty --format agent` after editing any PHP file.

## Deploying

`main` deploys itself: green tests on `main` trigger `.github/workflows/deploy.yml`,
which runs `scripts/deploy.sh` on the server. Never build straight into the live
`public/build` — Vite empties it first and the site 500s until it is rewritten.
Read `docs/deployment.md` before changing anything about the server; the host is
shared with a dozen other sites and with the private platform app that answers
`/account`, `/checkout` and `/newsletter` on this same domain.

## Testing

Every change needs a test. Feature tests live in `tests/Feature`; there is no
`tests/Unit` suite and `phpunit.xml` declares only `Feature`. There is no
`RefreshDatabase` anywhere and there must not be — there is no database.

No test reaches the network: `tests/Pest.php` prevents stray HTTP requests, so
fake GitHub with `Http::fake()`. Tests that assert on rendered markup go behind
`requireSsr()` and skip locally without a built SSR bundle.

## Content

- A blog post is a markdown file in `resources/blog/`; the filename is the slug.
  A Vietnamese version of a guide is `resources/blog/vi/{same slug}.md` and keeps
  the original `date`. Release posts stay English-only.
- Database, comparison and feature pages need a slug in the matching constant
  class in `app/Support/Content/Slugs/` (never in `routes/`) and a content file
  in **every** locale. A slug with content in only one locale renders only
  there.
- Prices live in `resources/data/pricing.json`, and every price on the site
  (pricing, FAQ, structured data) reads from it. The values must match what
  checkout actually charges: they are synced by hand with the platform's
  pricing configuration and the Polar products. Never change them here alone —
  flag it instead. The same file pins the checkout SDK script URLs
  (`checkoutSdk`), which load only when a reader shows intent to buy.
- Other facts are data too, stated once: `platforms.json` (releases,
  requirements, the App Store), `engines.json`, `paid-features.json`,
  `facts.json` (URLs, limits), `sponsors.json`, `comparisons.json` (dated and
  sourced). Copy refers to them through `{token}` slots; counts are derived,
  never typed. After an app release, run `php artisan release:check`.
- Content images are slots in `resources/data/assets.json`, rendered by
  `<AssetSlot id>` (or `<asset-slot id>` in markdown). Until the owner supplies
  the file, a slot is a described placeholder outside production and renders
  nothing in production (the shared `assetPlaceholders` prop); layout that
  makes room for a slot asks `useShownSlot()` first. A new slot or a changed description is a
  manifest edit plus a brief in `docs/rebuild/assets/{family}.md`; then run
  `php artisan assets:handoff`, which regenerates `docs/visual-assets.md` and
  the bundle's `resources/js/lib/data/asset-slots.json` and `asset-locales/*.json`. Never hand-edit generated files.

## Frontend

- Pages resolve by convention from `resources/js/pages`. `resolve-page.ts` loads
  the selected language's asset catalog before client or SSR rendering.
- SSR is enabled; `npm run build` builds both bundles.
- `@/` maps to `resources/js`; `@data/` maps to `resources/data`.
