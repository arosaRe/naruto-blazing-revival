# Candidate isolée — #37, à relire uniquement

Base de production observée après `git fetch origin` :
`f6b841367c583560d36bed7b6dc23a3d4eaf8bb5`, identique à la version publiée
consignée dans [#35](../issue-35-publication.md). La branche de cette PR part
de nightly ; ses outils et preuves ne sont pas un patch global pour main.
La candidate de production est exclusivement `candidate.patch` appliqué à
la base exacte du manifeste dans un worktree détaché.

Le patch remplace une seule ligne de `scripts/build-import-reference.mjs` :
il insère `<meta name="generator" content="MakeProject · Release 33">`
immédiatement après `<head>` dans le layout partagé. Aucun autre octet source
ne change. Le générateur de nightly possède déjà cette balise et reste inchangé.
Le SHA-256 du patch est
`5915819b71a69174c67c1b40225fe4330bcf82b84683d8f667e41c85a0433981`.
L'attribut Git `-text` préserve les octets du patch sur Windows et Linux.

## Reproduction

Avec Node 24 et Python 3, depuis cette branche, choisis un dossier inexistant
hors du dépôt. Aucun téléchargement npm ni serveur n'est nécessaire.

```powershell
git fetch origin
node scripts/check-generator-candidate.mjs "$env:TEMP/generator37-review-new"
```

Le contrôleur refuse une base origin/main différente, une empreinte incorrecte,
un dossier existant ou un diff source qui dépasse l'insertion exacte. Il crée
deux worktrees détachés depuis la même base, applique le patch uniquement dans
`candidate/`, puis exécute dans chacun la commande Node derrière `npm run build`.
Les variables `SITE_BASE_URL` et `FEEDBACK_ENDPOINT` sont retirées des deux
environnements enfants afin d'utiliser les mêmes valeurs de production par
défaut. Les builds s'exécutent au premier plan. Les dossiers, dist et rapport
`comparison.json` restent disponibles pour la revue ; le script ne supprime rien.

Il compare la liste complète des fichiers dist puis leurs octets sans
normalisation CRLF/LF. Pour chaque référence, la base doit être sans la balise
et la candidate doit restituer exactement la base après retrait de cette seule
balise. Chaque HTML, index inclus, doit avoir exactement une meta generator
dans son head et la valeur attendue. Tous les autres fichiers doivent être
strictement identiques. Une assertion échouée arrête le contrôle avec code non nul.
Le rapport consigne les deux SHA-256 pour chaque fichier, y compris chaque page.

## Preuves et limites

Le rapport versionné `comparison.json` provient des deux builds Windows locaux,
Node 24.19.0 et Python 3.12.10 : **182 références contrôlées**, chacune avec
exactement une balise attendue ; **183 HTML contrôlés** en incluant l'index.
Sur **3 287 fichiers**, les **3 105 autres fichiers sont identiques octet par
octet**. Les deux builds ont réussi et toutes les assertions ont passé.
Il compare les builds sous le même environnement,
pas les octets servis actuellement par Pages ni ceux d'un build Linux futur.
Pour une publication future autorisée, refaire le contrôle sur la base alors
observée ; si elle diffère, préparer et faire relire une nouvelle candidate.
La fusion de cette PR dans nightly ne vaut pas autorisation de publication.

Les sources et documents antérieurs restent inchangés :
`docs/feedback-candidate/`, `docs/issue-35-publication.md` et le générateur nightly.
Empreintes locales revérifiées, sans modifier les fichiers conservés :

| Preuve antérieure | SHA-256 |
| --- | --- |
| Patch feedback | `59bbde06a95bc373642e7987eaee273d513ca9e288aeee85f38b854644df2194` |
| `.git/issue35-published/artifact.tar` | `21be6f8fe0bee1b2b62c68838c66f1bb7658b981583eb256c378ef8ecb31fa39` |
| `.git/issue35-rollback/artifact.tar` | `97ff4444a6bc5762b437aec7219a5fa1e7921e9ad10d9d4b2938d2568dca5c94` |
| `.git/issue35-public-control.json` | `7e0054703326659da0fea0583519adca2dbbe0b46bf50f724f74ebba0053f8ac` |

Aucun import photo, prompt, modèle, sauvegarde, stock, lancement ou workflow
n'est modifié. Aucune écriture sur main, publication, accès VPS ou requête
Discord n'est effectué. Le constat humain encore attendu dans #35 reste attendu.
