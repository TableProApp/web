import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { useContentTags, type SiteLinks } from '@/components/faq/content-links';
import { BandFrame } from '@/components/features/feature-band';
import { ClosingFrame } from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import SEOHead from '@/components/seo/seo-head';
import ChatButton, { useChatAvailable } from '@/components/site/chat-button';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, Trans, useI18n, type Values } from '@/i18n';
import { absoluteUrl, breadcrumbNode, graph, organizationId, organizationNode, webPageNode, type JsonLdGraph } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

type AboutContent = typeof import('@data/content/en/about.json');

interface AboutProps {
    content: AboutContent;
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

function aboutJsonLd({ baseUrl, inLanguage, pageUrl, content, crumbs, description, organizationProfiles }: JsonLdInput): JsonLdGraph {
    const context = { baseUrl, inLanguage };

    return graph([
        organizationNode(baseUrl, { description, sameAs: organizationProfiles }),
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

// A statement, four principles, the facts as rows, then how to reach the team. It names the TablePro team, never a
// person or a city (owner, 2026-11-07). The retired section ids land on the band that now says the same thing.
export default function About({ content, repositoryCreated, links, organizationProfiles }: AboutProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, path } = useI18n();
    const tags = useContentTags(links);
    const chat = useChatAvailable();
    useRevealOnScroll('main > section:not(#top)');

    const values: Values = {
        ...(links.email !== null && { email: links.email }),
    };

    const rich = (text: string): ReactNode => <Trans text={text} tags={tags} values={values} />;
    const facts = content.facts;

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

            <FeatureHero title={content.header.title} lead={content.header.lead} actions={null} />

            <BandFrame id="principles" title={content.principles.title}>
                <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                    {content.principles.items.map((item) => (
                        <li key={item.id} id={item.id} className="scroll-mt-16">
                            <h3 className="text-[1.0625rem] leading-[1.35] font-semibold tracking-[-0.012em] text-foreground">{item.name}</h3>
                            <p className="mt-2 text-base leading-[1.55] text-pretty text-muted-foreground">{item.text}</p>
                        </li>
                    ))}
                </ul>
            </BandFrame>

            <BandFrame id="facts" also={['maker', 'funding', 'source']} title={facts.title}>
                <DescriptionList>
                    <DescriptionItem term={facts.maker.term} size="body">
                        {facts.maker.text}
                    </DescriptionItem>
                    {repositoryCreated !== null && (
                        <DescriptionItem term={facts.created.term} size="body">
                            <time dateTime={repositoryCreated.date}>{repositoryCreated.formatted}</time>
                        </DescriptionItem>
                    )}
                    <DescriptionItem term={facts.source.term} size="body">
                        {rich(facts.source.text)}
                    </DescriptionItem>
                    <DescriptionItem term={facts.license.term} size="body">
                        {rich(facts.license.text)}
                    </DescriptionItem>
                    <DescriptionItem term={facts.funding.term} size="body">
                        {rich(facts.funding.text)}
                    </DescriptionItem>
                </DescriptionList>
            </BandFrame>

            <ClosingFrame id="contact" also={['policies', 'brand']} title={content.contact.title} sentence={rich(content.contact.body)}>
                {chat ? (
                    <ChatButton className="cursor-pointer text-[0.9375rem] font-medium tracking-[-0.009em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground">
                        {content.contact.chat}
                    </ChatButton>
                ) : undefined}
            </ClosingFrame>
        </LandingLayout>
    );
}
