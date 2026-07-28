# What

<!-- What does this PR change? Link the issue it closes: "Closes #123".
     The "Closes #" line is what ties this PR to the issue, closes it on merge,
     and moves it on the roadmap board: please always add it when an issue exists. -->

# Why

<!-- The problem or motivation behind the change. -->

# Conventions (CI enforces these, save yourself a red cross)

- [ ] Branch is named `<type>/<short-slug>`, e.g. `docs/fix-api-count`, `fix/router-redos` (types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `style`, `revert`)
- [ ] PR title is a Conventional Commit (`feat: ...`, `fix: ...`, `docs: ...`): it becomes the squash commit on `main`
- [ ] The PR has at least one label

# Quality (check what applies, mark the rest N/A)

- [ ] Behavioural tests added or updated. Required for code changes; N/A for docs-only, README-only, or website-content changes
- [ ] `pnpm --filter @stone-js/<pkg> test` and `pnpm --filter @stone-js/<pkg> lint` pass locally (N/A if no package code was touched)
- [ ] Changeset added (`pnpm changeset`, bump `patch` during the 0.x beta). Required for anything published to npm, including package READMEs; N/A for the website, repo-root docs, or CI files
- [ ] Docs updated (README and/or website page) if the public API changed
