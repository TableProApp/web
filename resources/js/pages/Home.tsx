import { usePage } from '@inertiajs/react';
import CampaignBand from '@/components/campaign/campaign-band';
import Closing from '@/components/home/closing';
import FeatureTabs from '@/components/home/feature-tabs';
import Hero from '@/components/home/hero';
import { DatabaseBand, SponsorBand } from '@/components/home/index-bands';
import Quotes from '@/components/home/quotes';
import { homeJsonLd } from '@/components/home/structured-data';
import type { HomePageProps } from '@/components/home/types';
import PricingSection from '@/components/pricing/pricing-section';
import SEOHead from '@/components/seo/seo-head';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { LOCALES, useI18n } from '@/i18n';
import { deviceList } from '@/lib/data/platforms';
import { PRICING } from '@/lib/data/pricing';
import LandingLayout from '@/layouts/landing-layout';

// Positioning §5: a homepage title longer than this falls back to the "for developers" form.
const TITLE_LIMIT = 60;

/**
 * `/` and every locale's home (sitemap §D; design-system §8.1): the hero with every platform's app, the databases and
 * the sponsors as two index bands, the features as tabs with each one's Mac and Linux capture, three quotes, pricing,
 * and the open source band. Section ids are English in every language; the ids of the sections this page replaced are
 * empty anchors, and `#pricing` (with its `#license` alias) is where shipped Mac builds land.
 *
 * While a dated sale is live, its band comes first, above the hero (`CampaignBand`).
 */
export default function Home({ content, engines, testimonials }: HomePageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    useRevealOnScroll('main > section:not(#top)');

    const featuredEngines = engines.filter((engine) => engine.featured).map((engine) => engine.name);
    // The platforms in the title come from platforms.json, so it follows the apps that ship.
    const listedTitle = fmt(content.seo.title, { deviceList: deviceList(m.common.list) });
    const title = listedTitle.length <= TITLE_LIMIT ? listedTitle : content.seo.titleFallback;

    return (
        <LandingLayout>
            <SEOHead
                title={title}
                titleTemplate={false}
                description={content.seo.description}
                jsonLd={homeJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    m,
                    fmt,
                    path,
                    featuredEngines,
                })}
            />

            <CampaignBand variant="home" />
            <Hero content={content.hero} />
            <DatabaseBand content={content.databases} engines={engines} />
            <SponsorBand content={content.sponsors} />
            <FeatureTabs content={content.features} />
            <Quotes content={content.testimonials} quotes={testimonials} />
            <PricingSection title={content.pricing.title} lead={fmt(content.pricing.lead, { deviceLimit: PRICING.license.deviceLimit })} />
            <Closing content={content.openSource} download={content.hero.download} />
        </LandingLayout>
    );
}
