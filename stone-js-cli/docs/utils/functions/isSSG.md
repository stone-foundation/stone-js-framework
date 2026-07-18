# Function: isSSG()

```ts
function isSSG(blueprint, event): boolean;
```

Determines if the application is using static site generation (SSG).

SSG is opt-in via the `--ssg` flag or `stone.builder.rendering = 'ssg'`. It is never
inferred from file contents (it is a deliberate deployment choice).

## Parameters

### blueprint

`IBlueprint`

The blueprint object.

### event

`IncomingEvent`

The incoming event.

## Returns

`boolean`

True if the application is using static site generation.
