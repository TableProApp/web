/**
 * The link tables the site chrome renders: header, mobile menu and footer
 * (sitemap §B; positioning §10).
 *
 * Paths here are root-relative English paths; `LocaleLink` and `localePath`
 * add the reader's locale. External URLs and the support address come from
 * `resources/data/facts.json`, and the platform pages from
 * `resources/data/platforms.json`, so no URL or device name is typed here.
 */
import facts from '@data/facts.json';
import platformData from '@data/platforms.json';
import { splitLocale } from '@/i18n/paths';
import { LOCALES, type Messages } from '@/i18n';

/** The seven feature pages, in the menu's order (sitemap §B.1). */
export const FEATURE_PAGES = [
    { key: 'querying', href: '/features/querying' },
    { key: 'dataEditing', href: '/features/data-editing' },
    { key: 'schema', href: '/features/schema' },
    { key: 'importExport', href: '/features/import-export' },
    { key: 'aiMcp', href: '/features/ai-mcp' },
    { key: 'connections', href: '/features/connections' },
    { key: 'syncTeams', href: '/features/sync-and-teams' },
] as const satisfies readonly { key: keyof Messages['nav']['featureLinks']; href: string }[];

/** The fields of a released platform the chrome reads, from platforms.json. */
export interface ReleasedPlatform {
    id: string;
    deviceNames: string[];
    page: string | null;
    requirements: { systems: string[]; minVersion: string; displayVersion: string; releaseName: string | null };
    destinations: { kind: string; url?: string }[];
}

/** A released platform by id, or null when it is not released (or not in the file). */
export function releasedPlatform(id: string): ReleasedPlatform | null {
    const platform = platformData.platforms.find((candidate) => candidate.id === id);

    if (!platform || platform.status !== 'released' || !platform.deviceNames || !platform.requirements || !platform.destinations) {
        return null;
    }

    return {
        id: platform.id,
        deviceNames: platform.deviceNames,
        page: typeof platform.page === 'string' ? platform.page : null,
        requirements: platform.requirements,
        destinations: platform.destinations,
    };
}

export interface PlatformPage {
    id: string;
    href: string;
    /** Apple's product names, never translated: ["iPhone", "iPad"]. */
    deviceNames: string[];
}

/**
 * One link per released platform that has a page of its own: today `/ios`,
 * labelled "iPhone & iPad". The Mac's page is /download, which the header
 * already links. A platform that ships with a page gets its link from data.
 */
export const PLATFORM_PAGES: PlatformPage[] = platformData.platforms.flatMap((candidate) => {
    const platform = releasedPlatform(candidate.id);

    return platform?.page ? [{ id: platform.id, href: platform.page, deviceNames: platform.deviceNames }] : [];
});

/** External destinations, from facts.json. */
export const EXTERNAL = {
    docs: facts.links.docs,
    changelog: facts.links.changelog,
    troubleshooting: facts.links.troubleshooting,
    github: facts.links.github,
    issues: facts.links.issues,
    discussions: facts.links.discussions,
    sponsors: facts.links.sponsorsProgram,
    discord: facts.links.discord,
    x: facts.links.x,
    telegram: facts.links.telegram,
} as const;

export const SUPPORT_EMAIL: string = facts.support.email;

/**
 * The account app, which takes the reader's language from the query and never
 * from a path prefix: nginx sends only the unprefixed `/account` to it.
 */
export function accountHref(locale: string): string {
    return `/account?locale=${locale}`;
}

export type Section = 'features' | 'databases' | 'pricing' | 'blog' | null;

/**
 * The header section the current page belongs to, from its path without the
 * locale prefix. Engine pages (`/mysql-client`, `/redis-gui`) belong to
 * Databases; the platform pages belong to Features, whose menu lists them.
 */
export function sectionOf(url: string): Section {
    const path = splitLocale(url, LOCALES).path.replace(/[?#].*$/, '');

    if (path === '/features' || path.startsWith('/features/') || PLATFORM_PAGES.some((page) => page.href === path)) {
        return 'features';
    }

    if (path === '/databases' || /^\/[a-z0-9-]+-(client|gui)$/.test(path)) {
        return 'databases';
    }

    if (path === '/pricing') {
        return 'pricing';
    }

    if (path === '/blog' || path.startsWith('/blog/')) {
        return 'blog';
    }

    return null;
}

/** The current page's path without its locale prefix, query or fragment. */
export function basePath(url: string): string {
    return splitLocale(url, LOCALES).path.replace(/[?#].*$/, '');
}

export interface HeaderLayout {
    nav: string;
    controls: string;
    menuButton: string;
    // The media query the open menu closes on.
    desktop: string;
}

const HEADER_FROM_1024: HeaderLayout = {
    nav: 'hidden lg:block',
    controls: 'hidden items-center gap-2 lg:flex',
    menuButton: 'lg:hidden',
    desktop: '(min-width: 64rem)',
};

const HEADER_FROM_1152: HeaderLayout = {
    nav: 'hidden min-[72rem]:block',
    controls: 'hidden items-center gap-2 min-[72rem]:flex',
    menuButton: 'min-[72rem]:hidden',
    desktop: '(min-width: 72rem)',
};

// The desktop row is wider than the 960px a 1024px window gives it in these languages
// (fr 1065px, pt-BR 1040, es 1008, de 980, it 965), so they keep the menu button to 1152px.
export const WIDE_HEADER_LOCALES: readonly string[] = ['de', 'es', 'fr', 'it', 'pt-BR'];

export function headerLayout(locale: string): HeaderLayout {
    return WIDE_HEADER_LOCALES.includes(locale) ? HEADER_FROM_1152 : HEADER_FROM_1024;
}

/**
 * The label inside a 64px nav link. The link keeps the full header height as
 * its target, but the focus ring is drawn here, around the words: on the
 * link itself it was a rectangle the height of the header that touched its
 * top edge and crossed its bottom rule (design-system §5.2, §7.2).
 */
export const NAV_LABEL =
    '-mx-1.5 inline-flex items-center gap-1 rounded-control px-1.5 py-1 group-focus-visible:outline-2 group-focus-visible:outline-offset-0 group-focus-visible:outline-focus forced-colors:group-focus-visible:outline-[Highlight]';
