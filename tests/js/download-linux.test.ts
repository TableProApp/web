import { test } from 'node:test';
import assert from 'node:assert/strict';

import en from '../../resources/js/i18n/messages/en/index.ts';
import { distributionFloor, methodLabel } from '../../resources/js/components/download/linux-text.ts';
import type { LinuxProp } from '../../resources/js/components/download/types.ts';
import platforms from '../../resources/data/platforms.json' with { type: 'json' };

const record = platforms.platforms.find((platform) => platform.id === 'linux') as unknown as LinuxProp & { destinations: { kind: string }[] };
const linux = { ...record, methods: [], packages: [], checksums: null, verify: null, release: null } as LinuxProp;
const strings = en.download.linux;

test('a distribution reads as its oldest version and up, and the unnamed one as Flatpak', () => {
    const [ubuntu, fedora, other] = linux.distributions;

    assert.equal(distributionFloor(ubuntu, strings), `Ubuntu ${ubuntu.versions[0]}+`);
    assert.equal(distributionFloor(fedora, strings), `Fedora ${fedora.versions[0]}+`);
    assert.equal(distributionFloor(other, strings), strings.anyDistribution);
});

test('each install method is labelled by the distribution it serves', () => {
    assert.equal(methodLabel('ppa', linux, strings), `Ubuntu ${linux.distributions[0].versions[0]}+`);
    assert.equal(methodLabel('copr', linux, strings), `Fedora ${linux.distributions[1].versions[0]}+`);
    assert.equal(methodLabel('flatpak', linux, strings), strings.flatpak);
});
