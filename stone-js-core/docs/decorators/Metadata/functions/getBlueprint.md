# Function: getBlueprint()

Get the blueprint value from a class.

## Param

**Class**

The class to get the blueprint from.

## Param

**fallback**

The default value to return if the blueprint key is not found.

## Call Signature

```ts
function getBlueprint<TClass, UReturn>(Class): UReturn | undefined;
```

Get the blueprint value from a class.

### Type Parameters

#### TClass

`TClass` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md)

#### UReturn

`UReturn` = [`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<[`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md), [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)\>

### Parameters

#### Class

`TClass`

The class to get the blueprint from.

### Returns

`UReturn` \| `undefined`

The blueprint value or the default value if the key does not exist.

## Call Signature

```ts
function getBlueprint<TClass, UReturn>(Class, fallback): UReturn;
```

Get the blueprint value from a class.

### Type Parameters

#### TClass

`TClass` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md)

#### UReturn

`UReturn` = [`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<[`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md), [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)\>

### Parameters

#### Class

`TClass`

The class to get the blueprint from.

#### fallback

`UReturn`

The default value to return if the blueprint key is not found.

### Returns

`UReturn`

The blueprint value or the default value if the key does not exist.
