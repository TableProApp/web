import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
    /** Locale-neutral, unique within the set: `claude-code`, `cursor`. */
    id: string;
    label: ReactNode;
    content: ReactNode;
}

interface TabsProps {
    /** Names the tab list: "MCP client". */
    label: string;
    items: TabItem[];
    /** The tab selected on first render; the first one by default. */
    defaultId?: string;
    className?: string;
}

/**
 * Tabs, for alternatives of one thing only (design-system §5.3.4): one MCP
 * configuration per client. Never to hide sections of a page.
 *
 * ARIA tabs with automatic activation: the arrow keys move between tabs and
 * select as they go, Home and End jump to the ends, and only the selected tab
 * is in the tab order. Each panel is focusable so a panel holding only text
 * or code can still be reached.
 *
 * The selected tab is the text colour over a 2px `--accent-indicator`
 * underline; the others are muted. The list sits on a hairline baseline.
 */
export default function Tabs({ label, items, defaultId, className }: TabsProps) {
    const base = useId();
    const [selected, setSelected] = useState(defaultId ?? items[0]?.id);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);

    function select(index: number): void {
        const count = items.length;
        const next = ((index % count) + count) % count;

        setSelected(items[next].id);
        tabs.current[next]?.focus();
    }

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
        const current = items.findIndex((item) => item.id === selected);
        const moves: Record<string, number> = {
            ArrowRight: current + 1,
            ArrowLeft: current - 1,
            Home: 0,
            End: items.length - 1,
        };

        if (event.key in moves) {
            event.preventDefault();
            select(moves[event.key]);
        }
    }

    return (
        <div className={className}>
            <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-6 overflow-x-auto border-b border-rule">
                {items.map((item, index) => {
                    const active = item.id === selected;

                    return (
                        <button
                            key={item.id}
                            ref={(element) => {
                                tabs.current[index] = element;
                            }}
                            type="button"
                            role="tab"
                            id={`${base}-tab-${item.id}`}
                            aria-selected={active}
                            aria-controls={`${base}-panel-${item.id}`}
                            tabIndex={active ? 0 : -1}
                            onClick={() => setSelected(item.id)}
                            className={cn(
                                'relative -mb-px inline-flex min-h-10 shrink-0 cursor-pointer items-center border-b-2 text-sm leading-[1.3] font-medium transition-colors duration-(--dur-tap) ease-(--ease-feedback) focus-visible:-outline-offset-2',
                                active ? 'border-accent-indicator text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
            {items.map((item) => (
                <div
                    key={item.id}
                    role="tabpanel"
                    id={`${base}-panel-${item.id}`}
                    aria-labelledby={`${base}-tab-${item.id}`}
                    tabIndex={0}
                    hidden={item.id !== selected}
                    className="mt-4 rounded-control focus-visible:outline-offset-4"
                >
                    {item.content}
                </div>
            ))}
        </div>
    );
}
