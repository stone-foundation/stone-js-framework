# Function: EventHandler()

```ts
function EventHandler<T>(path, options?): ClassDecorator;
```

A class decorator for defining an event handler group.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### path

`string` = `'/'`

The base path for the group of routes.

### options?

[`EventHandlerOptions`](../interfaces/EventHandlerOptions.md)

Optional configuration for the route group.

## Returns

`ClassDecorator`

A class decorator configured for a group of routes.

## Example

```typescript
@EventHandler('/users')
class UserHandler {
  // Grouped route handlers
}
```
