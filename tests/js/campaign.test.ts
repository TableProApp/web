import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { calendarHref, noticeClosed, noticeClosedValue, noticeOpens, offerFor, phaseAt, remaining, shownPhase, type CampaignData } from '../../resources/js/lib/campaign.ts';

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

test('the calendar file is a half-hour event at the start, with an alert and escaped text', () => {
    const href = calendarHref(campaign, { summary: 'Sale: 40% off, Pro; one-time', description: 'Until December 1\nthen gone', url: 'https://tablepro.app/black-friday' });

    assert.ok(href.startsWith('data:text/calendar;charset=utf-8,'));

    const ics = decodeURIComponent(href.slice(href.indexOf(',') + 1));
    const lines = ics.split('\r\n');

    assert.equal(lines[0], 'BEGIN:VCALENDAR');
    assert.ok(lines.includes('DTSTART:20261124T000000Z'));
    assert.ok(lines.includes('DTEND:20261124T003000Z'));
    assert.ok(lines.includes('UID:sale@tablepro.app'));
    assert.ok(lines.includes('SUMMARY:Sale: 40% off\\, Pro\\; one-time'));
    assert.ok(lines.includes('DESCRIPTION:Until December 1\\nthen gone'));
    assert.ok(lines.includes('TRIGGER:PT0M'));
    assert.equal(lines.at(-2), 'END:VCALENDAR');
});

test('the notice opens only while the sale is live and its one-time offer applies', () => {
    assert.equal(noticeOpens(campaign, 'live', null), true);
    assert.equal(noticeOpens(campaign, 'live', 40), true);
    assert.equal(noticeOpens(campaign, 'live', 50), false, 'a larger regional discount is never contradicted by the notice');
    assert.equal(noticeOpens(campaign, 'upcoming', null), false);
    assert.equal(noticeOpens(campaign, 'ended', null), false);
    assert.equal(noticeOpens(null, 'live', null), false);
    assert.equal(noticeOpens({ ...campaign, cycles: ['yearly'] }, 'live', null), false);
});

test('closing the notice keeps the banner, and closing the banner closes the notice too', () => {
    assert.equal(noticeClosedValue(campaign), 'sale:notice');
    assert.notEqual(noticeClosedValue(campaign), campaign.id, 'the head script hides the banner only for the bare id');
    assert.equal(noticeClosed(campaign, null), false);
    assert.equal(noticeClosed(campaign, 'sale:notice'), true);
    assert.equal(noticeClosed(campaign, 'sale'), true);
    assert.equal(noticeClosed(campaign, 'last-year'), false);
    assert.equal(noticeClosed(campaign, 'last-year:notice'), false);
});

// The rule that shows the sale's banner names three classes; the one that hands its slot to the language bar must outweigh it.
test('the language bar takes the slot from the sale\'s banner, so the two never stack', () => {
    const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');
    const specificity = (selector: string): number => (selector.match(/\.[\w-]+/g) ?? []).length;
    const rule = (display: string): string | undefined =>
        [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, selector, body]) => selector.includes('.campaign-banner') && selector.includes('html.') && body.includes(`display: ${display}`))?.[1].trim();

    const shows = rule('block');
    const hides = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, selector, body]) => selector.includes('has-language-bar') && selector.includes('.campaign-banner') && body.includes('display: none'))?.[1].trim();

    assert.ok(shows !== undefined && hides !== undefined, 'both rules exist');
    assert.ok(specificity(hides) > specificity(shows), `${hides} must outweigh ${shows}`);
});
