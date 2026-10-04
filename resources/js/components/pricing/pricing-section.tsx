import type { ReactNode } from 'react';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import PricingPlans from './pricing-plans';
import type { CheckoutProp } from './types';

interface PricingSectionProps {
    /** The `checkout` prop from `App\Support\Pricing\Checkout::props()`. */
    checkout: CheckoutProp;
    /** The section's id. `pricing` on the homepage: shipped Mac builds open `/?ref=…#pricing`. */
    id?: string;
    /**
     * An empty anchor inside the section for an older id that pointed here
     * (sitemap §D: `#license`). Null for none.
     */
    aliasId?: string | null;
    /** The page's own heading and lead, when its content file has them; the catalog's otherwise. */
    title?: ReactNode;
    lead?: ReactNode;
    tone?: 'base' | 'surface';
}

/**
 * The homepage's pricing section (sitemap §D, row 9; design-system §8.1 §9):
 * a heading and one line on the free core and open source, then the same
 * working plan block as `/pricing`, without the Includes lists, and a link to
 * the full comparison.
 *
 * It is the target of the Mac app's `/?ref=…#pricing` links, so it renders
 * `id="pricing"` on `/` and on `/vi`, and keeps `#license` as an alias.
 */
export default function PricingSection({ checkout, id = 'pricing', aliasId = 'license', title, lead, tone = 'base' }: PricingSectionProps) {
    const { m } = useI18n();

    return (
        <Section
            id={id}
            tone={tone}
            title={title ?? m.pricing.section.title}
            lead={lead ?? m.pricing.section.lead}
            aside={
                <LocaleLink href="/pricing" className={textLinkClasses('standalone')}>
                    {m.pricing.comparePlans}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
            }
        >
            {aliasId && <span id={aliasId} aria-hidden="true" />}
            <PricingPlans checkout={checkout} variant="compact" />
        </Section>
    );
}
