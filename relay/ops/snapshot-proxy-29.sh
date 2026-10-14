#!/bin/sh
# Run once as root BEFORE any package, firewall or proxy change.
set -eu
umask 077
backup=/root/feedback-proxy-29
test ! -e "$backup"
install -d -m 700 "$backup"
tar -cpf "$backup/config.before.tar" /etc/ufw /etc/ssh /etc/netplan /etc/chrony /etc/feedback-relay /etc/systemd/system/feedback-relay.service
chmod 600 "$backup/config.before.tar"
for path in /etc/nginx /etc/letsencrypt; do
    if test -e "$path"; then
        tar -cpf "$backup/$(basename "$path").before.tar" "$path"
    else
        printf '%s absent\n' "$path" >> "$backup/absent.before"
    fi
done
find /etc/ssh /etc/netplan /etc/chrony /home/ubuntu/.ssh /root/app-retirement-23-20261008T062819Z /root/feedback-relay-25 /root/clock-repair-27 /opt/feedback-relay /var/lib/tradispo /opt/madfut27-watcher -type f -exec sha256sum {} + > "$backup/preserved.sha256"
sha256sum /usr/bin/node /usr/bin/python3 /etc/passwd /etc/group /etc/shadow /etc/gshadow >> "$backup/preserved.sha256"
ufw status verbose > "$backup/ufw.before"
ss -ltnp > "$backup/listeners.before"
dpkg-query -W > "$backup/packages.before"
chmod 600 "$backup"/*
