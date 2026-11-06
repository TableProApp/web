import type { ReactNode } from 'react';
import DotList from '@/components/ui/dot-list';

// A disclosure under the centred facts: its summary centred, what it opens left-aligned at full width.
export const CENTRED_DISCLOSURE = 'text-center [&>div]:pl-0 [&>div]:text-left';

interface PanelFactsProps {
    action: ReactNode;
    // Each line is one DotList: version and size, then requirement and architecture.
    lines: ReactNode[][];
    updates: string;
    children?: ReactNode;
}

// The centred top of a platform panel: the one action, its facts in two short lines, and how it updates.
export default function PanelFacts({ action, lines, updates, children }: PanelFactsProps) {
    return (
        <div className="grid justify-items-center gap-5 text-center">
            {action}
            <div className="type-small grid gap-1 text-muted-foreground">
                {lines.map((items, index) => (
                    <DotList key={index} items={items} align="center" />
                ))}
            </div>
            <p className="type-small text-foreground">{updates}</p>
            {children}
        </div>
    );
}
