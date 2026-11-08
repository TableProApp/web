import { test } from 'node:test';
import assert from 'node:assert/strict';

import en from '../../resources/js/i18n/messages/en/index.ts';
import vi from '../../resources/js/i18n/messages/vi/index.ts';
import { distributionFloor, distributionsText, linuxRequirement } from '../../resources/js/components/download/linux-text.ts';
import type { LinuxProp } from '../../resources/js/components/download/types.ts';
import platforms from '../../resources/data/platforms.json' with { type: 'json' };

const record = platforms.platforms.find((platform) => platform.id === 'linux') as unknown as LinuxProp & { destinations: { kind: string }[] };
const linux = { ...record, methods: [], release: null } as LinuxProp;
const strings = en.download.linux;

test('a distribution reads as its oldest version and up, and the unnamed one as Flatpak', () => {
    const [ubuntu, fedora, other] = linux.distributions;

    assert.equal(distributionFloor(ubuntu, strings), `Ubuntu ${ubuntu.versions[0]}+`);
    assert.equal(distributionFloor(fedora, strings), `Fedora ${fedora.versions[0]}+`);
    assert.equal(distributionFloor(other, strings), strings.anyDistribution);
});

test('the requirement names every distribution in data order, and says beta while the channel is', () => {
    const floors = linux.distributions.map((distribution) => distributionFloor(distribution, strings));

    assert.equal(distributionsText(linux, en.download), `${floors.slice(0, -1).join(', ')} or ${floors[floors.length - 1]}`);
    assert.equal(linuxRequirement({ ...linux, channel: 'beta' }, en), `Linux beta: ${distributionsText(linux, en.download)}`);
    assert.equal(linuxRequirement({ ...linux, channel: 'stable' }, en), `Linux: ${distributionsText(linux, en.download)}`);
    assert.ok(linuxRequirement({ ...linux, channel: 'beta' }, vi).includes(vi.download.linux.anyDistribution));
});
