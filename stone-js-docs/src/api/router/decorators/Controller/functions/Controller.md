# Function: Controller()

```ts
function Controller(path, options?): ClassDecorator;
```

A class decorator for defining a controller with a common base path.
Configures the class as a singleton service.

## Parameters

### path

`string` = `'/'`

The base path for the controller's routes.

### options?

[`ControllerOptions`](../interfaces/ControllerOptions.md)

Optional configuration for the controller.

## Returns

`ClassDecorator`

A class decorator configured for routing and singleton service.

## Example

```typescript
@Controller('/users')
class UserController {
  // Controller logic
}
```
