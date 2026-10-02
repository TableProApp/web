/**
 * The markup of `<AssetSlot>`, as a plain function of the manifest.
 *
 * Written with `createElement` rather than JSX so `node --test` can render it
 * through `react-dom/server` with no build step: tests/js/asset-slot.test.ts
 * renders every real entry as a placeholder and an isolated fixture manifest
 * through the supplied path. `asset-slot.tsx` is the component that binds it
 * to the real manifest and the page's locale.
 *
 * Imports are relative and type-only where they can be, so Node resolves them
 * without the `@/` alias.
 */
import { createElement, Fragment, type ReactElement, type ReactNode } from 'react';
import { Crop, ImageIcon, Shapes, Smartphone, Tablet, Workflow, type LucideIcon } from 'lucide-react';
import { interpolate } from '../../i18n/core.ts';
import {
    slotModel,
    type SlotManifestData,
    type PictureModel,
    type PlaceholderPart,
    type SlotType,
    type SuppliedPart,
} from '../../lib/data/asset-model.ts';
import { cn } from '../../lib/utils.ts';

/** The `assets` UI catalog (resources/js/i18n/messages/{locale}/assets.ts). */
export interface AssetSlotLabels {
    types: Record<SlotType, string>;
    accessibleName: string;
}

export interface AssetSlotViewOptions {
    locale: string;
    labels: AssetSlotLabels;
    sizes?: string;
    className?: string;
    /** Render the manifest caption under a supplied image. Placeholders never show one. */
    caption?: boolean;
}

const ICONS: Record<SlotType, LucideIcon> = {
    screenshot: ImageIcon,
    detail: Crop,
    'screenshot-phone': Smartphone,
    'screenshot-ipad': Tablet,
    diagram: Workflow,
    illustration: Shapes,
};

/** Phone slots are a fixed width, centred: 240px below 768, 280px above (design-system §6.2). */
const PHONE_WIDTH = 'mx-auto w-[240px] md:w-[280px]';

/** Which breakpoint shows a part: the window above 768px, its crop below. */
type Visibility = 'always' | 'desktop' | 'phone';

const VISIBILITY: Record<Visibility, string> = {
    always: '',
    desktop: 'max-md:hidden',
    phone: 'md:hidden',
};

function placeholderBox(part: PlaceholderPart, labels: AssetSlotLabels, visibility: Visibility): ReactElement {
    const label = labels.types[part.type];

    return createElement(
        'div',
        {
            role: 'img',
            'aria-label': interpolate(labels.accessibleName, { type: label, description: part.description }),
            'data-asset-id': part.id,
            'data-asset-status': 'placeholder',
            className: cn(
                'flex w-full items-center justify-center rounded-xl border border-dashed border-rule-strong bg-surface p-4 sm:p-6',
                'forced-colors:border-[CanvasText]',
                part.kind === 'phone' && PHONE_WIDTH,
                VISIBILITY[visibility],
            ),
            style: { aspectRatio: part.aspect },
        },
        createElement(
            'div',
            { 'aria-hidden': 'true', className: 'max-w-[52ch] text-left' },
            createElement(
                'p',
                { className: 'flex flex-wrap items-center gap-x-2 gap-y-1' },
                createElement(ICONS[part.type], { size: 16, 'aria-hidden': true, className: 'shrink-0 text-muted-foreground' }),
                createElement('span', { className: 'type-label text-foreground' }, label),
                createElement('code', { className: 'font-mono text-xs text-muted-foreground [overflow-wrap:anywhere]' }, part.id),
            ),
            createElement('p', { className: 'type-small mt-2 text-muted-foreground' }, part.description),
        ),
    );
}

/**
 * Captures keep what the product looks like: no filter, no border on a Mac
 * window (its alpha corners are real), and the `.app-plate` drop shadow.
 * Opaque phone and iPad captures get a 1px rule and rounded corners instead
 * (design-system §7.3).
 */
