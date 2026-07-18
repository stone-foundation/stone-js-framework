# Function: defineStoneApp()

Defines a Stone app using a function-based, factory-based or class-based main handler.

## Param

A function, factory function or class constructor for the main page.

## Param

Optional application-level configuration.

## Param

Additional blueprints to merge.

## Call Signature

```ts
function defineStoneApp<U>(
   module, 
   options?, 
blueprints?): StoneBlueprint<U>;
```

Declares a complete Stone application blueprint using a function-based event handler.

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

### Parameters

#### module

[`FunctionalEventHandler`](../../../declarations/type-aliases/FunctionalEventHandler.md)\<`U`\>

A function as an event handler.

#### options?

`Partial`\<[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md)\<`U`, [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)\>\> & `object`

Application-level configuration.

#### blueprints?

[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`any`, `any`\> & `Record`\<`string`, `any`\>[]

Additional partial blueprints to merge.

### Returns

[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>

A fully merged Stone blueprint.

### Param

A function, factory function or class constructor for the main page.

### Param

Optional application-level configuration.

### Param

Additional blueprints to merge.

## Call Signature

```ts
function defineStoneApp<U>(
   module, 
   options, 
blueprints?): StoneBlueprint<U>;
```

Declares a complete Stone application blueprint using a factory-based event handler.

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

### Parameters

#### module

[`FactoryEventHandler`](../../../declarations/type-aliases/FactoryEventHandler.md)\<`U`\>

A factory function that returns an event handler.

#### options

`Partial`\<[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md)\<`U`, [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)\>\> & `object`

Application-level configuration with `{ isFactory: true }`.

#### blueprints?

[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`any`, `any`\> & `Record`\<`string`, `any`\>[]

Additional partial blueprints to merge.

### Returns

[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>

A fully merged Stone blueprint.

### Param

A function, factory function or class constructor for the main page.

### Param

Optional application-level configuration.

### Param

Additional blueprints to merge.

## Call Signature

```ts
function defineStoneApp<U>(
   module, 
   options, 
blueprints?): StoneBlueprint<U>;
```

Declares a complete Stone application blueprint using a class-based event handler.

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

### Parameters

#### module

[`EventHandlerClass`](../../../declarations/type-aliases/EventHandlerClass.md)\<`U`\>

A class constructor for the event handler.

#### options

`Partial`\<[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md)\<`U`, [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)\>\> & `object`

Application-level configuration with `{ isClass: true }`.

#### blueprints?

[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`any`, `any`\> & `Record`\<`string`, `any`\>[]

Additional partial blueprints to merge.

### Returns

[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>

A fully merged Stone blueprint.

### Param

A function, factory function or class constructor for the main page.

### Param

Optional application-level configuration.

### Param

Additional blueprints to merge.

## Call Signature

```ts
function defineStoneApp<U>(options?, blueprints?): StoneBlueprint<U>;
```

Defines a Stone app without a main handler (router-only).

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

### Parameters

#### options?

`Partial`\<[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md)\<`U`, [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)\>\>

Application-level configuration.

#### blueprints?

[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`any`, `any`\> & `Record`\<`string`, `any`\>[]

Additional partial blueprints to merge.

### Returns

[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>

A fully merged Stone blueprint.

### Param

A function, factory function or class constructor for the main page.

### Param

Optional application-level configuration.

### Param

Additional blueprints to merge.
