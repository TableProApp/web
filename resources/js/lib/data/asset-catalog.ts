import type { SlotEntry, SlotManifestData } from './asset-model.ts';

export type AssetLocaleCopy = Record<string, Pick<SlotEntry, 'description' | 'alt' | 'caption'>>;

/** Cache by language, never by the current request: SSR renders languages concurrently. */
export function createAssetCatalog(metadata: SlotManifestData, loaders: Record<string, () => Promise<AssetLocaleCopy>>) {
    const catalogs = new Map<string, SlotManifestData>();
    const pending = new Map<string, Promise<void>>();

    return {
        load(locale: string): Promise<void> {
            if (catalogs.has(locale)) return Promise.resolve();
            const inFlight = pending.get(locale);
            if (inFlight) return inFlight;
            const loader = loaders[locale];
            if (!loader) return Promise.reject(new Error(`Missing asset catalog for ${locale}`));

            const promise = loader().then((copy) => {
                const assets = Object.fromEntries(Object.entries(metadata.assets).map(([id, entry]) => {
                    if (!Object.hasOwn(copy, id)) throw new Error(`Missing asset ${id} in ${locale}`);
                    return [id, { ...entry, ...copy[id] }];
                }));
                catalogs.set(locale, { kinds: metadata.kinds, assets });
            }).finally(() => pending.delete(locale));
            pending.set(locale, promise);
            return promise;
        },
        manifest(locale: string): SlotManifestData {
            const manifest = catalogs.get(locale);
            if (!manifest) throw new Error(`Asset catalog for ${locale} has not been loaded`);
            return manifest;
        },
    };
}
