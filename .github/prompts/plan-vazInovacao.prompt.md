## Plan: Vazinovacao Next.js + WordPress GraphQL Migration

Migrate vazinovacao from React+Vite SPA to Next.js Pages Router, adopting the GraphQL architecture proven in manuel-antunes (codegen + typed documents + gqlpc + execute + fragments-as-props), while removing Supabase/Auth and using WordPress as the single source of truth. The rollout is a clean in-place rewrite with build-gated checkpoints (`gen` then `build`) to satisfy acceptance criteria.

**Steps**
1. Phase 1: Baseline and dependency transition (*blocks all later steps*)
1.1 Capture current behavior and route inventory from `src/App.tsx` and existing pages before edits.
1.2 Replace Vite runtime/tooling with Next.js Pages Router tooling in `package.json` scripts and dependencies.
1.3 Remove Vite-only config usage from build pipeline (`vite.config.ts`, Vite scripts, Vite entry assumptions).
1.4 Add Next foundational configs (`next.config.js`, Next-aware TypeScript and lint config updates) while preserving Tailwind/PostCSS setup.
1.5 Keep `codegen.ts` as baseline and adjust only paths/env behavior required by Next runtime.

2. Phase 2: GraphQL framework bootstrap (*depends on 1; can run partly parallel with Phase 3 query authoring*)
2.1 Create the GraphQL workspace structure under `src/graphql` mirroring the reference app conventions (`__gen__`, transport helpers, query modules).
2.2 Add `.graphqlrc.yaml` and wire document globs to both page-level queries and component fragments.
2.3 Port/adapt `execute.ts` and `gqlpc.ts` so transport rules match your requested behavior:
- Client calls -> `/api/wordpress/graphql`
- Server calls -> direct `WORDPRESS_API_URL`
2.4 Add `pages/api/wordpress/graphql.ts` proxy with secure header forwarding and server-only key handling.
2.5 Add locale mapping helper (`localeToWpLanguage`) with `pt-BR` baseline now and extension-ready shape for future locales.
2.6 Add codegen scripts (`gen`, `gen:watch`) and GraphQL deps; ensure generated artifacts are imported from one stable location.

3. Phase 3: WordPress query/mutation contract design (*depends on 2; parallel with component refactor prep in Phase 4*)
3.1 Define blog read operations: list posts, post by slug, categories/tags metadata, related content.
3.2 Define subscriber mutation path (WordPress-backed create subscriber flow) and error handling contract.
3.3 Map current Supabase table-derived fields to WordPress schema fields/taxonomies (tags, categories, featured image, SEO metadata fallbacks).
3.4 Introduce shared fragments for reusable entities (post card data, post header data, taxonomy chips), and enforce fragment co-location.

4. Phase 4: Route migration to Next Pages Router (*depends on 1 and 2*)
4.1 Replace React Router entrypoint by implementing Next pages equivalents for current public routes:
- `/` (landing)
- `/blog`
- `/blog/[slug]`
- 404
4.2 Move page data fetching to Next patterns (`getStaticProps`, `getStaticPaths`, ISR where needed) using `gqlQueryOptions` + dehydrated React Query state.
4.3 Move document/head SEO behavior from client-side effects into Next page-level metadata handling.
4.4 Preserve UX and visual layout while removing SPA router-only elements.

5. Phase 5: Component architecture refactor (atomic design by responsibility, no atoms/molecules folders) (*depends on 3; mostly parallel with 4 after GraphQL contracts exist*)
5.1 Refactor large page-bound components into smaller responsibilities (data shell, filter/search controls, list renderer, content body blocks).
5.2 Apply fragments-as-props in blog components:
- each presentational component defines/owns its fragment
- parent queries compose fragments
- component props use `FragmentType<typeof ...>` + `useFragment(...)`
5.3 Keep folder naming pragmatic (feature-oriented), avoiding forced `atoms/molecules` hierarchy while still eliminating code smell from oversized components.

6. Phase 6: Supabase/Auth removal and WordPress source-of-truth enforcement (*depends on 4*)
6.1 Remove all auth UI and route-guard flow (`/auth`, `ProtectedRoute`, `useAuth`, auth provider wiring).
6.2 Remove Supabase client/types/hooks usage from pages/components and replace with GraphQL operations.
6.3 Remove Supabase package dependencies and obsolete integration files/folders no longer referenced.
6.4 Remove custom in-app admin CMS surface (`/admin/blog`) per decision to use WordPress admin as editorial UI.

