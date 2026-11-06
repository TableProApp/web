import CopyButton from '@/components/ui/copy-button';
import { useI18n } from '@/i18n';
import { PRICING } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';

// For a purchase made elsewhere: checkout from this site attaches the code by itself (`useCampaign`).
export default function CampaignCode({ className }: { className?: string }) {
    const { m } = useI18n();
    const campaign = PRICING.campaign;

    if (campaign === null) {
        return null;
    }

    return (
        <p className={cn('type-small flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground', className)}>
            <span>{m.campaign.code.label}</span>
            <code translate="no" className="rounded-control border border-rule bg-surface px-2 py-0.5 font-mono text-[0.8125rem] font-medium tracking-wide text-foreground">
                {campaign.code}
            </code>
            <CopyButton value={campaign.code} label={m.campaign.code.copyLabel} labels={m.controls.copy} />
            <span>{m.campaign.code.applied}</span>
        </p>
    );
}
