---
title: Datenschutzerklärung
description: Welche Daten die TablePro-Apps, die Website und das Kontoportal erfassen, wohin sie gehen, wie lange sie bleiben und wie du sie änderst oder löschst.
updatedAt: "2026-10-08"
---

Diese Erklärung gilt für TablePro für Mac, TablePro für iPhone und iPad, die Website tablepro.app, die Dokumentation unter docs.tablepro.app und das Kontoportal tablepro.app/account. Sie beschreibt, was diese heute tatsächlich senden und speichern. Beide Apps sind quelloffen unter der AGPLv3. Den Code, der die unten genannten Daten sendet, kannst du im [TablePro-Repository]({github}) lesen.

## Überblick {#summary}

- Die Mac-App sendet einmal täglich einen Nutzungsbericht an TablePro. Dies ist standardmäßig aktiv und kann deaktiviert werden. Die iPhone- und iPad-App sendet einen Bericht nur, wenn du es aktivierst.
- Wenn du eine Lizenz aktivierst, prüft die Mac-App sie alle {revalidateDays} Tage auf unserem Server. Diese Prüfung enthält den Namen deines Macs.
- Deine Abfragen, Ergebnisse und Passwörter werden nicht an TablePro gesendet. Ausgenommen ist, was du in einer Team-Bibliothek veröffentlichst: Verbindungseinstellungen (niemals Passwörter) und gespeicherte Abfragen.
- KI-Anfragen gehen von der Mac-App direkt an den von dir eingerichteten KI-Anbieter, nicht an uns.
- Unser Server speichert die IP-Adresse jedes Nutzungsberichts und jeder Lizenzprüfung und ermittelt ein Land für jeden Nutzungsbericht. Wir haben keine Aufbewahrungsfrist für diese Datensätze festgelegt.
- Die Website zählt Seitenaufrufe mit Cloudflare Web Analytics, das keine Cookies setzt. Sie lädt auch Google Analytics, das nur mit deiner Erlaubnis Cookies setzt. Jede Seite lädt außerdem unseren Live-Chat Crisp, der eigene Cookies setzt.
- Käufe werden von {merchant}, unserem verantwortlichen Verkäufer, abgewickelt.

## Wer verantwortlich ist {#controller}

TablePro, das die Apps und diese Website veröffentlicht, ist für die hier beschriebenen personenbezogenen Daten verantwortlich (Verantwortlicher für die Datenverarbeitung). Bei Fragen zu dieser Erklärung oder deinen Daten schreibe an [{email}](mailto:{email}).

## TablePro für Mac {#mac-app}

### Nutzungsbericht {#mac-usage-report}

Die Mac-App sendet etwa zehn Sekunden nach dem Start und danach einmal täglich während des Betriebs einen Nutzungsbericht an `api.tablepro.app`. **Dies ist standardmäßig aktiv, und die App fragt vor dem ersten Versand nicht nach.** Zum Deaktivieren öffne **Einstellungen > Allgemein > Datenschutz** und deaktiviere **Anonyme Nutzungsdaten teilen**.

Ein Bericht enthält:

- eine Rechner-ID: einen SHA-256-Hash der Hardware-UUID deines Macs (die UUID selbst wird nie gesendet);
- die Plattform, die App-Version, die macOS-Version, die Prozessorarchitektur und die Sprache der App;
- die Namen der Datenbanktypen deiner Verbindungen (zum Beispiel „PostgreSQL“) und die Anzahl der Verbindungen;
- ob eine Lizenz aktiviert ist;
- die Daten deines ersten Verbindungsversuchs, deiner ersten erfolgreichen Verbindung und deiner ersten Abfrage;
- deine Update-Einstellungen (Installation und Häufigkeit der Prüfungen). Unser Server verwirft diese beim Eingang des Berichts.

Er enthält niemals Hostnamen, Benutzernamen, Passwörter, Abfragen oder Zeilen.

Unser Server speichert jeden Bericht mit seiner Herkunfts-IP-Adresse. Anschließend ermittelt er das Land für diese Adresse, indem er sie an ip-api.com sendet, bei einem Fehlschlag an ipinfo.io und dann an geoplugin.net. Diese Abfragen erfolgen über unverschlüsseltes HTTP. Das Land wird mit dem Bericht gespeichert. Da die unten beschriebene Lizenzprüfung dieselbe Rechner-ID sendet, lassen sich Berichte eines Macs mit aktivierter Lizenz dieser Lizenz zuordnen.

