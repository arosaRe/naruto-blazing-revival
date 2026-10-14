import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialPersonalState,resourceStockKeys,stockFor,validateBackup} from '../model.js';
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
