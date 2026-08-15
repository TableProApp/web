import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Container from '@/components/ui/container';
import { AccentLine, FullLine } from '@/components/ui/full-line';
import { Ledger, LedgerRow } from '@/components/ui/ledger';

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
    description: string;
    price: 'free' | { monthly: number; yearly: number; lifetime: number };
    featured: boolean;
    summary?: string;
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

function buildTiers(teamMinSeats: number): Tier[] {
    return [
        {
            key: 'free',
            name: 'Free',
            description: 'Everything to get started',
            price: 'free',
            featured: false,
            summary: 'The full app. All 25 databases. Every Mac you own.',
            cta: 'Download',
            ctaHref: '/download',
        },
        {
            key: 'starter',
            name: 'Starter',
            description: 'For people who use it every day',
            price: { monthly: 2.99, yearly: 24, lifetime: 59 },
            featured: true,
            includesFrom: 'Free',
            features: [
                'iCloud Sync across your Macs',
                '2 Mac activations',
                'Encrypted connection export',
                'Environment variables in connection fields',
            ],
            cta: 'Get Starter',
        },
        {
            key: 'team',
            name: 'Team',
            description: 'For teams and organizations',
            price: { monthly: 1.25, yearly: 10, lifetime: 25 },
            featured: false,
            includesFrom: 'Starter',
            features: [
                `Priced per seat, from ${teamMinSeats} seats`,
                'Team Catalog: publish connections to a shared folder',
                'Team Library: share connections and saved queries',
                'Passwords are never sent',
                'Priority support',
            ],
            cta: 'Get Team',
        },
    ];
}

/**
 * Deliberately short. A table of rows that are checked in all three columns
 * makes the free tier look finished and gives nobody a reason to pay; these are
 * the rows that actually differ, plus enough context to show how little does.
 */
