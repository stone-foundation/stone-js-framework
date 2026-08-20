---
"@stone-js/cli": patch
---

refactor(cli)!: build targets are registered, not hard-coded

The CLI knew its two targets by name. Six commands asked `isReactApp()` and then instantiated
`ReactBuilder` or `ServerBuilder` themselves, which meant a module could not own its own build:
adding a target required changing the CLI.

A target is now a declaration under `stone.builder.builders.<name>`:

```ts
{
  target: 'acme',
  priority: 20,
  match: (blueprint, event) => true,     // detection only
  resolver: (context) => new AcmeBuilder(context),
  devMode: 'self-hosted',
  previewEntry: (blueprint) => 'dist/acme.mjs'
}
```

The commands resolve whichever target answers and drive it. Every step (`build`, `dev`,
`preview`, `console`, `export`, `watchFiles`) is optional, and a command says which step a
target does not support instead of failing on an undefined call.

**`react` and `server` are registered through that same key.** If the first-party targets kept a
private path, the public one would not be worth much, and both are destined to move out: React
into `@stone-js/use-react`, the backend build into whichever package owns service builds. When
they do, nothing here is replaced, only removed.

Two things the commands used to know about targets became things a target declares, so
`stone serve` and `stone preview` no longer branch on a name:

- `devMode`: `supervised` (the CLI watches, rebuilds and restarts) or `self-hosted` (the
  builder's own dev server reloads itself, and the CLI follows its exit code). Vite and Expo are
  self-hosted; a backend build is not.
- `previewEntry`: where `stone preview` starts the built application from.

**Behaviour is unchanged for existing projects.** Precedence is the one the CLI already used:
`--target` wins, then `stone.builder.target`, then detection, with the backend target answering
last. Two things are more forgiving than before: an empty target (an empty positional from
yargs, an empty string in a config) now means "nothing was named" instead of naming a target
that cannot exist, and `--target` accepts any registered name rather than a closed list of two,
with an unknown one rejected by an error that lists the real ones.

`BuilderConfig.target` widens from `'react' | 'service'` to `string` for the same reason: a
closed union could not name a target the CLI does not ship.
