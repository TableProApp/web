# How this app is put together

A Laravel application that renders React pages through Inertia. It has no
database and no credentials: every page is built from markdown in
`resources/blog`, JSON in `resources/data`, and the public GitHub API.

## What it serves

```
/                        homepage
/download  /ios  /faq    product pages
/privacy  /terms  /refund-policy
/blog  /blog/{slug}      markdown in resources/blog
/compare/{slug}          data in resources/data/comparisons.json
/{database}-client       data in resources/data/databases.json
/robots.txt  /sitemap.xml
```

Pages resolve by convention from `resources/js/pages`, so adding a file is
enough — Inertia is configured without an explicit `resolve`.

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
  see `useEmailForm` in `resources/js/hooks/use-email-form.ts`, whose
  remaining caller is the footer newsletter.

## The endpoints the pages call

All anonymous, all rate limited, none needs a token.

| Endpoint | Sends | Returns |
| --- | --- | --- |
| `POST /checkout` | `{tier, cycle, seats?, discount_code?, attribution?}` | `{url}` — passed to the checkout SDK |
| `POST /discount/preview` | `{code}` | `{valid, amount_type?, amount?}` |
| `POST /newsletter/subscribe` | `{email}` | `{type, message}` |
| `GET /api/newsletter/stats` | — | `{count}` |

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

Three things the backend end of this contract has to do:

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

Until that end exists, the field is sent and ignored, and the `checkout_started`
analytics event is the only part of this that reports anything.

## Analytics and consent

Google Analytics 4 replaced self-hosted Plausible on 2026-09-23. Plausible set no
cookies and needed no consent; GA4 sets `_ga` and `_ga_<stream>`, which in the
EEA and UK need the reader's permission first. So the tag runs in **Consent
Mode**, and nothing about it is optional:

1. **`app.blade.php` loads the tag with every storage type denied**, then reads
   `tablepro:analytics-consent` from `localStorage` and grants
   `analytics_storage` if the reader said yes before — all ahead of
   `gtag('config')`, so a returning reader's first page view carries its
   cookies. Until then GA receives a cookieless ping per page and sets nothing.
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
`newsletter_signup_clicked` (`source`). GA4 stores those parameters from the
first hit but only shows them in reports once each is registered as an
event-scoped custom dimension under Admin → Custom definitions. Page changes
between Inertia visits are counted by enhanced measurement's "page changes
based on browser history events", which must stay on in the web stream.

## Working on these forms locally

`php artisan serve` runs only this app, so those paths return 404 on your
machine. In order of convenience:

1. **Stub it.** Short-circuit the fetch or point it at a local JSON file.
   Enough for any styling or copy work.
2. **Proxy it.** Add a Vite proxy for those paths while you work. Do not commit
   it.
3. **Ignore it.** If your change does not touch a form, none of this affects you.

## Build and deploy

`npm run build` produces both the client and SSR bundles. `scripts/deploy.sh`
installs, builds, regenerates the sitemap and caches config.

The sitemap is generated on the host because it carries a `lastmod` date. Open
Graph cards are the opposite — they are committed under `public/og/`, so
nothing in production needs a browser engine. Regenerate them through the
`og cards` workflow rather than on a schedule; a scheduled run would rewrite
tracked files and leave the deploy checkout dirty.
