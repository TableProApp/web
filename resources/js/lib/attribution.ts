/**
 * Where a reader came from, kept until the moment they buy.
 *
 * Plausible already reports the source of a *visit*. What it cannot report is
 * the source of a *sale*: the sale completes on the payment provider's overlay,
 * on a domain Plausible does not measure, minutes after the click, and the
 * license is written by the TablePro backend — none of which this app can see.
 *
 * `POST /checkout` is the one moment the two halves touch. So the acquisition
 * source is resolved here, in the browser, and handed over in that request
 * body for the backend to store against the license. See "Purchase
 * attribution" in docs/architecture.md for the other end of that contract.
 *
 * **First-touch, deliberately.** A reader finds the site through a blog post,
 * comes back a fortnight later by typing the domain, and buys. Last-touch calls
 * that sale "direct" and the post that actually earned it is credited with
 * nothing. First-touch answers the question that gets asked — where did this
 * customer come from — so the first attributable visit wins and is never
 * overwritten while it is still inside the window below.
 *
 * Held in `localStorage` because this app has no session and sets no cookies.
 * That storage is writable by the reader, so nothing read back from it is
 * trusted: `parseStored` rebuilds a fixed set of keys at a fixed length rather
 * than passing the parsed object through to the request body.
 */

/**
 * Ninety days, matching the newsletter prompt's `nl_dismissed_at`. Long enough
 * to cover the gap between reading a comparison page and buying, short enough
 * that a source stops being credited for a decision it had no part in.
 */
export const ATTRIBUTION_TTL_DAYS = 90;

export const ATTRIBUTION_STORAGE_KEY = 'tablepro:attribution';

/**
 * Length caps. Both checkout providers put the payload in their own metadata
 * bag — Polar's is 500 characters a value — and a campaign tag is a label, not
 * a document. Clamping here means an over-long tag is never the backend's
 * problem, and never the reason a checkout session fails to open.
 */
const MAX_TAG = 128;
const MAX_URL = 256;

const TTL_MS = ATTRIBUTION_TTL_DAYS * 24 * 60 * 60 * 1000;

/**
 * @property source        utm_source, or a bare `?ref=` when there is no utm_source.
 * @property medium        utm_medium.
 * @property campaign      utm_campaign.
 * @property term          utm_term.
 * @property content       utm_content.
 * @property referrer      Origin and path of an off-site referrer, query string dropped.
 * @property landing_page  Path of the first attributable page, without its query string.
 * @property first_seen_at ISO 8601 timestamp of that first attributable visit.
 */
export interface Attribution {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    referrer?: string;
    landing_page: string;
    first_seen_at: string;
}

export interface Visit {
    /** The full URL landed on, query string included. */
    url: string;
    /** `document.referrer` — empty for a typed URL or a stripped referrer. */
    referrer: string;
    now: Date;
}

/** The optional keys, in payload order. Exported so the contract test can read them. */
export const ATTRIBUTION_TAGS = ['source', 'medium', 'campaign', 'term', 'content', 'referrer'] as const;

