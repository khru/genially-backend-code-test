# Repository Guidelines

## Non-Negotiable Workflow

1. **Red** – before touching production code, add or modify a test so it fails for the new behaviour. Never reuse an
   existing green test or tweak production code to manufacture a failure.
2. **Green** – implement the smallest production change needed to satisfy the new failing test. Keep the change within
   the proper Clean Architecture layer.
3. **Refactor** – with all tests green, improve names, extract helpers, and remove duplication. When testing, follow
   the behaviour-first principles below.
4. **Keep tests green** – do not continue working while the suite is red. Fix the failure or revert the change (use
   `git checkout --` for local edits or `git revert` for committed work) before moving on.
5. **Undo uncovered changes** – if you realise you edited production code without a failing test, roll back the edit
   (or stash it), add the test, and then re-apply the change.

## Test Discipline

- **Always run unit tests** (`npx jest tests/**/unit --runInBand`) and TypeScript (`npx tsc --noEmit`) after each
  change. Acceptance and integration suites that need Docker/Testcontainers must be run locally before opening a PR –
  note in your summary if the sandbox cannot execute them.
- Tests must be fast, deterministic, and focused on observable behaviour (status code, JSON payload, domain state).
  Avoid asserting implementation details, private fields, or line counts.
- Structure specs in Arrange → Act → Assert order. Use minimal fixtures and shared helpers only when they remove obvious
  duplication.
- One reason to fail per test unless the scenario intentionally covers a full flow (e.g., acceptance tests).

## Project Layout & Architecture

- API entry points, controllers, and routing glue live in `src/api`. Clean Architecture boundaries under
  `src/contexts/core/genially/{application,domain,infrastructure}` must stay intact: orchestration in application,
  business rules in domain, IO concerns in infrastructure.
- Specs belong in `tests/{api,genially}/{unit,integration,acceptance}`. Share helpers via `tests/shared` sparingly.
- Avoid structural duplication: if behaviour is already covered by acceptance tests, new unit tests must add value, not
  reassert the same structure.

## Coding Standards

- TypeScript must satisfy `tsc --noEmit` and `eslint`. Let Prettier format files; do not hand-tune spacing.
- Naming: `camelCase` for variables/functions, `PascalCase` for classes/types, `kebab-case` for files under `api` and
  `contexts`.
- Prefer the configured path aliases (`@api/*`, `@application/*`, `@domain/*`, etc.) over deep relative imports.

## Clean Code Guidance

- Drive APIs from tests: controllers adapt HTTP to/from application services; repositories expose pure persistence
  operations; domain objects encapsulate behaviour without IO.
- Keep functions and classes small and cohesive. Favour composition over inheritance. Apply SOLID, DRY, KISS, and
  YAGNI.
- Be explicit about side effects, avoid hidden mutations, and remove dead code promptly.
- Call out risks early: missing validation, security pitfalls (injection, leaked secrets), performance issues (N+1,
  excessive allocations).
- Prefer focused, incremental diffs that are easy to review and revert.

## Tooling & Safety

- Run `make onboarding` once to install dependencies and set up hooks. Use `make docker-up`/`make docker-stop` to manage
  the local stack. `npm run dev` for development, `npm run build` for production artefacts.
- Always execute, in order, `npm run format`, `npm run lint`, and the relevant Jest suites after making changes. If any
  step fails, fix it and rerun from the top.
- Copy `.env.example` to `.env` before running the API. Do not commit secrets.
- When using the CodeRabbit target, ensure the configuration file exists or let the command fall back to defaults as
  configured in the Makefile.
