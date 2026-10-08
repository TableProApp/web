import type { ReactNode } from 'react';
import AppStoreBadge from '@/components/download/app-store-badge';
import { buttonClasses } from '@/components/ui/button';
import CellGrid from '@/components/ui/cell-grid';
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
    /**
     * Each action in a cell of the page grid, side by side from 640px
     * (design-system §4.7). Only in a wide section, where the cells can reach
     * the rails.
     */
    cells?: boolean;
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
 * The badge is Apple's artwork in the page's language, and its accessible name
 * is that artwork's visible text (see app-store-badge.tsx).
 *
 * The markup is Mac first on every device. On an iPhone or iPad the badge is
 * drawn first (positioning §3.2), from the `ios` class the root template sets
 * before first paint, so nothing moves after the page is shown.
 */
export default function ActionPair({ location, macCaption, macExtra, ios, cells = false, className }: ActionPairProps) {
    const { m } = useI18n();

    const mac = (
        <div className="grid content-start justify-items-start gap-2">
            <LocaleLink href="/download" onClick={() => trackDownload(location, 'mac')} className={buttonClasses('primary', 'lg')}>
                <AppleGlyph className="size-5" />
                {m.download.macCta}
            </LocaleLink>
            <p className="type-small text-muted-foreground">{macCaption}</p>
            {macExtra}
        </div>
    );

    const iosAction = ios !== null && (
        <div className="grid content-start justify-items-start gap-2 in-[.ios]:order-first">
            <div className="flex h-12 items-center">
                <AppStoreBadge href={ios.url} location={location} />
            </div>
            <p className="type-small text-muted-foreground">{ios.caption}</p>
        </div>
    );

    if (cells) {
        return (
            <CellGrid density="compact" className={cn(ios !== null && 'sm:grid-cols-2', className)}>
                {mac}
                {iosAction}
            </CellGrid>
        );
    }

    return (
        <div className={cn('flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-x-10', className)}>
            {mac}
            {iosAction}
        </div>
    );
}
