# Function: Any()

```ts
function Any(path, options?): MethodDecorator;
```

A method decorator for defining a route that responds to any HTTP method.

## Parameters

### path

The route path for the endpoint.

`string` | `string`[]

### options?

[`AnyOptions`](../interfaces/AnyOptions.md)

Optional configuration for the route.

## Returns

`MethodDecorator`

A method decorator configured for all HTTP methods.

## Example

```typescript
@Any('/resource')
handleAnyMethod() {
  return 'Handled any HTTP method';
}
```
