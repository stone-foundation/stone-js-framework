# Function: Options()

```ts
function Options(path, options?): MethodDecorator;
```

A method decorator for defining HTTP OPTIONS routes.

## Parameters

### path

`string` \| `string`[]

The route path for the OPTIONS endpoint.

### options?

[`OptionsOptions`](../interfaces/OptionsOptions.md)

Optional configuration for the route.

## Returns

`MethodDecorator`

A method decorator configured for an OPTIONS route.

## Example

```typescript
@Options('/resource')
optionsResource() {
  return 'Options for resource';
}
```
