# Function: SetUseReactHooksMiddleware()

```ts
function SetUseReactHooksMiddleware(context, next): Promiseable<IBlueprint>;
```

Blueprint middleware to dynamically set lifecycle hooks for react.

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The configuration context containing modules and blueprint.

### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next pipeline function to continue processing.

## Returns

`Promiseable`\<`IBlueprint`\>

The updated blueprint or a promise resolving to it.

## Example

```typescript
SetUseReactHooksMiddleware(context, next)
```
