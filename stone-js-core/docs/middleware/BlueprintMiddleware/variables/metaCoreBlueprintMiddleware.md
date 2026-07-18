# Variable: metaCoreBlueprintMiddleware

```ts
const metaCoreBlueprintMiddleware: MetaPipe<BlueprintContext<IBlueprint, 
  | ClassType
  | PipeClass>, IBlueprint>[];
```

Array representing the core configuration middleware for the application.

This array contains the list of core middleware functions that are used to process the application
configuration in a specific order. Each middleware is associated with a priority that determines
the sequence in which it is executed. Middleware functions are used to build the application's blueprint,
set up the adapter, register providers, and handle other essential configuration steps.

## Example

```typescript
import { coreBlueprintMiddleware } from './BlueprintMiddleware';

// The middleware will be used to configure the application's settings before it starts.
```
