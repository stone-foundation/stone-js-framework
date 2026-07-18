# Function: isMetaFactoryModule()

```ts
function isMetaFactoryModule<FactoryModuleType>(value): value is Record<"module", FactoryModuleType>;
```

Check if the provided value is a meta factory module.

## Type Parameters

### FactoryModuleType

`FactoryModuleType`

## Parameters

### value

`any`

The value to check.

## Returns

`value is Record<"module", FactoryModuleType>`

`true` if the value is a meta factory module, otherwise `false`.
