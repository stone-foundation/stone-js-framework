# Class: ListCommand

The list command class.

## Constructors

### Constructor

```ts
new ListCommand(context): ListCommand;
```

Create a new instance of ListCommand.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`ListCommand`

## Methods

### handle()

```ts
handle(event): Promise<void>;
```

Handle the incoming event.

#### Parameters

##### event

`IncomingEvent`

The incoming event.

#### Returns

`Promise`\<`void`\>

The blueprint.
