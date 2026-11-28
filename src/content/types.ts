export type Lang = "en" | "fr";

export type FigureId =
  | "lob-structure"
  | "lob-results"
  | "lob-histogram"
  | "id-map-probe"
  | "order-path"
  | "cbtc-bench"
  | "radio-link"
  | "order-book-demo"
  | "mc-lab"
  | "mc-speedup";

/**
 * A block of article content. Text supports `code` spans and [label](href) links;
 * internal hrefs ("/work/x") are localised by the renderer.
 */
export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "list"; items: string[] }
  | { t: "code"; text: string }
  | { t: "table"; head: string[]; rows: string[][]; note?: string }
  | { t: "figure"; id: FigureId };

export type CaseSectionId = "problem" | "constraints" | "approach" | "result" | "reproduce" | "next";

export interface CaseStudy {
  slug: string;
  title: string;
  /** One sentence a non-specialist can read. */
  plain: string;
  stack: string;
  status: string;
  repos: { label: string; href: string }[];
  /** ISO date of the last substantive edit. */
  updated: string;
  sections: { id: CaseSectionId; blocks: Block[] }[];
}

export interface Note {
  slug: string;
  title: string;
  summary: string;
  /** ISO date. */
  date: string;
  minutes: number;
  blocks: Block[];
}
