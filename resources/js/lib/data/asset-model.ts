/**
 * The asset manifest's types, and the pure functions that turn one entry into
 * what `<AssetSlot>` renders.
 *
 * Pure and free of path aliases and JSON imports, so `node --test` loads it
 * directly (tests/js/asset-slot.test.ts) and runs it against both the real
 * manifest and an isolated fixture. `./assets.ts` binds it to
 * resources/data/assets.json for the app.
 *
 * The file naming here must match `App\Support\Assets\AssetManifest` in PHP,
 * which validates supplied files and builds the LCP preload. Both sides are
 * held to the same fixture, tests/Fixtures/assets/manifest.json.
 */

export type AssetKindName =
    | 'window'
    | 'mobile-crop'
    | 'detail'
    | 'phone'
    | 'ipad'
    | 'diagram'
    | 'illustration'
    | 'figure'
    | 'og-card';

/** The type vocabulary of design-system §6.2. `og-card` entries are never slots. */
export type SlotType = 'screenshot' | 'detail' | 'screenshot-phone' | 'screenshot-ipad' | 'diagram' | 'illustration';

export type AssetType = SlotType | 'og-card';

export type ImageFormat = 'avif' | 'webp' | 'png' | 'svg';

export type ThemeVariant = 'light' | 'dark';

/** Source text or one selected locale; editorial figures can carry English only. */
export type LocalizedText = Record<string, string | null>;

/** One delivered image: every width in every format, all sharing one shape. */
export interface AssetSource {
    widths: number[];
    formats: ImageFormat[];
    /** The pixel size of the widest file. Only the ratio matters to layout. */
    width: number;
    height: number;
}

export interface ThemedSources {
    light: AssetSource;
    dark?: AssetSource | null;
}

/** `ThemedSources`, or for a `per-locale` entry one `ThemedSources` per locale code. */
export type AssetSrc = ThemedSources | Record<string, ThemedSources>;

export interface AssetKind {
    type: AssetType | 'per-figure';
    aspect: string | null;
    rendered: Record<'desktop' | 'tablet' | 'phone', [number, number | null] | null> | null;
    exportPx: [number, number | null] | null;
    vector: boolean;
    density: number | null;
    format: { master: ImageFormat; delivered: ImageFormat[] };
    transparency: boolean | 'as-needed' | 'as-source';
    maxBytes: number;
    widths: number[];
    sizes: string | null;
    note?: string;
}

export interface AssetUse {
    path: string;
    section: string;
}

export interface AssetEntry {
    kind: AssetKindName;
    type: AssetType;
    family: string;
    ownerRepo: 'web' | 'license';
    slot: boolean;
    handoffPriority: 'P1' | 'P2' | 'P3';
    usedOn: AssetUse[];
    aspect: string | null;
    priority: boolean;
    theme: 'both' | 'single';
    locale: 'shared' | 'per-locale';
    mobile: string | null;
    description: LocalizedText;
    alt: LocalizedText;
    caption: LocalizedText | null;
    replacement: { dir: string; base: string };
    status: 'placeholder' | 'supplied';
    src: AssetSrc | null;
    legacySource: string | string[] | null;
}

export interface AssetManifestData {
    kinds: Record<AssetKindName, AssetKind>;
    assets: Record<string, AssetEntry>;
}

/** What rendering needs of a kind. */
export type SlotKind = Pick<AssetKind, 'type' | 'aspect' | 'sizes'>;

/**
 * What rendering needs of an entry: its render fields, plus the description
 * while it is a placeholder and the alt text and caption once it is supplied.
 * Every `AssetEntry` is one.
 */
export type SlotEntry = Pick<
    AssetEntry,
    'kind' | 'type' | 'slot' | 'aspect' | 'priority' | 'theme' | 'locale' | 'mobile' | 'status' | 'src' | 'replacement'
> &
    Partial<Pick<AssetEntry, 'description' | 'alt' | 'caption'>>;

/**
 * The manifest as the browser receives it: `AssetManifest::slotProjection()`
 * in PHP, written by `php artisan assets:handoff` to
 * `resources/js/lib/data/asset-slots.json`. The full `AssetManifestData`
 * satisfies it too, which is how the tests render the real manifest.
 */
