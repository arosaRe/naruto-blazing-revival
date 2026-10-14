#!/bin/sh
# One-time preparation. Upload this directory and server.mjs to a private staging
# directory, then run as root with the source Git commit as the only argument.
set -eu
umask 077
version=${1:?source commit required}
case "$version" in *[!0-9a-f]*|'') exit 1;; esac
[ "${#version}" = 40 ]
cd "$(dirname "$0")"
test ! -e /opt/feedback-relay
test ! -e /etc/feedback-relay
test ! -e /etc/systemd/system/feedback-relay.service
! getent passwd feedback-relay >/dev/null
! getent group feedback-relay >/dev/null
install -d -m 700 /root/feedback-relay-25
# These hashes stay on the server; no secret content is printed or copied.
fingerprint() {
    find /etc/ssh /etc/netplan /etc/ufw /home/ubuntu/.ssh \
      /root/app-retirement-23-20261008T062819Z -type f -exec sha256sum {} + | sort
    sha256sum /usr/bin/node
}
fingerprint > /root/feedback-relay-25/before.sha256
work=$(mktemp -d /root/feedback-relay-25/download.XXXXXX)
trap 'rm -rf -- "$work"' EXIT
base=https://nodejs.org/dist/v24.22.0
curl --fail --silent --show-error --proto '=https' --tlsv1.2 "$base/SHASUMS256.txt" -o "$work/SHASUMS256.txt"
curl --fail --silent --show-error --proto '=https' --tlsv1.2 "$base/node-v24.22.0-linux-x64.tar.xz" -o "$work/node-v24.22.0-linux-x64.tar.xz"
awk '$2 == "node-v24.22.0-linux-x64.tar.xz"' "$work/SHASUMS256.txt" > "$work/selected.sha256"
test "$(wc -l < "$work/selected.sha256")" = 1
(cd "$work" && sha256sum -c selected.sha256)
install -d -m 755 /opt/feedback-relay /opt/feedback-relay/releases
tar -xJf "$work/node-v24.22.0-linux-x64.tar.xz" -C /opt/feedback-relay --no-same-owner
cp "$work/selected.sha256" /root/feedback-relay-25/node.sha256
useradd --system --user-group --home-dir /nonexistent --no-create-home --shell /usr/sbin/nologin feedback-relay
install -d -m 755 "/opt/feedback-relay/releases/$version"
install -m 644 ../server.mjs "/opt/feedback-relay/releases/$version/server.mjs"
printf '%s\n' "$version" > "/opt/feedback-relay/releases/$version/SOURCE_COMMIT"
chmod 644 "/opt/feedback-relay/releases/$version/SOURCE_COMMIT"
ln -s "releases/$version" /opt/feedback-relay/current
install -d -m 700 /etc/feedback-relay
printf '%s\n' 'FEEDBACK_HOST=127.0.0.1' 'FEEDBACK_PORT=9101' \
  'FEEDBACK_ORIGINS=https://arosare.github.io' 'FEEDBACK_TRUSTED_PROXIES=127.0.0.1' > /etc/feedback-relay/config.env
install -m 700 inject-secret.py /etc/feedback-relay/inject-secret.py
install -m 644 feedback-relay.service /etc/systemd/system/feedback-relay.service
systemd-analyze verify /etc/systemd/system/feedback-relay.service
systemctl daemon-reload
fingerprint > /root/feedback-relay-25/after.sha256
cmp /root/feedback-relay-25/before.sha256 /root/feedback-relay-25/after.sha256
/opt/feedback-relay/node-v24.22.0-linux-x64/bin/node --version
sha256sum "/opt/feedback-relay/releases/$version/server.mjs"
# Intentionally neither enabled nor started. Missing secret.env is a hard failure.
