---
"@stone-js/core": patch
---

fix(core): decorator SetupErrors name their likely cause

`SetupError: This decorator can only be applied to class methods` gave no lead, and the toolchain rule behind it was written nowhere. The three decorator guards now state it: Stone.js needs TC39 2023-11 decorators, the usual cause is a transformer emitting the legacy form, `experimentalDecorators` makes esbuild (so Vite and Vitest) do exactly that, and every transformer in the project must emit 2023-11. Each message links the troubleshooting page.

The Troubleshooting page was also **wrong** on this, and is corrected: it told readers not to enable `experimentalDecorators`, which is impossible today. Verified with `tsc`: without the flag a method decorator fails to typecheck (`TS1241`, `TS1270`), because the published signatures are legacy-shaped while the bodies require a 2023-11 context. The page now explains why the flag is a compiler appeasement, ships the Vitest + Babel config that lets a real application boot in tests, records that esbuild 0.25 implements 2023-11 correctly on its own (so the flag is what forces Babel back in), and documents the symbol-key pitfall where `JSON.stringify(Class[Symbol.metadata])` prints `{}` even when everything is correct.
