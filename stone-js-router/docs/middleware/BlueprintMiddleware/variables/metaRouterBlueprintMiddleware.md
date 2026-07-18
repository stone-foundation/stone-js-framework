# Variable: metaRouterBlueprintMiddleware

```ts
const metaRouterBlueprintMiddleware: MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>[];
```

Configuration for route processing middleware.

This array defines a list of middleware pipes, each with a `pipe` function and a `priority`.
These pipes are executed in the order of their priority values, with lower values running first.

## Example

```typescript
const middlewares = routeConfigMiddleware;
middlewares.forEach(({ pipe, priority }) => {
  // Execute each middleware in order of priority
});
```
