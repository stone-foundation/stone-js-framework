# Function: isMetaAliasModule()

```ts
function isMetaAliasModule<AliasModuleType>(value): value is Record<"module", AliasModuleType>;
```

Check if the provided value is a meta alias module.

## Type Parameters

### AliasModuleType

`AliasModuleType`

## Parameters

### value

`any`

The value to check.

## Returns

`value is Record<"module", AliasModuleType>`

`true` if the value is a meta alias module, otherwise `false`.
