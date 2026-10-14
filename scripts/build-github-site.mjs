import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(root,'dist');
if(path.dirname(output)!==path.resolve(root)||path.basename(output)!=='dist')throw Error('Unsafe build destination');
try{if((await fs.lstat(output)).isSymbolicLink())throw Error('Build destination must not be a symlink');}catch(error){if(error.code!=='ENOENT')throw error;}
await fs.rm(output,{recursive:true,force:true});
await fs.mkdir(output,{recursive:true});
const files=JSON.parse(await fs.readFile(path.join(root,'SITE_FILES.json'),'utf8'));
for(const name of files){
  if(typeof name!=='string'||path.basename(name)!==name||name.includes('\\')||! /\.(?:js|css|json|html|txt)$/.test(name)||/^(?:account-|confirmed-gifts-audit|availability-user-confirmation)/.test(name))throw Error('Unsafe runtime filename');
  const source=path.join(root,name);if((await fs.lstat(source)).isSymbolicLink())throw Error('Runtime files must not be symlinks');
  await fs.copyFile(source,path.join(output,name));
}
let python;
for(const candidate of process.env.PYTHON?[process.env.PYTHON]:process.platform==='win32'?['python','python3']:['python3','python']){
  try{execFileSync(candidate,['--version'],{stdio:'pipe'});python=candidate;break;}catch{}
}
if(!python)throw Error('Python 3 is required to verify and extract native assets');
execFileSync(python,[path.join(root,'scripts','extract-github-assets.py'),root,output],{stdio:'inherit'});
const {generateImportReferences}=await import('./build-import-reference.mjs');
await generateImportReferences({baseUrl:process.env.SITE_BASE_URL||'https://arosare.github.io/naruto-blazing-revival/'});
const profile=JSON.parse(await fs.readFile(path.join(output,'arosa.json'),'utf8'));
if(profile.publicDefaults!==true||profile.collection?.length!==0||Object.keys(profile).some(key=>!['publicDefaults','collection'].includes(key)))throw Error('Public build must use an empty personal profile');
console.log(`Public site built: ${files.length} runtime files + native assets + generated import reference in ${output}`);
