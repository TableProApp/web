import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';

import { renderAssetSlot, type AssetSlotLabels } from '../../resources/js/components/ui/asset-slot-view.ts';
import { fileUrl, slotModel, srcSet, type AssetManifestData, type SlotManifestData } from '../../resources/js/lib/data/asset-model.ts';
import en from '../../resources/js/i18n/messages/en/assets.ts';
import vi from '../../resources/js/i18n/messages/vi/assets.ts';

/*
 * <AssetSlot> rendered through react-dom/server, with no build and no SSR
 * process: against every entry of the real manifest (placeholders and supplied
 * pictures), and against an isolated fixture that takes the supplied path
 * without any image on disk. The PHP side (AssetManifest: file names,
 * validation, the LCP preload) is held to the same fixture in
 * tests/Feature/Assets/AssetManifestTest.php.
 */
const read = (path: string): AssetManifestData =>
    JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as AssetManifestData;

const real = read('../../resources/data/assets.json');
const fixture = read('../Fixtures/assets/manifest.json');
const labels: Record<string, AssetSlotLabels> = { en, vi };

function html(manifest: SlotManifestData, id: string, locale = 'en', extra: { sizes?: string; caption?: boolean; priority?: boolean } = {}): string {
    return renderToStaticMarkup(renderAssetSlot(manifest, id, { locale, labels: labels[locale], ...extra }));
}

test('every real slot renders as a labelled placeholder that requests nothing, or as a picture once supplied', () => {
    let rendered = 0;

    for (const [id, entry] of Object.entries(real.assets)) {
        if (!entry.slot) {
            continue;
        }

        for (const locale of ['en', 'vi']) {
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
            assert.ok(markup.includes(`aria-label="${escapeHtml(`${label}: ${description}`)}"`), `${id} (${locale}) has the wrong accessible name`);
            assert.ok(markup.includes('aria-hidden="true"'), `${id} (${locale}) exposes its visible text twice`);
            assert.ok(!markup.includes('<figcaption'), `${id} (${locale}) shows a caption while a placeholder`);
            rendered++;
        }
    }

    assert.ok(rendered > 100, `expected every slot in both locales, rendered ${rendered}`);
});

test('a window placeholder carries its phone crop as a second box, swapped by CSS', () => {
    const markup = html(fixture, 'fixture-placeholder');

    assert.equal((markup.match(/role="img"/g) ?? []).length, 2);
    assert.match(markup, /data-asset-id="fixture-placeholder"[^>]*data-asset-status="placeholder"[^>]*class="[^"]*max-md:hidden/);
    assert.match(markup, /data-asset-id="fixture-placeholder-mobile"[^>]*data-asset-status="placeholder"[^>]*class="[^"]*md:hidden/);
    // The crop is a 343 pt cut: centred at that width, never stretched across a wider phone or an iPad mini.
    assert.match(markup, /data-asset-id="fixture-placeholder-mobile"[^>]*class="[^"]*mx-auto w-full max-w-\[343px\]/);
    assert.ok(markup.includes('aspect-ratio:16 / 9'));
    assert.ok(markup.includes('aspect-ratio:4 / 5'));
    assert.ok(markup.includes('Screenshot placeholder'));
    assert.ok(markup.includes('Detail crop placeholder'));
});

test('a placeholder shows the type label, the id in mono and the localized brief', () => {
    const markup = html(fixture, 'fixture-placeholder', 'vi');

    assert.ok(markup.includes('Ảnh chụp màn hình (sẽ bổ sung)'));
    assert.ok(markup.includes('<code class="font-mono'));
    assert.ok(markup.includes('>fixture-placeholder</code>'));
    assert.ok(markup.includes('Mô tả cửa sổ giữ chỗ.'));
    assert.ok(markup.includes('aria-label="Ảnh chụp màn hình (sẽ bổ sung): Mô tả cửa sổ giữ chỗ."'));
});

