import { test } from 'node:test';
import assert from 'node:assert/strict';

import { groupIntegrations, relFor, reportUrl } from '../../resources/js/components/integrations/model.ts';
import type { IntegrationSummary } from '../../resources/js/components/integrations/types.ts';

const entry = (overrides: Partial<IntegrationSummary>): IntegrationSummary => ({
    slug: 'claude-code',
    name: 'Claude Code',
    publisher: 'TablePro',
    tier: 'official',
    group: 'ai-clients',
    closedSource: false,
    tagline: 'Connect Claude Code to your databases.',
    icon: null,
    ...overrides,
});

test('groups entries by category in the order the list first reaches each one, keeping the list order inside', () => {
    const groups = groupIntegrations([
        entry({}),
        entry({ slug: 'command-line', group: 'command-line' }),
        entry({ slug: 'cursor' }),
        entry({ slug: 'shortcuts', group: 'automation' }),
        entry({ slug: 'acme', tier: 'community', group: 'command-line' }),
    ]);

    assert.deepEqual(
        groups.map((group) => [group.category, group.integrations.map((integration) => integration.slug)]),
        [
            ['ai-clients', ['claude-code', 'cursor']],
            ['command-line', ['command-line', 'acme']],
            ['automation', ['shortcuts']],
        ],
    );
    assert.deepEqual(groupIntegrations([]), []);
});

test('marks only Community links as user content that is not endorsed', () => {
    assert.equal(relFor('community'), 'ugc nofollow');
    assert.equal(relFor('official'), undefined);
    assert.equal(relFor('partner'), undefined);
});

test('opens the registry report form with the slug filled in', () => {
    assert.equal(
        reportUrl('https://github.com/TableProApp/integrations', 'claude-code'),
        'https://github.com/TableProApp/integrations/issues/new?template=report-integration.yml&slug=claude-code',
    );
});
