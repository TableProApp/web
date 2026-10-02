import { useId, type FormEvent } from 'react';
import { CircleAlert } from 'lucide-react';
import Button from '@/components/ui/button';
import { describedBy, FieldError, FieldLabel, Input } from '@/components/ui/field';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useEmailForm } from '@/hooks/use-email-form';
import { Trans, useI18n } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface NewsletterSignupProps {
    title: string;
    body: string;
    className?: string;
}

/**
 * The blog index's email signup (sitemap §A.5): the same list as the footer's
 * form, offered where a reader of release posts is.
 *
 * It posts `{ email, locale }` to the platform's `/newsletter/subscribe`
 * through `useEmailForm` (plain `fetch`, no cookies kept), counts the click as
 * `newsletter_signup_clicked{source:'blog'}`, and shows the answer in place.
 */
export default function NewsletterSignup({ title, body, className }: NewsletterSignupProps) {
    const { m } = useI18n();
    const form = useEmailForm('/newsletter/subscribe');
    const id = useId();
    const inputId = `${id}-email`;
    const resultId = `${id}-result`;

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        trackEvent('newsletter_signup_clicked', { source: 'blog' });
        void form.submit();
    }

    return (
        <section aria-labelledby={`${id}-title`} className={cn('rounded-panel border border-rule bg-surface p-6', className)}>
            <h2 id={`${id}-title`} className="type-h3 text-foreground">
                {title}
            </h2>
            <p className="type-small mt-2 text-muted-foreground">{body}</p>
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
                    <Button type="submit" variant="secondary" loading={form.processing} className="shrink-0">
                        {m.forms.subscribe}
                    </Button>
                </div>
                {form.error && <FieldError id={`${inputId}-error`}>{form.error}</FieldError>}
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
