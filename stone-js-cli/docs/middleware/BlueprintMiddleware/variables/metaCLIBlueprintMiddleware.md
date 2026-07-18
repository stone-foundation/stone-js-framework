# Variable: metaCLIBlueprintMiddleware

```ts
const metaCLIBlueprintMiddleware: MetaPipe<BlueprintContext<IBlueprint, ClassType>, IBlueprint>[];
```

Configuration for cli processing middleware.

This array defines a list of middleware pipes, each with a `pipe` function and a `priority`.
These pipes are executed in the order of their priority values, with lower values running first.
