# Type Alias: CommandHandlerClass()\<W, X\>

```ts
type CommandHandlerClass<W, X> = (...args) => ICommandHandler<W, X>;
```

Represents CommandHandlerClass.

## Type Parameters

### W

`W` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### X

`X` = `unknown`

## Parameters

### args

...`any`[]

## Returns

[`ICommandHandler`](../interfaces/ICommandHandler.md)\<`W`, `X`\>
