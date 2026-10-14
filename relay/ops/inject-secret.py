#!/usr/bin/python3
"""Run on the server as root from an interactive terminal; never prints the value."""
import getpass
import os
import re
import tempfile

if os.geteuid() != 0:
    raise SystemExit('Run as root on the server')
if not os.isatty(0):
    raise SystemExit('Interactive terminal required')
value = getpass.getpass('Discord webhook (hidden): ')
if not re.fullmatch(r'https://discord\.com/api/webhooks/[0-9]+/[A-Za-z0-9_-]+', value):
    raise SystemExit('Invalid webhook format')
fd, path = tempfile.mkstemp(prefix='.secret-', dir='/etc/feedback-relay')
try:
    os.fchmod(fd, 0o600)
    with os.fdopen(fd, 'w') as output:
        output.write('DISCORD_WEBHOOK_URL=' + value + '\n')
    os.replace(path, '/etc/feedback-relay/secret.env')
finally:
    if os.path.exists(path):
        os.unlink(path)
print('Secret installed; service remains stopped. Start requires separate authorization.')
