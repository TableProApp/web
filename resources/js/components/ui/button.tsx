import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

/**
 * No glow. This file used to carry
 * `shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30`, an
 * orange halo that would have broken the page's flat plane the moment anyone
 * imported it — which is part of why nobody ever did, and why nineteen pill
 * buttons ended up hand-written at four different padding scales instead.
 *
 * `secondary` takes `border-rule` so it moves with the two-weight rule system
 * rather than declaring its own black/white alphas.
 */
const variants: Record<Variant, string> = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'border border-rule text-foreground',
    ghost: 'text-muted-foreground hover:text-foreground',
};

/**
 * Three rungs, matching what the page actually uses: `sm` for the header and
 * inline rails, `md` for the hero and section CTAs, `lg` for the download page.
 */
const sizes: Record<Size, string> = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-6 py-3 text-base',
};

interface ButtonProps {
    variant?: Variant;
    size?: Size;
    href?: string;
    target?: string;
    rel?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
    className?: string;
    children: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    href,
    target,
    rel,
    onClick,
    type = 'button',
    disabled,
    className,
    children,
}: ButtonProps) {
    const classes = cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
        'transition-opacity duration-(--dur-tap) ease-(--ease-feedback)',
        variants[variant],
        sizes[size],
        disabled && 'pointer-events-none opacity-50',
        className,
    );

    if (href) {
        return (
            <a href={href} target={target} rel={rel} onClick={onClick} className={classes}>
                {children}
            </a>
        );
    }

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={classes}>
            {children}
        </button>
    );
}
