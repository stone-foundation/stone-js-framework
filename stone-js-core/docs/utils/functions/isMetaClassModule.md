# Function: isMetaClassModule()

```ts
function isMetaClassModule<ClassModuleType>(value): value is Record<"module", ClassModuleType>;
```

Check if the provided value is a meta class module.

## Type Parameters

### ClassModuleType

`ClassModuleType`

## Parameters

### value

`any`

The value to check.

## Returns

`value is Record<"module", ClassModuleType>`

`true` if the value is a meta class module, otherwise `false`.
