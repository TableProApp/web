# How this app gets deployed

`main` deploys itself. A push that turns the tests workflow green triggers
`.github/workflows/deploy.yml`, which opens one SSH connection to the server;
the server runs `scripts/deploy.sh` and nothing else.

Everything below exists because that sentence hides three things worth knowing.

## The server is shared

`tablepro.app` is answered by **two** applications:

```
/var/www/tablepro.app          this repository, the public marketing site
/var/www/license.tablepro.app  the private platform app
```

nginx sends `/account`, `/checkout`, `/webhooks`, `/newsletter`, `/beta`,
`/discount`, `/thank-you`, `/api/newsletter` and `/platform-build` to the
platform app, and everything else here. The footer's email form posts to
`/api/newsletter`, so it leaves this codebase entirely — which is why nothing in
this repository needs a database or a session.

A dozen other sites share the same host and the same PHP-FPM master, so a reload
is not free — but it is required, and this is the trap on this host:

```
/etc/php/8.4/cli/php.ini    opcache.validate_timestamps  On
/etc/php/8.4/fpm/php.ini    opcache.validate_timestamps  0
```

`php -i` reads the **CLI** ini and says `On`. FPM says `0`, which means it
compiles each file once and never looks at the file again. A deploy that changes
PHP or a Blade template and does not reload FPM leaves the previous release
serving traffic, indefinitely, while every other signal says the deploy
succeeded.

The only honest way to read the value is through FPM itself — a one-line script
under `public/`, fetched over HTTP, then deleted. Beware `opcache.file_update_protection`
(2 seconds by default) when probing: a file written and requested immediately is
never cached at all, so a naive probe reports that everything reloads fine.

`scripts/deploy.sh` therefore reloads `php8.4-fpm` whenever PHP changed. Set
`FPM_SERVICE=` empty only on a host where FPM genuinely revalidates.

## It only does the work the diff calls for

The script compares the commit it started at with the one it pulled, and decides
from the changed paths:

| Changed | Consequence |
| --- | --- |
| `resources/js/`, `resources/css/`, `vite.config.*`, `package*.json`, `tsconfig.json` | `npm ci`, rebuild both bundles, swap, restart SSR |
| `composer.json`, `composer.lock` | `composer install` |
| `app/`, `config/`, `routes/`, `bootstrap/`, `resources/views/`, `composer.*` | rebuild caches, reload PHP-FPM |
| `resources/blog/`, `resources/data/`, `routes/` | regenerate the sitemap |

`resources/views/` earns its place in the third row the hard way. A Blade
template compiles to a PHP file named after its path, so editing one leaves the
compiled name unchanged and opcache keeps serving the previous compilation. The
first release deployed from this repository shipped a rewritten root template —
new theme colours, new font preloads — that reached nobody until FPM was
reloaded by hand.

Publishing a blog post therefore costs a `git pull` and a sitemap, not a build:
the post is markdown that PHP reads at request time. `FORCE=1` rebuilds
everything anyway, which is what you want after a deploy that stopped halfway.

## The bundles are swapped, not overwritten

Vite empties its output directory before writing to it. Pointed at the live
`public/build`, that leaves the site with no `manifest.json` for the length of
the build and Laravel returns 500 to everyone until it reappears.

So both bundles are built into `public/build-next` and `bootstrap/ssr-next` and
renamed into place once they are complete. The asset URLs stay correct through
the rename because `laravel-vite-plugin` takes the public URL prefix from
`buildDirectory` and the filesystem path from `outDir` — overriding only
`outDir` on the command line leaves every URL pointing at `/build/`, which is
where the directory lands.

Before the rename, three things must hold, or the live bundles are left alone:

- `public/build-next/manifest.json` exists
- it contains an entry for `resources/js/app.tsx`
- `bootstrap/ssr-next/ssr.js` exists

After the rename, any failure puts the previous bundles back from
`public/build-old` and `bootstrap/ssr-old` and restarts SSR. The code stays at
the new commit; the script prints the command to revert that too rather than
guessing that you want it.

The only moment the two halves disagree is between the swap and the SSR restart
a second later, when new assets are served alongside the old SSR bundle.

## Deploying by hand

```bash
ssh -p <port> root@<host>
cd /var/www/tablepro.app && ./scripts/deploy.sh
```

