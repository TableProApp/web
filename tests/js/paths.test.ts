import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PLATFORM_PATHS as PROXY_PLATFORM_PATHS, upstreamFor } from '../../scripts/dev-proxy.mjs';
import { absoluteUrl, isPlatformPath, localePath, PLATFORM_PATHS, resolveLink, splitLocale } from '../../resources/js/i18n/paths.ts';
import type { LocaleTable } from '../../resources/js/i18n/types.ts';

/*
 * Locale-aware paths, against the real resources/data/locales.json. The PHP
 * side (LocalizedUrl) is held to the same cases in
 * tests/Feature/Localization/LocalizedUrlTest.php.
 */
const table: LocaleTable = JSON.parse(readFileSync(new URL('../../resources/data/locales.json', import.meta.url), 'utf8'));

test('the default locale has no prefix', () => {
    assert.equal(localePath('/', 'en', table), '/');
    assert.equal(localePath('/download', 'en', table), '/download');
});

test('another locale prefixes the path, and the root has no trailing slash', () => {
    assert.equal(localePath('/', 'vi', table), '/vi');
    assert.equal(localePath('/download', 'vi', table), '/vi/download');
    assert.equal(localePath('/compare/tableplus', 'vi', table), '/vi/compare/tableplus');
});

test('queries and fragments survive', () => {
    assert.equal(localePath('/?ref=app-about#pricing', 'vi', table), '/vi?ref=app-about#pricing');
    assert.equal(localePath('/download#mac', 'vi', table), '/vi/download#mac');
    assert.equal(localePath('/#pricing', 'en', table), '/#pricing');
    assert.equal(localePath('/blog?page=2', 'vi', table), '/vi/blog?page=2');
});

test('a path that already has a locale is moved, never double-prefixed', () => {
    assert.equal(localePath('/vi/blog', 'en', table), '/blog');
    assert.equal(localePath('/vi', 'en', table), '/');
    assert.equal(localePath('/vi/blog', 'vi', table), '/vi/blog');
    assert.equal(localePath('/vi#x', 'en', table), '/#x');
});

test('anything that is not a root-relative path is left alone', () => {
    assert.equal(localePath('https://docs.tablepro.app', 'vi', table), 'https://docs.tablepro.app');
    assert.equal(localePath('//cdn.example.com/x', 'vi', table), '//cdn.example.com/x');
    assert.equal(localePath('#pricing', 'vi', table), '#pricing');
    assert.equal(localePath('mailto:hello@tablepro.app', 'vi', table), 'mailto:hello@tablepro.app');
    assert.equal(localePath('relative/path', 'vi', table), 'relative/path');
});

/*
 * nginx routes the platform's paths by their root path alone, so /vi/account
 * reaches this app and answers 404 (docs/deployment.md). A link to one must
 * stay unprefixed in every locale.
 */
const platformHrefs = [
    '/account',
    '/account?locale=vi',
    '/account/login?locale=en#form',
    '/account#billing',
    '/checkout',
    '/discount/preview',
    '/newsletter/subscribe',
    '/newsletter/confirmed',
    '/thank-you?order=signed',
    '/api/newsletter/stats',
    '/platform-build/assets/app.js',
    '/webhooks/polar',
    '/beta',
];

const publicLookalikes = ['/accounting', '/accounts', '/checkouts', '/newsletters', '/betamax', '/api/other', '/blog/checkout-notes', '/compare/account'];

test('a platform path is never prefixed, in any locale', () => {
    for (const href of platformHrefs) {
        assert.equal(isPlatformPath(href), true, href);
        assert.equal(localePath(href, 'vi', table), href, href);
        assert.equal(localePath(href, 'en', table), href, href);
    }

    assert.equal(localePath('/account?locale=vi', 'vi', table), '/account?locale=vi');
});

test('a stray locale prefix on a platform path is removed, not kept', () => {
    assert.equal(localePath('/vi/account', 'vi', table), '/account');
    assert.equal(localePath('/vi/checkout?x=1', 'en', table), '/checkout?x=1');
});

