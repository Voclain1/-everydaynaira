#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
const root=process.cwd(), read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const posts=fs.readdirSync(path.join(root,"content/posts")).filter(f=>f.endsWith(".md")).map(f=>({file:f,...matter(read("content/posts/"+f))}));
const pages=fs.readdirSync(path.join(root,"content/pages")).filter(f=>f.endsWith(".md")).map(f=>({file:f,...matter(read("content/pages/"+f))}));
const hubs=[...read("lib/topics.ts").matchAll(/hub: "(\/[^"]+\/)",/g)].map(x=>x[1]);
const normal=(v)=>{const p=new URL(v,"https://www.everydaynaira.com").pathname;return p==="/" ? p : p.replace(/\/+$/,"")+"/"};
const sources=JSON.parse(read("content/sources.json")),links=JSON.parse(read("lib/legacy-link-fixes.json"));
const routes=new Set(["/","/authors/","/start-here/","/guides/","/tools/","/resources/bank-dispute-checklist/","/contact/",...hubs,...[...posts,...pages].map(x=>"/"+x.data.slug+"/")]);
const redirected=new Set(["/bank-charges-nigeria/",...Object.keys(links).map(normal)]);
assert.equal(new Set([...posts,...pages].map(p=>p.data.slug)).size,posts.length+pages.length,"Duplicate slugs");
assert(!posts.some(p=>p.file==="bank-charges-nigeria.md"),"Archived banking duplicate is still live");
const sprintGuides=[
 "bank-transfer-failed-but-debited-in-nigeria",
 "how-to-reverse-money-sent-to-wrong-account-in-nigeria",
 "how-to-report-a-bank-to-cbn-in-nigeria",
 "sms-alert-charges-in-nigeria",
 "how-to-budget-150000-to-250000-naira-salary-in-nigeria",
 "how-to-budget-when-paid-daily-or-weekly-in-nigeria",
 "how-to-save-for-annual-house-rent-in-nigeria",
 "flat-rate-vs-reducing-balance-loan-interest-in-nigeria",
];
for(const slug of sprintGuides){
 const post=posts.find(p=>p.data.slug===slug);
 assert(post,`Sprint 1 guide missing: ${slug}`);
 const words=post.content.trim().split(/\s+/).length;
 assert(words>=900,`Sprint 1 guide too short (${words} words): ${slug}`);
 assert((post.data.sources??[]).length>=2,`Sprint 1 guide lacks references: ${slug}`);
 assert((post.content.match(/\]\(\/[^)\s]+\)/g)??[]).length>=3,`Sprint 1 guide lacks internal pathways: ${slug}`);
 assert(!post.data.reviewed,`Do not label a new article independently fact-checked before editorial sign-off: ${slug}`);
 assert(post.data.image===`/images/posts/${slug}.webp`,`Sprint 1 article needs a selected real-life editorial photo: ${slug}`);
 assert(post.data.imageAlt?.trim(),`Missing descriptive image alt text: ${slug}`);
 assert(fs.existsSync(path.join(root,"public",post.data.image.replace(/^\//,""))),`Missing photographic WebP: ${slug}`);

}

const sprint2Guides=["atm-debited-but-no-cash-dispensed-in-nigeria","how-to-find-nip-session-id-for-bank-transfer-in-nigeria","how-to-check-if-a-loan-app-is-approved-in-nigeria","how-to-report-loan-app-harassment-in-nigeria","what-to-do-after-sending-money-to-an-online-scammer-in-nigeria","how-to-identify-fake-bank-customer-service-numbers-in-nigeria","how-to-save-for-school-fees-every-term-in-nigeria","how-to-build-an-emergency-fund-with-irregular-income-in-nigeria","how-to-record-daily-sales-and-expenses-in-a-small-nigerian-business","weekly-cash-flow-forecast-for-small-business-in-nigeria","how-to-budget-transport-costs-in-lagos-on-a-salary","how-to-plan-december-holiday-spending-on-a-nigerian-salary"];
for(const slug of sprint2Guides){
 const post=posts.find(p=>p.data.slug===slug);
 assert(post,`Sprint 2 guide missing: ${slug}`);
 const words=post.content.trim().split(/\s+/).length;
 assert(words>=750,`Sprint 2 guide too short (${words} words): ${slug}`);
 assert((post.data.sources??[]).length>=2,`Sprint 2 guide missing source references: ${slug}`);
 assert((post.content.match(/\]\(\/[^)\s]+\)/g)??[]).length>=3,`Sprint 2 guide lacks contextual internal links: ${slug}`);
 assert(!post.data.reviewed,`Sprint 2 guide not independently fact-checked: ${slug}`);
 assert(post.data.image===`/images/posts/${slug}.webp`,`Publisher-approved real-life featured photo required before release: ${slug}`);
 assert(post.data.imageAlt?.trim(),`Image alt text is missing: ${slug}`);
 assert(fs.existsSync(path.join(root,"public",post.data.image.replace(/^\//,""))),`Publisher-approved WebP photo missing: ${slug}`);
}
assert(read("lib/site.ts").includes('url: "https://www.everydaynaira.com"'),"Incorrect canonical host");
assert(read("app/sitemap.ts").includes("images: p.image ? [absUrl(p.image)] : undefined"),"Article image sitemap incorrect");
assert(read("app/robots.ts").includes('absUrl("/sitemap.xml")'),"robots sitemap incorrect");
for(const [from,to] of Object.entries(links)){const dest=normal(to);assert(routes.has(dest),`Invalid redirect target ${from} -> ${to}`);assert(!redirected.has(dest),`Redirect chain ${from} -> ${to}`)}
for(const {file,data,content} of [...posts,...pages]){
  assert(data.slug && data.title && data.description,`Incomplete metadata in ${file}`);
  if(data.updated)assert(!Number.isNaN(Date.parse(data.updated)),`Invalid updated date in ${file}`);
  if(data.date)assert(!Number.isNaN(Date.parse(data.date)),`Invalid publish date in ${file}`);
  if(data.updated&&data.date)assert(Date.parse(data.updated)>=Date.parse(data.date),`Updated before publication: ${file}`);
  for(const id of data.sources??[])if(typeof id==="string")assert(sources[id]?.url,`Missing source ${id}: ${file}`);
  if(data.image){assert(data.imageAlt?.trim(),`Missing alt: ${file}`);assert(fs.existsSync(path.join(root,"public",data.image.replace(/^\//,""))),`Missing image: ${file}`)}
  for(const m of content.matchAll(/\]\((\/[^)\s]+)\)/g)){
    const raw=m[1].split(/[?#]/)[0];if(!raw)continue;const dest=normal(raw);
    assert(routes.has(dest),`Broken internal link in ${file}: ${raw}`);
    assert(!redirected.has(dest),`Redirecting internal link in ${file}: ${raw}`);
  }
  if(["bank-charges-in-nigeria-explained.md","stamp-duty-on-bank-transfer-in-nigeria-explained.md"].includes(file)){
    assert(!/Under the CBN's revised 2026 Guide|free up to ₦5,000/i.test(content),`Draft charge falsely asserted: ${file}`);
    assert(/exposure draft/i.test(content),`Missing draft-status caveat: ${file}`);
  }
}
console.log(`SEO regression checks passed: ${posts.length} public articles, ${pages.length} doc pages, ${hubs.length} hubs, ${Object.keys(links).length} aliases.`);
