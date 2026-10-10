import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import IntegrationFilters from '@/components/integrations/integration-filters';
import IntegrationList from '@/components/integrations/integration-list';
import { facetOptions, filterIntegrations, filtersToSearch, NO_FILTERS } from '@/components/integrations/model';
import type { AppPlatform, IntegrationFilters as Filters, IntegrationsHubProps } from '@/components/integrations/types';
import SEOHead from '@/components/seo/seo-head';
import Container from '@/components/ui/container';
import EmptyState from '@/components/ui/empty-state';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, useI18n } from '@/i18n';
import LandingLayout from '@/layouts/landing-layout';
import { docsUrl, FACTS } from '@/lib/data/facts';
import { devicesOf, iosPlatform, macPlatform } from '@/lib/data/platforms';
import { absoluteUrl, collectionPageNode, graph } from '@/lib/structured-data';

export default function IntegrationsIndex({ content, integrations, filters: initial }: IntegrationsHubProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, plural, path } = useI18n();
    const [filters, setFilters] = useState<Filters>(initial);
    const timer = useRef<number | null>(null);
    const english = locale === 'en' ? undefined : 'en';
    const englishOnly = english ? ` ${m.common.englishOnly}` : '';

    const shown = filterIntegrations(integrations, filters, content.labels.categories);
    const options = facetOptions(integrations, content.labels.categories);
    const appName = (platform: AppPlatform) => devicesOf(platform === 'mac' ? macPlatform() : iosPlatform(), m.common.shortList);

    useEffect(
        () => () => {
            if (timer.current !== null) {
                window.clearTimeout(timer.current);
            }
        },
        [],
    );

    const change = (next: Filters, urlDelay: number) => {
        setFilters(next);

        if (timer.current !== null) {
            window.clearTimeout(timer.current);
        }

        // Replace, never push: a reader filtering should not have to step back through every keystroke.
        const follow = () =>
            router.replace({
                url: path('/integrations') + filtersToSearch(next),
                props: (props) => ({ ...props, filters: next }),
                preserveScroll: true,
                preserveState: true,
            });

        if (urlDelay > 0) {
            timer.current = window.setTimeout(follow, urlDelay);
        } else {
            timer.current = null;
            follow();
        }
    };

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

            <PageHeader
                title={content.header.title}
                lead={content.header.lead}
                actions={
                    <TextLink href={docsUrl('/developers')} kind="standalone" external hrefLang={english}>
                        {content.header.build}
                        {englishOnly}
                    </TextLink>
                }
            >
                <IntegrationFilters content={content} filters={filters} options={options} appName={appName} onChange={change} />
            </PageHeader>

            <div className="py-8 md:py-10 xl:py-12">
                <Container className="@container">
                    <p role="status" className="type-small mb-4 text-muted-foreground">
                        {plural(content.filters.count, shown.length)}
                    </p>
                    {shown.length > 0 ? (
                        <IntegrationList integrations={shown} labels={content.labels} />
                    ) : (
                        <EmptyState
                            headingLevel="h2"
                            title={content.filters.empty}
                            action={
                                <LocaleLink
                                    href="/integrations"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        change(NO_FILTERS, 0);
                                    }}
                                    className={textLinkClasses('standalone')}
                                >
                                    {content.filters.clear}
                                </LocaleLink>
                            }
                        />
                    )}
                </Container>
            </div>

            <Section id="publish" title={content.publish.title}>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    <li>
                        <TextLink href={`${FACTS.links.integrations}/blob/main/CONTRIBUTING.md`} kind="standalone" external hrefLang={english}>
                            {content.publish.guide}
                            {englishOnly}
                        </TextLink>
                    </li>
                    <li>
                        <TextLink href={`${FACTS.links.integrations}/blob/main/POLICY.md`} kind="standalone" external hrefLang={english}>
                            {content.publish.policy}
                            {englishOnly}
                        </TextLink>
                    </li>
                </ul>
                <p className="type-small mt-6 max-w-[56ch] text-muted-foreground">{content.notice}</p>
            </Section>
        </LandingLayout>
    );
}
