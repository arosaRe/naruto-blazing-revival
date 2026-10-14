"""External TLS/proxy check. Requires Python 3 and the authorized SSH key.

Run from outside the VPS; temporary receiver has one request, no outgoing I/O,
and a 20 second lifetime. SSH runs only that receiver on loopback port 9101.
"""
import http.client
import json
import socket
import ssl
import subprocess
import time

HOST = 'retours.179-237-102-19.sslip.io'
SSH = ['ssh', '-i', r'C:\Users\antho\.ssh\id_ed25519_madfut27',
       '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes',
       'ubuntu@179.237.102.19']
CTX = ssl.create_default_context()


def request(path='/feedback', body=b'{}', headers=None):
    conn = http.client.HTTPSConnection(HOST, timeout=18, context=CTX)
    try:
        conn.request('POST', path, body, headers or {})
        response = conn.getresponse()
        return response.status, response.read()
    finally:
        conn.close()


receiver = '''import http.server,json,os
class R(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args): pass
 def do_POST(self):
  self.connection.settimeout(3)
  self.rfile.read(int(self.headers.get('Content-Length','0')))
  print(json.dumps(dict(self.headers)),flush=True)
  self.send_response(204); self.end_headers()
s=http.server.HTTPServer(('127.0.0.1',9101),R)
s.timeout=20
print('READY '+os.environ['SSH_CONNECTION'].split()[0],flush=True)
try: s.handle_request()
finally: s.server_close()
'''
proc = subprocess.Popen(SSH + ['timeout 25s python3 -u -'],
                        stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE, text=True)
try:
    proc.stdin.write(receiver)
    proc.stdin.close()
    ready = proc.stdout.readline().strip().split()
    assert ready[0] == 'READY', ready
    # Probe internal port while receiver is listening.
    try:
        with socket.create_connection(('179.237.102.19', 9101), timeout=3):
            raise AssertionError('Internal port publicly reachable')
    except (TimeoutError, ConnectionRefusedError):
        print('PASS internal port unreachable while receiver listening')
    assert request(headers={
        'X-Real-IP': '192.0.2.1', 'X-Forwarded-For': '192.0.2.2',
        'Forwarded': 'for=192.0.2.3', 'Client-IP': '192.0.2.4',
        'True-Client-IP': '192.0.2.5', 'CF-Connecting-IP': '192.0.2.6',
        'X-Arbitrary-Visitor-IP': '192.0.2.7', 'Authorization': 'test-only',
        'Cookie': 'test-only', 'Origin': 'https://example.invalid',
        'Content-Type': 'application/json', 'Content-Encoding': 'identity',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'})[0] == 204
    seen = {k.lower(): v for k, v in json.loads(proc.stdout.readline()).items()}
    proc.wait(timeout=5)
    assert proc.returncode == 0, proc.stderr.read()
    allowed = {'host', 'connection', 'content-length', 'x-real-ip', 'origin',
               'content-type', 'content-encoding', 'access-control-request-method',
               'access-control-request-headers'}
    assert set(seen) <= allowed
    assert seen['x-real-ip'] == ready[1]
    socket.inet_aton(seen['x-real-ip'])
    assert seen['origin'] == 'https://example.invalid'
    assert seen['content-type'] == 'application/json'
    assert seen['content-encoding'] == 'identity'
    assert seen['access-control-request-method'] == 'POST'
    assert seen['access-control-request-headers'] == 'content-type'
    print('PASS verified TLS; visitor headers stripped; connection IPv4 substituted')
finally:
    if proc.poll() is None:
        proc.wait(timeout=27)
assert request() == (503, b'{"error":"relay_unavailable"}')
assert request('/other')[0] == 404
assert request(headers={'Host': 'example.invalid'})[0] == 404
assert request(body=b'x' * 8193)[0] == 413
assert request(headers={'X-Large': 'x' * 9000})[0] == 400
statuses = [request()[0] for _ in range(6)]
assert 429 in statuses, statuses
print('PASS absent backend 503 JSON; path/host 404; body 413; headers 400; burst 429')
# Partial headers exercise inactivity timeout without consuming request quota.
with socket.create_connection((HOST, 443), timeout=10) as raw:
    with CTX.wrap_socket(raw, server_hostname=HOST) as tls:
        tls.sendall(b'POST /feedback HTTP/1.1\r\nHost: ' + HOST.encode() + b'\r\nX-Slow: ')
        start = time.monotonic()
        response = tls.recv(4096)
        elapsed = time.monotonic() - start
        assert 4 <= elapsed <= 9, elapsed
        assert not response or b'408' in response, response
print('PASS incomplete headers closed after approximately 5 seconds')
with socket.create_connection((HOST, 443), timeout=10) as raw:
    with CTX.wrap_socket(raw, server_hostname=HOST) as tls:
        tls.sendall(b'POST /feedback HTTP/1.1\r\nHost: ' + HOST.encode()
                    + b'\r\nContent-Length: 10\r\n\r\nx')
        start = time.monotonic()
        response = tls.recv(4096)
        assert 4 <= time.monotonic() - start <= 9
        assert not response or b'408' in response, response
print('PASS incomplete body closed after approximately 5 seconds (408 or TLS EOF)')

slow_receiver = '''import http.server,time
class R(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args): pass
 def do_POST(self):
  time.sleep(14)
s=http.server.HTTPServer(('127.0.0.1',9101),R)
s.timeout=20
print('READY',flush=True)
try: s.handle_request()
finally: s.server_close()
'''
proc = subprocess.Popen(SSH + ['timeout 25s python3 -u -'],
                        stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE, text=True)
try:
    proc.stdin.write(slow_receiver)
    proc.stdin.close()
    assert proc.stdout.readline().strip() == 'READY'
    start = time.monotonic()
    assert request() == (503, b'{"error":"relay_unavailable"}')
    assert 11 <= time.monotonic() - start <= 17
finally:
    proc.wait(timeout=27)
assert proc.returncode == 0, proc.stderr.read()
print('PASS backend read timeout: controlled 503 after approximately 12 seconds; receiver stopped')
