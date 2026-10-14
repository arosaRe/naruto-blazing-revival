import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {importPhotoBox} from '../box-import.js';
import {initialPersonalState,catalogCharacters} from '../model.js';
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
const prompt=await readFile(new URL('../import-box-prompt.txt',import.meta.url),'utf8');
const catalogue=JSON.parse(await readFile(new URL('../catalogue.json',import.meta.url),'utf8'));
test('copie automatique et repli manuel conservent exactement le fichier téléchargé',async()=>{
  for(const clipboardAvailable of [true,false]){
    let copied;
    const field={focus(){},select(){}},box={hidden:true};
    const context={importPromptText:'',fetch:async path=>{assert.equal(path,'import-box-prompt.txt');return {ok:true,text:async()=>prompt};},navigator:clipboardAvailable?{clipboard:{writeText:async text=>{copied=text;}}}:{},$:selector=>selector==='#import-prompt-fallback'?box:field,promptFeedback(){},notify(){}};
    runInNewContext(app.slice(app.indexOf('async function copyImportPrompt'),app.indexOf('document.addEventListener',app.indexOf('async function copyImportPrompt'))),context);
    await context.copyImportPrompt({disabled:false});
    assert.equal(clipboardAvailable?copied:field.value,prompt);
  }
  assert.match(app,/href="import-box-prompt.txt" download/);
});
test('relevé synthétique partiel accepté et fusion sans perte des inconnues ou autres personnages',()=>{
  const [n,other]=catalogCharacters(catalogue).filter(n=>n.forms.some(f=>Number.isSafeInteger(f.client?.unitId)));
  const form=n.forms.find(f=>Number.isSafeInteger(f.client?.unitId));
  const raw={format:'naruto-blazing-box',version:1,characters:[{unitId:form.client.unitId,level:1,xp:null,hp:null,atk:0,speed:null,abilities:null,luck:null,unlockedCap:null}],stocks:{ryo:12,tokens:null},notes:['Relevé incomplet : test synthétique, aucun compte personnel ; EXP, bonus et stocks inconnus.']};
  const fresh=importPhotoBox(JSON.parse(JSON.stringify(raw)),catalogue);
  assert.equal(fresh.characters[n.id].xp,null);assert.equal(fresh.characters[n.id].hp,null);
  assert.equal(Object.hasOwn(fresh.stocks,'tokens'),false);
  const prior=initialPersonalState(catalogue);
  Object.assign(prior.characters[n.id],{hp:1,luck:1});
  Object.assign(prior.characters[other.id],{owned:true,level:1});
  prior.stocks.tokens=42;prior.stocks.stone=3;
  const before=structuredClone(prior),merged=importPhotoBox(raw,catalogue,prior);
  assert.deepEqual(prior,before);
  assert.equal(merged.characters[n.id].hp,1);assert.equal(merged.characters[n.id].luck,1);
  assert.equal(merged.characters[n.id].atk,0);assert.equal(merged.characters[n.id].owned,true);
  assert.deepEqual(merged.characters[other.id],before.characters[other.id]);
  assert.equal(merged.stocks.tokens,42);assert.equal(merged.stocks.stone,3);assert.equal(merged.stocks.ryo,12);
  assert.deepEqual(merged.importNotes,raw.notes);
});
