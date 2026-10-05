<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

/**
 * scripts/deploy.sh decides what work a release needs by matching the changed
 * paths against four patterns. Getting one of those patterns wrong does not
 * fail the deploy — it produces a deploy that reports success while skipping a
 * step, which is how a rewritten root template once reached production and was
 * served to nobody.
 *
 * These tests read the patterns straight out of the script and check them
 * against representative paths, so the classification cannot drift from what
 * the script actually runs.
 */

/**
 * Pulls the extended regular expression the script tests before setting a flag.
 *
 * @param  string  $flag  the shell variable assigned on the following line, e.g. PHP_CHANGED
 */
function deployPattern(string $flag): string
{
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)->not->toBeFalse();

    $matched = preg_match(
        "/^if changed '(?P<pattern>.+)'; then\n\s+{$flag}=true$/m",
        (string) $script,
        $matches,
    );

    expect($matched)->toBe(1, "scripts/deploy.sh has no `changed` test setting {$flag}");

    return $matches['pattern'];
}

/**
 * The script pipes the file list through `grep -qE`, so the pattern is an ERE.
 * Every construct used in these four — anchors, alternation, groups, escaped
 * dots, `?` and `$` — means the same thing in PCRE, so matching here matches
 * there.
 */
function deployMatches(string $flag, string $path): bool
{
    return preg_match('#' . deployPattern($flag) . '#', $path) === 1;
}

/**
 * Runs the script's own `changed` function, under the script's shell options,
 * against a list of changed paths, and reports whether it matched.
 */
function runChanged(string $paths, string $pattern): bool
{
    $matched = preg_match('/^changed\(\) \{.*\}$/m', (string) file_get_contents(base_path('scripts/deploy.sh')), $definition);

    expect($matched)->toBe(1, 'scripts/deploy.sh has no one-line changed() function');

    /*
     * The list goes in on stdin: Linux caps a single environment string at
     * 128 KB, and the list has to be larger than a pipe buffer to mean anything.
     */
    $process = new Process(
        ['bash', '-c', "set -euo pipefail\nCHANGED_FILES=\"\$(cat)\"\n{$definition[0]}\nchanged \"\$PATTERN\""],
        null,
        ['PATTERN' => $pattern],
        $paths,
    );
    $process->run();

    return $process->getExitCode() === 0;
}

/**
 * Stand-ins for every tool scripts/deploy.sh would use to reach the system or
 * the network. Each records how it was called in $STUB_CALLS; composer and npm
 * also record, in $STUB_ENV, where they would keep their caches. `identity`
 * holds `id` and `getent`, put on PATH only by a run that pretends to be
 * another user.
 *
 * Written once per run of the suite and parameterised through the environment,
 * because macOS checks every new executable the first time it runs, and stubs
 * written afresh for each test cost about two seconds a test.
 *
 * @return array{tools: string, identity: string}
 */
function deployStubs(): array
{
    static $stubs = null;

    if ($stubs !== null) {
        return $stubs;
    }

    $root = sys_get_temp_dir() . '/tablepro-deploy-stubs-' . bin2hex(random_bytes(6));
    $record = fn(string $name): string => "#!/usr/bin/env bash\nprintf '%s\\n' \"{$name} \$*\" >> \"\$STUB_CALLS\"\n";

    $scripts = [
        'tools/systemctl' => $record('systemctl'),
        'tools/supervisorctl' => $record('supervisorctl'),
        'tools/chown' => $record('chown'),
        'tools/sudo' => $record('sudo') . "if [ -n \"\${STUB_SUDO_REFUSES:-}\" ]; then\n    echo 'sudo: a password is required' >&2\n    exit 1\nfi\n",
        'tools/composer' => $record('composer') . "printf 'composer HOME=%s COMPOSER_HOME=%s COMPOSER_CACHE_DIR=%s\\n' \"\$HOME\" \"\${COMPOSER_HOME:-}\" \"\${COMPOSER_CACHE_DIR:-}\" >> \"\$STUB_ENV\"\n",
        'tools/npm' => $record('npm') . "printf 'npm HOME=%s npm_config_cache=%s\\n' \"\$HOME\" \"\${npm_config_cache:-}\" >> \"\$STUB_ENV\"\n",
        // `npx vite build [--ssr] --outDir <dir>`: leave what a good build leaves.
        'tools/npx' => $record('npx') . <<<'BASH'
            out=""; ssr=false
            while [ $# -gt 0 ]; do
                case "$1" in
                    --outDir) out="$2"; shift 2 ;;
                    --ssr) ssr=true; shift ;;
                    *) shift ;;
                esac
            done
            mkdir -p "$out"
            if [ "$ssr" = true ]; then
                echo 'export {};' > "$out/ssr.js"
            else
                printf '{"resources/js/app.tsx":{"file":"assets/app-new.js"}}' > "$out/manifest.json"
            fi

            BASH,
        // The script reads the PHP version with `php -r`; that is the real PHP.
        'tools/php' => "#!/usr/bin/env bash\nif [ \"\$1\" = -r ]; then\n    exec '" . PHP_BINARY . "' \"\$@\"\nfi\n" . substr($record('php'), strlen("#!/usr/bin/env bash\n")),
        'identity/id' => "#!/usr/bin/env bash\ncase \"\$*\" in\n    -u) echo \"\$STUB_UID\" ;;\n    -un|-gn) echo \"\$STUB_USER\" ;;\n    *) exec /usr/bin/id \"\$@\" ;;\nesac\n",
        'identity/getent' => "#!/usr/bin/env bash\necho \"\$STUB_USER:x:\$STUB_UID:\$STUB_UID::\$STUB_HOME:/bin/bash\"\n",
    ];

    foreach ($scripts as $path => $body) {
        File::ensureDirectoryExists(dirname("{$root}/{$path}"));
        file_put_contents("{$root}/{$path}", $body);
        chmod("{$root}/{$path}", 0755);
    }

    register_shutdown_function(fn() => (new Illuminate\Filesystem\Filesystem())->deleteDirectory($root));

    return $stubs = ['tools' => "{$root}/tools", 'identity' => "{$root}/identity"];
}

