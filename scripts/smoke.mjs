// Loads every page in the sitemap of a running build and fails on anything a visitor or a crawler would notice:
// a non-200 status, not exactly one h1, a missing canonical or description, sideways scrolling, console errors,
// a failed or missing asset, or an axe accessibility violation. Then checks what a page list cannot: the feeds,
// redirects and 404s, both live demos, and the mobile menu.
//
//   npm run build && npm start &   then   BASE=http://localhost:3000 npm run smoke
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const SITE = "https://www.ahmedberrada.com";
const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "") || "/");
if (paths.length === 0) throw new Error("sitemap has no pages");

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const failures = [];

for (const width of [390, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  for (const path of paths) {
    const page = await context.newPage();
    const errors = [];
    // Vercel Analytics and Speed Insights scripts only exist on Vercel; any other failed or missing asset counts.
    const vercelOnly = (url) => url.includes("/_vercel/") || /\/[0-9a-f]{16}\/script\.js/.test(url);
    page.on("console", (m) => {
      if (m.type() === "error" && !/Failed to load resource|_vercel/.test(m.text())) errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("requestfailed", (r) => !vercelOnly(r.url()) && errors.push(`request failed: ${r.url()}`));
    page.on("response", (r) => r.status() >= 400 && !vercelOnly(r.url()) && r.url() !== BASE + path && errors.push(`${r.status()} ${r.url()}`));

    const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
    const facts = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      canonical: !!document.querySelector('link[rel="canonical"]'),
      description: !!document.querySelector('meta[name="description"]')?.getAttribute("content"),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    }));

    const problems = [];
    if (res?.status() !== 200) problems.push(`status ${res?.status()}`);
    if (facts.h1 !== 1) problems.push(`${facts.h1} h1`);
    if (!facts.canonical) problems.push("no canonical");
    if (!facts.description) problems.push("no description");
    if (facts.overflow) problems.push("horizontal overflow");
    problems.push(...errors.map((e) => `console: ${e.slice(0, 160)}`));

    if (width === 1440) {
      await page.evaluate(axeSource);
      const { violations } = await page.evaluate(() => window.axe.run());
      problems.push(...violations.map((v) => `axe ${v.id} (${v.impact}): ${v.nodes[0]?.target.join(" ")}`));
    }

    console.log(`${problems.length ? "FAIL" : "ok  "} ${width} ${path}`);
    for (const p of problems) failures.push(`${width} ${path}: ${p}`);
    await page.close();
  }
  await context.close();
}

// --- Beyond the page list -------------------------------------------------------------------------------------
const check = (ok, what) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${what}`);
  if (!ok) failures.push(what);
};

for (const feed of ["/writing/feed.xml", "/fr/writing/feed.xml"]) {
  const r = await fetch(BASE + feed);
  const body = await r.text();
  check(r.status === 200 && /rss\+xml/.test(r.headers.get("content-type") ?? "") && (body.match(/<item>/g)?.length ?? 0) > 0, `feed ${feed}`);
}
for (const [from, to, status] of [
  ["/work/lob-engine", "/work/order-book", 308],
  ["/fr/work/lob-engine", "/fr/work/order-book", 308],
  // The pipeline is gone for now, not for good: a temporary redirect.
  ["/work/market-data-pipeline", "/#work", 307],
  ["/fr/work/market-data-pipeline", "/fr#work", 307],
]) {
  const r = await fetch(BASE + from, { redirect: "manual" });
  check(r.status === status && (r.headers.get("location") ?? "").endsWith(to), `redirect ${from} -> ${to}`);
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  for (const [path, lang] of [["/no-such-page", "en"], ["/fr/no-such-page", "fr"], ["/work/no-such-case", "en"]]) {
    const r = await page.goto(BASE + path, { waitUntil: "networkidle" });
    const facts = await page.evaluate(() => ({ lang: document.documentElement.lang, title: document.title, nav: !!document.querySelector("nav") }));
    check(r?.status() === 404 && facts.lang === lang && facts.title.length > 0 && facts.nav, `404 ${path} (${lang}, titled, with nav)`);
  }

  // Both demos actually run: the Monte Carlo worker (and the CSP that allows it), in its note, and the order book.
  await page.goto(BASE + "/writing/monte-carlo-against-black-scholes", { waitUntil: "networkidle" });
  const mc = page.getByRole("button", { name: /run live/i });
  await mc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await mc.click();
  const finished = await page
    .getByText(/Monte Carlo estimate .* after 1,000,000 paths/)
    .waitFor({ state: "attached", timeout: 15000 })
    .then(() => true, () => false);
  check(finished, "Monte Carlo demo runs to 1,000,000 paths");

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const book = page.getByRole("button", { name: /^run$/ });
  await book.scrollIntoViewIfNeeded();
  const orders = () => page.locator("p", { hasText: /^orders$/ }).locator("xpath=following-sibling::p").first().innerText();
  const before = await orders();
  await book.click();
  await page.waitForTimeout(1500);
  check((await orders()) !== before, "order book demo advances when run");
  await context.close();
}

{
  // The mobile menu: opens, keeps the page behind inert, closes with Escape and hands focus back.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const toggle = page.locator("button[aria-controls=mobile-menu]");
  await toggle.click();
  await page.waitForTimeout(400); // the menu fades in over 200 ms: check contrast once it has settled
  const open = (await toggle.getAttribute("aria-expanded")) === "true" && (await page.locator("main[inert]").count()) === 1;
  await page.evaluate(axeSource);
  const { violations } = await page.evaluate(() => window.axe.run());
  await page.keyboard.press("Escape");
  const closed = (await toggle.getAttribute("aria-expanded")) === "false" && (await page.evaluate(() => document.activeElement?.getAttribute("aria-controls"))) === "mobile-menu";
  check(open && closed, "mobile menu opens, Escape closes it and returns focus");
  // On a phone the order book is one tap away.
  await page.getByRole("button", { name: /live order book/i }).click();
  check(await page.getByRole("button", { name: /^run$/ }).isVisible(), "phone: the order book opens on request");
  check(violations.length === 0, `axe with the mobile menu open${violations.length ? `: ${violations.map((v) => v.id).join(", ")}` : ""}`);
  await context.close();
}

await browser.close();
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`\n${paths.length} pages x 2 widths, feeds, redirects, 404s, demos and menu: clean`);
