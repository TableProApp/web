// Relative imports only, so `node --test` loads it directly (tests/js/download-linux.test.ts).
import { interpolate } from '../../i18n/core.ts';
import { joinList } from '../../i18n/format.ts';
import type { Messages } from '../../i18n/types.ts';
import type { LinuxDistributionProp, LinuxSummary } from './types.ts';

type Strings = Messages['download']['linux'];

// "Ubuntu 26.04+", from the distribution's oldest version; "any distribution via Flatpak" for the one with no name.
export function distributionFloor(distribution: LinuxDistributionProp, strings: Strings): string {
    if (distribution.name === null) {
        return strings.anyDistribution;
    }

    return interpolate(strings.floor, { name: distribution.name, version: distribution.versions[0] ?? '' });
}

// "Ubuntu 26.04+, Fedora 44+ or any distribution via Flatpak", in data order.
export function distributionsText(linux: Pick<LinuxSummary, 'distributions'>, strings: Messages['download']): string {
    return joinList(
        linux.distributions.map((distribution) => distributionFloor(distribution, strings.linux)),
        strings.orList,
    );
}

// "Linux beta: Ubuntu 26.04+, …" while the channel is beta, for a list of every platform's requirement.
export function linuxRequirement(linux: LinuxSummary, m: Pick<Messages, 'download' | 'platforms' | 'common'>): string {
    return interpolate(m.platforms.linux.requirement[linux.channel], {
        name: joinList(linux.deviceNames, m.common.list),
        distributions: distributionsText(linux, m.download),
    });
}