function imageClass(kind: SuppliedPart['kind']): string {
    switch (kind) {
        case 'window':
        case 'mobile-crop':
            return 'app-plate h-auto w-full object-contain';
        case 'phone':
            return 'h-auto w-full rounded-[12%/5.54%] object-contain outline outline-1 outline-rule';
        case 'ipad':
            return 'h-auto w-full rounded-xl object-contain outline outline-1 outline-rule';
        default:
            return 'h-auto w-full object-contain';
    }
}

const THEME_CLASS = {
    light: 'block dark:hidden',
    dark: 'hidden dark:block',
} as const;

function picture(model: PictureModel, kind: SuppliedPart['kind'], visibility: Visibility, key: string): ReactElement {
    const { img } = model;

    return createElement(
        'picture',
        {
            key,
            className: cn(
                model.theme ? THEME_CLASS[model.theme] : 'block',
                kind === 'phone' && PHONE_WIDTH,
                VISIBILITY[visibility],
            ),
        },
        ...model.sources.map((source, index) =>
            createElement('source', {
                key: index,
                media: source.media,
                type: source.type,
                srcSet: source.srcSet,
                sizes: source.sizes,
                width: source.width,
                height: source.height,
            }),
        ),
        createElement('img', {
            src: img.src,
            srcSet: img.srcSet,
            sizes: img.sizes,
            width: img.width,
            height: img.height,
            alt: img.alt,
            loading: img.loading,
            decoding: img.decoding,
            fetchPriority: img.fetchPriority,
            className: imageClass(kind),
        }),
    );
}

function part(
    model: PlaceholderPart | SuppliedPart,
    labels: AssetSlotLabels,
    visibility: Visibility,
    key: string,
): ReactNode {
    if (model.mode === 'placeholder') {
        return createElement(Fragment, { key }, placeholderBox(model, labels, visibility));
    }

    return createElement(
        Fragment,
        { key },
        ...model.pictures.map((pictureModel, index) => picture(pictureModel, model.kind, visibility, `${key}-${index}`)),
    );
}

/**
 * Renders one slot.
 *
 * Placeholder: `<figure data-asset-id data-asset-status="placeholder">` holding
 * a `role="img"` box (with its own `data-asset-id` and status) whose accessible
 * name is "{type label}: {description}". No `<img>`, no `background-image`, no
 * request of any kind.
 *
 * Supplied: `<figure data-asset-status="supplied">` holding `<picture>`s, with
 * the caption when there is one. The id, the type label and the description
 * are never rendered in this mode (spec §9.1).
 */
export function renderAssetSlot(manifest: SlotManifestData, id: string, options: AssetSlotViewOptions): ReactElement {
    const { locale, labels, sizes, className, caption = true } = options;
    const model = slotModel(manifest, id, { locale, sizes });
    const modes = [model.main.mode, model.mobile?.mode].filter((mode) => mode !== undefined);
    /*
     * `partial` only while a window and its phone crop are at different
     * stages; a window may not reach `supplied` before its crop
     * (AssetManifestTest), so in practice that is a supplied crop under a
     * placeholder window. Each placeholder box carries its own status either way.
     */
    const status = modes.every((mode) => mode === 'placeholder')
        ? 'placeholder'
        : modes.every((mode) => mode === 'supplied')
          ? 'supplied'
          : 'partial';
    const mainVisibility: Visibility = model.mobile ? 'desktop' : 'always';

    return createElement(
        'figure',
        {
            className: cn('m-0', className),
            'data-asset-id': status === 'supplied' ? undefined : id,
            'data-asset-status': status,
        },
        part(model.main, labels, mainVisibility, 'main'),
        model.mobile ? part(model.mobile, labels, 'phone', 'mobile') : null,
        caption && model.caption
            ? createElement('figcaption', { className: 'type-caption mt-3 text-muted-foreground' }, model.caption)
            : null,
    );
}
