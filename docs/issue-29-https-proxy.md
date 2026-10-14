# Issue #29 — HTTPS et renouvellement validés extérieurement

## État actuel : quatre critères couverts, 14 octobre 2026, 21:24–21:32 UTC

Le bilan ci-dessous est conservé comme historique. Le blocage réseau est levé
après confirmation du PDG concernant Infomaniak ; PR #30 proposée à la revue.
Relais arrêté/désactivé, sans secret, sans envoi Discord ; aucun changement du
site, de main ou du lancement. Versions inchangées.

1. **HTTPS externe satisfait.** Windows curl sans proxy reçoit HTTP 308 sur
   `/` et 404 sur un jeton absent. Le webroot et `.well-known` étaient 0700 :
   correction ciblée à 0755 pour la lecture Nginx des seuls challenges publics.
   Sonde HTTP-01 externe : 200 et contenu exact
   `issue29-http-probe-20261014`, jeton ensuite supprimé. Aucun ACME relancé
   avant ce succès. A public via 1.1.1.1 : 179.237.102.19. Une validation
   staging avec le compte existant puis une émission production réussies,
   sans email/achat, sans contournement des quotas. Certificat Let's Encrypt
   YE2, SAN exact, du 14 octobre 2026 20:27:24 UTC au 12 janvier 2027
   20:27:23 UTC. Curl Windows et Python `ssl.create_default_context()`
   valident chaîne, nom et dates depuis l'extérieur sans désactiver TLS.
   Aucun certificat staging servi.
2. **Renouvellement satisfait.** Hook root:root 0700 et unités root:root 0644
   installés ; timer dédié enabled/active, deux passages/jour avec délai
   aléatoire, prochaine échéance constatée : 14 octobre 22:59:09 UTC.
   Timer général disabled. `certbot renew --cert-name
   retours.179-237-102-19.sslip.io --dry-run --run-deploy-hooks` : toutes les
   simulations réussies, hook exécuté, nginx -t OK, ReloadResult=success.
   Le message « error output » accompagne les diagnostics de succès de
   nginx -t sur stderr, sans échec. Dry-run : compte technique staging créé
   aussi sous Certbot production ; tous les comptes protégés root. Parent
   `/etc/letsencrypt`, accounts/live/archive, hook, work/logs privés (0700).
   La lineage conserve l'URL ACME production ; contrôle expiration 30 jours OK.
3. **Frontière et limites satisfaites.** `python -u
   relay/ops/check-external-29.py` exécuté depuis Windows sur le vrai HTTPS.
   Récepteur sans sortie réseau, une requête, attente 20 s, processus borné
   par timeout 25 s, exclusivement 127.0.0.1:9101, puis arrêté. X-Real-IP
   égale l'IP source de la connexion SSH externe ; en-têtes visiteurs testés
   et Cookie/Authorization supprimés, liste blanche conservée. Port 9101
   inaccessible extérieurement pendant l'écoute. Sans backend : 503 JSON
   exact, aucune confirmation de réception ; mauvais Host/chemin 404,
   8193 octets 413, en-tête 9000 octets 400, rafale 429. En-têtes et corps
   incomplets fermés après environ 5 s (TLS EOF observé ; contrôle admet aussi
   408). Récepteur lent séparé borné : délai backend 12 s, 503 contrôlée,
   puis arrêt. Quota IP vérifié extérieurement ; quotas globaux 60/min burst
   10 et simultanéité 4/IP, 32 globales vérifiés dans la configuration chargée.
   Seuils multi-IP et saturation non mesurés dynamiquement depuis ce client
   unique : portée explicite, aucun test distribué revendiqué. Les délais
   restent par inactivité et les limites NAT ci-dessous restent applicables.
4. **Préservation satisfaite.** `preserved.sha256` conforme, nouvelle connexion
   SSH et sshd -t OK ; relais inactive/disabled, secret absent, aucune écoute
   9101 après nettoyage. UFW inchangé : SSH et TCP 80/443 IPv4 seulement,
   SSH IPv6 conservé. Écoutes publiques 22/80/443, 22 IPv6 aussi. Clé SSH
   imposée seule utilisée sans affichage/copie. Sauvegardes privées conservées ;
   HTTP avant TLS sauvegardé dans
   `/root/feedback-proxy-29/feedback.http-before-tls.conf`. nginx -t/reload OK.
   Fichiers de transfert temporaires retirés. `npm.cmd test` : 34 réussis.

