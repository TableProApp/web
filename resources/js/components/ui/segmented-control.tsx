import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
    value: T;
    label: ReactNode;
    /** A leading 16px icon, `aria-hidden`. */
    icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
    /** Names the group for assistive technology; visually hidden. "Billing cycle". */
    legend: string;
    value: T;
    options: SegmentOption<T>[];
    onChange: (value: T) => void;
    /** The radios' `name`. A unique one is generated when omitted. */
    name?: string;
    /**
     * One muted line under the control, announced politely when it changes:
     * the computed yearly saving, "Paid once, no expiry date". Its height is
     * reserved, so changing the choice moves nothing.
     */
    caption?: ReactNode;
    className?: string;
}

/**
 * A choice of one among a few, as a native radio group (design-system
 * §5.3.5): a `<fieldset>` with a hidden `<legend>` and one radio per segment,
 * each wrapped by its label. Arrow keys, form semantics and the screen reader's
 * "1 of 3" come from the browser.
 *
 * The track is `--surface-strong` with a 10px radius and 2px of padding, so the
 * 8px segments nest concentrically. The checked segment is
 * `--segment-selected`, a step lighter than the track in both themes (white in
 * light; 1.36:1 above the track in dark, where `--raised` would sit below it),
 * with a hairline and the text colour (19.80:1 light, 10.76:1 dark); the
 * others are muted on the track (5.18:1, 6.38:1). Nothing inverts, so no badge or caption
 * can ever sit on a ground that flips in dark mode (design-system §2.4).
 *
 * Selection is styled from `:checked`, which the server renders, so the control
 * shows and works before hydration. The focus ring wraps the whole segment.
 */
export default function SegmentedControl<T extends string>({ legend, value, options, onChange, name, caption, className }: SegmentedControlProps<T>) {
    const generated = useId();
    const group = name ?? generated;

    return (
        <fieldset className={cn('min-w-0', className)}>
            <legend className="sr-only">{legend}</legend>
            <div className="inline-flex max-w-full flex-wrap gap-0.5 rounded-[10px] bg-surface-strong p-0.5">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={cn(
                            'inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-control border border-transparent px-4 text-sm leading-[1.3] font-medium text-muted-foreground pointer-coarse:min-h-11',
                            'transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground',
                            'has-[:checked]:border-rule has-[:checked]:bg-segment-selected has-[:checked]:text-foreground has-[:checked]:shadow-[0_1px_2px_oklch(0_0_0/0.06)] dark:has-[:checked]:shadow-none',
                            'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                        )}
                    >
                        <input
                            type="radio"
                            name={group}
                            value={option.value}
                            checked={option.value === value}
                            onChange={() => onChange(option.value)}
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
