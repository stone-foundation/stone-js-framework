# Class: CustomCommand

The custom command class.

## Constructors

### Constructor

```ts
new CustomCommand(context): CustomCommand;
```

Create a new instance of CustomCommand.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`CustomCommand`

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
