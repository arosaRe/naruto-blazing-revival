# État actuel
- Phase : inventaire SSH initial réalisé en lecture seule ; nettoyage à faire valider, critère 6 ouvert.
- Stocks neufs à zéro publiés avec approbation humaine limitée ; sauvegardes et imports existants préservés.
- Prompt réutilisable, références natives et fusion photo sûre livrés sur nightly ; critères 2 et 3 révisés satisfaits.
- Formulaire et relais Discord intégrés et validés par relecture ; essais navigateur avec Discord simulé rapportés réussis.
- Contrôle sécurité indépendant favorable : confiance proxy bornée, adresses validées, quotas séparés et limites globales conservées.
- Régressions et build réussis selon les jobs développeur et relecteur/app ; non relancés par le manager.
- Accès SSH et sudo disponibles avec la clé autorisée ; deux services tiers actifs. Webhook indisponible, endpoint non configuré, réception réelle non vérifiée.
- Aucune nouvelle publication autorisée ; attente du PDG : approbation du périmètre limité aux retours Discord.
# Retours du PDG
- 2026-10-14 — Reprendre le dépôt GitHub original tel quel ; ne pas créer de dépôt préfixé MP ni de copie. Conserver l’ancien projet MakeProject comme historique.
- 2026-10-14 — Travailler sur nightly ; ne pas publier en production sans approbation humaine.
- 2026-10-14 — Priorité : une nouvelle box commence avec tous ses stocks à zéro, sans saisie initiale ; préserver imports et sauvegardes existants.
- 2026-10-14 — Reprendre l’import sûrement : ne pas présenter un fichier partiel comme sauvegarde complète, ne jamais inventer de unitId, protéger les personnages existants contre un import vide/partiel.
- 2026-10-14 — Examiner la référence, les données natives et les sept captures ; vérifier valeurs et monnaie, signaler les ambiguïtés, tester l’import et ajouter des régressions.
- 2026-10-14 — Le PDG valide le plan et les quatre issues initiales ; les travaux généraux sur stocks à zéro et protection des imports partiels peuvent commencer immédiatement.
- 2026-10-14 — La page « Sources & sauvegarde » identifie box-import-reference.json à la racine publiée comme référence pour vérifier les unitId ; la rechercher dans le dépôt.
- 2026-10-14 — Les sept captures et ma-box-blazing.json ne sont pas joints. Ne pas prétendre les avoir consultés et n’inférer aucun personnage depuis un portrait ambigu. Indiquer précisément les pièces manquantes et attendre avant tout JSON personnel complet.
- 2026-10-14 — Vérifier les 36 stocks et 59 700 950 ryō à partir des sources ; clarifier la monnaie premium et les objets ambigus ; aucune production sans approbation.
- 2026-10-14 — Le PDG ne fournira pas ses captures ni ma-box-blazing.json et n’autorise pas leur consultation ; nouvel objectif : un prompt réutilisable pour que chacun joigne ses propres captures à ChatGPT, obtienne un JSON importable, le télécharge puis l’importe.
- 2026-10-14 — Examiner le format et les références natives du dépôt, expliquer les limites et proposer une procédure sûre ; signaler les incertitudes, ne rien inventer et ne pas présenter un résultat partiel comme complet.
- 2026-10-14 — Conserver nightly et ne rien publier en production sans approbation humaine.

- 2026-10-14 à 17:33 — Le PDG valide le remplacement du critère 2 : références natives accessibles et limites documentées, sans identifiant inventé.
- 2026-10-14 à 17:33 — Le PDG valide le remplacement du critère 3 : prompt copiable et téléchargeable depuis Sources & sauvegarde, demandant un JSON photo compatible et téléchargeable, signalant les données inconnues et expliquant une procédure d’import qui préserve les données existantes.
- 2026-10-14 — Aucune consultation ni vérification des fichiers personnels du PDG n’est exigée ou autorisée ; conserver nightly et ne rien publier en production sans son approbation.
- 2026-10-14 — Le PDG confirme « oui c’est bon » et demande ce que signifie le critère 2 ; explication : les références permettent de vérifier les identifiants du jeu, sans garantir l’identification d’un portrait ambigu.

