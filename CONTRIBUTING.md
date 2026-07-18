# Contributing to Stone.js

Thanks for your interest in improving Stone.js! This is a **monorepo** — every `@stone-js/*`
package lives here and is released together. Read [MONOREPO.md](./MONOREPO.md) for the full
tooling guide; this file is the short contributor checklist.

## Prerequisites

- **Node.js** ≥ 20.11.0
- **pnpm** (the repo pins its version via `packageManager`; run `corepack enable` once).

## Setup

```bash
git clone https://github.com/stone-foundation/stone-js-framework.git
cd stone-js-framework
pnpm install          # installs everything and links internal packages
pnpm build            # first full build (cached afterwards by turbo)
```

## Development loop

```bash
pnpm --filter @stone-js/<pkg> test        # test one package
pnpm --filter @stone-js/<pkg> test:cvg    # with coverage (threshold: 100%)
pnpm --filter @stone-js/<pkg> lint:fix    # auto-fix lint
pnpm build                                # build all (turbo, incremental)
```

## Standards (non-negotiable)

- **ESM only** (`"type": "module"`), `"sideEffects": false`.
- **TypeScript strict**, lint **ts-standard** (no semicolons, 2-space indent, space before `(`).
- **Tests with Vitest**, behavioural (not mock-only), **100% coverage** enforced.
- **Internal deps** (`@stone-js/*`) declared as **`workspace:*`**.
- **Decorators**: TC39 stage-3 (`Symbol.metadata`) — never `reflect-metadata` / `experimentalDecorators`.
- **Factories**: private/protected constructors + `static create()`.
- Keep the **core platform-agnostic** — no HTTP/CLI/browser vocabulary leaks into `@stone-js/core`.

## Commits & branches

- **Conventional Commits** (`feat:`, `fix:`, `chore:`…) — enforced by commitlint.
- Work on a feature branch, open a PR against `main`. Never push to `main` directly.
- Each bug fix must come with a **behavioural** regression test.

## Changesets (required for anything user-facing)

If your change affects a published package, record it:

```bash
pnpm changeset
```

Pick the impacted packages, the bump type, and write a clear summary. Commit the generated
`.changeset/*.md` file **with your code**. Releases are lockstep (`fixed`): all `@stone-js/*`
packages move to the same version together.

## Security

Please report vulnerabilities privately — see [SECURITY.md](./SECURITY.md). Do not open public
issues for security problems.