7. Phase 7: Build hardening and acceptance validation (*depends on all prior phases*)
7.1 Enforce pipeline order: `gen` -> typecheck/lint -> `build`.
7.2 Validate static generation and runtime behavior for all migrated pages and dynamic blog slugs.
7.3 Validate GraphQL transport paths in both server and client execution contexts.
7.4 Validate subscriber mutation path against WordPress endpoint and expected failure modes.
7.5 Validate no residual Supabase/Auth references remain in runtime code.

**Relevant files**
- `/Users/manuelantunes/Projects/Vas/vazinovacao/package.json` — replace Vite scripts/deps; add Next + GraphQL codegen scripts/deps.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/codegen.ts` — retain and adapt schema/doc generation contract for Next structure.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/App.tsx` — decommission React Router app root.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/main.tsx` — remove Vite entrypoint responsibilities.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/pages/Blog.tsx` — migrate to Next page/query model.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/pages/BlogPost.tsx` — migrate to slug page with static paths/props + fragment-based rendering.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/pages/Index.tsx` — migrate to Next homepage route.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/pages/NotFound.tsx` — migrate into Next 404 handling.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/pages/AdminBlog.tsx` — remove in favor of WordPress admin workflow.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/pages/Auth.tsx` — remove (auth features removed).
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/components/ProtectedRoute.tsx` — remove.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/hooks/useAuth.tsx` — remove.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/integrations/supabase/client.ts` — remove.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/src/integrations/supabase/types.ts` — remove.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/supabase/functions/import-article-url/index.ts` — remove/deprecate from app dependency path.
- `/Users/manuelantunes/Projects/Vas/vazinovacao/supabase/functions/rewrite-article/index.ts` — remove/deprecate from app dependency path.
- `/Users/manuelantunes/Projects/manuel-antunes/apps/web/src/graphql/gqlpc.ts` — reference pattern for query/mutation/infinite helpers.
- `/Users/manuelantunes/Projects/manuel-antunes/apps/web/src/graphql/execute.ts` — reference transport pattern.
- `/Users/manuelantunes/Projects/manuel-antunes/apps/web/src/graphql/locale-to-wp-language.ts` — reference locale mapping pattern.
- `/Users/manuelantunes/Projects/manuel-antunes/apps/web/src/pages/api/wordpress/graphql.ts` — reference proxy API implementation.
- `/Users/manuelantunes/Projects/manuel-antunes/apps/web/src/components/blog/post-preview.tsx` — reference fragments-as-props composition.
- `/Users/manuelantunes/Projects/manuel-antunes/apps/web/src/pages/blog/index.tsx` — reference Next page + React Query hydration integration.

**Verification**
1. Install + generation: run dependency install, then `gen`; confirm generated files exist and no GraphQL schema/doc errors.
2. Type safety: run TypeScript check and lint; confirm no unresolved Supabase/Auth imports.
3. Build gate: run `build`; confirm Pages Router routes compile and static generation succeeds.
4. Runtime checks (manual):
- `/` renders
- `/blog` renders posts from WordPress
- `/blog/[slug]` renders content and handles missing slug with 404
- subscriber action calls WP mutation path correctly
5. Transport checks:
- client network calls hit `/api/wordpress/graphql`
- server-side data-fetching uses direct WordPress URL
6. Regression checks:
- no route points to removed auth/admin pages
- no leftover Supabase env vars required by runtime

**Decisions**
- Framework migration: clean in-place rewrite.
- CMS authoring: WordPress admin only (no custom Next admin panel).
- Auth features: fully removed from website.
- Locale launch: `pt-BR` only now, but keep locale mapping architecture compatible with future expansion.
- GraphQL transport: same reference model (client via Next API proxy; server via direct WordPress endpoint).

**Scope Boundaries**
- Included: full frontend migration, GraphQL framework setup, fragments-as-props rollout, Supabase/Auth removal.
- Excluded: rebuilding a custom editorial admin interface in Next, Supabase function parity as part of frontend runtime.

**Further Considerations**
1. If URL import/rewrite remains a business need after admin removal, implement it as WordPress-side capability (custom WPGraphQL mutation/resolver) so WordPress remains the single source of truth.
2. Add CI guard to fail PRs when `gen` output is stale (pre-build codegen check).
3. Consider introducing pagination routes in `/blog/page/[n]` after base migration if post volume grows.