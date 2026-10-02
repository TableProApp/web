interface Variant {
    src: string;
    /** Optional WebP srcSet. Falls back to `src` where no derivatives exist. */
    webpSrcSet?: string;
}

interface ThemedImageProps {
    light: Variant;
    dark: Variant;
    alt: string;
    width: number;
    height: number;
    sizes?: string;
    className?: string;
    /** Set on the LCP image only: the light variant loads eagerly, at high priority. */
    priority?: boolean;
}

/**
 * Retiring: `AssetSlot` replaces it (design-system §5.1, §6). A light and dark
 * image pair, switched by the theme class.
 *
 * The reader's explicit choice decides, never the operating system: the site is
 * light until someone picks dark, so a `<source>` chosen by the
 * `prefers-color-scheme` media query would show a dark screenshot on a light
 * page to every visitor whose system is dark. Both variants are rendered;
 * `.dark` hides one and shows the other (design-system §7.3).
 *
 * The hidden variant is never fetched: it is `loading="lazy"` inside a
 * `display: none` box, which has no layout and so never comes near the
 * viewport. `display: contents` on the visible wrapper keeps the `<img>` laid
 * out as a direct child of whatever holds it, as a bare `<picture>` was.
 *
 * Delete this file once nothing imports it.
 */
export default function ThemedImage({ light, dark, alt, width, height, sizes, className, priority = false }: ThemedImageProps) {
    return (
        <>
            <picture className="contents dark:hidden">
                {light.webpSrcSet && <source type="image/webp" srcSet={light.webpSrcSet} sizes={sizes} />}
                <img
                    src={light.src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={className}
                    loading={priority ? undefined : 'lazy'}
                    decoding={priority ? undefined : 'async'}
                    fetchPriority={priority ? 'high' : undefined}
                />
            </picture>
            <picture className="hidden dark:contents">
                {dark.webpSrcSet && <source type="image/webp" srcSet={dark.webpSrcSet} sizes={sizes} />}
                <img src={dark.src} alt={alt} width={width} height={height} className={className} loading="lazy" decoding="async" />
            </picture>
        </>
    );
}
