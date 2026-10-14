import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {spawnSync} from 'node:child_process';
import {createRelay, readConfig} from '../relay/server.mjs';

const origin = 'https://example.test';
async function fixture(t, overrides = {}, mode = 'ok') {
  const calls = [];
  let accept;
  const gate = new Promise(resolve => { accept = resolve; });
  const discord = http.createServer(async (req, res) => {
    let body = ''; for await (const chunk of req) body += chunk;
    calls.push(JSON.parse(body));
    if (mode === 'delay') await gate;
    if (!res.destroyed) { res.writeHead(mode === 'redirect' ? 302 : mode === 'fail' ? 500 : 204, mode === 'redirect' ? {Location: '/secret-sentinel-redirect'} : {}); res.end(''); }
  });
  discord.listen(0, '127.0.0.1'); await once(discord, 'listening');
  const webhook = `http://127.0.0.1:${discord.address().port}/secret-sentinel`;
  const relay = createRelay({webhook, origins: [origin], ...overrides});
  relay.listen(9101, '127.0.0.1'); await once(relay, 'listening');
  t.after(async () => { accept(); relay.closeAllConnections(); discord.closeAllConnections(); await Promise.all([new Promise(r => relay.close(r)), new Promise(r => discord.close(r))]); });
  const send = (body = JSON.stringify({message: 'Bonjour @everyone <@123>'}), headers = {}, method = 'POST') => fetch('http://127.0.0.1:9101/feedback', {method, headers: {Origin: origin, 'Content-Type': 'application/json', ...headers}, ...(method === 'GET' ? {} : {body})});
  return {calls, send, accept, webhook};
}

test('acceptance 1: success only after Discord acceptance; mentions disabled', async t => {
  const f = await fixture(t, {}, 'delay');
  let settled = false;
  const pending = f.send().then(r => { settled = true; return r; });
  while (!f.calls.length) await new Promise(r => setTimeout(r, 5));
  assert.equal(settled, false);
  assert.deepEqual(f.calls[0].allowed_mentions, {parse: [], users: [], roles: [], replied_user: false});
  assert.equal(f.calls[0].content, 'Bonjour @everyone <@123>');
  f.accept(); assert.equal((await pending).status, 200);
});

