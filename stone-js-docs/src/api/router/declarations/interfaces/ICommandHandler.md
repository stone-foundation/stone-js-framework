# Interface: ICommandHandler\<W, X\>

Represents the CommandHandler function for the Node Cli Adapter.

## Type Parameters

### W

`W` *extends* [`IIncomingEvent`](IIncomingEvent.md) = [`IIncomingEvent`](IIncomingEvent.md)

### X

`X` = `unknown`

## Properties

### handle

```ts
handle: FunctionalEventHandler<W, X>;
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
