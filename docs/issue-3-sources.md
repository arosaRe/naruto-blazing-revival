# Issue #3 — Sources accessibles pour l’import de la box

Vérification effectuée le 14 octobre 2026 dans le clone de travail `nightly` et dans la session accessible à l’agent.

## Résultat

Aucune des sept captures annoncées ni aucun fichier `ma-box-blazing.json` n’est présent dans le dépôt ou dans `docs/contexte/`. L’énumération du dépôt ne révèle que `arosa.json`, qui contient `{"publicDefaults":true,"collection":[]}` : c’est un état de démonstration/public par défaut, pas une sauvegarde personnelle exploitable. Les consignes du prompt ne sont pas des observations de la box.

En conséquence, aucune entrée de personnage ni aucun stock appartenant au PDG n’est vérifiable. `characters` et les quantités de `stocks` doivent rester non renseignés jusqu’à réception des captures et de la sauvegarde. Aucun unitId ne peut être retenu pour sa box à partir des sources actuelles, et aucun portrait n’a été utilisé pour en déduire un personnage.

## Sources effectivement vérifiées

- `catalogue.json` (15 087 112 octets) est un catalogue de jeu local structuré, avec notamment 1 114 formes client (`summary.clientCharacterForms`), 702 versions dans `all`, et 369 entrées natives de matériaux (`summary.materialRecords`). Sa version client est `NBRC3.00.032`. Ce sont des données de référence du jeu, pas des données du compte.
- `box-import.js` contient `buildImportReference`, le générateur des lignes de personnages et de ressources à partir du catalogue et de `logos.json`.
- `scripts/build-import-reference.mjs` lit `dist/catalogue.json` et `dist/logos.json`, puis produit `box-import-reference.json`, un index HTML et des pages HTML par personnage et pour les ressources. Le script annonce explicitement n’utiliser que le catalogue/les ressources publiques, sans données de compte.
- Une sortie locale générée est déjà présente dans `dist/` : `dist/box-import-reference.json` (560 725 octets), `dist/reference-pour-chatgpt.html` (27 829 octets), `dist/import-reference/` et les ressources de site. Le JSON local indique `clientVersion: NBRC3.00.032`, 1 114 formes de personnages et 371 ressources. La différence 369/371 s’explique par l’ajout, dans la référence d’import, des deux stocks calculés `ryo` et `tokens` aux matériaux natifs.
- `box-import.schema.json` décrit le format `naruto-blazing-box` version 1. Il permet notamment `ryo` et `tokens`, ainsi que des clés de matériaux, cristaux, pilules, ramen et parchemins ; il ne fournit aucune quantité possédée.
- `import-box-prompt.txt` décrit les critères de lecture et les règles de prudence. Il ne contient aucune capture ni valeur de box.
- `logos.json` est la source de logos consommée par le générateur ; les portraits et sprites distribués existent localement sous `dist/client-images/` et `dist/client-card-sprites/`.
- `arosa.json` a été ouvert et ne contient aucune collection personnelle.

La référence publiée a été tentée aux URL `https://arosare.github.io/naruto-blazing-revival/reference-pour-chatgpt.html` et `https://arosare.github.io/naruto-blazing-revival/box-import-reference.json` avec l’outil web disponible. Celui-ci a retourné « URL … is not accessible via this tool » dans les deux cas : la référence publiée n’est donc pas déclarée consultée. La sortie locale générée ci-dessus est, elle, présente et a été lue.

## Identifiants et faits établis par les sources locales

Exemple de contrôle croisé concret, sans lien avec la box du PDG : `dist/box-import-reference.json` associe Naruto Uzumaki, titre *The Worst Loser*, élément Heart, famille `client-10015-naruto-uzumaki-the-worst-loser` et carte 1/2/3 aux `unitId` 10013 (3★), 10014 (4★) et 10015 (5★). La référence locale contient ces lignes et leurs plafonds client. Ils prouvent que ces identifiants existent dans le catalogue de référence ; faute de captures, aucun n’est retenu comme personnage de la box.

La référence décrit aussi des **clés**, libellés et identifiants natifs d’objets, pas leur quantité possédée. Exemples consultés dans les lignes locales : `scroll:Heart:1` → `nativeUnitId` 11431 (parchemin d’éveil Cœur 1★), `ramen:Heart:1` → 11511, `pill:hp:2` → 11812, `stone` → 12966 (Acquisition Stone / Activation Crystal), `shard` → 13555. Les entrées `ryo` (Ryō) et `tokens` (Jetons) ont `nativeUnitId: null` ; ce sont des clés de stock/planification du modèle, et non des objets natifs observés dans l’inventaire.

**Monnaie premium : en suspens.** Les sources locales consultées exposent Ryō, Jetons, pierres/fragments d’acquisition et les matériaux listés, mais aucune source accessible n’associe clairement une monnaie visible sur une capture au solde premium du compte. La ligne `tokens` décrit les jetons d’achat estimés pour des cristaux manquants ; elle ne certifie pas une monnaie premium possédée. Aucun solde ne peut être rapporté.

**Ressources ambiguës : leur nomenclature de référence est consultable, leur identification sur la box ne l’est pas.** Les 371 lignes incluent clés canoniques, alias, noms/titres, rareté, élément et URL de portrait ; le générateur conseille de croiser portrait, libellé et rareté. Sans les captures, aucune ligne ne peut être attribuée à un objet effectivement détenu, et aucune quantité n’est vérifiable. Les alias d’une ligne (ex. `material:11431` et `special:11431`) représentent le même objet selon la référence, pas deux stocks observés.

## Éléments manquants et consultés

Éléments absents vérifiés :

- le dossier `docs/contexte/` lui-même ;
- les sept captures de personnages et de ressources ;
- `ma-box-blazing.json` ;
- toute autre sauvegarde personnelle. `arosa.json` est présent, mais son contenu vide/default a été contrôlé et ne constitue pas une box personnelle.

Fichiers du dépôt effectivement ouverts ou lus pour ce rapport : `catalogue.json`, `box-import.js` (extrait pertinent par recherche), `scripts/build-import-reference.mjs`, `dist/box-import-reference.json`, `box-import.schema.json`, `import-box-prompt.txt`, `arosa.json` et `lancer.json`. `logos.json`, `dist/reference-pour-chatgpt.html` et les dossiers `dist/client-images/` / `dist/client-card-sprites/` ont été repérés par énumération ou dans le code du générateur, mais leur contenu n’a pas été ouvert. L’existence des pièces manquantes a été vérifiée par énumération ; les images de référence n’ont pas été ouvertes, car aucune capture personnelle ne permettait de sélectionner des portraits pertinents. Les URLs publiées sont seulement mentionnées comme tentatives échouées, pas comme fichiers consultés.

## Suite nécessaire

Fournir les sept captures lisibles et `ma-box-blazing.json` (ou les déposer dans `docs/contexte/`). Les identités, progressions, stocks, monnaie premium et ressources ambiguës pourront alors être confrontés à la référence locale. En attendant, aucune sauvegarde personnelle complète n’est produite et aucune donnée invérifiable n’est transformée en valeur ou en zéro.
