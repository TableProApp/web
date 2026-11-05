import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';

import { renderAssetSlot, type AssetSlotLabels } from '../../resources/js/components/ui/asset-slot-view.ts';
import { fileUrl, slotModel, slotSupplied, srcSet, type AssetManifestData, type SlotManifestData } from '../../resources/js/lib/data/asset-model.ts';
import en from '../../resources/js/i18n/messages/en/assets.ts';
import vi from '../../resources/js/i18n/messages/vi/assets.ts';
import es from '../../resources/js/i18n/messages/es/assets.ts';
import de from '../../resources/js/i18n/messages/de/assets.ts';
import fr from '../../resources/js/i18n/messages/fr/assets.ts';
import ja from '../../resources/js/i18n/messages/ja/assets.ts';
import ptBR from '../../resources/js/i18n/messages/pt-BR/assets.ts';
import zhHans from '../../resources/js/i18n/messages/zh-Hans/assets.ts';
import ko from '../../resources/js/i18n/messages/ko/assets.ts';
import zhHant from '../../resources/js/i18n/messages/zh-Hant/assets.ts';
import it from '../../resources/js/i18n/messages/it/assets.ts';
import id from '../../resources/js/i18n/messages/id/assets.ts';

const read = (path: string): AssetManifestData =>
    JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as AssetManifestData;

const real = read('../../resources/data/assets.json');
const fixture = read('../Fixtures/assets/manifest.json');
const labels: Record<string, AssetSlotLabels> = { en, vi, es, de, fr, ja, 'pt-BR': ptBR, 'zh-Hans': zhHans, ko, 'zh-Hant': zhHant, it, id };
const locales: string[] = Object.keys(JSON.parse(readFileSync(new URL('../../resources/data/locales.json', import.meta.url), 'utf8')).supported);

function html(manifest: SlotManifestData, id: string, locale = 'en', extra: { sizes?: string; caption?: boolean; priority?: boolean; placeholders?: boolean } = {}): string {
    return renderToStaticMarkup(renderAssetSlot(manifest, id, { locale, labels: labels[locale], ...extra }));
}

