import { cn } from '@/lib/utils';

type Variant = 'primary' | 'primary-solid' | 'neutral';

const variants: Record<Variant, string> = {
    primary:
        'border border-primary/20 bg-primary/5 text-primary',
    'primary-solid':
        'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
    neutral:
        'bg-gray-950/5 dark:bg-white/10 text-muted-foreground',
};

interface BadgeProps {
    variant?: Variant;
    className?: string;
    children: React.ReactNode;
}

export default function Badge({ variant = 'primary', className, children }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                variants[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}