### Lizenzprüfungen {#mac-license}

Die Mac-App kontaktiert unseren Lizenzserver erst, nachdem du einen Lizenzschlüssel eingegeben hast. Dies geschieht bei der Aktivierung, beim Start, wenn seit der letzten Prüfung mindestens {revalidateDays} Tage vergangen sind, und danach alle {revalidateDays} Tage. Jede Prüfung sendet:

- deinen Lizenzschlüssel;
- die oben beschriebene Rechner-ID;
- den in macOS festgelegten Namen deines Macs (er enthält oft deinen eigenen Namen);
- die App-Version und die macOS-Version.

Die Deaktivierung eines Macs sendet nur den Lizenzschlüssel und die Rechner-ID.

Unser Server protokolliert jede Lizenzanfrage mit IP-Adresse und Inhalt und speichert die Rechner-ID und den Namen jedes aktivierten Macs bei deiner Lizenz. Das Kontoportal zeigt diese Macs nach Namen an. Ist unser Server nicht erreichbar, funktionieren die Bezahlfunktionen noch {graceDays} Tage nach der letzten erfolgreichen Prüfung.

### Team-Bibliothek {#library}

Die Team-Bibliothek ist Bestandteil einer Team-Lizenz. Wenn du bei einer Verbindung **Teilen > In Team-Bibliothek veröffentlichen…** oder in der Favoriten-Seitenleiste **Gespeicherte Abfragen für Team veröffentlichen…** wählst, lädt die Mac-App die veröffentlichten Inhalte auf unseren Server:

- Verbindungseinstellungen: Host, Port, Datenbankname, Benutzername, SSH- und SSL-Einstellungen, Treiberoptionen, Startbefehle, Tunnelbefehl-Einstellungen, Stufe des sicheren Modus und KI-Einstellungen, aber niemals Passwörter;
- gespeicherte Abfragen: ihre Namen, SQL-Texte, Schlüsselwörter und Ordner.

Macs mit derselben Team-Lizenz laden die Bibliothek beim Start herunter, höchstens einmal pro Woche. Der veröffentlichende Mac lädt sie unmittelbar danach erneut herunter. Eine erneute Veröffentlichung ersetzt die zuvor veröffentlichten Inhalte. Das Entfernen eines Teammitglieds löscht alles, was dieses Mitglied veröffentlicht hat. Läuft die Lizenz ab oder wird sie gesperrt, bleibt die Bibliothek auf unserem Server, bis du ihre Löschung anforderst.

Der Team-Katalog, die andere Team-Funktion, schreibt Verbindungsdateien ohne Passwörter in einen von dir gewählten freigegebenen Ordner. Er nutzt unseren Server nicht.

### Updates und Plugins {#mac-updates}

- **Update-Prüfungen.** Die Mac-App lädt einmal täglich den Update-Feed von GitHub (`raw.githubusercontent.com`) herunter. Die Anfrage sendet über die üblichen Angaben einer Webanfrage hinaus keine Informationen über deinen Mac: deine IP-Adresse und einen User-Agent mit der App-Version. Zum Deaktivieren öffne **Einstellungen > Allgemein > Softwareupdate** und deaktiviere **Automatisch nach Updates suchen**. Die Updates selbst werden von GitHub heruntergeladen.
- **Plugin-Katalog.** Beim Start der App und beim Öffnen der Plugin-Einstellungen lädt sie die Liste verfügbarer Treiber und Themes von GitHub herunter. Dies lässt sich nicht deaktivieren. Installierte Treiber und Themes werden von GitHub heruntergeladen; der Plugin-Browser liest Downloadzahlen über die GitHub-API.

GitHub erhält bei diesen Anfragen deine IP-Adresse. Für sie gilt die Datenschutzerklärung von GitHub.

### Dienste, die du selbst auswählst {#mac-third-parties}

Die Mac-App sendet Daten an diese Dienste nur, wenn du sie einrichtest, und direkt, niemals über TablePro:

