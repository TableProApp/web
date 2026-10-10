# How this app gets deployed

`main` deploys itself. A push that turns the tests workflow green triggers
`.github/workflows/deploy.yml`, which opens one SSH connection to the server as
`ubuntu`; the server runs `sudo -n -u www-data /var/www/tablepro.app/scripts/deploy.sh`
and nothing else.

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
`/newsletter/subscribe`, so it leaves this codebase entirely — which is why
nothing in this repository needs a database or a session.

nginx matches those prefixes at the root only. `/vi/account` or `/vi/checkout`
would come here, not to the platform, and answer 404: the public site never
links or posts to a prefixed platform path. The Vietnamese pages under `/vi`
are this app's, and need no nginx change.

`scripts/dev-proxy.mjs` reproduces this split on a developer machine
(docs/architecture.md, "Working on these forms locally").

A dozen other sites share the same host and the same PHP-FPM master, so a reload
is not free — but it is required, and this is the trap on this host:

```
/etc/php/8.5/cli/php.ini    opcache.validate_timestamps  On
/etc/php/8.5/fpm/php.ini    opcache.validate_timestamps  0
```

The host runs Ubuntu 26.04, whose archive ships PHP 8.5 only.

`php -i` reads the **CLI** ini and says `On`. FPM says `0`, which means it
compiles each file once and never looks at the file again. A deploy that changes
PHP or a Blade template and does not reload FPM leaves the previous release
serving traffic, indefinitely, while every other signal says the deploy
succeeded.

The only honest way to read the value is through FPM itself — a one-line script
under `public/`, fetched over HTTP, then deleted. Beware `opcache.file_update_protection`
(2 seconds by default) when probing: a file written and requested immediately is
never cached at all, so a naive probe reports that everything reloads fine.

`scripts/deploy.sh` therefore reloads `php<version>-fpm` (`php8.5-fpm` here)
whenever PHP changed, where `<version>` is the PHP CLI's own (`php -r 'echo
PHP_MAJOR_VERSION, ".", PHP_MINOR_VERSION;'`): the CLI runs Composer and artisan
for the same release, so the two have to agree anyway. Set `FPM_SERVICE` to name
another unit.

## It only does the work the diff calls for

The script compares the commit it started at with the one it pulled, and decides
from the changed paths:

| Changed | Consequence |
| --- | --- |
| `resources/js/`, `resources/css/`, `resources/data/` (page copy, legal text and data files, in every locale), `vite.config.*`, `package*.json`, `tsconfig.json` | `npm ci`, rebuild both bundles, swap, restart SSR |
| `composer.json`, `composer.lock` | `composer install` |
| `app/`, `config/`, `routes/`, `bootstrap/`, `resources/views/`, `lang/`, `resources/data/locales.json`, `composer.*` | rebuild caches, reload PHP-FPM |
| `resources/blog/` (including `resources/blog/vi/`), `resources/data/`, `routes/` | regenerate the sitemap |

