// Run after build; Playwright is installed outside the project (see relay/README.md).
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import {createRelay} from '../relay/server.mjs';
const {chromium} = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_MODULE, 'index.mjs')).href);
let discordMode = 204, calls = [], requests = [], browser;
const discord = http.createServer(async (req,res) => {
  let body=''; for await (const chunk of req) body+=chunk;
  calls.push(JSON.parse(body)); await new Promise(r=>setTimeout(r,200));
  res.writeHead(discordMode); res.end();
});
const relay = createRelay({webhook:'http://127.0.0.1:9103/mock',origins:['http://localhost:9101'],clientLimit:100,globalLimit:100});
const site = spawn('python',['-m','http.server','9101','--bind','127.0.0.1','--directory','dist'],{stdio:'ignore',windowsHide:true});
try {
  discord.listen(9103,'127.0.0.1'); await once(discord,'listening');
  relay.listen(9102,'127.0.0.1'); await once(relay,'listening');
  browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  for(let i=0;i<40;i++){try{await page.goto('http://localhost:9101');break;}catch{await new Promise(r=>setTimeout(r,100));}}
  await page.locator('#feedback-open').focus(); await page.keyboard.press('Enter');
  await page.locator('#feedback-dialog').waitFor({state:'visible'});
  assert.equal(await page.locator('#feedback-message').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('#feedback-send').isDisabled(),true);
  assert.match(await page.locator('#feedback-status').textContent(),/indisponible/);
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#feedback-open').evaluate(el=>el===document.activeElement),true);
  await page.route('**/feedback-config.js',route=>route.fulfill({contentType:'text/javascript',body:"export const feedbackEndpoint = 'https://relay.example/feedback';"}));
  let mode='relay';
  await page.route('https://relay.example/feedback',async route=>{
    const req=route.request(); requests.push(req.postDataJSON());
    assert.equal(req.method(),'POST'); assert.deepEqual(Object.keys(req.postDataJSON()),['message']);
    assert.equal(req.headers()['cookie'],undefined);
    if(mode==='network') return route.abort();
    if(mode==='relay') {
      const response=await fetch('http://127.0.0.1:9102/feedback',{method:'POST',headers:{Origin:'http://localhost:9101','Content-Type':'application/json'},body:req.postData()});
      return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});
    }
    return route.fulfill({status:typeof mode==='number'?mode:200,contentType:'application/json',body:mode==='badjson'?'invalid':JSON.stringify({ok:false})});
  });
  await page.reload(); await page.locator('#feedback-open').click();
  const field=page.locator('#feedback-message'), send=page.locator('#feedback-send'), status=page.locator('#feedback-status');
  await send.click(); assert.match(await status.textContent(),/Écris/); assert.equal(requests.length,0);
  await field.fill(' \n '); await send.click(); assert.equal(requests.length,0);
  await field.evaluate(el=>{el.value='😀'.repeat(901);}); await send.click(); assert.equal(requests.length,0);
  await field.fill('Retour de test sans donnée personnelle');
  await send.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
  assert.equal(await send.isDisabled(),true); assert.match(await status.textContent(),/Envoi en cours/);
  await page.waitForFunction(()=>document.querySelector('#feedback-status').textContent.includes('Merci'));
  assert.equal(requests.length,1); assert.equal(calls.length,1); assert.equal(await field.inputValue(),'');
  assert.equal(calls[0].content,requests[0].message); assert.deepEqual(calls[0].allowed_mentions.parse,[]);
  for(const scenario of [400,413,429,503,'network','badjson','falseok','relay']) {
    mode=scenario; discordMode=500;
    await field.fill('Message conservé'); await send.click();
    await page.waitForFunction(()=>!document.querySelector('#feedback-send').disabled);
    assert.equal(await field.inputValue(),'Message conservé'); assert.match(await status.textContent(),/conservé/);
    assert.doesNotMatch(await status.textContent(),/Merci/);
    const n=requests.length; await page.waitForTimeout(250); assert.equal(requests.length,n);
  }
  assert.equal(await status.getAttribute('role'),'status'); assert.equal(await status.getAttribute('aria-live'),'polite');
  await page.screenshot({path:path.join(os.tmpdir(),'issue16-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const bounds=await page.locator('#feedback-dialog').boundingBox(); assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390);
  await page.screenshot({path:path.join(os.tmpdir(),'issue16-mobile.png'),fullPage:true});
  // Native modal focus remains inside through keyboard navigation.
  for(let i=0;i<8;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.querySelector('#feedback-dialog').contains(document.activeElement)),true);}
  await page.keyboard.press('Escape');
  console.log('Browser checks passed: keyboard, live status, mobile, validation, double submit, real relay + mock Discord, 400/413/429/502/503/network/invalid success; screenshots in '+os.tmpdir());
} finally {
  await browser?.close(); site.kill();
  relay.closeAllConnections(); discord.closeAllConnections();
  await Promise.all([new Promise(r=>relay.close(r)),new Promise(r=>discord.close(r))]);
}
