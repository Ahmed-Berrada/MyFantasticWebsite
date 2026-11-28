"use client";
import { useState } from "react";

/**
 * On phones, a tall demo stays one tap away instead of filling two screens; from the sm breakpoint up it is
 * always shown. The content is rendered either way, so nothing loads late.
 */
export default function PhoneReveal({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="demo-button sm:hidden" aria-expanded={false}>
          {label}
        </button>
      )}
      <div className={open ? "" : "hidden sm:block"}>{children}</div>
    </>
  );
}
