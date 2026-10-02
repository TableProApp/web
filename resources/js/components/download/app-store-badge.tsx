import { trackDownload } from '@/lib/analytics';

interface AppStoreBadgeProps {
    /** The App Store listing, from platforms.json. */
    href: string;
    /** The badge's visible text, which is its accessible name. */
    label: string;
    /** The language of `label`: Apple's badge artwork is English until the owner adds the Vietnamese one. */
    labelLang?: string;
    /** `download_click` location. */
    location: string;
}

/**
 * Apple's "Download on the App Store" badge, at Apple's minimum 40px height.
 *
 * The artwork is the unmodified file in public/images (Apple's guidelines
 * forbid altering it). `-light` is the black badge shown on the light theme and
 * `-dark` the white one for the dark theme, switched by the site's `.dark`
 * class, never by the OS media query, so it follows the reader's explicit
 * theme choice. Both images are lazy: a lazy image under `display: none` is
 * never fetched, so only the visible one loads.
 *
 * An `<img>`, never inlined SVG: the artwork relies on default fills and both
 * files carry the same element id.
 */
export default function AppStoreBadge({ href, label, labelLang, location }: AppStoreBadgeProps) {
    return (
        <a
            href={href}
            lang={labelLang}
            onClick={() => trackDownload(location, 'ios')}
            className="inline-block rounded-chip"
        >
            <img
                src="/images/app-store-light.svg"
                alt={label}
                width={120}
                height={40}
                loading="lazy"
                decoding="async"
                className="block h-10 w-auto dark:hidden"
            />
            <img
                src="/images/app-store-dark.svg"
                alt={label}
                width={120}
                height={40}
                loading="lazy"
                decoding="async"
                className="hidden h-10 w-auto dark:block"
            />
        </a>
    );
}
