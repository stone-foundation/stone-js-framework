# Contributing to Stone.js

Thanks for your interest in improving Stone.js! This is a **monorepo**: every `@stone-js/*`
package lives here and is released together. Read [MONOREPO.md](./MONOREPO.md) for the full
tooling guide; this file is the short contributor checklist.

## Where to start

- **New here?** Pick a [`good first issue`](https://github.com/stone-foundation/stone-js-framework/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22): each one comes with context, file pointers, and acceptance criteria.
- **Wondering where the project is going?** See the [roadmap](./ROADMAP.md).
- **Questions?** Ask in [Discussions Q&A](https://github.com/stone-foundation/stone-js-framework/discussions) or on [Discord](https://discord.gg/3g93ppqMGH). **API ideas?** Open a thread in Ideas / RFC before writing code: it saves everyone time.
- **Building something with Stone.js?** Tell us in Show and tell; real-world feedback is the most valuable contribution during the beta.

## Prerequisites

- **Node.js** >= 20.11.0
- **pnpm** (the repo pins its version via `packageManager`; run `corepack enable` once).

## Setup

```bash
git clone https://github.com/stone-foundation/stone-js-framework.git
cd stone-js-framework
pnpm install          # installs everything and links internal packages
pnpm build            # first full build (cached afterwards)
```

## Development loop

```bash
pnpm --filter @stone-js/<pkg> test        # test one package
pnpm --filter @stone-js/<pkg> test:cvg    # with coverage
pnpm --filter @stone-js/<pkg> lint:fix    # auto-fix lint
pnpm build                                # build all (incremental)
```

## Standards (non-negotiable)

- **ESM only** (`"type": "module"`), `"sideEffects": false`.
- **TypeScript strict**, lint **ts-standard** (no semicolons, 2-space indent, space before `(`).
- **Tests with Vitest**, behavioural (not mock-only). The CI gate is 90% coverage, but most packages sit at ~100%: aim for full coverage of what you touch.
- **Internal deps** (`@stone-js/*`) declared as **`workspace:*`**.
- **Decorators**: TC39 stage-3 (`Symbol.metadata`), never `reflect-metadata` / `experimentalDecorators`.
- **Both paradigms at parity**: anything expressible with a decorator must have an imperative `define*` counterpart, and vice versa.
- **Factories**: private/protected constructors + `static create()`.
- Keep the **core platform-agnostic**: no HTTP/CLI/browser vocabulary leaks into `@stone-js/core`.

## Commits & branches

- **Conventional Commits** (`feat:`, `fix:`, `chore:`...), enforced by commitlint.
- Work on a feature branch, open a PR against `main`. Never push to `main` directly.
- Each bug fix must come with a **behavioural** regression test.

## Changesets (required for anything user-facing)

If your change affects a published package, record it:

```bash
pnpm changeset
```

Pick the impacted packages and write a clear summary. Commit the generated
`.changeset/*.md` file **with your code**. Releases are lockstep (`fixed`): all `@stone-js/*`
packages move to the same version together.

> **During the 0.x beta, always pick `patch` as the bump type**, including for new features.
> Minor and major bumps are coordinated by the maintainer (they are tied to the API-freeze
> milestones on the roadmap). If you are unsure, ask in the PR: it takes one comment to fix.

## Security

Please report vulnerabilities privately, see [SECURITY.md](./SECURITY.md). Do not open public
issues for security problems.
