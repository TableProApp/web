import { LOCALES, useI18n } from '@/i18n';
import type { Regional } from '@/lib/regional-pricing';

/** The country's name in the page's language: "Việt Nam" on a Vietnamese page, "Vietnam" on an English one. */
function countryName(country: string, intl: string): string {
    try {
        return new Intl.DisplayNames([intl], { type: 'region' }).of(country) ?? country;
    } catch {
        return country;
    }
}

/**
 * The line that says why the plan prices are struck through: the reader's
 * country and its discount, which checkout applies by itself.
 *
 * Rendered only after the platform has answered, in the browser, so the
 * country name is formatted there and never meets the server render.
 */
export default function RegionalNote({ regional }: { regional: Regional }) {
    const { locale, m, fmt } = useI18n();

    return (
        <p className="type-small font-medium text-foreground">
            {fmt(m.pricing.regional.note, { country: countryName(regional.country, LOCALES.supported[locale].intl), percent: regional.percent })}
        </p>
    );
}
