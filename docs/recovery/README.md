# Frontend recovery

## Recovery layers

| Layer | Covers | Does not cover |
| --- | --- | --- |
| Automatic release rollback | Failed image replacement or public endpoint check | Backend data, migrations or third-party side effects |
| Previous image record | Emergency restoration by a server administrator | Loss of the host configuration, registry access or credentials |
| Hetzner host recovery | Server-disk recovery together with backend host recovery | A guarantee of database consistency while the database is writing |
| Repository and GHCR image | Rebuilding or re-deploying the reviewed frontend | Private runtime configuration and deployment credentials |

- The frontend has no application database or uploaded-file volume. Database, Auth, Storage and point-in-time recovery are owned by the backend.
- A complete host-loss recovery still requires independently recoverable host configuration, deployment access, GitHub environment configuration and registry access. Never assume a frontend image alone restores those dependencies.
- The backend's proven PostgreSQL PITR drill does not by itself recover the frontend host configuration. Follow the [backend recovery procedure](https://github.com/DetektivKollektiv/codetekt-supabase/tree/main/docs/backups-recovery) for that layer.

## Incident sequence

1. Check the public status page and the relevant GitHub Actions run.
2. For a failed current release, allow or verify automatic rollback; for a confirmed application regression, create a revert pull request.
3. Escalate host, registry or credential loss to Gorm or Christoph. Do not expose or recreate credentials in Git, issues or chat.

## References

- [Hetzner Cloud Backups](https://docs.hetzner.com/cloud/servers/backups-snapshots/overview/)
- [GitHub Actions deployment history](https://docs.github.com/en/rest/deployments/deployments)
