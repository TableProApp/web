/**
 * The markup of `<AppStoreBadge>`, as a plain function of the locale.
 *
 * Written with `createElement` rather than JSX so `node --test` can render it
 * through `react-dom/server` with no build step: tests/js/app-store-badge.test.ts
 * renders it in every locale. `app-store-badge.tsx` is the component that binds
 * it to the page's locale, its catalog label and the download event.
 *
 * Imports are relative and type-only, so Node resolves them without the `@/`
 * alias.
 */
import { createElement, type MouseEventHandler, type ReactElement } from 'react';
import type { Locale } from '../../i18n/types.ts';

/** The two theme variants of one locale's badge, as root-relative URLs. */
export interface AppStoreBadgeArtwork {
    /** The black badge, shown on the light theme. */
    light: string;
    /** The white badge, shown on the dark theme. */
    dark: string;
}

/**
 * Apple's badge files in public/images, one pair per locale.
 *
 * Each file is Apple's own artwork for that language, downloaded from Apple
 * Marketing Tools and never edited: `-light` is Apple's black (`blk`) badge and
 * `-dark` its white (`wht`) one. Keyed by `Locale`, so adding a locale fails
 * `npm run typecheck` until its badge is named here.
 */
export const APP_STORE_BADGE_ARTWORK: Record<Locale, AppStoreBadgeArtwork> = {
    en: { light: '/images/app-store-light.svg', dark: '/images/app-store-dark.svg' },
    vi: { light: '/images/app-store-light-vi.svg', dark: '/images/app-store-dark-vi.svg' },
};

export interface AppStoreBadgeViewOptions {
    /** The App Store listing. */
    href: string;
    /** Picks the artwork. */
    locale: Locale;
    /** The accessible name: the visible text of that locale's artwork, in the page's language. */
    label: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/**
 * The link and its two theme images. The label is in the page's language and
 * matches the artwork, so the link carries no `lang` of its own.
 */
export function renderAppStoreBadge({ href, locale, label, onClick }: AppStoreBadgeViewOptions): ReactElement {
    const artwork = APP_STORE_BADGE_ARTWORK[locale];
    const image = (src: string, className: string): ReactElement =>
        createElement('img', { src, alt: label, width: 120, height: 40, loading: 'lazy', decoding: 'async', className });

    return createElement(
        'a',
        { href, onClick, className: 'inline-block rounded-chip' },
        image(artwork.light, 'block h-10 w-auto dark:hidden'),
        image(artwork.dark, 'hidden h-10 w-auto dark:block'),
    );
}
