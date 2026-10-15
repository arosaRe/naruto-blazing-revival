# Naruto Blazing Revival Collection — refonte complète sur une branche isolée

Niveau de raisonnement conseillé : TRÈS ÉLEVÉ.

Tu interviens comme développeur principal sur un projet existant. Inspecte le vrai code, conçois les évolutions puis implémente-les avec leurs tests. Je veux un résultat exécutable, pas uniquement un audit, une maquette ou une nouvelle liste de questions.

## 1. Contexte et résultat attendu

Site : https://arosare.github.io/naruto-blazing-revival/
Dépôt : https://github.com/arosaRe/naruto-blazing-revival
Référence de fiche : https://gachawiki.net/naruto-blazing/ninjas/gaara-the-sands-final-weapon

Le site communautaire permet de gérer une box, préparer des personnages et calculer les ressources nécessaires. Il fonctionne actuellement avec des données locales, des saisies et des imports JSON. Le catalogue, les ressources natives, les calculs et les sauvegardes existantes constituent une base à préserver.

Nous attendons éventuellement une API officielle des développeurs du jeu. Aucun contrat n’est encore connu : ni endpoints, ni schémas, ni autorisations, ni pagination, ni association Discord/compte de jeu. Son ouverture n’est pas garantie.

Je veux préparer le site sans attendre : nouvelle interface, modèle interne adapté aux exemplaires, connexion Discord, sauvegarde entre appareils et moteur de synchronisation testable. Seul le raccordement réel à l’API du jeu doit attendre les informations officielles.

Les décisions fonctionnelles ci-dessous sont déjà prises. Ne rouvre pas ces questions et ne remplace pas le projet par une autre vision produit.

## 2. Branche, environnement et protection de la production

Avant toute modification, lis les instructions du dépôt, notamment AGENTS.md s’il existe, puis examine l’état Git, les modifications locales, les branches, les remotes et les workflows.

Crée et utilise une branche distincte, par exemple :

    feat/collection-v2-discord-api-ready

Si ce nom existe déjà pour un autre travail, utilise un suffixe non ambigu. Pars d’une base identifiée et documente son commit. Préserve intégralement les changements préexistants, suivis ou non suivis ; utilise un worktree séparé si nécessaire. Ne les supprime pas, ne les commite pas accidentellement avec ton travail et ne les ignore pas dans l’analyse de l’existant.

Interdictions : travailler directement sur main, fusionner dans main, forcer un push, réinitialiser destructivement le dépôt, changer les paramètres Pages, lancer le déploiement de production ou modifier des ressources externes payantes sans autorisation. Les commits doivent rester sur la branche dédiée. Aucun push ni publication n’est nécessaire pour satisfaire cette demande.

Inspecte particulièrement .github/workflows/pages.yml. Une branche seule ne suffit pas si un workflow manuel peut publier son contenu : ne déclenche aucun workflow de production. Les vérifications de branche doivent construire/tester sans publier le site.

Isole aussi la V2 au niveau des données : espace de stockage local distinct, migrations non destructives, base de développement distincte et aucune réutilisation de secrets ou de données de production pour les tests. Une prévisualisation sur le même domaine ne doit pas altérer les sauvegardes de la version actuelle.

## 3. Audit ciblé avant implémentation

Vérifie README, package.json, build, routes, tests, fichiers de données, tailles des ressources, stockage, imports/exports et éventuel backend du formulaire de retours. Ne télécharge pas inutilement tous les assets pour simplement lire l’architecture.

Examine notamment, lorsqu’ils existent : app.js, model.js, card-state.js, box-import.js, box-import.schema.json, resource-needs.js, material-budget.js, pill-budget.js, ramen-optimizer.js, player-filters.js, collection-search.js, player-guide.js et les modules de feedback.

Établis brièvement : comportements existants, écarts à ce cahier des charges, modules réutilisables, migrations nécessaires, dépendances externes et stratégie de réalisation. Vérifie les constats dans le code courant plutôt que de considérer les descriptions précédentes comme un audit à jour.

Conserve la stack lorsqu’elle convient. Extrais les responsabilités des gros modules, mais n’impose pas une réécriture complète, un framework lourd ou plusieurs services sans nécessité. Préserve le build, les assets natifs et leurs vérifications d’intégrité.

## 4. Navigation définitive

Quatre entrées principales, entièrement en français :

1. Ma collection — accueil par défaut.
2. À farmer — ressources manquantes du plan entier.
3. Soutiens — recherche par compétence de soutien.
4. Profil — complétion, compte, synchronisation et paramètres.

Les fiches personnages sont de vraies pages avec une URL propre, pas des fenêtres modales. Elles ne nécessitent pas une cinquième entrée principale.

Conserve l’aide, les sources, les imports/exports et l’envoi de retours dans des emplacements secondaires cohérents. Ne supprime pas ces fonctions pour simplifier artificiellement la navigation.

N’ajoute pas un tableau de bord à la place de la collection, plusieurs projets nommés, un constructeur d’équipes, une tier list, des classements communautaires ou des notifications automatiques : ce n’est pas le périmètre demandé.

## 5. Ma collection

### Vues, filtres et sélection

