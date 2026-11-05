import { test } from 'node:test';
import assert from 'node:assert/strict';

import { offerFor, phaseAt, remaining, shownPhase, type CampaignData } from '../../resources/js/lib/campaign.ts';

// The phase must match App\Support\Pricing\Campaign, and the offer the provider's discount.
const campaign: CampaignData = {
    id: 'sale',
    code: 'SALE',
    percent: 40,
    duration: 'once',
    tier: 'starter',
    cycles: ['yearly', 'lifetime'],
    startsAt: '2026-11-24T00:00:00Z',
    endsAt: '2026-12-01T08:00:00Z',
    listPriceSince: '2026-11-02',
};
const start = Date.parse(campaign.startsAt);
const end = Date.parse(campaign.endsAt);

test('the window is half-open: live from the start, ended at the end', () => {
    assert.equal(phaseAt(campaign, start - 1), 'upcoming');
    assert.equal(phaseAt(campaign, start), 'live');
    assert.equal(phaseAt(campaign, end - 1), 'live');
    assert.equal(phaseAt(campaign, end), 'ended');
});

test('the reader\'s clock can end the sale but never start it', () => {
    assert.equal(shownPhase(campaign, 'live', end - 1), 'live');
    assert.equal(shownPhase(campaign, 'live', end), 'ended');
    assert.equal(shownPhase(campaign, 'upcoming', start + 1), 'upcoming', 'a fast clock must not attach a code the provider does not take yet');
    assert.equal(shownPhase(campaign, 'ended', start + 1), 'ended');
});

test('the offer covers only the sale\'s plan and cycles, while it is live', () => {
    assert.deepEqual(offerFor(campaign, 'live', 'starter', 'lifetime', null), { code: campaign.code, percent: campaign.percent, firstChargeOnly: false });
    assert.deepEqual(offerFor(campaign, 'live', 'starter', 'yearly', null), { code: campaign.code, percent: campaign.percent, firstChargeOnly: true });
    assert.equal(offerFor(campaign, 'live', 'starter', 'monthly', null), null);
    assert.equal(offerFor(campaign, 'live', 'team', 'yearly', null), null);
    assert.equal(offerFor(campaign, 'upcoming', 'starter', 'lifetime', null), null);
    assert.equal(offerFor(campaign, 'ended', 'starter', 'lifetime', null), null);
    assert.equal(offerFor(null, 'live', 'starter', 'lifetime', null), null);
});

test('a larger regional discount wins, since checkout takes one discount per order', () => {
    assert.equal(offerFor(campaign, 'live', 'starter', 'lifetime', campaign.percent + 10), null);
    assert.notEqual(offerFor(campaign, 'live', 'starter', 'lifetime', campaign.percent), null);
    assert.notEqual(offerFor(campaign, 'live', 'starter', 'lifetime', campaign.percent - 10), null);
});

test('the time left is whole seconds, rounded down, never negative', () => {
    assert.deepEqual(remaining(end, end - 1), { days: 0, hours: 0, minutes: 0, seconds: 0 });
    assert.deepEqual(remaining(end, end - 1000), { days: 0, hours: 0, minutes: 0, seconds: 1 });
    assert.deepEqual(remaining(end, end + 5000), { days: 0, hours: 0, minutes: 0, seconds: 0 });
    assert.deepEqual(remaining(end, start), { days: 7, hours: 8, minutes: 0, seconds: 0 });
    assert.deepEqual(remaining(end, end - (86_400 + 3600 + 60 + 1) * 1000), { days: 1, hours: 1, minutes: 1, seconds: 1 });
});
