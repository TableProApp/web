import ActionPair from '@/components/download/action-pair';
import { requirementLine } from '@/components/download/format';
import DotList from '@/components/ui/dot-list';
import Section from '@/components/ui/section';
import { useI18n } from '@/i18n';
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
 * The closing band of the database pages (design-system §8.3, §8.4): the
 * explanation as the section's lead, then the shared `ActionPair` row: the
 * Mac action with its requirement, and the App Store badge with the iPhone
 * and iPad requirement where the engine opens there. The requirements come
 * from platforms.json through the `platforms` catalog, never typed here.
 */
export default function DownloadBand({ labels, platforms, showIos, appStoreUrl, location }: DownloadBandProps) {
    const { m, fmt } = useI18n();
    const ios = showIos && platforms.ios !== null && appStoreUrl !== null ? platforms.ios : null;

    if (platforms.mac === null) {
        return null;
    }

    return (
        <Section id="get-tablepro" title={labels.download.title} lead={ios !== null ? `${labels.download.mac} ${labels.download.ios}` : labels.download.mac}>
            <ActionPair
                location={location}
                macCaption={fmt(m.platforms.requires, { requirement: requirementLine(platforms.mac.requirements, m.platforms) })}
                ios={
                    ios !== null && appStoreUrl !== null
                        ? {
                              url: appStoreUrl,
                              caption: <DotList items={[m.platforms.free, fmt(m.platforms.requires, { requirement: requirementLine(ios.requirements, m.platforms) })]} />,
                          }
                        : null
                }
            />
        </Section>
    );
}
