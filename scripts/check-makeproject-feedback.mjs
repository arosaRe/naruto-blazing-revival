// Windows: exercises lancer.json unchanged. Browser traffic is blocked or
// fulfilled locally; separate Node OPTIONS requests probe the real public relay.
import assert from 'node:assert/strict';
import {checkPublicPreflights} from './check-feedback-preflight.mjs';
import {readFile} from 'node:fs/promises';
import {spawn, execFileSync} from 'node:child_process';
import {once} from 'node:events';
import net from 'node:net';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const publicPreflight = await checkPublicPreflights();
if (!publicPreflight.passed) process.exitCode = 1;

assert.equal(process.platform, 'win32', 'The MakeProject launcher uses cmd');
assert.ok(process.env.PLAYWRIGHT_MODULE, 'Set PLAYWRIGHT_MODULE to an external Playwright installation');
const {chromium} = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_MODULE, 'index.mjs')).href);
const config = JSON.parse(await readFile(new URL('../lancer.json', import.meta.url), 'utf8'));
const endpoint = 'https://retours.179-237-102-19.sslip.io/feedback';
const probe = net.createServer();
probe.listen(9101); await once(probe, 'listening');
await new Promise(resolve => probe.close(resolve));
const env = {...process.env, PORT:'9101'};
delete env.FEEDBACK_ENDPOINT;
const server = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `"${config.lancer}"`], {env, stdio:'inherit', windowsHide:true, windowsVerbatimArguments:true});
let browser;
try {
  let ready = false;
  for (let i = 0; i < 300; i++) {
    assert.equal(server.exitCode, null, 'Launcher exited before serving');
    try { ready = (await fetch('http://localhost:9101/feedback-config.js')).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'Launcher must serve on PORT=9101');
  browser = await chromium.launch();
  const page = await browser.newPage({serviceWorkers:'block'});
  const errors = [], submissions = [];
  page.on('pageerror', error => errors.push(error.message));
  let mode = 200;
  await page.route('**/*', async route => {
    const req = route.request();
    if (req.url() === endpoint) {
      assert.equal(req.method(), 'POST');
      submissions.push(req.postDataJSON());
      if (mode === 'network') return route.abort();
      return route.fulfill({status:mode, contentType:'application/json', body:JSON.stringify({ok:mode === 200})});
    }
    if (new URL(req.url()).origin === 'http://localhost:9101') return route.continue();
    return route.abort();
  });
  await page.goto(config.url.replace('{PORT}', '9101'), {waitUntil:'networkidle'});
  assert.equal(await page.evaluate(async () => (await import('/feedback-config.js')).feedbackEndpoint), endpoint);
  await page.locator('#feedback-open').focus(); await page.keyboard.press('Enter');
  const field = page.locator('#feedback-message'), send = page.locator('#feedback-send'), status = page.locator('#feedback-status');
  assert.ok(await field.evaluate(el => el === document.activeElement));
  assert.ok(await send.isEnabled());
  await send.focus(); await page.keyboard.press('Enter');
  assert.equal(submissions.length, 0, 'Empty message is not submitted');
  assert.equal(await field.getAttribute('aria-invalid'), 'true');
  for (const scenario of [200, 429, 503, 'network']) {
    mode = scenario;
    const message = `Simulation locale ${scenario}`;
    await field.fill(message); await send.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(() => !document.querySelector('#feedback-send').disabled);
    if (mode === 200) {
      assert.match(await status.textContent(), /Merci/);
      assert.equal(await field.inputValue(), '');
    } else {
      assert.match(await status.textContent(), /conservé/);
      assert.equal(await field.inputValue(), message);
    }
  }
  assert.deepEqual(submissions, [200,429,503,'network'].map(mode => ({message:`Simulation locale ${mode}`})));
  await field.focus();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    assert.ok(await page.evaluate(() => document.querySelector('#feedback-dialog').contains(document.activeElement)));
  }
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Shift+Tab');
    assert.ok(await page.evaluate(() => document.querySelector('#feedback-dialog').contains(document.activeElement)));
  }
  await page.keyboard.press('Escape');
  assert.ok(await page.locator('#feedback-open').evaluate(el => el === document.activeElement));
  assert.deepEqual(errors, []);
  console.log('SIMULATION PASS: standard launcher PORT=9101, configured public endpoint, keyboard, validation, simulated confirmation/429/503/network failure. No external submission or Discord receipt.');
} finally {
  await browser?.close();
  if (server.exitCode === null) execFileSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], {stdio:'ignore'});
}
const closed = net.createServer(); closed.listen(9101); await once(closed, 'listening');
await new Promise(resolve => closed.close(resolve));
console.log('PASS: test server stopped; port 9101 released.');

assert.ok(publicPreflight.passed, 'BLOCKED: real public preflights failed despite simulated UI checks');
