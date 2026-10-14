# Critères de clôture applicables

État documentaire au 14 octobre 2026, pour l’[issue #17](https://github.com/arosaRe/naruto-blazing-revival/issues/17). Les décisions ci-dessous proviennent des **consignes du PDG fournies au cycle manager**, transcrites dans cette issue. Aucun lien original de discussion n’est disponible : ces transcriptions ne sont pas une preuve externe indépendante. Les heures sont conservées telles que fournies.

## Les six critères actuels

Cette grille rassemble les exigences du projet consignées dans les issues et les décisions du manager ; les formulations 2 et 3 sont les remplacements explicitement approuvés à 17:33. Elle distingue les livrables sur `nightly`, la publication limitée et le travail restant, sans prononcer une clôture globale.

| Nº | Critère applicable | Éléments de contrôle et limites |
| --- | --- | --- |
| 1 | Une nouvelle box initialise tous les stocks pris en charge à zéro, sans saisie initiale ; imports et sauvegardes existants conservent leurs valeurs. | [#1](https://github.com/arosaRe/naruto-blazing-revival/issues/1), `tests/personal-stocks.test.js` ; périmètre de production vérifié ci-dessous. Zéro initial ne transforme pas une observation inconnue en quantité vérifiée. |
| 2 | **Remplacé à 17:33** : références natives accessibles et limites documentées, sans identifiant inventé. | [Rapport de sources](issue-3-sources.md#critère-2-révisé--références-natives-accessibles-et-limites-documentées), références générées au build. Aucun `unitId` déduit d’un portrait ambigu ; données personnelles non vérifiées. |
| 3 | **Remplacé à 17:33** : prompt copiable et téléchargeable depuis Sources & sauvegarde, demandant un JSON photo compatible et téléchargeable, signalant les inconnues et expliquant un import préservant les données existantes. | [Parcours et procédure](issue-3-sources.md#critère-3-révisé--prompt-réutilisable-et-json-photo-compatible), [#4](https://github.com/arosaRe/naruto-blazing-revival/issues/4) et [#12](https://github.com/arosaRe/naruto-blazing-revival/issues/12). Livrable réutilisable sur `nightly`, sans production ni import de JSON personnel requis. |
| 4 | L’import partiel ou vide préserve les données existantes non observées ; les entrées invalides sont refusées et les sauvegardes complètes restent compatibles. Régressions, build et contrôle de sécurité accompagnent la validation. | [#2](https://github.com/arosaRe/naruto-blazing-revival/issues/2), [#11](https://github.com/arosaRe/naruto-blazing-revival/issues/11), tests d’import et de stocks. L’audit sans faille relevée est rapporté dans `journal.md`, pas réexécuté ni certifié ici. |
| 5 | Toute publication en production exige une approbation humaine du périmètre, des vérifications pertinentes et un rapport de version publiée. `nightly` reste la branche de travail. | Approbation de 17:51 limitée aux stocks neufs à zéro ; commit et limites de preuve ci-dessous. Aucun accord général pour publier `nightly`. |
| 6 | Formulaire de retours accessible sur le site, transmission vers Discord par relais serveur avec webhook secret, protection anti-abus et retour de succès ou d’échec compréhensible ; présentation avant publication. | **Ouvert, non rempli** : [#15](https://github.com/arosaRe/naruto-blazing-revival/issues/15) pour le relais, [#16](https://github.com/arosaRe/naruto-blazing-revival/issues/16) pour le formulaire. Ni disponibilité réelle ni autorisation de publication ne sont établies par ce document. |

## Décision du 14.10.2026 à 17:33 — remplacement de 2 et 3

Transcription fidèle fournie dans l’issue #17, provenance : consignes du PDG au cycle manager, sans accès à la discussion originale :

> Oui, je valide le remplacement des critères 2 et 3. Critère 2 : références natives accessibles et limites documentées, sans identifiant inventé. Critère 3 : prompt copiable et téléchargeable depuis Sources & sauvegarde, demandant un JSON photo compatible et téléchargeable, signalant les données inconnues et expliquant une procédure d’import qui préserve les données existantes. Aucune consultation ni vérification de mes fichiers personnels n’est exigée ou autorisée. Conserver nightly comme branche de travail et ne rien publier en production sans mon approbation.

Les trois manques personnels repris par l’audit sont **abandonnés, jamais déclarés réalisés** : obtenir les sept captures et `ma-box-blazing.json` ; vérifier personnages, quantités et monnaie du compte ; produire puis importer un JSON personnel. Ils ne conditionnent plus la clôture. Les constats historiques du rapport de sources restent non vérifiés ; la monnaie premium et les ressources ambiguës restent en suspens. Aucune consultation personnelle n’est effectuée pour cette documentation.

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

Le critère 6 reste **ouvert**. La décision de 17:51 ne couvre ni le formulaire ni son relais. Cette documentation ne prouve aucun envoi Discord, aucun hébergement configuré, aucun secret disponible ni aucune validation de sécurité du nouveau parcours. Elle n’autorise aucun déploiement et ne demande aucun secret dans une issue.

## Vérifications de cette mise à jour documentaire

Le 14 octobre 2026, sur la branche de travail issue de `nightly` : `npm test` réussit (12 tests) et `npm run build` réussit (1 114 formes, 371 ressources, 182 pages HTML de référence). `git diff --check` ne signale aucune erreur. Ces vérifications locales ne sont ni une publication ni une validation du formulaire Discord. Seuls ce document et son lien dans le rapport de sources sont modifiés ; les constats historiques du rapport et les fichiers du manager restent inchangés.
