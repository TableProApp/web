import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
    value: T;
    label: ReactNode;
    icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
    legend: string;
    value: T;
    options: SegmentOption<T>[];
    onChange: (value: T) => void;
    name?: string;
    caption?: ReactNode;
    // `lg`: equal segments across the whole width, the icon above the label (the download page's platforms).
    size?: 'md' | 'lg';
    className?: string;
}

interface Thumb {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Radios, so arrow keys and forms work natively. Once measured, one thumb slides to the checked segment; before that
// (the server render, no JavaScript) the checked segment paints its own ground. The thumb slides only after the reader
// chose: a value the page restores on load lands in place.
export default function SegmentedControl<T extends string>({ legend, value, options, onChange, name, caption, size = 'md', className }: SegmentedControlProps<T>) {
    const generated = useId();
    const group = name ?? generated;
    const track = useRef<HTMLDivElement>(null);
    const chosen = useRef(false);
    const [thumb, setThumb] = useState<Thumb | null>(null);
    const large = size === 'lg';

    useLayoutEffect(() => {
        const element = track.current;

        if (!element) {
            return;
        }

        const measure = (): void => {
            const checked = element.querySelector<HTMLElement>('label:has(input:checked)');

            setThumb(checked ? { x: checked.offsetLeft, y: checked.offsetTop, width: checked.offsetWidth, height: checked.offsetHeight } : null);
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(element);

        return () => observer.disconnect();
    }, [value]);

    return (
        <fieldset className={cn('min-w-0', className)}>
            <legend className="sr-only">{legend}</legend>
            <div
                ref={track}
                data-thumb={thumb ? '' : undefined}
                className={cn(
                    'group/segments relative max-w-full gap-0.5 rounded-[10px] bg-surface-strong p-0.5',
                    large ? 'grid auto-cols-fr grid-flow-col rounded-[14px] p-1' : 'inline-flex flex-wrap',
                )}
            >
                {thumb && (
                    <span
                        aria-hidden="true"
                        className={cn(
                            'absolute top-0 left-0 border border-rule bg-segment-selected shadow-[0_1px_2px_oklch(0_0_0/0.06)] dark:shadow-none forced-colors:hidden',
                            large ? 'rounded-[10px]' : 'rounded-control',
                            chosen.current && 'transition-[translate,width,height] duration-(--dur-panel) ease-(--ease-panel)',
                        )}
                        style={{ translate: `${thumb.x}px ${thumb.y}px`, width: thumb.width, height: thumb.height }}
                    />
                )}
                {options.map((option) => (
                    <label
                        key={option.value}
                        data-segment={option.value}
                        className={cn(
                            'relative inline-flex cursor-pointer items-center border border-transparent text-sm leading-[1.3] font-medium text-muted-foreground',
                            large
                                ? 'min-h-18 flex-col justify-center gap-1.5 rounded-[10px] px-2 py-3 text-center'
                                : 'min-h-9 gap-2 rounded-control px-4 pointer-coarse:min-h-11',
                            'transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground',
                            'has-[:checked]:border-rule has-[:checked]:bg-segment-selected has-[:checked]:text-foreground has-[:checked]:shadow-[0_1px_2px_oklch(0_0_0/0.06)] dark:has-[:checked]:shadow-none',
                            'group-data-[thumb]/segments:has-[:checked]:border-transparent group-data-[thumb]/segments:has-[:checked]:bg-transparent group-data-[thumb]/segments:has-[:checked]:shadow-none',
                            'forced-colors:group-data-[thumb]/segments:has-[:checked]:border-[CanvasText]',
                            'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                        )}
                    >
                        <input
                            type="radio"
                            name={group}
                            value={option.value}
                            checked={option.value === value}
                            onChange={() => {
                                chosen.current = true;
                                onChange(option.value);
                            }}
                            className="sr-only"
                        />
                        {option.icon}
                        {option.label}
                    </label>
                ))}
            </div>
            {caption !== undefined && (
                <p aria-live="polite" className="type-small mt-2 min-h-[1.6em] text-muted-foreground">
                    {caption}
                </p>
            )}
        </fieldset>
    );
}
