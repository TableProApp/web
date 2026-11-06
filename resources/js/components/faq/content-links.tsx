import type { ReactNode } from 'react';
import { accountHref } from '@/components/site/site-links';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';

// From SiteFacts::links(); null where the data names no URL.
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

// Copy names a link by a tag and never holds a path, so a translator cannot break it. LocaleLink adds the locale.
const INTERNAL: Record<string, string> = {
    home: '/',
    sponsors: '/sponsors',
    features: '/features',
    querying: '/features/querying',
    connections: '/features/connections',
    aiMcp: '/features/ai-mcp',
    sync: '/features/sync-and-teams',
    databases: '/databases',
    compare: '/compare',
    download: '/download',
    downloadLinux: '/download#linux',
    downloadPlatforms: '/download#platforms',
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
    security: '/security',
};

type ExternalKey = 'docs' | 'changelog' | 'github' | 'issues' | 'discussions' | 'sponsorsProgram' | 'license' | 'portal' | 'appStore';

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

// A tag whose URL the data does not name renders its words as plain text, never a broken link.
export function useContentTags(links: SiteLinks): Record<string, (text: string) => ReactNode> {
    const { locale, m } = useI18n();
    const tags: Record<string, (text: string) => ReactNode> = {
        ui: (text) => <span className="font-medium">{text}</span>,
        account: (text) => (
            <a href={accountHref(locale)} className={textLinkClasses('inline')}>
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
        brand: (text) => (
            <>
                <a href="/brand" hrefLang="en" className={textLinkClasses('inline')}>
                    {text}
                </a>
                {locale !== 'en' && ` ${m.common.englishOnly}`}
            </>
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
