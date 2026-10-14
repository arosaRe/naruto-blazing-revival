import {normalizeSelection} from './player-filters.js?v=20261014-public-import1';
const ELEMENT_NAMES = {Heart:'Cœur',Skill:'Technique',Body:'Corps',Bravery:'Bravoure',Wisdom:'Sagesse'};
const PROGRESSION_NAMES = {planned:'Dans mon plan',unknown:'Niveau à renseigner',lb:'Limit Break disponible',six:'6★',five:'5★',four:'4★'};
const SORT_NAMES = {name:'Nom A → Z',stars:'Étoiles',abilities:'Capacités débloquées',priority:'Priorité'};

/** Normalize written words without translating or interpreting effect text. */
export function normalizeSearch(value) {
  return String(value??'').toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae')
    .normalize('NFKD').replace(/\p{M}/gu,'').replace(/['’‘ʼ`´]/g,'')
    .replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}

/** Build once per character. Numeric identifiers are separate from effect amounts. */
export function createCharacterSearchIndex(n) {
  const texts=[],numbers=new Set();
  const addText=value=>{
    if(typeof value==='string')texts.push(value);
    else if(Array.isArray(value))value.forEach(addText);
  };
  const addNumber=value=>{
    if(typeof value==='number'&&Number.isSafeInteger(value)&&value>=0)numbers.add(String(value));
    else if(typeof value==='string'&&/^\d+$/.test(value.trim()))numbers.add(value.trim());
  };
  const addSkill=value=>{
    if(Array.isArray(value)){value.forEach(addSkill);return;}
    if(typeof value==='string'){addText(value);return;}
    if(!value||typeof value!=='object')return;
    for(const key of ['name','text','textNwus','effect','condition'])addText(value[key]);
  };
  const addCharacterFields=value=>{
    if(!value||typeof value!=='object')return;
    for(const key of ['name','title','titleFr','aliases','variantLabel','affiliations'])addText(value[key]);
    for(const entry of value.obtain||[])addText(entry.name);
    addText(value.element);addText(ELEMENT_NAMES[value.element]);
    for(const key of ['ninjutsu','secretTechnique','fieldSkill','buddySkill','abilities','syncSkills'])addSkill(value[key]);
    for(const key of ['fieldEffect','buddyEffect'])addText(value[key]);
    addText(value.effects?.support);addText(value.effects?.skill);
    addNumber(value.cardNo);addNumber(value.unitId);addNumber(value.client?.unitId);
  };
  addCharacterFields(n);
  if(Array.isArray(n?.client?.unitIds))n.client.unitIds.forEach(addNumber);
  if(Array.isArray(n?.forms))n.forms.forEach(addCharacterFields);
  return {text:normalizeSearch(texts.join(' ')),numbers:[...numbers]};
}

/** Every word must match; a digits-only term must be an exact card or unit ID. */
export function matchesCharacterSearch(index,query) {
  const normalized=normalizeSearch(query);
  if(!normalized)return true;
  return normalized.split(' ').every(word=>/^\d+$/.test(word)
    ?Array.isArray(index?.numbers)&&index.numbers.includes(word)
    :(index?.text||'').includes(word));
}

/** Labels reflect the current controls; the collection scope is kept separate. */
export function collectionFilterSummary(ui={}) {
  const summary=[];
  if(normalizeSearch(ui.search))summary.push({key:'search',label:`Recherche : « ${String(ui.search).trim()} »`});
  const elements=normalizeSelection(ui.element,Object.keys(ELEMENT_NAMES)),stars=normalizeSelection(ui.collectionStars,[1,2,3,4,5,6]);
  if(elements.length)summary.push({key:'element',label:`${elements.length===1?'Élément':'Éléments'} : ${elements.map(e=>ELEMENT_NAMES[e]).join(', ')}`});
  if(stars.length)summary.push({key:'collectionStars',label:`${stars.length===1?'Rareté maximale':'Raretés maximales'} : ${stars.map(s=>s+'★').join(', ')}`});
  if(ui.f2pOnly===true)summary.push({key:'f2pOnly',label:'F2P · voie gratuite documentée'});
  if(ui.filter&&ui.filter!=='all')summary.push({key:'filter',label:`Progression : ${PROGRESSION_NAMES[ui.filter]||ui.filter}`});
  if(ui.sort&&ui.sort!=='catalogue')summary.push({key:'sort',label:`Tri : ${SORT_NAMES[ui.sort]||ui.sort}`});
  return summary;
}

/** Reset the collection controls while preserving the current view and page. */
export function resetCollectionFilters(ui={}) {
  return {...ui,search:'',element:[],collectionStars:[],f2pOnly:false,filter:'all',sort:'catalogue',visible:72};
}
