import { test } from 'node:test';
import assert from 'node:assert/strict';

import en from '../../resources/js/i18n/messages/en/index.ts';
import vi from '../../resources/js/i18n/messages/vi/index.ts';
import { placeholders, splitTags } from '../../resources/js/i18n/core.ts';

/*
 * The UI catalogs agree with each other. Run with `npm run test:js`.
 *
 * `npm run typecheck` already fails on a key that one locale has and the other
 * lacks. What the type system cannot see is inside the strings: a `{name}` slot
 * the translation dropped or renamed renders as a literal `{name}` on the page,
 * a `<link>` marker the translation lost takes its link with it, and an empty
 * string renders as nothing at all. Those are checked here, across every
 * namespace in both languages.
 */

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

/** Every leaf string, keyed by its dotted path. Plural nodes stay whole. */
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

function strings(node: Node): string[] {
    return typeof node === 'string' ? [node] : Object.values(node as Record<string, string>);
}

function tagNames(text: string): string[] {
    return splitTags(text)
        .filter((token) => token.type === 'tag')
        .map((token) => (token.type === 'tag' ? token.name : ''))
        .sort();
}

const english = leaves(en as unknown as Node);
const vietnamese = leaves(vi as unknown as Node);

test('both catalogs have the same keys', () => {
    assert.deepEqual([...vietnamese.keys()].sort(), [...english.keys()].sort());
});

test('no string is empty or only whitespace', () => {
    for (const [locale, catalog] of [['en', english], ['vi', vietnamese]] as const) {
        for (const [path, node] of catalog) {
            for (const value of strings(node)) {
                assert.ok(value.trim().length > 0, `${locale}: ${path} is empty`);
            }
        }
    }
});

test('a translation keeps every {placeholder} of the English string', () => {
    for (const [path, node] of english) {
        const target = vietnamese.get(path);

        if (target === undefined) {
            continue;
        }

        const expected = [...new Set(strings(node).flatMap(placeholders))].sort();
        const actual = [...new Set(strings(target).flatMap(placeholders))].sort();

        assert.deepEqual(actual, expected, `vi: ${path} has slots ${actual.join(', ')}; English has ${expected.join(', ')}`);
    }
});

test('a translation keeps every <tag> marker of the English string', () => {
    for (const [path, node] of english) {
        const target = vietnamese.get(path);

        if (typeof node !== 'string' || typeof target !== 'string') {
            continue;
        }

        assert.deepEqual(tagNames(target), tagNames(node), `vi: ${path} lost or renamed an inline tag`);
    }
});

test('plural nodes stay plural nodes, and Vietnamese needs only other', () => {
    for (const [path, node] of english) {
        if (!isPluralNode(node)) {
            continue;
        }

        const target = vietnamese.get(path);

        assert.ok(target !== undefined && isPluralNode(target), `vi: ${path} must be a plural node`);
        assert.ok('other' in node, `en: ${path} needs an other form`);
    }
});

/*
 * Identity keys name no platform, version or number, so they stay true when a
 * platform ships (positioning §13). The navigation's "iPhone & iPad" link and
 * the mobile menu's "Download for Mac" render from data and from the
 * availability keys instead. This guards the two namespaces the chrome owns;
 * the content guards check the rest.
 */
test('navigation and footer group labels name no platform and no number', () => {
    const identity = /\b(Mac|macOS|iPhone|iPad|iOS|iPadOS|Windows|Linux)\b|\d/;

    for (const [locale, catalog] of [['en', english], ['vi', vietnamese]] as const) {
        for (const [path, node] of catalog) {
            if (!path.startsWith('nav.') && !path.startsWith('footer.groups.')) {
                continue;
            }

            for (const value of strings(node)) {
                assert.doesNotMatch(value, identity, `${locale}: ${path} is an identity key: "${value}"`);
            }
        }
    }
});

/*
 * Word-for-word renderings a Vietnamese review found in these catalogs. Each
 * reads wrong to a Vietnamese developer: "chỗ dẫn" is not how anyone says
 * "where this is cited", "Không có sẵn" is a calque of "Not available", a
 * bare "Hiện có" is half of "Hiện có trên …", "dòng Chip" reads as a product
 * line called Chip, and "Bạn dùng TablePro miễn phí" states what the reader
 * does instead of what they may do.
 */
test('the Vietnamese catalogs keep clear of calques found in review', () => {
    const calques: [RegExp, string][] = [
        [/chỗ dẫn/u, 'footnote back link'],
        [/Không có sẵn/u, '"Not available"'],
        [/^Hiện có$/u, 'a status badge'],
        [/dòng Chip|dòng Bộ xử lý/u, 'About This Mac'],
        [/^Bạn dùng TablePro miễn phí/u, 'free to use'],
        [/được phục vụ/u, '"served"'],
    ];

    for (const [path, node] of leaves(vi as unknown as Node)) {
        for (const text of strings(node)) {
            for (const [pattern, what] of calques) {
                assert.equal(pattern.test(text), false, `vi.${path} (${what}): ${text}`);
            }
        }
    }
});
