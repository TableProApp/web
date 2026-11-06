<?php

use Illuminate\Support\Facades\File;

function enginesJson(): array
{
    static $engines = null;

    return $engines ??= json_decode(File::get(resource_path('data/engines.json')), true, 512, JSON_THROW_ON_ERROR);
}

function enginesMacRelease(): string
{
    $platforms = json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'];

    return collect($platforms)->firstWhere('id', 'mac')['release']['version'];
}

it('gives every engine the documented fields', function (): void {
    foreach (enginesJson() as $engine) {
        $id = $engine['id'];

        expect($engine)->toHaveKeys([
            'id', 'appTypeId', 'name', 'page', 'slug', 'parent', 'anchor', 'category', 'featured', 'meta',
            'distribution', 'driverPlugin', 'sinceAppVersion', 'minAppVersion', 'state', 'queryLanguage', 'defaultPort',
            'connectionMode', 'icon', 'monogram', 'docsSlug', 'capabilities', 'versionFloor', 'limits', 'ios', 'linux',
        ])
            ->and($id)->toMatch('/^[a-z0-9]+(-[a-z0-9]+)*$/')
            ->and($engine['name'])->toBeString()->not->toBeEmpty()
            ->and($engine['page'])->toBeIn(['own', 'section', 'hub'])
            ->and($engine['distribution'])->toBeIn(['bundled', 'registry'])
            ->and($engine['state'])->toBeIn(['published', 'head_only'])
            ->and($engine['connectionMode'])->toBeIn(['network', 'file', 'api'])
            ->and($engine['featured'])->toBeBool()
            ->and($engine['meta'])->toBeBool()
            ->and($engine['sinceAppVersion'])->toMatch('/^\d+\.\d+\.\d+$/')
            ->and($engine['capabilities']['schemaEditing'])->toBeIn(['full', 'partial', 'read-only'])
            ->and($engine['capabilities']['explainView'])->toBeIn([null, 'diagram', 'text', 'cost']);

        expect($engine['defaultPort'] === null || (is_int($engine['defaultPort']) && $engine['defaultPort'] > 0))->toBeTrue("{$id}.defaultPort");
        expect($engine['minAppVersion'] === null)->toBe($engine['distribution'] === 'bundled', "{$id}: only a registry plugin has a minimum app version");

        foreach ($engine['ios'] as $flag => $value) {
            expect($value)->toBeBool("{$id}.ios.{$flag}");
        }
    }

    foreach (['id', 'appTypeId', 'name'] as $field) {
        $values = array_column(enginesJson(), $field);

        expect($values)->toBe(array_values(array_unique($values)), "{$field} repeats");
    }
});

it('never dates an engine after the current Mac release', function (): void {
    $release = enginesMacRelease();

    foreach (enginesJson() as $engine) {
        expect(version_compare($engine['sinceAppVersion'], $release, '<='))->toBeTrue("{$engine['id']} is newer than {$release}");

        if ($engine['minAppVersion'] !== null) {
            expect(version_compare($engine['minAppVersion'], $release, '<='))->toBeTrue("{$engine['id']} needs a newer app than {$release}");
        }
    }
});

it('places every engine on its own page, a section of one, or the hub', function (): void {
    $engines = collect(enginesJson())->keyBy('id');
    $slugs = $engines->pluck('slug')->filter()->values()->all();

    expect($slugs)->toBe(array_values(array_unique($slugs)));

    foreach ($engines as $id => $engine) {
        match ($engine['page']) {
            'own' => expect($engine['slug'])->toMatch('/^[a-z0-9-]+-(client|gui)$/', "{$id} needs a slug")
                ->and($engine['icon'])->not->toBeNull("{$id} needs a mark for its page header"),
            'section' => expect($engine['slug'])->toBeNull()
                ->and($engines[$engine['parent']]['page'] ?? null)->toBe('own', "{$id}'s parent must have its own page")
                ->and($engine['anchor'])->toBe($id),
            'hub' => expect($engine['slug'])->toBeNull()
                ->and($engine['anchor'])->toBe($id),
        };
    }
});

