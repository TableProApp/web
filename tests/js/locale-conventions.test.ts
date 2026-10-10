import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { formatUsd } from '../../resources/js/i18n/format.ts';

import en from '../../resources/js/i18n/messages/en/index.ts';
import vi from '../../resources/js/i18n/messages/vi/index.ts';
import es from '../../resources/js/i18n/messages/es/index.ts';
import de from '../../resources/js/i18n/messages/de/index.ts';
import fr from '../../resources/js/i18n/messages/fr/index.ts';
import ja from '../../resources/js/i18n/messages/ja/index.ts';
import pt_BR from '../../resources/js/i18n/messages/pt-BR/index.ts';
import zh_Hans from '../../resources/js/i18n/messages/zh-Hans/index.ts';
import ko from '../../resources/js/i18n/messages/ko/index.ts';
import zh_Hant from '../../resources/js/i18n/messages/zh-Hant/index.ts';
import it from '../../resources/js/i18n/messages/it/index.ts';
import id from '../../resources/js/i18n/messages/id/index.ts';

const catalogs = { en, vi, es, de, fr, ja, 'pt-BR': pt_BR, 'zh-Hans': zh_Hans, ko, 'zh-Hant': zh_Hant, it, id };
const translated = Object.entries(catalogs).filter(([locale]) => locale !== 'en');
const content = (locale: string, file: string) => JSON.parse(readFileSync(new URL(`../../resources/data/content/${locale}/${file}`, import.meta.url), 'utf8'));

test('links to English-only pages say so in every other language', () => {
    for (const [locale, m] of translated) {
        const marker = m.common.englishOnly;
        const download = content(locale, 'download.json');
        const labels = {
            'footer.groups.resources.docs': m.footer.groups.resources.docs,
            'footer.groups.resources.changelog': m.footer.groups.resources.changelog,
            'footer.groups.resources.brand': m.footer.groups.resources.brand,
            'nav.docsLabel': m.nav.docsLabel,
            'download.release.notes': m.download.release.notes,
            'download.json install.guide.label': download.install.guide.label,
            'download.json olderVersions.changelog': download.olderVersions.changelog,
        };

        for (const [key, label] of Object.entries(labels)) {
            assert.ok(label.endsWith(marker), `${locale}: ${key} "${label}" does not end with ${marker}`);
        }

        for (const text of [m.blog.post.archive, content(locale, 'blog.json').header.lead]) {
            assert.match(text.replaceAll(' ', ''), new RegExp(`</changelog>${marker.replaceAll(' ', '').replace(/[()]/g, '\\$&')}`), `${locale}: the changelog link is not marked ${marker}`);
        }
    }
});

test('the newsletter says its emails are in English', () => {
    for (const [locale, m] of translated) {
        const english = m.common.englishOnly.replace(/[()（）]/g, '').toLowerCase();

        const body = m.footer.newsletter.body;

        assert.ok(body.toLowerCase().includes(english), `${locale}: "${body}" does not say ${english}`);
    }
});

test('Japanese and Chinese joiners keep a space on each side', () => {
    for (const locale of ['ja', 'zh-Hans', 'zh-Hant'] as const) {
        const m = catalogs[locale];
        const joiners = {
            'common.list.last': m.common.list.last,
            'platforms.systemsJoiner': m.platforms.systemsJoiner,
            'platforms.architectures.joiner': m.platforms.architectures.joiner,
            'download.otherPlatforms.joiner.last': m.download.otherPlatforms.joiner.last,
        };

        for (const [key, joiner] of Object.entries(joiners)) {
            assert.match(joiner, /^ \S+ $/, `${locale}: ${key} is "${joiner}"`);
        }

        assert.match(m.common.shortList.last, /^( \S+ |・)$/, `${locale}: common.shortList.last is "${m.common.shortList.last}"`);
    }
});

test('comparison pages write prices the way the pricing page does', () => {
    for (const [locale, m] of Object.entries(catalogs)) {
        assert.deepEqual(content(locale, 'compare/index.json').labels.currency, m.pricing.currency, `${locale}: compare/index.json labels.currency`);
    }
});

test('Traditional Chinese writes US$, since a bare $ reads as the Taiwan or Hong Kong dollar', () => {
    assert.equal(formatUsd(2.99, zh_Hant.pricing.currency), 'US$2.99');
    assert.equal(formatUsd(1499, zh_Hant.pricing.currency), 'US$1,499');
});

test('the email placeholder is not left in English', () => {
    for (const [locale, m] of translated) {
        assert.doesNotMatch(m.forms.email.placeholder, /^you@/, `${locale}: forms.email.placeholder`);
    }
});

test('UI catalogs keep the names of paid features, Safe Mode and the merchant of record', () => {
    const paid: { name: string }[] = JSON.parse(readFileSync(new URL('../../resources/data/paid-features.json', import.meta.url), 'utf8'));
    const names = [...paid.map((feature) => feature.name), 'Safe Mode'];
    const leaves = (node: unknown, path = ''): [string, string][] =>
        typeof node === 'string' ? [[path, node]] : Object.entries(node as Record<string, unknown>).flatMap(([key, child]) => leaves(child, path ? `${path}.${key}` : key));
    const english = leaves(en);

    for (const [locale, m] of translated) {
        const strings = new Map(leaves(m));

        for (const [path, source] of english) {
            const target = strings.get(path) ?? '';

            for (const name of names) {
                assert.ok(!source.includes(name) || target.replaceAll('-', ' ').includes(name), `${locale}: ${path} does not say ${name}`);
            }

            assert.ok(!source.includes('merchant of record') || target.toLowerCase().includes('merchant of record'), `${locale}: ${path} does not say merchant of record`);
        }
    }
});
