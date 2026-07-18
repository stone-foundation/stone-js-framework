# Function: isPlainObject()

```ts
function isPlainObject(value): value is Record<PropertyKey, unknown>;
```

Is the value a plain object (created from `{}`/`Object.create(null)`), not a special object?

## Parameters

### value

`unknown`

The value to test.

## Returns

`value is Record<PropertyKey, unknown>`

True for plain objects only.
