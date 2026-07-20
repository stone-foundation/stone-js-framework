[**Testing**](../../README.md)

***

[Testing](../../README.md) / [TestClient](../README.md) / TestClient

# Class: TestClient

A booted, in-memory Stone.js app you can send synthetic events to.

`send` dispatches an event through the real kernel (middleware, handler, response, error
handling) — exactly what production runs, minus the network. Each call gets a fresh ephemeral
container, mirroring the per-request isolation of Stone.js.

## Constructors

### Constructor

> **new TestClient**(`dispatch`): `TestClient`

#### Parameters

##### dispatch

(`event`) => `Promise`\<`OutgoingResponse`\>

The bound dispatch function from the test adapter.

#### Returns

`TestClient`

## Methods

### send()

> **send**\<`ResponseType`\>(`event`): `Promise`\<`ResponseType`\>

Dispatch an event and resolve with the outgoing response.

#### Type Parameters

##### ResponseType

`ResponseType` *extends* `OutgoingResponse` = `OutgoingResponse`

#### Parameters

##### event

`IncomingEvent`

The incoming event (build one with the factories).

#### Returns

`Promise`\<`ResponseType`\>

The outgoing response.
