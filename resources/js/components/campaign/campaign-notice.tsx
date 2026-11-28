import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { CLOSED_KEY } from '@/components/campaign/campaign-banner';
import Countdown from '@/components/campaign/countdown';
import SalePrice from '@/components/campaign/sale-price';
import { useCheckout } from '@/components/pricing/use-checkout';
import Button from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useCampaign } from '@/hooks/use-campaign';
import { useSettledRegionalPricing } from '@/hooks/use-regional-pricing';
import { useI18n } from '@/i18n';
import { formatUsd } from '@/i18n/format';
import { trackEvent } from '@/lib/analytics';
import { noticeClosed, noticeClosedValue, noticeOpens, type CampaignData } from '@/lib/campaign';
import { PRICING } from '@/lib/data/pricing';
import { discountedAmount } from '@/lib/regional-pricing';
import { cn } from '@/lib/utils';

type Kind = 'dialog' | 'card';

// From the width where the consent bar floats (ConsentBar): a modal dialog. Below it, a card at the bottom that blocks nothing.
const WIDE = '(min-width: 40rem)';

// Once per document: a visit to another page in this tab does not open it again.
let openedThisDocument = false;

function rememberClosed(campaign: CampaignData): void {
    try {
        // The bare id is the banner's: a reader who closed the banner keeps that answer.
        if (localStorage.getItem(CLOSED_KEY) !== campaign.id) {
            localStorage.setItem(CLOSED_KEY, noticeClosedValue(campaign));
        }
    } catch {
        // Storage refused: closed for this document only.
    }
}

/**
 * The dated sale's notice, opened once on load while the sale is live
 * (positioning "Dated sales"): a modal dialog from 640px, a card at the bottom
 * of the screen below that, which covers no content (Google's guidance on
 * intrusive dialogs).
 *
 * It opens only in the reader's browser, after hydration, because the page
 * sits in the edge cache: never in the server's HTML. It stays shut where the
 * banner prop says so (the sale's page, Pricing), once the reader has closed
 * it or the banner (`tablepro:campaign-closed`), when a larger regional
 * discount applies (`noticeOpens`), and while the consent bar is asking, so
 * one thing asks at a time. Any answer, a click on an offer included, closes
 * it for the rest of the sale.
 */
export default function CampaignNotice() {
    const banner = usePage().props.banner;
    const { phase } = useCampaign();
    const campaign = PRICING.campaign;
    const [eligible, setEligible] = useState(false);
    const allowed = campaign !== null && banner?.kind === 'campaign' && banner.notice === true && phase === 'live';

    useEffect(() => {
        if (!allowed || campaign === null || openedThisDocument) {
            setEligible(false);

            return;
        }

        let stored: string | null = null;

        try {
            stored = localStorage.getItem(CLOSED_KEY);
        } catch {
            // No storage: nothing was closed.
        }

        setEligible(!noticeClosed(campaign, stored));
    }, [allowed, campaign]);

    if (!allowed || !eligible || campaign === null || banner === null) {
        return null;
    }

    // The regional request is made only here, for a reader the notice may open for.
    return <NoticeOpener campaign={campaign} href={banner.href} />;
}

