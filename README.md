# kapi-portal

Developer portal for **kapi.aspra.io** — the Aspra API gateway for super-app services
(mobile recharge, utility bills, remittance, wallets, gift cards, virtual cards, eSIM,
travel, hotels).

This is the public marketing surface + sign-up / sign-in entry point. All real product
logic lives in the existing **aspra-api** backend (`https://api.aspra.io`); this app is
a thin Next.js UI that calls it.

## Stack

- Next.js 15 (App Router) + TypeScript strict
- Tailwind v4 + shadcn/ui (new-york)
- react-query, react-hook-form, zod
- Scalar embed for API docs (`@scalar/api-reference-react`)

## Local dev

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>.

`NEXT_PUBLIC_API_URL` defaults to `https://api.aspra.io`.

## Routes (Phase 1)

Marketing (public):

- `/` — landing
- `/pricing`
- `/docs` — Scalar embed against the live OpenAPI
- `/status` — checks `/v1/public/openapi.json` availability
- `/contact`

Auth:

- `/sign-in` — POSTs to `/v1/auth/login`, sets `aspra_session` cookie
- `/sign-up` — multi-step application form (manual approval)
- `/sign-up/thanks`
- `/coming-soon` — post-login landing until the developer console exists

## Deploy

The repo is wired for Vercel. Framework auto-detected as `nextjs`.

1. Push to `main` on `aspraio/kapi-portal`.
2. Import the repo into Vercel (same scope as `aspra-admin-portal`).
3. Set `NEXT_PUBLIC_API_URL=https://api.aspra.io` in project env.
4. Add custom domain `kapi.aspra.io` in Vercel; create a `CNAME kapi -> cname.vercel-dns.com`
   record in Cloudflare (proxy off).

## Phase 1 scope

Marketing pages, sign-up application stub, sign-in stub. **No** developer console,
**no** billing UI, **no** Kong UI — those land in Phase 2/3.

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`).
- TS strict, no `any` without a comment.
- All UI primitives from shadcn live in `components/ui/*`.
- Match `aspra-admin-portal` style and `apiFetch` patterns.