test('an English-only figure falls back to English on a Vietnamese page', () => {
    const markup = html(fixture, 'fixture-figure', 'vi');

    assert.ok(markup.includes('An English-only figure.'));
    assert.ok(markup.includes('aspect-ratio:1990 / 1372'));
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
    const markup = html(fixture, 'fixture-hero');

    assert.match(markup, /^<figure [^>]*data-asset-status="supplied"/);
    assert.equal((markup.match(/<picture\b/g) ?? []).length, 2);
    // Below 768px the picture shows the crop, held at its 343 px design width.
    assert.match(markup, /<picture class="block dark:hidden max-md:mx-auto max-md:max-w-\[343px\]">/);
    assert.match(markup, /<picture class="hidden dark:block max-md:mx-auto max-md:max-w-\[343px\]">/);

    // The window above 768px, in both formats, then the crop.
    assert.ok(markup.includes(
        '<source media="(min-width: 768px)" type="image/avif" srcSet="/images/fixture/fixture-hero-light-32.avif 32w, /images/fixture/fixture-hero-light-64.avif 64w" sizes="(min-width: 1280px) 1216px, 100vw" width="64" height="36"/>',
    ));
    assert.ok(markup.includes('<source media="(min-width: 768px)" type="image/webp" srcSet="/images/fixture/fixture-hero-light-32.webp 32w, /images/fixture/fixture-hero-light-64.webp 64w"'));
    assert.ok(markup.includes(
        '<source type="image/avif" srcSet="/images/fixture/fixture-hero-mobile-light-16.avif 16w, /images/fixture/fixture-hero-mobile-light-32.avif 32w" sizes="calc(100vw - 32px)" width="32" height="40"/>',
    ));
    assert.ok(markup.includes('src="/images/fixture/fixture-hero-mobile-dark-32.webp"'));
    assert.ok(markup.includes('srcSet="/images/fixture/fixture-hero-mobile-dark-16.webp 16w, /images/fixture/fixture-hero-mobile-dark-32.webp 32w"'));

    // A priority pair stays lazy so the hidden theme is never fetched; the head preload fetches the visible one.
    assert.equal((markup.match(/loading="lazy"/g) ?? []).length, 2);
    assert.equal((markup.match(/fetchPriority="high"/gi) ?? []).length, 2);
    assert.ok(markup.includes('alt="A fixture window"'));
    assert.ok(markup.includes('<figcaption class="type-caption mt-3 text-muted-foreground">A fixture caption.</figcaption>'));
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

test('a picture without a crop is not capped', () => {
    assert.ok(!html(fixture, 'fixture-detail').includes('max-w-[343px]'));
});

test('a supplied slot hides the id, the type label and the brief', () => {
    for (const id of ['fixture-hero', 'fixture-detail', 'fixture-phone', 'fixture-diagram']) {
        const entry = fixture.assets[id];

        for (const locale of ['en', 'vi']) {
            const markup = html(fixture, id, locale);
            const visible = markup.replace(/(src|srcSet)="[^"]*"/gi, '');

            assert.ok(!visible.includes(id), `${id} (${locale}) shows its id`);
            assert.ok(!markup.includes('data-asset-id'), `${id} (${locale}) keeps a data-asset-id`);
            assert.ok(!markup.includes(entry.description.en), `${id} (${locale}) shows its brief`);
            assert.ok(!markup.includes('placeholder'), `${id} (${locale}) still says placeholder`);
            assert.ok(!markup.includes('role="img"'), `${id} (${locale}) keeps the placeholder box`);
        }
    }
});

test('a single-theme detail is lazy, async and contained', () => {
    const markup = html(fixture, 'fixture-detail', 'vi', { sizes: '(min-width: 1024px) 488px, 100vw' });

    assert.equal((markup.match(/<picture\b/g) ?? []).length, 1);
    assert.match(markup, /<picture class="block">/);
    assert.ok(markup.includes('<source type="image/avif" srcSet="/images/fixture/fixture-detail-light-24.avif 24w, /images/fixture/fixture-detail-light-48.avif 48w" sizes="(min-width: 1024px) 488px, 100vw" width="48" height="36"/>'));
    assert.ok(markup.includes('loading="lazy"'));
    assert.ok(markup.includes('decoding="async"'));
    assert.ok(markup.includes('object-contain'));
    assert.ok(markup.includes('alt="Một chi tiết mẫu"'));
    assert.ok(!/fetchPriority/i.test(markup));
});

test('a single-theme priority image is eager with high fetch priority', () => {
    const markup = html(fixture, 'fixture-phone');

    assert.ok(!markup.includes('loading='));
    assert.match(markup, /fetchPriority="high"/i);
    assert.ok(markup.includes('w-[240px]'));
    assert.ok(markup.includes('width="18" height="39"'));
});

test('a per-locale vector picks the page locale and needs no srcset widths', () => {
    const markup = html(fixture, 'fixture-diagram', 'vi');

    assert.ok(markup.includes('src="/images/fixture/fixture-diagram-light-vi.svg"'));
    assert.ok(markup.includes('src="/images/fixture/fixture-diagram-dark-vi.svg"'));
    assert.ok(!markup.includes('-en.svg'));
    assert.ok(!/ \d+w/.test(markup));
    assert.ok(markup.includes('alt="Một sơ đồ mẫu"'));
    assert.ok(markup.includes('max-w-[720px]'), 'a diagram stops at 720px so its labels never outsize the headings');
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

test('the catalogs label every type the manifest uses, in both languages', () => {
    const used = new Set(Object.values(real.assets).filter((entry) => entry.slot).map((entry) => entry.type));

    for (const type of used) {
        assert.ok(type in en.types, `no English label for ${type}`);
        assert.ok(type in vi.types, `no Vietnamese label for ${type}`);
    }

    assert.equal(en.accessibleName, '{type}: {description}');
    assert.equal(vi.accessibleName, '{type}: {description}');
});

/*
 * The bundle carries resources/js/lib/data/asset-slots.json, not the whole
 * manifest. It must render every slot exactly as the manifest does, in both
 * states: the committed slice for the real (placeholder) entries, and the
 * same projection rules applied here to the fixture for the supplied path.
 * PHP pins the committed file to `AssetManifest::slotProjection()`.
 */
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

test('the bundled slice renders every real slot exactly as the manifest does', () => {
    const slotIds = Object.keys(real.assets).filter((id) => real.assets[id].slot);

    assert.deepEqual(Object.keys(bundled.assets), slotIds, 'the slice lists other ids than the manifest has slots; run php artisan assets:handoff');

    for (const id of slotIds) {
        for (const locale of ['en', 'vi']) {
            assert.equal(html(bundled, id, locale), html(real, id, locale), `${id} (${locale}) renders differently from the bundled slice`);
        }
    }

    for (const field of ['usedOn', 'handoffPriority', 'legacySource', 'family', 'ownerRepo']) {
        assert.ok(Object.values(bundled.assets).every((entry) => !(field in entry)), `the slice still carries ${field}`);
    }
});

test('the projection keeps what the supplied path needs', () => {
    const projected = project(fixture);

    for (const id of Object.keys(projected.assets)) {
        for (const locale of ['en', 'vi']) {
            assert.equal(html(projected, id, locale), html(fixture, id, locale), `${id} (${locale})`);
        }
    }

    assert.ok(!('description' in projected.assets['fixture-hero']), 'a supplied entry keeps its placeholder brief');
    assert.ok(!('alt' in projected.assets['fixture-placeholder']), 'a placeholder keeps its alt text');
});

function escapeHtml(text: string): string {
    return text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#x27;');
}

test('a placeholder keeps its type icon with its label, so a narrow phone slot never strands the icon on its own line', () => {
    // Rendered as a placeholder whatever its status, so supplying the screenshot does not retire the check.
    const entry = real.assets['ios-connection-list'];
    const asPlaceholder: AssetManifestData = { ...real, assets: { ...real.assets, 'ios-connection-list': { ...entry, status: 'placeholder', src: null } } };
    const markup = html(asPlaceholder, 'ios-connection-list', 'vi');

    // The icon and the label share one wrapper; only the asset id is a separate item in the wrapping row.
    assert.match(markup, /<p class="flex flex-wrap items-center gap-x-2 gap-y-1"><span class="inline-flex min-w-0 items-start gap-2"><svg[^>]*>.*?<\/svg><span class="type-label min-w-0 text-foreground">[^<]+<\/span><\/span><code /);
});