- 2026-10-14 à 17:51 — Approbation humaine de publication limitée aux stocks initialisés à zéro pour une nouvelle box, avec préservation des imports et sauvegardes existants. Vérifier le contenu et les validations avant publication ; exclure les travaux d’import photo et les corrections des issues 11 et 12. Si d’autres changements fonctionnels sont nécessaires, présenter le périmètre au PDG avant publication. Rapporter la version publiée et les vérifications effectuées.
- 2026-10-14 à 17:56 — Priorité : formulaire accessible sur le site pour envoyer les retours au PDG dans le salon Discord associé au webhook fourni en discussion. Webhook secret côté serveur dans une configuration protégée, jamais dans le dépôt, le JavaScript navigateur ou les fichiers publiés. Prévoir un relais adapté au site statique et une protection anti-abus ; confirmer la réception ou afficher une erreur compréhensible. Travailler sur nightly. L’approbation précédente ne couvre que les stocks neufs à zéro ; présenter cette fonctionnalité avant toute publication en production.
- 2026-10-14 à 21:42 — Consigne transcrite de discussion : reprendre #16 après l’échec d’identité Git ; examiner et conserver branche et modifications. Configurer une identité autorisée localement, sans configuration globale ni identité inventée ; demander nom et adresse seulement si aucune identité autorisée disponible. Reprendre commit et PR vers nightly ; aucune production sans approbation.
- 2026-10-14 à 21:44 — Consigne transcrite de discussion : user.email = anthonypchlbh@gmail.com ; user.name = arosare, autorisés pour la configuration Git locale au dépôt, sans --global. Conserver le travail existant et reprendre commit et PR vers nightly ; aucune publication de cette fonctionnalité sans approbation.
- 2026-10-14 à 22:17 — Consigne transcrite de discussion : VPS Infomaniak ubuntu@179.237.102.19 proposé pour le relais ; nettoyage autorisé sous réserve d’un inventaire des applications, services et données puis présentation du périmètre concret et des sauvegardes nécessaires avant suppression. Préserver Ubuntu et SSH ; préparer ensuite HTTPS, Node.js 24 et le webhook par un canal serveur protégé. Aucune approbation de publication du formulaire.
- 2026-10-14 à 22:20 — Consigne transcrite de discussion : vérifier l’accès SSH autorisé avec la clé de l’ordinateur du PDG ; chemin fourni fictif. Ne jamais afficher ni transmettre de clé privée. Préciser le chemin ou l’accès manquant ; si connexion réussie, inventorier en lecture seule puis présenter le nettoyage avant suppression. Préserver Ubuntu et SSH ; aucune production autorisée.
- 2026-10-14 à 22:28 — Réponse du PDG : C:\Users\antho\.ssh est le dossier des clés ; vérifier noms et informations publiques sans afficher ni transmettre de contenu privé, ni essayer une clé d’un autre projet sans autorisation. Si aucune clé certaine, demander seulement le nom ; après connexion, inventorier en lecture seule et présenter le nettoyage. Préserver Ubuntu et SSH, aucune production.
- 2026-10-14 à 22:35 — Consigne transcrite de discussion : clé publique C:\Users\antho\.ssh\id_ed25519_madfut27.pub ; vérifier et utiliser la clé privée correspondante sans afficher ni copier son contenu. Ne pas utiliser le .pub comme clé privée ; connexion limitée à un inventaire en lecture seule, sinon rapporter le blocage précis. Aucune suppression ni publication.
# Décisions structurantes
- Site statique en JavaScript natif, HTML et CSS ; Node.js 24 et Python 3 pour le build.
- nightly est la branche de travail ; main est la production protégée par approbation humaine. La publication autorisée du 14 octobre isole les stocks neufs à zéro et leurs tests, sans fusion globale de nightly.
- Sauvegardes compatibles ; une donnée absente, illisible ou ambiguë reste inconnue.
- Les identifiants de personnages viennent des identifiants natifs vérifiés du catalogue ; jamais d’inférence depuis un portrait ambigu.
- lancer.json décrit le build et le serveur statique ; son manifeste doit être un JSON lisible par MakeProject et utiliser PORT.
- L’import photo fusionne les champs observés et préserve les valeurs absentes ou nulles ; la restauration d’une sauvegarde complète est distincte.

