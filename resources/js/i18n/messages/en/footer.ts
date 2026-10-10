/**
 * The `footer` namespace: the five link groups, the newsletter block and the
 * bottom row (sitemap §B.3; positioning §10.2).
 *
 * `groups` are identity keys: no platform name, version or number. The
 * "iPhone & iPad" link in the Product group renders from `platforms.json`.
 * `bottom` is not an identity key, because it names the AGPLv3.
 */
export default {
    heading: 'Site links',
    groups: {
        product: {
            title: 'Product',
            features: 'Features',
            databases: 'Databases',
            integrations: 'Integrations',
            pricing: 'Pricing',
            download: 'Download',
            compare: 'Compare',
        },
        resources: {
            title: 'Resources',
            docs: 'Documentation',
            changelog: 'Changelog',
            blog: 'Blog',
            faq: 'FAQ',
            about: 'About',
            brand: 'Brand',
            source: 'Source code',
            reportBug: 'Report a bug',
        },
        support: {
            title: 'Support',
            account: 'Account',
            troubleshooting: 'Troubleshooting',
            email: 'Email support',
            chat: 'Live chat',
        },
        community: {
            title: 'Community',
            discussions: 'GitHub Discussions',
            discord: 'Discord',
            x: 'X',
            telegram: 'Telegram',
            sponsor: 'Sponsor TablePro',
        },
        legal: {
            title: 'Legal',
            privacy: 'Privacy',
            security: 'Security',
            terms: 'Terms',
            refund: 'Refund policy',
            cookies: 'Cookie settings',
        },
    },
    newsletter: {
        title: 'Release notes by email',
        body: 'Occasional release notes. Unsubscribe in any email.',
        note: 'Confirm your subscription by email. <link>Privacy policy</link>',
    },
    bottom: {
        copyright: '© {year} TablePro, made by {maker} in {city}. Source code under the AGPLv3.',
    },
};
