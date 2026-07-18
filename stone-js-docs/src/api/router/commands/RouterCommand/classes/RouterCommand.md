# Class: RouterCommand

Handles router-related commands by interacting with the Router instance.

## Constructors

### Constructor

```ts
new RouterCommand(container): RouterCommand;
```

Initializes a new instance of `RouterCommand`.

#### Parameters

##### container

`Container`

The dependency injection container for resolving the Router instance.

#### Returns

`RouterCommand`

#### Throws

If the container is not provided.

## Methods

### handle()

```ts
handle(event): Promise<void>;
```

Processes an incoming event and executes the specified router action.

#### Parameters

##### event

`IncomingEvent`

The event containing metadata for router actions.

#### Returns

`Promise`\<`void`\>

A promise resolving to an `OutgoingResponse`.
