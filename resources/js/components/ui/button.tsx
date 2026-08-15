import { Ref, ReactNode } from 'react';
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

/**
 * The class list, exported because one caller cannot use the component to get
 * it: Download.tsx detects the visitor's architecture after mount and swaps
 * which of its two buttons is primary by assigning `className` directly. That
 * used to hard-code the strings, so the imperative half and the rendered half
 * would drift apart the first time either changed.
 */
export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string): string {
    return cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
        'transition-opacity duration-(--dur-tap) ease-(--ease-feedback)',
        variants[variant],
        sizes[size],
        className,
    );
}

interface ButtonProps {
    variant?: Variant;
    size?: Size;
    href?: string;
    /**
     * Forwarded to the rendered element. Download.tsx resolves the real asset
     * URL after mount and assigns `.href` imperatively, so a button primitive
     * that swallowed the ref would leave those links pointing at the generic
     * releases page — a broken download that no test here would catch.
     *
     * React 19 passes `ref` to function components as an ordinary prop, so this
     * needs no forwardRef.
     */
    ref?: Ref<HTMLAnchorElement>;
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
    ref,
    target,
    rel,
    onClick,
    type = 'button',
    disabled,
    className,
    children,
}: ButtonProps) {
    const classes = buttonClasses(variant, size, cn(disabled && 'pointer-events-none opacity-50', className));

    if (href) {
        return (
            <a ref={ref} href={href} target={target} rel={rel} onClick={onClick} className={classes}>
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