/**
 * Runs the real scripts/deploy.sh end to end against a throwaway checkout, from
 * `/` and under `env -i`, as the forced command starts it, with deployStubs()
 * first on PATH.
 *
 * `origin` is one commit ahead of the checkout, changing a component, a PHP file
 * and composer.lock, so a single run takes both steps that need root: the SSR
 * restart after the bundle swap, and the PHP-FPM reload.
 *
 * @param  array{root?: bool, owner?: int, sudoRefuses?: bool, cacheDir?: string, env?: array<string, string>}  $options
 * @return array{exit: int, output: string, errors: string, calls: list<string>, privileged: list<string>, env: list<string>, sandbox: string, app: string, cache: string}
 */
function runDeployInSandbox(array $options = []): array
{
    $sandbox = sys_get_temp_dir() . '/tablepro-deploy-' . bin2hex(random_bytes(6));
    $seed = "{$sandbox}/seed";
    $origin = "{$sandbox}/origin.git";
    $app = "{$sandbox}/app";
    $cache = "{$sandbox}/cache";
    $calls = "{$sandbox}/calls.log";
    $envLog = "{$sandbox}/env.log";
    $stubs = deployStubs();

    foreach ([$seed . '/app', $seed . '/resources/js', $cache] as $directory) {
        mkdir($directory, 0755, true);
    }

    // www-data's home, /var/www, which it cannot write.
    mkdir("{$sandbox}/home", 0555);

    $git = function (string $cwd, string ...$arguments): void {
        (new Process(['git', '-c', 'user.name=Deploy Test', '-c', 'user.email=deploy@example.test', '-c', 'commit.gpgsign=false', ...$arguments], $cwd))->mustRun();
    };

    file_put_contents("{$seed}/artisan", "<?php\n");
    file_put_contents("{$seed}/composer.lock", "{}\n");
    file_put_contents("{$seed}/app/Example.php", "<?php\n");
    file_put_contents("{$seed}/resources/js/app.tsx", "export {};\n");
    file_put_contents("{$seed}/.gitignore", implode("\n", ['/public/build', '/public/build-next', '/public/build-old', '/bootstrap/ssr', '/bootstrap/ssr-next', '/bootstrap/ssr-old']) . "\n");

    $git($seed, 'init', '-q', '-b', 'main');
    $git($seed, 'add', '-A');
    $git($seed, 'commit', '-q', '-m', 'A');
    $git($sandbox, 'clone', '-q', '--bare', $seed, $origin);
    $git($sandbox, 'clone', '-q', $origin, $app);

    file_put_contents("{$seed}/composer.lock", "{\"changed\": true}\n");
    file_put_contents("{$seed}/app/Example.php", "\n// changed\n", FILE_APPEND);
    file_put_contents("{$seed}/resources/js/app.tsx", "// changed\n", FILE_APPEND);
    $git($seed, 'commit', '-q', '-am', 'B');
    $git($seed, 'push', '-q', $origin, 'main');

    // The live bundles a failed deploy has to put back.
    foreach (["{$app}/public/build", "{$app}/bootstrap/ssr"] as $live) {
        mkdir($live, 0755, true);
        file_put_contents("{$live}/PREVIOUS", "previous release\n");
    }

    $path = "{$stubs['tools']}:" . dirname(PHP_BINARY) . ':/usr/bin:/bin';
    $environment = [
        'HOME' => "{$sandbox}/home",
        'APP_PATH' => $app,
        'DEPLOY_CACHE_DIR' => $options['cacheDir'] ?? $cache,
        'STUB_CALLS' => $calls,
        'STUB_ENV' => $envLog,
    ];

    if ($options['sudoRefuses'] ?? false) {
        $environment['STUB_SUDO_REFUSES'] = '1';
    }

    if (($options['root'] ?? false) || isset($options['owner'])) {
        $uid = ($options['root'] ?? false) ? 0 : $options['owner'];

        mkdir("{$sandbox}/root-home");
        $path = "{$stubs['identity']}:{$path}";
        $environment += ['STUB_UID' => (string) $uid, 'STUB_USER' => $uid === 0 ? 'root' : 'www-data', 'STUB_HOME' => "{$sandbox}/root-home"];
    }

    $command = ['/usr/bin/env', '-i', "PATH={$path}"];

    foreach ([...$environment, ...($options['env'] ?? [])] as $key => $value) {
        $command[] = "{$key}={$value}";
    }

    $process = new Process([...$command, 'bash', base_path('scripts/deploy.sh')], '/');
    $process->setTimeout(60);
    $process->run();

    $lines = fn(string $file): array => is_file($file) ? array_values(array_filter(explode("\n", (string) file_get_contents($file)))) : [];
    $recorded = $lines($calls);

    return [
        'exit' => (int) $process->getExitCode(),
        'output' => $process->getOutput(),
        'errors' => $process->getErrorOutput(),
        'calls' => $recorded,
        'privileged' => array_values(array_filter($recorded, fn(string $call): bool => preg_match('/^(sudo|systemctl|supervisorctl|chown) /', $call) === 1)),
        'env' => $lines($envLog),
        'sandbox' => $sandbox,
        'app' => $app,
        'cache' => $environment['DEPLOY_CACHE_DIR'],
    ];
}

