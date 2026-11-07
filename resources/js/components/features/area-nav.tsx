import { FEATURE_PAGES } from '@/components/site/site-links';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface AreaNavProps {
    current: string;
    // The database hub passes its categories as `#id` links; the default is the Features menu.
    items?: { href: string; label: string }[];
    label?: string;
}

// The areas and the hub as one row of words, in the menu's order. It replaces the breadcrumb and the related links,
// and scrolls sideways on a phone rather than wrapping.
export default function AreaNav({ current, items, label }: AreaNavProps) {
    const { m } = useI18n();
    const links = items ?? [{ href: '/features', label: m.nav.featureLinks.all }, ...FEATURE_PAGES.map((page) => ({ href: page.href, label: m.nav.featureLinks[page.key] }))];

    return (
        <nav aria-label={label ?? m.nav.features}>
            <Container>
                <ul className="-mx-4 flex snap-x gap-x-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:gap-y-1 md:overflow-visible md:px-0">
                    {links.map((item) => {
                        const active = item.href === current;

                        return (
                            <li key={item.href} className="shrink-0 snap-start">
                                <LocaleLink
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'block border-b-2 py-3.5 text-[0.9375rem] leading-[1.3] font-medium tracking-[-0.009em] whitespace-nowrap transition-colors duration-(--dur-tap) ease-(--ease-feedback)',
                                        active ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {item.label}
                                </LocaleLink>
                            </li>
                        );
                    })}
                </ul>
            </Container>
        </nav>
    );
}
