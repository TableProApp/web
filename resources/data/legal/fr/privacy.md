---
title: Politique de confidentialité
description: Ce que collectent les apps, le site et le portail de comptes TablePro, où vont ces données, leur durée de conservation, comment les modifier ou supprimer.
updatedAt: "2026-10-09"
---

Cette politique couvre TablePro pour Mac, TablePro pour iPhone et iPad, le site web tablepro.app, la documentation sur docs.tablepro.app et le portail de comptes tablepro.app/account. Elle décrit ce que chacun envoie et stocke réellement aujourd’hui. Les deux applications sont open source sous AGPLv3 ; vous pouvez donc lire le code qui envoie les données ci-dessous dans le [dépôt TablePro]({github}).

## Résumé {#summary}

- L’application Mac envoie à TablePro un rapport d’utilisation une fois par jour. Il est activé par défaut et vous pouvez le désactiver. L’application iPhone et iPad n’en envoie que si vous l’activez.
- Si vous activez une licence, l’application Mac la vérifie auprès de notre serveur tous les {revalidateDays} jours. Cette vérification inclut le nom de votre Mac.
- Vos requêtes, résultats et mots de passe ne sont pas envoyés à TablePro. L’exception concerne ce que vous choisissez de publier dans Team Library : paramètres de connexion (jamais les mots de passe) et requêtes enregistrées.
- Les demandes IA vont directement de l’application Mac au fournisseur IA que vous avez configuré, pas à nous.
- Notre serveur stocke l’adresse IP de chaque rapport d’utilisation et vérification de licence, et recherche un pays pour chaque rapport. Nous n’avons pas fixé de durée de conservation de ces enregistrements.
- Le site compte les pages vues avec Cloudflare Web Analytics, qui ne dépose aucun cookie. Il charge aussi Google Analytics, qui ne dépose des cookies que si vous l’autorisez. Chaque page charge également notre chat en direct Crisp, qui dépose ses propres cookies.
- Les achats sont vendus par {merchant}, notre merchant of record.

## Qui est responsable {#controller}

{publisherName}, développeur indépendant installé à {publisherCity}, au {publisherCountry}, publie les applications TablePro et ce site, et est responsable des données personnelles décrites ici (responsable du traitement). Pour toute question sur cette politique ou vos données, écrivez à [{email}](mailto:{email}).

## TablePro pour Mac {#mac-app}

### Rapport d’utilisation {#mac-usage-report}

L’application Mac envoie un rapport d’utilisation à `api.tablepro.app` environ dix secondes après son démarrage, puis une fois par jour tant qu’elle fonctionne. **Il est activé par défaut et l’application ne demande pas votre accord avant le premier envoi.** Pour le désactiver, ouvrez **Réglages > Général > Confidentialité** (Settings > General > Privacy) et décochez **Partager des données d’utilisation anonymes** (Share anonymous usage data).

Un rapport contient :

- un identifiant de machine : un hachage SHA-256 de l’UUID matériel de votre Mac (l’UUID lui-même n’est jamais envoyé) ;
- la plateforme, la version de l’application, la version de macOS, l’architecture du processeur et la langue de l’application ;
- les noms des types de bases de données de vos connexions ouvertes (par exemple « PostgreSQL ») et le nombre de connexions ouvertes ;
- l’état d’activation d’une licence ;
- la date et l’heure de votre première tentative de connexion et de votre première connexion réussie ;
- vos réglages de mise à jour (mode d’installation et fréquence des vérifications). Notre serveur les écarte à la réception du rapport.

Il ne contient jamais de noms d’hôtes, noms d’utilisateurs, mots de passe, requêtes ou lignes.

Notre serveur stocke chaque rapport avec son adresse IP d’origine. Il recherche ensuite le pays associé à cette adresse en l’envoyant à ip-api.com, puis en cas d’échec à ipinfo.io et enfin à geoplugin.net. Ces recherches utilisent HTTP non chiffré. Le pays est stocké avec le rapport. La vérification de licence ci-dessous envoyant le même identifiant de machine, les rapports d’un Mac avec une licence activée peuvent être reliés à cette licence.

### Vérifications de licence {#mac-license}

L’application Mac ne contacte notre serveur de licences qu’après la saisie d’une clé de licence. Elle le fait lors de l’activation, au démarrage si au moins {revalidateDays} jours se sont écoulés depuis la dernière vérification, puis tous les {revalidateDays} jours. Chaque vérification envoie :

