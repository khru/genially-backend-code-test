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

run_api_checks() {
  echo "🧪 API changes detected. Running npm lint-staged and test pre-commit checks..."

  cd "$(repo_root)" || return 1
  echo "$(which nvm)"
  ensure_node

  echo "Run lint 🧹"
  npx lint-staged || return 1

  echo "Run test ✅"
  npm test || return 1

  echo "✅ Code is clean and tests passed! Ready to commit 🚀"
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

main() {
  api_exit_code=0
  echo "✅ Ensure migrations"
  check_migrations || return 1

  run_api_checks || api_exit_code=$?

  if [ "$api_exit_code" -ne 0 ]; then
    exit 1
  fi
  exit 0
}

main "$@"