function clamp(value: string, max: number): string {
    const trimmed = value.trim();

    return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/**
 * The referrer, when it came from somewhere that is not this site.
 *
 * The query string is dropped on purpose: a referrer can carry the search that
 * found us, and that is the reader's text, not ours to forward to a payment
 * provider. Host and path are what identify the source.
 */
function externalReferrer(referrer: string, host: string): string | undefined {
    if (referrer === '') {
        return undefined;
    }

    let url: URL;

    try {
        url = new URL(referrer);
    } catch {
        return undefined;
    }

    if (url.hostname === host) {
        return undefined;
    }

    return clamp(url.origin + (url.pathname === '/' ? '' : url.pathname), MAX_URL);
}

/**
 * What this visit says about where the reader came from, or null when it says
 * nothing.
 *
 * Null is the important case. A visit with no campaign tags and no off-site
 * referrer is someone typing the domain or following a bookmark, and recording
 * that as "direct" would take the slot a real campaign click needs later — the
 * reader who arrives direct today and through a comparison page tomorrow would
 * be credited to nobody. Unattributable visits are not stored at all.
 */
export function readVisit(visit: Visit): Attribution | null {
    let url: URL;

    try {
        url = new URL(visit.url);
    } catch {
        return null;
    }

    const tag = (name: string): string | undefined => {
        const raw = url.searchParams.get(name);

        if (raw === null) {
            return undefined;
        }

        const value = clamp(raw, MAX_TAG);

        return value === '' ? undefined : value;
    };

    /*
     * `ref` as a fallback for `utm_source`, because that is the shape the
     * neighbourhood uses: every link in `sponsor-row.tsx` goes out as
     * `?ref=tablepro`, and the sites carrying a link back send it the same way.
     * Only consulted when there is no utm_source, so a properly tagged link is
     * never second-guessed.
     */
    const found = {
        source: tag('utm_source') ?? tag('ref'),
        medium: tag('utm_medium'),
        campaign: tag('utm_campaign'),
        term: tag('utm_term'),
        content: tag('utm_content'),
        referrer: externalReferrer(visit.referrer, url.hostname),
    };

    if (ATTRIBUTION_TAGS.every((key) => found[key] === undefined)) {
        return null;
    }

    const attribution: Attribution = {
        landing_page: clamp(url.pathname, MAX_URL),
        first_seen_at: visit.now.toISOString(),
    };

    for (const key of ATTRIBUTION_TAGS) {
        const value = found[key];

        if (value !== undefined) {
            attribution[key] = value;
        }
    }

    return attribution;
}

function hasExpired(attribution: Attribution, now: Date): boolean {
    const first = Date.parse(attribution.first_seen_at);

    if (Number.isNaN(first)) {
        return true;
    }

    return now.getTime() - first > TTL_MS;
}

/**
 * First-touch resolution: a stored record inside the window is returned
 * unchanged, and only a lapsed or absent one gives way to this visit.
 *
 * Returns the same object reference it was given when nothing changed, which is
 * what lets the caller skip a pointless write on every page load.
 */
export function resolveAttribution(stored: Attribution | null, visit: Visit): Attribution | null {
    if (stored !== null && ! hasExpired(stored, visit.now)) {
        return stored;
    }

    return readVisit(visit);
}

/**
 * Rebuilds a record from stored JSON, or null if it is unusable.
 *
 * Deliberately not a cast. This comes out of storage the reader can edit, and
 * it ends up in a request body that the backend forwards to a payment
 * provider, so the keys are whitelisted and the values re-clamped rather than
 * trusted for being well-formed JSON.
 */
export function parseStored(raw: string | null): Attribution | null {
    if (raw === null) {
        return null;
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }

    if (typeof parsed !== 'object' || parsed === null) {
        return null;
    }

    const record = parsed as Record<string, unknown>;

    if (typeof record.landing_page !== 'string' || typeof record.first_seen_at !== 'string') {
        return null;
    }

    const attribution: Attribution = {
        landing_page: clamp(record.landing_page, MAX_URL),
        first_seen_at: clamp(record.first_seen_at, MAX_TAG),
    };

    for (const key of ATTRIBUTION_TAGS) {
        const value = record[key];

        if (typeof value === 'string' && value.trim() !== '') {
            attribution[key] = clamp(value, key === 'referrer' ? MAX_URL : MAX_TAG);
        }
    }

    return attribution;
}

/**
 * `window.localStorage`, or null wherever touching it throws.
 *
 * The property access itself is what throws in a private window, before any
 * read happens — the same reason the banner script in `app.blade.php` wraps
 * its `getItem`.
 */
function storage(): Storage | null {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

/**
 * Records this visit's source if it is the first attributable one.
 *
 * Called once at boot, which is enough: a tagged link is always a full document
 * load, so no Inertia client navigation can carry a campaign tag that this
 * misses. SSR has no window and no reader, so it returns early there.
 */
export function captureAttribution(): void {
    if (typeof window === 'undefined') {
        return;
    }

    const store = storage();

    if (store === null) {
        return;
    }

    let stored: Attribution | null;

    try {
        stored = parseStored(store.getItem(ATTRIBUTION_STORAGE_KEY));
    } catch {
        return;
    }

    const resolved = resolveAttribution(stored, {
        url: window.location.href,
        referrer: document.referrer,
        now: new Date(),
    });

    try {
        if (resolved === null) {
            if (stored !== null) {
                store.removeItem(ATTRIBUTION_STORAGE_KEY);
            }

            return;
        }

        // Unchanged first touch: the common case on every page after the first.
        if (resolved === stored) {
            return;
        }

        store.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(resolved));
    } catch {
        // Blocked or full storage. Losing an analytics record is always
        // preferable to a page that throws on load.
    }
}

/** The stored first touch if it is still inside the window, for the checkout body. */
export function currentAttribution(): Attribution | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const store = storage();

    if (store === null) {
        return null;
    }

    try {
        const stored = parseStored(store.getItem(ATTRIBUTION_STORAGE_KEY));

        if (stored === null || hasExpired(stored, new Date())) {
            return null;
        }

        return stored;
    } catch {
        return null;
    }
}
