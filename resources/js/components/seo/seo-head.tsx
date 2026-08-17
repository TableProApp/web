import { Head, usePage } from '@inertiajs/react';
import { buildBreadcrumbJsonLd, type BreadcrumbCrumb } from '@/lib/structured-data';

export interface SEOHeadProps {
    title: string;
    description: string;
    canonical: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'product';
    twitterCard?: 'summary' | 'summary_large_image';
    jsonLd?: object | object[];
    breadcrumbs?: BreadcrumbCrumb[];
    noindex?: boolean;
}

interface SharedSeoProps {
    canonicalBaseUrl: string;
    // usePage's PageProps constraint requires an index signature; without it a
    // narrow interface is not assignable even though every field it declares is.
    [key: string]: unknown;
}

const SITE_NAME = 'TablePro';
const DEFAULT_OG_IMAGE = '/og.png';

function escapeJsonLd(payload: object | object[]): string {
    return JSON.stringify(payload).replace(/<\/script/gi, '<\\/script');
}

function mergeJsonLd(base: object | object[] | undefined, extra: object | null): object[] | object | undefined {
    if (!extra) return base;
    if (!base) return extra;
    const baseArray = Array.isArray(base) ? base : [base];
    return [...baseArray, extra];
}

export default function SEOHead({
    title,
    description,
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    jsonLd,
    breadcrumbs,
    noindex = false,
}: SEOHeadProps) {
    const { canonicalBaseUrl } = usePage<SharedSeoProps>().props;

    const absoluteUrl = (url: string): string => {
        if (/^https?:\/\//i.test(url)) {
            return url;
        }
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${canonicalBaseUrl}${path}`;
    };

    const canonicalUrl = absoluteUrl(canonical);
    const ogImageUrl = absoluteUrl(ogImage);

    const breadcrumbJsonLd = breadcrumbs && breadcrumbs.length > 0
        ? buildBreadcrumbJsonLd(breadcrumbs, canonicalBaseUrl)
        : null;
    const combined = mergeJsonLd(jsonLd, breadcrumbJsonLd);
    const jsonLdContent = combined ? escapeJsonLd(combined) : null;

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            {/*
              * Unconditional, and the only robots tag on the page. It used to
              * render only in the noindex case while `app.blade.php` hardcoded
              * `index,follow`, so every page carried two and a noindex page
              * carried two that disagreed.
              *
              * `max-image-preview:large` matters on a site whose hero is a
              * 3024x1720 screenshot.
              */}
            <meta
                name="robots"
                content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
            />
            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:site_name" content={SITE_NAME} />

            <meta name="twitter:card" content={twitterCard} />
            {/* Without this the card carries no attribution on any share. */}
            <meta name="twitter:site" content="@TableProApp" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImageUrl} />

            {jsonLdContent && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdContent }}
                />
            )}
        </Head>
    );
}
