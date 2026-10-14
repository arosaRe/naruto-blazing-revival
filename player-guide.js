import {CURRENT_MAX_STARS,ELEMENTS} from './model.js?v=20261014-public-import1';

const known=value=>Number.isSafeInteger(value)&&value>=0;
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatNumber=value=>new Intl.NumberFormat('fr-CH').format(value);
const elementName=value=>ELEMENTS[value]?.name??value;
const isFuture=n=>n?.upcoming===true||n?.availability==='upcoming'||n?.availabilityKind==='upcoming';
const progressFor=(characters,id)=>characters instanceof Map?characters.get(id):characters?.[id];
const planningForms=n=>(n?.forms||[]).filter(f=>known(f.stars)&&f.stars<=CURRENT_MAX_STARS);
const editableCharacters=(characters,state)=>(characters||[]).filter(n=>n&&progressFor(state,n.id)?.owned===true&&!isFuture(n)&&planningForms(n).length);

/** Fields used by the current level-and-pills budget, never proof of game progress.
 * A legacy star value identifies a form only when it is unambiguous.
 * Goals can suppress fields that do not participate in the requested budget.
 */
export function progressionGaps(ownedCharacters,charactersState,{goals={level:true,pills:true}}={}){
  const level=goals.level!==false,pills=goals.pills!==false;
  return editableCharacters(ownedCharacters,charactersState).flatMap(n=>{
    const p=progressFor(charactersState,n.id),forms=planningForms(n),missing=[];
    const matchingStars=forms.filter(f=>f.stars===p.stars);
    const form=known(p.unitId)?forms.find(f=>f.client?.unitId===p.unitId):matchingStars.length===1?matchingStars[0]:null;
    if(level&&!form)missing.push('Forme actuelle');
    if(level&&!known(p.level))missing.push('Niveau actuel');
    if(pills)for(const [key,label] of [['hp','Bonus pilules PV'],['atk','Bonus pilules ATK'],['speed','Bonus pilules vitesse']])if(!known(p[key]))missing.push(label);
    return missing.length?[{id:n.id,name:n.name,title:n.title,missing}]:[];
  });
}

const needsAttention=row=>row?.missing>0||row?.missing===null||row?.neededUnknown===true||row?.awakeningUnknown===true||row?.exact===false;
const dropMatches=(drop,scroll)=>drop?.element===scroll.element&&drop?.stars===scroll.stars;
const copyStage=stage=>({rank:stage.rank??null,stamina:stage.stamina??null,drops:(stage.drops||[]).map(d=>({...d})),...(Array.isArray(stage.lucky)?{lucky:stage.lucky.map(d=>({...d}))}:{})});

/** Community mission references, not a farming recommendation or live calendar.
 * lb is retained in the public API; LB labels alone do not attest mission drops.
 */
export function farmingReferences(rows,catalogue,lb){
  const farming=catalogue?.farming||{},source=farming.source||{};
  const metadata={sourceName:source.name||'Source communautaire du catalogue',sourceUrl:source.url||'',availability:'À vérifier dans le jeu'};
  const relevant=(rows||[]).filter(needsAttention),scrolls=[],specials=[];
  for(const row of relevant){
    const scroll=/^scroll:([^:]+):([1-9]\d*)$/.exec(row.key||'');
    if(scroll){
      const element=scroll[1],stars=Number(scroll[2]);
      scrolls.push({element,stars,row,related:{key:row.key,name:`Parchemins ${elementName(element)} ${stars}★`,missing:row.missing??null,exact:row.exact!==false&&!row.neededUnknown&&!row.awakeningUnknown,neededUnknown:row.neededUnknown===true,awakeningUnknown:row.awakeningUnknown===true}});
    }else if(row.key?.startsWith('special:')){
      const name=row.key.slice('special:'.length);
      if(Object.hasOwn(farming.special||{},name))specials.push({name,row});
    }
  }
  const references=[];
  for(const [key,mission] of Object.entries(farming.missions||{})){
    const matches=(mission.stages||[]).map(stage=>({stage,scrolls:scrolls.filter(s=>[...(stage.drops||[]),...(stage.lucky||[])].some(drop=>dropMatches(drop,s)))})).filter(s=>s.scrolls.length);
    if(!matches.length)continue;
    const related=new Map(matches.flatMap(s=>s.scrolls).map(s=>[s.row.key,s.related]));
    references.push({id:`scroll:${key}`,kind:'scroll',title:mission.title||key,...metadata,stages:matches.map(s=>copyStage(s.stage)),related:[...related.values()]});
  }
  for(const {name,row} of specials){
    const mission=farming.special[name];
    references.push({id:`special:${name}`,kind:'special',title:mission.mission||name,...metadata,stages:[{rank:mission.rank??null,stamina:mission.stamina??null,drops:[{name}]}],related:[{key:row.key,name,missing:row.missing??null,exact:row.exact!==false&&!row.neededUnknown&&!row.awakeningUnknown,neededUnknown:row.neededUnknown===true,awakeningUnknown:row.awakeningUnknown===true}]});
  }
  return references;
}

