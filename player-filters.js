import {canPlanCharacter,CURRENT_MAX_STARS} from './model.js?v=20261014-public-import1';

/** Empty means all. Values are canonical strings, including numeric rarities. */
export function normalizeSelection(value,allowed){
  const candidates=Array.isArray(value)?value:[value],selected=new Set();
  for(const candidate of candidates){
    if(typeof candidate!=='string'&&typeof candidate!=='number')continue;
    const text=String(candidate).trim();if(text&&text!=='all')selected.add(text);
  }
  return Array.isArray(allowed)?[...new Set(allowed.map(String))].filter(value=>selected.has(value)):[...selected];
}

/** OR within one group; the caller combines independent groups with AND. */
export function matchesSelection(value,selection){
  const selected=normalizeSelection(selection);return !selected.length||selected.includes(String(value));
}

export function toggleSelection(selection,value,allowed){
  const selected=normalizeSelection(selection,allowed);
  if(value==='all')return [];
  const candidate=normalizeSelection(value,allowed)[0];if(candidate===undefined)return selected;
  return normalizeSelection(selected.includes(candidate)?selected.filter(v=>v!==candidate):[...selected,candidate],allowed);
}

const acquisitionName=value=>typeof value==='string'?value.toLowerCase().trim().replace(/[_-]+/g,' ').replace(/\s+/g,' '):'';
const FREE_ROUTES=new Set(['gift','friend summon','mission','missions','event','events','story','trial','raid','gaiden','rookie','emergency','impact']);
const SHOP_ROUTES=new Set(['shop','store','granny cat']);

/** A documented free acquisition path, not a live availability guarantee.
 * Premium summons stay excluded even when their pearls can be earned for free.
 * The named regular Granny Cat Coins route is distinct from anniversary,
 * legendary or unspecified shop currencies. Unknown acquisition stays excluded.
 */
export function isF2PCharacter(n){
  if(!Array.isArray(n?.obtain))return false;
  return n.obtain.some(entry=>{
    const type=acquisitionName(entry?.type);
    if(type==='summon')return acquisitionName(entry.name)==='friend summon';
    if(FREE_ROUTES.has(type))return true;
    if(!SHOP_ROUTES.has(type))return false;
    const currency=acquisitionName(entry.currency&&typeof entry.currency==='object'?entry.currency.name:entry.currency||entry.name);
    return currency==='granny cat coins';
  });
}

function viewPlanIds(state,filteredCharacters){
  const existing=state.characters||{},ids=new Set();
  for(const n of Array.isArray(filteredCharacters)?filteredCharacters:[]){
    if(!canPlanCharacter(n)||!Object.hasOwn(existing,n.id))continue;
    ids.add(n.id);
  }
  return ids;
}

/** Replace the entire plan with the full filtered view, before pagination.
 * Never change possession, progress or shared stocks.
 */
export function replacePlanWithView(state,filteredCharacters){
  const existing=state.characters||{},ids=viewPlanIds(state,filteredCharacters);
  const characters=Object.fromEntries(Object.entries(existing).map(([id,p])=>[id,{...p,planned:ids.has(id)}]));
  return {...state,characters};
}

/** Add the full filtered view to the existing plan without removing anything. */
export function addViewToPlan(state,filteredCharacters){
  const existing=state.characters||{},ids=viewPlanIds(state,filteredCharacters);
  const characters=Object.fromEntries(Object.entries(existing).map(([id,p])=>[id,ids.has(id)?{...p,planned:true}:{...p}]));
  return {...state,characters};
}

/** Compatibility for callers that explicitly request six-star targets. */
export function replacePlanWithSixStarView(state,filteredCharacters){
  const view=(Array.isArray(filteredCharacters)?filteredCharacters:[]).filter(n=>canPlanCharacter(n)&&Math.max(...n.forms.filter(f=>f.stars<=CURRENT_MAX_STARS).map(f=>f.stars))===6);
  return replacePlanWithView(state,view);
}
