import {calculateMaterialBudget} from './material-budget.js?v=20261014-public-import1';
import {calculatePillBudget} from './pill-budget.js?v=20261014-public-import1';
import {extraStockKeys,migrateMaterialStocks} from './material-recipes-map.js?v=20261014-public-import1';
import {optimizeRamen,RAMEN_MIX_OBJECTIVE,RAMEN_FARM_RATIO} from './ramen-optimizer.js?v=20261014-public-import1';
export const ELEMENTS = {Heart:{name:'Cœur',color:'#e85d5d',short:'CŒUR'},Skill:{name:'Technique',color:'#3c9d74',short:'TECHNIQUE'},Body:{name:'Corps',color:'#3787c8',short:'CORPS'},Bravery:{name:'Bravoure',color:'#bb921c',short:'BRAVOURE'},Wisdom:{name:'Sagesse',color:'#9564bc',short:'SAGESSE'}};
export const VERSION = 1;
export const STORAGE_KEY = 'arosa-blazing-collection-v1';
export const CURRENT_MAX_STARS = 6;
export const TOKENS_PER_CHARACTER_CRYSTAL = 1000;
export const RAMEN_BASE_EXPERIENCE = {1:2200,2:8000,3:34000,4:220000};
export const RAMEN_AWAKENING_RULE = {fromStars:3,toStars:4,inputCount:6,ryoCost:500,experienceBefore:204000,experienceAfter:220000,experienceGain:16000};
export const RAMEN_AWAKENING_RECIPES = [{from:1,to:2,inputCount:3,ryo:200},{from:2,to:3,inputCount:3,ryo:200},{from:3,to:4,inputCount:6,ryo:500}];
export const PILL_GAINS = {2:{hp:5,atk:2,speed:1},3:{hp:10,atk:4,speed:2}};
const priority = ['choji-akimichi-a-life-bet-on-two-wings','hiruzen-sarutobi-ninja-clothes','haku-a-frozen-heart','neji-hyuga-a-caged-bird','sasuke-uchiha-lone-survivor'];
const clone = x => JSON.parse(JSON.stringify(x));
const known = x => Number.isSafeInteger(x)&&x>=0;
const positive = x => Number.isFinite(x)&&x>0;
export function catalogCharacters(catalogue) {
  return [...new Map((catalogue.all||[...(catalogue.released||[]),...(catalogue.upcoming||[]),...(catalogue.clientOnly||[])]).map(n=>[n.id,n])).values()];
}
const finalCap = f => f.client?.finalCap??(f.limitBreak?f.maxLvLb:f.maxLv);
const baseCap = f => f.client?.baseCap??f.maxLv;
const abilityCount = f => f.abilities?.length??f.client?.abilityCount??0;
const pillCap = (f,k) => f.client&&Object.hasOwn(f.client,'pillCaps')?f.client.pillCaps?.[k]??null:f.stats?.plusValues?.[k]??null;
const luckCap = f => f.client&&Object.hasOwn(f.client,'luckCap')?f.client.luckCap:f.luck?.max??null;
const currentForm = (n,p) => (known(p.unitId)?n.forms.find(f=>f.client?.unitId===p.unitId):null)||n.forms.find(f=>f.stars===p.stars);
export function planningCharacter(n,maxStars=CURRENT_MAX_STARS){
  const included=n.forms.filter(f=>f.stars<=maxStars);if(!included.length)return null;if(included.length===n.forms.length)return n;
  const forms=included.map((f,i)=>i===included.length-1?{...f,awakening:null}:f),last=forms.at(-1),steps=last.client?.limitBreakSteps||[];
  const rec=steps.length?{...(n.maxing?.limitBreak||{}),steps,source:'client',clientVerified:true}:null;
  const result={...n,forms,maxStars:last.stars,maxing:{...n.maxing,targetLevel:finalCap(last),limitBreak:rec,trainingExp:last.client?.experienceRequiredFromLevel1??null},planningMaxStars:maxStars};
  const stocks={};for(const craft of rec?.crystalAwakenings||[])stocks[craft.outputStockKey||`crystal6:${n.id}`]=0;
  const raw=planFor(result,{stars:last.stars,unitId:last.client?.unitId,level:baseCap(last),xp:0,unlockedCap:baseCap(last)},{stocks,goals:{level:true,abilities:false,pills:false,luck:false},craft:true,prudent:false,training:{ramenStars:4,sameElement:true,campaignMultiplier:1,successMultiplier:1}});
  result.maxing.limitBreakFromRawCrystals={requirements:Object.fromEntries(Object.entries(raw.requirements).filter(([key])=>key!=='ryo'&&!key.startsWith('ramen:'))),ryo:raw.requirements.ryo||0};
  return result;
}
const announcedCharacter=n=>(n?.availabilityKind??n?.availability)==='upcoming'||n?.upcoming===true;
export function canPlanCharacter(n){
  const availability=n?.availabilityKind??n?.availability;
  return !!n?.forms?.some(f=>f.stars<=CURRENT_MAX_STARS)&&(['released','upcoming'].includes(availability)||n.currentAvailabilityConfirmed===true);
}
// A wish-list entry has no account progress. Its forecast uses a fresh first
// form without writing those assumptions into the saved character record.
export function planningProgress(n,p={}){
  if(p.owned)return p;
  const first=planningCharacter(n)?.forms[0];if(!first)return {...p};
  return {...p,stars:first.stars,unitId:first.client?.unitId,level:1,xp:0,unlockedCap:baseCap(first),hp:0,atk:0,speed:0};
}
export function freshProgress(n, abilities=0) {
  const isClientOnly=n.availability==='client_only'||n.availabilityKind==='client_only'||n.availabilityStatus==='client_only';
  return {owned:false,abilities:abilities===null||isClientOnly&&abilities===0?null:Math.min(abilities,abilityCount(n.forms.at(-1))),stars:null,level:null,xp:null,unlockedCap:null,copyLuck:null,luck:isClientOnly?null:10,hp:isClientOnly?null:0,atk:isClientOnly?null:0,speed:isClientOnly?null:0,planned:false,priority:50,ownedEdited:false,abilitiesEdited:false};
}
function zeroProgress(n){
  const start=planningCharacter(n)?.forms[0]||n.forms[0];
  return {stars:start.stars,unitId:start.client?.unitId,level:0,xp:0,abilities:0,hp:0,atk:0,speed:0,luck:0};
}
const unknownGiftProgress=()=>({stars:null,unitId:null,level:null,xp:null,unlockedCap:null,copyLuck:null,abilities:null,luck:null,hp:null,atk:null,speed:null});
export function applyConfirmedGifts(state,profile,catalogue){
  if(state.accountMode==='personal')return state;
  const applied=new Set(Array.isArray(state.appliedGiftIds)?state.appliedGiftIds.filter(id=>typeof id==='string'&&id.length>0&&id.length<=150):[]);
  const byId=new Map(catalogCharacters(catalogue).map(n=>[n.id,n]));
  for(const gift of profile.confirmedGifts||[]){
    if(!gift||typeof gift.id!=='string'||!gift.id||gift.id.length>150||!byId.has(gift.ninjaId))continue;
    const n=byId.get(gift.ninjaId),p=state.characters[gift.ninjaId]??(state.characters[gift.ninjaId]=freshProgress(n));
    if(applied.has(gift.id)){p.confirmedGiftId=gift.id;continue;}
    if(!p.owned){
      Object.assign(p,unknownGiftProgress(),{owned:true,planned:true});
      const observation=gift.progress,form=n.forms.find(f=>f.client?.unitId===observation?.unitId);
      if(form&&observation.stars===form.stars&&known(observation.level)&&observation.level>=1&&observation.level<=finalCap(form)){
        Object.assign(p,{unitId:form.client.unitId,stars:form.stars,level:observation.level});
        if(observation.unlockedCap===baseCap(form)&&observation.level<=baseCap(form))p.unlockedCap=baseCap(form);
      }
    }
    Object.assign(p,{ownedEdited:true,confirmedGiftId:gift.id});applied.add(gift.id);
  }
  state.appliedGiftIds=[...applied];return state;
}
export function initialState(catalogue, profile, {applyGifts=true}={}) {
  const giftNinjas=new Set((profile.confirmedGifts||[]).map(g=>g.ninjaId));
  const ninjas=catalogCharacters(catalogue),byId=new Map(ninjas.map(n=>[n.id,n])),characters = Object.fromEntries(ninjas.map(n=>[n.id,{...freshProgress(n),...(giftNinjas.has(n.id)?unknownGiftProgress():{})}]));
  for(const row of profile.collection||[]){const p=characters[row.ninja_id];if(p)Object.assign(p,{owned:true,planned:true,abilities:row.abilities});}
  // Photo additions need the same zero initialization as an explicitly added
  // character, even though their collection rows already mark them owned.
  for(const id of profile.snapshot?.newCharacterIds||[])if(characters[id]?.owned&&byId.has(id))Object.assign(characters[id],zeroProgress(byId.get(id)));
  for(const[id,value]of Object.entries(profile.snapshot?.progress||{}))if(characters[id]?.owned)Object.assign(characters[id],value,{capture:true});
  priority.forEach((id,i)=>{if(characters[id])characters[id].priority=i+1;});
  const stocks=Object.fromEntries(resourceStockKeys(catalogCharacters(catalogue)).map(key=>[key,0]));
  const state={version:VERSION,username:'Arosa',importedAt:profile.importedAt,characters,stocks,stockDefaultsApplied:true,appliedGiftIds:[],goals:{level:true,abilities:true,pills:true,luck:true},strategy:'copies',prudent:true,craft:true,training:{ramenStars:4,mixedRamen:true,sameElement:true,campaignMultiplier:1,successMultiplier:1,awakenRamen:true,awakenScrolls:true,awakenMaterials:true}};
  applyAccountSnapshot(state,profile,catalogue);return applyGifts?applyConfirmedGifts(state,profile,catalogue):state;
}
export function initialPersonalState(catalogue){
  const state=initialState(catalogue,{collection:[]},{applyGifts:false});
  const stocks=Object.fromEntries(resourceStockKeys(catalogCharacters(catalogue)).map(key=>[key,0]));
  Object.assign(state,{accountMode:'personal',username:'Ma box',stocks,stockDefaultsApplied:true,importNotes:[]});
  for(const p of Object.values(state.characters))Object.assign(p,unknownGiftProgress(),{owned:false,planned:false});
  return state;
}
export function applyAccountSnapshot(state,profile,catalogue){
  if(state.accountMode==='personal')return state;
  const revision=profile.accountSnapshot?.revision??profile.snapshot?.importRevision;
  if(!revision||state.appliedAccountImportRevision===revision)return state;
  const byId=new Map(catalogCharacters(catalogue).map(n=>[n.id,n])),visible=new Set();
  const normalUltimateSpeedBounds=new Map((profile.snapshot?.cards||[]).filter(card=>card.ultimateObserved===true&&card.ultimateVariant==='normal'&&known(card.speedUpperExclusive)&&card.speedUpperExclusive>0&&known(card.unitId)).map(card=>[`${card.ninjaId||card.ninja_id}:${card.unitId}`,card.speedUpperExclusive]));
  for(const[key,amount]of Object.entries(migrateMaterialStocks(profile.snapshot?.stocks||{})))if(known(amount))state.stocks[key]=amount;
  for(const[id,data]of Object.entries(profile.snapshot?.progress||{})){
    const n=byId.get(id);if(!n||!data||typeof data!=='object')continue;visible.add(id);
    const prior=state.characters[id],newlyOwned=!prior?.owned,entry=prior||freshProgress(n);
    if(newlyOwned)Object.assign(entry,zeroProgress(n),{planned:true});
    Object.assign(entry,{owned:true,ownedEdited:true,capture:true});
    for(const key of ['unitId','stars','level','xp','abilities','hp','atk','speed','luck'])if(known(data[key]))entry[key]=data[key];
    if(known(data.unitId)){const form=n.forms.find(f=>f.client?.unitId===data.unitId);if(form)entry.stars=form.stars;}
    const speedUpperExclusive=normalUltimateSpeedBounds.get(`${id}:${entry.unitId}`);
    if(known(speedUpperExclusive)&&known(entry.speed)&&entry.speed>=speedUpperExclusive){entry.speed=null;entry.speedContradictedByAccountImportRevision=revision;}
    if(known(data.abilities))entry.abilitiesEdited=true;
    if(typeof data.portrait==='string')entry.portrait=data.portrait;
    entry.accountImportRevision=revision;state.characters[id]=entry;
  }
  const appliedGifts=new Set(state.appliedGiftIds||[]),giftNinjas=new Set((profile.confirmedGifts||[]).filter(g=>appliedGifts.has(g.id)).map(g=>g.ninjaId));
  if(profile.accountSnapshot?.inventoryComplete===true||profile.snapshot?.inventoryComplete===true)for(const[id,entry]of Object.entries(state.characters))if(!visible.has(id)&&!giftNinjas.has(id)&&!appliedGifts.has(entry.confirmedGiftId))entry.owned=false;
  state.appliedAccountImportRevision=revision;return state;
}
export function validateBackup(raw, catalogue, profile) {
  if(!raw||raw.version!==VERSION||!raw.characters||typeof raw.characters!=='object'||Array.isArray(raw.characters)||!raw.stocks||typeof raw.stocks!=='object'||Array.isArray(raw.stocks))throw new Error('Ce fichier n’est pas une sauvegarde de cette collection.');
  const personal=raw.accountMode==='personal'||profile?.publicDefaults===true,importedStocks=migrateMaterialStocks(raw.stocks),state=personal?initialPersonalState(catalogue):initialState(catalogue,profile,{applyGifts:false});
  state.appliedGiftIds=personal?[]:[...new Set(Array.isArray(raw.appliedGiftIds)?raw.appliedGiftIds.filter(id=>typeof id==='string'&&id.length>0&&id.length<=150):[])];
  if(personal&&typeof raw.username==='string'&&raw.username.trim()&&raw.username.length<=100)state.username=raw.username.trim();
  if(personal)state.importNotes=Array.isArray(raw.importNotes)?raw.importNotes.filter(note=>typeof note==='string'&&note.length<=2000).slice(0,200):[];
  if(raw.stockDefaultsApplied===true)state.stocks={};
  for(const n of catalogCharacters(catalogue)){
    const p=raw.characters[n.id];if(!p||typeof p!=='object')continue;
    const q=state.characters[n.id],last=n.forms.at(-1),newlyCaptured=q.owned&&!p.owned&&!p.ownedEdited;
    if(state.appliedGiftIds.includes(p.confirmedGiftId)&&(profile.confirmedGifts||[]).some(g=>g.id===p.confirmedGiftId&&g.ninjaId===n.id))q.confirmedGiftId=p.confirmedGiftId;
    for(const field of ['owned','planned','ownedEdited','abilitiesEdited','progressEdited'])if(typeof p[field]==='boolean'&&!(newlyCaptured&&['owned','planned'].includes(field)))q[field]=p[field];
    if(p.capture===true)q.capture=true;
    if(typeof p.speedContradictedByAccountImportRevision==='string'||Number.isSafeInteger(p.speedContradictedByAccountImportRevision))q.speedContradictedByAccountImportRevision=p.speedContradictedByAccountImportRevision;
    const caps={abilities:abilityCount(last),level:Math.max(...n.forms.map(finalCap)),luck:luckCap(last)??999,hp:pillCap(last,'hp')??99999,atk:pillCap(last,'atk')??99999,speed:pillCap(last,'speed')??99999,priority:999};
    // Explicit progress, including zero, survives; empty legacy fields retain captured values.
    for(const[k,max]of Object.entries(caps))if(k==='abilities'&&newlyCaptured&&!p.abilitiesEdited)continue;else if(p[k]===null&&(k==='abilities'||p.progressEdited&&k!=='priority'||k==='speed'&&q.speedContradictedByAccountImportRevision))q[k]=null;else if(known(p[k])&&p[k]<=max)q[k]=p[k];
    if(n.forms.some(f=>f.stars===p.stars))q.stars=p.stars;
    if(p.progressEdited&&p.stars===null)q.stars=null;
    if(known(p.unitId)&&n.forms.some(f=>f.client?.unitId===p.unitId))q.unitId=p.unitId;
    if(p.progressEdited&&p.unitId===null)q.unitId=null;
    if(known(p.xp))q.xp=p.xp;
    if(p.xp===null&&!newlyCaptured)q.xp=null;
    if(known(p.copyLuck)&&p.copyLuck>0&&p.copyLuck<=99)q.copyLuck=p.copyLuck;
    // The old inferred 'unlocked' field never proves a purchased Limit Break cap.
    const form=currentForm(n,q);
    const currentSteps=form?.client?.limitBreakSteps||(form===last?n.maxing?.limitBreak?.steps:[])||[];
    if(form&&known(p.unlockedCap)&&p.unlockedCap>=baseCap(form)&&p.unlockedCap<=finalCap(form)&&p.unlockedCap>=(q.level??0)&&[baseCap(form),...currentSteps.map(s=>s.to)].includes(p.unlockedCap))q.unlockedCap=p.unlockedCap;
    if(!personal&&announcedCharacter(n))q.owned=false;
    if(!canPlanCharacter(n)||personal&&known(q.stars)&&q.stars>CURRENT_MAX_STARS)q.planned=false;
  }
  const stockPattern=/^(ryo|tokens|stone|shard|pill:(hp|atk|speed):[1-4]|ramen:(Heart|Skill|Body|Bravery|Wisdom):[1-4]|scroll:(Heart|Skill|Body|Bravery|Wisdom):[1-4]|element:(Heart|Skill|Body|Bravery|Wisdom)|crystal[1-7]:[a-z0-9-]+|copies:[a-z0-9-]+|material:[0-9]+|special:.{1,150})$/;
  for(const[k,v]of Object.entries(importedStocks))if(stockPattern.test(k)){if(known(v))state.stocks[k]=v;else if(v===null)delete state.stocks[k];}
  for(const k of Object.keys(state.goals))if(typeof raw.goals?.[k]==='boolean')state.goals[k]=raw.goals[k];
  if(['copies','stones'].includes(raw.strategy))state.strategy=raw.strategy;
  for(const k of ['prudent','craft'])if(typeof raw[k]==='boolean')state[k]=raw[k];
  if(typeof raw.importedAt==='string')state.importedAt=raw.importedAt;
  if(!personal&&(typeof raw.appliedAccountImportRevision==='string'||Number.isSafeInteger(raw.appliedAccountImportRevision)))state.appliedAccountImportRevision=raw.appliedAccountImportRevision;else delete state.appliedAccountImportRevision;
  if(raw.training&&typeof raw.training==='object'){
    if([1,2,3,4].includes(raw.training.ramenStars))state.training.ramenStars=raw.training.ramenStars;
    if(typeof raw.training.sameElement==='boolean')state.training.sameElement=raw.training.sameElement;
    if(typeof raw.training.awakenRamen==='boolean')state.training.awakenRamen=raw.training.awakenRamen;
    if(typeof raw.training.awakenScrolls==='boolean')state.training.awakenScrolls=raw.training.awakenScrolls;
    if(typeof raw.training.awakenMaterials==='boolean')state.training.awakenMaterials=raw.training.awakenMaterials;
    if(typeof raw.training.mixedRamen==='boolean')state.training.mixedRamen=raw.training.mixedRamen;
    for(const k of ['campaignMultiplier','successMultiplier'])if(positive(raw.training[k])&&raw.training[k]<=10)state.training[k]=raw.training[k];
  }
  applyAccountSnapshot(state,profile,catalogue);return applyConfirmedGifts(state,profile,catalogue);
}
export function enhancementRyo(level,itemCount,campaignMultiplier=1){
  return known(level)&&level>=1&&known(itemCount)&&positive(campaignMultiplier)?100*level*itemCount*campaignMultiplier:null;
}
function itemKey(key,n){
  if(/^scroll[1-4]$/.test(key))return `scroll:${n.element}:${key.slice(-1)}`;
  return ({elemental:`element:${n.element}`,own5:`crystal5:${n.id}`,own6:`crystal6:${n.id}`,ultimate:'special:Cristal Ultimate'})[key]||(key.startsWith('special:')||key.startsWith('material:')?key:`special:${key}`);
}
function sumExperience(form,from,to){
  if(from>=to)return 0;
  const rows=form.client?.expByLevel;if(!Array.isArray(rows))return null;
  const byLevel=new Map(rows.map(r=>[r.level,r.experienceToNext]));let total=0;
  for(let l=from;l<to;l++){if(!known(byLevel.get(l)))return null;total+=byLevel.get(l);}
  return total;
}
function trainingFor(n,p,current,uncertain){
  const stages=[],forms=n.forms,start=current?n.forms.indexOf(current):0;
  let priorLevel=null,subsequentLevelKnown=true;
  for(let i=start;i<forms.length;i++){
    const f=forms[i],last=i===forms.length-1;
    // Evolution is already available above the base cap: never train an existing
    // level-105/125 intermediate form a second time from level one to level 100.
    const alreadyPastAwakeningCap=!last&&i===start&&known(p.level)&&p.level>=baseCap(f)&&p.level<=finalCap(f);
    const to=last?finalCap(f):alreadyPastAwakeningCap?p.level:baseCap(f);
    let from=i===start?(known(p.level)&&p.level>=1&&p.level<=to?p.level:1):1;
    // Blazing awakening keeps the level. Ordinary awakening starts again at 1.
    if(i>start&&forms[i-1].client?.awakeningResetsLevel===false)from=Math.min(priorLevel??1,to);
    if(i>start&&forms[i-1].client?.awakeningResetsLevel===null){subsequentLevelKnown=false;uncertain.add('réinitialisation du niveau après éveil non confirmée');}
    const levelKnown=i!==start?subsequentLevelKnown:!!current&&known(p.level)&&p.level>=1&&p.level<=to;
    const xpKnown=i!==start||from===to||known(p.xp);
    const xp=i===start&&known(p.xp)?p.xp:0;
    const next=f.client?.expByLevel?.find(r=>r.level===from)?.experienceToNext;
    const xpValid=from===to||xpKnown&&known(next)&&xp<next;
    if(i===start&&from<to&&xpKnown&&!xpValid)uncertain.add('EXP dans le niveau invalide');
    const exact=levelKnown&&xpKnown&&xpValid;
    let boundaries=[to];
    if(last&&n.maxing?.limitBreak?.steps?.length){
      const caps=[baseCap(f),...n.maxing.limitBreak.steps.map(s=>s.to)];
      const unlocked=current===f&&known(p.unlockedCap)&&p.unlockedCap>=from&&caps.includes(p.unlockedCap)?p.unlockedCap:baseCap(f);
      boundaries=[...n.maxing.limitBreak.steps.map(s=>s.to).filter(cap=>cap>Math.max(from,unlocked)&&cap<to),to];
      if(unlocked>from&&unlocked<to)boundaries.unshift(unlocked);
    }
    // Base cap also discards overflow before the first Limit Break.
    if(last&&from<baseCap(f)&&baseCap(f)<to&&!(current===f&&known(p.unlockedCap)&&p.unlockedCap>baseCap(f)))boundaries.unshift(baseCap(f));
    boundaries=[...new Set(boundaries)].sort((a,b)=>a-b);
    let segmentFrom=from;
    for(const segmentTo of boundaries){
      if(segmentTo<segmentFrom)continue;
      const sum=sumExperience(f,segmentFrom,segmentTo),subtract=segmentFrom===from&&xpValid&&levelKnown?xp:0;
      const upper=sum===null?null:Math.max(0,sum-subtract);
      stages.push({unitId:f.client?.unitId??null,stars:f.stars,fromLevel:segmentFrom,toLevel:segmentTo,xpKnown:segmentFrom===from?xpKnown:true,experienceNeeded:exact?upper:null,experienceUpperBound:upper});
      segmentFrom=segmentTo;
    }
    priorLevel=to;
  }
  if(stages.some(s=>s.experienceNeeded===null))uncertain.add('EXP restante / niveau actuel');
  if(current&&stages[0]?.fromLevel<stages[0]?.toLevel&&!known(p.xp))uncertain.add('EXP dans le niveau actuel');
  const sum=(key)=>stages.every(s=>known(s[key]))?stages.reduce((a,s)=>a+s[key],0):null;
  return {experienceNeeded:sum('experienceNeeded'),experienceUpperBound:sum('experienceUpperBound'),stages,ramen:null,enhancementRyoIncluded:false};
}
export function planFor(n,p,state) {
  const last=n.forms.at(-1),target=finalCap(last),req={},uncertain=new Set(),notes=[],uncertainKeys=new Set(),stockReservations={};
  const add=(key,q,isExact=true)=>{if(positive(q))req[key]=(req[key]||0)+q;if(!isExact)uncertainKeys.add(key);};
  const current=currentForm(n,p);
  const startIndex=current?n.forms.indexOf(current):0;
  let capKnown=true,training={experienceNeeded:0,experienceUpperBound:0,stages:[],ramen:null,enhancementRyoIncluded:false};
  if(state.goals.level){
    if(!current)uncertain.add('forme actuelle');
    if(!known(p.level)||p.level<1)uncertain.add('niveau actuel');
    for(let i=startIndex;i<n.forms.length-1;i++){
      const f=n.forms[i];if(!f.awakening)continue;
      const cost=f.client?.awakeningRyo??({3:9000,4:20000,5:28000})[f.stars];
      if(known(cost))add('ryo',cost,!!current);else{uncertain.add('ryō d’éveil');uncertainKeys.add('ryo');}
      for(const m of f.awakening.materials||[])add(m.stockKey||(m.kind==='scroll'?`scroll:${m.element||n.element}:${m.stars}`:`special:${m.name}`),m.count,!!current);
    }
    const rec=n.maxing?.limitBreak;
    if(rec?.steps?.length){
      const base=baseCap(last),isFinal=current===last,shown=known(p.level)?p.level:base;
      const explicit=isFinal&&known(p.unlockedCap)&&p.unlockedCap>=shown&&[base,...rec.steps.map(s=>s.to)].includes(p.unlockedCap);
      const evolutionUnknown=!isFinal&&n.forms.slice(startIndex,-1).some(f=>f.client?.awakeningResetsLevel===null);
      capKnown=(!isFinal||shown>=target||explicit)&&!evolutionUnknown;
      const minimumProven=Math.max(base,[base,...rec.steps.map(s=>s.to)].find(x=>x>=shown)??target);
      const cap=!isFinal?base:shown>=target?target:explicit?p.unlockedCap:minimumProven;
      if(!capKnown)uncertain.add('plafond LB débloqué');
      const steps=rec.steps.filter(s=>s.to>cap),items={};
      for(const step of steps){
        add('ryo',step.ryo,capKnown&&!!current);
        const precise=step.requirements||Object.fromEntries(Object.entries(step.items||{}).map(([k,v])=>[itemKey(k,n),v]));
        for(const[k,v]of Object.entries(precise))items[k]=(items[k]||0)+v;
      }
      const crafts=rec.crystalAwakenings|| (rec.crystalAwakening?[rec.crystalAwakening]:[]),craftUnknownKeys=new Set();
      if(state.craft)for(const craft of crafts){
        const output=craft.outputStockKey||`crystal6:${n.id}`,needed=items[output]||0;if(!needed)continue;
        const stock=stockFor(output,state.stocks),use=stock===null?0:Math.min(needed,stock),make=needed-use,craftExact=stock!==null;
        if(use)stockReservations[output]=(stockReservations[output]||0)+use;
        if(!craftExact)uncertain.add('cristaux perso 6★ en stock pour la fabrication');
        // A recipe's inputs include its base crystal, plus its listed awakening materials.
        const inputs=craft.inputRequirements||Object.fromEntries([[`crystal5:${n.id}`,(craft.own5??0)+1],...[1,2,3,4].filter(s=>craft[`scroll${s}`]).map(s=>[`scroll:${n.element}:${s}`,craft[`scroll${s}`]])]);
        items[output]=use;
        for(const[k,v]of Object.entries(inputs)){items[k]=(items[k]||0)+make*v;if(!craftExact)craftUnknownKeys.add(k);}
        add('ryo',make*(craft.ryo??500),capKnown&&craftExact&&!!current);
        if(make)notes.push(`${make} cristaux perso 6★ à fabriquer${craftExact?'':' si aucun n’est déjà en stock'} ; leurs cristaux 5★ sont inclus une seule fois.`);
        // The decoded client confirms 16, replacing the former community margin of 1.
        if(state.prudent&&steps.length&&n.maxing?.conflicts?.length&&!rec.clientVerified&&rec.source!=='client'){
          const key=`scroll:${n.element}:3`;items[key]=(items[key]||0)+1;notes.push('Marge communautaire de 1 parchemin 3★ ; recette client non validée.');
        }
      }
      for(const[k,v]of Object.entries(items))add(k,v,capKnown&&!!current&&!craftUnknownKeys.has(k));
    }
    training=trainingFor(n,p,current,uncertain);
    const choice={ramenStars:4,sameElement:true,campaignMultiplier:1,successMultiplier:1,...state.training};
    const base=RAMEN_BASE_EXPERIENCE[choice.ramenStars];
    if(base&&positive(choice.campaignMultiplier)&&positive(choice.successMultiplier)){
      const effective=base*(choice.sameElement?1.5:1)*choice.campaignMultiplier*choice.successMultiplier;
      const exact=training.experienceNeeded!==null&&capKnown;
      const count=training.stages.every(s=>known(s.experienceUpperBound))?training.stages.reduce((a,s)=>a+Math.ceil(s.experienceUpperBound/effective),0):null;
      const supplied=count===null?null:count*effective;
      training.ramen={stars:choice.ramenStars,element:choice.sameElement?n.element:null,baseExperience:base,sameElement:choice.sameElement,campaignMultiplier:choice.campaignMultiplier,successMultiplier:choice.successMultiplier,effectiveExperience:effective,count:exact?count:null,countUpperBound:count,wastedExperience:exact&&supplied!==null?supplied-training.experienceNeeded:null,assumptions:['Fusion uniquement de ramen de la rareté choisie','Chaque éveil et chaque palier LB limite l’EXP conservée',`Bonus même élément : ×${choice.sameElement?1.5:1}`,`Campagne EXP : ×${choice.campaignMultiplier} ; succès : ×${choice.successMultiplier}`]};
      if(count!==null&&choice.sameElement)add(`ramen:${n.element}:${choice.ramenStars}`,count,exact);
      if(count&&!choice.sameElement)notes.push('Ramen d’un autre élément : équivalent indiqué, sans déduire de stock tant que l’élément utilisé n’est pas choisi.');
      if(count)notes.push('Ramen calculés sous les hypothèses indiquées, en arrondissant à chaque plafond. Le ryō de fusion dépend de l’ordre des opérations et n’est pas inclus.');
    }
  }
  const abilitiesKnown=known(p.abilities),abilities=Math.max(0,abilityCount(last)-(abilitiesKnown?p.abilities:0));
  if(state.goals.abilities&&!abilitiesKnown)uncertain.add('capacités actuelles');
  const luckMax=luckCap(last),luckPerCopy=positive(p.copyLuck)?p.copyLuck:last.client?.freshCopyLuck??last.luck?.min;
  let luckCopies=0,luckExact=true;
  if(state.goals.luck){
    const alreadyCapped=known(p.luck)&&known(luckMax)&&p.luck>=luckMax;
    luckExact=known(p.luck)&&known(luckMax)&&(alreadyCapped||positive(p.copyLuck));
    if(!known(p.luck))uncertain.add('chance actuelle');
    if(!known(luckMax))uncertain.add('plafond de chance');
    if(!positive(luckPerCopy))uncertain.add('chance apportée par un doublon frais');
    if(!alreadyCapped&&!positive(p.copyLuck))uncertain.add('chance réelle par doublon à renseigner');
    luckCopies=alreadyCapped?0:known(luckMax)&&positive(luckPerCopy)?Math.ceil(Math.max(0,luckMax-(known(p.luck)?p.luck:luckPerCopy))/luckPerCopy):null;
    if(luckCopies&&positive(luckPerCopy))notes.push(`Chance : ${positive(p.copyLuck)?'calcul avec':'référence avec'} ${luckPerCopy} point${luckPerCopy>1?'s':''} par doublon frais${positive(p.copyLuck)?'.':' ; renseigner la chance réelle de vos doublons pour un manque exact.'}`);
  }
  const copiesExact=(!state.goals.abilities||abilitiesKnown)&&(!state.goals.luck||luckExact);
  if(state.goals.abilities&&state.strategy==='stones'){
    const stock=stockFor(`copies:${n.id}`,state.stocks),stockKnown=stock!==null;
    const use=Math.max(luckCopies??0,stockKnown?Math.min(stock,abilities):0);
    add(`copies:${n.id}`,use,copiesExact);
    add('stone',Math.max(0,abilities-use),abilitiesKnown&&stockKnown);
    if(!stockKnown&&abilities>use)uncertain.add('doublons en stock utilisables pour les capacités');
  }else add(`copies:${n.id}`,Math.max(state.goals.abilities?abilities:0,luckCopies??0),copiesExact);
  if(state.goals.pills)for(const[k,boost]of Object.entries(PILL_GAINS[3])){
    const cap=pillCap(last,k),exact=known(p[k])&&known(cap);
    if(!known(p[k]))uncertain.add(`pilules ${k==='hp'?'PV':k==='atk'?'ATK':'vitesse'} appliquées`);
    if(!known(cap)){uncertain.add(`plafond de pilules ${k}`);uncertainKeys.add(`pill:${k}:3`);continue;}
    add(`pill:${k}:3`,Math.ceil(Math.max(0,cap-(known(p[k])?p[k]:0))/boost),exact);
  }
  return {id:n.id,requirements:req,requirementsExact:uncertainKeys.size===0,uncertainResourceKeys:[...uncertainKeys],unknownRequirements:[...uncertainKeys],uncertain:[...uncertain],notes,target,abilitiesRemaining:abilitiesKnown?abilities:null,luckCopies,limitBreakCapKnown:capKnown,stockReservations,training};
}
export function stockFor(key,stocks) {
  if(key==='stone'){
    if(!known(stocks.stone))return null;
    // Unentered shards may add stones, so the available total remains unknown.
    if(!known(stocks.shard))return null;
    return stocks.stone+Math.floor(stocks.shard/6);
  }
  return known(stocks[key])?stocks[key]:null;
}
export function resourceBudget(requirements,stocks) {
  const resources={...requirements},copiesNeeded={};let crystalsToBuy=0,crystalsKnown=true,tokenEstimate=0;
  for(const[key,needed]of Object.entries(requirements)){
    const stock=stockFor(key,stocks);
    if(key.startsWith('copies:'))copiesNeeded[key.slice(7)]=stock===null?null:Math.max(0,needed-stock);
    if(/^crystal[1-7]:/.test(key)){
      tokenEstimate+=needed*TOKENS_PER_CHARACTER_CRYSTAL;
      if(stock===null)crystalsKnown=false;else crystalsToBuy+=Math.max(0,needed-stock);
    }
  }
  // Retain material rows: a blank crystal stock never becomes a purchase of the full amount.
  if(crystalsKnown&&crystalsToBuy)resources.tokens=(resources.tokens||0)+crystalsToBuy*TOKENS_PER_CHARACTER_CRYSTAL;
  return {requirements:resources,copiesNeeded,crystalsToBuy:crystalsKnown?crystalsToBuy:null,tokenEstimate,crystalStocksKnown:crystalsKnown};
}
export function aggregatePlan(ninjas,state) {
  const selected=ninjas.filter(n=>state.characters[n.id]?.owned&&state.characters[n.id]?.planned).sort((a,b)=>state.characters[a.id].priority-state.characters[b.id].priority||a.name.localeCompare(b.name));
  const planningStocks={...state.stocks};
  const plans=selected.map(n=>{
    const p=planFor(n,state.characters[n.id],{...state,stocks:planningStocks});
    for(const[key,used]of Object.entries(p.stockReservations))if(known(planningStocks[key]))planningStocks[key]=Math.max(0,planningStocks[key]-used);
    return {...p,budget:resourceBudget(p.requirements,state.stocks)};
  });
  const requirements={},users={},uncertainKeys=new Set();
  for(const p of plans){
    for(const k of p.uncertainResourceKeys)uncertainKeys.add(k);
    if(p.uncertainResourceKeys.some(k=>/^crystal[1-7]:/.test(k)))uncertainKeys.add('tokens');
    for(const[k,v]of Object.entries(p.requirements)){requirements[k]=(requirements[k]||0)+v;(users[k]??=[]).push(p.id);}
  }
  const globalBudget=resourceBudget(requirements,state.stocks);
  if(globalBudget.requirements.tokens){requirements.tokens=globalBudget.requirements.tokens;users.tokens=plans.filter(p=>Object.keys(p.requirements).some(k=>/^crystal[1-7]:/.test(k))).map(p=>p.id);}
  const rows=Object.entries(requirements).map(([key,needed])=>{const stock=stockFor(key,state.stocks),exact=!uncertainKeys.has(key);return {key,needed,stock,exact,missing:stock===null||!exact?null:Math.max(0,needed-stock),users:users[key]};});
  return {selected,plans,requirements,rows,crystalsToBuy:uncertainKeys.has('tokens')?null:globalBudget.crystalsToBuy,tokenEstimate:globalBudget.tokenEstimate,uncertain:plans.filter(p=>p.uncertain.length).length,stockUnknown:rows.filter(r=>r.stock===null).length,experienceNeeded:plans.every(p=>p.training.experienceNeeded!==null)?plans.reduce((a,p)=>a+p.training.experienceNeeded,0):null,experienceUpperBound:plans.every(p=>p.training.experienceUpperBound!==null)?plans.reduce((a,p)=>a+p.training.experienceUpperBound,0):null};
}
function mixTraining(n,training,options){
  const counts={1:0,2:0,3:0,4:0};let supplied=0,waste=0,allSupported=true,allKnown=true,allExactPossible=true,feedCount=0,rawCost=0;
  const stages=training.stages.map(stage=>{
    const target=stage.experienceNeeded??stage.experienceUpperBound,mix=optimizeRamen(target,options),isKnown=stage.experienceNeeded!==null&&mix.supported;
    allSupported&&=mix.supported;allKnown&&=isKnown;allExactPossible&&=!!mix.exactPossible;
    for(const star of [1,2,3,4])counts[star]+=mix.counts[star]||0;
    supplied+=mix.providedExp||0;waste+=mix.unavoidableWaste||0;feedCount+=mix.feedCount||0;rawCost+=mix.rawInputEquivalent||0;
    return {...stage,mix:{...mix,known:isKnown},id:n.id,name:n.name,title:n.title,experienceNeeded:stage.experienceNeeded,experienceReference:target,providedExperience:isKnown?mix.providedExp:null,providedExperienceReference:mix.providedExp,wastedExperience:isKnown?mix.unavoidableWaste:null,wastedExperienceReference:mix.unavoidableWaste,counts:mix.counts,exactPossible:isKnown?mix.exactPossible:null,known:isKnown};
  });
  return {...training,stages,ramen:{mixed:true,allowedFeedingStars:[3,4],farmRatio:{...RAMEN_FARM_RATIO},objective:RAMEN_MIX_OBJECTIVE.slice(),counts:allSupported&&allKnown?counts:null,countsReference:counts,providedExperience:allSupported&&allKnown?supplied:null,providedExperienceReference:allSupported?supplied:null,wastedExperience:allSupported&&allKnown?waste:null,wastedExperienceReference:allSupported?waste:null,unavoidableWaste:allSupported&&allKnown?waste:null,exactPossible:allSupported&&allKnown?allExactPossible:null,supported:allSupported,count:allSupported&&allKnown?feedCount:null,feedCount:allSupported&&allKnown?feedCount:null,rawInputEquivalent:allSupported&&allKnown?rawCost:null,sameElement:options.sameElement!==false,campaignMultiplier:options.campaignMultiplier??1,successMultiplier:options.successMultiplier??1,stages,assumptions:['Calcul depuis le début du niveau affiché','Entraînement uniquement avec des ramen 3★ et 4★, séparément à chaque plafond','Ratio de farm estimé par le joueur : 1 ramen 4★ pour 2 ramen 3★, sans minimisation du surplus','Les ramen 1★/2★ servent seulement aux éveils ; le farm et les stocks particuliers ne sont pas optimisés']}};
}
export function resourcePlanFor(n,p,state){
  const forecast=!p?.owned,announced=forecast&&announcedCharacter(n);
  const planned=planningCharacter(n);if(!planned)return {id:n.id,forecast,announced,unavailableTarget:true,target:null,requirements:{},uncertain:[],uncertainResourceKeys:[],unknownRequirements:[],requirementsExact:true,notes:['Aucune forme disponible pour l’objectif actuel de 6★ maximum.'],pillNeeds:[],training:{experienceNeeded:0,experienceUpperBound:0,stages:[],ramen:null},budget:{requirements:{},rows:[],notes:[]},tokensNeeded:0};
  n=planned;
  p=planningProgress(n,p);
  // The displayed budget uses tokens after confirmed hidden crystal stocks.
  // Unknown hidden inventory keeps a full-purchase reference rather than zero stock.
  const stocks={...state.stocks};
  for(const craft of n.maxing?.limitBreak?.crystalAwakenings||[]){const key=craft.outputStockKey||`crystal6:${n.id}`;if(!known(stocks[key]))stocks[key]=0;}
  if(n.maxing?.limitBreak?.crystalAwakening){const key=n.maxing.limitBreak.crystalAwakening.outputStockKey||`crystal6:${n.id}`;if(!known(stocks[key]))stocks[key]=0;}
  const scoped={...state,stocks,craft:true,training:{...state.training,ramenStars:[3,4].includes(state.training?.ramenStars)?state.training.ramenStars:4},goals:{...state.goals,abilities:false,luck:false}};
  const current=currentForm(n,p),startingLevel=p.level===0?1:p.level;
  const validLevel=current&&known(startingLevel)&&startingLevel>=1&&startingLevel<=finalCap(current);
  const steps=current?.client?.limitBreakSteps||(current===n.forms.at(-1)?n.maxing?.limitBreak?.steps:[])||[];
  const caps=current?[...new Set([baseCap(current),...steps.map(s=>s.to)])].sort((a,b)=>a-b):[];
  const derivedCap=validLevel?caps.find(cap=>cap>=startingLevel)??null:null;
  // The resource view deliberately uses the minimum cap implied by the shown
  // level. An older manually stored unlocked cap does not change this budget.
  const progress={...p,level:validLevel?startingLevel:null,xp:0,unlockedCap:derivedCap};
  const base=planFor(n,progress,scoped),requirements={};
  const mixed=state.training?.mixedRamen!==false;
  if(mixed){
    for(const key of Object.keys(base.requirements))if(key.startsWith('ramen:'))delete base.requirements[key];
    base.uncertainResourceKeys=base.uncertainResourceKeys.filter(key=>!key.startsWith('ramen:'));
    base.training=mixTraining(n,base.training,state.training||{});
    for(const star of [1,2,3,4]){
      const amount=base.training.ramen.countsReference[star],key=`ramen:${n.element}:${star}`;
      if(amount&&state.training?.sameElement!==false){base.requirements[key]=amount;if(base.training.ramen.counts===null)base.uncertainResourceKeys.push(key);}
    }
    if(!base.training.ramen.supported)base.uncertain.push('bonus EXP fractionnel non confirmé');
    base.notes=base.notes.filter(note=>!note.startsWith('Ramen calculés sous les hypothèses indiquées'));
  }
  const convert=key=>/^crystal[1-7]:/.test(key)?'tokens':key,hiddenCrystalStockUsed={},hiddenCrystalDemands={},hiddenCrystalStocksUnknown=[];
  for(const[key,value]of Object.entries(base.requirements)){
    if(key.startsWith('copies:'))continue;
    const output=convert(key);let quantity=value;
    if(output==='tokens'&&key!=='tokens'){
      const available=stockFor(key,state.stocks),used=available===null?0:Math.min(value,available);
      hiddenCrystalDemands[key]=value;hiddenCrystalStockUsed[key]=used;if(available===null)hiddenCrystalStocksUnknown.push(key);
      quantity=(value-used)*TOKENS_PER_CHARACTER_CRYSTAL;
    }
    requirements[output]=(requirements[output]||0)+quantity;
  }
  const uncertainResourceKeys=[...new Set(base.uncertainResourceKeys.filter(k=>!k.startsWith('copies:')).map(convert))];
  const notes=base.notes.filter(note=>!note.includes('cristaux perso 6★ à fabriquer'));
  if(forecast)notes.push('Prévision pour un personnage à obtenir : première forme, niveau 1, EXP résiduelle et bonus de pilules à 0 ; acquisition du personnage exclue.');
  if(announced)notes.push('Personnage annoncé : sa sortie, ses données et ses recettes restent susceptibles de changer.');
  if(state.goals.level)notes.push('EXP calculée depuis le début du niveau affiché ; mélange recalculé à chaque plafond.');
  if(state.goals.level&&p.level===0&&validLevel)notes.push('Niveau 0 initial : calcul depuis le niveau 1 du jeu, avant toute amélioration.');
  if(steps.length&&derivedCap!==null)notes.push(`Paliers calculés depuis la limite ${derivedCap}, déduite du niveau actuel ${startingLevel}.`);
  if(requirements.tokens)notes.push('Achats des paliers restants : 1 000 jetons par cristal manquant après les stocks connus. La fabrication est incluse et ses ingrédients sont comptés une seule fois.');
  const tokenEstimate=requirements.tokens||0;
  const pillNeeds=state.goals.pills?['hp','atk','speed'].map(stat=>{const cap=pillCap(n.forms.at(-1),stat),exact=known(cap)&&known(p[stat]);return {stat,remainingPoints:exact?Math.max(0,cap-p[stat]):null,upperBound:cap,cap,actual:p[stat]??null,exact};}):[];
  const evaluated=resourceBudgetRows(requirements,state.stocks,uncertainResourceKeys,{...state.training,mixedRamen:mixed},[{id:n.id,pillNeeds}]);
  return {...base,forecast,announced,requirements,requirementsExact:uncertainResourceKeys.length===0&&base.training.ramen?.supported!==false,uncertainResourceKeys,unknownRequirements:uncertainResourceKeys,stockReservations:{},notes,pillNeeds,hiddenCrystalStockUsed,hiddenCrystalDemands,hiddenCrystalStocksUnknown,scope:'level-and-pills',planningMaxStars:CURRENT_MAX_STARS,levelBasedCap:derivedCap,capSource:'current-level',tokensNeeded:tokenEstimate,budget:{...evaluated,copiesNeeded:{},crystalsToBuy:0,tokenEstimate,notes,scope:'level-and-pills',purchaseAssumption:'after-known-character-crystal-stocks'}};
}
export function planAwakeningChain(targetStars,deficit,stocksByStars,recipes){
  const usedRecipes=recipes.filter(r=>r.to<=targetStars),byTarget=new Map(usedRecipes.map(r=>[r.to,r]));
  const steps=usedRecipes.map(r=>({fromStars:r.from,toStars:r.to,craftCount:0,inputCount:0,ryoCost:0,exact:true})),byTo=new Map(steps.map(s=>[s.toStars,s]));
  const capacity=(tier,limit)=>{
    if(limit<=0)return 0;const stock=stocksByStars[tier];if(!known(stock))return null;if(stock>=limit)return limit;
    const r=byTarget.get(tier);if(!r)return stock;
    const lower=capacity(r.from,(limit-stock)*r.inputCount);return lower===null?null:Math.min(limit,stock+Math.floor(lower/r.inputCount));
  };
  const top=byTarget.get(targetStars);if(!top||deficit===0)return {exact:true,craftCount:0,steps,ryoCost:0};
  const maxSource=capacity(top.from,(known(deficit)?deficit:1)*top.inputCount);
  let count=known(deficit)&&maxSource!==null?Math.min(deficit,Math.floor(maxSource/top.inputCount)):maxSource!==null&&maxSource<top.inputCount?0:null;
  if(count===null){
    for(const step of steps){const r=byTarget.get(step.toStars),possible=capacity(r.from,r.inputCount);if(possible!==null&&possible<r.inputCount)continue;Object.assign(step,{craftCount:null,inputCount:null,ryoCost:null,exact:false});}
    return {exact:false,craftCount:null,steps,ryoCost:null};
  }
  const remaining={...stocksByStars};
  const produce=(tier,quantity)=>{
    if(!quantity)return;const r=byTarget.get(tier),step=byTo.get(tier);consume(r.from,quantity*r.inputCount);
    step.craftCount+=quantity;step.inputCount+=quantity*r.inputCount;step.ryoCost+=quantity*r.ryo;
  };
  const consume=(tier,quantity)=>{
    if(!quantity)return;const use=Math.min(quantity,remaining[tier]);remaining[tier]-=use;
    if(quantity>use)produce(tier,quantity-use);
  };
  produce(targetStars,count);
  return {exact:true,craftCount:count,steps,ryoCost:steps.reduce((sum,s)=>sum+s.ryoCost,0)};
}
export function resourceBudgetRows(requirements,stocks,uncertainKeys=[],training={},pillPlans=null){
  const result={...requirements},uncertain=new Set(uncertainKeys),rowFlags=new Map(),conversions=[];
  const pillBudget=Array.isArray(pillPlans)?calculatePillBudget(pillPlans,stocks):null;
  if(pillBudget){
    for(const key of Object.keys(result))if(key.startsWith('pill:'))delete result[key];
    for(const key of [...uncertain])if(key.startsWith('pill:'))uncertain.delete(key);
    Object.assign(result,pillBudget.requirements);for(const key of pillBudget.uncertainResourceKeys)uncertain.add(key);
  }
  const enabled=training.awakenRamen!==false,mixed=training.mixedRamen===true,targetStars=mixed?'mixed':training.ramenStars??4;
  const applicable=(mixed||[2,3,4].includes(targetStars))&&(training.sameElement??true)===true;
  let knownRyoCost=0,craftUnknown=false,anyUnknownStock=false;
  const elements=[...new Set(Object.keys(requirements).filter(key=>positive(requirements[key])).map(key=>/^ramen:(Heart|Skill|Body|Bravery|Wisdom):[1-4]$/.exec(key)?.[1]).filter(Boolean))];
  if(enabled&&applicable)for(const element of elements){
    if(!mixed&&!positive(requirements[`ramen:${element}:${targetStars}`]))continue;
    const maxTier=mixed?4:targetStars,byStars={},direct={},surplus={},inputs={},made={},unknownInput={},unknownMade={};let elementUnknownStock=false;
    for(let tier=1;tier<=maxTier;tier++){
      const key=`ramen:${element}:${tier}`,amount=requirements[key]||0,available=stockFor(key,stocks);
      byStars[tier]=available;direct[tier]=amount;surplus[tier]=available===0?0:available!==null&&!uncertain.has(key)?Math.max(0,available-amount):null;inputs[tier]=0;made[tier]=0;unknownInput[tier]=false;unknownMade[tier]=false;
    }
    for(let target=2;target<=maxTier;target++){
      if(!direct[target]||!mixed&&target!==targetStars)continue;const key=`ramen:${element}:${target}`,requiredTarget=direct[target],stockTarget=byStars[target],needExact=!uncertain.has(key);
      const covered=stockTarget!==null&&stockTarget>=requiredTarget,deficit=covered?0:needExact&&stockTarget!==null?Math.max(0,requiredTarget-stockTarget):null;
      const before={...surplus},plan=planAwakeningChain(target,deficit,surplus,RAMEN_AWAKENING_RECIPES),count=plan.craftCount;
      const potential=plan.exact?plan:planAwakeningChain(target,Math.max(0,requiredTarget-(stockTarget??0)),surplus,RAMEN_AWAKENING_RECIPES);
      const unknownStock=!plan.exact&&(stockTarget===null||!potential.exact),reason=covered?'target-stock-covers-need':!plan.exact?!needExact?'progression-unknown':'source-or-target-stock-unknown':count?'available-lower-surplus':'no-craft-required';
      const remainingTarget=needExact&&stockTarget!==null&&count!==null?Math.max(0,requiredTarget-stockTarget-count):null;
      const steps=plan.steps.slice().reverse().map(step=>({...step,element,count:step.craftCount,unknown:!step.exact})),topStep=steps[0];
      conversions.push({element,targetStars:target,requiredTarget,stockTarget,count,craftCount:count,craftCountTarget:count,inputCount:topStep?topStep.inputCount:0,ryoCost:plan.ryoCost,remainingTarget,remaining4:target===4?remainingTarget:null,required4:target===4?requiredTarget:null,stock4:byStars[4]??null,stock3:byStars[3]??null,exact:plan.exact,reason,progressionExact:needExact,protectedFeedingNeeds:{...direct},steps});
      for(const step of steps){
        if(step.craftCount===null){unknownInput[step.fromStars]=true;unknownMade[step.toStars]=true;}
        else{inputs[step.fromStars]+=step.inputCount;made[step.toStars]+=step.craftCount;knownRyoCost+=step.ryoCost;}
      }
      if(plan.exact){
        for(let tier=1;tier<target;tier++){
          const spent=steps.find(s=>s.fromStars===tier)?.inputCount||0,produced=steps.find(s=>s.toStars===tier)?.craftCount||0;
          if(known(before[tier]))surplus[tier]=Math.max(0,before[tier]-Math.max(0,spent-produced));
        }
      }else{craftUnknown=true;uncertain.add('ryo');for(let tier=1;tier<target;tier++)surplus[tier]=null;}
      elementUnknownStock||=unknownStock;anyUnknownStock||=unknownStock;
    }
    for(let tier=1;tier<=maxTier;tier++){
      const key=`ramen:${element}:${tier}`,needed=direct[tier]+inputs[tier];result[key]=needed;
      const exact=!uncertain.has(key)&&!unknownInput[tier]&&!(unknownMade[tier]&&needed>0),missing=exact&&needed===0?0:exact&&byStars[tier]!==null?Math.max(0,needed-byStars[tier]-made[tier]):null;
      rowFlags.set(key,{exact,neededUnknown:unknownInput[tier],awakeningUnknown:!exact&&elementUnknownStock,craftedCount:unknownMade[tier]?null:made[tier],feedingNeeded:direct[tier],awakeningNeeded:unknownInput[tier]?null:inputs[tier],missing});if(!exact)uncertain.add(key);
    }
  }
  if(conversions.length){
    result.ryo=(result.ryo||0)+knownRyoCost;
    rowFlags.set('ryo',{exact:!uncertain.has('ryo'),awakeningUnknown:anyUnknownStock,neededUnknown:craftUnknown,knownNeeded:result.ryo});
  }
  const preliminaryRows=Object.entries(result).map(([key,needed])=>{
    const stock=stockFor(key,stocks),flags=rowFlags.get(key)||{},exact=flags.exact??!uncertain.has(key);
    const missing=Object.hasOwn(flags,'missing')?flags.missing:exact&&needed===0?0:stock===null||!exact||flags.neededUnknown?null:Math.max(0,needed-stock);
    return {key,needed,stock,exact,missing,...flags};
  });
  const material=calculateMaterialBudget(result,stocks,[...uncertain],training),previous=new Map(preliminaryRows.map(row=>[row.key,row])),pillRows=new Map((pillBudget?.rows||[]).map(row=>[row.key,row]));
  const rows=material.rows.map(row=>{
    if(pillRows.has(row.key))return pillRows.get(row.key);
    if(row.key.startsWith('scroll:')||row.materialAwakening)return row;
    const prior=previous.get(row.key);if(!prior)return row;
    if(row.key==='ryo'){
      const exact=row.exact&&prior.exact;
      return {...row,exact,missing:exact?row.missing:null,neededUnknown:!!(row.neededUnknown||prior.neededUnknown),awakeningUnknown:!!(row.awakeningUnknown||prior.awakeningUnknown),ramenAwakeningUnknown:!!prior.awakeningUnknown};
    }
    return prior;
  });
  return {requirements:material.requirements,rows,uncertainResourceKeys:material.uncertainResourceKeys,pillBudget,scrollAwakening:material.scrollAwakening,materialAwakening:material.materialAwakening,ramenAwakening:{enabled,applicable,mixed,targetStars,conversions,steps:conversions.flatMap(c=>c.steps),ryoCost:craftUnknown?null:knownRyoCost,knownRyoCost,rule:{...RAMEN_AWAKENING_RULE},recipes:RAMEN_AWAKENING_RECIPES.map(r=>({...r})),directThreeStarFeedingIncluded:mixed,overflowOptimized:mixed,assumptions:[mixed?'Les ramen de toutes les raretés choisis pour nourrir sont réservés avant les éveils':`Entraînement uniquement avec des ramen ${targetStars}★ du même élément`,'Seuls les surplus inférieurs servent à fabriquer les manquants','Répartition des surplus commune à toute la collection ; aucune promesse de coût minimal de farm']}};
}
export function aggregateResourcePlan(ninjas,state){
  const selected=ninjas.filter(n=>canPlanCharacter(n)&&state.characters[n.id]?.planned&&(!state.characters[n.id].owned||!known(state.characters[n.id].stars)||state.characters[n.id].stars<=CURRENT_MAX_STARS));
  const planningStocks={...state.stocks};
  const plans=selected.map(n=>{const p=resourcePlanFor(n,state.characters[n.id],{...state,stocks:planningStocks});for(const[key,used]of Object.entries(p.hiddenCrystalStockUsed||{}))if(known(planningStocks[key]))planningStocks[key]=Math.max(0,planningStocks[key]-used);return p;}),requirements={},users={},uncertainKeys=new Set();
  for(const plan of plans){
    for(const key of plan.uncertainResourceKeys)uncertainKeys.add(key);
    for(const[key,value]of Object.entries(plan.requirements)){requirements[key]=(requirements[key]||0)+value;(users[key]??=[]).push(plan.id);}
  }
  const evaluated=resourceBudgetRows(requirements,state.stocks,[...uncertainKeys],{...state.training,mixedRamen:state.training?.mixedRamen!==false},plans);
  const rows=evaluated.rows.map(row=>({...row,users:row.users||users[row.key]|| (row.key.startsWith('ramen:')?[...new Set(Object.entries(users).filter(([key])=>key.startsWith(row.key.slice(0,row.key.lastIndexOf(':')+1))).flatMap(([,ids])=>ids))]:null)|| (row.key==='ryo'?selected.map(n=>n.id):[])}));
  const total=key=>plans.every(p=>p.training[key]!==null)?plans.reduce((sum,p)=>sum+p.training[key],0):null;
  const ramenMix=aggregateRamenMix(plans,selected);
  return {selected,plans,forecastCount:plans.filter(p=>p.forecast).length,announcedCount:plans.filter(p=>p.announced).length,requirements:evaluated.requirements,rows,ramenMix,ramenAwakening:evaluated.ramenAwakening,scrollAwakening:evaluated.scrollAwakening,materialAwakening:evaluated.materialAwakening,pillBudget:evaluated.pillBudget,scope:'level-and-pills',planningMaxStars:CURRENT_MAX_STARS,tokensNeeded:requirements.tokens||0,tokenEstimate:requirements.tokens||0,crystalsToBuy:0,uncertain:plans.filter(p=>p.uncertain.length).length,stockUnknown:rows.filter(r=>r.stock===null).length,experienceNeeded:total('experienceNeeded'),experienceUpperBound:total('experienceUpperBound')};
}
function aggregateRamenMix(plans,ninjas){
  const byId=new Map(ninjas.map(n=>[n.id,n])),groups=new Map(),stages=plans.flatMap(p=>p.training.ramen?.mixed?p.training.stages:[]);
  for(const p of plans){
    const mix=p.training.ramen;if(!mix?.mixed)continue;const element=byId.get(p.id)?.element;
    const row=groups.get(element)||{element,counts:{1:0,2:0,3:0,4:0},providedExperience:0,neededExperience:0,wastedExperience:0,exact:true};
    for(const star of [1,2,3,4])row.counts[star]+=mix.countsReference[star]||0;
    row.exact&&=mix.counts!==null;
    row.providedExperience=row.providedExperience===null||mix.providedExperience===null?null:row.providedExperience+mix.providedExperience;
    row.neededExperience=row.neededExperience===null||p.training.experienceNeeded===null?null:row.neededExperience+p.training.experienceNeeded;
    row.wastedExperience=row.wastedExperience===null||mix.wastedExperience===null?null:row.wastedExperience+mix.wastedExperience;groups.set(element,row);
  }
  const byElement=[...groups.values()],sum=key=>byElement.every(r=>r[key]!==null)?byElement.reduce((n,r)=>n+r[key],0):null;
  const feedingRequirements={};for(const p of plans)for(const[key,n]of Object.entries(p.requirements))if(key.startsWith('ramen:'))feedingRequirements[key]=(feedingRequirements[key]||0)+n;
  const known=stages.every(s=>s.known);
  return {mixed:true,allowedFeedingStars:[3,4],farmRatio:{...RAMEN_FARM_RATIO},objective:RAMEN_MIX_OBJECTIVE.slice(),byElement,stages,feedingRequirements,providedExperience:sum('providedExperience'),neededExperience:sum('neededExperience'),wastedExperience:sum('wastedExperience'),allExactPossible:known?stages.every(s=>s.exactPossible):null,exact:known,stockOptimal:false};
}
export function resourceStockKeys(ninjas){
  return allStockKeys(ninjas.map(n=>planningCharacter(n)).filter(Boolean)).filter(key=>!/^crystal[1-7]:|^copies:/.test(key)&&key!=='stone'&&key!=='shard');
}
export function resourceInfo(key,byId) {
  const[kind,a,b]=key.split(':');
  if(kind==='ryo')return {name:'Ryō',subtitle:'Éveil + Limit Break + fabrication · fusion exclue',group:'Ryō & pilules',order:0,icon:'両'};
  if(kind==='tokens')return {name:'Jetons',subtitle:'Achats des paliers restants · après les stocks déjà possédés',group:'Jetons',order:-1,icon:'◉'};
  if(kind==='stone')return {name:'Pierres d’acquisition 6★',subtitle:'1 capacité / pierre · 6 fragments / pierre',group:'Ryō & pilules',order:5,icon:'◆'};
  if(kind==='shard')return {name:'Fragments de pierre',subtitle:'Combinés par lots de 6',group:'Ryō & pilules',order:6,icon:'◇'};
  if(kind==='pill')return {name:`Pilules ${a==='hp'?'PV':a==='atk'?'ATK':'vitesse'} ${b}★`,subtitle:`+${PILL_GAINS[b]?.[a]??'?'} par pilule · données client`,group:'Ryō & pilules',order:1+['hp','atk','speed'].indexOf(a),icon:'✚'};
  if(kind==='ramen')return {name:`Ramen ${ELEMENTS[a]?.name??a} ${b}★`,subtitle:`${RAMEN_BASE_EXPERIENCE[b]?.toLocaleString('fr-FR')??'?'} EXP de base · hypothèses de fusion affichées`,group:ELEMENTS[a]?.name??a,element:a,order:18+Object.keys(ELEMENTS).indexOf(a)*10+Number(b)/10,icon:'🍜'};
  if(kind==='scroll')return {name:`Parchemins ${ELEMENTS[a]?.name??a} ${b}★`,subtitle:`Searching for ${a} Scrolls`,group:ELEMENTS[a]?.name??a,element:a,order:10+Object.keys(ELEMENTS).indexOf(a)*10+Number(b),icon:'▤'};
  if(kind==='element')return {name:`Cristaux d’élément · ${ELEMENTS[a]?.name??a}`,subtitle:`Accumulation of ${a} · Trial Missions`,group:ELEMENTS[a]?.name??a,element:a,order:15+Object.keys(ELEMENTS).indexOf(a)*10,icon:'⬡'};
  if(/^crystal[1-7]$/.test(kind)||kind==='copies'){
    const n=byId.get(a);return {name:kind==='copies'?'Doublons frais':`Cristaux perso ${kind.slice(7)}★`,subtitle:n?`${n.name} · ${n.title}`:a,group:'Par personnage',element:n?.element,order:70,character:a,icon:kind==='copies'?'◉':'◆'};
  }
  return {name:kind==='material'?`Matériau client n° ${a}`:key.slice(8),subtitle:'Outil spécial · recette client',group:'Outils spéciaux',order:65,icon:'✦'};
}
export function allStockKeys(ninjas){
  const keys=new Set(['ryo','tokens','stone','shard']);
  for(const stat of ['hp','atk','speed'])for(const star of [2,3])keys.add(`pill:${stat}:${star}`);
  for(const e of Object.keys(ELEMENTS)){for(let s=1;s<=4;s++){keys.add(`scroll:${e}:${s}`);keys.add(`ramen:${e}:${s}`);}keys.add(`element:${e}`);}
  for(const n of ninjas){
    for(const f of n.forms)for(const m of f.awakening?.materials||[])if(m.kind!=='scroll')keys.add(m.stockKey||`special:${m.name}`);
    if(n.maxing?.limitBreak?.steps?.length){
      for(const step of n.maxing.limitBreak.steps)for(const key of Object.keys(step.requirements||Object.fromEntries(Object.entries(step.items||{}).map(([k,v])=>[itemKey(k,n),v]))))keys.add(key);
      for(const craft of n.maxing.limitBreak.crystalAwakenings||[]){if(craft.outputStockKey)keys.add(craft.outputStockKey);for(const key of Object.keys(craft.inputRequirements||{}))keys.add(key);}
      if(!n.maxing.limitBreak.crystalAwakenings){keys.add(`crystal5:${n.id}`);if(n.maxing.limitBreak.steps.some(s=>s.items?.own6))keys.add(`crystal6:${n.id}`);}
    }
    keys.add(`copies:${n.id}`);
  }
  for(const key of extraStockKeys([...keys]))keys.add(key);
  return [...keys];
}
export function maximumStat(form,mode,stat){
  const a=form.stats?.[mode]?.[stat];if(!a)return null;
  const ability=stat+(mode==='nwus'?'NwusAbilities':'Abilities');
  return (form.limitBreak&&a.maxLb!==null?a.maxLb:a.max)+(form.stats.plusValues[stat]||0)+(form.stats.plusValues[ability]||0);
}
export function ultimateStatus(n,p,form){
  const candidates=n.forms.filter(f=>f.stars===p.stars);
  const current=known(p.unitId)?n.forms.find(f=>f.client?.unitId===p.unitId):candidates.length===1?candidates[0]:null;
  const preview=form||current,conditions=[];
  const condition=(key,label,actual,required,met,secondary=false)=>{conditions.push({key,label,actual:actual??null,required:required??null,met,secondary});return met;};
  condition('owned','Personnage possédé',typeof p.owned==='boolean'?p.owned:null,true,typeof p.owned==='boolean'?p.owned:null);
  const currentId=current?.client?.unitId??null,previewId=preview?.client?.unitId??null;
  const sameForm=current&&preview?known(currentId)&&known(previewId)?currentId===previewId:current===preview:null;
  condition('currentForm','Forme actuellement possédée',currentId,previewId,sameForm);
  const category=preview?.client?.type3;
  condition('canBattle','Unité de combat',category, 'type3 < 90',known(category)?category<90:null);
  // The native EvolutionAbilityTable includes paths through Blazing Awakening.
  // A catalogue entry's largest star count cannot replace this per-unit value.
  const evoRare=preview?.client?.maxEvoRareValue;
  condition('awakening','Rareté maximale après éveil',preview?.stars,evoRare,known(preview?.stars)&&known(evoRare)?preview.stars===evoRare:null);
  const threshold=(key,label,value,target)=>condition(key,label,value,target,known(value)&&known(target)?value>=target:null);
  threshold('level','Niveau maximal avec Limit Break',p.level,preview?finalCap(preview):null);
  threshold('abilities','Toutes les capacités débloquées',p.abilities,preview?.abilities?.length??preview?.client?.abilityCount??null);
  threshold('hp','Pilules PV au maximum',p.hp,preview?pillCap(preview,'hp'):null);
  threshold('atk','Pilules ATK au maximum',p.atk,preview?pillCap(preview,'atk'):null);
  threshold('luck','Chance au maximum',p.luck,preview?luckCap(preview):null);
  const speedCap=preview?pillCap(preview,'speed'):null;
  const speedMet=known(p.speed)&&known(speedCap)?p.speed>=speedCap:null;
  condition('speed','Pilules vitesse au maximum — variante rouge',p.speed,speedCap,speedMet,true);
  const required=conditions.filter(c=>!c.secondary);
  const status=required.some(c=>c.met===false)?false:required.some(c=>c.met===null)?'unknown':true;
  return {status,variant:status===true?speedMet===null?'unknown':speedMet?'red':'normal':null,conditions,missing:required.filter(c=>c.met===false).map(c=>c.label),unknown:required.filter(c=>c.met===null).map(c=>c.label),speed:{actual:p.speed??null,required:speedCap,met:speedMet,unknown:speedMet===null},currentUnitId:currentId,previewUnitId:previewId};
}
export function backup(state){return clone({...state,exportedAt:new Date().toISOString()});}
