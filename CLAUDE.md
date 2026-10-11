# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Toy marketplace web app (list / browse / save toys, buyer–seller chat). Originally scaffolded with Lovable: Vite + React 18 + TypeScript + shadcn/ui (Tailwind) + TanStack Query, with Supabase as the entire backend (Postgres, Auth incl. Google, Storage, Realtime). There is no custom server.

## Commands

```bash
npm run dev        # Vite dev server on http://localhost:8080/claude_code_toy_marketplace/
npm run build      # production build -> dist/
npm run build:dev  # build in development mode (enables lovable-tagger)
npm run lint       # eslint
npm run preview
```

There is no test suite.

Local Supabase (requires Supabase CLI + Docker; see `README_Supabase.md`):

```bash
supabase start                      # API at 127.0.0.1:54321, Studio at http://localhost:54323
supabase db reset                   # re-apply all migrations + seed.sql
supabase migration new <name>       # then edit the generated SQL, then `supabase db reset`
supabase link --project-ref <ref> && supabase db push   # deploy migrations to the remote project
```

## Architecture

- **Supabase client** (`src/integrations/supabase/client.ts`, auto-generated header) picks the backend by hostname: `localhost`/`127.0.0.1` → local Supabase at `127.0.0.1:54321`; anything else → the remote project. So `npm run dev` always talks to the *local* stack — run `supabase start` first. `types.ts` next to it holds the generated `Database` types; some newer RPCs are called via `(supabase as any).rpc(...)` because the types weren't regenerated.
- **Data access is RPC-first.** Most reads go through `SECURITY DEFINER`-style Postgres functions (`get_public_products`, `get_public_product_detail`, `get_user_conversations`, `get_conversation_messages_with_read_status`, `toggle_saved_product`, `create_conversation`, …) defined in `supabase/migrations/`. Project rule (from `README_Lovable.md`): before writing a query, look for an existing RPC to reuse; when data needs joins across tables, write a new RPC instead of joining from the client, because RLS on joined tables silently returns empty results.
- **Schema**: `profiles`, `products`, `product_images`, `saved_products`, `conversations`, `participants`, `messages`, `message_status`. The base schema is `00000000_consolidated_migration.sql`; later migrations are layered on top. Product images live in the public Storage bucket `product-images` (uploaded in `CreateListingForm.tsx`).
- **Realtime**: `PresenceProvider` (wraps the whole app in `App.tsx`) joins a `global-presence` channel for online status; `ConversationDetail.tsx` subscribes to `messages:<conversationId>` for live chat.
- **Auth**: `useAuth` hook wraps `supabase.auth` session state; no global auth context — each consumer calls the hook.
- **Routing**: all routes in `src/App.tsx`; add new routes above the catch-all `*`. Pages in `src/pages/`, data hooks in `src/hooks/use*.tsx`, shadcn primitives in `src/components/ui/` (generated — prefer adding via shadcn rather than hand-editing).
- `@/` aliases `src/`.

## Deployment

`vite.config.ts` sets `base: '/claude_code_toy_marketplace/'` for GitHub Pages and `gh-pages` is a devDependency, but there is no `deploy` script yet. Note `BrowserRouter` in `App.tsx` has no `basename`, so routes may not match under the `/claude_code_toy_marketplace/` sub-path.

## Conventions

- Name component/page files in PascalCase, e.g. `CreateListingForm.tsx` (README_Lovable calls this "camel style").
- Don't commit PII (e.g. emails). `.mcp.json` is gitignored — copy from `.mcp.json.example[.windows|.mac]` and fill in the Supabase project ref / access token and Context7 key. MCP servers configured there: playwright, context7, sentry, supabase.
- Open TODO (`README_TODO.md`): image upload in conversations.
