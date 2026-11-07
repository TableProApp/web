import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { FACTS } from '@/lib/data/facts';
import { docsHref } from './model';

interface FeatureHeroProps {
    title: string;
    lead: string;
    // A docs.tablepro.app path; the hub links the docs home.
    docs?: string;
    docsLabel: string;
    // The page's window, settling in once on load like the Home devices.
    children?: ReactNode;
}

// The same editorial hero as Home: left on the grid, one Download, the docs as a quiet link.
export default function FeatureHero({ title, lead, docs, docsLabel, children }: FeatureHeroProps) {
    const { locale, m } = useI18n();

    return (
        <section id="top" aria-labelledby="top-title" className="pt-12 pb-14 md:pt-16 md:pb-20">
            <Container>
                <h1
                    id="top-title"
                    className="max-w-[18ch] text-[2.375rem] leading-[1.04] font-[520] tracking-[-0.034em] text-balance text-foreground md:text-[3.25rem] xl:text-[3.75rem]"
                >
                    {title}
                </h1>
                <p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-[1.5] tracking-[-0.012em] text-pretty text-muted-foreground md:text-[1.1875rem]">{lead}</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <LocaleLink href="/download" onClick={() => trackDownload('feature-header')} className={buttonClasses('primary', 'lg', 'min-w-36')}>
                        {m.nav.download}
                    </LocaleLink>
                    <a
                        href={docsHref(FACTS.links.docs, docs ?? '/')}
                        hrefLang="en"
                        className="inline-flex items-center gap-1 text-[0.9375rem] font-medium tracking-[-0.009em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground"
                    >
                        {locale === 'en' ? docsLabel : `${docsLabel} ${m.common.englishOnly}`}
                        <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground" />
                    </a>
                </div>
                {children !== undefined && <div className="feature-hero-window mt-12 md:mt-16">{children}</div>}
            </Container>
        </section>
    );
}
