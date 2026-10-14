# Issue #23 — retrait MADFUT et Tradispo

Intervention autorisée le 14 octobre 2026 sur le VPS désigné dans l’issue,
par SSH avec la clé autorisée utilisée directement, jamais lue ni copiée.
Attention : l’horloge distante indiquait le **8 octobre 2026** ; elle n’a pas été corrigée.

## Opérations observées

- Inventaire des unités, dépendances systemd, références dans les configurations
  de services/cron/logrotate/sudoers et chemins absolus du code. Aucun consommateur
  applicatif supplémentaire détecté dans ces contrôles. Aucun drop-in ni timer associé.
- `madfut27-watcher.service` était actif et activé ; `tradispo.service` était
  activé, en redémarrage automatique. Arrêt des deux avant sauvegarde.
- Sauvegarde serveur conservée dans
  `/root/app-retirement-23-20261008T062819Z` : dossier root:root 0700,
  `applications.tar` root:root 0600, 1 036 605 440 octets.
  Aucun transfert d’archive ou de secret vers le dépôt ou les artefacts.
- Archive tar avec propriétaires numériques, modes, liens, ACL et attributs étendus.
  Elle couvre les deux arbres de code et leurs dépendances locales, les deux arbres
  de données, les configurations/secrets MADFUT et Tradispo, les unités et leurs
  liens d’activation. Manifestes et états initiaux conservés dans ce même dossier protégé.
- SHA-256 de l’archive :
  `84be3662d00e12f797d8c5e3df4bbdceda007f6497055fdaf5076e0756e01b63`.
  Contrôle répété avant suppression.
- Extraction sous `restore/`, sans exécuter le code ni démarrer les applications :
  **5 834 entrées identiques** (contenus SHA-256, types, liens, propriétaires,
  modes, dates de modification et attributs étendus), **24 JSON valides**,
  **7 bases SQLite** reconnues par signature avec `integrity_check = ok`.
  Le manifeste source est resté identique pendant la vérification.
- Après cette réussite seulement : désactivation des deux unités, suppression des
  ressources ci-dessous, rechargement systemd et vérifications finales.

## Périmètre supprimé et conservé

Supprimés : contenu de `/opt/madfut27-watcher`, `/opt/tradispo`,
`/var/lib/madfut27-watcher`, `/etc/tradispo`, les trois fichiers
`/etc/madfut27-watcher.env`, `.env.pre-rss`, `.env.before-auth-token-line`,
les deux fichiers d’unité sous `/etc/systemd/system/` et leurs liens d’activation.
Dans `/var/lib/tradispo`, seuls `alerts.json`, `status.json` et `profile/`
ont été supprimés. Le relevé exact des 22 cibles de suppression est conservé
dans `removed-paths.json` ; les deux liens d’activation ont été retirés par systemd.

Conservés par prudence : `/var/lib/tradispo/{.cache,.local,.npm}` et les fichiers
de profil `.bashrc`, `.bash_logout`, `.profile`. Leur exclusivité n’est pas établie.
Les répertoires personnels `/opt/madfut27-watcher` et `/var/lib/tradispo` restent,
ainsi que les comptes et groupes. Les interpréteurs partagés Python et Node,
paquets système, journaux systemd et autres ressources partagées restent présents.
La copie restaurée et l’archive sont conservées sous le dossier protégé.

## Contrôle des cinq critères

1. Sauvegarde hors dépôt, protégée et exhaustive pour les éléments retirés :
   archive, manifeste, empreinte et état initial présents ; permissions vérifiées.
2. Restauration isolée réussie **avant** suppression : fichiers, métadonnées,
   JSON et SQLite vérifiés. Le garde-fou prévoyait aucune suppression et remise
   en activation des services initialement actifs/en redémarrage en cas d’échec ;
   ce chemin d’échec n’a pas été déclenché.
3. Deux unités `not-found` / `inactive`, zéro processus sous `madfut27` et
   `tradispo`, absence des cibles vérifiée ; sauvegardes conservées.
4. Nouvelle connexion SSH réussie, `sshd -t` réussi ; SSH, réseau et résolution
   systemd actifs. Contenus et permissions des comptes/groupes, secrets système,
   configuration SSH, clés SSH d’Ubuntu, netplan, systemd-network et UFW comparés
   avant/après : inchangés. Aucune installation, publication, purge ou modification
   réseau. État système `running` au contrôle immédiat, puis `degraded` au contrôle
   suivant : seul `fwupd-refresh.service` était en échec, hors périmètre et laissé
   intact. La cause de cet échec n’a pas été investiguée.
5. Compte rendu expurgé et procédure ci-dessous ; ressources incertaines signalées
   et conservées. Aucun contenu de données, secret ou archive dans Git.

## Restauration réservée à l’administrateur

Utiliser SSH avec la même clé autorisée, puis un shell root. Ne pas extraire
l’archive dans le dépôt ni afficher ses contenus. Les chemins ci-dessous sont
ceux du serveur, pas ceux du poste Windows.

```sh
sudo -i
cd /root/app-retirement-23-20261008T062819Z
sha256sum -c applications.tar.sha256
```

Avant restauration, contrôler l’espace disque et toute nouvelle occupation des
chemins d’origine ; sauvegarder tout nouvel état pour éviter son écrasement.
Consulter localement `roots.json`, `manifest.json`, `initial-services.json` et
`verification.json` sans en publier les contenus. Pour refaire l’essai isolé,
extraire dans un nouveau dossier root 0700 avec les mêmes options tar et refaire
la comparaison des fichiers/métadonnées, la validation JSON et les contrôles
SQLite en lecture seule ; ne lancer aucun programme restauré.

Après validation et décision de remettre ces applications en service :

```sh
tar --acls --xattrs --numeric-owner --same-owner --same-permissions \
  -xpf applications.tar -C /
systemctl daemon-reload
systemctl enable madfut27-watcher.service tradispo.service
```

Cette extraction restaure aussi les secrets, les données et les liens d’activation.
Vérifier les permissions avec le manifeste et l’intégrité SQLite/JSON avant de
démarrer quoi que ce soit. Les comptes et interpréteurs conservés évitent leur
recréation. Le démarrage suivant reprend les contacts externes des applications :

```sh
systemctl start madfut27-watcher.service tradispo.service
systemctl is-active madfut27-watcher.service tradispo.service
```

L’état initial de Tradispo comportait déjà des redémarrages automatiques ; cette
procédure restitue ses fichiers et son activation, sans garantir sa disponibilité.
Conserver l’archive après restauration.
