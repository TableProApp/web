/**
 * The feature pages' rules, as pure functions: how a fact becomes text, which
 * paid features a page or block describes, where a docs link goes and how a
 * slot sits beside its text.
 *
 * Relative imports only, so `node --test` loads it directly
 * (tests/js/feature-model.test.ts).
 */
import { interpolate } from '../../i18n/core.ts';
import { formatNumber, joinList, type ListStyle, type NumberStyle } from '../../i18n/format.ts';
import type { EngineItem, FactValue, Facts, FeatureBlock, FeaturePageContent } from './types.ts';

/**
 * A fact as plain text: numbers with the locale's separators, names and
 * engines joined with its list style ("A, B and C"), a single name as is.
 */
export function factText(fact: FactValue, number: NumberStyle, list: ListStyle): string {
    switch (fact.kind) {
        case 'number':
            return formatNumber(fact.value, number);
        case 'text':
            return fact.value;
        case 'names':
            return joinList(fact.items, list);
        case 'engines':
            return joinList(
                fact.items.map((item) => item.name),
                list,
            );
    }
}

/** Every fact as text, for `{token}` slots. */
export function factValues(facts: Facts, number: NumberStyle, list: ListStyle): Record<string, string> {
    const values: Record<string, string> = {};

    for (const [name, fact] of Object.entries(facts)) {
        values[name] = factText(fact, number, list);
    }

    return values;
}

/** A string with its `{token}` slots filled from the facts. */
export function fillFacts(template: string, values: Record<string, string>): string {
    return interpolate(template, values);
}

/** The engines of an `engines` fact, or none when the name is not one. */
export function engineItems(facts: Facts, name: string): EngineItem[] {
    const fact = facts[name];

    return fact !== undefined && fact.kind === 'engines' ? fact.items : [];
}

/** The paid features a block describes, its own and its sub-blocks', without repeats. */
export function blockPaidIds(block: FeatureBlock & { blocks?: FeatureBlock[] }): string[] {
    const ids = [...(block.paid ?? []), ...(block.blocks ?? []).flatMap((child) => child.paid ?? [])];

    return [...new Set(ids)];
}

/**
 * Every paid feature a page describes, anywhere on it, in `order` (the
 * display order of `paid-features.json`).
 */
export function pagePaidIds(content: FeaturePageContent, order: readonly string[]): string[] {
    const named = new Set<string>([
        ...content.sections.flatMap((section) => blockPaidIds(section)),
        ...content.availability.flatMap((row) => (row.paid ? [row.paid] : [])),
    ]);

    return order.filter((id) => named.has(id));
}

/** True when anything on the page exists in the iPhone and iPad app. */
export function pageOnIos(content: FeaturePageContent): boolean {
    return content.availability.some((row) => row.ios !== 'no');
}

/** True when anything on the page exists in the Mac app. */
export function pageOnMac(content: FeaturePageContent): boolean {
    return content.availability.some((row) => row.mac !== 'no');
}

/** `docsHref('https://docs.tablepro.app/', '/features/mcp')` → `https://docs.tablepro.app/features/mcp`. */
export function docsHref(base: string, path: string): string {
    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * How a slot sits beside its text (design-system §8.2): a detail crop or a
 * phone capture beside the text from 1024px, anything 16:9 full width below
 * it.
 */
export function slotLayout(kind: string): 'beside' | 'below' {
    return kind === 'detail' || kind === 'phone' || kind === 'mobile-crop' ? 'beside' : 'below';
}
