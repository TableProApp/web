/**
 * The `nav` namespace: the header and the mobile menu (sitemap §B.1, §B.2;
 * positioning §10.1).
 *
 * These are identity keys. They name no platform, version or number, so they
 * stay true when a platform ships (positioning §13). The "iPhone & iPad" entry
 * renders from `platforms.json`, and "Download for Mac" from the availability
 * keys, never from here.
 */
export default {
    label: 'Main',
    features: 'Features',
    featureLinks: {
        all: 'All features',
        querying: 'Querying',
        dataEditing: 'Data editing',
        schema: 'Schema',
        importExport: 'Import & export',
        aiMcp: 'AI & MCP',
        connections: 'Connections',
        syncTeams: 'Sync & teams',
    },
    databases: 'Databases',
    pricing: 'Pricing',
    docs: 'Docs',
    docsLabel: 'Docs',
    blog: 'Blog',
    faq: 'FAQ',
    account: 'Account',
    github: 'GitHub',
    githubStars: {
        one: 'GitHub, {count} star',
        other: 'GitHub, {count} stars',
    },
    download: 'Download',
    menu: 'Menu',
    closeMenu: 'Close menu',
};
