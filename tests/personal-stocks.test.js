import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialPersonalState,resourceStockKeys,stockFor,validateBackup,backup,catalogCharacters} from '../model.js';
import {importPhotoBox,PHOTO_BOX_FORMAT,PHOTO_BOX_VERSION} from '../box-import.js';

const catalogue=JSON.parse(await readFile(new URL('../catalogue.json',import.meta.url),'utf8'));

test('une nouvelle box initialise tous les stocks pris en charge à zéro',()=>{
  const state=initialPersonalState(catalogue);
  const supported=resourceStockKeys((catalogue.all||[...(catalogue.released||[]),...(catalogue.upcoming||[]),...(catalogue.clientOnly||[])])
    .filter((n,index,all)=>all.findIndex(candidate=>candidate.id===n.id)===index));
  assert.ok(supported.length>0);
  assert.deepEqual(Object.keys(state.stocks).sort(),supported.sort());
  for(const key of supported)assert.equal(stockFor(key,state.stocks),0,key);
});

test('la restauration conserve les quantités explicites d’une sauvegarde existante',()=>{
  const fresh=initialPersonalState(catalogue);
  const raw={...fresh,stocks:{...fresh.stocks,ryo:12345,'ramen:Heart:4':7}};
  const restored=validateBackup(raw,catalogue,{publicDefaults:true});
  assert.equal(restored.stocks.ryo,12345);
  assert.equal(restored.stocks['ramen:Heart:4'],7);
});

test('un import garde les valeurs fournies et laisse les stocks inconnus absents',()=>{
  const imported=importPhotoBox({format:PHOTO_BOX_FORMAT,version:PHOTO_BOX_VERSION,characters:[],stocks:{ryo:12,tokens:null}},catalogue);
  assert.equal(stockFor('ryo',imported.stocks),12);
  assert.equal(stockFor('tokens',imported.stocks),null);
});

const photo=(values={})=>({format:PHOTO_BOX_FORMAT,version:PHOTO_BOX_VERSION,characters:[],stocks:{},...values});
const firstClientForm=()=>catalogCharacters(catalogue).flatMap(n=>n.forms.map(form=>({n,form}))).find(({form})=>Number.isSafeInteger(form.client?.unitId));

test('un import photo vide conserve personnages et stocks enregistrés',()=>{
  const saved=initialPersonalState(catalogue),{n}=firstClientForm();
  saved.characters[n.id].owned=true;saved.characters[n.id].level=77;saved.stocks.ryo=4321;
  const imported=importPhotoBox(photo(),catalogue,saved);
  assert.equal(imported.characters[n.id].owned,true);
  assert.equal(imported.characters[n.id].level,77);
  assert.equal(imported.stocks.ryo,4321);
});

test('un import partiel ne remplace que les valeurs observées',()=>{
  const saved=initialPersonalState(catalogue),{n,form}=firstClientForm(),observedLevel=form.client.finalCap,row={unitId:form.client.unitId,level:observedLevel};
  saved.characters[n.id].owned=true;saved.characters[n.id].hp=13;saved.characters[n.id].luck=25;saved.stocks.ryo=99;
  const imported=importPhotoBox(photo({characters:[row]}),catalogue,saved);
  assert.equal(imported.characters[n.id].level,observedLevel);
  assert.equal(imported.characters[n.id].hp,13);
  assert.equal(imported.characters[n.id].luck,25);
  assert.equal(imported.stocks.ryo,99);
});

test('une observation invalide laisse la box fournie intacte',()=>{
  const saved=initialPersonalState(catalogue),before=structuredClone(saved);
  const result=()=>importPhotoBox(photo({characters:[{unitId:-1}]}),catalogue,saved);
  assert.throws(result,/unitId inconnu/);
  assert.deepEqual(saved,before);
});

test('une sauvegarde complète reste restaurable après un import photo',()=>{
  const saved=initialPersonalState(catalogue),{n}=firstClientForm();
  saved.characters[n.id].owned=true;saved.characters[n.id].level=64;saved.stocks.ryo=765;
  const restored=validateBackup(backup(saved),catalogue,{publicDefaults:true});
  assert.equal(restored.characters[n.id].owned,true);
  assert.equal(restored.characters[n.id].level,64);
  assert.equal(restored.stocks.ryo,765);
});
