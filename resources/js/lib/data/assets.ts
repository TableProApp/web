/**
 * The asset manifest as the browser bundle carries it, typed.
 *
 * The source of truth is resources/data/assets.json. The bundle imports only
 * its render slice, `./asset-slots.json`, which `php artisan assets:handoff`
 * writes from it (`AssetManifest::slotProjection()`): the slot entries'
 * render fields, the placeholder description or the supplied alt text and
 * caption, and each kind's type, aspect and sizes. The handoff-only fields
 * (`usedOn`, `handoffPriority`, `legacySource`, export rules and notes) and
 * the bespoke social cards stay out of every page's JavaScript.
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
