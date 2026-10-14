import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {execFileSync, spawn} from 'node:child_process';
import {once} from 'node:events';

const root = fileURLToPath(new URL('../', import.meta.url));
const candidate = path.resolve(process.argv[2] || '.');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'docs/feedback-candidate/manifest.json'), 'utf8'));
const git = args => execFileSync('git', args, {cwd:candidate, encoding:'utf8'});
assert.equal(git(['rev-parse','HEAD']).trim(), manifest.base);
assert.deepEqual(git(['diff','--name-only',manifest.base]).trim().split(/\r?\n/).sort(), [...manifest.files].sort());
const text = file => fs.readFile(path.join(candidate,file), 'utf8');
assert.equal((await text('app.js')).split(/\r?\n/).slice(3).join('\n'), git(['show',`${manifest.base}:app.js`]).replace(/\r\n/g,'\n'));
const normalize = value => value.replace(/\r\n/g,'\n');
assert.equal(normalize(await text('player-experience.css')).split('\n/* Feedback remains')[0].trimEnd(), normalize(git(['show',`${manifest.base}:player-experience.css`])).trimEnd());
const originalFiles = JSON.parse(git(['show',`${manifest.base}:SITE_FILES.json`]));
assert.deepEqual(JSON.parse(await text('SITE_FILES.json')).filter(file=>!['feedback.js','feedback-config.js'].includes(file)),originalFiles);
assert.equal(await text('dist/feedback-config.js'), `export const feedbackEndpoint = ${JSON.stringify(manifest.endpoint)};\n`);
const forbidden = /DISCORD_WEBHOOK_URL|discord(?:app)?\.com\/api\/webhooks\/|secret\.env|secret-sentinel/i;
let scanned=0;
async function scan(dir) {
  for (const item of await fs.readdir(dir,{withFileTypes:true})) {
    assert.ok(!/^(relay|server|tests|node_modules|ops|\.env.*)$|server\.(?:mjs|js)|inject-secret|feedback-relay|secret\.env/i.test(item.name),item.name);
    const file=path.join(dir,item.name);
    assert.ok(!item.isSymbolicLink(),file);
    if(item.isDirectory()) await scan(file);
    else { scanned++; assert.ok(!forbidden.test(await fs.readFile(file,'utf8')),file); }
  }
}
await scan(path.join(candidate,'dist'));
const {initialPersonalState,catalogCharacters,resourceStockKeys,stockFor,validateBackup}=await import(pathToFileURL(path.join(candidate,'dist/model.js')).href);
const catalogue=JSON.parse(await text('dist/catalogue.json'));
const state=initialPersonalState(catalogue), keys=resourceStockKeys(catalogCharacters(catalogue));
assert.ok(keys.length>0);
for(const key of keys) assert.equal(stockFor(key,state.stocks),0,key);
assert.equal(validateBackup({...state,stocks:{...state.stocks,ryo:12345}},catalogue,{publicDefaults:true}).stocks.ryo,12345);
console.log(`Scope, build config, ${scanned} dist files without webhook/server, ${keys.length} zero stocks and backup preservation: PASS`);

