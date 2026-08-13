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

export function buildOrganizationJsonLd(baseUrl: string): object {
    const trimmedBase = baseUrl.replace(/\/$/, '');

    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'TablePro',
        url: trimmedBase,
        logo: `${trimmedBase}/logo.png`,
        sameAs: [
            'https://github.com/TableProApp/TablePro',
            'https://x.com/TableProApp',
        ],
    };
}
