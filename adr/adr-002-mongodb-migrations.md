# Choose a DB migration system for Mongo with Node.js

- **Status:** approved

## Context and Problem Statement

- Project: **Node.js** service with **MongoDB Atlas** in production and **local Mongo in Docker** for development.
- Requirement: **file-based migrations, versioned and decoupled from application code and entities**.
- Secondary priorities: **good Developer Experience**, ability to run in **CI/CD**, clear **rollbacks**, and **no
  parallel execution** per environment.

## Options Considered

1. **mongo-migrations** (CLI and programmatic) file-based JS with `up` and `down`. Stores state in a file by default,
   can store in Mongo via `MongoStore`. Has dry-run and templating options. Uses an older MongoDB Node client
   internally. ([GitHub][1])
2. **migrate-mongo** (CLI and programmatic) file-based JS with `up` and `down`, status tracking in a changelog
   collection, transaction support in newer versions. ([GitHub][2])
3. **ts-migrate-mongoose** (CLI and programmatic) TypeScript-friendly, integrates with **Mongoose** models, stores
   migration state in Mongo. Best when the project already uses Mongoose. ([GitHub][3])

## Detailed Comparison

| Criterion                    | mongo-migrations                                                                               | migrate-mongo                                                        | ts-migrate-mongoose                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| **Type**                     | JS files with `up` and `down`                                                                  | JS files with `up` and `down`                                        | TS or JS migrations using Mongoose               |
| **Where state is stored**    | File `.migrate` by default, can use **MongoStore** or a custom store                           | Changelog collection in Mongo                                        | Stored in Mongo                                  |
| **CLI commands**             | `init`, `create`, `up`, `down`, `list`                                                         | `init`, `create`, `up`, `down`, `status`                             | CLI and programmatic run                         |
| **Dry-run**                  | Built-in dry-run that stubs common DB ops                                                      | Not a dedicated dry-run command                                      | Not emphasized as a feature                      |
| **Transactions**             | Not documented as a feature                                                                    | Supported from v7+ when you open a session and use `withTransaction` | Via Mongoose sessions if you use them            |
| **Templates and generators** | Custom template and generator support, compiler flag (for Babel or TS compilers)               | Simple template via `create`, community examples                     | TS-first, templates and prune/sync helpers       |
| **Coupling**                 | Uncoupled from app, uses MongoDB Node client directly                                          | Uncoupled from app, uses MongoDB Node driver                         | Coupled to Mongoose ODM by design                |
| **Notable risks**            | Repo locks MongoDB client to **3.1.6** inside the tool. This is old compared to modern drivers | Widely used and active, fewer surprises                              | Adds Mongoose dependency if you are not using it |

Sources: mongo-migrations README for commands, config, dry-run, MongoStore, and client version note. migrate-mongo
README and issues for commands, status, and transactions. ts-migrate-mongoose README for features. ([GitHub][1])

## Decision

**Choose `mongo-migrations`** as the migration system for the Node.js application.

### Motivation

- **Simple file-based `up` and `down` scripts**, no framework coupling. ([GitHub][1])
- **Dry-run mode** to preview effects during reviews and pipelines. ([GitHub][1])
- **Flexible state storage**: start with file-based state locally, switch to **MongoStore** in shared
  environments. ([GitHub][1])
- **Custom templates and generators** keep DX high and consistent across teams. ([GitHub][1])

### Guardrails

- Use **MongoStore** in all shared environments to avoid file state drift on CI workers. ([GitHub][1])
- **Pin exact versions** in `package-lock.json`.
- **Single migration runner** per environment. Protect with pipeline mutex or environment lock.
- Enforce **idempotent** operations where possible. Document non-reversible steps clearly.

## Consequences

**Positive**

- Clear, imperative migrations with `up` and `down`.
- Dry-run improves safety in reviews and CI.
- Flexible storage for migration state.

**Negative**

- The library’s internal MongoDB client is **3.1.6**, which can lag behind current server and driver features. We will
  test against our Atlas cluster and upgrade or switch if incompatibilities appear. ([GitHub][1])

## Implementation Plan

1. **Folder layout**

   ```
   db/migrations/
   migrate-config.json
   package.json
   ```

   Initialize:

   ```
   npx mongo-migrations init
   ```

   This creates the default structure and config. ([GitHub][1])

