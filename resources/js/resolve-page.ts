import type { Page, SharedPageProps } from '@inertiajs/core';
import type { ComponentType } from 'react';
import { isLocale } from '@/i18n';
import { loadAssetLocale } from '@/lib/data/assets';

const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx');

/** Complete the active language's asset data before either SSR or hydration renders it. */
export async function resolvePage(name: string, page?: Page<SharedPageProps>): Promise<ComponentType> {
    const locale = page?.props.locale;
    if (!isLocale(locale)) throw new Error(`Unsupported page locale: ${String(locale)}`);
    const load = pages[`./pages/${name}.tsx`];
    if (!load) throw new Error(`Unknown Inertia page: ${name}`);
    const [, component] = await Promise.all([loadAssetLocale(locale), load()]);
    return component.default;
}