if(!process.env.PLAYWRIGHT_MODULE) throw Error('Set PLAYWRIGHT_MODULE to external playwright package directory');
const {chromium}=await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_MODULE,'index.mjs')).href);
const site=spawn(process.env.PYTHON||'python',['-m','http.server','9101','--bind','127.0.0.1','--directory',path.join(candidate,'dist')],{stdio:'pipe',windowsHide:true});
const exited=once(site,'exit');
let browser;
try {
  let ready=false;
  for(let i=0;i<40;i++) { try {ready=(await fetch('http://127.0.0.1:9101')).ok;if(ready)break;} catch {} await new Promise(r=>setTimeout(r,100)); }
  assert.ok(ready,'Test server did not start');
  browser=await chromium.launch(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  let mode=200, calls=0;
  // Every external request is intercepted: no real relay, Discord or VPS access.
  await page.route('**/*',async route=>{
    const request=route.request(), url=new URL(request.url());
    if(url.origin==='http://127.0.0.1:9101') return route.continue();
    assert.equal(request.url(),manifest.endpoint);
    calls++;
    assert.equal(request.method(),'POST');
    assert.deepEqual(Object.keys(request.postDataJSON()),['message']);
    assert.equal(request.headers()['cookie'],undefined);
    assert.ok(!request.postData().includes('private-box-sentinel'));
    await new Promise(r=>setTimeout(r,150));
    if(mode==='network') return route.abort();
    return route.fulfill({status:typeof mode==='number'?mode:200,contentType:'application/json',headers:{'Retry-After':'60'},body:mode==='badjson'?'invalid':JSON.stringify({ok:mode===200})});
  });
  await page.goto('http://127.0.0.1:9101',{waitUntil:'networkidle'});
  assert.equal(await page.locator('meta[name="generator"]').getAttribute('content'),'MakeProject · Release 33');
  await page.evaluate(()=>localStorage.setItem('feedback-test-box','private-box-sentinel'));
  await page.locator('#feedback-open').focus(); await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog',{name:'Envoyer un retour'}), field=page.getByLabel('Ton message (obligatoire)'), send=page.locator('#feedback-send'), status=page.locator('#feedback-status');
  await dialog.waitFor({state:'visible'});
  assert.equal(await field.evaluate(el=>el===document.activeElement),true);
  assert.equal(await send.isDisabled(),false);
  assert.equal(await status.getAttribute('role'),'status');
  assert.equal(await status.getAttribute('aria-live'),'polite');
  assert.equal(await field.getAttribute('maxlength'),'1800');
  await send.click(); assert.match(await status.textContent(),/Écris/); assert.equal(calls,0);
  assert.equal(await field.getAttribute('aria-invalid'),'true');
  await field.fill(' \n '); await send.click(); assert.equal(calls,0);
  await field.evaluate(el=>{el.value='😀'.repeat(901);}); await send.click(); assert.equal(calls,0);
  await field.fill('Succès simulé #31'); await send.focus();
  await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
  assert.equal(await send.isDisabled(),true); assert.equal(await field.getAttribute('readonly'),'');
  assert.equal(await page.locator('#feedback-form').getAttribute('aria-busy'),'true');
  await page.waitForFunction(()=>document.querySelector('#feedback-status').textContent.includes('Merci'));
  assert.equal(calls,1); assert.equal(await field.inputValue(),'');
  for(const scenario of [201,204,400,413,429,500,502,503,'network','badjson','falseok']) {
    mode=scenario; await field.fill('Texte conservé'); await send.click();
    await page.waitForFunction(()=>!document.querySelector('#feedback-send').disabled);
    assert.equal(await field.inputValue(),'Texte conservé');
    assert.match(await status.textContent(),/conservé/); assert.doesNotMatch(await status.textContent(),/Merci/);
    if(scenario===429) assert.match(await status.textContent(),/60 secondes/);
    const count=calls; await page.waitForTimeout(250); assert.equal(calls,count);
  }
  mode=200; await send.click(); await page.waitForFunction(()=>document.querySelector('#feedback-status').textContent.includes('Merci'));
  assert.equal(await field.inputValue(),'');
  await field.focus();
  for(const key of ['Tab','Shift+Tab']) for(let i=0;i<8;i++) {await page.keyboard.press(key); assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true);}
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const bounds=await dialog.boundingBox(); assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390);
  await page.keyboard.press('Escape'); assert.equal(await dialog.isVisible(),false);
  assert.equal(await page.locator('#feedback-open').evaluate(el=>el===document.activeElement),true);
  await page.locator('#feedback-open').click(); await page.getByRole('button',{name:'Fermer le formulaire'}).click();
  assert.equal(await dialog.isVisible(),false); assert.deepEqual(errors,[]);
  console.log('Candidate browser PASS: keyboard/focus/label/live status/mobile, validation, pending/double submit, simulated 200, 201/204/400/413/429/500/502/503/network/invalid JSON/ok:false, retry and text preservation. No real Discord reception.');
} finally {
  await browser?.close(); site.kill(); await exited;
}
