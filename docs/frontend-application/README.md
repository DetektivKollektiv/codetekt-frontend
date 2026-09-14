# Frontend application

## Purpose and boundaries

The application is a Next.js App Router frontend for submitting, reviewing and discussing cases, browsing the archive, user accounts, tutorials and the current challenge.

| Layer | Responsibility |
| --- | --- |
| UI | React, TypeScript, Tailwind and shared UI components |
| Application state | React Query, form/schema validation and review-flow logic |
| Authentication | Cookie-based Supabase session handling in the request proxy |
| Data | Supabase REST, Auth and Edge Functions through `https://api.codetekt.org` |
| Rich text | Sanitised before rendering |
| Social metadata | Next.js metadata and share-image route |

- Public pages include the landing page, archive, case pages, tutorial, authentication and legal pages. Submitting, reviewing, profile settings and other protected routes require a valid session.
- The request proxy refreshes the session and redirects unauthenticated protected requests. It also keeps users who have not completed the tutorial in the tutorial flow.
- Database types are generated from the backend schema. Change application behavior, backend migrations, RLS and Edge Functions together when they cross this boundary.

## Configuration

| Variable | Use | Handling |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Backend URL | Public browser configuration |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser access to Supabase | Public publishable key; never a service-role or secret key |
| `VERCEL_URL` | Public origin and metadata | Set to the target host during the Production build |

- Public Next.js variables are baked into the image build. A configuration change needs a reviewed release and coordinated host runtime configuration for rollback.
- Keep local values in `.env.local`. Staging test secrets belong only in `.env.staging.local`; neither file is committed.
- Production uses `https://production.codetekt.org`; the backend URL is `https://api.codetekt.org`.

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase SSR for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)
