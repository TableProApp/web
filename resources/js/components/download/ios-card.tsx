import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList, keepTogether } from '@/i18n/format';
import AppStoreBadge from './app-store-badge';
import { requirementLine } from './format';
import PlatformCard from './platform-card';
import type { DownloadContent, IosProp } from './types';

interface IosCardProps {
    content: DownloadContent;
    ios: IosProp;
    marked: boolean;
    className?: string;
}

// The App Store URL has no country segment, so Apple sends each reader to their own storefront.
export default function IosCard({ content, ios, marked, className }: IosCardProps) {
    const { m, fmt } = useI18n();
    const devices = joinList(ios.deviceNames, m.common.shortList);
    const version =
        ios.version !== null
            ? ios.publishedAtFormatted !== null
                ? fmt(m.download.release.dated, { version: ios.version, date: keepTogether(ios.publishedAtFormatted) })
                : fmt(m.download.release.undated, { version: ios.version })
            : null;

    return (
        <PlatformCard
            id="ios"
            name={devices}
            marked={marked}
            version={version}
            className={className}
            action={ios.appStoreUrl !== null && <AppStoreBadge href={ios.appStoreUrl} location="download-page" />}
            details={<DotList items={[ios.free && !ios.inAppPurchases && m.platforms.free, requirementLine(ios.requirements, m.platforms)]} />}
            updates={m.download.card.updates.ios}
        >
            <p>
                <LocaleLink href="/ios" className={textLinkClasses('standalone')}>
                    {fmt(content.ios.link, { devices })}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
            </p>
        </PlatformCard>
    );
}
