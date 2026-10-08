import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { usePage } from '@inertiajs/react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { FOOTER_MENU_ITEM, FooterMenu } from '@/components/shared/footer-bar';
import DotList from '@/components/ui/dot-list';
import { languageCopy, useI18n } from '@/i18n';
import type { SwitcherItem } from '@/types/shared-props';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
    /**
     * - `menu`: the header button, the current language's own name, opening the
     *   choices.
     * - `footer`: the same choices in the shared FooterMenu, which opens upward
     *   and works without JavaScript.
     * - `stack`: the choices one per row (mobile menu).
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
    const { m } = useI18n();
    const labelId = useId();

    return (
        <nav aria-labelledby={labelId} className={cn('grid gap-1', className)}>
            <span id={labelId} className="type-small font-medium text-muted-foreground">
                {m.controls.language.label}
            </span>
            <ul className="grid">
                {items.map((item) => (
                    <li key={item.locale}>
                        <a
                            href={item.href}
                            hrefLang={item.hreflang}
                            lang={item.locale}
                            aria-current={item.current ? 'true' : undefined}
                            onClick={keepFragment(item)}
                            className={cn(
                                'flex min-h-12 items-center gap-3 rounded-[2px] text-lg leading-[1.3] font-medium transition-colors duration-(--dur-tap) ease-(--ease-feedback)',
                                item.current ? 'text-foreground' : 'text-muted-foreground underline decoration-muted-foreground underline-offset-3 hover:text-foreground',
                            )}
                        >
                            {item.native}
                            {item.current && <Check className="size-4 text-accent-text" aria-hidden="true" />}
                        </a>
                        <FallbackNote item={item} className="-mt-2 mb-2" />
                    </li>
                ))}
            </ul>
        </nav>
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
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const links = useRef<(HTMLAnchorElement | null)[]>([]);
    const current = items.find((item) => item.current) ?? items[0];

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

    function focusLink(index: number): void {
        const count = items.length;

        links.current[((index % count) + count) % count]?.focus();
    }

    function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusLink(event.key === 'ArrowDown' ? 0 : items.length - 1));
        }
    }

    function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
        const index = links.current.findIndex((link) => link === document.activeElement);

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            focusLink(index + (event.key === 'ArrowDown' ? 1 : -1));
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            trigger.current?.focus();
        }
    }

    /** Focus moving to something outside closes the panel, as the theme menu does; a blur to nothing is left to the pointer handler. */
    function onBlur(event: FocusEvent<HTMLDivElement>): void {
        const next = event.relatedTarget as Node | null;

        if (open && next !== null && root.current && !root.current.contains(next)) {
            setOpen(false);
        }
    }

    const name = fmt(m.controls.language.current, { language: current.native });

    return (
        <div ref={root} className={cn('relative', className)} onKeyDown={onPanelKeyDown} onBlur={onBlur}>
            <button
                ref={trigger}
                type="button"
                aria-label={name}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
                onKeyDown={onTriggerKeyDown}
                className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-control px-2 text-sm leading-[1.3] font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface active:bg-surface-strong"
            >
                <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span lang={current.locale}>{current.native}</span>
                <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-state)', open && 'rotate-180')} aria-hidden="true" />
            </button>
            <div
                id={panelId}
                hidden={!open}
                className="absolute top-full right-0 z-50 mt-2 max-h-[min(32rem,70dvh)] w-max max-w-72 min-w-48 overflow-y-auto overscroll-contain rounded-panel border border-rule bg-raised p-1 shadow-overlay"
            >
                <ul>
                    {items.map((item, index) => (
                        <li key={item.locale}>
                            <a
                                ref={(element) => {
                                    links.current[index] = element;
                                }}
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
        </div>
    );
}
