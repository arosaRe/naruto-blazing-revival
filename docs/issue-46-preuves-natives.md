# #46 — Preuves natives et matrice d’import

Rapport du 15 octobre 2026, client **NBRC3.00.032**. Livrable documentaire préparant la révision du prompt : aucun changement du prompt, du schéma ou du comportement. Aucun fichier personnel du PDG recherché ou consulté, aucun envoi Discord, aucune publication du site. Les sept captures et le JSON personnels sont hors périmètre ; leur contenu et leur présence actuelle ne sont pas vérifiés.

**Fait** désigne ici un contenu contrôlé dans les sources locales ; les exécutions natives sont celles **rapportées par les audits**, pas une nouvelle exécution du client. **Déduction** désigne une conséquence conditionnelle de ces règles pour une forme exactement identifiée. **Inconnu / non établie** interdit de compléter une valeur. Les plafonds de référence ne sont jamais des observations de compte.

## Sources accessibles et limites de preuve

| Source examinée | Clés / fonctions et portée |
| --- | --- |
| `catalogue.json` | `clientSource`, `summary`, `all[].forms[].client`, `clientMaterials`, `ultimateBadgeRules`, `knownGaps` : 702 familles, 1 114 formes, 369 matériaux ; métadonnées natives exportées mêlées à des informations communautaires/de disponibilité, sans progression de compte. |
| `ultimate-rule-audit.json` | `rules`, `nativeEvidence`, `byUnitId`, `validation`, `uncertainties` : prédicats et 55 cas natifs rapportés. Allocation Unity et fournisseur de rareté évolutive simulés ; valeurs d’évolution vérifiées séparément dans les tables copiées. |
| `level-rule-audit.json` | `nativeRule`, `collectionLevelOnlyRule`, `colors`, `nativeEvidence`, `limitations` : 35 cas de branche rapportés ; indexation, chaînes/localisation simulées, dispatch de tri et rendu Unity non émulés. |
| `card-sprites.json`, `card-fit-audit.json` | `framesByRarity`, `variantRules`, `ultimate`, `proof` ; géométrie et sprites natifs. Ils ne prouvent pas une signification générale de « contour rouge ». `logos.json` fournit les correspondances de ressources. Les images elles-mêmes ne sont pas interprétées visuellement dans ce rapport. |
| `box-import.js`, `box-import.schema.json` | `importPhotoBox`, `importStockKeyMap`, `buildImportReference` et `$defs.character`, `$defs.observation`, `properties.stocks` : contrat et restrictions effectives. |
| `model.js`, `card-state.js` | `resourceStockKeys`, `allStockKeys`, `resourceInfo`, `ultimateStatus`, `backup`, `levelDisplay` : stockage, calculs et convention d’affichage du site. |
| `scripts/build-import-reference.mjs`, `scripts/build-github-site.mjs` | Génération locale depuis les références publiques. Build effectué : `dist/box-import-reference.json` contrôlé (1 114 formes, 371 ressources), index `dist/reference-pour-chatgpt.html` lu ; pages `dist/import-reference/personnages-*.html` et `ressources.html` générées par le code examiné, sans inspection exhaustive de chaque page. |
| `docs/issue-3-sources.md`, `docs/criteres-cloture.md`, `README.md`, `import-box-prompt.txt` | Documentation et contrat existants examinés ; les constats personnels historiques ne sont pas revalidés ici. Le prompt est une consigne, pas une preuve native. |

Les tables brutes `UnitList.json`, `EvolutionAbilityTable`, le binaire `libil2cpp.so`, les scripts/harness d’exécution des audits et leurs pièces `label-constants.json`, `manifest.json`, `resource-fr.bin` ne sont pas fournis comme pièces autonomes examinées ici. Les audits donnent des adresses et empreintes, sans permettre à ce seul rapport de reproduire leur exécution. `catalogue.clientSource.unitTableDecodedSha256` et `ultimate-rule-audit.provenance[table=UnitList].sha256` concordent : `0af6b9fe67453d96b5f1ed70904a60df69bb7f6b229fd60ef643cc2f6263c818`. L’audit niveaux donne aussi `nativeEvidence.sourceHashes`. Aucune vérification distante ni consultation du client actif n’est revendiquée.

## Règles visuelles : preuves et conclusions

### Ultimate ordinaire et rouge

