import { useEffect, type ReactNode } from 'react';
import { useLiveChat } from '@/components/site/chat-button';
import CampaignNotice from '@/components/campaign/campaign-notice';
import ConsentBar from '@/components/site/consent-bar';
import FrameRails from '@/components/shared/frame-rails';
import SiteFooter from '@/components/site/site-footer';
import SiteHeader from '@/components/site/site-header';
import TopBanner from '@/components/site/top-banner';
import { useI18n } from '@/i18n';
import { syncTheme } from '@/lib/theme';

interface Props {
    children: ReactNode;
    footerNewsletter?: boolean;
}

// Nothing here clips overflow: `overflow-x: hidden` on an ancestor would break the sticky header.
export default function LandingLayout({ children, footerNewsletter = true }: Props) {
    const { locale, m } = useI18n();

    // History navigation can restore a page in another language without a document load.
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    useEffect(() => syncTheme(), []);

    useLiveChat();

    return (
        <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:inline-flex focus:min-h-10 focus:items-center focus:rounded-control focus:bg-accent focus:px-4 focus:text-sm focus:font-medium focus:text-accent-foreground"
            >
                {m.a11y.skipToContent}
            </a>
            <TopBanner />
            <div className="sticky top-0 z-40">
                <SiteHeader />
            </div>
            <main id="main-content" tabIndex={-1} className="flex-1">
                {children}
            </main>
            <SiteFooter newsletter={footerNewsletter} />
            <FrameRails />
            <ConsentBar />
            <CampaignNotice />
        </div>
    );
}
