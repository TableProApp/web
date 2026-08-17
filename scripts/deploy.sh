#!/usr/bin/env bash
#
# Deploys the marketing site. Run from the application root on the web host —
# .github/workflows/deploy.yml does exactly that over SSH.
#
# This app has no database, so there is no migration step and nothing here can
# lose data. The riskiest thing it does is swap the built assets, which is done
# by rename so a request in flight never sees a half-written bundle.
#
# WHY THE BUNDLES ARE BUILT SIDEWAYS
#   Vite empties its output directory before it writes anything. Pointed at the
#   live public/build, that leaves the site with no manifest.json for the length
#   of the build and Laravel answers 500 to everyone until it reappears. Both
#   bundles are therefore built into -next directories and renamed into place
#   once they are known to be complete.
#
#   The asset URLs survive the rename because laravel-vite-plugin takes the
#   public URL prefix from `buildDirectory` and the filesystem path from
#   `outDir`. Overriding only outDir leaves every URL pointing at /build/, which
#   is where the directory ends up.
#
# WHAT IT CHECKS BEFORE SWAPPING
#   A build can exit 0 and still be unusable, so the new directories must have a
#   manifest, an entry for the application's own entry point, and an SSR bundle.
#   If any is missing the live build is left exactly where it was.
#
# WHAT HAPPENS IF A LATER STEP FAILS
#   Once the swap has happened the site is already serving new assets, so any
#   later failure puts the previous ones back. The code stays at the new commit;
#   reverting dependencies too is a decision for a human, so the script prints
#   the command rather than guessing.
#
# USAGE
#   ./scripts/deploy.sh
#   FORCE=1 ./scripts/deploy.sh          # rebuild even if the commit is unchanged
#   APP_PATH=/var/www/tablepro.app BRANCH=main ./scripts/deploy.sh
#
set -euo pipefail

APP_PATH="${APP_PATH:-/var/www/tablepro.app}"
BRANCH="${BRANCH:-main}"
WEB_USER="${WEB_USER:-www-data}"
SUPERVISOR_PROGRAM="${SUPERVISOR_PROGRAM:-tablepro-web-ssr}"
SMOKE_URL="${SMOKE_URL:-}"
FORCE="${FORCE:-}"

# This host sets opcache.validate_timestamps=0 in the FPM ini, so PHP compiles a
# file once and never looks at it again. Without this reload a deploy that
# changes PHP or a Blade template leaves the old bytecode serving traffic
# indefinitely, and the site looks deployed while running the previous release.
#
# Do not check this with `php -i`: the CLI loads /etc/php/8.4/cli/php.ini, which
# on this host says On while FPM says Off. The only honest way to read it is
# through FPM itself.
#
# Set FPM_SERVICE= (empty) to skip, but only on a host where FPM genuinely
# revalidates timestamps.
FPM_SERVICE="${FPM_SERVICE:-php8.4-fpm}"

step() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
fail() { printf '\033[31merror: %s\033[0m\n' "$1" >&2; exit 1; }

cd "$APP_PATH" || fail "no such directory: $APP_PATH"
[ -f artisan ] || fail "$APP_PATH is not a Laravel application"

PREV_COMMIT="$(git rev-parse HEAD)"

rollback_command() {
    printf '  cd %s && git reset --hard %s && composer install --no-dev -q && npm ci --silent && npm run build && php artisan optimize && supervisorctl restart %s\n' \
        "$APP_PATH" "$PREV_COMMIT" "$SUPERVISOR_PROGRAM"
}

# Guarding on EXIT rather than ERR on purpose: `fail` exits directly, and an ERR
# trap does not fire for `exit`.
SWAPPED=0
on_exit() {
    local code=$?

    if [ "$code" -ne 0 ] && [ "$SWAPPED" -eq 1 ]; then
        printf '\033[31mA step after the swap failed — putting the previous bundles back.\033[0m\n' >&2
        if [ -d public/build-old ]; then
            rm -rf public/build && mv public/build-old public/build
        fi
        if [ -d bootstrap/ssr-old ]; then
            rm -rf bootstrap/ssr && mv bootstrap/ssr-old bootstrap/ssr
        fi
        supervisorctl restart "$SUPERVISOR_PROGRAM" || true
        printf 'The code is still at the new commit. To go all the way back:\n' >&2
        rollback_command >&2
    fi

    return "$code"
}
trap on_exit EXIT

