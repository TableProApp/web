---
name: sponsors
description: >
  Keeps resources/data/sponsors.json in step with GitHub Sponsors: who sponsors TablePro now, where
  each one is placed, the open homepage places and the tier prices. Use when the user says "check
  sponsors", "sponsor drift", "new sponsor", "add <company> as a sponsor", "a sponsor cancelled",
  "who sponsors us", or after changing the tiers on GitHub. Read-only against GitHub.
---

# Sponsors

`resources/data/sponsors.json` is the only list the site reads: the homepage strip, `/sponsors`
and the open-place count all come from it. Nothing in the app calls GitHub for sponsors, because
GitHub's sponsorship API needs credentials and this repository holds none. This skill is the check.

Commands run from this repository's root.

## 1. Report

```bash
python3 .claude/skills/sponsors/scripts/drift.py
```

It runs `gh api graphql` with the maintainer's own `gh` login, for the user in
`facts.json` → `links.sponsorsProgram` and the TableProApp organization. If `gh` reports a missing
scope, the user runs `gh auth refresh -h github.com -s read:user` themselves.

| Code | Meaning | Fix |
|---|---|---|
| MISSING | A public sponsor whose amount earns a placement is not listed | Add it (step 2) |
| GONE | A listed sponsor has no current public sponsorship | Remove the entry and its logo file |
| PLACEMENT | Listed above or below what the amount earns | Change `placement` |
| PRIVATE | A private sponsor is listed | Remove it: private sponsors are never named |
| TIERS | Prices on GitHub and in `tiers` differ | Change whichever side is wrong, then rerun |
| STALE | `verifiedAt` is over 30 days old | Rerun and set it once clean |
| LEGACY | Info: kept from before the current tiers (`TIERS_SINCE` in the script) | Nothing |
| EXPIRES | Info: a one-time placement ends within 30 days | Remove it after that date |

A one-time sponsorship counts for `oneTime.months` from its date, at `multiplier` times the
monthly price. GitHub drops one-time sponsors from its own list after a month, so only the script
tracks them.

## 2. Change the data

- One object per sponsor: `id` (kebab-case), `name` as the sponsor writes it, `githubLogin`,
  `placement` (`lead`, `homepage` or `name`), `url` with `?ref=tablepro` where the site
  takes one, and `logo` (`null` for `name`).
- Display order is the array order; a `lead` is drawn first wherever it sits.
- Logos: the file the sponsor sent, at `public/images/sponsors/{id}.svg|png|webp`, with its real
  `width` and `height` (an SVG needs both attributes on its root). A dark-mode file is
  `{id}-dark.*` with the same shape; without one the logo sits on a white tile. Never recolour or
  filter a logo. Check a third-party SVG holds no script, link or embedded image.
- Set `verifiedAt` to the day of a clean report.

Never write an amount, a tier per sponsor, a private sponsor or the report itself into the
repository: it is public. The report stays in the session.

## 3. The README

TablePro's README (TableProApp/TablePro) shows the same sponsors from `.github/assets/sponsors/`.
Regenerate those files from `public/images/sponsors` and update the README's Sponsors section in a
PR there, after this one deploys:

```bash
python3 .claude/skills/sponsors/scripts/readme_tiles.py ../TablePro/.github/assets/sponsors
```

## 4. Ship

```bash
php artisan test --compact --filter='Sponsors|HomepageRender'
npm run test:js
```

Commit as `chore(sponsors): ...` on a branch and open a PR. `main` deploys itself.
