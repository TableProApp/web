/**
 * The homepage's structured data (architecture §1.6, positioning §6.3): the
 * organization, the one site, the Mac app and the iPhone and iPad app, from
 * the shared builders so `#organization`, `#website`, `#app` and `#ios-app`
 * say the same thing on every page that emits them.
 *
 * Visible content only. The Mac app's offers are the prices the `#pricing`
 * section shows; there is no rating, review, FAQ, file size or download
 * count, and `softwareVersion` is left out because this page reads no live
 * release source (it is on /download, which does).
 */
import { planOffers } from '@/components/pricing/offers';
import type { Messages } from '@/i18n';
import { LOCALES } from '@/i18n';
import { FACTS, PUBLISHER } from '@/lib/data/facts';
import { appStoreUrl, architecturesText, deviceList, macPlatform, requirementText } from '@/lib/data/platforms';
import { PRICING } from '@/lib/data/pricing';
import {
    absoluteUrl,
    graph,
    iosAppNode,
    macAppNode,
    organizationNode,
    organizationProfiles,
    websiteNode,
    type JsonLdGraph,
} from '@/lib/structured-data';
import { releasedIos } from './availability';

type Interpolate = (template: string, values: Record<string, string | number>) => string;

interface HomeJsonLdInput {
    baseUrl: string;
    /** The page's `hreflang` value. */
    inLanguage: string;
    m: Messages;
    fmt: Interpolate;
    /** Prefixes a root-relative path with the page's locale. */
    path: (path: string) => string;
    /** The featured engine names, in data order. */
    featuredEngines: readonly string[];
}

export function homeJsonLd({ baseUrl, inLanguage, m, fmt, path, featuredEngines }: HomeJsonLdInput): JsonLdGraph {
    const context = { baseUrl, inLanguage };
    const mac = macPlatform();
    const ios = releasedIos();
    const store = ios !== null ? appStoreUrl() : '';
    const longDescription = fmt(m.seo.product.long, {
        // The template ends "… and more", so the names take commas only.
        featuredEngines: featuredEngines.join(', '),
        deviceList: deviceList(m.common.list),
    });

    return graph([
        organizationNode(baseUrl, {
            description: m.seo.product.short,
            sameAs: organizationProfiles(FACTS.links),
            publisher: PUBLISHER,
        }),
        websiteNode(context, {
            description: longDescription,
            languages: Object.values(LOCALES.supported).map((locale) => locale.hreflang),
        }),
        macAppNode(context, {
            description: longDescription,
            alternateName: m.seo.macApp.alternateName,
            subCategory: m.seo.macApp.subCategory,
            operatingSystem: mac.requirements.systems.join(', '),
            requirements: `${requirementText(mac, m.platforms)}, ${architecturesText(m.platforms)}`,
            licenseUrl: FACTS.links.license,
            downloadUrl: absoluteUrl(baseUrl, path('/download')),
            offers: planOffers(m, fmt),
        }),
        ios !== null &&
            store !== '' &&
            iosAppNode(context, {
                alternateName: m.seo.iosApp.alternateName,
                operatingSystem: ios.requirements.systems.join(', '),
                requirements: requirementText(ios, m.platforms),
                installUrl: store,
                licenseUrl: FACTS.links.license,
                currency: PRICING.currency,
            }),
    ]);
}
