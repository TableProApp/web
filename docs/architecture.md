# How this app is put together

A Laravel application that renders React pages through Inertia. It has no
database and no credentials: every page is built from markdown in
`resources/blog`, JSON in `resources/data`, and the public GitHub API.

## What it serves

```
/                          homepage
/download  /ios  /pricing  /faq  /about  /security
/features  /features/{slug}
/databases /{database}-client  /{database}-gui
/compare   /compare/{slug}
/integrations  /integrations/{slug}   from resources/data/integrations.json; detail pages in English only
/privacy  /terms  /refund-policy
/brand                     English only: resources/data/legal/en/brand.md, files in public/images/brand
/blog  /blog/{slug}        markdown in resources/blog
/blog/{slug}.md  /privacy.md  /terms.md  /refund-policy.md  /brand.md
                           the same page as markdown, in every language it renders in
/blog/feed.xml             the English posts as Atom, linked from the head of blog pages
/vi/…                      every page above, in Vietnamese, where it exists
/robots.txt  /sitemap.xml
/llms.txt                  llmstxt.org, English, built from the page registry
/.well-known/security.txt  RFC 9116; `SecurityTxtController::EXPIRES` is moved by hand
```

Pages resolve by convention from `resources/js/pages`. The shared
`resolve-page.ts` resolver loads the selected language's UI catalog and asset
text before rendering on the client or through SSR. English is in the entry
bundle; every other language's catalog is a chunk the root template sends with
the document.

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

#### The language bar

