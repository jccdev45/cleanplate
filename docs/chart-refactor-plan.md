# Recent changes

- Extracted `groupRestaurants` into `src/utils/restaurant-grouping.ts` and updated server code to import it.
- Added `src/lib/socrata.ts` with `buildSocrataParams` / `buildSocrataUrl` to centralize Socrata URL construction.
- Wired server fetchers (`getRestaurantsFn`, `getCuisineTrendsFn`) to use `buildSocrataUrl`.
- Added unit tests:
  - `src/utils/__tests__/restaurant-grouping.test.ts`
  - `src/utils/__tests__/getCuisineTrendsFn.test.ts`
 - Added `src/components/chart-sidebar.tsx` and wired it into the pathless chart layout (`src/routes/chart/_layout.tsx`). The sidebar contains links to the chart overview and per-chart child routes.

# Chart Route Refactor Plan

Goal: refactor `/chart` into a dashboard with a left sidebar navigation and focused child routes for each chart type (e.g., cuisine, trends, borough, grade, critical, score). Make the summary stats compact to save vertical space and implement focused data-fetching per chart.

Summary of current `src/routes/chart.tsx`:

- Single route `/chart` that preloads `restaurantQueries.list({ $limit: 10000 })` in the loader.
- Component computes many derived datasets client-side from `data.restaurants` (cuisine counts, borough counts, grade counts, critical flag counts, scores array, cuisine trends by extracting year from the top inspection `inspection_date` on each restaurant).
- UI is top-heavy: large title + three wide Card components occupying a lot of vertical space. Charts are arranged inside Tabs.
- Problem noted: Cuisine trends only show 2025 in current data (likely because the code uses `r.inspections[0]` which is the latest inspection and many restaurants may have only 2025 as latest; historical inspections exist on `r.inspections` beyond index 0). This means trends calculation is incomplete.

Design decisions and trade-offs

1) Routing model
- Option A: Child routes for each chart under `src/routes/chart/` (e.g., `src/routes/chart/cuisine.tsx`, `chart/trends.tsx`...), with a parent layout `src/routes/chart/_layout.tsx` that renders the sidebar and shared summary header. Pros: explicit files, easy to add route-specific loaders and code-splitting, works cleanly with TanStack Router file-based setup. Cons: more files to manage.
- Option B: Single dynamic child route (e.g., `src/routes/chart/$chart.tsx`) that loads the chart type from params and renders the correct chart. Pros: fewer files, easier to add new chart types quickly. Cons: harder to give specific loaders per chart and less type-safety.

Recommendation: Use Option A (explicit child route files). Rationale: each chart will likely need its own focused data-fetching and UI. File-based child routes are clear, easier to maintain, and allow per-route loaders that can fetch reduced payloads. We'll add a `index.tsx` that redirects or shows an overview.

2) Sidebar and layout
- Use shadcn `dashboard-01` and `sidebar-01` patterns for a responsive left sidebar that can collapse to icons or be inset. Provide a `SidebarProvider` wrapper in the chart layout. Put the summary stats in a compact horizontal row in the header with small numbers and labels rather than large cards.
  - STATUS: Implemented — `ChartSidebar` component added and `src/routes/chart/_layout.tsx` uses it as a pathless layout wrapping the overview and child routes via `Outlet`.
- Keep the page title but reduce size to `text-2xl` and put a short subtitle. Move the three stats into a small horizontal stats strip with micro-cards or inline stat components (value + label + small change badge) to save vertical space.

3) Data fetching
- Instead of preloading the entire restaurant list in parent loader, move to per-chart loaders or focused queries:
  - `chart/cuisine` loader: fetch cuisine counts (grouped count) and top cuisines (limit 12)
  - `chart/trends` loader: fetch inspections aggregated by year and cuisine for top cuisines
  - `chart/borough` loader: fetch counts by borough
  - `chart/grade` loader: fetch latest grade distribution
  - `chart/score` loader: fetch score histogram
  - `chart/critical` loader: fetch critical flag distribution
- Implementation approach: add new query functions in `src/utils/restaurant.ts` or `src/lib/fetch-utils.ts` to support aggregated endpoints, or expand `restaurantQueries` with smaller queries. If the API/backend doesn't provide aggregate endpoints, implement client-side aggregation but fetch only inspections (not entire restaurants payload) where needed (e.g., `?fields=inspections,cuisine_description,boro` and paginate as needed).

4) Fixing the Trends chart
- The current bug is due to only reading `inspections[0]` (latest). To show historical trends, we must aggregate across all inspections on each restaurant.
- Update aggregation to iterate r.inspections and extract the year from each inspection_date. Build counts per cuisine per year (and optionally allow filtering to top N cuisines).
- If client-side: ensure the loader returns inspections for all restaurants (could be heavy). Prefer a backend aggregated endpoint if available.

