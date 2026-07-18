# Variable: Stone()

```ts
const Stone: <T>(options) => ClassDecorator = Service;
```

Stone decorator to mark a class as a stone and automatically bind it to the container.

This decorator can be used to easily mark a class as injectable within the Stone.js framework,
allowing it to be managed by the service container.

Service decorator to mark a class as a service and automatically bind it to the container.

This decorator is useful for marking classes that should be treated as services by the Stone.js framework,
making them easily injectable and manageable by the service container.

## Type Parameters

### T

`T` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md) = [`ClassType`](../../../declarations/type-aliases/ClassType.md)

## Parameters

### options

`Partial`\<[`ServiceOptions`](../../../declarations/interfaces/ServiceOptions.md)\> = `{}`

The configuration options for the service, including singleton and alias settings.

## Returns

`ClassDecorator`

A decorator function to set metadata on the target class.

## Example

```typescript
@Service({ singleton: true, alias: 'MyService' })
class MyService {
  // Service class logic here.
}
```

## Param

The configuration options for the service.

## Returns

A function to set the class as a service.

## Example

```typescript
@Injectable({ singleton: true, alias: 'MyInjectableService' })
class MyInjectableService {
  // Service class logic here.
}
```
