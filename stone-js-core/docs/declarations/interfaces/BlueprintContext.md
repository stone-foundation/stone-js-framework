# Interface: BlueprintContext\<BlueprintType, ModuleType\>

ConfigContext Interface.

Represents the context object for configuration, which contains the modules and blueprint used to configure the system.

## Type Parameters

### BlueprintType

`BlueprintType` *extends* [`IBlueprint`](../type-aliases/IBlueprint.md) = [`IBlueprint`](../type-aliases/IBlueprint.md)

### ModuleType

`ModuleType` = [`ClassType`](../type-aliases/ClassType.md) \| `PipeClass`

## Properties

### blueprint

```ts
readonly blueprint: BlueprintType;
```

The configuration blueprint.

***

### modules

```ts
readonly modules: ModuleType[];
```

List of configuration modules.
