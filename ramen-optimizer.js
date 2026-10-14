const VALUES=[17,110],RAW=[1,3,9,54],CRAFT=[0,200,800,5300],BASE=[2200,8000,34000,220000];
export const RAMEN_FARM_RATIO=Object.freeze({3:2,4:1});
export const RAMEN_MIX_OBJECTIVE=Object.freeze(['farm-ratio-one-four-two-three','cover-stage-experience']);
export function ramenOptimizerDiagnostics(){return {approach:'farm-ratio-whole-batches',allowedFeedingStars:[3,4],farmRatio:{...RAMEN_FARM_RATIO},prefixStates:0,prefixBytes:0};}
export function optimizeRamen(experienceNeeded,options={}){
  const empty={1:0,2:0,3:0,4:0};
  if(!Number.isSafeInteger(experienceNeeded)||experienceNeeded<0)return {supported:false,reason:'experience-unknown',counts:empty,providedExp:null,unavoidableWaste:null,exactPossible:null};
  const campaign=options.campaignMultiplier??1,success=options.successMultiplier??1;
  if(!Number.isFinite(campaign)||campaign<=0||!Number.isFinite(success)||success<=0)return {supported:false,reason:'invalid-bonus',counts:empty,providedExp:null,unavoidableWaste:null,exactPossible:null};
  const multiplier=(options.sameElement===false?1:1.5)*campaign*success,unroundedGains=BASE.map(exp=>exp*multiplier),gains=unroundedGains.map(Math.round);
  // Native default/confirmed bonuses preserve these integer proportions. Do not
  // invent the client's rounding rule for an arbitrary fractional campaign.
  const gcd=(a,b)=>{while(b){[a,b]=[b,a%b];}return a;};
  const feedingGains=gains.slice(2),scale=feedingGains.every(gain=>Number.isSafeInteger(gain)&&gain>0)?feedingGains.reduce(gcd):0;
  if(!scale||unroundedGains.slice(2).some((gain,i)=>!Number.isFinite(gain)||Math.abs(gain-feedingGains[i])>1e-7)||feedingGains.some((gain,i)=>gain!==scale*VALUES[i]))return {supported:false,reason:'unconfirmed-fractional-bonus',counts:empty,providedExp:null,unavoidableWaste:null,exactPossible:null};
  // User-provided approximate farming yield: one four-star and two three-stars.
  // Round up complete batches at each cap; waste does not change the ratio.
  const counts={...empty},gain3=gains[2],gain4=gains[3],batches=Math.ceil(experienceNeeded/(gain4+2*gain3));
  counts[4]=batches;counts[3]=2*batches;
  const providedExp=counts[3]*gain3+counts[4]*gain4,waste=providedExp-experienceNeeded;
  return {supported:true,reason:null,counts,farmRatio:{...RAMEN_FARM_RATIO},batches,allowedFeedingStars:[3,4],providedExp,unavoidableWaste:waste,exactPossible:waste===0,experienceNeeded,feedCount:counts[3]+counts[4],rawInputEquivalent:Object.entries(counts).reduce((sum,[star,q])=>sum+q*RAW[Number(star)-1],0),intrinsicAwakeningRyo:Object.entries(counts).reduce((sum,[star,q])=>sum+q*CRAFT[Number(star)-1],0),gains:Object.fromEntries(gains.map((exp,i)=>[i+1,Math.abs(unroundedGains[i]-exp)<=1e-7?exp:null])),objective:RAMEN_MIX_OBJECTIVE.slice(),stockOptimal:false};
}