/**
 * The FPM unit the script derives from the CLI that runs it: the PHP running
 * this suite, since the sandbox's `php -r` is the real one.
 */
function expectedFpmService(): string
{
    return 'php' . PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '-fpm';
}

/**
 * The commands the server's sudoers drop-in lets www-data run, as documented.
 *
 * @return list<string>
 */
function documentedSudoersCommands(): array
{
    $matched = preg_match('/^www-data ALL=\(root\) NOPASSWD: (.+)$/m', (string) file_get_contents(base_path('docs/deployment.md')), $rule);

    expect($matched)->toBe(1, 'docs/deployment.md does not spell out the www-data sudoers rule');

    return explode(', ', $rule[1]);
}

/**
 * Whether the suite itself runs as root, where the script would take its root
 * path whatever the test meant to exercise.
 */
function suiteRunsAsRoot(): bool
{
    return function_exists('posix_geteuid') && posix_geteuid() === 0;
}

it('rebuilds the bundles for a component, a stylesheet or a dependency', function (string $path) {
    expect(deployMatches('FRONTEND_CHANGED', $path))->toBeTrue();
})->with([
    'resources/js/pages/Home.tsx',
    'resources/js/components/ui/button.tsx',
    'resources/js/i18n/messages/vi/nav.ts',
    'resources/css/app.css',
    'resources/css/tokens.css',
    'vite.config.js',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    // Page copy and legal text are read by PHP, but the pages are typed
    // against them and data files under resources/data are bundled.
    'resources/data/content/vi/home.json',
    'resources/data/legal/vi/privacy.md',
    'resources/data/locales.json',
]);

it('does not rebuild the bundles for prose, templates, translations or PHP', function (string $path) {
    expect(deployMatches('FRONTEND_CHANGED', $path))->toBeFalse();
})->with([
    'resources/blog/mcp-database-claude.md',
    'resources/blog/vi/mcp-database-claude.md',
    'resources/views/app.blade.php',
    'resources/views/partials/head-theme.blade.php',
    'app/Http/Controllers/LandingController.php',
    'lang/vi/og.php',
    'lang/en/errors.php',
    'docs/deployment.md',
]);

