# Function: SetUseReactEventHandlerMiddleware()

```ts
function SetUseReactEventHandlerMiddleware(context, next): Promise<IBlueprint>;
```

Blueprint middleware to set the UseReact as the main event handler for the application.

Set as fallback event handler if none of the other event handlers are registered.

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
SetUseReactEventHandlerMiddleware({ modules, blueprint }, next);
```