# A dirty tree means someone edited files on the server. Merging on top of that
# silently is how those edits disappear, so stop and let a human look.
#
# Its own scratch directories do not count. This script builds into *-next and
# keeps the bundles it replaced at *-old so the EXIT trap can restore them, so
# a successful deploy ends by leaving two untracked directories in the tree the
# next deploy checks. They were not ignored, so the first deploy created them
# and every deploy after it refused to run.
#
# Filtered here rather than left to .gitignore alone, because this check runs
# before the pull: a tree already holding the artifacts cannot reach the commit
# that would ignore them, and the deadlock would need a human on the server.
DIRTY="$(git status --porcelain | grep -vE '^\?\? (public/build|bootstrap/ssr)-(old|next)/$' || true)"

if [ -n "$DIRTY" ]; then
    printf '%s\n' "$DIRTY" >&2
    fail "working tree is not clean — refusing to deploy over local changes"
fi

step "Pulling $BRANCH"
git fetch --prune origin

# `git pull --ff-only` is right — a deploy must never merge or rebase on its own
# — but when the branch has been rewritten upstream it fails with a wall of git
# hints and the word "aborting", which reads like the script is broken rather
# than like the server is one command from fine. Name the situation instead.
if ! git merge-base --is-ancestor HEAD "origin/$BRANCH" 2>/dev/null; then
    printf '\033[31mLocal %s has diverged from origin/%s.\033[0m\n' "$BRANCH" "$BRANCH" >&2
    printf '  local  %s %s\n' "$(git rev-parse --short HEAD)" "$(git log -1 --format=%s)" >&2
    printf '  origin %s %s\n' \
        "$(git rev-parse --short "origin/$BRANCH")" \
        "$(git log -1 --format=%s "origin/$BRANCH")" >&2
    printf '\nUsually this means the branch was force-pushed. If this checkout has no\n' >&2
    printf 'commits of its own worth keeping — it should not — take the remote as truth:\n\n' >&2
    printf '    cd %s && git fetch origin && git reset --hard origin/%s\n\n' "$APP_PATH" "$BRANCH" >&2
    fail "refusing to merge or rebase during a deploy"
fi

git pull --ff-only origin "$BRANCH"
CURR_COMMIT="$(git rev-parse HEAD)"
echo "    now at $(git rev-parse --short HEAD) $(git log -1 --format=%s)"

# The commit is a proxy for "the bundles are current", and it is wrong in the
# one case that matters: someone repaired this checkout by hand. A `git reset
# --hard` — which the runbook tells you to run after a force-push — moves the
# sources without touching public/build or bootstrap/ssr, because both are
# gitignored build output. The next deploy then sees an unchanged commit,
# reports success, and leaves the site on bundles built from older sources.
#
# That happened: a deploy went green while the live homepage served the previous
# release, and the smoke test passed because the stale bundle still renders a
# perfectly valid page.
bundles_are_stale() {
    [ -f public/build/manifest.json ] || return 0
    [ -f bootstrap/ssr/ssr.js ] || return 0

    # Any front-end source newer than the manifest means the manifest predates it.
    [ -n "$(find resources package.json package-lock.json vite.config.js tsconfig.json \
        -newer public/build/manifest.json -print -quit 2>/dev/null)" ]
}

# Only the work the diff actually calls for. A blog post is markdown read by PHP
# at request time, so publishing one needs no bundle; a component change does.
if [ "$PREV_COMMIT" = "$CURR_COMMIT" ] && [ -z "$FORCE" ] && bundles_are_stale; then
    echo "    commit unchanged, but the built bundles are missing or older than the sources"
    echo "    rebuilding anyway — a hand-repaired checkout looks identical to an idle one"
    CHANGED_FILES="$(git ls-files)"
elif [ "$PREV_COMMIT" = "$CURR_COMMIT" ] && [ -z "$FORCE" ]; then
    echo "    already up to date — nothing to build (FORCE=1 to rebuild anyway)"
    CHANGED_FILES=""
