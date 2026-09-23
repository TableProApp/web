/**
 * Plausible events, for the handful of places worth counting.
 *
 * Extracted from `footer-cta.tsx`, where it sat as a private function and so
 * could only ever instrument the newsletter form. The page offers five routes
 * to `/download` and none of them were counted, which meant no argument about
 * where a call to action belongs could be settled with anything but taste.
 *
 * Silent when Plausible is absent — the script is not loaded in development and
 * an analytics helper must never be the reason a button stops working.
 */
interface PlausibleWindow {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
}

export function trackEvent(name: string, props: Record<string, string> = {}): void {
    if (typeof window === 'undefined') {
        return;
    }

    const plausible = (window as unknown as PlausibleWindow).plausible;

    if (typeof plausible === 'function') {
        plausible(name, { props });
    }
}

/**
 * One event name for every download, with the section that produced it. Keeping
 * the name constant and varying only the prop is what makes the totals
 * comparable across a layout change.
 *
 * `platform` arrived with the App Store listing. It is a second prop rather than
 * a second event name, and rather than a suffix on `location`, so that the total
 * download count stays one number and the Mac/iOS split is a breakdown of it.
 * The App Store click is the last thing this domain sees — Plausible cannot
 * follow the reader to Apple — so it is the only signal there will be.
 */
export function trackDownload(location: string, platform: 'mac' | 'ios' = 'mac'): void {
    trackEvent('download_click', { location, platform });
}
