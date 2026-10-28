---
title: Privacy policy
description: What TablePro's apps, website and account portal collect, where it goes, how long it is kept, and how to change or delete it.
updatedAt: "2026-10-28"
---

This policy covers TablePro for Mac, TablePro for iPhone and iPad, the website at tablepro.app, the documentation at docs.tablepro.app, and the account portal at account.tablepro.app. It describes what each of them actually sends and stores today. Both apps are open source under the AGPLv3, so you can read the code that sends any of the data below in the [TablePro repository]({github}).

## Summary {#summary}

- The Mac app sends TablePro a usage report once a day. It is on by default and you can turn it off. The iPhone and iPad app sends one only if you turn it on.
- If you sign in to a TablePro account or activate a license key, the Mac app registers your Mac with our server, including its name, and checks your plan with it regularly.
- The queries you run, your results and your passwords are not sent to TablePro. The exception is what you choose to publish to a Team Library: connection settings (never passwords) and saved queries.
- AI requests go from the Mac app directly to the AI provider you set up, not to us.
- Our server passes usage reports on to PostHog, our product analytics service in the EU, without their IP addresses. Your account keeps a log of the changes made to it, such as sign-ins and new devices, with the IP address and browser each came from.
- The website counts page views with Cloudflare Web Analytics, which sets no cookies. It also loads Google Analytics, which sets cookies only if you allow them. Every page also loads our live chat, Crisp, which sets cookies of its own.
- The account portal at account.tablepro.app runs no analytics script. It sets one cookie to keep you signed in, and in its Settings you can download your account's data or delete the account.
- Purchases are sold by {merchant}, our merchant of record.

## Who is responsible {#controller}

{publisherName}, an individual developer based in {publisherCity}, {publisherCountry}, publishes the TablePro apps and this website, and is responsible for the personal data described here (the data controller). For any question about this policy or your data, email [{email}](mailto:{email}).

## TablePro for Mac {#mac-app}

### Usage report {#mac-usage-report}

The Mac app sends a usage report to `api.tablepro.app` about ten seconds after it starts and then once a day while it runs. **It is on by default, and the app does not ask before sending the first one.** To turn it off, open **Settings > General > Privacy** and clear **Share anonymous usage data**.

A report contains:

- a machine ID: a SHA-256 hash of your Mac's hardware UUID (the UUID itself is never sent);
- the platform, the app version, the macOS version, the processor architecture and the app's language;
- the names of the database types of your open connections (for example "PostgreSQL") and how many connections are open;
- whether a license is activated;
- the date and time of your first connection attempt and of your first successful connection;
- your update settings (how updates install and how often the app checks). Our server discards these when the report arrives.

It never contains hostnames, usernames, passwords, queries or rows.

Our server does not store the report or the IP address it came from. It passes the report on to PostHog as an event about the machine ID, with the country Cloudflare gives for your connection and without your license key or IP address, and PostHog makes no profile of a person from it. Because your account lists its devices by the same machine ID, reports from a Mac you signed in on, or activated a license on, can be linked to your account.

From the version that adds TablePro accounts, the Mac app sends its usage data to PostHog directly instead, under the same setting. Once you sign in, it links that data to your account ID, which connects your installs with your sign-ins and purchases. Turning the setting off stops both.

### License checks {#mac-license}

The Mac app contacts our license server only after you enter a license key. It does so when you activate the license, when it starts if {revalidateDays} days or more have passed since the last check, and every {revalidateDays} days after that. Each check sends:

- your license key;
- the machine ID described above;
- your Mac's name, as set in macOS (it often includes your own name);
- the app version and the macOS version.

Deactivating a Mac sends only the license key and the machine ID.

Our server keeps each activated Mac as a device of the account that holds the license: its machine ID and name, the app and macOS versions, and when it last checked in. Activating and deactivating a Mac are recorded in that account's audit log with the IP address and user agent of the request; routine checks are not. The account portal lists your devices by name. If our server cannot be reached, the paid features keep working for {graceDays} days after the last successful check.

### TablePro account {#mac-account}

