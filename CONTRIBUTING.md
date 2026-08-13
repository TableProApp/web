# Contributing

Thanks for considering it. This repository is the TablePro marketing site, and
the most valuable contributions to it are usually not code.

## What is most useful

- **Blog posts.** Practical writing about working with databases on macOS.
- **Comparison pages.** If you have switched to or from another client and can
  describe the difference accurately, that is worth more than any feature we
  could add to this page.
- **Database landing pages.** One per database engine. Accuracy matters more
  than length.
- **Copy fixes.** Wrong claims, stale version numbers, awkward sentences.
- **Accessibility and responsive fixes.**
- **Translations.** Open an issue first so we can agree on the routing.

## Ground rules for content

The site claims things about a real product that real people pay for, so:

- Do not claim a feature TablePro does not have.
- Do not describe a competitor inaccurately. If you are comparing, be fair —
  a comparison page that oversells us is worse than no page.
- Cite a version when a claim depends on one.

## Development

```bash
composer install && npm install
cp .env.example .env && php artisan key:generate
composer dev
```

No database, no API keys. If something asks you for either, that is a bug.

Before opening a pull request:

```bash
vendor/bin/pint     # code style
php artisan test    # test suite
npm run build       # make sure the bundle still builds
```

CI runs the same three. It will not fix style for you.

## What does not belong here

Anything touching licences, payments, customer accounts or personal data is
handled by a separate application — see [docs/architecture.md](docs/architecture.md).
If your change needs one of those, open an issue describing what you need
rather than working around it.

## Licensing

By contributing you agree that:

- **Code** you contribute is licensed under the [MIT licence](LICENSE).
- **Content** you contribute — prose, blog posts, page copy — is licensed under
  [CC BY-NC 4.0](LICENSE-CONTENT).

Practically: anyone may reuse the code freely, and may share the writing with
attribution for non-commercial purposes. Nobody may take the writing and product
screenshots and stand up a competing commercial site with them.

Do not commit images you do not have the rights to. Third-party logos under
`public/images/sponsors/` belong to their owners and are used with permission;
neither licence above extends to them.
