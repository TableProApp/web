/* Shared with TableProApp/web and TableProApp/license at resources/js/components/shared/theme-control.tsx. Change both in the same release. See docs/shared-files.md. */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { applyTheme, readTheme, THEME_CHANGE_EVENT, THEME_CHOICES, type ThemeChoice } from '@/lib/theme';
import { cn } from '@/lib/utils';

export interface ThemeControlLabels {
    /** The control's name: "Theme". */
    label: string;
    /** The menu button's name with the current choice: "Theme: {choice}". */
    current: string;
    light: string;
    dark: string;
    system: string;
}

interface ThemeControlProps {
    /** `menu`: a 40px icon button opening three options (header). `segmented`: the three inline (footer, mobile menu). */
    variant: 'menu' | 'segmented';
    labels: ThemeControlLabels;
    className?: string;
}

const ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

/**
 * The reader's choice, kept in step with every other control and tab.
 *
 * The first render, on the server and in the hydrating browser, is always
 * light, so the markup never depends on the theme. The real choice arrives on
 * mount. Until then the icon and the selected option are drawn from
 * `html[data-theme-choice]`, which the head script set before paint, so the
 * reader never sees the wrong one.
 */
function useThemeChoice(): [ThemeChoice, (choice: ThemeChoice) => void] {
    const [choice, setChoice] = useState<ThemeChoice>('light');

    useEffect(() => {
        setChoice(readTheme());

        const onChange = (event: Event): void => {
            const detail = (event as CustomEvent<ThemeChoice>).detail;

            setChoice(detail ?? readTheme());
        };

        window.addEventListener(THEME_CHANGE_EVENT, onChange);

        return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    }, []);

    return [
        choice,
        (next: ThemeChoice): void => {
            setChoice(next);
            applyTheme(next);
        },
    ];
}

/**
 * Light, Dark or System, in either of two forms (design-system §5.3.16).
 *
 * Labels arrive as props, so this file is byte-identical in both applications
 * and each passes its own language. Both forms write the shared `theme` key
 * through `applyTheme()`.
 */
export default function ThemeControl({ variant, labels, className }: ThemeControlProps) {
    return variant === 'menu' ? <ThemeMenu labels={labels} className={className} /> : <ThemeSegmented labels={labels} className={className} />;
}

/**
 * All three icons are rendered; tokens.css shows the one whose `data-choice`
 * matches `html[data-theme-choice]`. That is what keeps the icon right before
 * hydration without the server knowing the theme.
 */
function ChoiceIcons() {
    return (
        <>
            {THEME_CHOICES.map((choice) => {
                const Icon = ICONS[choice];

                return <Icon key={choice} className="theme-choice-icon size-4 shrink-0" data-choice={choice} aria-hidden="true" />;
            })}
        </>
    );
}

function ThemeMenu({ labels, className }: { labels: ThemeControlLabels; className?: string }) {
    const [choice, choose] = useThemeChoice();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuId = useId();
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const items = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onPointerDown = (event: PointerEvent): void => {
            if (root.current && !root.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    function focusItem(index: number): void {
        const count = THEME_CHOICES.length;

        items.current[((index % count) + count) % count]?.focus();
    }

    function openAt(index: number): void {
        setOpen(true);
        requestAnimationFrame(() => focusItem(index));
    }

    function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            openAt(event.key === 'ArrowDown' ? THEME_CHOICES.indexOf(choice) : THEME_CHOICES.length - 1);
        }
    }

    function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
        const current = items.current.findIndex((item) => item === document.activeElement);

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            focusItem(current + (event.key === 'ArrowDown' ? 1 : -1));
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            focusItem(event.key === 'Home' ? 0 : THEME_CHOICES.length - 1);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            trigger.current?.focus();
        } else if (event.key === 'Tab') {
            setOpen(false);
        }
    }

    function select(next: ThemeChoice): void {
        choose(next);
        setOpen(false);
        trigger.current?.focus();
    }

    // The name carries the choice only once it is known, so the server and the
    // hydrating browser agree on "Theme".
    const name = mounted ? labels.current.replace('{choice}', labels[choice]) : labels.label;

    return (
        <div ref={root} className={cn('relative', className)}>
            <button
                ref={trigger}
                type="button"
                aria-label={name}
                title={name}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                onClick={() => setOpen((value) => !value)}
                onKeyDown={onTriggerKeyDown}
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-control text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface active:bg-surface-strong"
            >
                <ChoiceIcons />
            </button>
            {open && (
                <div
                    id={menuId}
                    role="menu"
                    aria-label={labels.label}
                    onKeyDown={onMenuKeyDown}
                    className="absolute top-full right-0 z-50 mt-2 w-max min-w-44 rounded-panel border border-rule bg-raised p-1 shadow-overlay"
                >
                    {THEME_CHOICES.map((option, index) => {
                        const Icon = ICONS[option];
                        const checked = option === choice;

                        return (
                            <button
                                key={option}
                                ref={(element) => {
                                    items.current[index] = element;
                                }}
                                type="button"
                                role="menuitemradio"
                                aria-checked={checked}
                                tabIndex={checked ? 0 : -1}
                                onClick={() => select(option)}
                                className="flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-control px-3 text-left text-sm leading-[1.3] font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface focus-visible:-outline-offset-2 aria-checked:bg-accent-subtle"
                            >
                                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                <span className="flex-1">{labels[option]}</span>
                                <Check className={cn('size-4 shrink-0 text-accent-text', !checked && 'invisible')} aria-hidden="true" />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/**
 * The segmented form: a fieldset of three native radios, each wrapped by its
 * label, so it works with the keyboard and a screen reader exactly as a radio
 * group does. Which segment looks selected comes from tokens.css and
 * `html[data-theme-choice]`, so it is right before hydration too; `checked`
 * follows on mount.
 */
function ThemeSegmented({ labels, className }: { labels: ThemeControlLabels; className?: string }) {
    const [choice, choose] = useThemeChoice();
    const name = useId();

    return (
        <fieldset className={cn('min-w-0', className)}>
            <legend className="sr-only">{labels.label}</legend>
            <div className="inline-flex flex-wrap gap-0.5 rounded-[10px] bg-surface-strong p-0.5">
                {THEME_CHOICES.map((option) => {
                    const Icon = ICONS[option];

                    return (
                        <label
                            key={option}
                            data-theme-option={option}
                            className="theme-segment inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-control border border-transparent px-3 text-sm leading-[1.3] font-medium text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option}
                                checked={choice === option}
                                onChange={() => choose(option)}
                                className="sr-only"
                            />
                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                            {labels[option]}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
