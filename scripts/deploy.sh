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
# HOW IT IS STARTED
#   The deploy key logs in as `ubuntu`, and its forced command runs
#   `sudo -n -u www-data /var/www/tablepro.app/scripts/deploy.sh`
#   (docs/deployment.md, "The deploy key"). So the script runs as www-data, the
#   user that owns the checkout, from whatever directory and environment the SSH
#   session had. Nothing below depends on either.
#
#   It used to run as root, from a tree www-data can write. Anything able to
#   write as www-data — PHP-FPM serves every request as that user — could edit
#   this file and wait for the next deploy to run it as root. Now git, composer,
#   npm, vite and artisan all run unprivileged, and the two steps that need root,
#   the PHP-FPM reload and the SSR restart, go through `sudo -n` by absolute path
#   with exact arguments, which is all the sudoers rule allows.
#
#   Started as root (a human in `sudo -i`), it still works as it always did: it
#   runs those two commands itself and ends by handing the checkout back to
#   www-data.
#
# USAGE
#   sudo -u www-data /var/www/tablepro.app/scripts/deploy.sh
#   sudo -u www-data FORCE=1 /var/www/tablepro.app/scripts/deploy.sh    # rebuild even if the commit is unchanged
#   sudo -u www-data APP_PATH=/var/www/tablepro.app BRANCH=main /var/www/tablepro.app/scripts/deploy.sh
#
#   sudo drops the caller's environment, so a variable has to be given on the
#   sudo command line, as above, to reach the script.
#
set -euo pipefail

step() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
fail() { printf '\033[31merror: %s\033[0m\n' "$1" >&2; exit 1; }

# How much of the caller's environment sudo keeps is a matter of its policy, so
# the standard directories go on PATH whatever PATH arrived with.
export PATH="${PATH:+$PATH:}/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

APP_PATH="${APP_PATH:-/var/www/tablepro.app}"
BRANCH="${BRANCH:-main}"
WEB_USER="${WEB_USER:-www-data}"
SUPERVISOR_PROGRAM="${SUPERVISOR_PROGRAM:-tablepro-web-ssr}"
SMOKE_URL="${SMOKE_URL:-}"
FORCE="${FORCE:-}"
DEPLOY_CACHE_DIR="${DEPLOY_CACHE_DIR:-/var/cache/tablepro-deploy}"

