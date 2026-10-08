import { absoluteUrl, breadcrumbNode, graph, organizationNode, webPageNode, type JsonLdGraph, type PublisherInput } from '@/lib/structured-data';

interface PlainPageInput {
    baseUrl: string;
    inLanguage: string;
    /** The page's path in its own locale, `/vi/faq`. */
    path: string;
    name: string;
    description: string;
    /** The visible breadcrumb trail, same-locale paths, the current page last. */
    crumbs: { name: string; path: string }[];
    organization: { description: string; sameAs: readonly string[]; publisher: PublisherInput };
}

/**
 * The structured data of a page that describes no product of its own: the
 * FAQ and the legal pages (architecture §1.6). The publisher, a `WebPage` in
 * the page's language, and the `BreadcrumbList` that matches the visible
 * breadcrumbs. No `FAQPage`: the questions are content, not markup.
 */
export function plainPageJsonLd({ baseUrl, inLanguage, path, name, description, crumbs, organization }: PlainPageInput): JsonLdGraph {
    const context = { baseUrl, inLanguage };
    const url = absoluteUrl(baseUrl, path);
    const trail = breadcrumbNode(context, url, crumbs);

    return graph([
        organizationNode(baseUrl, organization),
        webPageNode(context, { url, name, description, breadcrumb: `${url}#breadcrumb` }),
        trail,
    ]);
}