- votre clé de licence ;
- l’identifiant de machine décrit ci-dessus ;
- le nom de votre Mac défini dans macOS (il inclut souvent votre propre nom) ;
- la version de l’application et celle de macOS.

La désactivation d’un Mac n’envoie que la clé de licence et l’identifiant de machine.

Notre serveur journalise chaque demande de licence avec son adresse IP et son contenu, et stocke l’identifiant et le nom de chaque Mac activé avec votre licence. Le portail de comptes liste ces Mac par nom. Si notre serveur est inaccessible, les fonctionnalités payantes continuent de fonctionner pendant {graceDays} jours après la dernière vérification réussie.

### Team Library {#library}

Team Library fait partie d’une licence Team. Lorsque vous choisissez **Partager > Publier dans la bibliothèque d’équipe…** (Share > Publish to Team Library…) sur une connexion ou **Publier les requêtes enregistrées pour l’équipe…** (Publish Saved Queries to Team…) dans la barre latérale Favorites, l’application Mac envoie ce que vous publiez à notre serveur :

- paramètres de connexion : hôte, port, nom de base de données, nom d’utilisateur, paramètres SSH et SSL, options du pilote, commandes de démarrage, paramètres de Tunnel Command, niveau de Safe Mode et paramètres IA, mais jamais les mots de passe ;
- requêtes enregistrées : noms, texte SQL, mots-clés et dossiers.

Les Mac utilisant la même licence Team téléchargent la bibliothèque au démarrage, au maximum une fois par semaine, et le Mac qui publie la télécharge de nouveau juste après. Une nouvelle publication remplace la précédente. Retirer un membre de l’équipe supprime tout ce qu’il a publié. Si la licence expire ou est suspendue, la bibliothèque reste sur notre serveur jusqu’à votre demande de suppression.

Team Catalog, l’autre fonctionnalité Team, écrit des fichiers de connexion sans mots de passe dans un dossier partagé de votre choix. Il ne passe pas par notre serveur.

### Mises à jour et plugins {#mac-updates}

- **Vérifications de mise à jour.** Une fois par jour, l’application Mac télécharge le flux de mises à jour depuis GitHub (`raw.githubusercontent.com`). La demande n’envoie aucune information sur votre Mac au-delà de ce que transporte toute requête web : votre adresse IP et un agent utilisateur avec la version de l’application. Pour la désactiver, ouvrez **Réglages > Général > Mise à jour de logiciels** (Settings > General > Software Update) et décochez **Rechercher automatiquement les mises à jour** (Automatically check for updates). Les mises à jour elles-mêmes se téléchargent depuis GitHub.
- **Catalogue de plugins.** Au démarrage et à l’ouverture des réglages des plugins, l’application télécharge la liste des pilotes et thèmes disponibles depuis GitHub. Aucun réglage ne permet de désactiver cela. Les pilotes et thèmes installés se téléchargent depuis GitHub, et le navigateur de plugins consulte les nombres de téléchargements via l’API GitHub.

GitHub reçoit votre adresse IP avec ces demandes. Sa propre déclaration de confidentialité s’y applique.

### Services que vous choisissez d’utiliser {#mac-third-parties}

L’application Mac n’envoie des données à ces services que lorsque vous les configurez, directement, sans passer par TablePro :

- **Vos bases de données, serveurs SSH et proxys**, qui reçoivent ce que vos connexions leur envoient.
- **Fournisseurs IA.** Lorsque vous ajoutez un fournisseur et utilisez l’assistant IA ou les suggestions en ligne, les demandes vont à ce fournisseur ou à un modèle exécuté sur votre Mac. Par défaut, une demande inclut le type et le nom de la base, les définitions de tables et colonnes du schéma et la requête courante. Les lignes de résultats ne sont envoyées que si vous activez cette option. Les conditions du fournisseur s’appliquent. L’ajout de GitHub Copilot télécharge son serveur de langage depuis npm, et son réglage « Envoyer la télémétrie à GitHub » (Send telemetry to GitHub) est activé au départ.
- **Services d’authentification** : Microsoft Entra ID, Google, Amazon Web Services et Cloudflare Access, lorsqu’une connexion les utilise.
- **Apple Maps**, qui fournit les tuiles de carte lorsque vous affichez des résultats sur une carte.
- **DuckDB**, qui fournit les extensions DuckDB la première fois qu’une requête en utilise une.
- **Clients MCP.** Le serveur MCP est désactivé par défaut. Il démarre lorsque vous l’activez ou lorsqu’un client MCP configuré lance le pont TablePro ou s’y associe, et il écoute uniquement sur votre Mac (127.0.0.1). Un client IA connecté, comme Claude ou Cursor, reçoit les résultats demandés et les envoie à son propre service selon ses propres conditions.
- **Serveurs MCP ajoutés.** Une session IA envoie à ce serveur les appels d’outils que vous approuvez, avec leurs arguments.

