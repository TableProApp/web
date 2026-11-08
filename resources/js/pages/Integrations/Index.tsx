import { usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { BandFrame } from '@/components/features/feature-band';
import { ClosingFrame } from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import IntegrationList from '@/components/integrations/integration-list';
import { groupIntegrations } from '@/components/integrations/model';
import type { IntegrationsHubProps } from '@/components/integrations/types';
import SEOHead from '@/components/seo/seo-head';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, useI18n } from '@/i18n';
import LandingLayout from '@/layouts/landing-layout';
import { docsUrl, FACTS } from '@/lib/data/facts';
import { absoluteUrl, collectionPageNode, graph } from '@/lib/structured-data';

const LINK =
    'inline-flex items-center gap-1 text-[0.9375rem] font-medium tracking-[-0.009em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground';

// One band per category, no search or filters: the list is short enough to read whole. Add them back past about
// twenty entries (owner, 2026-11-08).
export default function IntegrationsIndex({ content, integrations }: IntegrationsHubProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, path } = useI18n();
    useRevealOnScroll('main > section:not(#top)');

    const english = locale === 'en' ? undefined : 'en';
    const englishOnly = english ? ` ${m.common.englishOnly}` : '';

    const external = (href: string, label: string) => (
        <a href={href} hrefLang={english} className={LINK}>
            {label}
            {englishOnly}
            <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground" />
        </a>
    );

    const jsonLd = graph([
        collectionPageNode(
            { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang },
            {
                url: absoluteUrl(canonicalBaseUrl, path('/integrations')),
                name: content.seo.title,
                description: content.seo.description,
                items: integrations.map((integration) => ({ name: integration.name, path: `/integrations/${integration.slug}` })),
            },
        ),
    ]);

    return (
        <LandingLayout>
            <SEOHead title={content.seo.title} description={content.seo.description} jsonLd={jsonLd} />

            <FeatureHero title={content.header.title} lead={content.header.lead} actions={external(docsUrl('/developers'), content.header.build)} />

            {groupIntegrations(integrations).map((group) => (
                <BandFrame key={group.category} id={group.category} title={content.labels.categories[group.category]}>
                    <IntegrationList integrations={group.integrations} labels={content.labels} />
                </BandFrame>
            ))}

            <ClosingFrame id="publish" title={content.publish.title} sentence={content.publish.sentence}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {external(`${FACTS.links.integrations}/blob/main/CONTRIBUTING.md`, content.publish.guide)}
                    {external(`${FACTS.links.integrations}/blob/main/POLICY.md`, content.publish.policy)}
                </div>
                <p className="mt-6 max-w-[40rem] text-sm leading-[1.5] text-pretty text-muted-foreground">{content.notice}</p>
            </ClosingFrame>
        </LandingLayout>
    );
}
