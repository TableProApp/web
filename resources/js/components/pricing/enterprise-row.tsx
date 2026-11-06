import { useId } from 'react';
import { SUPPORT_EMAIL } from '@/components/site/site-links';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

// The subject marks an inquiry, so each one can be counted before anything is built for it.
export const INQUIRY_SUBJECT = 'TablePro Enterprise';

interface EnterpriseRowProps {
    headingLevel: 'h2' | 'h3';
    className?: string;
}

export default function EnterpriseRow({ headingLevel, className }: EnterpriseRowProps) {
    const { m } = useI18n();
    const id = useId();
    const Title = headingLevel;
    const copy = m.pricing.tiers.enterprise;

    return (
        <article aria-labelledby={`${id}-title`} className={cn('flex flex-wrap items-baseline gap-x-6 gap-y-2 [--cell-pad-y:1.25rem]', className)}>
            <Title id={`${id}-title`} className="text-base leading-[1.4] font-semibold text-foreground">
                {copy.name}
            </Title>
            <p className="type-small min-w-0 text-muted-foreground max-md:order-last max-md:basis-full md:flex-1">{copy.description}</p>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(INQUIRY_SUBJECT)}`} className={textLinkClasses('standalone', 'max-md:ml-auto')}>
                {copy.cta}
                <span aria-hidden="true">→</span>
            </a>
        </article>
    );
}
