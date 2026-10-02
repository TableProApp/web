import type { ReactNode } from 'react';
import AppStoreBadge from '@/components/download/app-store-badge';
import { buttonClasses } from '@/components/ui/button';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { Availability } from './availability';

interface PlatformActionsProps {
    /** The `download_click` location of both actions. */
    location: string;
    availability: Availability;
    /** Under the Mac caption: the hero's "Other ways to install" link. */
    macExtra?: ReactNode;
    className?: string;
}

/**
 * The two ways to get TablePro, each with its own availability line
 * (design-system §5.3.18 PlatformActions; positioning §3.2).
 *
 * "Download for Mac" goes to /download, which offers both builds; it never
 * starts a download. The App Store badge goes straight to the listing. Both
 * render on the server in the same order on every device, side by side from
 * 640px and stacked below, and each caption stays under its own action.
 *
 * The badge's accessible name is its visible text. Apple's artwork is English
 * until the owner supplies the Vietnamese badge, so on other locales the link
 * is marked `lang="en"`.
 */
export default function PlatformActions({ location, availability, macExtra, className }: PlatformActionsProps) {
    const { locale, m } = useI18n();

    return (
        <div className={cn('flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6', className)}>
            <div className="grid justify-items-start gap-2">
                <LocaleLink href="/download" onClick={() => trackDownload(location, 'mac')} className={buttonClasses('primary', 'lg')}>
                    {m.download.macCta}
                </LocaleLink>
                <p className="type-small text-muted-foreground">{availability.macCaption}</p>
                {macExtra}
            </div>
            {availability.appStoreUrl !== null && availability.iosCaption !== null && (
                <div className="grid justify-items-start gap-2 sm:pt-1">
                    <AppStoreBadge
                        href={availability.appStoreUrl}
                        label={m.download.ios.badge}
                        labelLang={locale === 'en' ? undefined : 'en'}
                        location={location}
                    />
                    <p className="type-small text-muted-foreground">{availability.iosCaption}</p>
                </div>
            )}
        </div>
    );
}
