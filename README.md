# tablepro.app

The marketing site for [TablePro](https://tablepro.app), a native macOS database client.

This repository is the whole of what `tablepro.app` serves: the homepage, the
comparison pages, the per-database landing pages, the blog, and the legal pages.
It is a Laravel + Inertia + React app with **no database and no credentials**.
Every page it renders is built from markdown and JSON that live in this repo,
plus the public GitHub API for the release download links.

That is deliberate. It means you can clone this and have the real site running
in about a minute, with nothing to provision.

## Getting started

```bash
git clone https://github.com/TableProApp/web.git tablepro-web
cd tablepro-web

composer install
npm install

cp .env.example .env
php artisan key:generate

composer dev      # serves on http://localhost:8000 with Vite
```

There is no database step, no migration, no seeding, and no API key to obtain.
If any instruction ever tells you otherwise, that is a bug in this README.

## What lives where

| Path | What it holds |
| --- | --- |
| `resources/blog/*.md` | Blog posts. Markdown with YAML front matter. |
| `resources/data/*.json` | Comparison and database-page content. |
| `resources/js/pages/` | One React component per route. |
| `resources/js/components/landing/` | Homepage sections. |
| `resources/js/components/ui/` | Shared primitives. |
| `app/Http/Controllers/Landing/` | The two controllers that render everything. |
| `public/og/` | Pre-rendered Open Graph cards, committed. |

## Writing a blog post

Add a markdown file to `resources/blog/`. The filename becomes the URL slug.

```markdown
---
title: Your title
description: One sentence, used for search results and social cards.
date: 2026-08-13
tags: [postgres, macos]
---

Your post.
```

It appears at `/blog/your-filename` immediately. Reading time is computed for
you. To generate the social card, see below.

## Adding a comparison or database page

Both are data-driven. Add an entry to `resources/data/comparisons.json` or
`resources/data/databases.json`, then add the slug to the matching route
constraint in `routes/web.php`. The page builds itself from there.

## Open Graph cards

Cards are committed under `public/og/` so that neither contributors nor the
production host need a browser engine. Regenerating them needs Chromium:

```bash
npm install -g puppeteer
npx puppeteer browsers install chrome

php artisan og:generate --type=blog --slug=your-post
```

If you would rather not install that, open the pull request without the card —
a maintainer will generate it.

## Tests

```bash
php artisan test
```

The suite covers routing, page props, SEO metadata, and the blog pipeline. Some
tests skip unless the SSR bundle is built; that is expected locally.

## What is not here

Buying a licence, signing in to an account, subscribing to the newsletter and
joining the beta are handled by the TablePro backend, which is a separate
application. Forms on these pages `POST` to those endpoints and get JSON back.

If you are working on one of those forms, stub the response or proxy it — see
[docs/architecture.md](docs/architecture.md) for the contract and the options.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Content contributions — a blog post, a
comparison page, a typo fix, better copy — are as welcome as code.

## Licence

Two licences, because code and writing want different terms:

- **Code** — [MIT](LICENSE). Use it however you like.
- **Content** — [CC BY-NC 4.0](LICENSE-CONTENT). Covers the prose in
  `resources/blog`, the page copy in `resources/data` and `resources/js`, and
  the images under `public/images` and `public/og`. Share and adapt it with
  attribution, but not commercially.

Neither licence covers the third-party logos under `public/images/sponsors`,
which belong to their owners, or the TablePro name and logo, which are
trademarks. See [CONTRIBUTING.md](CONTRIBUTING.md#licensing).
