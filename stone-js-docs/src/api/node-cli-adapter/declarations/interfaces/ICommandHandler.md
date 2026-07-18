# Interface: ICommandHandler\<W, X\>

Represents the CommandHandler function for the Node Cli Adapter.

## Type Parameters

### W

`W` *extends* `IncomingEvent` = `IncomingEvent`

### X

`X` = `unknown`

## Properties

### handle

```ts
handle: FunctionalCommandHandler<W, X>;
```

***

### match()?

```ts
optional match: (event) => boolean;
```

#### Parameters

##### event

`IncomingEvent`

#### Returns

`boolean`
