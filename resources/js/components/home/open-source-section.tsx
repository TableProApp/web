import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { FACTS, publisherValues } from '@/lib/data/facts';
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
 * The AGPL sentence, the funding sentence and who makes it, the about page,
 * the source on GitHub and the Product Hunt page, then the same two actions
 * as the hero with their availability lines, and the availability summary
 * from platforms.json.
 *
 * Product Hunt is a plain text link, by the owner's decision (spec §0): no
 * badge image and no hotlink, so the page makes no request to Product Hunt
 * (`ThirdParty/ScriptsTest`). It sits after GitHub, away from the download
 * actions.
 */
export default function OpenSourceSection({ content, availability }: OpenSourceSectionProps) {
    const { locale, m, fmt } = useI18n();

    return (
        <Section id="open-source" title={content.title} flush>
            <div className="max-w-[44rem]">
                <p className="type-body text-foreground">{content.body}</p>
                <p className="type-body mt-4 text-foreground">{fmt(content.maker, publisherValues(locale))}</p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    <li>
                        <LocaleLink href="/about" className={textLinkClasses('standalone')}>
                            {content.about}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    </li>
                    <li>
                        <TextLink href={FACTS.links.github} kind="standalone" external>
                            {content.github}
                        </TextLink>
                    </li>
                    <li>
                        <TextLink href={FACTS.links.productHunt} kind="standalone" external>
                            {content.productHunt}
                        </TextLink>
                    </li>
                </ul>
            </div>

            <p className="type-body mt-10 font-medium text-foreground">{fmt(m.platforms.availability.summary, { deviceList: availability.deviceList })}</p>
            <PlatformActions location="footer-cta" availability={availability} className="mt-6" />
        </Section>
    );
}
