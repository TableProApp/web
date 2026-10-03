import { useCallback, useState, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import ThemeControl from '@/components/shared/theme-control';
import Button, { buttonClasses } from '@/components/ui/button';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import FeaturesMenu from './features-menu';
import LanguageSwitcher from './language-switcher';
import MobileNav from './mobile-nav';
import { EXTERNAL, NAV_LABEL, accountHref, basePath, sectionOf } from './site-links';

const NAV_LINK =
    'group relative inline-flex h-16 items-center text-sm leading-[1.3] font-medium transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground focus-visible:outline-none';

/** The 2px current-section mark on the header's bottom edge; the system highlight in forced colours. */
const CURRENT_MARK =
    'text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent-indicator forced-colors:after:bg-[Highlight]';

function NavLink({ href, current, exact, children }: { href: string; current: boolean; exact: boolean; children: ReactNode }) {
    return (
        <LocaleLink
            href={href}
            aria-current={current ? (exact ? 'page' : 'true') : undefined}
            className={cn(NAV_LINK, current ? CURRENT_MARK : 'text-muted-foreground')}
        >
            <span className={NAV_LABEL}>{children}</span>
        </LocaleLink>
    );
}

/**
 * The header on every public page (sitemap §B.1, §B.2; positioning §10.1;
 * design-system §5.3.17).
 *
 * From 1024px: the logo, Features ▾ · Databases · Pricing · Docs ↗ · Blog,
 * then the language, the theme, Account and Download. Below 1024px: the logo,
 * a compact Download and the Menu button; everything else moves into the menu.
 * The full Vietnamese row was measured to fit at 1024px with 14px to spare
 * (design-system §4.4).
 *
 * The current section takes the text colour and a 2px indicator bar, never
 * colour alone. Internal links go through `LocaleLink`, so they stay in the
 * reader's language. Account is a plain link to the platform app with the
 * language in its query; Docs is English only, and says so on Vietnamese
 * pages.
 */
export default function SiteHeader() {
    const { locale, m } = useI18n();
    const { url } = usePage();
    const section = sectionOf(url);
    const path = basePath(url);
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <header className="border-b border-rule bg-background print:hidden">
            <Container className="flex h-16 items-center gap-8">
                <LocaleLink href="/" className="flex shrink-0 items-center gap-2 rounded-control">
                    <img src="/images/logo.png" alt="" width={28} height={28} className="size-7" />
                    <span className="text-lg leading-none font-semibold text-foreground">{m.common.brand}</span>
                </LocaleLink>

                <nav aria-label={m.nav.label} className="hidden lg:block">
                    <ul className="flex items-center gap-6">
                        <li>
                            <FeaturesMenu current={section === 'features'} path={path} />
                        </li>
                        <li>
                            <NavLink href="/databases" current={section === 'databases'} exact={path === '/databases'}>
                                {m.nav.databases}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink href="/pricing" current={section === 'pricing'} exact={path === '/pricing'}>
                                {m.nav.pricing}
                            </NavLink>
                        </li>
                        <li>
                            <a href={EXTERNAL.docs} hrefLang="en" aria-label={m.nav.docsLabel} className={cn(NAV_LINK, 'text-muted-foreground')}>
                                <span className={NAV_LABEL}>
                                    {m.nav.docs}
                                    <span aria-hidden="true">↗</span>
                                </span>
                            </a>
                        </li>
                        <li>
                            <NavLink href="/blog" current={section === 'blog'} exact={path === '/blog'}>
                                {m.nav.blog}
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    <div className="hidden items-center gap-2 lg:flex">
                        <LanguageSwitcher variant="menu" />
                        <ThemeControl variant="menu" labels={m.controls.theme} />
                        <Button variant="quiet" size="sm" href={accountHref(locale)}>
                            {m.nav.account}
                        </Button>
                    </div>
                    <LocaleLink href="/download" onClick={() => trackDownload('header', 'mac')} className={buttonClasses('primary', 'sm')}>
                        {m.nav.download}
                    </LocaleLink>
                    <button
                        type="button"
                        aria-expanded={menuOpen}
                        aria-controls="site-menu"
                        onClick={() => setMenuOpen(true)}
                        className="-mr-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface lg:hidden"
                    >
                        <Menu className="size-5" aria-hidden="true" />
                        <span className="sr-only">{m.nav.menu}</span>
                    </button>
                </div>
            </Container>
            <MobileNav id="site-menu" open={menuOpen} onClose={closeMenu} />
        </header>
    );
}
