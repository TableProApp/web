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
    ogImage: { url: string; width: number; height: number; type: string } | null;
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

/** The banner's switch, link and dismissal version; its words are the `banner` catalog's. */
export interface BannerProp {
    href: string;
    version: string;
}

export interface SharedProps {
    canonicalBaseUrl: string;
    locale: Locale;
    localization: { switcher: SwitcherItem[] };
    seo: SeoProp;
    banner: BannerProp | null;
    /** Public website ID, read only by the click-to-load chat helper. */
    crispWebsiteId: string | null;
}
