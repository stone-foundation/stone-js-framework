# Function: SetConsoleRouterEventHandlerMiddleware()

```ts
function SetConsoleRouterEventHandlerMiddleware(context, next): Promise<IBlueprint>;
```

Blueprint middleware to set the ConsoleRouter as the main event handler for the application.

The SetConsoleRouterEventHandlerMiddleware takes precedence over all other event handlers middleware when in console mode.

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
SetConsoleRouterEventHandlerMiddleware({ modules, blueprint }, next);
```
