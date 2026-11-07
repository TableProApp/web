import { usePage } from '@inertiajs/react';
import EngineBand, { BAND_NOTES } from '@/components/databases/engine-band';
import FactsCard from '@/components/databases/facts-card';
import FamilyBand from '@/components/databases/family-band';
import { deviceNamesFor, engineValues, iosStatus, namedPaidIds, pageStrings, tierToken } from '@/components/databases/format';
import LimitsList from '@/components/databases/limits-list';
import RichText, { RichTextProvider } from '@/components/databases/rich-text';
import type { EnginePageProps } from '@/components/databases/types';
import FeatureClosing from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import { MoreFrame, MoreItem } from '@/components/features/more-list';
import SEOHead from '@/components/seo/seo-head';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import Container from '@/components/ui/container';
import DatabaseMark from '@/components/ui/database-mark';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { FACTS } from '@/lib/data/facts';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { absoluteUrl, breadcrumbNode, graph, macAppId, webPageNode } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

const ITEM_TEXT = 'mt-2 space-y-2 text-[0.9375rem] leading-[1.55] text-pretty text-muted-foreground';

// `/{slug}` in every locale it has content in (sitemap §A.3, §E.1; README.md): the feature-page system for one engine.
// A hero with the facts beside it and the engine's whole window, three or four bands on what is specific to it, one
// band per family member, the smaller parts as a list, and one closing line on what is paid. Structured data is a
// WebPage about the Mac app: no per-database pseudo-app, no FAQPage, no rating.
export default function DatabaseShow({ content, labels, engine, family, copy, platforms, heroSizes }: EnginePageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const shown = useShownSlot();
    useRevealOnScroll('main > section:not(#top), main > [data-reveal]');

    const devices = joinList(deviceNamesFor(engine, platforms), m.common.list);
    // The Mac alone, for a page whose title must not promise the iPhone app (Redis: no key browsing there).
    const macDevices = joinList(platforms.mac?.deviceNames ?? [], m.common.list);
    const title = fmt(content.seo.title, { devices, macDevices });
    const tiers = Object.fromEntries(PAID_FEATURES.map((feature) => [tierToken(feature.id), m.pricing.tiers[feature.tier].name]));
    const values = { ...tiers, ...engineValues(engine, m.common.list) };
    const hero = shown(content.header.asset);
    const status = platforms.ios !== null ? iosStatus(engine) : 'none';
    const members = new Map(family.map((member) => [member.id, member]));
    const paid = namedPaidIds(
        pageStrings(content),
        PAID_FEATURES.map((feature) => feature.id),
    );

    const ownPath = engine.path ?? '/databases';
    const pageUrl = absoluteUrl(canonicalBaseUrl, path(ownPath));
    const context = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };

    return (
        <LandingLayout>
            <SEOHead
                title={title}
                description={content.seo.description}
                jsonLd={graph([
                    webPageNode(context, { url: pageUrl, name: title, description: content.seo.description, about: macAppId(canonicalBaseUrl), breadcrumb: `${pageUrl}#breadcrumb` }),
                    breadcrumbNode(context, pageUrl, [
                        { name: m.seo.breadcrumbs.databases, path: path('/databases') },
                        { name: content.breadcrumb, path: path(ownPath) },
                    ]),
                ])}
            />

            <RichTextProvider scope={{ links: content.links, docsBase: FACTS.links.docs, values }}>
                <FeatureHero
                    eyebrow={
                        <div className="mb-8 md:mb-10">
                            <Breadcrumbs items={[{ label: m.seo.breadcrumbs.databases, href: '/databases' }, { label: content.breadcrumb }]} />
                            {engine.icon !== null && <DatabaseMark icon={engine.icon} name={engine.name} size={40} className="mt-6 -ml-1 md:mt-8" />}
                        </div>
                    }
                    title={content.header.title}
                    lead={<RichText text={content.header.lead} />}
                    docs={engine.docsSlug !== null ? `/databases/${engine.docsSlug}` : '/databases'}
                    docsLabel={fmt(labels.docs, { name: engine.name })}
                    aside={<FactsCard engine={engine} labels={labels} />}
                    location={`database-${engine.id}`}
                >
                    {hero !== null ? <AssetSlot id={hero} sizes={heroSizes} caption={false} priority /> : undefined}
                </FeatureHero>

                {content.bands.map((band) => (
                    <EngineBand key={band.id} id={band.id} also={band.also} title={band.title} text={band.text} notes={band.notes} />
                ))}

                <div data-reveal className="py-8 md:py-10">
                    <Container>
                        <div className="grid md:grid-cols-12 md:gap-x-8">
                            <p className={`max-w-[42rem] md:col-span-8 md:col-start-5 lg:col-span-9 lg:col-start-4 ${BAND_NOTES}`}>
                                <Trans
                                    text={labels.common}
                                    values={{ name: engine.name }}
                                    tags={{
                                        features: (text) => (
                                            <LocaleLink href="/features" className={textLinkClasses('inline')}>
                                                {text}
                                            </LocaleLink>
                                        ),
                                    }}
                                />
                            </p>
                        </div>
                    </Container>
                </div>

                {content.family.map((member) => {
                    const detail = members.get(member.engine);

                    return detail === undefined ? null : <FamilyBand key={detail.id} content={member} engine={detail} parent={engine} copy={copy[detail.id]} labels={labels} />;
                })}

                <MoreFrame title={labels.more}>
                    <MoreItem id="move-data" title={labels.moveData}>
                        <div className={ITEM_TEXT}>
                            {content.moveData.map((paragraph, index) => (
                                <p key={index}>
                                    <RichText text={paragraph} />
                                </p>
                            ))}
                        </div>
                    </MoreItem>
                    {status !== 'none' && (
                        <MoreItem id="iphone" title={labels.iphone.title}>
                            <div className={ITEM_TEXT}>
                                <p>{fmt(labels.iphone[status], { name: engine.name })}</p>
                                {content.iphone.map((paragraph, index) => (
                                    <p key={index}>
                                        <RichText text={paragraph} />
                                    </p>
                                ))}
                            </div>
                            <p className="mt-3">
                                <LocaleLink href="/ios#databases" className={textLinkClasses('standalone')}>
                                    {labels.iphone.link}
                                    <span aria-hidden="true">→</span>
                                </LocaleLink>
                            </p>
                        </MoreItem>
                    )}
                    {engine.limits.length > 0 && (
                        <MoreItem id="limits" title={labels.limits}>
                            <LimitsList engine={engine} copy={copy[engine.id]} number={labels.number} className={ITEM_TEXT} />
                        </MoreItem>
                    )}
                    {content.faq.map((entry) => (
                        <MoreItem key={entry.id} id={entry.id} title={entry.question}>
                            <p className={ITEM_TEXT}>
                                <RichText text={entry.answer} />
                            </p>
                        </MoreItem>
                    ))}
                    {content.otherTools !== null && (
                        <MoreItem id="other-tools" also={content.otherTools.also} title={labels.otherTools}>
                            <p className={ITEM_TEXT}>
                                <RichText text={content.otherTools.text} />
                            </p>
                        </MoreItem>
                    )}
                </MoreFrame>

                <FeatureClosing
                    labels={{
                        closing: labels.closing,
                        tiers: { free: m.pricing.tiers.free.name, starter: m.pricing.tiers.starter.name, team: m.pricing.tiers.team.name },
                    }}
                    paid={paid}
                    location={`database-${engine.id}`}
                />
            </RichTextProvider>
        </LandingLayout>
    );
}
