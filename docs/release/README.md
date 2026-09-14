# Frontend release process

## Delivery path

1. A pull request to `main` runs dependency audit, linting, TypeScript, unit tests and deployment-command tests.
2. Browser E2E runs against an isolated Supabase stack and the exact backend revision from the latest successful `hetzner-production` deployment. It fails rather than silently testing an arbitrary backend revision.
3. A successful push to `main` builds an amd64 image, publishes it to GitHub Container Registry and deploys its immutable digest through the protected `hetzner-production` GitHub Actions environment.
4. The restricted deployment account pulls the image, waits for the container health check and verifies `https://production.codetekt.org/robots.txt`.

- Pull requests receive no Production deployment secret.
- Release runs are queued and the host rejects an older workflow run after a newer release has succeeded.
- The workflow deploys only the frontend container. It never applies Supabase migrations, deploys Edge Functions or changes Caddy.

## Access and change boundaries

- GitHub environment access, its SSH deployment key and host connection settings are managed by Gorm or Christoph. Keep the key restricted to the deployment environment, not repository-wide secrets.
- The publishable Supabase key is a GitHub Actions variable, not a secret. Service-role, database and private API keys must never enter this repository or a browser build.
- Make a correction through a new pull request. Do not use a force push or deploy a local image to Production.

## Rollback

- If container startup or public endpoint verification fails, the deployment command automatically attempts the preceding image.
- A server administrator can restore the recorded preceding image for an emergency. Follow that with a revert pull request so source and runtime converge again.
- Rollback restores frontend code only. It cannot undo backend migrations, data changes or external side effects.

## References

- [GitHub Actions environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker image digests](https://docs.docker.com/dhi/core-concepts/digests/)
