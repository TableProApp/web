import { useId } from 'react';
import { SUPPORT_EMAIL } from '@/components/site/site-links';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n } from '@/i18n';
import { formatUsd } from '@/i18n/format';
import { PRICING } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';

// The subject marks an inquiry, so each one can be counted before anything is built for it.
export const INQUIRY_SUBJECT = 'TablePro Enterprise';
export const SELF_HOSTED_SUBJECT = 'TablePro Enterprise Self-Hosted';

interface EnterpriseRowProps {
    plan: 'enterprise' | 'selfHosted';
    headingLevel: 'h2' | 'h3';
    className?: string;
}

export default function EnterpriseRow({ plan, headingLevel, className }: EnterpriseRowProps) {
    const { m } = useI18n();
    const id = useId();
    const Title = headingLevel;
    const copy = m.pricing.tiers[plan];
    const subject = plan === 'selfHosted' ? SELF_HOSTED_SUBJECT : INQUIRY_SUBJECT;
    const values = { price: formatUsd(PRICING.selfHosted.prices.yearly, m.pricing.currency), min: PRICING.selfHosted.seats.min };
    const tags = {
        link: (text: string) => (
            <LocaleLink href="/teams#self-hosted" className={textLinkClasses('inline')}>
                {text}
            </LocaleLink>
        ),
    };

    return (
        <article aria-labelledby={`${id}-title`} className={cn('flex flex-wrap items-baseline gap-x-6 gap-y-2 [--cell-pad-y:1.25rem]', className)}>
            <Title id={`${id}-title`} className="text-base leading-[1.4] font-semibold text-foreground">
                {copy.name}
            </Title>
            <p className="type-small min-w-0 text-muted-foreground max-md:order-last max-md:basis-full md:flex-1">
                <Trans text={copy.description} values={values} tags={tags} />
            </p>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`} className={textLinkClasses('standalone', 'max-md:ml-auto')}>
                {copy.cta}
                <span aria-hidden="true">→</span>
            </a>
        </article>
    );
}
