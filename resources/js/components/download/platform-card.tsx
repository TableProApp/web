import type { ReactNode } from 'react';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface PlatformCardProps {
    id?: string;
    name: string;
    badge?: ReactNode;
    // The reader's own platform, decided in the browser; the server render marks none.
    marked: boolean;
    version: ReactNode;
    action: ReactNode;
    details: ReactNode;
    updates: string;
    children?: ReactNode;
    className?: string;
}

// From 1024px the cards share the grid's rows (subgrid), so versions, actions and update lines line up across them.
// The mark is always rendered, invisible until it applies, so nothing changes size when it arrives.
export default function PlatformCard({ id, name, badge, marked, version, action, details, updates, children, className }: PlatformCardProps) {
    const { m } = useI18n();
    const titleId = id !== undefined ? `${id}-title` : `${name.toLowerCase().replace(/[^a-z]+/g, '-')}-card-title`;

    return (
        <section
            id={id}
            aria-labelledby={titleId}
            className={cn('grid scroll-mt-24 content-start gap-6 lg:row-span-4 lg:grid-rows-subgrid', marked && 'plan-lead', className)}
        >
            <div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <h2 id={titleId} className="type-h3 flex items-center gap-2 text-foreground">
                        {name}
                        {badge}
                    </h2>
                    <span aria-hidden={!marked} className={cn('type-caption text-muted-foreground', !marked && 'invisible')}>
                        {m.download.card.yourSystem}
                    </span>
                </div>
                <p className="type-small mt-1 min-h-[1.6em] text-muted-foreground tabular-nums">{version}</p>
            </div>

            <div className="grid content-start justify-items-start gap-2">
                <div className="flex min-h-12 items-center">{action}</div>
                <div className="type-small text-muted-foreground">{details}</div>
            </div>

            <p className="type-small text-foreground">{updates}</p>

            {children !== undefined && <div className="-mx-(--cell-bleed) grid content-start gap-5 border-t border-rule px-(--cell-bleed) pt-6">{children}</div>}
        </section>
    );
}
