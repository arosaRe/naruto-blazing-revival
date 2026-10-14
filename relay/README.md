# Relais de retours — contrat pour #16

Service Node.js 24 sans dépendance, séparé de GitHub Pages. Aucun déploiement n'est réalisé. Le lancement statique et les fichiers manager restent inchangés.

## Contrat public

`POST https://relais.example/feedback`, origine autorisée, `Content-Type: application/json` (charset UTF-8 facultatif), corps exactement `{"message":"ton retour"}`. Texte non vide après trim, maximum 1 800 unités UTF-16, sans contrôles hors tabulation et retours ligne. Corps UTF-8 strict de 8 192 octets maximum, compression refusée. Aucun cookie ou identifiant requis. Prévol OPTIONS autorisé uniquement pour POST et Content-Type.

| Code | Réponse / cause |
| --- | --- |
| 200 | `{"ok":true}` uniquement après un 2xx Discord |
| 204 | Prévol CORS valide, sans corps |
| 400 | `{"error":"invalid_origin"}`, `invalid_method`, `invalid_content_type`, `invalid_preflight`, `invalid_body`, `invalid_message` ou `body_timeout` |
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
FEEDBACK_ORIGINS=https://arosare.github.io
FEEDBACK_HOST=127.0.0.1
FEEDBACK_PORT=9101
```

Lancer séparément `node relay/server.mjs`. Webhook absent/invalide ou origines absentes/invalides : arrêt avec code 1 et diagnostic générique. Seuls les webhooks HTTPS discord.com sur le chemin officiel sont acceptés ; identifiants URL, ports, query et fragment sont refusés. Redirections interdites. Les origines sont des origines HTTPS exactes, séparées par virgules, sans chemin ni slash final. Une origine GitHub Pages autorise tous les chemins de cet hôte : CORS ne constitue ni authentification ni protection anti-abus, un client non navigateur peut falsifier Origin.

Héberger sur un service Node persistant séparé de Pages, sous HTTPS avec certificat valide et reverse proxy. Garder l'écoute loopback et bloquer l'accès direct au port interne par pare-feu. Stocker le webhook dans le gestionnaire de secrets de l'hébergeur ou dans un fichier d'environnement hors dépôt, protégé par droits limités au compte du service ; jamais dans une commande shell historisée, les ressources publiques, logs ou git. Ne pas journaliser corps, variables d'environnement ou destination ; configurer également le proxy et l'observabilité pour les masquer. Révoquer le webhook si compromis. Aucun chargement automatique de fichier .env.

Le relais ignore toujours Forwarded et X-Forwarded-For : le client est l'adresse socket. Derrière un proxy, tous ses clients partagent donc le quota de cette adresse. Appliquer au proxy une limite par IP réelle ; le proxy doit supprimer les en-têtes fournis par le visiteur et reconstruire les siens, avec une liste explicite de proxies de confiance si une future version les exploite. Ne pas activer une confiance globale dans ces en-têtes. Ajouter limites de connexions et de corps au proxy, y compris contre les requêtes lentes.

En mono-instance : 3 transmissions par adresse socket et 30 globalement par fenêtre fixe de 60 s, 10 000 adresses au maximum (table pleine : refus), 4 appels sortants sans file d'attente, délai Discord 5 s, lecture/entêtes 5 s, 128 connexions entrantes au maximum. Les tentatives transmises consomment les quotas même si Discord échoue. Fenêtres fixes : pics possibles aux frontières ; IP partagées/NAT pénalisées ; IPv6 ou botnets peuvent contourner la limite par adresse. Quota global reste indispensable. Les quotas en mémoire se réinitialisent au redémarrage et ne se partagent pas entre processus. Plusieurs instances nécessitent un stockage partagé avec opérations atomiques, expiration et limites globales de concurrence ; multiplier les processus multiplie actuellement les quotas. Surveiller les codes d'erreur sans contenu utilisateur, prévoir rotation du secret et supervision du processus. Aucune dépendance npm supplémentaire.

## Vérification locale sans webhook réel

`node --test tests/feedback-relay.test.js` lance le relais sur 9101 et un Discord HTTP simulé sur un port éphémère, puis ferme les serveurs. L'injection de destination existe dans l'API de test ; l'exécutable conserve la validation HTTPS stricte. `npm test` puis `npm run build` vérifient le projet. Le build utilise SITE_FILES.json et n'inclut ni relay/, ni tests/, ni configuration serveur. Le test d'artefact ci-dessous contrôle aussi dist après build.
