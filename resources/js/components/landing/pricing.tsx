import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Container from '@/components/ui/container';
import FootNote from '@/components/ui/footnote';
import { FullLine } from '@/components/ui/full-line';
import { Ledger, LedgerRow } from '@/components/ui/ledger';
import SectionShell from '@/components/ui/section-shell';
import { CheckGlyph } from '@/components/ui/glyph';
import { PROSE_LINK } from '@/components/ui/prose-link';
import { PANEL_TITLE } from '@/components/ui/grid-cell';
import { trackDownload, trackEvent } from '@/lib/analytics';
import { currentAttribution } from '@/lib/attribution';
import LicenseTable from '@/components/landing/license';
import SponsorRow from '@/components/landing/sponsor-row';
import { STARTER_PRICE, TEAM_SEAT_PRICE, type TierPrice } from '@/data/pricing';
import { PAID_FEATURES } from '@/data/license';
import { GITHUB_SPONSORS_URL } from '@/data/links';

type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

interface Discount {
    valid: boolean;
    amount_type?: 'percent' | 'fixed';
    amount?: number;
}

interface Tier {
    /**
     * The product key this tier resolves to, matching `LicenseTier` on the
     * server ('starter' | 'team'). Held separately from `name` so renaming the
     * marketing label can never change which product gets bought.
     */
    key: 'free' | 'starter' | 'team';
    name: string;
    price: 'free' | TierPrice;
    featured: boolean;
    includesFrom?: string;
    features?: string[];
    cta: string;
    ctaHref?: string;
}

function applyDiscount(price: number, discount: Discount | null): number | null {
    if (!discount?.valid || !discount.amount_type || !discount.amount) return null;
    if (discount.amount_type === 'percent') {
        return Math.max(0, +(price * (1 - discount.amount / 100)).toFixed(2));
    }
    return Math.max(0, +(price - discount.amount / 100).toFixed(2));
}

/*
 * Counted, never typed. "The seven Starter features" was a literal here for as
 * long as there were four of them listed one section down, and a hand-typed
 * count is the thing that goes stale first when `ProFeature.swift` grows a
 * case. The cards name no feature at all now: `license.tsx` renders the whole
 * matrix directly above them, and a bullet that repeats a table row is a bullet
 * that can disagree with it.
 */
function buildTiers(teamMinSeats: number): Tier[] {
    const starterCount = PAID_FEATURES.filter((feature) => feature.tier === 'starter').length;
    const teamCount = PAID_FEATURES.filter((feature) => feature.tier === 'team').length;

    return [
        {
            key: 'free',
            name: 'Free',
            price: 'free',
            featured: false,
            cta: 'Download',
            ctaHref: '/download',
        },
        {
            key: 'starter',
            name: 'Starter',
            price: STARTER_PRICE,
            featured: true,
            includesFrom: 'Free',
            features: [`All ${starterCount} Starter features above`, '2 Mac activations'],
            cta: 'Get Starter',
        },
        {
            key: 'team',
            name: 'Team',
            price: TEAM_SEAT_PRICE,
            featured: false,
            includesFrom: 'Starter',
            features: [
                `Per seat, from ${teamMinSeats} seats`,
                `All ${starterCount + teamCount} licensed features above`,
                'Seats and invites on the web. Passwords are never sent.',
            ],
            cta: 'Get Team',
        },
    ];
}

/*
 * The plan comparison table used to live here, six rows naming four of the nine
 * features the app gates. `license.tsx` owns that artifact now: it names all
 * nine, and it renders one section earlier, where the reader is still deciding
 * rather than scrolling past the cards on their way out.
 */

