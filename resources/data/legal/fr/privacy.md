---
title: Politique de confidentialité
description: Ce que collectent les apps, le site et le portail de comptes TablePro, où vont ces données, leur durée de conservation, comment les modifier ou supprimer.
updatedAt: "2026-10-28"
---

Cette politique couvre TablePro pour Mac, TablePro pour iPhone et iPad, le site web tablepro.app, la documentation sur docs.tablepro.app et le portail de comptes account.tablepro.app. Elle décrit ce que chacun envoie et stocke réellement aujourd’hui. Les deux applications sont open source sous AGPLv3 ; vous pouvez donc lire le code qui envoie les données ci-dessous dans le [dépôt TablePro]({github}).

## Résumé {#summary}

- L’application Mac envoie à TablePro un rapport d’utilisation une fois par jour. Il est activé par défaut et vous pouvez le désactiver. L’application iPhone et iPad n’en envoie que si vous l’activez.
- Si vous vous connectez à un compte TablePro ou activez une clé de licence, l’application Mac enregistre votre Mac sur notre serveur, avec son nom, et y vérifie régulièrement votre offre.
- Vos requêtes, résultats et mots de passe ne sont pas envoyés à TablePro. L’exception concerne ce que vous choisissez de publier dans Team Library : paramètres de connexion (jamais les mots de passe) et requêtes enregistrées.
- Les demandes IA vont directement de l’application Mac au fournisseur IA que vous avez configuré, pas à nous.
- Notre serveur transmet les rapports d’utilisation à PostHog, notre service d’analyse produit dans l’UE, sans leurs adresses IP. À partir de la version qui ajoute les comptes TablePro, l’application Mac les envoie directement à PostHog, qui reçoit alors l’adresse IP de votre Mac. Votre compte conserve un journal des modifications qui y sont faites, comme les connexions et les nouveaux appareils, avec l’adresse IP et le navigateur de la requête à l’origine de chacune.
- Le site compte les pages vues avec Cloudflare Web Analytics, qui ne dépose aucun cookie. Il charge aussi Google Analytics, qui ne dépose des cookies que si vous l’autorisez. Chaque page charge également notre chat en direct Crisp, qui dépose ses propres cookies.
- Le portail de comptes sur account.tablepro.app ne charge aucun script d’analyse. Il dépose un cookie pour maintenir votre connexion, et ses réglages vous permettent de télécharger les données de votre compte ou de supprimer le compte.
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

Notre serveur ne stocke ni le rapport ni l’adresse IP d’où il provient. Il transmet le rapport à PostHog comme un événement lié à l’identifiant de machine, avec le pays que Cloudflare indique pour votre connexion, sans votre clé de licence ni votre adresse IP, et PostHog n’en tire aucun profil de personne. Comme votre compte répertorie ses appareils sous le même identifiant de machine, les rapports d’un Mac sur lequel vous vous êtes connecté ou avez activé une licence peuvent être reliés à votre compte.

À partir de la version qui ajoute les comptes TablePro, l’application Mac envoie ses données d’utilisation directement à PostHog, avec le même réglage. PostHog reçoit alors l’adresse IP de votre Mac. Dès que vous vous connectez, elle relie ces données à l’identifiant de votre compte, ce qui rapproche vos installations de vos connexions et de vos achats. Désactiver le réglage arrête l’un et l’autre.

### Vérifications de licence {#mac-license}

L’application Mac ne contacte notre serveur de licences qu’après la saisie d’une clé de licence. Elle le fait lors de l’activation, au démarrage si au moins {revalidateDays} jours se sont écoulés depuis la dernière vérification, puis tous les {revalidateDays} jours. Chaque vérification envoie :

- votre clé de licence ;
- l’identifiant de machine décrit ci-dessus ;
- le nom de votre Mac défini dans macOS (il inclut souvent votre propre nom) ;
- la version de l’application et celle de macOS.

La désactivation d’un Mac n’envoie que la clé de licence et l’identifiant de machine.

Notre serveur conserve chaque Mac activé comme appareil du compte titulaire de la licence : son identifiant de machine et son nom, les versions de l’application et de macOS, et la date de son dernier contact. L’activation et la désactivation d’un Mac sont consignées dans le journal d’audit de ce compte avec l’adresse IP et l’agent utilisateur de la requête ; les vérifications périodiques ne le sont pas. Le portail de comptes liste vos appareils par nom. Si notre serveur est inaccessible, les fonctionnalités payantes continuent de fonctionner pendant {graceDays} jours après la dernière vérification réussie.

