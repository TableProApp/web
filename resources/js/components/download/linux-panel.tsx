import TextLink from '@/components/ui/text-link';
import { Trans, useI18n } from '@/i18n';
import { keepTogether } from '@/i18n/format';
import LinuxInstall from './linux-install';
import type { LinuxProp } from './types';

interface LinuxPanelProps {
    linux: LinuxProp;
    issues: string | null;
}

// Installing takes a choice of method, so the panel leads with the methods instead of one file.
export default function LinuxPanel({ linux, issues }: LinuxPanelProps) {
    const { m, fmt } = useI18n();
    const { release } = linux;
    const version =
        release !== null
            ? release.publishedOn !== null
                ? fmt(m.download.release.dated, { version: release.version, date: keepTogether(release.publishedOn) })
                : fmt(m.download.release.undated, { version: release.version })
            : null;

    return (
        <div className="grid gap-8">
            <div className="type-small grid justify-items-center gap-1 text-center">
                {version !== null && <p className="text-muted-foreground">{version}</p>}
                {linux.channel === 'beta' && (
                    <p className="max-w-[34rem] text-foreground">
                        <Trans text={m.download.linux.beta} tags={{ link: (text) => (issues !== null ? <TextLink href={issues}>{text}</TextLink> : text) }} />
                    </p>
                )}
            </div>
            <LinuxInstall linux={linux} />
        </div>
    );
}