Conserver Obtenus, Manquants et Annoncés. Conserver la recherche, les sélections multiples d’éléments avec leurs couleurs et icônes, les étoiles, le filtre F2P et les autres tris/filtres actuellement utiles.

Supprimer uniquement « Niveau à renseigner » des filtres de progression. Migrer une préférence enregistrée utilisant cette ancienne valeur vers un filtre valide. Ne remplace pas les inconnues par des nombres pour faire disparaître ce filtre.

Préserver « Mettre comme plan », « Ajouter au plan », la sélection individuelle et le retrait. Remplacer le plan et ajouter à un plan restent deux actions différentes ; une opération qui viderait/remplacerait la sélection doit être explicite.

Tous les résultats correspondant à la vue et aux filtres doivent être accessibles d’un seul coup : supprimer la limite actuelle de 72 cartes, toute pagination et le bouton « Afficher les suivants ». Les actions sur une sélection portent sur tous les résultats, pas seulement sur les cartes visibles à l’écran.

Optimiser avec index de recherche, calculs mémorisés, images différées et rendu économique, sans réintroduire un découpage fonctionnel caché. Le compteur, la recherche navigateur et la navigation clavier doivent rester cohérents avec la collection complète.

La recherche doit comprendre les noms, titres français, numéros et effets traduits ; les alias anglais peuvent rester indexés pour aider à retrouver une carte.

### Cartes natives et progression

Afficher le bon portrait, la bonne version, la forme réellement possédée, les étoiles, le niveau, les capacités et les badges. Ne jamais remplacer une forme actuelle par sa future évolution simplement parce que sa fiche de catalogue vise une rareté supérieure.

Règles à conserver et tester avec les plafonds exacts de chaque forme : niveau normal blanc ; maximum normal jaune ; niveau/maximum rouge lorsqu’il correspond au Limit Break selon les règles natives. Distinguer plafond normal, plafond débloqué et plafond final.

Exemples déjà établis pour les formes concernées : 5★ MAX jaune = niveau 70 ; 5★ MAX rouge = niveau 100 ; 6★ MAX jaune = niveau 100 ; 6★ MAX rouge = niveau 150. Ce ne sont pas des plafonds universels à appliquer aveuglément au catalogue.

Ne déduis pas la couleur uniquement de la rareté. Exploite l’état explicite du Limit Break lorsqu’il est fourni ; une déduction depuis le niveau doit être identifiée comme telle et rester compatible avec les données natives.

Les règles Ultimate déjà connues doivent être centralisées, pas réinventées : critères natifs d’éveil/niveau, capacités, Luck et pilules PV/ATK ; la vitesse maximale ajoute la variante Ultimate rouge. Le niveau MAX rouge ne prouve absolument pas que les pilules vitesse sont au maximum. Ultimate normal et Ultimate rouge sont distincts de la couleur du niveau.

Ne remplace pas une valeur vitesse inconnue par zéro ou par son maximum à partir du seul niveau rouge. Vérifie les règles documentées du dépôt et leurs tests plutôt que d’appliquer une règle générale approximative.

### Annoncés

Hypothèse de conception ferme : les personnages annoncés ne seront pas récupérés par l’API. Ils restent dans un catalogue éditorial indépendant, avec provenance, éventuelle date et coûts prévisionnels.

Une annonce sans date précise doit pouvoir être visible avec « Date à confirmer ». Ne considère pas tous les personnages présents dans le client comme des annonces ou comme des personnages déjà disponibles.

La synchronisation ne doit jamais effacer les annonces ni leur sélection dans le plan. Lorsqu’une version est officiellement disponible puis obtenue, fais correspondre ses identifiants sans doublonner la version ; conserve le plan et remplace la prévision par la progression réelle.

Les coûts futurs restent identifiés comme prévisionnels. Une date supposée ou l’absence dans une réponse du jeu ne suffit pas à changer la disponibilité éditoriale globale.

## 6. Exemplaires et regroupement des doublons

Séparer trois identités : version unique/famille pertinente pour la collection, forme native de cette version et exemplaire réellement possédé. Deux variantes de Naruto ne sont pas le même personnage de collection ; une évolution normale n’est pas une nouvelle version à compter une seconde fois.

Conserver chaque exemplaire avec son identifiant natif lorsqu’il existe. Sans identifiant externe stable, utiliser des identifiants locaux et une réconciliation explicitement limitée ; ne pas inventer une identité officielle.

Regrouper visuellement des exemplaires seulement si leur version, forme et progression utile sont identiques : niveau, Limit Break débloqué, capacités, Luck, bonus de pilules et autres données affectant réellement l’affichage ou les calculs. Une inconnue ne vaut ni zéro ni égalité prouvée. L’ordre des éléments dans une réponse API n’est jamais une identité. Comparer les capacités réellement débloquées lorsque leur identité est disponible, pas seulement leur nombre. Exclure de la clé de regroupement les identifiants d’instance, dates de synchronisation et métadonnées sans rapport avec la progression.

Exemple : trois exemplaires identiques donnent une carte « ×3 ». Si l’un est amélioré, afficher son groupe séparément des deux autres. Une valeur de capacité différente ou un palier LB différent suffit à les distinguer. Conserver leurs données individuelles sous le regroupement.

