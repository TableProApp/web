# TablePro marketing site

Laravel 13 + Inertia v3 + React 19 + Tailwind v4, tested with Pest 4.

## The one thing to know

**This app has no database and no credentials.** Every page is built from
markdown in `resources/blog`, JSON in `resources/data`, and the public GitHub
API. If a change would introduce a model, a migration, a queue job or an API
key, it does not belong in this repository — stop and say so.

It also runs **without a session**: `StartSession`, `PreventRequestForgery`,
`ShareErrorsFromSession` and `AddQueuedCookiesToResponse` are removed from the
web middleware group in `bootstrap/app.php`. Consequences that bite:

- `csrf_token()` throws. There is no CSRF meta tag and nothing should add one.
- `session()`, `->with('flash')` and `redirect()->back()->with(...)` do not work.
- Inertia's `useForm().post()` must not be used. Writes go through plain
  `fetch` and hold their result in React state — copy the `useEmailForm`
  pattern in `resources/js/components/landing/footer-cta.tsx`.

See `docs/architecture.md` before touching anything that posts data.

## Conventions

- Follow the existing structure; check sibling files before inventing a pattern.
- Use `php artisan make:` for new files.
- Explicit return types and parameter type hints on every method.
- Curly braces on every control structure, even single-line bodies.
- Prefer PHPDoc blocks over inline comments; use array shapes in PHPDoc.
- Reuse `resources/js/components/ui/*` before writing a new primitive.

## Commands

```bash
composer dev                    # serve + vite
php artisan test --compact      # full suite
php artisan test --compact --filter=BlogTest
vendor/bin/pint                 # fix code style before finishing
php artisan sitemap:generate
php artisan og:generate --type=blog --slug=my-post   # needs Chromium
```

Run `vendor/bin/pint --dirty --format agent` after editing any PHP file.

## Deploying

`main` deploys itself: green tests on `main` trigger `.github/workflows/deploy.yml`,
which runs `scripts/deploy.sh` on the server. Never build straight into the live
`public/build` — Vite empties it first and the site 500s until it is rewritten.
Read `docs/deployment.md` before changing anything about the server; the host is
shared with a dozen other sites and with the private platform app that answers
`/checkout` and `/api/newsletter` on this same domain.

## Testing

Every change needs a test. Feature tests live in `tests/Feature`; there is no
`tests/Unit` suite and `phpunit.xml` declares only `Feature`. There is no
`RefreshDatabase` anywhere and there must not be — there is no database.

## Content

- A blog post is a markdown file in `resources/blog/`; the filename is the slug.
- Comparison and database pages are driven by `resources/data/*.json` plus a
  slug added to the route constraint in `routes/web.php`.
- Prices in `resources/js/components/landing/pricing.tsx` are literals that
  must match what checkout actually charges. Never change them here alone —
  flag it instead.

## Frontend

- Pages resolve by convention from `resources/js/pages`. Inertia is configured
  without an explicit `resolve`, so adding a file is enough.
- SSR is enabled; `npm run build` builds both bundles.
- `@/` maps to `resources/js`.
