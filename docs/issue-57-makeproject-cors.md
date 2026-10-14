# #57 — correction préparée, CORS local hors périmètre

Branche dédiée depuis `nightly`. Aucun POST public ou Discord, accès SSH, changement du serveur actif, déploiement ou modification de `main`. Aucun serveur lancé sur 8101. `lancer.json` conserve son endpoint public et `%PORT%`.

## État actuel après #61

**Décision du 15.10.2026 à 01:54** : le PDG confirme le fonctionnement du formulaire public. MakeProject local n’est pas demandé et n’a aucun effet sur la clôture ; le déploiement CORS `localhost:8101/9101` est refusé. Confirmation attribuée aux **consignes du PDG fournies au cycle manager**, consignées dans [#61](https://github.com/arosaRe/naruto-blazing-revival/issues/61), `etat.md` et `journal.md`, sans lien original de discussion ni preuve indépendante nouvelle. La réserve acceptée sur l’absence de notification de mention indésirable **non vérifiée** reste maintenue. L’audit indépendant final reste à effectuer.

La correction #59 reste fusionnée sur `nightly`, sans activation distante. Aucune approbation CORS n’est attendue pour la clôture. Voir la [grille des sept critères](criteres-cloture.md#grille-pour-laudit-indépendant-final--61).

## Les quatre critères de #57 — résultats historiques

1. Configuration validée puis relais local sur 9101 : les deux origines explicitement listées reçoivent OPTIONS 204, origine CORS exacte, POST et Content-Type autorisés, corps vide. Ports voisins, origine distante non listée et valeurs malformées refusés sans en-tête d’autorisation. Aucune transmission sortante.
2. Régressions de configuration : HTTP distant, alias IP, joker, chemin, identifiants, query, fragment, casse et port non canoniques refusés. Une liste HTTPS seule n’active pas les exceptions locales. Les tests existants couvrent toujours secrets masqués, destinations strictes, validations, quotas, proxy et `allowed_mentions` neutralisé. Ces transmissions utilisent un serveur simulé local, jamais Discord.
3. `node scripts/check-feedback-preflight.mjs` : deux OPTIONS réseau réels, sans interception ni POST, statut et tous les en-têtes rapportés. À 2026-10-14T23:37:09Z (15 octobre, Zurich), les deux origines reçoivent **400**. En-têtes communs : `cache-control: no-store, no-store`, `connection: keep-alive`, `content-type: application/json`, `date: Wed, 14 Oct 2026 23:37:09 GMT`, `server: nginx`, `transfer-encoding: chunked`, `vary: Origin`, `x-content-type-options: nosniff, nosniff`. Aucun `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` ou `Access-Control-Allow-Headers`. Code de sortie **1**, blocage explicite. La disponibilité réelle n’est pas validée.
4. `npm.cmd test` : 40/40 ; `npm.cmd run build` : réussi. Le contrôle Windows a été exécuté avec Playwright externe et la commande réelle du launcher sur 9101 : clavier, focus, validation, confirmation/429/503/panne simulés passent. Ses POST sont interceptés ; les confirmations ne prouvent aucune réception Discord. Résultat global **code 1**, car les prévols publics échouent. Le serveur du launcher a été arrêté et la libération de 9101 vérifiée par réécoute ; 8101 préservé.

## Procédure historique proposée — refusée à 01:54, non exécutée

Les étapes suivantes conservent la proposition initiale pour traçabilité ; elles ne constituent plus une demande d’accord ni une procédure à exécuter dans le périmètre actuel.

1. Sauvegarder la cible actuelle du lien `/opt/feedback-relay/current` et `/etc/feedback-relay/config.env` dans un emplacement administrateur protégé. Ne pas afficher ni copier `secret.env` dans les logs ou le dépôt.
2. Installer uniquement le nouveau `relay/server.mjs` dans une nouvelle release identifiée par le commit approuvé, sous `/opt/feedback-relay/releases/<commit>/server.mjs`, avec `SOURCE_COMMIT`. Conserver l’ancienne release pour retour arrière.
3. Dans le fichier protégé `/etc/feedback-relay/config.env`, conserver toutes les origines HTTPS autorisées existantes et ajouter uniquement `http://localhost:8101,http://localhost:9101` à `FEEDBACK_ORIGINS`. Exemple si l’origine Pages est la seule existante :

   ```text
   FEEDBACK_ORIGINS=https://arosare.github.io,http://localhost:8101,http://localhost:9101
   ```

   Conserver droits root:root 0600, `FEEDBACK_HOST=127.0.0.1`, port interne, proxy de confiance et secret existants. Aucun changement Nginx, firewall, certificat ou launcher nécessaire pour cette correction.
4. Sélectionner atomiquement la nouvelle release avec `current`, puis redémarrer uniquement `feedback-relay.service`. Cette activation du service constitue le déploiement soumis à approbation. Aucun changement d’unité, donc pas de daemon-reload nécessaire. Les quotas en mémoire se réinitialisent lors du redémarrage.
5. Rejouer uniquement `node scripts/check-feedback-preflight.mjs` : exiger 204 et les trois en-têtes CORS corrects pour les deux origines. Vérifier aussi le refus d’une origine non listée. Ne pas envoyer de POST de vérification. Un prévol réussi prouve le contrat CORS, pas la livraison Discord.

Retour arrière : restaurer le lien vers l’ancienne release et le fichier `config.env` sauvegardé avec ses droits, redémarrer uniquement le service, puis vérifier les OPTIONS sans POST. Le refus MakeProject peut alors réapparaître et doit rester signalé. Aucun secret à renouveler pour cette correction.

**Décision prise à 01:54 : déploiement du module et des deux ajouts CORS refusé. Rien de cette procédure n’a été exécuté. L’échec local historique ne bloque plus la clôture ; l’audit indépendant final reste à effectuer.**
