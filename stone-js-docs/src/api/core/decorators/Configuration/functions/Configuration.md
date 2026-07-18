# Function: Configuration()

```ts
function Configuration<T>(options): ClassDecorator;
```

Configuration decorator to set imperative configuration.

## Type Parameters

### T

`T` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md) = [`ClassType`](../../../declarations/type-aliases/ClassType.md)

## Parameters

### options

[`ConfigurationOptions`](../interfaces/ConfigurationOptions.md) = `{}`

The configuration options.

## Returns

`ClassDecorator`

A class decorator function that sets the metadata using the provided options.

## Example

```typescript
@Configuration()
MyConfiguration {
 configure (blueprint): void | Promise<void> {
   blueprint.set('name.name', {})
 }
}
```
