# Issue #25 — service interne préparé

Intervention du 14 octobre 2026 sur `ubuntu@179.237.102.19`, via SSH avec
`C:\Users\antho\.ssh\id_ed25519_madfut27` utilisée directement par SSH/SCP,
sans lecture ni copie de son contenu. Aucun webhook réel utilisé.

## Version et périmètre

Seul `relay/server.mjs` du commit `3445d21727f6833125c4cee6556fe13caff634ce`
est déployé sous `/opt/feedback-relay/releases/<commit>/`, avec `SOURCE_COMMIT`.
SHA-256 du module :
`7358c6b24d5aa9349057db96a2cb73be7a10cd0e7815bb79bf71d1367639a6c7`.
Le lien `current` sélectionne cette version. Les outils d'exploitation de cette
PR sont séparés du module existant, qui n'a pas été modifié.

Node **24.22.0 linux-x64** est isolé sous
`/opt/feedback-relay/node-v24.22.0-linux-x64`, sans modification du PATH global.
Archive et manifeste téléchargés depuis la [distribution officielle Node](https://nodejs.org/dist/v24.22.0/SHASUMS256.txt)
via HTTPS avec validation TLS ; `sha256sum -c` réussi avant extraction.
SHA-256 de l'archive :
`cc2f601cee82d9a5a233302fe307abc600727035fd7d2c3a3571755989e95008`.
Ce contrôle utilise le manifeste officiel via TLS, pas une signature GPG indépendante.
Archive temporaire supprimée côté serveur ; aucune archive transférée vers Git.
`/usr/bin/node` reste **v22.22.1**, empreinte inchangée.

## Contrôle des quatre critères

1. Node isolé retourne `v24.22.0`. Empreintes des fichiers de `/etc/ssh`,
   `/etc/netplan`, `/etc/ufw`, `/home/ubuntu/.ssh` et de la sauvegarde #23
   comparées avant/après : identiques. Manifestes conservés uniquement sous
   `/root/feedback-relay-25` (0700). Sauvegarde #23 toujours root:root 0700,
   archive 0600 ; aucune ressource incertaine du retrait touchée. Aucun paquet
   système mis à jour, aucune clé ou compte existant modifié. Seul ajout de
   compte/groupe : `feedback-relay` (UID 994, GID 981), home `/nonexistent`,
   shell `/usr/sbin/nologin`. Nouvelle connexion SSH et `sshd -t` réussis.
   L'absence de modification des comptes existants repose sur les commandes
   effectuées ; aucun manifeste initial de `/etc/passwd` n'a été capturé.
2. Unité non template `feedback-relay.service`, compte sans privilèges,
   capabilities vides, système en lecture seule, home inaccessible, isolation
   temporaires/périphériques, restrictions namespaces et ressources.
   `systemd-analyze verify` réussi (avertissements CPUAccounting concernant
   deux unités XFS préexistantes). `systemd-analyze security` : **3.2 OK**.
   Pas de `MemoryDenyWriteExecute` incompatible avec le JIT V8.
   Une seule tâche du compte observée ; écoute **127.0.0.1:9101** uniquement.
   `/etc/feedback-relay` root:root 0700, `config.env` root:root 0600 ; systemd
   lit les fichiers comme root avant de lancer le compte dédié. Port/origine/
   proxy sont fixés dans ce fichier protégé. Aucun port public ajouté.
3. Sans `secret.env`, systemd refuse le démarrage. Essai temporaire avec
   destination fictive, drop-in runtime `Restart=no`, `IPAddressDeny=any`,
   `IPAddressAllow=localhost` : démarrage actif et **HTTP 400**
   `{"error":"invalid_origin"}` sur GET sans Origin. Ce chemin refuse avant
   tout appel sortant, également bloqué par le filtre IP de l'essai.
   Avec fichier secret vide : diagnostic générique et sortie applicative **1**.
   Fichier fictif et drop-in retirés ; état final **inactive / disabled**,
   aucun `secret.env`, aucun listener 9101. Le premier essai a révélé la
   comparaison du chemin d'entrée avec le lien symbolique : option
   `--preserve-symlinks-main` ajoutée à l'unité, puis essai complet réussi.
4. Version, procédures et limites documentées ici. Les journaux du service
   observés ne contiennent que les diagnostics génériques de démarrage/arrêt.
   Aucun secret réel, contenu utilisateur ou archive dans les fichiers de cette
   PR. `npm.cmd test` : **34 tests réussis** ; `npm.cmd run build` réussi.
   Le service et sa configuration restent hors artefact public.

## Injection du secret côté serveur

À effectuer ultérieurement par l'administrateur, depuis un terminal SSH privé
sans enregistrement de session, service arrêté. Ne pas coller le secret dans
une commande, une conversation, un fichier local ou une sortie de diagnostic.

```sh
sudo systemctl stop feedback-relay.service
sudo /usr/bin/python3 /etc/feedback-relay/inject-secret.py
```

La saisie terminal est masquée par `getpass`, validée sans affichage de valeur,
écrite atomiquement dans `secret.env` root:root 0600 sous le dossier 0700.
Le script refuse un stdin non interactif et ne démarre pas le service.
Ne pas employer `systemctl show -p Environment`, `env`, `cat secret.env`,
traces shell ou outils qui affichent l'environnement. Le processus reçoit
le secret par environnement : root et le compte dédié appartiennent à la
frontière de confiance. Lors d'une rotation, arrêter, réinjecter puis redémarrer.

## Exploitation et mise à jour

Après autorisation de mise en service et réalisation des prérequis ci-dessous :

```sh
sudo systemctl start feedback-relay.service
sudo systemctl is-active feedback-relay.service
sudo ss -ltnp 'sport = :9101'
sudo systemctl stop feedback-relay.service
```

L'activation au boot (`systemctl enable feedback-relay.service`) est une étape
ultérieure. Garder une seule unité/processus : quotas en mémoire non partagés.
Les redémarrages réinitialisent les quotas. Observer les états et codes HTTP,
jamais corps, destination ou environnement. Pas d'essai POST valide sur un
webhook réel sans intention explicite de transmettre.

Pour mettre à jour : tester le module, noter son commit et son SHA-256, transférer
uniquement le module vers un nouveau dossier root:root 0755 sous `releases`,
fichier 0644 et `SOURCE_COMMIT` 0644. Ne jamais écraser une version existante.
Arrêter le service, remplacer atomiquement `current` par un lien vers la version
validée (lien temporaire puis `mv -T`), démarrer et vérifier instance/loopback.
Conserver la version précédente. Aucun npm install nécessaire. Une mise à jour
Node doit utiliser un nouveau chemin versionné et le manifeste officiel vérifié,
puis adapter `ExecStart`, vérifier l'unité et recharger systemd.

Retour arrière : arrêter le service, remettre atomiquement le lien vers la
version précédente, restaurer l'ancien `ExecStart` si Node changeait,
`systemctl daemon-reload`, puis reprendre uniquement si autorisé. En cas de
doute, garder arrêté. Pour annuler cette préparation initiale : arrêter et
désactiver l'unité, retirer uniquement cette unité et ses éventuels drop-ins
après inventaire, recharger systemd ; conserver configuration protégée et
versions jusqu'à décision d'effacement. Ne pas supprimer les sauvegardes #23,
le runtime partagé, ni les ressources/comptes conservés du retrait.

`relay/ops/prepare-server.sh` documente la préparation initiale et refuse les
chemins/comptes déjà présents ; ce n'est pas un script de mise à jour.
`check-server.sh` est réservé à l'état sans secret, avec nettoyage à la sortie.

## Prérequis restants

Horloge distante observée : **8 octobre 2026, 06:34 UTC**, environ six jours
derrière la date de l'intervention ; NTP actif mais synchronisation **non**.
Les dates futures de l'archive Node ont produit des avertissements tar.
Horloge non corrigée ici : rétablir et contrôler sa synchronisation avant
certificat HTTPS et exploitation TLS.

Restent le webhook réel injecté côté serveur, choix du nom public et certificat
valide, reverse proxy HTTPS avec remplacement strict de X-Real-IP et suppression
des autres headers d'adresse, limites anti-abus proxy et contrôles externes.
Le port interne doit rester inaccessible publiquement. Aucun test externe de
connexion au port n'a été réalisé ; absence d'exposition vérifiée par l'écoute
loopback. Aucun pare-feu, DNS, proxy public ou site publié/modifié ici.
Le seul échec systemd préexistant est `fwupd-refresh.service`, laissé intact.
