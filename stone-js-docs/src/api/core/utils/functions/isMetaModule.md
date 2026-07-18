# Function: isMetaModule()

```ts
function isMetaModule<MetaModuleType>(value): value is Record<"module", MetaModuleType>;
```

Check if the provided value is a meta module.

## Type Parameters

### MetaModuleType

`MetaModuleType`

## Parameters

### value

`any`

The value to check.

## Returns

`value is Record<"module", MetaModuleType>`

`true` if the value is a meta module, otherwise `false`.