- **Deine Datenbanken, SSH-Server und Proxys**, die das erhalten, was deine Verbindungen ihnen senden.
- **KI-Anbieter.** Wenn du einen Anbieter hinzufügst und den KI-Assistenten oder Inline-Vorschläge nutzt, gehen Anfragen an diesen Anbieter oder an ein Modell auf deinem Mac. Standardmäßig enthält eine Anfrage den Datenbanktyp und -namen, Tabellen- und Spaltendefinitionen aus dem Schema sowie die aktuelle Abfrage. Ergebniszeilen werden nur gesendet, wenn du dies aktivierst. Es gelten die Bedingungen des Anbieters. Das Hinzufügen von GitHub Copilot lädt dessen Sprachserver von npm herunter; seine Einstellung „Telemetrie an GitHub senden“ ist anfangs aktiv.
- **Anmeldedienste**: Microsoft Entra ID, Google, Amazon Web Services und Cloudflare Access, wenn eine Verbindung sie verwendet.
- **Apple Maps**, das Kartenkacheln liefert, wenn du Ergebnisse auf einer Karte anzeigst.
- **DuckDB**, das DuckDB-Erweiterungen liefert, wenn eine Abfrage sie erstmals verwendet.
- **MCP-Clients.** Der MCP-Server ist standardmäßig aus. Er startet, wenn du ihn aktivierst oder wenn ein eingerichteter MCP-Client die TablePro-Bridge startet oder sich damit koppelt. Er lauscht nur auf deinem Mac (127.0.0.1). Ein verbundener KI-Client wie Claude oder Cursor erhält die angeforderten Ergebnisse und sendet sie nach seinen eigenen Bedingungen an seinen Dienst.
- **MCP-Server, die du hinzufügst.** Eine KI-Sitzung sendet die von dir genehmigten Werkzeugaufrufe mit ihren Argumenten an diesen Server.

### Daten, die auf deinem Mac bleiben {#mac-local}

Passwörter werden im macOS-Schlüsselbund aufbewahrt. Deine Verbindungsliste, dein Abfrageverlauf, Query Insights, Data-Rewind-Snapshots, Einstellungen und offene Tabs werden auf deinem Mac gespeichert. Die App verweist auf SSH-Schlüssel an ihrem Speicherort und kopiert sie nicht. Die App enthält weder einen Absturzmelder noch eine Analysebibliothek eines Drittanbieters.

## TablePro für iPhone und iPad {#ios-app}

**Nichts geht an TablePro, solange du „Nutzungsdaten teilen“ nicht aktivierst**, beim ersten Start oder später unter **Einstellungen > Datenschutz**. Wenn du es aktivierst, sendet die App einmal täglich einen Bericht an denselben Server wie die Mac-App. Unser Server speichert dessen IP-Adresse und ermittelt das Land auf dieselbe Weise. Der Bericht enthält einen SHA-256-Hash der Kennung, die Apple der App auf deinem Gerät zuweist, Plattform, App- und iOS-Version, Prozessorarchitektur, App-Sprache, Namen der verwendeten Datenbanktypen, Verbindungsanzahl und dieselben Daten zur ersten Nutzung. Er enthält keine Update-Einstellungen und keinen Lizenzschlüssel, da die App beides nicht hat.

Die App führt weder Lizenz- noch Update-Prüfungen oder Plugin-Anfragen aus. Abgesehen vom optionalen Bericht verbindet sie sich nur mit deinen Datenbanken und SSH-Servern, mit Apples iCloud bei aktiviertem iCloud Sync und mit Microsoft, wenn sich eine SQL-Server-Verbindung über Microsoft Entra ID anmeldet.

Auf dem Gerät werden Passwörter und eingefügte SSH-Schlüssel im Schlüsselbund aufbewahrt; Zertifikate werden nie synchronisiert. Der Abfrageverlauf bleibt auf dem Gerät. Deine Verbindungen werden dem lokalen Spotlight-Index hinzugefügt, damit du sie suchen kannst. Während einer Abfrage zeigt ihre Live-Aktivität das SQL auf dem Sperrbildschirm und in der erweiterten Dynamic Island, sofern du nicht **Einstellungen > Live-Aktivitäten > Abfrage verbergen** aktivierst.

Wenn du in den Einstellungen deines iPhones oder iPads Analysedaten mit App-Entwicklern teilst, kann Apple uns Absturzberichte und Nutzungsstatistiken über App Store Connect übermitteln. Die App selbst enthält weder einen eigenen Absturzmelder noch eine Analysebibliothek eines Drittanbieters.

