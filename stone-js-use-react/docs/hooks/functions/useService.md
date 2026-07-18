# Function: useService()

```ts
function useService<TService>(key): TService;
```

Resolve any service from the container by its binding key (alias or class).

## Type Parameters

### TService

`TService` = `unknown`

The resolved service type.

## Parameters

### key

`any`

The binding key (e.g. `'router'`) or class constructor.

## Returns

`TService`

The resolved service.
