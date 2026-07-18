# Interface: AdapterEventBuilderOptions\<V, R\>

AdapterEventBuilderOptions.

This interface defines the options used to create an AdapterEventBuilder instance.
It includes an optional initial options object of type `V` and a resolver function.

## Type Parameters

### V

`V`

The type of the options used to build the final object.

### R

`R`

The type of the final object that will be built.

## Properties

### options?

```ts
optional options: V;
```

The initial options used for building the object. This is optional.

***

### resolver()

```ts
resolver: (options) => R;
```

The resolver function that takes the options and returns the final object of type `R`.

#### Parameters

##### options

`V`

#### Returns

`R`
