---
title: Datenschutzerklärung
description: Welche Daten die TablePro-Apps, die Website und das Kontoportal erfassen, wohin sie gehen, wie lange sie bleiben und wie du sie änderst oder löschst.
updatedAt: "2026-10-30"
---

Diese Erklärung gilt für TablePro für Mac, TablePro für iPhone und iPad, die Website tablepro.app, die Dokumentation unter docs.tablepro.app und das Kontoportal account.tablepro.app. Sie beschreibt, was diese heute tatsächlich senden und speichern. Beide Apps sind quelloffen unter der AGPLv3. Den Code, der die unten genannten Daten sendet, kannst du im [TablePro-Repository]({github}) lesen.

## Überblick {#summary}

- Die Mac-App sendet Nutzungsdaten. Dies ist standardmäßig aktiv und kann deaktiviert werden. Die iPhone- und iPad-App sendet einen Nutzungsbericht nur, wenn du es aktivierst.
- Wenn du dich bei einem TablePro-Konto anmeldest oder einen Lizenzschlüssel aktivierst, registriert die Mac-App deinen Mac samt Namen auf unserem Server und prüft dort regelmäßig deinen Tarif.
- Deine Abfragen, Ergebnisse und Passwörter werden nicht an TablePro gesendet. Ausgenommen ist, was du in der Team Library veröffentlichst: Verbindungseinstellungen (niemals Passwörter) und gespeicherte Abfragen.
- KI-Anfragen gehen von der Mac-App direkt an den von dir eingerichteten KI-Anbieter, nicht an uns.
- Ab der Version, die TablePro-Konten einführt, sendet die Mac-App ihre Nutzungsdaten direkt an PostHog, unseren Dienst für Produktanalysen in der EU, das dann die IP-Adresse deines Macs erhält und daraus einen ungefähren Standort ableitet. Frühere Versionen und die iPhone- und iPad-App senden Nutzungsberichte an unseren Server, der sie ohne IP-Adresse an PostHog weiterleitet. Dein Konto führt ein Protokoll der Änderungen daran, etwa Anmeldungen und neue Geräte, mit IP-Adresse und Browser der jeweiligen Anfrage.
- Die Website zählt Seitenaufrufe mit Cloudflare Web Analytics, das keine Cookies setzt. Sie lädt auch Google Analytics, das nur mit deiner Erlaubnis Cookies setzt. Jede Seite lädt außerdem unseren Live-Chat Crisp, der eigene Cookies setzt.
- Das Kontoportal unter account.tablepro.app lädt kein Analyse-Skript. Es setzt ein Cookie, das dich angemeldet hält, und in seinen Einstellungen kannst du die Daten deines Kontos herunterladen oder das Konto löschen.
- Käufe werden von {merchant}, unserem Merchant of Record, abgewickelt.

## Wer verantwortlich ist {#controller}

{publisherName}, ein Einzelentwickler in {publisherCity}, {publisherCountry}, veröffentlicht die TablePro-Apps und diese Website und ist für die hier beschriebenen personenbezogenen Daten verantwortlich (Verantwortlicher für die Datenverarbeitung). Bei Fragen zu dieser Erklärung oder deinen Daten schreibe an [{email}](mailto:{email}).

## TablePro für Mac {#mac-app}

### Nutzungsdaten {#mac-usage-report}

Ab der Version, die TablePro-Konten einführt, sendet die Mac-App Nutzungsdaten direkt an PostHog, unseren Dienst für Produktanalysen, unter `eu.i.posthog.com` in der EU. **Dies ist standardmäßig aktiv, und die App fragt vor dem ersten Ereignis nicht nach.** Zum Deaktivieren öffne **Settings > General > Privacy** und deaktiviere **Share usage data**. Solange die Einstellung aus ist, sendet die App nichts an PostHog, und startet die App mit ausgeschalteter Einstellung, startet sie die Bibliothek von PostHog gar nicht erst.

Die App sendet ein Ereignis:

- einmal täglich während des Betriebs, mit den Namen der Datenbanktypen deiner geöffneten Verbindungen (zum Beispiel „PostgreSQL“) und der Anzahl geöffneter Verbindungen;
- bei deinem ersten Verbindungsversuch, deiner ersten erfolgreichen Verbindung und deiner ersten Abfrage, jeweils mit dem Datenbanktyp;
- wenn sie dir zeigt, dass eine kostenpflichtige Funktion nicht verfügbar ist, einmal pro Funktion und App-Start, mit der Funktion und dem Grund, etwa dass du nicht angemeldet bist;
- wenn du auf ein Upgrade klickst, mit der Stelle in der App, an der du geklickt hast;
- wenn du dich anmeldest, mit der Art (in der App, mit einem Lizenzschlüssel oder durch Einlösen des Schlüssels, der schon auf deinem Mac war), und wenn du dich abmeldest.

Die Bibliothek von PostHog fügt jedem Ereignis das Modell deines Macs, Bildschirmgröße, Zeitzone und Sprache hinzu, ob er über WLAN verbunden ist, Version, Build und Bundle-ID der App, die macOS-Version, die Version der Bibliothek und eine zufällige Sitzungs-ID. PostHog erhält mit jeder Anfrage die IP-Adresse deines Macs und leitet daraus einen ungefähren Standort ab, etwa Land und Stadt. Solange die Einstellung aktiv ist, lädt die Bibliothek außerdem ihre Einstellungen und Feature-Flags von PostHog (`/config` und `/flags`).

Bevor du dich anmeldest, tragen die Ereignisse eine zufällige ID, die die Bibliothek auf deinem Mac erzeugt, und PostHog legt dafür kein Personenprofil an. Sobald du dich anmeldest, tragen sie deine Konto-ID, und das Profil dieses Kontos bei PostHog enthält App- und macOS-Version, Prozessorarchitektur und die Sprache der App. So werden deine Installationen mit deinen Anmeldungen und Käufen verbunden. Beim Abmelden beginnt eine neue zufällige ID. Die Nutzungsdaten der App enthalten keine Rechner-ID, keinen Lizenzstatus und keine Update-Einstellungen mehr.

Versionen vor den TablePro-Konten senden stattdessen einen Nutzungsbericht an `api.tablepro.app`, unter derselben Einstellung, etwa zehn Sekunden nach dem Start und danach einmal täglich während des Betriebs. Ein Bericht enthält:

