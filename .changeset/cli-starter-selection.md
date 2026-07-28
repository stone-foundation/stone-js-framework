---
"@stone-js/cli": patch
---

fix(cli): scaffold an exact starter with `--starter <id>`

Every published starter command was broken: `--starters` takes provider *links*, so passing a starter id (`--starters basic-react-declarative`) asked npm for a package that does not exist and failed with a 404.

- New `--starter <id>` flag: scaffolds that starter and skips the starter question. `--starters <links>` keeps its meaning (packages that declare starters).
- The questionnaire answers are now merged into the blueprint instead of replacing it, so `--starters` links are no longer erased mid-run. Combining a link with an id (`--starters @stone-js/blog-starters --starter realtime-chat`) previously scaffolded an unrelated starter without warning.
- An explicitly requested starter that matches nothing now fails and lists the available ids, instead of silently scaffolding the first one available.
- A link that cannot be installed explains that `--starters` expects a package or git link, and points to `--starter` when the value looks like an id.
- `stone init` no longer swallows failures: it exits non-zero, so scripts and CI can detect a broken scaffold.
- The banner now shows the framework version on every command (it fell back to an empty slot, since nothing sets `stone.builder.version` and `init` has no project to read one from).
