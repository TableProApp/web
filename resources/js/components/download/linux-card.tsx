import { ArrowDown } from 'lucide-react';
import Badge from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import DotList from '@/components/ui/dot-list';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList, keepTogether } from '@/i18n/format';
import { distributionFloor } from './linux-text';
import PlatformCard from './platform-card';
import type { LinuxProp } from './types';

interface LinuxCardProps {
    linux: LinuxProp;
    marked: boolean;
    primary: boolean;
    className?: string;
}

// Installing takes a choice of method, so the card leads to the section that offers them instead of to a file.
export default function LinuxCard({ linux, marked, primary, className }: LinuxCardProps) {
    const { m, fmt } = useI18n();
    const { release } = linux;
    const version =
        release !== null
            ? release.publishedOn !== null
                ? fmt(m.download.release.dated, { version: release.version, date: keepTogether(release.publishedOn) })
                : fmt(m.download.release.undated, { version: release.version })
            : null;

    return (
        <PlatformCard
            name={linux.deviceNames[0] ?? 'Linux'}
            badge={linux.channel === 'beta' ? <Badge>{m.download.card.beta}</Badge> : undefined}
            marked={marked}
            version={version}
            className={className}
            action={
                <a href="#linux" className={buttonClasses(primary ? 'primary' : 'secondary', 'lg')}>
                    {m.download.card.linux}
                    <ArrowDown aria-hidden="true" />
                </a>
            }
            details={
                <>
                    <DotList items={linux.distributions.map((distribution) => distributionFloor(distribution, m.download.linux))} />
                    <span className="block">{joinList(linux.architectures, m.download.orList)}</span>
                </>
            }
            updates={m.download.card.updates.linux}
        >
            <p>
                <a href="#platforms" className={textLinkClasses('standalone')}>
                    {m.download.platforms.title}
                    <span aria-hidden="true">↓</span>
                </a>
            </p>
        </PlatformCard>
    );
}
