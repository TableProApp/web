// Relative imports only, so `node --test` loads it directly (tests/js/download-mac.test.ts).
import type { MacArchitecture, ReleaseAsset, ReleaseProp } from './types.ts';

export const MAC_ARCHITECTURES: readonly MacArchitecture[] = ['arm64', 'x86_64'];

export function hasBuildPerArchitecture(assets: ReleaseProp['assets']): boolean {
    return MAC_ARCHITECTURES.every((architecture) => assets[architecture] !== undefined);
}

export function macAsset(assets: ReleaseProp['assets'], architecture: MacArchitecture): ReleaseAsset | null {
    return assets[hasBuildPerArchitecture(assets) ? architecture : 'universal'] ?? null;
}
