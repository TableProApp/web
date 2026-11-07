---
title: Informativa sulla privacy
description: Dati raccolti da TablePro, finalità, destinatari, conservazione, scelte e diritti.
updatedAt: "2026-11-07"
---

Questa informativa copre TablePro per Mac, Linux, iPhone e iPad; tablepro.app; docs.tablepro.app; e servizi di account, acquisto, assistenza e newsletter. L'[inventario tecnico](https://docs.tablepro.app/security/privacy) elenca campi, destinazioni e controlli. Il codice è nel [repository pubblico]({github}).

## In breve {#summary}

Query e risultati ordinari viaggiano tra dispositivo e database. I dati di utilizzo non contengono SQL, righe o credenziali. I contenuti pubblicati in Team Library, inviati all'assistenza o condivisi con IA e strumenti esterni raggiungono quei destinatari.

Su Mac e Linux i dati di utilizzo sono attivi per impostazione iniziale, con un interruttore. L'app iPhone e iPad distribuita invia rapporti solo dopo il consenso. L'analisi diretta può collegarsi ad account e acquisti. Disattivarla non ferma richieste dell'account o analisi del server.

Il sito misura visite e carica Crisp su ogni pagina. I cookie Google Analytics richiedono la tua scelta. Le newsletter misurano aperture e clic. Eliminare l'account lascia alcuni dati, anche presso PostHog e Crisp. Leggi [conservazione](#retention) e [diritti](#rights). Il [titolare](#controller) gestisce richieste anche senza account.

<span id="contact"></span>

## Titolare {#controller}

{publisherName}, sviluppatore indipendente in {publisherCountry}, è titolare dei dati personali descritti. Contatto: [{email}](mailto:{email}). Non abbiamo un responsabile della protezione dei dati. Per i gruppi siamo titolari dei dati di account, inviti e servizio. Trattiamo i contenuti Team Library su istruzione del gruppo, che decide cosa pubblicare e chi accede.

<span id="lawful-basis"></span>

## Dati e finalità {#data-use}

Per SEE e Regno Unito indichiamo la base giuridica per ogni finalità: contratto (articolo 6(1)(b)), legittimo interesse (6(1)(f)), consenso (6(1)(a)) o obbligo legale (6(1)(c)). Non prendiamo decisioni automatizzate con effetti giuridici o analogamente significativi.

<span id="mac-account"></span>

### Account e dispositivi {#account}

L'uso locale gratuito non richiede account. I servizi account richiedono l'e-mail. Conserviamo nome, lingua, metodi di accesso, licenze, ordini, dispositivi, ruoli e posti nei gruppi. Registrare Mac/Linux invia ID macchina, nome dispositivo, piattaforma e versioni app/sistema. Il nome può contenere il tuo. Questo flusso è distinto dall'utilizzo. Scopo e base sono fornire account e piano tramite contratto.

L'accesso usa link e codici e-mail, passkey, Apple, GitHub o Google. I record passkey includono chiave pubblica, nome, stato di sincronizzazione e date d'uso. I fornitori di identità danno ID ed e-mail verificata; Apple può dare il nome. Il token Apple è cifrato e revocato quando scolleghi Apple o elimini l'account. Le modifiche sono registrate con IP e user agent. Il legittimo interesse è proteggere account e indagare abusi.

