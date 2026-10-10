import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { pickLanguage } from '@/components/site/language-switcher';
import Container from '@/components/ui/container';
import { textLinkClasses } from '@/components/ui/text-link';
import { useLanguageSuggestion } from '@/hooks/use-language-suggestion';
import { languageCopy } from '@/i18n';

/**
 * The bar that offers this page in the reader's language, in the slot above
 * the header and in place of the license banner (TopBanner).
 *
 * It speaks the language it offers, never the page's, since the reader it is
 * for may not read the page's: "Đọc trang này bằng tiếng Việt →" on an English
 * page. Those few strings ship for every locale (`languageCopy`). The link is
 * the switcher's own option for that language, a plain `<a>` to the same page
 * there, and following it is the reader's pick (`pickLanguage`). ✕ means that
 * language is never offered again in this browser. Nothing redirects.
 *
 * The element renders wherever the page exists in another language and stays
 * empty until the browser has decided, because the head script may already
 * have made room for it (`html.has-language-bar`, app.css): the bar fills in
 * without moving anything. No analytics.
 */
export default function LanguageBar() {
    const { localization } = usePage().props;
    const { target, dismiss } = useLanguageSuggestion();
    const item = localization?.switcher.find((each) => each.locale === target) ?? null;

    if ((localization?.suggestable ?? []).length === 0) {
        return null;
    }

    const copy = item === null ? null : languageCopy(item.locale).suggest;

    return (
        <div
            role={copy === null ? undefined : 'region'}
            aria-label={copy?.label}
            lang={item?.locale}
            className="language-bar border-b border-rule bg-surface"
        >
            {item !== null && copy !== null && (
                <Container className="flex h-full items-center gap-3">
                    <p className="type-small min-w-0 flex-1 whitespace-nowrap text-foreground">
                        <a
                            href={item.href}
                            hrefLang={item.hreflang}
                            onClick={pickLanguage(item)}
                            className={textLinkClasses('standalone', 'relative whitespace-nowrap after:absolute after:-inset-x-1 after:-inset-y-3')}
                        >
                            {copy.action}
                            <span aria-hidden="true">→</span>
                        </a>
                    </p>
                    <button
                        type="button"
                        onClick={dismiss}
                        aria-label={copy.dismiss}
                        className="relative -mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-control text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) after:absolute after:-inset-1.5 hover:bg-surface-strong"
                    >
                        <X className="size-4" aria-hidden="true" />
                    </button>
                </Container>
            )}
        </div>
    );
}
