# Type Alias: CommandHandlerType\<W, X\>

```ts
type CommandHandlerType<W, X> = 
  | CommandHandlerClass<W, X>
  | FactoryCommandHandler<W, X>
| FunctionalCommandHandler<W, X>;
```

Represents CommandHandlerType.

## Type Parameters

### W

`W` *extends* `IncomingEvent` = `IncomingEvent`

### X

`X` = `unknown`
