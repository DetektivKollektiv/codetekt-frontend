# Frontend CI/CD on Hetzner

Target: `https://production.codetekt.org`, Supabase API `https://api.codetekt.org`.
Only the frontend container is deployed. Database migrations, Supabase containers,
Edge Functions and Caddy are not deployed by this workflow.

## Flow

`.github/workflows/frontend.yml` runs on pushes to `main` and every PR to `main`.
`Frontend checks` audits production dependencies, then runs ESLint, TypeScript,
Vitest and restricted-deploy tests.
`Frontend E2E` starts disposable Supabase on the GitHub-hosted runner, builds the
Docker runtime and runs all Playwright tests against it. No production credentials
are available to these jobs. Before starting Supabase, the workflow reads the most
recent successful `hetzner-production` deployment from the public
`codetekt-supabase` GitHub deployment history and checks out its exact commit SHA.
If no successful deployment is recorded, the E2E job fails. The CLI version remains
pinned.

Only a successful push run on `main` publishes an amd64 image to
`ghcr.io/detektivkollektiv/codetekt-frontend`, tagged with the commit SHA. Deployment
uses the returned immutable digest. `hetzner-production` is restricted to `main`.
There is no manual deployment approval, as requested. The workflow does not merge PRs.

Main runs are serialized with `queue: max` (up to 100 pending runs). They are not
canceled by newer pushes. The server also locks deployments and refuses older run
numbers after a newer successful release. Rerun a failed **current** main run to
retry; restore an older version through a new revert PR.

Next.js public configuration is fixed at image build time. The publishable key is
public browser configuration, never a Supabase secret/service-role key. TypeScript
errors now fail the Next.js build as well as the separate CI check.

## One-time setup

1. A repository admin grants the operator Admin temporarily, or applies the settings
   below. The regular GitHub login is sufficient; do not share tokens in chat.
2. The `hetzner-production` Actions environment exists with deployment branch policy
   set to exactly `main` (branch, not tag) and no required reviewers.
3. Create an Ed25519 deploy key. Keep the private key only in the environment secret
   `SSH_PRIVATE_KEY`; remove the temporary local copy after installation and validation.
4. Transfer the reviewed `scripts/deploy` directory and public key to the server.
   Run `sudo bash install.sh <public-key-file>` there. This creates `codetekt-deploy`,
   a root-owned forced SSH command and one restricted sudo rule. The user has no
   Docker-group membership, writable deployment files, forwarding, PTY or arbitrary
   shell access through this key. The installer does not restart containers.
5. Set environment variables `SSH_HOST` to the server address and `SSH_KNOWN_HOSTS`
   to its Ed25519 known-hosts line, obtained over an already verified SSH connection.
   Never trust an unchecked `ssh-keyscan` during deployment.
6. Set repository Actions variable `PRODUCTION_SUPABASE_PUBLISHABLE_KEY` to the
   existing frontend public key. A rotation requires updating this variable and
   `/etc/codetekt-frontend-deploy/runtime.env` before building the next release.
7. Verify the new key cannot execute `id`, start a shell or forward ports. Keep
   `Frontend checks` and `Frontend E2E` as required checks in the existing
   `main` branch protection rule.

Environment secrets must not be moved to repository-wide secrets: ordinary feature
branch workflows must not be able to obtain the production SSH key.

The workflow uses `GITHUB_TOKEN` with `packages:write` only for publishing and
`packages:read` only for deployment. The server receives the deployment token over
SSH stdin and removes its temporary Docker login on exit. The GHCR package can stay
private and must grant this repository's Actions access (automatic on first publish
from this repository). Organization policy must allow creating the package.

## Current main protection

`main` currently enforces these rules without an administrator bypass:

- Require a pull request; **0 approving reviews**, as requested.
- Require `Frontend checks` and `Frontend E2E`, from GitHub Actions.
- Require the branch to be up to date before merging.
- Block force pushes and branch deletion; do not require linear history.

Suggested classic branch-protection API body (apply only after verifying existing
rules, to avoid replacing unrelated protection):

```json
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      { "context": "Frontend checks", "app_id": 15368 },
      { "context": "Frontend E2E", "app_id": 15368 }
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

A repository admin can still edit protection settings; applying checks to admins
prevents ordinary bypass pushes, not administrative reconfiguration.

## Server operation and rollback

CI uses `/etc/codetekt-frontend-deploy/compose.yml`, with the existing Compose
project/container name `codetekt-frontend` and network `supabase_default`.
`/home/gorm/services/codetekt-frontend/compose.production.yml` remains the previous
manual build configuration; do not use it for routine releases after switching to CI.

The installer preserves the current public runtime settings in a root-owned env
file so rollback also works with the pre-CI image. The deploy command downloads the
new image before replacing the container. It waits for the container healthcheck
and checks the public HTTPS robots endpoint. Failures attempt to restore the prior
local image ID and fail the Actions job. A failed rollback explicitly reports that
manual intervention is required. The first real deployment must be verified after
merge; mock tests are not proof of a successful live deployment.

A single container replacement has a brief interruption; this is not zero-downtime
deployment. Healthchecks establish container/HTTPS availability, not full production
database correctness. PR E2E covers application behavior against the pinned test backend.
The prior image is retained. No volume removal or broad image pruning is performed;
monitor disk usage and retain the current/previous image when cleaning old releases.

For emergency manual recovery, a server admin can use the image ID recorded in
`/var/lib/codetekt-frontend-deploy/previous-image` with the root-owned Compose file.
Verify the container and public HTTPS endpoint, then restore the desired source
state via a revert PR so future releases remain consistent.

## Verification and sources

Local: `npm audit --omit=dev --audit-level=high`, `npm test`, `npm run lint`,
`npx tsc --noEmit`, `python3 scripts/deploy/test_deploy.py`,
`bash -n scripts/deploy/*.sh`.
Actionlint 1.7.12 does not yet recognize the officially documented `concurrency.queue`
property; its remaining checks run with `-ignore 'unexpected key "queue"'`.
GitHub's actual PR run is required to verify workflow acceptance and Linux E2E.

Official documentation reviewed on 2026-09-07:

- [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub workflow concurrency and queue](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [GitHub secure workflow use](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub Container Registry authentication and digests](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Docker GitHub Actions](https://docs.docker.com/build/ci/github-actions/)
- [Docker Compose health waiting](https://docs.docker.com/reference/cli/docker/compose/up/)
- [Supabase testing in GitHub Actions](https://supabase.com/docs/guides/deployment/ci/testing)
