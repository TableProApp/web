import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { Trans } from '@/i18n';
import type { Availability } from './availability';
import PlatformActions from './platform-actions';
import type { HomeContent } from './types';

interface HeroProps {
    content: HomeContent['hero'];
    availability: Availability;
    /** The featured engine names, comma-joined: the subtitle ends "… and more". */
    featuredEngines: string;
}

/**
 * Section 1, `#top` (sitemap §D; positioning §3; design-system §8.1).
 *
 * The H1 and subtitle are identity copy: no platform, version or number, so
 * they hold when a platform ships. Platforms appear only in the captions under
 * the two actions, which are built from platforms.json. "and more" jumps to the
 * databases section; "See pricing" to `#pricing`, where shipped Mac builds
 * already send people with `/?ref=…#pricing`.
 *
 * The two actions are a row of cells across the page grid, the hero's one
 * piece of the frame (design-system §4.7); the headline above them stays
 * unlined.
 *
 * The window below is the page's one priority image. While it is a
 * placeholder it requests nothing, and in production it is left out; once
 * supplied, the controller's `lcpAsset` preloads the variant the reader's
 * theme and width show.
 */
export default function Hero({ content, availability, featuredEngines }: HeroProps) {
    const shown = useShownSlot();

    return (
        <section id="top" aria-labelledby="top-title" className="pt-12 pb-8 md:pt-16 md:pb-10 xl:pt-18 xl:pb-12">
            <Container>
                <div className="max-w-[50rem]">
                    <h1 id="top-title" className="type-display text-balance text-foreground">
                        {content.title}
                    </h1>
                    <p className="type-lead mt-5 max-w-[60ch] text-muted-foreground">
                        <Trans
                            text={content.subtitle}
                            values={{ featuredEngines }}
                            tags={{
                                more: (text) => (
                                    <a href="#databases" className={textLinkClasses('inline')}>
                                        {text}
                                    </a>
                                ),
                            }}
                        />
                    </p>
                </div>

                <PlatformActions
                    location="hero"
                    availability={availability}
                    className="mt-8 md:mt-10"
                    macExtra={
                        <LocaleLink href="/download#mac" className={textLinkClasses('standalone', 'mt-1')}>
                            {content.otherWays}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    }
                />

                <p className="type-small mt-8 max-w-[60ch] text-muted-foreground">
                    <Trans
                        text={content.business}
                        values={{ paidPlatformApps: availability.paidPlatformApps }}
                        tags={{
                            pricing: (text) => (
                                <a href="#pricing" className={textLinkClasses('inline')}>
                                    {text}
                                </a>
                            ),
                        }}
                    />
                </p>

                {shown('mac-hero-window') && (
                    <div className="mt-12 md:mt-16">
                        <AssetSlot id="mac-hero-window" />
                    </div>
                )}
            </Container>
        </section>
    );
}