export interface SlotManifestData {
    kinds: Record<AssetKindName, SlotKind>;
    assets: Record<string, SlotEntry>;
}

/** `16:9` → `16 / 9`, the CSS `aspect-ratio` form. */
export function cssAspect(aspect: string): string {
    const [width, height] = aspect.split(':');

    return `${width} / ${height}`;
}

/** The entry's own aspect (1:1 crops, blog figures), else its kind's. */
export function entryAspect(entry: SlotEntry, kind: SlotKind): string {
    const aspect = entry.aspect ?? kind.aspect;

    if (aspect === null) {
        throw new Error(`Asset of kind ${entry.kind} needs its own aspect.`);
    }

    return aspect;
}

/** The locale's text, falling back to English where a locale is not written (English-only posts). */
export function localized(text: LocalizedText, locale: string): string {
    const line = text[locale] ?? text.en;

    if (typeof line !== 'string') {
        throw new Error(`Missing asset text for ${locale}`);
    }

    return line;
}

export function mimeType(format: ImageFormat): string {
    return format === 'svg' ? 'image/svg+xml' : `image/${format}`;
}

/** `public/images/home` → `/images/home`. */
export function publicUrl(dir: string): string {
    return '/' + dir.replace(/^public\/?/, '').replace(/\/$/, '');
}

/**
 * One file's URL: `{dir}/{base}-{variant}[-{locale}]-{width}.{format}`. A
 * vector drops the width; an OG card is `{base}-{locale}.png`.
 */
export function fileUrl(
    entry: SlotEntry,
    variant: ThemeVariant,
    locale: string | null,
    width: number | null,
    format: ImageFormat,
): string {
    const dir = publicUrl(entry.replacement.dir);
    const base = entry.replacement.base;

    if (entry.kind === 'og-card') {
        return `${dir}/${base}-${locale ?? 'en'}.${format}`;
    }

    const parts = [base, variant];

    if (locale !== null) {
        parts.push(locale);
    }

    if (format !== 'svg' && width !== null) {
        parts.push(String(width));
    }

    return `${dir}/${parts.join('-')}.${format}`;
}

/** `…-720.avif 720w, …-1216.avif 1216w`, or the bare URL for a vector. */
export function srcSet(
    entry: SlotEntry,
    source: AssetSource,
    variant: ThemeVariant,
    locale: string | null,
    format: ImageFormat,
): string {
    if (format === 'svg') {
        return fileUrl(entry, variant, locale, null, format);
    }

    return [...source.widths]
        .sort((a, b) => a - b)
        .map((width) => `${fileUrl(entry, variant, locale, width, format)} ${width}w`)
        .join(', ');
}

/** The sources for a locale, or null while the entry is a placeholder. */
export function themedSources(entry: SlotEntry, locale: string): { sources: ThemedSources; locale: string | null } | null {
    if (entry.status !== 'supplied' || entry.src === null) {
        return null;
    }

    if (entry.locale === 'per-locale') {
        const perLocale = entry.src as Record<string, ThemedSources>;
        const chosen = perLocale[locale] ? locale : 'en';

        return perLocale[chosen] ? { sources: perLocale[chosen], locale: chosen } : null;
    }

    return { sources: entry.src as ThemedSources, locale: null };
}

export interface PlaceholderPart {
    mode: 'placeholder';
    id: string;
    kind: AssetKindName;
    type: SlotType;
    aspect: string;
    description: string;
}

export interface PictureSource {
    media?: string;
    type: string;
    srcSet: string;
    sizes?: string;
    width: number;
    height: number;
}

export interface PictureModel {
    /** `null` for a single-theme image, which shows in both page themes. */
    theme: ThemeVariant | null;
    sources: PictureSource[];
    img: {
        src: string;
        srcSet?: string;
        sizes?: string;
        width: number;
        height: number;
        alt: string;
        loading?: 'lazy';
        decoding: 'async' | 'auto';
        fetchPriority?: 'high';
    };
}

export interface SuppliedPart {
    mode: 'supplied';
    kind: AssetKindName;
    pictures: PictureModel[];
    /** The pictures carry the entry's phone crop below 768px (an art-directed window, detail or iPad image). */
    phoneCrop: boolean;
}

