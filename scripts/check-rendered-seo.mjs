#!/usr/bin/env node
/** Verify SEO output rendered by the actual production server. */
import assert from "node:assert/strict";
const base=(process.argv[2]||"http://localhost:3000").replace(/\/$/,"");
const canonical="https://www.everydaynaira.com";
async function page(path){
 const response=await fetch(base+path,{signal:AbortSignal.timeout(15000)});
 assert.equal(response.status,200,`Unexpected HTTP status at ${path}: ${response.status}`);
 return response.text();
}
const [robots,sitemap,home,article,banking,search,feed]=await Promise.all([
 page("/robots.txt"),page("/sitemap.xml"),page("/"),
 page("/bank-charges-in-nigeria-explained/"),page("/banking/"),
 page("/search-index.json"),page("/feed.xml"),
]);
assert(robots.includes(`Sitemap: ${canonical}/sitemap.xml`),"robots canonical sitemap mismatch");
assert(sitemap.includes(`<loc>${canonical}/bank-charges-in-nigeria-explained/</loc>`),"Main article missing from sitemap");
assert(!sitemap.includes("bank-charges-nigeria/"),"Retired duplicate is indexed in sitemap");
assert(sitemap.includes(`${canonical}/images/posts/bank-charges-in-nigeria-explained.webp`),"Sitemap uses incorrect cover image URL");
for(const [label,html,path] of [["home",home,"/"],["bank charges",article,"/bank-charges-in-nigeria-explained/"]]){
 const url=canonical+path;
 assert(html.includes(`rel="canonical" href="${url}"`)||html.includes(`href="${url}" rel="canonical"`),`Invalid canonical for ${label}`);
}
assert(!banking.includes('href="/bank-charges-nigeria/"'),"Banking category links to a redirect");
assert(!search.includes('"u":"/bank-charges-nigeria/"'),"Redirected article still in search index");
assert(!feed.includes("<link>"+canonical+"/bank-charges-nigeria/</link>"),"Redirected article still in RSS feed");
assert(article.includes("2020 Guide")&&article.includes("EXPOSURE DRAFT"),"Bank charges correction is missing from rendered content");
const guides=[
 "bank-transfer-failed-but-debited-in-nigeria",
 "how-to-reverse-money-sent-to-wrong-account-in-nigeria",
 "how-to-report-a-bank-to-cbn-in-nigeria",
 "sms-alert-charges-in-nigeria",
 "how-to-budget-150000-to-250000-naira-salary-in-nigeria",
 "how-to-budget-when-paid-daily-or-weekly-in-nigeria",
 "how-to-save-for-annual-house-rent-in-nigeria",
 "flat-rate-vs-reducing-balance-loan-interest-in-nigeria",
];
for(const slug of guides){
 const route="/"+slug+"/",url=canonical+route;
 const html=await page(route);
 assert(html.includes(`rel="canonical" href="${url}"`)||html.includes(`href="${url}" rel="canonical"`),`Invalid canonical for new article ${slug}`);
 assert(sitemap.includes(`<loc>${url}</loc>`),`Article missing in sitemap: ${slug}`);
 assert(search.includes(`"u":"${route}"`),`Article missing from search index: ${slug}`);
 assert(feed.includes(`<link>${url}</link>`),`Article missing from RSS: ${slug}`);
 assert(/<h1[^>]*>/.test(html),`Missing rendered heading for ${slug}`);
}
console.log("Rendered SEO checks passed: canonical metadata, sitemap, robots, article image, category links, search, RSS and all eight new guides.");

