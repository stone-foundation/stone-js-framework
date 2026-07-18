# Function: Listener()

```ts
function Listener<T>(options): ClassDecorator;
```

Listener decorator to mark a class as a listener for a specific event.

This decorator is useful for customizing classes that need to listen for specific events within the Stone.js framework.
It allows the class to be recognized and managed by the event-handling system.

## Type Parameters

### T

`T` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md) = [`ClassType`](../../../declarations/type-aliases/ClassType.md)

## Parameters

### options

[`ListenerOptions`](../../../declarations/interfaces/ListenerOptions.md)

The configuration options for the listener, including the event to listen for.

## Returns

`ClassDecorator`

A decorator function to set metadata on the target class.

## Example

```typescript
@Listener({ event: 'UserRegistered' })
class UserRegisteredListener {
  // Listener class logic here.
}
```
