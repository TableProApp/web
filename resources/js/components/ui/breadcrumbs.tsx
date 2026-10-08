import { ArrowLeft } from 'lucide-react';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

export interface Crumb {
    label: string;
    /** A root-relative English path; the reader's locale is added. Omit on the current page. */
    href?: string;
}

interface BreadcrumbsProps {
    /** Ancestors first, the current page last (with no `href`). */
    items: Crumb[];
    className?: string;
}

/**
 * Where the page sits (design-system §5.3.14): hub children, blog posts and
 * legal pages.
 *
 * A named `<nav>` holding an ordered list. Ancestors are small muted links
 * separated by `/`, which is drawn but not read; the current page is plain
 * text in the text colour with `aria-current="page"`. Below 640px only the
 * parent shows, as "← Databases", because the full trail would wrap above the
 * heading it introduces.
 *
 * The trail matches the page's `BreadcrumbList` JSON-LD, which is built from
 * the same items.
 */
export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    const { m } = useI18n();
    const parent = [...items].reverse().find((item) => item.href !== undefined);

    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label={m.a11y.breadcrumb} className={cn('type-small', className)}>
            <ol className="hidden flex-wrap items-baseline gap-x-2 gap-y-1 sm:flex">
                {items.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="inline-flex items-baseline gap-2">
                        {index > 0 && (
                            <span aria-hidden="true" className="text-muted-foreground">
                                /
                            </span>
                        )}
                        {item.href !== undefined ? (
                            <LocaleLink
                                href={item.href}
                                className="rounded-[2px] text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground"
                            >
                                {item.label}
                            </LocaleLink>
                        ) : (
                            <span aria-current="page" className="text-foreground">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
            {parent?.href !== undefined && (
                <LocaleLink
                    href={parent.href}
                    className="flex min-h-8 w-fit items-center gap-1.5 rounded-[2px] text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground sm:hidden"
                >
                    <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
                    {parent.label}
                </LocaleLink>
            )}
        </nav>
    );
}
