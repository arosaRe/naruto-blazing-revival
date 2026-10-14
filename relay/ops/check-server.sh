#!/bin/sh
set -eu
umask 077
cleanup() {
    systemctl stop feedback-relay.service
    rm -f /etc/feedback-relay/secret.env /run/systemd/system/feedback-relay.service.d/25-test.conf
    rmdir /run/systemd/system/feedback-relay.service.d 2>/dev/null || true
    systemctl daemon-reload
    systemctl reset-failed feedback-relay.service || true
}
test ! -e /etc/feedback-relay/secret.env
trap cleanup EXIT
# Temporary cgroup IP filter prevents any Discord transmission, even on error.
mkdir -p /run/systemd/system/feedback-relay.service.d
printf '%s\n' '[Service]' 'Restart=no' 'IPAddressDeny=any' 'IPAddressAllow=localhost' > /run/systemd/system/feedback-relay.service.d/25-test.conf
systemctl daemon-reload
if systemctl start feedback-relay.service; then
    echo 'Unexpected start without secret'; exit 1
fi
echo 'Missing environment file: start refused'
printf '%s\n' 'DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123/EXEMPLE_NON_FONCTIONNEL' > /etc/feedback-relay/secret.env
systemctl reset-failed feedback-relay.service
systemctl start feedback-relay.service
sleep 2
systemctl is-active feedback-relay.service
ss -ltnp 'sport = :9101'
test "$(pgrep -u feedback-relay -c)" = 1
curl --fail-with-body -s -o /root/feedback-relay-25/refusal.json -w 'HTTP %{http_code}\n' http://127.0.0.1:9101/feedback || test "$?" = 22
test "$(cat /root/feedback-relay-25/refusal.json)" = '{"error":"invalid_origin"}'
cat /root/feedback-relay-25/refusal.json
echo
systemctl stop feedback-relay.service
# Empty secret file exercises the executable's own validation too.
: > /etc/feedback-relay/secret.env
systemctl start feedback-relay.service
sleep 2
test "$(systemctl show feedback-relay.service -p ExecMainStatus --value)" = 1
echo 'Empty secret: application exited 1'
cleanup
trap - EXIT
test ! -e /etc/feedback-relay/secret.env
test "$(systemctl is-active feedback-relay.service)" = inactive
test "$(systemctl is-enabled feedback-relay.service)" = disabled
test -z "$(ss -H -ltn 'sport = :9101')"
cmp /root/feedback-relay-25/before.sha256 /root/feedback-relay-25/after.sha256
stat -c '%a %U:%G %n' /etc/feedback-relay /etc/feedback-relay/config.env
getent passwd feedback-relay
systemd-analyze security feedback-relay.service --no-pager
/usr/sbin/sshd -t
node --version
echo 'Final: stopped, disabled, no secret, no listener, SSH configuration valid'
