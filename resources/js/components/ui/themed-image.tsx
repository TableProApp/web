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
    /** Set on the LCP image only: eager, high priority, no lazy decode. */
    priority?: boolean;
}

/**
 * A light/dark image pair that fetches exactly one file.
 *
 * The older `hidden dark:contents` approach downloaded both variants, since
 * `display: none` does not cancel an in-flight image request. Selecting on
 * `prefers-color-scheme` lets the browser pick one source and ignore the other.
 *
 * This is correct only while the theme follows the OS. Nothing writes
 * `localStorage.theme` today, and `app.blade.php` derives its hero preload the
 * same way. If a theme toggle is ever added, these must become a JS-swapped
 * `src` or the wrong variant will be served.
 */
export default function ThemedImage({
    light,
    dark,
    alt,
    width,
    height,
    sizes,
    className,
    priority = false,
}: ThemedImageProps) {
    return (
        <picture>
            {dark.webpSrcSet && (
                <source media="(prefers-color-scheme: dark)" type="image/webp" srcSet={dark.webpSrcSet} sizes={sizes} />
            )}
            <source media="(prefers-color-scheme: dark)" srcSet={dark.src} />
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
    );
}
