// Real, read-only network control: no browser interception and no POST.
import {pathToFileURL} from 'node:url';

export const publicEndpoint = 'https://retours.179-237-102-19.sslip.io/feedback';
export const makeProjectOrigins = ['http://localhost:8101', 'http://localhost:9101'];

export async function checkPublicPreflights() {
  const results = [];
  for (const origin of makeProjectOrigins) {
    try {
      const response = await fetch(publicEndpoint, {
        method: 'OPTIONS', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: {Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'},
      });
      const headers = Object.fromEntries(response.headers);
      const passed = response.status === 204 && headers['access-control-allow-origin'] === origin
        && (headers['access-control-allow-methods'] || '').split(',').some(v => v.trim() === 'POST')
        && (headers['access-control-allow-headers'] || '').toLowerCase().split(',').some(v => v.trim() === 'content-type');
      await response.body?.cancel();
      results.push({origin, status: response.status, headers, passed});
    } catch {
      results.push({origin, status: null, headers: {}, passed: false, error: 'network_or_tls_failure'});
    }
  }
  const report = {time: new Date().toISOString(), endpoint: publicEndpoint, method: 'OPTIONS', intercepted: false, results, passed: results.every(r => r.passed)};
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) console.error('BLOCKED: real public MakeProject preflight failed; simulations cannot establish availability.');
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!(await checkPublicPreflights()).passed) process.exitCode = 1;
}
