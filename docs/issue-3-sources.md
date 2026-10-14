# Issue #3 — Sources accessibles pour l’import de la box

État des lieux initial effectué le 14 octobre 2026 dans le clone de travail `nightly` et dans la session accessible à l’agent. Les constats ci-dessous sont conservés comme historique de cette vérification, pas comme une nouvelle consultation ni comme des conditions de clôture actuelles.

Le périmètre actuel est celui décidé par le PDG le 14 octobre 2026 et précisé dans l’issue #12 : références natives et limites documentées (critère 2), prompt réutilisable et import sûr (critère 3). Cette mise à jour est documentaire seulement : aucune demande ni consultation de fichiers personnels, aucune modification fonctionnelle.

## État des lieux initial — résultat

Aucune des sept captures annoncées ni aucun fichier `ma-box-blazing.json` n’est présent dans le dépôt ou dans `docs/contexte/`. L’énumération du dépôt ne révèle que `arosa.json`, qui contient `{"publicDefaults":true,"collection":[]}` : c’est un état de démonstration/public par défaut, pas une sauvegarde personnelle exploitable. Les consignes du prompt ne sont pas des observations de la box.

En conséquence, aucune entrée de personnage ni aucun stock appartenant au PDG n’a été vérifié dans cet état des lieux. Les identités, progressions, quantités et monnaie personnelles restent non vérifiées ; aucune valeur inconnue ne devient zéro ou une valeur déduite. Aucun unitId ne peut être retenu pour sa box à partir de ces références seules, et aucun portrait n’a été utilisé pour en déduire un personnage. La remise de pièces personnelles n’est plus attendue dans le périmètre actuel.

## État des lieux initial — sources effectivement vérifiées

- `catalogue.json` (15 087 112 octets) est un catalogue de jeu local structuré, avec notamment 1 114 formes client (`summary.clientCharacterForms`), 702 versions dans `all`, et 369 entrées natives de matériaux (`summary.materialRecords`). Sa version client est `NBRC3.00.032`. Ce sont des données de référence du jeu, pas des données du compte.
- `box-import.js` contient `buildImportReference`, le générateur des lignes de personnages et de ressources à partir du catalogue et de `logos.json`.
- `scripts/build-import-reference.mjs` lit `dist/catalogue.json` et `dist/logos.json`, puis produit `box-import-reference.json`, un index HTML et des pages HTML par personnage et pour les ressources. Le script annonce explicitement n’utiliser que le catalogue/les ressources publiques, sans données de compte.
- Une sortie locale générée est déjà présente dans `dist/` : `dist/box-import-reference.json` (560 725 octets), `dist/reference-pour-chatgpt.html` (27 829 octets), `dist/import-reference/` et les ressources de site. Le JSON local indique `clientVersion: NBRC3.00.032`, 1 114 formes de personnages et 371 ressources. La différence 369/371 s’explique par l’ajout, dans la référence d’import, des deux stocks calculés `ryo` et `tokens` aux matériaux natifs.
- `box-import.schema.json` décrit le format `naruto-blazing-box` version 1. Il permet notamment `ryo` et `tokens`, ainsi que des clés de matériaux, cristaux, pilules, ramen et parchemins ; il ne fournit aucune quantité possédée.
- `import-box-prompt.txt` décrit les critères de lecture et les règles de prudence. Il ne contient aucune capture ni valeur de box.
- `logos.json` est la source de logos consommée par le générateur ; les portraits et sprites distribués existent localement sous `dist/client-images/` et `dist/client-card-sprites/`.
- `arosa.json` a été ouvert et ne contient aucune collection personnelle.

La référence publiée a été tentée aux URL `https://arosare.github.io/naruto-blazing-revival/reference-pour-chatgpt.html` et `https://arosare.github.io/naruto-blazing-revival/box-import-reference.json` avec l’outil web disponible. Celui-ci a retourné « URL … is not accessible via this tool » dans les deux cas : la référence publiée n’est donc pas déclarée consultée. La sortie locale générée ci-dessus est, elle, présente et a été lue.

## État des lieux initial — identifiants et faits établis par les sources locales

