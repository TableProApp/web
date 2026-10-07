# tablepro.app

The public site for [TablePro](https://tablepro.app), a native, open-source
database client for developers.

This repository is the whole of what `tablepro.app` serves outside the account
app: the homepage, the feature, database and comparison pages, pricing,
downloads, the iPhone and iPad page, the FAQ, the blog and the legal pages, in
English at the root, with localized routes for Vietnamese, Spanish, German,
French, Japanese, Brazilian Portuguese, Simplified Chinese, Korean, Traditional
Chinese, Italian and Indonesian. Locale codes and URL prefixes are declared in
`resources/data/locales.json`. It is a Laravel + Inertia +
React app with **no database and no credentials**. Every page it renders is
built from markdown and JSON that live in this repo, plus the public GitHub API
for the release download links.

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
| `resources/blog/*.md` | Blog posts. Markdown with YAML front matter; Vietnamese translations in `resources/blog/vi/`. |
| `resources/data/*.json` | Facts stated once: platforms and releases, engines, prices, paid features, URLs, sponsors, competitor facts, the image manifest, redirects. |
| `resources/data/content/{locale}/` | Page copy, one JSON file per page and language. |
| `resources/data/legal/{locale}/` | Privacy policy, terms and refund policy, in markdown. |
| `resources/js/pages/` | One React component per page template. |
| `resources/js/components/{home,features,databases,compare,pricing,…}/` | Each page family's sections. |
| `resources/js/components/ui/` | Shared primitives. |
| `resources/js/i18n/` | UI strings per language, and the locale helpers. |
| `app/Http/Controllers/` | One controller per page family. |
| `public/og/` | Pre-rendered Open Graph cards, committed. |
| `docs/visual-assets.md` | The brief for every image placeholder, generated. |

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
you. A Vietnamese translation is `resources/blog/vi/your-filename.md` with the
same `date`. To generate the social card, see below.

## Adding a feature, database or comparison page

All three are data-driven. Add the slug to the matching constant class in
`app/Support/Content/Slugs/`, then write the page's content file in every
language under `resources/data/content/{locale}/`. Facts come from the data
files, not the copy: an engine from `resources/data/engines.json`, a competitor
from `resources/data/comparisons.json` with its sources. Each family's
`README.md` in `resources/js/components/{features,databases,compare}/`
documents its content schema.

## Open Graph cards

Cards are committed under `public/og/` so that neither contributors nor the
production host need a browser engine. Regenerating them needs Chromium:

```bash
npm install -g puppeteer
npx puppeteer browsers install chrome

php artisan og:generate --type=blog --slug=your-post
php artisan og:generate --type=compare --locale=all   # cards for every supported language
```

Every post and every page with an `og` block needs its card committed;
`Seo/OgCardsTest` fails without it. If you cannot install Chromium, say so in
the pull request and a maintainer will render the card and push it to your
branch. (Maintainers can also run the manual `og cards` workflow after a merge.)

## Tests

```bash
php artisan test
```

The suite covers routing, page props, SEO metadata, and the blog pipeline. Some
tests skip unless the SSR bundle is built; that is expected locally.

## What is not here

Buying a licence, signing in to an account and subscribing to the newsletter
are handled by the TablePro backend, which is a separate application. Forms on these pages `POST` to those endpoints and get JSON back.

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
