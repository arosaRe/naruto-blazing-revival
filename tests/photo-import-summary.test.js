import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {initialPersonalState,catalogCharacters,stockFor,validateBackup,backup} from '../model.js';
import {importPhotoBox,PHOTO_BOX_FORMAT,PHOTO_BOX_VERSION} from '../box-import.js';

const catalogue=JSON.parse(await readFile(new URL('../catalogue.json',import.meta.url),'utf8'));
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
// Execute the actual UI restore handler, with only its browser effects stubbed.
const restoreSource=app.slice(app.indexOf('function restore(text){'),app.indexOf('\nasync function copyImportPrompt'));
assert.ok(restoreSource.startsWith('function restore(text){'));
const characters=catalogCharacters(catalogue);
const candidates=characters.filter(n=>n.forms.some(form=>Number.isSafeInteger(form.client?.unitId)));
const [observed,...preserved]=candidates.slice(0,3);
const form=observed.forms.find(form=>Number.isSafeInteger(form.client?.unitId));
const photo=(rows=[])=>({format:PHOTO_BOX_FORMAT,version:PHOTO_BOX_VERSION,characters:rows});

function savedBox(){
  const state=initialPersonalState(catalogue);
  for(const n of preserved)Object.assign(state.characters[n.id],{owned:true,level:1,hp:13,luck:25});
  state.stocks.ryo=4321;
  state.importNotes=['Note conservée'];
  return state;
}

function uiRestore(state){
  const status={innerHTML:'',classList:{add(){}},setAttribute(){},focus(){}};
  const effects={persist:0,render:0,notifications:[]};
  const context={state,catalogue,profile:{publicDefaults:true},ui:{},importFeedback:null,
    importPhotoBox,validateBackup,stockFor,
    $:selector=>selector==='#character-dialog'?{open:false}:status,
    esc:String,owned:()=>characters.filter(n=>context.state.characters[n.id].owned),
    accountStockKeys:()=>Object.keys(context.state.stocks),accountName:()=>context.state.username||'Ma box',
    resetCollectionFilters:ui=>ui,resetPlanFilters(){},
    persist(){effects.persist++;},renderPage(){effects.render++;},notify(message){effects.notifications.push(message);}
  };
  runInNewContext(restoreSource,context);
  return {context,effects,restore:raw=>context.restore(JSON.stringify(raw))};
}

test('le résumé UI compte zéro observation et conserve une box remplie',()=>{
  const saved=savedBox(),before=structuredClone(saved),{context,restore}=uiRestore(saved);
  assert.equal(restore(photo()),true);
  assert.match(context.importFeedback.message,/^0 versions observées importées/);
  assert.deepEqual(context.state.characters,before.characters);
  assert.deepEqual(context.state.stocks,before.stocks);
  assert.deepEqual(context.state.importNotes,before.importNotes);
});

for(const update of [false,true])test(`le résumé UI compte une version lors d'un ${update?'remplacement':'ajout'}`,()=>{
  const saved=savedBox();
  if(update)Object.assign(saved.characters[observed.id],{owned:true,level:1,hp:13});
  const {context,restore}=uiRestore(saved);
  assert.equal(restore(photo([{unitId:form.client.unitId,level:form.client.finalCap}])),true);
  assert.match(context.importFeedback.message,/^1 version observée importée/);
  assert.equal(context.owned().length,3);
  assert.equal(context.state.characters[observed.id].level,form.client.finalCap);
  for(const n of preserved)assert.deepEqual(context.state.characters[n.id],saved.characters[n.id]);
  if(update)assert.equal(context.state.characters[observed.id].hp,13);
});

test('un import rejeté ne mute rien et ne produit aucune réussite UI',()=>{
  for(const raw of [photo([{unitId:form.client.unitId},{unitId:-1}]),photo([{unitId:form.client.unitId},{unitId:form.client.unitId}]),{...photo([{unitId:form.client.unitId}]),stocks:{ryo:-1}}]){
    const saved=savedBox(),before=structuredClone(saved),{context,effects,restore}=uiRestore(saved);
    assert.equal(restore(raw),false);
    assert.equal(context.state,saved);
    assert.deepEqual(saved,before);
    assert.equal(context.importFeedback.error,true);
    assert.doesNotMatch(context.importFeedback.message,/observées? importées?/);
    assert.equal(effects.persist,0);
    assert.equal(effects.render,0);
    assert.deepEqual(effects.notifications,[context.importFeedback.message]);
  }
});

test('le résumé UI et la restauration complète restent inchangés',()=>{
  const saved=savedBox(),replacement=initialPersonalState(catalogue);
  replacement.stocks.ryo=765;
  const {context,restore}=uiRestore(saved);
  assert.equal(restore(backup(replacement)),true);
  assert.match(context.importFeedback.message,/^Sauvegarde restaurée/);
  assert.equal(context.owned().length,0);
  assert.equal(context.state.stocks.ryo,765);
});
