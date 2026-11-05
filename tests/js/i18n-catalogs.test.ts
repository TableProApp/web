import { test } from 'node:test';
import assert from 'node:assert/strict';

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
import { placeholders, splitTags } from '../../resources/js/i18n/core.ts';

type Node = string | { [key: string]: Node };

const PLURAL_CATEGORIES = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

function isPluralNode(node: Node): node is Record<string, string> {
    return (
        typeof node === 'object' &&
        'other' in node &&
        Object.keys(node).every((key) => PLURAL_CATEGORIES.has(key)) &&
        Object.values(node).every((value) => typeof value === 'string')
    );
}

function leaves(node: Node, path = ''): Map<string, Node> {
    const out = new Map<string, Node>();

    if (typeof node === 'string' || isPluralNode(node)) {
        out.set(path, node);

        return out;
    }

    for (const [key, child] of Object.entries(node)) {
        for (const [childPath, value] of leaves(child, path ? `${path}.${key}` : key)) {
            out.set(childPath, value);
        }
    }

    return out;
}

function tagNames(text: string): string[] {
    return splitTags(text)
        .filter((token) => token.type === 'tag')
        .map((token) => (token.type === 'tag' ? token.name : ''))
        .sort();
}

const english = leaves(en as unknown as Node);

const catalogs = new Map<string, Map<string, Node>>([
    ['vi', leaves(vi as unknown as Node)],
    ['es', leaves(es as unknown as Node)],
    ['de', leaves(de as unknown as Node)],
    ['fr', leaves(fr as unknown as Node)],
    ['ja', leaves(ja as unknown as Node)],
    ['pt-BR', leaves(pt_BR as unknown as Node)],
    ['zh-Hans', leaves(zh_Hans as unknown as Node)],
    ['ko', leaves(ko as unknown as Node)],
    ['zh-Hant', leaves(zh_Hant as unknown as Node)],
    ['it', leaves(it as unknown as Node)],
    ['id', leaves(id as unknown as Node)]
]);

for (const [locale, catalog] of catalogs) {
    test(`${locale}: keeps the English slots, markup and plural forms`, () => {
        for (const [path, source] of english) {
            const target = catalog.get(path);
            assert.ok(target !== undefined, `${locale}: ${path} is missing`);
            assert.equal(isPluralNode(target), isPluralNode(source), `${locale}: ${path} changed node type`);
            for (const [category, value] of typeof target === 'string' ? [['text', target]] : Object.entries(target as Record<string, string>)) {
                const original = typeof source === 'string' ? source : (source as Record<string, string>)[category] ?? (source as Record<string, string>).other;
                const expected = [...new Set(placeholders(original))].sort();
                assert.ok(['pricing.currency.group', 'download.file.number.group'].includes(path) ? value.length > 0 : value.trim(), `${locale}: ${path} is empty`);
                assert.deepEqual([...new Set(placeholders(value))].sort(), expected, `${locale}: ${path} changed placeholders`);
            }
            if (typeof source === 'string' && typeof target === 'string') {
                assert.deepEqual(tagNames(target), tagNames(source), `${locale}: ${path} changed inline tags`);
            }
            if (isPluralNode(target)) assert.ok('other' in target, `${locale}: ${path} needs other`);
        }
    });
}
