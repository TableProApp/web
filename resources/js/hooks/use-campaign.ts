import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { offerFor, shownPhase, type CampaignOffer, type CampaignPhase } from '@/lib/campaign';
import { PRICING } from '@/lib/data/pricing';
import type { CampaignProp } from '@/types/shared-props';

export interface CampaignState {
    /** The window's dates in the page's language, from the server. Null when pricing.json names no sale. */
    prop: CampaignProp | null;
    phase: CampaignPhase | null;
    /** The sale's discount on a purchase, or null where it does not apply (`offerFor`). */
    offer: (tier: string, cycle: string, regionalPercent: number | null) => CampaignOffer | null;
}

/**
 * The dated sale as this page shows it.
 *
 * The first render uses the phase the server rendered the page in, so the
 * cached HTML and hydration agree. After that the reader's clock can only end
 * the sale (`shownPhase`): when a page rendered live outlives the end, in an
 * open tab or one restored from history, the phase turns to `ended` at that
 * instant, everything the sale added leaves the page with `campaign-live`
 * (app.css), and checkout stops attaching the code. The next visit brings the
 * server's phase again.
 */
export function useCampaign(): CampaignState {
    const prop = usePage().props.campaign;
    const campaign = PRICING.campaign;
    const rendered = prop?.phase ?? null;
    const [phase, setPhase] = useState<CampaignPhase | null>(rendered);

    useEffect(() => {
        if (campaign === null || rendered === null) {
            setPhase(rendered);

            return;
        }

        let timer = 0;

        // Re-armed until the end: a timer can fire a moment early against the wall clock, and a hidden tab's timers are throttled.
        const check = (): void => {
            window.clearTimeout(timer);

            const now = shownPhase(campaign, rendered, Date.now());
            setPhase(now);

            if (now === 'live') {
                timer = window.setTimeout(check, Math.min(Math.max(Date.parse(campaign.endsAt) - Date.now(), 0), 2 ** 31 - 1));
            }
        };

        check();
        document.addEventListener('visibilitychange', check);
        window.addEventListener('pageshow', check);

        return () => {
            window.clearTimeout(timer);
            document.removeEventListener('visibilitychange', check);
            window.removeEventListener('pageshow', check);
        };
    }, [campaign, rendered]);

    return {
        prop,
        phase,
        offer: (tier, cycle, regionalPercent) => offerFor(campaign, phase, tier, cycle, regionalPercent),
    };
}

/**
 * Asks the server for this page again once the sale has started, when the
 * page was rendered before it: a reader waiting on it sees the sale arrive.
 *
 * The reader's clock only decides when to ask; the server's answer decides
 * the phase, so a clock running ahead asks again every half minute until the
 * server agrees. An Inertia visit bypasses the edge cache (docs/deployment.md).
 * Called once per page, by `TopBanner`.
 */
export function useCampaignStart(): void {
    const rendered = usePage().props.campaign?.phase ?? null;
    const campaign = PRICING.campaign;

    useEffect(() => {
        if (campaign === null || rendered !== 'upcoming') {
            return;
        }

        let timer = 0;

        const wait = (): void => {
            const left = Date.parse(campaign.startsAt) - Date.now();

            if (left > 0) {
                // A timer longer than 2^31 - 1 ms fires at once, so a page open weeks ahead waits in steps.
                timer = window.setTimeout(wait, Math.min(left + 1000, 2 ** 31 - 1));

                return;
            }

            router.reload();
            timer = window.setTimeout(wait, 30_000);
        };

        wait();

        return () => window.clearTimeout(timer);
    }, [campaign, rendered]);
}
