#!/bin/bash
set -Eeuo pipefail
export PATH=/usr/sbin:/usr/bin:/sbin:/bin
umask 077

if [[ $# != 1 || ! $1 =~ ^deploy\ (sha256:[a-f0-9]{64})\ ([a-zA-Z0-9][a-zA-Z0-9-]{0,38})\ ([1-9][0-9]{0,9})$ ]]; then
  echo 'Only deploy sha256:<64 lowercase hex characters> <GitHub username> <run number> is allowed.' >&2
  exit 64
fi
image="ghcr.io/detektivkollektiv/codetekt-frontend@${BASH_REMATCH[1]}"
registry_user=${BASH_REMATCH[2]}
run_number=${BASH_REMATCH[3]}
[[ $EUID == 0 ]] || { echo 'Run through the restricted sudo entry point.' >&2; exit 77; }

exec 9>/var/lib/codetekt-frontend-deploy/deploy.lock
flock -w 300 9
if [[ -f /var/lib/codetekt-frontend-deploy/run-number ]] &&
   (( run_number < $(cat /var/lib/codetekt-frontend-deploy/run-number) )); then
  echo 'Refusing to deploy an older workflow run over a newer release.' >&2
  exit 65
fi
export DOCKER_CONFIG
DOCKER_CONFIG=$(mktemp -d /var/lib/codetekt-frontend-deploy/docker.XXXXXX)
trap 'rm -rf -- "$DOCKER_CONFIG"' EXIT

# The short-lived Actions packages:read token arrives over SSH stdin only.
IFS= read -r registry_token
[[ -n $registry_token ]] || exit 64
printf '%s\n' "$registry_token" | docker login ghcr.io -u "$registry_user" --password-stdin >/dev/null
unset registry_token
docker pull "$image"

previous=$(docker inspect codetekt-frontend --format '{{.Image}}')
compose() {
  FRONTEND_IMAGE="$1" docker compose --project-name codetekt-frontend \
    -f /etc/codetekt-frontend-deploy/compose.yml up --no-build --no-deps --wait --wait-timeout 120 app
}
rollback() {
  trap - ERR HUP INT TERM
  echo 'Deployment failed; restoring the previous frontend image.' >&2
  if ! compose "$previous"; then
    echo 'ROLLBACK FAILED: manual intervention required.' >&2
  fi
  exit 1
}
trap rollback ERR HUP INT TERM
compose "$image"
curl --fail --silent --show-error --max-time 15 --retry 4 --retry-delay 3 \
  --retry-all-errors https://production.codetekt.org/robots.txt >/dev/null
trap - ERR HUP INT TERM
printf '%s\n' "$previous" > /var/lib/codetekt-frontend-deploy/previous-image
printf '%s\n' "$image" > /var/lib/codetekt-frontend-deploy/current-image
printf '%s\n' "$run_number" > /var/lib/codetekt-frontend-deploy/run-number
echo "Frontend deployed: $image"
