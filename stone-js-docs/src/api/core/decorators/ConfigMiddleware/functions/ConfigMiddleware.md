# Function: ConfigMiddleware()

```ts
function ConfigMiddleware<T>(options): ClassDecorator;
```

ConfigMiddleware decorator to mark a class as middleware within the Stone.js framework.

This decorator is used to customize classes as middleware, allowing them to be registered and managed
as part of the request/response lifecycle or other layers such as adapter, kernel, or router.

## Type Parameters

### T

`T` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md) = [`ClassType`](../../../declarations/type-aliases/ClassType.md)

## Parameters

### options

[`ConfigMiddlewareOptions`](../interfaces/ConfigMiddlewareOptions.md) = `{}`

The configuration options for the middleware, including platform, priority, singleton registration, alias, layer, and type.

## Returns

`ClassDecorator`

A decorator function to set metadata on the target class.

## Example

```typescript
@ConfigMiddleware({ priority: 1, singleton: true })
class MyMiddleware {
  // ConfigMiddleware class logic here.
}
```
