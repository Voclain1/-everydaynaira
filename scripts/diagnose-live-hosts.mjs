import assert from "node:assert/strict";
const www="https://www.everydaynaira.com";
const apex="https://everydaynaira.com";
const paths=[
 "/",
 "/guides/",
 "/tools/",
 "/stamp-duty-on-bank-transfer-in-nigeria-explained/",
 "/bank-charges-in-nigeria-explained/",
 "/resources/bank-dispute-checklist/",
];
async function get(url){
 const res=await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(20000),headers:{"user-agent":"EverydayNaira-SEO-Host-Verification/1.0"}});
 return res;
}
for(const path of paths){
 const old=await get(apex+path),newUrl=www+path;
 assert([301,308].includes(old.status),`Expected permanent apex redirect, got ${old.status} at ${path}`);
 const dest=new URL(old.headers.get("location")||"",apex+path);
 assert.equal(dest.href,newUrl,`Apex redirect does not preserve path: ${path}`);
 const response=await get(newUrl);
 assert.equal(response.status,200,`Canonical www page must be HTTP 200: ${path}`);
 const html=await response.text();
 const can=html.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0]||"";
 assert(can.includes(`href="${newUrl}"`),`Canonical must use preferred www host: ${path}`);
 console.log(`PASS: apex permanent redirect + www 200 + self canonical ${path}`);
}
const sitemapRes=await get(www+"/sitemap.xml");
assert.equal(sitemapRes.status,200,"Production sitemap unavailable");
const sitemap=await sitemapRes.text();
const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);
assert(locs.length>=50,`Sitemap has too few URLs: ${locs.length}`);
assert(locs.every(x=>x.startsWith(www+"/")),"Sitemap references noncanonical host");
for(const path of paths.filter(x=>x!=="/"))
 assert(locs.includes(www+path),`Missing sitemap URL: ${path}`);
const robots=await get(www+"/robots.txt");
assert.equal(robots.status,200,"robots.txt unavailable");
assert((await robots.text()).includes("Sitemap: "+www+"/sitemap.xml"),"Robots points to incorrect sitemap");
console.log(`PASS: ${locs.length} www canonical sitemap URLs and correct robots sitemap directive`);