A reader who likely reads another language this page exists in gets one bar
above the header offering it, in that language ("Đọc trang này bằng tiếng
Việt →"), in place of the license banner (`TopBanner`). It is a suggestion,
never a redirect, and it changes nothing about the rule above: the page's
language is still its URL's.

The server only says which locales the page exists in, as
`localization.suggestable` (`LocaleSwitcher::suggestable()`: the switcher's
equivalent pages, never a fallback, empty on error pages). That is the same for
every reader, so the HTML stays edge-cacheable. The reader's half is decided in
their browser (`resources/js/lib/language-suggestion.ts`):

1. a language they picked in the switcher or the bar, kept in `localStorage`
   under `tablepro:language` as `{chosen, dismissed}`;
2. else the first `navigator.languages` entry that maps to a supported locale
   (`resources/data/language-detection.json`: `zh-TW` → `zh-Hant`, `pt-PT` →
   `pt-BR`, …);
3. only when neither exists, the country Cloudflare names at `/cdn-cgi/trace`,
   or the time zone's country, for countries with one dominant language.

Steps 1 and 2 run in a head script in `app.blade.php` before first paint, so
the bar takes the slot without moving anything; step 3, the one network call,
runs after load. ✕ stops that language for good in this browser. No analytics.
The account app runs the same tag and country tables, on the server, for a
reader with no explicit, session or stored language (its `LocaleResolver`);
the two copies are compared by its `LanguageRegionsConfigTest`.

### Where the content lives

```
resources/data/*.json                 locale-neutral facts: locales, platforms, engines,
                                      pricing, paid-features, facts, sponsors, comparisons,
                                      assets, redirects, integrations; brand (the logo files,
                                      with the English labels of the English-only /brand)
resources/data/content/{locale}/      page copy: home, download, ios, pricing, faq, blog,
                                      legal, engines, paid-features, one file per page
                                      under features/, databases/, compare/, and
                                      integrations/index.json
resources/data/legal/{locale}/*.md    privacy, terms, refund policy; brand guidelines (en only)
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

An integration page is the exception: its route takes any slug-shaped value,
and it exists when `resources/data/integrations.json` has that slug, so a sync
adds or removes pages without a PHP change or a route cache rebuild.

### Integrations

`resources/data/integrations.json` and the PNGs in `public/images/integrations/`
are a byte copy of a [TableProApp/integrations](https://github.com/TableProApp/integrations)
release, brought in by the pull request `integrations-sync.yml` opens. Nothing
here edits them. Icons and screenshots are PNG only, so no third-party SVG is
served from this origin, and every text field renders as React text.

- `/integrations` renders in every locale. English lists every active entry
  with the registry's `summary`. Another locale lists an entry only while
  `content/{locale}/integrations/index.json` → `taglines` has it and
  `content/en/…` → `taglines` still equals the summary, so a changed summary
  hides the old translation until it is updated.
- `/integrations/{slug}` renders in English only (`IntegrationPages`), and
  archived entries keep their page with `noindex`. Other locales answer 404
  with a link to the English page.
- The hub filters with one function in the server render and the browser
  (`components/integrations/model.ts`), so the GET form works without
  JavaScript and the canonical stays `/integrations`.

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

### For AI agents

- `/llms.txt` follows llmstxt.org: the H1, the homepage description as the
  summary, then link lists. It links the docs site's own `llms.txt`, every
  indexed English page with its meta description, guides apart from release
  posts, and release posts and legal pages under `Optional`.
- Blog posts and legal pages, whose source is markdown, also answer at
  `{page}.md`: the authored markdown with the title, the description and the
  notes the page shows above the body (date, correction, last updated,
  translation notice). `{#id}` heading attributes and controls are dropped, and
  an image slot becomes the image production shows, or nothing. The route is
  named `{page route}.md`, so the registry gates it as that page.
- A `.md` response carries `Link: <page>; rel="canonical"`, and the page's head
  links it with `rel="alternate" type="text/markdown"` (the `seo.markdown` prop).
- No `Accept: text/markdown` negotiation: Cloudflare caches HTML and ignores
  `Vary`, so one URL with two bodies would hand the cached one to both. Its
  Markdown for Agents feature, which converts at the edge, needs a paid plan.
- `robots.txt` allows every crawler and carries no AI preference line.
  Cloudflare's `Content-Signal` is a vendor policy and the IETF aipref
  `Content-Usage` is still a draft; add `Content-Usage` once it is an RFC.

## What it does not serve

Buying a license, signing in to an account and subscribing to the newsletter are
handled by tablepro-cloud (TableProApp/cloud), a separate application on
`api.tablepro.app` and `account.tablepro.app`, which the pages call from the
browser.

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

All anonymous and rate limited, none needs a token. They are tablepro-cloud's
public API, another origin (`TABLEPRO_API_ORIGIN`, `https://api.tablepro.app`
in production, shared with every page as the `apiOrigin` prop and read through
`useApi()`). The page's language travels in the body.

| Endpoint | Sends | Returns |
| --- | --- | --- |
| `GET /v2/pricing` | — | `{country, plans: [{plan, cycle, currency, amount, per_seat, min_seats, features, discount_percent, discounted_amount, discounted_total}]}` |
| `POST /v2/checkouts` | `{plan, cycle, locale, seats?, discount_code?, attribution?}` | 201 `{url}`, opened in Polar's overlay |
| `POST /v2/discounts/preview` | `{code}` | `{valid, amount_type?, amount?, currency?}` |
| `POST /v2/newsletter/subscriptions` | `{email, locale, turnstile_token}` | 202, whether or not the address was new |
| `GET /v2/newsletter/stats` | — | `{subscribers}` |

Every call is a plain `fetch` with `credentials: 'omit'`, so no cookie is sent
or kept. tablepro-cloud answers CORS for `https://tablepro.app` only, without
credentials. `ContentSecurityPolicy` adds the API origin to `connect-src`.
`PublicContractsTest` holds every call.

Errors are RFC 9457 problems whose `title` and `detail` are English, so the
cards show their own catalog's words for each `code`
(`components/pricing/checkout-response.ts`): `plan_unavailable`, and
`validation_failed` on `body.seats`, have their own message, `rate_limited`
(429) is `forms.tooMany`, anything else `pricing.checkout.failed`.

`locale` lets Polar's checkout and the purchase emails follow the page's
language. It is never inferred from anything else, and it says nothing about
currency or region: prices are USD everywhere.

`GET /v2/pricing` answers for the country Cloudflare names for the request,
with the regional (PPP) discount `POST /v2/checkouts` applies when no code is
typed. The plan cards ask once per page, after rendering
(`useRegionalPricing`), and show what checkout will charge beside the struck
list price, with one line naming the country, only while every plan's `amount`
equals its price in `pricing.json` and one percentage applies to all of them;
otherwise the list prices stand. The cached HTML, the structured data and the
first paint keep the list prices. It is the one place the site names a regional
price (positioning §9).

The code field under the cards is always there: with a regional discount
tablepro-cloud hands Polar that discount, and Polar's checkout then takes no
code of its own. A code is checked with `POST /v2/discounts/preview`, and only
one it accepted travels with checkout, replacing the regional discount.

Checkout takes a plan and billing cycle rather than a product identifier, which
is why no payment-provider identifier appears anywhere in this repository.

The newsletter forms (footer and blog index, `useEmailForm`) send a Cloudflare
Turnstile token with the address. The widget (`resources/js/lib/turnstile.ts`,
action `newsletter`) is rendered on the reader's first focus or pointer on the
form, runs its check on submit, and shows itself only when it needs an answer.
Its site key is public configuration, `TURNSTILE_SITE_KEY`, shared as the
`turnstileSiteKey` prop; without one the form says the check did not finish
and posts nothing. tablepro-cloud answers 202 whatever happened, so the form
says to check the inbox, and only a 422 on `body.email` is about the address.
Under each form, `useNewsletterStats` asks once per page for the subscriber
count and shows it once known; a failure leaves it unsaid.

Links to the account go to tablepro-cloud's portal, another origin:
`https://account.tablepro.app/?locale={locale}` (`accountHref()`, the origin
from `facts.json` → `links.account`), a plain `<a>`, never an Inertia `<Link>`.
The page's language crosses in `?locale=`, for the portal to use when the
reader has made no choice of their own there; signed in, the portal shows the
account's language.

nginx still answers a few old paths on this origin without this app: `/account`
and below, `/checkout` and `/thank-you` redirect to the portal, and
`/newsletter/unsubscribe/*` and `/webhooks/polar` reach tablepro-cloud for 90
days after the cutover (`docs/deploy/tablepro.app.nginx.conf`). `<LocaleLink>`
and `localePath()` never prefix them (`PLATFORM_PATHS` in
`resources/js/i18n/paths.ts`), and a locale must never take one of those names.

The beta signup is gone: the iPhone app shipped on the App Store on
2026-09-22, and the account app that answered `POST /beta/signup` is retired.

## Purchase attribution

Neither half of this system can answer "where did this customer come from" on
its own. This app sees the arrival and never learns that a sale happened: the
overlay that takes the money runs on the payment provider's domain, and the
license is written by the backend. The backend sees the sale and never saw the
arrival. Google Analytics measures visits on this domain only, so it can report
the source of a *visit* and not the source of a *sale*.

`POST /v2/checkouts` is the one request in which both are in scope, so the
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

The one exception is a link from the Mac app (`?ref=app-…`). That reader was
acquired when they installed the app, and the screen they clicked from, such as
a paid feature's gate, is what brought them to buy, so it replaces the record.

The record lives in `localStorage` under `tablepro:attribution`, because this
app has no session and sets no cookies. It is disclosed on `/privacy`.

The backend passes `source`, `medium`, `campaign`, `term`, `content` and
`referrer` to the payment provider as checkout metadata (`utm_source` and so on,
the keys tablepro-cloud reads), so they come back on the order webhook and stay
with the order. `landing_page` and `first_seen_at` are not kept.

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
2. **`ConsentBar` asks.** It is in the server's HTML, hidden, and the head
   script adds `consent-open` to `<html>` when no answer is stored. Allow and
   Decline are the same button at the same weight; that is a legal
   requirement, not a style choice.
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

Events are sent only once the reader has chosen Allow: `trackEvent`
(`resources/js/lib/analytics.ts`) reads the stored answer and drops the event
otherwise. With no answer, or after Decline, Consent Mode would still send it
as a cookieless ping, and the privacy policy promises one signal per page and
nothing else. An event before the answer is dropped, not queued.

Events keep the names the Plausible goals had: `download_click` (`location`,
`platform`), `checkout_started` (`tier`, `cycle`) and
`newsletter_signup_clicked` (`source`). The license banner adds
`license_banner_view` and `license_banner_click`, without parameters, so a
banner's clicks can be compared with its views and with `checkout_started`.
It cannot be closed, so there is no dismiss event. GA4 stores the parameters
from the first hit but only shows them in reports once each is registered as
an event-scoped custom dimension under Admin → Custom definitions. Page changes
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
  widget. While the consent bar covers the bottom-right corner (on a phone,
  reopened from "Cookie settings"), the launcher is hidden. Crisp sets its `crisp-client/`
  cookies as soon as it loads; the privacy policy describes them.
- **Cloudflare Turnstile** (`challenges.cloudflare.com`) loads on the first
  focus or pointer on a newsletter form, with its script and its frame in the
  policy only while `TURNSTILE_SITE_KEY` is set.
- **Polar's checkout script** loads at checkout intent, not on
  every page. `resources/js/lib/checkout-sdk.ts` injects one script tag on the
  first `pointerenter` or focus of a buy button (or on the click itself), and
  the click awaits it before opening the overlay; if it cannot load, the reader
  goes to Polar's checkout page instead. The script URL, version pinned, is
  `checkoutSdk` in `resources/data/pricing.json`.
- **Product Hunt** is a plain text link ("TablePro on Product Hunt", URL in
  `facts.json` → `links.productHunt`): no badge image, no hotlink, no request.

## Response headers

`SecurityHeaders` is first in the global stack, so it marks every response this
app sends, redirects and error pages included: `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and
`Strict-Transport-Security` over HTTPS. Files nginx serves itself (`/build`,
`/images`, `/og`, the sitemap) never reach it.

HTML also carries a `Content-Security-Policy`, built by
`App\Support\Security\ContentSecurityPolicy`:

- Inline scripts are admitted by hash, computed from the response. There is no
  nonce, so the page stays cacheable at the edge. An inline script added in the
  browser is refused.
- Third-party sources are listed per vendor in that class, and only for a
  vendor that is configured. A new third party, or a new host for one already
  there, is an edit to that class. Without it the browser blocks the request.
- Every page carries the same sources, because an Inertia visit keeps the
  policy of the document the reader loaded first.
- No policy is sent while the Vite dev server runs, or with Laravel's debug page.
- A Cloudflare feature that injects an inline script (JavaScript Detections,
  Rocket Loader) would be blocked. None was on as of 2026-10-08. After turning
  one on, open a page and read the browser console.

## Working on these forms locally

The forms call tablepro-cloud from the browser. Run its `make dev` (the API at
`http://api.localhost:8080`) and set `TABLEPRO_API_ORIGIN=http://api.localhost:8080`
here, with Polar in its sandbox and mail on its fake. tablepro-cloud answers
CORS for `https://tablepro.app` only, so a page served from `localhost` needs
tablepro-cloud to allow that origin in development first. Cloudflare's test
site key `1x00000000000000000000AA` always passes Turnstile.

For styling or copy work, stub the `/v2` answers in the browser instead, or
ignore them.

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

The placeholder is for the owner, so it shows only outside production.
`HandleInertiaRequests` shares `assetPlaceholders` (false when `APP_ENV` is
`production`), and there a slot with no image renders nothing. A component that
wraps a slot or gives it a column narrows the id with `useShownSlot()` first, so
the block becomes text only instead of keeping an empty box.

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

Facts about other products are data in `comparisons.json`, each with its source
and the date it was read. `php artisan comparisons:check` lists the products
checked more than 30 days ago (`--max-age`) and compares every last release
that cites a GitHub releases page with GitHub. Prices and features have no feed,
so a stale row means re-reading that product's sources. Also run by hand.

A few files are byte-identical with the platform app: the design tokens, the
fonts, the theme partial and the consent and theme modules.
`docs/shared-files.md` lists them and how to change them.
