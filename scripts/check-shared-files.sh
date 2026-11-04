#!/usr/bin/env bash
#
#   scripts/check-shared-files.sh ../tablepro-cloud
#
# Diffs each file docs/shared-files.md lists with its copy in a tablepro-cloud
# checkout. Exits 0 when every pair matches, 1 when any differs or is missing,
# 2 on misuse.

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
other="${1:-}"

if [ -z "$other" ]; then
    echo "usage: $0 <path to a tablepro-cloud checkout>" >&2
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

# Rows whose first two cells are backticked paths: | `resources/css/tokens.css` | `web/packages/ui/src/styles/tokens.css` | …
pairs="$(grep -oE '^\| `[^`]+` \| `[^`]+` \|' "$list" | sed -E 's/^\| `([^`]+)` \| `([^`]+)` \|$/\1 \2/')"

if [ -z "$pairs" ]; then
    echo "error: no shared paths listed in $list" >&2
    exit 2
fi

status=0

while read -r path theirs_path; do
    mine="$here/$path"
    theirs="$other/$theirs_path"

    if [ ! -f "$mine" ] || [ ! -f "$theirs" ]; then
        missing="$([ -f "$mine" ] && echo "$theirs" || echo "$mine")"
        printf '  MISSING  %s\n' "$missing"
        status=1
        continue
    fi

    if cmp -s "$mine" "$theirs"; then
        printf '  same     %s\n' "$path"
    else
        printf '  DIFFERS  %s and %s\n' "$path" "$theirs_path"
        diff -u "$mine" "$theirs" | sed 's/^/           /' | head -40 || true
        status=1
    fi
done <<< "$pairs"

if [ "$status" -ne 0 ]; then
    echo
    echo "Shared files disagree. Apply the same change in both repositories and update the hashes in docs/shared-files.md."
fi

exit "$status"
