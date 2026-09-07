#!/bin/bash
# Run once as root from a reviewed checkout/bundle. Does not restart any service.
set -euo pipefail
export PATH=/usr/sbin:/usr/bin:/sbin:/bin
[[ $EUID == 0 && $# == 1 ]] || { echo 'Usage: sudo bash install.sh <deploy-key.pub>' >&2; exit 64; }
source_dir=$(cd -- "$(dirname -- "$0")" && pwd)
public_key=$(cat -- "$1")
[[ $public_key =~ ^ssh-ed25519\ [A-Za-z0-9+/=]+(\ [^$'\n']*)?$ ]] || { echo 'Expected one Ed25519 public key.' >&2; exit 64; }
if id codetekt-deploy &>/dev/null; then
  echo 'codetekt-deploy already exists; inspect the existing account before reinstalling.' >&2
  exit 1
fi
docker inspect codetekt-frontend >/dev/null
docker network inspect supabase_default >/dev/null
command -v flock >/dev/null
command -v curl >/dev/null
command -v visudo >/dev/null

useradd --system --home-dir /var/lib/codetekt-deploy --shell /bin/sh codetekt-deploy
install -d -o root -g root -m 755 /var/lib/codetekt-deploy /var/lib/codetekt-deploy/.ssh
install -d -o root -g root -m 700 /etc/codetekt-frontend-deploy /var/lib/codetekt-frontend-deploy
install -o root -g root -m 755 "$source_dir/deploy.sh" /usr/local/sbin/codetekt-deploy
install -o root -g root -m 755 "$source_dir/ssh-command.sh" /usr/local/bin/codetekt-deploy-ssh
install -o root -g root -m 600 "$source_dir/compose.yml" /etc/codetekt-frontend-deploy/compose.yml
# Preserve the public runtime settings, including for rollback to the old image.
docker inspect codetekt-frontend --format '{{range .Config.Env}}{{println .}}{{end}}' |
  while IFS= read -r setting; do
    case "$setting" in
      NEXT_PUBLIC_SUPABASE_URL=*|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=*|VERCEL_URL=*) printf '%s\n' "$setting" ;;
    esac
  done > /etc/codetekt-frontend-deploy/runtime.env
chmod 600 /etc/codetekt-frontend-deploy/runtime.env
printf 'restrict,command="/usr/local/bin/codetekt-deploy-ssh" %s\n' "$public_key" > /var/lib/codetekt-deploy/.ssh/authorized_keys
chmod 644 /var/lib/codetekt-deploy/.ssh/authorized_keys
sudoers=$(mktemp)
trap 'rm -f -- "$sudoers"' EXIT
printf 'codetekt-deploy ALL=(root) NOPASSWD: /usr/local/sbin/codetekt-deploy\n' > "$sudoers"
visudo -cf "$sudoers"
install -o root -g root -m 440 "$sudoers" /etc/sudoers.d/codetekt-deploy
echo 'Restricted deploy account installed. No containers were restarted.'
