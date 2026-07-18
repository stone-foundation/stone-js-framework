# Function: defineStoneReactApp()

Defines a Stone React app using a factory-based or class-based main handler.

## Param

A factory function or class constructor for the main page.

## Param

Optional application-level configuration.

## Param

Additional blueprints to merge.

## Call Signature

```ts
function defineStoneReactApp<U>(
   module, 
   options?, 
blueprints?): StoneBlueprint<U>;
```

Defines a Stone React app using a factory-based main handler.

### Type Parameters

#### U

`U` *extends* [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md) = [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md)

### Parameters

#### module

[`FactoryPage`](../../../declarations/type-aliases/FactoryPage.md)\<`U`\>

A factory function for the main page.

#### options?

`Partial`\<[`UseReactAppConfig`](../../../options/UseReactBlueprint/interfaces/UseReactAppConfig.md)\>

Optional application-level configuration.

#### blueprints?

`StoneBlueprint`\<`any`, `any`\> & `Record`\<`string`, `any`\>[]

Additional blueprints to merge.

### Returns

`StoneBlueprint`\<`U`\>

A fully merged Stone blueprint.

### Param

A factory function or class constructor for the main page.

### Param

Optional application-level configuration.

### Param

Additional blueprints to merge.

## Call Signature

```ts
function defineStoneReactApp<U>(
   module, 
   options, 
blueprints?): StoneBlueprint<U>;
```

Defines a Stone React app using a class-based main handler.

### Type Parameters

#### U

`U` *extends* [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md) = [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md)

### Parameters

#### module

[`PageClass`](../../../declarations/type-aliases/PageClass.md)\<`U`\>

A class constructor for the main page.

#### options

`Partial`\<[`UseReactAppConfig`](../../../options/UseReactBlueprint/interfaces/UseReactAppConfig.md)\> & `object`

Optional application-level configuration.

#### blueprints?

`StoneBlueprint`\<`any`, `any`\> & `Record`\<`string`, `any`\>[]

Additional blueprints to merge.

### Returns

`StoneBlueprint`\<`U`\>

A fully merged Stone blueprint.

### Param

A factory function or class constructor for the main page.

### Param

Optional application-level configuration.

### Param

Additional blueprints to merge.

## Call Signature

```ts
function defineStoneReactApp<U>(options?, blueprints?): StoneBlueprint<U>;
```

Defines a Stone React app without a main handler (router-only).

### Type Parameters

#### U

`U` *extends* [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md) = [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md)

### Parameters

#### options?

`Partial`\<[`UseReactAppConfig`](../../../options/UseReactBlueprint/interfaces/UseReactAppConfig.md)\>

Application-level configuration.

#### blueprints?

`StoneBlueprint`\<`any`, `any`\> & `Record`\<`string`, `any`\>[]

Additional blueprints to merge.

### Returns

`StoneBlueprint`\<`U`\>

A fully merged Stone blueprint.

### Param

A factory function or class constructor for the main page.

### Param

Optional application-level configuration.

### Param

Additional blueprints to merge.
