import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {chromium}=await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_MODULE,'index.mjs')).href);
const server=spawn('python',['-m','http.server','9101','--bind','127.0.0.1','--directory','dist'],{stdio:'ignore',windowsHide:true});
let browser;
try {
  for(let i=0;i<100;i++) {try {if((await fetch('http://127.0.0.1:9101')).ok)break;}catch{} await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:9101'?r.continue():r.abort());
  await mkdir('docs/issue-48-evidence',{recursive:true});
  await page.goto('http://127.0.0.1:9101/#guide');
  await page.getByRole('heading',{name:'Préparer mon plan',exact:true}).waitFor();
  await page.screenshot({path:'docs/issue-48-evidence/guide-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Importer mes captures · parcours gratuit',exact:true}).click();
  await page.getByRole('heading',{name:'Sauvegarder et restaurer',exact:true}).waitFor();
  assert.equal(await page.locator('.photo-import-steps > li').count(),5);
  await page.screenshot({path:'docs/issue-48-evidence/sources-desktop.png',fullPage:true});
  await page.getByText('Références natives et limites',{exact:true}).click();
  const href=await page.getByRole('link',{name:'Ouvrir l’index des personnages'}).getAttribute('href');
  await page.goto('http://127.0.0.1:9101/'+href);
  // Generated production links are checked locally without contacting that site.
  for(const link of await page.locator('a').evaluateAll(nodes=>nodes.map(n=>n.href))) {
    const local=new URL(link); assert.equal((await page.request.get('http://127.0.0.1:9101'+local.pathname.replace('/naruto-blazing-revival/','/')+local.hash)).status(),200);
  }
  await page.screenshot({path:'docs/issue-48-evidence/reference-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  for(const route of ['guide','sources','collection','plan']) {
    await page.goto('http://127.0.0.1:9101/#'+route);
    await page.locator('#main h1').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' mobile overflow');
    await page.screenshot({path:`docs/issue-48-evidence/${route}-mobile.png`,fullPage:true});
  }
  await page.goto('http://127.0.0.1:9101/#guide');
  await page.getByRole('button',{name:'Renseigner mes stocks',exact:true}).click();
  await page.locator('#main h1').waitFor();
  assert.match(await page.locator('#main h1').innerText(),/Plan & stocks/);
  assert.deepEqual(errors,[]);
  console.log('9101: guide → import, 5 étapes, références/index, stocks, 4 routes mobiles sans débordement; aucune erreur JS. Aucun envoi externe.');
} finally {
  await browser?.close();
  server.kill();
  await new Promise(resolve=>server.exitCode!==null?resolve():server.once('exit',resolve));
}