5) UX for summary stats
- Replace large Cards with a compact StatsStrip component (small cards, horizontally aligned, responsive to stack vertically on small screens). Each stat shows a numeric value, a short label, and optionally a small percent change or sparkline.
- Keep the full Card visuals on the dashboard details (e.g., inside each chart's Card) when the user drills in.

6) Implementation plan (phased)
- Phase 1 (safe): Create `src/routes/chart/_layout.tsx` and `src/routes/chart/index.tsx` (overview). Move the existing `Route` loader logic into `index` temporarily. Implement a compact `StatsStrip` UI and swap it in for the three large Cards. Don't change data fetching yet.
- Phase 2: Create per-chart route files `cuisine.tsx`, `trends.tsx`, `borough.tsx`, `grade.tsx`, `critical.tsx`, `score.tsx`. Add per-route loaders that call new focused queries (expand `restaurantQueries` or add new functions). Update `routeTree.gen.ts` if necessary (the file-based router should pick up new files automatically).
  - NOTE: Phase 2 has been started and the `trends` route has been scaffolded in this iteration. See Phase 2 status below.
  - NOTE: Phase 2 has been started and the following child routes have been scaffolded in this iteration: `cuisine.tsx`, `trends.tsx`, `borough.tsx`, `grade.tsx`, `critical.tsx`, `score.tsx`.
- Phase 3: Fix trends aggregation by updating the code to iterate all `r.inspections` and compute year buckets. Add tests to `src/lib/__tests__` for aggregation logic.
  - NOTE: Aggregation logic for trends was implemented in `src/utils/aggregate-inspections.ts` and used by the `trends` route. Add unit tests in a follow-up task.
- Phase 4: Optional polish: client-side caching with TanStack Query per chart, charts lazy-loaded with dynamic imports.

7) Edge cases & performance
- Large data: current loader fetches up to $limit=10000 restaurants — heavy. Prefer server-side aggregation endpoints to avoid large payloads. If not available, add query params to fetch limited fields. Use streaming/pagination or background precompute if needed.
- Missing inspection dates or malformed dates: robustly handle missing or malformed `inspection_date` values.
- Time zones and year extraction: use a safe year extraction (e.g., Date parsing or regex fallback) and coerce to yyyy.

8) Tests and quality gates
- Add unit tests for aggregation helpers (happy path + missing inspections + multiple-year inspections).
- Run `npm run check && npm run lint && npm run test` after each phase.

Files I'll add/modify (proposal)

- src/routes/chart/_layout.tsx (new): parent layout with sidebar and stats strip
- src/routes/chart/index.tsx (new): overview route (initial content from current chart.tsx, trimmed)
- src/routes/chart/cuisine.tsx (new): cuisine bar chart route
- src/routes/chart/trends.tsx (new): trends area chart route
- src/routes/chart/borough.tsx (new)
- src/routes/chart/grade.tsx (new)
- src/routes/chart/critical.tsx (new)
- src/routes/chart/score.tsx (new)
- src/utils/restaurant.ts (update): add aggregate query helpers
- src/components/stats-strip.tsx (new): compact stat strip component
- docs/chart-refactor-plan.md (this file)

Next steps

- Confirm approach (Option A: explicit child routes). If you agree, I'll scaffold the parent layout and the `index.tsx` overview (Phase 1). I'll make small, iterative commits and run the project's checks after changes.

Assumptions made

