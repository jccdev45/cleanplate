# Base Coding Standards (concise)

This file contains general conventions referenced by `.github/copilot-instructions.md`.

- Use descriptive, intention-revealing names for variables, functions, and components.
- Prefer functional React components and named exports.
- Keep files focused on a single responsibility; co-locate small tests/types/styles.
- Follow TypeScript strict mode; prefer `unknown` over `any`.
- Use Tailwind for styling and Radix/shadcn for accessible primitives when available.
- Use TanStack Query for server state and TanStack Router for routing; colocate loaders with routes.
- Run formatting and linting via `npm run format` and `npm run lint`.
- Use conventional commits and keep messages short (<50 chars) in imperative mood.