Exemple de contrôle croisé concret, sans lien avec la box du PDG : `dist/box-import-reference.json` associe Naruto Uzumaki, titre *The Worst Loser*, élément Heart, famille `client-10015-naruto-uzumaki-the-worst-loser` et carte 1/2/3 aux `unitId` 10013 (3★), 10014 (4★) et 10015 (5★). La référence locale contient ces lignes et leurs plafonds client. Ils prouvent que ces identifiants existent dans le catalogue de référence ; faute de captures, aucun n’est retenu comme personnage de la box.

La référence décrit aussi des **clés**, libellés et identifiants natifs d’objets, pas leur quantité possédée. Exemples consultés dans les lignes locales : `scroll:Heart:1` → `nativeUnitId` 11431 (parchemin d’éveil Cœur 1★), `ramen:Heart:1` → 11511, `pill:hp:2` → 11812, `stone` → 12966 (Acquisition Stone / Activation Crystal), `shard` → 13555. Les entrées `ryo` (Ryō) et `tokens` (Jetons) ont `nativeUnitId: null` ; ce sont des clés de stock/planification du modèle, et non des objets natifs observés dans l’inventaire.

**Monnaie premium : en suspens.** Les sources locales consultées exposent Ryō, Jetons, pierres/fragments d’acquisition et les matériaux listés, mais aucune source accessible n’associe clairement une monnaie visible sur une capture au solde premium du compte. La ligne `tokens` décrit les jetons d’achat estimés pour des cristaux manquants ; elle ne certifie pas une monnaie premium possédée. Aucun solde ne peut être rapporté.

**Ressources ambiguës : leur nomenclature de référence est consultable, leur identification sur la box ne l’est pas.** Les 371 lignes incluent clés canoniques, alias, noms/titres, rareté, élément et URL de portrait ; le générateur conseille de croiser portrait, libellé et rareté. Sans les captures, aucune ligne ne peut être attribuée à un objet effectivement détenu, et aucune quantité n’est vérifiable. Les alias d’une ligne (ex. `material:11431` et `special:11431`) représentent le même objet selon la référence, pas deux stocks observés.

## État des lieux initial — éléments manquants et consultés

Éléments absents vérifiés :

- le dossier `docs/contexte/` lui-même ;
- les sept captures de personnages et de ressources ;
- `ma-box-blazing.json` ;
- toute autre sauvegarde personnelle. `arosa.json` est présent, mais son contenu vide/default a été contrôlé et ne constitue pas une box personnelle.

Fichiers du dépôt effectivement ouverts ou lus pour ce rapport : `catalogue.json`, `box-import.js` (extrait pertinent par recherche), `scripts/build-import-reference.mjs`, `dist/box-import-reference.json`, `box-import.schema.json`, `import-box-prompt.txt`, `arosa.json` et `lancer.json`. `logos.json`, `dist/reference-pour-chatgpt.html` et les dossiers `dist/client-images/` / `dist/client-card-sprites/` ont été repérés par énumération ou dans le code du générateur, mais leur contenu n’a pas été ouvert. L’existence des pièces manquantes a été vérifiée par énumération ; les images de référence n’ont pas été ouvertes, car aucune capture personnelle ne permettait de sélectionner des portraits pertinents. Les URLs publiées sont seulement mentionnées comme tentatives échouées, pas comme fichiers consultés.

## Périmètre actuel — décision du PDG du 14 octobre 2026

Les trois demandes personnelles reprises par l’audit sont **abandonnées par décision explicite du PDG**, et ne sont pas déclarées réalisées :

1. Obtenir les pièces personnelles (les sept captures et `ma-box-blazing.json`).
2. Vérifier les quantités, les personnages et la monnaie du compte à partir de ces pièces.
3. Produire puis importer un JSON personnel issu de ces pièces.

Aucune de ces demandes ne conditionne désormais la clôture. Aucun fichier personnel n’est demandé, recherché ou consulté pour cette mise à jour. Les références du jeu ne prouvent ni une possession, ni une quantité, ni un solde du compte ; les identités, quantités et monnaie personnelles restent non vérifiées. Le parcours réutilisable ci-dessous constitue le livrable actuel, sans prétendre qu’un relevé personnel a été produit ou importé.

