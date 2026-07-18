# Function: definePage()

Utility function to define a page.

## Param

The EventHandler module.

## Param

Page definition options.

## Call Signature

```ts
function definePage<U>(module, options): Partial<StoneBlueprint<U>>;
```

Utility function to define a factory-based page.

### Type Parameters

#### U

`U` *extends* [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md) = [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md)

### Parameters

#### module

[`FactoryPage`](../../../declarations/type-aliases/FactoryPage.md)\<`U`\>

The EventHandler module.

#### options

[`PageOptions`](../../../declarations/interfaces/PageOptions.md) & `object`

Page definition options.

### Returns

`Partial`\<`StoneBlueprint`\<`U`\>\>

The UseReactBlueprint.

### Param

The EventHandler module.

### Param

Page definition options.

## Call Signature

```ts
function definePage<U>(module, options): Partial<StoneBlueprint<U>>;
```

Utility function to define a class-based page.

### Type Parameters

#### U

`U` *extends* [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md) = [`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md)

### Parameters

#### module

[`PageClass`](../../../declarations/type-aliases/PageClass.md)\<`U`\>

The EventHandler module.

#### options

[`PageOptions`](../../../declarations/interfaces/PageOptions.md) & `object`

Page definition options.

### Returns

`Partial`\<`StoneBlueprint`\<`U`\>\>

The UseReactBlueprint.

### Param

The EventHandler module.

### Param

Page definition options.
