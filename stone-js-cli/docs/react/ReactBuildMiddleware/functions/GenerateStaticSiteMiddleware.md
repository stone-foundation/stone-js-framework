# Function: GenerateStaticSiteMiddleware()

```ts
function GenerateStaticSiteMiddleware(context, next): Promise<IBlueprint>;
```

Pre-render routes to static HTML (SSG).

SSG is SSR executed at build time: this starts the freshly-built SSR server, crawls the
configured routes (`stone.builder.ssg.routes`, defaulting to `/`), writes each response to
`dist/<route>/index.html` via the SSG orchestrator, then stops the server. Pages therefore
render identically whether pre-rendered or server-rendered.

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
