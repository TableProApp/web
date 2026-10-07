# Localization

Both applications support `en`, `vi`, `es`, `de`, `fr`, `ja`, `pt-BR`, `zh-Hans`, `ko`, `zh-Hant`, `it` and `id`.
The website’s `resources/data/locales.json` and the account app’s `config/locales.php` must agree on native names,
public URL prefixes, hreflang, Open Graph and Intl tags. The account’s locale-contract test holds a copy of the JSON.

The public website chooses its language from the URL. English uses `/`; every other language uses its declared
prefix with unchanged slugs. It has no session or language cookie. Each translated page has complete JSON or
Markdown content. Localized blog indexes show English editorial posts and remain `noindex`; release posts remain English.

The account app resolves an explicit locale, then its session, then a stored customer preference, then English.
Its `/account`, `/checkout`, `/thank-you` and `/newsletter` paths never receive a public language prefix.
The signed-in selector posts a CSRF-protected form to `/account/locale`, persists the choice to the account’s
licenses, and redirects to a named account screen without carrying an obsolete query parameter.
A guest’s language link changes the session without replacing a stored email preference.

Checkout metadata carries the selected language into the order and issued license. Transactional mail follows
the recipient’s stored preference. The account app’s signed-page verification excludes only the `locale` query
parameter so its guest selector can change language while preserving the signature and all credential parameters.
Old signed links keep working. Editorial newsletter bodies and staff reports retain their original language.

Website UI catalogs live in `resources/js/i18n/messages/{locale}/` and server labels in `lang/{locale}/`.
The account’s single source is its complete `lang/{locale}/*.php` groups and `lang/{locale}.json`.
Translate whole sentences and preserve placeholders, inline tags, facts, code, identifiers, URLs and legal anchors.
Search metadata must fit the existing title and description budgets.

The image manifest has native descriptions, alternatives and captions. `php artisan assets:handoff` generates
shared geometry and separate language text files. The page resolver loads the requested text before SSR or
hydration; concurrent requests cache by language rather than changing a global current language.
English editorial assets keep English text. Generate localized artwork using `scripts/assets/` and social cards
with `php artisan og:generate`, retaining the original geometry and source licensing.

Run catalog, route, sitemap, asset and notification tests, TypeScript checks, and client/SSR builds before release.
Laravel validation translations retain the upstream MIT notice in `lang/LICENSE-LARAVEL-LANG`; generated font
sources retain the Noto CJK SIL Open Font License in `scripts/assets/LICENSE-NOTO-CJK`.
