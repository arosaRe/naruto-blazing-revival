# Naruto Blazing Revival

Site statique public : https://arosare.github.io/naruto-blazing-revival/

GitHub Pages héberge gratuitement cette version du site. Choisis `GitHub Actions`
dans Settings → Pages ; chaque push sur `main` reconstruit et publie le site.

## Ma box et mes captures

La version publique démarre avec une box vide et des stocks inconnus. Les saisies
restent dans le stockage local de ton navigateur ; elles ne sont envoyées ni à
GitHub ni au jeu. Exporte régulièrement une sauvegarde JSON pour les conserver.

Pour lire tes captures avec ChatGPT, utilise le [prompt d’import](https://arosare.github.io/naruto-blazing-revival/import-box-prompt.txt)
et la [référence publique](https://arosare.github.io/naruto-blazing-revival/reference-pour-chatgpt.html).
Vérifie les identifications proposées avant d’importer le JSON dans le site.
Les données illisibles et ambiguïtés restent à renseigner.

Pour transférer une box depuis l’ancien site : exporte sa sauvegarde JSON, ouvre
Sources & sauvegarde sur GitHub Pages puis importe le fichier. Le profil devient
personnel ; tes personnages, niveaux, stocks et notes sont conservés. Les anciennes
photos et confirmations du compte de démonstration ne sont pas réappliquées.

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
