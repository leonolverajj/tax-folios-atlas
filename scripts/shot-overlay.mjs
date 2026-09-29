import { chromium } from 'playwright-core';
import fs from 'node:fs';
const out='docs/workflow'; fs.mkdirSync(out,{recursive:true});
const ids=process.argv.slice(2);
const b=await chromium.launch({channel:'chrome',headless:true});
for(const id of ids){
  const ctx=await b.newContext({viewport:{width:1600,height:1000},deviceScaleFactor:1});
  const p=await ctx.newPage();
  await p.goto(`http://localhost:5173/?debug=1#/${id}`,{waitUntil:'networkidle'});
  await p.waitForSelector('.folio-svg .node',{timeout:20000}); await p.waitForTimeout(1200);
  await p.screenshot({path:`${out}/${id}-3-overlay.png`});
  console.log('shot',id);
  await ctx.close();
}
await b.close();
