# Function: SetBrowserResponseMiddlewareMiddleware()

```ts
function SetBrowserResponseMiddlewareMiddleware(context, next): Promise<IBlueprint>;
```

Blueprint middleware to set BrowserResponseMiddleware for the Browser adapter.

The MetaBrowserResponseMiddleware is an adapter middleware and is useful
for handling outgoing responses and rendering them in the browser.

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The configuration context containing modules and blueprint.

### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next pipeline function to continue processing.

## Returns

`Promise`\<`IBlueprint`\>

The updated blueprint or a promise resolving to it.

## Example

```typescript
SetBrowserResponseMiddlewareMiddleware(context, next)
```
