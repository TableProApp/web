---
title: Privacy policy
description: What TablePro collects, why it is used, who receives it, how long it stays, and your choices and rights.
updatedAt: "2026-11-07"
---

This policy covers TablePro for Mac, Linux, iPhone and iPad; tablepro.app; docs.tablepro.app; and our account, purchase, support and newsletter services. The [technical inventory](https://docs.tablepro.app/security/privacy) lists app fields, endpoints and controls. The apps' source is in the [public repository]({github}).

## In brief {#summary}

Ordinary database queries and results travel between your device and your database. Usage data contains no SQL, rows or credentials. Content you choose to publish to Team Library, send to support, or share with AI and external tools is different: those recipients receive it.

Mac and Linux usage data is on by default, with an off switch. The shipped iPhone and iPad app sends its usage report only after you opt in. Direct app analytics can link to your account and purchases. Turning it off does not stop account traffic or server analytics.

The website uses page analytics and loads Crisp chat on every page. Google Analytics cookies need your choice. Newsletters measure opens and clicks. Account deletion leaves some records, including data at PostHog and Crisp. Read [retention](#retention) and [your rights](#rights) before choosing. The [controller](#controller) handles privacy requests, including requests without an account.

<span id="contact"></span>

## Who is responsible {#controller}

{publisherName}, an individual developer in {publisherCountry}, is the controller for the personal data described here. Contact [{email}](mailto:{email}). We have no data protection officer. For teams, we manage account, invitation and service records as controller. We process published Team Library content on the team's instructions; the team decides what to publish and who has access.

<span id="lawful-basis"></span>

## What we collect and why {#data-use}

For the EEA and UK, the lawful basis is stated with each purpose: contract (Article 6(1)(b)), legitimate interest (6(1)(f)), consent (6(1)(a)) or legal obligation (6(1)(c)). We make no automated decisions with legal or similarly significant effects.

<span id="mac-account"></span>

### Accounts and devices {#account}

Free local use works without an account. Account services need your email address. We keep your name and language, sign-in methods, licenses, orders, devices, team roles and seats. Mac and Linux device registration sends a machine identifier, device name, platform and app/OS versions. A device name can contain your name. This is separate from usage data. The purpose and basis are providing your account and plan under contract.

Sign-in uses emailed links and codes, passkeys, or Apple, GitHub or Google. Passkey records include a public key, name, sync status and use dates. Identity providers supply an ID and verified email; Apple can also supply your name. An Apple token is encrypted and revoked when you unlink it or delete the account. We record account changes with the request's IP address and user agent. Our legitimate interest is securing accounts and investigating abuse.

The [account portal]({account}) lets you edit your profile and sign-in methods, manage devices, export account data as JSON, and delete your account. Deletion is unavailable while you own a team with other members. It ends subscriptions without a refund. [Retention](#retention) explains what remains.

### Purchases {#purchases}

{merchant} (Polar Software, Inc.) is the merchant of record and reseller. It collects your name, email, billing address and payment details under its own terms. It handles payment, tax, receipts and disputes. We never receive full card details.

We send the purchase, language, visit source and IP address for checkout, tax and currency. We receive buyer and billing details, amounts, order/subscription IDs, renewals, cancellations and refunds. Orders keep email, billing country, amounts and visit attribution. A guest purchase creates an unverified account for its email if none exists. Cancellation reasons and comments go to {merchant} and stay with the subscription. Processing fulfils the purchase contract; tax and accounting records meet legal obligations. Without the required details, checkout cannot complete. Manage billing in [{merchant}'s portal]({portal}); see [terms](/terms) and [refunds](/refund-policy).

### Teams and shared content {#library}

An inviter supplies an email, role and seat choice. Owners and admins see member names and emails, invitations and team changes, including invited addresses, but no audit IP addresses or browsers. Members see the team, plan, seat counts and their own role. We use these records to provide the team service under contract.

On Mac, publishing to Team Library sends connection settings and saved queries to our server for members with access. Settings include host, port, database, username, SSH/SSL options, startup commands, Tunnel Command and AI settings. Queries include names, SQL text, keywords and folders. Structured password fields are excluded; secrets typed into SQL or other free text are not removed. The library shows who last changed an item. Leaving a team does not by itself erase its shared content. See [deletion timing](#retention). Team Catalog instead writes files to a shared folder you choose.

### Usage and service analytics {#analytics}

Our legitimate interest is understanding use, fixing problems and measuring purchases. Mac and Linux send the usage data described under [Your apps](#apps). Our server also sends PostHog events about sign-ins, purchases, devices and teams, with account IDs but no names or email addresses. These IDs link app use to service activity. The app switch stops app usage events; it does not stop required account requests or these server events. Use [your rights](#rights) to object or request erasure.

### Newsletter and email {#newsletter}

Amazon SES sends sign-in codes, invitations, account notices and newsletters. Service emails fulfil your requested service. New newsletter subscriptions need confirmation and rely on consent. We keep the address, language, signup and confirmation dates, IP addresses, user agents, signup page and consent wording version.

Every newsletter measures every recipient's opens and clicks through an image and `links.news.tablepro.app`. Amazon SES receives the time, link clicked, IP address and user agent, then sends them to our server for counts. Blocking images stops open measurement, not click measurement. Unsubscribe and email links are not tracked. There is no separate switch for measurement. Unsubscribe in the newsletter or through your mail app's one-click control to stop newsletters; no confirmation email follows. Subscribing again needs confirmation. Permanent bounces and spam reports stop further mail. Request address deletion through [contact](#controller).

The previous server's list carried over every address that had not unsubscribed, confirmed or not, including buyers, license holders and beta signups. Unsubscribed addresses stayed unsubscribed; bounced and complained addresses entered the suppression list. [Retention](#retention) covers these records.

### Support {#support}

Messages, attachments and diagnostics you send reach us and the support service you use. They can contain database content or secrets you include. Crisp receives IP addresses, browser details and pages viewed when chat loads on the website and portal. It keeps the IP if you start a conversation. We supply the page language and, in the signed-in portal, your account email and ID. Loading chat on every page serves our legitimate interest in providing support. Conversations you start rely on consent.

## Your apps {#apps}

| App and version | Usage data | Control |
| --- | --- | --- |
| Mac 0.86.0, starting with 0.86.0-beta.1 | Direct to PostHog; on by default | Settings > General > Privacy |
| Linux from 0.1.0-beta.1 | Direct to PostHog; on by default | Preferences > General > Privacy |
| Shipped iPhone and iPad app | Report through our server; off until you opt in | Settings > Privacy |

<span id="mac-local"></span>

### Data on your device {#local-data}

Connection lists, query history, local logs and open tabs stay on the device unless you choose a sharing feature. Database traffic goes to your chosen servers. Passwords use the platform's credential store. On Mac, SSH keys are referenced where they are on disk. Usage analytics never includes hostnames, usernames, SQL, rows or credentials. Sharing through [integrations](#integrations), Team Library or support has the exceptions described here.

### Mac {#mac-app}

The following direct analytics and account behavior starts with 0.86.0, including 0.86.0-beta.1. Signing in registers the Mac and fetches your plan. Its account token stays in that Mac's Keychain and never syncs through iCloud Keychain. An existing license key is exchanged for a sign-in and then deleted locally.

#### Mac usage data {#mac-usage-report}

It is on by default, and the app does not ask before sending the first event. Turn off **Share usage data** in **Settings > General > Privacy**. Starting with it off does not start PostHog's library. No automatic crash reports are sent; PostHog's crash reporter is disabled.

Events cover daily use with open connection types/count, your first connection attempt, successful connection and first query by database type, paid-feature gates and their reasons, upgrade clicks, sign-in method/sign-out, and license-ask displays and answers. PostHog adds device, screen, network, session, app and system context. It receives your IP address and derives rough location. Before sign-in, events use a random installation ID without a person profile. After sign-in they use your account ID, with a profile holding app/OS versions, architecture, language and derived location. Sign-out starts a new random ID. See the [field and endpoint inventory](https://docs.tablepro.app/security/privacy#usage-data).

#### Updates and plugins {#mac-updates}

The app fetches its update feed and plugin catalog from GitHub through updates.tablepro.app. Downloads and plugin download counts also reach GitHub. Requests carry an IP address and user agent. Turn off **Automatically check for updates** in **Settings > General > Software Update** to stop automatic update checks. The plugin catalog has no off switch. [Technical details](https://docs.tablepro.app/security/privacy#update-checks) include the old feed used by earlier builds.

#### Older Mac versions {#mac-license}

Before 0.86.0, usage data uses a report to our server under the same default-on switch. It contains a hashed machine ID, system/app details, open connection types/count, license status and first connection attempt/success dates. Update settings are sent but discarded by the server. The current server relays it to PostHog with Cloudflare's country, without an IP address or license key, and without a person profile. The machine ID can link it to account devices. No dedicated heartbeat history is kept now, but processing jobs, logs, backups and the old archive can retain data. See [retention](#retention).

Older builds contact the license service only after you enter a key. Checks send that key, machine ID, Mac name and app/OS versions. Device records belong to the account; activation and deactivation are audited with IP and user agent. [The technical inventory](https://docs.tablepro.app/security/privacy#older-mac-reports) keeps fields and timing.

### iPhone and iPad {#ios-app}

The shipped app sends no usage report until you enable **Share Usage Data** at first launch or in **Settings > Privacy**. Consent is the basis. A daily report goes through our server, which relays it without its IP to PostHog, with Cloudflare's country and no person profile. It contains a hashed Apple device identifier, platform, app/iOS versions, architecture, language, open connection types/count and first attempt, successful connection and first query dates. It always reports no license; it has no update settings. It checks neither accounts nor licenses, updates or plugins.

Database and SSH connections, optional iCloud sync and Microsoft Entra sign-in for SQL Server send data to those services. Passwords and pasted SSH keys stay in Keychain; certificates and query history stay on the device. Connections enter its local Spotlight index. A running query's Live Activity can show SQL on the Lock Screen unless Hide Query is enabled. Separately, Apple's Share With App Developers setting can send us crash reports and usage statistics through App Store Connect. The app itself has no crash reporter or third-party analytics library. See [iOS details](https://docs.tablepro.app/ios#privacy).

### Linux {#linux-app}

From 0.1.0-beta.1, signing in registers the device as described under [accounts](#account). Secrets use the desktop keyring. Package-manager updates follow your chosen distributor's settings. The app sends no automatic crash reports.

#### Linux usage data {#linux-usage-data}

Usage data is on by default from 0.1.0-beta.1. Turn off Share usage data in Preferences > General > Privacy. Events go directly to PostHog EU: daily use with open connection types/count, first connection attempt/success and first query by type, sign-in/out, upgrade clicks, and license-ask displays/Buy responses. They carry installation or account IDs, app/system versions, architecture, interface language and SDK metadata. PostHog receives the IP address and derives rough location. Before sign-in there is a random installation ID and no person profile; after sign-in, the account profile links use to purchases. Sign-out resets the ID. No hostname, SQL, rows or credentials enter these events. Device registration separately includes the hostname.

Turning it off stops new usage sends. A request already in flight can finish. It does not erase earlier events or stop account requests and server analytics. See [retention](#retention), [rights](#rights) and the [technical inventory](https://docs.tablepro.app/security/privacy#linux-usage-data).

<span id="mac-third-parties"></span>

## Services you choose {#integrations}

Your database, SSH and proxy providers receive the traffic you request, directly from the app. Connection sign-in services receive authentication requests when configured. Apple Maps supplies map tiles; DuckDB supplies extensions used by queries. Downloaded connection and AI helpers contact their providers. These services operate under their own terms.

### iCloud and Handoff {#icloud}

Optional iCloud Sync stores connections, groups, tags, settings, saved queries and SSH profiles in your private CloudKit database. On Mac, it also syncs table/database favorites and folders, and credential profile names, usernames and password modes, never the profile password. Apple hosts it; we cannot read it. Password sync is a separate, default-off choice using end-to-end encrypted iCloud Keychain. On Mac it also applies to other secrets written through that store, such as AI keys and older license keys. Account tokens never sync. Mac sync needs Pro or Team; iOS sync is free. Handoff passes a connection ID and table name, or the connection name/host when no table is open, between your Apple devices. It sends no credentials. See [sync controls](https://docs.tablepro.app/features/icloud-sync).

### AI and external tools {#ai-tools}

AI requests go directly to your chosen provider or local model. Prompts, schema, current SQL and conversation content can be sent. Attaching grid result rows is off by default. Results returned by an authorized AI query tool also enter the conversation and reach the provider, independently of that attachment switch. GitHub Copilot downloads a helper from npm and its Send telemetry to GitHub choice starts on.

MCP is off by default and cannot start while disabled, even through a bridge or pairing request. When enabled, authenticated clients can request data under the permissions you grant. A connected AI client can send results to its own service. External MCP servers receive approved tool arguments. See [AI and MCP controls](https://docs.tablepro.app/security/privacy#ai-providers).

## Websites and browser storage {#website}

Our server and Cloudflare receive IP addresses, user agents and requested pages. Cloudflare Web Analytics counts page views, referrers, load times, browser/OS/device categories and countries without browser storage or fingerprinting. Our legitimate interest is understanding site use and maintaining it.

Google Analytics loads in Consent Mode. Before Allow, it sends a cookieless page signal without a stored device ID. Consent enables cookies and visit, download and checkout measurement. Advertising storage, personalization and ad user data are always denied. Google states GA4 does not store IP addresses.

Crisp loads on every website and portal page, as described under [support](#support). Pointing at or tabbing to Buy loads {merchant}'s script from jsDelivr, which receives IP and browser details; clicking opens checkout. Starting the newsletter form loads Cloudflare Turnstile for abuse prevention, our legitimate interest. Country lookups and the device time zone help suggest language and regional discounts under legitimate interest; lookup requests omit cookies and their answers are not stored on the page.

The first visit creates `tablepro:attribution` for 90 days: link tags/referrer, landing page and date. At checkout, our server passes the source of the visit to {merchant} as metadata of the checkout, keeps it with the order and sends it to PostHog with checkout/payment events. The landing page and date are not kept. The basis is legitimate interest in measuring purchase sources. Public newsletter, checkout and discount requests omit credentials and set no portal cookie. The portal runs no analytics script, but its server sends service events.

### Documentation site {#docs}

Mintlify hosts docs.tablepro.app. Page, Google Fonts and GitHub star-count requests disclose IP and browser details to those providers. The docs ask separately for analytics consent. Before Allow, no analytics cookies or visitor ID are stored there. Allow enables Google Analytics and Mintlify's visitor ID. Cookie settings in the docs footer withdraws that choice and removes them. The website's choice does not cross to that origin.

### Cookies and storage {#cookies}

Cloudflare Web Analytics stores nothing in the browser. Public-site pages set no first-party cookies. The following storage has its own lifetime, separate from provider retention. Storage marked necessary keeps sign-in or your choice working; consent and legitimate-interest purposes are as described here.

| Name/service | Purpose and trigger | Lifetime and control |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | Google Analytics, only after analytics consent | Up to 2 years; declining deletes them |
| `tablepro:analytics-consent` | Necessary record of your choice; separate on website and docs | Until cleared |
| `tablepro:attribution` | First-visit source sent with checkout; legitimate interest | 90 days |
| `theme`, `tablepro:language`, `tablepro:campaign-closed`, `tablepro:linux-install` | Appearance, chosen/dismissed languages, closed sale notice and chosen Linux install method; legitimate interest | Until cleared; portal theme is separate |
| `mintlify_anonymous_id` | Docs visitor ID, only after consent there | Until cleared or consent declined |
| `crisp-client/` cookies | Chat continuity on every page after chat loads; legitimate interest | 6 months, renewed on return |
| `__Host-tp_session` | Necessary portal sign-in | 30 days signed in; at most 10 minutes during sign-in; sign-out deletes it |
| `locale`, `context`, `sign-in-return-to` | Portal language, Personal/team view, return page; legitimate interest | First two until cleared; return page 15 minutes |

Change analytics consent with Cookie settings in the footer or here:

<cookie-settings></cookie-settings>

## Who receives data {#sharing}

| Recipient | Data and purpose |
| --- | --- |
| [OVH]({ovhPrivacy}) | Hosts our server and service records |
| [Cloudflare]({cloudflarePrivacy}) | DNS/proxy traffic, R2 storage and backups, Turnstile, Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | Amazon SES emails, delivery and newsletter engagement; CloudFront tracking links, SNS/SQS delivery events |
| [PostHog EU]({posthogPrivacy}) | App and server analytics; account IDs, no names/emails; direct requests include IP addresses |
| [{merchant}]({merchantPrivacy}) | Independent merchant of record; checkout, billing and purchase records |
| [Crisp]({crispPrivacy}) | Chat, browser/page data and signed-in account identity |
| [Google]({googlePrivacy}) | Website/docs analytics and docs fonts; account sign-in when selected |
| [Mintlify]({mintlifyPrivacy}) | Docs hosting and consented visitor measurement |
| [GitHub]({githubPrivacy}) | Downloads, updates, plugins, docs star count, public issues and optional account sign-in |
| [Apple]({applePrivacy}) | Optional account sign-in; Apple services and diagnostics described under apps/integrations |
| [jsDelivr]({jsdelivrPrivacy}) | Checkout script requests with IP and browser details |

Members of a team receive shared content and the account details their role permits. Chosen integrations receive the data you direct to them. We do not sell personal data or share it for advertising. Other disclosure occurs only where law requires it. Providers' own privacy policies also apply to their services.

## Where data is processed {#transfers}

Our OVH server and Amazon SES are in Singapore (`ap-southeast-1` for SES). PostHog is in the EU. Crisp is based in France. {publisherName} operates from Vietnam. US providers, including {merchant}, Google, GitHub, Cloudflare, Amazon Web Services and Mintlify, process data in the US. Provider storage and backups can involve countries outside yours. Required EEA/UK safeguards rely on each provider's Standard Contractual Clauses or other approved mechanisms; Google also uses the EU-US Data Privacy Framework. Ask through [contact](#controller) for information about the applicable safeguards.

## How long data is kept {#retention}

We have not set a time limit where the table says so. Deleting an account does not delete data at PostHog or Crisp. Email [contact](#controller) to have that data deleted at those providers on request.

| Records | Retention and deletion |
| --- | --- |
| PostHog analytics | No time limit set. Turning usage data off leaves earlier events. Request deletion. |
| Processing jobs and server logs | Jobs can hold relayed reports while sending/retrying. Logs support security and troubleshooting. No overall time limit set; no promise of zero server copies. |
| Devices | Including removed devices, until account deletion |
| Account and audit records | Account, sign-in methods, devices, licenses and memberships are removed on deletion. Audit events remain without a time limit; email fields and the actor's IP/user agent are removed, but addresses embedded in free text can remain. |
| Orders and provider notifications | Orders stay for tax/accounting, without a set time limit. Deletion removes account/email links. {merchant}, Amazon SES and Apple event records remain; personal purchase details and email recipient/engagement details are scrubbed for the deleted account. |
| Team Library | A deleted item keeps its last version for sync. Ordinary team deletion removes its library after 30 days, during which it is restorable. Deleting its sole owner's account removes the team and library at once. A license ending does not delete the library. |
| Authentication | Sign-in links/codes expire after 15 minutes and are deleted 7 days later. Portal sessions last 30 days. App tokens expire 90 days after last use and are deleted 30 days later. Email jobs retain plain-text codes/links until cleanup: a day after sending, or 7 days after giving up. |
| Newsletter | Unconfirmed new addresses are deleted after 30 days. Confirmed and migrated addresses stay until deletion on request or deletion of the account using that address. Unsubscribe keeps the address marked unsubscribed. |
| Suppression list | Bounced/complained addresses and first/last occurrence dates stay after account or subscription deletion to prevent further mail. No time limit set. |
| Google Analytics | User/event data: 2 months; aggregate standard reports are separate |
| Cloudflare Web Analytics | Last six months of page-view totals available to us |
| Support | Crisp conversations and mailbox messages stay until deleted, including on request. No time limit set. |
| Backups and migration archive | No time limit set. Account deletion does not remove these copies. The previous server's whole-database archive includes names/emails, licenses, orders, teams, device names, subscribers, beta signups, email records, usage reports and license logs with IP addresses. |

## Your choices and rights {#rights}

Use app privacy switches, website/docs Cookie settings and newsletter unsubscribe to change optional processing. Consent withdrawal applies going forward and does not invalidate earlier processing. App switches do not erase prior data or stop server analytics. In [portal Settings]({account}), export account data or delete the account; these controls do not cover every record in the retention table.

Depending on where you live, request access, correction, erasure, restriction, portability or object to legitimate-interest processing. Requests are accepted without an account: email [contact](#controller). We may ask for details needed to locate records, such as an installation ID. Never send a license key in plain text by email. We answer within one month. You may complain to your data protection authority. Legal retention duties can limit erasure.

### Regional rights {#regional-rights}

**California residents.** The California Consumer Privacy Act gives you the right to know what personal information we collect, to ask us to delete it, to opt out of its sale, and not to be treated differently for using these rights. We do not sell personal information.

## Children {#children}

TablePro is not directed at children under 16, and we do not knowingly collect their personal data. If you believe a child has given us personal data, contact us and we will delete it.

## Security {#security}

Traffic to our services uses HTTPS. Accounts have no passwords. Sign-in credentials and team API tokens are stored as hashes, with the temporary email-job exception in [retention](#retention). Access to our systems is limited to {publisherName} and the providers under [Who receives data](#sharing). No system is perfectly secure. Report vulnerabilities through the [security page](/security#report).

## Changes {#changes}

The page shows its last-updated date. Earlier versions remain in the [public web repository history]({webGithub}/commits/main/resources/data/legal/en/privacy.md). We update this notice before using data for a new purpose, tell you directly where law requires, and seek fresh consent where required.
