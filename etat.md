# État actuel
- Phase : reprise après audit et préparation du formulaire de retours Discord, nouveau critère 6.
- Stocks neufs à zéro publiés avec approbation humaine limitée ; imports et sauvegardes existants préservés.
- Prompt réutilisable, références natives et fusion photo sûre livrés sur nightly ; critères 2 et 3 remplacés par décision du PDG.
- Les validations pertinentes déjà rapportées passent ; aucun code modifié par ce cycle manager.
- L’audit a utilisé des exigences personnelles abandonnées ; sa demande de preuve d’approbation reçoit une transcription datée des consignes fournies.
- Le formulaire et son relais restent à réaliser ; webhook et accès d’hébergement non accessibles dans cette session.
- Aucune nouvelle publication autorisée ; aucune décision immédiate attendue du PDG.
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
- Une transcription de consigne fournie au manager doit être identifiée comme telle ; ne pas fabriquer de lien vers une discussion originale inaccessible.

# Dette connue
- Aucune dette mineure identifiée à traiter pour le périmètre révisé ; les données personnelles restent hors périmètre par décision du PDG.

# Prochaines étapes
- Traiter l’issue #17 : critères de clôture applicables, transcription des décisions de 17:33 et 17:51, périmètre publié vérifiable. Les manques personnels de l’audit sont abandonnés, pas réalisés.
- Traiter l’issue #15 : relais Discord secret, validation, limites anti-abus et tests avec service simulé ; documentation d’hébergement, aucun déploiement.
- Après validation du relais, confier l’issue #16 : formulaire accessible, configuration endpoint, succès et échecs vérifiés dans le navigateur.
- Faire auditer la sécurité après intégration ; corriger les constats avant présentation au PDG. Préparer une demande d’approbation concrète avec besoins d’hébergement/configuration protégée ; ne jamais demander le secret dans une issue publique.
- Puis contrôler la clôture sur les six critères, avec 2 et 3 révisés ; ne demander ni consulter aucune pièce personnelle du PDG. Toute publication supplémentaire nécessite son approbation.
