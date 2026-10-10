/**
 * The `seo` namespace: the words in the head and in structured data that no
 * single page owns.
 *
 * - `titleTemplate` wraps every page title except the homepage's, which
 *   carries the brand first.
 * - `product.short` and `product.long` are positioning §6.1's product
 *   descriptions: the short one is the Organization `description`, the long
 *   one the WebSite's and the Mac app's. `product.short` is an identity key
 *   (positioning §13): no platform names, versions or digits.
 * - `{featuredEngines}` and `{deviceList}` are filled from `engines.json` and
 *   `platforms.json` by the caller, never typed here.
 * - `breadcrumbs` are the section roots of the visible breadcrumbs and of
 *   `BreadcrumbList`, which must match each other.
 */
export default {
    titleTemplate: '{title} – TablePro',
    product: {
        short: 'TablePro is a native, open-source database client.',
        long: 'TablePro is a native, open-source database client. Run queries, browse and edit data in {featuredEngines} and more. Available for {deviceList}.',
    },
    macApp: {
        alternateName: 'TablePro for Mac',
        subCategory: 'Database client',
    },
    iosApp: {
        alternateName: 'TablePro for iPhone and iPad',
    },
    breadcrumbs: {
        features: 'Features',
        databases: 'Databases',
        compare: 'Compare',
        integrations: 'Integrations',
        blog: 'Blog',
    },
};
