---
"@stone-js/starters": patch
"@stone-js/http-core": patch
"@stone-js/core": patch
---

fix: CORS gets its two activation paths, and stops discarding the response it was meant to decorate

`@Cors()` and `corsBlueprint` are the new, and only, ways to enable CORS. Both install it on the two dimensions it actually needs, because a cross-origin failure can happen on either side of the kernel:

- **Kernel** (`HandleCorsMiddleware`): the normal path. Every response the kernel produces leaves with its CORS headers, and a preflight is answered outright with `preflightStop`.
- **Adapter** (`EnsureCorsHeadersHook`, on `onBuildingRawResponse`): the last resort. When a request dies before or around the kernel, no kernel middleware ever ran, and a response without `Access-Control-Allow-Origin` is not a status the browser can read: it is an opaque network error. This is the same reason the framework carries an error handler at both levels.

```ts
@Cors({ origin: ['https://app.example.com'] })
@StoneApp({ name: 'my-app' })
export class Application {}

// or, imperatively
export const Application = defineStoneApp(handler, { name: 'my-app' }, [corsBlueprint])
```

Nothing is allowed until you name an origin: with none configured, no `Access-Control-Allow-Origin` header is emitted at all, so enabling CORS never opens an application by itself.

**`EnsureCorsHeadersHook` was replacing successful responses.** It handed its CORS middleware a `next` that unconditionally built a fresh `OutgoingHttpResponse.create({ statusCode: 500 })`, so `context.outgoingResponse` became an empty 500 (`content: undefined`, `prepared: false`) on **every** request, including the ones that succeeded. The wire response survived only by luck: every adapter's `ServerResponseMiddleware` copies the real response into the raw builder before this hook runs, and the hook's `addIf` will not overwrite a status that is already there. Anything reading `context.outgoingResponse` afterwards, a later hook, `onTerminate`, or an adapter that builds its response at that point, saw the empty 500 instead of the answer. It now decorates the response that exists and synthesizes one only when there is none, which is the case it was written for.

**Both starters activate CORS again**, through the decorator and the blueprint respectively. They previously reached it through `defineBlueprintMiddleware(CORSHeadersMiddleware)`; `CORSHeadersMiddleware` is deprecated in favour of the two paths above, and is now the only thing that helper was used for in first-party code.

**`BlueprintBuilder` asserts the pipeline still produced a blueprint** and otherwise throws a `SetupError` naming the broken contract. A build-phase middleware runs once, before any event, and must return `await next(context)`; registering a per-event middleware as one is the usual way to break that, since both shapes are `handle(context, next)` and neither the types nor the runtime object to it. The assertion is a private method on the builder it protects.