function renderReferences(references,esc,fmt){
  const dropLabel=drop=>drop.name||`${elementName(drop.element)} ${drop.stars}★`;
  const sourceLink=reference=>/^https:\/\//.test(reference.sourceUrl)?`<a href="${esc(reference.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(reference.sourceName)}</a>`:esc(reference.sourceName);
  return references.length?references.map(reference=>`<article class="guide-reference">
    <h3>${esc(reference.title)}</h3>
    <p class="caption">Source communautaire : ${sourceLink(reference)}.</p>
    <p class="notice"><strong>${esc(reference.availability)}</strong> · L’activité de cette mission sur Revival n’est pas confirmée par ces données.</p>
    <ul>${reference.related.map(row=>`<li><strong>${esc(row.name)}</strong> · ${row.awakeningUnknown?'besoin de référence, stocks des matériaux à préciser':row.exact===false?'besoin de référence, progression ou hypothèses à préciser':row.missing===null?'manque inconnu, stocks à renseigner':`manque calculé : ${esc(fmt(row.missing))}`}</li>`).join('')}</ul>
    <dl>${reference.stages.map(stage=>`<dt>Rang ${esc(stage.rank??'non précisé')} · ${known(stage.stamina)?`${esc(fmt(stage.stamina))} énergie`:'énergie non précisée'}</dt><dd>Drops référencés : ${stage.drops.length?stage.drops.map(drop=>esc(dropLabel(drop))).join(', '):'non précisés'}${stage.lucky?.length?`<br>Récompenses de chance référencées : ${stage.lucky.map(drop=>esc(dropLabel(drop))).join(', ')}`:''}.</dd>`).join('')}</dl>
  </article>`).join(''):'<p class="caption">Aucune référence de mission correspondante dans les données communautaires pour les manques de ce plan. Consulte les besoins et les missions du jeu avant de préparer ta session.</p>';
}

