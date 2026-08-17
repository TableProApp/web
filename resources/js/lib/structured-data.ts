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
        description:
            'TablePro builds a native database client for macOS, iPadOS and iOS covering 25 engines, released as open source under AGPLv3.',
        // All five profiles the footer links, not two of them.
        sameAs: [
            'https://github.com/TableProApp/TablePro',
            'https://x.com/TableProApp',
            'https://discord.gg/hCNmUUbnD4',
            'https://www.facebook.com/tableproapp',
            'https://t.me/tablepro_app',
        ],
    };
}
