import { cn } from '@/lib/utils';

type Width = 'full' | 'lg' | 'md' | 'sm' | 'xs';

const widthMap: Record<Width, string> = {
    full: 'max-w-7xl',
    lg: 'max-w-5xl',
    md: 'max-w-3xl',
    sm: 'max-w-xl',
    xs: 'max-w-md',
};

interface ContainerProps {
    width?: Width;
    className?: string;
    children: React.ReactNode;
}

export default function Container({ width = 'full', className, children }: ContainerProps) {
    return (
        <div
            className={cn(
                // rule-inset-host publishes this padding to any FullLine nested
                // inside, so the rule ordinals in the gutter can subtract it.
                'rule-inset-host mx-auto px-4 sm:px-6 lg:px-8',
                widthMap[width],
                className,
            )}
        >
            {children}
        </div>
    );
}
