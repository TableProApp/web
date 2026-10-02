import type { ReactNode } from 'react';
import AssetSlot from '@/components/ui/asset-slot';
import Section from '@/components/ui/section';
import { assetEntry, isAssetId } from '@/lib/data/assets';
import { needsReleaseLabel } from '@/lib/data/platforms';
import { cn } from '@/lib/utils';
import EngineLists from './engine-lists';
import FeatureLinkList from './feature-links';
import Markers from './markers';
import { slotLayout } from './model';
import RichText from './rich-text';
import type { Facts, FeatureBlock, FeatureLabels, FeatureSection as FeatureSectionContent } from './types';

interface BlockBodyProps {
    block: FeatureBlock;
    facts: Facts;
    values: Record<string, string>;
}

/** The words of a block: paragraphs, points, engine lists and links, at reading width. */
function BlockText({ block, facts, values }: BlockBodyProps) {
    return (
        <div className="space-y-4">
            {block.paragraphs.map((paragraph, index) => (
                <p key={index} className="type-body text-foreground">
                    <RichText text={paragraph} values={values} />
                </p>
            ))}
            {block.points !== undefined && block.points.length > 0 && (
                <ul className="type-body list-disc space-y-2 pl-6 text-foreground marker:text-muted-foreground">
                    {block.points.map((point, index) => (
                        <li key={index} className="pl-1">
                            <RichText text={point} values={values} />
                        </li>
                    ))}
                </ul>
            )}
            {block.engines !== undefined && block.engines.length > 0 && <EngineLists lists={block.engines} facts={facts} />}
            {block.links !== undefined && <FeatureLinkList links={block.links} className="pt-2" />}
        </div>
    );
}

/**
 * The text and the block's one slot (design-system §8.2): a detail crop sits
 * beside the text from 1024px, in columns 6–12; a 16:9 window or diagram runs
 * full width below it. Without a slot the text keeps the reading width.
 */
function BlockBody({ block, facts, values }: BlockBodyProps) {
    const text = <BlockText block={block} facts={facts} values={values} />;
    const asset = block.asset !== undefined && isAssetId(block.asset) ? block.asset : null;

    if (asset === null) {
        return <div className="max-w-[44rem]">{text}</div>;
    }

    if (slotLayout(assetEntry(asset).kind) === 'beside') {
        return (
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                <div className="max-w-[44rem] lg:col-span-5">{text}</div>
                <AssetSlot id={asset} className="lg:col-span-7" />
            </div>
        );
    }

    return (
        <>
            <div className="max-w-[44rem]">{text}</div>
            <AssetSlot id={asset} className="mt-8 md:mt-10" />
        </>
    );
}

interface FeatureSectionProps {
    section: FeatureSectionContent;
    facts: Facts;
    values: Record<string, string>;
    labels: FeatureLabels;
}

/**
 * One sub-workflow of a feature page (sitemap §E.4): its H2, the plan and
 * release markers of what it describes, its text and at most one slot. A
 * section with `blocks` puts each under an H3 with its own markers and slot,
 * for a section that holds two things worth a picture each (EXPLAIN Compare
 * and Query Insights under `#performance`).
 */
export default function FeatureSection({ section, facts, values, labels }: FeatureSectionProps) {
    const markers = <Markers paid={section.paid} since={section.since} labels={labels} />;
    const hasOwnText = section.paragraphs.length > 0 || (section.points?.length ?? 0) > 0;

    return (
        <Section id={section.id} title={section.title} lead={hasMarkers(section) ? markers : undefined}>
            {hasOwnText && <BlockBody block={section} facts={facts} values={values} />}
            {section.blocks?.map((block, index) => (
                <SubBlock key={block.id ?? index} block={block} facts={facts} values={values} labels={labels} first={!hasOwnText && index === 0} />
            ))}
        </Section>
    );
}

function hasMarkers(block: FeatureBlock): boolean {
    return (block.paid?.length ?? 0) > 0 || (block.since !== null && block.since !== undefined && needsReleaseLabel(block.since));
}

interface SubBlockProps extends BlockBodyProps {
    labels: FeatureLabels;
    first: boolean;
}

function SubBlock({ block, facts, values, labels, first }: SubBlockProps): ReactNode {
    const headingId = block.id !== undefined ? `${block.id}-title` : undefined;

    return (
        <div id={block.id} aria-labelledby={headingId} role={block.id !== undefined ? 'group' : undefined} className={cn(!first && 'mt-12 md:mt-16')}>
            <h3 id={headingId} className="type-h3 text-foreground">
                {block.title}
            </h3>
            <Markers paid={block.paid} since={block.since} labels={labels} className="mt-3" />
            <div className="mt-4">
                <BlockBody block={block} facts={facts} values={values} />
            </div>
        </div>
    );
}
