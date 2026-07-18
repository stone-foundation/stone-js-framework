# Function: isMetaFunctionModule()

```ts
function isMetaFunctionModule<FunctionModuleType>(value): value is Record<"module", FunctionModuleType>;
```

Check if the provided value is a meta function module.

## Type Parameters

### FunctionModuleType

`FunctionModuleType`

## Parameters

### value

`any`

The value to check.

## Returns

`value is Record<"module", FunctionModuleType>`

`true` if the value is a meta function module, otherwise `false`.
