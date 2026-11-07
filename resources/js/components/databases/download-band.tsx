import ActionPair from '@/components/download/action-pair';
import { requirementLine } from '@/components/download/format';
import { distributionsText } from '@/components/download/linux-text';
import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import type { DatabaseLabels, DatabasePlatforms } from './types';

interface DownloadBandProps {
    labels: DatabaseLabels;
    platforms: DatabasePlatforms;
    // Where the iPhone and iPad app offers the engine, or on the hub.
    showIos: boolean;
    // Where the Linux app's suites test the engine, or on the hub.
    showLinux: boolean;
    appStoreUrl: string | null;
    // `download_click` location of every action in the band.
    location: string;
}

export default function DownloadBand({ labels, platforms, showIos, showLinux, appStoreUrl, location }: DownloadBandProps) {
    const { m, fmt } = useI18n();
    const ios = showIos && platforms.ios !== null && appStoreUrl !== null ? platforms.ios : null;
    const linux = showLinux ? platforms.linux : null;

    if (platforms.mac === null) {
        return null;
    }

    const lead = [labels.download.mac, linux !== null && labels.download.linux, ios !== null && labels.download.ios].filter(Boolean).join(' ');

    return (
        <Section id="get-tablepro" title={labels.download.title} lead={lead}>
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
                linux={
                    linux !== null
                        ? { caption: <DotList items={[linux.channel === 'beta' && m.download.panel.beta, distributionsText(linux, m.download)]} /> }
                        : null
                }
            />
            <p className="mt-8">
                <LocaleLink href="/pricing" className={textLinkClasses('standalone')}>
                    {labels.download.pricing}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
            </p>
        </Section>
    );
}
