# Function: Post()

```ts
function Post(path, options?): MethodDecorator;
```

A method decorator for defining HTTP POST routes.

## Parameters

### path

The route path for the POST endpoint.

`string` | `string`[]

### options?

[`PostOptions`](../interfaces/PostOptions.md)

Optional configuration for the route.

## Returns

`MethodDecorator`

A method decorator configured for a POST route.

## Example

```typescript
@Post('/create')
createResource() {
  return 'Resource created';
}
```
