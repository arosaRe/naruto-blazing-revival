import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {publicFeedbackEndpoint} from '../feedback.js';

test('MakeProject configures the public relay before building and preserves PORT', async () => {
  const config = JSON.parse(await readFile(new URL('../lancer.json', import.meta.url), 'utf8'));
  const endpoint = 'https://retours.179-237-102-19.sslip.io/feedback';
  assert.equal(publicFeedbackEndpoint(endpoint), endpoint);
  assert.equal(config.lancer, `set "FEEDBACK_ENDPOINT=${endpoint}" && npm run build && python -m http.server %PORT% --directory dist`);
  assert.equal(config.url, 'http://localhost:{PORT}');
  assert.equal(config.tester, 'npm test && npm run build');
});
