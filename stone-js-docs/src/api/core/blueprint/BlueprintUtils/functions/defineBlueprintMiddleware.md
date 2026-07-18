# Function: defineBlueprintMiddleware()

Utility function to define a blueprint middleware.

## Param

The Middleware module.

## Param

The options for the Middleware.

## Call Signature

```ts
function defineBlueprintMiddleware(module, options?): Partial<StoneBlueprint>;
```

Utility function to define a function-based blueprint middleware.

### Parameters

#### module

[`Arrayable`](../../../declarations/type-aliases/Arrayable.md)\<[`FunctionalMiddleware`](../../../declarations/type-aliases/FunctionalMiddleware.md)\<[`BlueprintContext`](../../../declarations/interfaces/BlueprintContext.md)\<[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)\<`any`\>, 
  \| `PipeClass`
  \| [`ClassType`](../../../declarations/type-aliases/ClassType.md)\<`any`\>\>, [`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)\>\>

The Middleware module.

#### options?

The options for the Middleware.

##### isClass?

`undefined`

##### isFactory?

`undefined`

##### params?

`any`[]

##### priority?

`number`

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

The StoneBlueprint.

### Param

The Middleware module.

### Param

The options for the Middleware.

## Call Signature

```ts
function defineBlueprintMiddleware(module, options): Partial<StoneBlueprint>;
```

Utility function to define a factory-based blueprint middleware.

### Parameters

#### module

[`Arrayable`](../../../declarations/type-aliases/Arrayable.md)\<[`FactoryMiddleware`](../../../declarations/type-aliases/FactoryMiddleware.md)\<[`BlueprintContext`](../../../declarations/interfaces/BlueprintContext.md)\<[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)\<`any`\>, 
  \| `PipeClass`
  \| [`ClassType`](../../../declarations/type-aliases/ClassType.md)\<`any`\>\>, [`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)\>\>

The Middleware module.

#### options

The options for the Middleware.

##### isClass?

`undefined`

##### isFactory

`true`

##### params?

`any`[]

##### priority?

`number`

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

The StoneBlueprint.

### Param

The Middleware module.

### Param

The options for the Middleware.

## Call Signature

```ts
function defineBlueprintMiddleware(module, options): Partial<StoneBlueprint>;
```

Utility function to define a class-based blueprint middleware.

### Parameters

#### module

[`Arrayable`](../../../declarations/type-aliases/Arrayable.md)\<[`MiddlewareClass`](../../../declarations/type-aliases/MiddlewareClass.md)\<[`BlueprintContext`](../../../declarations/interfaces/BlueprintContext.md)\<[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)\<`any`\>, 
  \| `PipeClass`
  \| [`ClassType`](../../../declarations/type-aliases/ClassType.md)\<`any`\>\>, [`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)\>\>

The Middleware module.

#### options

The options for the Middleware.

##### isClass

`true`

##### isFactory?

`undefined`

##### params?

`any`[]

##### priority?

`number`

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

The StoneBlueprint.

### Param

The Middleware module.

### Param

The options for the Middleware.
