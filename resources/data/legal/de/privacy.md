---
title: Datenschutzerklärung
description: Welche Daten TablePro erhebt, wofür, wer sie erhält, wie lange sie bleiben und welche Rechte du hast.
updatedAt: "2026-11-07"
---

Diese Erklärung gilt für TablePro auf Mac, Linux, iPhone und iPad; tablepro.app; docs.tablepro.app; sowie Konto, Käufe, Support und Newsletter. Das [technische Verzeichnis](https://docs.tablepro.app/security/privacy) nennt Felder, Ziele und Einstellungen. Der Code steht im [öffentlichen Repository]({github}).

## Kurz erklärt {#summary}

Normale Abfragen und Ergebnisse gehen zwischen deinem Gerät und deiner Datenbank hin und her. Nutzungsdaten enthalten weder SQL noch Zeilen oder Zugangsdaten. Was du in Team Library veröffentlichst, dem Support sendest oder mit KI und externen Werkzeugen teilst, erreicht diese Empfänger.

Nutzungsdaten sind auf Mac und Linux standardmäßig eingeschaltet und abschaltbar. Die veröffentlichte iPhone/iPad-App sendet erst nach Zustimmung. Direkte Analysen können mit Konto und Käufen verknüpft werden. Abschalten stoppt weder Kontoanfragen noch Serveranalysen.

Die Website misst Besuche und lädt Crisp auf jeder Seite. Google-Analytics-Cookies erfordern deine Wahl. Newsletter messen Öffnungen und Klicks. Beim Löschen des Kontos bleiben Daten zurück, auch bei PostHog und Crisp. Lies [Aufbewahrung](#retention) und [Rechte](#rights). Der [Verantwortliche](#controller) bearbeitet Anfragen auch ohne Konto.

<span id="contact"></span>

## Verantwortlicher {#controller}

{publisherName}, selbstständiger Entwickler in {publisherCountry}, ist für die beschriebenen personenbezogenen Daten verantwortlich. Kontakt: [{email}](mailto:{email}). Wir haben keinen Datenschutzbeauftragten. Für Teams verwalten wir Konto-, Einladungs- und Dienstdaten als Verantwortlicher. Veröffentlichte Team Library-Inhalte verarbeiten wir nach Weisung des Teams. Es bestimmt Inhalt und Zugriff.

<span id="lawful-basis"></span>

## Daten und Zwecke {#data-use}

Für EWR und Vereinigtes Königreich nennen wir je Zweck die Rechtsgrundlage: Vertrag (Artikel 6(1)(b)), berechtigtes Interesse (6(1)(f)), Einwilligung (6(1)(a)) oder gesetzliche Pflicht (6(1)(c)). Es gibt keine automatisierten Entscheidungen mit rechtlichen oder ähnlich erheblichen Folgen.

<span id="mac-account"></span>

### Konten und Geräte {#account}

Kostenlose lokale Nutzung braucht kein Konto. Kontodienste benötigen deine E-Mail-Adresse. Wir speichern Name, Sprache, Anmeldearten, Lizenzen, Bestellungen, Geräte, Teamrollen und Arbeitsplätze. Mac/Linux-Geräteregistrierung sendet Maschinenkennung, Gerätename, Plattform und App-/Systemversionen. Der Gerätename kann deinen Namen enthalten. Das ist von Nutzungsdaten getrennt. Zweck und Grundlage sind Konto und Tarif nach Vertrag.

Die Anmeldung nutzt E-Mail-Links und Codes, Passkeys, Apple, GitHub oder Google. Passkey-Daten umfassen öffentlichen Schlüssel, Name, Synchronisierungsstatus und Nutzungsdaten. Identitätsanbieter liefern ID und bestätigte E-Mail, Apple gegebenenfalls den Namen. Apples Token wird verschlüsselt und beim Trennen oder Kontolöschen widerrufen. Kontoänderungen werden mit IP und User-Agent protokolliert. Unser berechtigtes Interesse ist Kontoschutz und Aufklärung von Missbrauch.

Im [Kontoportal]({account}) bearbeitest du Profil und Anmeldung, verwaltest Geräte, exportierst JSON und löschst das Konto. Löschen geht nicht, solange dir ein Team mit weiteren Mitgliedern gehört. Es beendet Abos ohne Erstattung. [Aufbewahrung](#retention) erklärt die verbleibenden Daten.

### Käufe {#purchases}

{merchant} (Polar Software, Inc.) ist Merchant of Record und Wiederverkäufer. Er erhebt Name, E-Mail, Rechnungsadresse und Zahlungsdaten nach eigenen Bedingungen. Er bearbeitet Zahlungen, Steuern, Belege und Streitfälle. Vollständige Kartendaten erreichen uns nie.

Wir senden Kauf, Sprache, Besuchsquelle und IP für Zahlung, Steuer und Währung. Wir erhalten Käufer-/Rechnungsdaten, Beträge, Bestell-/Abo-IDs, Verlängerungen, Kündigungen und Erstattungen. Bestellungen behalten E-Mail, Land, Beträge und Herkunft. Gastkäufe erzeugen bei Bedarf ein unbestätigtes Konto für die Adresse. Kündigungsgründe und Kommentare gehen an {merchant} und bleiben beim Abo. Die Verarbeitung erfüllt den Kaufvertrag; Steuer-/Buchhaltungsdaten dienen gesetzlichen Pflichten. Ohne erforderliche Angaben kann der Kauf nicht abgeschlossen werden. Rechnungen verwaltest du im [{merchant}-Portal]({portal}); siehe [Bedingungen](/de/terms) und [Erstattungen](/de/refund-policy).

### Teams und geteilte Inhalte {#library}

Einladende geben E-Mail, Rolle und Arbeitsplatzwahl an. Eigentümer und Admins sehen Namen, E-Mails, Einladungen und Teamänderungen samt eingeladener Adressen, aber keine Audit-IP oder Browser. Mitglieder sehen Team, Tarif, Arbeitsplätze und eigene Rolle. Diese Daten dienen dem vertraglichen Teamdienst.

Auf Mac sendet Veröffentlichen in Team Library Verbindungseinstellungen und gespeicherte Abfragen an unseren Server für berechtigte Mitglieder. Dazu gehören Host, Port, Datenbank, Benutzer, SSH/SSL, Startbefehle, Tunnel Command und KI-Einstellungen. Abfragen enthalten Namen, SQL, Schlüsselwörter und Ordner. Passwortfelder werden ausgeschlossen; Geheimnisse in SQL oder Freitext werden nicht entfernt. Der letzte Bearbeiter wird angezeigt. Ein Teamaustritt löscht gemeinsame Inhalte nicht. Siehe [Löschfristen](#retention). Team Catalog schreibt stattdessen Dateien in einen gewählten gemeinsamen Ordner.

### Nutzungs- und Dienstanalysen {#analytics}

Unser berechtigtes Interesse ist, Nutzung zu verstehen, Fehler zu beheben und Käufe zu messen. Mac und Linux senden die unter [Apps](#apps) genannten Daten. Der Server sendet PostHog Ereignisse zu Anmeldungen, Käufen, Geräten und Teams mit Konto-IDs, ohne Namen/E-Mails. IDs verbinden App- und Dienstnutzung. Der Schalter stoppt App-Ereignisse, nicht erforderliche Kontoanfragen oder Serverereignisse. Nutze [deine Rechte](#rights) für Widerspruch oder Löschung.

### Newsletter und E-Mail {#newsletter}

Amazon SES versendet Codes, Einladungen, Kontohinweise und Newsletter. Dienstmails erfüllen den angeforderten Dienst. Neue Newsletter-Abos brauchen Bestätigung und Einwilligung. Wir speichern Adresse, Sprache, Anmelde-/Bestätigungszeiten, IPs, User-Agents, Anmeldeseite und Einwilligungsversion.

Jeder Newsletter misst Öffnungen und Klicks aller Empfänger per Bild und `links.news.tablepro.app`. Amazon SES erhält Zeit, Link, IP und User-Agent und gibt sie zur Zählung an den Server. Bilderblockierung verhindert Öffnungs-, nicht Klickmessung. Abmelde- und E-Mail-Links werden nicht verfolgt. Es gibt keinen eigenen Messschalter. Melde dich im Newsletter oder per Ein-Klick-Funktion des Mailprogramms ab; danach kommt keine Bestätigungsmail. Erneute Anmeldung braucht Bestätigung. Dauerhafte Rückläufer und Spammeldungen stoppen den Versand. Löschung der Adresse über [Kontakt](#controller).

Die alte Liste übernahm alle nicht abgemeldeten Adressen, bestätigt oder nicht, einschließlich Käufer, Lizenzinhaber und Beta-Anmeldungen. Abmeldungen blieben erhalten; Rückläufer/Beschwerden kamen auf die Sperrliste. Siehe [Aufbewahrung](#retention).

### Support {#support}

Nachrichten, Anhänge und Diagnosen erreichen uns und den gewählten Supportdienst. Sie können von dir beigefügte Daten oder Geheimnisse enthalten. Crisp erhält beim Laden IP, Browser und besuchte Seiten auf Website und Portal. Bei Gesprächsbeginn behält es die IP. Wir geben Sprache und im angemeldeten Portal Konto-E-Mail und ID weiter. Das Laden auf jeder Seite dient unserem berechtigten Supportinteresse. Begonnene Gespräche beruhen auf Einwilligung.

## Deine Apps {#apps}

| App und Version | Nutzungsdaten | Einstellung |
| --- | --- | --- |
| Mac 0.86.0, ab 0.86.0-beta.1 | Direkt an PostHog; eingeschaltet | Settings > General > Privacy |
| Linux ab 0.1.0-beta.1 | Direkt an PostHog; eingeschaltet | Preferences > General > Privacy |
| Veröffentlichtes iPhone/iPad | Bericht über unseren Server; bis Zustimmung aus | Settings > Privacy |

<span id="mac-local"></span>

### Daten auf dem Gerät {#local-data}

Verbindungen, Abfrageverlauf, lokale Protokolle und Tabs bleiben auf dem Gerät, außer bei gewählter Freigabe. Datenbankverkehr geht an deine Server. Passwörter nutzen den Anmeldedatenspeicher der Plattform. Mac verweist auf SSH-Schlüssel an ihrem Speicherort. Analysen enthalten keine Hosts, Benutzernamen, SQL, Zeilen oder Zugangsdaten. [Integrationen](#integrations), Team Library und Support haben die beschriebenen Ausnahmen.

### Mac {#mac-app}

Direkte Analyse und Kontoverhalten gelten ab 0.86.0 einschließlich 0.86.0-beta.1. Anmeldung registriert den Mac und lädt den Tarif. Der Kontotoken bleibt im lokalen Keychain und synchronisiert nie über iCloud Keychain. Eine vorhandene Lizenz wird gegen Anmeldung getauscht und lokal gelöscht.

#### Mac-Nutzungsdaten {#mac-usage-report}

Standardmäßig an, ohne Frage vor dem ersten Ereignis. Schalte **Share usage data** unter **Settings > General > Privacy** aus. Start mit ausgeschalteter Option startet die PostHog-Bibliothek nicht. Keine automatischen Absturzberichte; PostHogs Absturzerfassung ist deaktiviert.

Ereignisse umfassen tägliche Nutzung mit Typen/Anzahl offener Verbindungen, ersten Versuch, Erfolg und erste Abfrage nach Datenbanktyp, gesperrte Bezahlfunktionen und Gründe, Upgrade-Klicks, Anmeldeart/Abmeldung sowie Lizenzkauffragen und Antworten. PostHog ergänzt Geräte-, Bildschirm-, Netzwerk-, Sitzungs-, App- und Systemkontext. Es erhält IP und schätzt den Ort. Vor Anmeldung: zufällige Installations-ID ohne Personenprofil. Danach: Konto-ID mit Versionen, Architektur, Sprache und Ort im Profil. Abmeldung erzeugt neue Zufalls-ID. Siehe [Felder und Ziele](https://docs.tablepro.app/security/privacy#usage-data).

#### Updates und Plugins {#mac-updates}

Updatefeed und Pluginkatalog kommen von GitHub über updates.tablepro.app. Downloads und Downloadzahlen erreichen ebenfalls GitHub. Anfragen tragen IP und User-Agent. Schalte **Automatically check for updates** unter **Settings > General > Software Update** aus, um automatische Prüfungen zu stoppen. Für den Katalog gibt es keinen Ausschalter. [Technische Details](https://docs.tablepro.app/security/privacy#update-checks) nennen auch den alten Feed.

#### Ältere Mac-Versionen {#mac-license}

Vor 0.86.0 steuert derselbe eingeschaltete Schalter einen Serverbericht. Er enthält gehashte Maschinen-ID, System-/App-Daten, Verbindungstypen/-anzahl, Lizenzstatus und erste Versuch-/Erfolgsdaten. Gesendete Updateeinstellungen werden verworfen. Der aktuelle Server leitet an PostHog mit Cloudflare-Land weiter, ohne IP oder Lizenzschlüssel und ohne Personenprofil. Die Maschinen-ID kann Kontogeräte verknüpfen. Heute gibt es keinen eigenen Heartbeatverlauf, aber Jobs, Logs, Backups und Altarchiv können Daten behalten. Siehe [Aufbewahrung](#retention).

Alte Versionen kontaktieren den Lizenzdienst erst nach Schlüsseleingabe. Prüfungen senden Schlüssel, ID, Mac-Name und Versionen. Geräte gehören zum Konto; Aktivierung/Deaktivierung wird mit IP und User-Agent protokolliert. Das [Verzeichnis](https://docs.tablepro.app/security/privacy#older-mac-reports) nennt Felder und Zeiten.

### iPhone und iPad {#ios-app}

Die veröffentlichte App sendet erst nach **Share Usage Data** beim ersten Start oder unter **Settings > Privacy**. Grundlage ist Einwilligung. Ein täglicher Bericht geht über den Server ohne IP, mit Cloudflare-Land und ohne Personenprofil an PostHog. Er enthält gehashte Apple-Gerätekennung, Plattform, Versionen, Architektur, Sprache, Verbindungstypen/-anzahl und Zeitpunkte von erstem Versuch, Erfolg und erste Abfrage. Er meldet stets keine Lizenz und enthält keine Updateeinstellungen. Konto-, Lizenz-, Update- oder Pluginprüfungen fehlen.

Datenbank/SSH, optionales iCloud und Microsoft-Entra-Anmeldung für SQL Server senden an diese Dienste. Passwörter/eingefügte SSH-Schlüssel bleiben im Keychain; Zertifikate und Verlauf lokal. Verbindungen kommen in den lokalen Spotlight-Index. Live Activity kann SQL am Sperrbildschirm anzeigen, außer mit Hide Query. Apples separate Einstellung Share With App Developers kann Abstürze und Statistiken über App Store Connect an uns geben. Die App hat keinen Absturzmelder und keine externe Analysebibliothek. Siehe [iOS](https://docs.tablepro.app/ios#privacy).

### Linux {#linux-app}

Ab 0.1.0-beta.1 registriert Anmeldung das Gerät laut [Konten](#account). Geheimnisse liegen im Desktop-Schlüsselbund. Paketupdates folgen deinem Distributor. Die App sendet keine automatischen Absturzberichte.

#### Linux-Nutzungsdaten {#linux-usage-data}

Ab 0.1.0-beta.1 standardmäßig an. Share usage data unter Preferences > General > Privacy ausschalten. Direkt an PostHog EU gehen tägliche Nutzung mit Verbindungstypen/-anzahl, erster Versuch/Erfolg und Abfrage nach Typ, Anmeldung/Abmeldung, Upgrade-Klicks und Lizenzfragen/Buy-Antworten. Sie tragen Installations-/Konto-ID, Versionen, Architektur, Sprache und SDK-Metadaten. PostHog erhält IP und schätzt den Ort. Vor Anmeldung Zufalls-ID ohne Profil, danach Konto-Profil mit Verbindung zu Käufen. Abmeldung setzt die ID zurück. Keine Hosts, SQL, Zeilen oder Zugangsdaten. Geräteregistrierung enthält den Hostnamen separat.

Ausschalten stoppt neue Sendungen. Laufende Anfragen können enden. Frühere Ereignisse bleiben; Kontoanfragen und Serveranalyse laufen weiter. Siehe [Aufbewahrung](#retention), [Rechte](#rights) und [Verzeichnis](https://docs.tablepro.app/security/privacy#linux-usage-data).

<span id="mac-third-parties"></span>

## Gewählte Dienste {#integrations}

Datenbank-, SSH- und Proxyanbieter erhalten angeforderten Verkehr direkt aus der App. Anmeldedienste erhalten Authentifizierung, wenn eingerichtet. Apple Maps liefert Karten, DuckDB genutzte Erweiterungen. Heruntergeladene Verbindungs-/KI-Helfer kontaktieren ihre Anbieter. Deren Bedingungen gelten.

### iCloud und Handoff {#icloud}

Optionales iCloud Sync speichert Verbindungen, Gruppen, Tags, Einstellungen, Abfragen und SSH-Profile in deinem privaten CloudKit. Auf dem Mac werden auch Tabellen- und Datenbankfavoriten, Ordner sowie Namen, Benutzernamen und Passwortmodi von Anmeldedatenprofilen synchronisiert, niemals deren Passwort. Apple hostet es; wir können es nicht lesen. Passwortsync ist separat und standardmäßig aus, über Ende-zu-Ende-verschlüsseltes iCloud Keychain. Auf Mac betrifft es weitere dort geschriebene Geheimnisse wie KI- und alte Lizenzschlüssel. Kontotokens synchronisieren nie. Mac braucht Pro oder Team, iOS ist kostenlos. Handoff übergibt Verbindungs-ID und Tabellenname oder ohne Tabelle Verbindungsname/Host zwischen Apple-Geräten, ohne Zugangsdaten. Siehe [Einstellungen](https://docs.tablepro.app/features/icloud-sync).

### KI und externe Werkzeuge {#ai-tools}

KI-Anfragen gehen direkt an deinen Anbieter oder ein lokales Modell. Prompts, Schema, SQL und Gespräch können übertragen werden. Rasterzeilen anzuhängen ist standardmäßig aus. Ergebnisse eines erlaubten KI-Abfragewerkzeugs gelangen unabhängig davon ins Gespräch und zum Anbieter. GitHub Copilot lädt einen Helfer von npm; Send telemetry to GitHub ist zunächst an.

MCP ist standardmäßig aus und kann so nicht starten, auch nicht per Bridge oder Kopplung. Eingeschaltet dürfen authentifizierte Clients nach deinen Berechtigungen Daten anfordern. Ein KI-Client kann Ergebnisse an seinen Dienst weitergeben. Externe MCP-Server erhalten freigegebene Argumente. Siehe [KI-/MCP-Kontrollen](https://docs.tablepro.app/security/privacy#ai-providers).

## Websites und Browserspeicher {#website}

Server und Cloudflare erhalten IP, User-Agent und Seiten. Cloudflare Web Analytics zählt Aufrufe, Quellen, Ladezeiten, Browser-/System-/Gerätetypen und Länder ohne Browserspeicher oder Fingerprinting. Das berechtigte Interesse ist Verständnis und Betrieb der Website.

Google Analytics lädt im Consent Mode. Vor Allow sendet es ein Signal ohne Cookie oder gespeicherte Geräte-ID. Einwilligung aktiviert Cookies und Besuchs-, Download- und Kaufmessung. Werbespeicher, Personalisierung und Werbenutzerdaten bleiben verweigert. Laut Google speichert GA4 keine IPs.

Crisp lädt überall auf Website und Portal laut [Support](#support). Zeigen oder Tab auf Buy lädt das {merchant}-Skript von jsDelivr mit IP/Browser; Klicken öffnet Checkout. Formularbeginn lädt Turnstile gegen Missbrauch, berechtigtes Interesse. Länderabfragen/Zeitzone dienen Sprach- und Rabattvorschlägen unter berechtigtem Interesse; Anfragen ohne Cookies, Antworten nicht auf der Seite gespeichert.

Der erste Besuch erzeugt `tablepro:attribution` für 90 Tage: Tags/Quelle, Einstiegsseite und Datum. Beim Kauf übergibt der Server die Quelle als Metadaten an {merchant}, behält sie bei der Bestellung und sendet sie mit Checkout/Zahlung an PostHog. Einstiegsseite und Datum bleiben nicht. Grundlage ist berechtigtes Interesse an Kaufquellen. Öffentliche Newsletter-, Checkout- und Rabattanfragen lassen Zugangsdaten aus und setzen kein Portalcookie. Das Portal führt kein Analyseskript aus, der Server sendet Dienstereignisse.

### Dokumentation {#docs}

Mintlify hostet docs.tablepro.app. Seiten-, Google Fonts und GitHub-Sterneanfragen geben den Anbietern IP/Browser. Docs fragt separat nach Analysezustimmung. Vor Allow keine Analysecookies oder Besucher-ID. Allow aktiviert Google Analytics und Mintlify-ID. Cookie settings im Docs-Fußbereich widerruft und entfernt sie. Die Websitewahl gilt dort nicht.

### Cookies und Speicher {#cookies}

Cloudflare Web Analytics speichert nichts im Browser. Öffentliche Seiten setzen keine eigenen Cookies. Diese Fristen unterscheiden sich von Anbieteraufbewahrung. Notwendiger Speicher erhält Anmeldung oder Wahl; Einwilligung und berechtigte Interessen sind hier beschrieben.

| Name/Dienst | Zweck und Auslöser | Dauer und Kontrolle |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | Google Analytics nach Einwilligung | Bis 2 Jahre; Ablehnen löscht |
| `tablepro:analytics-consent` | Notwendige Wahl, separat Website/Docs | Bis gelöscht |
| `tablepro:attribution` | Erstquelle beim Checkout; berechtigtes Interesse | 90 Tage |
| `theme`, `tablepro:language`, `tablepro:campaign-closed`, `tablepro:linux-install` | Aussehen, gewählte/verworfene Sprachen, geschlossener Angebotshinweis, gewählte Linux-Installationsmethode; berechtigtes Interesse | Bis gelöscht; Portaldesign separat |
| `mintlify_anonymous_id` | Docs-ID nach dortiger Einwilligung | Bis gelöscht oder abgelehnt |
| `crisp-client/`-Cookies | Chatfortsetzung nach Laden auf jeder Seite; berechtigtes Interesse | 6 Monate, bei Rückkehr erneuert |
| `__Host-tp_session` | Notwendige Portalanmeldung | 30 Tage angemeldet; beim Anmelden höchstens 10 Minuten; Abmeldung löscht |
| `locale`, `context`, `sign-in-return-to` | Sprache, Personal/Team-Ansicht, Rückkehrseite; berechtigtes Interesse | Erste zwei bis gelöscht; Rückkehr 15 Minuten |

Ändere die Analysewahl mit Cookie settings im Fußbereich oder hier:

<cookie-settings></cookie-settings>

## Empfänger {#sharing}

| Empfänger | Daten und Zweck |
| --- | --- |
| [OVH]({ovhPrivacy}) | Server und Dienstdaten |
| [Cloudflare]({cloudflarePrivacy}) | DNS/Proxy, R2 und Backups, Turnstile, Cloudflare Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | Amazon SES Mail, Zustellung und Newsletterinteraktion; CloudFront-Links, SNS/SQS-Ereignisse |
| [PostHog EU]({posthogPrivacy}) | App-/Serveranalyse; IDs ohne Namen/E-Mail; direkte Anfragen mit IP |
| [{merchant}]({merchantPrivacy}) | Unabhängiger Merchant of Record; Checkout, Abrechnung, Käufe |
| [Crisp]({crispPrivacy}) | Chat, Browser/Seiten und angemeldete Kontoidentität |
| [Google]({googlePrivacy}) | Website-/Docsanalyse und Schriften; gewählte Anmeldung |
| [Mintlify]({mintlifyPrivacy}) | Docshosting und erlaubte Besuchsmessung |
| [GitHub]({githubPrivacy}) | Downloads, Updates, Plugins, Sterne, öffentliche Issues, optionale Anmeldung |
| [Apple]({applePrivacy}) | Optionale Anmeldung; Dienste/Diagnosen laut Apps/Integrationen |
| [jsDelivr]({jsdelivrPrivacy}) | Checkoutskript mit IP/Browser |

Teammitglieder erhalten Inhalte und Kontodetails nach Rolle. Integrationen erhalten, was du ihnen sendest. Wir verkaufen keine Daten und teilen sie nicht für Werbung. Andere Offenlegung nur bei gesetzlicher Pflicht. Anbieterregeln gelten ebenfalls.

## Verarbeitungsorte {#transfers}

OVH und Amazon SES liegen in Singapur (`ap-southeast-1` für SES). PostHog liegt in der EU, Crisp sitzt in Frankreich. {publisherName} arbeitet aus Vietnam. US-Anbieter, darunter {merchant}, Google, GitHub, Cloudflare, Amazon Web Services und Mintlify, verarbeiten in den USA. Speicher und Backups können andere Länder betreffen. Erforderliche EWR/UK-Garantien nutzen Standardvertragsklauseln oder andere genehmigte Mechanismen der Anbieter; Google auch EU-US Data Privacy Framework. Informationen über [Kontakt](#controller).

## Aufbewahrung {#retention}

Wo angegeben, haben wir keine Zeitgrenze festgelegt. Kontolöschung löscht nichts bei PostHog oder Crisp. Schreibe über [Kontakt](#controller), damit wir die Daten dort auf Wunsch löschen.

| Daten | Aufbewahrung und Löschung |
| --- | --- |
| PostHog-Analyse | Keine festgelegte Grenze. Abschalten lässt alte Ereignisse bestehen. Löschung anfragen. |
| Jobs und Serverlogs | Jobs halten Berichte während Sendung/Wiederholung. Logs dienen Sicherheit/Fehlersuche. Keine Gesamtfrist; keine Zusage ohne Serverkopien. |
| Geräte | Auch entfernte, bis Kontolöschung |
| Konto und Audit | Konto, Anmeldung, Geräte, Lizenzen und Mitgliedschaften werden gelöscht. Audits bleiben ohne Grenze; E-Mail-Felder und Akteur-IP/User-Agent verschwinden, Adressen im Freitext können bleiben. |
| Bestellungen und Anbieterhinweise | Steuer-/Buchhaltungsbestellungen ohne feste Grenze. Konto-/E-Mail-Verknüpfung wird entfernt. {merchant}-, Amazon-SES- und Apple-Ereignisse bleiben; persönliche Kauf- und Mail-Empfänger/Interaktionsdaten werden für das gelöschte Konto bereinigt. |
| Team Library | Gelöschtes Element behält letzte Version für Sync. Normale Teamlöschung entfernt Bibliothek nach 30 Tagen, davor wiederherstellbar. Konto des einzigen Eigentümers löschen entfernt beides sofort. Lizenzende löscht nicht. |
| Authentifizierung | Links/Codes verfallen nach 15 Minuten, Löschung 7 Tage später. Portalsitzung 30 Tage. Apptokens verfallen 90 Tage nach Nutzung, Löschung 30 Tage danach. Mailjobs behalten Klartext bis Bereinigung: einen Tag nach Versand oder 7 nach Aufgabe. |
| Newsletter | Neue unbestätigte Adressen nach 30 Tagen gelöscht. Bestätigte/migrierte bis Anfrage oder Löschung des zugehörigen Kontos. Abmeldung behält Adresse als abgemeldet. |
| Sperrliste | Rückläufer-/Beschwerdeadressen und erste/letzte Daten bleiben nach Konto-/Abolöschung gegen weitere Mail. Keine Grenze. |
| Google Analytics | Nutzer-/Ereignisdaten 2 Monate; Standard-Gesamtberichte separat |
| Cloudflare Web Analytics | Aufrufzahlen der letzten sechs Monate verfügbar |
| Support | Crisp und Mail bis Löschung, auch auf Anfrage. Keine feste Grenze. |
| Backups und Migrationsarchiv | Keine Grenze. Kontolöschung entfernt diese Kopien nicht. Altes Gesamtarchiv enthält Namen/E-Mails, Lizenzen, Bestellungen, Teams, Gerätenamen, Abonnenten, Beta-Anmeldungen, Mails, Nutzungsberichte und Lizenzlogs mit IP. |

## Wahl und Rechte {#rights}

Nutze Appschalter, Cookie settings auf Website/Docs und Newsletterabmeldung. Widerruf wirkt künftig, ohne frühere Verarbeitung ungültig zu machen. Schalter löschen keine Altdaten und stoppen keine Serveranalyse. In [Portal-Settings]({account}) exportierst oder löschst du das Konto; das deckt nicht alle aufbewahrten Daten ab.

Je nach Wohnort kannst du Auskunft, Berichtigung, Löschung, Einschränkung, Übertragung oder Widerspruch gegen berechtigtes Interesse verlangen. Kein Konto nötig: schreibe über [Kontakt](#controller). Wir können zum Auffinden nötige Angaben wie Installations-ID erfragen. Sende nie einen Lizenzschlüssel unverschlüsselt per E-Mail. Wir antworten binnen eines Monats. Du kannst dich bei deiner Datenschutzbehörde beschweren. Gesetzliche Pflichten können Löschung begrenzen.

### Regionale Rechte {#regional-rights}

**Einwohner Kaliforniens.** Der California Consumer Privacy Act gibt dir das Recht zu erfahren, welche personenbezogenen Informationen wir erfassen, ihre Löschung zu verlangen, dem Verkauf zu widersprechen und für die Ausübung dieser Rechte nicht anders behandelt zu werden. Wir verkaufen keine personenbezogenen Informationen.

## Kinder {#children}

TablePro richtet sich nicht an Kinder unter 16, und wir erheben ihre Daten nicht wissentlich. Wenn ein Kind uns Daten gegeben haben könnte, kontaktiere uns zur Löschung.

## Sicherheit {#security}

Unsere Dienste nutzen HTTPS. Konten haben keine Passwörter. Anmeldedaten und Team-API-Tokens werden gehasht gespeichert, außer dem zeitweiligen Mailjob laut [Aufbewahrung](#retention). Zugriff haben nur {publisherName} und die [Empfänger](#sharing). Kein System ist vollkommen sicher. Melde Schwachstellen auf der [Sicherheitsseite](/de/security#report).

## Änderungen {#changes}

Die Seite zeigt ihr Aktualisierungsdatum. Ältere Versionen bleiben im [öffentlichen Web-Repositoryverlauf]({webGithub}/commits/main/resources/data/legal/en/privacy.md). Wir aktualisieren vor neuen Zwecken, informieren direkt, wenn gesetzlich nötig, und holen erforderliche neue Einwilligung ein.
