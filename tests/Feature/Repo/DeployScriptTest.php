<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

// The plain www-data run; its smoke URL also serves the bare-URL smoke test.
const DEPLOY_DEFAULT_RUN = ['env' => ['SMOKE_URL' => 'https://tablepro.example']];

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

// The script matches with grep -E; ERE and PCRE agree on every construct these patterns use.
function deployMatches(string $flag, string $path): bool
{
    return preg_match('#' . deployPattern($flag) . '#', $path) === 1;
}

function runChanged(string $paths, string $pattern): bool
{
    $matched = preg_match('/^changed\(\) \{.*\}$/m', (string) file_get_contents(base_path('scripts/deploy.sh')), $definition);

    expect($matched)->toBe(1, 'scripts/deploy.sh has no one-line changed() function');

    // On stdin: Linux caps one environment string at 128 KB.
    $process = new Process(
        ['bash', '-c', "set -euo pipefail\nCHANGED_FILES=\"\$(cat)\"\n{$definition[0]}\nchanged \"\$PATTERN\""],
        null,
        ['PATTERN' => $pattern],
        $paths,
    );
    $process->run();

    return $process->getExitCode() === 0;
}

function deployStubs(): array
{
    // Once per suite: macOS checks each new executable on its first run, about two seconds a test.
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
                mkdir -p "$out/assets"
                echo 'built now' > "$out/assets/app-new.js"
            fi

            BASH,
        'tools/curl' => $record('curl') . <<<'BASH'
            out=""
            while [ $# -gt 0 ]; do
                case "$1" in
                    -o) out="$2"; shift 2 ;;
                    *) shift ;;
                esac
            done
            printf '<h1>TablePro</h1><script type="module" src="/build/assets/app-new.js"></script>' > "$out"
            printf '200'

            BASH,
        // `php -r` is the real PHP: the script derives the FPM unit from its version.
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

    // origin is one commit ahead (a component, a PHP file, composer.lock), so a run takes both steps that need root.
    if ($options['git'] ?? true) {
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
    } else {
        mkdir($app);
        file_put_contents("{$app}/artisan", "<?php\n");
    }

    // The live bundles a failed deploy has to put back.
    foreach (["{$app}/public/build", "{$app}/bootstrap/ssr"] as $live) {
        mkdir($live, 0755, true);
        file_put_contents("{$live}/PREVIOUS", "previous release\n");
    }

    $manifest = [];

    foreach ($options['previousAssets'] ?? [] as $name => $asset) {
        $file = "{$app}/public/build/assets/{$name}";

        File::ensureDirectoryExists(dirname($file));
        file_put_contents($file, $asset['content'] ?? "{$name}\n");
        touch($file, time() - (int) round(($asset['hoursAgo'] ?? 0) * 3600));

        if ($asset['live'] ?? false) {
            $manifest["resources/js/{$name}"] = ['file' => "assets/{$name}"];
        }
    }

    if ($manifest !== []) {
        file_put_contents("{$app}/public/build/manifest.json", json_encode($manifest, JSON_UNESCAPED_SLASHES));
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

function deployRun(array $options = DEPLOY_DEFAULT_RUN): array
{
    static $runs = [];

    $key = json_encode($options, JSON_THROW_ON_ERROR);

    if (! isset($runs[$key])) {
        $runs[$key] = runDeployInSandbox($options);
        $sandbox = $runs[$key]['sandbox'];

        register_shutdown_function(fn() => (new Illuminate\Filesystem\Filesystem())->deleteDirectory($sandbox));
    }

    return $runs[$key];
}

function expectedFpmService(): string
{
    return 'php' . PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '-fpm';
}

function documentedSudoersCommands(): array
{
    $matched = preg_match('/^www-data ALL=\(root\) NOPASSWD: (.+)$/m', (string) file_get_contents(base_path('docs/deployment.md')), $rule);

    expect($matched)->toBe(1, 'docs/deployment.md does not spell out the www-data sudoers rule');

    return explode(', ', $rule[1]);
}

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

// Vite inlines these: corrected prices once deployed green and never reached the site.
it('rebuilds the bundles for every data file', function (): void {
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

// Opcache runs with validate_timestamps=0, so an edited template serves its old compilation until FPM reloads.
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
    // lang/ is opcached PHP, and locales.json decides which route groups mount.
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

it('refuses a relative APP_PATH before it touches anything', function (): void {
    // The check comes before git, composer or npm, so the real script is safe to run here.
    $process = new Process(['bash', base_path('scripts/deploy.sh')], sys_get_temp_dir(), ['APP_PATH' => 'var/www/tablepro.app']);
    $process->run();

    expect($process->getExitCode())->toBe(1)
        ->and($process->getErrorOutput())->toContain('APP_PATH must be an absolute path');
});

describe('run as www-data, by the deploy key', function (): void {
    beforeEach(function (): void {
        if (suiteRunsAsRoot()) {
            $this->markTestSkipped('The suite runs as root, so the script takes its root path.');
        }
    });

    it('reaches root only through sudo -n, for the commands the documented sudoers rule allows', function (): void {
        $run = deployRun();

        expect($run['exit'])->toBe(0, $run['errors'])
            ->and($run['privileged'])->toBe([
                'sudo -n /usr/bin/supervisorctl restart tablepro-web-ssr',
                'sudo -n /usr/bin/systemctl reload ' . expectedFpmService(),
            ]);

        // sudo matches literally; the rule names production's php8.5-fpm, this run the suite's PHP.
        foreach ($run['privileged'] as $call) {
            expect(documentedSudoersCommands())->toContain(str_replace(expectedFpmService(), 'php8.5-fpm', substr($call, strlen('sudo -n '))));
        }
    });

    it('leaves ownership alone, because it already owns what it wrote', function (): void {
        $run = deployRun();

        expect($run['exit'])->toBe(0, $run['errors'])
            ->and(preg_grep('/^chown /', $run['calls']))->toBeEmpty();
    });

    it('keeps the npm and Composer caches in DEPLOY_CACHE_DIR, not in its unwritable home', function (): void {
        $run = deployRun();
        $cache = $run['cache'];

        expect($run['exit'])->toBe(0, $run['errors'])
            ->and($run['env'])->toBe([
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
            $run = deployRun(['git' => false, 'cacheDir' => $directory]);
        } finally {
            File::deleteDirectory($directory);
        }

        expect($run['exit'])->toBe(1)
            ->and($run['errors'])->toContain("{$directory} is not a directory")
            ->and($run['output'])->not->toContain('Pulling')
            ->and($run['calls'])->toBe([]);
    })->with(['missing', 'read-only']);

    it('refuses a checkout it does not own, rather than fail halfway through npm ci', function (): void {
        // What a root run that stopped before "Restoring ownership" leaves: 4242 owns none of the checkout.
        $run = deployRun(['git' => false, 'owner' => 4242]);

        expect($run['exit'])->toBe(1)
            ->and($run['errors'])->toContain("{$run['app']} is not owned by www-data")
            ->and($run['output'])->not->toContain('Pulling')
            ->and($run['calls'])->toBe([]);
    });

    it('fails loudly when sudo refuses, and puts the previous bundles back', function (): void {
        $run = deployRun(['sudoRefuses' => true]);
        $app = $run['app'];

        expect($run['exit'])->toBe(1)
            ->and($run['errors'])->toContain('sudo -n /usr/bin/supervisorctl restart tablepro-web-ssr failed')
            ->and("{$app}/public/build/PREVIOUS")->toBeFile()
            ->and("{$app}/bootstrap/ssr/PREVIOUS")->toBeFile()
            ->and("{$app}/public/build-old")->not->toBeDirectory()
            ->and("{$app}/bootstrap/ssr-old")->not->toBeDirectory();

        expect(preg_grep('/systemctl/', $run['calls']))->toBeEmpty();
    });
});

describe('run as root, by a human', function (): void {
    it('runs the privileged steps itself and hands the checkout back to the web user', function (): void {
        $run = deployRun(['root' => true]);

        expect($run['exit'])->toBe(0, $run['errors'])
            ->and($run['privileged'])->toBe([
                'supervisorctl restart tablepro-web-ssr',
                'systemctl reload ' . expectedFpmService(),
                "chown -R www-data:www-data {$run['app']}",
            ]);
    });

    it('keeps root caches under root\'s own home from the password database, and leaves DEPLOY_CACHE_DIR alone', function (): void {
        $run = deployRun(['root' => true]);
        $home = "{$run['sandbox']}/root-home";

        expect($run['exit'])->toBe(0, $run['errors'])
            ->and($run['env'])->toBe([
                "composer HOME={$home} COMPOSER_HOME= COMPOSER_CACHE_DIR=",
                "npm HOME={$home} npm_config_cache=",
            ])
            ->and("{$run['cache']}/npm")->not->toBeDirectory();
    });
});

it('ignores every directory it leaves in the working tree', function (): void {
    // Unignored, the first deploy's -next and -old directories made every later deploy refuse a dirty tree.
    $script = file_get_contents(base_path('scripts/deploy.sh'));
    $ignored = file_get_contents(base_path('.gitignore'));

    preg_match_all('#\b((?:public|bootstrap)/[a-z]+-(?:old|next))\b#', $script, $matches);

    $created = array_unique($matches[1]);

    expect($created)->not->toBeEmpty('Expected the script to name its scratch directories');

    foreach ($created as $path) {
        expect(str_contains($ignored, "/{$path}"))->toBeTrue("deploy.sh leaves {$path} in the working tree, but .gitignore does not cover it");
    }
});

it('lets its own scratch directories past the cleanliness check, and nothing else', function (string $line, bool $blocks): void {
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

// Cached pages and open tabs still name the previous release's hashed assets; moving them out made each a 404.
describe('keeping the previous release\'s assets', function (): void {
    it('keeps the outgoing assets servable, and lets carried ones go after the retention', function (): void {
        $run = deployRun(['previousAssets' => [
            // Built ten days ago and live until now: it retires with this deploy.
            'app-old.js' => ['live' => true, 'hoursAgo' => 240],
            // A name the new build has too: the new build's file wins.
            'app-new.js' => ['live' => true, 'hoursAgo' => 240, 'content' => "the previous build\n"],
            // Carried by an earlier deploy, retired five hours ago.
            'Pricing-retired.js' => ['hoursAgo' => 5],
            // Carried by an earlier deploy, retired past the 72-hour retention.
            'Home-expired.js' => ['hoursAgo' => 100],
        ]]);
        $assets = "{$run['app']}/public/build/assets";

        expect($run['exit'])->toBe(0, $run['errors'])
            ->and((string) file_get_contents("{$assets}/app-new.js"))->toBe("built now\n")
            ->and("{$assets}/app-old.js")->toBeFile()
            ->and("{$assets}/Pricing-retired.js")->toBeFile()
            ->and("{$assets}/Home-expired.js")->not->toBeFile();

        // Retiring now restarts the clock; a file carried before keeps the moment it retired.
        expect(filemtime("{$assets}/app-old.js"))->toBeGreaterThan(time() - 120)
            ->and(abs(filemtime("{$assets}/Pricing-retired.js") - (time() - 5 * 3600)))->toBeLessThan(120);

        expect((string) file_get_contents("{$run['app']}/public/build/manifest.json"))->toContain('assets/app-new.js')->not->toContain('app-old.js')
            ->and("{$run['app']}/public/build-old/assets/app-old.js")->toBeFile();
    });

    it('takes the retention from ASSET_RETENTION_HOURS', function (): void {
        $run = deployRun([
            'env' => ['ASSET_RETENTION_HOURS' => '4'],
            'previousAssets' => [
                'app-old.js' => ['live' => true, 'hoursAgo' => 240],
                'Pricing-retired.js' => ['hoursAgo' => 5],
            ],
        ]);
        $assets = "{$run['app']}/public/build/assets";

        expect($run['exit'])->toBe(0, $run['errors'])
            ->and("{$assets}/app-old.js")->toBeFile()
            ->and("{$assets}/Pricing-retired.js")->not->toBeFile();
    });

    it('refuses a retention that is not a whole number of hours, before it touches anything', function (string $hours): void {
        $process = new Process(['bash', base_path('scripts/deploy.sh')], sys_get_temp_dir(), ['APP_PATH' => '/nonexistent/tablepro.app', 'ASSET_RETENTION_HOURS' => $hours]);
        $process->run();

        expect($process->getExitCode())->toBe(1)
            ->and($process->getErrorOutput())->toContain('ASSET_RETENTION_HOURS must be a whole number of hours');
    })->with(['three', '-1', '1.5', '72h']);
});

// The workflow purges the edge only after this script, so a cached bare URL could fail a good deploy.
it('smoke-tests a URL the edge has never cached', function (string $url, string $expected): void {
    $run = deployRun(['env' => ['SMOKE_URL' => $url]]);
    $requests = array_values(preg_grep('/^curl /', $run['calls']));

    expect($run['exit'])->toBe(0, $run['errors'])
        ->and($requests)->not->toBeEmpty()
        ->and($requests[0])->toMatch($expected)
        ->and($run['output'])->toContain('serving assets/app-new.js');
})->with([
    'a bare URL' => ['https://tablepro.example', '#\shttps://tablepro\.example\?deploy-smoke=\d+$#'],
    'a URL with a query' => ['https://tablepro.example/?ref=ci', '#\shttps://tablepro\.example/\?ref=ci&deploy-smoke=\d+$#'],
]);

function deployWorkflowSteps(): array
{
    $workflow = Symfony\Component\Yaml\Yaml::parseFile(base_path('.github/workflows/deploy.yml'));
    $steps = [];

    foreach ($workflow['jobs']['deploy']['steps'] as $step) {
        $steps[$step['name']] = $step;
    }

    return $steps;
}

function runPurgeStep(array $env, string $body = ''): array
{
    $root = sys_get_temp_dir() . '/tablepro-purge-' . bin2hex(random_bytes(6));
    $calls = "{$root}/calls.log";

    File::ensureDirectoryExists($root);
    file_put_contents("{$root}/curl", "#!/usr/bin/env bash\nprintf '%s\\n' \"curl \$*\" >> \"\$STUB_CALLS\"\nprintf '%s' \"\$STUB_BODY\"\n");
    chmod("{$root}/curl", 0755);

    try {
        $process = new Process(
            ['/usr/bin/env', '-i', "PATH={$root}:/usr/bin:/bin", "STUB_CALLS={$calls}", "STUB_BODY={$body}", ...array_map(fn(string $key, string $value): string => "{$key}={$value}", array_keys($env), $env), 'bash', '-c', deployWorkflowSteps()["Purge Cloudflare's cache"]['run']],
        );
        $process->run();

        return [
            'exit' => (int) $process->getExitCode(),
            'output' => $process->getOutput(),
            'errors' => $process->getErrorOutput(),
            'calls' => is_file($calls) ? array_values(array_filter(explode("\n", (string) file_get_contents($calls)))) : [],
        ];
    } finally {
        File::deleteDirectory($root);
    }
}

describe('purging Cloudflare after a deploy', function (): void {
    it('purges from the runner after the deploy, and never hands the token to the server', function (): void {
        $steps = deployWorkflowSteps();
        $purge = $steps["Purge Cloudflare's cache"];
        $deploy = $steps['Deploy over SSH'];

        // No `if:`, so it runs only when the deploy step succeeded.
        expect($purge)->not->toHaveKey('if')
            ->and(array_search("Purge Cloudflare's cache", array_keys($steps)))->toBeGreaterThan(array_search('Deploy over SSH', array_keys($steps)))
            ->and(array_keys($deploy['env'] ?? []))->each->not->toStartWith('CLOUDFLARE')
            ->and($deploy['run'])->not->toContain('CLOUDFLARE');
    });

    it('passes with a notice when either secret is missing, and calls nothing', function (array $env): void {
        $run = runPurgeStep($env);

        expect($run['exit'])->toBe(0, $run['errors'])
            ->and($run['output'])->toContain('::notice::')
            ->and($run['calls'])->toBe([]);
    })->with([
        'neither' => [[]],
        'no token' => [['CLOUDFLARE_ZONE_ID' => 'zone123']],
        'no zone' => [['CLOUDFLARE_CACHE_PURGE_TOKEN' => 'token456']],
    ]);

    it('purges the whole zone with the token as a bearer', function (): void {
        $run = runPurgeStep(['CLOUDFLARE_ZONE_ID' => 'zone123', 'CLOUDFLARE_CACHE_PURGE_TOKEN' => 'token456'], '{"success":true,"errors":[],"messages":[],"result":{"id":"zone123"}}');

        expect($run['exit'])->toBe(0, $run['errors'])
            ->and($run['calls'])->toHaveCount(1)
            ->and($run['calls'][0])->toContain('-X POST https://api.cloudflare.com/client/v4/zones/zone123/purge_cache')
            ->and($run['calls'][0])->toContain('-H Authorization: Bearer token456')
            ->and($run['calls'][0])->toContain('--data {"purge_everything":true}');
    });

    it('fails the run, visibly, when Cloudflare refuses the purge', function (string $body): void {
        $run = runPurgeStep(['CLOUDFLARE_ZONE_ID' => 'zone123', 'CLOUDFLARE_CACHE_PURGE_TOKEN' => 'token456'], $body);

        expect($run['exit'])->toBe(1)
            ->and($run['errors'])->toContain('::error::Cloudflare did not purge the cache');
    })->with([
        'refused' => ['{"success":false,"errors":[{"code":10000,"message":"Authentication error"}]}'],
        'no answer' => [''],
    ]);
});
