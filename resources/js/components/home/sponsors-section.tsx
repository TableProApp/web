import SponsorGrid, { SPONSOR_CELL, SPONSOR_LINK } from '@/components/sponsors/sponsor-grid';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { SPONSORS } from '@/lib/data/sponsors';
import { onHomepage, openSlots } from '@/lib/sponsors';
import type { HomeContent } from './types';

// Third on the page by the owner's decision, and compact, so it interrupts the explanation as little as possible.
export default function SponsorsSection({ content }: { content: HomeContent['sponsors'] }) {
    const { plural } = useI18n();
    const open = openSlots(SPONSORS);

    return (
        <Section
            id="sponsors"
            title={content.title}
            titleStyle="h3"
            flush
            aside={
                <LocaleLink href="/sponsors" className={textLinkClasses('standalone')}>
                    {content.link}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
            }
        >
            <SponsorGrid sponsors={onHomepage(SPONSORS)}>
                {open > 0 && (
                    <li className={SPONSOR_CELL}>
                        <LocaleLink href="/sponsors" className={SPONSOR_LINK}>
                            <span className="inline-flex h-11 items-center px-2 text-sm leading-[1.3] font-medium text-accent-text underline-offset-3 group-hover:underline">
                                {content.invite.title}
                            </span>
                            <span className="type-small text-muted-foreground">
                                {plural(content.invite.open, open, { total: SPONSORS.homepageSlots })}
                            </span>
                        </LocaleLink>
                    </li>
                )}
            </SponsorGrid>
        </Section>
    );
}