it('rebuilds the bundles for every data file the front end imports', function (): void {
    /*
     * `resources/data/*.json` reads like content and is not. Vite inlines each
     * of these into the bundle at build time, so editing one without rebuilding
     * leaves the previous copy being served — which is exactly what happened:
     * corrected prices and database counts merged, deployed green, and never
     * reached the site, because the deploy classified the change as content.
     *
     * Derived from the imports rather than hardcoded, so a new data file cannot
     * be added to the bundle and quietly miss the rebuild.
     */
    $imported = [];

    /*
     * Recursive, both ways. PHP's glob() reads `**` as `*`, so the first version
     * of this scan looked one directory deep and never saw a component; and the
     * import pattern has to accept the `@data/` alias and nested paths such as
     * `content/en/home.json`.
     */
    $sources = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(base_path('resources/js'), FilesystemIterator::SKIP_DOTS));

    foreach ($sources as $file) {
        if (! in_array($file->getExtension(), ['ts', 'tsx'], true)) {
            continue;
        }

        preg_match_all("#(?:from|import\\() ?'(?:@data/|[^']*/data/)([a-z0-9/-]+\.json)'#i", file_get_contents($file->getPathname()), $found);
        $imported = array_merge($imported, $found[1]);
    }

    $imported = array_values(array_unique($imported));

    expect($imported)->not->toBeEmpty('Expected the front end to import at least one data file');
    expect($imported)->toContain('locales.json');

    foreach ($imported as $json) {
        expect(deployMatches('FRONTEND_CHANGED', "resources/data/{$json}"))->toBeTrue(
            "resources/data/{$json} is bundled but does not trigger a front-end rebuild",
        );
    }

    // And every file in that tree, so an unimported one still rebuilds rather
    // than depending on someone noticing it became bundled.
    $data = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(resource_path('data'), FilesystemIterator::SKIP_DOTS));

    foreach ($data as $file) {
        $relative = 'resources/data/' . substr($file->getPathname(), strlen(resource_path('data')) + 1);

        expect(deployMatches('FRONTEND_CHANGED', $relative))->toBeTrue("{$relative} does not trigger a front-end rebuild");
    }
});

it('downloads dependencies only when the lock file moves', function () {
    expect(deployMatches('COMPOSER_CHANGED', 'composer.lock'))->toBeTrue();
    expect(deployMatches('COMPOSER_CHANGED', 'composer.json'))->toBeTrue();

    expect(deployMatches('COMPOSER_CHANGED', 'app/Http/Controllers/LandingController.php'))->toBeFalse();
    expect(deployMatches('COMPOSER_CHANGED', 'resources/views/app.blade.php'))->toBeFalse();
});

/*
 * The regression this file exists for. A Blade template compiles to a PHP file
 * named after its path, so editing one leaves the compiled name unchanged and
 * opcache — which this host runs with validate_timestamps=0 — goes on serving
 * the previous compilation until FPM is reloaded.
 */
it('treats a Blade template as PHP, so the caches drop and FPM reloads', function (string $path) {
    expect(deployMatches('PHP_CHANGED', $path))->toBeTrue();
})->with([
    'resources/views/app.blade.php',
    'resources/views/og/blog.blade.php',
    'resources/views/partials/head-theme.blade.php',
    'resources/views/errors/503.blade.php',
    'app/Http/Controllers/LandingController.php',
    'config/inertia.php',
    'routes/web.php',
    'routes/localized.php',
    'bootstrap/app.php',
    'composer.lock',
    /*
     * lang/ files are PHP arrays held by opcache like any other PHP file, and
     * locales.json decides which route groups routes/web.php mounts, so a new
     * locale has to rebuild the route cache.
     */
    'lang/vi/og.php',
    'lang/en/errors.php',
    'resources/data/locales.json',
]);

it('leaves PHP alone for a page component, a blog post or page copy', function (string $path) {
    expect(deployMatches('PHP_CHANGED', $path))->toBeFalse();
})->with([
    'resources/js/pages/Home.tsx',
    'resources/css/app.css',
    'resources/blog/mcp-database-claude.md',
    'resources/blog/vi/mcp-database-claude.md',
    'resources/data/content/vi/home.json',
    'resources/data/engines.json',
    'package.json',
]);

it('regenerates the sitemap when the pages it enumerates change', function (string $path) {
    expect(deployMatches('CONTENT_CHANGED', $path))->toBeTrue();
})->with([
    'resources/blog/mcp-database-claude.md',
    'resources/blog/vi/mcp-database-claude.md',
    'resources/data/databases.json',
    'resources/data/comparisons.json',
    'resources/data/content/vi/home.json',
    'resources/data/legal/vi/privacy.md',
    'resources/data/locales.json',
    'routes/web.php',
    'routes/localized.php',
]);

it('names an FPM service to reload, because this host does not revalidate', function () {
    $script = (string) file_get_contents(base_path('scripts/deploy.sh'));

    // Either a fixed `php8.x-fpm`, or the FPM of the CLI's own PHP version.
    expect($script)->toMatch('/^FPM_SERVICE="\$\{FPM_SERVICE:-php(?:[0-9.]+|\$\{PHP_MINOR\})-fpm\}"$/m');
});

