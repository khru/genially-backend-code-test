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

## Finishing Touches & Reflection

- Applied small type cleanups and polish after the core features were done.
- Recognized the exercise is CRUD-centric; nonetheless kept the focus on behavior-first testing and domain isolation.

### Testing Strategy Highlights

- Acceptance tests act as black-box checks of system behavior.
- Use case services are unit-tested with doubled dependencies; persistence boundaries covered by narrow integration
  tests.
- For side effects under team control, favour subcutaneous tests; for external systems, use contract tests (e.g., PACT).
- Mutation testing helped identify weak or redundant specs when behavior coverage looked thin.
