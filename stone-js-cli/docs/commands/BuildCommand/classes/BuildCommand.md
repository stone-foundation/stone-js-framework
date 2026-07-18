# Class: BuildCommand

The build command class.

## Constructors

### Constructor

```ts
new BuildCommand(context): BuildCommand;
```

Create a new instance of BuildCommand.

#### Parameters

##### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The service container to manage dependencies.

#### Returns

`BuildCommand`

## Methods

### handle()

```ts
handle(event): Promise<void>;
```

Handle the incoming event.

#### Parameters

##### event

`IncomingEvent`

#### Returns

`Promise`\<`void`\>

The blueprint.
