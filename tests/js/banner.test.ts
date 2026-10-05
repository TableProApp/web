import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
    ANY_VERSION,
    BANNER_STORAGE_KEY,
    LICENSED_DAYS,
    SNOOZE_DAYS,
    dismissalRecord,
    dismissBanner,
    isBannerDismissed,
} from '../../resources/js/lib/banner.ts';

/*
 * How long a closed license banner stays closed, and the head script that
 * applies it before first paint. Run with `npm run test:js`.
 *
 * The head script in app.blade.php cannot import this module, so it repeats
 * the rule in plain JavaScript; the last test runs that script against
 * `isBannerDismissed` for every case, so the two cannot drift.
 */

const NOW = Date.UTC(2026, 9, 5);
const DAY = 24 * 60 * 60 * 1000;

const cases: Array<[string, string | null, string, boolean]> = [
    ['nothing stored', null, '3', false],
    ['the bare version string older releases stored', '3', '3', false],
    ['unreadable JSON', '{nope', '3', false],
    ['closed this version, still within its days', dismissalRecord('3', SNOOZE_DAYS, NOW - DAY), '3', true],
    ['closed this version, its days are over', dismissalRecord('3', SNOOZE_DAYS, NOW - (SNOOZE_DAYS + 1) * DAY), '3', false],
    ['closed an earlier version', dismissalRecord('2', SNOOZE_DAYS, NOW - DAY), '3', false],
    ['has a license, within the year', dismissalRecord(ANY_VERSION, LICENSED_DAYS, NOW - 100 * DAY), '3', true],
    ['has a license, a new message', dismissalRecord(ANY_VERSION, LICENSED_DAYS, NOW - DAY), '9', true],
    ['had a license over a year ago', dismissalRecord(ANY_VERSION, LICENSED_DAYS, NOW - (LICENSED_DAYS + 1) * DAY), '3', false],
    ['a record without an end date', JSON.stringify({ version: '3' }), '3', false],
];

test('a closed banner stays closed for its days, at its version', () => {
    for (const [name, stored, version, hidden] of cases) {
        assert.equal(isBannerDismissed(stored, version, NOW), hidden, name);
    }
});

test('closing it snoozes this version for 30 days, and a license hides every version for a year', () => {
    assert.equal(SNOOZE_DAYS, 30);
    assert.equal(LICENSED_DAYS, 365);
    assert.deepEqual(JSON.parse(dismissalRecord('3', SNOOZE_DAYS, NOW)), { version: '3', until: NOW + 30 * DAY });
    assert.deepEqual(JSON.parse(dismissalRecord(ANY_VERSION, LICENSED_DAYS, NOW)), { version: '*', until: NOW + 365 * DAY });
});

test('dismissing writes the record and hides the bar at once, even without storage', () => {
    const removed: string[] = [];
    const stored: Record<string, string> = {};

    Object.assign(globalThis, {
        document: { documentElement: { classList: { remove: (name: string) => removed.push(name) } } },
        window: { localStorage: { setItem: (key: string, value: string) => (stored[key] = value) } },
    });

    dismissBanner('3', false);
    assert.equal(JSON.parse(stored[BANNER_STORAGE_KEY]).version, '3');

    dismissBanner('3', true);
    assert.equal(JSON.parse(stored[BANNER_STORAGE_KEY]).version, '*');
    assert.deepEqual(removed, ['has-banner', 'has-banner']);

    Object.assign(globalThis, {
        window: {
            localStorage: {
                setItem: () => {
                    throw new Error('private window');
                },
            },
        },
    });

    dismissBanner('3', false);
    assert.equal(removed.length, 3, 'the bar still goes away for this page');
});

test('the head script hides the bar exactly when isBannerDismissed says so', () => {
    const blade = readFileSync(new URL('../../resources/views/app.blade.php', import.meta.url), 'utf8');
    const start = blade.indexOf('var record = JSON.parse(');
    const end = blade.indexOf('} catch (e) {}', start);

    assert.ok(start > 0 && end > start, 'the dismissal script is in app.blade.php');

    const body = blade.slice(start, end).replace("@json((string) config('banner.version'))", 'VERSION');

    for (const [name, stored, version, hidden] of cases) {
        const removed: string[] = [];
        // The script's own guard, as it stands in the template around this body.
        const run = new Function('localStorage', 'document', 'Date', 'VERSION', `try { ${body} } catch (e) {}`);

        run(
            { getItem: (key: string) => (key === BANNER_STORAGE_KEY ? stored : null) },
            { documentElement: { classList: { remove: (cls: string) => removed.push(cls) } } },
            { now: () => NOW },
            version,
        );

        assert.equal(removed.includes('has-banner'), hidden, `head script: ${name}`);
        assert.equal(isBannerDismissed(stored, version, NOW), hidden, `lib: ${name}`);
    }
});