## iCloud Sync und Handoff {#icloud}

iCloud Sync ist auf dem Mac sowie auf iPhone und iPad aus, bis du es aktivierst. Wenn es aktiv ist, gelangen die Datensätze in eine private Datenbank in deinem eigenen iCloud-Konto (Container `iCloud.com.TablePro`). TablePro kann sie nicht lesen.

- Auf dem Mac wählst du, was synchronisiert wird: Verbindungen, Gruppen und Tags, Einstellungen, SSH-Profile, Zugangsdatenprofile (Name und Benutzername, niemals das Passwort), Tabellen- und Datenbankfavoriten, gespeicherte Abfragen (einschließlich SQL-Text) und Tabellenordner. Ein Verbindungsdatensatz enthält Host, Port, Benutzername, Datenbankname, SSH- und SSL-Einstellungen, Startbefehle, das Skript vor dem Verbinden und KI-Regeln. Abfrageverlauf, Data-Rewind-Snapshots und Passwortquellen werden nie synchronisiert.
- iPhone und iPad synchronisieren Verbindungen, Gruppen und Tags.
- Passwörter werden nur synchronisiert, wenn du auf dem Mac unter Synchronisierungskategorien zusätzlich **Passwörter** oder auf iPhone und iPad **Passwörter synchronisieren** aktivierst. Dies verwendet den iCloud-Schlüsselbund. Auf dem Mac werden dabei auch andere im Schlüsselbund gespeicherte Geheimnisse synchronisiert, etwa KI-Anbieterschlüssel und der Lizenzschlüssel.

Auf dem Mac ist iCloud Sync Bestandteil einer Starter- oder Team-Lizenz. Auf iPhone und iPad ist es kostenlos.

Handoff übermittelt über Apple die ID der offenen Verbindung und den Namen der offenen Tabelle zwischen deinen eigenen Geräten. Ohne offene Tabelle übermittelt es stattdessen den Verbindungsnamen oder bei einer unbenannten Verbindung deren Host. Es sendet keine Einstellungen oder Zugangsdaten.

## Website {#website}

**Hosting.** Die Website und das Kontoportal laufen auf unserem Server hinter Cloudflare. Wie jeder Webserver erhalten sie deine IP-Adresse, den User-Agent deines Browsers und die Adresse jeder angeforderten Seite.

**Cloudflare Web Analytics.** Cloudflare fügt den Seiten der Website und des Kontoportals sein Web-Analytics-Skript hinzu. Dein Browser lädt es von `static.cloudflareinsights.com`; es meldet jeden Seitenaufruf an Cloudflare: die Seite, die verweisende Website, die Ladezeit sowie Browser, Betriebssystem und Gerätetyp. Cloudflare ergänzt das Herkunftsland deiner Verbindung. Das Skript setzt keine Cookies und speichert nichts im Browser. Cloudflare erklärt, IP-Adresse und Browserangaben nicht zur Erstellung eines Fingerabdrucks zu verwenden. Cloudflare zeigt uns Summen wie Aufrufe pro Seite oder Land, keine Datensätze einzelner Besucher. Rechtsgrundlage: berechtigtes Interesse.

**Google Analytics.** Die Website lädt Google Analytics auf jeder Seite im Einwilligungsmodus. Bis du in der Cookie-Frage **Zulassen** wählst, setzt es keine Cookies und sendet Google pro Seite nur ein cookieloses Signal, ohne Kennung auf deinem Gerät. Mit deiner Erlaubnis setzt Google Analytics die Cookies `_ga` und `_ga_<ID>` und misst deine Besuche, etwa Seitenaufrufe, Downloadklicks und den Beginn eines Kaufs. Werbespeicherung, Anzeigenpersonalisierung und Nutzerdaten für Werbung bleiben immer abgelehnt. Google erklärt, dass Google Analytics 4 keine IP-Adressen protokolliert oder speichert. Unsere Google-Analytics-Property verwendet Googles standardmäßige Aufbewahrungsfrist: Google löscht erfasste Nutzer- und Ereignisdaten nach 2 Monaten. Googles Standardberichte, die Summen statt Kennungen enthalten, sind davon nicht betroffen. Rechtsgrundlage: deine Einwilligung für die Cookies.

