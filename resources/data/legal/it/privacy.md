---
title: Informativa sulla privacy
description: Quali dati raccolgono le app, il sito web e il portale account di TablePro, dove vanno, per quanto tempo restano e come modificarli o eliminarli.
updatedAt: "2026-10-08"
---

Questa informativa riguarda TablePro per Mac, TablePro per iPhone e iPad, il sito web tablepro.app, la documentazione su docs.tablepro.app e il portale account tablepro.app/account. Descrive quali dati ciascuno di essi invia e conserva effettivamente oggi. Entrambe le app sono open source con licenza AGPLv3: puoi quindi leggere il codice che invia i dati descritti di seguito nel [repository di TablePro]({github}).

## Riepilogo {#summary}

- L'app per Mac invia a TablePro un rapporto sull'utilizzo una volta al giorno. È attivo per impostazione predefinita e puoi disattivarlo. L'app per iPhone e iPad lo invia solo se lo attivi.
- Se attivi una licenza, l'app per Mac la verifica con il nostro server ogni {revalidateDays} giorni. La verifica include il nome del tuo Mac.
- Le query che esegui, i risultati e le password non vengono inviati a TablePro. Fa eccezione ciò che scegli di pubblicare nella Team Library: impostazioni delle connessioni (mai le password) e query salvate.
- Le richieste di IA vengono inviate direttamente dall'app per Mac al fornitore di IA che configuri, non a noi.
- Il nostro server conserva l'indirizzo IP di ogni rapporto sull'utilizzo e verifica della licenza e determina un paese per ogni rapporto sull'utilizzo. Non abbiamo stabilito un limite di tempo per la conservazione di questi dati.
- Il sito web conta le visualizzazioni con Cloudflare Web Analytics, che non imposta cookie. Carica inoltre Google Analytics, che imposta cookie solo se li autorizzi. Ogni pagina carica anche la nostra chat dal vivo, Crisp, che imposta i propri cookie.
- Gli acquisti sono venduti da {merchant}, il nostro merchant of record.

## Chi è responsabile {#controller}

TablePro, che pubblica le app e questo sito web, è responsabile dei dati personali descritti qui (il titolare del trattamento). Per qualsiasi domanda su questa informativa o sui tuoi dati, scrivi a [{email}](mailto:{email}).

## TablePro per Mac {#mac-app}

### Rapporto sull'utilizzo {#mac-usage-report}

L'app per Mac invia un rapporto sull'utilizzo a `api.tablepro.app` circa dieci secondi dopo l'avvio e poi una volta al giorno mentre è in esecuzione. **È attivo per impostazione predefinita e l'app non chiede il consenso prima del primo invio.** Per disattivarlo, apri **Settings > General > Privacy** e deseleziona **Share anonymous usage data**.

Un rapporto contiene:

