# Candidate isolée — #31

Cette PR vers `nightly` livre un patch et des contrôles, sans publier le site.
La candidate part de `origin/main` au commit exact
`687740008edb57b224b27c49ff3f3b96ea128d9d` (production observée après fetch).
Le manifeste versionné fixe cette base, les sept fichiers autorisés, l'URL
publique et le SHA-256 du patch. Le script travaille en HEAD détachée dans un
nouveau dossier ; il ne modifie aucune branche et refuse un dossier existant.

## Manifeste des adaptations

| Fichier candidat | Changement |
| --- | --- |
| `feedback.js` | Formulaire existant repris tel quel de nightly : validation, requête JSON, attente, confirmation, erreurs et conservation du texte. |
| `feedback-config.js` | Module public existant ; valeur vide dans les sources, remplacée au build. |
| `app.js` | Seulement les trois lignes d'import et de montage du formulaire. |
| `index.html` | Bouton, dialogue existant et meta generator MakeProject Release 33. |
| `player-experience.css` | Seulement les règles du formulaire existant en fin de fichier. |
| `SITE_FILES.json` | Seulement les deux modules feedback ajoutés à la liste publique. |
| `scripts/build-github-site.mjs` | Validation HTTPS et génération de la configuration publique ; valeur par défaut exacte `https://retours.179-237-102-19.sslip.io/feedback`. |

`style.css` ne nécessite aucune adaptation. L'extraction native et la génération
des références déjà présentes dans main restent identiques. Aucun changement
nightly d'import photo, prompt, référence, modèle, sauvegarde ou stock n'est
repris. Les références déjà en production restent dans le build de production.
La génération de la configuration est nécessaire car la configuration source
du formulaire existant ne contient aucune destination. `FEEDBACK_ENDPOINT`
peut toujours remplacer la valeur par défaut ; le contrôle candidat exige
l'URL exacte du manifeste, donc ne pas définir cette variable pour ces essais.
`lancer.json` et `CLAUDE.md` restent compatibles : build puis serveur Python.

## Reproduction et vérification (PowerShell, Windows)

Depuis cette branche, Node 24 et Python 3 disponibles ; utilise un nouveau
dossier hors du dépôt. Les artefacts dist et outils navigateur restent hors Git.

```powershell
git fetch origin
node scripts/prepare-feedback-candidate.mjs "$env:TEMP/feedback31-candidate"
Push-Location "$env:TEMP/feedback31-candidate"
Remove-Item Env:FEEDBACK_ENDPOINT -ErrorAction SilentlyContinue
npm.cmd run build
git -c core.whitespace=cr-at-eol diff --check
git diff --stat
Pop-Location
npm.cmd install --prefix "$env:TEMP/feedback31-browser-tools" playwright@1.58.2 --no-audit --no-fund
node "$env:TEMP/feedback31-browser-tools/node_modules/playwright/cli.js" install chromium
$env:PLAYWRIGHT_MODULE = "$env:TEMP/feedback31-browser-tools/node_modules/playwright"
node scripts/check-feedback-candidate.mjs "$env:TEMP/feedback31-candidate"
```

Le contrôleur lance et ferme lui-même Python sur **127.0.0.1:9101**, au premier
plan pour l'ensemble du test. Ne pas utiliser le port projet 8101. Playwright
est un outil externe de vérification, pas une dépendance du site. Le contrôleur
lit uniquement cette candidate, jamais le dist de nightly : base et liste des
diffs, app hors montage et CSS hors formulaire identiques à main, liste publique
préservée, URL exacte, scan récursif de tous les fichiers dist, stocks neufs à
zéro et sauvegarde existante conservée. Les requêtes hors localhost sont
interceptées ; aucune connexion à la destination publique ni serveur relais
n'est lancée. Les réponses et mentions de réception Discord dans l'interface
sont **simulées** pendant ces tests.

## Résultats locaux

