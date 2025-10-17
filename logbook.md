# Thought Process Overview

## Initial Setup

- Pinned Node version through `.nvmrc` (based on `package.json`) and added `.editorconfig` so the IDE respects project
  formatting.
- Installed/configured Jest and Supertest (`jest.config.ts`) to cover both API and use cases; first spec verified the
  healthcheck endpoint.
- Logged the testing framework decision in an ADR.

## TDD & Use Cases

- Each feature started with a failing acceptance test, exposing in-memory repository gaps that were fixed via extra unit
  specs.
- Used WebStorm’s HTTP client to exercise endpoints without browser overhead.
- Delivered the initial Genially use cases with in-memory persistence before moving to MongoDB.

## Tooling & CI

- Added pipelines for lint, test, build (noted that a real project would also include security checks and image builds).
- Testing strategy: acceptance for behavior, unit tests for use cases with doubles, narrow integration tests when
  storage boundaries mattered.

## Mongo & Clean Architecture

- Adopted migrate-mongo (documented by ADR), added local-only migration scripts for future maintainability.
- Added OpenAPI definitions to support API-first workflows.
- Introduced a Makefile to keep the developer experience smooth, especially after the migration tooling.
- Replaced manual configuration wiring with an Awilix container, dropping multi-database complexity while keeping
  dependencies explicit.

## Temporal Abstractions

- Elevated time handling to a domain `Clock` contract so entities depend on an explicit collaborator instead of
  `Date.now`.
- Implemented `SystemClock` in infrastructure; the DI container wires a single instance into factories and repositories
  to keep all layers time-consistent.
- Let `MongoGeniallyRepository` reuse the injected clock when rehydrating documents, ensuring loaded `Genially` objects
  keep deterministic timestamp behavior for later mutations.
- Centralized test doubles in `tests/shared/clock` (fixed/dynamic mocks) to drive scenarios like rename/delete with
  predictable timestamps while still asserting time-based side effects.

## Finishing Touches & Reflection

- Applied small type cleanups and polish after the core features were done.
- Recognized the exercise is CRUD-centric; nonetheless kept the focus on behavior-first testing and domain isolation.

### Testing Strategy Highlights

- Acceptance tests act as black-box checks of system behavior.
- Use case services are unit-tested with doubled dependencies; persistence boundaries covered by narrow integration
  tests.
- For side effects under team control, favour subcutaneous tests; for external systems, use contract tests (e.g., PACT).
- Mutation testing helped identify weak or redundant specs when behavior coverage looked thin.

### More on my thinking about this topic here:

- https://emmanuelvalverderamos.substack.com/p/what-makes-a-great-automated-test
- https://emmanuelvalverderamos.substack.com/p/what-to-test-the-subject-under-test
- https://emmanuelvalverderamos.substack.com/p/how-to-write-a-test
- https://emmanuelvalverderamos.substack.com/p/unlock-the-secrets-of-software-testing
- https://emmanuelvalverderamos.substack.com/p/deep-dive-into-the-relationship-between
- https://emmanuelvalverderamos.substack.com/p/test-doubles
- https://emmanuelvalverderamos.substack.com/p/unit-testing-basics
- https://emmanuelvalverderamos.substack.com/p/integration-testing-basics
- https://emmanuelvalverderamos.substack.com/p/exploring-testing-strategies-past
- https://emmanuelvalverderamos.substack.com/p/test-driven-development-the-basics
- https://emmanuelvalverderamos.substack.com/p/mockist-tdd-just-enough-design
- https://emmanuelvalverderamos.substack.com/p/in-depth-view-to-peers-internals
- https://emmanuelvalverderamos.substack.com/p/discovering-peers-with-goos-techniques
- https://emmanuelvalverderamos.substack.com/p/outside-in-technics-pivote-and-drill
- https://emmanuelvalverderamos.substack.com/p/test-driven-development-styles-classicist
- https://emmanuelvalverderamos.substack.com/p/happy-path-vs-sad-paths-personal
