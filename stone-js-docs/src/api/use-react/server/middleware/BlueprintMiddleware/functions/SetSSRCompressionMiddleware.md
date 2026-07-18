# Function: SetSSRCompressionMiddleware()

```ts
function SetSSRCompressionMiddleware(context, next): Promise<IBlueprint>;
```

Blueprint middleware to set CompressionMiddleware for SSR adapter.

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
SetSSRCompressionMiddleware(context, next)
```
