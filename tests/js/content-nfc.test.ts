import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * Every Vietnamese source is stored in Unicode NFC.
 *
 * A decomposed "ệ" (e + combining circumflex + combining dot below) looks the
 * same in an editor and renders as one glyph in most browsers, but it breaks
 * search, string comparison, the glossary checks and, with some fonts, the
 * stacking of the marks. Copy pasted from a design tool or a PDF often arrives
 * decomposed. Nothing should; this fails the file instead of the reader.
 */
const root = fileURLToPath(new URL('../../', import.meta.url));

const SOURCES = [
    'resources/data/content/vi',
    'resources/data/legal/vi',
    'resources/blog/vi',
    'resources/js/i18n/messages/vi',
    'lang/vi',
];

function filesUnder(dir: string): string[] {
    if (!existsSync(dir)) {
        return [];
    }

    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);

        return statSync(path).isDirectory() ? filesUnder(path) : [path];
    });
}

function vietnameseValues(value: unknown): string[] {
    if (typeof value === 'string') {
        return [value];
    }

    if (Array.isArray(value)) {
        return value.flatMap(vietnameseValues);
    }

    if (value && typeof value === 'object') {
        return Object.entries(value).flatMap(([key, inner]) =>
            key === 'vi' ? vietnameseValues(inner) : typeof inner === 'object' ? vietnameseValues(inner) : [],
        );
    }

    return [];
}

test('every Vietnamese source file is NFC', () => {
    const files = SOURCES.flatMap((dir) => filesUnder(join(root, dir)));

    assert.ok(files.length > 0, 'expected at least the Vietnamese UI catalogs');

    for (const file of files) {
        const text = readFileSync(file, 'utf8');

        assert.equal(text, text.normalize('NFC'), `${relative(root, file)} is not NFC`);
    }
});

test('the Vietnamese values in the asset manifest are NFC', () => {
    const manifest = join(root, 'resources/data/assets.json');

    if (!existsSync(manifest)) {
        return;
    }

    const assets = JSON.parse(readFileSync(manifest, 'utf8')).assets ?? {};

    for (const [id, asset] of Object.entries(assets)) {
        for (const text of vietnameseValues(asset)) {
            assert.equal(text, text.normalize('NFC'), `assets.json ${id} has a Vietnamese value that is not NFC`);
        }
    }
});

test('the check itself tells NFC from NFD', () => {
    const composed = 'Tiếng Việt';
    const decomposed = composed.normalize('NFD');

    assert.notEqual(decomposed, composed);
    assert.equal(decomposed.normalize('NFC'), composed);
});
