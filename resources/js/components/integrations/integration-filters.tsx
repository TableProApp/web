import type { FormEvent } from 'react';
import Button from '@/components/ui/button';
import Field, { Input } from '@/components/ui/field';
import Select from '@/components/ui/select';
import { useI18n } from '@/i18n';
import type { FacetOptions } from './model';
import type { AppPlatform, Category, IntegrationFilters as Filters, IntegrationsHubContent, Tier } from './types';

interface IntegrationFiltersProps {
    content: IntegrationsHubContent;
    filters: Filters;
    options: FacetOptions;
    appName: (platform: AppPlatform) => string;
    onChange: (filters: Filters, urlDelay: number) => void;
}

// A plain GET form, so the filters work before hydration and without JavaScript.
export default function IntegrationFilters({ content, filters, options, appName, onChange }: IntegrationFiltersProps) {
    const { path } = useI18n();
    const copy = content.filters;
    const labels = content.labels;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onChange(filters, 0);
    };

    return (
        <form
            role="search"
            method="get"
            action={path('/integrations')}
            aria-label={copy.label}
            onSubmit={submit}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end"
        >
            <Field id="integrations-q" label={copy.search} className="sm:col-span-2 lg:col-span-1">
                <Input
                    id="integrations-q"
                    type="search"
                    name="q"
                    value={filters.q ?? ''}
                    maxLength={100}
                    autoComplete="off"
                    onChange={(event) => onChange({ ...filters, q: event.target.value === '' ? null : event.target.value }, 300)}
                />
            </Field>
            <Field id="integrations-category" label={copy.category.label}>
                <Select
                    id="integrations-category"
                    name="category"
                    value={filters.category ?? ''}
                    onChange={(value) => onChange({ ...filters, category: value === '' ? null : (value as Category) }, 0)}
                    options={[{ value: '', label: copy.category.all }, ...options.categories.map((category) => ({ value: category, label: labels.categories[category] }))]}
                />
            </Field>
            <Field id="integrations-platform" label={copy.platform.label}>
                <Select
                    id="integrations-platform"
                    name="platform"
                    value={filters.platform ?? ''}
                    onChange={(value) => onChange({ ...filters, platform: value === '' ? null : (value as AppPlatform) }, 0)}
                    options={[{ value: '', label: copy.platform.all }, ...options.platforms.map((platform) => ({ value: platform, label: appName(platform) }))]}
                />
            </Field>
            <Field id="integrations-tier" label={copy.tier.label}>
                <Select
                    id="integrations-tier"
                    name="tier"
                    value={filters.tier ?? ''}
                    onChange={(value) => onChange({ ...filters, tier: value === '' ? null : (value as Tier) }, 0)}
                    options={[{ value: '', label: copy.tier.all }, ...options.tiers.map((tier) => ({ value: tier, label: labels.tiers[tier] }))]}
                />
            </Field>
            <div>
                <Button type="submit" variant="secondary">
                    {copy.submit}
                </Button>
            </div>
        </form>
    );
}
