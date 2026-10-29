---
title: Informativa sulla privacy
description: Quali dati raccolgono le app, il sito web e il portale account di TablePro, dove vanno, per quanto tempo restano e come modificarli o eliminarli.
updatedAt: "2026-10-30"
---

Questa informativa riguarda TablePro per Mac, TablePro per iPhone e iPad, il sito web tablepro.app, la documentazione su docs.tablepro.app e il portale account account.tablepro.app. Descrive quali dati ciascuno di essi invia e conserva effettivamente oggi. Entrambe le app sono open source con licenza AGPLv3: puoi quindi leggere il codice che invia i dati descritti di seguito nel [repository di TablePro]({github}).

## Riepilogo {#summary}

- L'app per Mac invia dati di utilizzo. L'invio è attivo per impostazione predefinita e puoi disattivarlo. L'app per iPhone e iPad invia un rapporto sull'utilizzo solo se lo attivi.
- Se accedi a un account TablePro o attivi una chiave di licenza, l'app per Mac registra il tuo Mac sul nostro server, con il suo nome, e verifica regolarmente il tuo piano.
- Le query che esegui, i risultati e le password non vengono inviati a TablePro. Fa eccezione ciò che scegli di pubblicare nella Team Library: impostazioni delle connessioni (mai le password) e query salvate.
- Le richieste di IA vengono inviate direttamente dall'app per Mac al fornitore di IA che configuri, non a noi.
- Dalla versione che introduce gli account TablePro, l'app per Mac invia i dati di utilizzo direttamente a PostHog, il nostro servizio di analisi del prodotto nell'UE, che riceve quindi l'indirizzo IP del tuo Mac e ne ricava una posizione approssimativa. Le versioni precedenti e l'app per iPhone e iPad inviano rapporti sull'utilizzo al nostro server, che li inoltra a PostHog senza i loro indirizzi IP. Il tuo account tiene un registro delle modifiche apportate, come accessi e nuovi dispositivi, con l'indirizzo IP e il browser della richiesta che ha fatto ciascuna.
- Il sito web conta le visualizzazioni con Cloudflare Web Analytics, che non imposta cookie. Carica inoltre Google Analytics, che imposta cookie solo se li autorizzi. Ogni pagina carica anche la nostra chat dal vivo, Crisp, che imposta i propri cookie.
- Il portale account su account.tablepro.app non carica alcuno script di analisi. Imposta un cookie per mantenere l'accesso, e nelle sue impostazioni puoi scaricare i dati del tuo account o eliminarlo.
- Gli acquisti sono venduti da {merchant}, il nostro merchant of record.

## Chi è responsabile {#controller}

{publisherName}, sviluppatore indipendente a {publisherCity}, in {publisherCountry}, pubblica le app TablePro e questo sito web ed è responsabile dei dati personali descritti qui (il titolare del trattamento). Per qualsiasi domanda su questa informativa o sui tuoi dati, scrivi a [{email}](mailto:{email}).

## TablePro per Mac {#mac-app}

### Dati di utilizzo {#mac-usage-report}

Dalla versione che introduce gli account TablePro, l'app per Mac invia i dati di utilizzo direttamente a PostHog, il nostro servizio di analisi del prodotto, su `eu.i.posthog.com` nell'UE. **L'invio è attivo per impostazione predefinita e l'app non chiede il consenso prima di inviare il primo evento.** Per disattivarlo, apri **Settings > General > Privacy** e deseleziona **Share usage data**. Finché l'impostazione è disattivata, l'app non invia nulla a PostHog e, se l'app si avvia con l'impostazione disattivata, non avvia affatto la libreria di PostHog.

L'app invia un evento:

