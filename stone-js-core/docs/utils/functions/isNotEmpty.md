# Function: isNotEmpty()

```ts
function isNotEmpty<ValueType>(value): value is ValueType;
```

Check if the provided value is not empty.

## Type Parameters

### ValueType

`ValueType` = `unknown`

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is ValueType`

`true` if the value is not empty, otherwise `false`.