function NoticeOpener({ campaign, href }: { campaign: CampaignData; href: string }) {
    const regional = useSettledRegionalPricing();
    const [kind, setKind] = useState<Kind | null>(null);

    useEffect(() => {
        if (regional === undefined || openedThisDocument || !noticeOpens(campaign, 'live', regional?.percent ?? null)) {
            return;
        }

        const root = document.documentElement;
        const wide = window.matchMedia(WIDE).matches;

        const open = (): boolean => {
            // The consent bar floats from this width, and a modal would make it unreachable. Below it, it sits in the page.
            if (wide && root.classList.contains('consent-open')) {
                return false;
            }

            openedThisDocument = true;
            setKind(wide ? 'dialog' : 'card');
            trackEvent('campaign_notice_view', { kind: wide ? 'dialog' : 'card' });

            return true;
        };

        if (open()) {
            return;
        }

        const observer = new MutationObserver(() => {
            if (open()) {
                observer.disconnect();
            }
        });

        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, [regional, campaign]);

    if (kind === null) {
        return null;
    }

    const close = (action: string): void => {
        rememberClosed(campaign);
        setKind(null);
        trackEvent('campaign_notice_close', { action });
    };

    return kind === 'dialog' ? <NoticeDialog campaign={campaign} href={href} onClose={close} /> : <NoticeCard campaign={campaign} href={href} onClose={close} />;
}

interface NoticeProps {
    campaign: CampaignData;
    href: string;
    /** `action`: what closed it, for the event: close, later, escape, backdrop, both, buy, deal. */
    onClose: (action: string) => void;
}

function NoticeDialog({ campaign, href, onClose }: NoticeProps) {
    const { m, fmt } = useI18n();
    const { prop } = useCampaign();
    const flow = useCheckout();
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [buying, setBuying] = useState(false);
    const busy = flow.pending !== null;

    useEffect(() => {
        const dialog = ref.current;

        if (dialog === null || dialog.open) {
            return;
        }

        const overflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        dialog.showModal();
        // The dialog itself takes focus, so a screen reader hears its name first and no ring lands on a control unasked.
        dialog.focus();

        return () => {
            document.body.style.overflow = overflow;
            dialog.close();
        };
    }, []);

    // Polar's overlay opens outside this dialog, where a modal would make it inert: the dialog goes once checkout is under way.
    useEffect(() => {
        if (buying && !busy && flow.error === null) {
            onClose('buy');
        }
    }, [buying, busy, flow.error, onClose]);

    if (prop === null) {
        return null;
    }

    const copy = m.campaign.notice;
    const prices = PRICING.tiers.starter.prices;
    const usd = (amount: number): string => formatUsd(amount, m.pricing.currency);
    const lifetime = discountedAmount(prices.lifetime, campaign.percent);
    const yearly = discountedAmount(prices.yearly, campaign.percent);

    const rows = [
        { cycle: 'lifetime', name: copy.lifetime, detail: copy.lifetimeDetail, list: prices.lifetime, sale: lifetime, leads: true },
        { cycle: 'yearly', name: copy.yearly, detail: fmt(m.campaign.offer.firstYear, { price: usd(prices.yearly) }), list: prices.yearly, sale: yearly, leads: false },
    ];

    function backdrop(event: MouseEvent<HTMLDialogElement>): void {
        // A click on the backdrop lands on the <dialog> itself, outside its box.
        if (busy || event.target !== ref.current) {
            return;
        }

        const box = ref.current.getBoundingClientRect();
        const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;

        if (!inside) {
            onClose('backdrop');
        }
    }

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            tabIndex={-1}
            onCancel={(event) => {
                event.preventDefault();

                if (!busy) {
                    onClose('escape');
                }
            }}
            onClick={backdrop}
            className="m-auto bg-raised outline-none w-[calc(100vw-2rem)] max-w-[32.5rem] rounded-panel border border-rule p-0 text-foreground shadow-overlay backdrop:bg-[oklch(0_0_0/0.45)]"
        >
            <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-7">
                <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{m.campaign.name}</p>
                    <button
                        type="button"
                        onClick={() => onClose('close')}
                        disabled={busy}
                        aria-label={m.campaign.banner.close}
                        className="-mt-1 -mr-2.5 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-control text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface-strong"
                    >
                        <X className="size-4" aria-hidden="true" />
                    </button>
                </div>

                <h2 id={titleId} className="mt-4 font-semibold">
                    <span className="block text-[clamp(3.5rem,14vw,5.5rem)] leading-[0.92] tracking-[-0.045em]">{fmt(copy.headline, { percent: campaign.percent })}</span>
                    <span className="mt-2.5 block text-[1.375rem] leading-tight tracking-[-0.015em]">{copy.product}</span>
                </h2>
                <p className="type-small mt-2 text-muted-foreground">{fmt(copy.window, { endsOn: prop.endsOn, endsAtTime: prop.endsAtTime })}</p>

                <ul className="mt-6 border-t border-rule">
                    {rows.map((row) => (
                        <li key={row.cycle} className={cn('flex items-center justify-between gap-4 border-b border-rule', row.leads ? 'py-3.5' : 'py-3')}>
                            <div className="grid min-w-0 gap-0.5">
                                <p className={cn('font-semibold', row.leads ? 'text-base' : 'text-[0.9375rem]')}>{row.name}</p>
                                <p className="type-caption text-muted-foreground">{row.detail}</p>
                            </div>
                            <p className="flex shrink-0 items-baseline gap-2.5 tabular-nums">
                                <s className="type-small text-muted-foreground">
                                    <span className="sr-only">{fmt(m.campaign.offer.listPrice, { price: usd(row.list) })}</span>
                                    <span aria-hidden="true">{usd(row.list)}</span>
                                </s>
                                <SalePrice amount={row.sale} className={cn('leading-none font-semibold tracking-[-0.02em]', row.leads ? 'text-3xl' : 'text-[1.375rem]')} />
                            </p>
                        </li>
                    ))}
                </ul>

                <Countdown to="end" variant="row" className="mt-5" />

                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={busy}
                    onPointerEnter={flow.warm}
                    onFocus={flow.warm}
                    onClick={() => {
                        setBuying(true);
                        trackEvent('campaign_notice_click', { action: 'buy' });
                        void flow.start(campaign.tier, 'lifetime', { discountCode: campaign.code });
                    }}
                    className="mt-5"
                >
                    {fmt(copy.buy, { price: usd(lifetime) })}
                </Button>
                {flow.error !== null && (
                    <Callout tone="danger" role="alert" className="mt-3">
                        <p>{flow.error.message}</p>
                    </Callout>
                )}

                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4">
                    <LocaleLink
                        href={href}
                        onClick={() => {
                            trackEvent('campaign_notice_click', { action: 'both' });
                            onClose('both');
                        }}
                        className={textLinkClasses('standalone', 'type-small py-2.5 font-medium')}
                    >
                        {copy.both}
                    </LocaleLink>
                    <Button variant="quiet" disabled={busy} onClick={() => onClose('later')} className="-mr-4 text-muted-foreground">
                        {copy.later}
                    </Button>
                </div>

                <p className="type-caption mt-3 border-t border-rule pt-3 text-muted-foreground">{fmt(copy.footnote, { listPriceSince: prop.listPriceSince })}</p>
            </div>
        </dialog>
    );
}

