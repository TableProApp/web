import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import { BandFrame } from '@/components/features/feature-band';
import { ClosingFrame } from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import SEOHead from '@/components/seo/seo-head';
import { SUPPORT_EMAIL } from '@/components/site/site-links';
import SponsorLink from '@/components/sponsors/sponsor-link';
import { buttonClasses } from '@/components/ui/button';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import { textLinkClasses } from '@/components/ui/text-link';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { FACTS } from '@/lib/data/facts';
import { SPONSORS, type Placement } from '@/lib/data/sponsors';
import { openSlots } from '@/lib/sponsors';
import LandingLayout from '@/layouts/landing-layout';

type SponsorsContent = typeof import('@data/content/en/sponsors.json');

interface SponsorsProps {
    content: SponsorsContent;
    organizationProfiles: string[];
}

// The sections this page had before each tier became a band.
const ALSO: Record<Placement, string[]> = { lead: ['tiers'], homepage: ['companies'], name: ['individuals'] };

const NAME_LINK = 'text-[1.0625rem] font-medium tracking-[-0.011em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground';

// One band per tier, dearest first: the name and both prices on the left, that tier's sponsors on the right. No amount
// per sponsor, no total and no goal.
export default function Sponsors({ content, organizationProfiles }: SponsorsProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, plural, path, format } = useI18n();
    useRevealOnScroll('main > section:not(#top)');

    const usd = (amount: number): string => format.formatUsd(amount, m.pricing.currency);
    const total = SPONSORS.homepageSlots;
    const open = openSlots(SPONSORS);
    const places = open > 0 ? plural(content.places.open, open, { total }) : fmt(content.places.full, { total });
    const tiers = [...SPONSORS.tiers].sort((a, b) => b.monthly - a.monthly);
    const values = { multiplier: SPONSORS.oneTime.multiplier, months: SPONSORS.oneTime.months, email: SUPPORT_EMAIL };

    const tags = {
        open: (text: string) => <span className="font-medium text-foreground">{text}</span>,
        email: (text: string) => (
            <a href={`mailto:${SUPPORT_EMAIL}`} className={textLinkClasses('inline')}>
                {text}
            </a>
        ),
    };

    const github = (
        <a href={FACTS.links.sponsorsProgram} className={buttonClasses('primary', 'lg', 'min-w-36')}>
            {content.header.action}
            <span aria-hidden="true">↗</span>
        </a>
    );

    const sponsorsIn = (placement: Placement): ReactNode => {
        const sponsors = SPONSORS.sponsors.filter((sponsor) => sponsor.placement === placement);

        if (sponsors.length === 0) {
            return undefined;
        }

        return (
            <ul className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6 sm:gap-x-14 sm:gap-y-10">
                {sponsors.map((sponsor) => (
                    <li key={sponsor.id}>
                        {sponsor.logo === null ? (
                            <a href={sponsor.url} rel="sponsored noopener" translate="no" className={NAME_LINK}>
                                {sponsor.name}
                            </a>
                        ) : (
                            <SponsorLink sponsor={sponsor} size="page" />
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: content.breadcrumb, path: path('/sponsors') },
    ];

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                description={content.seo.description}
                jsonLd={plainPageJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    path: path('/sponsors'),
                    name: content.seo.title,
                    description: content.seo.description,
                    crumbs,
                    organization: { description: m.seo.product.short, sameAs: organizationProfiles },
                })}
            />

            <FeatureHero
                title={content.header.title}
                lead={content.header.lead}
                primary={
                    <>
                        {github}
                        <span className="text-[0.9375rem] leading-[1.4] text-muted-foreground">{places}</span>
                    </>
                }
            />

            {tiers.map((tier) => {
                const copy = content.tiers.items[tier.placement];
                const sponsors = sponsorsIn(tier.placement);

                return (
                    <BandFrame
                        key={tier.placement}
                        id={tier.placement}
                        also={ALSO[tier.placement]}
                        title={copy.title}
                        marker={
                            <p className="mt-3 text-[0.9375rem] leading-[1.5] tabular-nums">
                                <span className="block font-medium text-foreground">{fmt(content.tiers.monthly, { price: usd(tier.monthly) })}</span>
                                <span className="block text-muted-foreground">{fmt(content.tiers.oneTime, { price: usd(tier.monthly * SPONSORS.oneTime.multiplier) })}</span>
                            </p>
                        }
                    >
                        <p className="text-[1.0625rem] leading-[1.55] tracking-[-0.011em] text-pretty text-muted-foreground">
                            {sponsors === undefined ? <Trans text={content.tiers.open} tags={tags} values={{ benefit: copy.benefit }} /> : copy.benefit}
                        </p>
                        {tier.placement === 'homepage' && <p className="mt-2 text-[0.9375rem] leading-[1.5] text-muted-foreground">{places}</p>}
                        {sponsors}
                    </BandFrame>
                );
            })}

            <BandFrame id="fine-print" title={content.finePrint.title}>
                <DescriptionList>
                    {content.finePrint.rows.map((row) => (
                        <DescriptionItem key={row.term} term={row.term} size="body">
                            <Trans text={row.text} values={values} />
                        </DescriptionItem>
                    ))}
                </DescriptionList>
            </BandFrame>

            <ClosingFrame id="sponsor" title={content.closing.title} sentence={<Trans text={content.closing.sentence} tags={tags} values={values} />}>
                {github}
            </ClosingFrame>
        </LandingLayout>
    );
}