- una volta al giorno mentre è in esecuzione, con i nomi dei tipi di database delle connessioni aperte (per esempio "PostgreSQL") e il numero di connessioni aperte;
- al tuo primo tentativo di connessione, alla tua prima connessione riuscita e alla tua prima query, ciascuno con il tipo di database;
- quando ti mostra che una funzione a pagamento non è disponibile, una volta per funzione a ogni avvio dell'app, con la funzione e il motivo, per esempio che non hai effettuato l'accesso;
- quando fai clic per passare a un piano superiore, con il punto dell'app in cui hai fatto clic;
- quando accedi, con il modo (nell'app, con una chiave di licenza o con lo scambio della chiave già presente sul Mac), e quando esci.

La libreria di PostHog aggiunge a ogni evento il modello del Mac, le dimensioni dello schermo, il fuso orario e la lingua, se è connesso via Wi-Fi, la versione, la build e il bundle ID dell'app, la versione di macOS, la versione della libreria e un ID di sessione casuale. PostHog riceve l'indirizzo IP del tuo Mac con ogni richiesta e ne ricava una posizione approssimativa, come il paese e la città. Finché l'impostazione è attiva, la libreria scarica anche da PostHog le sue impostazioni e i feature flag (`/config` da `eu-assets.i.posthog.com` e `/flags` da `eu.i.posthog.com`).

Prima che tu acceda, gli eventi portano un ID casuale che la libreria crea sul tuo Mac, e PostHog non crea un profilo di persona per esso. Quando accedi, portano l'ID del tuo account, e il profilo di quell'account in PostHog conserva le versioni dell'app e di macOS, l'architettura del processore, la lingua dell'app e la posizione approssimativa che PostHog ricava dall'indirizzo IP. Questo mette in relazione le tue installazioni con i tuoi accessi e acquisti. Uscire dall'account avvia un nuovo ID casuale. I dati di utilizzo dell'app non contengono più un ID del dispositivo, l'indicazione di una licenza attivata né le impostazioni degli aggiornamenti.

Le versioni precedenti agli account TablePro inviano invece un rapporto sull'utilizzo a `api.tablepro.app`, con la stessa impostazione, circa dieci secondi dopo l'avvio e poi una volta al giorno mentre sono in esecuzione. Un rapporto contiene:

- un ID del dispositivo: un hash SHA-256 dell'UUID hardware del tuo Mac (l'UUID stesso non viene mai inviato);
- la piattaforma, la versione dell'app, la versione di macOS, l'architettura del processore e la lingua dell'app;
- i nomi dei tipi di database delle connessioni aperte (per esempio "PostgreSQL") e il numero di connessioni aperte;
- l'indicazione di una licenza attivata;
- la data e l'ora del primo tentativo di connessione e della prima connessione riuscita;
- le impostazioni degli aggiornamenti (come vengono installati e con quale frequenza l'app li verifica). Il nostro server le scarta quando riceve il rapporto.

Né gli eventi né i rapporti contengono nomi host, nomi utente, password, query o righe.

Il nostro server non conserva il rapporto né l'indirizzo IP da cui proviene. Lo inoltra a PostHog come evento relativo all'ID del dispositivo, con il paese che Cloudflare indica per la tua connessione e senza la chiave di licenza né l'indirizzo IP, e PostHog non ne ricava un profilo di persona. Poiché il tuo account elenca i propri dispositivi con lo stesso ID, i rapporti di un Mac su cui hai effettuato l'accesso o attivato una licenza possono essere collegati al tuo account.

### Verifiche della licenza {#mac-license}

Le versioni precedenti agli account TablePro contattano il nostro server delle licenze solo dopo che inserisci una chiave di licenza. Lo fanno quando attivi la licenza, all'avvio se sono trascorsi almeno {revalidateDays} giorni dall'ultima verifica e ogni {revalidateDays} giorni successivamente. Ogni verifica invia:

- la chiave di licenza;
- l'ID del dispositivo descritto in [Dati di utilizzo](#mac-usage-report);
- il nome del Mac, come impostato in macOS (spesso include il tuo nome);
- la versione dell'app e di macOS.

La disattivazione di un Mac invia solo la chiave di licenza e l'ID del dispositivo.

Il nostro server registra ogni Mac attivato come dispositivo dell'account titolare della licenza: ID del dispositivo e nome, versioni dell'app e di macOS, e il momento dell'ultimo contatto. L'attivazione e la disattivazione di un Mac vengono annotate nel registro di audit di quell'account con l'indirizzo IP e lo user agent della richiesta; le verifiche periodiche no. Il portale account elenca i tuoi dispositivi per nome. Se il nostro server non è raggiungibile, le funzioni a pagamento continuano a funzionare per {graceDays} giorni dall'ultima verifica riuscita.

### Account TablePro {#mac-account}

Dalla versione che introduce gli account TablePro, accedi all'app per Mac con un [account TablePro](#account) anziché con una chiave di licenza. L'app apre la pagina di accesso in una finestra del browser, dove puoi digitare il codice dell'email di accesso. Dopo l'accesso registra il tuo Mac come dispositivo del tuo account: l'ID del dispositivo descritto sopra, il nome del Mac, la piattaforma e le versioni dell'app e di macOS. Poi scarica il tuo piano dal nostro server come file firmato una volta al giorno mentre è in esecuzione, e quel file mantiene attive le funzioni a pagamento fino a {offlineDays} giorni senza il nostro server. Il token che mantiene l'accesso dell'app è conservato solo nel Portachiavi di macOS di quel Mac e non viene mai sincronizzato tramite iCloud Keychain, nemmeno con la sincronizzazione delle password attiva.

Una chiave di licenza già presente sul Mac viene scambiata una sola volta con un accesso all'account titolare e poi eliminata dal Mac. Un dispositivo che non si collega da 180 giorni viene rimosso. Puoi rimuovere i dispositivi nell'app o nel portale account, e la prima volta che un Mac usa la tua licenza te lo comunichiamo via email.

### Team Library {#library}

La Team Library fa parte della licenza Team. Quando scegli **Share > Publish to Team Library…** per una connessione oppure **Publish Saved Queries to Team…** nella barra laterale Favorites, l'app per Mac carica sul nostro server ciò che pubblichi:

- impostazioni della connessione: host, porta, nome del database, nome utente, impostazioni SSH e SSL, opzioni del driver, comandi di avvio, impostazioni Tunnel Command, livello di Safe Mode e impostazioni di IA, ma mai le password;
- query salvate: nomi, testo SQL, parole chiave e cartelle.

Dalla versione che introduce gli account TablePro, l'app per Mac di ogni membro con un posto scarica le modifiche della libreria all'avvio, ogni 15 minuti e dopo ogni pubblicazione. Una pubblicazione invia solo ciò che è cambiato e rimuove solo gli elementi che quel Mac ha pubblicato e non ha più. Se un'altra persona ha modificato prima un elemento, l'app chiede quale copia tenere e mostra chi ha modificato per ultimo ogni query del team. Le versioni precedenti agli account TablePro scaricano la libreria all'avvio, al massimo una volta alla settimana, e il Mac che pubblica la scarica di nuovo subito dopo. Da queste versioni, una nuova pubblicazione sostituisce quella precedente. La sezione Library del portale account mostra ogni elemento, con il nome di chi l'ha modificato per ultimo, ai membri che possono leggere la libreria, e consente a proprietari e amministratori di eliminare elementi. Un elemento eliminato resta sul nostro server per 90 giorni, così ogni Mac può sincronizzarne l'eliminazione. Se la licenza termina, la libreria rimane sul nostro server finché il proprietario del team non elimina il team, il che elimina anche la libreria.

Team Catalog, l'altra funzione Team, scrive i file delle connessioni senza password in una cartella condivisa che scegli. Non passa dal nostro server.

### Aggiornamenti e plugin {#mac-updates}

- **Verifiche degli aggiornamenti.** Una volta al giorno l'app per Mac scarica il feed degli aggiornamenti da GitHub (`raw.githubusercontent.com`). La richiesta non invia informazioni sul Mac oltre a quelle presenti in ogni richiesta web: l'indirizzo IP e uno user agent con la versione dell'app. Per disattivarla, apri **Settings > General > Software Update** e deseleziona **Automatically check for updates**. Gli aggiornamenti stessi vengono scaricati da GitHub.
- **Catalogo dei plugin.** All'avvio dell'app e quando apri le impostazioni dei plugin, viene scaricato da GitHub l'elenco dei driver e dei temi disponibili. Non esiste un'impostazione per disattivarlo. I driver e i temi che installi vengono scaricati da GitHub e il browser dei plugin legge il numero di download dall'API di GitHub.

GitHub riceve il tuo indirizzo IP con queste richieste. A esse si applica l'informativa sulla privacy di GitHub.

### Servizi che scegli di usare {#mac-third-parties}

L'app per Mac invia dati a questi servizi solo quando li configuri, direttamente e mai tramite TablePro:

- **I tuoi database, server SSH e proxy**, che ricevono ciò che le connessioni inviano loro.
- **Fornitori di IA.** Quando aggiungi un fornitore e usi l'assistente IA o i suggerimenti inline, le richieste vengono inviate a quel fornitore oppure a un modello in esecuzione sul Mac. Per impostazione predefinita una richiesta include il tipo e il nome del database, le definizioni di tabelle e colonne dello schema e la query corrente. Le righe dei risultati vengono inviate solo se attivi questa opzione. Si applicano i termini del fornitore. Aggiungere GitHub Copilot scarica il suo server di linguaggio da npm e la sua impostazione "Send telemetry to GitHub" è inizialmente attiva.
- **Servizi di accesso**: Microsoft Entra ID, Google, Amazon Web Services e Cloudflare Access, quando una connessione li usa.
- **Apple Maps**, che fornisce le tessere della mappa quando visualizzi i risultati su una mappa.
- **DuckDB**, che fornisce le estensioni di DuckDB la prima volta che una query ne usa una.
- **Client MCP.** Il server MCP è disattivato per impostazione predefinita. Si avvia quando lo attivi oppure quando un client MCP che hai configurato avvia il bridge di TablePro o si associa a esso e ascolta solo sul Mac (127.0.0.1). Un client IA collegato, come Claude o Cursor, riceve i risultati che richiede e li invia al proprio servizio secondo i propri termini.
- **Server MCP che aggiungi.** Una sessione IA invia a quel server le chiamate agli strumenti che approvi, con i rispettivi argomenti.

### Dati che rimangono sul Mac {#mac-local}

Le password sono conservate nel Portachiavi di macOS. L'elenco delle connessioni, la cronologia delle query, Query Insights, le istantanee di Data Rewind, le impostazioni e le schede aperte sono conservati sul Mac. L'app fa riferimento alle chiavi SSH nella loro posizione sul disco e non le copia. Le versioni precedenti agli account TablePro non contengono un sistema di segnalazione degli arresti anomali né una libreria di analisi di terze parti. Dalla versione che introduce gli account TablePro, l'app include la libreria di PostHog, che invia i dati di utilizzo descritti sopra. La libreria contiene il sistema di segnalazione degli arresti anomali di PostHog, che l'app lascia disattivato, quindi non viene inviata alcuna segnalazione. La libreria conserva il suo ID casuale, le sue impostazioni e gli eventi non ancora inviati in file sotto `~/Library/Application Support/com.TablePro`.

## TablePro per iPhone e iPad {#ios-app}

**Non viene inviato nulla a TablePro finché non attivi Share Usage Data**, al primo avvio dell'app oppure in seguito in **Settings > Privacy**. Se lo fai, l'app invia un rapporto una volta al giorno allo stesso server delle versioni dell'app per Mac precedenti agli account TablePro e il nostro server lo inoltra a PostHog nello stesso modo, senza il relativo indirizzo IP. Il rapporto contiene un hash SHA-256 dell'identificatore assegnato da Apple all'app sul dispositivo, la piattaforma, le versioni dell'app e di iOS, l'architettura del processore, la lingua dell'app, i nomi dei tipi di database delle connessioni aperte, il numero di connessioni aperte, e la data e l'ora del primo tentativo di connessione, della prima connessione riuscita e della prima query. Non contiene impostazioni degli aggiornamenti e indica sempre che nessuna licenza è attivata, perché l'app non ha né le une né l'altra.

L'app non verifica licenze o aggiornamenti e non effettua richieste di plugin. Oltre al rapporto facoltativo, si connette solo ai tuoi database e server SSH, a iCloud di Apple se attivi iCloud Sync e a Microsoft quando una connessione SQL Server accede con Microsoft Entra ID.

Sul dispositivo, le password e le chiavi SSH incollate sono conservate nel Portachiavi e i certificati non vengono mai sincronizzati. La cronologia delle query rimane sul dispositivo. Le connessioni vengono aggiunte all'indice Spotlight locale per consentirti di cercarle. Durante l'esecuzione di una query, la relativa Live Activity mostra l'SQL sulla schermata di blocco e nella Dynamic Island espansa, a meno che non attivi **Settings > Live Activities > Hide Query**.

Se condividi le analisi con gli sviluppatori di app nelle impostazioni di iPhone o iPad, Apple può passarci rapporti sugli arresti anomali e statistiche di utilizzo tramite App Store Connect. L'app non contiene un proprio sistema di segnalazione degli arresti anomali né una propria libreria di analisi di terze parti.

## iCloud Sync e Handoff {#icloud}

iCloud Sync è disattivato finché non lo attivi, sia sul Mac sia su iPhone e iPad. Quando è attivo, i record vengono inviati a un database privato nel tuo account iCloud (contenitore `iCloud.com.TablePro`). TablePro non può leggerli.

- Sul Mac scegli cosa sincronizzare: connessioni, gruppi e tag, impostazioni, profili SSH, profili delle credenziali (nome e nome utente, mai la password), tabelle e database preferiti, query salvate (incluso il testo SQL) e cartelle delle tabelle. Un record di connessione include host, porta, nome utente, nome del database, impostazioni SSH e SSL, comandi di avvio, script prima della connessione e regole di IA. La cronologia delle query, le istantanee di Data Rewind e le fonti delle password non vengono mai sincronizzate.
- iPhone e iPad sincronizzano connessioni, gruppi e tag.
- Le password vengono sincronizzate solo se attivi anche **Passwords** in Sync Categories sul Mac oppure **Sync Passwords** su iPhone e iPad, tramite iCloud Keychain. Sul Mac questo sincronizza anche gli altri segreti che TablePro conserva nel Portachiavi, come le chiavi dei fornitori di IA e la chiave di licenza. Dalla versione che introduce gli account TablePro, la chiave di licenza viene eliminata appena è scambiata con un accesso, e il token che mantiene l'accesso dell'app non viene mai sincronizzato.

Sul Mac, iCloud Sync fa parte di una licenza Starter o Team. Su iPhone e iPad è gratuito.

Handoff passa l'ID della connessione aperta e il nome della tabella aperta tra i tuoi dispositivi tramite Apple. Se non è aperta alcuna tabella, passa invece il nome della connessione oppure il suo host quando la connessione non ha un nome. Non invia impostazioni o credenziali.

## Sito web {#website}

**Hosting.** Il sito web e il portale account funzionano sul nostro server, dietro Cloudflare. Come qualsiasi server web, ricevono il tuo indirizzo IP, lo user agent del browser e l'indirizzo di ogni pagina che richiedi.

**Cloudflare Web Analytics.** Cloudflare aggiunge il suo script Web Analytics alle pagine del sito web; il portale account non lo esegue. Il browser lo carica da `static.cloudflareinsights.com` e segnala a Cloudflare ogni visualizzazione: la pagina, il sito che vi ha rimandato, il tempo di caricamento e il browser, il sistema operativo e il tipo di dispositivo. Cloudflare aggiunge il paese da cui proviene la connessione. Lo script non imposta cookie e non conserva nulla nel browser e Cloudflare dichiara di non usare l'indirizzo IP o i dettagli del browser per identificarti tramite fingerprinting. Cloudflare ci mostra dati complessivi, come le visualizzazioni per pagina o per paese, anziché una registrazione di ogni visitatore. Base giuridica: legittimo interesse.

**Google Analytics.** Il sito carica Google Analytics su ogni pagina in Consent Mode. Finché non scegli **Consenti** nella richiesta sui cookie, non imposta cookie e invia a Google solo un segnale senza cookie per ogni pagina, senza identificatori conservati sul dispositivo. Se lo autorizzi, Google Analytics imposta i cookie `_ga` e `_ga_<ID>` e misura le visite, come le pagine visualizzate, i clic sui download e l'avvio di un acquisto. L'archiviazione per la pubblicità, la personalizzazione degli annunci e i dati utente per la pubblicità sono sempre negati. Google dichiara che Google Analytics 4 non registra né conserva gli indirizzi IP. La nostra proprietà Google Analytics usa il periodo di conservazione predefinito di Google: Google elimina i dati a livello di utente e di evento raccolti dopo 2 mesi. I rapporti standard di Google, che contengono dati complessivi anziché identificatori, non sono interessati. Base giuridica: il tuo consenso per i cookie.

**Chat dal vivo.** Ogni pagina del sito web e del portale account mostra un pulsante di chat del nostro fornitore, Crisp. Dopo il caricamento della pagina, il browser carica lo script di Crisp da `client.crisp.chat` e Crisp imposta i cookie descritti in [Cookie e archiviazione nel browser](#cookies). Crisp riceve il tuo indirizzo IP, i dettagli del browser, gli indirizzi delle pagine visualizzate e i messaggi che scrivi e conserva l'indirizzo IP se avvii una conversazione. Comunichiamo a Crisp la lingua della pagina. Quando hai effettuato l'accesso al portale account, gli comunichiamo anche l'indirizzo email e l'ID del tuo account, che collegano la conversazione al tuo account. Non gli comunichiamo nessun'altra informazione su di te. Crisp ha sede in Francia.

**Script di acquisto.** Quando punti il mouse su un pulsante Acquista o lo raggiungi con il tasto Tab, il browser carica lo script di acquisto di {merchant} da jsDelivr (`cdn.jsdelivr.net`), che riceve il tuo indirizzo IP e i dettagli del browser. Il pagamento stesso si apre su {merchant} solo quando fai clic.

**Verifica della newsletter.** Quando inizi a compilare il modulo della newsletter, il browser carica Cloudflare Turnstile da `challenges.cloudflare.com` per verificare che si stia iscrivendo una persona; Cloudflare riceve il tuo indirizzo IP e i dettagli del browser.

**Attribuzione degli acquisti.** Quando arrivi sul sito, il browser conserva per 90 giorni nell'archiviazione locale un record della prima visita chiamato `tablepro:attribution`: l'origine della visita (i tag `ref` o `utm_*` del link seguito oppure il sito di provenienza), la pagina di arrivo e il momento della visita. Se inizi un acquisto, il record viene inviato con la richiesta di pagamento. Il nostro server passa l'origine della visita a {merchant} come metadati del pagamento, la conserva con l'ordine dopo il pagamento e la invia a PostHog insieme all'avvio del pagamento e al pagamento. La pagina di arrivo e il momento della visita non vengono conservati.

**Documentazione.** La documentazione su docs.tablepro.app è ospitata da Mintlify, che riceve il tuo indirizzo IP e i dati del tuo browser a ogni pagina, e le pagine caricano i caratteri da Google Fonts. La barra di navigazione mostra il numero di stelle del repository, che il tuo browser legge dall'API di GitHub, quindi anche GitHub riceve il tuo indirizzo IP e i dati del tuo browser. Questa richiesta non imposta cookie. La documentazione pone la propria domanda sui cookie, perché non può leggere la risposta che hai dato su questo sito. Finché lì non scegli **Allow**, non imposta cookie e non conserva alcun ID visitatore. Se lo autorizzi, Google Analytics imposta i cookie `_ga` e `_ga_<ID>` e misura le tue visite alla documentazione, e Mintlify conserva un ID visitatore casuale, `mintlify_anonymous_id`, nell'archiviazione locale per contarle. **Cookie settings**, nel piè di pagina della documentazione, cambia la tua risposta, e il rifiuto rimuove entrambi. Base giuridica: il tuo consenso.

**Lingua e sconto regionale.** Per suggerirti la pagina nella tua lingua quando il browser non ne indica nessuna tra quelle del sito, e per mostrare lo sconto regionale che il checkout applicherebbe, il sito chiede a Cloudflare (`/cdn-cgi/trace`) e al nostro server da quale paese proviene la tua connessione, e può leggere il fuso orario del tuo dispositivo. Nessuna delle due richieste porta cookie, e la pagina non conserva nulla delle risposte. Base giuridica: legittimo interesse.

Leggere il sito non imposta cookie propri. Le richieste di iscrizione alla newsletter, checkout e verifica dei codici sconto dal sito pubblico omettono le credenziali: non inviano i cookie del portale account né accettano cookie dalla risposta. Aprire le pagine del portale account è un’operazione distinta: accedervi imposta il cookie del portale elencato sotto. Tutto ciò che il sito conserva nel browser è indicato in [Cookie e archiviazione del browser](#cookies).

## Acquisti {#purchases}

Le licenze sono vendute da {merchant} (Polar Software, Inc.), il nostro merchant of record e rivenditore. Acquisti da {merchant} secondo i suoi termini per gli acquirenti e la sua informativa sulla privacy. {merchant} riceve il pagamento, calcola e versa eventuali imposte sulle vendite o IVA, invia ricevute e fatture e gestisce problemi e controversie relativi ai pagamenti. Raccoglie nome, indirizzo email, indirizzo di fatturazione e dati di pagamento. Non vediamo mai i dati completi della tua carta.

Quando avvii un pagamento, il nostro server comunica a {merchant} cosa acquisti, la lingua della pagina da cui acquisti, l'origine della visita (vedi [Sito web](#website)) e il tuo indirizzo IP, che {merchant} usa per determinare imposte e valuta. Da {merchant} riceviamo il tuo indirizzo email, il nome e l'indirizzo di fatturazione come li hai inseriti, ciò che hai acquistato, gli importi, gli ID degli ordini e degli abbonamenti e le modifiche successive, come rinnovi, disdette e rimborsi. Con ogni ordine conserviamo l'indirizzo email, il paese di fatturazione e gli importi.

Un acquisto fatto senza accedere va all'account TablePro dell'indirizzo email usato per l'acquisto, che viene creato se non esiste e resta non verificato fino al tuo primo accesso. Nel [portale account]({account}) puoi cambiare il ciclo di fatturazione o i posti di un abbonamento, disdirlo o riprenderlo e chiedere un rimborso. Quando disdici, il motivo scelto e l'eventuale commento vanno a {merchant} e sono conservati con l'abbonamento. Carta, fatture, dati fiscali e indirizzo di fatturazione sono nel [portale clienti di {merchant}]({portal}), che il portale account apre per te. I rimborsi sono descritti nella [politica di rimborso](/it/refund-policy) e le possibilità offerte dalla licenza nei [termini di servizio](/it/terms).

## Portale account {#account}

Il [portale account]({account}) su account.tablepro.app è dove gestisci il tuo account TablePro: licenze, dispositivi, fatturazione e team. Funziona sul nostro server, dietro Cloudflare, come il sito web.

**Il tuo account.** Un account appartiene a una persona ed è identificato da un indirizzo email. Contiene quell'indirizzo, il nome e la lingua che imposti, i tuoi metodi di accesso, i dispositivi collegati, le tue licenze e i tuoi ordini, i team di cui fai parte con il tuo ruolo e il tuo posto, e un registro di audit delle modifiche apportate, come accessi, nuovi dispositivi e modifiche ai team, con l'indirizzo IP e il browser della richiesta che ha fatto ciascuna. Le nostre email ti arrivano nella lingua del tuo account.

**Accesso.** Ti inviamo via email un link e un codice di 6 cifre: il link funziona una volta, il codice consente 5 tentativi e scadono entrambi dopo 15 minuti. Puoi anche aggiungere passkey; di ognuna conserviamo la chiave pubblica, il nome che le dai, se si sincronizza tra i tuoi dispositivi e quando è stata aggiunta e usata l'ultima volta. Oppure puoi accedere con Apple, GitHub o Google: il fornitore ci comunica un tuo ID e il tuo indirizzo email verificato, e Apple anche il tuo nome la prima volta. Conserviamo l'ID e l'indirizzo con il tuo account e, per Apple, un token che teniamo cifrato e revochiamo presso Apple quando scolleghi Apple o elimini l'account. Se l'indirizzo di un fornitore appartiene a un account esistente, prima di collegarli inviamo a quell'account un link e un codice da confermare, a meno che l'indirizzo non sia gestito da Google (Gmail o Google Workspace).

**I tuoi team.** Quando inviti qualcuno in un team, conserviamo il suo indirizzo email, il ruolo e se l'invito comprende un posto, e gli inviamo un link valido per 7 giorni. Proprietari e amministratori vedono i membri del team con nomi e indirizzi email, gli inviti e il registro di audit del team, che mostra chi ha cambiato cosa, compresi gli indirizzi invitati, ma mai un indirizzo IP o un browser. I membri vedono il team, il suo piano, i suoi posti e il proprio ruolo.

**I tuoi dati.** Nelle impostazioni puoi cambiare nome, indirizzo email e lingua, aggiungere e rimuovere metodi di accesso, scaricare i dati del tuo account come file JSON ed eliminare l'account. Non puoi eliminarlo finché sei proprietario di un team con altri membri. L'eliminazione rimuove i tuoi metodi di accesso, dispositivi, licenze, appartenenze ai team e i team di cui sei l'unico membro, e termina i tuoi abbonamenti senza rimborso. Ciò che conserviamo dopo è indicato in [Per quanto tempo conserviamo i dati](#retention).

**Cosa carica il portale.** Il portale non carica Google Analytics, Cloudflare Web Analytics né altri script di analisi, e non pone alcuna domanda sui cookie. Mostra la chat dal vivo di Crisp descritta in [Sito web](#website), e un acquisto fatto lì apre il pagamento di {merchant} sopra la pagina. Segnala errori e tempi di caricamento a Grafana Cloud con Grafana Faro: l'errore, la schermata in cui si è verificato (mai l'indirizzo completo, che può contenere il token di un link), browser e sistema operativo, e un ID casuale della tua visita.

## Newsletter {#newsletter}

Se ti iscrivi alle note di rilascio, prima ti inviamo un link di conferma nella lingua della pagina da cui ti iscrivi. Il link vale 7 giorni e un indirizzo ne riceve al massimo 3 al giorno. Dopo la conferma, il tuo indirizzo entra nella nostra lista della newsletter su Resend, il servizio che invia le nostre email. Ogni newsletter contiene un link per annullare l'iscrizione, gestito da Resend. Dopo l'annullamento non inviamo altre newsletter; per eliminare anche l'indirizzo, scrivici. Cloudflare Turnstile verifica il modulo, come descritto in [Sito web](#website).

Nel passaggio dal nostro server precedente, ogni indirizzo della sua mailing list che non aveva annullato l'iscrizione è entrato in questa lista come iscritto, confermato o no: quel server aveva aggiunto anche gli indirizzi di acquirenti, titolari di licenza e iscritti alla beta, e inviava loro email. Gli indirizzi che avevano annullato l'iscrizione sono stati trasferiti come disiscritti, e quelli le cui email non erano state recapitate o erano state segnalate come spam sono finiti invece nella lista di soppressione di Resend, così nessuna newsletter li raggiunge.

## Cookie e archiviazione nel browser {#cookies}

La lettura del sito pubblico e le sue richieste per newsletter, checkout e codici sconto non impostano cookie propri. Accedere al portale account, o iniziare a farlo, imposta l'unico cookie strettamente necessario elencato sotto. Cloudflare Web Analytics non imposta cookie e non conserva nulla nel browser. I cookie di Google Analytics vengono impostati solo con il tuo consenso. Crisp imposta i propri cookie su ogni pagina dopo il caricamento della chat. Nulla viene usato per pubblicità o venduto.

- **`_ga` e `_ga_<ID>`** (cookie di Google Analytics, fino a 2 anni, solo se autorizzi le analisi): un identificatore casuale per il browser e lo stato della visita corrente. Rifiutarli o modificare successivamente la risposta li elimina. Base giuridica: consenso.
- **`tablepro:analytics-consent`** (archiviazione locale, finché non la cancelli): la risposta alla richiesta sulle analisi, per non riproporla su ogni pagina. Il portale account non carica analisi, quindi non pone questa domanda e non legge la risposta. Base giuridica: strettamente necessaria per rispettare la tua scelta.
- **`tablepro:attribution`** (archiviazione locale, 90 giorni): il record della prima visita descritto in [Sito web](#website). Non contiene un tuo identificatore e viene inviato solo con una richiesta di pagamento, che passa l'origine della visita a {merchant}. Base giuridica: legittimo interesse.
- **`theme`** (archiviazione locale, finché non la cancelli): la scelta di un aspetto chiaro, scuro o di sistema. Il portale account conserva la propria. Base giuridica: legittimo interesse.
- **`tablepro:language`** (archiviazione locale, finché non la cancelli): la lingua che hai scelto nel menu delle lingue o nella barra della lingua, e ogni lingua di cui hai chiuso il suggerimento, perché non venga più proposta. Base giuridica: legittimo interesse.
- **`mintlify_anonymous_id`** (archiviazione locale su docs.tablepro.app, impostato da Mintlify, solo se lì autorizzi Google Analytics): l'ID visitatore descritto in [Sito web](#website). Il rifiuto lo rimuove. La documentazione conserva la propria risposta `tablepro:analytics-consent`. Base giuridica: consenso.
- **Cookie che iniziano con `crisp-client/`** (Crisp, per esempio `crisp-client/session/…`; 6 mesi, rinnovati quando ritorni; impostati su ogni pagina dopo il caricamento della chat): mantengono la chat e la conversazione tra pagine e visite. Base giuridica: legittimo interesse, per offrire supporto su ogni pagina.
- **`__Host-tp_session`** (cookie del portale account, 30 giorni dall'accesso): mantiene l'accesso. Prima dell'accesso viene impostato solo mentre è in corso un accesso con passkey, Apple, GitHub, Google o da un'app, per al massimo 10 minuti. L'uscita lo elimina. Le richieste per newsletter, checkout e codici sconto dal sito pubblico omettono le credenziali e non lo ricevono mai. Base giuridica: strettamente necessario.
- **`locale`, `context` e `sign-in-return-to`** (archiviazione locale del portale account): la lingua scelta lì prima dell'accesso e se hai aperto per ultimo Personale o un team, entrambe finché non le cancelli, e per 15 minuti la pagina a cui tornare dopo aver aperto un link di accesso ricevuto via email. Base giuridica: legittimo interesse.
- **`com.grafana.faro.session`** (archiviazione di sessione del portale account, finché non chiudi la scheda): l'ID casuale della visita nei rapporti sugli errori del portale. Base giuridica: legittimo interesse.

Puoi modificare o revocare la risposta sulle analisi in qualsiasi momento tramite **Impostazioni cookie** nel piè di pagina di ogni pagina oppure qui:

<cookie-settings></cookie-settings>

## Base giuridica {#lawful-basis}

Per i lettori dello Spazio economico europeo e del Regno Unito, le basi giuridiche ai sensi del GDPR e del GDPR del Regno Unito sono:

- **Contratto** (Art. 6(1)(b)): vendita e fornitura della licenza, il tuo account con i suoi metodi di accesso e dispositivi, verifiche della licenza, portale account e Team Library.
- **Legittimo interesse** (Art. 6(1)(f)): dati di utilizzo dell'app per Mac e relativa analisi in PostHog, eventi su accessi, acquisti, dispositivi e team che il nostro server invia a PostHog, registro di audit dell'account, sicurezza e prevenzione degli abusi, compreso Cloudflare Turnstile nel modulo della newsletter, registri del server web e rapporti sugli errori del portale account, Cloudflare Web Analytics, record di attribuzione degli acquisti, ricerca del paese per la lingua e lo sconto regionale, e chat dal vivo su ogni pagina.
- **Consenso** (Art. 6(1)(a)): cookie di Google Analytics, rapporto sull'utilizzo dell'app per iPhone e iPad, newsletter e conversazioni che avvii nella chat dal vivo.
- **Obbligo legale** (Art. 6(1)(c)): registri fiscali e contabili e risposte a richieste legittime.

## Chi riceve i dati {#sharing}

Condividiamo dati personali solo con i servizi necessari al funzionamento di TablePro:

- **{merchant}**, il merchant of record per gli acquisti.
- **Resend**, che invia le nostre email: link e codici di accesso, inviti ai team, avvisi sull'account e sulla sicurezza, e newsletter. Conserva la lista della newsletter e ci segnala quando un'email a un indirizzo non viene recapitata o viene segnalata come spam.
- **Il nostro fornitore di hosting e Cloudflare**, per il sito web, il portale account e il server con cui comunicano le app. Cloudflare conta anche le visualizzazioni con Cloudflare Web Analytics e verifica il modulo della newsletter con Turnstile.
- **Google**, per Google Analytics sul sito web e sulla documentazione.
- **Crisp**, per la chat dal vivo su ogni pagina del sito web e del portale account.
- **PostHog** (EU Cloud), il nostro servizio di analisi del prodotto, che riceve i rapporti sull'utilizzo delle app e gli eventi del nostro server su accessi, acquisti, dispositivi e team, con l'ID del tuo account ma mai il tuo indirizzo email o il tuo nome. I dati di utilizzo che l'app per Mac invia direttamente arrivano a PostHog con l'indirizzo IP del tuo Mac.
- **Grafana Labs** (Grafana Cloud), che riceve i log e le tracce del nostro server e i rapporti sugli errori del portale account.
- **Apple, GitHub e Google**, quando accedi al tuo account con loro.
- **jsDelivr**, che serve al browser lo script di acquisto di {merchant} quando punti un pulsante Acquista.
- **Mintlify**, che ospita la documentazione su docs.tablepro.app.
- **GitHub**, che ospita il feed degli aggiornamenti, il catalogo dei plugin e i download, e fornisce il numero di stelle mostrato nella documentazione.

Non vendiamo dati personali e non li condividiamo con gli inserzionisti.

## Trasferimenti internazionali {#transfers}

I servizi elencati operano in diversi paesi, quindi i tuoi dati possono essere trattati fuori dal tuo paese. {merchant}, Google, GitHub, Cloudflare e Mintlify trattano dati negli Stati Uniti; Google lo fa nell'ambito dell'EU-US Data Privacy Framework e delle clausole contrattuali standard. PostHog li tratta nell'Unione europea. Quando la legge lo richiede, i trasferimenti dallo SEE e dal Regno Unito si basano sulle clausole contrattuali standard o su un altro meccanismo approvato.

## Per quanto tempo conserviamo i dati {#retention}

- **Rapporti sull'utilizzo ed eventi di analisi**: il nostro server non ne conserva copia dopo averli inoltrati a PostHog. Non abbiamo stabilito un limite di tempo per essi in PostHog. Eliminare l'account elimina il suo profilo e i suoi eventi in PostHog un'ora dopo.
- **Dati del nostro server precedente**: una copia di tutto il suo database è conservata a tempo indeterminato in un archivio. Comprende licenze, ordini e membri dei team con i loro indirizzi email e nomi; i Mac attivati con una licenza, con i loro nomi; gli iscritti alla newsletter e alla beta; i registri delle email inviate; e i rapporti sull'utilizzo e i registri delle richieste di licenza che conservava, con i loro indirizzi IP.
- **Dispositivi**: conservati finché sono in uso. Un dispositivo che non si collega da 180 giorni viene rimosso, a meno che un file offline per esso sia ancora valido, e un dispositivo rimosso viene eliminato un anno dopo.
- **Registro di audit del tuo account**: conservato finché l'account esiste, con l'indirizzo IP e il browser di ogni modifica che hai fatto. Eliminare l'account rimuove dal registro i tuoi indirizzi email e l'indirizzo IP e il browser delle tue azioni; la traccia di ogni modifica resta.
- **Ordini**: conservati per finalità fiscali e contabili. Eliminare l'account rimuove da essi il tuo indirizzo email e il tuo account.
- **Notifiche di {merchant}, Resend e Apple**: 180 giorni. Quelle di {merchant} contengono nome, indirizzo email e indirizzo di fatturazione; eliminare l'account li rimuove prima da quelle sui tuoi acquisti.
- **Team Library**: finché un elemento non viene modificato o eliminato; un elemento eliminato viene conservato per 90 giorni. La libreria viene eliminata con il suo team e rimane dopo la fine di una licenza.
- **Link e codici di accesso**: scadono dopo 15 minuti e vengono eliminati 7 giorni dopo. Le sessioni del portale durano 30 giorni. Il token che mantiene l'accesso di un'app scade 90 giorni dopo l'ultimo uso da parte dell'app e viene eliminato 30 giorni dopo.
- **Account eliminati**: l'account, i suoi metodi di accesso, dispositivi, licenze e appartenenze ai team vengono eliminati subito. Gli ordini e il registro di audit restano come descritto sopra. Ciò che il nostro server precedente conservava su di te resta nel suo archivio, descritto sopra.
- **Newsletter**: un link di conferma e l'indirizzo a cui è stato inviato vengono eliminati 7 giorni dopo la scadenza del link. Un indirizzo confermato, o trasferito dal nostro server precedente, resta nella nostra lista su Resend finché non lo eliminiamo su tua richiesta; dopo l'annullamento dell'iscrizione resta segnato come disiscritto, così non riceve alcuna newsletter.
- **Google Analytics**: dati a livello di utente e di evento per 2 mesi, il periodo di conservazione predefinito di Google usato dalla nostra proprietà. I cookie durano fino a 2 anni oppure vengono eliminati quando li rifiuti.
- **Cloudflare Web Analytics**: Cloudflare ci mostra i totali delle visualizzazioni degli ultimi sei mesi. Nulla viene conservato nel browser.
- **Chat dal vivo ed email di supporto**: conservate da Crisp e nella nostra casella email finché non vengono eliminate. Chiedici di eliminare le tue conversazioni e le tue email.
- **Registri del server web**: conservati per sicurezza e risoluzione dei problemi. Non abbiamo ancora stabilito un periodo fisso.
- **Log e tracce del nostro server e rapporti sugli errori del portale**: 14 giorni, in Grafana Cloud.

## I tuoi diritti {#rights}

A seconda di dove vivi, puoi chiederci di:

- fornirti una copia dei dati personali che conserviamo su di te (accesso);
- correggerli (rettifica);
- eliminarli (cancellazione), salvo quelli che dobbiamo conservare per legge;
- limitare il loro utilizzo (limitazione);
- inviarteli in un formato strutturato e leggibile da una macchina (portabilità);
- smettere di usarli sulla base del legittimo interesse (opposizione).

Puoi revocare il consenso in qualsiasi momento e presentare un reclamo all'autorità di protezione dei dati. Per esercitare uno di questi diritti, scrivi a [{email}](mailto:{email}). Rispondiamo entro 30 giorni. Nel [portale account]({account}), le impostazioni ti danno anche una copia dei dati del tuo account ed eliminano l'account. Per tutto il resto, come un indirizzo della newsletter o un Mac senza account, indica l'indirizzo email, la chiave di licenza o il dispositivo interessato. I dati conservati da {merchant}, Google, Crisp o GitHub sono soggetti anche alle rispettive informative.

**Residenti in California.** Il California Consumer Privacy Act ti dà il diritto di sapere quali informazioni personali raccogliamo, di chiederne l'eliminazione, di rifiutarne la vendita e di non subire un trattamento diverso per l'esercizio di questi diritti. Non vendiamo informazioni personali.

## Minori {#children}

TablePro non è rivolto ai minori di 16 anni e non raccogliamo consapevolmente i loro dati personali. Se ritieni che un minore ci abbia fornito dati personali, contattaci e li elimineremo.

## Sicurezza {#security}

Il traffico tra le app, il sito web, il portale account e il nostro server usa HTTPS. Gli account TablePro non hanno password. I link e i codici di accesso, i token che mantengono l'accesso delle app e i token API dei team vengono conservati come hash. L'attività che invia via email un link e un codice di accesso li conserva in chiaro finché non viene eliminata: un giorno dopo l'invio dell'email, o 7 giorni dopo che abbiamo smesso di tentare l'invio. Entrambi smettono di funzionare 15 minuti dopo la tua richiesta. L'accesso ai nostri sistemi è limitato a {publisherName} e ai fornitori di servizi elencati in [Chi riceve i dati](#sharing). Nessun sistema è perfettamente sicuro. Per segnalare una vulnerabilità, consulta la [pagina Sicurezza](/it/security#report) o scrivi a [{email}](mailto:{email}).

## Modifiche a questa informativa {#changes}

Quando questa informativa cambia, la aggiorniamo qui con una nuova data di "Ultimo aggiornamento" e, quando la legge lo richiede, te lo comunichiamo direttamente.

## Contatti {#contact}

Per domande sulla privacy o su questa informativa, scrivi a [{email}](mailto:{email}).
