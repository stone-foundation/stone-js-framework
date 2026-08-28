---
"@stone-js/notifications": patch
"@stone-js/queue": patch
---

fix: `@NotificationChannel` and `@JobHandler` compile again

Both decorators failed with `TS2693: only refers to a type, but is being used as a value` for **every** TypeScript consumer, while working perfectly in JavaScript. The documentation teaches both, with the exact code.

The cause is one line of the build. Each package's public entry point is a barrel of `export *` lines, and in these two a decorator shared its name with a type declared in another file: `NotificationChannel` was also the channel port, `JobHandler` was also the handler shape. Two star exports offering one name make the export **ambiguous** (`TS2308`), so TypeScript keeps neither, the name leaves the public types, and the JavaScript bundle keeps exporting the function. Green tests, green build, an API nobody could call.

It cannot be repaired from the barrel. Re-exporting both halves explicitly resolves the value and loses the type, and merging them needs both declarations in one file, which a barrel of re-exports is not. So the name is freed at the source, and the decorators keep the name the documentation teaches:

- `@stone-js/notifications`: the channel port is now **`Channel`** (was `NotificationChannel`). `NotificationChannelFactory` is unchanged and returns `Channel`.
- `@stone-js/queue`: the handler shape is now **`JobHandlerType`** (was `JobHandler`). `JobHandlerMeta` and `JobHandlerOptions` are unchanged.

**This renames two exported types.** An application that annotated against them changes the import; one that used the decorators gains a compiler that accepts them. Nothing changes at runtime, in either direction.

Two guards so the class cannot come back. The build now **fails** when two declarations reaching a public entry point share a name, naming both files, because a name that silently leaves the public types is exactly what shipped here; the dual browser/server builds are unaffected, since those trees are already kept off the barrel. And both packages gain a type-level test compiled against their built declarations, using the decorator the way the documentation writes it. Verified against the published 0.8.18 types: the new tests reproduce `TS2693` there, and pass on this build.
