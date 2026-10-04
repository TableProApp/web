/**
 * The string machinery behind `useI18n()`: interpolation, plurals and inline
 * markup. Pure and dependency-free, so `node --test` loads it directly.
 *
 * Sentences are whole catalog entries with named slots, never fragments glued
 * together: word order differs between English and Vietnamese, and a sentence
 * assembled from pieces cannot follow it.
 */
import type { PluralCategory, PluralNode } from './types.ts';

export type Values = Record<string, string | number>;

const PLACEHOLDER = /\{([A-Za-z][A-Za-z0-9_.]*)\}/g;

/**
 * Fills `{name}` slots. A slot with no value is left as written, so a missing
 * value shows up on the page and in tests instead of vanishing silently.
 */
export function interpolate(template: string, values: Values = {}): string {
    return template.replace(PLACEHOLDER, (match: string, name: string) =>
        Object.hasOwn(values, name) ? String(values[name]) : match,
    );
}

/** The `{name}` slots a template declares, sorted and unique. */
export function placeholders(template: string): string[] {
    return [...new Set([...template.matchAll(PLACEHOLDER)].map((match) => match[1]))].sort();
}

const pluralRules = new Map<string, Intl.PluralRules>();

/**
 * Picks the plural form for `count` under the language's CLDR rules and fills
 * it, with `{count}` available to the template.
 *
 * `locale` is a BCP 47 tag (`en-US`, `vi-VN`). A form the catalog does not
 * define falls back to `other`, which every plural node has.
 */
export function plural(node: PluralNode, count: number, locale: string, values: Values = {}): string {
    let rules = pluralRules.get(locale);

    if (!rules) {
        rules = new Intl.PluralRules(locale);
        pluralRules.set(locale, rules);
    }

    const category = rules.select(count) as PluralCategory;
    const template = node[category] ?? node.other;

    return interpolate(template, { count, ...values });
}

export type TagToken = { type: 'text'; text: string } | { type: 'tag'; name: string; text: string };

const TAG = /<([a-z][A-Za-z0-9]*)>([\s\S]*?)<\/\1>/g;

/**
 * Splits `Read the <link>refund policy</link> first.` into text and tag
 * tokens, so a translation can move the link anywhere in its sentence.
 *
 * Tags do not nest, and an unmatched tag stays literal text.
 */
export function splitTags(input: string): TagToken[] {
    const tokens: TagToken[] = [];
    let last = 0;

    for (const match of input.matchAll(TAG)) {
        const index = match.index ?? 0;

        if (index > last) {
            tokens.push({ type: 'text', text: input.slice(last, index) });
        }

        tokens.push({ type: 'tag', name: match[1], text: match[2] });
        last = index + match[0].length;
    }

    if (last < input.length) {
        tokens.push({ type: 'text', text: input.slice(last) });
    }

    return tokens;
}