Contrôle opérationnel : timer ciblé et journaux de son service, commande
expiration ci-dessous et HTTPS externe avec validation TLS. En cas d'échec,
respecter Retry-After, examiner les logs privés, ne pas multiplier les demandes.
Retour arrière : sauvegarder le nouvel état hors dépôt, désactiver d'abord le
timer dédié, restaurer uniquement le HTTP sauvegardé avec nginx -t/reload si
nécessaire, ou arrêter Nginx et retirer seulement ses ouvertures 80/443.
Préserver SSH, comptes et sauvegardes ; aucune restauration globale de `/`.
Publication du formulaire/relais et injection de secret hors de cette tâche.

## Historique avant reprise

Observations du 14 octobre 2026, 21:02–21:13 UTC. **Issue incomplète ; PR #30
reste en brouillon, sans demande de revue.** Autorisation reçue pour les seuls
comptes techniques ACME production/staging, avec conditions techniques. Aucun
achat, compte utilisateur, adresse personnelle, secret relais ou envoi Discord.

## Résultats obtenus et blocage

- Nom `retours.179-237-102-19.sslip.io` : résolution A publique vers
  `179.237.102.19` confirmée avec 1.1.1.1 (TTL 3600). Contrôle initial également
  réalisé avec 8.8.8.8, Google DoH et le résolveur du VPS.
- Ubuntu 26.04.1 LTS ; horloge `NTPSynchronized=yes` ; accès sortant ACME HTTPS
  vérifié avec validation TLS. SSH exclusivement avec
  `C:\Users\antho\.ssh\id_ed25519_madfut27`, `IdentitiesOnly=yes`, `BatchMode=yes`.
  Aucun affichage ou copie du contenu de cette clé.
- Installation APT ciblée `--no-install-recommends` : dix nouveaux paquets,
  aucune mise à jour/suppression, aucun autoremove. Nginx installé
  `1.28.3-2ubuntu1.11`, Certbot `4.0.0-4`. La simulation initiale sans cette
  option annonçait onze paquets ; python3-icu n'a finalement pas été installé.
- Nginx masqué pendant l'installation pour empêcher la page par défaut de
  démarrer ; configuration initiale archivée hors dépôt avant adaptation.
  Lien `sites-enabled/default` retiré. Nginx ensuite enabled/active : seuls
  les blocs HTTP du candidat sont déployés dans `/etc/nginx/conf.d/feedback.conf`.
  `nginx -t` et reload réussis. HTTP-01 servi depuis `/var/lib/feedback-acme` ;
  nom exact redirigé vers HTTPS, hôtes inconnus 404. **HTTPS pas encore servi**.
- UFW reste actif deny incoming/allow outgoing, SSH 22 IPv4/IPv6 préservé.
  Seuls TCP 80/443 IPv4 ajoutés ; aucune ouverture 9101 ou IPv6 supplémentaire.
  Nginx écoute publiquement sur 80 ; aucune écoute publique 443/9101.
- HTTP répond localement 308 avec le bon Host. Depuis Windows externe,
  HTTP par nom (15 s), puis par IP sans proxy (5 s/4 s) : timeout, HTTP 000.
  HTTPS avec validation TLS active et 9101 : timeout de connexion (5 s).
  Aucun certificat n'a donc pu être validé depuis l'extérieur.
- Une seule demande staging, compte enregistré sans email, webroot HTTP-01 :
  échec ACME `connection`, `Timeout during connect (likely firewall problem)`
  vers `179.237.102.19:80`. Pas d'erreur quota/Retry-After observée ; pas de
  seconde demande staging, aucune demande ni compte production.
  La tentative staging a été lancée alors que la sonde externe précédente
  avait expiré : ne pas la répéter avant résolution du blocage et réussite
  d'une nouvelle sonde HTTP-01 externe.
- Compteurs UFW ACCEPT 80/443 à zéro après essais ; règles nftables locales
  inspectées. Capture temporaire bornée à 20 s, IPv4 destination VPS 80/443,
  pendant deux nouvelles sondes externes : zéro paquet capturé, zéro perte
  noyau (trois paquets signalés par le filtre, non capturés). Cela pointe vers
  un filtrage/routage en amont ; ne prouve pas sa localisation exacte ni son
  gestionnaire. Capture terminée, aucun pcap conservé. Accès/procédure du
  pare-feu de l'hébergeur demandé pour vérifier uniquement TCP 80/443.

