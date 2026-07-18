# Class: AdapterEventBuilder\<V, R\>

Class representing a generic AdapterEventBuilder.

This class provides a builder pattern to construct an object of type `R` based on options of type `V`.
It is intended to handle complex object creation by allowing flexible modification of options and resolving the final object.

## Type Parameters

### V

`V` *extends* `object`

The type of the options used to build the final object. Must be an object.

### R

`R`

The type of the final object that will be built.

## Implements

- [`IAdapterEventBuilder`](../../../declarations/interfaces/IAdapterEventBuilder.md)\<`V`, `R`\>

## Constructors

### Constructor

```ts
protected new AdapterEventBuilder<V, R>(options): AdapterEventBuilder<V, R>;
```

Constructs an AdapterEventBuilder.

#### Parameters

##### options

[`AdapterEventBuilderOptions`](../interfaces/AdapterEventBuilderOptions.md)\<`V`, `R`\>

The options for creating the AdapterEventBuilder instance, including the initial options and the resolver function.

#### Returns

`AdapterEventBuilder`\<`V`, `R`\>

## Properties

### options

```ts
readonly options: V;
```

The options used for building the final object.

#### Implementation of

[`IAdapterEventBuilder`](../../../declarations/interfaces/IAdapterEventBuilder.md).[`options`](../../../declarations/interfaces/IAdapterEventBuilder.md#options)

## Methods

### add()

```ts
add(key, value): this;
```

Adds or updates a key-value pair in the options.

#### Parameters

##### key

keyof `V`

The key in the options to be updated.

##### value

`V`\[keyof `V`\]

The value to set for the given key.

#### Returns

`this`

This instance of AdapterEventBuilder for method chaining.

#### Implementation of

[`IAdapterEventBuilder`](../../../declarations/interfaces/IAdapterEventBuilder.md).[`add`](../../../declarations/interfaces/IAdapterEventBuilder.md#add)

***

### addIf()

```ts
addIf(key, value): this;
```

Adds a key-value pair in the options if the key does not already exist.

#### Parameters

##### key

keyof `V`

The key in the options to be updated.

##### value

`V`\[keyof `V`\]

The value to set for the given key.

#### Returns

`this`

This instance of AdapterEventBuilder for method chaining.

#### Implementation of

[`IAdapterEventBuilder`](../../../declarations/interfaces/IAdapterEventBuilder.md).[`addIf`](../../../declarations/interfaces/IAdapterEventBuilder.md#addif)

***

### build()

```ts
build(): R;
```

Builds the final object by using the resolver function with the current options.

#### Returns

`R`

The final object of type `R`.

#### Implementation of

[`IAdapterEventBuilder`](../../../declarations/interfaces/IAdapterEventBuilder.md).[`build`](../../../declarations/interfaces/IAdapterEventBuilder.md#build)

***

### create()

```ts
static create<V, R>(options): AdapterEventBuilder<V, R>;
```

Static method to create a new AdapterEventBuilder instance.

#### Type Parameters

##### V

`V` *extends* `object`

##### R

`R`

#### Parameters

##### options

[`AdapterEventBuilderOptions`](../interfaces/AdapterEventBuilderOptions.md)\<`V`, `R`\>

The options for creating the AdapterEventBuilder instance, including the initial options and the resolver function.

#### Returns

`AdapterEventBuilder`\<`V`, `R`\>

A new instance of AdapterEventBuilder.
