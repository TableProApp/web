<?php

use Symfony\Component\Yaml\Yaml;

/** @return array<string, array<string, mixed>> */
function githubWorkflows(): array
{
    $workflows = [];

    foreach (glob(base_path('.github/workflows/*.yml')) ?: [] as $file) {
        $workflows[basename($file)] = Yaml::parseFile($file);
    }

    return $workflows;
}

it('gives no workflow a GITHUB_TOKEN that can write', function (): void {
    expect(githubWorkflows())->not->toBeEmpty();

    foreach (githubWorkflows() as $file => $workflow) {
        expect($workflow)->toHaveKey('permissions', message: "{$file} declares no top-level permissions");

        $grants = [$workflow['permissions'], ...array_column($workflow['jobs'], 'permissions')];

        foreach ($grants as $grant) {
            foreach ((array) $grant as $level) {
                expect($level)->not->toBeIn(['write', 'write-all'], "{$file} grants its GITHUB_TOKEN write access");
            }
        }
    }
});

it('opens bot pull requests only with a web bot token', function (): void {
    $pullRequestSteps = 0;

    foreach (githubWorkflows() as $file => $workflow) {
        foreach ($workflow['jobs'] as $job => $definition) {
            $tokens = [];

            foreach ($definition['steps'] ?? [] as $step) {
                $uses = $step['uses'] ?? '';

                if (str_starts_with($uses, 'actions/create-github-app-token@') && isset($step['id'])) {
                    $tokens[] = '${{ steps.' . $step['id'] . '.outputs.token }}';
                }

                if (str_starts_with($uses, 'peter-evans/create-pull-request@')) {
                    $pullRequestSteps++;

                    expect($step['with']['token'] ?? null)->toBeIn($tokens, "{$file} ({$job}) opens a pull request without a token from an earlier create-github-app-token step");
                }
            }
        }
    }

    expect($pullRequestSteps)->toBeGreaterThan(0);
});
