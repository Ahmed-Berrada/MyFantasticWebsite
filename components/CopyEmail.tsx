"use client";
import { useEffect, useRef, useState } from "react";
import { LINKS } from "@/src/lib/seo";

/**
 * Copies the email address. Both labels share one grid cell, so the button keeps its width when the label
 * changes, and the confirmation is announced by a separate status region.
 */
export default function CopyEmail({ copy, copied }: { copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email);
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 2000);
    } catch {
      window.location.href = `mailto:${LINKS.email}`;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="grid min-h-9 rounded-[3px] border border-line-2 px-3 text-sm transition-colors hover:border-ink active:scale-[0.97]"
      >
        <span className={`col-start-1 row-start-1 self-center transition-opacity duration-150 ${done ? "opacity-0" : ""}`}>{copy}</span>
        <span aria-hidden className={`col-start-1 row-start-1 self-center transition-opacity duration-150 ${done ? "" : "opacity-0"}`}>
          {copied}
        </span>
      </button>
      <span role="status" className="sr-only">
        {done ? copied : ""}
      </span>
    </>
  );
}
