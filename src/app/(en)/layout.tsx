import type { Metadata, Viewport } from "next";
import "../globals.css";
import RootShell from "@/components/RootShell";
import { SITE_URL } from "@/src/lib/seo";

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };
export const viewport: Viewport = { themeColor: "#eceef0" };

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootShell lang="en" skip="Skip to content">
      {children}
    </RootShell>
  );
}
