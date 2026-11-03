import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import CampaignBanner from '@/components/campaign/campaign-banner';
import LanguageBar from '@/components/site/language-bar';
import SupportBanner from '@/components/site/support-banner';
import { useCampaign, useCampaignStart } from '@/hooks/use-campaign';
import { shownPhase } from '@/lib/campaign';
import { PRICING } from '@/lib/data/pricing';

/**
 * The slot above the sticky header: one 40px bar at a time, scrolling away
 * with the page (design-system §5.3.17).
 *
 * - The dated sale's banner (`CampaignBanner`), while a sale is live, on every
 *   page but the sale's own. `html.has-banner` and `html.campaign-live`,
 *   stamped by the server.
 * - The license banner (`SupportBanner`), on most pages the rest of the time.
 *   `html.has-banner`, stamped by the server.
 * - The language bar (`LanguageBar`), when the reader likely reads another
 *   language this page exists in. `html.has-language-bar`, added only in
 *   the reader's browser, so the cached HTML is the same for everyone.
 *
 * When both apply, the language bar shows and the license banner waits: a
 * reader who cannot read the page has no use for a sentence in its language.
 * Which one shows, and the height they share (`--banner-h`), is CSS settled
 * before first paint (app.css), never React state, so neither flashes.
 *
 * The root classes are stamped on a full load only, so the sale's class
 * follows the phase this page shows (`useCampaign`) from then on: a visit
 * between pages keeps it right, and a sale that ends while the page is open
 * takes it away, with the banner's height when the banner was the sale's.
 */
export default function TopBanner() {
    const { phase } = useCampaign();
    const kind = usePage().props.banner?.kind;
    const live = phase === 'live';

    useCampaignStart();

    useEffect(() => {
        const root = document.documentElement.classList;
        const campaign = PRICING.campaign;

        // Checked on the clock again: the first render carries the server's phase, which the head script may already have ended.
        root.toggle('campaign-live', live && campaign !== null && shownPhase(campaign, 'live', Date.now()) === 'live');

        if (!live && kind === 'campaign') {
            root.remove('has-banner');
        }
    }, [live, kind]);

    return (
        <>
            <CampaignBanner />
            <SupportBanner />
            <LanguageBar />
        </>
    );
}
