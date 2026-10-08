# How this app is put together

A Laravel application that renders React pages through Inertia. It has no
database and no credentials: every page is built from markdown in
`resources/blog`, JSON in `resources/data`, and the public GitHub API.

## What it serves

```
/                          homepage
/download  /ios  /pricing  /faq
/features  /features/{slug}
/databases /{database}-client  /{database}-gui
/compare   /compare/{slug}
/privacy  /terms  /refund-policy
/blog  /blog/{slug}        markdown in resources/blog
/vi/…                      every page above, in Vietnamese, where it exists
/robots.txt  /sitemap.xml
```

Pages resolve by convention from `resources/js/pages`. The shared
`resolve-page.ts` resolver loads the selected asset language before rendering
on the client or through SSR.

### Languages

English is at the root. Vietnamese, Spanish, German, French, Japanese, Brazilian
Portuguese, Simplified Chinese, Korean, Traditional Chinese, Italian and Indonesian
use the prefixes in `resources/data/locales.json`, with the same slugs. The
locale comes from the URL alone: no cookie, no session, no `Accept-Language`,
no IP lookup, no `Vary` on language and no redirect between languages. A
crawler or a reader reaches each language by its URL.

```
resources/data/locales.json      the allowlist: code, native name, prefix, hreflang, og, Intl tag
routes/localized.php             every page, declared once
routes/web.php                   mounts localized.php once per locale:
                                   /…     names landing.*      middleware locale:en, page
                                   /vi/…  names vi.landing.*   middleware locale:vi, page
```

`locale:{code}` (`SetLocale`) sets the application locale from the route group.
`page` (`EnsurePageRenders`) asks `App\Support\Seo\PageRegistry` whether the
page renders in that locale. A page renders in a locale when its content exists
there (`resources/data/content/{locale}/…`, `resources/data/legal/{locale}/…`,
`resources/blog/vi/…`); until then the URL answers a branded 404 that links the
version that does exist. So `/vi/blog/{slug}` for an English-only release post
is a 404 offering the English post, never the English body under Vietnamese
chrome. A page with content in no locale is no page at all: the registry does
not know it and the route answers 404.

The same registry feeds the shared `seo` prop (robots, canonical, hreflang,
`og:locale`, OG card), the `localization.switcher` prop and the sitemap, so they
cannot disagree. A page can render in a locale without being indexed there:
Every localized blog index lists English posts, so its content file sets `seo.indexable: false`
and it carries `noindex, follow` with no canonical and no alternates.

Errors render the `Error` page in the locale of the path (404 and 410 always,
500 and 503 with debug off), with `noindex, follow`.
`resources/views/errors/{500,503}.blade.php` are static fallbacks that need no
build.

UI strings are typed catalogs in `resources/js/i18n/messages/{locale}/`; page
copy is per-locale JSON; server-rendered strings are in `lang/{locale}/`. The
CLAUDE.md "Languages" section has the rules for writing them.

### Where the content lives

```
resources/data/*.json                 locale-neutral facts: locales, platforms, engines,
                                      pricing, paid-features, facts, sponsors, comparisons,
                                      assets, redirects
resources/data/content/{locale}/      page copy: home, download, ios, pricing, faq, blog,
                                      legal, engines, paid-features, and one file per
                                      page under features/, databases/, compare/
resources/data/legal/{locale}/*.md    privacy, terms, refund policy
resources/blog/*.md                   posts (English); resources/blog/vi/*.md their translations
lang/{locale}/*.php                   OG card labels and the static error pages
resources/js/i18n/messages/{locale}/  UI chrome catalogs, typed
```

A fact is stated once, in data, and copy refers to it: a price comes from
`pricing.json`, an engine's capabilities from `engines.json`, a release version
or requirement from `platforms.json`, a URL from `facts.json`. Counts are
derived, never typed. A feature newer than the oldest Mac build still served
(`platforms.json` → `mac.floorVersion`, which trails while Homebrew catches up)
carries a "0.77"-style label from its `sinceAppVersion`; bumping the floor
removes every such label at once.

A database, comparison or feature page exists when its slug is in the constant
class in `app/Support/Content/Slugs/` (the route constraint) and its content
file exists in a locale. `LocaleRoutingTest` holds the two lists together.

### Retired URLs

Redirects and 410s are not routes. `App\Http\Middleware\CanonicalizeRequest`
runs first in the global stack, for `GET` and `HEAD` only. It drops a trailing
slash and a leading `/index.php`, writes a language prefix the way
`locales.json` does (`/pt-br/…` becomes `/pt-BR/…`, `/en/…` loses the prefix),
then looks the clean path up in
`resources/data/redirects.json` (each entry is a `301` with a `to`, or a `410`)
and in the `/databases/{docsSlug}` rule. The answer is a single hop that keeps
the query string, so `/mariadb-client/?ref=x` goes straight to
`/mysql-client?ref=x#mariadb`; a 410 renders the branded Error page. An unknown
path is a 404, never a redirect to the homepage. A retired URL is never also a
page: the registry drops every path the map answers.

