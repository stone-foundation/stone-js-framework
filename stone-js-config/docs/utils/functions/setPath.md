# Function: setPath()

```ts
function setPath(
   obj, 
   key, 
   value): void;
```

Write a value at a key path, creating intermediate plain objects, and refusing any
segment that would pollute the prototype chain.

## Parameters

### obj

`object`

The target object (mutated).

### key

`PropertyKey` \| `PropertyKey`[]

The key path.

### value

`unknown`

The value to set.

## Returns

`void`
