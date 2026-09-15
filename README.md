# Codetekt frontend operations

Compact operating documentation for the Codetekt web application. It reflects the Production setup verified on 2026-09-14.

| Area | Provider / service | Primary team entry | Details |
| --- | --- | --- | --- |
| Web application | Hetzner Production | `https://platform.codetekt.org` | [Application](docs/frontend-application/README.md) |
| Runtime host | Hetzner Cloud / `Codetekt` | Hetzner Cloud Console | [Hosting](docs/hetzner-production/README.md) |
| Releases | GitHub Actions + GitHub Container Registry | GitHub repository | [Release process](docs/release/README.md) |
| Quality and status | GitHub Actions + Uptime Kuma | GitHub repository / `https://status.codetekt.org` | [Tests and monitoring](docs/testing-monitoring/README.md) |
| Recovery | Hetzner Production + GHCR | Hetzner Cloud Console | [Recovery boundaries](docs/recovery/README.md) |
| Backend | Self-hosted Supabase | `https://api.codetekt.org` | [Backend operations](https://github.com/DetektivKollektiv/codetekt-supabase/tree/main/docs) |

## Access rule

- Use personal GitHub, Hetzner and SSH accounts or keys. Do not share accounts or private keys.
- Request team access, a new deployment credential, or replacement credentials from Gorm or Christoph.
- Keep passwords, private keys, tokens, environment files, database credentials, API keys and monitoring Push URLs out of Git, issues and screenshots.
- Report a possible credential exposure immediately. Stop using the exposed credential and have it replaced before continuing.

## Scope

- This repository owns the Next.js application, its tests and its frontend release automation.
- Supabase data, Auth, Storage, Edge Functions, transactional email and database recovery belong to the [backend operations documentation](https://github.com/DetektivKollektiv/codetekt-supabase/tree/main/docs).
- This documentation describes operations; it does not authorize a deployment, credential change, provider change or database migration.
