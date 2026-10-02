import SharedConsentBar from '@/components/shared/consent-bar';
import { useI18n } from '@/i18n';

/**
 * The shared consent bar with this site's words and privacy link.
 *
 * The bar itself is byte-identical in both applications and takes its labels
 * as props; this wrapper is where the public site supplies them, in the page's
 * language, with the cookies section of the privacy policy in that language.
 */
export default function ConsentBar() {
    const { m, path } = useI18n();

    return <SharedConsentBar labels={m.consent} privacyHref={path('/privacy#cookies')} />;
}
