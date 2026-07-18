# Function: SetRouterEventHandlerMiddleware()

```ts
function SetRouterEventHandlerMiddleware(context, next): Promise<IBlueprint>;
```

Middleware to set the router as the main event handler for the application.

This middleware takes precedence over all other event handlers middleware
expect the console event handler middleware when in console mode.

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The configuration context containing modules and blueprint.

### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next function in the pipeline.

## Returns

`Promise`\<`IBlueprint`\>

The updated blueprint.

## Example

```typescript
SetRouterEventHandlerMiddleware({ modules, blueprint }, next);
```
