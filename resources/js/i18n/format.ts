/**
 * Deterministic number formatting for text rendered on the server.
 *
 * Not `Intl.NumberFormat`: the ICU data in the SSR Node process and in the
 * reader's browser can differ, and a price that renders as `2,99 US$` on the
 * server and `2,99 $US` in the browser is a hydration mismatch. The patterns
 * come from the catalogs instead, so both sides produce the same bytes. Dates
 * shown at SSR time are formatted in PHP, with Carbon, for the same reason.
 *
 * Billing never changes with the locale: amounts are USD everywhere, and only
 * the way the number is written differs.
 */
import { interpolate } from './core.ts';

export interface NumberStyle {
    /** Decimal separator: `.` in English, `,` in Vietnamese. */
    decimal: string;
    /** Thousands separator: `,` in English, `.` in Vietnamese. */
    group: string;
}

export interface CurrencyStyle extends NumberStyle {
    /** Where the number sits, as `{amount}`: `${amount}` or `{amount} US$`. */
    pattern: string;
}

/**
 * A plain number with grouping, and with exactly `fractionDigits` decimals.
 */
export function formatNumber(value: number, style: NumberStyle, fractionDigits = 0): string {
    const fixed = Math.abs(value).toFixed(fractionDigits);
    const [integer, fraction] = fixed.split('.');
    const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, style.group);
    const sign = value < 0 ? '−' : '';

    return sign + (fraction ? `${grouped}${style.decimal}${fraction}` : grouped);
}

/**
 * A USD amount. Whole amounts drop their cents (`$24`), anything else shows
 * two decimals (`$2.99`, `2,99 US$`).
 */
export function formatUsd(amount: number, style: CurrencyStyle): string {
    const digits = Number.isInteger(amount) ? 0 : 2;

    return interpolate(style.pattern, { amount: formatNumber(amount, style, digits) });
}

export interface ListStyle {
    /** Between items: `, `. */
    separator: string;
    /** Before the last item: ` and ` / ` và `, with no serial comma. */
    last: string;
}

/**
 * Joins names for server-rendered prose: "Mac, iPhone and iPad".
 * `Intl.ListFormat` is fine after mount, but not during SSR (see above).
 */
export function joinList(items: readonly string[], style: ListStyle): string {
    if (items.length <= 1) {
        return items.join('');
    }

    return `${items.slice(0, -1).join(style.separator)}${style.last}${items[items.length - 1]}`;
}

/**
 * A short phrase whose words stay on one line: every space becomes a no-break
 * space (design-system §3.3, "&nbsp; in short fixed compounds"). For a date
 * ("2 tháng 10 năm 2026", "October 2, 2026") or a requirement ("Apple silicon
 * or Intel"), which otherwise wrapped to leave its last word alone on the next
 * line. Display only, and only for a few words: a long string would overflow.
 */
export function keepTogether(text: string): string {
    return text.replace(/ /g, '\u00a0');
}
