import type { ReactNode } from 'react';
import AppStoreBadge from '@/components/download/app-store-badge';
import { buttonClasses } from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface ActionPairProps {
    /** The `download_click` location of both actions. */
    location: string;
    /** The Mac action's availability line: its requirement, the architectures. */
    macCaption: ReactNode;
    /** Under the Mac caption: the hero's "Other ways to install" link. */
    macExtra?: ReactNode;
    /** The App Store listing and its availability line, or null where the iPhone and iPad app does not apply. */
    ios: { url: string; caption: ReactNode } | null;
    className?: string;
}

/**
 * The two ways to get TablePro, each with its availability line under it
 * (design-system §5.1 `DownloadBand`, §5.3.18 `PlatformActions`). Every
 * download band on the site is this one row: the hero and the homepage's
 * closing section, the feature and database pages. Three hand-built copies
 * had drifted apart in button size, glyph and caption spacing.
 *
 * "Download for Mac" is the large primary button with the Apple glyph and
 * goes to /download, which offers both builds; it never starts a download.
 * The App Store badge (40px, Apple's minimum) sits centred in a 48px row, the
 * button's height, so the two captions start on one line. Side by side from
 * 640px, stacked below, each caption under its own action.
 *
 * The badge's accessible name is its visible text. Apple's artwork is English
 * until the owner supplies the Vietnamese badge, so on other locales the link
 * is marked `lang="en"`.
 */
export default function ActionPair({ location, macCaption, macExtra, ios, className }: ActionPairProps) {
    const { locale, m } = useI18n();

    return (
        <div className={cn('flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-x-10', className)}>
            <div className="grid justify-items-start gap-2">
                <LocaleLink href="/download" onClick={() => trackDownload(location, 'mac')} className={buttonClasses('primary', 'lg')}>
                    <AppleGlyph className="size-5" />
                    {m.download.macCta}
                </LocaleLink>
                <p className="type-small text-muted-foreground">{macCaption}</p>
                {macExtra}
            </div>
            {ios !== null && (
                <div className="grid justify-items-start gap-2">
                    <div className="flex h-12 items-center">
                        <AppStoreBadge href={ios.url} label={m.download.ios.badge} labelLang={locale === 'en' ? undefined : 'en'} location={location} />
                    </div>
                    <p className="type-small text-muted-foreground">{ios.caption}</p>
                </div>
            )}
        </div>
    );
}
