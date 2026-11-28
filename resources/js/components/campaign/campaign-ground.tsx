import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CampaignGroundProps {
    labelledBy: string;
    className?: string;
    children: ReactNode;
}

// The sale's black ground: an island of the dark theme in either theme, with its own rails. Flat: no glow, no light under the pointer.
export default function CampaignGround({ labelledBy, className, children }: CampaignGroundProps) {
    return (
        <section aria-labelledby={labelledBy} className={cn('campaign-surface dark relative overflow-hidden', className)}>
            <div aria-hidden="true" className="campaign-rails">
                <div />
            </div>
            {children}
        </section>
    );
}
