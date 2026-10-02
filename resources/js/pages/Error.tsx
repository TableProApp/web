import SEOHead from '@/components/seo/seo-head';
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
}

/**
 * The support address quoted on the 500 page. It moves to `facts.json`
 * (`support.email`) once that file exists.
 */
const SUPPORT_EMAIL = 'hello@tablepro.app';

const START_PAGES = [
    ['home', '/'],
    ['features', '/features'],
    ['databases', '/databases'],
    ['download', '/download'],
    ['blog', '/blog'],
] as const;

/**
 * The branded 404, 410, 500 and 503 page, in the language of the path.
 *
 * Rendered by `App\Exceptions\RenderErrorPage`. It carries `noindex, follow`
 * from the shared `seo` prop, so a crawler that lands on a dead link can still
 * follow these links home. A Vietnamese URL whose page exists only in English
 * says so and links the English page, instead of showing English copy under
 * Vietnamese chrome.
 */
export default function ErrorPage({ status, suggestion }: Props) {
    const { m, fmt } = useI18n();
    const copy = {
        404: m.errors.notFound,
        410: m.errors.gone,
        500: m.errors.serverError,
        503: m.errors.unavailable,
    }[status];

    const language = suggestion ? m.errors.languages[suggestion.locale] : null;
    const title = suggestion && language ? fmt(m.errors.translation.title, { language }) : copy.title;
    const body = suggestion ? m.errors.translation.body : fmt(copy.body, { email: SUPPORT_EMAIL });

    return (
        <LandingLayout>
            <SEOHead title={title} description={body} />
            <div className="mx-auto max-w-[36rem] px-4 pt-10 pb-16 sm:px-6 md:pt-14 md:pb-20 xl:pt-18 xl:pb-24">
                <p className="type-caption text-muted-foreground tabular-nums">{fmt(m.errors.status, { status })}</p>
                <h1 className="type-h1 mt-2 text-foreground">{title}</h1>
                <p className="type-body mt-4 text-foreground">{body}</p>

                {suggestion && language && (
                    <p className="mt-8">
                        <a
                            href={suggestion.href}
                            hrefLang={suggestion.hreflang}
                            lang={suggestion.locale}
                            className="type-label inline-flex min-h-10 items-center rounded-control bg-accent px-4 text-accent-foreground transition-colors duration-(--dur-tap) hover:bg-accent-hover active:bg-accent-active"
                        >
                            {suggestion.title ?? fmt(m.errors.translation.link, { language })}
                        </a>
                    </p>
                )}

                {status < 500 && (
                    <nav aria-label={m.errors.linksLabel} className="mt-10">
                        <ul className="type-body flex flex-wrap gap-x-6 gap-y-3">
                            {START_PAGES.map(([key, href]) => (
                                <li key={key}>
                                    <LocaleLink
                                        href={href}
                                        className="text-foreground underline decoration-muted-foreground underline-offset-4 hover:text-accent-text hover:decoration-accent-text"
                                    >
                                        {m.errors.links[key]}
                                    </LocaleLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>
        </LandingLayout>
    );
}
