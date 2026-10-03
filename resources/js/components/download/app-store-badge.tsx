import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { renderAppStoreBadge } from './app-store-badge-view';

interface AppStoreBadgeProps {
    /** The App Store listing, from platforms.json. */
    href: string;
    /** `download_click` location. */
    location: string;
}

/**
 * Apple's "Download on the App Store" badge, at Apple's minimum 40px height,
 * in the page's language: Apple's English badge on English pages, its
 * Vietnamese one ("Tải về trên App Store") on Vietnamese pages.
 *
 * The artwork is the unmodified file in public/images (Apple's guidelines
 * forbid altering it); app-store-badge-view.ts names the file for each locale.
 * `-light` is the black badge shown on the light theme and `-dark` the white
 * one for the dark theme, switched by the site's `.dark` class, never by the OS
 * media query, so it follows the reader's explicit theme choice. Both images
 * are lazy: a lazy image under `display: none` is never fetched, so only the
 * visible one loads.
 *
 * The accessible name is `download.ios.badge`, the artwork's visible text in
 * the same language, so the badge and its label cannot be set apart by a
 * caller.
 *
 * An `<img>`, never inlined SVG: the artwork relies on default fills and both
 * files carry the same element id.
 */
export default function AppStoreBadge({ href, location }: AppStoreBadgeProps) {
    const { locale, m } = useI18n();

    return renderAppStoreBadge({ href, locale, label: m.download.ios.badge, onClick: () => trackDownload(location, 'ios') });
}
