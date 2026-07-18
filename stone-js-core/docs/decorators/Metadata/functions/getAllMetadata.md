# Function: getAllMetadata()

Get all metadata from a class.

## Param

**Class**

The class to get all metadata from.

## Param

**fallback**

The default value to return if no metadata is found.

## Call Signature

```ts
function getAllMetadata<TClass, UReturn>(Class): UReturn | undefined;
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

`UReturn` \| `undefined`

All metadata or the default value if no metadata exists.

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