### Données qui restent sur votre Mac {#mac-local}

Les mots de passe sont conservés dans le Trousseau macOS. Votre liste de connexions, l’historique des requêtes, Query Insights, les instantanés Data Rewind, les réglages et les onglets ouverts sont stockés sur votre Mac. L’application référence les clés SSH à leur emplacement sur le disque sans les copier. Elle ne contient aucun outil de rapport de plantage ni bibliothèque d’analyse tierce.

## TablePro pour iPhone et iPad {#ios-app}

**Rien n’est envoyé à TablePro tant que vous n’activez pas Share Usage Data**, au premier démarrage ou plus tard dans **Settings > Privacy**. Si vous le faites, l’application envoie un rapport une fois par jour au même serveur que l’application Mac, et notre serveur stocke et recherche son adresse IP de la même manière. Le rapport contient un hachage SHA-256 de l’identifiant donné par Apple à l’application sur votre appareil, la plateforme, les versions de l’application et d’iOS, l’architecture du processeur, la langue de l’application, les noms des types de bases de vos connexions ouvertes, le nombre de connexions ouvertes, ainsi que la date et l’heure de votre première tentative de connexion, de votre première connexion réussie et de votre première requête. Il ne contient aucun réglage de mise à jour et indique toujours qu’aucune licence n’est activée, car l’application n’a ni l’un ni l’autre.

L’application n’effectue aucune vérification de licence, de mise à jour ou demande de plugin. Hormis le rapport facultatif, elle se connecte uniquement à vos bases de données et serveurs SSH, à iCloud d’Apple si vous activez iCloud Sync, et à Microsoft lorsqu’une connexion SQL Server s’authentifie avec Microsoft Entra ID.

Sur l’appareil, les mots de passe et les clés SSH collées sont conservés dans le Trousseau ; les certificats ne sont jamais synchronisés. L’historique des requêtes reste sur l’appareil. Vos connexions sont ajoutées à l’index Spotlight local pour permettre leur recherche. Pendant l’exécution d’une requête, son Activité en direct affiche le SQL sur l’écran verrouillé et dans la Dynamic Island développée, sauf si vous activez **Settings > Live Activities > Hide Query**.

Si vous partagez des données d’analyse avec les développeurs dans les réglages de votre iPhone ou iPad, Apple peut nous transmettre des rapports de plantage et statistiques d’utilisation via App Store Connect. L’application ne contient aucun outil propre de rapport de plantage ni bibliothèque d’analyse tierce.

## iCloud Sync et Handoff {#icloud}

iCloud Sync est désactivé jusqu’à votre activation, sur Mac comme sur iPhone et iPad. Lorsqu’il est activé, les enregistrements vont dans une base privée de votre propre compte iCloud (conteneur `iCloud.com.TablePro`). TablePro ne peut pas les lire.

- Sur Mac, vous choisissez les éléments synchronisés : connexions, groupes et tags, réglages, profils SSH, profils d’identifiants (nom et nom d’utilisateur, jamais le mot de passe), favoris de tables et de bases, requêtes enregistrées (texte SQL compris) et dossiers de tables. Un enregistrement de connexion inclut hôte, port, nom d’utilisateur, nom de base, paramètres SSH et SSL, commandes de démarrage, script avant connexion et règles IA. L’historique des requêtes, les instantanés Data Rewind et les sources de mots de passe ne sont jamais synchronisés.
- iPhone et iPad synchronisent les connexions, groupes et tags.
- Les mots de passe ne sont synchronisés que si vous activez aussi **Mots de passe** (Passwords) dans Catégories synchronisées (Sync Categories) sur Mac, ou **Sync Passwords** sur iPhone et iPad, ce qui utilise le Trousseau iCloud. Sur Mac, cela synchronise aussi les autres secrets conservés par TablePro dans le Trousseau, comme les clés des fournisseurs IA et la clé de licence.

