---
title: Privacy policy
description: What TablePro's apps, website and account portal collect, where it goes, how long it is kept, and how to change or delete it.
updatedAt: "2026-10-08"
---

This policy covers TablePro for Mac, TablePro for iPhone and iPad, the website at tablepro.app, the documentation at docs.tablepro.app, and the account portal at tablepro.app/account. It describes what each of them actually sends and stores today. Both apps are open source under the AGPLv3, so you can read the code that sends any of the data below in the [TablePro repository]({github}).

## Summary {#summary}

- The Mac app sends TablePro a usage report once a day. It is on by default and you can turn it off. The iPhone and iPad app sends one only if you turn it on.
- If you activate a license, the Mac app checks it with our server every {revalidateDays} days. That check includes your Mac's name.
- The queries you run, your results and your passwords are not sent to TablePro. The exception is what you choose to publish to a Team Library: connection settings (never passwords) and saved queries.
- AI requests go from the Mac app directly to the AI provider you set up, not to us.
- Our server stores the IP address of every usage report and license check, and looks up a country for each usage report. We have not set a time limit for keeping these records.
- The website counts page views with Cloudflare Web Analytics, which sets no cookies. It also loads Google Analytics, which sets cookies only if you allow them. Every page also loads our live chat, Crisp, which sets cookies of its own.
- Purchases are sold by {merchant}, our merchant of record.

## Who is responsible {#controller}

TablePro, which publishes the apps and this website, is responsible for the personal data described here (the data controller). For any question about this policy or your data, email [{email}](mailto:{email}).

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

Our server stores each report with the IP address it came from. It then looks up a country for that IP address by sending it to ip-api.com, and if that fails to ipinfo.io and then geoplugin.net. These lookups are made over unencrypted HTTP. The country is stored with the report. Because the license check below sends the same machine ID, reports from a Mac with an activated license can be linked to that license.

### License checks {#mac-license}

The Mac app contacts our license server only after you enter a license key. It does so when you activate the license, when it starts if {revalidateDays} days or more have passed since the last check, and every {revalidateDays} days after that. Each check sends:

- your license key;
- the machine ID described above;
- your Mac's name, as set in macOS (it often includes your own name);
- the app version and the macOS version.

Deactivating a Mac sends only the license key and the machine ID.

Our server logs every license request with its IP address and its contents, and stores each activated Mac's machine ID and name with your license. The account portal lists those Macs by name. If our server cannot be reached, the paid features keep working for {graceDays} days after the last successful check.

### Team Library {#library}

Team Library is part of a Team license. When you choose **Share > Publish to Team Library…** on a connection, or **Publish Saved Queries to Team…** in the Favorites sidebar, the Mac app uploads what you publish to our server:

- connection settings: host, port, database name, username, SSH and SSL settings, driver options, startup commands, the Tunnel Command settings, the Safe Mode level and AI settings, but never passwords;
- saved queries: their names, SQL text, keywords and folders.

The Macs on the same Team license download the library when they start, at most once a week, and the Mac that publishes downloads it again right after. Publishing again replaces what you published before. Removing a member from the team deletes everything that member published. If the license expires or is suspended, the library stays on our server until you ask us to delete it.

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

**Nothing goes to TablePro unless you turn on Share Usage Data**, when the app first starts or later in **Settings > Privacy**. If you do, the app sends a report once a day to the same server as the Mac app, and our server stores and looks up its IP address in the same way. The report contains a SHA-256 hash of the identifier Apple gives the app on your device, the platform, the app and iOS versions, the processor architecture, the app's language, the names of the database types of your open connections, how many are open, and the date and time of your first connection attempt, your first successful connection and your first query. It carries no update settings and always reports that no license is activated, because the app has neither.

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

