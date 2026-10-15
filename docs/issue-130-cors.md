# Audit manager #130 — CORS MakeProject hors périmètre

Rapport documentaire du **15 octobre 2026** pour [#65](https://github.com/arosaRe/naruto-blazing-revival/issues/65). Sources examinées : [#61](https://github.com/arosaRe/naruto-blazing-revival/issues/61), [rapport #57](issue-57-makeproject-cors.md) et [critères de clôture](criteres-cloture.md). Le numéro #130 désigne l'audit manager rapporté par #65 ; aucun lien vers une issue #130 ni texte original autonome n'est inventé. Les résultats techniques ci-dessous sont historiques et attribués aux rapports, sans nouvelle exécution réseau.

## Décision applicable et provenance

Le **15.10.2026 à 01:54**, le PDG confirme le fonctionnement du formulaire sur le site public et **refuse le déploiement CORS pour `localhost:8101/9101`**. MakeProject local est hors périmètre et son échec ne doit pas bloquer la clôture. Cette décision provient des **consignes du PDG fournies au cycle manager**, transcrites dans #61 et reprises dans le rapport #57 et les critères de clôture. Aucun lien original de discussion ni preuve indépendante nouvelle n'est disponible ; aucune mémoire manager n'est consultée ou modifiée pour ce rapport.

La consigne du **15.10.2026 à 02:12**, transcrite dans le [commentaire de #65](https://github.com/arosaRe/naruto-blazing-revival/issues/65#issuecomment-6181345951), réaffirme : « Localhost/MakeProject hors périmètre : déploiement CORS refusé, échec non bloquant. » Elle demande également de distinguer confirmations humaines et observation indépendante, et de maintenir la réserve acceptée sur les mentions non vérifiées. Le commentaire a été publié à **00:13:52 UTC** ; cette métadonnée est distincte de l'heure attribuée à la consigne.

La demande d'activation des deux origines locales reprise par l'audit #130 est donc **écartée du périmètre de clôture, jamais déclarée réalisée**. La correction #59 reste rapportée comme fusionnée sur `nightly`, sans activation distante. Aucune activation ou modification du serveur n'est annoncée et aucune demande d'accord CORS ne reste à satisfaire. La procédure historique de #57 est conservée pour traçabilité, refusée et non exécutée.

## Échecs conservés et niveaux de preuve

| Nature | Résultat rapporté et limite |
| --- | --- |
| Prévols publics réels de #57 | À **2026-10-14T23:37:09Z** (15 octobre à Zurich), `node scripts/check-feedback-preflight.mjs` reçoit **HTTP 400 pour les deux origines** `http://localhost:8101` et `http://localhost:9101`, sans `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` ni `Access-Control-Allow-Headers`. Code de sortie **1**. Ces OPTIONS réels ne sont ni interceptés ni accompagnés de POST. Le détail des en-têtes reste dans #57 ; aucune disponibilité CORS locale n'est validée. |
| Contrôle global MakeProject de #57 | `node scripts/check-makeproject-feedback.mjs`, avec Playwright externe et commande réelle du launcher sur 9101 : résultat global **code 1**, car les prévols publics échouent. Les simulations réussies ne changent pas cet échec. Aucun script n'est modifié pour le masquer et aucun nouveau contrôle n'est lancé ici. |
| Simulations locales de #57 | Relais local : OPTIONS 204 pour les origines explicitement autorisées et refus des autres ; transports de tests simulés. Navigateur : clavier, focus, validation et réponses 200/429/503/panne simulées ; POST interceptés. Ces résultats valident des comportements locaux, sans prouver le contrat CORS distant, une réception Discord ou l'absence de notification de mention. |
| Confirmation humaine publique | Le fonctionnement public est confirmé par le PDG à **01:54**, selon la transcription manager de #61. Les critères de clôture distinguent aussi la réception humaine à **00:26** du contrôle identifié `ISSUE35-CONTROLE-20261014T220717Z` et l'acceptation du critère 6 avec réserve à **00:47**. Ces confirmations ne constituent pas une observation directe par cet agent. |
| Observation indépendante | Aucune nouvelle observation du site public ou du salon Discord n'est effectuée pour #65. Ni les simulations ni la transcription de la confirmation humaine ne constituent cette preuve. L'absence de notification de mention indésirable demeure **non vérifiée**, réserve acceptée maintenue. L'audit indépendant final reste à effectuer. |

Les échecs des prévols et du contrôle global restent donc des **échecs techniques réels historiques**, sans conditionner la clôture du périmètre public confirmé humainement. Ils ne prouvent pas un dysfonctionnement du formulaire sur son origine publique. Ce rapport ne prononce pas la clôture globale : la grille des sept critères et l'audit final des livrables encore applicables restent ceux des critères de clôture.

## Contrôle des quatre critères de #65

1. Refus de 01:54 daté et attribué à la transcription manager de #61 ; réaffirmation de 02:12 liée au commentaire de #65. Aucune activation distante annoncée.
2. HTTP 400 des deux prévols et code 1 du contrôle MakeProject conservés ; aucune condition de clôture CORS localhost réintroduite.
3. Simulations, confirmation humaine du fonctionnement public et observation indépendante séparées ; réserve sur les mentions maintenue.
4. Liens locaux vérifiés par existence des cibles ; #65, son commentaire et #61 lus avec `gh`. Seul ce document est ajouté. Aucun appel réseau de test supplémentaire, POST, SSH, déploiement, publication du site, changement de code, de scripts, de `lancer.json` ou de mémoire manager.

Validation locale de #65 : `npm.cmd run build` réussi (3 067 ressources natives, 1 114 formes, 371 ressources, 182 pages) ; `npm.cmd test -- tests/feedback-ui.test.js tests/import-prompt.test.js tests/makeproject-launch.test.js tests/personal-stocks.test.js tests/photo-import-summary.test.js` réussi, **17/17**. La suite complète n'est pas lancée : les tests du relais émettent des POST locaux, exclus par la consigne. Aucun serveur lancé. Contrôle du diff avec `git diff --cached --check` avant commit.
