import type { ReactNode } from 'react';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';

/**
 * The outbound links `App\Services\Content\SiteFacts::links()` sends: every
 * URL from `facts.json` and `pricing.json`, or null where the data names none.
 */
export interface SiteLinks {
    docs: string | null;
    changelog: string | null;
    github: string | null;
    issues: string | null;
    discussions: string | null;
    sponsorsProgram: string | null;
    license: string | null;
    appStore: string | null;
    portal: string | null;
    email: string | null;
}

/**
 * Where each link tag in FAQ, iPhone-page and about-page copy goes.
 *
 * Copy marks a link with a tag named for its destination, `<pricing>pricing
 * page</pricing>`, and never holds a URL or a path: the destinations live
 * here, once, so a translator moves the words and cannot break the link.
 * Internal paths are English base paths; `LocaleLink` adds the reader's
 * locale. `/account` is the account app's and gets `?locale=` instead.
 */
const INTERNAL: Record<string, string> = {
    home: '/',
    sponsors: '/#sponsors',
    features: '/features',
    querying: '/features/querying',
    connections: '/features/connections',
    aiMcp: '/features/ai-mcp',
    sync: '/features/sync-and-teams',
    databases: '/databases',
    compare: '/compare',
    download: '/download',
    ios: '/ios',
    iosLimits: '/ios#limits',
    pricing: '/pricing',
    pricingLicense: '/pricing#license',
    pricingTeam: '/pricing#team',
    faq: '/faq',
    privacy: '/privacy',
    privacyMac: '/privacy#mac-app',
    privacyIos: '/privacy#ios-app',
    privacyPurchases: '/privacy#purchases',
    terms: '/terms',
    termsSupport: '/terms#support',
    refundPolicy: '/refund-policy',
    about: '/about',
};

type ExternalKey = 'docs' | 'changelog' | 'github' | 'issues' | 'discussions' | 'sponsorsProgram' | 'license' | 'portal' | 'appStore';

/** External destinations, by the `SiteLinks` key that holds their URL. `docs` and `changelog` are in English only. */
const EXTERNAL: Record<string, { key: ExternalKey; englishOnly: boolean }> = {
    docs: { key: 'docs', englishOnly: true },
    changelog: { key: 'changelog', englishOnly: true },
    source: { key: 'github', englishOnly: false },
    issues: { key: 'issues', englishOnly: false },
    discussions: { key: 'discussions', englishOnly: false },
    sponsorsProgram: { key: 'sponsorsProgram', englishOnly: false },
    agpl: { key: 'license', englishOnly: false },
    portal: { key: 'portal', englishOnly: false },
    appStore: { key: 'appStore', englishOnly: false },
};

/**
 * Renderers for every tag FAQ, iPhone-page and about-page copy may use, for `<Trans>`:
 * the link tags above, `<account>` (the account app, in the reader's
 * language), `<email>` (the support address; its text is the address unless
 * the copy gives other words) and `<ui>` (an app label in a click path).
 *
 * A tag whose destination the data does not name renders its words as plain
 * text, so a missing URL never becomes a broken link. A link to the English
 * documentation says so in a Vietnamese sentence.
 */
export function useContentTags(links: SiteLinks): Record<string, (text: string) => ReactNode> {
    const { locale, m } = useI18n();
    const tags: Record<string, (text: string) => ReactNode> = {
        ui: (text) => <span className="font-medium">{text}</span>,
        account: (text) => (
            <a href={`/account?locale=${locale}`} className={textLinkClasses('inline')}>
                {text}
            </a>
        ),
        email: (text) =>
            links.email !== null ? (
                <a href={`mailto:${links.email}`} className={textLinkClasses('inline')}>
                    {text}
                </a>
            ) : (
                text
            ),
    };

    for (const [name, path] of Object.entries(INTERNAL)) {
        tags[name] = (text) => (
            <LocaleLink href={path} className={textLinkClasses('inline')}>
                {text}
            </LocaleLink>
        );
    }

    for (const [name, { key, englishOnly }] of Object.entries(EXTERNAL)) {
        tags[name] = (text) => {
            const url = links[key];

            if (url === null) {
                return text;
            }

            return (
                <>
                    <a href={url} hrefLang={englishOnly ? 'en' : undefined} className={textLinkClasses('inline')}>
                        {text}
                    </a>
                    {englishOnly && locale !== 'en' && ` ${m.common.englishOnly}`}
                </>
            );
        };
    }

    return tags;
}
