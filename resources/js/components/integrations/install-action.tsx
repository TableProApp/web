import Button from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code';
import { useI18n } from '@/i18n';
import { relFor } from './model';
import type { IntegrationDetail, IntegrationPageLabels } from './types';

interface InstallActionProps {
    integration: IntegrationDetail;
    labels: IntegrationPageLabels;
}

export default function InstallAction({ integration, labels }: InstallActionProps) {
    const { m, fmt } = useI18n();
    const { install } = integration;
    const label = fmt(labels.install[install.type], { name: integration.name, host: integration.host?.name ?? integration.name });

    if (install.command !== null) {
        return <CodeBlock label={label} code={install.command} command copyLabels={m.controls.copy} className="w-full max-w-[32rem]" />;
    }

    if (install.url === null) {
        return null;
    }

    return (
        <Button href={install.url} rel={relFor(integration.tier)}>
            {label}
            <span aria-hidden="true">↗</span>
        </Button>
    );
}
