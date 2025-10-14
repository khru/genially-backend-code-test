# Repository Guidelines

## Project Layout

- Inspect `src/api` for the Express entry point, controllers, and routing glue; add new HTTP code beside its peer
  module.
- Respect Clean Architecture boundaries inside `src/contexts/core/genially/{application,domain,infrastructure}`; keep
  orchestration in application, pure business rules in domain, and IO concerns in infrastructure.
- Place specs under `tests/{api,genially}/{unit,integration,acceptance}`; share helpers through `tests/shared`.
- Treat `dist/` and `coverage/` as disposable build outputs. Keep migration scripts inside `mongo-migrations`.

## Core Commands

- Run `make onboarding` once to install dependencies, copy env templates, and set up hooks.
- Bring the stack up with `make docker-up`; stop it via `make docker-stop` when you are done.
- For live work, run `npm run dev`. For production artefacts, run `npm run build`.
- After every change, execute in order: `npm run format`, `npm run lint`, `npm test`. If any step fails, stop, fix, and
  rerun all three before continuing.
- Use `npm run test:coverage` or `npm run test:mutant` only when you need coverage or mutation feedback before merging.

## Style Rules

- Write TypeScript that satisfies `tsc --noEmit` and linting defaults in `eslint.config.mjs`; the pipeline enforces
  both.
- Let Prettier control spacing (two spaces, single quotes). Never commit manual formatting.
- Use `camelCase` for variables/functions, `PascalCase` for types/classes, `kebab-case` for filenames under `api` and
  `contexts`.
- Prefer the `@src/*`, `@contexts/*`, and related path aliases over relative paths.

## Testing Practice

- Lead with black-box acceptance tests for new behaviour, back them with narrow integration tests against Mongo when
  storage is involved, and close with focused unit tests around use cases or domain logic.
- Mirror the runtime module name in the spec file (e.g., `RenameGeniallyController.test.ts` for the controller) and keep
  fixtures minimal, resetting shared state in `beforeEach` hooks.
- Default to in-memory repositories; switch to the Mongo implementation only when verifying persistence boundaries.

### Testing Principles

- Keep specs fast, deterministic, and isolated; use the Arrange → Act → Assert structure to maximise readability.
- Assert observable behaviour, not internal structure, so refactors do not break tests.
- Make tests easy to write and maintain: descriptive names, focused assertions, compact fixtures, and shared helpers
  only
  when they remove duplication.
- Prefer a single failure reason per test unless the scenario intentionally covers a wider flow (e.g., acceptance).

## TDD Rhythm

- Start every change by writing a failing test that explains the desired behaviour; do not add production code until it
  fails for the expected reason.
- Make the test pass with the smallest production change possible, keeping modifications inside the correct Clean
  Architecture layer.
- Refactor production and test code together, looking for better names, extracted patterns, or design improvements.
  Decide the next red test before exiting the refactor step.

## Workflow Expectations

- Work in small, reversible steps. After each step run format, lint, and tests as stated above.
- If tooling modifies files (Prettier, ESLint), stage those edits together with the feature change.
- Write Conventional Commit messages (`feat:`, `fix:`, `test:`, etc.) in imperative mood and under 72 characters.
- Open pull requests with a short summary, validation checklist, and any required environment or migration notes.

## Design Guidance

- Let tests shape API and module boundaries; never add production code without a failing test first.
- Keep classes and functions small, cohesive, and single-responsibility; favor composition over inheritance to control
  coupling.
- Apply SOLID, DRY, KISS, and YAGNI; depend on abstractions (ports/adapters) to preserve Clean Architecture seams.
- Refactor continuously: extract or inline logic, rename for clarity, introduce parameter objects, remove dead code, and
  make side effects explicit.
- Maximize testability with pure functions where possible, explicit seams, and minimal global state.
- Call out risks early: likely bugs, security pitfalls (injection, secrets, unsafe defaults), and performance hot spots
  (N+1 queries, heavy allocations).
- Prefer focused, incremental diffs over sweeping rewrites, so changes are straightforward to review and revert.

## Config & Safety

- Copy `.env.example` to `.env` before running the API (`cp .env.example .env`). Do not commit secrets.
- Verify local setup via `make show-env` and the Makefile Mongo health pings before debugging connection issues. Keep
  Docker credentials out of logs.
