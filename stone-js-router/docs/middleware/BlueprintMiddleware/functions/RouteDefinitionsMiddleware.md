# Function: RouteDefinitionsMiddleware()

```ts
function RouteDefinitionsMiddleware<IncomingEventType, OutgoingResponseType>(context, next): Promise<IBlueprint>;
```

Middleware to process and register route definitions from modules.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../../declarations/interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, [`EventHandlerClass`](../../../declarations/type-aliases/EventHandlerClass.md)\<`IncomingEventType`, `OutgoingResponseType`\>\>

The configuration context containing modules and blueprint.

### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, [`EventHandlerClass`](../../../declarations/type-aliases/EventHandlerClass.md)\<`IncomingEventType`, `OutgoingResponseType`\>\>, `IBlueprint`\>

The next pipeline function to continue processing.

## Returns

`Promise`\<`IBlueprint`\>

The updated blueprint or a promise resolving to it.

## Example

```typescript
RouteDefinitionsMiddleware(context, next)
```