it('reloads the FPM of the PHP version that ran the release, not a hard-coded one', function (): void {
    /*
     * The default used to be php8.4-fpm. Ubuntu 26.04 ships PHP 8.5 only, so
     * there `systemctl reload php8.4-fpm` fails after the bundles are swapped,
     * and the EXIT trap rolls a good release back. The CLI runs composer and
     * artisan for the same release, so its version names the right unit
     * whichever PHP the host runs.
     */
    $script = (string) file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)
        ->toContain('PHP_MINOR="$(php -r \'echo PHP_MAJOR_VERSION, ".", PHP_MINOR_VERSION;\')"')
        ->toContain('FPM_SERVICE="${FPM_SERVICE:-php${PHP_MINOR}-fpm}"')
        ->not->toMatch('/FPM_SERVICE:-php8\.[0-9]-fpm/');

    // And the expression really yields the `8.x` the unit names carry.
    $process = new Process(['php', '-r', 'echo PHP_MAJOR_VERSION, ".", PHP_MINOR_VERSION;']);
    $process->mustRun();

    expect($process->getOutput())->toBe(PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION);
});

it('refuses a relative APP_PATH before it touches anything', function (): void {
    /*
     * Every relative path in the script hangs off the `cd "$APP_PATH"`, so a
     * relative APP_PATH would make the deploy depend on the caller's
     * directory. The check runs before git, composer or npm is called, so
     * running the real script here is safe.
     */
    $process = new Process(['bash', base_path('scripts/deploy.sh')], sys_get_temp_dir(), ['APP_PATH' => 'var/www/tablepro.app']);
    $process->run();

    expect($process->getExitCode())->toBe(1)
        ->and($process->getErrorOutput())->toContain('APP_PATH must be an absolute path');
});

/*
 * The deploy key logs in as `ubuntu`, and its forced command runs the script as
 * www-data: `sudo -n -u www-data .../deploy.sh`. It used to run as root, from a
 * tree www-data can write, so anything that could write as www-data — which
 * PHP-FPM serves every request as — could edit the script and have the next
 * deploy run it as root. Now everything runs as www-data except two commands,
 * which go through `sudo -n` exactly as the sudoers drop-in names them.
 */
