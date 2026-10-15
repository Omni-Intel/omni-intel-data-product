#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run as root on the internal dashboard server.' >&2; exit 1; }
key_source=${1:?Usage: bash deploy/install-publisher.sh /absolute/path/to/publish.key [dashboard-unit] [credentials-env]}
dashboard_unit=${2:-omni-dashboard-intra.service}
credentials=${3:-/etc/omni-dashboard-intra/credentials.env}
node_bin=${OMNI_NODE_BIN:-/usr/bin/node}
systemctl is-active --quiet "$dashboard_unit" || { echo 'The existing dashboard service must be active. No dashboard service is changed.' >&2; exit 1; }
dashboard_dir=$(systemctl show "$dashboard_unit" -p WorkingDirectory --value)
dashboard_user=$(systemctl show "$dashboard_unit" -p User --value)
dashboard_user=${dashboard_user:-root}
dashboard_group=$(systemctl show "$dashboard_unit" -p Group --value)
dashboard_group=${dashboard_group:-$(id -gn "$dashboard_user")}
for value in "$dashboard_dir" "$credentials" "$node_bin" "$key_source"; do
  [[ $value == /* && $value != *[[:space:]]* && $value != *'%'* && $value != *'"'* ]] || { echo 'Use absolute installation paths without whitespace, quotes or percent signs.' >&2; exit 1; }
done
[[ -x $node_bin && -r $credentials && -r $dashboard_dir/dist/display/dashboard.js ]] || { echo 'Existing dashboard installation or environment was not found.' >&2; exit 1; }
grep -Eq '^[[:xdigit:]]{64}$' "$key_source" || { echo 'Invalid signing key.' >&2; exit 1; }
source_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
release=/opt/omni-daq-overview/releases/$(date -u +%Y%m%dT%H%M%S)-$$
for name in public-overview.mjs published-overview.mjs overview-service.mjs publish-overview.mjs; do
  [[ -f $source_root/server/$name ]] || { echo 'Incomplete publisher bundle.' >&2; exit 1; }
done
# Existing parent directories may have been created with restrictive modes.
# Normalize every directory owned by this publisher, without changing /opt.
install -d -m 0755 -o root -g root \
  /opt/omni-daq-overview /opt/omni-daq-overview/releases \
  "$release" "$release/server"
for name in public-overview.mjs published-overview.mjs overview-service.mjs publish-overview.mjs; do
  install -m 0644 -o root -g root "$source_root/server/$name" "$release/server/$name"
done
# Validate access as the actual service user before installing or starting a unit.
for name in public-overview.mjs published-overview.mjs overview-service.mjs publish-overview.mjs; do
  runuser -u "$dashboard_user" -- "$node_bin" --check "$release/server/$name"
done
install -d -m 0750 -o root -g "$dashboard_group" /etc/omni-daq-overview
if [[ $key_source != /etc/omni-daq-overview/publish.key ]]; then
  install -m 0640 -o root -g "$dashboard_group" "$key_source" /etc/omni-daq-overview/publish.key
else
  chown root:"$dashboard_group" "$key_source"
  chmod 0640 "$key_source"
fi
cat > /etc/systemd/system/omni-daq-overview-publish.service <<UNIT
[Unit]
Description=Publish public DAQ aggregate from the existing dashboard
After=network-online.target $dashboard_unit
[Service]
Type=oneshot
User=$dashboard_user
Group=$dashboard_group
WorkingDirectory=$dashboard_dir
EnvironmentFile=$credentials
Environment=OMNI_DASHBOARD_DIR=$dashboard_dir
Environment=OMNI_OVERVIEW_KEY_FILE=/etc/omni-daq-overview/publish.key
Environment=OMNI_OVERVIEW_PUBLISH_URL=https://daq.omni-intel.cn/api/internal/overview
ExecStart=$node_bin $release/server/publish-overview.mjs
TimeoutStartSec=45
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
UNIT
cat > /etc/systemd/system/omni-daq-overview-publish.timer <<'UNIT'
[Unit]
Description=Refresh public DAQ aggregate every minute
[Timer]
OnBootSec=15s
OnUnitInactiveSec=60s
AccuracySec=1s
Unit=omni-daq-overview-publish.service
[Install]
WantedBy=timers.target
UNIT
systemctl daemon-reload
systemctl enable --now omni-daq-overview-publish.timer
systemctl start omni-daq-overview-publish.service
echo 'Fresh aggregate delivered to public DAQ; automatic refresh is enabled.'
echo 'The original dashboard, personnel API and database schema were not modified.'
