import type { ReactNode } from 'react';
import LocaleLink from '@/components/ui/locale-link';
import { cn } from '@/lib/utils';

interface CardProps {
    /** The card's title, in the `h3` style. */
    title?: ReactNode;
    /** The title's element; the outline decides the level, the style stays `h3`. */
    titleAs?: 'h2' | 'h3' | 'h4' | 'p';
    /** A Badge or StatusBadge on the right of the title row. */
    badge?: ReactNode;
    /**
     * Makes the whole card a link: the title becomes the link and stretches
     * over the card, so the card has exactly one link and one accessible name.
     * A root-relative English path is localized; anything else passes through.
     */
    href?: string;
    /** The element around the card: `li` when cards form a list. */
    as?: 'div' | 'article' | 'li' | 'section';
    className?: string;
    children?: ReactNode;
}

/**
 * A panel (design-system §5.3.9), used sparingly: pricing, platforms, the
 * database facts card, related links. Never a feature grid or a bento.
 *
 * `--raised` with a hairline and the panel radius, 24px of padding (20px
 * below 640). No shadow.
 *
 * A linked card has one link, its title, whose `::after` covers the card. Its
 * hover strengthens the border and fills `--surface`; its focus ring is drawn
 * on the card itself, since the link's own box is just the title.
 */
export default function Card({ title, titleAs = 'h3', badge, href, as: Element = 'div', className, children }: CardProps) {
    const Title = titleAs;
    const linked = href !== undefined;

    return (
        <Element
            className={cn(
                'relative min-w-0 rounded-panel border border-rule bg-raised p-5 sm:p-6',
                linked &&
                    'transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:border-rule-strong hover:bg-surface has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus',
                className,
            )}
        >
            {(title || badge) && (
                <div className="flex items-start justify-between gap-4">
                    {title && (
                        <Title className="type-h3 min-w-0 text-foreground">
                            {linked ? (
                                <LocaleLink href={href} className="outline-none after:absolute after:inset-0 after:rounded-panel after:content-['']">
                                    {title}
                                </LocaleLink>
                            ) : (
                                title
                            )}
                        </Title>
                    )}
                    {badge && <div className="relative z-[1] shrink-0">{badge}</div>}
                </div>
            )}
            {children && <div className={cn('type-small text-foreground', (title || badge) && 'mt-3')}>{children}</div>}
        </Element>
    );
}