Ne jamais additionner les bonus de plusieurs copies ni fabriquer une copie composite. La limite de l’ancien import « une observation par version » ne doit pas provoquer de perte dans le nouveau modèle ; garder un importeur compatible pour les anciens fichiers.

Pour préserver le périmètre du plan actuel, ne multiplie pas automatiquement les besoins par le nombre de doublons. Le plan reste une sélection de versions avec un exemplaire cible réel. À défaut d’un choix déjà enregistré, utilise une règle déterministe documentée, par exemple le meilleur exemplaire complet selon le score. Préserve une cible existante lors d’une synchronisation ; ne crée pas une fonction de maximisation de toutes les copies sans demande.

## 7. Fiches personnages et français intégral

Consulte la référence GachaWiki indiquée au début pour t’inspirer de l’organisation et de la richesse des informations. Ne copie pas aveuglément son code, son texte anglais ou ses éventuelles erreurs. Si son rendu n’est pas accessible, signale-le sans prétendre l’avoir inspecté visuellement.

Créer une vraie page avec navigation retour, URL directe, rechargement et restauration des filtres/du défilement. Choisir un routage compatible avec l’hébergement statique et le sous-chemin du site ; une route avec fragment est acceptable si elle représente une vraie vue de page et évite des liens directs en erreur.

La fiche comprend : identité et formes, portrait/illustration, rareté et élément, coût/portée lorsqu’ils sont documentés, statistiques, niveau et plafonds, éveil/LB, capacités, Luck, pilules PV/ATK/vitesse, techniques, compétence de terrain, compétence de soutien, synergies, conditions, obtention, disponibilité, matériaux et besoins restants.

Séparer visuellement les données de « Mon exemplaire » des données de référence et du « Potentiel maximal ». Une prévisualisation d’évolution n’est pas un personnage déjà obtenu. Les fiches des manquants et annoncés restent complètes et ne cachent pas les descriptions de capacités sous prétexte que le personnage n’est pas possédé.

Toutes les chaînes destinées au joueur doivent être en français : interface, descriptions, techniques, effets, unités, catégories, restrictions, erreurs et aides. Conserver les noms propres et badges pertinents. Les titres et noms de techniques doivent suivre un glossaire cohérent ; distinguer une traduction communautaire d’un intitulé officiel lorsqu’il n’existe pas de source officielle française.

Conserver textes source et provenance dans les données. Une traduction ne change jamais une valeur, un pourcentage, une cible, une durée, une probabilité ou une condition. Ne pas utiliser une traduction réseau à chaque ouverture de fiche. Prévoir des tests/audits de couverture et signaler précisément les descriptions réellement indécodables au lieu de les inventer.

Les champs issus de l’API sont consultables, pas modifiables dans le jeu. Le mode manuel reste éditable. Une correction locale éventuelle doit être un complément identifié, jamais une modification silencieuse d’une valeur officielle ni un appel d’écriture au jeu.

## 8. Plan actuel et page À farmer

Périmètre volontairement inchangé : niveau, éveil, Limit Break et pilules, avec les options globales existantes. Ne pas ajouter au budget les coûts des capacités ni de la Luck. Elles serviront à la complétion, ce qui est un calcul séparé.

La sélection du plan se fait dans la collection et les fiches. Conserver les personnages manquants et annoncés en prévision, sans les enregistrer comme possédés. Ne pas introduire plusieurs plans nommés ou des objectifs individuels complexes non demandés.

À farmer affiche seulement les quantités réellement manquantes pour l’ensemble du plan. Aucun filtre par personnage, élément, rareté ou statut ; aucun menu de tri ou recherche sur cette page. Un regroupement fixe et lisible par famille de ressource est autorisé.

Les filtres de Ma collection n’ont aucun effet sur ce total. Seule une modification explicite du plan ou des données de calcul change les besoins.

Pour chaque manque : image native, nom français, quantité manquante et, lorsque documenté, lieu de farming. Le détail besoin/stock/conversions peut être consultable sans encombrer l’affichage principal. Les ressources couvertes ne figurent plus dans la liste.

Déduire les stocks partagés une seule fois. Préserver les recettes et optimisations valides ; une ressource consommée virtuellement dans une conversion ne peut plus être disponible pour une autre. Ne pas déduire une seconde fois le stock d’un déficit déjà calculé. Un calcul ne consomme jamais le véritable inventaire.

« Rien à farmer » ne signifie pas « personnage déjà amélioré ». Prévoir une indication discrète lorsqu’il reste une fabrication ou une amélioration réalisable avec les stocks actuels.

Les manques réellement calculables sont distincts des informations à vérifier. Un champ de progression absent ne devient pas zéro. Une estimation indique son hypothèse et ne se présente pas comme exacte.

Pour les lieux de farming, distinguer mission documentée, disponibilité actuelle confirmée et disponibilité à vérifier. Utiliser les informations officielles lorsqu’elles existent, sinon conserver la provenance des références. Ne pas inventer des taux, horaires, nombres de runs ou activités actuelles ; aucun optimiseur de session de farming n’est demandé.

