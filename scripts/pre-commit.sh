#!/bin/sh
set -e

load_nvm() {
  if command -v nvm >/dev/null 2>&1; then
    return 0
  fi
  # Try common install locations
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
    return 0
  fi
  return 1
}

ensure_node() {
  # Load nvm if available, and use .nvmrc if present
  if load_nvm; then
    if [ -f ".nvmrc" ]; then
      nvm install >/dev/null
      nvm use >/dev/null
    fi
  fi

  if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not available. Install Node or set up NVM." >&2
    exit 1
  fi
}

repo_root() {
    git rev-parse --show-toplevel 2>/dev/null || pwd
}

has_migration_changes() {
  git diff --cached --name-only | grep -q '^mongo-migrations/' >/dev/null 2>&1
}

has_api_changes() {
  git diff --cached --name-only | grep -qv '^mongo-migrations/' >/dev/null 2>&1
}

run_api_checks() {
  echo "🧪 API changes detected. Running npm lint-stage and test pre-commit checks..."

  cd "$(repo_root)" || return 1
  echo "$(which nvm)"
  ensure_node

  echo "Run lint 🧹"
  npx lint-staged || return 1

  echo "Run test ✅"
  npm test || return 1

  echo "✅ Code is clean y tests passed! Ready to commit 🚀"
}

check_migrations() {
  # shellcheck disable=SC2317
  for file in migrations/*.js; do
    [ -f "$file" ] || continue
    if ! node -e "const m=require('./$file');if(typeof m.up!=='function'||typeof m.down!=='function'){throw new Error('$file you must have up() and down()')}"; then
      echo "❌ $file"
      return 1
    fi
    echo "✅ $file"
  done
}

run_mongo_migrations_changes() {
  echo "🧪 Mongo migration changes detected. Running mongo migration checks..."

  cd "$(repo_root)/mongo-migrations" || return 1
  ensure_node

  echo "Checking migrations have up() and down()"
  check_migrations || return 1

  echo "Run lint 🧹"
  npx lint-staged || return 1

  echo "✅ Code is clean and tests passed! Ready to commit 🚀"
}

main() {
  api_exit_code=0
  migrations_exit_code=0


  if has_api_changes; then
    run_api_checks || api_exit_code=$?
  fi

  if has_migration_changes; then
      run_mongo_migrations_changes || migrations_exit_code=$?
  fi

  if [ "$api_exit_code" -ne 0 ] || [ "$migrations_exit_code" -ne 0 ]; then
    exit 1
  fi
  exit 0
}

main "$@"
