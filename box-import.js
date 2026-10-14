import * as model from './model.js?v=20261014-public-import1';
import {MATERIAL_STOCK_ALIASES} from './material-recipes-map.js?v=20261014-public-import1';

export const PHOTO_BOX_FORMAT='naruto-blazing-box';
export const PHOTO_BOX_VERSION=1;
const known=value=>Number.isSafeInteger(value)&&value>=0;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>Object.hasOwn(value,key);
const elementIds={1:'Heart',2:'Skill',3:'Body',4:'Bravery',5:'Wisdom'};
const characterFields=['unitId','level','xp','hp','atk','speed','abilities','luck','unlockedCap'];
const observationFields=characterFields.slice(1);
const baseCap=form=>form.client?.baseCap??form.maxLv??null;
const finalCap=form=>form.client?.finalCap??(form.limitBreak?form.maxLvLb:form.maxLv)??null;
const plusCap=(form,stat)=>form.client&&own(form.client,'pillCaps')?form.client.pillCaps?.[stat]??null:form.stats?.plusValues?.[stat]??null;
const abilitiesCap=form=>form.client?.abilityCount??form.abilities?.length??null;
const luckCap=form=>form.client&&own(form.client,'luckCap')?form.client.luckCap:form.luck?.max??null;
const capsFor=(n,form)=>[...new Set([baseCap(form),...(form.client?.limitBreakSteps||(form===n.forms.at(-1)?n.maxing?.limitBreak?.steps:[])||[]).map(step=>step.to)].filter(known))].sort((a,b)=>a-b);

function assertFields(value,fields,label){
  if(!object(value))throw new Error(`${label} doit être un objet JSON.`);
  const unexpected=Object.keys(value).find(key=>!fields.includes(key));
  if(unexpected)throw new Error(`${label} : champ non reconnu « ${unexpected} ».`);
}

/** Native material IDs are aliases only when the catalogue links the exact
 * item to a budget key. Titles alone never identify a personal LB crystal.
 */
export function importStockKeyMap(catalogue){
  const ninjas=model.catalogCharacters(catalogue),keys=new Set(model.resourceStockKeys(ninjas));
  const aliasCanonical=new Map();
  for(const [canonical,aliases] of Object.entries(MATERIAL_STOCK_ALIASES))for(const alias of aliases)aliasCanonical.set(alias,canonical);
  const canonical=key=>aliasCanonical.get(key)||key;
  const map=new Map([...keys].map(key=>[key,canonical(key)])),native=new Map();
  const recordMaterial=material=>{
    const id=material.clientId??material.unitId??material.id,key=material.stockKey;
    if(!known(id)||!key)return;
    const target=canonical(key),prior=native.get(id);
    if(prior&&prior!==target)throw new Error(`Catalogue incohérent : le matériau ${id} correspond à plusieurs stocks.`);
    native.set(id,target);map.set(target,target);map.set(key,target);
  };
  for(const n of ninjas){
    for(const form of n.forms||[]){
      for(const material of form.awakening?.materials||[])recordMaterial(material);
      for(const step of form.client?.limitBreakSteps||[])for(const material of step.materials||[])recordMaterial(material);
    }
    for(const step of n.maxing?.limitBreak?.steps||[])for(const material of step.materials||[])recordMaterial(material);
    for(const craft of n.maxing?.limitBreak?.crystalAwakenings||[])for(const material of craft.materials||[])recordMaterial(material);
  }
  for(const material of catalogue.clientMaterials||[]){
    const element=elementIds[material.elementId],id=material.id,stars=material.stars;
    let target=native.get(id);
    if(!target&&material.category===90&&material.name===element&&model.RAMEN_BASE_EXPERIENCE[stars]===material.experienceGainBase)target=`ramen:${element}:${stars}`;
    if(!target&&material.category===91&&material.name==='Awakening Scroll'&&element&&stars>=1&&stars<=4)target=`scroll:${element}:${stars}`;
    if(!target&&material.category===93&&[2,3].includes(stars)){
      const stats=['hp','atk','speed'].filter(stat=>material.pillGain?.[stat]>0);
      if(stats.length===1&&model.PILL_GAINS[stars]?.[stats[0]]===material.pillGain[stats[0]])target=`pill:${stats[0]}:${stars}`;
    }
    if(!target&&material.category===95&&material.name==='Acquisition Stone')target='stone';
    if(!target&&material.name==='Acquisition Stone'&&material.title==='Activation Shard')target='shard';
    target=canonical(target||`material:${id}`);
    map.set(target,target);map.set(`material:${id}`,target);map.set(`special:${id}`,target);
  }
  for(const [alias,target] of aliasCanonical)if(map.has(target))map.set(alias,target);
  return map;
}

