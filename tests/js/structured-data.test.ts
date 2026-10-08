import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
    blogPostingNode,
    breadcrumbNode,
    collectionPageNode,
    graph,
    iosAppNode,
    macAppNode,
    offerNode,
    organizationNode,
    organizationProfiles,
    priceString,
    pricingOffers,
    webPageNode,
    websiteNode,
    type PricingFacts,
} from '../../resources/js/lib/structured-data.ts';
import en from '../../resources/js/i18n/messages/en/seo.ts';
import vi from '../../resources/js/i18n/messages/vi/seo.ts';

/*
 * The JSON-LD builders. The ids are a contract with other sites (the docs
 * assert `#organization`), prices are locale-neutral strings, and no node may
 * ever carry a rating, a review, FAQPage or HowTo.
 */
const base = 'https://tablepro.app';
const en_ = { baseUrl: base, inLanguage: 'en' };
const vi_ = { baseUrl: `${base}/`, inLanguage: 'vi' };
const pricing: PricingFacts = JSON.parse(readFileSync(new URL('../../resources/data/pricing.json', import.meta.url), 'utf8'));

const mac = macAppNode(vi_, {
    description: vi.product.long,
    alternateName: vi.macApp.alternateName,
    subCategory: vi.macApp.subCategory,
    operatingSystem: 'macOS',
    requirements: 'macOS 13 Ventura trở lên, Apple silicon hoặc Intel',
    licenseUrl: 'https://example.test/LICENSE',
    offers: pricingOffers(pricing, (tier, cycle) => `${tier} ${cycle ?? ''}`.trim(), (unit) => unit),
});

const ios = iosAppNode(en_, {
    alternateName: en.iosApp.alternateName,
    operatingSystem: 'iOS, iPadOS',
    requirements: 'iOS and iPadOS 18 or later',
    installUrl: 'https://apps.example.test/app/id1',
    licenseUrl: 'https://example.test/LICENSE',
    currency: 'USD',
});

test('ids stay the same in every locale, whatever the base URL looks like', () => {
    assert.equal(organizationNode(base, { description: 'x', sameAs: [] })['@id'], 'https://tablepro.app/#organization');
    assert.equal(organizationNode(`${base}/`, { description: 'x', sameAs: [] })['@id'], 'https://tablepro.app/#organization');
    assert.equal(mac['@id'], 'https://tablepro.app/#app');
    assert.equal(ios['@id'], 'https://tablepro.app/#ios-app');
});

test('the site is one WebSite in both languages, published by the one organization', () => {
    const english = websiteNode(en_, { description: en.product.short, languages: ['en', 'vi'] });
    const vietnamese = websiteNode(vi_, { description: vi.product.short, languages: ['en', 'vi'] });

    // Positioning §6.3: `https://tablepro.app/#website`, kept stable, `inLanguage` ["en", "vi"].
    for (const site of [english, vietnamese]) {
        assert.equal(site['@id'], 'https://tablepro.app/#website');
        assert.equal(site.url, 'https://tablepro.app/');
        assert.deepEqual(site.inLanguage, ['en', 'vi']);
        assert.deepEqual(site.publisher, { '@id': 'https://tablepro.app/#organization' });
    }

    assert.equal(english.description, en.product.short);
    assert.equal(vietnamese.description, vi.product.short);
});

test('every page in either language is part of that one site', () => {
    const english = webPageNode(en_, { url: `${base}/features/querying`, name: 'Querying' });
    const vietnamese = webPageNode(vi_, { url: `${base}/vi/features/querying`, name: 'Query' });
    const hub = collectionPageNode(vi_, { url: `${base}/vi/compare`, name: 'So sánh', items: [] });

    for (const page of [english, vietnamese, hub]) {
        assert.deepEqual(page.isPartOf, { '@id': 'https://tablepro.app/#website' });
    }
});

test('every CreativeWork node carries the page language', () => {
    const page = webPageNode(vi_, { url: `${base}/vi/features/querying`, name: 'Query', about: mac['@id'] });
    const post = blogPostingNode(en_, {
        url: `${base}/blog/tablepro-0-77`,
        headline: 'TablePro 0.77',
        description: 'd',
        datePublished: '2026-10-02',
    });

    for (const node of [mac, ios, page, post]) {
        assert.ok(typeof node.inLanguage === 'string' && node.inLanguage.length > 0, `${node['@type']} has no inLanguage`);
    }

    assert.equal(mac.inLanguage, 'vi');
    assert.deepEqual(page.about, { '@id': 'https://tablepro.app/#app' });
    assert.deepEqual(post.author, { '@id': 'https://tablepro.app/#organization' });
});

test('prices are locale-neutral strings, one offer per price in pricing.json', () => {
    assert.equal(priceString(2.99), '2.99');
    assert.equal(priceString(24), '24');
    assert.equal(priceString(1.25), '1.25');
    assert.equal(priceString(0), '0');

    const paid = Object.values(pricing.tiers).reduce((sum, tier) => sum + Object.keys(tier.prices ?? {}).length, 0);
    const free = Object.values(pricing.tiers).filter((tier) => typeof tier.price === 'number').length;
    const offers = mac.offers as Record<string, unknown>[];

    assert.equal(offers.length, paid + free);

    for (const offer of offers) {
        assert.equal(offer.priceCurrency, pricing.currency);
        assert.match(String(offer.price), /^\d+(\.\d{2})?$/);
    }
});