test('acceptance 2: strict input refusals never reach Discord', async t => {
  const f = await fixture(t);
  for (const [body, headers, method, status] of [
    ['{}', {}, 'POST', 400], ['{"message":" "}', {}, 'POST', 400],
    ['{"message":"ok","extra":true}', {}, 'POST', 400],
    ['{"message":123}', {}, 'POST', 400], ['{', {}, 'POST', 400],
    [JSON.stringify({message: 'x'.repeat(1801)}), {}, 'POST', 400],
    [JSON.stringify({message: '\u0000'}), {}, 'POST', 400],
    ['{}', {Origin: 'https://evil.test'}, 'POST', 400],
    ['{}', {'Content-Type': 'text/plain'}, 'POST', 400],
    ['{}', {'Content-Encoding': 'gzip'}, 'POST', 400],
    [undefined, {}, 'GET', 400], ['x'.repeat(8193), {}, 'POST', 413],
  ]) assert.equal((await f.send(body, headers, method)).status, status);
  // Chunked body crosses the same byte limit without Content-Length.
  const status = await new Promise(resolve => {
    const req = http.request('http://127.0.0.1:9101/feedback', {method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'}}, res => { res.resume(); resolve(res.statusCode); });
    req.write('x'.repeat(5000)); req.end('x'.repeat(5000));
  });
  assert.equal(status, 413); assert.equal(f.calls.length, 0);
});

test('acceptance 2: client quota ignores spoofed proxy headers and expires', async t => {
  const f = await fixture(t, {clientLimit: 1, windowMs: 30});
  assert.equal((await f.send()).status, 200);
  assert.equal((await f.send(undefined, {'X-Forwarded-For': '1.2.3.4'})).status, 429);
  assert.equal(f.calls.length, 1);
  await new Promise(r => setTimeout(r, 40));
  assert.equal((await f.send()).status, 200);
});

test('acceptance 2: global and bounded client memory quotas', async t => {
  const f = await fixture(t, {globalLimit: 1, clientLimit: 10});
  assert.equal((await f.send()).status, 200);
  assert.equal((await f.send()).status, 429); assert.equal(f.calls.length, 1);
});
test('acceptance 2: full client table fails closed', async t => {
  const f = await fixture(t, {maxClients: 0});
  assert.equal((await f.send()).status, 429); assert.equal(f.calls.length, 0);
});
test('acceptance 3: upstream failure has no secret', async t => {
  const f = await fixture(t, {clientLimit: 1}, 'fail');
  const response = await f.send(); assert.equal(response.status, 502);
  assert.equal(await response.text(), '{"error":"discord_unavailable"}');
  assert.equal((await f.send()).status, 429); assert.equal(f.calls.length, 1);
});
test('acceptance 3: upstream redirects are never followed', async t => {
  const f = await fixture(t, {}, 'redirect');
  assert.equal((await f.send()).status, 502); assert.equal(f.calls.length, 1);
});
test('acceptance 2: malformed UTF-8 and preflights', async t => {
  const f = await fixture(t);
  assert.equal((await f.send(Buffer.from([0xff]))).status, 400);
  const valid = await f.send(undefined, {'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'}, 'OPTIONS');
  assert.equal(valid.status, 204); assert.equal(valid.headers.get('access-control-allow-origin'), origin);
  assert.equal((await f.send(undefined, {'Access-Control-Request-Method': 'DELETE'}, 'OPTIONS')).status, 400);
  assert.equal(f.calls.length, 0);
});
test('acceptance 3: bounded timeout and concurrency', async t => {
  const f = await fixture(t, {timeoutMs: 100, concurrency: 1}, 'delay');
  const pending = f.send();
  while (!f.calls.length) await new Promise(r => setTimeout(r, 5));
  assert.equal((await f.send()).status, 503);
  assert.equal((await pending).status, 502); assert.equal(f.calls.length, 1);
});
test('acceptance 3: configuration rejects unsafe destinations, startup logs redact secrets', () => {
  for (const webhook of [undefined, 'http://discord.com/api/webhooks/1/secret-sentinel', 'https://evil.test/api/webhooks/1/secret-sentinel', 'https://discord.com/api/webhooks/1/secret-sentinel?x=1', 'https://discord.com@evil.test/api/webhooks/1/secret-sentinel']) {
    assert.throws(() => readConfig({DISCORD_WEBHOOK_URL: webhook, FEEDBACK_ORIGINS: origin}), /Invalid relay configuration/);
  }
  assert.throws(() => readConfig({DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/1/example'}));
  assert.equal(readConfig({DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/1/example', FEEDBACK_ORIGINS: origin}).port, 9101);
  const run = spawnSync(process.execPath, ['relay/server.mjs'], {encoding: 'utf8', env: {...process.env, DISCORD_WEBHOOK_URL: 'secret-sentinel'}});
  assert.equal(run.status, 1); assert.equal(run.stderr.trim(), 'Invalid relay configuration');
  assert.ok(!`${run.stdout}${run.stderr}`.includes('secret-sentinel'));
});

const proxy = {trustedProxies: ['127.0.0.1']};
const ipHeaders = ip => ({'X-Real-IP': ip});
test('trusted proxy separates clients and canonicalizes mapped IPv4 and IPv6', async t => {
  const f = await fixture(t, proxy);
  for (const ip of ['198.51.100.1', '::ffff:198.51.100.1', '::ffff:c633:6401']) assert.equal((await f.send(undefined, ipHeaders(ip))).status, 200);
  assert.equal((await f.send(undefined, ipHeaders('198.51.100.1'))).status, 429);
  assert.equal((await f.send(undefined, ipHeaders('203.0.113.9'))).status, 200);
  for (const ip of ['2001:db8::1', '2001:0db8:0:0:0:0:0:1', '2001:db8::1']) assert.equal((await f.send(undefined, ipHeaders(ip))).status, 200);
  assert.equal((await f.send(undefined, ipHeaders('2001:db8::1'))).status, 429);
  assert.equal(f.calls.length, 7);
});
test('trusted proxy refuses absent, invalid, ambiguous and duplicate identities', async t => {
  const f = await fixture(t, proxy);
  for (const headers of [{}, {'Forwarded': 'for=198.51.100.1'}, {'X-Forwarded-For': '198.51.100.1'}, ...['', 'unknown', 'localhost', '127.1', '198.51.100.1:80', '[2001:db8::1]', 'fe80::1%eth0', '198.51.100.1, 203.0.113.9'].map(ipHeaders)]) {
    const res = await f.send(undefined, headers);
    assert.equal(res.status, 400); assert.deepEqual(await res.json(), {error: 'invalid_client_address'});
  }
  const status = await new Promise((resolve, reject) => {
    const req = http.request('http://127.0.0.1:9101/feedback', {method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json', 'X-Real-IP': ['198.51.100.1', '203.0.113.9']}}, res => {res.resume(); resolve(res.statusCode);});
    req.on('error', reject); req.end(JSON.stringify({message: 'ok'}));
  });
  assert.equal(status, 400); assert.equal(f.calls.length, 0);
  assert.equal((await f.send(undefined, ipHeaders('198.51.100.1'))).status, 200);
});
test('direct and unauthorized peers cannot spoof any forwarding header', async t => {
  for (const trustedProxies of [[], ['192.0.2.1']]) await t.test(String(trustedProxies), async t => {
    const f = await fixture(t, {trustedProxies});
    for (let i = 1; i <= 4; i++) {
      const ip = `198.51.100.${i}`;
      assert.equal((await f.send(undefined, {...ipHeaders(ip), 'X-Forwarded-For': ip, Forwarded: `for=${ip}`})).status, i <= 3 ? 200 : 429);
    }
    assert.equal(f.calls.length, 3);
  });
});
test('proxy identities retain global quota, bounded table, expiry and concurrency', async t => {
  await t.test('global', async t => {
    const f = await fixture(t, {...proxy, globalLimit: 2});
    for (let i = 1; i <= 3; i++) assert.equal((await f.send(undefined, ipHeaders(`198.51.100.${i}`))).status, i <= 2 ? 200 : 429);
    assert.equal(f.calls.length, 2);
  });
  await t.test('memory and expiry', async t => {
    const f = await fixture(t, {...proxy, maxClients: 1, windowMs: 100});
    assert.equal((await f.send(undefined, ipHeaders('198.51.100.1'))).status, 200);
    assert.equal((await f.send(undefined, ipHeaders('198.51.100.2'))).status, 429);
    assert.equal((await f.send(undefined, ipHeaders('198.51.100.1'))).status, 200);
    await new Promise(r => setTimeout(r, 120));
    assert.equal((await f.send(undefined, ipHeaders('198.51.100.2'))).status, 200);
  });
  await t.test('concurrency', async t => {
    const f = await fixture(t, {...proxy, concurrency: 1}, 'delay');
    const pending = f.send(undefined, ipHeaders('198.51.100.1'));
    while (!f.calls.length) await new Promise(r => setTimeout(r, 5));
    assert.equal((await f.send(undefined, ipHeaders('198.51.100.2'))).status, 503);
    f.accept(); assert.equal((await pending).status, 200);
    assert.equal((await f.send(undefined, ipHeaders('198.51.100.2'))).status, 200);
  });
});
test('proxy trust configuration is explicit, exact and bounded', () => {
  const env = {DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/1/example', FEEDBACK_ORIGINS: origin};
  assert.deepEqual(readConfig(env).trustedProxies, []);
  assert.deepEqual(readConfig({...env, FEEDBACK_TRUSTED_PROXIES: '127.0.0.1, ::1'}).trustedProxies, ['127.0.0.1', '::1']);
  for (const value of ['', '*', 'true', '127.0.0.0/8', 'localhost', '127.0.0.1,', 'fe80::1%lo', Array(33).fill('127.0.0.1').join(',')]) assert.throws(() => readConfig({...env, FEEDBACK_TRUSTED_PROXIES: value}), /Invalid relay configuration/);
  assert.throws(() => createRelay({trustedProxies: ['*']}), /Invalid relay configuration/);
});