/** Validate the entire captured box before creating a new personal account.
 * Missing observations remain null; absent stocks remain unknown (not zero).
 * Neither the incoming object nor the shared catalogue is modified.
 */
export function importPhotoBox(raw,catalogue){
  assertFields(raw,['format','version','username','characters','stocks','notes'],'L’import');
  if(raw.format!==PHOTO_BOX_FORMAT||raw.version!==PHOTO_BOX_VERSION)throw new Error('Format d’import non reconnu. Utilise naruto-blazing-box, version 1.');
  if(!Array.isArray(raw.characters))throw new Error('characters doit être une liste d’observations.');
  if(!object(raw.stocks))throw new Error('stocks doit être un objet de quantités observées.');
  if(own(raw,'username')&&(typeof raw.username!=='string'||!raw.username.trim()||raw.username.length>80||/[\u0000-\u001f\u007f]/.test(raw.username)))throw new Error('username doit être un pseudo non vide de 80 caractères maximum.');
  if(own(raw,'notes')&&(!Array.isArray(raw.notes)||raw.notes.length>200||raw.notes.some(note=>typeof note!=='string'||note.length>2000)))throw new Error('notes doit être une liste de 200 textes maximum, chacun limité à 2 000 caractères.');
  const ninjas=model.catalogCharacters(catalogue),units=new Map();
  for(const n of ninjas)for(const form of n.forms||[])if(known(form.client?.unitId))units.set(form.client.unitId,{n,form});
  const seenFamilies=new Set(),observations=[];
  for(const [index,row] of raw.characters.entries()){
    const label=`Personnage ${index+1}`;assertFields(row,characterFields,label);
    if(!known(row.unitId)||!units.has(row.unitId))throw new Error(`${label} : unitId inconnu dans le catalogue.`);
    const {n,form}=units.get(row.unitId);
    if(seenFamilies.has(n.id))throw new Error(`${label} : ${n.name} — ${n.title} apparaît plusieurs fois. Garde une seule observation de cette version ; les doublons ne sont pas fusionnés.`);
    seenFamilies.add(n.id);
    const progress={};
    const maxima={level:finalCap(form),hp:plusCap(form,'hp'),atk:plusCap(form,'atk'),speed:plusCap(form,'speed'),abilities:abilitiesCap(form),luck:luckCap(form)};
    for(const field of observationFields){
      const value=own(row,field)?row[field]:null;
      if(value!==null&&!known(value))throw new Error(`${label} (${row.unitId}) : ${field} doit être un entier positif ou nul, ou null si non observé.`);
      if(value!==null&&own(maxima,field)&&(!known(maxima[field])||value>maxima[field]))throw new Error(`${label} (${row.unitId}) : ${field} dépasse le plafond de cette forme (${maxima[field]??'inconnu'}).`);
      progress[field]=value;
    }
    if(progress.unlockedCap!==null&&(!capsFor(n,form).includes(progress.unlockedCap)||(progress.level!==null&&progress.unlockedCap<progress.level)))throw new Error(`${label} (${row.unitId}) : unlockedCap doit être un palier natif compatible avec le niveau observé.`);
    if(progress.xp!==null){
      const level=progress.level===0?1:progress.level;
      if(level===null&&progress.xp!==0)throw new Error(`${label} (${row.unitId}) : renseigne le niveau pour valider l’EXP observée, ou laisse xp à null.`);
      const atCap=level===finalCap(form)||level===progress.unlockedCap;
      const next=form.client?.expByLevel?.find(value=>value.level===level)?.experienceToNext;
      if(atCap&&progress.xp!==0||level!==null&&!atCap&&(!known(next)||progress.xp>=next))throw new Error(`${label} (${row.unitId}) : xp dépasse l’EXP possible dans le niveau observé.`);
    }
    observations.push({n,form,progress});
  }
  const allowedStocks=importStockKeyMap(catalogue),stocks={},seenStocks=new Set();
  for(const [key,value] of Object.entries(raw.stocks)){
    if(!allowedStocks.has(key))throw new Error(`Stock inconnu : « ${key} ». Utilise une clé de la référence d’import.`);
    if(value!==null&&!known(value))throw new Error(`Stock « ${key} » : indique un entier positif ou nul, ou null si inconnu.`);
    const target=allowedStocks.get(key);
    if(seenStocks.has(target))throw new Error(`Le stock « ${target} » apparaît sous plusieurs clés. Garde une seule quantité observée pour cet objet.`);
    seenStocks.add(target);if(value!==null)stocks[target]=value;
  }
  if(typeof model.initialPersonalState!=='function')throw new Error('Le mode de compte personnel est indisponible. Recharge la page.');
  const state=model.initialPersonalState(catalogue);
  if(own(raw,'username'))state.username=raw.username.trim();
  state.importedAt=new Date().toISOString();
  state.importNotes=[...(raw.notes||[])];
  state.stocks=stocks;
  for(const {n,form,progress} of observations)Object.assign(state.characters[n.id],progress,{unitId:form.client.unitId,stars:form.stars,owned:true,planned:form.stars<=model.CURRENT_MAX_STARS&&model.canPlanCharacter(n),progressEdited:true,ownedEdited:true,abilitiesEdited:true});
  return state;
}

