import SEOHead from '@/components/seo/seo-head';
import { EXTERNAL, SUPPORT_EMAIL } from '@/components/site/site-links';
import { buttonClasses } from '@/components/ui/button';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n, type Locale } from '@/i18n';
import LandingLayout from '@/layouts/landing-layout';

type Status = 404 | 410 | 500 | 503;

interface Suggestion {
    href: string;
    title: string | null;
    hreflang: string;
    locale: Locale;
}

interface Props {
    status: Status;
    /** The same page in another language, when only that version exists. */
    suggestion?: Suggestion;
    /** `/account?locale=vi` on a 404 for `/vi/account…` or `/vi/checkout…`: the account has no locale prefix. */
    account?: string;
}

const START_PAGES = [
    ['home', '/'],
    ['features', '/features'],
    ['databases', '/databases'],
    ['pricing', '/pricing'],
    ['download', '/download'],
    ['blog', '/blog'],
] as const;

const START_LINK = 'text-foreground underline decoration-muted-foreground underline-offset-4 hover:text-accent-text hover:decoration-accent-text';

/**
 * The branded 404, 410, 500 and 503 page, in the language of the path.
 *
 * Rendered by `App\Exceptions\RenderErrorPage`. It carries `noindex, follow`
 * from the shared `seo` prop, so a crawler that lands on a dead link can still
 * follow these links home. A Vietnamese URL whose page exists only in English
 * says so and links the English page, instead of showing English copy under
 * Vietnamese chrome.
 */
export default function ErrorPage({ status, suggestion, account }: Props) {
    const { m, fmt } = useI18n();
    const copy = {
        404: m.errors.notFound,
        410: m.errors.gone,
        500: m.errors.serverError,
        503: m.errors.unavailable,
    }[status];

    const language = suggestion ? m.errors.languages[suggestion.locale] : null;
    const title = suggestion && language ? fmt(m.errors.translation.title, { language }) : copy.title;
    const body = suggestion ? m.errors.translation.body : account ? m.errors.account.body : fmt(copy.body, { email: SUPPORT_EMAIL });

    return (
        <LandingLayout>
            <SEOHead title={title} description={body} />
            <div className="mx-auto max-w-[36rem] px-4 pt-10 pb-16 sm:px-6 md:pt-14 md:pb-20 xl:pt-18 xl:pb-24">
                <p className="type-caption text-muted-foreground tabular-nums">{fmt(m.errors.status, { status })}</p>
                <h1 className="type-h1 mt-2 text-foreground">{title}</h1>
                <p className="type-body mt-4 text-foreground">{body}</p>

                {/*
                  * The page in the other language: its title as text in that
                  * language, then the Button with this page's own words. A long
                  * English post title as the button label wrapped to two
                  * left-aligned lines against its edges.
                  */}
                {suggestion && language && (
                    <div className="mt-8">
                        {suggestion.title !== null && (
                            <p lang={suggestion.locale} className="type-h3 text-foreground">
                                {suggestion.title}
                            </p>
                        )}
                        <a
                            href={suggestion.href}
                            hrefLang={suggestion.hreflang}
                            className={buttonClasses('primary', 'md', suggestion.title !== null ? 'mt-4' : undefined)}
                        >
                            {fmt(m.errors.translation.link, { language })}
                        </a>
                    </div>
                )}

                {/* A plain link: the account is the other application, with its own document. */}
                {account && (
                    <p className="mt-8">
                        <a href={account} className={buttonClasses('primary', 'md')}>
                            {m.errors.account.link}
                        </a>
                    </p>
                )}

                {status < 500 && (
                    <nav aria-label={m.errors.linksLabel} className="mt-10">
                        <ul className="type-body flex flex-wrap gap-x-6 gap-y-3">
                            {/* Pricing and Docs take the header's labels. */}
                            {START_PAGES.map(([key, href]) => (
                                <li key={key}>
                                    <LocaleLink href={href} className={START_LINK}>
                                        {key === 'pricing' ? m.nav.pricing : m.errors.links[key]}
                                    </LocaleLink>
                                </li>
                            ))}
                            <li>
                                <a href={EXTERNAL.docs} hrefLang="en" aria-label={m.nav.docsLabel} className={START_LINK}>
                                    {m.nav.docs}
                                    <span aria-hidden="true" className="ml-1">
                                        ↗
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </LandingLayout>
    );
}
