import type { PointerEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CampaignGroundProps {
    labelledBy: string;
    className?: string;
    children: ReactNode;
}

function follow(event: PointerEvent<HTMLElement>): void {
    if (event.pointerType !== 'mouse') {
        return;
    }

    const ground = event.currentTarget;
    const box = ground.getBoundingClientRect();
    ground.style.setProperty('--spot-x', `${event.clientX - box.left}px`);
    ground.style.setProperty('--spot-y', `${event.clientY - box.top}px`);
    ground.dataset.spot = 'on';
}

// The sale's black ground: an island of the dark theme in either theme, with its own rails and the light under the pointer.
export default function CampaignGround({ labelledBy, className, children }: CampaignGroundProps) {
    return (
        <section
            aria-labelledby={labelledBy}
            onPointerMove={follow}
            onPointerLeave={(event) => {
                event.currentTarget.dataset.spot = 'off';
            }}
            className={cn('campaign-surface campaign-glow dark relative overflow-hidden', className)}
        >
            <div aria-hidden="true" className="campaign-spot" />
            <div aria-hidden="true" className="campaign-rails">
                <div />
            </div>
            {children}
        </section>
    );
}
