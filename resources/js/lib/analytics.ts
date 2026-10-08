import { readConsent } from './consent.ts';

interface GtagWindow {
    gtag?: (command: 'event', name: string, params: Record<string, string>) => void;
}

// Sent only once the reader chose Allow. With no answer, or after Decline, an
// event would still reach Google as a cookieless ping, and the privacy policy
// promises one signal per page and nothing else. Names and parameters are in
// docs/architecture.md, "Analytics and consent".
export function trackEvent(name: string, params: Record<string, string> = {}): void {
    if (typeof window === 'undefined' || readConsent() !== 'granted') {
        return;
    }

    const gtag = (window as unknown as GtagWindow).gtag;

    if (typeof gtag === 'function') {
        gtag('event', name, params);
    }
}

// One event name for every download, so the total survives a layout change. `platform` splits it into Mac and iOS.
export function trackDownload(location: string, platform: 'mac' | 'ios' = 'mac'): void {
    trackEvent('download_click', { location, platform });
}
