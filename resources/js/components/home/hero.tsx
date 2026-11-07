import { ArrowUpRight } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { FACTS } from '@/lib/data/facts';
import { trackDownload } from '@/lib/analytics';
import HeroDevices from './hero-devices';
import type { HomeContent } from './types';

// The identity copy holds no platform, version or count (positioning §13); the devices below show the platforms.
export default function Hero({ content }: { content: HomeContent['hero'] }) {
    return (
        <section id="top" aria-labelledby="top-title" className="overflow-x-clip pt-14 pb-16 md:pt-20 md:pb-24">
            {/* Anchors of the sections this hero replaced, so old links still land on the page. */}
            <span id="platforms" aria-hidden="true" />
            <span id="mobile" aria-hidden="true" />
            <Container>
                <h1
                    id="top-title"
                    className="text-[2.375rem] leading-[1.04] font-[520] tracking-[-0.034em] text-balance text-foreground md:text-[3.25rem] xl:text-[3.75rem]"
                >
                    {content.title}
                </h1>
                <p className="mt-5 max-w-[30rem] text-[1.0625rem] leading-[1.5] tracking-[-0.012em] text-pretty text-muted-foreground md:text-[1.1875rem]">
                    {content.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <LocaleLink href="/download" onClick={() => trackDownload('home-hero')} className={buttonClasses('primary', 'lg', 'min-w-36')}>
                        {content.download}
                    </LocaleLink>
                    <a
                        href={FACTS.links.docs}
                        className="inline-flex items-center gap-1 text-[0.9375rem] font-medium tracking-[-0.009em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground"
                    >
                        {content.docs}
                        <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground" />
                    </a>
                </div>
                <HeroDevices className="mt-12 md:mt-16" />
            </Container>
        </section>
    );
}