**Live-Chat.** Jede Seite der Website und des Kontoportals zeigt eine Chat-Schaltfläche unseres Anbieters Crisp. Nach dem Laden einer Seite lädt dein Browser das Crisp-Skript von `client.crisp.chat`; Crisp setzt die unter [Cookies und Browserspeicher](#cookies) beschriebenen Cookies. Crisp erhält deine IP-Adresse, Browserangaben, die Adressen besuchter Seiten und deine Nachrichten und speichert deine IP-Adresse, wenn du ein Gespräch beginnst. Wir teilen Crisp nur die Seitensprache mit, nichts Weiteres über dich. Crisp hat seinen Sitz in Frankreich.

**Checkout-Skript.** Wenn du auf eine Kaufen-Schaltfläche zeigst oder sie mit der Tabulatortaste erreichst, lädt dein Browser das Checkout-Skript von {merchant} über jsDelivr (`cdn.jsdelivr.net`). jsDelivr erhält deine IP-Adresse und Browserangaben. Der Checkout selbst öffnet sich bei {merchant} erst nach deinem Klick.

**Kaufzuordnung.** Bei deiner Ankunft auf der Website speichert dein Browser 90 Tage lang einen Erstbesuchsdatensatz namens `tablepro:attribution` im lokalen Speicher: die Herkunft des Besuchs (die `ref`- oder `utm_*`-Parameter des gefolgten Links oder die verweisende Website), die Einstiegsseite und den Zeitpunkt. Wenn du einen Kauf beginnst, wird der Datensatz mit der Checkout-Anfrage gesendet. Unser Server verwirft ihn: Er wird nicht validiert, gelesen oder gespeichert und nicht an {merchant} übermittelt.

**Dokumentation.** Die Dokumentation unter docs.tablepro.app wird von Mintlify gehostet. Mintlify erhält mit jeder Seite deine IP-Adresse und Angaben zu deinem Browser, und die Seiten laden ihre Schriften von Google Fonts. Die Dokumentation stellt ihre eigene Cookie-Frage, weil sie deine Antwort auf dieser Website nicht lesen kann. Bis du dort **Allow** wählst, setzt sie keine Cookies und speichert keine Besucher-ID. Mit deiner Erlaubnis setzt Google Analytics die Cookies `_ga` und `_ga_<ID>` und misst deine Besuche der Dokumentation, und Mintlify speichert eine zufällige Besucher-ID, `mintlify_anonymous_id`, im lokalen Speicher, um sie zu zählen. Mit **Cookie settings** in der Fußzeile der Dokumentation änderst du deine Antwort; lehnst du ab, wird beides gelöscht. Rechtsgrundlage: deine Einwilligung.

Das Lesen der Website setzt keine eigenen Cookies. Das Abonnieren des Newsletters oder das Starten eines Checkouts oder einer Rabattcodeprüfung sendet eine Anfrage an unseren Server, die die beiden Kontoportal-Cookies `tablepro-session` und `XSRF-TOKEN` setzt. Alles, was die Website in deinem Browser aufbewahrt, steht unter [Cookies und Browserspeicher](#cookies).

## Käufe {#purchases}

Lizenzen werden von {merchant} (Polar Software, Inc.), unserem verantwortlichen Verkäufer und Wiederverkäufer, verkauft. Du kaufst bei {merchant} nach dessen Käuferbedingungen und Datenschutzerklärung. {merchant} nimmt Zahlungen entgegen, berechnet und entrichtet anfallende Verkaufs- oder Mehrwertsteuer, sendet Belege und Rechnungen und bearbeitet Zahlungsprobleme und Streitigkeiten. Dabei werden Name, E-Mail-Adresse, Rechnungsadresse und Zahlungsdaten erfasst. Wir sehen niemals deine vollständigen Kartendaten.

Von {merchant} erhalten wir deine E-Mail-Adresse, Name und Rechnungsadresse wie von dir eingegeben, deinen Kauf, die Beträge, Bestell- und Abonnement-IDs sowie spätere Änderungen wie Verlängerungen, Kündigungen und Erstattungen. Wir teilen {merchant} die Sprache deiner Kaufseite mit, damit unsere E-Mails dich in dieser Sprache erreichen. Rechnungen, Belege, Zahlungsmethode und Abonnement findest du im [Kundenportal von {merchant}]({portal}); die Anmeldung erfolgt mit der beim Kauf verwendeten E-Mail-Adresse. Erstattungen sind in der [Erstattungsrichtlinie](/de/refund-policy) beschrieben, der Umfang einer Lizenz in den [Nutzungsbedingungen](/de/terms).

## Kontoportal {#account}

Das [Kontoportal](/account?locale=de) unter tablepro.app/account ist für die Person bestimmt, die eine Lizenz gekauft hat. Du meldest dich über einen Link an, den wir an diese E-Mail-Adresse senden; er funktioniert einmal und läuft nach 15 Minuten ab. Das Portal zeigt deine Lizenzen, die darauf aktivierten Macs nach Namen und bei einer Team-Lizenz Mitglieder, Einladungen, Arbeitsplätze und Team-Bibliothek.

Wir speichern deine E-Mail-Adresse bei Lizenzen und Bestellungen und deine bei uns verwendete Sprache, damit unsere E-Mails dich darin erreichen. Wenn du jemanden in ein Team einlädst, speichern wir E-Mail-Adresse und Rolle dieser Person und senden ihr einen Einladungscode.

## Newsletter {#newsletter}

Wenn du Versionshinweise abonnierst, speichern wir deine E-Mail-Adresse und die Sprache der Anmeldeseite. Zuerst senden wir einen Bestätigungslink; jeder Newsletter enthält einen Abmeldelink. Nach der Abmeldung senden wir keine weiteren Newsletter. Wenn auch die Adresse gelöscht werden soll, schreibe uns.

## Cookies und Browserspeicher {#cookies}

Das Lesen der öffentlichen Website setzt keine eigenen Cookies. Das Abonnieren des Newsletters oder der Beginn eines Checkouts setzt die beiden unten genannten unbedingt erforderlichen Portal-Cookies. Cloudflare Web Analytics setzt keine Cookies und speichert nichts im Browser. Google-Analytics-Cookies werden erst mit deiner Erlaubnis gesetzt. Crisp setzt seine Cookies auf jeder Seite, sobald der Chat geladen ist. Nichts davon wird für Werbung verwendet oder verkauft.

- **`_ga` und `_ga_<ID>`** (Google-Analytics-Cookies, bis zu 2 Jahre, nur mit deiner Erlaubnis): eine zufällige Browserkennung und der Status deines aktuellen Besuchs. Ablehnen oder späteres Ändern deiner Antwort löscht sie. Rechtsgrundlage: Einwilligung.
- **`tablepro:analytics-consent`** (lokaler Speicher, bis du ihn löschst): deine Antwort auf die Analysefrage, damit sie nicht auf jeder Seite erscheint. Website und Kontoportal teilen diesen Eintrag. Rechtsgrundlage: unbedingt erforderlich, um deine Wahl zu beachten.
- **`tablepro:attribution`** (lokaler Speicher, 90 Tage): der unter [Website](#website) beschriebene Erstbesuchsdatensatz. Er enthält keine persönliche Kennung und wird nur mit einer Checkout-Anfrage gesendet, bei der unser Server ihn verwirft. Rechtsgrundlage: berechtigtes Interesse.
- **`theme`** und **`tablepro:banner-dismissed`** (lokaler Speicher, bis du ihn löschst): deine Wahl zwischen heller, dunkler oder Systemdarstellung sowie ausgeblendetes Banner und Ausblendungsdauer: 30 Tage oder ein Jahr, wenn du angibst, eine Lizenz zu haben, oder eine kaufst. Rechtsgrundlage: berechtigtes Interesse.
- **`mintlify_anonymous_id`** (lokaler Speicher auf docs.tablepro.app, von Mintlify gesetzt, nur wenn du dort Google Analytics zulässt): die unter [Website](#website) beschriebene Besucher-ID. Beim Ablehnen wird sie gelöscht. Die Dokumentation speichert ihre eigene Antwort `tablepro:analytics-consent`. Rechtsgrundlage: Einwilligung.
- **Cookies beginnend mit `crisp-client/`** (Crisp, etwa `crisp-client/session/…`; 6 Monate, bei Rückkehr erneuert; auf jeder Seite nach dem Laden des Chats gesetzt): halten Chat und Gespräch über Seiten und Besuche hinweg verfügbar. Rechtsgrundlage: berechtigtes Interesse, um auf jeder Seite Support anzubieten.
- **`tablepro-session` und `XSRF-TOKEN`** (Kontoportal-Cookies, 2 Stunden): halten dich angemeldet und schützen Portalformulare vor Cross-Site-Request-Forgery. Andere Portalseiten wie Kaufbestätigung und Newsletterseiten setzen sie ebenfalls, ebenso das Abonnieren des Newsletters oder das Starten eines Checkouts oder einer Rabattcodeprüfung von jeder Seite dieser Website. Rechtsgrundlage: unbedingt erforderlich.

Du kannst deine Analyseantwort jederzeit über **Cookie-Einstellungen** im Fußbereich jeder Seite ändern oder widerrufen, oder hier:

<cookie-settings></cookie-settings>

## Rechtsgrundlagen {#lawful-basis}

Für Leser im Europäischen Wirtschaftsraum und im Vereinigten Königreich sind die Rechtsgrundlagen nach DSGVO und UK GDPR:

- **Vertrag** (Art. 6 Abs. 1 lit. b): Verkauf und Bereitstellung einer Lizenz, Lizenzprüfungen, Kontoportal und Team-Bibliothek.
- **Berechtigtes Interesse** (Art. 6 Abs. 1 lit. f): Nutzungsbericht der Mac-App und Länderermittlung, Protokolle der Lizenzanfragen, Sicherheit und Missbrauchsprävention, Webserverprotokolle, Cloudflare Web Analytics, Kaufzuordnungsdatensatz und Live-Chat auf jeder Seite.
- **Einwilligung** (Art. 6 Abs. 1 lit. a): Google-Analytics-Cookies, Nutzungsbericht der iPhone- und iPad-App, Newsletter und von dir begonnene Live-Chat-Gespräche.
- **Gesetzliche Verpflichtung** (Art. 6 Abs. 1 lit. c): Steuer- und Buchhaltungsunterlagen sowie Antworten auf rechtmäßige Anfragen.

## Wer Daten erhält {#sharing}

Wir teilen personenbezogene Daten nur mit den Diensten, die für den Betrieb von TablePro erforderlich sind:

- **{merchant}**, dem verantwortlichen Verkäufer für Käufe.
- **Einem E-Mail-Versandanbieter**, für Anmeldelinks, Belege von uns, Teameinladungen und Newsletter.
- **Unserem Hostinganbieter und Cloudflare**, für Website, Kontoportal und den Server, mit dem die Apps kommunizieren. Cloudflare zählt auch Seitenaufrufe mit Cloudflare Web Analytics.
- **Google**, für Google Analytics auf Website, Dokumentation und Kontoportal.
- **Crisp**, für den Live-Chat auf jeder Seite von Website und Kontoportal.
- **jsDelivr**, das deinem Browser das Checkout-Skript von {merchant} liefert, wenn du auf eine Kaufen-Schaltfläche zeigst.
- **Mintlify**, das die Dokumentation unter docs.tablepro.app hostet.
- **ip-api.com, ipinfo.io und geoplugin.net**, die IP-Adressen aus Nutzungsberichten zur Länderermittlung erhalten.
- **GitHub**, das Update-Feed, Plugin-Katalog und Downloads hostet.

Wir verkaufen keine personenbezogenen Daten und teilen sie nicht mit Werbetreibenden.

## Internationale Übermittlungen {#transfers}

Die genannten Dienste sind in mehreren Ländern tätig; deine Daten können daher außerhalb deines Landes verarbeitet werden. {merchant}, Google, GitHub, Cloudflare und Mintlify verarbeiten Daten in den USA. Google tut dies auf Grundlage des EU-US Data Privacy Framework und der Standardvertragsklauseln. Soweit gesetzlich erforderlich, stützen sich Übermittlungen aus dem EWR und dem Vereinigten Königreich auf Standardvertragsklauseln oder einen anderen genehmigten Mechanismus.

## Wie lange wir Daten aufbewahren {#retention}

- **Nutzungsberichte** mit IP-Adressen und Ländern: Es wurde keine Frist festgelegt, und sie werden nicht automatisch gelöscht.
- **Lizenzdatensätze**: IDs und Namen aktivierter Macs sowie das Protokoll der Lizenzanfragen mit IP-Adressen bleiben gespeichert, solange die Lizenz besteht. Sie werden nicht automatisch gelöscht.
- **Bestellungen**: werden für Steuern und Buchhaltung aufbewahrt.
- **Team-Bibliothek**: bis zur erneuten Veröffentlichung, zur Entfernung des veröffentlichenden Mitglieds oder zu deiner Löschungsanfrage. Sie bleibt nach dem Ende einer Lizenz bestehen.
- **Anmeldelinks für Konten**: laufen nach 15 Minuten ab und werden dann gelöscht. Portalsitzungen dauern 2 Stunden.
- **Newsletter**: bis zur Abmeldung oder zur Löschung der Adresse auf deine Anfrage.
- **Google Analytics**: Nutzer- und Ereignisdaten für 2 Monate, Googles Standardfrist, die unsere Property verwendet. Cookies bleiben bis zu 2 Jahre oder werden beim Ablehnen gelöscht.
- **Cloudflare Web Analytics**: Cloudflare zeigt uns die Seitenaufrufsummen der letzten sechs Monate. Im Browser wird nichts gespeichert.
- **Live-Chat und Support-E-Mails**: werden bei Crisp und in unserem Postfach bis zur Löschung aufbewahrt. Bitte uns, deine Gespräche und E-Mails zu löschen.
- **Webserverprotokolle**: werden für Sicherheit und Fehlerbehebung aufbewahrt. Wir haben dafür noch keine feste Frist bestimmt.

## Deine Rechte {#rights}

Je nach Wohnort kannst du uns bitten:

- dir eine Kopie deiner bei uns gespeicherten personenbezogenen Daten zu geben (Auskunft);
- sie zu korrigieren (Berichtigung);
- sie zu löschen, außer gesetzlich aufzubewahrenden Daten (Löschung);
- ihre Nutzung einzuschränken (Einschränkung);
- sie dir in strukturierter, maschinenlesbarer Form zu senden (Datenübertragbarkeit);
- ihre Nutzung auf Grundlage berechtigten Interesses einzustellen (Widerspruch).

Du kannst deine Einwilligung jederzeit widerrufen und dich bei deiner Datenschutzbehörde beschweren. Für die Ausübung dieser Rechte schreibe an [{email}](mailto:{email}). Wir antworten innerhalb von 30 Tagen. Daten werden von Hand gelöscht; nenne daher die betroffene E-Mail-Adresse, den Lizenzschlüssel oder das Gerät. Für Daten bei {merchant}, Google, Crisp oder GitHub gelten zusätzlich deren eigene Richtlinien.

**Einwohner Kaliforniens.** Der California Consumer Privacy Act gibt dir das Recht zu erfahren, welche personenbezogenen Informationen wir erfassen, ihre Löschung zu verlangen, dem Verkauf zu widersprechen und für die Ausübung dieser Rechte nicht anders behandelt zu werden. Wir verkaufen keine personenbezogenen Informationen.

## Kinder {#children}

TablePro richtet sich nicht an Kinder unter 16 Jahren. Wir erfassen ihre personenbezogenen Daten nicht wissentlich. Wenn du glaubst, dass ein Kind uns personenbezogene Daten gegeben hat, kontaktiere uns; wir löschen sie.

## Sicherheit {#security}

Der Datenverkehr zwischen Apps, Website, Kontoportal und unserem Server nutzt HTTPS. Die unter [Nutzungsbericht](#mac-usage-report) beschriebenen Länderabfragen bilden die Ausnahme: Sie erfolgen über unverschlüsseltes HTTP. Anmeldelinks werden nur als Hashes gespeichert; nur die Personen, die TablePro betreiben, haben Zugang zu unseren Systemen. Kein System ist vollkommen sicher. Sicherheitslücken kannst du an [{email}](mailto:{email}) melden.

## Änderungen dieser Erklärung {#changes}

Wenn sich diese Erklärung ändert, aktualisieren wir sie hier mit einem neuen Datum „Zuletzt aktualisiert“ und informieren dich direkt, soweit dies gesetzlich erforderlich ist.

## Kontakt {#contact}

Bei Fragen zum Datenschutz oder zu dieser Erklärung schreibe an [{email}](mailto:{email}).
