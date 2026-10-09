/**
 * The asset manifest as the browser bundle carries it, typed.
 *
 * The source of truth is resources/data/assets.json. The bundle imports only
 * its geometry slice, `./asset-slots.json`, plus the current language’s text
 * from `./asset-locales/{locale}.json`. `php artisan assets:generate` writes
 * both from the manifest. The page resolver awaits the selected catalog before
 * SSR or hydration; other languages stay in separate chunks. Handoff fields
 * and bespoke social cards stay out of the browser’s JavaScript.
 * tests/Feature/Assets/AssetManifestTest.php fails while the slice is stale,
 * and tests/js/asset-slot.test.ts proves every slot renders the same from
 * the slice as from the full manifest.
 *
 * A JSON import widens every string union to `string`, so this makes the one
 * documented cast to `SlotManifestData`. It is safe because the PHP test
 * validates the manifest against the same schema (architecture §1.8, §1.9).
 *
 * `AssetId` is the literal set of keys in the slice, so a mistyped id in an
 * `<AssetSlot id="…">` literal fails `npm run typecheck`. An id that arrives
 * from page content is a plain string: narrow it with `isAssetId()`.
 */
import slots from './asset-slots.json';
import type { SlotEntry, SlotManifestData } from './asset-model.ts';
import { createAssetCatalog, type AssetLocaleCopy } from './asset-catalog.ts';

export type {
    AssetEntry,
    AssetKind,
    AssetKindName,
    AssetManifestData,
    AssetSource,
    AssetType,
    SlotEntry,
    SlotKind,
    SlotManifestData,
    SlotType,
} from './asset-model.ts';

export type AssetId = keyof (typeof slots)['assets'];

export const ASSET_MANIFEST = slots as unknown as SlotManifestData;

const imports = import.meta.glob<{ default: AssetLocaleCopy }>('./asset-locales/*.json');
const loaders = Object.fromEntries(Object.entries(imports).map(([path, load]) => [
    path.slice('./asset-locales/'.length, -'.json'.length),
    async () => (await load()).default,
]));
const catalog = createAssetCatalog(ASSET_MANIFEST, loaders);
export const loadAssetLocale = (locale: string): Promise<void> => catalog.load(locale);
export const assetManifest = (locale: string): SlotManifestData => catalog.manifest(locale);

/** True for an id that names a renderable slot (not a handoff-only entry such as a bespoke OG card). */
export function isAssetId(value: unknown): value is AssetId {
    return typeof value === 'string' && Object.hasOwn(ASSET_MANIFEST.assets, value) && ASSET_MANIFEST.assets[value].slot;
}

export function assetEntry(id: AssetId): SlotEntry {
    return ASSET_MANIFEST.assets[id];
}

/** True once the owner's image has replaced the placeholder. */
export function isSupplied(id: AssetId): boolean {
    return assetEntry(id).status === 'supplied';
}
