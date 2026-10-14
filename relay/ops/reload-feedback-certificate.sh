#!/bin/sh
set -eu
# Install root:root 0700 in /etc/letsencrypt/renewal-hooks/deploy/.
test "${RENEWED_LINEAGE:-}" = /etc/letsencrypt/live/retours.179-237-102-19.sslip.io || exit 0
/usr/sbin/nginx -t
/usr/bin/systemctl reload nginx.service
