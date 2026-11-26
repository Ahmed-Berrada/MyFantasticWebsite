import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-center px-5 py-24 md:px-8">
      <p className="text-ink-2">Error 404</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] font-semibold tracking-[-0.03em]">This page does not exist.</h1>
      <p className="mt-6 text-xl text-ink-2">The link may be old, or mistyped.</p>
      <p className="mt-8">
        <Link href="/" className="link">
          Back to the home page
        </Link>
      </p>
    </main>
  );
}
