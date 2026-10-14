# État actuel
- Phase : livrables sur nightly ; audit de sécurité terminé sans faille relevée ; contrôle indépendant de clôture demandé.
- Le prompt réutilisable d’import est disponible depuis Sources & sauvegarde.
- Les stocks d’une box neuve sont initialisés à zéro ; l’import photo fusionne les observations connues avec l’état existant.
- L’objectif personnel a été remplacé par le prompt réutilisable ; le PDG ne fournira ni captures ni fichier personnel.
- Les critères 2 et 3 sont remplacés avec validation du PDG ; aucune vérification personnelle n’est exigée ou autorisée.
- Aucune mise en production sans approbation humaine.

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

- 2026-10-14 — Le PDG valide le remplacement du critère 2 : références natives accessibles et limites documentées, sans identifiant inventé.
- 2026-10-14 — Le PDG valide le remplacement du critère 3 : prompt copiable et téléchargeable depuis Sources & sauvegarde, demandant un JSON photo compatible et téléchargeable, signalant les données inconnues et expliquant une procédure d’import qui préserve les données existantes.
- 2026-10-14 — Aucune consultation ni vérification des fichiers personnels du PDG n’est exigée ou autorisée ; conserver nightly et ne rien publier en production sans son approbation.
- 2026-10-14 — Le PDG confirme « oui c’est bon » et demande ce que signifie le critère 2 ; explication : les références permettent de vérifier les identifiants du jeu, sans garantir l’identification d’un portrait ambigu.

# Décisions structurantes
- Site statique en JavaScript natif, HTML et CSS ; Node.js 24 et Python 3 pour le build.
- nightly est la branche de travail ; main est la production protégée par approbation humaine.
- Sauvegardes compatibles ; une donnée absente, illisible ou ambiguë reste inconnue.
- Les identifiants de personnages viennent des identifiants natifs vérifiés du catalogue ; jamais d’inférence depuis un portrait ambigu.
- lancer.json décrit le build et le serveur statique ; son manifeste doit être un JSON lisible par MakeProject et utiliser PORT.
- L’import photo fusionne les champs observés et préserve les valeurs absentes ou nulles ; la restauration d’une sauvegarde complète est distincte.

# Pièges et consignes
- La référence d’import décrit le jeu, pas une box personnelle ; ne jamais laisser croire que des captures ou un compte ont été consultés.
- Le prompt distingue les observations d’image, les références du catalogue et les inférences impossibles.
- Un import photo vide ne vide pas la box ; vérifier le comportement réel avant de décrire toute procédure d’import.

# Dette connue
- Aucune dette bloquante connue dans le périmètre validé ; la vérification personnelle est abandonnée sur décision du PDG.
- Les régressions utilisent le lanceur natif de Node.js, sans framework externe.

# Prochaines étapes
- Soumettre la checklist révisée au contrôle indépendant de clôture : stocks neufs à zéro, sauvegardes compatibles, références et limites documentées, prompt accessible, import conservant les données, régressions et build validés.
- Si ce contrôle relève des critères manquants, créer une petite issue par manque avant de reprendre les travaux.
- Aucune mise en production avant approbation humaine.
