import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList, keepTogether } from '@/i18n/format';
import AppStoreBadge from './app-store-badge';
import { requirementLine } from './format';
import PanelFacts from './panel-facts';
import type { DownloadContent, IosProp } from './types';

interface IosPanelProps {
    content: DownloadContent;
    ios: IosProp;
}

// The App Store URL has no country segment, so Apple sends each reader to their own storefront.
export default function IosPanel({ content, ios }: IosPanelProps) {
    const { m, fmt } = useI18n();
    const version =
        ios.version !== null
            ? ios.publishedAtFormatted !== null
                ? fmt(m.download.release.dated, { version: ios.version, date: keepTogether(ios.publishedAtFormatted) })
                : fmt(m.download.release.undated, { version: ios.version })
            : null;

    return (
        <PanelFacts
            action={ios.appStoreUrl !== null && <AppStoreBadge href={ios.appStoreUrl} location="download-page" />}
            lines={[[version, ios.free && !ios.inAppPurchases && m.platforms.free], [requirementLine(ios.requirements, m.platforms)]]}
            updates={m.download.panel.updates.ios}
        >
            <LocaleLink href="/ios" className={textLinkClasses('standalone', 'type-small')}>
                {fmt(content.ios.link, { devices: joinList(ios.deviceNames, m.common.shortList) })}
                <span aria-hidden="true">→</span>
            </LocaleLink>
        </PanelFacts>
    );
}
