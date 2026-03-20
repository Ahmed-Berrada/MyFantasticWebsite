"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  Terminal,
  Cpu,
  TrendingDown,
  Zap,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  ChevronRight,
  Circle,
  ArrowUpRight,
  Database,
  Brain,
  BarChart3,
} from "lucide-react";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const varData = Array.from({ length: 60 }, (_, i) => {
  const base = 100;
  const noise = Math.sin(i * 0.4) * 12 + Math.cos(i * 0.15) * 8;
  const trend = i * 0.05;
  const spike = i === 38 ? -28 : i === 39 ? -22 : i === 52 ? -18 : 0;
  return {
    day: i + 1,
    pnl: parseFloat((base + noise - trend + spike + (Math.random() - 0.5) * 4).toFixed(2)),
    var95: parseFloat((base - 14 + Math.sin(i * 0.1) * 2).toFixed(2)),
  };
});

const STACK = [
  { label: "Python", color: "#3b82f6" },
  { label: "PyTorch", color: "#f97316" },
  { label: "C++", color: "#8b5cf6" },
  { label: "SQL", color: "#06b6d4" },
  { label: "React", color: "#38bdf8" },
  { label: "AWS", color: "#f59e0b" },
  { label: "Next.js", color: "#e2e8f0" },
  { label: "Docker", color: "#0ea5e9" },
];

const TIMELINE = [
  {
    year: "2025 — Present",
    role: "Quantitative Research Intern",
    org: "Citadel Securities",
    desc: "Developing high-frequency signal generation models in C++ and Python. Reduced signal latency by 23% via lock-free queue architecture.",
    type: "work",
  },
  {
    year: "2024",
    role: "Machine Learning Intern",
    org: "Two Sigma",
    desc: "Built NLP pipelines to extract alpha signals from earnings call transcripts using fine-tuned LLMs. Achieved 0.71 Sharpe on paper portfolio.",
    type: "work",
  },
  {
    year: "2023 — 2027",
    role: "B.Eng. Electrical & Computer Engineering",
    org: "McGill University",
    desc: "Specialization: AI Systems & Computational Finance. GPA 3.9/4.0. Dean's Honours List.",
    type: "edu",
  },
  {
    year: "2023",
    role: "Teaching Assistant — Algorithms & Data Structures",
    org: "McGill University",
    desc: "Led weekly lab sessions for 120 students. Developed automated grading scripts reducing TA overhead by 60%.",
    type: "work",
  },
];

// ─────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
      <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold tracking-wider uppercase border"
          style={{
            color,
            borderColor: color + "44",
            backgroundColor: color + "11",
          }}
      >
      <Circle size={5} fill={color} color={color} />
        {label}
    </span>
  );
}

function GlowCard({
                    children,
                    className = "",
                    glowColor = "#10b981",
                  }: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
      <div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a1628]/60 backdrop-blur-sm transition-all duration-300 ${
              hovered ? "border-white/[0.12] shadow-lg" : ""
          } ${className}`}
          style={
            hovered
                ? {
                  boxShadow: `0 0 40px -10px ${glowColor}33`,
                  borderColor: glowColor + "33",
                }
                : {}
          }
      >
        {hovered && (
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, ${glowColor}0d, transparent 70%)`,
                }}
            />
        )}
        {children}
      </div>
  );
}

// ─────────────────────────────────────────────
// TERMINAL COMPONENT (RAG)
// ─────────────────────────────────────────────

