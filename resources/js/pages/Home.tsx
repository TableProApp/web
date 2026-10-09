import { usePage } from '@inertiajs/react';
import AiSection from '@/components/home/ai-section';
import { availability as availabilityFor } from '@/components/home/availability';
import DatabasesSection from '@/components/home/databases-section';
import Hero from '@/components/home/hero';
import OpenSourceSection from '@/components/home/open-source-section';
import PlatformsSection from '@/components/home/platforms-section';
import SafetySection from '@/components/home/safety-section';
import SponsorsSection from '@/components/home/sponsors-section';
import { homeJsonLd } from '@/components/home/structured-data';
import SwitchSection from '@/components/home/switch-section';
import TestimonialsSection from '@/components/home/testimonials-section';
import type { HomePageProps } from '@/components/home/types';
import WorkflowsSection from '@/components/home/workflows-section';
import PricingSection from '@/components/pricing/pricing-section';
import SEOHead from '@/components/seo/seo-head';
import { LOCALES, useI18n } from '@/i18n';
import { examplesText } from '@/lib/data/paid-features';
import LandingLayout from '@/layouts/landing-layout';

/**
 * `/` and `/vi` (sitemap §A.1, §D; positioning; design-system §8.1).
 *
 * Eleven sections in the order a first-time reader asks their questions: what it
 * is and where it runs, whether it supports their database, who sponsors it
 * (third, by the owner's decision), what they would do with it, whether it is
 * safe on production, what the AI can touch, how the Mac and iPhone apps
 * relate, how to bring connections over, what people who use it say, what
 * costs money, and where the code is. Section ids are English in every language, and the older ids
 * (`#mcp`, `#mobile`, `#compare`, `#license`) are empty anchors inside the
 * sections that replaced them. `#pricing` is where shipped Mac builds land
 * with `/?ref=…#pricing`.
 *
 * Copy is `content/{locale}/home.json`. Every platform, requirement, engine,
 * format, plan and price comes from resources/data, so nothing here is typed
 * twice and nothing is counted by hand.
 */
/** Positioning §5: a homepage title longer than this falls back to the "for developers" form. */
const TITLE_LIMIT = 60;

export default function Home({ content, engines, categories, iosEngines, testimonials, checkout }: HomePageProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();

    const availability = availabilityFor(m, { mac: content.hero.macCaption, ios: content.hero.iosCaption });
    const featuredEngines = engines.filter((engine) => engine.featured).map((engine) => engine.name);
    const macApp = m.platforms.app.mac;
    const iosApp = m.platforms.app.ios;
    /* The platforms in the title come from platforms.json, so it follows the apps that ship. */
    const listedTitle = fmt(content.seo.title, { deviceList: availability.deviceList });
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

            <Hero content={content.hero} availability={availability} featuredEngines={featuredEngines.join(', ')} />
            <DatabasesSection
                content={content.databases}
                engines={engines}
                categories={categories}
                iosEngines={iosEngines}
                availability={availability}
                macApp={macApp}
            />
            <SponsorsSection content={content.sponsors} />
            <WorkflowsSection content={content.workflows} engines={engines} />
            <SafetySection content={content.safety} />
            <AiSection content={content.ai} />
            <PlatformsSection content={content.platforms} availability={availability} />
            <SwitchSection content={content.switch} macApp={macApp} />
            <TestimonialsSection content={content.testimonials} quotes={testimonials} />
            <PricingSection
                checkout={checkout}
                title={content.pricing.title}
                lead={fmt(content.pricing.lead, {
                    macApp,
                    iosApp,
                    starterExamples: examplesText('starter', m.common.list),
                    teamExamples: examplesText('team', m.common.list),
                })}
            />
            <OpenSourceSection content={content.openSource} availability={availability} />
        </LandingLayout>
    );
}
