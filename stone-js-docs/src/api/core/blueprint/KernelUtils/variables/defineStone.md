# Variable: defineStone()

```ts
const defineStone: {
  (module, options): Partial<StoneBlueprint>;
  (module, options): Partial<StoneBlueprint>;
} = defineService;
```

Defines a core Stone.js service.

This is a specialized alias for `defineService`, used to register essential services
that are part of the application’s foundation. It supports both factory and class-based service definitions.

## Call Signature

```ts
(module, options): Partial<StoneBlueprint>;
```

Defines a factory-based service for the Stone.js application.

### Parameters

#### module

[`FactoryService`](../../../declarations/type-aliases/FactoryService.md)

A factory function that returns the service instance.

#### options

[`ServiceOptions`](../../../declarations/interfaces/ServiceOptions.md) & `object`

Configuration options for the service including alias and factory flag.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint registering the service.

## Call Signature

```ts
(module, options): Partial<StoneBlueprint>;
```

Defines a class-based service for the Stone.js application.

### Parameters

#### module

[`IServiceClass`](../../../declarations/type-aliases/IServiceClass.md)

The service class to be registered.

#### options

[`ServiceOptions`](../../../declarations/interfaces/ServiceOptions.md) & `object`

Configuration options for the service including alias and factory flag.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint registering the service.

## See

defineService

## Example

```ts
defineStone(MyStoneServiceClass, { alias: 'stone.core', isClass: true })
defineStone((container) => ({ save(){} }), { alias: 'myService' })
```