Déplacer la consultation/saisie complète des stocks dans une section secondaire du profil. Préserver l’export des manques s’il existe, sans réintroduire les filtres supprimés ni une grande grille de saisie dans À farmer.

## 9. Page Soutiens

Objectif : trouver les personnages correspondant à un Buddy Skill, pas construire automatiquement une équipe.

Vue initiale : Obtenus. Fournir les vues Obtenus, Manquants, Annoncés et Tous ; Tous rassemble les trois statuts, chacun clairement identifié. La page reste utilisable avec le catalogue sans connexion.

Permettre une sélection/recherche par type d’effet : soin, attaque, réduction de dégâts, esquive, résistance à une altération et autres catégories réellement présentes. Les filtres élément/rareté peuvent être conservés lorsqu’ils sont utiles. Proposer un classement par valeur uniquement entre effets comparables.

Afficher le personnage, la forme, le statut de possession, l’effet français exact, ses valeurs/unités et restrictions, puis un lien vers sa fiche. Pour une copie obtenue, afficher son soutien actuel ; une amélioration obtenue seulement après éveil apparaît distinctement comme potentiel futur.

Construire une représentation structurée des effets, avec type, valeur, unité, cibles, restrictions et provenance. Ne pas dépendre seulement de mots recherchés dans une phrase anglaise. Prévoir les effets multiples et ceux dont la structure reste à vérifier sans les classer arbitrairement.

Ne pas confondre Field Skill et Buddy Skill. Ne pas implémenter de calcul de cumul, plafond, portée ou activation en combat à partir de nos anciennes suppositions : les règles de Revival doivent être confirmées avant une éventuelle fonctionnalité de simulation. Ici, fournir les effets individuels fiables suffit.

## 10. Profil et complétion pondérée

### Périmètre

Le profil regroupe identité Discord, état du compte lié, synchronisation, sélection/préférences sauvegardées, import/export, stocks complets, sources, paramètres et scores. Aucun profil public ou classement n’est demandé.

Afficher deux indicateurs distincts :

- Complétion de la collection : toutes les versions disponibles dans Revival.
- Progression de ma box : uniquement les versions obtenues.

Les annoncés et personnages seulement présents dans les fichiers du client sont exclus tant que leur disponibilité n’est pas établie. Un retrait temporaire d’une bannière ne signifie pas automatiquement qu’une version sortie doit disparaître du catalogue de complétion.

Compter une seule fois chaque version unique : son meilleur exemplaire réel selon le score total, pas forcément celui au niveau le plus élevé. Ne jamais multiplier par les doublons ni assembler les meilleures statistiques de copies différentes.

### Principes du score déjà validés

Ce n’est ni un compteur de personnages MAX, ni une moyenne non pondérée des pourcentages individuels. Chaque amélioration apporte des points et chaque personnage possède un potentiel propre.

L’importance recherchée suit cet ordre : Luck, capacités, Limit Break, pilules, puis niveau ; ajouter un crédit d’éveil. Cet ordre représente la difficulté relative des catégories. À l’intérieur, la progression est numérique, pas pondérée par l’expérience, le coût en objets, l’argent dépensé ou le temps de farming.

Les coefficients précis ne sont pas arrêtés. Proposer et implémenter une première grille centralisée, versionnée et explicitement provisoire, puis la vérifier sur des cas représentatifs. Ne pas utiliser comme valeurs validées les anciens exemples fictifs de 100 points ou une échelle automatique ×1 à ×6.

À état comparable, un personnage de rareté supérieure doit peser davantage, mais il ne reçoit pas à l’avance le poids d’une forme qu’il n’a pas atteinte.

Cas fondamental : un 5★ niveau 70, quatre capacités débloquées, Luck et pilules maximales vaut autant qu’un autre 5★ comparable entièrement amélioré sans LB, même si le premier peut devenir 6★. Son évolution future ne lui donne aucun point acquis supplémentaire tant qu’elle n’est pas réalisée.

Chaque capacité réellement débloquée apporte sa contribution. À autres caractéristiques égales, six capacités débloquées doivent rapporter davantage que cinq. Une capacité supplémentaire verrouillée augmente le potentiel, pas les points acquis. Éviter un forfait « capacités complètes » identique pour tous les personnages.

Luck, pilules PV, attaque et vitesse progressent indépendamment. Des valeurs dans des unités différentes nécessitent des coefficients adaptés ; +100 PV ne doit pas écraser mécaniquement toutes les autres améliorations. La difficulté fixe les poids, mais les progrès restent numériques.

Un personnage sans LB possible peut être à 100 %, tout en rapportant moins de points qu’un personnage comparable dont le LB est complètement réalisé. Ne lui attribue pas un manque pour une amélioration inexistante.

### Éveil et conservation des acquis

Lors d’un éveil 5★ niveau 70 vers 6★ avec niveau réinitialisé, les points déjà acquis ne doivent pas diminuer ; l’éveil ajoute des points. Les niveaux de la nouvelle forme font ensuite progresser le score.

