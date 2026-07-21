---
"@stone-js/core": patch
"@stone-js/create": patch
---

Gate-0 beta hardening.

- **core**: keep the kernel platform-agnostic. A bare handler return is wrapped as `content` and the platform's `responseResolver` assigns the default status (HTTP defaults to 200, a CLI adapter to its own exit code), instead of the kernel hardcoding `statusCode: 200`.
- **create**: depend on the workspace `@stone-js/cli` (was pinned to an old `^0.1.2`) so `npm create @stone-js` scaffolds against the current framework; brought into the workspace and the lockstep release group.
