# Fact checks

`lint-draft.py` checks how a sentence reads; this file checks whether it is true. Work it top to
bottom on the post first, then on the newsletter and the X posts written from it. `../TablePro` and
`../tablepro-docs` are the app and docs checkouts, pulled to their `main`.

## 1. A fix is tied to a version only when git agrees

```bash
git -C ../TablePro log --oneline -S "<symbol the fix touched>" -- <path>
git -C ../TablePro show <previous-tag>:<path> | grep -n "<the old code>"
```

If the broken code is also at the tag before that, it was never a regression. Say what was wrong
without naming a version.

## 2. A behavior change matches what the old code did

Before grouping several things under one verb ("joins, unions and CTEs are read-only now"), read the
diff and confirm each one changed. A summary easily drops the changelog's scope.

## 3. A plugin feature needs a published binary

Plugins ship as assets of the app release. One is not installable until the release tag contains
the commit, the release carries its zip, and `plugins/v3.json` lists that version:

```bash
git -C ../TablePro merge-base --is-ancestor <feature-commit> v<version> && echo included || echo NOT included
gh release view v<version> -R TableProApp/TablePro --json assets --jq '.assets[].name' | grep '^<Target>-'
curl -s https://updates.tablepro.app/plugins/v3.json | python3 -c \
  'import json,sys; [print(p["id"], [r["version"] for r in p["releases"]]) for p in json.load(sys.stdin)["plugins"] if "<Target>" in p["id"]]'
```

`<Target>` is the plugin's key in `../TablePro/.github/plugin-registry.json`. If a check fails, the
plugin ships first or the section goes.

## 4. Images are real and current

A figure is taken on a build that contains the change; compare the shot with the pull request that
changed the UI it shows. An `images/*.png` in `../tablepro-docs` at exactly 1560x960 is a
"Screenshot coming soon" card, and `lint-draft.py` flags one a draft links. A real docs image can
still be stale:

```bash
git -C ../tablepro-docs log -1 --format='%ad %s' --date=short -- images/<file>.png
```

Never ship a placeholder or a stale shot. Mark the gap and report it as a blocker.

## 5. Menu labels come from the app

The docs paraphrase, so take the string from the menu builder. Watch for labels that change by
engine: "Close Tabs for Other Databases" reads "Other Schemas" on Oracle, Dameng and BigQuery.

```bash
grep -rn "String(localized:" ../TablePro/TablePro/Core/Menu/ | grep -i "<the item>"
```

## 6. Tiers, defaults and thresholds

```bash
grep -n -A3 "case <feature>" ../TablePro/TablePro/Models/Settings/ProFeature.swift
```

- `requiredTier` is the lowest tier that includes a feature, and Team includes Starter: a Starter
  feature "needs a license, and both tiers include it", a Team feature needs Team.
- Describe a gate as it behaves: a locked overlay is not a disabled menu item.
- Quote the number that decides a behavior, or none, after reading every constant in the model
  file, including the default range a comparison runs over.

## 7. Every URL resolves

`lint-draft.py` resolves each `docs.tablepro.app` page and image against `../tablepro-docs`. For an
anchor, read the headings:

```bash
grep -n "^## " ../tablepro-docs/<section>/<page>.mdx
```

The docs `changelog.mdx` carries the version only after the release-day docs deploy, so that link is
a blocker until then, not a broken link.

## 8. Counts and references

- Count the bullets under `### Fixed` in the shipped section of `../TablePro/CHANGELOG.md` and write
  "N fixes", never "N bugs fixed": one bullet can cover several issues.
- Never inflate the count with issue or commit counts.
- Leave issue numbers out of every announcement; changelog references are sometimes wrong.
