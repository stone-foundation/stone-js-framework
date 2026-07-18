# Function: setMethodMetadata()

```ts
function setMethodMetadata<T>(key, value): MethodDecorator;
```

Set metadata on a class method using a method decorator.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

## Parameters

### key

`PropertyKey`

The key for the metadata entry.

### value

`unknown`

The value of the metadata entry.

## Returns

`MethodDecorator`

A method decorator function that sets the metadata.
