import { useId } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { SUPPORT_EMAIL } from '@/components/site/site-links';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { PricingCardVariant } from './pricing-card';

// The subject marks an inquiry, so each one can be counted before anything is built for it.
export const INQUIRY_SUBJECT = 'TablePro Enterprise';

interface EnterpriseCardProps {
    variant: PricingCardVariant;
    headingLevel: 'h2' | 'h3';
}

/**
 * Enterprise is a contact route, not a plan in the catalog: no price, no
 * checkout. It lays its rows on the same subgrid tracks as the paid cards, so
 * its title, "price", action and list line up with theirs. The list names what
 * a company may ask for, as questions to answer, not features on sale.
 */
export default function EnterpriseCard({ variant, headingLevel }: EnterpriseCardProps) {
    const { m } = useI18n();
    const id = useId();
    const Title = headingLevel;
    const copy = m.pricing.tiers.enterprise;
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(INQUIRY_SUBJECT)}`;

    return (
        <article
            aria-labelledby={`${id}-title`}
            className={cn(
                'grid content-start gap-4 lg:grid-rows-subgrid',
                variant === 'full' ? 'md:max-lg:grid-cols-2 md:max-lg:gap-x-8 lg:row-span-4' : 'lg:row-span-3',
            )}
        >
            <div className="md:max-lg:col-span-2">
                <Title id={`${id}-title`} className="type-h3 text-foreground">
                    {copy.name}
                </Title>
                <p className="type-small mt-1 text-muted-foreground">{copy.description}</p>
            </div>

            <div className="grid content-start gap-4 md:max-lg:col-start-1">
                <p className="type-h1 text-foreground">{copy.price}</p>
                <p className="type-small text-foreground">{copy.activation}</p>
            </div>

            <div className={cn('grid content-start gap-3 md:max-lg:col-start-1', variant === 'compact' && 'md:max-lg:max-w-sm')}>
                <a href={href} className={buttonClasses('secondary', 'md', 'w-full')}>
                    {copy.cta}
                </a>
            </div>

            {variant === 'full' && (
                <div className="-mx-(--cell-bleed) border-t border-rule px-(--cell-bleed) pt-4 md:max-lg:col-start-2 md:max-lg:row-span-2 md:max-lg:row-start-2 md:max-lg:border-t-0 md:max-lg:pt-0">
                    <p className="text-sm leading-[1.3] font-medium text-foreground">{copy.includesTitle}</p>
                    <ul className="type-small mt-3 grid list-disc gap-2 pl-5 text-foreground">
                        {copy.includes.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </article>
    );
}
