// Relative imports only, so `node --test` loads it directly (tests/js/download-linux.test.ts).
import { interpolate } from '../../i18n/core.ts';
import type { Messages } from '../../i18n/types.ts';
import type { LinuxDistributionProp, LinuxMethodKind, LinuxProp } from './types.ts';

type Strings = Messages['download']['linux'];

// "Ubuntu 26.04+", from the distribution's oldest version; "any distribution via Flatpak" for the one with no name.
export function distributionFloor(distribution: LinuxDistributionProp, strings: Strings): string {
    if (distribution.name === null) {
        return strings.anyDistribution;
    }

    return interpolate(strings.floor, { name: distribution.name, version: distribution.versions[0] ?? '' });
}

// The tab label of an install method: the distribution it serves, or "Flatpak".
export function methodLabel(kind: LinuxMethodKind, linux: LinuxProp, strings: Strings): string {
    const distribution = linux.distributions.find((each) => each.via === kind && each.name !== null);

    return distribution !== undefined ? distributionFloor(distribution, strings) : strings.flatpak;
}
