import {OTHER_MATERIAL_AWAKENING_RECIPES,MATERIAL_STOCK_ALIASES,migrateMaterialStocks} from './material-recipes-map.js?v=20261014-public-import1';
export {OTHER_MATERIAL_AWAKENING_RECIPES,MATERIAL_STOCK_ALIASES,extraStockKeys,migrateMaterialStocks} from './material-recipes-map.js?v=20261014-public-import1';
// Native awakening recipes: one source scroll plus five identical ingredients.
export const SCROLL_AWAKENING_RECIPES=[{from:1,to:2,inputCount:6,ryo:500},{from:2,to:3,inputCount:6,ryo:500},{from:3,to:4,inputCount:6,ryo:500}];
const known=value=>Number.isSafeInteger(value)&&value>=0;
const stock=(key,stocks)=>known(stocks[key])?stocks[key]:null;
function surplusChain(target,deficit,surplus){
  const steps=SCROLL_AWAKENING_RECIPES.filter(r=>r.to<=target).map(r=>({fromStars:r.from,toStars:r.to,craftCount:0,inputCount:0,ryoCost:0,exact:true}));
  const byTo=new Map(steps.map(s=>[s.toStars,s]));
  const capacity=(tier,limit)=>{
    const available=surplus[tier];if(!known(available))return null;if(available>=limit)return limit;if(tier===1)return available;
    const low=capacity(tier-1,(limit-available)*6);return low===null?null:Math.min(limit,available+Math.floor(low/6));
  };
  if(deficit===0)return {exact:true,craftCount:0,ryoCost:0,steps};
  const available=capacity(target-1,(known(deficit)?deficit:1)*6);
  const count=known(deficit)&&available!==null?Math.min(deficit,Math.floor(available/6)):available!==null&&available<6?0:null;
  if(count===null){
    for(const step of steps){const possible=capacity(step.fromStars,6);if(possible!==null&&possible<6)continue;Object.assign(step,{craftCount:null,inputCount:null,ryoCost:null,exact:false});}
    return {exact:false,craftCount:null,ryoCost:null,steps};
  }
  const remaining={...surplus};
  const produce=(tier,n)=>{if(!n)return;consume(tier-1,n*6);const s=byTo.get(tier);s.craftCount+=n;s.inputCount+=n*6;s.ryoCost+=n*500;};
  const consume=(tier,n)=>{if(!n)return;const used=Math.min(n,remaining[tier]);remaining[tier]-=used;if(n>used)produce(tier,n-used);};
  produce(target,count);return {exact:true,craftCount:count,steps,ryoCost:steps.reduce((sum,s)=>sum+s.ryoCost,0),remaining};
}
export function calculateMaterialBudget(requirements,stocks,uncertainKeys=[],options={}){
  const result={...requirements},uncertain=new Set(uncertainKeys),flags=new Map(),conversions=[],allocations=[];
  const inventory=migrateMaterialStocks(stocks);
  // Different legacy keys can refer to one native item. Combine their needs,
  // then use one stock value; aliases are never separate sources of inventory.
  for(const [key,aliases] of Object.entries(MATERIAL_STOCK_ALIASES)){
    const present=[key,...aliases].filter(a=>Object.hasOwn(result,a));if(!present.length)continue;
    const amount=present.reduce((sum,a)=>sum+(result[a]||0),0),isUncertain=present.some(a=>uncertain.has(a));
    for(const alias of aliases){delete result[alias];uncertain.delete(alias);}
    result[key]=amount;if(isUncertain)uncertain.add(key);
  }
  const enabled=options.awakenScrolls!==false;let knownRyoCost=0,totalUnknown=false,unknownStocks=false;
  const elements=[...new Set(Object.keys(requirements).map(key=>/^scroll:(Heart|Skill|Body|Bravery|Wisdom):[2-4]$/.exec(key)?.[1]).filter(Boolean))];
  if(enabled)for(const element of elements){
    let elementStockUnknown=false;
    const direct={},surplus={},made={},inputs={},unknownNeeded={},unknownMade={},physical={};
    for(let tier=1;tier<=4;tier++){
      const key=`scroll:${element}:${tier}`,needed=requirements[key]||0,available=stock(key,stocks),exact=!uncertain.has(key);
      direct[tier]=needed;physical[tier]=available;surplus[tier]=available===0?0:available!==null&&exact?Math.max(0,available-needed):null;made[tier]=0;inputs[tier]=0;unknownNeeded[tier]=false;unknownMade[tier]=false;
    }
    // All direct recipe needs are protected first. Only surplus stock can be spent.
    for(let target=2;target<=4;target++){
      if(!direct[target])continue;const key=`scroll:${element}:${target}`,available=stock(key,stocks),needExact=!uncertain.has(key);
      const covered=available!==null&&available>=direct[target],deficit=covered?0:available!==null&&needExact?Math.max(0,direct[target]-available):null;
      const before={...surplus},plan=surplusChain(target,deficit,surplus);
      const sourceUnknown=!plan.exact&&(available===null||plan.steps.some(s=>!s.exact&&stock(`scroll:${element}:${s.fromStars}`,stocks)===null));
      const remainingTarget=needExact&&available!==null&&plan.craftCount!==null?Math.max(0,direct[target]-available-plan.craftCount):null;
      const steps=plan.steps.map(s=>{
        const sourceStock=physical[s.fromStars],directNeeded=!uncertain.has(`scroll:${element}:${s.fromStars}`)?direct[s.fromStars]:null,consumed=s.inputCount,remaining=sourceStock!==null&&consumed!==null?sourceStock-consumed:null;
        const step={...s,element,unknown:!s.exact,sourceKey:`scroll:${element}:${s.fromStars}`,targetKey:`scroll:${element}:${s.toStars}`,sourceStock,directNeeded,directReserved:sourceStock!==null&&directNeeded!==null?Math.min(sourceStock,directNeeded):null,consumed,remaining};
        physical[s.fromStars]=remaining;physical[s.toStars]=physical[s.toStars]!==null&&s.craftCount!==null?physical[s.toStars]+s.craftCount:null;
        return step;
      });
      conversions.push({element,targetStars:target,requiredTarget:direct[target],craftCount:plan.craftCount,count:plan.craftCount,ryoCost:plan.ryoCost,remainingTarget,exact:plan.exact,unknown:!plan.exact,sourceUnknown,steps,protectedDirectNeeds:{...direct}});
      for(const step of steps){
        if(step.craftCount===null){unknownMade[step.toStars]=true;unknownNeeded[step.fromStars]=true;}
        else{made[step.toStars]+=step.craftCount;inputs[step.fromStars]+=step.inputCount;knownRyoCost+=step.ryoCost;}
      }
      if(plan.exact){
        for(let tier=1;tier<target;tier++){
          const spent=steps.find(s=>s.fromStars===tier)?.inputCount||0,produced=steps.find(s=>s.toStars===tier)?.craftCount||0;
          if(known(before[tier]))surplus[tier]=Math.max(0,before[tier]-Math.max(0,spent-produced));
        }
      }else{totalUnknown=true;unknownStocks||=sourceUnknown;elementStockUnknown||=sourceUnknown;for(let tier=1;tier<target;tier++)surplus[tier]=null;}
    }
    for(let tier=1;tier<=4;tier++){
      const key=`scroll:${element}:${tier}`,needed=direct[tier],available=stock(key,stocks);
      // Stable lower-tier rows keep their editable stock inputs visible.
      // Conversion ingredients come only from a reserved stock surplus. They
      // are a separate ledger, never an additional direct need to obtain.
      result[key]=needed;const exact=!uncertain.has(key);
      const missing=!exact?null:needed===0?0:available!==null&&available>=needed?0:physical[tier]!==null?Math.max(0,needed-physical[tier]):null;
      const directNeeded=exact?direct[tier]:null,consumed=unknownNeeded[tier]?null:inputs[tier],produced=unknownMade[tier]?null:made[tier],conversionUnknown=consumed===null||produced===null;
      const ledger={key,element,stars:tier,sourceStock:available,directNeeded,directNeededReference:direct[tier],directReserved:available!==null&&directNeeded!==null?Math.min(available,directNeeded):null,consumed,produced,stockConsumed:consumed!==null&&produced!==null?Math.max(0,consumed-produced):null,remaining:physical[tier]};allocations.push(ledger);
      flags.set(key,{exact,missing,craftedCount:produced,directNeeded,directNeededReference:direct[tier],directReserved:ledger.directReserved,craftConsumed:consumed,stockConsumed:ledger.stockConsumed,remainingStockAfterCraft:ledger.remaining,neededUnknown:false,conversionUnknown,awakeningUnknown:conversionUnknown&&elementStockUnknown,scrollAwakeningUnknown:conversionUnknown&&elementStockUnknown});
    }
  }
  if(conversions.length){result.ryo=(result.ryo||0)+knownRyoCost;if(totalUnknown)uncertain.add('ryo');flags.set('ryo',{exact:!uncertain.has('ryo'),neededUnknown:totalUnknown,awakeningUnknown:unknownStocks,scrollAwakeningUnknown:unknownStocks,knownNeeded:result.ryo});}
  const materialAwakening=otherMaterialConversions(result,inventory,uncertain,flags,options);
  const rows=Object.entries(result).map(([key,needed])=>{const available=stock(key,inventory),f=flags.get(key)||{},exact=f.exact??!uncertain.has(key);return {key,needed,stock:available,exact,missing:Object.hasOwn(f,'missing')?f.missing:exact&&needed===0?0:available===null||!exact?null:Math.max(0,needed-available),...f};});
  return {requirements:result,rows,uncertainResourceKeys:[...uncertain],materialAwakening,scrollAwakening:{enabled,conversions,steps:conversions.flatMap(c=>c.steps),allocations,ryoCost:totalUnknown?null:knownRyoCost,knownRyoCost,recipes:SCROLL_AWAKENING_RECIPES.map(r=>({...r})),priority:'direct-lower-needs-first',assumptions:['Les déficits directs des raretés inférieures sont comblés avant les paliers supérieurs','Seuls les surplus après réservation des besoins directs servent aux conversions','Aucune comparaison du coût en énergie de farm']}};
}

