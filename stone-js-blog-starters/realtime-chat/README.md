# Realtime chat

A Stone.js starter for **channels, presence and broadcast over WebSockets**, the recipe from
[Realtime features](https://stonejs.dev/blog/real-time-features).

## What's inside

- `@NodeWs` runs a WebSocket server and bridges every socket to the kernel.
- `@Realtime` enables the broadcaster (`memory` driver out of the box; swap to `redis` to scale across nodes).
- A `@RealtimeGateway` whose `@OnConnect` / `@OnDisconnect` / `@OnEvent` methods react to socket lifecycle and channel messages, and fan them back out with `realtime.to('room:general').emit(...)`.

Because the gateway is dispatched through the kernel by the light key-router, the exact same gateway runs unchanged on the AWS API Gateway WebSocket adapter, no code change, just a different `@` on the entry class.

## Run it

```bash
npm install
npm run dev      # ws://localhost:8080
```

Connect any WebSocket client, send `{ "type": "message", "channel": "room:general", "payload": { "from": "you", "text": "hi" } }`, and watch it broadcast.

## Test

```bash
npm test
```

## Scale out

Switch the broadcaster to Redis and every node shares presence and broadcasts:

```ts
@Realtime({ driver: 'redis', redis: { url: process.env.REDIS_URL } })
```
