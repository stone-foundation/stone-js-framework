[**Testing**](../../README.md)

***

[Testing](../../README.md) / [createTestApp](../README.md) / createTestApp

# Function: createTestApp()

> **createTestApp**(`options?`): `Promise`\<[`TestClient`](../../TestClient/classes/TestClient.md)\>

Boots a Stone.js application in-memory for testing.

It runs the real bootstrap (blueprint introspection, providers, hooks) via `StoneFactory`, but
swaps in the [TestAdapter](../../TestAdapter/README.md) so nothing binds a port. You get a [TestClient](../../TestClient/classes/TestClient.md) whose
`send(event)` dispatches through the full kernel — the same path production uses.

## Parameters

### options?

[`TestAppOptions`](../../declarations/interfaces/TestAppOptions.md) = `{}`

The modules/blueprint to boot.

## Returns

`Promise`\<[`TestClient`](../../TestClient/classes/TestClient.md)\>

A booted test client.

## Example

```ts
const app = await createTestApp({ modules: [Application, TasksController, TaskService] })
const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/tasks' }))
expect(response.statusCode).toBe(200)
```