const RAG_LINES = [
  { delay: 0, text: "$ rag-analyst --source NVDA-10K-2024.pdf", color: "#94a3b8" },
  { delay: 600, text: "> Indexing 142 pages into vector store...", color: "#64748b" },
  { delay: 1400, text: "> Embedding model: text-embedding-3-large", color: "#64748b" },
  { delay: 2000, text: "> Query: 'What are the primary risk factors?'", color: "#a5f3fc" },
  { delay: 2800, text: "> Retrieved 6 relevant chunks (cosine > 0.82)", color: "#64748b" },
  { delay: 3600, text: "✓ ANSWER:", color: "#10b981" },
  {
    delay: 4000,
    text: "  Primary risks include supply chain concentration",
    color: "#e2e8f0",
  },
  { delay: 4200, text: "  in TSMC (>80% advanced node capacity) and", color: "#e2e8f0" },
  { delay: 4400, text: "  geopolitical exposure in Taiwan Strait.", color: "#e2e8f0" },
  { delay: 4800, text: "> Source: pp. 23, 47, 89 · Confidence: 0.94", color: "#6366f1" },
];

function RagTerminal() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    if (running) return;
    setRunning(true);
    setVisibleLines([]);
    RAG_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
        if (i === RAG_LINES.length - 1) setRunning(false);
      }, line.delay);
    });
  }, [running]);

  useEffect(() => {
    const t = setTimeout(run, 600);
    return () => clearTimeout(t);
  }, []);

  return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 text-[11px] text-slate-500 font-mono">rag-analyst v1.4.0</span>
          </div>
          <button
              onClick={run}
              disabled={running}
              className="text-[10px] font-mono text-emerald-400/70 hover:text-emerald-400 border border-emerald-400/20 hover:border-emerald-400/50 px-2 py-0.5 rounded transition-all"
          >
            {running ? "running..." : "▶ re-run"}
          </button>
        </div>
        <div className="flex-1 font-mono text-[11px] space-y-0.5 overflow-hidden">
          {RAG_LINES.map((line, i) => (
              <div
                  key={i}
                  className="transition-all duration-200"
                  style={{
                    color: line.color,
                    opacity: visibleLines.includes(i) ? 1 : 0,
                    transform: visibleLines.includes(i) ? "translateY(0)" : "translateY(4px)",
                  }}
              >
                {line.text}
              </div>
          ))}
        </div>
      </div>
  );
}

// ─────────────────────────────────────────────
// VaR CHART
// ─────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
        <div className="bg-[#0d1f35] border border-white/10 rounded-lg p-3 text-[11px] font-mono shadow-xl">
          <p className="text-slate-400 mb-1">Day {label}</p>
          <p style={{ color: "#10b981" }}>P&L: {payload[0]?.value}</p>
          <p style={{ color: "#f43f5e" }}>VaR 95%: {payload[1]?.value}</p>
        </div>
    );
  }
  return null;
};