## What it does not serve

Buying a licence, signing in to an account and subscribing to the newsletter are
handled by the TablePro backend, which is a separate application and not part of
this repository. Requests to those paths never reach this code.

That is why this app runs **without a session**: it has nothing to keep state
for. `StartSession`, `PreventRequestForgery`, `ShareErrorsFromSession` and
`AddQueuedCookiesToResponse` are removed from the web middleware group in
`bootstrap/app.php`, and `SESSION_DRIVER` is `array`. It sets no cookies.

Two consequences worth knowing before you write code here:

- `csrf_token()` throws, and there is no CSRF meta tag. Nothing should add one.
- `session()`, `redirect()->back()->with(...)` and Inertia's `useForm().post()`
  do not work. Forms use plain `fetch` and keep their result in React state —
  see `useEmailForm` in `resources/js/hooks/use-email-form.ts`, used by the
  footer and blog newsletter forms.

## The endpoints the pages call

All anonymous, all rate limited, none needs a token. They are the platform's
paths, so they are always called at the root, never under `/vi`: nginx routes
them by prefix, and `/vi/checkout` would never reach the platform. The page's
language travels in the body instead.

| Endpoint | Sends | Returns |
| --- | --- | --- |
| `POST /checkout` | `{tier, cycle, seats?, discount_code?, attribution?, locale}` | `{url}` — passed to the checkout SDK |
| `POST /discount/preview` | `{code}` | `{valid, amount_type?, amount?}` |
| `POST /newsletter/subscribe` | `{email, locale}` | `{type, message}` |

Every call is a plain `fetch` with `credentials: 'omit'`. The platform answers
from its session-backed `web` group, so a same-origin request with credentials
would send and store `tablepro-session` and `XSRF-TOKEN` on public pages;
`omit` does neither. `PublicContractsTest` holds every call to it.

`locale` lets the platform send the buyer's or subscriber's emails in the
language of the page they came from. It is never inferred from anything else,
and it says nothing about currency or region: prices are USD everywhere.

The plan cards on `/pricing` and the homepage's `#pricing` section receive a
`checkout` page prop from `App\Support\Pricing\Checkout`:
`{provider, couponField}`. `provider` is `PAYMENT_PROVIDER` (`polar` or
`lemonsqueezy`), which must match the platform's own setting, because the cards
open the overlay of whichever provider's URL `POST /checkout` returns. Polar's
checkout takes a discount code itself, so under Polar the cards show no code
field and never call `/discount/preview`.

`GET /api/newsletter/stats` is no longer called. The old footer fetched it for a
subscriber count, and the footer no longer shows one. The endpoint stays on the
platform as a contract for anyone else.

Links to the account are plain `<a href="/account?locale={locale}">`: a
different application, so never an Inertia `<Link>`, and never prefixed.
`<LocaleLink>` and `localePath()` treat every platform path that way
(`PLATFORM_PATHS` in `resources/js/i18n/paths.ts`, the same pattern as
`scripts/dev-proxy.mjs`), and never append `locale` themselves, because a
signed `/thank-you?order=…` URL must arrive exactly as it was signed.

Checkout takes a tier and billing cycle rather than a product identifier, which
is why no payment-provider identifier appears anywhere in this repository.

`POST /beta/signup` was the fifth row here until 2026-09-22. The endpoint still
exists on the backend and nginx still proxies `/beta`, but nothing on this site
calls it: the iPhone app shipped on the App Store, so the TestFlight invite form
in the closing call to action became a link. Do not add a caller back without
checking the endpoint is still wired.

## Purchase attribution

Neither half of this system can answer "where did this customer come from" on
its own. This app sees the arrival and never learns that a sale happened: the
overlay that takes the money runs on the payment provider's domain, and the
license is written by the backend. The backend sees the sale and never saw the
arrival. Google Analytics measures visits on this domain only, so it can report
the source of a *visit* and not the source of a *sale*.

`POST /checkout` is the one request in which both are in scope, so the
acquisition source is resolved in the browser and sent in that body as an
optional `attribution` object:

| Key | Meaning |
| --- | --- |
| `source` | `utm_source`, or a bare `?ref=` when there is no `utm_source` |
| `medium` | `utm_medium` |
| `campaign` | `utm_campaign` |
| `term` | `utm_term` |
| `content` | `utm_content` |
| `referrer` | Origin and path of an off-site referrer, query string dropped |
| `landing_page` | Path of the first attributable page, without its query string |
| `first_seen_at` | ISO 8601 timestamp of that first attributable visit |