function otherMaterialConversions(result,stocks,uncertain,flags,options){
  const enabled=options.awakenMaterials!==false,conversions=[];
  let knownRyoCost=0,costUnknown=false,unknownStocks=false;
  if(enabled)for(const recipe of OTHER_MATERIAL_AWAKENING_RECIPES){
    const sourceKey=recipe.sourceKey,targetKey=recipe.targetKey,requiredTarget=result[targetKey]||0;
    if(!requiredTarget)continue;
    const directSource=result[sourceKey]||0,sourceStock=stock(sourceKey,stocks),targetStock=stock(targetKey,stocks);
    const sourceNeedExact=!uncertain.has(sourceKey),targetNeedExact=!uncertain.has(targetKey);
    const surplus=sourceStock===0?0:sourceStock!==null&&sourceNeedExact?Math.max(0,sourceStock-directSource):null;
    const covered=targetStock!==null&&targetStock>=requiredTarget;
    const deficit=covered?0:targetStock!==null&&targetNeedExact?Math.max(0,requiredTarget-targetStock):null;
    const craftCount=deficit===0?0:surplus!==null&&surplus<recipe.inputCount?0:surplus!==null&&deficit!==null?Math.min(deficit,Math.floor(surplus/recipe.inputCount)):null;
    const inputCount=craftCount===null?null:craftCount*recipe.inputCount,ryoCost=craftCount===null?null:craftCount*recipe.ryoCost;
    const stockUnknown=craftCount===null&&(sourceStock===null||targetStock===null),progressionUnknown=craftCount===null&&(!sourceNeedExact||!targetNeedExact);
    const remainingTarget=targetNeedExact&&targetStock!==null&&craftCount!==null?Math.max(0,requiredTarget-targetStock-craftCount):null;
    const step={recipeId:recipe.recipeId,sourceKey,targetKey,sourceUnitId:recipe.source.unitId,targetUnitId:recipe.target.unitId,fromStars:recipe.source.stars,toStars:recipe.target.stars,craftCount,inputCount,ryoCost,exact:craftCount!==null,unknown:craftCount===null};
    conversions.push({recipeId:recipe.recipeId,kind:recipe.kind,source:recipe.source,target:recipe.target,sourceKey,targetKey,requiredTarget,directSource,protectedDirectNeeds:{[sourceKey]:directSource,[targetKey]:requiredTarget},sourceStock,targetStock,surplus,craftCount,count:craftCount,inputCount,ryoCost,remainingTarget,exact:craftCount!==null,unknown:craftCount===null,sourceUnknown:stockUnknown,progressionUnknown,steps:[step]});
    flags.set(targetKey,{exact:targetNeedExact,missing:remainingTarget,craftedCount:craftCount,materialAwakening:true,materialRecipeId:recipe.recipeId,awakeningUnknown:stockUnknown,materialAwakeningUnknown:stockUnknown});
    result[sourceKey]=directSource+(inputCount||0);
    const sourceExact=sourceNeedExact&&inputCount!==null;
    flags.set(sourceKey,{exact:sourceExact,missing:sourceExact&&result[sourceKey]===0?0:sourceExact&&sourceStock!==null?Math.max(0,result[sourceKey]-sourceStock):null,craftedCount:0,neededUnknown:inputCount===null,materialAwakening:true,materialRecipeId:recipe.recipeId,awakeningUnknown:stockUnknown,materialAwakeningUnknown:stockUnknown});
    if(!sourceExact)uncertain.add(sourceKey);
    if(ryoCost===null){costUnknown=true;uncertain.add('ryo');}else knownRyoCost+=ryoCost;
    unknownStocks||=stockUnknown;
  }
  if(conversions.length){
    result.ryo=(result.ryo||0)+knownRyoCost;
    const prior=flags.get('ryo')||{};
    flags.set('ryo',{...prior,exact:!uncertain.has('ryo'),neededUnknown:!!(prior.neededUnknown||costUnknown),awakeningUnknown:!!(prior.awakeningUnknown||unknownStocks),materialAwakeningUnknown:unknownStocks,knownNeeded:result.ryo});
  }
  return {enabled,conversions,steps:conversions.flatMap(c=>c.steps),ryoCost:costUnknown?null:knownRyoCost,knownRyoCost,recipes:OTHER_MATERIAL_AWAKENING_RECIPES,recipeCount:OTHER_MATERIAL_AWAKENING_RECIPES.length,assumptions:['Les besoins directs des matériaux source sont réservés avant leur éveil','Une recette est proposée seulement si sa cible est réellement nécessaire','Les stocks inconnus ne sont jamais considérés comme nuls','Les cristaux personnels LB et pierres de capacités ne font pas partie de ces conversions']};
}
