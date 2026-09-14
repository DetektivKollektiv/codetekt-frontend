# Hetzner Production hosting

## Runtime

| Item | Current Production setup |
| --- | --- |
| Provider / project | Hetzner Cloud / `Codetekt` |
| Public application | `https://production.codetekt.org` |
| Runtime | One `codetekt-frontend` Next.js container |
| Image source | GitHub Container Registry; immutable image digest |
| Network boundary | Shared internal Docker network with the self-hosted Supabase stack |
| Public routing | Caddy terminates HTTPS and routes the public application |
| Container health | Local `robots.txt` response; release also verifies the public HTTPS endpoint |

- The frontend container is stateless. Application data, identities, files and email delivery are backend responsibilities.
- It restarts automatically after a host or container restart. A healthy container does not prove authenticated application behavior or backend correctness.
- The host is shared with the backend. Treat host, firewall, Cloud Backup and database recovery as described in the [backend operations documentation](https://github.com/DetektivKollektiv/codetekt-supabase/tree/main/docs).

## Operations boundary

- Use the reviewed release workflow for application changes. Do not replace the production container manually as a normal release path.
- A server administrator maintains host-level configuration, firewall and access. Request access from Gorm or Christoph; never add shared SSH keys.
- Runtime configuration is private host configuration. Do not copy it to this repository or documentation.

## References

- [Hetzner Cloud documentation](https://docs.hetzner.com/cloud/)
- [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [Docker Compose health checks](https://docs.docker.com/reference/compose-file/services/#healthcheck)
