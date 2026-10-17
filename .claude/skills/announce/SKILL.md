---
name: announce
description: >
  Writes the announcement for a TablePro Mac release: the release post in resources/blog/ with its
  figures, then the newsletter and the X posts written from it, and the checks that keep all three
  true. Use when the user says "announce 0.82", "blog post for the release", "release post for
  0.82", "newsletter for 0.82", "write the X thread", "X posts for 0.82", hands over an X draft to
  polish, or asks whether a release is worth announcing. Not for cutting the release itself: that is
  the release skill in TableProApp/TablePro.
---

# Announce

The post is the announcement; the newsletter and the X posts are written from the finished post, so
the three cannot disagree. Order: post, newsletter, X.

Commands run from this repository's root. `../TablePro` and `../tablepro-docs` are the app and docs
checkouts beside it: confirm the paths with the user and `git pull --ff-only` both first.

## Is it worth announcing

Worth a post when the shipped `### Added` has something a reader would change their behavior over (a
new pane or mode, a new way to connect, a new database, a rebuilt surface they will not recognize),
when something people rely on was removed or changed under them, or when a long-standing class of
bugs users have asked about is gone. Otherwise the changelog and the docs changelog are the
announcement. The entry count per section is a sanity check, not the rule.

Say which way you went and why before any work, and ask when it is borderline: an unwanted
newsletter costs an hour, a skipped one costs a launch.

## Blockers

Nothing goes out until each holds. Report them apart from the drafts.

- The release is live. In `php artisan release:check`, the live value of the GitHub
  `releases/latest` and Sparkle appcast `version` rows is the new version. A DRIFT on those rows
  against an old `resources/data/platforms.json` is the site's own follow-up, not a blocker.
- The docs changelog is deployed with the version:
  `curl -s https://docs.tablepro.app/changelog | grep -c 'v<version>'` prints more than 0.
- `references/fact-checks.md` holds for every claim, plugin and screenshot.
- The fix count is recounted from the shipped section of `../TablePro/CHANGELOG.md`.

`main` deploys itself on green tests, so merging the post publishes it. A post that says "update
now" before the build exists sends readers to the previous version.

## 1. The post

`references/blog-post.md`: one file in `resources/blog/`, its figures and its test edits, through a
pull request.

Once it is live, link it from the version's `<Update>` block in `../tablepro-docs/changelog.mdx`:
`[Read the announcement](https://tablepro.app/blog/<slug>)` on its own line before the first `###`,
committed as `docs(changelog): link the <version> announcement`.

## 2. The newsletter, 3. the X posts

`references/newsletter-and-x.md`. Drafts go in the session scratchpad, named by version
(`newsletter-v0.82.0.md`, `x-posts-v0.82.0.md`), never in this repository, which is public.

Sending is out of scope. If the user asks to send the newsletter, warn them first: in the license
backend the `all` audience means verified subscribers only, a small fraction of the list, and
`everyone` is the real list.

## Checks on every draft

```bash
python3 .claude/skills/announce/scripts/lint-draft.py --blog resources/blog/<slug>.md
python3 .claude/skills/announce/scripts/lint-draft.py <scratchpad>/newsletter-v<version>.md
python3 .claude/skills/announce/scripts/lint-draft.py --x <scratchpad>/x-posts-v<version>.md
../TablePro/scripts/check-banned-words.sh resources/blog/<slug>.md <scratchpad>/*-v<version>.md
```

`lint-draft.py` checks style, budgets, figures and docs links, and exits 1 on anything under
"Fix". `check-banned-words.sh` reads the one banned-word list, `../TablePro/scripts/banned-words.txt`.
Then work `references/fact-checks.md` top to bottom.