Nel [portale]({account}) modifichi profilo e accesso, gestisci dispositivi, esporti JSON ed elimini l'account. Non puoi eliminarlo se possiedi un gruppo con altri membri. L'eliminazione termina gli abbonamenti senza rimborso. La [conservazione](#retention) spiega cosa resta.

### Acquisti {#purchases}

{merchant} (Polar Software, Inc.) è merchant of record e rivenditore. Raccoglie nome, e-mail, indirizzo di fatturazione e dati di pagamento secondo le proprie condizioni. Gestisce pagamento, imposte, ricevute e controversie. Non riceviamo dati completi della carta.

Inviamo acquisto, lingua, provenienza della visita e IP per pagamento, imposte e valuta. Riceviamo dati dell'acquirente/fatturazione, importi, ID ordine/abbonamento, rinnovi, cancellazioni e rimborsi. Gli ordini conservano e-mail, paese, importi e attribuzione. Un acquisto ospite crea se necessario un account non verificato per quell'e-mail. Motivi e commenti di cancellazione vanno a {merchant} e restano con l'abbonamento. Il trattamento esegue il contratto; dati fiscali e contabili soddisfano obblighi legali. Senza i dati richiesti il pagamento non termina. Gestisci fatturazione nel [portale {merchant}]({portal}); vedi [condizioni](/it/terms) e [rimborsi](/it/refund-policy).

### Gruppi e contenuti condivisi {#library}

Chi invita fornisce e-mail, ruolo e posto. Proprietari e amministratori vedono nomi/e-mail, inviti e modifiche al gruppo, indirizzi invitati compresi, ma non IP o browser del registro. I membri vedono gruppo, piano, posti e proprio ruolo. Usiamo questi dati per il servizio contrattuale.

Su Mac, pubblicare in Team Library invia impostazioni di connessione e query salvate al server per membri autorizzati. Include host, porta, database, utente, SSH/SSL, comandi iniziali, Tunnel Command e IA. Le query includono nomi, SQL, parole chiave e cartelle. I campi password sono esclusi; segreti in SQL o testo libero non vengono rimossi. La libreria mostra l'ultimo autore. Lasciare il gruppo non cancella i contenuti. Vedi [tempi di eliminazione](#retention). Team Catalog scrive invece nella cartella condivisa scelta.

### Analisi d'uso e servizio {#analytics}

Il legittimo interesse è capire l'uso, correggere problemi e misurare acquisti. Mac/Linux inviano quanto descritto in [App](#apps). Il server invia a PostHog eventi su accessi, acquisti, dispositivi e gruppi con ID account, senza nomi/e-mail. Gli ID collegano app e servizio. L'interruttore ferma eventi dell'app, non richieste necessarie o eventi server. Usa i [diritti](#rights) per opposizione o cancellazione.

### Newsletter ed e-mail {#newsletter}

Amazon SES invia codici, inviti, avvisi e newsletter. Le e-mail di servizio eseguono quanto richiesto. Nuove iscrizioni richiedono conferma e consenso. Conserviamo indirizzo, lingua, date di iscrizione/conferma, IP, user agent, pagina e versione del consenso.

Ogni newsletter misura aperture e clic di ogni destinatario con un'immagine e `links.news.tablepro.app`. Amazon SES riceve ora, link, IP e user agent e li passa al server per i conteggi. Bloccare immagini ferma la misura delle aperture, non dei clic. Link di disiscrizione e posta non sono tracciati. Non esiste un interruttore separato. Disiscriviti nella newsletter o con il controllo a un clic della posta; non segue conferma e-mail. Iscriversi di nuovo richiede conferma. Rimbalzi permanenti e segnalazioni spam fermano gli invii. Chiedi l'eliminazione via [contatto](#controller).

La vecchia lista ha trasferito tutti gli indirizzi non disiscritti, confermati o meno, compresi acquirenti, titolari e iscritti beta. Le disiscrizioni sono rimaste; rimbalzi e reclami sono entrati nella lista di soppressione. Vedi [conservazione](#retention).

### Assistenza {#support}

Messaggi, allegati e diagnostica raggiungono noi e il servizio scelto. Possono contenere dati o segreti che includi. Crisp riceve IP, browser e pagine viste quando la chat si carica su sito e portale. Conserva l'IP se inizi una conversazione. Forniamo lingua e, nel portale autenticato, e-mail e ID account. Caricare la chat ovunque serve al legittimo interesse di assistenza. Le conversazioni iniziate si basano sul consenso.

## Le tue app {#apps}

| App e versione | Dati d'uso | Controllo |
| --- | --- | --- |
| Mac 0.86.0, da 0.86.0-beta.1 | Diretti a PostHog; attivi | Settings > General > Privacy |
| Linux da 0.1.0-beta.1 | Diretti a PostHog; attivi | Preferences > General > Privacy |
| iPhone/iPad distribuiti | Rapporto tramite server; spento fino al consenso | Settings > Privacy |

<span id="mac-local"></span>

### Dati sul dispositivo {#local-data}

Connessioni, cronologia query, registri locali e schede restano sul dispositivo salvo condivisione scelta. Il traffico database va ai tuoi server. Le password usano l'archivio credenziali della piattaforma. Mac riferisce le chiavi SSH nella posizione su disco. L'analisi non include host, utenti, SQL, righe o credenziali. [Integrazioni](#integrations), Team Library e assistenza hanno le eccezioni descritte.

### Mac {#mac-app}

L'analisi diretta e il comportamento account iniziano con 0.86.0, incluso 0.86.0-beta.1. Accedere registra il Mac e recupera il piano. Il token resta nel suo Keychain, senza sincronizzarsi su iCloud Keychain. Una chiave di licenza esistente viene scambiata per l'accesso e cancellata localmente.

#### Dati d'uso Mac {#mac-usage-report}

Attivi per impostazione iniziale, senza domanda prima del primo evento. Disattiva **Share usage data** in **Settings > General > Privacy**. Avviare con l'opzione spenta non avvia PostHog. Non partono rapporti automatici di crash; il relativo modulo è disattivato.

Gli eventi comprendono uso giornaliero con tipi/numero di connessioni aperte, primo tentativo, successo e prima query per tipo, blocchi di funzioni a pagamento e motivi, clic di upgrade, metodo di accesso/uscita e richieste d'acquisto licenza con risposte. PostHog aggiunge contesto di dispositivo, schermo, rete, sessione, app e sistema. Riceve IP e deduce posizione approssimativa. Prima dell'accesso usa ID installazione casuale senza profilo. Dopo usa ID account e profilo con versioni, architettura, lingua e posizione. Uscire crea un nuovo ID. Vedi [campi e destinazioni](https://docs.tablepro.app/security/privacy#usage-data).

#### Aggiornamenti e plugin {#mac-updates}

Feed e catalogo vengono da GitHub tramite updates.tablepro.app. Download e conteggi raggiungono GitHub. Le richieste portano IP e user agent. Disattiva **Automatically check for updates** in **Settings > General > Software Update** per fermare i controlli automatici. Il catalogo non ha interruttore. I [dettagli tecnici](https://docs.tablepro.app/security/privacy#update-checks) includono il vecchio feed.

#### Vecchie versioni Mac {#mac-license}

Prima di 0.86.0 lo stesso interruttore attivo controlla un rapporto al server. Contiene ID macchina hash, dati app/sistema, tipi/numero connessioni, stato licenza e date del primo tentativo/successo. Gli aggiornamenti inviati sono scartati. Il server attuale inoltra a PostHog con paese Cloudflare, senza IP o chiave e senza profilo personale. L'ID può collegarsi ai dispositivi account. Non esiste più uno storico dedicato, ma job, log, backup e archivio possono conservare dati. Vedi [conservazione](#retention).

Le vecchie versioni contattano il servizio licenza dopo l'inserimento della chiave. Inviano chiave, ID, nome Mac e versioni. I dispositivi appartengono all'account; attivazione/disattivazione sono registrate con IP e user agent. L'[inventario](https://docs.tablepro.app/security/privacy#older-mac-reports) mantiene campi e tempi.

### iPhone e iPad {#ios-app}

L'app distribuita non invia rapporti prima di **Share Usage Data** al primo avvio o in **Settings > Privacy**. La base è il consenso. Il rapporto giornaliero passa dal server a PostHog senza IP, con paese Cloudflare e senza profilo. Contiene ID Apple hash, piattaforma, versioni, architettura, lingua, tipi/numero connessioni e date di primo tentativo, successo e prima query. Indica sempre nessuna licenza e non ha impostazioni aggiornamento. Non controlla account, licenze, aggiornamenti o plugin.

Database/SSH, iCloud facoltativo e accesso Microsoft Entra per SQL Server inviano a quei servizi. Password e chiavi incollate restano in Keychain; certificati e cronologia sul dispositivo. Connessioni entrano nell'indice Spotlight locale. Live Activity può mostrare SQL sulla schermata bloccata salvo Hide Query. Separatamente, Share With App Developers di Apple può inviarci crash e statistiche tramite App Store Connect. L'app non ha reporter crash o libreria analitica esterna. Vedi [iOS](https://docs.tablepro.app/ios#privacy).

### Linux {#linux-app}

Da 0.1.0-beta.1 l'accesso registra il dispositivo secondo [account](#account). I segreti usano il Portachiavi desktop. Gli aggiornamenti del gestore pacchetti seguono il distributore scelto. Nessun rapporto crash automatico.

#### Dati d'uso Linux {#linux-usage-data}

Attivi da 0.1.0-beta.1. Disattiva Share usage data in Preferences > General > Privacy. Diretti a PostHog EU: uso giornaliero con tipi/numero connessioni, primo tentativo/successo e query per tipo, accesso/uscita, clic upgrade, richieste licenza e risposte Buy. Portano ID installazione/account, versioni, architettura, lingua e metadati SDK. PostHog riceve IP e deduce posizione. Prima dell'accesso ID casuale senza profilo; dopo profilo che collega uso e acquisti. Uscire azzera l'ID. Nessun host, SQL, righe o credenziali. La registrazione dispositivo include separatamente l'hostname.

Disattivare ferma nuovi invii. Una richiesta in corso può finire. Non elimina eventi precedenti o ferma account e analisi server. Vedi [conservazione](#retention), [diritti](#rights) e [inventario](https://docs.tablepro.app/security/privacy#linux-usage-data).

<span id="mac-third-parties"></span>

## Servizi scelti {#integrations}

Fornitori database, SSH e proxy ricevono direttamente il traffico richiesto. I servizi d'accesso ricevono autenticazione quando configurati. Apple Maps fornisce mappe; DuckDB estensioni delle query. Gli helper scaricati per connessioni e IA contattano i fornitori. Valgono le loro condizioni.

### iCloud e Handoff {#icloud}

iCloud Sync facoltativo conserva connessioni, gruppi, tag, impostazioni, query e profili SSH nel CloudKit privato. Su Mac sincronizza anche preferiti e cartelle di tabelle e database, nomi, nomi utente e modalità password dei profili di credenziali, mai la password del profilo. Apple ospita; non possiamo leggerlo. Sincronizzare password è separato e inizialmente spento, tramite iCloud Keychain cifrato end-to-end. Su Mac copre altri segreti scritti lì, come chiavi IA e vecchie licenze. I token account non sincronizzano. Mac richiede Pro o Team; iOS è gratuito. Handoff passa ID connessione e tabella, o nome/host senza tabella, tra dispositivi Apple senza credenziali. Vedi [controlli](https://docs.tablepro.app/features/icloud-sync).

### IA e strumenti esterni {#ai-tools}

L'IA invia direttamente al fornitore o modello locale scelto. Può inviare prompt, schema, SQL e conversazione. Allegare righe della griglia è spento inizialmente. Risultati di strumenti query autorizzati entrano anche nella conversazione e raggiungono il fornitore indipendentemente dall'interruttore. GitHub Copilot scarica un helper da npm e inizia con Send telemetry to GitHub acceso.

MCP è spento inizialmente e non parte così, nemmeno via bridge o abbinamento. Acceso, i client autenticati chiedono dati secondo i permessi concessi. Un client IA può inviare risultati al suo servizio. Server MCP esterni ricevono argomenti approvati. Vedi [controlli IA/MCP](https://docs.tablepro.app/security/privacy#ai-providers).

## Siti e memoria browser {#website}

Server e Cloudflare ricevono IP, user agent e pagine. Cloudflare Web Analytics conta visite, provenienza, tempi di caricamento, categorie browser/sistema/dispositivo e paesi senza memoria browser o fingerprint. Il legittimo interesse è capire e mantenere il sito.

Google Analytics carica in Consent Mode. Prima di Allow manda un segnale senza cookie o ID salvato. Il consenso attiva cookie e misure di visite, download e acquisti. Memoria pubblicitaria, personalizzazione e dati pubblicitari sono sempre negati. Google dichiara che GA4 non memorizza IP.

Crisp carica su ogni pagina come in [assistenza](#support). Puntare o usare Tab su Buy carica lo script {merchant} da jsDelivr, che riceve IP/browser; il clic apre checkout. Iniziare il modulo carica Turnstile contro abusi, legittimo interesse. Paese e fuso suggeriscono lingua/sconti regionali per legittimo interesse; richieste senza cookie e risposte non conservate sulla pagina.

La prima visita crea `tablepro:attribution` per 90 giorni: tag/provenienza, pagina iniziale e data. Al checkout il server passa la fonte a {merchant} come metadati, la conserva nell'ordine e invia a PostHog con checkout/pagamento. Pagina e data non restano. La base è legittimo interesse nel misurare fonti d'acquisto. Richieste pubbliche di newsletter, acquisto e sconto omettono credenziali e non impostano cookie portale. Il portale non esegue script analitici, ma il server invia eventi.

### Documentazione {#docs}

Mintlify ospita docs.tablepro.app. Richieste pagine, Google Fonts e stelle GitHub rivelano IP/browser ai fornitori. Docs chiede consenso distinto. Prima di Allow non salva cookie analitici o ID. Allow abilita Google Analytics e ID Mintlify. Cookie settings nel piè di pagina revoca e rimuove entrambi. La scelta del sito non passa a quell'origine.

### Cookie e memoria {#cookies}

Cloudflare Web Analytics non salva nulla nel browser. Le pagine pubbliche non impostano cookie propri. Queste durate sono distinte dalla conservazione dei fornitori. La memoria necessaria mantiene accesso o scelta; consenso e interessi sono descritti qui.

| Nome/servizio | Scopo e avvio | Durata e controllo |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | Google Analytics dopo consenso | Fino a 2 anni; rifiutare elimina |
| `tablepro:analytics-consent` | Scelta necessaria, distinta sito/docs | Fino a cancellazione |
| `tablepro:attribution` | Fonte iniziale con checkout; legittimo interesse | 90 giorni |
| `theme`, `tablepro:language`, `tablepro:campaign-closed`, `tablepro:linux-install` | Aspetto, lingue scelte/scartate, avviso chiuso, metodo di installazione Linux scelto; legittimo interesse | Fino a cancellazione; tema portale distinto |
| `mintlify_anonymous_id` | ID docs dopo consenso locale | Fino a cancellazione o rifiuto |
| Cookie `crisp-client/` | Continuità chat dopo caricamento su ogni pagina; legittimo interesse | 6 mesi, rinnovati al ritorno |
| `__Host-tp_session` | Accesso necessario al portale | 30 giorni autenticato; massimo 10 minuti durante accesso; uscire elimina |
| `locale`, `context`, `sign-in-return-to` | Lingua, vista Personal/gruppo e ritorno; legittimo interesse | Primi due fino a cancellazione; ritorno 15 minuti |

Modifica il consenso con Cookie settings nel piè di pagina o qui:

<cookie-settings></cookie-settings>

## Destinatari {#sharing}

| Destinatario | Dati e scopo |
| --- | --- |
| [OVH]({ovhPrivacy}) | Server e dati del servizio |
| [Cloudflare]({cloudflarePrivacy}) | DNS/proxy, R2 e backup, Turnstile, Cloudflare Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | E-mail Amazon SES, consegna e interazione; link CloudFront, eventi SNS/SQS |
| [PostHog EU]({posthogPrivacy}) | Analisi app/server; ID senza nomi/e-mail; richieste dirette con IP |
| [{merchant}]({merchantPrivacy}) | Merchant of record indipendente; checkout, fatturazione e acquisti |
| [Crisp]({crispPrivacy}) | Chat, browser/pagine e identità account autenticato |
| [Google]({googlePrivacy}) | Analisi sito/docs e font; accesso scelto |
| [Mintlify]({mintlifyPrivacy}) | Hosting docs e misura consentita |
| [GitHub]({githubPrivacy}) | Download, aggiornamenti, plugin, stelle, issue pubbliche e accesso facoltativo |
| [Apple]({applePrivacy}) | Accesso facoltativo; servizi e diagnostica nelle sezioni app/integrazioni |
| [jsDelivr]({jsdelivrPrivacy}) | Script checkout con IP/browser |

I membri ricevono contenuti e dettagli secondo il ruolo. Le integrazioni ricevono i dati diretti loro. Non vendiamo dati o li condividiamo per pubblicità. Altre divulgazioni solo se obbligatorie per legge. Si applicano anche le politiche dei fornitori.

## Luoghi di trattamento {#transfers}

OVH e Amazon SES sono a Singapore (`ap-southeast-1` per SES). PostHog è nell'UE; Crisp ha sede in Francia. {publisherName} opera dal Vietnam. Fornitori statunitensi, inclusi {merchant}, Google, GitHub, Cloudflare, Amazon Web Services e Mintlify, trattano negli USA. Archivi e backup possono riguardare altri paesi. Le garanzie SEE/Regno Unito usano clausole contrattuali standard o altri meccanismi approvati dei fornitori; Google usa anche EU-US Data Privacy Framework. Chiedi informazioni via [contatto](#controller).

## Conservazione {#retention}

Non abbiamo fissato limiti dove indicato. Eliminare l'account non elimina PostHog o Crisp. Scrivi via [contatto](#controller) per la cancellazione presso quei fornitori su richiesta.

| Dati | Conservazione e cancellazione |
| --- | --- |
| Analisi PostHog | Nessun limite fissato. Disattivare lascia eventi precedenti. Chiedi cancellazione. |
| Job e log server | I job mantengono rapporti durante invii/tentativi. I log servono a sicurezza e diagnosi. Nessun limite globale; nessuna promessa di zero copie. |
| Dispositivi | Anche rimossi, fino alla cancellazione account |
| Account e audit | Rimossi account, accessi, dispositivi, licenze e appartenenze. Audit senza limite; rimossi campi e-mail e IP/user agent dell'autore, ma indirizzi nel testo libero possono restare. |
| Ordini e avvisi fornitori | Ordini per fisco/contabilità senza limite. Rimossi legami account/e-mail. Eventi {merchant}, Amazon SES e Apple restano; dati personali d'acquisto e destinatario/interazione e-mail sono ripuliti per l'account eliminato. |
| Team Library | Elementi cancellati mantengono ultima versione per sync. Cancellazione normale gruppo: libreria dopo 30 giorni, prima ripristinabile. Eliminare account dell'unico proprietario rimuove entrambi subito. Fine licenza non elimina. |
| Autenticazione | Link/codici scadono in 15 minuti, cancellati 7 giorni dopo. Sessioni 30 giorni. Token scadono 90 giorni dopo uso, cancellati 30 dopo. Job e-mail mantengono testo chiaro fino alla pulizia: un giorno dopo invio o 7 dopo rinuncia. |
| Newsletter | Nuovi indirizzi non confermati dopo 30 giorni. Confermati/migrati fino a richiesta o eliminazione account con quell'indirizzo. Disiscrizione conserva indirizzo segnato come tale. |
| Soppressione | Indirizzi respinti/segnalati e prime/ultime date restano dopo cancellazione account/iscrizione per impedire invii. Nessun limite. |
| Google Analytics | Dati utente/evento: 2 mesi; rapporti totali standard separati |
| Cloudflare Web Analytics | Totali degli ultimi sei mesi disponibili |
| Assistenza | Crisp e posta fino a cancellazione, anche su richiesta. Nessun limite. |
| Backup e archivio migrazione | Nessun limite. Eliminare account non rimuove copie. La vecchia base completa include nomi/e-mail, licenze, ordini, gruppi, nomi dispositivi, iscritti, beta, posta, rapporti d'uso e log licenza con IP. |

## Scelte e diritti {#rights}

Usa interruttori, Cookie settings sito/docs e disiscrizione. Revocare consenso vale per il futuro senza invalidare il passato. Gli interruttori non eliminano dati né fermano analisi server. In [Settings del portale]({account}) esporti o elimini account; non copre tutti i record conservati.

Secondo residenza, chiedi accesso, rettifica, cancellazione, limitazione, portabilità o opposizione al legittimo interesse. Nessun account necessario: scrivi via [contatto](#controller). Possiamo chiedere dettagli per trovare i record, come ID installazione. Non inviare mai una chiave di licenza in chiaro per e-mail. Rispondiamo entro un mese. Puoi reclamare all'autorità di protezione dati. Obblighi legali possono limitare la cancellazione.

### Diritti regionali {#regional-rights}

**Residenti in California.** Il California Consumer Privacy Act ti dà il diritto di sapere quali informazioni personali raccogliamo, di chiederne l'eliminazione, di rifiutarne la vendita e di non subire un trattamento diverso per l'esercizio di questi diritti. Non vendiamo informazioni personali.

## Minori {#children}

TablePro non si rivolge a minori di 16 anni e non ne raccogliamo consapevolmente dati. Se ritieni che un minore ci abbia dato dati, contattaci e li elimineremo.

## Sicurezza {#security}

I servizi usano HTTPS. Gli account non hanno password. Credenziali e token API di gruppo sono hash, salvo il job e-mail temporaneo in [conservazione](#retention). Accesso limitato a {publisherName} e [destinatari](#sharing). Nessun sistema è perfettamente sicuro. Segnala vulnerabilità nella [pagina sicurezza](/it/security#report).

## Modifiche {#changes}

La pagina mostra l'ultimo aggiornamento. Le versioni precedenti restano nella [cronologia pubblica del repository web]({webGithub}/commits/main/resources/data/legal/en/privacy.md). Aggiorniamo prima di nuove finalità, avvisiamo direttamente quando la legge lo impone e chiediamo nuovo consenso se necessario.
