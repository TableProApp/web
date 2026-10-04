import { Fragment, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import type { SiteLinks } from '@/components/faq/content-links';
import { plainPageJsonLd } from '@/components/faq/structured-data';
import SEOHead from '@/components/seo/seo-head';
import Callout from '@/components/ui/callout';
import Container from '@/components/ui/container';
import Disclosure from '@/components/ui/disclosure';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import ProseArticle from '@/components/ui/prose-article';
import { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n } from '@/i18n';
import LandingLayout from '@/layouts/landing-layout';

export type LegalChrome = typeof import('@data/content/en/legal.json');

/** One document, rendered on the server by `App\Services\Legal\LegalDocuments`. */
export interface LegalDocument {
    /** `privacy`, `terms` or `refund-policy`. */
    name: string;
    /** The English base path, `/privacy`. */
    path: string;
    title: string;
    description: string;
    /** `YYYY-MM-DD`; changes only when the substance does. */
    updatedAt: string;
    /** Formatted in PHP for the page's locale, so server and browser agree. */
    updatedAtFormatted: string;
    html: string;
    /** The document's `h2` sections, for the table of contents. */
    toc: { id: string; title: string }[];
}

export interface LegalPageProps {
    document: LegalDocument;
    chrome: LegalChrome;
    links: SiteLinks;
    organizationProfiles: string[];
}

/** The marker `LegalDocuments::COOKIE_SETTINGS_MARKER` leaves where a document wants its own control. */
const MARKER = '<cookie-settings></cookie-settings>';

interface LegalPageLayoutProps extends LegalPageProps {
    /** What replaces the document's control marker, if it has one. */
    control?: ReactNode;
}

/**
 * The privacy policy, terms and refund policy (design-system §8.11).
 *
 * The utility header with the "Last updated" line, then the document at
 * reading width with its sections listed beside it from 1280px (a sticky
 * column) and in an "On this page" disclosure below that. On a Vietnamese page
 * a note says the text is a translation and the English version prevails, with
 * a link to it. The document's headings carry the same ids in both languages,
 * so `/privacy#cookies` and `/vi/privacy#cookies` open the same section.
 *
 * The HTML comes from repository markdown only, rendered on the server.
 */
export default function LegalPage({ document, chrome, links, organizationProfiles, control }: LegalPageLayoutProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const chunks = document.html.split(MARKER);

    const crumbs = [
        { name: m.common.home, path: path('/') },
        { name: document.title, path: path(document.path) },
    ];

    const toc = (
        <ol className="space-y-2">
            {document.toc.map((section) => (
                <li key={section.id}>
                    <a href={`#${section.id}`} className={textLinkClasses('inline', 'no-underline hover:underline')}>
                        {section.title}
                    </a>
                </li>
            ))}
        </ol>
    );

    return (
        <LandingLayout>
            <SEOHead
                title={document.title}
                description={document.description}
                jsonLd={plainPageJsonLd({
                    baseUrl: canonicalBaseUrl,
                    inLanguage: LOCALES.supported[locale].hreflang,
                    path: path(document.path),
                    name: document.title,
                    description: document.description,
                    crumbs,
                    organization: { description: m.seo.product.short, sameAs: organizationProfiles },
                })}
            />

            <PageHeader
                variant="utility"
                title={document.title}
                meta={
                    <time dateTime={document.updatedAt} className="tabular-nums">
                        {fmt(chrome.updated, { date: document.updatedAtFormatted })}
                    </time>
                }
                breadcrumbs={[{ label: m.common.home, href: '/' }, { label: document.title }]}
            />

            <Container className="pb-16 md:pb-20 xl:pb-24">
                <div className="xl:grid xl:grid-cols-12 xl:gap-8">
                    {document.toc.length > 1 && (
                        <nav aria-labelledby="legal-toc" className="hidden xl:col-span-3 xl:block">
                            <div className="sticky top-24">
                                <h2 id="legal-toc" className="type-label text-muted-foreground">
                                    {chrome.toc}
                                </h2>
                                <div className="type-small mt-3">{toc}</div>
                            </div>
                        </nav>
                    )}

                    <div className="min-w-0 xl:col-span-7 xl:col-start-4">
                        {locale !== 'en' && (
                            <Callout title={chrome.notice.title} className="mb-8 max-w-[44rem]">
                                <p>
                                    <Trans
                                        text={chrome.notice.body}
                                        tags={{
                                            english: (text) => (
                                                <LocaleLink href={document.path} locale="en" className={textLinkClasses('inline')}>
                                                    {text}
                                                </LocaleLink>
                                            ),
                                        }}
                                    />
                                </p>
                            </Callout>
                        )}

                        {document.toc.length > 1 && (
                            <Disclosure summary={chrome.toc} className="mb-8 xl:hidden">
                                {toc}
                            </Disclosure>
                        )}

                        {chunks.map((chunk, index) => (
                            <Fragment key={index}>
                                {index > 0 && control !== undefined && <div className="my-6">{control}</div>}
                                <ProseArticle html={chunk} />
                            </Fragment>
                        ))}

                        {/* A document that ends with its own Contact section (Privacy, Terms) does not repeat the address under it. */}
                        {!document.toc.some((section) => section.id === 'contact') && (
                            <p className="type-small mt-12 max-w-[44rem] border-t border-rule pt-6 text-muted-foreground">
                                <Trans
                                    text={chrome.contact}
                                    values={links.email !== null ? { email: links.email } : {}}
                                    tags={{
                                        email: (text) =>
                                            links.email !== null ? (
                                                <a href={`mailto:${links.email}`} className={textLinkClasses('inline')}>
                                                    {text}
                                                </a>
                                            ) : (
                                                text
                                            ),
                                    }}
                                />
                            </p>
                        )}
                    </div>
                </div>
            </Container>
        </LandingLayout>
    );
}
