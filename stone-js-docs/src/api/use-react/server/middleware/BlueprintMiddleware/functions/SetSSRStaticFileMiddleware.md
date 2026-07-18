# Function: SetSSRStaticFileMiddleware()

```ts
function SetSSRStaticFileMiddleware(context, next): Promise<IBlueprint>;
```

Blueprint middleware to set StaticFileMiddleware for SSR adapter.

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
SetSSRStaticFileMiddleware(context, next)
```
