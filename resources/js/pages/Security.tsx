import { usePage } from '@inertiajs/react';
import { BAND_NOTES, BAND_TEXT } from '@/components/databases/engine-band';
import { useContentTags, type SiteLinks } from '@/components/faq/content-links';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import AreaNav from '@/components/features/area-nav';
import { BandFrame } from '@/components/features/feature-band';
import FeatureHero from '@/components/features/feature-hero';
import { FeatureLinkItem } from '@/components/features/feature-links';
import FactTable, { type FactTableContent } from '@/components/security/fact-table';
import SEOHead from '@/components/seo/seo-head';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, Trans, useI18n, type PluralNode, type Values } from '@/i18n';
import { joinList } from '@/i18n/format';
import LandingLayout from '@/layouts/landing-layout';

// One of `href` (a page here), `docs` (a docs path) or `to` (a key of the `links` prop).
interface SecurityLink {
    label: string;
    href?: string;
    docs?: string;
    to?: string;
}

interface SecurityBand {
    id: string;
    // Ids of the old sections and items that now land on this band.
    also?: string[];
    // The band's name in the topic row; the title states its fact.
    nav: string;
    title: string;
    text: string[];
    table?: FactTableContent;
    // At most two: a limit that changes a decision.
    notes?: string[];
    links: SecurityLink[];
}

interface SecurityContent {
    seo: { title: string; description: string };
    header: { title: string; lead: string };
    breadcrumb: string;
    nav: string;
    labelled: string;
    counts: { businessDays: PluralNode };
    bands: SecurityBand[];
}

interface SecurityLinks extends SiteLinks {
    securityEmail: string | null;
    securityPolicy: string | null;
    securityAdvisory: string | null;
    securityTxt: string;
}

interface SecurityProps {
    content: SecurityContent;
    facts: Record<string, string | string[]>;
    replyDays: number | null;
    links: SecurityLinks;
    organizationProfiles: string[];
}

function target(link: SecurityLink, links: SecurityLinks): string | null {
    return link.to === undefined ? null : (links[link.to as keyof SecurityLinks] ?? null);
}

function BandLink({ link, links }: { link: SecurityLink; links: SecurityLinks }) {
    const url = target(link, links);

    if (url === null) {
        return <FeatureLinkItem link={link} />;
    }

    return (
        <TextLink href={url} kind="standalone" external={url.startsWith('https://')}>
            {link.label}
        </TextLink>
    );
}

// `/security` in every locale (sitemap §A.1, §E.5; design-system §8.23): the topic row, a hero without actions, then one
// band per topic on the feature-page grid, each heading stating its fact, with at most two limits under the text.
export default function Security({ content, facts, replyDays, links, organizationProfiles }: SecurityProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path, plural } = useI18n();
    useRevealOnScroll('main > section:not(#top)');

    const mail = (address: string | null) => (text: string) =>
        address === null ? (
            text
        ) : (
            <a href={`mailto:${address}`} className={textLinkClasses('inline')}>
                {text}
            </a>
        );
    const tags = {
        ...useContentTags(links),
        securityEmail: mail(links.securityEmail),
        advisory: (text: string) =>
            links.securityAdvisory === null ? (
                text
            ) : (
                <a href={links.securityAdvisory} className={textLinkClasses('inline')}>
                    {text}
                </a>
            ),
    };

    const values: Values = {
        ...Object.fromEntries(Object.entries(facts).map(([name, value]) => [name, typeof value === 'string' ? value : joinList(value, m.common.list)])),
        ...(links.securityEmail !== null && { securityEmail: links.securityEmail }),
        ...(replyDays !== null && { businessDays: plural(content.counts.businessDays, replyDays) }),
    };
    const render = (text: string) => <Trans text={text} tags={tags} values={values} />;

    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: content.breadcrumb, path: path('/security') },
    ];

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                description={content.seo.description}
                jsonLd={plainPageJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    path: path('/security'),
                    name: content.seo.title,
                    description: content.seo.description,
                    crumbs,
                    organization: { description: m.seo.product.short, sameAs: organizationProfiles },
                })}
            />

            <AreaNav current="/security" label={content.nav} items={content.bands.map((band) => ({ href: `#${band.id}`, label: band.nav }))} />
            <FeatureHero title={content.header.title} lead={content.header.lead} actions={null} />

            {content.bands.map((band) => {
                const shownLinks = band.links.filter((link) => link.to === undefined || target(link, links) !== null);
                const notes = band.notes ?? [];
                // Under the table when the band has one, so the limits and links follow what they qualify.
                const details = (
                    <>
                        {notes.length > 0 && (
                            <div className={`mt-5 max-w-[42rem] ${BAND_NOTES}`}>
                                {notes.map((note, index) => (
                                    <p key={index}>{render(note)}</p>
                                ))}
                            </div>
                        )}
                        {shownLinks.length > 0 && (
                            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                                {shownLinks.map((link) => (
                                    <li key={link.label}>
                                        <BandLink link={link} links={links} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                );

                return (
                    <BandFrame
                        key={band.id}
                        id={band.id}
                        also={band.also}
                        title={band.title}
                        after={
                            band.table !== undefined ? (
                                <>
                                    <FactTable table={band.table} render={render} label={(column) => fmt(content.labelled, { label: column })} />
                                    {details}
                                </>
                            ) : undefined
                        }
                    >
                        <div className={BAND_TEXT}>
                            {band.text.map((paragraph, index) => (
                                <p key={index}>{render(paragraph)}</p>
                            ))}
                        </div>
                        {band.table === undefined && details}
                    </BandFrame>
                );
            })}
        </LandingLayout>
    );
}
