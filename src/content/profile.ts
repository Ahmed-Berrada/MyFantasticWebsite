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
  headline: "Software engineer, critical systems and performance",
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
    role: "Software Engineer (apprenticeship)",
    org: "Siemens Mobility, CBTC rail signalling",
    place: "Châtillon, France",
    points: [
      "5G radio CBTC modernisation of the Crosstown line of the New York City subway (MTA). Safety-critical software (CENELEC EN 50128); Scrum, in English, with the radio, embedded software and test teams (France and India).",
      "Designed and built in Python the CRG Message Generator: it simulates onboard and wayside equipment (CC, ZC, WRG) and generates byte-exact radio messages (UDP framing, CRC-32/MPEG-2) from YAML/XML configuration. 200+ message types, 300+ scenarios, conformance checked by a pytest suite. Delivered for CRG 4.2.",
      "Robot Framework library with business-level keywords, used by 9 validators (5 developers, 4 trained non-developers) who write and run their own scenarios.",
      "Built with the team, from scratch, the execution environment: GitLab CI/CD and runners, CRG virtualised with QEMU/KVM and Linux network namespaces, automatic archiving of reports and logs. Test bench owner.",
    ],
    tags: ["Python", "pytest", "Robot Framework", "GitLab CI/CD", "QEMU/KVM", "Linux netns", "EN 50128"],
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
  degree: "Engineering degree (Master's level), Computer Science, Artificial Intelligence track",
  period: "2022 – 2027",
  coursework: "Mathematics (probability, statistics, optimisation), algorithms, software development, architecture.",
};

export const stack: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["C++", "Java", "Python", "SQL", "Bash"] },
  { group: "Critical systems", items: ["Simulation and stimulation tools", "pytest, Robot Framework", "Byte-level protocols (UDP, CRC)", "CENELEC EN 50128 context"] },
  { group: "Correctness", items: ["Property-based tests (jqwik)", "Mutation testing (PIT)", "ArchUnit, JUnit 5, JaCoCo", "Deterministic replay"] },
  { group: "Performance", items: ["No allocation on the hot path", "Pool allocators, intrusive lists", "Single-writer threading (LMAX)", "CUDA (Numba, CuPy)"] },
  { group: "Infrastructure", items: ["Linux, Git", "GitLab CI/CD, GitHub Actions", "Docker, QEMU/KVM", "Spring Boot, AWS"] },
  { group: "Markets and data", items: ["Order books and matching", "FIX 4.4 (QuickFIX/J)", "Option pricing, Monte Carlo", "NumPy, Pandas, scikit-learn, PyTorch"] },
];
