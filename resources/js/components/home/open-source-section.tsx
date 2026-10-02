import Section from '@/components/ui/section';
import TextLink from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { FACTS } from '@/lib/data/facts';
import type { Availability } from './availability';
import PlatformActions from './platform-actions';
import type { HomeContent } from './types';

interface OpenSourceSectionProps {
    content: HomeContent['openSource'];
    availability: Availability;
}

/**
 * Section 10, `#open-source`: "Who builds it, can I read the code, and how do
 * I start?" (sitemap §D; positioning §3.3, §9). On the page background, never
 * the surface band, because the footer follows.
 *
 * The AGPL sentence and the funding sentence, the source on GitHub, then the
 * same two actions as the hero with their availability lines, and the
 * availability summary from platforms.json.
 */
export default function OpenSourceSection({ content, availability }: OpenSourceSectionProps) {
    const { m, fmt } = useI18n();

    return (
        <Section id="open-source" title={content.title}>
            <div className="max-w-[44rem]">
                <p className="type-body text-foreground">{content.body}</p>
                <p className="mt-4">
                    <TextLink href={FACTS.links.github} kind="standalone" external>
                        {content.github}
                    </TextLink>
                </p>
            </div>

            <p className="type-body mt-10 font-medium text-foreground">{fmt(m.platforms.availability.summary, { deviceList: availability.deviceList })}</p>
            <PlatformActions location="footer-cta" availability={availability} className="mt-4" />
        </Section>
    );
}
