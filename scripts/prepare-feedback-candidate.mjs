import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'docs/feedback-candidate/manifest.json'), 'utf8'));
const destination = process.argv[2];
if (!destination) throw Error('Usage: node scripts/prepare-feedback-candidate.mjs <new-directory>');
const target = path.resolve(destination);
// mkdir is exclusive: never overwrite an existing checkout or build.
await fs.mkdir(target);
const patch = path.join(root, 'docs/feedback-candidate/candidate.patch');
const digest = createHash('sha256').update(await fs.readFile(patch)).digest('hex');
if (digest !== manifest.patchSha256) throw Error('Patch checksum mismatch');
execFileSync('git', ['worktree', 'add', '--detach', target, manifest.base], {cwd:root, stdio:'inherit'});
execFileSync('git', ['apply', '--check', patch], {cwd:target, stdio:'inherit'});
execFileSync('git', ['apply', patch], {cwd:target, stdio:'inherit'});
execFileSync('git', ['add', '--intent-to-add', 'feedback.js', 'feedback-config.js'], {cwd:target});
const changed = execFileSync('git', ['diff', '--name-only'], {cwd:target, encoding:'utf8'}).trim().split(/\r?\n/).sort();
if (JSON.stringify(changed) !== JSON.stringify([...manifest.files].sort())) throw Error('Unexpected candidate files');
console.log(`Candidate ready at ${target}; detached base ${manifest.base}. No build, commit, push or publication performed.`);