- eine Rechner-ID: einen SHA-256-Hash der Hardware-UUID deines Macs (die UUID selbst wird nie gesendet);
- die Plattform, die App-Version, die macOS-Version, die Prozessorarchitektur und die Sprache der App;
- die Namen der Datenbanktypen deiner geöffneten Verbindungen (zum Beispiel „PostgreSQL“) und wie viele Verbindungen geöffnet sind;
- ob eine Lizenz aktiviert ist;
- Datum und Uhrzeit deines ersten Verbindungsversuchs und deiner ersten erfolgreichen Verbindung;
- deine Update-Einstellungen (Installation und Häufigkeit der Prüfungen). Unser Server verwirft diese beim Eingang des Berichts.

Weder die Ereignisse noch die Berichte enthalten Hostnamen, Benutzernamen, Passwörter, Abfragen oder Zeilen.

Unser Server speichert weder den Bericht noch die IP-Adresse, von der er kam. Er leitet den Bericht als Ereignis zur Rechner-ID an PostHog weiter, mit dem Land, das Cloudflare für deine Verbindung angibt, ohne deinen Lizenzschlüssel und ohne deine IP-Adresse; PostHog legt daraus kein Personenprofil an. Da dein Konto seine Geräte unter derselben Rechner-ID führt, lassen sich Berichte eines Macs, auf dem du dich angemeldet oder eine Lizenz aktiviert hast, deinem Konto zuordnen.

### Lizenzprüfungen {#mac-license}

Die Mac-App kontaktiert unseren Lizenzserver erst, nachdem du einen Lizenzschlüssel eingegeben hast. Dies geschieht bei der Aktivierung, beim Start, wenn seit der letzten Prüfung mindestens {revalidateDays} Tage vergangen sind, und danach alle {revalidateDays} Tage. Jede Prüfung sendet:

- deinen Lizenzschlüssel;
- die oben beschriebene Rechner-ID;
- den in macOS festgelegten Namen deines Macs (er enthält oft deinen eigenen Namen);
- die App-Version und die macOS-Version.

Die Deaktivierung eines Macs sendet nur den Lizenzschlüssel und die Rechner-ID.

Unser Server führt jeden aktivierten Mac als Gerät des Kontos, zu dem die Lizenz gehört: mit Rechner-ID und Namen, App- und macOS-Version und dem Zeitpunkt seiner letzten Meldung. Aktivieren und Deaktivieren eines Macs werden im Audit-Log dieses Kontos mit IP-Adresse und User-Agent der Anfrage erfasst, die regelmäßigen Prüfungen nicht. Das Kontoportal zeigt deine Geräte nach Namen an. Ist unser Server nicht erreichbar, funktionieren die Bezahlfunktionen noch {graceDays} Tage nach der letzten erfolgreichen Prüfung.

### TablePro-Konto {#mac-account}

