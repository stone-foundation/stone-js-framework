# Function: defineConfig()

```ts
function defineConfig(configuration): ConfigurationClass;
```

Defines an application blueprint by merging user-defined blueprints with default options.

This function allows users to define their own blueprints and merges them with
the default blueprint options provided by the framework.
It ensures that all necessary properties are available while allowing user customizations.

## Parameters

### configuration

The user-defined blueprint configuration.

[`FunctionalConfiguration`](../../../declarations/type-aliases/FunctionalConfiguration.md) | `Partial`\<`Record`\<`"configure"` \| `"afterConfigure"`, [`FunctionalConfiguration`](../../../declarations/type-aliases/FunctionalConfiguration.md)\>\>

## Returns

[`ConfigurationClass`](../../../declarations/type-aliases/ConfigurationClass.md)

The fully defined application blueprint.

## Example

```typescript
const appBlueprint = defineConfig((blueprint) => {
  blueprint.set('stone.name', 'MyApp')
});
```
