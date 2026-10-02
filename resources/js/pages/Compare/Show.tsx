import { usePage } from '@inertiajs/react';
import ComparisonTable from '@/components/compare/comparison-table';
import ItemList from '@/components/compare/item-list';
import { extraRows, glanceRows, productTokens, sourceNumbers, type ModelContext } from '@/components/compare/model';
import RichText from '@/components/compare/rich-text';
import { SourceList, SourceMarkers } from '@/components/compare/sources';
import { macLanguages, paidExamples, tableproFacts } from '@/components/compare/tablepro-facts';
import type { ComparePageProps } from '@/components/compare/types';
import SEOHead from '@/components/seo/seo-head';
import { buttonClasses } from '@/components/ui/button';
import FaqList from '@/components/ui/faq-list';
import { AppleGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, useI18n } from '@/i18n';
import LandingLayout from '@/layouts/landing-layout';
import { trackDownload } from '@/lib/analytics';
import { docsUrl } from '@/lib/data/facts';
import { absoluteUrl, breadcrumbNode, graph, macAppId, webPageNode } from '@/lib/structured-data';

/**
 * `/compare/{slug}` and `/vi/compare/{slug}` (sitemap §A.4, §E.3;
 * design-system §8.5).
 *
 * One template for every comparison. The page's copy is
 * `content/{locale}/compare/{slug}.json`; every fact about the other product
 * is its `comparisons.json` entry, sent as `product` with its sources; and
 * TablePro's column is derived from TablePro's own data
 * (components/compare/tablepro-facts.ts). Each competitor fact carries a
 * numbered source with the date it was checked.
 *
 * Structured data is a `WebPage` about the Mac app plus the breadcrumb trail.
 * There is no `Review` of the other product, no rating, no `FAQPage` and no
 * benchmark anywhere on the page.
 */
