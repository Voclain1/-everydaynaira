#!/usr/bin/env node
/**
 * Confirms every URL from the old WordPress site still resolves on the new build.
 * Start the site first (npm run build && npm start), then:
 *
 *   npm run check:urls                       # checks http://localhost:3000
 *   npm run check:urls -- https://preview.vercel.app
 */
import fs from "node:fs";

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const urls = fs.readFileSync(new URL("./legacy-urls.txt", import.meta.url), "utf8").split("\n").map((s) => s.trim()).filter(Boolean);

let bad = 0;
for (const u of urls) {
  const res = await fetch(base + u, { redirect: "manual" });
  let status = res.status;
  let final = u;
  if (status >= 300 && status < 400) {
    final = new URL(res.headers.get("location"), base + u).pathname;
    status = (await fetch(base + final)).status;
  }
  const ok = status === 200;
  if (!ok) bad++;
  console.log(`${ok ? "ok " : "BAD"}  ${res.status}${final !== u ? ` -> ${final}` : ""}  ${u}`);
}
console.log(`\n${urls.length - bad}/${urls.length} legacy URLs resolve.`);
process.exit(bad ? 1 : 0);
