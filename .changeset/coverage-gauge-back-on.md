---
"@stone-js/resources": patch
"@stone-js/authz": patch
---

test: the coverage gauge runs again on the two packages that chain a type check

`npm run test -- --coverage` appends the flag to the end of a compound script, so on the two packages whose `test` also runs `tsc -p tsconfig.types.json` the flag landed on the type check instead of on vitest, and the coverage gauge silently stopped running. Found by auditing the CI log for the `Coverage enabled` line per package rather than trusting the green exit code. `test:cvg` now states `--coverage` explicitly.
