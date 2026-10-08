import { usePage } from '@inertiajs/react';
import DownloadBand from '@/components/databases/download-band';
import EngineHeader from '@/components/databases/engine-header';
import EngineSection from '@/components/databases/engine-section';
import FamilySection from '@/components/databases/family-section';
import { deviceNamesFor, docsUrl, engineValues, iosStatus, tierToken } from '@/components/databases/format';
import LimitsList from '@/components/databases/limits-list';
import OtherTools from '@/components/databases/other-tools';
import RichText, { RichTextProvider } from '@/components/databases/rich-text';
import type { EnginePageProps } from '@/components/databases/types';
import SEOHead from '@/components/seo/seo-head';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import Callout from '@/components/ui/callout';
import Container from '@/components/ui/container';
import FaqList from '@/components/ui/faq-list';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { assetEntry } from '@/lib/data/assets';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { absoluteUrl, breadcrumbNode, graph, macAppId, webPageNode } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

/**
 * An engine page, such as `/mysql-client` (sitemap §A.3, §E.1, §E.2;
 * design-system §8.4).
 *
 * The order is fixed by the blueprint: header and facts, the engine's own
 * lead image, the body sections the copy gives (Connect, Work with the data,
 * Schema, Operate, Move data), iPhone and iPad, limits, the family sections
 * of a merged page, other tools, questions, related pages and the download
 * band. Which body sections exist, and what they are called, is the copy's
 * call, so a Kafka page never inherits a SQL editor narrative.
 *
 * Facts come from props built from the data files; copy comes from
 * `content/{locale}/databases/{slug}.json` and the hub's shared `labels`.
 * Structured data is a `WebPage` about the Mac app with its breadcrumb: no
 * per-database pseudo-app, no FAQPage, no rating.
 */
