# Function: isFunction()

```ts
function isFunction<ClassType>(value): value is ClassType;
```

Check if the value is a function.

## Type Parameters

### ClassType

`ClassType` = `Function`

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is ClassType`

`true` if the value is a function, otherwise `false`.
