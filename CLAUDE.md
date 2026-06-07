# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is a **Remix v3 (beta)** app running on **Cloudflare Workers**, built with **Vite** (`@cloudflare/vite-plugin`). Remix v3 is a ground-up rewrite and shares almost nothing with Remix v1/v2 or React Router — prior Remix/React knowledge mostly does **not** apply.

## Read the Remix skill first

The authoritative guide for working in this codebase is the bundled skill at **`.agents/skills/remix/SKILL.md`**, with deep-dive references in `.agents/skills/remix/references/`. Before touching routes, controllers, middleware, data/validation, auth/sessions, UI components, hydration, navigation, or tests, classify the task and load the smallest relevant reference (the SKILL has a task→file table). It documents the component model (`function Name(handle: Handle<Props>) { return () => … }`, props via `handle.props`, explicit `handle.update()`), the `mix={mixin(...)}` styling/event system, `clientEntry` islands, the `remix/<subpath>` package map, and the layout/placement rules. Do not duplicate or contradict it; treat it as source of truth.

For fuller per-package API docs, read the README next to the generated source: `node_modules/remix/src/<subpath>/README.md` (e.g. `remix/fetch-router` → `node_modules/remix/src/fetch-router/README.md`). Prefer that and the context7 MCP over training-data memory — the API is beta and moves.

## Commands

Requires Node `>=24.3.0` and pnpm. The app is built and served by **Vite** + `@cloudflare/vite-plugin`; your Worker runs in **workerd** in both dev and preview (matching production).

```sh
pnpm dev          # Vite dev server, Worker in workerd, http://localhost:5173
pnpm build        # vite build → dist/client (assets) + dist/<worker>/ (Worker bundle)
pnpm preview      # build, then serve the built Worker in workerd (http://localhost:4173)
pnpm deploy       # build, then `wrangler deploy` (needs `wrangler login` first)
pnpm test         # node --test via the remix/node-tsx loader
pnpm typecheck    # tsc --noEmit (the real "compile" check)
pnpm lint         # oxlint (NOT eslint)
pnpm lint:fix     # oxlint --fix
pnpm format       # prettier --write .
```

Tests run under Node (not workerd) via the `remix/node-tsx` import hook:

```sh
node --import remix/node-tsx --test path/to/file.test.ts
node --import remix/node-tsx --test --test-name-pattern "partial name"
```

A Husky `pre-commit` hook runs lint-staged (oxlint --fix + prettier) on staged JS/TS.

## How this repo is wired

The skill describes the general structure; this is the concrete Vite + Cloudflare Workers wiring:

1. **`server.ts`** — the Worker entry: `export default { fetch(request) }` delegating to `router.fetch(request)`. No Node `http`; this module runs in workerd.
2. **`vite.config.ts`** — `@cloudflare/vite-plugin` runs the Worker (`server.ts`, named by `wrangler.jsonc` `main`) in workerd. A `client` build environment bundles `client.ts` → `dist/client/assets/client.js`.
3. **`wrangler.jsonc`** — `main: ./server.ts`, `compatibility_date`, worker `name`. `vite build` generates the real deploy config at `dist/<worker>/wrangler.json` plus a `.wrangler/deploy/config.json` redirect, so plain `wrangler deploy` from the repo root uses the built output.
4. **`app/routes.ts`** — the typed route contract: `route({ home: '/' })` from **`remix/fetch-router/routes`**. Route keys power `routes.<key>.href(...)` builders used in JSX.
5. **`app/router.ts`** — `createRouter()` from **`remix/fetch-router`**, then `router.map(routes.home, home)` (one `map` call per route leaf). No middleware: Cloudflare serves static assets before the Worker runs, so there is no `staticFiles`/asset server.
6. **`app/controllers/home.tsx`** — `createAction(routes.home, { handler({ request }) { return render(<HomePage/>, request) } })`. `createAction` just returns the action while giving TS the route's param types.
7. **`app/utils/render.tsx`** — `render(node, request)` wraps `renderToStream` (streaming SSR) and returns an HTML `Response`. **No `resolveClientEntry`** — `clientEntry` ids are already browser-resolvable module paths (see below), so `renderToStream`'s default resolver handles them.
8. **`client.ts`** (repo root) — the browser entry. `run({ loadModule })` resolves island modules through `import.meta.glob(['/app/**/*.{ts,tsx}', '!/app/**/*.server.*'])`. `app/ui/document.tsx` boots it via `<script type="module" src={import.meta.env.DEV ? '/client.ts' : '/assets/client.js'}>`.

**clientEntry ids are explicit module paths.** Islands register as `clientEntry('/app/ui/prompt-button.tsx#PromptButton', …)`: the part before `#` must exactly match an `import.meta.glob` key (the file's absolute path from repo root) and the part after `#` is the export name. There is no asset server resolving `import.meta.url` anymore — getting this string wrong is the most common breakage. Keep server-only modules named `*.server.ts(x)` (excluded by the glob).

`app/ui/scaffold-home-page.tsx` is placeholder scaffolding — replace it with the real home page.

## Caveats

- **Vite is pinned to v7, not v8 — re-test carefully before bumping.** Vite 8's Rolldown dep-optimizer breaks this stack two ways: (a) its dev dep-scan ignores `jsxImportSource`, so JSX compiles against React (`react/jsx-dev-runtime` "could not be resolved", scan skipped); and (b) it prebundles `remix/fetch-router` and `remix/fetch-router/routes` in isolation, duplicating the internal `Route` class so the router's `instanceof Route` checks fail at startup (`Cannot map nested route map key` / `Expected a controller with an object actions property`). Vite 7's esbuild optimizer reads tsconfig `jsxImportSource` and shares chunks, so the stock minimal config works with no `oxc`/`optimizeDeps` hacks.
- **Import router APIs from the `remix/fetch-router` family** (`remix/fetch-router`, `remix/fetch-router/routes`), not the top-level `remix/router` / `remix/routes` aliases. They resolve to the same files, but mixing the two prefixes makes the bundler resolve `Route` through different module identities and breaks `instanceof` checks.
- `dist/` and `.wrangler/` are gitignored build output. `pnpm dev`/`preview` need the `workerd` native binary, whose install script is allowed via `allowBuilds` in `pnpm-workspace.yaml`.
