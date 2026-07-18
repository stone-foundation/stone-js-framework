# Function: SetNodeHttpDefaultAdapterMiddleware()

```ts
function SetNodeHttpDefaultAdapterMiddleware(context, next): Promise<IBlueprint>;
```

Middleware to dynamically set node http adapter as the default adapter.

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The configuration context containing modules and blueprint.

### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next pipeline function to continue processing.

## Returns

`Promise`\<`IBlueprint`\>

The updated blueprint or a promise resolving to it.

## Example

```typescript
SetNodeHttpDefaultAdapterMiddleware(context, next)
```
