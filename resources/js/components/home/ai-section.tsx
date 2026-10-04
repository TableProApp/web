import AssetSlot from '@/components/ui/asset-slot';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { FACTS } from '@/lib/data/facts';
import type { HomeContent } from './types';

/**
 * Section 6, `#ai` with the alias `#mcp` (sitemap §D; positioning §8).
 *
 * Real, free and Mac-only, so it gets one accurate section, after the
 * workflows and never in the identity copy. The approval wording is exact:
 * writes wait for you at Alert or a stricter Safe Mode level, and DROP or
 * TRUNCATE always needs a click. The MCP host, the client names and the
 * providers come from facts.json, and none of them is counted.
 */
export default function AiSection({ content }: { content: HomeContent['ai'] }) {
    const { m, fmt } = useI18n();

    const values = {
        mcpClients: joinList(FACTS.mcp.clients.setupSheet, m.common.list),
        mcpHost: FACTS.mcp.host,
    };

    return (
        <Section
            id="ai"
            title={
                <>
                    {/* `#mcp` predates this section; an empty anchor keeps old links landing here. */}
                    <span id="mcp" aria-hidden="true" />
                    {content.title}
                </>
            }
        >
            <div className="max-w-[40rem]">
                {content.body.map((paragraph) => (
                    <p key={paragraph} className="type-body mt-4 text-foreground first:mt-0">
                        {fmt(paragraph, values)}
                    </p>
                ))}
                <p className="type-small mt-4 text-muted-foreground">
                    {fmt(content.providers, { providers: joinList(FACTS.ai.providers, m.common.list) })}
                </p>
                <p className="mt-4">
                    <LocaleLink href="/features/ai-mcp" className={textLinkClasses('standalone')}>
                        {m.nav.featureLinks.aiMcp}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                </p>
            </div>
            <div className="mt-8">
                <AssetSlot id="mac-ai-chat" />
            </div>
        </Section>
    );
}
