# Relais de retours — contrat pour #16

Service Node.js 24 sans dépendance, séparé de GitHub Pages. Le service interne VPS est préparé et arrêté : voir [compte rendu #25](../docs/issue-25-service-interne.md). Le lancement statique et les fichiers manager restent inchangés.

## Contrat public

`POST https://relais.example/feedback`, origine autorisée, `Content-Type: application/json` (charset UTF-8 facultatif), corps exactement `{"message":"ton retour"}`. Texte non vide après trim, maximum 1 800 unités UTF-16, sans contrôles hors tabulation et retours ligne. Corps UTF-8 strict de 8 192 octets maximum, compression refusée. Aucun cookie ou identifiant requis. Prévol OPTIONS autorisé uniquement pour POST et Content-Type.

| Code | Réponse / cause |
| --- | --- |
| 200 | `{"ok":true}` uniquement après un 2xx Discord |
| 204 | Prévol CORS valide, sans corps |
| 400 | `{"error":"invalid_origin"}`, `invalid_method`, `invalid_content_type`, `invalid_preflight`, `invalid_body`, `invalid_message`, `invalid_client_address` ou `body_timeout` |
| 413 | `{"error":"body_too_large"}` |
| 429 | `{"error":"rate_limited"}`, Retry-After : 60 secondes |
| 502 | `{"error":"discord_unavailable"}` (panne, refus, redirection, délai) |
| 503 | `{"error":"busy"}` (concurrence pleine) |
| 404 | `{"error":"not_found"}` |

Une coupure pendant la lecture peut fermer la connexion. Ne pas réessayer automatiquement un 502 : Discord peut avoir accepté le message avant une perte de réponse. Le service ne garantit pas une livraison unique. Les mentions utilisateurs, rôles et everyone sont désactivées explicitement dans chaque appel Discord. Le formulaire #16 pourra recevoir l'URL publique du relais comme configuration publique, jamais le webhook.

## Configuration et exploitation

Exemple de variables **serveur** (les valeurs ci-dessous sont des exemples sans secret) :

```text
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123/EXEMPLE_NON_FONCTIONNEL
FEEDBACK_ORIGINS=https://arosare.github.io,http://localhost:8101,http://localhost:9101
FEEDBACK_HOST=127.0.0.1
FEEDBACK_PORT=9101
FEEDBACK_TRUSTED_PROXIES=127.0.0.1
```

Lancer séparément `node relay/server.mjs`. Webhook absent/invalide ou origines absentes/invalides : arrêt avec code 1 et diagnostic générique. Seuls les webhooks HTTPS discord.com sur le chemin officiel sont acceptés ; identifiants URL, ports, query et fragment sont refusés. Redirections interdites. Les origines sont des origines HTTPS exactes, séparées par virgules, sans chemin ni slash final. Une origine GitHub Pages autorise tous les chemins de cet hôte : CORS ne constitue ni authentification ni protection anti-abus, un client non navigateur peut falsifier Origin.

Héberger sur un service Node persistant séparé de Pages, sous HTTPS avec certificat valide et reverse proxy. Garder l'écoute loopback et bloquer l'accès direct au port interne par pare-feu. Stocker le webhook dans le gestionnaire de secrets de l'hébergeur ou dans un fichier d'environnement hors dépôt, protégé par droits limités au compte du service ; jamais dans une commande shell historisée, les ressources publiques, logs ou git. Ne pas journaliser corps, variables d'environnement ou destination ; configurer également le proxy et l'observabilité pour les masquer. Révoquer le webhook si compromis. Aucun chargement automatique de fichier .env.

### Frontière proxy explicite

`FEEDBACK_TRUSTED_PROXIES` est une liste de 1 à 32 adresses IP exactes séparées par des virgules (IPv4 ou IPv6, sans port, zone, CIDR, nom DNS ni joker). Variable absente : aucune confiance proxy ; variable vide ou invalide : démarrage refusé. Ne déclarer que les adresses socket des proxies administrés, jamais celles des visiteurs ni une plage globale. Les adresses sont normalisées, y compris IPv4 mappée en IPv6.

Depuis une socket autorisée, le relais exige exactement un champ `X-Real-IP` contenant une seule adresse IP valide. Absence, doublons, liste, port, zone ou valeur invalide : 400 `invalid_client_address`, sans transmission Discord ni allocation de quota. Depuis toute autre socket, les en-têtes d'adresse sont ignorés et le quota reste attaché à la socket. `Forwarded` et `X-Forwarded-For` ne servent jamais à identifier un client. Le corps et le contrat du formulaire restent identiques.

Exemple Nginx sur **la même machine** que le relais, directement exposé aux visiteurs (aucun CDN/proxy amont). Dans le bloc HTTPS existant avec certificat valide :

```nginx
location = /feedback {
    client_max_body_size 8k;
    client_body_timeout 5s;
    proxy_connect_timeout 2s;
    proxy_read_timeout 12s;
    proxy_pass http://127.0.0.1:9101;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For "";
    proxy_set_header Forwarded "";
}
```

Nginx **remplace** tout `X-Real-IP` visiteur par l'adresse socket et supprime les deux autres champs ; ne pas utiliser `$http_x_real_ip` ni `$proxy_add_x_forwarded_for`. Ne pas configurer `real_ip_header`/`set_real_ip_from` globalement : `$remote_addr` doit rester le pair réseau réel. Avec un proxy amont, cet exemple doit être adapté à une frontière administrée et explicitement limitée avant utilisation. Références : [proxy_set_header](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header), [remote_addr](https://nginx.org/en/docs/http/ngx_http_core_module.html#var_remote_addr).

Le relais écoute uniquement `127.0.0.1:9101` (`FEEDBACK_HOST=127.0.0.1`) et Nginx s'y connecte en IPv4 ; seule cette adresse est donc autorisée. Ne publier ni rediriger ce port dans Docker, le routeur ou le pare-feu. Exemple sur un hôte Linux UFW, à intégrer à la politique existante : `sudo ufw deny in to any port 9101 proto tcp` et autoriser uniquement HTTPS public (443) ; le trafic loopback doit rester autorisé. Vérifier avec `ss -ltn` que 9101 écoute sur 127.0.0.1 et depuis une autre machine que sa connexion est refusée. Les processus locaux sont dans la frontière de confiance : un service local non fiable ne doit pas pouvoir joindre le relais. Pour des machines distinctes, imposer un réseau privé et une règle pare-feu autorisant uniquement le proxy, puis déclarer son IP exacte.

Ajouter au proxy des limites de connexions et de débit par adresse socket, notamment contre les requêtes lentes. Ne jamais exposer le port interne pour contourner cette frontière.


En mono-instance : 3 transmissions par adresse client validée (ou socket sans proxy autorisé) et 30 globalement par fenêtre fixe de 60 s, 10 000 adresses au maximum (table pleine : refus), 4 appels sortants sans file d'attente, délai Discord 5 s, lecture/entêtes 5 s, 128 connexions entrantes au maximum. Les tentatives transmises consomment les quotas même si Discord échoue. Fenêtres fixes : pics possibles aux frontières ; IP partagées/NAT pénalisées ; IPv6 ou botnets peuvent contourner la limite par adresse. Quota global reste indispensable. Les quotas en mémoire se réinitialisent au redémarrage et ne se partagent pas entre processus. Plusieurs instances nécessitent un stockage partagé avec opérations atomiques, expiration et limites globales de concurrence ; multiplier les processus multiplie actuellement les quotas. Surveiller les codes d'erreur sans contenu utilisateur, prévoir rotation du secret et supervision du processus. Aucune dépendance npm supplémentaire.

## Vérification locale sans webhook réel

`node --test tests/feedback-relay.test.js` lance le relais sur 9101 et un Discord HTTP simulé sur un port éphémère, puis ferme les serveurs. L'injection de destination existe dans l'API de test ; l'exécutable conserve la validation HTTPS stricte. `npm test` puis `npm run build` vérifient le projet. Le build utilise SITE_FILES.json et n'inclut ni relay/, ni tests/, ni configuration serveur. Le test d'artefact ci-dessous contrôle aussi dist après build.

## Contrôle MakeProject et approbation #57

`node scripts/check-feedback-preflight.mjs` effectue uniquement deux OPTIONS réels vers le relais public, sans interception ni POST. Il rapporte le statut et les en-têtes de chaque origine et sort avec code 1 si un prévol échoue (réseau/TLS compris). Aucun serveur local n’est nécessaire. `node scripts/check-makeproject-feedback.mjs` lance également ce contrôle, puis les scénarios navigateur interceptés sur 9101 ; un succès simulé ne peut effacer un blocage distant. Les simulations ne prouvent aucune réception Discord. Voir le [rapport et la procédure minimale à approuver](../docs/issue-57-makeproject-cors.md).

Les exceptions HTTP sont limitées à `http://localhost:8101` et `http://localhost:9101`, uniquement si explicitement présentes dans `FEEDBACK_ORIGINS`. Aucun ajout automatique, joker, autre port, alias IP ou HTTP distant. Toutes les autres origines doivent rester HTTPS et exactes.
