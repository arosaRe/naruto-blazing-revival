# Issue #33 — mise en service du relais

Intervention du 14 octobre 2026, vers 21:55–21:58 UTC, autorisée par le PDG.
SSH vers `ubuntu@179.237.102.19` avec la seule clé autorisée
`C:\Users\antho\.ssh\id_ed25519_madfut27`, options `IdentitiesOnly=yes` et
`BatchMode=yes`. Procédures #25 et #29 suivies ; aucun contenu de clé ou de
secret lu, copié ou affiché. La première commande d'injection transcrite avec
un point final n'a pas été rejouée : la confirmation ultérieure est corroborée
par les seules métadonnées du fichier.

## Quatre critères d'acceptation de #33

1. **Satisfait.** `stat` constate `/etc/feedback-relay` dossier root:root 0700
   et `secret.env` fichier ordinaire root:root 0600. Aucun accès au contenu,
   environnement, destination Discord ou journal brut. Le démarrage valide
   indirectement la configuration sans divulguer sa valeur.
2. **Satisfait.** Seule l'unité existante `feedback-relay.service` est démarrée
   par `systemctl start`, sans enable. État final active/running, disabled,
   PID 274566, NRestarts=0 ; une seule unité et un listener
   `127.0.0.1:9101`, détenu par ce PID. La première sonde ss immédiatement après
   start précédait l'ouverture ; la sonde finale confirme l'écoute.
   Connexion externe à 179.237.102.19:9101 impossible pendant le service actif.
   HTTPS externe validé avec Python `ssl.create_default_context()`, sans
   désactiver chaîne, nom ou dates. NTP synchronisé.
   `nginx -t` réussit ; configuration proxy inspectée : en-têtes visiteurs
   supprimés par `proxy_pass_request_headers off`, liste blanche explicite,
   X-Real-IP remplacé par `$remote_addr`, upstream loopback, aucun retry.
   Contrôle dynamique de cette frontière conservé dans #29 ; pas de récepteur
   temporaire ni seconde instance introduite pour #33. Le prévol avec adresses
   usurpées reçoit 204 ; ce prévol seul ne prouve pas leur remplacement.
3. **Satisfait avec confirmation humaine explicitement restante.** Un seul
   POST valide externe, origine `https://arosare.github.io`, reçoit **HTTP 200,
   `{"ok":true}`**, avec Access-Control-Allow-Origin exact.
   Identifiant non secret : **`ISSUE33-CONTROLE-20261014T215551Z`**.
   Texte technique sans donnée personnelle ni mention. Le module déployé
   neutralise les mentions avec `allowed_mentions` (parse/users/roles vides,
   replied_user false), vérifié aussi par les tests locaux.
   Cela prouve la réponse positive du relais après acceptation HTTP Discord,
   pas l'observation dans le salon. Aucun accès autorisé au salon disponible :
   le PDG doit confirmer visuellement cet identifiant, sans renvoyer de message.
   **Le critère 6 de la validation globale n'est pas satisfait.**
4. **Satisfait dans la portée décrite.** Prévol production 204, autre origine
   400 invalid_origin sans ACAO, chemin inconnu 404, corps 8193 octets 413.
   Six POST de corps `{}` donnent 400 invalid_message puis cinq 429 proxy.
   Ces requêtes ne peuvent transmettre à Discord ; aucun autre POST valide,
   aucune rafale Discord ni nouvelle tentative après 429.
   Limites proxy inspectées : 6/min/IP burst 3, 60/min global burst 10,
   concurrence 4/IP et 32 globale. Seuils globaux/multi-IP et concurrence non
   saturés en production ; quotas applicatifs 3/min/IP, 30/min et concurrence 4
   couverts par les tests isolés avec transport simulé, pas par envois réels.
   Empreinte du module identique à #25
   (`7358c6b24d5aa9349057db96a2cb73be7a10cd0e7815bb79bf71d1367639a6c7`).
   Comptage filtré des diagnostics depuis 21:54 UTC : un « Feedback relay ready »,
   zéro « Invalid relay configuration », zéro « Relay startup failed » ; aucun
   journal brut affiché. Une première commande de comptage a échoué à cause
   des guillemets Python puis a été corrigée, sans modification du service.

`preserved.sha256` de #29 conforme avant et après ; nouvelle connexion SSH et
`sshd -t` réussis. Sauvegardes, certificats, renouvellement, SSH, configuration
proxy et autres services non modifiés. Aucun changement de main, du site public,
de `lancer.json` ou de `docs/feedback-candidate/README.md`. Publication séparée
après relecture. Validation locale : `npm.cmd test`, **34/34 réussis**.
Changement exclusivement documentaire ; aucun build/publication nécessaire.

## Arrêt de sécurité et reprise

En cas d'erreur, exposition inattendue, réponse ambiguë ou anomalie Discord :
ne pas répéter le message de contrôle. Depuis la connexion SSH autorisée :

```sh
sudo systemctl stop feedback-relay.service
sudo systemctl is-active feedback-relay.service
sudo ss -ltnp 'sport = :9101'
sudo systemctl is-enabled feedback-relay.service
```

Attendre inactive, absence de listener et disabled ; vérifier Nginx/SSH sans
afficher environnement ni secret. Avec le backend arrêté, HTTPS doit renvoyer
503 `relay_unavailable`, jamais une confirmation de réception. Respecter les
quotas et Retry-After, ne pas redémarrer pour les contourner. Conserver secret,
versions, sauvegardes et certificats ; ne pas arrêter SSH, Nginx ou le timer de
renouvellement pour un incident limité au relais. Diagnostiquer avec états,
codes et diagnostics filtrés ; reprendre seulement après résolution, en
gardant une unique instance et sans activation au boot.