- The app uses TanStack Router file-based routing and will pick up new route files under `src/routes`.
- Backend doesn't currently provide aggregation endpoints; we can implement client-side aggregation if necessary.
- Project scripts in README/package.json are usable locally (I'll run lint/tests after edits).

Phase 1: status update
----------------------

Status: COMPLETED (scaffolded)

What was done in Phase 1
- Created a pathless chart layout and an overview route under `src/routes/chart/`:
  - `src/routes/chart/_layout.tsx` — pathless layout that renders a dedicated `ChartSidebar` and an Outlet for child routes (keeps top `NavMenu` reserved for the site header).
  - `src/routes/chart/index.tsx` — overview route (temporary carrier of the previous loader) and the compact overview UI wired into the new layout.
- Added a compact stats strip UI: `src/components/stats-strip.tsx` and wired it into the overview.
- Added a dedicated chart sidebar component: `src/components/chart-sidebar.tsx` to avoid reusing the top-level `NavMenu` as a sidebar.
- Removed the old monolithic `src/routes/chart.tsx` to avoid duplicate route registrations.

Why this matters
- The repo now has a chart-specific layout ready to host explicit child routes for each chart type. This enables per-chart loaders, code-splitting, and clearer UX separation between the site header and the chart navigation.

Small follow-ups introduced by Phase 1
- Some interim TypeScript / lint warnings may still exist until the new child routes and focused loaders are implemented. I didn't run the full `check` in this environment per your request — you said you'll let me know about issues.

Changes to Phase 2 and later
- Phase 2 (scaffold `trends`) is now the next logical step and should include the corrected trends aggregation (iterate all `r.inspections` rather than using `inspections[0]`).
- Because we removed the monolith, each chart route in Phase 2 should include a focused loader that returns aggregated data (or a small payload) rather than relying on the single big `restaurantQueries.list({ $limit: 10000 })` fetch in the parent.

Commit guidance (Phase 1):
- Create a short-lived feature branch, e.g., `feature/chart-refactor` or `chart/refactor`.
- Make a single atomic commit for Phase 1 since these files were scaffolded together and are cohesive:
  - Commit message: `feat(chart): scaffold chart layout, sidebar, and compact stats (phase 1)`
- Optionally, if you prefer finer-grained history, split into two commits:
  1. `feat(chart): add pathless chart layout and ChartSidebar`
  2. `feat(chart): add chart overview and compact StatsStrip; remove old chart.tsx`

Suggested git commands (run locally):
```pwsh
# create branch
git checkout -b feature/chart-refactor

# stage and commit all current changes for Phase 1
git add src/routes/chart src/components/stats-strip.tsx src/components/chart-sidebar.tsx docs/chart-refactor-plan.md
git commit -m "feat(chart): scaffold chart layout, sidebar, and compact stats (phase 1)"

# push and open a PR when ready
git push -u origin feature/chart-refactor
```

If you prefer me to continue immediately with Phase 2 before you commit, I can — but committing Phase 1 now gives a clean rollback point and makes review easier.

End of Phase 1 status

Phase 2: status update
----------------------

Status: COMPLETED (scaffolded - basic)

What was done in Phase 2
- Added an aggregation helper: `src/utils/aggregate-inspections.ts` which exposes `aggregateCuisineTrends(restaurants, topN)` and `safeExtractRestaurants(payload)` to convert loader payloads into restaurant arrays and compute cuisine-year buckets across all inspections (fixes the previous `inspections[0]` bug).
- Added a trends child route: `src/routes/chart/trends.tsx` that prefetches restaurant data (temporarily using `restaurantQueries.list({ $limit: 10000 })` to match prior behavior), computes the aggregated data via the helper, and renders `CuisineTrendsAreaChart` with `data` and `topCuisines`.

Why this matters
- The Trends route now correctly aggregates across every inspection on a restaurant to produce year buckets for trends. This fixes the bug where only the most recent inspection year was considered.

Follow-ups introduced by Phase 2
- The current loader still fetches a large payload (`$limit = 10000`) — this is a temporary pragmatic choice to get the route working. The longer-term plan remains to implement focused aggregate queries or add server-side endpoints to avoid fetching full datasets.
- Add unit tests for `aggregateCuisineTrends` to cover empty inputs, malformed dates, and multiple-year inspections.

Changes to Phase 3 and later
- Phase 3 will now focus on extracting aggregation logic into tested helpers (already started), replacing the large loader fetch with a focused query or a server-side aggregation endpoint, and adding the remaining child routes following the same per-route loader pattern.

End of Phase 2 status

Phase 3: status update
----------------------

Status: IN PROGRESS (tests added; focused chart queries implemented)

What was done in Phase 3 so far
- Added unit tests for the aggregation helper: `src/utils/__tests__/aggregate-inspections.test.ts` (covers multi-year aggregation, malformed dates, and empty input).
- Added focused chart query helpers in `src/utils/restaurant.ts` with distinct query keys so each chart can request only the data it needs:
  - `restaurantQueries.cuisineCounts(opts?)` — uses `markerOnly: true` and a focused $select via server helper (keeps payload small).
  - `restaurantQueries.trendsList(opts?)` — temporary list endpoint for trends aggregation (still uses `$limit`); intended to be replaced with a server-side aggregate later.
  - `restaurantQueries.boroughCounts(opts?)`
  - `restaurantQueries.gradeDistribution(opts?)`
  - `restaurantQueries.criticalFlagDistribution(opts?)`
  - `restaurantQueries.scoreHistogram(opts?)`

Why this matters
- Tests establish a safety net (TDD) for aggregation logic and prevent regressions when we refactor loaders or switch to server-side aggregates.
- Focused query helpers give each chart a stable queryKey and make it straightforward to replace the queryFn with a server-side aggregated endpoint later without changing the component wiring.

Follow-ups for Phase 3
- Replace `trendsList` loader's large `$limit` request with a true aggregated endpoint (server-side or a server function that returns precomputed year buckets) and update the queryFn to call it.
- Add unit tests for any new aggregation server helpers if we add server-side aggregation.
- Scaffold remaining child routes (`cuisine`, `borough`, `grade`, `critical`, `score`) using their focused queries and small aggregation helpers where needed.

End of Phase 3 status (partial)