function VarChart() {
  return (
      <div className="h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              Value at Risk Model
            </p>
            <div className="text-xs font-mono text-slate-300 bg-slate-800/60 border border-slate-700/50 rounded px-3 py-1.5 leading-relaxed">
              <span className="text-indigo-400">VaR</span>
              <sub className="text-slate-400 text-[9px]">α</sub>
              <span className="text-slate-400"> = inf</span>
              <span className="text-slate-300">&#123;l ∈ ℝ : P(L &gt; l) ≤ 1−α&#125;</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-rose-400">BREACH</p>
            <p className="text-lg font-mono font-bold text-rose-400">2×</p>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={varData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis
                  dataKey="day"
                  tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
              />
              <YAxis
                  tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={100} stroke="#334155" strokeDasharray="4 4" />
              <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: "#10b981" }}
              />
              <Line
                  type="monotone"
                  dataKey="var95"
                  stroke="#f43f5e"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                  dot={false}
                  activeDot={{ r: 3, fill: "#f43f5e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-emerald-400" />
            <span className="text-[10px] font-mono text-slate-500">Portfolio P&L</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-rose-400 border-dashed" />
            <span className="text-[10px] font-mono text-slate-500">VaR (95%)</span>
          </div>
        </div>
      </div>
  );
}

// ─────────────────────────────────────────────
// LATENCY PIPELINE
// ─────────────────────────────────────────────

const PIPELINE_NODES = [
  { id: "ingest", label: "Market Feed", sub: "FIX 4.4", latency: "0.8ms", color: "#6366f1" },
  { id: "norm", label: "Normalizer", sub: "SIMD/AVX2", latency: "1.2ms", color: "#8b5cf6" },
  { id: "engine", label: "Risk Engine", sub: "C++ Core", latency: "3.1ms", color: "#10b981" },
  { id: "oms", label: "OMS", sub: "FIX Router", latency: "2.4ms", color: "#0ea5e9" },
  { id: "exec", label: "Exchange", sub: "Co-located", latency: "4.5ms", color: "#f59e0b" },
];

function LatencyPipeline() {
  const [active, setActive] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % PIPELINE_NODES.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Low-Latency Pipeline
          </p>
          <div className="flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-400 font-bold">LIVE</span>
          </div>
        </div>

        {/* Big metric */}
        <div className="text-center mb-4">
          <p className="text-5xl font-mono font-black text-white tracking-tight">
            12<span className="text-2xl text-slate-500 font-normal">ms</span>
          </p>
          <p className="text-[11px] font-mono text-slate-500 mt-1">avg end-to-end latency</p>
        </div>

        {/* Pipeline flow */}
        <div className="flex items-center gap-0 overflow-x-auto pb-1">
          {PIPELINE_NODES.map((node, i) => (
              <div key={node.id} className="flex items-center">
                <button
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    className="relative flex flex-col items-center group"
                >
                  <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 border"
                      style={{
                        backgroundColor:
                            pulse === i || active === i ? node.color + "22" : "#0f172a",
                        borderColor:
                            pulse === i || active === i ? node.color + "88" : "#1e293b",
                        boxShadow:
                            pulse === i ? `0 0 12px ${node.color}55` : "none",
                      }}
                  >
                    <Zap
                        size={14}
                        style={{ color: pulse === i || active === i ? node.color : "#334155" }}
                    />
                  </div>
                  <p
                      className="text-[9px] font-mono mt-1 transition-colors"
                      style={{ color: active === i ? node.color : "#475569" }}
                  >
                    {node.label}
                  </p>
                  {active === i && (
                      <div
                          className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded px-2 py-1 text-[9px] font-mono whitespace-nowrap z-10"
                          style={{ color: node.color }}
                      >
                        {node.latency}
                      </div>
                  )}
                </button>
                {i < PIPELINE_NODES.length - 1 && (
                    <div className="flex items-center mx-0.5">
                      <div
                          className="h-[1px] w-4 transition-all duration-300"
                          style={{
                            background:
                                pulse > i
                                    ? `linear-gradient(90deg, ${PIPELINE_NODES[i].color}, ${PIPELINE_NODES[i + 1].color})`
                                    : "#1e293b",
                          }}
                      />
                      <ChevronRight
                          size={8}
                          className="transition-colors duration-300"
                          style={{ color: pulse > i ? PIPELINE_NODES[i + 1].color : "#1e293b" }}
                      />
                    </div>
                )}
              </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Throughput", val: "4.2M msg/s" },
            { label: "P99", val: "18ms" },
            { label: "Uptime", val: "99.97%" },
          ].map((s) => (
              <div key={s.label} className="bg-slate-900/60 rounded-lg p-2 text-center border border-white/5">
                <p className="text-[10px] font-mono text-slate-600">{s.label}</p>
                <p className="text-[13px] font-mono font-bold text-slate-200 mt-0.5">{s.val}</p>
              </div>
          ))}
        </div>
      </div>
  );
}

// ─────────────────────────────────────────────
// BOTTOM TERMINAL
// ─────────────────────────────────────────────

const COMMANDS: Record<string, string[]> = {
  contact: [
    "\x1b[32m✓ Contact Information\x1b[0m",
    "  email    → alex.morgan@mail.mcgill.ca",
    "  linkedin → linkedin.com/in/alexmorgan-quant",
    "  github   → github.com/alexmorgan-quant",
    '  pgp      → run \x1b[36m"gpg --keyserver keys.openpgp.org --recv-keys 0xABCD1234"\x1b[0m',
  ],
  help: [
    "\x1b[33mavailable commands:\x1b[0m",
    "  \x1b[36mcontact\x1b[0m  — show contact information",
    "  \x1b[36mstack\x1b[0m    — list full tech stack",
    "  \x1b[36mclear\x1b[0m    — clear terminal",
    "  \x1b[36mwhoami\x1b[0m   — short bio",
  ],
  stack: [
    "\x1b[33mtech stack:\x1b[0m",
    "  languages   Python · C++17 · TypeScript · SQL · Bash",
    "  ml          PyTorch · JAX · scikit-learn · HuggingFace",
    "  infra       AWS (ECS/Lambda/S3) · Docker · Kafka",
    "  quant       QuantLib · zipline · vectorbt · Bloomberg API",
    "  web         Next.js · FastAPI · PostgreSQL · Redis",
  ],
  whoami: [
    "\x1b[32malex morgan\x1b[0m — engineering student @ mcgill",
    "  building at the intersection of LLMs and quantitative finance",
    "  prev: citadel securities · two sigma",
    '  run \x1b[36m"contact"\x1b[0m to get in touch',
  ],
  clear: ["__CLEAR__"],
};

function parseAnsi(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\x1b\[(\d+)m(.*?)\x1b\[0m/g;
  let last = 0;
  let match: RegExpExecArray | null;
  const colorMap: Record<string, string> = {
    "32": "#10b981",
    "33": "#f59e0b",
    "36": "#38bdf8",
    "31": "#f43f5e",
  };
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={last}>{text.slice(last, match.index)}</span>);
    parts.push(
        <span key={match.index} style={{ color: colorMap[match[1]] || "#e2e8f0" }}>
        {match[2]}
      </span>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
  return parts.length ? parts : [<span key={0}>{text}</span>];
}

function BottomTerminal() {
  const [history, setHistory] = useState<{ type: "input" | "output"; text: string }[]>([
    { type: "output", text: '\x1b[32mwelcome to alex.sh\x1b[0m — type \x1b[36m"help"\x1b[0m for commands' },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim().toLowerCase();
        if (!cmd) return;
        const lines = COMMANDS[cmd] || [`\x1b[31mcommand not found:\x1b[0m ${cmd} — try "help"`];
        if (lines[0] === "__CLEAR__") {
          setHistory([]);
        } else {
          setHistory((prev) => [
            ...prev,
            { type: "input", text: cmd },
            ...lines.map((l) => ({ type: "output" as const, text: l })),
          ]);
        }
        setCmdHistory((prev) => [cmd, ...prev]);
        setHistIdx(-1);
        setInput("");
      },
      [input]
  );

  const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "ArrowUp") {
          const next = Math.min(histIdx + 1, cmdHistory.length - 1);
          setHistIdx(next);
          setInput(cmdHistory[next] ?? "");
        } else if (e.key === "ArrowDown") {
          const next = Math.max(histIdx - 1, -1);
          setHistIdx(next);
          setInput(next === -1 ? "" : cmdHistory[next]);
        }
      },
      [histIdx, cmdHistory]
  );

  return (
      <div
          className="rounded-xl border border-white/[0.07] bg-[#050d1a]/90 backdrop-blur-sm overflow-hidden font-mono text-[12px]"
          onClick={() => inputRef.current?.focus()}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.05] bg-[#070f1e]">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <Terminal size={11} className="ml-2 text-slate-600" />
          <span className="text-slate-600 text-[11px]">alex.sh — zsh — 80×24</span>
        </div>

        {/* Output area */}
        <div className="p-4 h-40 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
          {history.map((line, i) => (
              <div key={i} className="flex gap-2 leading-5">
                {line.type === "input" ? (
                    <>
                      <span className="text-emerald-400 select-none">❯</span>
                      <span className="text-white">{line.text}</span>
                    </>
                ) : (
                    <span className="text-slate-300 pl-3">{parseAnsi(line.text)}</span>
                )}
              </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.05]">
          <span className="text-emerald-400 select-none">❯</span>
          <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-white placeholder-slate-600 caret-emerald-400"
              placeholder='try "contact" or "help"'
              autoComplete="off"
              spellCheck={false}
          />
          <span className="text-slate-600 text-[10px] hidden sm:block">↑↓ history</span>
        </form>
      </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function PortfolioPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
      <main
          className="min-h-screen text-slate-300 antialiased selection:bg-emerald-400/20 selection:text-emerald-200"
          style={{ backgroundColor: "#020617", fontFamily: "'Inter', sans-serif" }}
      >
        {/* ── Ambient background ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
              className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full"
              style={{
                background: "radial-gradient(circle, #10b98108 0%, transparent 70%)",
                transform: `translateY(${scrollY * 0.08}px)`,
              }}
          />
          <div
              className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full"
              style={{
                background: "radial-gradient(circle, #6366f106 0%, transparent 70%)",
                transform: `translateY(${scrollY * -0.05}px)`,
              }}
          />
          <div className="absolute inset-0 opacity-[0.015]"
               style={{
                 backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                 backgroundSize: "80px 80px",
               }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-24">

          {/* ── HERO ── */}
          <section className="space-y-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                  <Brain size={16} className="text-emerald-400" />
                </div>
                <span className="font-mono text-sm text-slate-500">portfolio.v2 / 2025</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-400/[0.07] border border-emerald-400/20 rounded-full px-4 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-300">
                Available for 2027 Graduate Roles
              </span>
              </div>
            </div>

            <div>
              <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] mb-4"
                  style={{ fontFamily: "'Geist Mono', 'JetBrains Mono', monospace" }}
              >
                Alex Morgan
              </h1>
              <p className="text-xl sm:text-2xl text-slate-400 font-light max-w-2xl leading-relaxed">
                Engineering the intersection of{" "}
                <span className="text-indigo-400 font-medium">LLMs</span> and{" "}
                <span className="text-emerald-400 font-medium">Quantitative Finance</span>.
              </p>
              <p className="mt-4 text-slate-600 font-mono text-sm max-w-xl">
                B.Eng. @ McGill · ex-Citadel · ex-Two Sigma · building fast, rigorous, and interpretable systems.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] hover:border-white/20 text-sm text-slate-400 hover:text-white transition-all bg-white/[0.02] hover:bg-white/[0.05]"
              >
                <Github size={15} /> GitHub
              </a>
              <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] hover:border-white/20 text-sm text-slate-400 hover:text-white transition-all bg-white/[0.02] hover:bg-white/[0.05]"
              >
                <Linkedin size={15} /> LinkedIn
              </a>
              <a
                  href="mailto:alex@mcgill.ca"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-400/20 hover:border-emerald-400/50 text-sm text-emerald-400 hover:text-emerald-300 transition-all bg-emerald-400/[0.04] hover:bg-emerald-400/[0.08]"
              >
                <Mail size={15} /> alex.morgan@mail.mcgill.ca
              </a>
            </div>
          </section>

          {/* ── BENTO GRID ── */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 size={16} className="text-emerald-400" />
              <h2
                  className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]"
              >
                Selected Projects
              </h2>
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] font-mono text-slate-700">03 projects</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Card A — RAG (tall left) */}
              <GlowCard className="p-5 md:row-span-1" glowColor="#6366f1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Database size={12} className="text-indigo-400" />
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                      NLP · RAG · LLM
                    </span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-mono">RAG Financial Analyst</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                      Retrieval-augmented generation system for 10-K/10-Q filings. Extracts structured risk factors and financial metrics with source attribution.
                    </p>
                  </div>
                  <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-indigo-400 transition-colors"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                </div>
                <div className="bg-[#030d1a] rounded-lg p-3 border border-white/[0.05] h-52">
                  <RagTerminal />
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {["Python", "LangChain", "pgvector", "FastAPI"].map((t) => (
                      <span key={t} className="text-[10px] font-mono text-slate-600 border border-white/[0.05] px-2 py-0.5 rounded">
                    {t}
                  </span>
                  ))}
                </div>
              </GlowCard>

              {/* Card B — VaR Chart */}
              <GlowCard className="p-5" glowColor="#10b981">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <TrendingDown size={12} className="text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      Quant · Risk · C++
                    </span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-mono">Quantitative Risk Engine</h3>
                  </div>
                  <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-emerald-400 transition-colors"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                </div>
                <div className="h-52">
                  <VarChart />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["C++17", "Python", "QuantLib", "Monte Carlo"].map((t) => (
                      <span key={t} className="text-[10px] font-mono text-slate-600 border border-white/[0.05] px-2 py-0.5 rounded">
                    {t}
                  </span>
                  ))}
                </div>
              </GlowCard>

              {/* Card C — Latency (full width) */}
              <GlowCard className="p-5 md:col-span-2" glowColor="#0ea5e9">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                        <Zap size={12} className="text-sky-400" />
                      </div>
                      <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest">
                      Systems · HFT · Infra
                    </span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-mono">Low-Latency Market Data Pipeline</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
                      Co-located order management system with lock-free SPSC queues and kernel-bypass networking. Benchmarked at 12ms avg E2E on Equinix NY4.
                    </p>
                  </div>
                  <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-sky-400 transition-colors shrink-0"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                </div>
                <div className="h-52 mt-2">
                  <LatencyPipeline />
                </div>
              </GlowCard>
            </div>
          </section>

          {/* ── TECH STACK ── */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Cpu size={16} className="text-indigo-400" />
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
                Tech Stack
              </h2>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="flex flex-wrap gap-2">
              {STACK.map((s) => (
                  <Badge key={s.label} label={s.label} color={s.color} />
              ))}
            </div>
          </section>

          {/* ── EXPERIENCE TIMELINE ── */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <ExternalLink size={16} className="text-slate-500" />
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
                Experience & Education
              </h2>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-400/30 via-indigo-400/20 to-transparent" />

              <div className="space-y-8 pl-8">
                {TIMELINE.map((item, i) => (
                    <div key={i} className="relative">
                      {/* dot */}
                      <div
                          className="absolute -left-8 top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: item.type === "work" ? "#10b981" : "#6366f1",
                            backgroundColor: item.type === "work" ? "#10b98122" : "#6366f122",
                          }}
                      >
                        <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: item.type === "work" ? "#10b981" : "#6366f1" }}
                        />
                      </div>

                      <div className="group">
                        <p className="text-[10px] font-mono text-slate-600 mb-0.5 uppercase tracking-wider">
                          {item.year}
                        </p>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                              {item.role}
                            </h3>
                            <p
                                className="text-xs font-mono mb-2"
                                style={{ color: item.type === "work" ? "#10b981" : "#818cf8" }}
                            >
                              {item.org}
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{item.desc}</p>
                          </div>
                          <span
                              className="shrink-0 text-[9px] font-mono px-2 py-0.5 rounded border mt-0.5"
                              style={
                                item.type === "work"
                                    ? { color: "#10b981", borderColor: "#10b98133", backgroundColor: "#10b98111" }
                                    : { color: "#818cf8", borderColor: "#6366f133", backgroundColor: "#6366f111" }
                              }
                          >
                        {item.type === "work" ? "WORK" : "EDU"}
                      </span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TERMINAL ── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Terminal size={16} className="text-slate-500" />
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
                Interactive Shell
              </h2>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <BottomTerminal />
          </section>

          {/* ── FOOTER ── */}
          <footer className="pt-8 border-t border-white/[0.05] flex items-center justify-between flex-wrap gap-4">
            <p className="text-[11px] font-mono text-slate-700">
              © 2025 Alex Morgan — Built with Next.js · Tailwind · Recharts
            </p>
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
              All systems nominal
            </div>
          </footer>
        </div>
      </main>
  );
}