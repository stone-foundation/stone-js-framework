# Function: getMetadata()

Get the metadata value for a given key from a class.

## Param

**Class**

The class to get the metadata from.

## Param

**key**

The key of the metadata to retrieve.

## Param

**fallback**

The default value to return if the metadata key is not found.

## Call Signature

```ts
function getMetadata<TClass, UReturn>(Class, key): UReturn | undefined;
```

Get the metadata value for a given key from a class.

### Type Parameters

#### TClass

`TClass` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md)

#### UReturn

`UReturn` = `unknown`

### Parameters

#### Class

`TClass`

The class to get the metadata from.

#### key

`PropertyKey`

The key of the metadata to retrieve.

### Returns

`UReturn` \| `undefined`

The metadata value or the default value if the key does not exist.

## Call Signature

```ts
function getMetadata<TClass, UReturn>(
   Class, 
   key, 
   fallback): UReturn;
```

Get the metadata value for a given key from a class.

### Type Parameters

#### TClass

`TClass` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md)

#### UReturn

`UReturn` = `unknown`

### Parameters

#### Class

`TClass`

The class to get the metadata from.

#### key

`PropertyKey`

The key of the metadata to retrieve.

#### fallback

`UReturn`

The default value to return if the metadata key is not found.

### Returns

`UReturn`

The metadata value or the default value if the key does not exist.