It reads `APP_PATH`, `BRANCH`, `WEB_USER`, `SUPERVISOR_PROGRAM`, `SMOKE_URL`,
`FORCE` and `FPM_SERVICE` from the environment if you need to point it somewhere
else. It refuses to run if the server's working tree is dirty, because merging
over someone's live edit is how that edit disappears.

It finishes by fetching `APP_URL` and checking two things: that the answer is
200, and that the HTML contains a server-rendered `<h1>`. The second check is
the one that matters — SSR falling over still returns 200, just with an empty
shell.

## The SSR process

Supervisor owns it:

```
/etc/supervisor/conf.d/tablepro-web-ssr.conf   →  tablepro-web-ssr
```

Do not confuse it with `tablepro-inertia-ssr`, which belongs to the platform app.
Both exist, both run `inertia:start-ssr`, and restarting the wrong one restarts
someone else's site.

```bash
supervisorctl status tablepro-web-ssr
supervisorctl restart tablepro-web-ssr
tail -f /var/log/supervisor/tablepro-web-ssr.log
```

`Error: Page not found: auth/login` in that log is a scanner, not a bug. This
app has no such page.

## The deploy key

The workflow authenticates with a key that **cannot open a shell**. Its entry in
the server's `authorized_keys` pins it to one command, so the worst a leaked
copy can do is deploy `main` — which is its job.

Create it:

```bash
ssh-keygen -t ed25519 -N '' -C 'tablepro-web-deploy' -f ./deploy_key
```

Install the public half on the server, on one line:

```
command="/var/www/tablepro.app/scripts/deploy.sh",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding ssh-ed25519 AAAA... tablepro-web-deploy
```

Note that `command=` names the copy of the script already on disk, so a change
to `deploy.sh` takes effect on the deploy *after* the one that ships it.

Then set five repository secrets:

| Secret | Value |
| --- | --- |
| `DEPLOY_SSH_KEY` | contents of the private `deploy_key` |
| `DEPLOY_KNOWN_HOSTS` | `ssh-keyscan -p <port> <host>` output, pinned |
| `DEPLOY_HOST` | server address |
| `DEPLOY_PORT` | SSH port |
| `DEPLOY_USER` | user the `authorized_keys` entry belongs to |

`DEPLOY_KNOWN_HOSTS` is pinned rather than discovered at run time because
`ssh-keyscan` trusts whatever answers it, which would accept an impostor on the
first connection and make checking pointless.

Revoke by deleting that line from `authorized_keys`. Deleting the GitHub secret
alone leaves a working key in circulation.

### Why this workflow may hold a secret when `tests.yml` may not

`tests.yml` carries a warning that no workflow may be granted secrets, because
the repository accepts pull requests from forks. Three properties keep this one
out of a fork's reach:

1. It never runs on `pull_request`. `workflow_run` fires only after a tests run
   that already completed on `main`, and a fork's pull request never produces
   one.
2. It does not check the repository out, so no contributor's code is executed on
   the runner or sent to the server.
3. The forced command means the key grants one action, not a shell.

## Caching

nginx sends nothing for HTML — Laravel's own `no-cache, private` stands, which
is correct for server-rendered pages.

Hashed assets are a different matter, and the origin used to say nothing about
them at all, so **Cloudflare** filled the gap with its four-hour default. Every
returning visitor revalidated files that cannot change. The fix is in
`/etc/nginx/sites-available/tablepro.app`:

```nginx
location /build/ {
    access_log off;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}
```

Vite writes a content hash into every filename under `/build/`, so a deploy
publishes new names rather than new bytes behind old ones — there is nothing for
a browser to revalidate.

This is deliberately **not** extended to `/images/`. Those filenames carry no
hash, so a year-long immutable TTL would strand the current screenshots in every
browser that had already loaded them, and the hero images are due to be replaced.

## Rolling back

`scripts/deploy.sh` prints the exact command when it finishes, with the previous
commit already filled in. The shape of it:

```bash
cd /var/www/tablepro.app
git reset --hard <previous-commit>
composer install --no-dev -q && npm ci --silent && npm run build
php artisan optimize
supervisorctl restart tablepro-web-ssr
```

The previous bundles also survive one deploy at `public/build-old` and
`bootstrap/ssr-old`, so reverting only the front end is two `mv`s and an SSR
restart if the code is fine and the bundle is not.
