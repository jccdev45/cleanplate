Goal

Swap or adapt a shadcn-style Sidebar for the existing `ChartSidebar` used in `src/routes/chart/_chart-layout.tsx` so the charts area gets a richer, accessible, collapsible sidebar with grouped navigation and optional icon-only collapsed state.

Constraints & assumptions

- Project uses Vite + React + TanStack Router (no NextJS). We'll adapt client-only features accordingly.
- The project already uses shadcn UI primitives in `src/components/ui/*` (assume `Button`, `Sidebar`-like primitives may not exist). If the project doesn't have `ui/sidebar`, we'll implement a slim wrapper component in `src/components/ui/sidebar.tsx` reusing shadcn patterns.
- Keep changes minimal: prefer replacing `ChartSidebar` implementation rather than rewiring routing.

Proposed approach (high-level)

1. Pick the shadcn `sidebar` / `dashboard-01` patterns as the source of truth (features: collapse-to-icons, groups, menu buttons, optional triggers).
2. Implement a thin `src/components/ui/sidebar.tsx` that exports a small subset used by charts: Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarRail, SidebarProvider, useSidebar, SidebarTrigger. Keep API intentionally small and idiomatic to this codebase.
3. Replace `src/components/charts/chart-sidebar.tsx` with an adapted version that uses the new UI primitives and integrates with TanStack Router `Link` for navigation (it already uses Link, so preserve that). Keep current icons and semantics; add grouping and optional `SidebarHeader` content (e.g., title, search) if desired.
4. Add unit test(s) where practical for the `ChartSidebar` rendering and active link highlighting.
5. Run lint/typecheck/tests.

Concrete file changes (small, reversible)

- Add: `src/components/ui/sidebar.tsx` (thin port of shadcn's exports used by our ChartSidebar)
- Update: `src/components/charts/chart-sidebar.tsx` — refactor to use the new primitives and support collapsible state persisted in localStorage or context.
- Add tests: `src/components/charts/__tests__/chart-sidebar.test.tsx` (basic render + active link presence)

Migration steps (exact commands)

- Open a terminal
- npm/yarn/bun install (if adding new packages; none planned)
- Run unit tests: `npm run test` (or `bun run test`)

Edge cases and notes

- If `src/components/ui/*` already contains a `sidebar` implementation, prefer reusing it instead. I searched for `SidebarProvider` and didn't find an existing file, so we'll add a small one.
- Accessibility: shadcn components use aria attributes and hidden text; mirror the same patterns.
- SSR: these components use `useEffect` and client-only state (that's fine in this Vite SPA).

Follow-ups

- Add animation and transition polish
- Add persisted collapsed state via cookie/localStorage
- Add keyboard shortcut (Ctrl/Cmd+B) to toggle (from shadcn) — optional

If you want, I can implement the `src/components/ui/sidebar.tsx` shim and update `ChartSidebar` now. Tell me whether to proceed implementing the code or if you'd prefer a different subset of features (collapse-only, grouped nav, or simple static list).