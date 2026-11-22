// Relative imports only, so `node --test` loads it directly (tests/js/download-mac.test.ts).
import type { MacArchitecture, ReleaseAsset, ReleaseProp } from './types.ts';

export const MAC_ARCHITECTURES: readonly MacArchitecture[] = ['arm64', 'x86_64'];

export function hasBuildPerArchitecture(assets: ReleaseProp['assets']): boolean {
    return MAC_ARCHITECTURES.every((architecture) => assets[architecture] !== undefined);
}

export function macAsset(assets: ReleaseProp['assets'], architecture: MacArchitecture): ReleaseAsset | null {
    return assets[hasBuildPerArchitecture(assets) ? architecture : 'universal'] ?? null;
}

export interface ArchitectureHints {
    getHighEntropyValues(hints: string[]): Promise<{ architecture?: string }>;
}

// Chromium's `navigator.userAgentData` names the CPU; Safari and Firefox have no such API and get null.
export async function reportedArchitecture(hints: ArchitectureHints | undefined): Promise<MacArchitecture | null> {
    if (hints === undefined) {
        return null;
    }

    try {
        const { architecture } = await hints.getHighEntropyValues(['architecture']);

        return architecture === 'arm' ? 'arm64' : architecture === 'x86' ? 'x86_64' : null;
    } catch {
        return null;
    }
}
