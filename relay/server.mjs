import http from 'node:http';
import {pathToFileURL} from 'node:url';

const defaults = {maxBytes: 8192, maxMessage: 1800, timeoutMs: 5000, bodyTimeoutMs: 5000, concurrency: 4, clientLimit: 3, globalLimit: 30, windowMs: 60000, maxClients: 10000};
export function readConfig(env = process.env) {
  try {
    const url = new URL(env.DISCORD_WEBHOOK_URL);
    if (url.protocol !== 'https:' || url.hostname !== 'discord.com' || url.port || url.username || url.password || url.search || url.hash || !/^\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(url.pathname)) throw Error();
    const origins = (env.FEEDBACK_ORIGINS || '').split(',');
    if (!origins.length || origins.some(origin => { const u = new URL(origin); return u.protocol !== 'https:' || u.origin !== origin || u.username || u.password; })) throw Error();
    const port = Number(env.FEEDBACK_PORT || 9101);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error();
    return {...defaults, webhook: url.href, origins, port, host: env.FEEDBACK_HOST || '127.0.0.1'};
  } catch { throw new Error('Invalid relay configuration'); }
}

// Injection is for local tests only; the executable always uses readConfig.
export function createRelay(config, {fetchImpl = fetch, now = Date.now} = {}) {
  const c = {...defaults, ...config};
  const clients = new Map();
  let global = {start: now(), count: 0}, active = 0;
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    const reply = (status, error) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(error ? {error} : {ok: true}));
    };
    if (req.url !== '/feedback') return reply(404, 'not_found');
    if (!c.origins.includes(req.headers.origin)) return reply(400, 'invalid_origin');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    if (req.method === 'OPTIONS') {
      if (req.headers['access-control-request-method'] !== 'POST' || (req.headers['access-control-request-headers'] || '').toLowerCase().split(',').some(h => h.trim() && h.trim() !== 'content-type')) return reply(400, 'invalid_preflight');
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return reply(204);
    }
    if (req.method !== 'POST') return reply(400, 'invalid_method');
    if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] || '') || req.headers['content-encoding']) return reply(400, 'invalid_content_type');
    if (Number(req.headers['content-length']) > c.maxBytes) return reply(413, 'body_too_large');
    let bytes = 0, chunks = [];
    const timer = setTimeout(() => { reply(400, 'body_timeout'); req.destroy(); }, c.bodyTimeoutMs);
    try {
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > c.maxBytes) { reply(413, 'body_too_large'); return; }
        chunks.push(chunk);
      }
    } catch { reply(400, 'invalid_body'); return; }
    finally { clearTimeout(timer); }
    let message;
    try {
      const body = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(Buffer.concat(chunks)));
      if (!body || Array.isArray(body) || Object.keys(body).length !== 1 || typeof body.message !== 'string') throw Error();
      message = body.message.trim();
      if (!message || message.length > c.maxMessage || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) throw Error();
    } catch { return reply(400, 'invalid_message'); }
    const time = now();
    for (const [key, bucket] of clients) if (time - bucket.start >= c.windowMs) clients.delete(key);
    if (time - global.start >= c.windowMs) global = {start: time, count: 0};
    // Forwarded headers are intentionally ignored, including behind a proxy.
    const key = req.socket.remoteAddress;
    const bucket = clients.get(key) || {start: time, count: 0};
    if (bucket.count >= c.clientLimit || global.count >= c.globalLimit || (!clients.has(key) && clients.size >= c.maxClients)) {
      res.setHeader('Retry-After', String(Math.ceil(c.windowMs / 1000)));
      return reply(429, 'rate_limited');
    }
    if (active >= c.concurrency) return reply(503, 'busy');
    bucket.count++; clients.set(key, bucket); global.count++; active++;
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), c.timeoutMs);
    try {
      const response = await fetchImpl(c.webhook, {method: 'POST', redirect: 'error', signal: controller.signal, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({content: message, allowed_mentions: {parse: [], users: [], roles: [], replied_user: false}})});
      const ok = response.ok;
      await response.body?.cancel();
      reply(ok ? 200 : 502, ok ? undefined : 'discord_unavailable');
    } catch { reply(502, 'discord_unavailable'); }
    finally { clearTimeout(deadline); active--; }
  });
  server.requestTimeout = c.bodyTimeoutMs;
  server.headersTimeout = c.bodyTimeoutMs;
  server.timeout = c.bodyTimeoutMs + c.timeoutMs + 1000;
  server.keepAliveTimeout = 1000;
  server.maxConnections = 128;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const config = readConfig();
    const server = createRelay(config);
    server.on('error', () => { console.error('Relay startup failed'); process.exitCode = 1; });
    server.listen(config.port, config.host, () => console.log('Feedback relay ready'));
  } catch { console.error('Invalid relay configuration'); process.exitCode = 1; }
}
