import { useMemo } from 'react';
import { qrMatrix, qrPath } from '@/lib/qr';
import { cn } from '@/lib/utils';

const QUIET_ZONE = 4;

// Black on white in both themes: a phone camera reads dark modules on a light ground, and the quiet zone is part of it.
export default function QrCode({ value, className }: { value: string; className?: string }) {
    const { path, size } = useMemo(() => {
        const matrix = qrMatrix(value);

        return { path: qrPath(matrix, QUIET_ZONE), size: matrix.length + QUIET_ZONE * 2 };
    }, [value]);

    return (
        <svg viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" aria-hidden="true" focusable="false" className={cn('block rounded-chip', className)}>
            <rect width={size} height={size} fill="#fff" />
            <path d={path} fill="#000" />
        </svg>
    );
}
