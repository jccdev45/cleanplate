
-----
# base instructions

---
applyTo: "**"
---
# General Coding Standards

- Begin every response with 🚀

## Naming Conventions

- Use descriptive, intention-revealing names for variables, functions, and components.
- Use auxiliary verbs for booleans (e.g., `isActive`, `hasError`, `shouldRender`).
- Use **PascalCase** for components/classes, **camelCase** for variables/functions, and **UPPER_CASE** for constants.
- Use lowercase with dashes for directories and file names (e.g., `user-profile/`, `button-group.tsx`).

## Composition & Structure

- Keep files modular and focused on a single responsibility.
- Co-locate related tests, styles, and types with their components.
- Prefer named exports over default exports (exceptions: config files, Next.js `page.tsx`).

## Syntax & Patterns

- Prefer pure, declarative code over imperative.
- Minimize side effects and global mutable state.
- Use descriptive comments for intent, not to restate code.

## Error Handling

- Fail fast where possible.
- Provide meaningful, user-friendly error messages.
- Log unexpected errors for observability.

## Accessibility (a11y)

- Always use semantic markup (HTML or equivalent in other ecosystems).
- Ensure keyboard navigation works across UI.
- Favor accessible defaults; add ARIA attributes when necessary.

## Styling

- Use established design systems and component libraries where possible.
- Favor consistent, atomic/utility-first approaches (e.g., TailwindCSS).
- Avoid large, custom global CSS.

## Testing

- Write tests for critical paths, edge cases, and failure modes.
- Prefer behavior-driven tests over implementation details.
- Include accessibility checks in tests when possible.

## Code Cleanliness & Maintainability

- Eliminate duplication; keep functions and components small.
- Refactor early when intent becomes unclear.
- Remove dead code, unused imports, and outdated comments regularly.
- Follow team-wide linting/formatting rules.

## Version Control & Commit Messages

- Use **conventional commits** with gitmojis:
  - `feat: ✨ new feature`
  - `fix: 🐛 bug fix`
  - `docs: 📝 documentation`
  - `style: 💄 UI/formatting`
  - `refactor: ♻️ refactor`
  - `perf: ⚡️ performance`
  - `test: ✅ testing`
  - `chore: 🔧 tooling`
  - `revert: ⏪ revert`
- Keep commit messages concise (<50 chars), in imperative mood.
- Flag breaking changes with `💥 BREAKING CHANGE:` in body/footer.


-----
# bun tanstack instructions

---
applyTo: "**"
---
# Project Standards – Bun + SQLite + TanStack

Apply the [base coding guidelines](./base-instructions.md) to all code.

## Server (Bun)

- Use Bun’s native WebSocket API (`Bun.serve`) instead of 3rd-party libraries.
- Keep all server routes defined in TanStack Router for consistency.
- Organize WebSocket event handlers in `/ws/handlers`.

## Database (SQLite)

- Use Bun’s built-in SQLite driver.
- Queries must go through repository modules (`/db/repositories`) — no inline SQL in components.
- Prefer prepared statements to avoid SQL injection.

## TanStack Libraries

- Use TanStack Query for all client data fetching and caching.
- Use TanStack Form for form state + validation.
- Use TanStack Router for routing; colocate loaders and actions with routes.
- Use TanStack Virtual for lists/grids rendering large datasets.
- Use TanStack Pacer for rate-limiting async operations.

## Testing

- Mock WebSockets in integration tests.
- Use a test SQLite database seeded via migrations.
- Test TanStack Router navigation flows with React Testing Library.


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
- Minimize `useEffect` — prefer derived state or server-driven logic.
- Use React 18 concurrent features (`useTransition`, `useDeferredValue`) when appropriate.

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
- Set element spacing in a parent element, do not ever include things like `<div className="mt-4" />`.
- Ensure code readability/maintainability with styling.

## Performance

- Use memoization (`useMemo`, `useCallback`, `React.memo`) only when necessary.
- Split bundles with `React.lazy` or Next.js dynamic imports.
- Profile with React DevTools before optimizing.

## Testing

- Use **React Testing Library** + Jest/Vitest.
- Test:
  - Rendering states (default, loading, error)
  - User interactions
  - Accessibility roles/labels