Candidate reconstruite par le script depuis la base fixée le 14 octobre 2026,
Node 24.19.0, Python 3.12.10. Build réussi : 37 fichiers runtime, 3 067 ressources
natives extraites ; les références préexistantes sont générées sans adaptation.
Contrôle de 3 287 fichiers dist sans webhook ni fichiers serveur ; 58 stocks
pris en charge à zéro et quantité explicite de sauvegarde conservée.
Playwright 1.58.2, Chromium 145.0.7632.6 : parcours navigateur réussi sur le dist
de cette candidate. Clavier Entrée/Tab/Shift+Tab/Échap, retour du focus,
libellé obligatoire, statut aria-live, largeur mobile 390 px, validation vide
et dépassement UTF-16, attente/double soumission, 200 simulé, refus de faux
succès 201/204/JSON invalide/ok:false, 400/413/429/500/502/503 et coupure réseau,
texte conservé, aucune répétition automatique et nouvelle tentative manuelle.
Aucune erreur JavaScript non interceptée. Serveur de test fermé en fin d'essai.
Les CRLF déjà versionnés dans certains fichiers de main sont préservés ;
`cr-at-eol` permet de contrôler les espaces sans les signaler comme erreurs.
L'attribut Git `-text` du patch garantit ses octets et son SHA-256 sur Windows
comme sur Linux ; il ne fait pas partie du patch de production.

## Étapes restantes — aucune réalisée dans #31

1. Relire le patch et le manifeste. Avant toute publication, comparer de nouveau
   `origin/main` à la base fixée ; si la production a avancé, régénérer et vérifier
   une nouvelle candidate, sans appliquer aveuglément ce patch. La fusion de
   cette PR vers nightly ne publie pas et n'autorise pas la fusion de nightly
   entière vers main.
2. Dans un **terminal SSH privé interactif sans enregistrement**, suivre la
   [procédure d'injection existante](../issue-25-service-interne.md) : arrêter
   `feedback-relay.service`, puis exécuter
   `sudo /usr/bin/python3 /etc/feedback-relay/inject-secret.py`. Saisie masquée
   getpass ; stockage atomique root:root 0600 dans le dossier 0700. Ne jamais
   lire, copier ou afficher le secret, ni le placer dans Git, commandes, logs
   ou conversation. Cette étape ne démarre pas le service.
3. Après autorisation d'activation, vérifier la configuration publique HTTPS
   et la frontière proxy documentées dans [#29](../issue-29-https-proxy.md),
   origine autorisée `https://arosare.github.io`, écoute privée 127.0.0.1:9101,
   service unique. Démarrer le service suivant #25, contrôler son état et les
   erreurs sans afficher l'environnement. L'activation au démarrage reste une
   décision distincte. Aucun accès VPS n'a été effectué ici ; l'état arrêté
   sans secret communiqué par #31 est laissé intact, pas revérifié à distance.
4. Faire un essai HTTPS réellement autorisé avec un texte identifié sans donnée
   personnelle. Vérifier 200 `{ "ok": true }` **et** présence effective du même
   message dans le salon Discord attendu, mentions neutralisées. Consigner
   date, statut et constat humain, sans webhook ni contenu privé. Pour un essai
   navigateur avant publication, autoriser temporairement et explicitement une
   origine de préproduction, puis la retirer ; l'origine locale du test simulé
   n'est pas autorisée par la configuration production. Ne pas simuler cette
   étape et la présenter comme une réception réelle.
5. Après ces contrôles et relecture/approbation humaine de production, préparer
   une branche de publication depuis **la base main approuvée**, avec uniquement
   le patch. Reconstruire, vérifier, revoir le diff contre main et publier
   uniquement son dist via le mécanisme Pages existant. Garder l'artefact et le
   commit antérieurs comme point de restauration. Le contrôle navigateur public
   et la réception Discord réelle après publication restent à faire. Aucun
   commit, push, merge main ni déclenchement de déploiement n'est fait ici.

## Retour arrière

Avant publication, la candidate est jetable : conserver le patch versionné,
puis `git -C <depot> worktree remove --force <dossier-candidate>` après avoir
vérifié le chemin et l'absence de travail personnel dans ce dossier. Cela ne
touche pas main, nightly ou le site public. Le script ne supprime rien lui-même.

Après une publication future, restaurer l'artefact Pages précédemment conservé
ou reconstruire le commit de production antérieur fixé et republier son dist,
uniquement après autorisation de production. Si main a reçu le commit du
formulaire, créer un revert ciblé de ce seul commit via revue, sans reset forcé
ni retour arrière des imports/ressources étrangers. Invalider les caches et
contrôler la version effectivement servie. Si le relais a été activé ensuite,
arrêter/désactiver seulement `feedback-relay.service` selon #25 ; conserver les
sauvegardes, HTTPS, SSH et autres services. Le traitement privé du secret après
arrêt appartient à l'administrateur, jamais à l'artefact statique.