- Retours Discord : relais Node.js 24 séparé du site GitHub Pages, secret en environnement serveur, endpoint public configurable et contrat POST /feedback ; essais avec Discord simulé avant configuration réelle.

# Pièges et consignes
- La référence d’import décrit le jeu, pas une box personnelle ; ne jamais laisser croire que des captures ou un compte ont été consultés.
- Le prompt distingue les observations d’image, les références du catalogue et les inférences impossibles.
- Un import photo vide ne vide pas la box ; vérifier le comportement réel avant de décrire toute procédure d’import.
- Les contrôles doivent utiliser les critères 2 et 3 remplacés par le PDG ; ne pas réintroduire les demandes personnelles abandonnées et interdites.
- Le résumé doit compter les observations validées reçues, pas la collection après fusion.

- CORS ne suffit pas contre les abus ; limiter les envois côté serveur et maîtriser les adresses IP derrière un proxy. Ne jamais recopier le webhook en issue, log ou artefact.
- Un quota fondé sur la socket du reverse proxy pénalise tous ses visiteurs ; distinguer les clients seulement via une frontière de confiance explicite, sans accepter les en-têtes falsifiés en accès direct.
- Après un échec de job, examiner les branches de secours et conserver le travail ; vérifier la configuration Git locale autorisée avant commit.
- Une transcription de consigne fournie au manager doit être identifiée comme telle ; ne pas fabriquer de lien vers une discussion originale inaccessible.

# Dette connue
- Aucune dette mineure identifiée à traiter pour le périmètre révisé ; les données personnelles restent hors périmètre par décision du PDG.

# Prochaines étapes
- Obtenir l’approbation humaine pour publier uniquement le formulaire de retours et son relais sécurisé ; exclure les travaux d’import photo et toute fusion globale de nightly.
- Faire valider le nettoyage des deux applications tierces actives ou leur maintien : madfut27-watcher et tradispo ; aucun arrêt ni suppression à ce stade.
- Nettoyage proposé après accord et sauvegarde restaurable protégée hors dépôt : services et unités systemd madfut27-watcher/tradispo, répertoires /opt et /var/lib associés, configurations /etc associées (variantes MADFUT comprises), journaux applicatifs identifiés. Préserver Ubuntu, SSH, comptes et clés ; aucune purge générale. Sauvegarder SQLite de façon cohérente, états JSON, configurations secrètes, unités, code et permissions ; vérifier la restauration avant suppression.
- Hébergement observé : environ 52 Go libres, Node 22 installé, Nginx et Docker indisponibles, UFW actif avec SSH seul autorisé. Préparer Node 24, HTTPS et URL publique dans un travail distinct autorisé ; ne pas modifier le réseau durant le nettoyage.
- Configurer le webhook par un canal serveur protégé, jamais dans une issue, le dépôt ou une discussion publique ; isoler et faire relire le périmètre de publication avant de toucher main.
- Après autorisation et configuration, vérifier la réception dans le salon réel, la confirmation et les erreurs sur le site ainsi que les protections réseau et anti-abus ; les simulations ne suffisent pas au critère 6.
- Contrôler les six critères avec 2 et 3 révisés ; aucune consultation des pièces personnelles du PDG.
