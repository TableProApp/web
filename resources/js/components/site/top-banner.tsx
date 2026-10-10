import LanguageBar from '@/components/site/language-bar';
import SupportBanner from '@/components/site/support-banner';

/**
 * The slot above the sticky header: one 40px bar at a time, scrolling away
 * with the page (design-system §5.3.17).
 *
 * - The license banner (`SupportBanner`), on most pages, unless this browser
 *   closed it. `html.has-banner`, stamped by the server.
 * - The language bar (`LanguageBar`), when the reader likely reads another
 *   language this page exists in. `html.has-language-bar`, added only in
 *   the reader's browser, so the cached HTML is the same for everyone.
 *
 * When both apply, the language bar shows and the license banner waits: a
 * reader who cannot read the page has no use for a sentence in its language.
 * Which one shows, and the height they share (`--banner-h`), is CSS settled
 * before first paint (app.css), never React state, so neither flashes.
 */
export default function TopBanner() {
    return (
        <>
            <SupportBanner />
            <LanguageBar />
        </>
    );
}
