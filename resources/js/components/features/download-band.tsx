import AppStoreBadge from '@/components/download/app-store-badge';
import Button from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import { appStoreUrl, architecturesText, iosPlatform, macPlatform, requirementText } from '@/lib/data/platforms';
import type { FeatureLabels } from './types';

interface DownloadBandProps {
    labels: FeatureLabels;
    /** `download_click` location, so the hub and the feature pages count separately. */
    location: string;
}

/**
 * The closing band of a feature page or the hub (design-system §8.2
 * `DownloadBand`): the Mac action with its requirement, the App Store badge
 * with its own, and the way to pricing. Every requirement is rendered from
 * `platforms.json` through the `platforms` catalog, never typed.
 *
 * The page's one primary button lives here; the header's Download is
 * secondary.
 */
export default function DownloadBand({ labels, location }: DownloadBandProps) {
    const { locale, m, path } = useI18n();
    const mac = macPlatform();
    const ios = iosPlatform();
    const store = appStoreUrl();

    return (
        <Section id="get-started" title={labels.download.title} lead={labels.download.body}>
            <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-12">
                <div>
                    <Button
                        href={path('/download')}
                        size="lg"
                        icon={<AppleGlyph className="size-5" />}
                        onClick={() => trackDownload(location, 'mac')}
                    >
                        {m.download.macCta}
                    </Button>
                    <p className="type-small mt-2 text-muted-foreground">
                        {requirementText(mac, m.platforms)} · {architecturesText(m.platforms)}
                    </p>
                </div>
                {store !== '' && (
                    <div>
                        <AppStoreBadge href={store} label={m.download.ios.badge} labelLang={locale === 'en' ? undefined : 'en'} location={location} />
                        <p className="type-small mt-2 text-muted-foreground">
                            {joinList(ios.deviceNames, m.common.list)} · {requirementText(ios, m.platforms)}
                        </p>
                    </div>
                )}
            </div>
            <p className="mt-8">
                <LocaleLink href="/pricing" className={textLinkClasses('standalone')}>
                    {labels.download.pricing}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
            </p>
        </Section>
    );
}
