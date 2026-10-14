import fs from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {buildImportReference} from '../dist/box-import.js';

// Run from any directory: node scripts/build-import-reference.mjs
// Reads only public catalogue/assets. No account data or EXP curves are copied.
const publicBase='https://arosare.github.io/naruto-blazing-revival/';
const defaultDist=new URL('../dist/',import.meta.url);

/** A directory URL keeps relative links and portraits below the site prefix. */
export function normalizeSiteBaseUrl(value){
  let url;
  try{url=new URL(value);}catch{throw new Error('SITE_BASE_URL doit être une URL absolue HTTPS, ou HTTP sur localhost.');}
  const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&local))throw new Error('SITE_BASE_URL doit utiliser HTTPS ; HTTP est réservé à localhost.');
  if(url.username||url.password||url.search||url.hash)throw new Error('SITE_BASE_URL doit désigner la racine du site sans identifiants, paramètres ni fragment.');
  if(!url.pathname.endsWith('/'))url.pathname+='/';
  return url.href;
}

function outputDirectoryUrl(value){
  const url=value instanceof URL?new URL(value):pathToFileURL(path.resolve(value));
  if(url.protocol!=='file:')throw new Error('outputDirectory doit désigner un dossier local.');
  if(!url.pathname.endsWith('/'))url.pathname+='/';
  return url;
}
const escape=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const text=value=>escape(value===null||value===undefined?'Inconnu (null)':value);
const compare=(a,b)=>a<b?-1:a>b?1:0;
const slug=name=>name.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'personnage';
const image=(url,alt)=>url?`<img src="${escape(url)}" alt="${escape(alt)}" width="72" height="72" loading="lazy">`:'Visuel indisponible';
const layout=(title,body)=>`<!doctype html>
<html lang="fr"><head><meta name="generator" content="MakeProject · Release 33"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · Référence d’import Naruto Blazing</title><style>body{font:16px/1.5 system-ui,sans-serif;margin:0 auto;padding:24px;max-width:1400px;color:#17212b;background:#fafafa}a{color:#164e9b}table{border-collapse:collapse;width:100%;background:white}th,td{border:1px solid #cbd3dc;padding:8px;text-align:left;vertical-align:top}th{background:#edf2f7}caption{text-align:left;font-weight:600;padding:12px 0}.table-wrap{overflow-x:auto}img{max-width:none;object-fit:contain}code{overflow-wrap:anywhere}li{padding:4px 0}nav{display:flex;flex-wrap:wrap;gap:16px}small{font-size:.9em}</style></head><body>${body}</body></html>\n`;

/** Plain HTML lets a web reader open only the names present in screenshots.
 * Source objects are already public, with no account observations or EXP curves.
 * Returned paths are confined to this generated reference namespace.
 */