it('keeps related capabilities consistent', function (): void {
    foreach (enginesJson() as $engine) {
        $capabilities = $engine['capabilities'];

        expect($capabilities['explain'] === [])->toBe($capabilities['explainView'] === null, "{$engine['id']}: an EXPLAIN view needs EXPLAIN");

        if ($capabilities['awsIam']) {
            expect($capabilities['awsSignIn'])->toBeTrue("{$engine['id']}: RDS IAM is an AWS sign-in");
        }

        if ($capabilities['alwaysReadOnly']) {
            expect($capabilities['schemaEditing'])->toBe('read-only')
                ->and($capabilities['import'])->toBeFalse();
        }

        if ($engine['ios']['inPicker']) {
            expect($engine['ios']['openable'])->toBeTrue("{$engine['id']} is offered on iOS, so it must open");
        }
    }
});

it('offers on iOS exactly the engines platforms.json lists', function (): void {
    $platforms = json_decode(File::get(resource_path('data/platforms.json')), true, 512, JSON_THROW_ON_ERROR)['platforms'];
    $inPicker = collect(enginesJson())->filter(fn(array $engine): bool => $engine['ios']['inPicker'])->pluck('id')->all();

    expect($inPicker)->toEqualCanonicalizing(collect($platforms)->firstWhere('id', 'ios')['iosEngines']);
});

it('states where each engine runs on Linux, with evidence from the app', function (): void {
    foreach (enginesJson() as $engine) {
        $linux = $engine['linux'];
        $id = $engine['id'];

        expect($linux)->toHaveKeys(['support', 'tested', 'evidence'])
            ->and($linux['support'])->toBeIn(['tested', 'untested', 'blocked', 'none'], "{$id}.linux.support")
            ->and($linux['tested'])->toBeArray()
            ->and($linux['tested'] !== [])->toBe($linux['support'] === 'tested', "{$id}: tested releases exactly when support is tested")
            ->and($linux['evidence'])->toMatch('/^TableProApp\/TablePro:\S+:\d+/', "{$id}.linux.evidence");

        foreach ($linux['tested'] as $release) {
            expect($release)->toBeString()->not->toBeEmpty();
        }
    }

    // linux/README.md:15-25 tests eleven products; any other count means one side moved without the other.
    expect(collect(enginesJson())->where('linux.support', 'tested')->count())->toBe(11);
});

it('links each engine to a docs page of its own or of its driver sibling', function (): void {
    foreach (enginesJson() as $engine) {
        if ($engine['docsSlug'] !== null) {
            continue;
        }

        $sibling = collect(enginesJson())->first(
            fn(array $other): bool => $other['driverPlugin'] === $engine['driverPlugin'] && $other['docsSlug'] !== null,
        );

        expect($sibling)->not->toBeNull("{$engine['id']} has no docs page and no sibling with one");
    }
});

it('points at icon files that exist', function (): void {
    foreach (enginesJson() as $engine) {
        if ($engine['icon'] !== null) {
            expect(public_path($engine['icon']))->toBeFile();
        }
    }
});

it('records version floors and limits with evidence', function (): void {
    foreach (enginesJson() as $engine) {
        if ($engine['versionFloor'] !== null) {
            expect($engine['versionFloor'])->toHaveKeys(['text', 'enforced', 'evidence'])
                ->and($engine['versionFloor']['enforced'])->toBeBool()
                ->and($engine['versionFloor']['evidence'])->toBeString()->not->toBeEmpty();
        }

        $ids = array_column($engine['limits'], 'id');

        expect($ids)->toBe(array_values(array_unique($ids)), "{$engine['id']} repeats a limit");

        foreach ($engine['limits'] as $limit) {
            expect($limit['value'] === null || is_int($limit['value']))->toBeTrue("{$engine['id']}.{$limit['id']}.value")
                ->and($limit['evidence'])->toBeString()->not->toBeEmpty();
        }
    }
});

it('has a tagline and a sentence for every limit in the English copy', function (): void {
    $copy = json_decode(File::get(resource_path('data/content/en/engines.json')), true, 512, JSON_THROW_ON_ERROR);

    expect(array_keys($copy))->toEqualCanonicalizing(array_column(enginesJson(), 'id'));

    foreach (enginesJson() as $engine) {
        $entry = $copy[$engine['id']];

        expect($entry['tagline'])->toBeString()->not->toBeEmpty()
            ->and(array_keys($entry['limits']))->toEqualCanonicalizing(array_column($engine['limits'], 'id'));

        foreach ($engine['limits'] as $limit) {
            expect(str_contains($entry['limits'][$limit['id']], '{value}'))->toBe($limit['value'] !== null, "{$engine['id']}.{$limit['id']} uses {value} only when the limit has one");
        }
    }
});
