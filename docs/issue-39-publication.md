# Issue #39 — publication exclusive de la candidate generator

Autorisation du PDG du 15 octobre 2026 à 00:35 (Europe/Zurich), consignée
dans [#39](https://github.com/arosaRe/naruto-blazing-revival/issues/39).
La production publiée est `87ff642e376472dcae684af4b42dcac29c10deda`, conservée
sur `release/issue-39-generator`. Sa seule différence source avec son parent
`f6b841367c583560d36bed7b6dc23a3d4eaf8bb5` est l'insertion exacte de
`<meta name="generator" content="MakeProject · Release 33">` après `<head>`
dans le layout partagé de `scripts/build-import-reference.mjs`.
Pas de fusion de nightly, ni de modification d'import photo.

## Base, empreinte et reproduction

Après fetch, puis à nouveau immédiatement avant publication, origin/main
correspond à la base exacte autorisée. SHA-256 du patch relu inchangé :
`5915819b71a69174c67c1b40225fe4330bcf82b84683d8f667e41c85a0433981`.
`scripts/check-generator-candidate.mjs` exécuté avec Node 24.19.0 et Python
3.12.10 dans `%TEMP%/generator39-publication` : deux builds réussis,
182 références changées seulement par la balise, 183 HTML avec exactement
une balise attendue, 3 105 autres fichiers identiques, 3 287 au total.
[Rapport complet](issue-39-evidence/comparison.json).
Worktrees et builds conservés ; aucun téléchargement npm requis.

Le commit isolé a été contrôlé par application inverse du patch dans l'index
(`git apply --reverse --check --cached`). Push linéaire protégé par
`--force-with-lease=refs/heads/main:f6b841367c583560d36bed7b6dc23a3d4eaf8bb5`.
La branche de compte rendu part de nightly et sa PR vise nightly ; seuls le
commit isolé et son dist sont publiés sur main.

## Déploiement et contrôle des octets

[Workflow Pages 38649148600](https://github.com/arosaRe/naruto-blazing-revival/actions/runs/38649148600)
réussi sur le commit `87ff642e376472dcae684af4b42dcac29c10deda`.
Déploiement `7078998962`, état success le 14 octobre 2026 à 22:40:17 UTC.
Site : https://arosare.github.io/naruto-blazing-revival/.
Workflow existant inchangé, upload de son seul dist puis deploy-pages.
Artefact `11933876359`, ZIP GitHub SHA-256
`8f2a1c285f777a811723f6b7887d36c3bc8f6d0c2bebdb60ba06f2c9e6c53177`.
TAR téléchargé conservé dans `.git/issue39-published/artifact.tar`, SHA-256
`744d3c4dac00844455af7e1e3af0836fb88ff207748c803446197e90f0b265ca`.
Les métadonnées sont conservées dans [les preuves](issue-39-evidence/).

Contrôle reproductible, uniquement GET :

```powershell
python scripts/check-generator-public.py .git/issue35-published/artifact.tar .git/issue39-published/artifact.tar docs/issue-39-evidence/public-comparison-new.json
```

Le contrôleur compare les listes et octets des deux TAR réellement déployés,
puis chaque fichier public au nouveau TAR, sans normalisation CRLF/LF.
La comparaison des artefacts Linux confirme aussi le delta exact des
182 références et l'identité des 3 105 autres fichiers.
Le [rapport public](issue-39-evidence/public-comparison.json) conserve les
empreintes attendues et reçues pour chacun des 3 287 fichiers.
Limite : observations HTTP ponctuelles avec paramètre anti-cache depuis ce
poste ; elles ne prouvent pas chaque point de présence CDN ni cache navigateur.
Aucun parcours de soumission, POST Discord ou accès au secret.

## Preuves précédentes et retour arrière

[Le rapport #35](issue-35-publication.md), `docs/feedback-candidate/` et
`docs/generator-candidate/` restent inchangés. Empreintes précédentes revérifiées :

| Preuve | SHA-256 |
| --- | --- |
| Patch feedback | `59bbde06a95bc373642e7987eaee273d513ca9e288aeee85f38b854644df2194` |
| TAR #35 publié | `21be6f8fe0bee1b2b62c68838c66f1bb7658b981583eb256c378ef8ecb31fa39` |
| TAR retour arrière #35 | `97ff4444a6bc5762b437aec7219a5fa1e7921e9ad10d9d4b2938d2568dca5c94` |
| Contrôle public #35 | `7e0054703326659da0fea0583519adca2dbbe0b46bf50f724f74ebba0053f8ac` |

Version précédente pour ce déploiement : `f6b841367c583560d36bed7b6dc23a3d4eaf8bb5`,
tag distant `archive/issue39-before-pages`, branche `release/issue-35-feedback`.
Son TAR est déjà conservé dans `.git/issue35-published/artifact.tar` avec le
SHA-256 ci-dessus. Si retour arrière autorisé, vérifier cette empreinte,
extraire dans un dossier neuf puis republier exclusivement ce contenu statique
par upload-pages-artifact/deploy-pages. Autre possibilité : faire relire un
revert ciblé de `87ff642` sur la tête main alors observée, puis publier avec
le workflow existant. Aucun reset forcé ni fusion globale de nightly.
Recontrôler les octets publics et l'état du déploiement après restauration.
L'ancienne restauration #35 reste disponible sans écrasement.

## Acceptation

| Critère #39 | Preuve |
| --- | --- |
| 1 | Commit isolé : insertion exacte dans le seul layout partagé. |
| 2 | Contrôleur officiel réussi : 182 références, 183 HTML, 3 105 fichiers identiques. |
| 3 | Pages success sur le commit identifié ; comparaison intégrale des artefacts et des octets publics, limites CDN explicites. |
| 4 | Présent rapport versionné, preuves antérieures préservées, restauration conservée. |

La réception Discord confirmée est distincte de l'absence de mention :
**l'absence de mention reste non vérifiée et le critère 6 global reste ouvert**.
Aucun nouveau message de contrôle envoyé. Aucun accès VPS ou secret nécessaire.