**Faits documentés :** `ultimate-rule-audit.rules.outerGate` exige `CharaData.id != 0`, `Unit.type3 < 90`, la rareté maximale d’évolution de **cet Unit.id**, et `Unit.isAllMaxStatus`. Ce dernier teste niveau au plafond final de la forme (index `Unit.exLimitMax`, borné par `GetParamData`), capacités, bonus pilules PV/ATK et chance à leurs plafonds. Il ne teste pas l’EXP, les stocks, ni séparément le plafond acheté. `rules.variant` associe `UnitVeryIcon` à `charaicon_status_max_txt.png` et `UnitVeryIcon2` à `charaicon_status_max02_txt.png` ; le second exige en plus `isMaxSecondaryStatus`, soit le bonus vitesse au plafond. Les chemins concordent avec `card-sprites.ultimate` et le calcul de `model.ultimateStatus`.

Traçabilité native : `nativeEvidence["UnitIconBase.SetVeryIcon"]` VA `0x29c55a0`, `Unit.isAllMaxStatus` VA `0x2984258`, `Unit.isMaxSecondaryStatus` VA `0x2984158`, `ExternalData.GetMaxEvoRareValue` VA `0x2303ea0`. `SetAbilityMaxEffect` (offset `0x29c1688`) est un effet séparé : il ne constitue pas le prédicat Ultimate.

**Déduction justifiée, conditionnelle :** un badge natif effectivement reconnu, sur une forme identifiée et un client appliquant ces règles, implique les seuils ci-dessus. Comme l’import refuse de dépasser les plafonds, ces seuils correspondent aux maxima représentables. Exemple de référence seulement : `byUnitId["13455"]` exige niveau 70, 2 capacités, PV +200, ATK +75, chance 80 ; variante rouge : vitesse +25. Le badge ordinaire implique une vitesse sous le plafond, **pas une valeur exacte** : `speed` reste inconnu si seul le badge est lisible. Aucun champ d’import ne représente cette borne. Ne pas exploiter la phrase de rapprochement personnel de `exampleSakura5.identityProof` comme une nouvelle vérification de capture.

**Inconnues :** badge ambigu, texture masquée, version de client différente ou dictionnaire actif modifié (`uncertainties`) empêchent cette déduction. L’absence de badge ne localise pas une condition manquante. Le badge n’établit ni EXP dans le niveau, ni nombre de doublons, ni monnaie.

### Contours rouges

**Conclusion : règle non établie.** `card-sprites.framesByRarity` décrit des cadres de rareté ; `variantRules` décrit les variantes Blazing/Legendary et la décoration 7★. Aucun prédicat examiné n’associe un contour rouge générique à Ultimate, aux capacités, aux pilules, au LB ou à une version précise. La variante rouge du **texte Ultimate**, la couleur du **niveau** et un **contour** sont trois observations distinctes. Une texture ou un nom de sprite ne suffit pas à prouver une condition de progression.

### Nombre / MAX rouge ou jaune

**Faits documentés :** `level-rule-audit.nativeRule` donne `cap = paramDatas[clamp(exLimit)].endLevel`, `showMax = level >= cap && exLimit >= Unit.exLimitMax`. Rouge si `exLimit > 0` ; jaune si `showMax && exLimit == 0` ; blanc sinon. `colors` précise rouge `#FC566A`, jaune `#FFEF37`. Le préfixe « Niv. » reste blanc. Source : `nativeEvidence.GetSortLabelNameFromType`, branche VA `0x29c5be8` à `0x29c5e6c`, `GetMaxLevelChara` VA `0x2983328`, `GetParamData` VA `0x298314c`. Ces conditions portent sur la forme courante et sont indépendantes de chance, pilules, capacités et rareté finale d’évolution.

**Déductions justifiées :** un nombre rouge natif prouve au moins un LB acheté, pas le nombre de paliers ni le plafond exact ; MAX rouge implique le plafond final de cette forme. MAX jaune implique aucun LB acheté et tous les LB de la forme satisfaits, donc `exLimitMax == 0` et niveau au plafond final pour des données valides. Un nombre seul ne prouve pas un plafond acheté. `unlockedCap` reste inconnu si plusieurs paliers conviennent ; ne pas y mettre automatiquement `finalCap` à partir d’un nombre rouge.