# Every relative path below is relative to APP_PATH, after the `cd` further
# down. A relative APP_PATH would itself depend on the caller's directory.
case "$APP_PATH" in
    /*) ;;
    *) fail "APP_PATH must be an absolute path, got: $APP_PATH" ;;
esac

if [ "$(id -u)" -eq 0 ]; then
    AS_ROOT=true
else
    AS_ROOT=false
fi

if [ "$AS_ROOT" = true ]; then
    # A HOME still pointing at /home/ubuntu would have root write its npm and
    # Composer caches into that user's home, where they later break the user's
    # own npm, and read that user's git configuration. So HOME comes from the
    # password database. (getent is Linux-only; elsewhere HOME is left as it is.)
    if home_dir="$(getent passwd "$(id -u)" 2>/dev/null | cut -d: -f6)" && [ -n "$home_dir" ]; then
        export HOME="$home_dir"
    fi

    # The checkout belongs to $WEB_USER (see "Restoring ownership" below), so
    # git, running as root, refuses it as "dubious ownership". Under sudo it
    # compares the owner with the calling user, which does not match either.
    # Trusting this one path here, in command scope, means a root deploy does not
    # depend on a safe.directory line in somebody's ~/.gitconfig. It extends no
    # new trust: as root the script already runs this tree's PHP as root.
    export GIT_CONFIG_COUNT=1
    export GIT_CONFIG_KEY_0=safe.directory
    export GIT_CONFIG_VALUE_0="$APP_PATH"
else
    # www-data's home is /var/www, which it cannot write, so npm and Composer
    # keep their caches in a directory of their own. HOME points there too, so
    # nothing else that writes under it falls back to /var/www. Root creates it
    # once, owned by the deploying user (docs/deployment.md, "The deploy key").
    case "$DEPLOY_CACHE_DIR" in
        /*) ;;
        *) fail "DEPLOY_CACHE_DIR must be an absolute path, got: $DEPLOY_CACHE_DIR" ;;
    esac
    if [ ! -d "$DEPLOY_CACHE_DIR" ] || [ ! -w "$DEPLOY_CACHE_DIR" ]; then
        fail "$DEPLOY_CACHE_DIR is not a directory $(id -un) can write. Create it once, as root: install -d -o $(id -un) -g $(id -gn) -m 0750 $DEPLOY_CACHE_DIR"
    fi

    export HOME="$DEPLOY_CACHE_DIR/home"
    export COMPOSER_HOME="$DEPLOY_CACHE_DIR/composer"
    export COMPOSER_CACHE_DIR="$DEPLOY_CACHE_DIR/composer/cache"
    export npm_config_cache="$DEPLOY_CACHE_DIR/npm"
    mkdir -p "$HOME" "$COMPOSER_CACHE_DIR" "$npm_config_cache"
fi

# This host sets opcache.validate_timestamps=0 in the FPM ini, so PHP compiles a
# file once and never looks at it again. Without this reload a deploy that
# changes PHP or a Blade template leaves the old bytecode serving traffic
# indefinitely, and the site looks deployed while running the previous release.
#
# Do not check this with `php -i`: the CLI loads /etc/php/<version>/cli/php.ini,
# which on this host says On while FPM says Off. The only honest way to read it
# is through FPM itself.
#
# The service defaults to the FPM of the CLI's own PHP version: the CLI runs
# composer and artisan for the same release, so the two have to agree anyway.
# On this host, Ubuntu 26.04, whose archive ships no other PHP, that is
# php8.5-fpm. Set FPM_SERVICE to name another unit.
command -v php > /dev/null || fail "php is not on PATH ($PATH)"
PHP_MINOR="$(php -r 'echo PHP_MAJOR_VERSION, ".", PHP_MINOR_VERSION;')"
FPM_SERVICE="${FPM_SERVICE:-php${PHP_MINOR}-fpm}"

cd "$APP_PATH" || fail "no such directory: $APP_PATH"
[ -f artisan ] || fail "$APP_PATH is not a Laravel application"

# Run as anyone but root, the script rewrites the checkout in place and cannot
# chown, so every file in it has to be this user's already. A root run that
# stopped before "Restoring ownership" leaves root-owned files behind; name the
# first one here rather than fail on it halfway through `npm ci`.
if [ "$AS_ROOT" = false ]; then
    foreign="$(find "$APP_PATH" ! -user "$(id -u)" -print -quit 2>/dev/null || true)"
    if [ -n "$foreign" ]; then
        fail "$foreign is not owned by $(id -un). Hand the checkout back once, as root: chown -R $(id -un):$(id -gn) $APP_PATH"
    fi
fi

PREV_COMMIT="$(git rev-parse HEAD)"

# The two steps that need root. As root they run as they always have. As
# anyone else they go through `sudo -n`, by absolute path and with exact
# arguments, because that is all the sudoers rule allows (docs/deployment.md,
# "The deploy key"): sudo matches the command line literally, and -n makes a
# missing rule fail at once instead of waiting on a password nobody can type.
# A failure returns non-zero, so `set -e` stops the deploy and the EXIT trap
# below puts swapped bundles back.
reload_fpm() {
    if [ "$AS_ROOT" = true ]; then
        systemctl reload "$FPM_SERVICE"
    else
        sudo -n /usr/bin/systemctl reload "$FPM_SERVICE" \
            || sudo_failed "/usr/bin/systemctl reload $FPM_SERVICE"
    fi
}

restart_ssr() {
    if [ "$AS_ROOT" = true ]; then
        supervisorctl restart "$SUPERVISOR_PROGRAM"
    else
        sudo -n /usr/bin/supervisorctl restart "$SUPERVISOR_PROGRAM" \
            || sudo_failed "/usr/bin/supervisorctl restart $SUPERVISOR_PROGRAM"
    fi
}

sudo_failed() {
    printf '\033[31merror: sudo -n %s failed.\033[0m\n' "$1" >&2
    printf '  Either sudo refused it, because no NOPASSWD rule in /etc/sudoers.d/tablepro-deploy\n' >&2
    printf '  lets %s run exactly that command line, or the command itself failed.\n' "$(id -un)" >&2
    return 1
}

# Meant for a root shell, so it ends by handing the checkout back to $WEB_USER:
# root-owned files left in it would stop the next unprivileged deploy.
rollback_command() {
    printf '  cd %s && git reset --hard %s && composer install --no-dev -q && npm ci --silent && npm run build && php artisan optimize && chown -R %s:%s %s && systemctl reload %s && supervisorctl restart %s\n' \
        "$APP_PATH" "$PREV_COMMIT" "$WEB_USER" "$WEB_USER" "$APP_PATH" "$FPM_SERVICE" "$SUPERVISOR_PROGRAM"
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
        restart_ssr || true
        printf 'The code is still at the new commit. To go all the way back, from a root shell (sudo -i):\n' >&2
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

# A here-string, not `printf | grep -q`: grep -q exits on its first match, and
# under `set -o pipefail` the printf it leaves writing to a closed pipe fails
# the whole test once the list outgrows the pipe buffer (64 KB, about 1,000
# paths). That reported php=false for a 1,584-file release, so it shipped
# without rebuilding the caches or reloading PHP-FPM.
changed() { grep -qE "$1" <<< "$CHANGED_FILES"; }

FRONTEND_CHANGED=false
COMPOSER_CHANGED=false
PHP_CHANGED=false
CONTENT_CHANGED=false

# resources/data/ counts as front-end source, not content. Its data files are
# `import`ed by modules under resources/js (directly or through the `@data`
# alias), so Vite inlines them into the bundle at build time, and the page copy
# under resources/data/content/{locale}/ types the pages that render it. Editing
# one and skipping the rebuild leaves the old copy being served: that is how
# corrected prices and database counts merged, deployed green, and never reached
# the site. The pattern is a prefix, so nested files such as content/vi/x.json
# and legal/vi/privacy.md are covered.
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
#
# lang/ for the same reason: its files are PHP arrays that are `require`d and
# held by opcache. resources/data/locales.json because it decides which route
# groups exist (routes/web.php mounts one per locale), so a new locale must
# rebuild the route cache. The rest of resources/data/ is read per request and
# needs no cache rebuild.
if changed '^(app/|config/|routes/|bootstrap/|resources/views/|lang/|resources/data/locales\.json|composer\.(json|lock))'; then
    PHP_CHANGED=true
fi

# The sitemap enumerates blog posts and data-driven pages, so it must be
# regenerated whenever that content changes — or whenever routing does. The
# prefixes cover the translations too: resources/blog/vi/ and
# resources/data/content/vi/.
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
    restart_ssr
fi

if [ "$PHP_CHANGED" = true ]; then
    step "Rebuilding caches"
    php artisan optimize:clear > /dev/null
    php artisan optimize

    if [ -n "$FPM_SERVICE" ]; then
        step "Reloading $FPM_SERVICE"
        reload_fpm
    fi
fi

if [ "$CONTENT_CHANGED" = true ] || [ "$PHP_CHANGED" = true ]; then
    step "Regenerating the sitemap"
    php artisan sitemap:generate
fi

step "Restoring ownership"
if [ "$AS_ROOT" = true ]; then
    chown -R "$WEB_USER:$WEB_USER" "$APP_PATH"
    echo "    $APP_PATH now owned by $WEB_USER"
else
    echo "    skipped: running as $(id -un), which already owns everything it wrote"
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
printf 'Roll back with, from a root shell (sudo -i):\n'
rollback_command
