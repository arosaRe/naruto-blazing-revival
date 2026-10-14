# Issue #35 — publication isolée du formulaire

## Autorisation et périmètre

Le PDG confirme avoir vu `ISSUE33-CONTROLE-20261014T215551Z` dans le
salon prévu : [confirmation consignée dans #35](https://github.com/arosaRe/naruto-blazing-revival/issues/35#issuecomment-6179445001).
Il autorise expressément la candidate déjà relue, sous réserve d'une base et
d'un patch inchangés. Cette confirmation concerne #33, pas le nouveau contrôle
public de #35.

Après fetch, `origin/main` vaut exactement
`687740008edb57b224b27c49ff3f3b96ea128d9d`. Le patch conservé dans
`docs/feedback-candidate/candidate.patch` a le SHA-256
`59bbde06a95bc373642e7987eaee273d513ca9e288aeee85f38b854644df2194`.
Reconstruction par `prepare-feedback-candidate.mjs` dans un worktree détaché
hors dépôt ; contrôleur candidat et diff final conformes au manifeste : sept
fichiers, 106 ajouts. Vérification inverse du patch dans l'index après commit
réussie (`git apply --reverse --check --cached`). Aucun ajustement de la
candidate relue. Base contrôlée à nouveau immédiatement avant publication ;
push protégé par la valeur exacte attendue de main, mise à jour linéaire.

Version autorisée : `f6b841367c583560d36bed7b6dc23a3d4eaf8bb5`, également
conservée sur `release/issue-35-feedback`. Aucun merge de nightly, changement
d'import photo, modèle, sauvegardes, stocks ou ressources natives. Les
références déjà présentes en production sont reconstruites telles quelles.

## Pages et vérifications

Workflow existant inchangé : push main, build Node 24, upload de **son seul
dist**, deploy-pages. [Exécution 38644885595](https://github.com/arosaRe/naruto-blazing-revival/actions/runs/38644885595),
déploiement GitHub `7078359579`, artefact `11932061241` (archive ZIP GitHub
SHA-256 `477ca9fc1c4ca4056c5a92df0f783a9f0f36b590a381a4d0572442f6e97e13b3`).
URL : https://arosare.github.io/naruto-blazing-revival/.

Build local réussi : 37 fichiers runtime, 3 067 ressources natives ; scan
des 3 287 fichiers dist sans webhook ni fichiers serveur. Le secret reste
exclusivement dans la configuration serveur ; aucun contenu de clé, secret,
environnement ou journal brut consulté. Les fichiers HTML générés portent la
meta MakeProject Release 33 prévue par le build existant.

Contrôles locaux : `npm.cmd test`, **34/34** ; contrôleur candidat Playwright
réussi sur le port 9101 puis serveur fermé. Stocks neufs : **58 clés à zéro** ;
restauration d'une quantité explicite conservée. Clavier, focus, mobile,
validation, attente et double soumission vérifiés. Succès 200, faux succès
201/204/JSON invalide/ok:false, 400/413/429/500/502/503 et réseau testés avec
transport **simulé**. Texte conservé et aucune nouvelle tentative automatique.
Les quotas IP/globaux, concurrence et mentions neutralisées sont couverts par
les tests du relais à transport simulé ; ils ne prouvent pas une saturation
réelle en production. Pas de rafale Discord.

Le script `scripts/check-feedback-public.mjs` vérifie les octets servis, les
stocks et la sauvegarde dans un navigateur vierge, puis les erreurs interceptées.
Par défaut, aucun POST réel ; un contrôle réel exige un identifiant explicite
et un fichier de preuve créé exclusivement avant la tentative. Ne jamais
effacer cette preuve pour recommencer un envoi incertain.

## VPS préservé

Connexion par la seule clé autorisée, `IdentitiesOnly=yes`, `BatchMode=yes`.
Avant et après publication de main : service active/running, disabled,
PID **274566**, NRestarts **0**, listener privé unique `127.0.0.1:9101`.
Métadonnées du secret : dossier root:root 0700, fichier root:root 0600.
Empreintes `/root/feedback-proxy-29/preserved.sha256` conformes, nouvelles
connexions SSH et `sshd -t` réussis ; `nginx -t` réussi.
Certificat valide du 14 octobre 2026 au 12 janvier 2027, marge de 30 jours
confirmée. Aucune modification de SSH, certificats, sauvegardes, proxy,
renouvellement ou unité ; aucun redémarrage, seconde instance ou enable.

## Restauration conservée

Version précédente : `687740008edb57b224b27c49ff3f3b96ea128d9d`, tag distant
`archive/issue35-before-pages`. Ancien [run Pages 38593456858](https://github.com/arosaRe/naruto-blazing-revival/actions/runs/38593456858),
artefact `11907924995`, téléchargé **avant** publication et avant expiration.
ZIP GitHub : `a300bb12f240eb642a25ca15119ad9a8de577b113c9b6fd8a899289e2b646d11`.
Le ZIP et son contenu TAR ont des empreintes différentes ; le TAR décompressé
de 155 760 640 octets est conservé dans `.git/issue35-rollback/artifact.tar`
et `/home/ubuntu/feedback35-rollback/artifact.tar` sur le VPS (dossier 0700,
fichier 0600). SHA-256 TAR vérifié identique des deux côtés :
`97ff4444a6bc5762b437aec7219a5fa1e7921e9ad10d9d4b2938d2568dca5c94`.

Si retour arrière autorisé : vérifier ce hash et le contenu du TAR, extraire
dans un nouveau dossier, puis republier exclusivement son contenu statique
via upload-pages-artifact/deploy-pages. À défaut, reconstruire le tag précédent
avec Node 24 et le workflow Pages existant. Pour rétablir aussi les sources,
faire relire un revert ciblé de `f6b8413` contre la tête main alors observée,
puis publier ce dist ; aucun reset forcé ou merge global de nightly. Vérifier
la version publique et caches après restauration. L'artefact conservé permet
de comparer les octets plutôt que de se fier au seul statut Actions.
En cas d'incident du relais, suivre l'arrêt ciblé de #33 : ne pas répéter le
contrôle, préserver secret, sauvegardes, HTTPS et SSH ; pas d'activation au boot.
