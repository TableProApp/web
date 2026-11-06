import { useI18n } from '@/i18n';
import { formatNumber } from '@/i18n/format';
import { cn } from '@/lib/utils';

interface SalePriceProps {
    amount: number;
    className?: string;
}

// The same text as `formatUsd`, with the cents set smaller so $47.40 reads as a price rather than a calculation.
export default function SalePrice({ amount, className }: SalePriceProps) {
    const { m } = useI18n();
    const style = m.pricing.currency;
    const digits = Number.isInteger(amount) ? 0 : 2;
    const number = formatNumber(amount, style, digits);
    const [before, after = ''] = style.pattern.replace(/ /g, ' ').split('{amount}');
    const cut = digits === 0 ? number.length : number.lastIndexOf(style.decimal);

    // "$" stays the size of the number; a longer symbol such as "US$" would outweigh it.
    const affix = (text: string) => (text.trim().length > 1 ? <span className="sale-affix">{text}</span> : text);

    return (
        <span className={cn('tabular-nums', className)}>
            {affix(before)}
            {number.slice(0, cut)}
            {cut < number.length && <span className="sale-cents">{number.slice(cut)}</span>}
            {affix(after)}
        </span>
    );
}