Prévoir un crédit canonique associé à la forme atteinte et aux transitions documentées, pas un journal d’actions à accumuler. Deux copies exactement dans le même état doivent avoir le même score même si l’une a été importée directement sous sa forme évoluée. Ne pas affirmer pour autant qu’on connaît leur historique réel.

Ne pas supposer que des améliorations facultatives d’une forme précédente ont toutes été effectuées. Formaliser le traitement des paliers, remises à zéro et branches avec les seules règles établies. Les cycles ou éveils réversibles ne doivent jamais produire des points infinis.

Vérifier mathématiquement puis par tests : à règles de catalogue et coefficients constants, toute amélioration autorisée conservant les autres acquis, notamment l’éveil, ne fait baisser ni les points ni la complétion totale. Pas de double comptage d’un niveau en progression normale et en LB.

Pour une version à plusieurs branches, ne pas additionner comme exigibles des parcours incompatibles. Définir un potentiel atteignable, documenté, et conserver l’identité de version appropriée. Ne pas élargir les objectifs au-delà des formes réellement disponibles.

### Points et pourcentages

La fiche distingue : « Forme actuelle : complète » ou sa progression, « Progression totale du personnage : … % » et la prochaine étape lorsqu’elle peut être déterminée.

Un 5★ complet sans évolution possible peut être à 100 %. Un 5★ comparable encore évoluable possède les mêmes points acquis, mais n’est pas à 100 % de son parcours total. Il peut afficher « Forme actuelle complète — prochaine étape : éveil en 6★ ».

Le maximum total d’une version couvre son parcours disponible et ne change pas simplement parce que le joueur réalise un éveil. Une nouvelle évolution officiellement ajoutée au catalogue peut changer ce potentiel : tracer la version de calcul et l’expliquer, plutôt que simuler une perte d’améliorations.

Définir pour chaque version v :

    acquis(v) = score du meilleur exemplaire réel ; 0 si non possédée
    potentiel(v) = maximum atteignable du parcours disponible de cette version

Puis :

    collection = 100 × somme(acquis(v), versions disponibles)
                     / somme(potentiel(v), versions disponibles)

    box = 100 × somme(acquis(v), versions possédées admissibles)
              / somme(potentiel(v), versions possédées admissibles)

Ce sont des rapports de sommes de points, pas des moyennes simples de pourcentages. Pour un dénominateur nul, afficher un état vide, pas NaN ni un 100 % trompeur.

Ne pas assimiler des données inconnues à une progression nulle. Si un score exact est impossible, afficher sa couverture/incomplétude ou des bornes explicites ; ne pas attribuer un badge complet sur une estimation. Ultimate, complétion de forme et complétion totale sont des indicateurs distincts.

## 11. Modèle interne et fournisseurs de données

Découpler complètement le domaine du format externe. Concevoir un modèle interne versionné et des validateurs explicites, sans présenter ces propriétés comme celles de l’API du jeu.

Séparer catalogue/formes/recettes/traductions/annonces, exemplaires et inventaire du compte, plan et préférences personnelles, compléments manuels et données calculées.

Prévoir des interfaces de fournisseur pour le mode manuel, les fichiers existants, les fixtures de développement et l’API officielle future. Les fixtures sont fictives, isolées et signalées ; elles ne doivent jamais apparaître dans une vraie box à l’ouverture du site.

Distinguer explicitement statistiques totales, bonus apportés par les pilules et quantités de consommables : ils ne sont pas interchangeables. Distinguer également niveau, EXP dans le niveau, plafond LB débloqué et capacités réellement activées ; aucune conversion ne doit reposer sur un nom de champ deviné.

Un adaptateur transforme une réponse externe validée en instantané interne. Y conserver provenance, date, compte, version et périmètre couvert. Les capacités du fournisseur indiquent ce qu’il sait réellement fournir ; une fonction indisponible ne doit pas casser les autres.

Garder les identifiants opaques sous une représentation sans perte, notamment les grands identifiants Discord/API. Faire correspondre les IDs natifs et leurs alias explicites ; pas d’identification par nom seul. Pour l’ancien parcours captures, préserver la comparaison aux portraits natifs et le signalement des ambiguïtés.

Un item ou personnage inconnu ne doit pas être jeté silencieusement, arbitrairement associé ou rendu comme une autre carte. Conserver son identité brute non sensible et un statut « référence à compléter » ; empêcher les calculs faussement exacts qu’il compromet.

Tester au moins deux formats externes fictifs différents produisant le même état interne et les mêmes résultats, pour démontrer que l’interface ne dépend pas d’un JSON inventé.

## 12. Inventaire : règle ABSENT = ZÉRO

RÈGLE FERME : après réception et validation d’un inventaire COMPLET pour un périmètre donné, tout item de ce périmètre absent de la réponse vaut zéro. Ce n’est pas une quantité inconnue.

Exemples : stock précédent 20, nouvelle quantité 8 → 8 ; stock précédent 20, item absent → 0 ; item jamais vu et absent du périmètre complet → 0. Un inventaire explicitement vide mais valide met les stocks de son périmètre à zéro.

Reconstruire/remplacer logiquement l’inventaire concerné : ne pas faire une simple fusion qui conserverait les anciennes valeurs des items disparus. La mise à zéro peut être implémentée par une sémantique de couverture plutôt que par la matérialisation de toutes les clés.

