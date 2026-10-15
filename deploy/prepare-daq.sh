#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run as root on the public DAQ server.' >&2; exit 1; }
unit=omni-daq.service
systemctl cat "$unit" >/dev/null
[[ $(systemctl show "$unit" -p DynamicUser --value) != yes ]] || { echo 'Configure storage permissions for the dynamic service user first.' >&2; exit 1; }
web_user=$(systemctl show "$unit" -p User --value)
web_user=${web_user:-root}
web_group=$(systemctl show "$unit" -p Group --value)
web_group=${web_group:-$(id -gn "$web_user")}
install -d -m 0750 -o root -g "$web_group" /etc/omni-daq-overview
install -d -m 0750 -o "$web_user" -g "$web_group" /var/lib/omni-daq-overview
key=/etc/omni-daq-overview/publish.key
if [[ ! -e $key ]]; then
  (umask 077; openssl rand -hex 32 > "$key")
fi
grep -Eq '^[[:xdigit:]]{64}$' "$key" || { echo 'Invalid signing key; nothing restarted.' >&2; exit 1; }
chown root:"$web_group" "$key"
chmod 0640 "$key"
install -d -m 0755 /etc/systemd/system/omni-daq.service.d
cat > /etc/systemd/system/omni-daq.service.d/overview.conf <<'UNIT'
[Service]
Environment=OMNI_OVERVIEW_MODE=push
Environment=OMNI_OVERVIEW_KEY_FILE=/etc/omni-daq-overview/publish.key
Environment=OMNI_OVERVIEW_FILE=/var/lib/omni-daq-overview/latest.json
ReadWritePaths=/var/lib/omni-daq-overview
UNIT
systemctl daemon-reload
echo 'DAQ push configuration prepared; the website has not been restarted.'
echo 'Securely copy /etc/omni-daq-overview/publish.key to the data server; never paste its contents into chat or Git.'
