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
if [ -n "$(git status --porcelain)" ]; then
    git status --short >&2
    fail "working tree is not clean — refusing to deploy over local changes"
fi

step "Pulling $BRANCH"
git fetch --prune origin
git pull --ff-only origin "$BRANCH"
CURR_COMMIT="$(git rev-parse HEAD)"
echo "    now at $(git rev-parse --short HEAD) $(git log -1 --format=%s)"

# Only the work the diff actually calls for. A blog post is markdown read by PHP
# at request time, so publishing one needs no bundle; a component change does.
if [ "$PREV_COMMIT" = "$CURR_COMMIT" ] && [ -z "$FORCE" ]; then
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

if changed '^(resources/(js|css)/|vite\.config\.|package(-lock)?\.json|tsconfig\.json)'; then
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

    rm -f "$smoke_file"
    echo "    $SMOKE_URL 200, server-rendered markup present"
fi

printf '\n\033[32mDeployed %s (was %s)\033[0m\n' \
    "$(git rev-parse --short HEAD)" "$(git rev-parse --short "$PREV_COMMIT")"
printf 'Roll back with:\n'
rollback_command
