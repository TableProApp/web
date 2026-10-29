import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { Sponsor, SponsorsData } from '../../resources/js/lib/data/sponsors.ts';
import { byName, onHomepage, openSlots } from '../../resources/js/lib/sponsors.ts';

const LOGO = { light: '/images/sponsors/x.svg', dark: null, width: 100, height: 20 };

function sponsor(id: string, placement: Sponsor['placement']): Sponsor {
    const base = { id, name: id, githubLogin: id, url: `https://${id}.example` };

    return placement === 'name' ? { ...base, placement, logo: null } : { ...base, placement, logo: LOGO };
}

function fixture(sponsors: Sponsor[], homepageSlots = 3): SponsorsData {
    return {
        verifiedAt: '2026-10-29',
        verification: { method: 'test', program: 'https://example.com' },
        homepageSlots,
        leadSlots: 1,
        oneTime: { multiplier: 10, months: 12 },
        tiers: [
            { placement: 'name', monthly: 10 },
            { placement: 'homepage', monthly: 100 },
            { placement: 'lead', monthly: 250 },
        ],
        sponsors,
    };
}

const ids = (list: Sponsor[]): string[] => list.map((item) => item.id);

test('puts the lead first and keeps data order after it', () => {
    const data = fixture([sponsor('a', 'homepage'), sponsor('b', 'name'), sponsor('c', 'lead'), sponsor('d', 'homepage')]);

    assert.deepEqual(ids(onHomepage(data)), ['c', 'a', 'd']);
    assert.deepEqual(ids(byName(data)), ['b']);
});

test('counts the lead against the homepage slots and never goes below zero', () => {
    assert.equal(openSlots(fixture([sponsor('a', 'lead'), sponsor('b', 'name')])), 2);
    assert.equal(openSlots(fixture([sponsor('a', 'homepage'), sponsor('b', 'homepage'), sponsor('c', 'homepage')])), 0);
    assert.equal(openSlots(fixture([sponsor('a', 'homepage'), sponsor('b', 'homepage'), sponsor('c', 'homepage'), sponsor('d', 'homepage')])), 0);
    assert.equal(openSlots(fixture([])), 3);
});
