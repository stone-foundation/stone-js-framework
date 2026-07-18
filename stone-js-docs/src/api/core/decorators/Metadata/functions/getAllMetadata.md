# Function: getAllMetadata()

Get all metadata from a class.

## Param

The class to get all metadata from.

## Param

The default value to return if no metadata is found.

## Call Signature

```ts
function getAllMetadata<TClass, UReturn>(Class): undefined | UReturn;
```

Get all metadata from a class.

### Type Parameters

#### TClass

`TClass` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md)

#### UReturn

`UReturn` = `unknown`

### Parameters

#### Class

`TClass`

The class to get all metadata from.

### Returns

`undefined` \| `UReturn`

All metadata or the default value if no metadata exists.

### Param

The class to get all metadata from.

### Param

The default value to return if no metadata is found.

## Call Signature

```ts
function getAllMetadata<TClass, UReturn>(Class, fallback): UReturn;
```

Get all metadata from a class.

### Type Parameters

#### TClass

`TClass` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md)

#### UReturn

`UReturn` = `unknown`

### Parameters

#### Class

`TClass`

The class to get all metadata from.

#### fallback

`UReturn`

The default value to return if no metadata is found.

### Returns

`UReturn`

All metadata or the default value if no metadata exists.

### Param

The class to get all metadata from.

### Param

The default value to return if no metadata is found.