elif [ "$PREV_COMMIT" = "$CURR_COMMIT" ]; then
    echo "    already up to date, but FORCE is set — rebuilding everything"
    CHANGED_FILES="$(git ls-files)"
else
    CHANGED_FILES="$(git diff --name-only "$PREV_COMMIT" "$CURR_COMMIT")"
fi

changed() { printf '%s\n' "$CHANGED_FILES" | grep -qE "$1"; }

FRONTEND_CHANGED=false
COMPOSER_CHANGED=false
PHP_CHANGED=false
CONTENT_CHANGED=false

# resources/data/*.json counts as front-end source, not content. Every file in
# there is `import`ed by a module under resources/js — comparisons.json by
# data/comparisons.ts, databases.json by data/databases.ts, database-grid.json
# by the grid component — so Vite inlines them into the bundle at build time.
# Editing one and skipping the rebuild leaves the old copy being served: that is
# how corrected prices and database counts merged, deployed green, and never
# reached the site.
if changed '^(resources/(js|css|data)/|vite\.config\.|package(-lock)?\.json|tsconfig\.json)'; then
    FRONTEND_CHANGED=true
fi

# The pattern above classifies a diff. This asks the far simpler question the
# diff is only a proxy for: is what we built older than what we built it from?
#
# The two disagree whenever a release is skipped, and a skipped rebuild does not
# retry itself — the next deploy diffs against the commit that skipped it, sees
# nothing front-end in that range, and leaves the stale bundle in place forever.
# One misclassified path therefore strands the site until somebody runs FORCE=1.
# It happened: data corrections deployed green and never reached the page, and
# the deploy that fixed the classifier could not undo its own backlog.
#
# Comparing artifacts to sources costs one `find` and cannot be fooled by a
# pattern nobody updated.
if [ "$FRONTEND_CHANGED" = false ] && bundles_are_stale; then
    echo "    the built bundles are older than the sources — rebuilding regardless of the diff"
    FRONTEND_CHANGED=true
fi

# Kept apart from PHP_CHANGED below: a Blade edit needs the caches rebuilt and
# the bytecode dropped, but there is nothing new to download for it.
if changed '^composer\.(json|lock)$'; then
    COMPOSER_CHANGED=true
fi

# resources/views/ belongs in this list even though nothing there is loaded by
# composer: a Blade template compiles to a PHP file whose name is derived from
# its path, so editing one leaves the compiled name unchanged and opcache goes
# on serving the previous compilation. Leaving views out of this test is what
# once shipped a release whose root template — theme colours, font preloads —
# never reached a single visitor.
if changed '^(app/|config/|routes/|bootstrap/|resources/views/|composer\.(json|lock))'; then
    PHP_CHANGED=true
fi

# The sitemap enumerates blog posts and data-driven pages, so it must be
# regenerated whenever that content changes — or whenever routing does.
if changed '^(resources/blog/|resources/data/|routes/)'; then
    CONTENT_CHANGED=true
fi

echo "    frontend=$FRONTEND_CHANGED composer=$COMPOSER_CHANGED php=$PHP_CHANGED content=$CONTENT_CHANGED"

if [ "$COMPOSER_CHANGED" = true ]; then
    step "Installing PHP dependencies"
    composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --quiet
fi

if [ "$FRONTEND_CHANGED" = true ]; then
    step "Installing JavaScript dependencies"
    npm ci --no-audit --no-fund --silent

    step "Building bundles into public/build-next and bootstrap/ssr-next"
    rm -rf public/build-next bootstrap/ssr-next
    npx vite build --outDir public/build-next --emptyOutDir
    npx vite build --ssr --outDir bootstrap/ssr-next --emptyOutDir

    step "Verifying the build before it goes live"
    [ -f public/build-next/manifest.json ] \
        || fail "public/build-next/manifest.json is missing — live build left alone"
    grep -q '"resources/js/app.tsx"' public/build-next/manifest.json \
        || fail "manifest has no entry for resources/js/app.tsx — live build left alone"
    [ -f bootstrap/ssr-next/ssr.js ] \
        || fail "bootstrap/ssr-next/ssr.js is missing — live build left alone"
    echo "    manifest $(wc -c < public/build-next/manifest.json) bytes, ssr.js present"

    step "Swapping in the new bundles"
    rm -rf public/build-old bootstrap/ssr-old
    if [ -d public/build ]; then
        mv public/build public/build-old
    fi
    if [ -d bootstrap/ssr ]; then
        mv bootstrap/ssr bootstrap/ssr-old
    fi
    mv public/build-next public/build
    mv bootstrap/ssr-next bootstrap/ssr
    SWAPPED=1
    echo "    previous bundles kept at public/build-old and bootstrap/ssr-old"

    # The window between the swap and this restart is the only moment the new
    # assets are served alongside the old SSR bundle, so it is kept short.
    step "Restarting the SSR process"
    supervisorctl restart "$SUPERVISOR_PROGRAM"
