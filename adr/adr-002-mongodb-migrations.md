# Info:

- status: approved

# Choose a db migration system for Project Newton Q

## Context and Problem Statement

- Project: **Spring Boot + Kotlin** with **MongoDB Atlas** in production and **local Mongo in Docker** for development.
- Requirement: **file-based migrations, versioned and decoupled from entities**.
- Secondary priority: **good Developer Experience (DevEx)** and execution in CI/CD.

## Options Considered

1. **Liquibase + MongoDB extension** (file-based YAML/JSON/XML, Spring Boot integration)
2. **migrate-mongo (Node.js CLI)** (file-based JS/TS with `up/down`) ← best perceived DevEx
3. **Mongock (code-first with annotations)** (not purely file-based, tightly integrated with Spring)

## Detailed Comparison (Trade-offs)

| Criterion                   | Liquibase + Mongo                        | migrate-mongo (Node CLI)                       | Mongock (code-first)              |
|-----------------------------|------------------------------------------|------------------------------------------------|-----------------------------------|
| **Type**                    | YAML/JSON/XML files                      | JS/TS files with `up/down`                     | Kotlin/Java code with annotations |
| **Entity Decoupling**       | Total                                    | Total                                          | Partial (code-bound)              |
| **History & Versioning**    | `DATABASECHANGELOG` + checksums          | Changelog collection (no checksums by default) | `mongockChangeLog`                |
| **Locking/Concurrency**     | Dedicated lock                           | Simple (avoid parallel runners)                | Handled by library                |
| **Rollback**                | Supported (not always automatic)         | `down` defined by developer                    | Limited/custom, non-transactional |
| **Preconditions**           | Rich (YAML)                              | Manual in JS                                   | Manual in Kotlin                  |
| **Dry-run**                 | `updateSQL`                              | Not natively supported                         |                                   |
| **Transactional Support**   | Limited by Mongo (DDL non-transactional) | Same limitation                                | Same limitation                   |
| **Spring Boot Integration** | Excellent                                | External (CI/CD)                               | Excellent                         |
| **DevEx**                   | Good (YAML, preconditions, tooling)      | **Very high** (simple JS/TS `up/down`)         | Medium (code-bound)               |
| **Learning Curve**          | Medium                                   | Low                                            | Low if familiar with Spring       |
| **License**                 | Apache 2.0                               | MIT                                            | Apache 2.0                        |

## Decision

**We choose Option 2: `migrate-mongo` (Node.js CLI) for file-based migrations**, executed as a **CI/CD step** before the
app starts.

### Motivation

- **Best DevEx** in our context: clear `up/down` files, simple imperative code, not coupled to Spring lifecycle.
- **Strong decoupling** from entities and application lifecycle.
- **Explicit reversibility** (`down`) and fine-grained control per file.
- Identical behavior in **local (Docker)** and **Atlas**, changing only the URI.

### Guardrails

- Separate **`db-migrations` folder** as a standalone module.
- **Lock library version** in `package.json` and use lockfile.
- **No parallel execution**; one migration job per environment.

## Consequences

**Positive**

- Excellent ergonomics for the team; reduced daily friction.
- Independent from Spring Boot deployment cycle.
- Predictable reversibility (`down` per file, within Mongo limitations).

**Negative**

- New **Node** dependency in the pipeline.
- Risk of **parallel runs** if pipeline not designed correctly.

## Implementation Plan

1. **Folder** `mongo-migrations` with structure:
   ```
   migrations/
     2025_09_18_0001_init.js
     2025_09_18_0002_indexes.js
   migrate-mongo-config.js
   package.json / package-lock.json
   ```
2. **Conventions**

- Timestamp + slug in filename.
- One logical operation per file (idempotent when possible).
- Always write `down`. If not reversible, document clearly.

3. **Environments**

- `migrate-mongo-config.js` per environment (dev/qa/prod) with URIs (Docker/Atlas).
- Secrets via environment variables (not in repo).

4. **CI/CD**

- Step: “Apply DB migrations” _before_ deploying the app:
  - `npm ci`
  - `npx migrate-mongo status`
  - `npx migrate-mongo up`
- Ensure **mutual exclusion** (one runner per environment).

5. **Observability**

- Alert if migrations are pending at job completion.
- Record in `migrations` collection (default) and export metrics.

6. **Operational Rollback**

- Procedure: stop app → `npx migrate-mongo down` (one or N) → restart app.
- Note: many Mongo DDL operations **are not transactional**.

## Risks & Mitigations

- **R1: `migrate-mongo` maintenance**: if activity drops or critical bugs emerge.
  **Mitigation:** quarterly audits (releases, issues, PRs). Pin version. Plan B: Liquibase.

- **R2: CI/CD parallelism**: migrations run twice.
  **Mitigation:** one job per environment, locking, state check before applying.

- **R3: Non-reversible migrations**: some DDL/data changes can’t be undone.
  **Mitigation:** simulate in dev with realistic dataset; mark as “non-reversible”; backups/snapshots before prod.

- **R4: Dev/prod divergence**: misconfigured URIs/credentials.
  **Mitigation:** dotenv/secret manager, smoke tests in each environment, pre-checklist.
