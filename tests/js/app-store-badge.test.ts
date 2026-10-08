import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import metadata from '../../resources/data/app-store-badges.json' with { type: 'json' };
import localeTable from '../../resources/data/locales.json' with { type: 'json' };
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';

import { APP_STORE_BADGE_ARTWORK, renderAppStoreBadge } from '../../resources/js/components/download/app-store-badge-view.ts';
import en from '../../resources/js/i18n/messages/en/download.ts';
import vi from '../../resources/js/i18n/messages/vi/download.ts';

/*
 * <AppStoreBadge> rendered through react-dom/server in each locale, with no
 * build and no SSR process, and the artwork it names read from public/images.
 *
 * Apple's badge is artwork with its words drawn in, so the page's language
 * decides which file is shown, and the accessible name has to be that file's
 * visible text in that same language. An English badge on a Vietnamese page
 * needed `lang="en"` on the link; the Vietnamese badge needs none.
 */

const HREF = 'https://apps.apple.com/app/tablepro/id6761621829';

const cases = {
    en: { label: en.ios.badge, visible: 'Download on the App Store', title: 'Download_on_the_App_Store_Badge_US-UK_RGB_' },
    vi: { label: vi.ios.badge, visible: 'Tải về trên App Store', title: 'Download_on_the_App_Store_Badge_VN_RGB_' },
} as const;

const svg = (url: string): string => readFileSync(new URL(`../../public${url}`, import.meta.url), 'utf8');

test('every locale names a badge pair', () => {
    assert.deepEqual(Object.keys(APP_STORE_BADGE_ARTWORK).sort(), Object.keys(localeTable.supported).sort());
});

for (const [locale, expected] of Object.entries(cases) as [keyof typeof cases, (typeof cases)[keyof typeof cases]][]) {
    test(`${locale}: the label is the artwork's visible text, in the page's language`, () => {
        assert.equal(expected.label, expected.visible);
    });

    test(`${locale}: renders that locale's two files, labelled, with no lang of its own`, () => {
        const html = renderToStaticMarkup(renderAppStoreBadge({ href: HREF, locale, label: expected.label }));
        const artwork = APP_STORE_BADGE_ARTWORK[locale];

        assert.match(html, new RegExp(`^<a href="${HREF}" class="inline-block rounded-chip">`));
        assert.doesNotMatch(html, /\slang=/, 'the badge link sets its own lang');

        const images = [...html.matchAll(/<img ([^>]*)\/?>/g)].map((match) => match[1]);
        assert.equal(images.length, 2);

        assert.match(images[0], new RegExp(`src="${artwork.light}"`));
        assert.match(images[0], /class="block h-10 w-auto dark:hidden"/);
        assert.match(images[1], new RegExp(`src="${artwork.dark}"`));
        assert.match(images[1], /class="hidden h-10 w-auto dark:block"/);

        for (const image of images) {
            assert.match(image, new RegExp(`alt="${expected.visible}"`));
            assert.match(image, /width="120" height="40" loading="lazy" decoding="async"/);
        }
    });

    test(`${locale}: the files are Apple's own badge in that language, black for light and white for dark`, () => {
        const artwork = APP_STORE_BADGE_ARTWORK[locale];

        for (const [theme, colour] of [['light', 'blk'], ['dark', 'wht']] as const) {
            const file = svg(artwork[theme]);

            // Apple's export names the language and colour; a changed viewBox means the badge was redrawn or cropped.
            assert.match(file, new RegExp(`<title>${expected.title}${colour}_[^<]*</title>`), `${artwork[theme]} is not Apple's ${colour} badge for ${locale}`);
            assert.match(file, /viewBox="0 0 119.66407 40"/);
            assert.doesNotMatch(file, /<text\b|<script\b/);
        }
    });
}

for (const locale of Object.keys(APP_STORE_BADGE_ARTWORK) as (keyof typeof APP_STORE_BADGE_ARTWORK)[]) {
    test(`${locale}: the image widths are whole numbers, as HTML requires`, () => {
        const html = renderToStaticMarkup(renderAppStoreBadge({ href: HREF, locale, label: 'x' }));
        const widths = [...html.matchAll(/ width="([^"]+)"/g)].map((match) => match[1]);

        assert.equal(widths.length, 2);

        for (const [index, theme] of (['light', 'dark'] as const).entries()) {
            assert.equal(widths[index], String(Math.round(APP_STORE_BADGE_ARTWORK[locale].width[theme])));
        }
    });
}

test('the Vietnamese files are not the English ones', () => {
    assert.notEqual(svg(APP_STORE_BADGE_ARTWORK.vi.light), svg(APP_STORE_BADGE_ARTWORK.en.light));
    assert.notEqual(svg(APP_STORE_BADGE_ARTWORK.vi.dark), svg(APP_STORE_BADGE_ARTWORK.en.dark));
});

for (const [locale, pair] of Object.entries(metadata)) {
    test(`${locale}: official artwork retains its geometry and upstream checksum`, () => {
        for (const [theme, art] of Object.entries(pair)) {
            const contents = svg(art.path);
            assert.equal(createHash('sha256').update(contents).digest('hex'), art.sha256, `${locale} ${theme}: artwork changed`);
            assert.ok(contents.includes(`<title>${art.title}</title>`));
            assert.ok(contents.includes(`viewBox="0 0 ${art.width} 40"`));
            assert.doesNotMatch(contents, /<script\b|<text\b/);
        }
    });
}
