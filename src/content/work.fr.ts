import type { CaseStudy } from "./types";

/** Version française des études de cas. Mêmes chiffres, même structure que work.en.ts. */
export const casesFr: CaseStudy[] = [
  {
    slug: "lob-engine",
    title: "lob-engine, un moteur d'appariement en C++17",
    plain: "Un moteur d'appariement écrit pour savoir à quelle vitesse peut aller un carnet d'ordres, et où passe le temps.",
    stack: "C++17, CMake, un seul thread",
    status: "Mesuré, avec deux reproductions sur un même portable. Le README n'enregistre pas le matériel derrière ses propres chiffres.",
    repos: [{ label: "lob-engine sur GitHub", href: "https://github.com/Ahmed-Berrada/lob-engine" }],
    updated: "2026-11-26",
    sections: [
      {
        id: "problem",
        blocks: [
          { t: "p", text: "Un moteur d'appariement est le cœur d'une bourse électronique. Il met en correspondance acheteurs et vendeurs qui s'accordent sur un prix, et émet les transactions qui en résultent." },
          {
            t: "p",
            text: "On lui demande trois choses : être déterministe (mêmes entrées, mêmes transactions), équitable (meilleur prix d'abord, puis premier arrivé premier servi) et rapide. Ce projet porte sur la troisième, mesurée honnêtement.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "Un thread par carnet. L'ordre d'arrivée définit la priorité : un carnet est séquentiel par nature, et des verrous n'ajouteraient que de la gigue.",
              "Des prix entiers, en ticks de 64 bits (un tick vaut 0,01 EUR). Les flottants cassent l'égalité.",
              "Aucune allocation par ordre sur le chemin critique.",
              "Un générateur aléatoire à graine fixe, pour pouvoir refaire exactement une exécution.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
          {
            t: "p",
            text: "Demandes et offres sont deux arbres de prix `std::map`, donc le meilleur prix est à `begin()`. Chaque niveau de prix est une liste doublement chaînée intrusive d'ordres, dans l'ordre d'arrivée, et chaque ordre est pris dans un bloc de pool pré-alloué : ajouter ou retirer un ordre revient à quelques écritures de pointeurs. Une table de hachage de l'identifiant vers l'ordre donne une annulation en O(1).",
          },
          { t: "figure", id: "lob-structure" },
          {
            t: "table",
            head: ["Opération", "Coût"],
            rows: [
              ["Ajout, sans appariement", "O(log n)"],
              ["Ajout, appariement au meilleur niveau", "O(1)"],
              ["Ajout, balayage de K niveaux", "O(K + log n)"],
              ["Annulation", "O(1)"],
              ["Meilleure demande ou meilleure offre", "O(1)"],
            ],
            note: "n est le nombre de niveaux de prix actifs.",
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            t: "p",
            text: "Trois séries de chiffres issues du même programme de benchmark (`bench/benchmark.cpp`). La première est celle que publie le README. Les deux autres sont les miennes, obtenues avec le script indiqué à la section Reproduire, sur un HP ProBook 450 G7.",
          },
          { t: "figure", id: "lob-results" },
          { t: "h", text: "Comment lire ces chiffres" },
          {
            t: "p",
            text: "Le benchmark mélange 60 % d'ajouts, 25 % d'annulations et 15 % d'ordres agressifs autour d'un prix médian, avec la graine 42. Il chronomètre chaque opération avec deux lectures de `std::chrono::high_resolution_clock`. Sur ce portable, cette paire coûte environ 15 ns, mesurés avec une zone chronométrée vide, et n'est pas soustraite.",
          },
          {
            t: "p",
            text: "La zone chronométrée contient aussi les tirages aléatoires de prix et de quantité et la tenue de la liste des identifiants à annuler : chaque chiffre est donc une borne supérieure du temps propre au moteur. Le tirage qui choisit l'action est hors de la zone chronométrée mais dans l'horloge du débit, ce qui explique que le débit soit un peu inférieur à un sur la moyenne.",
          },
          { t: "h", text: "Même code, réponses différentes" },
          {
            t: "p",
            text: "Le README annonce 5 millions d'opérations après un échauffement. Le benchmark committé exécute 50 millions d'opérations, avec l'appel d'échauffement en commentaire. Même moteur, médiane différente : 149 ns à 5 millions d'opérations, 229 ns à 50 millions.",
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
          { t: "h", text: "Le pic de 68 ms est un rehash de table de hachage" },
          {
            t: "p",
            text: "Dans l'exécution à 50 millions, la latence maximale est d'environ 68 ms, et elle survient à la même opération, la numéro 26 749 413, dans les deux exécutions que j'ai tracées. Avec une graine fixe, c'est un événement déterministe. À ce moment, la liste du benchmark contient environ 9,4 millions d'identifiants, et le `std::unordered_map` du moteur (identifiant vers ordre) n'est pas pré-dimensionné : un rehash est le suspect évident.",
          },
          {
            t: "p",
            text: "Je l'ai testé sur une copie de travail. Construire la table avec 30 millions de buckets d'emblée ramène le maximum à 1,1 à 1,4 ms et fait passer le débit de 3,25 à 4,25 millions d'opérations par seconde. Le dépôt n'est pas modifié. Le prix à payer est la mémoire : le tableau de buckets représente à lui seul environ 240 Mo.",
          },
          { t: "figure", id: "id-map-probe" },
          { t: "h", text: "Ce que je ne peux pas dire" },
          {
            t: "p",
            text: "Le README ne dit pas quelle machine a produit ses chiffres : je ne peux donc pas savoir si l'écart entre son P99.9 de 5,5 µs et mes 0,9 µs vient du matériel, de la charge ou d'une autre version du code. Mes exécutions ont eu lieu sur un portable en gouverneur powersave, sans épinglage de cœur, avec une charge moyenne d'environ 1,2 due à des processus d'arrière-plan. Lancez le script sur votre machine : ces chiffres sont faits pour être vérifiés.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          { t: "p", text: "Le benchmark tel que committé :" },
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/lob-engine && cd lob-engine\ncmake -S . -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j\n./build/tests    # tests unitaires\n./build/bench    # 50 M d'opérations, sans échauffement",
          },
          {
            t: "p",
            text: "Pour la méthode du README (5 millions d'opérations après 100 000 d'échauffement), avec la machine, le compilateur et chaque exécution écrits dans un fichier JSON, utilisez [scripts/bench-lob-engine.sh](https://github.com/Ahmed-Berrada/MyFantasticWebsite/blob/main/scripts/bench-lob-engine.sh) du dépôt de ce site. Il travaille sur une copie et ne touche pas à lob-engine :",
          },
          { t: "code", text: "RUNS=5 scripts/bench-lob-engine.sh                     # méthode du README\nMETHOD=committed RUNS=3 scripts/bench-lob-engine.sh    # tel que committé" },
          { t: "p", text: "Les builds Release utilisent `-O3 -march=native` : les résultats dépendent du processeur." },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "list",
            items: [
              "Épingler le benchmark sur un cœur isolé et publier un histogramme complet à chaque exécution.",
              "Pré-dimensionner la table d'identifiants dans le moteur et mesurer le coût en mémoire face au gain de latence.",
              "Les points de latence déjà prévus dans la feuille de route du README : épinglage CPU, huge pages, un template sur le côté pour supprimer des branches, files lock-free à un producteur entre l'entrée, le moteur et la sortie, et préchargement.",
              "Exécuter les tests sous les sanitizers d'adresses et de comportements indéfinis, avec une cible de fuzzing, en CI.",
            ],
          },
        ],
      },
    ],
  },

  {
    slug: "order-book",
    title: "Order Book, le cœur d'une plateforme de négociation en Java 21",
    plain: "Le cœur d'une plateforme de négociation : il reçoit des ordres en FIX ou en REST, écrit chacun dans un journal avant de l'apparier, et peut reconstruire son état exact après un crash.",
    stack: "Java 21, Spring Boot, QuickFIX/J, FIX 4.4",
    status: "Phases 0 à 3 terminées (cœur, durabilité, connectivité). Phase 4, fonctions de plateforme, en cours. Pas encore de chiffres de performance : le benchmark JMH est la phase 6.",
    repos: [{ label: "Order_Book sur GitHub", href: "https://github.com/Ahmed-Berrada/Order_Book" }],
    updated: "2026-11-26",
    sections: [
      {
        id: "problem",
        blocks: [
          {
            t: "p",
            text: "Une plateforme doit donner à chaque participant la même réponse à la même entrée, survivre à un crash sans perdre un ordre acquitté, et pouvoir être expliquée après coup. La vitesse vient ensuite. D'abord, être juste.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "Le cœur d'appariement est du Java pur, sans entrées-sorties. Spring en est banni par le build (maven-enforcer) et par des tests d'architecture (ArchUnit) : ni horloge, ni aléa, ni threads, ni E/S, ni flottants.",
              "Un thread écrivain et une file bornée par instrument. Une file pleine refuse l'ordre aussitôt (`OVERLOADED`) au lieu de mettre en attente sans limite.",
              "Les prix sont des ticks `long` et les identifiants d'ordre sont attribués par le moteur, par instrument. Chaque commande reçoit un numéro de séquence sans trou et un horodatage UTC à la microseconde, pris à l'entrée et journalisé. C'est ce qui rend le rejeu exact.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
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
        ],
      },
      {
        id: "result",
        blocks: [
          { t: "p", text: "Ce projet porte sur la correction : les preuves sont des tests et des seuils, pas de la vitesse." },
          {
            t: "table",
            head: ["Ce qui est vérifié", "Comment"],
            rows: [
              ["Le carnet n'est jamais croisé, la quantité est conservée, identifiants et séquences sans trou, rejeu déterministe", "Tests de propriétés (jqwik)"],
              ["Des flux de commandes aléatoires donnent exactement les événements d'une implémentation de référence volontairement simple", "jqwik avec un oracle naïf"],
              ["Aucune commande acquittée n'est perdue après un crash, et l'état récupéré égale un rejeu complet", "Une seconde JVM tuée avec SIGKILL"],
              ["Couper l'un ou l'autre journal à n'importe quel octet récupère exactement les commandes complètes", "jqwik sur le journal"],
              ["Un membre FIX peut se connecter, négocier, annuler, interroger un statut et recevoir chaque code de rejet, et la reprise fonctionne après une déconnexion", "Initiateurs QuickFIX/J sur socket"],
              ["Un consommateur qui perd un paquet UDP sur cinq reconstruit chaque carnet par la seule retransmission", "Vrais sockets UDP et TCP"],
              ["Le cœur d'appariement n'utilise que le JDK", "ArchUnit"],
              ["Au moins 90 % de couverture de lignes et de branches", "JaCoCo, imposé par `./mvnw verify` en CI"],
            ],
          },
          {
            t: "p",
            text: "La CI est au vert sur main (GitHub Actions exécute `./mvnw verify`). Le dépôt définit aussi un profil de tests de mutation (PIT, avec un seuil de 80 % sur chaque module du moteur). Il est lancé à la demande, pas en CI : je ne cite donc aucun score.",
          },
          { t: "p", text: "Performance : rien de publié pour l'instant. Les micro-benchmarks JMH et le chemin critique sans allocation sont la phase 6. Pour le travail sur la latence, voir [lob-engine](/work/lob-engine)." },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/Order_Book && cd Order_Book\n./mvnw verify                          # build, tests et seuils de qualité\n./mvnw -pl engine-core,engine-journal,engine-service,market-data -am -Pmutation verify   # tests de mutation, lent\n./mvnw -pl api -am install -DskipTests && ./mvnw -pl api spring-boot:run   # REST sur :8080, FIX sur :9878",
          },
          {
            t: "code",
            text: "curl -s -X POST localhost:8080/api/v1/instruments/AAPL/orders \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"side\":\"SELL\",\"type\":\"LIMIT\",\"price\":\"185.30\",\"quantity\":10}'",
          },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "list",
            items: [
              "Phase 4 : prévention de l'auto-appariement, enchères, phases de négociation et coupe-circuits.",
              "Phase 6 : micro-benchmarks JMH, chemin critique sans allocation et latence publiée avec sa méthodologie.",
            ],
          },
        ],
      },
    ],
  },

  {
    slug: "cbtc-validation",
    title: "Outillage de test d'un système de signalisation radio 5G",
    plain: "Les outils avec lesquels est testé le logiciel radio de la signalisation de la ligne Crosstown du métro de New York : un simulateur des équipements du train et de la voie, une bibliothèque de scénarios et un banc de test.",
    stack: "Python, pytest, Robot Framework, GitLab CI/CD, QEMU/KVM, network namespaces Linux",
    status: "Siemens Mobility, depuis septembre 2025. Livré pour la version 4.2 du CRG. Outillage interne : aucun code ni détail de protocole n'est publié ici.",
    repos: [],
    updated: "2026-11-26",
    sections: [
      {
        id: "problem",
        blocks: [
          {
            t: "p",
            text: "Le logiciel radio, appelé CRG, échange des messages avec des équipements à bord du train et le long de la voie. Sans ces équipements, il ne peut pas être testé. À mon arrivée, il n'y avait ni banc de test, ni outil, ni produit dont partir.",
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
              "Les messages doivent être exacts à l'octet : trame UDP et somme de contrôle CRC-32/MPEG-2.",
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
              "Le CRG Message Generator, en Python. Il simule les équipements de bord et de sol (CC, ZC, WRG) et génère des messages radio exacts à l'octet à partir d'une configuration YAML/XML. Une suite pytest vérifie sa conformité et produit des rapports JUnit-XML.",
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
              ["Utilisateurs", "9 validateurs : 5 développeurs et 4 non-développeurs formés, qui écrivent et exécutent leurs propres scénarios"],
              ["Livré pour", "la version 4.2 du CRG"],
              ["Sans cet outil", "le logiciel ne peut pas être testé"],
            ],
          },
          {
            t: "p",
            text: "Je ne peux pas publier de vraies trames ni de code. La scène radio de la [page d'accueil](/) utilise un format de trame illustratif et un vrai CRC-32/MPEG-2, vérifié sur la valeur de test standard `0x0376E6E7`.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          { t: "p", text: "L'outillage est interne : le projet lui-même ne peut pas être reproduit hors de Siemens. La somme de contrôle, si :" },
          {
            t: "code",
            text: "def crc32_mpeg2(data: bytes) -> int:\n    crc = 0xFFFFFFFF\n    for b in data:\n        crc ^= b << 24\n        for _ in range(8):\n            crc = ((crc << 1) ^ 0x04C11DB7) & 0xFFFFFFFF if crc & 0x80000000 else (crc << 1) & 0xFFFFFFFF\n    return crc\n\nassert crc32_mpeg2(b\"123456789\") == 0x0376E6E7",
          },
        ],
      },
      { id: "next", blocks: [{ t: "p", text: "L'alternance dure jusqu'en août 2027." }] },
    ],
  },

  {
    slug: "market-data-pipeline",
    title: "Pipeline de données de marché",
    plain: "Un pipeline qui récupère à intervalles réguliers des prix d'actions et de cryptos, les contrôle et les stocke, et les sert par une API et un tableau de bord en direct.",
    stack: "Python, TimescaleDB, Airflow, Cloud Run, FastAPI, Next.js",
    status: "En fonctionnement, avec un tableau de bord public. Le débit et la latence de l'API ne sont pas encore mesurés.",
    repos: [
      { label: "Pipeline sur GitHub", href: "https://github.com/Ahmed-Berrada/Market_data_pipeline" },
      { label: "Tableau de bord en direct", href: "https://marketdatapipeline.ahmedberrada.com/" },
    ],
    updated: "2026-11-26",
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
            text: "Chaque pipeline suit les mêmes quatre tâches : extraire, transformer, charger, journaliser le succès. Après le chargement, il rafraîchit les agrégats continus de TimescaleDB. L'étape de transformation nettoie et valide les données, et calcule des moyennes mobiles simples sur 20 et 50 périodes ainsi que les rendements quotidiens.",
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
            text: "Ce qui existe et peut être inspecté : le [tableau de bord en direct](https://marketdatapipeline.ahmedberrada.com/), la documentation de l'API sur `/docs` et le code. Ce qui n'existe pas encore : une mesure du débit d'ingestion ou de la latence de l'API. J'ajouterais les deux avant de citer le moindre chiffre.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/Market_data_pipeline && cd Market_data_pipeline\n# renseigner DATABASE_URL et X_CG_DEMO_API_KEY dans .env, comme le décrit le README\npsql \"$DATABASE_URL\" -f db/schema.sql\ndocker compose up -d        # Airflow sur :8080, API sur :8000\npip install -r requirements.txt && python scripts/backfill.py --days 365\ncurl http://localhost:8000/api/stocks/SPY/latest",
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
