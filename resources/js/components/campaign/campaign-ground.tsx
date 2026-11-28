import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CampaignGroundProps {
    labelledBy: string;
    className?: string;
    children: ReactNode;
}

// The sale's ground: the page's own, in the reader's theme, with its own rails. Flat: no glow, no light under the pointer.
export default function CampaignGround({ labelledBy, className, children }: CampaignGroundProps) {
    return (
        <section aria-labelledby={labelledBy} className={cn('campaign-ground relative overflow-hidden', className)}>
            <div aria-hidden="true" className="campaign-rails">
                <div />
            </div>
            {children}
        </section>
    );
}
