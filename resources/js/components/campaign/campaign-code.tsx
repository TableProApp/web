import CopyButton from '@/components/ui/copy-button';
import { useI18n } from '@/i18n';
import { PRICING } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';

/**
 * The sale's code, to copy for a purchase made elsewhere, with the line that
 * says a purchase from this site gets it without typing it: checkout from the
 * plan cards and the sale's page attaches it (`useCampaign`).
 */
export default function CampaignCode({ className }: { className?: string }) {
    const { m } = useI18n();
    const campaign = PRICING.campaign;

    if (campaign === null) {
        return null;
    }

    return (
        <div className={cn('grid gap-1.5', className)}>
            <p className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground type-small">{m.campaign.code.label}</span>
                <code translate="no" className="rounded-control border border-dashed border-accent bg-surface px-2.5 py-1 font-sans text-sm font-semibold tracking-wider tabular-nums">
                    {campaign.code}
                </code>
                <CopyButton value={campaign.code} label={m.campaign.code.copyLabel} labels={m.controls.copy} />
            </p>
            <p className="text-muted-foreground type-caption">{m.campaign.code.applied}</p>
        </div>
    );
}