**Cloudflare Web Analytics.** Cloudflare adds its Web Analytics script to the pages of the website and the account portal. Your browser loads it from `static.cloudflareinsights.com`, and it reports each page view to Cloudflare: the page, the site that linked to it, how long the page took to load, and your browser, operating system and type of device. Cloudflare adds the country your connection comes from. The script sets no cookies and stores nothing in your browser, and Cloudflare states that it does not use your IP address or browser details to fingerprint you. Cloudflare shows us totals, such as page views per page or per country, not a record of each visitor. Lawful basis: legitimate interest.

**Google Analytics.** The site loads Google Analytics on every page in Consent Mode. Until you choose **Allow** in the cookie question, it sets no cookies and sends Google only a cookieless signal for each page, with no identifier stored on your device. If you allow it, Google Analytics sets the `_ga` and `_ga_<ID>` cookies and measures your visits, such as the pages you view, download clicks and the start of a checkout. Advertising storage, ad personalization and ad user data are always denied. Google states that Google Analytics 4 does not log or store IP addresses. Our Google Analytics property uses Google's default retention period: Google deletes the user-level and event-level data it collected after 2 months. Google's standard reports, which hold totals rather than identifiers, are not affected. Lawful basis: your consent for the cookies.

**Live chat.** Every page of the website and the account portal shows a chat button from our chat provider, Crisp. Once a page has loaded, your browser loads Crisp's script from `client.crisp.chat`, and Crisp sets the cookies described under [Cookies and browser storage](#cookies). Crisp receives your IP address, your browser's details, the addresses of the pages you view and the messages you write, and it keeps your IP address if you start a conversation. We tell Crisp the language of the page and nothing else about you. Crisp is based in France.

**Checkout script.** When you point at or tab to a Buy button, your browser loads {merchant}'s checkout script from jsDelivr (`cdn.jsdelivr.net`), which receives your IP address and your browser's details. The checkout itself opens from {merchant} only when you click.

**Purchase attribution.** When you arrive at the site, your browser keeps a first-visit record called `tablepro:attribution` in its local storage for 90 days: the source of the visit (the `ref` or `utm_*` tags on the link you followed, or the site that linked to you), the page you landed on and when. If you start a purchase, the record is sent with the checkout request. Our server discards it: it is not validated, read or stored, and it is not passed to {merchant}.

**Documentation.** The documentation at docs.tablepro.app is hosted by Mintlify, which receives your IP address and your browser's details with each page, and the pages load their fonts from Google Fonts. The documentation asks its own cookie question, because it cannot read the answer you gave on this site. Until you choose **Allow** there, it sets no cookies and keeps no visitor ID. If you allow it, Google Analytics sets the `_ga` and `_ga_<ID>` cookies and measures your visits to the documentation, and Mintlify keeps a random visitor ID, `mintlify_anonymous_id`, in local storage to count them. **Cookie settings** in the documentation's footer changes your answer, and declining removes both. Lawful basis: your consent.

