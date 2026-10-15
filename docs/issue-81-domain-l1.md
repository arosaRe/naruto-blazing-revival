# #81 — domaine autonome L1

Base : `958377f`, sur `feat/collection-v2-discord-api-ready`. Le documentaire #80 reste inchangé et déjà validé ; le nouveau diff se lit avec `git diff 958377f HEAD`. Réf. #81. PR #82 conservée en brouillon vers nightly.

## Contrat interne livré

`v2/domain/collection.js` expose `SCHEMA_VERSION = 1`, `validateCollection`, `createLocalIdentity` et `groupInstances`. Cette version de schéma interne n'est pas le numéro de la génération V2 ni un contrat officiel du jeu.

Le document contient `schemaVersion`, `versions`, `forms`, `instances`. Une version possède `versionId`, une forme `formId` et `versionId`, un exemplaire `instanceId`, `identityKind` (`external` ou `local`), `versionId`, `formId`, `progression`. Chaque entité possède `provenance` : `source` non vide et `coverage` (`complete`, `partial`, `unknown`), avec date/source complémentaire possible. Ces métadonnées ne prouvent pas une valeur manquante. Les autres champs structurels non prévus sont refusés pour empêcher leur omission silencieuse dans la comparaison.

Tous les IDs sont des chaînes opaques non vides, sans trim, conversion numérique, reconstruction ni extraction de famille. Les nombres comme IDs sont refusés, même petits : un nombre déjà arrondi ne peut pas être réparé. `instanceId` est unique dans le document ; son espace de noms externe doit être établi par le futur adaptateur avant assemblage de plusieurs fournisseurs/comptes. Aucun rapprochement par nom, portrait ou position.

Sans ID externe, `createLocalIdentity()` alloue un UUID local avec `crypto.randomUUID()`. Il faut conserver cette identité avec l'exemplaire lors des futurs exports/stockages ; L1 ne persiste rien. Réallouer sur une autre liste anonyme ne permet pas de reconnaître les mêmes copies : aucune déduplication/réconciliation automatique promise, même à progression égale. Les limites et conflits restent à traiter dans les lots suivants.

Progression : `level`, `exp` (EXP dans le niveau), `unlockedLevelCap` (plafond actuellement débloqué, pas plafond final), `activeAbilityIds` (ensemble sans doublons d'identités réellement actives), `luck`, `pillBonuses` et `totalStats` (chacun `hp`, `attack`, `speed`). Les bonus ne sont ni les statistiques totales ni un stock de consommables. Les nombres connus sont des entiers sûrs positifs ou nuls ; niveau supérieur au plafond débloqué connu refusé. Aucun plafond universel ni règle Ultimate/score n'est inventé. Un ensemble vide de capacités est connu, pas inconnu.

Chaque champ de progression peut être absent ou null ; chaque composante de statistiques aussi. Absence, null et zéro restent inchangés. La validation retourne `{valid, errors, pendingReferences}` sans normaliser ni muter la source. Une référence version/forme absente, null ou inconnue reste brute avec `status: reference-to-complete` et ne rend pas à elle seule le document invalide. Une forme connue attribuée à une autre version explicite est en revanche incohérente et refusée. Pas de repli catalogue arbitraire. Les identités de capacités sont opaques ; L1 ne prétend pas résoudre un catalogue de capacités inexistant.

## Regroupement sans perte

Le regroupement exige version/forme résolues et tous les champs de progression connus, y compris EXP, totaux et les trois bonus. C'est volontairement conservateur : toute inconnue produit un groupe individuel. Les capacités se comparent comme ensemble d'IDs, jamais par leur seul nombre. Les métadonnées `provenance` et `technical`, IDs d'instance et dates ne séparent pas des progressions connues égales.

Chaque résultat contient uniquement `groupId`, `members`, `count`. Les membres sont les objets exemplaires originaux ; aucune somme, cible, meilleure copie ou copie composite. La fonction ne les modifie pas ; le consommateur ne doit pas confondre les références retournées avec des copies modifiables indépendantes. Le groupId encode sans hachage avec perte la signature, ou l'ID d'une instance incomplète ; c'est une identité de groupe visuel, qui change après amélioration, jamais une identité d'exemplaire. Groupes et membres sont ordonnés indépendamment de l'ordre d'entrée, sans identité fondée sur cet ordre.

## Preuves et périmètre

`node --test tests/v2-domain.test.js` couvre D et les cinq critères : trois copies et séparation après amélioration, capacités différentes à nombre égal, forme/niveau/LB/Luck/trois pilules/EXP/totaux, inconnues, métadonnées neutres, IDs longs et ordre, UUID local, invalides et références à compléter. Les fixtures sont synthétiques dans `tests/fixtures/v2/`, importées uniquement par les tests. L'allowlist runtime reste inchangée ; ni domaine ni fixture ne sont chargés au démarrage ou distribués.

Aucune UI, migration, persistance, sélection par score, synchronisation, adaptateur ou appel externe livré. Sauvegardes V1 et ressources natives inchangées. Les deux formats fournisseurs fictifs relèvent de L10 ; aucune fixture ne valide une API officielle. Aucun test navigateur nécessaire pour ce domaine sans interface. Aucun serveur lancé.

Exception PDG transmise au relecteur : examiner séparément le diff #81 après `958377f`, verdict/commentaire uniquement. Aucune commande de fusion, retrait du brouillon, auto-merge ni clôture par fusion. Aucun déploiement, workflow de production, modification de main ou fichier manager.

Validation finale locale Windows : 17/17 tests ciblés, `npm.cmd test` 57/57, `npm.cmd run build` réussi (3 067 assets, 1 114 formes, 371 ressources, 182 pages, 37 fichiers runtime). `dist/tests` et `dist/v2` absents. Revue indépendante favorable, contrôle ciblé 17/17 ; suggestion de refus des tableaux JS creux intégrée et revérifiée. `git diff --check` réussi. Aucun test externe Discord/jeu ni test navigateur V2 exécuté.
