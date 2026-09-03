# How this app is put together

A Laravel application that renders React pages through Inertia. It has no
database and no credentials: every page is built from markdown in
`resources/blog`, JSON in `resources/data`, and the public GitHub API.

## What it serves

```
/                        homepage
/download  /faq          product pages
/privacy  /terms  /refund-policy
/blog  /blog/{slug}      markdown in resources/blog
/compare/{slug}          data in resources/data/comparisons.json
/{database}-client       data in resources/data/databases.json
/robots.txt  /sitemap.xml
```

Pages resolve by convention from `resources/js/pages`, so adding a file is
enough — Inertia is configured without an explicit `resolve`.

## What it does not serve

Buying a licence, signing in to an account, subscribing to the newsletter and
joining the beta are handled by the TablePro backend, which is a separate
application and not part of this repository. Requests to those paths never
reach this code.

That is why this app runs **without a session**: it has nothing to keep state
for. `StartSession`, `PreventRequestForgery`, `ShareErrorsFromSession` and
`AddQueuedCookiesToResponse` are removed from the web middleware group in
`bootstrap/app.php`, and `SESSION_DRIVER` is `array`. It sets no cookies.

Two consequences worth knowing before you write code here:

- `csrf_token()` throws, and there is no CSRF meta tag. Nothing should add one.
- `session()`, `redirect()->back()->with(...)` and Inertia's `useForm().post()`
  do not work. Forms use plain `fetch` and keep their result in React state —
  see `useEmailForm` in `resources/js/components/landing/footer-cta.tsx`.

## The endpoints the pages call

All anonymous, all rate limited, none needs a token.

| Endpoint | Sends | Returns |
| --- | --- | --- |
| `POST /checkout` | `{tier, cycle, seats?, discount_code?, attribution?}` | `{url}` — passed to the checkout SDK |
| `POST /discount/preview` | `{code}` | `{valid, amount_type?, amount?}` |
| `POST /newsletter/subscribe` | `{email}` | `{type, message}` |
| `POST /beta/signup` | `{email}` | `{type, message}` |
| `GET /api/newsletter/stats` | — | `{count}` |

Checkout takes a tier and billing cycle rather than a product identifier, which
is why no payment-provider identifier appears anywhere in this repository.

## Purchase attribution

Neither half of this system can answer "where did this customer come from" on
its own. This app sees the arrival and never learns that a sale happened: the
overlay that takes the money runs on the payment provider's domain, and the
license is written by the backend. The backend sees the sale and never saw the
arrival. Plausible measures visits on this domain only, so it can report the
source of a *visit* and not the source of a *sale*.

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
Plausible event is the only part of this that reports anything.

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