export default function DatabaseShow({ content, labels, engine, family, copy, tools, platforms, links, product }: EnginePageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();

    const devices = joinList(deviceNamesFor(engine, platforms), m.common.list);
    /* The Mac alone, for a page whose heading must not promise the iPhone app (Redis: no key browsing there). */
    const macDevices = joinList(platforms.mac?.deviceNames ?? [], m.common.list);
    /* The search title carries the platforms like the H1 does, from the same data (sitemap §A.3). */
    const title = fmt(content.seo.title, { devices, macDevices });
    const tiers = Object.fromEntries(PAID_FEATURES.map((feature) => [tierToken(feature.id), m.pricing.tiers[feature.tier].name]));
    const values = { ...tiers, ...engineValues(engine, m.common.list), devices };

    const lead = useShownSlot()(content.asset);
    const leadIsWindow = lead !== null && assetEntry(lead).kind === 'window';
    const status = iosStatus(engine);
    const iphone = content.sections.find((section) => section.id === 'iphone');
    const body = content.sections.filter((section) => section.id !== 'iphone');
    const members = new Map(family.map((member) => [member.id, member]));

    // This page is the engine's own page, which always resolves; the hub is only the type's fallback.
    const ownPath = engine.path ?? '/databases';
    const pageUrl = absoluteUrl(canonicalBaseUrl, path(ownPath));
    const context = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };
    const crumbs = [
        { name: m.seo.breadcrumbs.databases, path: path('/databases') },
        { name: content.breadcrumb, path: path(ownPath) },
    ];
    const docsLinks = [engine, ...family]
        .map((member) => ({ name: member.name, href: docsUrl(links.docs, member.docsSlug) }))
        .filter((entry, index, all): entry is { name: string; href: string } => entry.href !== null && all.findIndex((other) => other.href === entry.href) === index);

    return (
        <LandingLayout>
            <SEOHead
                title={title}
                description={content.seo.description}
                jsonLd={graph([
                    webPageNode(context, {
                        url: pageUrl,
                        name: title,
                        description: content.seo.description,
                        about: macAppId(canonicalBaseUrl),
                        breadcrumb: `${pageUrl}#breadcrumb`,
                    }),
                    breadcrumbNode(context, pageUrl, crumbs),
                ])}
            />

            <RichTextProvider scope={{ links: content.links, docsBase: links.docs, values }}>
                {/* A detail lead goes in the header's text column, beside the facts card; a window lead spans the page under it. */}
                <EngineHeader
                    content={content}
                    labels={labels}
                    engine={engine}
                    platforms={platforms}
                    links={links}
                    product={product}
                    lead={lead !== null && !leadIsWindow ? <AssetSlot id={lead} /> : undefined}
                />

                {lead !== null && leadIsWindow && (
                    <Container>
                        <AssetSlot id={lead} />
                    </Container>
                )}

                {body.map((section) => (
                    <EngineSection
                        key={section.id}
                        id={section.id}
                        title={section.title}
                        paragraphs={section.paragraphs}
                        points={section.points}
                        asset={section.asset}
                    />
                ))}

                <EngineSection
                    id="iphone"
                    title={iphone?.title ?? labels.sections.iphone}
                    paragraphs={status === 'none' ? [] : (iphone?.paragraphs ?? [])}
                    points={status === 'none' ? undefined : iphone?.points}
                    asset={status === 'none' ? undefined : iphone?.asset}
                    before={<p>{fmt(labels.iphone[status], { name: engine.name })}</p>}
                    after={
                        status !== 'none' && (
                            <p>
                                <LocaleLink href="/ios#databases" className={textLinkClasses('standalone')}>
                                    {labels.iphone.link}
                                    <span aria-hidden="true">→</span>
                                </LocaleLink>
                            </p>
                        )
                    }
                />

                {engine.limits.length > 0 && (
                    <Section id="limits" title={labels.sections.limits}>
                        <Callout className="max-w-[44rem]">
                            <LimitsList engine={engine} copy={copy[engine.id]} number={labels.number} />
                        </Callout>
                    </Section>
                )}

                {content.family.map((section) => {
                    const member = members.get(section.engine);

                    return member === undefined ? null : (
                        <FamilySection
                            key={member.id}
                            section={section}
                            engine={member}
                            copy={copy[member.id]}
                            labels={labels}
                            docsBase={links.docs}
                        />
                    );
                })}

                {content.otherTools !== null && tools.length > 0 && <OtherTools content={content.otherTools} tools={tools} labels={labels} />}

                {content.faq.length > 0 && (
                    <Section id="faq" title={fmt(labels.sections.faq, { name: engine.name })} width="text">
                        <FaqList
                            className="frame-rows-text"
                            items={content.faq.map((entry) => ({
                                id: entry.id,
                                question: entry.question,
                                answer: (
                                    <p>
                                        <RichText text={entry.answer} />
                                    </p>
                                ),
                            }))}
                        />
                    </Section>
                )}

                <Section id="related" title={labels.sections.related}>
                    <ul className="flex max-w-[44rem] flex-col gap-3">
                        {content.related.map((link) => (
                            <li key={link.href}>
                                <LocaleLink href={link.href} className={textLinkClasses('standalone')}>
                                    {link.label}
                                    <span aria-hidden="true">→</span>
                                </LocaleLink>
                            </li>
                        ))}
                        {docsLinks.map((entry) => (
                            <li key={entry.href}>
                                <TextLink href={entry.href} kind="standalone" external hrefLang="en">
                                    {fmt(labels.docs, { name: entry.name })}
                                    {locale !== 'en' && ` ${m.common.englishOnly}`}
                                </TextLink>
                            </li>
                        ))}
                    </ul>
                </Section>

                <DownloadBand
                    labels={labels}
                    platforms={platforms}
                    showIos={status === 'picker'}
                    appStoreUrl={links.appStore}
                    location={`database-${engine.id}`}
                />
            </RichTextProvider>
        </LandingLayout>
    );
}
