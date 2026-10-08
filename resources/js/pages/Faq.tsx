import { usePage } from '@inertiajs/react';
import { useContentTags, type SiteLinks } from '@/components/faq/content-links';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import { requirementLine } from '@/components/download/format';
import SEOHead from '@/components/seo/seo-head';
import ChatButton, { useChatAvailable } from '@/components/site/chat-button';
import Callout from '@/components/ui/callout';
import CellGrid from '@/components/ui/cell-grid';
import Container from '@/components/ui/container';
import FaqList from '@/components/ui/faq-list';
import PageHeader from '@/components/ui/page-header';
import { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n, type Values } from '@/i18n';
import { joinList } from '@/i18n/format';
import { PUBLISHER } from '@/lib/data/facts';
import type { Requirements } from '@/lib/data/platforms';
import { cn } from '@/lib/utils';
import LandingLayout from '@/layouts/landing-layout';

type FaqContent = typeof import('@data/content/en/faq.json');

interface PlatformSummary {
    deviceNames: string[];
    requirements: Requirements;
}

interface FaqProps {
    content: FaqContent;
    platforms: {
        mac: PlatformSummary | null;
        ios: PlatformSummary | null;
        macLanguages: string[];
        iosLanguages: string[];
    };
    facts: {
        featuredEngines: string[];
        /** The engines whose driver comes inside the Mac app. */
        bundledEngines: string[];
        iosEngines: string[];
        importApps: string[];
        localAiProviders: string[];
        paidFeatures: { starter: string[]; team: string[] };
        commerce: {
            merchant: string | null;
            currency: string | null;
            refundDays: number | null;
            revalidateDays: number | null;
            graceDays: number | null;
            starterActivations: number | null;
            teamMinSeats: number | null;
            teamMaxSeats: number | null;
            supportBusinessDays: number | null;
        };
    };
    links: SiteLinks;
    organizationProfiles: string[];
}

/**
 * `/faq` and `/vi/faq` (sitemap §A.1, design-system §8.12).
 *
 * Seven groups in the sitemap's order, each an `h2` with its questions under
 * it as `h3`s and every answer visible. Answers are copy with `{token}` slots
 * and link tags; this page fills the slots from the data the server read
 * (requirements, names, seat and refund numbers), so an answer never states a
 * fact another page contradicts. A slot whose data is missing stays visible
 * as written, which a test catches, rather than vanishing.
 *
 * No `FAQPage` markup: one `WebPage` with its breadcrumbs.
 */
export default function Faq({ content, platforms, facts, links, organizationProfiles }: FaqProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, path } = useI18n();
    const tags = useContentTags(links);
    const chat = useChatAvailable();

    const languageName = (tag: string): string => (content.languages as Record<string, string>)[tag] ?? tag;
    const list = (items: string[]): string => joinList(items, m.common.list);
    const { commerce } = facts;

    const values: Values = {
        // The sentence ends "… and more", so the names take commas only.
        featuredEngines: facts.featuredEngines.join(', '),
        iosEngines: list(facts.iosEngines),
        bundledEngines: list(facts.bundledEngines),
        importApps: list(facts.importApps),
        localAiProviders: list(facts.localAiProviders),
        starterFeatures: list(facts.paidFeatures.starter),
        teamFeatures: list(facts.paidFeatures.team),
        macLanguages: list(platforms.macLanguages.map(languageName)),
        iosLanguages: list(platforms.iosLanguages.map(languageName)),
        ...(platforms.mac !== null && { macRequirement: requirementLine(platforms.mac.requirements, m.platforms) }),
        ...(platforms.ios !== null && { iosRequirement: requirementLine(platforms.ios.requirements, m.platforms) }),
        ...(links.email !== null && { email: links.email }),
        ...Object.fromEntries(Object.entries(commerce).filter((entry): entry is [string, string | number] => entry[1] !== null)),
    };

    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: content.breadcrumb, path: path('/faq') },
    ];

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                description={content.seo.description}
                jsonLd={plainPageJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    path: path('/faq'),
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
                <nav aria-labelledby="faq-topics">
                    <h2 id="faq-topics" className="type-label text-muted-foreground">
                        {content.jump}
                    </h2>
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                        {content.groups.map((group) => (
                            <li key={group.id}>
                                <a href={`#${group.id}`} className={textLinkClasses('standalone')}>
                                    {group.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </PageHeader>

            {/*
              * One row of two cells per topic (design-system §4.7): the topic beside
              * its questions, whose rules run from the cell divider to the rail.
              * Each topic is its own grid; 1px between grids lets two neighbours
              * share one line.
              */}
            <div>
                <Container>
                    {content.groups.map((group, index) => (
                        <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className={cn(index > 0 && 'mt-px')}>
                            <CellGrid className="lg:grid-cols-12">
                                <div className="lg:col-span-4">
                                    <h2 id={`${group.id}-title`} className="type-h2 text-foreground lg:sticky lg:top-24">
                                        {group.title}
                                    </h2>
                                </div>
                                <div className="py-0 md:py-0 xl:py-0 lg:col-span-8">
                                    <FaqList
                                        className="cell-rows border-t-0 [&>*:last-child]:border-b-0"
                                        items={group.items.map((item) => ({
                                            id: item.id,
                                            question: item.question,
                                            answer: item.answer.map((paragraph, paragraphIndex) => (
                                                <p key={paragraphIndex}>
                                                    <Trans text={paragraph} tags={tags} values={values} />
                                                </p>
                                            )),
                                        }))}
                                    />
                                </div>
                            </CellGrid>
                        </section>
                    ))}
                </Container>
            </div>

            <div className="py-8 md:py-10 xl:py-12">
                <Container>
                    <Callout className="max-w-[44rem]" title={content.contact.title}>
                        <p>
                            <Trans text={content.contact.body} tags={tags} values={values} />
                        </p>
                        {chat && (
                            <p>
                                <ChatButton className={textLinkClasses('standalone', 'cursor-pointer')}>{content.contact.chat}</ChatButton>{' '}
                                <span className="text-muted-foreground">{content.contact.chatNote}</span>
                            </p>
                        )}
                    </Callout>
                </Container>
            </div>
        </LandingLayout>
    );
}
