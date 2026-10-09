# Technical architecture and implementation plan (both repositories)

Decided 2026-10-02. This plan covers the public site (`TableProApp/web`, branch `rebuild`) and its
contract with the account/platform app (`TableProApp/license`). It does not decide copy, page dispositions, the final
sitemap or the visual design. Those belong to the positioning, IA, content and visual documents. This document gives
them the machinery: routing, strings, content files, data files, SEO, assets, theme, locale handoff, deploy and
tests. Line numbers refer to the code as of 2026-10-02 and may have drifted since.

Inputs: the rebuild brief ("the spec"; not part of this repository; its §0 overrides the rest), the code of both
repositories, the TablePro app repository and its releases, an audit of the previous site, the sibling design
documents (`positioning.md`, `sitemap.md`, `design-system.md`) and `docs/screenshots.md`.

Shorthand: **W** = public repo, **L** = license (platform) repo. "Shared file" means a file kept byte-identical in
both repos under the contract in §3.

---

## Decisions in one screen

| Area | Decision |
|---|---|
| Public locale model | Locale is a function of the URL only. English at the root, Vietnamese under `/vi`, same slugs. The routes are declared once, in `routes/localized.php`, and mounted once per locale with a `locale:{code}` middleware. There are no cookies, no session, no `Accept-Language` handling, no IP lookup, no `Vary` on language and no redirect between locales. |
| Route names | English keeps today's names (`landing.home`, `landing.compare`, …). Vietnamese uses the same names with a `vi.` prefix (`vi.landing.home`). |
| Strings | There are three tiers. UI chrome lives in typed TypeScript catalogs, with one file per namespace and per locale; property access means a missing key fails `tsc`. Page copy lives in per-locale JSON under `resources/data/content/{locale}/`, read by PHP and sent as one `content` prop. Long prose is markdown: blog posts in `resources/blog/{,vi/}`, legal pages in `resources/data/legal/{locale}/`. A small `lang/{en,vi}` covers the few server-rendered strings (OG cards and the 500/503 Blade fallbacks). |
| Facts | Locale-neutral JSON files in `resources/data/`: `locales`, `platforms`, `engines`, `pricing`, `paid-features`, `facts`, `sponsors`, `comparisons`, `assets`, `redirects`. §1.8 is the one schema list. TypeScript and PHP both read them. Counts are derived, never typed, and a test bans typed counts in copy. |
| SEO | A single PHP `PageRegistry` drives the canonical URL, the robots value, hreflang (with `x-default` set to English), `og:locale`, the sitemap with alternates, the OG card choice and the language switcher. Each page lists the locales it **renders** in and the locales it is **indexed** in, which can differ (`/vi/blog` renders but is `noindex, follow`). React renders the head from one shared `seo` prop. JSON-LD is built per page type in TypeScript with `inLanguage`. There is no FAQPage, HowTo or rating markup. |
| Errors | `Inertia::handleExceptionsUsing` renders a branded `Error` page for 404 and 410 (and 500/503 when debug is off) in the locale taken from the path. Static Blade fallbacks cover 500/503. One global middleware normalises trailing slashes and `/index.php`, and applies `resources/data/redirects.json` (301 and 410) in a single hop that keeps the query string. |
| Assets | One manifest per owning app (`resources/data/assets.json` here) feeds an `<AssetSlot id>` component and carries every handoff field the spec requires. Placeholder or supplied mode depends only on the manifest's `status`. A placeholder never makes an `<img>` request, and in production it renders nothing. `docs/visual-assets.md` is generated from the manifest plus per-family prose fragments. |
| Theme | One shared head partial, as specified in design-system §2.8. The default is light, storage access is guarded, the script sets `color-scheme`, `data-theme-choice` and a single `theme-color` (`#ffffff` / `#121212`), and the stored values are `light`, `dark` and `system`. A shared `ThemeControl` offers Light, Dark and System. Images switch on the `.dark` class, never on `prefers-color-scheme`. |
| Third parties | Crisp loads only on click. The Polar/LemonSqueezy SDK loads lazily at checkout intent instead of on every page. The Product Hunt hotlink goes. GA Consent Mode stays as it is. |
| Download | Server: GitHub `releases/latest`, falling back to the appcast, with a fresh cache, a last-good copy and a negative cache. Client: nothing starts automatically. iPhone and iPad get the App Store card. A Chromium `architecture` hint only highlights a button. |
| Platform locale | The account app takes `locale` from the query, a form field or the JSON body. Signed URLs ignore it, and platform URLs stay unprefixed (§2). |
| Cross-repo sharing | A "copy in both, change both" list of shared files, each with a header comment, a hash manifest checked by a Pest test in each repo, and a diff script. There is no package and no monorepo. |

---

## 1. Public site (`TableProApp/web`)

### 1.1 Locale model and routing

**Single source of locales: `resources/data/locales.json`** (new)

```json
{
  "default": "en",
  "supported": {
    "en": { "native": "English",    "prefix": null, "hreflang": "en", "og": "en_US", "intl": "en-US" },
    "vi": { "native": "Tiếng Việt", "prefix": "vi", "hreflang": "vi", "og": "vi_VN", "intl": "vi-VN" }
  }
}
```

PHP reads it through `App\Support\Localization\Locales` (new, `php artisan make:class`):

| Method | Contract |
|---|---|
| `all(): array<string, array{native: string, prefix: ?string, hreflang: string, og: string, intl: string}>` | Reads the JSON once per request (static memo). The file is tiny and PHP-FPM is shared-nothing |
| `default(): string`, `codes(): list<string>`, `isSupported(string): bool` | Allowlist |
| `prefixFor(string $code): ?string` | `null` for `en` |
| `fromPath(string $path): string` | First path segment equal to a prefix gives that locale; anything else gives the default. Used where no route matched (404 handler, maintenance page) |

TypeScript imports the same file through the `@data` alias. `type Locale = keyof typeof locales.supported` resolves
to `'en' | 'vi'` with no hand-written union.

**Routes.** `routes/web.php` keeps only the parts that are not localized, then mounts the localized table once per
locale:

```php
// routes/web.php (shape). Redirects and 410s are not routes: the global CanonicalizeRequest middleware (§1.7)
// answers them before routing.
foreach (Locales::all() as $code => $locale) {
    Route::middleware('locale:' . $code)
        ->prefix($locale['prefix'] ?? '')
        ->name($locale['prefix'] === null ? '' : $code . '.')
        ->group(base_path('routes/localized.php'));
}

Route::get('/robots.txt', /* unchanged closure */)->name('web.robots');
```

`routes/localized.php` (new) declares every localized page exactly once: home, download, ios, blog index and post,
legal pages, FAQ, compare hub and pages, database hub and pages, feature hub and pages, plus pricing if the IA document
gives it a page. **The IA document decides which entries exist.** This file only fixes the mechanism. Three rules
apply:

1. Slug constraints use `->whereIn('slug', DatabaseSlugs::ALL)` (and the matching classes for compare and feature
   slugs). These live in `app/Support/Content/Slugs/{DatabaseSlugs,CompareSlugs,FeatureSlugs}.php`, one constant
   class per family. The existing convention keeps explicit slug lists in PHP
   rather than reading content directories at route-registration time, and the reason is deploy-safety: a route-cache
   rebuild runs only on a PHP change (`deploy.sh:220`), and an edit to `app/` is a PHP change. A Pest test pins each
   constant against the content files (§1.17).
2. Blog stays `->where('slug', '[a-z0-9-]+')`. Whether the post exists in the requested locale is decided in the
   controller.
3. No root-level slug may equal a locale prefix (`vi`), and `ios` must never join the database alternation. Both
   are guarded by tests.

**Middleware.** `App\Http\Middleware\SetLocale` (`make:middleware`) has
`handle(Request $request, Closure $next, string $locale): Response`. It calls `App::setLocale($locale)` after
checking `Locales::isSupported` (a 404 otherwise). The value comes from the route definition, never from input.
`bootstrap/app.php` registers it with `$middleware->alias(['locale' => SetLocale::class])`. The web group stays
session-less (`bootstrap/app.php:36-41` is unchanged). Carbon follows `App::setLocale` through `LocaleUpdated`, so
`isoFormat()` output comes out localized automatically.

**Blog in Vietnamese.** `/vi/blog` exists and has Vietnamese chrome. It lists Vietnamese posts plus English-only
release posts, each linked to `/blog/{slug}` with `hreflang="en"`, `lang="en"` and a visible "(tiếng Anh)"
label. `/vi/blog/{slug}` returns 200 only when `resources/blog/vi/{slug}.md` exists. Otherwise it returns a 404 whose
Error page offers a "Read it in English" link (`MissingTranslationException` → 404 with a `suggestion` prop). There
are no English bodies under Vietnamese chrome and no boilerplate duplicates.

**What does not change.** Every English URL keeps its path. `/#pricing` and `/?ref=…#pricing` keep resolving, because
both `/` and `/vi` render a section with `id="pricing"` whatever the IA does with a pricing page. `/download`,
`/privacy`, `/ios` and the platform prefixes are untouched.

### 1.2 URL helpers

| Side | API | Notes |
|---|---|---|
| PHP `App\Support\Localization\LocalizedUrl` (new) | `routeName(string $name, string $locale): string`; `route(string $name, array $params, string $locale, bool $absolute = true): string`; `path(string $path, string $locale): string`; `baseName(?string $routeName): ?string` (strips `vi.`) | Absolute URLs are built from `https://{app.web_domain}`, the same base as today's `canonicalBaseUrl` (`HandleInertiaRequests.php:44`), never from `url()` |
| TS `resources/js/i18n/paths.ts` (new) | `localePath(path, locale)`; `splitLocale(pathname) → {locale, path}` (pages build absolute URLs with `absoluteUrl(baseUrl, path)` from `lib/structured-data.ts`; the reversed copy here was removed during integration) | `'/'` with `vi` gives `'/vi'`; `'/download#x'` keeps the fragment. Pure module with relative imports only, so `node --test` can load it |
| TS `components/ui/locale-link.tsx` (new) | `<LocaleLink href="/download">`, plus an optional `locale` prop | Same locale: Inertia `<Link>` to `localePath(href, current)`. Different locale: a plain `<a href hrefLang lang>`, which forces a full document load, so `<html lang>`, the font preloads and the theme script all re-run |

**Never localized:** links to `/account` (sent as a plain `<a href="/account?locale={locale}">`), and fetch calls to
`/checkout`, `/discount/preview` and `/newsletter/subscribe`. nginx routes these by root prefix
(`docs/deployment.md`), so `/vi/checkout` would never reach the platform. The public site
does not call `/api/newsletter/stats` at all (§1.14). A Pest guard scans `resources/js` for internal `href="/…"`,
`href={'/…'}` and `` href={`/…`} `` that bypass `localePath`/`LocaleLink`, against an allowlist of cross-app paths.

### 1.3 Inertia shared props

`app/Http/Middleware/HandleInertiaRequests.php::share()` becomes:

| Prop | Value | Notes |
|---|---|---|
| `canonicalBaseUrl` | unchanged | Kept for absolute JSON-LD URLs |
| `locale` | `app()->getLocale()` | Read by `useI18n()`. There is no module-level "current locale", because the SSR process serves requests concurrently |
| `localization` | closure → `{ switcher: [{locale, native, hreflang, href, current, fallback}] }` | `href` is the alternate for that locale when one exists. Otherwise it is that locale's section index (for example `/vi/blog`) with `fallback: true`, and the switcher shows a short note ("Trang này chưa có bản tiếng Việt") |
| `seo` | closure → `{ robots: 'index, follow' \| 'noindex, follow', canonical: string \| null, alternates: [{hreflang, href}], xDefault, ogLocale, ogLocaleAlternates[], ogImage: {url, width, height, type} \| null }` | Built by `App\Support\Seo\SeoContext::forRequest()` from the `PageRegistry` (§1.6). For a page that renders but is not indexed in this locale (`/vi/blog`), and for an unmatched route or error page, the value is `robots: 'noindex, follow'`, `canonical: null` and no alternates |
| `lcpAsset` | `{light, dark} \| null` (page prop, not shared) | Set by a controller only for a **supplied** asset with `priority: true`, through `AssetManifest::lcpDescriptor()` (§1.9). `app.blade.php` reads it to emit one preload for the active theme |
| `banner` | `{href, version} \| null` | The **copy** moves to the `banner` catalog namespace. Config keeps only `enabled`, `href` and `version` (`config/banner.php` is trimmed) |
| `crispWebsiteId` | `config('services.crisp.website_id')` | Public value, used only by the click-to-load helper (§1.12) |
| `assetPlaceholders` | `! App::isProduction()` | False in production, where an asset slot with no image renders nothing (§1.9) |

