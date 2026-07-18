# Function: defineEventSubscriber()

Registers an event subscriber into the Stone blueprint.
Supports functional, factory-based, and class-based subscribers.

## Param

The subscriber implementation.

## Param

Optional `isFactory` flag to define subscriber type.

## Example

```ts
defineEventSubscriber(MySubscriberClass, { isClass: true })
defineEventSubscriber(() => ({ subscribe: emitter => ... }), { isFactory: true })
defineEventSubscriber((emitter) => { ... })
```

## Call Signature

```ts
function defineEventSubscriber(module): Partial<StoneBlueprint>;
```

Registers a **functional event subscriber** into the Stone blueprint.

### Parameters

#### module

[`FunctionalEventSubscriber`](../../../declarations/type-aliases/FunctionalEventSubscriber.md)

The functional subscriber.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint with the subscriber metadata.

### Param

The subscriber implementation.

### Param

Optional `isFactory` flag to define subscriber type.

### Example

```ts
defineEventSubscriber(MySubscriberClass, { isClass: true })
defineEventSubscriber(() => ({ subscribe: emitter => ... }), { isFactory: true })
defineEventSubscriber((emitter) => { ... })
```

## Call Signature

```ts
function defineEventSubscriber(module, options): Partial<StoneBlueprint>;
```

Registers a **factory-based event subscriber** into the Stone blueprint.

### Parameters

#### module

[`FactoryEventSubscriber`](../../../declarations/type-aliases/FactoryEventSubscriber.md)

The factory subscriber.

#### options

Must include `isFactory: true`.

##### isFactory

`true`

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint with the subscriber metadata.

### Param

The subscriber implementation.

### Param

Optional `isFactory` flag to define subscriber type.

### Example

```ts
defineEventSubscriber(MySubscriberClass, { isClass: true })
defineEventSubscriber(() => ({ subscribe: emitter => ... }), { isFactory: true })
defineEventSubscriber((emitter) => { ... })
```

## Call Signature

```ts
function defineEventSubscriber(module, options): Partial<StoneBlueprint>;
```

Registers a **class-based event subscriber** into the Stone blueprint.

### Parameters

#### module

[`IEventSubscriberClass`](../../../declarations/type-aliases/IEventSubscriberClass.md)

The subscriber class.

#### options

Must include `isClass: true`.

##### isClass

`true`

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint with the subscriber metadata.

### Param

The subscriber implementation.

### Param

Optional `isFactory` flag to define subscriber type.

### Example

```ts
defineEventSubscriber(MySubscriberClass, { isClass: true })
defineEventSubscriber(() => ({ subscribe: emitter => ... }), { isFactory: true })
defineEventSubscriber((emitter) => { ... })
```
