import { GITHUB_REPO_URL } from '@/data/links';
import { ENGINE_COUNT } from '@/data/engines';

export interface BreadcrumbCrumb {
    name: string;
    path: string;
}

export function buildBreadcrumbJsonLd(crumbs: BreadcrumbCrumb[], baseUrl: string): object {
    const trimmedBase = baseUrl.replace(/\/$/, '');

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: `${trimmedBase}${crumb.path.startsWith('/') ? crumb.path : `/${crumb.path}`}`,
        })),
    };
}

/**
 * The `@id` is what lets other nodes point at this one instead of repeating it.
 * Without it a page emits three disconnected blobs in one script and nothing
 * says the application and the publisher are related.
 */
export function buildOrganizationJsonLd(baseUrl: string): object {
    const trimmedBase = baseUrl.replace(/\/$/, '');

    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${trimmedBase}/#organization`,
        name: 'TablePro',
        url: trimmedBase,
        // An ImageObject with real dimensions, not a bare URL string.
        logo: {
            '@type': 'ImageObject',
            url: `${trimmedBase}/logo.png`,
            width: 256,
            height: 256,
        },
        /*
         * Two apps, not one, and the engine count belongs to the Mac.
         *
         * This used to read "a native database client for macOS, iPadOS and iOS
         * covering N engines", which attached the Mac's grid to the phone. The
         * iPhone app offers ten in its connection form, so the old sentence
         * overstated it by the better part of twenty.
         */
        description:
            `TablePro builds native database clients for macOS, iOS and iPadOS, released as open source under AGPLv3. The Mac app covers ${ENGINE_COUNT} engines.`,
        // All five profiles the footer links, not two of them.
        sameAs: [
            GITHUB_REPO_URL,
            'https://x.com/TableProApp',
            'https://discord.gg/hCNmUUbnD4',
            'https://www.facebook.com/tableproapp',
            'https://t.me/tablepro_app',
        ],
    };
}
