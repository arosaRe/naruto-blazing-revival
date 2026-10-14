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
Exécution et déploiement **success**, statut enregistré le 14 octobre 2026 à
22:05:58 UTC. TAR déployé conservé dans `.git/issue35-published/artifact.tar`,
SHA-256 `21be6f8fe0bee1b2b62c68838c66f1bb7658b981583eb256c378ef8ecb31fa39`.

Build local réussi : 37 fichiers runtime, 3 067 ressources natives ; scan
des 3 287 fichiers dist sans webhook ni fichiers serveur. Le secret reste
exclusivement dans la configuration serveur ; aucun contenu de clé, secret,
environnement ou journal brut consulté. L'index porte la meta MakeProject
Release 33. Limite préexistante de la candidate approuvée : les 182 références
HTML générées depuis main ne portent pas cette meta. Le générateur de nightly
la prévoit déjà ; il n'a pas été ajouté au patch autorisé. Corriger ces pages
en production changerait le périmètre relu et nécessite une nouvelle candidate
et sa relecture. Aucune adaptation supplémentaire publiée.

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

## Parcours public et cinq critères d'acceptation

Chromium 145 / Playwright 1.58.2 sur l'URL publique après déploiement : octets
de l'index, app, feedback, configuration, CSS, modèle et profil strictement
identiques au TAR **réellement déployé**. La première comparaison avec le dist
Windows a échoué sur CRLF/LF ; aucun message réel n'avait été envoyé. La
comparaison avec l'artefact Linux réussit sans normalisation ni modification.
Navigateur vierge : stocks persistés tous à zéro ; sauvegarde synthétique
`ryo=12345` rechargée et conservée à l'identique pendant erreurs et envoi.
Mobile 390 px, formulaire accessible, focus restauré, validation vide, sept
erreurs HTTP/réseau **interceptées et simulées**, double soumission bloquée,
texte conservé, pas de nouvelle tentative automatique. Aucun appel au relais
pour ces scénarios, aucune saturation des quotas publics.

Un seul POST valide réel depuis le formulaire public, le **14 octobre 2026
à 22:07:30 UTC** (15 octobre 00:07:30 en Suisse), contenant uniquement :
**`ISSUE35-CONTROLE-20261014T220717Z`**. HTTP **200**, `{"ok":true}`,
confirmation affichée « Merci ! Ton retour a été reçu par Discord. », champ
vidé, sauvegarde inchangée, aucune erreur JavaScript non interceptée. Preuve
locale `.git/issue35-public-control.json`, réservée avant la tentative unique.
Cela établit la réponse réelle du relais et l'interface ; pas le constat
visuel du salon. Aucun accès au salon disponible, aucun nouvel envoi pour
obtenir le constat. Les mentions neutralisées sont contrôlées par les tests
du module serveur déjà déployé, pas observées visuellement dans le salon ici.

| Critère #35 | Résultat et limite |
| --- | --- |
| 1 | Satisfait : confirmation humaine #33 consignée ; base exacte, patch et diff inchangés de la candidate relue. |
| 2 | Satisfait : version, run, déploiement et artefact identifiés ; seul dist isolé publié, sans secret ni ajout d'import photo. |
| 3 | Satisfait dans les contrôles décrits : parcours public et confirmation réels ; erreurs/quotas et concurrence simulés ; stocks zéro et sauvegarde contrôlés dans le navigateur public. Les limites proxy réelles documentées en #33 ne sont pas saturées à nouveau. |
| 4 | Attente explicitement consignée : réponse API positive, contrôle public identifié ; constat humain du salon requis, sans répétition. |
| 5 | Satisfait : version et artefact précédents conservés, procédure ci-dessous ; préservation VPS contrôlée. |

**Le critère 6 global reste ouvert et n'est pas déclaré satisfait.** Le PDG
doit constater dans le salon prévu `ISSUE35-CONTROLE-20261014T220717Z`, y
compris l'absence de mention effective ; ne pas renvoyer ce message. La
confirmation précédente de #33 ne remplace pas cette observation publique.
Build de nightly également réussi pour la PR de compte rendu ; il n'est pas
publié. `lancer.json` et `CLAUDE.md` restent alignés et inchangés.

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
