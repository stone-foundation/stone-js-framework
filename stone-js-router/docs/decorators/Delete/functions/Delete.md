# Function: Delete()

```ts
function Delete(path, options?): MethodDecorator;
```

A method decorator for defining HTTP DELETE routes.

## Parameters

### path

`string` \| `string`[]

The route path for the DELETE endpoint.

### options?

[`DeleteOptions`](../interfaces/DeleteOptions.md)

Optional configuration for the route.

## Returns

`MethodDecorator`

A method decorator configured for a DELETE route.

## Example

```typescript
@Delete('/resource/:id')
deleteResource() {
  return 'Resource deleted';
}
```