describe('run as www-data, by the deploy key', function (): void {
    beforeEach(function (): void {
        if (suiteRunsAsRoot()) {
            $this->markTestSkipped('The suite runs as root, so the script takes its root path.');
        }
    });

    afterEach(function (): void {
        if (isset($this->run)) {
            File::deleteDirectory($this->run['sandbox']);
        }
    });

    it('reaches root only through sudo -n, with the exact commands the sudoers rule names', function (): void {
        $this->run = runDeployInSandbox();

        expect($this->run['exit'])->toBe(0, $this->run['errors'])
            ->and($this->run['privileged'])->toBe([
                'sudo -n /usr/bin/supervisorctl restart tablepro-web-ssr',
                'sudo -n /usr/bin/systemctl reload ' . expectedFpmService(),
            ]);
    });

    it('asks sudo for nothing the documented sudoers drop-in does not allow', function (): void {
        /*
         * sudo matches the command line literally, so a script that called
         * `systemctl restart`, or systemctl by another path, would be refused
         * on the server while every test here still passed. The rule on the
         * server is the one docs/deployment.md spells out; production's unit
         * is php8.5-fpm.
         */
        $this->run = runDeployInSandbox(['env' => ['FPM_SERVICE' => 'php8.5-fpm']]);

        expect($this->run['exit'])->toBe(0, $this->run['errors'])
            ->and($this->run['privileged'])->not->toBeEmpty();

        foreach ($this->run['privileged'] as $call) {
            expect($call)->toStartWith('sudo -n /');
            expect(documentedSudoersCommands())->toContain(substr($call, strlen('sudo -n ')));
        }
    });

    it('leaves ownership alone, because it already owns what it wrote', function (): void {
        $this->run = runDeployInSandbox();

        expect($this->run['exit'])->toBe(0, $this->run['errors'])
            ->and(preg_grep('/^chown /', $this->run['calls']))->toBeEmpty()
            ->and($this->run['output'])->toContain('skipped: running as');
    });

    it('keeps the npm and Composer caches in DEPLOY_CACHE_DIR, not in its unwritable home', function (): void {
        $this->run = runDeployInSandbox();
        $cache = $this->run['cache'];

        expect($this->run['exit'])->toBe(0, $this->run['errors'])
            ->and($this->run['env'])->toBe([
                "composer HOME={$cache}/home COMPOSER_HOME={$cache}/composer COMPOSER_CACHE_DIR={$cache}/composer/cache",
                "npm HOME={$cache}/home npm_config_cache={$cache}/npm",
            ])
            ->and("{$cache}/composer/cache")->toBeDirectory()
            ->and("{$cache}/npm")->toBeDirectory();
    });

    it('stops before git when the cache directory is missing or not writable', function (string $problem): void {
        $directory = sys_get_temp_dir() . '/tablepro-deploy-cache-' . bin2hex(random_bytes(6));

        if ($problem === 'read-only') {
            mkdir($directory, 0555);
        }

        try {
            $this->run = runDeployInSandbox(['cacheDir' => $directory]);
        } finally {
            File::deleteDirectory($directory);
        }

        expect($this->run['exit'])->toBe(1)
            ->and($this->run['errors'])->toContain("{$directory} is not a directory")
            ->and($this->run['errors'])->toContain('Create it once, as root: install -d -o ')
            ->and($this->run['output'])->not->toContain('Pulling')
            ->and($this->run['calls'])->toBe([]);
    })->with(['missing', 'read-only']);

    it('refuses a checkout it does not own, rather than fail halfway through npm ci', function (): void {
        /*
         * A root run that stops before "Restoring ownership" leaves root-owned
         * files in the checkout. Simulated here by a user id that owns none of it.
         */
        $this->run = runDeployInSandbox(['owner' => 4242]);

        expect($this->run['exit'])->toBe(1)
            ->and($this->run['errors'])->toContain("{$this->run['app']} is not owned by www-data")
            ->and($this->run['errors'])->toContain("chown -R www-data:www-data {$this->run['app']}")
            ->and($this->run['output'])->not->toContain('Pulling')
            ->and($this->run['calls'])->toBe([]);
    });

    it('fails loudly when sudo refuses, and puts the previous bundles back', function (): void {
        $this->run = runDeployInSandbox(['sudoRefuses' => true]);
        $app = $this->run['app'];

        expect($this->run['exit'])->toBe(1)
            ->and($this->run['errors'])->toContain('sudo -n /usr/bin/supervisorctl restart tablepro-web-ssr failed')
            ->and($this->run['errors'])->toContain('/etc/sudoers.d/tablepro-deploy')
            ->and($this->run['errors'])->toContain('putting the previous bundles back')
            ->and("{$app}/public/build/PREVIOUS")->toBeFile()
            ->and("{$app}/bootstrap/ssr/PREVIOUS")->toBeFile()
            ->and("{$app}/public/build-old")->not->toBeDirectory()
            ->and("{$app}/bootstrap/ssr-old")->not->toBeDirectory();

        // It stopped at the refusal: no FPM reload was attempted after it.
        expect(preg_grep('/systemctl/', $this->run['calls']))->toBeEmpty();
    });
});

/*
 * A human can still run the script as root, from `sudo -i`. Then it does what
 * it always did: the two privileged commands directly, and the whole checkout
 * handed back to www-data at the end, so the next unprivileged deploy can
 * write to it.
 */
describe('run as root, by a human', function (): void {
    afterEach(function (): void {
        if (isset($this->run)) {
            File::deleteDirectory($this->run['sandbox']);
        }
    });

    it('runs the privileged steps itself and hands the checkout back to the web user', function (): void {
        $this->run = runDeployInSandbox(['root' => true]);

        expect($this->run['exit'])->toBe(0, $this->run['errors'])
            ->and($this->run['privileged'])->toBe([
                'supervisorctl restart tablepro-web-ssr',
                'systemctl reload ' . expectedFpmService(),
                "chown -R www-data:www-data {$this->run['app']}",
            ]);
    });

    it('keeps root caches under root\'s own home and leaves DEPLOY_CACHE_DIR alone', function (): void {
        $this->run = runDeployInSandbox(['root' => true]);
        $home = "{$this->run['sandbox']}/root-home";

        expect($this->run['exit'])->toBe(0, $this->run['errors'])
            ->and($this->run['env'])->toBe([
                "composer HOME={$home} COMPOSER_HOME= COMPOSER_CACHE_DIR=",
                "npm HOME={$home} npm_config_cache=",
            ])
            ->and("{$this->run['cache']}/npm")->not->toBeDirectory();
    });

    it('takes HOME from the password database, not from the caller', function (): void {
        $script = (string) file_get_contents(base_path('scripts/deploy.sh'));

        expect($script)->toContain('getent passwd "$(id -u)"');
        expect($script)->toMatch('/^\s*export HOME="\$home_dir"$/m');

        // PATH is extended first, so getent, id and cut are found at all.
        expect(strpos($script, 'export PATH='))->toBeLessThan(strpos($script, 'getent passwd'));
    });

    it('trusts the checkout for git itself, before the first git command', function (): void {
        /*
         * The checkout belongs to www-data. git running as root rejects it as
         * "dubious ownership", and under sudo compares the owner with the calling
         * user instead, which does not match either. Without this a root deploy
         * would depend on a safe.directory line in some user's ~/.gitconfig.
         * www-data owns the checkout, so its deploys need none.
         */
        $script = (string) file_get_contents(base_path('scripts/deploy.sh'));
        $code = (string) preg_replace('/^\s*#.*$/m', '', $script);

        expect($code)
            ->toContain('export GIT_CONFIG_KEY_0=safe.directory')
            ->toContain('export GIT_CONFIG_VALUE_0="$APP_PATH"');

        preg_match('/^.*\bgit (?!config)[a-z-]+/m', $code, $first, PREG_OFFSET_CAPTURE);

        expect($first)->not->toBeEmpty('Expected the script to run git');
        expect(strpos($code, 'GIT_CONFIG_VALUE_0'))->toBeLessThan($first[0][1]);
    });

    it('prints a rollback for a root shell that hands the checkout back too', function (): void {
        /*
         * Run from `sudo -i`, the rollback writes vendor/, node_modules/ and the
         * bundles as root. Left that way, the next www-data deploy could not
         * rewrite them.
         */
        expect((string) file_get_contents(base_path('scripts/deploy.sh')))
            ->toMatch('/^rollback_command\(\) \{\n.*chown -R %s:%s %s.*\n\s+"\$APP_PATH" "\$PREV_COMMIT" "\$WEB_USER" "\$WEB_USER" "\$APP_PATH"/m');
    });
});

