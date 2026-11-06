/**
 * A dated sale from pricing.json's `campaign`: when it runs, which purchases
 * it applies to, and what it takes off. `App\Support\Pricing\Campaign` is the
 * server's half and decides the phase a page is rendered in.
 *
 * The provider's discount is the real one: checkout from the site attaches
 * its code, and the provider applies it only inside the window and only to
 * the campaign's cycles. These functions only work out what the site shows
 * and sends, so the two agree.
 *
 * Pure and with no imports beyond types, so `node --test` loads it directly
 * (tests/js/campaign.test.ts).
 */

export type CampaignPhase = 'upcoming' | 'live' | 'ended';

export interface CampaignData {
    id: string;
    /** The provider's discount code. */
    code: string;
    /** Whole percent off, 1 to 99. */
    percent: number;
    /** `once`: a subscription gets the discount on its first charge only, then renews at the list price. */
    duration: 'once';
    tier: 'starter' | 'team';
    cycles: ('monthly' | 'yearly' | 'lifetime')[];
    /** ISO 8601, UTC. The window is half-open: live from `startsAt`, ended at `endsAt`. */
    startsAt: string;
    endsAt: string;
    /** `YYYY-MM-DD`: when the list prices the sale is taken off took effect. */
    listPriceSince: string;
}

export interface CampaignOffer {
    code: string;
    percent: number;
    /** True for a subscription: only its first charge is discounted. */
    firstChargeOnly: boolean;
}

/** The phase at `nowMs`, by the same half-open window as the server. */
export function phaseAt(campaign: CampaignData, nowMs: number): CampaignPhase {
    if (nowMs < Date.parse(campaign.startsAt)) {
        return 'upcoming';
    }

    return nowMs < Date.parse(campaign.endsAt) ? 'live' : 'ended';
}

/**
 * The phase a page shows: the one it was rendered in, except that a page
 * rendered live has ended once the reader's clock is past the end. A reader's
 * clock never starts the sale, so a clock running fast cannot attach a code
 * the provider does not take yet.
 */
export function shownPhase(campaign: CampaignData, rendered: CampaignPhase, nowMs: number): CampaignPhase {
    return rendered === 'live' && nowMs >= Date.parse(campaign.endsAt) ? 'ended' : rendered;
}

/**
 * The sale's discount on a purchase, or null when it does not apply: the sale
 * is not live, or the plan or cycle is not one of its own, or the reader's
 * regional discount takes more off. Checkout takes one discount per order, so
 * the reader gets the larger; at the same percentage, the sale's.
 */
export function offerFor(
    campaign: CampaignData | null,
    phase: CampaignPhase | null,
    tier: string,
    cycle: string,
    regionalPercent: number | null,
): CampaignOffer | null {
    if (campaign === null || phase !== 'live' || tier !== campaign.tier || !(campaign.cycles as string[]).includes(cycle)) {
        return null;
    }

    if (regionalPercent !== null && regionalPercent > campaign.percent) {
        return null;
    }

    return { code: campaign.code, percent: campaign.percent, firstChargeOnly: cycle !== 'lifetime' };
}

export interface Remaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

/** Whole time left until `targetMs`, rounded down to the second, never negative. */
export function remaining(targetMs: number, nowMs: number): Remaining {
    const total = Math.max(0, Math.floor((targetMs - nowMs) / 1000));

    return {
        days: Math.floor(total / 86_400),
        hours: Math.floor((total % 86_400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
    };
}

export interface CalendarEvent {
    summary: string;
    description: string;
    url: string;
}

const icsText = (value: string): string => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

const icsTime = (iso: string): string => new Date(Date.parse(iso)).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// A half-hour event at the sale's start with an alert, as a data: URL, so the link works without JavaScript and sends nothing anywhere.
export function calendarHref(campaign: CampaignData, event: CalendarEvent): string {
    const start = icsTime(campaign.startsAt);
    const end = icsTime(new Date(Date.parse(campaign.startsAt) + 30 * 60_000).toISOString());
    const host = new URL(event.url).host;
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//TablePro//Sale//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${campaign.id}@${host}`,
        `DTSTAMP:${start}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${icsText(event.summary)}`,
        `DESCRIPTION:${icsText(event.description)}`,
        `URL:${event.url}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${icsText(event.summary)}`,
        'TRIGGER:PT0M',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ];

    return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n') + '\r\n')}`;
}