Controllers pass page data only. `paymentProvider` goes only to pages that render checkout. `teamMinSeats` is
dropped: `pricing.json` is the single public source, and `config/pricing.php` is deleted (the platform keeps its own
`TEAM_MIN_SEATS` for enforcement, synced by hand as before). `downloadUrls` and `githubStars` stop being threaded
through every page for the header: the header reads no release data, and the star count, if the design keeps it,
becomes a cached shared closure `github: {stars: ?int}`.

### 1.4 Strings: UI catalogs, content files and long-form prose

**Rule.** A string that belongs to a reusable component or behaviour goes in a UI catalog: labels, states, errors,
controls, placeholder type labels, title templates and breadcrumb roots. A string that belongs to one page's narrative
goes in that page's content file: headings, paragraphs, FAQ answers, captions, and that page's SEO title, description
and OG text.

**UI catalogs** (bundled, typed, with no runtime dependency):

```
resources/js/i18n/
  index.ts              useI18n() → { locale, m, fmt, plural, path, format }; reads usePage().props.locale
  core.ts               interpolate('{name}'), plural(node, n, locale) via Intl.PluralRules, <Trans> tag splitter
  format.ts             date/number/price formatters (deterministic, see §1.5)
  paths.ts              §1.2
  types.ts              Messages = DeepWiden<typeof en>  (string leaves; {one, other} plural nodes)
  messages/
    en/index.ts         composes namespaces
    en/{common,nav,footer,controls,consent,banner,forms,platforms,pricing,download,blog,assets,errors,seo,a11y}.ts
    vi/index.ts         `export default {...} satisfies Messages`
    vi/{same namespace files}
```

- Components use property access (`m.nav.features`), so typing comes for free. A missing key in `vi`, or an extra
  one, fails `npm run typecheck`. `satisfies` on object literals rejects excess properties.
- Placeholder parity (`{name}` sets equal in `en` and `vi`), plural nodes (`vi` needs only `other`) and NFC
  normalization are checked by `tests/js/i18n-catalogs.test.ts`.
- Rich text uses `<Trans text={m.x} tags={{link: (c) => <LocaleLink …>{c}</LocaleLink>}} />` over `<link>…</link>`
  markers. Fragments are never concatenated into sentences.
- Cost: both locales' chrome ships in the shared chunk. Measure it after the first build. If the gzip delta goes
  over 10 KB, move namespaces into `content` props. A lazy `resolve` stays rejected
  because it would give up the injected resolver (`ssr.tsx:18-31`).

**Page content** (server-read, one locale per response):

```
resources/data/content/
  en/                                  vi/  (identical tree and key structure)
    home.json  download.json  ios.json  pricing.json  faq.json  blog.json (blog index intro and seo)
    paid-features.json                 { "<featureId>": { "detail": "…" } }  (names stay in paid-features.json)
    engines.json                       { "<engineId>": { "tagline": "…", "limits": { "<limitId>": "…" } } }
    features/index.json  features/<slug>.json
    databases/index.json databases/<slug>.json
    compare/index.json   compare/<slug>.json   prose only: short answer, strengths, switching, FAQ, and
                                               "notes": { "<noteId>": "…" } for qualified cells. Every
                                               competitor fact, price, date and source is in comparisons.json
resources/data/legal/{en,vi}/{privacy,terms,refund-policy}.md    front matter: title, description, updatedAt
resources/blog/<slug>.md               English (existing location; no file or URL moves)
resources/blog/vi/<slug>.md            Vietnamese version of a retained guide; same slug; `date` = original
                                       publication date; optional `translatedAt`
```

- Every content file has a `seo` block `{title, description, indexable?}` and an `og` block `{kicker, title}`.
  Neither may contain `{tokens}` or digits followed by a counted noun. `seo.indexable` is a boolean that defaults to
  `true`; it is the one key `ContentParityTest` lets differ between locales. `content/vi/blog.json` sets it to
  `false` (sitemap §A.5), and the registry turns that into `noindex, follow` (§1.6).
- Facts enter copy only through tokens such as `{mac.requirement}` and `{ios.requirement}`. TypeScript resolves them
  against the data files (`fmt(content.hero.availability, facts)`), so no fact is typed into a content file. A
  limit sentence carries `{value}` when the number is part of it; the number lives in the data file.
- Asset references in content are IDs (`"asset": "mac-query-autocomplete"`), never paths.
- The existing `resources/data/{databases,database-grid}.json` are replaced by `engines.json` plus
  `content/*/databases/*`, and deleted in cleanup. The Vite bundle loses the 140 KB `databases.json` import
  (`resources/js/data/databases.ts:1`). `resources/data/comparisons.json` keeps its name but gets the new
  locale-neutral schema (§1.8): today's file first moves to `resources/data/legacy/comparisons.json`, and the one
  import in the legacy `resources/js/data/comparisons.ts:1` is repointed, so the old compare pages keep building until
  the new ones replace them. Cleanup deletes `resources/data/legacy/`.

**Loaders (PHP):**

| Class (new) | API |
|---|---|
| `App\Support\Content\ContentRepository` | `page(string $name, string $locale): array` (throws `ContentMissingException`, with no silent fallback to English); `has(string $name, string $locale): bool`; `entry(string $family, string $slug, string $locale): ?array`; `slugs(string $family, string $locale): list<string>`. JSON is decoded once per request |
| `App\Support\Content\MarkdownRenderer` | Extracted from `BlogService::renderMarkdown()` (`BlogService.php:111-135`). Adds the CommonMark **Attributes** extension so headings take explicit, locale-stable ids (`## Cookies {#cookies}`), and an `<asset-slot id="…"></asset-slot>` block passthrough (§1.9). Used by blog and legal |
| `App\Services\Blog\BlogService` | Becomes `all(string $locale)`, `find(string $slug, string $locale)` and `locales(string $slug): list<string>`. The English glob stays non-recursive (`BlogService.php:34`), so `vi/` never leaks into the English list. `Post` gains `locale`, `url()` per locale, and `dateFormatted` through `isoFormat('LL')` in the post's locale |

**TS typing of content props.** A new alias, `@data/*` → `resources/data/*`, is added to `tsconfig.json` `paths` and
to the Vite `resolve.alias`. Pages declare `content: typeof import('@data/content/en/home.json')`. That is a type-only
reference, so nothing is bundled.

**Server-side strings (`lang/`, new, small).** `lang/{en,vi}/og.php` holds OG template labels and
`lang/{en,vi}/errors.php` holds the Blade 500/503 fallback copy. There is no `validation.php` in this repo. Adding
`lang/` forces the deploy-regex change in §1.16.

### 1.5 Formatting (dates, numbers, prices)

- Dates visible at SSR time are formatted **in PHP** with Carbon `isoFormat('LL')` (`en` gives "October 2, 2026",
  `vi` gives "2 tháng 10 năm 2026"). The reason: the ICU data in the SSR Node and in the reader's browser can differ,
  which causes hydration mismatches. Client-side `Intl` is allowed only for content rendered
  after mount.
- Prices come from `formatUsd(amount, locale)` in `format.ts`, which is deterministic and does not call `Intl`. The
  pattern and decimal separator come from the `pricing` catalog (`en` "$2.99"; `vi` default "2,99 US$", a copy
  decision). Billing semantics never change with locale. JSON-LD prices stay locale-neutral strings
  (`"2.99"`, `USD`).
- Lists use `Intl.ListFormat` only after mount. In SSR, names are joined from data with catalog separators.

### 1.6 SEO module

**Registry** (`app/Support/Seo/`, new):

```php
final readonly class PageEntry {
    /**
     * @param array<string, string> $params
     * @param list<string> $renderLocales     locales in which the URL answers 200
     * @param list<string> $indexableLocales  subset of $renderLocales: index, sitemap, hreflang
     * @param list<string> $sources           files that drive lastmod
     */
    public function __construct(
        public string $route,        // base route name, e.g. 'landing.compare'
        public array $params,
        public array $renderLocales,
        public array $indexableLocales,
        public array $sources,
        public string $ogFamily,     // site | blog | database | compare | feature
        public ?string $ogSlug,
    ) {}

    public function renders(string $locale): bool;           // in_array($locale, $this->renderLocales, true)
    public function isIndexable(string $locale): bool;       // in_array($locale, $this->indexableLocales, true)
    public function robots(string $locale): string;          // 'index, follow' | 'noindex, follow'
    /** @return list<string> */
    public function hreflangCluster(): array;                // $indexableLocales when it has 2+ members, else []
}

interface PageFamily { /** @return list<PageEntry> */ public function entries(): array;
                       public function find(string $route, array $params): ?PageEntry; }

final class PageRegistry {
    /** @param iterable<PageFamily> $families */
    public function __construct(iterable $families) {}
    /** @return list<PageEntry> */ public function all(): array;              // sitemap, tests
    public function find(string $route, array $params): ?PageEntry;          // per request: cheap is_file checks, no globbing
    /** @return array<string, string> */ public function alternates(PageEntry $e): array;  // locale => absolute URL
}
```

There are four families. Each one decides **render** locales from files and **indexable** locales from a flag, so
"exists" and "is indexed" never get confused again:

| Family | Renders in a locale when | Indexable in that locale when |
|---|---|---|
| `StaticPages` (home, download, ios, pricing, faq, blog index) | `content/{locale}/{page}.json` exists | it renders and the file's `seo.indexable` is not `false` |
| `ContentCollection` (features, databases, compare, with their hubs) | `content/{locale}/{family}/{slug}.json` exists | same `seo.indexable` rule |
| `BlogPosts` (posts) | `BlogService::locales($slug)` contains it | always, when it renders (an English-only post is indexable in `en` only, so it has no cluster) |
| `LegalPages` | `legal/{locale}/{doc}.md` exists | always, when it renders |

So `/blog` is `{render: [en, vi], indexable: [en]}`: `/vi/blog` answers 200 with Vietnamese chrome and
`lang="vi"`, carries `noindex, follow`, has no canonical and no hreflang, and is not in the sitemap. The English
posts it lists stay reachable for crawlers through `follow`. The registry is bound as a singleton in
`App\Providers\SeoServiceProvider` (made with `make:provider`, which also registers it in
`bootstrap/providers.php`).

**One registry feeds every surface**, so nothing can drift:

| Consumer | Uses |
|---|---|
| `SeoContext::forRequest()` → `seo` shared prop | `robots` = `entry.robots(locale)`. `canonical` = this locale's URL when `isIndexable(locale)`, else `null`. `alternates` = every locale in `hreflangCluster()`, self included, as absolute URLs, only when the current locale is in the cluster. `xDefault` = the English URL, only when there are alternates. `ogLocale` comes from `locales.json`, and `ogLocaleAlternates` lists the other cluster members only |
| `localization.switcher` | One item per supported locale. The target is the entry's URL in that locale when `renders(locale)` (so `/blog` ↔ `/vi/blog` switch directly), else that locale's section index with `fallback: true` (an English-only post → `/vi/blog`) |
| `sitemap:generate` | `all()`: one `<url>` per (entry, locale in `indexableLocales`) with `addAlternate()` for every cluster member plus `x-default`. English-only posts and `/blog` get no alternates; `/vi/blog` is absent. `lastmod` comes from `LastModified::forPaths($entry->sources)`: `git log -1 --format=%cI -- <paths>` through `Symfony\Process` with a 2-second timeout, falling back to the newest mtime. Today's mtimes are the `git pull` time. `changefreq` and `priority` are dropped because Google ignores them |
| OG image choice | `OgImages::for(PageEntry, locale)`: `/og/{family}/{slug}.png` (en) or `/og/vi/{family}/{slug}.png`, only if the file exists on disk; otherwise the generic card, `/og.png` (en) or `/og/vi/default.png` (vi), per sitemap §C.7; otherwise no image tags. There are no broken references by construction |

Pages with no registry entry (404, 410, the Error page) get `robots: 'noindex, follow'`, so a crawler that lands on
a dead link can still follow the page's links home. This matches sitemap §F.2. The static Blade 500/503 fallbacks
carry `noindex`.

