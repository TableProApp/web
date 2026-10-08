import { useEffect, useRef, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { usePage } from '@inertiajs/react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { FOOTER_MENU_ITEM, FooterMenu } from '@/components/shared/footer-bar';
import DotList from '@/components/ui/dot-list';
import { languageCopy, useI18n } from '@/i18n';
import type { SwitcherItem } from '@/types/shared-props';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
    /**
     * - `menu`: the header control, the current language's own name, opening
     *   the choices below it. A `<details>`, so it needs no JavaScript.
     * - `footer`: the same choices in the shared FooterMenu, which opens upward
     *   and works without JavaScript.
     * - `stack`: one row naming the current language that opens the choices,
     *   one per row, in place (mobile menu). A `<details>`, so it needs no
     *   JavaScript.
     */
    variant: 'menu' | 'footer' | 'stack';
    className?: string;
}

/**
 * The language switcher (design-system §5.3.15; sitemap §B.4).
 *
 * Every option is a plain `<a href hreflang lang>` to a real URL, so it works
 * without JavaScript and a change of language is always a full document load:
 * `<html lang>`, the Vietnamese font preload and the theme script all run again.
 * The URL alone carries the language. There is no cookie and no redirect.
 *
 * Targets come from the shared `localization.switcher` prop: the equivalent
 * page when one exists, otherwise that language's nearest index, flagged
 * `fallback` and labelled as such in the target language. Section ids are the
 * same in every language, so on an equivalent page the current `#fragment` is
 * carried across on click. Names are endonyms. No flags, no codes.
 */
export default function LanguageSwitcher({ variant, className }: LanguageSwitcherProps) {
    const items = usePage().props.localization?.switcher ?? [];

    if (items.length < 2) {
        return null;
    }

    if (variant === 'menu') {
        return <LanguageMenu items={items} className={className} />;
    }

    if (variant === 'footer') {
        return <LanguageFooterMenu items={items} />;
    }

    return <LanguageStack items={items} className={className} />;
}

/** Carries the reader's place (`#section`) across to the same page in another language. */
function keepFragment(item: SwitcherItem) {
    return (event: MouseEvent<HTMLAnchorElement>): void => {
        if (item.current || item.fallback || window.location.hash === '') {
            return;
        }

        event.currentTarget.href = item.href + window.location.hash;
    };
}

/**
 * Under an option with no equivalent page, in that option's language: what is
 * missing and, when the option leads to the blog list (an English-only
 * release post), where it goes instead, so the click holds no surprise
 * ("Bài viết này chỉ có bằng tiếng Anh · Xem danh sách Blog", sitemap §B.4).
 */
