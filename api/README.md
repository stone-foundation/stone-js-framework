# The public API surface, checked in

One file per published package, holding every name that package exports from its entry point, sorted, with its kind. Generated from the built declarations, which is the artifact a consumer installs rather than whatever `src` happens to contain.

## Why it is committed

Forty-eight of the fifty-one published packages re-export a `utils`, `declarations` or `constants` module wholesale: 678 `export *` lines against one explicit `export {}`. So the public API is not a decision. A helper added to `utils.ts` on a Tuesday is public API on Friday's release, and after the API freeze it is frozen public API for the life of the major, without anyone having chosen it or reviewed it.

Checking the surface in changes that. Adding a public export becomes a visible line in a pull request, reviewed like any other change, and removing one becomes impossible to do by accident.

## Working with it

```sh
pnpm run build:ci      # the reports come from dist
pnpm run api:report    # regenerate
pnpm run api:check     # fail when the build no longer matches what is committed
```

`api:check` runs in CI after the build, and inside `pnpm run verify`.

When a pull request legitimately changes the surface, run `pnpm run api:report` and commit the result alongside the change. A removal is breaking: it needs a changeset that says so.

## What it does not track

Signatures. The accident this guards against is a name becoming public without a decision, and the kind is enough to catch a value quietly becoming a type. Tracking signature drift needs a full API extractor and a configuration per package; it can be added later without changing what is written here.
