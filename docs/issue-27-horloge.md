# Issue #27 — synchronisation temporelle du VPS

Intervention du 14 octobre 2026, vers 20:56 UTC, sur `ubuntu@179.237.102.19`.
Les comptes rendus #23 et #25 ont été lus. SSH utilise uniquement
`C:\Users\antho\.ssh\id_ed25519_madfut27` avec `IdentitiesOnly=yes` et
`BatchMode=yes`, sans lecture ni copie du contenu de la clé.

## Diagnostic et correction

Ubuntu annonce 26.04.1 ; Chrony 4.8 est actif et activé au démarrage.
systemd-timesyncd est absent ; aucun autre démon temporel n'a été observé.
Les deux processus chronyd appartiennent à la même unité (séparation de
privilèges), pas à deux services concurrents. Aucune installation effectuée.

Avant intervention, `timedatectl` indique NTP actif mais synchronisation non.
`chronyc tracking` indique 569611,125 secondes de retard système malgré une
source sélectionnée, une joignabilité 377 et Leap status Normal. Les cinq
sources Ubuntu utilisent NTS (`sudo chronyc authdata`). Les configurations
Ubuntu de sources et de bootstrap sont conservées, sans changer DNS.
Les journaux montrent auparavant absence de majorité, jitter et distance
excessifs, puis détection d'un écart de 569738,681731 secondes.

La cause immédiate du défaut persistant est `makestep 1 3` : après les trois
premières mises à jour, Chrony résorbe lentement le grand écart au lieu de faire
un saut. La cause initiale du décalage (hôte virtuel, manipulation ou autre)
n'est pas établie par les observations ; ne pas attribuer les messages sur les
sources à une panne permanente du réseau, qui fonctionne lors des contrôles.

