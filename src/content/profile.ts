/**
 * Single source of truth for the site's copy.
 * Positions mirror the CV in the career-data repo (LinkedIn cannot be fetched automatically).
 */

export interface Link {
  label: string;
  href: string;
}

export interface Position {
  period: string;
  role: string;
  org: string;
  place: string;
  points: string[];
  tags?: string[];
}

export interface SideRole {
  period: string;
  role: string;
  org: string;
  note: string;
}

export const profile = {
  name: "Ahmed Berrada",
  headline: "Software engineer for critical and low-latency systems",
  availability: "Looking for a permanent full-time role from September 2027, in Paris",
  email: "ahmed.berrada@proton.me",
  links: {
    github: { label: "GitHub", href: "https://github.com/Ahmed-Berrada" },
    linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/ahmed-berrada-293015257/" },
  },
} as const;

export const positions: Position[] = [
  {
    period: "Sep 2025 – Aug 2027",
    role: "Software Engineer, Simulation & Tooling (apprenticeship)",
    org: "Siemens Mobility, CBTC rail signalling",
    place: "Châtillon, France",
    points: [
      "New York City Transit Crosstown line modernisation, Siemens Mobility's first 5G CBTC radio solution. On the team from the very first release.",
      "Designed and built in Python the CRG Message Generator: it simulates onboard and wayside equipment (CC, ZC, WRG) and injects radio messages into the CRG software. The CRG cannot be tested without it.",
      "Built a Robot Framework automation layer that runs the full campaign (about 200 scenarios, one requirement each) and lets non-developer engineers write their own scenarios.",
      "Built the infrastructure from scratch: GitLab CI/CD and runners, automatic archiving of reports and logs, CRG virtualisation with QEMU/KVM and Linux network namespaces. Test bench owner.",
      "Delivered for CRG release 4.2 and adopted by the team. Safety-critical context (CENELEC EN 50128), Scrum, daily work in English with the development team in India.",
    ],
    tags: ["Python", "Robot Framework", "GitLab CI", "QEMU/KVM", "Linux netns", "EN 50128"],
  },
  {
    period: "Summer 2024",
    role: "Cloud & Network Intern",
    org: "Maroc Telecom",
    place: "Morocco",
    points: ["Network and cloud infrastructure projects, from design to deployment."],
  },
  {
    period: "2023",
    role: "Network Intern",
    org: "Axeli",
    place: "Morocco",
    points: ["Network setup, monitoring and day-to-day operations."],
  },
];

export const sideRoles: SideRole[] = [
  {
    period: "Since Sep 2026",
    role: "Co-founder",
    org: "Google Developer Group on Campus ESIEA",
    note: "AI workshops; co-organising a Finance × AI hackathon with GDG EPITA.",
  },
  {
    period: "Since 2024",
    role: "Student Ambassador",
    org: "ESIEA",
    note: "Representing the school to prospective students.",
  },
  {
    period: "2026",
    role: "Participant",
    org: "Junction Hackathon",
    note: "Espoo, Finland.",
  },
];

export const education = {
  school: "ESIEA, Graduate School of Engineering",
  degree: "Master of Engineering (Diplôme d'Ingénieur), Computer Science, AI major",
  period: "Expected 2027",
  coursework: "Algorithms, machine learning, probability & statistics, distributed systems, cloud, C++.",
  reading: ["Shreve, Stochastic Calculus for Finance", "Hull, Options, Futures and Other Derivatives", "Joshi, C++ Design Patterns and Derivatives Pricing"],
};

export const stack: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["C++17", "Java 21", "Python", "SQL", "Bash"] },
  { group: "Critical systems", items: ["Requirements-based testing", "Simulation and stimulation tools", "Robot Framework", "CENELEC EN 50128 context"] },
  { group: "Correctness", items: ["Property-based tests (jqwik)", "Mutation testing (PIT)", "ArchUnit, JUnit 5", "Deterministic replay"] },
  { group: "Performance", items: ["Pool allocators, intrusive lists", "Single-writer threading (LMAX)", "JMH benchmarks", "Numba CUDA, CuPy"] },
  { group: "Infrastructure", items: ["Linux, network namespaces", "QEMU/KVM", "GitLab CI, GitHub Actions", "Docker"] },
  { group: "Markets and data", items: ["Order books and matching", "FIX 4.4 (QuickFIX/J)", "Monte Carlo pricing", "NumPy, Polars, PostgreSQL, Spark"] },
];
