import { Head, usePage } from '@inertiajs/react';
import { useI18n } from '@/i18n';

export interface SEOHeadProps {
    /** The page's own title. The `seo.titleTemplate` catalog entry adds the brand. */
    title: string;
    description: string;
    ogType?: 'website' | 'article' | 'product';
    jsonLd?: object | object[];
    /** False for a title that already leads with the brand, such as the homepage's. */
    titleTemplate?: boolean;
    twitterCard?: 'summary' | 'summary_large_image';
}

const SITE_NAME = 'TablePro';

function escapeJsonLd(payload: object | object[]): string {
    return JSON.stringify(payload).replace(/<\/script/gi, '<\\/script');
}

/**
 * The document head, rendered from the shared `seo` prop.
 *
 * Robots, canonical, hreflang alternates, `og:locale` and the OG image all come
 * from the PHP page registry (`App\Support\Seo\SeoContext`), the same source the
 * sitemap uses. No page decides its own robots value or canonical, so the head
 * and the sitemap cannot disagree.
 *
 * In order: title and description; exactly one robots meta; the canonical when
 * the page is indexed in this locale; one alternate per real translation plus
 * `x-default`; Open Graph and Twitter tags; JSON-LD with `</script` escaped.
 * Every tag that can repeat carries a unique `head-key`.
 */
export default function SEOHead({
    title,
    description,
    ogType = 'website',
    jsonLd,
    titleTemplate = true,
    twitterCard = 'summary_large_image',
}: SEOHeadProps) {
    const { seo } = usePage().props;
    const { m, fmt } = useI18n();

    const fullTitle = titleTemplate ? fmt(m.seo.titleTemplate, { title }) : title;

    const jsonLdContent = jsonLd ? escapeJsonLd(jsonLd) : null;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta head-key="description" name="description" content={description} />
            <meta head-key="robots" name="robots" content={seo.robots} />
            {seo.canonical && <link head-key="canonical" rel="canonical" href={seo.canonical} />}

            {/*
              * `hreflang` is spread in lowercase on purpose. Inertia's <Head>
              * serialises props by their JSX names, so `hrefLang` would ship as
              * `hrefLang="vi"`; browsers accept either case, but the attribute
              * is `hreflang` and that is what crawlers and tests look for.
              */}
            {seo.alternates.map((alternate) => (
                <link
                    key={alternate.hreflang}
                    head-key={`alternate-${alternate.hreflang}`}
                    rel="alternate"
                    {...{ hreflang: alternate.hreflang }}
                    href={alternate.href}
                />
            ))}
            {seo.xDefault && (
                <link
                    head-key="alternate-x-default"
                    rel="alternate"
                    {...{ hreflang: 'x-default' }}
                    href={seo.xDefault}
                />
            )}

            <meta head-key="og:type" property="og:type" content={ogType} />
            {seo.canonical && <meta head-key="og:url" property="og:url" content={seo.canonical} />}
            <meta head-key="og:title" property="og:title" content={fullTitle} />
            <meta head-key="og:description" property="og:description" content={description} />
            <meta head-key="og:site_name" property="og:site_name" content={SITE_NAME} />
            <meta head-key="og:locale" property="og:locale" content={seo.ogLocale} />
            {seo.ogLocaleAlternates.map((ogLocale) => (
                <meta
                    key={ogLocale}
                    head-key={`og:locale:alternate-${ogLocale}`}
                    property="og:locale:alternate"
                    content={ogLocale}
                />
            ))}
            {seo.ogImage && <meta head-key="og:image" property="og:image" content={seo.ogImage.url} />}
            {seo.ogImage && (
                <meta head-key="og:image:width" property="og:image:width" content={String(seo.ogImage.width)} />
            )}
            {seo.ogImage && (
                <meta head-key="og:image:height" property="og:image:height" content={String(seo.ogImage.height)} />
            )}
            {seo.ogImage && <meta head-key="og:image:type" property="og:image:type" content={seo.ogImage.type} />}

            <meta head-key="twitter:card" name="twitter:card" content={twitterCard} />
            {/* Without this the card carries no attribution on any share. */}
            <meta head-key="twitter:site" name="twitter:site" content="@TableProApp" />
            <meta head-key="twitter:title" name="twitter:title" content={fullTitle} />
            <meta head-key="twitter:description" name="twitter:description" content={description} />
            {seo.ogImage && <meta head-key="twitter:image" name="twitter:image" content={seo.ogImage.url} />}

            {jsonLdContent && (
                <script
                    head-key="json-ld"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdContent }}
                />
            )}
        </Head>
    );
}