**Head** (`resources/js/components/seo/seo-head.tsx`, rewritten). Props:
`{title, description, ogType?, jsonLd?, breadcrumbs?}`. Robots, canonical, alternates, `og:locale`/`:alternate` and
the OG image come from the `seo` prop. It emits, in this order:

1. `<title>` through the `seo.titleTemplate` catalog entry, and the description.
2. Exactly one robots meta, with the value of `seo.robots`. No page decides its own robots value.
3. The canonical link, when `seo.canonical` is not null.
4. One `<link rel="alternate" hreflang href>` per alternate, plus `x-default`, each with a unique `head-key`, and
   hreflang never combined with other attributes.
5. OG tags (`og:image:type` derived from the file, no longer hard-coded to PNG), Twitter tags, and JSON-LD with
   `</script` escaped.

**JSON-LD per page type** (`resources/js/lib/structured-data.ts`, rewritten). Every node carries `inLanguage`. Visible
content only, and no `aggregateRating`, `review`, `FAQPage` or `HowTo` anywhere:

| Page | Nodes |
|---|---|
| Every page | `Organization` `https://tablepro.app/#organization`. The id stays stable across locales because `docs.tablepro.app` asserts it (`TablePro docs/docs.json:28`). The description is localized |
| Home | `WebSite` `#website`; `SoftwareApplication` `#app` (Mac: `DeveloperApplication`, `operatingSystem` from `platforms.json`, `softwareVersion` only from a live release source, `offers` from `pricing.json` only when pricing is visible on the page); `MobileApplication` `#ios-app` (summary) |
| Download | `#app` with `downloadUrl` (live only) and the requirements; `#ios-app` reference |
| iOS page | `MobileApplication` `#ios-app` (iOS/iPadOS 18.0, free offer, App Store URL) |
| Pricing (page or section host) | `#app` with one `Offer` per visible price |
| Feature, database and compare pages | `WebPage` with `about: {@id: #app}` plus `BreadcrumbList`. The per-database "TablePro - X Client" pseudo-apps (`DatabaseClient.tsx:30-99`) and the compare `Review` node (`Compare.tsx:53-115`) are dropped: neither describes real content |
| Hubs, blog index | `CollectionPage` + `ItemList` (same-locale URLs) |
| Blog post | `BlogPosting` (author and publisher `#organization`, not a fake Person; `datePublished` = the original date; `dateModified` only on a real content change) + `BreadcrumbList` |
| FAQ, legal | `WebPage` + `BreadcrumbList` |
| Error | none |

Breadcrumb names come from catalogs and content, and their URLs are same-locale (`localePath`).

**robots.txt.** The route is unchanged: `Allow: /`, the two `Sitemap:` lines, no `Disallow` (spec: robots.txt is not
access control).

### 1.7 Redirects, 410 and branded errors

**Map:** `resources/data/redirects.json` (new):

```json
[
  { "from": "/docs/raycast", "to": "https://docs.tablepro.app/external-api/raycast", "status": 301,
    "reason": "Raycast extension pair.tsx:187 links here" },
  { "from": "/mariadb-client", "to": "/mysql-client#mariadb", "status": 301, "reason": "merged into the family page (sitemap §A.3)" },
  { "from": "/compare/azimutt", "status": 410, "reason": "no genuine replacement (sitemap objection 1)" }
]
```

