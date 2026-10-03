import { cn } from '@/lib/utils';

interface DatabaseMarkProps {
    /** The vendor mark, in its own colours. */
    icon?: string | null;
    /**
     * The vendor's official mark for dark grounds, when the owner has supplied
     * one. Without it, the regular mark sits on a small white tile in dark mode.
     */
    iconDark?: string | null;
    /** Two letters drawn when no mark file exists for the engine. */
    monogram?: string | null;
    /** The engine's name. The mark is decorative: the name is always shown beside it. */
    name: string;
    /** 24px in lists and tables (the default), 32 or 40 where a mark leads a card. */
    size?: 24 | 32 | 40;
    className?: string;
}

const BOX = { 24: 'size-6', 32: 'size-8', 40: 'size-10' } as const;
/**
 * The footprint of every mark: the mark plus 4px each side, in both themes and
 * in every branch, so the tile that appears in dark mode moves nothing and a
 * name beside a monogram starts where a name beside a vendor mark does (a
 * 24px monogram box beside 32px image tiles shifted those names 8px left).
 */
const TILE = { 24: 'size-8', 32: 'size-10', 40: 'size-12' } as const;

/**
 * A database's mark (design-system §5.3.18).
 *
 * Original colours and no filters: no `grayscale`, `opacity` or `invert`,
 * which also alter trademarks. In dark mode the official dark variant is used
 * when the data has one; otherwise the regular mark sits on a white tile with
 * the chip radius, which is how vendors themselves show a light-only mark on a
 * dark page. The tile's footprint is reserved in light mode too, so switching
 * theme moves nothing. Light and dark switch on the theme class, never the OS.
 *
 * Decorative in every branch (`alt=""`): the engine's name is always rendered
 * beside it, and that is the accessible label.
 */
export default function DatabaseMark({ icon, iconDark, monogram, name, size = 24, className }: DatabaseMarkProps) {
    if (!icon) {
        return (
            <span aria-hidden="true" className={cn('inline-grid shrink-0 place-items-center', TILE[size], className)}>
                <span
                    className={cn(
                        'inline-grid place-items-center rounded-chip border border-rule bg-surface font-mono text-[0.8125rem] leading-none text-muted-foreground',
                        BOX[size],
                    )}
                >
                    {monogram ?? name.slice(0, 2)}
                </span>
            </span>
        );
    }

    const image = (src: string, extra?: string) => (
        <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" className={cn('object-contain', BOX[size], extra)} />
    );

    if (iconDark) {
        return (
            <span aria-hidden="true" className={cn('inline-grid shrink-0 place-items-center', TILE[size], className)}>
                {image(icon, 'dark:hidden')}
                {image(iconDark, 'hidden dark:block')}
            </span>
        );
    }

    return (
        <span aria-hidden="true" className={cn('inline-grid shrink-0 place-items-center rounded-chip dark:bg-[#ffffff]', TILE[size], className)}>
            {image(icon)}
        </span>
    );
}