export default function CompareShow({ slug, content, labels, product, rows: rowOrder, dates, tablepro }: ComparePageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, plural, path } = useI18n();

    const context: ModelContext = {
        labels,
        notes: content.notes,
        dates,
        list: m.common.list,
        plural: (node, count, values) => plural(node, count, values),
    };
    const facts = tableproFacts(product.id, tablepro.featuredEngines, m);
    const values = productTokens(product, dates, { ...paidExamples(m), macLanguages: macLanguages(labels.languages, m) });
    const numbers = sourceNumbers(product);
    const checked = dates[product.checkedAt] ?? product.checkedAt;
    const docsInEnglish = locale !== 'en';

    const pageUrl = absoluteUrl(canonicalBaseUrl, path(`/compare/${slug}`));
    const crumbs = [
        { name: m.seo.breadcrumbs.compare, path: path('/compare') },
        { name: content.header.title, path: path(`/compare/${slug}`) },
    ];
    const pageContext = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };

    const rows = glanceRows(product, rowOrder, facts, context);
    const more = extraRows(product, content.rows, context, values);

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                titleTemplate={false}
                description={content.seo.description}
                jsonLd={graph([
                    webPageNode(pageContext, {
                        url: pageUrl,
                        name: content.seo.title,
                        description: content.seo.description,
                        about: macAppId(canonicalBaseUrl),
                        breadcrumb: `${pageUrl}#breadcrumb`,
                    }),
                    breadcrumbNode(pageContext, pageUrl, crumbs),
                ])}
            />

            <PageHeader
                breadcrumbs={[{ label: m.seo.breadcrumbs.compare, href: '/compare' }, { label: content.header.title }]}
                title={content.header.title}
                lead={<RichText text={content.header.lead} values={values} />}
                meta={
                    <>
                        {fmt(labels.factsChecked, { date: checked })} ·{' '}
                        <a href="#sources" className={textLinkClasses('inline')}>
                            {labels.sourcesLink}
                        </a>
                    </>
                }
                actions={
                    <>
                        <LocaleLink href="/download" onClick={() => trackDownload('compare', 'mac')} className={buttonClasses('primary', 'md')}>
                            <AppleGlyph />
                            {m.download.macCta}
                        </LocaleLink>
                        <LocaleLink href="/pricing" className={textLinkClasses('standalone')}>
                            {labels.cta.pricing}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    </>
                }
            />

            <Section id="short-answer" title={labels.shortAnswer.title} className="pt-0 md:pt-0 xl:pt-0">
                <div className="grid gap-10 md:grid-cols-2 md:gap-8">
                    {[
                        { id: 'choose-tablepro', title: labels.shortAnswer.tablepro, items: content.shortAnswer.tablepro },
                        {
                            id: 'choose-competitor',
                            title: content.shortAnswer.competitorTitle ?? fmt(labels.shortAnswer.competitor, { name: product.name }),
                            items: content.shortAnswer.competitor,
                        },
                    ].map((column) => (
                        <div key={column.id}>
                            <h3 id={column.id} className="type-h3 text-foreground">
                                {column.title}
                            </h3>
                            <ul className="type-body mt-4 list-disc space-y-3 pl-6 text-foreground marker:text-muted-foreground">
                                {column.items.map((item, index) => (
                                    <li key={index} className="pl-1">
                                        <RichText text={item} values={values} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Section>

            <Section id="at-a-glance" title={labels.glance.title}>
                {content.glance.intro !== '' && (
                    <p className="type-body mb-6 max-w-[44rem] text-foreground">
                        <RichText text={content.glance.intro} values={values} />
                    </p>
                )}
                <ComparisonTable
                    caption={fmt(labels.glance.caption, { name: product.name, date: checked })}
                    productId={product.id}
                    productName={product.name}
                    brand={m.common.brand}
                    rowHeading={labels.glance.feature}
                    rows={rows}
                    extra={{ heading: fmt(labels.glance.more, { name: product.name }), rows: more }}
                    numbers={numbers}
                    labels={labels}
                />
            </Section>

            <Section id="stronger" title={fmt(labels.sections.stronger, { name: product.name })} width="text">
                <ItemList list={content.stronger} product={product} values={values} numbers={numbers} labels={labels} />
            </Section>

            <Section id="differs" title={labels.sections.differs} width="text">
                <ItemList list={content.differs} product={product} values={values} numbers={numbers} labels={labels} />
            </Section>

            <Section id="limits" title={labels.sections.limits} width="text">
                <ItemList list={content.limits} product={product} values={values} numbers={numbers} labels={labels} />
            </Section>

            <Section id="switching" title={fmt(labels.sections.switching, { name: product.name })} width="text">
                <div className="type-body space-y-4 text-foreground">
                    <p>
                        <RichText text={content.switching.intro} values={values} />
                    </p>
                    {content.switching.steps.length > 0 && (
                        <ol className="list-decimal space-y-3 pl-6 marker:text-muted-foreground">
                            {content.switching.steps.map((step, index) => (
                                <li key={index} className="pl-1">
                                    <RichText text={step} values={values} />
                                </li>
                            ))}
                        </ol>
                    )}
                    {content.switching.after.length > 0 && (
                        <ul className="list-disc space-y-2 pl-6 marker:text-muted-foreground">
                            {content.switching.after.map((line, index) => (
                                <li key={index} className="pl-1">
                                    <RichText text={line} values={values} />
                                </li>
                            ))}
                        </ul>
                    )}
                    {content.switching.docs !== null && (
                        <p>
                            <TextLink href={docsUrl(content.switching.docs)} kind="standalone" external hrefLang="en">
                                {labels.switching.docs}
                                {docsInEnglish && ` ${m.common.englishOnly}`}
                            </TextLink>
                        </p>
                    )}
                </div>
            </Section>

            {content.faq.length > 0 && (
                <Section id="faq" title={labels.sections.faq} width="text">
                    <FaqList
                        items={content.faq.map((item) => ({
                            id: item.id,
                            question: item.question,
                            answer: (
                                <p>
                                    <RichText text={item.answer} values={values} href={item.href} />
                                </p>
                            ),
                        }))}
                    />
                </Section>
            )}

            <Section id="sources" title={labels.sections.sources} width="text">
                <div className="space-y-4">
                    <p className="type-body text-foreground">{fmt(labels.sources.intro, { name: product.name, date: checked })}</p>
                    <SourceList
                        productId={product.id}
                        sources={product.sources}
                        dates={dates}
                        retrievedTemplate={(date) => fmt(labels.sources.retrieved, { date })}
                        label={labels.sections.sources}
                    />
                    <p className="type-small text-muted-foreground">
                        {fmt(labels.sources.latest, {
                            name: product.name,
                            version: product.status.lastRelease.version,
                            date: dates[product.status.lastRelease.date] ?? product.status.lastRelease.date,
                        })}
                        <SourceMarkers productId={product.id} ids={[product.status.lastRelease.source]} numbers={numbers} label={labels.cell.source} />
                    </p>
                    {tablepro.mac !== null && tablepro.ios !== null && (
                        <p className="type-small text-muted-foreground">
                            {fmt(labels.sources.tablepro, { macVersion: tablepro.mac.version, iosVersion: tablepro.ios.version })}
                        </p>
                    )}
                </div>
            </Section>

            <Section id="get-started" title={labels.sections.cta} width="text">
                <p className="type-body text-foreground">{labels.cta.body}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <LocaleLink href="/download" onClick={() => trackDownload('compare-end', 'mac')} className={buttonClasses('primary', 'md')}>
                        <AppleGlyph />
                        {m.download.macCta}
                    </LocaleLink>
                    <LocaleLink href="/pricing" className={textLinkClasses('standalone')}>
                        {labels.cta.pricing}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                    <LocaleLink href="/compare" className={textLinkClasses('standalone')}>
                        {labels.cta.hub}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </div>
            </Section>
        </LandingLayout>
    );
}
