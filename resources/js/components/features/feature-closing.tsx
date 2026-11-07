import { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { paidByTier } from './model';
import type { FeatureLabels } from './types';

const LINK = 'text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground';

interface FeatureClosingProps {
    labels: FeatureLabels;
    // paid-features.json ids in display order; the hub passes none and a sentence of its own.
    paid: string[];
    body?: string;
    // The hub points to the iPhone and iPad app here.
    extra?: { href: string; label: string };
    location: string;
}

// The one place a page says what is paid: "Pro adds A and B. Everything else on this page is free." Then the way in.
export default function FeatureClosing({ labels, paid, body, extra, location }: FeatureClosingProps) {
    const { m, fmt } = useI18n();
    const groups = paidByTier(paid, PAID_FEATURES);
    const sentence =
        body ??
        (groups.length === 0
            ? labels.closing.allFree
            : [
                  ...groups.map((group) =>
                      fmt(labels.closing.tier, {
                          tier: labels.tiers[group.tier as keyof FeatureLabels['tiers']],
                          features: joinList(
                              group.features.map((feature) => feature.name),
                              m.common.list,
                          ),
                      }),
                  ),
                  labels.closing.rest,
              ].join(' '));

    return (
        <section id="get-started" aria-labelledby="get-started-title" className="py-16 md:py-24">
            <Container>
                <div className="grid gap-6 md:grid-cols-12 md:gap-x-8">
                    <h2 id="get-started-title" className="text-sm leading-[1.3] font-medium tracking-[-0.006em] text-muted-foreground md:col-span-4 lg:col-span-3">
                        {labels.closing.title}
                    </h2>
                    <div className="md:col-span-8 lg:col-span-9">
                        <p className="max-w-[40rem] text-[1.5rem] leading-[1.3] font-[480] tracking-[-0.022em] text-balance text-foreground md:text-[1.875rem]">{sentence}</p>
                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                            <LocaleLink href="/download" onClick={() => trackDownload(location)} className={buttonClasses('primary', 'lg', 'min-w-36')}>
                                {m.nav.download}
                            </LocaleLink>
                            <LocaleLink href="/pricing" className={`text-[0.9375rem] font-medium tracking-[-0.009em] ${LINK}`}>
                                {labels.closing.pricing}
                            </LocaleLink>
                            {extra !== undefined && (
                                <LocaleLink href={extra.href} className={`text-[0.9375rem] font-medium tracking-[-0.009em] ${LINK}`}>
                                    {extra.label}
                                </LocaleLink>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
