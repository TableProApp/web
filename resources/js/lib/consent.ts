/**
 * The reader's answer to "may Google Analytics set cookies?".
 *
 * `app.blade.php` loads the tag in Consent Mode with every storage type denied,
 * then reads this key before `gtag('config')` so a returning reader who said
 * yes is counted with cookies from their first page view. This module owns the
 * other half: recording the answer, applying it to the running tag, and taking
 * the cookies back when the reader changes their mind.
 *
 * The account portal at `/account` is a different application on the same
 * origin, so it reads the same `localStorage` — one answer covers both, and
 * withdrawing it on either side withdraws it everywhere. Its copy of this file
 * must keep the key identical.
 *
 * Only `analytics_storage` is ever granted. The advertising signals stay denied
 * for everyone because nothing on this site advertises.
 */
export const CONSENT_STORAGE_KEY = 'tablepro:analytics-consent';

/** Dispatched on `window` by the "Cookie settings" controls to reopen the bar. */
export const CONSENT_OPEN_EVENT = 'tablepro:consent-open';

export type ConsentChoice = 'granted' | 'denied';

type Gtag = (command: 'consent', action: 'update', params: Record<string, string>) => void;

/**
 * Anything but the two known values reads as "not asked yet", so a key written
 * by hand, or by an older build, puts the question back rather than being
 * mistaken for an answer.
 */
export function parseChoice(value: string | null): ConsentChoice | null {
    return value === 'granted' || value === 'denied' ? value : null;
}

/**
 * Null when there is no answer, and also when storage throws — a private
 * window refuses outright rather than returning null.
 */
export function readConsent(): ConsentChoice | null {
    try {
        return parseChoice(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    } catch {
        return null;
    }
}

/**
 * The `_ga` cookie and one `_ga_<stream>` per measurement ID. Everything Google
 * Analytics writes starts with that prefix, so this matches its cookies and
 * none of the site's own (`nl_dismissed_at`, `nl_subscribed`).
 */
export function analyticsCookieNames(cookieHeader: string): string[] {
    return cookieHeader
        .split(';')
        .map((pair) => pair.split('=')[0].trim())
        .filter((name) => name === '_ga' || name.startsWith('_ga_'));
}

/**
 * gtag writes to the widest domain the browser accepts — `.tablepro.app` — so
 * that is where they have to be expired. The host-only form is cleared as well
 * for a cookie written before the tag settled on a domain.
 */
function clearAnalyticsCookies(): void {
    const expired = 'Max-Age=0; path=/';

    for (const name of analyticsCookieNames(document.cookie)) {
        document.cookie = `${name}=; ${expired}; domain=.${window.location.hostname}`;
        document.cookie = `${name}=; ${expired}`;
    }
}

/**
 * Records the answer and applies it to the tag already running on this page.
 *
 * Denying after allowing also deletes the cookies. Consent Mode stops gtag
 * reading and writing them, but it leaves the ones already set where they are,
 * and a withdrawal that leaves a two-year identifier behind is not one.
 */
export function saveConsent(choice: ConsentChoice): void {
    try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
        // No storage. The choice holds for this page and is asked again on the next.
    }

    const gtag = (window as unknown as { gtag?: Gtag }).gtag;

    if (typeof gtag === 'function') {
        gtag('consent', 'update', { analytics_storage: choice });
    }

    if (choice === 'denied') {
        clearAnalyticsCookies();
    }
}

/** Reopens the consent bar so a reader can change or withdraw their answer. */
export function openConsentSettings(): void {
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