Reading the site sets no cookies of its own. Subscribing to the newsletter, or starting a checkout or a discount code check, sends a request to our server that sets the two account portal cookies, `tablepro-session` and `XSRF-TOKEN`. Everything the site keeps in your browser is listed under [Cookies and browser storage](#cookies).

## Purchases {#purchases}

Licenses are sold by {merchant} (Polar Software, Inc.), our merchant of record and reseller. You buy from {merchant} under its own buyer terms and privacy policy. {merchant} takes the payment, calculates and pays any sales tax or VAT, sends receipts and invoices, and handles payment problems and disputes. It collects your name, email address, billing address and payment details. We never see your full card details.

From {merchant} we receive your email address, your name and billing address as you entered them, what you bought, the amounts, the order and subscription IDs, and later changes such as renewals, cancellations and refunds. We tell {merchant} the language of the page you bought from, so our emails reach you in that language. Invoices, receipts, your payment method and your subscription are in [{merchant}'s customer portal]({portal}), which you sign in to with the email address you bought with. Refunds are described in the [refund policy](/refund-policy), and what a license allows in the [terms of service](/terms).

## Account portal {#account}

The [account portal](/account?locale=en) at tablepro.app/account is for the person who bought a license. You sign in with a link we email to that address; the link works once and expires after 15 minutes. The portal shows your licenses, the Macs activated on them (by name), and, for a Team license, its members, invitations, seats and Team Library.

We store your email address with your licenses and orders, and the language you use with us, so that our emails reach you in it. When you invite someone to a team, we store their email address and role and email them an invitation code.

## Newsletter {#newsletter}

If you subscribe to release notes, we store your email address and the language of the page you subscribed from. We email you a confirmation link first, and every newsletter has an unsubscribe link. After you unsubscribe we send no more newsletters; to have the address deleted as well, email us.

## Cookies and browser storage {#cookies}

Reading the public website sets no cookies of its own; subscribing to the newsletter or starting a checkout sets the two strictly necessary portal cookies listed below. Cloudflare Web Analytics sets no cookies and stores nothing in your browser. The Google Analytics cookies are not set until you allow them. Crisp sets its cookies on every page once the chat has loaded. Nothing here is used for advertising or sold.

- **`_ga` and `_ga_<ID>`** (Google Analytics cookies, up to 2 years, only if you allow analytics): a random identifier for your browser and the state of your current visit. Declining, or changing your answer later, deletes them. Lawful basis: consent.
- **`tablepro:analytics-consent`** (local storage, until you clear it): your answer to the analytics question, so you are not asked on every page. The website and the account portal share it. Lawful basis: strictly necessary to honor your choice.
- **`tablepro:attribution`** (local storage, 90 days): the first-visit record described under [Website](#website). It holds no identifier of you and is sent only with a checkout request, where our server discards it. Lawful basis: legitimate interest.
- **`theme`** and **`tablepro:banner-dismissed`** (local storage, until you clear it): whether you chose a light, dark or system appearance, and which banner you closed and until when: 30 days, or a year if you say you have a license or buy one. Lawful basis: legitimate interest.
- **`mintlify_anonymous_id`** (local storage on docs.tablepro.app, set by Mintlify, only if you allow analytics there): the visitor ID described under [Website](#website). Declining removes it. The documentation keeps its own `tablepro:analytics-consent` answer. Lawful basis: consent.
- **Cookies starting with `crisp-client/`** (Crisp, for example `crisp-client/session/…`; 6 months, renewed when you return; set on every page once the chat has loaded): keep the chat and your conversation across pages and visits. Lawful basis: legitimate interest, to offer support on every page.
- **`tablepro-session` and `XSRF-TOKEN`** (account portal cookies, 2 hours): keep you signed in and protect the portal's forms against cross-site request forgery. The portal's other pages, such as the purchase confirmation and the newsletter pages, set them too, and so does subscribing to the newsletter or starting a checkout or a discount code check from any page of this site. Lawful basis: strictly necessary.

You can change or withdraw your analytics answer at any time with **Cookie settings** in the footer of every page, or here:

<cookie-settings></cookie-settings>

## Lawful basis {#lawful-basis}

For readers in the European Economic Area and the United Kingdom, the lawful bases under the GDPR and the UK GDPR are:

- **Contract** (Art. 6(1)(b)): selling and providing a license, license checks, the account portal and the Team Library.
- **Legitimate interest** (Art. 6(1)(f)): the Mac app's usage report and its country lookup, the logs of license requests, security and abuse prevention, web server logs, Cloudflare Web Analytics, the purchase attribution record and the live chat on every page.
- **Consent** (Art. 6(1)(a)): Google Analytics cookies, the iPhone and iPad app's usage report, the newsletter and the conversations you start in live chat.
- **Legal obligation** (Art. 6(1)(c)): tax and accounting records, and answers to lawful requests.

## Who receives data {#sharing}

We share personal data only with the services needed to run TablePro:

- **{merchant}**, the merchant of record for purchases.
- **An email delivery provider**, for sign-in links, receipts from us, team invitations and newsletters.
- **Our hosting provider and Cloudflare**, for the website, the account portal and the server the apps talk to. Cloudflare also counts page views with Cloudflare Web Analytics.
- **Google**, for Google Analytics on the website, the documentation and the account portal.
- **Crisp**, for the live chat on every page of the website and the account portal.
- **jsDelivr**, which serves {merchant}'s checkout script to your browser when you point at a Buy button.
- **Mintlify**, which hosts the documentation at docs.tablepro.app.
- **ip-api.com, ipinfo.io and geoplugin.net**, which receive IP addresses from usage reports for the country lookup.
- **GitHub**, which hosts the update feed, the plugin catalog and the downloads.

We do not sell personal data and do not share it with advertisers.

## International transfers {#transfers}

The services above operate in several countries, so your data may be processed outside your own. {merchant}, Google, GitHub, Cloudflare and Mintlify process data in the United States; Google does so under the EU-US Data Privacy Framework and Standard Contractual Clauses. Where the law requires it, transfers from the EEA and the UK rely on Standard Contractual Clauses or another approved mechanism.

## How long we keep data {#retention}

- **Usage reports**, with their IP addresses and countries: no time limit has been set, and nothing deletes them automatically.
- **License records**: the activated Macs' IDs and names, and the log of license requests with their IP addresses, are kept while the license exists. Nothing deletes them automatically.
- **Orders**: kept for tax and accounting.
- **Team Library**: until it is published again, the member who published it is removed, or you ask us to delete it. It stays after a license ends.
- **Account sign-in links**: they expire after 15 minutes and are then deleted. Portal sessions last 2 hours.
- **Newsletter**: until you unsubscribe, or until we delete the address at your request.
- **Google Analytics**: user-level and event-level data for 2 months, Google's default retention period, which our property uses. Its cookies last up to 2 years, or are deleted when you decline.
- **Cloudflare Web Analytics**: Cloudflare shows us the last six months of page-view totals. Nothing is stored in your browser.
- **Live chat and support emails**: kept by Crisp and in our mailbox until deleted. Ask us to delete your conversations and emails.
- **Web server logs**: kept for security and troubleshooting. We have not set a fixed period for them yet.

## Your rights {#rights}

Depending on where you live, you can ask us to:

- give you a copy of the personal data we hold about you (access);
- correct it (rectification);
- delete it (erasure), except what we must keep by law;
- limit how we use it (restriction);
- send it to you in a structured, machine-readable form (portability);
- stop using it on the basis of legitimate interest (objection).

You can withdraw consent at any time, and you can complain to your data protection authority. To use any of these rights, email [{email}](mailto:{email}). We answer within 30 days. Deleting data is done by hand, so tell us which email address, license key or device it concerns. Data held by {merchant}, Google, Crisp or GitHub is also covered by their own policies.

**California residents.** The California Consumer Privacy Act gives you the right to know what personal information we collect, to ask us to delete it, to opt out of its sale, and not to be treated differently for using these rights. We do not sell personal information.

## Children {#children}

TablePro is not directed at children under 16, and we do not knowingly collect their personal data. If you believe a child has given us personal data, contact us and we will delete it.

## Security {#security}

Traffic between the apps, the website, the account portal and our server uses HTTPS. The country lookups described under [Usage report](#mac-usage-report) are the exception: they are made over unencrypted HTTP. Account sign-in links are stored only as hashes, and access to our systems is limited to the people who run TablePro. No system is perfectly secure. To report a vulnerability, email [{email}](mailto:{email}).

## Changes to this policy {#changes}

When this policy changes, we update it here with a new "Last updated" date, and where the law requires it, we tell you directly.

## Contact {#contact}

For questions about privacy or this policy, email [{email}](mailto:{email}).