`lang/` is in the third row because its files are PHP arrays that opcache holds
like any other PHP file. `resources/data/locales.json` is there because
`routes/web.php` mounts one route group per locale it lists, so adding a locale
must rebuild the route cache; the other data files are read per request. Note
that `scripts/deploy.sh` runs from the copy already on the server (see "The
deploy key"), so a change to these patterns takes effect one deploy late.

`resources/views/` earns its place in the third row the hard way. A Blade
template compiles to a PHP file named after its path, so editing one leaves the
compiled name unchanged and opcache keeps serving the previous compilation. The
first release deployed from this repository shipped a rewritten root template —
new theme colours, new font preloads — that reached nobody until FPM was
reloaded by hand.

A blog post is markdown that PHP reads at request time, so the diff alone does
not call for a build. A build happens anyway: `bundles_are_stale` rebuilds
whenever anything under `resources/` is newer than the built manifest, and a new
post is. Publishing a post therefore costs a `git pull`, a build and a sitemap.
That is the safe side of the trade, because a skipped rebuild never retries
itself. `FORCE=1` rebuilds everything, which is what you want after a deploy
that stopped halfway.

## Before a launch or after an app release

Three things are not part of a deploy and are checked by hand.

**Release facts.** The versions, dates, requirements and App Store price the
site states are data in `resources/data/platforms.json`, not a live lookup. Run,
on any machine with network access:

```bash
php artisan release:check
```

It compares GitHub `releases/latest`, the Sparkle appcast, the Homebrew cask and
the App Store listing with that file, prints one row per fact and exits non-zero
on any drift or on a source it cannot read. Fix a drift in `platforms.json` and
deploy that commit. When Homebrew serves the current Mac release, bump
`mac.floorVersion` there: that removes the "0.77"-style labels.
The suite never runs this command, because tests do not touch the network.

**Social cards.** `public/og/` is committed, never generated on the server. After
a content change that alters a page's `og` block, run the `og cards` workflow
(or `php artisan og:generate --type=… --locale=…` locally, with Chromium) and
deploy the commit it makes.

**Server environment.** `APP_ENV` must be `production`: any other value shows
visitors the placeholder of every image slot that has no file yet.
`PAYMENT_PROVIDER` must match the platform app's setting,
because the plan cards open the overlay of whichever provider's URL
`POST /checkout` returns. This app does not read `TEAM_MIN_SEATS`: the minimum
seat count it shows comes from `resources/data/pricing.json`, synced by hand
with the platform, which enforces its own value.

The generated asset files (`docs/visual-assets.md` and
`resources/js/lib/data/asset-slots.json`) need no step here: CI fails when
either is stale (`php artisan assets:handoff --check`), so a green `main` has
current ones.

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

Just before the rename, the previous release's hashed files are copied into
the new build, so a page that still names them keeps loading: a page cached at
the edge before the purge, a stale copy Cloudflare serves while it revalidates,
or a tab left open. Every file the outgoing `manifest.json` names retires at
that moment and its mtime is set to now; a file an earlier deploy carried keeps
the moment it retired and is dropped once that is more than
`ASSET_RETENTION_HOURS` (default 72) ago. Hashed names never collide, so this
costs only disk.

After the rename, any failure puts the previous bundles back from
`public/build-old` and `bootstrap/ssr-old` and restarts SSR. The code stays at
the new commit; the script prints the command to revert that too rather than
guessing that you want it.

The only moment the two halves disagree is between the swap and the SSR restart
a second later, when new assets are served alongside the old SSR bundle.

## Deploying by hand

Root cannot log in over SSH. Log in as `ubuntu` with your own key (not the
deploy key, which cannot open a shell) and run the script as `www-data`,
exactly as the forced command does:

```bash
ssh -p <port> ubuntu@<host>
sudo -u www-data /var/www/tablepro.app/scripts/deploy.sh
sudo -u www-data FORCE=1 /var/www/tablepro.app/scripts/deploy.sh
```

It reads `APP_PATH`, `BRANCH`, `WEB_USER`, `SUPERVISOR_PROGRAM`, `SMOKE_URL`,
`FORCE`, `FPM_SERVICE` and `DEPLOY_CACHE_DIR` from the environment if you need
to point it somewhere else. `sudo` drops the caller's environment, so give them
on the `sudo` command line, as `FORCE=1` above. It refuses to run if the
server's working tree is dirty, because merging over someone's live edit is how
that edit disappears.

It does not depend on where or how it was started. It works from an absolute
`APP_PATH` (and refuses a relative one) and adds the standard directories to
`PATH`. Then, as `www-data`:

- git, Composer, npm, Vite and artisan all run as `www-data`. It owns the
  checkout, so git needs no `safe.directory` and nothing needs handing back.
- Composer's and npm's caches, and `HOME`, live under `DEPLOY_CACHE_DIR`
  (`/var/cache/tablepro-deploy`), because `www-data`'s home, `/var/www`, is not
  writable. The script stops before touching git if that directory is missing
  or not writable, or if any file in the checkout belongs to another user.
- It reaches root for exactly two commands, through `sudo -n`:
  `/usr/bin/supervisorctl restart tablepro-web-ssr` after swapping the bundles,
  and `/usr/bin/systemctl reload php8.5-fpm` after a PHP change. If sudo refuses
  either, the deploy fails and says which, and swapped bundles are put back.

Run as root (from `sudo -i`), it still works the way it always did: `HOME` from
the password database, `APP_PATH` trusted for git in command scope (git refuses
a checkout another user owns, "dubious ownership"), the two commands run
directly, and the whole checkout handed back to `www-data` at the end. Prefer
`sudo -u www-data`: a root run that stops halfway leaves root-owned files
behind, and the next deploy refuses to start until someone runs
`sudo chown -R www-data:www-data /var/www/tablepro.app`.

It finishes by fetching `APP_URL` and checking two things: that the answer is
200, and that the HTML contains a server-rendered `<h1>`. The second check is
the one that matters — SSR falling over still returns 200, just with an empty
shell.

### If it refuses over `build-old` or `ssr-old`

```
?? bootstrap/ssr-old/
?? public/build-old/
error: working tree is not clean — refusing to deploy over local changes
```

A deploy keeps the bundles it replaced at `public/build-old` and
`bootstrap/ssr-old` so the `EXIT` trap can put them back. Those paths were not
ignored at first, so the first successful deploy left them in the tree and every
deploy after it stopped here.

The script skips its own scratch directories now, but a server that has not yet
pulled that change cannot get past the check to reach it — the cleanliness test
runs before `git pull`, and the pinned SSH command runs **the copy of
`scripts/deploy.sh` that is already on the server**. Break the loop once, by
hand:

```bash
sudo rm -rf /var/www/tablepro.app/public/build-old /var/www/tablepro.app/bootstrap/ssr-old
```

Then re-run the workflow. Nothing else needs doing: those directories are the
previous release's bundles, and the live ones are `public/build` and
`bootstrap/ssr`. Deleting them costs only the ability to roll back to the
release before last, which `git` can rebuild anyway.

## The SSR process

Supervisor owns it:

```
/etc/supervisor/conf.d/tablepro-web-ssr.conf   →  tablepro-web-ssr
```

Do not confuse it with `tablepro-inertia-ssr`, which belongs to the platform app.
Both exist, both run `inertia:start-ssr`, and restarting the wrong one restarts
someone else's site.

```bash
sudo supervisorctl status tablepro-web-ssr
sudo supervisorctl restart tablepro-web-ssr
sudo tail -f /var/log/supervisor/tablepro-web-ssr.log
```

`Error: Page not found: auth/login` in that log is a scanner, not a bug. This
app has no such page.

It listens on `127.0.0.1` only (`resources/js/ssr.tsx`; `INERTIA_SSR_HOST`
overrides it). Inertia's default is every interface, and the server answers
`/render` and `/shutdown` to anyone who reaches the port, so without a firewall
in front of it anyone could stop it. Check with
`sudo ss -ltnp | grep 13715`: the local address must be `127.0.0.1:13715`.

## The scheduler

Three jobs run on the server's schedule (`routes/console.php`): `release:refresh`
every 15 minutes, which fetches the current Mac release from GitHub (or the
Sparkle appcast) for the download buttons, `stars:refresh` hourly, which
fetches the star count the header shows into
`storage/app/private/github/stars.json`, and `sitemap:generate` daily.

A page never calls GitHub: `/download` reads what the last refresh stored, so
no reader waits on a slow or failing API. If the stored copy is missing (after
the deploy's `cache:clear`, or if the scheduler has stopped), the page serves
the last good copy from `storage/app/private/releases/mac-last-good.json` and
asks for one refresh after its response has gone out. That keeps the page
current without the scheduler, but the scheduler is what keeps every reader off
the refresh path, so it must run.

It needs one cron entry, as `www-data`, in `/etc/cron.d/tablepro-web`:

```
* * * * * www-data cd /var/www/tablepro.app && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

Check it with `sudo -u www-data php artisan schedule:list`, and that
`sudo -u www-data php artisan release:refresh` prints the current version.
Run `sudo -u www-data php artisan stars:refresh` once after the first deploy
of the star count, or the header reads "GitHub" until the next full hour.

## The deploy key

The workflow authenticates with a key that **cannot open a shell**. Its entry in
the server's `authorized_keys` pins it to one command, so the worst a leaked
copy can do is deploy `main` — which is its job.

Create it:

```bash
ssh-keygen -t ed25519 -N '' -C 'tablepro-web-deploy' -f ./deploy_key
```

Root SSH login is disabled, so the key belongs to `ubuntu`, and the forced
command runs the script as `www-data`, the user that owns the checkout. Install
the public half in `/home/ubuntu/.ssh/authorized_keys`, on one line:

```
command="sudo -n -u www-data /var/www/tablepro.app/scripts/deploy.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA... tablepro-web-deploy
```

`sudo -n` never prompts: with no rule letting `ubuntu` run the script as
`www-data` without a password it fails at once, and the workflow goes red,
rather than hanging on a prompt nobody can answer. Ubuntu's cloud images
normally give `ubuntu` `NOPASSWD:ALL` in `/etc/sudoers.d/90-cloud-init-users`;
check that it is there. If that is ever narrowed, keep at least:

```
ubuntu ALL=(www-data) NOPASSWD: /var/www/tablepro.app/scripts/deploy.sh
```

Note that `command=` names the copy of the script already on disk, so a change
to `deploy.sh` takes effect on the deploy *after* the one that ships it.

Then set five repository secrets (two more, for the cache purge, are under
"Caching"):

| Secret | Value |
| --- | --- |
| `DEPLOY_SSH_KEY` | contents of the private `deploy_key` |
| `DEPLOY_KNOWN_HOSTS` | `ssh-keyscan -p <port> <host>` output, pinned |
| `DEPLOY_HOST` | server address |
| `DEPLOY_PORT` | SSH port |
| `DEPLOY_USER` | `ubuntu`, the user the `authorized_keys` entry belongs to |

Moving to a new host means new `DEPLOY_HOST`, `DEPLOY_PORT` and
`DEPLOY_KNOWN_HOSTS` values too; `deploy.yml` itself does not change.

`DEPLOY_KNOWN_HOSTS` is pinned rather than discovered at run time because
`ssh-keyscan` trusts whatever answers it, which would accept an impostor on the
first connection and make checking pointless.

Revoke by deleting that line from `/home/ubuntu/.ssh/authorized_keys`.
Deleting the GitHub secret alone leaves a working key in circulation.

### Why it runs as `www-data`, not root

The checkout, this script included, is writable by `www-data`, and PHP-FPM
serves every request as `www-data`. When the deploy ran as root, anything that
could write one file as that user could rewrite `deploy.sh` and have the next
deploy run it as root. Now the deploy runs as `www-data` throughout, and the
root it can reach is two fixed commands that at worst reload PHP-FPM or restart
an SSR process.

### What the server needs for it

A sudoers drop-in, `/etc/sudoers.d/tablepro-deploy`, owned by root, mode `0440`,
holding exactly:

```
www-data ALL=(root) NOPASSWD: /usr/bin/systemctl reload php8.5-fpm, /usr/bin/supervisorctl restart tablepro-web-ssr, /usr/bin/supervisorctl restart tablepro-inertia-ssr
```

sudo matches each command line literally — path, verb and unit — and
`scripts/deploy.sh` runs exactly the first two (`tests/Feature/DeployScriptTest.php`
checks its calls against the rule above). The third restarts the platform app's
SSR program (see "The SSR process"). A PHP upgrade renames the FPM unit, and
this rule has to follow it; a deploy prints the unit it reloads.

Install it through `visudo -c`, so a typo cannot break sudo for everyone:

```bash
echo 'www-data ALL=(root) NOPASSWD: /usr/bin/systemctl reload php8.5-fpm, /usr/bin/supervisorctl restart tablepro-web-ssr, /usr/bin/supervisorctl restart tablepro-inertia-ssr' > /tmp/tablepro-deploy
sudo visudo -cf /tmp/tablepro-deploy && sudo install -o root -g root -m 0440 /tmp/tablepro-deploy /etc/sudoers.d/tablepro-deploy
rm /tmp/tablepro-deploy
```

And the cache directory, owned by `www-data`:

```bash
sudo install -d -o www-data -g www-data -m 0750 /var/cache/tablepro-deploy
```

Check both as `www-data`; the first lists the three commands without asking
for a password:

```bash
sudo -u www-data sudo -n -l
sudo -u www-data test -w /var/cache/tablepro-deploy && echo writable
```

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

The Cloudflare token is the other secret here. It can only purge the zone's
cache, it is used on the runner, and it is never sent to the server.

## Caching

### Pages

Every page is the same for every reader: the locale is in the path, and there
is no session, cookie, CSRF token or anything read from the reader's headers or
location. So the HTML may sit in Cloudflare's cache. `CacheHtmlAtEdge` (on the
`web` group, and applied by `RenderErrorPage` to the error pages) sends

```
Cache-Control: public, max-age=0, s-maxage=600, stale-while-revalidate=3600
Vary: X-Inertia
```

on every `GET` or `HEAD` that is not an Inertia visit and answers HTML with a
200, 404 or 410, as long as it sets no cookie. Browsers still revalidate every
time (`max-age=0`); the edge may answer for ten minutes and serve the previous
copy while it fetches the next. Inertia visits (JSON at the same URL), redirects
and 5xx responses keep Laravel's own headers.

Nothing is cached until a **Cache Rule** says so, because Cloudflare does not
cache HTML by default. Cloudflare also ignores `Vary`, so the rule must keep
Inertia visits away from the cache, or a cached page would be handed to the
JSON request at the same URL, or the reverse. In the dashboard, Caching → Cache
Rules, for the tablepro.app zone, in this order:

1. **Bypass Inertia visits.** Expression:

   ```
   (http.host eq "tablepro.app" and any(lower(http.request.headers.names[*])[*] eq "x-inertia"))
   ```

   Cache eligibility: *Bypass cache*.

2. **Cache the public site.** Expression:

   ```
   (http.host eq "tablepro.app"
    and not any(lower(http.request.headers.names[*])[*] eq "x-inertia")
    and not starts_with(http.request.uri.path, "/account")
    and not starts_with(http.request.uri.path, "/checkout")
    and not starts_with(http.request.uri.path, "/webhooks")
    and not starts_with(http.request.uri.path, "/newsletter")
    and not starts_with(http.request.uri.path, "/beta")
    and not starts_with(http.request.uri.path, "/discount")
    and not starts_with(http.request.uri.path, "/thank-you")
    and not starts_with(http.request.uri.path, "/api/newsletter")
    and not starts_with(http.request.uri.path, "/platform-build")
    and http.request.uri.path ne "/up")
   ```

   Cache eligibility: *Eligible for cache*. Edge TTL: *Use cache-control header
   if present, use default Cloudflare caching behavior if not*. Browser TTL:
   *Respect origin*. Leave the cache key alone: the query string stays in it,
   so `?ref=` links keep their own copy and the page's own URL.

The platform paths are the ones nginx sends to the account app (the same list
as `LocalizedUrl::PLATFORM_PATHS`); they hold sessions and must never be
shared. `starts_with` is used rather than a regular expression because regex
matching in rules needs a Business plan.

**After a deploy**, `.github/workflows/deploy.yml` purges the zone from the
runner, once `scripts/deploy.sh` has succeeded. It needs two repository
secrets; without them it prints a notice and skips, so deploys work before they
exist:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_ZONE_ID` | the tablepro.app zone's ID (zone Overview, API section) |
| `CLOUDFLARE_CACHE_PURGE_TOKEN` | an API token with only *Zone → Cache Purge → Purge*, for that zone |

It purges everything (`purge_everything`), which every plan allows, so the
other hosts in the zone lose their cached copies too and refetch them. A failed
purge turns the run red but leaves the release live: pages catch up within ten
minutes, and the previous assets are still on disk for anything cached before.

The deploy's own smoke test goes through Cloudflare with a query string no
reader sends (`?deploy-smoke=<time>`), so it never reads a page cached before
the release it is checking.

### Assets

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
commit already filled in. Run it from a root shell (`sudo -i`). The shape of it:

```bash
cd /var/www/tablepro.app
git reset --hard <previous-commit>
composer install --no-dev -q && npm ci --silent && npm run build
php artisan optimize
chown -R www-data:www-data /var/www/tablepro.app
systemctl reload php8.5-fpm
supervisorctl restart tablepro-web-ssr
```

The `chown` is not optional: everything a root shell writes belongs to root,
and the next deploy, running as `www-data`, refuses a checkout holding files it
does not own. The FPM reload is what makes PHP-FPM serve the older PHP at all
(see "The server is shared").

git run as root does not get the script's `safe.directory`, and refuses the
`www-data`-owned checkout. Trust it once per host, system-wide:

```bash
sudo git config --system --add safe.directory /var/www/tablepro.app
```

The previous bundles also survive one deploy at `public/build-old` and
`bootstrap/ssr-old`, so reverting only the front end is two `mv`s and an SSR
restart if the code is fine and the bundle is not.
