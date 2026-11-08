import { usePage } from '@inertiajs/react';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import { BandFrame } from '@/components/features/feature-band';
import { ClosingFrame } from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import { INQUIRY_SUBJECT } from '@/components/pricing/enterprise-row';
import PricingPlans from '@/components/pricing/pricing-plans';
import SEOHead from '@/components/seo/seo-head';
import { SUPPORT_EMAIL } from '@/components/site/site-links';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import { buttonClasses } from '@/components/ui/button';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, Trans, useI18n, type Values } from '@/i18n';
import { FACTS } from '@/lib/data/facts';
import { examplesText } from '@/lib/data/paid-features';
import { PRICING } from '@/lib/data/pricing';
import LandingLayout from '@/layouts/landing-layout';

type TeamsContent = typeof import('@data/content/en/teams.json');

interface TeamsProps {
    content: TeamsContent;
    organizationProfiles: string[];
}

interface Row {
    term: string;
    text: string;
}

const WINDOW_SIZES = '(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)';
const LINK = 'text-[0.9375rem] font-medium tracking-[-0.009em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground';

// `/teams` in every locale: what a seat and the plan include, the Team card, then seats, buying and data as rows.
// Every number comes from pricing.json or facts.json. Inquiries share the Enterprise row's subject so they can be counted.
export default function Teams({ content, organizationProfiles }: TeamsProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, plural, path } = useI18n();
    const shown = useShownSlot();
    useRevealOnScroll('main > section:not(#top)');

    const team = PRICING.tiers.team;
    const contact = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(INQUIRY_SUBJECT)}`;

    const values: Values = {
        deviceLimit: PRICING.license.deviceLimit,
        inviteDays: FACTS.account.teamInviteDays,
        merchant: PRICING.merchantOfRecord.name,
        refundDays: PRICING.refund.days,
        email: SUPPORT_EMAIL,
        proExamples: examplesText('starter', m.common.list),
    };

    const tags = {
        email: (text: string) => (
            <a href={`mailto:${SUPPORT_EMAIL}`} className={textLinkClasses('inline')}>
                {text}
            </a>
        ),
    };

    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: content.breadcrumb, path: path('/teams') },
    ];

    const columns = [
        { ...content.includes.seat, href: '/pricing#features', extra: [] },
        {
            ...content.includes.team,
            href: '/features/sync-and-teams#team',
            extra: [{ name: m.pricing.prioritySupport.name, text: plural(m.pricing.prioritySupport.detail, team.prioritySupport.responseBusinessDays) }],
        },
    ];

    const rows = (items: Row[]) => (
        <DescriptionList>
            {items.map((row) => (
                <DescriptionItem key={row.term} term={row.term} size="body">
                    <Trans text={row.text} tags={tags} values={values} />
                </DescriptionItem>
            ))}
        </DescriptionList>
    );

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                description={content.seo.description}
                jsonLd={plainPageJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    path: path('/teams'),
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
                    <a href="#price" className={buttonClasses('primary', 'lg', 'min-w-36')}>
                        {content.header.pricing}
                    </a>
                }
                docs="/features/team"
                docsLabel={content.header.docs}
            >
                {shown('features-sync-and-teams-team') !== null ? (
                    <AssetSlot id="features-sync-and-teams-team" sizes={WINDOW_SIZES} caption={false} priority />
                ) : undefined}
            </FeatureHero>

            <BandFrame id="includes" also={['share']} title={content.includes.title}>
                <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-10">
                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-sm leading-[1.3] font-medium tracking-[-0.006em] text-muted-foreground">{column.title}</h3>
                            <ul className="mt-5 space-y-6">
                                {[...column.items.map((item) => ({ name: fmt(item.name, values), text: fmt(item.text, values) })), ...column.extra].map((item) => (
                                    <li key={item.name}>
                                        <p className="text-[1.0625rem] leading-[1.35] font-semibold tracking-[-0.012em] text-foreground">{item.name}</p>
                                        <p className="mt-1.5 text-[0.9375rem] leading-[1.55] text-pretty text-muted-foreground">{item.text}</p>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-6">
                                <LocaleLink href={column.href} className={LINK}>
                                    {column.link}
                                </LocaleLink>
                            </p>
                        </div>
                    ))}
                </div>
            </BandFrame>

            <BandFrame id="price" title={content.price.title} marker={<p className="mt-3 max-w-[18rem] text-[0.9375rem] leading-[1.5] text-pretty text-muted-foreground">{content.price.note}</p>}>
                <PricingPlans variant="compact" tiers={['team']} cycles={['monthly', 'yearly']} enterprise={false} className="max-w-[30rem]" />
            </BandFrame>

            <BandFrame id="seats" title={content.seats.title}>
                {rows(content.seats.rows)}
            </BandFrame>

            <BandFrame id="buying" title={content.buying.title}>
                {rows(content.buying.rows)}
            </BandFrame>

            <BandFrame id="data" title={content.data.title}>
                {rows(content.data.rows)}
                <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                    <LocaleLink href="/security" className={LINK}>
                        {content.data.security}
                    </LocaleLink>
                    <LocaleLink href="/privacy" className={LINK}>
                        {content.data.privacy}
                    </LocaleLink>
                </p>
            </BandFrame>

            <ClosingFrame id="enterprise" title={content.enterprise.title} sentence={content.enterprise.sentence}>
                <a href={contact} className={buttonClasses('primary', 'lg', 'min-w-36')}>
                    {content.enterprise.cta}
                </a>
            </ClosingFrame>
        </LandingLayout>
    );
}
