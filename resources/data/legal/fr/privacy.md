---
title: Politique de confidentialité
description: Les données recueillies par TablePro, leurs usages, destinataires et durées de conservation, vos choix et droits.
updatedAt: "2026-11-05"
---

Cette politique couvre TablePro sur Mac, Linux, iPhone et iPad ; tablepro.app ; docs.tablepro.app ; et nos services de compte, achats, assistance et newsletter. L'[inventaire technique](https://docs.tablepro.app/security/privacy) précise champs, destinations et réglages. Le code figure dans le [dépôt public]({github}).

## En bref {#summary}

Les requêtes et résultats ordinaires passent entre votre appareil et votre base. Les données d'utilisation ne contiennent ni SQL, ni lignes, ni identifiants secrets. Le contenu publié dans Team Library, envoyé à l'assistance ou partagé avec l'IA et des outils externes parvient à ces destinataires.

Les données d'utilisation sont activées par défaut sur Mac et Linux, avec un interrupteur. L'app iPhone et iPad publiée attend votre accord. L'analyse directe peut être liée à votre compte et vos achats. La désactiver n'arrête pas les requêtes du compte ni l'analyse du serveur.

Le site mesure les visites et charge Crisp sur chaque page. Les cookies Google Analytics nécessitent votre choix. Les newsletters mesurent ouvertures et clics. Supprimer le compte laisse certains dossiers, dont ceux chez PostHog et Crisp. Consultez la [conservation](#retention) et [vos droits](#rights). Le [responsable](#controller) traite aussi les demandes sans compte.

<span id="contact"></span>

## Responsable {#controller}

{publisherName}, développeur indépendant à {publisherCity}, {publisherCountry}, est responsable des données personnelles décrites ici. Contact : [{email}](mailto:{email}). Nous n'avons pas de délégué à la protection des données. Pour les équipes, nous contrôlons les dossiers de compte, d'invitation et de service. Le contenu Team Library est traité sur instruction de l'équipe, qui choisit ce qu'elle publie et qui y accède.

<span id="lawful-basis"></span>

## Données et usages {#data-use}

Pour l'EEE et le Royaume-Uni, chaque fin indique sa base juridique : contrat (article 6(1)(b)), intérêt légitime (6(1)(f)), consentement (6(1)(a)) ou obligation légale (6(1)(c)). Nous ne prenons aucune décision automatisée produisant des effets juridiques ou aussi importants.

<span id="mac-account"></span>

### Comptes et appareils {#account}

L'usage local gratuit ne nécessite pas de compte. Les services de compte exigent votre adresse e-mail. Nous conservons nom, langue, méthodes de connexion, licences, commandes, appareils, rôles et places dans les équipes. L'enregistrement Mac/Linux transmet identifiant de machine, nom, plateforme et versions de l'app/système. Le nom de l'appareil peut contenir le vôtre. Ce flux est distinct des données d'utilisation. Le but et la base sont de fournir compte et formule au titre du contrat.

La connexion utilise liens et codes par e-mail, passkeys, Apple, GitHub ou Google. Les passkeys ont une clé publique, un nom, un état de synchronisation et des dates d'usage. Les fournisseurs d'identité transmettent un ID et une adresse vérifiée ; Apple peut aussi donner le nom. Son jeton est chiffré et révoqué si vous dissociez Apple ou supprimez le compte. Les changements sont journalisés avec IP et agent utilisateur. L'intérêt légitime est la sécurité et l'enquête sur les abus.

Le [portail]({account}) sert à modifier profil et méthodes de connexion, gérer les appareils, exporter en JSON et supprimer le compte. La suppression est indisponible si vous possédez une équipe avec d'autres membres. Elle termine les abonnements sans remboursement. La [conservation](#retention) précise ce qui reste.

### Achats {#purchases}

{merchant} (Polar Software, Inc.) est le merchant of record et revendeur. Il recueille nom, e-mail, adresse de facturation et données de paiement selon ses conditions. Il gère paiement, taxes, reçus et litiges. Nous ne recevons jamais les données complètes de carte.

Nous transmettons achat, langue, origine de visite et IP pour le paiement, les taxes et la devise. Nous recevons données de l'acheteur/facturation, montants, IDs de commande/abonnement, renouvellements, annulations et remboursements. Les commandes gardent e-mail, pays, montants et attribution. Un achat sans connexion crée si nécessaire un compte non vérifié pour cette adresse. Motifs et commentaires d'annulation vont à {merchant} et restent avec l'abonnement. Le traitement exécute le contrat ; les dossiers fiscaux et comptables répondent aux obligations légales. Sans les données nécessaires, l'achat ne peut aboutir. Gérez la facturation sur le [portail {merchant}]({portal}) ; consultez [conditions](/fr/terms) et [remboursements](/fr/refund-policy).

### Équipes et contenu partagé {#library}

L'auteur d'une invitation fournit e-mail, rôle et place. Propriétaires et administrateurs voient noms, e-mails, invitations et changements d'équipe, adresses invitées comprises, mais pas les IP ou navigateurs du journal. Les membres voient équipe, formule, nombre de places et leur rôle. Ces dossiers servent à exécuter le contrat d'équipe.

Sur Mac, publier dans Team Library envoie réglages de connexion et requêtes enregistrées au serveur pour les membres autorisés. Sont inclus hôte, port, base, utilisateur, SSH/SSL, commandes de démarrage, Tunnel Command et réglages IA. Les requêtes comprennent nom, SQL, mots-clés et dossiers. Les champs de mot de passe sont exclus ; les secrets écrits en SQL ou texte libre ne sont pas retirés. La bibliothèque affiche le dernier auteur. Quitter l'équipe n'efface pas son contenu. Voir les [délais](#retention). Team Catalog écrit plutôt dans un dossier partagé choisi.

### Analyse d'utilisation et du service {#analytics}

Notre intérêt légitime est de comprendre l'usage, corriger les problèmes et mesurer les achats. Mac et Linux envoient les données de [Vos apps](#apps). Le serveur transmet à PostHog connexions, achats, appareils et équipes, avec IDs de compte, sans noms ni e-mails. Ces IDs relient usage et service. L'interrupteur arrête les événements de l'app, pas les requêtes nécessaires ni les événements serveur. Exercez [vos droits](#rights) pour vous opposer ou demander l'effacement.

### Newsletter et e-mails {#newsletter}

Amazon SES envoie codes, invitations, avis de compte et newsletters. Les messages de service exécutent votre demande. Les nouvelles inscriptions à la newsletter nécessitent confirmation et consentement. Nous gardons adresse, langue, dates, IP, agents utilisateurs, page d'inscription et version du texte accepté.

Chaque newsletter mesure ouvertures et clics de chaque destinataire avec une image et `links.news.tablepro.app`. Amazon SES reçoit heure, lien, IP et agent utilisateur, puis les transmet au serveur pour comptage. Bloquer les images arrête la mesure d'ouverture, pas celle des clics. Liens de désinscription et d'e-mail ne sont pas suivis. Aucun interrupteur séparé n'existe pour la mesure. Désinscrivez-vous dans la newsletter ou en un clic dans votre logiciel ; aucun e-mail de confirmation ne suit. Une nouvelle inscription exige confirmation. Rejets définitifs et signalements de spam arrêtent l'envoi. Demandez l'effacement via [contact](#controller).

L'ancienne liste a transféré toute adresse non désinscrite, confirmée ou non, dont acheteurs, titulaires de licences et inscriptions bêta. Les désinscriptions ont été conservées ; rejets et plaintes ont rejoint la liste de suppression. Voir la [conservation](#retention).

### Assistance {#support}

Messages, pièces jointes et diagnostics parviennent à nous et au service choisi. Ils peuvent contenir les données ou secrets que vous incluez. Au chargement du chat, Crisp reçoit IP, navigateur et pages vues sur site et portail. Il conserve l'IP si vous engagez une conversation. Nous donnons la langue et, connecté au portail, votre e-mail et ID de compte. Charger le chat partout répond à notre intérêt légitime d'assistance. Les conversations engagées reposent sur le consentement.

## Vos apps {#apps}

| App et version | Données d'utilisation | Réglage |
| --- | --- | --- |
| Mac 0.86.0, dès 0.86.0-beta.1 | Directement à PostHog ; activées | Settings > General > Privacy |
| Linux dès 0.1.0-beta.1 | Directement à PostHog ; activées | Preferences > General > Privacy |
| iPhone et iPad publiés | Rapport par notre serveur ; désactivé avant accord | Settings > Privacy |

<span id="mac-local"></span>

### Données sur l'appareil {#local-data}

Connexions, historique, journaux locaux et onglets restent sur l'appareil sauf partage choisi. Le trafic des bases va à vos serveurs. Les mots de passe utilisent le stockage d'identifiants de la plateforme. Mac référence les clés SSH à leur emplacement. L'analyse exclut hôtes, utilisateurs, SQL, lignes et secrets. Les [intégrations](#integrations), Team Library et l'assistance ont les exceptions décrites ici.

### Mac {#mac-app}

L'analyse directe et le compte décrits commencent à 0.86.0, y compris 0.86.0-beta.1. La connexion enregistre le Mac et récupère la formule. Le jeton reste dans son Keychain et ne passe jamais par iCloud Keychain. Une ancienne clé de licence est échangée contre une connexion puis effacée localement.

#### Données d'utilisation Mac {#mac-usage-report}

Elles sont activées par défaut, sans question avant le premier événement. Désactivez **Partager des données d’utilisation (Share usage data)** dans **Réglages > Général > Confidentialité (Settings > General > Privacy)**. Un démarrage avec le réglage désactivé ne lance pas PostHog. Aucun rapport automatique de plantage n'est envoyé ; son collecteur est désactivé.

Les événements couvrent usage quotidien avec types/nombre de connexions ouvertes, premier essai, première réussite et première requête par type, blocages de fonctions payantes et motifs, clics de mise à niveau, méthode de connexion/déconnexion et demandes d'achat de licence avec réponses. PostHog ajoute contexte d'appareil, écran, réseau, session, app et système. Il reçoit l'IP et déduit une position approximative. Avant connexion, ID aléatoire d'installation sans profil personnel. Après, ID de compte et profil avec versions, architecture, langue et position. La déconnexion crée un nouvel ID. Voir [champs et destinations](https://docs.tablepro.app/security/privacy#usage-data).

#### Mises à jour et plugins {#mac-updates}

Flux de mises à jour et catalogue viennent de GitHub via updates.tablepro.app. Téléchargements et compteurs atteignent aussi GitHub. Les requêtes portent IP et agent utilisateur. Désactivez **Rechercher automatiquement les mises à jour (Automatically check for updates)** dans **Réglages > Général > Mise à jour de logiciels (Settings > General > Software Update)** pour arrêter les vérifications automatiques. Le catalogue n'a pas d'interrupteur. Les [détails](https://docs.tablepro.app/security/privacy#update-checks) incluent l'ancien flux.

#### Anciennes versions Mac {#mac-license}

Avant 0.86.0, le même réglage activé commande un rapport au serveur. Il contient ID de machine haché, versions, types/nombre de connexions, état de licence et dates de premier essai/réussite. Les réglages de mise à jour envoyés sont écartés. Le serveur actuel relaie vers PostHog avec le pays Cloudflare, sans IP ni clé, sans profil personnel. L'ID peut relier les appareils du compte. Aucun historique dédié n'est conservé aujourd'hui, mais tâches, journaux, sauvegardes et archive peuvent garder des données. Voir [conservation](#retention).

Les anciennes versions appellent le service de licence après saisie d'une clé seulement. Elles envoient clé, ID, nom du Mac et versions. Les appareils appartiennent au compte ; activation/désactivation sont auditées avec IP et agent utilisateur. L'[inventaire](https://docs.tablepro.app/security/privacy#older-mac-reports) conserve champs et fréquence.

### iPhone et iPad {#ios-app}

L'app publiée ne rapporte rien sur l'usage avant **Share Usage Data**, au premier lancement ou dans **Settings > Privacy**. La base est le consentement. Un rapport quotidien passe par le serveur vers PostHog sans IP, avec pays Cloudflare et sans profil personnel. Il contient identifiant Apple haché, plateforme, versions, architecture, langue, types/nombre de connexions et dates de premier essai, réussite et première requête. Il indique toujours aucune licence, sans réglage de mise à jour. Aucun contrôle de compte, licence, mise à jour ou plugin n'est fait.

Bases/SSH, iCloud facultatif et connexion Microsoft Entra pour SQL Server envoient aux services concernés. Mots de passe et clés collées restent dans Keychain ; certificats et historique sur l'appareil. Les connexions entrent dans Spotlight local. Live Activity peut afficher le SQL sur écran verrouillé sauf avec Hide Query. Séparément, Share With App Developers d'Apple peut nous transmettre plantages et statistiques par App Store Connect. L'app n'a ni collecteur de plantage ni bibliothèque d'analyse tierce. Voir [iOS](https://docs.tablepro.app/ios#privacy).

### Linux {#linux-app}

Dès 0.1.0-beta.1, se connecter enregistre l'appareil selon [comptes](#account). Les secrets utilisent le trousseau du bureau. Les mises à jour du gestionnaire de paquets suivent votre distributeur. Aucun rapport automatique de plantage n'est envoyé.

#### Données d'utilisation Linux {#linux-usage-data}

Activées par défaut dès 0.1.0-beta.1. Désactivez Share usage data dans Preferences > General > Privacy. Envoi direct à PostHog EU : usage quotidien avec types/nombre de connexions, premier essai/réussite et requête par type, connexions/déconnexions, clics de mise à niveau et affichages de demande de licence/réponses Buy. Sont inclus IDs, versions, architecture, langue et métadonnées SDK. PostHog reçoit IP et position déduite. Avant connexion, ID aléatoire sans profil ; après, profil reliant usage et achats. La déconnexion réinitialise l'ID. Aucun hôte, SQL, ligne ou secret. L'enregistrement d'appareil inclut séparément le nom d'hôte.

Désactiver arrête les nouveaux envois. Une requête en cours peut finir. Les anciens événements restent, tout comme les requêtes de compte et l'analyse serveur. Voir [conservation](#retention), [droits](#rights) et [inventaire](https://docs.tablepro.app/security/privacy#linux-usage-data).

<span id="mac-third-parties"></span>

## Services choisis {#integrations}

Vos bases, SSH et proxies reçoivent directement le trafic demandé. Les services de connexion reçoivent l'authentification quand ils sont configurés. Apple Maps fournit les cartes ; DuckDB, les extensions utilisées. Les auxiliaires de connexion et IA téléchargés contactent leurs fournisseurs. Leurs conditions s'appliquent.

### iCloud et Handoff {#icloud}

iCloud Sync facultatif garde connexions, groupes, tags, réglages, requêtes et profils SSH dans votre CloudKit privé. Sur Mac, la synchronisation inclut aussi les favoris et dossiers de tables et bases de données, ainsi que les noms, identifiants et modes de mot de passe des profils de connexion, jamais leur mot de passe. Apple l'héberge ; nous ne pouvons le lire. La synchronisation de mots de passe est séparée et désactivée, via iCloud Keychain chiffré de bout en bout. Sur Mac elle couvre aussi les autres secrets de ce magasin, comme clés IA et anciennes licences. Les jetons de compte ne synchronisent jamais. Mac exige Pro ou Team ; iOS est gratuit. Handoff transmet ID de connexion et table, ou nom/hôte sans table ouverte, entre appareils Apple, sans secrets. Voir [réglages](https://docs.tablepro.app/features/icloud-sync).

### IA et outils externes {#ai-tools}

L'IA contacte directement le fournisseur choisi ou modèle local. Instructions, schéma, SQL et conversation peuvent être envoyés. Joindre les lignes de la grille est désactivé par défaut. Les résultats d'un outil de requête autorisé rejoignent aussi la conversation et le fournisseur, indépendamment de ce réglage. GitHub Copilot télécharge un auxiliaire depuis npm et active initialement Envoyer la télémétrie à GitHub (Send telemetry to GitHub).

MCP est désactivé par défaut et ne démarre pas ainsi, même par pont ou jumelage. Activé, les clients authentifiés accèdent selon vos permissions. Un client IA peut transmettre les résultats à son service. Les serveurs MCP externes reçoivent les arguments approuvés. Voir [contrôles IA/MCP](https://docs.tablepro.app/security/privacy#ai-providers).

## Sites et stockage du navigateur {#website}

Serveur et Cloudflare reçoivent IP, agent et pages. Cloudflare Web Analytics compte visites, sources, temps de chargement, catégories de navigateur/système/appareil et pays, sans stockage ni empreinte du navigateur. Notre intérêt légitime est comprendre et entretenir le site.

Google Analytics se charge en Consent Mode. Avant Allow, il envoie un signal sans cookie ni ID stocké. L'accord active cookies et mesure des visites, téléchargements et achats. Stockage publicitaire, personnalisation et données publicitaires sont toujours refusés. Google indique que GA4 ne stocke pas d'IP.

Crisp se charge partout sur site et portail selon [assistance](#support). Pointer ou tabuler vers Buy charge le script {merchant} de jsDelivr, qui reçoit IP et navigateur ; cliquer ouvre le paiement. Commencer le formulaire charge Turnstile contre les abus, intérêt légitime. Pays et fuseau servent aux suggestions de langue et remises régionales, sous intérêt légitime ; les requêtes omettent les cookies et la page ne garde pas les réponses.

La première visite crée `tablepro:attribution` pour 90 jours : tags/source, page d'arrivée et date. À l'achat, le serveur passe la source à {merchant} comme métadonnée, la garde avec la commande et l'envoie à PostHog avec achat/paiement. Page et date ne sont pas conservées. La base est l'intérêt légitime de mesurer les sources d'achat. Les requêtes publiques newsletter, achat et remise omettent les identifiants et ne fixent pas de cookie portail. Le portail n'a pas de script analytique, mais le serveur émet des événements.

### Documentation {#docs}

Mintlify héberge docs.tablepro.app. Requêtes de pages, Google Fonts et étoiles GitHub transmettent IP/navigateur aux fournisseurs. Docs demande un accord distinct. Avant Allow, aucun cookie analytique ni ID visiteur n'y est stocké. Allow active Google Analytics et l'ID Mintlify. Cookie settings au pied des docs retire le choix et les efface. Le choix du site ne passe pas à cette origine.

### Cookies et stockage {#cookies}

Cloudflare Web Analytics ne stocke rien dans le navigateur. Les pages publiques ne fixent pas de cookies propres. Ces durées diffèrent de la conservation chez les fournisseurs. Le stockage nécessaire maintient connexion ou choix ; consentement et intérêt légitime sont précisés ici.

| Nom/service | But et déclenchement | Durée et contrôle |
| --- | --- | --- |
| `_ga`, `_ga_<ID>` | Google Analytics après accord | Jusqu'à 2 ans ; refuser les efface |
| `tablepro:analytics-consent` | Choix nécessaire, distinct site/docs | Jusqu'à effacement |
| `tablepro:attribution` | Source initiale envoyée à l'achat ; intérêt légitime | 90 jours |
| `theme`, `tablepro:language`, `tablepro:campaign-closed` | Apparence, langues choisies/écartées, avis fermé ; intérêt légitime | Jusqu'à effacement ; thème du portail distinct |
| `mintlify_anonymous_id` | ID docs après accord local | Jusqu'à effacement ou refus |
| Cookies `crisp-client/` | Continuité du chat sur chaque page après chargement ; intérêt légitime | 6 mois, renouvelés au retour |
| `__Host-tp_session` | Connexion nécessaire au portail | 30 jours connecté ; 10 minutes maximum pendant la connexion ; déconnexion l'efface |
| `locale`, `context`, `sign-in-return-to` | Langue, vue Personal/équipe, retour ; intérêt légitime | Deux premiers jusqu'à effacement ; retour 15 minutes |

Modifiez l'accord analytique avec Cookie settings au pied de page ou ici :

<cookie-settings></cookie-settings>

## Destinataires {#sharing}

| Destinataire | Données et but |
| --- | --- |
| [OVH]({ovhPrivacy}) | Serveur et dossiers du service |
| [Cloudflare]({cloudflarePrivacy}) | DNS/proxy, R2 et sauvegardes, Turnstile, Cloudflare Web Analytics |
| [Amazon Web Services]({awsPrivacy}) | E-mails Amazon SES, livraison et engagement ; liens CloudFront, événements SNS/SQS |
| [PostHog EU]({posthogPrivacy}) | Analyse app/serveur ; IDs sans noms/e-mails ; requêtes directes avec IP |
| [{merchant}]({merchantPrivacy}) | Merchant of record indépendant ; paiement, facturation et achats |
| [Crisp]({crispPrivacy}) | Chat, navigateur/pages et identité du compte connecté |
| [Google]({googlePrivacy}) | Analyse site/docs et polices ; connexion choisie |
| [Mintlify]({mintlifyPrivacy}) | Hébergement docs et mesure consentie |
| [GitHub]({githubPrivacy}) | Téléchargements, mises à jour, plugins, étoiles, tickets publics et connexion facultative |
| [Apple]({applePrivacy}) | Connexion facultative ; services/diagnostics des sections apps/intégrations |
| [jsDelivr]({jsdelivrPrivacy}) | Script de paiement avec IP et navigateur |

Les membres reçoivent contenu et informations selon leur rôle. Les intégrations reçoivent ce que vous leur adressez. Nous ne vendons pas les données et ne les partageons pas pour la publicité. Toute autre divulgation exige une obligation légale. Les politiques des fournisseurs s'appliquent aussi.

## Lieux de traitement {#transfers}

OVH et Amazon SES sont à Singapour (`ap-southeast-1` pour SES). PostHog est dans l'UE. Crisp est basé en France. {publisherName} opère depuis le Vietnam. Les fournisseurs américains, dont {merchant}, Google, GitHub, Cloudflare, Amazon Web Services et Mintlify, traitent aux États-Unis. Stockage et sauvegardes peuvent concerner d'autres pays. Les garanties EEE/Royaume-Uni reposent sur les clauses contractuelles types ou autres mécanismes approuvés des fournisseurs ; Google utilise aussi EU-US Data Privacy Framework. Demandez des informations via [contact](#controller).

## Conservation {#retention}

Aucune limite n'est fixée là où le tableau le dit. Supprimer le compte n'efface pas PostHog ou Crisp. Écrivez via [contact](#controller) pour obtenir leur effacement sur demande.

| Dossiers | Conservation et effacement |
| --- | --- |
| Analyse PostHog | Aucune limite fixée. Désactiver laisse les événements passés. Demandez l'effacement. |
| Tâches et journaux serveur | Les tâches gardent les rapports en envoi/nouvel essai. Les journaux servent à la sécurité et au diagnostic. Aucune limite globale ; aucune promesse d'absence de copies. |
| Appareils | Même retirés, jusqu'à suppression du compte |
| Compte et audit | Compte, accès, appareils, licences et adhésions sont supprimés. Les audits restent sans limite ; champs e-mail et IP/agent de l'acteur sont retirés, mais des adresses en texte libre peuvent rester. |
| Commandes et avis fournisseurs | Commandes pour fiscalité/comptabilité sans limite fixée. Les liens compte/e-mail sont retirés. Les événements {merchant}, Amazon SES et Apple restent ; données personnelles d'achat et de destinataire/engagement sont nettoyées pour le compte supprimé. |
| Team Library | Un élément supprimé garde sa dernière version pour sync. Suppression ordinaire d'équipe : bibliothèque effacée après 30 jours, restaurable avant. Suppression du compte du seul propriétaire : équipe/bibliothèque effacées immédiatement. Fin de licence sans effacement. |
| Authentification | Liens/codes expirent après 15 minutes, effacés 7 jours plus tard. Sessions : 30 jours. Jetons : expirent 90 jours après usage, effacés 30 jours après. Tâches e-mail gardent le texte clair jusqu'au nettoyage : un jour après envoi ou 7 après abandon. |
| Newsletter | Nouvelles adresses non confirmées : 30 jours. Confirmées/migrées jusqu'à demande ou suppression du compte de cette adresse. Désinscription garde l'adresse marquée désinscrite. |
| Suppression d'envoi | Adresses rejetées/plaignantes et premières/dernières dates restent après suppression du compte/inscription pour bloquer l'envoi. Aucune limite. |
| Google Analytics | Données utilisateur/événement : 2 mois ; rapports standard totaux distincts |
| Cloudflare Web Analytics | Totaux des six derniers mois accessibles |
| Assistance | Crisp et boîte e-mail jusqu'à effacement, notamment sur demande. Aucune limite fixée. |
| Sauvegardes et archive | Aucune limite. Supprimer le compte ne les efface pas. L'ancienne base complète contient noms/e-mails, licences, commandes, équipes, noms d'appareils, abonnés, inscriptions bêta, e-mails, rapports d'usage et journaux de licence avec IP. |

## Choix et droits {#rights}

Utilisez les interrupteurs, Cookie settings site/docs et désinscription. Retirer le consentement agit pour l'avenir sans invalider le passé. Les interrupteurs n'effacent rien et n'arrêtent pas l'analyse serveur. Dans [Settings du portail]({account}), exportez ou supprimez le compte ; cela ne couvre pas tous les dossiers conservés.

Selon votre résidence, demandez accès, correction, effacement, restriction, portabilité ou opposition à l'intérêt légitime. Aucun compte requis : écrivez via [contact](#controller). Nous pouvons demander des détails pour retrouver les dossiers, comme l'ID d'installation. N'envoyez jamais une clé de licence en clair par e-mail. Nous répondons sous un mois. Vous pouvez saisir votre autorité de protection des données. Les obligations légales peuvent limiter l'effacement.

### Droits régionaux {#regional-rights}

**Résidents de Californie.** Le California Consumer Privacy Act vous donne le droit de savoir quelles informations personnelles nous collectons, d’en demander la suppression, de refuser leur vente et de ne pas être traité différemment pour avoir exercé ces droits. Nous ne vendons pas d’informations personnelles.

## Enfants {#children}

TablePro ne vise pas les moins de 16 ans et nous ne recueillons pas sciemment leurs données. Si vous pensez qu'un enfant nous en a donné, contactez-nous pour les supprimer.

## Sécurité {#security}

Nos services utilisent HTTPS. Les comptes n'ont pas de mots de passe. Identifiants de connexion et jetons API d'équipe sont hachés, sauf la tâche e-mail temporaire en [conservation](#retention). L'accès est limité à {publisherName} et aux [destinataires](#sharing). Aucun système n'est parfaitement sûr. Signalez les failles via la [page sécurité](/fr/security#report).

## Modifications {#changes}

La date de mise à jour figure sur la page. Les versions antérieures restent dans l'[historique du dépôt web public]({webGithub}/commits/main/resources/data/legal/en/privacy.md). Nous actualisons avant un nouvel usage, avertissons directement lorsque la loi l'exige et recueillons à nouveau le consentement si nécessaire.