/** Pure HTML renderer: all navigation and progress actions are owned by app.js. */
export function renderPlayerGuide({catalogue,lb,ownedCharacters=[],charactersState={},plan={},goals={level:true,pills:true},accountMode,esc=escapeHtml,fmt=formatNumber}={}){
  const editable=editableCharacters(ownedCharacters,charactersState),gaps=progressionGaps(editable,charactersState,{goals});
  const planned=Array.isArray(plan.selected)?plan.selected.length:editable.filter(n=>progressFor(charactersState,n.id)?.planned===true).length;
  const rows=plan.rows||[],unknownStocks=rows.filter(row=>!known(row.stock)).length;
  const ordered=gaps.slice().sort((a,b)=>Number(progressFor(charactersState,b.id)?.planned===true)-Number(progressFor(charactersState,a.id)?.planned===true));
  const shown=ordered.slice(0,6),references=farmingReferences(rows,catalogue,lb);
  return `<section class="hero" aria-labelledby="guide-title"><div><div class="eyebrow">Naruto Blazing Revival · Aide aux joueurs</div><h1 id="guide-title">Préparer ma prochaine progression</h1><p>Choisis quelques personnages, renseigne leurs données et tes stocks, puis lis les ressources restantes avant de retourner dans le jeu.</p></div></section>
  <section class="panel" aria-labelledby="guide-start-title"><div class="panel-heading"><h2 id="guide-start-title">Un parcours en trois étapes</h2></div><div class="panel-body">
    <p class="notice">${accountMode==='personal'?'<strong>Ta box est conservée dans ce navigateur.</strong> Importe tes captures ou ajoute tes personnages pour préparer tes ressources.':'<strong>La box Arosa est préremplie.</strong>'} Les valeurs affichées ne sont pas synchronisées avec ton compte de jeu. Compare-les à ta box avant d’utiliser le budget ; un champ renseigné reste une donnée saisie ou importée.</p>
    <ol class="guide-steps"><li><h3>1. Choisir mes personnages</h3><p>Recherche un ninja avec son nom, son titre ou son numéro de carte. Vérifie sa version, puis coche « Mon plan » pour les personnages que tu veux améliorer maintenant. Les annonces servent d’aperçu consultable.</p><button type="button" class="button" data-nav="collection">Choisir dans ma collection</button></li><li><h3>2. Renseigner mes stocks</h3><p>Saisis ce que tu possèdes réellement. 0 signifie « aucun ». Une case vide signifie « inconnu » et peut empêcher un manque exact.</p><button type="button" class="button" data-nav="inventory">Renseigner mes stocks</button></li><li><h3>3. Lire mes besoins</h3><p>Ouvre le plan de niveau et pilules, puis garde les manques pour préparer ta session. Les conversions prévues réservent les besoins directs ; elles ne consomment pas tes stocks enregistrés.</p><button type="button" class="button" data-nav="plan">Lire mon plan</button></li></ol>
  </div></section>
  <section class="panel" aria-labelledby="guide-data-title"><div class="panel-heading"><h2 id="guide-data-title">Mes données à compléter</h2></div><div class="panel-body">
    <ul class="guide-summary" aria-label="Résumé des données renseignées"><li><strong>${esc(fmt(editable.length-gaps.length))} / ${esc(fmt(editable.length))}</strong><span>fiches avec les champs utiles renseignés</span></li><li><strong>${esc(fmt(planned))}</strong><span>personnages sélectionnés dans le plan</span></li><li><strong>${esc(fmt(gaps.length))}</strong><span>fiches à compléter selon les objectifs</span></li><li><strong>${esc(fmt(unknownStocks))}</strong><span>stocks inconnus parmi les lignes du plan</span></li></ul>
    <p class="caption">Pour le budget actuel : forme et niveau si l’objectif de niveau est actif ; bonus de pilules PV, ATK et vitesse si l’objectif de pilules est actif. Les valeurs 0 comptent comme renseignées. Ces nombres décrivent la saisie, pas une vérification dans le jeu.</p>
    ${shown.length?`<ul class="guide-gap-list">${shown.map(gap=>`<li><div><strong>${esc(gap.name)} — ${esc(gap.title)}</strong><p>À renseigner : ${esc(gap.missing.join(', '))}.</p></div><button type="button" class="button compact" data-progress="${esc(gap.id)}" aria-label="Compléter ${esc(gap.name+' — '+gap.title)}">Compléter la fiche</button></li>`).join('')}</ul>${ordered.length>shown.length?`<p class="caption">${esc(fmt(ordered.length-shown.length))} autres fiches à compléter dans la collection. Les personnages du plan sont affichés en premier.</p><button type="button" class="button compact" data-nav="collection">Ouvrir ma collection</button>`:''}`:'<p class="caption">Les champs utiles sont renseignés pour les personnages possédés affichés ici. Vérifie-les dans le jeu lorsque ta progression change.</p>'}
  </div></section>
  <section class="panel" aria-labelledby="guide-lexicon-title"><div class="panel-heading"><h2 id="guide-lexicon-title">Comprendre les fiches et le budget</h2></div><div class="panel-body"><dl class="guide-glossary">
    <dt>Éveil</dt><dd>Passage à une autre forme du personnage. La fiche indique les matériaux de cette forme. Choisis ta forme actuelle pour calculer les étapes restantes ; le plan vise les formes jusqu’à ${CURRENT_MAX_STARS}★.</dd>
    <dt>Limit Break (LB)</dt><dd>Paliers qui augmentent le plafond de niveau lorsqu’ils existent pour cette forme. Le plan déduit les paliers restants du niveau saisi selon les règles du client ; un portrait seul ne renseigne pas le niveau.</dd>
    <dt>Terrain et soutien</dt><dd>Deux compétences séparées dans la fiche, libellées Field Skill et Buddy Skill dans les données. Lis leur effet, leur portée et leurs conditions pour comparer deux versions d’un ninja ; elles ne sont pas interchangeables.</dd>
    <dt>Ultimate</dt><dd>Badge calculé sur la forme actuelle : éveil requis, niveau, capacités, chance et pilules PV/ATK au maximum selon le client. La vitesse au maximum ajoute la variante rouge. Ouvre la fiche pour voir chaque condition et les valeurs inconnues.</dd>
    <dt>Besoin, stock et manque</dt><dd>Le besoin vient des personnages du plan. Le stock est ta quantité renseignée. Le manque est ce qui reste après les stocks et conversions calculés ; un stock vide reste inconnu, même si un besoin de référence est affiché. 0 est une quantité connue, pas une case vide.</dd>
    <dt>Référence et valeur exacte</dt><dd>Une valeur marquée « Réf. » dépend de données de progression ou d’hypothèses à préciser. Un manque calculé dépend des valeurs saisies et des règles affichées ; il ne confirme pas les récompenses ni l’activité d’une mission sur le serveur.</dd>
  </dl></div></section>
  <section class="panel" aria-labelledby="guide-missions-title"><div class="panel-heading"><h2 id="guide-missions-title">Références de missions pour mon plan</h2></div><div class="panel-body"><p class="help-copy">Les pistes ci-dessous correspondent aux parchemins ou outils spéciaux encore manquants ou à préciser dans ce plan. Elles proviennent du catalogue communautaire. Les coûts sont des références ; les taux et quantités de drops ne sont pas renseignés ici. Le nombre de runs et le meilleur rendement restent à déterminer dans le jeu.</p><div class="guide-missions">${renderReferences(references,esc,fmt)}</div></div></section>
  <section class="panel" aria-labelledby="guide-save-title"><div class="panel-heading"><h2 id="guide-save-title">Conserver mes saisies</h2></div><div class="panel-body"><p>Tes modifications sont enregistrées sur ce navigateur. Télécharge une sauvegarde JSON dans « Sources & sauvegarde » pour les conserver si tu changes de navigateur ou d’appareil, puis restaure ce fichier au même endroit.</p><button type="button" class="button" data-nav="sources">Sources & sauvegarde</button></div></section>`;
}
