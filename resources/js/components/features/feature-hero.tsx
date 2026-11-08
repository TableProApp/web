import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { FACTS } from '@/lib/data/facts';
import { cn } from '@/lib/utils';
import { docsHref } from './model';

interface FeatureHeroProps {
    title: ReactNode;
    lead: ReactNode;
    // A docs.tablepro.app path; the hub links the docs home.
    docs?: string;
    docsLabel?: string;
    // In place of Download and the docs link: the /ios App Store badge. Null for none, as on /faq and /security.
    actions?: ReactNode;
    // In place of Download only, beside the docs link: /teams' See Team pricing.
    primary?: ReactNode;
    // Above the H1: a database page's breadcrumb and mark.
    eyebrow?: ReactNode;
    // Beside the text from 1024px: a database page's facts.
    aside?: ReactNode;
    location?: string;
    // False when the children settle in on their own, like the /ios devices.
    settle?: boolean;
    // The page's window, settling in once on load like the Home devices.
    children?: ReactNode;
}

// The same editorial hero as Home: left on the grid, one Download, the docs as a quiet link.
export default function FeatureHero({ title, lead, docs, docsLabel, actions, primary, eyebrow, aside, location = 'feature-header', settle = true, children }: FeatureHeroProps) {
    const { locale, m } = useI18n();

    const text = (
        <>
            {eyebrow}
            <h1
                id="top-title"
                className="max-w-[18ch] text-[2.375rem] leading-[1.04] font-[520] tracking-[-0.034em] text-balance text-foreground md:text-[3.25rem] xl:text-[3.75rem]"
            >
                {title}
            </h1>
            <p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-[1.5] tracking-[-0.012em] text-pretty text-muted-foreground md:text-[1.1875rem]">{lead}</p>
            {actions === null ? null : actions !== undefined ? (
                <div className="mt-8">{actions}</div>
            ) : (
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                    {primary ?? (
                        <LocaleLink href="/download" onClick={() => trackDownload(location)} className={buttonClasses('primary', 'lg', 'min-w-36')}>
                            {m.nav.download}
                        </LocaleLink>
                    )}
                    {docsLabel !== undefined && (
                        <a
                            href={docsHref(FACTS.links.docs, docs ?? '/')}
                            hrefLang="en"
                            className="inline-flex items-center gap-1 text-[0.9375rem] font-medium tracking-[-0.009em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground"
                        >
                            {locale === 'en' ? docsLabel : `${docsLabel} ${m.common.englishOnly}`}
                            <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground" />
                        </a>
                    )}
                </div>
            )}
        </>
    );

    return (
        <section id="top" aria-labelledby="top-title" className="pt-12 pb-14 md:pt-16 md:pb-20">
            <Container>
                {aside === undefined ? (
                    text
                ) : (
                    <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-8">
                        <div className="min-w-0 lg:col-span-7 xl:col-span-8">{text}</div>
                        <div className="min-w-0 lg:col-span-5 xl:col-span-4">{aside}</div>
                    </div>
                )}
                {children !== undefined && <div className={cn('mt-12 md:mt-16', settle && 'feature-hero-window')}>{children}</div>}
            </Container>
        </section>
    );
}
