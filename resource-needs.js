// Preserve uncertainty: an unknown or reference is still worth checking in-game.
export function actionableResourceRows(rows) {
  return rows.filter(row => row.missing !== 0 || row.exact === false || row.neededUnknown || row.awakeningUnknown);
}

// Use the evaluated deficits: shared stocks and planned conversions have
// already been allocated once by the budget. Never subtract stock again.
export function remainingResourceSummary(plan) {
  const rows=plan?.rows||[],groups={tokens:key=>key==='tokens',ryo:key=>key==='ryo',ramen:key=>key.startsWith('ramen:'),scroll:key=>key.startsWith('scroll:'),pill:key=>key.startsWith('pill:')};
  return Object.fromEntries(Object.entries(groups).map(([key,matches])=>{
    const selected=rows.filter(row=>matches(row.key));let knownMissing=0,unknownCount=0;
    for(const row of selected){
      if(Number.isSafeInteger(row.missing)&&row.missing>=0)knownMissing+=row.missing;
      else if(!(row.needed===0&&row.exact!==false&&!row.neededUnknown))unknownCount++;
    }
    if(key==='ramen')unknownCount+=(plan?.plans||[]).filter(p=>{
      const training=p.training,ramen=training?.ramen;
      return ramen&&(ramen.sameElement===false||ramen.supported===false)&&(training.experienceNeeded>0||training.experienceUpperBound>0);
    }).length;
    return [key,{value:unknownCount?null:knownMissing,knownMissing,unknownCount}];
  }));
}

export const isFarmResource=key=>/^(ramen|scroll|pill):/.test(key);

// Stable entry fields let players record every rarity dropped by a run,
// including a lower rarity whose direct need is already covered.
export function resourceEntryRows(rows,stocks={},elements=['Heart','Skill','Body','Bravery','Wisdom']){
  const entries=new Map(rows.map(row=>[row.key,row]));
  const add=key=>{if(!entries.has(key))entries.set(key,{key,needed:0,stock:Number.isSafeInteger(stocks[key])&&stocks[key]>=0?stocks[key]:null,missing:0,exact:true});};
  for(const element of elements)for(const kind of ['ramen','scroll'])for(const star of [1,2,3,4])add(`${kind}:${element}:${star}`);
  for(const stat of ['hp','atk','speed'])for(const star of [2,3])add(`pill:${stat}:${star}`);
  return [...entries.values()];
}

export function visibleResourceEntryRows(rows,hideCovered=false){
  if(!hideCovered)return rows;
  const actionable=new Set(actionableResourceRows(rows).map(row=>row.key));
  return rows.filter(row=>isFarmResource(row.key)||actionable.has(row.key));
}

const cell = value => {
  let text = String(value ?? 'Inconnu');
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
};

export function resourceNeedsCsv(rows, {resourceInfo, scope, date}) {
  const records = [['Ressource', 'Détail', 'Besoin', 'Mon stock', 'Manque', 'Précision', 'Périmètre', 'Date', 'Base du calcul', 'Surplus de parchemins pour fusion', 'Parchemins obtenus par fusion']];
  for (const row of rows) {
    const info = resourceInfo(row.key);
    const uncertain = row.exact === false || row.neededUnknown;
    const scroll = row.key.startsWith('scroll:');
    const conversionUnknown = row.awakeningUnknown || row.conversionUnknown;
    records.push([
      info.name, info.subtitle,
      row.neededUnknown ? 'À préciser' : row.needed,
      row.stock, row.missing,
      uncertain ? 'Référence : progression ou hypothèses à préciser' : conversionUnknown ? 'Besoin initial connu ; fusion à préciser' : row.missing == null ? 'Stock à renseigner' : 'Selon les valeurs renseignées',
      scope, date,
      'Début du niveau saisi ou niveau 1 pour une prévision ; ryō de nourrissage exclus ; stocks non consommés',
      scroll ? row.craftConsumed === null ? 'À préciser' : row.craftConsumed ?? 0 : '',
      scroll ? row.craftedCount === null ? 'À préciser' : row.craftedCount ?? 0 : ''
    ]);
  }
  return '\uFEFF' + records.map(record => record.map(cell).join(';')).join('\r\n') + '\r\n';
}