## Frontière proxy : tests locaux, portée explicite

`relay/ops/check-proxy-29.py` exécuté sur le VPS, au premier plan. Il extrait
les zones et le bloc TLS du candidat, retire seulement les directives TLS et
remplace l'écoute par HTTP **127.0.0.1:443** pour une instance Nginx temporaire.
Ce contrôle ne certifie ni TLS ni les réponses publiques. Aucune modification
du relais ; aucun secret ; aucune transmission sortante dans le récepteur.

Récepteur Python sur **127.0.0.1:9101**, limité à une requête et à 10 s
 d'attente, fermé dans le nettoyage ; instance Nginx temporaire terminée aussi.
Résultats :

- `X-Real-IP: 192.0.2.1` remplacé par `127.0.0.1`, adresse de la connexion.
- Forwarded, X-Forwarded-For, Client-IP, True-Client-IP, CF-Connecting-IP,
  X-Arbitrary-Visitor-IP, Cookie et Authorization absents du récepteur.
  Liste blanche vérifiée, Origin/Content-Type/Content-Encoding et les deux
  en-têtes de prévol conservés. Aucun `real_ip_header`/`set_real_ip_from`.
- Récepteur arrêté : POST retourne exactement 503 JSON
  `{"error":"relay_unavailable"}`, aucune confirmation de réception.
- Autre chemin et mauvais Host : 404 ; corps de 8193 octets : 413 ; rafale
  de six requêtes après les contrôles : présence de 429.
- Nettoyage réussi ; pas de listener 9101/443 après test.

Limites du candidat : corps 8 KiB, grands en-têtes 2 × 4 KiB ; délais
header/body/send 5 s, backend connect 2 s/read 12 s ; keepalive 5 s/20 requêtes.
6 requêtes/min/IP burst 3 ; 60/min global burst 10 ; simultanéité 4/IP et
32 globale. OPTIONS et requêtes invalides comptent ; aucun retry upstream.
Pas de journaux de requêtes ; diagnostics HTTP/TLS vers `/dev/null` pour
éviter la conservation d'URI/en-têtes visiteurs.

**Non vérifiés dynamiquement** : quotas globaux multi-IP, simultanéité et
expiration des délais ; leurs directives sont présentes mais les contrôles
externes erreurs/quotas sont bloqués. Les délais Nginx sont par inactivité,
pas une deadline absolue ; les en-têtes incomplets ne comptent pas dans
limit_conn. NAT pénalisés et rotation IPv6 possible. Les limites applicatives
restent 3 transmissions/min/IP, 30 globales, concurrence 4, sans démarrage ici.

## Renouvellement : préparé, non activé et non validé

Compte/clé staging uniquement sous `/root/feedback-acme-staging`, accès
root exclusivement (permissions groupe/autres retirées récursivement).
Logs ACME privés sur le serveur ; aucun compte/clé/archive ajouté au dépôt.
Certbot général `certbot.timer` désactivé et arrêté : aucun certificat
production à renouveler, ne pas annoncer un renouvellement opérationnel.

Candidats du dépôt : `feedback-certificate-renew.service`/`.timer`, ciblés
sur ce seul certificat, deux contrôles/jour avec délai aléatoire ; hook
`reload-feedback-certificate.sh` limité à sa lineage, nginx -t puis reload.
Ils **ne sont pas installés/activés**, le dry-run n'a pas été exécuté.

Après résolution réseau :

1. Contrôler DNS A/AAAA/CAA et HTTP-01 depuis un client externe, supprimer le
   jeton de sonde ensuite. Pas de nouvelle demande ACME avant cette réussite.
2. Faire une seule validation staging avec les mêmes répertoires/compte,
   puis une seule émission production webroot, `--non-interactive --agree-tos
   --register-unsafely-without-email`, même nom. Ne jamais servir staging.
   En cas de quota respecter Retry-After, consigner son échéance et arrêter ;
   ne pas changer de nom, compte ou CA pour contourner.
3. Installer le candidat TLS seulement après émission, nginx -t puis reload.
   Protéger les répertoires ACME et clés production root ; installer le hook
   root:root 0700 dans `/etc/letsencrypt/renewal-hooks/deploy/`, les unités
   root:root 0644 sous `/etc/systemd/system/`, daemon-reload puis enable --now
   du timer dédié. Garder le timer général désactivé.
