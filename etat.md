# État actuel
- Reprise du dépôt original sur `nightly`, à jour avec le dépôt GitHub.
- Phase : implémentation de l’initialisation des stocks à zéro (#1).
- Issue #1 confiée : initialiser à zéro les stocks pris en charge pour une box neuve, sans altérer imports et sauvegardes existants.
- L’import photo remplace l’état entier après validation ; le cas d’un tableau `characters` vide doit être protégé.
- Le catalogue contient les identifiants natifs et la référence d’import est générée au build.
- `docs/contexte/`, les sept captures et `ma-box-blazing.json` ne sont pas présents dans ce clone.
- Aucune validation de cet import dans le site n’est établie.
- En attente du PDG : validation du plan et fourniture des sources absentes, ou confirmation de leur emplacement accessible.

# Retours du PDG
- 2026-10-14 — Reprendre le dépôt GitHub original tel quel ; ne pas créer de dépôt préfixé MP ni de copie. Conserver l’ancien projet MakeProject comme historique.
- 2026-10-14 — Travailler sur `nightly` ; ne pas publier en production sans approbation humaine.
- 2026-10-14 — Priorité : une nouvelle box commence avec tous ses stocks à zéro, sans saisie initiale ; préserver imports et sauvegardes existants.
- 2026-10-14 — Reprendre l’import sûrement : ne pas présenter un fichier partiel comme sauvegarde complète, ne jamais inventer de `unitId`, protéger les personnages existants contre un import vide/partiel.
- 2026-10-14 — Examiner la référence, les données natives et les sept captures ; vérifier valeurs et monnaie, signaler les ambiguïtés, tester l’import et ajouter des régressions.

# Décisions structurantes
- Site statique JavaScript natif, HTML et CSS ; Node.js 24 et Python 3 pour le build.
- `nightly` est la branche de travail ; `main` est la production protégée par approbation humaine.
- Une sauvegarde utilisateur doit rester compatible ; une donnée non vérifiée reste inconnue.
- Les identifiants de personnages proviennent des identifiants natifs vérifiés du catalogue.
- `lancer.json` exécute le build puis sert `dist/` ; son test pertinent est `npm run build`.

# Pièges et consignes
- Le profil personnel passe par `initialPersonalState` et déclare actuellement `stocks: {}` ; les stocks manquants restent inconnus.
- L’import photo construit un nouvel état personnel. Ne pas attribuer au JSON incomplet la sémantique d’une sauvegarde intégrale.
- La référence d’import est produite par le build ; l’absence d’une page générée dans le dépôt ne prouve pas que les sources visuelles externes sont accessibles.
- Aucun fichier de référence fourni par le PDG ni aucune capture n’a été trouvé dans le clone.

# Dette connue
- Aucun framework de test n’est configuré.
- Le contrôle visuel de l’import attend les sources manquantes.

# Prochaines étapes
- Attendre la réponse déjà sollicitée : validation du plan et accès au fichier « Référence pour ChatGPT », aux sept captures et au JSON partiel.
- Relire le résultat de l’issue #1 ; poursuivre ensuite la protection des imports partiels.
- Protéger l’import des données existantes et ajouter les tests ciblés.
- Vérifier les sources disponibles, clarifier les ressources et produire/importer le JSON seulement avec les identifiants étayés.
- Exécuter build et validation dans le site ; aucune production avant accord humain.
