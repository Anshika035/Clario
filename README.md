# Clario

Student platform foundation: Next.js App Router, TypeScript, Tailwind CSS, Supabase SSR, and Zod. Feature product logic is not implemented yet.

## Run locally

You need Node.js 20+ (`node` and `npm` on your PATH).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local`. The landing page, placeholders, and auth forms work without credentials. Login and signup stay disabled until you add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`SUPABASE_SERVICE_ROLE_KEY` is server-only and unused by the UI.

## Supabase

Create a project, then run `supabase/migrations/0001_init.sql` in the SQL editor. Row Level Security is enabled in that migration.
