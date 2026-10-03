import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { cn } from '@/lib/utils';
import AppStoreBadge from './app-store-badge';
import { requirementLine } from './format';
import type { DownloadContent, IosProp } from './types';

interface IosCardProps {
    content: DownloadContent;
    ios: IosProp;
    className?: string;
}

/**
 * The iPhone and iPad card (`#ios`): the App Store badge, the requirement, the
 * price facts, and a link to `/ios`, where the app's own scope is explained.
 * It is a separate app, not a copy of the Mac app, and the card says so.
 *
 * Every fact here is from platforms.json. The App Store URL has no country
 * segment, so Apple sends each reader to their own storefront.
 */
export default function IosCard({ content, ios, className }: IosCardProps) {
    const { m, fmt } = useI18n();
    const devices = joinList(ios.deviceNames, m.common.list);

    return (
        <section id="ios" aria-labelledby="ios-title" className={cn('scroll-mt-24 rounded-panel border border-rule bg-raised p-5 sm:p-6', className)}>
            <h2 id="ios-title" className="type-h3 text-foreground">
                {devices}
            </h2>
            <p className="type-small mt-1 text-muted-foreground">
                {fmt(m.platforms.requires, { requirement: requirementLine(ios.requirements, m.platforms) })}
            </p>

            {ios.appStoreUrl !== null && (
                <div className="mt-6">
                    <AppStoreBadge href={ios.appStoreUrl} location="download-page" />
                </div>
            )}

            {ios.free && !ios.inAppPurchases && <p className="type-small mt-2 text-muted-foreground">{m.platforms.free}</p>}

            <p className="type-body mt-6 text-foreground">{fmt(content.ios.body, { devices })}</p>
            <p className="mt-3">
                <LocaleLink href="/ios" className={textLinkClasses('standalone')}>
                    {fmt(content.ios.link, { devices })}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
            </p>
        </section>
    );
}
