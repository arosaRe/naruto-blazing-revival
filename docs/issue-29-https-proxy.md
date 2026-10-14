# Issue #29 — préparation HTTPS, décision ACME en attente

Contrôles du 14 octobre 2026 vers 21:02 UTC. **Issue incomplète : aucun
proxy ni certificat déployé.** La consigne interdit toute création de compte ;
Let’s Encrypt nécessite un compte technique ACME, y compris pour staging.
Une clarification a été demandée avant cette création. Aucun achat, compte
ACME, requête d’émission ou transmission Discord effectué.

## Observations et sauvegarde

Lecture des procédures #25, #27 et `relay/`. Connexions SSH exclusivement avec
`C:\Users\antho\.ssh\id_ed25519_madfut27`, `IdentitiesOnly=yes`, `BatchMode=yes` ;
aucune lecture, copie ou sortie du contenu de cette clé.

- Résolveurs publics 1.1.1.1 et 8.8.8.8 : A = `179.237.102.19`, TTL 3600.
  Google DNS-over-HTTPS confirme Status 0, même adresse, AD=false.
  Le résolveur du VPS confirme également cette adresse.
- Ubuntu 26.04.1 LTS ; `NTPSynchronized=yes`. ACME production accessible
  depuis le VPS en HTTPS avec validation TLS, HTTP 200.
- Nginx et Certbot absents. Candidats APT observés : Nginx
  `1.28.3-2ubuntu1.11`, Certbot `4.0.0-4` ; **pas des versions installées**.
- UFW actif : deny incoming, allow outgoing ; seules autorisations entrantes
  TCP 22 IPv4/IPv6. Écoutes publiques SSH 22 ; DNS local uniquement.
- Relais inactive/disabled, aucun `secret.env`, aucune écoute 9101.
  `sshd -t` et nouvelles connexions SSH réussis.
- Depuis Windows, curl avec validation TLS active vers HTTPS : expiration
  connexion après 5 s, HTTP 000. Même expiration TCP vers 9101.
  Cela démontre l’inaccessibilité depuis ce client, pas tous les réseaux.

`relay/ops/snapshot-proxy-29.sh` exécuté avant toute modification serveur :
`/root/feedback-proxy-29` root:root 0700, fichiers 0600. Archive des
configurations UFW, SSH, netplan, Chrony, relais et unité ; absence initiale de
Nginx/Let’s Encrypt consignée. Inventaires paquets/écoutes/UFW et empreintes
des ressources conservées, sauvegardes #23/#25/#27, runtimes et comptes restent
uniquement sur le serveur. Aucun secret ou archive ajouté au dépôt.
Le script refuse d’écraser une sauvegarde existante.

## Configuration préparée, non activée

`relay/ops/retours.nginx.conf` est destiné au contexte `http` d’une installation
Nginx dédiée, sans CDN, sans `real_ip_header` ni `set_real_ip_from`. Aucun site
public existant ne doit être remplacé. Seul `/feedback` atteint
`127.0.0.1:9101`; autres chemins HTTPS 404. HTTP sert uniquement HTTP-01 et
redirige le nom exact ; hôte inconnu 404.

Une liste blanche d’en-têtes (`proxy_pass_request_headers off`) retire tous
les champs d’adresse visiteurs, y compris Forwarded, X-Forwarded-For,
Client-IP et variantes arbitraires. X-Real-IP est recréé depuis `$remote_addr`.
Origin, Content-Type, Content-Encoding et prévol CORS sont conservés pour
permettre les refus du relais. Pas de retry proxy. Backend absent : 503 JSON
`relay_unavailable`, jamais 200/confirmation de réception.

Corps 8 KiB ; en-têtes 2 × 4 KiB ; délais en-têtes/corps/envoi 5 s,
connexion backend 2 s, lecture backend 12 s, keepalive 5 s/20 requêtes.
Quotas Nginx : 6 requêtes/min/IP burst 3, 60/min global burst 10,
4 requêtes simultanées/IP et 32 globales ; dépassements 429.
Ils incluent OPTIONS et tentatives invalides. Quotas applicatifs conservés
3 transmissions/min/IP, 30 globales, concurrence 4. NAT pénalisés,
rotation IPv6 possible ; limites proxy par intervalles d’inactivité, pas
deadline absolue du corps. Les connexions aux en-têtes incomplets ne sont
pas comptées par limit_conn ; délais et capacité workers restent nécessaires.
Pas de journaux de requêtes ; diagnostics HTTPS supprimés pour éviter
URI/en-têtes utilisateur. Superviser codes/états et expiration séparément.

## Suite après clarification, pas exécutée

1. Contrôler les empreintes, les ports libres, DNS A/AAAA/CAA et horloge.
   Prévisualiser les dépendances APT et préserver le runtime partagé ; ne pas
   mettre à jour globalement le système. Installer uniquement Nginx/Certbot
   nécessaires sans exposer la page par défaut. Sauvegarder leur configuration
   initiale sous le même dossier protégé avant adaptation.
