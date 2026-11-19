#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
const cwd=process.cwd();
const read=(p)=>fs.readFileSync(path.join(cwd,p),"utf8");
const entries=fs.readdirSync(path.join(cwd,"content/posts")).filter(x=>x.endsWith(".md")).map(f=>({file:f,...matter(read("content/posts/"+f))}));
const docs=fs.readdirSync(path.join(cwd,"content/pages")).filter(x=>x.endsWith(".md")).map(f=>matter(read("content/pages/"+f)));
const sources=JSON.parse(read("content/sources.json"));
const briefs=JSON.parse(read("content/image-briefs.json"));
const slugs=["atm-debited-but-no-cash-dispensed-in-nigeria","how-to-find-nip-session-id-for-bank-transfer-in-nigeria","how-to-check-if-a-loan-app-is-approved-in-nigeria","how-to-report-loan-app-harassment-in-nigeria","what-to-do-after-sending-money-to-an-online-scammer-in-nigeria","how-to-identify-fake-bank-customer-service-numbers-in-nigeria","how-to-save-for-school-fees-every-term-in-nigeria","how-to-build-an-emergency-fund-with-irregular-income-in-nigeria","how-to-record-daily-sales-and-expenses-in-a-small-nigerian-business","weekly-cash-flow-forecast-for-small-business-in-nigeria","how-to-budget-transport-costs-in-lagos-on-a-salary","how-to-plan-december-holiday-spending-on-a-nigerian-salary"];
const existing=new Set(["/","/start-here/","/guides/","/tools/","/contact/","/authors/","/resources/bank-dispute-checklist/",
 ...["/budgeting/","/saving/","/banking/","/debt/","/income/","/money-safety/"],
 ...entries.map(p=>"/"+p.data.slug+"/"), ...docs.map(p=>"/"+p.data.slug+"/")]);
assert.equal(entries.length,38,"Expected 38 posts after Sprint 02");
for(const slug of slugs){
 const article=entries.find(p=>p.data.slug===slug);
 assert(article,"Missing article "+slug);
 assert(article.content.trim().split(/\s+/).length>=750,"Too short "+slug);
 assert((article.data.sources||[]).length>=2,"Missing cited sources "+slug);
 assert((article.content.match(/\]\(\/[^)\s]+\)/g)||[]).length>=3,"Too few internal links "+slug);
 assert(briefs[slug]?.scene&&briefs[slug]?.alt,"Missing photo brief "+slug);
 assert(!article.data.reviewed,"Unverified review date "+slug);
 for(const id of article.data.sources||[])assert(sources[id]?.url,"Unresolved source "+slug+": "+id);
 for(const item of article.content.matchAll(/\]\((\/[^)\s]+)\)/g)){
  const dest=item[1].split(/[?#]/)[0];
  assert(existing.has(dest),"Broken link "+slug+" => "+dest);
 }
}
for(const [name,slug] of [["sitemap","/resources/bank-dispute-checklist/"]]){
 assert(read("app/"+name+".ts").includes(slug),"Resource missing in "+name);
}
const home=read("app/page.tsx");
assert(home.includes("posts.slice(0, 12)"),"Homepage must show latest 12");
assert(read("components/BankDisputeChecklist.tsx").includes("No sign-up")===false,"Checklist should make precise privacy statements, not unsupported analytics claims");
console.log("Sprint 02 draft audit passed: 12 source-backed guides, 38 total articles, links, 12 image briefs and resource route. Images intentionally unapproved.");
