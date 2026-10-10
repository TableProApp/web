import CopyButton from '@/components/ui/copy-button';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { BRAND, type BrandFile, type BrandGround } from '@/lib/data/brand';
import { cn } from '@/lib/utils';

export const BRAND_ASSETS_MARKER = '<brand-assets></brand-assets>';

// Fixed grounds, not theme tokens: each file is shown on the background it is made for.
const GROUND: Record<BrandGround, string> = {
    light: 'bg-[#ffffff]',
    dark: 'bg-[#121212]',
};

function fileLabel(file: BrandFile): string {
    const format = file.src.split('.').pop()?.toUpperCase() ?? '';

    return format === 'SVG' ? format : `${format}, ${file.width} × ${file.height}`;
}

export default function BrandAssets() {
    const { m } = useI18n();

    return (
        <div className="max-w-[44rem] space-y-10">
            {BRAND.assets.map((asset) => (
                <section key={asset.id} aria-labelledby={`brand-${asset.id}`}>
                    <h3 id={`brand-${asset.id}`} className="type-h3 text-foreground">
                        {asset.name}
                    </h3>
                    <p className="type-small mt-1 text-muted-foreground">{asset.description}</p>
                    <div className={cn('mt-4 grid gap-6', asset.variants.length > 1 && 'sm:grid-cols-2')}>
                        {asset.variants.map((variant) => {
                            const preview = variant.files.find((file) => file.src === variant.preview) ?? variant.files[0];

                            return (
                                <div key={variant.ground}>
                                    <div className={cn('flex h-32 items-center justify-center rounded-panel border border-rule p-6', GROUND[variant.ground])}>
                                        <img
                                            src={preview.src}
                                            width={preview.width}
                                            height={preview.height}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                            className="h-auto max-h-16 w-auto max-w-full"
                                        />
                                    </div>
                                    {asset.variants.length > 1 && <p className="type-small mt-3 text-muted-foreground">{BRAND.labels[variant.ground]}</p>}
                                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                        {variant.files.map((file) => (
                                            <li key={file.src}>
                                                <a href={file.src} download className={textLinkClasses('standalone')}>
                                                    {fileLabel(file)}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            <section aria-labelledby="brand-colors">
                <h3 id="brand-colors" className="type-h3 text-foreground">
                    {BRAND.labels.colors}
                </h3>
                <DescriptionList className="mt-4">
                    {BRAND.colors.map((color) => (
                        <DescriptionItem key={color.id} term={color.name}>
                            <span className="flex items-center gap-3">
                                <span aria-hidden="true" className="size-5 shrink-0 rounded-chip border border-rule" style={{ backgroundColor: color.hex }} />
                                <code className="type-mono">{color.hex}</code>
                                <CopyButton value={color.hex} label={color.name} labels={m.controls.copy} />
                            </span>
                        </DescriptionItem>
                    ))}
                </DescriptionList>
            </section>
        </div>
    );
}
