# Blazing Collection

## Formulaire de retours

La navigation propose « Envoyer un retour ». Seul le message saisi est envoyé,
sans box, sauvegarde, cookie ni stockage local. Le relais confirme la réception
uniquement par HTTP 200 avec `ok: true`. Le texte reste disponible après erreur ;
aucune relance automatique n’est effectuée.

Le build lit `FEEDBACK_ENDPOINT`, URL publique HTTPS du relais (par exemple
`https://relay.example/feedback`), et génère `dist/feedback-config.js`.
Sous PowerShell : `$env:FEEDBACK_ENDPOINT='https://relay.example/feedback'; npm.cmd run build`.
Une URL invalide fait échouer le build. Sans variable, le formulaire explique
l’indisponibilité et désactive l’envoi. `feedback-config.js` reste vide par défaut
dans les sources ; ne configure jamais un webhook dans le frontend ou le build.
Le relais doit autoriser l’origine du site ; voir [son contrat](relay/README.md).

Vérification locale : `npm test`, `npm run build`, puis
`node scripts/check-feedback-dist.mjs`. Pour les essais navigateur, installe
Playwright **hors du dépôt**, avec Chromium (`playwright install chromium`), puis
définis `PLAYWRIGHT_MODULE` sur le dossier absolu du module `playwright` contenant
`index.mjs`. Exécute `node scripts/check-feedback-browser.mjs` après un build sans
`FEEDBACK_ENDPOINT`. `PLAYWRIGHT_CHANNEL` est facultatif pour un navigateur installé.
Le script sert le site sur 9101, ouvre des ports loopback éphémères pour le relais
et Discord simulé, intercepte l’URL HTTPS fictive et ferme ses serveurs à la fin.
Aucun secret réel ni déploiement : clavier, labels, statuts, mobile, validation,
doubles envois, succès, erreurs et reprise manuelle sont vérifiés. Les captures
`issue16-desktop.png` et `issue16-mobile.png` sont écrites dans le dossier temporaire.

Site statique public : https://arosare.github.io/naruto-blazing-revival/

GitHub Pages héberge gratuitement cette version du site. Choisis `GitHub Actions`
dans Settings → Pages ; chaque push sur `main` reconstruit et publie le site.

## Ma box et mes captures

Blazing Collection démarre avec une box vide et des stocks initialisés à zéro.
Ces zéros ne sont pas des observations du jeu : efface une quantité inconnue.
Les saisies restent dans ton navigateur, sans envoi à GitHub ni au jeu.

- Pour préparer tes ressources : ouvre [Guide & missions](https://arosare.github.io/naruto-blazing-revival/#guide).
- Pour importer tes captures : suis le parcours gratuit de [Sources & sauvegarde](https://arosare.github.io/naruto-blazing-revival/#sources), point de référence pour le prompt validé, les références, les lots, les limites et les imports partiels. Les observations illisibles restent inconnues ; elles ne remplacent pas les valeurs antérieures lors d’un import photo.
- Pour transférer ou restaurer ta box : suis « Sauvegarder et restaurer » sur cette même page. Exporte une sauvegarde avant tout import. Une sauvegarde complète restaure l’état du fichier ; un relevé photo fusionne les valeurs connues.

Une sauvegarde de l’ancien site peut être restaurée au même endroit : le profil
devient personnel, sans réappliquer les photos et confirmations du compte de démonstration.

## Construction

Prérequis locaux : Node.js 24 et Python 3 (bibliothèque standard, aucune installation npm).

```sh
npm run build
```

`SITE_BASE_URL` peut définir une autre racine HTTPS (ou localhost HTTP).
La sortie est `dist/`. Les fichiers du frontend restent à la racine du dépôt ;
les pages HTML d’identification et la référence JSON sont générées au build.

Les 3 067 images et polices natives sont archivées dans des morceaux de 20 MiB.
Le build vérifie les SHA-256 des morceaux, de l’archive et de chaque fichier,
le CRC ZIP et les chemins avant extraction. `ASSETS.json` décrit l’ordre exact.
Le ZIP est reproductible : noms triés et dates fixées.

Les références de disponibilité et voies gratuites décrivent les données
documentées ; elles ne garantissent pas l’activité actuelle des missions/boutiques.
Les sources et limites des calculs sont disponibles dans le site.
