# Test Case AI Rule

Purpose
- Generate tests that match existing patterns and pass consistently.
- Always follow ./project-structure.md for directories, file names, and organization.

General rules
- Do not introduce new test frameworks or dependencies.
- Detect and use the existing stack (e.g., Vitest/Jest + React Testing Library, MSW, Playwright/Cypress) by inspecting package.json and current tests. Mirror style and utilities already used.
- Keep tests deterministic, isolated, and fast.

Placement and naming
- Unit/integration: place beside the file under test or in the designated tests folder per ./project-structure.md.
- Filenames: <subject>.test.ts[x] for unit/integration, <feature>.e2e.ts for end-to-end.
- One subject per file; small focused suites.

Test style
- Use Arrange-Act-Assert. Use Given/When/Then phrasing in test titles.
- Prefer specific assertions over snapshots. If snapshots exist, keep them small and stable.
- Prefer accessibility-first queries (getByRole, getByLabelText) over testIds. Use testIds only when necessary.

State, time, and async
- Freeze time when time affects behavior (use fake timers or fixed dates).
- Never rely on arbitrary delays. Use findBy... and waitFor with clear conditions.
- Clean up after each test using the project’s configured cleanup utilities.

Network and I/O
- Never hit real network. Use the project’s MSW handlers/fixtures. Add/extend handlers locally to the suite when needed.
- Read/write to filesystem only in e2e if the project already does so.

Data and fixtures
- Use existing factories/fixtures. If adding, place them where ./project-structure.md prescribes.
- Cover happy path, loading/empty states, validation/errors, and edge cases.

Coverage and focus
- Test public surface, observable behavior, and critical branches.
- Avoid over-mocking; prefer integration tests at component boundaries.
- Keep e2e minimal and business-critical; keep unit/integration broad.

Accessibility and UX
- Assert roles, names, and visibility. Prefer userEvent for interactions.

File skeleton (mirror existing patterns)
- Imports: testing libs, SUT, wrappers/providers from shared test utils.
- Optional describe block for the subject.
- Tests with AAA comments, explicit assertions, and cleanup.

Example skeleton
- Imports at top.
- describe("Subject", () => {
    - it("Given X, When Y, Then Z", async () => {
        - Arrange: render with providers/wrappers already used in the repo.
        - Act: userEvent.click/type or trigger logic.
        - Assert: expect specific DOM state, calls, or outputs.
    - });
- });

Do
- Reuse existing custom render, store/provider wrappers, and helpers.
- Keep tests small, readable, and deterministic.
- Add only the minimal new fixtures/handlers needed.

Don’t
- Don’t change framework, configs, or linter rules.
- Don’t use real timers, network, or random data without seeding.
- Don’t assert implementation details (internal state, private methods).

Review checklist
- Matches ./project-structure.md (location, naming, exports).
- Mirrors existing test style and utilities.
- Deterministic (no real timers/network/randomness).
- Focused assertions (no brittle snapshots).
- Covers happy, error, and edge cases relevant to the subject.
- All resources cleaned up; no global pollution.

If any project conventions differ from the above, inspect existing tests and strictly mirror them. When in doubt, prefer the established patterns already present in the repository. 