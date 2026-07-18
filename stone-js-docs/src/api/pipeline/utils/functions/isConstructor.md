# Function: isConstructor()

```ts
function isConstructor<ClassType>(value): value is (args: any[]) => ClassType;
```

Checks if the given value is a constructor function.

## Type Parameters

### ClassType

`ClassType` = `any`

## Parameters

### value

`unknown`

The value to be checked.

## Returns

`value is (args: any[]) => ClassType`

True if the value is a constructor function, false otherwise.