2. Activer d’abord uniquement les blocs HTTP sans références aux certificats
   inexistants ; valider `nginx -t`. Autoriser UFW TCP 80/443 IPv4 seulement
   puisque le nom cible une IPv4 ; préserver 22 et deny incoming (9101).
   Vérifier un jeton HTTP-01 depuis une autre machine puis le supprimer.
3. Après autorisation des comptes techniques, demander une seule émission
   staging dans des répertoires protégés séparés, puis une seule production
   via `certbot certonly --webroot -w /var/lib/feedback-acme
   -d retours.179-237-102-19.sslip.io`. Ne jamais servir le certificat staging.
   Accepter les conditions ACME uniquement dans le périmètre autorisé.
   En cas de quota/refus, consigner code et Retry-After, arrêter les essais ;
   ne pas changer de domaine/CA pour contourner.
4. Installer le bloc TLS et valider avant reload. Configurer le timer Certbot
   et un deploy-hook root qui exécute `nginx -t && systemctl reload nginx`.
   Exécuter une seule fois `certbot renew --dry-run --run-deploy-hooks`
   ciblé sur le certificat ; vérifier timer enabled/active, prochaine échéance
   et hook. Ce test n’est actuellement **pas réalisé**.
5. Depuis l’extérieur sans `-k` : certificat SAN/chaîne/dates, HTTPS, POST
   backend absent => 503, autres chemins => 404, corps >8192 =>413,
   dépassement quota =>429, 9101 inaccessible. Tester la liste blanche et
   l’adresse avec un récepteur factice loopback borné sans secret/Discord,
   jamais en démarrant le relais ; arrêter ce récepteur après test.
6. `sha256sum --quiet -c /root/feedback-proxy-29/preserved.sha256`, nouvelle
   connexion SSH, `sshd -t`, états relais, absence secret/listener et bilan UFW.
   Consigner les versions réellement installées et les résultats.

Contrôle d’expiration une fois un certificat obtenu :
`openssl x509 -in /etc/letsencrypt/live/retours.179-237-102-19.sslip.io/fullchain.pem
-noout -dates -checkend 2592000` (alerte si moins de 30 jours), plus contrôle
externe TLS. Ne jamais afficher la clé privée ni l’environnement du relais.

## Limites du DNS gratuit et références

Le nom dépend de l’opérateur sslip.io, de sa disponibilité et de ses politiques ;
il encode une IP, sans propriété ni accès à la zone. Changement d’IP exige
changement de nom et certificat ; certains résolveurs peuvent filtrer ces noms.
Les quotas de certificats par domaine enregistré sont partagés avec d’autres
utilisateurs ; ne pas supposer une capacité garantie. Pas de wildcard ni
validation DNS-01 contrôlée ici.

Sources : [opérateur nip.io/sslip.io](https://nip.io/),
[quotas Let’s Encrypt](https://letsencrypt.org/docs/rate-limits/),
[Certbot webroot et renouvellement](https://eff-certbot.readthedocs.io/en/stable/using.html),
[en-têtes proxy Nginx](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass_request_headers),
[quotas Nginx](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html).

## Retour arrière

À ce stade seul le dossier de sauvegarde a été ajouté au serveur : aucun
changement de configuration à annuler. Conserver cette sauvegarde.
Si le déploiement est ensuite autorisé : sauvegarder l’état courant, arrêter
le proxy dédié, désactiver son timer de renouvellement dédié, retirer seulement
ses règles UFW 80/443 nouvellement ajoutées, restaurer ses fichiers sauvegardés
après inventaire. Ne pas restaurer aveuglément toute l’archive sur `/`, ni
retirer SSH, runtime ou dépendances partagées. Tester Nginx et SSH avant reload.
Conserver clés/certificats protégés jusqu’à décision explicite de suppression.
Le relais reste stopped/disabled sans secret durant tout retour arrière.

## Quatre critères d’acceptation

1. **Partiel** : DNS public correct ; certificat et HTTPS externe absents.
2. **Non satisfait** : aucun certificat, timer ni dry-run réalisé.
3. **Partiel** : frontière et limites préparées seulement ; 9101 inaccessible
   depuis le client externe, mais proxy/erreur backend non testés en production.
4. **Partiel** : SSH, relais sans secret et sauvegarde contrôlés ; aucune
   configuration publique modifiée. Vérification finale des empreintes réussie
   (`sha256sum --quiet -c`), nouvelle connexion SSH et `sshd -t` réussis,
   relais inactive/disabled sans secret ni listener 9101. Bilan du déploiement
   encore absent. Site public, main et lancer.json inchangés.

Validation locale : `npm.cmd test` — 34 tests réussis. La configuration Nginx
préparée n’a pas été validée par `nginx -t` : binaire absent du VPS.