const comparisonFeatures = [
    { name: 'All 25 databases', free: true, pro: true, team: true },
    { name: 'SQL editor, data grid, AI assistant, MCP server', free: true, pro: true, team: true },
    { name: 'Safe Mode, Touch ID, SSH tunnels', free: true, pro: true, team: true },
    { name: 'Import and export, including XLSX', free: true, pro: true, team: true },
    { name: 'License activations', free: 'No license needed', pro: '2 Macs', team: '5 minimum, then per seat' },
    { name: 'iCloud Sync', free: false, pro: true, team: true },
    { name: 'Encrypted connection export and environment variables', free: false, pro: true, team: true },
    { name: 'Team Catalog and Team Library', free: false, pro: false, team: true },
    { name: 'Priority support', free: false, pro: false, team: true },
];

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className ?? 'size-4 text-primary-strong'}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    );
}

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
     */
    async function handleCheckout() {
        if (isFree) return;
        setIsLoading(true);
        try {
            const body: Record<string, string> = { tier: tier.key, cycle };
            const trimmed = discountCode.trim();
            if (trimmed) body.discount_code = trimmed;
            if (isTeam) body.seats = String(seats);
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
        <div className={`flex h-full flex-col border-gray-950/5 p-6 dark:border-white/10 sm:p-8 ${tier.featured ? 'bg-primary/[0.03]' : ''}`}>
            <div>
                <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
            </div>

            <div className="mt-4">
                {isFree ? (
                    <span className="text-4xl font-bold tracking-tight text-foreground">$0</span>
                ) : (() => {
                    const cycleSuffixUsd = cycle === 'monthly' ? '/mo' : cycle === 'yearly' ? '/year' : ' once';

                    return discountedPrice !== null ? (
                        <>
                            <span className="text-4xl font-bold tracking-tight text-foreground">${discountedPrice}</span>
                            <span className="ml-2 text-lg text-muted-foreground line-through">${price}</span>
                            <span className="ml-1 text-sm text-muted-foreground">{cycleSuffixUsd}</span>
                        </>
                    ) : (
                        <>
                            <span className="text-4xl font-bold tracking-tight text-foreground">${price}</span>
                            <span className="ml-1 text-sm text-muted-foreground">{cycleSuffixUsd}</span>
                        </>
                    );
                })()}
            </div>

            {isTeam && !isFree && (
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">${unitPrice}/seat</span>
                    <div className="flex items-center rounded-full border border-gray-950/10 dark:border-white/10">
                        <button
                            type="button"
                            onClick={() => setSeats((s) => Math.max(teamMinSeats, s - 1))}
                            className="px-3 py-1 text-lg leading-none text-muted-foreground hover:text-foreground disabled:opacity-40"
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
                            className="px-3 py-1 text-lg leading-none text-muted-foreground hover:text-foreground disabled:opacity-40"
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
                    <a href={tier.ctaHref} className={`inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all ${tier.featured ? 'bg-primary text-primary-foreground hover:opacity-90' : 'border border-gray-950/5 text-foreground hover:bg-gray-950/[2.5%] dark:border-white/10 dark:hover:bg-white/[2.5%]'}`}>
                        {tier.cta}
                    </a>
                ) : (
                    <button type="button" onClick={handleCheckout} disabled={isLoading} className={`inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all ${tier.featured ? 'bg-primary text-primary-foreground hover:opacity-90' : 'border border-gray-950/5 text-foreground hover:bg-gray-950/[2.5%] dark:border-white/10 dark:hover:bg-white/[2.5%]'} ${isLoading ? 'cursor-wait opacity-60' : ''}`}>
                        {isLoading ? 'Loading...' : tier.cta}
                    </button>
                )}
            </div>

            <div className="mt-6">
                {tier.summary ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {tier.summary}
                    </p>
                ) : (
                    <>
                        {tier.includesFrom && (
                            <p className="mb-3 text-sm font-medium text-foreground">
                                Everything in {tier.includesFrom}, plus:
                            </p>
                        )}
                        <ul className="space-y-2.5">
                            {tier.features?.map((feature) => (
                                <li key={feature} className="flex items-start gap-2.5">
                                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary-strong" />
                                    <span className="text-sm text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
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
        <section id="pricing" aria-labelledby="pricing-heading" className="scroll-mt-20">
            <div className="h-12 sm:h-16 lg:h-24" />

            {/* Label */}
            <Container>
                <AccentLine />
                <p className="pl-4 font-mono text-xs font-semibold tracking-widest text-primary-strong uppercase">
                    Pricing
                </p>
                <FullLine />
            </Container>

            {/* Spacer */}
            <div className="h-4" />

            {/* Headline */}
            <Container>
                <FullLine />
                <h2 id="pricing-heading" className="pl-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    The app is free.
                    <br />
                    <span className="text-muted-foreground">The license funds it.</span>
                </h2>
                <FullLine />
            </Container>
            <div className="h-2" />
            <Container>
                <FullLine />
                <p className="max-w-3xl pl-4 text-base text-muted-foreground">
                    Starter is per person. Team is per seat, from {teamMinSeats} seats. Yearly saves 33 percent.
                    Lifetime pays for itself against yearly in about two and a half years.
                </p>
                <FullLine />
            </Container>

            {/* What a license actually buys. Stated before the prices, on purpose. */}
            <div className="h-4" />
            <Container>
                <FullLine />
                <Ledger>
                    <LedgerRow label="iCloud Sync">
                        Connections, groups, tags, SSH profiles, favorites, saved queries and settings on every Mac you
                        own. Passwords go through iCloud Keychain as a separate opt in.
                    </LedgerRow>
                    <LedgerRow label="A second Mac">
                        Starter activates two. Team activates {teamMinSeats}, then one per purchased seat.
                    </LedgerRow>
                    <LedgerRow label="Team catalog and library">
                        Publish connection definitions and saved queries to your team. Passwords are never sent, so
                        everyone supplies their own.
                    </LedgerRow>
                </Ledger>
                <FullLine />
            </Container>

            {/* Billing toggle */}
            <div className="h-4" />
            <Container>
                <FullLine />
                <div className="flex items-center justify-center overflow-x-auto py-4">
                    <div className="inline-flex items-center rounded-full border border-gray-950/5 bg-gray-950/[0.02] p-1 dark:border-white/10 dark:bg-white/[0.03]">
                        {cycles.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setBillingCycle(c.value)}
                                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                                    billingCycle === c.value
                                        ? 'bg-foreground text-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {c.label}
                                {c.badge && (
                                    <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-strong">
                                        {c.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <FullLine />
                <p className="px-4 py-3 text-center font-mono text-xs text-muted-foreground">
                    $24 a year, or $59 once. Lifetime pays for itself in two and a half years.
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
                                            className={`w-48 rounded-lg border bg-transparent px-3 py-1.5 text-center text-sm text-foreground placeholder:text-muted-foreground/50 ${
                                                discount?.valid
                                                    ? 'border-primary/50 focus:border-primary'
                                                    : 'border-gray-950/5 focus:border-primary/50 dark:border-white/10'
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
            <div className="h-6 sm:h-8 lg:h-10" />

            {/* Pricing cards */}
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {tiers.map((tier, i) => {
                        const isFree = tier.price === 'free';
                        return (
                        <div key={tier.name} className={`
                            border-gray-950/5 dark:border-white/10
                            ${isFree ? 'order-last md:order-first md:border-r' : ''}
                            ${!isFree ? 'border-b md:border-b-0 md:border-r' : ''}
                            ${i === tiers.length - 1 ? 'md:border-r-0' : ''}
                        `}>
                            <PricingCard tier={tier} cycle={billingCycle} discountCode={discountCode} discount={discount} paymentProvider={paymentProvider} teamMinSeats={teamMinSeats} />
                        </div>
                        );
                    })}
                </div>
            </Container>
            <FullLine />

            {/* Refund note */}
            <Container>
                <p className="py-4 pl-4 text-sm text-muted-foreground">
                    7-day money-back guarantee on all paid plans.{' '}
                    <a href="/refund-policy" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong">Refund policy</a>
                </p>
                <FullLine />
                <p className="py-4 pl-4 text-sm text-muted-foreground">
                    If you use TablePro at work, buy a license. If you cannot afford one, the free version is not
                    going anywhere.
                </p>
            </Container>

            {/* Plan comparison */}
            <div className="h-6 sm:h-8 lg:h-10" />

            <Container>
                <FullLine />
                <h3 className="pl-4 text-2xl font-bold tracking-tight text-foreground">
                    Compare plans
                </h3>
                <FullLine />
            </Container>

            <div className="h-6" />

            {/* Comparison table */}
            <FullLine />
            <Container>
                {/*
                  * tabindex/role/label because this scrolls and contains no
                  * focusable descendant: below ~500px a keyboard user could not
                  * reach the Starter and Team columns at all.
                  */}
                <div
                    className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"
                    tabIndex={0}
                    role="region"
                    aria-label="Plan comparison"
                >
                    <div className="min-w-[500px]">
                        {/* Header */}
                        <div className="grid grid-cols-4">
                            <div className="border-gray-950/5 p-4 dark:border-white/10 sm:p-5">
                                <span className="text-sm font-medium text-muted-foreground">Feature</span>
                            </div>
                            <div className="border-l border-gray-950/5 p-4 text-center dark:border-white/10 sm:p-5">
                                <span className="text-sm font-medium text-muted-foreground">Free</span>
                            </div>
                            <div className="border-l border-gray-950/5 bg-primary/5 p-4 text-center dark:border-white/10 sm:p-5">
                                <span className="text-sm font-bold text-primary-strong">Starter</span>
                            </div>
                            <div className="border-l border-gray-950/5 p-4 text-center dark:border-white/10 sm:p-5">
                                <span className="text-sm font-medium text-muted-foreground">Team</span>
                            </div>
                        </div>

                        {/* Rows */}
                        {comparisonFeatures.map((row) => (
                            <div key={row.name} className="grid grid-cols-4 border-t border-gray-950/5 dark:border-white/10">
                                <div className="p-4 sm:p-5">
                                    <span className="text-sm text-foreground">{row.name}</span>
                                </div>
                                {(['free', 'pro', 'team'] as const).map((tier) => {
                                    const value = row[tier];
                                    return (
                                        <div key={tier} className={`flex items-center justify-center border-l border-gray-950/5 p-4 dark:border-white/10 sm:p-5 ${tier === 'pro' ? 'bg-primary/5' : ''}`}>
                                            {typeof value === 'string' ? (
                                                <span className="text-sm font-medium text-foreground">{value}</span>
                                            ) : value ? (
                                                <CheckIcon />
                                            ) : (
                                                <span className="text-sm text-muted-foreground" aria-label="not included">&mdash;</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
            <FullLine />
        </section>
    );
}
