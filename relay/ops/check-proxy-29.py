#!/usr/bin/env python3
"""Root-only, bounded local regression check; no relay, secret or external I/O.

Runs the candidate TLS server as HTTP on 127.0.0.1:443, because no certificate
exists yet. This checks HTTP proxy semantics, NOT TLS or public reachability.
Usage: sudo python3 check-proxy-29.py /path/to/retours.nginx.conf
"""
import http.client
import http.server
import pathlib
import socket
import subprocess
import sys
import tempfile
import threading
import time

HOST = "retours.179-237-102-19.sslip.io"
for port in (443, 9101):
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", port))

source = pathlib.Path(sys.argv[1]).read_text()
zones = source[:source.index("server {")]
server = source[source.index("server {\n    listen 443"):]
server = server.replace("listen 443 ssl default_server;", "listen 127.0.0.1:443;")
server = "\n".join(line for line in server.splitlines()
                   if not line.strip().startswith("ssl_"))
seen = {}


class Receiver(http.server.BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_POST(self):
        seen.update({k.lower(): v for k, v in self.headers.items()})
        self.rfile.read(int(self.headers.get("Content-Length", "0")))
        self.send_response(204)
        self.end_headers()


def request(path="/feedback", body=b"{}", headers=None):
    connection = http.client.HTTPConnection("127.0.0.1", 443, timeout=15)
    try:
        connection.request("POST", path, body, {"Host": HOST, **(headers or {})})
        response = connection.getresponse()
        return response.status, response.read()
    finally:
        connection.close()


with tempfile.TemporaryDirectory(prefix="feedback-proxy-29-") as directory:
    config = pathlib.Path(directory) / "nginx.conf"
    config.write_text("pid " + directory + "/nginx.pid;\nerror_log /dev/null;\n"
                      "events { worker_connections 128; }\nhttp {\n"
                      + zones + server + "\n}\n")
    subprocess.run(["nginx", "-t", "-c", str(config)], check=True)
    proxy = subprocess.Popen(["nginx", "-c", str(config), "-g", "daemon off;"])
    receiver = None
    thread = None
    try:
        for _ in range(40):
            try:
                with socket.create_connection(("127.0.0.1", 443), timeout=.1):
                    break
            except OSError:
                time.sleep(.05)
        receiver = http.server.HTTPServer(("127.0.0.1", 9101), Receiver)
        receiver.timeout = 10
        thread = threading.Thread(target=receiver.handle_request)
        thread.start()
        status, _ = request(headers={
            "X-Real-IP": "192.0.2.1", "X-Forwarded-For": "192.0.2.2",
            "Forwarded": "for=192.0.2.3", "Client-IP": "192.0.2.4",
            "True-Client-IP": "192.0.2.5", "CF-Connecting-IP": "192.0.2.6",
            "X-Arbitrary-Visitor-IP": "192.0.2.7", "Authorization": "test-only",
            "Cookie": "test-only", "Origin": "https://example.invalid",
            "Content-Type": "application/json", "Content-Encoding": "identity",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        })
        assert status == 204, status
        thread.join(11)
        assert not thread.is_alive()
        receiver.server_close()
        receiver = None
        assert seen["x-real-ip"] == "127.0.0.1", seen
        allowed = {"host", "connection", "content-length", "x-real-ip", "origin",
                   "content-type", "content-encoding", "access-control-request-method",
                   "access-control-request-headers"}
        assert set(seen) <= allowed, seen
        assert seen["origin"] == "https://example.invalid"
        assert seen["content-type"] == "application/json"
        assert seen["content-encoding"] == "identity"
        assert seen["access-control-request-method"] == "POST"
        assert seen["access-control-request-headers"] == "content-type"
        print("PASS bounded receiver: source replaced; visitor headers stripped; allowlist preserved")
        assert request() == (503, b'{"error":"relay_unavailable"}')
        assert request("/other")[0] == 404
        assert request(headers={"Host": "example.invalid"})[0] == 404
        assert request(body=b"x" * 8193)[0] == 413
        results = [request()[0] for _ in range(6)]
        assert 429 in results, results
        print("PASS absent backend 503 JSON; path/host 404; 8193 bytes 413; IP burst 429")
    finally:
        if thread is not None:
            thread.join(11)
        if receiver is not None:
            receiver.server_close()
        proxy.terminate()
        try:
            proxy.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proxy.kill()
            proxy.wait(timeout=5)
    print("PASS temporary proxy and loopback receiver stopped")