export function buildReferenceHtml(reference,baseUrl=publicBase){
  const byName=new Map();
  for(const row of reference.characters){if(!byName.has(row.name))byName.set(row.name,[]);byName.get(row.name).push(row);}
  const names=[...byName.keys()].sort(compare),slugCounts=new Map();
  for(const name of names){const key=slug(name);slugCounts.set(key,(slugCounts.get(key)||0)+1);}
  const paths=new Map(names.map(name=>{
    const key=slug(name),suffix=slugCounts.get(key)>1?'-'+createHash('sha256').update(name).digest('hex').slice(0,10):'';
    return [name,`import-reference/personnages-${key}${suffix}.html`];
  }));
  const url=relative=>new URL(relative,baseUrl).href;
  const navigation=()=>`<nav aria-label="Références d’import"><a href="${escape(url('reference-pour-chatgpt.html'))}">Index des personnages</a><a href="${escape(url('import-reference/ressources.html'))}">Ressources et stocks</a><a href="${escape(url('box-import.schema.json'))}">Schéma JSON</a><a href="${escape(url('box-import-reference.json'))}">Référence JSON complète</a></nav>`;
  const pages=new Map();
  const indexBody=`<h1>Référence pour identifier une box Naruto Blazing</h1>
<p>Référence publique du client ${escape(reference.clientVersion||'du catalogue')}. Elle contient ${reference.characters.length} formes natives et ${reference.resources.length} ressources, sans progression ni stocks d’un compte.</p>
<p>Pour lire des captures, ouvre uniquement les pages des noms visibles ci-dessous, puis la page des ressources si des stocks sont visibles. Chaque page de personnage regroupe toutes les versions et formes de ce nom exact. Utilise le portrait, le titre, le numéro de carte et les étoiles ensemble pour identifier un <code>unitId</code>. Si plusieurs formes restent possibles, n’invente pas d’identification.</p>
<p>Les plafonds sont des règles du client, pas les valeurs possédées. Une progression non visible reste <code>null</code>. Une seule observation par <code>familyId</code> est acceptée ; ne fusionne pas plusieurs captures de la même version.</p>
${navigation()}
<h2>Personnages par nom</h2><ul>${names.map(name=>`\n<li><a href="${escape(url(paths.get(name)))}">${escape(name)}</a> — ${byName.get(name).length} formes</li>`).join('')}\n</ul>`;
  pages.set('reference-pour-chatgpt.html',layout('Index public pour ChatGPT',indexBody));
  for(const name of names){
    const rows=byName.get(name).slice().sort((a,b)=>compare(a.title,b.title)||a.unitId-b.unitId);
    const body=`${navigation()}<h1>${escape(name)} — versions et formes natives</h1>
<p>${rows.length} formes du catalogue. Les titres français sont fournis uniquement lorsqu’ils sont documentés. Les bonus PV, ATK et vitesse ci-dessous sont les plafonds des pilules, pas les statistiques totales ni une progression de compte. L’activité ou l’obtention actuelle de ces formes n’est pas confirmée par cette référence.</p>
<div class="table-wrap"><table><caption>Identifiants exacts et plafonds de chaque forme de ${escape(name)}</caption><thead><tr><th scope="col">unitId</th><th scope="col">Version (familyId)</th><th scope="col">Titre</th><th scope="col">Titre français</th><th scope="col">Carte (cardNo)</th><th scope="col">Étoiles</th><th scope="col">Élément</th><th scope="col">Plafond normal</th><th scope="col">Plafond final avec LB</th><th scope="col">Bonus pilules PV max</th><th scope="col">Bonus pilules ATK max</th><th scope="col">Bonus pilules vitesse max</th><th scope="col">Capacités max</th><th scope="col">Chance max</th><th scope="col">Paliers unlockedCap</th><th scope="col">Portrait natif</th></tr></thead><tbody>${rows.map(row=>`\n<tr data-unit-id="${escape(row.unitId)}"><th scope="row">${text(row.unitId)}</th><td><code>${text(row.familyId)}</code></td><td>${text(row.title)}</td><td>${text(row.titleFr)}</td><td>${text(row.cardNo)}</td><td>${text(row.stars)}★</td><td>${text(row.element)}</td><td>${text(row.baseCap)}</td><td>${text(row.finalCap)}</td><td>${text(row.plusCaps?.hp)}</td><td>${text(row.plusCaps?.atk)}</td><td>${text(row.plusCaps?.speed)}</td><td>${text(row.abilitiesCount)}</td><td>${text(row.luckCap)}</td><td>${escape((row.unlockedCaps||[]).join(', '))}</td><td>${image(row.imageURL,`${row.name} — ${row.titleFr||row.title} · carte ${row.cardNo} · ${row.stars}★ · unitId ${row.unitId}`)}</td></tr>`).join('')}\n</tbody></table></div>`;
    pages.set(paths.get(name),layout(name,body));
  }
  const resourceBody=`${navigation()}<h1>Ressources — identifiants natifs et clés de stock</h1>
<p>${reference.resources.length} ressources de référence. Utilise la clé de stock (<code>key</code>) correspondant au portrait et à la rareté visibles. Les alias d’un même objet ne sont pas des stocks distincts. Pour un objet observé, <code>0</code> signifie aucun exemplaire ; une quantité non visible reste <code>null</code> ou absente.</p>
<div class="table-wrap"><table><caption>Ressources natives, éléments, raretés et portraits</caption><thead><tr><th scope="col">Clé de stock (key)</th><th scope="col">ID natif (nativeUnitId)</th><th scope="col">Nom</th><th scope="col">Titre</th><th scope="col">Libellé français</th><th scope="col">Rareté</th><th scope="col">Élément</th><th scope="col">Alias du même objet</th><th scope="col">Portrait natif</th></tr></thead><tbody>${reference.resources.map(row=>`\n<tr data-stock-key="${escape(row.key)}"><th scope="row"><code>${text(row.key)}</code></th><td>${text(row.nativeUnitId)}</td><td>${text(row.name)}</td><td>${text(row.title)}</td><td>${text(row.nameFr)}</td><td>${row.rarity==null?'Sans rareté':text(row.rarity)+'★'}</td><td>${row.element==null?'Sans élément':text(row.element)}</td><td>${(row.aliases||[]).map(alias=>`<code>${escape(alias)}</code>`).join(', ')||'Aucun'}</td><td>${image(row.imageURL,`${row.name} — ${row.title||row.nameFr} · ${row.rarity==null?'sans rareté':row.rarity+'★'} · stock ${row.key}`)}</td></tr>`).join('')}\n</tbody></table></div>`;
  pages.set('import-reference/ressources.html',layout('Ressources et clés de stock',resourceBody));
  return pages;
}

export async function generateImportReferences({baseUrl=process.env.SITE_BASE_URL||publicBase,outputDirectory=defaultDist}={}){
  baseUrl=normalizeSiteBaseUrl(baseUrl);
  const output=outputDirectoryUrl(outputDirectory);
  const [catalogue,logos]=await Promise.all(['catalogue.json','logos.json'].map(async name=>JSON.parse(await fs.readFile(new URL(name,defaultDist),'utf8'))));
  const reference=buildImportReference(catalogue,logos,baseUrl),pages=buildReferenceHtml(reference,baseUrl);
  await fs.mkdir(new URL('import-reference/',output),{recursive:true});
  // No directory cleanup: overwrite only the exact generated files below.
  await fs.writeFile(new URL('box-import-reference.json',output),JSON.stringify(reference)+'\n','utf8');
  await Promise.all([...pages].map(([relative,html])=>fs.writeFile(new URL(relative,output),html,'utf8')));
  console.log(`${reference.characters.length} formes, ${reference.resources.length} ressources, ${pages.size} pages HTML · ${fileURLToPath(new URL('reference-pour-chatgpt.html',output))}`);
  return {baseUrl,outputDirectory:fileURLToPath(output),characterCount:reference.characters.length,resourceCount:reference.resources.length,pageCount:pages.size};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))await generateImportReferences();
