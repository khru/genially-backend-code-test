# MongoDB Migrations

MongoDB schema migrations for the genially interview using [migrate-mongo](https://github.com/seppevs/migrate-mongo).

## 📋 Table of Contents

- [Setup](#setup)
- [Environment Configuration](#environment-configuration)
- [Usage](#usage)
- [Migration Structure](#migration-structure)
- [Development](#development)
- [Project Structure](#project-structure)
- [Best Practices](#best-practices)

## 🚀 Setup

### Prerequisites

- **Node.js 22** (managed via NVM with `.nvmrc`)
- MongoDB instance running
- Access to the target MongoDB database

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy the environment template and configure your local settings:

   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local`** with your MongoDB connection details:

   ```bash
   # Required: MongoDB connection settings
   MONGODB_URL=mongodb://localhost:27017
   MONGODB_DATABASE=genially

   # Optional: Authentication (if needed)
   # MONGODB_USERNAME=genially_user
   # MONGODB_PASSWORD=super_secure_password
   # MONGODB_AUTH_SOURCE=admin
   ```

## ⚙️ Environment Configuration

This project uses **Node.js 22's native `.env` file support** - no external libraries needed! **Always
copy `.env.example` to `.env.local`** for local development.

### Native Node.js 22 .env Support

Node.js 22 includes built-in environment file loading with these features:

- **Native `.env` parsing** - No `dotenv` library required
- **Multiple file support** - Load `.env.local` then `.env` (local overrides global)
- **OS environment precedence** - System environment variables take priority
- **Multiline values** supported when quoted
- **Comments** supported with `#`
- **Optional files** with `--env-file-if-exists`

### Required Variables

| Variable           | Description               | Default                     | Example                               |
| ------------------ | ------------------------- | --------------------------- | ------------------------------------- |
| `MONGODB_URL`      | MongoDB connection string | `mongodb://localhost:27017` | `mongodb://user:pass@localhost:27017` |
| `MONGODB_DATABASE` | Target database name      | `genially`                  | `genially`                            |

### Optional Variables

| Variable              | Description             | Example           |
| --------------------- | ----------------------- | ----------------- |
| `MONGODB_USERNAME`    | MongoDB username        | `mongo_user`      |
| `MONGODB_PASSWORD`    | MongoDB password        | `secure_password` |
| `MONGODB_AUTH_SOURCE` | Authentication database | `admin`           |

### Environment Files Priority

1. **OS environment variables** (highest priority)
2. **`.env.local`** (local development, ignored by git)
3. **`.env`** (fallback, can be committed for defaults)

## 📦 Usage

All commands automatically load environment files using Node.js 22's native support:

### Check Migration Status

```bash
npm --env-file=.env.local run status
```

### Create a New Migration

```bash
npm run create <migration-name>
```

Example:

```bash
npm run create add-user-collection
```

This creates: `migrations/YYYYMMDDHHMMSS-add-user-collection.js`

### Run Migrations (Up)

```bash
npm --env-file=.env.local run migrate
```

### Rollback Last Migration (Down)

```bash
npm --env-file=.env.local run down
```

### Rollback all Migration (Down)

```bash
npm --env-file=.env.local run down:all
```

### Advanced Usage

You can also run commands directly with custom environment files:

```bash
# Use specific env files
node --env-file=.env.production migrate-mongo status

# Multiple files (last wins for duplicates)
node --env-file=.env --env-file=.env.local migrate-mongo up

# With OS environment override
MONGODB_URL=mongodb://prod:27017 npm run migrate
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## 🏗️ Migration Structure

### Migration File Template

```javascript
module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @returns {Promise<void>}
   */
  async up(db) {
    // Forward migration logic
    await db.createCollection('my_collection', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['field1', 'field2'],
          properties: {
            field1: { bsonType: 'string' },
            field2: { bsonType: 'number' },
          },
        },
      },
    });
  },

  /**
   * @param db {import('mongodb').Db}
   * @returns {Promise<void>}
   */
  async down(db) {
    // Rollback migration logic
    await db.dropCollection('my_collection');
  },
};
```

## 🛠️ Development

### Node.js 22 Native Features

This project leverages Node.js 22's built-in capabilities:

- **Native .env support** - No `dotenv` dependency needed
- **Multiple environment files** - Automatic precedence handling
- **Built-in environment parsing** - Supports comments, multiline values
- **Optional file loading** - Won't fail if `.env.local` doesn't exist

### Code Quality Tools

- **ESLint** - Code linting with Node.js/CommonJS rules
- **Prettier** - Code formatting (120 char width, single quotes)
- **EditorConfig** - Consistent editor settings
- **lint-staged** - Pre-commit hooks integration

### Pre-commit Integration

When you modify files in `mongo-migrations/`, the pre-commit hook automatically:

1. Runs ESLint with auto-fix
2. Runs Prettier formatting
3. Validates code quality

### Testing with Sample Data

Sample data is provided in `test-data/sample-data-genially.json`:

```bash
# Import sample data manually
mongoimport --db genially --collection promon-interface --file test-data/sample-data-genially.json --jsonArray
```

## 📋 Best Practices

### Migration Guidelines

1. **Always test migrations** on a copy of production data
2. **Write both up and down** migration methods
3. **Use descriptive migration names** (e.g., `add-user-indexes`, `update-schema-validation`)
4. **Include proper schema validation** for new collections
5. **Document complex operations** with comments

### Schema Design

1. **Use UUID for unique identifiers** stored as binary subtype 4
2. **Apply strict validation** with `validationLevel: 'strict'`
3. **Set validation action to error** to prevent invalid documents
4. **Include field descriptions** in schema definitions
5. **Use appropriate BSON types** for better performance

### Environment Management

1. **Never commit `.env.local` or `.env`** files with secrets
2. **Always copy from `.env.example`** for new setups
3. **Update `.env.example`** when adding new variables
4. **Use environment-specific databases** (dev/staging/prod)
5. **Leverage Node.js 22's native .env support** - no libraries needed

### Node.js 22 Environment Best Practices

1. **Use `--env-file-if-exists`** for optional environment files
2. **Rely on OS environment precedence** for production overrides
3. **Take advantage of multiple file loading** (.env.local > .env)
4. **Use native `process.env`** - no wrapper functions needed
5. **Leverage built-in multiline and comment support**

### Code Quality

1. **Follow CommonJS module system** (this project uses `require/module.exports`)
2. **Use async/await** for database operations
3. **Handle errors appropriately** in migration scripts
4. **Format code consistently** using Prettier
5. **Lint code regularly** using ESLint

### Locally and manually importing sample data into docker

```bash
docker run --rm -it -v "$PWD":/import --network backend-code-test_default mongo:8.0.12 \
mongoimport \
--uri "mongodb://genially_user:supersecurepassword@genially-db:27017/genially?authSource=admin" \
--collection geniallies \
--file /import/test-data/sample-data-genially.json \
--jsonArray
```