### Critère 2 révisé — références natives accessibles et limites documentées

Depuis **Sources & sauvegarde**, la rubrique **Références natives et limites** donne accès à :

- l’[index des personnages](../reference-pour-chatgpt.html) et ses pages de formes ;
- la [page des ressources](../import-reference/ressources.html) ;
- la [référence JSON téléchargeable](../box-import-reference.json), avec identifiants, clés, plafonds et portraits de référence ;
- le [schéma JSON téléchargeable](../box-import.schema.json).

Les trois premiers liens visent les pages et fichiers générés dans `dist/` par le build, puis servis à la racine du site ; ce ne sont pas des fichiers sources à ouvrir directement dans le dépôt. Le schéma est copié dans cette même sortie. Leur présence locale et leur accès depuis le site sont distincts des tentatives de consultation des URL publiées consignées dans l’état des lieux initial : cet historique n’atteste pas leur disponibilité distante actuelle.

Ces références décrivent le jeu, pas le compte. Un portrait peut manquer ou rester ambigu ; un plafond ne prouve pas une progression. Un `unitId` doit correspondre à une forme native identifiée avec certitude, en croisant les informations disponibles (nom, titre, carte, rareté, élément). Une identité ambiguë est exclue et signalée dans `notes`, sans identifiant inventé. Les clés `ryo` et `tokens` et les alias de matériaux ne prouvent aucun stock personnel ni aucune monnaie premium.

### Critère 3 révisé — prompt réutilisable et JSON photo compatible

Dans **Sources & sauvegarde**, le parcours d’import propose **Copier le prompt** et le téléchargement de [`import-box-prompt.txt`](../import-box-prompt.txt). Si le presse-papiers est indisponible, une zone de texte permet la copie manuelle. Le prompt précise les références, leurs limites, la gestion des lots et doublons, les exclusions et les inconnues.

Le livrable demandé par ce prompt est un fichier UTF-8 `ma-box-blazing.json`, téléchargeable si l’outil qui exécute le prompt peut créer un fichier ; sinon un bloc JSON complet à enregistrer sous ce nom. Il utilise le format photo `naruto-blazing-box`, version `1`, avec `username`, `characters`, `stocks` et `notes`, compatible avec le schéma et l’import du site. Il s’agit d’un contrat de sortie réutilisable, pas d’un JSON personnel réalisé dans cette tâche ni d’une garantie de téléchargement fournie par un outil externe.

Les valeurs absentes, illisibles ou incertaines restent `null` ou absentes selon le format. Zéro exige une observation certaine. Les personnages exclus, ressources non identifiées, contradictions et limites d’un relevé partiel sont signalés dans `notes` ; un relevé partiel ou vide ne doit pas être présenté comme une sauvegarde complète.

### Procédure réutilisable préservant les données existantes

Cette procédure documente le parcours disponible ; elle n’est pas exécutée sur les données du PDG dans le cadre de l’issue #12.

1. Depuis **Sources & sauvegarde**, exporter une sauvegarde du site et conserver ce point de restauration avant tout import.
2. Contrôler le format du JSON photo, ses identifiants, ses notes, exclusions et inconnues. Utiliser **Importer un fichier JSON** ou coller le contenu dans la zone prévue.
3. L’import photo fusionne les observations avec la box existante : seules les valeurs numériques connues des personnages observés et les stocks numériques fournis sont appliqués. Les personnages observés deviennent possédés ; les personnages et stocks absents et les champs `null` préservent les valeurs existantes. Un relevé photo vide ne vide pas la box.
4. Vérifier le résumé d’import, les notes et les personnages/stocks modifiés. Les inconnues restent signalées et ne sont pas remplacées par des valeurs inventées.
5. Distinguer ce relevé photo d’une sauvegarde complète exportée par le site : restaurer cette dernière remplace l’état personnel par celui du fichier. Conserver l’export préalable pour pouvoir revenir à l’état antérieur.

La clôture porte sur ces critères révisés et ces livrables réutilisables, avec un build réussi, sans validation des données personnelles ni changement fonctionnel.
