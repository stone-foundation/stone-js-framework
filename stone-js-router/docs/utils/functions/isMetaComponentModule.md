# Function: isMetaComponentModule()

```ts
function isMetaComponentModule<ComponentModuleType>(value): value is Record<"module", ComponentModuleType>;
```

Check if the provided value is a meta Component module.

## Type Parameters

### ComponentModuleType

`ComponentModuleType`

## Parameters

### value

`any`

The value to check.

## Returns

`value is Record<"module", ComponentModuleType>`

`true` if the value is a meta Component module, otherwise `false`.
