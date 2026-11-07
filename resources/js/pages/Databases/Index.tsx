import { usePage } from '@inertiajs/react';
import { groupRows } from '@/components/databases/format';
import HubGroup from '@/components/databases/hub-group';
import type { HubPageProps } from '@/components/databases/types';
import AreaNav from '@/components/features/area-nav';
import FeatureClosing from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import { MoreFrame, MoreItem } from '@/components/features/more-list';
import SEOHead from '@/components/seo/seo-head';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { FACTS } from '@/lib/data/facts';
import { absoluteUrl, breadcrumbNode, collectionPageNode, graph, macAppId } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

const ITEM_TEXT = 'mt-2 space-y-2 text-[0.9375rem] leading-[1.55] text-pretty text-muted-foreground';

function ItemLink({ href, children }: { href: string; children: string }) {
    return (
        <p className="mt-3">
            <LocaleLink href={href} className={textLinkClasses('standalone')}>
                {children}
                <span aria-hidden="true">→</span>
            </LocaleLink>
        </p>
    );
}

// The database hub, `/databases` in every locale (sitemap §A.3, §E.8): the area nav and hero of /features, then one
// band per category with its engines as a ruled list, the smaller parts as a list, and the closing line. Every
// published engine appears exactly once, and every count and name list comes from engines.json.
export default function DatabasesIndex({ content, groups, engines, taglines, iosEngines, platforms, request }: HubPageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    useRevealOnScroll('main > section:not(#top), main [data-reveal]');

    const names = (filter: (engine: (typeof engines)[number]) => boolean): string => joinList(engines.filter(filter).map((engine) => engine.name), m.common.list);
    const bands = groups.map((group) => ({ ...group, rows: groupRows(group, engines) })).filter((group) => group.rows.length > 0);
    const byId = new Map(engines.map((engine) => [engine.id, engine.name]));
    const onIos = joinList(
        iosEngines.flatMap((id) => byId.get(id) ?? []),
        m.common.list,
    );
    const syncedOnly = names((engine) => engine.ios.openable && !engine.ios.inPicker);
    const linuxTested = names((engine) => engine.linux === 'tested');
    const linuxUntested = names((engine) => engine.linux === 'untested');
    const more = content.more;

    const pageUrl = absoluteUrl(canonicalBaseUrl, path('/databases'));
    const context = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };

    return (
        <LandingLayout>
            <SEOHead
                title={content.seo.title}
                description={content.seo.description}
                jsonLd={graph([
                    collectionPageNode(context, {
                        url: pageUrl,
                        name: content.seo.title,
                        description: content.seo.description,
                        about: macAppId(canonicalBaseUrl),
                        breadcrumb: `${pageUrl}#breadcrumb`,
                        items: engines.flatMap((engine) => (engine.page === 'own' && engine.path !== null ? [{ name: engine.name, path: path(engine.path) }] : [])),
                    }),
                    breadcrumbNode(context, pageUrl, [{ name: m.seo.breadcrumbs.databases, path: path('/databases') }]),
                ])}
            />

            <AreaNav
                current="/databases"
                label={content.nav.label}
                items={[{ href: '/databases', label: content.nav.all }, ...bands.map((band) => ({ href: `#${band.id}`, label: content.groups[band.id] }))]}
            />
            <FeatureHero
                title={content.header.title}
                lead={fmt(content.header.lead, { count: engines.length, featured: names((engine) => engine.featured) })}
                docs="/databases"
                docsLabel={content.header.docs}
                location="databases"
            />

            {/* One grid per category, inside one block, so neighbours share a line (design-system §4.7). */}
            <div>
                <Container>
                    {bands.map((band, index) => (
                        <HubGroup key={band.id} id={band.id} title={content.groups[band.id]} rows={band.rows} taglines={taglines} release={content.labels.release} first={index === 0} />
                    ))}
                </Container>
            </div>

            <MoreFrame title={content.labels.more}>
                <MoreItem id="drivers" title={more.drivers.title}>
                    <div className={ITEM_TEXT}>
                        {more.drivers.text.map((paragraph, index) => (
                            <p key={index}>{fmt(paragraph, { bundled: names((engine) => engine.distribution === 'bundled') })}</p>
                        ))}
                    </div>
                    <p className="mt-3">
                        <TextLink href={`${FACTS.links.docs.replace(/\/+$/, '')}/features/plugins`} kind="standalone" external hrefLang="en">
                            {locale === 'en' ? more.drivers.docs : `${more.drivers.docs} ${m.common.englishOnly}`}
                        </TextLink>
                    </p>
                </MoreItem>
                {platforms.linux !== null && linuxTested !== '' && (
                    <MoreItem id="linux" title={more.linux.title}>
                        <div className={ITEM_TEXT}>
                            <p>{fmt(more.linux.tested, { engines: linuxTested })}</p>
                            {linuxUntested !== '' && <p>{fmt(more.linux.untested, { engines: linuxUntested })}</p>}
                            <p>{more.linux.others}</p>
                        </div>
                        <ItemLink href="/download#linux">{more.linux.link}</ItemLink>
                    </MoreItem>
                )}
                {platforms.ios !== null && onIos !== '' && (
                    <MoreItem id="iphone" title={more.iphone.title}>
                        <div className={ITEM_TEXT}>
                            <p>{fmt(more.iphone.picker, { engines: onIos })}</p>
                            {syncedOnly !== '' && <p>{fmt(more.iphone.synced, { engines: syncedOnly })}</p>}
                            <p>{more.iphone.others}</p>
                        </div>
                        <ItemLink href="/ios#databases">{more.iphone.link}</ItemLink>
                    </MoreItem>
                )}
                <MoreItem id="missing" title={more.missing.title}>
                    <p className={ITEM_TEXT}>{more.missing.text}</p>
                    {request !== null && (
                        <p className="mt-3">
                            <TextLink href={request} kind="standalone" external hrefLang="en">
                                {more.missing.link}
                            </TextLink>
                        </p>
                    )}
                </MoreItem>
            </MoreFrame>

            <FeatureClosing
                labels={{ closing: content.labels.closing, tiers: { free: m.pricing.tiers.free.name, starter: m.pricing.tiers.starter.name, team: m.pricing.tiers.team.name } }}
                paid={[]}
                body={content.closing.body}
                location="databases"
            />
        </LandingLayout>
    );
}
