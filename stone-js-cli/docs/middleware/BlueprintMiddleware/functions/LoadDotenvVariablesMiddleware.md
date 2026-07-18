# Function: LoadDotenvVariablesMiddleware()

```ts
function LoadDotenvVariablesMiddleware(context, next): Promise<IBlueprint>;
```

Middleware to load the environment variables from the .env file.
So the environment variables can be accessed using `process.env`.
Only applies server-side.

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
LoadDotenvVariablesMiddleware(context, next)
```