The disposition table (sitemap §C) owns the entries; this file holds both its 301s and its 410s (the sitemap's
`config/redirects.php` and `config/gone.php` are this one file). An entry's `to` is never another entry's `from`, and
`from` is never a live route. The `/databases/{docsSlug}` family of old docs-style paths is not listed entry by entry:
it is derived from `engines.json` (`docsSlug` → the engine's page, or its family page and `anchor`, or the hub row).
That rule covers the evidenced `/databases/oracle`, which the plugin registry homepage has linked since 2026-03.

**Handler: one global middleware, one hop.** `App\Http\Middleware\CanonicalizeRequest` (`make:middleware`) implements
sitemap §C.1. It is **prepended to the global stack** (`$middleware->prepend(...)` in `bootstrap/app.php`), not to
the `web` group: route middleware only runs after a route matched, and a retired path such as `/mariadb-client` has no
route, so a `web`-group middleware would never see it. For `GET` and `HEAD` only, it:

1. strips a trailing slash (except on `/`), so `/blog/` and `/vi/` normalise to `/blog` and `/vi`;
2. strips a leading `/index.php` (`/index.php` → `/`, `/index.php/{p}` → `/{p}`), reading
   `getBaseUrl()`/`getPathInfo()` because Symfony folds `/index.php` into the base URL;
3. looks the normalised path up in `redirects.json`, then in the `docsSlug` rule (parsing `engines.json` only when
   the path matches `^/databases/[^/]+$`);
4. answers `abort(410)` for a 410 entry (the branded Error page below), or sends **one** 301 when anything
   changed, to `https://{app.web_domain}{target path}?{merged query}{target fragment}`: the target's own query first,
   then the request's raw query. So `/mariadb-client/?ref=x` goes straight to `/mysql-client?ref=x#mariadb`.

Laravel's `Route::redirect`/`permanentRedirect` are not used: they drop the query (`RedirectController.php:19-43`),
and inbound links carry `?ref=` and `utm_*`, which `attribution.ts` reads. Nothing is localized here: no `/vi/…`
retired URL ever existed. Uppercase paths and `//x` stay 404 (sitemap §C.1). This needs no nginx change: nginx already
hands `/blog/` and `/index.php/blog` to Laravel, which is why they answer 200 today. The map
is read at request time, so editing it never needs a route-cache rebuild.

**Branded error pages.** A new `resources/js/pages/Error.tsx` takes props
`{status: 404|410|500|503, suggestion?: {href, title, hreflang}}`, copy from the `errors` namespace, and the
`noindex, follow` robots value from the `seo` prop. It is registered with `Inertia::handleExceptionsUsing()` (inertia-laravel v3.3.1,
`ResponseFactory.php:409`) in `bootstrap/app.php` `withExceptions`, per the Inertia v3 docs (confirm with
`search-docs`; fall back to `AppServiceProvider::boot()` if the handler resolves too early):

```php
Inertia::handleExceptionsUsing(function (ExceptionResponse $response): ?ExceptionResponse {
    $status = $response->statusCode();
    if (! in_array($status, [404, 410, 500, 503], true) || ($status >= 500 && config('app.debug'))) {
        return null;
    }
    App::setLocale(Locales::fromPath($response->request->path()));   // route middleware did not run on a 404
    return $response->render('Error', ['status' => $status, ...])->withSharedData();
});
```

`withSharedData()` calls `HandleInertiaRequests::share()` (`ExceptionResponse.php:92-101`). That method must tolerate
a null `$request->route()`. Static fallbacks `resources/views/errors/{500,503}.blade.php` hold inline CSS, the logo
and `lang/{locale}/errors.php` copy; they cover maintenance mode and a failure inside the error page itself. The Error
page carries `noindex, follow`, the static fallbacks carry `noindex`, and neither is ever in the sitemap.

### 1.8 Data files, schemas and validation

**This is the one schema list for every design document.** Positioning, the sitemap and the design system name
these files and fields. Where one of them uses another file or field name, this section wins.

All of these files are locale-neutral. Human sentences live in `content/{locale}` or in a UI catalog. Proper nouns
stay in data: engine, device, competitor, edition, tool and sponsor names. TypeScript wrappers live in
`resources/js/lib/data/*.ts`, a new directory, so they never collide with the legacy `resources/js/data/{engines,
pricing,…}.ts` that cleanup deletes. A JSON import widens string unions to `string`, so each wrapper makes a single
documented cast after the Pest schema test has validated the file. PHP (sitemap, OG, the JSON-LD offers check, the
redirect middleware) and TypeScript read the same files.

Each file is changed together with its `Data` test, which lives in `tests/Feature/Data/{Name}DataTest.php`.

Shapes are abridged: `…` marks values filled from the public source (the app repository at the copy floor release,
the release feeds, the vendor's page), never from this document.

#### `locales.json`

§1.1. `LocalesDataTest`: the codes are ISO 639-1; `en` is the default with `prefix: null`; the prefixes are
unique; no prefix collides with a root slug.

#### `platforms.json`

```jsonc
{
  "verifiedAt": "2026-10-02",
  "platforms": [
    {
      "id": "mac",                          // mac | ios | linux | windows
      "status": "released",                 // released | prototype | none
      "deviceNames": ["Mac"],               // Apple product names, never translated
      "requirements": { "systems": ["macOS"], "minVersion": "13.0", "displayVersion": "13", "releaseName": "Ventura" },
      "architectures": [{ "id": "arm64", "assetTemplate": "TablePro-{version}-arm64.dmg" },
                        { "id": "x86_64", "assetTemplate": "TablePro-{version}-x86_64.dmg" }],
      "universalBinary": false,
      "destinations": [{ "kind": "dmg" }, { "kind": "homebrew", "command": "brew install --cask tablepro" },
                       { "kind": "releases", "url": "https://github.com/TableProApp/TablePro/releases" }],
      "release": { "version": "0.77.0", "publishedAt": "2026-10-02" },
      "floorVersion": "0.76.1",             // the oldest version any channel still serves (Homebrew lags)
      "appLanguages": ["…"]                 // BCP 47 tags from the app's string catalogs
    },
    {
      "id": "ios", "status": "released", "deviceNames": ["iPhone", "iPad"],
      "requirements": { "systems": ["iOS", "iPadOS"], "minVersion": "18.0", "displayVersion": "18", "releaseName": null },
      "destinations": [{ "kind": "app-store", "url": "https://apps.apple.com/app/…" }],
      "release": { "version": "1.0", "build": "22", "publishedAt": "…" },
      "iosEngines": ["…"],
      "price": { "amount": 0, "inAppPurchases": false },
      "appLanguages": ["…"]
    },
    { "id": "linux", "status": "prototype" },
    { "id": "windows", "status": "none" }
  ]
}
```

Values come from the GitHub releases, the appcast, the Homebrew cask and the App Store listing, at Mac 0.77.0 and
iOS 1.0 (build 22). The status word is
`released`, as positioning §3.3 and §13 use it.

Every phrase around these values is a catalog entry in the `platforms` namespace, never data:
`requirement` ("{systems} {version} {releaseName} or later" / "… trở lên", with `releaseName` dropped when null),
`architectures.{arm64,x86_64}` ("Apple silicon", "Intel"), and `app.{mac,ios}` ("Mac app" / "ứng dụng Mac"). The
positioning tokens are derived from these values, never typed:

| Token | Derivation |
|---|---|
| `{deviceList}` | The `deviceNames` of every `released` platform, in data order, through the list formatter of §1.5: "Mac, iPhone and iPad" / "Mac, iPhone và iPad" |
| `{iosDevices}` | The iOS `deviceNames` through the same formatter |
| `{macRequirement}`, `{iosRequirement}`, `{macArchitectures}` | `requirement` and `architectures.*` over the platform's values |
| `{paidPlatformApps}` | `app.{id}` for every platform named in any paid feature's `platforms` (today: the Mac app) |

`PlatformsDataTest`:

- The statuses are in the enum.
- A `released` platform has `deviceNames`, `requirements`, `destinations` and `release`. Any other platform has none
  of them.
- The Mac `minVersion` is `13.0` with `releaseName` Ventura. Nothing in the file says 14 or Sonoma.
- `universalBinary` is false.
- The `iosEngines` ids exist in `engines.json` with `ios.inPicker`.
- The App Store URL has no country segment.
- `floorVersion` ≤ `release.version`.

Positioning guard test 4 ("availability never renders a platform whose status is not `released`") runs over SSR
output in `tests/Feature/Content/`.

#### `engines.json`

The per-engine facts the site needs, checked against the app at v0.77.0 (and v0.76.1 for the Homebrew floor), plus
the fields the IA and positioning read.

```jsonc
[{
  "id": "…", "name": "…",
  "page": "own",                         // own | section | hub
  "slug": "…",                           // own pages only; null otherwise
  "parent": null,                        // section only: the engine whose page holds this section (mariadb → mysql)
  "anchor": null,                        // section and hub: the id on the family page or the /databases row
  "category": "relational",              // relational | analytical | cloud | document | key-value | wide-column
                                         //   | search | streaming | coordination | files  (the /databases anchors)
  "featured": false,                     // positioning §1: {featuredEngines}, in data order
  "meta": false,                         // positioning §5: the meta-description subset of `featured`
  "distribution": "bundled",             // bundled | registry
  "driverPlugin": "…", "sinceAppVersion": "…", "minAppVersion": "…",
  "state": "published",                  // published | head_only
  "queryLanguage": "…", "defaultPort": 0, "connectionMode": "network",   // network | file | api
  "icon": "…", "monogram": "…",
  "docsSlug": "…",                       // docs.tablepro.app/databases/{docsSlug}; also the /databases/{docsSlug} redirect key
  "capabilities": {
    "ssh": true, "ssl": true, "import": true, "export": true,
    "schemaEditing": "full",             // full | partial | read-only
    "explain": ["…"],                    // EXPLAIN variants; [] means no EXPLAIN on this engine
    "dashboard": false, "usersRoles": false,
    "awsIam": false, "cloudSqlProxy": false,
    "nativeDump": null,                  // a tool id from facts.backup.tools, or null
    "readOnlyMode": true,                // false: every statement counts as a Safe Mode write
    "alwaysReadOnly": false
  },
  "versionFloor": { "text": "…", "enforced": false, "evidence": "…" },   // or null
  "bundledVersion": null,                // the embedded library version (SQLite, DuckDB), else null
  "limits": [{ "id": "…", "value": null, "evidence": "file:line" }],
  "ios": { "inPicker": false, "openable": false, "appearsAfterSync": false },
  "verified": { "macTag": "v0.77.0", "iosCommit": "…", "date": "2026-10-02" }
}]
```

- **Page placement** follows sitemap §A.3. An engine on its own page has `page: own` and a `slug`. A merged engine
  (MariaDB, CockroachDB, PGlite, ScyllaDB, TiDB, OceanBase, Databend, libSQL) has `page: section`, a `parent` and an
  `anchor`. A hub-only engine (Spanner, Typesense, Weaviate, Cloudflare R2 SQL, Dameng, SAP HANA) has `page: hub` and
  an `anchor` on `/databases`.
- **Capabilities** drive every engine list a feature page shows. Examples: the EXPLAIN engines on
  `/features/querying#performance`, and the Users & Roles, dashboard, import and schema-editing coverage on
  `/features/schema` and `/features/import-export` (sitemap §A.2, §E.4). No page types such a list.
- **Limits** (sitemap §E.1 block 9) keep their evidence here. The sentence lives in
  `content/{locale}/engines.json` → `limits.{limitId}`. A limit with a number carries `value`, and the sentence
  uses `{value}`.

`EnginesDataTest`:

- Ids, slugs and `docsSlug`s are unique, and anchors are unique within their page.
- `page: own` holds if and only if `slug` is set. The slug set equals `DatabaseSlugs::ALL` and the
  `content/{en,vi}/databases/*.json` sets.
- A `section` has an `own` parent and an anchor. A `hub` engine has an anchor and no slug.
- Positioning guard 5: every `featured` engine is `published` with `sinceAppVersion` ≤ `platforms.mac.floorVersion`.
  The featured set is PostgreSQL, MySQL, SQL Server, SQLite, MongoDB and Redis, in that order, and `meta` ⊆
  `featured`. Both sets are pinned by name.
- Every `nativeDump` exists in `facts.backup.tools`.
- Every limit id has text in both `content/{locale}/engines.json` files.
- The icon files exist.
- Every count the UI shows (published engines, the bundled/registry split) is asserted as a derivation, never as a
  literal.

#### `pricing.json`

```jsonc
{ "currency": "USD", "merchantOfRecord": { "name": "Polar" }, "cycles": ["monthly", "yearly", "lifetime"],
  "tiers": {
    "free": { "price": 0 },
    "starter": { "unit": "license", "prices": { "monthly": 2.99, "yearly": 24, "lifetime": 59 }, "activations": 2 },
    "team": { "unit": "seat", "prices": { "monthly": 1.25, "yearly": 10, "lifetime": 25 }, "seats": { "min": 5, "max": 200 },
              "activationsPerSeat": 1, "prioritySupport": { "responseBusinessDays": 1 } } },
  "refund": { "days": 7, "scope": "all-paid-plans" },
  "license": { "revalidateDays": 7, "offlineGraceDays": 30 },
  "billingPortalUrl": "https://polar.sh/tablepro/portal",
  "syncedWith": "TableProApp/license pricing and the Polar products" }
```

Paid features are **not** in this file (see `paid-features.json`). `PricingDataTest`:

- Every value is pinned to the literals above, as an unchanged-values guard.
- The rendered pricing-page JSON-LD offers equal these prices (SSR).
- "Save N%" is computed, never typed.

#### `paid-features.json`

```jsonc
[{ "id": "…", "name": "Compare & Sync", "tier": "starter", "platforms": ["mac"], "sinceAppVersion": "…",
   "lapse": "locks", "highlight": true, "page": { "path": "/features/schema", "anchor": "compare-sync" } }]
```

The ten `ProFeature` cases, in display order. `highlight` marks the examples behind positioning §9's
`{starterExamples}` and `{teamExamples}`. `page` is where the sitemap describes the feature (§A.2 section ids).
`PaidFeaturesDataTest`:

- There are exactly 10, split 8/2, and the names match `ProFeature.displayName` (`LicenseFeaturesTest` intent kept).
- `platforms` names only `released` platforms.
- Each `page.path` is a registry page, and `page.anchor` is a section id in that page's `content/en` file.
- The highlighted set is Compare & Sync, Query Insights, Data Rewind and iCloud Sync, plus Team Catalog and Team
  Library.
- Each id has a `detail` in `content/{en,vi}/paid-features.json`.

#### `facts.json`

```jsonc
{
  "links": { "github": "…", "appStore": "…", "sponsorsProgram": "…", "discord": "…", "x": "…", "facebook": "…",
             "telegram": "…", "docs": "https://docs.tablepro.app", "changelog": "…", "issues": "…", "productHunt": "…" },
  "support": { "email": "hello@tablepro.app" },
  "openSource": { "license": "AGPL-3.0" },
  "ai": { "providers": ["…"] },                                   // names, in the app's order
  "mcp": { "host": "127.0.0.1", "enabledByDefault": false, "toolGroups": ["…"],
           "clients": { "setupSheet": ["…"], "bridge": ["…"] } },  // as the app's MCP settings list them
  "safeMode": { "mac": { "levels": ["…"], "default": "silent" }, "ios": { "levels": ["…"] } },
  "filterOperators": { "mac": ["…"], "ios": ["…"] },
  "connectionImport": [{ "app": "TablePlus", "passwords": true }, { "app": "Navicat", "format": ".ncx", "passwords": true }],
  "dataImport": { "formats": [{ "id": "…", "name": "…", "exceptEngines": [] }] },   // CSV/TSV, JSON/JSONL, XLSX, SQL (.sql.gz, GO)
  "export": { "formats": [{ "id": "…", "name": "…", "engines": null, "exceptEngines": [], "via": null }] },   // engines: ["mongodb"] for MQL; exceptEngines: engines a format is not offered on; via: "plugin" for Parquet
  "backup": { "tools": [{ "id": "pg_dump", "engines": ["…"] }] },
  "sync": { "mac": { "categories": ["…"] }, "ios": { "categories": ["…"] }, "neverSynced": ["…"] },
  "limits": { "resultRowCap": { "value": 10000, "max": 500000, "unit": "rows", "platform": "mac", "evidence": "AppSettings.swift:…" } }
}
```

These are names, not counts. Any number the UI shows is a list length or a `limits` value. The `limits` entries are
the app's grid and editor numbers: the row cap and its maximum, the count-estimate threshold, the
chart limits, history entries and days per platform, and the Rewind window. Sponsors moved to `sponsors.json`, and
the app UI languages moved to `platforms.json`.

`FactsDataTest`:

- Every list is non-empty, with unique ids.
- The engine ids in `export` and `backup` exist in `engines.json`.
- Every limit has a number, a unit and evidence.
- **External URLs live only in data files:** `facts`, `sponsors`, the `comparisons` sources, the `platforms`
  destinations and the `redirects` targets. The guard scans `resources/js` and `resources/data/content` for
  `https?://` in `'`, `"` and backtick literals; the old guard saw only one quote style. Docs links in
  content are paths joined to `links.docs`.

#### `sponsors.json`

```jsonc
{ "verifiedAt": "2026-10-02",
  "sponsors": [{ "id": "…", "name": "CodeRabbit", "url": "https://…", "logo": { "light": "/images/sponsors/….svg", "dark": null } }] }
```

These are the verified current sponsors in display order: CodeRabbit, SimpleLocalize, Nimbus and Dwarves Foundation
(spec §0, sitemap §A). The homepage renders them third, with `rel="sponsored noopener"`. `SponsorsDataTest`:

- The names are exactly those four.
- getapps.cafe, Visnalize, Unikorn and Xermius are absent.
- The logo files exist, and every URL is HTTPS.

#### `comparisons.json`

```jsonc
{
  "checkedAt": "2026-10-02",               // the newest product checkedAt; the hub's "Facts checked {date}"
  "rows": ["platforms", "price", "licence", "databases", "ai", "mcp", "ios", "sync", "import"],
  "products": [{
    "id": "tableplus", "name": "TablePlus",
    "slug": "tableplus",                   // its /compare page, or null for a product only cited elsewhere
                                           // (MongoDB Compass, Redis Insight, SSMS, pgAdmin on engine pages)
    "checkedAt": "2026-10-02",
    "status": { "state": "active", "lastRelease": { "version": "…", "date": "…", "source": "s3" } },   // active | discontinued
    "platforms": ["mac", "windows", "linux", "ios"],
    "licence": { "name": "…", "openSource": false, "source": "s1" },
    "prices": [{ "edition": "…", "amount": 0, "currency": "USD", "per": "device", "period": "once", "source": "s2" }],
    "cells": {
      "ai":  { "state": "yes", "source": "s4" },
      "mcp": { "state": "qualified", "edition": "…", "note": "…", "source": "s5" }
    },
    "sources": [{ "id": "s1", "url": "https://…", "title": "…", "retrievedAt": "2026-10-02" }]
  }]
}
```

Competitor prices, dates, platforms, licences and sources are typed once, here, and never in a content file. The
prose (short answer, strengths, switching, FAQ and the text of each `note`) lives in
`content/{locale}/compare/{slug}.json`. **TablePro's own column is never stored here.** It is derived at render time
from `pricing.json`, `platforms.json`, `engines.json` and `facts.json`. Cells have the sitemap's three states:

| State | Meaning |
|---|---|
| `yes` | Supported |
| `no` | Not supported |
| `qualified` | A paid tier, partial support or a specific edition. It carries an optional `edition` (a proper noun) and an optional `note` id |

A row with no verified fact for a product has no cell. The page leaves that row out for that product rather than
guessing (sitemap §E.3). The compare pages, the hub's "At a glance" and "#open-source" tables, and the engine pages'
"Other tools" paragraphs all read the same entries.

`ComparisonsDataTest`:

- Every `source` resolves to an entry in that product's `sources`, with an HTTPS URL and a `retrievedAt`. Every cell
  and every price has a source.
- No `checkedAt` or `retrievedAt` is in the future. The top `checkedAt` equals the newest product `checkedAt`.
- The products with a slug equal `CompareSlugs::ALL` and the `content/{en,vi}/compare/*.json` sets (minus `index`).
- Every `note` has text in both locales.
- No key or value names TablePro.
- No field holds a benchmark: no RAM, startup or size figures.

#### `assets.json` and `redirects.json`

`assets.json`: §1.9. `redirects.json`: §1.7. `RedirectsDataTest`:

- Every status is 301 or 410. A 301 has a `to`; a 410 has none.
- There are no chains.
- No `from` is a live route or a sitemap URL.
- Every internal target returns 200.

**Release-dependent labels.** Any data row may carry `sinceAppVersion`, which positioning and the sitemap call
`since`. The UI shows a "0.77" style label only when that version is newer than `platforms.mac.floorVersion`. When
Homebrew catches up, bumping `floorVersion` removes every label at once, as a data-only change. This implements spec
§0 "mark 0.77-only items in data".

### 1.9 Asset manifest, `<AssetSlot>` and the handoff document

**One manifest per owning application.** The public site's manifest is `resources/data/assets.json` (design-system
§6.1, sitemap §A.8). L gets its own only if a platform page gains an editorial slot, and none does today. The file
starts from the sitemap §A.8 catalogue, which already names every slot. Pages only reference ids. A new slot or a
changed description is a manifest edit plus its brief in the family's fragment, so whoever supplies the images later
edits one file, not several.

The file has two parts. `kinds` states geometry and export rules once, taken from design-system §6.3 (the visual
contract). `assets` holds one entry per id.

```jsonc
{
  "kinds": {
    "window": {
      "type": "screenshot", "aspect": "16:9",
      "rendered": { "desktop": [1216, 684], "tablet": [720, 405], "phone": [343, 193] },
      "exportPx": [2432, 1368], "density": 2,
      "format": { "master": "png", "delivered": ["avif", "webp"] },
      "transparency": true,                    // `screencapture -w -o` keeps the window corners as alpha (docs/screenshots.md)
      "maxBytes": 250000,                      // the largest delivered file
      "sizes": "…"                             // from the design-system §4 container widths
    }
    // "mobile-crop", "detail", "phone", "ipad", "diagram", "illustration", "figure", "og-card": see the table below
  },
  "assets": {
    "mac-query-autocomplete": {
      "kind": "window",
      "type": "screenshot",                    // design-system §6.2 label set; equals the kind's type except for figures
      "family": "features",                    // fragment file and image folder
      "ownerRepo": "web",                      // web | license
      "slot": true,                            // false for handoff-only entries (bespoke OG art)
      "handoffPriority": "P2",                 // P1 hero or LCP · P2 a section's main image · P3 supporting
      "usedOn": [{ "path": "/", "section": "features" }, { "path": "/features/querying", "section": "editor" }],
      "aspect": null,                          // null = the kind's; set only for 1:1 mobile crops and blog figures
      "priority": false,                       // LCP: eager, fetchpriority=high and a head preload, once supplied
      "theme": "both",                         // both: light and dark variants | single
      "locale": "shared",                      // shared: one capture for both sites | per-locale: one file per locale
      "mobile": null,                          // id of a separate phone crop shown below 768px
      "description": { "en": "…", "vi": "…" }, // ≤ 160 / ≤ 200 characters; the visible placeholder text
      "alt": { "en": "…", "vi": "…" },         // proposed now; checked against the real image before `supplied`
      "caption": null,                         // { en, vi } or null; rendered only when supplied
      "replacement": { "dir": "public/images/features", "base": "mac-query-autocomplete" },
      "status": "placeholder",                 // placeholder | supplied   ← the only render switch
      "src": null,                             // filled when supplied (below)
      "legacySource": "/images/features/sql-editor-light.png"   // existing file kept as source; never rendered
    }
  }
}
```

When supplied, `src` is `{light: Source, dark?: Source}`, or `{en: {light, dark?}, vi: {…}}` for
`locale: per-locale`, where `Source = {widths: […], formats: ["avif", "webp"], width, height}`. The files are named
`{replacement.dir}/{base}-{light|dark}[-{locale}]-{width}.{format}`. Field names follow design-system §6.1 (`src`,
`mobile`, `priority`, `sizes`). This document adds the handoff fields.

**Kinds** (the values in `kinds`):

| Kind | Type label | Aspect | Rendered CSS px (≥1024 / 768 / 375) | Export | Master → delivered | Alpha | Max bytes |
|---|---|---|---|---|---|---|---|
| `window` | screenshot | 16:9 | 1216×684 / 720×405 / its `mobile` crop, else 343×193 | 2432×1368 (2×) | PNG → AVIF, WebP | yes | 250 KB |
| `mobile-crop` | detail | 4:5 (1:1 allowed) | shown only below 768: 343×429 | 686×858 (2×, cut from the 2× window capture) | PNG → AVIF, WebP | no | 120 KB |
| `detail` | detail | 4:3 | 696×522 / 720×540 / 343×257 | 1392×1044 (2×) | PNG → AVIF, WebP | no | 150 KB |
| `phone` | screenshot-phone | 9:19.5 | 280×607 / 280×607 / 240×520 | native capture (1179×2556 on the reference iPhone) | PNG → AVIF, WebP | no | 150 KB |
| `ipad` | screenshot-ipad | 4:3 | usually 1008×756, max 1216×912 / 720×540 / 343×257 | native landscape capture (device named in the fragment) | PNG → AVIF, WebP | no | 250 KB |
| `diagram` | diagram | 16:9 | as `window` | vector | SVG; one file per locale when it holds words | — | 60 KB |
| `illustration` | illustration | 16:9 | as `window` | 2432×1368 (2×) | PNG → AVIF, WebP | as needed | 250 KB |
| `figure` (blog) | per figure | from the source image | 704 wide / 720 / 343 | 1408 wide (2×) | PNG → AVIF, WebP | as the source | 200 KB |
| `og-card` (not a slot) | — | 1200:630 | — | 1200×630 | PNG | no | 320 KB |

Where each value comes from:

| Value | Source |
|---|---|
| Window, detail, phone and iPad geometry, and the 2× export | design-system §6.3, and `docs/screenshots.md` (a 1216 pt window on a retina Mac, captured with `screencapture -w -o`) |
| The 343×429 phone crop and the iPhone ratio | design-system §6.2 |
| Diagrams and composites at 16:9 | sitemap §A.8 |
| The 704px prose column | design-system §3.4 |
| The 1200×630 OG brief | spec §9.1 |
| The byte budgets | Targets set here. The test enforces them once files exist |

The sitemap §A.8 aspect column (16:10 windows, 3:2 crops) is superseded by these kinds. Its types map as follows:
crop → `detail`, iPhone → `phone`, iPad → `ipad`, composite → `illustration`.

**Component** `resources/js/components/ui/asset-slot.tsx` (new; it replaces `themed-image.tsx`, which is deleted in
cleanup). Props: `{id, sizes?, className?, caption?: boolean}`. `sizes` defaults to the kind's value. A component
passes its own only when the slot sits in a narrower column, and the value is the real slot width (the old
`hero.tsx:158` passed breakpoints).

| Mode (`status`) | Renders |
|---|---|
| `placeholder` | Design-system §6.2: a `<figure>` holding `<div role="img" aria-label="{typeLabel}: {description}">`, with `data-asset-id`, `data-asset-status="placeholder"` and the kind's `aspect-ratio`. Its visible, `aria-hidden` children are the type label from the `assets` catalog ("Screenshot placeholder" / "Ảnh chụp màn hình (giữ chỗ)"), the id in mono, and the localized description. A `mobile` id renders as a second placeholder swapped by CSS `display`. **No `<img>`, no `background-image`, no network request**. Where the shared `assetPlaceholders` prop is false (production), nothing renders, and a component that makes room for the slot checks `useShownSlot()` first |
| `supplied` | `theme: single`: one `<picture>` with `<source type="image/avif\|webp" srcSet sizes>` and `<img width height alt loading decoding fetchPriority>` with `object-fit: contain` (design-system §6.4). `theme: both`: two such pictures, the light one with `dark:hidden` and the dark one with `hidden dark:block`, both `loading="lazy"` (a lazy image under `display:none` is not fetched). `locale: per-locale` picks the page locale's sources. The id, type label and description never render in this mode |

**LCP preload.** For a supplied `priority` asset, the page's controller sets `lcpAsset` from
`App\Support\Assets\AssetManifest::lcpDescriptor($id)`. `app.blade.php` emits a small inline
script right after the theme partial. It reads `document.documentElement.classList.contains('dark')` and appends one
`<link rel=preload as=image imagesrcset imagesizes fetchpriority=high>` for that variant. A placeholder gets no
preload. The shared theme partial knows nothing about assets, so it stays byte-identical in L.

One manifest edit plus the dropped-in files activates the final art. Nothing else changes.

**Markdown slots.** Blog and legal markdown use `<asset-slot id="…"></asset-slot>` blocks. `Blog/Post.tsx` splits
`bodyHtml` on those blocks and renders `<AssetSlot>` between the HTML chunks, so there is one implementation and no
PHP copy of the placeholder markup. The existing `public/images/blog/*.png` files stay as `legacySource`.

**The handoff document.** `docs/visual-assets.md` is generated, never edited by hand. `php artisan assets:handoff`
(`make:command`) merges the manifest's structured fields with the prose fragments in
`docs/rebuild/assets/{family}.md`. For each id it adds the components that render it, found by the same scan the
tests use: `<AssetSlot id="…">` literals, `"asset"` ids in content, and `<asset-slot>` blocks in markdown.
`--check` exits non-zero when the committed file is stale. Each spec §9.1 field has exactly one home:

| Spec §9.1 field | Where it lives |
|---|---|
| Stable ID, visual type | manifest `id`, `type` |
| Priority | manifest `handoffPriority` |
| Exact pages, sections and components | manifest `usedOn` (pages and section ids); components derived by the generator |
| Owning repository | manifest `ownerRepo` |
| Purpose | fragment "Purpose" |
| Precise scene, including the named dataset | fragment "Scene" |
| Framing, focal area, safe areas, text or arrows | fragment "Framing" |
| Aspect, rendered desktop and mobile size, export pixels and density, format, transparency, file-size target | manifest `kind` → `kinds` (plus an `aspect` override) |
| Light and dark | manifest `theme`; fragment "Light and dark" for anything the flag cannot say |
| Separate mobile crop | manifest `mobile` |
| Locale needs; proposed EN and VI alt text and captions | manifest `locale`, `alt`, `caption`; fragment "Locale" |
| Suggested filename and replacement path | manifest `replacement` |
| Status | manifest `status` |
| Unresolved evidence | fragment "Open evidence" |
| Concise Vietnamese explanation | fragment "Tóm tắt cho chủ sở hữu" |

**`docs/rebuild/assets/_template.md`**. A fragment holds one section per id, in exactly this shape. The headings
are fixed, because the generator and the test read them. The data is written in English, and the last heading is
the Vietnamese brief.

```markdown
## mac-query-autocomplete

### Purpose
One sentence: the single capability or idea this image proves.

### Scene
- Platform and release: Mac, TablePro 0.77.0 (the copy floor). A 0.77-only feature says so.
- Screen, panel and feature state: …
- Engine and dataset: e.g. PostgreSQL with the `shop` sample (sitemap §A.8 legend). Sample data only; never a real
  connection or customer data.
- Operation and visible values: what was typed, run or selected, and which values must be legible.
- Controls that must be visible: …
- For a diagram or illustration: subject, composition, style and the one idea it explains. It invents no product
  function and draws no app chrome.

### Framing
Full window or detail crop; the context that must stay; the focal area; what must stay clear of the edges and of
any crop (for a window with a `mobile` crop, the focal area must fit inside it); text or arrows (none unless stated).

### Light and dark
Both variants from the same frame (switch the macOS appearance, not only the app theme), or why one image serves both.

### Locale
Default: one English app capture serves both sites, because the copy keeps the English UI terms (spec §0). Note any
exception, and what the capture must show for the proposed alt text and caption in the manifest to be true.

### Open evidence
What must be confirmed before capture (for example, that the `shop` dataset's files are at hand), or "None".

### Manifest changes
A new id or a changed description to apply to the manifest, or "None".

### Tóm tắt cho chủ sở hữu
Hai đến bốn câu tiếng Việt, xưng "bạn": cần chụp gì, trên engine và dataset nào, ở trạng thái nào, và vì sao. Giữ
nguyên tên kỹ thuật bằng tiếng Anh (query, schema, connection, Safe Mode…).
```

The generated document opens with an English introduction and a short Vietnamese "Cách thay ảnh" (where to put the
files, which manifest fields to change, which tests to run). Then come the shared capture rules (linking
`docs/screenshots.md`; sample data only; both themes), the kinds table, and the assets grouped by owning repo, then
by page family. Last come the OG section, which records the temporary state (the generated template cards `/og.png`,
`/og/vi/default.png` and `/og/{family}/…`) and the bespoke 1200 × 630 brief with its text and safe-area rules, and
the list of legacy source files kept as source, with any proposed later cleanup.

**Platform.** If the IA gives an L page an editorial slot, L gets its own `resources/data/assets.json` with the same
schema and a shared copy of `asset-slot.tsx` (§3). The one handoff document still covers both repos, grouped by
`ownerRepo`.

**Tests** (`tests/Feature/Assets/`):

`AssetManifestTest`:

- **References.** Every `<AssetSlot id="…">` literal in TSX, every `"asset"` id in content and every `<asset-slot>`
  id in markdown exists with `slot: true`. Every `slot: true` id is used.
- **Handoff fields.** Every entry has all of them:
  - `kind`, which must be a key of `kinds`, and `type`, which must equal the kind's type except for `figure`;
  - `family`;
  - `ownerRepo` (`web` or `license`);
  - `handoffPriority`;
  - `usedOn`, non-empty, where each path is a registry URL or a blog post;
  - `theme` and `locale`;
  - `alt.en` and `alt.vi`;
  - `replacement`, with `dir` under `public/images/` (`public/og/` for an `og-card`) and `base` equal to the id;
  - `status`.

  An `aspect` override is allowed only on a 1:1 `mobile-crop` or a `figure`.
- **Kinds.** Every kind has `rendered`, `exportPx` (or vector), `density`, `format`, `transparency` and `maxBytes`.
  The `window`, `detail`, `phone` and `ipad` values equal design-system §6.3. The test pins them, so a change to the
  visual contract has to be a deliberate edit to both files.
- **Descriptions.** At most 160 characters in English and 200 in Vietnamese (design-system §6.2), NFC, and never
  containing an id.
- **Status.** A placeholder has `src: null`. A supplied entry has every file at every width and format, with true
  pixel sizes; its light and dark variants share dimensions; and each file is within `maxBytes`.
- **SSR.** Pages with placeholders contain no `<img>` inside `[data-asset-status=placeholder]`.
- **Fixture.** A fixture-only entry rendered by a test page exercises the supplied path without installing art
  (spec §13).

`HandoffDocumentTest`:

- Every manifest id, slot or not, has a fragment section with all eight headings, each non-empty.
- The Vietnamese summary is NFC and contains Vietnamese letters.
- `docs/visual-assets.md` equals the `assets:handoff` output.

`ImageAssetsTest` keeps its srcset checks.

### 1.10 Theme

The visual contract is design-system §2.8. This section only places its files. Where an earlier draft of this
document differed (a `data-theme` attribute, a `#0a0a0a` dark `theme-color`, a hook for the LCP preload), the
design-system values win.

**Shared head partial** `resources/views/partials/head-theme.blade.php` (shared file, §3). It replaces both
media-scoped `theme-color` metas (`app.blade.php:23-24`) and the theme block at `:76-90`. Its content is the script in
design-system §2.8, verbatim:

```html
<meta name="theme-color" content="#ffffff">
<script>
(function () {
  var choice = 'light';                                         // light by default
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'system' || t === 'light') { choice = t; }
  } catch (e) {}
  var dark = choice === 'dark' || (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var root = document.documentElement;
  if (dark) { root.classList.add('dark'); }
  root.dataset.themeChoice = choice;                            // data-theme-choice drives ThemeControl's icon
  root.style.colorScheme = dark ? 'dark' : 'light';
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) { m.setAttribute('content', dark ? '#121212' : '#ffffff'); }
})();
</script>
```

`#ffffff` and `#121212` equal `--background` in each theme (design-system §2.2). If the visual system changes those
tokens, the partial and `ColorContrastTest` change with them. The partial knows nothing about assets. The LCP preload
is a separate block in `app.blade.php` (§1.9), so the partial stays byte-identical in L. CSS adds
`:root { color-scheme: light } .dark { color-scheme: dark }`.

**`resources/js/lib/theme.ts`** (shared file) has the pure functions `readTheme()`, `applyTheme(choice)` and
`subscribeSystem(cb)`. Storage access is guarded. `applyTheme` writes the key, toggles `.dark`, and updates
`data-theme-choice`, `color-scheme` and `theme-color`, with the one-frame `theme-switching` class from design-system
§2.8. A `storage` event listener syncs tabs on the same origin, which includes `/account`. While `system` is chosen,
it follows `matchMedia` changes.

**`resources/js/components/shared/theme-control.tsx`** (shared file) implements both forms in design-system §5.3.16:

- `variant="menu"` (header): a 40 × 40 icon button that opens three `menuitemradio` items.
- `variant="segmented"` (footer and mobile menu).

It takes its labels as props, so the file stays identical in both repos while each repo passes its own strings. The
SSR markup does not depend on the theme. The icon and the selected style come from CSS on
`html[data-theme-choice=…]`, and `aria-checked` is corrected on mount. It supports arrow keys and Escape, and has an
accessible name that contains the visible text.

Polar's overlay keeps reading `.dark` (`pricing.tsx:162`). The Phiki dual theme keeps `.dark`.

### 1.11 Typography for Vietnamese

The values are design-system §3.1-3.3. This section only places the files.

- **Fonts.** They move into the shared file `resources/css/fonts.css`, which replaces the three `@import`s
  (`app.css:13-15`). It holds hand-ordered `@font-face` blocks for **Inter opsz (normal) and IBM Plex Mono 400 only**:
  the 600 face served the uppercase eyebrows, which are retired. The order is **latin-ext, vietnamese, latin**. The
  last declared face is checked first (CSS Fonts 4 §4.5), so the 22 shared Vietnamese letters resolve to the 15 KB
  `vietnamese` subset instead of the 133 KB `latin-ext` one (measured 258 KB → 111 KB per Vietnamese page). The
  cyrillic and greek faces are dropped. URLs are relative to `node_modules/…/files/*.woff2`. After `vite build`,
  check that the CSS order survives and that the manifest still has keys for the preloaded files.
- **Preloads** (`app.blade.php:42-49`):
  - `inter-latin-opsz-normal.woff2` on every page.
  - `inter-vietnamese-opsz-normal.woff2` added on `vi` pages.
  - No mono preload: nothing above the fold is mono now.

  Today's Plex Mono 600 preload is removed. Measure LCP with and without the Vietnamese preload on `/vi`.
- **Line height.** `@theme inline` inlines token values, so a `:lang(vi)` override of a token does nothing.
  Design-system §3.3 avoids this with role utilities (`@utility type-display` … `type-mono`)
  whose `line-height` reads a variable. `:root, :lang(en)` sets `--lh-*` to the English values, and `:lang(vi)` sets
  the Vietnamese ones: **1.3** for display, h1 and h2, 1.4 for h3, and 1.5-1.6 for body roles. They live in the shared
  `tokens.css` (§3). `:lang()` matches through inheritance, so an English quotation marked `lang="en"` on a
  Vietnamese page gets English metrics back. There is no unlayered heading rule and no separate `vi` variant.
- **Never clipped, never uppercase.** Nothing that may hold Vietnamese text gets `truncate`, `line-clamp` or
  `overflow: hidden`. No label uses uppercase with tracking, in either language (design-system §3.3).
- `text-wrap: balance` on headings and `pretty` on leads. No `hyphens: auto` and no `word-break: keep-all`.
- **NFC.** Every Vietnamese source is NFC, checked by `tests/js/content-nfc.test.ts`. That covers
  `resources/data/content/vi/**`, `resources/data/legal/vi/**`, `resources/blog/vi/**`,
  `resources/js/i18n/messages/vi/**`, `lang/vi/**`, and the `vi` values in `resources/data/assets.json`. There is no
  `resources/data/vi/` directory: design-system §3.1's path means these. In L, `LangParityTest` checks NFC for its
  `lang/vi`.
- `LandingLayout` sets `document.documentElement.lang = locale` in an effect, as a safety net for history
  navigation. The skip link text comes from the catalog (it is hard-coded at `landing-layout.tsx:51-53`).

### 1.12 Third-party scripts

| Script | Today | New |
|---|---|---|
| Crisp | Head loader on every page (`app.blade.php:129-131`). It sets `crisp-client/session` on `.tablepro.app` before any choice | Removed from Blade. A shared `resources/js/lib/crisp.ts` provides `openChat(websiteId, locale)`: on the first call it sets `$crisp`, `CRISP_WEBSITE_ID` and `CRISP_RUNTIME_CONFIG = {locale}`, injects `client.crisp.chat/l.js` once, then pushes `chat:open`. Only an explicit "Live chat" button calls it. Privacy discloses what Crisp sets after the click |
| Polar / LemonSqueezy SDK | On every page (`app.blade.php:92-96`) | Removed from Blade. `resources/js/lib/checkout-sdk.ts` provides `loadCheckoutSdk(provider): Promise<void>`, which injects the pinned `@polar-sh/checkout@0.2.0` embed or `lemon.js` once. It warms on the first `pointerenter`/`focus` of a buy button, and checkout awaits it before `EmbedCheckout.create` |
| Product Hunt badge | API hotlink; sets `__cf_bm` | Hotlink and badge removed. The homepage's `#open-source` section has one plain text link, "TablePro on Product Hunt", to `facts.json` → `links.productHunt` (decided 2026-10-03): no image and no request to Product Hunt |
| Hero preload script | Every page (`app.blade.php:81-89`) | Removed (§1.9 replaces it) |
| GA4 Consent Mode | Head block (`app.blade.php:97-128`) | **Unchanged, including the order** (the contract) |
| Cloudflare Web Analytics | Injected by Cloudflare, not by the repo | Outside the repo. Privacy must disclose it |

### 1.13 Download page, release data and GitHub robustness

**`App\Services\Releases\MacReleaseService`** (new; it replaces `LandingController.php:94-255`):

| Step | Behaviour |
|---|---|
| Primary | `GET https://api.github.com/repos/{services.github.repo}/releases/latest`. Plugin releases are published with `--latest=false` (`build-plugin.yml:325`), so "latest" is always the app. Accept the release only if it has both `TablePro-{v}-arm64.dmg` and `-x86_64.dmg` and is neither draft nor prerelease. Output: `{version, publishedAt (Y-m-d), publishedAtFormatted (isoFormat LL in the request locale), assets: {arm64: {url, bytes}, x86_64: {url, bytes}}, releasesUrl, source: 'github'}` |
| Fallback | `GET https://raw.githubusercontent.com/TableProApp/TablePro/main/appcast.xml` (not subject to the API rate limit). Parse the top `<item>` (`sparkle:shortVersionString`, `pubDate`, `minimumSystemVersion`). The DMG URLs come from `platforms.json` `assetTemplate`; the naming has been stable from 0.73 to 0.77 and is enforced by `build.yml:254-270`. `source: 'appcast'`, `bytes: null` |
| Caching | A fresh value is cached for 15 minutes under `releases:mac`. Every success also writes `releases:mac:last-good` with `Cache::forever`. On failure, serve last-good and cache a failure marker for 5 minutes, so a broken API is not retried on every request. Laravel's `remember` never stores `null` (`Repository.php:585-590`), which is today's retry storm. With no last-good copy the result is `source: 'unavailable'`, both buttons go to `https://github.com/TableProApp/TablePro/releases/latest`, and no version is shown |
| Rate | At most 4 GitHub calls per hour (today the worst case is 61 per hour against the unauthenticated limit of 60) |
| Dropped | `countLast30Days` and the windowed download total (it reported floors of a shrinking window). Any stats come back only with a stated method |

`App\Services\Releases\GitHubRepoService::stars(): ?int` was built to the same pattern (6-hour fresh cache, last-good
copy, 10-minute negative cache) and removed during integration: no page shows a star count, so it had no caller.

**`php artisan release:check`** (new command, `make:command`, run by hand). It compares the GitHub latest release,
the appcast top item, `formulae.brew.sh/api/cask/tablepro.json` and the iTunes lookup against `platforms.json`
(`release`, `floorVersion`, `ios.release`). It prints any drift and exits
non-zero on a mismatch. It is never scheduled. It runs at final verification because spec §0 says to re-check the
release state. Its tests use `Http::fake`.

**Client** (`resources/js/pages/Download.tsx`, rewritten). The pure logic lives in `resources/js/lib/device.ts`, which
`node --test` can load:

| Function | Rule |
|---|---|
| `classifyDevice(ua, maxTouchPoints)` | `ios` when `/iPhone\|iPad\|iPod/` matches, or when `Macintosh` matches and `maxTouchPoints > 1` (iPadOS desktop UA). `mac` when `Macintosh` matches. Otherwise `other`. **An iPhone UA ("like Mac OS X") is never `mac`**; the old page treated it as one |
| `archHint()` | Chromium `navigator.userAgentData.getHighEntropyValues(['architecture'])`: `arm` gives `arm64`, `x86` gives `x86_64`, anything else `null`. Safari and Firefox give `null`, and the page then never guesses |

**Behaviour.** SSR renders both Mac buttons with their real DMG URLs from the server props, plus the Homebrew card
(`brew install --cask tablepro`, with a note that Homebrew can lag a release; the cask version is not shown) and the
App Store card. After mount, an `ios` device swaps card order so the App Store card leads, and the Mac card says
"Download on your Mac". On a `mac` device with a hint, the matching button gets the primary variant (same
dimensions, so no layout shift) plus "Detected: Apple silicon". With no hint, both buttons stay equal under an "About
This Mac → Chip" help line. **Nothing starts on its own**, and no copy says a download is starting. After a click the
page may say "If the download didn't begin, use this link". `trackDownload(location, platform)` is unchanged. No
Windows or Linux buttons appear.

### 1.14 Forms and cross-app contracts

| Contract | Change |
|---|---|
| `POST /checkout {tier, cycle, seats?, discount_code?, attribution?}` → `{url}` | Adds `locale` (the page locale). The response and the other fields are unchanged. The client maps 429 and network errors to catalog strings and shows the server's `message` for 422 (which the platform localizes) |
| `POST /discount/preview {code}` | Unchanged. The invalid-coupon toast text comes from the catalog |
| `POST /newsletter/subscribe {email}` | Adds `locale`. Fallback strings in `use-email-form.ts:40-56` move to the `forms` namespace. 429 always uses the catalog, because the platform's 429 text is shared with the license API and stays English |
| `GET /api/newsletter/stats` | **The public site no longer calls it.** The new footer shows no subscriber count (sitemap §B.3, design-system §11.1, item 6), so `footer.tsx:122`'s lazy fetch goes. The endpoint stays as a platform contract. `Contracts/PublicContractsTest` asserts that no file in `resources/js` fetches it |
| GA events `download_click{location, platform}`, `checkout_started{tier, cycle}`, `newsletter_signup_clicked{source}` | Names and parameters unchanged. The new layout may add new `location` values; `platform` stays `mac\|ios` |
| Storage keys `tablepro:analytics-consent`, `theme`, `tablepro:attribution`, `tablepro:banner-dismissed` | Unchanged. `theme` now has writers (§1.10) |
| Consent head order | Unchanged (pinned) |
| Inbound URLs `/?ref=…#pricing`, `/download`, `/account`, `/privacy` | Unchanged (§1.1) |
| Assets the platform pulls from this app: `/logo.png`, `/images/logo.png`, `/site.webmanifest`, `/privacy#cookies` | **Do not move.** `#cookies` stays an explicit heading id in both locales' privacy markdown |

### 1.15 OG generation

`app/Console/Commands/GenerateOgImagesCommand.php`:

- Signature: `og:generate {--type=all : site|blog|database|compare|feature|all} {--slug=} {--locale=all : en|vi|all}`.
- Output: `en` keeps today's paths (`public/og/{type}/{slug}.png`), so existing shares keep resolving. `vi` writes to
  `public/og/vi/{type}/{slug}.png`. The `site` type writes `public/og.png` (en) and `public/og/vi/default.png` (vi).
- Sources: blog posts come from `BlogService::all($locale)` front matter (`title`, `ogPunchline`), and
  feature/database/compare pages from `content/{locale}/{family}/{slug}.json` `og`. `site` comes from
  `content/{locale}/home.json` `og`. Template labels come from `lang/{locale}/og.php`, dates from
  `isoFormat('LL')` in the card's locale.
- Templates: `resources/views/og/{site,blog,page}.blade.php`, rewritten to the new visual system. They set
  `<html lang="{locale}">` and embed Inter latin and vietnamese woff2 as base64 `@font-face`, so Linux CI renders the
  same glyphs as the Mac (`og.yml:28` runs on ubuntu). All fields are escaped `{{ }}`; the unescaped `*Html` fields
  (`compare.blade.php:176,181`, `database.blade.php:164`) are removed with the old templates. No screenshot and no app
  chrome appear on cards.
- **Generic fallback.** The template-generated brand card (logo plus the localized identity sentence) is written to
  `/og.png` for English, preserving supplied artwork at that URL, and to `/og/vi/default.png` for Vietnamese (sitemap §C.7). It is the
  default `og:image` per locale. The English `/og.png` now carries the approved Figma design. Replacing the file
  at the same URL corrects every external cache and old share that points to it. The old image stays in git
  history. `/og@2x.png` is deleted: it was publicly served, carried the same slogan, and nothing referenced it (git
  history keeps it). Bespoke social art stays in the asset handoff (spec §9.1;
  the `og-card` kind in §1.9).
- `.github/workflows/og.yml` gets a `locale` input and the new `type` choices. It still commits `public/og/**`.
- Locally, Browsershot still needs `PUPPETEER_EXECUTABLE_PATH` pointed at a Chromium build.

### 1.16 Deploy script and its test

`scripts/deploy.sh` changes. The forced-command key runs the copy already on the server, so these changes take effect
one deploy late (`deployment.md:162-181`):

| Pattern (line) | Change | Why |
|---|---|---|
| PHP_CHANGED (`:220`) `^(app/\|config/\|routes/\|bootstrap/\|resources/views/\|composer\.(json\|lock))` | Add `lang/` and `resources/data/locales\.json` | `lang/*.php` files are `require`d and cached by opcache (`validate_timestamps=0`). `locales.json` decides the route groups, so `route:cache` must rebuild |
| FRONTEND_CHANGED (`:187`) | Unchanged | `^resources/(js\|css\|data)/` already covers `content/`, `legal/`, `assets/` and nested files |
| CONTENT_CHANGED (`:226`) | Unchanged | `resources/blog/` covers `resources/blog/vi/`; `resources/data/` covers content and legal |
| `bundles_are_stale` (`:148-155`) | Unchanged | It already scans all of `resources` |
| `resources/data/redirects.json`, `engines.json` | No PHP_CHANGED entry needed | `CanonicalizeRequest` reads them per request (§1.7). They are not route definitions, so no `route:cache` depends on them |

`tests/Feature/DeployScriptTest.php`:

- Extend the PHP_CHANGED dataset with `lang/vi/og.php` and `resources/data/locales.json`.
- Extend FRONTEND_CHANGED and CONTENT_CHANGED with `resources/data/content/vi/home.json`,
  `resources/data/legal/vi/privacy.md` and `resources/blog/vi/mcp-database-claude.md`.
- Make the "every imported data file" case recursive: the glob becomes `resources/data/**/*.json`, and the import
  regex accepts `@data/` and nested paths (`([a-z0-9/-]+\.json)`; today's `[a-z0-9-]+` cannot see `content/en/x.json`).
- Add a case that `lang/` does **not** trigger a bundle rebuild.

Docs: `docs/deployment.md` (the new directories; correct the claim that "a blog post costs no build", which
`bundles_are_stale` contradicts) and `docs/architecture.md` (§1.18).

### 1.17 Tests: keep, rewrite, delete, add

Today's suite (at the start of the rebuild): 197 pass and 46 skip without SSR; 243 pass with SSR. Every test that
hits GitHub gets `Http::fake()`, and `tests/Pest.php` adds `Http::preventStrayRequests()` in a `beforeEach`. Several
cases call live `api.github.com` today.

**Existing files:**

| File | Verdict | Rationale and replacement |
|---|---|---|
| `DeployScriptTest.php` | **Keep, extend** | §1.16 |
| `Console/GenerateSitemapTest.php` | **Rewrite** | The URL set equals every (entry, locale in `indexableLocales`) of `PageRegistry::all()`. Each URL's alternates list itself and every cluster sibling. `x-default` points to English. English-only posts and `/blog` have no alternates. **`/vi/blog` is absent** although it renders. The sitemap holds no platform prefixes, redirect or 410 sources, or Error pages |
| `Console/GenerateOgImagesTest.php` | **Keep, extend** | The fake renderer stays. Add `--locale`, the `vi` output paths, the `site` type and the new render counts. Every card a page references exists (closes the gap where "nothing tests that an og:image resolves") |
| `Landing/AnalyticsConsentTest.php` | **Rewrite assertions, keep semantics** | Keep the head order, the never-granted ad signals, the shared key, a ConsentBar in the layout, a Cookie-settings control and equal Allow/Decline buttons. Move the source-string matches (`footer.tsx` label, `consent-bar.tsx` literal) to SSR-rendered HTML in both locales. The Privacy assertions (`_ga`, the key, the lawful basis, the reopen control, `id="cookies"`) move to `legal/{en,vi}/privacy.md` |
| `Landing/BlogTest.php` | **Rewrite** | Replace the post count with "rendered posts equal the files". Add `/vi/blog`, the English-label rule and the `/vi/blog/{en-only}` 404 with its suggestion. "Related posts" stay within the same locale |
| `Landing/ColorContrastTest.php` | **Keep, re-key** | Point it at `resources/css/tokens.css` and whatever token names the visual system uses. It is a valid accessibility guard |
| `Landing/CompareTableTest.php` | **Delete** | The homepage compare table is retired (the component pin). Its "values come from data" rule moves to the compare content tests |
| `Landing/DatabaseGridDataTest.php` | **Delete → `Data/EnginesDataTest`** | The grid JSON is retired. Engine counts are derived from `engines.json` |
| `Landing/EngineCountTest.php` | **Delete → `Content/NoTypedCountsTest`** | Generalises its "derive, don't type" rule to every content and catalog file in both locales |
| `Landing/FundingModelTest.php` | **Delete** | The position assertions pin the old design. The plea-vocabulary ban moves into `BannedClaimsTest`, and the URL-literal guard into `Data/FactsDataTest` (fixed for both quote styles) |
| `Landing/HomePagePropsTest.php` | **Delete → `Releases/MacReleaseServiceTest`** | Fake GitHub responses cover: the latest endpoint, a plugin-only "latest" rejected, a missing arch rejected, the appcast fallback, the last-good copy, the negative cache, the `unavailable` state, and the absence of live calls |
| `Landing/HomepageRenderTest.php` | **Rewrite (SSR)** | One `<h1>`, one `<main>` (this also protects the deploy smoke test, `deploy.sh:326-349`), and the Sponsors section as the **third** section (spec §0; the old "below pricing" assertion conflicts with it). `#pricing` exists on `/` and `/vi`. No rating, no FAQPage. JSON-LD node types per §1.6 |
| `Landing/ImageAssetsTest.php` | **Keep, extend** | Add the manifest `src` files |
| `Landing/InternalLinksTest.php` | **Rewrite** | Its second case is tautological. Replace both with a crawl: SSR every registry URL in both locales, collect internal `href`s, and require each to return 200 or be an allowlisted platform path, with no link to a redirect or 410 source |
| `Landing/IosPageTest.php` | **Rewrite** | Keep: `ios` is never a database slug; no TestFlight, `/beta/signup` or "Join Beta"; Apple badge files unmodified; the App Store URL has no country segment; one `#ios-app` node; no rating. The engine names come from `platforms.ios.iosEngines` rather than a class-string regex |
| `Landing/LandingSeoTest.php` | **Keep, extend** | Exactly one robots meta per page in both locales, with the value from the registry: `index, follow` on indexable pages, `noindex, follow` on `/vi/blog`, 404 and 410. A self canonical only on indexable pages; hreflang; `og:locale`; JSON-LD `inLanguage`; unknown slugs 404; robots.txt |
| `Landing/LandingStructureTest.php` | **Delete** | Nearly all of it pins the ledger and rule design that spec §9 retires. Its one accessibility rule ("Included"/"Not included" in words) moves to the pricing component test |
| `Landing/LandingTest.php` | **Rewrite** | Every page family renders in each of its render locales with `Http::fake`, including `/vi/blog` |
| `Landing/LicenseFeaturesTest.php` | **Rewrite** | Run it against `paid-features.json` (10, 8/2, order, names) and the `en`/`vi` detail files; each feature named once in the plan table (SSR). Drop the reading-budget pin |
| `Landing/ProductHuntBadgeTest.php` | **Delete** | The hotlink is removed. If the design keeps a local badge, assert it is a local file |
| `Landing/PurchaseAttributionTest.php` | **Keep, update paths** | Add: `locale` is present in the checkout body, and attribution is still attached before `fetch('/checkout')` |
| `Landing/TopBannerTest.php` | **Keep semantics, rewrite** | Keep the pre-paint dismissal script, "disabled leaves no trace" and the href. The length limits move to `banner` catalog values in both locales |
| `Seo/SeoSmokeTest.php` | **Rewrite** | Iterate the registry for both locales: the component name and a 200 |
| `Seo/StaleClaimsTest.php` | **Delete → `Content/BannedClaimsTest`** | It keeps the slugs-equal-routes rule and the no-ratings rule, and adds the missing guards (MCP tool count, AI provider count, macOS floor) |
| `tests/js/consent.test.ts`, `tests/js/attribution.test.ts` | **Keep** | Paths unchanged (the shared `consent.ts` keeps its location) |

**New tests:**

| File | Proves |
|---|---|
| `Localization/LocaleRoutingTest` | Every registry page returns 200 in each of its locales. `<html lang="vi">` on `/vi/*` (Blade, so no SSR needed). `Accept-Language: vi` on `/` gives English 200 with no `Location`. No `Set-Cookie` and no `Vary: Accept-Language` anywhere. `/fr` and `/vi/vi` 404. Route names `vi.*` resolve. Each slug constant class equals its content files |
| `Localization/LangParityTest` | `lang/en` and `lang/vi` (PHP) have the same keys and `:placeholder` sets |
| `Localization/ContentParityTest` | `content/en` and `content/vi` have the same file trees, key structure, `{token}` sets and asset ids. `legal/{en,vi}` have the same heading-id sets. Every `blog/vi/*.md` has an English twin and keeps its `date`. An untranslated-value heuristic fails when a `vi` value equals its `en` value outside an allowlist (product names, code, commands) |
| `Seo/HreflangReciprocityTest` | Through props (fast): for every registry URL, `seo.alternates` equals the registry, and each alternate's own props list the source back. Through SSR: the head renders exactly those links plus `x-default`, the self canonical, and `og:locale`/`:alternate`. **`/vi/blog`** renders with `<html lang="vi">`, `robots` `noindex, follow`, no canonical, no alternates and no `og:locale:alternate`, and `/blog` lists no `vi` alternate. The switcher still links the two |
| `Seo/SitemapAlternatesTest` | The sitemap's `xhtml:link`s equal `seo.alternates` for every URL |
| `Seo/RedirectsTest` | Each map entry gives a 301 with the query and the target fragment preserved, or a 410 with the branded Error page and `noindex, follow`. No chains. No `from` is a live route. Internal targets return 200. Normalisation (§1.7): `/blog/` → `/blog`, `/vi/` → `/vi`, `/index.php` → `/`, `/index.php/blog?ref=x` → `/blog?ref=x`, and `/mariadb-client/?utm_source=y` → `/mysql-client?utm_source=y#mariadb` in **one** hop. `/databases/{docsSlug}` reaches the engine page. Uppercase and `//blog` stay 404, and a `POST` passes through untouched |
| `Seo/ErrorPagesTest` | 404 and 410 per locale: the status, `lang`, `noindex, follow`, the Error component and the suggestion link. The Blade 503 fallback renders in both locales |
| `Data/{Locales,Platforms,Engines,Pricing,PaidFeatures,Facts,Sponsors,Comparisons,Redirects}DataTest` | §1.8 |
| `Assets/AssetManifestTest`, `Assets/HandoffDocumentTest` | §1.9 |
| `Content/BannedClaimsTest` | English and Vietnamese phrase lists over content, catalogs, legal and translated posts (historical release posts are exempt as archives). Banned: "every database", "all platforms", "cross-platform", "coming soon", "nothing leaves your device", unscoped "no account" or "fully offline", "Universal Binary", "macOS 14", "Sonoma", "whole app is free", "free forever", "no feature gating", hype words, benchmark patterns (`\d+\s?ms\b`, `\d+\s?MB` with idle/RAM, `\d+x faster`, "faster than"), "PPP", "purchasing power", "bank transfer", "VND", "₫", named local payment gateways, and `aggregateRating`/`ratingValue`. Vietnamese counterparts and the allowlist as in positioning §12 |
| `Content/NoTypedCountsTest` | No digit followed by databases/engines/drivers/features/tools/providers/plugins (or the Vietnamese equivalents) in content or catalogs |
| `Contracts/PublicContractsTest` | The fetch targets and bodies for the three endpoints the site calls (`/checkout`, `/discount/preview`, `/newsletter/subscribe`), and that nothing in `resources/js` fetches `/api/newsletter/stats`. Also the GA event names and parameter keys, the four storage-key constants, and the consent head order in the rendered Blade |
| `Theme/ThemeHeadTest` | The partial is present and equals design-system §2.8. Storage is read inside `try`. `light` is the default. `color-scheme` and `data-theme-choice` are set. There is exactly one `theme-color` meta, with `#ffffff` and `#121212` as its two values. No `media="(prefers-color-scheme` appears anywhere in `resources`. No `data-theme=` attribute selector remains |
| `ThirdParty/ScriptsTest` | No `client.crisp.chat`, `@polar-sh/checkout`, `lemon.js` or `producthunt.com` in the Blade or in SSR HTML. The one exemption is the homepage's plain `<a href="https://www.producthunt.com/products/tablepro">` in `#open-source` (§1.12); the host stays banned in `src`, `srcset`, `<link>` and `<script>` |
| `Releases/MacReleaseServiceTest`, `Console/ReleaseCheckCommandTest` | §1.13 |
| `SharedFilesTest` | §3 |
| `tests/js/i18n-catalogs.test.ts` | Placeholder and plural parity, and no empty strings |
| `tests/js/i18n-core.test.ts` | `interpolate`, `plural` (`vi` gives only `other`), `<Trans>` tag splitting, `formatUsd` |
| `tests/js/paths.test.ts` | `localePath` and `splitLocale` edge cases (`/`, fragments, queries) |
| `tests/js/device.test.ts` | iPhone, iPad with a desktop UA, Intel Chrome, Safari Mac, Windows |
| `tests/js/theme.test.ts`, `tests/js/crisp.test.ts` | Theme resolution with storage that throws. Crisp injects nothing before `openChat` and exactly one script after it |
| `tests/js/content-nfc.test.ts` | NFC for every Vietnamese source path listed in §1.11 |

`npm run test:js` keeps `node --experimental-strip-types --test tests/js/*.test.ts`. Every module those tests import
uses relative imports with `.ts` extensions and erasable syntax only. `tsconfig.json` adds
`"allowImportingTsExtensions": true`, which is valid alongside `noEmit`.

### 1.18 Docs and instructions to update on the branch

- `CLAUDE.md`: prices now live in `resources/data/pricing.json` (spec §0); the locale contract (URL only, no
  cookies); the content locations; slug constants instead of the `routes/web.php` alternation; `lang/`; Pest 5 (the
  file still says Pest 4).
- `docs/architecture.md`: what it serves (with `/vi`); the endpoint table with `locale`; Crisp click-to-load and the
  lazy checkout SDK; a local two-app proxy (§4).
- `docs/deployment.md`: §1.16.
- `docs/shared-files.md` (new, also in L): §3.
- `docs/visual-assets.md`: the asset handoff, generated by `assets:handoff` from the manifest and the
  per-family fragments (§1.9). It links the existing `docs/screenshots.md` capture recipe, which stays.

---

## 2. License / platform app (`TableProApp/license`)

The account, checkout and newsletter pages are a separate application, designed in its own repository. The public
site relies on three parts of its contract (`docs/architecture.md` describes the public side):

- The platform takes the reader's language from `locale` in the query, a form field or the JSON body. There is one
  name, `locale`, everywhere.
- Signed URLs are generated without `locale` and verified while ignoring it, so switching language on a signed page
  keeps the signature valid.
- Nothing on the platform is prefixed: `/account`, `/checkout` and the other platform paths answer at the root in
  every language (§1.2).

---

## 3. Shared files: "copy in both, change both"

Both repos keep these byte-identical. Each starts with the header comment
`/* Shared with TableProApp/{web|license} at <path>. Change both in the same release. See docs/shared-files.md. */`,
or the Blade equivalent.

| Path (same in both repos) | Contents |
|---|---|
| `resources/css/tokens.css` | `@custom-variant dark`, `@theme inline` tokens, `:root` and `.dark` colours, `color-scheme`, and the design-system §3.3 type-role utilities with their `--lh-*` variables for `:lang(en)` and `:lang(vi)`. Each `app.css` imports it |
| `resources/css/fonts.css` | §1.11: Inter opsz and IBM Plex Mono 400, in latin-ext, vietnamese, latin order |
| `resources/views/partials/head-theme.blade.php` | §1.10 (the design-system §2.8 script; `data-theme-choice`; `#ffffff` / `#121212`) |
| `resources/js/lib/theme.ts` | §1.10 |
| `resources/js/components/shared/theme-control.tsx` | Both design-system §5.3.16 variants; labels arrive as props; styled from `html[data-theme-choice]` |
| `resources/js/lib/consent.ts` | Exists today in both repos (`CONSENT_STORAGE_KEY`) |
| `resources/js/components/shared/consent-bar.tsx` | Moves from `components/landing/consent-bar.tsx` in both repos; labels arrive as props |
| `resources/js/lib/crisp.ts` | §1.12 |
| `resources/js/components/ui/asset-slot.tsx` | Only if L gets an editorial slot (§1.9) |
| `resources/js/components/ui/{button,text-link,container,badge,status-badge,field,select,stepper,dialog,data-table,description-list,callout,copy-button,empty-state,notice-page}.tsx` | The design-system §9 primitives, shared **only where every import resolves in both repos without a dependency change**; adding a dependency to either repo is a separate decision. Every string arrives as a prop. `docs/shared-files.md` records the final set. A primitive that cannot be shared is rebuilt in L to the same spec, and the file lists it as an exception. `site-header`, `site-footer`, `mobile-nav` and `language-switcher` are **not** byte-shared. The first three hold each app's own link table and i18n calls. L's switcher must also post a form when signed in. L's guest-page chrome follows the same design |

The locale allowlist is not byte-shared (JSON in W, PHP config in L), but L's test fixture holds W's `locales.json`
content.

**Enforcement.**

1. `docs/shared-files.md` (identical in both repos) lists each path with its sha256.
2. A Pest `SharedFilesTest` in each repo checks that every listed file exists, carries the header, and hashes to the
   listed value. Editing a shared file therefore fails CI until the list is updated, and updating the list is the
   reminder to apply the same edit in the other repo.
3. `scripts/check-shared-files.sh <other-repo-path>` (W only) diffs the pairs. Run it during integration (§4) and
   before both PRs are marked ready. This is the script design-system §9 calls `compare-shared-ui.sh`: there is one
   script, under this name.

The GA head block is **not** a shared file: L adds `page_location` redaction. Both repos keep their own test pinning
the same order.

---

## 4. Build, verify and local preview

**Public (W):**

```bash
composer install && npm ci
npm run typecheck                    # catalogs: missing or extra vi keys fail here
npm run test:js                      # node --test: i18n, paths, device, theme, crisp, NFC, consent, attribution
npm run build                        # client + SSR (a manifest with "resources/js/app.tsx" + bootstrap/ssr/ssr.js)
php artisan test --compact           # non-SSR tests (SSR-only tests skip locally)
php artisan inertia:start-ssr &      # port 13715 (INERTIA_SSR_PORT)
REQUIRE_SSR=1 php artisan test --compact   # what the CI `ssr` job runs; restart SSR after every build (Support/ssr.php fails on a stale process)
vendor/bin/pint --dirty --format agent
php artisan sitemap:generate         # writes public/sitemap.xml (gitignored)
PUPPETEER_EXECUTABLE_PATH="…/Google Chrome for Testing" php artisan og:generate --type=all --locale=all
php artisan release:check            # final verification only; network
scripts/check-shared-files.sh ../license   # path to a checkout of the license repo
```

**Platform (L):**

```bash
composer install && npm ci
./vendor/bin/pest --compact
npm run build                        # client + SSR into platform-build
vendor/bin/pint --dirty
php artisan inertia:start-ssr        # port 13714
```

**Connected journeys locally.** Both apps answer on one origin in production. A new dev-only script,
`scripts/dev-proxy.mjs` (W; Node built-ins only, no dependency), listens on `:8080`. It sends
`^/(account|checkout|webhooks|newsletter|beta|discount|thank-you|api/newsletter|platform-build)(/|$)` to the
platform's `php artisan serve --port=8001` and everything else to the public app on `:8000`, adding the
`X-Forwarded-*` headers. Set `WEB_DOMAIN=localhost` in both `.env` files: the platform routes are domain-scoped, and
domain matching ignores the port. Use built assets (`npm run build`) in both apps. Payment and mail stay mocked or on
`log`. No real checkout, mail or customer data is used.

**Integration verification**: both suites green, with SSR. Crawl every sitemap URL in both locales through
the proxy (status, `lang`, canonical, hreflang reciprocity, no broken internal links, no `<img>` in placeholders).
Click every platform-to-public link from L in both locales. Check the theme and consent persistence across `/` and
`/account`. Run `release:check`. Take visual screenshots at 375, 768, 1280 and 1440 px in both locales and both
themes, per spec §13.