### Compte TablePro {#mac-account}

À partir de la version qui ajoute les comptes TablePro, vous vous connectez à l’application Mac avec un [compte TablePro](#account) au lieu d’une clé de licence. L’application ouvre la page de connexion dans une fenêtre de navigateur, où vous pouvez saisir le code de l’e-mail de connexion. Une fois connecté, elle enregistre votre Mac comme appareil de votre compte : l’identifiant de machine décrit ci-dessus, le nom de votre Mac, la plateforme et les versions de l’application et de macOS. Elle récupère ensuite votre offre auprès de notre serveur sous forme de fichier signé une fois par jour tant qu’elle tourne, et ce fichier maintient les fonctionnalités payantes jusqu’à 14 jours sans notre serveur. Le jeton qui maintient la connexion de l’application est conservé dans le Trousseau macOS.

Une clé de licence déjà présente sur votre Mac est échangée une seule fois contre une connexion au compte titulaire, puis supprimée du Mac. Un appareil sans contact depuis 180 jours est retiré. Vous pouvez retirer des appareils dans l’application ou dans le portail de comptes, et la première fois qu’un Mac utilise votre licence, nous vous prévenons par e-mail.

### Team Library {#library}

Team Library fait partie d’une licence Team. Lorsque vous choisissez **Partager > Publier dans la bibliothèque d’équipe…** (Share > Publish to Team Library…) sur une connexion ou **Publier les requêtes enregistrées pour l’équipe…** (Publish Saved Queries to Team…) dans la barre latérale Favorites, l’application Mac envoie ce que vous publiez à notre serveur :

- paramètres de connexion : hôte, port, nom de base de données, nom d’utilisateur, paramètres SSH et SSL, options du pilote, commandes de démarrage, paramètres de Tunnel Command, niveau de Safe Mode et paramètres IA, mais jamais les mots de passe ;
- requêtes enregistrées : noms, texte SQL, mots-clés et dossiers.

Les Mac utilisant la même licence Team téléchargent la bibliothèque au démarrage, au maximum une fois par semaine, et le Mac qui publie la télécharge de nouveau juste après. Une nouvelle publication remplace la précédente. La section Library du portail de comptes montre chaque élément, avec le nom de la personne qui l’a modifié en dernier, aux membres qui peuvent lire la bibliothèque, et permet aux propriétaires et aux administrateurs de supprimer des éléments. Un élément supprimé reste 90 jours sur notre serveur pour que chaque Mac puisse synchroniser la suppression. Si la licence prend fin, la bibliothèque reste sur notre serveur jusqu’à ce que le propriétaire de l’équipe supprime l’équipe, ce qui supprime aussi la bibliothèque.

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

**Rien n’est envoyé à TablePro tant que vous n’activez pas Share Usage Data**, au premier démarrage ou plus tard dans **Settings > Privacy**. Si vous le faites, l’application envoie un rapport une fois par jour au même serveur que l’application Mac, et notre serveur le transmet à PostHog de la même manière, sans son adresse IP. Le rapport contient un hachage SHA-256 de l’identifiant donné par Apple à l’application sur votre appareil, la plateforme, les versions de l’application et d’iOS, l’architecture du processeur, la langue de l’application, les noms des types de bases de vos connexions ouvertes, le nombre de connexions ouvertes, ainsi que la date et l’heure de votre première tentative de connexion, de votre première connexion réussie et de votre première requête. Il ne contient aucun réglage de mise à jour et indique toujours qu’aucune licence n’est activée, car l’application n’a ni l’un ni l’autre.

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

**Cloudflare Web Analytics.** Cloudflare ajoute son script Web Analytics aux pages du site ; le portail de comptes ne l’exécute pas. Votre navigateur le charge depuis `static.cloudflareinsights.com` et signale chaque page vue à Cloudflare : la page, le site qui y mène, le temps de chargement, ainsi que votre navigateur, système d’exploitation et type d’appareil. Cloudflare ajoute le pays d’origine de votre connexion. Le script ne dépose aucun cookie et ne stocke rien dans votre navigateur ; Cloudflare indique ne pas utiliser votre adresse IP ou les détails du navigateur pour créer une empreinte numérique. Cloudflare nous montre des totaux, comme les pages vues par page ou par pays, pas un enregistrement de chaque visiteur. Base légale : intérêt légitime.

**Google Analytics.** Le site charge Google Analytics sur chaque page en mode Consentement. Tant que vous ne choisissez pas **Autoriser** à la question sur les cookies, il ne dépose aucun cookie et n’envoie à Google qu’un signal sans cookie par page, sans identifiant stocké sur votre appareil. Si vous l’autorisez, Google Analytics dépose les cookies `_ga` et `_ga_<ID>` et mesure vos visites, notamment pages consultées, clics de téléchargement et début de règlement. Le stockage publicitaire, la personnalisation des annonces et les données utilisateur publicitaires sont toujours refusés. Google indique que Google Analytics 4 ne journalise ni ne stocke les adresses IP. Notre propriété Google Analytics utilise la durée de conservation par défaut de Google : les données d’utilisateurs et d’événements collectées sont supprimées après 2 mois. Les rapports standards de Google, contenant des totaux plutôt que des identifiants, ne sont pas affectés. Base légale : votre consentement pour les cookies.

**Chat en direct.** Chaque page du site et du portail de comptes affiche un bouton de chat de notre fournisseur Crisp. Une fois la page chargée, votre navigateur charge le script Crisp depuis `client.crisp.chat`, et Crisp dépose les cookies décrits dans [Cookies et stockage du navigateur](#cookies). Crisp reçoit votre adresse IP, les détails du navigateur, les adresses des pages consultées et les messages écrits, et conserve votre adresse IP si vous commencez une conversation. Nous lui communiquons la langue de la page. Lorsque vous êtes connecté au portail de comptes, nous lui transmettons aussi l’adresse e-mail et l’identifiant de votre compte, qui relient la conversation à votre compte. Nous ne lui communiquons rien d’autre sur vous. Crisp est établi en France.

**Script de règlement.** Lorsque vous pointez un bouton Acheter ou y accédez avec Tab, votre navigateur charge le script de règlement de {merchant} depuis jsDelivr (`cdn.jsdelivr.net`), qui reçoit votre adresse IP et les détails du navigateur. Le règlement lui-même ne s’ouvre depuis {merchant} qu’au clic.

**Vérification de la newsletter.** Lorsque vous commencez à remplir le formulaire de la newsletter, votre navigateur charge Cloudflare Turnstile depuis `challenges.cloudflare.com` pour vérifier qu’une personne s’inscrit ; Cloudflare reçoit votre adresse IP et les détails de votre navigateur.

**Attribution des achats.** À votre arrivée sur le site, votre navigateur conserve pendant 90 jours un enregistrement de première visite nommé `tablepro:attribution` dans son stockage local : source de la visite (paramètres `ref` ou `utm_*` du lien suivi, ou site référent), page d’arrivée et date. Si vous commencez un achat, l’enregistrement accompagne la demande de règlement. Notre serveur transmet la source de la visite à {merchant} comme métadonnée du règlement, la conserve avec la commande une fois le paiement fait et l’envoie à PostHog avec le règlement et le paiement. La page d’arrivée et la date ne sont pas conservées.

**Documentation.** La documentation sur docs.tablepro.app est hébergée par Mintlify, qui reçoit votre adresse IP et les informations de votre navigateur à chaque page, et les pages chargent leurs polices depuis Google Fonts. La barre de navigation affiche le nombre d’étoiles du dépôt, que votre navigateur récupère auprès de l’API de GitHub ; GitHub reçoit donc aussi votre adresse IP et les informations de votre navigateur. Cette requête ne dépose aucun cookie. La documentation pose sa propre question sur les cookies, car elle ne peut pas lire la réponse que vous avez donnée sur ce site. Tant que vous n’y choisissez pas **Allow**, elle ne dépose aucun cookie et ne conserve aucun identifiant de visiteur. Si vous l’autorisez, Google Analytics dépose les cookies `_ga` et `_ga_<ID>` et mesure vos visites de la documentation, et Mintlify conserve un identifiant de visiteur aléatoire, `mintlify_anonymous_id`, dans le stockage local pour les compter. **Cookie settings**, dans le pied de page de la documentation, modifie votre réponse, et un refus supprime les deux. Base légale : votre consentement.

**Langue et réduction régionale.** Pour vous proposer la page dans votre langue lorsque votre navigateur n’en indique aucune de celles du site, et pour afficher la réduction régionale que le règlement appliquerait, le site demande à Cloudflare (`/cdn-cgi/trace`) et à notre serveur de quel pays provient votre connexion, et peut lire le fuseau horaire de votre appareil. Aucune de ces deux requêtes ne transporte de cookie, et la page ne conserve rien des réponses. Base légale : intérêt légitime.

Consulter le site ne dépose aucun cookie propre. Les demandes d’abonnement à la newsletter, de règlement et de vérification de code de réduction depuis le site public omettent les identifiants : elles n’envoient pas les cookies du portail et n’acceptent pas les cookies de la réponse. L’ouverture des pages du portail est distincte : s’y connecter dépose le cookie du portail ci-dessous. Tout ce que le site conserve dans votre navigateur figure dans [Cookies et stockage du navigateur](#cookies).

## Achats {#purchases}

Les licences sont vendues par {merchant} (Polar Software, Inc.), notre merchant of record et revendeur. Vous achetez auprès de {merchant} selon ses propres conditions d’achat et sa politique de confidentialité. {merchant} encaisse les paiements, calcule et reverse la taxe sur les ventes ou la TVA, envoie reçus et factures et gère problèmes et litiges de paiement. Il collecte nom, adresse e-mail, adresse de facturation et données de paiement. Nous ne voyons jamais les coordonnées complètes de votre carte.

Lorsque vous commencez un règlement, notre serveur indique à {merchant} ce que vous achetez, la langue de la page d’achat, la source de votre visite (voir [Site web](#website)) et votre adresse IP, que {merchant} utilise pour déterminer les taxes et la devise. De {merchant}, nous recevons votre adresse e-mail, votre nom et adresse de facturation tels que saisis, votre achat, les montants, les identifiants de commande et d’abonnement, puis les changements comme renouvellements, résiliations et remboursements. Avec chaque commande, nous conservons l’adresse e-mail, le pays de facturation et les montants.

Un achat fait sans connexion va au compte TablePro de l’adresse e-mail utilisée pour l’achat, qui est créé s’il n’existe pas et reste non vérifié jusqu’à votre première connexion. Dans le [portail de comptes]({account}), vous pouvez changer la période de facturation ou les postes d’un abonnement, le résilier ou le reprendre, et demander un remboursement. Lors d’une résiliation, le motif choisi et le commentaire éventuel sont transmis à {merchant} et conservés avec l’abonnement. Carte, factures, informations fiscales et adresse de facturation figurent dans le [portail client de {merchant}]({portal}), que le portail de comptes ouvre pour vous. Les remboursements sont décrits dans la [politique de remboursement](/fr/refund-policy), et les droits d’une licence dans les [conditions d’utilisation](/fr/terms).

## Portail de comptes {#account}

Le [portail de comptes]({account}) sur account.tablepro.app vous permet de gérer votre compte TablePro : ses licences, appareils, facturation et équipes. Il tourne sur notre serveur, derrière Cloudflare, comme le site.

**Votre compte.** Un compte appartient à une personne et est identifié par une adresse e-mail. Il contient cette adresse, le nom et la langue que vous choisissez, vos méthodes de connexion, les appareils qui y sont connectés, vos licences et commandes, les équipes dont vous faites partie avec votre rôle et votre poste, et un journal d’audit des modifications qui y sont faites, comme les connexions, les nouveaux appareils et les changements d’équipe, avec l’adresse IP et le navigateur de la requête à l’origine de chacune. Nos e-mails vous parviennent dans la langue de votre compte.

**Connexion.** Nous vous envoyons par e-mail un lien et un code à 6 chiffres : le lien fonctionne une fois, le code autorise 5 tentatives, et tous deux expirent après 15 minutes. Vous pouvez aussi ajouter des clés d’accès ; pour chacune, nous conservons la clé publique, le nom que vous lui donnez, si elle se synchronise entre vos appareils, et ses dates d’ajout et de dernière utilisation. Vous pouvez aussi vous connecter avec Apple, GitHub ou Google : le fournisseur nous communique un identifiant vous concernant et votre adresse e-mail vérifiée, et Apple aussi votre nom la première fois. Nous conservons l’identifiant et l’adresse avec votre compte et, pour Apple, un jeton que nous gardons chiffré et révoquons auprès d’Apple lorsque vous dissociez Apple ou supprimez votre compte. Si l’adresse d’un fournisseur appartient à un compte existant, nous envoyons à ce compte un lien et un code à confirmer avant de les associer, sauf si Google gère l’adresse (Gmail ou Google Workspace).

**Vos équipes.** Lorsque vous invitez quelqu’un dans une équipe, nous conservons son adresse e-mail, son rôle et le fait que l’invitation comprenne ou non un poste, et lui envoyons un lien valable 7 jours. Les propriétaires et les administrateurs voient les membres de l’équipe avec leurs noms et adresses e-mail, ses invitations et son journal d’audit, qui indique qui a modifié quoi dans l’équipe, adresses invitées comprises, mais jamais une adresse IP ni un navigateur. Les membres voient l’équipe, son offre, ses postes et leur propre rôle.

**Vos données.** Dans les réglages, vous pouvez changer votre nom, votre adresse e-mail et votre langue, ajouter et retirer des méthodes de connexion, télécharger les données de votre compte dans un fichier JSON et supprimer votre compte. Vous ne pouvez pas le supprimer tant que vous êtes propriétaire d’une équipe qui compte d’autres membres. La suppression retire vos méthodes de connexion, appareils, licences, appartenances aux équipes et les équipes dont vous êtes le seul membre, et met fin à vos abonnements sans remboursement. Ce que nous conservons ensuite figure dans [Durée de conservation des données](#retention).

**Ce que charge le portail.** Le portail ne charge ni Google Analytics, ni Cloudflare Web Analytics, ni aucun autre script d’analyse, et ne pose aucune question sur les cookies. Il affiche le chat de Crisp décrit dans [Site web](#website), et un achat fait depuis le portail ouvre la page de règlement de {merchant} par-dessus la page. Il signale les erreurs et les temps de chargement à Grafana Cloud avec Grafana Faro : l’erreur, l’écran où elle s’est produite (jamais l’adresse complète, qui peut contenir le jeton d’un lien), votre navigateur et système d’exploitation, et un identifiant aléatoire de votre visite.

## Newsletter {#newsletter}

Si vous vous abonnez aux notes de version, nous vous envoyons d’abord un lien de confirmation dans la langue de la page d’inscription. Le lien est valable 7 jours, et une adresse en reçoit au maximum 3 par jour. Une fois confirmée, votre adresse rejoint notre liste de newsletter chez Resend, le service qui envoie nos e-mails. Chaque newsletter contient un lien de désinscription, que Resend traite. Après désinscription, nous n’envoyons plus de newsletters ; pour supprimer aussi l’adresse, écrivez-nous. Cloudflare Turnstile vérifie le formulaire, comme décrit dans [Site web](#website).

Lors du passage depuis notre ancien serveur, chaque adresse de sa liste de diffusion qui ne s’était pas désinscrite a rejoint cette liste comme abonnée, confirmée ou non : ce serveur avait aussi ajouté les adresses des acheteurs, des titulaires de licence et des inscrits à la bêta, et leur envoyait des e-mails. Les adresses désinscrites ont été reprises comme désinscrites, et celles dont les e-mails avaient été rejetés ou signalés comme spam ont été placées à la place sur la liste de suppression de Resend, si bien qu’aucune newsletter ne les atteint.

## Cookies et stockage du navigateur {#cookies}

Consulter le site public et ses demandes de newsletter, de règlement et de code de réduction ne déposent aucun cookie propre. La connexion au portail de comptes, même seulement commencée, dépose le seul cookie strictement nécessaire listé ci-dessous. Cloudflare Web Analytics ne dépose aucun cookie et ne stocke rien dans votre navigateur. Les cookies Google Analytics ne sont déposés qu’après votre autorisation. Crisp dépose ses cookies sur chaque page une fois le chat chargé. Rien de tout cela n’est utilisé pour la publicité ou vendu.

- **`_ga` et `_ga_<ID>`** (cookies Google Analytics, jusqu’à 2 ans, uniquement si vous autorisez l’analyse) : identifiant aléatoire de votre navigateur et état de votre visite actuelle. Refuser, ou modifier votre réponse plus tard, les supprime. Base légale : consentement.
- **`tablepro:analytics-consent`** (stockage local, jusqu’à suppression) : votre réponse à la question sur l’analyse, pour éviter de la reposer sur chaque page. Le portail de comptes ne charge aucune analyse : il ne pose pas cette question et ne lit pas la réponse. Base légale : strictement nécessaire pour respecter votre choix.
- **`tablepro:attribution`** (stockage local, 90 jours) : enregistrement de première visite décrit dans [Site web](#website). Il ne contient aucun identifiant personnel et n’accompagne qu’une demande de règlement, qui transmet la source de la visite à {merchant}. Base légale : intérêt légitime.
- **`theme`** (stockage local, jusqu’à suppression) : votre choix d’apparence claire, sombre ou système. Le portail de comptes conserve le sien. Base légale : intérêt légitime.
- **`tablepro:language`** (stockage local, jusqu’à suppression) : la langue que vous avez choisie dans le menu des langues ou dans la barre de langue, et chaque langue dont vous avez fermé la suggestion, pour qu’elle ne soit plus proposée. Base légale : intérêt légitime.
- **`mintlify_anonymous_id`** (stockage local sur docs.tablepro.app, déposé par Mintlify, uniquement si vous y autorisez Google Analytics) : l’identifiant de visiteur décrit dans [Site web](#website). Un refus le supprime. La documentation conserve sa propre réponse `tablepro:analytics-consent`. Base légale : consentement.
- **Cookies commençant par `crisp-client/`** (Crisp, par exemple `crisp-client/session/…` ; 6 mois, renouvelés à votre retour ; déposés sur chaque page après le chargement du chat) : maintiennent le chat et votre conversation entre pages et visites. Base légale : intérêt légitime, pour proposer une assistance sur chaque page.
- **`__Host-tp_session`** (cookie du portail de comptes, 30 jours à partir de la connexion) : maintient votre connexion. Avant la connexion, il n’est déposé que pendant une connexion en cours par clé d’accès, Apple, GitHub, Google ou depuis une application, pour 10 minutes au plus. La déconnexion le supprime. Les demandes de newsletter, de règlement et de code de réduction depuis le site public omettent les identifiants et ne le reçoivent jamais. Base légale : strictement nécessaire.
- **`locale`, `context` et `sign-in-return-to`** (stockage local du portail de comptes) : la langue choisie dans le portail avant la connexion et le fait que vous ayez ouvert en dernier Personnel ou une équipe, tous deux jusqu’à suppression, et pendant 15 minutes la page à rouvrir après un lien de connexion reçu par e-mail. Base légale : intérêt légitime.
- **`com.grafana.faro.session`** (stockage de session du portail de comptes, jusqu’à la fermeture de l’onglet) : l’identifiant aléatoire de visite des rapports d’erreurs du portail. Base légale : intérêt légitime.

Vous pouvez modifier ou retirer votre réponse sur l’analyse à tout moment via **Paramètres des cookies** au pied de chaque page, ou ici :

<cookie-settings></cookie-settings>

## Base légale {#lawful-basis}

Pour les lecteurs de l’Espace économique européen et du Royaume-Uni, les bases légales au titre du RGPD et du UK GDPR sont :

- **Contrat** (art. 6(1)(b)) : vente et fourniture d’une licence, votre compte avec ses méthodes de connexion et ses appareils, vérifications de licence, portail de comptes et Team Library.
- **Intérêt légitime** (art. 6(1)(f)) : rapport d’utilisation Mac et son analyse dans PostHog, événements sur les connexions, achats, appareils et équipes que notre serveur envoie à PostHog, journal d’audit du compte, sécurité et prévention des abus, y compris Cloudflare Turnstile sur le formulaire de newsletter, journaux du serveur web et rapports d’erreurs du portail de comptes, Cloudflare Web Analytics, enregistrement d’attribution des achats, recherche du pays pour la langue et la réduction régionale, et chat sur chaque page.
- **Consentement** (art. 6(1)(a)) : cookies Google Analytics, rapport d’utilisation iPhone et iPad, newsletter et conversations initiées dans le chat.
- **Obligation légale** (art. 6(1)(c)) : documents fiscaux et comptables et réponses aux demandes légales.

## Qui reçoit les données {#sharing}

Nous partageons les données personnelles uniquement avec les services nécessaires au fonctionnement de TablePro :

- **{merchant}**, merchant of record des achats.
- **Resend**, qui envoie nos e-mails : liens et codes de connexion, invitations d’équipe, avis de compte et de sécurité, et newsletters. Resend conserve la liste de la newsletter et nous signale lorsqu’un e-mail envoyé à une adresse est rejeté ou marqué comme spam.
- **Notre hébergeur et Cloudflare**, pour le site, le portail de comptes et le serveur avec lequel les applications communiquent. Cloudflare compte aussi les pages vues avec Cloudflare Web Analytics et vérifie le formulaire de newsletter avec Turnstile.
- **Google**, pour Google Analytics sur le site et la documentation.
- **Crisp**, pour le chat sur chaque page du site et du portail de comptes.
- **PostHog** (EU Cloud), notre service d’analyse produit, qui reçoit les rapports d’utilisation des applications et les événements de notre serveur sur les connexions, achats, appareils et équipes, avec l’identifiant de votre compte mais jamais votre adresse e-mail ni votre nom. Les données d’utilisation que l’application Mac envoie directement parviennent à PostHog avec l’adresse IP de votre Mac.
- **Grafana Labs** (Grafana Cloud), qui reçoit les journaux et traces de notre serveur et les rapports d’erreurs du portail de comptes.
- **Apple, GitHub et Google**, lorsque vous vous connectez à votre compte avec eux.
- **jsDelivr**, qui fournit au navigateur le script de règlement de {merchant} lorsque vous pointez un bouton Acheter.
- **Mintlify**, qui héberge la documentation sur docs.tablepro.app.
- **GitHub**, qui héberge le flux de mises à jour, le catalogue de plugins et les téléchargements, et fournit le nombre d’étoiles affiché dans la documentation.

Nous ne vendons pas de données personnelles et ne les partageons pas avec des annonceurs.

## Transferts internationaux {#transfers}

Les services ci-dessus opèrent dans plusieurs pays ; vos données peuvent donc être traitées hors de votre pays. {merchant}, Google, GitHub, Cloudflare et Mintlify traitent des données aux États-Unis ; Google le fait au titre du cadre de protection des données UE–États-Unis et des clauses contractuelles types. PostHog les traite dans l’Union européenne. Lorsque la loi l’exige, les transferts depuis l’EEE et le Royaume-Uni reposent sur les clauses contractuelles types ou un autre mécanisme approuvé.

## Durée de conservation des données {#retention}

- **Rapports d’utilisation et événements d’analyse** : notre serveur n’en garde aucune copie une fois transmis à PostHog. Nous n’avons pas fixé de durée pour eux dans PostHog. La suppression de votre compte supprime son profil et ses événements PostHog une heure plus tard.
- **Données de notre ancien serveur** : une copie de toute sa base de données est conservée sans limite de durée dans une archive. Elle comprend les licences, commandes et membres d’équipe avec leurs adresses e-mail et leurs noms ; les Mac activés sur une licence, avec leurs noms ; les abonnés à la newsletter et les inscriptions à la bêta ; la trace des e-mails qu’il a envoyés ; et les rapports d’utilisation et journaux de demandes de licence qu’il conservait, avec leurs adresses IP.
- **Appareils** : conservés tant qu’ils servent. Un appareil sans contact depuis 180 jours est retiré, sauf si un fichier hors ligne le concernant est encore valide, et un appareil retiré est supprimé un an plus tard.
- **Journal d’audit de votre compte** : conservé tant que le compte existe, avec l’adresse IP et le navigateur de chaque modification que vous avez faite. La suppression du compte en retire vos adresses e-mail ainsi que l’adresse IP et le navigateur de vos actions ; la trace de chaque modification demeure.
- **Commandes** : conservées à des fins fiscales et comptables. La suppression de votre compte en retire votre adresse e-mail et votre compte.
- **Notifications de {merchant}, Resend et Apple** : 180 jours. Celles de {merchant} contiennent votre nom, votre adresse e-mail et votre adresse de facturation ; la suppression de votre compte les retire plus tôt de celles qui concernent vos achats.
- **Team Library** : jusqu’à la modification ou la suppression d’un élément ; un élément supprimé est conservé 90 jours. La bibliothèque est supprimée avec son équipe et reste après la fin d’une licence.
- **Liens et codes de connexion** : expirent après 15 minutes et sont supprimés 7 jours plus tard. Les sessions du portail durent 30 jours. Le jeton qui maintient la connexion d’une application expire 90 jours après sa dernière utilisation par l’application, et est supprimé 30 jours plus tard.
- **Comptes supprimés** : le compte, ses méthodes de connexion, appareils, licences et appartenances aux équipes sont supprimés immédiatement. Les commandes et le journal d’audit restent comme indiqué ci-dessus. Ce que notre ancien serveur détenait à votre sujet reste dans son archive, décrite ci-dessus.
- **Newsletter** : un lien de confirmation et l’adresse à laquelle il a été envoyé sont supprimés 7 jours après l’expiration du lien. Une adresse confirmée, ou reprise de notre ancien serveur, reste dans notre liste chez Resend jusqu’à ce que nous la supprimions à votre demande ; après désinscription, elle est conservée comme désinscrite afin qu’aucune newsletter ne lui parvienne.
- **Google Analytics** : données d’utilisateurs et d’événements pendant 2 mois, durée par défaut de Google utilisée par notre propriété. Les cookies durent jusqu’à 2 ans ou sont supprimés au refus.
- **Cloudflare Web Analytics** : Cloudflare nous montre les totaux de pages vues des six derniers mois. Rien n’est stocké dans votre navigateur.
- **Chat et e-mails d’assistance** : conservés par Crisp et dans notre messagerie jusqu’à suppression. Demandez-nous de supprimer vos conversations et e-mails.
- **Journaux du serveur web** : conservés pour la sécurité et le diagnostic. Aucune durée fixe n’a encore été définie.
- **Journaux et traces de notre serveur, et rapports d’erreurs du portail** : 14 jours, dans Grafana Cloud.

## Vos droits {#rights}

Selon votre lieu de résidence, vous pouvez nous demander de :

- vous fournir une copie des données personnelles détenues sur vous (accès) ;
- les corriger (rectification) ;
- les supprimer (effacement), sauf celles à conserver légalement ;
- limiter leur utilisation (limitation) ;
- vous les envoyer dans un format structuré lisible par machine (portabilité) ;
- cesser de les utiliser sur la base de l’intérêt légitime (opposition).

Vous pouvez retirer votre consentement à tout moment et saisir votre autorité de protection des données. Pour exercer ces droits, écrivez à [{email}](mailto:{email}). Nous répondons sous 30 jours. Dans le [portail de comptes]({account}), les réglages vous donnent aussi une copie des données de votre compte et suppriment le compte. Pour tout le reste, comme une adresse de newsletter ou un Mac sans compte, indiquez l’adresse e-mail, la clé de licence ou l’appareil concerné. Les données détenues par {merchant}, Google, Crisp ou GitHub sont aussi couvertes par leurs propres politiques.

**Résidents de Californie.** Le California Consumer Privacy Act vous donne le droit de savoir quelles informations personnelles nous collectons, d’en demander la suppression, de refuser leur vente et de ne pas être traité différemment pour avoir exercé ces droits. Nous ne vendons pas d’informations personnelles.

## Enfants {#children}

TablePro ne s’adresse pas aux enfants de moins de 16 ans et nous ne collectons pas sciemment leurs données personnelles. Si vous pensez qu’un enfant nous a fourni des données, contactez-nous et nous les supprimerons.

## Sécurité {#security}

Le trafic entre applications, site, portail de comptes et serveur utilise HTTPS. Les comptes TablePro n’ont pas de mot de passe. Les liens et codes de connexion, les jetons qui maintiennent la connexion des applications et les jetons d’API d’équipe sont stockés sous forme de hachages. La tâche qui envoie par e-mail un lien et un code de connexion les garde en clair jusqu’à sa suppression : un jour après l’envoi de l’e-mail, ou 7 jours après l’abandon de l’envoi. Tous deux cessent de fonctionner 15 minutes après votre demande. L’accès à nos systèmes est limité à {publisherName} et aux prestataires indiqués dans [Qui reçoit les données](#sharing). Aucun système n’est parfaitement sécurisé. Pour signaler une vulnérabilité, consultez la [page Sécurité](/fr/security#report) ou écrivez à [{email}](mailto:{email}).

## Modification de cette politique {#changes}

Lorsque cette politique change, nous la mettons à jour ici avec une nouvelle date de « Dernière mise à jour » et, si la loi l’exige, vous en informons directement.

## Contact {#contact}

Pour toute question sur la confidentialité ou cette politique, écrivez à [{email}](mailto:{email}).
