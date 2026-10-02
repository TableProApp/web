import { useId, type FormEvent, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import ThemeControl from '@/components/shared/theme-control';
import Button from '@/components/ui/button';
import Container from '@/components/ui/container';
import { describedBy, FieldError, FieldLabel, Input } from '@/components/ui/field';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useEmailForm } from '@/hooks/use-email-form';
import { joinList } from '@/i18n/format';
import { Trans, useI18n } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { openConsentSettings } from '@/lib/consent';
import { cn } from '@/lib/utils';
import ChatButton, { useChatAvailable } from './chat-button';
import LanguageSwitcher from './language-switcher';
import { EXTERNAL, PLATFORM_PAGES, SUPPORT_EMAIL, accountHref } from './site-links';

const LINK =
    'inline-flex min-h-8 items-center gap-1 rounded-[2px] text-left text-sm leading-[1.4] text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground';

/** A link that leaves the site, in the same tab, marked ↗. */
function External({ href, children, hrefLang }: { href: string; children: ReactNode; hrefLang?: string }) {
    return (
        <a href={href} hrefLang={hrefLang} className={LINK}>
            {children}
            <span aria-hidden="true">↗</span>
        </a>
    );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div>
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
        <section aria-labelledby={`${id}-title`} className="max-w-md">
            <h3 id={`${id}-title`} className="type-h3 text-foreground">
                {m.footer.newsletter.title}
            </h3>
            <p className="type-small mt-2 text-muted-foreground">{m.footer.newsletter.body}</p>
            <form onSubmit={submit} className="mt-4 grid gap-1.5">
                <FieldLabel htmlFor={inputId}>{m.forms.email.label}</FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        id={inputId}
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        placeholder={m.forms.email.placeholder}
                        value={form.email}
                        onChange={(event) => form.setEmail(event.target.value)}
                        disabled={form.processing}
                        invalid={form.error !== null}
                        aria-describedby={describedBy(inputId, { error: form.error }) ?? resultId}
                        className="sm:flex-1"
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
 * as giving it. "Live chat" loads Crisp only when clicked.
 */
export default function SiteFooter() {
    const { locale, m, fmt } = useI18n();
    const chat = useChatAvailable();
    const groups = m.footer.groups;

    return (
        <footer className="border-t border-rule bg-surface print:hidden">
            <Container className="pt-16 pb-12">
                <h2 className="sr-only">{m.footer.heading}</h2>
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-5">
                        <Newsletter />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-7">
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
                                <External href={EXTERNAL.github}>{groups.community.github}</External>
                            </li>
                            <li>
                                <External href={EXTERNAL.discord}>{groups.community.discord}</External>
                            </li>
                            <li>
                                <External href={EXTERNAL.x}>{groups.community.x}</External>
                            </li>
                            <li>
                                <External href={EXTERNAL.facebook}>{groups.community.facebook}</External>
                            </li>
                            <li>
                                <External href={EXTERNAL.telegram}>{groups.community.telegram}</External>
                            </li>
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
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-6 border-t border-rule pt-6 lg:flex-row lg:items-center lg:justify-between">
                    <p className="type-small text-muted-foreground">{fmt(m.footer.bottom.copyright, { year: new Date().getFullYear() })}</p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
                        <LanguageSwitcher variant="list" />
                        <ThemeControl variant="segmented" labels={m.controls.theme} />
                    </div>
                </div>
            </Container>
        </footer>
    );
}
