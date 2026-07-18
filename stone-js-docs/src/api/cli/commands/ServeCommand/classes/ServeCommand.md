# Class: ServeCommand

The serve command class.

## Constructors

### Constructor

```ts
new ServeCommand(context): ServeCommand;
```

Create a new instance of ServeCommand.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`ServeCommand`

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
