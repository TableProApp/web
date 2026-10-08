import { useId, type FormEvent, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import FooterBar from '@/components/shared/footer-bar';
import Button from '@/components/ui/button';
import CellGrid from '@/components/ui/cell-grid';
import Container from '@/components/ui/container';
import { describedBy, FieldError, FieldLabel, Input } from '@/components/ui/field';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useEmailForm } from '@/hooks/use-email-form';
import { joinList } from '@/i18n/format';
import { Trans, useI18n } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { publisherValues } from '@/lib/data/facts';
import { openConsentSettings } from '@/lib/consent';
import { cn } from '@/lib/utils';
import ChatButton, { useChatAvailable } from './chat-button';
import LanguageSwitcher from './language-switcher';
import { EXTERNAL, PLATFORM_PAGES, SUPPORT_EMAIL, accountHref } from './site-links';

/**
 * A footer link: inline text in a block that is 32px tall for one line (the
 * small role's line height plus 5px above and below), so a long label wraps
 * like text and the row keeps the 32px rhythm. The line height follows the
 * small role, so Vietnamese gets its 1.6. On a touch screen the block is at
 * least 44px each way: the rows touch, so a 32px row put the next link under
 * the same finger.
 */
const LINK =
    'type-small inline-block py-[5px] rounded-[2px] text-left text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground pointer-coarse:min-w-11 pointer-coarse:py-[11px]';

/**
 * A link that leaves the site, in the same tab, marked ↗. The arrow follows
 * the last word with no break opportunity, so a wrapped label ("Changelog
 * (tiếng Anh) ↗") keeps it on its last line instead of floating it at the edge.
 */
function External({ href, children, hrefLang }: { href: string; children: ReactNode; hrefLang?: string }) {
    return (
        <a href={href} hrefLang={hrefLang} className={LINK}>
            {children}
            <span aria-hidden="true" className="ml-1">
                ↗
            </span>
        </a>
    );
}

/**
 * One group, one cell. The narrowest cells (two columns at 360px, five at
 * 1024px) leave about 150px, the width of a long German compound
 * ("Nutzungsbedingungen"), so the cell gives up half of its right padding,
 * which left-aligned text never shows. A longer word still hyphenates in the
 * page's language rather than crossing the wall.
 */
function Group({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="pr-2 hyphens-auto sm:pr-4">
            <h3 className="text-sm leading-[1.4] font-semibold text-foreground">{title}</h3>
            <ul className="mt-3 grid">{children}</ul>
        </div>
    );
}

/**
 * The newsletter: one email field, a Subscribe button and the result in place
 * (sitemap §B.3). It posts to the platform's `/newsletter/subscribe` with the
 * page's locale, through `useEmailForm`, and shows no subscriber count: the
 * footer never calls `/api/newsletter/stats`, whose session cookie would
 * otherwise land on public pages.
 *
 * It lays itself out by its cell's width: the field and button side by side
 * from 20rem, the words beside the form from 48rem.
 */
function Newsletter() {
    const { m } = useI18n();
    const form = useEmailForm('/newsletter/subscribe');
    const id = useId();
    const inputId = `${id}-email`;
    const resultId = `${id}-result`;

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        trackEvent('newsletter_signup_clicked', { source: 'footer' });
        void form.submit();
    }

    return (
        <section aria-labelledby={`${id}-title`} className="grid gap-4 @3xl:grid-cols-2 @3xl:gap-8">
            <div className="max-w-md">
                <h3 id={`${id}-title`} className="type-h3 text-foreground">
                    {m.footer.newsletter.title}
                </h3>
                <p className="type-small mt-2 text-muted-foreground">{m.footer.newsletter.body}</p>
            </div>
            <div className="max-w-md">
                <form onSubmit={submit} className="grid gap-1.5">
                    <FieldLabel htmlFor={inputId}>{m.forms.email.label}</FieldLabel>
                    <div className="flex flex-col gap-2 @xs:flex-row">
                        <Input
                            id={inputId}
                            type="email"
                            name="email"
                            required
                            autoComplete="email"
                            placeholder={m.forms.email.placeholder}
                            value={form.email}
                            onChange={(event) => form.setEmail(event.target.value)}
                            readOnly={form.processing}
                            invalid={form.error !== null}
                            aria-describedby={describedBy(inputId, { error: form.error }) ?? resultId}
                            className="@xs:flex-1"
                        />
                        {/* Busy shows a spinner beside the same label, so the button keeps its width. */}
                        <Button type="submit" variant="secondary" loading={form.processing} className="shrink-0">
                            {m.forms.subscribe}
                        </Button>
                    </div>
                    {form.error && <FieldError id={`${inputId}-error`}>{form.error}</FieldError>}
                    {/* Reserved height, so the answer moves nothing. An error is the one coloured status text, with an icon beside it. */}
                    <p
                        id={resultId}
                        aria-live="polite"
                        className={cn('type-small flex min-h-[1.6em] items-start gap-1.5', form.flash?.type === 'error' ? 'text-danger' : 'text-foreground')}
                    >
                        {form.flash?.type === 'error' && <CircleAlert className="mt-[0.2em] size-4 shrink-0" aria-hidden="true" />}
                        {form.flash?.message}
                    </p>
                </form>
                <p className="type-caption text-muted-foreground">
                    <Trans
                        text={m.footer.newsletter.note}
                        tags={{
                            link: (text) => (
                                <LocaleLink href="/privacy" className={textLinkClasses('inline')}>
                                    {text}
                                </LocaleLink>
                            ),
                        }}
                    />
                </p>
            </div>
        </section>
    );
}

