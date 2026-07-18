# Function: hasPath()

```ts
function hasPath(obj, key): boolean;
```

Does the object have an own value at the key path?

## Parameters

### obj

`unknown`

The source object.

### key

`PropertyKey` \| `PropertyKey`[]

The key path.

## Returns

`boolean`

True if every segment exists as an own property.
