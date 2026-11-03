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
import { interpolate } from '../../resources/js/i18n/core.ts';

/*
 * The dated sale's banner fits one 40px line in every language, beside its
 * countdown and its close button, and is never truncated (design-system
 * §3.3). Run with `npm run test:js`.
 *
 * Display columns, a CJK character two, as TopBannerTest counts the license
 * banner's. From 1024px the sale's name, its sentence and the link take at
 * most 64, leaving room for the countdown; below it the short form, beside
 * the name, at most 14, so the line fits a 320px screen with the countdown
 * hidden there.
 */

const CATALOGS = { en, vi, es, de, fr, ja, 'pt-BR': pt_BR, 'zh-Hans': zh_Hans, ko, 'zh-Hant': zh_Hant, it, id };

const WIDE = /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꥠ-꥿가-힣豈-﫿︰-﹏＀-｠￠-￦]/u;

function columns(text: string): number {
    return [...text].reduce((sum, char) => sum + (WIDE.test(char) ? 2 : 1), 0);
}

for (const [locale, messages] of Object.entries(CATALOGS)) {
    test(`${locale}: the sale's banner fits one line`, () => {
        const { name, banner } = messages.campaign;
        const message = interpolate(banner.message, { percent: 40 });
        const short = interpolate(banner.short, { percent: 40 });

        assert.ok(columns(name) + columns(message) + columns(banner.cta) <= 64, `${locale}: "${name} ${message} ${banner.cta}" will not fit beside the countdown at 1024px`);
        assert.ok(columns(short) <= 14, `${locale}: "${short}" will not fit a 320px screen`);
        assert.equal(name, 'Black Friday', `${locale}: the sale's name stays English, like a plan's`);
    });
}
