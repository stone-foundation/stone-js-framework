---
"@stone-js/core": patch
---

feat(core): order configurations with `priority`

A real application has several configurations (static settings, a remote overlay, one per vendable module) and some depend on values another one loads. Nothing ordered them, so two configurations writing the same key had an undefined winner, and a configuration reading a remotely-loaded value could not guarantee it ran after the loader. Consumers merged unrelated concerns into one class to force the order by hand.

`@Configuration({ priority })` and `defineConfig(fn, { priority })` now order them, ascending, with named steps: `ConfigurationPriority.Sources` (0), `.App` (10, the default) and `.Module` (20). Equal priorities keep their declaration order, so a configuration that declares nothing behaves exactly as before.

Configurations also run **after** the module scan rather than interleaved with it, which is what makes explicit configuration reliably win over the implicit configuration of decorators, whatever order modules were discovered in.
