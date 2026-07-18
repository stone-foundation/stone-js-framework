# Function: stoneApp()

```ts
function stoneApp<U, V>(options): StoneFactory<U, V>;
```

Create a new Stone instance with the given options.

This function creates a new Stone instance with the provided options.
It allows you to configure the application using the StoneFactory.

## Type Parameters

### U

`U` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### V

`V` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Parameters

### options

[`StoneFactoryOptions`](../interfaces/StoneFactoryOptions.md) = `{}`

The options to create the Stone instance.

## Returns

[`StoneFactory`](../classes/StoneFactory.md)\<`U`, `V`\>

A new StoneFactory instance.
