import { useEffect, useState } from 'react';
import Disclosure from '@/components/ui/disclosure';
import { cn } from '@/lib/utils';
import type { ArticleHeading } from './article-body';

interface TableOfContentsProps {
    headings: ArticleHeading[];
    /** "On this page". */
    label: string;
    /** `sidebar`: the sticky column at 1280px and wider. `inline`: the disclosure above the article below that. */
    variant: 'sidebar' | 'inline';
    className?: string;
}

/**
 * The h2 sections of a long post (design-system §5.3.19, §8.10).
 *
 * At 1280px and wider it is a sticky column beside the article, and the
 * section being read is marked with the text colour, `aria-current="location"`
 * and a 2px accent bar. Below that it is a closed "On this page" disclosure
 * above the article, which opens without JavaScript.
 *
 * The marking runs after mount only (an IntersectionObserver on the
 * headings); the server renders the plain list.
 */
export default function TableOfContents({ headings, label, variant, className }: TableOfContentsProps) {
    const [current, setCurrent] = useState<string | null>(null);

    useEffect(() => {
        if (variant !== 'sidebar' || typeof IntersectionObserver === 'undefined') {
            return;
        }

        const elements = headings
            .map((heading) => document.getElementById(heading.id))
            .filter((element): element is HTMLElement => element !== null);

        const visible = new Set<string>();

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        visible.add(entry.target.id);
                    } else {
                        visible.delete(entry.target.id);
                    }
                }

                const first = headings.find((heading) => visible.has(heading.id));

                if (first) {
                    setCurrent(first.id);
                }
            },
            { rootMargin: '-96px 0px -60% 0px' },
        );

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [headings, variant]);

    const list = (
        <ol className="grid gap-1">
            {headings.map((heading) => {
                const active = variant === 'sidebar' && heading.id === current;

                return (
                    <li key={heading.id}>
                        <a
                            href={`#${heading.id}`}
                            aria-current={active ? 'location' : undefined}
                            className={cn(
                                'type-small block rounded-[2px] border-l-2 py-1 pl-3 transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground',
                                active ? 'border-accent-indicator text-foreground' : 'border-transparent text-muted-foreground',
                            )}
                        >
                            {heading.text}
                        </a>
                    </li>
                );
            })}
        </ol>
    );

    if (variant === 'inline') {
        return (
            <Disclosure summary={label} className={className}>
                <nav aria-label={label}>{list}</nav>
            </Disclosure>
        );
    }

    return (
        <nav aria-label={label} className={cn('sticky top-24', className)}>
            <p className="type-label text-foreground">{label}</p>
            <div className="mt-3">{list}</div>
        </nav>
    );
}
