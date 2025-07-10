// @ts-nocheck
/* quick production modal test */
const puppeteer=require('puppeteer');
(async()=>{
 const url=process.argv[2]||'https://lxera.ai';
 const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();
 await page.emulate(puppeteer.KnownDevices['iPhone X']);
 await page.goto(url,{waitUntil:'networkidle2',timeout:60000});
 // tap request demo
 await page.evaluate(()=>{
   const btn=[...document.querySelectorAll('button')].find(b=>/request/i.test(b.textContent));
   if(btn) btn.click();
 });
 await page.waitForSelector('[role="dialog"]',{visible:true,timeout:30000});
 const overlap=await page.evaluate(()=>{
   const dlg=document.querySelector('[role="dialog"]');
   if(!dlg) return 'dialog missing';
   const r=dlg.getBoundingClientRect();
   const x=r.left+r.width/2,y=r.top+r.height/2;
   const top=document.elementFromPoint(x,y);
   return dlg.contains(top)||top===dlg?null:top.tagName;
 });
 console.log('Overlap:',overlap);
 await page.screenshot({path:'prod-modal.png'});
 console.log('Screenshot saved prod-modal.png');
 await browser.close();
})();