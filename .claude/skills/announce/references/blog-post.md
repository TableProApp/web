# Release post

A release post is one file, `resources/blog/<slug>.md`, English only. `BlogService` globs the
directory, so there is no index or route to edit. It carries the detail, the figures and the limits;
the newsletter and X posts are written from it.

Three things get a post sent back: no figures, copy that runs long or reads like marketing, and a
layout invented instead of matched to the shipped posts.

## 1. Read first

```bash
ls resources/blog/tablepro-0-*.md
grep -n "^## \|^<asset-slot" resources/blog/tablepro-0-*.md
```

Read the newest release post in full. Match its shape, its frontmatter and its figure wiring.

## 2. What to feature

Pick from the shipped `CHANGELOG.md` section in `../TablePro`, not from memory.

- **Prose plus a figure** for something a reader will change their behavior over: three or four
  features at most. Lead with what the most users touch, not with what took the most work.
- **One bullet** for everything else, in "Also new".
- **Fixes worth knowing about**: the few a reader hit, written as what used to go wrong.
- **A bold one-liner** for a breaking change or removal, so it cannot be skimmed past.

At least a 3x spread in words between the biggest and the smallest section; under 2x reads as
machine-written. State the behavior and stop: rationale once per post, not per section.

## 3. Shape

```
intro                  "TablePro 0.81 is out: 126 changes, 67 of them fixes." then one paragraph
<asset-slot>           the hero, right after the intro
## <feature>           one per featured item, figures between them
## Also new            bullets
## Fixes worth knowing about
## What it will not do  real gaps, not disguised strengths
## Getting it          the update path, and plugins with updates in Settings > Plugins
```

Headings are plain statements or names. No questions, slogans or gerund stacks.

## 4. Frontmatter

```yaml
---
slug: tablepro-0-81        # equals the filename
title: "TablePro 0.81: Tabs per Database, Firebase and Bigtable"   # quote a title with a colon
description: One or two sentences, at most 155 characters (SeoLengthsTest).
date: 2026-10-16           # the publish date, never changed later
release: "TablePro 0.81"   # marks a release post; a guide has none
author: TablePro Team
tags: [release, connections, oracle]
ogPunchline: Two or three short sentences under about 90 characters. The OG card subtitle.
---
```

- Every tag after `release` is a key of `PostTopics::PAGES` or an engine id in
  `resources/data/engines.json`; `BlogTest` fails on any other.
- `ogPunchline` is what someone reads on a shared link, not the description restated. It counts no
  engines (`NoTypedCountsTest`), and neither field makes a privacy claim (`BannedClaimsTest`).

## 5. Figures

Required: never open the post's pull request without them. The screenshots usually exist on the
feature pull requests in TableProApp/TablePro: `gh pr view <n> --json body`, then download the
`user-attachments` URLs with `Authorization: token $(gh auth token)`.

- Look at each shot before using it. Crop out a home folder path, a version label from the build
  that took it, and any backdrop behind a sheet. Sample data only.
- A figure is `<asset-slot id="blog-<slug>-N"></asset-slot>` in the post plus an entry in
  `resources/data/assets.json`. Copy the newest post's `blog-<slug>-N` entries and change the key,
  `usedOn`, `aspect` (the source's `W:H`), `replacement.base` (the new key), `src`, `legacySource`,
  `description`, `alt` and `caption`.
- Files: the PNG at `public/images/blog/<name>.png`, and `blog-<slug>-N-light-{704,1408}.{avif,webp}`
  beside it, each under 200 KB (`cwebp`, `avifenc`). The `figure` kind in `docs/visual-assets.md`
  is the spec.
- Alt text describes the picture in one long, specific sentence: what is on screen. The caption says
  what the picture proves, in one sentence that stands alone.
- Then `php artisan assets:generate`. A slot left as a placeholder renders nothing in production.

## 6. Voice

Dev to dev, plain and short: about 900 words at most, three or four figures.

- Second person, present tense, contractions. No marketing, no hype, no first person.
- Numbers instead of adjectives: "14 MB instead of a 32 MB zip", never "much faster".
- Backticks on shortcuts, SQL keywords, identifiers, paths and config keys. Bold for menu paths
  (`**Settings > Appearance**`) and UI labels.
- Bullets for limits and fixes. Tables only for tabular things.
- State a limit flatly. Never call a competitor bad; say what it costs.
- No em dashes, no banned words, US spelling.

## 7. Wire it up

1. `tests/Feature/Landing/BlogTest.php`:
   - the slug and date at the top of `BLOG_PUBLISHED`;
   - in the `/blog` test, the newest post's `dateFormatted`;
   - in the `/vi/blog` test, `posts.0` (slug, url, title, Vietnamese date) and the `slice(N, $guides)`
     offset, which counts the release posts newer than the newest guide.
2. Render the OG card and look at it: a long title wraps to three lines and can push the punchline
   off. `WEB_DOMAIN=tablepro.app php artisan og:generate --type=blog --slug=<slug>`.
3. Run:

   ```bash
   python3 .claude/skills/announce/scripts/lint-draft.py --blog resources/blog/<slug>.md
   ../TablePro/scripts/check-banned-words.sh resources/blog/<slug>.md
   php artisan test --compact --filter='BlogTest|SeoLengthsTest|OgCardsTest|AssetManifestTest'
   php artisan test --compact
   ```

Then `references/fact-checks.md`. The pull request body lists what the post covers, the figures and
the test edits, a few bullets.