2. **Configuration**
   Example `migrate-config.json` with environment variables and Mongo state:

   ```json
   {
     "mongodb": { "connectionUrl": "${MONGODB_URI}" },
     "migrationsDirectory": "db/migrations",
     "dryRun": false,
     "useMongoStore": true,
     "mongoStore": {
       "connectionUrl": "${MONGODB_URI}",
       "database": "${MONGODB_DB}",
       "collection": "db_migrations",
       "idField": "genially-id"
     }
   }
   ```

   `migrate-config.json` supports reading from environment variables. ([GitHub][1])

3. **Create migrations**

   ```
   npx mongo-migrations create add-index-users-email
   ```

   Each file exports `up` and `down` and receives a connected `mongoClient`. ([GitHub][1])

4. **Local workflow**

- Preview: `npx mongo-migrations up --dry-run`
- Apply: `npx mongo-migrations up`
- Roll back one: `npx mongo-migrations down`
- List: `npx mongo-migrations list` ([GitHub][1])

5. **Programmatic runner** (optional)

   ```js
   // scripts/runMigrations.js
   const migrate = require("mongo-migrations");
   (async () => {
     const set = await migrate.load({ stateStore: ".migrate" });
     await set.up();
     console.log("Migrations applied");
   })().catch((err) => {
     console.error(err);
     process.exit(1);
   });
   ```

   Useful for a dedicated CI job or a maintenance container. ([GitHub][1])

6. **CI/CD**

- Stage: “Apply DB migrations” before deploying the app:

  ```
  npm ci
  npx mongo-migrations list
  npx mongo-migrations up
  ```

- Add a **mutex** or **single-runner** constraint per environment to avoid parallel runs.

7. **Observability**

- Pipe logs from the migration step to your logging backend.
- Alert when migrations are pending after a deploy.

8. **Operational rollback**

- Stop traffic to the app.
- Run `npx mongo-migrations down` the required number of steps.
- Restart the app. Note that certain schema or destructive data changes are not easily reversible.

## Risks and Mitigations

- **R1: Driver compatibility**. `mongo-migrations` uses an older MongoDB Node client (3.1.6).
  **Mitigation**: verify against Atlas versions used in all environments. If we hit driver incompatibilities or missing
  features, pivot to **migrate-mongo** with minimal changes to our scripts. ([GitHub][1])

- **R2: Parallel execution in CI**. Two runners could apply the same migration.
  **Mitigation**: enforce a single runner, use **MongoStore** for central state, and add a pre-check step that exits
  when a migration is in progress. ([GitHub][1])

- **R3: Non-reversible changes**. Many Mongo DDL or data fixes cannot be undone safely.
  **Mitigation**: require explicit `down` where possible, simulate with realistic datasets, and snapshot or back up
  before production runs.

- **R4: Future need for multi-doc transactions**. If we need transactional semantics across collections, **migrate-mongo
  ** supports using MongoDB transactions in newer versions.
  **Mitigation**: reassess if our use cases demand transactions, then switch to **migrate-mongo**. ([GitHub][4])

## Alternatives for the Node.js Stack

1. **migrate-mongo**

- Similar `up` and `down` workflow, strong adoption, clear `status` and changelog collection. Transactions supported
  in newer versions. Good fit if we want to avoid the older driver locked inside mongo-migrations. ([GitHub][2])

2. **ts-migrate-mongoose**

- Best when the service already uses **Mongoose** and TypeScript. Uses models inside migrations, stores state in
  Mongo, runs via CLI or code. If we want ODM-level helpers, this is a good option. If we do not use Mongoose, it adds
  an extra dependency. ([GitHub][3])

### References

[1]: https://github.com/Droplr/mongo-migrations "GitHub - Droplr/mongo-migrations: Asynchronous MongoDB migration framework for Node.js based on node-migrate"
[2]: https://github.com/seppevs/migrate-mongo "A database migration tool for MongoDB in Node"
[3]: https://github.com/ilovepixelart/ts-migrate-mongoose "ilovepixelart/ts-migrate-mongoose"
[4]: https://github.com/seppevs/migrate-mongo/issues/48 "Transactions with migrate-mongo · Issue #48"
