# #48 — Inventaire et textes pour revue

Revue du 15 octobre 2026, fondée sur [les preuves natives #46](issue-46-preuves-natives.md) et [la revue du parcours gratuit #47](issue-47-revue-import.md). Aucun fichier personnel du PDG consulté, aucun envoi Discord, aucune publication. Les captures utilisent une box locale neuve.

## Inventaire et points d’entrée

| Emplacement | Contenu utilisateur et décision |
| --- | --- |
| `player-guide.js`, `renderPlayerGuide`, route `#guide` | Guide de départ, trois étapes collection/stocks/plan, bilan des champs manquants, boutons de complétion, lexique éveil/LB/terrain/soutien/Ultimate/besoins/précision, références de missions et sauvegarde. Réviser les procédures ; conserver bilan, définitions et avertissements de missions non confirmées. Import renvoyé vers Sources ; Ultimate réduit à un renvoi vers la règle de référence. |
| `app.js`, `renderCollection`, route `#collection` | Accueil box vide, ajout manuel, recherche/filtres et états vides, parcours vers guide/plan/stocks. Remplacer le mini-tutoriel ChatGPT par un renvoi au parcours gratuit. Conserver les aides contextuelles de recherche et possession. |
| `app.js`, `renderPlan`, route `#plan` / alias `#inventory` | Objectifs, filtres, remplacement du plan, prévisions manquants/annoncés, inconnues, stocks et conversions ramen/parchemins/pilules/autres matériaux. Conserver : ces aides expliquent les commandes et résultats sur place ; les détails de calcul ne sont pas une seconde procédure d’import. |
| `app.js`, dialogues de fiche/progression/ressources, `trainingDetails` et rendus de budgets | Saisie forme/niveau/EXP/bonus/capacités/chance/plafond, badge, ressources individuelles, estimation et distinction du plan global. Conserver : nécessaires à la saisie et à la lecture des résultats, sans changer les règles. |
| `app.js`, `photoImportPanel`, route `#sources` | **Référence pour importer les captures** : cinq étapes, gratuité sous limites variables, lots/reprise/FIN, JSON partiel, sauvegarde avant import et fusion, limites natives, liens prompt/index/ressources/JSON/schéma. Bloc validé intégralement conservé, comme `copyImportPrompt` et ses statuts. |
| `app.js`, `renderSources`, même route | **Référence pour sauvegarder/restaurer** : rendre explicites les commandes, le point de restauration et la différence avec l’import photo. Autres sections : catalogue, variante historique Arosa, disponibilité, cartes/badge, niveaux du site versus natifs, calculs/précision, attribution. Conserver ces preuves et limites ; corriger seulement la description des stocks neufs. |
| `app.js`, `restore`, `importFeedbackHtml`, messages d’erreur/notifications | Résumé d’import, notes, refus, restauration et chargement. Conservés : retours d’action et avertissements, pas des guides concurrents. |
| `index.html` | Navigation, liens d’évitement/accueil, chargement, sauvegarde, pied de page ; formulaire de retours (confidentialité, labels, limite et statuts). Conservés, textes validés du formulaire intacts. Seule page HTML source ; marqueur MakeProject Release 33 déjà présent. |
| `README.md`, « Ma box et mes captures » | Entrée documentaire vers guide et Sources. Corriger stocks neufs et remplacer la procédure d’import abrégée par les liens fonctionnels. Garder migration d’une ancienne sauvegarde et confidentialité. |
| `import-box-prompt.txt` | Contrat validé accessible par copie/téléchargement dans Sources. **Intact**, aucune reproduction dans les guides. |
| `scripts/build-import-reference.mjs` → `reference-pour-chatgpt.html`, `import-reference/personnages-*.html`, `import-reference/ressources.html` | 182 pages générées : index, versions/formes et ressources. Titres sous Blazing Collection et retour au parcours gratuit sur toutes les pages. Clarifier exemplaire versus version dans l’index. Tables, identifiants et plafonds intacts. |
| `box-import-reference.json` généré, `box-import.schema.json` | Références machine jointes au parcours, pas un tutoriel. Contrats et données inchangés ; références sans progression de compte. |

## Portée et exclusions

Les sections construction, hébergement et configuration des retours du README, `CLAUDE.md`, `relay/README.md`, scripts de contrôle/build, audits JSON, données du catalogue et commentaires techniques sont destinés à la maintenance. Ils restent hors réécriture utilisateur. Les textes des recettes sont des explications de résultats, pas des consignes à dupliquer dans le guide.

`docs/issue-3-sources.md`, `docs/issue-23-retrait-vps.md`, `issue-25-service-interne.md`, `issue-27-horloge.md`, `issue-29-https-proxy.md`, `issue-33-mise-en-service.md`, `issue-35-publication.md`, `issue-39-publication.md`, `docs/criteres-cloture.md`, `etat.md`, `journal.md`, les README/manifestes/patchs de `docs/feedback-candidate` et `docs/generator-candidate`, et les pièces de publication sont des preuves historiques ou consignes de suivi, pas des guides actuels du produit. Ils ne sont pas réécrits rétroactivement. #46/#47 restent les sources de limites pour cette revue. `docs/contexte/` est exclu conformément à la consigne de ne consulter aucun fichier personnel ; aucun besoin de ces pièces pour cette révision.

Les guides GachaWiki, feuille communautaire Google, Naruto Blazing Wiki, ChatGPT et FAQ officielles liées sont externes : conserver leurs liens et avertissements, sans prétendre modifier ou revalider leurs contenus. Aucune nouvelle vérification de capacité gratuite n’est revendiquée : le parcours garde la date et les réserves validées par #47.

## Textes révisés

Les textes complets figurent dans les fichiers de la PR ; voici les passages à relire et leur emplacement exact par fonction/section.

- `renderCollection`, accueil vide : « Suis le parcours gratuit dans Sources & sauvegarde pour importer tes captures. Tu peux aussi ajouter tes personnages manuellement. »
- `renderPlayerGuide`, en-tête : « Blazing Collection · Guide de progression » ; titre de parcours : « Préparer mon plan ».
- Même parcours : « Pour ajouter des captures à ta box, suis le parcours gratuit validé dans Sources & sauvegarde. Il explique les lots, les limites et le contrôle des imports partiels. » Bouton : « Importer mes captures · parcours gratuit ».
- Étape stocks : « Vérifie les quantités avant de lire le manque. Les stocks d’une nouvelle box sont initialisés à 0 ; ce point de départ ne prouve aucune observation du jeu. Efface une quantité que tu ne connais pas. Voir “Besoin, stock et manque” ci-dessous. »
- Lexique Ultimate : « Badge calculé sur la forme actuelle. Ouvre la fiche pour les conditions et valeurs inconnues ; Sources & sauvegarde explique la règle du client et ses limites. »
- Conserver mes saisies : « Tes modifications restent dans ce navigateur. Pour les transférer ou revenir à un état enregistré, suis “Sauvegarder et restaurer” dans Sources & sauvegarde. Exporte aussi une sauvegarde avant tout import. »
- `renderSources`, « Sauvegarder et restaurer » : « Dans Blazing Collection, clique sur “Exporter ma sauvegarde” avant un import ou un changement de navigateur. Conserve ce fichier JSON comme point de restauration. Pour retrouver cet état, importe cette sauvegarde complète avec “Importer un fichier JSON”, ou colle son contenu puis clique sur “Importer le JSON collé”. La restauration reprend l’état du fichier ; pour un relevé photo partiel, suis l’étape 5 du parcours ci-dessus. »
- Calculs & précision, stocks personnels : « initialisés à 0 dans une nouvelle box ; ce défaut ne constitue pas une observation. Efface une quantité inconnue. Un relevé photo préserve les anciennes valeurs pour les champs absents ou null ». La suite sur la case vidée inconnue et le manque réel est conservée.
- Références générées, index : « Une seule entrée par familyId est acceptée. Plusieurs vues peuvent documenter un même exemplaire ; ne mélange pas les progressions de copies distinctes. Pour les lots, les exclusions et la livraison, suis le parcours gratuit de Sources & sauvegarde. » Navigation commune : « Blazing Collection · parcours gratuit et sauvegarde ». Titre index : « Blazing Collection — référence d’identification » ; suffixe des titres : « Référence d’import Blazing Collection ».
- README : titre « Blazing Collection » ; section « Ma box et mes captures » réécrite en trois renvois par objectif (préparer, importer, transférer/restaurer), avec stocks neufs à zéro, inconnues, confidentialité, sauvegarde préalable et fusion distincte de restauration. Voir le texte complet directement dans [README](../README.md#ma-box-et-mes-captures).

## Vérifications et limites

`npm.cmd test` : 37 tests réussis, dont stocks neufs, inconnues, fusion partielle sans perte, restauration après import et copie exacte du prompt. `npm.cmd run build` : 1 114 formes, 371 ressources, 182 pages HTML. `node --check app.js` et `git diff --check` réussis.

`scripts/check-guides-browser.mjs` avec Playwright externe : navigateur Chromium sur **9101**, navigation guide → Sources, cinq étapes présentes, liens de l’index servis localement, guide → Plan & stocks ; routes collection/plan/guide/sources à 390 px sans débordement global, aucune erreur JS. Trafic externe bloqué, aucune soumission. Le script ferme navigateur et serveur dans `finally`. Une première assertion de contrôle attendait à tort le titre « Mes stocks » ; corrigée pour le titre réel « Plan & stocks », puis exécution réussie.

Captures dans [issue-48-evidence](issue-48-evidence/) : `guide-desktop.png`, `sources-desktop.png`, `reference-desktop.png`, `guide-mobile.png`, `sources-mobile.png`, `collection-mobile.png`, `plan-mobile.png`. Guide mobile et Sources bureau relus visuellement : textes et boutons lisibles, étapes et panneaux distincts. Les autres captures documentent les routes ; aucune validation exhaustive des 180 pages de personnages ni du service externe ChatGPT n’est revendiquée.

Les règles métier, identifiants, formulaires, prompt et aide validée restent inchangés. Stocks d’un import autonome non observés inconnus ; sur box existante, null/absence préservent l’antérieur, y compris les zéros initiaux. Le guide ne transforme jamais ces valeurs conservées en observations de captures.