Conditions : toutes les pages ont été récupérées, les identifiants/quantités validés, le compte et le périmètre sont connus et la réponse correspond bien à un instantané complet. Ne jamais prendre une erreur HTTP, une réponse absente, un JSON invalide ou une page vide isolée pour un inventaire vide.

Une réponse partielle ou différentielle ne remet pas à zéro les éléments absents : appliquer seulement ce que son contrat garantit. Un endpoint de matériaux ne remet pas à zéro une monnaie gérée ailleurs. Un champ explicitement null/malformé n’est pas une absence valide à transformer automatiquement en zéro.

Collecter, valider, normaliser, puis publier atomiquement le nouvel instantané. Si la récupération échoue ou si la cohérence ne peut être garantie, conserver le dernier état valide avec sa date ; aucune disparition temporaire des stocks en cours de pagination.

Traiter les alias d’un même item sans double comptage et les nouvelles références sans perte. Recalculer ensuite les besoins du plan.

Cette règle ne s’applique PAS aux champs de progression d’un personnage ni aux stocks non observés d’une capture/import manuel. Dans ces cas, une inconnue reste inconnue. Les valeurs par défaut éventuellement autorisées pour un import particulier ne deviennent pas des faits universels de l’API.

## 13. Synchronisation du jeu et résolution des conflits

Préparer un moteur de lecture avec validation, adaptation, comparaison, application atomique par périmètre cohérent, puis recalcul. Supporter synchronisation manuelle et déclenchement raisonnable à la connexion/au retour sur le site, configurable selon les futures limites officielles.

Éviter polling agressif, appels simultanés inutiles, retries infinis et collisions entre onglets. Respecter les limites et Retry-After lorsqu’ils sont documentés. Une réponse ancienne ne doit pas remplacer un instantané plus récent ; utiliser génération, révision ou annulation selon le contrat disponible.

Afficher séparément connexion Discord, liaison au jeu, date de synchronisation réussie, en cours, partielle, échouée et données anciennes. Être connecté à Discord ne signifie pas être synchronisé au jeu.

Conserver les objectifs, sélections, préférences et notes existantes lors du remplacement des données du compte. Les quantités officielles ne s’additionnent jamais aux anciennes quantités locales.

La disparition d’un exemplaire se déduit uniquement d’une liste de box complète selon son contrat ; une liste partielle ne prouve aucune suppression. Préserver la version sélectionnée dans le plan et signaler une cible disparue plutôt que supprimer arbitrairement les intentions du joueur.

Les compléments locaux de champs non fournis restent séparés et identifiés. Ne pas conserver une ancienne valeur officielle comme actuelle si le nouveau contrat la déclare explicitement inconnue : garder sa provenance/date et appliquer une règle de réconciliation documentée.

## 14. Connexion Discord et backend sécurisé

Implémenter une véritable intégration OAuth2 Discord côté serveur, configurable, avec des tests. Ce chantier est distinct de l’accès au jeu et peut être préparé avant l’API Revival.

Étudier les documentations officielles actuelles. Utiliser un flux Authorization Code adapté ; état anti-CSRF lié à la session, court et à usage unique, contrôle strict des URI de retour, échange serveur et identité obtenue auprès de Discord. Ajouter PKCE si le flux choisi et sa prise en charge officielle le permettent ; ne pas supposer cette prise en charge.

Limiter les autorisations au nécessaire, initialement identify pour l’identité. Ne pas demander email, messages, liste des serveurs, installation d’un bot ou permissions administrateur sans justification spécifique. Ne jamais demander le mot de passe du jeu ou un jeton de compte utilisateur Discord.

Aucun client_secret, access token ou refresh token dans le frontend, le dépôt, les assets, localStorage, les exports ou les logs. Client ID public et secret ne sont pas la même chose. Fournir une configuration exemple sans secrets et ignorer les fichiers réels.

Créer une session applicative sécurisée, renouvelable/révocable, avec cookies HttpOnly/Secure et politique SameSite adaptée, contrôles CSRF des écritures du site, limites de requêtes et validation serveur. Gérer refus utilisateur, retour OAuth invalide, expiration, déconnexion et révocation.

Vérifier côté serveur l’accès à chaque profil/objet. L’utilisateur ne choisit pas librement un autre propriétaire en envoyant un Discord ID ou un identifiant de joueur. Ne pas confondre authentification, autorisation des données du site et autorisation officielle du jeu.

Une connexion Discord seule ne prouve pas la liaison à un compte Revival. Préparer une interface de liaison vérifiable par le mécanisme officiel futur, sans simuler une validation réelle. Le bot Ichiraku’s Ramen et sa commande /player ne constituent pas une autorisation pour appeler des routes privées.

Le jeu reste strictement en lecture seule : aucune invocation, fusion, amélioration, vente, mission ou autre action de jeu. Les écritures autorisées concernent uniquement le plan, les préférences et données du site.

Auditer l’éventuelle infrastructure existante avant de choisir un backend léger et une base persistante. Préserver GitHub Pages pour le frontend si compatible ; ne pas prétendre que le serveur OAuth s’exécute dans Pages. Choisir une solution concrète, documentée, peu coûteuse et localement testable, sans souscrire ni déployer automatiquement.

