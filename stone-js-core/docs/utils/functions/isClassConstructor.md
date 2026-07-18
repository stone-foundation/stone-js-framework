# Function: isClassConstructor()

```ts
function isClassConstructor(value): boolean;
```

Check whether a value is a class constructor, as opposed to an ordinary or factory function.

Uses two complementary signals so it survives down-level bundling:
1. Native/modern classes stringify with the `class` keyword.
2. Classes transpiled to ES5 lose that keyword but still carry their methods on the
   prototype, whereas a plain/factory function's prototype has only `constructor`.

Ambiguous cases remain (a transpiled class with no methods, or a factory that decorates
its prototype) — for those, callers pass an explicit `{ isClass }` / `{ isFactory }` flag,
which is always authoritative over this heuristic.

## Parameters

### value

`unknown`

The value to check.

## Returns

`boolean`

`true` if the value is (very likely) a class constructor, otherwise `false`.