export interface SlotModel {
    id: string;
    kind: AssetKindName;
    /** The main entry as a placeholder, or every supplied image (art-directed with the crop when both are supplied). */
    main: PlaceholderPart | SuppliedPart;
    /** The phone crop, when it renders separately from the main image (one or both still placeholders). */
    mobile: PlaceholderPart | SuppliedPart | null;
    caption: string | null;
}

export interface SlotOptions {
    locale: string;
    /** The slot's real width, when it sits in a narrower column than its kind assumes. */
    sizes?: string;
    /**
     * Load this placement with priority even though the entry is not marked
     * `priority`: the first image of a page other than the homepage, such as
     * the /ios hero, whose entries load lazily where they appear further down
     * another page. The manifest's `priority` stays the homepage hero's.
     */
    priority?: boolean;
}

/** Below this width a slot with a `mobile` crop shows the crop (design-system §6.3). */
export const MOBILE_MEDIA = '(min-width: 768px)';

function entryFor(manifest: SlotManifestData, id: string): SlotEntry {
    const entry = manifest.assets[id];

    if (!entry) {
        throw new Error(`Unknown asset id "${id}". Add it to resources/data/assets.json first.`);
    }

    if (!entry.slot || entry.type === 'og-card') {
        throw new Error(`Asset "${id}" is a handoff-only entry and cannot render in a slot.`);
    }

    return entry;
}

// The main image decides: a crop alone cannot fill a slot above 768px.
export function slotSupplied(manifest: SlotManifestData, id: string, locale: string): boolean {
    return themedSources(entryFor(manifest, id), locale) !== null;
}

/** The entry's text for a field, which the bundled projection keeps only for the state that shows it. */
function required(text: LocalizedText | undefined, id: string, field: string): LocalizedText {
    if (text === undefined) {
        throw new Error(`Asset "${id}" has no ${field} here. Run php artisan assets:handoff to refresh resources/js/lib/data/asset-slots.json.`);
    }

    return text;
}

function placeholder(id: string, entry: SlotEntry, kind: SlotKind, locale: string): PlaceholderPart {
    return {
        mode: 'placeholder',
        id,
        kind: entry.kind,
        type: entry.type as SlotType,
        aspect: cssAspect(entryAspect(entry, kind)),
        description: localized(required(entry.description, id, 'description'), locale),
    };
}

/**
 * The `<source>` list for one image in one theme: every format but the last,
 * which becomes the `<img>`'s own `srcset` (the most compatible format comes
 * last in `formats`).
 */
function variantSources(
    entry: SlotEntry,
    source: AssetSource,
    variant: ThemeVariant,
    locale: string | null,
    sizes: string | undefined,
    media?: string,
): { sources: PictureSource[]; fallback: PictureSource } {
    const all = source.formats.map(
        (format): PictureSource => ({
            ...(media ? { media } : {}),
            type: mimeType(format),
            srcSet: srcSet(entry, source, variant, locale, format),
            ...(sizes && format !== 'svg' ? { sizes } : {}),
            width: source.width,
            height: source.height,
        }),
    );

    return { sources: all.slice(0, -1), fallback: all[all.length - 1] };
}

function largestUrl(entry: SlotEntry, source: AssetSource, variant: ThemeVariant, locale: string | null): string {
    const format = source.formats[source.formats.length - 1];

    return fileUrl(entry, variant, locale, Math.max(...source.widths, 0) || null, format);
}

/**
 * Loading rules (design-system §6.4, §7.3):
 * - every image is lazy, so a theme variant under `display: none` is never fetched;
 * - a priority image gets `fetchpriority="high"`, and if it is the only variant it is eager;
 * - a priority pair stays lazy, because an eager pair would download both themes. The head
 *   preload in app.blade.php (`lcpAsset`) fetches the variant for the resolved theme instead.
 *
 * `priority` is the entry's, or the placement's when the page asks for it (`SlotOptions`).
 */
function loadingFor(priority: boolean, themed: boolean): Pick<PictureModel['img'], 'loading' | 'decoding' | 'fetchPriority'> {
    if (!priority) {
        return { loading: 'lazy', decoding: 'async' };
    }

    return themed ? { loading: 'lazy', decoding: 'auto', fetchPriority: 'high' } : { decoding: 'auto', fetchPriority: 'high' };
}

