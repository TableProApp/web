#!/bin/bash
set -e

# Deploys the marketing site. Run from the application root on the web host.
#
# This app has no database, so there is no migration step and nothing here can
# lose data. The riskiest thing it does is swap the built assets, which is done
# by rename so a request in flight never sees a half-written bundle.

PREV_COMMIT=$(git rev-parse HEAD)

echo "==> Pulling latest code..."
git pull origin main

CURR_COMMIT=$(git rev-parse HEAD)

if [ "$PREV_COMMIT" = "$CURR_COMMIT" ]; then
    echo "==> Already up to date."
    exit 0
fi

CHANGED_FILES=$(git diff --name-only "$PREV_COMMIT" "$CURR_COMMIT")

FRONTEND_CHANGED=false
PHP_CHANGED=false
CONTENT_CHANGED=false

if echo "$CHANGED_FILES" | grep -qE '^(resources/(js|css)/|vite\.config\.|package(-lock)?\.json|tsconfig\.json)'; then
    FRONTEND_CHANGED=true
fi

if echo "$CHANGED_FILES" | grep -qE '^(app/|config/|routes/|bootstrap/|composer\.(json|lock))'; then
    PHP_CHANGED=true
fi

# The sitemap enumerates blog posts and data-driven pages, so it must be
# regenerated whenever that content changes — or whenever routing does.
if echo "$CHANGED_FILES" | grep -qE '^(resources/blog/|resources/data/|routes/)'; then
    CONTENT_CHANGED=true
fi

if [ "$PHP_CHANGED" = true ]; then
    echo "==> Installing PHP dependencies..."
    composer install --no-dev --no-interaction --optimize-autoloader
fi

if [ "$FRONTEND_CHANGED" = true ] || [ "$PHP_CHANGED" = true ]; then
    php artisan route:clear
fi

if [ "$FRONTEND_CHANGED" = true ]; then
    echo "==> Building frontend..."
    npm ci
    npx vite build --outDir "public/build-next"
    npx vite build --ssr --outDir "bootstrap/ssr-next"

    rm -rf public/build-old bootstrap/ssr-old
    mv public/build public/build-old 2>/dev/null || true
    mv public/build-next public/build
    mv bootstrap/ssr bootstrap/ssr-old 2>/dev/null || true
    mv bootstrap/ssr-next bootstrap/ssr
    rm -rf public/build-old bootstrap/ssr-old

    echo "==> Restarting SSR server..."
    supervisorctl restart tablepro-web-ssr
fi

if [ "$PHP_CHANGED" = true ]; then
    echo "==> Caching..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache

    echo "==> Reloading PHP-FPM..."
    systemctl reload php8.4-fpm
fi

if [ "$CONTENT_CHANGED" = true ] || [ "$PHP_CHANGED" = true ]; then
    echo "==> Regenerating sitemap..."
    php artisan sitemap:generate
fi

echo "==> Fixing ownership..."
chown -R www-data:www-data .

echo "==> Done!"
