#!/usr/bin/env bash
#
# Measures cold start for TablePro and any competitor you name, and prints a
# record you can paste onto the site.
#
# The point of this script is not the number. It is that anyone can re-run it
# and get their own number, which is the difference between a claim and a
# measurement. Whatever ends up on the page must link here.
#
# WHAT IT MEASURES
#   Wall-clock from `open -a <App>` returning to the app's first window existing
#   in the accessibility tree. That is "launch to first window" — the moment the
#   user has something to look at. It deliberately does NOT include connecting
#   to a database or rendering a result, because those depend on your network
#   and your server, not on the client.
#
# WHY IT NEEDS SUDO
#   A cold start is only cold if the binary and its frameworks are not already
#   in the page cache. `purge` evicts them. Without it you are measuring a warm
#   start, which is a different and much smaller number — and quoting a warm
#   number as a cold one is the kind of thing this whole exercise exists to
#   avoid. The script refuses to report if it could not purge.
#
# FIRST RUN
#   macOS will ask for Accessibility permission for your terminal, because
#   reading another app's window list needs it. Grant it, then run again.
#
# USAGE
#   ./scripts/measure-cold-start.sh TablePro DBeaver "Beekeeper Studio"
#
set -euo pipefail

RUNS="${RUNS:-5}"
SETTLE="${SETTLE:-3}"
TIMEOUT="${TIMEOUT:-60}"

if [ "$#" -eq 0 ]; then
    echo "usage: $0 <App Name> [<App Name> ...]" >&2
    echo "example: $0 TablePro DBeaver 'Beekeeper Studio'" >&2
    exit 64
fi

have_window() {
    osascript -e "tell application \"System Events\" to exists (window 1 of process \"$1\")" 2>/dev/null
}

quit_app() {
    osascript -e "tell application \"$1\" to quit" >/dev/null 2>&1 || true
    for _ in $(seq 1 40); do
        pgrep -x "$1" >/dev/null 2>&1 || return 0
        sleep 0.25
    done
    pkill -x "$1" >/dev/null 2>&1 || true
}

# One measurement. Echoes seconds with millisecond resolution, or "timeout".
measure_once() {
    local app="$1" start elapsed

    quit_app "$app"
    sync
    sudo purge
    sleep "$SETTLE"

    start=$(python3 -c 'import time; print(time.monotonic())')
    open -a "$app"

    while :; do
        elapsed=$(python3 -c "import time; print(time.monotonic() - $start)")
        if [ "$(have_window "$app")" = "true" ]; then
            printf '%.3f' "$elapsed"
            return 0
        fi
        if python3 -c "import sys; sys.exit(0 if $elapsed > $TIMEOUT else 1)"; then
            printf 'timeout'
            return 0
        fi
    done
}

echo "Asking for sudo once, so 'purge' can run between every measurement." >&2
sudo -v
if ! sudo purge 2>/dev/null; then
    echo "error: 'purge' failed. Without it these are warm starts, not cold ones." >&2
    exit 1
fi

echo
echo "TablePro cold start — launch to first window"
echo "date              $(date -u '+%Y-%m-%d')"
echo "hardware          $(sysctl -n machdep.cpu.brand_string), $(($(sysctl -n hw.memsize) / 1073741824)) GB"
echo "macOS             $(sw_vers -productVersion) ($(sw_vers -buildVersion))"
echo "runs per app      $RUNS, page cache purged before each"
echo "method            scripts/measure-cold-start.sh in the site repository"
echo

for app in "$@"; do
    version=$(defaults read "/Applications/${app}.app/Contents/Info" CFBundleShortVersionString 2>/dev/null || echo "unknown")
    samples=()

    for _ in $(seq 1 "$RUNS"); do
        samples+=("$(measure_once "$app")")
    done

    quit_app "$app"

    printf '%-24s %-12s %s\n' "$app" "$version" "$(
        printf '%s\n' "${samples[@]}" | python3 -c '
import statistics, sys

values = [line.strip() for line in sys.stdin if line.strip()]
numeric = [float(v) for v in values if v != "timeout"]

if not numeric:
    print("all runs timed out")
elif len(numeric) < len(values):
    print(f"{len(values) - len(numeric)} of {len(values)} timed out")
else:
    print(f"median {statistics.median(numeric):.2f}s   "
          f"min {min(numeric):.2f}s   max {max(numeric):.2f}s")
'
    )"
done

echo
echo "Report the median. Quote the range too — a number without one invites the"
echo "reader to assume it is a best case."