test('every real slot renders as a labelled placeholder that requests nothing, or as a picture once supplied', () => {
    let rendered = 0;

    for (const [id, entry] of Object.entries(real.assets)) {
        if (!entry.slot) {
            continue;
        }

        for (const locale of locales) {
            const markup = html(real, id, locale);

            if (entry.status !== 'placeholder') {
                assert.match(markup, /^<figure [^>]*data-asset-status="supplied"/, `${id} (${locale}) is not marked as supplied`);
                assert.ok(/<picture\b/.test(markup), `${id} (${locale}) renders no <picture>`);
                assert.ok(!markup.includes('data-asset-id') && !markup.includes('role="img"'), `${id} (${locale}) keeps the placeholder box`);
                rendered++;
                continue;
            }

            const description = entry.description[locale] ?? entry.description.en;
            const label = labels[locale].types[entry.type as keyof AssetSlotLabels['types']];

            assert.match(markup, /^<figure [^>]*data-asset-status="placeholder"/, `${id} (${locale}) is not marked as a placeholder`);
            assert.ok(markup.includes(`data-asset-id="${id}"`), `${id} (${locale}) lost its id`);
            assert.ok(!/<img\b/i.test(markup), `${id} (${locale}) renders an <img>`);
            assert.ok(!/<picture\b|<source\b|background-image|url\(/i.test(markup), `${id} (${locale}) can make a request`);
            assert.ok(markup.includes(`role="img"`), `${id} (${locale}) has no role="img" box`);
            assert.ok(markup.includes(`aria-label="${escapeHtml(labels[locale].accessibleName.replace('{type}', label).replace('{description}', description))}"`), `${id} (${locale}) has the wrong accessible name`);
            assert.ok(markup.includes('aria-hidden="true"'), `${id} (${locale}) exposes its visible text twice`);
            assert.ok(!markup.includes('<figcaption'), `${id} (${locale}) shows a caption while a placeholder`);
            rendered++;
        }
    }

    assert.ok(rendered > 100, `expected every slot in all locales, rendered ${rendered}`);
});

test('a window placeholder carries its phone crop as a second box', () => {
    const markup = html(fixture, 'fixture-placeholder');

    assert.equal((markup.match(/role="img"/g) ?? []).length, 2);
    assert.ok(markup.includes('data-asset-id="fixture-placeholder"'));
    assert.ok(markup.includes('data-asset-id="fixture-placeholder-mobile"'));
});

test('a placeholder shows its id and the brief in the page language', () => {
    const markup = html(fixture, 'fixture-placeholder', 'vi');

    assert.ok(markup.includes('>fixture-placeholder</code>'));
    assert.ok(markup.includes(fixture.assets['fixture-placeholder'].description.vi));
});

test('an English-only figure falls back to English on a Vietnamese page', () => {
    assert.ok(html(fixture, 'fixture-figure', 'vi').includes(fixture.assets['fixture-figure'].description.en));
});

test('names files the way the PHP manifest does', () => {
    const hero = fixture.assets['fixture-hero'];
    const diagram = fixture.assets['fixture-diagram'];
    const og = fixture.assets['fixture-og'];

    assert.equal(fileUrl(hero, 'dark', null, 64, 'avif'), '/images/fixture/fixture-hero-dark-64.avif');
    assert.equal(fileUrl(diagram, 'light', 'vi', null, 'svg'), '/images/fixture/fixture-diagram-light-vi.svg');
    assert.equal(fileUrl(og, 'light', 'vi', 1200, 'png'), '/og/fixture/fixture-og-vi.png');
    assert.equal(
        srcSet(hero, { widths: [64, 32], formats: ['avif'], width: 64, height: 36 }, 'light', null, 'avif'),
        '/images/fixture/fixture-hero-light-32.avif 32w, /images/fixture/fixture-hero-light-64.avif 64w',
    );
});

test('a supplied themed window and its crop render one art-directed picture per theme', () => {
    const hero = fixture.assets['fixture-hero'];
    const markup = html(fixture, 'fixture-hero');

    assert.match(markup, /^<figure [^>]*data-asset-status="supplied"/);
    assert.equal((markup.match(/<picture\b/g) ?? []).length, 2);

    for (const theme of ['light', 'dark'] as const) {
        assert.ok(markup.includes(`<source media="(min-width: 768px)" type="image/avif" srcSet="${srcSet(hero, hero.src![theme]!, theme, null, 'avif')}"`), `${theme} window`);
    }

    // Both themes stay lazy so the hidden one is never fetched; the head preload fetches the visible one.
    assert.equal((markup.match(/loading="lazy"/g) ?? []).length, 2);
    assert.equal((markup.match(/fetchPriority="high"/gi) ?? []).length, 2);
    assert.ok(markup.includes(`alt="${hero.alt.en}"`));
    assert.ok(markup.includes(`${hero.caption.en}</figcaption>`));
});

test('a page can load a placement with priority that the manifest loads lazily', () => {
    const lazy = html(fixture, 'fixture-detail');
    const first = html(fixture, 'fixture-detail', 'en', { priority: true });

    assert.ok(lazy.includes('loading="lazy"'));
    assert.ok(!/fetchPriority=/i.test(lazy));
    // A single-theme image with priority is eager: nothing hidden could be fetched by mistake.
    assert.ok(!first.includes('loading="lazy"'));
    assert.match(first, /fetchPriority="high"/i);
    // A placeholder still requests nothing, priority or not.
    assert.ok(!/<img\b/i.test(html(fixture, 'fixture-placeholder', 'en', { priority: true })));
});

test('a supplied slot hides the id, the type label and the brief', () => {
    for (const id of ['fixture-hero', 'fixture-detail', 'fixture-phone', 'fixture-diagram']) {
        const entry = fixture.assets[id];

        for (const locale of locales) {
            const markup = html(fixture, id, locale);
            const visible = markup.replace(/(src|srcSet|href)="[^"]*"/gi, '');

            assert.ok(!visible.includes(id), `${id} (${locale}) shows its id`);
            assert.ok(!markup.includes('data-asset-id'), `${id} (${locale}) keeps a data-asset-id`);
            assert.ok(!markup.includes(entry.description.en), `${id} (${locale}) shows its brief`);
            assert.ok(!markup.includes('placeholder'), `${id} (${locale}) still says placeholder`);
            assert.ok(!markup.includes('role="img"'), `${id} (${locale}) keeps the placeholder box`);
        }
    }
});

test('a single-theme detail is lazy and async', () => {
    const markup = html(fixture, 'fixture-detail', 'vi');

    assert.equal((markup.match(/<picture\b/g) ?? []).length, 1);
    assert.ok(markup.includes('loading="lazy"'));
    assert.ok(markup.includes('decoding="async"'));
    assert.ok(!/fetchPriority/i.test(markup));
    assert.ok(markup.includes(`alt="${fixture.assets['fixture-detail'].alt.vi}"`));
});

test('a single-theme priority image is eager with high fetch priority', () => {
    const markup = html(fixture, 'fixture-phone');

    assert.ok(!markup.includes('loading='));
    assert.match(markup, /fetchPriority="high"/i);
});

test('a per-locale vector picks the page locale and needs no srcset widths', () => {
    const markup = html(fixture, 'fixture-diagram', 'vi');

    assert.ok(markup.includes('src="/images/fixture/fixture-diagram-light-vi.svg"'));
    assert.ok(markup.includes('src="/images/fixture/fixture-diagram-dark-vi.svg"'));
    assert.ok(!markup.includes('-en.svg'));
    assert.ok(!/ \d+w/.test(markup));
});

test('a detail with no phone crop links its widest file', () => {
    const detail = html(fixture, 'fixture-detail');

    assert.equal((detail.match(/<a\b/g) ?? []).length, 1);
    assert.ok(detail.includes('<a href="/images/fixture/fixture-detail-light-48.webp"'));
});

// A hidden theme variant must not be a stop in the tab order.
test('a themed capture hides the link of the other theme', () => {
    const themed: AssetManifestData = structuredClone(fixture);
    themed.assets['fixture-hero'].kind = 'detail';
    themed.assets['fixture-hero'].mobile = null;

    const markup = html(themed, 'fixture-hero');

    assert.match(markup, /<a href="\/images\/fixture\/fixture-hero-light-64\.webp" class="[^"]*dark:hidden/);
    assert.match(markup, /<a href="\/images\/fixture\/fixture-hero-dark-64\.webp" class="[^"]*hidden dark:block/);
});

