/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/button.tsx. Change both in the same release. See docs/shared-files.md. */
import type { AriaAttributes, FocusEvent, MouseEvent, PointerEvent, ReactNode, Ref } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Four variants, each a token fill rather than an opacity change (design-system
 * §5.3.1). An opacity drop on hover lowered the label's contrast; a lighter or
 * darker fill keeps it computed.
 *
 * - `primary`: the one main action of a view region. Label 7.42:1 at rest,
 *   8.29:1 hovered, 6.43:1 pressed.
 * - `secondary`: alternatives, plan purchases, Allow and Decline.
 * - `quiet`: header Account, Sign out, Cancel in dialogs.
 * - `danger`: the confirm button of a destructive dialog, never on a screen.
 *
 * Filled variants keep a transparent 1px border, so they still show as outlined
 * in forced-colours mode. Disabled is a real fill and label pair (5.18:1 light,
 * 6.38:1 dark), never `opacity: .5`.
 */
const VARIANTS: Record<ButtonVariant, string> = {
    primary: 'border-transparent bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-active',
    secondary:
        'border-rule bg-raised text-foreground shadow-[0_1px_0_oklch(0_0_0/0.04)] hover:bg-surface active:bg-surface-strong dark:shadow-none',
    quiet: 'border-transparent bg-transparent text-foreground hover:bg-surface active:bg-surface-strong',
    danger: 'border-transparent bg-danger-fill text-danger-foreground hover:bg-danger-fill-hover active:bg-danger-fill-hover',
};

/** Heights 32, 40 and 48px. Labels may wrap, so heights are minimums. */
const SIZES: Record<ButtonSize, string> = {
    sm: 'min-h-8 px-3 py-1 text-sm leading-[1.3] tracking-[-0.006em] [&_svg]:size-4',
    md: 'min-h-10 px-4 py-1.5 text-sm leading-[1.3] tracking-[-0.006em] [&_svg]:size-4',
    lg: 'min-h-12 px-5 py-2 text-base leading-[1.3] tracking-[-0.011em] [&_svg]:size-5',
};

const DISABLED =
    'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-strong disabled:text-muted-foreground disabled:shadow-none ' +
    'aria-disabled:cursor-not-allowed aria-disabled:border-transparent aria-disabled:bg-surface-strong aria-disabled:text-muted-foreground aria-disabled:shadow-none';

/**
 * The class list, exported because one caller cannot use the component to get
 * it: the download page swaps which architecture button is primary after
 * mount by assigning `className`, and both halves must stay the same strings.
 */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string {
    return cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border text-center font-medium text-balance',
        'transition-colors duration-(--dur-tap) ease-(--ease-feedback) [&_svg]:shrink-0',
        VARIANTS[variant],
        SIZES[size],
        DISABLED,
        className,
    );
}

interface ButtonProps extends AriaAttributes {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Renders an `<a>`: a button that navigates is a link. Cross-app targets stay plain links. */
    href?: string;
    /**
     * Forwarded to the `<a>`. The download page resolves the real asset URL
     * after mount and assigns `.href` imperatively, so a primitive that
     * swallowed the ref would leave those links on the generic releases page.
     * React 19 passes `ref` to function components as an ordinary prop.
     */
    ref?: Ref<HTMLAnchorElement>;
    /** Forwarded to the `<button>`, for a dialog that focuses Cancel first. */
    buttonRef?: Ref<HTMLButtonElement>;
    target?: string;
    rel?: string;
    hrefLang?: string;
    lang?: string;
    download?: boolean | string;
    type?: 'button' | 'submit' | 'reset';
    name?: string;
    value?: string;
    form?: string;
    id?: string;
    title?: string;
    /** A real `disabled` on a button; `aria-disabled` and no href on a link. Say why nearby. */
    disabled?: boolean;
    /** Busy: `aria-busy`, disabled, and a spinner in place of the leading icon. The label stays. */
    loading?: boolean;
    /** The leading icon. The spinner takes its place while loading, so the width holds. */
    icon?: ReactNode;
    /** Stretches the button, for cards and phone layouts. */
    fullWidth?: boolean;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    className?: string;
    children: ReactNode;
}

/**
 * A button, or a link styled as one.
 *
 * Every string arrives through `children` and the aria props, so the same file
 * serves both applications.
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    href,
    ref,
    buttonRef,
    target,
    rel,
    hrefLang,
    lang,
    download,
    type = 'button',
    name,
    value,
    form,
    id,
    title,
    disabled = false,
    loading = false,
    icon,
    fullWidth = false,
    onClick,
    onPointerEnter,
    onFocus,
    className,
    children,
    ...aria
}: ButtonProps) {
    const classes = buttonClasses(variant, size, cn(fullWidth && 'w-full', className));
    const leading = loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : icon;
    const inert = disabled || loading;

    if (href !== undefined) {
        return (
            <a
                {...aria}
                ref={ref}
                id={id}
                title={title}
                href={inert ? undefined : href}
                role={inert ? 'link' : undefined}
                aria-disabled={inert || undefined}
                aria-busy={loading || undefined}
                tabIndex={inert ? -1 : undefined}
                target={target}
                rel={rel}
                hrefLang={hrefLang}
                lang={lang}
                download={download}
                onClick={inert ? undefined : onClick}
                onPointerEnter={onPointerEnter}
                onFocus={onFocus}
                className={classes}
            >
                {leading}
                {children}
            </a>
        );
    }

    return (
        <button
            {...aria}
            ref={buttonRef}
            id={id}
            title={title}
            type={type}
            name={name}
            value={value}
            form={form}
            disabled={inert}
            aria-busy={loading || undefined}
            onClick={onClick}
            onPointerEnter={onPointerEnter}
            onFocus={onFocus}
            className={classes}
        >
            {leading}
            {children}
        </button>
    );
}
