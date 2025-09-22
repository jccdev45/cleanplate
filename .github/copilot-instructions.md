-----
# ts react instructions

---
applyTo: "**/*.ts,**/*.tsx"
---
# TypeScript + React Coding Standards

Apply the [General Coding Standards](./base-instructions.md) to all code.

## Composition

- Prefer **functional components**; avoid class components.
- Structure each file:
  1. Exported main component
  2. Subcomponents
  3. Hooks/helpers
  4. Static content
  5. Types
- Use **named exports** over default exports.

## Syntax & Patterns

- Use `function` keyword for pure utility functions.
- Use **arrow functions** for callbacks and handlers.
- Keep JSX concise and declarative; avoid deeply nested conditionals.
- Always use semantic HTML in JSX, only use div if no semantic alternative exists.
- Use ternaries or `&&` for conditional rendering.
- Minimize `useEffect` (ideally none at all) — prefer derived state or server-driven logic.
- Use React 18 concurrent features (`useTransition`, `useDeferredValue`) when appropriate.

## TypeScript Practices

---
# Copilot / AI Agent guide — cleanplate (concise)

ApplyTo: **

This file contains quick, repository-specific guidance for AI coding agents working on the cleanplate app (a Vite + React + TanStack starter).

Keep responses concise. Prefer small, well-scoped edits and run local checks (build/lint/tests) after changes.

Key scripts (from `package.json`)
- dev: `vite dev --port 3000` (fast local dev)
- build: `vite build`
- serve: `vite preview`
- test: `vitest run`
- lint: `biome lint`
- format: `biome format`
- check: `biome check`

Important files & folders
- `src/routes/` — file-based TanStack Router routes. Use `/src/routeTree.gen.ts` and `router.tsx` for router wiring.
- `src/integrations/tanstack-query/` — QueryClient provider (`getContext`, `Provider`) used throughout app.
- `src/components/restaurant-map.tsx` — example of Leaflet + cluster rendering; shows how `restaurants` DTOs are used.
- `src/lib/` & `src/utils/` — shared helpers and constants.
- `src/schema/schema.ts` and `src/types/` — canonical shapes for data models.

Project conventions (explicit)
- Path alias: `@/*` → `./src/*` (tsconfig + vite plugin). Prefer imports like `import { X } from '@/components/x'`.
- Use named exports for components and utilities.
- Prefer functional components and small hooks. File order: main component, subcomponents, hooks/helpers, static content, types.
- Use TanStack Query for server state. Router uses `routerWithQueryClient` — many routes include loaders and expect `queryClient` context.

Data & routing patterns
- Routes: add files under `src/routes/`; route tree is generated into `routeTree.gen.ts`.
- Data fetching: either use route `loader` for SSR-style loading or TanStack Query inside components. Look at `src/routes/*.tsx` for examples.
- Map data: `Restaurant` objects include `latitude`, `longitude`, and `inspections` arrays — avoid sending full inspection objects to map views; use compact marker DTOs.

Build & test workflow
- For local dev: run `bun run dev` (fast local dev). The repo supports `bun` and the CI runs with Bun; prefer `bun` locally when available for parity (e.g., `bun install`, `bun run dev`), otherwise use `npm`/`pnpm`.
- Run lint/format/check via `bun run lint` (or `npm run lint`), `bun run format`, `bun run check`.
- Run unit tests with `bun run test` (or `npm run test`).

CI (github actions)
- The repository CI workflow is at `.github/workflows/ci.yml`.
- CI summary: GitHub Actions sets up Bun, runs `bun install`, runs lint (Biome), runs Biome CI checks, runs TypeScript typecheck (`tsc --noEmit`), and runs Vitest tests with `bun run test`.
- Recommendation: mirror CI locally using Bun to surface the same lint/typecheck/test tooling (use `bun install` then `bun run lint && bunx tsc --noEmit && bun run test`).

What AI agents should do first when editing code
1. Open related files (component + tests + types). 2. Make minimal code changes. 3. Run `npm run check` and `npm run test`. 4. If modifying UI, run `npm run dev` and visually verify behaviour.

Concrete examples to reference in edits
- Router wiring: `src/router.tsx` (uses `routerWithQueryClient` and `TanstackQuery.Provider`).
- Query provider: `src/integrations/tanstack-query/root-provider.tsx` (search for `getContext` / `Provider`).
- Map rendering: `src/components/restaurant-map.tsx` (Leaflet + MarkerClusterGroup usage).

Do NOT assume
- The project uses Bun as the only package manager. README mentions `bun` but scripts in `package.json` are standard npm scripts — respect the contributor's environment.

When in doubt
- Run the project's checks: `npm run check && npm run lint && npm run test` and report failures.
- Prefer small, reversible changes and add tests for new behavior.

If anything here is unclear or missing, tell me which area to expand (routing, data shapes, scripts, or map data flow) and I will iterate.

## TypeScript Practices

- Always type parameters and return values explicitly.
- Prefer `type` for unions, `interface` for extensible object shapes.
- Use `unknown` instead of `any`.
- Use `satisfies` to enforce constraints without widening.
- Enable and respect strict mode in `tsconfig.json`.

## State Management

- Prefer `useState` or `useReducer` for local state.
- Use **Context** sparingly (auth, theme, i18n).
- Use **TanStack Query** for server state (fetching, caching, retries).
- Avoid heavy global state unless project complexity requires it.

## Data Fetching

- Use TanStack Query for async calls.
- Validate API responses with Zod (or similar).
- Always implement loading and error states.
- Cancel/abort fetches on unmount.

## Error Handling

- Use React Error Boundaries for UI-level recovery.
- Show clear user-facing errors (don’t leak raw messages).
- Send unexpected errors to monitoring tools (e.g., Sentry).

## Accessibility

- Use semantic HTML in JSX.
- Include `aria-*` attributes for enhanced accessibility.
- Manage focus correctly for modals, dialogs, and async states.
- Provide visible focus indicators and ensure color contrast.

## Styling

- Favor utility-first CSS (Tailwind).
- Use Radix UI/shadcn/ui for accessible primitives.
- Co-locate minimal styles with components.
- Prefer responsive, mobile-first styles.

## Performance

- Use memoization (`useMemo`, `useCallback`, `React.memo`) only when necessary.
- Split bundles with `React.lazy` or Next.js dynamic imports.
- Profile with React DevTools before optimizing.

## Testing

- Use `bun test` if project uses Bun as package manager. If not, use **React Testing Library** + Jest/Vitest.
- Test:
  - Rendering states (default, loading, error)
  - User interactions
  - Accessibility roles/labels
- Use Playwright/Cypress for end-to-end critical flows.

