# Contributing to Cleanplate

Thank you for helping improve Cleanplate! This CONTRIBUTING.md contains a short checklist and guidance for making changes.

Before you open a pull request

- Fork the repository and create a feature branch from `master`.
- Run the full checks locally:

```bash
npm install
npm run check
npm run lint
npm run test
```

- Make small, focused changes and keep commits atomic.
- Update or add unit tests for any new behavior (Vitest + Testing Library).
- If you modify public APIs or data shapes, update `src/schema/` and `src/types/` and include schema tests.

Commit message style

- Use conventional commits in the commit message (e.g., `fix:`, `feat:`, `chore:`).

Pull request checklist

- [ ] I have run the local checks: `npm run check && npm run lint && npm run test`.
- [ ] I added or updated tests for any new behavior.
- [ ] I updated documentation or README where applicable.
- [ ] The PR is focused and does one thing.

If you need help deciding how to structure a change, open an issue first with a short proposal. Maintainers will review and collaborate on design before a full implementation.

Thank you again — contributions are welcome and appreciated!
