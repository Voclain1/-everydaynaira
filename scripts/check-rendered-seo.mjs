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
const [robots,sitemap,home,article,banking,search,feed,archive]=await Promise.all([
 page("/robots.txt"),page("/sitemap.xml"),page("/"),
 page("/bank-charges-in-nigeria-explained/"),page("/banking/"),
 page("/search-index.json"),page("/feed.xml"),page("/guides/"),
]);
assert(robots.includes(`Sitemap: ${canonical}/sitemap.xml`),"robots canonical sitemap mismatch");
assert(sitemap.includes(`<loc>${canonical}/bank-charges-in-nigeria-explained/</loc>`),"Main article missing from sitemap");
assert(!sitemap.includes("bank-charges-nigeria/"),"Retired duplicate is indexed in sitemap");
assert(sitemap.includes(`<loc>${canonical}/guides/</loc>`),"Complete article archive missing from sitemap");
assert(archive.includes(`rel="canonical" href="${canonical}/guides/"`)||archive.includes(`href="${canonical}/guides/" rel="canonical"`),"Article archive has invalid canonical");
assert(home.includes('href="/guides/"'),"Homepage does not link to complete article archive");
const indexedPosts=JSON.parse(search).filter(item=>item.k==="guide");
assert.equal(indexedPosts.length,new Set(indexedPosts.map(item=>item.u)).size,"Duplicate article URLs in search index");
assert.equal(indexedPosts.length,38,"Unexpected total public article count in archive coverage test");
for(const item of indexedPosts)assert(archive.includes(`href="${item.u}"`),`Published guide missing from complete archive: ${item.u}`);
assert(sitemap.includes(`${canonical}/images/posts/bank-charges-in-nigeria-explained.webp`),"Sitemap uses incorrect cover image URL");
for(const [label,html,path] of [["home",home,"/"],["bank charges",article,"/bank-charges-in-nigeria-explained/"]]){
 const url=canonical+path;
 assert(html.includes(`rel="canonical" href="${url}"`)||html.includes(`href="${url}" rel="canonical"`),`Invalid canonical for ${label}`);
}
assert(!banking.includes('href="/bank-charges-nigeria/"'),"Banking category links to a redirect");
const resource=await page("/resources/bank-dispute-checklist/");
assert(resource.includes(`rel="canonical" href="${canonical}/resources/bank-dispute-checklist/"`)||resource.includes(`href="${canonical}/resources/bank-dispute-checklist/" rel="canonical"`),"Bank dispute resource has invalid canonical");
assert(resource.includes("Your evidence checklist")&&resource.includes("Bank complaint letter template"),"Bank dispute resource missing content");
assert(sitemap.includes(`<loc>${canonical}/resources/bank-dispute-checklist/</loc>`),"Bank dispute resource missing from sitemap");
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
 assert(archive.includes(`href="${route}"`),`Sprint 1 guide missing from complete archive: ${slug}`);
}
const secondGuides=["atm-debited-but-no-cash-dispensed-in-nigeria","how-to-find-nip-session-id-for-bank-transfer-in-nigeria","how-to-check-if-a-loan-app-is-approved-in-nigeria","how-to-report-loan-app-harassment-in-nigeria","what-to-do-after-sending-money-to-an-online-scammer-in-nigeria","how-to-identify-fake-bank-customer-service-numbers-in-nigeria","how-to-save-for-school-fees-every-term-in-nigeria","how-to-build-an-emergency-fund-with-irregular-income-in-nigeria","how-to-record-daily-sales-and-expenses-in-a-small-nigerian-business","weekly-cash-flow-forecast-for-small-business-in-nigeria","how-to-budget-transport-costs-in-lagos-on-a-salary","how-to-plan-december-holiday-spending-on-a-nigerian-salary"];
for(const slug of secondGuides){
 const route="/"+slug+"/",url=canonical+route;
 const html=await page(route);
 assert(html.includes(`rel="canonical" href="${url}"`)||html.includes(`href="${url}" rel="canonical"`),`Invalid canonical: ${slug}`);
 assert(sitemap.includes(`<loc>${url}</loc>`),`Missing sitemap: ${slug}`);
 assert(search.includes(`"u":"${route}"`),`Missing search result: ${slug}`);
 assert(feed.includes(`<link>${url}</link>`),`Missing RSS entry: ${slug}`);
 assert(home.includes(`href="${route}"`),`Missing homepage latest card: ${slug}`);
 assert(archive.includes(`href="${route}"`),`Missing guide archive card: ${slug}`);
 assert(html.includes(`/images/posts/${slug}.webp`),`Missing approved photographic cover: ${slug}`);
}
console.log("Rendered SEO checks passed: 38-guide archive, 12 homepage cards, free dispute resource, canonical pages, images, sitemap, search and RSS.");

