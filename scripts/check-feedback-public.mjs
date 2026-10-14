// Read-only by default. A real submission requires an explicit ID and an exclusive
// evidence file created BEFORE submission: never rerun a control to obtain receipt.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_MODULE,'index.mjs')));
const url='https://arosare.github.io/naruto-blazing-revival/';
const endpoint='https://retours.179-237-102-19.sslip.io/feedback';
const [candidate,control,evidence]=process.argv.slice(2);
assert.ok(candidate,'Provide isolated built candidate');
const browser=await chromium.launch();
try {
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'networkidle'});
  for(const file of ['index.html','app.js','feedback.js','feedback-config.js','player-experience.css','model.js','arosa.json']) {
    const response=await page.request.get(url+file+'?issue35='+Date.now());
    assert.equal(response.status(),200,file);
    assert.deepEqual(await response.body(),await fs.readFile(path.join(candidate,'dist',file)),file);
  }
  const key='arosa-blazing-collection-v1';
  await page.waitForFunction(k=>localStorage.getItem(k),key);
  const initial=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  assert.ok(Object.keys(initial.stocks).length>0);
  assert.ok(Object.values(initial.stocks).every(v=>v===0));
  initial.stocks.ryo=12345;
  await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key,state:initial});
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).stocks.ryo,key),12345);
  const saved=await page.evaluate(k=>localStorage.getItem(k),key);
  await page.locator('#feedback-open').click();
  const field=page.locator('#feedback-message'),send=page.locator('#feedback-send'),status=page.locator('#feedback-status');
  await send.click();assert.match(await status.textContent(),/Écris/);
  let mode=429,calls=0;
  await page.route(endpoint,async route=>{
    calls++;
    await new Promise(r=>setTimeout(r,200));
    if(mode==='network')return route.abort();
    await route.fulfill({status:mode,contentType:'application/json',body:JSON.stringify({ok:false})});
  });
  for(const scenario of [400,413,429,500,502,503,'network']) {
    mode=scenario;
    await field.fill('Contrôle simulé sans transmission');
    await send.focus();await page.keyboard.press('Enter');await page.keyboard.press('Enter');
    await page.waitForFunction(()=>!document.querySelector('#feedback-send').disabled);
    assert.equal(await field.inputValue(),'Contrôle simulé sans transmission');
    assert.match(await status.textContent(),/conservé/);
    if(mode===429)assert.match(await status.textContent(),/60 secondes/);
    const count=calls;await page.waitForTimeout(1000);assert.equal(calls,count);
  }
  assert.equal(calls,7,'One request per simulated error, double submission blocked');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#feedback-open').evaluate(el=>el===document.activeElement),true);
  await page.unroute(endpoint);
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),saved);
  assert.deepEqual(errors,[]);
  console.log('PUBLIC PASS: exact candidate bytes; fresh zero stocks; saved ryo=12345 unchanged; mobile, focus, validation; 7 SIMULATED failures, text retained, double submit blocked, no retries. No real quota saturation.');
  if(control) {
    assert.match(control,/^ISSUE35-CONTROLE-\d{8}T\d{6}Z$/);
    assert.ok(evidence,'Evidence file required');
    await fs.writeFile(evidence,JSON.stringify({control,started:new Date().toISOString(),state:'reserved-before-single-attempt'})+'\n',{flag:'wx'});
    await page.locator('#feedback-open').click();await field.fill(control);
    const responsePromise=page.waitForResponse(r=>r.url()===endpoint&&r.request().method()==='POST');
    await send.click();
    const response=await responsePromise;
    const body=await response.json();
    await page.waitForFunction(()=>!document.querySelector('#feedback-send').disabled);
    const result={control,time:new Date().toISOString(),status:response.status(),body,confirmation:await status.textContent(),text:await field.inputValue(),channelObserved:false};
    await fs.writeFile(evidence,JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result));
    assert.equal(response.status(),200);assert.deepEqual(body,{ok:true});
    assert.match(result.confirmation,/Merci/);assert.equal(result.text,'');
    assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),saved);
    assert.deepEqual(errors,[]);
  }
} finally {await browser.close();}