Sur Mac, iCloud Sync fait partie d’une licence Starter ou Team. Sur iPhone et iPad, il est gratuit.

Handoff transmet l’identifiant de la connexion ouverte et le nom de la table ouverte entre vos appareils, via Apple. Si aucune table n’est ouverte, il transmet le nom de la connexion ou son hôte si elle n’a pas de nom. Il n’envoie aucun réglage ni identifiant de connexion.

## Site web {#website}

**Hébergement.** Le site et le portail de comptes fonctionnent sur notre serveur, derrière Cloudflare. Comme tout serveur web, ils reçoivent votre adresse IP, l’agent utilisateur de votre navigateur et l’adresse de chaque page demandée.

**Cloudflare Web Analytics.** Cloudflare ajoute son script Web Analytics aux pages du site et du portail de comptes. Votre navigateur le charge depuis `static.cloudflareinsights.com` et signale chaque page vue à Cloudflare : la page, le site qui y mène, le temps de chargement, ainsi que votre navigateur, système d’exploitation et type d’appareil. Cloudflare ajoute le pays d’origine de votre connexion. Le script ne dépose aucun cookie et ne stocke rien dans votre navigateur ; Cloudflare indique ne pas utiliser votre adresse IP ou les détails du navigateur pour créer une empreinte numérique. Cloudflare nous montre des totaux, comme les pages vues par page ou par pays, pas un enregistrement de chaque visiteur. Base légale : intérêt légitime.

**Google Analytics.** Le site charge Google Analytics sur chaque page en mode Consentement. Tant que vous ne choisissez pas **Autoriser** à la question sur les cookies, il ne dépose aucun cookie et n’envoie à Google qu’un signal sans cookie par page, sans identifiant stocké sur votre appareil. Si vous l’autorisez, Google Analytics dépose les cookies `_ga` et `_ga_<ID>` et mesure vos visites, notamment pages consultées, clics de téléchargement et début de règlement. Le stockage publicitaire, la personnalisation des annonces et les données utilisateur publicitaires sont toujours refusés. Google indique que Google Analytics 4 ne journalise ni ne stocke les adresses IP. Notre propriété Google Analytics utilise la durée de conservation par défaut de Google : les données d’utilisateurs et d’événements collectées sont supprimées après 2 mois. Les rapports standards de Google, contenant des totaux plutôt que des identifiants, ne sont pas affectés. Base légale : votre consentement pour les cookies.

