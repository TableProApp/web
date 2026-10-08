import { usePage } from '@inertiajs/react';
import { useContentTags, type SiteLinks } from '@/components/faq/content-links';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import { FeatureLinkItem } from '@/components/features/feature-links';
import SEOHead from '@/components/seo/seo-head';
import CellGrid from '@/components/ui/cell-grid';
import Container from '@/components/ui/container';
import FaqList from '@/components/ui/faq-list';
import PageHeader from '@/components/ui/page-header';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n, type Values } from '@/i18n';
import { joinList } from '@/i18n/format';
import { PUBLISHER } from '@/lib/data/facts';
import { cn } from '@/lib/utils';
import LandingLayout from '@/layouts/landing-layout';

// One of `href` (a page here), `docs` (a docs path) or `to` (a key of the `links` prop).
interface SecurityLink {
    label: string;
    href?: string;
    docs?: string;
    to?: string;
}

interface SecurityContent {
    seo: { title: string; description: string };
    header: { title: string; lead: string };
    breadcrumb: string;
    jump: string;
    limits: string;
    more: string;
    sections: {
        id: string;
        title: string;
        items: { id: string; title: string; text: string }[];
        limits: string[];
        links: SecurityLink[];
    }[];
}

interface SecurityLinks extends SiteLinks {
    securityPolicy: string | null;
    securityAdvisory: string | null;
    securityTxt: string;
}

interface SecurityProps {
    content: SecurityContent;
    facts: Record<string, string | string[]>;
    links: SecurityLinks;
    organizationProfiles: string[];
}

function target(link: SecurityLink, links: SecurityLinks): string | null {
    return link.to === undefined ? null : (links[link.to as keyof SecurityLinks] ?? null);
}

function SectionLink({ link, links }: { link: SecurityLink; links: SecurityLinks }) {
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

export default function Security({ content, facts, links, organizationProfiles }: SecurityProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, path } = useI18n();
    const tags = {
        ...useContentTags(links),
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
        ...(links.email !== null && { email: links.email }),
    };

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
                    organization: { description: m.seo.product.short, sameAs: organizationProfiles, publisher: PUBLISHER },
                })}
            />

            <PageHeader
                variant="utility"
                title={content.header.title}
                lead={content.header.lead}
                breadcrumbs={[{ label: m.common.home, href: '/' }, { label: content.breadcrumb }]}
            >
                <nav aria-labelledby="security-topics">
                    <h2 id="security-topics" className="type-label text-muted-foreground">
                        {content.jump}
                    </h2>
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                        {content.sections.map((section) => (
                            <li key={section.id}>
                                <a href={`#${section.id}`} className={textLinkClasses('standalone')}>
                                    {section.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </PageHeader>

            <div>
                <Container>
                    {content.sections.map((section, index) => (
                        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className={cn(index > 0 && 'mt-px')}>
                            <CellGrid className="lg:grid-cols-12">
                                <div className="lg:col-span-4">
                                    <h2 id={`${section.id}-title`} className="type-h2 text-foreground lg:sticky lg:top-24">
                                        {section.title}
                                    </h2>
                                </div>
                                <div className="py-0 md:py-0 xl:py-0 lg:col-span-8">
                                    <FaqList
                                        className="cell-rows border-t-0 [&>*:last-child]:border-b-0"
                                        items={[
                                            ...section.items.map((item) => ({
                                                id: item.id,
                                                question: item.title,
                                                answer: (
                                                    <p>
                                                        <Trans text={item.text} tags={tags} values={values} />
                                                    </p>
                                                ),
                                            })),
                                            ...(section.limits.length > 0
                                                ? [
                                                      {
                                                          id: `${section.id}-limits`,
                                                          question: content.limits,
                                                          answer: (
                                                              <ul className="list-disc space-y-2 pl-5">
                                                                  {section.limits.map((limit, limitIndex) => (
                                                                      <li key={limitIndex}>
                                                                          <Trans text={limit} tags={tags} values={values} />
                                                                      </li>
                                                                  ))}
                                                              </ul>
                                                          ),
                                                      },
                                                  ]
                                                : []),
                                            {
                                                id: `${section.id}-more`,
                                                question: content.more,
                                                answer: (
                                                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                                                        {section.links
                                                            .filter((link) => link.to === undefined || target(link, links) !== null)
                                                            .map((link) => (
                                                                <li key={link.label}>
                                                                    <SectionLink link={link} links={links} />
                                                                </li>
                                                            ))}
                                                    </ul>
                                                ),
                                            },
                                        ]}
                                    />
                                </div>
                            </CellGrid>
                        </section>
                    ))}
                </Container>
            </div>
        </LandingLayout>
    );
}
