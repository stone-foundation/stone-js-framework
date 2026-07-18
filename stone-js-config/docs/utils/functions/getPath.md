# Function: getPath()

```ts
function getPath<T>(
   obj, 
   key, 
   fallback?): T | undefined;
```

Read a value at a key path, returning a fallback when absent.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### obj

`unknown`

The source object.

### key

`PropertyKey` \| `PropertyKey`[]

The key path.

### fallback?

`T`

The value returned when the path is absent.

## Returns

`T` \| `undefined`

The value or the fallback.