Seul `/etc/chrony/chrony.conf` est modifié : `makestep 1 -1` et ses deux lignes
de commentaire. Cela permet de corriger un écart supérieur à une seconde même
après la fenêtre de démarrage, avec les sources NTS existantes. Cette règle
autorise aussi des sauts ultérieurs ; elle privilégie la récupération effective
de l'heure après un gros décalage de VM. Voir la
[documentation Chrony](https://chrony-project.org/doc/4.7/chrony.conf.html).
`chronyd -p` valide la configuration avant redémarrage.

Sauvegarde initiale hors dépôt : `/root/clock-repair-27/chrony.conf.before`,
root:root 0600, dossier root:root 0700. Copie avec `cp -a`, puis restriction
du mode de la copie. Le manifeste de contenus préservés est également 0600
dans ce dossier. Aucun fichier de clé Chrony, cookie NTS ou secret n'est affiché.

## Quatre critères d'acceptation

1. Diagnostic, changement unique et sauvegarde protégée décrits ci-dessus.
2. Mesures NTP indépendantes effectuées depuis le VPS par Python standard,
   UDP sortant, sans ajouter de source à Chrony. Paquets mode serveur, stratum
   valide, absence d'alarme LI et correspondance du timestamp d'origine vérifiés.
   Calcul : offset = ((réception serveur − émission client) + (émission serveur
   − réception client)) / 2 ; délai = aller-retour moins traitement serveur.
   Offset positif signifie VPS en retard.

   | Source | UTC retournée | Offset | Délai |
   | --- | --- | --- | --- |
   | Cloudflare 162.159.200.1, avant | 2026-10-14 20:56:08.872815 | +569609.257792 s | 2.145 ms |
   | Google 216.239.35.4, avant | 2026-10-14 20:56:08.881813 | +569609.256096 s | 18.862 ms |
   | Cloudflare 162.159.200.123, après second restart | 2026-10-14 20:57:00.357337 | +1.505 ms | 2.090 ms |
   | Google 216.239.35.12, après second restart | 2026-10-14 20:57:00.366081 | +0.380 ms | 17.366 ms |

   Ces sondes indépendantes sont NTP non authentifié ; elles corroborent les
   sources Ubuntu authentifiées NTS, sans constituer une preuve cryptographique
   indépendante. Une mesure unique est sensible à l'asymétrie réseau ; les
   millisecondes affichées ne garantissent pas cette précision absolue.
   Google utilise le leap smear ; aucun événement de seconde intercalaire
   n'a été testé ici.

   Premier restart : saut **+569607.249629 secondes** à 20:56:38 UTC.
   `chronyc waitsync 20 0.01 0 2` réussit. Second restart du seul
   `chrony.service` : même commande réussie, `NTPSynchronized=yes`, source
   `185.125.190.122` / `ntp-nts-2.ps5.canonical.com`, stratum 3, Leap Normal,
   correction restante 0.307 ms. Nouveau contrôle à 20:57:32 : synchronisation
   oui et correction restante 0.301 microseconde. Chrony reste enabled.
   RTC initialement en retard, puis UTC correcte à 20:56:59 via `rtcsync`.
   Pas de reboot du VPS ni de simulation de nouveau décalage ; tenue à long
   terme non mesurée. La règle est persistante dans la configuration.
3. Nouvelles connexions SSH réussies après saut et second restart ; `sshd -t`
   réussi. Relais `inactive` / `disabled`, absence de `secret.env` et de listener
   9101. Écoutes avant/après identiques : SSH 22 public, résolution et contrôle
   Chrony locaux, DHCP existant ; aucune écoute NTP publique ajoutée.
   Aucun changement entrant, de site public, DNS, comptes ou runtime partagé.
   Contrôle SHA-256 des fichiers SSH, netplan, UFW, clés Ubuntu, sauvegardes
   #23/#25, arbres `/opt/feedback-relay`, `/var/lib/tradispo`,
   `/opt/madfut27-watcher`, Node/Python partagés et fichiers de comptes système
   effectué avant/après : `sha256sum --quiet -c` réussi, tous les contenus
   inventoriés identiques. Les archives sont restées sur le serveur.
4. Compte rendu expurgé et retour arrière ci-dessous. HTTPS, certificat,
   reverse proxy et réception Discord explicitement non vérifiés et hors périmètre.

## Effets du saut et limites

Les journaux passent du 8 octobre 06:43:11 au 14 octobre 20:56:38 UTC ; les
anciennes dates, notamment le nom de la sauvegarde #23, restent fausses et ne
sont pas renommées. Les durées fondées sur l'heure murale traversant ce saut
ne sont pas fiables ; utiliser les horodatages monotones pour l'ordre interne
à un boot. Aucun `date -s`, changement de fuseau ou réécriture des logs.

Les timers calendaires ont exécuté des tâches échues à 20:56:38 (sysstat,
logrotate, sauvegarde dpkg, fwupd, apt notamment, selon `list-timers`). Aucune
de ces tâches n'a été démarrée manuellement. `fwupd-refresh` était seul en échec
avant et aucun service n'est en échec au contrôle suivant ; causalité et
résultats détaillés de tous les timers non audités. Le saut peut affecter
expirations, rotations, caches et tâches calendaires ; le relais arrêté n'a
traité aucun quota ni webhook. Les empreintes contrôlent les contenus des
fichiers inventoriés, pas toute la VM ni toutes les métadonnées.

## Retour arrière de configuration

Sur le serveur, conserver une copie protégée de l'état courant avant retour :

```sh
sudo cp -a /etc/chrony/chrony.conf /root/clock-repair-27/chrony.conf.corrected
sudo chmod 600 /root/clock-repair-27/chrony.conf.corrected
sudo install -o root -g root -m 0644 /root/clock-repair-27/chrony.conf.before /etc/chrony/chrony.conf
sudo chronyd -p >/dev/null
sudo systemctl restart chrony.service
chronyc waitsync 20 0.01 0 2
timedatectl
chronyc tracking
```

Le retour restaure la règle initiale, donc sa limite de récupération après
trois mises à jour. Il ne restaure jamais une date fausse, le RTC ou un ancien
fichier de dérive. Si validation ou synchronisation échoue, remettre la copie
corrigée et redémarrer uniquement Chrony. Préserver toutes les sauvegardes,
ne pas démarrer le relais, ne pas installer un second service temporel.
