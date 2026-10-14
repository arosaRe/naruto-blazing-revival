# État actuel
- Phase : rendre le prompt d’import personnel réutilisable et sûr (#4).
- #1, #2, #3 et #6 sont terminées et mergées dans nightly.
- Le prompt et la référence native sont disponibles dans le dépôt ; le site expose déjà le prompt depuis Sources & sauvegarde.
- Aucune box personnelle du PDG ne sera fournie ni consultée ; aucune sauvegarde personnelle ne sera produite.
- Le contenu d’une box, les captures, les stocks annoncés et la monnaie premium ne sont pas vérifiés.
- Aucune mise en production sans approbation humaine.

# Retours du PDG
- 2026-10-14 — Reprendre le dépôt GitHub original tel quel ; ne pas créer de dépôt préfixé MP ni de copie. Conserver l’ancien projet MakeProject comme historique.
- 2026-10-14 — Travailler sur nightly ; ne pas publier en production sans approbation humaine.
- 2026-10-14 — Priorité : une nouvelle box commence avec tous ses stocks à zéro, sans saisie initiale ; préserver imports et sauvegardes existants.
- 2026-10-14 — Reprendre l’import sûrement : ne pas présenter un fichier partiel comme sauvegarde complète, ne jamais inventer de unitId, protéger les personnages existants contre un import vide/partiel.
- 2026-10-14 — Examiner la référence, les données natives et les sept captures ; vérifier valeurs et monnaie, signaler les ambiguïtés, tester l’import et ajouter des régressions.
- 2026-10-14 — Le PDG valide le plan et les quatre issues initiales ; les travaux généraux sur stocks à zéro et protection des imports partiels peuvent commencer immédiatement.
- 2026-10-14 — La page « Sources & sauvegarde » identifie box-import-reference.json à la racine publiée comme référence pour vérifier les unitId ; la rechercher dans le dépôt.
- 2026-10-14 — Les sept captures et ma-box-blazing.json ne sont pas joints. Ne pas prétendre les avoir consultés, n’inférer aucun personnage depuis un portrait ambigu, et attendre ces pièces avant tout JSON personnel complet.
- 2026-10-14 — Vérifier les 36 stocks et 59 700 950 ryō à partir des sources ; clarifier la monnaie premium et les objets ambigus ; aucune production sans approbation.
- 2026-10-14 — Le PDG ne fournira pas ses captures ni ma-box-blazing.json et n’autorise pas leur consultation ; le nouvel objectif est un prompt réutilisable pour que chacun joigne ses propres captures à ChatGPT, reçoive un JSON importable, le télécharge puis l’importe.
- 2026-10-14 — Examiner le format et les références natives du dépôt, expliquer les limites et proposer une procédure d’import sûre ; signaler les données incertaines ou manquantes, ne rien inventer et ne pas présenter un résultat partiel comme sauvegarde complète.
- 2026-10-14 — Conserver nightly et ne rien publier en production sans approbation humaine.

# Décisions structurantes
- Site statique en JavaScript natif, HTML et CSS ; Node.js 24 et Python 3 pour le build.
- nightly est la branche de travail ; main est la production protégée par approbation humaine.
- Sauvegardes compatibles ; une donnée absente, illisible ou ambiguë reste inconnue.
- Les identifiants de personnages viennent des identifiants natifs vérifiés du catalogue ; jamais d’inférence depuis un portrait ambigu.
- lancer.json décrit le build et le serveur statique ; son manifeste doit être un JSON lisible par MakeProject et utiliser PORT.

# Pièges et consignes
- Un import photo construit un état personnel ; vérifier exactement comment les observations absentes et un tableau characters vide affectent les données enregistrées.
- La référence d’import décrit le jeu, pas la box personnelle ; ne jamais laisser croire que les captures ou le compte du PDG ont été consultés.
- Le prompt doit distinguer les données lues dans les images des références de catalogue et des inférences impossibles.

# Dette connue
- La monnaie premium et les ressources non identifiées ne sont pas clarifiées pour une box personnelle.
- Aucun framework de test séparé n’est configuré.

# Prochaines étapes
- Faire traiter l’issue #4 réorientée vers le prompt réutilisable, l’explication des limites et la procédure d’import sûre.
- Garder les données du compte et les captures du PDG hors du travail.
- Ne proposer aucune mise en production avant approbation humaine.
