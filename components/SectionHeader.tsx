interface SectionHeaderProps {
  index: string;
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
}

export default function SectionHeader({ index, label, title, lede }: SectionHeaderProps) {
  return (
    <header className="reveal mb-12 max-w-3xl md:mb-16">
      <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.14em] text-muted uppercase">
        <span className="text-signal">{index}</span>
        <span className="h-px w-8 bg-line-2" aria-hidden />
        {label}
      </p>
      <h2 className="text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance md:text-[44px]">{title}</h2>
      {lede && <p className="mt-5 text-lg leading-relaxed text-ink-2 text-pretty">{lede}</p>}
    </header>
  );
}
