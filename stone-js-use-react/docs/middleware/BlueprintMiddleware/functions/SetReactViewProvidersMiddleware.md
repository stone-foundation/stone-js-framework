# Function: SetReactViewProvidersMiddleware()

```ts
function SetReactViewProvidersMiddleware(context, next): Promiseable<IBlueprint>;
```

Blueprint middleware to process and register view providers declared with `@ViewProvider`.

View providers wrap the application root (design-system theme, i18n, store, …). This
middleware discovers every `@ViewProvider`-decorated class among the build's modules and
appends it to `stone.useReact.providers` — the same key the imperative `defineViewProvider`
feeds — so declarative and imperative registration converge on one list that
`buildAppComponent` composes around the app (outermost-first by ascending `priority`).

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The configuration context containing modules and blueprint.

### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next pipeline function to continue processing.

## Returns

`Promiseable`\<`IBlueprint`\>

The updated blueprint or a promise resolving to it.

## Example

```typescript
SetReactViewProvidersMiddleware(context, next)
```
