# Class: RequestLimitsMiddleware

Kernel middleware that rejects requests carrying too many headers or cookies.

Defence-in-depth against denial-of-service. The Node HTTP server already bounds header
count/size, but that protection is unavailable on serverless runtimes (AWS Lambda, edge),
so this adapter-agnostic guard enforces the limits uniformly wherever an `IncomingHttpEvent`
is processed. Limits come from `stone.http.limits` (`0` disables a given check).

## Template

**TEvent**

The incoming HTTP event type.

## Template

**UResponse**

The outgoing HTTP response type.

## Constructors

### Constructor

```ts
new RequestLimitsMiddleware(blueprint): RequestLimitsMiddleware;
```

Create a RequestLimitsMiddleware.

#### Parameters

##### blueprint

The configuration blueprint.

###### blueprint

`IBlueprint`

#### Returns

`RequestLimitsMiddleware`

## Methods

### handle()

```ts
handle(event, next): Promise<OutgoingHttpResponse>;
```

Reject over-sized requests, otherwise continue the pipeline.

#### Parameters

##### event

[`IncomingHttpEvent`](../../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

The incoming HTTP event.

##### next

`NextMiddleware`\<[`IncomingHttpEvent`](../../../IncomingHttpEvent/classes/IncomingHttpEvent.md), [`OutgoingHttpResponse`](../../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)\>

The next middleware.

#### Returns

`Promise`\<[`OutgoingHttpResponse`](../../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)\>

The outgoing HTTP response.

#### Throws

431 when the header or cookie count exceeds the configured limit.
