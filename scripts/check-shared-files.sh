#!/usr/bin/env bash
#
# Diffs the files this repository shares byte for byte with the account app.
#
#   scripts/check-shared-files.sh ../license
#
# The list is the table in docs/shared-files.md, which both repositories keep
# identical. Each listed file must exist in both checkouts and match exactly.
# Run it during integration and before either pull request is marked ready;
# SharedFilesTest in each repository checks the hashes in CI, and this is the
# tool that shows what actually differs.
#
# Exits 0 when every pair matches, 1 when any differs or is missing, 2 on
# misuse.

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
other="${1:-}"

if [ -z "$other" ]; then
    echo "usage: $0 <path to the other repository>" >&2
    exit 2
fi

if [ ! -d "$other" ]; then
    echo "error: $other is not a directory" >&2
    exit 2
fi

other="$(cd "$other" && pwd)"
list="$here/docs/shared-files.md"

if [ ! -f "$list" ]; then
    echo "error: $list is missing" >&2
    exit 2
fi

# Table rows whose first cell is a backticked path: | `resources/css/tokens.css` | …
paths="$(grep -oE '^\| `[^`]+` \|' "$list" | sed -E 's/^\| `([^`]+)` \|$/\1/')"

if [ -z "$paths" ]; then
    echo "error: no shared paths listed in $list" >&2
    exit 2
fi

status=0

while IFS= read -r path; do
    mine="$here/$path"
    theirs="$other/$path"

    if [ ! -f "$mine" ] && [ ! -f "$theirs" ]; then
        printf '  pending  %s (in neither repository yet)\n' "$path"
        continue
    fi

    if [ ! -f "$mine" ] || [ ! -f "$theirs" ]; then
        missing="$([ -f "$mine" ] && echo "$other" || echo "$here")"
        printf '  MISSING  %s (not in %s)\n' "$path" "$missing"
        status=1
        continue
    fi

    if cmp -s "$mine" "$theirs"; then
        printf '  same     %s\n' "$path"
    else
        printf '  DIFFERS  %s\n' "$path"
        diff -u "$mine" "$theirs" | sed 's/^/           /' | head -40 || true
        status=1
    fi
done <<< "$paths"

if [ "$status" -ne 0 ]; then
    echo
    echo "Shared files disagree. Apply the same change in both repositories and update docs/shared-files.md in both."
fi

exit "$status"