4. Exécuter une seule fois `certbot renew --cert-name
   retours.179-237-102-19.sslip.io --dry-run --run-deploy-hooks`, constater
   succès et reload, timer enabled/active et prochaine échéance. Le dry-run
   utilise staging ; ne pas modifier le serveur ACME production de la lineage.
5. Vérifier extérieurement sans -k SAN/chaîne/dates, 503/404/413/429, adresse
   client réelle et suppression des en-têtes avec le récepteur borné puis
   arrêté ; compléter quotas/concurrence/délais et inaccessibilité 9101.
6. Vérifier à nouveau SSH, ressources/sauvegardes, relais, absence secret et
   bilan des seules ouvertures nécessaires. Alors seulement demander la revue.

Contrôle expiration : `openssl x509 -in
/etc/letsencrypt/live/retours.179-237-102-19.sslip.io/fullchain.pem -noout
-dates -checkend 2592000` (alerte sous 30 jours), plus validation TLS externe.
Ne jamais afficher privkey.pem ni l'environnement du relais.

## Préservation et retour arrière

Sauvegarde initiale `/root/feedback-proxy-29` conservée, root:root 0700,
archives privées 0600 ; `snapshot-proxy-29.sh` refuse de l'écraser.
`config.before.tar`, inventaires UFW/paquets/listeners et preserved.sha256
préexistants inchangés. Ajout de `nginx.installed.tar` avant adaptation,
script de contrôle et candidat privés. Aucun effacement de sauvegardes.

`sha256sum --quiet -c /root/feedback-proxy-29/preserved.sha256` réussi avant
intervention et après tests : SSH/netplan/Chrony, ressources et sauvegardes
#23/#25/#27, runtimes partagés et fichiers de comptes conservés. Nouvelles
connexions SSH et `sshd -t` réussis ; relais inactive/disabled, sans
`/etc/feedback-relay/secret.env` ni écoute 9101. Aucun changement du site,
de main ou de lancer.json.

Retour arrière de l'état actuel (si décidé) : sauvegarder l'état courant dans
un nouvel emplacement root protégé ; `systemctl disable --now nginx` ; retirer
uniquement les règles ajoutées `ufw delete allow proto tcp to 0.0.0.0/0 port 80`
et idem 443. Ne pas toucher à OpenSSH ni restaurer toute l'archive sur `/`.
Conserver compte/clé staging protégés jusqu'à décision explicite de suppression.
Conserver les paquets ciblés pour éviter toute suppression de dépendance
partagée ; pas d'autoremove. La config Nginx d'origine est dans
nginx.installed.tar : ne pas réactiver sa page par défaut publiquement.
Si TLS et timer sont activés plus tard, désactiver d'abord le timer dédié et
retirer seulement son hook/unités après inventaire. Tester SSH et états après
chaque retour arrière ; le relais reste arrêté/désactivé sans secret.

## Quatre critères

1. **Partiel** : DNS confirmé ; certificat/HTTPS externe impossibles actuellement.
2. **Non satisfait** : comptes et unités préparés, aucun certificat production,
   automatisme actif ou dry-run réussi.
3. **Partiel** : frontière et erreurs/quota IP testés localement ; tests externes
   impossibles ; 9101 inaccessible du client externe et absent des écoutes.
4. **Satisfait pour les interventions réalisées** : SSH, empreintes, sauvegardes,
   états relais et périmètre réseau contrôlés ; bilan final TLS encore à refaire.

Dépendance sslip.io : pas de propriété de zone/DNS-01, disponibilité et
politiques du fournisseur, filtrage par certains résolveurs, changement d'IP
nécessitant nouveau nom/certificat. Quotas ACME partagés, capacité non garantie.
Références relues : [quotas et Retry-After Let’s Encrypt](https://letsencrypt.org/docs/rate-limits/),
[Certbot webroot/dry-run/hooks](https://eff-certbot.readthedocs.io/en/stable/using.html),
[opérateur sslip.io](https://nip.io/),
[liste blanche Nginx](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass_request_headers),
[quotas Nginx](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html).

Validation locale du dépôt : npm.cmd test, 34 tests réussis. Le contrôle Python
Nginx est distinct, exécuté uniquement sur le VPS avec le binaire installé.