- Use Playwright/Cypress for end-to-end critical flows.


-----
# base instructions

---
applyTo: "**"
---
# General Coding Standards

## Naming Conventions

- Use descriptive, intention-revealing names for variables, functions, and components.
- Use auxiliary verbs for booleans (e.g., `isActive`, `hasError`, `shouldRender`).
- Use **PascalCase** for components/classes, **camelCase** for variables/functions, and **UPPER_CASE** for constants.
- Use lowercase with dashes for directories and file names (e.g., `user-profile/`, `button-group.tsx`).

## Composition & Structure

- Keep files modular and focused on a single responsibility.
- Co-locate related tests, styles, and types with their components.
- Prefer named exports over default exports (exceptions: config files, Next.js `page.tsx`).

## Syntax & Patterns

- Prefer pure, declarative code over imperative.
- Minimize side effects and global mutable state.
- Use descriptive comments for intent, not to restate code.

## Error Handling

- Fail fast where possible.
- Provide meaningful, user-friendly error messages.
- Log unexpected errors for observability.

## Accessibility (a11y)

- Always use semantic markup (HTML or equivalent in other ecosystems).
- Ensure keyboard navigation works across UI.
- Favor accessible defaults; add ARIA attributes when necessary.

## Styling

- Use established design systems and component libraries where possible.
- Favor consistent, atomic/utility-first approaches (e.g., TailwindCSS).
- Avoid large, custom global CSS.

## Testing

- Write tests for critical paths, edge cases, and failure modes.
- Prefer behavior-driven tests over implementation details.
- Include accessibility checks in tests when possible.

## Code Cleanliness & Maintainability

- Eliminate duplication; keep functions and components small.
- Refactor early when intent becomes unclear.
- Remove dead code, unused imports, and outdated comments regularly.
- Follow team-wide linting/formatting rules.

## Version Control & Commit Messages

- Use **conventional commits** with gitmojis:
  - `feat: ✨ new feature`
  - `fix: 🐛 bug fix`
  - `docs: 📝 documentation`
  - `style: 💄 UI/formatting`
  - `refactor: ♻️ refactor`
  - `perf: ⚡️ performance`
  - `test: ✅ testing`
  - `chore: 🔧 tooling`
  - `revert: ⏪ revert`
- Keep commit messages concise (<50 chars), in imperative mood.
- Flag breaking changes with `💥 BREAKING CHANGE:` in body/footer.


-----
# bun tanstack instructions

---
applyTo: "**"
---
# Project Standards – Bun + SQLite + TanStack

Apply the [base coding guidelines](./base-instructions.md) to all code.

## Server (Bun)

- Use Bun’s native WebSocket API (`Bun.serve`) instead of 3rd-party libraries.
- Keep all server routes defined in TanStack Router for consistency.
- Organize WebSocket event handlers in `/ws/handlers`.

## Database (SQLite)

- Use Bun’s built-in SQLite driver.
- Queries must go through repository modules (`/db/repositories`) — no inline SQL in components.
- Prefer prepared statements to avoid SQL injection.

## TanStack Libraries

- Use TanStack Query for all client data fetching and caching.
- Use TanStack Form for form state + validation.
- Use TanStack Router for routing; colocate loaders and actions with routes.
- Use TanStack Virtual for lists/grids rendering large datasets.
- Use TanStack Pacer for rate-limiting async operations.

## Testing

- Mock WebSockets in integration tests.
- Use a test SQLite database seeded via migrations.
- Test TanStack Router navigation flows with React Testing Library.


-----
# ts react instructions

---
applyTo: "**/*.ts,**/*.tsx"
---
# TypeScript + React Coding Standards

Apply the [base coding guidelines](./base-instructions.md) to all code.

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
- Use ternaries or `&&` for conditional rendering.
- Minimize `useEffect` — prefer derived state or server-driven logic.
- Use React 18 concurrent features (`useTransition`, `useDeferredValue`) when appropriate.

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

- Use **React Testing Library** + Jest/Vitest.
- Test:
  - Rendering states (default, loading, error)
  - User interactions
  - Accessibility roles/labels
- Use Playwright/Cypress for end-to-end critical flows.

