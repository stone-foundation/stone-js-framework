# Function: Patch()

```ts
function Patch(path, options?): MethodDecorator;
```

A method decorator for defining HTTP PATCH routes.

## Parameters

### path

The route path for the PATCH endpoint.

`string` | `string`[]

### options?

[`PatchOptions`](../interfaces/PatchOptions.md)

Optional configuration for the route.

## Returns

`MethodDecorator`

A method decorator configured for a PATCH route.

## Example

```typescript
@Patch('/update-partial')
updatePartialResource() {
  return 'Resource partially updated';
}
```