test('a window, a phone, a diagram and a placeholder are not links, nor is a detail cut to read on a phone', () => {
    for (const id of ['fixture-hero', 'fixture-phone', 'fixture-diagram', 'fixture-placeholder', 'fixture-figure']) {
        assert.ok(!html(fixture, id).includes('<a'), `${id} is a link`);
    }

    const cropped: AssetManifestData = structuredClone(fixture);
    cropped.assets['fixture-hero'].kind = 'detail';

    assert.ok(!html(cropped, 'fixture-hero').includes('<a'));
});

test('every supplied post figure links a file that exists', () => {
    let figures = 0;

    for (const [id, entry] of Object.entries(real.assets)) {
        if (entry.kind !== 'figure' || entry.status !== 'supplied') {
            continue;
        }

        const link = /<a href="([^"]+)"/.exec(html(real, id))?.[1];

        assert.ok(link, `${id} has no link`);
        assert.ok(readFileSync(new URL(`../../public${link}`, import.meta.url)).length > 0, `${id} links ${link}, which is not in public/`);
        figures++;
    }

    assert.ok(figures > 0);
});

test('caption={false} suppresses the manifest caption', () => {
    assert.ok(!html(fixture, 'fixture-hero', 'en', { caption: false }).includes('<figcaption'));
});

test('an unknown id and a handoff-only entry fail loudly instead of rendering nothing', () => {
    assert.throws(() => html(fixture, 'no-such-asset'), /Unknown asset id "no-such-asset"/);
    assert.throws(() => html(fixture, 'fixture-og'), /handoff-only/);
});

test('the model switches mode on status alone', () => {
    const flipped: AssetManifestData = structuredClone(fixture);
    flipped.assets['fixture-detail'].status = 'placeholder';

    assert.equal(slotModel(flipped, 'fixture-detail', { locale: 'en' }).main.mode, 'placeholder');
    assert.equal(slotModel(fixture, 'fixture-detail', { locale: 'en' }).main.mode, 'supplied');
});