it('verifies the new bundles before it moves them into place', function (string $guard) {
    expect((string) file_get_contents(base_path('scripts/deploy.sh')))->toContain($guard);
})->with([
    'public/build-next/manifest.json',
    '"resources/js/app.tsx"',
    'bootstrap/ssr-next/ssr.js',
]);

it('ignores every directory it leaves in the working tree', function (): void {
    /*
     * The script refuses to deploy when `git status --porcelain` reports
     * anything, which is right: a dirty tree means someone edited files on the
     * server, and merging over that silently is how those edits vanish.
     *
     * But the script also builds into `*-next` and keeps the bundles it
     * replaced at `*-old`, so a successful deploy ends with two untracked
     * directories in the tree it just checked. Unignored, the first deploy
     * created them and every deploy after it refused to run — which is exactly
     * what happened after the CD workflow landed.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));
    $ignored = file_get_contents(base_path('.gitignore'));

    preg_match_all('#\b((?:public|bootstrap)/[a-z]+-(?:old|next))\b#', $script, $matches);

    $created = array_unique($matches[1]);

    expect($created)->not->toBeEmpty('Expected the script to name its scratch directories');

    // `Assert::` because Pest's toContain() is `(mixed ...$needles)` and would
    // read the message as a second needle, failing for the wrong reason.
    foreach ($created as $path) {
        PHPUnit\Framework\Assert::assertStringContainsString(
            "/{$path}",
            $ignored,
            "deploy.sh leaves {$path} in the working tree, but .gitignore does not cover it",
        );
    }
});

it('lets its own scratch directories past the cleanliness check, and nothing else', function (string $line, bool $blocks): void {
    /*
     * The filter runs before the pull, so a server already holding the
     * artifacts can reach the commit that ignores them. Exercised against the
     * real expression rather than a copy, so the two cannot drift.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    preg_match("#git status --porcelain \| grep -vE '([^']+)'#", $script, $m);
    expect($m[1] ?? null)->not->toBeNull('The cleanliness filter is missing from deploy.sh');

    $survives = preg_match('#' . str_replace('#', '\#', $m[1]) . '#', $line) !== 1;

    expect($survives)->toBe($blocks, $blocks
        ? "\"{$line}\" should block a deploy"
        : "\"{$line}\" is this script's own artifact and should not block a deploy");
})->with([
    'keeps the previous SSR bundle' => ['?? bootstrap/ssr-old/', false],
    'keeps the previous asset build' => ['?? public/build-old/', false],
    'keeps a half-finished SSR build' => ['?? bootstrap/ssr-next/', false],
    'keeps a half-finished asset build' => ['?? public/build-next/', false],
    'blocks an edited controller' => [' M app/Http/Controllers/LandingController.php', true],
    'blocks an edited component' => [' M resources/js/pages/Home.tsx', true],
    'blocks a stray untracked file' => ['?? .env.backup', true],
    'blocks an untracked build directory that is not one of ours' => ['?? public/uploads-old/', true],
]);

it('explains a diverged branch instead of dumping git hints', function (): void {
    /*
     * `git pull --ff-only` is the right call — a deploy must never merge or
     * rebase on its own — but on a force-pushed branch it fails with a wall of
     * git advice ending in "aborting", which reads as a broken script rather
     * than as a checkout one command from fine. That cost a round trip the
     * first time it happened.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)->toContain('git merge-base --is-ancestor HEAD');

    // And it has to name the recovery, not just the diagnosis.
    expect($script)->toContain('git reset --hard origin/');

    /*
     * The check has to come before the pull, or the raw git failure wins the
     * race. Compared on the executable lines only — the comment above the check
     * names `git pull --ff-only` too, and matching that instead put the guard
     * "after" the pull it precedes by twelve lines.
     */
    $code = preg_replace('/^\s*#.*$/m', '', $script);

    expect(strpos($code, 'git merge-base --is-ancestor HEAD'))
        ->toBeLessThan(strpos($code, 'git pull --ff-only'));
});