fi

if [ "$PHP_CHANGED" = true ]; then
    step "Rebuilding caches"
    php artisan optimize:clear > /dev/null
    php artisan optimize

    if [ -n "$FPM_SERVICE" ]; then
        step "Reloading $FPM_SERVICE"
        systemctl reload "$FPM_SERVICE"
    fi
fi

if [ "$CONTENT_CHANGED" = true ] || [ "$PHP_CHANGED" = true ]; then
    step "Regenerating the sitemap"
    php artisan sitemap:generate
fi

step "Restoring ownership"
if [ "$(id -u)" -eq 0 ]; then
    chown -R "$WEB_USER:$WEB_USER" "$APP_PATH"
    echo "    $APP_PATH now owned by $WEB_USER"
else
    echo "    skipped: not running as root, so ownership is already whoever ran this"
fi

step "Smoke test"
if [ -z "$SMOKE_URL" ]; then
    SMOKE_URL="$(grep -E '^APP_URL=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
fi

if [ -z "$SMOKE_URL" ]; then
    echo "    skipped: no APP_URL in .env and no SMOKE_URL set"
else
    smoke_file="$(mktemp)"
    status=000

    # The SSR process may have just restarted; give it a moment to bind its port
    # before deciding the site is broken.
    for _ in $(seq 1 15); do
        status="$(curl -s -o "$smoke_file" -w '%{http_code}' "$SMOKE_URL" || echo 000)"
        if [ "$status" = "200" ]; then
            break
        fi
        sleep 1
    done

    if [ "$status" != "200" ]; then
        rm -f "$smoke_file"
        fail "$SMOKE_URL answered $status"
    fi

    # A 200 alone would also come back if SSR were down and the page shipped as
    # an empty shell, so check that the server actually rendered something.
    if ! grep -q '<h1' "$smoke_file"; then
        rm -f "$smoke_file"
        fail "$SMOKE_URL returned 200 but no server-rendered <h1> — is SSR running?"
    fi

    # And that what it rendered is *this* release. An <h1> proves SSR is alive;
    # it does not prove the bundle behind it is the one just built, and a stale
    # bundle renders a completely valid previous version of the site. Compare
    # the entry filename in the manifest against what the page actually loads —
    # Vite hashes it per build, so they match only if the served app is this one.
    BUILT_ENTRY="$(tr -d ' \n' < public/build/manifest.json \
        | grep -o '"resources/js/app.tsx":{"file":"[^"]*"' \
        | sed 's/.*"file":"//;s/"$//')"

    if [ -z "$BUILT_ENTRY" ]; then
        rm -f "$smoke_file"
        fail "could not read the app entry out of public/build/manifest.json"
    fi

    if ! grep -q "$BUILT_ENTRY" "$smoke_file"; then
        rm -f "$smoke_file"
        printf '    expected asset: %s\n' "$BUILT_ENTRY" >&2
        fail "$SMOKE_URL is serving a different build than the one just deployed"
    fi

    rm -f "$smoke_file"
    echo "    $SMOKE_URL 200, serving $BUILT_ENTRY"
fi

printf '\n\033[32mDeployed %s (was %s)\033[0m\n' \
    "$(git rev-parse --short HEAD)" "$(git rev-parse --short "$PREV_COMMIT")"
printf 'Roll back with:\n'
rollback_command
