import LegalPage, { type LegalPageProps } from '@/components/legal/legal-page';

/** `/refund-policy` and `/vi/refund-policy` (sitemap §A.6): `resources/data/legal/{locale}/refund-policy.md`. */
export default function RefundPolicy(props: LegalPageProps) {
    return <LegalPage {...props} />;
}