Traiter réellement les domaines, callbacks, HTTPS, cookies et CORS. Si frontend et backend sont sur des sites différents, tester les restrictions de cookies tiers et proposer une topologie fiable ; CORS seul ne résout pas ce problème. Ne pas utiliser un wildcard CORS avec des credentials ni déplacer les tokens sensibles dans le navigateur pour contourner un échec de session.

Sans identifiants Discord configurés, fournir le code, les tests et les étapes de configuration, mais afficher « Connexion non configurée », pas une fausse connexion réussie. Toute identité simulée doit être impossible à activer dans une configuration de production.

## 15. Sauvegarde PC/téléphone et isolation des comptes

Exigence obligatoire : la connexion Discord retrouve le même plan, les sélections, options et préférences sur PC et téléphone. Synchroniser la box depuis le jeu ne remplace pas cette sauvegarde des données propres au site.

Implémenter une persistance serveur réellement durable avec identités, contrôles d’accès, schéma/version et migrations. Ne pas se contenter d’un stockage en mémoire ou d’une sauvegarde localStorage présentée comme du cloud.

Utiliser une stratégie de concurrence avec révisions/écritures conditionnelles ou équivalent. Deux appareils ne doivent pas écraser silencieusement leurs modifications à partir d’un état ancien. Réconcilier les modifications non conflictuelles ; pour un véritable conflit, conserver les versions et expliquer la résolution.

Séparer l’instantané du jeu des préférences du site. Aucun navigateur ne doit pouvoir réécrire arbitrairement des données officielles serveur sous prétexte de sauvegarder un plan.

Préserver le mode local sans connexion et prévoir l’import volontaire des données locales lors de la première connexion, avec aperçu/sauvegarde avant remplacement. Une ancienne sauvegarde ne doit pas écraser silencieusement une box synchronisée plus récente.

Isoler les caches par compte et environnement. Déconnexion/changement de compte : aucune donnée du compte précédent ne doit apparaître au suivant. Un cache hors ligne privé n’est consultable que selon une politique explicite et sûre ; sinon conserver seulement le catalogue public hors ligne. Ne pas faire de partage public implicite des box.

Prévoir export, suppression volontaire des données du site et déconnexion, avec confirmation pour les actions destructrices. Expliquer sobrement ce qui reste local et ce qui est conservé côté serveur. Aucun secret dans les exports ou les retours communautaires.

## 16. Compatibilité, absence d’API et états partiels

Le site doit rester utilisable si l’API du jeu n’arrive jamais : catalogue, fiches, soutiens, box manuelle, import de captures/JSON, export, plan et calculs.

Versionner le nouveau format et fournir des migrations pour les sauvegardes existantes. Ne pas inférer des doublons que l’ancien format ne pouvait pas représenter. Préserver les valeurs explicites null/0, les IDs, les notes, la sélection et les stocks avec leur sémantique d’origine.

Une migration échouée doit laisser le fichier et les données précédentes intacts. Ne pas remplacer une box vide/non vide à l’import sans expliquer le périmètre et permettre sa sauvegarde. Garder les références publiques et le parcours d’identification par portraits compatibles, ou fournir une évolution versionnée sans casser leurs liens.

Les mocks sont un outil de développement, pas la seule implémentation de la sauvegarde serveur ou de Discord. À l’inverse, l’adaptateur de l’API du jeu reste explicitement non branché tant qu’aucun contrat officiel n’est fourni. Ne crée pas de requêtes vers des endpoints supposés.

Ne construis pas des interfaces de bannières, missions, historique de combats ou calendrier uniquement parce que ces données pourraient un jour être ouvertes : documente leur disponibilité éventuelle sans élargir cette livraison.

## 17. Tests et critères d’acceptation

Établir une référence avec les tests existants, puis ajouter tests unitaires de domaine, intégration frontend/backend et parcours navigateur. Les vérifications visuelles doivent être réalisées sur une version locale/de test, avec captures et données fictives identifiées lorsque nécessaire.

Couvrir au minimum :

A. Branche/environnement : aucun changement de main, aucun déploiement, stockage V2 séparé, migrations réversibles et données antérieures préservées.

B. Collection : plus de 72 résultats disponibles sans bouton/pagination ; filtres couleurs/étoiles et tris conservés ; ancien filtre supprimé ; actions sur toute la sélection ; dates d’annonce inconnues acceptées ; aucun annoncé effacé par une synchronisation.

C. Cartes : identité et forme exactes ; MAX jaune/rouge selon les plafonds pertinents ; Ultimate normal/rouge ; MAX rouge sans pilules vitesse max ; valeurs inconnues et plafonds atypiques.

D. Doublons : regroupement à progression égale, séparation après amélioration, conservation de toutes les instances, ordre API différent sans duplication, IDs longs préservés, aucun calcul composite.

E. Fiches/français : accès direct et rechargement, retour avec filtres et défilement, descriptions accessibles pour les manquants, distinction exemplaire/potentiel, audit de traduction des nombres et conditions.

