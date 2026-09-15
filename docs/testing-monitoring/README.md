# Testing and monitoring

## Local and CI checks

| Check | Purpose |
| --- | --- |
| `npm audit --omit=dev --audit-level=high` | Production dependency vulnerabilities |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type correctness |
| `npm test` | Unit tests |
| `npm run test:e2e` | Playwright against a local frontend and local Supabase |
| `npm run test:e2e:staging` | Playwright against the fixed Staging target with private Staging credentials |

- E2E supports only `local` and `staging`; Production is deliberately not a write-test target.
- CI starts disposable Supabase services and a Docker-built frontend runtime. It removes them after the run and provides no Production credentials.
- Failed CI browser runs retain their Playwright report for three days.

## Monitoring

- Uptime Kuma on the separate Status service checks public frontend availability. A successful frontend request is any `200–299` response.
- The container health check covers the local `robots.txt` route. The release workflow additionally checks the public HTTPS route.
- Monitoring and container health prove reachability, not signed-in user flows, database integrity or mail delivery.
- The Status host has its own failure boundary; see [Status operations](https://github.com/DetektivKollektiv/codetekt-supabase/tree/main/docs/scaleway-status).

## References

- [Playwright](https://playwright.dev/docs/intro)
- [GitHub Actions workflow artifacts](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow)
- [Uptime Kuma](https://github.com/louislam/uptime-kuma)
