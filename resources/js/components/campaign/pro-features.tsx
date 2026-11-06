import { useId, useRef, useState, type KeyboardEvent } from 'react';
import AssetSlot from '@/components/ui/asset-slot';
import LocaleLink from '@/components/ui/locale-link';
import type { AssetId } from '@/lib/data/assets';
import { cn } from '@/lib/utils';

export interface ProFeatureTab {
    id: string;
    name: string;
    detail: string;
    href: string;
    link: string;
    asset: AssetId;
}

interface ProFeaturesProps {
    items: ProFeatureTab[];
    label: string;
}

// Tabs, not a carousel: a capture changes only when the reader picks another feature.
export default function ProFeatures({ items, label }: ProFeaturesProps) {
    const [active, setActive] = useState(0);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const base = useId();

    function select(index: number): void {
        const next = (index + items.length) % items.length;
        setActive(next);
        tabs.current[next]?.focus();
    }

    function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
        const moves: Record<string, number> = {
            ArrowDown: index + 1,
            ArrowRight: index + 1,
            ArrowUp: index - 1,
            ArrowLeft: index - 1,
            Home: 0,
            End: items.length - 1,
        };

        if (event.key in moves) {
            event.preventDefault();
            select(moves[event.key]);
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
            <div
                role="tablist"
                aria-label={label}
                aria-orientation="vertical"
                className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 lg:flex-col lg:gap-0 lg:self-start lg:border-l lg:border-rule"
            >
                {items.map((item, index) => {
                    const selected = index === active;

                    return (
                        <button
                            key={item.id}
                            ref={(node) => {
                                tabs.current[index] = node;
                            }}
                            type="button"
                            role="tab"
                            id={`${base}-tab-${item.id}`}
                            aria-selected={selected}
                            aria-controls={`${base}-panel-${item.id}`}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => setActive(index)}
                            onKeyDown={(event) => onKeyDown(event, index)}
                            className={cn(
                                'shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-left text-sm font-medium whitespace-nowrap',
                                'transition-colors duration-(--dur-tap) ease-(--ease-feedback)',
                                'lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:px-5 lg:py-2.5 lg:text-base',
                                selected
                                    ? 'border-foreground bg-foreground text-background lg:border-accent lg:bg-transparent lg:text-foreground'
                                    : 'border-rule text-muted-foreground hover:text-foreground lg:border-transparent',
                            )}
                        >
                            {item.name}
                        </button>
                    );
                })}
            </div>

            <div className="sale-stage">
                {items.map((item, index) => {
                    const shown = index === active;

                    return (
                        <div
                            key={item.id}
                            role="tabpanel"
                            id={`${base}-panel-${item.id}`}
                            aria-labelledby={`${base}-tab-${item.id}`}
                            data-shown={shown}
                            inert={!shown}
                            className="grid content-start gap-4"
                        >
                            <AssetSlot id={item.asset} caption={false} sizes="(min-width: 1280px) 900px, (min-width: 1024px) 70vw, 100vw" />
                            <p className="type-body max-w-[60ch] text-muted-foreground">
                                {item.detail}{' '}
                                <LocaleLink href={item.href} className="font-medium whitespace-nowrap text-foreground hover:underline">
                                    {item.link}
                                    <span aria-hidden="true"> →</span>
                                </LocaleLink>
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
