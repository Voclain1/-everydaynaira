#!/usr/bin/env node
import fs from "node:fs";
const base=(process.argv[2]||"http://localhost:3000").replace(/\/$/,"");
const urls=fs.readFileSync(new URL("./legacy-urls.txt",import.meta.url),"utf8").split("\n").map(s=>s.trim()).filter(Boolean);
let failed=0;
for(const old of urls){
  let url=new URL(old,base+"/"),status=0,hops=0;
  const seen=new Set();
  try{
    while(true){
      if(seen.has(url.href))throw new Error("Redirect loop");
      seen.add(url.href);
      const res=await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(15000)});
      status=res.status;
      if(status<300||status>=400)break;
      if(++hops>5)throw new Error("Too many redirects");
      const next=res.headers.get("location");if(!next)throw new Error("Redirect missing Location");
      url=new URL(next,url);if(url.origin!==new URL(base).origin)throw new Error("Off-origin redirect");
    }
    if(status!==200)throw new Error("HTTP "+status);
    console.log("OK "+old+" -> "+url.pathname+" ("+hops+" redirects)");
  }catch(error){failed++;console.error("FAIL "+old+": "+error.message)}
}
console.log((urls.length-failed)+"/"+urls.length+" legacy URLs resolve.");
process.exitCode=failed?1:0;