/** Public reference generation reuses the importer's exact identities/caps. */
export function buildImportReference(catalogue,logos={},baseUrl='https://arosare.github.io/naruto-blazing-revival/'){
  const ninjas=model.catalogCharacters(catalogue),byId=new Map(ninjas.map(n=>[n.id,n])),stockMap=importStockKeyMap(catalogue);
  const imageUrl=value=>typeof value==='string'&&/^(client-images|client-logos|client-card-sprites|assets)\//.test(value)?new URL(value,baseUrl).href:null;
  const path=entry=>typeof entry==='string'?entry:entry?.path;
  const characters=ninjas.flatMap(n=>(n.forms||[]).map(form=>({familyId:n.id,name:n.name,title:n.title,titleFr:n.titleFr??null,cardNo:form.cardNo??null,stars:form.stars,element:form.element??n.element,unitId:form.client?.unitId,baseCap:baseCap(form),finalCap:finalCap(form),plusCaps:{hp:plusCap(form,'hp'),atk:plusCap(form,'atk'),speed:plusCap(form,'speed')},abilitiesCount:abilitiesCap(form),luckCap:luckCap(form),unlockedCaps:capsFor(n,form),imageURL:imageUrl(form.clientIcon||form.clientPortrait||form.portrait||n.clientIcon)}))).sort((a,b)=>a.unitId-b.unitId);
  const resources=(catalogue.clientMaterials||[]).map(material=>{
    const key=stockMap.get(`material:${material.id}`),info=model.resourceInfo(key,byId),entry=logos.materialsByUnitId?.[material.id]||logos.resourcesByStockKey?.[key];
    return {key,nativeUnitId:material.id,name:material.name,title:material.title??null,nameFr:/^(material|special):/.test(key)?`${material.name} ${material.stars}★`:info.name,rarity:material.stars,element:elementIds[material.elementId]??null,imageURL:imageUrl(path(entry)),aliases:[`material:${material.id}`,`special:${material.id}`].filter(alias=>alias!==key)};
  });
  const nativeKeys=new Set(resources.map(resource=>resource.key));
  for(const key of [...new Set(stockMap.values())].sort())if(!nativeKeys.has(key)){
    const info=model.resourceInfo(key,byId),[,familyId]=key.split(':');
    resources.push({key,nativeUnitId:null,name:info.name,title:info.subtitle,nameFr:info.name,rarity:/^crystal[1-7]:/.test(key)?Number(key[7]):null,element:info.element??null,imageURL:imageUrl(path(logos.resourcesByStockKey?.[key])||(key.startsWith('copies:')?byId.get(familyId)?.forms.at(-1)?.clientIcon:null)),aliases:[]});
  }
  return {format:'naruto-blazing-import-reference',version:1,clientVersion:logos.clientVersion??null,importFormat:PHOTO_BOX_FORMAT,importVersion:PHOTO_BOX_VERSION,characters,resources};
}