function PricingCard({ tier, cycle, discountCode, discount, paymentProvider, teamMinSeats }: { tier: Tier; cycle: BillingCycle; discountCode: string; discount: Discount | null; paymentProvider: string; teamMinSeats: number }) {
    // Narrow off tier.price directly: TypeScript does not carry the refinement
    // through a separate boolean, so `isFree` alone leaves priceObj as the union.
    const priceObj = tier.price === 'free' ? null : tier.price;
    const isFree = priceObj === null;
    const isTeam = tier.key === 'team';
    const [seats, setSeats] = useState(teamMinSeats);
    const unitPrice = priceObj ? priceObj[cycle] : 0;
    const price = isTeam ? +(unitPrice * seats).toFixed(2) : unitPrice;
    const discountedPrice = !priceObj || cycle === 'monthly' ? null : applyDiscount(price, discount);

    const [isLoading, setIsLoading] = useState(false);

    /**
     * Checkout is handled by the TablePro backend, reached same-origin. We send
     * the tier and billing cycle rather than a provider product id, so no
     * payment-provider identifier ever has to exist in this repository.
     *
     * The attribution record rides along because this call is the last point at
     * which a reader's acquisition source and their purchase are both visible:
     * the overlay that takes the money runs on the provider's domain, and the
     * license is written by the backend afterwards. It is absent for anyone
     * whose first visit carried no campaign tag and no off-site referrer, and
     * for anyone whose browser refuses storage, so the field is optional at
     * both ends. See resources/js/lib/attribution.ts.
     */
    async function handleCheckout() {
        if (isFree) return;
        setIsLoading(true);

        /*
         * Fired on intent rather than on success, because success happens
         * inside the provider's overlay where nothing here can observe it.
         * Read against `checkout_completed` on the backend, this is the
         * abandonment rate for the overlay.
         */
        trackEvent('checkout_started', { tier: tier.key, cycle });

        try {
            const body: Record<string, unknown> = { tier: tier.key, cycle };
            const trimmed = discountCode.trim();
            if (trimmed) body.discount_code = trimmed;
            if (isTeam) body.seats = String(seats);

            const attribution = currentAttribution();
            if (attribution !== null) { body.attribution = attribution; }

            const res = await fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message || 'Something went wrong'); return; }
            if (paymentProvider === 'polar') {
                window.Polar?.EmbedCheckout?.create(data.url, { theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' });
            } else {
                (window as any).LemonSqueezy?.Url?.Open?.(data.url);
            }
        } catch { toast.error('Could not start checkout. Try again.'); } finally { setIsLoading(false); }
    }

    return (
        <div className={`flex h-full flex-col border-rule p-6 sm:p-8 ${tier.featured ? 'bg-primary/5' : ''}`}>
            <h3 className={PANEL_TITLE}>{tier.name}</h3>

            <div className="mt-4">
                {isFree ? (
                    <span className="text-4xl font-bold text-foreground">$0</span>
                ) : (() => {
                    const cycleSuffixUsd = cycle === 'monthly' ? '/mo' : cycle === 'yearly' ? '/year' : ' once';

                    return discountedPrice !== null ? (
                        <>
                            <span className="text-4xl font-bold text-foreground">${discountedPrice}</span>
                            <span className="ml-2 text-lg text-muted-foreground line-through">${price}</span>
                            <span className="ml-1 text-sm text-muted-foreground">{cycleSuffixUsd}</span>
                        </>
                    ) : (
                        <>
                            <span className="text-4xl font-bold text-foreground">${price}</span>
                            <span className="ml-1 text-sm text-muted-foreground">{cycleSuffixUsd}</span>
                        </>
                    );
                })()}
            </div>

            {!isFree && cycle === 'yearly' && priceObj !== null && priceObj.lifetime > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                    or ${priceObj.lifetime} once, no renewal
                </p>
            )}

            {isTeam && !isFree && (
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">${unitPrice}/seat</span>
                    <div className="flex items-center rounded-full border border-rule-strong">
                        <button
                            type="button"
                            onClick={() => setSeats((s) => Math.max(teamMinSeats, s - 1))}
                            className="px-3 py-1 text-lg leading-none text-muted-foreground hover:text-foreground disabled:opacity-50"
                            disabled={seats <= teamMinSeats}
                            aria-label="Fewer seats"
                        >
                            &minus;
                        </button>
                        <span
                            className="w-10 text-center text-sm font-medium text-foreground tabular-nums"
                            aria-live="polite"
                            aria-label={`${seats} seats`}
                        >
                            {seats}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSeats((s) => Math.min(200, s + 1))}
                            className="px-3 py-1 text-lg leading-none text-muted-foreground hover:text-foreground disabled:opacity-50"
                            disabled={seats >= 200}
                            aria-label="More seats"
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6">
                {tier.ctaHref ? (
                    <a href={tier.ctaHref} onClick={() => trackDownload('pricing-free')} className={`inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity duration-(--dur-tap) ease-(--ease-feedback) ${tier.featured ? 'bg-primary text-primary-foreground hover:opacity-90' : 'border border-rule text-foreground'}`}>
                        {tier.cta}
                    </a>
                ) : (
                    <button type="button" onClick={handleCheckout} disabled={isLoading} className={`inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity duration-(--dur-tap) ease-(--ease-feedback) ${tier.featured ? 'bg-primary text-primary-foreground hover:opacity-90' : 'border border-rule text-foreground'} ${isLoading ? 'cursor-wait opacity-60' : ''}`}>
                        {isLoading ? 'Loading...' : tier.cta}
                    </button>
                )}
            </div>

            {tier.features && (
                <div className="mt-6">
                    {tier.includesFrom && (
                        <p className="mb-3 text-sm font-medium text-foreground">
                            Everything in {tier.includesFrom}, plus:
                        </p>
                    )}
                    <ul className="space-y-2.5">
                        {tier.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2.5">
                                <CheckGlyph className="mt-0.5 size-4 shrink-0 text-primary-strong" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function Pricing({ paymentProvider, teamMinSeats }: { paymentProvider: string; teamMinSeats: number }) {
    const tiers = buildTiers(teamMinSeats);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
    const [discountCode, setDiscountCode] = useState('');
    const [showCoupon, setShowCoupon] = useState(false);
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    /**
     * Both checkout providers mount their overlay outside React, so body scroll
     * has to be locked by observation. Detection is unchanged; the guard just
     * stops us writing to body.style on every unrelated mutation.
     */
    useEffect(() => {
        let locked = false;

        const sync = () => {
            const overlay =
                document.querySelector('.lemonsqueezy-loader') !== null ||
                document.body.classList.contains('polar-no-scroll');

            if (overlay === locked) return;

            locked = overlay;
            document.body.style.overflow = overlay ? 'hidden' : '';
        };

        const observer = new MutationObserver(sync);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        const trimmed = discountCode.trim();
        if (!trimmed) { setDiscount(null); return; }
        setIsValidating(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch('/discount/preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ code: trimmed }),
                });
                const data: Discount = await res.json();
                setDiscount(data.valid ? data : null);
                if (!data.valid) toast.error('Invalid or expired coupon code.');
            } catch { setDiscount(null); } finally { setIsValidating(false); }
        }, 600);
        return () => { clearTimeout(timer); setIsValidating(false); };
    }, [discountCode]);

    const cycles: { value: BillingCycle; label: string; badge?: string }[] = [
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly', badge: 'Save 33%' },
        { value: 'lifetime', label: 'Lifetime', badge: 'Pay once' },
    ];

    return (
        <SectionShell
            id="pricing"
            label="Pricing"
            headline="The app is free."
            /*
             * The second line counts rather than asserts, so it cannot drift
             * from `ProFeature.swift` the way the retired "a license adds four
             * things" lede did while the app gated nine.
             */
            headlineMuted={`${PAID_FEATURES.length} features need a license.`}
            /*
             * The free promise, which used to open the License section's own
             * header stack one scroll above this one. Two eyebrows, two H2s and
             * two ledes were being spent to answer a single question in halves —
             * what a license adds, then what it costs — so License is an artifact
             * inside this section now and this is the sentence that opens it.
             *
             * It is also the objection that blocks the most readers, and it is
             * answered on the screen where they are deciding.
             */
            lede="Free is not a trial and not a demo. It is the whole app, on every Mac you own, with nothing counting down."
            tone="raised"
        >

            <Container>
                <FullLine />
                <Ledger>
                    {/*
                      * The AGPL answer, moved to where it converts. It used to
                      * render at position four as an orphan h2 at body size —
                      * a section-level heading smaller than every h3 on the page
                      * — blocking the highest-value visitor on the site before
                      * they had seen anything. It belongs one scroll from the
                      * Team card.
                      *
                      * The ask survives; the apology does not. "Mostly it buys
                      * my time" and "if you cannot afford one" both hedged the
                      * value proposition at the moment of decision, and the
                      * second one told a Team buyer the product is priced for
                      * people who cannot spare $24 a year.
                      *
                      * "No company-size limit" is back. It was cut as filler and
                      * it is not: every comparable project states it, because
                      * the reader deciding whether they may expense this is the
                      * one the AGPL question actually blocks.
                      */}
                    <LedgerRow label="At work">
                        AGPL obligations attach to distributing a modified version, not to using it. No
                        company-size limit.
                    </LedgerRow>
                    {/*
                      * Who builds it, which nothing on this domain said.
                      *
                      * Every comparable project states this where it asks:
                      * Obsidian sells "independent development" and being "free
                      * from investor influence", Beekeeper "a small indie team,
                      * not backed by big corporations or VC investment", Sindre
                      * "a full-time open-sourcerer funded by the community". The
                      * site said only that these companies "pay for the time",
                      * at the very foot of the page, which credits the sponsors
                      * rather than naming the model.
                      *
                      * A fact, not a plea. No revenue figure, no "we need your
                      * help" — the page that asks for money is the worst place
                      * on the site to sound like it needs any.
                      *
                      * Sponsorship is deliberately the subordinate clause. It is
                      * worth less to the project and less to the reader than a
                      * license, and Beekeeper says so outright: "the best way to
                      * support us is by purchasing a license."
                      */}
                    <LedgerRow label="Who builds it">
                        One person, full time, funded by licenses rather than investors. Buying one is how the
                        next release gets built, and{' '}
                        <a
                            href={GITHUB_SPONSORS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={PROSE_LINK}
                        >
                            sponsorship
                        </a>{' '}
                        goes to the same place.
                    </LedgerRow>
                </Ledger>
                <FullLine />
            </Container>

            {/*
              * What a license adds, then what it costs. One argument, in the
              * order the reader asks the questions.
              */}
            <LicenseTable teamMinSeats={teamMinSeats} />

            {/* Billing toggle. No opening rule: the footnote above closes with one. */}
            <Container>
                <div className="flex items-center justify-center overflow-x-auto py-4">
                    <div className="inline-flex items-center rounded-full border border-rule bg-surface-raised p-1">
                        {cycles.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setBillingCycle(c.value)}
                                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-(--dur-tap) ease-(--ease-feedback) ${
                                    billingCycle === c.value
                                        ? 'bg-foreground text-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {c.label}
                                {c.badge && (
                                    <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-2xs font-semibold text-primary-strong">
                                        {c.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                {/*
                  * No rule between the toggle and its caption. They are one
                  * control, and the band that used to sit here also restated
                  * "Yearly saves 33 percent" — which the toggle's own badge
                  * says, eight pixels above it — and a lifetime payback figure
                  * derived from two price literals typed outside `buildTiers()`.
                  */}
                <p className="px-4 pb-4 text-center text-sm text-muted-foreground">
                    Starter is per person, Team per seat from {teamMinSeats}.
                </p>
                <FullLine />

                {paymentProvider !== 'polar' && (
                    <>
                        {/* Coupon - only for non-Polar providers (Polar has its own discount field in checkout) */}
                        <div className="flex flex-col items-center gap-1.5 py-3">
                            {showCoupon ? (
                                <>
                                    <div className="relative">
                                        <label htmlFor="discount-code" className="sr-only">
                                            Coupon code
                                        </label>
                                        <input
                                            id="discount-code"
                                            type="text"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            placeholder="Enter coupon code"
                                            className={`w-48 rounded-lg border bg-transparent px-3 py-1.5 text-center text-sm text-foreground placeholder:text-muted-foreground-subtle ${
                                                discount?.valid
                                                    ? 'border-primary/50 focus:border-primary'
                                                    : 'border-rule focus:border-primary/50'
                                            }`}
                                        />
                                        {isValidating && (
                                            <div
                                                className="absolute top-1/2 right-2.5 -translate-y-1/2"
                                                role="status"
                                                aria-live="polite"
                                            >
                                                <span className="sr-only">Checking coupon code</span>
                                                {/*
                                                  * `motion-reduce:animate-none` rather than relying on the
                                                  * global reduced-motion block: that block sets
                                                  * `animation-iteration-count: 1`, which truncates a loop to
                                                  * one 0.01ms pass and leaves the ring frozen at an arbitrary
                                                  * angle. `animation: none` stops it cleanly, and the ring
                                                  * still reads as a busy indicator because the top border
                                                  * stays weighted.
                                                  */}
                                                <div
                                                    className="size-3.5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground/60 motion-reduce:animate-none"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {discount?.valid && (
                                        <span className="text-xs font-medium text-primary-strong">
                                            {discount.amount_type === 'percent' ? `${discount.amount}% off applied` : `$${((discount.amount ?? 0) / 100).toFixed(2)} off applied`}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <button type="button" onClick={() => setShowCoupon(true)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                    Have a coupon?
                                </button>
                            )}
                        </div>
                        <FullLine />
                    </>
                )}
            </Container>

            {/* Spacer */}
            <div className="h-8 sm:h-10 lg:h-14" />

            {/* Pricing cards */}
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {tiers.map((tier, i) => {
                        /*
                         * One rule per interior boundary: stacked below md, side
                         * by side above it.
                         *
                         * The Free card used to carry `order-last`, so it led on
                         * desktop and sat at the bottom on mobile — a
                         * price-sensitive reader on a phone met "Get Starter" and
                         * "Get Team" before the $0 card whose call to action is
                         * the download this page exists to produce. Reading order
                         * is the same on both now, which also means the border
                         * can be derived from the index instead of from the tier.
                         */
                        const isLast = i === tiers.length - 1;

                        return (
                        <div
                            key={tier.name}
                            className={`border-rule ${isLast ? '' : 'border-b md:border-r md:border-b-0'}`}
                        >
                            <PricingCard tier={tier} cycle={billingCycle} discountCode={discountCode} discount={discount} paymentProvider={paymentProvider} teamMinSeats={teamMinSeats} />
                        </div>
                        );
                    })}
                </div>
            </Container>
            <FullLine />

            {/*
              * Everything below the cards is fine print and a credit. The plan
              * comparison table is `LicenseTable`, above the toggle, because a
              * reader decides what to buy before they decide how to pay.
              */}
            <FootNote>
                7-day money-back guarantee on all paid plans.{' '}
                <a href="/refund-policy" className={PROSE_LINK}>Refund policy</a>
            </FootNote>

            <SponsorRow />
            <FullLine />
        </SectionShell>
    );
}