function FallbackNote({ item, className }: { item: SwitcherItem; className?: string }) {
    if (!item.fallback) {
        return null;
    }

    const copy = languageCopy(item.locale);
    const toBlog = /\/blog\/?$/.test(item.href.replace(/[?#].*$/, ''));

    return (
        <span lang={item.locale} className={cn('type-caption block text-muted-foreground', className)}>
            {toBlog ? <DotList items={[copy.fallbackPost, copy.fallbackBlog]} /> : copy.fallback}
        </span>
    );
}

function LanguageStack({ items, className }: { items: SwitcherItem[]; className?: string }) {
    const { m, fmt } = useI18n();
    const current = items.find((item) => item.current) ?? items[0];

    return (
        <details className={cn('group', className)}>
            <summary
                aria-label={fmt(m.controls.language.current, { language: current.native })}
                className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-control text-lg leading-[1.3] font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) select-none hover:text-accent-text [&::-webkit-details-marker]:hidden"
            >
                {m.controls.language.label}
                <span className="flex items-center gap-2 text-base font-normal text-muted-foreground">
                    <span lang={current.locale}>{current.native}</span>
                    <ChevronDown className="size-5 shrink-0 transition-transform duration-(--dur-state) group-open:rotate-180" aria-hidden="true" />
                </span>
            </summary>
            <ul className="mb-2 grid border-l border-rule pl-4">
                {items.map((item) => (
                    <li key={item.locale}>
                        <a
                            href={item.href}
                            hrefLang={item.hreflang}
                            lang={item.locale}
                            aria-current={item.current ? 'true' : undefined}
                            onClick={keepFragment(item)}
                            className="flex min-h-11 items-center gap-3 rounded-control text-base leading-[1.3] text-foreground hover:text-accent-text aria-[current=true]:font-semibold"
                        >
                            {item.native}
                            {item.current && <Check className="size-4 text-accent-text" aria-hidden="true" />}
                        </a>
                        <FallbackNote item={item} className="-mt-1.5 mb-2" />
                    </li>
                ))}
            </ul>
        </details>
    );
}

function LanguageFooterMenu({ items }: { items: SwitcherItem[] }) {
    const { m, fmt } = useI18n();
    const current = items.find((item) => item.current) ?? items[0];

    return (
        <FooterMenu
            label={fmt(m.controls.language.current, { language: current.native })}
            current={{ name: current.native, lang: current.locale }}
        >
            <ul>
                {items.map((item) => (
                    <li key={item.locale}>
                        <a
                            href={item.href}
                            hrefLang={item.hreflang}
                            lang={item.locale}
                            aria-current={item.current ? 'true' : undefined}
                            onClick={keepFragment(item)}
                            className={FOOTER_MENU_ITEM}
                        >
                            <span className="flex-1">
                                {item.native}
                                <FallbackNote item={item} className="mt-0.5 font-normal" />
                            </span>
                            <Check className={cn('mt-px size-4 shrink-0 text-accent-text', !item.current && 'invisible')} aria-hidden="true" />
                        </a>
                    </li>
                ))}
            </ul>
        </FooterMenu>
    );
}

function LanguageMenu({ items, className }: { items: SwitcherItem[]; className?: string }) {
    const { m, fmt } = useI18n();
    const root = useRef<HTMLDetailsElement>(null);
    const current = items.find((item) => item.current) ?? items[0];

    useEffect(() => {
        const details = root.current;

        if (!details) {
            return;
        }

        const onPointerDown = (event: PointerEvent): void => {
            if (details.open && !details.contains(event.target as Node)) {
                details.open = false;
            }
        };

        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, []);

    function links(): HTMLAnchorElement[] {
        return [...(root.current?.querySelectorAll<HTMLAnchorElement>('[data-menu-panel] a[href]') ?? [])];
    }

    function onKeyDown(event: KeyboardEvent<HTMLDetailsElement>): void {
        const details = root.current;

        if (!details || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Escape')) {
            return;
        }

        if (event.key === 'Escape') {
            if (details.open) {
                event.preventDefault();
                details.open = false;
                details.querySelector('summary')?.focus();
            }

            return;
        }

        event.preventDefault();

        const step = event.key === 'ArrowDown' ? 1 : -1;

        if (!details.open) {
            details.open = true;
            requestAnimationFrame(() => links().at(step === 1 ? 0 : -1)?.focus());

            return;
        }

        const choices = links();
        const index = choices.indexOf(document.activeElement as HTMLAnchorElement);
        const next = index === -1 ? (step === 1 ? 0 : choices.length - 1) : (index + step + choices.length) % choices.length;

        choices[next]?.focus();
    }

    /** Focus moving to something outside closes the panel, as the theme menu does; a blur to nothing is left to the pointer handler. */
    function onBlur(event: FocusEvent<HTMLDetailsElement>): void {
        const next = event.relatedTarget as Node | null;

        if (root.current?.open && next !== null && !root.current.contains(next)) {
            root.current.open = false;
        }
    }

    return (
        <details
            ref={root}
            // Safari does not focus a <summary> on a click, so its keys would go to the page.
            onToggle={(event) => {
                const details = event.currentTarget;

                if (details.open && !details.contains(document.activeElement)) {
                    details.querySelector('summary')?.focus({ preventScroll: true });
                }
            }}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            className={cn('group relative', className)}
        >
            <summary
                aria-label={fmt(m.controls.language.current, { language: current.native })}
                className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded-control px-2 text-sm leading-[1.3] font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) select-none hover:bg-surface active:bg-surface-strong [&::-webkit-details-marker]:hidden"
            >
                <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span lang={current.locale}>{current.native}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-state) group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div
                data-menu-panel
                className="absolute top-full right-0 z-50 mt-2 max-h-[min(32rem,70dvh)] w-max max-w-72 min-w-48 overflow-y-auto overscroll-contain rounded-panel border border-rule bg-raised p-1 shadow-overlay"
            >
                <ul>
                    {items.map((item) => (
                        <li key={item.locale}>
                            <a
                                href={item.href}
                                hrefLang={item.hreflang}
                                lang={item.locale}
                                aria-current={item.current ? 'true' : undefined}
                                onClick={keepFragment(item)}
                                className="flex min-h-10 items-start gap-3 rounded-control px-3 py-2 text-sm leading-[1.3] font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface focus-visible:-outline-offset-2 aria-[current=true]:bg-accent-subtle"
                            >
                                <span className="flex-1">
                                    {item.native}
                                    <FallbackNote item={item} className="mt-0.5 font-normal" />
                                </span>
                                <Check className={cn('mt-px size-4 shrink-0 text-accent-text', !item.current && 'invisible')} aria-hidden="true" />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </details>
    );
}