**Distinction du site :** `card-state.levelDisplay` et `collectionLevelOnlyRule` déduisent rouge seulement si `level > baseCap`, MAX si `level >= finalCap`. Un achat LB sous le plafond de base peut donc produire un niveau natif rouge et un affichage site blanc. Le site n’a pas récupéré `CharaData.exLimit`. Exemple : 10476 a `baseCap=100`, `finalCap=150`, 10 LB ; rouge « 100 » ne permet pas de choisir un de ces dix paliers. MAX n’établit pas Ultimate.

## Matrice exhaustive du contrat photo v1

Les valeurs numériques sont des entiers sûrs ≥ 0 (maximum `9007199254740991`) ou `null`/absentes pour inconnu. Zéro est une observation explicite. Propriétés supplémentaires refusées. Les références donnent identités et plafonds, jamais les valeurs possédées.

| Champ / observation | Support réel, preuve et limites |
| --- | --- |
| `format`, `version` | Obligatoires : `naruto-blazing-box`, `1`. |
| `username` | Facultatif, 1–80 caractères, sans contrôles, non vide après trim. Aucun pseudo déduit du catalogue. |
| `characters` / `unitId` | Liste obligatoire ; ID natif obligatoire, présent parmi les formes de `catalogCharacters`. Nom, titre, `familyId`, carte, étoiles, élément et portrait servent à identifier ; ils ne sont pas des propriétés photo acceptées. La forme impose étoiles et possession dans l’état. |
| `level` | Plafond `client.finalCap` de la forme (replis dans `finalCap(form)`). Le validateur accepte 0 ; ce n’est pas la preuve d’un niveau natif 0. Un MAX reconnu peut permettre le plafond final selon la règle ci-dessus. |
| `xp` | EXP **dans le niveau**, pas cumulée : `< client.expByLevel[level].experienceToNext` ; au plafond final ou au plafond explicitement fourni, seul zéro est accepté. Sans niveau, seul 0 est accepté ; ce permissif ne justifie pas d’inventer zéro. Pour la validation EXP, niveau 0 traité comme 1. |
| `hp`, `atk`, `speed` | Bonus de pilules, pas statistiques totales ni nombre de pilules consommées ; bornés par `client.pillCaps` (repli `stats.plusValues`). Les totaux de combat ne suffisent pas à les isoler. |
| `abilities` | Nombre débloqué, borné par `client.abilityCount` ou longueur de `abilities` ; pas une liste d’IDs ni une quantité de pierres. |
| `luck` | Chance actuelle, bornée par `client.luckCap` (repli `luck.max`). `freshCopyLuck` / `dropLuck` de référence ne prouvent pas la chance des copies possédées ni leur provenance. |
| `unlockedCap` | Plafond acheté, parmi base et destinations des paliers natifs de la forme, au moins égal au niveau connu. Ce n’est ni `exLimit` ni le plafond final théorique. |
| Ultimate, variante, couleurs, contour | Aucune propriété photo dédiée ; observations textuelles dans `notes`, valeurs de progression seulement si démontrées. Le statut du site est recalculé ; aucune case `ultimate` acceptée. Une borne de vitesse ou « au moins un LB » ne peut être encodée numériquement sans perdre l’incertitude. |
| Doublons de personnages | Une seule entrée par famille/version ; plusieurs formes d’une même famille sont rejetées, sans fusion. Pas de représentation de plusieurs exemplaires et de leurs progressions. Le schéma autorise syntaxiquement `stocks["copies:<famille>"]` et `model.allStockKeys` connaît les copies, mais `resourceStockKeys` les filtre ; `importStockKeyMap` courant contient **0 clé copies**. L’import photo les refuse : compter des portraits répétés ne fournit donc pas un stock importable. Conserver la limite dans `notes`. |
| `stocks` | Objet obligatoire selon le schéma, mais accepté absent par le validateur JS (`raw.stocks || {}`). Pour un fichier conforme, fournir `{}` si aucune observation. Les clés doivent appartenir à `importStockKeyMap(catalogue)`, restriction plus forte que la regex du schéma. |
| `stocks.ryo`, `stocks.tokens` | Deux monnaies/clés du modèle acceptées ; référence `nativeUnitId:null`. Ryō : solde seulement si libellé et quantité lisibles. `tokens` : jetons liés aux achats de cristaux dans `resourceInfo`, **pas une correspondance établie avec la monnaie premium**. Aucun champ premium dédié ; ne pas détourner `tokens`, `stone` ou `shard` pour des perles/autre monnaie ambiguë. |
| `stone`, `shard` | Acquisition Stone / Activation Crystal natif 12966, Activation Shard 13555 ; stocks distincts des monnaies. Quantités possédées à observer. |
| `pill:(hp|atk|speed):[23]` | Stocks de pilules 2★/3★, distincts des bonus de personnage ; association native vérifie catégorie 93, gain unique et valeur `PILL_GAINS`. Pas de pilule DEF photo. |
| `ramen:<élément>:[1-4]`, `scroll:<élément>:[1-4]`, `element:<élément>` | Éléments Heart, Skill, Body, Bravery, Wisdom ; rareté et identité exactes requises. Les clés de ramen vérifient aussi catégorie 90 et gain EXP ; parchemins catégorie 91. |
| `crystal[1-7]:<famille>`, `material:<id>`, `special:…` | Seulement les clés réellement listées/mappées ; cristaux personnels liés par recettes/ID exacts, jamais par titre seul. `material:<id>` et `special:<id>` peuvent être des alias du même objet. `MATERIAL_STOCK_ALIASES` canonicalise aussi des clés ; deux alias du même stock dans le fichier sont rejetés, pas additionnés. La regex seule n’autorise pas à inventer une ressource. |
| `notes` | Facultatif : ≤ 200 textes, chacun ≤ 2 000 caractères ; exclusions, contradictions, observations non représentables, incertitudes et couverture partielle. Pas de structure libre supplémentaire. |
| Autres champs de sauvegarde | `owned`, `stars`, `planned`, `priority`, `copyLuck`, objectifs, paramètres de fusion, horodatages et marqueurs d’édition ne sont pas des champs photo ; `backup(state)` exporte un état plus large. Une sauvegarde complète et un relevé photo sont deux contrats distincts. |

