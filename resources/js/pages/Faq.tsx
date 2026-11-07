import { usePage } from '@inertiajs/react';
import { requirementLine } from '@/components/download/format';
import { useContentTags, type SiteLinks } from '@/components/faq/content-links';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import AreaNav from '@/components/features/area-nav';
import { BandFrame } from '@/components/features/feature-band';
import { ClosingFrame } from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import { AlsoAnchors } from '@/components/features/feature-part';
import { MoreItem } from '@/components/features/more-list';
import SEOHead from '@/components/seo/seo-head';
import ChatButton, { useChatAvailable } from '@/components/site/chat-button';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { useEducationOpen } from '@/hooks/use-regional-pricing';
import { LOCALES, Trans, useI18n, type PluralNode, type Values } from '@/i18n';
import { joinList } from '@/i18n/format';
import type { Requirements } from '@/lib/data/platforms';
import LandingLayout from '@/layouts/landing-layout';

// Shown only while GET /v2/pricing says the education program is open; until then its id lands on the Pricing band.
const EDUCATION_QUESTION = 'students-teachers';

const ANSWER = 'mt-2 text-base leading-[1.55] text-pretty text-muted-foreground';

interface FaqItem {
    id: string;
    also?: string[];
    question: string;
    answer: string;
}

interface FaqGroup {
    id: string;
    also?: string[];
    title: string;
    items: FaqItem[];
    // One line to the page that owns the rest of the topic, carrying the ids of the questions that moved there.
    more?: { also: string[]; text: string };
}

interface FaqContent {
    seo: { title: string; description: string };
    header: { title: string; lead: string };
    breadcrumb: string;
    nav: string;
    languages: Record<string, string>;
    groups: FaqGroup[];
    counts: { businessDays: PluralNode };
    contact: { title: string; body: string; chat: string };
}

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
        linuxLanguages: string[];
        // Those with packages of their own; any other takes the Flatpak.
        linuxDistributions: string[];
        iosLanguages: string[];
    };
    facts: {
        featuredEngines: string[];
        bundledEngines: string[];
        iosEngines: string[];
        importApps: string[];
        localAiProviders: string[];
        paidFeatures: { starter: string[]; team: string[] };
        supportBusinessDays: number | null;
    };
    links: SiteLinks;
    organizationProfiles: string[];
}

// `/faq` in every locale (sitemap §A.1, design-system §8.12): one band per topic on the feature-page grid, every answer
// open, then the contact line. A slot whose data is missing stays visible as written, which a test catches. No FAQPage.
export default function Faq({ content, platforms, facts, links, organizationProfiles }: FaqProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, path, plural } = useI18n();
    const tags = useContentTags(links);
    const chat = useChatAvailable();
    const educationOpen = useEducationOpen();
    useRevealOnScroll('main > section:not(#top)');

    const languageName = (tag: string): string => content.languages[tag] ?? tag;
    const list = (items: string[]): string => joinList(items, m.common.list);
    const shown = (item: FaqItem): boolean => educationOpen || item.id !== EDUCATION_QUESTION;

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
        linuxLanguages: list(platforms.linuxLanguages.map(languageName)),
        iosLanguages: list(platforms.iosLanguages.map(languageName)),
        linuxDistributions: list(platforms.linuxDistributions),
        ...(platforms.mac !== null && { macRequirement: requirementLine(platforms.mac.requirements, m.platforms) }),
        ...(platforms.ios !== null && { iosRequirement: requirementLine(platforms.ios.requirements, m.platforms) }),
        ...(links.email !== null && { email: links.email }),
        ...(facts.supportBusinessDays !== null && { businessDays: plural(content.counts.businessDays, facts.supportBusinessDays) }),
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
                    organization: { description: m.seo.product.short, sameAs: organizationProfiles },
                })}
            />

            <AreaNav current="/faq" label={content.nav} items={content.groups.map((group) => ({ href: `#${group.id}`, label: group.title }))} />
            <FeatureHero title={content.header.title} lead={content.header.lead} actions={null} />

            {content.groups.map((group) => (
                <BandFrame
                    key={group.id}
                    id={group.id}
                    also={[...(group.also ?? []), ...group.items.filter((item) => !shown(item)).map((item) => item.id)]}
                    title={group.title}
                >
                    <ul className="space-y-8">
                        {group.items.filter(shown).map((item) => (
                            <MoreItem key={item.id} id={item.id} also={item.also} title={item.question}>
                                <p className={ANSWER}>
                                    <Trans text={item.answer} tags={tags} values={values} />
                                </p>
                            </MoreItem>
                        ))}
                    </ul>
                    {group.more !== undefined && (
                        <p className="mt-8 text-base leading-[1.55] text-pretty text-foreground">
                            <AlsoAnchors part={{ id: `${group.id}-more`, also: group.more.also }} />
                            <Trans text={group.more.text} tags={tags} values={values} />
                        </p>
                    )}
                </BandFrame>
            ))}

            <ClosingFrame
                id="contact"
                title={content.contact.title}
                sentence={<Trans text={content.contact.body} tags={tags} values={values} />}
            >
                {chat ? (
                    <ChatButton className="cursor-pointer text-[0.9375rem] font-medium tracking-[-0.009em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground">
                        {content.contact.chat}
                    </ChatButton>
                ) : undefined}
            </ClosingFrame>
        </LandingLayout>
    );
}
