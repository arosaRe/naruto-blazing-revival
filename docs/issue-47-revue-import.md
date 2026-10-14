# #47 — Textes et preuves pour revue

Vérification du 15 octobre 2026. Textes proposés : `import-box-prompt.txt` (texte complet à copier/télécharger) et `photoImportPanel()` dans `app.js` (mode d’emploi dans Sources & sauvegarde). La refonte générale des guides reste à #48.

## Capacités gratuites vérifiées

Sources officielles ouvertes à cette date :
- [FAQ offre gratuite](https://help.openai.com/en/articles/9275245-chatgpt-free-tier-faq) : recherche web, images/fichiers et analyse accessibles gratuitement ; limites d’outils séparées. Le choix gratuit affiché suffit ; aucun modèle ou niveau de réflexion imposé.
- [Fichiers et limites](https://help.openai.com/en/articles/8555545-file-uploads-faq) : disponibilité selon compte/client, limites pouvant diminuer en période de pointe. La page annonce actuellement 3 fichiers/jour en gratuit et 20 Mo/image : ce ne sont pas des garanties de capacité de traitement. Les textes évitent de figer un quota. La récupération des images dans un PDF n’est pas garantie dans l’offre gratuite : joindre directement les images.
- [Images](https://help.openai.com/en/articles/8400551-chatgpt-image-inputs-faq) : images accessibles en gratuit sous limites et paramètres de compte ; ajout possible dans plusieurs messages. Aucune garantie de précision ni de fichier final téléchargeable.

Les textes proposent de patienter à la limite, de conserver un relevé après chaque lot et de reprendre en texte. Aucun achat suggéré. Aucune connexion à un compte ChatGPT personnel, aucun essai de quota revendiqué.

## Concordance à relire

| Point | Prompt et aide |
| --- | --- |
| Références | Index, ressources, JSON et schéma ; repli par fichiers ou extraits si liens inaccessibles ; référence distincte du compte. |
| Captures | Images directes, vues générales avec recouvrement, fiches d’identité/progression et libellés/quantités de stocks. |
| Lots et reprise | Images L1-I1, relevé intermédiaire complet avec sources par champ, lots traités/restants, copie choisie, ambiguïtés ; nouvelle conversation avec prompt + références + dernier relevé ; images manquantes à joindre à nouveau. |
| FIN | Toujours requis, même pour un lot ; seuls les lots traités sont consolidés. |
| Limites natives | Rapport validé `docs/issue-46-preuves-natives.md` : contours non établis, badges conditionnels, vitesse inconnue avec Ultimate ordinaire, niveaux natifs distincts du site, doublons non représentables, tokens distinct d’une monnaie premium non identifiée. |
| Champs | Tous les champs photo, familles de stocks, bonus distincts des totaux, EXP dans le niveau et plafond acheté ; détails numériques dans le prompt. Aucun identifiant déduit d’un portrait ambigu. |
| Livraison | Relevé incomplet explicite et exclusions en notes, téléchargement ou bloc JSON complet à enregistrer en UTF-8 ; sauvegarde préalable et contrôle après import. |

## Preuves exécutées

`tests/import-prompt.test.js` exécute la fonction réelle de copie dans un environnement simulant seulement les effets navigateur : presse-papiers disponible puis indisponible. Les deux résultats sont strictement égaux au fichier source, fin de ligne comprise. Le lien de téléchargement cible ce fichier ; le build le recopie sans modification. Suppression du `trim()` appliqué au contenu copié, qui causait un écart avec le téléchargement.

Le même test construit un JSON exclusivement synthétique : forme existante du catalogue, level=1, atk=0, xp/hp/speed/abilities/luck/unlockedCap=null, ryo=12, tokens=null et note de couverture partielle. Il passe par `JSON.stringify`/`JSON.parse`, puis par `importPhotoBox` réel avec le catalogue réel. Sur nouveau compte, les inconnues restent null et tokens absent. Sur compte synthétique existant, hp/luck antérieurs, tokens, stone et un autre personnage possédé sont préservés ; la valeur zéro explicite est appliquée et l’état source n’est pas muté. Les valeurs de ce test ne sont pas des observations de compte.

Validation : `npm.cmd test` : 37 tests réussis ; `npm.cmd run build` : 1 114 formes, 371 ressources, 182 pages générées ; `node --check app.js` et `git diff --check` réussis. Les tests du relais existants utilisent des simulations locales, aucun envoi Discord réel. Pas de test visuel navigateur revendiqué.

Aucun fichier personnel du PDG consulté, aucun import personnel, envoi Discord ou publication du site. Seule la branche de revue est poussée, PR vers nightly.
