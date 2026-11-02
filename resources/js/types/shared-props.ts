/**
 * The props `HandleInertiaRequests::share()` sends with every page.
 *
 * Registered with Inertia in `./inertia.d.ts`, so `usePage().props` knows
 * them on every page without each page redeclaring them.
 */
import type { Locale } from '@/i18n/types';

/** Head metadata from the PHP page registry. `SEOHead` renders it as it is. */
export interface SeoProp {
    robots: 'index, follow' | 'noindex, follow';
    /** Absolute, self, same locale. Null on pages that are not indexed in this locale. */
    canonical: string | null;
    /** Real translations only, self included. Empty for single-language pages. */
    alternates: { hreflang: string; href: string }[];
    xDefault: string | null;
    ogLocale: string;
    ogLocaleAlternates: string[];
    /** `alt` says what the card shows, in the page's language. */
    ogImage: { url: string; width: number; height: number; type: string; alt: string | null } | null;
    /** The page as markdown (llmstxt.org), on blog posts and legal pages. */
    markdown: string | null;
}

/** One option of the language switcher. */
export interface SwitcherItem {
    locale: Locale;
    /** The language's own name: "English", "Tiếng Việt". */
    native: string;
    hreflang: string;
    /** The equivalent page, or that locale's nearest index when there is none. */
    href: string;
    current: boolean;
    /** True when `href` is not this page's equivalent, so the switcher can say so. */
    fallback: boolean;
}

/**
 * Which banner holds the slot above the header, and its link: the license
 * banner, or the dated sale's while it is live (`App\Support\Banner`). The
 * words are the `banner` and `campaign` catalogs'. Neither can be closed, so
 * there is no version.
 */
export interface BannerProp {
    kind: 'license' | 'campaign';
    href: string;
}

/**
 * The dated sale in pricing.json, as this page was rendered: its phase on the
 * server's clock, and its window's dates in the page's language, in UTC. The
 * code, percentage and cycles are pricing.json's. `useCampaign` checks the
 * phase again on the reader's clock.
 */
export interface CampaignProp {
    phase: CampaignPhase;
    startsOn: string;
    startsAtTime: string;
    endsOn: string;
    endsAtTime: string;
    /** When the struck list prices took effect. */
    listPriceSince: string;
}

export type CampaignPhase = 'upcoming' | 'live' | 'ended';

export interface SharedProps extends Record<string, unknown> {
    canonicalBaseUrl: string;
    locale: Locale;
    localization: {
        switcher: SwitcherItem[];
        /** The locales a language suggestion may offer here: equivalent pages only, never the current one. Empty on error pages. */
        suggestable: Locale[];
    };
    seo: SeoProp;
    banner: BannerProp | null;
    /** Null when pricing.json names no campaign. */
    campaign: CampaignProp | null;
    /** Public website ID, read only by the click-to-load chat helper. */
    crispWebsiteId: string | null;
    /** False in production, where an asset slot with no image renders nothing. */
    assetPlaceholders: boolean;
    // Null until the scheduled refresh has stored a count.
    github: { stars: number | null };
}