it('does not trust the commit alone to mean the bundles are current', function (): void {
    /*
     * `public/build` and `bootstrap/ssr` are gitignored, so a `git reset --hard`
     * — which the runbook prescribes after a force-push — moves the sources and
     * leaves the built output untouched. The next deploy then sees an unchanged
     * commit, skips the build, reports success, and leaves the site serving the
     * previous release.
     *
     * That is not hypothetical: a deploy went green while the live homepage was
     * still the pre-rewrite page, and the smoke test passed because a stale
     * bundle renders a perfectly valid old site.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)->toContain('bundles_are_stale');

    // The skip branch must consult it, not just define it.
    expect($script)->toMatch('/PREV_COMMIT.+CURR_COMMIT.+FORCE.+bundles_are_stale/s');

    // And it has to look at both halves of the build, not only the assets.
    expect($script)
        ->toContain('public/build/manifest.json')
        ->toContain('bootstrap/ssr/ssr.js');
});

it('proves the smoke test hit this release and not merely a live one', function (): void {
    /*
     * An `<h1>` proves SSR is alive. It does not prove the bundle behind it is
     * the one just built — which is the exact failure above, where every check
     * passed against the previous release.
     *
     * Vite hashes the entry filename per build, so the manifest's entry appears
     * in the served HTML only when the served app is this build.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    expect($script)->toContain('BUILT_ENTRY');
    expect($script)->toContain('serving a different build than the one just deployed');

    // The assertion has to run after the <h1> check, inside the same block.
    expect(strpos($script, 'no server-rendered <h1>'))
        ->toBeLessThan(strpos($script, 'serving a different build'));
});

it('rebuilds when the artifacts are older than the sources, whatever the diff says', function (): void {
    /*
     * The changed-paths pattern classifies a diff. This asks the question the
     * diff is only a proxy for: is what we built older than what we built it
     * from?
     *
     * They disagree whenever a release is skipped, and a skipped rebuild does
     * not retry itself — the next deploy diffs against the commit that skipped
     * it, sees nothing front-end in that range, and leaves the stale bundle in
     * place indefinitely. One misclassified path strands the site until someone
     * runs FORCE=1 by hand.
     *
     * That is not hypothetical. `resources/data/*.json` was classified as
     * content, so corrected prices deployed green and never reached the page —
     * and the deploy that fixed the classifier could not undo its own backlog,
     * because by then the data change was behind it.
     */
    $script = file_get_contents(base_path('scripts/deploy.sh'));

    // The staleness check must be consulted for the front-end decision, not
    // only inside the unchanged-commit branch.
    expect(substr_count($script, 'bundles_are_stale'))->toBeGreaterThanOrEqual(
        3,
        'bundles_are_stale should be defined and consulted in both the skip branch and the front-end decision',
    );

    expect($script)->toMatch('/FRONTEND_CHANGED"?\s*=\s*false.*bundles_are_stale/s');

    // And it has to be defined before both uses, or the shell sees an empty command.
    $definedAt = strpos($script, 'bundles_are_stale() {');
    expect($definedAt)->not->toBeFalse();
    expect($definedAt)->toBeLessThan(strrpos($script, 'bundles_are_stale;'));
});

it('still sees a PHP change in a release whose path list outgrows a pipe buffer', function (): void {
    $images = array_map(
        fn(int $i): string => "public/images/features/mac-figure-{$i}-light-1216.avif",
        range(1, 3000),
    );
    $paths = implode("\n", ['app/Http/Controllers/HomeController.php', ...$images]);

    expect(strlen($paths))->toBeGreaterThan(65536)
        ->and(runChanged($paths, deployPattern('PHP_CHANGED')))->toBeTrue()
        ->and(runChanged($paths, deployPattern('CONTENT_CHANGED')))->toBeFalse();
});
