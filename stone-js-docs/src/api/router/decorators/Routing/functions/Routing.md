# Function: Routing()

```ts
function Routing<T>(options): ClassDecorator;
```

A class decorator for configuring routing behavior.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### options

[`RoutingOptions`](../interfaces/RoutingOptions.md) = `{}`

Configuration options for the router.

## Returns

`ClassDecorator`

A class decorator configured for routing.

## Example

```typescript
@Routing({ prefix: '/api' })
class Application {}
```
