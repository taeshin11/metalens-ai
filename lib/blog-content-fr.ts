export type BlogContent = {
  title: string;
  description: string;
  date: string;
  readTime: string;
  tag: string;
  sections: { heading: string; body: string }[];
};

export const frenchBlogPosts: Record<string, BlogContent> = {
  'what-is-meta-analysis': {
    title: 'Qu\'est-ce qu\'une méta-analyse ? Un guide pour débutants',
    description: 'Apprenez ce qu\'est une méta-analyse, pourquoi elle est importante dans la recherche médicale, et comment des outils d\'IA comme MetaLens la rendent accessible.',
    date: '2026-03-15',
    readTime: '6 min de lecture',
    tag: 'Éducation',
    sections: [
      {
        heading: 'Qu\'est-ce qu\'une méta-analyse ?',
        body: 'Une méta-analyse est une méthode statistique qui combine les résultats de plusieurs études scientifiques portant sur une question de recherche connexe. Contrairement à une étude unique qui pourrait avoir une taille d\'échantillon limitée ou des conditions spécifiques, une méta-analyse regroupe les données de nombreuses études pour produire une estimation plus fiable d\'un effet.\n\nPar exemple, si 20 essais cliniques différents ont chacun étudié si le médicament A est plus efficace que le médicament B pour traiter l\'hypertension, une méta-analyse combinerait systématiquement ces résultats pour parvenir à une conclusion plus solide et plus généralisable.',
      },
      {
        heading: 'Pourquoi la méta-analyse est-elle importante ?',
        body: 'Les méta-analyses se situent au sommet de la hiérarchie des preuves en médecine. Elles constituent la forme de preuve la plus solide car elles :\n\n- Augmentent la puissance statistique en combinant les tailles d\'échantillon de plusieurs études\n- Réduisent l\'impact des biais propres à chaque étude\n- Résolvent les conflits lorsque différentes études montrent des résultats contradictoires\n- Identifient des tendances et des effets que les études individuelles pourraient manquer\n- Orientent les recommandations de pratique clinique et les décisions politiques\n\nLorsqu\'un médecin décide quel traitement recommander, les méta-analyses sont souvent la référence vers laquelle il se tourne.',
      },
      {
        heading: 'Le processus traditionnel de méta-analyse',
        body: 'Réaliser une méta-analyse traditionnelle est un processus long. Les chercheurs doivent :\n\n1. Définir une question de recherche claire\n2. Rechercher dans plusieurs bases de données (PubMed, Cochrane, Embase) les études pertinentes\n3. Examiner des milliers d\'articles selon des critères d\'inclusion/exclusion\n4. Extraire les données de chaque étude retenue\n5. Évaluer la qualité et le risque de biais dans chaque étude\n6. Appliquer des méthodes statistiques (modèles à effets fixes ou à effets aléatoires)\n7. Interpréter les résultats et rédiger les conclusions\n\nCe processus peut prendre plusieurs semaines ou mois, même pour des chercheurs expérimentés.',
      },
      {
        heading: 'Comment l\'IA transforme la méta-analyse',
        body: 'Des outils d\'IA comme MetaLens AI rendent la méta-analyse préliminaire accessible à tous. Bien qu\'ils ne remplacent pas les revues systématiques formelles, ils peuvent :\n\n- Rechercher dans les 40 millions d\'articles de PubMed en quelques secondes\n- Identifier les études pertinentes à partir de mots-clés\n- Lire et synthétiser automatiquement des résumés\n- Générer des résumés structurés avec les principales conclusions\n- Fournir des citations sources pour vérification\n\nCela est particulièrement utile pour les étudiants en médecine réalisant des revues préliminaires de la littérature, les pharmaciens comparant des options médicamenteuses, et les chercheurs explorant un sujet avant de s\'engager dans une revue systématique complète.',
      },
      {
        heading: 'Limites à garder à l\'esprit',
        body: 'Les outils de méta-analyse basés sur l\'IA ont d\'importantes limitations :\n\n- Ils travaillent avec des résumés, pas avec des articles en texte intégral\n- Ils ne peuvent pas effectuer de regroupement statistique formel\n- Les résultats doivent être vérifiés par rapport aux sources originales\n- Ils peuvent manquer des études pertinentes ou inclure des études de faible qualité\n- Ils ne remplacent pas le jugement clinique\n\nConsidérez toujours les résumés générés par l\'IA comme un point de départ pour des investigations plus approfondies, et non comme des preuves médicales définitives.',
      },
    ],
  },
  'ai-in-medical-research': {
    title: 'Comment l\'IA transforme la recherche médicale en 2026',
    description: 'Découvrez comment l\'intelligence artificielle remodèle la recherche médicale, de la découverte de médicaments aux revues de la littérature.',
    date: '2026-03-20',
    readTime: '8 min de lecture',
    tag: 'IA & Santé',
    sections: [
      {
        heading: 'La révolution de l\'IA dans la santé',
        body: 'L\'intelligence artificielle est passée d\'un concept futuriste à un outil quotidien dans la recherche médicale. En 2026, l\'IA assiste les chercheurs à presque toutes les étapes du processus scientifique — de la génération d\'hypothèses à l\'analyse des résultats.\n\nLa convergence des grands modèles de langage, des vastes ensembles de données biomédicales et de l\'informatique cloud abordable a créé une accélération sans précédent dans la rapidité avec laquelle nous pouvons traiter et comprendre les preuves médicales.',
      },
      {
        heading: 'Revue de la littérature et synthèse des preuves',
        body: 'L\'une des applications les plus impactantes de l\'IA en médecine est la revue automatisée de la littérature. Les outils alimentés par l\'IA peuvent :\n\n- Rechercher des millions d\'articles en quelques secondes (contre des semaines de recherche manuelle)\n- Identifier les études pertinentes sur la base d\'une compréhension sémantique, et non d\'une simple correspondance de mots-clés\n- Résumer les résultats de dizaines d\'articles en résumés structurés\n- Détecter les tendances et le consensus à travers de vastes corpus de preuves\n\nMetaLens AI fait partie de cette vague, rendant les 40 millions d\'articles de PubMed accessibles par de simples recherches par mots-clés et une synthèse basée sur l\'IA.',
      },
      {
        heading: 'Découverte et développement de médicaments',
        body: 'L\'IA accélère considérablement le pipeline de découverte de médicaments :\n\n- Modélisation moléculaire : l\'IA prédit comment les candidats médicaments interagiront avec les cibles biologiques\n- Optimisation des essais cliniques : l\'apprentissage automatique identifie les populations de patients idéales et les critères d\'évaluation\n- Repositionnement : l\'IA trouve de nouvelles utilisations pour les médicaments existants en analysant les tendances dans les études\n- Prédiction de la sécurité : les modèles signalent les effets secondaires potentiels avant des essais cliniques coûteux\n\nCe qui prenait autrefois des années d\'essais et d\'erreurs peut maintenant être restreint en quelques mois, économisant des milliards en coûts de développement.',
      },
      {
        heading: 'Diagnostics basés sur l\'IA',
        body: 'Les diagnostics alimentés par l\'IA sont déjà utilisés en clinique :\n\n- Imagerie médicale : l\'IA détecte les cancers, les fractures et les maladies rétiniennes dans les images radiologiques et ophtalmologiques avec une précision égale ou supérieure à celle des spécialistes\n- Pathologie : l\'IA en pathologie numérique aide à analyser les échantillons de tissus\n- Génomique : l\'IA interprète les variantes génétiques et prédit le risque de maladie\n- Objets connectés : surveillance continue avec alertes alimentées par l\'IA pour les événements cardiaques et d\'autres conditions\n\nCes outils complètent les cliniciens plutôt qu\'ils ne les remplacent, fournissant un second avis et détectant des résultats subtils.',
      },
      {
        heading: 'Défis et considérations éthiques',
        body: 'Malgré la promesse, l\'IA dans la recherche médicale fait face à des défis importants :\n\n- Biais : les modèles d\'IA peuvent perpétuer les biais présents dans les données d\'entraînement, désavantageant potentiellement les populations sous-représentées\n- Transparence : les modèles « boîte noire » peuvent être difficiles à interpréter dans des contextes cliniques\n- Validation : les outils d\'IA ont besoin d\'une validation clinique rigoureuse avant leur déploiement\n- Confidentialité : les données des patients utilisées pour entraîner les modèles doivent être protégées\n- Mésinformation : l\'IA peut générer des informations médicales plausibles mais incorrectes\n\nUn développement et une réglementation responsables sont essentiels pour que l\'IA bénéficie équitablement à tous les patients.',
      },
      {
        heading: 'Perspectives d\'avenir',
        body: 'L\'avenir de l\'IA dans la recherche médicale est prometteur. Nous pouvons espérer :\n\n- Une médecine personnalisée alimentée par l\'analyse IA des données individuelles des patients\n- Une synthèse des preuves en temps réel à mesure que de nouvelles études sont publiées\n- Un soutien à la décision clinique assisté par l\'IA intégré dans les dossiers de santé électroniques\n- Des outils d\'IA collaboratifs qui aident les équipes de recherche à travailler plus efficacement au-delà des frontières\n\nDes outils comme MetaLens AI ne représentent que le début d\'une transformation qui rendra les preuves médicales plus accessibles, compréhensibles et exploitables pour tous.',
      },
    ],
  },
  'how-to-compare-drug-efficacy': {
    title: 'Comment comparer l\'efficacité des médicaments : un guide pratique',
    description: 'Un tutoriel étape par étape pour les étudiants en médecine et les pharmaciens sur la comparaison des résultats thérapeutiques à partir de preuves publiées.',
    date: '2026-03-25',
    readTime: '7 min de lecture',
    tag: 'Tutoriel',
    sections: [
      {
        heading: 'Pourquoi comparer l\'efficacité des médicaments ?',
        body: 'Comparer l\'efficacité des médicaments est l\'une des tâches les plus courantes en pratique clinique et en pharmacie. Que vous soyez un étudiant en médecine étudiant la pharmacologie, un pharmacien conseillant des patients, ou un clinicien choisissant entre des options de traitement, comprendre comment évaluer l\'efficacité comparative est essentiel.\n\nLe défi est que les données d\'efficacité sont dispersées dans des milliers d\'études publiées, chacune avec des méthodologies, des populations de patients et des critères d\'évaluation différents. Ce guide vous aidera à naviguer dans cette complexité.',
      },
      {
        heading: 'Étape 1 : Définir votre comparaison',
        body: 'Commencez par définir clairement ce que vous souhaitez comparer :\n\n- Quels médicaments ? (par exemple, pranlukast vs. montélukast)\n- Pour quelle affection ? (par exemple, contrôle de l\'asthme)\n- Quels résultats ? (par exemple, taux d\'exacerbation, scores de symptômes, mortalité)\n- Dans quelle population ? (par exemple, adultes, enfants, personnes âgées)\n\nUne comparaison bien définie vous aide à trouver des études pertinentes et à éviter de comparer des choses incomparables.',
      },
      {
        heading: 'Étape 2 : Rechercher la littérature',
        body: 'PubMed est la principale base de données pour la recherche biomédicale. Les stratégies de recherche efficaces comprennent :\n\n- Utiliser les termes MeSH (Medical Subject Headings) pour une recherche précise\n- Combiner les noms de médicaments avec les termes de la condition en utilisant les opérateurs ET/OU\n- Filtrer par type d\'étude (les essais contrôlés randomisés fournissent les preuves les plus solides)\n- Chercher d\'abord les revues systématiques et les méta-analyses, car elles ont déjà effectué le travail de synthèse\n\nDes outils comme MetaLens AI peuvent accélérer cette étape en recherchant PubMed et en synthétisant automatiquement les résultats.',
      },
      {
        heading: 'Étape 3 : Évaluer la qualité des études',
        body: 'Toutes les études ne se valent pas. Lors de la comparaison de médicaments, privilégiez :\n\n- Les essais contrôlés randomisés (ECR) plutôt que les études observationnelles\n- Les comparaisons directes (face à face) plutôt que les études contrôlées par placebo\n- Les tailles d\'échantillon plus importantes plutôt que les plus petites\n- Les périodes de suivi plus longues pour les affections chroniques\n- Les études avec des critères d\'évaluation cliniquement pertinents (mortalité, hospitalisation) plutôt que des marqueurs de substitution\n\nUtilisez des outils comme le Risk of Bias de Cochrane pour évaluer systématiquement la qualité des études.',
      },
      {
        heading: 'Étape 4 : Comparer les résultats',
        body: 'Lors de la comparaison de l\'efficacité des médicaments entre les études, examinez :\n\n- Les tailles d\'effet : quelle est l\'ampleur de la différence entre les traitements ?\n- Les intervalles de confiance : quelle est la précision de l\'estimation ?\n- La signification statistique : la différence est-elle probablement réelle (p < 0,05) ?\n- La signification clinique : la différence est-elle significative pour les patients ?\n- Le nombre nécessaire à traiter (NNT) : combien de patients doivent être traités pour qu\'un en bénéficie ?\n\nUne différence statistiquement significative peut ne pas être cliniquement significative, et vice versa.',
      },
      {
        heading: 'Étape 5 : Considérer la sécurité et la tolérance',
        body: 'L\'efficacité n\'est qu\'une moitié du tableau. Comparez également :\n\n- Les effets secondaires courants et leur fréquence\n- Les événements indésirables graves\n- Les interactions médicamenteuses\n- Les contre-indications dans des populations spécifiques\n- L\'observance par les patients et la commodité (fréquence de dosage, voie d\'administration)\n\nLe meilleur médicament n\'est souvent pas le plus efficace, mais celui qui offre le meilleur équilibre entre efficacité, sécurité, coût et acceptation par le patient.',
      },
      {
        heading: 'Utiliser MetaLens AI pour la comparaison de médicaments',
        body: 'MetaLens AI simplifie la comparaison de médicaments en :\n\n1. Entrer les noms des deux médicaments et la condition comme mots-clés (par exemple, « pranlukast, montélukast, asthme, efficacité »)\n2. L\'outil recherche dans PubMed les études pertinentes\n3. L\'IA synthétise les résultats en un résumé structuré\n4. Vous obtenez les principales conclusions comparatives avec des citations sources\n\nBien que cela ne remplace pas une revue systématique formelle, cela vous donne un aperçu rapide des preuves en quelques secondes plutôt qu\'en heures. Utilisez-le comme point de départ, puis approfondissez les articles les plus pertinents.',
      },
    ],
  },
  'understanding-forest-plots': {
    title: 'Comprendre les forest plots et les funnel plots en méta-analyse',
    description: 'Un guide visuel pour interpréter les forest plots et les funnel plots — deux outils essentiels pour communiquer les résultats des méta-analyses.',
    date: '2026-04-01',
    readTime: '7 min de lecture',
    tag: 'Statistiques',
    sections: [
      {
        heading: 'Qu\'est-ce qu\'un forest plot ?',
        body: 'Un forest plot est la visualisation caractéristique d\'une méta-analyse. Il affiche les résultats des études individuelles sous forme de lignes horizontales avec des carrés, et les combine en un seul losange en bas représentant l\'estimation groupée.\n\nChaque composant raconte une histoire :\n- **Le carré** : l\'estimation ponctuelle (par exemple, rapport de cotes, différence de moyennes) pour chaque étude individuelle\n- **La ligne horizontale** : l\'intervalle de confiance à 95 % — plus large signifie plus d\'incertitude\n- **La taille du carré** : proportionnelle au poids statistique de l\'étude (les études plus importantes ont des carrés plus grands)\n- **La ligne verticale** : la ligne d\'absence d\'effet (généralement 0 pour les différences, 1 pour les rapports)\n- **Le losange** : l\'effet groupé de toutes les études (largeur = intervalle de confiance)',
      },
      {
        heading: 'Comment lire un forest plot',
        body: 'Lire un forest plot de haut en bas :\n\n1. Regardez la position du carré de chaque étude — est-il à gauche ou à droite de la ligne nulle ?\n2. Vérifiez l\'intervalle de confiance — croise-t-il la ligne nulle ? Si oui, cette étude n\'est pas statistiquement significative en elle-même\n3. Observez le losange en bas — s\'il ne croise pas la ligne nulle, le résultat groupé est statistiquement significatif\n4. Cherchez la cohérence — la plupart des études pointent-elles dans la même direction ?\n\nUn forest plot qui montre la plupart des carrés d\'un côté avec un losange qui ne croise pas la ligne nulle indique des preuves solides et cohérentes d\'un effet.',
      },
      {
        heading: 'La statistique I² : mesurer l\'hétérogénéité',
        body: 'L\'hétérogénéité désigne la variabilité entre les résultats des études au-delà de ce qui serait attendu par hasard. La statistique I² quantifie cela :\n\n- **I² 0–25 %** : Faible hétérogénéité — les études sont assez cohérentes\n- **I² 26–50 %** : Hétérogénéité modérée\n- **I² 51–75 %** : Hétérogénéité substantielle\n- **I² > 75 %** : Hétérogénéité élevée — les résultats varient considérablement\n\nUne forte hétérogénéité est un signal d\'alarme. Elle peut indiquer que les études ont mesuré des choses différentes, ont inclus des populations de patients différentes, ou ont utilisé des interventions différentes. Lorsque I² est élevé, un modèle à effets aléatoires est préféré à un modèle à effets fixes.',
      },
      {
        heading: 'Qu\'est-ce qu\'un funnel plot ?',
        body: 'Un funnel plot est utilisé pour détecter les biais de publication — la tendance des études positives à être publiées plus souvent que les études négatives.\n\nDans un funnel plot :\n- Chaque étude est représentée par un point\n- L\'axe des abscisses montre la taille de l\'effet\n- L\'axe des ordonnées montre la précision de l\'étude (généralement l\'erreur standard ou la taille de l\'échantillon)\n- Les grandes études précises se regroupent en haut ; les petites études imprécises se dispersent en bas\n\nS\'il n\'y a pas de biais de publication, les points forment une forme de funnel inversé symétrique. Une asymétrie — surtout des lacunes dans les coins inférieurs — suggère que de petites études négatives peuvent manquer dans la littérature.',
      },
      {
        heading: 'Erreurs d\'interprétation courantes à éviter',
        body: 'Plusieurs erreurs courantes lors de la lecture de ces graphiques :\n\n- **Confusion entre signification statistique et clinique** : un résultat groupé statistiquement significatif peut encore représenter une taille d\'effet cliniquement triviale\n- **Ignorer l\'hétérogénéité** : une estimation groupée est trompeuse si I² est très élevé\n- **Surinterprétation de l\'asymétrie du funnel plot** : de petites asymétries peuvent simplement refléter le hasard, surtout avec moins de 10 études\n- **Négliger l\'échelle** : l\'échelle de l\'axe des abscisses importe — des rapports de cotes de 0,95 vs 0,50 sont très différents\n\nLisez toujours le forest plot dans le contexte de la section méthodes complète de la revue.',
      },
      {
        heading: 'Comment MetaLens AI utilise ces visualisations',
        body: 'MetaLens AI génère automatiquement des forest plots et des funnel plots lorsque des données quantitatives suffisantes peuvent être extraites des résumés d\'études.\n\nL\'onglet Méta-Analyse montre :\n- Les estimations des études individuelles avec les intervalles de confiance\n- Le losange groupé avec l\'IC à 95 %\n- La statistique d\'hétérogénéité I²\n- Le funnel plot du biais de publication\n\nCes visualisations vous aident à saisir rapidement la direction, l\'ampleur et la cohérence des preuves — tout cela à partir d\'une simple recherche par mots-clés.',
      },
    ],
  },
  'systematic-review-protocol': {
    title: 'Comment rédiger un protocole de revue systématique',
    description: 'Guide étape par étape pour créer un protocole de revue systématique conforme aux normes PRISMA, du cadre PICO à la pré-enregistrement.',
    date: '2026-04-05',
    readTime: '8 min de lecture',
    tag: 'Tutoriel',
    sections: [
      {
        heading: 'Pourquoi rédiger d\'abord un protocole ?',
        body: 'Un protocole de revue systématique est un plan pré-spécifié rédigé avant la conduite de la revue. C\'est le fondement d\'une recherche rigoureuse, transparente et reproductible.\n\nRédiger le protocole en premier :\n- Prévient le « changement de résultats » (modifier votre question de recherche après avoir vu les résultats)\n- Vous oblige à réfléchir à vos méthodes avant de rencontrer des biais potentiels\n- Permet une révision par les pairs de vos méthodes avant d\'investir des semaines de travail\n- Crée une responsabilité lorsqu\'il est enregistré dans des bases de données comme PROSPERO\n\nSans protocole, les revues systématiques sont vulnérables aux mêmes biais qu\'elles sont conçues pour surmonter.',
      },
      {
        heading: 'Étape 1 : Définir votre question PICO',
        body: 'Chaque revue systématique commence par une question clinique bien structurée utilisant le cadre PICO :\n\n- **P**opulation : qui étudiez-vous ? (par exemple, adultes atteints de diabète de type 2)\n- **I**ntervention : quel traitement ou quelle exposition ? (par exemple, metformine)\n- **C**omparaison : à quoi comparez-vous ? (par exemple, placebo ou autre médicament)\n- **O**utcome (résultat) : que mesurez-vous ? (par exemple, réduction de l\'HbA1c à 6 mois)\n\nUne question PICO bien formulée pourrait être : « Chez les adultes atteints de diabète de type 2 (P), la metformine (I) comparée au placebo (C) réduit-elle l\'HbA1c de ≥ 1 % à 6 mois (O) ? »\n\nVotre PICO détermine tout le reste — votre stratégie de recherche, vos critères d\'inclusion/exclusion et votre formulaire d\'extraction de données.',
      },
      {
        heading: 'Étape 2 : Spécifier les critères d\'inclusion et d\'exclusion',
        body: 'Pré-spécifiez exactement quelles études vous inclurez et excluerez :\n\n**Inclure :**\n- Types d\'études (par exemple, ECR uniquement, ou aussi études de cohorte)\n- Caractéristiques de la population (tranche d\'âge, diagnostic, cadre)\n- Durée minimale de suivi\n- Résultats rapportés\n- Restrictions linguistiques (le cas échéant)\n\n**Exclure :**\n- Rapports de cas et éditoriaux\n- Études en dessous d\'une taille d\'échantillon minimale\n- Études présentant un risque élevé de biais (définissez comment vous évaluerez cela)\n- Publications en double\n\nSoyez aussi précis que possible. Des critères vagues entraînent des décisions de sélection incohérentes.',
      },
      {
        heading: 'Étape 3 : Planifier votre stratégie de recherche',
        body: 'Une revue systématique exhaustive recherche dans plusieurs bases de données :\n\n- **PubMed/MEDLINE** : essentiel pour les sujets biomédicaux\n- **Embase** : particulièrement utile pour les essais cliniques européens\n- **Cochrane Central Register** : essais randomisés\n- **CINAHL** : soins infirmiers et professions de santé connexes\n- **ClinicalTrials.gov** : essais non publiés ou en cours (réduit les biais de publication)\n\nPour chaque base de données, développez une chaîne de recherche utilisant :\n- Des termes MeSH (vocabulaire contrôlé) ET des mots-clés en texte libre\n- Des opérateurs booléens (ET, OU, NON)\n- La troncature (*) et les caractères génériques\n\nDocumentez votre chaîne de recherche exacte — elle doit être reproductible. Des outils comme MetaLens AI peuvent aider à la cadrage initial avant de vous engager dans une recherche complète.',
      },
      {
        heading: 'Étape 4 : Formulaire d\'extraction de données',
        body: 'Avant de commencer à extraire des données, concevez votre formulaire d\'extraction. Pour chaque étude incluse, vous enregistrerez généralement :\n\n- Identifiant de l\'étude, auteur, année, pays\n- Conception de l\'étude et suivi\n- Caractéristiques de la population (taille de l\'échantillon, âge, sexe, sévérité de base)\n- Détails de l\'intervention (dose, durée, comparateur)\n- Données de résultats (moyennes, ET, taux d\'événements, estimations d\'effet, IC, valeurs p)\n- Évaluation du risque de biais\n\nTestez votre formulaire sur 2 à 3 études avant l\'extraction à grande échelle. Deux réviseurs extrayant indépendamment avec arbitrage réduit les erreurs.',
      },
      {
        heading: 'Étape 5 : Enregistrer votre protocole',
        body: 'Pré-enregistrer votre protocole augmente la transparence et la crédibilité :\n\n- **PROSPERO** (prospero.york.ac.uk) : le registre le plus utilisé pour les revues systématiques\n- **Open Science Framework** (osf.io) : adapté à tout type de recherche\n- **Cochrane** : si vous réalisez une revue Cochrane\n\nL\'enregistrement vous donne un enregistrement daté montrant que vos méthodes ont été décidées avant d\'avoir vu les données. La plupart des revues à fort impact attendent ou exigent désormais l\'enregistrement pour les revues systématiques.\n\nUne fois enregistré, tout écart par rapport à votre protocole doit être signalé et justifié dans votre article.',
      },
      {
        heading: 'Utiliser les outils d\'IA dans les revues systématiques',
        body: 'Les outils d\'IA comme MetaLens AI sont précieux pour la phase de cadrage — avant de rédiger votre protocole formel :\n\n- Scanner rapidement la littérature existante pour évaluer si une revue systématique est justifiée\n- Identifier les articles clés et les revues dans votre domaine\n- Comprendre l\'état actuel des preuves et les tailles d\'effet probables\n- Affiner votre question PICO en fonction de ce qui a réellement été étudié\n\nCependant, les outils d\'IA ne remplacent pas une revue systématique formelle. Ils travaillent à partir de résumés, peuvent manquer des études pertinentes et ne peuvent pas effectuer d\'évaluations formelles du risque de biais. Utilisez-les pour informer et accélérer le développement de votre protocole, mais pas pour le remplacer.',
      },
    ],
  },
  'publication-bias-detection': {
    title: 'Biais de publication : ce que c\'est et comment le détecter',
    description: 'Une explication claire du biais de publication dans la recherche médicale, son impact sur les méta-analyses et les méthodes statistiques pour le détecter et le corriger.',
    date: '2026-04-08',
    readTime: '6 min de lecture',
    tag: 'Statistiques',
    sections: [
      {
        heading: 'Qu\'est-ce que le biais de publication ?',
        body: 'Le biais de publication est la tendance des résultats d\'études positifs ou statistiquement significatifs à être publiés plus souvent que les résultats négatifs ou nuls. Quand un médicament fonctionne, l\'étude est publiée. Quand il ne fonctionne pas, elle finit souvent dans un tiroir.\n\nCela crée une image déformée des preuves. Si vous lisez uniquement la littérature publiée, vous pouvez conclure qu\'un traitement est plus efficace qu\'il ne l\'est réellement, simplement parce que les études montrant qu\'il ne fonctionne pas n\'ont jamais été publiées.',
      },
      {
        heading: 'Pourquoi le biais de publication est-il important pour les méta-analyses ?',
        body: 'Les méta-analyses regroupent des données provenant d\'études publiées. Si un biais de publication existe, l\'estimation groupée sera gonflée — elle surestimera l\'effet du traitement.\n\nCela a des conséquences réelles :\n- Les recommandations cliniques peuvent préconiser des traitements moins efficaces que ne le suggèrent les preuves\n- Les patients reçoivent des traitements avec des profils bénéfice-risque moins favorables que prévu\n- Les études de réplication échouent, conduisant à des « crises de reproductibilité »\n\nL\'exemple le plus célèbre est la revue Cochrane sur les antidépresseurs. Lorsque les données d\'essais non publiées détenues par la FDA ont été incluses, les vraies tailles d\'effet étaient substantiellement plus petites que ne le suggérait la littérature publiée seule.',
      },
      {
        heading: 'Le funnel plot : détection visuelle',
        body: 'Le funnel plot est l\'outil le plus couramment utilisé pour détecter visuellement le biais de publication.\n\nDans un funnel symétrique, les petites études se dispersent largement autour du vrai effet, tandis que les grandes études se regroupent étroitement autour de lui — formant un funnel inversé.\n\nUne asymétrie dans le coin inférieur gauche du funnel suggère des petites études manquantes avec des résultats négatifs. Ce manque implique un biais de publication.\n\nCependant, l\'asymétrie du funnel plot peut également être causée par :\n- L\'hétérogénéité (effets vrais différents dans différentes populations)\n- Le hasard (surtout avec moins de 10 études)\n- Le biais de rapport de résultats (rapporter sélectivement les résultats)\n\nLes funnel plots nécessitent au moins 10 études pour être interprétés de manière fiable.',
      },
      {
        heading: 'Tests statistiques pour le biais de publication',
        body: 'Plusieurs tests statistiques quantifient l\'asymétrie du funnel plot :\n\n- **Test d\'Egger** : une régression linéaire pondérée de l\'écart normal standard par rapport à la précision. p < 0,05 suggère une asymétrie\n- **Test de Begg** : un test de corrélation des rangs ; moins puissant que le test d\'Egger\n- **Trim and Fill** : estime le nombre d\'études manquantes, ajoute des valeurs imputées et recalcule l\'estimation groupée\n\nCes tests ont une puissance limitée avec peu d\'études (< 10) et peuvent manquer le biais de publication lorsqu\'il existe ou le signaler lorsqu\'il n\'existe pas. Ils complètent, mais ne remplacent pas, les recherches complètes dans la littérature grise.',
      },
      {
        heading: 'Stratégies pour minimiser le biais de publication',
        body: 'La meilleure défense contre le biais de publication est de l\'empêcher de se produire :\n\n1. **Rechercher dans les registres d\'essais cliniques** (ClinicalTrials.gov, WHO ICTRP) les essais enregistrés mais non publiés\n2. **Rechercher dans les résumés de conférences** les résultats préliminaires qui n\'ont jamais été publiés\n3. **Contacter les auteurs** des études incluses pour demander des travaux non publiés\n4. **Rechercher la littérature grise** : thèses, rapports gouvernementaux, documents réglementaires\n5. **Pré-enregistrer votre revue** dans PROSPERO pour vous engager à publier quels que soient les résultats\n\nLes agences réglementaires comme la FDA exigent désormais l\'enregistrement des essais avant le début de l\'enrôlement des patients, ce qui a amélioré la situation mais ne l\'a pas éliminée.',
      },
      {
        heading: 'Comment MetaLens AI aborde ce problème',
        body: 'MetaLens AI génère des funnel plots dans l\'onglet Méta-Analyse pour vous aider à évaluer visuellement le biais de publication dans votre domaine. L\'outil :\n\n- Recherche PubMed de manière exhaustive pour votre combinaison de mots-clés\n- Inclut des études plus anciennes (pas seulement les plus récentes à fort impact)\n- Fournit des citations sources afin que vous puissiez vérifier vous-même le statut d\'enregistrement des essais\n\nRappellez-vous que tous les outils de littérature assistés par l\'IA font face à la même limitation fondamentale : ils travaillent avec la littérature publiée. Pour une revue systématique définitive, compléter PubMed avec des sources de données non publiées reste essentiel.',
      },
    ],
  },
  'p-values-statistical-significance': {
    title: 'Valeurs p et signification statistique dans la recherche médicale',
    description: 'Ce que signifient réellement les valeurs p, pourquoi p < 0,05 est souvent mal compris, et comment interpréter les résultats statistiques dans les études cliniques.',
    date: '2026-04-10',
    readTime: '7 min de lecture',
    tag: 'Éducation',
    sections: [
      {
        heading: 'Qu\'est-ce qu\'une valeur p ?',
        body: 'La valeur p est l\'une des statistiques les plus utilisées et les plus mal comprises dans la recherche médicale.\n\nLa définition formelle : la valeur p est la probabilité d\'observer des résultats au moins aussi extrêmes que ceux trouvés, en supposant que l\'hypothèse nulle est vraie.\n\nL\'hypothèse nulle est généralement « il n\'y a aucun effet » ou « les deux traitements sont égaux ». Une petite valeur p signifie : si il n\'y avait vraiment aucun effet, il serait très improbable de voir des résultats aussi extrêmes par hasard.\n\nUne valeur p de 0,03 signifie : si l\'hypothèse nulle était vraie, vous observeriez des résultats aussi extrêmes ou plus extrêmes seulement 3 % du temps par hasard.',
      },
      {
        heading: 'Ce que p < 0,05 ne signifie PAS',
        body: 'Le seuil p < 0,05 est profondément ancré dans la recherche médicale, mais il est souvent interprété incorrectement :\n\n**p < 0,05 ne signifie PAS :**\n- Il y a 95 % de chances que le résultat soit correct\n- Le traitement fonctionne définitivement\n- L\'effet est cliniquement significatif\n- L\'étude sera reproduite\n- L\'hypothèse nulle est fausse\n\n**p < 0,05 signifie :**\n- Si l\'hypothèse nulle était vraie, des résultats aussi extrêmes se produiraient moins de 5 % du temps par hasard\n- La découverte satisfait un seuil arbitraire de « signification statistique »\n\nLe seuil de 0,05 a été choisi par Ronald Fisher dans les années 1920 comme règle approximative — pas comme une loi fondamentale de la nature.',
      },
      {
        heading: 'Signification statistique vs. signification clinique',
        body: 'Un résultat statistiquement significatif n\'est pas nécessairement cliniquement significatif.\n\n**Exemple :** Un grand essai avec 50 000 patients montre qu\'un nouveau médicament réduit la pression artérielle de 1 mmHg (p = 0,0001). C\'est hautement statistiquement significatif mais cliniquement sans signification — une différence de 1 mmHg n\'a aucun impact sur les résultats cardiovasculaires.\n\nInversement, un petit essai avec 30 patients montre qu\'un médicament réduit la taille de la tumeur de 40 % (p = 0,08). Cela manque le seuil de 0,05 mais peut représenter un effet véritablement important qui mérite une investigation plus approfondie.\n\nDemandez toujours : Quelle est la taille de l\'effet ? Est-elle cliniquement significative ? Quel est l\'intervalle de confiance ? Inclut-il la différence minimale cliniquement importante ?',
      },
      {
        heading: 'Les intervalles de confiance sont plus informatifs',
        body: 'Un intervalle de confiance (IC) à 95 % vous en dit plus qu\'une valeur p seule.\n\nSi l\'IC à 95 % pour un rapport de cotes est de 1,2 à 3,4 :\n- La meilleure estimation est le point médian (environ 2,0)\n- Vous pouvez avoir 95 % de confiance que le vrai effet se situe entre 1,2 et 3,4\n- Puisque 1,0 (aucun effet) est exclu, le résultat est statistiquement significatif\n\nLes intervalles de confiance communiquent :\n- La direction de l\'effet\n- L\'ampleur de l\'effet\n- La précision de l\'estimation\n- Si l\'effet est cliniquement significatif\n\nUn IC allant de 0,9 à 12,0 est techniquement significatif si 1,0 est exclu, mais l\'énorme plage vous indique que l\'estimation est très imprécise.',
      },
      {
        heading: 'Comparaisons multiples et le problème du p-hacking',
        body: 'Si vous effectuez 20 tests statistiques et utilisez p < 0,05 comme seuil, vous attendriez 1 résultat « significatif » purement par hasard — même si rien ne se passe réellement.\n\nC\'est ce qu\'on appelle le problème des comparaisons multiples, et cela conduit au p-hacking : effectuer de nombreuses analyses et ne rapporter sélectivement que celles qui atteignent p < 0,05.\n\nPour y remédier :\n- **Correction de Bonferroni** : diviser le seuil par le nombre de comparaisons (par exemple, 0,05/10 = 0,005)\n- **Pré-enregistrement** : s\'engager sur votre résultat principal avant de collecter les données\n- **Taux de fausses découvertes (TFD)** : contrôle la proportion attendue de faux positifs\n\nLorsque vous lisez une étude avec plusieurs résultats, vérifiez si le résultat principal était pré-spécifié et si des corrections pour comparaisons multiples ont été appliquées.',
      },
      {
        heading: 'Au-delà des valeurs p : les tailles d\'effet',
        body: 'L\'American Statistical Association et de nombreuses revues recommandent maintenant d\'aller au-delà des décisions binaires p < 0,05 et de rapporter les tailles d\'effet avec des intervalles de confiance.\n\nMesures courantes de la taille de l\'effet :\n- **d de Cohen** : différence de moyennes standardisée (d = 0,2 petit, 0,5 moyen, 0,8 grand)\n- **Rapport de cotes (RC)** : rapport des cotes d\'un résultat chez les exposés vs. les non exposés\n- **Risque relatif (RR)** : rapport du risque dans le groupe traité vs. le groupe témoin\n- **Réduction absolue du risque (RAR)** : différence des taux d\'événements (cliniquement le plus intuitif)\n- **Nombre nécessaire à traiter (NNT)** : 1/RAR — combien de patients doivent être traités pour qu\'un en bénéficie\n\nMetaLens AI extrait et affiche ces tailles d\'effet à partir des résumés publiés, vous donnant une image plus riche que les valeurs p seules.',
      },
    ],
  },
  'evidence-based-medicine-guide': {
    title: 'Médecine factuelle : un guide pratique pour les cliniciens',
    description: 'Comment intégrer les meilleures preuves disponibles avec l\'expertise clinique et les valeurs des patients — les trois piliers de la médecine factuelle.',
    date: '2026-04-11',
    readTime: '8 min de lecture',
    tag: 'Clinique',
    sections: [
      {
        heading: 'Qu\'est-ce que la médecine factuelle ?',
        body: 'La médecine factuelle (MF) est l\'utilisation consciencieuse, explicite et judicieuse des meilleures preuves actuelles dans la prise de décisions concernant les soins des patients individuels.\n\nLe terme a été inventé par Gordon Guyatt à l\'Université McMaster au début des années 1990 et a depuis transformé la façon dont la formation médicale, les recommandations cliniques et les politiques de santé sont développées.\n\nLa MF repose sur trois piliers :\n1. **Meilleures preuves disponibles** : recherche de haute qualité, idéalement des ECR et des méta-analyses\n2. **Expertise clinique** : les connaissances, l\'expérience et le jugement du clinicien\n3. **Valeurs et préférences des patients** : ce qui compte pour ce patient spécifique\n\nLes trois doivent être intégrés. Les preuves seules ne suffisent pas — elles doivent être appliquées en contexte.',
      },
      {
        heading: 'La hiérarchie des preuves',
        body: 'Toutes les preuves ne sont pas créées égales. La hiérarchie du plus fort au plus faible :\n\n1. **Revues systématiques et méta-analyses** — regroupent les résultats de plusieurs études de haute qualité\n2. **Essais contrôlés randomisés (ECR)** — référence en matière de causalité\n3. **Études de cohorte** — suivent des groupes dans le temps ; bonnes pour les expositions rares\n4. **Études cas-témoins** — comparent les cas aux témoins ; bonnes pour les résultats rares\n5. **Études transversales** — instantané dans le temps ; montrent des associations, pas de causalité\n6. **Rapports de cas et opinion d\'experts** — anecdotiques ; forme de preuve la plus faible\n\nLa hiérarchie Cochrane est utile, mais le contexte compte. Une étude observationnelle bien conçue peut l\'emporter sur un ECR mal conduit. Les numéros au sommet ne garantissent pas la qualité.',
      },
      {
        heading: 'Poser des questions cliniques répondables',
        body: 'La première étape dans la pratique de la MF est de traduire un problème clinique en une question répondable en utilisant PICO :\n\n**Scénario clinique :** Un homme de 65 ans avec FA et IRC stade 3 — devriez-vous prescrire un AOD ou de la warfarine ?\n\n**Question PICO :**\n- **P** : adultes avec FA non valvulaire et IRC stade 3\n- **I** : anticoagulants oraux directs (AOD)\n- **C** : warfarine\n- **O** : accident vasculaire cérébral, embolie systémique, saignement majeur à 12 mois\n\nAvec une question bien formulée, des outils comme MetaLens AI peuvent rechercher PubMed et synthétiser les preuves en quelques secondes, vous donnant un point de départ pour la littérature.',
      },
      {
        heading: 'Évaluer les preuves',
        body: 'Trouver des preuves n\'est que la première étape — vous devez les évaluer de manière critique :\n\n**Pour les ECR, demandez :**\n- La randomisation était-elle vraiment aléatoire ? L\'allocation était-elle dissimulée ?\n- Les participants et les cliniciens étaient-ils en aveugle ?\n- Le suivi était-il complet ? Des analyses en intention de traiter ont-elles été utilisées ?\n- Le groupe témoin est-il cliniquement pertinent ?\n\n**Pour les méta-analyses, demandez :**\n- La recherche était-elle exhaustive ? Des études non publiées ont-elles été recherchées ?\n- Les critères d\'inclusion étaient-ils appropriés ?\n- L\'hétérogénéité a-t-elle été évaluée et expliquée ?\n- Y a-t-il des preuves de biais de publication ?\n\nLa liste de contrôle CONSORT (pour les ECR) et la liste de contrôle PRISMA (pour les revues systématiques) fournissent des cadres structurés pour l\'évaluation.',
      },
      {
        heading: 'Appliquer les preuves aux patients individuels',
        body: 'Même les meilleures preuves proviennent de populations — vous traitez un individu.\n\nQuestions clés lors de l\'application des preuves :\n- Mon patient est-il similaire à ceux de l\'essai ? (âge, comorbidités, sévérité)\n- Des patients comme le mien ont-ils été exclus de l\'essai ?\n- Comment le NNT se traduit-il par rapport au risque de base de mon patient ?\n- Y a-t-il des contre-indications ou des interactions chez mon patient ?\n- Que valorise mon patient ? Accepterait-il le compromis entre efficacité et effets secondaires ?\n\nUn traitement avec un NNT = 50 sur 5 ans peut valoir la peine pour un patient à haut risque mais pas pour un patient à faible risque, même si la réduction du risque relatif est la même.',
      },
      {
        heading: 'La MF à l\'ère de l\'IA',
        body: 'L\'IA change la façon dont les cliniciens accèdent aux preuves et les appliquent :\n\n- **Les outils de littérature** comme MetaLens AI rendent la synthèse systématique des preuves disponible au point de soin\n- **Les systèmes d\'aide à la décision clinique** intègrent les preuves dans les dossiers de santé électroniques\n- **Les outils de diagnostic IA** commencent à égaler les spécialistes en radiologie et en pathologie\n\nCependant, l\'IA ne peut pas remplacer le jugement clinique et l\'empathie humaine qui caractérisent la bonne médecine. Les outils d\'IA peuvent manquer des nuances, avoir des biais dans les données d\'entraînement ou générer des erreurs plausibles.\n\nLe rôle du clinicien évolue de la mémorisation des preuves à l\'évaluation critique des résultats de l\'IA et à leur intégration dans le contexte du patient. Les trois piliers de la MF — preuves, expertise et valeurs des patients — restent aussi pertinents que jamais.',
      },
    ],
  },
  'research-grant-proposal': {
    title: 'Comment rédiger une proposition de subvention de recherche gagnante',
    description: 'Un guide pratique étape par étape pour structurer une proposition de subvention de recherche convaincante, des objectifs spécifiques à la justification budgétaire.',
    date: '2026-04-12',
    readTime: '9 min de lecture',
    tag: 'Recherche',
    sections: [
      {
        heading: 'L\'anatomie d\'une proposition de subvention',
        body: 'Les subventions de recherche suivent une structure standard quelle que soit l\'agence de financement. Comprendre cette structure vous aide à rédiger une proposition que les évaluateurs peuvent évaluer efficacement.\n\nLes sections principales de la plupart des subventions biomédicales (comme le NIH R01) :\n1. **Objectifs spécifiques** (1 page) — la section la plus critique\n2. **Stratégie de recherche** : Importance, Innovation, Approche\n3. **Données préliminaires** — votre bilan et vos preuves de faisabilité\n4. **Sujets humains / Animaux** — éthique et conformité\n5. **Budget et justification**\n6. **Notices biographiques** (CV)\n\nPour les subventions plus petites (prix de carrière, subventions de fondation), la structure est plus simple mais les principes sont les mêmes.',
      },
      {
        heading: 'La page des objectifs spécifiques : votre page la plus importante',
        body: 'La page des objectifs spécifiques est la première chose que les évaluateurs lisent et détermine souvent s\'ils lisent le reste attentivement.\n\nUne structure solide de la page des objectifs spécifiques :\n\n**Paragraphe 1 — L\'accroche (2-3 phrases) :** Énoncer le problème clinique ou scientifique. Clarifier pourquoi cela est important. Terminer par : « Malgré X, rien n\'est connu sur Y. »\n\n**Paragraphe 2 — Votre solution (3-4 phrases) :** Présenter votre approche, vos données préliminaires montrant la faisabilité, et votre objectif à long terme.\n\n**Paragraphe 3 — Les objectifs :** Lister 2-3 objectifs spécifiques et testables. Chacun devrait être répondable indépendamment afin que toute la subvention n\'échoue pas si un objectif ne fonctionne pas.\n\n**Paragraphe de clôture :** Résumer l\'impact — que saurons-nous après cette subvention que nous ne savons pas maintenant ?\n\nDemandez à des collègues de ne lire que cette page et de vous expliquer ce que vous proposez.',
      },
      {
        heading: 'Importance et innovation',
        body: 'Les évaluateurs notent les subventions sur l\'importance, l\'innovation et l\'approche.\n\n**L\'importance** répond à : pourquoi cela est-il important ?\n- Décrire le fardeau de santé publique (prévalence, mortalité, coût)\n- Citer le déficit de connaissances — ce qui est inconnu ou incertain\n- Indiquer ce qui changera si votre hypothèse est confirmée\n- Référencer des méta-analyses et des revues systématiques pour établir la base de preuves actuelle\n\n**L\'innovation** répond à : qu\'est-ce qui est nouveau dans votre approche ?\n- Est-ce une nouvelle hypothèse, méthode, population ou technologie ?\n- Comment votre approche diffère-t-elle de ce que les autres ont fait ?\n- Soyez précis — « novateur » sans précision est un signal d\'alarme pour les évaluateurs',
      },
      {
        heading: 'Données préliminaires : prouver la faisabilité',
        body: 'Les données préliminaires sont vos preuves que vous pouvez exécuter le travail proposé.\n\nDes données préliminaires solides :\n- Démontrent la faisabilité technique (vous pouvez effectuer les expériences)\n- Montrent une preuve de concept (l\'hypothèse a des preuves à l\'appui)\n- Établissent l\'expertise et le bilan de votre équipe\n- Fournissent des calculs de puissance pour la détermination de la taille de l\'échantillon\n\nSi vous n\'avez pas de données préliminaires :\n- Utilisez des données publiées de vos propres travaux ou de ceux des autres pour soutenir vos calculs de puissance\n- Utilisez des outils d\'IA comme MetaLens AI pour synthétiser rapidement les preuves existantes et dériver les tailles d\'effet attendues\n- Effectuez de petites expériences pilotes peu coûteuses avant de soumettre des subventions importantes\n\nLes agences de financement financent les personnes autant que les projets. Votre bilan compte.',
      },
      {
        heading: 'L\'approche de recherche : conception et rigueur',
        body: 'La section Approche est le cœur de votre science. Elle doit montrer que vos méthodes sont rigoureuses et que vous avez anticipé les problèmes potentiels.\n\nPour chaque objectif :\n1. **Justification** : pourquoi cette conception expérimentale ?\n2. **Méthodes** : description détaillée mais claire des participants, interventions, mesures\n3. **Plan d\'analyse statistique** : pré-spécifié, suffisamment puissant, méthodes appropriées\n4. **Écueils potentiels et alternatives** : que pourrait-il mal tourner, et comment y remédierez-vous ?\n\nLes évaluateurs cherchent : est-ce faisable ? Est-ce rigoureux ? L\'équipe a-t-elle réfléchi à ce qui pourrait mal tourner ?\n\nÉvitez les promesses excessives. Les évaluateurs respectent les équipes qui ont réfléchi aux limites et ont des plans de secours.',
      },
      {
        heading: 'Budget et erreurs courantes',
        body: 'Le budget doit être justifié, pas seulement listé.\n\n**Erreurs budgétaires courantes :**\n- Sous-budgétiser pour paraître économique (les évaluateurs connaissent les vrais coûts)\n- Surbudgétiser sans justification\n- Oublier les coûts indirects (frais généraux, généralement 26-60 % des coûts directs)\n- Ne pas tenir compte des augmentations de salaire sur les subventions pluriannuelles\n\n**La section de justification** doit expliquer pourquoi chaque coût est nécessaire pour le travail proposé. Soyez précis.\n\n**Erreurs courantes dans les propositions :**\n- Essayer d\'en faire trop (visez la profondeur, pas la largeur)\n- Ne pas énoncer clairement votre hypothèse\n- Ignorer les commentaires des évaluations précédentes\n- Soumettre sans avoir demandé à des collègues de la lire\n- Page des objectifs spécifiques faible\n\nOrganisez une évaluation fictive avec des collègues avant la soumission. Révisez et resoumettez si ce n\'est pas financé au premier essai — la plupart des subventions réussies sont financées à la deuxième ou troisième soumission.',
      },
    ],
  },
  'systematic-review-vs-meta-analysis': {
    title: 'Revue systématique vs méta-analyse : différences clés expliquées',
    description: 'Une comparaison claire des revues systématiques et des méta-analyses — ce qu\'elles sont, comment elles diffèrent, et quand chaque approche est appropriée.',
    date: '2026-04-13',
    readTime: '6 min de lecture',
    tag: 'Éducation',
    sections: [
      {
        heading: 'Les bases : définitions',
        body: 'Ces deux termes sont souvent utilisés de manière interchangeable, mais ils décrivent des choses différentes — et toutes les revues systématiques ne sont pas des méta-analyses.\n\n**Revue systématique** : une synthèse rigoureuse et reproductible de toutes les preuves disponibles sur une question de recherche spécifique. Utilise une stratégie de recherche documentée et pré-spécifiée et des critères d\'inclusion/exclusion explicites. Les résultats peuvent être présentés de manière narrative.\n\n**Méta-analyse** : une technique statistique permettant de combiner des résultats quantitatifs de plusieurs études en une seule estimation groupée. La méta-analyse est souvent réalisée dans le cadre d\'une revue systématique, mais pas toujours.\n\nEn termes simples : une revue systématique est le processus ; la méta-analyse est l\'un des résultats possibles de ce processus.',
      },
      {
        heading: 'Quand peut-on réaliser une méta-analyse ?',
        body: 'La méta-analyse exige que les études soient suffisamment similaires pour être combinées statistiquement. Vous avez besoin de :\n\n- **PICO similaire** : populations, interventions, comparateurs et résultats comparables\n- **Données quantitatives** : tailles d\'effet, intervalles de confiance, ou suffisamment de données pour les calculer\n- **Nombre d\'études adéquat** : au moins 3-5 études (plus c\'est mieux pour la puissance)\n- **Hétérogénéité acceptable** : si I² > 75 %, le regroupement peut être trompeur\n\nLorsque les études sont trop hétérogènes — mesurant des choses différentes dans des populations différentes avec des méthodes différentes — une revue systématique narrative (descriptive) est plus appropriée que forcer un regroupement statistique qui n\'aurait aucun sens.',
      },
      {
        heading: 'Avantages et inconvénients de chaque approche',
        body: '**Revue systématique sans méta-analyse :**\n✓ Peut inclure des études qualitatives et hétérogènes\n✓ Évite une précision trompeuse liée à un regroupement inapproprié\n✓ Préférable pour les interventions complexes à composantes multiples\n✗ Plus subjective — la synthèse narrative peut introduire des biais\n✗ Plus difficile à résumer pour la prise de décision clinique\n\n**Méta-analyse :**\n✓ Fournit une estimation résumée unique avec intervalle de confiance\n✓ Plus de puissance statistique que n\'importe quelle étude individuelle\n✓ Informe directement les recommandations de pratique clinique\n✗ Peut produire une fausse précision si les études sont hétérogènes\n✗ Vulnérable aux biais de publication\n✗ Résultats médiocres si les études incluses sont de mauvaise qualité',
      },
      {
        heading: 'Revues rapides et revues de portée',
        body: 'Entre les revues informelles de la littérature et les revues systématiques complètes, plusieurs approches intermédiaires existent :\n\n**Revue rapide** : simplifie les méthodes de revue systématique pour répondre rapidement à une question (semaines vs. mois). Acceptable pour les questions politiques urgentes. Reconnaît explicitement les limitations.\n\n**Revue de portée** : cartographie la littérature existante sur un sujet large pour identifier les lacunes, pas pour répondre à une question spécifique. Ne nécessite pas d\'évaluation de la qualité des études incluses. Précède souvent une revue systématique complète.\n\n**Revue narrative** : une synthèse d\'expert sans méthodes de recherche systématiques. Plus rapide mais plus sujette aux biais. Moins reproductible. Toujours utile à des fins éducatives.\n\nDes outils comme MetaLens AI sont mieux décrits comme un cadrage rapide assisté par l\'IA — ils fournissent une synthèse rapide des preuves PubMed pour orienter votre réflexion, sans la rigueur d\'une revue systématique formelle.',
      },
      {
        heading: 'Les normes de déclaration PRISMA et MOOSE',
        body: 'Les revues systématiques et méta-analyses de haute qualité doivent suivre des normes de déclaration établies :\n\n- **PRISMA** (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) : liste de contrôle à 27 items pour les revues systématiques. Requiert un diagramme de flux montrant la sélection des études.\n- **MOOSE** (Meta-analysis Of Observational Studies in Epidemiology) : pour les méta-analyses d\'études observationnelles.\n- **PRISMA-P** : liste de contrôle pour les protocoles de revues systématiques.\n- **Manuel Cochrane** : le guide le plus complet pour les revues Cochrane.\n\nLa plupart des grandes revues médicales exigent la conformité PRISMA pour la soumission. Le respect de ces normes améliore la transparence et la reproductibilité.',
      },
      {
        heading: 'Comment choisir la bonne approche',
        body: 'Utilisez cet arbre de décision :\n\n1. **Votre question est-elle assez spécifique pour le PICO ?**\n   - Oui → Revue systématique (avec possible méta-analyse)\n   - Non → Revue de portée ou revue narrative\n\n2. **Y a-t-il suffisamment d\'études primaires ?**\n   - < 3 bonnes études → Revue systématique narrative\n   - ≥ 3 études avec PICO similaire → Envisager une méta-analyse\n\n3. **L\'hétérogénéité est-elle acceptable ?**\n   - I² < 50 % → Méta-analyse probablement appropriée\n   - I² > 75 % → Synthèse narrative ; explorer les sources d\'hétérogénéité\n\n4. **Avez-vous suffisamment de temps et de ressources ?**\n   - Une revue systématique complète prend 6-12 mois avec une équipe\n   - Envisagez de commencer par une revue de portée en utilisant des outils comme MetaLens AI',
      },
    ],
  },
};
