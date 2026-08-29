# The public API surface, checked in

One file per published package, holding every name that package exports from its entry point, sorted, with its kind. Generated from the built declarations, which is the artifact a consumer installs rather than whatever `src` happens to contain.

## Why it is committed

Fifty of the fifty-one published packages re-export a `utils`, `declarations` or `constants` module wholesale, across 702 `export *` lines. So the public API is not a decision. A helper added to `utils.ts` on a Tuesday is public API on Friday's release, and after the API freeze it is frozen public API for the life of the major, without anyone having chosen it or reviewed it.

Checking the surface in changes that. Adding a public export becomes a visible line in a pull request, reviewed like any other change, and removing one becomes impossible to do by accident.

## Working with it

```sh
pnpm run build:ci      # the reports come from dist
pnpm run api:report    # regenerate
pnpm run api:check     # fail when the build no longer matches what is committed
```

`api:report` refuses to run when a package's sources are newer than its build, because a report read
from a stale `dist` describes a surface that no longer exists: after a branch switch, a rebase or a
merge it silently **removes names the baseline correctly had**. When `api:check` reports a name as
removed on code you did not touch, the committed baseline is right and your build is old: rebuild
rather than regenerate.

`api:check` runs in CI after the build, and inside `pnpm run verify`.

When a pull request legitimately changes the surface, run `pnpm run api:report` and commit the result alongside the change. A removal is breaking: it needs a changeset that says so.

## What it does not track

Signatures. The accident this guards against is a name becoming public without a decision, and the kind is enough to catch a value quietly becoming a type. Tracking signature drift needs a full API extractor and a configuration per package; it can be added later without changing what is written here.

Members, either: a class gaining or losing a method is not a line here, only the class itself is.

And a name that is legitimately **both** a value and a type (declaration merging in one file) is reported under a single kind, because the checker resolves it to one symbol. That was how `@NotificationChannel` and `@JobHandler` hid: each looked like a plain `interface` in this report while the decorator of the same name had silently left the public types. The build now refuses that shape outright, in `dtsBarrel`, so the report no longer has to catch it.
