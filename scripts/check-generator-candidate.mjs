import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../',import.meta.url));
const docs=path.join(root,'docs/generator-candidate');
const manifest=JSON.parse(await fs.readFile(path.join(docs,'manifest.json'),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(args,cwd=root)=>execFileSync('git',args,{cwd,encoding:'utf8'}).trim();
const patch=path.join(docs,'candidate.patch');
assert.equal(sha(await fs.readFile(patch)),manifest.patchSha256,'Patch fingerprint');
assert.equal(git(['rev-parse','origin/main']),manifest.base,'Fetch first; production base must still match');
assert.equal(Number(process.versions.node.split('.')[0]),24,'Node 24 required');
const destination=process.argv[2];
assert.ok(destination,'Usage: node scripts/check-generator-candidate.mjs <new-directory-outside-repository>');
const target=path.resolve(destination);
assert.ok(!target.startsWith(path.resolve(root)+path.sep)&&target!==path.resolve(root),'Use a directory outside the repository');
await fs.mkdir(target); // Exclusive; preserve all earlier evidence and builds.
const env={...process.env};
delete env.SITE_BASE_URL;
delete env.FEEDBACK_ENDPOINT;
for(const kind of ['base','candidate']){
  const cwd=path.join(target,kind);
  git(['worktree','add','--detach',cwd,manifest.base]);
  if(kind==='candidate'){
    git(['apply','--check',patch],cwd);
    git(['apply',patch],cwd);
    assert.deepEqual(git(['diff','--name-only'],cwd).split(/\r?\n/),manifest.files);
    const before=execFileSync('git',['show',`${manifest.base}:${manifest.files[0]}`],{cwd});
    const after=await fs.readFile(path.join(cwd,manifest.files[0]));
    assert.deepEqual(after,Buffer.from(before.toString('utf8').replace('<html lang="fr"><head>','<html lang="fr"><head>'+manifest.generator)),'Only the meta may change in source');
  }else assert.equal(git(['status','--porcelain'],cwd),'');
  execFileSync(process.execPath,['scripts/build-github-site.mjs'],{cwd,env,stdio:'inherit'});
}
async function files(directory,prefix=''){
  const result=[];
  for(const entry of await fs.readdir(directory,{withFileTypes:true})){
    const relative=prefix+entry.name;
    assert.ok(!entry.isSymbolicLink(),'No symlink in dist');
    if(entry.isDirectory())result.push(...await files(path.join(directory,entry.name),relative+'/'));
    else result.push(relative);
  }
  return result.sort();
}
const baseDist=path.join(target,'base/dist'),candidateDist=path.join(target,'candidate/dist');
const names=await files(baseDist);
assert.deepEqual(await files(candidateDist),names,'Same artifact file set');
const records=[];
let references=0,unchanged=0,html=0;
for(const name of names){
  const before=await fs.readFile(path.join(baseDist,name));
  const after=await fs.readFile(path.join(candidateDist,name));
  const reference=name==='reference-pour-chatgpt.html'||/^import-reference\/.*\.html$/.test(name);
  if(name.endsWith('.html')){
    html++;
    const head=after.toString('utf8').match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
    assert.ok(head,`${name}: head exists`);
    assert.equal((head.match(/<meta\b[^>]*\bname\s*=\s*["']generator["'][^>]*>/gi)||[]).length,1,`${name}: exactly one generator`);
    assert.equal(head.split(manifest.generator).length-1,1,`${name}: exact release`);
  }
  if(reference){
    references++;
    assert.equal(before.toString('utf8').includes(manifest.generator),false,`${name}: absent from base`);
    assert.deepEqual(Buffer.from(after.toString('utf8').replace(manifest.generator,'')),before,`${name}: removing only meta restores exact bytes`);
  }else{
    assert.deepEqual(after,before,`${name}: unchanged bytes`);
    unchanged++;
  }
  records.push({path:name,baseSha256:sha(before),candidateSha256:sha(after),change:reference?'generator-only':'identical'});
}
assert.equal(references,manifest.expectedReferencePages);
const report={base:manifest.base,patchSha256:manifest.patchSha256,node:process.version,platform:process.platform,architecture:process.arch,generatedAtUtc:new Date().toISOString(),buildEnvironment:{SITE_BASE_URL:'unset (production default)',FEEDBACK_ENDPOINT:'unset (production default)'},referencePages:references,htmlPages:html,unchangedFiles:unchanged,totalFiles:names.length,records};
await fs.writeFile(path.join(target,'comparison.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,records:undefined,report:path.join(target,'comparison.json')},null,2));
// Detached worktrees and evidence remain available for review; no commit or publication.
