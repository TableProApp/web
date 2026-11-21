import type { ReactNode } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';

interface WindowsDownloadProps {
    href: string;
    variant: 'primary' | 'secondary';
    location: string;
    caption?: ReactNode;
}

// The App Installer file, not a package: opening it installs the newest release, and Windows keeps that install updated.
export default function WindowsDownload({ href, variant, location, caption }: WindowsDownloadProps) {
    const { m } = useI18n();

    return (
        <div className="grid justify-items-start gap-3">
            <Button href={href} variant={variant} size="lg" icon={<Download aria-hidden="true" />} onClick={() => trackDownload(location, 'windows')}>
                {m.download.windowsCta}
            </Button>
            {caption !== undefined && <p className="type-small text-muted-foreground">{caption}</p>}
        </div>
    );
}
