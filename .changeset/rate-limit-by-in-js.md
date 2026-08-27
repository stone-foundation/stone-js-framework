---
"@stone-js/rate-limit": patch
---

fix: a rule that names no subject says so out loud

`by` is required, and the type says so. It says so to TypeScript only, and Stone.js is JavaScript as much as TypeScript: a vanilla application would have kept the silent default this module exists to argue against, which is the very failure the requirement removes.

A rule arriving without a `by` is now enforced on the caller's address, as before, and logs what it is doing and how to say it on purpose:

> Rate limit rule declares no `by`, so it is counted on the caller address. Name the subject it should belong to, or write `by: 'address'` to say you meant it.

Nothing is waved through, nothing throws, and the one decision this module cares about is visible in a log rather than absent from a type nobody checked.
