# Function: ConvertToVanillaMiddleware()

```ts
function ConvertToVanillaMiddleware(context, next): Promise<IBlueprint>;
```

Convert the scaffolded project to vanilla JavaScript when `typing === 'vanilla'`.

Stone.js is a TypeScript AND JavaScript framework: the templates are authored once in TS and
the JS variant is DERIVED (types stripped, stage-3 decorators preserved), so both the
declarative and imperative APIs are available 1:1 in TS and JS without a second template set.

## Parameters

### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

Input data to transform via middleware.

### next

`NextPipe`\<[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md), `IBlueprint`\>

Function to pass to the next middleware.

## Returns

`Promise`\<`IBlueprint`\>

A promise resolving with the context object.
