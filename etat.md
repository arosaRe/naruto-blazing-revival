# État actuel
- Phase : inventaire des sources accessibles pour l’import personnel (#3).
- #1 et #6 sont terminées et fermées ; #2 est terminée ; leurs PR ont été mergées dans nightly.
- Le clone contient catalogue.json et le générateur de référence ; docs/contexte/, les sept captures et ma-box-blazing.json sont absents.
- L’import personnel n’est pas validé dans le site ; personnages, 36 stocks, ryō, monnaie premium et objets restent à vérifier à partir des sources.
- Aucune sauvegarde complète ne sera produite avant réception des pièces personnelles manquantes.
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
- La référence d’import est générée par le build ; l’absence de dist dans le dépôt ne signifie pas que les sources externes ont été consultées.
- Aucun fichier personnel fourni par le PDG ni aucune capture n’est présent dans le clone.

# Dette connue
- Le contrôle de l’import personnel attend les sources manquantes.
- Aucun framework de test séparé n’est configuré.

# Prochaines étapes
- Terminer #3 : inventorier les fichiers natifs accessibles et préciser les pièces manquantes.
- Après réception des captures et du JSON, vérifier les valeurs, clarifier les ambiguïtés, puis produire et valider #4.
- Ne proposer aucune mise en production avant approbation humaine.
