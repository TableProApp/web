// The feature pages' rules as pure functions. Relative imports only, so `node --test` loads it directly
// (tests/js/feature-model.test.ts).
import { interpolate } from '../../i18n/core.ts';
import { formatNumber, joinList, type ListStyle, type NumberStyle } from '../../i18n/format.ts';
import type { EngineItem, FactValue, Facts, FeaturePageContent, FeaturePart, Where } from './types.ts';

// Numbers with the locale's separators, names and engines joined with its list style ("A, B and C").
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

export function factValues(facts: Facts, number: NumberStyle, list: ListStyle): Record<string, string> {
    const values: Record<string, string> = {};

    for (const [name, fact] of Object.entries(facts)) {
        values[name] = factText(fact, number, list);
    }

    return values;
}

export function fillFacts(template: string, values: Record<string, string>): string {
    return interpolate(template, values);
}

export function engineItems(facts: Facts, name: string): EngineItem[] {
    const fact = facts[name];

    return fact !== undefined && fact.kind === 'engines' ? fact.items : [];
}

// In `order`, the display order of paid-features.json.
export function pagePaidIds(content: Pick<FeaturePageContent, 'bands' | 'more'>, order: readonly string[]): string[] {
    const named = new Set([...content.bands, ...content.more].flatMap((part) => part.paid ?? []));

    return order.filter((id) => named.has(id));
}

export function partIds(part: Pick<FeaturePart, 'id' | 'also'>): string[] {
    return [part.id, ...(part.also ?? [])];
}

// The Mac has every feature on these pages; a partial platform counts as present.
export function wherePlatforms<T>(where: Where, names: { mac: T; linux: T; ios: T }): T[] {
    return [names.mac, ...(where.linux !== 'no' ? [names.linux] : []), ...(where.ios !== 'no' ? [names.ios] : [])];
}

// For the closing sentence: "Pro adds A and B. Team adds C."
export function paidByTier<T extends { id: string; tier: string }>(ids: readonly string[], features: readonly T[]): { tier: string; features: T[] }[] {
    const groups: { tier: string; features: T[] }[] = [];

    for (const id of ids) {
        const feature = features.find((candidate) => candidate.id === id);

        if (feature === undefined) {
            continue;
        }

        const group = groups.find((candidate) => candidate.tier === feature.tier);

        if (group !== undefined) {
            group.features.push(feature);
        } else {
            groups.push({ tier: feature.tier, features: [feature] });
        }
    }

    return groups;
}

export function docsHref(base: string, path: string): string {
    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
