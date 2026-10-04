import LegalPage, { type LegalPageProps } from '@/components/legal/legal-page';
import Button from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { openConsentSettings } from '@/lib/consent';

/**
 * `/privacy` and `/vi/privacy` (sitemap §A.6).
 *
 * The policy is `resources/data/legal/{locale}/privacy.md`. Its cookies
 * section (`#cookies`, linked from the consent bar and the account app) holds
 * the "Cookie settings" button, which reopens the same consent bar the footer
 * control opens, so the reader can change their answer where the policy
 * explains it.
 */
export default function Privacy(props: LegalPageProps) {
    const { m } = useI18n();

    return (
        <LegalPage
            {...props}
            control={
                <Button variant="secondary" onClick={openConsentSettings}>
                    {m.footer.groups.legal.cookies}
                </Button>
            }
        />
    );
}
