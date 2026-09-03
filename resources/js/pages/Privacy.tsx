import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { PageHeader } from '@/components/ui/section-shell';
import { FullLine } from '@/components/ui/full-line';
import { Bullet, ProseBlock } from '@/components/ui/prose-block';
import { PROSE_LINK } from '@/components/ui/prose-link';
import { ITEM_TITLE } from '@/components/ui/grid-cell';

interface Props {
    downloadUrls: { arm64: string; x86_64: string };
}



export default function Privacy({ downloadUrls }: Props) {
    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} />} footer={<Footer />}>
            <SEOHead
                title="Privacy Policy - TablePro"
                description="What TablePro collects, what it doesn't, where your data stays, and your privacy rights under GDPR and CCPA."
                canonical="/privacy"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Privacy', path: '/privacy' },
                ]}
            />
                <PageHeader
                    label="Legal"
                    headline="Privacy Policy"
                    lede="Last updated: May 2026"
                />
<div className="h-6 sm:h-8 lg:h-10" />

                <Container width="md">
                    <FullLine />
                    <div className="p-6 sm:p-8">
                        <p className="text-sm text-muted-foreground">
                            TablePro collects minimal data, never touches your database contents, and lets you opt out of analytics. The codebase is{' '}
                            <a href="https://github.com/TableProApp/TablePro" target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>open source on GitHub</a> under the AGPLv3, so you can verify exactly what is collected and how it is handled.
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            This policy covers the desktop and mobile Application, the Website at tablepro.app, and the account portal at tablepro.app/account.
                        </p>
                    </div>

                    <ProseBlock title="1. Data Controller">
                        <p className="text-sm text-muted-foreground">
                            TablePro is the data controller for personal information described in this policy. For privacy questions, email{' '}
                            <a href="mailto:hello@tablepro.app" className={PROSE_LINK}>hello@tablepro.app</a>.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="2. What We Collect">
                        <h3 className={ITEM_TITLE}>Anonymous usage analytics (desktop app)</h3>
                        <p className="mt-3 text-sm text-muted-foreground">
                            The Application can send anonymous usage analytics. It is{' '}
                            <strong className="text-foreground">enabled by default</strong> and can be turned off in{' '}
                            <strong className="text-foreground">Settings &gt; General &gt; "Share anonymous usage data"</strong>.
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            When enabled, a 24-hour heartbeat sends three things to{' '}
                            <code className="rounded-key bg-muted px-1.5 py-0.5 text-xs text-foreground">https://api.tablepro.app/v1/analytics</code>:
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Anonymous machine ID</strong>: SHA-256 hash of your hardware UUID. The raw UUID is never sent.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Environment</strong>: app version, macOS version, CPU architecture (arm64/x86_64), language.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Usage</strong>: which database engine types you connect to (e.g. "mysql", "postgresql") and the number of open connections.</span></li>
                        </ul>
                        <p className="mt-4 text-sm text-muted-foreground">
                            That's it. No connection details, no hosts, no credentials, no queries, no database contents. All payloads are signed with HMAC-SHA256.
                        </p>

                        <h3 className="mt-8 text-base font-semibold text-foreground">Update checks</h3>
                        <p className="mt-3 text-sm text-muted-foreground">
                            The Application uses{' '}
                            <a href="https://sparkle-project.org" target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>Sparkle</a> to check for updates. This sends your{' '}
                            <strong className="text-foreground">app version</strong>, <strong className="text-foreground">macOS version</strong>, and <strong className="text-foreground">CPU architecture</strong> to our update server. Update checks cannot be disabled separately.
                        </p>

                        <h3 className="mt-8 text-base font-semibold text-foreground">License validation</h3>
                        <p className="mt-3 text-sm text-muted-foreground">
                            If you have entered a paid License Key, the Application sends the License Key to our server when it starts and periodically afterward to confirm it is valid. No other data is sent in that request.
                        </p>

                        <h3 className="mt-8 text-base font-semibold text-foreground">License purchase and account portal</h3>
                        <p className="mt-3 text-sm text-muted-foreground">
                            When you purchase a License Key, our payment processor (LemonSqueezy or Polar, depending on your region) collects the data needed to complete the transaction: your email address, billing address, and payment information. We receive your email, License Key, and order metadata; we do not see your full payment details.
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            The account portal at{' '}
                            <a href="/account" className={PROSE_LINK}>tablepro.app/account</a>{' '}
                            uses magic-link authentication. We store your email and an authentication token for that purpose.
                        </p>

                        <h3 className="mt-8 text-base font-semibold text-foreground">Newsletter and beta signup</h3>
                        <p className="mt-3 text-sm text-muted-foreground">
                            If you subscribe to the newsletter or apply for beta access, we store your email address for that purpose only. You can unsubscribe at any time from any email we send.
                        </p>

                        <h3 className="mt-8 text-base font-semibold text-foreground">Server logs</h3>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Our servers record standard request logs (IP address, user agent, timestamp, URL) for security and abuse prevention. These logs are retained for up to 90 days.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="3. What We Do Not Collect">
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">No database contents or queries</strong>. SQL you write and data you fetch never leave your machine.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">No connection credentials</strong>. Database hosts, usernames, and passwords stay in the macOS Keychain.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">No personal information in the desktop app</strong> beyond the email used at purchase.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">No crash reports</strong> sent to any third party.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">No third-party trackers</strong>. No Google Analytics, Mixpanel, Sentry, or similar SDK in the desktop app.</span></li>
                        </ul>
                    </ProseBlock>

                    <ProseBlock title="4. How We Use Information">
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Anonymous analytics</strong>: understand which app versions, OS versions, and database types our users run, to prioritise compatibility and bug fixes.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">License validation</strong>: confirm a License Key is valid and active.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Updates</strong>: deliver new versions of the Application.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Customer support</strong>: respond to questions and refund requests.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Newsletter and announcements</strong>: only if you subscribed.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Security</strong>: detect abuse and unauthorised access attempts.</span></li>
                        </ul>
                    </ProseBlock>

                    <ProseBlock title="5. Legal Basis (GDPR)">
                        <p className="text-sm text-muted-foreground">For users in the European Economic Area or the United Kingdom, the legal bases under GDPR / UK GDPR are:</p>
                        <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Contract (Art. 6(1)(b))</strong>: processing payment, providing the License Key, account portal access.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Legitimate interest (Art. 6(1)(f))</strong>: anonymous analytics, abuse detection, server logs, retention of business records.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Consent (Art. 6(1)(a))</strong>: newsletter subscriptions, optional features you enable.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Legal obligation (Art. 6(1)(c))</strong>: tax records, responses to lawful requests.</span></li>
                        </ul>
                    </ProseBlock>

                    <ProseBlock title="6. Sharing With Third Parties">
                        <p className="text-sm text-muted-foreground">We share personal data only with the providers needed to operate the Services:</p>
                        <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">LemonSqueezy</strong> or <strong className="text-foreground">Polar</strong>: payment processing for License Key purchases.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Email delivery providers</strong>: transactional emails (magic links, receipts, newsletter). We use providers that do not sell or share contact data.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Hosting providers</strong>: server infrastructure for the Website, account portal, and analytics endpoint.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Plausible Analytics (self-hosted)</strong>: aggregate, cookie-less Website analytics. No personal identifiers, no IP storage.</span></li>
                        </ul>
                        <p className="mt-4 text-sm text-muted-foreground">
                            We do not sell, rent, or share personal data with advertisers.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="7. International Data Transfers">
                        <p className="text-sm text-muted-foreground">
                            Our servers operate in multiple regions. When you interact with TablePro, your data may be transferred to or processed in countries outside your own. Where required, transfers from the EEA / UK rely on Standard Contractual Clauses or other approved mechanisms.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="8. Data Retention">
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Anonymous analytics</strong>: aggregated indefinitely; the SHA-256 machine ID has no link to your identity.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Account and license data</strong>: kept while your license is active and for up to 7 years afterward for tax and audit purposes.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Newsletter subscribers</strong>: until you unsubscribe.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Server logs</strong>: 90 days.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Support emails</strong>: 2 years from the last interaction.</span></li>
                        </ul>
                    </ProseBlock>

                    <ProseBlock title="9. Your Rights">
                        <p className="text-sm text-muted-foreground">
                            Subject to local law, you have the right to:
                        </p>
                        <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Access</strong>: request a copy of personal data we hold about you.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Rectification</strong>: correct inaccurate data.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Erasure</strong>: ask us to delete your data, subject to legal retention obligations.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Restriction</strong>: ask us to limit how we process your data.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Portability</strong>: receive your data in a structured, machine-readable format.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Object</strong>: object to processing based on legitimate interest.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Withdraw consent</strong>: at any time, where processing is based on consent.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Lodge a complaint</strong>: with your local data protection authority.</span></li>
                        </ul>
                        <p className="mt-4 text-sm text-muted-foreground">
                            To exercise any of these rights, email{' '}
                            <a href="mailto:hello@tablepro.app" className={PROSE_LINK}>hello@tablepro.app</a>. We respond within 30 days.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="10. CCPA (California Residents)">
                        <p className="text-sm text-muted-foreground">
                            If you are a California resident, the California Consumer Privacy Act gives you the right to know what personal information we collect, to request deletion, to opt out of "sale" of personal information, and to non-discrimination for exercising these rights. We do not sell personal information.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="11. Children's Privacy">
                        <p className="text-sm text-muted-foreground">
                            TablePro is not directed at children under 16. We do not knowingly collect personal data from children. If you believe a child has provided us data, contact us and we will delete it.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="12. Security">
                        <p className="text-sm text-muted-foreground">
                            We use industry-standard measures to protect data: HTTPS for all network traffic, password hashing with modern algorithms, scoped API tokens, and least-privilege access for our team. No system is perfectly secure; if you suspect a vulnerability, email{' '}
                            <a href="mailto:hello@tablepro.app" className={PROSE_LINK}>hello@tablepro.app</a>.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="13. Website Cookies and Browser Storage">
                        <p className="text-sm text-muted-foreground">
                            The marketing site sets two functional cookies and keeps a few values in your browser's own storage. No advertising, no profiles, no cross-site tracking, and nothing here is sold or handed to an advertiser.
                        </p>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">nl_dismissed_at</strong> (cookie, 90 days): records when you dismissed the newsletter prompt so we don't reshow it. Lawful basis: legitimate interest.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">nl_subscribed</strong> (cookie, 365 days): records that you subscribed so we don't reprompt. Lawful basis: legitimate interest, performance of a subscription you initiated.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">theme</strong> and <strong className="text-foreground">tablepro:banner-dismissed</strong> (local storage, until you clear it): remember whether you chose light or dark, and which announcement bar you closed. Lawful basis: legitimate interest.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">tablepro:attribution</strong> (local storage, 90 days): records how you first reached this site — the campaign tags on the link you followed, or the site that linked to us, and the page you landed on. If you buy a license it is sent with that purchase so we know which writing and which links pay for the work. It holds no identifier of you, it is never read on any other site, and clearing your browser storage removes it.</span></li>
                        </ul>
                    </ProseBlock>

                    <ProseBlock title="14. Local Storage on Your Device">
                        <p className="text-sm text-muted-foreground">Sensitive data stays on your Mac:</p>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Database credentials</strong>: macOS Keychain.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Query history</strong>: local SQLite database.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">App settings</strong>: standard macOS UserDefaults.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">Tab state</strong>: local JSON files for session restore.</span></li>
                        </ul>
                    </ProseBlock>

                    <ProseBlock title="15. Source Code Transparency">
                        <p className="text-sm text-muted-foreground">
                            The Application source is on{' '}
                            <a href="https://github.com/TableProApp/TablePro" target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>GitHub</a> under the AGPLv3. The analytics code is in{' '}
                            <code className="rounded-key bg-muted px-1.5 py-0.5 text-xs text-foreground">TablePro/Core/Services/AnalyticsService.swift</code>. You can verify what is sent.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="16. Changes to This Policy">
                        <p className="text-sm text-muted-foreground">
                            We may update this policy. Material changes will be posted on this page with a new "Last updated" date and, where required by law, notified to users.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="17. Contact">
                        <p className="text-sm text-muted-foreground">
                            For privacy questions, security reports, or anything else, email{' '}
                            <a href="mailto:hello@tablepro.app" className={PROSE_LINK}>hello@tablepro.app</a>.
                        </p>
                    </ProseBlock>

                    <FullLine />
                </Container>

                <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
