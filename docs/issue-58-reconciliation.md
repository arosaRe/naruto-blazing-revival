# #58 — remplacements approuvés et preuves attribuées

Contrôle documentaire du 15 octobre 2026, branche dédiée depuis `nightly`. Les trois abandons sont traités séparément dans la [grille applicable](criteres-cloture.md#réconciliation-séparée-des-trois-manques-de-119--58). Décision du 14 octobre à 17:33 : transcription dans [#17](https://github.com/arosaRe/naruto-blazing-revival/issues/17), sans lien original de discussion. Le numéro d’audit manager #119 provient de [#58](https://github.com/arosaRe/naruto-blazing-revival/issues/58) et de `journal.md`, pas d’une issue/PR accessible sous ce numéro. Aucun fichier personnel demandé, recherché ou consulté.

## Critères d’acceptation de #58

1. **Trois abandons explicites** : pièces personnelles ; vérification personnages/36 stocks/ryō/premium ; production et import du JSON personnel. La grille donne pour chacun provenance, inconnues conservées et remplacement réutilisable. Aucun manque n’est présenté comme réalisé ou restant à réaliser.
2. **Remplacements 2/3 contrôlés** : références accessibles et limites sans identifiant inventé ; prompt copiable/téléchargeable depuis Sources & sauvegarde, demandant un JSON photo compatible et téléchargeable, inconnues explicites et import préservant les données. La transcription exacte reste dans la grille ; contrôles locaux ci-dessous, aucune validation personnelle.
3. **Preuves distinctes** : import synthétique et simulations techniques ; réception humaine historique du contrôle #35 à 00:26, transcrite par le manager ; mentions non vérifiées acceptées avec réserve à 00:47 ; échecs CORS locaux historiques, hors périmètre depuis 01:54 ; confirmation publique humaine distincte. Aucun succès simulé assimilé à une transmission.
4. **Documentation seule** : aucune modification du code, du launcher, de `main`, d’`etat.md` ou de `journal.md`. Aucun POST public/Discord, déploiement ni clôture globale. Liens locaux contrôlés dans les sources ou dans `dist/` pour les références générées.

## Références et prompt — contrôles historiques rapportés pour #58

`npm.cmd run build` réussit : 3 067 ressources natives, 1 114 formes, 371 ressources, 182 pages. Serveur Python temporaire sur **9101**, arrêté après les GET ; aucun serveur sur 8101. Les cinq cibles de la rubrique Sources & sauvegarde ont répondu HTTP 200, avec contenu identique aux fichiers de `dist/` :

| Cible servie à la racine du site | Octets |
| --- | ---: |
| `reference-pour-chatgpt.html` | 28 176 |
| `import-reference/ressources.html` | 204 410 |
| `box-import-reference.json` | 560 725 |
| `box-import.schema.json` | 2 287 |
| `import-box-prompt.txt` | 9 752 |

Les liens et commandes sont ceux de `photoImportPanel()` dans `app.js`. `tests/import-prompt.test.js` réexécute la fonction réelle de copie avec effets navigateur simulés : presse-papiers disponible et repli manuel fournissent exactement le fichier source. Le lien de téléchargement cible ce fichier et sa copie dans `dist/` est identique octet par octet. SHA-256 : `4dda89ca18e22befe352c080bd2a711e7baeee9a20d8217e26c01f8d04e9efed`.

Limites : accès HTTP local et comportement de copie contrôlés, aucun nouvel essai visuel navigateur ni téléchargement dans ChatGPT. Aucune disponibilité du site de production revendiquée. Les références décrivent le jeu, jamais une possession ; le test prend une forme du catalogue, sans identifier de portrait. Premium non établi, `tokens` distinct ; contours ambigus et identités incertaines restent exclus. Les détails de provenance native restent dans les [preuves #46](issue-46-preuves-natives.md).

## Procédure sûre — données exclusivement synthétiques

`npm.cmd test` réussit **40/40**. Le test de prompt sérialise puis importe un JSON photo synthétique avec une forme réelle du catalogue, level=1, atk=0, ryo=12 et champs inconnus null. Sur compte neuf, inconnues null et tokens absent ; sur état synthétique existant, hp/luck, tokens=42, stone=3 et un autre personnage sont préservés, zéro explicite appliqué, notes conservées, état source intact. Ces nombres sont des valeurs de test, jamais celles du PDG.

Les régressions existantes vérifient aussi import vide, import partiel, refus d’observation invalide sans mutation, résumé UI et restauration d’une sauvegarde complète après import. Elles étayent la [procédure réutilisable](issue-3-sources.md#procédure-réutilisable-préservant-les-données-existantes) : export préalable comme point de restauration, contrôle des identifiants/notes/inconnues, fusion photo, vérification du résumé et des valeurs conservées, restauration complète pour revenir en arrière. Aucun import personnel exécuté. Aucun nouveau test ajouté.

Vérification finale : les 32 liens locaux des trois documents modifiés sont résolus, y compris les ancres Markdown et les cibles générées dans `dist/`. `git diff --check` réussit ; une réécoute temporaire confirme que 9101 est libéré.

## CORS local historique et confirmation publique actuelle

`node scripts/check-feedback-preflight.mjs`, à **2026-10-14T23:41:25.832Z** (15 octobre, Zurich), effectue uniquement deux OPTIONS publics, sans interception ni POST. Les origines `http://localhost:8101` et `http://localhost:9101` reçoivent **400**, sans Access-Control-Allow-Origin/Methods/Headers ; code de sortie **1**, échec historique du contrôle local. Les autres en-têtes sont `cache-control: no-store, no-store`, `connection: keep-alive`, `content-type: application/json`, `date: Wed, 14 Oct 2026 23:41:26 GMT`, `server: nginx`, `transfer-encoding: chunked`, `vary: Origin`, `x-content-type-options: nosniff, nosniff`.

La correction de [#59](https://github.com/arosaRe/naruto-blazing-revival/pull/59) est fusionnée sur `nightly`, mais sa configuration et son déploiement distants restent non exécutés selon le [rapport #57](issue-57-makeproject-cors.md). Les prévols locaux et confirmations simulées ne lèvent pas ce refus. La réception humaine historique et la réserve sur les mentions sont attribuées dans le [rapport #35](issue-35-publication.md) et la [grille](criteres-cloture.md) ; elles ne prouvent pas le fonctionnement actuel depuis MakeProject. Aucun nouvel envoi, aucune observation directe de Discord, aucune clôture globale.

**Décision du 15.10.2026 à 01:54** : le PDG confirme le fonctionnement du formulaire public. MakeProject local n’est pas demandé et n’a aucun effet sur la clôture ; le déploiement CORS `localhost:8101/9101` est refusé. Confirmation attribuée aux **consignes du PDG fournies au cycle manager**, consignées dans [#61](https://github.com/arosaRe/naruto-blazing-revival/issues/61), `etat.md` et `journal.md`, sans lien original de discussion ni preuve indépendante nouvelle. La réserve acceptée sur l’absence de notification de mention indésirable **non vérifiée** reste maintenue. L’audit indépendant final reste à effectuer.

Les sept critères et les remplacements personnels approuvés restent dans la [grille pour l’audit final](criteres-cloture.md#grille-pour-laudit-indépendant-final--61). Le refus local ne conditionne plus la clôture et ne contredit pas le fonctionnement public confirmé.
