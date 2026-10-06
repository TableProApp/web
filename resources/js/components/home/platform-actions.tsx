import type { ReactNode } from 'react';
import ActionPair from '@/components/download/action-pair';
import type { Availability } from './availability';

interface PlatformActionsProps {
    /** The `download_click` location of both actions. */
    location: string;
    availability: Availability;
    /** Under the Mac caption: the hero's "Other ways to install" link. */
    macExtra?: ReactNode;
    className?: string;
}

/**
 * The homepage's two ways to get TablePro, with the captions the homepage
 * resolves from data (positioning §3.2): the shared `ActionPair` row, in cells
 * of the page grid (design-system §4.7).
 */
export default function PlatformActions({ location, availability, macExtra, className }: PlatformActionsProps) {
    return (
        <ActionPair
            location={location}
            macCaption={availability.macCaption}
            macExtra={macExtra}
            ios={availability.appStoreUrl !== null && availability.iosCaption !== null ? { url: availability.appStoreUrl, caption: availability.iosCaption } : null}
            cells
            className={className}
        />
    );
}
