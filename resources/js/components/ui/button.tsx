import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
    primary:
        'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 hover:shadow-xl hover:shadow-primary/30',
    secondary:
        'border border-black/8 dark:border-white/10 bg-black/3 dark:bg-white/5 text-foreground hover:bg-black/6 dark:hover:bg-white/10',
    ghost: 'text-muted-foreground hover:text-foreground',
};

const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-6 py-3 text-base',
};

interface ButtonProps {
    variant?: Variant;
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    target?: string;
    rel?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
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
        'inline-flex items-center gap-2 rounded-full font-semibold transition-all',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 pointer-events-none',
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
