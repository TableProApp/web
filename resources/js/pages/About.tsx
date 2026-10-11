import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { useContentTags, type SiteLinks } from '@/components/faq/content-links';
import SEOHead from '@/components/seo/seo-head';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n, type Values } from '@/i18n';
import { PUBLISHER } from '@/lib/data/facts';
import { absoluteUrl, breadcrumbNode, graph, organizationId, organizationNode, webPageNode, type JsonLdGraph } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

type AboutContent = typeof import('@data/content/en/about.json');

interface AboutProps {
    content: AboutContent;
    /** `facts.json` → `publisher`, with the city and country in the page's language. */
    publisher: { name: string; city: string | null; country: string | null; countryCode: string | null } | null;
    repositoryCreated: { date: string; formatted: string } | null;
    links: SiteLinks;
    organizationProfiles: string[];
}

interface JsonLdInput {
    baseUrl: string;
    inLanguage: string;
    pageUrl: string;
    content: AboutContent;
    crumbs: { name: string; path: string }[];
    description: string;
    organizationProfiles: string[];
}

/** The publisher with its founder and place, and an `AboutPage` about it. */
function aboutJsonLd({ baseUrl, inLanguage, pageUrl, content, crumbs, description, organizationProfiles }: JsonLdInput): JsonLdGraph {
    const context = { baseUrl, inLanguage };

    return graph([
        organizationNode(baseUrl, { description, sameAs: organizationProfiles, publisher: PUBLISHER }),
        webPageNode(
            context,
            {
                url: pageUrl,
                name: content.seo.title,
                description: content.seo.description,
                about: organizationId(baseUrl),
                breadcrumb: `${pageUrl}#breadcrumb`,
            },
            'AboutPage',
        ),
        breadcrumbNode(context, pageUrl, crumbs),
    ]);
}

/**
 * `/about` in every locale: who makes TablePro and where, how it is funded,
 * where the code is, how to reach the maker, and where the brand guidelines are.
 *
 * The name, city and country fill `{maker}`, `{city}` and `{country}` from
 * the `publisher` prop; no sentence holds them.
 */
export default function About({ content, publisher, repositoryCreated, links, organizationProfiles }: AboutProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const tags = useContentTags(links);

    const values: Values = {
        ...(publisher !== null && { maker: publisher.name }),
        ...(publisher?.city && { city: publisher.city }),
        ...(publisher?.country && { country: publisher.country }),
        ...(links.email !== null && { email: links.email }),
    };

    const rich = (text: string): ReactNode => <Trans text={text} tags={tags} values={values} />;
    const facts = content.maker.facts;

    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: content.breadcrumb, path: path('/about') },
    ];

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                titleTemplate={false}
                description={content.seo.description}
                jsonLd={aboutJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    pageUrl: absoluteUrl(canonicalBaseUrl, path('/about')),
                    content,
                    crumbs,
                    description: m.seo.product.short,
                    organizationProfiles,
                })}
            />

            <PageHeader
                variant="utility"
                title={content.header.title}
                lead={rich(content.header.lead)}
                breadcrumbs={[{ label: m.common.home, href: '/' }, { label: content.breadcrumb }]}
            />

            <Section id="maker" title={content.maker.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{rich(content.maker.body)}</p>
                    <p>{rich(content.maker.identity)}</p>
                    <DescriptionList className="frame-rows-text">
                        {publisher !== null && <DescriptionItem term={facts.maker}>{publisher.name}</DescriptionItem>}
                        {publisher?.city && publisher.country && (
                            <DescriptionItem term={facts.location}>{fmt(facts.locationValue, values)}</DescriptionItem>
                        )}
                        {repositoryCreated !== null && (
                            <DescriptionItem term={facts.created}>
                                <time dateTime={repositoryCreated.date}>{repositoryCreated.formatted}</time>
                            </DescriptionItem>
                        )}
                        {links.email !== null && (
                            <DescriptionItem term={facts.email}>
                                <a href={`mailto:${links.email}`} className={textLinkClasses('inline')}>
                                    {links.email}
                                </a>
                            </DescriptionItem>
                        )}
                    </DescriptionList>
                </div>
            </Section>

            <Section id="funding" title={content.funding.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{rich(content.funding.body)}</p>
                    <p>{rich(content.funding.plans)}</p>
                    <p>{rich(content.funding.sponsors)}</p>
                </div>
            </Section>

            <Section id="source" title={content.source.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{rich(content.source.body)}</p>
                    <p>{rich(content.source.license)}</p>
                </div>
            </Section>

            <Section id="contact" title={content.contact.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{rich(content.contact.email)}</p>
                    <p>{rich(content.contact.github)}</p>
                </div>
            </Section>

            <Section id="policies" title={content.policies.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{rich(content.policies.body)}</p>
                </div>
            </Section>

            <Section id="brand" title={content.brand.title} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>{rich(content.brand.body)}</p>
                </div>
            </Section>
        </LandingLayout>
    );
}
