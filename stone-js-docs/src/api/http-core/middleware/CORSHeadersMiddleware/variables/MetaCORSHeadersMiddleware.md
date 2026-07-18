# Variable: MetaCORSHeadersMiddleware

```ts
const MetaCORSHeadersMiddleware: object;
```

Represents the metadata for the CORSHeadersMiddleware.

## Type declaration

### module()

```ts
module: (context, next) => Promise<IBlueprint> = CORSHeadersMiddleware;
```

Blueprint Middleware for setting Cross-Origin Resource Sharing (CORS) headers in the HTTP response.

This middleware adds the necessary headers to the HTTP response
to allow clients from different origins to access the server's resources.

And also ensures that CORS headers are applied even when the middleware is not executed.

#### Parameters

##### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The configuration context containing modules and blueprint.

##### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next function in the pipeline.

#### Returns

`Promise`\<`IBlueprint`\>

The updated blueprint.

#### Example

```typescript
CORSHeadersMiddleware({ modules, blueprint }, next);
```

### priority

```ts
priority: number = 5;
```
