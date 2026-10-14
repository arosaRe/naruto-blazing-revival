const known = x => Number.isSafeInteger(x) && x >= 0;
export function displayForm(n,p={},preview=null){
  if(preview)return preview;
  if(!p.owned)return n.forms[0];
  return n.forms.find(f=>f.client?.unitId===p.unitId)||n.forms.find(f=>f.stars===p.stars)||n.forms[0];
}
export function addedProgress(n){
  const f=n.forms[0];return {owned:true,planned:true,unitId:f.client.unitId,stars:f.stars,level:0,xp:0,abilities:0,hp:0,atk:0,speed:0,luck:0,unlockedCap:null,progressEdited:true,abilitiesEdited:true,ownedEdited:true};
}
export function levelDisplay(n,p={},preview=null){
  const current=displayForm(n,p),f=displayForm(n,p,preview),same=f.client?.unitId===current.client?.unitId;
  const level=p.owned&&same&&known(p.level)?p.level:null;
  const base=f.client?.baseCap??f.maxLv,final=f.client?.finalCap??(f.maxLvLb||f.maxLv);
  const hasLb=known(base)&&known(final)&&final>base;
  // The native red test is exLimit > 0. With level-only entry, exceeding the
  // normal cap proves a purchased LB; a purchase below that cap is unknown.
  const red=level!==null&&hasLb&&level>base,max=level!==null&&known(final)&&level>=final;
  return {value:level===null?'—':max?'MAX':String(level),kind:level===null?'unknown':red?'lb':max?'max':'normal',color:red?'#FC566A':max?'#FFEF37':'#FFFFFF',level,baseCap:base,finalCap:final,hasLimitBreak:hasLb};
}
