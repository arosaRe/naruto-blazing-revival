// Client-confirmed gains; this module suggests allocations without changing stocks.
export const PILL_BUDGET_GAINS = Object.freeze({
  hp: Object.freeze({2:5,3:10}),
  atk: Object.freeze({2:2,3:4}),
  speed: Object.freeze({2:1,3:2})
});
const known = value => Number.isSafeInteger(value) && value >= 0;
const stockKey = (stat,stars) => `pill:${stat}:${stars}`;
const count = (points,gain) => Math.ceil(points/gain);

function readNeed(plan,need,order) {
  const derived = known(need.cap) && known(need.actual) ? Math.max(0,need.cap-need.actual) : null;
  const points = derived ?? (known(need.remainingPoints) ? need.remainingPoints : null);
  const exact = need.exact !== false && points !== null;
  const upper = exact ? points : known(need.upperBound) ? need.upperBound : known(need.cap) ? need.cap : null;
  return {id:plan.id??String(order),order,stat:need.stat,initialPoints:exact?points:null,upperBoundPoints:upper,remainingPoints:exact?points:null,progressionExact:exact,used2:0,used3:0};
}

export function calculatePillBudget(plans=[],stocks={}) {
  const requirements={},stockReservations={},uncertainResourceKeys=[],rows=[],summaries=[],allocations=[];
  for(const [stat,gains] of Object.entries(PILL_BUDGET_GAINS)) {
    const entries=plans.flatMap((plan,order)=>(plan.pillNeeds||[]).filter(need=>need.stat===stat).map(need=>readNeed(plan,need,order)));
    if(!entries.length)continue;
    const key2=stockKey(stat,2),key3=stockKey(stat,3);
    const stock2=known(stocks[key2])?stocks[key2]:null,stock3=known(stocks[key3])?stocks[key3]:null;
    const progressionExact=entries.every(entry=>entry.progressionExact);
    const baseline3=entries.reduce((sum,entry)=>sum+(entry.upperBoundPoints===null?0:count(entry.upperBoundPoints,gains[3])),0);
    const noNeed=progressionExact && entries.every(entry=>entry.initialPoints===0);
    const largeStockCoversAll=progressionExact && stock3!==null && stock3>=baseline3;
    const exact=progressionExact && (noNeed || largeStockCoversAll || stock2!==null && stock3!==null);
    const reasons=[];
    if(!progressionExact)reasons.push('progression-unknown');
    if(!noNeed && !largeStockCoversAll) {
      if(stock2===null)reasons.push('two-star-stock-unknown');
      if(stock3===null)reasons.push('three-star-stock-unknown');
    }
    let remaining2=stock2,remaining3=stock3,used2=0,used3=0,missing3=null;
    if(exact) {
      remaining2??=0;remaining3??=0;
      // Full boosts avoid spending a large pill on a small gap while a full gap remains.
      for(const entry of entries) {
        const use=Math.min(remaining3,Math.floor(entry.remainingPoints/gains[3]));
        entry.used3+=use;entry.remainingPoints-=use*gains[3];remaining3-=use;
      }
      // A large pill replaces two small pills for larger final gaps, only one for tiny gaps.
      const tails=entries.filter(entry=>entry.remainingPoints>0).sort((a,b)=>
        Number(b.remainingPoints>gains[2])-Number(a.remainingPoints>gains[2]) || a.order-b.order);
      for(const entry of tails) {
        if(!remaining3)break;
        entry.used3++;entry.remainingPoints=Math.max(0,entry.remainingPoints-gains[3]);remaining3--;
      }
      // Each eligible single small pill removes one still-missing large pill.
      for(const entry of entries) {
        const residue=entry.remainingPoints%gains[3];
        if(remaining2>0 && residue>0 && residue<=gains[2]) {
          entry.used2++;entry.remainingPoints=Math.max(0,entry.remainingPoints-gains[2]);remaining2--;
        }
      }
      // All other large-pill replacements cost exactly two small pills.
      for(const entry of entries) {
        const usePairs=Math.min(Math.floor(remaining2/2),count(entry.remainingPoints,gains[3]));
        entry.used2+=2*usePairs;entry.remainingPoints=Math.max(0,entry.remainingPoints-usePairs*gains[3]);remaining2-=2*usePairs;
      }
      used2=entries.reduce((sum,entry)=>sum+entry.used2,0);
      used3=entries.reduce((sum,entry)=>sum+entry.used3,0);
      missing3=entries.reduce((sum,entry)=>sum+count(entry.remainingPoints,gains[3]),0);
      requirements[key2]=used2;requirements[key3]=used3+missing3;
      stockReservations[key2]=used2;stockReservations[key3]=used3;
    } else {
      // Keep a conservative large-pill preview; unknown inventories/progress are never zeroed.
      requirements[key2]=0;requirements[key3]=baseline3;
      stockReservations[key2]=null;stockReservations[key3]=null;
      uncertainResourceKeys.push(key2,key3);
    }
    for(const entry of entries)allocations.push({
      id:entry.id,stat,order:entry.order,initialPoints:entry.initialPoints,
      upperBoundPoints:entry.upperBoundPoints,used2:exact?entry.used2:null,used3:exact?entry.used3:null,
      remainingPoints:exact?entry.remainingPoints:null,
      missing3:exact?count(entry.remainingPoints,gains[3]):null,
      needed3:exact?entry.used3+count(entry.remainingPoints,gains[3]):entry.upperBoundPoints===null?null:count(entry.upperBoundPoints,gains[3]),
      needed2:exact?entry.used2:null,exact,progressionExact:entry.progressionExact
    });
    const users=entries.map(entry=>entry.id);
    rows.push({key:key2,needed:requirements[key2],stock:stock2,missing:exact?0:null,exact,neededUnknown:!exact,usedStock:exact?used2:null,users});
    rows.push({key:key3,needed:requirements[key3],stock:stock3,missing:missing3,exact,neededUnknown:!exact,usedStock:exact?used3:null,users});
    summaries.push({stat,gains:{...gains},stock2,stock3,used2:exact?used2:null,used3:exact?used3:null,remainingStock2:exact&&stock2!==null?remaining2:null,remainingStock3:exact&&stock3!==null?remaining3:null,required2:requirements[key2],required3:requirements[key3],missing3,exact,progressionExact,reasons});
  }
  return {requirements,rows,summaries,stats:summaries,allocations,stockReservations,uncertainResourceKeys,
    exact:summaries.every(summary=>summary.exact),
    scope:'direct-pill-use',stockMutation:false,awakeningRecipe:false,
    strategy:'Use full large-pill boosts, reserve large pills for bigger final gaps, then small pills that remove a missing large pill.',
    gains:PILL_BUDGET_GAINS};
}

export const allocPills = calculatePillBudget;
