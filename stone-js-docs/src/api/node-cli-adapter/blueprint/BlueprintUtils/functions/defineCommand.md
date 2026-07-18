# Function: defineCommand()

Utility function to define a command handler for the Node Console Adapter.

## Param

The CommandHandler module.

## Param

The metadata options for the handler.

## Call Signature

```ts
function defineCommand<U, V>(module, options): Partial<NodeConsoleAdapterBlueprint>;
```

Utility function to define a function-based command handler for the Node Console Adapter.

### Type Parameters

#### U

`U` *extends* `IncomingEvent` = `IncomingEvent`

#### V

`V` = `unknown`

### Parameters

#### module

[`FunctionalCommandHandler`](../../../declarations/type-aliases/FunctionalCommandHandler.md)\<`U`, `V`\>

The CommandHandler module.

#### options

[`CommandOptions`](../../../decorators/Command/interfaces/CommandOptions.md)

The metadata options for the handler.

### Returns

`Partial`\<[`NodeConsoleAdapterBlueprint`](../../../options/NodeConsoleAdapterBlueprint/interfaces/NodeConsoleAdapterBlueprint.md)\>

The NodeConsoleAdapterBlueprint.

### Param

The CommandHandler module.

### Param

The metadata options for the handler.

## Call Signature

```ts
function defineCommand<U, V>(module, options): Partial<NodeConsoleAdapterBlueprint>;
```

Utility function to define a factory-based command handler for the Node Console Adapter.

### Type Parameters

#### U

`U` *extends* `IncomingEvent` = `IncomingEvent`

#### V

`V` = `unknown`

### Parameters

#### module

[`FactoryCommandHandler`](../../../declarations/type-aliases/FactoryCommandHandler.md)\<`U`, `V`\>

The CommandHandler module.

#### options

[`CommandOptions`](../../../decorators/Command/interfaces/CommandOptions.md) & `object`

The metadata options for the handler.

### Returns

`Partial`\<[`NodeConsoleAdapterBlueprint`](../../../options/NodeConsoleAdapterBlueprint/interfaces/NodeConsoleAdapterBlueprint.md)\>

The NodeConsoleAdapterBlueprint.

### Param

The CommandHandler module.

### Param

The metadata options for the handler.

## Call Signature

```ts
function defineCommand<U, V>(module, options): Partial<NodeConsoleAdapterBlueprint>;
```

Utility function to define a class-based command handler for the Node Console Adapter.

### Type Parameters

#### U

`U` *extends* `IncomingEvent` = `IncomingEvent`

#### V

`V` = `unknown`

### Parameters

#### module

[`CommandHandlerClass`](../../../declarations/type-aliases/CommandHandlerClass.md)\<`U`, `V`\>

The CommandHandler module.

#### options

[`CommandOptions`](../../../decorators/Command/interfaces/CommandOptions.md) & `object`

The metadata options for the handler.

### Returns

`Partial`\<[`NodeConsoleAdapterBlueprint`](../../../options/NodeConsoleAdapterBlueprint/interfaces/NodeConsoleAdapterBlueprint.md)\>

The NodeConsoleAdapterBlueprint.

### Param

The CommandHandler module.

### Param

The metadata options for the handler.
