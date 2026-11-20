const origin="https://www.everydaynaira.com";
const apex="https://everydaynaira.com";
const routes=["/","/stamp-duty-on-bank-transfer-in-nigeria-explained/","/bank-charges-in-nigeria-explained/","/guides/","/sitemap.xml","/robots.txt"];
for(const route of routes){
 for(const host of [apex,origin]){
  const url=host+route;
  try{
   const res=await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(20000),headers:{"user-agent":"EverydayNaira-SEO-Diagnostics/1.0"}});
   const location=res.headers.get("location");
   const body=res.status===200?await res.text():"";
   const meta=body.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0]||body.match(/<link[^>]+href="[^"]+"[^>]+rel="canonical"[^>]*>/i)?.[0]||"";
   console.log(JSON.stringify({url,status:res.status,location,canonical:meta,sitemapLocCount:route==="/sitemap.xml"?(body.match(/<loc>/g)||[]).length:undefined,bytes:body.length}));
  }catch(e){console.log(JSON.stringify({url,error:String(e)}));}
 }
}