/**
 * The footer on every public page (sitemap §B.3; positioning §10.2;
 * design-system §5.3.17).
 *
 * A visually hidden `h2` opens it, so its group titles never nest under the
 * page's last content heading. Five groups link the hubs, not every engine and
 * comparison: each hub lists all of its children. "Cookie settings" reopens
 * the consent bar on every page, because withdrawing consent must be as easy
 * as giving it. "Live chat" opens the conversation in the chat launcher that
 * every page carries.
 *
 * Its top rule is the page frame's last join, so it carries the marks where
 * that rule meets the rails, like every join in `<main>` (`data-join-mark`,
 * design-system §4.7). Below it the newsletter and the five groups are cells
 * of one CellGrid: the newsletter a full-width row, then the groups in two
 * columns on a phone, three from 640px and five from 1024px. A phone sees
 * only the horizontals. The shared FooterBar closes it, the same row as in the
 * account app.
 */
export default function SiteFooter({ newsletter = true }: { newsletter?: boolean }) {
    const { locale, m, fmt } = useI18n();
    const chat = useChatAvailable();
    const groups = m.footer.groups;

    return (
        <footer data-join-mark className="border-t border-rule bg-surface print:hidden">
            <Container>
                <h2 className="sr-only">{m.footer.heading}</h2>
                <CellGrid
                    density="compact"
                    className={cn(
                        'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
                        // A phone keeps the rows' lines and drops the wall between its two columns.
                        'max-sm:gap-x-0 max-sm:*:shadow-[0_-1px_0_var(--rule),0_1px_0_var(--rule)]',
                    )}
                >
                    {newsletter && (
                        <div className="@container col-span-full">
                            <Newsletter />
                        </div>
                    )}
                    <Group title={groups.product.title}>
                        <li>
                            <LocaleLink href="/features" className={LINK}>
                                {groups.product.features}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/databases" className={LINK}>
                                {groups.product.databases}
                            </LocaleLink>
                        </li>
                        {PLATFORM_PAGES.map((page) => (
                            <li key={page.id}>
                                <LocaleLink href={page.href} className={LINK}>
                                    {joinList(page.deviceNames, m.common.shortList)}
                                </LocaleLink>
                            </li>
                        ))}
                        <li>
                            <LocaleLink href="/pricing" className={LINK}>
                                {groups.product.pricing}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/download" className={LINK}>
                                {groups.product.download}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/compare" className={LINK}>
                                {groups.product.compare}
                            </LocaleLink>
                        </li>
                    </Group>
                    <Group title={groups.resources.title}>
                        <li>
                            <External href={EXTERNAL.docs} hrefLang="en">
                                {groups.resources.docs}
                            </External>
                        </li>
                        <li>
                            <External href={EXTERNAL.changelog} hrefLang="en">
                                {groups.resources.changelog}
                            </External>
                        </li>
                        <li>
                            <LocaleLink href="/blog" className={LINK}>
                                {groups.resources.blog}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/faq" className={LINK}>
                                {groups.resources.faq}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/about" className={LINK}>
                                {groups.resources.about}
                            </LocaleLink>
                        </li>
                        <li>
                            <External href={EXTERNAL.github}>{groups.resources.source}</External>
                        </li>
                        <li>
                            <External href={EXTERNAL.issues}>{groups.resources.reportBug}</External>
                        </li>
                    </Group>
                    <Group title={groups.support.title}>
                        <li>
                            <a href={accountHref(locale)} className={LINK}>
                                {groups.support.account}
                            </a>
                        </li>
                        <li>
                            <External href={EXTERNAL.troubleshooting} hrefLang="en">
                                {groups.support.troubleshooting}
                            </External>
                        </li>
                        <li>
                            <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK}>
                                {groups.support.email}
                            </a>
                        </li>
                        {chat && (
                            <li>
                                <ChatButton className={`${LINK} cursor-pointer`}>{groups.support.chat}</ChatButton>
                            </li>
                        )}
                    </Group>
                    <Group title={groups.community.title}>
                        <li>
                            <External href={EXTERNAL.discussions}>{groups.community.discussions}</External>
                        </li>
                        <li>
                            <External href={EXTERNAL.discord}>{groups.community.discord}</External>
                        </li>
                        <li>
                            <External href={EXTERNAL.x}>{groups.community.x}</External>
                        </li>
                        {/* The Telegram group is in Vietnamese. */}
                        {locale === 'vi' && (
                            <li>
                                <External href={EXTERNAL.telegram}>{groups.community.telegram}</External>
                            </li>
                        )}
                        <li>
                            <External href={EXTERNAL.sponsors}>{groups.community.sponsor}</External>
                        </li>
                    </Group>
                    <Group title={groups.legal.title}>
                        <li>
                            <LocaleLink href="/privacy" className={LINK}>
                                {groups.legal.privacy}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/terms" className={LINK}>
                                {groups.legal.terms}
                            </LocaleLink>
                        </li>
                        <li>
                            <LocaleLink href="/refund-policy" className={LINK}>
                                {groups.legal.refund}
                            </LocaleLink>
                        </li>
                        <li>
                            <button type="button" onClick={openConsentSettings} className={`${LINK} cursor-pointer`}>
                                {groups.legal.cookies}
                            </button>
                        </li>
                    </Group>
                </CellGrid>
                <FooterBar
                    copyright={fmt(m.footer.bottom.copyright, {
                        year: new Date().getFullYear(),
                        ...publisherValues(locale),
                    })}
                    language={<LanguageSwitcher variant="footer" />}
                    themeLabels={m.controls.theme}
                    chat={chat}
                />
            </Container>
        </footer>
    );
}
