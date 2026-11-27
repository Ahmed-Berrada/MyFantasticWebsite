// Loads every page in the sitemap of a running build and fails on anything a visitor or a crawler would notice:
// a non-200 status, not exactly one h1, a missing canonical or description, sideways scrolling, console errors,
// or an axe accessibility violation.
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
    page.on("console", (m) => {
      // Vercel Analytics and Speed Insights scripts only exist on Vercel.
      if (m.type() === "error" && !/_vercel|status of 404/.test(m.text())) errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("requestfailed", (r) => !r.url().includes("/_vercel/") && errors.push(`request failed: ${r.url()}`));

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

await browser.close();
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`\n${paths.length} pages x 2 widths: clean`);
