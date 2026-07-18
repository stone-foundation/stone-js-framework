# Interface: HttpJsonConfig

## Properties

### escape

```ts
escape: boolean;
```

Whether to escape HTML characters in JSON output.

***

### replacer()?

```ts
optional replacer: (this, key, value) => unknown;
```

A custom replacer function for JSON serialization.

#### Parameters

##### this

`unknown`

##### key

`string`

##### value

`unknown`

#### Returns

`unknown`

***

### spaces

```ts
spaces: string;
```

The number of spaces to use for formatting JSON output.