F. À farmer : total de tout le plan indépendant des filtres de collection ; absence de tris/filtres ; manque nul masqué ; stock partagé réservé une fois ; recettes sans double dépense ; distinctions stock inconnu/fabrication disponible ; aucune ressource réellement consommée.

G. Inventaire : ancien 20 devenu absent = 0 ; quantité 8 = 8 ; inventaire complet vide = zéro ; panne/pagination interrompue = ancien état conservé ; réponse partielle = aucune mise à zéro implicite ; périmètres séparés ; null/invalide ≠ zéro ; alias et items inconnus sans perte.

H. Synchronisation : idempotence, instantanés anciens rejetés, révisions/compte vérifiés, nouvel exemplaire, évolution, exemplaire disparu, API indisponible, données incomplètes, annonces et intentions personnelles conservées.

I. Soutiens : obtenus par défaut, Tous mélange les trois statuts, filtres d’effets, forme actuelle versus future, restrictions et unités, effets composés/non classés, aucune règle de cumul inventée.

J. Complétion : mêmes points pour les deux 5★ équivalents dont un évoluable ; poids supérieur à rareté/progression supérieure selon le barème ; capacité supplémentaire valorisée ; capacité verrouillée non créditée ; éveil avec niveau réinitialisé sans baisse ; personnage sans LB complétable à 100 % ; meilleur exemplaire réel seulement ; doublons neutres ; import identique à état synchronisé ; calcul stable sans historique ; branches incompatibles non additionnées ; aucune amélioration comptée deux fois ; inconnues explicites ; annoncés exclus ; dénominateurs nuls gérés.

K. Discord/sécurité : identité confirmée par Discord, state invalide/rejoué refusé, expiration et déconnexion, accès à un autre profil refusé, aucune fuite de tokens, refus des identités de test en production, CSRF et origine contrôlés. Signaler si les essais OAuth réels n’ont pas pu être exécutés faute de configuration.

L. Multiappareil : plan créé sur PC retrouvé sur téléphone avec même compte ; autre compte isolé ; écritures concurrentes et anciennes gérées ; reprise après échec de sauvegarde ; export/import et migration sans perte.

M. Performance/accessibilité : grand catalogue et nombreuses copies, mobile et ordinateur, clavier/focus, boutons lisibles, états vides/chargement/erreur, aucune dégradation majeure du build ou des assets.

Une suite de tests verte ne prouve pas que l’intégration réelle au jeu a été testée. Ne présente jamais une fixture comme une validation API officielle.

## 18. Réalisation et livrables

Procéder par étapes cohérentes sur la branche dédiée : audit et décisions documentées ; modèle/migrations ; scores et tests ; collection/fiches/soutiens/farming/profil ; backend Discord et persistance ; synchronisation/adaptateurs ; validation complète et documentation. Ajuster l’ordre selon les dépendances constatées, sans attendre inutilement l’API.

Donner de brefs points d’avancement, poursuivre l’implémentation après l’audit et traiter les décisions techniques réversibles sans me reposer les questions fonctionnelles déjà tranchées. Pour les secrets, autorisations ou données officielles absents, documenter exactement le blocage puis avancer sur le reste. Ne pas prétendre pouvoir effectuer une configuration externe non autorisée.

Livrer dans le dépôt, avec des noms adaptés à sa structure :

- Un cahier des décisions et de l’architecture, avec périmètre réellement implémenté.
- Le modèle interne, les adaptateurs, migrations et fixtures séparées.
- Un document du score : formule, coefficients provisoires versionnés, exemples chiffrés sur de vrais personnages du catalogue et vérifications de monotonie.
- Le code des quatre pages et des fiches françaises.
- Le backend Discord, la persistance des préférences et leur configuration locale.
- Les tests et commandes reproductibles de build/démarrage/validation.
- Une liste des informations à demander aux développeurs : schémas et exemples anonymisés, IDs version/forme/instance, sémantique des champs et valeurs absentes, inventaire complet/partiel/paginé, quantités nulles, règles de liaison et d’autorisation, limites, erreurs et versionnement.
- Une documentation de raccordement de l’API réelle limitée à l’adaptateur/transport, sans réécrire les pages.
- Une procédure de revue et retour arrière, sans fusion/déploiement automatiques.

Dans le compte rendu final, indiquer la branche et son commit de base, les fichiers majeurs, ce qui fonctionne réellement, les tests exécutés avec leurs résultats, les parties simulées, les tests non exécutés, la configuration restante et les limites connues. Ne pas annoncer « terminé » pour des fonctions seulement dessinées ou documentées.

Objectif : un site communautaire français utilisable aujourd’hui, réellement préparé pour Discord et la sauvegarde entre appareils, prêt à accueillir une API officielle inconnue sans compromettre la version publique ni les données des joueurs.

## Références techniques à revérifier pendant l’implémentation

Discord OAuth2 : https://docs.discord.com/developers/topics/oauth2
GitHub Pages : https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

Privilégier la documentation officielle actuelle des technologies effectivement choisies. Les noms et routes de notre backend peuvent être définis par le projet ; ils doivent toujours rester clairement distincts des endpoints officiels encore inconnus du jeu.
