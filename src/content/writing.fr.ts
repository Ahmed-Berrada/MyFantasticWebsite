import type { Note } from "./types";

/** Version française des notes. Mêmes chiffres que writing.en.ts. */
export const notesFr: Note[] = [
  {
    slug: "reading-a-latency-tail",
    title: "Lire une queue de latence sans se tromper soi-même",
    summary: "Un maximum de 68 ms dans le benchmark d'un moteur d'appariement s'est révélé être un unique rehash de table de hachage, à la même opération à chaque exécution.",
    date: "2026-11-26",
    minutes: 4,
    blocks: [
      {
        t: "p",
        text: "Le README de lob-engine publie une médiane de 163 ns et un P99.9 de 5 517 ns, soit environ 34 fois la médiane. Un tel rapport est une question, pas une réponse. Voici comment j'ai cherché ce qu'il y avait derrière une queue de latence, et ce que j'ai trouvé.",
      },
      { t: "h", text: "Étape 1 : rendre la mesure répétable" },
      {
        t: "p",
        text: "J'ai écrit un petit script qui recompile le moteur sur une copie de travail, applique la méthode que le README énonce (5 millions d'opérations, 100 000 d'échauffement), l'exécute plusieurs fois et enregistre la machine, le compilateur, la charge et chaque exécution. Sur mon portable, huit exécutions ont donné une médiane de 149 ns, un P99 de 460 ns et un P99.9 de 909 ns. La médiane et le P99 ont varié de moins de 3 % d'une exécution à l'autre, le P99.9 d'environ 8 %.",
      },
      { t: "h", text: "Étape 2 : savoir ce que coûte le chronomètre" },
      {
        t: "p",
        text: "Chaque opération est encadrée par deux lectures d'horloge. J'ai mesuré une zone chronométrée vide : environ 15 ns. C'est 10 % d'une médiane de 149 ns : cela compte pour la médiane, pas du tout pour un pic d'une milliseconde. Je ne l'ai pas soustrait.",
      },
      { t: "h", text: "Étape 3 : trouver le plus grand pic, et où il se situe" },
      {
        t: "p",
        text: "Le benchmark tel que committé exécute 50 millions d'opérations. Sa latence maximale était d'environ 68 ms, et elle est survenue à l'opération 26 749 413 dans les deux exécutions que j'ai tracées. Une graine fixe veut dire que la même opération fait le même travail à chaque fois : un maximum qui tombe toujours sur la même opération n'est pas du bruit. C'est quelque chose que le programme fait.",
      },
      {
        t: "p",
        text: "À cette opération, la liste des identifiants à annuler contenait environ 9,4 millions d'entrées. La table identifiant vers ordre du moteur, un simple `std::unordered_map`, n'avait jamais reçu sa taille cible : elle grandit par rehash, et rehasher des millions d'entrées d'un seul coup prend des dizaines de millisecondes.",
      },
      { t: "h", text: "Étape 4 : changer une chose et mesurer de nouveau" },
      { t: "p", text: "Sur une copie de travail, j'ai construit la table avec 30 millions de buckets. Rien d'autre n'a changé." },
      { t: "figure", id: "id-map-probe" },
      {
        t: "p",
        text: "Le maximum est passé d'environ 68 ms à environ 1 ms, et le débit a augmenté d'environ un tiers. Le maximum n'est pas tombé à zéro : ce qui reste, autour d'une milliseconde, je ne l'ai pas expliqué. Ce pourrait être le système d'exploitation, des défauts de page quand le pool grandit, ou les arbres de prix qui allouent des nœuds. Je profilerais avant de deviner.",
      },
      { t: "h", text: "Ce que j'en retiens" },
      {
        t: "list",
        items: [
          "Un rapport de queue est une question. Demandez où sont les opérations les plus lentes avant de demander comment les accélérer.",
          "Une graine fixe transforme un pic en preuve : un pic à la même opération à chaque exécution vient du programme, pas de la machine.",
          "Changer une seule chose, et garder l'avant et l'après.",
          "Le README ne publie pas le matériel, et le benchmark committé et le README ne sont pas d'accord sur le nombre d'opérations. Je donne les deux et je dis lequel est lequel.",
        ],
      },
      { t: "p", text: "L'étude de cas contient les tableaux complets, l'histogramme et les commandes : [lob-engine](/work/lob-engine)." },
    ],
  },

  {
    slug: "one-writer-per-instrument",
    title: "Un seul écrivain par instrument : le déterminisme d'un carnet d'ordres",
    summary: "Pourquoi chaque instrument a un seul thread, un journal et un numéro de séquence, et ce que cela apporte.",
    date: "2026-11-26",
    minutes: 4,
    blocks: [
      {
        t: "p",
        text: "L'appariement dépend d'un ordre strict. Un achat entrant est apparié aux ventes en attente par meilleur prix, puis par heure d'arrivée. Deux threads qui modifient le même carnet casseraient la priorité temporelle, et pourraient exécuter deux fois la même liquidité.",
      },
      { t: "h", text: "Un écrivain, plusieurs carnets" },
      {
        t: "p",
        text: "Dans Order Book, chaque instrument possède un thread écrivain unique et une file bornée. Les instruments n'interagissent jamais : ils tournent en parallèle sans verrous. C'est le patron de conception « écrivain unique », popularisé par LMAX. Le chemin critique n'a ni verrous ni accès concurrents, et le résultat est déterministe.",
      },
      { t: "h", text: "Journal d'abord, appariement ensuite" },
      {
        t: "p",
        text: "Chaque commande est ajoutée au journal de l'instrument, protégé par CRC et synchronisé sur disque à chaque commande par défaut, avant que le thread écrivain ne la traite. Le moteur est une fonction d'une commande vers une liste d'événements, sans effet de bord caché. La reprise après crash est donc un rejeu du journal, et le même mécanisme sert à l'audit et au débogage.",
      },
      { t: "h", text: "Ce que le déterminisme exige" },
      {
        t: "list",
        items: [
          "Les identifiants d'ordre sont attribués par le moteur, par instrument.",
          "Chaque commande reçoit un numéro de séquence sans trou et un horodatage UTC à la microseconde, pris à l'entrée et journalisé.",
          "Le cœur d'appariement ne peut utiliser que le JDK : ni horloge, ni aléa, ni threads, ni E/S, ni flottants. Un test d'architecture fait échouer le build si cela change.",
        ],
      },
      { t: "h", text: "Comment c'est vérifié" },
      {
        t: "list",
        items: [
          "Tests de propriétés (jqwik) : le carnet n'est jamais croisé, la quantité est conservée, identifiants et séquences sans trou.",
          "Un modèle de référence : des flux de commandes aléatoires doivent donner exactement les événements d'une implémentation volontairement simple.",
          "Un test de crash : une seconde JVM est tuée avec SIGKILL, aucune commande acquittée ne doit être perdue, et l'état récupéré doit égaler un rejeu complet.",
          "Couper l'un ou l'autre journal à n'importe quel octet doit récupérer exactement les commandes complètes.",
        ],
      },
      { t: "h", text: "Ce que ça coûte" },
      {
        t: "p",
        text: "Une file pleine refuse l'ordre aussitôt (`OVERLOADED`) au lieu de grandir sans limite : la surcharge se voit comme un refus explicite, pas comme une latence que personne ne sait expliquer. Et la synchronisation sur disque à chaque commande est un compromis assumé : aucun ordre acquitté n'est perdu, au prix du débit. Je n'ai pas encore mesuré ce prix. Le benchmark JMH est la phase 6 du projet.",
      },
      { t: "p", text: "Code et décisions : [Order Book](/work/order-book)." },
    ],
  },

  {
    slug: "monte-carlo-against-black-scholes",
    title: "Vérifier un pricer Monte Carlo contre la formule fermée",
    summary: "Comment savoir qu'une simulation est juste : la comparer au prix exact et laisser l'intervalle de confiance trancher.",
    date: "2026-11-26",
    minutes: 4,
    blocks: [
      {
        t: "p",
        text: "Un call européen sous mouvement brownien géométrique a un prix exact, Black-Scholes. C'est un bon test pour un pricer Monte Carlo : la simulation doit tomber dans son propre intervalle de confiance autour de la valeur exacte.",
      },
      { t: "h", text: "La vérification" },
      {
        t: "p",
        text: "L'estimateur tire une loi normale standard avec Box-Muller, construit le prix final, actualise le paiement, et donne la moyenne avec un intervalle de confiance à 95 % (1,96 fois l'erreur standard). Avec les variables antithétiques, chaque tirage Z est associé à −Z, et la paire compte pour un échantillon.",
      },
      {
        t: "p",
        text: "Le test fixe la graine, simule 200 000 paires et vérifie que l'écart avec Black-Scholes est inférieur à l'intervalle. Avec une graine fixe, c'est un test déterministe, pas un test statistique instable.",
      },
      { t: "h", text: "À quoi ressemblent les chiffres" },
      {
        t: "table",
        head: ["Trajectoires", "Estimation antithétique", "Écart au prix exact", "Estimation simple"],
        rows: [
          ["1 000", "10,5497 ± 0,6701", "0,0991", "10,6890 ± 0,9589"],
          ["10 000", "10,5729 ± 0,2075", "0,1224", "10,2339 ± 0,2898"],
          ["100 000", "10,4987 ± 0,0651", "0,0482", "10,4768 ± 0,0915"],
          ["1 000 000", "10,4701 ± 0,0204", "0,0195", "10,4625 ± 0,0289"],
        ],
        note: "Prix exact 10,4506 (S₀ 100, K 100, r 5 %, σ 20 %, 1 an). Graine 7, même générateur aléatoire que la démo de ce site.",
      },
      {
        t: "p",
        text: "Deux choses à observer. Chaque multiplication par dix du nombre de trajectoires resserre l'intervalle d'environ la racine de dix : c'est ainsi que converge Monte Carlo. Et à nombre de trajectoires égal, les variables antithétiques donnent un intervalle environ 30 % plus étroit que l'échantillonnage simple.",
      },
      {
        t: "p",
        text: "L'écart au prix exact à un million de trajectoires, 0,0195, est dans l'intervalle de ±0,0204, comme cela doit arriver environ 95 % du temps. Un résultat hors de l'intervalle, exécution après exécution, signalerait un bogue.",
      },
      { t: "h", text: "Les chiffres GPU" },
      {
        t: "p",
        text: "Le pricer GPU du dépôt Monte-Carlo-Option-Pricing est un notebook. Dans mes exécutions, la même simulation a pris 295 s en Python pur, 7,4 s avec NumPy vectorisé et 0,46 s sur GPU avec CuPy. Soit 641 fois plus rapide que Python pur et 16 fois plus rapide que NumPy. Le « 100 à 1 000 fois » du README est une affirmation générale face à du code CPU mono-thread, pas une mesure de ce notebook.",
      },
      {
        t: "p",
        text: "Le notebook n'enregistre ni le modèle de GPU ni le nombre de trajectoires : considérez l'accélération comme indicative tant qu'un script de benchmark ne les enregistre pas. La simulation de la démo de la page d'accueil utilise le même estimateur en TypeScript, et le test ci-dessus fait partie de la suite de tests de ce site.",
      },
    ],
  },
];
