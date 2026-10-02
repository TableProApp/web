import AppStoreBadge from '@/components/download/app-store-badge';
import { requirementLine } from '@/components/download/format';
import { buttonClasses } from '@/components/ui/button';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import type { DatabaseLabels, PlatformSummary } from './types';

interface DownloadBandProps {
    labels: DatabaseLabels;
    platforms: { mac: PlatformSummary | null; ios: PlatformSummary | null };
    /** Shows the App Store badge: true only where the iPhone and iPad app offers the engine (or on the hub). */
    showIos: boolean;
    appStoreUrl: string | null;
    /** `download_click` location for the Mac action and the badge, so both platforms count from the same place. */
    location: string;
}

/**
 * The closing band of the database pages (design-system §8.3, §8.4): the Mac
 * action with its requirement, and the App Store badge with the iPhone and
 * iPad requirement where the engine opens there. The requirements come from
 * platforms.json through the `platforms` catalog, never typed here.
 */
export default function DownloadBand({ labels, platforms, showIos, appStoreUrl, location }: DownloadBandProps) {
    const { locale, m, fmt } = useI18n();
    const ios = showIos && platforms.ios !== null && appStoreUrl !== null ? platforms.ios : null;

    return (
        <Section id="get-tablepro" title={labels.download.title}>
            <div className="grid gap-8 md:grid-cols-2 md:gap-6">
                {platforms.mac !== null && (
                    <div className="space-y-3">
                        <p className="type-body max-w-[44rem] text-foreground">{labels.download.mac}</p>
                        <LocaleLink href="/download" onClick={() => trackDownload(location, 'mac')} className={buttonClasses('primary', 'md')}>
                            {m.download.macCta}
                        </LocaleLink>
                        <p className="type-small text-muted-foreground">
                            {fmt(m.platforms.requires, { requirement: requirementLine(platforms.mac.requirements, m.platforms) })}
                        </p>
                    </div>
                )}
                {ios !== null && appStoreUrl !== null && (
                    <div className="space-y-3">
                        <p className="type-body max-w-[44rem] text-foreground">{labels.download.ios}</p>
                        <AppStoreBadge
                            href={appStoreUrl}
                            label={m.download.ios.badge}
                            labelLang={locale === 'en' ? undefined : 'en'}
                            location={location}
                        />
                        <p className="type-small text-muted-foreground">{m.platforms.free}</p>
                        <p className="type-small text-muted-foreground">
                            {fmt(m.platforms.requires, { requirement: requirementLine(ios.requirements, m.platforms) })}
                        </p>
                    </div>
                )}
            </div>
        </Section>
    );
}