Ab der Version, die TablePro-Konten einführt, meldest du dich in der Mac-App mit einem [TablePro-Konto](#account) statt mit einem Lizenzschlüssel an. Die App öffnet die Anmeldeseite in einem Browserfenster, in das du auch den Code aus der Anmelde-E-Mail eingeben kannst. Nach der Anmeldung registriert sie deinen Mac als Gerät deines Kontos: die oben beschriebene Rechner-ID, den Namen deines Macs, die Plattform sowie App- und macOS-Version. Danach ruft sie deinen Tarif einmal täglich, solange sie läuft, als signierte Datei von unserem Server ab; diese Datei hält die Bezahlfunktionen bis zu {offlineDays} Tage ohne unseren Server in Betrieb. Das Token, das die App angemeldet hält, liegt nur im macOS-Schlüsselbund dieses Macs und wird nie über den iCloud-Schlüsselbund synchronisiert, auch nicht bei aktivierter Passwortsynchronisierung.

Ein bereits auf deinem Mac gespeicherter Lizenzschlüssel wird einmalig gegen eine Anmeldung bei dem Konto eingetauscht, zu dem er gehört, und dann vom Mac gelöscht. Ein Gerät, das sich 180 Tage nicht gemeldet hat, wird entfernt. Geräte kannst du in der App oder im Kontoportal entfernen, und wenn ein Mac deine Lizenz zum ersten Mal nutzt, schicken wir dir eine E-Mail.

### Team Library {#library}

Die Team Library ist Bestandteil einer Team-Lizenz. Wenn du bei einer Verbindung **Share > Publish to Team Library…** oder in der Favorites-Seitenleiste **Publish Saved Queries to Team…** wählst, lädt die Mac-App die veröffentlichten Inhalte auf unseren Server:

- Verbindungseinstellungen: Host, Port, Datenbankname, Benutzername, SSH- und SSL-Einstellungen, Treiberoptionen, Startbefehle, Tunnel-Command-Einstellungen, Safe-Mode-Stufe und KI-Einstellungen, aber niemals Passwörter;
- gespeicherte Abfragen: ihre Namen, SQL-Texte, Schlüsselwörter und Ordner.

Ab der Version, die TablePro-Konten einführt, lädt die Mac-App jedes Mitglieds mit Arbeitsplatz die Änderungen der Bibliothek beim Start, alle 15 Minuten und nach jeder Veröffentlichung herunter. Eine Veröffentlichung sendet nur, was sich geändert hat, und entfernt nur Einträge, die dieser Mac veröffentlicht hat und nicht mehr enthält. Hat jemand anderes einen Eintrag zuerst geändert, fragt die App, welche Fassung behalten werden soll, und sie zeigt, wer jede Team-Abfrage zuletzt geändert hat. Versionen vor den TablePro-Konten laden die Bibliothek beim Start herunter, höchstens einmal pro Woche. Der veröffentlichende Mac lädt sie unmittelbar danach erneut herunter. Eine erneute Veröffentlichung aus diesen Versionen ersetzt die zuvor veröffentlichten Inhalte. Die Library im Kontoportal zeigt jeden Eintrag mit dem Namen der Person, die ihn zuletzt geändert hat, allen Mitgliedern, die die Bibliothek lesen dürfen; Inhaber und Admins können dort Einträge löschen. Ein gelöschter Eintrag bleibt 90 Tage auf unserem Server, damit jeder Mac die Löschung übernehmen kann. Endet die Lizenz, bleibt die Bibliothek auf unserem Server, bis der Inhaber des Teams das Team löscht, womit auch die Bibliothek gelöscht wird.

Der Team Catalog, die andere Team-Funktion, schreibt Verbindungsdateien ohne Passwörter in einen von dir gewählten freigegebenen Ordner. Er nutzt unseren Server nicht.

### Updates und Plugins {#mac-updates}

- **Update-Prüfungen.** Die Mac-App lädt einmal täglich den Update-Feed von GitHub (`raw.githubusercontent.com`) herunter. Die Anfrage sendet über die üblichen Angaben einer Webanfrage hinaus keine Informationen über deinen Mac: deine IP-Adresse und einen User-Agent mit der App-Version. Zum Deaktivieren öffne **Settings > General > Software Update** und deaktiviere **Automatically check for updates**. Die Updates selbst werden von GitHub heruntergeladen.
- **Plugin-Katalog.** Beim Start der App und beim Öffnen der Plugin-Einstellungen lädt sie die Liste verfügbarer Treiber und Themes von GitHub herunter. Dies lässt sich nicht deaktivieren. Installierte Treiber und Themes werden von GitHub heruntergeladen; der Plugin-Browser liest Downloadzahlen über die GitHub-API.

GitHub erhält bei diesen Anfragen deine IP-Adresse. Für sie gilt die Datenschutzerklärung von GitHub.

### Dienste, die du selbst auswählst {#mac-third-parties}

Die Mac-App sendet Daten an diese Dienste nur, wenn du sie einrichtest, und direkt, niemals über TablePro:

- **Deine Datenbanken, SSH-Server und Proxys**, die das erhalten, was deine Verbindungen ihnen senden.
- **KI-Anbieter.** Wenn du einen Anbieter hinzufügst und den KI-Assistenten oder Inline-Vorschläge nutzt, gehen Anfragen an diesen Anbieter oder an ein Modell auf deinem Mac. Standardmäßig enthält eine Anfrage den Datenbanktyp und -namen, Tabellen- und Spaltendefinitionen aus dem Schema sowie die aktuelle Abfrage. Ergebniszeilen werden nur gesendet, wenn du dies aktivierst. Es gelten die Bedingungen des Anbieters. Das Hinzufügen von GitHub Copilot lädt dessen Sprachserver von npm herunter; seine Einstellung „Send telemetry to GitHub“ ist anfangs aktiv.
- **Anmeldedienste**: Microsoft Entra ID, Google, Amazon Web Services und Cloudflare Access, wenn eine Verbindung sie verwendet.
- **Apple Maps**, das Kartenkacheln liefert, wenn du Ergebnisse auf einer Karte anzeigst.
- **DuckDB**, das DuckDB-Erweiterungen liefert, wenn eine Abfrage sie erstmals verwendet.
- **MCP-Clients.** Der MCP-Server ist standardmäßig aus. Er startet, wenn du ihn aktivierst oder wenn ein eingerichteter MCP-Client die TablePro-Bridge startet oder sich damit koppelt. Er lauscht nur auf deinem Mac (127.0.0.1). Ein verbundener KI-Client wie Claude oder Cursor erhält die angeforderten Ergebnisse und sendet sie nach seinen eigenen Bedingungen an seinen Dienst.
- **MCP-Server, die du hinzufügst.** Eine KI-Sitzung sendet die von dir genehmigten Werkzeugaufrufe mit ihren Argumenten an diesen Server.

### Daten, die auf deinem Mac bleiben {#mac-local}

Passwörter werden im macOS-Schlüsselbund aufbewahrt. Deine Verbindungsliste, dein Abfrageverlauf, Query Insights, Data-Rewind-Snapshots, Einstellungen und offene Tabs werden auf deinem Mac gespeichert. Die App verweist auf SSH-Schlüssel an ihrem Speicherort und kopiert sie nicht. Versionen vor den TablePro-Konten enthalten weder einen Absturzmelder noch eine Analysebibliothek eines Drittanbieters. Ab der Version, die TablePro-Konten einführt, enthält die App die Bibliothek von PostHog, die die oben beschriebenen Nutzungsdaten sendet. Die Bibliothek enthält den Absturzmelder von PostHog, den die App ausgeschaltet lässt, sodass keine Absturzberichte gesendet werden. Sie speichert ihre zufällige ID, ihre Einstellungen und noch nicht gesendete Ereignisse in Dateien unter `~/Library/Application Support/com.TablePro`.

## TablePro für iPhone und iPad {#ios-app}

**Nichts geht an TablePro, solange du „Share Usage Data“ nicht aktivierst**, beim ersten Start oder später unter **Settings > Privacy**. Wenn du es aktivierst, sendet die App einmal täglich einen Bericht an denselben Server wie die Versionen der Mac-App vor den TablePro-Konten. Unser Server leitet ihn auf dieselbe Weise an PostHog weiter, ohne seine IP-Adresse. Der Bericht enthält einen SHA-256-Hash der Kennung, die Apple der App auf deinem Gerät zuweist, Plattform, App- und iOS-Version, Prozessorarchitektur, App-Sprache, Namen der Datenbanktypen deiner geöffneten Verbindungen, deren Anzahl sowie Datum und Uhrzeit deines ersten Verbindungsversuchs, deiner ersten erfolgreichen Verbindung und deiner ersten Abfrage. Er enthält keine Update-Einstellungen und meldet immer, dass keine Lizenz aktiviert ist, da die App beides nicht hat.

Die App führt weder Lizenz- noch Update-Prüfungen oder Plugin-Anfragen aus. Abgesehen vom optionalen Bericht verbindet sie sich nur mit deinen Datenbanken und SSH-Servern, mit Apples iCloud bei aktiviertem iCloud Sync und mit Microsoft, wenn sich eine SQL-Server-Verbindung über Microsoft Entra ID anmeldet.

Auf dem Gerät werden Passwörter und eingefügte SSH-Schlüssel im Schlüsselbund aufbewahrt; Zertifikate werden nie synchronisiert. Der Abfrageverlauf bleibt auf dem Gerät. Deine Verbindungen werden dem lokalen Spotlight-Index hinzugefügt, damit du sie suchen kannst. Während einer Abfrage zeigt ihre Live-Aktivität das SQL auf dem Sperrbildschirm und in der erweiterten Dynamic Island, sofern du nicht **Settings > Live Activities > Hide Query** aktivierst.

Wenn du in den Einstellungen deines iPhones oder iPads Analysedaten mit App-Entwicklern teilst, kann Apple uns Absturzberichte und Nutzungsstatistiken über App Store Connect übermitteln. Die App selbst enthält weder einen eigenen Absturzmelder noch eine Analysebibliothek eines Drittanbieters.

## iCloud Sync und Handoff {#icloud}

iCloud Sync ist auf dem Mac sowie auf iPhone und iPad aus, bis du es aktivierst. Wenn es aktiv ist, gelangen die Datensätze in eine private Datenbank in deinem eigenen iCloud-Konto (Container `iCloud.com.TablePro`). TablePro kann sie nicht lesen.

- Auf dem Mac wählst du, was synchronisiert wird: Verbindungen, Gruppen und Tags, Einstellungen, SSH-Profile, Zugangsdatenprofile (Name und Benutzername, niemals das Passwort), Tabellen- und Datenbankfavoriten, gespeicherte Abfragen (einschließlich SQL-Text) und Tabellenordner. Ein Verbindungsdatensatz enthält Host, Port, Benutzername, Datenbankname, SSH- und SSL-Einstellungen, Startbefehle, das Skript vor dem Verbinden und KI-Regeln. Abfrageverlauf, Data-Rewind-Snapshots und Passwortquellen werden nie synchronisiert.
- iPhone und iPad synchronisieren Verbindungen, Gruppen und Tags.
- Passwörter werden nur synchronisiert, wenn du auf dem Mac unter Sync Categories zusätzlich **Passwords** oder auf iPhone und iPad **Sync Passwords** aktivierst. Dies verwendet den iCloud-Schlüsselbund. Auf dem Mac werden dabei auch andere im Schlüsselbund gespeicherte Geheimnisse synchronisiert, etwa KI-Anbieterschlüssel und der Lizenzschlüssel. Ab der Version, die TablePro-Konten einführt, wird der Lizenzschlüssel gelöscht, sobald er gegen eine Anmeldung eingelöst ist, und das Token, das die App angemeldet hält, wird nie synchronisiert.

Auf dem Mac ist iCloud Sync Bestandteil einer Starter- oder Team-Lizenz. Auf iPhone und iPad ist es kostenlos.

Handoff übermittelt über Apple die ID der offenen Verbindung und den Namen der offenen Tabelle zwischen deinen eigenen Geräten. Ohne offene Tabelle übermittelt es stattdessen den Verbindungsnamen oder bei einer unbenannten Verbindung deren Host. Es sendet keine Einstellungen oder Zugangsdaten.

## Website {#website}

**Hosting.** Die Website und das Kontoportal laufen auf unserem Server hinter Cloudflare. Wie jeder Webserver erhalten sie deine IP-Adresse, den User-Agent deines Browsers und die Adresse jeder angeforderten Seite.

**Cloudflare Web Analytics.** Cloudflare fügt den Seiten der Website sein Web-Analytics-Skript hinzu; das Kontoportal führt es nicht aus. Dein Browser lädt es von `static.cloudflareinsights.com`; es meldet jeden Seitenaufruf an Cloudflare: die Seite, die verweisende Website, die Ladezeit sowie Browser, Betriebssystem und Gerätetyp. Cloudflare ergänzt das Herkunftsland deiner Verbindung. Das Skript setzt keine Cookies und speichert nichts im Browser. Cloudflare erklärt, IP-Adresse und Browserangaben nicht zur Erstellung eines Fingerabdrucks zu verwenden. Cloudflare zeigt uns Summen wie Aufrufe pro Seite oder Land, keine Datensätze einzelner Besucher. Rechtsgrundlage: berechtigtes Interesse.

**Google Analytics.** Die Website lädt Google Analytics auf jeder Seite im Einwilligungsmodus. Bis du in der Cookie-Frage **Zulassen** wählst, setzt es keine Cookies und sendet Google pro Seite nur ein cookieloses Signal, ohne Kennung auf deinem Gerät. Mit deiner Erlaubnis setzt Google Analytics die Cookies `_ga` und `_ga_<ID>` und misst deine Besuche, etwa Seitenaufrufe, Downloadklicks und den Beginn eines Kaufs. Werbespeicherung, Anzeigenpersonalisierung und Nutzerdaten für Werbung bleiben immer abgelehnt. Google erklärt, dass Google Analytics 4 keine IP-Adressen protokolliert oder speichert. Unsere Google-Analytics-Property verwendet Googles standardmäßige Aufbewahrungsfrist: Google löscht erfasste Nutzer- und Ereignisdaten nach 2 Monaten. Googles Standardberichte, die Summen statt Kennungen enthalten, sind davon nicht betroffen. Rechtsgrundlage: deine Einwilligung für die Cookies.

**Live-Chat.** Jede Seite der Website und des Kontoportals zeigt eine Chat-Schaltfläche unseres Anbieters Crisp. Nach dem Laden einer Seite lädt dein Browser das Crisp-Skript von `client.crisp.chat`; Crisp setzt die unter [Cookies und Browserspeicher](#cookies) beschriebenen Cookies. Crisp erhält deine IP-Adresse, Browserangaben, die Adressen besuchter Seiten und deine Nachrichten und speichert deine IP-Adresse, wenn du ein Gespräch beginnst. Wir teilen Crisp die Seitensprache mit. Wenn du im Kontoportal angemeldet bist, geben wir Crisp außerdem die E-Mail-Adresse und die ID deines Kontos, die das Gespräch mit deinem Konto verknüpfen. Weitere Angaben über dich erhält Crisp nicht. Crisp hat seinen Sitz in Frankreich.

**Checkout-Skript.** Wenn du auf eine Kaufen-Schaltfläche zeigst oder sie mit der Tabulatortaste erreichst, lädt dein Browser das Checkout-Skript von {merchant} über jsDelivr (`cdn.jsdelivr.net`). jsDelivr erhält deine IP-Adresse und Browserangaben. Der Checkout selbst öffnet sich bei {merchant} erst nach deinem Klick.

**Newsletter-Prüfung.** Wenn du mit dem Newsletter-Formular beginnst, lädt dein Browser Cloudflare Turnstile von `challenges.cloudflare.com`, um zu prüfen, dass sich ein Mensch anmeldet; Cloudflare erhält deine IP-Adresse und Browserangaben.

**Kaufzuordnung.** Bei deiner Ankunft auf der Website speichert dein Browser 90 Tage lang einen Erstbesuchsdatensatz namens `tablepro:attribution` im lokalen Speicher: die Herkunft des Besuchs (die `ref`- oder `utm_*`-Parameter des gefolgten Links oder die verweisende Website), die Einstiegsseite und den Zeitpunkt. Wenn du einen Kauf beginnst, wird der Datensatz mit der Checkout-Anfrage gesendet. Unser Server übergibt die Herkunft des Besuchs als Metadaten des Checkouts an {merchant}, bewahrt sie nach der Zahlung bei der Bestellung auf und sendet sie mit Checkout und Zahlung an PostHog. Einstiegsseite und Zeitpunkt werden nicht aufbewahrt.

**Dokumentation.** Die Dokumentation unter docs.tablepro.app wird von Mintlify gehostet. Mintlify erhält mit jeder Seite deine IP-Adresse und Angaben zu deinem Browser, und die Seiten laden ihre Schriften von Google Fonts. Die Navigationsleiste zeigt die Anzahl der Sterne des Repositorys, die dein Browser von der API von GitHub abruft; daher erhält auch GitHub deine IP-Adresse und Angaben zu deinem Browser. Diese Anfrage setzt keine Cookies. Die Dokumentation stellt ihre eigene Cookie-Frage, weil sie deine Antwort auf dieser Website nicht lesen kann. Bis du dort **Allow** wählst, setzt sie keine Cookies und speichert keine Besucher-ID. Mit deiner Erlaubnis setzt Google Analytics die Cookies `_ga` und `_ga_<ID>` und misst deine Besuche der Dokumentation, und Mintlify speichert eine zufällige Besucher-ID, `mintlify_anonymous_id`, im lokalen Speicher, um sie zu zählen. Mit **Cookie settings** in der Fußzeile der Dokumentation änderst du deine Antwort; lehnst du ab, wird beides gelöscht. Rechtsgrundlage: deine Einwilligung.

**Sprache und regionaler Rabatt.** Um dir die Seite in deiner Sprache vorzuschlagen, wenn dein Browser keine der angebotenen Sprachen nennt, und um den regionalen Rabatt zu zeigen, der beim Kauf abgezogen würde, fragt die Website Cloudflare (`/cdn-cgi/trace`) und unseren Server, aus welchem Land deine Verbindung kommt, und liest gegebenenfalls die Zeitzone deines Geräts. Keine der beiden Anfragen enthält Cookies, und die Seite behält nichts von den Antworten. Rechtsgrundlage: berechtigtes Interesse.

Das Lesen der Website setzt keine eigenen Cookies. Anfragen zur Newsletter-Anmeldung, zum Checkout und zur Rabattcodeprüfung von der öffentlichen Website lassen Zugangsdaten aus: Sie senden weder Kontoportal-Cookies noch übernehmen sie Cookies aus der Antwort. Das Öffnen von Kontoportalseiten ist davon getrennt: Die Anmeldung dort setzt das unten genannte Portal-Cookie. Alles, was die Website in deinem Browser aufbewahrt, steht unter [Cookies und Browserspeicher](#cookies).

## Käufe {#purchases}

Lizenzen werden von {merchant} (Polar Software, Inc.), unserem Merchant of Record und Wiederverkäufer, verkauft. Du kaufst bei {merchant} nach dessen Käuferbedingungen und Datenschutzerklärung. {merchant} nimmt Zahlungen entgegen, berechnet und entrichtet anfallende Verkaufs- oder Mehrwertsteuer, sendet Belege und Rechnungen und bearbeitet Zahlungsprobleme und Streitigkeiten. Dabei werden Name, E-Mail-Adresse, Rechnungsadresse und Zahlungsdaten erfasst. Wir sehen niemals deine vollständigen Kartendaten.

Wenn du einen Checkout beginnst, teilt unser Server {merchant} mit, was du kaufst, die Sprache deiner Kaufseite, die Herkunft deines Besuchs (siehe [Website](#website)) und deine IP-Adresse, mit der {merchant} Steuern und Währung bestimmt. Von {merchant} erhalten wir deine E-Mail-Adresse, Name und Rechnungsadresse wie von dir eingegeben, deinen Kauf, die Beträge, Bestell- und Abonnement-IDs sowie spätere Änderungen wie Verlängerungen, Kündigungen und Erstattungen. Bei jeder Bestellung bewahren wir E-Mail-Adresse, Rechnungsland und Beträge auf.

Ein Kauf ohne Anmeldung geht an das TablePro-Konto der beim Kauf verwendeten E-Mail-Adresse; gibt es keines, wird es angelegt und bleibt unbestätigt, bis du dich zum ersten Mal anmeldest. Im [Kontoportal]({account}) kannst du Abrechnungszeitraum oder Arbeitsplätze eines Abonnements ändern, es kündigen oder fortsetzen und eine Erstattung anfordern. Bei einer Kündigung gehen der gewählte Grund und ein etwaiger Kommentar an {merchant} und werden beim Abonnement aufbewahrt. Karte, Rechnungen, Steuerangaben und Rechnungsadresse findest du im [Kundenportal von {merchant}]({portal}), das das Kontoportal für dich öffnet. Erstattungen sind in der [Erstattungsrichtlinie](/de/refund-policy) beschrieben, der Umfang einer Lizenz in den [Nutzungsbedingungen](/de/terms).

## Kontoportal {#account}

Im [Kontoportal]({account}) unter account.tablepro.app verwaltest du dein TablePro-Konto: Lizenzen, Geräte, Abrechnung und Teams. Es läuft wie die Website auf unserem Server hinter Cloudflare.

**Dein Konto.** Ein Konto gehört einer Person und wird über eine E-Mail-Adresse identifiziert. Es enthält diese Adresse, den Namen und die Sprache, die du festlegst, deine Anmeldemethoden, die darauf angemeldeten Geräte, deine Lizenzen und Bestellungen, die Teams, zu denen du gehörst, mit deiner Rolle und deinem Arbeitsplatz, sowie ein Audit-Log der Änderungen daran, etwa Anmeldungen, neue Geräte und Teamänderungen, mit IP-Adresse und Browser der jeweiligen Anfrage. Unsere E-Mails erreichen dich in der Sprache deines Kontos.

**Anmeldung.** Wir senden dir einen Link und einen 6-stelligen Code per E-Mail: Der Link funktioniert einmal, für den Code hast du 5 Versuche, und beide laufen nach 15 Minuten ab. Du kannst auch Passkeys hinzufügen; wir speichern zu jedem den öffentlichen Schlüssel, den Namen, den du vergibst, ob er zwischen deinen Geräten synchronisiert wird, und wann er hinzugefügt und zuletzt verwendet wurde. Oder du meldest dich mit Apple, GitHub oder Google an: Der Anbieter teilt uns eine ID für dich und deine bestätigte E-Mail-Adresse mit, Apple beim ersten Mal auch deinen Namen. Wir speichern ID und Adresse bei deinem Konto, bei Apple außerdem ein Token, das wir verschlüsselt aufbewahren und bei Apple widerrufen, wenn du Apple trennst oder dein Konto löschst. Gehört die Adresse eines Anbieters zu einem bestehenden Konto, senden wir diesem Konto vor der Verknüpfung einen Link und einen Code zur Bestätigung, es sei denn, Google verwaltet die Adresse (Gmail oder Google Workspace).

**Deine Teams.** Wenn du jemanden in ein Team einlädst, speichern wir E-Mail-Adresse und Rolle dieser Person und ob die Einladung einen Arbeitsplatz enthält, und senden ihr einen Link, der 7 Tage gilt. Inhaber und Admins sehen die Mitglieder des Teams mit Namen und E-Mail-Adressen, seine Einladungen und sein Audit-Log, das zeigt, wer im Team was geändert hat, eingeladene Adressen eingeschlossen, aber nie eine IP-Adresse oder einen Browser. Mitglieder sehen das Team, seinen Tarif, die Zahl seiner Arbeitsplätze und ihre eigene Rolle.

**Deine Daten.** In den Einstellungen kannst du Namen, E-Mail-Adresse und Sprache ändern, Anmeldemethoden hinzufügen und entfernen, die Daten deines Kontos als JSON-Datei herunterladen und dein Konto löschen. Solange dir ein Team mit weiteren Mitgliedern gehört, lässt es sich nicht löschen. Das Löschen entfernt deine Anmeldemethoden, Geräte, Lizenzen, Teammitgliedschaften und die Teams, die nur aus dir bestehen, und beendet deine Abonnements ohne Erstattung. Was wir danach aufbewahren, steht unter [Wie lange wir Daten aufbewahren](#retention).

**Was das Portal lädt.** Das Portal lädt weder Google Analytics noch Cloudflare Web Analytics noch ein anderes Analyse-Skript und stellt keine Cookie-Frage. Es zeigt den unter [Website](#website) beschriebenen Live-Chat von Crisp, und ein Kauf dort öffnet den Checkout von {merchant} über der Seite. Fehler und Ladezeiten meldet es mit Grafana Faro an Grafana Cloud: den Fehler, die Ansicht, in der er auftrat (nie die vollständige Adresse, die das Token eines Links enthalten kann), Browser und Betriebssystem sowie eine zufällige ID für deinen Besuch.

## Newsletter {#newsletter}

Wenn du Versionshinweise abonnierst, senden wir dir zuerst einen Bestätigungslink in der Sprache der Anmeldeseite. Der Link gilt 7 Tage, und eine Adresse erhält höchstens 3 pro Tag. Nach deiner Bestätigung kommt deine Adresse in unsere Newsletter-Liste bei Resend, dem Dienst, der unsere E-Mails versendet. Jeder Newsletter enthält einen Abmeldelink, den Resend verarbeitet. Nach der Abmeldung senden wir keine weiteren Newsletter. Wenn auch die Adresse gelöscht werden soll, schreibe uns. Cloudflare Turnstile prüft das Formular, wie unter [Website](#website) beschrieben.

Beim Umzug von unserem früheren Server kam jede Adresse seiner Mailingliste, die sich nicht abgemeldet hatte, als abonniert in diese Liste, ob bestätigt oder nicht: Dieser Server hatte auch die Adressen von Käufern, Lizenzinhabern und Beta-Anmeldungen aufgenommen und ihnen E-Mails gesendet. Abgemeldete Adressen kamen als abgemeldet herüber, und Adressen, deren E-Mails unzustellbar waren oder als Spam markiert wurden, kamen stattdessen auf die Sperrliste von Resend, sodass sie kein Newsletter erreicht.

## Cookies und Browserspeicher {#cookies}

Das Lesen der öffentlichen Website und ihre Anfragen zu Newsletter, Checkout und Rabattcodes setzen keine eigenen Cookies. Die Anmeldung im Kontoportal, auch eine erst begonnene, setzt das eine unten genannte unbedingt erforderliche Portal-Cookie. Cloudflare Web Analytics setzt keine Cookies und speichert nichts im Browser. Google-Analytics-Cookies werden erst mit deiner Erlaubnis gesetzt. Crisp setzt seine Cookies auf jeder Seite, sobald der Chat geladen ist. Nichts davon wird für Werbung verwendet oder verkauft.

- **`_ga` und `_ga_<ID>`** (Google-Analytics-Cookies, bis zu 2 Jahre, nur mit deiner Erlaubnis): eine zufällige Browserkennung und der Status deines aktuellen Besuchs. Ablehnen oder späteres Ändern deiner Antwort löscht sie. Rechtsgrundlage: Einwilligung.
- **`tablepro:analytics-consent`** (lokaler Speicher, bis du ihn löschst): deine Antwort auf die Analysefrage, damit sie nicht auf jeder Seite erscheint. Das Kontoportal lädt keine Analyse, stellt diese Frage also nicht und liest die Antwort nicht. Rechtsgrundlage: unbedingt erforderlich, um deine Wahl zu beachten.
- **`tablepro:attribution`** (lokaler Speicher, 90 Tage): der unter [Website](#website) beschriebene Erstbesuchsdatensatz. Er enthält keine persönliche Kennung und wird nur mit einer Checkout-Anfrage gesendet, die die Herkunft des Besuchs an {merchant} übergibt. Rechtsgrundlage: berechtigtes Interesse.
- **`theme`** (lokaler Speicher, bis du ihn löschst): deine Wahl zwischen heller, dunkler oder Systemdarstellung. Das Kontoportal speichert seine eigene. Rechtsgrundlage: berechtigtes Interesse.
- **`tablepro:language`** (lokaler Speicher, bis du ihn löschst): die Sprache, die du im Sprachmenü oder in der Sprachleiste gewählt hast, und jede Sprache, deren Vorschlag du geschlossen hast, damit sie nicht erneut angeboten wird. Rechtsgrundlage: berechtigtes Interesse.
- **`mintlify_anonymous_id`** (lokaler Speicher auf docs.tablepro.app, von Mintlify gesetzt, nur wenn du dort Google Analytics zulässt): die unter [Website](#website) beschriebene Besucher-ID. Beim Ablehnen wird sie gelöscht. Die Dokumentation speichert ihre eigene Antwort `tablepro:analytics-consent`. Rechtsgrundlage: Einwilligung.
- **Cookies beginnend mit `crisp-client/`** (Crisp, etwa `crisp-client/session/…`; 6 Monate, bei Rückkehr erneuert; auf jeder Seite nach dem Laden des Chats gesetzt): halten Chat und Gespräch über Seiten und Besuche hinweg verfügbar. Rechtsgrundlage: berechtigtes Interesse, um auf jeder Seite Support anzubieten.
- **`__Host-tp_session`** (Kontoportal-Cookie, 30 Tage ab der Anmeldung): hält dich angemeldet. Vor der Anmeldung wird es nur gesetzt, während eine Anmeldung per Passkey, Apple, GitHub, Google oder aus einer App läuft, für höchstens 10 Minuten. Die Abmeldung löscht es. Anfragen zu Newsletter, Checkout und Rabattcodes von der öffentlichen Website lassen Zugangsdaten aus und erhalten es nie. Rechtsgrundlage: unbedingt erforderlich.
- **`locale`, `context` und `sign-in-return-to`** (lokaler Speicher des Kontoportals): die Sprache, die du dort vor der Anmeldung gewählt hast, und ob du zuletzt Persönlich oder ein Team geöffnet hast, beides bis du es löschst, sowie für 15 Minuten die Seite, zu der du nach dem Öffnen eines Anmeldelinks aus einer E-Mail zurückkehrst. Rechtsgrundlage: berechtigtes Interesse.
- **`com.grafana.faro.session`** (Sitzungsspeicher des Kontoportals, bis du den Tab schließt): die zufällige Besuchs-ID der Fehlerberichte des Portals. Rechtsgrundlage: berechtigtes Interesse.

Du kannst deine Analyseantwort jederzeit über **Cookie-Einstellungen** im Fußbereich jeder Seite ändern oder widerrufen, oder hier:

<cookie-settings></cookie-settings>

## Rechtsgrundlagen {#lawful-basis}

Für Leser im Europäischen Wirtschaftsraum und im Vereinigten Königreich sind die Rechtsgrundlagen nach DSGVO und UK GDPR:

- **Vertrag** (Art. 6 Abs. 1 lit. b): Verkauf und Bereitstellung einer Lizenz, dein Konto mit Anmeldemethoden und Geräten, Lizenzprüfungen, Kontoportal und Team Library.
- **Berechtigtes Interesse** (Art. 6 Abs. 1 lit. f): Nutzungsdaten der Mac-App und ihre Auswertung in PostHog, die Ereignisse zu Anmeldungen, Käufen, Geräten und Teams, die unser Server an PostHog sendet, Audit-Log des Kontos, Sicherheit und Missbrauchsprävention einschließlich Cloudflare Turnstile im Newsletter-Formular, Webserverprotokolle und Fehlerberichte des Kontoportals, Cloudflare Web Analytics, Kaufzuordnungsdatensatz, Länderabfrage für Sprache und regionalen Rabatt sowie Live-Chat auf jeder Seite.
- **Einwilligung** (Art. 6 Abs. 1 lit. a): Google-Analytics-Cookies, Nutzungsbericht der iPhone- und iPad-App, Newsletter und von dir begonnene Live-Chat-Gespräche.
- **Gesetzliche Verpflichtung** (Art. 6 Abs. 1 lit. c): Steuer- und Buchhaltungsunterlagen sowie Antworten auf rechtmäßige Anfragen.

## Wer Daten erhält {#sharing}

Wir teilen personenbezogene Daten nur mit den Diensten, die für den Betrieb von TablePro erforderlich sind:

- **{merchant}**, dem Merchant of Record für Käufe.
- **Resend**, das unsere E-Mails versendet: Anmeldelinks und -codes, Teameinladungen, Konto- und Sicherheitshinweise sowie Newsletter. Resend führt die Newsletter-Liste und meldet uns, wenn eine E-Mail an eine Adresse nicht zugestellt oder als Spam markiert wird.
- **Unserem Hostinganbieter und Cloudflare**, für Website, Kontoportal und den Server, mit dem die Apps kommunizieren. Cloudflare zählt auch Seitenaufrufe mit Cloudflare Web Analytics und prüft das Newsletter-Formular mit Turnstile.
- **Google**, für Google Analytics auf Website und Dokumentation.
- **Crisp**, für den Live-Chat auf jeder Seite von Website und Kontoportal.
- **PostHog** (EU Cloud), unserem Dienst für Produktanalysen, der die Nutzungsberichte der Apps und die Ereignisse unseres Servers zu Anmeldungen, Käufen, Geräten und Teams erhält, mit deiner Konto-ID, aber nie mit deiner E-Mail-Adresse oder deinem Namen. Nutzungsdaten, die die Mac-App direkt sendet, erreichen PostHog mit der IP-Adresse deines Macs.
- **Grafana Labs** (Grafana Cloud), das die Protokolle und Traces unseres Servers und die Fehlerberichte des Kontoportals erhält.
- **Apple, GitHub und Google**, wenn du dich mit ihnen bei deinem Konto anmeldest.
- **jsDelivr**, das deinem Browser das Checkout-Skript von {merchant} liefert, wenn du auf eine Kaufen-Schaltfläche zeigst.
- **Mintlify**, das die Dokumentation unter docs.tablepro.app hostet.
- **GitHub**, das Update-Feed, Plugin-Katalog und Downloads hostet und die Anzahl der Sterne liefert, die die Dokumentation zeigt.

Wir verkaufen keine personenbezogenen Daten und teilen sie nicht mit Werbetreibenden.

## Internationale Übermittlungen {#transfers}

Die genannten Dienste sind in mehreren Ländern tätig; deine Daten können daher außerhalb deines Landes verarbeitet werden. {merchant}, Google, GitHub, Cloudflare und Mintlify verarbeiten Daten in den USA. Google tut dies auf Grundlage des EU-US Data Privacy Framework und der Standardvertragsklauseln. PostHog verarbeitet sie in der Europäischen Union. Soweit gesetzlich erforderlich, stützen sich Übermittlungen aus dem EWR und dem Vereinigten Königreich auf Standardvertragsklauseln oder einen anderen genehmigten Mechanismus.

## Wie lange wir Daten aufbewahren {#retention}

- **Nutzungsberichte und Analyseereignisse**: Unser Server bewahrt keine Kopie auf, sobald er sie an PostHog weitergegeben hat. Für PostHog haben wir keine Frist festgelegt. Wenn du dein Konto löschst, werden sein PostHog-Profil und seine Ereignisse eine Stunde später gelöscht.
- **Datensätze unseres früheren Servers**: Eine Kopie seiner gesamten Datenbank wird unbefristet in einem Archiv aufbewahrt. Sie enthält Lizenzen, Bestellungen und Teammitglieder mit E-Mail-Adressen und Namen; die mit einer Lizenz aktivierten Macs mit ihren Namen; Newsletter-Abonnenten und Beta-Anmeldungen; Aufzeichnungen über die versendeten E-Mails; sowie die dort gespeicherten Nutzungsberichte und Protokolle der Lizenzanfragen mit ihren IP-Adressen.
- **Geräte**: werden aufbewahrt, solange sie genutzt werden. Ein Gerät, das sich 180 Tage nicht gemeldet hat, wird entfernt, sofern keine Offline-Datei dafür mehr gilt, und ein entferntes Gerät wird ein Jahr später gelöscht.
- **Audit-Log deines Kontos**: wird aufbewahrt, solange das Konto besteht, mit IP-Adresse und Browser jeder Änderung, die du vorgenommen hast. Das Löschen des Kontos entfernt daraus deine E-Mail-Adressen sowie IP-Adresse und Browser deiner Aktionen; der Eintrag jeder Änderung bleibt.
- **Bestellungen**: werden für Steuern und Buchhaltung aufbewahrt. Das Löschen deines Kontos entfernt daraus deine E-Mail-Adresse und dein Konto.
- **Benachrichtigungen von {merchant}, Resend und Apple**: 180 Tage. Die von {merchant} enthalten Name, E-Mail-Adresse und Rechnungsadresse; das Löschen deines Kontos entfernt sie früher aus denen zu deinen Käufen.
- **Team Library**: bis ein Eintrag geändert oder gelöscht wird; ein gelöschter Eintrag wird 90 Tage aufbewahrt. Die Bibliothek wird mit ihrem Team gelöscht und bleibt nach dem Ende einer Lizenz bestehen.
- **Anmeldelinks und -codes**: laufen nach 15 Minuten ab und werden 7 Tage später gelöscht. Portalsitzungen dauern 30 Tage. Das Token, das eine App angemeldet hält, läuft 90 Tage nach ihrer letzten Nutzung ab und wird 30 Tage danach gelöscht.
- **Gelöschte Konten**: Konto, Anmeldemethoden, Geräte, Lizenzen und Teammitgliedschaften werden sofort gelöscht. Bestellungen und Audit-Log bleiben wie oben beschrieben. Was unser früherer Server über dich gespeichert hat, bleibt in seinem oben beschriebenen Archiv.
- **Newsletter**: Ein Bestätigungslink und die Adresse, an die er ging, werden 7 Tage nach Ablauf des Links gelöscht. Eine bestätigte oder von unserem früheren Server übernommene Adresse bleibt in unserer Liste bei Resend, bis wir sie auf deine Anfrage löschen; nach der Abmeldung bleibt sie als abgemeldet gespeichert, damit sie keinen Newsletter mehr erhält.
- **Google Analytics**: Nutzer- und Ereignisdaten für 2 Monate, Googles Standardfrist, die unsere Property verwendet. Cookies bleiben bis zu 2 Jahre oder werden beim Ablehnen gelöscht.
- **Cloudflare Web Analytics**: Cloudflare zeigt uns die Seitenaufrufsummen der letzten sechs Monate. Im Browser wird nichts gespeichert.
- **Live-Chat und Support-E-Mails**: werden bei Crisp und in unserem Postfach bis zur Löschung aufbewahrt. Bitte uns, deine Gespräche und E-Mails zu löschen.
- **Webserverprotokolle**: werden für Sicherheit und Fehlerbehebung aufbewahrt. Wir haben dafür noch keine feste Frist bestimmt.
- **Protokolle und Traces unseres Servers sowie Fehlerberichte des Portals**: 14 Tage, in Grafana Cloud.

## Deine Rechte {#rights}

Je nach Wohnort kannst du uns bitten:

- dir eine Kopie deiner bei uns gespeicherten personenbezogenen Daten zu geben (Auskunft);
- sie zu korrigieren (Berichtigung);
- sie zu löschen, außer gesetzlich aufzubewahrenden Daten (Löschung);
- ihre Nutzung einzuschränken (Einschränkung);
- sie dir in strukturierter, maschinenlesbarer Form zu senden (Datenübertragbarkeit);
- ihre Nutzung auf Grundlage berechtigten Interesses einzustellen (Widerspruch).

Du kannst deine Einwilligung jederzeit widerrufen und dich bei deiner Datenschutzbehörde beschweren. Für die Ausübung dieser Rechte schreibe an [{email}](mailto:{email}). Wir antworten innerhalb von 30 Tagen. Im [Kontoportal]({account}) erhältst du in den Einstellungen außerdem eine Kopie der Daten deines Kontos und kannst das Konto löschen. Für alles andere, etwa eine Newsletter-Adresse oder einen Mac ohne Konto, nenne die betroffene E-Mail-Adresse, den Lizenzschlüssel oder das Gerät. Für Daten bei {merchant}, Google, Crisp oder GitHub gelten zusätzlich deren eigene Richtlinien.

**Einwohner Kaliforniens.** Der California Consumer Privacy Act gibt dir das Recht zu erfahren, welche personenbezogenen Informationen wir erfassen, ihre Löschung zu verlangen, dem Verkauf zu widersprechen und für die Ausübung dieser Rechte nicht anders behandelt zu werden. Wir verkaufen keine personenbezogenen Informationen.

## Kinder {#children}

TablePro richtet sich nicht an Kinder unter 16 Jahren. Wir erfassen ihre personenbezogenen Daten nicht wissentlich. Wenn du glaubst, dass ein Kind uns personenbezogene Daten gegeben hat, kontaktiere uns; wir löschen sie.

## Sicherheit {#security}

Der Datenverkehr zwischen Apps, Website, Kontoportal und unserem Server nutzt HTTPS. TablePro-Konten haben keine Passwörter. Anmeldelinks und -codes, die Tokens, die die Apps angemeldet halten, und Team-API-Tokens werden als Hashes gespeichert. Der Auftrag, der einen Anmeldelink und -code per E-Mail versendet, hält beide im Klartext, bis er gelöscht wird: einen Tag nach dem Versand der E-Mail oder 7 Tage, nachdem wir den Versand aufgegeben haben. Beide funktionieren 15 Minuten nach deiner Anfrage nicht mehr. Zugang zu unseren Systemen haben nur {publisherName} und die unter [Wer Daten erhält](#sharing) genannten Dienstleister. Kein System ist vollkommen sicher. Sicherheitslücken meldest du wie auf der [Sicherheitsseite](/de/security#report) beschrieben oder per E-Mail an [{email}](mailto:{email}).

## Änderungen dieser Erklärung {#changes}

Wenn sich diese Erklärung ändert, aktualisieren wir sie hier mit einem neuen Datum „Zuletzt aktualisiert“ und informieren dich direkt, soweit dies gesetzlich erforderlich ist.

## Kontakt {#contact}

Bei Fragen zum Datenschutz oder zu dieser Erklärung schreibe an [{email}](mailto:{email}).