From the version that adds TablePro accounts, you sign in to the Mac app with a [TablePro account](#account) instead of a license key. The app opens the sign-in page in a browser sheet, where you can type the code from the sign-in email. After you sign in, it registers your Mac as a device of your account: the machine ID described above, your Mac's name, the platform, and the app and macOS versions. It then fetches your plan from our server as a signed file once a day while it runs, and that file keeps the paid features working for up to 14 days without our server. The token that keeps the app signed in is kept in the macOS Keychain.

A license key already on your Mac is exchanged once for a sign-in to the account that holds it, then deleted from the Mac. A device that has not checked in for 180 days is removed. You can remove devices in the app or in the account portal, and the first time a Mac uses your license, we email you about it.

### Team Library {#library}

Team Library is part of a Team license. When you choose **Share > Publish to Team Library…** on a connection, or **Publish Saved Queries to Team…** in the Favorites sidebar, the Mac app uploads what you publish to our server:

- connection settings: host, port, database name, username, SSH and SSL settings, driver options, startup commands, the Tunnel Command settings, the Safe Mode level and AI settings, but never passwords;
- saved queries: their names, SQL text, keywords and folders.

The Macs on the same Team license download the library when they start, at most once a week, and the Mac that publishes downloads it again right after. Publishing again replaces what you published before. The account portal's Library shows each item, with the name of whoever last changed it, to the members who can read the library, and lets owners and admins delete items. A deleted item stays on our server for 90 days, so every Mac can sync the deletion. If the license ends, the library stays on our server until the team's owner deletes the team, which deletes the library with it.

Team Catalog, the other Team feature, writes connection files without passwords to a shared folder you choose. It does not go through our server.

### Updates and plugins {#mac-updates}

- **Update checks.** Once a day the Mac app downloads the update feed from GitHub (`raw.githubusercontent.com`). The request sends no information about your Mac beyond what every web request carries: your IP address and a user agent with the app's version. To turn it off, open **Settings > General > Software Update** and clear **Automatically check for updates**. Updates themselves download from GitHub.
- **Plugin catalog.** When the app starts, and when you open the plugin settings, it downloads the list of available drivers and themes from GitHub. There is no setting to turn this off. Drivers and themes you install download from GitHub, and the plugin browser reads download counts from GitHub's API.

GitHub receives your IP address with these requests. GitHub's own privacy statement applies to them.

### Services you choose to use {#mac-third-parties}

The Mac app sends data to these services only when you set them up, and directly, never through TablePro:

- **Your databases, SSH servers and proxies**, which receive whatever your connections send them.
- **AI providers.** When you add a provider and use the AI assistant or inline suggestions, requests go to that provider, or to a model running on your Mac. By default a request includes the database type and name, table and column definitions from the schema, and the current query. Result rows are sent only if you turn that on. The provider's own terms apply. Adding GitHub Copilot downloads its language server from npm, and its "Send telemetry to GitHub" setting starts out on.
- **Sign-in services**: Microsoft Entra ID, Google, Amazon Web Services and Cloudflare Access, when a connection uses them.
- **Apple Maps**, which supplies the map tiles when you show results on a map.
- **DuckDB**, which supplies DuckDB extensions the first time a query uses one.
- **MCP clients.** The MCP server is off by default. It starts when you turn it on, or when an MCP client you have set up launches TablePro's bridge or pairs with it, and it listens only on your Mac (127.0.0.1). An AI client you connect to it, such as Claude or Cursor, receives the results it asks for and sends them to its own service under its own terms.
- **MCP servers you add.** An AI session sends the tool calls you approve, with their arguments, to that server.

### Data that stays on your Mac {#mac-local}

Passwords are kept in the macOS Keychain. Your connection list, query history, Query Insights, Data Rewind snapshots, settings and open tabs are stored on your Mac. The app references SSH keys where they are on disk and does not copy them. The app contains no crash reporter and no third-party analytics library.

## TablePro for iPhone and iPad {#ios-app}

**Nothing goes to TablePro unless you turn on Share Usage Data**, when the app first starts or later in **Settings > Privacy**. If you do, the app sends a report once a day to the same server as the Mac app, which passes it on to PostHog in the same way, without its IP address. The report contains a SHA-256 hash of the identifier Apple gives the app on your device, the platform, the app and iOS versions, the processor architecture, the app's language, the names of the database types of your open connections, how many are open, and the date and time of your first connection attempt, your first successful connection and your first query. It carries no update settings and always reports that no license is activated, because the app has neither.

The app makes no license check, no update check and no plugin request. Apart from the optional report, it connects only to your databases and SSH servers, to Apple's iCloud if you turn on iCloud Sync, and to Microsoft when a SQL Server connection signs in with Microsoft Entra ID.

On the device, passwords and pasted SSH keys are kept in the Keychain, and certificates are never synced. Query history stays on the device. Your connections are added to the on-device Spotlight index so you can search for them. While a query runs, its Live Activity shows the SQL on the Lock Screen and in the expanded Dynamic Island unless you turn on **Settings > Live Activities > Hide Query**.

If you share analytics with app developers in your iPhone or iPad settings, Apple may pass crash reports and usage statistics to us through App Store Connect. The app contains no crash reporter and no third-party analytics library of its own.

## iCloud Sync and Handoff {#icloud}

iCloud Sync is off until you turn it on, on the Mac and on iPhone and iPad. When it is on, the records go to a private database in your own iCloud account (container `iCloud.com.TablePro`). TablePro cannot read them.

- On the Mac you choose what syncs: connections, groups and tags, settings, SSH profiles, credential profiles (their name and username, never the password), table and database favorites, saved queries (including their SQL text) and table folders. A connection record includes the host, port, username, database name, SSH and SSL settings, startup commands, the pre-connect script and AI rules. Query history, Data Rewind snapshots and password sources never sync.
- iPhone and iPad sync connections, groups and tags.
- Passwords sync only if you also turn on **Passwords** under Sync Categories on the Mac, or **Sync Passwords** on iPhone and iPad, which uses iCloud Keychain. On the Mac this also syncs the other secrets TablePro keeps in the Keychain, such as AI provider keys and the license key.

On the Mac, iCloud Sync is part of a Starter or Team license. On iPhone and iPad it is free.

Handoff passes the ID of the open connection and the name of the open table between your own devices, through Apple. With no table open, it passes the connection's name instead, or its host when the connection has no name. It sends no settings or credentials.

## Website {#website}

**Hosting.** The website and the account portal run on our server, behind Cloudflare. Like any web server, they receive your IP address, your browser's user agent and the address of each page you request.

**Cloudflare Web Analytics.** Cloudflare adds its Web Analytics script to the pages of the website; the account portal does not run it. Your browser loads it from `static.cloudflareinsights.com`, and it reports each page view to Cloudflare: the page, the site that linked to it, how long the page took to load, and your browser, operating system and type of device. Cloudflare adds the country your connection comes from. The script sets no cookies and stores nothing in your browser, and Cloudflare states that it does not use your IP address or browser details to fingerprint you. Cloudflare shows us totals, such as page views per page or per country, not a record of each visitor. Lawful basis: legitimate interest.

**Google Analytics.** The site loads Google Analytics on every page in Consent Mode. Until you choose **Allow** in the cookie question, it sets no cookies and sends Google only a cookieless signal for each page, with no identifier stored on your device. If you allow it, Google Analytics sets the `_ga` and `_ga_<ID>` cookies and measures your visits, such as the pages you view, download clicks and the start of a checkout. Advertising storage, ad personalization and ad user data are always denied. Google states that Google Analytics 4 does not log or store IP addresses. Our Google Analytics property uses Google's default retention period: Google deletes the user-level and event-level data it collected after 2 months. Google's standard reports, which hold totals rather than identifiers, are not affected. Lawful basis: your consent for the cookies.

**Live chat.** Every page of the website and the account portal shows a chat button from our chat provider, Crisp. Once a page has loaded, your browser loads Crisp's script from `client.crisp.chat`, and Crisp sets the cookies described under [Cookies and browser storage](#cookies). Crisp receives your IP address, your browser's details, the addresses of the pages you view and the messages you write, and it keeps your IP address if you start a conversation. We tell Crisp the language of the page. When you are signed in to the account portal, we also give Crisp your account's email address and account ID, which link a conversation to your account. We tell Crisp nothing else about you. Crisp is based in France.

**Checkout script.** When you point at or tab to a Buy button, your browser loads {merchant}'s checkout script from jsDelivr (`cdn.jsdelivr.net`), which receives your IP address and your browser's details. The checkout itself opens from {merchant} only when you click.

**Newsletter check.** When you start on the newsletter form, your browser loads Cloudflare Turnstile from `challenges.cloudflare.com` to check that a person is signing up; Cloudflare receives your IP address and browser details.

**Purchase attribution.** When you arrive at the site, your browser keeps a first-visit record called `tablepro:attribution` in its local storage for 90 days: the source of the visit (the `ref` or `utm_*` tags on the link you followed, or the site that linked to you), the page you landed on and when. If you start a purchase, the record is sent with the checkout request. Our server passes the source of the visit to {merchant} as metadata of the checkout, keeps it with the order once you pay, and sends it to PostHog with the checkout and the payment. The landing page and the date are not kept.

**Documentation.** The documentation at docs.tablepro.app is hosted by Mintlify, which receives your IP address and your browser's details with each page, and the pages load their fonts from Google Fonts. The navigation bar shows the repository's star count, which your browser fetches from GitHub's API, so GitHub receives your IP address and your browser's details too. That request sets no cookies. The documentation asks its own cookie question, because it cannot read the answer you gave on this site. Until you choose **Allow** there, it sets no cookies and keeps no visitor ID. If you allow it, Google Analytics sets the `_ga` and `_ga_<ID>` cookies and measures your visits to the documentation, and Mintlify keeps a random visitor ID, `mintlify_anonymous_id`, in local storage to count them. **Cookie settings** in the documentation's footer changes your answer, and declining removes both. Lawful basis: your consent.

**Language and regional discount.** To suggest the page in your language when your browser names none the site offers, and to show the regional discount checkout would apply, the site asks Cloudflare (`/cdn-cgi/trace`) and our server for the country your connection comes from, and may read your device's time zone. Neither request carries cookies, and the page keeps nothing from the answers. Lawful basis: legitimate interest.

Reading the site sets no cookies of its own. Newsletter signup, checkout and discount-code requests from the public site omit credentials: they neither send account-portal cookies nor accept cookies from the response. Opening account-portal pages is separate: signing in there sets the portal cookie below. Everything the site keeps in your browser is listed under [Cookies and browser storage](#cookies).

## Purchases {#purchases}

Licenses are sold by {merchant} (Polar Software, Inc.), our merchant of record and reseller. You buy from {merchant} under its own buyer terms and privacy policy. {merchant} takes the payment, calculates and pays any sales tax or VAT, sends receipts and invoices, and handles payment problems and disputes. It collects your name, email address, billing address and payment details. We never see your full card details.

When you start a checkout, our server tells {merchant} what you are buying, the language of the page you bought from, the source of your visit (see [Website](#website)) and your IP address, which {merchant} uses to work out tax and currency. From {merchant} we receive your email address, your name and billing address as you entered them, what you bought, the amounts, the order and subscription IDs, and later changes such as renewals, cancellations and refunds. We keep the email address, the billing country and the amounts with each order.

A purchase made without signing in goes to the TablePro account of the email address you bought with, which is created if there is none and stays unverified until you first sign in. In the [account portal]({account}) you can change a subscription's billing cycle or seats, cancel or resume it, and ask for a refund. When you cancel, the reason you choose and any comment you write go to {merchant} and are kept with the subscription. Your card, invoices, tax details and billing address are in [{merchant}'s customer portal]({portal}), which the account portal opens for you. Refunds are described in the [refund policy](/refund-policy), and what a license allows in the [terms of service](/terms).

## Account portal {#account}

The [account portal]({account}) at account.tablepro.app is where you manage your TablePro account: its licenses, devices, billing and teams. It runs on our server, behind Cloudflare, like the website.

**Your account.** An account belongs to one person and is identified by an email address. It holds that address, the name and language you set, your sign-in methods, the devices signed in to it, your licenses and orders, the teams you belong to with your role and seat, and an audit log of the changes made to it, such as sign-ins, new devices and team changes, with the IP address and browser of the request that made each one. Our emails reach you in your account's language.

**Signing in.** We email you a link and a 6-digit code: the link works once, the code allows 5 attempts, and both expire after 15 minutes. You can also add passkeys; we keep each one's public key, the name you give it, whether it syncs between your devices, and when it was added and last used. Or you can sign in with Apple, GitHub or Google: the provider tells us an ID for you and your verified email address, and Apple also your name the first time. We keep the ID and the address with your account, and for Apple a token we keep encrypted and revoke with Apple when you unlink Apple or delete your account. When a provider's address belongs to an existing account, we email that account a link and a code to confirm before linking them, unless Google manages the address (Gmail or Google Workspace).

**Your teams.** When you invite someone to a team, we store their email address, their role and whether the invitation includes a seat, and email them a link that works for 7 days. Owners and admins see the team's members with their names and email addresses, its invitations, and its audit log, which shows who changed what in the team, invited addresses included, but never an IP address or browser. Members see the team, its plan, its seat counts and their own role.

**Your data.** In Settings you can change your name, email address and language, add and remove sign-in methods, download your account's data as a JSON file, and delete your account. You cannot delete it while you own a team that has other members. Deleting it removes your sign-in methods, devices, licenses, team memberships and the teams you own alone, and ends your subscriptions without a refund. What we keep afterwards is under [How long we keep data](#retention).

**What the portal loads.** The portal runs no Google Analytics, no Cloudflare Web Analytics and no other analytics script, and asks no cookie question. It shows the live chat from Crisp described under [Website](#website), and a purchase made there opens {merchant}'s checkout over the page. It reports errors and page-load times to Grafana Cloud with Grafana Faro: the error, which screen it happened on (never the full address, which can hold a link's token), your browser and operating system, and a random ID for your visit.

## Newsletter {#newsletter}

If you subscribe to release notes, we email you a confirmation link first, in the language of the page you subscribed from. The link works for 7 days, and one address gets at most 3 a day. Once you confirm, your address joins our newsletter list at Resend, the service that sends our emails. Every newsletter has an unsubscribe link, which Resend handles. After you unsubscribe we send no more newsletters; to have the address deleted as well, email us. Cloudflare Turnstile checks the form, as described under [Website](#website).

## Cookies and browser storage {#cookies}

Reading the public website and its newsletter, checkout and discount-code requests set no cookies of their own. Signing in to the account portal, or starting to, sets the one strictly necessary portal cookie listed below. Cloudflare Web Analytics sets no cookies and stores nothing in your browser. The Google Analytics cookies are not set until you allow them. Crisp sets its cookies on every page once the chat has loaded. Nothing here is used for advertising or sold.

- **`_ga` and `_ga_<ID>`** (Google Analytics cookies, up to 2 years, only if you allow analytics): a random identifier for your browser and the state of your current visit. Declining, or changing your answer later, deletes them. Lawful basis: consent.
- **`tablepro:analytics-consent`** (local storage, until you clear it): your answer to the analytics question, so you are not asked on every page. The account portal runs no analytics, so it neither asks this question nor reads the answer. Lawful basis: strictly necessary to honor your choice.
- **`tablepro:attribution`** (local storage, 90 days): the first-visit record described under [Website](#website). It holds no identifier of you and is sent only with a checkout request, which passes the source of the visit to {merchant}. Lawful basis: legitimate interest.
- **`theme`** (local storage, until you clear it): whether you chose a light, dark or system appearance. The account portal keeps its own. Lawful basis: legitimate interest.
- **`tablepro:language`** (local storage, until you clear it): the language you picked in the language menu or the language bar, and each language whose suggestion you closed, so it is not offered again. Lawful basis: legitimate interest.
- **`mintlify_anonymous_id`** (local storage on docs.tablepro.app, set by Mintlify, only if you allow analytics there): the visitor ID described under [Website](#website). Declining removes it. The documentation keeps its own `tablepro:analytics-consent` answer. Lawful basis: consent.
- **Cookies starting with `crisp-client/`** (Crisp, for example `crisp-client/session/…`; 6 months, renewed when you return; set on every page once the chat has loaded): keep the chat and your conversation across pages and visits. Lawful basis: legitimate interest, to offer support on every page.
- **`__Host-tp_session`** (account portal cookie, 30 days from when you sign in): keeps you signed in. Before you sign in it is set only while a passkey, Apple, GitHub, Google or app sign-in is under way, for at most 10 minutes. Signing out deletes it. Public-site newsletter, checkout and discount-code requests omit credentials and never receive it. Lawful basis: strictly necessary.
- **`locale`, `context` and `sign-in-return-to`** (account portal local storage): the language you picked there before signing in and whether you last opened Personal or a team, both until you clear them, and for 15 minutes the page to go back to after you open an emailed sign-in link. Lawful basis: legitimate interest.
- **`com.grafana.faro.session`** (account portal session storage, until you close the tab): the random visit ID of the portal's error reports. Lawful basis: legitimate interest.

You can change or withdraw your analytics answer at any time with **Cookie settings** in the footer of every page, or here:

<cookie-settings></cookie-settings>

## Lawful basis {#lawful-basis}

For readers in the European Economic Area and the United Kingdom, the lawful bases under the GDPR and the UK GDPR are:

- **Contract** (Art. 6(1)(b)): selling and providing a license, your account with its sign-in methods and devices, license checks, the account portal and the Team Library.
- **Legitimate interest** (Art. 6(1)(f)): the Mac app's usage report and its analysis in PostHog, the events about sign-ins, purchases, devices and teams our server sends to PostHog, the account's audit log, security and abuse prevention, including Cloudflare Turnstile on the newsletter form, web server logs and the account portal's error reports, Cloudflare Web Analytics, the purchase attribution record, the country lookups for the language bar and the regional discount, and the live chat on every page.
- **Consent** (Art. 6(1)(a)): Google Analytics cookies, the iPhone and iPad app's usage report, the newsletter and the conversations you start in live chat.
- **Legal obligation** (Art. 6(1)(c)): tax and accounting records, and answers to lawful requests.

## Who receives data {#sharing}

We share personal data only with the services needed to run TablePro:

- **{merchant}**, the merchant of record for purchases.
- **Resend**, which sends our emails: sign-in links and codes, team invitations, account and security notices, and newsletters. It keeps the newsletter list and tells us when an email to an address bounces or is marked as spam.
- **Our hosting provider and Cloudflare**, for the website, the account portal and the server the apps talk to. Cloudflare also counts page views with Cloudflare Web Analytics and checks the newsletter form with Turnstile.
- **Google**, for Google Analytics on the website and the documentation.
- **Crisp**, for the live chat on every page of the website and the account portal.
- **PostHog** (EU Cloud), our product analytics service, which receives the apps' usage reports and our server's events about sign-ins, purchases, devices and teams, with your account ID but never your email address or name.
- **Grafana Labs** (Grafana Cloud), which receives our server's logs and traces and the account portal's error reports.
- **Apple, GitHub and Google**, when you sign in to your account with them.
- **jsDelivr**, which serves {merchant}'s checkout script to your browser when you point at a Buy button.
- **Mintlify**, which hosts the documentation at docs.tablepro.app.
- **GitHub**, which hosts the update feed, the plugin catalog and the downloads, and serves the star count the documentation shows.

We do not sell personal data and do not share it with advertisers.

## International transfers {#transfers}

The services above operate in several countries, so your data may be processed outside your own. {merchant}, Google, GitHub, Cloudflare and Mintlify process data in the United States; Google does so under the EU-US Data Privacy Framework and Standard Contractual Clauses. PostHog processes it in the European Union. Where the law requires it, transfers from the EEA and the UK rely on Standard Contractual Clauses or another approved mechanism.

## How long we keep data {#retention}

- **Usage reports and analytics events**: our server keeps no copy once it has passed them to PostHog. We have not set a time limit for them in PostHog. Deleting your account deletes its PostHog profile and events an hour later.
- **Records from our previous server**: the usage reports and license request logs it kept, with their IP addresses, are in an encrypted archive. We have not set a time limit for it.
- **Devices**: kept while in use. A device that has not checked in for 180 days is removed, unless an offline file for it is still valid, and a removed device is deleted a year later.
- **Your account's audit log**: kept while the account exists, with the IP address and browser of each change you made. Deleting the account removes your email addresses from it and the IP address and browser of what you did; the record of each change stays.
- **Orders**: kept for tax and accounting. Deleting your account removes your email address and your account from them.
- **Notifications from {merchant}, Resend and Apple**: 180 days. {merchant}'s hold your name, email address and billing address; deleting your account removes them sooner from those about your purchases.
- **Team Library**: until an item is changed or deleted; a deleted item is kept for 90 days. The library is deleted with its team, and stays after a license ends.
- **Sign-in links and codes**: they expire after 15 minutes and are deleted 7 days later. Portal sessions last 30 days. The token that keeps an app signed in expires 90 days after the app last used it, and is deleted 30 days after that.
- **Deleted accounts**: the account, its sign-in methods, devices, licenses and team memberships are deleted at once. Orders and the audit log stay as described above.
- **Newsletter**: a confirmation link and the address it went to are deleted 7 days after the link expires. A confirmed address stays in our list at Resend until we delete it at your request; after you unsubscribe it is kept as unsubscribed, so no newsletter reaches it.
- **Google Analytics**: user-level and event-level data for 2 months, Google's default retention period, which our property uses. Its cookies last up to 2 years, or are deleted when you decline.
- **Cloudflare Web Analytics**: Cloudflare shows us the last six months of page-view totals. Nothing is stored in your browser.
- **Live chat and support emails**: kept by Crisp and in our mailbox until deleted. Ask us to delete your conversations and emails.
- **Web server logs**: kept for security and troubleshooting. We have not set a fixed period for them yet.
- **Our server's logs and traces, and the portal's error reports**: 14 days, in Grafana Cloud.

## Your rights {#rights}

Depending on where you live, you can ask us to:

- give you a copy of the personal data we hold about you (access);
- correct it (rectification);
- delete it (erasure), except what we must keep by law;
- limit how we use it (restriction);
- send it to you in a structured, machine-readable form (portability);
- stop using it on the basis of legitimate interest (objection).

You can withdraw consent at any time, and you can complain to your data protection authority. To use any of these rights, email [{email}](mailto:{email}). We answer within 30 days. In the [account portal]({account}), Settings also gives you a copy of your account's data and deletes the account. For anything else, such as a newsletter address or a Mac without an account, tell us which email address, license key or device it concerns. Data held by {merchant}, Google, Crisp or GitHub is also covered by their own policies.

**California residents.** The California Consumer Privacy Act gives you the right to know what personal information we collect, to ask us to delete it, to opt out of its sale, and not to be treated differently for using these rights. We do not sell personal information.

## Children {#children}

TablePro is not directed at children under 16, and we do not knowingly collect their personal data. If you believe a child has given us personal data, contact us and we will delete it.

## Security {#security}

Traffic between the apps, the website, the account portal and our server uses HTTPS. TablePro accounts have no passwords. Sign-in links and codes, the tokens that keep the apps signed in, and team API tokens are stored only as hashes, and access to our systems is limited to {publisherName} and the service providers listed under [Who receives data](#sharing). No system is perfectly secure. To report a vulnerability, see the [security page](/security#report) or email [{email}](mailto:{email}).

## Changes to this policy {#changes}

When this policy changes, we update it here with a new "Last updated" date, and where the law requires it, we tell you directly.

## Contact {#contact}

For questions about privacy or this policy, email [{email}](mailto:{email}).