test('a recurring price names its period, a one-time price does not', () => {
    const monthly = offerNode({ name: 'm', price: 2.99, currency: 'USD', cycle: 'monthly' });
    const lifetime = offerNode({ name: 'l', price: 59, currency: 'USD', cycle: 'lifetime' });
    const seat = offerNode({ name: 's', price: 10, currency: 'USD', cycle: 'yearly', unitText: 'seat' });

    assert.equal((monthly.priceSpecification as Record<string, unknown>).billingDuration, 'P1M');
    assert.equal(lifetime.priceSpecification, undefined);
    assert.deepEqual(seat.priceSpecification, {
        '@type': 'UnitPriceSpecification',
        price: '10',
        priceCurrency: 'USD',
        billingDuration: 'P1Y',
        unitText: 'seat',
    });
});

test('a per-seat price says how many seats one purchase holds, as the page does', () => {
    const offers = mac.offers as Record<string, unknown>[];
    const { min, max } = pricing.tiers.team.seats!;
    const perSeat = offers.filter((offer) => (offer.priceSpecification as Record<string, unknown> | undefined)?.unitText === 'seat');

    assert.equal(perSeat.length, Object.keys(pricing.tiers.team.prices ?? {}).length);

    for (const offer of perSeat) {
        assert.deepEqual(offer.eligibleQuantity, { '@type': 'QuantitativeValue', minValue: min, maxValue: max, unitText: 'seat' });
    }

    for (const offer of offers.filter((offer) => !perSeat.includes(offer))) {
        assert.equal('eligibleQuantity' in offer, false);
    }
});

test('the iPhone app is free, with one zero-price offer and no rating', () => {
    assert.equal(ios['@type'], 'MobileApplication');
    assert.equal(ios.isAccessibleForFree, true);
    assert.deepEqual(ios.offers, [{ '@type': 'Offer', name: en.iosApp.alternateName, price: '0', priceCurrency: 'USD' }]);
});

test('optional facts are left out rather than guessed', () => {
    assert.equal('softwareVersion' in mac, false);
    assert.equal('downloadUrl' in mac, false);
    assert.equal('fileSize' in mac, false);
    assert.equal('isAccessibleForFree' in mac, false);
    assert.equal('sameAs' in organizationNode(base, { description: 'x', sameAs: [] }), false);
});

test('breadcrumbs and hub lists use same-locale absolute URLs', () => {
    const crumbs = breadcrumbNode(vi_, `${base}/vi/features/querying`, [
        { name: vi.breadcrumbs.features, path: '/vi/features' },
        { name: 'Query', path: '/vi/features/querying' },
    ]);
    const hub = collectionPageNode(vi_, {
        url: `${base}/vi/compare`,
        name: 'So sánh',
        items: [{ name: 'TablePlus', path: '/vi/compare/tableplus' }],
    });

    assert.equal(crumbs['@id'], 'https://tablepro.app/vi/features/querying#breadcrumb');
    assert.deepEqual(
        (crumbs.itemListElement as Record<string, unknown>[]).map((item) => item.item),
        ['https://tablepro.app/vi/features', 'https://tablepro.app/vi/features/querying'],
    );
    assert.equal(hub['@type'], 'CollectionPage');
    assert.equal(((hub.mainEntity as Record<string, unknown>).itemListElement as Record<string, unknown>[])[0].url, 'https://tablepro.app/vi/compare/tableplus');
});

test('a graph drops what a page leaves out', () => {
    const document = graph([organizationNode(base, { description: 'x', sameAs: [] }), false, null, undefined, mac]);

    assert.equal(document['@context'], 'https://schema.org');
    assert.deepEqual(document['@graph'].map((node) => node['@type']), ['Organization', 'SoftwareApplication']);
});

test('no builder ever emits a rating, a review, FAQPage or HowTo', () => {
    const everything = JSON.stringify([
        mac,
        ios,
        graph([websiteNode(en_, { description: 'x', languages: ['en', 'vi'] })]),
        graph([organizationNode(base, { description: en.product.short, sameAs: [] })]),
    ]);

    for (const banned of ['aggregateRating', 'AggregateRating', 'ratingValue', '"review"', 'Review', 'FAQPage', 'HowTo']) {
        assert.equal(everything.includes(banned), false, `JSON-LD contains ${banned}`);
    }
});

test('the identity sentence names no platform, version or number in either language', () => {
    for (const short of [en.product.short, vi.product.short]) {
        assert.doesNotMatch(short, /\b(Mac|macOS|iPhone|iPad|iOS|iPadOS|Windows|Linux)\b|\d/);
    }
});

test('the organization lists its own profiles from facts.json, and nothing else', () => {
    const facts = JSON.parse(readFileSync(new URL('../../resources/data/facts.json', import.meta.url), 'utf8'));
    const profiles = organizationProfiles(facts.links);
    const node = organizationNode(base, { description: en.product.short, sameAs: profiles });

    assert.deepEqual(node.sameAs, [facts.links.github, facts.links.x, facts.links.discord, facts.links.telegram]);

    for (const url of profiles) {
        assert.match(url, /^https:\/\//);
    }

    for (const notAProfile of [facts.links.docs, facts.links.appStore, facts.links.sponsorsProgram]) {
        assert.equal(profiles.includes(notAProfile), false);
    }
});