Only the last two are always present. `resources/js/lib/attribution.ts` holds
the rules and `tests/js/attribution.test.ts` holds their proof; the short
version is **first touch, ninety days**. The first visit carrying a campaign tag
or an off-site referrer wins and is not overwritten, so a reader who arrives
through a comparison page and buys a fortnight later after typing the domain is
credited to the comparison page rather than to "direct". A visit with neither is
not recorded at all, precisely so it cannot take that slot.

The record lives in `localStorage` under `tablepro:attribution`, because this
app has no session and sets no cookies. It is disclosed on `/privacy`.

What the backend does with it today is **nothing**: the platform ignores the
field and passes none of it to Polar or Lemon Squeezy. The privacy policy says
exactly that. The `checkout_started`
analytics event is the only part of this that reports anything.

If the backend ever starts keeping it, three things hold, and the privacy
policy changes first:

1. **Tolerate its absence.** It is missing for every reader who arrived
   untagged, and for every browser that refuses storage. It is not a validation
   error, and checkout must open without it.
2. **Distrust its contents.** `localStorage` belongs to the reader. This app
   whitelists the keys and clamps every value — tags to 128 characters, URLs to
   256 — so the object arrives in a fixed shape, but it is still reader-supplied
   input and the backend must validate it as such.
3. **Persist it against the license, not just the checkout session.** Storing it
   as provider metadata is what carries it through to the webhook; the
   attribution is only worth collecting if it survives to sit beside the sale.

## Analytics and consent

Google Analytics 4 replaced self-hosted Plausible on 2026-09-23. Plausible set no
cookies and needed no consent; GA4 sets `_ga` and `_ga_<stream>`, which in the
EEA and UK need the reader's permission first. So the tag runs in **Consent
Mode**, and nothing about it is optional:

1. **`app.blade.php` declares the tag with every storage type denied**, then
   reads `tablepro:analytics-consent` from `localStorage` and grants
   `analytics_storage` if the reader said yes before — all ahead of
   `gtag('config')`, so a returning reader's first page view carries its
   cookies. Until then GA receives a cookieless ping per page and sets nothing.
   Google's script itself (about 180 KB) is added only after the load event,
   once the browser is idle (two seconds after the load in Safari), the way the
   chat loader is; `gtag()` queues every call in `dataLayer` until it arrives,
   and it replays them in order. A reader who leaves before then is not counted.
2. **`ConsentBar` asks**, once, after hydration. Allow and Decline are the same
   button at the same weight; that is a legal requirement, not a style choice.
3. **`resources/js/lib/consent.ts` applies the answer** to the running tag and,
   on a decline, deletes any `_ga*` cookie already written. "Cookie settings" in
   the footer and a button in `/privacy#cookies` reopen the bar.

The advertising signals (`ad_storage`, `ad_user_data`, `ad_personalization`)
are denied for everyone, always. Nothing here advertises, and `/privacy` says so.

**The account portal is the other half.** `/account`, `/checkout`, `/thank-you`
and the newsletter pages are the platform app, on this same origin. It carries a
copy of the tag, the bar and `consent.ts`, reads the same storage key, and so
shares one answer with this site. Change the key, the consent defaults or the
measurement ID in one repository and the other has to follow in the same
release, or a reader is asked twice and counted as two users.

The platform app also redacts what it sends: its pages are reached through
signed links and order IDs, and GA — unlike Plausible — records the full URL.
See `App\Support\AnalyticsLocation` there.

Events keep the names the Plausible goals had: `download_click` (`location`,
`platform`), `checkout_started` (`tier`, `cycle`) and
`newsletter_signup_clicked` (`source`). The license banner adds
`license_banner_view` and `license_banner_click` (`version`) and
`license_banner_dismiss` (`version`, `reason`: `closed` or `licensed`), so a
banner's clicks can be compared with its views, and with `checkout_started`,
per message. GA4 stores those parameters from the
first hit but only shows them in reports once each is registered as an
event-scoped custom dimension under Admin → Custom definitions. Page changes
between Inertia visits are counted by enhanced measurement's "page changes
based on browser history events", which must stay on in the web stream.

## Third-party scripts

Two third-party scripts load unasked: the Google tag in Consent Mode above,
added after the page has loaded, and Cloudflare Web Analytics.

- **Cloudflare Web Analytics** is a Cloudflare dashboard setting for
  tablepro.app. Cloudflare injects its beacon (`static.cloudflareinsights.com`)
  at the edge into every page here and in the account portal; this repository
  never adds it, so no test here sees it. It sets no cookies, and the privacy
  policy discloses it (Website, retention and recipients sections).

- **Crisp** is on every page here and in the account portal. Each layout calls
  `loadChatWhenIdle()` (`resources/js/lib/crisp.ts`), which adds the loader
  after the load event, once the browser is idle, so it is never in the server
  render and never delays the first paint. A "Live chat" button opens the same
  widget. While the consent bar covers the bottom-right corner (on a phone it
  spans the width), the launcher is hidden. Crisp sets its `crisp-client/`
  cookies as soon as it loads; the privacy policy describes them.
