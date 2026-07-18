# Function: Put()

```ts
function Put(path, options?): MethodDecorator;
```

A method decorator for defining HTTP PUT routes.

## Parameters

### path

`string` \| `string`[]

The route path for the PUT endpoint.

### options?

[`PutOptions`](../interfaces/PutOptions.md)

Optional configuration for the route.

## Returns

`MethodDecorator`

A method decorator configured for a PUT route.

## Example

```typescript
@Put('/update')
updateResource() {
  return 'Resource updated';
}
```
