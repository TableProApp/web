# Integrations pages

`/integrations` (every locale) and `/integrations/{slug}` (English only) render from two inputs:

| Input | File | Who writes it |
|---|---|---|
| Entries: names, summaries, links, icons, what each one uses | `resources/data/integrations.json`, `public/images/integrations/*.png` | The sync PR, copied from a TableProApp/integrations release. Never edit them here |
| Page copy, labels and taglines, one file per language | `resources/data/content/{locale}/integrations/index.json` | You |

## The content file

- `seo`, `header`, `filters`, `publish`, `notice`: the hub.
- `labels`: shared by the hub and the detail page (tiers, categories, "By {publisher}", "Closed source").
- `show`: the detail page. It renders in English only today, but the keys exist in every language, so translating the page later is a content change.
- `show.uses.surface.{id}.docs`: a docs.tablepro.app path, the same in every language.
- `taglines`: one sentence per slug. The English value is the registry `summary` it was translated from.

A value the registry adds later (a category, an install type, a surface, an archive reason) stays off the pages until this file labels it in every language.

## Taglines

A language other than English lists an entry only when its `taglines` has the slug and the English file's `taglines` still equals the entry's `summary`. So:

- A new entry shows in English at once and in another language once its tagline lands there.
- A changed summary hides the entry outside English until the English tagline and its translations are updated together.
- A tagline for a slug the registry removed is ignored.

The sync PR body lists the active slugs that are still English only.
