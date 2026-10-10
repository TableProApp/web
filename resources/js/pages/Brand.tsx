import BrandAssets, { BRAND_ASSETS_MARKER } from '@/components/brand/brand-assets';
import LegalPage, { type LegalPageProps } from '@/components/legal/legal-page';

export default function Brand(props: LegalPageProps) {
    return <LegalPage {...props} marker={BRAND_ASSETS_MARKER} control={<BrandAssets />} />;
}
