# Type Alias: FactoryCommandHandler()\<W, X\>

```ts
type FactoryCommandHandler<W, X> = (container) => 
  | ICommandHandler<W, X>
| FunctionalCommandHandler<W, X>;
```

Represents FactoryCommandHandler.

## Type Parameters

### W

`W` *extends* `IncomingEvent` = `IncomingEvent`

### X

`X` = `unknown`

## Parameters

### container

`IContainer` | `any`

## Returns

  \| [`ICommandHandler`](../interfaces/ICommandHandler.md)\<`W`, `X`\>
  \| [`FunctionalCommandHandler`](FunctionalCommandHandler.md)\<`W`, `X`\>
