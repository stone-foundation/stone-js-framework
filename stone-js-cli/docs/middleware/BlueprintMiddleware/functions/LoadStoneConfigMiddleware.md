# Function: LoadStoneConfigMiddleware()

```ts
function LoadStoneConfigMiddleware(context, next): Promise<IBlueprint>;
```

Middleware to load the Stone configuration from the stone.config.js or stone.config.mjs file.

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
LoadStoneConfigMiddleware(context, next)
```
