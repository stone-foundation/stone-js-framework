# Function: GenerateStaticSiteMiddleware()

```ts
function GenerateStaticSiteMiddleware(context, next): Promise<IBlueprint>;
```

Pre-render routes to static HTML (SSG).

SSG is SSR executed at build time: this starts the freshly-built SSR server, crawls the
routes, writes each response to `dist/<route>/index.html` via the SSG orchestrator, then
stops the server. Pages render identically whether pre-rendered or server-rendered.

The route set is zero-config: it is derived from the app's own scanned page routes
(`stone.builder.ssg.definitions`). Anything the user lists in `stone.builder.ssg.routes`
is merged in as an additive escape hatch (e.g. expanded parameterized routes, extras),
never a replacement. If nothing is known, it falls back to the root.

## Parameters

### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The console context.

### next

`NextPipe`\<[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md), `IBlueprint`\>

The next middleware.

## Returns

`Promise`\<`IBlueprint`\>

The blueprint.