**Chat en direct.** Chaque page du site et du portail de comptes affiche un bouton de chat de notre fournisseur Crisp. Une fois la page chargée, votre navigateur charge le script Crisp depuis `client.crisp.chat`, et Crisp dépose les cookies décrits dans [Cookies et stockage du navigateur](#cookies). Crisp reçoit votre adresse IP, les détails du navigateur, les adresses des pages consultées et les messages écrits, et conserve votre adresse IP si vous commencez une conversation. Nous ne lui communiquons que la langue de la page, rien d’autre sur vous. Crisp est établi en France.

**Script de règlement.** Lorsque vous pointez un bouton Acheter ou y accédez avec Tab, votre navigateur charge le script de règlement de {merchant} depuis jsDelivr (`cdn.jsdelivr.net`), qui reçoit votre adresse IP et les détails du navigateur. Le règlement lui-même ne s’ouvre depuis {merchant} qu’au clic.

**Attribution des achats.** À votre arrivée sur le site, votre navigateur conserve pendant 90 jours un enregistrement de première visite nommé `tablepro:attribution` dans son stockage local : source de la visite (paramètres `ref` ou `utm_*` du lien suivi, ou site référent), page d’arrivée et date. Si vous commencez un achat, l’enregistrement accompagne la demande de règlement. Notre serveur l’écarte : il n’est ni validé, ni lu, ni stocké, et n’est pas transmis à {merchant}.

**Documentation.** La documentation sur docs.tablepro.app est hébergée par Mintlify, qui reçoit votre adresse IP et les informations de votre navigateur à chaque page, et les pages chargent leurs polices depuis Google Fonts. La documentation pose sa propre question sur les cookies, car elle ne peut pas lire la réponse que vous avez donnée sur ce site. Tant que vous n’y choisissez pas **Allow**, elle ne dépose aucun cookie et ne conserve aucun identifiant de visiteur. Si vous l’autorisez, Google Analytics dépose les cookies `_ga` et `_ga_<ID>` et mesure vos visites de la documentation, et Mintlify conserve un identifiant de visiteur aléatoire, `mintlify_anonymous_id`, dans le stockage local pour les compter. **Cookie settings**, dans le pied de page de la documentation, modifie votre réponse, et un refus supprime les deux. Base légale : votre consentement.

Consulter le site ne dépose aucun cookie propre. Les demandes d’abonnement à la newsletter, de règlement et de vérification de code de réduction depuis le site public omettent les identifiants : elles n’envoient pas les cookies du portail et n’acceptent pas les cookies de la réponse. L’ouverture des pages du portail est distincte et dépose les cookies du portail ci-dessous. Tout ce que le site conserve dans votre navigateur figure dans [Cookies et stockage du navigateur](#cookies).

## Achats {#purchases}

Les licences sont vendues par {merchant} (Polar Software, Inc.), notre merchant of record et revendeur. Vous achetez auprès de {merchant} selon ses propres conditions d’achat et sa politique de confidentialité. {merchant} encaisse les paiements, calcule et reverse la taxe sur les ventes ou la TVA, envoie reçus et factures et gère problèmes et litiges de paiement. Il collecte nom, adresse e-mail, adresse de facturation et données de paiement. Nous ne voyons jamais les coordonnées complètes de votre carte.

De {merchant}, nous recevons votre adresse e-mail, votre nom et adresse de facturation tels que saisis, votre achat, les montants, les identifiants de commande et d’abonnement, puis les changements comme renouvellements, résiliations et remboursements. Nous indiquons à {merchant} la langue de la page d’achat pour que nos e-mails vous parviennent dans cette langue. Factures, reçus, moyen de paiement et abonnement figurent dans le [portail client de {merchant}]({portal}), auquel vous accédez avec l’adresse e-mail de l’achat. Les remboursements sont décrits dans la [politique de remboursement](/fr/refund-policy), et les droits d’une licence dans les [conditions d’utilisation](/fr/terms).

## Portail de comptes {#account}

Le [portail de comptes](/account?locale=fr) sur tablepro.app/account est destiné à la personne ayant acheté une licence. Vous vous connectez via un lien envoyé à cette adresse e-mail ; il est à usage unique et expire après 15 minutes. Le portail affiche vos licences, les Mac activés sur celles-ci par nom et, pour une licence Team, membres, invitations, postes et Team Library.

Nous stockons votre adresse e-mail avec vos licences et commandes, ainsi que la langue utilisée avec nous pour vous envoyer les e-mails dans celle-ci. Lorsque vous invitez quelqu’un à une équipe, nous stockons son adresse e-mail et son rôle et lui envoyons un code d’invitation.

## Newsletter {#newsletter}

Si vous vous abonnez aux notes de version, nous stockons votre adresse e-mail et la langue de la page d’inscription. Nous envoyons d’abord un lien de confirmation et chaque newsletter contient un lien de désinscription. Après désinscription, nous n’envoyons plus de newsletters ; pour supprimer aussi l’adresse, écrivez-nous.

## Cookies et stockage du navigateur {#cookies}

Consulter le site public et ses demandes de newsletter, de règlement et de code de réduction ne déposent aucun cookie propre. L’ouverture des pages du portail dépose les deux cookies strictement nécessaires listés ci-dessous. Cloudflare Web Analytics ne dépose aucun cookie et ne stocke rien dans votre navigateur. Les cookies Google Analytics ne sont déposés qu’après votre autorisation. Crisp dépose ses cookies sur chaque page une fois le chat chargé. Rien de tout cela n’est utilisé pour la publicité ou vendu.

- **`_ga` et `_ga_<ID>`** (cookies Google Analytics, jusqu’à 2 ans, uniquement si vous autorisez l’analyse) : identifiant aléatoire de votre navigateur et état de votre visite actuelle. Refuser, ou modifier votre réponse plus tard, les supprime. Base légale : consentement.
- **`tablepro:analytics-consent`** (stockage local, jusqu’à suppression) : votre réponse à la question sur l’analyse, pour éviter de la reposer sur chaque page. Le site et le portail de comptes la partagent. Base légale : strictement nécessaire pour respecter votre choix.
- **`tablepro:attribution`** (stockage local, 90 jours) : enregistrement de première visite décrit dans [Site web](#website). Il ne contient aucun identifiant personnel et n’accompagne qu’une demande de règlement, où notre serveur l’écarte. Base légale : intérêt légitime.
- **`theme`** et **`tablepro:banner-dismissed`** (stockage local, jusqu’à suppression) : votre choix d’apparence claire, sombre ou système, et le bandeau fermé et sa durée de masquage : 30 jours, ou un an si vous indiquez posséder une licence ou en achetez une. Base légale : intérêt légitime.
- **`mintlify_anonymous_id`** (stockage local sur docs.tablepro.app, déposé par Mintlify, uniquement si vous y autorisez Google Analytics) : l’identifiant de visiteur décrit dans [Site web](#website). Un refus le supprime. La documentation conserve sa propre réponse `tablepro:analytics-consent`. Base légale : consentement.
- **Cookies commençant par `crisp-client/`** (Crisp, par exemple `crisp-client/session/…` ; 6 mois, renouvelés à votre retour ; déposés sur chaque page après le chargement du chat) : maintiennent le chat et votre conversation entre pages et visites. Base légale : intérêt légitime, pour proposer une assistance sur chaque page.
- **`tablepro-session` et `XSRF-TOKEN`** (cookies du portail, 2 heures) : maintiennent votre connexion et protègent les formulaires contre la falsification de requêtes intersites. L’ouverture d’autres pages du portail, comme la confirmation d’achat et les pages de newsletter, les dépose aussi. Les demandes de newsletter, de règlement et de code de réduction depuis le site public omettent les identifiants et ne conservent pas ces cookies. Base légale : strictement nécessaires.

Vous pouvez modifier ou retirer votre réponse sur l’analyse à tout moment via **Paramètres des cookies** au pied de chaque page, ou ici :

<cookie-settings></cookie-settings>

## Base légale {#lawful-basis}

Pour les lecteurs de l’Espace économique européen et du Royaume-Uni, les bases légales au titre du RGPD et du UK GDPR sont :

- **Contrat** (art. 6(1)(b)) : vente et fourniture d’une licence, vérifications de licence, portail de comptes et Team Library.
- **Intérêt légitime** (art. 6(1)(f)) : rapport d’utilisation Mac et recherche du pays, journaux des demandes de licence, sécurité et prévention des abus, journaux du serveur web, Cloudflare Web Analytics, enregistrement d’attribution des achats et chat sur chaque page.
- **Consentement** (art. 6(1)(a)) : cookies Google Analytics, rapport d’utilisation iPhone et iPad, newsletter et conversations initiées dans le chat.
- **Obligation légale** (art. 6(1)(c)) : documents fiscaux et comptables et réponses aux demandes légales.

## Qui reçoit les données {#sharing}

Nous partageons les données personnelles uniquement avec les services nécessaires au fonctionnement de TablePro :

- **{merchant}**, merchant of record des achats.
- **Un prestataire d’envoi d’e-mails**, pour les liens de connexion, reçus envoyés par nous, invitations d’équipe et newsletters.
- **Notre hébergeur et Cloudflare**, pour le site, le portail de comptes et le serveur avec lequel les applications communiquent. Cloudflare compte aussi les pages vues avec Cloudflare Web Analytics.
- **Google**, pour Google Analytics sur le site, la documentation et le portail de comptes.
- **Crisp**, pour le chat sur chaque page du site et du portail de comptes.
- **jsDelivr**, qui fournit au navigateur le script de règlement de {merchant} lorsque vous pointez un bouton Acheter.
- **Mintlify**, qui héberge la documentation sur docs.tablepro.app.
- **ip-api.com, ipinfo.io et geoplugin.net**, qui reçoivent les adresses IP des rapports d’utilisation pour rechercher le pays.
- **GitHub**, qui héberge le flux de mises à jour, le catalogue de plugins et les téléchargements.

Nous ne vendons pas de données personnelles et ne les partageons pas avec des annonceurs.

## Transferts internationaux {#transfers}

Les services ci-dessus opèrent dans plusieurs pays ; vos données peuvent donc être traitées hors de votre pays. {merchant}, Google, GitHub, Cloudflare et Mintlify traitent des données aux États-Unis ; Google le fait au titre du cadre de protection des données UE–États-Unis et des clauses contractuelles types. Lorsque la loi l’exige, les transferts depuis l’EEE et le Royaume-Uni reposent sur les clauses contractuelles types ou un autre mécanisme approuvé.

## Durée de conservation des données {#retention}

- **Rapports d’utilisation**, avec adresses IP et pays : aucune durée fixée, aucune suppression automatique.
- **Enregistrements de licence** : identifiants et noms des Mac activés et journal des demandes avec adresses IP sont conservés tant que la licence existe. Aucune suppression automatique.
- **Commandes** : conservées à des fins fiscales et comptables.
- **Team Library** : jusqu’à une nouvelle publication, au retrait du membre ayant publié ou à votre demande de suppression. Elle reste après la fin d’une licence.
- **Liens de connexion au compte** : expirent après 15 minutes, puis sont supprimés. Les sessions du portail durent 2 heures.
- **Newsletter** : jusqu’à désinscription ou suppression de l’adresse à votre demande.
- **Google Analytics** : données d’utilisateurs et d’événements pendant 2 mois, durée par défaut de Google utilisée par notre propriété. Les cookies durent jusqu’à 2 ans ou sont supprimés au refus.
- **Cloudflare Web Analytics** : Cloudflare nous montre les totaux de pages vues des six derniers mois. Rien n’est stocké dans votre navigateur.
- **Chat et e-mails d’assistance** : conservés par Crisp et dans notre messagerie jusqu’à suppression. Demandez-nous de supprimer vos conversations et e-mails.
- **Journaux du serveur web** : conservés pour la sécurité et le diagnostic. Aucune durée fixe n’a encore été définie.

## Vos droits {#rights}

Selon votre lieu de résidence, vous pouvez nous demander de :

- vous fournir une copie des données personnelles détenues sur vous (accès) ;
- les corriger (rectification) ;
- les supprimer (effacement), sauf celles à conserver légalement ;
- limiter leur utilisation (limitation) ;
- vous les envoyer dans un format structuré lisible par machine (portabilité) ;
- cesser de les utiliser sur la base de l’intérêt légitime (opposition).

Vous pouvez retirer votre consentement à tout moment et saisir votre autorité de protection des données. Pour exercer ces droits, écrivez à [{email}](mailto:{email}). Nous répondons sous 30 jours. La suppression étant manuelle, indiquez l’adresse e-mail, la clé de licence ou l’appareil concerné. Les données détenues par {merchant}, Google, Crisp ou GitHub sont aussi couvertes par leurs propres politiques.

**Résidents de Californie.** Le California Consumer Privacy Act vous donne le droit de savoir quelles informations personnelles nous collectons, d’en demander la suppression, de refuser leur vente et de ne pas être traité différemment pour avoir exercé ces droits. Nous ne vendons pas d’informations personnelles.

## Enfants {#children}

TablePro ne s’adresse pas aux enfants de moins de 16 ans et nous ne collectons pas sciemment leurs données personnelles. Si vous pensez qu’un enfant nous a fourni des données, contactez-nous et nous les supprimerons.

## Sécurité {#security}

Le trafic entre applications, site, portail de comptes et serveur utilise HTTPS. Les recherches de pays décrites dans [Rapport d’utilisation](#mac-usage-report) font exception : elles utilisent HTTP non chiffré. Les liens de connexion ne sont stockés que sous forme de hachages et l’accès à nos systèmes est limité à {publisherName} et aux prestataires indiqués dans [Qui reçoit les données](#sharing). Aucun système n’est parfaitement sécurisé. Pour signaler une vulnérabilité, consultez la [page Sécurité](/fr/security#report) ou écrivez à [{email}](mailto:{email}).

## Modification de cette politique {#changes}

Lorsque cette politique change, nous la mettons à jour ici avec une nouvelle date de « Dernière mise à jour » et, si la loi l’exige, vous en informons directement.

## Contact {#contact}

Pour toute question sur la confidentialité ou cette politique, écrivez à [{email}](mailto:{email}).
