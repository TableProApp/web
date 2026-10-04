import type { ReactNode } from 'react';
import AssetSlot from '@/components/ui/asset-slot';
import Section from '@/components/ui/section';
import { assetEntry, isAssetId } from '@/lib/data/assets';
import type { Values } from '@/i18n';
import RichText from './rich-text';

interface EngineSectionProps {
    /** The section's anchor, locale-neutral: `connect`, `operate`, `mariadb`. */
    id: string;
    title: ReactNode;
    paragraphs: string[];
    points?: string[];
    /** At most one slot, from the content file. An id the manifest does not know renders nothing. */
    asset?: string;
    /** `{token}` values for this section only. */
    values?: Values;
    /** Data-driven lines before the copy: a facts line, a status sentence. */
    before?: ReactNode;
    /** Anything after the copy: a limits list, a link. */
    after?: ReactNode;
}

/**
 * One body section of an engine page (sitemap §E.1 blocks 3-8 and 10).
 *
 * The text keeps the reading width. A section with a detail slot puts the
 * text in columns 1-5 and the image in columns 6-12 from 1024px, which is
 * the width the detail kind's `sizes` assume; a window slot runs full width
 * under the text. Placeholders and supplied images take the same box, so the
 * layout never shifts when the owner's image arrives.
 */
export default function EngineSection({ id, title, paragraphs, points, asset, values, before, after }: EngineSectionProps) {
    const slot = asset !== undefined && isAssetId(asset) ? asset : null;
    const wide = slot !== null && assetEntry(slot).kind === 'window';

    const body = (
        <div className="type-body max-w-[44rem] space-y-4 text-foreground">
            {before}
            {paragraphs.map((paragraph, index) => (
                <p key={index}>
                    <RichText text={paragraph} values={values} />
                </p>
            ))}
            {points !== undefined && points.length > 0 && (
                <ul className="list-disc space-y-2 pl-6 marker:text-muted-foreground">
                    {points.map((point, index) => (
                        <li key={index} className="pl-1">
                            <RichText text={point} values={values} />
                        </li>
                    ))}
                </ul>
            )}
            {after}
        </div>
    );

    return (
        <Section id={id} title={title}>
            {slot === null && body}
            {slot !== null && wide && (
                <div className="space-y-8 md:space-y-10">
                    {body}
                    <AssetSlot id={slot} />
                </div>
            )}
            {slot !== null && !wide && (
                <div className="grid items-start gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-5">{body}</div>
                    <AssetSlot id={slot} className="lg:col-span-7" />
                </div>
            )}
        </Section>
    );
}