- **The Polar or Lemon Squeezy checkout SDK** loads at checkout intent, not on
  every page. `resources/js/lib/checkout-sdk.ts` injects one script tag on the
  first `pointerenter` or focus of a buy button (or on the click itself), and
  the click awaits it before opening the overlay; if it cannot load, the reader
  goes to the provider's checkout page instead. The script URLs, version
  pinned, are `checkoutSdk` in `resources/data/pricing.json`.
- **Product Hunt** is a plain text link ("TablePro on Product Hunt", URL in
  `facts.json` → `links.productHunt`): no badge image, no hotlink, no request.

## Working on these forms locally

`php artisan serve` runs only this app, so the platform's paths return 404 on
your machine. To exercise a journey that crosses between the two apps, run both
behind one origin, the way nginx does in production:

```bash
php artisan serve --port=8000                      # this repository
(cd ../license && php artisan serve --port=8001)   # the platform
npm run dev:proxy                                  # http://localhost:8080
```

`scripts/dev-proxy.mjs` sends `/account`, `/checkout`, `/webhooks`,
`/newsletter`, `/beta`, `/discount`, `/thank-you`, `/api/newsletter` and
`/platform-build` to the platform and everything else here, with
`X-Forwarded-*` headers. Set `WEB_DOMAIN=localhost` in both `.env` files (the
platform's routes are domain-scoped and domain matching ignores the port) and
use built assets in both. Keep payments mocked and mail on the `log` driver: no
real checkout, message or customer data.

For styling or copy work that does not touch a form, stub the fetch instead, or
ignore it.

## Images

Every content image (screenshots, crops, phone captures, diagrams, blog
figures) is a slot in one manifest, `resources/data/assets.json`. Its `kinds`
fix the geometry and export rules; each entry carries the owner-handoff fields
and a `status`, the only render switch. `<AssetSlot id>`
(`resources/js/components/ui/asset-slot.tsx`) renders a `placeholder` as a
labelled, described box of the final aspect ratio, with no `<img>` and no
request, and a `supplied` entry as `<picture>` sources with light and dark
variants. Markdown places a slot with `<asset-slot id="…"></asset-slot>`. A
supplied `priority` asset gets a head preload through the `lcpAsset` page prop.

The browser loads `resources/js/lib/data/asset-slots.json` for shared geometry
and one `asset-locales/{locale}.json` catalog for the active language's text.
The page resolver waits for that catalog before client or SSR rendering;
the cache is keyed by locale so concurrent SSR requests cannot share the wrong
language. English editorial figures retain their English text.

`php artisan assets:handoff` writes these files and the owner's brief,
`docs/visual-assets.md`, from the manifest and the per-family fragments in
`docs/rebuild/assets/`. Edit the manifest or a fragment and rerun the command.
`assets:handoff --check` runs in CI and fails on any stale generated file.

## Build and deploy

`npm run build` produces both the client and SSR bundles. `scripts/deploy.sh`
installs, builds, regenerates the sitemap and caches config and routes. Because
`resources/data/locales.json` decides which route groups exist, a change to it
rebuilds the route cache like any PHP change (docs/deployment.md).

The sitemap is generated on the host because it carries a `lastmod` date. Open
Graph cards are the opposite — they are committed under `public/og/`, so
nothing in production needs a browser engine. `php artisan og:generate
--type={site|blog|database|compare|feature|all} --locale={supported-locale|all}` renders
them from each page's content (`og` block, or the post's front matter):
English at `public/og/{type}/{slug}.png` and the generic `public/og.png`,
Other languages under `public/og/{locale}/`. A page with no card of its own, or whose own
card file is missing, falls back to its language's generic card: the bespoke
`og-site` card (`public/og/bespoke/og-site-{locale}.png`, an owner asset in
`resources/data/assets.json`) once that entry is supplied and the locale's file
exists, else the generated one. Only when no generic card exists does the page
emit no `og:image`, rather than a broken one. `Seo/OgCardsTest` fails in either case. Regenerate them through
the `og cards` workflow rather than on a schedule; a scheduled run would
rewrite tracked files and leave the deploy checkout dirty.

Release facts (versions, dates, requirements and the App Store price) are data
in `platforms.json`, not fetched per page. `php artisan release:check` compares
them with GitHub, the Sparkle appcast, Homebrew and the App Store, and exits
non-zero on any drift or unreadable source. It needs the network, so it is run by hand before a launch
or after a release, never in the test suite.

A few files are byte-identical with the platform app: the design tokens, the
fonts, the theme partial and the consent and theme modules.
`docs/shared-files.md` lists them and how to change them.