- un ID del dispositivo: un hash SHA-256 dell'UUID hardware del tuo Mac (l'UUID stesso non viene mai inviato);
- la piattaforma, la versione dell'app, la versione di macOS, l'architettura del processore e la lingua dell'app;
- i nomi dei tipi di database delle connessioni aperte (per esempio "PostgreSQL") e il numero di connessioni aperte;
- l'indicazione di una licenza attivata;
- la data e l'ora del primo tentativo di connessione e della prima connessione riuscita;
- le impostazioni degli aggiornamenti (come vengono installati e con quale frequenza l'app li verifica). Il nostro server le scarta quando riceve il rapporto.

Non contiene mai nomi host, nomi utente, password, query o righe.

Il nostro server conserva ogni rapporto con l'indirizzo IP da cui proviene. Determina poi un paese per quell'indirizzo IP inviandolo a ip-api.com e, se il tentativo fallisce, a ipinfo.io e poi a geoplugin.net. Queste ricerche avvengono tramite HTTP non cifrato. Il paese viene conservato insieme al rapporto. Poiché la verifica della licenza descritta di seguito invia lo stesso ID del dispositivo, i rapporti di un Mac con una licenza attivata possono essere collegati a quella licenza.

### Verifiche della licenza {#mac-license}

L'app per Mac contatta il nostro server delle licenze solo dopo che inserisci una chiave di licenza. Lo fa quando attivi la licenza, all'avvio se sono trascorsi almeno {revalidateDays} giorni dall'ultima verifica e ogni {revalidateDays} giorni successivamente. Ogni verifica invia:

- la chiave di licenza;
- l'ID del dispositivo descritto sopra;
- il nome del Mac, come impostato in macOS (spesso include il tuo nome);
- la versione dell'app e di macOS.

La disattivazione di un Mac invia solo la chiave di licenza e l'ID del dispositivo.

Il nostro server registra ogni richiesta relativa alla licenza con il relativo indirizzo IP e contenuto e conserva l'ID e il nome di ogni Mac attivato insieme alla licenza. Il portale account elenca quei Mac per nome. Se il nostro server non è raggiungibile, le funzioni a pagamento continuano a funzionare per {graceDays} giorni dall'ultima verifica riuscita.

### Team Library {#library}

La Team Library fa parte della licenza Team. Quando scegli **Share > Publish to Team Library…** per una connessione oppure **Publish Saved Queries to Team…** nella barra laterale Favorites, l'app per Mac carica sul nostro server ciò che pubblichi:

- impostazioni della connessione: host, porta, nome del database, nome utente, impostazioni SSH e SSL, opzioni del driver, comandi di avvio, impostazioni Tunnel Command, livello di Safe Mode e impostazioni di IA, ma mai le password;
- query salvate: nomi, testo SQL, parole chiave e cartelle.

I Mac associati alla stessa licenza Team scaricano la libreria all'avvio, al massimo una volta alla settimana, e il Mac che pubblica la scarica di nuovo subito dopo. Una nuova pubblicazione sostituisce quella precedente. Rimuovere un membro dal team elimina tutto ciò che quel membro ha pubblicato. Se la licenza scade o viene sospesa, la libreria rimane sul nostro server finché non ci chiedi di eliminarla.

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

Le password sono conservate nel portachiavi di macOS. L'elenco delle connessioni, la cronologia delle query, Query Insights, le istantanee di Data Rewind, le impostazioni e le schede aperte sono conservati sul Mac. L'app fa riferimento alle chiavi SSH nella loro posizione sul disco e non le copia. L'app non contiene un sistema di segnalazione degli arresti anomali né una libreria di analisi di terze parti.

## TablePro per iPhone e iPad {#ios-app}

**Non viene inviato nulla a TablePro finché non attivi Share Usage Data**, al primo avvio dell'app oppure in seguito in **Settings > Privacy**. Se lo fai, l'app invia un rapporto una volta al giorno allo stesso server dell'app per Mac e il nostro server conserva e ricerca il relativo indirizzo IP nello stesso modo. Il rapporto contiene un hash SHA-256 dell'identificatore assegnato da Apple all'app sul dispositivo, la piattaforma, le versioni dell'app e di iOS, l'architettura del processore, la lingua dell'app, i nomi dei tipi di database delle connessioni aperte, il numero di connessioni aperte, e la data e l'ora del primo tentativo di connessione, della prima connessione riuscita e della prima query. Non contiene impostazioni degli aggiornamenti e indica sempre che nessuna licenza è attivata, perché l'app non ha né le une né l'altra.

L'app non verifica licenze o aggiornamenti e non effettua richieste di plugin. Oltre al rapporto facoltativo, si connette solo ai tuoi database e server SSH, a iCloud di Apple se attivi iCloud Sync e a Microsoft quando una connessione SQL Server accede con Microsoft Entra ID.

Sul dispositivo, le password e le chiavi SSH incollate sono conservate nel portachiavi e i certificati non vengono mai sincronizzati. La cronologia delle query rimane sul dispositivo. Le connessioni vengono aggiunte all'indice Spotlight locale per consentirti di cercarle. Durante l'esecuzione di una query, la relativa Live Activity mostra l'SQL sulla schermata di blocco e nella Dynamic Island espansa, a meno che non attivi **Settings > Live Activities > Hide Query**.

Se condividi le analisi con gli sviluppatori di app nelle impostazioni di iPhone o iPad, Apple può passarci rapporti sugli arresti anomali e statistiche di utilizzo tramite App Store Connect. L'app non contiene un proprio sistema di segnalazione degli arresti anomali né una propria libreria di analisi di terze parti.

## iCloud Sync e Handoff {#icloud}

iCloud Sync è disattivato finché non lo attivi, sia sul Mac sia su iPhone e iPad. Quando è attivo, i record vengono inviati a un database privato nel tuo account iCloud (contenitore `iCloud.com.TablePro`). TablePro non può leggerli.

- Sul Mac scegli cosa sincronizzare: connessioni, gruppi e tag, impostazioni, profili SSH, profili delle credenziali (nome e nome utente, mai la password), tabelle e database preferiti, query salvate (incluso il testo SQL) e cartelle delle tabelle. Un record di connessione include host, porta, nome utente, nome del database, impostazioni SSH e SSL, comandi di avvio, script prima della connessione e regole di IA. La cronologia delle query, le istantanee di Data Rewind e le fonti delle password non vengono mai sincronizzate.
- iPhone e iPad sincronizzano connessioni, gruppi e tag.
- Le password vengono sincronizzate solo se attivi anche **Passwords** in Sync Categories sul Mac oppure **Sync Passwords** su iPhone e iPad, tramite iCloud Keychain. Sul Mac questo sincronizza anche gli altri segreti che TablePro conserva nel portachiavi, come le chiavi dei fornitori di IA e la chiave di licenza.

Sul Mac, iCloud Sync fa parte di una licenza Starter o Team. Su iPhone e iPad è gratuito.

Handoff passa l'ID della connessione aperta e il nome della tabella aperta tra i tuoi dispositivi tramite Apple. Se non è aperta alcuna tabella, passa invece il nome della connessione oppure il suo host quando la connessione non ha un nome. Non invia impostazioni o credenziali.

## Sito web {#website}

**Hosting.** Il sito web e il portale account funzionano sul nostro server, dietro Cloudflare. Come qualsiasi server web, ricevono il tuo indirizzo IP, lo user agent del browser e l'indirizzo di ogni pagina che richiedi.

**Cloudflare Web Analytics.** Cloudflare aggiunge il suo script Web Analytics alle pagine del sito web e del portale account. Il browser lo carica da `static.cloudflareinsights.com` e segnala a Cloudflare ogni visualizzazione: la pagina, il sito che vi ha rimandato, il tempo di caricamento e il browser, il sistema operativo e il tipo di dispositivo. Cloudflare aggiunge il paese da cui proviene la connessione. Lo script non imposta cookie e non conserva nulla nel browser e Cloudflare dichiara di non usare l'indirizzo IP o i dettagli del browser per identificarti tramite fingerprinting. Cloudflare ci mostra dati complessivi, come le visualizzazioni per pagina o per paese, anziché una registrazione di ogni visitatore. Base giuridica: legittimo interesse.

**Google Analytics.** Il sito carica Google Analytics su ogni pagina in Consent Mode. Finché non scegli **Consenti** nella richiesta sui cookie, non imposta cookie e invia a Google solo un segnale senza cookie per ogni pagina, senza identificatori conservati sul dispositivo. Se lo autorizzi, Google Analytics imposta i cookie `_ga` e `_ga_<ID>` e misura le visite, come le pagine visualizzate, i clic sui download e l'avvio di un acquisto. L'archiviazione per la pubblicità, la personalizzazione degli annunci e i dati utente per la pubblicità sono sempre negati. Google dichiara che Google Analytics 4 non registra né conserva gli indirizzi IP. La nostra proprietà Google Analytics usa il periodo di conservazione predefinito di Google: Google elimina i dati a livello di utente e di evento raccolti dopo 2 mesi. I rapporti standard di Google, che contengono dati complessivi anziché identificatori, non sono interessati. Base giuridica: il tuo consenso per i cookie.

**Chat dal vivo.** Ogni pagina del sito web e del portale account mostra un pulsante di chat del nostro fornitore, Crisp. Dopo il caricamento della pagina, il browser carica lo script di Crisp da `client.crisp.chat` e Crisp imposta i cookie descritti in [Cookie e archiviazione nel browser](#cookies). Crisp riceve il tuo indirizzo IP, i dettagli del browser, gli indirizzi delle pagine visualizzate e i messaggi che scrivi e conserva l'indirizzo IP se avvii una conversazione. Comunichiamo a Crisp la lingua della pagina e nessun'altra informazione su di te. Crisp ha sede in Francia.

**Script di acquisto.** Quando punti il mouse su un pulsante Acquista o lo raggiungi con il tasto Tab, il browser carica lo script di acquisto di {merchant} da jsDelivr (`cdn.jsdelivr.net`), che riceve il tuo indirizzo IP e i dettagli del browser. Il pagamento stesso si apre su {merchant} solo quando fai clic.

**Attribuzione degli acquisti.** Quando arrivi sul sito, il browser conserva per 90 giorni nell'archiviazione locale un record della prima visita chiamato `tablepro:attribution`: l'origine della visita (i tag `ref` o `utm_*` del link seguito oppure il sito di provenienza), la pagina di arrivo e il momento della visita. Se inizi un acquisto, il record viene inviato con la richiesta di pagamento. Il nostro server lo scarta: non viene convalidato, letto o conservato e non viene passato a {merchant}.

**Documentazione.** La documentazione su docs.tablepro.app è ospitata da Mintlify, che riceve il tuo indirizzo IP e i dati del tuo browser a ogni pagina, e le pagine caricano i caratteri da Google Fonts. La documentazione pone la propria domanda sui cookie, perché non può leggere la risposta che hai dato su questo sito. Finché lì non scegli **Allow**, non imposta cookie e non conserva alcun ID visitatore. Se lo autorizzi, Google Analytics imposta i cookie `_ga` e `_ga_<ID>` e misura le tue visite alla documentazione, e Mintlify conserva un ID visitatore casuale, `mintlify_anonymous_id`, nell'archiviazione locale per contarle. **Cookie settings**, nel piè di pagina della documentazione, cambia la tua risposta, e il rifiuto rimuove entrambi. Base giuridica: il tuo consenso.

La consultazione del sito non imposta cookie propri. Iscriversi alla newsletter oppure avviare un acquisto o una verifica di un codice sconto invia una richiesta al nostro server che imposta i due cookie del portale account, `tablepro-session` e `XSRF-TOKEN`. Tutto ciò che il sito conserva nel browser è elencato in [Cookie e archiviazione nel browser](#cookies).

## Acquisti {#purchases}

Le licenze sono vendute da {merchant} (Polar Software, Inc.), il nostro merchant of record e rivenditore. Acquisti da {merchant} secondo i suoi termini per gli acquirenti e la sua informativa sulla privacy. {merchant} riceve il pagamento, calcola e versa eventuali imposte sulle vendite o IVA, invia ricevute e fatture e gestisce problemi e controversie relativi ai pagamenti. Raccoglie nome, indirizzo email, indirizzo di fatturazione e dati di pagamento. Non vediamo mai i dati completi della tua carta.

Da {merchant} riceviamo il tuo indirizzo email, il nome e l'indirizzo di fatturazione come li hai inseriti, ciò che hai acquistato, gli importi, gli ID degli ordini e degli abbonamenti e le modifiche successive, come rinnovi, disdette e rimborsi. Comunichiamo a {merchant} la lingua della pagina da cui hai acquistato affinché le nostre email ti arrivino in quella lingua. Fatture, ricevute, metodo di pagamento e abbonamento sono nel [portale clienti di {merchant}]({portal}), a cui accedi con l'indirizzo email usato per l'acquisto. I rimborsi sono descritti nella [politica di rimborso](/it/refund-policy) e le possibilità offerte dalla licenza nei [termini di servizio](/it/terms).

## Portale account {#account}

Il [portale account](/account?locale=it) su tablepro.app/account è destinato a chi ha acquistato una licenza. Accedi tramite un link che inviamo a quell'indirizzo email; il link è utilizzabile una sola volta e scade dopo 15 minuti. Il portale mostra le licenze, i Mac attivati su di esse (per nome) e, per una licenza Team, membri, inviti, posti e Team Library.

Conserviamo il tuo indirizzo email insieme a licenze e ordini e la lingua che usi con noi, affinché le nostre email ti arrivino in quella lingua. Quando inviti qualcuno a un team, conserviamo il suo indirizzo email e ruolo e gli inviamo un codice di invito.

## Newsletter {#newsletter}

Se ti iscrivi alle note di rilascio, conserviamo il tuo indirizzo email e la lingua della pagina da cui ti iscrivi. Prima ti inviamo un link di conferma e ogni newsletter contiene un link per annullare l'iscrizione. Dopo l'annullamento non inviamo altre newsletter; per eliminare anche l'indirizzo, scrivici.

## Cookie e archiviazione nel browser {#cookies}

La consultazione del sito pubblico non imposta cookie propri; iscriversi alla newsletter o avviare un acquisto imposta i due cookie del portale strettamente necessari elencati di seguito. Cloudflare Web Analytics non imposta cookie e non conserva nulla nel browser. I cookie di Google Analytics non vengono impostati finché non li autorizzi. Crisp imposta i suoi cookie su ogni pagina dopo il caricamento della chat. Nessun dato descritto qui viene usato per la pubblicità o venduto.

- **`_ga` e `_ga_<ID>`** (cookie di Google Analytics, fino a 2 anni, solo se autorizzi le analisi): un identificatore casuale per il browser e lo stato della visita corrente. Rifiutarli o modificare successivamente la risposta li elimina. Base giuridica: consenso.
- **`tablepro:analytics-consent`** (archiviazione locale, finché non la cancelli): la risposta alla richiesta sulle analisi, per non riproporla su ogni pagina. Il sito web e il portale account la condividono. Base giuridica: strettamente necessaria per rispettare la tua scelta.
- **`tablepro:attribution`** (archiviazione locale, 90 giorni): il record della prima visita descritto in [Sito web](#website). Non contiene un tuo identificatore e viene inviato solo con una richiesta di pagamento, dove il nostro server lo scarta. Base giuridica: legittimo interesse.
- **`theme`** e **`tablepro:banner-dismissed`** (archiviazione locale, finché non la cancelli): la scelta di un aspetto chiaro, scuro o di sistema e il banner che hai chiuso e fino a quando: 30 giorni oppure un anno se dichiari di avere una licenza o ne acquisti una. Base giuridica: legittimo interesse.
- **`mintlify_anonymous_id`** (archiviazione locale su docs.tablepro.app, impostato da Mintlify, solo se lì autorizzi Google Analytics): l'ID visitatore descritto in [Sito web](#website). Il rifiuto lo rimuove. La documentazione conserva la propria risposta `tablepro:analytics-consent`. Base giuridica: consenso.
- **Cookie che iniziano con `crisp-client/`** (Crisp, per esempio `crisp-client/session/…`; 6 mesi, rinnovati quando ritorni; impostati su ogni pagina dopo il caricamento della chat): mantengono la chat e la conversazione tra pagine e visite. Base giuridica: legittimo interesse, per offrire supporto su ogni pagina.
- **`tablepro-session` e `XSRF-TOKEN`** (cookie del portale account, 2 ore): mantengono l'accesso e proteggono i moduli del portale dalla falsificazione delle richieste tra siti. Anche le altre pagine del portale, come la conferma d'acquisto e le pagine della newsletter, li impostano, così come l'iscrizione alla newsletter o l'avvio di un acquisto o di una verifica di un codice sconto da qualsiasi pagina di questo sito. Base giuridica: strettamente necessari.

Puoi modificare o revocare la risposta sulle analisi in qualsiasi momento tramite **Impostazioni cookie** nel piè di pagina di ogni pagina oppure qui:

<cookie-settings></cookie-settings>

## Base giuridica {#lawful-basis}

Per i lettori dello Spazio economico europeo e del Regno Unito, le basi giuridiche ai sensi del GDPR e del GDPR del Regno Unito sono:

- **Contratto** (Art. 6(1)(b)): vendita e fornitura della licenza, verifiche della licenza, portale account e Team Library.
- **Legittimo interesse** (Art. 6(1)(f)): rapporto sull'utilizzo dell'app per Mac e relativa ricerca del paese, registri delle richieste di licenza, sicurezza e prevenzione degli abusi, registri del server web, Cloudflare Web Analytics, record di attribuzione degli acquisti e chat dal vivo su ogni pagina.
- **Consenso** (Art. 6(1)(a)): cookie di Google Analytics, rapporto sull'utilizzo dell'app per iPhone e iPad, newsletter e conversazioni che avvii nella chat dal vivo.
- **Obbligo legale** (Art. 6(1)(c)): registri fiscali e contabili e risposte a richieste legittime.

## Chi riceve i dati {#sharing}

Condividiamo dati personali solo con i servizi necessari al funzionamento di TablePro:

- **{merchant}**, il merchant of record per gli acquisti.
- **Un fornitore di servizi di invio email**, per link di accesso, ricevute inviate da noi, inviti ai team e newsletter.
- **Il nostro fornitore di hosting e Cloudflare**, per il sito web, il portale account e il server con cui comunicano le app. Cloudflare conta anche le visualizzazioni con Cloudflare Web Analytics.
- **Google**, per Google Analytics sul sito web, sulla documentazione e sul portale account.
- **Crisp**, per la chat dal vivo su ogni pagina del sito web e del portale account.
- **jsDelivr**, che serve al browser lo script di acquisto di {merchant} quando punti un pulsante Acquista.
- **Mintlify**, che ospita la documentazione su docs.tablepro.app.
- **ip-api.com, ipinfo.io e geoplugin.net**, che ricevono gli indirizzi IP dai rapporti sull'utilizzo per la ricerca del paese.
- **GitHub**, che ospita il feed degli aggiornamenti, il catalogo dei plugin e i download.

Non vendiamo dati personali e non li condividiamo con gli inserzionisti.

## Trasferimenti internazionali {#transfers}

I servizi elencati operano in diversi paesi, quindi i tuoi dati possono essere trattati fuori dal tuo paese. {merchant}, Google, GitHub, Cloudflare e Mintlify trattano dati negli Stati Uniti; Google lo fa nell'ambito dell'EU-US Data Privacy Framework e delle clausole contrattuali standard. Quando la legge lo richiede, i trasferimenti dallo SEE e dal Regno Unito si basano sulle clausole contrattuali standard o su un altro meccanismo approvato.

## Per quanto tempo conserviamo i dati {#retention}

- **Rapporti sull'utilizzo**, con indirizzi IP e paesi: non è stato stabilito un limite di tempo e nulla li elimina automaticamente.
- **Dati delle licenze**: gli ID e i nomi dei Mac attivati e il registro delle richieste di licenza con i relativi indirizzi IP vengono conservati finché esiste la licenza. Nulla li elimina automaticamente.
- **Ordini**: conservati per finalità fiscali e contabili.
- **Team Library**: fino a una nuova pubblicazione, alla rimozione del membro che l'ha pubblicata o alla tua richiesta di eliminarla. Rimane dopo la fine della licenza.
- **Link di accesso all'account**: scadono dopo 15 minuti e vengono poi eliminati. Le sessioni del portale durano 2 ore.
- **Newsletter**: fino all'annullamento dell'iscrizione oppure all'eliminazione dell'indirizzo su tua richiesta.
- **Google Analytics**: dati a livello di utente e di evento per 2 mesi, il periodo di conservazione predefinito di Google usato dalla nostra proprietà. I cookie durano fino a 2 anni oppure vengono eliminati quando li rifiuti.
- **Cloudflare Web Analytics**: Cloudflare ci mostra i totali delle visualizzazioni degli ultimi sei mesi. Nulla viene conservato nel browser.
- **Chat dal vivo ed email di supporto**: conservate da Crisp e nella nostra casella email finché non vengono eliminate. Chiedici di eliminare le tue conversazioni e le tue email.
- **Registri del server web**: conservati per sicurezza e risoluzione dei problemi. Non abbiamo ancora stabilito un periodo fisso.

## I tuoi diritti {#rights}

A seconda di dove vivi, puoi chiederci di:

- fornirti una copia dei dati personali che conserviamo su di te (accesso);
- correggerli (rettifica);
- eliminarli (cancellazione), salvo quelli che dobbiamo conservare per legge;
- limitare il loro utilizzo (limitazione);
- inviarteli in un formato strutturato e leggibile da una macchina (portabilità);
- smettere di usarli sulla base del legittimo interesse (opposizione).

Puoi revocare il consenso in qualsiasi momento e presentare un reclamo all'autorità di protezione dei dati. Per esercitare uno di questi diritti, scrivi a [{email}](mailto:{email}). Rispondiamo entro 30 giorni. L'eliminazione dei dati avviene manualmente, quindi indica l'indirizzo email, la chiave di licenza o il dispositivo interessato. I dati conservati da {merchant}, Google, Crisp o GitHub sono soggetti anche alle rispettive informative.

**Residenti in California.** Il California Consumer Privacy Act ti dà il diritto di sapere quali informazioni personali raccogliamo, di chiederne l'eliminazione, di rifiutarne la vendita e di non subire un trattamento diverso per l'esercizio di questi diritti. Non vendiamo informazioni personali.

## Minori {#children}

TablePro non è rivolto ai minori di 16 anni e non raccogliamo consapevolmente i loro dati personali. Se ritieni che un minore ci abbia fornito dati personali, contattaci e li elimineremo.

## Sicurezza {#security}

Il traffico tra le app, il sito web, il portale account e il nostro server usa HTTPS. Le ricerche del paese descritte in [Rapporto sull'utilizzo](#mac-usage-report) sono l'eccezione: avvengono tramite HTTP non cifrato. I link di accesso all'account vengono conservati solo come hash e l'accesso ai nostri sistemi è limitato alle persone che gestiscono TablePro. Nessun sistema è perfettamente sicuro. Per segnalare una vulnerabilità, scrivi a [{email}](mailto:{email}).

## Modifiche a questa informativa {#changes}

Quando questa informativa cambia, la aggiorniamo qui con una nuova data di "Ultimo aggiornamento" e, quando la legge lo richiede, te lo comunichiamo direttamente.

## Contatti {#contact}

Per domande sulla privacy o su questa informativa, scrivi a [{email}](mailto:{email}).
