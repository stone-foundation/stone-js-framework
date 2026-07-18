# Function: SetCliCommandsMiddleware()

```ts
function SetCliCommandsMiddleware(context, next): Promise<IBlueprint>;
```

Middleware to set cli commands for Node CLI adapters.

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The configuration context containing modules and blueprint.

### next

`NextPipe`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next pipeline function to continue processing.

## Returns

`Promise`\<`IBlueprint`\>

The updated blueprint or a promise resolving to it.

## Example

```typescript
SetCliCommandsMiddleware(context, next)
```
