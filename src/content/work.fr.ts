import type { CaseStudy } from "./types";

/** Version française des études de cas. Mêmes chiffres, même structure que work.en.ts. */
export const casesFr: CaseStudy[] = [
  {
    slug: "order-book",
    title: "Order Book : un moteur d'appariement, du prototype C++ à la plateforme",
    plain: "Un moteur d'appariement construit deux fois : en C++ pour mesurer sa vitesse, puis en Java 21, qui journalise chaque ordre et survit à un crash.",
    stack: "Prototype C++17 ; Java 21, Spring Boot, QuickFIX/J, FIX 4.4",
    status: "Prototype C++ : mesuré, puis archivé. Moteur Java : phases 0 à 3 terminées, phase 4 en cours, pas de chiffres de performance avant la phase 6.",
    repos: [
      { label: "Order_Book sur GitHub", href: "https://github.com/Ahmed-Berrada/Order_Book" },
      { label: "Prototype C++ (lob-engine, archivé)", href: "https://github.com/Ahmed-Berrada/lob-engine" },
    ],
    updated: "2026-11-27",
    sections: [
      {
        id: "problem",
        blocks: [
          { t: "p", text: "Un moteur d'appariement est le cœur d'une bourse électronique. Il met en correspondance acheteurs et vendeurs qui s'accordent sur un prix, et émet les transactions qui en résultent." },
          {
            t: "p",
            text: "On lui demande trois choses : être déterministe (mêmes entrées, mêmes transactions), équitable (meilleur prix d'abord, puis premier arrivé premier servi) et rapide. Je l'ai construit deux fois. Le prototype C++, lob-engine, cherchait à quelle vitesse un carnet peut apparier, et où passe le temps. Le moteur Java cherche ce dont une plateforme a besoin : la même réponse à la même entrée pour chaque participant, aucun ordre acquitté perdu dans un crash, et une trace qui explique tout après coup. La vitesse compte, mais être juste passe d'abord.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "Un écrivain par carnet. L'ordre d'arrivée définit la priorité : un carnet est séquentiel par nature, et des verrous n'ajouteraient que de la gigue. En Java, chaque instrument a un thread écrivain et une file bornée, et une file pleine refuse l'ordre aussitôt (`OVERLOADED`) au lieu de mettre en attente sans limite.",
              "Des prix entiers, en ticks de 64 bits, dans les deux versions. Les flottants cassent l'égalité.",
              "Le cœur d'appariement Java est du Java pur, sans entrées-sorties. Spring en est banni par le build (maven-enforcer) et par des tests d'architecture (ArchUnit) : ni horloge, ni aléa, ni threads, ni E/S, ni flottants.",
              "Les identifiants d'ordre sont attribués par le moteur, par instrument. Chaque commande reçoit un numéro de séquence sans trou et un horodatage UTC à la microseconde, pris à l'entrée et journalisé. C'est ce qui rend le rejeu exact.",
              "Le prototype C++ prend chaque ordre dans un pool préalloué : un ordre ne coûte aucun malloc. Le chemin critique n'est pas pour autant sans allocation : la table d'identifiants et chaque nouveau niveau de prix allouent un nœud, et un appariement renvoie ses transactions dans un vecteur. Son benchmark utilise une graine fixe, pour pouvoir refaire exactement une exécution.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
          { t: "h", text: "Le cœur de la plateforme, en Java" },
          { t: "figure", id: "order-path" },
          {
            t: "p",
            text: "Chaque commande est ajoutée au journal de l'instrument (trames protégées par CRC, synchronisées sur disque à chaque commande par défaut) puis traitée par le thread écrivain unique. L'appariement renvoie des événements. Les rapports d'exécution, les données de marché et la copie de contrôle (drop copy) sont construits à partir de ces événements, et le même journal sert à la reprise après crash, à l'audit et au rejeu.",
          },
          {
            t: "p",
            text: "Interfaces : entrée d'ordres FIX 4.4 avec une drop copy pour les systèmes de risque, une API REST décrite en OpenAPI, un flux de données de marché de niveau 2 en WebSocket et un flux binaire séquencé avec retransmission.",
          },
          {
            t: "p",
            text: "Volontairement simple d'abord : l'annulation est en O(n) dans un niveau de prix et les côtés du carnet sont des `TreeMap`. Les deux seront mesurés avec JMH avant d'être optimisés.",
          },
          { t: "h", text: "Le prototype, en C++" },
          {
            t: "p",
            text: "Demandes et offres sont deux arbres de prix `std::map`, donc le meilleur prix est à `begin()`. Chaque niveau de prix est une liste doublement chaînée intrusive d'ordres, dans l'ordre d'arrivée, et chaque ordre est pris dans un bloc de pool préalloué : ajouter ou retirer un ordre revient à quelques écritures de pointeurs. Une table de hachage de l'identifiant vers l'ordre donne une annulation en O(1).",
          },
          { t: "figure", id: "lob-structure" },
          {
            t: "table",
            head: ["Opération", "Coût"],
            rows: [
              ["Ajout, sans appariement", "O(log n)"],
              ["Ajout, exécuté au meilleur niveau", "O(1)"],
              ["Ajout, balayage de K niveaux", "O(K + log n)"],
              ["Annulation", "O(1) en moyenne (table de hachage)"],
              ["Meilleure demande ou meilleure offre", "O(1)"],
            ],
            note: "n est le nombre de niveaux de prix actifs.",
          },
        ],
      },
      {
        id: "result",
        blocks: [
          { t: "h", text: "Justesse : le moteur Java" },
          {
            t: "table",
            head: ["Ce qui est vérifié", "Comment"],
            rows: [
              ["Le carnet n'est jamais croisé, la quantité est conservée, identifiants et séquences sans trou, rejeu déterministe", "Tests de propriétés (jqwik)"],
              ["Des flux de commandes aléatoires donnent exactement les événements d'une implémentation de référence volontairement simple", "jqwik avec un oracle naïf"],
              ["Aucune commande acquittée n'est perdue après un crash, et l'état récupéré égale un rejeu complet", "Une seconde JVM tuée avec SIGKILL"],
              ["Quel que soit l'octet où l'on tronque l'un ou l'autre journal, la reprise restitue exactement les commandes complètes", "jqwik sur le journal"],
              ["Un membre FIX peut se connecter, passer des ordres, annuler, interroger un statut et recevoir chaque code de rejet, et la retransmission des messages (resend) fonctionne après une déconnexion", "Initiateurs QuickFIX/J sur socket"],
              ["Un consommateur qui perd un paquet UDP sur cinq reconstruit chaque carnet par la seule retransmission", "Vrais sockets UDP et TCP"],
              ["Le cœur d'appariement n'utilise que le JDK", "ArchUnit"],
              ["Au moins 90 % de couverture de lignes et de branches", "JaCoCo, imposé par `./mvnw verify` en CI"],
            ],
          },
          {
            t: "p",
            text: "La CI est au vert sur main (GitHub Actions exécute `./mvnw verify`). Le dépôt définit aussi un profil de tests de mutation (PIT, avec un seuil de 80 % sur chaque module du moteur). Il est lancé à la demande, pas en CI : je ne cite donc aucun score.",
          },
          {
            t: "p",
            text: "Le moteur Java n'a pas encore de chiffres de performance : les micro-benchmarks JMH et le chemin critique sans allocation sont la phase 6. Tous les chiffres ci-dessous sont ceux du prototype C++ et ne disent rien du code Java.",
          },
          { t: "h", text: "Vitesse : le prototype C++" },
          {
            t: "p",
            text: "Trois séries de chiffres issues du programme de benchmark du prototype (`bench/benchmark.cpp`). La première est celle que son README a d'abord publiée. Les deux autres sont les miennes, obtenues avec le script indiqué à la section Reproduire, sur un HP ProBook 450 G7.",
          },
          { t: "figure", id: "lob-results" },
          { t: "h", text: "Comment lire ces chiffres" },
          {
            t: "p",
            text: "Le benchmark mélange 60 % d'ajouts, 25 % d'annulations et 15 % d'ordres agressifs autour d'un prix milieu (mid), avec la graine 42. Il chronomètre chaque opération avec deux lectures de `std::chrono::high_resolution_clock`. Sur ce portable, cette paire coûte environ 15 ns, mesurés avec une zone chronométrée vide, et n'est pas soustraite.",
          },
          {
            t: "p",
            text: "La zone chronométrée contient aussi les tirages aléatoires de prix et de quantité et la tenue de la liste des identifiants à annuler : chaque chiffre est donc une borne supérieure du temps propre au moteur. Le tirage qui choisit l'action est hors de la zone chronométrée mais dans l'horloge du débit, ce qui explique que le débit soit un peu inférieur à l'inverse de la latence moyenne.",
          },
          {
            t: "p",
            text: "Les limites de ce benchmark. L'horloge est `high_resolution_clock`, qui sous libstdc++ est l'horloge système et n'est pas monotone : `steady_clock` serait le bon outil. Les prix sont tirés sur la même plage de 1 000 ticks des deux côtés, donc beaucoup d'ajouts croisent et s'exécutent aussitôt, et la liste des annulations garde les identifiants d'ordres déjà exécutés, donc certaines annulations sont des recherches qui échouent : la répartition 60/25/15 décrit le tirage, pas le travail effectué. Enfin, il mesure le temps de service d'une opération après l'autre, pas la latence sous un débit d'arrivée donné.",
          },
          { t: "h", text: "Pourquoi 5 et 50 millions d'opérations diffèrent" },
          {
            t: "p",
            text: "Le README annonçait 5 millions d'opérations après un échauffement, mais jusqu'en novembre 2026 le benchmark committé exécutait 50 millions d'opérations, avec l'appel d'échauffement en commentaire. Même moteur, médiane différente : 149 ns à 5 millions d'opérations, 229 ns à 50 millions. Le benchmark exécute désormais la méthode que décrit le README.",
          },
          {
            t: "p",
            text: "La liste des annulations grandit d'environ 0,35 identifiant par opération (60 % d'ajouts moins 25 % d'annulations) : les dernières opérations touchent donc beaucoup plus de mémoire. Je n'ai pas profilé le comportement du cache. C'est mon explication, pas une mesure.",
          },
          { t: "figure", id: "lob-histogram" },
          {
            t: "p",
            text: "La moitié des opérations se terminent en moins de 150 ns et 99 % en moins de 460 ns. Les 0,1 % les plus lentes prennent 900 ns ou plus, jusqu'à un maximum d'environ 1,6 ms.",
          },
          { t: "h", text: "Le pic de 70 ms est un rehash de table de hachage" },
          {
            t: "p",
            text: "Dans l'exécution à 50 millions, la latence maximale va de 68 à 73 ms : 68 ms dans les deux exécutions tracées pour l'expérience ci-dessous, 72 à 73 ms dans les trois exécutions du tableau de résultats. Dans les deux exécutions tracées, elle survient à la même opération, la numéro 26 749 413. Avec une graine fixe, c'est un événement déterministe. À ce moment, la liste du benchmark contient environ 9,4 millions d'identifiants, et le `std::unordered_map` du moteur (identifiant vers ordre) n'est pas pré-dimensionné : un rehash est le suspect évident.",
          },
          {
            t: "p",
            text: "Je l'ai testé sur une copie de travail. Construire la table avec 30 millions de buckets d'emblée ramène le maximum entre 1,1 et 1,4 ms et fait passer le débit de 3,25 à 4,25 millions d'opérations par seconde. Le moteur n'est pas modifié. Le prix à payer est la mémoire : le tableau de buckets représente à lui seul environ 240 Mo.",
          },
          { t: "figure", id: "id-map-probe" },
          { t: "h", text: "Questions ouvertes" },
          {
            t: "p",
            text: "Le README n'a pas noté quelle machine avait produit ses premiers chiffres : je ne peux donc pas savoir si l'écart entre son P99.9 de 5,5 µs et mes 0,9 µs vient du matériel, de la charge ou d'une autre version du code. Mes exécutions ont eu lieu sur un portable avec le gouverneur powersave, sans épinglage de cœur, avec une charge moyenne d'environ 1,2 due à des processus d'arrière-plan. Lancez le script sur votre machine : ces chiffres sont faits pour être vérifiés.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          { t: "p", text: "Le moteur Java :" },
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/Order_Book\ncd Order_Book\n./mvnw verify                          # build, tests et seuils de qualité\n# tests de mutation, lent\n./mvnw -pl engine-core,engine-journal,engine-service,market-data -am -Pmutation verify\n# REST sur :8080, FIX sur :9878\n./mvnw -pl api -am install -DskipTests\n./mvnw -pl api spring-boot:run",
          },
          {
            t: "code",
            text: "curl -s -X POST localhost:8080/api/v1/instruments/AAPL/orders \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"side\":\"SELL\",\"type\":\"LIMIT\",\"price\":\"185.30\",\"quantity\":10}'",
          },
          { t: "p", text: "Le prototype C++ :" },
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/lob-engine\ncd lob-engine\ncmake -S . -B build -DCMAKE_BUILD_TYPE=Release\ncmake --build build -j\n./build/tests    # tests unitaires\n./build/bench    # 5 M d'opérations après 100 K d'échauffement",
          },
          {
            t: "p",
            text: "Pour noter la machine, le compilateur et chaque exécution dans un fichier JSON, utilisez [scripts/bench-lob-engine.sh](https://github.com/Ahmed-Berrada/MyFantasticWebsite/blob/main/scripts/bench-lob-engine.sh) du dépôt de ce site. Il travaille sur une copie et ne touche pas à lob-engine :",
          },
          { t: "code", text: "RUNS=8 scripts/bench-lob-engine.sh              # tel qu'il est dans le dépôt\nMETHOD=50m RUNS=3 scripts/bench-lob-engine.sh   # l'ancienne version à 50 M" },
          { t: "p", text: "Les builds Release utilisent `-O3 -march=native` : les résultats dépendent du processeur." },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "list",
            items: [
              "Phase 4 : prévention de l'auto-appariement, enchères, phases de négociation et coupe-circuits.",
              "Phase 6 : micro-benchmarks JMH, chemin critique sans allocation et latence publiée pour le moteur Java, avec sa méthodologie, sur un cœur isolé, avec l'histogramme complet de chaque exécution.",
              "Reprendre la leçon du prototype : prédimensionner la table d'identifiants du moteur Java, et mesurer le coût en mémoire face au gain de latence.",
            ],
          },
        ],
      },
    ],
  },

  {
    slug: "cbtc-validation",
    title: "Outillage de test d'un logiciel radio CBTC 5G chez Siemens Mobility",
    plain: "Les outils qui testent le logiciel radio critique de la signalisation CBTC du métro de New York (ligne Crosstown) : simulateur, scénarios et banc de test.",
    stack: "Python, pytest, Robot Framework, GitLab CI/CD, QEMU/KVM, network namespaces Linux",
    status: "Siemens Mobility, depuis septembre 2025. Livré pour la version 4.2 du CRG. Outillage interne : aucun code ni détail de protocole n'est publié ici.",
    repos: [],
    updated: "2026-11-27",
    sections: [
      {
        id: "problem",
        blocks: [
          {
            t: "p",
            text: "La passerelle radio que fournit Siemens Mobility, le CRG, échange des messages avec des équipements à bord du train et le long de la voie. Sans ces équipements, il ne peut pas être testé. À mon arrivée, rien n'existait : ni banc de test, ni outil, ni produit sur lequel s'appuyer.",
          },
          {
            t: "p",
            text: "Pour être précis sur ma part : je n'écris pas le logiciel critique. J'ai conçu et développé le simulateur, le CRG Message Generator, et je suis responsable du banc de test ; l'environnement d'exécution autour a été construit avec l'équipe.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "Logiciel de sécurité, développé selon la norme CENELEC EN 50128.",
              "Scrum, en anglais, avec les équipes radio, logiciel embarqué et test en France et en Inde.",
              "Les messages doivent être exacts à l'octet près : trame UDP et somme de contrôle CRC-32/MPEG-2.",
              "Des personnes qui ne programment pas doivent pouvoir écrire et exécuter des scénarios.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
          { t: "figure", id: "cbtc-bench" },
          {
            t: "list",
            items: [
              "Le CRG Message Generator, en Python. Il simule les équipements de bord et de sol (CC, ZC, WRG) et génère des messages radio exacts à l'octet près à partir d'une configuration YAML/XML. Une suite pytest vérifie sa conformité et produit des rapports JUnit-XML.",
              "Une bibliothèque Robot Framework de mots-clés métier : un scénario se lit comme l'exigence qu'il vérifie.",
              "L'environnement d'exécution, construit avec l'équipe : GitLab CI/CD et runners, le CRG virtualisé avec QEMU/KVM dans des network namespaces Linux, et archivage automatique des rapports et des logs. Je suis responsable du banc de test.",
            ],
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            t: "table",
            head: ["Mesure", "Valeur"],
            rows: [
              ["Types de messages pris en charge", "200+"],
              ["Scénarios", "300+"],
              ["Utilisateurs", "9 personnes, dans l'équipe de validation à Châtillon et l'équipe logicielle à Pune : 5 développeurs et 4 non-développeurs formés, qui écrivent et exécutent leurs propres scénarios"],
              ["Livré pour", "la version 4.2 du CRG"],
              ["Pourquoi c'est indispensable", "le CRG ne fonctionne qu'avec les équipements bord et sol ; sur le banc, le simulateur tient ce rôle"],
            ],
          },
          {
            t: "p",
            text: "Je ne peux pas publier de vraies trames ni de code. L'animation de la liaison radio de la [page d'accueil](/) utilise un format de trame illustratif et un vrai CRC-32/MPEG-2, vérifié sur la valeur de test standard `0x0376E6E7`.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          { t: "p", text: "L'outillage est interne : le projet lui-même ne peut pas être reproduit hors de Siemens. La somme de contrôle, si :" },
          {
            t: "code",
            text: "def crc32_mpeg2(data: bytes) -> int:\n    crc = 0xFFFFFFFF\n    for b in data:\n        crc ^= b << 24\n        for _ in range(8):\n            if crc & 0x80000000:\n                crc = ((crc << 1) ^ 0x04C11DB7) & 0xFFFFFFFF\n            else:\n                crc = (crc << 1) & 0xFFFFFFFF\n    return crc\n\nassert crc32_mpeg2(b\"123456789\") == 0x0376E6E7",
          },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "p",
            text: "Je reste responsable du banc de test jusqu'à la fin de l'alternance, en août 2027. À partir de septembre 2027, je cherche un CDI : logiciel critique ou embarqué, outillage de test et de validation, ou systèmes où la performance compte.",
          },
        ],
      },
    ],
  },

  {
    slug: "market-data-pipeline",
    title: "Pipeline de données de marché",
    plain: "Un pipeline qui récupère à intervalles réguliers des prix d'actions et de cryptos, les contrôle et les stocke, et les sert par une API et un tableau de bord.",
    stack: "Python, TimescaleDB, Airflow, Cloud Run, FastAPI, Next.js",
    status: "Déployé sur Cloud Run et Vercel, avec un tableau de bord public. Le débit et la latence de l'API ne sont pas encore mesurés.",
    repos: [
      { label: "Pipeline sur GitHub", href: "https://github.com/Ahmed-Berrada/Market_data_pipeline" },
      { label: "Tableau de bord", href: "https://marketdatapipeline.ahmedberrada.com/" },
    ],
    updated: "2026-11-27",
    sections: [
      {
        id: "problem",
        blocks: [
          {
            t: "p",
            text: "Les prix viennent d'API publiques, à des rythmes différents et avec des trous. Il faut les récupérer à intervalles réguliers, les valider, les stocker pour que les requêtes par plage de temps restent rapides, et les servir à un tableau de bord.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "Des sources publiques gratuites : Yahoo Finance pour des barres d'une minute sur sept actions et fonds (SPY, NVDA, MSFT, SIE.DE, GOOGL, PLTR, URTH) et CoinGecko pour des prix à cinq minutes sur BTC, ETH, SOL et XRP.",
              "Deux environnements : Airflow avec Docker Compose en local, et Cloud Run Jobs avec Cloud Scheduler en production, sans Airflow.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
          {
            t: "p",
            text: "Chaque pipeline suit les quatre mêmes tâches : extraire, transformer, charger, journaliser le succès. Après le chargement, il rafraîchit les agrégats continus de TimescaleDB. L'étape de transformation nettoie et valide les données, et calcule des moyennes mobiles simples sur 20 et 50 périodes ainsi que les rendements quotidiens.",
          },
          {
            t: "table",
            head: ["Couche", "Choix"],
            rows: [
              ["Stockage", "Hypertables TimescaleDB Cloud en chunks de 7 jours, compression après 7 jours (segmentée par symbole), agrégats continus rafraîchis toutes les heures sur une fenêtre de 3 jours"],
              ["Ordonnancement", "DAGs Airflow en local, Cloud Run Jobs et Cloud Scheduler en production"],
              ["API", "FastAPI sur Cloud Run : historique OHLCV, dernier prix, indicateurs, état du pipeline"],
              ["Tableau de bord", "Next.js avec graphiques en chandeliers et en lignes, hébergé sur Vercel"],
            ],
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            t: "p",
            text: "Ce qui existe et peut être inspecté : le [tableau de bord](https://marketdatapipeline.ahmedberrada.com/) et le code. Ce qui n'existe pas encore : une mesure du débit d'ingestion ou de la latence de l'API. J'ajouterais les deux avant de citer le moindre chiffre.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/Market_data_pipeline\ncd Market_data_pipeline\n# renseigner DATABASE_URL et X_CG_DEMO_API_KEY dans .env, comme le décrit le README\npsql \"$DATABASE_URL\" -f db/schema.sql\ndocker compose up -d        # Airflow sur :8080, API sur :8000\npip install -r requirements.txt && python scripts/backfill.py --days 365\ncurl http://localhost:8000/api/stocks/SPY/latest",
          },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "list",
            items: ["Mesurer le débit d'ingestion et la latence de l'API, et publier la méthode avec les chiffres."],
          },
        ],
      },
    ],
  },
];
