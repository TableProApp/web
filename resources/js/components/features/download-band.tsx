import ActionPair from '@/components/download/action-pair';
import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList, keepTogether } from '@/i18n/format';
import { appStoreUrl, architecturesText, iosPlatform, macPlatform, requirementText } from '@/lib/data/platforms';
import type { FeatureLabels } from './types';

interface DownloadBandProps {
    labels: FeatureLabels;
    /** `download_click` location, so the hub and the feature pages count separately. */
    location: string;
}

/**
 * The closing band of a feature page or the hub (design-system §8.2
 * `DownloadBand`): the heading and its lead, the shared `ActionPair` row (the
 * Mac action with its requirement, the App Store badge with its own), and the
 * way to pricing. Every requirement is rendered from `platforms.json` through
 * the `platforms` catalog, never typed.
 *
 * The page's one primary button lives here; the header's Download is
 * secondary.
 */
export default function DownloadBand({ labels, location }: DownloadBandProps) {
    const { m } = useI18n();
    const mac = macPlatform();
    const ios = iosPlatform();
    const store = appStoreUrl();

    return (
        <Section id="get-started" title={labels.download.title} lead={labels.download.body}>
            <ActionPair
                location={location}
                macCaption={<DotList items={[requirementText(mac, m.platforms), keepTogether(architecturesText(m.platforms))]} />}
                ios={store !== '' ? { url: store, caption: <DotList items={[joinList(ios.deviceNames, m.common.list), requirementText(ios, m.platforms)]} /> } : null}
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
