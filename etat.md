# État actuel
- Phase : attente des sources personnelles nécessaires à la sauvegarde vérifiée (#4).
- #1, #2, #3 et #6 sont terminées ; les PR correspondantes ont été mergées dans nightly.
- Le rapport #3 confirme que le catalogue et la référence locale permettent de vérifier des identifiants natifs, pas le contenu du compte.
- Les sept captures et ma-box-blazing.json manquent ; les 36 stocks, 59 700 950 ryō, personnages et monnaie premium ne sont pas vérifiés.
- #4 ne peut pas produire de sauvegarde personnelle complète avant réception des pièces ; ne rien inférer des portraits.
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

# Décisions structurantes
- Site statique en JavaScript natif, HTML et CSS ; Node.js 24 et Python 3 pour le build.
- nightly est la branche de travail ; main est la production protégée par approbation humaine.
- Sauvegardes compatibles ; une donnée absente, illisible ou ambiguë reste inconnue.
- Les identifiants de personnages viennent des identifiants natifs vérifiés du catalogue ; jamais d’inférence depuis un portrait ambigu.
- lancer.json décrit le build et le serveur statique ; son manifeste doit être un JSON lisible par MakeProject et utiliser PORT.

# Pièges et consignes
- Un import photo construit un état personnel complet ; un JSON partiel ne doit pas remplacer les observations existantes.
- La référence d’import est générée par le build ; l’absence des sources personnelles ne signifie pas que les comptes ou captures ont été consultés.
- Le rapport #3 distingue les fichiers effectivement consultés des fichiers manquants ; aucune pièce personnelle n’est présente dans le clone.

# Dette connue
- La validation de l’import personnel attend les captures et ma-box-blazing.json.
- Aucun framework de test séparé n’est configuré.

# Prochaines étapes
- Attendre que le PDG fournisse les sept captures et ma-box-blazing.json.
- À réception, vérifier les valeurs dans les sources, clarifier les ambiguïtés et reprendre #4 pour produire puis valider l’import.
- Ne proposer aucune mise en production avant approbation humaine.
