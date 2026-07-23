---
"@stone-js/cli": patch
---

Improve the `stone init` create-app experience.

- Signature everywhere: the « Le Portail » banner (logo + wordmark + version) now prints on every
  command, not just `build`/`serve`, via a single lifecycle hook (the duplicated per-command
  banners are gone, so it shows exactly once).
- Starters from the collection: `stone init` lists the individual starters declared in the fetched
  package's `stone.starters` manifest (title, description, tags), instead of treating the whole
  repository as one template. The default source is now the lightweight `@stone-js/starters` npm
  package (published alongside the framework and version-locked to it), so `stone init` no longer
  clones the whole monorepo. The selector stays fully agnostic: `--starters` still accepts any
  local path, npm package or git/github link.
- Fix module integration: selected Stone modules were installed by the package manager and then
  silently dropped, because the finalize step rewrote the pre-install copy of `package.json`. The
  freshly-installed manifest is now re-read, so the chosen modules land correctly in the new app.
- A wider module picker: the full adapter range (Node HTTP/CLI/WS, AWS, Azure, GCP, Tencent,
  Alibaba, edge, fetch, browser) plus React and the view engine.
