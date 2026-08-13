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
| `POST /checkout` | `{tier, cycle, seats?, discount_code?}` | `{url}` — passed to the checkout SDK |
| `POST /discount/preview` | `{code}` | `{valid, amount_type?, amount?}` |
| `POST /newsletter/subscribe` | `{email}` | `{type, message}` |
| `POST /beta/signup` | `{email}` | `{type, message}` |
| `GET /api/newsletter/stats` | — | `{count}` |

Checkout takes a tier and billing cycle rather than a product identifier, which
is why no payment-provider identifier appears anywhere in this repository.

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
