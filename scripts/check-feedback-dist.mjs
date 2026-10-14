import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
async function check(dir) {
  for (const item of await fs.readdir(dir, {withFileTypes: true})) {
    const file = path.join(dir, item.name);
    assert.ok(!/^(relay|server\.mjs|\.env.*|feedback-relay\.test\.js)$/.test(item.name), `Server file in dist: ${file}`);
    if (item.isDirectory()) await check(file);
    else if (/\.(js|mjs|json|html|txt|css)$/.test(item.name)) {
      const text = await fs.readFile(file, 'utf8');
      assert.ok(!/DISCORD_WEBHOOK_URL|discord\.com\/api\/webhooks\/|secret-sentinel/.test(text), `Server configuration in dist: ${file}`);
    }
  }
}
await check('dist');
console.log('dist: no relay or webhook configuration');
