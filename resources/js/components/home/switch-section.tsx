import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { FACTS } from '@/lib/data/facts';
import RichText from './rich-text';
import type { HomeContent } from './types';

/**
 * Section 8, `#switch` with the alias `#compare`: "I already use another
 * client. Can I bring my connections?" (sitemap §D; positioning §7 P1).
 *
 * The importers are facts.json's, each with whether it brings the saved
 * passwords across. Only the apps whose passwords come along are named with
 * "saved passwords included"; any other gets its own sentence. What the
 * reader can bring leads; the note that scopes both tools to the Mac app,
 * because the iPhone and iPad app has neither, closes the text. The
 * comparison tables live on /compare, not here.
 */
interface SwitchSectionProps {
    content: HomeContent['switch'];
    /** "Mac app": the importers and Open Project Folder exist only there. */
    macApp: string;
}

export default function SwitchSection({ content, macApp }: SwitchSectionProps) {
    const { m, fmt } = useI18n();
    const name = (entry: (typeof FACTS.connectionImport)[number]) => (entry.format !== null ? `${entry.app} (${entry.format})` : entry.app);
    const withPasswords = FACTS.connectionImport.filter((entry) => entry.passwords).map(name);
    const withoutPasswords = FACTS.connectionImport.filter((entry) => !entry.passwords).map(name);

    return (
        <Section
            id="switch"
            width="text"
            lead={
                <>
                    {withPasswords.length > 0 && fmt(content.import, { apps: joinList(withPasswords, m.common.list) })}
                    {withPasswords.length > 0 && withoutPasswords.length > 0 && ' '}
                    {withoutPasswords.length > 0 && fmt(content.importWithoutPasswords, { apps: joinList(withoutPasswords, m.common.list) })}
                </>
            }
            title={
                <>
                    {/* `#compare` predates this section; an empty anchor keeps old links landing here. */}
                    <span id="compare" aria-hidden="true" />
                    {content.title}
                </>
            }
        >
            <p className="type-body text-foreground">
                <RichText text={content.project} />
            </p>
            <p className="type-small mt-4 text-muted-foreground">{fmt(content.lead, { macApp })}</p>
            <p className="mt-6">
                <LocaleLink href="/compare" className={textLinkClasses('standalone')}>
                    {content.link}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
            </p>
        </Section>
    );
}