test('a public path that only starts like a platform one is still prefixed', () => {
    for (const href of publicLookalikes) {
        assert.equal(isPlatformPath(href), false, href);
        assert.equal(localePath(href, 'vi', table), `/vi${href}`, href);
    }
});

test('the platform pattern is the dev proxy\'s, so a link and a request agree on which app answers', () => {
    assert.equal(PLATFORM_PATHS.source, PROXY_PLATFORM_PATHS.source);
    assert.equal(PLATFORM_PATHS.flags, PROXY_PLATFORM_PATHS.flags);

    const upstreams = { publicApp: 'public', platformApp: 'platform' };

    for (const href of [...platformHrefs, ...publicLookalikes, '/', '/vi', '/vi/account', '/download']) {
        assert.equal(upstreamFor(href, upstreams) === 'platform', isPlatformPath(href), href);
    }
});

test('LocaleLink visits pages of this app and leaves everything else as a plain link', () => {
    assert.deepEqual(resolveLink('/download', 'vi', 'vi', table), { href: '/vi/download', kind: 'visit' });
    assert.deepEqual(resolveLink('/download', 'en', 'en', table), { href: '/download', kind: 'visit' });
    assert.deepEqual(resolveLink('/', 'vi', 'vi', table), { href: '/vi', kind: 'visit' });
    assert.deepEqual(resolveLink('/blog', 'vi', 'en', table), { href: '/vi/blog', kind: 'switch' });
    assert.deepEqual(resolveLink('/vi/blog', 'en', 'vi', table), { href: '/blog', kind: 'switch' });

    for (const href of platformHrefs) {
        assert.deepEqual(resolveLink(href, 'vi', 'vi', table), { href, kind: 'plain' }, href);
        assert.deepEqual(resolveLink(href, 'en', 'en', table), { href, kind: 'plain' }, href);
        assert.deepEqual(resolveLink(href, 'vi', 'en', table), { href, kind: 'plain' }, href);
    }

    assert.deepEqual(resolveLink('/vi/account', 'vi', 'vi', table), { href: '/account', kind: 'plain' });

    for (const href of ['https://docs.tablepro.app', '//cdn.example.com/x', '#pricing', 'mailto:hello@tablepro.app']) {
        assert.deepEqual(resolveLink(href, 'vi', 'vi', table), { href, kind: 'plain' }, href);
    }
});

test('splitLocale reads the locale from the first segment only', () => {
    assert.deepEqual(splitLocale('/vi/blog', table), { locale: 'vi', path: '/blog' });
    assert.deepEqual(splitLocale('/vi', table), { locale: 'vi', path: '/' });
    assert.deepEqual(splitLocale('/vi/', table), { locale: 'vi', path: '/' });
    assert.deepEqual(splitLocale('/vi?x=1', table), { locale: 'vi', path: '/?x=1' });
    assert.deepEqual(splitLocale('/video', table), { locale: 'en', path: '/video' });
    assert.deepEqual(splitLocale('/blog/vi', table), { locale: 'en', path: '/blog/vi' });
    assert.deepEqual(splitLocale('/', table), { locale: 'en', path: '/' });
    assert.deepEqual(splitLocale('/VI/blog', table), { locale: 'en', path: '/VI/blog' });
});

test('absoluteUrl joins a path to the canonical origin once', () => {
    assert.equal(absoluteUrl('/vi/blog', 'https://tablepro.app'), 'https://tablepro.app/vi/blog');
    assert.equal(absoluteUrl('/', 'https://tablepro.app/'), 'https://tablepro.app/');
    assert.equal(absoluteUrl('blog', 'https://tablepro.app'), 'https://tablepro.app/blog');
    assert.equal(absoluteUrl('https://docs.tablepro.app/x', 'https://tablepro.app'), 'https://docs.tablepro.app/x');
});