function NoticeCard({ campaign, href, onClose }: NoticeProps) {
    const { m, fmt } = useI18n();
    const titleId = useId();
    const card = useRef<HTMLElement>(null);

    // Keeps a focused element from scrolling underneath it (WCAG 2.4.11), as the consent bar does.
    useEffect(() => {
        const root = document.documentElement;
        const node = card.current;

        if (node === null || root.style.scrollPaddingBottom !== '') {
            return;
        }

        root.style.scrollPaddingBottom = `${node.offsetHeight + 24}px`;

        return () => {
            root.style.scrollPaddingBottom = '';
        };
    }, []);
    const copy = m.campaign.notice;
    const lifetime = discountedAmount(PRICING.tiers.starter.prices.lifetime, campaign.percent);

    return (
        <section
            ref={card}
            aria-labelledby={titleId}
            className="fixed inset-x-3 bottom-3 z-50 grid gap-2 rounded-panel border border-rule bg-raised pt-1.5 pr-1.5 pb-3.5 pl-4 text-foreground shadow-overlay print:hidden"
        >
            <div className="flex items-center justify-between gap-2">
                <h2 id={titleId} className="min-w-0 pt-2 text-[0.9375rem] font-semibold">
                    {fmt(copy.card, { percent: campaign.percent })}
                </h2>
                <button
                    type="button"
                    onClick={() => onClose('close')}
                    aria-label={m.campaign.banner.close}
                    className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-control text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface-strong"
                >
                    <X className="size-4" aria-hidden="true" />
                </button>
            </div>
            <div className="flex items-center justify-between gap-3 pr-2.5">
                <div className="grid min-w-0 gap-0.5">
                    <p className="type-caption text-muted-foreground">{fmt(copy.cardPrice, { price: formatUsd(lifetime, m.pricing.currency) })}</p>
                    <Countdown to="end" variant="inline" className="type-caption text-muted-foreground" />
                </div>
                <LocaleLink
                    href={href}
                    onClick={() => {
                        trackEvent('campaign_notice_click', { action: 'deal' });
                        onClose('deal');
                    }}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-control bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-accent-hover active:bg-accent-active"
                >
                    {m.campaign.banner.cta}
                </LocaleLink>
            </div>
        </section>
    );
}
