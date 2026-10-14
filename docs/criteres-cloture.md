# Critères de clôture applicables

État documentaire actualisé au 15 octobre 2026 pour [#55](https://github.com/arosaRe/naruto-blazing-revival/issues/55), après #49 et la livraison et revue de #46/#47/#48 sur `nightly`. Les décisions ci-dessous proviennent des **consignes du PDG fournies au cycle manager**, transcrites dans [#17](https://github.com/arosaRe/naruto-blazing-revival/issues/17), `etat.md` et `journal.md`. Aucun lien original de discussion n’est disponible : ces transcriptions ne sont pas une preuve externe indépendante. Les heures sont conservées telles que fournies.

## Les sept critères actuels

Cette grille rassemble les exigences du projet consignées dans les issues et les décisions du manager ; les formulations 2 et 3 sont les remplacements explicitement approuvés à 17:33. Elle distingue les livrables sur `nightly`, la publication limitée et le travail restant, sans prononcer une clôture globale.

| Nº | Critère applicable | Éléments de contrôle et limites |
| --- | --- | --- |
| 1 | Une nouvelle box initialise tous les stocks pris en charge à zéro, sans saisie initiale ; imports et sauvegardes existants conservent leurs valeurs. | [#1](https://github.com/arosaRe/naruto-blazing-revival/issues/1), `tests/personal-stocks.test.js` ; périmètre de production vérifié ci-dessous. Zéro initial ne transforme pas une observation inconnue en quantité vérifiée. |
| 2 | **Remplacé à 17:33** : références natives accessibles et limites documentées, sans identifiant inventé. | [Rapport de sources](issue-3-sources.md#critère-2-révisé--références-natives-accessibles-et-limites-documentées), références générées au build. Aucun `unitId` déduit d’un portrait ambigu ; données personnelles non vérifiées. |
| 3 | **Remplacé à 17:33** : prompt copiable et téléchargeable depuis Sources & sauvegarde, demandant un JSON photo compatible et téléchargeable, signalant les inconnues et expliquant un import préservant les données existantes. | [Parcours et procédure](issue-3-sources.md#critère-3-révisé--prompt-réutilisable-et-json-photo-compatible), [#4](https://github.com/arosaRe/naruto-blazing-revival/issues/4) et [#12](https://github.com/arosaRe/naruto-blazing-revival/issues/12). Livrable réutilisable sur `nightly`, sans production ni import de JSON personnel requis. |
| 4 | L’import partiel ou vide préserve les données existantes non observées ; les entrées invalides sont refusées et les sauvegardes complètes restent compatibles. Tests de non-régression, build et contrôle de sécurité accompagnent la validation ; le rapport sépare explicitement le vérifié de l’inaccessible et du non vérifié. | [#2](https://github.com/arosaRe/naruto-blazing-revival/issues/2), [#11](https://github.com/arosaRe/naruto-blazing-revival/issues/11), tests d’import et de stocks. L’audit sans faille relevée est rapporté dans `journal.md`, pas réexécuté ni certifié ici. |
| 5 | Toute publication en production exige une approbation humaine du périmètre, des vérifications pertinentes et un rapport de version publiée. `nightly` reste la branche de travail. | Approbation de 17:51 limitée aux stocks neufs à zéro ; commit et limites de preuve ci-dessous. Aucun accord général pour publier `nightly`. |
| 6 | Formulaire de retours accessible sur le site, transmission vers Discord par relais serveur avec webhook secret, protection anti-abus et retour de succès ou d’échec compréhensible ; présentation avant publication. | **Clos par décision humaine avec réserve le 15.10 à 00:47** : [rapport #35](issue-35-publication.md), réception confirmée à 00:26 ; absence de notification de mention indésirable non vérifiée. Le défaut #42 est corrigé par [#44](https://github.com/arosaRe/naruto-blazing-revival/pull/44), avec contrôles locaux interceptés, sans nouvelle réception Discord prouvée. Le formulaire public est confirmé humainement à 01:54 ; MakeProject local est hors périmètre et son déploiement CORS refusé. La clôture globale reste suspendue à l’audit indépendant final, y compris sur les livrables du critère 7. |
| 7 | **Livré et relu sur `nightly` — consignes de 00:59** : guides clairs sous Blazing Collection, prompt et mode d’emploi utilisables avec ChatGPT gratuit, règles visuelles prouvées dans les limites natives documentées, inconnues explicites et JSON photo compatible préservant les données existantes ; textes et prompt relus avec vérifications pertinentes. | [Preuves #46](issue-46-preuves-natives.md), [revue du prompt gratuit #47](issue-47-revue-import.md), [guides et revue #48](issue-48-guides.md). Les trois livrables sont livrés et relus ; vérifications attribuées et limites détaillées ci-dessous. La clôture globale attend l’audit indépendant final. Aucune autorisation de publication en production n’en découle. |

## Décision du 14.10.2026 à 17:33 — remplacement de 2 et 3

Transcription fidèle fournie dans l’issue #17, provenance : consignes du PDG au cycle manager, sans accès à la discussion originale :

> Oui, je valide le remplacement des critères 2 et 3. Critère 2 : références natives accessibles et limites documentées, sans identifiant inventé. Critère 3 : prompt copiable et téléchargeable depuis Sources & sauvegarde, demandant un JSON photo compatible et téléchargeable, signalant les données inconnues et expliquant une procédure d’import qui préserve les données existantes. Aucune consultation ni vérification de mes fichiers personnels n’est exigée ou autorisée. Conserver nightly comme branche de travail et ne rien publier en production sans mon approbation.

Les trois manques personnels repris par l’audit sont **abandonnés, jamais déclarés réalisés** : obtenir les sept captures et `ma-box-blazing.json` ; vérifier personnages, quantités et monnaie du compte ; produire puis importer un JSON personnel. Ils ne conditionnent plus la clôture. Les constats historiques du rapport de sources restent non vérifiés ; la monnaie premium et les ressources ambiguës restent en suspens. Aucune consultation personnelle n’est effectuée pour cette documentation.

## Réconciliation séparée des trois manques de #119 — #58

Provenance commune : décision du PDG du **14 octobre 2026 à 17:33**, transcrite dans [#17](https://github.com/arosaRe/naruto-blazing-revival/issues/17) et reproduite ci-dessus, sans lien original de discussion. L’audit manager « #119 » est rapporté par [#58](https://github.com/arosaRe/naruto-blazing-revival/issues/58) et `journal.md` ; aucune issue ou PR de ce numéro n’est accessible dans ce dépôt. Il ne rétablit pas les exigences abandonnées.

| Manque personnel | Décision et provenance | Inconnues maintenues | Livrable réutilisable de remplacement |
| --- | --- | --- | --- |
| Obtenir les sept captures et le JSON personnel | **Abandon approuvé**, décision de 17:33 transcrite dans #17 ; jamais satisfait ni à réaliser. Aucune pièce demandée, recherchée ou consultée pour #58. | Contenu et couverture des pièces inconnus ; constats d’absence du rapport initial seulement historiques. | Critère 2 : références natives accessibles et limites documentées. Critère 3 : prompt réutilisable avec références et repli si elles sont inaccessibles à l’outil. |
| Vérifier personnages, 36 stocks, ryō et premium | **Abandon approuvé**, même décision de 17:33 ; aucune vérification personnelle revendiquée ou attendue. | Identités, progressions et quantités non vérifiées ; « 36 » et « 59 700 950 ryō » sont des annonces non validées. Premium non établi ; `tokens` ne le représente pas ; portraits et ressources ambigus exclus. | Critère 2 : identifiants issus des références sans invention, limites natives explicites. Critère 3 : inconnues null/absentes et exclusions en notes. |
| Produire puis importer le JSON personnel | **Abandon approuvé**, même décision de 17:33 ; aucun JSON personnel produit ou importé, aucune tâche personnelle restante. | Aucune couverture, compatibilité ou restauration du compte personnel prouvée. | Critère 3 : prompt copiable/téléchargeable demandant un JSON photo compatible et téléchargeable, repli UTF-8, sauvegarde préalable, fusion et contrôle après import ; vérification exclusivement synthétique. |

Le [rapport #58](issue-58-reconciliation.md) attribue les contrôles des critères 2/3 et leurs limites. Ils ne prouvent aucune possession personnelle et ne prononcent aucune clôture globale.

### Décision du 15.10.2026 à 01:54 — périmètre actuel

**Décision du 15.10.2026 à 01:54** : le PDG confirme le fonctionnement du formulaire public. MakeProject local n’est pas demandé et n’a aucun effet sur la clôture ; le déploiement CORS `localhost:8101/9101` est refusé. Confirmation attribuée aux **consignes du PDG fournies au cycle manager**, consignées dans [#61](https://github.com/arosaRe/naruto-blazing-revival/issues/61), `etat.md` et `journal.md`, sans lien original de discussion ni preuve indépendante nouvelle. La réserve acceptée sur l’absence de notification de mention indésirable **non vérifiée** reste maintenue. L’audit indépendant final reste à effectuer.

Les échecs locaux historiques restent dans les [preuves #58](issue-58-reconciliation.md) et le [rapport #57](issue-57-makeproject-cors.md). Ils ne contredisent pas la confirmation publique humaine et ne conditionnent plus la clôture. Aucune demande d’accord CORS ne reste ouverte.

## Décision du 14.10.2026 à 17:51 — approbation limitée

Transcription fidèle fournie dans l’issue #17, même provenance et même absence de lien original :

> Je donne mon approbation humaine pour publier en production uniquement la fonctionnalité déjà livrée qui initialise tous les stocks d’une nouvelle box à zéro, tout en préservant les imports et sauvegardes existants. Vérifie les changements inclus et les validations pertinentes avant publication. N’inclus pas automatiquement les travaux d’import photo en cours ni les issues #11 et #12. Si cette publication limitée exige d’autres changements fonctionnels, présente-moi le périmètre avant de publier. Rapporte ensuite la version publiée et les vérifications effectuées.

### Version publiée et périmètre vérifié dans Git

Après `git fetch origin`, le 14 octobre 2026, `git rev-parse origin/main` donne **`687740008edb57b224b27c49ff3f3b96ea128d9d`** (`6877400`, `Release zero stocks for new boxes only`), daté dans Git du 14 octobre 2026 à 17:54:24 +0200. C’est la version publiée rapportée par le manager dans `journal.md`, et la tête de production constatée dans Git lors de cette vérification.

`git show --stat` et `git show` sur ce commit établissent exactement trois fichiers modifiés par rapport à son parent `52f11c7` (34 ajouts, 2 suppressions) :

- `model.js` : `initialPersonalState` construit toutes les clés de stock prises en charge avec la valeur zéro. Le diff ne change ni le traitement des imports ni la validation des sauvegardes existantes.
- `package.json` : ajout de la commande `test` utilisant `node --test`.
- `tests/personal-stocks.test.js` : trois régressions sur les stocks neufs, la conservation de quantités explicites à la restauration et la distinction entre stock importé connu et stock inconnu.

Le parent est `52f11c7` (`Deploy public site automatically with GitHub Pages`) : aucune fusion globale de `nightly` n’est incluse dans cette publication. Les correctifs `071acd7` de #11 et `617f246` de #12 figurent dans `git log origin/main..origin/nightly` ; ils ne sont pas dans l’historique de `origin/main`. Le commit de publication ne modifie pas `box-import.js`, le prompt, le rapport de sources ni l’interface d’import photo. Le code déjà présent dans son parent ne constitue pas une nouvelle autorisation pour les travaux ultérieurs d’import.

Le manager rapporte dans `journal.md` les régressions et le build réussis, Pages réussi et le modèle distant vérifié pour cette version. **Limite de preuve** : Git établit le contenu et la tête de branche ; ce compte rendu historique n’est pas une nouvelle vérification du déploiement Pages ou du site distant. Cette tâche documentaire ne publie rien et ne vaut pas nouvelle approbation.

## Consigne du 14.10.2026 à 17:56 — nouveau critère Discord

Synthèse de la consigne fournie au cycle manager, reprise dans #17 et détaillée dans #15/#16 et `etat.md` (sans lien original disponible) : formulaire accessible pour envoyer les retours au salon Discord du PDG ; relais serveur adapté au site statique ; webhook en configuration serveur protégée, jamais dans le dépôt, le JavaScript navigateur ou les fichiers publiés ; protection anti-abus ; confirmation de réception ou erreur compréhensible. Le travail reste sur `nightly` et cette fonctionnalité doit être présentée avant toute publication en production.

À cette date (14.10 à 17:56), le critère 6 était **ouvert**. La décision de 17:51 ne couvrait ni le formulaire ni son relais. Les publications ultérieures isolées sont consignées dans les rapports [#35](issue-35-publication.md) et [#39](issue-39-publication.md) ; ces accords historiques ne valent pas nouvelle autorisation de publication.

## Décisions du 15.10.2026 — réception et clôture avec réserve

Sources : [#41](https://github.com/arosaRe/naruto-blazing-revival/issues/41), transcriptions du cycle manager dans `etat.md` (00:26, 00:36, 00:47) et `journal.md` (validation de 00:47 puis suite de l’audit #96). Aucun lien original de discussion ni observation indépendante du salon n’est disponible ici. Heures fournies en Europe/Zurich.

- **00:26 — réception humaine** : le PDG confirme voir `ISSUE35-CONTROLE-20261014T220717Z` dans le salon prévu : « oui je le vois ». Cela confirme la réception de ce contrôle précis, sans renseigner les notifications de mention.
- **00:47 — acceptation humaine avec réserve** : « alors oui c'est bon on confirme le critère 6 ». Le critère 6 est clos par décision humaine ; l’absence de notification de mention indésirable demeure **non vérifiée**. Aucun nouvel envoi Discord ni publication n’est autorisé par cette décision.

| Nature de preuve | Éléments et limites |
| --- | --- |
| Réponse API et interface | #35 rapporte un POST unique le 14.10 à 22:07:30 UTC, HTTP 200, `{"ok":true}` et confirmation affichée. Cette réponse historique ne prouve pas à elle seule la réception visuelle ni l’absence de notification de mention ; elle n’est pas rejouée ici. |
| Réception humaine | Confirmation transcrite du PDG à 00:26 pour l’identifiant #35 ; aucune observation directe du salon par cet agent. |
| Vérification indépendante | Les contrôles techniques historiques de #35/#39 gardent leurs limites. Les tests simulés de neutralisation des mentions ne prouvent pas l’absence de notification réelle. L’audit #96 a relevé le défaut du lancement standard ; cette mise à jour documentaire ne constitue pas le réaudit demandé. |

### Données personnelles — toujours non vérifiées

Les personnages personnels, les 36 stocks et les 59 700 950 ryō restent non vérifiés : ces nombres annoncés ne constituent pas des valeurs validées. La monnaie premium et les objets ambigus restent non vérifiés, sans lever les incertitudes sur les références natives. Ces données ne sont plus des livrables personnels exigés selon les remplacements approuvés de 17:33 ; leur consultation demeure **interdite**. Aucun fichier personnel n’est demandé ou consulté pour #41 ; aucune identité native n’est déduite d’un portrait ambigu.

### Défaut du lancement standard — constat historique, corrigé par #44

L’audit #96, tel que consigné dans `journal.md` et [#42](https://github.com/arosaRe/naruto-blazing-revival/issues/42), relevait un `feedbackEndpoint` vide après lancement MakeProject sur 9101 et un bouton désactivé. La [capture de contexte 004907](contexte/discussion/Capture%20d'écran%202026-10-15%20004907.png), relue pour #49, montre « aucun relais HTTPS valide n’est configuré » ; elle illustre cet état historique sans établir seule sa cause technique ni l’état actuel.

La [PR #44](https://github.com/arosaRe/naruto-blazing-revival/pull/44), fusionnée dans `nightly` au commit `9c6e9aa9b3aac8365bda7af88dc2d7e02224367c`, corrige #42 : `lancer.json` définit l’URL publique `FEEDBACK_ENDPOINT=https://retours.179-237-102-19.sslip.io/feedback` avant le build, puis sert `dist/` sur `%PORT%` ; l’URL MakeProject reste `http://localhost:{PORT}`. `CLAUDE.md` documente cette configuration ciblée. Le build seul conserve sa configuration par environnement, sans endpoint par défaut ; aucun webhook secret n’est ajouté au navigateur ou au dépôt.

Les preuves **rapportées par #44**, non rejouées pour #49, sont :

- Commande exacte de `lancer.json` exécutée par `cmd`, sans endpoint préalable, avec `PORT=9101` : module généré, destination navigateur et formulaire activable vérifiés.
- Contrôle Playwright avec installation externe : ouverture clavier, focus, validation vide, Tab/Shift+Tab et Échap ; réponses 200, 429, 503 et erreur réseau interceptées localement. Tout trafic navigateur externe est bloqué ou simulé. La confirmation 200 affichée est simulée : **elle ne prouve aucune réception Discord**.
- `npm test` : 35 tests réussis ; `npm run build` et `node scripts/check-feedback-dist.mjs` réussis, ce dernier aussi après le build du lancement réel. Serveur arrêté, disponibilité du port 9101 vérifiée ; port 8101 préservé. Aucun envoi au relais réel ni à Discord, aucune publication et aucune modification de `main`.

#42 est donc corrigé ; cette preuve locale reste distincte de la réception humaine historique de #35 à 00:26 et de l’acceptation avec réserve de 00:47. L’absence de notification de mention indésirable reste **non vérifiée**. La correction ne clôt ni le critère 7 ni l’audit indépendant final à reprendre ; elle n’autorise aucun nouvel envoi ou publication.

**#57 — échec CORS local historique, hors périmètre actuel.** Les OPTIONS réels du 15 octobre ont reçu 400 pour les deux origines locales, sans `Access-Control-Allow-Origin`. Les prévols locaux et simulations ne lèvent pas ce refus distant. Configuration et déploiement non exécutés, désormais refusés à 01:54 et sans effet sur la clôture : [rapport #57](issue-57-makeproject-cors.md).

## Consignes du 15.10.2026 à 00:59 — exigences du critère 7

Synthèse des deux consignes de 00:59 fournies au cycle manager, transcrites dans `etat.md` et réparties entre #46, #47 et #48 ; même limite de provenance que ci-dessus, sans lien original de discussion. Les livrables attendus sont :

- **Tous les guides utilisateur** : inventorier les aides visibles, proposer une réécriture claire, structurée et sans répétitions sous le nom **Blazing Collection** ; références Naruto discrètes et facultatives. Préserver les avertissements de sauvegarde, restauration, inconnues et import partiel. Présenter les textes révisés et leur emplacement pour revue.
- **ChatGPT gratuit** : réviser ensemble prompt et mode d’emploi, vérifier à la date de leur revue les capacités gratuites dans les sources officielles OpenAI et fournir liens et date. Aucun modèle payant ni niveau de réflexion réservé aux abonnés ne doit être requis. Expliquer les réglages effectivement disponibles, limites variables, lots de captures, relevé intermédiaire, reprise et signal FIN ; ne promettre ni quota fixe ni analyse complète en une demande. Cette grille consigne une exigence, sans certifier ici les capacités actuelles de ChatGPT.
- **Sources et règles visuelles** : exploiter données natives, références, code et documentation ; indiquer les références à joindre, captures générales et fiches détaillées nécessaires au parcours réutilisable. Vérifier Ultimate, contours rouges et niveaux rouges/jaunes avant toute déduction ; distinguer faits vérifiés, déductions justifiées et inconnues. Le [rapport #46](issue-46-preuves-natives.md) trace les règles Ultimate/niveaux et leurs limites ; la signification générale des contours rouges y reste **non établie**. Aucune règle ne doit être inventée à partir d’une couleur ou d’un portrait ambigu.
- **Couverture et inconnues** : couvrir personnages, versions, niveaux, doublons, Ultimate, stocks, monnaies et tous les autres champs identifiables et pris en charge, selon la matrice #46. Expliquer les limites du contrat, notamment doublons non représentables et monnaie premium non établie. Ne jamais inventer personnage, `unitId`, valeur ou règle ; exclure les identités ambiguës, conserver les inconnues à `null`/absentes et signaler observations non représentables et box incomplète. Le parcours explique quand des captures complémentaires seraient nécessaires à son utilisateur ; cela ne constitue aucune demande de fichiers personnels au PDG et ne lève pas leur interdiction de consultation.
- **Livrable et revue** : JSON photo compatible et téléchargeable, repli par copie UTF-8 si le fichier est indisponible ; sauvegarde préalable, import par fusion préservant les données existantes et contrôle après import. Copie et téléchargement doivent servir le même prompt. Présenter textes et prompt révisés pour revue avec preuves, contrôles pertinents, tests et build, en séparant vérifié, inaccessible et non vérifié.

### État actuel pour #55 — livrables livrés et relus

**Les preuves natives, le prompt gratuit et les guides sont livrés et relus sur `nightly`.** Les exigences ci-dessus conservent leur formulation historique ; les textes et preuves sont accessibles dans les trois rapports :

- [#46 — preuves natives et matrice d’import](issue-46-preuves-natives.md) : sources locales, règles Ultimate/niveaux et couverture du contrat. Les exécutions natives sont celles rapportées par les audits, sans nouvelle exécution du client. Le rapport consigne 35 tests réussis et un build de 1 114 formes, 371 ressources et 182 pages. Contours rouges et monnaie premium restent non établis, doublons non représentables et identités ambiguës exclus.
- [#47 — revue du prompt gratuit et de son mode d’emploi](issue-47-revue-import.md) : textes dans `import-box-prompt.txt` et `photoImportPanel()` de `app.js`, sources officielles OpenAI consultées le 15 octobre 2026, limites variables, lots/reprise/FIN et repli UTF-8. Le rapport établit la copie identique au fichier téléchargeable et la fusion préservant les données existantes avec un JSON exclusivement synthétique. Il rapporte 37 tests réussis, build, contrôle syntaxique et diff réussis ; aucun essai de quota sur compte personnel ni test visuel navigateur n’y est revendiqué. Cette grille ne revalide pas les capacités actuelles de ChatGPT.
- [#48 — inventaire, textes et revue des guides Blazing Collection](issue-48-guides.md) : emplacements et extraits relus, renvois au parcours gratuit, sauvegarde/restauration et inconnues ; prompt et aide validée conservés. Le rapport consigne 37 tests réussis, build, contrôle syntaxique et diff réussis, ainsi qu’un contrôle Chromium sur 9101 : navigation, liens locaux, affichage à 390 px sans débordement global et aucune erreur JS, trafic externe bloqué et aucune soumission. Les [captures de revue](issue-48-evidence/) sont accessibles ; seuls le guide mobile et Sources bureau sont déclarés relus visuellement. Aucune validation exhaustive des 180 pages de personnages ni du service externe ChatGPT n’est revendiquée.

Ces vérifications sont **rapportées par #46/#47/#48**, sans être rejouées pour cette synthèse. Les simulations du relais ne prouvent aucune réception Discord ni absence de notification de mention. **La clôture globale reste soumise à l’audit indépendant final** ; cette mise à jour documentaire ne constitue pas cet audit. Les remplacements approuvés de 2/3 restent applicables, sans rétablir les livrables personnels abandonnés. Aucun nouvel envoi Discord ni aucune nouvelle publication n’est autorisé ; travail sur `nightly`, production soumise à une approbation humaine du périmètre.

## Vérifications historiques de la mise à jour du 14 octobre

Le 14 octobre 2026, sur la branche de travail issue de `nightly` : `npm test` réussit (12 tests) et `npm run build` réussit (1 114 formes, 371 ressources, 182 pages HTML de référence). `git diff --check` ne signale aucune erreur. Ces vérifications locales ne sont ni une publication ni une validation du formulaire Discord. Ces résultats concernent la mise à jour du 14 octobre, pas #41. Les fichiers du manager restent inchangés.

## Vérifications de #41 — 15 octobre 2026

Sur la branche dédiée issue de `nightly` : `npm.cmd test` réussit (34/34), `npm.cmd run build` réussit (3 067 ressources natives, 1 114 formes, 371 ressources de référence, 182 pages HTML générées) et `git diff --check` réussit. Les transports Discord des tests sont simulés : aucun envoi réel, aucune preuve supplémentaire de réception ou de notification. Seuls les quatre rapports documentaires sont modifiés ; aucun fichier personnel consulté, aucune modification fonctionnelle ni publication. Aucun serveur de test lancé ; ces contrôles ne valident pas le lancement standard de #42.

## Vérifications de #49 — 15 octobre 2026

Sur la branche dédiée issue de `nightly`, `npm.cmd test` réussit (35/35), `npm.cmd run build` réussit (3 067 ressources natives, 1 114 formes, 371 ressources de référence, 182 pages HTML générées) et `git diff --check` réussit. Seul `docs/criteres-cloture.md` est modifié. Les tests de relais utilisent des simulations locales ; aucun envoi Discord, aucune publication, aucun fichier personnel demandé ou consulté. Aucun serveur de site lancé ; le contrôle navigateur de #44 n’est pas rejoué. Sept critères sont représentés, le critère 7 reste ouvert, les remplacements de 2/3 et la réserve sur les mentions restent explicites. La réception humaine historique et les preuves locales interceptées restent distinctes ; aucun réaudit indépendant final n’est revendiqué ici.

## Grille pour l’audit indépendant final — #61

Les sept critères restent applicables ; cette grille prépare l’audit sans le déclarer réalisé. Les preuves rapportées ne sont pas rejouées pour cette documentation.

| Critère | Contrôle à examiner par l’audit final |
| --- | --- |
| 1 | Stocks neufs à zéro, imports et sauvegardes préservés ; régressions et périmètre publié rapportés. |
| 2 | Références natives et limites sans identifiant inventé ; remplacement personnel approuvé maintenu. |
| 3 | Copie/téléchargement du prompt, JSON compatible, inconnues et fusion ; aucun JSON personnel exigé. |
| 4 | Validations d’import, compatibilité, tests/build et limites du contrôle de sécurité rapporté. |
| 5 | Publications rapportées et approbations humaines limitées ; aucune nouvelle publication autorisée. |
| 6 | Confirmation publique humaine à 01:54, réception historique à 00:26 et réserve mentions acceptée à 00:47 distinctes des simulations. CORS localhost exclu des conditions de clôture, déploiement refusé. |
| 7 | Livrables et revues #46/#47/#48, inconnues natives et limites conservées. |
