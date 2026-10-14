# Naruto Blazing Revival — consignes de travail

## Stack et commandes
- Site statique en JavaScript natif (modules ES), HTML et CSS ; aucune dépendance npm nécessaire.
- Prérequis : Node.js 24 et Python 3. Construire avec `npm run build` ; la sortie va dans `dist/`.
- En local, servir `dist/` avec `python -m http.server %PORT% --directory dist` après le build. Le build vérifie et extrait les ressources natives puis génère les pages de référence d’import.
- `lancer.json` décrit le lancement attendu par MakeProject ; maintenir ses commandes alignées sur ces instructions.

## Conventions
- Le modèle métier et les sauvegardes sont dans `model.js` ; import photo et référence d’import dans `box-import.js`.
- Garder les sauvegardes compatibles et ne jamais déduire un identifiant natif depuis un portrait ambigu.
- Les champs absents ou illisibles restent inconnus (`null`/absents selon le format), pas inventés.
- Ajouter les tests de non-régression ciblés dans un changement isolé ; aucun framework de test n’est actuellement configuré.
- Toute PR de travail vise `nightly`. `main` est la production et ne doit pas être modifiée sans approbation humaine.
