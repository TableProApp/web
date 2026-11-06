import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import SegmentedControl from '@/components/ui/segmented-control';
import { classifyDevice } from '@/lib/device';
import { cn } from '@/lib/utils';
import type { PlatformKey } from './types';

export interface PlatformTab {
    key: PlatformKey;
    // The accessible heading of the panel, and the segment's text.
    name: string;
    label: ReactNode;
    icon: ReactNode;
    panel: ReactNode;
}

interface PlatformSwitchProps {
    legend: string;
    tabs: PlatformTab[];
}

function fromHash(keys: PlatformKey[]): PlatformKey | null {
    return keys.find((key) => window.location.hash === `#${key}`) ?? null;
}

// One panel at a time. The server renders the first platform; before paint, a root `ios` or `linux` class from the head
// script shows that platform instead (app.css), and the layout effect then takes over without a visible swap. A link to
// `#mac`, `#ios` or `#linux` opens that panel, and a choice is kept in the URL so a reload or a shared link keeps it.
// The browser scrolls to a linked panel after the layout effect, so a panel's scroll margin clears the switch above it
// and both land the switch under the header.
export default function PlatformSwitch({ legend, tabs }: PlatformSwitchProps) {
    const root = useRef<HTMLDivElement>(null);
    const keys = tabs.map((tab) => tab.key);
    const [chosen, setChosen] = useState<PlatformKey | null>(null);

    useLayoutEffect(() => {
        const linked = fromHash(keys);
        const device = classifyDevice(navigator.userAgent, navigator.maxTouchPoints ?? 0);

        setChosen(linked ?? keys.find((key) => key === device) ?? keys[0]);

        if (linked !== null) {
            root.current?.scrollIntoView({ block: 'start' });
        }
    }, []);

    useEffect(() => {
        const follow = (): void => {
            const linked = fromHash(keys);

            if (linked !== null) {
                setChosen(linked);
                root.current?.scrollIntoView({ block: 'start' });
            }
        };

        window.addEventListener('hashchange', follow);

        return () => window.removeEventListener('hashchange', follow);
    }, []);

    const shown = chosen ?? keys[0];

    return (
        <div ref={root} data-platform-switch="" data-ready={chosen !== null ? '' : undefined}>
            <SegmentedControl<PlatformKey>
                legend={legend}
                name="platform"
                size="lg"
                value={shown}
                options={tabs.map((tab) => ({ value: tab.key, label: tab.label, icon: tab.icon }))}
                onChange={(next) => {
                    setChosen(next);
                    window.history.replaceState(window.history.state, '', `#${next}`);
                }}
            />

            {tabs.map((tab) => (
                <section key={tab.key} id={tab.key} data-panel={tab.key} aria-labelledby={`${tab.key}-title`} className={cn('mt-10 scroll-mt-32', tab.key !== shown && 'hidden')}>
                    <h2 id={`${tab.key}-title`} className="sr-only">
                        {tab.name}
                    </h2>
                    {tab.panel}
                </section>
            ))}
        </div>
    );
}