**Sémantique d’application vérifiée dans `importPhotoBox` :** nouveau compte photo : inconnues de progression à `null`, stocks non observés absents. Sur compte existant : seules les valeurs connues sont appliquées ; champs absents/null et personnages/stocks absents préservent les valeurs antérieures. Une ligne identifiée marque la version possédée. Le résultat fusionné peut donc contenir des données antérieures qui ne viennent pas des captures. Aucune fusion entre captures ne doit être présentée comme une observation certaine d’un exemplaire unique.

## Identification et pièces complémentaires utiles

Un portrait seul ne fixe pas la forme : exemple contrôlé, `catalogue.all` famille `client-10015-naruto-uzumaki-the-worst-loser`, formes 10013/10014/10015, toutes `client.iconImageId=263`, mais cartes 1/2/3 et raretés 3/4/5. Croiser titre, carte, rareté, élément et détails de forme, y compris les branches Blazing. Une entrée dans la référence ne prouve ni disponibilité actuelle ni possession. Si l’identité reste ambiguë, exclure la ligne et documenter les candidats dans `notes`.

Pour une future validation autorisée, des captures **de référence du jeu**, sans données personnelles du PDG, seraient utiles : carte entière et détail avec numéro/titre/étoiles pour l’identité ; détail progression avec bonus séparés et capacités pour Ultimate ; même forme avant/après achat LB avec niveau et plafond pour les couleurs ; détail vitesse pour distinguer les deux badges ; écrans avant/après d’un contour rouge accompagnés du prefab/prédicat natif qui le pilote. Une capture du contour seule ne prouverait pas sa causalité. Pour monnaies et doublons : libellé de monnaie/solde et inventaire explicitant les exemplaires et leur famille ; cela ne supprime pas les limites actuelles du contrat. Ces pièces ne sont pas demandées au PDG ni consultées dans cette tâche.

## Vérification des quatre critères

1. Ultimate et niveaux : clés/adresses, déductions et limites ci-dessus ; contours rouges explicitement **non établis**.
2. Tous les champs racine, personnage et familles de stocks couverts ; écarts schéma/validateur, doublons et monnaies signalés ; aucune observation personnelle ni valeur inventée.
3. Sources locales examinées et pièces non vérifiées distinguées ; aucune prétention d’avoir lu les sept captures ou le JSON personnels.
4. Seul ce rapport est ajouté, prêt pour une future révision du prompt ; aucune modification fonctionnelle, publication ou communication Discord. Validation locale : `npm.cmd test` (35 tests réussis) et `npm.cmd run build` (1 114 formes, 371 ressources, 182 pages). Les tests de relais utilisent des simulations locales ; ils n’attestent aucune réception Discord.
