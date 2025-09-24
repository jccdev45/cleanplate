# Cleanplate — Restaurant Inspections Explorer

Cleanplate is an open-source app (Vite + React + TypeScript) built around TanStack libraries that helps you explore, visualize, and interact with restaurant inspection data. The app shows restaurant locations on a map, time-series and aggregate charts, tabular data with sorting/filtering, and per-restaurant inspection details.

![Cleanplate preview](/og_image.png)

## Quick summary

- Purpose: Browse restaurants, view inspection histories and violations, and explore aggregated metrics (scores, grades, cuisine, borough). Map-centric UI with clustering and charts.
- Main ideas: file-based routing (TanStack Router), server/client data fetching (route loaders + TanStack Query), component primitives (shadcn/radix + Tailwind), maps (Leaflet), charts (Recharts), and runtime validation (Zod).

## Highlights / features

- Interactive Leaflet map with marker clustering and compact marker DTOs (fast map rendering).
- Table view with virtualized rows and column definitions powered by TanStack Table and TanStack Virtual.
- Charts (bar/area/pie) demonstrating aggregated metrics and trends.
- Per-restaurant detail pages including inspection cards and violations lists.
- Route loaders and TanStack Query integration for caching, optimistic updates and background refetching.
- Dark/light theme with `next-themes` + a theme toggle component.

## Tech stack

- Vite + React + TypeScript
- TanStack Router (file-based routes) and TanStack Query
- TanStack Table + TanStack Virtual
- Tailwind CSS (+ tailwind-merge, tailwindcss-animate)
- shadcn UI + Radix primitives + lucide-react icons
- Leaflet + react-leaflet + marker clustering
- Recharts for charts
- Zod for runtime schema validation
- Vitest + Testing Library for unit tests
- Biome for linting/formatting/type checks

## Requirements

- Node.js (or Bun). The repo's CI uses Bun but npm/yarn/pnpm also work locally.
- Recommended: Node 18+ or the latest Bun release if you prefer Bun.

## Quick start

Install dependencies and run the dev server. Bun is recommended for parity with CI, but npm/yarn/pnpm are supported.

Using Bun (recommended):

```bash
bun install
bun run dev
```

Using npm:

```bash
npm install
npm run dev
```

Available scripts (from `package.json`):

- dev: vite dev --port 3000
- build: vite build
- serve: vite preview
- start: node .output/server/index.mjs
- test: vitest run
- lint: biome lint
- format: biome format
- check: biome check

Example: run the dev server and tests

```bash
npm run dev
npm run test
```

## Project layout (important files)

- `src/routes/` — file-based TanStack routes. Add routes by creating files here; the route tree is generated into `src/routeTree.gen.ts`.
- `src/router.tsx` — router wiring and top-level providers.
- `src/integrations/tanstack-query/` — QueryClient provider helpers used across the app.
- `src/components/` — UI components grouped by feature (map, table, charts, restaurant, layout, shared UI, etc.).
`src/lib/` — shared helpers: fetch utilities, Socrata integration, constants, theme helpers, etc.
`src/schema/` — Zod schemas describing external data shapes.
`src/types/` — TypeScript types derived from schemas and DTOs.
`src/utils/` — small, pure helpers and view-model utilities (formatters, normalizers, selectors, small transformation functions). Use `utils` for lightweight, side-effect-free helpers; use `lib` for heavier integrations, API clients, and longer-lived services.

If you add UI components, prefer `src/components/ui/` (shadcn-style primitives) and use the `@/` alias for imports (`@/components/...`).

## Routing & data fetching patterns

- File-based routes live in `src/routes`. Each route can export a `loader` (for server/route-time data loading) and a `component` that reads `useLoaderData()`.
- Use TanStack Query (`useQuery`, `useMutation`) inside components for client-driven data, background refreshes, and optimistic updates. A central QueryClient is provided by `src/integrations/tanstack-query`.
- Validate all external responses with Zod. See `src/schema/schema.ts` and `src/types/` for canonical shapes used across the app.

Pattern: route loader + component

1. Route exports a loader that fetches and zod-parses data.
2. Component reads loader data with `route.useLoaderData()` for SSR/initial load.
3. For interactive parts (filters, paginated lists), use React Query to fetch/refresh with meaningful cache keys.

## Maps & markers

- Leaflet + react-leaflet is used for map rendering; clustering via `leaflet.markercluster` and `react-leaflet-cluster` improves performance for many markers.
- Map views use compact marker DTOs (latitude, longitude, a few metadata fields) to keep payloads small.

## Charts & tables

- Charts use Recharts and live under `src/components/charts/`.
- Tables use TanStack Table + virtualization; see `src/components/table/columns.tsx` for column setup and rendering patterns.

## Testing, linting & typechecking

- Run unit tests: `bun run test` (Vitest + Testing Library). Unit tests live under `src/lib/__tests__` and `src/utils/__tests__`.
- Lint and format with Biome: `bun run lint` and `bun run format`.
- Run combined checks: `bun run check` (Biome checks + TypeScript typecheck).

## Adding shadcn components

This repo includes `components.json` and follows shadcn patterns. Use the shadcn CLI to add UI components:

```bash
bunx shadcn@latest add button card input dialog
```

## Development tips & conventions

- Use named exports for components and utilities.
- File order within a component: main component → subcomponents → hooks/helpers → static content → types.
- Always validate external responses with Zod in loaders or fetch helpers.
- Minimize useEffect; prefer derived state or server-driven logic.
- Use the `@/` alias for internal imports (configured in `tsconfig.json` + Vite plugin).

## Deployment

- Build: `bun run build`.
- Preview production build locally: `bun run serve`.
- `bun run start` is reserved for scenarios where a server entry exists under `.output` (SSR/adapter outputs). Adjust to your host.

## Troubleshooting

- Dev server doesn't start: ensure dependencies installed (`npm install` or `bun install`) and Node/Bun versions match.
- Type errors after edits: run `bun run check` and fix the reported TypeScript/Biome issues.
- Map markers missing: ensure Leaflet CSS is loaded (see `index.html` or `src/styles.css`). Check the browser console for errors.

## Contributing

- Open issues and PRs are welcome. Keep diffs small and focused.
- Run checks before opening a PR: `bun run check && bun run lint && bun run test`.

## Where to look in the codebase

- `src/routes/index.tsx` — landing page and loader examples.
- `src/routes/map.tsx` — map route and filters.
- `src/routes/restaurant.$camis.tsx` — restaurant detail route.
- `src/components/restaurant/restaurant-card.tsx` — restaurant card used across list/map views.
- `src/components/map/restaurant-map.tsx` — map component (Leaflet + clustering).

## License

Licensed under the [MIT license](https://github.com/jccdev45/cleanplate/blob/main/LICENSE.md).