function supplied(
    id: string,
    entry: SlotEntry,
    kind: SlotKind,
    locale: string,
    sizes: string | undefined,
    crop: { entry: SlotEntry; kind: SlotKind } | null,
    priority: boolean,
): SuppliedPart {
    const main = themedSources(entry, locale);

    if (main === null) {
        throw new Error('supplied() needs a supplied entry.');
    }

    const cropSources = crop ? themedSources(crop.entry, locale) : null;
    const variants: (ThemeVariant | null)[] = entry.theme === 'both' ? ['light', 'dark'] : [null];
    const alt = localized(required(entry.alt, id, 'alt text'), locale);

    const pictures = variants.map((theme): PictureModel => {
        const variant: ThemeVariant = theme ?? 'light';
        const mainSource = (variant === 'dark' ? main.sources.dark : main.sources.light) ?? main.sources.light;
        const mainSizes = sizes ?? kind.sizes ?? undefined;
        const loading = loadingFor(priority, theme !== null);

        if (crop && cropSources) {
            const cropSource = (variant === 'dark' ? cropSources.sources.dark : cropSources.sources.light) ?? cropSources.sources.light;
            const desktop = variantSources(entry, mainSource, variant, main.locale, mainSizes, MOBILE_MEDIA);
            const phone = variantSources(crop.entry, cropSource, variant, cropSources.locale, crop.kind.sizes ?? undefined);

            return {
                theme,
                sources: [...desktop.sources, desktop.fallback, ...phone.sources],
                img: {
                    src: largestUrl(crop.entry, cropSource, variant, cropSources.locale),
                    srcSet: phone.fallback.srcSet,
                    sizes: phone.fallback.sizes,
                    width: cropSource.width,
                    height: cropSource.height,
                    alt,
                    ...loading,
                },
            };
        }

        const own = variantSources(entry, mainSource, variant, main.locale, mainSizes);

        return {
            theme,
            sources: own.sources,
            img: {
                src: largestUrl(entry, mainSource, variant, main.locale),
                ...(mainSource.formats.includes('svg') ? {} : { srcSet: own.fallback.srcSet, sizes: own.fallback.sizes }),
                width: mainSource.width,
                height: mainSource.height,
                alt,
                ...loading,
            },
        };
    });

    return { mode: 'supplied', kind: entry.kind, pictures, phoneCrop: crop !== null && cropSources !== null };
}

/**
 * Everything `<AssetSlot id>` needs to render, decided by the manifest's
 * `status` fields alone.
 *
 * - Placeholder: the visible brief. A `mobile` crop renders as a second part,
 *   swapped in below 768px by CSS.
 * - Supplied: `<picture>` per theme variant. When the image and its crop are
 *   both supplied they merge into one art-directed picture, so a phone fetches
 *   only the crop.
 */
export function slotModel(manifest: SlotManifestData, id: string, options: SlotOptions): SlotModel {
    const { locale, sizes } = options;
    const entry = entryFor(manifest, id);
    const priority = options.priority === true || entry.priority;
    const kind = manifest.kinds[entry.kind];
    const cropEntry = entry.mobile ? entryFor(manifest, entry.mobile) : null;
    const cropKind = cropEntry ? manifest.kinds[cropEntry.kind] : null;
    const mainSupplied = themedSources(entry, locale) !== null;
    const cropSupplied = cropEntry !== null && themedSources(cropEntry, locale) !== null;

    let main: PlaceholderPart | SuppliedPart;
    let mobile: PlaceholderPart | SuppliedPart | null = null;

    if (mainSupplied && cropEntry && cropKind && cropSupplied) {
        main = supplied(id, entry, kind, locale, sizes, { entry: cropEntry, kind: cropKind }, priority);
    } else {
        main = mainSupplied ? supplied(id, entry, kind, locale, sizes, null, priority) : placeholder(id, entry, kind, locale);

        if (cropEntry && cropKind && entry.mobile) {
            mobile = cropSupplied
                ? supplied(entry.mobile, cropEntry, cropKind, locale, undefined, null, priority || cropEntry.priority)
                : placeholder(entry.mobile, cropEntry, cropKind, locale);
        }
    }

    const caption = main.mode === 'supplied' && entry.caption ? localized(entry.caption, locale) : null;

    return { id, kind: entry.kind, main, mobile, caption };
}
