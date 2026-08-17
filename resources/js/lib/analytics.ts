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
 */
export function trackDownload(location: string): void {
    trackEvent('download_click', { location });
}
