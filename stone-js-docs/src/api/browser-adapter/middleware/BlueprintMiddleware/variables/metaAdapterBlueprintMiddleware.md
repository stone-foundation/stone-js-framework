# Variable: metaAdapterBlueprintMiddleware

```ts
const metaAdapterBlueprintMiddleware: MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>[];
```

Configuration for adapter processing middleware.

This array defines a list of middleware pipes, each with a `pipe` function and a `priority`.
These pipes are executed in the order of their priority values, with lower values running first.
