/**
 * How long a closed license banner stays closed.
 *
 * The record lives in `localStorage` under `tablepro:banner-dismissed` as
 * `{"version": "3", "until": 1767225600000}`: the banner version the reader
 * closed and the moment it may come back. `version` is `"*"` for a reader who
 * has a license, either because they said so or because they just bought one
 * (the account app's thank-you page writes the same record), which covers every
 * later message too.
 *
 * The root template's head script decides visibility before first paint with
 * the same rule as `isBannerDismissed`; tests/js/banner.test.ts runs that
 * script against this function.
 *
 * Pure apart from the browser globals `dismissBanner` touches, and with no
 * imports, so `node --test` loads it directly.
 */

export const BANNER_STORAGE_KEY = 'tablepro:banner-dismissed';

/** A license holder's record matches every banner version. */
export const ANY_VERSION = '*';

/** Closing the banner hides it this long; the same message may then return. */
export const SNOOZE_DAYS = 30;

/** "Have a license? Hide this", or a purchase, hides it this long, for every version. */
export const LICENSED_DAYS = 365;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DismissalRecord {
    version: string;
    until: number;
}

/** The stored value for a dismissal of `version` that lasts `days` from `now`. */
export function dismissalRecord(version: string, days: number, now: number): string {
    return JSON.stringify({ version, until: now + days * DAY_MS } satisfies DismissalRecord);
}

/**
 * Whether the stored value hides the banner at `version` at `now`. Anything
 * unreadable, including the bare version string earlier releases stored,
 * hides nothing.
 */
export function isBannerDismissed(stored: string | null, version: string, now: number): boolean {
    let record: unknown;

    try {
        record = JSON.parse(stored ?? 'null');
    } catch {
        return false;
    }

    if (record === null || typeof record !== 'object') {
        return false;
    }

    const { version: closed, until } = record as Partial<DismissalRecord>;

    return typeof until === 'number' && until > now && (closed === ANY_VERSION || closed === version);
}

/**
 * Hides the banner now and records it: for `SNOOZE_DAYS` at this version, or
 * for `LICENSED_DAYS` at every version when the reader has a license.
 */
export function dismissBanner(version: string, licensed: boolean): void {
    try {
        window.localStorage.setItem(
            BANNER_STORAGE_KEY,
            licensed ? dismissalRecord(ANY_VERSION, LICENSED_DAYS, Date.now()) : dismissalRecord(version, SNOOZE_DAYS, Date.now()),
        );
    } catch {
        // No storage: the dismissal lasts for this page only.
    }

    document.documentElement.classList.remove('has-banner');
}
