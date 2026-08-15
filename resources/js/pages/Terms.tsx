import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { PageHeader } from '@/components/ui/section-shell';
import { FullLine } from '@/components/ui/full-line';
import { Bullet, ProseBlock } from '@/components/ui/prose-block';

interface Props {
    downloadUrls: { arm64: string; x86_64: string };
}



export default function Terms({ downloadUrls }: Props) {
    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} />} footer={<Footer />}>
            <SEOHead
                title="Terms of Service - TablePro"
                description="Terms of Service for TablePro, the native macOS database client. License, liability, and user responsibilities."
                canonical="/terms"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Terms', path: '/terms' },
                ]}
            />
                <PageHeader
                    label="Legal"
                    headline="Terms of Service"
                    lede="Last updated: May 2026"
                />
<div className="h-6 sm:h-8 lg:h-10" />

                <Container width="md">
                    <FullLine />
                    <div className="p-6 sm:p-8">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            These Terms of Service govern your use of TablePro, the website at{' '}
                            <a href="https://tablepro.app" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong">tablepro.app</a>,
                            the desktop application, the iOS application, and any related services. By downloading, installing, accessing, or using
                            any part of TablePro, you agree to these Terms. If you do not agree, do not use TablePro.
                        </p>
                    </div>

                    <ProseBlock title="1. Definitions">
                        <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">"TablePro", "we", "us", "our"</strong> refers to the TablePro project and its maintainers.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">"Application"</strong> means the TablePro desktop and mobile software, including all updates and plugins.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">"Website"</strong> means tablepro.app, docs.tablepro.app, and any related domains we operate.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">"Services"</strong> means the Website, account portal, update server, and analytics endpoint.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">"License Key"</strong> means the credential that activates paid features in the Application.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span><strong className="text-foreground">"You", "your"</strong> means the individual or entity using the Application or Services.</span></li>
                        </ul>
                    </ProseBlock>

                    <ProseBlock title="2. Open Source License (Free Use)">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            The Application source code is licensed under the{' '}
                            <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong">GNU Affero General Public License v3 (AGPLv3)</a>.
                            You may use, modify, and distribute it under those terms. The full license text is at{' '}
                            <a href="https://github.com/TableProApp/TablePro/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong">github.com/TableProApp/TablePro/LICENSE</a>.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            The free tier covers core functionality and is enough for most personal and commercial use. No registration is required to use the free tier.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="3. Commercial License (Paid Features)">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Some advanced features require a paid License Key. When you purchase a License Key, you receive a non-exclusive, non-transferable right to enable those features for the number of devices and the duration covered by your plan.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            License Keys are personal. You may not share, sublicense, sell, rent, or otherwise transfer a License Key to any third party. Sharing a License Key may result in immediate termination without refund.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Refund eligibility is described in the{' '}
                            <a href="/refund-policy" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong">Refund Policy</a>.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="4. Account and Security">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            License Keys are managed through an account portal accessed by magic link sent to the email address you used at purchase. You are responsible for keeping that email account secure. We are not responsible for unauthorized access to your account caused by a compromised email account.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="5. Acceptable Use">
                        <p className="text-sm leading-relaxed text-muted-foreground">You agree not to:</p>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span>Use the Application or Services in violation of any law or third-party right.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span>Reverse engineer or circumvent license enforcement on paid features beyond what AGPLv3 explicitly permits.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span>Attempt to gain unauthorized access to our infrastructure or other users' accounts.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span>Use the Services to transmit malware or carry out denial-of-service attacks.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span>Resell or redistribute License Keys without our written permission.</span></li>
                        </ul>
                    </ProseBlock>

                    <ProseBlock title="6. Your Responsibilities">
                        <p className="text-sm leading-relaxed text-muted-foreground">You are solely responsible for:</p>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                            <li className="flex items-start gap-2"><Bullet /><span>Securing your database credentials and License Keys.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span>Backing up your data before running queries through the Application.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span>Having authorization to access the databases you connect to.</span></li>
                            <li className="flex items-start gap-2"><Bullet /><span>Following applicable laws when using the Application and Services.</span></li>
                        </ul>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            You acknowledge and agree that your use of the Application can affect your databases, and you accept{' '}
                            <strong className="text-foreground">sole responsibility for any errors, malfunctions, or corruption of any database</strong> caused by your use of the Application, including queries you run, scripts you execute, and changes you commit.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="7. Disclaimer of Warranties">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            THE APPLICATION AND SERVICES ARE PROVIDED <strong className="text-foreground">"AS IS"</strong> AND <strong className="text-foreground">"AS AVAILABLE"</strong> WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR UNINTERRUPTED OPERATION.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            We do not warrant that the Application will meet your requirements, be compatible with any specific database version, operate without error, or that any errors will be corrected.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="8. Limitation of Liability">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL TABLEPRO OR ITS CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO: LOSS OF DATA, LOSS OF DATABASE CONTENTS, DATA CORRUPTION, LOSS OF PROFITS, LOSS OF BUSINESS, BUSINESS INTERRUPTION, LOSS OF GOODWILL, OR THE COST OF SUBSTITUTE GOODS OR SERVICES, ARISING OUT OF OR RELATED TO YOUR USE OF THE APPLICATION OR SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Where liability cannot be disclaimed under applicable law, our total cumulative liability for all claims arising from or related to the Application and Services is limited to the <strong className="text-foreground">greater of (a) ten US dollars ($10) or (b) the total amount you paid us during the twelve (12) months preceding the event giving rise to the claim</strong>.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability is limited to the minimum extent permitted by law.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="9. Indemnification">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            You agree to indemnify and hold harmless TablePro and its contributors from any claim, demand, loss, or damage (including reasonable legal fees) arising out of your use of the Application or Services in violation of these Terms or any third-party right.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="10. Updates and Maintenance">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            We may release updates, fixes, and new features at our discretion. We have no obligation to maintain, update, or provide support for any version of the Application. Older versions may stop receiving security updates.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Some Services (license validation, update checks) require network access to function. We do not guarantee continuous availability of these Services and may discontinue them with reasonable notice.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="11. Termination">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            You may stop using the Application and Services at any time. We may suspend or terminate your access to paid features without refund if you breach these Terms, including the Acceptable Use clause.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Sections that by their nature survive termination (Disclaimer, Limitation of Liability, Indemnification, Governing Law) will continue to apply after termination.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="12. Privacy">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Our handling of personal data is described in the{' '}
                            <a href="/privacy" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong">Privacy Policy</a>. By using the Application or Services, you agree to that policy.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="13. Changes to These Terms">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            We may update these Terms from time to time. Material changes will be announced on this page with a new "Last updated" date. Continuing to use the Application or Services after the update means you accept the new Terms.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="14. Governing Law and Dispute Resolution">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            These Terms are governed by the laws of the Socialist Republic of Vietnam, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms or your use of the Application or Services shall be resolved in the competent courts of Vietnam.
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            If you reside in a jurisdiction with mandatory consumer protection laws, those laws apply to the extent they cannot be waived.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="15. Severability">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            If any provision of these Terms is held invalid or unenforceable by a court of competent jurisdiction, the remaining provisions remain in full force and effect.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="16. Entire Agreement">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            These Terms, together with the AGPLv3 license, the Privacy Policy, and the Refund Policy, constitute the entire agreement between you and TablePro regarding the Application and Services and supersede any prior agreements.
                        </p>
                    </ProseBlock>

                    <ProseBlock title="17. Contact">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            For questions about these Terms, email{' '}
                            <a href="mailto:hello@tablepro.app" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong">hello@tablepro.app</a>{' '}
                            or open an issue at{' '}
                            <a href="https://github.com/TableProApp/TablePro/issues" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong">github.com/TableProApp/TablePro/issues</a>.
                        </p>
                    </ProseBlock>

                    <FullLine />
                </Container>

                <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
