#!/usr/bin/env bash
#
# Consolidate the Stone.js modules into the single monorepo git repository.
#
# Strategy (decided): CLEAN START + ARCHIVE.
#   - Each module is currently an independent git repo (its own .git in stone-js-*/).
#   - This script removes those nested .git directories so the folders become plain,
#     then un-ignores them at the root and stages everything into the monorepo repo.
#   - The module histories are NOT preserved locally (clean start). Archive the old
#     repos on GitHub FIRST (Settings -> Archive) to keep the published history.
#
# This is IRREVERSIBLE locally. It runs in --check mode by default.
#
# Usage:
#   bash scripts/consolidate-monorepo.sh --check   # report only (default)
#   bash scripts/consolidate-monorepo.sh --run     # actually consolidate
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:---check}"

modules=$(find . -maxdepth 1 -type d -name 'stone-js-*' | sed 's|^\./||' | sort)

echo "== Stone.js monorepo consolidation ($MODE) =="
echo "Root: $ROOT"
echo

dirty=0
for m in $modules; do
  if [ -d "$m/.git" ]; then
    status="$(git -C "$m" status --porcelain)"
    branch="$(git -C "$m" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
    if [ -n "$status" ]; then
      echo "  ⚠️  $m  (branch: $branch) — UNCOMMITTED changes:"
      git -C "$m" status --short | sed 's/^/        /'
      dirty=1
    else
      echo "  ✓  $m  (branch: $branch) — clean working tree, has nested .git"
    fi
  else
    echo "  •  $m  — no nested .git (already a plain folder)"
  fi
done

echo
if [ "$MODE" = "--check" ]; then
  echo "CHECK ONLY. Nothing changed."
  echo "Before running with --run:"
  echo "  1) Archive the old repos on GitHub (Settings -> Archive) to preserve published history."
  echo "  2) Ensure every module above shows a clean working tree (commit or stash first)."
  echo "Then: bash scripts/consolidate-monorepo.sh --run"
  exit 0
fi

if [ "$MODE" != "--run" ]; then
  echo "Unknown mode: $MODE (use --check or --run)"; exit 2
fi

if [ "$dirty" = "1" ]; then
  echo "ABORT: some modules have uncommitted changes. Commit/stash them first."; exit 1
fi

echo "Proceeding with consolidation (removing nested .git, staging into monorepo)…"
for m in $modules; do
  if [ -d "$m/.git" ]; then
    rm -rf "$m/.git"
    echo "  removed $m/.git"
  fi
done

# Un-ignore the module folders at the root so they become tracked here.
if grep -qE '^stone-js-\*/' .gitignore 2>/dev/null; then
  # Comment out the blanket module-ignore lines.
  sed -i.bak -E 's|^(stone-js/)$|# \1 (consolidated into monorepo)|; s|^(stone-js-\*/)$|# \1 (consolidated into monorepo)|' .gitignore
  rm -f .gitignore.bak
  echo "  updated .gitignore (modules now tracked)"
fi

git add -A
echo
echo "Done. Review with 'git status' then commit:"
echo "  git commit -m 'chore: consolidate modules into monorepo (clean start)'"
