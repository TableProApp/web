import LegalPage, { type LegalPageProps } from '@/components/legal/legal-page';

/** `/terms` and `/vi/terms` (sitemap §A.6): `resources/data/legal/{locale}/terms.md`. */
export default function Terms(props: LegalPageProps) {
    return <LegalPage {...props} />;
}
