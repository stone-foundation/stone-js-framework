# Function: Fallback()

```ts
function Fallback(options?): MethodDecorator;
```

A method decorator for defining a fallback HTTP GET route.

## Parameters

### options?

[`FallbackOptions`](../interfaces/FallbackOptions.md)

Optional configuration for the route.

## Returns

`MethodDecorator`

A method decorator configured for a fallback GET route.

## Example

```typescript
@Fallback()
handleFallback() {
  return 'Fallback route';
}
```