test('with placeholders off, a slot with no image renders nothing and a supplied one is unchanged', () => {
    const off = { placeholders: false };
    let hidden = 0;

    for (const [id, entry] of Object.entries(real.assets)) {
        if (!entry.slot) {
            continue;
        }

        for (const locale of locales) {
            const element = renderAssetSlot(real, id, { locale, labels: labels[locale], ...off });

            if (entry.status === 'supplied') {
                assert.equal(html(real, id, locale, off), html(real, id, locale), `${id} (${locale}) changes with placeholders off`);
            } else {
                assert.equal(element, null, `${id} (${locale}) still renders with no image`);
                hidden++;
            }
        }
    }

    assert.equal(hidden, Object.values(real.assets).filter((entry) => entry.slot && entry.status === 'placeholder').length * locales.length);
    assert.equal(html(fixture, 'fixture-placeholder', 'en', off), '');
    assert.equal(html(fixture, 'fixture-figure', 'vi', off), '');
    assert.equal(html(fixture, 'fixture-hero', 'en', off), html(fixture, 'fixture-hero'));
});

test('a crop without its window does not fill a slot', () => {
    const partial: AssetManifestData = structuredClone(fixture);
    partial.assets['fixture-hero'].status = 'placeholder';
    partial.assets['fixture-hero'].src = null;

    assert.match(html(partial, 'fixture-hero'), /^<figure [^>]*data-asset-status="partial"/);
    assert.equal(html(partial, 'fixture-hero', 'en', { placeholders: false }), '');
    assert.equal(slotSupplied(partial, 'fixture-hero', 'en'), false);
    assert.equal(slotSupplied(fixture, 'fixture-hero', 'en'), true);
    assert.equal(slotSupplied(fixture, 'fixture-diagram', 'ja'), true);
});

test('the catalogs label every type the manifest uses in every language', () => {
    const used = new Set(Object.values(real.assets).filter((entry) => entry.slot).map((entry) => entry.type));

    assert.deepEqual(Object.keys(labels).sort(), [...locales].sort());
    for (const locale of locales) {
        for (const type of used) assert.ok(type in labels[locale].types, `no ${locale} label for ${type}`);
        assert.ok(labels[locale].accessibleName.includes('{type}'));
        assert.ok(labels[locale].accessibleName.includes('{description}'));
    }
});

const bundled = read('../../resources/js/lib/data/asset-slots.json') as unknown as SlotManifestData;

function project(manifest: AssetManifestData): SlotManifestData {
    const kinds = Object.fromEntries(
        Object.entries(manifest.kinds).map(([name, kind]) => [name, { type: kind.type, aspect: kind.aspect, sizes: kind.sizes }]),
    ) as SlotManifestData['kinds'];
    const assets: SlotManifestData['assets'] = {};

    for (const [id, entry] of Object.entries(manifest.assets)) {
        if (!entry.slot) {
            continue;
        }

        const { kind, type, aspect, priority, theme, locale, mobile, status, src, replacement } = entry;
        const text = status === 'supplied' ? { alt: entry.alt, caption: entry.caption } : { description: entry.description };

        assets[id] = { kind, type, slot: true, aspect, priority, theme, locale, mobile, status, src, replacement, ...text };
    }

    return { kinds, assets };
}

test('the metadata and selected language render every real slot exactly as the manifest does', () => {
    const slotIds = Object.keys(real.assets).filter((id) => real.assets[id].slot);

    assert.deepEqual(Object.keys(bundled.assets), slotIds, 'the slice lists other ids than the manifest has slots; run php artisan assets:generate');

    for (const locale of locales) {
        const copy = JSON.parse(readFileSync(new URL(`../../resources/js/lib/data/asset-locales/${locale}.json`, import.meta.url), 'utf8'));
        const localized = { kinds: bundled.kinds, assets: Object.fromEntries(Object.entries(bundled.assets).map(([id, entry]) => [id, { ...entry, ...copy[id] }])) };
        for (const id of slotIds) assert.equal(html(localized, id, locale), html(real, id, locale), `${id} (${locale}) renders differently from the selected language`);
    }
});

test('the projection keeps what the supplied path needs', () => {
    const projected = project(fixture);

    for (const id of Object.keys(projected.assets)) {
        for (const locale of locales) {
            assert.equal(html(projected, id, locale), html(fixture, id, locale), `${id} (${locale})`);
        }
    }

    assert.ok(!('description' in projected.assets['fixture-hero']), 'a supplied entry keeps its placeholder brief');
    assert.ok(!('alt' in projected.assets['fixture-placeholder']), 'a placeholder keeps its alt text');
});

function escapeHtml(text: string): string {
    return text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#x27;');
}

