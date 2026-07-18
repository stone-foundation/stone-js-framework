# Function: generateDeclarativeLazyPages()

```ts
function generateDeclarativeLazyPages(
   module, 
   path, 
   key): object;
```

Generates the declarative lazy pages.

## Parameters

### module

`ClassType`

The module to generate.

### path

`string`

The path to the module.

### key

`string`

The key to use for the module.

## Returns

`object`

The generated pages.

### adapterErrorPages

```ts
adapterErrorPages: Record<string, MetaAdapterErrorPage<unknown, unknown, unknown>>;
```

### definitions

```ts
definitions: PageRouteDefinition<IIncomingEvent, unknown>[];
```

### errorPages

```ts
errorPages: Record<string, MetaErrorPage<ReactIncomingEvent>>;
```

### layouts

```ts
layouts: Record<string, MetaPageLayout>;
```
