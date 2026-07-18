# Function: MainEventHandlerMiddleware()

```ts
function MainEventHandlerMiddleware(context, next): Promise<IBlueprint>;
```

Middleware to set the main event handler in the blueprint.

This middleware identifies the module marked as the main application and sets it in the
blueprint as the main event handler. If no entry point is found, an error is thrown.

Note: This middleware is executed in a way to set a default event handler
if none is provided by third-party modules.

## Parameters

### context

[`BlueprintContext`](../../../declarations/interfaces/BlueprintContext.md)\<[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md), [`ClassType`](../../../declarations/type-aliases/ClassType.md)\>

The configuration context containing modules and blueprint.

### next

`NextPipe`\<[`BlueprintContext`](../../../declarations/interfaces/BlueprintContext.md)\<[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md), [`ClassType`](../../../declarations/type-aliases/ClassType.md)\>, [`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)\>

The next function in the pipeline.

## Returns

`Promise`\<[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)\>

The updated blueprint.

## Example

```typescript
MainEventHandlerMiddleware({ modules, blueprint }, next);
```
